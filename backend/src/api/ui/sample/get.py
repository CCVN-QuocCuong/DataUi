from src.model.sample.sample_dto import SampleModel
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import *

def handler(event, context):
    """
    Definition:
        - Function to get Sample object by barcode 
    
    Args:
        - event: Content barcode(str) paramater
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response SampleModel object (Handling success)
    """
    try:
        response = SampleModel()
        barcode = event["queryStringParameters"]['barcode']

        samplecontainer_detail = clsurveysamplecontainer.get(clsurveysamplecontainer.labcode == barcode)
        sample_detail = clsurveysample.get_by_id(samplecontainer_detail.sampleid)
        pointsampletest_detail = ttcl_pointsampletest.get(ttcl_pointsampletest.barcode == barcode)
        surveypoint_detail = clsurveypoint.get_by_id(sample_detail.pointid)
        survey_detail = clsurvey.get_by_id(surveypoint_detail.surveyid)

        # if len(sample_detail) > 0:
        response.sampleid = sample_detail.sampleid
        response.createdby = surveypoint_detail.staff
        response.collectiondate = surveypoint_detail.collectiondate
        response.objective = survey_detail.objective
        response.objectiveother = samplecontainer_detail.objectiveother
        response.jobnumber = survey_detail.jobnumber
        response.siteid = survey_detail.siteid
        response.siteaddress = survey_detail.siteaddress
        response.pointname = surveypoint_detail.pointname
        response.duplicatename = samplecontainer_detail.duplicatename
        response.fromdepth = sample_detail.fromdepth
        response.todepth = sample_detail.todepth
        response.sampletype = surveypoint_detail.sampletype
        response.samplematerialtype = sample_detail.samplematerialtype
        response.containertype = samplecontainer_detail.containertype
        response.barcode = pointsampletest_detail.barcode
        response.testidlist = pointsampletest_detail.testidlist
        response.teststringlist = pointsampletest_detail.teststringlist
        
        return successResponse(response.__dict__) 

    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
