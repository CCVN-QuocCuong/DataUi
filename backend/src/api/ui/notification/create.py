import json 
from src.api.ui.notification.notification_logic import create_notification
from src.model.coc.coc_dto import NotificationModel 
from src.shared.common import successResponse, errorResponse 
from peewee import *

def handler(event, context): 
    """
    Definition:
        - Function to create new record ttcl_notification. 
    
    Args:
        - event: Contains input NotificationModel object paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and ttcl_notification object (dict) (Handling success)
    """
    try:
        
        # Get notification from payload
        payload = json.loads(event['body'])
       
        # Convert to NotificationModel
        notification = NotificationModel(**payload)
        
        # Save object into db
        response = create_notification(notification) 
        
        return successResponse(response)   
    except Exception as e:
        print(f'Create notification error: {e}')
        return errorResponse(400, "Backend error: {}".format(e))
 
