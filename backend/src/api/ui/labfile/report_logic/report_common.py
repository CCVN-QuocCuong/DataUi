import json
from src.model.model_relation import (
    ttcl_businesscriteriatest_chcbg_complex,
    ttcl_businesscriteriatest_htn_complex,
)
from src.model.model_relation import ttcl_labfileheader
from src.shared.common import S3_BUCKET_STORAGE_COC_FILES
from src.shared.db_util import fetch_data, make_connection
from src.shared.common import successResponse, errorResponse
import boto3
from datetime import datetime
from playhouse.shortcuts import model_to_dict
from math import ceil
from botocore.exceptions import ClientError
import re as regex

COMMON_UNICODE = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "(": "⁽",
    ")": "⁾",
    "a": "ᵃ",
    "b": "ᵇ",
    "c": "ᶜ",
    "d": "ᵈ",
    "e": "ᵉ",
    "f": "ᶠ",
    "g": "ᵍ",
    "h": "ʰ",
    "i": "ⁱ",
    "j": "ʲ",
    "k": "ᵏ",
    "l": "ˡ",
    "m": "ᵐ",
    "n": "ⁿ",
    "o": "ᵒ",
    "p": "ᵖ",
    "q": "",
    "r": "ʳ",
    "s": "ˢ",
    "t": "ᵗ",
    "u": "ᵘ",
    "v": "ᵛ",
    "w": "ʷ",
    "x": "ˣ",
    "y": "ʸ",
    "z": "ᶻ",
    "A": "ᵃ",
    "B": "ᵇ",
    "C": "ᶜ",
    "D": "ᵈ",
    "E": "ᵉ",
    "F": "ᶠ",
    "G": "ᵍ",
    "H": "ʰ",
    "I": "ⁱ",
    "J": "ʲ",
    "K": "ᵏ",
    "L": "ˡ",
    "M": "ᵐ",
    "N": "ⁿ",
    "O": "ᵒ",
    "P": "ᵖ",
    "Q": "",
    "R": "ʳ",
    "S": "ˢ",
    "T": "ᵗ",
    "U": "ᵘ",
    "V": "ᵛ",
    "W": "ʷ",
    "X": "ˣ",
    "Y": "ʸ",
    "Z": "ᶻ",
    "*": "*",
    "Black Circle": "●",
    "Black Square": "■",
    "Black Triangle": "▲",
     " ": ""
}

factor_of_font_size_to_width = {
    12: {"factor": 0.8, "height": 16}  # width / count of symbols at row
}


def get_height_for_row(sheet, row_number, font_size=12):
    """
    Definition:
        - This function to caculate height of row in excel file
    
    Args:  
        - sheet: (worksheet) Active worksheet in Excel file  
        - row_number: Index row in excel file  
        - font_size:  Font size of text value in excel file
          
    Returns:
        - height: (float) Get height row excel file
    """
    try:
        font_params = factor_of_font_size_to_width[font_size]
        row = list(sheet.rows)[row_number]
        height = font_params["height"]

        for cell in row:
            words_count_at_one_row = (
                sheet.column_dimensions[cell.column_letter].width /
                font_params["factor"]
            )
            lines = ceil(len(str(cell.value)) / words_count_at_one_row)
            height = max(height, lines * font_params["height"])

        return height
    except Exception as e:
        print(f'Error get_height_for_row : {e}')
        return 0


def clean_value(value):
    """
    Definition:
        - This function to get COMMON_UNICODE from value input
    
    Args:  
        - value: (str) Input value need to convert to Unicode 
          
    Returns:
        - value: (str) Unicode characters
    """
    value = value.strip().replace(">", "").replace("%", "")
    try:
        st = ""
        for c in value:
            if c != "." and c in COMMON_UNICODE.values():
                return st
            st += c
        return st
    except Exception as e:
        print(f'Error clean_value : {e}')
        return value


def get_notecode_style(notecode):
    """
    Definition:
        - This function to get COMMON_UNICODE from notecode input
    
    Args:  
        - notecode: (str) Input value need to convert to Unicode 
          
    Returns:
        - notecode: (str) Unicode characters
    """
    try:
        notecode = notecode.strip()
        if notecode is not None and notecode != '' and notecode in COMMON_UNICODE:
            return COMMON_UNICODE[notecode]
        else:
            rs = ""
            for c in notecode:
                rs += COMMON_UNICODE[c]
            return rs
    except Exception as e:
        print(f'Error get_notecode_style : {e}')
        if len(notecode) > 2:
            return notecode
        return f"({notecode})"


def get_indicated_asbestos_value(affa, acm):
    """
    Definition:
        - This function to get COMMON_UNICODE from notecode input
    
    Args:  
        - affa: (str) Input value affa
        - acm: (str) Input value acm
          
    Returns:
        - str: (str)  asbestos value
    """
    try:
        affa_num = None
        acm_num = None
        # acm = "<0.01" # for testing
        # affa = "0.0076"
        if affa is not None:
            if ">" in affa:
                affa_num = (
                    float(
                        affa.strip()
                        .replace(">", "")
                        .replace("%", "")
                        .replace(f"{COMMON_UNICODE['4']}", "")
                    )
                    + 0.000001
                )
            elif "<" in affa:
                affa_num = (
                    float(
                        affa.strip()
                        .replace("<", "")
                        .replace("%", "")
                        .replace(f"{COMMON_UNICODE['4']}", "")
                    )
                    - 0.000001
                )
            else:
                affa_num = float(
                    affa.strip().replace("%", "").replace(
                        f"{COMMON_UNICODE['4']}", "")
                )
        if acm is not None:
            if ">" in acm:
                acm_num = (
                    float(
                        acm.strip()
                        .replace(">", "")
                        .replace("%", "")
                        .replace(f"{COMMON_UNICODE['4']}", "")
                    )
                    + 0.000001
                )
            elif "<" in acm:
                acm_num = (
                    float(
                        acm.strip()
                        .replace("<", "")
                        .replace("%", "")
                        .replace(f"{COMMON_UNICODE['4']}", "")
                    )
                    - 0.000001
                )
            else:
                acm_num = float(
                    acm.strip().replace("%", "").replace(
                        f"{COMMON_UNICODE['4']}", "")
                )
        if affa_num is None or acm_num is None:
            return "-"
        rs = "ND"
        if affa_num <= 0.001 and acm_num < 0.01:
            return "Unlicensed Asbestos Works"
        if 0.001 < affa_num <= 0.01 or 0.01 < acm_num <= 1:
            return "Asbestos Related Works Controls"
        if 0.01 < affa_num or 1 < acm_num:
            return "Class B Asbestos Controls"
        if 1 < affa_num:
            return "Class A Asbestos Controls"
    except Exception as e:
        print(f'Error get_indicated_asbestos_value : {e}')
        return "-"
    return rs


