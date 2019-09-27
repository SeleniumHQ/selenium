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
 * @fileoverview Synthetic events for fun and profit.
 */

goog.provide('webdriver.atoms.inputs');

goog.require('bot.Keyboard');
goog.require('bot.Mouse');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('webdriver.atoms.element');


/**
 * Send keyboard input to a particular element.
 *
 * @param {?Element} element The element to send the keyboard input to, or
 *     `null` to use the document's active element.
 * @param {!Array.<string>} keys The keys to type on the element.
 * @param {bot.Keyboard.State=} opt_state The predefined keyboard state to use.
 * @param {boolean=} opt_persistModifiers Whether modifier keys should remain
 *     pressed when this function ends.
 * @return {bot.Keyboard.State} The keyboard state.
 */
webdriver.atoms.inputs.sendKeys = function(
    element, keys, opt_state, opt_persistModifiers) {
  var keyboard = new bot.Keyboard(opt_state);
  if (!element) {
    element = bot.dom.getActiveElement(document);
  }
  if (!element) {
    throw Error('No element to send keys to');
  }
  webdriver.atoms.element.type(element, keys, keyboard, opt_persistModifiers);

  return keyboard.getState();
};


/**
 * Click on an element.
 *
 * @param {?Element} element The element to click.
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.click = function(element, opt_state) {
  var mouse = new bot.Mouse(opt_state);
  if (!element) {
    element = mouse.getState().element;
  }
  if (!element) {
    throw Error('No element to send keys to');
  }
  bot.action.click(element, null, mouse);
  return mouse.getState();
};


/**
 * Move the mouse to a specific element and/or coordinate location.
 *
 * @param {?Element} element The element to move the mouse to.
 * @param {?number} xOffset The x coordinate to use as an offset.
 * @param {?number} yOffset The y coordinate to use as an offset.
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 * @suppress {reportUnknownTypes}
 */
webdriver.atoms.inputs.mouseMove = function(element, xOffset, yOffset,
    opt_state) {
  var mouse = new bot.Mouse(opt_state);
  var target = element || mouse.getState()['element'];

  var offsetSpecified = (xOffset != null) && (yOffset != null);
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;

  // If we have specified an element and no offset, we should
  // move the mouse to the center of the specified element.
  if (element) {
    if (!offsetSpecified) {
      var size = bot.action.getInteractableSize(element);
      xOffset = Math.floor(size.width / 2);
      yOffset = Math.floor(size.height / 2);
    }
  } else {
    // Moving to an absolute offset from the current target element,
    // so we have to account for the existing offset of the current
    // mouse position to the element origin (upper-left corner).
    var pos = goog.style.getClientPosition(target);
    xOffset += (mouse.getState()['clientXY']['x'] - pos.x);
    yOffset += (mouse.getState()['clientXY']['y'] - pos.y);
  }

  var doc = goog.dom.getOwnerDocument(target);
  goog.dom.getWindow(doc);
  bot.action.scrollIntoView(
      target, new goog.math.Coordinate(xOffset, yOffset));

  var coords = new goog.math.Coordinate(xOffset, yOffset);
  mouse.move(target, coords);
  return mouse.getState();
};


/**
 * Presses the primary mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.mouseButtonDown = function(opt_state) {
  var mouse = new bot.Mouse(opt_state);
  mouse.pressButton(bot.Mouse.Button.LEFT);
  return mouse.getState();
};


/**
 * Releases the primary mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.mouseButtonUp = function(opt_state) {
  var mouse = new bot.Mouse(opt_state);
  mouse.releaseButton();
  return mouse.getState();
};


/**
 * Double-clicks primary mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.doubleClick = function(opt_state) {
  var mouse = new bot.Mouse(opt_state);
  mouse.pressButton(bot.Mouse.Button.LEFT);
  mouse.releaseButton();
  mouse.pressButton(bot.Mouse.Button.LEFT);
  mouse.releaseButton();
  return mouse.getState();
};


/**
 * Right-clicks mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 * @deprecated Use {@link webdriver.atoms.inputs.mouseClick}.
 */
webdriver.atoms.inputs.rightClick = function(opt_state) {
  var mouse = new bot.Mouse(opt_state);
  mouse.pressButton(bot.Mouse.Button.RIGHT);
  mouse.releaseButton();
  return mouse.getState();
};


/**
 * Executes a mousedown/up with the given button at the current mouse
 * location.
 *
 * @param {bot.Mouse.Button} button The button to press.
 * @param {bot.Mouse.State=} opt_state The state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 * @suppress {reportUnknownTypes}
 */
webdriver.atoms.inputs.mouseClick = function(button, opt_state) {
  // If no target element is specified, try to find it from the
  // client (x, y) location. No, this is not exact.
  if (opt_state && opt_state['clientXY'] && !opt_state['element'] &&
      document.elementFromPoint) {
    opt_state['element'] = document.elementFromPoint(
        opt_state['clientXY']['x'], opt_state['clientXY']['y']);
  }
  var mouse = new bot.Mouse(opt_state);
  mouse.pressButton(button);
  mouse.releaseButton();
  return mouse.getState();
};
