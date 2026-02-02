/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */
goog.module('goog.async.run');
goog.module.declareLegacyNamespace();

const WorkQueue = goog.require('goog.async.WorkQueue');
const asyncStackTag = goog.require('goog.debug.asyncStackTag');
const nextTick = goog.require('goog.async.nextTick');
const throwException = goog.require('goog.async.throwException');

/**
 * @define {boolean} If true, use the global Promise to implement run
 * assuming either the native, or polyfill version will be used. Does still
 * permit tests to use forceNextTick.
 */
goog.ASSUME_NATIVE_PROMISE = goog.define('goog.ASSUME_NATIVE_PROMISE', false);

/**
 * The function used to schedule work asynchronousely.
 * @private {function()}
 */
let schedule;

/** @private {boolean} */
let workQueueScheduled = false;

/** @type {!WorkQueue} */
let workQueue = new WorkQueue();

/**
 * Fires the provided callback just before the current callstack unwinds, or as
 * soon as possible after the current JS execution context.
 * @param {function(this:THIS)} callback
 * @param {THIS=} context Object to use as the "this value" when calling the
 *     provided function.
 * @template THIS
 */
let run = (callback, context = undefined) => {
  if (!schedule) {
    initializeRunner();
  }
  if (!workQueueScheduled) {
    // Nothing is currently scheduled, schedule it now.
    schedule();
    workQueueScheduled = true;
  }
  callback = asyncStackTag.wrap(callback, 'goog.async.run');

  workQueue.add(callback, context);
};

/** Initializes the function to use to process the work queue. */
let initializeRunner = () => {
  if (goog.ASSUME_NATIVE_PROMISE ||
      (goog.global.Promise && goog.global.Promise.resolve)) {
    // Use goog.global.Promise instead of just Promise because the relevant
    // externs may be missing, and don't alias it because this could confuse the
    // compiler into thinking the polyfill is required when it should be treated
    // as optional.
    const promise = goog.global.Promise.resolve(undefined);
    schedule = () => {
      promise.then(run.processWorkQueue);
    };
  } else {
    schedule = () => {
      nextTick(run.processWorkQueue);
    };
  }
};

/**
 * Forces run to use nextTick instead of Promise.
 * This should only be done in unit tests. It's useful because MockClock
 * replaces nextTick, but not the browser Promise implementation, so it allows
 * Promise-based code to be tested with MockClock.
 * However, we also want to run promises if the MockClock is no longer in
 * control so we schedule a backup "setTimeout" to the unmocked timeout if
 * provided.
 * @param {function(function())=} realSetTimeout
 */
run.forceNextTick = (realSetTimeout = undefined) => {
  schedule = () => {
    nextTick(run.processWorkQueue);
    if (realSetTimeout) {
      realSetTimeout(run.processWorkQueue);
    }
  };
};

if (goog.DEBUG) {
  /** Reset the work queue. Only available for tests in debug mode. */
  run.resetQueue = () => {
    workQueueScheduled = false;
    workQueue = new WorkQueue();
  };

  /** Resets the scheduler. Only available for tests in debug mode. */
  run.resetSchedulerForTest = () => {
    initializeRunner();
  };
}

/**
 * Run any pending run work items. This function is not intended
 * for general use, but for use by entry point handlers to run items ahead of
 * nextTick.
 */
run.processWorkQueue = () => {
  // NOTE: additional work queue items may be added while processing.
  let item = null;
  while (item = workQueue.remove()) {
    try {
      item.fn.call(item.scope);
    } catch (e) {
      throwException(e);
    }
    workQueue.returnUnused(item);
  }

  // There are no more work items, allow processing to be scheduled again.
  workQueueScheduled = false;
};

exports = run;
