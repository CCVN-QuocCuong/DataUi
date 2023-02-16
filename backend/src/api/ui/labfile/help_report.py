from peewee import *
from src.model.model_relation import ttcl_filebusinesscriteria
from src.model.model_relation import ttcl_cocbusinesscriteria 

# coc report paramaters
def save_coc_report_paramaters(coc_id, payload):
    """
    Definition:
        - Function to save lab report paramater with COC
        
    Args: 
        - coc_id (str): coc_id input
        - payload: Input paramaters
        
    Returns:
        - bool: Return True/False value 
    """
    try:   
        print(f'coc_id: {coc_id}')  
        __ttcl_cocbusinesscriteria = ttcl_cocbusinesscriteria.select().where(ttcl_cocbusinesscriteria.cocid == coc_id).first()
         
        print(f'payload: {payload}')  
        criterias = payload["criteria"]
        
        # Get configure paramater in group criteria
        _businesscriteriacodes = []
        _styles = []
        if criterias is not None and len(criterias) > 0:
            for criteria in criterias:
                if "businesscriteriacode" in criteria:
                    _businesscriteriacodes.append(criteria["businesscriteriacode"])
                if "stylevalue" in criteria:
                    _styles.append(criteria["stylevalue"])
        
        if _businesscriteriacodes and len(_businesscriteriacodes) > 0:
            __businesscriteriacodes = "|".join(_businesscriteriacodes)
            __styles =  "|".join(_styles)
        else:
            __businesscriteriacodes = None
            __styles =  None
                        
        record = {}
        record["businesscriteriacode"] = __businesscriteriacodes
        record["style"] = __styles
        
        # format type
        if "header" in payload:
                record["header"] = payload["header"]
        else:
            record["header"] = None
            
        # format type
        if "formattype" in payload:
                record["formattype"] = payload["formattype"]
        else:
            record["formattype"] = None
            
        # check key deptContamination
        if "deptContamination" in payload:
                record["depthcode"] = payload["deptContamination"]
        else:
            record["depthcode"] = None
            
        # check key deptContamination
        if "groundWaterLevel" in payload:
                record["groundwaterdepthcode"] = payload["groundWaterLevel"]
        else:
            record["groundwaterdepthcode"] = None
        
        # check key deptContamination
        if "soiltype" in payload:
                record["soiltypecode"] = payload["soiltype"]
        else:
            record["soiltypecode"] = None
        
        # check key deptContamination
        if "region" in payload:
                record["regioncode"] = payload["region"]
        else:
            record["regioncode"] = None
            
        # check key deptContamination
        if "canterburyArea" in payload:
                record["chcbgregion"] = payload["canterburyArea"]
        else:
            record["chcbgregion"] = None
            
        # check key deptContamination
        if "canterburyIsSiteUrban" in payload:
                record["chcisurban"] = payload["canterburyIsSiteUrban"]
        else:
            record["chcisurban"] = None
            
        # check key deptContamination
        if "canterburySoiltype" in payload:
                record["chcbgsoiltype"] = payload["canterburySoiltype"]
        else:
            record["chcbgsoiltype"] = None
            
        # check key deptContamination
        if "waikatoFreshAged" in payload:
                record["sgvsoilage"] = payload["waikatoFreshAged"]
        else:
            record["sgvsoilage"] = None
            
        # check key deptContamination
        if "waikatoGrainOfSize" in payload:
                record["sgvgainsize"] = payload["waikatoGrainOfSize"]
        else:
            record["sgvgainsize"] = None
        
        # check key deptContamination
        if "waikatoSoiltype" in payload:
                record["sgvsoiltype"] = payload["waikatoSoiltype"]
        else:
            record["sgvsoiltype"] = None
            
        # save configure into database
        record["cocid"] = coc_id 
        if __ttcl_cocbusinesscriteria is None:
            ttcl_cocbusinesscriteria.create(**record)
        else: 
            ttcl_cocbusinesscriteria.update(**record).where(ttcl_cocbusinesscriteria.cocbusinesscriteriaid == __ttcl_cocbusinesscriteria.cocbusinesscriteriaid).execute() 
                 
        return True

    except Exception as e:
        print(f'save_report_paramaters error: {e}')
        return False


