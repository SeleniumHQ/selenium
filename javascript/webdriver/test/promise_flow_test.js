// Copyright 2014 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('webdriver.promise.ControlFlow');
goog.require('webdriver.stacktrace.Snapshot');
goog.require('webdriver.stacktrace');
goog.require('webdriver.test.testutil');

// Aliases for readability.
var StubError = webdriver.test.testutil.StubError,
    throwStubError = webdriver.test.testutil.throwStubError,
    assertIsStubError = webdriver.test.testutil.assertIsStubError,
    assertingMessages = webdriver.test.testutil.assertingMessages,
    callbackHelper = webdriver.test.testutil.callbackHelper,
    callbackPair = webdriver.test.testutil.callbackPair;

var flow, flowHistory, uncaughtExceptions;

function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  webdriver.promise.LONG_STACK_TRACES = false;
  flow = new webdriver.promise.ControlFlow();
  webdriver.promise.setDefaultFlow(flow);
  webdriver.test.testutil.messages = [];
  flowHistory = [];

  uncaughtExceptions = [];
  flow.on(webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
          onUncaughtException);
}


function tearDown() {
  flow.removeAllListeners(
      webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  assertArrayEquals('There were uncaught exceptions', [], uncaughtExceptions);
  flow.reset();
  webdriver.promise.LONG_STACK_TRACES = false;
}


function onUncaughtException(e) {
  uncaughtExceptions.push(e);
}


function waitForAbort(opt_flow) {
  var theFlow = opt_flow || flow;
  theFlow.removeAllListeners(
      webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  return new goog.Promise(function(fulfill, reject) {
    theFlow.once(webdriver.promise.ControlFlow.EventType.IDLE, function() {
      reject(Error('expected flow to report an unhandled error'));
    });
    theFlow.once(
        webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
        fulfill);
  });
}


function waitForIdle(opt_flow) {
  var theFlow = opt_flow || flow;
  return new goog.Promise(function(fulfill, reject) {
    theFlow.once(webdriver.promise.ControlFlow.EventType.IDLE, fulfill);
    theFlow.once(
        webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, reject);
  });
}

function timeout(ms) {
  return new goog.Promise(function(fulfill) {
    setTimeout(fulfill, ms);
  });
}


function schedule(msg, opt_return) {
  return scheduleAction(msg, function() {
    return opt_return;
  });
}

/**
 * @param {string} value The value to push.
 * @param {webdriver.promise.Promise=} opt_taskPromise Promise to return from
 *     the task.
 * @return {!webdriver.promise.Promise} The result.
 */
function schedulePush(value, opt_taskPromise) {
  return scheduleAction(value, function() {
    webdriver.test.testutil.messages.push(value);
    return opt_taskPromise;
  });
}

/**
 * @param {string} msg Debug message.
 * @param {!Function} actionFn The function.
 * @return {!webdriver.promise.Promise} The function result.
 */
function scheduleAction(msg, actionFn) {
  return webdriver.promise.controlFlow().execute(function() {
    flowHistory.push(msg);
    return actionFn();
  }, msg);
}

/**
 * @param {!Function} condition The condition function.
 * @param {number} timeout The timeout.
 * @param {string=} opt_message Optional message.
 * @return {!webdriver.promise.Promise} The wait result.
 */
function scheduleWait(condition, timeout, opt_message) {
  var msg = opt_message || '';
  // It's not possible to hook into when the wait itself is scheduled, so
  // we record each iteration of the wait loop.
  var count = 0;
  return webdriver.promise.controlFlow().wait(function() {
    flowHistory.push((count++) + ': ' + msg);
    return condition();
  }, timeout, msg);
}


function assertFlowHistory(var_args) {
  var expected = goog.array.slice(arguments, 0);
  assertArrayEquals(expected, flowHistory);
}


/**
 * @param {string=} opt_description A description of the task for debugging.
 * @return {!webdriver.promise.Task_} The new task.
 */
function createTask(opt_description) {
  return new webdriver.promise.Task_(
      webdriver.promise.controlFlow(),
      goog.nullFunction,
      opt_description || '',
      new webdriver.stacktrace.Snapshot());
}

/**
 * @return {!webdriver.promise.Frame_}
 */
function createFrame() {
  return new webdriver.promise.Frame_(webdriver.promise.controlFlow());
}


function testScheduling_aSimpleFunction() {
  schedule('go');
  return waitForIdle().then(function() {
    assertFlowHistory('go');
  });
}


function testScheduling_aSimpleFunctionWithANonPromiseReturnValue() {
  schedule('go', 123).then(function(value) {
    assertEquals(123, value);
  });
  return waitForIdle().then(function() {
    assertFlowHistory('go');
  });
}


function testScheduling_aSimpleSequence() {
  schedule('a');
  schedule('b');
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testScheduling_invokesCallbacksWhenTaskIsDone() {
  var d = new webdriver.promise.Deferred();
  var called = false;
  var done = schedule('a', d.promise).then(function(value) {
    called = true;
    assertEquals(123, value);
  });
  return timeout(5).then(function() {
    assertFalse(called);
    d.fulfill(123);
    return done;
  }).
  then(waitForIdle).
  then(function() {
    assertFlowHistory('a');
  });
}


function testScheduling_blocksUntilPromiseReturnedByTaskIsResolved() {
  var done = webdriver.promise.defer();
  schedulePush('a', done.promise);
  schedulePush('b');
  setTimeout(function() {
    done.fulfill();
    webdriver.test.testutil.messages.push('c');
  }, 25);
  return waitForIdle().then(assertingMessages('a', 'c', 'b'));
}


function testScheduling_waitsForReturnedPromisesToResolve() {
  var d1 = new webdriver.promise.Deferred();
  var d2 = new webdriver.promise.Deferred();

  var callback;
  schedule('a', d1.promise).then(callback = callbackHelper(function(value) {
    assertEquals('fluffy bunny', value);
  }));

  return timeout(5).then(function() {
    callback.assertNotCalled('d1 not resolved yet');
    d1.fulfill(d2);
    return timeout(5);
  }).then(function() {
    callback.assertNotCalled('d2 not resolved yet');
    d2.fulfill('fluffy bunny');
    return waitForIdle();
  }).then(function() {
    callback.assertCalled('d2 has been resolved');
    assertFlowHistory('a');
  });
}


function testScheduling_executesTasksInAFutureTurnAfterTheyAreScheduled() {
  var count = 0;
  function incr() { count++; }

  scheduleAction('', incr);
  assertEquals(0, count);
  return waitForIdle().then(function() {
    assertEquals(1, count);
  });
}


function testScheduling_executesOneTaskPerTurnOfTheEventLoop() {
  var order = [];
  function go() {
    order.push(order.length / 2);
    goog.async.run(function() {
      order.push('-');
    });
  }

  scheduleAction('', go);
  scheduleAction('', go);
  return waitForIdle().then(function() {
    assertArrayEquals([0, '-', 1, '-'], order);
  })
}


function testScheduling_firstScheduledTaskIsWithinACallback() {
  webdriver.promise.fulfilled().then(function() {
    schedule('a');
    schedule('b');
    schedule('c');
  }).then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
  return waitForIdle();
}


function testScheduling_newTasksAddedWhileWaitingOnTaskReturnedPromise() {
  scheduleAction('a', function() {
    var d = webdriver.promise.defer();
    setTimeout(function() {
      schedule('c');
      d.fulfill();
    }, 10);
    return d.promise;
  });
  schedule('b');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'c', 'b');
  });
}


