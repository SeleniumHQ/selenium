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
 * @param {function(this: T)} listener Function to callback when the action is
 *     triggered.
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
   * @private {function(this: T)}
   */
  this.listener_ = listener;

  /**
   * Interval for the debounce time
   * @type {number}
   * @private
   */
  this.interval_ = interval;

  /**
   * "this" context for the listener
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;

  /**
   * Cached callback function invoked after the debounce timeout completes
   * @type {Function}
   * @private
   */
  this.callback_ = goog.bind(this.onTimer_, this);

  /**
   * Indicates that the action is pending and needs to be fired.
   * @type {boolean}
   * @private
   */
  this.shouldFire_ = false;

  /**
   * Indicates the count of nested pauses currently in effect on the debouncer.
   * When this count is not zero, fired actions will be postponed until the
   * debouncer is resumed enough times to drop the pause count to zero.
   * @type {number}
   * @private
   */
  this.pauseCount_ = 0;

  /**
   * Timer for scheduling the next callback
   * @type {?number}
   * @private
   */
  this.timer_ = null;
};
goog.inherits(goog.async.Debouncer, goog.Disposable);


/**
 * Notifies the debouncer that the action has happened. It will debounce the
 * call so that the callback is only called after the last action in a sequence
 * of actions separated by periods less the interval parameter passed to the
 * constructor.
 */
goog.async.Debouncer.prototype.fire = function() {
  this.stop();
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
  this.shouldFire_ = false;
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
  this.listener_.call(this.handler_);
};
