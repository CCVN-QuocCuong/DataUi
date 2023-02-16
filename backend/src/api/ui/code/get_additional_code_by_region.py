from src.model.model_relation import ttcl_businesscriteriatest_htn_complex, ttcl_businesscriteriatest_chcbg_complex
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    Function to get data by region_code paramater.  
        - If region_code = "CHC" then get data from table ttcl_businesscriteriatest_chcbg_complex
        - Elif region_code == "HTN" then get data from table ttcl_businesscriteriatest_htn_complex
        
    Args:
      event: Contains input codename paramater.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        response = []
        region_code = event['queryStringParameters']['codename']
        # for region Canterbury
        if region_code == "CHC": 
            chcbg_region_codes = ttcl_businesscriteriatest_chcbg_complex.select().distinct(ttcl_businesscriteriatest_chcbg_complex.region).order_by(ttcl_businesscriteriatest_chcbg_complex.region)
            if len(chcbg_region_codes) > 0 :
                for code in chcbg_region_codes:
                    response.append({
                        "codetypecode": "CHC_region",
                        "codename": code.region,
                        "description": code.region
                    })
                for region_code in chcbg_region_codes:
                    chcbg_codes = ttcl_businesscriteriatest_chcbg_complex.select().distinct(ttcl_businesscriteriatest_chcbg_complex.soiltype).where(ttcl_businesscriteriatest_chcbg_complex.region==region_code.region).order_by(ttcl_businesscriteriatest_chcbg_complex.soiltype)
                    if len(chcbg_codes) > 0 :
                        for code in chcbg_codes:
                            response.append({
                                "codetypecode": "CHC_soiltype",
                                "codename": code.soiltype,
                                "description": code.soiltype,
                                "region": code.region
                            })
        # for region Waikato
        if region_code == "HTN":
            htn_codes = ttcl_businesscriteriatest_htn_complex.select().distinct(ttcl_businesscriteriatest_htn_complex.sgvsoiltype)
            if len(htn_codes) > 0 :
                for code in htn_codes:
                    response.append({
                        "codetypecode": "HTN_sgvsoiltype",
                        "codename": code.sgvsoiltype,
                        "description": code.sgvsoiltype
                    })
            htn_sgvsoilage_codes = ttcl_businesscriteriatest_htn_complex.select().distinct(ttcl_businesscriteriatest_htn_complex.sgvsoilage)
            if len(htn_sgvsoilage_codes) > 0 :
                for code in htn_sgvsoilage_codes:
                    response.append({
                        "codetypecode": "HTN_sgvsoilage",
                        "codename": code.sgvsoilage,
                        "description": code.sgvsoilage
                    })
        
        
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))