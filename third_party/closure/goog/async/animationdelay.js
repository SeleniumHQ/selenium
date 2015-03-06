// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A delayed callback that pegs to the next animation frame
 * instead of a user-configurable timeout.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.async.AnimationDelay');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.functions');



// TODO(nicksantos): Should we factor out the common code between this and
// goog.async.Delay? I'm not sure if there's enough code for this to really
// make sense. Subclassing seems like the wrong approach for a variety of
// reasons. Maybe there should be a common interface?



/**
 * A delayed callback that pegs to the next animation frame
 * instead of a user configurable timeout. By design, this should have
 * the same interface as goog.async.Delay.
 *
 * Uses requestAnimationFrame and friends when available, but falls
 * back to a timeout of goog.async.AnimationDelay.TIMEOUT.
 *
 * For more on requestAnimationFrame and how you can use it to create smoother
 * animations, see:
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 *
 * @param {function(number)} listener Function to call when the delay completes.
 *     Will be passed the timestamp when it's called, in unix ms.
 * @param {Window=} opt_window The window object to execute the delay in.
 *     Defaults to the global object.
 * @param {Object=} opt_handler The object scope to invoke the function in.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.async.AnimationDelay = function(listener, opt_window, opt_handler) {
  goog.async.AnimationDelay.base(this, 'constructor');

  /**
   * The function that will be invoked after a delay.
   * @type {function(number)}
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
   * @type {Window}
   * @private
   */
  this.win_ = opt_window || window;

  /**
   * Cached callback function invoked when the delay finishes.
   * @type {function()}
   * @private
   */
  this.callback_ = goog.bind(this.doAction_, this);
};
goog.inherits(goog.async.AnimationDelay, goog.Disposable);


/**
 * Identifier of the active delay timeout, or event listener,
 * or null when inactive.
 * @type {goog.events.Key|number|null}
 * @private
 */
goog.async.AnimationDelay.prototype.id_ = null;


/**
 * If we're using dom listeners.
 * @type {?boolean}
 * @private
 */
goog.async.AnimationDelay.prototype.usingListeners_ = false;


/**
 * Default wait timeout for animations (in milliseconds).  Only used for timed
 * animation, which uses a timer (setTimeout) to schedule animation.
 *
 * @type {number}
 * @const
 */
goog.async.AnimationDelay.TIMEOUT = 20;


/**
 * Name of event received from the requestAnimationFrame in Firefox.
 *
 * @type {string}
 * @const
 * @private
 */
goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_ = 'MozBeforePaint';


/**
 * Starts the delay timer. The provided listener function will be called
 * before the next animation frame.
 */
goog.async.AnimationDelay.prototype.start = function() {
  this.stop();
  this.usingListeners_ = false;

  var raf = this.getRaf_();
  var cancelRaf = this.getCancelRaf_();
  if (raf && !cancelRaf && this.win_.mozRequestAnimationFrame) {
    // Because Firefox (Gecko) runs animation in separate threads, it also saves
    // time by running the requestAnimationFrame callbacks in that same thread.
    // Sadly this breaks the assumption of implicit thread-safety in JS, and can
    // thus create thread-based inconsistencies on counters etc.
    //
    // Calling cycleAnimations_ using the MozBeforePaint event instead of as
    // callback fixes this.
    //
    // Trigger this condition only if the mozRequestAnimationFrame is available,
    // but not the W3C requestAnimationFrame function (as in draft) or the
    // equivalent cancel functions.
    this.id_ = goog.events.listen(
        this.win_,
        goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_,
        this.callback_);
    this.win_.mozRequestAnimationFrame(null);
    this.usingListeners_ = true;
  } else if (raf && cancelRaf) {
    this.id_ = raf.call(this.win_, this.callback_);
  } else {
    this.id_ = this.win_.setTimeout(
        // Prior to Firefox 13, Gecko passed a non-standard parameter
        // to the callback that we want to ignore.
        goog.functions.lock(this.callback_),
        goog.async.AnimationDelay.TIMEOUT);
  }
};


/**
 * Stops the delay timer if it is active. No action is taken if the timer is not
 * in use.
 */
goog.async.AnimationDelay.prototype.stop = function() {
  if (this.isActive()) {
    var raf = this.getRaf_();
    var cancelRaf = this.getCancelRaf_();
    if (raf && !cancelRaf && this.win_.mozRequestAnimationFrame) {
      goog.events.unlistenByKey(this.id_);
    } else if (raf && cancelRaf) {
      cancelRaf.call(this.win_, /** @type {number} */ (this.id_));
    } else {
      this.win_.clearTimeout(/** @type {number} */ (this.id_));
    }
  }
  this.id_ = null;
};


/**
 * Fires delay's action even if timer has already gone off or has not been
 * started yet; guarantees action firing. Stops the delay timer.
 */
goog.async.AnimationDelay.prototype.fire = function() {
  this.stop();
  this.doAction_();
};


/**
 * Fires delay's action only if timer is currently active. Stops the delay
 * timer.
 */
goog.async.AnimationDelay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};


/**
 * @return {boolean} True if the delay is currently active, false otherwise.
 */
goog.async.AnimationDelay.prototype.isActive = function() {
  return this.id_ != null;
};


/**
 * Invokes the callback function after the delay successfully completes.
 * @private
 */
goog.async.AnimationDelay.prototype.doAction_ = function() {
  if (this.usingListeners_ && this.id_) {
    goog.events.unlistenByKey(this.id_);
  }
  this.id_ = null;

  // We are not using the timestamp returned by requestAnimationFrame
  // because it may be either a Date.now-style time or a
  // high-resolution time (depending on browser implementation). Using
  // goog.now() will ensure that the timestamp used is consistent and
  // compatible with goog.fx.Animation.
  this.listener_.call(this.handler_, goog.now());
};


/** @override */
goog.async.AnimationDelay.prototype.disposeInternal = function() {
  this.stop();
  goog.async.AnimationDelay.base(this, 'disposeInternal');
};


/**
 * @return {?function(function(number)): number} The requestAnimationFrame
 *     function, or null if not available on this browser.
 * @private
 */
goog.async.AnimationDelay.prototype.getRaf_ = function() {
  var win = this.win_;
  return win.requestAnimationFrame ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame ||
      win.oRequestAnimationFrame ||
      win.msRequestAnimationFrame ||
      null;
};


/**
 * @return {?function(number): number} The cancelAnimationFrame function,
 *     or null if not available on this browser.
 * @private
 */
goog.async.AnimationDelay.prototype.getCancelRaf_ = function() {
  var win = this.win_;
  return win.cancelRequestAnimationFrame ||
      win.webkitCancelRequestAnimationFrame ||
      win.mozCancelRequestAnimationFrame ||
      win.oCancelRequestAnimationFrame ||
      win.msCancelRequestAnimationFrame ||
      null;
};