def get_file_name_report_by_fileid(file_id):
    """
    Definition:
        - This function to get file name of CSV file
    
    Args:  
        - file_id: (str) Input file paramate value 
          
    Returns:
        - response: (dict)  contain cocid and file name
    """
    try:
        ttcl_labfileheader_info = (
            ttcl_labfileheader.select()
            .where(
                ttcl_labfileheader.fileid == file_id,
                ttcl_labfileheader.filetype == "csv",
            )
            .order_by(ttcl_labfileheader.fileid.desc())
            .first()
        )
        if ttcl_labfileheader_info:
            response = {
                "cocid": ttcl_labfileheader_info.cocid,
                "filename": ttcl_labfileheader_info.filename,
            }

        print(f"response: {response}")

        return response
    except Exception as e:
        print(f"get_file_name_report: {e}")


def get_lab_name_report_by_cocid(coc_id, is_cocid=True):
    """
    Definition:
        - This function to get lab name from cocid
    
    Args:  
        - coc_id: (str) Input cocid paramate value 
        - is_cocid: (bool) If True is COC case else Non-COC case
          
    Returns:
        - labname: (str) labname of COC 
    """
    try:
        if is_cocid:
            ttcl_labfileheader_info = (
                ttcl_labfileheader.select()
                .where(
                    ttcl_labfileheader.cocid == coc_id,
                    ttcl_labfileheader.filetype == "csv",
                )
                .first()
            )
            if ttcl_labfileheader_info:
                return ttcl_labfileheader_info.labname
        else:
            ttcl_labfileheader_info = (
                ttcl_labfileheader.select()
                .where(
                    ttcl_labfileheader.fileid == coc_id,
                    ttcl_labfileheader.filetype == "csv",
                )
                .first()
            )
            if ttcl_labfileheader_info:
                return ttcl_labfileheader_info.labname

        return ""
    except Exception as e:
        print(f"get_file_name_report_by_fileid: {e}")


def get_lab_sample_name_by_cocid(coc_id, is_cocid: bool = True):
    """
    Definition:
        - This function to get samples data from cocid
    
    Args:  
        - coc_id: (str) Input cocid paramate value 
        - is_cocid: (bool) If True is COC case else Non-COC case
          
    Returns:
        - response: (dict) list sample data 
    """
    try:
        response = []
        __query = ""
        if is_cocid:
            __query = f""" select distinct a1.barcode,
                                    a3.samplecombinename as sample_id,
                                    SPLIT_PART(a3.samplecombinename, '_', 1) as sample_name,
                                    a7.fromdepth as depth,
                                    (case
                                        when a7.collectiondatetime is not null then to_char(a7.collectiondatetime, 'MM/dd/yyyy')
                                        else ''
                                    end) as date,
                                    a7.samplematerialtype as strata ,
                                    (case
                                        when position('dup' in a3.samplecombinename) > 0 then null
                                        else SPLIT_PART(a3.samplecombinename, '_', 1)
                                    end) as sort_number
                            from
                                dbo.ttcl_labsample_mapping a1
                            inner join dbo.ttcl_pointsampletest a2 on
                                a1.barcode = a2.barcode
                            inner join dbo.ttcl_cocdetails a3 on
                                a3.samplebarcodeid = a2.samplebarcodeid
                            inner join dbo.clsurveysamplecontainer a6 on
                                a6.labcode = a2.barcode
                            inner join dbo.clsurveysample a7 on
                                a7.sampleid = a6.sampleid
                            where a1.cocid = '{coc_id}' and a1.barcode != ''
                            order by
                                (case
                                    when position('dup' in a3.samplecombinename) > 0 then null
                                    else SPLIT_PART(a3.samplecombinename, '_', 1)
                                end) asc nulls last,
                                a7.fromdepth asc """
        else:
            __query = f"""  select 
                                distinct '' as barcode, 
                                a4.labsamplename as sample_id, 
                                a4.labsamplename as sample_name, 
                                SPLIT_PART(a4.labsamplename, ' ', 1), 
                                'non' as depth, 
                                (case 
                                    when a5.dateregistered is not null then to_char(a5.dateregistered, 'MM/dd/yyyy') 
                                    else '' 
                                end) as date, 
                                'non' as strata,
                                (case when POSITION('dup' IN  a4.labsamplename) > 0 then null else SPLIT_PART(a4.labsamplename, '_', 1) end) as sort_number
                            from dbo.ttcl_labfiledetail a4 
                            inner join dbo.ttcl_labfileheader a5 on a5.fileid = a4.fileid 
                            where a5.fileid = '{coc_id}'
                            order by (case when POSITION('dup' IN  a4.labsamplename) > 0 then null else SPLIT_PART(a4.labsamplename, '_', 1) end) ASC NULLS LAST, 
                                    SPLIT_PART(a4.labsamplename, ' ', 1) ASC """

        __query = __query.replace('\n', ' ')

        # print(f"get_lab_sample_name_by_cocid __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)

        # print(f"get_lab_sample_name_by_cocid - response: {response}")

        return response
    except Exception as e:
        print(f"get_lab_sample_name_by_cocid error: {e}")
        return errorResponse(400, "Exception: get_lab_sample_name_by_cocid")
 