function testFraming_callbacksRunInANewFrame() {
  schedule('a').then(function() {
    schedule('c');
  });
  schedule('b');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'c', 'b');
  });
}


function testFraming_lotsOfNesting() {
  schedule('a').then(function() {
    schedule('c').then(function() {
      schedule('e').then(function() {
        schedule('g');
      });
      schedule('f');
    });
    schedule('d');
  });
  schedule('b');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'c', 'e', 'g', 'f', 'd', 'b');
  });
}


function testFrame_callbackReturnsPromiseThatDependsOnATask_1() {
  schedule('a').then(function() {
    schedule('b');
    return webdriver.promise.delayed(5).then(function() {
      return schedule('c');
    });
  });
  schedule('d');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd');
  });
}


function testFrame_callbackReturnsPromiseThatDependsOnATask_2() {
  schedule('a').then(function() {
    schedule('b');
    return webdriver.promise.delayed(5).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return schedule('c'); });
  });
  schedule('d');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd');
  });
}


function testFraming_eachCallbackWaitsForAllScheduledTasksToComplete() {
  schedule('a').
      then(function() {
        schedule('b');
        schedule('c');
      }).
      then(function() {
        schedule('d');
      });
  schedule('e');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e');
  });
}


function testFraming_eachCallbackWaitsForReturnTasksToComplete() {
  schedule('a').
      then(function() {
        schedule('b');
        return schedule('c');
      }).
      then(function() {
        schedule('d');
      });
  schedule('e');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e');
  });
}


function testFraming_callbacksOnAResolvedPromiseInsertIntoTheCurrentFlow() {
  webdriver.promise.fulfilled().then(function() {
    schedule('b');
  });
  schedule('a');

  return waitForIdle().then(function() {
    assertFlowHistory('b', 'a');
  });
}


function testFraming_callbacksInterruptTheFlowWhenPromiseIsResolved() {
  schedule('a').then(function() {
    schedule('c');
  })
  schedule('b');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'c', 'b');
  });
}


function testFraming_allCallbacksInAFrameAreScheduledWhenPromiseIsResolved() {
  var a = schedule('a');
  a.then(function() { schedule('b'); });
  schedule('c');
  a.then(function() { schedule('d'); });
  schedule('e');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'd', 'c', 'e');
  });
}


function testFraming_tasksScheduledInInActiveFrameDoNotGetPrecedence() {
  var d = webdriver.promise.fulfilled();
  schedule('a');
  schedule('b');
  d.then(function() { schedule('c'); });

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testFraming_tasksScheduledInAFrameGetPrecedence_1() {
  var a = schedule('a');
  schedule('b').then(function() {
    a.then(function() {
      schedule('c');
      schedule('d');
    });
    var e = schedule('e');
    a.then(function() {
      // When this function runs, |e| will not be resolved yet, so |f| and
      // |h| will be resolved first.  After |e| is resolved, |g| will be
      // scheduled in a new frame, resulting in: [j][f, h, i][g], so |g| is
      // expected to execute first.
      schedule('f');
      e.then(function() {
        schedule('g');
      });
      schedule('h');
    });
    schedule('i');
  });
  schedule('j');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e', 'g', 'f', 'h', 'i', 'j');
  });
}


function testErrorHandling_thrownErrorsArePassedToTaskErrback() {
  scheduleAction('function that throws', throwStubError).
      then(fail, assertIsStubError);
  return waitForIdle();
}


function testErrorHandling_thrownErrorsPropagateThroughPromiseChain() {
  scheduleAction('function that throws', throwStubError).
      then(fail).
      then(fail, assertIsStubError);
  return waitForIdle();
}


