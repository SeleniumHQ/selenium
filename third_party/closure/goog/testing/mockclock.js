/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Mock Clock implementation for working with setTimeout,
 * setInterval, clearTimeout and clearInterval within unit tests.
 *
 * Derived from jsUnitMockTimeout.js, contributed to JsUnit by
 * Pivotal Computer Systems, www.pivotalsf.com
 */

goog.setTestOnly('goog.testing.MockClock');
goog.provide('goog.testing.MockClock');

goog.require('goog.Disposable');
/** @suppress {extraRequire} */
goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.asserts');
goog.require('goog.async.nextTick');
goog.require('goog.async.run');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');



/**
 * Class for unit testing code that uses setTimeout and clearTimeout.
 *
 * NOTE: If you are using MockClock to test code that makes use of
 *       goog.fx.Animation, then you must either:
 *
 * 1. Install and dispose of the MockClock in setUpPage() and tearDownPage()
 *    respectively (rather than setUp()/tearDown()).
 *
 * or
 *
 * 2. Ensure that every test clears the animation queue by calling
 *    mockClock.tick(x) at the end of each test function (where `x` is large
 *    enough to complete all animations).
 *
 * Otherwise, if any animation is left pending at the time that
 * MockClock.dispose() is called, that will permanently prevent any future
 * animations from playing on the page.
 *
 * @param {boolean=} opt_autoInstall Install the MockClock at construction time.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.testing.MockClock = function(opt_autoInstall) {
  'use strict';
  goog.Disposable.call(this);
  /**
   * Reverse-order queue of timers to fire.
   *
   * The last item of the queue is popped off.  Insertion happens from the
   * right.  For example, the expiration times for each element of the queue
   * might be in the order 300, 200, 200.
   *
   * @type {?Array<!goog.testing.MockClock.QueueObjType_>}
   * @private
   */
  this.queue_ = [];

  /**
   * Set of timeouts that should be treated as cancelled.
   *
   * Rather than removing cancelled timers directly from the queue, this set
   * simply marks them as deleted so that they can be ignored when their
   * turn comes up.  The keys are the timeout keys that are cancelled, each
   * mapping to true.
   *
   * @private {?Object<number, boolean>}
   */
  this.deletedKeys_ = {};

  /**
   * Whether we should skip mocking Date.now().
   * @private {boolean}
   */
  this.unmockDateNow_ = false;

  if (opt_autoInstall) {
    this.install();
  }
};
goog.inherits(goog.testing.MockClock, goog.Disposable);


/**
 * @typedef {{
 *    timeoutKey: number, millis: number,
 *    runAtMillis: number, funcToCall: !Function, recurring: boolean}}
 * @private
 */
goog.testing.MockClock.QueueObjType_;

/**
 * Default wait timeout for mocking requestAnimationFrame (in milliseconds).
 *
 * @type {number}
 * @const
 */
goog.testing.MockClock.REQUEST_ANIMATION_FRAME_TIMEOUT = 20;


/**
 * ID to use for next timeout.  Timeout IDs must never be reused, even across
 * MockClock instances.
 * @public {number}
 */
goog.testing.MockClock.nextId = Math.round(Math.random() * 10000);


/**
 * Count of the number of setTimeout/setInterval/etc. calls received by this
 * instance.
 * @type {number}
 * @private
 */
goog.testing.MockClock.prototype.timeoutsMade_ = 0;


/**
 * Count of the number of timeout/interval/etc. callbacks triggered by this
 * instance.
 * @type {number}
 * @private
 */
goog.testing.MockClock.prototype.callbacksTriggered_ = 0;


/**
 * PropertyReplacer instance which overwrites and resets setTimeout,
 * setInterval, etc. or null if the MockClock is not installed.
 * @type {?goog.testing.PropertyReplacer}
 * @private
 */
goog.testing.MockClock.prototype.replacer_ = null;


/**
 * The current simulated time in milliseconds.
 * @type {number}
 * @private
 */
goog.testing.MockClock.prototype.nowMillis_ = 0;


