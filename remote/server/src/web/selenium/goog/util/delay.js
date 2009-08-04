// Copyright 2007 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Defines a class useful for handling functions that must be
 * invoked after a delay, especially when that delay is frequently restarted.
 * Examples include delaying before displaying a tooltip, menu hysteresis,
 * idle timers, etc.
 */


goog.provide('goog.Delay');

goog.require('goog.Disposable');
goog.require('goog.Timer');


/**
 * A Delay object invokes the associated function after a specified delay. The
 * interval duration can be specified once in the constructor, or can be defined
 * each time the delay is started. Calling start on an active delay will reset
 * the timer.
 *
 * @param {Function} listener Function to call when the delay completes.
 * @param {number} opt_interval The default length of the invocation delay (in
 *     milliseconds).
 * @param {Object} opt_handler The object scope to invoke the function in.
 * @constructor
 * @extends goog.Disposable
 */
goog.Delay = function(listener, opt_interval, opt_handler) {
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
goog.inherits(goog.Delay, goog.Disposable);


/**
 * Identifier of the active delay timeout, or 0 when inactive.
 * @type {number}
 * @private
 */
goog.Delay.prototype.id_ = 0;


/**
 * Disposes the object, cancelling the timeout if it is still outstanding and
 * removing all object references.
 */
goog.Delay.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.Delay.superClass_.dispose.call(this);
    this.stop();
    this.listener_ = null;
    this.handler_ = null;
  }
};


/**
 * Starts the delay timer. The provided listener function will be called after
 * the specified interval. Calling start on an active timer will reset the
 * delay interval.
 * @param {number} opt_interval If specified, overrides the object's default
 *     interval with this one (in milliseconds).
 */
goog.Delay.prototype.start = function(opt_interval) {
  this.stop();
  this.id_ = goog.Timer.callOnce(
      this.callback_,
      goog.isDef(opt_interval) ? opt_interval : this.interval_);
};


/**
 * Stops the delay timer if it is active. No action is taken if the timer is not
 * in use.
 */
goog.Delay.prototype.stop = function() {
  if (this.isActive()) {
    goog.Timer.clear(this.id_);
  }
  this.id_ = 0;
};


/**
 * Fires delay's action even if timer has already gone off or has not been
 * started yet; guarantees action firing. Stops the delay timer.
 */
goog.Delay.prototype.fire = function() {
  this.doAction_();
  this.stop();
};


/**
 * Fires delay's action only if timer is currently active. Stops the delay
 * timer.
 */
goog.Delay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};


/**
 * @return {boolean} True if the delay is currently active, false otherwise.
 */
goog.Delay.prototype.isActive = function() {
  return this.id_ != 0;
};


/**
 * Invokes the callback function after the delay successfully completes.
 * @private
 */
goog.Delay.prototype.doAction_ = function() {
  this.id_ = 0;
  if (this.listener_) {
    this.listener_.call(this.handler_);
  }
};
