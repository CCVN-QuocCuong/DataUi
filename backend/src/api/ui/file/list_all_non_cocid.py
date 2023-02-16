from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfileheader
    
def handler(event, context):
    """
    Definition:
    Function to get all file name of Non-COC  (with coc_id = '-1')
    Args:
      event: Default parameters of lambda function
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list ttcl_labfileheader dict (Handling success)
    """
    try:
        coc_id = '-1'
        response = []
        coc_files = ttcl_labfileheader.select().where(ttcl_labfileheader.cocid == coc_id).order_by(ttcl_labfileheader.fileid.desc())
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
             
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
