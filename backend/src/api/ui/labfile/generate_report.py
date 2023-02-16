import json
from src.api.ui.labfile.report_logic.report_common import generate_presigned_url 
from src.api.ui.labfile.report_logic.horizontal import generate_horizontal_lab_report
from src.api.ui.labfile.report_logic.report_common import upload_report_to_s3
from src.api.ui.labfile.report_logic.verticle import generate_verticle_lab_report 
from src.api.ui.labfile.report_logic.report_style import set_xlsx_styles
from src.api.ui.labfile.help_report import save_coc_report_paramaters
from src.shared.common import successResponse, errorResponse
import openpyxl 
from openpyxl.styles import Font

def handler(event, context):
    """
    Definition:
        - Function to generate lab report result function for lab files with COC
        
    Args: 
        - event (any): Contain list paramaters object
        - context: Default paramaters
        
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list object(any) (Handling success)
    """
    try:
        payload = json.loads(event['body'])
        
        print(f'payload: {payload}')
        
        coc_id = event['pathParameters']['id'] 
        
        print(f'coc_id: {coc_id}')
        
        # save report paramater configure
        save_coc_report_paramaters(coc_id= coc_id, payload=payload)
        
        formattype = payload["formattype"]  
        region_code = payload["region"]
        dst_result_path = f'/tmp/{coc_id}.xlsx' 
        if formattype == "vertical":
            src_template_path = r"src/api/ui/labfile/report_template/vertical.xlsx"  
            dst_result_path = f'/tmp/ResultTable_Vertical_{coc_id}.xlsx' 
            # load template file
            workbook = openpyxl.load_workbook(src_template_path) 
            
            # set style for worksheet
            set_xlsx_styles(workbook)
            
            # get active worksheet for input data
            worksheet = workbook.worksheets[0]    
            
            worksheet.title = coc_id 
            
            __header = payload["header"]
             
            worksheet.cell (row=1, column = 1).value = coc_id
            worksheet.cell (row=1, column = 1).value = __header 
            
            # generate vertical report
            generate_verticle_lab_report(worksheet=worksheet,payload=payload, coc_id=coc_id, workbook=workbook, region_code=region_code)
            
        else:
            src_template_path = r"src/api/ui/labfile/report_template/horizontal.xlsx" 
            dst_result_path = f'/tmp/ResultTable_Horizontal_{coc_id}.xlsx' 
            
            # load template file
            workbook = openpyxl.load_workbook(src_template_path) 
            
            # set style for worksheet
            set_xlsx_styles(workbook)
            
            # get active worksheet for input data
            worksheet = workbook.worksheets[0]    
            
            worksheet.title = coc_id
             
            __header = payload["header"]
            
            worksheet.cell (row=1, column = 1).value = coc_id
            worksheet.cell (row=1, column = 1).value = __header 
        
            # generate horizontal report
            generate_horizontal_lab_report(worksheet=worksheet,payload=payload, coc_id=coc_id, workbook=workbook, region_code=region_code)
            
        # save new file xlsx result
        workbook.save(dst_result_path)

        print(f'Run to workbook.save({dst_result_path})')
        
        workbook.close() 
        
        # save file into s3 and insert database
        report_key = upload_report_to_s3(format_type=formattype, coc_id=coc_id) 
        
        # generate url trigger for download
        response_url = generate_presigned_url(key=report_key,expiration=3600)
      
        result = {"report_lab_url": response_url} 
        
        return successResponse(result)

    except Exception as e:
        print(f'handler: {e}')
        return errorResponse(400, "Exception: {}".format(e))
    

