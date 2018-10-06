[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Circle CI Build][circleci-image]][circleci-url]
[![Codecov][codecov-image]][codecov-url]

[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devdependency-image]][devdependency-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/srod/node-version.svg)](https://greenkeeper.io/)

# Node-version

A quick module that returns current node version parsed into parts.

## Installation

```shell
yarn add node-version
```
Or
```shell
npm install node-version
```

## Quick Start

```js
var currentVersion = require('node-version');

/*
console.log(currentVersion);

{
    original: 'v0.4.10', // same as process.version
    short: '0.4',
    long: '0.4.10',
    major: '0',
    minor: '4',
    build: '10'
}
*/
```

## Warning

Version 1.0.0 break 0.1.0 since its API changes.

Change

```js
var currentVersion = new (require('node-version').version);
```

To

```js
var currentVersion = require('node-version');
```

[npm-version-image]: https://img.shields.io/npm/v/node-version.svg
[npm-downloads-image]: https://img.shields.io/npm/dm/node-version.svg
[npm-url]: https://npmjs.org/package/node-version
[travis-image]: https://img.shields.io/travis/srod/node-version/master.svg?label=linux
[travis-url]: https://travis-ci.org/srod/node-version
[appveyor-image]: https://img.shields.io/appveyor/ci/srod/node-version/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/srod/node-version
[dependency-image]: https://img.shields.io/david/srod/node-version.svg?style=flat
[dependency-url]: https://david-dm.org/srod/node-version
[devdependency-image]: https://img.shields.io/david/dev/srod/node-version.svg?style=flat
[devdependency-url]: https://david-dm.org/srod/node-version#info=devDependencies
[circleci-image]: https://circleci.com/gh/srod/node-version/tree/master.svg?style=shield
[circleci-url]: https://circleci.com/gh/srod/node-version/tree/master
[codecov-image]: https://codecov.io/gh/srod/node-version/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/srod/node-version
