import json
from datetime import datetime
from src.model.model_relation import ttcl_sampleform
from src.shared.db_orm_connection import psql_db
from playhouse.shortcuts import model_to_dict
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.coc.coc_dto import SampleFormModel

def handler(event, context):
    """
    Definition:
        - Function to create/update ttcl_sampleform. 
    
    Args:
        - event: Contains input paramaters of SampleFormModel information.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and ttcl_sampleform object (Handling success)
    """
    try:
        payload = json.loads(event['body'])
        form_obj = SampleFormModel(**payload)
        form_details = ttcl_sampleform.select().where(ttcl_sampleform.fileid==int(form_obj.fileid))
        current_date = datetime.now().replace(microsecond=0)
        if len(form_details) > 0:
            ttcl_sampleform_record = ttcl_sampleform.get_by_id(form_details[0].formid)
            if ttcl_sampleform_record:
                """ 
                Initialize a transaction to ensure that all processes within it, 
                either completely successful (commit) or an error occurs during execution,
                will rollback all previous processing. 
                """
                with psql_db.atomic() as transaction:
                    try: 
                        # Insert new record to store version of coc form 
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
                        transaction.commit()
                        response = model_to_dict(ttcl_sampleform_record)
                        return successResponse(response)
                        
                    except Exception as msg:
                        # roll back if have any exception
                        transaction.rollback()
                        return errorResponse(400, msg)
        else:
            # Insert new record to store version of coc form
            form_obj_record = ttcl_sampleform.create(**payload,
                created=current_date,
                lastmodified=current_date)
            print('form_obj: ')
            print(model_to_dict(form_obj_record)) 
            return successResponse(model_to_dict(form_obj_record)) 
             
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
