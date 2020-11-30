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

// TODO: Add support for using sizzle to locate elements

goog.provide('bot.locators.css');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.userAgent');


/**
 * Find an element by using a CSS selector
 *
 * @param {string} target The selector to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.css.single = function (target, root) {
  if (!target) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'No selector specified');
  }

  target = target.trim();

  var element;
  try {
    element = root.querySelector(target);
  } catch (e) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'An invalid or illegal selector was specified');
  }

  return element && element.nodeType == 1 /**DOM 3 Element*/ ?
      /**@type {Element}*/ (element) : null;
};


/**
 * Find all elements matching a CSS selector.
 *
 * @param {string} target The selector to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!IArrayLike} All matching elements, or an empty list.
 */
bot.locators.css.many = function (target, root) {
  if (!target) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'No selector specified');
  }

  target = target.trim();

  try {
    return root.querySelectorAll(target);
  } catch (e) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'An invalid or illegal selector was specified');
  }
};
