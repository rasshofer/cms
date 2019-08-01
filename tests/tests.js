const fs = require('fs');
const path = require('path');
const cms = require('..');

const instance = cms({
  base: '/demo',
  paths: {
    content: path.resolve(__dirname, 'content'),
    templates: path.resolve(__dirname, 'templates'),
    output: path.resolve(__dirname, 'build'),
  },
  extensions: {
    templates: [
      'ejs',
    ],
  },
  shortcodes: {
    highlight: attrs => `<span class="highlight">${attrs.highlight}</span>`,
  },
});

const invalid = cms({
  paths: {
    content: path.resolve(__dirname, 'invalid'),
  },
});

describe('API', () => {
  it('provides all necessary instance methods', () => {
    expect(instance.config).toBeDefined();
    expect(instance.get).toBeDefined();
    expect(instance.render).toBeDefined();
  });
});

describe('Config', () => {
  const result = instance.config();

  it('provides the configuration', () => {
    expect(result).toBeDefined();
  });

  it('provides proper default values', () => {
    expect.assertions(4);

    const tpl = path.resolve(__dirname, 'templates', 'home.ejs');

    expect(result.base).toEqual('/demo');
    expect(result.separators).toMatchSnapshot();
    expect(result.extensions).toMatchSnapshot();

    result.template(tpl, {
      title: 'Title',
      text: 'Text',
      shortcodes: input => input,
    }).then((data) => {
      expect(data).toMatchSnapshot();
    });
  });
});

describe('Parsing', () => {
  const result = instance.get();
  const invalidResult = invalid.get();

  it('provides the genesis page', () => {
    expect(result.constructor.name).toEqual('FilePage');
    expect(result.page).toBeUndefined();
    expect(result.genesis).toEqual(result);
    expect(result.someWeirdFieldName).toEqual('Test');
    expect(invalidResult).toEqual(false);
  });

  it('provides the right page tree', () => {
    expect(result.hasChildren).toEqual(true);
    expect(result.children.length).toEqual(4);
    expect(result.children.filter(item => item.visible === true).length).toEqual(3);
    expect(result.children.filter(item => item.invisible === true).length).toEqual(1);
  });

  it('provides images', () => {
    const a = result.children[0];

    expect(a.hasFiles).toEqual(true);
    expect(a.hasImages).toEqual(true);
    expect(a.images.length).toEqual(2);
    expect(a.images[0].index).toEqual(1);
    expect(a.images[0].url).toEqual('/demo/a/a.gif');
    expect(a.images[0].width).toEqual(1);
    expect(a.images[0].height).toEqual(1);
    expect(a.images[0].title).toEqual('Spacer');
    expect(a.images[1].index).toEqual(0);
    expect(a.images[1].url).toEqual('/demo/a/b.gif');
  });

  it('allows to find other pages', () => {
    const b = result.findPageByUrl('/b');

    expect(result.findPageByUrl).toBeDefined();
    expect(b).toBeDefined();
    expect(result.findPageByUrl('/abc')).toEqual(false);
    expect(result.findPageByUrl()).toEqual(result);
    expect(result.findPageByUrl('/a', b)).toBeDefined();
    expect(result.findPageByUrl('')).toEqual(false);
  });

  it('provides access to the genesis page', () => {
    const ba = result.findPageByUrl('/b/a');

    expect(ba.genesis).toEqual(result);
  });

  it('provides access to the basepath helper', () => {
    expect(result.basepath()).toEqual('/demo');
    expect(result.basepath('/img/demo.jpg')).toEqual('/demo/img/demo.jpg');
    expect(result.basepath('/demo/img/demo.jpg')).toEqual('/demo/img/demo.jpg');
  });

  it('provides access to the has/get helpers', () => {
    expect(result.has('title')).toEqual(true);
    expect(result.has('description')).toEqual(false);
    expect(result.get('title')).toEqual('Home');
    expect(result.get('description', 'Fallback')).toEqual('Fallback');
  });

  it('allows to add virtual pages', () => {
    const virtualPage = result.addVirtualPage({
      identifier: 'virtual',
      template: 'page',
      title: 'This is a virtual page',
      text: 'Lorem ipsum',
    });

    virtualPage.addVirtualPage({
      identifier: 'virtual/abc',
      template: 'page',
      title: 'This is a virtual sub page',
      text: 'Lorem ipsum',
    });

    virtualPage.addVirtualPage({
      index: 2,
      identifier: 'virtual/two',
      template: 'page',
      title: 'This is a virtual sub page with index 2',
      text: 'Lorem ipsum',
    });

    virtualPage.addVirtualPage({
      index: 1,
      identifier: 'virtual/one',
      template: 'page',
      title: 'This is a virtual sub page with index 1',
      text: 'Lorem ipsum',
    });

    const main = result.findPageByUrl('/virtual');
    const sub = result.findPageByUrl('/virtual/abc');

    expect(main).toEqual(virtualPage);
    expect(main.title).toEqual('This is a virtual page');
    expect(sub.title).toEqual('This is a virtual sub page');
    expect(sub.parent).toEqual(main);
    expect(sub.genesis).toEqual(result);
    expect(main.children[0].title).toEqual('This is a virtual sub page');
    expect(main.children[1].title).toEqual('This is a virtual sub page with index 1');
    expect(main.children[2].title).toEqual('This is a virtual sub page with index 2');
  });
});

describe('Render', () => {
  it('renders pages properly', async () => {
    expect.assertions(4);

    const output = path.resolve(__dirname, 'build');

    await instance.render();

    expect(fs.readFileSync(path.resolve(output, 'index.html'), 'utf8')).toMatchSnapshot();
    expect(fs.existsSync(path.resolve(output, 'a', 'a.gif'))).toEqual(true);
    expect(fs.existsSync(path.resolve(output, 'a', 'b.gif'))).toEqual(true);
    expect(fs.existsSync(path.resolve(output, 'b', 'a', 'index.html'))).toEqual(true);
  });

  it('handles a missing genesis page', async () => {
    await expect(invalid.render()).rejects.toThrow();
  });

  it('handles missing templates', async () => {
    const result = instance.get();

    result.addVirtualPage({
      identifier: 'missing-template',
      template: 'does-not-exist',
      title: 'Test',
    });

    await expect(instance.render()).rejects.toThrow();
  });
});
