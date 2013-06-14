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

goog.require('goog.async.AnimationDelay');
goog.require('goog.async.Delay');
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
goog.fx.anim.TIMEOUT = goog.async.AnimationDelay.TIMEOUT;


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
 * An interval ID for the global timer or event handler uid.
 * @type {goog.async.Delay|goog.async.AnimationDelay}
 * @private
 */
goog.fx.anim.animationDelay_ = null;


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
  goog.fx.anim.requestAnimationFrame_();
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
    goog.fx.anim.cancelAnimationFrame_();
  }
};


/**
 * Tears down this module. Useful for testing.
 */
// TODO(nicksantos): Wow, this api is pretty broken. This should be fixed.
goog.fx.anim.tearDown = function() {
  goog.fx.anim.animationWindow_ = null;
  goog.dispose(goog.fx.anim.animationDelay_);
  goog.fx.anim.animationDelay_ = null;
  goog.fx.anim.activeAnimations_ = {};
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
  // If a timer is currently running, reset it and restart with new functions
  // after a timeout. This is to avoid mismatching timer UIDs if we change the
  // animation window during a running animation.
  //
  // In practice this cannot happen before some animation window and timer
  // control functions has already been set.
  var hasTimer =
      goog.fx.anim.animationDelay_ && goog.fx.anim.animationDelay_.isActive();

  goog.dispose(goog.fx.anim.animationDelay_);
  goog.fx.anim.animationDelay_ = null;
  goog.fx.anim.animationWindow_ = animationWindow;

  // If the timer was running, start it again.
  if (hasTimer) {
    goog.fx.anim.requestAnimationFrame_();
  }
};


/**
 * Requests an animation frame based on the requestAnimationFrame and
 * cancelRequestAnimationFrame function pair.
 * @private
 */
goog.fx.anim.requestAnimationFrame_ = function() {
  if (!goog.fx.anim.animationDelay_) {
    // We cannot guarantee that the global window will be one that fires
    // requestAnimationFrame events (consider off-screen chrome extension
    // windows). Default to use goog.async.Delay, unless
    // the client has explicitly set an animation window.
    if (goog.fx.anim.animationWindow_) {
      // requestAnimationFrame will call cycleAnimations_ with the current
      // time in ms, as returned from goog.now().
      goog.fx.anim.animationDelay_ = new goog.async.AnimationDelay(
          function(now) {
            goog.fx.anim.cycleAnimations_(now);
          }, goog.fx.anim.animationWindow_);
    } else {
      goog.fx.anim.animationDelay_ = new goog.async.Delay(function() {
        goog.fx.anim.cycleAnimations_(goog.now());
      }, goog.fx.anim.TIMEOUT);
    }
  }

  var delay = goog.fx.anim.animationDelay_;
  if (!delay.isActive()) {
    delay.start();
  }
};


/**
 * Cancels an animation frame created by requestAnimationFrame_().
 * @private
 */
goog.fx.anim.cancelAnimationFrame_ = function() {
  if (goog.fx.anim.animationDelay_) {
    goog.fx.anim.animationDelay_.stop();
  }
};


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
    goog.fx.anim.requestAnimationFrame_();
  }
};
