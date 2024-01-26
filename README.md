## Preliminary Setup
- Create a user in AWS IAM with policies for SQS:SendMessage and S3:PutObject
- Obtain the Access Key ID and Secret Access Key for that user

## CDK
- Copy .env.example to create a .env file
- Set environment variables
```shell
cd cdk
cp .env.example .env
```
- Deploy the stack to CDK (the AWS account can be specified with the --profile option)
```shell
npm i
cdk bootstrap
cdk deploy
```

## APP
- Copy .env.example to create a .env file
- Set environment variables
- Upload a Markdown file from local to S3
```shell
cd app
npm i
npx ts-node s3UploadFile.ts ./sampleMessage.md
```
- Send an SQS message
```shell
npx ts-node sqsSendMessage.ts
```