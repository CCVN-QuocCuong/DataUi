import json 
from src.shared.db_util import fetch_data_with_paramaters , fetch_counter_data_with_paramaters
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection
from src.model.sample.sample_dto import SampleModel, SampleFilterModel 

def handler(event, context):
    """
    Definition:
        - Function to filter list Sample object haven't generated (ttcl_pointsampletest.cocprepared = false) and SampleFilterModel paramaters.
    
    Args:
        - event: Contain input SampleFilterModel object paramaters
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response list SampleModel (Handling success)
    """
    try:
        response = {}
        data = []
        filter_payload = json.loads(event['body'])
        sample_filter_object = SampleFilterModel(**filter_payload)
        print(sample_filter_object)
        
        # open connection to postgresql server
        conn = make_connection() 
        
        query_counter = "select count(1) \
            from dbo.clsurveysample c1, dbo.ttcl_pointsampletest c2, dbo.clsurveypoint c3, dbo.clsurvey c4 , dbo.clsurveysamplecontainer c5 \
            where c1.pointid = c3.pointid and c3.surveyid = c4.surveyid and c1.sampleid = c5.sampleid and c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode and c2.cocprepared = false "
        
        query_filter = "select c1.sampleid, c3.staff as createdby, c3.collectiondate, c4.objective, c4.jobnumber, c4.siteid, c4.siteaddress, c3.pointname, fromdepth, todepth, sampletype, samplematerialtype, c5.containertype, barcode, testidlist, teststringlist, c1.created \
            from dbo.clsurveysample c1, dbo.ttcl_pointsampletest c2, dbo.clsurveypoint c3, dbo.clsurvey c4 , dbo.clsurveysamplecontainer c5 \
            where c1.pointid = c3.pointid and c3.surveyid = c4.surveyid and c1.sampleid = c5.sampleid and c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode and c2.cocprepared = false "
        __paramaters = []
       
        if sample_filter_object.jobnumber != '':
            sample_filter_object.jobnumber = f"%{sample_filter_object.jobnumber}%"
            query_counter += "  AND jobnumber ILIKE %s" 
            query_filter += "  AND jobnumber ILIKE %s" 
            __paramaters.append(sample_filter_object.jobnumber)
            
        if sample_filter_object.sampler != '':
            sample_filter_object.sampler = f"%{sample_filter_object.sampler}%"
            query_filter += "  AND c3.staff  ILIKE %s" 
            query_counter += "  AND c3.staff  ILIKE %s" 
            __paramaters.append(sample_filter_object.sampler)
            
        if sample_filter_object.collectiondate != '':
            query_filter += "  AND TO_CHAR(c3.collectiondate, 'DD/MM/YYYY')  ILIKE %s" 
            query_counter += "  AND TO_CHAR(c3.collectiondate, 'DD/MM/YYYY')  ILIKE %s" 
            __paramaters.append(sample_filter_object.collectiondate)
            
        if sample_filter_object.siteid != '':
            sample_filter_object.siteid = f"%{sample_filter_object.siteid}%"
            query_filter += "  AND siteid ILIKE %s" 
            query_counter += "  AND siteid ILIKE %s"
            __paramaters.append(sample_filter_object.siteid)
            
        if sample_filter_object.siteaddress != '':
            sample_filter_object.siteaddress = f"%{sample_filter_object.siteaddress}%"
            query_filter += "  AND siteaddress  ILIKE %s" 
            query_counter += "  AND siteaddress  ILIKE %s" 
            __paramaters.append(sample_filter_object.siteaddress)
            
        if sample_filter_object.objective != '':
            sample_filter_object.objective = f"%{sample_filter_object.objective}%"
            query_filter += "  AND objective  ILIKE %s" 
            query_counter += "  AND objective  ILIKE %s" 
            __paramaters.append(sample_filter_object.objective)
            
        if sample_filter_object.sampletype != '':
            sample_filter_object.sampletype = f"%{sample_filter_object.sampletype}%"
            query_filter += "  AND sampletype  ILIKE %s" 
            query_counter += "  AND sampletype  ILIKE %s" 
            __paramaters.append(sample_filter_object.sampletype) 
            
        if sample_filter_object.barcodes != '': 
            __barcodes = convert_barcodes_paramaters(sample_filter_object.barcodes)
            print(f'__barcodes: {__barcodes}')
            query_filter += f" AND barcode not in ({__barcodes})"
            query_counter += f" AND barcode not  in ({__barcodes})" 
        
        # Order by created desc and collectiondate desc
        if sample_filter_object.orderby != '': 
            if sample_filter_object.is_asc: 
                query_filter += f" order by {sample_filter_object.orderby} asc NULLS FIRST, barcode desc"
            else:
                query_filter += f" order by {sample_filter_object.orderby} desc NULLS LAST, barcode desc"
        else:
            query_filter += " order by c1.created desc, c3.collectiondate desc, barcode desc"
        
        # Get offset and limit for Query
        __off_set = (sample_filter_object.page - 1) * sample_filter_object.pagesize
        query_filter += f" LIMIT {sample_filter_object.pagesize}  OFFSET {__off_set}"
        
        print(f'query_filter: {query_filter}')
        print(f'__paramaters: {__paramaters}')
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        print(f'query_counter: {query_counter}')
        
        total_records = fetch_counter_data_with_paramaters(conn, query_counter, __paramaters)
        
        # Close connection       
        conn.close()
        
        # convert object to response data
        _result_dict = json.loads(results)
        for sample in _result_dict:
            data.append(SampleModel(**sample).__dict__)
            
        # set data output for search    
        response.update({"data": 
                            {
                                "items": data
                            }, 
                         "page": sample_filter_object.page, 
                         "pagesize": sample_filter_object.pagesize,
                         "total": total_records
                         }) 

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
    
def convert_barcodes_paramaters(barcodes):
    """
    Definition:
        - Function to separate barcodes separated by | into a postgres comparison string.
    
    Args:
        - barcodes: barcodes separated by the sign | (A|B|C) 
    
    Returns:
        - __str: (str) postgres comparison string ('A','B','C')
    """
    lst_barcodes = []
    if barcodes != '' and len(barcodes) > 0:
        __barcodes = barcodes.split("|") 
        for barcode in __barcodes:
            lst_barcodes.append(barcode)  
    
    __str = " "
    if len(lst_barcodes) > 0:
        for item in lst_barcodes:
            __str = __str + f"\'{item}\'," 
    
    return __str[:-1]