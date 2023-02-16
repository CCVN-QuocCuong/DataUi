from src.api.ui.labfile.help_report import get_noncoc_report_parameters_configure 
from src.shared.common import successResponse, errorResponse 

def handler(event, context):
    """
    Definition:
        - Function to get lab report paramater by file_id
        
    Args: 
        - event (any): Contain file_id paramater
        - context: Default paramaters
        
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and object(any) (Handling success)
    """
    try: 
        file_id = event['pathParameters']['id']  
        print(f'file_id: {file_id}')  
        _report_paramaters = {} 
        if file_id is not None:
            _report_paramaters = get_noncoc_report_parameters_configure(file_id=file_id) 
            
        return successResponse(_report_paramaters)  

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))


