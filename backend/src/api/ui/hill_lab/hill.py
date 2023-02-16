

from src.shared.common import successResponse
from src.api.ui.hill_lab.common import get_standard_dataframe, get_string_buffer_from_dataframe, get_standard_key, save_object_to_s3, get_cell_clean, get_clean_row_text, get_test_code_clean
import codecs
import boto3
import pandas as pd
import csv
import re
import json
import os
from io import StringIO
from datetime import datetime
import urllib.parse
S3_BUCKET_STORAGE_COC_FILES = os.environ['DATAUI_FILES_STORAGE']
NEW_BUCKET = os.environ['DATAUI_LAB_FILES_STORAGE']

def convert_to_unique_format(date_str):
    """
    Definition:
        - Convert date format to a specific format

    Args:
        - date_str(string): Date time value 

    Returns:
        - str: output string format datetime
    """
    date_patterns = ["%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y %H:%M", "%d-%m-%Y %H:%M", "%Y-%m-%d %H:%M"]
    for pattern in date_patterns:
        try:
            return datetime.strptime(date_str, pattern).strftime("%Y-%m-%d %H:%M:%S")
        except:
            pass
    return date_str

def get_lab_job_number_clean(job_number_text):
    """
    Definition:
        - Remove non-numeric characters from input string job_number

    Args:
        - job_number_text(str): input string job_number 

    Returns:
        - str: job number text value
    """
    job_number_text = ''.join([n for n in job_number_text if n.isdigit()])
    return job_number_text

