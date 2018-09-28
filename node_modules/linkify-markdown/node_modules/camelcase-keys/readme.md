# camelcase-keys [![Build Status](https://travis-ci.org/sindresorhus/camelcase-keys.svg?branch=master)](https://travis-ci.org/sindresorhus/camelcase-keys)

> Convert object keys to camelCase using [`camelcase`](https://github.com/sindresorhus/camelcase)


## Install

```
$ npm install --save camelcase-keys
```


## Usage

```js
const camelcaseKeys = require('camelcase-keys');

// Convert an object
camelcaseKeys({'foo-bar': true});
//=> {fooBar: true}

// Convert an array of objects
camelcaseKeys([{'foo-bar': true}, {'bar-foo': false}]);
//=> [{fooBar: true}, {barFoo: false}]

camelcaseKeys({'foo-bar': true, nested: {unicorn_rainbow: true}}, {deep: true});
//=> {fooBar: true, nested: {unicornRainbow: true}}
```

```js
const camelcaseKeys = require('camelcase-keys');

const argv = require('minimist')(process.argv.slice(2));
//=> {_: [], 'foo-bar': true}

camelcaseKeys(argv);
//=> {_: [], fooBar: true}
```


## API

### camelcaseKeys(input, [options])

#### input

Type: `Object` `Object[]`

Object or array of objects to camelCase.

#### options

Type: `Object`

##### exclude

Type: `string[]` `RegExp[]`<br>
Default: `[]`

Exclude keys from being camelCased.

##### deep

Type: `boolean`<br>
Default: `false`

Recurse nested objects and objects in arrays.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
