import json
from src.model.coc.coc_dto import CocModel
from src.shared.db_util import make_connection, fetch_data_with_paramaters
from src.model.coc.coc_dto import CocFilterModel 
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    The function to filter ttcl_coc according to the input parameters.
    
    Args:
      event: Contains input paramaters of CocFilterModel object.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list CocModel
    """
    try:
        response = []
        payload = json.loads(event['body'])
        coc_search_object = CocFilterModel(**payload)
         
        print(f'coc_search_object: {coc_search_object}')
        conn = make_connection()
        
        __paramaters = []
         
        query_filter = "select * from dbo.ttcl_coc WHERE 1 = 1"
        
        if coc_search_object.jobno != '': 
            coc_search_object.jobno = f"%{coc_search_object.jobno}%"
            query_filter += "  AND jobno ILIKE %s" 
            __paramaters.append(coc_search_object.jobno) 
            
        if coc_search_object.cocid != '': 
            coc_search_object.cocid = f"%{coc_search_object.cocid}%"
            query_filter += "  AND cocid::varchar(255) ILIKE %s" 
            __paramaters.append(coc_search_object.cocid) 
            
        if coc_search_object.objective != '': 
            coc_search_object.objective = f"%{coc_search_object.objective}%"
            query_filter += "  AND objective ILIKE %s" 
            __paramaters.append(coc_search_object.objective) 
             
        if coc_search_object.siteid != '': 
            coc_search_object.siteid = f"%{coc_search_object.siteid}%"
            query_filter += "  AND siteid ILIKE %s" 
            __paramaters.append(coc_search_object.siteid) 
            
        if coc_search_object.siteaddress != '': 
            coc_search_object.siteaddress = f"%{coc_search_object.siteaddress}%"
            query_filter += "  AND siteaddress ILIKE %s" 
            __paramaters.append(coc_search_object.siteaddress) 
            
        if coc_search_object.sampletype != '': 
            coc_search_object.sampletype = f"%{coc_search_object.sampletype}%"
            query_filter += "  AND sampletype ILIKE %s" 
            __paramaters.append(coc_search_object.sampletype) 
        
        query_filter += " ORDER BY created desc"
        
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        # close connection
        conn.close()
        
        __result_dict = json.loads(results)
        for coc_record in __result_dict:
            # Convert json data to an object of CocModel
            response.append(CocModel(**coc_record).__dict__)
         
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))