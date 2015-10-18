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

goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('webdriver.promise');
goog.require('webdriver.stacktrace');
goog.require('webdriver.test.testutil');


// Aliases for readability.
var assertIsPromise = webdriver.test.testutil.assertIsPromise,
    assertNotPromise = webdriver.test.testutil.assertNotPromise,
    callbackHelper = webdriver.test.testutil.callbackHelper,
    callbackPair = webdriver.test.testutil.callbackPair,
    assertIsStubError = webdriver.test.testutil.assertIsStubError,
    throwStubError = webdriver.test.testutil.throwStubError,
    StubError = webdriver.test.testutil.StubError;

var app, clock, uncaughtExceptions;

function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  webdriver.promise.LONG_STACK_TRACES = false;
  clock = new goog.testing.MockClock(true);
  uncaughtExceptions = [];

  app = webdriver.promise.controlFlow();
  app.on(webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
         goog.bind(uncaughtExceptions.push, uncaughtExceptions));
}


function tearDown() {
  clock.tick(Infinity);
  clock.dispose();
  app.reset();
  webdriver.promise.setDefaultFlow(new webdriver.promise.ControlFlow);
  assertArrayEquals(
      'Did not expect any uncaught exceptions', [], uncaughtExceptions);
  webdriver.promise.LONG_STACK_TRACES = false;
}


function createRejectedPromise(reason) {
  var p = webdriver.promise.rejected(reason);
  p.thenCatch(goog.nullFunction);
  return p;
}


function testCanDetectPromiseLikeObjects() {
  assertIsPromise(new webdriver.promise.Promise(function(fulfill) {
    fulfill();
  }));
  assertIsPromise(new webdriver.promise.Deferred());
  assertIsPromise(new webdriver.promise.Deferred().promise);
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
}


function testSimpleResolveScenario() {
  var callback = callbackHelper(function(value) {
    assertEquals(123, value);
  });

  var deferred = webdriver.promise.defer();
  deferred.promise.then(callback);

  callback.assertNotCalled();
  deferred.fulfill(123);
  clock.tick();
  callback.assertCalled();
}


function testRegisteringACallbackPostResolution() {
  var callback, deferred = new webdriver.promise.Deferred();

  deferred.then((callback = callbackHelper(function(value) {
    assertEquals(123, value);
  })));
  deferred.fulfill(123);
  clock.tick();
  callback.assertCalled();

  deferred.then((callback = callbackHelper(function(value) {
    assertEquals(123, value);
  })));
  callback.assertNotCalled();
  clock.tick();
  callback.assertCalled();
}


function testRegisterACallbackViaDeferredPromise() {
  var callback, deferred = new webdriver.promise.Deferred();

  deferred.promise.then((callback = callbackHelper(function(value) {
    assertEquals(123, value);
  })));
  deferred.fulfill(123);
  clock.tick();
  callback.assertCalled();

  deferred.promise.then((callback = callbackHelper(function(value) {
    assertEquals(123, value);
  })));
  clock.tick();
  callback.assertCalled();
}


function testTwoStepResolvedChain() {
  var callback, start = new webdriver.promise.Deferred();

  var next = start.then((callback = callbackHelper(function(value) {
    assertEquals(123, value);
    return value + 1;
  })));

  assertIsPromise(next);

  callback.assertNotCalled();
  start.fulfill(123);
  clock.tick();
  callback.assertCalled();

  next.then((callback = callbackHelper(function(value) {
    assertEquals(124, value);
  })));
  clock.tick();
  callback.assertCalled();
}


function testCanResolveOnlyOnce_resolved() {
  var deferred = new webdriver.promise.Deferred();
  deferred.fulfill(1);
  deferred.fulfill(2);
  deferred.reject(3);

  var callback;
  deferred.then(callback = callbackHelper(function(value) {
    assertEquals(1, value);
  }));
  clock.tick();
  callback.assertCalled();
}


function testCanResolveOnlyOnce_rejected() {
  var deferred = new webdriver.promise.Deferred();
  deferred.reject(new StubError);
  deferred.fulfill(1);
  deferred.reject(2);

  var callback;
  deferred.then(null, callback = callbackHelper(assertIsStubError));
  clock.tick();
  callback.assertCalled();
}


function testIfFulfilledWithOtherPromiseCannotChangeValueWhileWaiting() {
  var deferred = webdriver.promise.defer();
  var other = webdriver.promise.defer();

  deferred.fulfill(other.promise);
  deferred.fulfill('different value');

  var callback = callbackHelper(function(value) {
    assertEquals(123, value);
  });

  deferred.then(callback);
  callback.assertNotCalled();

  other.fulfill(123);
  clock.tick();
  callback.assertCalled();
}


function testOnlyGoesDownListenerPath_resolved() {
  var callback = callbackHelper();
  var errback = callbackHelper();

  webdriver.promise.fulfilled().then(callback, errback);
  clock.tick();
  callback.assertCalled();
  errback.assertNotCalled();
}


function testOnlyGoesDownListenerPath_rejected() {
  var callback = callbackHelper();
  var errback = callbackHelper();

  webdriver.promise.rejected().then(callback, errback);
  clock.tick();
  callback.assertNotCalled();
  errback.assertCalled();
}


function testCatchingAndSuppressingRejectionErrors() {
  var errback = callbackHelper(assertIsStubError);
  var callback = callbackHelper(function() {
    assertUndefined(arguments[0]);
  });

  webdriver.promise.rejected(new StubError).
      thenCatch(errback).
      then(callback);
  clock.tick();
  errback.assertCalled();
  callback.assertCalled();
}


