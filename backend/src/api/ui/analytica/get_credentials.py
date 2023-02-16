# Use this code snippet in your app.
# If you need more information about configurations
# or implementing the sample code, visit the AWS docs:
# https://aws.amazon.com/developer/language/python/

import os
import boto3
from botocore.exceptions import ClientError
import json

def get_secret():
    """
    Definition:
    Function to get the value of username and password of a SECRET_NAME
    
    Args:
      None
    
    Returns:
      - username: str 
      - password: str
    """
    
    secret_name = os.environ['SECRET_NAME']
    region_name = "ap-southeast-2"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        print(e)
        raise e

    # Decrypts secret using the associated KMS key.
    secret = get_secret_value_response['SecretString']
    
    # return value username and password
    return json.loads(secret)["username"], json.loads(secret)["password"]