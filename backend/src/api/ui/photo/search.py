import json 
from src.model.photo.photo_dto import PhotoFilterModel, PhotoResponseModel
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data_with_paramaters , fetch_counter_data_with_paramaters

def handler(event, context):
    """
    Definition:
        - Function to search Photos list by PhotoFilterModel paramaters input.  
    
    Args:
        - event: Contains input PhotoFilterModel paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and response (dict) (Handling success)
    """
    try:
        response = {}
        data = []
        filter_payload = json.loads(event['body'])
        photo_filter_object = PhotoFilterModel(**filter_payload)
        
        print(f'photo_filter_object: {photo_filter_object}')
        conn = make_connection()
        
        __paramaters = []
         
        query_filter = "select photoid as id, jobnumber, siteid, siteaddress, staff, collectiondate, samplename, objective, filetype, fromdepth, todepth, filename, url, created \
                        from ( \
                                SELECT CLSurveyPointPhoto.photoid, CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff,  \
                                    P.collectiondate, P.PointName as samplename,  \
                                    CLSurvey.objective, 'Point Photo' AS filetype, null AS fromdepth, null AS todepth,  \
                                    CLSurveyPointPhoto.filename, CLSurveyPointPhoto.url, CLSurvey.created \
                                FROM  dbo.CLSurvey  \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID  \
                                INNER JOIN dbo.CLSurveyPointPhoto on P.PointId = CLSurveyPointPhoto.PointId \
                                WHERE CLSurveyPointPhoto.url is not null \
                            UNION  \
                                SELECT CLSurveySamplePhoto.photoid , CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff, \
                                    P.collectiondate, P.PointName as samplename, \
                                    CLSurvey.objective, 'Sample Photo' AS filetype, S.fromdepth, S.todepth, \
                                    CLSurveySamplePhoto.filename, CLSurveySamplePhoto.url, CLSurvey.created \
                                FROM dbo.CLSurvey \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID \
                                INNER JOIN dbo.CLSurveySample S on P.PointId = S.PointId \
                                INNER JOIN dbo.CLSurveySamplePhoto on S.SampleId = CLSurveySamplePhoto.SampleId \
                                WHERE CLSurveySamplePhoto.url is not null \
                            UNION \
                                SELECT CLSurveyGeologyPhoto.photoid, CLSurvey.jobnumber, CLSurvey.siteid, CLSurvey.siteaddress, P.staff, \
                                    P.collectiondate, P.PointName as samplename, \
                                    CLSurvey.objective, 'Soil Photo' AS filetype, G.fromdepth, G.todepth, \
                                    CLSurveyGeologyPhoto.filename, CLSurveyGeologyPhoto.url, CLSurvey.created \
                                FROM dbo.CLSurvey \
                                INNER JOIN dbo.CLSurveyPoint P on CLSurvey.SurveyId = P.SurveyID \
                                INNER JOIN dbo.CLSurveyGeology G on P.PointId = G.PointId \
                                INNER JOIN dbo.CLSurveyGeologyPhoto on G.GeologyId = CLSurveyGeologyPhoto.GeologyId \
                                WHERE CLSurveyGeologyPhoto.url is not null \
                        ) as Res WHERE 1 = 1"
        query_counter = "select count(1) \
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
            query_counter += "  AND TO_CHAR(collectiondate, 'YYYYMMDD') >= '{}' ".format(photo_filter_object.fromdate)
        
        if photo_filter_object.todate != '':
            query_filter += "  AND TO_CHAR(collectiondate, 'YYYYMMDD') <= '{}' ".format(photo_filter_object.todate)
            query_counter += "  AND TO_CHAR(collectiondate, 'YYYYMMDD') <= '{}' ".format(photo_filter_object.todate)
            
        # input samples into list
        if photo_filter_object.samples != '':
            __str = ''
            for item in photo_filter_object.samples.split('|'):
                __str = __str + f"\'{item}\'," 
                
            query_filter += f"  AND samplename in ({ __str[:-1] }) "
            query_counter += f"  AND samplename in ({ __str[:-1] }) "
            
        if photo_filter_object.jobnumber != '': 
            photo_filter_object.jobnumber = f"%{photo_filter_object.jobnumber}%"
            query_filter += "  AND jobnumber ILIKE %s" 
            query_counter += "  AND jobnumber ILIKE %s" 
            __paramaters.append(photo_filter_object.jobnumber) 
                
        if photo_filter_object.siteid != '':
            photo_filter_object.siteid = f"%{photo_filter_object.siteid}%"
            query_filter += "  AND siteid ILIKE %s" 
            query_counter += "  AND siteid ILIKE %s" 
            __paramaters.append(photo_filter_object.siteid) 
            
        if photo_filter_object.siteaddress != '': 
            photo_filter_object.siteaddress = f"%{photo_filter_object.siteaddress}%"
            query_filter += "  AND siteaddress ILIKE %s" 
            query_counter += "  AND siteaddress ILIKE %s" 
            __paramaters.append(photo_filter_object.siteaddress)  
            
        if photo_filter_object.objective != '':
            photo_filter_object.objective = f"%{photo_filter_object.objective}%"
            query_filter += "  AND objective ILIKE %s" 
            query_counter += "  AND objective ILIKE %s" 
            __paramaters.append(photo_filter_object.objective) 
            
        if photo_filter_object.filetype != '': 
            photo_filter_object.filetype = f"%{photo_filter_object.filetype}%"
            query_filter += "  AND filetype ILIKE %s" 
            query_counter += "  AND filetype ILIKE %s" 
            __paramaters.append(photo_filter_object.filetype) 
            
        # Order by created desc and collectiondate desc
        if photo_filter_object.orderby != '': 
            if photo_filter_object.is_asc: 
                query_filter += f" order by {photo_filter_object.orderby} asc NULLS FIRST, photoid asc"
            else:
                query_filter += f" order by {photo_filter_object.orderby} desc NULLS LAST, photoid asc"
        else:
            query_filter += " order by created desc, photoid asc"
        
        # Get offset and limit for Query
        __off_set = (photo_filter_object.page - 1) * photo_filter_object.pagesize
        print(f'__off_set: {__off_set}')
        query_filter += f" LIMIT {photo_filter_object.pagesize}  OFFSET {__off_set}"
        
        print(f'query_filter: {query_filter}')
        results = fetch_data_with_paramaters(conn, query_filter, __paramaters)
        
        print(f'query_counter: {query_counter}')
        
        total_records = fetch_counter_data_with_paramaters(conn, query_counter, __paramaters) 
        
        # close connection
        conn.close()
        
        __result_dict = json.loads(results)
        for photo in __result_dict:
            data.append(PhotoResponseModel(**photo).__dict__)
            
        # set data output for search    
        response.update({"data": 
                            {
                                "items": data
                            }, 
                         "page": photo_filter_object.page, 
                         "pagesize": photo_filter_object.pagesize,
                         "total": total_records
                         }) 

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
