#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
new CdkStack(app, "CdkStack", {
  projectName: process.env.PROJECT_NAME!,
  s3BucketName: process.env.S3_BUCKET_NAME!,
});
