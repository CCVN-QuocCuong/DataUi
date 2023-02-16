import json
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfiledetail

def handle_lab_sample_name(name):
    """
    Definition:
        - Function to clean special characters and get lab_sample_name. 
    
    Args:
        - name: (str) input lab_sample_name 
    
    Returns:
      - name: (str) only lab_sample_name
    """
    name = name.strip().replace("'", "")
    if "-" in name:
        for j in range(len(name) - 1, -1, -1):
            if name[j] == " ":
                name = name[:j]
                break
    return name        

def handler(event, context):
    """
    Definition:
        - Function to get ttcl_sampleform by fileid. 
    
    Args:
        - event: Contains input fileid paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and response list (any) object (Handling success)
    """
    try:
        fileid = event['pathParameters']['id']
        response = []
        coc_details = ttcl_labfiledetail.select(ttcl_labfiledetail.labsamplename).distinct().where((ttcl_labfiledetail.fileid == fileid))
        if len(coc_details) > 0 :
            response = list(({
                "key": i + 1,
                "labsamplename": coc_details[i].labsamplename, 
            }) for i in range(0, len(coc_details)))
            
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
