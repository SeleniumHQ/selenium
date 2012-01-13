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
 * @fileoverview The file contains an abstraction of a mouse for
 * simulating the mouse actions.
 *
 */

goog.provide('bot.Mouse');
goog.provide('bot.Mouse.Button');

goog.require('bot');
goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.events.EventType');
goog.require('bot.userAgent');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * A mouse that provides atomic mouse actions. This mouse currently only
 * supports having one button pressed at a time.
 *
 * @constructor
 * @extends {bot.Device}
 */
bot.Mouse = function() {
  goog.base(this);

  /**
   * @type {?bot.Mouse.Button}
   * @private
   */
  this.buttonPressed_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.elementPressed_ = null;

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.clientXY_ = new goog.math.Coordinate(0, 0);

  /**
   * @type {boolean}
   * @private
   */
  this.nextClickIsDoubleClick_ = false;

  /**
   * Whether this Mouse has ever explicitly interacted with any element.
   *
   * @type {boolean}
   * @private
   */
  this.hasEverInteracted_ = false;
};
goog.inherits(bot.Mouse, bot.Device);


/**
 * Enumeration of mouse buttons that can be pressed.
 *
 * @enum {number}
 */
bot.Mouse.Button = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Index to indicate no button pressed in bot.Mouse.MOUSE_BUTTON_VALUE_MAP_.
 *
 * @type {number}
 * @private
 * @const
 */
bot.Mouse.NO_BUTTON_VALUE_INDEX_ = 3;


/**
 * Maps mouse events to an array of button argument value for each mouse button.
 * The array is indexed by the bot.Mouse.Button values. It encodes this table,
 * where each cell contains the (left/middle/right/none) button values.
 *               click/    mouseup/   mouseout/  mousemove  contextmenu
 *               dblclick/ mousedown  mouseover
 * IE_DOC_PRE9   0 0 0 X   1 4 2 X    0 0 0 0    1 4 2 0    X X 0 X
 * WEBKIT/IE9    0 1 2 X   0 1 2 X    0 1 2 0    0 1 2 0    X X 2 X
 * GECKO/OPERA   0 1 2 X   0 1 2 X    0 0 0 0    0 0 0 0    X X 2 X
 *
 * @type {!Object.<bot.events.EventType, !Array.<?number>>}
 * @private
 * @const
 */
bot.Mouse.MOUSE_BUTTON_VALUE_MAP_ = (function() {
  // EventTypes can safely be used as keys without collisions in a JS Object,
  // because its toString method returns a unique string (the event type name).
  var buttonValueMap = {};
  if (bot.userAgent.IE_DOC_PRE9) {
    buttonValueMap[bot.events.EventType.CLICK] = [0, 0, 0, null];
    buttonValueMap[bot.events.EventType.CONTEXTMENU] = [null, null, 0, null];
    buttonValueMap[bot.events.EventType.MOUSEUP] = [1, 4, 2, null];
    buttonValueMap[bot.events.EventType.MOUSEOUT] = [0, 0, 0, 0];
    buttonValueMap[bot.events.EventType.MOUSEMOVE] = [1, 4, 2, 0];
  } else if (goog.userAgent.WEBKIT || bot.userAgent.IE_DOC_9) {
    buttonValueMap[bot.events.EventType.CLICK] = [0, 1, 2, null];
    buttonValueMap[bot.events.EventType.CONTEXTMENU] = [null, null, 2, null];
    buttonValueMap[bot.events.EventType.MOUSEUP] = [0, 1, 2, null];
    buttonValueMap[bot.events.EventType.MOUSEOUT] = [0, 1, 2, 0];
    buttonValueMap[bot.events.EventType.MOUSEMOVE] = [0, 1, 2, 0];
  } else {
    buttonValueMap[bot.events.EventType.CLICK] = [0, 1, 2, null];
    buttonValueMap[bot.events.EventType.CONTEXTMENU] = [null, null, 2, null];
    buttonValueMap[bot.events.EventType.MOUSEUP] = [0, 1, 2, null];
    buttonValueMap[bot.events.EventType.MOUSEOUT] = [0, 0, 0, 0];
    buttonValueMap[bot.events.EventType.MOUSEMOVE] = [0, 0, 0, 0];
  }

  buttonValueMap[bot.events.EventType.DBLCLICK] =
      buttonValueMap[bot.events.EventType.CLICK];
  buttonValueMap[bot.events.EventType.MOUSEDOWN] =
      buttonValueMap[bot.events.EventType.MOUSEUP];
  buttonValueMap[bot.events.EventType.MOUSEOVER] =
      buttonValueMap[bot.events.EventType.MOUSEOUT];
  return buttonValueMap;
})();


/**
 * Attempts to fire a mousedown event and then returns whether or not the
 * element should receive focus as a result of the mousedown.
 *
 * @return {boolean} Whether to focus on the element after the mousedown.
 * @private
 */
bot.Mouse.prototype.fireMousedown_ = function() {
  // On some browsers, a mouse down event on an OPTION or SELECT element cause
  // the SELECT to open, blocking further JS execution. This is undesirable,
  // and so needs to be detected. We always focus in this case.
  // TODO(user): This is a nasty way to avoid locking the browser
  var isFirefox3 = goog.userAgent.GECKO && !bot.userAgent.isProductVersion(4);
  var blocksOnMousedown = (goog.userAgent.WEBKIT || isFirefox3) &&
      (bot.dom.isElement(this.getElement(), goog.dom.TagName.OPTION) ||
       bot.dom.isElement(this.getElement(), goog.dom.TagName.SELECT));
  if (blocksOnMousedown) {
    return true;
  }

  // On some browsers, if the mousedown event handler makes a focus() call to
  // change the active element, this preempts the focus that would happen by
  // default on the mousedown, so we should not explicitly focus in this case.
  var beforeActiveElement;
  var mousedownCanPreemptFocus = goog.userAgent.GECKO || goog.userAgent.IE;
  if (mousedownCanPreemptFocus) {
    beforeActiveElement = bot.dom.getActiveElement(this.getElement());
  }
  var performFocus = this.fireMouseEvent_(bot.events.EventType.MOUSEDOWN);
  if (performFocus && mousedownCanPreemptFocus &&
      beforeActiveElement != bot.dom.getActiveElement(this.getElement())) {
    return false;
  }
  return performFocus;
};


