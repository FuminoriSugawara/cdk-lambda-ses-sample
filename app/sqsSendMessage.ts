import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import * as dotenv from "dotenv";
dotenv.config();

const sendMessage = async () => {
  const sqsQueueUrl = process.env.SQS_QUEUE_URL!;
  const message = {
    toAddresses: [process.env.TO_ADDRESS!],
    templateKey: process.env.TEMPLATE_KEY!,
    templateBucketName: process.env.TEMPLATE_BUCKET_NAME!,
    templateData: {
      name: "Jhon Doe",
    },
    senderName: process.env.SENDER_NAME!,
    senderEmail: process.env.SENDER_EMAIL!,
  };

  const sesClient = new SQSClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new SendMessageCommand({
    QueueUrl: sqsQueueUrl,
    MessageBody: JSON.stringify(message),
  });

  try {
    const response = await sesClient.send(command);
    console.log({ response });
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  await sendMessage();
})();
