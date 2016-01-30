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
const fail = assert.fail;
const sinon = require('sinon');

const testutil = require('./testutil');
const promise = require('../../lib/promise');

const NativePromise = Promise;

// Aliases for readability.
const StubError = testutil.StubError;
const assertIsStubError = testutil.assertIsStubError;
const callbackPair = testutil.callbackPair;
const throwStubError = testutil.throwStubError;

describe('promise control flow', function() {
  let flow, flowHistory, messages, uncaughtExceptions;

  beforeEach(function setUp() {
    promise.LONG_STACK_TRACES = false;
    flow = new promise.ControlFlow();
    promise.setDefaultFlow(flow);
    messages = [];
    flowHistory = [];

    uncaughtExceptions = [];
    flow.on(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
            onUncaughtException);
  });

  afterEach(function tearDown() {
    flow.removeAllListeners(
        promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
    assert.deepEqual([], uncaughtExceptions,
        'There were uncaught exceptions');
    flow.reset();
    promise.LONG_STACK_TRACES = false;
  });

  function onUncaughtException(e) {
    uncaughtExceptions.push(e);
  }

  function waitForAbort(opt_flow) {
    var theFlow = opt_flow || flow;
    theFlow.removeAllListeners(
        promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
    return new NativePromise(function(fulfill, reject) {
      theFlow.once(promise.ControlFlow.EventType.IDLE, function() {
        reject(Error('expected flow to report an unhandled error'));
      });
      theFlow.once(
          promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
          fulfill);
    });
  }

  function waitForIdle(opt_flow) {
    var theFlow = opt_flow || flow;
    return new NativePromise(function(fulfill, reject) {
      theFlow.once(promise.ControlFlow.EventType.IDLE, fulfill);
      theFlow.once(
          promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, reject);
    });
  }

  function timeout(ms) {
    return new NativePromise(function(fulfill) {
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
   * @param {promise.Promise=} opt_taskPromise Promise to return from
   *     the task.
   * @return {!promise.Promise} The result.
   */
  function schedulePush(value, opt_taskPromise) {
    return scheduleAction(value, function() {
      messages.push(value);
      return opt_taskPromise;
    });
  }

  /**
   * @param {string} msg Debug message.
   * @param {!Function} actionFn The function.
   * @return {!promise.Promise} The function result.
   */
  function scheduleAction(msg, actionFn) {
    return promise.controlFlow().execute(function() {
      flowHistory.push(msg);
      return actionFn();
    }, msg);
  }

  /**
   * @param {!Function} condition The condition function.
   * @param {number=} opt_timeout The timeout.
   * @param {string=} opt_message Optional message.
   * @return {!promise.Promise} The wait result.
   */
  function scheduleWait(condition, opt_timeout, opt_message) {
    var msg = opt_message || '';
    // It's not possible to hook into when the wait itself is scheduled, so
    // we record each iteration of the wait loop.
    var count = 0;
    return promise.controlFlow().wait(function() {
      flowHistory.push((count++) + ': ' + msg);
      return condition();
    }, opt_timeout, msg);
  }

  function asyncRun(fn, opt_self) {
    NativePromise.resolve().then(() => fn.call(opt_self));
  }

  function assertFlowHistory(var_args) {
    var expected = Array.prototype.slice.call(arguments, 0);
    assert.deepEqual(expected, flowHistory);
  }

  function assertMessages(var_args) {
    var expected = Array.prototype.slice.call(arguments, 0);
    assert.deepEqual(expected, messages);
  }

  function assertingMessages(var_args) {
    var args = Array.prototype.slice.call(arguments, 0);
    return () => assertMessages.apply(null, args);
  }

  function assertFlowIs(flow) {
    assert.equal(flow, promise.controlFlow());
  }

  describe('testScheduling', function() {
    it('aSimpleFunction', function() {
      schedule('go');
      return waitForIdle().then(function() {
        assertFlowHistory('go');
      });
    });

    it('aSimpleFunctionWithANonPromiseReturnValue', function() {
      schedule('go', 123).then(function(value) {
        assert.equal(123, value);
      });
      return waitForIdle().then(function() {
        assertFlowHistory('go');
      });
    });

    it('aSimpleSequence', function() {
      schedule('a');
      schedule('b');
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('invokesCallbacksWhenTaskIsDone', function() {
      var d = new promise.Deferred();
      var called = false;
      var done = schedule('a', d.promise).then(function(value) {
        called = true;
        assert.equal(123, value);
      });
      return timeout(5).then(function() {
        assert.ok(!called);
        d.fulfill(123);
        return done;
      }).
      then(function() {
        assertFlowHistory('a');
      });
    });

    it('blocksUntilPromiseReturnedByTaskIsResolved', function() {
      var done = promise.defer();
      schedulePush('a', done.promise);
      schedulePush('b');
      setTimeout(function() {
        done.fulfill();
        messages.push('c');
      }, 25);
      return waitForIdle().then(assertingMessages('a', 'c', 'b'));
    });

    it('waitsForReturnedPromisesToResolve', function() {
      var d1 = new promise.Deferred();
      var d2 = new promise.Deferred();

      var callback = sinon.spy();
      schedule('a', d1.promise).then(callback);

      return timeout(5).then(function() {
        assert(!callback.called);
        d1.fulfill(d2);
        return timeout(5);
      }).then(function() {
        assert(!callback.called);
        d2.fulfill('fluffy bunny');
        return waitForIdle();
      }).then(function() {
        assert(callback.called);
        assert.equal('fluffy bunny', callback.getCall(0).args[0]);
        assertFlowHistory('a');
      });
    });

    it('executesTasksInAFutureTurnAfterTheyAreScheduled', function() {
      var count = 0;
      function incr() { count++; }

      scheduleAction('', incr);
      assert.equal(0, count);
      return waitForIdle().then(function() {
        assert.equal(1, count);
      });
    });

    it('executesOneTaskPerTurnOfTheEventLoop', function() {
      var order = [];
      function go() {
        order.push(order.length / 2);
        asyncRun(function() {
          order.push('-');
        });
      }

      scheduleAction('', go);
      scheduleAction('', go);
      return waitForIdle().then(function() {
        assert.deepEqual([0, '-', 1, '-'], order);
      })
    });

    it('firstScheduledTaskIsWithinACallback', function() {
      promise.fulfilled().then(function() {
        schedule('a');
        schedule('b');
        schedule('c');
      }).then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
      return waitForIdle();
    });

    it('newTasksAddedWhileWaitingOnTaskReturnedPromise1', function() {
      scheduleAction('a', function() {
        var d = promise.defer();
        setTimeout(function() {
          schedule('c');
          d.fulfill();
        }, 10);
        return d.promise;
      });
      schedule('b');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('newTasksAddedWhileWaitingOnTaskReturnedPromise2', function() {
      scheduleAction('a', function() {
        var d = promise.defer();
        setTimeout(function() {
          schedule('c');
          asyncRun(d.fulfill);
        }, 10);
        return d.promise;
      });
      schedule('b');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'c', 'b');
      });
    });
  });

  describe('testFraming', function() {
    it('callbacksRunInANewFrame', function() {
      schedule('a').then(function() {
        schedule('c');
      });
      schedule('b');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'c', 'b');
      });
    });

    it('lotsOfNesting', function() {
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
    });

    it('callbackReturnsPromiseThatDependsOnATask_1', function() {
      schedule('a').then(function() {
        schedule('b');
        return promise.delayed(5).then(function() {
          return schedule('c');
        });
      });
      schedule('d');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd');
      });
    });

    it('callbackReturnsPromiseThatDependsOnATask_2', function() {
      schedule('a').then(function() {
        schedule('b');
        return promise.delayed(5).
            then(function() { return promise.delayed(5) }).
            then(function() { return promise.delayed(5) }).
            then(function() { return promise.delayed(5) }).
            then(function() { return schedule('c'); });
      });
      schedule('d');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd');
      });
    });

    it('eachCallbackWaitsForAllScheduledTasksToComplete', function() {
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
    });

    it('eachCallbackWaitsForReturnTasksToComplete', function() {
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
    });

    it('callbacksOnAResolvedPromiseInsertIntoTheCurrentFlow', function() {
      promise.fulfilled().then(function() {
        schedule('b');
      });
      schedule('a');

      return waitForIdle().then(function() {
        assertFlowHistory('b', 'a');
      });
    });

    it('callbacksInterruptTheFlowWhenPromiseIsResolved', function() {
      schedule('a').then(function() {
        schedule('c');
      });
      schedule('b');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'c', 'b');
      });
    });

    it('allCallbacksInAFrameAreScheduledWhenPromiseIsResolved', function() {
      var a = schedule('a');
      a.then(function() { schedule('b'); });
      schedule('c');
      a.then(function() { schedule('d'); });
      schedule('e');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd', 'e');
      });
    });

    it('tasksScheduledInInActiveFrameDoNotGetPrecedence', function() {
      var d = promise.fulfilled();
      schedule('a');
      schedule('b');
      d.then(function() { schedule('c'); });

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('tasksScheduledInAFrameGetPrecedence_1', function() {
      var a = schedule('a');
      schedule('b').then(function() {
        a.then(function() {
          schedule('c');
          schedule('d');
        });
        var e = schedule('e');
        a.then(function() {
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
        assertFlowHistory('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j');
      });
    });
  });

  describe('testErrorHandling', function() {
    it('thrownErrorsArePassedToTaskErrback', function() {
      scheduleAction('function that throws', throwStubError).
          then(fail, assertIsStubError);
      return waitForIdle();
    });

    it('thrownErrorsPropagateThroughPromiseChain', function() {
      scheduleAction('function that throws', throwStubError).
          then(fail).
          then(fail, assertIsStubError);
      return waitForIdle();
    });

    it('catchesErrorsFromFailedTasksInAFrame', function() {
      schedule('a').then(function() {
        schedule('b');
        scheduleAction('function that throws', throwStubError);
      }).
      then(fail, assertIsStubError);
      return waitForIdle();
    });

    it('abortsIfOnlyTaskReturnsAnUnhandledRejection', function() {
      scheduleAction('function that returns rejected promise', function() {
        return promise.rejected(new StubError);
      });
      return waitForAbort().then(assertIsStubError);
    });

    it('abortsIfThereIsAnUnhandledRejection', function() {
      promise.rejected(new StubError);
      schedule('this should not run');
      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory(/* none */);
          });
    });

    it('abortsSequenceIfATaskFails', function() {
      schedule('a');
      schedule('b');
      scheduleAction('c', throwStubError);
      schedule('d');  // Should never execute.

      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory('a', 'b', 'c');
          });
    });

    it('abortsFromUnhandledFramedTaskFailures_1', function() {
      schedule('outer task').then(function() {
        scheduleAction('inner task', throwStubError);
      });
      schedule('this should not run');
      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory('outer task', 'inner task');
          });
    });

    it('abortsFromUnhandledFramedTaskFailures_2', function() {
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
    });

    it('abortsWhenErrorBubblesUpFromFullyResolvingAnObject', function() {
      var callback = sinon.spy();

      scheduleAction('', function() {
        var obj = {'foo': promise.rejected(new StubError)};
        return promise.fullyResolved(obj).then(callback);
      });

      return waitForAbort().
          then(assertIsStubError).
          then(() => assert(!callback.called));
    });

    it('abortsWhenErrorBubblesUpFromFullyResolvingAnObject_withCallback', function() {
      var callback1 = sinon.spy();
      var callback2 = sinon.spy();

      scheduleAction('', function() {
        var obj = {'foo': promise.rejected(new StubError)};
        return promise.fullyResolved(obj).then(callback1);
      }).then(callback2);

      return waitForAbort().
          then(assertIsStubError).
          then(() => assert(!callback1.called)).
          then(() => assert(!callback2.called));
    });

    it('canCatchErrorsFromNestedTasks', function() {
      var errback = sinon.spy();
      schedule('a').
          then(function() {
            return scheduleAction('b', throwStubError);
          }).
          thenCatch(errback);
      return waitForIdle().then(function() {
        assert(errback.called);
        assertIsStubError(errback.getCall(0).args[0]);
      });
    });

    it('nestedCommandFailuresCanBeCaughtAndSuppressed', function() {
      var errback = sinon.spy();
      schedule('a').then(function() {
        return schedule('b').then(function() {
          return schedule('c').then(function() {
            throw new StubError;
          });
        });
      }).thenCatch(errback);
      schedule('d');
      return waitForIdle().
          then(function() {
            assert(errback.called);
            assertIsStubError(errback.getCall(0).args[0]);
            assertFlowHistory('a', 'b', 'c', 'd');
          });
    });

    it('aTaskWithAnUnhandledPromiseRejection', function() {
      schedule('a');
      scheduleAction('sub-tasks', function() {
        promise.rejected(new StubError);
      });
      schedule('should never run');

      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory('a', 'sub-tasks');
          });
    });

    it('aTaskThatReutrnsARejectedPromise', function() {
      schedule('a');
      scheduleAction('sub-tasks', function() {
        return promise.rejected(new StubError);
      });
      schedule('should never run');

      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory('a', 'sub-tasks');
          });
    });

    it('discardsSubtasksIfTaskThrows', function() {
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
    });

    it('discardsRemainingSubtasksIfASubtaskFails', function() {
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
    });
  });

  describe('testTryModelingFinally', function() {
    it('happyPath', function() {
      /* Model:
         try {
           doFoo();
           doBar();
         } finally {
           doBaz();
         }
       */
      schedulePush('foo').
          then(() => schedulePush('bar')).
          thenFinally(() => schedulePush('baz'));
      return waitForIdle().then(assertingMessages('foo', 'bar', 'baz'));
    });

    it('firstTryFails', function() {
      /* Model:
         try {
           doFoo();
           doBar();
         } finally {
           doBaz();
         }
       */

      scheduleAction('doFoo and throw', function() {
        messages.push('foo');
        throw new StubError;
      }).
      then(function() { schedulePush('bar'); }).
      thenFinally(function() { schedulePush('baz'); });

      return waitForAbort().
          then(assertIsStubError).
          then(assertingMessages('foo', 'baz'));
    });

    it('secondTryFails', function() {
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
              messages.push('bar');
              throw new StubError;
            });
          }).
          thenFinally(function() {
            return schedulePush('baz');
          });
      return waitForAbort().
          then(assertIsStubError).
          then(assertingMessages('foo', 'bar', 'baz'));
    });
  });

  describe('testTaskCallbacksInterruptFlow', function() {
    it('(base case)', function() {
      schedule('a').then(function() {
        schedule('b');
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskDependsOnImmediatelyFulfilledPromise', function() {
      scheduleAction('a', function() {
        return promise.fulfilled();
      }).then(function() {
        schedule('b');
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskDependsOnPreviouslyFulfilledPromise', function() {
      var aPromise = promise.fulfilled(123);
      scheduleAction('a', function() {
        return aPromise;
      }).then(function(value) {
        assert.equal(123, value);
        schedule('b');
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskDependsOnAsyncPromise', function() {
      scheduleAction('a', function() {
        return promise.delayed(25);
      }).then(function() {
        schedule('b');
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('promiseChainedToTaskInterruptFlow', function() {
      schedule('a').then(function() {
        return promise.fulfilled();
      }).then(function() {
        return promise.fulfilled();
      }).then(function() {
        schedule('b');
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('nestedTaskCallbacksInterruptFlowWhenResolved', function() {
      schedule('a').then(function() {
        schedule('b').then(function() {
          schedule('c');
        });
      });
      schedule('d');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd');
      });
    });
  });

  describe('testDelayedNesting', function() {

    it('1', function() {
      var a = schedule('a');
      schedule('b').then(function() {
        a.then(function() { schedule('c'); });
        schedule('d');
      });
      schedule('e');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd', 'e');
      });
    });

    it('2', function() {
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
    });

    it('3', function() {
      var a = schedule('a');
      schedule('b').then(function() {
        a.then(function() { schedule('c'); });
        a.then(function() { schedule('d'); });
      });
      schedule('e');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c', 'd', 'e');
      });
    });

    it('4', function() {
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
    });

    it('5', function() {
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
    });
  });

  describe('testWaiting', function() {
    it('onAConditionThatIsAlwaysTrue', function() {
      scheduleWait(function() { return true;}, 0, 'waiting on true');
      return waitForIdle().then(function() {
        assertFlowHistory('0: waiting on true');
      });
    });

    it('aSimpleCountingCondition', function() {
      var count = 0;
      scheduleWait(function() {
        return ++count == 3;
      }, 100, 'counting to 3');

      return waitForIdle().then(function() {
        assert.equal(3, count);
      });
    });

    it('aConditionThatReturnsAPromise', function() {
      var d = new promise.Deferred();
      var count = 0;

      scheduleWait(function() {
        count += 1;
        return d.promise;
      }, 0, 'waiting for promise');

      return timeout(50).then(function() {
        assert.equal(1, count);
        d.fulfill(123);
        return waitForIdle();
      });
    });

    it('aConditionThatReturnsAPromise_2', function() {
      var count = 0;
      scheduleWait(function() {
        return promise.fulfilled(++count == 3);
      }, 100, 'waiting for promise');

      return waitForIdle().then(function() {
        assert.equal(3, count);
      });
    });

    it('aConditionThatReturnsATaskResult', function() {
      var count = 0;
      scheduleWait(function() {
        return scheduleAction('increment count', function() {
          return ++count == 3;
        });
      }, 100, 'counting to 3');
      schedule('post wait');

      return waitForIdle().then(function() {
        assert.equal(3, count);
        assertFlowHistory(
            '0: counting to 3', 'increment count',
            '1: counting to 3', 'increment count',
            '2: counting to 3', 'increment count',
            'post wait');
      });
    });

    it('conditionContainsASubtask', function() {
      var count = 0;
      scheduleWait(function() {
        schedule('sub task');
        return ++count == 3;
      }, 100, 'counting to 3');
      schedule('post wait');

      return waitForIdle().then(function() {
        assert.equal(3, count);
        assertFlowHistory(
            '0: counting to 3', 'sub task',
            '1: counting to 3', 'sub task',
            '2: counting to 3', 'sub task',
            'post wait');
      });
    });

    it('cancelsWaitIfScheduledTaskFails', function() {
      var pair = callbackPair(null, assertIsStubError);
      scheduleWait(function() {
        scheduleAction('boom', throwStubError);
        schedule('this should not run');
        return true;
      }, 100, 'waiting to go boom').then(pair.callback, pair.errback);
      schedule('post wait');

      return waitForIdle().
          then(pair.assertErrback).
          then(function() {
            assertFlowHistory(
                '0: waiting to go boom', 'boom',
                'post wait');
          });
    });

    it('failsIfConditionThrows', function() {
      var callbacks = callbackPair(null, assertIsStubError);
      scheduleWait(throwStubError, 0, 'goes boom').
          then(callbacks.callback, callbacks.errback);
      schedule('post wait');

      return waitForIdle().
          then(callbacks.assertErrback).
          then(function() {
            assertFlowHistory('0: goes boom', 'post wait');
          });
    });

    it('failsIfConditionReturnsARejectedPromise', function() {
      var callbacks = callbackPair(null, assertIsStubError);
      scheduleWait(function() {
        return promise.rejected(new StubError);
      }, 0, 'goes boom').then(callbacks.callback, callbacks.errback);
      schedule('post wait');

      return waitForIdle().
          then(callbacks.assertErrback).
          then(function() {
            assertFlowHistory('0: goes boom', 'post wait');
          });
    });

    it('failsIfConditionHasUnhandledRejection', function() {
      var callbacks = callbackPair(null, assertIsStubError);
      scheduleWait(function() {
        promise.controlFlow().execute(throwStubError);
      }, 0, 'goes boom').then(callbacks.callback, callbacks.errback);
      schedule('post wait');

      return waitForIdle().
          then(callbacks.assertErrback).
          then(function() {
            assertFlowHistory('0: goes boom', 'post wait');
          });
    });

    it('failsIfConditionHasAFailedSubtask', function() {
      var callbacks = callbackPair(null, assertIsStubError);
      var count = 0;
      scheduleWait(function() {
        scheduleAction('maybe throw', function() {
          if (++count == 2) {
            throw new StubError;
          }
        });
      }, 100, 'waiting').then(callbacks.callback, callbacks.errback);
      schedule('post wait');

      return waitForIdle().then(function() {
        assert.equal(2, count);
        assertFlowHistory(
            '0: waiting', 'maybe throw',
            '1: waiting', 'maybe throw',
            'post wait');
      });
    });

    it('pollingLoopWaitsForAllScheduledTasksInCondition', function() {
      var count = 0;
      scheduleWait(function() {
        scheduleAction('increment count', function() { ++count; });
        return count >= 3;
      }, 100, 'counting to 3');
      schedule('post wait');

      return waitForIdle().then(function() {
        assert.equal(4, count);
        assertFlowHistory(
            '0: counting to 3', 'increment count',
            '1: counting to 3', 'increment count',
            '2: counting to 3', 'increment count',
            '3: counting to 3', 'increment count',
            'post wait');
      });
    });

    it('waitsForeverOnAZeroTimeout', function() {
      var done = false;
      setTimeout(function() {
        done = true;
      }, 150);
      var waitResult = scheduleWait(function() {
        return done;
      }, 0);

      return timeout(75).then(function() {
        assert.ok(!done);
        return timeout(100);
      }).then(function() {
        assert.ok(done);
        return waitResult;
      });
    });

    it('waitsForeverIfTimeoutOmitted', function() {
      var done = false;
      setTimeout(function() {
        done = true;
      }, 150);
      var waitResult = scheduleWait(function() {
        return done;
      });

      return timeout(75).then(function() {
        assert.ok(!done);
        return timeout(100);
      }).then(function() {
        assert.ok(done);
        return waitResult;
      });
    });

    it('timesOut_nonZeroTimeout', function() {
      var count = 0;
      scheduleWait(function() {
        count += 1;
        var ms = count === 2 ? 65 : 5;
        return promise.delayed(ms).then(function() {
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
        assert.ok(
            /^counting to 3\nWait timed out after \d+ms$/.test(e.message));
      });
    });

    it('shouldFailIfConditionReturnsARejectedPromise', function() {
      scheduleWait(function() {
        return promise.rejected(new StubError);
      }, 100, 'returns rejected promise on first pass');
      return waitForAbort().then(assertIsStubError);
    });

    it('scheduleWithIntermittentWaits', function() {
      schedule('a');
      scheduleWait(function() { return true; }, 0, 'wait 1');
      schedule('b');
      scheduleWait(function() { return true; }, 0, 'wait 2');
      schedule('c');
      scheduleWait(function() { return true; }, 0, 'wait 3');

      return waitForIdle().then(function() {
        assertFlowHistory('a', '0: wait 1', 'b', '0: wait 2', 'c', '0: wait 3');
      });
    });

    it('scheduleWithIntermittentAndNestedWaits', function() {
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
    });

    it('requiresConditionToBeAPromiseOrFunction', function() {
      assert.throws(function() {
        flow.wait(1234, 0);
      });
      flow.wait(function() { return true;}, 0);
      flow.wait(promise.fulfilled(), 0);
      return waitForIdle();
    });

    it('promiseThatDoesNotResolveBeforeTimeout', function() {
      var d = promise.defer();
      flow.wait(d.promise, 5).then(fail, function(e) {
        assert.ok(
            /Timed out waiting for promise to resolve after \d+ms/
                .test(e.message),
            'unexpected error message: ' + e.message);
      });
      return waitForIdle().then(function() {
        assert.ok('Promise should not be cancelled', d.promise.isPending());
      });
    });

    it('unboundedWaitOnPromiseResolution', function() {
      var messages = [];
      var d = promise.defer();
      var waitResult = flow.wait(d.promise).then(function(value) {
        messages.push('b');
        assert.equal(1234, value);
      });
      setTimeout(function() {
        messages.push('a');
      }, 5);

      timeout(10).then(function() {
        assert.deepEqual(['a'], messages);
        assert.ok(waitResult.isPending());
        d.fulfill(1234);
        return waitResult;
      }).then(function() {
        assert.deepEqual(['a', 'b'], messages);
      });

      return waitForIdle();
    });
  });

  describe('testSubtasks', function() {
    it('(base case)', function() {
      schedule('a');
      scheduleAction('sub-tasks', function() {
        schedule('c');
        schedule('d');
      });
      schedule('b');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'sub-tasks', 'c', 'd', 'b');
      });
    });

    it('nesting', function() {
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
    });

    it('taskReturnsSubTaskResult_1', function() {
      schedule('a');
      scheduleAction('sub-tasks', function() {
        return schedule('c');
      });
      schedule('b');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'sub-tasks', 'c', 'b');
      });
    });

    it('taskReturnsSubTaskResult_2', function() {
      let pair = callbackPair((value) => assert.equal(123, value));
      schedule('a');
      schedule('sub-tasks', promise.fulfilled(123)).then(pair.callback);
      schedule('b');

      return waitForIdle().then(function() {
        assertFlowHistory('a', 'sub-tasks','b');
        pair.assertCallback();
      });
    });

    it('taskReturnsPromiseThatDependsOnSubtask_1', function() {
      scheduleAction('a', function() {
        return promise.delayed(10).then(function() {
          schedule('b');
        });
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskReturnsPromiseThatDependsOnSubtask_2', function() {
      scheduleAction('a', function() {
        return promise.fulfilled().then(function() {
          schedule('b');
        });
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskReturnsPromiseThatDependsOnSubtask_3', function() {
      scheduleAction('a', function() {
        return promise.delayed(10).then(function() {
          return schedule('b');
        });
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskReturnsPromiseThatDependsOnSubtask_4', function() {
      scheduleAction('a', function() {
        return promise.delayed(5).then(function() {
          return promise.delayed(5).then(function() {
            return schedule('b');
          });
        });
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('taskReturnsPromiseThatDependsOnSubtask_5', function() {
      scheduleAction('a', function() {
        return promise.delayed(5).then(function() {
          return promise.delayed(5).then(function() {
            return promise.delayed(5).then(function() {
              return promise.delayed(5).then(function() {
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
    });

    it('taskReturnsPromiseThatDependsOnSubtask_6', function() {
      scheduleAction('a', function() {
        return promise.delayed(5).
            then(function() { return promise.delayed(5) }).
            then(function() { return promise.delayed(5) }).
            then(function() { return promise.delayed(5) }).
            then(function() { return schedule('b'); });
      });
      schedule('c');
      return waitForIdle().then(function() {
        assertFlowHistory('a', 'b', 'c');
      });
    });

    it('subTaskFails_1', function() {
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
    });

    it('subTaskFails_2', function() {
      schedule('a');
      scheduleAction('sub-tasks', function() {
        return promise.rejected(new StubError);
      });
      schedule('should never execute');

      return waitForAbort().
          then(assertIsStubError).
          then(function() {
            assertFlowHistory('a', 'sub-tasks');
          });
    });

    it('subTaskFails_3', function() {
      var callbacks = callbackPair(null, assertIsStubError);

      schedule('a');
      scheduleAction('sub-tasks', function() {
        return promise.rejected(new StubError);
      }).then(callbacks.callback, callbacks.errback);
      schedule('b');

      return waitForIdle().
          then(function() {
            assertFlowHistory('a', 'sub-tasks', 'b');
            callbacks.assertErrback();
          });
    });
  });

  describe('testEventLoopWaitsOnPendingPromiseRejections', function() {
    it('oneRejection', function() {
      var d = new promise.Deferred;
      scheduleAction('one', function() {
        return d.promise;
      });
      scheduleAction('two', function() {});

      return timeout(50).then(function() {
        assertFlowHistory('one');
        d.reject(new StubError);
        return waitForAbort();
      }).
      then(assertIsStubError).
      then(function() {
        assertFlowHistory('one');
      });
    });

    it('multipleRejections', function() {
      var once = Error('once');
      var twice = Error('twice');

      scheduleAction('one', function() {
        promise.rejected(once);
        promise.rejected(twice);
      });
      var twoResult = scheduleAction('two', function() {});

      flow.removeAllListeners(
          promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
      return new NativePromise(function(fulfill, reject) {
        setTimeout(function() {
          reject(Error('Should have reported the two errors by now'));
        }, 50);
        flow.on(
            promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
            fulfill);
      }).then(function(e) {
        assert.ok(e instanceof promise.MultipleUnhandledRejectionError,
            'Not a MultipleUnhandledRejectionError');
        let errors = Array.from(e.errors);
        assert.deepEqual([once, twice], errors);
        assertFlowHistory('one');
        assert.ok(!twoResult.isPending(), 'Did not cancel the second task');
      });
    });
  });

  describe('testCancelsPromiseReturnedByCallbackIfFrameFails', function() {
    it('promiseCallback', function() {
      var chainPair = callbackPair(null, assertIsStubError);
      var deferredPair = callbackPair(null, function(e) {
        assert.equal('CancellationError: StubError', e.toString(),
            'callback result should be cancelled');
      });

      var d = new promise.Deferred();
      d.then(deferredPair.callback, deferredPair.errback);

      promise.fulfilled().
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
    });

    it('taskCallback', function() {
      var chainPair = callbackPair(null, assertIsStubError);
      var deferredPair = callbackPair(null, function(e) {
        assert.equal('CancellationError: StubError', e.toString(),
            'callback result should be cancelled');
      });

      var d = new promise.Deferred();
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
    });
  });

  it('testMaintainsOrderInCallbacksWhenATaskReturnsAPromise', function() {
    schedule('__start__', promise.fulfilled()).
        then(function() {
          messages.push('a');
          schedulePush('b');
          messages.push('c');
        }).
        then(function() {
          messages.push('d');
        });
    schedulePush('e');

    return waitForIdle().then(function() {
      assertFlowHistory('__start__', 'b', 'e');
      assertMessages('a', 'c', 'b', 'd', 'e');
    });
  });

  it('testOwningFlowIsActivatedForExecutingTasks', function() {
    var defaultFlow = promise.controlFlow();
    var order = [];

    promise.createFlow(function(flow) {
      assertFlowIs(flow);
      order.push(0);

      defaultFlow.execute(function() {
        assertFlowIs(defaultFlow);
        order.push(1);
      });
    });

    return waitForIdle().then(function() {
      assertFlowIs(defaultFlow);
      assert.deepEqual([0, 1], order);
    });
  });

  it('testCreateFlowReturnsPromisePairedWithCreatedFlow', function() {
    return new NativePromise(function(fulfill, reject) {
      var newFlow;
      promise.createFlow(function(flow) {
        newFlow = flow;
        assertFlowIs(newFlow);
      }).then(function() {
        assertFlowIs(newFlow);
        waitForIdle(newFlow).then(fulfill, reject);
      });
    });
  });

  it('testDeferredFactoriesCreateForActiveFlow_defaultFlow', function() {
    var e = Error();
    var defaultFlow = promise.controlFlow();
    promise.fulfilled().then(function() {
      assertFlowIs(defaultFlow);
    });
    promise.rejected(e).then(null, function(err) {
      assert.equal(e, err);
      assertFlowIs(defaultFlow);
    });
    promise.defer().then(function() {
      assertFlowIs(defaultFlow);
    });

    return waitForIdle();
  });

  it('testDeferredFactoriesCreateForActiveFlow_newFlow', function() {
    var e = Error();
    var newFlow = new promise.ControlFlow;
    newFlow.execute(function() {
      promise.fulfilled().then(function() {
        assertFlowIs(newFlow);
      });

      promise.rejected(e).then(null, function(err) {
        assert.equal(e, err);
        assertFlowIs(newFlow);
      });

      promise.defer().then(function() {
        assertFlowIs(newFlow);
      });
    }).then(function() {
      assertFlowIs(newFlow);
    });

    return waitForIdle(newFlow);
  });

  it('testFlowsSynchronizeWithThemselvesNotEachOther', function() {
    var defaultFlow = promise.controlFlow();
    schedulePush('a', 'a');
    promise.controlFlow().timeout(250);
    schedulePush('b', 'b');

    promise.createFlow(function() {
      schedulePush('c', 'c');
      schedulePush('d', 'd');
    });

    return waitForIdle().then(function() {
      assertMessages('a', 'c', 'd', 'b');
    });
  });

  it('testUnhandledErrorsAreReportedToTheOwningFlow', function() {
    var error1 = Error('e1');
    var error2 = Error('e2');

    var defaultFlow = promise.controlFlow();
    defaultFlow.removeAllListeners('uncaughtException');

    var flow1Error = NativePromise.defer();
    flow1Error.promise.then(function(value) {
      assert.equal(error2, value);
    });

    var flow2Error = NativePromise.defer();
    flow2Error.promise.then(function(value) {
      assert.equal(error1, value);
    });

    promise.createFlow(function(flow) {
      flow.once('uncaughtException', flow2Error.resolve);
      promise.rejected(error1);

      defaultFlow.once('uncaughtException', flow1Error.resolve);
      defaultFlow.execute(function() {
        promise.rejected(error2);
      });
    });

    return NativePromise.all([flow1Error.promise, flow2Error.promise]);
  });

  it('testCanSynchronizeFlowsByReturningPromiseFromOneToAnother', function() {
    var flow1 = new promise.ControlFlow;
    var flow1Done = NativePromise.defer();
    flow1.once('idle', flow1Done.resolve);
    flow1.once('uncaughtException', flow1Done.reject);

    var flow2 = new promise.ControlFlow;
    var flow2Done = NativePromise.defer();
    flow2.once('idle', flow2Done.resolve);
    flow2.once('uncaughtException', flow2Done.reject);

    flow1.execute(function() {
      schedulePush('a', 'a');
      return promise.delayed(25);
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

    return NativePromise.all([flow1Done.promise, flow2Done.promise]).
        then(function() {
          assertMessages('a', 'b', 'c', 'd', 'e');
        });
  });

  it('testFramesWaitToCompleteForPendingRejections', function() {
    return new NativePromise(function(fulfill, reject) {

      promise.controlFlow().execute(function() {
        promise.rejected(new StubError);
      }).then(fulfill, reject);

    }).
    then(() => fail('expected to fail'), assertIsStubError);
  });

  it('testSynchronizeErrorsPropagateToOuterFlow', function() {
    var outerFlow = new promise.ControlFlow;
    var innerFlow = new promise.ControlFlow;

    var block = NativePromise.defer();
    innerFlow.execute(function() {
      return block.promise;
    }, 'block inner flow');

    outerFlow.execute(function() {
      block.resolve();
      return innerFlow.execute(function() {
        promise.rejected(new StubError);
      }, 'trigger unhandled rejection error');
    }, 'run test');

    return NativePromise.all([
      waitForIdle(innerFlow),
      waitForAbort(outerFlow).then(assertIsStubError)
    ]);
  });

  it('testFailsIfErrbackThrows', function() {
    promise.rejected('').then(null, throwStubError);
    return waitForAbort().then(assertIsStubError);
  });

  it('testFailsIfCallbackReturnsRejectedPromise', function() {
    promise.fulfilled().then(function() {
      return promise.rejected(new StubError);
    });
    return waitForAbort().then(assertIsStubError);
  });

  it('testAbortsFrameIfTaskFails', function() {
    promise.fulfilled().then(function() {
      promise.controlFlow().execute(throwStubError);
    });
    return waitForAbort().then(assertIsStubError);
  });

  it('testAbortsFramePromisedChainedFromTaskIsNotHandled', function() {
    promise.fulfilled().then(function() {
      promise.controlFlow().execute(function() {}).
          then(throwStubError);
    });
    return waitForAbort().then(assertIsStubError);
  });

  it('testTrapsChainedUnhandledRejectionsWithinAFrame', function() {
    var pair = callbackPair(null, assertIsStubError);
    promise.fulfilled().then(function() {
      promise.controlFlow().execute(function() {}).
          then(throwStubError);
    }).then(pair.callback, pair.errback);

    return waitForIdle().then(pair.assertErrback);
  });

  it('testCancelsRemainingTasksIfFrameThrowsDuringScheduling', function() {
    var task1, task2;
    var pair = callbackPair(null, assertIsStubError);
    var flow = promise.controlFlow();
    flow.execute(function() {
      task1 = flow.execute(function() {});
      task2 = flow.execute(function() {});
      throw new StubError;
    }).then(pair.callback, pair.errback);

    return waitForIdle().
        then(pair.assertErrback).
        then(function() {
          assert.ok(!task1.isPending());
          pair = callbackPair();
          return task1.then(pair.callback, pair.errback);
        }).
        then(function() {
          pair.assertErrback();
          assert.ok(!task2.isPending());
          pair = callbackPair();
          return task2.then(pair.callback, pair.errback);
        }).
        then(function() {
          pair.assertErrback();
        });
  });

  it('testCancelsRemainingTasksInFrameIfATaskFails', function() {
    var task;
    var pair = callbackPair(null, assertIsStubError);
    var flow = promise.controlFlow();
    flow.execute(function() {
      flow.execute(throwStubError);
      task = flow.execute(function() {});
    }).then(pair.callback, pair.errback);

    return waitForIdle().then(pair.assertErrback).then(function() {
      assert.ok(!task.isPending());
      pair = callbackPair();
      task.then(pair.callback, pair.errback);
    }).then(function() {
      pair.assertErrback();
    });
  });

  it('testDoesNotModifyRejectionErrorIfPromiseNotInsideAFlow', function() {
    var error = Error('original message');
    var originalStack = error.stack;
    var originalStr = error.toString();

    var pair = callbackPair(null, function(e) {
      assert.equal(error, e);
      assert.equal('original message', e.message);
      assert.equal(originalStack, e.stack);
      assert.equal(originalStr, e.toString());
    });

    promise.rejected(error).then(pair.callback, pair.errback);
    return waitForIdle().then(pair.assertErrback);
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/444 */
  it('testMaintainsOrderWithPromiseChainsCreatedWithinAForeach_1', function() {
    var messages = [];
    flow.execute(function() {
      return promise.fulfilled(['a', 'b', 'c', 'd']);
    }, 'start').then(function(steps) {
      steps.forEach(function(step) {
        promise.fulfilled(step)
        .then(function() {
          messages.push(step + '.1');
        }).then(function() {
          messages.push(step + '.2');
        });
      })
    });
    return waitForIdle().then(function() {
      assert.deepEqual(
          ['a.1', 'a.2', 'b.1', 'b.2', 'c.1', 'c.2', 'd.1', 'd.2'],
          messages);
    });
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/444 */
  it('testMaintainsOrderWithPromiseChainsCreatedWithinAForeach_2', function() {
    var messages = [];
    flow.execute(function() {
      return promise.fulfilled(['a', 'b', 'c', 'd']);
    }, 'start').then(function(steps) {
      steps.forEach(function(step) {
        promise.fulfilled(step)
        .then(function() {
          messages.push(step + '.1');
        }).then(function() {
          flow.execute(function() {}, step + '.2').then(function() {
            messages.push(step + '.2');
          });
        });
      })
    });
    return waitForIdle().then(function() {
      assert.deepEqual(
          ['a.1', 'a.2', 'b.1', 'b.2', 'c.1', 'c.2', 'd.1', 'd.2'],
          messages);
    });
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/444 */
  it('testMaintainsOrderWithPromiseChainsCreatedWithinAForeach_3', function() {
    var messages = [];
    flow.execute(function() {
      return promise.fulfilled(['a', 'b', 'c', 'd']);
    }, 'start').then(function(steps) {
      steps.forEach(function(step) {
        promise.fulfilled(step)
        .then(function(){})
        .then(function() {
          messages.push(step + '.1');
          return flow.execute(function() {}, step + '.1');
        }).then(function() {
          flow.execute(function() {}, step + '.2').then(function(text) {
            messages.push(step + '.2');
          });
        });
      })
    });
    return waitForIdle().then(function() {
      assert.deepEqual(
          ['a.1', 'a.2', 'b.1', 'b.2', 'c.1', 'c.2', 'd.1', 'd.2'],
          messages);
    });
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/363 */
  it('testTasksScheduledInASeparateTurnOfTheEventLoopGetASeparateTaskQueue_2', function() {
    scheduleAction('a', () => promise.delayed(10));
    schedule('b');
    setTimeout(() => schedule('c'), 0);

    return waitForIdle().then(function() {
      assertFlowHistory('a', 'c', 'b');
    });
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/363 */
  it('testTasksScheduledInASeparateTurnOfTheEventLoopGetASeparateTaskQueue_2', function() {
    scheduleAction('a', () => promise.delayed(10));
    schedule('b');
    schedule('c');
    setTimeout(function() {
      schedule('d');
      scheduleAction('e', () => promise.delayed(10));
      schedule('f');
    }, 0);

    return waitForIdle().then(function() {
      assertFlowHistory('a', 'd', 'e', 'b', 'c', 'f');
    });
  });

  /** See https://github.com/SeleniumHQ/selenium/issues/363 */
  it('testCanSynchronizeTasksFromAdjacentTaskQueues', function() {
    var task1 = scheduleAction('a', () => promise.delayed(10));
    schedule('b');
    setTimeout(function() {
      scheduleAction('c', () => task1);
      schedule('d');
    }, 0);

    return waitForIdle().then(function() {
      assertFlowHistory('a', 'c', 'd', 'b');
    });
  });

  describe('testCancellingAScheduledTask', function() {
    it('1', function() {
      var called = false;
      var task1 = scheduleAction('a', () => called = true);
      task1.cancel('no soup for you');

      return waitForIdle().then(function() {
        assert.ok(!called);
        assertFlowHistory();
        return task1.thenCatch(function(e) {
          assert.ok(e instanceof promise.CancellationError);
          assert.equal('no soup for you', e.message);
        });
      });
    });

    it('2', function() {
      schedule('a');
      var called = false;
      var task2 = scheduleAction('b', () => called = true);
      schedule('c');

      task2.cancel('no soup for you');

      return waitForIdle().then(function() {
        assert.ok(!called);
        assertFlowHistory('a', 'c');
        return task2.thenCatch(function(e) {
          assert.ok(e instanceof promise.CancellationError);
          assert.equal('no soup for you', e.message);
        });
      });
    });

    it('3', function() {
      var called = false;
      var task = scheduleAction('a', () => called = true);
      task.cancel(new StubError);

      return waitForIdle().then(function() {
        assert.ok(!called);
        assertFlowHistory();
        return task.thenCatch(function(e) {
          assert.ok(e instanceof promise.CancellationError);
        });
      });
    });

    it('4', function() {
      var seen = [];
      var task = scheduleAction('a', () => seen.push(1))
          .then(() => seen.push(2))
          .then(() => seen.push(3))
          .then(() => seen.push(4))
          .then(() => seen.push(5));
      task.cancel(new StubError);

      return waitForIdle().then(function() {
        assert.deepEqual([], seen);
        assertFlowHistory();
        return task.thenCatch(function(e) {
          assert.ok(e instanceof promise.CancellationError);
        });
      });
    });

    it('fromWithinAnExecutingTask', function() {
      var called = false;
      var task;
      scheduleAction('a', function() {
        task.cancel('no soup for you');
      });
      task = scheduleAction('b', () => called = true);
      schedule('c');

      return waitForIdle().then(function() {
        assert.ok(!called);
        assertFlowHistory('a', 'c');
        return task.thenCatch(function(e) {
          assert.ok(e instanceof promise.CancellationError);
          assert.equal('no soup for you', e.message);
        });
      });
    });
  });

  it('testCancellingAPendingTask', function() {
    var order = [];
    var unresolved = promise.defer();

    var innerTask;
    var outerTask = scheduleAction('a', function() {
      order.push(1);

      // Schedule a task that will never finish.
      innerTask = scheduleAction('a.1', function() {
        return unresolved.promise;
      });

      // Since the outerTask is cancelled below, innerTask should be cancelled
      // with a DiscardedTaskError, which means its callbacks are silently
      // dropped - so this should never execute.
      innerTask.thenCatch(function(e) {
        order.push(2);
      });
    });
    schedule('b');

    outerTask.thenCatch(function(e) {
      order.push(3);
      assert.ok(e instanceof promise.CancellationError);
      assert.equal('no soup for you', e.message);
    });

    unresolved.promise.thenCatch(function(e) {
      order.push(4);
      assert.ok(e instanceof promise.CancellationError);
    });

    return timeout(10).then(function() {
      assert.deepEqual([1], order);
      assert.ok(unresolved.promise.isPending());

      outerTask.cancel('no soup for you');
      return waitForIdle();
    }).then(function() {
      assertFlowHistory('a', 'a.1', 'b');
      assert.deepEqual([1, 3, 4], order);
    });
  });

  it('testCancellingAPendingPromiseCallback', function() {
    var called = false;

    var root = promise.fulfilled();
    root.then(function() {
      cb2.cancel('no soup for you');
    });

    var cb2 = root.then(fail, fail);  // These callbacks should never be called.
    cb2.then(fail, function(e) {
      called = true;
      assert.ok(e instanceof promise.CancellationError);
      assert.equal('no soup for you', e.message);
    });

    return waitForIdle().then(function() {
      assert.ok(called);
    });
  });

  describe('testResetFlow', function() {
    it('1', function() {
      var called = 0;
      var task = flow.execute(() => called++);
      task.thenFinally(() => called++);

      return new Promise(function(fulfill) {
        flow.once('reset', fulfill);
        flow.reset();

      }).then(function() {
        assert.equal(0, called);
        assert.ok(!task.isPending());
        return task;

      }).then(fail, function(e) {
        assert.ok(e instanceof promise.CancellationError);
        assert.equal('ControlFlow was reset', e.message);
      });
    });

    it('2', function() {
      var called = 0;
      var task1 = flow.execute(() => called++);
      task1.thenFinally(() => called++);

      var task2 = flow.execute(() => called++);
      task2.thenFinally(() => called++);

      var task3 = flow.execute(() => called++);
      task3.thenFinally(() => called++);

      return new Promise(function(fulfill) {
        flow.once('reset', fulfill);
        flow.reset();

      }).then(function() {
        assert.equal(0, called);
        assert.ok(!task1.isPending());
        assert.ok(!task2.isPending());
        assert.ok(!task3.isPending());
      });
    });
  });

  describe('testPromiseFulfilledInsideTask', function() {
    it('1', function() {
      var order = [];

      flow.execute(function() {
        var d = promise.defer();

        d.promise.then(() => order.push('a'));
        d.promise.then(() => order.push('b'));
        d.promise.then(() => order.push('c'));
        d.fulfill();

        flow.execute(() => order.push('d'));

      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['a', 'b', 'c', 'd', 'fin'], order);
      });
    });

    it('2', function() {
      var order = [];

      flow.execute(function() {
        flow.execute(() => order.push('a'));
        flow.execute(() => order.push('b'));

        var d = promise.defer();
        d.promise.then(() => order.push('c'));
        d.promise.then(() => order.push('d'));
        d.fulfill();

        flow.execute(() => order.push('e'));

      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['a', 'b', 'c', 'd', 'e', 'fin'], order);
      });
    });

    it('3', function() {
      var order = [];
      var d = promise.defer();
      d.promise.then(() => order.push('c'));
      d.promise.then(() => order.push('d'));

      flow.execute(function() {
        flow.execute(() => order.push('a'));
        flow.execute(() => order.push('b'));

        d.promise.then(() => order.push('e'));
        d.fulfill();

        flow.execute(() => order.push('f'));

      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['c', 'd', 'a', 'b', 'e', 'f', 'fin'], order);
      });
    });

    it('4', function() {
      var order = [];
      var d = promise.defer();
      d.promise.then(() => order.push('a'));
      d.promise.then(() => order.push('b'));

      flow.execute(function() {
        flow.execute(function() {
          order.push('c');
          flow.execute(() => order.push('d'));
          d.promise.then(() => order.push('e'));
        });
        flow.execute(() => order.push('f'));

        d.promise.then(() => order.push('g'));
        d.fulfill();

        flow.execute(() => order.push('h'));

      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'fin'], order);
      });
    });
  });

  describe('testSettledPromiseCallbacksInsideATask', function() {
    it('1', function() {
      var order = [];
      var p = promise.fulfilled();

      flow.execute(function() {
        flow.execute(() => order.push('a'));
        p.then(() => order.push('b'));
        flow.execute(() => order.push('c'));
        p.then(() => order.push('d'));
      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['a', 'b', 'c', 'd', 'fin'], order);
      });
    });

    it('2', function() {
      var order = [];

      flow.execute(function() {
        flow.execute(() => order.push('a'))
            .then(   () => order.push('c'));
        flow.execute(() => order.push('b'));
      }).then(() => order.push('fin'));

      return waitForIdle().then(function() {
        assert.deepEqual(['a', 'c', 'b', 'fin'], order);
      });
    });
  });

  it('testTasksDoNotWaitForNewlyCreatedPromises', function() {
    var order = [];

    flow.execute(function() {
      var d = promise.defer();

      // This is a normal promise, not a task, so the task for this callback is
      // considered volatile. Volatile tasks should be skipped when they reach
      // the front of the task queue.
      d.promise.then(() => order.push('a'));

      flow.execute(() => order.push('b'));
      flow.execute(function() {
        flow.execute(() => order.push('c'));
        d.promise.then(() => order.push('d'));
        d.fulfill();
      });
      flow.execute(() => order.push('e'));

    }).then(() => order.push('fin'));

    return waitForIdle().then(function() {
      assert.deepEqual(['b', 'a', 'c', 'd', 'e', 'fin'], order);
    });
  });

  it('testCallbackDependenciesDoNotDeadlock', function() {
    var order = [];
    var root = promise.defer();
    var dep = promise.fulfilled().then(function() {
      order.push('a');
      return root.promise.then(function() {
        order.push('b');
      });
    });
    // This callback depends on |dep|, which depends on another callback
    // attached to |root| via a chain.
    root.promise.then(function() {
      order.push('c');
      return dep.then(() => order.push('d'));
    }).then(() => order.push('fin'));

    setTimeout(() => root.fulfill(), 20);

    return waitForIdle().then(function() {
      assert.deepEqual(['a', 'b', 'c', 'd', 'fin'], order);
    });
  });
});
