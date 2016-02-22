// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

const assert = require('assert');

const testutil = require('./testutil');
const promise = require('../../lib/promise');

// Aliases for readability.
const NativePromise = Promise;
const StubError = testutil.StubError;
const assertIsStubError = testutil.assertIsStubError;
const callbackHelper = testutil.callbackHelper;
const callbackPair = testutil.callbackPair;
const throwStubError = testutil.throwStubError;
const fail = () => assert.fail();

// Refer to promise_aplus_test for promise compliance with standard behavior.
describe('promise', function() {
  var app, uncaughtExceptions;

  beforeEach(function setUp() {
    promise.LONG_STACK_TRACES = false;
    uncaughtExceptions = [];

    app = promise.controlFlow();
    app.on(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
           (e) => uncaughtExceptions.push(e));
  });

  afterEach(function tearDown() {
    app.reset();
    promise.setDefaultFlow(new promise.ControlFlow);
    assert.deepEqual([], uncaughtExceptions,
        'Did not expect any uncaught exceptions');
    promise.LONG_STACK_TRACES = false;
  });

  const assertIsPromise = (p) => assert.ok(promise.isPromise(p));
  const assertNotPromise = (v) => assert.ok(!promise.isPromise(v));

  function createRejectedPromise(reason) {
    var p = promise.rejected(reason);
    p.thenCatch(function() {});
    return p;
  }

  it('testCanDetectPromiseLikeObjects', function() {
    assertIsPromise(new promise.Promise(function(fulfill) {
      fulfill();
    }));
    assertIsPromise(new promise.Deferred());
    assertIsPromise(new promise.Deferred().promise);
    assertIsPromise({then:function() {}});

    assertNotPromise(undefined);
    assertNotPromise(null);
    assertNotPromise('');
    assertNotPromise(true);
    assertNotPromise(false);
    assertNotPromise(1);
    assertNotPromise({});
    assertNotPromise({then:1});
    assertNotPromise({then:true});
    assertNotPromise({then:''});
  });

  describe('then', function() {
    it('returnsOwnPromiseIfNoCallbacksWereGiven', function() {
      var deferred = new promise.Deferred();
      assert.equal(deferred.promise, deferred.promise.then());
      assert.equal(deferred.promise, deferred.promise.thenCatch());
      assert.equal(deferred.promise, promise.when(deferred.promise));
    });

    it('stillConsideredUnHandledIfNoCallbacksWereGivenOnCallsToThen', function() {
      promise.rejected(new StubError).then();
      var handler = callbackHelper(assertIsStubError);

      // so tearDown() doesn't throw
      app.removeAllListeners();
      app.on(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, handler);
      return NativePromise.resolve().then(() => handler.assertCalled());
    });
  });

  describe('thenFinally', function() {
    it('nonFailingCallbackDoesNotSuppressOriginalError', function() {
      var done = callbackHelper(assertIsStubError);
      return promise.rejected(new StubError).
          thenFinally(function() {}).
          thenCatch(done).
          thenFinally(done.assertCalled);
    });

    it('failingCallbackSuppressesOriginalError', function() {
      var done = callbackHelper(assertIsStubError);
      return promise.rejected(new Error('original')).
          thenFinally(throwStubError).
          thenCatch(done).
          thenFinally(done.assertCalled);
    });

    it('callbackThrowsAfterFulfilledPromise', function() {
      var done = callbackHelper(assertIsStubError);
      return promise.fulfilled().
          thenFinally(throwStubError).
          thenCatch(done).
          thenFinally(done.assertCalled);
    });

    it('callbackReturnsRejectedPromise', function() {
      var done = callbackHelper(assertIsStubError);
      return promise.fulfilled().
          thenFinally(function() {
            return promise.rejected(new StubError);
          }).
          thenCatch(done).
          thenFinally(done.assertCalled);
    });
  });

  describe('cancel', function() {
    it('passesTheCancellationReasonToReject', function() {
      var d = new promise.Deferred();
      var res = d.then(assert.fail, function(e) {
        assert.ok(e instanceof promise.CancellationError);
        assert.equal('because i said so', e.message);
      });
      d.cancel('because i said so');
      return res;
    });

    it('canCancelADeferredFromAChainedPromise', function() {
      var d = new promise.Deferred();
      var p = d.then(assert.fail, function(e) {
        assert.ok(e instanceof promise.CancellationError);
        assert.equal('because i said so', e.message);
      });
      var p2 = p.then(function() {}, assert.fail);

      p.cancel('because i said so');
      return p2;
    });

    it('canCancelATimeout', function() {
      var p = promise.delayed(25)
          .then(assert.fail, (e) => e instanceof promise.CancellationError);
      setTimeout(() => p.cancel(), 20);
      p.cancel();
      return p;
    });

    it('cancelIsANoopOnceAPromiseHasBeenFulfilled', function() {
      var p = promise.fulfilled(123);
      p.cancel();
      return p.then((v) => assert.equal(123, v));
    });

    it('cancelIsANoopOnceAPromiseHasBeenRejected', function() {
      var p = promise.rejected(new StubError);
      p.cancel();

      var pair = callbackPair(null, assertIsStubError);
      return p.then(assert.fail, assertIsStubError);
    });

    it('noopCancelTriggeredOnCallbackOfResolvedPromise', function() {
      var d = promise.defer();
      var p = d.promise.then();

      d.fulfill();
      p.cancel();  // This should not throw.
      return p;    // This should not trigger a failure.
    });
  });

  describe('when', function() {
    it('ReturnsAResolvedPromiseIfGivenANonPromiseValue', function() {
      var ret = promise.when('abc');
      assertIsPromise(ret);
      return ret.then((value) => assert.equal('abc', value));
    });

    it('PassesRawErrorsToCallbacks', function() {
      var error = new Error('boo!');
      return promise.when(error, function(value) {
        assert.equal(error, value);
      });
    });

    it('WaitsForValueToBeResolvedBeforeInvokingCallback', function() {
      var d = new promise.Deferred(), callback;
      let result = promise.when(d, callback = callbackHelper(function(value) {
        assert.equal('hi', value);
      }));
      callback.assertNotCalled();
      d.fulfill('hi');
      return result.then(callback.assertCalled);
    });

    it('canCancelReturnedPromise', function() {
      var callbacks = callbackPair(null, function(e) {
        assert.ok(e instanceof promise.CancellationError);
        assert.equal('just because', e.message);
      });

      var promiseLike = {
        then: function(cb, eb) {
          this.callback = cb;
          this.errback = eb;
        }
      };

      var aPromise = promise.when(promiseLike,
          callbacks.callback, callbacks.errback);

      assert.ok(aPromise.isPending());
      aPromise.cancel('just because');

      return aPromise.thenFinally(callbacks.assertErrback);
    });
  });

  it('firesUncaughtExceptionEventIfRejectionNeverHandled', function() {
    promise.rejected(new StubError);
    var handler = callbackHelper(assertIsStubError);

    // so tearDown() doesn't throw
    app.removeAllListeners();
    app.on(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, handler);

    return NativePromise.resolve().then(handler.assertCalled);
  });

  it('cannotResolveADeferredWithItself', function() {
    var deferred = new promise.Deferred();
    assert.throws(() => deferred.fulfill(deferred));
    assert.throws(() => deferred.reject(deferred));
  });

  describe('fullyResolved', function() {
    it('primitives', function() {
      function runTest(value) {
        var callback, errback;
        return promise.fullyResolved(value)
            .then((resolved) => assert.equal(value, resolved));
      }
      return runTest(true)
         .then(() => runTest(function() {}))
         .then(() => runTest(null))
         .then(() => runTest(123))
         .then(() => runTest('foo bar'))
         .then(() => runTest(undefined));
    });

    it('arrayOfPrimitives', function() {
      var fn = function() {};
      var array = [true, fn, null, 123, '', undefined, 1];
      return promise.fullyResolved(array).then(function(resolved) {
        assert.equal(array, resolved);
        assert.deepEqual([true, fn, null, 123, '', undefined, 1],
            resolved);
      });
    });

    it('nestedArrayOfPrimitives', function() {
      var fn = function() {};
      var array = [true, [fn, null, 123], '', undefined];
      return promise.fullyResolved(array)
          .then(function(resolved) {
            assert.equal(array, resolved);
            assert.deepEqual([true, [fn, null, 123], '', undefined], resolved);
            assert.deepEqual([fn, null, 123], resolved[1]);
          });
    });

    it('arrayWithPromisedPrimitive', function() {
      return promise.fullyResolved([promise.fulfilled(123)])
          .then(function(resolved) {
            assert.deepEqual([123], resolved);
          });
    });

    it('promiseResolvesToPrimitive', function() {
      return promise.fullyResolved(promise.fulfilled(123))
          .then((resolved) => assert.equal(123, resolved));
    });

    it('promiseResolvesToArray', function() {
      var fn = function() {};
      var array = [true, [fn, null, 123], '', undefined];
      var aPromise = promise.fulfilled(array);

      var result = promise.fullyResolved(aPromise);
      return result.then(function(resolved) {
        assert.equal(array, resolved);
        assert.deepEqual([true, [fn, null, 123], '', undefined],
            resolved);
        assert.deepEqual([fn, null, 123], resolved[1]);
      });
    });

    it('promiseResolvesToArrayWithPromises', function() {
      var nestedPromise = promise.fulfilled(123);
      var aPromise = promise.fulfilled([true, nestedPromise]);
      return promise.fullyResolved(aPromise)
          .then(function(resolved) {
            assert.deepEqual([true, 123], resolved);
          });
    });

    it('rejectsIfArrayPromiseRejects', function() {
      var nestedPromise = createRejectedPromise(new StubError);
      var aPromise = promise.fulfilled([true, nestedPromise]);

      var pair = callbackPair(null, assertIsStubError);
      return promise.fullyResolved(aPromise)
          .then(assert.fail, assertIsStubError);
    });

    it('rejectsOnFirstArrayRejection', function() {
      var e1 = new Error('foo');
      var e2 = new Error('bar');
      var aPromise = promise.fulfilled([
        createRejectedPromise(e1),
        createRejectedPromise(e2)
      ]);

      return promise.fullyResolved(aPromise)
          .then(assert.fail, function(error) {
            assert.strictEqual(e1, error);
          });
    });

    it('rejectsIfNestedArrayPromiseRejects', function() {
      var aPromise = promise.fulfilled([
        promise.fulfilled([
          createRejectedPromise(new StubError)
        ])
      ]);

      return promise.fullyResolved(aPromise)
          .then(assert.fail, assertIsStubError);
    });

    it('simpleHash', function() {
      var hash = {'a': 123};
      return promise.fullyResolved(hash)
          .then(function(resolved) {
            assert.strictEqual(hash, resolved);
            assert.deepEqual(hash, {'a': 123});
          });
    });

    it('nestedHash', function() {
      var nestedHash = {'foo':'bar'};
      var hash = {'a': 123, 'b': nestedHash};

      return promise.fullyResolved(hash)
          .then(function(resolved) {
            assert.strictEqual(hash, resolved);
            assert.deepEqual({'a': 123, 'b': {'foo': 'bar'}}, resolved);
            assert.strictEqual(nestedHash, resolved['b']);
          });
    });

    it('promiseResolvesToSimpleHash', function() {
      var hash = {'a': 123};
      var aPromise = promise.fulfilled(hash);

      return promise.fullyResolved(aPromise)
          .then((resolved) => assert.strictEqual(hash, resolved));
    });

    it('promiseResolvesToNestedHash', function() {
      var nestedHash = {'foo':'bar'};
      var hash = {'a': 123, 'b': nestedHash};
      var aPromise = promise.fulfilled(hash);

      return promise.fullyResolved(aPromise)
          .then(function(resolved) {
            assert.strictEqual(hash, resolved);
            assert.strictEqual(nestedHash, resolved['b']);
            assert.deepEqual(hash, {'a': 123, 'b': {'foo': 'bar'}});
          });
    });

    it('promiseResolvesToHashWithPromises', function() {
      var aPromise = promise.fulfilled({
          'a': promise.fulfilled(123)
      });

      return promise.fullyResolved(aPromise)
          .then(function(resolved) {
            assert.deepEqual({'a': 123}, resolved);
          });
    });

    it('rejectsIfHashPromiseRejects', function() {
      var aPromise = promise.fulfilled({
          'a': createRejectedPromise(new StubError)
      });

      return promise.fullyResolved(aPromise)
          .then(assert.fail, assertIsStubError);
    });

    it('rejectsIfNestedHashPromiseRejects', function() {
      var aPromise = promise.fulfilled({
          'a': {'b': createRejectedPromise(new StubError)}
      });

      return promise.fullyResolved(aPromise)
          .then(assert.fail, assertIsStubError);
    });

    it('instantiatedObject', function() {
      function Foo() {
        this.bar = 'baz';
      }
      var foo = new Foo;

      return promise.fullyResolved(foo).then(function(resolvedFoo) {
        assert.equal(foo, resolvedFoo);
        assert.ok(resolvedFoo instanceof Foo);
        assert.deepEqual(new Foo, resolvedFoo);
      });
    });

    it('withEmptyArray', function() {
      return promise.fullyResolved([]).then(function(resolved) {
        assert.deepEqual([], resolved);
      });
    });

    it('withEmptyHash', function() {
      return promise.fullyResolved({}).then(function(resolved) {
        assert.deepEqual({}, resolved);
      });
    });

    it('arrayWithPromisedHash', function() {
      var obj = {'foo': 'bar'};
      var array = [promise.fulfilled(obj)];

      return promise.fullyResolved(array).then(function(resolved) {
        assert.deepEqual(resolved, [obj]);
      });
    });
  });

  describe('checkedNodeCall', function() {
    it('functionThrows', function() {
      return promise.checkedNodeCall(throwStubError)
          .then(assert.fail, assertIsStubError);
    });

    it('functionReturnsAnError', function() {
      return promise.checkedNodeCall(function(callback) {
        callback(new StubError);
      }).then(assert.fail, assertIsStubError);
    });

    it('functionReturnsSuccess', function() {
      var success = 'success!';
      return promise.checkedNodeCall(function(callback) {
        callback(null, success);
      }).then((value) => assert.equal(success, value));
    });

    it('functionReturnsAndThrows', function() {
      var error = new Error('boom');
      var error2 = new Error('boom again');
      return promise.checkedNodeCall(function(callback) {
        callback(error);
        throw error2;
      }).then(assert.fail, (e) => assert.equal(error, e));
    });

    it('functionThrowsAndReturns', function() {
      var error = new Error('boom');
      var error2 = new Error('boom again');
      return promise.checkedNodeCall(function(callback) {
        setTimeout(() => callback(error), 10);
        throw error2;
      }).then(assert.fail, (e) => assert.equal(error2, e));
    });
  });

  describe('all', function() {
    it('(base case)', function() {
      var a = [
          0, 1,
          promise.defer(),
          promise.defer(),
          4, 5, 6
      ];
      delete a[5];

      var pair = callbackPair(function(value) {
        assert.deepEqual([0, 1, 2, 3, 4, undefined, 6], value);
      });

      var result = promise.all(a).then(pair.callback, pair.errback);
      pair.assertNeither();

      a[2].fulfill(2);
      pair.assertNeither();

      a[3].fulfill(3);
      return result.then(() => pair.assertCallback());
    });

    it('empty array', function() {
      return promise.all([]).then((a) => assert.deepEqual([], a));
    });

    it('usesFirstRejection', function() {
      var a = [
        promise.defer(),
        promise.defer()
      ];

      var result = promise.all(a).then(assert.fail, assertIsStubError);
      a[1].reject(new StubError);
      setTimeout(() => a[0].reject(Error('ignored')), 0);
      return result;
    });
  });

  describe('map', function() {
    it('(base case)', function() {
      var a = [1, 2, 3];
      return promise.map(a, function(value, index, a2) {
        assert.equal(a, a2);
        assert.equal('number', typeof index, 'not a number');
        return value + 1;
      }).then(function(value) {
        assert.deepEqual([2, 3, 4], value);
      });
    });

    it('omitsDeleted', function() {
      var a = [0, 1, 2, 3, 4, 5, 6];
      delete a[1];
      delete a[3];
      delete a[4];
      delete a[6];

      var expected = [0, 1, 4, 9, 16, 25, 36];
      delete expected[1];
      delete expected[3];
      delete expected[4];
      delete expected[6];

      return promise.map(a, function(value) {
        return value * value;
      }).then(function(value) {
        assert.deepEqual(expected, value);
      });
    });

    it('emptyArray', function() {
      return promise.map([], function(value) {
        return value + 1;
      }).then(function(value) {
        assert.deepEqual([], value);
      });
    });

    it('inputIsPromise', function() {
      var input = promise.defer();
      var result = promise.map(input, function(value) {
        return value + 1;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual([2, 3, 4], value);
      });
      result = result.then(pair.callback, pair.errback);

      setTimeout(function() {
        pair.assertNeither();
        input.fulfill([1, 2, 3]);
      }, 10);

      return result;
    });

    it('waitsForFunctionResultToResolve', function() {
      var innerResults = [
        promise.defer(),
        promise.defer()
      ];

      var result = promise.map([1, 2], function(value, index) {
        return innerResults[index].promise;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual(['a', 'b'], value);
      });
      result = result.then(pair.callback, pair.errback);

      return NativePromise.resolve()
          .then(function() {
            pair.assertNeither();
            innerResults[0].fulfill('a');
          })
          .then(function() {
            pair.assertNeither();
            innerResults[1].fulfill('b');
            return result;
          })
          .then(pair.assertCallback);
    });

    it('rejectsPromiseIfFunctionThrows', function() {
      return promise.map([1], throwStubError)
          .then(assert.fail, assertIsStubError);
    });

    it('rejectsPromiseIfFunctionReturnsRejectedPromise', function() {
      return promise.map([1], function() {
        return promise.rejected(new StubError);
      }).then(assert.fail, assertIsStubError);
    });

    it('stopsCallingFunctionIfPreviousIterationFailed', function() {
      var count = 0;
      return promise.map([1, 2, 3, 4], function() {
        count++;
        if (count == 3) {
          throw new StubError;
        }
      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.equal(3, count);
      });
    });

    it('rejectsWithFirstRejectedPromise', function() {
      var innerResult = [
          promise.fulfilled(),
          createRejectedPromise(new StubError),
          createRejectedPromise(Error('should be ignored'))
      ];
      var count = 0;
      return promise.map([1, 2, 3, 4], function(value, index) {
        count += 1;
        return innerResult[index];
      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.equal(2, count);
      });
    });

    it('preservesOrderWhenMapReturnsPromise', function() {
      var deferreds = [
        promise.defer(),
        promise.defer(),
        promise.defer(),
        promise.defer()
      ];
      var result = promise.map(deferreds, function(value) {
        return value.promise;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual([0, 1, 2, 3], value);
      });
      result = result.then(pair.callback, pair.errback);

      return NativePromise.resolve()
          .then(function() {
            pair.assertNeither();
            for (let i = deferreds.length; i > 0; i -= 1) {
              deferreds[i - 1].fulfill(i - 1);
            }
            return result;
          }).then(pair.assertCallback);
    });
  });

  describe('filter', function() {
    it('basicFiltering', function() {
      var a = [0, 1, 2, 3];
      return promise.filter(a, function(val, index, a2) {
        assert.equal(a, a2);
        assert.equal('number', typeof index, 'not a number');
        return val > 1;
      }).then(function(val) {
        assert.deepEqual([2, 3], val);
      });
    });

    it('omitsDeleted', function() {
      var a = [0, 1, 2, 3, 4, 5, 6];
      delete a[3];
      delete a[4];

      return promise.filter(a, function(value) {
        return value > 1 && value < 6;
      }).then(function(val) {
        assert.deepEqual([2, 5], val);
      });
    });

    it('preservesInputs', function() {
      var a = [0, 1, 2, 3];

      return promise.filter(a, function(value, i, a2) {
        assert.equal(a, a2);
        // Even if a function modifies the input array, the original value
        // should be inserted into the new array.
        a2[i] = a2[i] - 1;
        return a2[i] >= 1;
      }).then(function(val) {
        assert.deepEqual([2, 3], val);
      });
    });

    it('inputIsPromise', function() {
      var input = promise.defer();
      var result = promise.filter(input, function(value) {
        return value > 1 && value < 3;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual([2], value);
      });
      result = result.then(pair.callback, pair.errback);
      return NativePromise.resolve()
          .then(function() {
            pair.assertNeither();
            input.fulfill([1, 2, 3]);
            return result;
          })
          .then(pair.assertCallback);
    });

    it('waitsForFunctionResultToResolve', function() {
      var innerResults = [
        promise.defer(),
        promise.defer()
      ];

      var result = promise.filter([1, 2], function(value, index) {
        return innerResults[index].promise;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual([2], value);
      });
      result = result.then(pair.callback, pair.errback);
      return NativePromise.resolve()
          .then(function() {
            pair.assertNeither();
            innerResults[0].fulfill(false);
          })
          .then(function() {
            pair.assertNeither();
            innerResults[1].fulfill(true);
            return result;
          })
          .then(pair.assertCallback);
    });

    it('rejectsPromiseIfFunctionReturnsRejectedPromise', function() {
      return promise.filter([1], function() {
        return promise.rejected(new StubError);
      }).then(assert.fail, assertIsStubError);
    });

    it('stopsCallingFunctionIfPreviousIterationFailed', function() {
      var count = 0;
      return promise.filter([1, 2, 3, 4], function() {
        count++;
        if (count == 3) {
          throw new StubError;
        }
      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.equal(3, count);
      });
    });

    it('rejectsWithFirstRejectedPromise', function() {
      var innerResult = [
        promise.fulfilled(),
        createRejectedPromise(new StubError),
        createRejectedPromise(Error('should be ignored'))
      ];

      return promise.filter([1, 2, 3, 4], function(value, index) {
        assert.ok(index < innerResult.length);
        return innerResult[index];
      }).then(assert.fail, assertIsStubError);
    });

    it('preservesOrderWhenFilterReturnsPromise', function() {
      var deferreds = [
        promise.defer(),
        promise.defer(),
        promise.defer(),
        promise.defer()
      ];
      var result = promise.filter([0, 1, 2, 3], function(value, index) {
        return deferreds[index].promise;
      });

      var pair = callbackPair(function(value) {
        assert.deepEqual([1, 2], value);
      });
      result = result.then(pair.callback, pair.errback);

      return NativePromise.resolve()
          .then(function() {
            pair.assertNeither();
            for (let i = deferreds.length - 1; i >= 0; i -= 1) {
              deferreds[i].fulfill(i > 0 && i < 3);
            }
            return result;
          }).then(pair.assertCallback);
    });
  });

  it('testAddThenableImplementation', function() {
    function tmp() {}
    assert.ok(!promise.Thenable.isImplementation(new tmp()));
    promise.Thenable.addImplementation(tmp);
    assert.ok(promise.Thenable.isImplementation(new tmp()));

    class tmpClass {}
    assert.ok(!promise.Thenable.isImplementation(new tmpClass()));
    promise.Thenable.addImplementation(tmpClass);
    assert.ok(promise.Thenable.isImplementation(new tmpClass()));
  });

  describe('testLongStackTraces', function() {
    beforeEach(() => promise.LONG_STACK_TRACES = false);
    afterEach(() => promise.LONG_STACK_TRACES = false);

    it('doesNotAppendStackIfFeatureDisabled', function() {
      promise.LONG_STACK_TRACES = false;

      var error = Error('hello');
      var originalStack = error.stack;
      return promise.rejected(error).
          then(fail).
          then(fail).
          then(fail).
          then(fail, function(e) {
            assert.equal(error, e);
            assert.equal(originalStack, e.stack);
          });
    });

    function getStackMessages(error) {
      return error.stack.split(/\n/).filter(function(line) {
        return /^From: /.test(line);
      });
    }

    it('appendsInitialPromiseCreation_resolverThrows', function() {
      promise.LONG_STACK_TRACES = true;

      var error = Error('hello');
      var originalStack = '(placeholder; will be overwritten later)';

      return new promise.Promise(function() {
        try {
          throw error;
        } catch (e) {
          originalStack = e.stack;
          throw e;
        }
      }).then(fail, function(e) {
        assert.strictEqual(error, e);
        if (typeof originalStack !== 'string') {
          return;
        }
        assert.notEqual(originalStack, e.stack);
        assert.equal(e.stack.indexOf(originalStack), 0,
            'should start with original stack');
        assert.deepEqual(['From: Promise: new'], getStackMessages(e));
      });
    });

    it('appendsInitialPromiseCreation_rejectCalled', function() {
      promise.LONG_STACK_TRACES = true;

      var error = Error('hello');
      var originalStack = error.stack;

      return new promise.Promise(function(_, reject) {
        reject(error);
      }).then(fail, function(e) {
        assert.equal(error, e);
        if (typeof originalStack !== 'string') {
          return;
        }
        assert.notEqual(originalStack, e.stack);
        assert.equal(e.stack.indexOf(originalStack), 0,
            'should start with original stack');
        assert.deepEqual(['From: Promise: new'], getStackMessages(e));
      });
    });

    it('appendsEachStepToRejectionError', function() {
      promise.LONG_STACK_TRACES = true;

      var error = Error('hello');
      var originalStack = '(placeholder; will be overwritten later)';

      return new promise.Promise(function() {
        try {
          throw error;
        } catch (e) {
          originalStack = e.stack;
          throw e;
        }
      }).
      then(fail).
      thenCatch(function(e) { throw e; }).
      then(fail).
      thenCatch(function(e) { throw e; }).
      then(fail, function(e) {
        assert.equal(error, e);
        if (typeof originalStack !== 'string') {
          return;
        }
        assert.notEqual(originalStack, e.stack);
        assert.equal(e.stack.indexOf(originalStack), 0,
            'should start with original stack');
        assert.deepEqual([
          'From: Promise: new',
          'From: Promise: then',
          'From: Promise: catch',
          'From: Promise: then',
          'From: Promise: catch',
        ], getStackMessages(e));
      });
    });

    it('errorOccursInCallbackChain', function() {
      promise.LONG_STACK_TRACES = true;

      var error = Error('hello');
      var originalStack = '(placeholder; will be overwritten later)';

      return promise.fulfilled().
          then(function() {}).
          then(function() {}).
          then(function() {
            try {
              throw error;
            } catch (e) {
              originalStack = e.stack;
              throw e;
            }
          }).
          thenCatch(function(e) { throw e; }).
          then(fail, function(e) {
            assert.equal(error, e);
            if (typeof originalStack !== 'string') {
              return;
            }
            assert.notEqual(originalStack, e.stack);
            assert.equal(e.stack.indexOf(originalStack), 0,
                'should start with original stack');
            assert.deepEqual([
              'From: Promise: then',
              'From: Promise: catch',
            ], getStackMessages(e));
          });
    });
  });
});
