
import os
import requests 
from datetime import datetime,timedelta
import json
from io import StringIO
import boto3  
import csv
from pytz import timezone
import pandas as pd 
from src.api.ui.analytica.get_token import get_secret

result_df_columns=["resultId","labSampleReference","procedureReference","procedureName1","procedureName2","analyteReference","analyteName1","analyteName2","labBatchId","casNumber","numericResult","textResult","resultPrefix","quantitationLimit","units","isAccredited","modifiedDateTime","approvedOnDate","isFiltered","isLeached","isSurrogate","isInterim","approver","resultComment","methodReference","methodName","methodText","componentType","jobId"]
sample_df_columns=["sampleNumber","sampleId","labSampleReference","sampleDate","modifiedDateTime","clientSampleReference","clientSampleEid","labContainerBarcodes","sampleCondition","matrix","compositeReference","sampleComment","samplingDepth","samplesInComposite","factoryId","cowNumber","batchReference","jobId"]
overview_df_columns=["jobId","clientReference","labRegistrationReference","clientRegistrationReference","registrationDescription","numberOfSamples","clientOrderNumber","submitter","priority","samplingSite","receivedDate","registeredDateTime","finalisedDateTime","dueDate","dueOrFinalisedDate","template","finalisedBy","modifiedDateTime","analystComment","status","client_name","client_firstName","client_lastName","client_addressLine1","client_addressLine2","client_suburb","client_city","client_postCode","client_country","client_telephoneNumber","client_faxNumber","client_emailAddress","invoiceTo_name","invoiceTo_firstName","invoiceTo_lastName","invoiceTo_addressLine1","invoiceTo_addressLine2","invoiceTo_suburb","invoiceTo_city","invoiceTo_postCode","invoiceTo_country","invoiceTo_telephoneNumber","invoiceTo_faxNumber","invoiceTo_emailAddress","lab_labName","lab_exportDate","lab_exportVersion","lab_disclaimer"]

analytica_overview_path="analytica_overview/{filename}/analytica_overview.csv"
analytica_samples_path="analytica_samples/{filename}/analytica_samples.csv"
analytica_results_path="analytica_results/{filename}/analytica_results.csv"

bucket_name = os.environ['DATAUI_LAB_FILES_STORAGE']
subfolder_name1 = 'analytica_json_files/'

token = get_secret()
URL='https://api.analytica.co.nz/api/1.0/jobs/search' 

def get_jobids(params):
    """
    Definition:
    Function to get information from analytica's api from parameter list
    
    Args:
      params:  Input parameters to query data from Analytica's api like modifiedDateTime, status = 'Complete' 
    
    Returns:
      - jobs_df: DataFrame that contains the data response from the API.
      - job_number_list: Contains the list of jobId response from the API.
    """
    
    response = requests.post(URL, headers={'Authorization': token},json=params)
    jsn = response.json()
    job_count=(len(jsn['jobs']))
 
    if job_count>0:
        job_number_list=[]
        job_metadata=[]
        for i in range(job_count):
            job_metadata.append(jsn['jobs'][i]) 
        
        jobs_df = pd.DataFrame(job_metadata)
        job_number_list=jobs_df['jobId'].tolist() 
      
    else:
        jobs_df=pd.DataFrame()
        job_number_list=[]
    return jobs_df,job_number_list


def get_samples(job_id):
    """
    Definition:
    Function to get list of samples of a job_id
    
    Args:
      - job_id: (string) input parameter
    
    Returns:
      - sample_df: DataFrame that contains the samples list data.
      - jsn: Contains the data response from the API.
    """
    
    URL='https://api.analytica.co.nz/api/1.0/jobs/' + job_id
    response = requests.get(URL, headers={'Authorization': token})
    jsn = response.json()
    sample_count=(len(jsn['samples']))

    # Filter value of samples and append to sample_list
    sample_list=[]
    for i in range(sample_count):
        sample_list.append(jsn['samples'][i])

    # Convert list str to dataframe
    sample_df = pd.DataFrame(sample_list)

    return sample_df, jsn 

def get_results(job_id,sample_ids): 
    """
    Definition:
    Function get samples using Job id and sample number
    
    Args:
      - job_id: (string) input parameter
      - sample_ids: (list) list sample_id input
    
    Returns:
      - result_df: DataFrame that contains the result list data.
      - jsn: Contains the result data response from the API.
    """
    
    result_df=pd.DataFrame()
    print(sample_ids)
    for i in sample_ids:
        URL="https://api.analytica.co.nz/api/1.0/jobs/"+job_id+"/samples/"+str(i)
        response = requests.get(URL, headers={'Authorization': token})
        jsn = response.json()
        result_count=(len(jsn['results']))
        result_list=[]
        for j in range(result_count):
            result_list.append(jsn['results'][j])
            result_df=pd.concat([result_df,pd.DataFrame(result_list)])
            result_list=[]
             
    return result_df, jsn 