/**
 * Additional delay between the time a timeout was set to fire, and the time
 * it actually fires.  Useful for testing workarounds for this Firefox 2 bug:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=291386
 * May be negative.
 * @type {number}
 * @private
 */
goog.testing.MockClock.prototype.timeoutDelay_ = 0;


/**
 * Whether the MockClock is allowed to use synchronous ticks.
 *
 * When this is true, MockClock will patch goog.async.run upon installation so
 * that GoogPromises can be resolved synchronously.
 * @type {boolean}
 * @private
 */
goog.testing.MockClock.prototype.isSynchronous_ = true;


/**
 * Creates an async-only MockClock that can only be ticked asynchronously.
 *
 * Async-only MockClocks rely on native Promise resolution instead of
 * patching async run behavior to force GoogPromise to resolve synchronously.
 * As a result, async MockClocks must be ticked with tickAsync() instead of
 * tick().
 *
 * Async-only MockClocks will always use the default async scheduler and will
 * never reset the async queue when uninstalled.
 *
 * @return {!goog.testing.MockClock}
 */
goog.testing.MockClock.createAsyncMockClock = function() {
  const clock = new goog.testing.MockClock();
  clock.isSynchronous_ = false;
  return clock;
};

/**
 * The real set timeout for reference.
 * @const @private {!Function}
 */
goog.testing.MockClock.REAL_SETTIMEOUT_ = goog.global.setTimeout;


/** @private {function():number} */
goog.testing.MockClock.prototype.oldGoogNow_;

/**
 * Installs the MockClock by overriding the global object's implementation of
 * setTimeout, setInterval, clearTimeout and clearInterval.
 */
goog.testing.MockClock.prototype.install = function() {
  'use strict';
  if (!this.replacer_) {
    if (goog.testing.MockClock.REAL_SETTIMEOUT_ !== goog.global.setTimeout) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
            'Non default setTimeout detected. ' +
            'Use of multiple MockClock instances or other clock mocking ' +
            'should be avoided due to unspecified behavior and ' +
            'the resulting fragility.');
      }
    }

    var r = this.replacer_ = new goog.testing.PropertyReplacer();
    r.set(goog.global, 'setTimeout', goog.bind(this.setTimeout_, this));
    r.set(goog.global, 'setInterval', goog.bind(this.setInterval_, this));
    r.set(goog.global, 'clearTimeout', goog.bind(this.clearTimeout_, this));
    r.set(goog.global, 'clearInterval', goog.bind(this.clearInterval_, this));
    if (!this.unmockDateNow_) {
      r.set(Date, 'now', goog.bind(this.getCurrentTime, this));
    }
    // goog.async.nextTick depends on various internal browser APIs
    // (setImmediate, MessageChannel, and setTimeout), but it's internal
    // implementation uses local caching which makes stubbing the browser
    // natives not feasible. Stub it directly instead.
    r.set(
        goog.async.nextTick, 'nextTickImpl',
        goog.bind(this.setImmediate_, this));
    // setImmediate is a deprecated API that does not exist in most browsers.
    // Set it in the browser supports it.
    // Preserve existing behavior of synchronous mock clocks to unconditionally
    // stub setImmediate.
    if (goog.global['setImmediate'] || this.isSynchronous_) {
      r.set(goog.global, 'setImmediate', goog.bind(this.setImmediate_, this));
    }

    if (this.isSynchronous_) {
      // goog.Promise uses goog.async.run. In order to be able to test
      // Promise-based code synchronously, we need to make sure that
      // goog.async.run uses nextTick instead of native browser Promises. Since
      // nextTick calls setImmediate, it will be synchronously executed the
      // next time the MockClock is ticked. Note that we test for the presence
      // of goog.async.run.forceNextTick to be resilient to the case where
      // tests replace goog.async.run directly.
      goog.async.run.forceNextTick &&
          goog.async.run.forceNextTick(goog.testing.MockClock.REAL_SETTIMEOUT_);
    } else {
      // Reset the scheduler in case a synchronous MockClock was previously
      // installed. Otherwise goog.Promise resolution and other work scheduled
      // with goog.async.run would be executed synchronously when ticking the
      // clock.
      goog.async.run.resetSchedulerForTest &&
          goog.async.run.resetSchedulerForTest();
    }

    // Replace the requestAnimationFrame functions.
    this.replaceRequestAnimationFrame_();

    // PropertyReplacer#set can't be called with renameable functions.
    this.oldGoogNow_ = goog.now;
    goog.now = goog.bind(this.getCurrentTime, this);
  }
};


