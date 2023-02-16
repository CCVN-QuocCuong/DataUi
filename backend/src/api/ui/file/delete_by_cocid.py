import boto3 
from src.shared.common import successResponse, errorResponse
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
from src.model.model_relation import ttcl_labfileheader, ttcl_labfiledetail, ttcl_labsample_mapping

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
        coc_id = params["id"]
        s3 = boto3.resource('s3')
        prefix = coc_id + '/'
        filename = params["filename"].replace("%20", " ")
        
        # Check filename = all or not ? If not, just delete that file. Otherwise delete all files related to coc_id
        if filename != "all":
            s3_key_will_delete = prefix + filename
            print(s3_key_will_delete)
            s3.Object(S3_BUCKET_STORAGE_COC_FILES, s3_key_will_delete).delete()
            
            header = ttcl_labfileheader.select().where(ttcl_labfileheader.cocid == coc_id, ttcl_labfileheader.filename == filename).first()
            
            if header is not None and header.fileid is not None:
                print('header.fileid: {header.fileid}') 
                details =  ttcl_labfiledetail.select(ttcl_labfiledetail.labsamplename).where(ttcl_labfiledetail.fileid == header.fileid)
                
                print(f'details: {details}')
                samplenames = []
                if details is not None and len(details) > 0:
                    for item in details:
                        samplenames.append(item.labsamplename)
                    
                    print(f'samplenames: {samplenames}')
                    
                    # delete data for ttcl_labsample_mapping
                    ttcl_labsample_mapping.delete().where(ttcl_labsample_mapping.cocid == coc_id, ttcl_labsample_mapping.labsamplename << samplenames).execute() 
                
                # delete data for ttcl_labfiledetail
                ttcl_labfiledetail.delete().where(ttcl_labfiledetail.fileid == header.fileid).execute()
                
                # delete data for table ttcl_labfileheader
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
            
            # delete data for ttcl_labsample_mapping
            ttcl_labsample_mapping.delete().where(ttcl_labsample_mapping.cocid == coc_id).execute()
            
            # delete data for ttcl_labfiledetail
            ttcl_labfiledetail.delete().where(ttcl_labfiledetail.fileid << hds).execute()
            
            # delete data for table ttcl_labfileheader
            ttcl_labfileheader.delete().where(ttcl_labfileheader.cocid == coc_id).execute()
            
            response = {}
        
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
