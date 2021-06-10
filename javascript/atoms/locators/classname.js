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

goog.provide('bot.locators.className');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('goog.dom');
goog.require('goog.string');


/**
 * Tests whether the standardized W3C Selectors API are available on an
 * element.
 * @param {!(Document|Element)} root The document or element to test for CSS
 *     selector support.
 * @return {boolean} Whether or not the root supports query selector APIs.
 * @see http://www.w3.org/TR/selectors-api/
 * @private
 */
bot.locators.className.canUseQuerySelector_ = function (root) {
  return !!(root.querySelectorAll && root.querySelector);
};


/**
 * Find an element by its class name.
 * @param {string} target The class name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.className.single = function (target, root) {
  if (!target) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'No class name specified');
  }

  target = goog.string.trim(target);
  if (target.indexOf(' ') !== -1) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'Compound class names not permitted');
  }

  // Closure will not properly escape class names that contain a '.' when using
  // the native selectors API, so we have to handle this ourselves.
  if (bot.locators.className.canUseQuerySelector_(root)) {
    try {
      return root.querySelector('.' + target.replace(/\./g, '\\.')) || null;
    } catch (e) {
      throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'An invalid or illegal class name was specified');
    }
  }
  var elements = goog.dom.getDomHelper(root).getElementsByTagNameAndClass(
      /*tagName=*/'*', /*className=*/target, root);
  return elements.length ? elements[0] : null;
};


/**
 * Find an element by its class name.
 * @param {string} target The class name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!IArrayLike} All matching elements, or an empty list.
 */
bot.locators.className.many = function (target, root) {
  if (!target) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'No class name specified');
  }

  target = goog.string.trim(target);
  if (target.indexOf(' ') !== -1) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
      'Compound class names not permitted');
  }

  // Closure will not properly escape class names that contain a '.' when using
  // the native selectors API, so we have to handle this ourselves.
  if (bot.locators.className.canUseQuerySelector_(root)) {
    try {
      return root.querySelectorAll('.' + target.replace(/\./g, '\\.'));
    } catch (e) {
      throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'An invalid or illegal class name was specified');
    }
  }
  return goog.dom.getDomHelper(root).getElementsByTagNameAndClass(
      /*tagName=*/'*', /*className=*/target, root);
};