def get_ttcl_labfiledetail_by_cocid_barcode(coc_id, barcode, is_cocid: bool = True):
    """
    Definition:
        - This function to get samples data by barcode
    
    Args:  
        - coc_id: (str) Input cocid paramate value 
        - is_cocid: (bool) If True is COC case else Non-COC case
          
    Returns:
        - response: (dict) list sample data 
    """
    try:
        response = []
        __query = ""
        if is_cocid:
            __query = f"""  select  
                                a3.samplecombinename as samplename,  
                                a4.labcategoryname,  
                                a4.labtestname as testcode,  
                                a4.unit,  
                                a4.result,  
                                a4.resultasnumeric,  
                                a4.resultmathoperation,  
                                a4.asbestosdetected  
                            from dbo.ttcl_labsample_mapping a1  
                            inner join dbo.ttcl_pointsampletest a2 on a1.barcode = a2.barcode  
                            inner join dbo.ttcl_cocdetails a3 on a3.samplebarcodeid = a2.samplebarcodeid  
                            inner join dbo.ttcl_labfiledetail a4 on a4.labsamplename = a1.labsamplename  
                            inner join dbo.ttcl_labfileheader a5 on a5.fileid = a4.fileid  
                            left join dbo.ttcl_testcodemapping a6 on a6.labtestname = a4.labtestname  
                            where a5.cocid = '{coc_id}'  
                                and a1.barcode is not null  
                                and a1.barcode = '{barcode}'  
                            order by a4.fileid """
        else:
            __query = f""" select 
                                a4.labsamplename as samplename, 
                                a4.labcategoryname, 
                                a4.labtestname as testcode, 
                                a4.unit, 
                                a4.result, 
                                a4.resultasnumeric, 
                                a4.resultmathoperation, 
                                a4.asbestosdetected 
                            from dbo.ttcl_labfiledetail a4 
                            inner join dbo.ttcl_labfileheader a5 on a5.fileid = a4.fileid 
                            left join dbo.ttcl_testcodemapping a6 on a6.labtestname = a4.labtestname 
                            where a5.fileid = '{coc_id}' 
                            order by a4.fileid """

        __query = __query.replace('\n', ' ') 

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)
 
        return response
    except Exception as e:
        print(f"get_ttcl_labfiledetail_by_cocid_barcode: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def get_rows_template_excel(payload, coc_id, is_cocid: bool = True, __lab_name="Hill"):
    """
    Definition:
        - This function gets testcode and test category data of coc and lab name.
    
    Args:  
        - payload: Input paramater select criteria and condition filter
        - coc_id: (str) Input cocid paramate value 
        - is_cocid: (bool) If True is COC case else Non-COC case
        - __lab_name: (str) lab name (Hill, Analytica, Eurofill ..)
          
    Returns:
        - response: (dict) list criteria data 
    """
    try:
        criterias = payload["criteria"]
        _businesscriteriacodes = []
        if criterias is not None and len(criterias) > 0:
            for criteria in criterias:
                if "businesscriteriacode" in criteria:
                    _businesscriteriacodes.append(
                        criteria["businesscriteriacode"])

        __str = ""
        if len(_businesscriteriacodes) > 0:
            for item in _businesscriteriacodes:
                __str = __str + f"'{item}',"

        response = []
        if is_cocid:
            __query = f"""  select coalesce(B.testname, A.labtestname) as labtestname, 
                                    B.categorydescription, 
                                    A.testcode_key, 
                                    B.testname as btestname, 
                                    A.labtestname as atestname, 
                                    A.unit, 
                                    B.visible, 
                                    B.testcode, 
                                    B.sequence 
                            from ( 
                                select distinct concat(tl.labtestname, '_', tl.labcategoryname) as testcode_key, 
                                    tl.labtestname, 
                                    tl.labcategoryname, 
                                    tl.unit 
                                from dbo.ttcl_labfiledetail tl 
                                inner join dbo.ttcl_labfileheader tlfh on tlfh.fileid = tl.fileid 
                                inner join dbo.ttcl_labsample_mapping tlm on tlm.labsamplename = tl.labsamplename 
                                inner join dbo.ttcl_pointsampletest tpst on tpst.barcode = tlm.barcode 
                                where tlm.cocid = '{coc_id}') as A 
                            left join ( 
                                select distinct concat(ttcm.labtestname, '_', ttcm.labcategoryname) as testcode_key, 
                                    tc.categorydescription, 
                                    tn.testname, 
                                    tn.visible, 
                                    bct.testcode, 
                                    tn.sequence  
                                from dbo.ttcl_businesscriteriatest bct 
                                inner join dbo.ttcl_businesscriteria bc on bc.businesscriteriacode = bct.businesscriteriacode 
                                inner join dbo.ttcl_testcodemapping ttcm on ttcm.testcode = bct.testcode 
                                inner join dbo.ttcl_testname tn on tn.testcode = bct.testcode 
                                inner join dbo.ttcl_testcategory tc on tc.testcategorycode = tn.testcategorycode 
                                where bc.businesscriteriacode in ({ __str[:-1] }) 
                                and ttcm.labname = '{__lab_name}' and bct.active = true) as B on A.testcode_key = B.testcode_key 
                            order by B.categorydescription, B.sequence, B.testname """
        else:
            if __lab_name == "Analytica":
                __query = f"""select  
                                coalesce(B.testname, A.labtestname) as labtestname,  
                                A.labcategoryname as categorydescription,  
                                A.testcode_key,  
                                B.testname as btestname,  
                                A.labtestname as atestname,  
                                A.unit,  
                                B.visible  
                            from (  
                                select  
                                    distinct concat(tl.labtestname, '_', tl.labcategoryname) as testcode_key,  
                                    tl.labtestname,  
                                    tl.labcategoryname,  
                                    tl.unit  
                                from dbo.ttcl_labfiledetail tl  
                                inner join dbo.ttcl_labfileheader tlfh on tlfh.fileid = tl.fileid  
                                where tlfh.fileid = '{coc_id}') as A  
                            left join (  
                                select  
                                    distinct concat(ttcm.labtestname, '_', ttcm.labcategoryname) as testcode_key,  
                                    tc.categorydescription,  
                                    tn.testname,  
                                    tn.visible   
                                from dbo.ttcl_businesscriteriatest bct  
                                inner join dbo.ttcl_businesscriteria bc on bc.businesscriteriacode = bct.businesscriteriacode  
                                inner join dbo.ttcl_testcodemapping ttcm on ttcm.testcode = bct.testcode  
                                inner join dbo.ttcl_testname tn on tn.testcode = bct.testcode  
                                inner join dbo.ttcl_testcategory tc on tc.testcategorycode = tn.testcategorycode  
                                where bc.businesscriteriacode in ({ __str[:-1] }) and ttcm.labname = '{__lab_name}') as B  on A.testcode_key = B.testcode_key  
                            order by labtestname """

            else:
                __query = f""" select 
                                    coalesce(B.testname, A.labtestname) as labtestname, 
                                    B.categorydescription, 
                                    A.testcode_key, 
                                    B.testname as btestname, 
                                    A.labtestname as atestname, 
                                    A.unit, 
                                    B.visible, 
                                    B.sequence 
                                from 
                                    ( 
                                    select 
                                        distinct concat(tl.labtestname, '_', tl.labcategoryname) as testcode_key, 
                                        tl.labtestname, 
                                        tl.labcategoryname, 
                                        tl.unit 
                                    from dbo.ttcl_labfiledetail tl 
                                    inner join dbo.ttcl_labfileheader tlfh on tlfh.fileid = tl.fileid 
                                    where tlfh.fileid = '{coc_id}') as A 
                                left join ( 
                                    select distinct concat(ttcm.labtestname, '_', ttcm.labcategoryname) as testcode_key, 
                                        tc.categorydescription, 
                                        tn.testname, 
                                        tn.visible, 
                                        tn.sequence   
                                    from dbo.ttcl_businesscriteriatest bct 
                                    inner join dbo.ttcl_businesscriteria bc on bc.businesscriteriacode = bct.businesscriteriacode 
                                    inner join dbo.ttcl_testcodemapping ttcm on ttcm.testcode = bct.testcode 
                                    inner join dbo.ttcl_testname tn on tn.testcode = bct.testcode 
                                    inner join dbo.ttcl_testcategory tc on tc.testcategorycode = tn.testcategorycode 
                                    where bc.businesscriteriacode in ({ __str[:-1] }) and ttcm.labname = '{__lab_name}') as B   on A.testcode_key = B.testcode_key 
                                    order by B.categorydescription, B.sequence, B.testname"""

        __query = __query.replace('\n', ' ')
        print(f"get_rows_template_excel __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)
        response = json.loads(results)
        response = [x for x in response if (
            x["visible"] or x["btestname"] is None)]
        return response

    except Exception as e:
        print(f"get_rows_template_excel: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def get_columns_criteria(payload, __lab_name="Hill", region_code=None):
    """
    Definition:
        - This function gets test code and test category data of criteria has selected
    
    Args:  
        - payload: Input paramater select criteria and condition filter
        - region_code: (str) Region code paramater  
        - __lab_name: (str) lab name (Hill, Analytica, Eurofill ..)
          
    Returns:
        - response: (dict) list criteria data 
    """
    try:
        __str = convert_criteria_paramaters(payload)

        response = []
        # where tb.businesscriteriacode in ({__str}) and tt.labname = '{__lab_name}' \
        __query = f"""  select
                            distinct tb.businesscriteriacode,
                            tc.criterianame,
                            tc.notecode,
                            tbg.srt,
                            tc.sequence
                        from
                            dbo.ttcl_businesscriteriatest tb
                        inner join dbo.ttcl_businesscriteria tc on
                            tb.businesscriteriacode = tc.businesscriteriacode
                        inner join dbo.ttcl_testname tt2 on
                            tb.testcode = tt2.testcode
                        inner join dbo.ttcl_businesscriteriaregion tbg on
                            tbg.businesscriteriacode = tc.businesscriteriacode
                        inner join dbo.ttcl_testcodemapping tt on
                            tt.testcode = tt2.testcode
                        inner join dbo.ttcl_testcategory tt3 on
                            tt3.testcategorycode = tt2.testcategorycode
                        where
                            tb.businesscriteriacode in ({__str})
                            and tt.labname = '{__lab_name}'
                            and tb.active = true
                            and tbg.regioncode = '{region_code}'
                        order by
                            tc.sequence """

        __query = __query.replace('\n', ' ')
        print(f"get_columns_criteria __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)
        return response
    except Exception as e:
        print(f"get_columns_criteria: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def get_datas_criteria(payload, __lab_name="Hill"):
    """
    Definition:
        - This function gets test code and test category data of criteria has selected
    
    Args:  
        - payload: Input paramater select criteria and condition filter 
        - __lab_name: (str) lab name (Hill, Analytica, Eurofill ..)
          
    Returns:
        - response: (dict) list criteria data 
    """
    try:
        __str = convert_criteria_paramaters(payload)
        response = []
        ground_water_level = payload["groundWaterLevel"]
        dept_contamination = payload["deptContamination"]
        soiltype = payload["soiltype"]

        __query = f"""  select concat(bct.businesscriteriacode, '_', ttcm.labtestname, '_', ttcm.labcategoryname) as bussiness_testcode_key, 
                            bct.businesscriteriacode, 
                            bct.testcode, 
                            coalesce(tcx.testvalue, bct.testvalue) as testvalue, 
                            bct.notecode 
                        from dbo.ttcl_businesscriteriatest bct  
                        inner join dbo.ttcl_businesscriteria bc on bc.businesscriteriacode = bct.businesscriteriacode  
                        inner join dbo.ttcl_testcodemapping ttcm on ttcm.testcode = bct.testcode  
                        inner join dbo.ttcl_testname tn on tn.testcode = bct.testcode  
                        inner join dbo.ttcl_testcategory tc on tc.testcategorycode = tn.testcategorycode 
                        left join dbo.ttcl_businesscriteriatestcomplex tcx on tcx.testcode = bct.testcode 
                            and bct.businesscriteriacode  = tcx.businesscriteriacode  
                            and tcx.soiltypecode ='{soiltype}'  
                            and (tcx.groundwatercode = 'NA' OR tcx.groundwatercode = '{ground_water_level}') 
                            and tcx.depthcode ='{dept_contamination}'  
                            and tcx.businesscriteriacode in ({__str})  
                        where bc.businesscriteriacode in ({__str})  
                            and ttcm.labname = '{__lab_name}'  
                        union  
                        select concat(bct.businesscriteriacode, '_', tt3.labtestname, '_', tt3.labcategoryname) as bussiness_testcode_key,  
                            bct.businesscriteriacode,  
                            bct.testcode, 
                            bct.testvalue, 
                            bct.notecode  
                        from dbo.ttcl_testname tt  
                        inner join dbo.ttcl_testcategory tt2 on tt2.testcategorycode = tt.testcategorycode  
                        inner join dbo.ttcl_testcodemapping tt3 on tt.testcode = tt3.testcode  
                        inner join dbo.ttcl_businesscriteriatest bct on bct.testcode = tt.testcode  
                        where bct.businesscriteriacode in ({__str}) and testname like '%w/w%'  and tt3.labname like '{__lab_name}'  
                        order by businesscriteriacode"""

        __query = __query.replace('\n', ' ')
        print(f"get_datas_criteria __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)

        return response
    except Exception as e:
        print(f"get_datas_criteria: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def get_notes_text(payload):
    """
    Definition:
        - This function get  note type
    
    Args:  
        - payload: Input paramater select criteria and condition filter  
          
    Returns:
        - response: (dict) list note data 
    """
    try:
        __str = convert_criteria_paramaters(payload)
        print(f"get_notes_text ->__criterias: {__str}")
        response = []
        __query = f"""  select 
                            B.notecode, 
                            B.notetext 
                        from 
                            ( 
                            select 
                                distinct bc.notecode, 
                                tn.notetext 
                            from dbo.ttcl_notecode tn 
                            inner join dbo.ttcl_businesscriteria bc on  bc.notecode = tn.notecode 
                            where  bc.businesscriteriacode in ({__str}) 
                        union 
                            select 
                                distinct bc.notecode, 
                                tn.notetext 
                            from dbo.ttcl_notecode tn 
                            inner join dbo.ttcl_businesscriteriatest bc on bc.notecode = tn.notecode 
                            where bc.businesscriteriacode in ({__str})) as B 
                        order by B.notecode """

        __query = __query.replace('\n', ' ')
        print(f"get_notes_text __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)

        return response
    except Exception as e:
        print(f"get_notes_text: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def get_style_notes_text(payload):
    """
    Definition:
        - This function get style note text
    
    Args:  
        - payload: Input paramater select criteria and condition filter  
          
    Returns:
        - response: (dict) list note data 
    """
    try:
        __str = convert_criteria_paramaters(payload)
        __criterias = convert_criterias_paramaters(payload)

        print(f"get_style_notes_text ->__criterias: {__criterias}")

        response = []

        __query = f"""  select
                            distinct tb.businesscriteriacode,
                            tb.criterianame,
                            tb.notecode,
                            tn.notetext ,
                            AA.style,
                            tb.stylenote,
                            tn.sequence 
                        from dbo.ttcl_businesscriteria tb 
                        inner join dbo.ttcl_businesscriteriatest tb1 on tb1.businesscriteriacode = tb.businesscriteriacode 
                        inner join dbo.ttcl_notecode tn on tn.notecode = tb.notecode 
                        inner join (
                            select unnest( string_to_array('{__criterias['businesscriteriacodes']}', '|') ) as businesscriteriacode,
                                unnest( string_to_array('{__criterias['styles']}', '|')) as style) as AA on tb.businesscriteriacode = AA.businesscriteriacode 
                        where tb.businesscriteriacode in ({__str}) and tb.active = true
                        order by tn.sequence """

        __query = __query.replace('\n', ' ')
        print(f"get_notes_text __query: {__query}")

        conn = make_connection()

        results = fetch_data(conn, __query)

        response = json.loads(results)

        return response
    except Exception as e:
        print(f"get_style_notes_text: {e}")
        return errorResponse(400, "Exception: {}".format(e))


def convert_criteria_paramaters(payload):
    """
    Definition:
        - This function convert businesscriteriacode condition filter
    
    Args:  
        - payload: Input paramater select criteria and condition filter  
          
    Returns:
        - response: (str) string businesscriteriacodes
    """
    try:
        criterias = payload["criteria"]
        _businesscriteriacodes = []
        if criterias is not None and len(criterias) > 0:
            for criteria in criterias:
                if "businesscriteriacode" in criteria:
                    _businesscriteriacodes.append(
                        criteria["businesscriteriacode"])

        __str = " "
        if len(_businesscriteriacodes) > 0:
            for item in _businesscriteriacodes:
                __str = __str + f"'{item}',"

        return __str[:-1]
    except Exception as e:
        print(f'Error convert_criteria_paramaters : {e}')


def convert_criterias_paramaters(payload):
    """
    Definition:
        - This function convert businesscriteriacode condition filter
    
    Args:  
        - payload: Input paramater select criteria and condition filter  
          
    Returns:
        - response: (str) string businesscriteriacodes
    """
    try:
        criterias = payload["criteria"]
        # Get configure paramater in group criteria
        __businesscriteriacodes = ""
        __styles = ""
        if criterias is not None and len(criterias) > 0:
            _businesscriteriacodes = []
            _styles = []
            for criteria in criterias:
                if "businesscriteriacode" in criteria:
                    _businesscriteriacodes.append(
                        criteria["businesscriteriacode"])
                if "stylevalue" in criteria:
                    _styles.append(criteria["stylevalue"])

        if _businesscriteriacodes and len(_businesscriteriacodes) > 0:
            __businesscriteriacodes = "|".join(_businesscriteriacodes)
            __styles = "|".join(_styles)
        else:
            __businesscriteriacodes = ""
            __styles = ""

        return {"businesscriteriacodes": __businesscriteriacodes, "styles": __styles}
    except Exception as e:
        print(f'Error convert_criterias_paramaters : {e}')


def generate_notes_footer_vertical(worksheet, payload, row_index): 
    try:
        """
        Definition:
            - Generate note footer for veritcal lab report

        Args:
            - worksheet (worksheet): Worksheet need to write output report
            - payload (json): Paramaters user choice on UI and send to api
            - row_index (integer): Point rows can start write text 

        Returns:
            - __style_notes: List style note
            - start_note: Start note value
            - end_note: end note value
        """ 
        # generate notes footer
        # add new blank line
        # row_index = row_index + 1
        worksheet.cell(row=row_index + 1, column=1).value = "Notes:"

        worksheet.cell(
            row=row_index + 2, column=1
        ).value = "All values in mg/kg unless otherwise indicated (i.e. asbestos)."
        worksheet.cell(
            row=row_index + 3, column=1
        ).value = "'-' indicates not analysed or no relevant acceptance criteria"
        worksheet.cell(
            row=row_index + 4, column=1
        ).value = "<LOR = less than laboratory limit of reporting"
        worksheet.cell(
            row=row_index + 5, column=1
        ).value = "ND or Asbestos NOT detected' = asbestos not identified to be present by the laboratory method."
        worksheet.cell(
            row=row_index + 6, column=1
        ).value = "NL = Not limiting (i.e. >10,000 mg/kg)"
        worksheet.cell(row=row_index + 1,
                       column=1).style = "note_style_title_cell"
        worksheet.cell(row=row_index + 2, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 3, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 4, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 5, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 6, column=1).style = "define_style_left"

        # re-set value for row index
        row_index = row_index + 6

        # write note text row
        __style_notes = get_style_notes_text(payload)

        print(f"__style_notes: {__style_notes}")
        # write style note
        if __style_notes is not None:
            # add new blank line
            row_index = row_index + 1

            for note in __style_notes:
                try:
                    __text_note = f'{note["style"]} {note["stylenote"]}' 
                    worksheet.cell(row=row_index, column=1).value = __text_note #f'{get_notecode_style(note["style"])} {note["stylenote"]}'
                    worksheet.cell(row=row_index, column=1).style = (f'define_{"_".join(note["style"].lower().split(" "))}_style_left') 
                    if 'outlined' in __text_note: 
                        worksheet.cell(row=row_index + 1, column=1).value = ''
                        worksheet.row_dimensions[row_index].height = 3
                        row_index = row_index + 2
                    else: 
                        # incream row index
                        row_index = row_index + 1
                except:
                    pass 

        # write note text for footer excel file
        __text_notes = get_notes_text(payload)
        __text_notes = sorted(
            __text_notes,
            key=lambda e: (
                "z" + e["notecode"]
                if len(e["notecode"]) > 1 and e["notecode"].isnumeric()
                else ("zz" + e["notecode"] if e["notecode"] == "*" else e["notecode"])
            ),
        )
        
        # add notes: Unofficial
        unofficial_text_index = row_index + 1
        worksheet.cell(row=2, column=1).value = "Unofficial"
        worksheet.cell(row=2, column=1).style = "define_style_unofficial"
        worksheet.row_dimensions[2].height = 40
        worksheet.cell(row=unofficial_text_index, column=1).value = "Unofficial"
        worksheet.cell(row=unofficial_text_index, column=1).style = "define_style_unofficial"
        worksheet.row_dimensions[unofficial_text_index].height = 40
        
        # write text notes for report
        if __text_notes is not None:
            # add new blank line
            row_index = row_index + 3
            start_note = row_index
            end_note = row_index + len(__text_notes)
            for note in __text_notes:
                worksheet.cell(
                    row=row_index, column=1).value = f'{note["notetext"]}'
                worksheet.cell(
                    row=row_index, column=1).style = "define_style_left"
                row_index = row_index + 1
        return __style_notes, start_note, end_note
    except Exception as e:
        print(f'Error generate_notes_footer_vertical : {e}')

 
def generate_notes_footer_horizontal(worksheet, payload, row_index, criteria_length = 0):
    """
     Definition:
        - Generate note footer for horizontal lab report

    Args:
        - worksheet (worksheet): Worksheet need to write output report
        - payload (json): Paramaters user choice on UI and send to api
        - row_index (integer): Point rows can start write text
        - criteria_length: (int) length of criteria selected on UI

    Returns:
        - __style_notes: List style note
        - start_note: Start note value
        - end_note: end note value
    """ 
    try: 
        # generate notes footer 
        # add new blank line
        # row_index = row_index + 1
        worksheet.cell(row=row_index + 1, column=1).value = "Notes:"

        worksheet.cell(
            row=row_index + 2, column=1
        ).value = "All values in mg/kg unless otherwise indicated (i.e. asbestos)."
        worksheet.cell(
            row=row_index + 3, column=1
        ).value = "'-' indicates not analysed or no relevant acceptance criteria"
        worksheet.cell(
            row=row_index + 4, column=1
        ).value = "<LOR = less than laboratory limit of reporting"
        worksheet.cell(
            row=row_index + 5, column=1
        ).value = "ND or Asbestos NOT detected' = asbestos not identified to be present by the laboratory method."
        worksheet.cell(
            row=row_index + 6, column=1
        ).value = "NL = Not limiting (i.e. >10,000 mg/kg)"
        worksheet.cell(row=row_index + 1,
                       column=1).style = "note_style_title_cell"
        worksheet.cell(row=row_index + 2, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 3, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 4, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 5, column=1).style = "define_style_left"
        worksheet.cell(row=row_index + 6, column=1).style = "define_style_left"

        # re-set value for row index
        row_index = row_index + 6 
        
        # write note text row
        __style_notes = get_style_notes_text(payload) 
        print(f"__style_notes: {__style_notes}")
        
        # write style note
        if __style_notes is not None:
            # add new blank line
            row_index = row_index + 1

            for note in __style_notes:
                print(f' if __style_notes is not None: {row_index}')
                try:
                    __text_note = f'{note["style"]} {note["stylenote"]}'
                    
                    worksheet.cell(row=row_index, column=1).value = __text_note
                    worksheet.cell(row=row_index, column=1).style = (f'define_{"_".join(note["style"].lower().split(" "))}_style_left')
                    
                    if 'outlined' in __text_note: 
                        worksheet.cell(row=row_index + 1, column=1).value = ''
                        worksheet.row_dimensions[row_index + criteria_length + 2].height = 3
                        row_index = row_index + 2
                    else: 
                        # incream row index
                        row_index = row_index + 1
                except Exception as e:
                    print(f'Error generate_notes_footer_horizontal : {e}')
        
        # add notes: Unofficial 
        unofficial_text_index = row_index
        worksheet.cell(row=2, column=1).value = "Unofficial"
        worksheet.cell(row=2, column=1).style = "define_style_unofficial"
        worksheet.row_dimensions[2].height = 40
        worksheet.cell(row=unofficial_text_index, column=1).value = "Unofficial"
        worksheet.cell(row=unofficial_text_index, column=1).style = "define_style_unofficial" 
        
        # write note text for footer excel file
        __text_notes = get_notes_text(payload)
        __text_notes = sorted(
            __text_notes,
            key=lambda e: (
                "z" + e["notecode"]
                if len(e["notecode"]) > 1 and e["notecode"].isnumeric()
                else ("zz" + e["notecode"] if e["notecode"] == "*" else e["notecode"])
            ),
        )
          
        # Write text note value for footer
        if __text_notes is not None:
            # add new blank line
            row_index = row_index + 3
            start_note = row_index
            end_note = row_index + len(__text_notes)
            for note in __text_notes:
                worksheet.cell(
                    row=row_index, column=1).value = f'{note["notetext"]}'
                worksheet.cell(
                    row=row_index, column=1).style = "define_style_left"
                row_index = row_index + 1
        return __style_notes, start_note, end_note
    except Exception as e:
        print(f'Error generate_notes_footer_horizontal : {e}')


def upload_report_to_s3(format_type, coc_id):
    """
     Definition:
        - Function to upload file xlsx to S3 bucket

    Args:
        - format_type (str): Values Vertical| Horizontal
        - coc_id (str): Paramaters coc_id

    Returns:
        - report_key: (str) S3 object key file 
    """ 
    try:
        if format_type == "vertical":
            format_type = "Vertical"
        else:
            format_type = "Horizontal"

        # write file json into S3
        client = boto3.client("s3")

        filepath = f"/tmp/ResultTable_{format_type}_{coc_id}.xlsx"

        report_key = f"{coc_id}/ResultTable_{format_type}_{coc_id}.xlsx"

        file_name = f"ResultTable_{format_type}_{coc_id}.xlsx"

        # Write file xlsx into S3
        with open(filepath, "rb") as f:
            client.upload_fileobj(f, S3_BUCKET_STORAGE_COC_FILES, report_key)
            print("Upload file {0} success".format(report_key))

        # save data into table ttcl_labfileheader
        save_report_ttcl_labfileheader(coc_id=coc_id, file_name=file_name)

        return report_key

    except Exception as e:
        print(f"upload_report_to_s3 error: {e}")


def save_report_ttcl_labfileheader( coc_id, file_name ):
    """
     Definition:
        - Function to save lab file header

    Args:
        - file_name (str): Values of file name
        - coc_id (str): Paramaters coc_id

    Returns:
        - fileid: (int) file id value
    """ 
    try:
        __ttcl_labfileheader = (
            ttcl_labfileheader.select()
            .where(
                ttcl_labfileheader.cocid == coc_id,
                ttcl_labfileheader.filename == file_name,
            )
            .first()
        )
        if __ttcl_labfileheader is None:
            __lab_file_header = {
                "cocid": coc_id,
                "filename": file_name,
                "fileurl": f"s3://{S3_BUCKET_STORAGE_COC_FILES}/{coc_id}",
                "createdon": datetime.utcnow().replace(microsecond=0),
                "dateregistered": datetime.utcnow().replace(microsecond=0),
                "filetype": "xlsx",
            }
            __lab_file_header = ttcl_labfileheader.create(**__lab_file_header)

            print(f"save_report_ttcl_labfileheader: {__lab_file_header}")
            return model_to_dict(__lab_file_header)["fileid"]
        else:
            ttcl_labfileheader.update(
                {
                    ttcl_labfileheader.cocid: coc_id,
                    ttcl_labfileheader.createdon: datetime.utcnow().replace(
                        microsecond=0
                    ),
                    ttcl_labfileheader.dateregistered: datetime.utcnow().replace(
                        microsecond=0
                    ),
                }
            ).where(
                ttcl_labfileheader.filename == file_name,
                ttcl_labfileheader.fileid == __ttcl_labfileheader.fileid,
            ).execute()

            print(f"save_report_ttcl_labfileheader")
            return __ttcl_labfileheader.fileid

    except Exception as e:
        print(f"save_report_ttcl_labfileheader error: {e}")


def upload_noncoc_report_to_s3(format_type, file_id, file_name):
    """
     Definition:
        - Function to upload file xlsx to S3 bucket

    Args:
        - format_type (str): Values Vertical| Horizontal
        - file_id (str): Paramaters value of file_id
        - file_name (str): Paramaters value of file_name

    Returns:
        - report_key: (str) S3 object key file 
    """ 
    try:
        if format_type == "vertical":
            format_type = "Vertical"
        else:
            format_type = "Horizontal"

        # write file json into S3
        client = boto3.client("s3")

        filepath = f"/tmp/ResultTable_{format_type}_{file_name}.xlsx"

        report_key = f"non_cocs/ResultTable_{format_type}_{file_name}.xlsx"

        file_name = f"ResultTable_{format_type}_{file_name}.xlsx"

        # Write file sql into S3
        with open(filepath, "rb") as f:
            result = client.upload_fileobj(
                f, S3_BUCKET_STORAGE_COC_FILES, report_key)
            print(f" Upload file to S3: {result}")
            print("Upload file {0} success".format(report_key))

        # save data into table ttcl_labfileheader
        save_noncoc_report_ttcl_labfileheader(
            file_id=file_id, file_name=file_name)

        # return s3 key lab file report
        return report_key

    except Exception as e:
        return errorResponse(400, "Exception: {}".format(e))


def save_noncoc_report_ttcl_labfileheader(file_id, file_name):
    """
     Definition:
        - Function to save lab file header

    Args:
        - file_name (str): Values of file name
        - file_id (str): Paramaters file_id

    Returns:
        - fileid: (int) file id value
    """ 
    try:
        __ttcl_labfileheader = (
            ttcl_labfileheader.select()
            .where(
                ttcl_labfileheader.cocid == "-1",
                ttcl_labfileheader.filename == file_name,
            )
            .first()
        )

        print(
            f"save_noncoc_report_ttcl_labfileheader - __ttcl_labfileheader : {__ttcl_labfileheader}"
        )
        if __ttcl_labfileheader is None:
            __lab_file_header = {
                "cocid": "-1",
                "filename": file_name,
                "fileurl": f"s3://{S3_BUCKET_STORAGE_COC_FILES}/non_cocs",
                "filetype": "xlsx",
                "createdon": datetime.utcnow().replace(microsecond=0),
                "dateregistered": datetime.utcnow().replace(microsecond=0),
            }
            file_header_obj = ttcl_labfileheader.create(**__lab_file_header)
            print(f"file_header_obj: {file_header_obj}")
            return model_to_dict(file_header_obj)["fileid"]
        else:
            __lab_file_header = {
                "cocid": "-1",
                "createdon": datetime.utcnow().replace(microsecond=0),
                "dateregistered": datetime.utcnow().replace(microsecond=0),
            }

            ttcl_labfileheader.update(
                {
                    ttcl_labfileheader.cocid: -1,
                    ttcl_labfileheader.createdon: datetime.utcnow().replace(
                        microsecond=0
                    ),
                    ttcl_labfileheader.dateregistered: datetime.utcnow().replace(
                        microsecond=0
                    ),
                }
            ).where(
                ttcl_labfileheader.filename == file_name,
                ttcl_labfileheader.fileid == __ttcl_labfileheader.fileid,
            ).execute()

            print(f"file_header_obj: {__ttcl_labfileheader}")
            return __ttcl_labfileheader.fileid

    except Exception as e:
        print(f"Error save_noncoc_report_ttcl_labfileheader error: {e}")


def intersection(list_a, list_b):
    """
     Definition:
        - Function to intersect list to other list

    Args:
        - list_a (list): Values of list a
        - list_b (list): Values of list b

    Returns:
        - len: (int) counter intersect list to other list
    """ 
    try:
        return len([e for e in list_a if e in list_b])
    except Exception as e:
        print(f"Error intersection error: {e}")


def hamilton_complex_critia_value(businesscriteriacode, testcode, sgv_soil_type, sgv_soil_age):
    """
     Definition:
        - Function to get hamilton complex criteria value

    Args:
        - businesscriteriacode: (str) Values of businesscriteriacode
        - testcode:  (str) Values of test code
        - sgv_soil_type: (str) Values of sgv_soil_type
        - sgv_soil_age: (str) Values of sgv_soil_age

    Returns:
        - value: (str) value of  hamilton complex criteria
    """ 
    try:
        htn_record = (
            ttcl_businesscriteriatest_htn_complex.select(
                ttcl_businesscriteriatest_htn_complex.value
            )
            .where(
                ttcl_businesscriteriatest_htn_complex.businesscriteriacode
                == businesscriteriacode,
                ttcl_businesscriteriatest_htn_complex.testcode == testcode,
                ttcl_businesscriteriatest_htn_complex.sgvsoiltype == sgv_soil_type,
                ttcl_businesscriteriatest_htn_complex.sgvsoilage == sgv_soil_age,
            )
            .first()
        )
        if htn_record:
            return htn_record.value
        return ""
    except Exception as e:
        print(f"Error hamilton_complex_critia_value: {e}")
        return ""


def christchurch_BG_complex_critia_value(testcode, chc_BG_soil_type, chc_BG_region):
    """
     Definition:
        - Function to get christchurch BG complex critia value 

    Args: 
        - testcode:  (str) Values of test code
        - chc_BG_soil_type: (str) Values of chc_BG_soil_type
        - chc_BG_region: (str) Values of chc_BG_region

    Returns:
        - value: (str) value of christchurch BG complex critia
    """ 
    try:
        bg_record = (
            ttcl_businesscriteriatest_chcbg_complex.select(
                ttcl_businesscriteriatest_chcbg_complex.value
            )
            .where(
                ttcl_businesscriteriatest_chcbg_complex.testcode == testcode,
                ttcl_businesscriteriatest_chcbg_complex.soiltype == chc_BG_soil_type,
                ttcl_businesscriteriatest_chcbg_complex.region == chc_BG_region,
            )
            .first()
        )

        print(
            f"christchurch_BG_complex_critia_value - bg_record: {bg_record} ")

        if bg_record:
            return bg_record.value
        return ""
    except Exception as e:
        print(f"Error christchurch_BG_complex_critia_value: {e}")
        return ""


def apply_smart_criteria(criteria_value, businesscriteriacode, testcode, payload):
    """
     Definition:
        - Function to get apply smart criteria

    Args: 
        - criteria_value: (str) Values of criteria value
        - businesscriteriacode: (str) Values of businesscriteriacode
        - testcode:  (str) Values of test code
        - payload: (any) Values of payload input

    Returns:
        - criteria_value: (str) value of smart criteria
    """
    try:
        business_criterias_selected_list = payload["criteria"]
        business_criterias = []
        for criteria in business_criterias_selected_list:
            business_criterias.append(criteria["businesscriteriacode"])
        is_commercial = "NESSGVsC" in business_criterias  # NES Commercial / Industrial
        is_recreational = "NESSGVRE" in business_criterias  # NES Recreational
        is_high_density = "NESSGVsHDR" in business_criterias  # NES High Density Residential
        is_residential_10 = (
            "NESSGsVR" in business_criterias
        )  # NES Residential (10 % produce)
        is_residential_25 = (
            "NESSGVRLB" in business_criterias
        )  # NES Rural Residential / lifestyle block (25% produce)

        sgv_soil_type = payload["waikatoSoiltype"] if "waikatoSoiltype" in payload else None
        sgv_soil_age = (
            payload["waikatoFreshAged"] if "waikatoFreshAged" in payload else None
        )
        sgv_gain_size = (
            payload["waikatoGrainOfSize"] if "waikatoGrainOfSize" in payload else None
        )
        chc_BG_soil_type = (
            payload["canterburySoiltype"] if "canterburySoiltype" in payload else None
        )
        chc_BG_region = payload["canterburyArea"] if "canterburyArea" in payload else None
        is_site_urban = (
            payload["canterburyIsSiteUrban"]
            if "canterburyIsSiteUrban" in payload
            else False
        )

        # Canterbury PAH(Polycylic Aromatic Hydrocarbons) logic
        canterbury_val = "<LoR"
        if ("canterbury_PAH_Logic_" in criteria_value) and is_site_urban:
            start_index = criteria_value.rindex("_") + 1
            canterbury_val = criteria_value[start_index:]
            criteria_value = "canterbury_PAH_Logic"
        elif ("canterbury_PAH_Logic_" in criteria_value) and (not is_site_urban):
            canterbury_val = "<LoR"
            criteria_value = "canterbury_PAH_Logic"
        else:
            pass
        residential_citerias = [
            "NESSGVsC",
            "NESSGVRE",
            "NESSGVsHDR",
            "NESSGsVR",
            "NESSGVRLB",
        ]
        residential_criteria_count = intersection(
            business_criterias, residential_citerias)

        if criteria_value == "CyanideLogic":
            """
            1. If NES commercial/industrial is selected – than 8 is put into the AUP criteria.
            2. If NES Recreational or any of the Residential is selected – than 0.9 is put into the AUP criteria.
            3. If BOTH of the above is selected it puts in the conservative value of 0.9 into the AUP criteria.
            """
            # has_other_residential = is_recreational or is_high_density or is_residential_10 or is_residential_25
            if is_commercial and residential_criteria_count == 1:
                criteria_value = "8"
            else:
                criteria_value = "0.9"
        elif criteria_value == "TotalPCBLogic":
            """
            1. If NES Residential 25% is selected – than put in 0.5
            2. If NES Recreational, High Density Residential or Residential 10% is selected – than put in 1.3 to the AUP criteria
            3. If NES commercial/industrial is selected – than 33 is put into the AUP criteria.
            4. If more than one of the above is selected it puts in the conservative value
            """
            if is_commercial:
                criteria_value = "33"
            if is_recreational or is_high_density or is_residential_10:
                criteria_value = "1.3"
            if is_residential_25:
                criteria_value = "0.5"
        elif criteria_value == "TetrachloroLogic":
            """
            1. If NES commercial/industrial is selected – than 0.5 is put into the AUP criteria.
            2. If NES Recreational, High Density Residential or Residential 10% is selected – than put in 0.2 to the AUP criteria
            3. If NES Residential 25% is selected – than put in 0.1
            4. If more than one of the above is selected it puts in the conservative value most conservative value
            """
            if is_commercial:
                criteria_value = "0.5"
            if is_recreational or is_high_density or is_residential_10:
                criteria_value = "0.2"
            if is_residential_25:
                criteria_value = "0.1"
        elif criteria_value == "LindaneLogic":
            """
            1. If NES commercial/industrial is selected – than 14180 is put into the AUP criteria.
            2. If NES Recreational is selected - than 1370 is put into the AUP criteria
            3. If High Density Residential  is selected - than 707 is put into the AUP criteria
            4. If Residential 10% is selected – than put in 139 to the AUP criteria
            5. If NES Residential 25% is selected – than put in 33 in the AUP criteria
            6. If more than one of the above is selected it puts in the most conservative value.
            BUT this will vary between what options are selected
            """
            if is_commercial:
                criteria_value = "14000"
            if is_recreational:
                criteria_value = "1400"
            if is_high_density:
                criteria_value = "700"
            if is_residential_10:
                criteria_value = "140"
            if is_residential_25:
                criteria_value = "33"
        elif criteria_value == "DieldrinLogic":
            """
            1. If NES commercial/industrial is selected – than 190 is put into the AUP criteria.
            2. If NES Recreational is selected - than 23 is put into the AUP criteria
            3. If High Density Residential  is selected - than 12 is put into the AUP criteria
            4. If Residential 10% is selected – than put in 2.7 to the AUP criteria
            5. If NES Residential 25% is selected – than put in 0.7 in the AUP criteria
            6. If more than one of the above is selected it puts in the most conservative value.
            BUT this will vary between what options are selected
            """
            if is_commercial:
                criteria_value = "190"
            if is_recreational:
                criteria_value = "23"
            if is_high_density:
                criteria_value = "12"
            if is_residential_10:
                criteria_value = "2.7"
            if is_residential_25:
                criteria_value = "0.7"
        elif criteria_value == "ccLogic":
            return hamilton_complex_critia_value(
                businesscriteriacode, testcode, sgv_soil_type, sgv_soil_age
            )
        elif criteria_value == "C15-C36_Logic":
            criterias_lst = ["HTN_Eco_SGVs_NFPL",
                             "HTN_Eco_SGVs_AL", "HTN_Eco_SGVs_RRA"]
            if businesscriteriacode in criterias_lst:
                if sgv_gain_size == "Fine":
                    return "1300"
                if sgv_gain_size == "Coarse":
                    return "300"
            if businesscriteriacode == "HTN_Eco_SGVs_CI":
                if sgv_gain_size == "Fine":
                    return "2500"
                if sgv_gain_size == "Coarse":
                    return "1700"
        elif criteria_value == "canterbury_BGC_Logic":
            return christchurch_BG_complex_critia_value(
                testcode, chc_BG_soil_type, chc_BG_region
            )
        elif criteria_value == "canterbury_PAH_Logic":
            return canterbury_val

        return criteria_value
    except Exception as e:
        print(f"Error apply_smart_criteria: {e}")
        return ''


def generate_presigned_url(key=None, expiration=3600):
    """
     Definition:
        - Function to generate presigned url

    Args: 
        - key: (str) Values of s3 key object
        - expiration: (str) Values of expiration 

    Returns:
        - response: (str) value presigned url
    """
    response = ""

    try:
        # Generate a presigned S3 POST URL
        s3_client = boto3.client("s3", region_name="ap-southeast-2")

        # get response url
        response = s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": S3_BUCKET_STORAGE_COC_FILES,
                "Key": key,
                "ResponseContentDisposition": "attachment",
            },
            ExpiresIn=expiration,
        )

        print(f"generate_presigned_url response: {response}")
    except ClientError as e:
        print(f"generate_presigned_url method error: {e}")
        return None
    # The response contains the presigned URL and required fields
    return response

def get_date_from_sample_name(input_str):
    """
    Definition:
        - Get date as string type from Sample name by regex

    Inputs:
        input_str (str): Sample name

    Returns:
        str: Date as string type if not match date regex return 'non'
    """
    date_regex = r"\d{2,}.[A-Za-z]{3,9}.+\d{4}"
    date_match = regex.findall(date_regex, input_str)
    if len(date_match) > 0:
        return date_match[0]
    return "non"
