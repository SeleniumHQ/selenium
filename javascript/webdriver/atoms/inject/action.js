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
 * @fileoverview Ready to inject atoms for manipulating the DOM.
 */

goog.provide('webdriver.atoms.inject.action');

goog.require('bot.action');
goog.require('bot.inject');
goog.require('goog.json');
goog.require('webdriver.atoms.element');
goog.require('webdriver.atoms.inject');
goog.require('webdriver.atoms.inputs');


/**
 * Sends key events to simulating typing on an element.
 *
 * @param {bot.inject.JsonElement} element The element to submit.
 * @param {!Array.<string>} keys The keys to type.
 * @param {bot.inject.JsonWindow=} opt_window The optional window
 *     containing the element.
 * @return {string} A stringified {@link bot.response.ResponseObject}.
 */
webdriver.atoms.inject.action.type = function(element, keys, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.element.type, [element, keys], opt_window);
};


/**
 * Submits the form containing the given element.
 *
 * @param {bot.inject.JsonElement} element The element to submit.
 * @param {bot.inject.JsonWindow=} opt_window The optional window
 *     containing the element.
 * @return {string} A stringified {@link bot.response.ResponseObject}.
 * @deprecated Click on a submit button or type ENTER in a text box instead.
 */
webdriver.atoms.inject.action.submit = function(element, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(bot.action.submit,
      [element], opt_window);
};


/**
 * Clear an element.
 *
 * @param {bot.inject.JsonElement} element The element to clear.
 * @param {bot.inject.JsonWindow=} opt_window The optional window
 *     containing the element.
 * @return {string} A stringified {@link bot.response.ResponseObject}.
 * @see bot.action.clear
 */
webdriver.atoms.inject.action.clear = function(element, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(bot.action.clear,
      [element], opt_window);
};


/**
 * Click an element.
 *
 * @param {bot.inject.JsonElement} element The element to click.
 * @param {bot.inject.JsonWindow=} opt_window The optional window
 *     containing the element.
 * @return {string} A stringified {@link bot.response.ResponseObject}.
 * @see bot.action.click
 */
webdriver.atoms.inject.action.click = function (element, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(bot.action.click,
      [element], opt_window);
};


/**
 * JSON representation of a {@link bot.Mouse.State} object.
 * @typedef {{buttonPressed: ?bot.Mouse.Button,
 *            elementPressed: ?bot.inject.JsonElement,
 *            clientXY: {x: number, y: number},
 *            nextClickIsDoubleClick: boolean,
 *            hasEverInteracted: boolean,
 *            element: ?bot.inject.JsonElement}}
 */
webdriver.atoms.inject.action.JsonMouseState;


/**
 * Clicks a mouse button.
 *
 * @param {bot.Mouse.Button} button The button to press.
 * @param {webdriver.atoms.inject.action.JsonMouseState=} opt_mouseState The
 *     current state of the mouse.
 * @param {bot.inject.JsonWindow=} opt_window The window context for
 *     the execution of the function.
 * @return {string} A stringified {@link bot.response.ResponseObject}. The
 *     mouse's new state, as a
 *     {@link webdriver.atoms.inject.action.JsonMouseState} will be included
 *     as the response value.
 */
webdriver.atoms.inject.action.mouseClick = function(
    button, opt_mouseState, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.mouseClick,
      [button, opt_mouseState], opt_window);
};


/**
 * Types a sequence of key strokes on the active element.
 * @param {!Array.<string>} keys The keys to type.
 * @param {bot.Keyboard.State=} opt_keyboardState The keyboard's state.
 * @param {bot.inject.JsonWindow=} opt_window The window context for
 *     the execution of the function.
 * @return {string} A stringified {@link bot.response.ResponseObject}. The
 *     keyboard's new state, as a {@link bot.Keyboard.State} will be included
 *     as the response value.
 */
webdriver.atoms.inject.action.sendKeysToActiveElement = function(
    keys, opt_keyboardState, opt_window) {
  var persistModifiers = true;
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.sendKeys,
      [null, keys, opt_keyboardState, persistModifiers], opt_window);
};

