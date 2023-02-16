from pydantic import BaseModel
class LoginModel(BaseModel):
  username: str
  password: str
class ResetPasswordModel(BaseModel):
  username: str
  old_password: str
  new_password: str
  
class RefreshTokenModel(BaseModel):
  refresh_token: str