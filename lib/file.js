const fs = require('fs-extra');
const path = require('path');
const camelCase = require('lodash.camelcase');
const Item = require('./item');

class File extends Item {

  constructor(file, content, page, options) {
    super(file, options);

    this.index = parseInt(path.basename(this.file).replace(/^(\d+-)?(.*)$/i, '$1'), 10) || 0;
    this.visible = this.index > 0;
    this.invisible = !this.visible;
    this.identifier = path.relative(options.paths.content, this.file).replace(/^(\d+-)?(.*)$/i, '$2');
    this.url = `${options.base}/${this.identifier}`;
    this.output = path.resolve(options.paths.output, this.identifier);

    if (content) {
      (fs.readFileSync(content, 'utf8') || '').split(options.separators.line).forEach((line) => {
        const partials = line.split(options.separators.values);
        const key = camelCase(partials.shift().trim());
        const value = partials.join(options.separators.values).trim();

        this[key] = value;
      });
    }
  }

}

module.exports = File;
