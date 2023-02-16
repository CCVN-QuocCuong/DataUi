from io import StringIO
import csv
import json
import boto3
from botocore.exceptions import ClientError
import os
import logging
from datetime import date, datetime
from decimal import Decimal
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

#Creating Session With Boto3.
s3_resource = boto3.resource('s3')
     
def get_standard_dataframe(df, del_newline_flg=True):
    """
    Definition:
        - Replace the characters that create newlines

    Args:
        - df (Dataframe): Dataframe needs to be normalized
        - del_newline_flg (bool, optional): If equal False, not standardard. Defaults to True.

    Returns:
        - Dataframe: Standarded Dataframe
    """
    if del_newline_flg:
        df.replace(to_replace=[r"\\n|\\r", "\n|\r"], value=["",""], regex=True, inplace=True)
    return df


def get_string_buffer_from_dataframe(df, index=False, quoting=csv.QUOTE_MINIMAL):
    """
    Definition:
        - Convert dataframe to stringIO

    Args:
        - df (Dataframe): Dataframe needs to be converted
        - index (bool, optional): Write row names (index). Defaults to False.
        - quoting: optional constant from csv module. Defaults to csv.QUOTE_MINIMAL.

    Returns:
        - StringIO: String Buffer from Dataframe
    """
    buffer = StringIO()
    df.to_csv(buffer, index=index, quoting=quoting)
    return buffer.getvalue()


def get_standard_key(key):
    """
    Definition:
        - Get standard key to store S3

    Args:
        - key (string): Key needs to be normalized

    Returns:
        - string: S3 standard key 
    """
    return key.replace('-','_').lower()


def save_object_to_s3(key, bucket_name, body_data):
    """
    Definition:
        - Store object into S3

    Args:
        - key (string): Object archive path
        - bucket_name (string): Bucket name
        - body_data (string): string buffer content

    Returns:
        - boolean: True if success
    """
    s3 = boto3.client('s3')
    try:
        s3.put_object(Key=key, Bucket=bucket_name, Body=body_data)
        return True
    except Exception as e:
        print(e)
        return False


def get_all_object_by_key(prefix, bucket_name):
    """
    Definition:
        - Get all object by prefix

    Args:
        - prefix (string): Limits the response to keys that begin with the specified prefix.
        - bucket_name (string): Bucket name to list.

    Returns:
        - list: List of objects
    """
    s3 = boto3.client('s3')
    rs = []
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket_name, Prefix=prefix)
    for page in pages:
        for obj in page['Contents']:
            rs.append(obj['Key'])
    return rs
    
def delete_objects(bucket, object_keys):
    """
    Definition:
        - Removes a list of objects from a bucket.

    Args:
        - bucket (string): The bucket that contains the objects. This is a Boto3 Bucket resource.
        - object_keys (string): The list of keys that identify the objects to remove.

    Returns:
        - The response that contains data about which objects were deleted and any that could not be deleted.
    """
    try:
        response = bucket.delete_objects(Delete={
            'Objects': [{
                'Key': key
            } for key in object_keys]
        })
        if 'Deleted' in response:
            logger.info(
                "Deleted objects '%s' from bucket '%s'.",
                [del_obj['Key'] for del_obj in response['Deleted']], bucket.name)
        if 'Errors' in response:
            logger.warning(
                "Could not delete objects '%s' from bucket '%s'.", [
                    f"{del_obj['Key']}: {del_obj['Code']}"
                    for del_obj in response['Errors']],
                bucket.name)
    except ClientError:
        logger.exception("Couldn't delete any objects from bucket %s.", bucket.name)
        raise
    else:
        return response
 
def check_str_contains_upper(string):
    """
    Definition:
        - Check if there is an uppercase character in the string

    Args:
        - string (string): Input string

    Returns:
        - boolean: True if there is an uppercase character in the string
    """
    for x in string:
        if x.isupper():
            return True
    return False   
    
def add_new_col_value(df, colname, value):
    """
    Definition:
        - Add new column with value into Dataframe

    Args:
        - df (Dataframe): Dataframe needs to be normalized
        - colname (string): Name of new column
        - value (any): Value of new column

    Returns:
        - Dataframe: Dataframe after added new column
    """
    if colname not in df.columns:
        df.insert(0, colname, value)
    return df

def get_clean_row_text(row_text, count_empty):
    """
    Definition:
        - Add new column with value into Dataframe

    Args:
        - df (Dataframe): Dataframe needs to be normalized
        - colname (string): Name of new column
        - value (any): Value of new column

    Returns:
        - Dataframe: Dataframe after added new column
    """
    row_text = row_text.replace("\r\n", "").replace("\xa0", " ")
    if count_empty > 2:
        s_multi_plus = ',""' * (count_empty + 1)
        s_multi_sub = ',""' * (count_empty - 1)
        row_text = row_text.replace(s_multi_plus, "")
        row_text = row_text.replace(count_empty, "")
        row_text = row_text.replace(s_multi_sub, "")
    row_text=row_text.strip()
    if row_text[-1] == ",":
        i = 1
        n = len(row_text)
        _idx= 0
        while i <= n:
            if row_text[-i] != ',':
                _idx = -i
                break
            i+=1
        if _idx == 0:
            return '', ''
        return row_text[:_idx + 1], row_text[_idx+1:] 
    return row_text, ''

def get_cell_clean(cell_text):
    """
    Definition:
        - Function clear data (trim, replace characters [, "])

    Args: 
        - cell_text (str): Value of cell

    Returns:
        - str: Results value 
    """
    return cell_text.strip().replace(',', '').replace('"', '')

def get_test_code_clean(test_code):
    """
    Definition:
        - Function clear data (trim, replace characters [, "])

    Args: 
        - cell_text (str): Value of cell

    Returns:
        - str: Results value 
    """
    return test_code.strip().replace("[", "").replace("]", "").replace('"', '')