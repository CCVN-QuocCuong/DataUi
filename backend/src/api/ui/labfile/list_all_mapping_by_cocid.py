import json
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labsample_mapping
    
def handler(event, context):
    """
    Definition:
        - Function to list all ttcl_labsample_mapping from database by cocid
        
    Args: 
        - event (dict): Contain coc_id paramater
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        coc_id = event['pathParameters']['id']
        response = []
        coc_mappings = ttcl_labsample_mapping.select().where(ttcl_labsample_mapping.cocid == coc_id)
        if len(coc_mappings) > 0:
            response= [{
                "labsamplename": cta.labsamplename,
                "barcode": cta.barcode,
                "cocid": cta.cocid,
            } for cta in coc_mappings]
        print(response)
        return successResponse(response)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
