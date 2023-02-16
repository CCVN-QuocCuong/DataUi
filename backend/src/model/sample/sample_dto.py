from pydantic import BaseModel
from typing import Any, Optional


class SampleModel(BaseModel):
    sampleid: Optional[str] = ''
    createdby: Optional[str] = ''
    collectiondate: Optional[str] = ''
    objective: Optional[str] = ''
    objectiveother: Optional[str] = ''
    jobnumber: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    pointname: Optional[str] = ''
    duplicatename: Optional[str] = ''
    fromdepth: Optional[float] = None
    todepth: Optional[float] = None
    sampletype: Optional[str] = ''
    samplematerialtype: Optional[str] = ''
    containertype: Optional[str] = ''
    barcode: Optional[str] = ''
    testidlist: Optional[str] = ''
    teststringlist: Optional[str] = ''
    created: Optional[str] = ''


class SampleFilterModel(BaseModel):
    jobnumber: Optional[str] = ''
    sampletype: Optional[str] = ''
    sampler: Optional[str] = ''
    collectiondate: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    objective: Optional[str] = '' 
    page: Optional[int] = 1 
    pagesize: Optional[int] = 10
    orderby: Optional[str] = '' 
    is_asc:Optional[bool] = True
    barcodes:Optional[str] = ''
    

class SampleAssignTestTypeModel(BaseModel):
    barcodes: Optional[list] = []
    testidlist: Optional[list] = []
    
class SurveyModel(BaseModel): 
    survey_id: Optional[str]=''
    survey_key:Optional[str]=''
    parent_survey_id: Any 
    survey_data: Any 
    survey_status: Optional[str]=''
    created_at:Optional[str]=''
    updated_at:Optional[str]=''