import json
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data

def handler(event, context):
    """
    Definition:
    Function to execute sekect query and response list json data.   
    Args:
      event:  Sql inline query string paramater
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and int|str value (Handling success)
    """
    try:
        sql_str = json.loads(event['body'])
        if sql_str!='':
            conn = make_connection()
            print(sql_str['query'])
            results = fetch_data(conn, sql_str['query'])
            return successResponse(json.loads(results))
        return successResponse("Need add query in json payload")
        
    except Exception as e:
        return errorResponse(400, "Database connection failed due to {}".format(e))             