/**
 * Unmocks the Date.now() function for tests that aren't expecting it to be
 * mocked. See b/141619890.
 * @deprecated
 */
goog.testing.MockClock.prototype.unmockDateNow = function() {
  'use strict';
  this.unmockDateNow_ = true;
  if (this.replacer_) {
    try {
      this.replacer_.restore(Date, 'now');
    } catch (e) {
      // Ignore error thrown if Date.now was not already mocked.
    }
  }
};


/**
 * Installs the mocks for requestAnimationFrame and cancelRequestAnimationFrame.
 * @private
 */
goog.testing.MockClock.prototype.replaceRequestAnimationFrame_ = function() {
  'use strict';
  var r = this.replacer_;
  var requestFuncs = [
    'requestAnimationFrame', 'webkitRequestAnimationFrame',
    'mozRequestAnimationFrame', 'oRequestAnimationFrame',
    'msRequestAnimationFrame'
  ];

  var cancelFuncs = [
    'cancelAnimationFrame', 'cancelRequestAnimationFrame',
    'webkitCancelRequestAnimationFrame', 'mozCancelRequestAnimationFrame',
    'oCancelRequestAnimationFrame', 'msCancelRequestAnimationFrame'
  ];

  for (var i = 0; i < requestFuncs.length; ++i) {
    if (goog.global && goog.global[requestFuncs[i]]) {
      r.set(
          goog.global, requestFuncs[i],
          goog.bind(this.requestAnimationFrame_, this));
    }
  }

  for (var i = 0; i < cancelFuncs.length; ++i) {
    if (goog.global && goog.global[cancelFuncs[i]]) {
      r.set(
          goog.global, cancelFuncs[i],
          goog.bind(this.cancelRequestAnimationFrame_, this));
    }
  }
};


/**
 * Removes the MockClock's hooks into the global object's functions and revert
 * to their original values.
 *
 * @param {boolean=} resetScheduler By default, a synchronous MockClock
 *     will not restore default goog.async behavior upon uninstallation and
 *     clear any pending async work. This can leave goog.Promises in a state
 *     where callbacks can never be executed. Set this flag to restore original
 *     scheduling behavior and retain the async queue. This argument is ignored
 *     for an async-only MockClock.
 */
goog.testing.MockClock.prototype.uninstall = function(resetScheduler) {
  'use strict';
  if (this.replacer_) {
    this.replacer_.reset();
    this.replacer_ = null;
    goog.now = this.oldGoogNow_;
  }

  if (this.isSynchronous_) {
    // Since async-only MockClock instances are always reset on installation,
    // they don't need to be reset when uninstalled.
    if (resetScheduler) {
      // Check for presence of resetScheduler in case users have replaced
      // goog.async.run.
      goog.async.run.resetSchedulerForTest &&
          goog.async.run.resetSchedulerForTest();
    } else {
      // If the overridden scheduler is not reset, then clear the work queue.
      // This prevents any pending goog.Promise resolution or other work
      // scheduled with goog.async.run from executing after uninstallation.
      this.resetAsyncQueue_();
    }
  }
};


/** @override */
goog.testing.MockClock.prototype.disposeInternal = function() {
  'use strict';
  this.uninstall();
  this.queue_ = null;
  this.deletedKeys_ = null;
  goog.testing.MockClock.superClass_.disposeInternal.call(this);
};


