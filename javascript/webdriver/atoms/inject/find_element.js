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
 * @fileoverview Ready to inject atoms to find elements in the page.
 */

goog.provide('webdriver.atoms.inject.locators');

goog.require('bot.locators');
goog.require('bot.inject');
goog.require('webdriver.atoms.inject');


/**
 * Finds an element by using the given lookup strategy.
 * @param {string} strategy The strategy to use to locate the element.
 * @param {string} using The locator to use.
 * @param {?{ELEMENT: string}=} opt_root The WebElement reference for the
 *     element to perform the search under. If not specified, will use
 *     {@code document} for the target page.
 * @param {{WINDOW: string}=} opt_window The serialized window object for the
 *     page to find the element in. The referenced window must exist in the
 *     page executing this script's cache.
 * @return {string} A JSON serialized {@link bot.response.ResponseObject}.
 */
webdriver.atoms.inject.locators.findElement = function(
    strategy, using, opt_root, opt_window) {
  return webdriver.atoms.inject.locators.performSearch_(
      strategy, using, bot.locators.findElement, opt_root, opt_window);
};


/**
 * Finds all elements by using the given lookup strategy.
 * @param {string} strategy The strategy to use to locate the element.
 * @param {string} using The locator to use.
 * @param {?{ELEMENT: string}=} opt_root The WebElement reference for the
 *     element to perform the search under. If not specified, will use
 *     {@code document} for the target page.
 * @param {{WINDOW: string}=} opt_window The serialized window object for the
 *     page to find the element in. The referenced window must exist in the
 *     page executing this script's cache.
 * @return {string} A JSON serialized {@link bot.response.ResponseObject}.
 */
webdriver.atoms.inject.locators.findElements = function(
    strategy, using, opt_root, opt_window) {
  return webdriver.atoms.inject.locators.performSearch_(
      strategy, using, bot.locators.findElements, opt_root, opt_window);
};


/**
 * Performs a search for one or more elements.
 * @param {string} strategy The strategy to use to locate the element.
 * @param {string} target The locator to use.
 * @param {(function(!Object, (Document|Element)=): Element|
 *          function(!Object, (Document|Element)=): !IArrayLike)}
 *     searchFn The search function to invoke.
 * @param {?{ELEMENT: string}=} opt_root The WebElement reference for the
 *     element to perform the search under. If not specified, will use
 *     {@code document} for the target page.
 * @param {{WINDOW: string}=} opt_window The serialized window object for the
 *     page to find the element in. The referenced window must exist in the
 *     page executing this script's cache.
 * @return {string} A JSON serialized {@link bot.response.ResponseObject}.
 * @private
 */
webdriver.atoms.inject.locators.performSearch_ = function(
    strategy, target, searchFn, opt_root, opt_window) {
  var locator = {};
  locator[strategy] = target;

  var response;
  try {
    // Step 1: find the window we are locating the element in.
    var targetWindow = webdriver.atoms.inject.getWindow(opt_window);

    // Step 2: decode the root of our search.
    var root;
    if (opt_root) {
      root = /** @type {!Element} */ (bot.inject.cache.getElement(
          opt_root[bot.inject.ELEMENT_KEY], targetWindow.document));
    } else {
      root = targetWindow.document;
    }

    // Step 3: perform the search.
    var found = searchFn(locator, root);

    // Step 4: encode our response.
    response = bot.inject.wrapResponse(found);
  } catch (ex) {
    response = bot.inject.wrapError(ex);
  }
  return goog.json.serialize(response);
};
