import json
import os 
import requests 
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
        - Function to download attached image from FLCD App from API endpoint and code list 
    
    Args:
        - event: Contains input list url (code) paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list urls (Handling success)
    """
    try:
        result_files = {}
        payload = json.loads(event['body'])
        
        print(f'payload: {payload}')
        
        paths = [] 
        for item in payload:
            print(f'item: {item}')
            print(f'item["url"]: {item["url"]}')
            if item["url"] is not None: 
                paths.append(item["url"])
        
        print(f'paths: {paths}')
        
        # for path in paths: 
        __url = f"{os.environ['FLCD_ENV_ENPOINT_DOWLOAD_FILES']}/media/download/list"
        
        print(f'URL: {__url}')
        
        # 2. download the data behind the __url
        response = requests.post(__url, json=payload) 
        
        print(f'FLCD response data: {response}')
        
        if response.ok: 
            result_files["urls"] = (json.loads(response.content.decode("utf-8")))
                
        print(f'result_files: {result_files}')
        
        return successResponse(result_files)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