/**
 * Resets the MockClock, removing all timeouts that are scheduled and resets
 * the fake timer count.
 * @param {boolean=} retainAsyncQueue By default, a synchronous MockClock
 *     will clear any pending async work when reset. This can leave
 *     goog.Promises in a state where callbacks can never be executed. Set this
 *     flag to restore original scheduling behavior and retain the async queue.
 *     This argument is ignored for an async-only MockClock.
 */
goog.testing.MockClock.prototype.reset = function(retainAsyncQueue) {
  'use strict';
  this.queue_ = [];
  this.deletedKeys_ = {};
  this.nowMillis_ = 0;
  this.timeoutsMade_ = 0;
  this.callbacksTriggered_ = 0;
  this.timeoutDelay_ = 0;

  if (this.isSynchronous_ && !retainAsyncQueue) {
    // If the overridden scheduler is not intended to be reset, then clear the
    // work queue. This prevents any pending async work queue items from
    // executing after uninstallation.
    this.resetAsyncQueue_();
  }
};


/**
 * Resets the async queue when a synchronous MockClock resets.
 * @private
 */
goog.testing.MockClock.prototype.resetAsyncQueue_ = function() {
  'use strict';
  // Synchronous MockClock should reset the async queue so that pending tasks
  // are not executed the next time the call stack is emptied.
  goog.asserts.assert(
      this.isSynchronous_,
      'Async queue cannot be reset on async-only async MockClock.');

  goog.async.run.resetQueue();
};


/**
 * Sets the amount of time between when a timeout is scheduled to fire and when
 * it actually fires.
 * @param {number} delay The delay in milliseconds.  May be negative.
 */
goog.testing.MockClock.prototype.setTimeoutDelay = function(delay) {
  'use strict';
  this.timeoutDelay_ = delay;
};


/**
 * @return {number} delay The amount of time between when a timeout is
 *     scheduled to fire and when it actually fires, in milliseconds.  May
 *     be negative.
 */
goog.testing.MockClock.prototype.getTimeoutDelay = function() {
  'use strict';
  return this.timeoutDelay_;
};


/**
 * Increments the MockClock's time by a given number of milliseconds, running
 * any functions that are now overdue.
 * @param {number=} opt_millis Number of milliseconds to increment the counter.
 *     If not specified, clock ticks 1 millisecond.
 * @return {number} Current mock time in milliseconds.
 */
goog.testing.MockClock.prototype.tick = function(opt_millis) {
  'use strict';
  goog.asserts.assert(
      this.isSynchronous_,
      'Async MockClock does not support tick. Use tickAsync() instead.');
  if (typeof opt_millis != 'number') {
    opt_millis = 1;
  }
  if (opt_millis < 0) {
    throw new Error(
        'Time cannot go backwards (cannot tick by ' + opt_millis + ')');
  }
  var endTime = this.nowMillis_ + opt_millis;
  this.runFunctionsWithinRange_(endTime);
  // If a scheduled callback called tick() reentrantly, don't rewind time.
  this.nowMillis_ = Math.max(this.nowMillis_, endTime);
  return endTime;
};


/**
 * Takes a promise and then ticks the mock clock. If the promise successfully
 * resolves, returns the value produced by the promise. If the promise is
 * rejected, it throws the rejection as an exception. If the promise is not
 * resolved at all, throws an exception.
 * Also ticks the general clock by the specified amount.
 * Only works with goog.Thenable, hence goog.Promise. Does NOT work with native
 * browser promises.
 *
 * @param {!goog.Thenable<T>} promise A promise that should be resolved after
 *     the mockClock is ticked for the given opt_millis.
 * @param {number=} opt_millis Number of milliseconds to increment the counter.
 *     If not specified, clock ticks 1 millisecond.
 * @return {T}
 * @template T
 *
 * @deprecated Treating Promises as synchronous values is incompatible with
 *     native promises and async functions. More generally, this code relies on
 *     promises "pumped" by setTimeout which is not done in production code,
 *     even for goog.Promise and results unnatural timing between resolved
 *     promises callback and setTimeout/setInterval callbacks in tests.
 */
