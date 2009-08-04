// Copyright 2006 Google Inc.
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
 * @fileoverview A timer class to which other classes and objects can
 * listen on.  This is only an abstraction above setInterval
 */

goog.provide('goog.Timer');
goog.require('goog.events.EventTarget');


/**
 * Class for handling timing events.
 *
 * @param {number} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object} opt_timerObject  An object that has setTimeout, setInterval,
 *     clearTimeout and clearInterval (eg Window).
 * @constructor
 * @extends goog.events.EventTarget
 */
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);

  /**
   * Number of ms between ticks
   * @type {number}
   * @private
   */
  this.interval_ = opt_interval || 1;

  /**
   * An object that implements setTimout, setInterval, clearTimeout and
   * clearInterval. We default to the window object. Changing this on
   * goog.Timer.prototype changes the object for all timer instances which can
   * be useful if your environment has some other implementation of timers than
   * the window object.
   * @type {Object}
   */
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;

  /**
   * Cached tick_ bound to the object for later use in the timer.
   * @type {Function}
   */
  this.boundTick_ = goog.bind(this.tick_, this);

 /**
  * Firefox browser often fires the timer event sooner
  * (sometimes MUCH sooner) than the requested timeout. So we
  * compare the time to when the event was last fired, and
  * reschedule if appropriate. See also goog.Timer.intervalScale
  * @type {number}
  */
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);




/**
 * Whether this timer is enabled
 * @type {boolean}
 */
goog.Timer.prototype.enabled = false;


/**
 * An object that implements setTimout, setInterval, clearTimeout and
 * clearInterval. We default to the window object. Changing this on
 * goog.Timer.prototype changes the object for all timer instances which can be
 * useful if your environment has some other implementation of timers than the
 * window object.
 * @type {Object}
 */
goog.Timer.defaultTimerObject = goog.global['window'];

/**
 * A variable that controls the timer error correction. If the
 * timer is called before the requested interval times
 * intervalScale, which often happens on mozilla, the timer is
 * rescheduled. See also this.last_
 * @type {number}
 */
goog.Timer.intervalScale = 0.8;

/**
 * Variable for storing the result of setInterval
 * @type {number?}
 * @private
 */
goog.Timer.prototype.timer_ = null;

/**
 * Sets the interval of the timer.
 * @param {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    // Stop and then start the timer to reset the interval.
    this.stop();
    this.start();
  } else if (this.timer_) {
    this.stop();
  }
};


/**
 * Callback for the setInterval used by the timer
 * @private
 */
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 &&
        elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_ - elapsed);
      return;
    }

    this.dispatchTick_();
    // The timer could be stopped in the timer event handler.
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_);
      this.last_ = goog.now();
    }
  }
};


/**
 * Dispatches the TICK event. This is its own method so subclasses can override.
 * @private
 */
goog.Timer.prototype.dispatchTick_ = function() {
  this.dispatchEvent(goog.Timer.TICK);
};


/**
 * Starts the timer.
 */
goog.Timer.prototype.start = function() {
  this.enabled = true;

  // If there is no interval already registered, start it now
  if (!this.timer_) {
    // IMPORTANT!
    // window.setInterval in FireFox has a bug - it fires based on
    // absolute time, rather than on relative time. What this means
    // is that if a computer is sleeping/hibernating for 24 hours
    // and the timer interval was configured to fire every 1000ms,
    // then after the PC wakes up the timer will fire, in rapid
    // succession, 3600*24 times.
    // This bug is described here and is already fixed, but it will
    // take time to propagate, so for now I am switching this over
    // to setTimeout logic.
    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643
    //
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
        this.interval_);
    this.last_ = goog.now();
  }
};


/**
 * Stops the timer.
 */
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  this.timerObject_.clearTimeout(this.timer_);
  this.timer_ = null;
};


/**
 * Disposes the timer.
 */
goog.Timer.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.EventTarget.prototype.dispose.call(this);
    this.stop();
    this.timerObject_ = null;
  }
};


/**
 * Constant for the timer's event type
 * @type {string}
 */
goog.Timer.TICK = 'tick';


/**
 * Calls the given function once, after the optional pause
 * @param {Function} listener Function or object that has a handleEvent method.
 * @param {number} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object} opt_handler Object in who's scope to call the listener.
 * @return {number} A handle to the timer ID.
 */
goog.Timer.callOnce = function(listener, opt_interval, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else if (listener && typeof listener.handleEvent == 'function') {
    // using typeof to prevent strict js warning
    listener = goog.bind(listener.handleEvent, listener);
  } else {
   throw Error('Invalid listener argument');
  }

  return goog.Timer.defaultTimerObject.setTimeout(listener, opt_interval || 0);
};

/**
 * Clears a timeout initiated by callOnce
 * @param {number} timerId a timer ID.
 */
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
