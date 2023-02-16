import json
import os
import boto3 

from src.shared.common import errorResponse, successResponse, isEmail
from src.model.auth.login import ResetPasswordModel

def handler(event, context):
    """
    Definition:
    Function to change the password the first time the user logs in.
    
    Args:
      event: Contains username, old password and new password information that the user submitted from the application 
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code not equals 200
      - successResponse object if status code is equal 200
    """
    data = json.loads(event['body'])
    payload = ResetPasswordModel(**data) 

    try:
        # Define the input parameters that will be passed  on to the child function
        client = boto3.client('lambda')
        _input_params = {
            "type": "change-password",
            "payload": {
                "username": payload.username,
                "old_password": payload.old_password,
                "new_password": payload.new_password
            }
        }
    
        # Call the lambda function interact-with-cognito-lambda-function to perform the user password change.
        response = client.invoke(
            FunctionName = os.environ["LAMBDA_PREFIX"] + '-' + 'interact-with-cognito-lambda-function',
            InvocationType = 'RequestResponse',
            Payload = json.dumps(_input_params)
        )

        # Get the result returned from the processing in the above step
        response_from_cognito = json.load(response['Payload']) 
        response_body = json.loads(response_from_cognito['body'])
        
        print('response_body: {}'.format(response_body))
        print('type: {}'.format(type(response_body)))
       
        # In case error handling occurs, the return result of statusCode <> 200 and raise the error returned to the user (status code = 400).
        if response_from_cognito["statusCode"] != 200:
            print("BadRequest: {}".format(response_body))
            return errorResponse(400, "Your current password was incorrect. Please double-check your current password.")
        
        # In case of successful handling of statusCode = 200, a message is returned to the user. (statusCode = 200 and message)
        res = {
                "msg": "Password has been changed successfully",
                "user": {
                    "username": payload.username
                }
            }

        return successResponse(res)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))