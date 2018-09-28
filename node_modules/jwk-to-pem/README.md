# jwk-to-pem

[![Build Status](https://travis-ci.org/Brightspace/node-jwk-to-pem.svg?branch=master)](https://travis-ci.org/Brightspace/node-jwk-to-pem) [![Coverage Status](https://coveralls.io/repos/Brightspace/node-jwk-to-pem/badge.svg)](https://coveralls.io/r/Brightspace/node-jwk-to-pem)

Convert a [json web key][jwk] to a PEM for use by OpenSSL or `crytpo`.

## Install
```sh
npm install jwk-to-pem --save
```

## Usage
```js
var jwkToPem = require('jwk-to-pem'),
	jwt = require('jsonwebtoken');

var jwk = { kty: 'EC', crv: 'P-256', x: '...', y: '...' },
	pem = jwkToPem(jwk);

jwt.verify(token, pem);
```

### Support

key type | support level
---------|--------------
 RSA     | all RSA keys
 EC      | _P-256_, _P-384_, and _P-521_ curves

### API

---

#### `jwkToPem(Object jwk[, Object options])` -> `String`

The first parameter should be an Object representing the jwk, it may be public
or private. By default, either of the two will be made into a public PEM. The
call will throw if the input jwk is malformed or does not represent a valid
key.

##### Option: private `Boolean` _(false)_

You may optionally specify that you would like a private PEM. This can be done
by passing `true` to the `private` option. The call will throw if the necessary
private parameters are not available.


## Contributing

1. **Fork** the repository. Committing directly against this repository is
   highly discouraged.

2. Make your modifications in a branch, updating and writing new unit tests
   as necessary in the `spec` directory.

3. Ensure that all tests pass with `npm test`

4. `rebase` your changes against master. *Do not merge*.

5. Submit a pull request to this repository. Wait for tests to run and someone
   to chime in.

### Code Style

This repository is configured with [EditorConfig][EditorConfig], [jscs][jscs]
and [JSHint][JSHint] rules.

[algs]: https://tools.ietf.org/html/rfc7518#section-3.1
[jwk]: https://tools.ietf.org/html/rfc7517
[EditorConfig]: http://editorconfig.org/
[jscs]: http://jscs.info/
[JSHint]: http://jshint.com/
