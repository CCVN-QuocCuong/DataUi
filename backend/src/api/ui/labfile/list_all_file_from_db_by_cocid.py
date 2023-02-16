import json
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfileheader
    
def handler(event, context):
    """
    Definition:
        - Function to list all file from database by cocid
        
    Args: 
        - event (dict): content input coc_id paramater
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        coc_id = event['pathParameters']['id']
        response = []
        coc_files = ttcl_labfileheader.select().where(ttcl_labfileheader.cocid == coc_id)
        if len(coc_files) > 0:
            response= [{
                "fileid": cta.fileid,
                "filename": cta.filename,
                "fileurl": cta.fileurl,
                "createdon": cta.createdon,
                "labname": cta.labname,
                "labjobnumber": cta.labjobnumber,
                "cocid": cta.cocid,
                "ttjobno": cta.ttjobno,
                "dateregistered": cta.dateregistered,
                "status": cta.ttjobno,
                "labresultid": cta.labresultid,
                "uploadby": cta.uploadby,
                "filetype": cta.filetype
            } for cta in coc_files]
        print(response)
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
