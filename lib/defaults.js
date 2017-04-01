const fs = require('fs-extra');
const path = require('path');
const template = require('lodash.template');

module.exports = {
  template: (file, data) => Promise.resolve(template(fs.readFileSync(file, 'utf8'))(data)),
  permalink: (permalink) => `${permalink}`,
  base: '',
  paths: {
    content: path.resolve(process.cwd(), 'content'),
    templates: path.resolve(process.cwd(), 'templates'),
    output: path.resolve(process.cwd(), 'output')
  },
  separators: {
    line: '-----',
    values: ':'
  },
  extensions: {
    content: [
      'md'
    ],
    templates: [
      'tpl'
    ],
    images: [
      'jpg',
      'jpeg',
      'gif',
      'png',
      'webp'
    ],
    videos: [
      'mpg',
      'mpeg',
      'mp4',
      'mov',
      'avi',
      'flv',
      'ogv',
      'webm'
    ],
    sounds: [
      'mp3',
      'wav',
      'm4a',
      'ogg',
      'oga'
    ],
    documents: [
      'pdf',
      'doc',
      'xls',
      'ppt',
      'docx',
      'xlsx',
      'pptx'
    ],
    output: 'html'
  },
  globals: {},
  addons: {},
  shortcodes: {}
};
