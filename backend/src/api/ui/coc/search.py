import json 
from src.model.coc.coc_dto import CocModel
from src.shared.db_util import make_connection, fetch_data_with_paramaters, fetch_counter_data_with_paramaters
from src.model.coc.coc_dto import CocFilterModel 
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
    The function to filter data from input list paramaters.
    
    Args:
      event: Paramater contain object CocFilterModel data
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code equal 400 (Handling failed)
      - successResponse object if status code is equal 200 and list CocModel object (json) data (Handling success)
    """
    try:
        response = {}
        data = []
        payload = json.loads(event['body'])
        coc_search_object = CocFilterModel(**payload) 
        
        print(f'coc_search_object: {coc_search_object}')
        
        # Initialize connect to Postgres database
        conn = make_connection()
        
        __paramaters = []
        
        # Initialize query filter data
        query_filter = "select * from dbo.ttcl_coc WHERE 1 = 1"  
        
        # Initialize query counter data
        query_counter = "select count(1) from dbo.ttcl_coc WHERE 1 = 1"
        
        if coc_search_object.jobno != '': 
            coc_search_object.jobno = f"%{coc_search_object.jobno}%"
            query_filter += "  AND jobno ILIKE %s" 
            query_counter += "  AND jobno ILIKE %s" 
            __paramaters.append(coc_search_object.jobno) 
            
        if coc_search_object.cocid != '': 
            coc_search_object.cocid = f"%{coc_search_object.cocid}%"
            query_filter += "  AND cocid::varchar(255) ILIKE %s" 
            query_counter += "  AND cocid::varchar(255) ILIKE %s" 
            __paramaters.append(coc_search_object.cocid) 
            
        if coc_search_object.objective != '': 
            coc_search_object.objective = f"%{coc_search_object.objective}%"
            query_filter += "  AND objective ILIKE %s"
            query_counter += "  AND objective ILIKE %s"
            __paramaters.append(coc_search_object.objective) 
             
        if coc_search_object.siteid != '': 
            coc_search_object.siteid = f"%{coc_search_object.siteid}%"
            query_filter += "  AND siteid ILIKE %s" 
            query_counter += "  AND siteid ILIKE %s" 
            __paramaters.append(coc_search_object.siteid) 
            
        if coc_search_object.siteaddress != '': 
            coc_search_object.siteaddress = f"%{coc_search_object.siteaddress}%"
            query_filter += "  AND siteaddress ILIKE %s" 
            query_counter += "  AND siteaddress ILIKE %s" 
            __paramaters.append(coc_search_object.siteaddress) 
            
        if coc_search_object.sampletype != '': 
            coc_search_object.sampletype = f"%{coc_search_object.sampletype}%"
            query_filter += "  AND sampletype ILIKE %s" 
            query_counter += "  AND sampletype ILIKE %s"
            __paramaters.append(coc_search_object.sampletype) 
        
        # Order by created desc and collectiondate desc
        if coc_search_object.orderby != '': 
            if coc_search_object.is_asc: 
                query_filter += f" order by {coc_search_object.orderby} asc"
            else:
                query_filter += f" order by {coc_search_object.orderby} desc"
        else:
            query_filter += " order by created desc "
        
        # Get offset and limit for Query
        __off_set = (coc_search_object.page - 1) * coc_search_object.pagesize
        query_filter += f" LIMIT {coc_search_object.pagesize}  OFFSET {__off_set}"
        
        print(f'query_filter: {query_filter}')
        
        # fetch data from query and list paramaters
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        print(f'query_counter: {query_counter}') 
        
        # fetch total records from query and list paramaters
        total_records = fetch_counter_data_with_paramaters(conn, query_counter, __paramaters)
        
        # Close connection       
        conn.close()
        
        # convert object to response data 
        __result_dict = json.loads(results)
        for coc_record in __result_dict:
            data.append(CocModel(**coc_record).__dict__)
            
         # set data output for search    
        response.update({"data": 
                            {
                                "items": data
                            }, 
                         "page": coc_search_object.page, 
                         "pagesize": coc_search_object.pagesize,
                         "total": total_records
                         }) 
         
        return successResponse(response) 
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))