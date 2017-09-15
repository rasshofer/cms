#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const leprechaun = require('leprechaun');
const cms = require('.');

const readCustomConfig = () => {
  const file = path.resolve(process.cwd(), 'cms.js');

  return new Promise((resolve, reject) => {
    fs.access(file, fs.R_OK, (err) => {
      if (err) {
        reject(err);
      }

      resolve(require(file) || {}); // eslint-disable-line import/no-dynamic-require, global-require
    });
  });
};

readCustomConfig().then(cms.render()).then(() => {
  leprechaun.success('Done.');
}).catch((error) => {
  leprechaun.error('Error.');
  console.error(error); // eslint-disable-line no-console
  process.exit(1);
});
