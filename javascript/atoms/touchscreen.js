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
 */

goog.provide('bot.Touchscreen');

goog.require('bot');
goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.style');



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
bot.Touchscreen.prototype.touchCounter_ = 1;


/**
 * Press the touch screen.  Pressing before moving results in an exception.
 * Pressing while already pressed also results in an exception.
 *
 * @param {boolean=} opt_press2 Whether or not press the second finger during
 *     the press.  If not defined or false, only the primary finger will be
 *     pressed.
 */
bot.Touchscreen.prototype.press = function(opt_press2) {
  if (this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot press touchscreen when already pressed.');
  }

  this.hasMovedAfterPress_ = false;
  this.touchIdentifier_ = this.touchCounter_++;
  if (opt_press2) {
    this.touchIdentifier2_ = this.touchCounter_++;
  }

  this.fireTouchEvent_(bot.events.EventType.TOUCHSTART);
};


/**
 * Releases an element on a touchscreen.  Releasing an element that is not
 * pressed results in an exception.
 */
bot.Touchscreen.prototype.release = function() {
  if (!this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot release touchscreen when not already pressed.');
  }

  this.fireTouchEvent_(bot.events.EventType.TOUCHEND);

  // If no movement occurred since press, TouchScreen.Release will fire the
  // legacy mouse events: mousemove, mousedown, mouseup, and click
  // after the touch events have been fired. The click button should be zero
  // and only one mousemove should fire.
  if (!this.hasMovedAfterPress_) {
    this.fireMouseEvent(bot.events.EventType.MOUSEMOVE, this.clientXY_, 0);
    var performFocus = this.fireMouseEvent(bot.events.EventType.MOUSEDOWN,
                                           this.clientXY_, 0);
    // Element gets focus after the mousedown event only if the mousedown was
    // not cancelled.
    if (performFocus) {
      this.focusOnElement();
    }

    this.fireMouseEvent(bot.events.EventType.MOUSEUP, this.clientXY_, 0);

    // Special click logic to follow links and to perform form actions.
    this.clickElement(this.clientXY_, /* button value */ 0);
  }
  this.touchIdentifier_ = 0;
  this.touchIdentifier2_ = 0;
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
  // The target element for touch actions is the original element. Hence, the
  // element is set only when the touchscreen is not currently being pressed.
  if (!this.isPressed()) {
    this.setElement(element);
  }

  var pos = goog.style.getClientPosition(element);
  this.clientXY_.x = coords.x + pos.x;
  this.clientXY_.y = coords.y + pos.y;

  if (goog.isDef(opt_coords2)) {
    this.clientXY2_.x = opt_coords2.x + pos.x;
    this.clientXY2_.y = opt_coords2.y + pos.y;
  }

  if (this.isPressed()) {
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
  return !!this.touchIdentifier_;
};


/**
 * A helper function to fire touch events.
 *
 * @param {bot.events.EventType} type Event type.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @private
 */
bot.Touchscreen.prototype.fireTouchEvent_ = function(type) {
  if (!this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Should never fire event when touchscreen is not pressed.');
  }
  var touchIdentifier2;
  var coords2;
  if (this.touchIdentifier2_) {
    touchIdentifier2 = this.touchIdentifier2_;
    coords2 = this.clientXY2_;
  }
  return this.fireTouchEvent(type, this.touchIdentifier_, this.clientXY_,
                             touchIdentifier2, coords2);
};
