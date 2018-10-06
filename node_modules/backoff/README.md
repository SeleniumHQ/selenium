# Backoff for Node.js
[![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-backoff.png?branch=master)](http://travis-ci.org/MathieuTurcotte/node-backoff)
[![NPM version](https://badge.fury.io/js/backoff.png)](http://badge.fury.io/js/backoff)

Fibonacci and exponential backoffs for Node.js.

## Installation

```
npm install backoff
```

## Unit tests

```
npm test
```

## Usage

### Object Oriented

The usual way to instantiate a new `Backoff` object is to use one predefined
factory method: `backoff.fibonacci([options])`, `backoff.exponential([options])`.

`Backoff` inherits from `EventEmitter`. When a backoff starts, a `backoff`
event is emitted and, when a backoff ends, a `ready` event is emitted.
Handlers for these two events are called with the current backoff number and
delay.

``` js
var backoff = require('backoff');

var fibonacciBackoff = backoff.fibonacci({
    randomisationFactor: 0,
    initialDelay: 10,
    maxDelay: 300
});

fibonacciBackoff.failAfter(10);

fibonacciBackoff.on('backoff', function(number, delay) {
    // Do something when backoff starts, e.g. show to the
    // user the delay before next reconnection attempt.
    console.log(number + ' ' + delay + 'ms');
});

fibonacciBackoff.on('ready', function(number, delay) {
    // Do something when backoff ends, e.g. retry a failed
    // operation (DNS lookup, API call, etc.). If it fails
    // again then backoff, otherwise reset the backoff
    // instance.
    fibonacciBackoff.backoff();
});

fibonacciBackoff.on('fail', function() {
    // Do something when the maximum number of backoffs is
    // reached, e.g. ask the user to check its connection.
    console.log('fail');
});

fibonacciBackoff.backoff();
```

The previous example would print the following.

```
0 10ms
1 10ms
2 20ms
3 30ms
4 50ms
5 80ms
6 130ms
7 210ms
8 300ms
9 300ms
fail
```

Note that `Backoff` objects are meant to be instantiated once and reused
several times by calling `reset` after a successful "retry".

### Functional

It's also possible to avoid some boilerplate code when invoking an asynchronous
function in a backoff loop by using `backoff.call(fn, [args, ...], callback)`.

Typical usage looks like the following.

``` js
var call = backoff.call(get, 'https://duplika.ca/', function(err, res) {
    console.log('Num retries: ' + call.getNumRetries());

    if (err) {
        console.log('Error: ' + err.message);
    } else {
        console.log('Status: ' + res.statusCode);
    }
});

call.retryIf(function(err) { return err.status == 503; });
call.setStrategy(new backoff.ExponentialStrategy());
call.failAfter(10);
call.start();
```

## API

### backoff.fibonacci([options])

Constructs a Fibonacci backoff (10, 10, 20, 30, 50, etc.).

The options are the following.

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms

With these values, the backoff delay will increase from 100 ms to 10000 ms. The
randomisation factor controls the range of randomness and must be between 0
and 1. By default, no randomisation is applied on the backoff delay.

### backoff.exponential([options])

Constructs an exponential backoff (10, 20, 40, 80, etc.).

The options are the following.

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms
- factor: defaults to 2, must be greater than 1

With these values, the backoff delay will increase from 100 ms to 10000 ms. The
randomisation factor controls the range of randomness and must be between 0
and 1. By default, no randomisation is applied on the backoff delay.

### backoff.call(fn, [args, ...], callback)

- fn: function to call in a backoff handler, i.e. the wrapped function
- args: function's arguments
- callback: function's callback accepting an error as its first argument

Constructs a `FunctionCall` instance for the given function. The wrapped
function will get retried until it succeds or reaches the maximum number
of backoffs. In both cases, the callback function will be invoked with the
last result returned by the wrapped function.

It is the caller's responsability to initiate the call by invoking the
`start` method on the returned `FunctionCall` instance.

### Class Backoff

#### new Backoff(strategy)

- strategy: the backoff strategy to use

Constructs a new backoff object from a specific backoff strategy. The backoff
strategy must implement the `BackoffStrategy`interface defined bellow.

#### backoff.failAfter(numberOfBackoffs)

- numberOfBackoffs: maximum number of backoffs before the fail event gets
emitted, must be greater than 0

Sets a limit on the maximum number of backoffs that can be performed before
a fail event gets emitted and the backoff instance is reset. By default, there
is no limit on the number of backoffs that can be performed.

#### backoff.backoff([err])

Starts a backoff operation. If provided, the error parameter will be emitted
as the last argument of the `backoff` and `fail` events to let the listeners
know why the backoff operation was attempted.

An error will be thrown if a backoff operation is already in progress.

In practice, this method should be called after a failed attempt to perform a
sensitive operation (connecting to a database, downloading a resource over the
network, etc.).

#### backoff.reset()

Resets the backoff delay to the initial backoff delay and stop any backoff
operation in progress. After reset, a backoff instance can and should be
reused.

In practice, this method should be called after having successfully completed
the sensitive operation guarded by the backoff instance or if the client code
request to stop any reconnection attempt.

#### Event: 'backoff'

- number: number of backoffs since last reset, starting at 0
- delay: backoff delay in milliseconds
- err: optional error parameter passed to `backoff.backoff([err])`

Emitted when a backoff operation is started. Signals to the client how long
the next backoff delay will be.

#### Event: 'ready'

- number: number of backoffs since last reset, starting at 0
- delay: backoff delay in milliseconds

Emitted when a backoff operation is done. Signals that the failing operation
should be retried.

#### Event: 'fail'

- err: optional error parameter passed to `backoff.backoff([err])`

Emitted when the maximum number of backoffs is reached. This event will only
be emitted if the client has set a limit on the number of backoffs by calling
`backoff.failAfter(numberOfBackoffs)`. The backoff instance is automatically
reset after this event is emitted.

### Interface BackoffStrategy

A backoff strategy must provide the following methods.

#### strategy.next()

Computes and returns the next backoff delay.

#### strategy.reset()

Resets the backoff delay to its initial value.

### Class ExponentialStrategy

Exponential (10, 20, 40, 80, etc.) backoff strategy implementation.

#### new ExponentialStrategy([options])

The options are the following.

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms
- factor: defaults to 2, must be greater than 1

### Class FibonacciStrategy

Fibonnaci (10, 10, 20, 30, 50, etc.) backoff strategy implementation.

#### new FibonacciStrategy([options])

The options are the following.

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms

### Class FunctionCall

This class manages the calling of an asynchronous function within a backoff
loop.

This class should rarely be instantiated directly since the factory method
`backoff.call(fn, [args, ...], callback)` offers a more convenient and safer
way to create `FunctionCall` instances.

#### new FunctionCall(fn, args, callback)

- fn: asynchronous function to call
- args: an array containing fn's args
- callback: fn's callback

Constructs a function handler for the given asynchronous function.

#### call.isPending()

Returns whether the call is pending, i.e. hasn't been started.

#### call.isRunning()

Returns whether the call is in progress.

#### call.isCompleted()

Returns whether the call is completed.

#### call.isAborted()

Returns whether the call is aborted.

#### call.setStrategy(strategy)

- strategy: strategy instance to use, defaults to `FibonacciStrategy`.

Sets the backoff strategy to use. This method should be called before
`call.start()` otherwise an exception will be thrown.

#### call.failAfter(maxNumberOfBackoffs)

- maxNumberOfBackoffs: maximum number of backoffs before the call is aborted

Sets the maximum number of backoffs before the call is aborted. By default,
there is no limit on the number of backoffs that can be performed.

This method should be called before `call.start()` otherwise an exception will
be thrown..

#### call.retryIf(predicate)

- predicate: a function which takes in as its argument the error returned
by the wrapped function and determines whether it is retriable.

Sets the predicate which will be invoked to determine whether a given error
should be retried or not, e.g. a network error would be retriable while a type
error would stop the function call. By default, all errors are considered to be
retriable.

This method should be called before `call.start()` otherwise an exception will
be thrown.

#### call.getLastResult()

Returns an array containing the last arguments passed to the completion callback
of the wrapped function. For example, to get the error code returned by the last
call, one would do the following.

``` js
var results = call.getLastResult();
// The error code is the first parameter of the callback.
var error = results[0];
```

Note that if the call was aborted, it will contain the abort error and not the
last error returned by the wrapped function.

#### call.getNumRetries()

Returns the number of times the wrapped function call was retried. For a
wrapped function that succeeded immediately, this would return 0. This
method can be called at any point in time during the call life cycle, i.e.
before, during and after the wrapped function invocation.

#### call.start()

Initiates the call the wrapped function. This method should only be called
once otherwise an exception will be thrown.

#### call.abort()

Aborts the call and causes the completion callback to be invoked with an abort
error if the call was pending or running; does nothing otherwise. This method
can safely be called mutliple times.

#### Event: 'call'

- args: wrapped function's arguments

Emitted each time the wrapped function is called.

#### Event: 'callback'

- results: wrapped function's return values

Emitted each time the wrapped function invokes its callback.

#### Event: 'backoff'

- number: backoff number, starts at 0
- delay: backoff delay in milliseconds
- err: the error that triggered the backoff operation

Emitted each time a backoff operation is started.

#### Event: 'abort'

Emitted when a call is aborted.

## Annotated source code

The annotated source code can be found at [mathieuturcotte.github.io/node-backoff/docs](http://mathieuturcotte.github.io/node-backoff/docs/).

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
