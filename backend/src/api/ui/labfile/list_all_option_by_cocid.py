import json
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import *

def handle_lab_sample_name(name):
    """
    Definition:
        - Function to clean sample name
        
    Args: 
        - name (str): Sample name 
        
    Returns: 
        - name: (str) value name after clean
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
        - Function to list all ttcl_labfiledetail from database by cocid
        
    Args: 
        - event (dict): Contain coc_id paramater
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    
    try:
        coc_id = event['pathParameters']['id']
        response = []
        coc_headers = ttcl_labfileheader.select().where((ttcl_labfileheader.cocid == coc_id))
        if len(coc_headers) > 0:
            file_ids = []
            for header in coc_headers:
                file_ids.append(header.fileid) 
            coc_details = ttcl_labfiledetail.select(ttcl_labfiledetail.labsamplename).distinct().where(ttcl_labfiledetail.fileid << file_ids)
            if len(coc_details) > 0 : 
                response = list(({
                    "key": i + 1,
                    "labsamplename": coc_details[i].labsamplename            
                }) for i in range(0, len(coc_details)))
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
