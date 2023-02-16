import os
from src.shared import common

ADMIN_USERPOOL_ID =  os.environ["COGNITO_USER_POOL_ID"]
ADMIN_CLIENT_ID = os.environ["COGNITO_USER_CLIENT_ID"]

USER_USERPOOL_ID = os.environ["COGNITO_USER_POOL_ID"]
USER_CLIENT_ID = os.environ["COGNITO_USER_CLIENT_ID"]