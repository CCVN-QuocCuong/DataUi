from datetime import datetime
from src.model.model_relation import  ttcl_notification
from src.shared.common import successResponse, errorResponse
from playhouse.shortcuts import model_to_dict
from peewee import *

def handler(event, context): 
    """
    Definition:
        - Function to get all record in table ttcl_notification. 
    
    Args:
        - event:  Default parameters of lambda function.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list object ttcl_notification (Handling success)
    """
    try:
        response = []
        # Get all record for transform success and can notification for web application
        records = ttcl_notification.select().order_by(ttcl_notification.isread, ttcl_notification.lastmodified.desc(), ttcl_notification.created.desc())
        print(f'ttcl_notification: {records}') 
        
        # Convert object data before response
        if len(records) > 0 : 
            for item in records:
                __record = {
                                "ttcl_notificationid": item.ttcl_notificationid,
                                "cocid": item.cocid ,
                                "fileid": item.fileid ,
                                "status": item.status,
                                "message": item.message,
                                "isread": item.isread,
                                "created": item.created,
                                "lastmodified": item.lastmodified 
                            }
                
                if int(item.cocid) == -1:
                    __record["cocid"] = None 
                    
                # append data into list
                response.append(__record)
                 
        # response data
        return successResponse(response)  
    
    except Exception as e:
        print(f'Update select_for_update error: {e}')
        return errorResponse(400, "Backend error: {}".format(e))
 
