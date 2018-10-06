# meow [![Build Status](https://travis-ci.org/sindresorhus/meow.svg?branch=master)](https://travis-ci.org/sindresorhus/meow)

> CLI app helper

![](meow.gif)


## Features

- Parses arguments
- Converts flags to [camelCase](https://github.com/sindresorhus/camelcase)
- Outputs version when `--version`
- Outputs description and supplied help text when `--help`
- Makes unhandled rejected promises [fail loudly](https://github.com/sindresorhus/loud-rejection) instead of the default silent fail
- Sets the process title to the binary name defined in package.json


## Install

```
$ npm install meow
```


## Usage

```
$ ./foo-app.js unicorns --rainbow
```

```js
#!/usr/bin/env node
'use strict';
const meow = require('meow');
const foo = require('.');

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

foo(cli.input[0], cli.flags);
```


## API

### meow(options, [minimistOptions])

Returns an `Object` with:

- `input` *(Array)* - Non-flag arguments
- `flags` *(Object)* - Flags converted to camelCase
- `pkg` *(Object)* - The `package.json` object
- `help` *(string)* - The help text used with `--help`
- `showHelp([code=2])` *(Function)* - Show the help text and exit with `code`
- `showVersion()` *(Function)* - Show the version text and exit

#### options

Type: `Object` `Array` `string`

Can either be a string/array that is the `help` or an options object.

##### flags

Type: `Object`

Define argument flags.

The key is the flag name and the value is an object with any of:

- `type`: Type of value. (Possible values: `string` `boolean`)
- `alias`: Usually used to define a short flag alias.
- `default`: Default value when the flag is not specified.

Example:

```js
flags: {
	unicorn: {
		type: 'string',
		alias: 'u',
		default: 'rainbow'
	}
}
```


##### description

Type: `string` `boolean`<br>
Default: The package.json `"description"` property

Description to show above the help text.

Set it to `false` to disable it altogether.

##### help

Type: `string` `boolean`

The help text you want shown.

The input is reindented and starting/ending newlines are trimmed which means you can use a [template literal](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings) without having to care about using the correct amount of indent.

The description will be shown above your help text automatically.

##### version

Type: `string` `boolean`<br>
Default: The package.json `"version"` property

Set a custom version output.

##### autoHelp

Type: `boolean`<br>
Default: `true`

Automatically show the help text when the `--help` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own help text.

##### autoVersion

Type: `boolean`<br>
Default: `true`

Automatically show the version text when the `--version` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own version text.

##### pkg

Type: `Object`<br>
Default: Closest package.json upwards

package.json as an `Object`.

*You most likely don't need this option.*

##### argv

Type: `Array`<br>
Default: `process.argv.slice(2)`

Custom arguments object.

##### inferType

Type: `boolean`<br>
Default: `false`

Infer the argument type.

By default, the argument `5` in `$ foo 5` becomes a string. Enabling this would infer it as a number.


## Promises

Meow will make unhandled rejected promises [fail loudly](https://github.com/sindresorhus/loud-rejection) instead of the default silent fail. Meaning you don't have to manually `.catch()` promises used in your CLI.


## Tips

See [`chalk`](https://github.com/chalk/chalk) if you want to colorize the terminal output.

See [`get-stdin`](https://github.com/sindresorhus/get-stdin) if you want to accept input from stdin.

See [`conf`](https://github.com/sindresorhus/conf) if you need to persist some data.

See [`update-notifier`](https://github.com/yeoman/update-notifier) if you want update notifications.

[More useful CLI utilities…](https://github.com/sindresorhus/awesome-nodejs#command-line-utilities)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
