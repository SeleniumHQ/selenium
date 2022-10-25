// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview The file contains an abstraction of a touch screen
 * for simulating atomic touchscreen actions.
 */

goog.provide('bot.Touchscreen');

goog.require('bot');
goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.events.EventType');
goog.require('goog.dom.TagName');
goog.require('goog.math.Coordinate');
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
bot.Touchscreen = function () {
  goog.base(this);

  /** @private {!goog.math.Coordinate} */
  this.clientXY_ = new goog.math.Coordinate(0, 0);

  /** @private {!goog.math.Coordinate} */
  this.clientXY2_ = new goog.math.Coordinate(0, 0);
};
goog.inherits(bot.Touchscreen, bot.Device);


/** @private {boolean} */
bot.Touchscreen.prototype.fireMouseEventsOnRelease_ = true;


/** @private {boolean} */
bot.Touchscreen.prototype.cancelled_ = false;


/** @private {number} */
bot.Touchscreen.prototype.touchIdentifier_ = 0;


/** @private {number} */
bot.Touchscreen.prototype.touchIdentifier2_ = 0;


/** @private {number} */
bot.Touchscreen.prototype.touchCounter_ = 2;


/**
 * Press the touch screen.  Pressing before moving results in an exception.
 * Pressing while already pressed also results in an exception.
 *
 * @param {boolean=} opt_press2 Whether or not press the second finger during
 *     the press.  If not defined or false, only the primary finger will be
 *     pressed.
 */
bot.Touchscreen.prototype.press = function (opt_press2) {
  if (this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
      'Cannot press touchscreen when already pressed.');
  }

  this.touchIdentifier_ = this.touchCounter_++;
  if (opt_press2) {
    this.touchIdentifier2_ = this.touchCounter_++;
  }

  if (bot.userAgent.IE_DOC_10) {
    this.fireMouseEventsOnRelease_ = true;
    this.firePointerEvents_(bot.Touchscreen.fireSinglePressPointer_);
  } else {
    this.fireMouseEventsOnRelease_ = this.fireTouchEvent_(
      bot.events.EventType.TOUCHSTART);
  }
};


/**
 * Releases an element on a touchscreen.  Releasing an element that is not
 * pressed results in an exception.
 */
bot.Touchscreen.prototype.release = function () {
  if (!this.isPressed()) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
      'Cannot release touchscreen when not already pressed.');
  }

  if (!bot.userAgent.IE_DOC_10) {
    this.fireTouchReleaseEvents_();
  } else if (!this.cancelled_) {
    this.firePointerEvents_(bot.Touchscreen.fireSingleReleasePointer_);
  }
  bot.Device.clearPointerMap();
  this.touchIdentifier_ = 0;
  this.touchIdentifier2_ = 0;
  this.cancelled_ = false;
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
bot.Touchscreen.prototype.move = function (element, coords, opt_coords2) {
  // The target element for touch actions is the original element. Hence, the
  // element is set only when the touchscreen is not currently being pressed.
  // The exception is IE10 which fire events on the moved to element.
  var originalElement = this.getElement();
  if (!this.isPressed() || bot.userAgent.IE_DOC_10) {
    this.setElement(element);
  }

  var rect = bot.dom.getClientRect(element);
  this.clientXY_.x = coords.x + rect.left;
  this.clientXY_.y = coords.y + rect.top;

  if (goog.isDef(opt_coords2)) {
    this.clientXY2_.x = opt_coords2.x + rect.left;
    this.clientXY2_.y = opt_coords2.y + rect.top;
  }

  if (this.isPressed()) {
    if (!bot.userAgent.IE_DOC_10) {
      this.fireMouseEventsOnRelease_ = false;
      this.fireTouchEvent_(bot.events.EventType.TOUCHMOVE);
    } else if (!this.cancelled_) {
      if (element != originalElement) {
        this.fireMouseEventsOnRelease_ = false;
      }
      if (bot.Touchscreen.hasMsTouchActionsEnabled_(element)) {
        this.firePointerEvents_(bot.Touchscreen.fireSingleMovePointer_);
      } else {
        this.fireMSPointerEvent(bot.events.EventType.MSPOINTEROUT, coords, -1,
          this.touchIdentifier_, MSPointerEvent.MSPOINTER_TYPE_TOUCH, true);
        this.fireMouseEvent(bot.events.EventType.MOUSEOUT, coords, 0);
        this.fireMSPointerEvent(bot.events.EventType.MSPOINTERCANCEL, coords, 0,
          this.touchIdentifier_, MSPointerEvent.MSPOINTER_TYPE_TOUCH, true);
        this.cancelled_ = true;
        bot.Device.clearPointerMap();
      }
    }
  }
};


/**
 * Returns whether the touchscreen is currently pressed.
 *
 * @return {boolean} Whether the touchscreen is pressed.
 */
bot.Touchscreen.prototype.isPressed = function () {
  return !!this.touchIdentifier_;
};


/**
 * A helper function to fire touch events.
 *
 * @param {bot.events.EventType} type Event type.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @private
 */
bot.Touchscreen.prototype.fireTouchEvent_ = function (type) {
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


/**
 * A helper function to fire touch events that occur on a release.
 *
 * @private
 */
bot.Touchscreen.prototype.fireTouchReleaseEvents_ = function () {
  var touchendSuccess = this.fireTouchEvent_(bot.events.EventType.TOUCHEND);

  // In general, TouchScreen.Release will fire the legacy mouse events:
  // mousemove, mousedown, mouseup, and click after the touch events have been
  // fired. The click button should be zero and only one mousemove should fire.
  // Under the following cases, mouse events should not be fired:
  // 1. Movement has occurred since press.
  // 2. Any event handler for touchstart has called preventDefault().
  // 3. Any event handler for touchend has called preventDefault(), and browser
  // is Mobile Safari or Chrome.
  var fireMouseEvents =
    this.fireMouseEventsOnRelease_ &&
    (touchendSuccess || !(bot.userAgent.IOS ||
      goog.userAgent.product.CHROME));

  if (fireMouseEvents) {
    this.fireMouseEvent(bot.events.EventType.MOUSEMOVE, this.clientXY_, 0);
    var performFocus = this.fireMouseEvent(bot.events.EventType.MOUSEDOWN,
      this.clientXY_, 0);
    // Element gets focus after the mousedown event only if the mousedown was
    // not cancelled.
    if (performFocus) {
      this.focusOnElement();
    }
    this.maybeToggleOption();

    // If a mouseup event is dispatched to an interactable event, and that
    // mouseup would complete a click, then the click event must be dispatched
    // even if the element becomes non-interactable after the mouseup.
    var elementInteractableBeforeMouseup =
      bot.dom.isInteractable(this.getElement());
    this.fireMouseEvent(bot.events.EventType.MOUSEUP, this.clientXY_, 0);

    // Special click logic to follow links and to perform form actions.
    if (!(bot.userAgent.WINDOWS_PHONE &&
      bot.dom.isElement(this.getElement(), goog.dom.TagName.OPTION))) {
      this.clickElement(this.clientXY_,
                         /* button */ 0,
                         /* opt_force */ elementInteractableBeforeMouseup);
    }
  }
};


/**
 * A helper function to fire a sequence of Pointer events.
 * @param {function(!bot.Touchscreen, !Element, !goog.math.Coordinate, number,
 *     boolean)} fireSinglePointer A function that fires a set of events for one
 *     finger.
 * @private
 */
bot.Touchscreen.prototype.firePointerEvents_ = function (fireSinglePointer) {
  fireSinglePointer(this, this.getElement(), this.clientXY_,
    this.touchIdentifier_, true);
  if (this.touchIdentifier2_ &&
    bot.Touchscreen.hasMsTouchActionsEnabled_(this.getElement())) {
    fireSinglePointer(this, this.getElement(),
      this.clientXY2_, this.touchIdentifier2_, false);
  }
};


/**
 * A helper function to fire Pointer events related to a press.
 *
 * @param {!bot.Touchscreen} ts A touchscreen object.
 * @param {!Element} element Element that is being pressed.
 * @param {!goog.math.Coordinate} coords Coordinates relative to
 *   currentElement.
 * @param {number} id The touch identifier.
 * @param {boolean} isPrimary Whether the pointer represents the primary point
 *     of contact.
 * @private
 */
bot.Touchscreen.fireSinglePressPointer_ = function (ts, element, coords, id,
  isPrimary) {
  // Fire a mousemove event.
  ts.fireMouseEvent(bot.events.EventType.MOUSEMOVE, coords, 0);

  // Fire a MSPointerOver and mouseover events.
  ts.fireMSPointerEvent(bot.events.EventType.MSPOINTEROVER, coords, 0, id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);
  ts.fireMouseEvent(bot.events.EventType.MOUSEOVER, coords, 0);

  // Fire a MSPointerDown and mousedown events.
  ts.fireMSPointerEvent(bot.events.EventType.MSPOINTERDOWN, coords, 0, id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);

  // Element gets focus after the mousedown event.
  if (ts.fireMouseEvent(bot.events.EventType.MOUSEDOWN, coords, 0)) {
    // For selectable elements, IE 10 fires a MSGotPointerCapture event.
    if (bot.dom.isSelectable(element)) {
      ts.fireMSPointerEvent(bot.events.EventType.MSGOTPOINTERCAPTURE, coords, 0,
        id, MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);
    }
    ts.focusOnElement();
  }
};


/**
 * A helper function to fire Pointer events related to a release.
 *
 * @param {!bot.Touchscreen} ts A touchscreen object.
 * @param {!Element} element Element that is being released.
 * @param {!goog.math.Coordinate} coords Coordinates relative to
 *   currentElement.
 * @param {number} id The touch identifier.
 * @param {boolean} isPrimary Whether the pointer represents the primary point
 *     of contact.
 * @private
 */
bot.Touchscreen.fireSingleReleasePointer_ = function (ts, element, coords, id,
  isPrimary) {
  // Fire a MSPointerUp and mouseup events.
  ts.fireMSPointerEvent(bot.events.EventType.MSPOINTERUP, coords, 0, id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);

  // If a mouseup event is dispatched to an interactable event, and that mouseup
  // would complete a click, then the click event must be dispatched even if the
  // element becomes non-interactable after the mouseup.
  var elementInteractableBeforeMouseup =
    bot.dom.isInteractable(ts.getElement());
  ts.fireMouseEvent(bot.events.EventType.MOUSEUP, coords, 0, null, 0, false,
    id);

  // Fire a click.
  if (ts.fireMouseEventsOnRelease_) {
    ts.maybeToggleOption();
    if (!(bot.userAgent.WINDOWS_PHONE &&
      bot.dom.isElement(element, goog.dom.TagName.OPTION))) {
      ts.clickElement(ts.clientXY_,
                      /* button */ 0,
                      /* opt_force */ elementInteractableBeforeMouseup,
        id);
    }
  }

  if (bot.dom.isSelectable(element)) {
    // For selectable elements, IE 10 fires a MSLostPointerCapture event.
    ts.fireMSPointerEvent(bot.events.EventType.MSLOSTPOINTERCAPTURE,
      new goog.math.Coordinate(0, 0), 0, id,
      MSPointerEvent.MSPOINTER_TYPE_TOUCH, false);
  }

  // Fire a MSPointerOut and mouseout events.
  ts.fireMSPointerEvent(bot.events.EventType.MSPOINTEROUT, coords, -1, id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);
  ts.fireMouseEvent(bot.events.EventType.MOUSEOUT, coords, 0, null, 0, false,
    id);
};


/**
 * A helper function to fire Pointer events related to a move.
 *
 * @param {!bot.Touchscreen} ts A touchscreen object.
 * @param {!Element} element Element that is being moved.
 * @param {!goog.math.Coordinate} coords Coordinates relative to
 *   currentElement.
 * @param {number} id The touch identifier.
 * @param {boolean} isPrimary Whether the pointer represents the primary point
 *     of contact.
 * @private
 */
bot.Touchscreen.fireSingleMovePointer_ = function (ts, element, coords, id,
  isPrimary) {
  // Fire a MSPointerMove and mousemove events.
  ts.fireMSPointerEvent(bot.events.EventType.MSPOINTERMOVE, coords, -1, id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH, isPrimary);
  ts.fireMouseEvent(bot.events.EventType.MOUSEMOVE, coords, 0, null, 0, false,
    id);
};


/**
 * A function that determines whether an element can be manipulated by the user.
 * The msTouchAction style is queried and an element can be manipulated if the
 * style value is none. If an element cannot be manipulated, then move gestures
 * will result in a cancellation and multi-touch events will be prevented. Tap
 * gestures will still be allowed. If not on IE 10, the function returns true.
 *
 * @param {!Element} element The element being manipulated.
 * @return {boolean} Whether the element can be manipulated.
 * @private
 */
bot.Touchscreen.hasMsTouchActionsEnabled_ = function (element) {
  if (!bot.userAgent.IE_DOC_10) {
    throw new Error('hasMsTouchActionsEnable should only be called from IE 10');
  }

  // Although this particular element may have a style indicating that it cannot
  // receive javascript events, its parent may indicate otherwise.
  if (bot.dom.getEffectiveStyle(element, 'ms-touch-action') == 'none') {
    return true;
  } else {
    var parent = bot.dom.getParentElement(element);
    return !!parent && bot.Touchscreen.hasMsTouchActionsEnabled_(parent);
  }
};
