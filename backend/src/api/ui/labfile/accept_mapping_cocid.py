import json
from src.model.model_relation import ttcl_labfileheader
from src.model.sample.sample_dto import SampleModel
from peewee import chunked
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labfiledetail

def handle_lab_sample_name(name):
    """
    Definition:
        - Function to correct sampla name
        
    Args: 
        - name (str):Input sample name 
        
    Returns:
        - name: (str) Sample name
    """
    name = name.strip().replace("'", "")
    if "-" in name:
        for j in range(len(name) - 1, -1, -1):
            if name[j] == " ":
                name = name[:j]
                break
    return name

def insert_detail_to_db(details):
    """
    Definition:
        - Function to insert data to RDS
        
    Args: 
        - details (any): List input paramaters
        
    Returns:
        - message: (dict) message 
    """
    for batch in chunked(details, 100):
        ttcl_labfiledetail.insert_many(batch).execute()
    return {
        "msg": "Inserted complete!"
    }
    
def handler(event, context):
    """
    Definition:
        - Function to access mapping sample name in COC with sample name in lab csv file 
        
    Args: 
        - event (any): Contain ttcl_labfiledetail object
        - context: Default paramaters
        
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and object(any) (Handling success)
    """
    try:
        file_ids = []
        payload = json.loads(event['body'])
        details = payload["details"]
        print(f'details: {details}')
        __fileid = details[0]["fileid"]
        print(f'__fileid: {__fileid}')
        file_ids.append(int(__fileid))
        
        coc_headers = ttcl_labfileheader.select().where(ttcl_labfileheader.fileid.in_(file_ids))
        print(f'coc_headers : {coc_headers}')
        if len(coc_headers) > 0:
            cocid = coc_headers[0].cocid
            print(f'cocid: {cocid}')
            headers = ttcl_labfileheader.select().distinct(ttcl_labfileheader.fileid).where(ttcl_labfileheader.cocid == cocid)
            print(f'headers: {headers}')
            for header in headers:
                if int(header.fileid) not in file_ids:
                    file_ids.append(int(header.fileid))  
        
        print(f'file_ids: {file_ids}')
        
        rs = insert_detail_to_db(payload["details"])
        coc_details = ttcl_labfiledetail.select(ttcl_labfiledetail.labsamplename).distinct().where((ttcl_labfiledetail.fileid.in_(file_ids)))
        response = []
        if len(coc_details) > 0 :
            response = list(({
                "key": i + 1,
                "labsamplename": coc_details[i].labsamplename             
            }) for i in range(0, len(coc_details)))
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))