function testThrowingNewRejectionErrors() {
  var errback1 = callbackHelper(assertIsStubError);
  var error2 = Error('hi');
  var errback2 = callbackHelper(function(error) {
    assertEquals(error2, error);
  });

  webdriver.promise.rejected(new StubError).
      thenCatch(function(error) {
        errback1(error);
        throw error2;
      }).
      thenCatch(errback2);
  clock.tick();
  errback1.assertCalled();
  errback2.assertCalled();
}


function testThenFinally_nonFailingCallbackDoesNotSuppressOriginalError() {
  var done = callbackHelper(assertIsStubError);
  webdriver.promise.rejected(new StubError).
      thenFinally(goog.nullFunction).
      thenCatch(done);
  clock.tick();
  done.assertCalled();
}


function testThenFinally_failingCallbackSuppressesOriginalError() {
  var done = callbackHelper(assertIsStubError);
  webdriver.promise.rejected(new Error('original')).
      thenFinally(throwStubError).
      thenCatch(done);
  clock.tick();
  done.assertCalled();
}


function testThenFinally_callbackThrowsAfterFulfilledPromise() {
  var done = callbackHelper(assertIsStubError);
  webdriver.promise.fulfilled().
      thenFinally(throwStubError).
      thenCatch(done);
  clock.tick();
  done.assertCalled();
}


function testThenFinally_callbackReturnsRejectedPromise() {
  var done = callbackHelper(assertIsStubError);
  webdriver.promise.fulfilled().
      thenFinally(function() {
        return webdriver.promise.rejected(new StubError);
      }).
      thenCatch(done);
  clock.tick();
  done.assertCalled();
}


function testChainingThen_AllResolved() {
  var callbacks = [
    callbackHelper(function(value) {
      assertEquals(128, value);
      return value * 2;
    }),
    callbackHelper(function(value) {
      assertEquals(256, value);
      return value * 2;
    }),
    callbackHelper(function(value) {
      assertEquals(512, value);
    })
  ];

  var deferred = new webdriver.promise.Deferred();
  deferred.
      then(callbacks[0]).
      then(callbacks[1]).
      then(callbacks[2]);

  callbacks[0].assertNotCalled();
  callbacks[1].assertNotCalled();
  callbacks[2].assertNotCalled();

  deferred.fulfill(128);

  clock.tick();
  callbacks[0].assertCalled();
  callbacks[1].assertCalled();
  callbacks[2].assertCalled();
}


function testWhen_ReturnsAResolvedPromiseIfGivenANonPromiseValue() {
  var ret = webdriver.promise.when('abc');
  assertIsPromise(ret);

  var callback;
  ret.then(callback = callbackHelper(function (value) {
    assertEquals('abc', value);
  }));
  clock.tick();
  callback.assertCalled();
}


function testWhen_PassesRawErrorsToCallbacks() {
  var error = new Error('boo!'), callback;
  webdriver.promise.when(error, callback = callbackHelper(function(value) {
    assertEquals(error, value);
  }));
  clock.tick();
  callback.assertCalled();
}


function testWhen_WaitsForValueToBeResolvedBeforeInvokingCallback() {
  var d = new webdriver.promise.Deferred(), callback;
  webdriver.promise.when(d, callback = callbackHelper(function(value) {
    assertEquals('hi', value);
  }));
  callback.assertNotCalled();
  d.fulfill('hi');
  clock.tick();
  callback.assertCalled();
}


function testWhen_canCancelReturnedPromise() {
  var callbacks = callbackPair(null, function(e) {
    assertTrue(e instanceof webdriver.promise.CancellationError);
    assertEquals('just because', e.message);
  });

  var promiseLike = {
    then: function(cb, eb) {
      this.callback = cb;
      this.errback = eb;
    }
  };

  var promise = webdriver.promise.when(promiseLike,
      callbacks.callback, callbacks.errback);

  assertTrue(promise.isPending());
  promise.cancel('just because');
  clock.tick();
  callbacks.assertErrback();

  // The following should have no effect.
  promiseLike.callback();
  promiseLike.errback();
}


function testFiresUncaughtExceptionEventIfRejectionNeverHandled() {
  webdriver.promise.rejected(new StubError);
  var handler = callbackHelper(assertIsStubError);

  // so tearDown() doesn't throw
  app.removeAllListeners();
  app.on(webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, handler);
  clock.tick();
  handler.assertCalled();
}


function testWaitsIfCallbackReturnsAPromiseObject() {
  var callback1, callback2;
  var callback1Return = new webdriver.promise.Deferred();

  webdriver.promise.fulfilled('hi').
      then(callback1 = callbackHelper(function(value) {
        assertEquals('hi', value);
        return callback1Return;
      })).
      then(callback2 = callbackHelper(function(value) {
        assertEquals('bye', value);
      }));

  clock.tick();
  callback1.assertCalled();
  callback2.assertNotCalled();
  callback1Return.fulfill('bye');
  clock.tick();
  callback2.assertCalled();
}


function testWaitsIfCallbackReturnsAPromiseLikeObject() {
  var callback1, callback2;
  var callback1Return = {
    then: function(callback) {
      this.callback = callback;
    },
    fulfill: function(value) {
      this.callback(value);
    }
  };

  webdriver.promise.fulfilled('hi').
      then(callback1 = callbackHelper(function(value) {
        assertEquals('hi', value);
        return callback1Return;
      })).
      then(callback2 = callbackHelper(function(value) {
        assertEquals('bye', value);
      }));

  clock.tick();
  callback1.assertCalled();
  callback2.assertNotCalled();
  callback1Return.fulfill('bye');
  clock.tick();
  callback2.assertCalled();
}


