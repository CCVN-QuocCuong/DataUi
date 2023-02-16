import json
from src.model.photo.photo_dto import  PhotoResponseModel
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data 

def handler(event, context):
    """
    Definition:
        - Function to get Photos list by coc_id paramater input.  
    
    Args:
        - event: Contains input coc_id paramater.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list PhotoResponseModel object (Handling success)
    """
    try: 
        coc_id = event['pathParameters']['id'] 
        print(f"coc_id: {coc_id}") 
        response = [] 
        conn = make_connection()
        query_filter = f"select cocid, jobnumber, siteid, siteaddress, staff, collectiondate, samplename, objective, filetype, fromdepth, todepth, filename, url, created \
                from (  select tc.cocid, c4.jobnumber, c4.siteid, c4.siteaddress, c3.staff, c3.collectiondate, tc2.samplecombinename as samplename, c4.objective,'Clsurvey Photo' as filetype, c1.fromdepth, c1.todepth, c6.filename, c6.url, tc.created  \
                        from dbo.ttcl_coc tc \
                        inner join dbo.ttcl_cocdetails tc2 on tc.cocid = tc2.cocid \
                        inner join dbo.ttcl_pointsampletest c2 on c2.samplebarcodeid = tc2.samplebarcodeid \
                        inner join dbo.clsurveysamplecontainer c5 on c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode \
                        inner join dbo.clsurveysample c1 on c1.sampleid = c5.sampleid \
                        inner join dbo.clsurveypoint c3 on  c1.pointid = c3.pointid \
                        inner join dbo.clsurvey c4 on c3.surveyid = c4.surveyid \
                        inner join dbo.clsurveyphoto c6 on c6.surveyid  = c4.surveyid \
                        union all \
                        select tc.cocid, c4.jobnumber, c4.siteid, c4.siteaddress, c3.staff, c3.collectiondate, tc2.samplecombinename as samplename, c4.objective,'Point Photo' as filetype, c1.fromdepth, c1.todepth, c6.filename, c6.url,  tc.created  \
                        from dbo.ttcl_coc tc \
                        inner join dbo.ttcl_cocdetails tc2 on tc.cocid = tc2.cocid \
                        inner join dbo.ttcl_pointsampletest c2 on c2.samplebarcodeid = tc2.samplebarcodeid \
                        inner join dbo.clsurveysamplecontainer c5 on c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode \
                        inner join dbo.clsurveysample c1 on c1.sampleid = c5.sampleid \
                        inner join dbo.clsurveypoint c3 on  c1.pointid = c3.pointid \
                        inner join dbo.clsurvey c4 on c3.surveyid = c4.surveyid \
                        inner join dbo.clsurveypointphoto c6 on c6.pointid  = c3.pointid  \
                        union all \
                        select tc.cocid, c4.jobnumber, c4.siteid, c4.siteaddress, c3.staff, c3.collectiondate, tc2.samplecombinename as samplename, c4.objective,'Sample Photo' as filetype, c1.fromdepth, c1.todepth, c6.filename, c6.url,  tc.created \
                        from dbo.ttcl_coc tc   inner join dbo.ttcl_cocdetails tc2 on tc.cocid = tc2.cocid  \
                        inner join dbo.ttcl_pointsampletest c2 on c2.samplebarcodeid = tc2.samplebarcodeid  \
                        inner join dbo.clsurveysamplecontainer c5 on c5.sampleid = c2.arcgissampleid and c5.labcode = c2.barcode \
                        inner join dbo.clsurveysample c1 on c1.sampleid = c5.sampleid  \
                        inner join dbo.clsurveypoint c3 on  c1.pointid = c3.pointid \
                        inner join dbo.clsurvey c4 on c3.surveyid = c4.surveyid \
                        inner join dbo.clsurveysamplephoto c6 on c6.sampleid  = c1.sampleid   \
                ) as Res where cocid = '{coc_id}' order by created desc, collectiondate desc;" 
                        
        results = fetch_data(conn, query_filter)  
        conn.close()
        
        __result_dict = json.loads(results)
        
        for photo in __result_dict:
            response.append(PhotoResponseModel(**photo).__dict__)
       
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
