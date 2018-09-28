/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var assert = require('assert');
var events = require('events');
var sinon = require('sinon');
var util = require('util');

var FunctionCall = require('../lib/function_call');

function MockBackoff() {
    events.EventEmitter.call(this);

    this.reset = sinon.spy();
    this.backoff = sinon.spy();
    this.failAfter = sinon.spy();
}
util.inherits(MockBackoff, events.EventEmitter);

exports["FunctionCall"] = {
    setUp: function(callback) {
        this.wrappedFn = sinon.stub();
        this.callback = sinon.stub();
        this.backoff = new MockBackoff();
        this.backoffFactory = sinon.stub();
        this.backoffFactory.returns(this.backoff);
        callback();
    },

    tearDown: function(callback) {
        callback();
    },

    "constructor's first argument should be a function": function(test) {
        test.throws(function() {
            new FunctionCall(1, [], function() {});
        }, /Expected fn to be a function./);
        test.done();
    },

    "constructor's last argument should be a function": function(test) {
        test.throws(function() {
            new FunctionCall(function() {}, [], 3);
        }, /Expected callback to be a function./);
        test.done();
    },

    "isPending should return false once the call is started": function(test) {
        this.wrappedFn.
            onFirstCall().yields(new Error()).
            onSecondCall().yields(null, 'Success!');
        var call = new FunctionCall(this.wrappedFn, [], this.callback);

        test.ok(call.isPending());

        call.start(this.backoffFactory);
        test.ok(!call.isPending());

        this.backoff.emit('ready');
        test.ok(!call.isPending());

        test.done();
    },

    "isRunning should return true when call is in progress": function(test) {
        this.wrappedFn.
            onFirstCall().yields(new Error()).
            onSecondCall().yields(null, 'Success!');
        var call = new FunctionCall(this.wrappedFn, [], this.callback);

        test.ok(!call.isRunning());

        call.start(this.backoffFactory);
        test.ok(call.isRunning());

        this.backoff.emit('ready');
        test.ok(!call.isRunning());

        test.done();
    },

    "isCompleted should return true once the call completes": function(test) {
        this.wrappedFn.
            onFirstCall().yields(new Error()).
            onSecondCall().yields(null, 'Success!');
        var call = new FunctionCall(this.wrappedFn, [], this.callback);

        test.ok(!call.isCompleted());

        call.start(this.backoffFactory);
        test.ok(!call.isCompleted());

        this.backoff.emit('ready');
        test.ok(call.isCompleted());

        test.done();
    },

    "isAborted should return true once the call is aborted": function(test) {
        this.wrappedFn.
            onFirstCall().yields(new Error()).
            onSecondCall().yields(null, 'Success!');
        var call = new FunctionCall(this.wrappedFn, [], this.callback);

        test.ok(!call.isAborted());
        call.abort();
        test.ok(call.isAborted());

        test.done();
    },

    "setStrategy should overwrite the default strategy": function(test) {
        var replacementStrategy = {};
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.setStrategy(replacementStrategy);
        call.start(this.backoffFactory);
        test.ok(this.backoffFactory.calledWith(replacementStrategy),
            'User defined strategy should be used to instantiate ' +
            'the backoff instance.');
        test.done();
    },

    "setStrategy should throw if the call is in progress": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.start(this.backoffFactory);
        test.throws(function() {
            call.setStrategy({});
        }, /in progress/);
        test.done();
    },

    "failAfter should not be set by default": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
            call.start(this.backoffFactory);
            test.equal(0, this.backoff.failAfter.callCount);
        test.done();
    },

    "failAfter should be used as the maximum number of backoffs": function(test) {
        var failAfterValue = 99;
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.failAfter(failAfterValue);
        call.start(this.backoffFactory);
        test.ok(this.backoff.failAfter.calledWith(failAfterValue),
            'User defined maximum number of backoffs shoud be ' +
            'used to configure the backoff instance.');
        test.done();
    },

    "failAfter should throw if the call is in progress": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.start(this.backoffFactory);
        test.throws(function() {
            call.failAfter(1234);
        }, /in progress/);
        test.done();
    },

    "start shouldn't allow overlapping invocation": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        var backoffFactory = this.backoffFactory;

        call.start(backoffFactory);
        test.throws(function() {
            call.start(backoffFactory);
        }, /already started/);
        test.done();
    },

    "start shouldn't allow invocation of aborted call": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        var backoffFactory = this.backoffFactory;

        call.abort();
        test.throws(function() {
            call.start(backoffFactory);
        }, /aborted/);
        test.done();
    },

    "call should forward its arguments to the wrapped function": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        call.start(this.backoffFactory);
        test.ok(this.wrappedFn.calledWith(1, 2, 3));
        test.done();
    },

    "call should complete when the wrapped function succeeds": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.
            onCall(0).yields(new Error()).
            onCall(1).yields(new Error()).
            onCall(2).yields(new Error()).
            onCall(3).yields(null, 'Success!');

        call.start(this.backoffFactory);

        for (var i = 0; i < 2; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);
        this.backoff.emit('ready');

        test.ok(this.callback.calledWith(null, 'Success!'));
        test.ok(this.wrappedFn.alwaysCalledWith(1, 2, 3));
        test.done();
    },

    "call should fail when the backoff limit is reached": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        var error = new Error();
        this.wrappedFn.yields(error);
        call.start(this.backoffFactory);

        for (var i = 0; i < 3; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);

        this.backoff.emit('fail');

        test.ok(this.callback.calledWith(error));
        test.ok(this.wrappedFn.alwaysCalledWith(1, 2, 3));
        test.done();
    },

    "call should fail when the retry predicate returns false": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
		call.retryIf(function(err) { return err.retriable; });

		var retriableError = new Error();
		retriableError.retriable = true;

		var fatalError = new Error();
		fatalError.retriable = false;

        this.wrappedFn.
            onCall(0).yields(retriableError).
            onCall(1).yields(retriableError).
            onCall(2).yields(fatalError);

        call.start(this.backoffFactory);

        for (var i = 0; i < 2; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 1);
        test.ok(this.callback.calledWith(fatalError));
        test.ok(this.wrappedFn.alwaysCalledWith(1, 2, 3));
        test.done();
	},

    "wrapped function's callback shouldn't be called after abort": function(test) {
        var call = new FunctionCall(function(callback) {
            call.abort(); // Abort in middle of wrapped function's execution.
            callback(null, 'ok');
        }, [], this.callback);

        call.start(this.backoffFactory);

        test.equals(this.callback.callCount, 1,
            'Wrapped function\'s callback shouldn\'t be called after abort.');
        test.ok(this.callback.calledWithMatch(sinon.match(function (err) {
            return !!err.message.match(/Backoff aborted/);
        }, "abort error")));
        test.done();
    },

    "abort event is emitted once when abort is called": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        this.wrappedFn.yields(new Error());
        var callEventSpy = sinon.spy();

        call.on('abort', callEventSpy);
        call.start(this.backoffFactory);

        call.abort();
        call.abort();
        call.abort();

        test.equals(callEventSpy.callCount, 1);
        test.done();
    },

    "getLastResult should return the last intermediary result": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        this.wrappedFn.yields(1);
        call.start(this.backoffFactory);

        for (var i = 2; i < 5; i++) {
            this.wrappedFn.yields(i);
            this.backoff.emit('ready');
            test.deepEqual([i], call.getLastResult());
        }

        this.wrappedFn.yields(null);
        this.backoff.emit('ready');
        test.deepEqual([null], call.getLastResult());

        test.done();
    },

    "getNumRetries should return the number of retries": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);

        this.wrappedFn.yields(1);
        call.start(this.backoffFactory);
        // The inital call doesn't count as a retry.
        test.equals(0, call.getNumRetries());

        for (var i = 2; i < 5; i++) {
            this.wrappedFn.yields(i);
            this.backoff.emit('ready');
            test.equals(i - 1, call.getNumRetries());
        }

        this.wrappedFn.yields(null);
        this.backoff.emit('ready');
        test.equals(4, call.getNumRetries());

        test.done();
    },

    "wrapped function's errors should be propagated": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.throws(new Error());
        test.throws(function() {
            call.start(this.backoffFactory);
        }, Error);
        test.done();
    },

    "wrapped callback's errors should be propagated": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.yields(null, 'Success!');
        this.callback.throws(new Error());
        test.throws(function() {
            call.start(this.backoffFactory);
        }, Error);
        test.done();
    },

    "call event should be emitted when wrapped function gets called": function(test) {
        this.wrappedFn.yields(1);
        var callEventSpy = sinon.spy();

        var call = new FunctionCall(this.wrappedFn, [1, 'two'], this.callback);
        call.on('call', callEventSpy);
        call.start(this.backoffFactory);

        for (var i = 1; i < 5; i++) {
            this.backoff.emit('ready');
        }

        test.equal(5, callEventSpy.callCount,
            'The call event should have been emitted 5 times.');
        test.deepEqual([1, 'two'], callEventSpy.getCall(0).args,
            'The call event should carry function\'s args.');
        test.done();
    },

    "callback event should be emitted when callback is called": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 'two'], this.callback);
        var callbackSpy = sinon.spy();
        call.on('callback', callbackSpy);

        this.wrappedFn.yields('error');
        call.start(this.backoffFactory);

        this.wrappedFn.yields(null, 'done');
        this.backoff.emit('ready');

        test.equal(2, callbackSpy.callCount,
            'Callback event should have been emitted 2 times.');
        test.deepEqual(['error'], callbackSpy.firstCall.args,
            'First callback event should carry first call\'s results.');
        test.deepEqual([null, 'done'], callbackSpy.secondCall.args,
            'Second callback event should carry second call\'s results.');
        test.done();
    },

    "backoff event should be emitted on backoff start": function(test) {
        var err = new Error('backoff event error');
        var call = new FunctionCall(this.wrappedFn, [1, 'two'], this.callback);
        var backoffSpy = sinon.spy();

        call.on('backoff', backoffSpy);

        this.wrappedFn.yields(err);
        call.start(this.backoffFactory);
        this.backoff.emit('backoff', 3, 1234, err);

        test.ok(this.backoff.backoff.calledWith(err),
            'The backoff instance should have been called with the error.');
        test.equal(1, backoffSpy.callCount,
            'Backoff event should have been emitted 1 time.');
        test.deepEqual([3, 1234, err], backoffSpy.firstCall.args,
            'Backoff event should carry the backoff number, delay and error.');
        test.done();
    }
};
