
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
import boto3
import base64
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfileheader
from playhouse.shortcuts import model_to_dict

def handler(event, context):
    """
    Definition:
    Function to dowload of noncoc files by parameter file_id 
    Args:
      event: Contains parameter file_id 
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and dict (any ) (Handling success)
    """
    try:
        response = {}
        params = event["pathParameters"]
        coc_id = "non_cocs"
        file_id = params["id"]
        
        # Get file header by file_id
        if coc_id != "" and file_id != "":
            __header = ttcl_labfileheader.select().where(
                ttcl_labfileheader.fileid == file_id).first() 
            
            # Convert ttcl_labfileheader model to dict
            header = model_to_dict(__header) 
            
            # Check if the lab name is 'Analytica' or another value
            if header is not None and header["labname"] == 'Analytica':
                s3_client = boto3.client("s3")
                s3_key = f"{coc_id}/{header['filename'].replace('.csv','').lower()}/{header['filename'].lower()}"
                print(f'Analytica - s3_key: {s3_key}')

                obj = s3_client.get_object(
                    Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=s3_key)
                file_content = obj["Body"]
                content_file = file_content.read()
                response = {
                    "fileid": file_id,
                    "filename": header['filename'],
                    "base64": base64.b64encode(content_file).decode(),
                    "contenttype": obj["ContentType"],
                    "lastmodified": obj["LastModified"]
                }
            else:
                s3_client = boto3.client("s3")
                s3_key = coc_id + '/' + header['filename']
                obj = s3_client.get_object(
                    Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=s3_key)
                file_content = obj["Body"]
                content_file = file_content.read()
                response = {
                    "fileid": file_id,
                    "filename": header['filename'],
                    "base64": base64.b64encode(content_file).decode(),
                    "contenttype": obj["ContentType"],
                    "lastmodified": obj["LastModified"]
                }

        return successResponse(response)

    except Exception as e:
        print(f'Upload file error: {e}')
        return errorResponse(400, "Exception: {}".format(e))
