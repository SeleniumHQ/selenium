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
 * @fileoverview Ready to inject atoms for manipulating the DOM.
 */

goog.provide('webdriver.atoms.inject.action');

goog.require('bot.action');
goog.require('webdriver.atoms.element');
goog.require('webdriver.atoms.inject');


/**
 * Sends key events to simulating typing on an element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to submit.
 * @param {!Array.<string>} keys The keys to type.
 * @param {{WINDOW: string}=} opt_window The optional window
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
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to submit.
 * @param {{WINDOW: string}=} opt_window The optional window
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
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to clear.
 * @param {{WINDOW: string}=} opt_window The optional window
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
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to click.
 * @param {{WINDOW: string}=} opt_window The optional window
 *     containing the element.
 * @return {string} A stringified {@link bot.response.ResponseObject}.
 * @see bot.action.click
 */
webdriver.atoms.inject.action.click = function (element, opt_window) {
  return webdriver.atoms.inject.action.executeActionFunction_(bot.action.click,
      [element], opt_window);
};


/**
 * @param {Function} fn The function to call.
 * @param {Array.<*>} args An array of function arguments for the function.
 * @param {{WINDOW: string}=} opt_window The window context for
 *     the execution of the function.
 * @return {string} The serialized JSON wire protocol result of the function.
 */
webdriver.atoms.inject.action.executeActionFunction_ =
    function (fn, args, opt_window) {
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
