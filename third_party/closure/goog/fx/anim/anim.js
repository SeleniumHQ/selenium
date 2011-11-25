// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Basic animation controls.
 *
 */
goog.provide('goog.fx.anim');
goog.provide('goog.fx.anim.Animated');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.object');



/**
 * An interface for programatically animated objects. I.e. rendered in
 * javascript frame by frame.
 *
 * @interface
 */
goog.fx.anim.Animated = function() {};


/**
 * Function called when a frame is requested for the animation.
 *
 * @param {number} now Current time in milliseconds.
 */
goog.fx.anim.Animated.prototype.onAnimationFrame;


/**
 * Default wait timeout for animations (in milliseconds).  Only used for timed
 * animation, which uses a timer (setTimeout) to schedule animation.
 *
 * @type {number}
 * @const
 */
goog.fx.anim.TIMEOUT = 20;


/**
 * Name of event received from the requestAnimationFrame in Firefox.
 *
 * @type {string}
 * @const
 * @private
 */
goog.fx.anim.MOZ_BEFORE_PAINT_EVENT_ = 'MozBeforePaint';


/**
 * A map of animations which should be cycled on the global timer.
 *
 * @type {Object.<number, goog.fx.anim.Animated>}
 * @private
 */
goog.fx.anim.activeAnimations_ = {};


/**
 * An optional animation window.
 * @type {Window}
 * @private
 */
goog.fx.anim.animationWindow_ = null;


/**
 * A timing control function.
 * @type {?function(?function(number))}
 * @private
 */
goog.fx.anim.requestAnimationFrameFn_ = null;


/**
 * Cancel function for timing control.
 * @type {?function(number)}
 * @private
 */
goog.fx.anim.cancelRequestAnimationFrameFn_ = null;


/**
 * An interval ID for the global timer or event handler uid.
 * @type {?number}
 * @private
 */
goog.fx.anim.animationTimer_ = null;


/**
 * Registers an animation to be cycled on the global timer.
 * @param {goog.fx.anim.Animated} animation The animation to register.
 */
