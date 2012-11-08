// Copyright 2012 WebDriver committers
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Synthetic events for fun and profit.
 */

goog.provide('webdriver.atoms.inputs');

goog.require('bot.Keyboard');
goog.require('bot.Mouse');
goog.require('bot.action');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('webdriver.atoms.element');


/**
 * Send keyboard input to a particular element.
 *
 * @param {Element} element The element to send the keyboard input to.
 * @param {Array.<!bot.Keyboard.Key>=} opt_state The keyboard to use, or
 *     construct one.
 * @param {...(string|!Array.<string>)} var_args What to type.
 * @return {Array.<!bot.Keyboard.Key>} The keyboard state.
 */
webdriver.atoms.inputs.sendKeys = function(element, opt_state, var_args) {
  var keyboard = new bot.Keyboard(opt_state);
  var to_type = goog.array.slice(arguments, 2);
  var flattened = goog.array.flatten(to_type);
  if (!element) {
    element = bot.dom.getActiveElement(document);
  }
  if (!element) {
    throw Error('No element to send keys to');
  }
  webdriver.atoms.element.type(element, flattened, keyboard);

  return keyboard.getState();
};
goog.exportSymbol('webdriver.atoms.inputs.sendKeys',
                  webdriver.atoms.inputs.sendKeys);


/**
 * Click on an element.
 *
 * @param {Element} element The element to click.
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
goog.exportSymbol('webdriver.atoms.inputs.click',
                  webdriver.atoms.inputs.click);


/**
 * Move the mouse to a specific element and/or coordinate location.
 *
 * @param {!Element} element The element to move the mouse to.
 * @param {number} x_offset The x coordinate to use as an offset.
 * @param {number} y_offset The y coordinate to use as an offset.
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.mouseMove = function(element, x_offset, y_offset,
    opt_state) {
  var mouse = new bot.Mouse(opt_state);
  var target = element || mouse.getState().element;

  var offset_specified = (x_offset != null) && (y_offset != null);
  x_offset = x_offset || 0;
  y_offset = y_offset || 0;

  // If we have specified an element and no offset, we should
  // move the mouse to the center of the specified element.
  if (element) {
    if (!offset_specified) {
      var source_element_size = bot.action.getInteractableSize(element);
      x_offset = Math.floor(source_element_size.width / 2);
      y_offset = Math.floor(source_element_size.height / 2);
    }
  } else {
    // Moving to an absolute offset from the current target element,
    // so we have to account for the existing offset of the current
    // mouse position to the element origin (upper-left corner).
    var pos = goog.style.getClientPosition(target);
    x_offset += (mouse.getState().clientXY.x - pos.x);
    y_offset += (mouse.getState().clientXY.y - pos.y);
  }

  var doc = goog.dom.getOwnerDocument(target);
  var win = goog.dom.getWindow(doc);
  var inViewAfterScroll = bot.action.scrollIntoView(
      target,
      new goog.math.Coordinate(x_offset, y_offset));

  var coords = new goog.math.Coordinate(x_offset, y_offset);
  mouse.move(target, coords);
  return mouse.getState();
};
goog.exportSymbol('webdriver.atoms.inputs.mouseMove',
                  webdriver.atoms.inputs.mouseMove);


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
goog.exportSymbol('webdriver.atoms.inputs.mouseButtonDown',
                  webdriver.atoms.inputs.mouseButtonDown);


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
goog.exportSymbol('webdriver.atoms.inputs.mouseButtonUp',
                  webdriver.atoms.inputs.mouseButtonUp);


/**
 * Double-clicks primary mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
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
goog.exportSymbol('webdriver.atoms.inputs.doubleClick',
                  webdriver.atoms.inputs.doubleClick);


/**
 * Right-clicks mouse button at the current location.
 *
 * @param {bot.Mouse.State=} opt_state The serialized state of the mouse.
 * @return {!bot.Mouse.State} The mouse state.
 */
webdriver.atoms.inputs.rightClick = function(opt_state) {
  var mouse = new bot.Mouse(opt_state);
  mouse.pressButton(bot.Mouse.Button.RIGHT);
  mouse.releaseButton();
  return mouse.getState();
};
goog.exportSymbol('webdriver.atoms.inputs.rightClick',
                  webdriver.atoms.inputs.rightClick);
