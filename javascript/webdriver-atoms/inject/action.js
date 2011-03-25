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
 * @fileOverview Ready to inject atoms for manipulating the DOM.
 */

goog.provide('webdriver.inject.action');

goog.require('bot.action');
goog.require('bot.inject');

/**
 * Toggles the selected state of the given element.
 * 
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 * @return {string} A boolean describing whether the element is selected
 *     in a JSON string as defined by the wire protocol.
 */
webdriver.inject.action.toggle = function(element) {
  return bot.inject.executeScript(bot.action.toggle, [element], true);
}

/**
 * Sets the selected state of the given INPUT element.
 * 
 * @param {bot.inject.ELEMENT_KEY:string} element The element to query.
 */
webdriver.inject.action.setSelected = function(element, selected) {
  bot.inject.executeScript(bot.action.setSelected, [element, selected]);
}
