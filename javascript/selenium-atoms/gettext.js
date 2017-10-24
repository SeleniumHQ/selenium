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
 * @fileoverview Defines the core.text.getText function, breaking a circular
 * dependency between core.text, core.locators, and core.LocatorStrategies.
 */

goog.provide('core.text.getText');

goog.require('core.locators');
goog.require('core.text');


/**
 * Locate an element and return it's text content.
 *
 * @param {string|!Element} locator The element locator.
 * @return {string} The text content of the located element.
 */
core.text.getText = function(locator) {
  var element = core.locators.findElement(locator);
  return core.text.getElementText(element);
};
