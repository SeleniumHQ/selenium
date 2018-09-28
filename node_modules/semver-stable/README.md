[![NPM version](https://badge.fury.io/js/semver-stable.svg)](http://badge.fury.io/js/semver-stable)
[![Build Status](https://travis-ci.org/kaelzhang/node-semver-stable.svg?branch=master)](https://travis-ci.org/kaelzhang/node-semver-stable)
[![Dependency Status](https://david-dm.org/kaelzhang/node-semver-stable.svg)](https://david-dm.org/kaelzhang/node-semver-stable)

# semver-stable

Manage stable semver versions

## Install

```bash
$ npm install semver-stable --save
```

## Usage

```js
var stable = require('semver-stable');
```

### stable.is(version)

```js
stable.is('1.2.3');        // -> true
stable.is('1.2.3-stable'); // -> false
stable.is('1.2.3-alpha');  // -> false
```

Returns `Boolean` whether the `version` is stable.


### stable.maxSatisfying(versions, range)

- versions `Array.<semver>`
- range `String` semver range

```js
stable.maxSatisfying([
  '1.3.3',      // not match the range
  '1.2.3-beta', // not a stable version
  '1.2.2',      // that's it
  '1.2.1',      // much older
  '1.1.2'
], '~1.2.0');
// -> 1.2.2
```

Returns `String` the latest stable version matches the range.


### stable.max(versions);

Returns `String` the max stable version.

## License

MIT
