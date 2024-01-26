import {getMessageData, loadMarkdown, parseMarkdownToHtml, replaceVariables, validate} from './markdownParser';

describe('MarkdownParser', () => {
  const md = `---
title: Hello World {{hoge}}
properties:
  - foo
  - bar
  - hoge
---
# Hello World
{{foo}} {{bar}} World
`;
  describe('loadTemplate', () => {
    it('should parse the template', async () => {
      const result = loadMarkdown(md);
      expect(result).toEqual({
        body: '# Hello World\n{{foo}} {{bar}} World\n',
        attributes: {
          title: 'Hello World {{hoge}}',
          properties: ['foo', 'bar', 'hoge'],
        },
      });
    });
  });

  describe('validate', () => {
    it('should validate the data', async () => {
      const data = {
        foo: 'Hello',
        bar: 'World',
        hoge: 'HOGE',
      };
      const template = loadMarkdown(md);
      if (!template) {
        return;
      }

      const result = validate({ data, attributes: template.attributes! });

      expect(result).toEqual(true);
    });
  });

  describe('replaceVariables', () => {
    it('should transform the template', async () => {
      const data = {
        foo: 'FOO',
        bar: 'BAR',
        hoge: 'HOGE',
      };
      const template = loadMarkdown(md);
      const result = replaceVariables({
        md: template.body,
        title: template.attributes.title,
        properties: template.attributes.properties,
        data,
      });

      expect(result).toEqual({
        title: 'Hello World HOGE',
        md: '# Hello World\nFOO BAR World\n',
      });
    });
  });

  describe('parseMarkdownToHtml', () => {
    it('should parse markdown to html', async () => {
      const md = '# Hello World\nFOO BAR World\n';

      const result = parseMarkdownToHtml(md);

      expect(result).toEqual('<h1>Hello World</h1>\n<p>FOO BAR World</p>\n');
    });
  });

  describe('getMessageData', () => {
    it('should return the message data', async () => {
      const data = {
        foo: 'FOO',
        bar: 'BAR',
        hoge: 'HOGE',
      };

      const result = getMessageData({
        markdown: md,
        data,
      });

      expect(result).toEqual({
        title: 'Hello World HOGE',
        md: '# Hello World\nFOO BAR World\n',
        html: '<h1>Hello World</h1>\n<p>FOO BAR World</p>\n',
      });
    });


  });
});
