import json
from src.model.testtype.testtype_dto import TestTypeModel
from src.shared.common import successResponse, errorResponse
from src.shared.db_util import make_connection, fetch_data

def handler(event, context):
    """
    Definition:
        - Function to create logic COC
    
    Args:
        - event: Contains input paramaters of testcategory information.
        - context: Default parameters of lambda function
    
    Returns:
        - errorResponse object if status code is equals 400 (Handling failed)
        - successResponse object if status code is equal 200 and list TestTypeModel object (Handling success)
    """
    try:
        testcategory = event['queryStringParameters']['testcategory']
        response = []
        conn = make_connection()
        query_get_all_testtype = "SELECT *, testcode as text FROM dbo.ttcl_testtype WHERE active = true AND testcategory = '%s'  order by testcode " % (testcategory)
        results = fetch_data(conn, query_get_all_testtype)
        conn.close()
        res_dict = json.loads(results)
        parent_dict = [x for x in res_dict if  x["parenttestid"] == None]
        has_parent_dict = [x for x in res_dict if  x["parenttestid"] != None]

        child_dict = [x["parenttestid"] for x in res_dict if  x["parenttestid"] != None]
        parent_ids = list(set(child_dict))

        for index, item in enumerate(parent_dict):
            if item["testid"] in parent_ids:
                parent = TestTypeModel(**item)
                parent.child = [x for x in has_parent_dict if  x["parenttestid"] == item["testid"]]
                response.append(parent.__dict__)
            else:
                response.append(TestTypeModel(**item).__dict__)

        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))