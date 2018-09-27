#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status][coveralls-image]][coveralls-url]

> Get raw git commits out of your repository using git-log(1)


## Install

```sh
$ npm install --save git-raw-commits
```


## Usage

```js
var gitRawCommits = require('git-raw-commits');

gitRawCommits(options)
  .pipe(...);
```


## API

### gitRawCommits([options])

Returns a readable stream. Stream is split to break on each commit.

#### options

Type: `object`

Please check the available options at http://git-scm.com/docs/git-log.
**NOTE:** Single dash arguments are not supported because of https://github.com/sindresorhus/dargs/blob/master/index.js#L5.

*NOTE*: for `<revision range>` we can also use `<from>..<to>` pattern, and this module has the following extra options for shortcut of this patter:

##### from

Type: `string` Default: `''`

##### to

Type: `string` Default: `'HEAD'`

This module also have the following additions:

##### format

Type: `string` Default: `'%B'`

Please check http://git-scm.com/docs/git-log for format options.


## CLI

```sh
$ npm install --global git-raw-commits
```

```sh
$ git-raw-commits --help

  Get raw git commits out of your repository using git-log(1)

  Usage
    git-raw-commits [<git-log(1)-options>]

  Example
    git-raw-commits --from HEAD~2 --to HEAD^
```


## License

MIT © [Steve Mao](https://github.com/stevemao)


[npm-image]: https://badge.fury.io/js/git-raw-commits.svg
[npm-url]: https://npmjs.org/package/git-raw-commits
[travis-image]: https://travis-ci.org/stevemao/git-raw-commits.svg?branch=master
[travis-url]: https://travis-ci.org/stevemao/git-raw-commits
[daviddm-image]: https://david-dm.org/stevemao/git-raw-commits.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/stevemao/git-raw-commits
[coveralls-image]: https://coveralls.io/repos/stevemao/git-raw-commits/badge.svg
[coveralls-url]: https://coveralls.io/r/stevemao/git-raw-commits