def get_coc_report_parameters_configure(coc_id):
    """
    Definition:
        - Function to get report parameters configure paramater with COC
        
    Args: 
        - coc_id (str): coc_id input 
        
    Returns:
        - _report_paramaters: (dict) Value of paramaters 
    """
    try:
        _report_paramaters = {}
        __criterias = []
        # get current configure report paramaters
        record = ttcl_cocbusinesscriteria.select().where(ttcl_cocbusinesscriteria.cocid == coc_id).first() 
        if record is None:
            # return empty configure
            return _report_paramaters
        else:
            # get businesscriteriacode
            __businesscriteriacode = record.businesscriteriacode
            __style_value = record.style
            if __businesscriteriacode is not None:
                __criterias = split__businesscriteriacode_to_list(__businesscriteriacode, __style_value)
                
            if __criterias and len(__criterias) > 0:
                _report_paramaters["criteria"] = __criterias 
            
            if record.formattype is not None:
                _report_paramaters["formattype"] = record.formattype
                
            if record.header is not None:
                _report_paramaters["header"] = record.header
                
            if record.depthcode is not None:
                _report_paramaters["deptContamination"] = record.depthcode
                
            if record.groundwaterdepthcode is not None:
                _report_paramaters["groundWaterLevel"] = record.groundwaterdepthcode
                
            if record.soiltypecode is not None:
                _report_paramaters["soiltype"] = record.soiltypecode
                
            if record.regioncode is not None:
                _report_paramaters["region"] = record.regioncode
            
            if record.chcbgregion is not None:
                _report_paramaters["canterburyArea"] = record.chcbgregion
                
            if record.chcisurban is not None:
                _report_paramaters["canterburyIsSiteUrban"] = record.chcisurban
                
            if record.chcbgsoiltype is not None:
                _report_paramaters["canterburySoiltype"] = record.chcbgsoiltype

            if record.sgvsoilage is not None:
                _report_paramaters["waikatoFreshAged"] = record.sgvsoilage

            if record.sgvgainsize is not None:
                _report_paramaters["waikatoGrainOfSize"] = record.sgvgainsize

            if record.sgvsoiltype is not None:
                _report_paramaters["waikatoSoiltype"] = record.sgvsoiltype 

        return _report_paramaters
                
    except Exception as e:
        print(f'Exception get_report_parameters_configure: {e}')
        return None

# Non coc report paramaters
def save_noncoc_report_paramaters(file_id, payload):
    """
    Definition:
        - Function to sace report parameters configure paramater without COC
        
    Args: 
        - file_id (str): file_id input 
        - payload (any): input paramater data
        
    Returns:
        - bool: Return True/False value 
    """
    try:   
        print(f'file_id: {file_id}')  
        __ttcl_filebusinesscriteria = ttcl_filebusinesscriteria.select().where(ttcl_filebusinesscriteria.fileid == file_id).first()
         
        print(f'payload: {payload}')  
        
        criterias = payload["criteria"]
        
        # Get configure paramater in group criteria
        _businesscriteriacodes = []
        _styles = []
        if criterias is not None and len(criterias) > 0:
            for criteria in criterias:
                if "businesscriteriacode" in criteria:
                    _businesscriteriacodes.append(criteria["businesscriteriacode"])
                if "stylevalue" in criteria:
                    _styles.append(criteria["stylevalue"])
        
        if _businesscriteriacodes and len(_businesscriteriacodes) > 0:
            __businesscriteriacodes = "|".join(_businesscriteriacodes)
            __styles =  "|".join(_styles)
        else:
            __businesscriteriacodes = None
            __styles =  None
                        
        record = {}
        record["businesscriteriacode"] = __businesscriteriacodes
        record["style"] = __styles
        
        # check key formattype
        if "formattype" in payload:
                record["formattype"] = payload["formattype"]
        else:
            record["formattype"] = None
            
        # check header
        if "header" in payload:
            record["header"] = payload["header"]
        else:
            record["header"] = None
        
        # check key deptContamination
        if "deptContamination" in payload:
                record["depthcode"] = payload["deptContamination"]
        else:
            record["depthcode"] = None
            
        # check key deptContamination
        if "groundWaterLevel" in payload:
                record["groundwaterdepthcode"] = payload["groundWaterLevel"]
        else:
            record["groundwaterdepthcode"] = None
        
        # check key deptContamination
        if "soiltype" in payload:
                record["soiltypecode"] = payload["soiltype"]
        else:
            record["soiltypecode"] = None
        
        # check key deptContamination
        if "region" in payload:
                record["regioncode"] = payload["region"]
        else:
            record["regioncode"] = None
            
        # check key deptContamination
        if "canterburyArea" in payload:
                record["chcbgregion"] = payload["canterburyArea"]
        else:
            record["chcbgregion"] = None
            
        # check key deptContamination
        if "canterburyIsSiteUrban" in payload:
                record["chcisurban"] = payload["canterburyIsSiteUrban"]
        else:
            record["chcisurban"] = None
            
        # check key deptContamination
        if "canterburySoiltype" in payload:
                record["chcbgsoiltype"] = payload["canterburySoiltype"]
        else:
            record["chcbgsoiltype"] = None
            
        # check key deptContamination
        if "waikatoFreshAged" in payload:
                record["sgvsoilage"] = payload["waikatoFreshAged"]
        else:
            record["sgvsoilage"] = None
            
        # check key deptContamination
        if "waikatoGrainOfSize" in payload:
                record["sgvgainsize"] = payload["waikatoGrainOfSize"]
        else:
            record["sgvgainsize"] = None
        
        # check key deptContamination
        if "waikatoSoiltype" in payload:
                record["sgvsoiltype"] = payload["waikatoSoiltype"]
        else:
            record["sgvsoiltype"] = None
            
        # save configure into database
        record["fileid"] = file_id 
        if __ttcl_filebusinesscriteria is None:
            ttcl_filebusinesscriteria.create(**record)
        else:
            ttcl_filebusinesscriteria.update(**record).where(ttcl_filebusinesscriteria.filebusinesscriteriaid == __ttcl_filebusinesscriteria.filebusinesscriteriaid).execute() 
                 
        return True

    except Exception as e:
        print(f'save_noncoc_report_paramaters error: {e}')
        return False

