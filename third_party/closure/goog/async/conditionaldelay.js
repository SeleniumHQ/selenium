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

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Defines a class useful for handling functions that must be
 * invoked later when some condition holds. Examples include deferred function
 * calls that return a boolean flag whether it succedeed or not.
 *
 * Example:
 *
 *  function deferred() {
 *     var succeeded = false;
 *     // ... custom code
 *     return succeeded;
 *  }
 *
 *  var deferredCall = new goog.async.ConditionalDelay(deferred);
 *  deferredCall.onSuccess = function() {
 *    alert('Success: The deferred function has been successfully executed.');
 *  }
 *  deferredCall.onFailure = function() {
 *    alert('Failure: Time limit exceeded.');
 *  }
 *
 *  // Call the deferred() every 100 msec until it returns true,
 *  // or 5 seconds pass.
 *  deferredCall.start(100, 5000);
 *
 *  // Stop the deferred function call (does nothing if it's not active).
 *  deferredCall.stop();
 *
 */


goog.provide('goog.async.ConditionalDelay');

goog.require('goog.Disposable');
goog.require('goog.async.Delay');



/**
 * A ConditionalDelay object invokes the associated function after a specified
 * interval delay and checks it's return value. If the function returns
 * {@code true} the conditional delay is cancelled and {@see #onSuccess}
 * is called. Otherwise this object keeps to invoke the deferred function until
 * either it returns {@code true} or the timeout is exceeded. In the latter case
 * the {@see #onFailure} method will be called.
 *
 * The interval duration and timeout can be specified each time the delay is
 * started. Calling start on an active delay will reset the timer.
 *
 * @param {function():boolean} listener Function to call when the delay
 *     completes. Should return a value that type-converts to {@code true} if
 *     the call succeeded and this delay should be stopped.
 * @param {Object} opt_handler The object scope to invoke the function in.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.async.ConditionalDelay = function(listener, opt_handler) {
  goog.Disposable.call(this);

  /**
   * The function that will be invoked after a delay.
   * @type {function():boolean}
   * @private
   */
  this.listener_ = listener;

  /**
   * The object context to invoke the callback in.
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;

  /**
   * The underlying goog.async.Delay delegate object.
   * @type {goog.async.Delay}
   * @private
   */
  this.delay_ = new goog.async.Delay(
      goog.bind(this.onTick_, this), 0 /*interval*/, this /*scope*/);
};
goog.inherits(goog.async.ConditionalDelay, goog.Disposable);


/**
 * The delay interval in milliseconds to between the calls to the callback.
 * Note, that the callback may be invoked earlier than this interval if the
 * timeout is exceeded.
 * @type {number}
 * @private
 */
goog.async.ConditionalDelay.prototype.interval_ = 0;


/**
 * The timeout timestamp until which the delay is to be executed.
 * A negative value means no timeout.
 * @type {number}
 * @private
 */
goog.async.ConditionalDelay.prototype.runUntil_ = 0;


/**
 * True if the listener has been executed, and it returned {@code true}.
 * @type {boolean}
 * @private
 */
goog.async.ConditionalDelay.prototype.isDone_ = false;


/**
 * @inheritDoc
 * @protected
 */
goog.async.ConditionalDelay.prototype.disposeInternal = function() {
  this.delay_.dispose();
  delete this.listener_;
  delete this.handler_;
  goog.async.ConditionalDelay.superClass_.disposeInternal.call(this);
};


/**
 * Starts the delay timer. The provided listener function will be called
 * repeatedly after the specified interval until the function returns
 * {@code true} or the timeout is exceeded. Calling start on an active timer
 * will stop the timer first.
 * @param {number} opt_interval The time interval between the function
 *     invocations (in milliseconds). Default is 0.
 * @param {number} opt_timeout The timeout interval (in milliseconds). Takes
 *     precedence over the {@code opt_interval}, i.e. if the timeout is less
 *     than the invocation interval, the function will be called when the
 *     timeout is exceeded. A negative value means no timeout. Default is 0.
 */
goog.async.ConditionalDelay.prototype.start = function(opt_interval,
                                                       opt_timeout) {
  this.stop();
  this.isDone_ = false;

  var timeout = opt_timeout || 0;
  this.interval_ = Math.max(opt_interval || 0, 0);
  this.runUntil_ = timeout < 0 ? -1 : (goog.now() + timeout);
  this.delay_.start(
      timeout < 0 ? this.interval_ : Math.min(this.interval_, timeout));
};


/**
 * Stops the delay timer if it is active. No action is taken if the timer is not
 * in use.
 */
goog.async.ConditionalDelay.prototype.stop = function() {
  this.delay_.stop();
};


/**
 * @return {boolean} True if the delay is currently active, false otherwise.
 */
goog.async.ConditionalDelay.prototype.isActive = function() {
  return this.delay_.isActive();
};


/**
 * @return {boolean} True if the listener has been executed and returned
 *     {@code true} since the last call to {@see #start}.
 */
goog.async.ConditionalDelay.prototype.isDone = function() {
  return this.isDone_;
};


/**
 * Called when the listener has been successfully executed and returned
 * {@code true}. The {@see #isDone} method should return {@code true} by now.
 * Designed for inheritance, should be overridden by subclasses or on the
 * instances if they care.
 */
goog.async.ConditionalDelay.prototype.onSuccess = function() {
  // Do nothing by default.
};


/**
 * Called when this delayed call is cancelled because the timeout has been
 * exceeded, and the listener has never returned {@code true}.
 * Designed for inheritance, should be overridden by subclasses or on the
 * instances if they care.
 */
goog.async.ConditionalDelay.prototype.onFailure = function() {
  // Do nothing by default.
};


/**
 * A callback function for the underlying {@code goog.async.Delay} object. When
 * executed the listener function is called, and if it returns {@code true}
 * the delay is stopped and the {@see #onSuccess} method is invoked.
 * If the timeout is exceeded the delay is stopped and the
 * {@see #onFailure} method is called.
 * @private
 */
goog.async.ConditionalDelay.prototype.onTick_ = function() {
  var successful = this.listener_.call(this.handler_);
  if (successful) {
    this.isDone_ = true;
    this.onSuccess();
  } else {
    // Try to reschedule the task.
    if (this.runUntil_ < 0) {
      // No timeout.
      this.delay_.start(this.interval_);
    } else {
      var timeLeft = this.runUntil_ - goog.now();
      if (timeLeft <= 0) {
        this.onFailure();
      } else {
        this.delay_.start(Math.min(this.interval_, timeLeft));
      }
    }
  }
};
