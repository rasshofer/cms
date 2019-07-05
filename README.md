# CMS

> An elegant and easy-to-use, file-based content management system for static pages

[![Build Status](https://travis-ci.org/rasshofer/cms.svg)](https://travis-ci.org/rasshofer/cms)
[![Dependency Status](https://david-dm.org/rasshofer/cms/status.svg)](https://david-dm.org/rasshofer/cms)
[![Dependency Status](https://david-dm.org/rasshofer/cms/dev-status.svg)](https://david-dm.org/rasshofer/cms)

`cms` provides great flexibility without having to handle complicated installation steps or fighting with databases. It provides you all essentials, so you can focus on your contents. Regardless of whether you want to publish articles, galleries, simple pages, or big sized pages.

## Usage

```shell
npm install --save-dev cms
```

```js
const path = require('path');
const cms = require('cms');

cms({
  paths: {
    output: path.resolve(__dirname, 'build')
  }
}).render().then(() => {
  console.log('Done.');
}).catch((error) => {
  console.error(error);
});
```

## Programmatic API

### `cms(…).render()`

> Renders the page(s) based on your configuration

Returns: `Promise`

### `cms(…).get()`

> Returns the genesis page based on your configuration for further processing (e.g. headless use)

Returns: `Page`

### `cms(…).config()`

> Returns the merged configuration (= defaults + your custom configuration)

Returns: `Object`

## CLI

```shell
npm install -g cms
```

```shell
cms
```

## Content and structure

Content creation can be done very quick and easy. For each page, a folder containing a text file is placed within the `content` folder. While the folder names form the URLs, the name of the text file determines which template is used by the system. Using numbers as prefixes in front of the folder name, you’re able to order/sort the pages. In addition, those prefixes decide whether a page is 'visible' or 'invisible' – this may be used to control which sub pages are listed in menus, for example (see 'Visible and invisible pages' below for more details).

## Managing content

All your site’s content is located in the `content` folder. The structure of your site will be identical to the structure inside this folder. So, if you have a `projects` folder inside your content folder, your site will automatically have a `http://example.com/projects` page.

The content text files are divisible by a YAML-ish syntax into any number of fields. Those fields allow you an unlimited use of the API in templates to display or to control the output of the content. The data structure is modifiable at any time. In addition, the flexibility of the data structure allows creating pages that require a variety of different content types and templates.

You can put as many subfolders inside of folders as you like to build the structure of your site.

### Visible and invisible pages

You may recognize that some of the folders in the content folder have numbers prepended to their names…

- `1-projects`
- `2-about-us`
- `3-contact`

…while others don’t…

- `imprint`
- `error`

The idea behind this: folders with numbers are 'visible' pages, folders without numbers are 'invisible' pages. This may sound a bit weird at first glance, but the difference between those page types is pretty easy: only 'visible' pages will appear in your site’s menu later, while you can still link to 'invisible' pages (but they won’t appear in your menu).

In addition, those numbers in front of visible pages are used by `cms` to sort pages. This makes it easy to setup a site’s menu at the same time as setting up the general structure. All numbers are automatically stripped in URLs, thus the folder `1-projects` will nevertheless have the URL `http://example.com/projects` in the end.

### Adding content

Each folder inside the content folder has a text file in it, which holds all the content for that page. This file may be called `page.md` (or `post.txt` or …). Those text files are very easy to read/edit and still offer amazing possibilities to add content. Have a look at the following example (i.e. an example for a blog post).

```md
Title: Hello world
-----
Text: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
-----
Date: 2017-04-01T13:37:00
```

As you can see, each field has a name (which needs to consist of characters from A-Z and 0-9 without whitespaces or other fancy characters as it will be casted to camelCase anyways) followed by its content. You have to add five dashes after each field and that’s it.

To structure things a bit more clear, you may want to use additional line breaks (any line breaks at the start and/or end will be trimmed automatically anyways).

```md
Title: Hello world

----

Text:

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

----

Date: 2017-04-01T13:37:00
```

By the way: if you want to do so, you can change the default file’s name as well as the separator characters (colon, five dashes) in your site’s configuration. See 'Configuration' below for details.

### The right charset

To cut a long story short: You should always make sure to enter your text as UTF-8. This makes everything a lot easier and every decent text editor has support for UTF-8.

## Managing media

`cms` makes it super easy to add images, videos, sounds, or documents to your pages. Simply drop them into the folder for each page.

<img src="https://cdn.rawgit.com/rasshofer/cms/master/docs/files.png" alt="" width="215" height="247">

(You can sort files by prepending those numbers, just like pages.)

### Adding meta data to your files and images

Just like page content files, you may also create file content files, containing stuff like titles or captions. Simply add a text file for each file matching the full name of the file, followed by your content file extension (i.e. `test.jpg.md` for the file `test.jpg`). Inside those text files you can define your own fields and content, just like regular content files.

```md
Title: Very nice image
----
Caption: This is a very nice image with loads of colors and stuff.
```

(`cms` will automatically fetch this data from the matching text files and add them to your file object, which you can access in the templates later.)

### Anatomy of a page object

The following object dump represents the properties that are passed into the template engine next to globals and addons for every page.

```js
Page {
  file: '/Users/johndoe/Repositories/my-fancy-website/content/home.md',
  parent: undefined,
  genesis: Page,
  index: 0,
  visible: false,
  invisible: true,
  identifier: '',
  url: '/',
  output: '/Users/johndoe/Repositories/my-fancy-website/build/index.html',
  template: 'home',
  children: [
    Page,
    Page,
    …
  ],
  hasChildren: true,
  files: [
    File,
    File,
    …
  ],
  hasFiles: true,
  images: [
    Image,
    Image,
    …
  ],
  hasImages: true,
  videos: [
    File,
    File,
    …
  ],
  hasVideos: true,
  sounds: [
    File,
    File,
    …
  ],
  hasSounds: true,
  documents: [
    File,
    File,
    …
  ],
  hasDocuments: true,
  title: 'Lorem ipsum dolor sit amet',
  text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
}
```

`parent` may include a reference to the current page’s parent page. This may be useful for stuff like breadcrumb navigations. In case the page is a first level page, `parent` is simply `undefined`.

`genesis` may include a reference to the root page. This may be useful for stuff like navigations (i.e. show all first level pages). In case the page is the first level page itself, `genesis` is simply a reference to `this` (= the page instance itself).

`children` may contain any direct child pages of the current page. This may be useful for stuff like navigations. In case the page has no children, `children` will be an empty array.

`images`, `videos`, `sounds`, and `documents` may contain any matching files of the current page. `files` contains all files combined. In case the page does not contain any files, these properties will be empty arrays.

`title` and `text` are exemplary custom properties taken from the content file.

## Helpers

### `basepath(url)`

Callback function which prepends the `base` option (see below) to the specified `url`. This may be useful if you’re planning to run your static site within a sub directory.

Example:

```html
<link href="<%= basepath('/css/style.css') %>" rel="stylesheet">
```

### `has(key)`

Returns a boolean indicating whether the current page has the specified property. This may be useful if you’re working with dynamic page properties.

Example:

```ejs
<% if (has('description')) { %>
<p><%= description %></p>
<% } %>
```

### `get(key, defaultValue)`

Returns the specified property (or the specified default value if it does not exist) for the current page. This may be useful if you’re working with dynamic page properties.

Example:

```ejs
<% ['title', 'description'].forEach((prop) => { %>
<p><%= get(prop, 'Something') %></p>
<% }) %>
```

### `findPageByUrl(url, context)`

Searches the page tree (starting at `context`, which equals the `genesis` page by default) recursively for the the page that has the URL `url`. This may be useful if you need to use properties of other pages located somewhere else in the page tree.

Example:

```ejs
<% const contactPage = findPageByUrl('/contact') %>
<a href="<%= contactPage.url %>"><%= contactPage.title %></a>
```

## Shortcodes

Shortcodes let you do nifty things with very little effort by allowing you to create macros to be used in your page contents. A trivial shortcode example may look like this.

```plain
(youtube: jNQXAC9IVRw width: 480 height: 360)
```

The example above shows a basic shortcode to embed a YouTube video. The actual embedment is done by an appropiate handler, called everytime the shortcode is used.

```js
{
  youtube: (attrs) => {
    return `<iframe src="https://www.youtube.com/embed/${attrs.youtube}"${attrs.width ? ` width="${attrs.width}"`: ''}${attrs.height ? ` height="${attrs.height}"`: ''}></iframe>`;
  }
}
```

In addition, the page object of the current page (which includes/invokes the shortcode) gets passed into the shortcode handler function as its (optional) second parameter. This allows shortcodes to interact with the page context.

```js
{
  photo: (attrs, page) => {
    const photo = page.images.find((item) => item.identifier === attrs.photo);

    if (photo) {
      return `
        <figure>
          <img src="${photo.url}" alt="${photo.title}">
          ${photo.caption ? `<figcaption>${photo.caption}</figcaption>` : ''}
        </figure>
      `;  
    }

    return '';
  }
}
```

## Configuration

CMS uses a [sane configuration by default](https://github.com/rasshofer/cms/blob/master/lib/defaults.js) that should cover most use cases. However, if you would like to adjust/extend the configuration, you can either create a file called `cms.js` within the root directory (where you’re running `cms` in) which exports the configuration object or pass the configuration object into your `cms` function call. In both cases, `cms` expects to receive a proper JavaScript object containing some of the following properties.

### `template`

Function which is called using the parameters `file` (i.e. the path of the template) and `data` (i.e. locals) and which is supposed to return a Promise that resolves with the compiled template. This is the place where you would implement your preferred/custom template engine.

```js
(file, data) => Promise.resolve(template(fs.readFileSync(file, 'utf8'))(data))
```

You may want to use [consolidate](https://www.npmjs.com/package/consolidate), a template engine consolidation library.

Default: A Promise-ified version of [Lodash’s template function](https://lodash.com/docs#template)

### `permalink`

Callback function which is called using the parameters `permalink` (i.e. the plain page permalink) and which is supposed to decorate and return the permalink for a page. This may be useful in case you’re not able to rewrite URLs.

Default:

```js
(permalink) => `${permalink}`
```

Example:

```js
(permalink) => `${permalink}/index.html`
```

### `base`

Prefix that is prepended to all links (e.g. pages, files, …). This may be useful if you’re planning to run your static site within a sub directory.

Default: ∅

Example: `/wiki`

### `paths.content`

Path to the directory containing all your content.

Default: `path.resolve(process.cwd(), 'content')`

### `paths.templates`

Path to the directory containing all your templates.

Default: `path.resolve(process.cwd(), 'templates')`

### `paths.output`

Path to the directory where `cms` is supposed to save the static build to.

Default: `path.resolve(process.cwd(), 'output')`

### `separators.line`

Pattern that is used to separate lines/blocks within your content files.

Default: `-----`

### `separators.values`

Pattern that is used to separate keys and values within your content files blocks.

Default: `:`

### `extensions.content`

Array of extensions your content files may use.

Default:

```js
[
  'md'
]
```

### `extensions.templates`

Array of extensions your template files may use. In case you’re using a custom template engine, you most certainly will need to set the appropriate extensions here.

Default:

```js
[
  'tpl'
]
```

### `extensions.images`

Array of extensions, your images within page content directories may use. These extensions are used to find matching images for each page (i.e. the `images` property).

Default:

```js
[
  'jpg',
  'jpeg',
  'gif',
  'png',
  'webp'
]
```

### `extensions.videos`

Array of extensions, your videos within page content directories may use. These extensions are used to find matching videos for each page (i.e. the `videos` property).

Default:

```js
[
  'mpg',
  'mpeg',
  'mp4',
  'mov',
  'avi',
  'flv',
  'ogv',
  'webm'
]
```

### `extensions.sounds`

Array of extensions, your sounds within page content directories may use. These extensions are used to find matching sounds for each page (i.e. the `sounds` property).

Default:

```js
[
  'mp3',
  'wav',
  'm4a',
  'ogg',
  'oga'
]
```

### `extensions.documents`

Array of extensions, your documents within page content directories may use. These extensions are used to find matching documents for each page (i.e. the `documents` property).

Default:

```js
[
  'pdf',
  'doc',
  'xls',
  'ppt',
  'docx',
  'xlsx',
  'pptx'
]
```

### `extensions.output`

Extension of static output files.

Default: `html`

### `globals`

Object containing globals that will be passed into the `template` function next to the regular page data. This may be useful if you need to make data available to all pages. The object is deep-merged into the regular page data.

Default: `{}`

### `addons`

Object containing globals that will be passed into the `template` function next to the regular page data. This shall be used for all custom functions you would like to provide within your templates.

Default: `{}`

Example:

```js
{
  markdown: (input) => marked(input),
  reverse: (input) => input.split('').reverse().join('')
}
```

### `shortcodes`

Object containing shortcode handlers that will be applied to page data. This shall be used to register any custom shortcode you would like to provide within your content.

Default: `{}`

Example:

```js
{
  youtube: (attrs) => {
    return `<iframe src="https://www.youtube.com/embed/${attrs.youtube}"${attrs.width ? ` width="${attrs.width}"`: ''}${attrs.height ? ` height="${attrs.height}"`: ''}></iframe>`;
  }
}
```

## TODO / Roadmap

`cms` is quite stable now. Most changes are new features, minor bug fixes, or performance improvements. And tests, of course.

## Changelog

- 1.6.0
  - Move programmatic rendering to `render` method and add `get`/`config` methods to allow headless use
  - Enforce proper errors for promise rejections
  - Update dependencies
- 1.5.0
  - Implement optional `context` parameter for shortcode helper
  - Update dependencies
- 1.4.0
  - Hand over pages into shortcode handlers
  - Update dependencies
- 1.3.1
  - Fix shortcode examples
- 1.3.0
  - Migrate to [shortcodes](https://www.npmjs.com/package/shortcodes) for shortcode parsing
  - Update dependencies
- 1.2.5
  - Fix parsing of index prefixes to prevent misplaced digits within URLs
- 1.2.4
  - Fix parsing of index prefixes to prevent inaccurate digit replacements within URLs
- 1.2.3
  - Implement proper natural sorting of pages
  - Implement more specific rejections in case a page is invalid (e.g. missing genesis page)
- 1.2.2
  - Apply `base` prefix and `permalink` callback to `findPageByUrl` helper queries automatically
- 1.2.1
  - Adjust `basepath` to only prepend the base path to an URL in case it isn’t there yet
  - Fix typos in documentation
- 1.2.0
  - Implement new helper methods `basepath` and `findPageByUrl`
- 1.1.0
  - In case a page is the first level page itself, `genesis` is now a reference to `this` (= the page instance itself) instead of `undefined`
- 1.0.0
  - Initial version

## Thanks

Special thanks to [Thom Blake](http://thomblake.me/) for handing over the `cms` package name on npm to me. Please check out [thomblake/cms](https://github.com/thomblake/cms) in case you’re looking for the code of versions <1.0.0.

## License

Copyright (c) 2017 [Thomas Rasshofer](http://thomasrasshofer.com/)  
Licensed under the MIT license.

See LICENSE for more info.