function testErrorHandling_catchesErrorsFromFailedTasksInAFrame() {
  schedule('a').then(function() {
    schedule('b');
    scheduleAction('function that throws', throwStubError);
  }).
  then(fail, assertIsStubError);
  return waitForIdle();
}


function testErrorHandling_abortsIfOnlyTaskReturnsAnUnhandledRejection() {
  scheduleAction('function that returns rejected promise', function() {
    return webdriver.promise.rejected(new StubError);
  });
  return waitForAbort().then(assertIsStubError);
}


function testErrorHandling_abortsIfThereIsAnUnhandledRejection() {
  webdriver.promise.rejected(new StubError);
  schedule('this should not run');
  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory(/* none */);
      });
}


function testErrorHandling_abortsSequenceIfATaskFails() {
  schedule('a');
  schedule('b');
  scheduleAction('c', throwStubError);
  schedule('d');  // Should never execute.

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
}


function testErrorHandling_abortsFromUnhandledFramedTaskFailures_1() {
  schedule('outer task').then(function() {
    scheduleAction('inner task', throwStubError);
  });
  schedule('this should not run');
  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('outer task', 'inner task');
      });
}


function testErrorHandling_abortsFromUnhandledFramedTaskFailures_2() {
  schedule('a').then(function() {
    schedule('b').then(function() {
      scheduleAction('c', throwStubError);
      // This should not execute.
      schedule('d');
    });
  });

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
}


function testErrorHandling_abortsWhenErrorBubblesUpFromFullyResolvingAnObject() {
  var callback = callbackHelper(function() {
    return webdriver.promise.rejected('rejected 2');
  });

  scheduleAction('', function() {
    var obj = {'foo': webdriver.promise.rejected(new StubError)};
    return webdriver.promise.fullyResolved(obj).then(callback);
  });

  return waitForAbort().
      then(assertIsStubError).
      then(callback.assertNotCalled);
}


function testErrorHandling_abortsWhenErrorBubblesUpFromFullyResolvingAnObject_withCallback() {
  var callback1 = callbackHelper(function() {
    return webdriver.promise.rejected('rejected 2');
  });
  var callback2 = callbackHelper();

  scheduleAction('', function() {
    var obj = {'foo': webdriver.promise.rejected(new StubError)};
    return webdriver.promise.fullyResolved(obj).then(callback1);
  }).then(callback2);

  return waitForAbort().
      then(assertIsStubError).
      then(callback1.assertNotCalled).
      then(callback2.assertNotCalled);
}


function testErrorHandling_canCatchErrorsFromNestedTasks() {
  var errback;
  schedule('a').
      then(function() {
        return scheduleAction('b', throwStubError);
      }).
      thenCatch(errback = callbackHelper(assertIsStubError));
  return waitForIdle().then(errback.assertCalled);
}


function testErrorHandling_nestedCommandFailuresCanBeCaughtAndSuppressed() {
  var errback;
  schedule('a').then(function() {
    return schedule('b').then(function() {
      return schedule('c').then(function() {
        throw new StubError;
      });
    });
  }).thenCatch(errback = callbackHelper(assertIsStubError));
  schedule('d');
  return waitForIdle().
      then(errback.assertCalled).
      then(function() {
        assertFlowHistory('a', 'b', 'c', 'd');
      });
}


function testErrorHandling_aTaskWithAnUnhandledPromiseRejection() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    webdriver.promise.rejected(new StubError);
  });
  schedule('should never run');

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'sub-tasks');
      });
}

function testErrorHandling_aTaskThatReutrnsARejectedPromise() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    return webdriver.promise.rejected(new StubError);
  });
  schedule('should never run');

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'sub-tasks');
      });
}


function testErrorHandling_discardsSubtasksIfTaskThrows() {
  var pair = callbackPair(null, assertIsStubError);
  scheduleAction('a', function() {
    schedule('b');
    schedule('c');
    throwStubError();
  }).then(pair.callback, pair.errback);
  schedule('d');

  return waitForIdle().
      then(pair.assertErrback).
      then(function() {
        assertFlowHistory('a', 'd');
      });
}


function testErrorHandling_discardsRemainingSubtasksIfASubtaskFails() {
  var pair = callbackPair(null, assertIsStubError);
  scheduleAction('a', function() {
    schedule('b');
    scheduleAction('c', throwStubError);
    schedule('d');
  }).then(pair.callback, pair.errback);
  schedule('e');

  return waitForIdle().
      then(pair.assertErrback).
      then(function() {
        assertFlowHistory('a', 'b', 'c', 'e');
      });
}


function testTryFinally_happyPath() {
  /* Model:
     try {
       doFoo();
       doBar();
     } finally {
       doBaz();
     }
   */
  schedulePush('foo').
      then(goog.partial(schedulePush, 'bar')).
      thenFinally(goog.partial(schedulePush, 'baz'));
  return waitForIdle().then(assertingMessages('foo', 'bar', 'baz'));
}


function testTryFinally_firstTryFails() {
  /* Model:
     try {
       doFoo();
       doBar();
     } finally {
       doBaz();
     }
   */

  scheduleAction('doFoo and throw', function() {
    webdriver.test.testutil.messages.push('foo');
    throw new StubError;
  }).
  then(function() { schedulePush('bar'); }).
  thenFinally(function() { schedulePush('baz'); });

  return waitForAbort().
      then(assertIsStubError).
      then(assertingMessages('foo', 'baz'));
}


