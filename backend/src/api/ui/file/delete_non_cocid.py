import boto3
from src.shared.common import successResponse, errorResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
from src.model.model_relation import ttcl_labfileheader, ttcl_labfiledetail

def handler(event, context):
    """
    Definition:
    Function to delete files by parameter coc_id and file name  
    Args:
      event: Contains parameter coc_id and file name to delete
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and empty dict (Handling success)
    """
    try:
        response = {}
        params = event["pathParameters"]
        coc_id = ''
        s3 = boto3.resource('s3')
        prefix = "non_cocs" + '/'
        file_id = params["id"]
        
        # Check file_id = all or not ? If not, just delete that file. Otherwise delete all files related to file_id
        if file_id != "all":
            header = ttcl_labfileheader.get(ttcl_labfileheader.fileid == file_id)
            s3_key_will_delete = prefix + header.filename
            print(s3_key_will_delete)
            s3.Object(S3_BUCKET_STORAGE_COC_FILES, s3_key_will_delete).delete()
            ttcl_labfiledetail.delete().where(ttcl_labfiledetail.fileid == header.fileid).execute()
            header.delete_instance()
            response = {}
        else:
            bucket = s3.Bucket(S3_BUCKET_STORAGE_COC_FILES)
            for obj in bucket.objects.filter(Prefix=prefix):
                s3.Object(S3_BUCKET_STORAGE_COC_FILES, obj.key).delete()
            coc_headers = ttcl_labfileheader.select(ttcl_labfileheader.fileid).where(ttcl_labfileheader.cocid == coc_id)
            hds = []
            for header in coc_headers:
               hds.append(header.fileid)
            ttcl_labfiledetail.delete().where(ttcl_labfiledetail.fileid << hds).execute()
            ttcl_labfileheader.delete().where(ttcl_labfileheader.cocid == coc_id).execute()
            response = {
                "msg": "Deleted all files in cocid: {}".format(coc_id)
            }
        
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
