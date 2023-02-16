from datetime import datetime
from src.model.model_relation import ttcl_notification 
from playhouse.shortcuts import model_to_dict
from peewee import * 
from src.model.coc.coc_dto import NotificationModel 

def create_notification(model: NotificationModel):
    """
    Definition:
        - Function to create record in table ttcl_notification. 
    
    Args:
        - model: NotificationModel object paramater. 
    
    Returns:
      - response: (dict) data object of ttcl_notification  
    """
    try:         
        # set value default for ttcl_notification record
        __ttcl_notification = {
            "cocid": model.cocid, 
            "fileid": model.fileid,
            "status": 'uploaded', 
            "isread": False,
            "created": datetime.utcnow().replace(microsecond=0),
            "lastmodified": datetime.utcnow().replace(microsecond=0) 
        }   
        
        # In case model.cocid == -1 is non-coc otherwise it is coc
        if  model.cocid == -1:
            __ttcl_notification["message"] = f'Uploaded of file { model.fileid} successed.'
        else:
            __ttcl_notification["message"] = f'Uploaded of file {model.fileid} of cocid { model.cocid} successed.'

        print(f'ttcl_notification: {__ttcl_notification}') 
        
        # save record
        result = ttcl_notification.create(**__ttcl_notification) 
        
        response = model_to_dict(result)
        
        print(f'ttcl_notification response: {response}')
        
        return response  
    except Exception as e:
        print(f'Create ttcl_notification error: {e}')
        raise e


def update_notification(model: NotificationModel):
    """
    Definition:
        - Function to update record in table ttcl_notification. 
    
    Args:
        - model: NotificationModel object paramater. 
    
    Returns:
      - response: (dict) data object of ttcl_notification  
    """
    try: 
        # set value default for ttcl_notification record
        __ttcl_notification = ttcl_notification.select().where(ttcl_notification.cocid == model.cocid and ttcl_notification.fileid == model.fileid).first()
        if __ttcl_notification is not None:
            if  model.cocid == -1:
                __ttcl_notification.message = f'Status of file { model.fileid} has changed to {model.status}.' 
            else:
                __ttcl_notification.message = f'Status of file {model.fileid} of cocid { model.cocid} has changed to {model.status}.'
                
            # Update status
            __ttcl_notification.isread = False
            __ttcl_notification.status = model.status
            __ttcl_notification.lastmodified = datetime.utcnow().replace(microsecond=0) 
            
            # update to db
            __rows_updated = __ttcl_notification.save()
            
            print(f'{__rows_updated} of rows updated')
                
            print(f'ttcl_notification: {__ttcl_notification}') 
        
        response = model_to_dict(__ttcl_notification)
        
        print(f'ttcl_notification response: {response}')
        
        return response  
    except Exception as e:
        print(f'Create ttcl_notification error: {e}')
        raise e
    
def mark_read_notification(ttcl_notificationid: int):
    """
    Definition:
        - Function to update record in table ttcl_notification. 
    
    Args:
        - ttcl_notificationid: Input id of table ttcl_notification paramater. 
    
    Returns:
      - response: (dict) data object of ttcl_notification  
    """
    try: 
        # select record update
        __ttcl_notification = ttcl_notification.select().where(ttcl_notification.ttcl_notificationid == ttcl_notificationid).first() 
        if __ttcl_notification is not None:
            __ttcl_notification.isread = True
        
        # update data into database
        __rows_updated = __ttcl_notification.save()
        
        print(f'{__rows_updated} of rows updated')
        
        return dict({"message": "Mark read message success."})
    except Exception as e:
        print(f'mark_read_notification error: {e}')
        raise e