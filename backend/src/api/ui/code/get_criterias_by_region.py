from src.model.model_relation import ttcl_businesscriteria, ttcl_businesscriteriaregion
from playhouse.shortcuts import model_to_dict
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    Function to get data in table ttcl_businesscriteriaregion by codename paramater.   
    Args:
      event: Contains paramaters codename information.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        response = []
        region_code = event['queryStringParameters']['codename']
        criterias_region = ttcl_businesscriteriaregion.select().where(ttcl_businesscriteriaregion.regioncode==region_code).order_by(ttcl_businesscriteriaregion.srt)
        if len(criterias_region) > 0:
            for cta_region in criterias_region:
                criterias = ttcl_businesscriteria.select() \
                    .where((ttcl_businesscriteria.active==True) 
                        & (ttcl_businesscriteria.businesscriteriacode==cta_region.businesscriteriacode))
                if len(criterias) > 0 :
                    for cta in criterias:
                        response.append({
                            "businesscriteriacode": cta.businesscriteriacode,
                            "criterianame": cta.criterianame,
                            "defaultstyle": cta_region.defaultstyle
                        })
        
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))