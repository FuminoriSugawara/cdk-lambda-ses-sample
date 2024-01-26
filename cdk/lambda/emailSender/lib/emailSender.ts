import {
  Destination,
  Message,
  MessageTag,
  SendEmailCommand,
  SESClient,
} from "@aws-sdk/client-ses";

export type EmailParams = {
  messageBodyHtml: string | undefined;
  messageBodyText: string | undefined;
  subject: string;
  toAddresses: string[];
  senderName: string;
  senderEmail: string;
  tagData?: Record<string, string>;
};

export const validateEmailParams = (params: EmailParams) => {
  if (!params.messageBodyHtml && !params.messageBodyText) {
    throw new Error("Either messageBodyHtml or messageBodyText is required");
  }
  if (!params.subject) {
    throw new Error("subject is required");
  }
  if (!params.toAddresses || params.toAddresses.length === 0) {
    throw new Error("toAddresses is required");
  }

  if (!params.senderName) {
    throw new Error("senderName is required");
  }

  if (!params.senderEmail) {
    throw new Error("senderEmail is required");
  }

  return true;
};

export const sendEmail = async ({
  emailParams,
  sesClient,
}: {
  emailParams: EmailParams;
  sesClient: SESClient;
}) => {
  const {
    messageBodyHtml,
    messageBodyText,
    subject,
    toAddresses,
    senderName,
    senderEmail,
    tagData,
  } = emailParams;

  validateEmailParams(emailParams);

  const source: string = convertSenderNameAndEmailToSource({
    senderName,
    senderEmail,
  });

  const destination: Destination = convertAddressesToDestination(toAddresses);

  const message: Message = convertMessageBodyAndSubjectToMessage({
    messageBodyHtml,
    messageBodyText,
    subject,
  });

  const tags: MessageTag[] | undefined = convertTagDataToMessageTags({
    tagData,
  });

  const command = new SendEmailCommand({
    Destination: destination,
    Message: message,
    Source: source,
    Tags: tags,
  });

  try {
    const response = await sesClient.send(command);
    console.log({ response });
  } catch (e) {
    console.error(e);
  }
};

export const convertSenderNameAndEmailToSource = ({
  senderName,
  senderEmail,
}: {
  senderName: string;
  senderEmail: string;
}): string => {
  return `"${senderName}" <${senderEmail}>`;
};

export const convertTagDataToMessageTags = ({
  tagData,
}: {
  tagData: Record<string, string> | undefined;
}): MessageTag[] | undefined => {
  if (!tagData) return;
  return Object.keys(tagData).map((key) => {
    return {
      Name: key,
      Value: tagData[key],
    };
  });
};

export const convertMessageBodyAndSubjectToMessage = ({
  messageBodyHtml,
  messageBodyText,
  subject,
}: {
  messageBodyHtml: string | undefined;
  messageBodyText: string | undefined;
  subject: string;
}): Message => {
  const message: Message = {
    Subject: {
      Charset: "UTF-8",
      Data: subject,
    },
    Body: {},
  };
  if (messageBodyHtml) {
    message.Body = {
      Html: {
        Charset: "UTF-8",
        Data: messageBodyHtml,
      },
    };
  }
  if (messageBodyText) {
    message.Body = {
      Text: {
        Charset: "UTF-8",
        Data: messageBodyText,
      },
    };
  }
  return message;
};

export const convertAddressesToDestination = (
  addresses: string[],
): Destination => {
  return {
    ToAddresses: addresses,
  };
};
