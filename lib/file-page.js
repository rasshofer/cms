const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const camelCase = require('lodash.camelcase');
const naturalSort = require('javascript-natural-sort');
const Page = require('./page');
const VirtualPage = require('./virtual-page');
const File = require('./file');
const Image = require('./image');

const files = {
  images: Image,
  videos: File,
  sounds: File,
  documents: File,
};

class FilePage extends Page {
  constructor(file, options, parent) {
    super(file, options, parent);

    fs.readFileSync(this.file, 'utf8').split(options.separators.line).forEach((line) => {
      const partials = line.split(options.separators.values);
      const key = camelCase(partials.shift().trim());
      const value = partials.join(options.separators.values).trim();

      this[key] = value;
    });

    this.index = parseInt(path.basename(path.dirname(this.file)).replace(/^(\d+-)?(.*)$/i, '$1'), 10) || 0;
    this.identifier = path.relative(options.paths.content, path.dirname(this.file)).split('/').map(partial => partial.replace(/^(\d+-)?(.*)$/i, '$2')).join('/');
    this.template = path.basename(this.file, path.extname(this.file));

    this.setupGlobals(options);
    this.setupHelpers(options);
    this.generateChildren(options);
    this.generateFiles(options);

    this.addVirtualPage = (props) => {
      const page = new VirtualPage(props, options, this);
      this.children.push(page);
      return page;
    };
  }

  generateChildren(options) {
    const base = path.dirname(this.file);

    glob.sync('*/', {
      cwd: base,
      absolute: true,
    }).sort(naturalSort).forEach((directory) => {
      const matches = glob.sync(`*.+(${options.extensions.content.join('|')})`, {
        cwd: directory,
        absolute: true,
        ignore: `*.+(${[].concat(options.extensions.images, options.extensions.videos, options.extensions.sounds, options.extensions.documents).join('|')}).+(${options.extensions.content.join('|')})`,
      }).sort(naturalSort);

      if (matches.length) {
        this.children.push(new FilePage(matches[0], options, this));
        this.hasChildren = true;
      }
    });

    return this;
  }

  generateFiles(options) {
    Object.keys(files).forEach((property) => {
      const Type = files[property];

      glob.sync(`*.+(${options.extensions[property].join('|')})`, {
        cwd: path.dirname(this.file),
        absolute: true,
      }).sort(naturalSort).forEach((file) => {
        const matches = glob.sync(`${file}.+(${options.extensions.content.join('|')})`, {
          cwd: path.dirname(this.file),
          absolute: true,
        }).sort(naturalSort);

        const instance = new Type(file, matches[0], this, options);

        this[property].push(instance);
        this.files.push(instance);

        this[camelCase(`has-${property}`)] = true;
        this.hasFiles = true;
      });
    });

    return this;
  }

  static generatePageFromDirectory(directory, options) {
    const matches = glob.sync(`*.+(${options.extensions.content.join('|')})`, {
      cwd: directory,
      absolute: true,
      ignore: `*.+(${[].concat(options.extensions.images, options.extensions.videos, options.extensions.sounds, options.extensions.documents).join('|')}).+(${options.extensions.content.join('|')})`,
    }).sort(naturalSort);

    if (matches.length) {
      return new FilePage(matches[0], options);
    }

    return false;
  }
}

module.exports = FilePage;
