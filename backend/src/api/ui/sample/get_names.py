import json 
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data


def handler(event, context):
    """
    Definition:
        - Function to get all list sample name.  
    
    Args:
        - event: Default parameters of lambda function
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response (list) sample name (Handling success)
    """
    try:
        response = []
        conn = make_connection()
        query_get_sample_list = "select distinct c3.pointname \
            from dbo.clsurveysample c1, dbo.ttcl_pointsampletest c2, dbo.clsurveypoint c3, dbo.clsurvey c4 , dbo.clsurveysamplecontainer c5 \
            where c1.pointid = c3.pointid and c3.surveyid = c4.surveyid and c1.sampleid = c5.sampleid and c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode and c2.cocprepared = false order by c3.pointname asc "
        results = fetch_data(conn, query_get_sample_list)
        conn.close()
        results = json.loads(results)
        for __sample_name in results:
            print(__sample_name)
            response.append(__sample_name["pointname"])

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
