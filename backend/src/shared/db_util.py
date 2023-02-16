from src.shared.common import get_secret
import psycopg2
import json
from psycopg2.extras import RealDictCursor
from datetime import date, datetime
from decimal import Decimal
import os

HOST= os.environ["DB_HOST"]
DB= os.environ["DB_NAME"]

def make_connection():
    """
    Definition:
        - The function to make connnection to RDS server
        
    Args:
      - None 
      
    Returns:
      - conn: (dict) connection object
    """
    conn = None
    try:
        print('make_connection')
        secret = get_secret()
        # print('Secret: '.format(secret))
        conn = psycopg2.connect(
            host = HOST,
            database = DB,
            user=secret["username"],
            password=secret["password"]
        )
    except Exception as e:
        print(f"Database connection failed due to {e}")
    return conn
    
def json_serial(obj):
    """
    Definition:
        - The function to JSON serializer for objects not serializable by default json code
        
    Args:
      - None 
      
    Returns:
      - str: Value of convert obj to str
    """  

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError ("Type %s not serializable" % type(obj))
    
def conversion(tup, dict):
    """
    Definition:
        - The function to convert tuple to dict
        
    Args:
      - tup: Parmater of tuple type
      - dict: Parmater of dict type
      
    Returns:
      - dict: Value type of dict to convert
    """  
    for x, y in tup:
        dict.setdefault(x, []).append(json.dumps(y, default=json_serial))
    return dict

def fetch_data(conn, query, values=False):
    """
    Definition:
        - The function to fetch data from query and paramaters 
        
    Args:
      - conn: Parmater of connection to RDS
      - query: Parmater of query need to get data
      - values: Parmater of paramaters to query 
      
    Returns:
      - json: Value type of json object
    """   
    result = []
    print(f"Executing: ({query})")
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            if values == False:
                print("Not have values: %s" % (query))
                cursor.execute(query)
            else:
                cursor.execute(query,(values.keys(), values.values()))
            raw = cursor.fetchall()
            for line in raw:
                result.append(dict(line))
    return json.dumps(result, default=json_serial)

def execute_query_and_commit(conn, query):
    """
    Definition:
        - The function to execute and commit from query and paramaters 
        
    Args:
      - conn: Parmater of connection to RDS
      - query: Parmater of query need to execute
      
    Returns:
      - count: Count records to effect
    """   
    try:
        print("Executing: %s" % (query))
        with conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                
                # get the number of updated rows
                count = cursor.rowcount
                
                # Commit the changes to the database
                conn.commit()
                print("%s record updated" % (count))
    except Exception as e:
        return "Database connection failed due to {}".format(e)
    return count

def fetch_data_with_paramaters(conn, query, paramaters= []):
    """
    Definition:
        - The function to fetch data from query and paramaters 
        
    Args:
      - conn: Parmater of connection to RDS
      - query: Parmater of query need to get data
      - paramaters: Parmater of paramaters to query 
      
    Returns:
      - json: Value type of json object
    """   
    result = []
    print("Executing: %s" % (query))
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor: 
            cursor.execute(query, paramaters)
            raw = cursor.fetchall()
            for line in raw:
                result.append(dict(line))
                
    return json.dumps(result, default=json_serial)

def fetch_counter_data_with_paramaters(conn, query, paramaters= []):
    """
    Definition:
        - The function to fetch data and counter data from query and paramaters 
        
    Args:
      - conn: Parmater of connection to RDS
      - query: Parmater of query need to get data
      - paramaters: Parmater of paramaters to query 
      
    Returns:
      - result: (int) Value of counter record
    """   
    result = 0
    print("Executing: %s" % (query))
    with conn:
        with conn.cursor() as cursor: 
            cursor.execute(query, paramaters)
            raw = cursor.fetchone()
            for line in raw:
                result = line
                
    return result