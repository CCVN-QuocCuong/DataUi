import json 
from playhouse.shortcuts import model_to_dict
from peewee import *
from src.shared.common import successResponse, errorResponse
from src.model.model_relation import * 
from src.model.sample.sample_dto import SampleAssignTestTypeModel


def handler(event, context):
    """
    Definition:
        - Function to assign test type for Sample.  
    
    Args:
        - event: Contains input SampleAssignTestTypeModel object paramaters.
        - context: Default parameters of lambda function
    
    Returns:
      - errorResponse object if status code is equals 400 (Handling failed)
      - successResponse object if status code is equal 200 and response (dict) (Handling success)
    """
    try:
        assign_payload = json.loads(event['body']) 
        sample_assign_obj = SampleAssignTestTypeModel(**assign_payload)
        testidlist = ''
        teststringlist = ''
        if len(sample_assign_obj.testidlist) > 0: 
            # Sort by testcode as default
            testidlist_sorted = sample_assign_obj.testidlist
            for item in testidlist_sorted:
                testidlist += str(item)
                if testidlist_sorted.index(item) != len(testidlist_sorted)-1:
                    testidlist += '.'
            print('testidlist_sorted: {}'.format(testidlist_sorted))
            print('type: {}'.format(type(testidlist_sorted)))
            print('testidlist: {}'.format(testidlist))
            results = ttcl_testtype.select().where(ttcl_testtype.testid.in_(testidlist_sorted)).order_by(
                ttcl_testtype.testcode
            )
            
            print(f'results: {results}')
            if len(results) > 0:
                ttcl_testtype_model_testidlist = [
                    model_to_dict(row) for row in results]
                metals7_ids = [20, 21, 22, 23, 24, 25, 26]
                metalshg8_ids = [27, 28, 29, 30, 31, 32, 33, 34]
                
                print(f'ttcl_testtype_model_testidlist: {ttcl_testtype_model_testidlist}')
                for item in ttcl_testtype_model_testidlist:
                    if item['parenttestid'] is not None:
                        parent_testtype = ttcl_testtype.get_by_id(
                            item['parenttestid'])
                        parent_testtype_dict = model_to_dict(parent_testtype)
                        print('parent_testtype_dict: {}'.format(
                            parent_testtype_dict))
                        if teststringlist.find(parent_testtype_dict['testcode']) != -1:
                            continue
                        # Add parent Test code
                        teststringlist += parent_testtype_dict['testcode']
                        teststringlist += ','
                    # Add childs Test code
                    else:
                        if item['testcode'] not in teststringlist:
                            teststringlist += item['testcode'] 
                            teststringlist += ',' 

                metals7_string = 'Metals('
                metals_hg8_string = 'Metals+Hg('
                print('teststringlist: {}'.format(teststringlist))

                index = 0
                while index < len(ttcl_testtype_model_testidlist):
                    if ttcl_testtype_model_testidlist[index]['testid'] in metals7_ids:
                        print('ttcl_testtype_model_testidlist[index]: {}'.format(
                            ttcl_testtype_model_testidlist[index]))
                        metals7_string += ttcl_testtype_model_testidlist[index]['testcode']
                        metals7_string += ','
                    if ttcl_testtype_model_testidlist[index]['testid'] in metalshg8_ids:
                        metals_hg8_string += ttcl_testtype_model_testidlist[index]['testcode']
                        metals_hg8_string += ','

                    index += 1
                    
                # Slice string to remove last character
                metals7_string = metals7_string[:-1:]
                metals7_string += ')'
                metals_hg8_string = metals_hg8_string[:-1:]
                metals_hg8_string += ')'

                check_assign_all_metals7 = all(
                    item in testidlist_sorted for item in metals7_ids)
                if check_assign_all_metals7 is False:
                    teststringlist = teststringlist.replace(
                        "Metals(7)", metals7_string)
                check_assign_all_metals8 = all(
                    item in testidlist_sorted for item in metalshg8_ids)
                if check_assign_all_metals8 is False:
                    teststringlist = teststringlist.replace(
                        "Metals+Hg(8)", metals_hg8_string)

        for code in sample_assign_obj.barcodes:
            pointsampletest_will_update = ttcl_pointsampletest.get(
                ttcl_pointsampletest.barcode == code)
            pointsampletest_will_update.testidlist = testidlist
            if len(teststringlist) > 0:
                # Slice string to remove last character
                if teststringlist[-1] == ',':
                    teststringlist = teststringlist[:-1:]
            pointsampletest_will_update.teststringlist = teststringlist
            pointsampletest_will_update.save()

        response = {
            "barcodes": sample_assign_obj.barcodes,
            "testidlist": testidlist,
            "teststringlist": teststringlist
        }
        return successResponse(response)
    except Exception as e:
        return errorResponse(400, "Backend error: {}".format(e))
