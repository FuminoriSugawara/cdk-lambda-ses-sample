import { marked } from "marked";
import fm from "front-matter";

export type Attributes = {
  title: string;
  properties: string[];
};

type Markdown = {
  attributes: Attributes;
  body: string;
};

export const loadMarkdown = (template: string): Markdown => {
  try {
    const content = fm<Attributes>(template);
    console.log({ content });
    return {
      body: content.body,
      attributes: content.attributes,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const validate = ({
  data,
  attributes,
}: {
  data: any;
  attributes: Attributes;
}) => {
  const { properties } = attributes;

  const result = properties.reduce((acc: any, property: string) => {
    if (!data[property]) {
      acc.push(property);
    }
    return acc;
  }, [] as any[]);

  if (result.length > 0) {
    throw new Error(`Missing required properties: ${result.join(", ")}`);
  }
  return true;
};

export const replaceVariables = ({
  md,
  title,
  properties,
  data,
}: {
  md: string;
  title: string;
  properties: string[];
  data: any;
}) => {
  const propertiesSet = new Set(properties);
  const propertiesMap = Object.keys(data).reduce((acc: any, key: any) => {
    if (propertiesSet.has(key)) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  const pattern = /\{\{([a-zA-Z0-9]+)\}\}/g;
  return {
    md: md?.replace(pattern, (_match: any, name: any) => {
      return propertiesMap[name] || "";
    }),
    title: title?.replace(pattern, (_match: any, name: any) => {
      return propertiesMap[name] || "";
    }),
  };
};

export const parseMarkdownToHtml = (md: string) => {
  return marked(md);
};

export const getMessageData = ({
  markdown,
  data,
}: {
  markdown: string;
  data: any;
}) => {
  const template = loadMarkdown(markdown);
  if (!template) {
    return;
  }

  console.log({ template });

  const result = validate({ data, attributes: template.attributes! });

  if (!result) {
    return;
  }

  const { md, title } = replaceVariables({
    md: template.body,
    title: template.attributes.title,
    properties: template.attributes.properties,
    data,
  });

  return {
    title,
    md,
    html: parseMarkdownToHtml(md) as string,
  };
};
