/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An interface for transition animation. This is a simple
 * interface that allows for playing and stopping a transition. It adds
 * a simple event model with BEGIN and END event.
 */

goog.provide('goog.fx.Transition');
goog.provide('goog.fx.Transition.EventType');



/**
 * An interface for programmatic transition. Must extend
 * `goog.events.EventTarget`.
 * @interface
 */
goog.fx.Transition = function() {};


/**
 * Transition event types.
 * @enum {string}
 */
goog.fx.Transition.EventType = {
  /** Dispatched when played for the first time OR when it is resumed. */
  PLAY: 'play',

  /** Dispatched only when the animation starts from the beginning. */
  BEGIN: 'begin',

  /** Dispatched only when animation is restarted after a pause. */
  RESUME: 'resume',

  /**
   * Dispatched when animation comes to the end of its duration OR stop
   * is called.
   */
  END: 'end',

  /** Dispatched only when stop is called. */
  STOP: 'stop',

  /** Dispatched only when animation comes to its end naturally. */
  FINISH: 'finish',

  /** Dispatched when an animation is paused. */
  PAUSE: 'pause'
};


/**
 * @type {function()}
 * Plays the transition.
 */
goog.fx.Transition.prototype.play;


/**
 * @type {function()}
 * Stops the transition.
 */
goog.fx.Transition.prototype.stop;
