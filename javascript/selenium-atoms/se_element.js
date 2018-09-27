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
 * @fileoverview Selenium methods for querying an element.
 */

goog.provide('core.element');


goog.require('bot.dom');
goog.require('core.Error');
goog.require('core.locators');


/**
 * @param {string} locator A selenium attribute locator to use.
 * @return {?string} The value of the given attribute or null.
 * @private
 */
core.element.findAttribute_ = function(locator) {
  // Split into locator + attributeName
  var attributePos = locator.lastIndexOf('@');
  var elementLocator = locator.slice(0, attributePos);
  var attributeName = locator.slice(attributePos + 1);

  // Find the element.
  var element = core.locators.findElement(elementLocator);
  return bot.dom.getAttribute(element, attributeName);
};


/**
 * @param {string} locator The selenium attribute locator to use.
 * @return {string} The value of the attribute.
 * @throws {core.Error} If the attribute cannot be found.
 */
core.element.getAttribute = function(locator) {
  var result = core.element.findAttribute_(locator);
  if (result == null) {
    throw new core.Error('Could not find element attribute: ' + locator);
  }
  return result;
};


