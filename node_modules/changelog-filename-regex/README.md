# changelog-filename-regex

[![npm version](https://img.shields.io/npm/v/changelog-filename-regex.svg)](https://www.npmjs.com/package/changelog-filename-regex)
[![Build Status](https://travis-ci.org/shinnn/changelog-filename-regex.svg?branch=master)](https://travis-ci.org/shinnn/changelog-filename-regex)

A [regular expression](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp) that matches a CHANGELOG filename

```javascript
const changelogFilenameRegex = require('changelog-filename-regex');

changelogFilenameRegex.test('CHANGELOG.md'); //=> true
changelogFilenameRegex.test('README.txt'); //=> false
```

*In most cases there is no need to use this regular expression directly. Developers would rather use [is-changelog-path](https://github.com/shinnn/is-changelog-path).*

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install changelog-filename-regex
```

## API

```javascript
import changelogFilenameRegex from 'changelog-filename-regex';
```

### changelogFilenameRegex

Type: [`RegExp`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

```javascript
// Returns `true`
changelogFilenameRegex.test('CHANGELOG');
changelogFilenameRegex.test('CHANGELOG.txt');
changelogFilenameRegex.test('CHANGELOG.md');
changelogFilenameRegex.test('ChangeLog');
changelogFilenameRegex.test('Release Note');
changelogFilenameRegex.test('UPDATES');
changelogFilenameRegex.test('History.rdoc');

// Returns `false`
changelogFilenameRegex.test('LICENSE');
changelogFilenameRegex.test('change.log');
changelogFilenameRegex.test('CHANGE\nLOG');
changelogFilenameRegex.test('  changelog  ');
changelogFilenameRegex.test('\u0000ChangeLog');
changelogFilenameRegex.test('CHANGELOG.');
```

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe
