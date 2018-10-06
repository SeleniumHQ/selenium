# delay [![Build Status](https://travis-ci.org/sindresorhus/delay.svg?branch=master)](https://travis-ci.org/sindresorhus/delay)

> Delay a promise a specified amount of time


## Install

```
$ npm install delay
```


## Usage

```js
const delay = require('delay');

(async () => {
	bar();

	await delay(100);

	// Executed 100 milliseconds later
	baz();
})();
```


## API

### delay(milliseconds, [options])

Create a promise which resolves after the specified `milliseconds`.

### delay.reject(milliseconds, [options])

Create a promise which rejects after the specified `milliseconds`.

#### milliseconds

Type: `number`

Milliseconds to delay the promise.

#### options

Type: `Object`

##### value

Type: `any`

Optional value to resolve or reject in the returned promise.

##### signal

Type: [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)

The returned promise will be rejected with an AbortError if the signal is aborted. AbortSignal is available in all modern browsers and there is a [ponyfill for Node.js](https://github.com/mysticatea/abort-controller).

### delayPromise.clear()

Clears the delay and settles the promise.


## Advanced usage

Passing a value:

```js
const delay = require('delay');

(async() => {
	const result = await delay(100, {value: '🦄'});

	// Executed after 100 milliseconds
	console.log(result);
	//=> '🦄'
})();
```

Using `delay.reject()`, which optionally accepts a value and rejects it `ms` later:

```js
const delay = require('delay');

(async () => {
	try {
		await delay.reject(100, {value: new Error('🦄')});

		console.log('This is never executed');
	} catch (error) {
		// 100 milliseconds later
		console.log(error);
		//=> [Error: 🦄]
	}
})();
```

You can settle the delay early by calling `.clear()`:

```js
const delay = require('delay');

(async () => {
	const delayedPromise = delay(1000, {value: 'Done'});

	setTimeout(() => {
		delayedPromise.clear();
	}, 500);

	// 500 milliseconds later
	console.log(await delayedPromise);
	//=> 'Done'
})();
```

You can abort the delay with an AbortSignal:

```js
const delay = require('delay');

(async () => {
	const abortController = new AbortController();

	setTimeout(() => {
		abortController.abort();
	}, 500);

	try {
		await delay(1000, {signal: abortController.signal});
	} catch (error) {
		// 500 milliseconds later
		console.log(error.name)
		//=> 'AbortError'
	}
})();
```


## Related

- [delay-cli](https://github.com/sindresorhus/delay-cli) - CLI for this module
- [p-cancelable](https://github.com/sindresorhus/p-cancelable) - Create a promise that can be canceled
- [p-min-delay](https://github.com/sindresorhus/p-min-delay) - Delay a promise a minimum amount of time
- [p-immediate](https://github.com/sindresorhus/p-immediate) - Returns a promise resolved in the next event loop - think `setImmediate()`
- [p-timeout](https://github.com/sindresorhus/p-timeout) - Timeout a promise after a specified amount of time
- [More…](https://github.com/sindresorhus/promise-fun)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
