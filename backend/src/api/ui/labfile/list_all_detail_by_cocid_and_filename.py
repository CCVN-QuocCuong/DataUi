import json
import os
import boto3
from peewee import chunked
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfileheader, ttcl_labfiledetail
client = boto3.client('lambda')

def insert_header_to_db(header, details):
    """
    Definition:
        - Function to insert record into ttcl_labfileheader table
        
    Args: 
        - header (dict): header object input 
        - details (dict): details object input
        
    Returns:
        - header (dict): header object input 
        - details (dict): details object input 
    """
    
    if "fileid" in header:
        del header["fileid"]
    fileid = ttcl_labfileheader.create(**header)
    header["fileid"] = fileid.fileid
    for i in range(0, len(details)):
        details[i]["fileid"] = fileid.fileid
    if header["cocid"] == header["cocidmapping"]:
        for batch in chunked(details, 100):
            ttcl_labfiledetail.insert_many(batch).execute()
    return header, details

def handler(event, context):
    """
    Definition:
        - Function to insert record into ttcl_labfileheader and ttcl_labfiledetail tables
        
    Args: 
        - event (dict): content input paramaters
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and object(any) (Handling success)
    """
    try:
        funcname =  os.environ['HILL_LAB_TRANSFORM_ENV_LAMBDA_FUNCTION_NAME']
        coc_id = event['pathParameters']['id']
        filename = event['pathParameters']['filename']
        uploadby = event['pathParameters']['uploadby']
        response = client.invoke(
            FunctionName = funcname,
            InvocationType = 'RequestResponse',
            Payload = json.dumps({"cocid": coc_id,
                                  "filename": filename
                                  })
        )
        data = json.load(response['Payload'])
        response_body = json.loads(data['body'])
        header = response_body["header"][0]
        details = response_body["details"]
        header["filetype"] = "csv"
        header["uploadby"] = uploadby
        header, details = insert_header_to_db(header, details)
        response = {
            "header": [header],
            "details": details
        }
         
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Input file format is incorrect")