def get_noncoc_report_parameters_configure(file_id):
    """
    Definition:
        - Function to sace report parameters configure paramater without COC
        
    Args: 
        - file_id (str): file_id input  
        
    Returns:
        - _report_paramaters: (dict) Value of paramaters 
    """
    try:
        _report_paramaters = {}
        __criterias = []
        # get current configure report paramaters
        record = ttcl_filebusinesscriteria.select().where(ttcl_filebusinesscriteria.fileid == file_id).first() 
        if record is None:
            # return empty configure
            return _report_paramaters
        else:
            # get businesscriteriacode
            __businesscriteriacode = record.businesscriteriacode
            __style_value = record.style
            if __businesscriteriacode is not None:
                __criterias = split__businesscriteriacode_to_list(__businesscriteriacode, __style_value)
                
            if __criterias and len(__criterias) > 0:
                _report_paramaters["criteria"] = __criterias
            
            if record.formattype is not None:
                _report_paramaters["formattype"] = record.formattype 
                
            if record.header is not None:
                _report_paramaters["header"] = record.header 
        
            if record.depthcode is not None:
                _report_paramaters["deptContamination"] = record.depthcode
                
            if record.groundwaterdepthcode is not None:
                _report_paramaters["groundWaterLevel"] = record.groundwaterdepthcode
                
            if record.soiltypecode is not None:
                _report_paramaters["soiltype"] = record.soiltypecode
                
            if record.regioncode is not None:
                _report_paramaters["region"] = record.regioncode
            
            if record.chcbgregion is not None:
                _report_paramaters["canterburyArea"] = record.chcbgregion
                
            if record.chcisurban is not None:
                _report_paramaters["canterburyIsSiteUrban"] = record.chcisurban
                
            if record.chcbgsoiltype is not None:
                _report_paramaters["canterburySoiltype"] = record.chcbgsoiltype

            if record.sgvsoilage is not None:
                _report_paramaters["waikatoFreshAged"] = record.sgvsoilage

            if record.sgvgainsize is not None:
                _report_paramaters["waikatoGrainOfSize"] = record.sgvgainsize

            if record.sgvsoiltype is not None:
                _report_paramaters["waikatoSoiltype"] = record.sgvsoiltype 

        return _report_paramaters
                
    except Exception as e:
        print(f'Exception get_noncoc_report_parameters_configure: {e}')
        return None
        
def split__businesscriteriacode_to_list(__businesscriteriacode, __stylevalue):
    """
    Definition:
        - Function to split split business criteria code to list
        
    Args: 
        - __businesscriteriacode (str): business code input  
        - __stylevalue (str): style value input
        
    Returns:
        - __criterias: (list) Value of criterias 
    """
    __criterias = []
    __criteria = {}
    if __businesscriteriacode is not None and __stylevalue is not None:
        __businesscriteriacodes = __businesscriteriacode.split("|")
        __stylevalues = __stylevalue.split("|")
        for i in range(len(__businesscriteriacodes)):
            __criteria["businesscriteriacode"] = __businesscriteriacodes[i]
            __criteria["stylevalue"] = __stylevalues[i] 
            __criterias.append(__criteria)
            __criteria = {}
            i = i + 1
            
        return __criterias
    else:
        return []
        