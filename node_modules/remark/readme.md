# remark [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status] [![Chat][chat-badge]][chat]

The [`remark`][remark] processor is a markdown processor powered by
[plugins][].

*   Interface by [`unified`][unified]
*   [**MDAST**][mdast] syntax tree
*   Parses markdown to the tree with [`remark-parse`][parse]
*   [Plugins][] transform the tree
*   Compiles the tree to markdown using [`remark-stringify`][stringify]

Don’t need the parser?  Or the compiler?  [That’s OK][unified-usage].

## Installation

[npm][]:

```sh
npm install remark
```

## Usage

###### Common example

This example lints markdown and turns it into HTML.

```js
var remark = require('remark');
var recommended = require('remark-preset-lint-recommended');
var html = require('remark-html');
var report = require('vfile-reporter');

remark()
  .use(recommended)
  .use(html)
  .process('## Hello world!', function (err, file) {
    console.error(report(err || file));
    console.log(String(file));
  });
```

Yields:

```txt
1:1  warning  Missing newline character at end of file  final-newline  remark-lint

⚠ 1 warning
```

```html
<h2>Hello world!</h2>
```

###### Settings through data

This example prettifies markdown and configures [`remark-parse`][parse] and
[`remark-stringify`][stringify] through [data][].

```js
var remark = require('remark');

remark()
  .data('settings', {commonmark: true, emphasis: '*', strong: '*'})
  .process('_Emphasis_ and __importance__', function (err, file) {
    if (err) throw err;
    console.log(String(file));
  });
```

Yields:

```markdown
*Emphasis* and **importance**
```

###### Settings through a preset

This example prettifies markdown and configures [`remark-parse`][parse] and
[`remark-stringify`][stringify] through a [preset][].

```js
var remark = require('remark');

remark()
  .use({
    settings: {commonmark: true, emphasis: '*', strong: '*'}
  })
  .process('_Emphasis_ and __importance__', function (err, file) {
    if (err) throw err;
    console.log(String(file));
  });
```

Yields:

```markdown
*Emphasis* and **importance**
```

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark.svg

[build-status]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage-status]: https://codecov.io/github/remarkjs/remark

[chat-badge]: https://img.shields.io/gitter/room/remarkjs/Lobby.svg

[chat]: https://gitter.im/remarkjs/Lobby

[license]: https://github.com/remarkjs/remark/blob/master/LICENSE

[author]: http://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/remarkjs/remark

[unified]: https://github.com/unifiedjs/unified

[mdast]: https://github.com/syntax-tree/mdast

[parse]: https://github.com/remarkjs/remark/blob/master/packages/remark-parse

[stringify]: https://github.com/remarkjs/remark/blob/master/packages/remark-stringify

[plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md

[unified-usage]: https://github.com/unifiedjs/unified#usage

[preset]: https://github.com/unifiedjs/unified#preset

[data]: https://github.com/unifiedjs/unified#processordatakey-value