def handler(event, context):
    """
    Definition:
    Function get samples using Job id and sample number
    
    Args:
      - event: Default parameters of lambda function
      - context: Default parameters of lambda function
    
    Returns:
      - dict:  
        + statusCode: Value 200 
        + body: str (Done)
    """
    
    # Specify when to make the API call from now to 30 minutes ago.
    date_time = (datetime.now() - timedelta(hours=0, minutes=30)).replace(microsecond=0)
    date_time = date_time.isoformat()
    print(date_time)
    
    # Defines input parameters to make API calls.
    params={
        "searchFields": {
            "modifiedDateTime": [
            {
                "value": date_time,
                "operator": ">"
            }
            ],
            "status": "Complete"
        },
        "orderFields": [
            {
            "field": "jobId",
            "direction": "ASC"
            }
        ],
        "page": 1,
        "pageSize": 500
        } 

    i=1
    num_page=5

    job_number_list=[]
    jobs_df=pd.DataFrame()
    while(i <= num_page):
        params["page"] = i
        params["pageSize"] = 500
        job_df,job_list = get_jobids(params)
        job_number_list=job_number_list+job_list
        
        jobs_df=pd.concat([jobs_df, job_df], ignore_index=True)
       
        if len(job_number_list) == 0:
            break
        print("Done page: {}".format(i))
        i += 1
    print(job_number_list)
    if len(job_number_list)>0:
        for job_id in job_number_list:
            print(job_id)
            sample_df,overview_json=get_samples(job_id)
            sample_ids=sample_df['sampleId'].tolist()
            result_df,result_json=get_results(job_id,sample_ids)

            # Saving the output into json and csv files
            result_dict = {'overview': overview_json, 'result': result_json}
            overview_json.pop('samples', None)
            overview_json.pop('documents', None)
            overview_df = pd.json_normalize(overview_json)

            job_id_lower=job_id.lower()
            print("writing")
            s3 = boto3.resource('s3') 
            s3object = s3.Object(bucket_name, subfolder_name1+job_id_lower+"/"+job_id_lower+'.json')

            s3object.put(
                Body=(bytes(json.dumps(result_dict,indent=4).encode('UTF-8')))
            )

            csv_buffer2 = StringIO()
            sample_df['jobId']=job_id
            sample_df = sample_df.replace(r'\r+|\n+|\t+','', regex=True)
            sample_df = sample_df.replace(to_replace= r'\\', value= '', regex=True)
            sample_df=pd.DataFrame(sample_df,columns=sample_df_columns)
            sample_df.to_csv(csv_buffer2,index=False,quoting=csv.QUOTE_ALL)
            s3.Object(bucket_name, analytica_samples_path.format(filename=job_id_lower)).put(Body=csv_buffer2.getvalue())

            csv_buffer3 = StringIO()
            result_df['jobId']=job_id
            drop_column=['results']
            result_df = result_df.drop([x for x in drop_column if x in result_df.columns], axis=1)
            result_df = result_df.replace(r'\r+|\n+|\t+','', regex=True)
            result_df = result_df.replace(to_replace= r'\\', value= '', regex=True)
            result_df=pd.DataFrame(result_df,columns=result_df_columns)
            result_df.to_csv(csv_buffer3,index=False,quoting=csv.QUOTE_ALL)
            s3.Object(bucket_name, analytica_results_path.format(filename=job_id_lower)).put(Body=csv_buffer3.getvalue())
            print("done")

            overview_df.columns=overview_df.columns.str.replace('.','_',regex=True)
            csv_buffer = StringIO()
            overview_df = overview_df.replace('\n','', regex=True)
            overview_df = overview_df.replace(r'\r+|\n+|\t+','', regex=True)
            overview_df = overview_df.replace(to_replace= r'\\', value= '', regex=True)
            overview_df=pd.DataFrame(overview_df,columns=overview_df_columns)
            overview_df.to_csv(csv_buffer,index=False,quoting=csv.QUOTE_ALL)
            s3.Object(bucket_name, analytica_overview_path.format(filename=job_id_lower)).put(Body=csv_buffer.getvalue())
            ##################################################################################
        return{'statusCode':200,
                'body':json.dumps('Done')}
        
        
    

