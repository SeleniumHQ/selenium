/** @license
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

goog.provide('bot.locators.strategies.className');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.string');

/**
 * Find an element by its class name.
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The class name to search for.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.strategies.className.single = function(win, target) {
  if (!target) {
    throw Error('No class name specified');
  }

  target = goog.string.trim(target);
  if (target.split(/\s+/).length > 1) {
    throw Error('Compound class names not permitted');
  }

  var domHelper = new goog.dom.DomHelper(win.document);
  var elements = domHelper.getElementsByTagNameAndClass(
      /*tagName=*/'*', /*className=*/target);
  if (elements.length > 0) {
    return elements[0];
  }
  return null;
};

/**
 * Find an element by its class name.
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The class name to search for.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.strategies.className.many = function(win, target) {
  if (!target) {
    throw Error('No class name specified');
  }

  target = goog.string.trim(target);
  if (target.split(/\s+/).length > 1) {
    throw Error('Compound class names not permitted');
  }

  var domHelper = new goog.dom.DomHelper(win.document);
  return domHelper.getElementsByTagNameAndClass(
      /*tagName=*/'*', /*className=*/target);
};
