import boto3
from src.shared.common import successResponse, errorResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES

def handler(event, context):
    """
    Definition:
    Function to get all file name by parameter coc_id 
    Args:
      event: Contains parameters coc_id
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list str filename (Handling success)
    """
    try:
        coc_id = event['pathParameters']['id']
        print(coc_id)
        prefix = coc_id + '/'
        response = []
            
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(S3_BUCKET_STORAGE_COC_FILES)
        
        # filter all objects in Bucket by prefix (in folder name coc_id)
        for obj in bucket.objects.filter(Prefix=prefix):
            filename = obj.key.replace(prefix, '')
            if filename != '':
                response.append({"name": filename})
        
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
