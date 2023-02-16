import json
from datetime import datetime
from src.model.sample.sample_dto import SampleModel
from playhouse.shortcuts import model_to_dict, dict_to_model
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import *

def handler(event, context):
    """
    Definition:
        - Function to update Sample object.
    
    Args:
        - event: Contain input SampleModel object paramaters
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and response SampleModel object (Handling success)
    """
    try:
        sample_payload = json.loads(event['body'])
        sample_object = SampleModel(**sample_payload)
        
        print(f'sample_object: {sample_object}')

        # Save samplecontainer_detail
        samplecontainer_detail = clsurveysamplecontainer.get(clsurveysamplecontainer.labcode == sample_object.barcode) 
        if sample_object.objectiveother != '' or sample_object.duplicatename != '' or sample_object.containertype != '':
            q = (clsurveysamplecontainer
                .update({clsurveysamplecontainer.objectiveother: sample_object.objectiveother,
                         clsurveysamplecontainer.duplicatename: sample_object.duplicatename,
                         clsurveysamplecontainer.containertype: sample_object.containertype
                         })
                .where(clsurveysamplecontainer.labcode==sample_object.barcode))
            q.execute()  # Execute the query.
        
        sample_detail = clsurveysample.get_by_id(samplecontainer_detail.sampleid)
        if sample_object.fromdepth != '':
            sample_detail.fromdepth = sample_object.fromdepth
        if sample_object.todepth != '':
            sample_detail.todepth = sample_object.todepth
        if sample_object.sampletype != '':
            sample_detail.sampletype = sample_object.sampletype
        if sample_object.samplematerialtype != '':
            sample_detail.samplematerialtype = sample_object.samplematerialtype
        sample_detail.save()
        
        # Update data for pointsampletest_detail
        pointsampletest_detail = ttcl_pointsampletest.get(ttcl_pointsampletest.barcode == sample_object.barcode)
        if sample_object.barcode != '':
            pointsampletest_detail.barcode = sample_object.barcode
            pointsampletest_detail.save()

        # Update data for surveypoint_detail
        surveypoint_detail = clsurveypoint.get_by_id(sample_detail.pointid)
        if sample_object.createdby != '':
            surveypoint_detail.staff = sample_object.createdby
        if sample_object.collectiondate != '':
            datetime_new = datetime.strptime(sample_object.collectiondate, '%Y-%m-%dT%H:%M:%S')
            surveypoint_detail.collectiondate = datetime_new
        if sample_object.pointname != '':
            surveypoint_detail.pointname = sample_object.pointname
        if sample_object.sampletype != '':
            surveypoint_detail.sampletype = sample_object.sampletype
        surveypoint_detail.save()
        
        # Update data for table survey_detail
        survey_detail = clsurvey.get_by_id(surveypoint_detail.surveyid)
        if sample_object.objective != '':
            survey_detail.objective = sample_object.objective
        if sample_object.jobnumber != '':
            survey_detail.jobnumber = sample_object.jobnumber
            
        if sample_object.siteid != survey_detail.siteid:
            survey_detail.siteid = sample_object.siteid
            
        if sample_object.siteaddress != '':
            survey_detail.siteaddress = sample_object.siteaddress
        survey_detail.save()

        return successResponse(sample_object.__dict__)

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))
