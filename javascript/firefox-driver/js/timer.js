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
 * @fileoverview An implementation of a timer that can be used without an
 * associated window.
 *
 * Please note that the client must hold onto the reference
 * to this timer class for the full duration of the timeout,
 * or nasty stuff will happen.
 *
 */

goog.provide('fxdriver.Timer');


fxdriver.Timer = function() {
  this.timer = null;
};


/**
 * Set a callback to be executed after a specified time out. The default time
 * out is 10ms.
 *
 * Note that "this" within the callback is null
 *
 * @param {!function(*=): *} callback The callback to use.
 * @param {number=} opt_timeout An optional timeout to use.
 */
fxdriver.Timer.prototype.setTimeout = function(callback, opt_timeout) {
  var CC = Components.classes;
  var CI = Components.interfaces;

  var timeout = opt_timeout || 10;
  // NO. This cannot be changed to a local variable, Simon.
  // See documentation on msITimer.
  this.timer = CC['@mozilla.org/timer;1'].createInstance(CI['nsITimer']);

  this.timer.initWithCallback({
    notify: function() {
      callback.apply(null);
    }
  }, timeout, CI.nsITimer.TYPE_ONE_SHOT);
};


/**
 * Wait until a condition is true before calling "callback". On error, call
 * ontimeout. The callback will be called with the result of condition.
 *
 * Note that "this" is null within the callbacks
 *
 * @param {function():boolean} condition The condition to check.
 * @param {function(*):undefined} callback The callback to use when condition is
 *    true.
 * @param {number} timeout Time to wait in milliseconds.
 * @param {function():undefined} ontimeout Called if condition doesn't become
 *    true.
 */
fxdriver.Timer.prototype.runWhenTrue = function(condition, callback, timeout, ontimeout) {
  var remaining = timeout;
  var interval = 100;
  var me = this;

  var timed = function () {
    var result = condition();
    if (remaining >= 0 && !result) {
      remaining -= interval;
      me.setTimeout(timed, interval);
    } else if (remaining <= 0) {
      ontimeout();
    } else {
      callback(result);
    }
  };
  timed();
};


/**
 * Allow an existing timer to be cancelled. Calling without a timer having been
 * started is a no-op.
 */
fxdriver.Timer.prototype.cancel = function() {
  if (this.timer) {
    this.timer.cancel();
  }
};
