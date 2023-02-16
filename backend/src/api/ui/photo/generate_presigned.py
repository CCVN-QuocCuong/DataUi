import json
import os 
import requests 
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
        - Function to generate presigned post url from S3 bucket.  
    
    Args:
        - event: Contains input list code of Photo paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and dict (any) (Handling success)
    """
    try:
        result_files = []
        payload = json.loads(event['body'])
        
        print(f'payload: {payload}')
        
        paths = [] 
        for item in payload:
            print(f'item: {item}')
            print(f'item["url"]: {item["url"]}')
            if item["url"] is not None:
                paths.append(item["url"])
        
        print(f'paths: {paths}')
        
        for path in paths: 
            __url = f"{os.environ['FLCD_ENV_ENPOINT_DOWLOAD_FILES']}/{path}"
            print(f'URL: {__url}')
            # 2. download the data behind the __url
            response = requests.get(__url) 
            
            if response.ok: 
                result_files.append(json.loads(response.content.decode("utf-8")))
                
        print(f'result_files: {result_files}')
        
        return successResponse(result_files)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))