function testTryFinally_secondTryFails() {
  /* Model:
     try {
       doFoo();
       doBar();
     } finally {
       doBaz();
     }
   */

  schedulePush('foo').
      then(function() {
        return scheduleAction('doBar and throw', function() {
          webdriver.test.testutil.messages.push('bar');
          throw new StubError;
        });
      }).
      thenFinally(function() {
        return schedulePush('baz');
      });
  return waitForAbort().
      then(assertIsStubError).
      then(assertingMessages('foo', 'bar', 'baz'));
}


function testTaskCallbacksInterruptFlow() {
  schedule('a').then(function() {
    schedule('b');
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function
testTaskCallbacksInterruptFlow_taskDependsOnImmediatelyFulfilledPromise() {
  scheduleAction('a', function() {
    return webdriver.promise.fulfilled();
  }).then(function() {
    schedule('b');
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testTaskCallbacksInterruptFlow_taskDependsOnPreviouslyFulfilledPromise() {
  var promise = webdriver.promise.fulfilled(123);
  scheduleAction('a', function() {
    return promise;
  }).then(function(value) {
    assertEquals(123, value);
    schedule('b');
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testTaskCallbacksInterruptFlow_taskDependsOnAsyncPromise() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(25);
  }).then(function() {
    schedule('b');
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testPromiseChainedToTaskInterruptFlow() {
  schedule('a').then(function() {
    return webdriver.promise.fulfilled();
  }).then(function() {
    return webdriver.promise.fulfilled();
  }).then(function() {
    schedule('b');
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testNestedTaskCallbacksInterruptFlowWhenResolved() {
  schedule('a').then(function() {
    schedule('b').then(function() {
      schedule('c');
    });
  });
  schedule('d');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd');
  });
}


function testDelayedNesting_1() {
  var a = schedule('a');
  schedule('b').then(function() {
    a.then(function() { schedule('c'); });
    schedule('d');
  });
  schedule('e');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e');
  });
}


function testDelayedNesting_2() {
  var a = schedule('a');
  schedule('b').then(function() {
    a.then(function() { schedule('c'); });
    schedule('d');
    a.then(function() { schedule('e'); });
  });
  schedule('f');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e', 'f');
  });
}


function testDelayedNesting_3() {
  var a = schedule('a');
  schedule('b').then(function() {
    a.then(function() { schedule('c'); });
    a.then(function() { schedule('d'); });
  });
  schedule('e');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e');
  });
}


function testDelayedNesting_4() {
  var a = schedule('a');
  schedule('b').then(function() {
    a.then(function() { schedule('c'); }).then(function() {
      schedule('d');
    });
    a.then(function() { schedule('e'); });
  });
  schedule('f');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e', 'f');
  });
}


function testDelayedNesting_5() {
  var a = schedule('a');
  schedule('b').then(function() {
    var c;
    a.then(function() { c = schedule('c'); }).then(function() {
      schedule('d');
      a.then(function() { schedule('e'); });
      c.then(function() { schedule('f'); });
      schedule('g');
    });
    a.then(function() { schedule('h'); });
  });
  schedule('i');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i');
  });
}


function testWaiting_onAConditionThatIsAlwaysTrue() {
  scheduleWait(function() { return true;}, 0, 'waiting on true');
  return waitForIdle().then(function() {
    assertFlowHistory('0: waiting on true');
  });
}


function testWaiting_aSimpleCountingCondition() {
  var count = 0;
  scheduleWait(function() {
    return ++count == 3;
  }, 200, 'counting to 3');

  return waitForIdle().then(function() {
    assertEquals(3, count);
  });
}


function testWaiting_aConditionThatReturnsAPromise() {
  var d = new webdriver.promise.Deferred();
  var count = 0;

  scheduleWait(function() {
    count += 1;
    return d.promise;
  }, 0, 'waiting for promise');

  return timeout(50).then(function() {
    assertEquals(1, count);
    d.fulfill(123);
    return waitForIdle();
  });
}


function testWaiting_aConditionThatReturnsAPromise_2() {
  var count = 0;
  scheduleWait(function() {
    return webdriver.promise.fulfilled(++count == 3);
  }, 200, 'waiting for promise');

  return waitForIdle().then(function() {
    assertEquals(3, count);
  });
}


function testWaiting_aConditionThatReturnsATaskResult() {
  var count = 0;
  scheduleWait(function() {
    return scheduleAction('increment count', function() {
      return ++count == 3;
    });
  }, 200, 'counting to 3');
  schedule('post wait');

  return waitForIdle().then(function() {
    assertEquals(3, count);
    assertFlowHistory(
        '0: counting to 3', 'increment count',
        '1: counting to 3', 'increment count',
        '2: counting to 3', 'increment count',
        'post wait');
  });
}


function testWaiting_conditionContainsASubtask() {
  var count = 0;
  scheduleWait(function() {
    schedule('sub task');
    return ++count == 3;
  }, 200, 'counting to 3');
  schedule('post wait');

  return waitForIdle().then(function() {
    assertEquals(3, count);
    assertFlowHistory(
        '0: counting to 3', 'sub task',
        '1: counting to 3', 'sub task',
        '2: counting to 3', 'sub task',
        'post wait');
  });
}


function testWaiting_cancelsWaitIfScheduledTaskFails() {
  var pair = callbackPair(null, assertIsStubError);
  scheduleWait(function() {
    scheduleAction('boom', throwStubError);
    schedule('this should not run');
    return true;
  }, 200, 'waiting to go boom').then(pair.callback, pair.errback);
  schedule('post wait');

  return waitForIdle().
      then(pair.assertErrback).
      then(function() {
        assertFlowHistory(
            '0: waiting to go boom', 'boom',
            'post wait');
      });
}