goog.testing.MockClock.prototype.tickPromise = function(promise, opt_millis) {
  'use strict';
  goog.asserts.assert(
      this.isSynchronous_, 'Async MockClock does not support tickPromise.');

  let value;
  let error;
  let resolved = false;
  promise.then(
      function(v) {
        'use strict';
        value = v;
        resolved = true;
      },
      function(e) {
        'use strict';
        error = e;
        resolved = true;
      });
  this.tick(opt_millis);
  if (!resolved) {
    throw new Error(
        'Promise was expected to be resolved after mock clock tick.');
  }
  if (error) {
    throw error;
  }
  return value;
};


/**
 * @return {number} The number of timeouts or intervals that have been
 * scheduled. A setInterval call is only counted once.
 */
goog.testing.MockClock.prototype.getTimeoutsMade = function() {
  'use strict';
  return this.timeoutsMade_;
};


/**
 * @return {number} The number of timeout or interval callbacks that have been
 * triggered. For setInterval, each callback is counted separately.
 */
goog.testing.MockClock.prototype.getCallbacksTriggered = function() {
  'use strict';
  return this.callbacksTriggered_;
};


/**
 * @return {number} The MockClock's current time in milliseconds.
 */
goog.testing.MockClock.prototype.getCurrentTime = function() {
  'use strict';
  return this.nowMillis_;
};


/**
 * @param {number} timeoutKey The timeout key.
 * @return {boolean} Whether the timer has been set and not cleared,
 *     independent of the timeout's expiration.  In other words, the timeout
 *     could have passed or could be scheduled for the future.  Either way,
 *     this function returns true or false depending only on whether the
 *     provided timeoutKey represents a timeout that has been set and not
 *     cleared.
 */
goog.testing.MockClock.prototype.isTimeoutSet = function(timeoutKey) {
  'use strict';
  return timeoutKey < goog.testing.MockClock.nextId &&
      timeoutKey >= goog.testing.MockClock.nextId - this.timeoutsMade_ &&
      !this.deletedKeys_[timeoutKey];
};


/**
 * Whether the MockClock is configured to run synchronously.
 *
 * This allows MockClock consumers to decide whether to tick synchronously or
 * asynchronously.
 * @return {boolean}
 */
goog.testing.MockClock.prototype.isSynchronous = function() {
  return this.isSynchronous_;
};


/**
 * Runs any function that is scheduled before a certain time.  Timeouts can
 * be made to fire early or late if timeoutDelay_ is non-0.
 * @param {number} endTime The latest time in the range, in milliseconds.
 * @private
 */
goog.testing.MockClock.prototype.runFunctionsWithinRange_ = function(endTime) {
  'use strict';
  // Repeatedly pop off the last item since the queue is always sorted.
  while (this.hasQueuedEntriesBefore_(endTime)) {
    this.runNextQueuedTimeout_();
  }
};


/**
 * Increments the MockClock's time by a given number of milliseconds, running
 * any functions that are now overdue.
 * @param {number=} millis Number of milliseconds to increment the counter.
 *     If not specified, clock ticks 1 millisecond.
 * @return {!Promise<number>} Current mock time in milliseconds.
 */
goog.testing.MockClock.prototype.tickAsync = async function(millis = 1) {
  if (millis < 0) {
    throw new Error(`Time cannot go backwards (cannot tick by ${millis})`);
  }
  const endTime = this.nowMillis_ + millis;
  await this.runFunctionsWithinRangeAsync_(endTime);
  // If a scheduled callback called tick() reentrantly, don't rewind time.
  this.nowMillis_ = Math.max(this.nowMillis_, endTime);
  return endTime;
};


/**
 * Asynchronously increments the MockClock's time by a given number of
 * milliseconds, returning the settled promise value.
 * @param {number} millis Number of milliseconds to increment the counter.
 * @param {!goog.Thenable<T>} promise A promise that should be resolved after
 *     the mockClock is ticked for the given opt_millis.
 * @return {!Promise<T>} Resolved promise value.
 * @throws {!goog.asserts.AssertionError} when the promise is not resolved after
 *     ticking.
 * @throws {*} when the promise is rejected.
 * @template T
 */
