from datetime import datetime
import logging
import boto3
from botocore.exceptions import ClientError
import json

from src.model.coc.coc_dto import UploadFileModel
from src.shared.common import successResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES 
from src.model.model_relation import ttcl_labfileheader

def create_presigned_post(bucket_name=None, object_name=None):
    
    """
    Definition:
    Function to generate a presigned S3 POST URL
    Args:
      bucket_name: Bucket name for save file upload
      object_name: Key path for file upload
    
    Returns:
      -  url_presigned_post: (str). If the processing is successful, the return result is a url otherwise the result will be None
      
    """  
    
    # Generate a presigned S3 POST URL
    s3_client = boto3.client('s3', region_name='ap-southeast-2')
    try:
        response = s3_client.generate_presigned_post(Bucket=bucket_name,
                                                     Key=object_name,
                                                     ExpiresIn=3600)
    except ClientError as e:
        return None
    # The response contains the presigned URL and required fields
    return response

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
    
    if upload_obj.cocid != 0: 
        s3_path = str(upload_obj.cocid) + '/' + upload_obj.name 
        content_type= upload_obj.contenttype
        response = create_presigned_post(S3_BUCKET_STORAGE_COC_FILES, s3_path)
        if content_type != "text/csv":
            header = {
                "filename": upload_obj.name,
                "filetype": content_type,
                "cocid": str(upload_obj.cocid),
                "uploadby": upload_obj.uploadby,
                "createdon":  datetime.utcnow().replace(microsecond=0),
                "dateregistered":  datetime.utcnow().replace(microsecond=0),
            } 
            
            ttcl_labfileheader.create(**header)
    else:
        response = {
            "msg": "Upload failed! Please correct cocid"
        }
        
    return successResponse(response)
 