function testWaiting_failsIfConditionThrows() {
  var callbacks = callbackPair(null, assertIsStubError);
  scheduleWait(throwStubError, 0, 'goes boom').
      then(callbacks.callback, callbacks.errback);
  schedule('post wait');

  return waitForIdle().
      then(callbacks.assertErrback).
      then(function() {
        assertFlowHistory('0: goes boom', 'post wait');
      });
}


function testWaiting_failsIfConditionReturnsARejectedPromise() {
  var callbacks = callbackPair(null, assertIsStubError);
  scheduleWait(function() {
    return webdriver.promise.rejected(new StubError);
  }, 0, 'goes boom').then(callbacks.callback, callbacks.errback);
  schedule('post wait');

  return waitForIdle().
      then(callbacks.assertErrback).
      then(function() {
        assertFlowHistory('0: goes boom', 'post wait');
      });
}


function testWaiting_failsIfConditionHasUnhandledRejection() {
  var callbacks = callbackPair(null, assertIsStubError);
  scheduleWait(function() {
    webdriver.promise.controlFlow().execute(throwStubError);
  }, 0, 'goes boom').then(callbacks.callback, callbacks.errback);
  schedule('post wait');

  return waitForIdle().
      then(callbacks.assertErrback).
      then(function() {
        assertFlowHistory('0: goes boom', 'post wait');
      });
}


function testWaiting_failsIfConditionHasAFailedSubtask() {
  var callbacks = callbackPair(null, assertIsStubError);
  var count = 0;
  scheduleWait(function() {
    scheduleAction('maybe throw', function() {
      if (++count == 2) {
        throw new StubError;
      }
    });
  }, 200, 'waiting').then(callbacks.callback, callbacks.errback);
  schedule('post wait');

  return waitForIdle().then(function() {
    assertEquals(2, count);
    assertFlowHistory(
        '0: waiting', 'maybe throw',
        '1: waiting', 'maybe throw',
        'post wait');
  });
}


function testWaiting_pollingLoopWaitsForAllScheduledTasksInCondition() {
  var count = 0;
  scheduleWait(function() {
    scheduleAction('increment count', function() { ++count; });
    return count >= 3;
  }, 350, 'counting to 3');
  schedule('post wait');

  return waitForIdle().then(function() {
    assertEquals(4, count);
    assertFlowHistory(
        '0: counting to 3', 'increment count',
        '1: counting to 3', 'increment count',
        '2: counting to 3', 'increment count',
        '3: counting to 3', 'increment count',
        'post wait');
  });
}


function testWaiting_timesOut_zeroTimeout() {
  scheduleWait(function() { return false; }, 0, 'always false');
  return waitForAbort().then(function(e) {
    assertRegExp(/^always false\nWait timed out after \d+ms$/, e.message);
  });
}

function testWaiting_timesOut_nonZeroTimeout() {
  var count = 0;
  scheduleWait(function() {
    count += 1;
    var ms = count === 2 ? 65 : 5;
    var start = goog.now();
    return webdriver.promise.delayed(ms).then(function() {
      return false;
    });
  }, 60, 'counting to 3');
  return waitForAbort().then(function(e) {
    switch (count) {
      case 1:
        assertFlowHistory('0: counting to 3');
        break;
      case 2:
        assertFlowHistory('0: counting to 3', '1: counting to 3');
        break;
      default:
        fail('unexpected polling count: ' + count);
    }
    assertRegExp(/^counting to 3\nWait timed out after \d+ms$/, e.message);
  });
}


function testWaiting_shouldFailIfConditionReturnsARejectedPromise() {
  var count = 0;
  scheduleWait(function() {
    return webdriver.promise.rejected(new StubError);
  }, 100, 'counting to 3');
  return waitForAbort().then(assertIsStubError);
}


function testWaiting_scheduleWithIntermittentWaits() {
  schedule('a');
  scheduleWait(function() { return true; }, 0, 'wait 1');
  schedule('b');
  scheduleWait(function() { return true; }, 0, 'wait 2');
  schedule('c');
  scheduleWait(function() { return true; }, 0, 'wait 3');

  return waitForIdle().then(function() {
    assertFlowHistory('a', '0: wait 1', 'b', '0: wait 2', 'c', '0: wait 3');
  });
}


function testWaiting_scheduleWithIntermittentAndNestedWaits() {
  schedule('a');
  scheduleWait(function() { return true; }, 0, 'wait 1').
      then(function() {
        schedule('d');
        scheduleWait(function() { return true; }, 0, 'wait 2');
        schedule('e');
      });
  schedule('b');
  scheduleWait(function() { return true; }, 0, 'wait 3');
  schedule('c');
  scheduleWait(function() { return true; }, 0, 'wait 4');

  return waitForIdle().then(function() {
    assertFlowHistory(
        'a', '0: wait 1', 'd', '0: wait 2', 'e', 'b', '0: wait 3', 'c',
        '0: wait 4');
  });
}


function testWait_requiresConditionToBeAPromiseOrFunction() {
  assertThrows(function() {
    flow.wait(1234, 0);
  });
  flow.wait(function() { return true;}, 0);
  flow.wait(webdriver.promise.fulfilled(), 0);
  return waitForIdle();
}


