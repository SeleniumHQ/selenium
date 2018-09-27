# restify-errors

[![NPM Version](https://img.shields.io/npm/v/restify-errors.svg)](https://npmjs.org/package/restify-errors)
[![Build Status](https://travis-ci.org/restify/errors.svg?branch=master)](https://travis-ci.org/restify/errors)
[![Coverage Status](https://coveralls.io/repos/restify/errors/badge.svg?branch=master)](https://coveralls.io/r/restify/errors?branch=master)
[![Dependency Status](https://david-dm.org/restify/errors.svg)](https://david-dm.org/restify/errors)
[![devDependency Status](https://david-dm.org/restify/errors/dev-status.svg)](https://david-dm.org/restify/errors#info=devDependencies)
[![bitHound Score](https://www.bithound.io/github/restify/errors/badges/score.svg)](https://www.bithound.io/github/restify/errors/master)
[![NSP Status](https://img.shields.io/badge/NSP%20status-no%20vulnerabilities-green.svg)](https://travis-ci.org/restify/errors)

> A collection of HTTP and REST Error constructors.

The constructors can be used to new up Error objects with default status codes
set.

The module ships with the following HttpErrors:

* 400 BadRequestError
* 401 UnauthorizedError
* 402 PaymentRequiredError
* 403 ForbiddenError
* 404 NotFoundError
* 405 MethodNotAllowedError
* 406 NotAcceptableError
* 407 ProxyAuthenticationRequiredError
* 408 RequestTimeoutError
* 409 ConflictError
* 410 GoneError
* 411 LengthRequiredError
* 412 PreconditionFailedError
* 413 RequestEntityTooLargeError
* 414 RequesturiTooLargeError
* 415 UnsupportedMediaTypeError
* 416 RequestedRangeNotSatisfiableError
* 417 ExpectationFailedError
* 418 ImATeapotError
* 422 UnprocessableEntityError
* 423 LockedError
* 423 FailedDependencyError
* 425 UnorderedCollectionError
* 426 UpgradeRequiredError
* 428 PreconditionRequiredError
* 429 TooManyRequestsError
* 431 RequestHeaderFieldsTooLargeError
* 500 InternalServerError
* 501 NotImplementedError
* 502 BadGatewayError
* 503 ServiceUnavailableError
* 504 GatewayTimeoutError
* 505 HttpVersionNotSupportedError
* 506 VariantAlsoNegotiatesError
* 507 InsufficientStorageError
* 509 BandwidthLimitExceededError
* 510 NotExtendedError
* 511 NetworkAuthenticationRequiredError

and the following RestErrors:

* 400 BadDigestError
* 405 BadMethodError
* 500 InternalError
* 409 InvalidArgumentError
* 400 InvalidContentError
* 401 InvalidCredentialsError
* 400 InvalidHeaderError
* 400 InvalidVersionError
* 409 MissingParameterError
* 403 NotAuthorizedError
* 412 PreconditionFailedError
* 400 RequestExpiredError
* 429 RequestThrottledError
* 404 ResourceNotFoundError
* 406 WrongAcceptError

Some of the status codes overlap, since applications can choose the most
applicable error type and status code for a given scenario. Should your given
scenario require something more customized, the Error objects can be customized
with an options object.

## Getting Started

Install the module with: `npm install restify-errors`

## Usage


### Creating Errors

In your application, create errors by using the constructors:

```js
var errors = require('restify-errors');

server.get('/foo', function(req, res, next) {

    if (!req.query.foo) {
        return next(new errors.BadRequestError());
    }

    res.send(200, 'ok!');
    return next();
});
```

### Checking Error types

You can easily do instance checks against the Error objects:

```js
function redirectIfErr(req, res, next) {
    var err = req.data.error;
    if (err) {
        if (err instanceof errors.InternalServerError) {
            next(err);
        } else if (err instanceof errors.NotFoundError) {
            res.redirect('/NotFound', next);
        }
    }
}
```

### Rendering Errors

All Error objects in this module are created with a `body` property. restify
supports 'rendering' Errors as a response using this property. You can pass
Errors to `res.send` and the error will be rendered out as JSON:

```js
function render(req, res, next) {
    res.send(new errors.InternalServerError());
    return next();
}

// => restify will render an application/json response with an http 500:
// {
//     code: 'InternalServerError',
//     message: ''
// }

```

### Customizing Errors

If you'd like to change the status code or message of a built-in Error, you can
pass an options object to the constructor:

```js
function render(req, res, next) {
    var myErr = new errors.InvalidVersionError({
        statusCode: 409,
        message: 'Version not supported with current query params'
    });

    res.send(myErr);
    return next();
}

// => even though InvalidVersionError has a built-in status code of 400, it
//    has been customized with a 409 status code. restify will now render an
//    application/json response with an http 409:
// {
//     code: 'InvalidVersionError',
//     message: 'Version not supported with current query params'
// }

```

### Passing in prior errors (causes)

Like [WError](https://github.com/davepacheco/node-verror), all constructors
accept an Error object as the first argument to build rich Error objects and
stack traces. Assume a previous file lookup failed and an error was passed on:

```js
function wrapError(req, res, next) {

    if (req.error) {
        var myErr = new errors.InternalServerError(req.error, 'bad times!');
        return next(myErr);
    }
    return next();
}
```

This will allow Error objects to maintain context from previous errors, giving
you full visibility into what caused an underlying issue:

```js
console.log(myErr.message);
// => 'bad times!'

console.log(myErr.toString());
// => InternalServerError: bad times!; caused by Error: file lookup failed!

// if you're using Bunyan, you'll get rich stack traces:
bunyanLogger.info(myErr);

InternalServerError: bad times!
    at Object.<anonymous> (/Users/restify/test.js:30:16)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
Caused by: Error: file lookup failed!
    at Object.<anonymous> (/Users/restify/test.js:29:15)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3

```

For more information about building rich errors, check out
[VError](https://github.com/davepacheco/node-verror).


### Subclassing Errors

You can also create your own Error subclasses by using the provided
`makeConstructor()` method. Making a new subclass will add the constructor to
the existing exports object:

```js
errors.makeConstructor('ExecutionError', {
    statusCode: 406,
    failureType: 'motion'
});
var myErr = new errors.ExecutionError('bad joystick input!');

console.log(myErr instanceof ExecutionError);
// => true

console.log(myErr.message);
// => 'ExecutionError: bad joystick input!'

console.log(myErr.failureType);
// => 'motion'

console.log(myErr.statusCode);
// => 406

console.log(myErr.stack);

ExecutionError: bad joystick input!
    at Object.<anonymous> (/Users/restify/test.js:30:16)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```

Custom errors are subclassed from RestError, so you get all the built-in
goodness of HttpError/RestError. The constructor returned to you accepts
all the same signatures accepted by HttpError/RestError.

## API

All error constructors are variadic and accept the following signatures:

### new Error(message)
### new Error(printf, args...)
### new Error(options [, printf, args...])
### new Error(priorErr, message])
### new Error(priorErr [, printf, args...])
### new Error(priorErr, options [, printf, args...])

All [VError and WError](https://github.com/davepacheoco/node-verror) signatures
are also supported, including
[extsprintf](https://github.com/davepacheco/node-extsprintf).

You can pass in a message like a regular error:

* `message` {String} - an error message

Or pass in an options object for more customization:

* `options.message` {String} - an error message string
* `options.statusCode` {Number} - an http status code
* `options.restCode` {Number} - a description code for your Error. This is used
by restify to render an error when it is directly passed to `res.send()`. By
default, it is the name of your error constructor (e.g., the restCode for a
BadDigestError is BadDigest).

In all signatures, you can optionally pass in an Error as the first argument,
which will cause WError to use it as a prior cause:

* `priorErr` {Error} - an Error object

**Returns:** {Error} an Error object

**IMPORTANT:** If a printf style signature is used, the Error message will
prefer that over `options.message`.

### makeConstructor(name [, defaults])

Creates a custom Error constructor, adds it to the existing exports object.

* `name` {String} - the name of your Error
* `defaults` {Object} - an object of default values that will added to the
prototype.

**Returns:** {void}

### makeErrFromCode(name [, args...])

Create an Error object using an http status code. This uses `http` module's
`STATUS_CODES` to do the status code lookup. Thus, this convenience method
is useful only for creating HttpErrors, and not RestErrors.

* `statusCode` {Number} - an http status code
* `args` - arguments to be passed on to the constructor

**Returns:** {Object} an Error object


## Contributing

Add unit tests for any new or changed functionality. Ensure that lint and style
checks pass.

To start contributing, install the git pre-push hooks:

```sh
make githooks
```

Before committing, run the prepush hook:

```sh
make prepush
```

If you have style errors, you can auto fix whitespace issues by running:

```sh
make codestyle-fix
```

## License

Copyright (c) 2015 Alex Liu

Licensed under the MIT license.

