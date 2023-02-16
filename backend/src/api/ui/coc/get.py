import json
from random import sample
from src.api.ui.coc.coc_common import get_samples 
from src.model.model_relation import ttcl_coc, ttcl_cocdetails
from src.shared.common import successResponse, errorResponse
from playhouse.shortcuts import model_to_dict
from peewee import *

def handler(event, context):
    """
    Definition:
    The function to get ttcl_coc from paramater coc_id.
    
    Args:
      event: Contains input paramaters of coc_id.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code equal 400 (Handling failed)
      - successResponse object if status code is equal 200 and coc_detail dict (json) data (Handling success)
    """
    try:
        coc_id = event['pathParameters']['id']
        print(coc_id)
        
        # Get coc_detail object by coc_id
        coc_detail = ttcl_coc.select().where(ttcl_coc.cocid==int(coc_id)) 
        print(f'coc_detail: {coc_detail}')
        
        # get sample details assigned to CoC
        samples = []
        cocdetails = ttcl_cocdetails.select().where(ttcl_cocdetails.cocid==int(coc_id)) 
        print(f'cocdetails: {cocdetails}')
        
        if len(cocdetails) > 0 :
            samplebarcodeids = []
            for item in cocdetails: 
                if item.samplebarcodeid not in samplebarcodeids:
                    samplebarcodeids.append(item.samplebarcodeid) 
            
            # get samples by samplebarcodeids
            samples = get_samples(samplebarcodeids=samplebarcodeids)
            print(f'samples data: {samples}') 
            
        if coc_detail is not None and len(coc_detail) > 0:
            # convert model coc_detail to dict (json)
            reponse = model_to_dict(coc_detail[0])
            reponse['samples'] = samples
        else:
            reponse = {}
        
        print(f'reponse: {reponse}') 
        
        return successResponse(reponse)
    except IntegrityError as e:
        return errorResponse(400, "BadRequest IntegrityError: {}".format(e))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))