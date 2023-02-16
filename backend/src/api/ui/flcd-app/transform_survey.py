import json 
from src.model.sample.sample_dto import SurveyModel
from src.shared.db_util import make_connection
from src.shared.db_util import execute_query_and_commit
import boto3  
from datetime import datetime  
import uuid

def handler(event, context):
    """
    Definition:
        - After the lambda function get-flcd-evn-suverys-lambda-function is executed and the json data is saved to the bucket of S3. Will trigger processing 
        to lambda function transform_surveys-lambda-function. 
        
        - The function of this lambda is to extract the stored data recursively into specific objects corresponding to the tables clsurvey,  clsurveypoint, 
        clsurveysample, clsurveysamplecontainer, ttcl_pointsampletest, clsurveygeology, clsurveypointphoto, clsurveysamplephoto, clsurveygeologyphoto. Then create 
        sql insert inline statements and create parent child relationship between tables.
        
        - Finally, execute these inline sqls to synchronously insert data into the database 
        and store these inline sql files into .sql files in the directory of the S3 bucket so that you can check the history if needed.
        
    Args:
      - event: Contains information about buckets and object keys triggered from S3
      - context: Default parameters of lambda function
    
    Returns:
      - None
    """
    
    try:
        client = boto3.client('s3')
        
        # Get the object from the event and show its content type
        # Get souce Bitbucket name
        bucket = event['Records'][0]['s3']['bucket']['name']  
        # Get path file name
        # key = urllib3.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        key = event['Records'][0]['s3']['object']['key'] 
        
        print ('key {0}'.format(key))
        
        # Only process data files whose suffix is .json
        if key.endswith('.json'): 
            
            # Get the object from the event and show its content type
            event_name = event['Records'][0]['eventName']
            
            # Case create/put file(s) or folder
            if event_name == 'ObjectCreated:Put':
                # Read json into S3
                s3_object = client.get_object(Bucket=bucket, Key=key)
                
                print('Get object S3 : {0}'.format(key))
                
                _body = s3_object['Body']
                
                # transfer data and saving into tables clsurvey  
                tranfer_data(json.load(_body))
                
                # Create new sql file and save into S3
                sql_key = key.replace('json','sql')

                # Run script insert data into database
                execute_insert_survey_data(client, bucket, sql_key)
         
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
     