function testResolvingAPromiseWithAnotherPromiseCreatesAChain_ourPromise() {
  var d1 = new webdriver.promise.Deferred();
  var d2 = new webdriver.promise.Deferred();
  var callback1, callback2;

  d1.then(callback1 = callbackHelper(function(value) {
    assertEquals(4, value);
  }));

  var d2promise = d2.then(callback2 = callbackHelper(function(value) {
    assertEquals(2, value);
    return value * 2;
  }));

  callback1.assertNotCalled();
  callback2.assertNotCalled();

  d2.fulfill(2);
  clock.tick();
  callback1.assertNotCalled();
  callback2.assertCalled();

  d1.fulfill(d2promise);
  clock.tick();
  callback1.assertCalled();
  callback2.assertCalled();
}


function testResolvingAPromiseWithAnotherPromiseCreatesAChain_otherPromise() {
  var d = new webdriver.promise.Deferred(), callback;
  d.then(callback = callbackHelper(function(value) {
    assertEquals(4, value);
  }));

  var otherPromise = {
    then: function(callback) {
      this.callback = callback;
    },
    fulfill: function(value) {
      this.callback(value);
    }
  };

  callback.assertNotCalled();
  d.fulfill(otherPromise);
  otherPromise.fulfill(4);
  clock.tick();
  callback.assertCalled();
}


function testRejectForcesValueToAnError_errorInstance() {
  var d = webdriver.promise.defer();
  var callback = callbackHelper(assertIsStubError);

  d.thenCatch(callback);
  d.reject(new StubError);
  clock.tick();
  callback.assertCalled();
}


function testRejectForcesValueToAnError_errorSubTypeInstance() {
  var d = webdriver.promise.defer();
  var e = new TypeError('hi');
  var callback = callbackHelper(function(actual) {
    assertEquals(e, actual);
  });

  d.thenCatch(callback);
  d.reject(e);
  clock.tick();
  callback.assertCalled();
}


function testRejectForcesValueToAnError_customErrorInstance() {
  var d = webdriver.promise.defer();
  var e = new goog.debug.Error('hi there');
  var callback = callbackHelper(function(actual) {
    assertEquals(e, actual);
  });

  d.thenCatch(callback);
  d.reject(e);
  clock.tick();
  callback.assertCalled();
}


function testRejectForcesValueToAnError_errorLike() {
  var d = webdriver.promise.defer();
  var e = {message: 'yolo'};
  var callback = callbackHelper(function(actual) {
    assertEquals(e, actual);
  });

  d.thenCatch(callback);
  d.reject(e);
  clock.tick();
  callback.assertCalled();
}


function testRejectingAPromiseWithAnotherPromise_ourPromise() {
  var d1 = new webdriver.promise.Deferred();
  var d2 = new webdriver.promise.Deferred();
  var pair1 = callbackPair(assertIsStubError, null);
  var pair2 = callbackPair(function(value) {
    assertEquals(2, value);
    return new StubError;
  });

  d1.then(fail, function(e) {
    assertEquals(d2promise, e);
    return d2promise;
  }).then(pair1.callback, pair1.errback);

  var d2promise = d2.then(pair2.callback, pair2.errback);

  pair1.assertNeither();
  pair2.assertNeither();

  d2.fulfill(2);
  clock.tick();
  pair1.assertNeither();
  pair2.assertCallback();

  d1.reject(d2promise);
  clock.tick();
  pair1.assertCallback();
}


function testRejectingAPromiseWithAnotherPromise_otherPromise() {
  var otherPromise = {
    then: function(callback) {
      this.callback = callback;
    },
    fulfill: function(value) {
      this.callback(value);
    }
  };

  var pair = callbackPair(null, assertIsStubError);
  var d = new webdriver.promise.Deferred();
  d.promise.then(fail, function(e) {
    assertEquals(otherPromise, e);
    return otherPromise;
  }).then(pair.callback, pair.errback);

  d.reject(otherPromise);
  clock.tick();
  pair.assertNeither();

  otherPromise.fulfill(new StubError);
  clock.tick();
  pair.assertCallback();
}


function testResolvingADeferredWithAnotherCopiesTheResolvedValue() {
  var d1 = new webdriver.promise.Deferred();
  var d2 = new webdriver.promise.Deferred();
  var callback1, callback2;

  d1.then(callback1 = callbackHelper(function(value) {
    assertEquals(2, value);
  }));

  d2.then(callback2 = callbackHelper(function(value) {
    assertEquals(2, value);
    return 4;
  }));

  d1.fulfill(d2);
  clock.tick();
  callback1.assertNotCalled();
  callback2.assertNotCalled();

  d2.fulfill(2);
  clock.tick();
  callback1.assertCalled();
  callback2.assertCalled();
}


function testCannotResolveAPromiseWithItself_fulfill() {
  var pair = callbackPair(null, function(e) {
    assertTrue(e instanceof TypeError);
  });

  var f, p = new webdriver.promise.Promise(function(fulfill) {
    f = fulfill;
  });
  p.then(pair.callback, pair.errback);
  f(p);
  clock.tick();
  pair.assertErrback();
}


function testCannotResolveAPromiseWithItself_reject() {
  var pair = callbackPair(null, function(e) {
    assertTrue(e instanceof TypeError);
  });

  var r, p = new webdriver.promise.Promise(function(_, reject) {
    r = reject;
  });
  p.then(pair.callback, pair.errback);
  r(p);
  clock.tick();
  pair.assertErrback();
}


function testCannotResolveADeferredWithItself() {
  var deferred = new webdriver.promise.Deferred();
  assertThrows(goog.bind(deferred.fulfill, deferred, deferred));
  assertThrows(goog.bind(deferred.reject, deferred, deferred));
}


function testSkipsNullPointsInPromiseChain_callbacks() {
  var errback1, errback2, callback;
  webdriver.promise.fulfilled('hi').
      thenCatch(errback1 = callbackHelper()).
      thenCatch(errback2 = callbackHelper()).
      then(callback = callbackHelper(function(value) {
        assertEquals('hi', value);
      }));

  clock.tick();
  errback1.assertNotCalled();
  errback2.assertNotCalled();
  callback.assertCalled();
}


