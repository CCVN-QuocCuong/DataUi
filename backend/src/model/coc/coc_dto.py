from pydantic import BaseModel
from typing import Optional


class CocModel(BaseModel):
    cocid: int
    created: str
    createdby: str
    lastmodified: str
    lastmodifiedby: str
    jobno: Optional[str] = ''
    jobphase: Optional[str] = ''
    jobtask: Optional[str] = ''
    companyid: Optional[int] = None
    labquoteno: Optional[str] = ''
    primarycontact: Optional[str] = ''
    submitter: Optional[str] = ''
    ttcontactphone: Optional[str] = ''
    ttemailaddress: Optional[str] = ''
    labid: Optional[int] = None
    priority: Optional[str] = ''
    comment: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    labreference: Optional[str] = ''
    objective: Optional[str] = ''
    statuscode: Optional[str] = ''
    version: Optional[float]
    deleted: Optional[bool]
    statusid: Optional[int]
    phasename: Optional[str] = ''
    jobname: Optional[str] = ''
    taskname: Optional[str] = ''
    labaddress: Optional[str] = ''
    sampletype: Optional[str] = ''
    address: Optional[str] = ''
    emailother: Optional[str] = ''
    note: Optional[str] = ''

class CocFilterModel(BaseModel):
    cocid: Optional[str] = ''
    jobno: Optional[str] = ''
    objective: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    sampletype: Optional[str] = ''
    page: Optional[int] = 1 
    pagesize: Optional[int] = 10
    orderby: Optional[str] = '' 
    is_asc:Optional[bool] = True
    
class UploadFileModel(BaseModel):
    cocid: Optional[int] = 0
    base64: Optional[str] = ''
    name: Optional[str] = ''
    contenttype: Optional[str] = ''
    uploadby: Optional[str] = ''
    
class SampleFormModel(BaseModel):
    fileid: int
    createdby: str
    lastmodifiedby: str
    jobno: Optional[str] = ''
    companyid: Optional[int] = None
    labquoteno: Optional[str] = ''
    primarycontact: Optional[str] = ''
    ttcontactphone: Optional[str] = ''
    ttemailaddress: Optional[str] = ''
    labid: Optional[int] = None
    comment: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    objective: Optional[str] = ''
    labaddress: Optional[str] = ''
    address: Optional[str] = ''

class NotificationModel(BaseModel):
    ttcl_notificationid : Optional[int]
    cocid : Optional[int] = None
    fileid : Optional[int] = None 
    
    # uploaded: upload document success
    # transformed: mapping and transform document success
    # exported: export report success 
    status:Optional[str] = None 
    isread:Optional[bool] = False
    message:Optional[str] = None
    created: Optional[str] = None
    lastmodified: Optional[str] = None