goog.testing.MockClock.prototype.tickAsyncMustSettlePromise =
    async function(millis, promise) {
  goog.asserts.assert(
      !this.isSynchronous_,
      'Synchronous MockClock does not support tickAsyncMustSettlePromise.');

  let settled = false;
  let value;
  let error;
  promise.then(
      (v) => {
        settled = true;
        value = v;
      },
      (e) => {
        settled = true;
        error = e;
      });
  await this.tickAsync(millis);
  goog.asserts.assert(
      settled, 'Promise was expected to be resolved after mock clock tick.');
  if (error !== undefined) {
    throw error;
  }
  return value;
};


/**
 * Instantly adjusts the clock's current time to a new timestamp. Unlike tick(),
 * this method skips over the intervening time, so that `setInterval()` calls or
 * recurring `setTimeout()`s will only run once.
 *
 * This mimics the behavior of setting the system clock, rather than waiting for
 * time to pass.
 *
 * CAUTION: This is an advanced feature.  Use this method to set the clock to be
 * a specific date, which is much faster than calling tick() with a large value.
 * This lets you test code against arbitrary dates.
 *
 * MOE:begin_strip
 * See go/mockclock-time-travel for how & why to use this method.
 * MOE:end_strip
 *
 * @param {!Date} newDate The new timestamp to set the clock to.
 * @return {!Promise}
 */
goog.testing.MockClock.prototype.doTimeWarpAsync = async function(newDate) {
  goog.asserts.assertInstanceof(
      newDate, Date,
      'doTimeWarpAsync() only accepts dates.  Use tickAsync() instead.');
  if (+newDate < this.nowMillis_) {
    throw new Error(`Time cannot go backwards (cannot time warp from ${
        new Date(this.nowMillis_)} to ${newDate})`);
  }
  // Adjust the clock before calling the functions, so that they schedule future
  // callbacks from the new time.
  this.nowMillis_ = +newDate;
  await this.runFunctionsWithinRangeAsync_(this.nowMillis_);
};


/**
 * Like runFunctionsWithinRange, but pauses to allow native promise callbacks to
 * run correctly.
 * @param {number} endTime The latest time in the range, in milliseconds.
 * @return {!Promise}
 * @private
 */
goog.testing.MockClock.prototype.runFunctionsWithinRangeAsync_ =
    async function(endTime) {
  'use strict';
  // Let native promises set timers before we start ticking.
  await goog.testing.MockClock.flushMicroTasks_();

  // Repeatedly pop off the last item since the queue is always sorted.
  while (this.hasQueuedEntriesBefore_(endTime)) {
    if (this.runNextQueuedTimeout_()) {
      await goog.testing.MockClock.flushMicroTasks_();
    }
  }
};


/**
 * Pauses asynchronously to run all promise callbacks in the microtask queue.
 *
 * This is optimized to be correct, but to also not be too slow in IE.  It waits
 * for up to 50 chained `then()` callbacks at once. Microtasks callbacks are run
 * in batches, so a series of `then()` callbacks scheduled at the same time will
 * run at once.  The loop is only necessary for to run very deep promise chains.
 *
 * Using `setTimeout()`, `setImmediate()`, or a polyfill would make this better,
 * but also makes it 15x slower in IE.  Without IE, setImmediate and polyfill is
 * best option.
 * @private
 */
goog.testing.MockClock.flushMicroTasks_ = async function() {
  'use strict';
  for (var i = 0; i < 50; i++) {
    await Promise.resolve();
  }
};


/**
 * @param {number} endTime The latest time in the range, in milliseconds.
 * @return {boolean}
 * @private
 */
goog.testing.MockClock.prototype.hasQueuedEntriesBefore_ = function(endTime) {
  'use strict';
  var adjustedEndTime = endTime - this.timeoutDelay_;
  return !!this.queue_ && !!this.queue_.length &&
      this.queue_[this.queue_.length - 1].runAtMillis <= adjustedEndTime;
};


