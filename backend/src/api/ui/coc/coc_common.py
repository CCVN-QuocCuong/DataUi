import json 
from src.model.sample.sample_dto import SampleModel
from src.shared.db_util import fetch_data_with_paramaters, make_connection 
from peewee import *

def get_samples(samplebarcodeids = []):
    """
    Definition:
    Function to get list samples from barcode parameter list
    
    Args:
      samplebarcodeids: parameter contain list samplebarcodeids 
    
    Returns:
      - response: list[SampleModel] output. If the data does not exist, return None
    """
    try:
        response = [] 
        # open connection to postgresql server
        conn = make_connection() 
        
        # Initialize a data query from a list of tables into the database
        query_filter = "select c1.sampleid, c3.staff as createdby, c3.collectiondate, c4.objective, c4.jobnumber, c4.siteid, c4.siteaddress, c3.pointname, fromdepth, todepth, sampletype, samplematerialtype, c5.containertype, barcode, testidlist, teststringlist, c1.created \
            from dbo.clsurveysample c1, dbo.ttcl_pointsampletest c2, dbo.clsurveypoint c3, dbo.clsurvey c4 , dbo.clsurveysamplecontainer c5 \
            where c1.pointid = c3.pointid and c3.surveyid = c4.surveyid and c1.sampleid = c5.sampleid and c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode and c2.cocprepared = true "
        
        __paramaters = [] 
        
        # Split barcode string as parameter in query
        __str = ''
        for item in samplebarcodeids:
            __str = __str + f"\'{item}\',"  
            
        # Append the condition to the data query.
        query_filter += f"  AND c2.samplebarcodeid in ({ __str[:-1] }) "
        
        # Order by created desc and collectiondate desc
        query_filter += " order by c1.created desc, c3.collectiondate desc, barcode desc"
        
        print(query_filter)
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        # Close connection       
        conn.close()
        
        # convert object to response data
        _result_dict = json.loads(results)
        for sample in _result_dict:
            # Convert json data to an object of SampleModel
            response.append(SampleModel(**sample).__dict__)

        return response
    except Exception as e:
        print(f'Run function get_samples occus error {e}')
        return None 