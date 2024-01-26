import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";

interface Props extends cdk.StackProps {
  projectName: string;
  s3BucketName: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { projectName, s3BucketName } = props;

    // ------------------------------
    // S3
    // ------------------------------
    const emailTemplateBucket = new cdk.aws_s3.Bucket(
      this,
      `${projectName}-EmailTemplateBucket`,
      {
        bucketName: s3BucketName,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // ------------------------------
    // SQS
    // ------------------------------
    const emailSenderQueue = new sqs.Queue(
      this,
      `${projectName}-EmailSenderQueue`,
      {
        queueName: `${projectName}-EmailSenderQueue`,
      },
    );

    // ------------------------------
    // EmailSenderLambda
    // ------------------------------
    const emailSenderLambdaRole = new iam.Role(
      this,
      `${projectName}-EmailSenderLambdaRole`,
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
      },
    );

    emailSenderQueue.grantConsumeMessages(emailSenderLambdaRole);

    // Add permissions required to send messages with SES
    emailSenderLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: ["*"],
      }),
    );

    // Add permissions required to get email template from S3
    emailSenderLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [emailTemplateBucket.arnForObjects("*")],
      }),
    );

    const emailSenderLambda = new lambda.Function(
      this,
      `${projectName}-EmailSenderLambda`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("lambda/emailSender"),
        role: emailSenderLambdaRole,
        timeout: cdk.Duration.seconds(30),
      },
    );

    emailSenderLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(emailSenderQueue),
    );
  }
}
