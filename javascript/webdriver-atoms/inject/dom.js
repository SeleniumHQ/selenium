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
 *@fileOverview Ready to inject atoms for querying the DOM.
 */

goog.provide('webdriver.inject.dom');

goog.require('bot.action');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('webdriver.element');

/**
 * Gets the visisble text for the given element.
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} The visible text wrapped in a JSON string as defined by the
 *     WebDriver wire protocol.
 */
webdriver.inject.dom.getText = function(element) {
  return bot.inject.executeScript(bot.dom.getVisibleText,[element], true)
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} A boolean describing whether the element is
 *     checked or selected wrapped in a JSON string as defined by
 *     the wire protocol.
 */
webdriver.inject.dom.isSelected = function(element) {
  return bot.inject.executeScript(bot.action.isSelected, [element], true);
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} The coordinates of the top left corner in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.inject.dom.getTopLeftCoordinates = function(element) {
  return bot.inject.executeScript(bot.dom.getLocationInView, [element], true);
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} The requested attribute value in a JSON string
 *     as defined by the wire protocol.
 */
webdriver.inject.dom.getAttributeValue = function(element, attribute) {
  return bot.inject.executeScript(webdriver.element.getAttribute, [element, attribute],
                                  true);
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} The element size in a JSON string as
 *     defined by the wire protocol.
 */
webdriver.inject.dom.getSize = function(element) {
  return bot.inject.executeScript(bot.dom.getElementSize_, [element], true);
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} The value of the requested CSS property in a JSON
 *     string as defined by the wire protocol.
 */
webdriver.inject.dom.getValueOfCssProperty = function(element, property) {
  return bot.inject.executeScript(bot.dom.getCascadedStyle_,
                                  [element, property], true)
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} A boolean describing whether the element is enabled
 *     in a JSON string as defined by the wire protocol.
 */
webdriver.inject.dom.isEnabled = function(element) {
  return bot.inject.executeScript(bot.dom.isEnabled, [element], true);
}

/**
 * @param {bot.inject.ELEMENT_KEY:string} element The element to check.
 * @return {string} true if the element is visisble, false otherwise.
 *     The result is wrapped in a JSON string as defined by the wire
 *     protocol.
 */
webdriver.inject.dom.isDisplayed = function(element) {
  return bot.inject.executeScript(bot.action.isShown_, [element], true)
}
