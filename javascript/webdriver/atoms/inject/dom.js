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
 * @fileoverview Ready to inject atoms for querying the DOM.
 */

goog.provide('webdriver.atoms.inject.dom');

goog.require('bot.action');
goog.require('bot.dom');
goog.require('webdriver.atoms.element');
goog.require('webdriver.atoms.inject');


/**
 * Gets the visisble text for the given element.
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @return {string} The visible text wrapped in a JSON string as defined by the
 *     WebDriver wire protocol.
 */
webdriver.atoms.inject.dom.getText = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.getVisibleText,
      [element]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @return {string} A boolean describing whether the element is
 *     checked or selected wrapped in a JSON string as defined by
 *     the wire protocol.
 */
webdriver.atoms.inject.dom.isSelected = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.isSelected, [element]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @return {string} The coordinates of the top left corner in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getTopLeftCoordinates = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.getLocationInView,
      [element]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {string} attribute The attribute to look up.
 * @return {string} The requested attribute value in a JSON string
 *     as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getAttributeValue = function(element, attribute) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.element.getAttribute, [element, attribute]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @return {string} The element size in a JSON string as
 *     defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getSize = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.getElementSize,
      [element]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @param {string} property The property to look up.
 * @return {string} The value of the requested CSS property in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.getValueOfCssProperty =
    function(element, property) {
  return webdriver.atoms.inject.executeScript(bot.dom.getEffectiveStyle,
      [element, property]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to query.
 * @return {string} A boolean describing whether the element is enabled
 *     in a JSON string as defined by the wire protocol.
 */
webdriver.atoms.inject.dom.isEnabled = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.isEnabled, [element]);
};


/**
 * @param {{bot.inject.ELEMENT_KEY: string}} element The element to check.
 * @return {string} true if the element is visisble, false otherwise.
 *     The result is wrapped in a JSON string as defined by the wire
 *     protocol.
 */
webdriver.atoms.inject.dom.isDisplayed = function(element) {
  return webdriver.atoms.inject.executeScript(bot.dom.isShown,
      [element, /*ignoreOpacity=*/true]);
};
