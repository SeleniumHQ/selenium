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
 * @fileoverview An interface for transition animation. This is a simple
 * interface that allows for playing and stopping a transition. It adds
 * a simple event model with BEGIN and END event.
 *
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.fx.Transition');
goog.provide('goog.fx.Transition.EventType');



/**
 * An interface for programmatic transition. Must extend
 * {@code goog.events.EventTarget}.
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
