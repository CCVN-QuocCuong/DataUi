#!/bin/bash
aws --profile default cloudformation $1 --cli-input-json file://$3/stack-name.json --template-body file://waf.yml --parameters file://$3/waf-params.json --region $2 --capabilities CAPABILITY_IAM
