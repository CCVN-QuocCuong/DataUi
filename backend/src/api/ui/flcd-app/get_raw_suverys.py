import json
import os
from queue import Empty
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES 
from src.shared.common import successResponse, errorResponse 
import boto3 
import io
from datetime import datetime

def handler(event, context):
    """
    Definition:
        - The scheduler configured in the environment variable FLCD_ENV_EVENT_BRIDGE_RATING (the value is minutes) 
        will trigger this lambda function once to call the lambda function of the FLCD Application and retrieve 
        all surveys created within the FLCD_ENV_EVENT_BRIDGE_RATING value range (minutes).  
        
    Args:
      - event: Default parameters of lambda function
      - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and message inform success or empty file (if not exists data) (Handling success)
    """
    try: 
        # Set input parameter for FLCD ENV 
        _input_param = { 
            "payload": {
                "interval": os.environ["FLCD_ENV_EVENT_BRIDGE_RATING"] 
            }
        }
    
        client = boto3.client('lambda')
        # Call the lambda function FLCD_ENV_LAMBDA_FUNCTION_NAME to perform get data surveys.
        response = client.invoke(
            FunctionName =  os.environ["FLCD_ENV_LAMBDA_FUNCTION_NAME"], 
            InvocationType = 'RequestResponse',
            Payload = json.dumps(_input_param)
        ) 
        
        # get response_suverys and check if not value, return process
        response_suverys = json.load(response['Payload'])  
        print('Response_suverys data: {0}'.format(response_suverys))
        if not response_suverys:
            return;

        # get response_body and check if not value, return process
        response_body = response_suverys['body']
        print('Response data: {0}'.format(response_body))
        if response_body is not None and response_body != '[]':  
            # write file json into S3
            s3_client = boto3.client('s3', region_name = os.environ["REGION"])
             
            # convert string value to StringIO object
            _string_io = io.StringIO(response_body)
            
            # Generate file name earch running  
            file_name = 'suverys_{0}.json'.format(datetime.now().strftime('%Y%m%d%H%M')) 
            
            # push object in to Bucket S3
            s3_client.put_object(Body=_string_io.read(), Bucket=S3_BUCKET_STORAGE_COC_FILES, Key='FLCD-ENV/json/{0}'.format(file_name)) 
            
            return successResponse('{"Message": "You process is successed."}')
        else:
            return successResponse('{"Message": "Response empty data."}')
    
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))