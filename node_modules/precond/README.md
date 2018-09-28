# Preconditions for Node.js
[![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-precond.png?branch=master)](https://travis-ci.org/MathieuTurcotte/node-precond)
[![NPM version](https://badge.fury.io/js/precond.png)](http://badge.fury.io/js/precond)

Precondition checks for Node.js inspired by [Guava's precondition checking
utilities](https://code.google.com/p/guava-libraries/wiki/PreconditionsExplained).

## Installation

```
npm install precond
```

## Unit tests

```
npm test
```

## Overview

Precond provides a set of functions to verify arguments and state correctness

It lets you rewrite constructs like the following

```js
if (!this.isConnected) {
    throw new Error('Client should be connected before calling X.');
}
```

into a more compact and declarative check bellow.

```js
precond.checkState(this.isConnected, 'Client should be ...');
```

**Note that even though the throw statement is wrapped in a function, the call
stack will still start from the calling function. So the previous examples would
both produce the same stack trace.**

All arguments after the message will be used to format the actual error
message that will be thrown.

The following precondition checks are provded:

- checkArgument(value, [messageFormat, [formatArgs, ...]])
- checkState(value, [messageFormat, [formatArgs, ...]])
- checkIsDef(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsDefAndNotNull(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsString(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsArray(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsNumber(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsBoolean(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsFunction(value, [messageFormat, [formatArgs, ...]]) -> value
- checkIsObject(value, [messageFormat, [formatArgs, ...]]) -> value

## API

### Static functions

#### precond.checkArgument(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be truthy
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is true. Throws an `IllegalArgumentError` if value
is false.

#### precond.checkState(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be truthy
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is true. Throws an `IllegalStateError` if value
is false.

#### precond.checkIsDef(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be defined
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is defined (could be null). Throws an
`IllegalArgumentError` if value is undefined. Returns the value of
the value that was validated.

#### precond.checkIsDefAndNotNull(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be defined and not null
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is defined and not null. Throws an
`IllegalArgumentError` if value is undefined or null. Returns the value of
the value that was validated.

#### precond.checkIsString(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be a string
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is a string or a String object. Throws an
`IllegalArgumentError` if value isn't a string. Returns the value of
the value that was validated.

#### precond.checkIsArray(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be an array
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is an array. Throws an `IllegalArgumentError` if
value isn't an array. Returns the value of the value that was
validated.

#### precond.checkIsNumber(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be a number
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is a number. Throws an `IllegalArgumentError` if
value isn't a number. Returns the value of the value that was
validated.

#### precond.checkIsBoolean(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be a boolean
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is a boolean. Throws an `IllegalArgumentError` if
value isn't a boolean. Returns the value of the value that was
validated.

#### precond.checkIsFunction(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be a function
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is a function. Throws an `IllegalArgumentError` if
value isn't a function. Returns the value of the value that was
validated.

#### precond.checkIsObject(value, [messageFormat, [formatArgs, ...]])

- value: the value that is required to be an object
- messageFormat: error message format template
- formatArgs: arguments to be substituted into the message template

Ensures that value is an object. Throws an `IllegalArgumentError` if
value isn't an object. Returns the value of the value that was
validated.

### Class precond.IllegalArgumentError

Extends `Error` and is thrown to signal illegal arguments.

### Class precond.IllegalStateError

Extends `Error` and is thrown to signal that the program or object has reached
an illegal state.

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
