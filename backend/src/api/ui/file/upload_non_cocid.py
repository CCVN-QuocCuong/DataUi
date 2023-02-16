import boto3
from botocore.exceptions import ClientError
import json 
from src.model.coc.coc_dto import UploadFileModel
from src.shared.common import successResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES  
 
def create_presigned_post(bucket_name=None, object_name=None):
    
    """
    Definition:
    Function to generate a presigned S3 POST URL
    Args:
      bucket_name: Bucket name for save file upload
      object_name: Key path for file upload
    
    Returns:
      - url_presigned_post: (str). If the processing is successful, the return result is a url otherwise the result will be None
      
    """  
    s3_client = boto3.client('s3', region_name='ap-southeast-2')
    try:
        
        # Generate a presigned S3 POST URL
        url_presigned_post = s3_client.generate_presigned_post(Bucket=bucket_name,
                                                     Key=object_name,
                                                     ExpiresIn=3600)
        
        # The response contains the presigned URL and required fields
        return url_presigned_post
    
    except ClientError as e:
        print(f'Function create_presigned_post occussing error: {e}')
        return None
      
def handler(event, context): 
    """
    Definition:
    Function to upload file into S3 bucket by UploadFileModel paramater object
    Args:
      event: UploadFileModel paramater object
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list ttcl_labfileheader dict (Handling success)
    """
    payload = json.loads(event['body'])
    upload_obj = UploadFileModel(**payload)
    
    default_non_cocid_fd = "non_cocs" 
    s3_path = default_non_cocid_fd + '/' + upload_obj.name  
    
    # get url presigned post response
    response = create_presigned_post(S3_BUCKET_STORAGE_COC_FILES, s3_path)
        
    return successResponse(response)
 
 