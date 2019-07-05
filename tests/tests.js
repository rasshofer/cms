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
    }).then((data) => {
      expect(data).toMatchSnapshot();
    });
  });
});

describe('Parsing', () => {
  const result = instance.get();
  const invalidResult = invalid.get();

  it('provides the genesis page', () => {
    expect(result.constructor.name).toEqual('Page');
    expect(result.page).toBeUndefined();
    expect(result.genesis).toEqual(result);
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
});
