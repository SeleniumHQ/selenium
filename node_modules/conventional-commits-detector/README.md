# conventional-commits-detector [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Detect what commit message convention your repository is using

[Synopsis of Conventions](https://github.com/ajoslin/conventional-changelog/tree/master/conventions)

## Install

```sh
$ npm install --save conventional-commits-detector
```


## Usage

```js
var conventionalCommitsDetector = require('conventional-commits-detector');

conventionalCommitsDetector([
  'test(matchers): add support for toHaveClass in tests',
  'refactor(WebWorker): Unify WebWorker naming\n\nCloses #3205',
  'feat: upgrade ts2dart to 0.7.1',
  'feat: export a proper promise type'
]);
//=> 'angular'
```


## CLI

```sh
$ npm install -g conventional-commits-detector
$ conventional-commits-detector
angular
$ conventional-commits-detector 10 # number of samples
```


## Related

- [conventional-github-releaser](https://github.com/stevemao/conventional-github-releaser) - Make a new GitHub release from git metadata
- [conventional-changelog](https://github.com/ajoslin/conventional-changelog) - Generate a changelog from git metadata
- [conventional-recommended-bump](https://github.com/stevemao/conventional-recommended-bump) - Get a recommended version bump based on conventional commits


## License

MIT © [Steve Mao](https://github.com/stevema)


[npm-image]: https://badge.fury.io/js/conventional-commits-detector.svg
[npm-url]: https://npmjs.org/package/conventional-commits-detector
[travis-image]: https://travis-ci.org/stevemao/conventional-commits-detector.svg?branch=master
[travis-url]: https://travis-ci.org/stevemao/conventional-commits-detector
[daviddm-image]: https://david-dm.org/stevemao/conventional-commits-detector.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/stevemao/conventional-commits-detector
[coveralls-image]: https://coveralls.io/repos/stevemao/conventional-commits-detector/badge.svg
[coveralls-url]: https://coveralls.io/r/stevemao/conventional-commits-detector
