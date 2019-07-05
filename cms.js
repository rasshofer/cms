const fs = require('fs-extra');
const path = require('path');
const deepmerge = require('deepmerge');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const glob = require('glob');
const shortcodes = require('shortcodes');
const naturalSort = require('javascript-natural-sort');
const Page = require('./lib/page');
const defaults = require('./lib/defaults');

const createPageDirectory = page => new Promise((resolve, reject) => {
  mkdirp(path.dirname(page.output), (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

const findMatchingTemplate = (page, options) => new Promise((resolve, reject) => {
  const templates = glob.sync(`${page.template}.+(${options.extensions.templates.join('|')})`, {
    cwd: options.paths.templates,
    absolute: true,
  }).sort(naturalSort);

  if (!templates.length) {
    reject(new Error(`Missing template: ${page.template}`));
  } else {
    resolve(templates[0]);
  }
});

const compileTemplate = (template, page, options) => {
  const merged = deepmerge.all([
    {},
    page,
    options.globals,
    options.addons,
  ]);

  const locals = deepmerge.all([
    {},
    merged,
    {
      shortcodes(input, context = merged) {
        Object.keys(options.shortcodes).forEach((key) => {
          shortcodes.add(key, attrs => options.shortcodes[key](attrs, context));
        });
        return shortcodes.parse(input);
      },
    },
  ]);

  return options.template(template, locals);
};

const writeOutputFile = (compiled, page) => new Promise((resolve, reject) => {
  fs.writeFile(page.output, compiled, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

const copyPageResources = page => new Promise((resolve) => {
  Promise.all(page.files.map(file => new Promise((resolve, reject) => { // eslint-disable-line no-shadow
    fs.copy(file.file, file.output, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }))).then(() => {
    resolve(page);
  });
});

const renderPage = (page, options) => {
  if (!page) {
    return Promise.reject(new Error('Missing page.'));
  }

  return createPageDirectory(page)
    .then(() => findMatchingTemplate(page, options))
    .then(template => compileTemplate(template, page, options))
    .then(compiled => writeOutputFile(compiled, page))
    .then(() => copyPageResources(page))
    .then(() => Promise.all(page.children.map(child => renderPage(child, options))));
};

module.exports = (custom) => {
  const config = deepmerge.all([
    {},
    defaults,
    custom,
  ]);

  const page = Page.generatePageFromDirectory(config.paths.content, config);

  return {
    get: () => page,
    config: () => config,
    render: () => {
      if (page === false) {
        return Promise.reject(new Error('Missing genesis page.'));
      }

      rimraf.sync(config.paths.output);

      return renderPage(page, config);
    },
  };
};
