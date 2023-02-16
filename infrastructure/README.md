# Welcome to your new Environmental Data UI Infrastructure !

## Tech Stack

Environmental Data UI Infrastructure include the following rock-solid technical decisions out of the box:

- AWSCloudFormation (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) 
- YAML language (https://www.redhat.com/en/topics/automation/what-is-yaml)

## Quick Start

The  Environmental Data UI Infrastructure structure will look similar to this:

```
📦infrastructure
 ┣ 📂dataui-cognito 
 ┣ 📂dataui-rds-backup 
 ┣ 📂dataui-vpc 
 ┣ 📂dataui-waf 
 ┗ 📜README.md

```

### ./dataui-cognito directory
The directory containing the project's cognito stack definition. In addition, it also clearly describes the parameters depending on the environment (devepment, production, test).

The inside of the src directory looks similar to the following:
```
📦dataui-cognito
 ┣ 📂development
 ┃ ┣ 📜cognito.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📂production
 ┃ ┣ 📜cognito.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📂test
 ┃ ┣ 📜cognito.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📜cognito.yml
 ┗ 📜deploy.sh

```
### ./dataui-rds-backup directory
The directory containing the project's rds backup stack definition. In addition, it also clearly describes the parameters depending on the environment (devepment, production, test ..).

The inside of the src directory looks similar to the following:
```
📦dataui-rds-backup
 ┣ 📂development
 ┃ ┣ 📜rds-backup.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📂production
 ┃ ┣ 📜rds-backup.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📂test
 ┃ ┣ 📜rds-backup.params.json
 ┃ ┗ 📜stack-name.json
 ┣ 📜aws-backup.yaml
 ┗ 📜deploy.sh

```
### ./dataui-vpc directory
The project's stack definition directory contains information about VPC, subnet, RDS, Security Group .... In addition, it clearly describes parameters depending on the environment (devepment, production, test...).

The inside of the src directory looks similar to the following:
```
📦dataui-vpc
 ┣ 📂development
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜vpc.params.json
 ┣ 📂production
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜vpc.params.json
 ┣ 📂test
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜vpc.params.json
 ┣ 📜deploy.sh
 ┣ 📜README.md
 ┣ 📜validate.sh
 ┗ 📜vpc.yml
```
### ./dataui-waf directory 
The project's stack definition directory contains information about AWS WAF.... In addition, it clearly describes the parameters depending on the environment (devepment, production, test...).

The inside of the src directory looks similar to the following: 
```
📦dataui-waf
 ┣ 📂development
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜waf-params.json
 ┣ 📂production
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜waf-params.json
 ┣ 📂test
 ┃ ┣ 📜stack-name.json
 ┃ ┗ 📜waf-params.json
 ┣ 📜deploy.sh
 ┣ 📜README.md
 ┣ 📜validate.sh
 ┗ 📜waf.yml
```
  
## Running Storybook

### ./dataui-cognito directory
#### From the command line in your generated backend's dataui-cognito directory:

- sh deploy.sh create-stack ap-southeast-2 production  

### ./dataui-vpc directory 
#### From the command line in your generated backend's dataui-vpc directory:
- sh deploy.sh create-stack ap-southeast-2 production  

### ./dataui-rds-backup directory
#### From the command line in your generated backend's dataui--rds-backup directory:
- sh deploy.sh create-stack ap-southeast-2 production  

### ./dataui-waf directory
#### From the command line in your generated backend's dataui-waf directory:
- sh deploy.sh create-stack ap-southeast-2 production  
