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
 * @fileoverview Ready to inject atoms for querying the DOM.
 */

goog.provide('webdriver.atoms.inject.dom');

goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.userAgent');
goog.require('goog.json');
goog.require('webdriver.atoms.element');
goog.require('webdriver.atoms.inject');


/**
 * Gets the visisble text for the given element.
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} The visible text wrapped in a JSON string as defined by the
 *     WebDriver wire protocol.
 */
webdriver.atoms.inject.dom.getText = function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      bot.dom.getVisibleText, [element], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} A boolean describing whether the element is
 *     checked or selected wrapped in a JSON string as defined by
 *     the wire protocol.
 */
webdriver.atoms.inject.dom.isSelected = function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      bot.dom.isSelected, [element], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} The coordinates of the top left corner in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getTopLeftCoordinates =
    function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      webdriver.atoms.element.getLocationInView, [element], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {string} attribute The attribute to look up.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} The requested attribute value in a JSON string
 *     as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getAttributeValue =
    function(element, attribute, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      webdriver.atoms.element.getAttribute, [element, attribute], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} The element size in a JSON string as
 *     defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getSize = function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      getSize, [element], opt_window);

  function getSize(e) {
    var rect = bot.dom.getClientRect(e);
    var height = rect.height;
    var width = rect.width;
    if (!bot.userAgent.IE_DOC_PRE10) {
      // On IE10, getBoundingClientRect returns floating point values.
      width = Math.floor(width);
      height = Math.floor(height);
    }
    return { 'width': width, 'height': height };
  }
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {string} property The property to look up.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} The value of the requested CSS property in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getValueOfCssProperty =
    function(element, property, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      bot.dom.getEffectiveStyle, [element, property], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} A boolean describing whether the element is enabled
 *     in a JSON string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.isEnabled = function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      bot.dom.isEnabled, [element], opt_window);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to check.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} true if the element is visisble, false otherwise.
 *     The result is wrapped in a JSON string as defined by the wire
 *     protocol.
 */
webdriver.atoms.inject.dom.isDisplayed = function(element, opt_window) {
  return webdriver.atoms.inject.dom.executeDomFunction_(
      bot.dom.isShown, [element, /*ignoreOpacity=*/true], opt_window);
};


/**
 * @param {Function} fn The function to call.
 * @param {Array.<*>} args An array of function arguments for the function.
 * @param {{WINDOW: string}=} opt_window The window context for
 *     the execution of the function.
 * @return {string} The serialized JSON wire protocol result of the function.
 * @private
 */
webdriver.atoms.inject.dom.executeDomFunction_ =
    function(fn, args, opt_window) {
  var response;
  try {
    var targetWindow = webdriver.atoms.inject.getWindow(opt_window);
    var unwrappedArgs = /**@type {Object}*/(bot.inject.unwrapValue(args,
        targetWindow.document));
    var functionResult = fn.apply(null, unwrappedArgs);
    response = bot.inject.wrapResponse(functionResult);
  } catch (ex) {
    response = bot.inject.wrapError(ex);
  }
  return goog.json.serialize(response);
};
