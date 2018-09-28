# map-obj [![Build Status](https://travis-ci.org/sindresorhus/map-obj.svg?branch=master)](https://travis-ci.org/sindresorhus/map-obj)

> Map object keys and values into a new object


## Install

```
$ npm install --save map-obj
```


## Usage

```js
const mapObj = require('map-obj');

const newObject = mapObj({foo: 'bar'}, (key, value) => [value, key]);
//=> {bar: 'foo'}
```


## API

### mapObj(source, mapper, [options])

#### source

Type: `Object`

Source object to copy properties from.

#### mapper

Type: `Function`

Mapping function.

- It has signature `mapper(sourceKey, sourceValue, source)`.
- It must return a two item array: `[targetKey, targetValue]`.

#### deep

Type: `boolean`<br>
Default: `false`

Recurse nested objects and objects in arrays.

#### target

Type: `Object`<br>
Default: `{}`

Target object to map properties on to.


## Related

- [filter-obj](https://github.com/sindresorhus/filter-obj) - Filter object keys and values into a new object
- [object-assign](https://github.com/sindresorhus/object-assign) - Copy enumerable own properties from one or more source objects to a target object


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