def handle(event, retransform_flg=False):
    """
    Definition:
        - Convert data from Analytics API to tables in DataUI

    Args:
        - event (any): Content paramaters coc_id and file name input.
        - retransform_flg: retransform_flg = True, it will run the transform step again. Otherwise, run for the first time

    Returns:
        - successResponse: any object if status code is equal 200 (Handling success)
    """
    
    print("starting-------", event)
    s3_client = boto3.client('s3')
    _key = event["cocid"] + "/" + urllib.parse.unquote(event["filename"])
    # Check extension of file is csv
    quoting_flg = False # not using quoting all
    if retransform_flg:
        s3_object_cp = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
        file_reader3 = s3_object_cp['Body'].read().decode("utf-8")
        df = pd.read_csv(StringIO(file_reader3))
        columns = [x if "Unnamed:" not in x else '' for x in df.columns]
        df.columns = columns
        _df_body_data = get_string_buffer_from_dataframe(df, False, csv.QUOTE_ALL)
        save_object_to_s3(_key, NEW_BUCKET, _df_body_data)
    filename = _key.split("/")[-1]
    # Get content of csv file by key
    s3_object = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
    line_stream = codecs.getreader("latin-1")
    all_lines = line_stream(s3_object['Body'])
    count_empty = 0
    for row in all_lines:
        if '"' in row:
            quoting_flg = True
            count_empty = row.count(',""')
        break
    print(f"for checking {quoting_flg}")
    if ".csv" in _key:
        if quoting_flg:
            # Get content of csv file by key
            s3_object = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
            line_stream = codecs.getreader("latin-1")
            all_lines = line_stream(s3_object['Body'])
            # Config structure of file
            paragraphs = {
                    "title": [],
                    "overview": [],
                    "note": [],
                    "records": []
                }
            paragraphs_map = ["title", "overview", "note", "records"]
            # Define the delimiter between Overview and Result 
            paragraphs_break = "--------------------------------------"
            # Map structure for paragraphs variable
            para = 0
            for row in all_lines:
                if row.strip() == "":
                    continue
                if paragraphs_break in row:
                    para += 1
                else:
                    paragraphs[paragraphs_map[para]].append(get_clean_row_text(row, count_empty)[0])
            # Start get overview from csv file
            item_overview = {}
            # Get title in overview information
            titles = []
            for t in paragraphs["title"]:
                titles.append(t.replace('"', ''))
            item_overview["title"] = ''.join(titles)
            # Get information about the columns in the overview from the csv file 
            for ov in paragraphs["overview"]:
                _tmp = ov.split('":,"')
                if len(_tmp) == 1:
                    _tmp = ov.split(':",')
                if len(_tmp) ==  1:
                    continue
                if ('Client Reference' in _tmp[0]) or 'Client Order Number' in _tmp[0]:
                    item_overview[get_cell_clean(_tmp[0])] = get_cell_clean(_tmp[1]).split(".")[0]
                elif "File Creation Date" in _tmp[0] or "Date Registered" in _tmp[0]:
                    item_overview[_tmp[0].strip().replace('"', '')] = convert_to_unique_format(get_cell_clean(_tmp[1]))
                else:
                    item_overview[get_cell_clean(_tmp[0])] = get_cell_clean(_tmp[1])
                # item_overview[_tmp[0].strip().replace('"', '')] = _tmp[1].strip() 
            job_lab_number = item_overview["Laboratory Job Number"]
            item_overview["cocid"] = event["cocid"]
            item_overview["note"] = ''.join(paragraphs["note"])
            overview_df = pd.DataFrame([item_overview])
            overview_df = overview_df.replace({'"': ''}, regex=True)
            overview_df = get_standard_dataframe(overview_df)
            cols = ['title', 'Laboratory Job Number','Date Registered','File Creation Date','Client Order Number','Client Reference', 'cocid']
            overview_df = overview_df[cols]
            overview_df['status']=''
            overview_df['fileurl']=f's3://{S3_BUCKET_STORAGE_COC_FILES}/' + event["cocid"] + "/" + filename
            overview_df['fileid']= -1
            overview_df['filename']=filename
            overview_df = overview_df.rename({'title': 'labname', 'Laboratory Job Number': 'labjobnumber','File Creation Date':'createdon','Client Order Number':'cocidmapping','Client Reference':'ttjobno','Date Registered':'dateregistered'}, axis=1)
            overview_df = overview_df.reindex(['fileid','filename','fileurl','createdon','labname','labjobnumber','cocidmapping','ttjobno','dateregistered','status', 'cocid'], axis=1)
            overview_df_body_data = get_string_buffer_from_dataframe(overview_df, False, csv.QUOTE_ALL)
            save_object_to_s3(get_standard_key("hill_lab/" + _key.replace(".csv", "")) + "/header.csv", NEW_BUCKET, overview_df_body_data)
            # End get overview from csv file
            # Start get records from csv file
            num_records = len(paragraphs["records"])
            if num_records > 0:
                idx_sample_type = []
                for ii in range(0,num_records):
                    if "Sample Type" in paragraphs["records"][ii]:
                        idx_sample_type.append(ii)
                results = []
                for idx_type in range(0, len(idx_sample_type)):
                    sample_type = paragraphs["records"][idx_sample_type[idx_type]].replace('Sample Type:', "").replace('"', '').strip() if "Sample Type: " in paragraphs["records"][0] else ""
                    records = []
                    lab_name_lst = paragraphs["records"][idx_sample_type[idx_type] + 1].split(',"')
                    lab_number_lst = paragraphs["records"][idx_sample_type[idx_type] + 2].split(',"')
                    skip_indices = []
                    index_unit = -1
                    for i in range(len(lab_number_lst)):
                        if lab_number_lst[i] == "" or "Lab Number:" in lab_number_lst[i]:
                            if "Lab Number:" in lab_number_lst[i]:
                                index_unit = i
                            skip_indices.append(i)
                    skip_indices = sorted(skip_indices, reverse=True)
                    for idx in skip_indices:
                        if idx < len(lab_number_lst):
                            lab_number_lst.pop(idx)
                            lab_name_lst.pop(idx)
                    if idx_type == len(idx_sample_type) - 1:
                        records = paragraphs["records"][idx_sample_type[idx_type]:]
                    else:
                        records = paragraphs["records"][idx_sample_type[idx_type]: idx_sample_type[idx_type + 1]]
                    j = index_unit + 1
                    skip_values = ["", "-"]
                    for k in range(len(lab_number_lst)):
                        test_category = ""
                        for i in range(3, len(records)):
                            try:
                                item = {
                                    "job_lab_number": job_lab_number,
                                    "lab_number": lab_number_lst[k],
                                    "sample_name": lab_name_lst[k]
                                }
                                _tmp = records[i].split('","')
                                item['test_category'] = test_category
                                item['test_analyte'] = _tmp[0].strip().replace('"', '')
                                item['test_unit'] = _tmp[index_unit].strip()
                                item['test_value'] = _tmp[j].strip().replace('"', '')
                                # if item['test_value'] in skip_values:
                                #     continue
                                if "Sample Type" in item['test_analyte']:
                                    continue
                                item["sample_type"] = sample_type
                                results.append(item)
                            except:
                                test_category = records[i].strip().replace('"', '')
                        j += 1
                    
                records_df = pd.DataFrame(results)
                records_df = records_df.replace({'"': ''}, regex=True)
                records_df = get_standard_dataframe(records_df)
            if num_records > 0:
                def result_numeric(row):
                    if row['test_value'][0].isdigit() or row['test_value'][0]=='<' or row['test_value'][0]=='>':
                        val=str(row['test_value'])
                        val=re.findall("([-+]?\d*\.?\d+)", val)
                        val=float(val[0])
                        # val = (row['test_value']).str.extractall('([-+]?\d*\.?\d+)').unstack().fillna('').sum(axis=1).astype(float)
                        val=f"{val:.4f}"
                        # val = records_df['test_value'].astype('str').str.extractall('([-+]?\d*\.?\d+)').unstack().fillna('').sum(axis=1).astype(float)
                        # val=records_df.apply(lambda row: "{0:.4f}".format(float(row.ResultAsNumeric)), axis=1)
                    else:
                        val=None
                    return val
                records_df['resultasnumeric'] = records_df.apply(result_numeric, axis=1)
                
                records_df['resultmathoperation']=records_df.apply(lambda row: row.test_value[0] if row.test_value[0] in (['<','>']) else '', axis=1)
                if 'Asbestos Presence / Absence' in records_df['test_analyte'].values:
                    records_df['asbestosdetected']=records_df.loc[records_df['test_analyte']=='Asbestos Presence / Absence'].apply(lambda row: 'Not Detected' if ('asbestos not' in (row.test_value).lower()) else 'Detected', axis=1)
                else:
                    records_df['asbestosdetected'] = '' 
                records_df['labcategorycode']=''
                records_df['labtestcode ']=''
                records_df['fileid']= -1
                # records_df['labresultid']=''
                records_df = records_df.drop('job_lab_number', axis=1)
                records_df = records_df.rename({'test_category': 'labcategoryname', 'test_analyte': 'labtestname','test_unit':'unit','test_value':'result','lab_number':'labno','sample_name':'labsamplename'}, axis=1)
                records_df = records_df.reindex(['fileid','labsamplename','labcategoryname','labcategorycode','labtestname','labtestcode','unit','result','resultasnumeric','resultmathoperation','asbestosdetected'], axis=1)
                records_df_body_data = get_string_buffer_from_dataframe(records_df, False, csv.QUOTE_ALL)
                save_object_to_s3(get_standard_key("hill_lab/" + _key.replace(".csv", "")) + "/details.csv", NEW_BUCKET, records_df_body_data)
            response = {
                "header": json.loads(overview_df.to_json(orient="records")),
                "details": json.loads(records_df.to_json(orient="records"))
            }
            return successResponse(response)    
            # End get records from csv file
            # Remove the original csv file
            # s3_client.delete_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
        else:
            if ".csv" in _key:
                if "_data" in filename:
                    # Handle Eurofin
                    # Get content of csv file by key
                    s3_object = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
                    s3_object_cp = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
                    line_stream = codecs.getreader("utf-8")
                    all_lines = line_stream(s3_object['Body'])
                    ttcl_header = {
                        "labname": "Eurofin",
                        "labjobnumber": "",
                        "filename": filename,
                        "status": "",
                        "fileurl": f"s3://{S3_BUCKET_STORAGE_COC_FILES}/" + event["cocid"] + "/" + filename,
                        "cocidmapping": ""
                    }
                    lab_name_lst = []
                    lab_number_lst = []
                    headers = []
                    for row in all_lines:
                        line = row.replace("\r\n", "")
                        if line == "":
                            continue
                        if len(lab_name_lst) > 0 and len(lab_number_lst) == 0:
                            jobid_and_labnumber = line.split(",")
                            lab_job_number = get_lab_job_number_clean(jobid_and_labnumber[0])
                            lab_number_lst = jobid_and_labnumber[1:]
                            ttcl_header["labjobnumber"] = lab_job_number
                            continue
                        if len(lab_name_lst) == 0:
                            headers = line.split(",")
                            # print(header)
                            # item_overview["labname"] = headers[0]
                            lab_name_lst = headers[1:]
                            break
                    dicts = {}
                    for name in headers:
                        dicts[name] = []
                    for row in list(csv.DictReader(codecs.getreader("utf-8")(s3_object_cp["Body"]))):
                        for name in headers:
                            dicts[name].append(row[name].replace("\r\n", ""))
                    
                    df = pd.DataFrame.from_dict(dicts)
                    cols = df.columns
                    item = {
                        "fileid": -1,
                        "labsamplename": "",
                        "labcategoryname": "",
                        "labcategorycode": "",
                        "labtestname": "",
                        "labtestcode": "",
                        "unit": "",
                        "result": "",
                        "resultasnumeric": "",
                        "resultmathoperation": "",
                        "asbestosdetected": ""
                    }
                    ttcl_details = []
                    labcategoryname = ""
                    for index, row in df.iterrows():
                        if index == 0:
                            continue 
                        if not row[cols[0]].strip():
                            continue
                        category_flg = True
                        for col in cols[1:]:
                            test_value = row[col].strip()
                            if test_value:
                                category_flg = False
                                rs_as_numeric = ""
                                rs_math_opr = ""
                                rs_unit = ""
                                if test_value[0].isdigit() or test_value[0]=='<' or test_value[0]=='>':
                                    rs_as_numeric = re.findall("([-+]?\d*\.?\d+)", test_value)
                                    rs_as_numeric = float(rs_as_numeric[0])
                                    rs_as_numeric = f"{rs_as_numeric:.4f}"
                                    if not test_value[-1].isdigit():
                                        j = 1
                                        while not test_value[-j].isdigit():
                                            j +=1
                                        rs_unit = test_value[-j+1:]
                                if test_value[0]=='<' or test_value[0]=='>':
                                    rs_math_opr = test_value[0]
                                
                                ttcl_details.append({
                                    "fileid": -1,
                                    "labsamplename": col.strip(),
                                    "labcategoryname": labcategoryname.strip(),
                                    "labcategorycode": "",
                                    "labtestname": row[cols[0]].strip(),
                                    "labtestcode": "",
                                    "unit": rs_unit,
                                    "result": row[col].strip(),
                                    "resultasnumeric": rs_as_numeric,
                                    "resultmathoperation": rs_math_opr,
                                    "asbestosdetected": ""
                                })
                        if category_flg:
                            labcategoryname = row[cols[0]]
                    response = {
                        "header": [ttcl_header],
                        "details": ttcl_details
                    }
                    return successResponse(response)
                else:
                    # Get content of csv file by key
                    s3_object = s3_client.get_object(Bucket=S3_BUCKET_STORAGE_COC_FILES, Key=_key)
                    
                    # _df = pd.read_csv(response.get("Body"))
                    line_stream = codecs.getreader("latin-1")
                    all_lines = line_stream(s3_object['Body'])
                    # Config structure of file
                    paragraphs = {
                            "title": [],
                            "overview": [],
                            "note": [],
                            "records": []
                        }
                    paragraphs_map = ["title", "overview", "note", "records"]
                    # Define the delimiter between Overview and Result 
                    paragraphs_break = "--------------------------------------"
                    # Map structure for paragraphs variable
                    para = 0
                    spec_key = ""
                    for row in all_lines:
                        if row.strip() == "":
                            continue
                        if paragraphs_break in row:
                            para += 1
                        else:
                            row_clean, _numqt = get_clean_row_text(row, count_empty)
                            if row_clean != '':
                                if spec_key == '':
                                    spec_key = _numqt
                                paragraphs[paragraphs_map[para]].append(row_clean)
                    # Start get overview from csv file
                    item_overview = {}
                    # Get title in overview information
                    titles = []
                    for t in paragraphs["title"]:
                        titles.append(t) 
                    item_overview["title"] = ''.join(titles)
                    # Get information about the columns in the overview from the csv file 
                    for ov in paragraphs["overview"]:
                        _tmp = ov.split(':')
                        if len(_tmp) == 1:
                            item_overview[get_cell_clean(_tmp[0])] = ''
                            continue
                        if len(_tmp) > 2:
                            _tmp = ov.split(':,')
                        # print("t checking", _tmp)
                        if ('Client Reference' in _tmp[0]) or 'Client Order Number' in _tmp[0]:
                            item_overview[get_cell_clean(_tmp[0])] = get_cell_clean(_tmp[1]).split(".")[0]
                        elif "File Creation Date" in _tmp[0] or "Date Registered" in _tmp[0]:
                            item_overview[_tmp[0].strip().replace('"', '')] = convert_to_unique_format(get_cell_clean(_tmp[1]))
                        else:
                            item_overview[get_cell_clean(_tmp[0])] = get_cell_clean(_tmp[1])
                    item_overview["cocid"] = event["cocid"]
                    item_overview["note"] = ''.join(paragraphs["note"])
                    job_lab_number = item_overview["Laboratory Job Number"]
                    overview_df = pd.DataFrame([item_overview])
                    # overview_df = overview_df.replace({'"': ''}, regex=True)
                    # overview_df = get_standard_dataframe(overview_df)
                    cols = ['title', 'Laboratory Job Number','Date Registered','File Creation Date','Client Order Number','Client Reference', 'cocid']
                    overview_df = overview_df[cols]
                    overview_df['status']=''
                    overview_df['fileurl']=f's3://{S3_BUCKET_STORAGE_COC_FILES}/' + event["cocid"] + "/" + filename
                    overview_df['fileid']= -1
                    overview_df['filename']=filename
                    overview_df = overview_df.rename({'title': 'labname', 'Laboratory Job Number': 'labjobnumber','File Creation Date':'createdon','Client Order Number':'cocidmapping','Client Reference':'ttjobno','Date Registered':'dateregistered'}, axis=1)
                    overview_df = overview_df.reindex(['fileid','filename','fileurl','createdon','labname','labjobnumber','cocidmapping','ttjobno','dateregistered','status', 'cocid'], axis=1)
                    overview_df_body_data = get_string_buffer_from_dataframe(overview_df, False, csv.QUOTE_ALL)
                    save_object_to_s3(get_standard_key("hill_lab/" + _key.replace(".csv", "")) + "/header.csv", NEW_BUCKET, overview_df_body_data)
                    num_records = len(paragraphs["records"])
                    if num_records > 0:
                        idx_sample_type = []
                        for ii in range(0,num_records):
                            if "Sample Type" in paragraphs["records"][ii]:
                                idx_sample_type.append(ii)
                        results = []
                        for idx_type in range(0, len(idx_sample_type)):
                            sample_type = paragraphs["records"][idx_sample_type[idx_type]].replace('Sample Type:', "").replace('"', '').strip() if "Sample Type: " in paragraphs["records"][0] else ""
                            records = []
                            _key_sample_name = ",Sample Name:,"
                            _key_lab_number = ",Lab Number:,"
                            lab_name_lst = paragraphs["records"][idx_sample_type[idx_type] + 1].split(_key_sample_name)[1].split(',')
                            lab_number_lst = paragraphs["records"][idx_sample_type[idx_type] + 2].split(_key_lab_number)[1].split(',')
                            if idx_type == len(idx_sample_type) - 1:
                                records = paragraphs["records"][idx_sample_type[idx_type]:]
                            else:
                                records = paragraphs["records"][idx_sample_type[idx_type]: idx_sample_type[idx_type + 1]]
                            results = []
                            index_unit = 1
                            j = index_unit + 1
                            skip_values = ["", "-"]
                            for k in range(len(lab_number_lst)):
                                test_category = ""
                                for i in range(3, len(records)):
                                    try:
                                        item = {
                                            "job_lab_number": job_lab_number,
                                            "lab_number": lab_number_lst[k],
                                            "sample_name": lab_name_lst[k]
                                        }
                                        _tmp = records[i].split(',')
                                        test_analyze = ''
                                        if len(_tmp) <= 2:
                                            # Case "Dibenzo[a,h]anthracene",
                                            test_category = ",".join(_tmp).replace('"', '')
                                            continue
                                        else:
                                            # Case "Indeno(1,2,3-c,d)pyrene"
                                            if '"' in _tmp[0]:
                                                cates_part = [_tmp[0]]
                                                for _i in range(1, len(_tmp)):
                                                    cates_part.append(_tmp[_i])
                                                    if '"' in _tmp[_i]:
                                                        if _i == len(_tmp):
                                                            test_category = ",".join(cates_part)
                                                            continue
                                                        else:
                                                            abnomal_denta = _i
                                                            test_analyze = get_test_code_clean(",".join(cates_part))
                                                            
                                        item['test_category'] = test_category
                                        if test_analyze != '':
                                            item['test_analyte'] = test_analyze
                                            item['test_unit'] = _tmp[index_unit + abnomal_denta].strip()
                                            item['test_value'] = _tmp[j + abnomal_denta].strip().replace('"', '')
                                        else:
                                            item['test_analyte'] = get_test_code_clean(_tmp[0])
                                            item['test_unit'] = get_test_code_clean(_tmp[index_unit])
                                            item['test_value'] = get_test_code_clean(_tmp[j])
                                        # if item['test_value'] in skip_values:
                                        #     continue
                                        item["sample_type"] = sample_type
                                        results.append(item)
                                    except Exception as e:
                                        print(f"error -- {e}")
                                j += 1   
                        records_df = pd.DataFrame(results)
                    if num_records > 0:
                        def result_numeric(row):
                            try:
                                if row['test_value'][0].isdigit() or row['test_value'][0]=='<' or row['test_value'][0]=='>':
                                    val=str(row['test_value'])
                                    val=re.findall("([-+]?\d*\.?\d+)", val)
                                    val=float(val[0])
                                    val=f"{val:.4f}"
                                else:
                                    val=None
                                return val
                            except:
                                return None
                        records_df['resultasnumeric'] = records_df.apply(result_numeric, axis=1)
                        records_df['resultmathoperation']=records_df.apply(lambda row: row.test_value[0] if (len(row.test_value) > 0 and row.test_value[0] in (['<','>'])) else '', axis=1)
                        if 'Asbestos Presence / Absence' in records_df['test_analyte'].values:
                            records_df['asbestosdetected']=records_df.loc[records_df['test_analyte']=='Asbestos Presence / Absence'].apply(lambda row: 'Not Detected' if ('asbestos not' in (row.test_value).lower()) else 'Detected', axis=1)
                        else:
                            records_df['asbestosdetected'] = '' 
                        records_df['labcategorycode']=''
                        records_df['labtestcode']=''
                        records_df['fileid']= -1
                        records_df = records_df.drop('job_lab_number', axis=1)
                        records_df = records_df.rename({'test_category': 'labcategoryname', 'test_analyte': 'labtestname','test_unit':'unit','test_value':'result','lab_number':'labno','sample_name':'labsamplename', 'sample_type': 'labsampletype'}, axis=1)
                        records_df = records_df.reindex(['fileid','labsamplename','labcategoryname','labcategorycode','labtestname','labtestcode','unit','result','resultasnumeric','resultmathoperation','asbestosdetected', 'labsampletype'], axis=1)
                        records_df_body_data = get_string_buffer_from_dataframe(records_df, False, csv.QUOTE_ALL)
                        # records_df.to_csv("2.csv", index=False)
                        save_object_to_s3(get_standard_key("hill_lab/" + _key.replace(".csv", "")) + "/details.csv", NEW_BUCKET, records_df_body_data)
                    response = {
                        "header": json.loads(overview_df.to_json(orient="records")),
                        "details": json.loads(records_df.to_json(orient="records"))
                    }
                    return successResponse(response)
                
def handler(event, context): 
    """
    Definition:
        - Convert data from Analytics API to tables in DataUI

    Args:
        - event (any): Content paramaters coc_id and file name input.
        - context: Default paramater for API gateway

    Returns:
        - successResponse: any object if status code is equal 200 (Handling success)
    """
    try:
        rs = handle(event)
        return rs
    except Exception as e:
        print(e)
        return handle(event, True)

