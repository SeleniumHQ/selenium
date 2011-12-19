// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The file contains an abstraction of a touch screen
 * for simulating atomic touchscreen actions.
 *
 */

goog.provide('bot.Touchscreen');

goog.require('bot');
goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.userAgent.product');



/**
 * A TouchScreen that provides atomic touch actions.  The metaphor
 * for this abstraction is a finger moving above the touchscreen that
 * can press and then release the touchscreen when specified.
 *
 * The touchscreen supports three actions: press, release, and move.
 *
 * @constructor
 * @extends {bot.Device}
 */
bot.Touchscreen = function() {
  goog.base(this);

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.clientXY_ = new goog.math.Coordinate(0, 0);

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.clientXY2_ = new goog.math.Coordinate(0, 0);
};
goog.inherits(bot.Touchscreen, bot.Device);


/**
 * @type {Element}
 * @private
 */
bot.Touchscreen.prototype.elementPressed_ = null;


/**
 * @type {boolean}
 * @private
 */
bot.Touchscreen.prototype.secondPressed_ = false;


/**
 * @type {boolean}
 * @private
 */
bot.Touchscreen.prototype.hasMovedAfterPress_ = false;


/**
 * @type {number}
 * @private
 */
bot.Touchscreen.prototype.touchIdentifier_ = 0;


/**
 * @type {number}
 * @private
 */
bot.Touchscreen.prototype.touchIdentifier2_ = 0;


/**
 * @type {number}
 * @private
 */
bot.Touchscreen.prototype.touchCounter_ = 0;


/**
 * Press the touch screen.  Pressing before moving results in an exception.
 * Pressing while already pressed also results in an exception.
 *
 * @param {boolean=} opt_press2 Whether or not press the second finger during
 *     the press.  If not defined or false, only the primary finger will be
 *     pressed.
 */
bot.Touchscreen.prototype.press = function(opt_press2) {
  if (this.elementPressed_) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot press touchscreen when already pressed.');
  }

  // Keep track of the element where the press originated because Touchend
  // events must be fired on element where the TouchStart event was fired.
  this.elementPressed_ = this.getElement();
  this.hasMovedAfterPress_ = false;
  this.touchIdentifier_ = this.touchCounter_++;

  if (opt_press2) {
    this.secondPressed_ = true;
    this.touchIdentifier2_ = this.touchCounter_++;
  }

  this.fireTouchEvent_(bot.events.EventType.TOUCHSTART);
};


/**
 * Releases an element on a touchscreen.  Releasing an element that is not
 * pressed results in an exception.
 */
bot.Touchscreen.prototype.release = function() {
  if (!this.elementPressed_) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot release touchscreen when not already pressed.');
  }

  this.fireTouchEvent_(bot.events.EventType.TOUCHEND);

  // If no movement occurred since press, TouchScreen.Release will fire the
  // legacy mouse events: mousemove, mousedown, mouseup, and click
  // after the touch events have been fired. The click button should be zero
  // and only one mousemove should fire.
  if (!this.hasMovedAfterPress_) {
    this.fireMouseEvent_(bot.events.EventType.MOUSEMOVE);
    var performFocus = this.fireMouseEvent_(bot.events.EventType.MOUSEDOWN);

    // Element gets focus after the mousedown event only if the mousedown was
    // not cancelled.
    if (performFocus) {
      this.focusOnElement();
    }

    this.fireMouseEvent_(bot.events.EventType.MOUSEUP);

    // Special click logic to follow links and to perform form actions.
    this.clickElement(this.clientXY_, /* button value */ 0);
  }
  this.elementPressed_ = null;
  this.secondPressed_ = false;
};


/**
 * Moves finger along the touchscreen.
 *
 * @param {!Element} element Element that is being pressed.
 * @param {!goog.math.Coordinate} coords Coordinates relative to
 *   currentElement.
 * @param {goog.math.Coordinate=} opt_coords2 Coordinates relative to
 *   currentElement.
 */
bot.Touchscreen.prototype.move = function(element, coords, opt_coords2) {
  this.setElement(element);

  var pos = goog.style.getClientPosition(element);
  this.clientXY_.x = coords.x + pos.x;
  this.clientXY_.y = coords.y + pos.y;

  if (goog.isDef(opt_coords2)) {
    this.clientXY2_.x = opt_coords2.x + pos.x;
    this.clientXY2_.y = opt_coords2.y + pos.y;
  }

  if (this.elementPressed_) {
    this.hasMovedAfterPress_ = true;
    this.fireTouchEvent_(bot.events.EventType.TOUCHMOVE);
  }
};


/**
 * Returns whether the touchscreen is currently pressed.
 *
 * @return {boolean} Whether the touchscreen is pressed.
 */
bot.Touchscreen.prototype.isPressed = function() {
  return !!this.elementPressed_;
};


/**
 * A helper function to fire touch events.
 *
 * @param {bot.events.EventType} type Event type.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @private
 */
bot.Touchscreen.prototype.fireTouchEvent_ = function(type) {
  if (!this.elementPressed_) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Should never fire event when touchscreen is not pressed.');
  }
  var args = {
    touches: [],
    targetTouches: [],
    changedTouches: [],
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    relatedTarget: null,
    scale: 0,
    rotation: 0
  };
  bot.Touchscreen.addTouch_(type, args, this.touchIdentifier_, this.clientXY_);

  if (this.secondPressed_) {
    bot.Touchscreen.addTouch_(type, args, this.touchIdentifier2_,
                              this.clientXY2_);
  }

  // TODO(user): Store the value of the pressed element in this.element,
  // and add a fireTouchEvent function to bot.Device to fire the event.
  return bot.events.fire(this.elementPressed_, type, args);
};


/**
 * A helper function to add a touch event to the TouchArgs.
 *
 * @param {!bot.events.EventType} type Event type.
 * @param {!bot.events.TouchArgs} touchArgs Arguments for touch.
 * @param {number} identifier Unique identifier for the touch.
 * @param {!goog.math.Coordinate} coords Coordinates of the touch.
 * @private
 */
bot.Touchscreen.addTouch_ = function(type, touchArgs, identifier, coords) {
  // Android devices leave identifier to zero.
  var id = goog.userAgent.product.ANDROID ? 0 : identifier;
  var touch = {
    identifier: id,
    screenX: coords.x,
    screenY: coords.y,
    clientX: coords.x,
    clientY: coords.y,
    pageX: coords.x,
    pageY: coords.y
  };

  touchArgs.changedTouches.push(touch);
  if (type == bot.events.EventType.TOUCHSTART ||
      type == bot.events.EventType.TOUCHMOVE) {
    touchArgs.touches.push(touch);
    touchArgs.targetTouches.push(touch);
  }
};


/**
 * Fire a mouse event.
 *
 * @param {bot.events.EventType} type Type of mouse event.
 * @return {boolean} Whether the event was fired successfully or was cancelled.
 * @private
*/
bot.Touchscreen.prototype.fireMouseEvent_ = function(type) {
  if (!this.elementPressed_) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Should never fire a mouse event when touchscreen is not pressed.');
  }
  // All supported mobile browsers (android, iOS) set the button to zero.
  return this.fireMouseEvent(type, this.clientXY_, 0);
};
