# Change log

## 3.1.0
- rev dependencies

## 3.0.0
- restify/node-restify#844 Errors now live in its own repo and npm module.
- all error constructors now support [VError](https://github.com/davepacheco/node-verror) constructor args.
- Support subclass and custom error types via `makeConstructor()`
- Support creating errors using HTTP status codes via `makeErrFromCode()`. Was
  previously a private method used to create internal error types, this is now
  exposed publicly for user consumption.

