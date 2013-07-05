// Copyright 2013 WebDriver committers
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
 * @fileoverview IE specific atoms.
 *
 */

goog.provide('webdriver.ie');

goog.require('bot.locators');

/**
* Find the first element in the DOM matching the mechanism and critera.
*
* @param {!string} mechanism The mechanism to search by.
* @param {!string} criteria The criteria to search for.
* @param {(Document|Element)=} opt_root The node from which to start the
*     search. If not specified, will use {@code document} as the root.
* @return {Element} The first matching element found in the DOM, or null if no
*     such element could be found.
*/
webdriver.ie.findElement = function(mechanism, criteria, opt_root) {
  var locator = {};
  locator[mechanism] = criteria;
  return bot.locators.findElement(locator, opt_root);
};

/**
* Find all elements in the DOM matching the mechanism and critera.
*
* @param {!string} mechanism The mechanism to search by.
* @param {!string} criteria The criteria to search for.
* @param {(Document|Element)=} opt_root The node from which to start the
*     search. If not specified, will use {@code document} as the root.
* @return {!goog.array.ArrayLike.<Element>} All matching elements found in the
*     DOM.
*/
webdriver.ie.findElements = function(mechanism, criteria, opt_root) {
  var locator = {};
  locator[mechanism] = criteria;
  return bot.locators.findElements(locator, opt_root);
};