/**
 * Press a mouse button on an element that the mouse is interacting with.
 *
 * @param {!bot.Mouse.Button} button Button.
*/
bot.Mouse.prototype.pressButton = function(button) {
  if (!goog.isNull(this.buttonPressed_)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot press more then one button or an already pressed button.');
  }
  this.buttonPressed_ = button;
  this.elementPressed_ = this.getElement();

  var performFocus = this.fireMousedown_();
  if (performFocus) {
    this.focusOnElement();
  }
};


/**
 * Releases the pressed mouse button. Throws exception if no button pressed.
 *
 */
bot.Mouse.prototype.releaseButton = function() {
  if (goog.isNull(this.buttonPressed_)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot release a button when no button is pressed.');
  }

  this.fireMouseEvent_(bot.events.EventType.MOUSEUP);

  // TODO(user): Middle button can also trigger click.
  if (this.buttonPressed_ == bot.Mouse.Button.LEFT &&
      this.getElement() == this.elementPressed_) {
    this.clickElement(this.clientXY_,
        this.getButtonValue_(bot.events.EventType.CLICK));
    this.maybeDoubleClickElement_();

  // TODO(user): In Linux, this fires after mousedown event.
  } else if (this.buttonPressed_ == bot.Mouse.Button.RIGHT) {
    this.fireMouseEvent_(bot.events.EventType.CONTEXTMENU);
  }
  this.buttonPressed_ = null;
  this.elementPressed_ = null;
};


/**
 * A helper function to fire mouse double click events.
 *
 * @private
 */
bot.Mouse.prototype.maybeDoubleClickElement_ = function() {
  // Trigger an additional double click event if it is the second click.
  if (this.nextClickIsDoubleClick_) {
    this.fireMouseEvent_(bot.events.EventType.DBLCLICK);
  }
  this.nextClickIsDoubleClick_ = !this.nextClickIsDoubleClick_;
};


/**
 * Given a coordinates (x,y) related to an element, move mouse to (x,y) of the
 * element. The top-left point of the element is (0,0).
 *
 * @param {!Element} element The destination element.
 * @param {!goog.math.Coordinate} coords Mouse position related to the target.
 */
bot.Mouse.prototype.move = function(element, coords) {
  var pos = goog.style.getClientPosition(element);
  this.clientXY_.x = coords.x + pos.x;
  this.clientXY_.y = coords.y + pos.y;

  if (element != this.getElement()) {
    // For the first mouse interaction on a page, if the mouse was over the
    // browser window, the browser will pass null as the relatedTarget for the
    // mousever event. For subsequent interactions, it will pass the
    // last-focused element. Unfortunately, we don't have anywhere to keep the
    // state of which elements have been focused across Mouse instances, so we
    // treat every Mouse initially positioned over the documentElement or body
    // as if it's on a new page. Accordingly, for complex actions (e.g.
    // drag-and-drop), a single Mouse instance should be used for the whole
    // action, to ensure the correct relatedTargets are fired for any events.
    var isRootElement =
        this.getElement() === bot.getDocument().documentElement ||
        this.getElement() === bot.getDocument().body;
    var prevElement =
        (!this.hasEverInteracted_ && isRootElement) ? null : this.getElement();

    this.fireMouseEvent_(bot.events.EventType.MOUSEOUT, element);
    this.setElement(element);
    this.fireMouseEvent_(bot.events.EventType.MOUSEOVER, prevElement);
  }

  this.fireMouseEvent_(bot.events.EventType.MOUSEMOVE);

  this.nextClickIsDoubleClick_ = false;
};


/**
 * A helper function to fire mouse events.
 *
 * @param {bot.events.EventType} type Event type.
 * @param {Element=} opt_related The related element of this event.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @private
 */
bot.Mouse.prototype.fireMouseEvent_ = function(type, opt_related) {
  this.hasEverInteracted_ = true;
  return this.fireMouseEvent(type, this.clientXY_,
      this.getButtonValue_(type), opt_related);
};


/**
 * Given an event type and a mouse button, sets the mouse button value used
 * for that event on the current browser. The mouse button value is 0 for any
 * event not covered by bot.Mouse.MOUSE_BUTTON_VALUE_MAP_.
 *
 * @param {bot.events.EventType} eventType Type of mouse event.
 * @return {number} The mouse button ID value to the current browser.
 * @private
*/
bot.Mouse.prototype.getButtonValue_ = function(eventType) {
  if (!(eventType in bot.Mouse.MOUSE_BUTTON_VALUE_MAP_)) {
    return 0;
  }

  var buttonIndex = goog.isNull(this.buttonPressed_) ?
      bot.Mouse.NO_BUTTON_VALUE_INDEX_ : this.buttonPressed_;
  var buttonValue = bot.Mouse.MOUSE_BUTTON_VALUE_MAP_[eventType][buttonIndex];
  if (goog.isNull(buttonValue)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Event does not permit the specified mouse button.');
  }
  return buttonValue;
};
