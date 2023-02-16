from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_code
from playhouse.shortcuts import model_to_dict
from peewee import *

def handler(event, context):
    """
    Definition:
    Function to get data in table ttcl_code with condition isactive is true.   
    Args:
      event: Default parameters of lambda function
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        response = []
        codes = ttcl_code.select().where(ttcl_code.isactive == True).order_by(ttcl_code.codetypecode, ttcl_code.codename)
        if len(codes) > 0 :
            response = [model_to_dict(item) for item in codes]
        return successResponse(response)
    except IntegrityError as e:
        return errorResponse(400, "BadRequest IntegrityError: {}".format(e))
    except InternalError as e:
        return errorResponse(400, "BadRequest InternalError: {}".format(e))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))