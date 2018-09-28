# minimist-options [![Build Status](https://travis-ci.org/vadimdemedes/minimist-options.svg?branch=master)](https://travis-ci.org/vadimdemedes/minimist-options)

> Write options for [minimist](https://npmjs.org/package/minimist) in a comfortable way.

## Installation

```
$ npm install --save minimist-options
```

## Usage

```js
const buildOptions = require('minimist-options');
const minimist = require('minimist');

const options = buildOptions({
	name: {
		type: 'string',
		alias: 'n',
		default: 'john'
	},

	force: {
		type: 'boolean',
		alias: ['f', 'o'],
		default: false
	},

	published: 'boolean',

	// special option for positional arguments (`_` in minimist)
	arguments: 'string'
});

const args = minimist(options);
```

instead of:

```js
const minimist = require('minimist');

const options = {
	string: ['name', '_'],
	boolean: ['force', 'published'],
	alias: {
		n: 'name',
		f: 'force',
		o: 'force'
	},
	default: {
		name: 'john',
		f: false
	}
};

const args = minimist(options);
```

## License

MIT © [Vadim Demedes](https://vadimdemedes.com)
