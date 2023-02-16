import json
import os
import boto3
import pandas as pd
from io import StringIO
from datetime import datetime, timedelta
from src.api.ui.analytica.get_credentials import get_secret
import numpy as np
import src.api.ui.analytica.data_handler as dh
import re
from datetime import datetime
import psycopg2


bucket_name = os.environ['DATAUI_FILES_STORAGE']

analytica_overview_path = "analytica_overview/{filename}/analytica_overview.csv"
analytica_samples_path = "analytica_samples/{filename}/analytica_samples.csv"
analytica_results_path = "analytica_results/{filename}/analytica_results.csv"
noncoc_analytica_output_file_path ="non_cocs/{filename}/{filename}.csv"
coc_analytica_output_file_path ="{cocid}/{filename}/{filename}.csv"

db_username, db_password = get_secret()
hostname = os.environ['DB_HOST']
table_name = "dbo.ttcl_labfileheader"
table_name2 = "dbo.ttcl_labfiledetail"
database_name = os.environ['DB_NAME']


def result_numeric(row):
    """
    Definition:
    Function extract and convert string value of result to float value.
    
    Args:
      row: (dict) Contains the values of the columns to be converted 
    
    Returns:
      - val: (str) return value after performing the conversion 
    """
    
    value = str(row['Result'])
    val_len = len(str(row['Result']).replace('.', ''))
    if (val_len > 0):
        if value[0] == '<' or value[0] == '>':
            val = str(row['Result'])
            val = re.findall("([-+]?\d*\.?\d+)", val)
            val = float(val[0])
            val = f"{val:.4f}"
        else:
            val = row['ResultAsNumeric']
    else:
        val = row['ResultAsNumeric']
    return val

