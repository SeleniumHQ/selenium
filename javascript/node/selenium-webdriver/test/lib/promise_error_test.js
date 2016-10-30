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

/**
 * @fileoverview Contains tests against promise error handling. Many tests use
 * NativePromise to control test termination independent of promise
 * (and notably promise.ControlFlow).
 */

'use strict';

const testutil = require('./testutil');

const assert = require('assert');
const promise = require('../../lib/promise');
const {enablePromiseManager} = require('../../lib/test/promise');

const NativePromise = Promise;
const StubError = testutil.StubError;
const throwStubError = testutil.throwStubError;
const assertIsStubError = testutil.assertIsStubError;

describe('promise error handling', function() {
  enablePromiseManager(() => {
    var flow, uncaughtExceptions;

    beforeEach(function setUp() {
      if (promise.USE_PROMISE_MANAGER) {
        flow = promise.controlFlow();
        uncaughtExceptions = [];
        flow.on('uncaughtException', onUncaughtException);
      }
    });

    afterEach(function tearDown() {
      if (promise.USE_PROMISE_MANAGER) {
        return waitForIdle(flow).then(function() {
          assert.deepEqual(
              [], uncaughtExceptions, 'There were uncaught exceptions');
          flow.reset();
        });
      }
    });

    function onUncaughtException(e) {
      uncaughtExceptions.push(e);
    }

    function waitForAbort(opt_flow, opt_n) {
      var n = opt_n || 1;
      var theFlow = opt_flow || flow;
      theFlow.removeAllListeners(
          promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
      return new NativePromise(function(fulfill, reject) {
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
      return new NativePromise(function(fulfill, reject) {
        if (theFlow.isIdle()) {
          fulfill();
          return;
        }
        theFlow.once('idle', fulfill);
        theFlow.once('uncaughtException', reject);
      });
    }

    it('testRejectedPromiseTriggersErrorCallback', function() {
      return promise.rejected(new StubError).
          then(assert.fail, assertIsStubError);
    });

    describe('callback throws trigger subsequent error callback', function() {
      it('fulfilled promise', function() {
        return promise.fulfilled().
            then(throwStubError).
            then(assert.fail, assertIsStubError);
      });

      it('rejected promise', function() {
        var e = Error('not the droids you are looking for');
        return promise.rejected(e).
            then(assert.fail, throwStubError).
            then(assert.fail, assertIsStubError);
      });
    });

    describe('callback returns rejected promise triggers subsequent errback', function() {
      it('from fulfilled callback', function() {
        return promise.fulfilled().then(function() {
          return promise.rejected(new StubError);
        }).then(assert.fail, assertIsStubError);
      });

      it('from rejected callback', function() {
        var e = Error('not the droids you are looking for');
        return promise.rejected(e).
            then(assert.fail, function() {
              return promise.rejected(new StubError);
            }).
            then(assert.fail, assertIsStubError);
      });
    });

    it('testReportsUnhandledRejectionsThroughTheControlFlow', function() {
      promise.rejected(new StubError);
      return waitForAbort().then(assertIsStubError);
    });

    describe('multiple unhandled rejections outside a task', function() {
      it('are reported in order they occurred', function() {
        var e1 = Error('error 1');
        var e2 = Error('error 2');

        promise.rejected(e1);
        promise.rejected(e2);

        return waitForAbort(flow).then(function(error) {
          assert.ok(
              error instanceof promise.MultipleUnhandledRejectionError);
          // TODO: switch to Array.from when we drop node 0.12.x
          var errors = [];
          for (var e of error.errors) {
            errors.push(e);
          }
          assert.deepEqual([e1, e2], errors);
        });
      });
    });

    describe('does not report unhandled rejection when', function() {
      it('handler added before next tick', function() {
        promise.rejected(new StubError).then(assert.fail, assertIsStubError);
        return waitForIdle();
      });

      it('added async but before next tick', function() {
        var called = false;
        return new NativePromise(function(fulfill, reject) {
          var aPromise;
          NativePromise.resolve().then(function() {
            aPromise.then(assert.fail, function(e) {
              called = true;
              assertIsStubError(e);
            });
            waitForIdle().then(fulfill, reject);
          });
          aPromise = promise.rejected(new StubError);
        }).then(function() {
          assert.ok(called);
        })
      });
    });

    it('testTaskThrows', function() {
      return flow.execute(throwStubError).then(assert.fail, assertIsStubError);
    });

    it('testTaskReturnsRejectedPromise', function() {
      return flow.execute(function() {
        return promise.rejected(new StubError)
      }).then(assert.fail, assertIsStubError);
    });

    it('testTaskHasUnhandledRejection', function() {
      return flow.execute(function() {
        promise.rejected(new StubError)
      }).then(assert.fail, assertIsStubError);
    });

    it('testTaskfails_returnedPromiseIsUnhandled', function() {
      flow.execute(throwStubError);
      return waitForAbort().then(assertIsStubError);
    });

    it('testTaskHasUnhandledRejection_cancelsRemainingSubTasks', function() {
      var seen = [];
      flow.execute(function() {
        promise.rejected(new StubError);

        flow.execute(() => seen.push('a'))
            .then(() => seen.push('b'), (e) => seen.push(e));
        flow.execute(() => seen.push('c'))
            .then(() => seen.push('b'), (e) => seen.push(e));
      });

      return waitForAbort()
          .then(assertIsStubError)
          .then(() => assert.deepEqual([], seen));
    });

    describe('nested task failures', function() {
      it('returns up to paren', function() {
        return flow.execute(function() {
          return flow.execute(function() {
            return flow.execute(throwStubError);
          });
        }).then(assert.fail, assertIsStubError);
      });

      it('task throws; uncaught error bubbles up', function() {
        flow.execute(function() {
          flow.execute(function() {
            flow.execute(throwStubError);
          });
        });
        return waitForAbort().then(assertIsStubError);
      });

      it('task throws; uncaught error bubbles up; is caught at root', function() {
        flow.execute(function() {
          flow.execute(function() {
            flow.execute(throwStubError);
          });
        }).then(assert.fail, assertIsStubError);
        return waitForIdle();
      });

      it('unhandled rejection bubbles up', function() {
        flow.execute(function() {
          flow.execute(function() {
            flow.execute(function() {
              promise.rejected(new StubError);
            });
          });
        });
        return waitForAbort().then(assertIsStubError);
      });

      it('unhandled rejection bubbles up; caught at root', function() {
        flow.execute(function() {
          flow.execute(function() {
            promise.rejected(new StubError);
          });
        }).then(assert.fail, assertIsStubError);
        return waitForIdle();
      });

      it('mixtureof hanging and free subtasks', function() {
        flow.execute(function() {
          return flow.execute(function() {
            flow.execute(throwStubError);
          });
        });
        return waitForAbort().then(assertIsStubError);
      });

      it('cancels remaining tasks', function() {
        var seen = [];
        flow.execute(function() {
          flow.execute(() => promise.rejected(new StubError));
          flow.execute(() => seen.push('a'))
              .then(() => seen.push('b'), (e) => seen.push(e));
          flow.execute(() => seen.push('c'))
              .then(() => seen.push('b'), (e) => seen.push(e));
        });

        return waitForAbort()
            .then(assertIsStubError)
            .then(() => assert.deepEqual([], seen));
      });
    });

    it('testTaskReturnsPromiseLikeObjectThatInvokesErrback', function() {
      return flow.execute(function() {
        return {
          'then': function(_, errback) {
            errback('abc123');
          }
        };
      }).then(assert.fail, function(value) {
        assert.equal('abc123', value);
      });
    });

    describe('ControlFlow#wait();', function() {
      describe('condition throws;', function() {
        it('failure is caught', function() {
          return flow.wait(throwStubError, 50).then(assert.fail, assertIsStubError);
        });

        it('failure is not caught', function() {
          flow.wait(throwStubError, 50);
          return waitForAbort().then(assertIsStubError);
        });
      });

      describe('condition returns promise', function() {
        it('failure is caught', function() {
          return flow.wait(function() {
            return promise.rejected(new StubError);
          }, 50).then(assert.fail, assertIsStubError);
        });

        it('failure is not caught', function() {
          flow.wait(function() {
            return promise.rejected(new StubError);
          }, 50);
          return waitForAbort().then(assertIsStubError);
        });
      });

      describe('condition has unhandled promise rejection', function() {
        it('failure is caught', function() {
          return flow.wait(function() {
            promise.rejected(new StubError);
          }, 50).then(assert.fail, assertIsStubError);
        });

        it('failure is not caught', function() {
          flow.wait(function() {
            promise.rejected(new StubError);
          }, 50);
          return waitForAbort().then(assertIsStubError);
        });
      });

      describe('condition has subtask failure', function() {
        it('failure is caught', function() {
          return flow.wait(function() {
            flow.execute(function() {
              flow.execute(throwStubError);
            });
          }, 50).then(assert.fail, assertIsStubError);
        });

        it('failure is not caught', function() {
          flow.wait(function() {
            flow.execute(function() {
              flow.execute(throwStubError);
            });
          }, 50);
          return waitForAbort().then(assertIsStubError);
        });
      });
    });

    describe('errback throws a new error', function() {
      it('start with normal promise', function() {
        var error = Error('an error');
        return promise.rejected(error).
            catch(function(e) {
              assert.equal(e, error);
              throw new StubError;
            }).
            catch(assertIsStubError);
      });

      it('start with task result', function() {
        var error = Error('an error');
        return flow.execute(function() {
          throw error;
        }).
        catch(function(e) {
          assert.equal(e, error);
          throw new StubError;
        }).
        catch(assertIsStubError);
      });

      it('start with normal promise; uncaught error', function() {
        var error = Error('an error');
        promise.rejected(error).
            catch(function(e) {
              assert.equal(e, error);
              throw new StubError;
            });
        return waitForAbort().then(assertIsStubError);
      });

      it('start with task result; uncaught error', function() {
        var error = Error('an error');
        flow.execute(function() {
          throw error;
        }).
        catch(function(e) {
          assert.equal(e, error);
          throw new StubError;
        });
        return waitForAbort().then(assertIsStubError);
      });
    });

    it('thrownPromiseCausesCallbackRejection', function() {
      let p = promise.fulfilled(1234);
      return promise.fulfilled().then(function() {
        throw p;
      }).then(assert.fail, function(value) {
        assert.strictEqual(p, value);
      });
    });

    describe('task throws promise', function() {
      it('promise was fulfilled', function() {
        var toThrow = promise.fulfilled(1234);
        flow.execute(function() {
          throw toThrow;
        }).then(assert.fail, function(value) {
          assert.equal(toThrow, value);
          return toThrow;
        }).then(function(value) {
          assert.equal(1234, value);
        });
        return waitForIdle();
      });

      it('promise was rejected', function() {
        var toThrow = promise.rejected(new StubError);
        toThrow.catch(function() {});  // For tearDown.
        flow.execute(function() {
          throw toThrow;
        }).then(assert.fail, function(e) {
          assert.equal(toThrow, e);
          return e;
        }).then(assert.fail, assertIsStubError);
        return waitForIdle();
      });
    });

    it('testFailsTaskIfThereIsAnUnhandledErrorWhileWaitingOnTaskResult', function() {
      var d = promise.defer();
      flow.execute(function() {
        promise.rejected(new StubError);
        return d.promise;
      }).then(assert.fail, assertIsStubError);

      return waitForIdle().then(function() {
        return d.promise;
      }).then(assert.fail, function(e) {
        assert.equal('CancellationError: StubError', e.toString());
      });
    });

    it('testFailsParentTaskIfAsyncScheduledTaskFails', function() {
      var d = promise.defer();
      flow.execute(function() {
        flow.execute(throwStubError);
        return d.promise;
      }).then(assert.fail, assertIsStubError);

      return waitForIdle().then(function() {
        return d.promise;
      }).then(assert.fail, function(e) {
        assert.equal('CancellationError: StubError', e.toString());
      });
    });

    describe('long stack traces', function() {
      afterEach(() => promise.LONG_STACK_TRACES = false);

      it('always includes task stacks in failures', function() {
        promise.LONG_STACK_TRACES = false;
        flow.execute(function() {
          flow.execute(function() {
            flow.execute(throwStubError, 'throw error');
          }, 'two');
        }, 'three').
        then(assert.fail, function(e) {
          assertIsStubError(e);
          if (typeof e.stack !== 'string') {
            return;
          }
          var messages = e.stack.split(/\n/).filter(function(line, index) {
            return /^From: /.test(line);
          });
          assert.deepEqual([
            'From: Task: throw error',
            'From: Task: two',
            'From: Task: three'
          ], messages);
        });
        return waitForIdle();
      });

      it('does not include completed tasks', function () {
        flow.execute(function() {}, 'succeeds');
        flow.execute(throwStubError, 'kaboom').then(assert.fail, function(e) {
          assertIsStubError(e);
          if (typeof e.stack !== 'string') {
            return;
          }
          var messages = e.stack.split(/\n/).filter(function(line, index) {
            return /^From: /.test(line);
          });
          assert.deepEqual(['From: Task: kaboom'], messages);
        });
        return waitForIdle();
      });

      it('does not include promise chain when disabled', function() {
        promise.LONG_STACK_TRACES = false;
        flow.execute(function() {
          flow.execute(function() {
            return promise.fulfilled().
                then(function() {}).
                then(function() {}).
                then(throwStubError);
          }, 'eventually assert.fails');
        }, 'start').
        then(assert.fail, function(e) {
          assertIsStubError(e);
          if (typeof e.stack !== 'string') {
            return;
          }
          var messages = e.stack.split(/\n/).filter(function(line, index) {
            return /^From: /.test(line);
          });
          assert.deepEqual([
            'From: Task: eventually assert.fails',
            'From: Task: start'
          ], messages);
        });
        return waitForIdle();
      });

      it('includes promise chain when enabled', function() {
        promise.LONG_STACK_TRACES = true;
        flow.execute(function() {
          flow.execute(function() {
            return promise.fulfilled().
                then(function() {}).
                then(function() {}).
                then(throwStubError);
          }, 'eventually assert.fails');
        }, 'start').
        then(assert.fail, function(e) {
          assertIsStubError(e);
          if (typeof e.stack !== 'string') {
            return;
          }
          var messages = e.stack.split(/\n/).filter(function(line, index) {
            return /^From: /.test(line);
          });
          assert.deepEqual([
            'From: Promise: then',
            'From: Task: eventually assert.fails',
            'From: Task: start'
          ], messages);
        });
        return waitForIdle();
      });
    });

    describe('frame cancels remaining tasks', function() {
      it('on unhandled task failure', function() {
        var run = false;
        return flow.execute(function() {
          flow.execute(throwStubError);
          flow.execute(function() { run = true; });
        }).then(assert.fail, function(e) {
          assertIsStubError(e);
          assert.ok(!run);
        });
      });

      it('on unhandled promise rejection', function() {
        var run = false;
        return flow.execute(function() {
          promise.rejected(new StubError);
          flow.execute(function() { run = true; });
        }).then(assert.fail, function(e) {
          assertIsStubError(e);
          assert.ok(!run);
        });
      });

      it('if task throws', function() {
        var run = false;
        return flow.execute(function() {
          flow.execute(function() { run = true; });
          throw new StubError;
        }).then(assert.fail, function(e) {
          assertIsStubError(e);
          assert.ok(!run);
        });
      });

      describe('task callbacks scheduled in another frame', function() {
        flow = promise.controlFlow();
        function noop() {}

        let subTask;

        before(function() {
          flow.execute(function() {
            // This task will be discarded and never run because of the error below.
            subTask = flow.execute(() => 'abc');
            throw new StubError('stub');
          }).catch(noop);
        });

        function assertCancellation(e) {
          assert.ok(e instanceof promise.CancellationError);
          assert.equal(
            'Task was discarded due to a previous failure: stub', e.message);
        }

        it('are rejected with cancellation error', function() {
          let result;
          return Promise.resolve().then(function() {
            return flow.execute(function() {
              result = subTask.then(assert.fail);
            });
          })
          .then(() => result)
          .then(assert.fail, assertCancellation);
        });

        it('cancellation errors propagate through callbacks (1)', function() {
          let result;
          return Promise.resolve().then(function() {
            return flow.execute(function() {
              result = subTask
                  .then(assert.fail, assertCancellation)
                  .then(() => 'abc123');
            });
          })
          .then(() => result)
          .then(value => assert.equal('abc123', value));
        });

        it('cancellation errors propagate through callbacks (2)', function() {
          let result;
          return Promise.resolve().then(function() {
            return flow.execute(function() {
              result = subTask.then(assert.fail)
                  .then(noop, assertCancellation)
                  .then(() => 'fin');
            });
          })
          // Verify result actually computed successfully all the way through.
          .then(() => result)
          .then(value => assert.equal('fin', value));
        });
      });
    });

    it('testRegisteredTaskCallbacksAreDroppedWhenTaskIsCancelled_return', function() {
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
      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.deepEqual([], seen);
      });
    });

    it('testRegisteredTaskCallbacksAreDroppedWhenTaskIsCancelled_withReturn', function() {
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
      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.deepEqual([], seen);
      });
    });

    it('testTasksWithinACallbackAreDroppedIfContainingTaskIsAborted', function() {
      var seen = [];
      return flow.execute(function() {
        flow.execute(throwStubError);

        // None of the callbacks on this promise should execute because the
        // task assert.failure above is never handled, causing the containing task to
        // abort.
        promise.fulfilled().then(function() {
          seen.push(1);
          return flow.execute(function() {
            seen.push(2);
          });
        }).finally(function() {
          seen.push(3);
        });

      }).then(assert.fail, function(e) {
        assertIsStubError(e);
        assert.deepEqual([], seen);
      });
    });

    it('testTaskIsCancelledAfterWaitTimeout', function() {
      var seen = [];
      return flow.execute(function() {
        flow.wait(function() {
          return promise.delayed(50);
        }, 5);

        return flow.execute(function() {
          seen.push(1);
        }).then(function() {
          seen.push(2);
        }, function() {
          seen.push(3);
        });
      }).then(assert.fail, function() {
        assert.deepEqual([], seen);
      });
    });

    describe('task callbacks get cancellation error if registered after task was cancelled', function() {
      it('(a)', function() {
        var task;
        flow.execute(function() {
          flow.execute(throwStubError);
          task = flow.execute(function() {});
        }).then(assert.fail, assertIsStubError);
        return waitForIdle().then(function() {
          return task.then(assert.fail, function(e) {
            assert.ok(e instanceof promise.CancellationError);
          });
        });
      });

      it('(b)', function() {
        var seen = [];

        var task;
        flow.execute(function() {
          flow.execute(throwStubError);
          task = flow.execute(function() {});

          task.then(() => seen.push(1))
              .then(() => seen.push(2));
          task.then(() => seen.push(3))
              .then(() => seen.push(4));

        }).then(assert.fail, assertIsStubError);

        return waitForIdle().then(function() {
          return task.then(assert.fail, function(e) {
            seen.push(5);
            assert.ok(e instanceof promise.CancellationError);
          });
        }).then(() => assert.deepEqual([5], seen));
      });
    });

    it('unhandledRejectionInParallelTaskQueue', function() {
      var seen = [];
      function schedule(name) {
        return flow.execute(() => seen.push(name), name);
      }

      flow.async(function() {
        schedule('a.1');
        flow.execute(throwStubError, 'a.2 (throws)');
      });

      var b3;
      flow.async(function() {
        schedule('b.1');
        schedule('b.2');
        b3 = schedule('b.3');
      });

      var c3;
      flow.async(function() {
        schedule('c.1');
        schedule('c.2');
        c3 = schedule('c.3');
      });

      function assertWasCancelled(p) {
        return p.then(assert.fail, function(e) {
          assert.ok(e instanceof promise.CancellationError);
        });
      }

      return waitForAbort()
        .then(function() {
          assert.deepEqual(['a.1', 'b.1', 'c.1', 'b.2', 'c.2'], seen);
        })
        .then(() => assertWasCancelled(b3))
        .then(() => assertWasCancelled(c3));
    });

    it('errorsInAsyncFunctionsAreReportedAsUnhandledRejection', function() {
      flow.removeAllListeners();  // For tearDown.

      var task;
      return new Promise(function(fulfill) {
        flow.once('uncaughtException', fulfill);
        flow.async(function() {
          task = flow.execute(function() {});
          throw Error('boom');
        });
      }).then(function(error) {
        assert.ok(error instanceof promise.CancellationError);
        return task.catch(function(error) {
          assert.ok(error instanceof promise.CancellationError);
        });
      });
    });

    describe('does not wait for values thrown from callbacks to be resolved', function() {
      it('(a)', function() {
        var p1 = promise.fulfilled();
        var reason = promise.fulfilled('should not see me');
        return p1.then(function() {
          throw reason;
        }).then(assert.fail, function(e) {
          assert.equal(reason, e);
        });
      });

      it('(b)', function() {
        var p1 = promise.fulfilled();
        var reason = promise.rejected('should not see me');
        reason.catch(function() {});  // For tearDown.
        return p1.then(function() {
          throw reason;
        }).then(assert.fail, function(e) {
          assert.equal(reason, e);
        });
      });

      it('(c)', function() {
        var p1 = promise.fulfilled();
        var reason = promise.defer();
        setTimeout(() => reason.fulfill('should not see me'), 100);
        return p1.then(function() {
          throw reason.promise;
        }).then(assert.fail, function(e) {
          assert.equal(reason.promise, e);
        });
      });

      it('(d)', function() {
        var p1 = promise.fulfilled();
        var reason = {then: function() {}};  // A thenable like object.
        return p1.then(function() {
          throw reason;
        }).then(assert.fail, function(e) {
          assert.equal(reason, e);
        });
      });
    });
  });
});