def tranfer_data(clsurveys):
    """
    Definition:
        - The function is to extract the stored data recursively into specific objects corresponding to the tables clsurvey,  clsurveypoint, 
        clsurveysample, clsurveysamplecontainer, ttcl_pointsampletest, clsurveygeology, clsurveypointphoto, clsurveysamplephoto, clsurveygeologyphoto. Then create 
        sql insert inline statements and create parent child relationship between tables.  
    Args:
      - clsurveys:  json data of list object clsurvey
    
    Returns:
      - None
    """
    try: 
        suverys= []
        parent_suverys = []
        children_suverys = []
        # If json data is empty will skip step transfer data
        if not clsurveys or clsurveys == {}:
            return;  
        
        for element in clsurveys:
            suverys.append(SurveyModel(**element))

        # get mapping column
        with open("src/api/ui/flcd-app/mappings/flcd_mapping.json", 'r') as f:
            mapping_columns = json.load(f)
            mapping_fields = mapping_columns["mapping_fields"] 
            clsurvey_mapping = mapping_columns["clsurvey_mapping"] 
            clsurveypoint_mapping = mapping_columns["clsurveypoint_mapping"]
            clsurveysample_mapping = mapping_columns["clsurveysample_mapping"]
            clsurveysamplecontainer_mapping = mapping_columns["clsurveysamplecontainer_mapping"]
            
            ttcl_pointsampletest_mapping = mapping_columns["ttcl_pointsampletest_mapping"]
            
            clsurveygeology_mapping = mapping_columns["clsurveygeology_mapping"]
            clsurveypointphoto_mapping = mapping_columns["clsurveypointphoto_mapping"]
            clsurveysamplephoto_mapping = mapping_columns["clsurveysamplephoto_mapping"]
            clsurveygeologyphoto_mapping = mapping_columns["clsurveygeologyphoto_mapping"]
            
        # get all parent Suverys data
        parent_suvery_ids = [x.survey_id for x in suverys if x.parent_survey_id is None]
        
        # parent table
        clsurvey_datas= []
        clsurveypoint_datas = [] 
        clsurveypointphoto_datas = []
        
        # children tables
        clsurveysample_datas = []
        clsurveysamplecontainer_datas = [] 
        ttcl_pointsampletest_datas = [] 
        clsurveygeology_datas = []  
        clsurveysamplephoto_datas = [] 
        clsurveygeologyphoto_datas = []
        
        for survey_id in parent_suvery_ids:
            children_suverys = [x.survey_data["data"] for x in suverys if x.parent_survey_id is not None and str(survey_id) == str(x.parent_survey_id["survey_id"])]
            parent_suverys = [x.survey_data["data"] for x in suverys if x.parent_survey_id is None and str(survey_id) == str(x.survey_id)]

            # get data for parent
            results = []  
            # Init key data
            survey_id = str(uuid.uuid4())
            point_id = str(uuid.uuid4())  
            for item in parent_suverys:
                result = {}   
               
                for key, name in mapping_fields.items():
                    __expected_result = [d for d in item if d['key'].upper() == key.upper()]
                    if len(__expected_result) > 0:
                        if 'PhotoImage'.upper() == name.upper() or 'SamplePhotoImage'.upper() == name.upper() or 'SoilLoggingImage'.upper() == name.upper() : 
                            result[name] = __expected_result
                        else:
                            _value =  __expected_result[0]["value"]["value"]
                            if 'surveyid'.upper() == name.upper():
                                if _value:
                                    result[name] = __expected_result[0]["value"]["value"]
                                    survey_id = __expected_result[0]["value"]["value"]
                                else:
                                    result[name] = survey_id
                                    
                            elif 'pointid'.upper() == name.upper():
                                if _value:
                                    result[name] = __expected_result[0]["value"]["value"]
                                    point_id = __expected_result[0]["value"]["value"]
                                else:
                                    result[name] = point_id  
                            else:
                                result[name] = __expected_result[0]["value"]["value"] 
                if result:
                    results.append(result) 
       
            # Generate data for tables     
            if results:   
                for row in results: 
                    # generate data for table clsurvey
                    clsurvey_data =  __generate_clsurvey(row, clsurvey_mapping)
                    if clsurvey_data:
                        clsurvey_datas.append(clsurvey_data) 
                            
                    # generate data for table clsurveypoint 
                    clsurveypoint_data =  __generate_clsurveypoint(row, clsurveypoint_mapping)
                    if clsurveypoint_data:
                        clsurveypoint_datas.append(clsurveypoint_data)  
                    
                    # generate data for table clsurveypointphoto 
                    clsurveypointphoto_data = __generate_clsurveypointphoto(row)
                    if clsurveypointphoto_data and len(clsurveypointphoto_data) > 0:
                        for item in clsurveypointphoto_data:
                            clsurveypointphoto_datas.append(item)  
                            
            # child data 
            results = [] 
            for item in children_suverys:
                sample_id = str(uuid.uuid4())
                geology_id = str(uuid.uuid4()) 
                result = {}   
                for key, name in mapping_fields.items():
                    __expected_result = [d for d in item if key.upper() in d['key'].upper()]
                    if len(__expected_result) > 0:
                        if 'PhotoImage'.upper() == name.upper() or 'SamplePhotoImage'.upper() == name.upper() or 'SoilLoggingImage'.upper() == name.upper() : 
                            result[name] = __expected_result
                        else:
                            _value =  __expected_result[0]["value"]["value"]
                            if 'surveyid'.upper() == name.upper():
                                result[name] = survey_id
                                
                            elif 'SampleContainerBarcode'.upper() == name.upper(): 
                                result[name] = __expected_result
                                    
                            elif 'pointid'.upper() == name.upper():
                                result[name] = point_id  
                            else:
                                result[name] = __expected_result[0]["value"]["value"]
                    else:
                        if 'sampleid'.upper() == name.upper(): 
                            result[name] = sample_id
                        elif 'geologyid'.upper() == name.upper(): 
                            result[name] = geology_id
                        else:
                            result[name] = None 
                if result:
                    results.append(result) 
       
            # Generate data for tables     
            if results:   
                for row in results:  
                    #generate data for table clsurveysample 
                    clsurveysample_data =  __generate_clsurveysample(row, clsurveysample_mapping)
                    if clsurveysample_data:
                        clsurveysample_datas.append(clsurveysample_data) 
                        
                        # generate data for table clsurveysamplecontainer 
                        clsurveysamplecontainer_data =  __generate_clsurveysamplecontainer(row, clsurveysamplecontainer_mapping)
                        if clsurveysamplecontainer_data and len(clsurveysamplecontainer_data) > 0:
                            for item in clsurveysamplecontainer_data:
                                clsurveysamplecontainer_datas.append(item) 
                            
                        # generate data for table ttcl_pointsampletest 
                        ttcl_pointsampletest_data =  __generate_ttcl_pointsampletest(row) 
                        if ttcl_pointsampletest_data and len(ttcl_pointsampletest_data) > 0:
                            for item in ttcl_pointsampletest_data:
                                ttcl_pointsampletest_datas.append(item) 
                                
                        # generate data for table clsurveysamplephoto
                        clsurveysamplephoto_data = __generate_clsurveysamplephoto(row)
                        if clsurveysamplephoto_data and len(clsurveysamplephoto_data) > 0:
                            for item in clsurveysamplephoto_data:
                                clsurveysamplephoto_datas.append(item) 
                                
                            
                    # generate data for table clsurveygeology 
                    clsurveygeology_data =  __generate_clsurveygeology(row, clsurveygeology_mapping)
                    if clsurveygeology_data:
                        clsurveygeology_datas.append(clsurveygeology_data)    
                                
                        # generate data for table clsurveygeologyphoto
                        clsurveygeologyphoto_data = __generate_clsurveygeologyphoto(row)
                        if clsurveygeologyphoto_data and len(clsurveygeologyphoto_data) > 0:
                            for item in clsurveygeologyphoto_data:
                                clsurveygeologyphoto_datas.append(item)       
         
                
            # Write script into file .sql
            with open("/tmp/clsurveys.sql", 'w') as f:     
                # generate data for table dbo.clsurvey
                if len(clsurvey_datas) > 0:
                    insert_clsurvey_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurvey', ', '.join(clsurvey_mapping.values()))
                    for clsurvey_row_data in  clsurvey_datas:
                        f.write('%s (%s);\n' % (insert_clsurvey_prefix, ', '.join(clsurvey_row_data)))  
                        
                # generate data for table dbo.clsurveypoint
                if len(clsurveypoint_datas) > 0:
                    insert_clsurveypoint_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveypoint', ', '.join(clsurveypoint_mapping.values()))
                    for clsurveypoint_row_data in  clsurveypoint_datas:
                        f.write('%s (%s);\n' % (insert_clsurveypoint_prefix, ', '.join(clsurveypoint_row_data)))  
                        
                # generate data for table dbo.clsurveysample
                if len(clsurveysample_datas) > 0:
                    insert_clsurveysample_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveysample', ', '.join(clsurveysample_mapping.values()))
                    for clsurveysample_row_data in  clsurveysample_datas:
                        f.write('%s (%s);\n' % (insert_clsurveysample_prefix, ', '.join(clsurveysample_row_data)))  
                
                # generate data for table dbo.clsurveysamplecontainer
                if len(clsurveysamplecontainer_datas) > 0:
                    insert_clsurveysamplecontainer_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveysamplecontainer', ', '.join(clsurveysamplecontainer_mapping.values()))
                    for clsurveysamplecontainer_row_data in  clsurveysamplecontainer_datas:
                        f.write('%s (%s);\n' % (insert_clsurveysamplecontainer_prefix, ', '.join(clsurveysamplecontainer_row_data)))  
                
                # generate data for table dbo.ttcl_pointsampletest
                if len(ttcl_pointsampletest_datas) > 0:
                    insert_ttcl_pointsampletest_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.ttcl_pointsampletest', ', '.join(ttcl_pointsampletest_mapping.values()))
                    for ttcl_pointsampletest_row_data in  ttcl_pointsampletest_datas:
                        f.write('%s (%s);\n' % (insert_ttcl_pointsampletest_prefix, ', '.join(ttcl_pointsampletest_row_data)))  
                 
                # generate data for table dbo.clsurveygeology
                if len(clsurveygeology_datas) > 0:
                    insert_clsurveygeology_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveygeology', ', '.join(clsurveygeology_mapping.values()))
                    for clsurveygeology_row_data in  clsurveygeology_datas:
                        f.write('%s (%s);\n' % (insert_clsurveygeology_prefix, ', '.join(clsurveygeology_row_data)))    
                
                # generate data for table dbo.clsurveypointphoto
                if clsurveypointphoto_datas and len(clsurveypointphoto_datas) > 0:
                    insert_clsurveypointphoto_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveypointphoto', ', '.join(clsurveypointphoto_mapping.values()))
                    for clsurveypointphoto_row_data in  clsurveypointphoto_datas:
                        f.write('%s (%s);\n' % (insert_clsurveypointphoto_prefix, ', '.join(clsurveypointphoto_row_data)))
                        
                # generate data for table dbo.clsurveysamplephoto
                if clsurveysamplephoto_datas and len(clsurveysamplephoto_datas) > 0:
                    insert_clsurveysamplephoto_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveysamplephoto', ', '.join(clsurveysamplephoto_mapping.values()))
                    for clsurveysamplephoto_row_data in  clsurveysamplephoto_datas:
                        f.write('%s (%s);\n' % (insert_clsurveysamplephoto_prefix, ', '.join(clsurveysamplephoto_row_data)))        
                
                # generate data for table dbo.clsurveygeologyphoto
                if clsurveygeologyphoto_datas and len(clsurveygeologyphoto_datas) > 0:
                    insert_clsurveygeologyphoto_prefix = 'INSERT INTO %s (%s) VALUES ' % ('dbo.clsurveygeologyphoto', ', '.join(clsurveygeologyphoto_mapping.values()))
                    for clsurveygeologyphoto_row_data in  clsurveygeologyphoto_datas:
                        f.write('%s (%s);\n' % (insert_clsurveygeologyphoto_prefix, ', '.join(clsurveygeologyphoto_row_data)))        

        
    except Exception as e:
        print(e) 
    
   
