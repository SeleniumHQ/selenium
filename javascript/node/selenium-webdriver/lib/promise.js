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
 * @fileoverview
 *
 * > ### IMPORTANT NOTICE
 * >
 * > The promise manager contained in this module is in the process of being
 * > phased out in favor of native JavaScript promises. This will be a long
 * > process and will not be completed until there have been two major LTS Node
 * > releases (approx. Node v10.0) that support
 * > [async functions](https://tc39.github.io/ecmascript-asyncawait/).
 * >
 * > At this time, the promise manager can be disabled by setting an environment
 * > variable, `SELENIUM_PROMISE_MANAGER=0`. In the absence of async functions,
 * > users may use generators with the
 * > {@link ./promise.consume promise.consume()} function to write "synchronous"
 * > style tests:
 * >
 * > ```js
 * > const {Builder, By, promise, until} = require('selenium-webdriver');
 * >
 * > let result = promise.consume(function* doGoogleSearch() {
 * >   let driver = new Builder().forBrowser('firefox').build();
 * >   yield driver.get('http://www.google.com/ncr');
 * >   yield driver.findElement(By.name('q')).sendKeys('webdriver');
 * >   yield driver.findElement(By.name('btnG')).click();
 * >   yield driver.wait(until.titleIs('webdriver - Google Search'), 1000);
 * >   yield driver.quit();
 * > });
 * >
 * > result.then(_ => console.log('SUCCESS!'),
 * >             e => console.error('FAILURE: ' + e));
 * > ```
 * >
 * > The motivation behind this change and full deprecation plan are documented
 * > in [issue 2969](https://github.com/SeleniumHQ/selenium/issues/2969).
 * >
 * >
 *
 * The promise module is centered around the {@linkplain ControlFlow}, a class
 * that coordinates the execution of asynchronous tasks. The ControlFlow allows
 * users to focus on the imperative commands for their script without worrying
 * about chaining together every single asynchronous action, which can be
 * tedious and verbose. APIs may be layered on top of the control flow to read
 * as if they were synchronous. For instance, the core
 * {@linkplain ./webdriver.WebDriver WebDriver} API is built on top of the
 * control flow, allowing users to write
 *
 *     driver.get('http://www.google.com/ncr');
 *     driver.findElement({name: 'q'}).sendKeys('webdriver');
 *     driver.findElement({name: 'btnGn'}).click();
 *
 * instead of
 *
 *     driver.get('http://www.google.com/ncr')
 *     .then(function() {
 *       return driver.findElement({name: 'q'});
 *     })
 *     .then(function(q) {
 *       return q.sendKeys('webdriver');
 *     })
 *     .then(function() {
 *       return driver.findElement({name: 'btnG'});
 *     })
 *     .then(function(btnG) {
 *       return btnG.click();
 *     });
 *
 * ## Tasks and Task Queues
 *
 * The control flow is based on the concept of tasks and task queues. Tasks are
 * functions that define the basic unit of work for the control flow to execute.
 * Each task is scheduled via {@link ControlFlow#execute()}, which will return
 * a {@link ManagedPromise} that will be resolved with the task's result.
 *
 * A task queue contains all of the tasks scheduled within a single turn of the
 * [JavaScript event loop][JSEL]. The control flow will create a new task queue
 * the first time a task is scheduled within an event loop.
 *
 *     var flow = promise.controlFlow();
 *     flow.execute(foo);       // Creates a new task queue and inserts foo.
 *     flow.execute(bar);       // Inserts bar into the same queue as foo.
 *     setTimeout(function() {
 *       flow.execute(baz);     // Creates a new task queue and inserts baz.
 *     }, 0);
 *
 * Whenever the control flow creates a new task queue, it will automatically
 * begin executing tasks in the next available turn of the event loop. This
 * execution is [scheduled as a microtask][MicrotasksArticle] like e.g. a
 * (native) `Promise.then()` callback.
 *
 *     setTimeout(() => console.log('a'));
 *     Promise.resolve().then(() => console.log('b'));  // A native promise.
 *     flow.execute(() => console.log('c'));
 *     Promise.resolve().then(() => console.log('d'));
 *     setTimeout(() => console.log('fin'));
 *     // b
 *     // c
 *     // d
 *     // a
 *     // fin
 *
 * In the example above, b/c/d is logged before a/fin because native promises
 * and this module use "microtask" timers, which have a higher priority than
 * "macrotasks" like `setTimeout`.
 *
 * ## Task Execution
 *
 * Upon creating a task queue, and whenever an existing queue completes a task,
 * the control flow will schedule a microtask timer to process any scheduled
 * tasks. This ensures no task is ever started within the same turn of the
 * JavaScript event loop in which it was scheduled, nor is a task ever started
 * within the same turn that another finishes.
 *
 * When the execution timer fires, a single task will be dequeued and executed.
 * There are several important events that may occur while executing a task
 * function:
 *
 * 1. A new task queue is created by a call to {@link ControlFlow#execute()}.
 *    Any tasks scheduled within this task queue are considered subtasks of the
 *    current task.
 * 2. The task function throws an error. Any scheduled tasks are immediately
 *    discarded and the task's promised result (previously returned by
 *    {@link ControlFlow#execute()}) is immediately rejected with the thrown
 *    error.
 * 3. The task function returns successfully.
 *
 * If a task function created a new task queue, the control flow will wait for
 * that queue to complete before processing the task result. If the queue
 * completes without error, the flow will settle the task's promise with the
 * value originally returned by the task function. On the other hand, if the task
 * queue terminates with an error, the task's promise will be rejected with that
 * error.
 *
 *     flow.execute(function() {
 *       flow.execute(() => console.log('a'));
 *       flow.execute(() => console.log('b'));
 *     });
 *     flow.execute(() => console.log('c'));
 *     // a
 *     // b
 *     // c
 *
 * ## ManagedPromise Integration
 *
 * In addition to the {@link ControlFlow} class, the promise module also exports
 * a [Promises/A+] {@linkplain ManagedPromise implementation} that is deeply
 * integrated with the ControlFlow. First and foremost, each promise
 * {@linkplain ManagedPromise#then() callback} is scheduled with the
 * control flow as a task. As a result, each callback is invoked in its own turn
 * of the JavaScript event loop with its own task queue. If any tasks are
 * scheduled within a callback, the callback's promised result will not be
 * settled until the task queue has completed.
 *
 *     promise.fulfilled().then(function() {
 *       flow.execute(function() {
 *         console.log('b');
 *       });
 *     }).then(() => console.log('a'));
 *     // b
 *     // a
 *
 * ### Scheduling ManagedPromise Callbacks <a id="scheduling_callbacks"></a>
 *
 * How callbacks are scheduled in the control flow depends on when they are
 * attached to the promise. Callbacks attached to a _previously_ resolved
 * promise are immediately enqueued as subtasks of the currently running task.
 *
 *     var p = promise.fulfilled();
 *     flow.execute(function() {
 *       flow.execute(() => console.log('A'));
 *       p.then(      () => console.log('B'));
 *       flow.execute(() => console.log('C'));
 *       p.then(      () => console.log('D'));
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // B
 *     // C
 *     // D
 *     // fin
 *
 * When a promise is resolved while a task function is on the call stack, any
 * callbacks also registered in that stack frame are scheduled as if the promise
 * were already resolved:
 *
 *     var d = promise.defer();
 *     flow.execute(function() {
 *       flow.execute(  () => console.log('A'));
 *       d.promise.then(() => console.log('B'));
 *       flow.execute(  () => console.log('C'));
 *       d.promise.then(() => console.log('D'));
 *
 *       d.fulfill();
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // B
 *     // C
 *     // D
 *     // fin
 *
 * Callbacks attached to an _unresolved_ promise within a task function are
 * only weakly scheduled as subtasks and will be dropped if they reach the
 * front of the queue before the promise is resolved. In the example below, the
 * callbacks for `B` & `D` are dropped as sub-tasks since they are attached to
 * an unresolved promise when they reach the front of the task queue.
 *
 *     var d = promise.defer();
 *     flow.execute(function() {
 *       flow.execute(  () => console.log('A'));
 *       d.promise.then(() => console.log('B'));
 *       flow.execute(  () => console.log('C'));
 *       d.promise.then(() => console.log('D'));
 *
 *       setTimeout(d.fulfill, 20);
 *     }).then(function() {
 *       console.log('fin')
 *     });
 *     // A
 *     // C
 *     // fin
 *     // B
 *     // D
 *
 * If a promise is resolved while a task function is on the call stack, any
 * previously registered and unqueued callbacks (i.e. either attached while no
 * task was on the call stack, or previously dropped as described above) act as
 * _interrupts_ and are inserted at the front of the task queue. If multiple
 * promises are fulfilled, their interrupts are enqueued in the order the
 * promises are resolved.
 *
 *     var d1 = promise.defer();
 *     d1.promise.then(() => console.log('A'));
 *
 *     var d2 = promise.defer();
 *     d2.promise.then(() => console.log('B'));
 *
 *     flow.execute(function() {
 *       d1.promise.then(() => console.log('C'));
 *       flow.execute(() => console.log('D'));
 *     });
 *     flow.execute(function() {
 *       flow.execute(() => console.log('E'));
 *       flow.execute(() => console.log('F'));
 *       d1.fulfill();
 *       d2.fulfill();
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // D
 *     // A
 *     // C
 *     // B
 *     // E
 *     // F
 *     // fin
 *
 * Within a task function (or callback), each step of a promise chain acts as
 * an interrupt on the task queue:
 *
 *     var d = promise.defer();
 *     flow.execute(function() {
 *       d.promise.
 *           then(() => console.log('A')).
 *           then(() => console.log('B')).
 *           then(() => console.log('C')).
 *           then(() => console.log('D'));
 *
 *       flow.execute(() => console.log('E'));
 *       d.fulfill();
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // B
 *     // C
 *     // D
 *     // E
 *     // fin
 *
 * If there are multiple promise chains derived from a single promise, they are
 * processed in the order created:
 *
 *     var d = promise.defer();
 *     flow.execute(function() {
 *       var chain = d.promise.then(() => console.log('A'));
 *
 *       chain.then(() => console.log('B')).
 *           then(() => console.log('C'));
 *
 *       chain.then(() => console.log('D')).
 *           then(() => console.log('E'));
 *
 *       flow.execute(() => console.log('F'));
 *
 *       d.fulfill();
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // B
 *     // C
 *     // D
 *     // E
 *     // F
 *     // fin
 *
 * Even though a subtask's promised result will never resolve while the task
 * function is on the stack, it will be treated as a promise resolved within the
 * task. In all other scenarios, a task's promise behaves just like a normal
 * promise. In the sample below, `C/D` is logged before `B` because the
 * resolution of `subtask1` interrupts the flow of the enclosing task. Within
 * the final subtask, `E/F` is logged in order because `subtask1` is a resolved
 * promise when that task runs.
 *
 *     flow.execute(function() {
 *       var subtask1 = flow.execute(() => console.log('A'));
 *       var subtask2 = flow.execute(() => console.log('B'));
 *
 *       subtask1.then(() => console.log('C'));
 *       subtask1.then(() => console.log('D'));
 *
 *       flow.execute(function() {
 *         flow.execute(() => console.log('E'));
 *         subtask1.then(() => console.log('F'));
 *       });
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // C
 *     // D
 *     // B
 *     // E
 *     // F
 *     // fin
 *
 * Finally, consider the following:
 *
 *     var d = promise.defer();
 *     d.promise.then(() => console.log('A'));
 *     d.promise.then(() => console.log('B'));
 *
 *     flow.execute(function() {
 *       flow.execute(  () => console.log('C'));
 *       d.promise.then(() => console.log('D'));
 *
 *       flow.execute(  () => console.log('E'));
 *       d.promise.then(() => console.log('F'));
 *
 *       d.fulfill();
 *
 *       flow.execute(  () => console.log('G'));
 *       d.promise.then(() => console.log('H'));
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // A
 *     // B
 *     // C
 *     // D
 *     // E
 *     // F
 *     // G
 *     // H
 *     // fin
 *
 * In this example, callbacks are registered on `d.promise` both before and
 * during the invocation of the task function. When `d.fulfill()` is called,
 * the callbacks registered before the task (`A` & `B`) are registered as
 * interrupts. The remaining callbacks were all attached within the task and
 * are scheduled in the flow as standard tasks.
 *
 * ## Generator Support
 *
 * [Generators][GF] may be scheduled as tasks within a control flow or attached
 * as callbacks to a promise. Each time the generator yields a promise, the
 * control flow will wait for that promise to settle before executing the next
 * iteration of the generator. The yielded promise's fulfilled value will be
 * passed back into the generator:
 *
 *     flow.execute(function* () {
 *       var d = promise.defer();
 *
 *       setTimeout(() => console.log('...waiting...'), 25);
 *       setTimeout(() => d.fulfill(123), 50);
 *
 *       console.log('start: ' + Date.now());
 *
 *       var value = yield d.promise;
 *       console.log('mid: %d; value = %d', Date.now(), value);
 *
 *       yield promise.delayed(10);
 *       console.log('end: ' + Date.now());
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // start: 0
 *     // ...waiting...
 *     // mid: 50; value = 123
 *     // end: 60
 *     // fin
 *
 * Yielding the result of a promise chain will wait for the entire chain to
 * complete:
 *
 *     promise.fulfilled().then(function* () {
 *       console.log('start: ' + Date.now());
 *
 *       var value = yield flow.
 *           execute(() => console.log('A')).
 *           then(   () => console.log('B')).
 *           then(   () => 123);
 *
 *       console.log('mid: %s; value = %d', Date.now(), value);
 *
 *       yield flow.execute(() => console.log('C'));
 *     }).then(function() {
 *       console.log('fin');
 *     });
 *     // start: 0
 *     // A
 *     // B
 *     // mid: 2; value = 123
 *     // C
 *     // fin
 *
 * Yielding a _rejected_ promise will cause the rejected value to be thrown
 * within the generator function:
 *
 *     flow.execute(function* () {
 *       console.log('start: ' + Date.now());
 *       try {
 *         yield promise.delayed(10).then(function() {
 *           throw Error('boom');
 *         });
 *       } catch (ex) {
 *         console.log('caught time: ' + Date.now());
 *         console.log(ex.message);
 *       }
 *     });
 *     // start: 0
 *     // caught time: 10
 *     // boom
 *
 * # Error Handling
 *
 * ES6 promises do not require users to handle a promise rejections. This can
 * result in subtle bugs as the rejections are silently "swallowed" by the
 * Promise class.
 *
 *     Promise.reject(Error('boom'));
 *     // ... *crickets* ...
 *
 * Selenium's promise module, on the other hand, requires that every rejection
 * be explicitly handled. When a {@linkplain ManagedPromise ManagedPromise} is
 * rejected and no callbacks are defined on that promise, it is considered an
 * _unhandled rejection_ and reported to the active task queue. If the rejection
 * remains unhandled after a single turn of the [event loop][JSEL] (scheduled
 * with a microtask), it will propagate up the stack.
 *
 * ## Error Propagation
 *
 * If an unhandled rejection occurs within a task function, that task's promised
 * result is rejected and all remaining subtasks are discarded:
 *
 *     flow.execute(function() {
 *       // No callbacks registered on promise -> unhandled rejection
 *       promise.rejected(Error('boom'));
 *       flow.execute(function() { console.log('this will never run'); });
 *     }).catch(function(e) {
 *       console.log(e.message);
 *     });
 *     // boom
 *
 * The promised results for discarded tasks are silently rejected with a
 * cancellation error and existing callback chains will never fire.
 *
 *     flow.execute(function() {
 *       promise.rejected(Error('boom'));
 *       flow.execute(function() { console.log('a'); }).
 *           then(function() { console.log('b'); });
 *     }).catch(function(e) {
 *       console.log(e.message);
 *     });
 *     // boom
 *
 * An unhandled rejection takes precedence over a task function's returned
 * result, even if that value is another promise:
 *
 *     flow.execute(function() {
 *       promise.rejected(Error('boom'));
 *       return flow.execute(someOtherTask);
 *     }).catch(function(e) {
 *       console.log(e.message);
 *     });
 *     // boom
 *
 * If there are multiple unhandled rejections within a task, they are packaged
 * in a {@link MultipleUnhandledRejectionError}, which has an `errors` property
 * that is a `Set` of the recorded unhandled rejections:
 *
 *     flow.execute(function() {
 *       promise.rejected(Error('boom1'));
 *       promise.rejected(Error('boom2'));
 *     }).catch(function(ex) {
 *       console.log(ex instanceof MultipleUnhandledRejectionError);
 *       for (var e of ex.errors) {
 *         console.log(e.message);
 *       }
 *     });
 *     // boom1
 *     // boom2
 *
 * When a subtask is discarded due to an unreported rejection in its parent
 * frame, the existing callbacks on that task will never settle and the
 * callbacks will not be invoked. If a new callback is attached to the subtask
 * _after_ it has been discarded, it is handled the same as adding a callback
 * to a cancelled promise: the error-callback path is invoked. This behavior is
 * intended to handle cases where the user saves a reference to a task promise,
 * as illustrated below.
 *
 *     var subTask;
 *     flow.execute(function() {
 *       promise.rejected(Error('boom'));
 *       subTask = flow.execute(function() {});
 *     }).catch(function(e) {
 *       console.log(e.message);
 *     }).then(function() {
 *       return subTask.then(
 *           () => console.log('subtask success!'),
 *           (e) => console.log('subtask failed:\n' + e));
 *     });
 *     // boom
 *     // subtask failed:
 *     // DiscardedTaskError: Task was discarded due to a previous failure: boom
 *
 * When a subtask fails, its promised result is treated the same as any other
 * promise: it must be handled within one turn of the rejection or the unhandled
 * rejection is propagated to the parent task. This means users can catch errors
 * from complex flows from the top level task:
 *
 *     flow.execute(function() {
 *       flow.execute(function() {
 *         flow.execute(function() {
 *           throw Error('fail!');
 *         });
 *       });
 *     }).catch(function(e) {
 *       console.log(e.message);
 *     });
 *     // fail!
 *
 * ## Unhandled Rejection Events
 *
 * When an unhandled rejection propagates to the root of the control flow, the
 * flow will emit an __uncaughtException__ event. If no listeners are registered
 * on the flow, the error will be rethrown to the global error handler: an
 * __uncaughtException__ event from the
 * [`process`](https://nodejs.org/api/process.html) object in node, or
 * `window.onerror` when running in a browser.
 *
 * Bottom line: you __*must*__ handle rejected promises.
 *
 * # Promises/A+ Compatibility
 *
 * This `promise` module is compliant with the [Promises/A+] specification
 * except for sections `2.2.6.1` and `2.2.6.2`:
 *
 * >
 * > - `then` may be called multiple times on the same promise.
 * >    - If/when `promise` is fulfilled, all respective `onFulfilled` callbacks
 * >      must execute in the order of their originating calls to `then`.
 * >    - If/when `promise` is rejected, all respective `onRejected` callbacks
 * >      must execute in the order of their originating calls to `then`.
 * >
 *
 * Specifically, the conformance tests contain the following scenario (for
 * brevity, only the fulfillment version is shown):
 *
 *     var p1 = Promise.resolve();
 *     p1.then(function() {
 *       console.log('A');
 *       p1.then(() => console.log('B'));
 *     });
 *     p1.then(() => console.log('C'));
 *     // A
 *     // C
 *     // B
 *
 * Since the [ControlFlow](#scheduling_callbacks) executes promise callbacks as
 * tasks, with this module, the result would be:
 *
 *     var p2 = promise.fulfilled();
 *     p2.then(function() {
 *       console.log('A');
 *       p2.then(() => console.log('B');
 *     });
 *     p2.then(() => console.log('C'));
 *     // A
 *     // B
 *     // C
 *
 * [JSEL]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
 * [GF]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
 * [Promises/A+]: https://promisesaplus.com/
 * [MicrotasksArticle]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
 */

'use strict';

const error = require('./error');
const events = require('./events');
const logging = require('./logging');


/**
 * Alias to help with readability and differentiate types.
 * @const
 */
const NativePromise = Promise;


/**
 * Whether to append traces of `then` to rejection errors.
 * @type {boolean}
 */
var LONG_STACK_TRACES = false;  // TODO: this should not be CONSTANT_CASE


/** @const */
const LOG = logging.getLogger('promise');


const UNIQUE_IDS = new WeakMap;
let nextId = 1;


function getUid(obj) {
  let id = UNIQUE_IDS.get(obj);
  if (!id) {
    id = nextId;
    nextId += 1;
    UNIQUE_IDS.set(obj, id);
  }
  return id;
}


/**
 * Runs the given function after a microtask yield.
 * @param {function()} fn The function to run.
 */
function asyncRun(fn) {
  NativePromise.resolve().then(function() {
    try {
      fn();
    } catch (ignored) {
      // Do nothing.
    }
  });
}

/**
 * @param {number} level What level of verbosity to log with.
 * @param {(string|function(this: T): string)} loggable The message to log.
 * @param {T=} opt_self The object in whose context to run the loggable
 *     function.
 * @template T
 */
function vlog(level, loggable, opt_self) {
  var logLevel = logging.Level.FINE;
  if (level > 1) {
    logLevel = logging.Level.FINEST;
  } else if (level > 0) {
    logLevel = logging.Level.FINER;
  }

  if (typeof loggable === 'function') {
    loggable = loggable.bind(opt_self);
  }

  LOG.log(logLevel, loggable);
}


/**
 * Generates an error to capture the current stack trace.
 * @param {string} name Error name for this stack trace.
 * @param {string} msg Message to record.
 * @param {Function=} opt_topFn The function that should appear at the top of
 *     the stack; only applicable in V8.
 * @return {!Error} The generated error.
 */
function captureStackTrace(name, msg, opt_topFn) {
  var e = Error(msg);
  e.name = name;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, opt_topFn);
  } else {
    var stack = Error().stack;
    if (stack) {
      e.stack = e.toString();
      e.stack += '\n' + stack;
    }
  }
  return e;
}


/**
 * Error used when the computation of a promise is cancelled.
 */
class CancellationError extends Error {
  /**
   * @param {string=} opt_msg The cancellation message.
   */
  constructor(opt_msg) {
    super(opt_msg);

    /** @override */
    this.name = this.constructor.name;

    /** @private {boolean} */
    this.silent_ = false;
  }

  /**
   * Wraps the given error in a CancellationError.
   *
   * @param {*} error The error to wrap.
   * @param {string=} opt_msg The prefix message to use.
   * @return {!CancellationError} A cancellation error.
   */
  static wrap(error, opt_msg) {
    var message;
    if (error instanceof CancellationError) {
      return new CancellationError(
          opt_msg ? (opt_msg + ': ' + error.message) : error.message);
    } else if (opt_msg) {
      message = opt_msg;
      if (error) {
        message += ': ' + error;
      }
      return new CancellationError(message);
    }
    if (error) {
      message = error + '';
    }
    return new CancellationError(message);
  }
}


/**
 * Error used to cancel tasks when a control flow is reset.
 * @final
 */
class FlowResetError extends CancellationError {
  constructor() {
    super('ControlFlow was reset');
    this.silent_ = true;
  }
}


/**
 * Error used to cancel tasks that have been discarded due to an uncaught error
 * reported earlier in the control flow.
 * @final
 */
class DiscardedTaskError extends CancellationError {
  /** @param {*} error The original error. */
  constructor(error) {
    if (error instanceof DiscardedTaskError) {
      return /** @type {!DiscardedTaskError} */(error);
    }

    var msg = '';
    if (error) {
      msg = ': ' + (
          typeof error.message === 'string' ? error.message : error);
    }

    super('Task was discarded due to a previous failure' + msg);
    this.silent_ = true;
  }
}


/**
 * Error used when there are multiple unhandled promise rejections detected
 * within a task or callback.
 *
 * @final
 */
class MultipleUnhandledRejectionError extends Error {
  /**
   * @param {!(Set<*>)} errors The errors to report.
   */
  constructor(errors) {
    super('Multiple unhandled promise rejections reported');

    /** @override */
    this.name = this.constructor.name;

    /** @type {!Set<*>} */
    this.errors = errors;
  }
}


/**
 * Property used to flag constructor's as implementing the Thenable interface
 * for runtime type checking.
 * @const
 */
const IMPLEMENTED_BY_SYMBOL = Symbol('promise.Thenable');
const CANCELLABLE_SYMBOL = Symbol('promise.CancellableThenable');


/**
 * @param {function(new: ?)} ctor
 * @param {!Object} symbol
 */
function addMarkerSymbol(ctor, symbol) {
  try {
    ctor.prototype[symbol] = true;
  } catch (ignored) {
    // Property access denied?
  }
}


/**
 * @param {*} object
 * @param {!Object} symbol
 * @return {boolean}
 */
function hasMarkerSymbol(object, symbol) {
  if (!object) {
    return false;
  }
  try {
    return !!object[symbol];
  } catch (e) {
    return false;  // Property access seems to be forbidden.
  }
}


/**
 * Thenable is a promise-like object with a {@code then} method which may be
 * used to schedule callbacks on a promised value.
 *
 * @record
 * @extends {IThenable<T>}
 * @template T
 */
class Thenable {
  /**
   * Adds a property to a class prototype to allow runtime checks of whether
   * instances of that class implement the Thenable interface.
   * @param {function(new: Thenable, ...?)} ctor The
   *     constructor whose prototype to modify.
   */
  static addImplementation(ctor) {
    addMarkerSymbol(ctor, IMPLEMENTED_BY_SYMBOL);
  }

  /**
   * Checks if an object has been tagged for implementing the Thenable
   * interface as defined by {@link Thenable.addImplementation}.
   * @param {*} object The object to test.
   * @return {boolean} Whether the object is an implementation of the Thenable
   *     interface.
   */
  static isImplementation(object) {
    return hasMarkerSymbol(object, IMPLEMENTED_BY_SYMBOL);
  }

  /**
   * Registers listeners for when this instance is resolved.
   *
   * @param {?(function(T): (R|IThenable<R>))=} opt_callback The
   *     function to call if this promise is successfully resolved. The function
   *     should expect a single argument: the promise's resolved value.
   * @param {?(function(*): (R|IThenable<R>))=} opt_errback
   *     The function to call if this promise is rejected. The function should
   *     expect a single argument: the rejection reason.
   * @return {!Thenable<R>} A new promise which will be resolved with the result
   *     of the invoked callback.
   * @template R
   */
  then(opt_callback, opt_errback) {}

  /**
   * Registers a listener for when this promise is rejected. This is synonymous
   * with the {@code catch} clause in a synchronous API:
   *
   *     // Synchronous API:
   *     try {
   *       doSynchronousWork();
   *     } catch (ex) {
   *       console.error(ex);
   *     }
   *
   *     // Asynchronous promise API:
   *     doAsynchronousWork().catch(function(ex) {
   *       console.error(ex);
   *     });
   *
   * @param {function(*): (R|IThenable<R>)} errback The
   *     function to call if this promise is rejected. The function should
   *     expect a single argument: the rejection reason.
   * @return {!Thenable<R>} A new promise which will be resolved with the result
   *     of the invoked callback.
   * @template R
   */
  catch(errback) {}
}


/**
 * Marker interface for objects that allow consumers to request the cancellation
 * of a promise-based operation. A cancelled promise will be rejected with a
 * {@link CancellationError}.
 *
 * This interface is considered package-private and should not be used outside
 * of selenium-webdriver.
 *
 * @interface
 * @extends {Thenable<T>}
 * @template T
 * @package
 */
class CancellableThenable {
  /**
   * @param {function(new: CancellableThenable, ...?)} ctor
   */
  static addImplementation(ctor) {
    Thenable.addImplementation(ctor);
    addMarkerSymbol(ctor, CANCELLABLE_SYMBOL);
  }

  /**
   * @param {*} object
   * @return {boolean}
   */
  static isImplementation(object) {
    return hasMarkerSymbol(object, CANCELLABLE_SYMBOL);
  }

  /**
   * Requests the cancellation of the computation of this promise's value,
   * rejecting the promise in the process. This method is a no-op if the promise
   * has already been resolved.
   *
   * @param {(string|Error)=} opt_reason The reason this promise is being
   *     cancelled. This value will be wrapped in a {@link CancellationError}.
   */
  cancel(opt_reason) {}
}


/**
 * @enum {string}
 */
const PromiseState = {
  PENDING: 'pending',
  BLOCKED: 'blocked',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled'
};


/**
 * Internal map used to store cancellation handlers for {@link ManagedPromise}
 * objects. This is an internal implementation detail used by the
 * {@link TaskQueue} class to monitor for when a promise is cancelled without
 * generating an extra promise via then().
 *
 * @const {!WeakMap<!ManagedPromise, function(!CancellationError)>}
 */
const ON_CANCEL_HANDLER = new WeakMap;

const SKIP_LOG = Symbol('skip-log');
const FLOW_LOG = logging.getLogger('promise.ControlFlow');


/**
 * Represents the eventual value of a completed operation. Each promise may be
 * in one of three states: pending, fulfilled, or rejected. Each promise starts
 * in the pending state and may make a single transition to either a
 * fulfilled or rejected state, at which point the promise is considered
 * resolved.
 *
 * @implements {CancellableThenable<T>}
 * @template T
 * @see http://promises-aplus.github.io/promises-spec/
 */
class ManagedPromise {
  /**
   * @param {function(
   *           function((T|IThenable<T>|Thenable)=),
   *           function(*=))} resolver
   *     Function that is invoked immediately to begin computation of this
   *     promise's value. The function should accept a pair of callback
   *     functions, one for fulfilling the promise and another for rejecting it.
   * @param {ControlFlow=} opt_flow The control flow
   *     this instance was created under. Defaults to the currently active flow.
   * @param {?=} opt_skipLog An internal parameter used to skip logging the
   *     creation of this promise. This parameter has no effect unless it is
   *     strictly equal to an internal symbol. In other words, this parameter
   *     is always ignored for external code.
   */
  constructor(resolver, opt_flow, opt_skipLog) {
    if (!usePromiseManager()) {
      throw TypeError(
        'Unable to create a managed promise instance: the promise manager has'
            + ' been disabled by the SELENIUM_PROMISE_MANAGER environment'
            + ' variable: ' + process.env['SELENIUM_PROMISE_MANAGER']);
    } else if (opt_skipLog !== SKIP_LOG) {
      FLOW_LOG.warning(() => {
        let e =
            captureStackTrace(
                'ManagedPromiseError',
                'Creating a new managed Promise. This call will fail when the'
                    + ' promise manager is disabled',
            ManagedPromise)
        return e.stack;
      });
    }

    getUid(this);

    /** @private {!ControlFlow} */
    this.flow_ = opt_flow || controlFlow();

    /** @private {Error} */
    this.stack_ = null;
    if (LONG_STACK_TRACES) {
      this.stack_ = captureStackTrace('ManagedPromise', 'new', this.constructor);
    }

    /** @private {Thenable<?>} */
    this.parent_ = null;

    /** @private {Array<!Task>} */
    this.callbacks_ = null;

    /** @private {PromiseState} */
    this.state_ = PromiseState.PENDING;

    /** @private {boolean} */
    this.handled_ = false;

    /** @private {*} */
    this.value_ = undefined;

    /** @private {TaskQueue} */
    this.queue_ = null;

    try {
      var self = this;
      resolver(function(value) {
        self.resolve_(PromiseState.FULFILLED, value);
      }, function(reason) {
        self.resolve_(PromiseState.REJECTED, reason);
      });
    } catch (ex) {
      this.resolve_(PromiseState.REJECTED, ex);
    }
  }

  /**
   * Creates a promise that is immediately resolved with the given value.
   *
   * @param {T=} opt_value The value to resolve.
   * @return {!ManagedPromise<T>} A promise resolved with the given value.
   * @template T
   */
  static resolve(opt_value) {
    if (opt_value instanceof ManagedPromise) {
      return opt_value;
    }
    return new ManagedPromise(resolve => resolve(opt_value));
  }

  /**
   * Creates a promise that is immediately rejected with the given reason.
   *
   * @param {*=} opt_reason The rejection reason.
   * @return {!ManagedPromise<?>} A new rejected promise.
   */
  static reject(opt_reason) {
    return new ManagedPromise((_, reject) => reject(opt_reason));
  }

  /** @override */
  toString() {
    return 'ManagedPromise::' + getUid(this) +
      ' {[[PromiseStatus]]: "' + this.state_ + '"}';
  }

  /**
   * Resolves this promise. If the new value is itself a promise, this function
   * will wait for it to be resolved before notifying the registered listeners.
   * @param {PromiseState} newState The promise's new state.
   * @param {*} newValue The promise's new value.
   * @throws {TypeError} If {@code newValue === this}.
   * @private
   */
  resolve_(newState, newValue) {
    if (PromiseState.PENDING !== this.state_) {
      return;
    }

    if (newValue === this) {
      // See promise a+, 2.3.1
      // http://promises-aplus.github.io/promises-spec/#point-48
      newValue = new TypeError('A promise may not resolve to itself');
      newState = PromiseState.REJECTED;
    }

    this.parent_ = null;
    this.state_ = PromiseState.BLOCKED;

    if (newState !== PromiseState.REJECTED) {
      if (Thenable.isImplementation(newValue)) {
        // 2.3.2
        newValue = /** @type {!Thenable} */(newValue);
        this.parent_ = newValue;
        newValue.then(
            this.unblockAndResolve_.bind(this, PromiseState.FULFILLED),
            this.unblockAndResolve_.bind(this, PromiseState.REJECTED));
        return;

      } else if (newValue
          && (typeof newValue === 'object' || typeof newValue === 'function')) {
        // 2.3.3

        try {
          // 2.3.3.1
          var then = newValue['then'];
        } catch (e) {
          // 2.3.3.2
          this.state_ = PromiseState.REJECTED;
          this.value_ = e;
          this.scheduleNotifications_();
          return;
        }

        if (typeof then === 'function') {
          // 2.3.3.3
          this.invokeThen_(/** @type {!Object} */(newValue), then);
          return;
        }
      }
    }

    if (newState === PromiseState.REJECTED &&
        isError(newValue) && newValue.stack && this.stack_) {
      newValue.stack += '\nFrom: ' + (this.stack_.stack || this.stack_);
    }

    // 2.3.3.4 and 2.3.4
    this.state_ = newState;
    this.value_ = newValue;
    this.scheduleNotifications_();
  }

  /**
   * Invokes a thenable's "then" method according to 2.3.3.3 of the promise
   * A+ spec.
   * @param {!Object} x The thenable object.
   * @param {!Function} then The "then" function to invoke.
   * @private
   */
  invokeThen_(x, then) {
    var called = false;
    var self = this;

    var resolvePromise = function(value) {
      if (!called) {  // 2.3.3.3.3
        called = true;
        // 2.3.3.3.1
        self.unblockAndResolve_(PromiseState.FULFILLED, value);
      }
    };

    var rejectPromise = function(reason) {
      if (!called) {  // 2.3.3.3.3
        called = true;
        // 2.3.3.3.2
        self.unblockAndResolve_(PromiseState.REJECTED, reason);
      }
    };

    try {
      // 2.3.3.3
      then.call(x, resolvePromise, rejectPromise);
    } catch (e) {
      // 2.3.3.3.4.2
      rejectPromise(e);
    }
  }

  /**
   * @param {PromiseState} newState The promise's new state.
   * @param {*} newValue The promise's new value.
   * @private
   */
  unblockAndResolve_(newState, newValue) {
    if (this.state_ === PromiseState.BLOCKED) {
      this.state_ = PromiseState.PENDING;
      this.resolve_(newState, newValue);
    }
  }

  /**
   * @private
   */
  scheduleNotifications_() {
    vlog(2, () => this + ' scheduling notifications', this);

    ON_CANCEL_HANDLER.delete(this);
    if (this.value_ instanceof CancellationError
        && this.value_.silent_) {
      this.callbacks_ = null;
    }

    if (!this.queue_) {
      this.queue_ = this.flow_.getActiveQueue_();
    }

    if (!this.handled_ &&
        this.state_ === PromiseState.REJECTED &&
        !(this.value_ instanceof CancellationError)) {
      this.queue_.addUnhandledRejection(this);
    }
    this.queue_.scheduleCallbacks(this);
  }

  /** @override */
  cancel(opt_reason) {
    if (!canCancel(this)) {
      return;
    }

    if (this.parent_ && canCancel(this.parent_)) {
      /** @type {!CancellableThenable} */(this.parent_).cancel(opt_reason);
    } else {
      var reason = CancellationError.wrap(opt_reason);
      let onCancel = ON_CANCEL_HANDLER.get(this);
      if (onCancel) {
        onCancel(reason);
        ON_CANCEL_HANDLER.delete(this);
      }

      if (this.state_ === PromiseState.BLOCKED) {
        this.unblockAndResolve_(PromiseState.REJECTED, reason);
      } else {
        this.resolve_(PromiseState.REJECTED, reason);
      }
    }

    function canCancel(promise) {
      if (!(promise instanceof ManagedPromise)) {
        return CancellableThenable.isImplementation(promise);
      }
      return promise.state_ === PromiseState.PENDING
          || promise.state_ === PromiseState.BLOCKED;
    }
  }

  /** @override */
  then(opt_callback, opt_errback) {
    return this.addCallback_(
        opt_callback, opt_errback, 'then', ManagedPromise.prototype.then);
  }

  /** @override */
  catch(errback) {
    return this.addCallback_(
        null, errback, 'catch', ManagedPromise.prototype.catch);
  }

  /**
   * @param {function(): (R|IThenable<R>)} callback
   * @return {!ManagedPromise<R>}
   * @template R
   * @see ./promise.finally()
   */
  finally(callback) {
    let result = thenFinally(this, callback);
    return /** @type {!ManagedPromise} */(result);
  }

  /**
   * Registers a new callback with this promise
   * @param {(function(T): (R|IThenable<R>)|null|undefined)} callback The
   *    fulfillment callback.
   * @param {(function(*): (R|IThenable<R>)|null|undefined)} errback The
   *    rejection callback.
   * @param {string} name The callback name.
   * @param {!Function} fn The function to use as the top of the stack when
   *     recording the callback's creation point.
   * @return {!ManagedPromise<R>} A new promise which will be resolved with the
   *     result of the invoked callback.
   * @template R
   * @private
   */
  addCallback_(callback, errback, name, fn) {
    if (typeof callback !== 'function' && typeof errback !== 'function') {
      return this;
    }

    this.handled_ = true;
    if (this.queue_) {
      this.queue_.clearUnhandledRejection(this);
    }

    var cb = new Task(
        this.flow_,
        this.invokeCallback_.bind(this, callback, errback),
        name,
        LONG_STACK_TRACES ? {name: 'Promise', top: fn} : undefined);
    cb.promise.parent_ = this;

    if (this.state_ !== PromiseState.PENDING &&
        this.state_ !== PromiseState.BLOCKED) {
      this.flow_.getActiveQueue_().enqueue(cb);
    } else {
      if (!this.callbacks_) {
        this.callbacks_ = [];
      }
      this.callbacks_.push(cb);
      cb.blocked = true;
      this.flow_.getActiveQueue_().enqueue(cb);
    }

    return cb.promise;
  }

  /**
   * Invokes a callback function attached to this promise.
   * @param {(function(T): (R|IThenable<R>)|null|undefined)} callback The
   *    fulfillment callback.
   * @param {(function(*): (R|IThenable<R>)|null|undefined)} errback The
   *    rejection callback.
   * @template R
   * @private
   */
  invokeCallback_(callback, errback) {
    var callbackFn = callback;
    if (this.state_ === PromiseState.REJECTED) {
      callbackFn = errback;
    }

    if (typeof callbackFn === 'function') {
      if (isGenerator(callbackFn)) {
        return consume(callbackFn, null, this.value_);
      }
      return callbackFn(this.value_);
    } else if (this.state_ === PromiseState.REJECTED) {
      throw this.value_;
    } else {
      return this.value_;
    }
  }
}
CancellableThenable.addImplementation(ManagedPromise);


/**
 * @param {!ManagedPromise} promise
 * @return {boolean}
 */
function isPending(promise) {
  return promise.state_ === PromiseState.PENDING;
}


/**
 * Structural interface for a deferred promise resolver.
 * @record
 * @template T
 */
function Resolver() {}


/**
 * The promised value for this resolver.
 * @type {!Thenable<T>}
 */
Resolver.prototype.promise;


/**
 * Resolves the promised value with the given `value`.
 * @param {T|Thenable<T>} value
 * @return {void}
 */
Resolver.prototype.resolve;


/**
 * Rejects the promised value with the given `reason`.
 * @param {*} reason
 * @return {void}
 */
Resolver.prototype.reject;


/**
 * Represents a value that will be resolved at some point in the future. This
 * class represents the protected "producer" half of a ManagedPromise - each Deferred
 * has a {@code promise} property that may be returned to consumers for
 * registering callbacks, reserving the ability to resolve the deferred to the
 * producer.
 *
 * If this Deferred is rejected and there are no listeners registered before
 * the next turn of the event loop, the rejection will be passed to the
 * {@link ControlFlow} as an unhandled failure.
 *
 * @template T
 * @implements {Resolver<T>}
 */
class Deferred {
  /**
   * @param {ControlFlow=} opt_flow The control flow this instance was
   *     created under. This should only be provided during unit tests.
   * @param {?=} opt_skipLog An internal parameter used to skip logging the
   *     creation of this promise. This parameter has no effect unless it is
   *     strictly equal to an internal symbol. In other words, this parameter
   *     is always ignored for external code.
   */
  constructor(opt_flow, opt_skipLog) {
    var fulfill, reject;

    /** @type {!ManagedPromise<T>} */
    this.promise = new ManagedPromise(function(f, r) {
      fulfill = f;
      reject = r;
    }, opt_flow, opt_skipLog);

    var self = this;
    var checkNotSelf = function(value) {
      if (value === self) {
        throw new TypeError('May not resolve a Deferred with itself');
      }
    };

    /**
     * Resolves this deferred with the given value. It is safe to call this as a
     * normal function (with no bound "this").
     * @param {(T|IThenable<T>|Thenable)=} opt_value The fulfilled value.
     * @const
     */
    this.resolve = function(opt_value) {
      checkNotSelf(opt_value);
      fulfill(opt_value);
    };

    /**
     * An alias for {@link #resolve}.
     * @const
     */
    this.fulfill = this.resolve;

    /**
     * Rejects this promise with the given reason. It is safe to call this as a
     * normal function (with no bound "this").
     * @param {*=} opt_reason The rejection reason.
     * @const
     */
    this.reject = function(opt_reason) {
      checkNotSelf(opt_reason);
      reject(opt_reason);
    };
  }
}


/**
 * Tests if a value is an Error-like object. This is more than an straight
 * instanceof check since the value may originate from another context.
 * @param {*} value The value to test.
 * @return {boolean} Whether the value is an error.
 */
function isError(value) {
  return value instanceof Error ||
      (!!value && typeof value === 'object'
          && typeof value.message === 'string');
}


/**
 * Determines whether a {@code value} should be treated as a promise.
 * Any object whose "then" property is a function will be considered a promise.
 *
 * @param {?} value The value to test.
 * @return {boolean} Whether the value is a promise.
 */
function isPromise(value) {
  try {
    // Use array notation so the Closure compiler does not obfuscate away our
    // contract.
    return value
        && (typeof value === 'object' || typeof value === 'function')
        && typeof value['then'] === 'function';
  } catch (ex) {
    return false;
  }
}


/**
 * Creates a promise that will be resolved at a set time in the future.
 * @param {number} ms The amount of time, in milliseconds, to wait before
 *     resolving the promise.
 * @return {!Thenable} The promise.
 */
function delayed(ms) {
  return createPromise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}


/**
 * Creates a new deferred resolver.
 *
 * If the promise manager is currently enabled, this function will return a
 * {@link Deferred} instance. Otherwise, it will return a resolver for a
 * {@linkplain NativePromise native promise}.
 *
 * @return {!Resolver<T>} A new deferred resolver.
 * @template T
 */
function defer() {
  if (usePromiseManager()) {
    return new Deferred();
  }
  let resolve, reject;
  let promise = new NativePromise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {promise, resolve, reject};
}


/**
 * Creates a promise that has been resolved with the given value.
 *
 * If the promise manager is currently enabled, this function will return a
 * {@linkplain ManagedPromise managed promise}. Otherwise, it will return a
 * {@linkplain NativePromise native promise}.
 *
 * @param {T=} opt_value The resolved value.
 * @return {!Thenable<T>} The resolved promise.
 * @template T
 */
function fulfilled(opt_value) {
  let ctor = usePromiseManager() ? ManagedPromise : NativePromise;
  if (opt_value instanceof ctor) {
    return /** @type {!Thenable} */(opt_value);
  }

  if (usePromiseManager()) {
    // We can skip logging warnings about creating a managed promise because
    // this function will automatically switch to use a native promise when
    // the promise manager is disabled.
    return new ManagedPromise(
        resolve => resolve(opt_value), undefined, SKIP_LOG);
  }
  return NativePromise.resolve(opt_value);
}


/**
 * Creates a promise that has been rejected with the given reason.
 *
 * If the promise manager is currently enabled, this function will return a
 * {@linkplain ManagedPromise managed promise}. Otherwise, it will return a
 * {@linkplain NativePromise native promise}.
 *
 * @param {*=} opt_reason The rejection reason; may be any value, but is
 *     usually an Error or a string.
 * @return {!Thenable<?>} The rejected promise.
 */
function rejected(opt_reason) {
  if (usePromiseManager()) {
    // We can skip logging warnings about creating a managed promise because
    // this function will automatically switch to use a native promise when
    // the promise manager is disabled.
    return new ManagedPromise(
        (_, reject) => reject(opt_reason), undefined, SKIP_LOG);
  }
  return NativePromise.reject(opt_reason);
}


/**
 * Wraps a function that expects a node-style callback as its final
 * argument. This callback expects two arguments: an error value (which will be
 * null if the call succeeded), and the success value as the second argument.
 * The callback will the resolve or reject the returned promise, based on its
 * arguments.
 * @param {!Function} fn The function to wrap.
 * @param {...?} var_args The arguments to apply to the function, excluding the
 *     final callback.
 * @return {!Thenable} A promise that will be resolved with the
 *     result of the provided function's callback.
 */
function checkedNodeCall(fn, var_args) {
  let args = Array.prototype.slice.call(arguments, 1);
  return createPromise(function(fulfill, reject) {
    try {
      args.push(function(error, value) {
        error ? reject(error) : fulfill(value);
      });
      fn.apply(undefined, args);
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * Registers a listener to invoke when a promise is resolved, regardless
 * of whether the promise's value was successfully computed. This function
 * is synonymous with the {@code finally} clause in a synchronous API:
 *
 *     // Synchronous API:
 *     try {
 *       doSynchronousWork();
 *     } finally {
 *       cleanUp();
 *     }
 *
 *     // Asynchronous promise API:
 *     doAsynchronousWork().finally(cleanUp);
 *
 * __Note:__ similar to the {@code finally} clause, if the registered
 * callback returns a rejected promise or throws an error, it will silently
 * replace the rejection error (if any) from this promise:
 *
 *     try {
 *       throw Error('one');
 *     } finally {
 *       throw Error('two');  // Hides Error: one
 *     }
 *
 *     let p = Promise.reject(Error('one'));
 *     promise.finally(p, function() {
 *       throw Error('two');  // Hides Error: one
 *     });
 *
 * @param {!IThenable<?>} promise The promise to add the listener to.
 * @param {function(): (R|IThenable<R>)} callback The function to call when
 *     the promise is resolved.
 * @return {!IThenable<R>} A promise that will be resolved with the callback
 *     result.
 * @template R
 */
function thenFinally(promise, callback) {
  let error;
  let mustThrow = false;
  return promise.then(function() {
    return callback();
  }, function(err) {
    error = err;
    mustThrow = true;
    return callback();
  }).then(function() {
    if (mustThrow) {
      throw error;
    }
  });
}


/**
 * Registers an observer on a promised {@code value}, returning a new promise
 * that will be resolved when the value is. If {@code value} is not a promise,
 * then the return promise will be immediately resolved.
 * @param {*} value The value to observe.
 * @param {Function=} opt_callback The function to call when the value is
 *     resolved successfully.
 * @param {Function=} opt_errback The function to call when the value is
 *     rejected.
 * @return {!Thenable} A new promise.
 * @deprecated Use `promise.fulfilled(value).then(opt_callback, opt_errback)`
 */
function when(value, opt_callback, opt_errback) {
  return fulfilled(value).then(opt_callback, opt_errback);
}


/**
 * Invokes the appropriate callback function as soon as a promised `value` is
 * resolved.
 *
 * @param {*} value The value to observe.
 * @param {Function} callback The function to call when the value is
 *     resolved successfully.
 * @param {Function=} opt_errback The function to call when the value is
 *     rejected.
 */
function asap(value, callback, opt_errback) {
  if (isPromise(value)) {
    value.then(callback, opt_errback);

  } else if (callback) {
    callback(value);
  }
}


/**
 * Given an array of promises, will return a promise that will be fulfilled
 * with the fulfillment values of the input array's values. If any of the
 * input array's promises are rejected, the returned promise will be rejected
 * with the same reason.
 *
 * @param {!Array<(T|!ManagedPromise<T>)>} arr An array of
 *     promises to wait on.
 * @return {!Thenable<!Array<T>>} A promise that is
 *     fulfilled with an array containing the fulfilled values of the
 *     input array, or rejected with the same reason as the first
 *     rejected value.
 * @template T
 */
function all(arr) {
  return createPromise(function(fulfill, reject) {
    var n = arr.length;
    var values = [];

    if (!n) {
      fulfill(values);
      return;
    }

    var toFulfill = n;
    var onFulfilled = function(index, value) {
      values[index] = value;
      toFulfill--;
      if (toFulfill == 0) {
        fulfill(values);
      }
    };

    function processPromise(index) {
      asap(arr[index], function(value) {
        onFulfilled(index, value);
      }, reject);
    }

    for (var i = 0; i < n; ++i) {
      processPromise(i);
    }
  });
}


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array, which is used as the fulfillment value of the promise returned
 * by this function.
 *
 * If the return value of the mapping function is a promise, this function
 * will wait for it to be fulfilled before inserting it into the new array.
 *
 * If the mapping function throws or returns a rejected promise, the
 * promise returned by this function will be rejected with the same reason.
 * Only the first failure will be reported; all subsequent errors will be
 * silently ignored.
 *
 * @param {!(Array<TYPE>|ManagedPromise<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): ?} fn The
 *     function to call for each element in the array. This function should
 *     expect three arguments (the element, the index, and the array itself.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
function map(arr, fn, opt_self) {
  return createPromise(resolve => resolve(arr)).then(v => {
    if (!Array.isArray(v)) {
      throw TypeError('not an array');
    }
    var arr = /** @type {!Array} */(v);
    return createPromise(function(fulfill, reject) {
      var n = arr.length;
      var values = new Array(n);
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          asap(
              fn.call(opt_self, arr[i], i, /** @type {!Array} */(arr)),
              function(value) {
                values[i] = value;
                processNext(i + 1);
              },
              reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
    });
  });
}


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * If the return value of the filter function is a promise, this function
 * will wait for it to be fulfilled before determining whether to insert the
 * element into the new array.
 *
 * If the filter function throws or returns a rejected promise, the promise
 * returned by this function will be rejected with the same reason. Only the
 * first failure will be reported; all subsequent errors will be silently
 * ignored.
 *
 * @param {!(Array<TYPE>|ManagedPromise<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): (
 *             boolean|ManagedPromise<boolean>)} fn The function
 *     to call for each element in the array.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
function filter(arr, fn, opt_self) {
  return createPromise(resolve => resolve(arr)).then(v => {
    if (!Array.isArray(v)) {
      throw TypeError('not an array');
    }
    var arr = /** @type {!Array} */(v);
    return createPromise(function(fulfill, reject) {
      var n = arr.length;
      var values = [];
      var valuesLength = 0;
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          var value = arr[i];
          var include = fn.call(opt_self, value, i, /** @type {!Array} */(arr));
          asap(include, function(include) {
            if (include) {
              values[valuesLength++] = value;
            }
            processNext(i + 1);
            }, reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
    });
  });
}


/**
 * Returns a promise that will be resolved with the input value in a
 * fully-resolved state. If the value is an array, each element will be fully
 * resolved. Likewise, if the value is an object, all keys will be fully
 * resolved. In both cases, all nested arrays and objects will also be
 * fully resolved.  All fields are resolved in place; the returned promise will
 * resolve on {@code value} and not a copy.
 *
 * Warning: This function makes no checks against objects that contain
 * cyclical references:
 *
 *     var value = {};
 *     value['self'] = value;
 *     promise.fullyResolved(value);  // Stack overflow.
 *
 * @param {*} value The value to fully resolve.
 * @return {!Thenable} A promise for a fully resolved version
 *     of the input value.
 */
function fullyResolved(value) {
  if (isPromise(value)) {
    return fulfilled(value).then(fullyResolveValue);
  }
  return fullyResolveValue(value);
}


/**
 * @param {*} value The value to fully resolve. If a promise, assumed to
 *     already be resolved.
 * @return {!Thenable} A promise for a fully resolved version
 *     of the input value.
 */
function fullyResolveValue(value) {
  if (Array.isArray(value)) {
    return fullyResolveKeys(/** @type {!Array} */ (value));
  }

  if (isPromise(value)) {
    if (isPromise(value)) {
      // We get here when the original input value is a promise that
      // resolves to itself. When the user provides us with such a promise,
      // trust that it counts as a "fully resolved" value and return it.
      // Of course, since it's already a promise, we can just return it
      // to the user instead of wrapping it in another promise.
      return /** @type {!ManagedPromise} */ (value);
    }
  }

  if (value && typeof value === 'object') {
    return fullyResolveKeys(/** @type {!Object} */ (value));
  }

  if (typeof value === 'function') {
    return fullyResolveKeys(/** @type {!Object} */ (value));
  }

  return createPromise(resolve => resolve(value));
}


/**
 * @param {!(Array|Object)} obj the object to resolve.
 * @return {!Thenable} A promise that will be resolved with the
 *     input object once all of its values have been fully resolved.
 */
function fullyResolveKeys(obj) {
  var isArray = Array.isArray(obj);
  var numKeys = isArray ? obj.length : (function() {
    let n = 0;
    for (let key in obj) {
      n += 1;
    }
    return n;
  })();

  if (!numKeys) {
    return createPromise(resolve => resolve(obj));
  }

  function forEachProperty(obj, fn) {
    for (let key in obj) {
      fn.call(null, obj[key], key, obj);
    }
  }

  function forEachElement(arr, fn) {
    arr.forEach(fn);
  }

  var numResolved = 0;
  return createPromise(function(fulfill, reject) {
    var forEachKey = isArray ? forEachElement: forEachProperty;

    forEachKey(obj, function(partialValue, key) {
      if (!Array.isArray(partialValue)
          && (!partialValue || typeof partialValue !== 'object')) {
        maybeResolveValue();
        return;
      }

      fullyResolved(partialValue).then(
          function(resolvedValue) {
            obj[key] = resolvedValue;
            maybeResolveValue();
          },
          reject);
    });

    function maybeResolveValue() {
      if (++numResolved == numKeys) {
        fulfill(obj);
      }
    }
  });
}


//////////////////////////////////////////////////////////////////////////////
//
//  ControlFlow
//
//////////////////////////////////////////////////////////////////////////////


/**
 * Defines methods for coordinating the execution of asynchronous tasks.
 * @record
 */
class Scheduler {
  /**
   * Schedules a task for execution. If the task function is a generator, the
   * task will be executed using {@link ./promise.consume consume()}.
   *
   * @param {function(): (T|IThenable<T>)} fn The function to call to start the
   *     task.
   * @param {string=} opt_description A description of the task for debugging
   *     purposes.
   * @return {!Thenable<T>} A promise that will be resolved with the task
   *     result.
   * @template T
   */
  execute(fn, opt_description) {}

  /**
   * Creates a new promise using the given resolver function.
   *
   * @param {function(
   *             function((T|IThenable<T>|Thenable|null)=),
   *             function(*=))} resolver
   * @return {!Thenable<T>}
   * @template T
   */
  promise(resolver) {}

  /**
   * Schedules a `setTimeout` call.
   *
   * @param {number} ms The timeout delay, in milliseconds.
   * @param {string=} opt_description A description to accompany the timeout.
   * @return {!Thenable<void>} A promise that will be resolved when the timeout
   *     fires.
   */
  timeout(ms, opt_description) {}

  /**
   * Schedules a task to wait for a condition to hold.
   *
   * If the condition is defined as a function, it may return any value. Promise
   * will be resolved before testing if the condition holds (resolution time
   * counts towards the timeout). Once resolved, values are always evaluated as
   * booleans.
   *
   * If the condition function throws, or returns a rejected promise, the
   * wait task will fail.
   *
   * If the condition is defined as a promise, the scheduler will wait for it to
   * settle. If the timeout expires before the promise settles, the promise
   * returned by this function will be rejected.
   *
   * If this function is invoked with `timeout === 0`, or the timeout is
   * omitted, this scheduler will wait indefinitely for the condition to be
   * satisfied.
   *
   * @param {(!IThenable<T>|function())} condition The condition to poll,
   *     or a promise to wait on.
   * @param {number=} opt_timeout How long to wait, in milliseconds, for the
   *     condition to hold before timing out. If omitted, the flow will wait
   *     indefinitely.
   * @param {string=} opt_message An optional error message to include if the
   *     wait times out; defaults to the empty string.
   * @return {!Thenable<T>} A promise that will be fulfilled
   *     when the condition has been satisfied. The promise shall be rejected
   *     if the wait times out waiting for the condition.
   * @throws {TypeError} If condition is not a function or promise or if timeout
   *     is not a number >= 0.
   * @template T
   */
  wait(condition, opt_timeout, opt_message) {}
}


let USE_PROMISE_MANAGER;
function usePromiseManager() {
  if (typeof USE_PROMISE_MANAGER !== 'undefined') {
    return !!USE_PROMISE_MANAGER;
  }
  return process.env['SELENIUM_PROMISE_MANAGER'] === undefined
      || !/^0|false$/i.test(process.env['SELENIUM_PROMISE_MANAGER']);
}


/**
 * Creates a new promise with the given `resolver` function. If the promise
 * manager is currently enabled, the returned promise will be a
 * {@linkplain ManagedPromise} instance. Otherwise, it will be a native promise.
 *
 * @param {function(
 *             function((T|IThenable<T>|Thenable|null)=),
 *             function(*=))} resolver
 * @return {!Thenable<T>}
 * @template T
 */
function createPromise(resolver) {
  let ctor = usePromiseManager() ? ManagedPromise : NativePromise;
  return new ctor(resolver);
}


/**
 * @param {!Scheduler} scheduler The scheduler to use.
 * @param {(!IThenable<T>|function())} condition The condition to poll,
 *     or a promise to wait on.
 * @param {number=} opt_timeout How long to wait, in milliseconds, for the
 *     condition to hold before timing out. If omitted, the flow will wait
 *     indefinitely.
 * @param {string=} opt_message An optional error message to include if the
 *     wait times out; defaults to the empty string.
 * @return {!Thenable<T>} A promise that will be fulfilled
 *     when the condition has been satisfied. The promise shall be rejected
 *     if the wait times out waiting for the condition.
 * @throws {TypeError} If condition is not a function or promise or if timeout
 *     is not a number >= 0.
 * @template T
 */
function scheduleWait(scheduler, condition, opt_timeout, opt_message) {
  let timeout = opt_timeout || 0;
  if (typeof timeout !== 'number' || timeout < 0) {
    throw TypeError('timeout must be a number >= 0: ' + timeout);
  }

  if (isPromise(condition)) {
    return scheduler.execute(function() {
      if (!timeout) {
        return condition;
      }
      return scheduler.promise(function(fulfill, reject) {
        let start = Date.now();
        let timer = setTimeout(function() {
          timer = null;
          reject(
              new error.TimeoutError(
                  (opt_message ? opt_message + '\n' : '')
                      + 'Timed out waiting for promise to resolve after '
                      + (Date.now() - start) + 'ms'));
        }, timeout);

        /** @type {Thenable} */(condition).then(
          function(value) {
            timer && clearTimeout(timer);
            fulfill(value);
          },
          function(error) {
            timer && clearTimeout(timer);
            reject(error);
          });
      });
    }, opt_message || '<anonymous wait: promise resolution>');
  }

  if (typeof condition !== 'function') {
    throw TypeError('Invalid condition; must be a function or promise: ' +
        typeof condition);
  }

  if (isGenerator(condition)) {
    let original = condition;
    condition = () => consume(original);
  }

  return scheduler.execute(function() {
    var startTime = Date.now();
    return scheduler.promise(function(fulfill, reject) {
      pollCondition();

      function pollCondition() {
        var conditionFn = /** @type {function()} */(condition);
        scheduler.execute(conditionFn).then(function(value) {
          var elapsed = Date.now() - startTime;
          if (!!value) {
            fulfill(value);
          } else if (timeout && elapsed >= timeout) {
            reject(
                new error.TimeoutError(
                    (opt_message ? opt_message + '\n' : '')
                        + `Wait timed out after ${elapsed}ms`));
          } else {
            // Do not use asyncRun here because we need a non-micro yield
            // here so the UI thread is given a chance when running in a
            // browser.
            setTimeout(pollCondition, 0);
          }
        }, reject);
      }
    });
  }, opt_message || '<anonymous wait>');
}


/**
 * A scheduler that executes all tasks immediately, with no coordination. This
 * class is an event emitter for API compatibility with the {@link ControlFlow},
 * however, it emits no events.
 *
 * @implements {Scheduler}
 */
class SimpleScheduler extends events.EventEmitter {
  /** @override */
  execute(fn) {
    return this.promise((resolve, reject) => {
      try {
        if (isGenerator(fn)) {
          consume(fn).then(resolve, reject);
        } else {
          resolve(fn.call(undefined));
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }

  /** @override */
  promise(resolver) {
    return new NativePromise(resolver);
  }

  /** @override */
  timeout(ms) {
    return this.promise(resolve => setTimeout(_ => resolve(), ms));
  }

  /** @override */
  wait(condition, opt_timeout, opt_message) {
    return scheduleWait(this, condition, opt_timeout, opt_message);
  }
}
const SIMPLE_SCHEDULER = new SimpleScheduler;


/**
 * Handles the execution of scheduled tasks, each of which may be an
 * asynchronous operation. The control flow will ensure tasks are executed in
 * the order scheduled, starting each task only once those before it have
 * completed.
 *
 * Each task scheduled within this flow may return a {@link ManagedPromise} to
 * indicate it is an asynchronous operation. The ControlFlow will wait for such
 * promises to be resolved before marking the task as completed.
 *
 * Tasks and each callback registered on a {@link ManagedPromise} will be run
 * in their own ControlFlow frame. Any tasks scheduled within a frame will take
 * priority over previously scheduled tasks. Furthermore, if any of the tasks in
 * the frame fail, the remainder of the tasks in that frame will be discarded
 * and the failure will be propagated to the user through the callback/task's
 * promised result.
 *
 * Each time a ControlFlow empties its task queue, it will fire an
 * {@link ControlFlow.EventType.IDLE IDLE} event. Conversely, whenever
 * the flow terminates due to an unhandled error, it will remove all
 * remaining tasks in its queue and fire an
 * {@link ControlFlow.EventType.UNCAUGHT_EXCEPTION UNCAUGHT_EXCEPTION} event.
 * If there are no listeners registered with the flow, the error will be
 * rethrown to the global error handler.
 *
 * Refer to the {@link ./promise} module documentation for a detailed
 * explanation of how the ControlFlow coordinates task execution.
 *
 * @implements {Scheduler}
 * @final
 */
class ControlFlow extends events.EventEmitter {
  constructor() {
    if (!usePromiseManager()) {
      throw TypeError(
          'Cannot instantiate control flow when the promise manager has'
              + ' been disabled');
    }

    super();

    /** @private {boolean} */
    this.propagateUnhandledRejections_ = true;

    /** @private {TaskQueue} */
    this.activeQueue_ = null;

    /** @private {Set<TaskQueue>} */
    this.taskQueues_ = null;

    /**
     * Microtask that controls shutting down the control flow. Upon shut down,
     * the flow will emit an
     * {@link ControlFlow.EventType.IDLE} event. Idle events
     * always follow a brief timeout in order to catch latent errors from the
     * last completed task. If this task had a callback registered, but no
     * errback, and the task fails, the unhandled failure would not be reported
     * by the promise system until the next turn of the event loop:
     *
     *   // Schedule 1 task that fails.
     *   var result = promise.controlFlow().execute(
     *       () => promise.rejected('failed'), 'example');
     *   // Set a callback on the result. This delays reporting the unhandled
     *   // failure for 1 turn of the event loop.
     *   result.then(function() {});
     *
     * @private {MicroTask}
     */
    this.shutdownTask_ = null;

    /**
     * ID for a long running interval used to keep a Node.js process running
     * while a control flow's event loop is still working. This is a cheap hack
     * required since JS events are only scheduled to run when there is
     * _actually_ something to run. When a control flow is waiting on a task,
     * there will be nothing in the JS event loop and the process would
     * terminate without this.
     * @private
     */
    this.hold_ = null;
  }

  /**
   * Returns a string representation of this control flow, which is its current
   * {@linkplain #getSchedule() schedule}, sans task stack traces.
   * @return {string} The string representation of this control flow.
   * @override
   */
  toString() {
    return this.getSchedule();
  }

  /**
   * Sets whether any unhandled rejections should propagate up through the
   * control flow stack and cause rejections within parent tasks. If error
   * propagation is disabled, tasks will not be aborted when an unhandled
   * promise rejection is detected, but the rejection _will_ trigger an
   * {@link ControlFlow.EventType.UNCAUGHT_EXCEPTION} event.
   *
   * The default behavior is to propagate all unhandled rejections. _The use
   * of this option is highly discouraged._
   *
   * @param {boolean} propagate whether to propagate errors.
   */
  setPropagateUnhandledRejections(propagate) {
    this.propagateUnhandledRejections_ = propagate;
  }

  /**
   * @return {boolean} Whether this flow is currently idle.
   */
  isIdle() {
    return !this.shutdownTask_ && (!this.taskQueues_ || !this.taskQueues_.size);
  }

  /**
   * Resets this instance, clearing its queue and removing all event listeners.
   */
  reset() {
    this.cancelQueues_(new FlowResetError);
    this.emit(ControlFlow.EventType.RESET);
    this.removeAllListeners();
    this.cancelShutdown_();
  }

  /**
   * Generates an annotated string describing the internal state of this control
   * flow, including the currently executing as well as pending tasks. If
   * {@code opt_includeStackTraces === true}, the string will include the
   * stack trace from when each task was scheduled.
   * @param {string=} opt_includeStackTraces Whether to include the stack traces
   * from when each task was scheduled. Defaults to false.
   * @return {string} String representation of this flow's internal state.
   */
  getSchedule(opt_includeStackTraces) {
    var ret = 'ControlFlow::' + getUid(this);
    var activeQueue = this.activeQueue_;
    if (!this.taskQueues_ || !this.taskQueues_.size) {
      return ret;
    }
    var childIndent = '| ';
    for (var q of this.taskQueues_) {
      ret += '\n' + printQ(q, childIndent);
    }
    return ret;

    function printQ(q, indent) {
      var ret = q.toString();
      if (q === activeQueue) {
        ret = '(active) ' + ret;
      }
      var prefix = indent + childIndent;
      if (q.pending_) {
        if (q.pending_.q.state_ !== TaskQueueState.FINISHED) {
          ret += '\n' + prefix + '(pending) ' + q.pending_.task;
          ret += '\n' + printQ(q.pending_.q, prefix + childIndent);
        } else {
          ret += '\n' + prefix + '(blocked) ' + q.pending_.task;
        }
      }
      if (q.interrupts_) {
        q.interrupts_.forEach((task) => {
          ret += '\n' + prefix + task;
        });
      }
      if (q.tasks_) {
        q.tasks_.forEach((task) => ret += printTask(task, '\n' + prefix));
      }
      return indent + ret;
    }

    function printTask(task, prefix) {
      var ret = prefix + task;
      if (opt_includeStackTraces && task.promise.stack_) {
        ret += prefix + childIndent
            + (task.promise.stack_.stack || task.promise.stack_)
                  .replace(/\n/g, prefix);
      }
      return ret;
    }
  }

  /**
   * Returns the currently active task queue for this flow. If there is no
   * active queue, one will be created.
   * @return {!TaskQueue} the currently active task queue for this flow.
   * @private
   */
  getActiveQueue_() {
    if (this.activeQueue_) {
      return this.activeQueue_;
    }

    this.activeQueue_ = new TaskQueue(this);
    if (!this.taskQueues_) {
      this.taskQueues_ = new Set();
    }
    this.taskQueues_.add(this.activeQueue_);
    this.activeQueue_
        .once('end', this.onQueueEnd_, this)
        .once('error', this.onQueueError_, this);

    asyncRun(() => this.activeQueue_ = null);
    this.activeQueue_.start();
    return this.activeQueue_;
  }

  /** @override */
  execute(fn, opt_description) {
    if (isGenerator(fn)) {
      let original = fn;
      fn = () => consume(original);
    }

    if (!this.hold_) {
      let holdIntervalMs = 2147483647;  // 2^31-1; max timer length for Node.js
      this.hold_ = setInterval(function() {}, holdIntervalMs);
    }

    let task = new Task(
        this, fn, opt_description || '<anonymous>',
        {name: 'Task', top: ControlFlow.prototype.execute},
        true);

    let q = this.getActiveQueue_();

    for (let i = q.tasks_.length; i > 0; i--) {
      let previousTask = q.tasks_[i - 1];
      if (previousTask.userTask_) {
        FLOW_LOG.warning(() => {
          return `Detected scheduling of an unchained task.
When the promise manager is disabled, unchained tasks will not wait for
previously scheduled tasks to finish before starting to execute.
New task: ${task.promise.stack_.stack}
Previous task: ${previousTask.promise.stack_.stack}`.split(/\n/).join('\n    ');
        });
        break;
      }
    }

    q.enqueue(task);
    this.emit(ControlFlow.EventType.SCHEDULE_TASK, task.description);
    return task.promise;
  }

  /** @override */
  promise(resolver) {
    return new ManagedPromise(resolver, this, SKIP_LOG);
  }

  /** @override */
  timeout(ms, opt_description) {
    return this.execute(() => {
      return this.promise(resolve => setTimeout(() => resolve(), ms));
    }, opt_description);
  }

  /** @override */
  wait(condition, opt_timeout, opt_message) {
    return scheduleWait(this, condition, opt_timeout, opt_message);
  }

  /**
   * Executes a function in the next available turn of the JavaScript event
   * loop. This ensures the function runs with its own task queue and any
   * scheduled tasks will run in "parallel" to those scheduled in the current
   * function.
   *
   *     flow.execute(() => console.log('a'));
   *     flow.execute(() => console.log('b'));
   *     flow.execute(() => console.log('c'));
   *     flow.async(() => {
   *        flow.execute(() => console.log('d'));
   *        flow.execute(() => console.log('e'));
   *     });
   *     flow.async(() => {
   *        flow.execute(() => console.log('f'));
   *        flow.execute(() => console.log('g'));
   *     });
   *     flow.once('idle', () => console.log('fin'));
   *     // a
   *     // d
   *     // f
   *     // b
   *     // e
   *     // g
   *     // c
   *     // fin
   *
   * If the function itself throws, the error will be treated the same as an
   * unhandled rejection within the control flow.
   *
   * __NOTE__: This function is considered _unstable_.
   *
   * @param {!Function} fn The function to execute.
   * @param {Object=} opt_self The object in whose context to run the function.
   * @param {...*} var_args Any arguments to pass to the function.
   */
  async(fn, opt_self, var_args) {
    asyncRun(() => {
      // Clear any lingering queues, forces getActiveQueue_ to create a new one.
      this.activeQueue_ = null;
      var q = this.getActiveQueue_();
      try {
        q.execute_(fn.bind(opt_self, var_args));
      } catch (ex) {
        var cancellationError = CancellationError.wrap(ex,
            'Function passed to ControlFlow.async() threw');
        cancellationError.silent_ = true;
        q.abort_(cancellationError);
      } finally {
        this.activeQueue_ = null;
      }
    });
  }

  /**
   * Event handler for when a task queue is exhausted. This starts the shutdown
   * sequence for this instance if there are no remaining task queues: after
   * one turn of the event loop, this object will emit the
   * {@link ControlFlow.EventType.IDLE IDLE} event to signal
   * listeners that it has completed. During this wait, if another task is
   * scheduled, the shutdown will be aborted.
   *
   * @param {!TaskQueue} q the completed task queue.
   * @private
   */
  onQueueEnd_(q) {
    if (!this.taskQueues_) {
      return;
    }
    this.taskQueues_.delete(q);

    vlog(1, () => q + ' has finished');
    vlog(1, () => this.taskQueues_.size + ' queues remain\n' + this, this);

    if (!this.taskQueues_.size) {
      if (this.shutdownTask_) {
        throw Error('Already have a shutdown task??');
      }
      vlog(1, () => 'Scheduling shutdown\n' + this);
      this.shutdownTask_ = new MicroTask(() => this.shutdown_());
    }
  }

  /**
   * Event handler for when a task queue terminates with an error. This triggers
   * the cancellation of all other task queues and a
   * {@link ControlFlow.EventType.UNCAUGHT_EXCEPTION} event.
   * If there are no error event listeners registered with this instance, the
   * error will be rethrown to the global error handler.
   *
   * @param {*} error the error that caused the task queue to terminate.
   * @param {!TaskQueue} q the task queue.
   * @private
   */
  onQueueError_(error, q) {
    if (this.taskQueues_) {
      this.taskQueues_.delete(q);
    }
    this.cancelQueues_(CancellationError.wrap(
        error, 'There was an uncaught error in the control flow'));
    this.cancelShutdown_();
    this.cancelHold_();

    setTimeout(() => {
      let listeners = this.listeners(ControlFlow.EventType.UNCAUGHT_EXCEPTION);
      if (!listeners.size) {
        throw error;
      } else {
        this.reportUncaughtException_(error);
      }
    }, 0);
  }

  /**
   * Cancels all remaining task queues.
   * @param {!CancellationError} reason The cancellation reason.
   * @private
   */
  cancelQueues_(reason) {
    reason.silent_ = true;
    if (this.taskQueues_) {
      for (var q of this.taskQueues_) {
        q.removeAllListeners();
        q.abort_(reason);
      }
      this.taskQueues_.clear();
      this.taskQueues_ = null;
    }
  }

  /**
   * Reports an uncaught exception using a
   * {@link ControlFlow.EventType.UNCAUGHT_EXCEPTION} event.
   *
   * @param {*} e the error to report.
   * @private
   */
  reportUncaughtException_(e) {
    this.emit(ControlFlow.EventType.UNCAUGHT_EXCEPTION, e);
  }

  /** @private */
  cancelHold_() {
    if (this.hold_) {
      clearInterval(this.hold_);
      this.hold_ = null;
    }
  }

  /** @private */
  shutdown_() {
    vlog(1, () => 'Going idle: ' + this);
    this.cancelHold_();
    this.shutdownTask_ = null;
    this.emit(ControlFlow.EventType.IDLE);
  }

  /**
   * Cancels the shutdown sequence if it is currently scheduled.
   * @private
   */
  cancelShutdown_() {
    if (this.shutdownTask_) {
      this.shutdownTask_.cancel();
      this.shutdownTask_ = null;
    }
  }
}


/**
 * Events that may be emitted by an {@link ControlFlow}.
 * @enum {string}
 */
ControlFlow.EventType = {

  /** Emitted when all tasks have been successfully executed. */
  IDLE: 'idle',

  /** Emitted when a ControlFlow has been reset. */
  RESET: 'reset',

  /** Emitted whenever a new task has been scheduled. */
  SCHEDULE_TASK: 'scheduleTask',

  /**
   * Emitted whenever a control flow aborts due to an unhandled promise
   * rejection. This event will be emitted along with the offending rejection
   * reason. Upon emitting this event, the control flow will empty its task
   * queue and revert to its initial state.
   */
  UNCAUGHT_EXCEPTION: 'uncaughtException'
};


/**
 * Wraps a function to execute as a cancellable micro task.
 * @final
 */
class MicroTask {
  /**
   * @param {function()} fn The function to run as a micro task.
   */
  constructor(fn) {
    /** @private {boolean} */
    this.cancelled_ = false;
    asyncRun(() => {
      if (!this.cancelled_) {
        fn();
      }
    });
  }

  /**
   * Runs the given function after a microtask yield.
   * @param {function()} fn The function to run.
   */
  static run(fn) {
    NativePromise.resolve().then(function() {
      try {
        fn();
      } catch (ignored) {
        // Do nothing.
      }
    });
  }

  /**
   * Cancels the execution of this task. Note: this will not prevent the task
   * timer from firing, just the invocation of the wrapped function.
   */
  cancel() {
    this.cancelled_ = true;
  }
}


/**
 * A task to be executed by a {@link ControlFlow}.
 *
 * @template T
 * @final
 */
class Task extends Deferred {
  /**
   * @param {!ControlFlow} flow The flow this instances belongs
   *     to.
   * @param {function(): (T|!ManagedPromise<T>)} fn The function to
   *     call when the task executes. If it returns a
   *     {@link ManagedPromise}, the flow will wait for it to be
   *     resolved before starting the next task.
   * @param {string} description A description of the task for debugging.
   * @param {{name: string, top: !Function}=} opt_stackOptions Options to use
   *     when capturing the stacktrace for when this task was created.
   * @param {boolean=} opt_isUserTask Whether this task was explicitly scheduled
   *     by the use of the promise manager.
   */
  constructor(flow, fn, description, opt_stackOptions, opt_isUserTask) {
    super(flow, SKIP_LOG);
    getUid(this);

    /** @type {function(): (T|!ManagedPromise<T>)} */
    this.execute = fn;

    /** @type {string} */
    this.description = description;

    /** @type {TaskQueue} */
    this.queue = null;

    /** @private @const {boolean} */
    this.userTask_ = !!opt_isUserTask;

    /**
     * Whether this task is considered block. A blocked task may be registered
     * in a task queue, but will be dropped if it is still blocked when it
     * reaches the front of the queue. A dropped task may always be rescheduled.
     *
     * Blocked tasks are used when a callback is attached to an unsettled
     * promise to reserve a spot in line (in a manner of speaking). If the
     * promise is not settled before the callback reaches the front of the
     * of the queue, it will be dropped. Once the promise is settled, the
     * dropped task will be rescheduled as an interrupt on the currently task
     * queue.
     *
     * @type {boolean}
     */
    this.blocked = false;

    if (opt_stackOptions) {
      this.promise.stack_ = captureStackTrace(
          opt_stackOptions.name, this.description, opt_stackOptions.top);
    }
  }

  /** @override */
  toString() {
    return 'Task::' + getUid(this) + '<' + this.description + '>';
  }
}


/** @enum {string} */
const TaskQueueState = {
  NEW: 'new',
  STARTED: 'started',
  FINISHED: 'finished'
};


/**
 * @final
 */
class TaskQueue extends events.EventEmitter {
  /** @param {!ControlFlow} flow . */
  constructor(flow) {
    super();

    /** @private {string} */
    this.name_ = 'TaskQueue::' + getUid(this);

    /** @private {!ControlFlow} */
    this.flow_ = flow;

    /** @private {!Array<!Task>} */
    this.tasks_ = [];

    /** @private {Array<!Task>} */
    this.interrupts_ = null;

    /** @private {({task: !Task, q: !TaskQueue}|null)} */
    this.pending_ = null;

    /** @private {TaskQueue} */
    this.subQ_ = null;

    /** @private {TaskQueueState} */
    this.state_ = TaskQueueState.NEW;

    /** @private {!Set<!ManagedPromise>} */
    this.unhandledRejections_ = new Set();
  }

  /** @override */
  toString() {
    return 'TaskQueue::' + getUid(this);
  }

  /**
   * @param {!ManagedPromise} promise .
   */
  addUnhandledRejection(promise) {
    // TODO: node 4.0.0+
    vlog(2, () => this + ' registering unhandled rejection: ' + promise, this);
    this.unhandledRejections_.add(promise);
  }

  /**
   * @param {!ManagedPromise} promise .
   */
  clearUnhandledRejection(promise) {
    var deleted = this.unhandledRejections_.delete(promise);
    if (deleted) {
      // TODO: node 4.0.0+
      vlog(2, () => this + ' clearing unhandled rejection: ' + promise, this);
    }
  }

  /**
   * Enqueues a new task for execution.
   * @param {!Task} task The task to enqueue.
   * @throws {Error} If this instance has already started execution.
   */
  enqueue(task) {
    if (this.state_ !== TaskQueueState.NEW) {
      throw Error('TaskQueue has started: ' + this);
    }

    if (task.queue) {
      throw Error('Task is already scheduled in another queue');
    }

    this.tasks_.push(task);
    task.queue = this;
    ON_CANCEL_HANDLER.set(
        task.promise,
        (e) => this.onTaskCancelled_(task, e));

    vlog(1, () => this + '.enqueue(' + task + ')', this);
    vlog(2, () => this.flow_.toString(), this);
  }

  /**
   * Schedules the callbacks registered on the given promise in this queue.
   *
   * @param {!ManagedPromise} promise the promise whose callbacks should be
   *     registered as interrupts in this task queue.
   * @throws {Error} if this queue has already finished.
   */
  scheduleCallbacks(promise) {
    if (this.state_ === TaskQueueState.FINISHED) {
      throw new Error('cannot interrupt a finished q(' + this + ')');
    }

    if (this.pending_ && this.pending_.task.promise === promise) {
      this.pending_.task.promise.queue_ = null;
      this.pending_ = null;
      asyncRun(() => this.executeNext_());
    }

    if (!promise.callbacks_) {
      return;
    }
    promise.callbacks_.forEach(function(cb) {
      cb.blocked = false;
      if (cb.queue) {
        return;
      }

      ON_CANCEL_HANDLER.set(
          cb.promise,
          (e) => this.onTaskCancelled_(cb, e));

      if (cb.queue === this && this.tasks_.indexOf(cb) !== -1) {
        return;
      }

      if (cb.queue) {
        cb.queue.dropTask_(cb);
      }

      cb.queue = this;
      if (!this.interrupts_) {
        this.interrupts_ = [];
      }
      this.interrupts_.push(cb);
    }, this);
    promise.callbacks_ = null;
    vlog(2, () => this + ' interrupted\n' + this.flow_, this);
  }

  /**
   * Starts executing tasks in this queue. Once called, no further tasks may
   * be {@linkplain #enqueue() enqueued} with this instance.
   *
   * @throws {Error} if this queue has already been started.
   */
  start() {
    if (this.state_ !== TaskQueueState.NEW) {
      throw new Error('TaskQueue has already started');
    }
    // Always asynchronously execute next, even if there doesn't look like
    // there is anything in the queue. This will catch pending unhandled
    // rejections that were registered before start was called.
    asyncRun(() => this.executeNext_());
  }

  /**
   * Aborts this task queue. If there are any scheduled tasks, they are silently
   * cancelled and discarded (their callbacks will never fire). If this queue
   * has a _pending_ task, the abortion error is used to cancel that task.
   * Otherwise, this queue will emit an error event.
   *
   * @param {*} error The abortion reason.
   * @private
   */
  abort_(error) {
    var cancellation;

    if (error instanceof FlowResetError) {
      cancellation = error;
    } else {
      cancellation = new DiscardedTaskError(error);
    }

    if (this.interrupts_ && this.interrupts_.length) {
      this.interrupts_.forEach((t) => t.reject(cancellation));
      this.interrupts_ = [];
    }

    if (this.tasks_ && this.tasks_.length) {
      this.tasks_.forEach((t) => t.reject(cancellation));
      this.tasks_ = [];
    }

    // Now that all of the remaining tasks have been silently cancelled (e.g. no
    // existing callbacks on those tasks will fire), clear the silence bit on
    // the cancellation error. This ensures additional callbacks registered in
    // the future will actually execute.
    cancellation.silent_ = false;

    if (this.pending_) {
      vlog(2, () => this + '.abort(); cancelling pending task', this);
      this.pending_.task.promise.cancel(
          /** @type {!CancellationError} */(error));

    } else {
      vlog(2, () => this + '.abort(); emitting error event', this);
      this.emit('error', error, this);
    }
  }

  /** @private */
  executeNext_() {
    if (this.state_ === TaskQueueState.FINISHED) {
      return;
    }
    this.state_ = TaskQueueState.STARTED;

    if (this.pending_ !== null || this.processUnhandledRejections_()) {
      return;
    }

    var task;
    do {
      task = this.getNextTask_();
    } while (task && !isPending(task.promise));

    if (!task) {
      this.state_ = TaskQueueState.FINISHED;
      this.tasks_ = [];
      this.interrupts_ = null;
      vlog(2, () => this + '.emit(end)', this);
      this.emit('end', this);
      return;
    }

    let result = undefined;
    this.subQ_ = new TaskQueue(this.flow_);

    this.subQ_.once('end', () => {  // On task completion.
      this.subQ_ = null;
      this.pending_ && this.pending_.task.resolve(result);
    });

    this.subQ_.once('error', e => {  // On task failure.
      this.subQ_ = null;
      if (Thenable.isImplementation(result)) {
        result.cancel(CancellationError.wrap(e));
      }
      this.pending_ && this.pending_.task.reject(e);
    });
    vlog(2, () => `${this} created ${this.subQ_} for ${task}`);

    try {
      this.pending_ = {task: task, q: this.subQ_};
      task.promise.queue_ = this;
      result = this.subQ_.execute_(task.execute);
      this.subQ_.start();
    } catch (ex) {
      this.subQ_.abort_(ex);
    }
  }

  /**
   * @param {!Function} fn .
   * @return {T} .
   * @template T
   * @private
   */
  execute_(fn) {
    try {
      activeFlows.push(this.flow_);
      this.flow_.activeQueue_ = this;
      return fn();
    } finally {
      this.flow_.activeQueue_ = null;
      activeFlows.pop();
    }
  }

  /**
   * Process any unhandled rejections registered with this task queue. If there
   * is a rejection, this queue will be aborted with the rejection error. If
   * there are multiple rejections registered, this queue will be aborted with
   * a {@link MultipleUnhandledRejectionError}.
   * @return {boolean} whether there was an unhandled rejection.
   * @private
   */
  processUnhandledRejections_() {
    if (!this.unhandledRejections_.size) {
      return false;
    }

    var errors = new Set();
    for (var rejection of this.unhandledRejections_) {
      errors.add(rejection.value_);
    }
    this.unhandledRejections_.clear();

    var errorToReport = errors.size === 1
        ? errors.values().next().value
        : new MultipleUnhandledRejectionError(errors);

    vlog(1, () => this + ' aborting due to unhandled rejections', this);
    if (this.flow_.propagateUnhandledRejections_) {
      this.abort_(errorToReport);
      return true;
    } else {
      vlog(1, 'error propagation disabled; reporting to control flow');
      this.flow_.reportUncaughtException_(errorToReport);
      return false;
    }
  }

  /**
   * @param {!Task} task The task to drop.
   * @private
   */
  dropTask_(task) {
    var index;
    if (this.interrupts_) {
      index = this.interrupts_.indexOf(task);
      if (index != -1) {
        task.queue = null;
        this.interrupts_.splice(index, 1);
        return;
      }
    }

    index = this.tasks_.indexOf(task);
    if (index != -1) {
      task.queue = null;
      this.tasks_.splice(index, 1);
    }
  }

  /**
   * @param {!Task} task The task that was cancelled.
   * @param {!CancellationError} reason The cancellation reason.
   * @private
   */
  onTaskCancelled_(task, reason) {
    if (this.pending_ && this.pending_.task === task) {
      this.pending_.q.abort_(reason);
    } else {
      this.dropTask_(task);
    }
  }

  /**
   * @return {(Task|undefined)} the next task scheduled within this queue,
   *     if any.
   * @private
   */
  getNextTask_() {
    var task = undefined;
    while (true) {
      if (this.interrupts_) {
        task = this.interrupts_.shift();
      }
      if (!task && this.tasks_) {
        task = this.tasks_.shift();
      }
      if (task && task.blocked) {
        vlog(2, () => this + ' skipping blocked task ' + task, this);
        task.queue = null;
        task = null;
        // TODO: recurse when tail-call optimization is available in node.
      } else {
        break;
      }
    }
    return task;
  }
}



/**
 * The default flow to use if no others are active.
 * @type {ControlFlow}
 */
var defaultFlow;


/**
 * A stack of active control flows, with the top of the stack used to schedule
 * commands. When there are multiple flows on the stack, the flow at index N
 * represents a callback triggered within a task owned by the flow at index
 * N-1.
 * @type {!Array<!ControlFlow>}
 */
var activeFlows = [];


/**
 * Changes the default flow to use when no others are active.
 * @param {!ControlFlow} flow The new default flow.
 * @throws {Error} If the default flow is not currently active.
 */
function setDefaultFlow(flow) {
  if (!usePromiseManager()) {
    throw Error(
        'You  may not change set the control flow when the promise'
            +' manager is disabled');
  }
  if (activeFlows.length) {
    throw Error('You may only change the default flow while it is active');
  }
  defaultFlow = flow;
}


/**
 * @return {!ControlFlow} The currently active control flow.
 * @suppress {checkTypes}
 */
function controlFlow() {
  if (!usePromiseManager()) {
    return SIMPLE_SCHEDULER;
  }

  if (activeFlows.length) {
    return activeFlows[activeFlows.length - 1];
  }

  if (!defaultFlow) {
    defaultFlow = new ControlFlow;
  }
  return defaultFlow;
}


/**
 * Creates a new control flow. The provided callback will be invoked as the
 * first task within the new flow, with the flow as its sole argument. Returns
 * a promise that resolves to the callback result.
 * @param {function(!ControlFlow)} callback The entry point
 *     to the newly created flow.
 * @return {!Thenable} A promise that resolves to the callback result.
 */
function createFlow(callback) {
  var flow = new ControlFlow;
  return flow.execute(function() {
    return callback(flow);
  });
}


/**
 * Tests is a function is a generator.
 * @param {!Function} fn The function to test.
 * @return {boolean} Whether the function is a generator.
 */
function isGenerator(fn) {
  return fn.constructor.name === 'GeneratorFunction';
}


/**
 * Consumes a {@code GeneratorFunction}. Each time the generator yields a
 * promise, this function will wait for it to be fulfilled before feeding the
 * fulfilled value back into {@code next}. Likewise, if a yielded promise is
 * rejected, the rejection error will be passed to {@code throw}.
 *
 * __Example 1:__ the Fibonacci Sequence.
 *
 *     promise.consume(function* fibonacci() {
 *       var n1 = 1, n2 = 1;
 *       for (var i = 0; i < 4; ++i) {
 *         var tmp = yield n1 + n2;
 *         n1 = n2;
 *         n2 = tmp;
 *       }
 *       return n1 + n2;
 *     }).then(function(result) {
 *       console.log(result);  // 13
 *     });
 *
 * __Example 2:__ a generator that throws.
 *
 *     promise.consume(function* () {
 *       yield promise.delayed(250).then(function() {
 *         throw Error('boom');
 *       });
 *     }).catch(function(e) {
 *       console.log(e.toString());  // Error: boom
 *     });
 *
 * @param {!Function} generatorFn The generator function to execute.
 * @param {Object=} opt_self The object to use as "this" when invoking the
 *     initial generator.
 * @param {...*} var_args Any arguments to pass to the initial generator.
 * @return {!Thenable<?>} A promise that will resolve to the
 *     generator's final result.
 * @throws {TypeError} If the given function is not a generator.
 */
function consume(generatorFn, opt_self, ...var_args) {
  if (!isGenerator(generatorFn)) {
    throw new TypeError('Input is not a GeneratorFunction: ' +
        generatorFn.constructor.name);
  }

  let ret;
  return ret = createPromise((resolve, reject) => {
    let generator = generatorFn.apply(opt_self, var_args);
    callNext();

    /** @param {*=} opt_value . */
    function callNext(opt_value) {
      pump(generator.next, opt_value);
    }

    /** @param {*=} opt_error . */
    function callThrow(opt_error) {
      pump(generator.throw, opt_error);
    }

    function pump(fn, opt_arg) {
      if (ret instanceof ManagedPromise && !isPending(ret)) {
        return;  // Deferred was cancelled; silently abort.
      }

      try {
        var result = fn.call(generator, opt_arg);
      } catch (ex) {
        reject(ex);
        return;
      }

      if (result.done) {
        resolve(result.value);
        return;
      }

      asap(result.value, callNext, callThrow);
    }
  });
}


// PUBLIC API


module.exports = {
  CancellableThenable: CancellableThenable,
  CancellationError: CancellationError,
  ControlFlow: ControlFlow,
  Deferred: Deferred,
  MultipleUnhandledRejectionError: MultipleUnhandledRejectionError,
  Thenable: Thenable,
  Promise: ManagedPromise,
  Resolver: Resolver,
  Scheduler: Scheduler,
  all: all,
  asap: asap,
  captureStackTrace: captureStackTrace,
  checkedNodeCall: checkedNodeCall,
  consume: consume,
  controlFlow: controlFlow,
  createFlow: createFlow,
  createPromise: createPromise,
  defer: defer,
  delayed: delayed,
  filter: filter,
  finally: thenFinally,
  fulfilled: fulfilled,
  fullyResolved: fullyResolved,
  isGenerator: isGenerator,
  isPromise: isPromise,
  map: map,
  rejected: rejected,
  setDefaultFlow: setDefaultFlow,
  when: when,

  /**
   * Indicates whether the promise manager is currently enabled. When disabled,
   * attempting to use the {@link ControlFlow} or {@link ManagedPromise Promise}
   * classes will generate an error.
   *
   * The promise manager is currently enabled by default, but may be disabled
   * by setting the environment variable `SELENIUM_PROMISE_MANAGER=0` or by
   * setting this property to false. Setting this property will always take
   * precedence over the use of the environment variable.
   *
   * @return {boolean} Whether the promise manager is enabled.
   * @see <https://github.com/SeleniumHQ/selenium/issues/2969>
   */
  get USE_PROMISE_MANAGER() { return usePromiseManager(); },
  set USE_PROMISE_MANAGER(/** boolean */value) { USE_PROMISE_MANAGER = value; },

  get LONG_STACK_TRACES() { return LONG_STACK_TRACES; },
  set LONG_STACK_TRACES(v) { LONG_STACK_TRACES = v; },
};
