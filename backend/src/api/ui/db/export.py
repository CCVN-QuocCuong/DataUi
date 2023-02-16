from datetime import datetime
import json
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data

def handler(event, context):
    """
    Definition:
    Function to execute query and export data.   
    Args:
      event:  Sql inline query string paramater
      context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and int|str value (Handling success)
    """
    try:
        table_name = json.loads(event['body'])
        if table_name!='':
            results = export_data(table_name['query'])
            return successResponse(results)
        return successResponse("Need add query in json payload")
        
    except Exception as e:
        print(f'Exception: {e}')
        return errorResponse(400, "Database connection failed due to {}".format(e))        
    
    
def export_data(table_name): 
    """
    Definition:
    Function to execute query and export json data.   
    Args:
      table_name:  Name of table need to export data 
    
    Returns:
      - empty list (Handling failed)
      - str list of insert query (Handling success)
    """
    print('start init database!!') 
    
    try:
        conn = make_connection()
        cur = conn.cursor() 
        with open("/tmp/table_dump.sql", 'w') as f:
            cur.execute("SELECT * FROM %s" % (table_name))  # change the query according to your needs
            column_names = []
            columns_descr = cur.description
            
            # Get list column name
            for c in columns_descr:
                column_names.append(c[0])
            insert_prefix = 'INSERT INTO %s (%s) VALUES ' % (table_name, ', '.join(column_names))
           
            rows = cur.fetchall()
            #print('rows: {0}'.format(rows))
            for row in rows:
                row_data = []
                for rd in row:
                    if rd is None:
                        row_data.append('NULL')
                    elif isinstance(rd, datetime):
                        row_data.append("'%s'" % (rd.strftime('%Y-%m-%d %H:%M:%S') ))
                    else:
                        row_data.append(repr(rd))
                f.write('%s (%s);\n' % (insert_prefix, ', '.join(row_data)))  # this is the text that will be put in the SQL file. You can change it if you wish.
                
        # reac file output 
        datas = []
        with open("/tmp/table_dump.sql", 'r') as f:
            datas = json.load(f)

        return datas
            
    except Exception as e:
        print(f'Exception: {e}')
        print("Database connection failed due to {}".format(e))
        return []

