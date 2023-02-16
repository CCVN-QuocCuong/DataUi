import json
import os
import cognitojwt
import boto3 
    
def invoke_lambda_get_cognito_user(type, access_token):
    """
    Definition:
        - Function invoke lambda get cognito user
    
    Args:
        - type: (str) Specify the request type to call into the lambda cognito
        - access_token: (str) Token to authenticate to cognito
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response dict  (Handling success)
    """
    client = boto3.client("lambda")
    params = {
            "type": type,
            "payload":  {
                "access_token": access_token
            }
        }
      
    response = client.invoke(
        FunctionName = os.environ["LAMBDA_PREFIX"] + '-' + 'interact-with-cognito-lambda-function',
        InvocationType = 'RequestResponse',
        Payload = json.dumps(params)
    )
    response = json.loads(response['Payload'].read())
    response["body"] = json.loads(response["body"])
    if (response["statusCode"] != 200):
        return response
    return response["body"]


def get_current_user_login(event):
    """
    Definition:
        - Function to get user name of current user login system
    
    Args:
        - event: Default paramater of lambda function.  
    
    Returns:
        - current_user_name: (str) Value of user name that logged into the system
    """
    headers = event['headers']
    access_token = headers.get("Authorization")[7:]
    print(f'access_token: {access_token}')
    cognito_user = invoke_lambda_get_cognito_user(type="get_user_from_token", access_token=access_token)

    print(f'cognito_user: {cognito_user}')
    
    if not cognito_user:
        return ""
    
    # get current user login
    current_user_name = cognito_user["cognito:username"] 
    
    return current_user_name
    
    