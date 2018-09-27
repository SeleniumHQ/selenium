# json-dup-key-validator [![NPM version](https://img.shields.io/npm/v/json-dup-key-validator.svg)](https://www.npmjs.com/package/json-dup-key-validator) [![Build Status](https://travis-ci.org/jackyjieliu/json-dup-key-validator.svg?branch=master)](https://travis-ci.org/jackyjieliu/json-dup-key-validator)

A json validator that has an option to check for duplicated keys

## Install
`npm install json-dup-key-validator`
## Usage
```js
var jsonValidator = require('json-dup-key-validator');

// Returns error or undefined if json is valid
jsonValidator.validate(jsonString, allowDuplicatedKeys);

// Returns the object and throws error if any
jsonValidator.parse(jsonString, allowDuplicatedKeys);
```
## API
## .validate(jsonString, allowDuplicatedKeys)
Validates a json string and returns error if any, undefined if the json string is valid.
#### jsonString
Type: `String`

JSON string to parse
#### allowDuplicatedKeys
Type: `Boolean`

Default: `false`

Whether duplicated keys are allowed in an object or not

## .parse(jsonString, allowDuplicatedKeys)
Parses a json string and returns the parsed result. Throws error if the json string is not valid.
#### jsonString
Type: `String`

JSON string to parse
#### allowDuplicatedKeys
Type: `Boolean`

Default: `false`

Whether duplicated keys are allowed in an object or not