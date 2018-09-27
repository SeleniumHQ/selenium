# p-all [![Build Status](https://travis-ci.org/sindresorhus/p-all.svg?branch=master)](https://travis-ci.org/sindresorhus/p-all)

> Run promise-returning & async functions concurrently with optional limited concurrency

Similar to `Promise.all()`, but accepts functions instead of promises directly so you can limit the concurrency.

If you're doing the same in each call, you should use [`p-map`](https://github.com/sindresorhus/p-map) instead.


## Install

```
$ npm install --save p-all
```


## Usage

```js
const pAll = require('p-all');
const got = require('got');

const actions = [
	() => got('sindresorhus.com'),
	() => got('ava.li'),
	() => checkSomething(),
	() => doSomethingElse()
];

pAll(actions, {concurrency: 2}).then(result => {
	console.log(result);
});
```


## API

### pAll(input, [options])

Returns a `Promise` that is fulfilled when all promises returned from calling the functions in `input` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values in `input` order.

#### input

Type: `Iterable<Function>`

Iterable with promise-returning/async functions.

#### options

Type: `Object`

##### concurrency

Type: `number`<br>
Default: `Infinity`

Number of concurrent pending promises.


## Related

- [p-map](https://github.com/sindresorhus/p-map) - Map over promises concurrently
- [p-props](https://github.com/sindresorhus/p-props) - Like `Promise.all()` but for `Map` and `Object`
- [p-limit](https://github.com/sindresorhus/p-limit) - Run multiple promise-returning & async functions with limited concurrency
- [More…](https://github.com/sindresorhus/promise-fun)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
