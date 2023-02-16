import json
from datetime import datetime
from src.model.coc.coc_dto import SampleFormModel
from src.model.model_relation import ttcl_sampleform
from src.shared.db_orm_connection import psql_db
from playhouse.shortcuts import model_to_dict
from peewee import *
from src.shared.common import successResponse, errorResponse

def handler(event, context):
    """
    Definition:
        - Function to update record in table ttcl_sampleform. 
    
    Args:
        - event: Contains input form_id and SampleFormModel object paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list samples name (str) (Handling success)
    """
    try:
        samples = []
        payload = json.loads(event['body'])
        form_id = event['pathParameters']['id']
        form_obj = SampleFormModel(**payload)
        ttcl_sampleform_record = ttcl_sampleform.get_by_id(form_id)
        
        # In case the record exists in the database, the update is performed. Otherwise, the error does not exist.
        if ttcl_sampleform_record.formid == form_obj.formid:
            """ 
            Initialize a transaction to ensure that all processes within it, 
            either completely successful (commit) or an error occurs during execution,
            will rollback all previous processing. 
            """
            with psql_db.atomic() as transaction:
                try:
                    
                    # Insert new record to store version of coc form
                    current_date = datetime.now().replace(microsecond=0)
                    ttcl_sampleform_record.createdby = form_obj.createdby
                    ttcl_sampleform_record.lastmodified = current_date
                    ttcl_sampleform_record.lastmodifiedby = form_obj.lastmodifiedby
                    ttcl_sampleform_record.comment = form_obj.comment
                    ttcl_sampleform_record.companyid = form_obj.companyid
                    ttcl_sampleform_record.labquoteno = form_obj.labquoteno
                    ttcl_sampleform_record.primarycontact = form_obj.primarycontact
                    ttcl_sampleform_record.ttcontactphone = form_obj.ttcontactphone
                    ttcl_sampleform_record.ttemailaddress = form_obj.ttemailaddress
                    ttcl_sampleform_record.labid = form_obj.labid
                    ttcl_sampleform_record.siteid = form_obj.siteid
                    ttcl_sampleform_record.siteaddress = form_obj.siteaddress
                    ttcl_sampleform_record.objective = form_obj.objective
                    ttcl_sampleform_record.labaddress = form_obj.labaddress
                    ttcl_sampleform_record.address = form_obj.address
                    ttcl_sampleform_record.jobno = form_obj.jobno
                    ttcl_sampleform_record.save()
                    print('ttcl_sampleform_record: {}'.format(ttcl_sampleform_record))
                    
                except BaseException as msg:
                    # roll back if have any exception
                    transaction.rollback()
                    return errorResponse(400, msg)
                transaction.commit()
                response = model_to_dict(ttcl_sampleform_record)
                response['samples'] = samples
            
            return successResponse(response)
        return errorResponse(400, "Update faile! formid not have in payload")
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