/**
 * Runs the next timeout in the queue, advancing the clock.
 * @return {boolean} False if the timeout was cancelled (and nothing happened).
 * @private
 */
goog.testing.MockClock.prototype.runNextQueuedTimeout_ = function() {
  'use strict';
  var timeout = this.queue_.pop();

  if (timeout.timeoutKey in this.deletedKeys_) return false;

  // Only move time forwards.
  this.nowMillis_ =
      Math.max(this.nowMillis_, timeout.runAtMillis + this.timeoutDelay_);
  // Call timeout in global scope and pass the timeout key as the argument.
  this.callbacksTriggered_++;
  timeout.funcToCall.call(goog.global, timeout.timeoutKey);
  // In case the interval was cleared in the funcToCall
  if (timeout.recurring) {
    this.scheduleFunction_(
        timeout.timeoutKey, timeout.funcToCall, timeout.millis, true);
  }
  return true;
};


/**
 * Schedules a function to be run at a certain time.
 * @param {number} timeoutKey The timeout key.
 * @param {!Function} funcToCall The function to call.
 * @param {number} millis The number of milliseconds to call it in.
 * @param {boolean} recurring Whether to function call should recur.
 * @private
 */
goog.testing.MockClock.prototype.scheduleFunction_ = function(
    timeoutKey, funcToCall, millis, recurring) {
  'use strict';
  if (typeof funcToCall !== 'function') {
    // Early error for debuggability rather than dying in the next .tick()
    throw new TypeError(
        'The provided callback must be a function, not a ' + typeof funcToCall);
  }

  var /** !goog.testing.MockClock.QueueObjType_ */ timeout = {
    runAtMillis: this.nowMillis_ + millis,
    funcToCall: funcToCall,
    recurring: recurring,
    timeoutKey: timeoutKey,
    millis: millis
  };

  goog.testing.MockClock.insert_(timeout, goog.asserts.assert(this.queue_));
};


/**
 * Inserts a timer descriptor into a descending-order queue.
 *
 * Later-inserted duplicates appear at lower indices.  For example, the
 * asterisk in (5,4,*,3,2,1) would be the insertion point for 3.
 *
 * @param {!goog.testing.MockClock.QueueObjType_} timeout The timeout to insert,
 *     with numerical runAtMillis property.
 * @param {!Array<!goog.testing.MockClock.QueueObjType_>} queue The queue to
 *     insert into, with each element having a numerical runAtMillis property.
 * @private
 */
goog.testing.MockClock.insert_ = function(timeout, queue) {
  'use strict';
  // Although insertion of N items is quadratic, requiring goog.structs.Heap
  // from a unit test will make tests more prone to breakage.  Since unit
  // tests are normally small, scalability is not a primary issue.

  // Find an insertion point.  Since the queue is in reverse order (so we
  // can pop rather than unshift), and later timers with the same time stamp
  // should be executed later, we look for the element strictly greater than
  // the one we are inserting.

  for (var i = queue.length; i != 0; i--) {
    if (queue[i - 1].runAtMillis > timeout.runAtMillis) {
      break;
    }
    queue[i] = queue[i - 1];
  }

  queue[i] = timeout;
};


/**
 * Maximum 32-bit signed integer.
 *
 * Timeouts over this time return immediately in many browsers, due to integer
 * overflow.  Such known browsers include Firefox, Chrome, and Safari, but not
 * IE.
 *
 * @type {number}
 * @private
 */
goog.testing.MockClock.MAX_INT_ = 2147483647;


/**
 * Schedules a function to be called after `millis` milliseconds.
 * Mock implementation for setTimeout.
 * @param {!Function} funcToCall The function to call.
 * @param {number=} opt_millis The number of milliseconds to call it after.
 * @return {number} The number of timeouts created.
 * @private
 */
