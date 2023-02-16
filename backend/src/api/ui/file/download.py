from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
import boto3
import base64 
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    Function to dowload of coc files by parameter coc_id and filename 
    Args:
      event: Contains parameters coc_id and filename 
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and dict (any ) (Handling success)
    """
    try:
        response = {}
        params = event["pathParameters"]
        coc_id = params["id"]
        filename = params["filename"]

        if coc_id != "" and filename != "": 
            s3_client = boto3.client("s3")
            
            # format s3 key file
            s3_key = coc_id + '/' + filename
            
            # get object content file
            obj = s3_client.get_object(
                Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=s3_key)
            file_content = obj["Body"]
            content_file = file_content.read()

            response = {
                "filename": filename,
                "base64": base64.b64encode(content_file).decode(),
                "contenttype": obj["ContentType"],
                "lastmodified": obj["LastModified"]
            }

        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
