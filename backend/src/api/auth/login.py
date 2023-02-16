import json
import os
import boto3 

from src.shared.common import errorResponse, successResponse, isEmail
from src.model.auth.login import LoginModel

def handler(event, context):
    """
    Definition:
    Authentication function to log in to the system.
    
    Args:
      event: Contains username, password information that the user submitted from the application 
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code not equals 200 (Handling failed login)
      - successResponse object if status code is equal 200 (Handling success)
    """
    
    data = json.loads(event['body'])
    LoginModel(**data) 

    try:
        username = data['username']
        password = data['password']
        
        # Define the client to interact with AWS Lambda
        client = boto3.client('lambda') 
        
        # Define the input parameters that will be passed  on to the child function
        input_params = {
            "type": "login",
            "payload": {
                "username": username,
                "password": password
            }
        }

        # Call the lambda function interact-with-cognito-lambda-function to perform the user password login.
        response = client.invoke(
            FunctionName = os.environ["LAMBDA_PREFIX"] + '-' + 'interact-with-cognito-lambda-function',
            InvocationType = 'RequestResponse',
            Payload = json.dumps(input_params)
        )
    
        # Get the result returned from the processing in the above step
        response_from_cognito = json.load(response['Payload'])
        print('responseFromCognito: {}'.format(response_from_cognito))
        print('type: {}'.format(type(response_from_cognito)))


        response_body = json.loads(response_from_cognito['body'])
        print('response_body: {}'.format(response_body))
        print('type: {}'.format(type(response_body)))
        
        # In case error handling occurs, the return result of statusCode <> 200 and raise the error returned to the user (status code = 400).
        if response_from_cognito["statusCode"] != 200:
            return errorResponse(400, "Your email/password was incorrect. Please double-check your email/password.")
        
        # In case of first login, it is necessary to set the need_reset = true attribute to force the user to change the password.
        res = {
                "need_reset": True,
                "user": {
                    "username": username,
                    "password": password
                }
            }
        
        # If the AuthenticationResult already has a value (not the first login), then set the "need_reset": False property to skip changing the password.
        if 'AuthenticationResult' in response_body: 
            result = response_body["AuthenticationResult"]
            print('result: {}'.format(result))
            if result:
                res = {
                    "need_reset": False,
                    "access_token": result["IdToken"],
                    "refresh_token": result["RefreshToken"],
                    "user": {
                        "username": username
                    }
                }

        return successResponse(res)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))