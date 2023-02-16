from typing import Optional
from pydantic import BaseModel


class PhotoFilterModel(BaseModel):
    fromdate: Optional[str] = ''
    todate: Optional[str] = ''
    samples: Optional[str] = ''
    jobnumber: Optional[str] = ''
    siteid: Optional[str] = ''
    objective: Optional[str] = '' 
    siteaddress: Optional[str] = '' 
    filetype: Optional[str] = ''
    page: Optional[int] = 1 
    pagesize: Optional[int] = 10
    orderby: Optional[str] = '' 
    is_asc:Optional[bool] = True
    
class PhotoResponseModel(BaseModel):
    cocid: Optional[str] = ''
    jobnumber: Optional[str] = ''
    siteid: Optional[str] = ''
    siteaddress: Optional[str] = ''
    staff: Optional[str] = ''
    collectiondate: Optional[str] = ''
    samplename: Optional[str] = ''
    objective: Optional[str] = '' 
    filetype: Optional[str] = ''
    fromdepth: Optional[float] = None
    todepth: Optional[float] = None
    filename: Optional[str] = ''
    url: Optional[str] = ''
    id: Optional[str] = ''