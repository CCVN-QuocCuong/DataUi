import json
from src.model.model_relation import ttcl_sampleform, ttcl_sampleform
from src.shared.common import successResponse, errorResponse
from playhouse.shortcuts import model_to_dict, dict_to_model
from peewee import *

def handler(event, context):
    """
    Definition:
        - Function to get ttcl_sampleform by fileid. 
    
    Args:
        - event: Contains input fileid paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and ttcl_sampleform object (Handling success)
    """
    try:
        file_id = event['pathParameters']['id']
        form_details = ttcl_sampleform.select().where(ttcl_sampleform.fileid==int(file_id))
       
        # get sampsle details assigned to CoC
        response = {}
        if len(form_details) > 0:
            response= [{
                "comment": cta.comment,
                "address": cta.address,
                "labaddress": cta.labaddress,
                "objective": cta.objective,
                "siteaddress": cta.siteaddress,
                "siteid": cta.siteid,
                "labid": cta.labid,
                "ttemailaddress": cta.ttemailaddress,
                "ttcontactphone": cta.ttcontactphone,
                "createdby": cta.createdby,
                "primarycontact": cta.primarycontact,
                "labquoteno": cta.labquoteno,
                "companyid": cta.companyid,
                "jobno": cta.jobno,
                "lastmodifiedby": cta.lastmodifiedby,
                "fileid": cta.fileid,
                "formid": cta.formid
            } for cta in form_details]
            response = response[0]
        return successResponse(response)
    except IntegrityError as e:
        return errorResponse(400, "BadRequest IntegrityError: {}".format(e))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