goog.testing.MockClock.prototype.setTimeout_ = function(
    funcToCall, opt_millis) {
  'use strict';
  var millis = opt_millis || 0;
  if (millis > goog.testing.MockClock.MAX_INT_) {
    throw new Error(
        'Bad timeout value: ' + millis + '.  Timeouts over MAX_INT ' +
        '(24.8 days) cause timeouts to be fired ' +
        'immediately in most browsers, except for IE.');
  }
  this.timeoutsMade_++;
  this.scheduleFunction_(
      goog.testing.MockClock.nextId, funcToCall, millis, false);
  return goog.testing.MockClock.nextId++;
};


/**
 * Schedules a function to be called every `millis` milliseconds.
 * Mock implementation for setInterval.
 * @param {!Function} funcToCall The function to call.
 * @param {number=} opt_millis The number of milliseconds between calls.
 * @return {number} The number of timeouts created.
 * @private
 */
goog.testing.MockClock.prototype.setInterval_ = function(
    funcToCall, opt_millis) {
  'use strict';
  var millis = opt_millis || 0;
  this.timeoutsMade_++;
  this.scheduleFunction_(
      goog.testing.MockClock.nextId, funcToCall, millis, true);
  return goog.testing.MockClock.nextId++;
};


/**
 * Schedules a function to be called when an animation frame is triggered.
 * Mock implementation for requestAnimationFrame.
 * @param {!Function} funcToCall The function to call.
 * @return {number} The number of timeouts created.
 * @private
 */
goog.testing.MockClock.prototype.requestAnimationFrame_ = function(funcToCall) {
  'use strict';
  return this.setTimeout_(goog.bind(function() {
    'use strict';
    if (funcToCall) {
      funcToCall(this.getCurrentTime());
    } else if (goog.global.mozRequestAnimationFrame) {
      var event = new goog.testing.events.Event('MozBeforePaint', goog.global);
      event['timeStamp'] = this.getCurrentTime();
      goog.testing.events.fireBrowserEvent(event);
    }
  }, this), goog.testing.MockClock.REQUEST_ANIMATION_FRAME_TIMEOUT);
};


/**
 * Schedules a function to be called immediately after the current JS
 * execution.
 * Mock implementation for setImmediate.
 * @param {!Function} funcToCall The function to call.
 * @return {number} The number of timeouts created.
 * @private
 */
goog.testing.MockClock.prototype.setImmediate_ = function(funcToCall) {
  'use strict';
  return this.setTimeout_(funcToCall, 0);
};


/**
 * Clears a timeout.
 * Mock implementation for clearTimeout.
 * @param {number} timeoutKey The timeout key to clear.
 * @private
 */
goog.testing.MockClock.prototype.clearTimeout_ = function(timeoutKey) {
  'use strict';
  // Some common libraries register static state with timers.
  // This is bad. It leads to all sorts of crazy test problems where
  // 1) Test A sets up a new mock clock and a static timer.
  // 2) Test B sets up a new mock clock, but re-uses the static timer
  //    from Test A.
  // 3) A timeout key from test A gets cleared, breaking a timeout in
  //    Test B.
  //
  // For now, we just hackily fail silently if someone tries to clear a timeout
  // key before we've allocated it.
  // Ideally, we should throw an exception if we see this happening.
  if (this.isTimeoutSet(timeoutKey)) {
    this.deletedKeys_[timeoutKey] = true;
  }
};


/**
 * Clears an interval.
 * Mock implementation for clearInterval.
 * @param {number} timeoutKey The interval key to clear.
 * @private
 */
goog.testing.MockClock.prototype.clearInterval_ = function(timeoutKey) {
  'use strict';
  this.clearTimeout_(timeoutKey);
};


/**
 * Clears a requestAnimationFrame.
 * Mock implementation for cancelRequestAnimationFrame.
 * @param {number} timeoutKey The requestAnimationFrame key to clear.
 * @private
 */
goog.testing.MockClock.prototype.cancelRequestAnimationFrame_ = function(
    timeoutKey) {
  'use strict';
  this.clearTimeout_(timeoutKey);
};
