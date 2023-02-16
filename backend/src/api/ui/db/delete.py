import json
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, execute_query_and_commit

def handler(event, context):
    """
    Definition:
    Function to execute query and commit to change.   
    Args:
      event:  Sql inline query string paramater
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and int|str value (Handling success)
    """
    try:
        sql_str = json.loads(event['body'])
        delete_query = sql_str['query']
        conn = make_connection()
        result = execute_query_and_commit(conn, delete_query)
        conn.close()

        return successResponse(result)
        
    except Exception as e:
        return errorResponse(400, "Database connection failed due to {}".format(e)) 