function testWait_promiseThatDoesNotResolveBeforeTimeout() {
  var d = webdriver.promise.defer();
  flow.wait(d.promise, 5).then(fail, function(e) {
    assertRegExp(/Timed out waiting for promise to resolve after \d+ms/,
        e.message);
  });
  return waitForIdle().then(function() {
    assertTrue('Promise should not be cancelled', d.promise.isPending());
  });
}


function testWait_unboundedWaitOnPromiseResolution() {
  var messages = [];
  var d = webdriver.promise.defer();
  var waitResult = flow.wait(d.promise).then(function(value) {
    messages.push('b');
    assertEquals(1234, value);
  });
  setTimeout(function() {
    messages.push('a');
  }, 5);

  webdriver.promise.delayed(10).then(function() {
    assertArrayEquals(['a'], messages);
    assertTrue(waitResult.isPending());
    d.fulfill(1234);
    return waitResult;
  }).then(function(value) {
    assertArrayEquals(['a', 'b'], messages);
  });

  return waitForIdle();
}


function testSubtasks() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    schedule('c');
    schedule('d');
  });
  schedule('b');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'sub-tasks', 'c', 'd', 'b');
  });
}


function testSubtasks_nesting() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    schedule('b');
    scheduleAction('sub-sub-tasks', function() {
      schedule('c');
      schedule('d');
    });
    schedule('e');
  });
  schedule('f');

  return waitForIdle().then(function() {
    assertFlowHistory(
        'a', 'sub-tasks', 'b', 'sub-sub-tasks', 'c', 'd', 'e', 'f');
  });
}


function testSubtasks_taskReturnsSubTaskResult_1() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    return schedule('c');
  });
  schedule('b');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'sub-tasks', 'c', 'b');
  });
}


function testSubtasks_taskReturnsSubTaskResult_2() {
  var callback;
  schedule('a');
  schedule('sub-tasks', webdriver.promise.fulfilled(123)).
      then(callback = callbackHelper(function(value) {
        assertEquals(123, value);
      }));
  schedule('b');

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'sub-tasks','b');
    callback.assertCalled();
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_1() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(10).then(function() {
      schedule('b');
    });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_2() {
  scheduleAction('a', function() {
    return webdriver.promise.fulfilled().then(function() {
      schedule('b');
    });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_3() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(10).then(function() {
      return schedule('b');
    });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_4() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(5).then(function() {
      return webdriver.promise.delayed(5).then(function() {
        return schedule('b');
      });
    });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_5() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(5).then(function() {
      return webdriver.promise.delayed(5).then(function() {
        return webdriver.promise.delayed(5).then(function() {
          return webdriver.promise.delayed(5).then(function() {
            return schedule('b');
          });
        });
      });
    });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}


function testSubtasks_taskReturnsPromiseThatDependsOnSubtask_6() {
  scheduleAction('a', function() {
    return webdriver.promise.delayed(5).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return webdriver.promise.delayed(5) }).
        then(function() { return schedule('b'); });
  });
  schedule('c');
  return waitForIdle().then(function() {
    assertFlowHistory('a', 'b', 'c');
  });
}

function testSubtasks_subTaskFails_1() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    scheduleAction('sub-task that fails', throwStubError);
  });
  schedule('should never execute');

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'sub-tasks', 'sub-task that fails');
      });
}


function testSubtasks_subTaskFails_2() {
  schedule('a');
  scheduleAction('sub-tasks', function() {
    return webdriver.promise.rejected(new StubError);
  });
  schedule('should never execute');

  return waitForAbort().
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('a', 'sub-tasks');
      });
}


function testSubtasks_subTaskFails_3() {
  var callbacks = callbackPair(null, assertIsStubError);

  schedule('a');
  scheduleAction('sub-tasks', function() {
    return webdriver.promise.rejected(new StubError);
  }).then(callbacks.callback, callbacks.errback);
  schedule('b');

  return waitForIdle().
      then(function() {
        assertFlowHistory('a', 'sub-tasks', 'b');
        callbacks.assertErrback();
      });
}


function testEventLoopWaitsOnPendingPromiseRejections_oneRejection() {
  var d = new webdriver.promise.Deferred;
  scheduleAction('one', function() {
    return d.promise;
  });
  scheduleAction('two', goog.nullFunction);

  return timeout(50).then(function() {
    assertFlowHistory('one');
    d.reject(new StubError);
    return waitForAbort();
  }).
  then(assertIsStubError).
  then(function() {
    assertFlowHistory('one');
  });
}


