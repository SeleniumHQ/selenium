# Changelog

## 2.5.0

Those changes are not released yet.

- In the functional API, invoke the wrapped function callback on abort and emit
  an `abort` event. This makes it possible to detect when abort is called.
- Add a method on the function API, `call.retryIf(predicate)`, which specifies
  a predicate used to determine whether a given error is retriable or not. The
  default behavior is unaffected, errors remain retriable by default.

## 2.4.1

- Add support for specifying the factor to use in the `ExponentialStrategy`.

## 2.4.0

- Replace `FunctionCall.getResults` by `FunctionCall.getLastResult` to avoid
  storing intermediary results forever as this may lead to memory exhaustion
  when used in conjunction with an infinite number of backoffs.
- Add `FunctionCall.getNumRetries` which returns the number of times the
  wrapped function was retried.

## 2.3.0

- Add four new methods to `FunctionCall` to query the state of the call.
  - isPending
  - isRunning
  - isCompleted
  - isAborted

## 2.2.0

- To match `Backoff` default behavior, `FunctionCall` no longer sets a
  default failAfter of 5, i.e. the maximum number of backoffs is now
  unbounded by default.

## 2.1.0

- `Backoff.backoff` now accepts an optional error argument that is re-emitted
  as the last argument of the `backoff` and `fail` events. This provides some
  context to the listeners as to why a given backoff operation was attempted.
- The `backoff` event emitted by the `FunctionCall` class now contains, as its
  last argument, the error that caused the backoff operation to be attempted.
  This provides some context to the listeners as to why a given backoff
  operation was attempted.

## 2.0.0

- `FunctionCall.call` renamed into `FunctionCall.start`.
- `backoff.call` no longer invokes the wrapped function on `nextTick`. That
  way, the first attempt is not delayed until the end of the current event
  loop.

## 1.2.1

- Make `FunctionCall.backoffFactory` a private member.

## 1.2.0

- Add `backoff.call` and the associated `FunctionCall` class.

## 1.1.0

- Add a `Backoff.failAfter`.

## 1.0.0

- Rename `start` and `done` events `backoff` and `ready`.
- Remove deprecated `backoff.fibonnaci`.

## 0.2.1

- Create `backoff.fibonacci`.
- Deprecate `backoff.fibonnaci`.
- Expose fibonacci and exponential strategies.

## 0.2.0

- Provide exponential and fibonacci backoffs.

## 0.1.0

- Change `initialTimeout` and `maxTimeout` to `initialDelay` and `maxDelay`.
- Use fibonnaci backoff.
