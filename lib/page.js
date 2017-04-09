const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const camelCase = require('lodash.camelcase');
const naturalSort = require('javascript-natural-sort');
const Item = require('./item');
const File = require('./file');
const Image = require('./image');

class Page extends Item {

  constructor(file, options, parent) {
    super(file, options);

    (fs.readFileSync(this.file, 'utf8') || '').split(options.separators.line).forEach((line) => {
      const partials = line.split(options.separators.values);
      const key = camelCase(partials.shift().trim());
      const value = partials.join(options.separators.values).trim();

      this[key] = value;
    });

    this.parent = parent;
    this.index = parseInt(path.basename(path.dirname(this.file)).replace(/^(\d+-)?(.*)$/i, '$1'), 10) || 0;
    this.visible = this.index > 0;
    this.invisible = !this.visible;
    this.identifier = path.relative(options.paths.content, path.dirname(this.file)).replace(/^(\d+-)?(.*)$/i, '$2');
    this.url = `${options.base}/${this.identifier.length ? options.permalink(this.identifier) : ''}`;
    this.output = path.resolve(options.paths.output, this.identifier, `index.${options.extensions.output}`);
    this.template = path.basename(this.file, path.extname(this.file));

    if (this.parent) {
      this.genesis = this.parent;
      while (this.genesis && this.genesis.parent) {
        this.genesis = this.genesis.parent;
      }
    } else {
      this.genesis = this;
    }

    this.basepath = (url = '') => {
      if (url.startsWith(options.base)) {
        return url;
      }
      return `${options.base}${url}`;
    };

    this.findPageByUrl = (url = '/', context = this.genesis) => {
      const converted = `${options.base}${url.length ? options.permalink(url) : ''}`;
      const finder = (obj) => {
        let match = false;
        if (obj.url === converted) {
          match = obj;
        } else {
          obj.children.forEach((child) => {
            const runner = finder(child);
            if (runner) {
              match = runner;
            }
          });
        }
        return match;
      };
      return finder(context);
    };

    this.generateChildren(options);
    this.generateFiles(options);
  }

  generateChildren(options) {
    this.children = [];
    this.hasChildren = false;

    const base = path.dirname(this.file);

    glob.sync('*/', {
      cwd: base,
      absolute: true
    }).sort(naturalSort).forEach((directory) => {
      const matches = glob.sync(`*.+(${options.extensions.content.join('|')})`, {
        cwd: directory,
        absolute: true,
        ignore: `*.+(${[].concat(options.extensions.images, options.extensions.videos, options.extensions.sounds, options.extensions.documents).join('|')}).+(${options.extensions.content.join('|')})`
      }).sort(naturalSort);

      if (matches.length) {
        this.children.push(new Page(matches[0], options, this));
        this.hasChildren = true;
      }
    });

    return this;
  }

  generateFiles(options) {
    this.files = [];
    this.hasFiles = false;

    const files = {
      images: Image,
      videos: File,
      sounds: File,
      documents: File
    };

    Object.keys(files).forEach((property) => {
      const Type = files[property];

      this[property] = [];
      this[`has${property.substr(0, 1).toUpperCase()}${property.substr(1)}`] = false;

      glob.sync(`*.+(${options.extensions[property].join('|')})`, {
        cwd: path.dirname(this.file),
        absolute: true
      }).sort(naturalSort).forEach((file) => {
        const matches = glob.sync(`${file}.+(${options.extensions.content.join('|')})`, {
          cwd: path.dirname(this.file),
          absolute: true
        }).sort(naturalSort);

        const instance = new Type(file, matches[0], this, options);

        this[property].push(instance);
        this.files.push(instance);

        this[`has${property.substr(0, 1).toUpperCase()}${property.substr(1)}`] = true;
        this.hasFiles = true;
      });
    });

    return this;
  }

  static generatePageFromDirectory(directory, options) {
    const matches = glob.sync(`*.+(${options.extensions.content.join('|')})`, {
      cwd: directory,
      absolute: true,
      ignore: `*.+(${[].concat(options.extensions.images, options.extensions.videos, options.extensions.sounds, options.extensions.documents).join('|')}).+(${options.extensions.content.join('|')})`
    }).sort(naturalSort);

    if (matches.length) {
      return new Page(matches[0], options);
    }

    return false;
  }

}

module.exports = Page;
