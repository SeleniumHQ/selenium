// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An abstract base class for transitions. This is a simple
 * interface that allows for playing, pausing and stopping an animation. It adds
 * a simple event model, and animation status.
 */
goog.provide('goog.fx.TransitionBase');
goog.provide('goog.fx.TransitionBase.State');

goog.require('goog.events.EventTarget');
goog.require('goog.fx.Transition');  // Unreferenced: interface



/**
 * Constructor for a transition object.
 *
 * @constructor
 * @struct
 * @implements {goog.fx.Transition}
 * @extends {goog.events.EventTarget}
 */
goog.fx.TransitionBase = function() {
  goog.fx.TransitionBase.base(this, 'constructor');

  /**
   * The internal state of the animation.
   * @type {goog.fx.TransitionBase.State}
   * @private
   */
  this.state_ = goog.fx.TransitionBase.State.STOPPED;

  /**
   * Timestamp for when the animation was started.
   * @type {?number}
   * @protected
   */
  this.startTime = null;

  /**
   * Timestamp for when the animation finished or was stopped.
   * @type {?number}
   * @protected
   */
  this.endTime = null;
};
goog.inherits(goog.fx.TransitionBase, goog.events.EventTarget);


/**
 * Enum for the possible states of an animation.
 * @enum {number}
 */
goog.fx.TransitionBase.State = {
  STOPPED: 0,
  PAUSED: -1,
  PLAYING: 1
};


/**
 * Plays the animation.
 *
 * @param {boolean=} opt_restart Optional parameter to restart the animation.
 * @return {boolean} True iff the animation was started.
 * @override
 */
goog.fx.TransitionBase.prototype.play = goog.abstractMethod;


/**
 * Stops the animation.
 *
 * @param {boolean=} opt_gotoEnd Optional boolean parameter to go the the end of
 *     the animation.
 * @override
 */
goog.fx.TransitionBase.prototype.stop = goog.abstractMethod;


/**
 * Pauses the animation.
 */
goog.fx.TransitionBase.prototype.pause = goog.abstractMethod;


/**
 * Returns the current state of the animation.
 * @return {goog.fx.TransitionBase.State} State of the animation.
 */
goog.fx.TransitionBase.prototype.getStateInternal = function() {
  return this.state_;
};


/**
 * Sets the current state of the animation to playing.
 * @protected
 */
goog.fx.TransitionBase.prototype.setStatePlaying = function() {
  this.state_ = goog.fx.TransitionBase.State.PLAYING;
};


/**
 * Sets the current state of the animation to paused.
 * @protected
 */
goog.fx.TransitionBase.prototype.setStatePaused = function() {
  this.state_ = goog.fx.TransitionBase.State.PAUSED;
};


/**
 * Sets the current state of the animation to stopped.
 * @protected
 */
goog.fx.TransitionBase.prototype.setStateStopped = function() {
  this.state_ = goog.fx.TransitionBase.State.STOPPED;
};


/**
 * @return {boolean} True iff the current state of the animation is playing.
 */
goog.fx.TransitionBase.prototype.isPlaying = function() {
  return this.state_ == goog.fx.TransitionBase.State.PLAYING;
};


/**
 * @return {boolean} True iff the current state of the animation is paused.
 */
goog.fx.TransitionBase.prototype.isPaused = function() {
  return this.state_ == goog.fx.TransitionBase.State.PAUSED;
};


/**
 * @return {boolean} True iff the current state of the animation is stopped.
 */
goog.fx.TransitionBase.prototype.isStopped = function() {
  return this.state_ == goog.fx.TransitionBase.State.STOPPED;
};


/**
 * Dispatches the BEGIN event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onBegin = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.BEGIN);
};


/**
 * Dispatches the END event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onEnd = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.END);
};


/**
 * Dispatches the FINISH event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onFinish = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.FINISH);
};


/**
 * Dispatches the PAUSE event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onPause = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.PAUSE);
};


/**
 * Dispatches the PLAY event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onPlay = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.PLAY);
};


/**
 * Dispatches the RESUME event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onResume = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.RESUME);
};


/**
 * Dispatches the STOP event. Sub classes should override this instead
 * of listening to the event, and call this instead of dispatching the event.
 * @protected
 */
goog.fx.TransitionBase.prototype.onStop = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.STOP);
};


/**
 * Dispatches an event object for the current animation.
 * @param {string} type Event type that will be dispatched.
 * @protected
 */
goog.fx.TransitionBase.prototype.dispatchAnimationEvent = function(type) {
  this.dispatchEvent(type);
};
