from pydantic import BaseModel
from typing import Optional
class ChildTypeTest(BaseModel):
    pass
class TestTypeModel(BaseModel):
  testid: int
  testcode: str
  testcategory: str
  testtypename: str
  text: Optional[str] = None
  active : bool
  parenttestid: Optional[int] = None
  child: Optional[ChildTypeTest] = None