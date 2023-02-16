import json
from src.model.photo.photo_dto import PhotoFilterModel, PhotoResponseModel
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data_with_paramaters 

def handler(event, context):
    """
    Definition:
        - Function to filter Photos list by PhotoFilterModel paramaters input.  
    
    Args:
        - event: Contains input PhotoFilterModel paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and list PhotoResponseModel object (Handling success)
    """
    try:
        response = []
        filter_payload = json.loads(event['body'])
        photo_filter_object = PhotoFilterModel(**filter_payload)
        
        print(f'photo_filter_object: {photo_filter_object}')
        conn = make_connection()
        
        __paramaters = []
         
        query_filter = "select jobnumber, siteid, siteaddress, staff, collectiondate, samplename, objective, filetype, fromdepth, todepth, filename, url, created \
                        from ( \
                                SELECT  CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff,  \
                                    P.collectiondate, P.PointName as samplename,  \
                                    CLSurvey.objective, 'Point Photo' AS filetype, null AS fromdepth, null AS todepth,  \
                                    CLSurveyPointPhoto.filename, CLSurveyPointPhoto.url, CLSurvey.created \
                                FROM  dbo.CLSurvey  \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID  \
                                INNER JOIN dbo.CLSurveyPointPhoto on P.PointId = CLSurveyPointPhoto.PointId \
                                WHERE CLSurveyPointPhoto.url is not null \
                            UNION  \
                                SELECT CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff, \
                                    P.collectiondate, P.PointName as samplename, \
                                    CLSurvey.objective, 'Sample Photo' AS filetype, S.fromdepth, S.todepth, \
                                    CLSurveySamplePhoto.filename, CLSurveySamplePhoto.url, CLSurvey.created \
                                FROM dbo.CLSurvey \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID \
                                INNER JOIN dbo.CLSurveySample S on P.PointId = S.PointId \
                                INNER JOIN dbo.CLSurveySamplePhoto on S.SampleId = CLSurveySamplePhoto.SampleId \
                                WHERE CLSurveySamplePhoto.url is not null \
                            UNION \
                                SELECT CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff, \
                                    P.collectiondate, P.PointName as samplename, \
                                    CLSurvey.objective, 'Soil Photo' AS filetype, G.fromdepth, G.todepth, \
                                    CLSurveyGeologyPhoto.filename, CLSurveyGeologyPhoto.url, CLSurvey.created \
                                FROM dbo.CLSurvey \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID \
                                INNER JOIN dbo.CLSurveyGeology G on P.PointId = G.PointId \
                                INNER JOIN dbo.CLSurveyGeologyPhoto on G.GeologyId = CLSurveyGeologyPhoto.GeologyId \
                                WHERE CLSurveyGeologyPhoto.url is not null \
                        ) as Res WHERE 1 = 1"
         
        if photo_filter_object.fromdate != '':
            query_filter += "  AND TO_CHAR(collectiondate, 'YYYYMMDD') >= '{}' ".format(photo_filter_object.fromdate)
        
        if photo_filter_object.todate != '':
            query_filter += "  AND TO_CHAR(collectiondate, 'YYYYMMDD') <= '{}' ".format(photo_filter_object.todate)
            
        # input samples into list
        if photo_filter_object.samples != '':
            __str = ''
            for item in photo_filter_object.samples.split('|'):
                __str = __str + f"\'{item}\'," 
                
            query_filter += f"  AND samplename in ({ __str[:-1] }) "
            
        if photo_filter_object.jobnumber != '': 
            photo_filter_object.jobnumber = f"%{photo_filter_object.jobnumber}%"
            query_filter += "  AND jobnumber ILIKE %s" 
            __paramaters.append(photo_filter_object.jobnumber) 
                
        if photo_filter_object.siteid != '':
            photo_filter_object.siteid = f"%{photo_filter_object.siteid}%"
            query_filter += "  AND siteid ILIKE %s" 
            __paramaters.append(photo_filter_object.siteid) 
            
        if photo_filter_object.siteaddress != '': 
            photo_filter_object.siteaddress = f"%{photo_filter_object.siteaddress}%"
            query_filter += "  AND siteaddress ILIKE %s" 
            __paramaters.append(photo_filter_object.siteaddress)  
            
        if photo_filter_object.objective != '':
            photo_filter_object.objective = f"%{photo_filter_object.objective}%"
            query_filter += "  AND objective ILIKE %s" 
            __paramaters.append(photo_filter_object.objective) 
            
        if photo_filter_object.filetype != '': 
            photo_filter_object.filetype = f"%{photo_filter_object.filetype}%"
            query_filter += "  AND filetype ILIKE %s" 
            __paramaters.append(photo_filter_object.filetype) 
            
        # add order data in query
        query_filter += " order by created desc, collectiondate desc "
        
        print(f'__paramaters: {__paramaters}')
        print(f'query_filter: {query_filter}')
        
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        # close connection
        conn.close()
        
        __result_dict = json.loads(results)
        for photo in __result_dict:
            response.append(PhotoResponseModel(**photo).__dict__)

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