function testSkipsNullPointsInPromiseChain_errbacks() {
  var errback1, errback2, callback;
  webdriver.promise.fulfilled('hi').
      thenCatch(errback1 = callbackHelper()).
      thenCatch(errback2 = callbackHelper()).
      then(callback = callbackHelper(function(value) {
        assertEquals('hi', value);
      }));

  clock.tick();
  errback1.assertNotCalled();
  errback2.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_primitives() {
  function runTest(value) {
    var callback, errback;
    webdriver.promise.fullyResolved(value).then(
        callback = callbackHelper(function(resolved) {
          assertEquals(value, resolved);
        }),
        errback = callbackHelper());

    clock.tick();
    errback.assertNotCalled(
        'Did not expect errback to be called for: ' + value);
    callback.assertCalled('Expected callback to be called for: ' + value);
  }

  runTest(true);
  runTest(goog.nullFunction);
  runTest(null);
  runTest(123);
  runTest('foo bar');
  runTest(undefined);
}


function testFullyResolved_arrayOfPrimitives() {
  var array = [true, goog.nullFunction, null, 123, '', undefined, 1];
  var callbacks = callbackPair(function(resolved) {
    assertEquals(array, resolved);
    assertArrayEquals([true, goog.nullFunction, null, 123, '', undefined, 1],
        resolved);
  });

  webdriver.promise.fullyResolved(array).then(
      callbacks.callback, callbacks.errback);

  clock.tick();
  callbacks.assertCallback();
}

function testFullyResolved_nestedArrayOfPrimitives() {
  var array = [true, [goog.nullFunction, null, 123], '', undefined];
  var callback, errback;
  webdriver.promise.fullyResolved(array).then(
      callback = callbackHelper(function(resolved) {
        assertEquals(array, resolved);
        assertArrayEquals([true, [goog.nullFunction, null, 123], '', undefined],
            resolved);
        assertArrayEquals([goog.nullFunction, null, 123], resolved[1]);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_arrayWithPromisedPrimitive() {
  var callback, errback;
  webdriver.promise.fullyResolved([webdriver.promise.fulfilled(123)]).then(
      callback = callbackHelper(function(resolved) {
        assertArrayEquals([123], resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToPrimitive() {
  var promise = webdriver.promise.fulfilled(123);
  var callback, errback;
  webdriver.promise.fullyResolved(promise).then(
      callback = callbackHelper(function(resolved) {
        assertEquals(123, resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToArray() {
  var array = [true, [goog.nullFunction, null, 123], '', undefined];
  var promise = webdriver.promise.fulfilled(array);
  var callback, errback;

  var result = webdriver.promise.fullyResolved(promise);
  result.then(
      callback = callbackHelper(function(resolved) {
        assertEquals(array, resolved);
        assertArrayEquals([true, [goog.nullFunction, null, 123], '', undefined],
            resolved);
        assertArrayEquals([goog.nullFunction, null, 123], resolved[1]);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToArrayWithPromises() {
  var nestedPromise = webdriver.promise.fulfilled(123);
  var promise = webdriver.promise.fulfilled([true, nestedPromise]);

  var callback, errback;
  webdriver.promise.fullyResolved(promise).then(
      callback = callbackHelper(function(resolved) {
        assertArrayEquals([true, 123], resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_rejectsIfArrayPromiseRejects() {
  var nestedPromise = createRejectedPromise(new StubError);
  var promise = webdriver.promise.fulfilled([true, nestedPromise]);

  var pair = callbackPair(null, assertIsStubError);
  webdriver.promise.fullyResolved(promise).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testFullyResolved_rejectsOnFirstArrayRejection() {
  var e1 = new Error('foo');
  var e2 = new Error('bar');
  var promise = webdriver.promise.fulfilled([
    createRejectedPromise(e1),
    createRejectedPromise(e2)
  ]);

  var pair = callbackPair(null, function(error) {
    assertEquals(e1, error);
  });
  webdriver.promise.fullyResolved(promise).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testFullyResolved_rejectsIfNestedArrayPromiseRejects() {
  var promise = webdriver.promise.fulfilled([
    webdriver.promise.fulfilled([
      createRejectedPromise(new StubError)
    ])
  ]);

  var pair = callbackPair(null, assertIsStubError);
  webdriver.promise.fullyResolved(promise).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testFullyResolved_simpleHash() {
  var hash = {'a': 123};

  var callback, errback;
  webdriver.promise.fullyResolved(hash).then(
      callback = callbackHelper(function(resolved) {
        assertEquals(hash, resolved);
        webdriver.test.testutil.assertObjectEquals({'a': 123}, resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_nestedHash() {
  var nestedHash = {'foo':'bar'};
  var hash = {'a': 123, 'b': nestedHash};

  var callback, errback;
  webdriver.promise.fullyResolved(hash).then(
      callback = callbackHelper(function(resolved) {
        assertEquals(hash, resolved);
        webdriver.test.testutil.assertObjectEquals(
            {'a': 123, 'b': {'foo': 'bar'}}, resolved);
        webdriver.test.testutil.assertObjectEquals(nestedHash, resolved['b']);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToSimpleHash() {
  var hash = {'a': 123};
  var promise = webdriver.promise.fulfilled(hash);

  var callback, errback;
  webdriver.promise.fullyResolved(promise).then(
      callback = callbackHelper(function(resolved) {
        webdriver.test.testutil.assertObjectEquals(hash, resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToNestedHash() {
  var nestedHash = {'foo':'bar'};
  var hash = {'a': 123, 'b': nestedHash};
  var promise = webdriver.promise.fulfilled(hash);

  var callback, errback;
  webdriver.promise.fullyResolved(promise).then(
      callback = callbackHelper(function(resolved) {
        webdriver.test.testutil.assertObjectEquals(hash, resolved);
        webdriver.test.testutil.assertObjectEquals(nestedHash, resolved['b']);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_promiseResolvesToHashWithPromises() {
  var promise = webdriver.promise.fulfilled({
      'a': webdriver.promise.fulfilled(123)
  });

  var callback, errback;
  webdriver.promise.fullyResolved(promise).then(
      callback = callbackHelper(function(resolved) {
        webdriver.test.testutil.assertObjectEquals({'a': 123}, resolved);
      }),
      errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_rejectsIfHashPromiseRejects() {
  var promise = webdriver.promise.fulfilled({
      'a': createRejectedPromise(new StubError)
  });

  var pair = callbackPair(null, assertIsStubError);
  webdriver.promise.fullyResolved(promise).then(
    pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}

function testFullyResolved_rejectsIfNestedHashPromiseRejects() {
  var promise = webdriver.promise.fulfilled({
      'a': {'b': createRejectedPromise(new StubError)}
  });

  var pair = callbackPair(null, assertIsStubError);
  webdriver.promise.fullyResolved(promise).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testFullyResolved_instantiatedObject() {
  function Foo() {
    this.bar = 'baz';
  }
  var foo = new Foo;

  var callback, errback;
  webdriver.promise.fullyResolved(foo).then(
    callback = callbackHelper(function(resolvedFoo) {
      assertEquals(foo, resolvedFoo);
      assertTrue(resolvedFoo instanceof Foo);
      webdriver.test.testutil.assertObjectEquals(new Foo, resolvedFoo);
    }),
    errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_withEmptyArray() {
  var callback, errback;
  webdriver.promise.fullyResolved([]).then(
    callback = callbackHelper(function(resolved) {
      assertArrayEquals([], resolved);
    }),
    errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_withEmptyHash() {
  var callback, errback;
  webdriver.promise.fullyResolved({}).then(
    callback = callbackHelper(function(resolved) {
      webdriver.test.testutil.assertObjectEquals({}, resolved);
    }),
    errback = callbackHelper());

  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_arrayWithPromisedHash() {
  var obj = {'foo': 'bar'};
  var promise = webdriver.promise.fulfilled(obj);
  var array = [promise];

  var callback, errback;
  webdriver.promise.fullyResolved(array).then(
      callback = callbackHelper(function(resolved) {
        webdriver.test.testutil.assertObjectEquals(resolved, [obj]);
      }),
      errback = callbackHelper());


  clock.tick();
  errback.assertNotCalled();
  callback.assertCalled();
}


function testFullyResolved_aDomElement() {
  var e = document.createElement('div');
  var callbacks = callbackPair(function(resolved) {
    assertEquals(e, resolved);
  });

  webdriver.promise.fullyResolved(e).
      then(callbacks.callback, callbacks.errback);

  clock.tick();
  callbacks.assertCallback();
}


function testCallbackChain_nonSplit() {
  var stage1 = callbackPair(),
      stage2 = callbackPair(),
      stage3 = callbackPair();

  webdriver.promise.rejected('foo').
      then(stage1.callback, stage1.errback).
      then(stage2.callback, stage2.errback).
      then(stage3.callback, stage3.errback);

  clock.tick();
  stage1.assertErrback('Wrong function for stage 1');
  stage2.assertCallback('Wrong function for stage 2');
  stage3.assertCallback('Wrong function for final stage');
}


function testCallbackChain_split() {
  var stage1 = callbackPair(),
      stage2 = callbackPair(),
      stage3 = callbackPair();

  webdriver.promise.rejected('foo').
      then(stage1.callback).
      thenCatch(stage1.errback).
      then(stage2.callback).
      thenCatch(stage2.errback).
      then(stage3.callback, stage3.errback);

  clock.tick();
  stage1.assertErrback('Wrong function for stage 1');
  stage2.assertCallback('Wrong function for stage 2');
  stage3.assertCallback('Wrong function for final stage');
}


function testCheckedNodeCall_functionThrows() {
  var error = new Error('boom');
  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
  });

  webdriver.promise.checkedNodeCall(function() {
    throw error;
  }).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testCheckedNodeCall_functionReturnsAnError() {
  var error = new Error('boom');
  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
  });
  webdriver.promise.checkedNodeCall(function(callback) {
    callback(error);
  }).then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testCheckedNodeCall_functionReturnsSuccess() {
  var success = 'success!';
  var pair = callbackPair(function(value) {
    assertEquals(success, value);
  });
  webdriver.promise.checkedNodeCall(function(callback) {
    callback(null, success);
  }).then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testCheckedNodeCall_functionReturnsAndThrows() {
  var error = new Error('boom');
  var error2 = new Error('boom again');
  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
  });
  webdriver.promise.checkedNodeCall(function(callback) {
    callback(error);
    throw error2;
  }).then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testCheckedNodeCall_functionThrowsAndReturns() {
  var error = new Error('boom');
  var error2 = new Error('boom again');
  var pair = callbackPair(null, function(e) {
    assertEquals(error2, e);
  });
  webdriver.promise.checkedNodeCall(function(callback) {
    setTimeout(goog.partial(callback, error), 10);
    throw error2;
  }).then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
  pair.reset();
  clock.tick(Infinity);
  pair.assertNeither();
}


function testCancel_passesTheCancellationReasonToReject() {
  var pair = callbackPair(null, function(e) {
    assertTrue(e instanceof webdriver.promise.CancellationError);
    assertEquals('because i said so', e.message);
  });
  var d = new webdriver.promise.Deferred();
  d.then(pair.callback, pair.errback);
  d.cancel('because i said so');
  clock.tick();
  pair.assertErrback();
}


function testCancel_canCancelADeferredFromAChainedPromise() {
  var pair1 = callbackPair(null, function(e) {
    assertTrue(e instanceof webdriver.promise.CancellationError);
    assertEquals('because i said so', e.message);
  });
  var pair2 = callbackPair();

  var d = new webdriver.promise.Deferred();
  var p = d.then(pair1.callback, pair1.errback);
  p.then(pair2.callback, pair2.errback);

  p.cancel('because i said so');
  clock.tick();
  pair1.assertErrback('The first errback should have fired.');
  pair2.assertCallback();
}


function testCancel_canCancelATimeout() {
  var pair = callbackPair(null, function(e) {
    assertTrue(e instanceof webdriver.promise.CancellationError);
  });
  var p = webdriver.promise.delayed(250).
      then(pair.callback, pair.errback);
  p.cancel();
  clock.tick();
  pair.assertErrback();
  clock.tick(250);  // Just to make sure nothing happens.
  pair.assertErrback();
}


function testCancel_cancelIsANoopOnceAPromiseHasBeenFulfilled() {
  var p = webdriver.promise.fulfilled(123);
  p.cancel();

  var pair = callbackPair(goog.partial(assertEquals, 123));
  p.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testCancel_cancelIsANoopOnceAPromiseHasBeenRejected() {
  var p = webdriver.promise.rejected(new StubError);
  p.cancel();

  var pair = callbackPair(null, assertIsStubError);
  p.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testCancel_noopCancelTriggeredOnCallbackOfResolvedPromise() {
  var d = webdriver.promise.defer();
  var p = d.promise.then();

  d.fulfill();
  p.cancel();  // This should not throw.
}


function testCallbackRegistersAnotherListener_callbacksConfiguredPreResolve() {
  var messages = [];
  var d = new webdriver.promise.Deferred();
  d.promise.then(function() {
    messages.push('a');
    d.promise.then(function() {
      messages.push('c');
    });
  });
  d.promise.then(function() {
    messages.push('b');
  });
  d.fulfill();
  clock.tick();
  assertArrayEquals(['a', 'c', 'b'], messages);
}


function testCallbackRegistersAnotherListener_callbacksConfiguredPostResolve() {
  var messages = [];
  var p = webdriver.promise.fulfilled();
  p.then(function() {
    messages.push('a');
    p.then(function() {
      messages.push('c');
    });
  });
  p.then(function() {
    messages.push('b');
  });
  clock.tick();
  assertArrayEquals(['a', 'c', 'b'], messages);
}


function testCallbackRegistersAnotherListener_recursive() {
  var order = [];
  var promise = webdriver.promise.fulfilled();

  promise.then(function() {
    push();
    promise.then(push);
  }).then(function() {
    push();
  });

  assertArrayEquals([], order);
  clock.tick();
  assertArrayEquals([0, 1, 2], order);

  function push() {
    order.push(order.length);
  }
}


function testCallbackRegistersAnotherListener_recursiveCallbacks_many() {
  var messages = [];
  var start = 97;  // 'a'

  var p = webdriver.promise.fulfilled();
  p.then(push).then(function() {
    messages.push('done');
  });

  function push() {
    messages.push(String.fromCharCode(start++));
    if (start != 101) {  // 'd'
      p.then(push);
    }
  }

  clock.tick();
  assertArrayEquals(['a', 'b', 'c', 'd', 'done'], messages);
}


function testThenReturnsOwnPromiseIfNoCallbacksWereGiven() {
  var deferred = new webdriver.promise.Deferred();
  assertEquals(deferred.promise, deferred.promise.then());
  assertEquals(deferred.promise, webdriver.promise.when(deferred.promise));
}


function testIsStillConsideredUnHandledIfNoCallbacksWereGivenOnCallsToThen() {
  webdriver.promise.rejected(new StubError).then();
  var handler = callbackHelper(assertIsStubError);

  // so tearDown() doesn't throw
  app.removeAllListeners();
  app.on(webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, handler);
  clock.tick();
  handler.assertCalled();
}

function testResolvedReturnsInputValueIfItIsAPromise() {
  var input = webdriver.promise.fulfilled('a');
  var output = webdriver.promise.fulfilled(input);
  assertEquals(input, output);
}


function testADeferredsParentControlFlowIsActiveForCallbacks() {
  var defaultFlow = webdriver.promise.controlFlow();

  var flow1 = new webdriver.promise.ControlFlow();
  var d = new webdriver.promise.Deferred(flow1);
  d.fulfill();

  var flow2 = new webdriver.promise.ControlFlow();
  var d2 = new webdriver.promise.Deferred(flow2);
  d2.fulfill();

  assertIsFlow(defaultFlow);

  var callbacks = callbackPair();
  d.promise.then(assertIsFlow(flow1)).
      then(assertIsFlow(flow1)).
      then(function() {
        return d2.promise.then(assertIsFlow(flow2));
      }).
      then(assertIsFlow(flow1)).
      then(callbacks.callback, callbacks.errback);

  clock.tick();
  callbacks.assertCallback();
  assertIsFlow(defaultFlow);

  function assertIsFlow(flow) {
    return function() {
      assertEquals(flow, webdriver.promise.controlFlow());
    };
  }
}


function testPromiseAll_emptyArray() {
  var pair = callbackPair(function(value) {
    assertArrayEquals([], value);
  });

  webdriver.promise.all([]).then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testPromiseAll() {
  var a = [
      0, 1,
      webdriver.promise.defer(),
      webdriver.promise.defer(),
      4, 5, 6
  ];
  delete a[5];

  var pair = callbackPair(function(value) {
    var expected = [0, 1, 2, 3, 4, 5, 6];
    delete expected[5];
    assertArrayEquals(expected, value);
  });

  webdriver.promise.all(a).then(pair.callback, pair.errback);
  pair.assertNeither();

  a[2].fulfill(2);
  pair.assertNeither();

  a[3].fulfill(3);
  clock.tick();
  pair.assertCallback();
}


function testPromiseAll_usesFirstRejection() {
  var a = [
    webdriver.promise.defer(),
    webdriver.promise.defer()
  ];

  var pair = callbackPair(null, assertIsStubError);

  webdriver.promise.all(a).then(pair.callback, pair.errback);
  pair.assertNeither();

  a[1].reject(new StubError);
  clock.tick();
  pair.assertErrback();

  a[0].reject(Error('ignored'));
  clock.tick(Infinity);
}


function testMappingAnArray() {
  var a = [1, 2, 3];
  var result = webdriver.promise.map(a, function(value, index, a2) {
    assertEquals(a, a2);
    assertEquals('not a number', 'number', typeof index);
    return value + 1;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([2, 3, 4], value);
  });

  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testMappingAnArray_omitsDeleted() {
  var a = [0, 1, 2, 3, 4, 5, 6];
  delete a[1];
  delete a[3];
  delete a[4];
  delete a[6];

  var result = webdriver.promise.map(a, function(value) {
    return value * value;
  });

  var expected = [0, 1, 4, 9, 16, 25, 36];
  delete expected[1];
  delete expected[3];
  delete expected[4];
  delete expected[6];

  var pair = callbackPair(function(value) {
    assertArrayEquals(expected, value);
  });

  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testMappingAnArray_emptyArray() {
  var result = webdriver.promise.map([], function(value) {
    return value + 1;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([], value);
  });

  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testMappingAnArray_inputIsPromise() {
  var input = webdriver.promise.defer();
  var result = webdriver.promise.map(input, function(value) {
    return value + 1;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([2, 3, 4], value);
  });

  result.then(pair.callback, pair.errback);
  pair.assertNeither();
  input.fulfill([1, 2, 3]);
  clock.tick();
  pair.assertCallback();
}


function testMappingAnArray_waitsForFunctionResultToResolve() {
  var innerResults = [
    webdriver.promise.defer(),
    webdriver.promise.defer()
  ];

  var result = webdriver.promise.map([1, 2], function(value, index) {
    return innerResults[index].promise;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals(['a', 'b'], value);
  });

  result.then(pair.callback, pair.errback);
  pair.assertNeither();

  innerResults[0].fulfill('a');
  clock.tick();
  pair.assertNeither();

  innerResults[1].fulfill('b');
  clock.tick();
  pair.assertCallback();
}


function testMappingAnArray_rejectsPromiseIfFunctionThrows() {
  var result = webdriver.promise.map([1], throwStubError);
  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testMappingAnArray_rejectsPromiseIfFunctionReturnsRejectedPromise() {
  var result = webdriver.promise.map([1], function() {
    return webdriver.promise.rejected(new StubError);
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testMappingAnArray_stopsCallingFunctionIfPreviousIterationFailed() {
  var count = 0;
  var result = webdriver.promise.map([1, 2, 3, 4], function() {
    count++;
    if (count == 3) {
      throw new StubError;
    }
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
  assertEquals(3, count);
}


function testMappingAnArray_rejectsWithFirstRejectedPromise() {
  var innerResult = [
      webdriver.promise.fulfilled(),
      createRejectedPromise(new StubError),
      createRejectedPromise(Error('should be ignored'))
  ];
  var count = 0;
  var result = webdriver.promise.map([1, 2, 3, 4], function(value, index) {
    count += 1;
    return innerResult[index];
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
  assertEquals(2, count);
}


function testMappingAnArray_preservesOrderWhenMapReturnsPromise() {
  var deferreds = [
    webdriver.promise.defer(),
    webdriver.promise.defer(),
    webdriver.promise.defer(),
    webdriver.promise.defer()
  ];
  var result = webdriver.promise.map(deferreds, function(value) {
    return value.promise;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([0, 1, 2, 3], value);
  });
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertNeither();

  goog.array.forEachRight(deferreds, function(d, i) {
    d.fulfill(i);
  });
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray() {
  var a = [0, 1, 2, 3];
  var result = webdriver.promise.filter(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('not a number', 'number', typeof index);
    return val > 1;
  });

  var pair = callbackPair(function(val) {
    assertArrayEquals([2, 3], val);
  });
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray_omitsDeleted() {
  var a = [0, 1, 2, 3, 4, 5, 6];
  delete a[3];
  delete a[4];

  var result = webdriver.promise.filter(a, function(value) {
    return value > 1 && value < 6;
  });

  var pair = callbackPair(function(val) {
    assertArrayEquals([2, 5], val);
  });
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray_preservesInputs() {
  var a = [0, 1, 2, 3];

  var result = webdriver.promise.filter(a, function(value, i, a2) {
    assertEquals(a, a2);
    // Even if a function modifies the input array, the original value
    // should be inserted into the new array.
    a2[i] = a2[i] - 1;
    return a2[i] >= 1;
  });

  var pair = callbackPair(function(val) {
    assertArrayEquals([2, 3], val);
  });
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray_inputIsPromise() {
  var input = webdriver.promise.defer();
  var result = webdriver.promise.filter(input, function(value) {
    return value > 1 && value < 3;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([2], value);
  });

  result.then(pair.callback, pair.errback);
  pair.assertNeither();
  input.fulfill([1, 2, 3]);
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray_waitsForFunctionResultToResolve() {
  var innerResults = [
    webdriver.promise.defer(),
    webdriver.promise.defer()
  ];

  var result = webdriver.promise.filter([1, 2], function(value, index) {
    return innerResults[index].promise;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([2], value);
  });

  result.then(pair.callback, pair.errback);
  pair.assertNeither();

  innerResults[0].fulfill(false);
  clock.tick();
  pair.assertNeither();

  innerResults[1].fulfill(true);
  clock.tick();
  pair.assertCallback();
}


function testFilteringAnArray_rejectsPromiseIfFunctionReturnsRejectedPromise() {
  var result = webdriver.promise.filter([1], function() {
    return webdriver.promise.rejected(new StubError);
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function testFilteringAnArray_stopsCallingFunctionIfPreviousIterationFailed() {
  var count = 0;
  var result = webdriver.promise.filter([1, 2, 3, 4], function() {
    count++;
    if (count == 3) {
      throw new StubError;
    }
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
  assertEquals(3, count);
}


function testFilteringAnArray_rejectsWithFirstRejectedPromise() {
  var innerResult = [
    webdriver.promise.fulfilled(),
    createRejectedPromise(new StubError),
    createRejectedPromise(Error('should be ignored'))
  ];
  var result = webdriver.promise.filter([1, 2, 3, 4], function(value, index) {
    assertTrue(index < innerResult.length);
    return innerResult[index];
  });

  var pair = callbackPair(null, assertIsStubError);
  result.then(pair.callback, pair.errback);
  pair.assertNeither();

  clock.tick();
  pair.assertErrback();
}


function testFilteringAnArray_preservesOrderWhenFilterReturnsPromise() {
  var deferreds = [
    webdriver.promise.defer(),
    webdriver.promise.defer(),
    webdriver.promise.defer(),
    webdriver.promise.defer()
  ];
  var result = webdriver.promise.filter([0, 1, 2, 3], function(value, index) {
    return deferreds[index].promise;
  });

  var pair = callbackPair(function(value) {
    assertArrayEquals([1, 2], value);
  });
  result.then(pair.callback, pair.errback);
  clock.tick();
  pair.assertNeither();

  goog.array.forEachRight(deferreds, function(d, i) {
    d.fulfill(i > 0 && i < 3);
  });
  clock.tick();
  pair.assertCallback();
}


function testAddThenableImplementation() {
  function tmp() {}
  assertFalse(webdriver.promise.Thenable.isImplementation(new tmp()));
  webdriver.promise.Thenable.addImplementation(tmp);
  assertTrue(webdriver.promise.Thenable.isImplementation(new tmp()));
}


function testLongStackTraces_doesNotAppendStackIfFeatureDisabled() {
  webdriver.promise.LONG_STACK_TRACES = false;

  var error = Error('hello');
  var originalStack = error.stack;
  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    assertEquals(originalStack, e.stack);
  });
  webdriver.promise.rejected(error).
      then(fail).
      then(fail).
      then(fail).
      then(pair.callback, pair.errback);
  clock.tick();
  pair.assertErrback();
}


function getStackMessages(error) {
  var stack = webdriver.stacktrace.getStack(error);
  return goog.array.filter(stack.split(/\n/), function(line) {
    return /^From: /.test(line);
  });
}


function testLongStackTraces_appendsInitialPromiseCreation_resolverThrows() {
  webdriver.promise.LONG_STACK_TRACES = true;

  var error = Error('hello');
  var originalStack = '(placeholder; will be overwritten later)';

  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    if (!goog.isString(originalStack)) {
      return;
    }
    assertNotEquals(originalStack, e.stack);
    assertTrue('should start with original stack',
        goog.string.startsWith(e.stack, originalStack));
    assertArrayEquals(['From: Promise: new'], getStackMessages(e));
  });

  new webdriver.promise.Promise(function() {
    try {
      throw error;
    } catch (e) {
      originalStack = e.stack;
      throw e;
    }
  }).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testLongStackTraces_appendsInitialPromiseCreation_rejectCalled() {
  webdriver.promise.LONG_STACK_TRACES = true;

  var error = Error('hello');
  var originalStack = error.stack;

  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    if (!goog.isString(originalStack)) {
      return;
    }
    assertNotEquals(originalStack, e.stack);
    assertTrue('should start with original stack',
        goog.string.startsWith(e.stack, originalStack));
    assertArrayEquals(['From: Promise: new'], getStackMessages(e));
  });

  new webdriver.promise.Promise(function(_, reject) {
    reject(error);
  }).then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testLongStackTraces_appendsEachStepToRejectionError() {
  webdriver.promise.LONG_STACK_TRACES = true;

  var error = Error('hello');
  var originalStack = '(placeholder; will be overwritten later)';

  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    if (!goog.isString(originalStack)) {
      return;
    }
    assertNotEquals(originalStack, e.stack);
    assertTrue('should start with original stack',
        goog.string.startsWith(e.stack, originalStack));
    assertArrayEquals([
      'From: Promise: new',
      'From: Promise: then',
      'From: Promise: thenCatch',
      'From: Promise: then',
      'From: Promise: thenCatch',
    ], getStackMessages(e));
  });

  new webdriver.promise.Promise(function() {
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
  then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}


function testLongStackTraces_errorOccursInCallbackChain() {
  webdriver.promise.LONG_STACK_TRACES = true;

  var error = Error('hello');
  var originalStack = '(placeholder; will be overwritten later)';

  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    if (!goog.isString(originalStack)) {
      return;
    }
    assertNotEquals(originalStack, e.stack);
    assertTrue('should start with original stack',
        goog.string.startsWith(e.stack, originalStack));
    assertArrayEquals([
      'From: Promise: then',
      'From: Promise: thenCatch',
    ], getStackMessages(e));
  });

  webdriver.promise.fulfilled().
      then(goog.nullFunction).
      then(goog.nullFunction).
      then(function() {
        try {
          throw error;
        } catch (e) {
          originalStack = e.stack;
          throw e;
        }
      }).
      thenCatch(function(e) { throw e; }).
      then(pair.callback, pair.errback);

  clock.tick();
  pair.assertErrback();
}
