import json
from datetime import datetime
from src.model.sample.sample_dto import SampleModel
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_labsample_mapping

def handler(event, context):
    """
    Definition:
        - Function to update lab sample mapping
        
    Args: 
        - event (dict): Contain coc_id paramater
        - context: Default paramater
        
    Returns: 
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        payload = json.loads(event['body'])
        coc_id = event['pathParameters']['id']
        rs = []
        
        # delete old mapping data for sample 
        __effect_records = ttcl_labsample_mapping.delete().where(ttcl_labsample_mapping.cocid == coc_id).execute()
        print(f'__effect_records delete old record mapping: {__effect_records}')
        
        for d in payload["list_sample"]:
            rs.append(ttcl_labsample_mapping
            .insert(cocid = coc_id, labsamplename=d["labsamplename"], barcode= d["barcode"])
            .on_conflict(
                conflict_target=(ttcl_labsample_mapping.barcode,ttcl_labsample_mapping.cocid,),
                update={ttcl_labsample_mapping.labsamplename: d["labsamplename"]})
            .execute())
        return successResponse(rs)
    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
