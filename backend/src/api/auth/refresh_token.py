import json
import os
import boto3 

from src.shared.common import errorResponse, successResponse, isEmail
from src.model.auth.login import RefreshTokenModel

def handler(event, context): 
    """
    Definition:
    When the system is using but the access_token expires, call the refresh_token function to get the access_token value (No need to re-login).
    
    Args:
      event: Contains the refresh_token information that was request from the application.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code not equals 200 (Handling failed login)
      - successResponse object if status code is equal 200 (Handling success)
    """
    try: 
        # Deserialization event['body'] json to RefreshTokenModel object
        data = json.loads(event['body'])
        payload = RefreshTokenModel(**data)  
    
        # Define the client to interact with AWS Lambda
        client = boto3.client('lambda')
        input_params = {
            "type": "refresh-token",
            "payload": {
                "refresh_token": payload.refresh_token
            }
        }

        # Call the lambda function interact-with-cognito-lambda-function to perform the user get access_token.
        response = client.invoke(
            FunctionName = os.environ["LAMBDA_PREFIX"] + '-' + 'interact-with-cognito-lambda-function',
            InvocationType = 'RequestResponse',
            Payload = json.dumps(input_params)
        )

        # Get the result returned from the processing in the above step
        response_from_cognito = json.load(response['Payload'])  
        response_body = json.loads(response_from_cognito['body']) 
        
        # In case error handling occurs, the return result of statusCode <> 200 and raise the error returned to the user (status code = 400).
        if response_from_cognito["statusCode"] != 200:
            return errorResponse(400, "Your email/password was incorrect. Please double-check your email/password.")
         
        if 'AuthenticationResult' in response_body: 
            result = response_body["AuthenticationResult"] 
            if result:
                res = {
                    "need_reset": False,
                    "access_token": result["IdToken"],
                    "refresh_token": payload.refresh_token
                }
                
        # In case of successful handling of statusCode = 200, a message is returned to the user. (statusCode = 200 and message)
        return successResponse(res)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e)) 