function testEventLoopWaitsOnPendingPromiseRejections_multipleRejections() {
  var once = Error('once');
  var twice = Error('twice');
  var seen = [];

  scheduleAction('one', function() {
    webdriver.promise.rejected(once);
    webdriver.promise.rejected(twice);
  });
  var twoResult = scheduleAction('two', goog.nullFunction);

  flow.removeAllListeners(
      webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  return new goog.Promise(function(fulfill, reject) {
    setTimeout(function() {
      reject(Error('Should have reported the two errors by now: ' + seen));
    }, 500);
    flow.on(
        webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
        function(e) {
          seen.push(e);
          if (seen.length === 2) {
            fulfill();
          }
        });
  }).then(function() {
    seen.sort();
    assertArrayEquals([once, twice], seen);
    assertFlowHistory('one');
    assertFalse('Did not cancel the second task', twoResult.isPending());
  });
}

function testCancelsPromiseReturnedByCallbackIfFrameFails_promiseCallback() {
  var chainPair = callbackPair(null, assertIsStubError);
  var deferredPair = callbackPair(null, function(e) {
    assertEquals('callback result should be cancelled',
        'CancellationError: StubError',
        e.toString());
  });

  var d = new webdriver.promise.Deferred();
  d.then(deferredPair.callback, deferredPair.errback);

  webdriver.promise.fulfilled().
      then(function() {
        scheduleAction('boom', throwStubError);
        schedule('this should not run');
        return d.promise;
      }).
      then(chainPair.callback, chainPair.errback);

  return waitForIdle().then(function() {
    assertFlowHistory('boom');
    chainPair.assertErrback('chain errback not invoked');
    deferredPair.assertErrback('deferred errback not invoked');
  });
}

function testCancelsPromiseReturnedByCallbackIfFrameFails_taskCallback() {
  var chainPair = callbackPair(null, assertIsStubError);
  var deferredPair = callbackPair(null, function(e) {
    assertEquals('callback result should be cancelled',
        'CancellationError: StubError',
        e.toString());
  });

  var d = new webdriver.promise.Deferred();
  d.then(deferredPair.callback, deferredPair.errback);

  schedule('a').
      then(function() {
        scheduleAction('boom', throwStubError);
        schedule('this should not run');
        return d.promise;
      }).
      then(chainPair.callback, chainPair.errback);

  return waitForIdle().then(function() {
    assertFlowHistory('a', 'boom');
    chainPair.assertErrback('chain errback not invoked');
    deferredPair.assertErrback('deferred errback not invoked');
  });
}

function testMaintainsOrderInCallbacksWhenATaskReturnsAPromise() {
  schedule('__start__', webdriver.promise.fulfilled()).
      then(function() {
        webdriver.test.testutil.messages.push('a');
        schedulePush('b');
        webdriver.test.testutil.messages.push('c');
      }).
      then(function() {
        webdriver.test.testutil.messages.push('d');
      });
  schedulePush('e');

  return waitForIdle().then(function() {
    assertFlowHistory('__start__', 'b', 'e');
    webdriver.test.testutil.assertMessages('a', 'c', 'b', 'd', 'e');
  });
}


function assertFlowIs(flow) {
  assertEquals(flow, webdriver.promise.controlFlow());
}

function testOwningFlowIsActivatedForExecutingTasks() {
  var defaultFlow = webdriver.promise.controlFlow();
  var order = [];

  webdriver.promise.createFlow(function(flow) {
    assertFlowIs(flow);
    order.push(0);

    defaultFlow.execute(function() {
      assertFlowIs(defaultFlow);
      order.push(1);
    });
  });

  return waitForIdle().then(function() {
    assertFlowIs(defaultFlow);
    assertArrayEquals([0, 1], order);
  });
}

function testCreateFlowReturnsPromisePairedWithCreatedFlow() {
  return new goog.Promise(function(fulfill, reject) {
    var newFlow;
    webdriver.promise.createFlow(function(flow) {
      newFlow = flow;
      assertFlowIs(newFlow);
    }).then(function() {
      assertFlowIs(newFlow);
      waitForIdle(newFlow).then(fulfill, reject);
    });
  });
}

function testDeferredFactoriesCreateForActiveFlow_defaultFlow() {
  var e = Error();
  var defaultFlow = webdriver.promise.controlFlow();
  webdriver.promise.fulfilled().then(function() {
    assertFlowIs(defaultFlow);
  });
  webdriver.promise.rejected(e).then(null, function(err) {
    assertEquals(e, err);
    assertFlowIs(defaultFlow);
  });
  webdriver.promise.defer().then(function() {
    assertFlowIs(defaultFlow);
  });

  return waitForIdle();
}


function testDeferredFactoriesCreateForActiveFlow_newFlow() {
  var e = Error();
  var newFlow = new webdriver.promise.ControlFlow;
  newFlow.execute(function() {
    webdriver.promise.fulfilled().then(function() {
      assertFlowIs(newFlow);
    });

    webdriver.promise.rejected(e).then(null, function(err) {
      assertEquals(e, err);
      assertFlowIs(newFlow);
    });

    webdriver.promise.defer().then(function() {
      assertFlowIs(newFlow);
    });
  }).then(function() {
    assertFlowIs(newFlow);
  });

  return waitForIdle(newFlow);
}

function testFlowsSynchronizeWithThemselvesNotEachOther() {
  var defaultFlow = webdriver.promise.controlFlow();
  schedulePush('a', 'a');
  webdriver.promise.controlFlow().timeout(250);
  schedulePush('b', 'b');

  webdriver.promise.createFlow(function() {
    schedulePush('c', 'c');
    schedulePush('d', 'd');
  });

  return waitForIdle().then(function() {
    webdriver.test.testutil.assertMessages('a', 'c', 'd', 'b');
  });
}

function testUnhandledErrorsAreReportedToTheOwningFlow() {
  var error1 = Error('e1');
  var error2 = Error('e2');

  var defaultFlow = webdriver.promise.controlFlow();
  defaultFlow.removeAllListeners('uncaughtException');

  var flow1Error = goog.Promise.withResolver();
  flow1Error.promise.then(function(value) {
    assertEquals(error2, value);
  });

  var flow2Error = goog.Promise.withResolver();
  flow2Error.promise.then(function(value) {
    assertEquals(error1, value);
  });

  webdriver.promise.createFlow(function(flow) {
    flow.once('uncaughtException', flow2Error.resolve);
    webdriver.promise.rejected(error1);

    defaultFlow.once('uncaughtException', flow1Error.resolve);
    defaultFlow.execute(function() {
      webdriver.promise.rejected(error2);
    });
  });

  return goog.Promise.all([flow1Error.promise, flow2Error.promise]);
}

function testCanSynchronizeFlowsByReturningPromiseFromOneToAnother() {
  var flow1 = new webdriver.promise.ControlFlow;
  var flow1Done = goog.Promise.withResolver();
  flow1.once('idle', flow1Done.resolve);
  flow1.once('uncaughtException', flow1Done.reject);

  var flow2 = new webdriver.promise.ControlFlow;
  var flow2Done = goog.Promise.withResolver();
  flow2.once('idle', flow2Done.resolve);
  flow2.once('uncaughtException', flow2Done.reject);

  flow1.execute(function() {
    schedulePush('a', 'a');
    return webdriver.promise.delayed(25);
  }, 'start flow 1');

  flow2.execute(function() {
    schedulePush('b', 'b');
    schedulePush('c', 'c');
    flow2.execute(function() {
      return flow1.execute(function() {
        schedulePush('d', 'd');
      }, 'flow 1 task');
    }, 'inject flow1 result into flow2');
    schedulePush('e', 'e');
  }, 'start flow 2');

  return goog.Promise.all([flow1Done.promise, flow2Done.promise]).
      then(function() {
        webdriver.test.testutil.assertMessages('a', 'b', 'c', 'd', 'e');
      });
}

function testFramesWaitToCompleteForPendingRejections() {
  return new goog.Promise(function(fulfill, reject) {

    webdriver.promise.controlFlow().execute(function() {
      webdriver.promise.rejected(new StubError);
    }).then(fulfill, reject);

  }).
  then(goog.partial(fail, 'expected to fail'), assertIsStubError).
  then(waitForIdle);
}

function testSynchronizeErrorsPropagateToOuterFlow() {
  var outerFlow = new webdriver.promise.ControlFlow;
  var innerFlow = new webdriver.promise.ControlFlow;

  var block = goog.Promise.withResolver();
  innerFlow.execute(function() {
    return block.promise;
  }, 'block inner flow');

  outerFlow.execute(function() {
    block.resolve();
    return innerFlow.execute(function() {
      webdriver.promise.rejected(new StubError);
    }, 'trigger unhandled rejection error');
  }, 'run test');

  return goog.Promise.all([
    waitForIdle(innerFlow),
    waitForAbort(outerFlow).then(assertIsStubError)
  ]);
}

function testFailsIfErrbackThrows() {
  webdriver.promise.rejected('').then(null, throwStubError);
  return waitForAbort().then(assertIsStubError);
}

function testFailsIfCallbackReturnsRejectedPromise() {
  webdriver.promise.fulfilled().then(function() {
    return webdriver.promise.rejected(new StubError);
  });
  return waitForAbort().then(assertIsStubError);
}

function testAbortsFrameIfTaskFails() {
  webdriver.promise.fulfilled().then(function() {
    webdriver.promise.controlFlow().execute(throwStubError);
  });
  return waitForAbort().then(assertIsStubError);
}

function testAbortsFramePromisedChainedFromTaskIsNotHandled() {
  webdriver.promise.fulfilled().then(function() {
    webdriver.promise.controlFlow().execute(goog.nullFunction).
        then(throwStubError);
  });
  return waitForAbort().then(assertIsStubError);
}

function testTrapsChainedUnhandledRejectionsWithinAFrame() {
  var pair = callbackPair(null, assertIsStubError);
  webdriver.promise.fulfilled().then(function() {
    webdriver.promise.controlFlow().execute(goog.nullFunction).
        then(throwStubError);
  }).then(pair.callback, pair.errback);

  return waitForIdle().then(pair.assertErrback);
}


function testCancelsRemainingTasksIfFrameThrowsDuringScheduling() {
  var task1, task2;
  var pair = callbackPair(null, assertIsStubError);
  var flow = webdriver.promise.controlFlow();
  flow.execute(function() {
    task1 = flow.execute(goog.nullFunction);
    task2 = flow.execute(goog.nullFunction);
    throw new StubError;
  }).then(pair.callback, pair.errback);

  return waitForIdle().
      then(pair.assertErrback).
      then(function() {
        assertFalse(task1.isPending());
        pair = callbackPair();
        return task1.then(pair.callback, pair.errback);
      }).
      then(function() {
        pair.assertErrback();
        assertFalse(task2.isPending());
        pair = callbackPair();
        return task2.then(pair.callback, pair.errback);
      }).
      then(function() {
        pair.assertErrback();
      });
}

function testCancelsRemainingTasksInFrameIfATaskFails() {
  var task;
  var pair = callbackPair(null, assertIsStubError);
  var flow = webdriver.promise.controlFlow();
  flow.execute(function() {
    flow.execute(throwStubError);
    task = flow.execute(goog.nullFunction);
  }).then(pair.callback, pair.errback);

  return waitForIdle().then(pair.assertErrback).then(function() {
    assertFalse(task.isPending());
    pair = callbackPair();
    task.then(pair.callback, pair.errback);
  }).then(function() {
    pair.assertErrback();
  });
}

function testDoesNotModifyRejectionErrorIfPromiseNotInsideAFlow() {
  var error = Error('original message');
  var originalStack = error.stack;
  var originalStr = error.toString();

  var pair = callbackPair(null, function(e) {
    assertEquals(error, e);
    assertEquals('original message', e.message);
    assertEquals(originalStack, e.stack);
    assertEquals(originalStr, e.toString());
  });

  webdriver.promise.rejected(error).then(pair.callback, pair.errback);
  return waitForIdle().then(pair.assertErrback);
}
