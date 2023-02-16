from src.model.model_relation import ttcl_businesscriteria
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    Function to get data in table ttcl_businesscriteria with condition active is true.   
    Args:
      event: Default parameters of lambda function
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        response = []
        criterias = ttcl_businesscriteria.select().where((ttcl_businesscriteria.active==True))
        if len(criterias) > 0 :
            response = [{
                "businesscriteriacode": cta.businesscriteriacode,
                "criterianame": cta.criterianame,
                "defaultstyle": cta.style
            } for cta in criterias]
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))