goog.fx.anim.registerAnimation = function(animation) {
  var uid = goog.getUid(animation);
  if (!(uid in goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.activeAnimations_[uid] = animation;
  }

  // If the timer is not already started, start it now.
  goog.fx.anim.requestAnimationTimer_();
};


/**
 * Removes an animation from the list of animations which are cycled on the
 * global timer.
 * @param {goog.fx.anim.Animated} animation The animation to unregister.
 */
goog.fx.anim.unregisterAnimation = function(animation) {
  var uid = goog.getUid(animation);
  delete goog.fx.anim.activeAnimations_[uid];

  // If a timer is running and we no longer have any active timers we stop the
  // timers.
  if (goog.object.isEmpty(goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.cancelAnimationTimer_();
  }
};


/**
 * Registers an animation window. This allows usage of the timing control API
 * for animations. Note that this window must be visible, as non-visible
 * windows can potentially stop animating. This window does not necessarily
 * need to be the window inside which animation occurs, but must remain visible.
 * See: https://developer.mozilla.org/en/DOM/window.mozRequestAnimationFrame.
 *
 * @param {Window} animationWindow The window in which to animate elements.
 */
goog.fx.anim.setAnimationWindow = function(animationWindow) {
  goog.fx.anim.animationWindow_ = animationWindow;

  var hasTimer = !!goog.fx.anim.animationTimer_;
  // If a timer is currently running, reset it and restart with new functions
  // after a timeout. This is to avoid mismatching timer UIDs if we change the
  // animation window during a running animation.
  //
  // In practice this cannot happen before some animation window and timer
  // control functions has already been set.
  if (hasTimer) {
    goog.fx.anim.cancelAnimationTimer_();
  }

  if (!animationWindow) {
    goog.fx.anim.requestAnimationFrameFn_ = null;
    goog.fx.anim.cancelRequestAnimationFrameFn_ = null;
  } else {
    goog.fx.anim.requestAnimationFrameFn_ =
        animationWindow['requestAnimationFrame'] ||
        animationWindow['webkitRequestAnimationFrame'] ||
        animationWindow['mozRequestAnimationFrame'] ||
        animationWindow['oRequestAnimationFrame'] ||
        animationWindow['msRequestAnimationFrame'] ||
        null;

    goog.fx.anim.cancelRequestAnimationFrameFn_ =
        animationWindow['cancelRequestAnimationFrame'] ||
        animationWindow['webkitCancelRequestAnimationFrame'] ||
        animationWindow['mozCancelRequestAnimationFrame'] ||
        animationWindow['oCancelRequestAnimationFrame'] ||
        animationWindow['msCancelRequestAnimationFrame'] ||
        null;
  }

  // Set up matching render timing functions, the requestAnimationTimer_ and
  // cancelAnimationTimer_ functions.
  if (goog.fx.anim.requestAnimationFrameFn_ &&
      animationWindow['mozRequestAnimationFrame'] &&
      !goog.fx.anim.cancelRequestAnimationFrameFn_) {
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
    goog.fx.anim.requestAnimationTimer_ =
        goog.fx.anim.requestMozAnimationFrame_;
    goog.fx.anim.cancelAnimationTimer_ = goog.fx.anim.cancelMozAnimationFrame_;
  } else if (goog.fx.anim.requestAnimationFrameFn_ &&
             goog.fx.anim.cancelRequestAnimationFrameFn_) {
    goog.fx.anim.requestAnimationTimer_ = goog.fx.anim.requestAnimationFrame_;
    goog.fx.anim.cancelAnimationTimer_ = goog.fx.anim.cancelAnimationFrame_;
  } else {
    goog.fx.anim.requestAnimationTimer_ = goog.fx.anim.requestTimer_;
    goog.fx.anim.cancelAnimationTimer_ = goog.fx.anim.cancelTimer_;
  }

  // If the timer was running, start it again.
  if (hasTimer) {
    goog.fx.anim.requestAnimationTimer_();
  }
};


/**
 * Requests a scheduled timer call.
 * @private
 */
goog.fx.anim.requestTimer_ = function() {
  if (!goog.fx.anim.animationTimer_) {
    goog.fx.anim.animationTimer_ = goog.Timer.callOnce(function() {
      goog.fx.anim.animationTimer_ = null;
      // Cycle all animations at 'the same time'.
      goog.fx.anim.cycleAnimations_(goog.now());
    }, goog.fx.anim.TIMEOUT);
  }
};


/**
 * Cancels a timer created by requestTimer_().
 * @private
 */
goog.fx.anim.cancelTimer_ = function() {
  if (goog.fx.anim.animationTimer_) {
    goog.Timer.clear(goog.fx.anim.animationTimer_);
    goog.fx.anim.animationTimer_ = null;
  }
};


/**
 * Requests an animation frame based on the requestAnimationFrame and
 * cancelRequestAnimationFrame function pair.
 * @private
 */
goog.fx.anim.requestAnimationFrame_ = function() {
  if (!goog.fx.anim.animationTimer_) {
    // requestAnimationFrame will call cycleAnimations_ with the current
    // time in ms, as returned from goog.now().
    goog.fx.anim.animationTimer_ =
        goog.fx.anim.requestAnimationFrameFn_.call(
            goog.fx.anim.animationWindow_, function(now) {
              goog.fx.anim.animationTimer_ = null;
              goog.fx.anim.cycleAnimations_(now);
            });
  }
};


/**
 * Cancels an animation frame created by requestAnimationFrame_().
 * @private
 */
goog.fx.anim.cancelAnimationFrame_ = function() {
  if (goog.fx.anim.animationTimer_) {
    goog.fx.anim.cancelRequestAnimationFrameFn_.call(
        goog.fx.anim.animationWindow_,
        goog.fx.anim.animationTimer_);
    goog.fx.anim.animationTimer_ = null;
  }
};


/**
 * Requests an animation frame based on the requestAnimationFrame and
 * cancelRequestAnimationFrame function pair.
 * @private
 */
goog.fx.anim.requestMozAnimationFrame_ = function() {
  if (!goog.fx.anim.animationTimer_) {
    goog.fx.anim.animationTimer_ = goog.events.listen(
        goog.fx.anim.animationWindow_, goog.fx.anim.MOZ_BEFORE_PAINT_EVENT_,
        function(event) {
          goog.fx.anim.cycleAnimations_(event['timeStamp'] || goog.now());
        }, false);
  }
  goog.fx.anim.requestAnimationFrameFn_.call(
      goog.fx.anim.animationWindow_, null);
};


/**
 * Cancels an animation frame created by requestAnimationFrame_().
 * @private
 */
goog.fx.anim.cancelMozAnimationFrame_ = function() {
  if (goog.fx.anim.animationTimer_) {
    goog.events.unlistenByKey(goog.fx.anim.animationTimer_);
    goog.fx.anim.animationTimer_ = null;
  }
};


/**
 * Starts the animation timer.  This is the currently active function selected
 * based on the animation window.
 * @private
 */
goog.fx.anim.requestAnimationTimer_ = goog.fx.anim.requestTimer_;


/**
 * Cancels the animation timer.  This is the currently active function selected
 * based on the animation window.
 * @private
 */
goog.fx.anim.cancelAnimationTimer_ = goog.fx.anim.cancelTimer_;


/**
 * Cycles through all registered animations.
 * @param {number} now Current time in milliseconds.
 * @private
 */
goog.fx.anim.cycleAnimations_ = function(now) {
  goog.object.forEach(goog.fx.anim.activeAnimations_, function(anim) {
    anim.onAnimationFrame(now);
  });

  if (!goog.object.isEmpty(goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.requestAnimationTimer_();
  }
};
