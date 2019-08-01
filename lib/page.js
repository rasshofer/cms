const path = require('path');
const camelCase = require('lodash.camelcase');
const Item = require('./item');
const File = require('./file');
const Image = require('./image');

const files = {
  images: Image,
  videos: File,
  sounds: File,
  documents: File,
};

class Page extends Item {
  constructor(file, options, parent) {
    super(file, options);
    this.parent = parent;
    this.setupHelpers(options);
  }

  setupGlobals(options) {
    this.visible = this.index > 0;
    this.invisible = !this.visible;
    this.url = `${options.base}/${this.identifier.length ? options.permalink(this.identifier) : ''}`;
    this.output = path.resolve(options.paths.output, this.identifier, `index.${options.extensions.output}`);

    this.children = [];
    this.hasChildren = false;

    this.files = [];
    this.hasFiles = false;

    Object.keys(files).forEach((property) => {
      this[property] = [];
      this[camelCase(`has-${property}`)] = false;
    });

    if (this.parent) {
      this.genesis = this.parent;
      while (this.genesis && this.genesis.parent) {
        this.genesis = this.genesis.parent;
      }
    } else {
      this.genesis = this;
    }
  }

  setupHelpers(options) {
    this.basepath = (url = '') => {
      if (url.startsWith(options.base)) {
        return url;
      }
      return `${options.base}${url}`;
    };

    this.has = key => !!this[key];

    this.get = (key, defaultValue) => (this.has(key) ? this[key] : defaultValue);

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
  }
}

module.exports = Page;
