from src.api.ui.notification.notification_logic import mark_read_notification
from src.shared.common import successResponse, errorResponse 
from peewee import *

def handler(event, context): 
    """
    Definition:
        - Function to update isread = True for record has read in table ttcl_notification. 
    
    Args:
        - event: Contains input notificationid paramater.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and object ttcl_notification (Handling success)
    """
    try:
        # Get notification from paramater
        notificationid = event['pathParameters']['id'] 
        if notificationid is not None: 
            # Save object into db
            response = mark_read_notification(notificationid) 
        else:
            return errorResponse(400, "Notification is not found.")
        
        return successResponse(response)   
    except Exception as e:
        print(f'Create notification error: {e}')
        return errorResponse(400, "Backend error: {}".format(e))
 
