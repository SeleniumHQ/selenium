// Copyright 2015 Software Freedom Conservancy. All Rights Reserved.
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

/**
 * @fileoverview Contains tests against promise error handling. Many tests use
 * goog.Promise to control test termination independent of webdriver.promise
 * (and notably webdriver.promise.ControlFlow).
 */

'use strict';

goog.require('goog.Promise');
goog.require('goog.async.run');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('webdriver.promise');
goog.require('webdriver.test.testutil');



var StubError = webdriver.test.testutil.StubError,
    throwStubError = webdriver.test.testutil.throwStubError,
    assertIsStubError = webdriver.test.testutil.assertIsStubError;


var flow, uncaughtExceptions;


function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  flow = webdriver.promise.controlFlow();
  uncaughtExceptions = [];
  flow.on('uncaughtException', onUncaughtException);
}


function tearDown() {
  return waitForIdle(flow).then(function() {
    assertArrayEquals('There were uncaught exceptions',
        [], uncaughtExceptions);
    flow.reset();
  });
}


function onUncaughtException(e) {
  uncaughtExceptions.push(e);
}


function waitForAbort(opt_flow, opt_n) {
  var n = opt_n || 1;
  var theFlow = opt_flow || flow;
  theFlow.removeAllListeners(
      webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  return new goog.Promise(function(fulfill, reject) {
    theFlow.once('idle', function() {
      reject(Error('expected flow to report an unhandled error'));
    });

    var errors = [];
    theFlow.on('uncaughtException', onError);
    function onError(e) {
      errors.push(e);
      if (errors.length === n) {
        theFlow.removeListener('uncaughtException', onError);
        fulfill(n === 1 ? errors[0] : errors);
      }
    }
  });
}


function waitForIdle(opt_flow) {
  var theFlow = opt_flow || flow;
  return new goog.Promise(function(fulfill, reject) {
    if (!theFlow.activeFrame_ && !theFlow.yieldCount_) {
      fulfill();
      return;
    }
    theFlow.once('idle', fulfill);
    theFlow.once('uncaughtException', reject);
  });
}


function testRejectedPromiseTriggersErrorCallback() {
  return webdriver.promise.rejected(new StubError).
      then(fail, assertIsStubError);
}


function testCallbackThrowsTriggersSubsequentErrorCallback_fulfilledPromise() {
  return webdriver.promise.fulfilled().
      then(throwStubError).
      then(fail, assertIsStubError);
}


function testCallbackThrowsTriggersSubsequentErrorCallback_rejectedPromise() {
  var e = Error('not the droids you are looking for');
  return webdriver.promise.rejected(e).
      then(fail, throwStubError).
      then(fail, assertIsStubError);
}


function
testCallbackReturnsRejectedPromiseTriggersSubsequentErrback_fulfilled() {
  return webdriver.promise.fulfilled().then(function() {
    return webdriver.promise.rejected(new StubError);
  }).then(fail, assertIsStubError);
}


function
testCallbackReturnsRejectedPromiseTriggersSubsequentErrback_rejected() {
  var e = Error('not the droids you are looking for');
  return webdriver.promise.rejected(e).
      then(fail, function() {
        return webdriver.promise.rejected(new StubError);
      }).
      then(fail, assertIsStubError);
}


function testReportsUnhandledRejectionsThroughTheControlFlow() {
  webdriver.promise.rejected(new StubError);
  return waitForAbort().then(assertIsStubError);
}


function testMultipleUnhandledRejectionsOutsideATask_reportedInOrderOccurred() {
  var e1 = Error('error 1');
  var e2 = Error('error 2');

  webdriver.promise.rejected(e1);
  webdriver.promise.rejected(e2);

  return waitForAbort(flow, 2).then(function(errors) {
    assertArrayEquals([e1, e2], errors);
  });
}


function testDoesNotReportUnhandledErrorIfHandlerAddedBeforeNextTick() {
  var promise = webdriver.promise.rejected(new StubError);
  promise.then(fail, assertIsStubError);
  return waitForIdle();
}


function testDoesNotReportUnhandledErrorIfHandlerAddedAsyncBeforeReport() {
  var called = false;
  return new goog.Promise(function(fulfill, reject) {
    var promise;
    goog.async.run(function() {
      promise.then(fail, function(e) {
        called = true;
        assertIsStubError(e);
      });
      waitForIdle().then(fulfill, reject);
    });
    promise = webdriver.promise.rejected(new StubError);
  }).then(function() {
    assertTrue(called);
  })
}


function testTaskThrows() {
  return flow.execute(throwStubError).then(fail, assertIsStubError);
}


function testTaskReturnsRejectedPromise() {
  return flow.execute(function() {
    return webdriver.promise.rejected(new StubError)
  }).then(fail, assertIsStubError);
}


function testTaskHasUnhandledRejection() {
  return flow.execute(function() {
    webdriver.promise.rejected(new StubError)
  }).then(fail, assertIsStubError);
}


function testTaskFails_returnedPromiseIsUnhandled() {
  flow.execute(throwStubError);
  return waitForAbort().then(assertIsStubError);
}


function testSubTaskFails_caughtByParentTask() {
  return flow.execute(function() {
    flow.execute(throwStubError);
  }).then(fail, assertIsStubError);
}


function testSubTaskFails_uncaughtErrorBubblesUpToFlow() {
  flow.execute(function() {
    flow.execute(throwStubError);
  });
  return waitForAbort().then(assertIsStubError);
}


function testNestedTaskFails_returnsUpToParent() {
  return flow.execute(function() {
    return flow.execute(function() {
      return flow.execute(throwStubError);
    });
  }).then(fail, assertIsStubError);
}


function testNestedTaskFails_uncaughtErrorBubblesUp_taskThrows() {
  flow.execute(function() {
    flow.execute(function() {
      flow.execute(throwStubError);
    });
  });
  return waitForAbort().then(assertIsStubError);
}


function testNestedTaskFails_uncaughtErrorBubblesUp_taskThrows_caughtAtRoot() {
  flow.execute(function() {
    flow.execute(function() {
      flow.execute(throwStubError);
    });
  }).then(fail, assertIsStubError);
  return waitForIdle();
}


function testNestedTaskFails_uncaughtErrorBubblesUp_promise() {
  flow.execute(function() {
    flow.execute(function() {
      flow.execute(function() {
        webdriver.promise.rejected(new StubError);
      });
    });
  });
  return waitForAbort().then(assertIsStubError);
}


function testNestedTaskFails_uncaughtErrorBubblesUp_promise_caughtAtRoot() {
  flow.execute(function() {
    flow.execute(function() {
      webdriver.promise.rejected(new StubError);
    });
  }).then(fail, assertIsStubError);
  return waitForIdle();
}


function testNestedTaskFails_mixtureOfHangingAndFreeSubTasks() {
  flow.execute(function() {
    return flow.execute(function() {
      flow.execute(throwStubError);
    });
  });
  return waitForAbort().then(assertIsStubError);
}


function testTaskReturnsPromiseLikeObjectThatInvokesErrback() {
  return flow.execute(function() {
    return {
      'then': function(_, errback) {
        errback('abc123');
      }
    };
  }).then(fail, function(value) {
    assertEquals('abc123', value);
  });
}


function testWaitConditionThrows_waitFailureIsCaught() {
  return flow.wait(throwStubError, 50).then(fail, assertIsStubError);
}


function testWaitConditionThrows_waitFailureIsNotCaught() {
  flow.wait(throwStubError, 50);
  return waitForAbort().then(assertIsStubError);
}


function testWaitConditionReturnsRejectedPromise_waitFailureIsCaught() {
  return flow.wait(function() {
    return webdriver.promise.rejected(new StubError);
  }, 50).then(fail, assertIsStubError);
}


function testWaitConditionReturnsRejectedPromise_waitFailureIsNotCaught() {
  flow.wait(function() {
    return webdriver.promise.rejected(new StubError);
  }, 50);
  return waitForAbort().then(assertIsStubError);
}


function testWaitConditionHasUnhandledPromiseRejection_waitFailureCaught() {
  return flow.wait(function() {
    webdriver.promise.rejected(new StubError);
  }, 50).then(fail, assertIsStubError);
}


function testWaitConditionHasUnhandledPromiseRejection_waitFailureNotCaught() {
  flow.wait(function() {
    webdriver.promise.rejected(new StubError);
  }, 50);
  return waitForAbort().then(assertIsStubError);
}


function testWaitConditionHasSubTaskFailure_caughtByWait() {
  return flow.wait(function() {
    flow.execute(function() {
      flow.execute(throwStubError);
    });
  }, 50).then(fail, assertIsStubError);
}


function testWaitConditionHasSubTaskFailure_notCaughtByWait() {
  flow.wait(function() {
    flow.execute(function() {
      flow.execute(throwStubError);
    });
  }, 50);
  return waitForAbort().then(assertIsStubError);
}


function testErrbackMayThrowANewError_startWithNormalPromise() {
  var error = Error('an error');
  return webdriver.promise.rejected(error).
      thenCatch(function(e) {
        assertEquals(e, error);
        throw new StubError;
      }).
      thenCatch(assertIsStubError);
}


function testErrbackMayThrowANewError_startWithTaskResult() {
  var error = Error('an error');
  return flow.execute(function() {
    throw error;
  }).
  thenCatch(function(e) {
    assertEquals(e, error);
    throw new StubError;
  }).
  thenCatch(assertIsStubError);
}


function testErrbackMayThrowANewError_uncaught_startWithNormalPromise() {
  var error = Error('an error');
  webdriver.promise.rejected(error).
      thenCatch(function(e) {
        assertEquals(e, error);
        throw new StubError;
      });
  return waitForAbort().then(assertIsStubError);
}


function testErrbackMayThrowANewError_uncaught_startWithTaskResult() {
  var error = Error('an error');
  flow.execute(function() {
    throw error;
  }).
  thenCatch(function(e) {
    assertEquals(e, error);
    throw new StubError;
  });
  return waitForAbort().then(assertIsStubError);
}


function testThrownPromiseIsHandledSameAsReturningPromise_promiseIsFulfilled() {
  return webdriver.promise.fulfilled().then(function() {
    throw webdriver.promise.fulfilled(1234);
  }).then(function(value) {
    assertEquals(1234, value);
  });
}


function testThrownPromiseIsHandledSameAsReturningPromise_promiseIsRejected() {
  return webdriver.promise.fulfilled().then(function() {
    throw webdriver.promise.rejected(new StubError);
  }).then(fail, assertIsStubError);
}


function testTaskThrowsPromise_taskSucceedsIfPromiseIsFulfilled() {
  flow.execute(function() {
    throw webdriver.promise.fulfilled(1234);
  }).then(function(value) {
    assertEquals(1234, value);
  });
  return waitForIdle();
}


function testTaskThrowsPromise_taskFailsIfPromiseIsRejected() {
  flow.execute(function() {
    throw webdriver.promise.rejected(new StubError);
  }).then(fail, assertIsStubError);
  return waitForIdle();
}


function testFailsTaskIfThereIsAnUnhandledErrorWhileWaitingOnTaskResult() {
  var d = webdriver.promise.defer();
  flow.execute(function() {
    setTimeout(function() {
      webdriver.promise.rejected(new StubError);
    }, 10);
    return d.promise;
  }).then(fail, assertIsStubError);

  return waitForIdle().then(function() {
    return d.promise;
  }).then(fail, function(e) {
    assertEquals('CancellationError: StubError', e.toString());
  });
}


function testFailsParentTaskIfAsyncScheduledTaskFails() {
  var d = webdriver.promise.defer();
  flow.execute(function() {
    setTimeout(function() {
      flow.execute(throwStubError);
    }, 10);
    return d.promise;
  }).then(fail, assertIsStubError);

  return waitForIdle().then(function() {
    return d.promise;
  }).then(fail, function(e) {
    assertEquals('CancellationError: StubError', e.toString());
  });
}


function testLongStackTraces_alwaysIncludesTaskStacksInFailures() {
  webdriver.promise.LONG_STACK_TRACES = false;
  flow.execute(function() {
    flow.execute(function() {
      flow.execute(throwStubError, 'throw error');
    }, 'two');
  }, 'three').
  then(fail, function(e) {
    assertIsStubError(e);
    if (!goog.isString(e.stack)) {
      return;
    }
    var messages = goog.array.filter(
        webdriver.stacktrace.getStack(e).split(/\n/), function(line, index) {
          return /^From: /.test(line);
        });
    assertArrayEquals([
      'From: Task: throw error',
      'From: Task: two',
      'From: Task: three'
    ], messages);
  });
  return waitForIdle();
}


function testLongStackTraces_doesNotIncludeCompletedTasks() {
  flow.execute(goog.nullFunction, 'succeeds');
  flow.execute(throwStubError, 'kaboom').then(fail, function(e) {
    assertIsStubError(e);
    if (!goog.isString(e.stack)) {
      return;
    }
    var messages = goog.array.filter(
        webdriver.stacktrace.getStack(e).split(/\n/), function(line, index) {
          return /^From: /.test(line);
        });
    assertArrayEquals(['From: Task: kaboom'], messages);
  });
  return waitForIdle();
}


function testLongStackTraces_doesNotIncludePromiseChainWhenDisabled() {
  webdriver.promise.LONG_STACK_TRACES = false;
  flow.execute(function() {
    flow.execute(function() {
      return webdriver.promise.fulfilled().
          then(goog.nullFunction).
          then(goog.nullFunction).
          then(throwStubError);
    }, 'eventually fails');
  }, 'start').
  then(fail, function(e) {
    assertIsStubError(e);
    if (!goog.isString(e.stack)) {
      return;
    }
    var messages = goog.array.filter(
        webdriver.stacktrace.getStack(e).split(/\n/), function(line, index) {
          return /^From: /.test(line);
        });
    assertArrayEquals([
      'From: Task: eventually fails',
      'From: Task: start'
    ], messages);
  });
  return waitForIdle();
}


function testLongStackTraces_includesPromiseChainWhenEnabled() {
  webdriver.promise.LONG_STACK_TRACES = true;
  flow.execute(function() {
    flow.execute(function() {
      return webdriver.promise.fulfilled().
          then(goog.nullFunction).
          then(goog.nullFunction).
          then(throwStubError);
    }, 'eventually fails');
  }, 'start').
  then(fail, function(e) {
    assertIsStubError(e);
    if (!goog.isString(e.stack)) {
      return;
    }
    var messages = goog.array.filter(
        webdriver.stacktrace.getStack(e).split(/\n/), function(line, index) {
          return /^From: /.test(line);
        });
    assertArrayEquals([
      'From: Promise: then',
      'From: Task: eventually fails',
      'From: Task: start'
    ], messages);
  });
  return waitForIdle();
}


function testFrameCancelsRemainingTasks_onUnhandledTaskFailure() {
  var run = false;
  return flow.execute(function() {
    flow.execute(throwStubError);
    flow.execute(function() { run = true; });
  }).then(fail, function(e) {
    assertIsStubError(e);
    assertFalse(run);
  });
}


function testFrameCancelsRemainingTasks_onUnhandledPromiseRejection() {
  var run = false;
  return flow.execute(function() {
    webdriver.promise.rejected(new StubError);
    flow.execute(function() { run = true; });
  }).then(fail, function(e) {
    assertIsStubError(e);
    assertFalse(run);
  });
}


function testRegisteredTaskCallbacksAreDroppedWhenTaskIsCancelled_return() {
  var seen = [];
  return flow.execute(function() {
    flow.execute(throwStubError);

    flow.execute(function() {
      seen.push(1);
    }).then(function() {
      seen.push(2);
    }, function() {
      seen.push(3);
    });
  }).then(fail, function(e) {
    assertIsStubError(e);
    assertArrayEquals([], seen);
  });
}


function testRegisteredTaskCallbacksAreDroppedWhenTaskIsCancelled_withReturn() {
  var seen = [];
  return flow.execute(function() {
    flow.execute(throwStubError);

    return flow.execute(function() {
      seen.push(1);
    }).then(function() {
      seen.push(2);
    }, function() {
      seen.push(3);
    });
  }).then(fail, function(e) {
    assertIsStubError(e);
    assertArrayEquals([], seen);
  });
}


function testTasksWithinQueuedCallbackInAFrameAreDroppedIfFrameAborts() {
  var seen = [];
  return flow.execute(function() {
    flow.execute(throwStubError);
    webdriver.promise.fulfilled().then(function() {
      seen.push(1);

      return flow.execute(function() {
        seen.push(2);
      });

    // This callback depends on the result of a cancelled task, so it will never
    // be invoked.
    }).thenFinally(function() {
      seen.push(3);
    });
  }).then(fail, function(e) {
    assertIsStubError(e);
    assertArrayEquals([1], seen);
  });
}


function testTaskIsCancelledAfterWaitTimeout() {
  var seen = [];
  return flow.execute(function() {
    flow.wait(function() {
      webdriver.promies.delayed(100).then(goog.nullFunction);
    }, 5);

    return flow.execute(function() {
      seen.push(1);
    }).then(function() {
      seen.push(2);
    }, function() {
      seen.push(3);
    });
  }).then(fail, function(e) {
    assertArrayEquals([], seen);
  });
}


function testTaskCallbacksGetCancellationErrorIfRegisteredAfterTaskIsCancelled() {
  var task;
  flow.execute(function() {
    flow.execute(throwStubError);
    task = flow.execute(goog.nullFunction);
  }).then(fail, assertIsStubError);
  return waitForIdle().then(function() {
    return task.then(fail, function(e) {
      assertTrue(e instanceof webdriver.promise.CancellationError);
    });
  });
}
