# Welcome to your new Environmental Data UI Backend !

## Tech Stack

Environmental Data UI backend include the following rock-solid technical decisions out of the box:

- Serverless Framework (https://www.serverless.com/)
- Python 3.8.0 (https://www.python.org/downloads/release/python-380/)
- cognitojwt: Decode and verify Amazon Cognito JWT tokens (https://pypi.org/project/cognitojwt/)
- requests: Requests allows you to send HTTP/1.1 requests extremely easily. (https://pypi.org/project/requests)
- aiohttp: Supports both client and server side of HTTP protocol. (https://pypi.org/project/aiohttp/)
- async_lru: Simple lru cache for asyncio (https://pypi.org/project/async-lru/)
- pydantic: Data validation and settings management using Python type hints. (https://pypi.org/project/pydantic/)
- faker: Faker is a Python package that generates fake data for you. (https://pypi.org/project/Faker/)
- peewee: Peewee is a simple and small ORM. It has few (but expressive) concepts, making it easy to learn and intuitive to use.(http://docs.peewee-orm.com/en/latest/)
- openpyxl: openpyxl is a Python library to read/write Excel 2010 xlsx/xlsm/xltx/xltm files.(https://pypi.org/project/openpyxl/)
- ply: PLY is yet another implementation of lex and yacc for Python. (https://pypi.org/project/ply/)
- python-docx: python-docx is a Python library for creating and updating Microsoft Word (.docx) files.(https://pypi.org/project/python-docx/)
- botocore: A low-level interface to a growing number of Amazon Web Services. The botocore package is the foundation for the AWS CLI as well as boto3. (https://pypi.org/project/botocore/)
- psycopg2: Psycopg is the most popular PostgreSQL database adapter for the Python programming language. (https://pypi.org/project/psycopg2/)
- pandas: pandas is a Python package that provides fast, flexible, and expressive data structures designed to make working with "relational" or "labeled" data both easy and intuitive. (https://pypi.org/project/pandas/)

## Quick Start

The  Environmental Data UI backend project's structure will look similar to this:

```
📦backend
 ┣ 📂.serverless 
 ┣ 📂config 
 ┣ 📂layer
 ┣ 📂resources 
 ┣ 📂src
 ┃ ┣ 📂api
 ┃ ┃ ┣ 📂auth 
 ┃ ┃ ┗ 📂ui 
 ┃ ┣ 📂helpers 
 ┃ ┣ 📂model 
 ┃ ┗ 📂shared 
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┣ 📜serverless-dev.yml
 ┣ 📜serverless.yml
 ┗ 📜yarn.lock

```

### ./serverless directory
This is the directory that contains all the information about the package's infrastruct after we finish developing and deploying.

The inside of the src directory looks similar to the following:
```
📦.serverless
 ┣ 📜cloudformation-template-create-stack.json
 ┣ 📜cloudformation-template-update-stack.json
 ┣ 📜custom-resources.zip
 ┣ 📜dataui-api.zip
 ┣ 📜dependencies.zip
 ┗ 📜serverless-state.json
```
### ./config directory
This is the directory that contains all the configuration information and the corresponding environment variables used for each deployment environment (develop, test, prod ..)

The inside of the src directory looks similar to the following:
```
📦config
 ┣ 📜dataui-api-dev.json
 ┣ 📜dataui-api-prod.json
 ┣ 📜dataui-api-stg.json
 ┣ 📜dataui-api-test.json
 ┣ 📜dev.json
 ┗ 📜enviroment.json
```
### ./layer directory
This is the directory that contains all the information about the libraries used in the entire project. The libraries to be installed are described in detail in the `requirements.txt` file. After the installation is complete, the libraries will be stored in the `site-packages` directory

The inside of the src directory looks similar to the following:
```
📦layer
 ┗ 📂dependencies
 ┃ ┣ 📂libs 
 ┃ ┣ 📂python
 ┃ ┃ ┣ 📂lib
 ┃ ┃ ┃ ┗ 📂python3.8
 ┃ ┃ ┃ ┃ ┗ 📂site-packages 
 ┃ ┗ 📜requirements.txt
```
### ./resources directory 
The directory contains the resources defined for use. `api-gateway-errors.yml` defines the configuration when the gateway api fails.

The inside of the src directory looks similar to the following:

```
📦resources
 ┗ 📜api-gateway-errors.yml
```

### ./src directory

This is the main directory of the project

The inside of the src directory looks similar to the following:

```
📦src
 ┣ 📂api
 ┃ ┣ 📂auth
 ┃ ┗ 📂ui
 ┣ 📂helpers 
 ┣ 📂model 
 ┗ 📂shared 
``` 

**api**
This is the directory that contains all the lambda functions and defines the endpoint configuration for the methods. 

**helpers**
This is the directory that contains all the generic methods defined for manipulating lambda functions with cognito.

**model**
This is the directory containing the classes that define the objects and models of the classes

**shared**
This is the directory containing the basic classes to define methods to manipulate the connection to RDS.
In addition, this directory also stores the initialize data of the tables.
 
### ./serverless.yml file
This is the file that contains all the definitions of the Serverless environment. When implementing, the serveless framework will rely on this file to configure and organize the API gateway.
  
## Running Storybook

From the command line in your generated backend's root directory:

### Step deploy Dev environment
#### Install serverless in your local PC: 

```
- npm install -g serverless
- npm i serverless-offline

```

#### Config AWS configure:
```
- aws configure --profile dataui-api-dev

```

#### Install dependencies:
```
- cd layer/dependencies
- pip3 install -t python/lib/python3.8/site-packages -r requirements.txt

```

#### Run the command deploy all:
```
- serverless deploy
```
    
#### Run the command deploy by function:
```
- serverless deploy function --function <FUNCTION NAME>
```

### Step deploy Serverless on local
```
- Change database connection to localhost 
- Run the command: serverless offline
```