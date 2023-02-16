from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_coc
from playhouse.shortcuts import model_to_dict
from peewee import *

def handler(event, context):
    """
    Definition:
    The function to get all ttcl_coc records.
    
    Args:
      event: Default parameters of lambda function
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code equal 400 (Handling failed)
      - successResponse object if status code is equal 200 and list ttcl_coc object (json) data (Handling success)
    """
    try:
        response = [] 
        cocs = ttcl_coc.select() 
        if len(cocs) > 0 :
            # Convert model object ttcl_coc to dict (json)
            response = [model_to_dict(item) for item in cocs]
        return successResponse(response)
    except IntegrityError as e:
        return errorResponse(400, "BadRequest IntegrityError: {}".format(e))
    except InternalError as e:
        return errorResponse(400, "BadRequest InternalError: {}".format(e))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))