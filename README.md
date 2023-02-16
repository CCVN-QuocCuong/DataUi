# Welcome to your new Environmental Data UI Repository !
## Repository contains source code of 3 main components:
- Infrastructure: Contains the initial AWS environment architecture build definition (VPC, Cognito, S3, RDS ...)
- backend: Contains the definition of the DataUI project's backend API. Built in Python language (version 3.8) on Serverless platform supporting development and deployment on AWS environment.
- frontend-ui: Contains the definition of UI part of DataUI project. Built in ReactJs language

## Tech Stack

Environmental Data UI Infrastructure include the following rock-solid technical decisions out of the box:
###  Environmental Data UI backend
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

###  Environmental Data UI Infrastructure
- AWSCloudFormation (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) 
- YAML language (https://www.redhat.com/en/topics/automation/what-is-yaml)

###  Environmental Data UI frontend-ui 


## Quick Start

The  Environmental Data UI Repository structure will look similar to this:

```
📦frontend-ui  
 ┣ 📂public
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜index.html
 ┃ ┣ 📜logo192.png
 ┃ ┣ 📜logo512.png
 ┃ ┣ 📜manifest.json
 ┃ ┗ 📜robots.txt
 ┣ 📂src
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂css 
 ┃ ┃ ┣ 📂font 
 ┃ ┃ ┣ 📂icomoon 
 ┃ ┃ ┗ 📂images 
 ┃ ┣ 📂components 
 ┃ ┣ 📂constants
 ┃ ┣ 📂helpers
 ┃ ┣ 📂hooks
 ┃ ┣ 📂layouts
 ┃ ┣ 📂pages
 ┃ ┣ 📂routes 
 ┃ ┣ 📂schema 
 ┃ ┣ 📂service 
 ┃ ┣ 📂store 
 ┃ ┣ 📂styles 
 ┃ ┣ 📜App.css
 ┃ ┣ 📜App.tsx
 ┃ ┣ 📜config.js
 ┃ ┣ 📜hooks.ts
 ┃ ┣ 📜index.js
 ┃ ┣ 📜react-app-env.d.ts
 ┃ ┣ 📜reportWebVitals.js
 ┃ ┣ 📜setupTests.js
 ┃ ┗ 📜test.utils.tsx
 ┣ 📜.env
 ┣ 📜.env.test
 ┣ 📜.gitignore
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜tsconfig.json

```

###  Environmental Data UI backend
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
###  Environmental Data UI Infrastructure

```
📦infrastructure
 ┣ 📂dataui-cognito 
 ┣ 📂dataui-rds-backup 
 ┣ 📂dataui-vpc 
 ┣ 📂dataui-waf 
 ┗ 📜README.md
```
###  Environmental Data UI Infrastructure
```
📦frontend-ui  
 ┣ 📂public 
 ┣ 📂src
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂css 
 ┃ ┃ ┣ 📂font 
 ┃ ┃ ┣ 📂icomoon 
 ┃ ┃ ┗ 📂images 
 ┃ ┣ 📂components 
 ┃ ┣ 📂routes 
 ┃ ┣ 📂schema 
 ┃ ┣ 📂service 
 ┃ ┣ 📂store 
 ┃ ┣ 📂styles 
 ┃ ┣ 📜App.css
 ┃ ┣ 📜App.tsx
 ┃ ┣ 📜config.js
 ┃ ┣ 📜hooks.ts
 ┃ ┣ 📜index.js
 ┃ ┣ 📜react-app-env.d.ts
 ┃ ┣ 📜reportWebVitals.js
 ┃ ┣ 📜setupTests.js
 ┃ ┗ 📜test.utils.tsx
 ┣ 📜.env
 ┣ 📜.env.test
 ┣ 📜.gitignore
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜tsconfig.json
``` 
  
## Running Storybook
###  Environmental Data UI backend
- Refer to the ```backend\README.md``` for more information 

###  Environmental Data UI Infrastructure
- Refer to the ```infrastructure\README.md``` for more information 

###  Environmental Data UI front-end
- Refer to the ```frontend-ui\README.md``` for more information 