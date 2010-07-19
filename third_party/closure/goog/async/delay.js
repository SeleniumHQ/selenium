// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Defines a class useful for handling functions that must be
 * invoked after a delay, especially when that delay is frequently restarted.
 * Examples include delaying before displaying a tooltip, menu hysteresis,
 * idle timers, etc.
*
 * @see ../demos/timers.html
 */


goog.provide('goog.Delay');
goog.provide('goog.async.Delay');

goog.require('goog.Disposable');
goog.require('goog.Timer');



/**
 * A Delay object invokes the associated function after a specified delay. The
 * interval duration can be specified once in the constructor, or can be defined
 * each time the delay is started. Calling start on an active delay will reset
 * the timer.
 *
 * @param {Function} listener Function to call when the delay completes.
 * @param {number=} opt_interval The default length of the invocation delay (in
 *     milliseconds).
 * @param {Object=} opt_handler The object scope to invoke the function in.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.async.Delay = function(listener, opt_interval, opt_handler) {
  /**
   * The function that will be invoked after a delay.
   * @type {Function}
   * @private
   */
  this.listener_ = listener;

  /**
   * The default amount of time to delay before invoking the callback.
   * @type {number}
   * @private
   */
  this.interval_ = opt_interval || 0;

  /**
   * The object context to invoke the callback in.
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;


  /**
   * Cached callback function invoked when the delay finishes.
   * @type {Function}
   * @private
   */
  this.callback_ = goog.bind(this.doAction_, this);
};
goog.inherits(goog.async.Delay, goog.Disposable);


/**
 * A deprecated alias.
 * @deprecated Use goog.async.Delay instead.
 * @constructor
 */
goog.Delay = goog.async.Delay;


/**
 * Identifier of the active delay timeout, or 0 when inactive.
 * @type {number}
 * @private
 */
goog.async.Delay.prototype.id_ = 0;


/**
 * Disposes of the object, cancelling the timeout if it is still outstanding and
 * removing all object references.
 */
goog.async.Delay.prototype.disposeInternal = function() {
  goog.async.Delay.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.listener_;
  delete this.handler_;
};


/**
 * Starts the delay timer. The provided listener function will be called after
 * the specified interval. Calling start on an active timer will reset the
 * delay interval.
 * @param {number=} opt_interval If specified, overrides the object's default
 *     interval with this one (in milliseconds).
 */
goog.async.Delay.prototype.start = function(opt_interval) {
  this.stop();
  this.id_ = goog.Timer.callOnce(
      this.callback_,
      goog.isDef(opt_interval) ? opt_interval : this.interval_);
};


/**
 * Stops the delay timer if it is active. No action is taken if the timer is not
 * in use.
 */
goog.async.Delay.prototype.stop = function() {
  if (this.isActive()) {
    goog.Timer.clear(this.id_);
  }
  this.id_ = 0;
};


/**
 * Fires delay's action even if timer has already gone off or has not been
 * started yet; guarantees action firing. Stops the delay timer.
 */
goog.async.Delay.prototype.fire = function() {
  this.stop();
  this.doAction_();
};


/**
 * Fires delay's action only if timer is currently active. Stops the delay
 * timer.
 */
goog.async.Delay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};


/**
 * @return {boolean} True if the delay is currently active, false otherwise.
 */
goog.async.Delay.prototype.isActive = function() {
  return this.id_ != 0;
};


/**
 * Invokes the callback function after the delay successfully completes.
 * @private
 */
goog.async.Delay.prototype.doAction_ = function() {
  this.id_ = 0;
  if (this.listener_) {
    this.listener_.call(this.handler_);
  }
};
