import json

import cognitojwt
from src.shared.common import errorResponse, successResponse
import botocore
import os
import boto3


def handler(event, context):
    """
    Definition:
        - Function invoke lambda get cognito user
    
    Args:
        - event: Contain type of request type nd the payload contains the parameters to be passed to manipulate the cognito (username, password...)
            - Value of request_type paramater is:
                - login:
                - first-time-reset-password:
                - forgot-password
                - confirm-forgot-password
                - change-password
                - add-user
                - refresh-token
                - get_user_from_token
        - context: Default value of parmaters
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response dict  (Handling success)
    """
    try:
        request_type = event["type"]
        print('request_type:')
        print(request_type)
        payload = event["payload"]
        client = boto3.client('cognito-idp', os.environ["REGION"])

        response = {}

        if request_type == "login":
            print(f'payload: {payload}')
            response = client.admin_initiate_auth(
                UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": payload["username"],
                    "PASSWORD": payload["password"],
                }
            )

        elif request_type == "first-time-reset-password":
            response = client.admin_initiate_auth(
                UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": payload["username"],
                    "PASSWORD": payload["password"],
                }
            )
            response = client.admin_respond_to_auth_challenge(
                UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                Session=response["Session"],
                ChallengeResponses={
                    "NEW_PASSWORD": payload["new_password"],
                    "USERNAME": payload["username"]
                },
                ChallengeName='NEW_PASSWORD_REQUIRED'
            )
        elif request_type == "forgot-password":
            response = client.forgot_password(
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                Username=payload["email"],
            )
        elif request_type == "confirm-forgot-password":
            response = client.confirm_forgot_password(
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                Username=payload["email"],
                ConfirmationCode=payload["code"],
                Password=payload["password"]
            )

        elif request_type == "change-password":
            print(type)
            print(payload)
            response = client.admin_initiate_auth(
                UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": payload["username"],
                    "PASSWORD": payload["old_password"],
                }
            )
            print(response)
            print('response')
            if response.get("ChallengeName") == 'NEW_PASSWORD_REQUIRED':
                response = client.admin_respond_to_auth_challenge(
                    UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                    ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                    Session=response["Session"],
                    ChallengeResponses={
                        "NEW_PASSWORD": payload["new_password"],
                        "USERNAME": payload["username"]
                    },
                    ChallengeName='NEW_PASSWORD_REQUIRED'
                )
            else:
                result = response.get("AuthenticationResult")
                response = client.change_password(
                    PreviousPassword=payload["old_password"],
                    ProposedPassword=payload["new_password"],
                    AccessToken=result["AccessToken"]
                )
            print(response)
            print('response')

        elif request_type == "add-user":
            response = client.admin_create_user(
                UserPoolId=os.environ["COGNITO_USER_POOL_ID"],
                Username=payload["email"],
                UserAttributes=payload["attributes"],
                ValidationData=payload["attributes"],
                TemporaryPassword=payload["password"],
                ForceAliasCreation=False | True,
                DesiredDeliveryMediums=['EMAIL']
            )

        elif request_type == "refresh-token":
            refresh_token = payload["refresh_token"]
            response = client.initiate_auth(
                ClientId=os.environ["COGNITO_USER_CLIENT_ID"],
                AuthFlow="REFRESH_TOKEN_AUTH",
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token
                }
            )

        elif request_type == 'get_user_from_token': 
            response = cognitojwt.decode(
                payload["access_token"], os.environ["REGION"], os.environ["COGNITO_USER_POOL_ID"]
            )

        return successResponse(response)

    except botocore.exceptions.ClientError as error:
        return errorResponse(400, error.response['Error']['Code'])
    except Exception as e:
        return errorResponse(502, f'Exception: {e}')
