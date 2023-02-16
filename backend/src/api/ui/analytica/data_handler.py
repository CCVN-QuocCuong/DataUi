
import psycopg2
import psycopg2.extras as extras


def execute_values(conn, df, table):
    """
    Definition:
    Function to insert data from DataFrame into table 
    
    Args:
      conn: Connection parameter to postgres
      df: DataFrame contains information about columns and corresponding data.
      table: Name of the target table to be inserted data
    
    Returns:
      - None
    """
    tupless = [tuple(x) for x in df.to_numpy()]
    cols = ','.join(list(df.columns))
    print(f'table: {table}. cols: {cols}. tupless: {tupless}')

    # SQL query to execute
    query = "INSERT INTO %s(%s) VALUES %%s" % (table, cols)
    cursor = conn.cursor()
    try:
        extras.execute_values(cursor, query, tupless)
        conn.commit()
        print("the dataframe is inserted")
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error: %s" % error)
        cursor.close()
        raise error

def get_fileid(jobid, conn):
    """
    Definition:
    Function get file from input parameter is labjobnumber
    
    Args:
      jobid: (str) The input parameter jobid
      conn: Connection parameter to postgres
    
    Returns:
      - fileid: (int) The value of fileid 
    """
    cursor = conn.cursor()
    cursor.execute(
        '''SELECT fileid FROM dbo.ttcl_labfileheader where labjobnumber='{0}' '''.format(jobid))
    result = cursor.fetchone()
    fileid = (int(result[0]))
    print(fileid)
    cursor.close() 
    
    return fileid


def get_cocid(cocid, conn):
    """
    Definition:
    Function get coc_id from table dbo.ttcl_coc with input parameter coc_id
    
    Args:
      cocid: (str) The input parameter cocid
      conn: Connection parameter to postgres
    
    Returns:
      - The return value is str (coc_id) if this coc_id already exists in the dbo.ttcl_coc table. Otherwise returns None if not exists.
    """
    cursor = conn.cursor()
    _sql = f"SELECT cocid FROM dbo.ttcl_coc where cocid::varchar= '{cocid}';"
    print(f'get_cocid _sql: {_sql}')
    cursor.execute(_sql)
    result = cursor.fetchone()
    if result is not None:
        cocid = (str(result[0]))
        cursor.close()
        return cocid
    return None


def insert_data(conn, query, values):
    """
    Definition:
    Function to insert data from tuple values into tables
    
    Args: 
      conn: Connection parameter to postgres
      query: Pure sql statement insert data with parameters.
      values: Tuple contains a list of data to be inserted into the table
    
    Returns:
      - record_id: Returns the id of the record in the inserted table
    """
    try:
        print("Executing: %s" % (query))
        print(values)
        with conn:
            with conn.cursor() as cursor:
                cursor.execute(query, values)
                record_id = cursor.fetchone()[0] 
                count = cursor.rowcount
                print(count, "Record inserted")
                return record_id
    except Exception as error:
        print("Error: %s" % error)
        raise error
    
