import * as dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
dotenv.config();

const s3UploadFile = async () => {
  const filePath = process.argv[2];
  const bucketName = process.env.TEMPLATE_BUCKET_NAME!;
  const fileName = process.env.TEMPLATE_KEY!;
  const file = readFileSync(filePath);
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: file,
  });

  try {
    const response = await s3Client.send(command);
    console.log({ response });
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  await s3UploadFile();
})();