/**
  * Moves the mouse to a specific element and/or coordinate location.
  *
  * @param {?bot.inject.JsonElement} element The element to move the mouse
  *     relative to, or `null` to use the mouse's current position.
  * @param {?number} xOffset A horizontal offset, relative to the left edge of
  *     the given element, or the mouse's current position if no element is
  *     specified.
  * @param {?number} yOffset A vertical offset, relative to the top edge of
  *     the given element, or the mouse's current position if no element
  *     is specified.
  * @param {webdriver.atoms.inject.action.JsonMouseState=} opt_mouseState The
  *     current state of the mouse.
  * @param {bot.inject.JsonWindow=} opt_window The window context for
  *     the execution of the function.
  * @return {string} A stringified {@link bot.response.ResponseObject}. The
  *     mouse's new state, as a
  *     {@link webdriver.atoms.inject.action.JsonMouseState} will be included
  *     as the response value.
  */
webdriver.atoms.inject.action.mouseMove = function(
    element, xOffset, yOffset, opt_mouseState, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.mouseMove,
      [element, xOffset, yOffset, opt_mouseState], opt_window);
};


/**
 * Presses the primary mouse button at the current location.
 *
 * @param {webdriver.atoms.inject.action.JsonMouseState=} opt_mouseState The
 *     current state of the mouse.
 * @param {bot.inject.JsonWindow=} opt_window The window context for
 *     the execution of the function.
 * @return {string} A stringified {@link bot.response.ResponseObject}. The
 *     mouse's new state, as a
 *     {@link webdriver.atoms.inject.action.JsonMouseState} will be included
 *     as the response value.
 */
webdriver.atoms.inject.action.mouseButtonDown = function(opt_mouseState, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.mouseButtonDown,
      [opt_mouseState], opt_window);
};


/**
 * Releases the primary mouse button at the current location.
 *
 * @param {webdriver.atoms.inject.action.JsonMouseState=} opt_mouseState The
 *     current state of the mouse.
 * @param {bot.inject.JsonWindow=} opt_window The window context for
 *     the execution of the function.
 * @return {string} A stringified {@link bot.response.ResponseObject}. The
 *     mouse's new state, as a
 *     {@link webdriver.atoms.inject.action.JsonMouseState} will be included
 *     as the response value.
 */
webdriver.atoms.inject.action.mouseButtonUp = function(opt_mouseState, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.mouseButtonUp,
      [opt_mouseState], opt_window);
};

/**
* Double-clicks the primary mouse button.
*
* @param {webdriver.atoms.inject.action.JsonMouseState=} opt_mouseState The
*     current state of the mouse.
* @param {bot.inject.JsonWindow=} opt_window The window context for
*     the execution of the function.
* @return {string} A stringified {@link bot.response.ResponseObject}. The
*     mouse's new state, as a
*     {@link webdriver.atoms.inject.action.JsonMouseState} will be included
*     as the response value.
*/
webdriver.atoms.inject.action.doubleClick = function (
    opt_mouseState, opt_window) {
    return webdriver.atoms.inject.action.executeActionFunction_(
      webdriver.atoms.inputs.doubleClick,
      [opt_mouseState], opt_window);
};


/**
 * @param {!Function} fn The function to call.
 * @param {!Array.<*>} args An array of function arguments for the function.
 * @param {bot.inject.JsonWindow=} opt_window The window context for
 *     the execution of the function.
 * @return {string} The serialized JSON wire protocol result of the function.
 * @private
 */
webdriver.atoms.inject.action.executeActionFunction_ = function (
    fn, args, opt_window) {
  var response;
  try {
    var targetWindow = webdriver.atoms.inject.getWindow(opt_window);
    var unwrappedArgs = /** @type {Array} */(bot.inject.unwrapValue(
        args, targetWindow.document));
    var functionResult = fn.apply(null, unwrappedArgs);
    response = bot.inject.wrapResponse(functionResult);
  } catch (ex) {
    response = bot.inject.wrapError(ex);
  }
  return goog.json.serialize(response);
};
