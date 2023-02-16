import boto3
from src.shared.common import successResponse, errorResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
from src.model.model_relation import ttcl_labfileheader, ttcl_labfiledetail

def handler(event, context):
    """
    Definition:
        - Function to reject mapping by cocid
        
    Args: 
        - event (dict): Contain file_id paramater
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        response = {}
        params = event["pathParameters"]
        file_id = params["id"]
        header = ttcl_labfileheader.get(ttcl_labfileheader.fileid == file_id)
        s3 = boto3.resource('s3')
        s3_key_will_delete = header.cocid + '/' + header.filename
        s3.Object(S3_BUCKET_STORAGE_COC_FILES, s3_key_will_delete).delete()
        ttcl_labfiledetail.delete().where(ttcl_labfiledetail.fileid == file_id).execute()
        header.delete_instance()
        response = {
            "msg": "Deleted file {}".format(header.filename)
        }
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
