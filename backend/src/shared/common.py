import boto3
import json
import os
from datetime import date, datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

S3_BUCKET_STORAGE_COC_FILES = os.environ["DATAUI_FILES_STORAGE"]

def healthcheck():
    return 'ok'

def getHeaders():
    """
    Definition:
        - The function get header default of API gateway
        
    Args:
      - None
      
    Returns:
      - dict
    """
    return {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*'
        }

def errorResponse(code, msg):
    """
    Definition:
        - The function handle error Response from API Gateway
        
    Args:
      - code: Paramater statusCode response
      - msg: Paramater code response
      
    Returns:
      - dict object
    """
    return {
            'statusCode': code,
            "headers": getHeaders(),
            'body': json.dumps({
                "success": False,
                "code": msg
            }, default=handle_decimal_type)
        }


def json_serial(obj):
    """
    Definition:
        - The function handle JSON serializer for objects not serializable by default json code"
        
    Args:
      - code: Paramater statusCode response
      - msg: Paramater code response
      
    Returns:
      - dict object
    """ 

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError("Type %s not serializable" % type(obj))


def successResponse(data):
    """
    Definition:
        - The function handle success response from API Gateway
        
    Args:
      - code: Paramater statusCode response
      - msg: Paramater code response
      
    Returns:
      - dict object
    """
    return {
        'statusCode': 200,
        "headers": getHeaders(),
        'body': json.dumps(data, default=json_serial)
    }

def handle_decimal_type(obj):
    """
    Definition:
        - The function handle decimal type
        
    Args:
      - obj: Paramater input
      
    Returns:
      - decimal value
    """
    
    if isinstance(obj, Decimal):
        if float(obj).is_integer():
            return int(obj)
        else:
            return float(obj)
    raise TypeError


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
    secret_name = os.environ["SECRET_NAME"]  #"dataui-dev-aurora-secrets-manager"
    region_name = os.environ["REGION"]

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
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            __valuesecret = json.loads(secret)
            return __valuesecret
    except ClientError as e:
      print(f'get_secret error: {e}')
      raise e

def isEmail(email):
    """
    Definition:
      - Function to check string input is email
    
    Args:
      - email: (str) input
    
    Returns:
      - boolean: True/False 
    """
    return "@" in email