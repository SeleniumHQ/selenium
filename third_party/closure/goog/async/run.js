// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.async.run');

goog.require('goog.async.WorkQueue');
goog.require('goog.async.nextTick');
goog.require('goog.async.throwException');


/**
 * Fires the provided callback just before the current callstack unwinds, or as
 * soon as possible after the current JS execution context.
 * @param {function(this:THIS)} callback
 * @param {THIS=} opt_context Object to use as the "this value" when calling
 *     the provided function.
 * @template THIS
 */
goog.async.run = function(callback, opt_context) {
  if (!goog.async.run.schedule_) {
    goog.async.run.initializeRunner_();
  }
  if (!goog.async.run.workQueueScheduled_) {
    // Nothing is currently scheduled, schedule it now.
    goog.async.run.schedule_();
    goog.async.run.workQueueScheduled_ = true;
  }

  goog.async.run.workQueue_.add(callback, opt_context);
};


/**
 * Initializes the function to use to process the work queue.
 * @private
 */
goog.async.run.initializeRunner_ = function() {
  // If native Promises are available in the browser, just schedule the callback
  // on a fulfilled promise, which is specified to be async, but as fast as
  // possible.
  if (goog.global.Promise && goog.global.Promise.resolve) {
    var promise = goog.global.Promise.resolve(undefined);
    goog.async.run.schedule_ = function() {
      promise.then(goog.async.run.processWorkQueue);
    };
  } else {
    goog.async.run.schedule_ = function() {
      goog.async.nextTick(goog.async.run.processWorkQueue);
    };
  }
};


/**
 * Forces goog.async.run to use nextTick instead of Promise.
 *
 * This should only be done in unit tests. It's useful because MockClock
 * replaces nextTick, but not the browser Promise implementation, so it allows
 * Promise-based code to be tested with MockClock.
 *
 * However, we also want to run promises if the MockClock is no longer in
 * control so we schedule a backup "setTimeout" to the unmocked timeout if
 * provided.
 *
 * @param {function(function())=} opt_realSetTimeout
 */
goog.async.run.forceNextTick = function(opt_realSetTimeout) {
  goog.async.run.schedule_ = function() {
    goog.async.nextTick(goog.async.run.processWorkQueue);
    if (opt_realSetTimeout) {
      opt_realSetTimeout(goog.async.run.processWorkQueue);
    }
  };
};


/**
 * The function used to schedule work asynchronousely.
 * @private {function()}
 */
goog.async.run.schedule_;


/** @private {boolean} */
goog.async.run.workQueueScheduled_ = false;


/** @private {!goog.async.WorkQueue} */
goog.async.run.workQueue_ = new goog.async.WorkQueue();


if (goog.DEBUG) {
  /**
   * Reset the work queue. Only available for tests in debug mode.
   */
  goog.async.run.resetQueue = function() {
    goog.async.run.workQueueScheduled_ = false;
    goog.async.run.workQueue_ = new goog.async.WorkQueue();
  };
}


/**
 * Run any pending goog.async.run work items. This function is not intended
 * for general use, but for use by entry point handlers to run items ahead of
 * goog.async.nextTick.
 */
goog.async.run.processWorkQueue = function() {
  // NOTE: additional work queue items may be added while processing.
  var item = null;
  while (item = goog.async.run.workQueue_.remove()) {
    try {
      item.fn.call(item.scope);
    } catch (e) {
      goog.async.throwException(e);
    }
    goog.async.run.workQueue_.returnUnused(item);
  }

  // There are no more work items, allow processing to be scheduled again.
  goog.async.run.workQueueScheduled_ = false;
};
