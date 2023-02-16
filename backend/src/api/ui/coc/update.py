import json
from datetime import datetime
import boto3
from src.helpers.cognito_common import get_current_user_login
from src.api.ui.coc.coc_common import get_samples
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES 
from src.model.coc.coc_dto import CocModel
from src.model.model_relation import ttcl_code, ttcl_coc, ttcl_coc_versions, ttcl_cocdetails, ttcl_pointsampletest, ttcl_labfileheader
from src.shared.db_orm_connection import psql_db
from playhouse.shortcuts import model_to_dict
from peewee import *
from src.shared.common import successResponse, errorResponse
BUCKET_NAME = S3_BUCKET_STORAGE_COC_FILES
def handler(event, context):
    """
    Definition:
    Function to update logic COC
    
    Args:
      event: Contains input paramaters of coc information.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 (Handling success)
    """
    try:
        samples = []
        payload = json.loads(event['body'])
        json_data = {
            "COC": {
                "clientRegistrationReference": f"{payload['jobno']}.0000",
                "registrationDescription": f"Bulk/SQ - {payload['cocid'] if 'cocid' in payload else ''}",
                "numberOfSamples": len(payload["samples"]),
                "clientOrderNumber": f"COC{payload['cocid'] if 'cocid' in payload else ''}",
                "submitter": f"{payload['submitter'] if 'submitter' in payload else ''}",
                "priority": f"{payload['priority'] if 'priority' in payload else '' }",
                "sentDate": f"{payload['lastmodified'][:10] if 'lastmodified' in payload else ''}",
                "comments": f"{payload['comment'] if 'comment' in payload else '' }",
                "status": f"{payload['statuscode'] if 'statuscode' in payload else '' }",
                "client": {
                    "name": "",
                    "firstName": "",
                    "lastName": "",
                    "addressLine1": f"{payload['address'] if 'address' in payload else ''}",
                    "suburb": "",
                    "city": "",
                    "postCode": "",
                    "country": "",
                    "telephoneNumber": f"{payload['primarycontact'] if 'primarycontact' in payload else ''} ",
                    "emailAddress": f"{payload['emailother'] if 'emailother' in payload else ''}"
                },
                "samples": []
            }
        }
        
        # Deserialization  json payload to CocModel model 
        coc_obj = CocModel(**payload)
        
        # Get object ttcl_coc by coc_id
        ttcl_coc_record = ttcl_coc.get_by_id(coc_obj.cocid)
        
        # If this coc_id already exists, continue to update the data
        if ttcl_coc_record.cocid == coc_obj.cocid:
            
            # Initialize a transaction to ensure that all processes within it, 
            # either completely successful (commit) or an error occurs during execution,
            # will rollback all previous processing.
            with psql_db.atomic() as transaction:
                try:
                    current_date = datetime.now().replace(microsecond=0)
                    ttcl_coc_record.createdby = coc_obj.createdby
                    ttcl_coc_record.lastmodified = current_date
                    ttcl_coc_record.lastmodifiedby = coc_obj.lastmodifiedby
                    ttcl_coc_record.jobno = coc_obj.jobno
                    ttcl_coc_record.jobphase = coc_obj.jobphase
                    ttcl_coc_record.jobtask = coc_obj.jobtask
                    ttcl_coc_record.companyid = coc_obj.companyid
                    ttcl_coc_record.labquoteno = coc_obj.labquoteno
                    ttcl_coc_record.primarycontact = coc_obj.primarycontact
                    ttcl_coc_record.submitter = coc_obj.submitter
                    ttcl_coc_record.ttcontactphone = coc_obj.ttcontactphone
                    ttcl_coc_record.ttemailaddress = coc_obj.ttemailaddress
                    ttcl_coc_record.labid = coc_obj.labid
                    ttcl_coc_record.priority = coc_obj.priority
                    ttcl_coc_record.comment = coc_obj.comment
                    ttcl_coc_record.siteid = coc_obj.siteid
                    ttcl_coc_record.siteaddress = coc_obj.siteaddress
                    ttcl_coc_record.labreference = coc_obj.labreference
                    ttcl_coc_record.objective = coc_obj.objective
                    ttcl_coc_record.statuscode = coc_obj.statuscode
                    # [ENVDUI-225] Auto populated the T+T COC ID, increase version from DB
                    version_increase = ttcl_coc_record.version + 1
                    ttcl_coc_record.version = version_increase
                    ttcl_coc_record.note = coc_obj.note
                    ttcl_coc_record.deleted = coc_obj.deleted
                    ttcl_coc_record.statusid = coc_obj.statusid
                    ttcl_coc_record.phasename = coc_obj.phasename
                    ttcl_coc_record.jobname = coc_obj.jobname
                    ttcl_coc_record.taskname = coc_obj.taskname
                    ttcl_coc_record.sampletype = coc_obj.sampletype
                    ttcl_coc_record.labaddress = coc_obj.labaddress
                    ttcl_coc_record.address = coc_obj.address
                    ttcl_coc_record.emailother = coc_obj.emailother
                    ttcl_coc_record.save()
                    print('ttcl_coc_record: {}'.format(ttcl_coc_record))
                    
                    # Insert new record to store version of coc form
                    ttcl_coc_versions.create(
                        cocid = coc_obj.cocid,
                        version = version_increase,
                        created = current_date,
                        note = coc_obj.note,
                        friendlyid = 'COC{} V{}'.format(coc_obj.cocid, version_increase)
                    )
                    if "samples" in payload:
                        
                        # Un-generate samples to CoC
                        coc_details = ttcl_cocdetails.select().where(ttcl_cocdetails.cocid==ttcl_coc_record.cocid)
                        if len(coc_details) > 0:
                            for record in coc_details:
                                coc_detail = model_to_dict(record)
                                print('coc_detail: {}'.format(coc_detail))
                                pointsampletest_fk = coc_detail["samplebarcodeid"]

                                # Check barcodes is generated will return error message
                                coc_details_generated = ttcl_cocdetails.select().where(
                                    (ttcl_cocdetails.cocid!=ttcl_coc_record.cocid) &
                                    (ttcl_cocdetails.samplebarcodeid==int(pointsampletest_fk["samplebarcodeid"])))
                                print('coc_details_generated: {}'.format(coc_details_generated))
                                
                                update_pointsampletest = (ttcl_pointsampletest
                                    .update({ttcl_pointsampletest.cocprepared: 0})
                                    .where(ttcl_pointsampletest.samplebarcodeid==int(pointsampletest_fk["samplebarcodeid"])))
                                update_pointsampletest.execute()
                                
                                # delete current record of coc_detail
                                record.delete_instance()
                                
                        # Re-generate samples to CoC
                        # idx = 0
                        samplebarcodeids = []
                        for sample in payload["samples"]:
                            code = sample["barcode"]
                            update_barcode = (ttcl_pointsampletest
                                .update({ttcl_pointsampletest.cocprepared: 1})
                                .where(ttcl_pointsampletest.barcode==code))
                            update_barcode.execute()

                            sample_concat_name = sample["point_name"]
                            pointsampletest_detail = ttcl_pointsampletest.select().where(ttcl_pointsampletest.barcode==code)
                            samplebarcode_id = pointsampletest_detail[0].samplebarcodeid
                            
                            # append samplebarcode_id 
                            samplebarcodeids.append(samplebarcode_id)
                            
                            ttcl_cocdetails.create(cocid=coc_obj.cocid,
                                                samplebarcodeid=samplebarcode_id,
                                                samplecombinename=sample_concat_name)
                            
                            json_data["COC"]["samples"].append({
                                "sampleDate": f"{payload['lastmodified'][:10] if 'lastmodified' in payload else ''}",
                                "clientSampleReference": f"{sample_concat_name}",
                                "clientSampleEid": f"{samplebarcode_id}", 
                                "tests": "",
                                "labContainerBarcodes": f"{code}",
                                "sampleComment": "",
                                "samplingDepth": ""
                            })
                                                
                        s3 = boto3.resource('s3')
                        filename = "digital_coc.json"
                        s3object = s3.Object(BUCKET_NAME, f"{payload['cocid']}/{filename}")
                        s3object.put(
                            Body=(bytes(json.dumps(json_data, indent=4, sort_keys=True).encode('UTF-8')))
                        )
                        
                        # get current user name
                        current_user_name = get_current_user_login(event)
        
                        ttcl_header = {
                            "cocid": payload['cocid'],
                            "labname": "Analytica",
                            "labjobnumber": "",
                            "filename": f"{filename}",
                            "createdon": current_date,
                            "status": "",
                            "filetype": "json",
                            "fileurl": f"s3://{BUCKET_NAME}/{payload['cocid']}/{filename}",
                            "cocidmapping": "",
                            "uploadby": current_user_name
                        }
                        
                        # delete old file if exists
                        ttcl_coc_digital_record = ttcl_labfileheader.delete().where((ttcl_labfileheader.cocid == payload["cocid"]) & (ttcl_labfileheader.filename == filename))
                        ttcl_coc_digital_record.execute()
                        
                        # create new file
                        __ttcl_codes = ttcl_code.select().where(ttcl_code.codetypecode == 'Lab', ttcl_code.codename.contains('Analytica'))
                        print(f'__ttcl_codes: {__ttcl_codes}') 
                        ttcl_codes_ids = [] 
                        for item in __ttcl_codes:
                            ttcl_codes_ids.append(item.codeid)
                        
                        print(f'ttcl_codes_ids: {ttcl_codes_ids}')
                            
                        __ttcl_coc_digital_record = ttcl_coc.select().where(ttcl_coc.cocid == payload["cocid"], ttcl_coc.labid << ttcl_codes_ids).first()
                        print(f'__ttcl_coc_digital_record: {__ttcl_coc_digital_record}')
                        if __ttcl_coc_digital_record is not None:
                            ttcl_labfileheader.create(**ttcl_header)
                            print(f'Create new record: {ttcl_header}')
                except Exception as msg:
                    # roll back if have any exception
                    transaction.rollback()
                    return errorResponse(400, msg)
                transaction.commit()
                
                # get samples after commit transaction
                print(f'samplebarcodeids: {samplebarcodeids}')
                samples = get_samples(samplebarcodeids=samplebarcodeids)
                print(f'samples data: {samples}') 
                
                response = model_to_dict(ttcl_coc_record)
                response['samples'] = samples
            
            return successResponse(response)
        return errorResponse(400, "Update faile! cocid not have in payload")
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
