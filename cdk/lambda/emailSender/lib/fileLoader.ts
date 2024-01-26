import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

export const getFileFromS3 = async ({
  s3Client,
  bucketName,
  key,
}: {
  s3Client: S3Client;
  bucketName: string;
  key: string;
}) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (response.Body instanceof Readable) {
    return await streamToString(response.Body);
  }

  return "";
};

export const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};
