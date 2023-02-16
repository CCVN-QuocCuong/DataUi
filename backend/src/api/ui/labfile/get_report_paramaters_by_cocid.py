from src.api.ui.labfile.help_report import get_coc_report_parameters_configure 
from src.shared.common import successResponse, errorResponse 

def handler(event, context):
    """
    Definition:
        - Function to get lab report paramater by coc_id
        
    Args: 
        - event (any): Contain coc_id paramater
        - context: Default paramaters
        
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try: 
        coc_id = event['pathParameters']['id']  
        print(f'coc_id: {coc_id}') 
        
        _report_paramaters = {} 
        if coc_id is not None:
            _report_paramaters = get_coc_report_parameters_configure(coc_id=coc_id) 
            
        return successResponse(_report_paramaters)  

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))


