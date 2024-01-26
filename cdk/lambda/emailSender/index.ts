import { SQSEvent, SQSRecord } from "aws-lambda";
import { SESClient } from "@aws-sdk/client-ses";
import { sendEmail } from "./lib/emailSender";
import { S3Client } from "@aws-sdk/client-s3";
import { getFileFromS3 } from "./lib/fileLoader";
import { getMessageData } from "./lib/markdownParser";

type MessageBody = {
  templateKey: string | undefined;
  templateBucketName: string | undefined;
  templateData: Record<string, string>;
  toAddresses: string[];
  senderName: string;
  senderEmail: string;
  tagData?: Record<string, string> | undefined;
};

const sesClient = new SESClient({});

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      await handleQueue({ record });
    } catch (e) {
      console.error(e);
    }
  }
};

export const handleQueue = async ({
  record,
}: {
  record: SQSRecord;
}): Promise<any> => {
  const body: MessageBody = JSON.parse(record.body);
  console.log(body);
  try {
    await sendEmailWithTemplate({
      templateKey: body.templateKey,
      templateBucketName: body.templateBucketName,
      templateData: body.templateData,
      toAddresses: body.toAddresses,
      senderName: body.senderName,
      senderEmail: body.senderEmail,
      tagData: body.tagData,
    });
  } catch (e) {
    console.error(e);
  }
};

export const getMessageDataFromTemplate = async ({
  templateKey,
  templateBucketName,
  templateData,
}: {
  templateKey: string | undefined;
  templateBucketName: string | undefined;
  templateData: Record<string, string>;
}) => {
  let markdown = "";
  if (!templateKey) {
    throw new Error("templateKey is required when using S3.");
  }
  if (!templateBucketName) {
    throw new Error("templateBucketName is required when using S3.");
  }
  const s3Client = new S3Client({});
  markdown = await getFileFromS3({
    s3Client,
    bucketName: templateBucketName,
    key: templateKey,
  });

  if (!markdown) {
    throw new Error("Template is empty.");
  }

  const messageData = getMessageData({
    markdown,
    data: templateData,
  });

  if (!messageData) {
    throw new Error("Message data is empty.");
  }

  return messageData;
};

export const sendEmailWithTemplate = async ({
  templateKey,
  templateBucketName,
  templateData,
  toAddresses,
  senderName,
  senderEmail,
  tagData,
}: {
  templateKey: string | undefined;
  templateBucketName: string | undefined;
  templateData: Record<string, string>;
  toAddresses: string[];
  senderName: string;
  senderEmail: string;
  tagData?: Record<string, string>;
}) => {
  const messageData = await getMessageDataFromTemplate({
    templateKey,
    templateBucketName,
    templateData,
  });

  await sendEmail({
    emailParams: {
      messageBodyHtml: messageData.html,
      messageBodyText: undefined,
      subject: messageData.title,
      toAddresses,
      senderName,
      senderEmail,
      tagData,
    },
    sesClient,
  });
};
