import json
from datetime import datetime
from src.helpers.cognito_common import get_current_user_login 
from src.model.model_relation import *
from src.shared.db_orm_connection import psql_db
from playhouse.shortcuts import model_to_dict
from peewee import *
from src.shared.common import successResponse, errorResponse, S3_BUCKET_STORAGE_COC_FILES
import boto3 

BUCKET_NAME = S3_BUCKET_STORAGE_COC_FILES 
DEFAULT_VALUE_OF_VERSION = 0

def handler(event, context):
    """
    Definition:
    Function to create logic COC
    
    Args:
      event: Contains input paramaters of coc information.
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 (Handling success)
    """
    try: 
        # get current user name from access_token
        current_user_name = get_current_user_login(event)
        
        payload = json.loads(event['body']) 
        print(f'payload : {payload}') 
        
        # In case the key samples are not in the payload, an error is reported. Because when creating coc, it is required to have at least one sample.
        if "samples" not in payload:
            return errorResponse(400, "Backend error: Need select Sample test (samples['barcode','point_name']) to generate COC")
        
        for sample in payload["samples"]:
            code = sample["barcode"]
            
            # Check if this barcode already exists in the ttcl_pointsampletest table and if it belongs to another coc (cocprepared==True means it belongs to another coc).
            cscontainer_duplicate = ttcl_pointsampletest.select().where(
                (ttcl_pointsampletest.barcode==code) &
                (ttcl_pointsampletest.cocprepared==True))
           
            # In case the barcode already exists in another coc, report an error and finish processing.
            if len(cscontainer_duplicate) > 0:
                return errorResponse(400, "Backend error: the barcode ({}) is already generate COC".format(code))

        # Initialize a transaction to ensure that all processes within it, 
        # either completely successful (commit) or an error occurs during execution,
        # will rollback all previous processing.
        with psql_db.atomic() as transaction:
            try:
                # Create coc objects and insert them into the database
                current_date = datetime.now().replace(microsecond=0)
                coc_obj = ttcl_coc.create(**payload,
                            version = DEFAULT_VALUE_OF_VERSION,
                            created=current_date, 
                            lastmodified=current_date)
                print('coc_obj: ')
                print(model_to_dict(coc_obj))
                # Insert new record to store version of coc form
                ttcl_coc_versions.create(
                    cocid = coc_obj.cocid,
                    version = DEFAULT_VALUE_OF_VERSION,
                    created = current_date,
                    note = payload['note'],
                    friendlyid = 'COC{} V{}'.format(coc_obj.cocid, coc_obj.version)
                )
                
                 # Create coc objects and insert them into the database
                json_data = {
                    "COC": {
                        "clientRegistrationReference": f"{payload['jobno']}.0000",
                        "registrationDescription": f"Bulk/SQ - {coc_obj.cocid}",
                        "numberOfSamples": len(payload["samples"]),
                        "clientOrderNumber": f"COC{coc_obj.cocid}",
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
                
                print(f' payload["samples"]: { payload["samples"]}')
                
                # For samples created for COC, it is necessary to update column information cocprepared = 1 to ensure that this sample has been assigned to COC.
                for sample in payload["samples"]:
                    code = sample["barcode"]
                    update_barcode = (ttcl_pointsampletest
                        .update({ttcl_pointsampletest.cocprepared: 1})
                        .where(ttcl_pointsampletest.barcode==code))
                    update_barcode.execute()

                    sample_concat_name = sample["point_name"]
                    pointsampletest_detail = ttcl_pointsampletest.select().where(ttcl_pointsampletest.barcode==code)
                    samplebarcode_id = pointsampletest_detail[0].samplebarcodeid
                    ttcl_cocdetails.create(cocid=coc_obj.cocid,
                                        samplebarcodeid=samplebarcode_id,
                                        samplecombinename=sample_concat_name)
                     
                    json_data["COC"]["samples"].append({
                                "sampleDate": f"{current_date}",
                                "clientSampleReference": f"{sample_concat_name}",
                                "clientSampleEid": f"{samplebarcode_id}", 
                                "tests": "",
                                "labContainerBarcodes": f"{code}",
                                "sampleComment": "",
                                "samplingDepth": ""
                            })
                
                # Save a file digital_coc.json in the S3 bucket with the information initialized according to the above logic.           
                s3 = boto3.resource('s3')
                filename = "digital_coc.json"
                s3object = s3.Object(BUCKET_NAME, f"{coc_obj.cocid}/{filename}")
                s3object.put(
                    Body=(bytes(json.dumps(json_data, indent=4, sort_keys=True).encode('UTF-8')))
                )
                ttcl_header = {
                    "cocid": f"{coc_obj.cocid}",
                    "labname": "Analytica",
                    "labjobnumber": "",
                    "filename": f"{filename}",
                    "createdon": current_date,
                    "uploadby": current_user_name,
                    "status": "",
                    "filetype": "json",
                    "fileurl": f"s3://{BUCKET_NAME}/{coc_obj.cocid}/{filename}",
                    "cocidmapping": ""
                }
                
                # Check the digital_coc.json file of that coc already in the ttcl_labfileheader table or not?
                ttcl_coc_digital_record = ttcl_labfileheader.select().where((ttcl_labfileheader.cocid == coc_obj.cocid) & (ttcl_labfileheader.filename == filename))
                
                # If it exists, skip it, if it doesn't exist, create that file if lab coc belongs to lab = 'Analytica'
                if len(ttcl_coc_digital_record) > 0:
                    pass
                else:
                    __ttcl_codes = ttcl_code.select().where(ttcl_code.codetypecode == 'Lab', ttcl_code.codename.contains('Analytica'))
                    print(f'__ttcl_codes: {__ttcl_codes}') 
                    ttcl_codes_ids = [] 
                    for item in __ttcl_codes:
                        ttcl_codes_ids.append(item.codeid)
                    
                    print(f'ttcl_codes_ids: {ttcl_codes_ids}')
                        
                    __ttcl_coc_digital_record = ttcl_coc.select().where(ttcl_coc.cocid == coc_obj.cocid, ttcl_coc.labid << ttcl_codes_ids).first()
                    print(f'__ttcl_coc_digital_record: {__ttcl_coc_digital_record}')
                    if __ttcl_coc_digital_record is not None:
                        ttcl_labfileheader.create(**ttcl_header)
                        print(f'Create new record: {ttcl_header}')
                    
            except Exception as ex:
                # roll back if have any exception
                transaction.rollback()
                return errorResponse(400, "SQL Exception: {}".format(ex))
            transaction.commit()

        return successResponse(model_to_dict(coc_obj))
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
