const imageSize = require('image-size');
const File = require('./file');

class Image extends File {

  constructor(file, content, page, options) {
    super(file, content, page, options);

    const dimensions = imageSize(this.file);

    this.width = dimensions.width;
    this.height = dimensions.height;
  }

}

module.exports = Image;
