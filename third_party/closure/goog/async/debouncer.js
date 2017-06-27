// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Definition of the goog.async.Debouncer class.
 *
 * @see ../demos/timers.html
 */

goog.provide('goog.async.Debouncer');

goog.require('goog.Disposable');
goog.require('goog.Timer');



/**
 * Debouncer will perform a specified action exactly once for any sequence of
 * signals fired repeatedly so long as they are fired less than a specified
 * interval apart (in milliseconds). Whether it receives one signal or multiple,
 * it will always wait until a full interval has elapsed since the last signal
 * before performing the action.
 * @param {function(this: T, ...?)} listener Function to callback when the
 *     action is triggered.
 * @param {number} interval Interval over which to debounce. The listener will
 *     only be called after the full interval has elapsed since the last signal.
 * @param {T=} opt_handler Object in whose scope to call the listener.
 * @constructor
 * @struct
 * @extends {goog.Disposable}
 * @final
 * @template T
 */
goog.async.Debouncer = function(listener, interval, opt_handler) {
  goog.async.Debouncer.base(this, 'constructor');

  /**
   * Function to callback
   * @const @private {function(this: T, ...?)}
   */
  this.listener_ =
      opt_handler != null ? goog.bind(listener, opt_handler) : listener;

  /**
   * Interval for the debounce time
   * @const @private {number}
   */
  this.interval_ = interval;

  /**
   * Cached callback function invoked after the debounce timeout completes
   * @const @private {!Function}
   */
  this.callback_ = goog.bind(this.onTimer_, this);

  /**
   * Indicates that the action is pending and needs to be fired.
   * @private {boolean}
   */
  this.shouldFire_ = false;

  /**
   * Indicates the count of nested pauses currently in effect on the debouncer.
   * When this count is not zero, fired actions will be postponed until the
   * debouncer is resumed enough times to drop the pause count to zero.
   * @private {number}
   */
  this.pauseCount_ = 0;

  /**
   * Timer for scheduling the next callback
   * @private {?number}
   */
  this.timer_ = null;

  /**
   * When set this is a timestamp. On the onfire we want to reschedule the
   * callback so it ends up at this time.
   * @private {?number}
   */
  this.refireAt_ = null;

  /**
   * The last arguments passed into {@code fire}.
   * @private {!IArrayLike}
   */
  this.args_ = [];
};
goog.inherits(goog.async.Debouncer, goog.Disposable);


/**
 * Notifies the debouncer that the action has happened. It will debounce the
 * call so that the callback is only called after the last action in a sequence
 * of actions separated by periods less the interval parameter passed to the
 * constructor, passing the arguments from the last call of this function into
 * the debounced function.
 * @param {...?} var_args Arguments to pass on to the debounced function.
 */
goog.async.Debouncer.prototype.fire = function(var_args) {
  this.args_ = arguments;
  // When this method is called, we need to prevent fire() calls from within the
  // previous interval from calling the callback. The simplest way of doing this
  // is to call this.stop() which calls clearTimeout, and then reschedule the
  // timeout. However clearTimeout and setTimeout are expensive, so we just
  // leave them untouched and when they do happen we potentially reschedule.
  this.shouldFire_ = false;
  if (this.timer_) {
    this.refireAt_ = goog.now() + this.interval_;
    return;
  }
  this.timer_ = goog.Timer.callOnce(this.callback_, this.interval_);
};


/**
 * Cancels any pending action callback. The debouncer can be restarted by
 * calling {@link #fire}.
 */
goog.async.Debouncer.prototype.stop = function() {
  if (this.timer_) {
    goog.Timer.clear(this.timer_);
    this.timer_ = null;
  }
  this.refireAt_ = null;
  this.shouldFire_ = false;
  this.args_ = [];
};


/**
 * Pauses the debouncer. All pending and future action callbacks will be delayed
 * until the debouncer is resumed. Pauses can be nested.
 */
goog.async.Debouncer.prototype.pause = function() {
  ++this.pauseCount_;
};


/**
 * Resumes the debouncer. If doing so drops the pausing count to zero, pending
 * action callbacks will be executed as soon as possible, but still no sooner
 * than an interval's delay after the previous call. Future action callbacks
 * will be executed as normal.
 */
goog.async.Debouncer.prototype.resume = function() {
  if (!this.pauseCount_) {
    return;
  }

  --this.pauseCount_;
  if (!this.pauseCount_ && this.shouldFire_) {
    this.doAction_();
  }
};


/** @override */
goog.async.Debouncer.prototype.disposeInternal = function() {
  this.stop();
  goog.async.Debouncer.base(this, 'disposeInternal');
};


/**
 * Handler for the timer to fire the debouncer.
 * @private
 */
goog.async.Debouncer.prototype.onTimer_ = function() {
  // There is a newer call to fire() within the debounce interval.
  // Reschedule the callback and return.
  if (this.refireAt_) {
    this.timer_ =
        goog.Timer.callOnce(this.callback_, this.refireAt_ - goog.now());
    this.refireAt_ = null;
    return;
  }
  this.timer_ = null;

  if (!this.pauseCount_) {
    this.doAction_();
  } else {
    this.shouldFire_ = true;
  }
};


/**
 * Calls the callback.
 * @private
 */
goog.async.Debouncer.prototype.doAction_ = function() {
  this.shouldFire_ = false;
  this.listener_.apply(null, this.args_);
};
