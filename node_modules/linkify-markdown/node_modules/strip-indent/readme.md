# strip-indent [![Build Status](https://travis-ci.org/sindresorhus/strip-indent.svg?branch=master)](https://travis-ci.org/sindresorhus/strip-indent)

> Strip leading whitespace from each line in a string

The line with the least number of leading whitespace, ignoring empty lines, determines the number to remove.

Useful for removing redundant indentation.


## Install

```
$ npm install --save strip-indent
```


## Usage

```js
const stripIndent = require('strip-indent');

const str = '\tunicorn\n\t\tcake';
/*
	unicorn
		cake
*/

stripIndent('\tunicorn\n\t\tcake');
/*
unicorn
	cake
*/
```


## Related

- [strip-indent-cli](https://github.com/sindresorhus/strip-indent-cli) - CLI for this module
- [indent-string](https://github.com/sindresorhus/indent-string) - Indent each line in a string


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
