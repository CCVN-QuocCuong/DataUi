# Provisioning Steps

- **Step 1:** Edit the vpc.params.json and stack-name.json file and include the necessary parameters.
For more details refer IP Addressing in Your VPC: https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-ip-addressing.html

- **Step 2:** Execute the following command `sh deploy.script create-stack <region> development>` or `sh deploy.script update-stack <region> development>`
  (Here create-stack is for new setups and update-stack for changes)

## Export aws credentials (optional)
- Export aws credentials or you can setup aws profile as well
```
export AWS_ACCESS_KEY_ID=AKIAQ..........65KT6
export AWS_SECRET_ACCESS_KEY=uHZbC8cAyUh..........NtF5ksxz7do66CTFaw+
export AWS_DEFAULT_<region> development=ap-southeast-2
```
## Command details for CloudFormation

- To create stack execute `sh deploy.sh create-stack <region> development`
- To update stack execute `sh deploy.sh update-stack <region> development`
 
## Development
You can verify the cloudformation template while developing using the following command `sh validate.sh`