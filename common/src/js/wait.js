/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Defines a mechanism for blocking {@code webdriver.WebDriver}
 * command execution on user-defined conditions.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Wait');

goog.require('goog.events');
goog.require('webdriver.Future');
goog.require('webdriver.timing');


/**
 * Controls polling a condition that a {@code webdriver.WebDriver} instance
 * should block command execution on.
 * @param {function} conditionFn The condition function that the driver will
 *     poll. The function should require no arguments and return a boolean or a
 *     {@code webdriver.Future} that will evaluate to a boolean.
 * @param {number} timeout The amount of time to wait, in milliseconds, for the
 *     condition to hold.
 * @constructor
 * @private
 */
webdriver.Wait = function(conditionFn, timeout) {

  /**
   * Function to call for evaluating the condition being waited on.
   * @type {function: boolean}
   * @private
   */
  this.conditionFn_ = conditionFn;

  /**
   * The maximum amount of time in milliseconds to wait for condition.
   * @type {number}
   * @private
   */
  this.timeout_ = timeout;

  /**
   * When the wait began. Set on the first call to {@code #start()}.
   * @type {number}
   * @private
   */
  this.started_ = 0;

  /**
   * ID of the timeout timer. Initialized on the first call to {@code #start()}.
   * @type {number}
   * @private
   */
  this.timeoutId_ = null;

  /**
   * ID of the interval timer. Initialized on the first call to
   * {@code #start()}.
   * @type {number}
   * @private
   */
  this.pollingIntervalId_ = null;

  /**
   * Whether to wait on the inverse of the wait condition.
   * @type {boolean}
   * @private
   */
  this.waitOnInverse_ = false;
};


/**
 * Set this instance to wait for the inverse of its condition.
 * @param {boolean} wait Whether to wait for the inverse of the condition.
 */
webdriver.Wait.prototype.waitOnInverse = function(wait) {
  this.waitOnInverse_ = wait;
};


/**
 * Starts the timer the and starts evaluating the condition.
 * @param {function} callbackFn The function to call with the result. The
 *     function should take 3 arguments: a boolean for whether the wait timed
 *     out (will only be true on a timeout), the amount of time spent in the
 *     wait. The 3rd parameter will be an Error, if any, that caused the wait
 *     to abort early.
 */
webdriver.Wait.prototype.start = function(callbackFn) {
  if (!!!this.started_) {
    this.started_ = goog.now();

    var tickHandler = goog.bind(this.onTick_, this, callbackFn);
    var timeoutHandler = goog.bind(this.onTimeout_, this, callbackFn);

    this.pollingIntervalId_ = webdriver.timing.setInterval(tickHandler, 5);
    this.timeoutId_ =
        webdriver.timing.setTimeout(timeoutHandler, this.timeout_);

    this.onTick_(callbackFn);
  }
};


/**
 * Callback for when the wait times out.
 * @param {function} callbackFn The function to call with the result.
 * @private
 */
webdriver.Wait.prototype.onTimeout_ = function(callbackFn) {
  webdriver.timing.clearInterval(this.pollingIntervalId_);
  if (this.pendingFuture_) {
    this.pendingFuture_.dispose();
  }
  callbackFn(true, goog.now() - this.started_);
};


/**
 * Evaluates the wait condition and determines whether to abort the wait.
 * @param {function} callbackFn The function to call with the result.
 * @private
 */
webdriver.Wait.prototype.onTick_ = function(callbackFn) {
  if (this.pendingFuture_) {
    return;
  }

  var elapsed = goog.now() - this.started_;
  var value;
  try {
    value = this.conditionFn_();
    if (value instanceof webdriver.Future) {
      if (value.isSet() &&
          this.checkValue_(value.getValue(), elapsed, callbackFn)) {
        return;
      }

      this.pendingFuture_ = value;
      goog.events.listenOnce(value, goog.events.EventType.CHANGE, function() {
        this.pendingFuture_ = null;
        this.checkValue_(value.getValue(), goog.now() - this.started_,
            callbackFn);
      }, false, this);

    } else {
      this.checkValue_(value, elapsed, callbackFn);
    }

  } catch (ex) {
    webdriver.timing.clearInterval(this.pollingIntervalId_);
    webdriver.timing.clearTimeout(this.timeoutId_);
    if (this.pendingFuture_) {
      this.pendingFuture_.dispose();
    }
    callbackFn(true, elapsed, ex);
  }
};


/**
 * Checks the value returned by the condition function.
 * @param {boolean} value The result of the condition function.
 * @param {number} elapsed The time elapsed since the wait started.
 * @param {function} callbackFn The function to call with the result.
 * @private
 */
webdriver.Wait.prototype.checkValue_ = function(value, elapsed, callbackFn) {
  value = !!value;
  if (this.waitOnInverse_) {
    value = !value;
  }
  if (value) {
    webdriver.timing.clearInterval(this.pollingIntervalId_);
    webdriver.timing.clearTimeout(this.timeoutId_);
    if (this.pendingFuture_) {
      this.pendingFuture_.dispose();
    }
    callbackFn(false, elapsed);
  }
  return value;
};
