const Page = require('./page');

class VirtualPage extends Page {
  constructor(properties, options, parent) {
    super(false, options, parent);

    this.index = properties.index || 0;
    this.identifier = properties.identifier;
    this.template = properties.template;

    this.setupGlobals(options);
    this.setupHelpers(options);

    this.addVirtualPage = (props) => {
      const page = new VirtualPage(props, options, this);
      this.children.push(page);
      this.children.sort((a, b) => a.index - b.index);
      return page;
    };

    Object.keys(properties).forEach((property) => {
      this[property] = properties[property];
    });
  }
}

module.exports = VirtualPage;
