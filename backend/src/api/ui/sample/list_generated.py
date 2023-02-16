import json
from src.model.sample.sample_dto import SampleModel
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data


def handler(event, context):
    """
    Definition:
        - Function to get list Sample object have generated (ttcl_pointsampletest.cocprepared = true)
    
    Args:
        - event: Default parameters of lambda function
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response list SampleModel (Handling success)
    """
    try:
        response = []
        conn = make_connection()
        query_get_sample_list = "select c1.sampleid, c3.staff as createdby, c3.collectiondate, c4.objective, c4.jobnumber, c4.siteid, c4.siteaddress, c3.pointname, fromdepth, todepth, sampletype, samplematerialtype, c5.containertype, barcode, testidlist, teststringlist \
            from dbo.clsurveysample c1, dbo.ttcl_pointsampletest c2, dbo.clsurveypoint c3, dbo.clsurvey c4 , dbo.clsurveysamplecontainer c5 \
            where c1.pointid = c3.pointid and c3.surveyid = c4.surveyid and c1.sampleid = c5.sampleid and c5.labcode = c2.barcode and c2.cocprepared = true order by barcode DESC "
        results = fetch_data(conn, query_get_sample_list)
        conn.close()
        sample_records = json.loads(results)
        for sample in sample_records:
            response.append(SampleModel(**sample).__dict__)

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
