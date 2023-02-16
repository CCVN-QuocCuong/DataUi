from src.shared.common import successResponse, errorResponse
from src.model.model_relation import ttcl_coc_versions
from peewee import *

def handler(event, context):
    """
    Definition:
    Function to get list of ttcl_coc_versions from paramater coc_id.
    
    Args:
      event: Contains input paramaters of coc_id.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code equal 400 (Handling failed)
      - successResponse object if status code is equal 200 and list ttcl_coc_versions data (Handling success)
    """
    try:
        response = []
        # Get paramater coc_id
        coc_id = event['pathParameters']['id']
        print(coc_id)
        
        # get list of ttcl_coc_versions from paramater coc_id
        coc_versions = ttcl_coc_versions.select() \
            .where(ttcl_coc_versions.cocid==int(coc_id)) \
            .order_by(ttcl_coc_versions.created)
        
        # If has data. Convert object list coc_versions to list dict (response)
        if len(coc_versions) > 0:
            for item in coc_versions:
                response.append({
                    "version": item.version,
                    "note": item.note,
                    "friendlyid": item.friendlyid,
                    "created": item.created
                })
                
        return successResponse(response)
    except IntegrityError as e:
        return errorResponse(400, "BadRequest IntegrityError: {}".format(e))
    except InternalError as e:
        return errorResponse(400, "BadRequest InternalError: {}".format(e))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))