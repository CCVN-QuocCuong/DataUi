from src.shared.common import get_secret
from peewee import *
import logging
import os

logger = logging.getLogger('peewee')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)

HOST= os.environ["DB_HOST"]
DB= os.environ["DB_NAME"]
secret = get_secret()
USER = secret["username"]
PASSWORD = secret["password"]
print('USER: {}'.format(USER))

psql_db = PostgresqlDatabase(
    database=DB, user=USER, password=PASSWORD, host=HOST, autocommit=True, autorollback=True)


class BaseModel(Model):
    """A base model that will use our Postgresql database"""
    class Meta:
        database = psql_db
        schema = 'dbo'
        only_save_dirty = True


class BaseModelNoPK(Model):
    """A base model that will use our Postgresql database"""
    class Meta:
        database = psql_db
        primary_key = False
        schema = 'dbo'