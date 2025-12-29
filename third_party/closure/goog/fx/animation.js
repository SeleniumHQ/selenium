/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Classes for doing animations and visual effects.
 *
 * (Based loosly on my animation code for 13thparallel.org, with extra
 * inspiration from the DojoToolkit's modifications to my code)
 */

goog.provide('goog.fx.Animation');
goog.provide('goog.fx.Animation.EventType');
goog.provide('goog.fx.Animation.State');
goog.provide('goog.fx.AnimationEvent');

goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('goog.fx.Transition');
goog.require('goog.fx.TransitionBase');
goog.require('goog.fx.anim');
goog.require('goog.fx.anim.Animated');



/**
 * Constructor for an animation object.
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @struct
 * @implements {goog.fx.anim.Animated}
 * @implements {goog.fx.Transition}
 * @extends {goog.fx.TransitionBase}
 */
goog.fx.Animation = function(start, end, duration, opt_acc) {
  'use strict';
  goog.fx.Animation.base(this, 'constructor');

  if (!Array.isArray(start) || !Array.isArray(end)) {
    throw new Error('Start and end parameters must be arrays');
  }

  if (start.length != end.length) {
    throw new Error('Start and end points must be the same length');
  }

  /**
   * Start point.
   * @type {Array<number>}
   * @protected
   */
  this.startPoint = start;

  /**
   * End point.
   * @type {Array<number>}
   * @protected
   */
  this.endPoint = end;

  /**
   * Duration of animation in milliseconds.
   * @type {number}
   * @protected
   */
  this.duration = duration;

  /**
   * Acceleration function, which must return a number between 0 and 1 for
   * inputs between 0 and 1.
   * @type {Function|undefined}
   * @private
   */
  this.accel_ = opt_acc;

  /**
   * Current coordinate for animation.
   * @type {Array<number>}
   * @protected
   */
  this.coords = [];

  /**
   * Whether the animation should use "right" rather than "left" to position
   * elements in RTL.  This is a temporary flag to allow clients to transition
   * to the new behavior at their convenience.  At some point it will be the
   * default.
   * @type {boolean}
   * @private
   */
  this.useRightPositioningForRtl_ = false;

  /**
   * Current frame rate.
   * @private {number}
   */
  this.fps_ = 0;

  /**
   * Percent of the way through the animation.
   * @protected {number}
   */
  this.progress = 0;

  /**
   * Timestamp for when last frame was run.
   * @protected {?number}
   */
  this.lastFrame = null;
};
goog.inherits(goog.fx.Animation, goog.fx.TransitionBase);


/**
 * @return {number} The duration of this animation in milliseconds.
 */
goog.fx.Animation.prototype.getDuration = function() {
  'use strict';
  return this.duration;
};


/**
 * Sets whether the animation should use "right" rather than "left" to position
 * elements.  This is a temporary flag to allow clients to transition
 * to the new component at their convenience.  At some point "right" will be
 * used for RTL elements by default.
 * @param {boolean} useRightPositioningForRtl True if "right" should be used for
 *     positioning, false if "left" should be used for positioning.
 */
goog.fx.Animation.prototype.enableRightPositioningForRtl = function(
    useRightPositioningForRtl) {
  'use strict';
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};


/**
 * Whether the animation should use "right" rather than "left" to position
 * elements.  This is a temporary flag to allow clients to transition
 * to the new component at their convenience.  At some point "right" will be
 * used for RTL elements by default.
 * @return {boolean} True if "right" should be used for positioning, false if
 *     "left" should be used for positioning.
 */
goog.fx.Animation.prototype.isRightPositioningForRtlEnabled = function() {
  'use strict';
  return this.useRightPositioningForRtl_;
};


/**
 * Events fired by the animation.
 * @enum {string}
 */
goog.fx.Animation.EventType = {
  /**
   * Dispatched when played for the first time OR when it is resumed.
   * @deprecated Use goog.fx.Transition.EventType.PLAY.
   */
  PLAY: goog.fx.Transition.EventType.PLAY,

  /**
   * Dispatched only when the animation starts from the beginning.
   * @deprecated Use goog.fx.Transition.EventType.BEGIN.
   */
  BEGIN: goog.fx.Transition.EventType.BEGIN,

  /**
   * Dispatched only when animation is restarted after a pause.
   * @deprecated Use goog.fx.Transition.EventType.RESUME.
   */
  RESUME: goog.fx.Transition.EventType.RESUME,

  /**
   * Dispatched when animation comes to the end of its duration OR stop
   * is called.
   * @deprecated Use goog.fx.Transition.EventType.END.
   */
  END: goog.fx.Transition.EventType.END,

  /**
   * Dispatched only when stop is called.
   * @deprecated Use goog.fx.Transition.EventType.STOP.
   */
  STOP: goog.fx.Transition.EventType.STOP,

  /**
   * Dispatched only when animation comes to its end naturally.
   * @deprecated Use goog.fx.Transition.EventType.FINISH.
   */
  FINISH: goog.fx.Transition.EventType.FINISH,

  /**
   * Dispatched when an animation is paused.
   * @deprecated Use goog.fx.Transition.EventType.PAUSE.
   */
  PAUSE: goog.fx.Transition.EventType.PAUSE,

  /**
   * Dispatched each frame of the animation.  This is where the actual animator
   * will listen.
   */
  ANIMATE: 'animate',

  /**
   * Dispatched when the animation is destroyed.
   */
  DESTROY: 'destroy'
};


/**
 * @deprecated Use goog.fx.anim.TIMEOUT.
 */
goog.fx.Animation.TIMEOUT = goog.fx.anim.TIMEOUT;


/**
 * Enum for the possible states of an animation.
 * @deprecated Use goog.fx.Transition.State instead.
 * @enum {number}
 */
goog.fx.Animation.State = goog.fx.TransitionBase.State;


/**
 * @deprecated Use goog.fx.anim.setAnimationWindow.
 * @param {Window} animationWindow The window in which to animate elements.
 */
goog.fx.Animation.setAnimationWindow = function(animationWindow) {
  'use strict';
  goog.fx.anim.setAnimationWindow(animationWindow);
};


/**
 * Starts or resumes an animation.
 * @param {boolean=} opt_restart Whether to restart the
 *     animation from the beginning if it has been paused.
 * @return {boolean} Whether animation was started.
 * @override
 */
goog.fx.Animation.prototype.play = function(opt_restart) {
  'use strict';
  if (opt_restart || this.isStopped()) {
    this.progress = 0;
    this.coords = this.startPoint;
  } else if (this.isPlaying()) {
    return false;
  }

  goog.fx.anim.unregisterAnimation(this);

  var now = /** @type {number} */ (goog.now());

  this.startTime = now;
  if (this.isPaused()) {
    this.startTime -= this.duration * this.progress;
  }

  this.endTime = this.startTime + this.duration;
  this.lastFrame = this.startTime;

  if (!this.progress) {
    this.onBegin();
  }

  this.onPlay();

  if (this.isPaused()) {
    this.onResume();
  }

  this.setStatePlaying();

  goog.fx.anim.registerAnimation(this);
  this.cycle(now);

  return true;
};


/**
 * Stops the animation.
 * @param {boolean=} opt_gotoEnd If true the animation will move to the
 *     end coords.
 * @override
 */
goog.fx.Animation.prototype.stop = function(opt_gotoEnd) {
  'use strict';
  goog.fx.anim.unregisterAnimation(this);
  this.setStateStopped();

  if (opt_gotoEnd) {
    this.progress = 1;
  }

  this.updateCoords_(this.progress);

  this.onStop();
  this.onEnd();
};


/**
 * Pauses the animation (iff it's playing).
 * @override
 */
goog.fx.Animation.prototype.pause = function() {
  'use strict';
  if (this.isPlaying()) {
    goog.fx.anim.unregisterAnimation(this);
    this.setStatePaused();
    this.onPause();
  }
};


/**
 * @return {number} The current progress of the animation, the number
 *     is between 0 and 1 inclusive.
 */
goog.fx.Animation.prototype.getProgress = function() {
  'use strict';
  return this.progress;
};


/**
 * Sets the progress of the animation.
 * @param {number} progress The new progress of the animation.
 */
goog.fx.Animation.prototype.setProgress = function(progress) {
  'use strict';
  this.progress = progress;
  if (this.isPlaying()) {
    var now = goog.now();
    // If the animation is already playing, we recompute startTime and endTime
    // such that the animation plays consistently, that is:
    // now = startTime + progress * duration.
    this.startTime = now - this.duration * this.progress;
    this.endTime = this.startTime + this.duration;
  }
};


/**
 * Disposes of the animation.  Stops an animation, fires a 'destroy' event and
 * then removes all the event handlers to clean up memory.
 * @override
 * @protected
 */
goog.fx.Animation.prototype.disposeInternal = function() {
  'use strict';
  if (!this.isStopped()) {
    this.stop(false);
  }
  this.onDestroy();
  goog.fx.Animation.base(this, 'disposeInternal');
};


/**
 * Stops an animation, fires a 'destroy' event and then removes all the event
 * handlers to clean up memory.
 * @deprecated Use dispose() instead.
 */
goog.fx.Animation.prototype.destroy = function() {
  'use strict';
  this.dispose();
};


/** @override */
goog.fx.Animation.prototype.onAnimationFrame = function(now) {
  'use strict';
  this.cycle(now);
};


/**
 * Handles the actual iteration of the animation in a timeout
 * @param {number} now The current time.
 */
goog.fx.Animation.prototype.cycle = function(now) {
  'use strict';
  goog.asserts.assertNumber(this.startTime);
  goog.asserts.assertNumber(this.endTime);
  goog.asserts.assertNumber(this.lastFrame);
  // Happens in rare system clock reset.
  if (now < this.startTime) {
    this.endTime = now + this.endTime - this.startTime;
    this.startTime = now;
  }
  this.progress = (now - this.startTime) / (this.endTime - this.startTime);

  if (this.progress > 1) {
    this.progress = 1;
  }

  this.fps_ = 1000 / (now - this.lastFrame);
  this.lastFrame = now;

  this.updateCoords_(this.progress);

  // Animation has finished.
  if (this.progress == 1) {
    this.setStateStopped();
    goog.fx.anim.unregisterAnimation(this);

    this.onFinish();
    this.onEnd();

    // Animation is still under way.
  } else if (this.isPlaying()) {
    this.onAnimate();
  }
};


/**
 * Calculates current coordinates, based on the current state.  Applies
 * the acceleration function if it exists.
 * @param {number} t Percentage of the way through the animation as a decimal.
 * @private
 */
goog.fx.Animation.prototype.updateCoords_ = function(t) {
  'use strict';
  if (typeof this.accel_ === 'function') {
    t = this.accel_(t);
  }
  this.coords = new Array(this.startPoint.length);
  for (var i = 0; i < this.startPoint.length; i++) {
    this.coords[i] =
        (this.endPoint[i] - this.startPoint[i]) * t + this.startPoint[i];
  }
};


/**
 * Dispatches the ANIMATE event. Sub classes should override this instead
 * of listening to the event.
 * @protected
 */
goog.fx.Animation.prototype.onAnimate = function() {
  'use strict';
  this.dispatchAnimationEvent(goog.fx.Animation.EventType.ANIMATE);
};


/**
 * Dispatches the DESTROY event. Sub classes should override this instead
 * of listening to the event.
 * @protected
 */
goog.fx.Animation.prototype.onDestroy = function() {
  'use strict';
  this.dispatchAnimationEvent(goog.fx.Animation.EventType.DESTROY);
};


/** @override */
goog.fx.Animation.prototype.dispatchAnimationEvent = function(type) {
  'use strict';
  this.dispatchEvent(new goog.fx.AnimationEvent(type, this));
};



/**
 * Class for an animation event object.
 * @param {string} type Event type.
 * @param {goog.fx.Animation} anim An animation object.
 * @constructor
 * @struct
 * @extends {goog.events.Event}
 */
goog.fx.AnimationEvent = function(type, anim) {
  'use strict';
  goog.fx.AnimationEvent.base(this, 'constructor', type);

  /**
   * The current coordinates.
   * @type {Array<number>}
   */
  this.coords = anim.coords;

  /**
   * The x coordinate.
   * @type {number}
   */
  this.x = anim.coords[0];

  /**
   * The y coordinate.
   * @type {number}
   */
  this.y = anim.coords[1];

  /**
   * The z coordinate.
   * @type {number}
   */
  this.z = anim.coords[2];

  /**
   * The current duration.
   * @type {number}
   */
  this.duration = anim.duration;

  /**
   * The current progress.
   * @type {number}
   */
  this.progress = anim.getProgress();

  /**
   * Frames per second so far.
   */
  this.fps = anim.fps_;

  /**
   * The state of the animation.
   * @type {number}
   */
  this.state = anim.getStateInternal();

  /**
   * The animation object.
   * @type {goog.fx.Animation}
   */
  // TODO(arv): This can be removed as this is the same as the target
  this.anim = anim;
};
goog.inherits(goog.fx.AnimationEvent, goog.events.Event);


/**
 * Returns the coordinates as integers (rounded to nearest integer).
 * @return {!Array<number>} An array of the coordinates rounded to
 *     the nearest integer.
 */
goog.fx.AnimationEvent.prototype.coordsAsInts = function() {
  'use strict';
  return this.coords.map(Math.round);
};