def handler(event, context):
    """
    Definition:
    The function that performs file reading from S3 is triggered. 
    Then perform the extraction, process the logical steps to save the corresponding data to the tables ttcl_labfileheader, ttcl_labfiledetail, ttcl_notification
    
    Args:
      event: Contains information about the s3 object key that was triggered
      context: Default parameters of lambda function
    
    Returns:
      - statusCode = 400 if error handling.
      - statusCode = 200 if processing was successful.
    """
    
    try:
        s3_client = boto3.client('s3')
        s3 = boto3.resource('s3')

        bucket = event['Records'][0]['s3']['bucket']['name']

        print(f"bucket: {bucket}")

        csv_file_name = event['Records'][0]['s3']['object']['key']

        print(f"csv_file_name: {csv_file_name}")

        # if file not csv break step process
        if csv_file_name.endswith('.csv') and 'analytica_overview.csv' in csv_file_name: 
            
            string_outputs_file =StringIO()
             
            print('Pass case analytica_overview.csv')
            folder_name = csv_file_name.split("/")[1]
            print(folder_name)
            csv_object = s3_client.get_object(Bucket=bucket, Key=csv_file_name)
            file_reader = csv_object['Body'].read().decode("utf-8") 
            overview_df = pd.read_csv(StringIO(file_reader))
            
            string_outputs_file.write("\n")
            string_outputs_file.write(StringIO(file_reader).getvalue())
            string_outputs_file.write("\n")

            csv_object2 = s3_client.get_object(
                Bucket=bucket, Key=analytica_samples_path.format(filename=folder_name))
            file_reader2 = csv_object2['Body'].read().decode("utf-8") 
            sample_df = pd.read_csv(StringIO(file_reader2))
            string_outputs_file.write("\n")
            string_outputs_file.write(StringIO(file_reader2).getvalue())
            
            # copy and write file csv 3
            csv_object3 = s3_client.get_object(
                Bucket=bucket, Key=analytica_results_path.format(filename=folder_name))  
            file_reader3 = csv_object3['Body'].read().decode("utf-8")
            result_df = pd.read_csv(StringIO(file_reader3))
            string_outputs_file.write("\n")
            string_outputs_file.write(StringIO(file_reader3).getvalue()) 
            
            #### create ttcl_labfileheader dataframe and insert into database########
            job_id = folder_name.upper()
            conn = psycopg2.connect(
                database=database_name, user=db_username, password=db_password, host=hostname, port='5432'
            )

            ttcl_labfileheader = overview_df[[
                'jobId', 'clientRegistrationReference', 'clientOrderNumber', 'registeredDateTime', 'status']]
            date_time = (datetime.now() - timedelta(hours=0,
                        minutes=30)).replace(microsecond=0)
            date_time = date_time.isoformat()
            ttcl_labfileheader = ttcl_labfileheader.assign(CreatedOn=date_time)
            ttcl_labfileheader = ttcl_labfileheader.assign(LabName='Analytica')
           
            # add csv ext
            ttcl_labfileheader['FileName'] = ttcl_labfileheader['jobId'] + ".csv"
            ttcl_labfileheader['FileType'] = "csv"
          
            # Check cocid exists in database 
            __cocid = ttcl_labfileheader['clientRegistrationReference'][0]
            print(f"__cocid: {__cocid}")
            
            __exists_cocid = dh.get_cocid(__cocid, conn) 
            print(f"__exists_cocid: {__exists_cocid}")
            
            # In case this coc_id already exists in the database, save the file to the coc_id folder otherwise, save it to the non_coc folder
            if __exists_cocid is  None:
                ttcl_labfileheader['clientRegistrationReference'] = -1  
                # save new file into S3
                s3.Object(bucket_name, noncoc_analytica_output_file_path.format(filename=folder_name)).put(Body=string_outputs_file.getvalue())
                ttcl_labfileheader['FileURL'] = f"s3://{bucket_name}/non_cocs/{folder_name}/{folder_name}.csv"
            else:
                s3.Object(bucket_name, coc_analytica_output_file_path.format(cocid=__cocid, filename=folder_name)).put(Body=string_outputs_file.getvalue())
                ttcl_labfileheader['FileURL'] = f"s3://{bucket_name}/{__cocid}/{folder_name}/{folder_name}.csv" 
            
            ttcl_labfileheader = ttcl_labfileheader.rename(
                {'jobId': 'LabJobNumber', 'clientOrderNumber': 'TTJobNo', 'clientRegistrationReference': 'COCID', 'registeredDateTime': 'DateRegistered'}, axis=1)
         
            ttcl_labfileheader = ttcl_labfileheader.reindex(
                ['FileName', 'FileType', 'FileURL', 'CreatedOn', 'LabName', 'LabJobNumber', 'COCID', 'TTJobNo', 'DateRegistered', 'status'], axis=1)
          
            ttcl_labfileheader.columns = [x.lower()
                                        for x in ttcl_labfileheader.columns]
            ttcl_labfileheader = ttcl_labfileheader.replace(
                r'^\s*$',  '', regex=True)
            dh.execute_values(conn, ttcl_labfileheader, table_name)

            # Create ttcl_labfiledetail dataframe and insert into database 
            result_df = pd.merge(result_df, sample_df[['matrix', 'sampleId', 'labSampleReference']],
                                left_on='labSampleReference', right_on='labSampleReference', how='left')
            ttcl_labfiledetail = result_df[['matrix', 'sampleId', 'labSampleReference', 'procedureReference', 'procedureName1',
                                            'analyteReference', 'analyteName1', 'analyteName2', 'numericResult', 'textResult', 'resultPrefix', 'units']]
            ttcl_labfiledetail = ttcl_labfiledetail.rename({'matrix': 'labsampletype', 'sampleId': 'SampleId', 'procedureName1': 'LabCategoryName', 'analyteName1': 'LabTestName', 'units': 'Unit', 'textResult': 'Result',
                                                        'labSampleReference': 'LabSampleName', 'resultPrefix': 'ResultMathOperation', 'numericResult': 'ResultAsNumeric', 'analyteReference': 'LabTestCode', 'procedureReference': 'LabCategoryCode'}, axis=1)
            conditions = [
                ((ttcl_labfiledetail['analyteName2'] == '(Presence / Absence)') & (
                    (ttcl_labfiledetail['LabTestName'] == 'Trace Asbestos') | (ttcl_labfiledetail['LabTestName'] == 'Asbestos'))),
                ((ttcl_labfiledetail['analyteName2'] == '(Presence / Absence)') & (
                    (ttcl_labfiledetail['LabTestName'] == 'Trace Asbestos') | (ttcl_labfiledetail['LabTestName'] == 'Asbestos'))),
            ]
            values = [ttcl_labfiledetail['Result'], ttcl_labfiledetail['Result']]
            ttcl_labfiledetail['AsbestosDetected'] = np.select(
                conditions, values, default='')
            ttcl_labfiledetail['Result'] = ttcl_labfiledetail['Result'].fillna('')
            ttcl_labfiledetail['ResultAsNumeric'] = ttcl_labfiledetail.apply(
                result_numeric, axis=1)

            fileid = dh.get_fileid(job_id, conn)
            ttcl_labfiledetail['FileID'] = dh.get_fileid(job_id, conn)
            ttcl_labfiledetail = ttcl_labfiledetail.reindex(['LabResultID', 'FileID', 'LabSampleName', 'LabCategoryName', 'LabCategoryCode', 'LabTestName',
                                                            'analyteName2', 'LabTestCode', 'Unit', 'Result', 'ResultAsNumeric', 'ResultMathOperation', 'AsbestosDetected', 'SampleId', 'labsampletype'], axis=1)
            ttcl_labfiledetail = ttcl_labfiledetail.replace(
                r'^\s*$',  '', regex=True)
            
            ttcl_labfiledetail = ttcl_labfiledetail.drop('analyteName2', axis=1)
            ttcl_labfiledetail = ttcl_labfiledetail.drop('LabResultID', axis=1)
            
            ttcl_labfiledetail.columns = [x.lower()
                                        for x in ttcl_labfiledetail.columns]
            
            print(f'ttcl_labfiledetail.columns: {ttcl_labfiledetail.columns}')

            dh.execute_values(conn, ttcl_labfiledetail, table_name2)

            # Insert into data ttcl_notification 
            __values = ''
            if __exists_cocid is not None and __exists_cocid != '':
                __values = (__cocid, fileid, 'transformed', False, f"Transformed of file {job_id}.csv successed.", datetime.utcnow(
                ).replace(microsecond=0), datetime.utcnow().replace(microsecond=0))
            else:
                __values = (-1, fileid, 'transformed', False, f"Transformed of file {job_id}.csv successed.", datetime.utcnow(
                ).replace(microsecond=0), datetime.utcnow().replace(microsecond=0))

            insert_query = """ INSERT INTO dbo.ttcl_notification (cocid, fileid, status, isread, message, created, lastmodified) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING ttcl_notificationid """
            print(dh.insert_data(conn, insert_query, __values))

            conn.close()

        return {
            'statusCode': 200,
            'body': json.dumps('Hello from Lambda!')
        }
    except Exception as e:
        print(f'write_db function exception error: {e}')
        raise e