def convert_value_before_insert(column_name, value):   
    """
    Definition:
        - The function correct data for column. 
        
    Args:
      - column_name: Column name of table
      - value: Value of column
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and message inform success or empty file (if not exists data) (Handling success)
    """
    
    # convert data column Confidential from boolean to int
    if 'confidential'.upper() in column_name.upper():
        if value == 'True':
            return repr(1) 
        return repr(0) 
    elif 'hasodourorstain'.upper() == column_name.upper() or 'isduplicate'.upper() == column_name.upper():
        if value == 'True':
            return repr(True) 
        return repr(False) 
    elif 'shape'.upper() in column_name.upper():  
            if value: 
                latlngs = value[0].get('latlngs')
                if latlngs:
                    lat = value[0].get('latlngs')[0].get('lat')
                    lng = value[0].get('latlngs')[0].get('lng') 
                    if lat and lng:
                        point = '({0}, {1})'.format(lat, lng)  
                        return repr(point)
            return 'NULL'
    elif 'fromdepth'.upper() == column_name.upper() or 'todepth'.upper() == column_name.upper():  
            if value: 
                return repr(value)
            return repr(0.0)
        
    elif 'collectiondate'.upper() == column_name.upper() or 'collectiondatetime'.upper() == column_name.upper():
        if value:
            date_string = value.replace('(Indochina Time)', '').replace('(+07)','').replace('(NZST)','').replace('(NZDT)','').rstrip()
            datetime_object = datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S.%fZ').strftime("%Y-%m-%d %H:%M:%S")
            return repr(datetime_object)
        else:
            return repr(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
    if value is None:
        return 'NULL'
    elif isinstance(value, datetime):
       return "'%s'" % (repr(value.strftime('%Y-%m-%d %H:%M:%S')))
    else: 
        return repr(value)       


def __generate_clsurvey(row, clsurvey_mapping):
    """
    Definition:
        - The function extract and mapping value for column of table clsurvey
        
    Args:
      - row: Contains column name and corresponding value of each column.
      - clsurvey_mapping: Is a dict containing the key and value of the column name of the table clsurvey
    
    Returns:
      - List object data of clsurvey
    """
    
    clsurvey_row_data = []   
    for key, value in clsurvey_mapping.items():
        if key == 'created':
            date_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
            clsurvey_row_data.append(repr(date_string)) 
        elif key == 'createdby':
            clsurvey_row_data.append(repr('JobNo')) 
        else:
            clsurvey_row_data.append(convert_value_before_insert(value, row[key])) 
                        
    return clsurvey_row_data  
    
def __generate_clsurveypoint(row, clsurveypoint_mapping):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveypoint
        
    Args:
      - row: Contains column name and corresponding value of each column.
      - clsurveypoint_mapping: Is a dict containing the key and value of the column name of the table clsurveypoint
    
    Returns:
      - List object data of clsurveypoint
    """
    
    clsurveypoint_row_data = []
    for key, value in clsurveypoint_mapping.items():
        if key == 'sampletype':
            clsurveypoint_row_data.append(repr('Soil'))
        elif key == 'created': 
            date_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
            clsurveypoint_row_data.append(repr(date_string)) 
        elif key == 'createdby':
            clsurveypoint_row_data.append(repr('JobNo'))  
        else:
            clsurveypoint_row_data.append(convert_value_before_insert(value, row[key]))
                
    return clsurveypoint_row_data

def __generate_clsurveysample(row, clsurveysample_mapping):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveysample
        
    Args:
      - row: Contains column name and corresponding value of each column.
      - clsurveysample_mapping: Is a dict containing the key and value of the column name of the table clsurveysample
    
    Returns:
      - List object data of clsurveysample
    """
    
    __labcode = row["SampleContainerBarcode"]
    if __labcode is None:
        return None
    if row['SampleFromDepth'] is None or  row['SampleToDepth'] is None:
        return None
    
    clsurveysample_row_data = []   
    for key, value in clsurveysample_mapping.items(): 
        if key == 'created': 
            date_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
            clsurveysample_row_data.append(repr(date_string)) 
        elif key == 'createdby':
            clsurveysample_row_data.append(repr('JobNo')) 
        else:
            clsurveysample_row_data.append(convert_value_before_insert(value, row[key])) 
                          
    return clsurveysample_row_data

def __generate_clsurveysamplecontainer(row, clsurveysamplecontainer_mapping):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveysamplecontainer
        
    Args:
      - row: Contains column name and corresponding value of each column.
      - clsurveysamplecontainer_mapping: Is a dict containing the key and value of the column name of the table clsurveysamplecontainer
    
    Returns:
      - List object data of clsurveysamplecontainer
    """
    
    __labcode = row["SampleContainerBarcode"]
    if __labcode is not None and type(__labcode) == list and len(__labcode) > 0: 
        clsurveysamplecontainer_rows = [] 
        for labcode in __labcode:  
            clsurveysamplecontainer_row_data = [] 
            for key, value in clsurveysamplecontainer_mapping.items():
                if key == 'SampleContainerBarcode':
                    if labcode["value"] is not None and labcode["value"]["value"] is not None:
                        clsurveysamplecontainer_row_data.append(repr(labcode["value"]["value"]))
                    else:
                        clsurveysamplecontainer_row_data = [] 
                else:
                    clsurveysamplecontainer_row_data.append(convert_value_before_insert(value, row[key]))  
                    
            # add record
            if clsurveysamplecontainer_row_data != []:
                clsurveysamplecontainer_rows.append(clsurveysamplecontainer_row_data)   
                clsurveysamplecontainer_row_data = [] 
                    
        return clsurveysamplecontainer_rows
    
    return None

def __generate_ttcl_pointsampletest(row): 
    """
    Definition:
        - The function extract and mapping value for column of table ttcl_pointsampletest
        
    Args:
      - row: Contains column name and corresponding value of each column. 
      
    Returns:
      - List object data of ttcl_pointsampletest
    """
    
    __labcode = row["SampleContainerBarcode"]
    if __labcode is not None and type(__labcode) == list and len(__labcode) > 0: 
        ttcl_pointsampletest_rows = [] 
        for labcode in __labcode:  
            ttcl_pointsampletest_row_data = []  
            ttcl_pointsampletest_row_data = [] 
            if labcode["value"] is not None and labcode["value"]["value"] is not None:
                sample_id = row["SampleID"]
                
                # mapping data arcgissampleid
                ttcl_pointsampletest_row_data.append(repr(sample_id))
                
                # mapping data barcode
                ttcl_pointsampletest_row_data.append(repr(labcode["value"]["value"]))
                
                # mapping data testidlist, teststringlist, cocprepared 
                ttcl_pointsampletest_row_data.append('NULL')
                ttcl_pointsampletest_row_data.append('NULL')
                ttcl_pointsampletest_row_data.append(repr(False))
            else:
                 ttcl_pointsampletest_row_data = []   
                    
            # add record
            if ttcl_pointsampletest_row_data != []:
                ttcl_pointsampletest_rows.append(ttcl_pointsampletest_row_data)   
                ttcl_pointsampletest_row_data = [] 
                    
        return ttcl_pointsampletest_rows

def __generate_clsurveygeology(row, clsurveygeology_mapping):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveygeology
        
    Args:
      - row: Contains column name and corresponding value of each column. 
      - clsurveygeology_mapping: Is a dict containing the key and value of the column name of the table clsurveygeology 
      
    Returns:
      - List object data of clsurveygeology
    """
    
    clsurveysamplecontainer_row_data = [] 
    
    if row['SoilLoggingDepth'] is None or  row['SoilLoggingDepthTo'] is None:
        return None
        
    for key, value in clsurveygeology_mapping.items(): 
        if key == 'created':
            date_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
            clsurveysamplecontainer_row_data.append(repr(date_string)) 
        elif key == 'createdby':
            clsurveysamplecontainer_row_data.append(repr('JobNo')) 
        else:
            clsurveysamplecontainer_row_data.append(convert_value_before_insert(value, row[key])) 
                
    return clsurveysamplecontainer_row_data

def __generate_clsurveypointphoto(row):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveypointphoto
        
    Args:
      - row: Contains column name and corresponding value of each column. 
      
    Returns:
      - List object data of clsurveypointphoto
    """
    
    try: 
        photo_image = row["PhotoImage"] 
        if photo_image is not None and len(photo_image) > 0: 
            comment  = row["Comment"]
            point_id = row["PointID"]  
            clsurveypointphoto_row_datas = []  
            
            for image in photo_image: 
                clsurveypointphoto_row_data = []
                clsurveypointphoto_row_data.append(repr(str(uuid.uuid4())) )
                clsurveypointphoto_row_data.append(repr(point_id))
                if image['value'] is not None  and type(image['value']) == list:
                    __label = image["value"][0]["label"]
                    if __label:
                        clsurveypointphoto_row_data.append(repr(__label)) 
                    else:
                        continue
                else:
                    continue
                
                if image['value'] is not None  and type(image['value']) == list:
                    __url = image["value"][0]["value"]["url"]
                    if __url:
                        clsurveypointphoto_row_data.append(repr(__url)) 
                    else:
                        continue
                else:
                    continue   
                
                # set value column comment
                if comment is not None:
                    clsurveypointphoto_row_data.append(repr(comment))
                else:
                    clsurveypointphoto_row_data.append('NULL')
                    
                # add into list
                clsurveypointphoto_row_datas.append(clsurveypointphoto_row_data)
                clsurveypointphoto_row_data = []
                
            return clsurveypointphoto_row_datas
    except Exception as e:
        print(f'Method __generate_clsurveypointphoto: {e}')  

def __generate_clsurveysamplephoto(row):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveypointphoto
        
    Args:
      - row: Contains column name and corresponding value of each column. 
      
    Returns:
      - List object data of clsurveypointphoto
    """

    try:
        photo_image = row["SamplePhotoImage"] 
        if photo_image is not None and len(photo_image) > 0: 
            sample_id = row["SampleID"]  
            clsurveysamplephoto_row_datas = []  
            for image in photo_image: 
                clsurveysamplephoto_row_data = []
                clsurveysamplephoto_row_data.append(repr(str(uuid.uuid4())) )
                clsurveysamplephoto_row_data.append(repr(sample_id)) 
                if image['value'] is not None  and type(image['value']) == list:
                    __label = image["value"][0]["label"]
                    if __label:
                        clsurveysamplephoto_row_data.append(repr(__label))  
                    else:
                        continue
                else:
                    continue
                
                if image['value'] is not None  and type(image['value']) == list:
                    __url = image["value"][0]["value"]["url"]
                    if __url:
                        clsurveysamplephoto_row_data.append(repr(__url)) 
                    else:
                        continue
                else:
                    continue   
                
                # add into list
                clsurveysamplephoto_row_datas.append(clsurveysamplephoto_row_data) 
                
            return clsurveysamplephoto_row_datas
    
        return None  
    except Exception as e:
        print(f'Method __generate_clsurveysamplephoto: {e}') 
    
def __generate_clsurveygeologyphoto(row):
    """
    Definition:
        - The function extract and mapping value for column of table clsurveygeologyphoto
        
    Args:
      - row: Contains column name and corresponding value of each column. 
      
    Returns:
      - List object data of clsurveygeologyphoto
    """
    
    try:
        photo_image = row["SoilLoggingImage"] 
        if photo_image is not None and len(photo_image) > 0 and photo_image[0]["value"] is not None: 
            geology_id = row["GeologyID"] 
            
            clsurveygeologyphoto_row_datas = []  
            for image in photo_image: 
                clsurveygeologyphoto_row_data = [] 
                clsurveygeologyphoto_row_data.append(repr(str(uuid.uuid4())) )
                clsurveygeologyphoto_row_data.append(repr(geology_id)) 
                if image['value'] is not None  and type(image['value']) == list:
                    __label = image["value"][0]["label"]
                    if __label:
                        clsurveygeologyphoto_row_data.append(repr(__label)) 
                    else:
                        continue
                else:
                    continue
                
                if image['value'] is not None  and type(image['value']) == list:
                    __url = image["value"][0]["value"]["url"]
                    if __url:
                        clsurveygeologyphoto_row_data.append(repr(__url)) 
                    else:
                        continue
                else:
                    continue   
                
                # add into list
                clsurveygeologyphoto_row_datas.append(clsurveygeologyphoto_row_data) 
                
            return clsurveygeologyphoto_row_datas
        
        return None 
    except Exception as e:
        print(f'Method __generate_clsurveysamplephoto: {e}') 
        
def execute_insert_survey_data(client, bucket, sql_key):
    """
    Definition:
        - The function read file in path /tmp/clsurveys.sql and execute sql inline then insert data in to database
        
    Args:
      - client: S3_Client object. 
      - bucket: S3 Bucket name . 
      - sql_key: sql key file. 
      
    Returns:
      - None
    """
    
    try:
        filepath = '/tmp/clsurveys.sql'
        
        # Write file sql into S3
        with open(filepath, "rb") as f:  
            client.upload_fileobj(f, bucket, sql_key)
            print('Upload file {0} success'.format(sql_key))
        
        # read file and execute insert data into database
        with open(filepath, 'r') as f: 
            lines = f.read().rstrip()
            if lines:
                conn = make_connection()
                query_insert = '{}'.format(lines)
                print('query_insert: {0}'.format(query_insert))
                result = execute_query_and_commit(conn, query_insert)
                print('result: {0}'.format(result))
                conn.close() 
            
        # return Number of records inserted
        print('Run success') 
    except Exception as e:
        print("Execute function execute_insert_survey_data error: {0}".format(e)) 
        raise e