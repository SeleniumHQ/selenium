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

goog.provide('bot.locators.strategies.css');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');

// TODO(user): Add support for using sizzle to locate elements

/**
 * Find an element by using a CSS selector
 *
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The selector to search for.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.strategies.css.single = function(win, target) {
  var doc = win.document;

  if (!goog.isFunction(doc['querySelector'])) {
    throw Error('CSS selection is not supported');
  }

  if (!target) {
    throw Error('No selector specified');
  }

  if (target.split(/,/).length > 1) {
    throw Error('Compound selectors not permitted');
  }

  target = goog.string.trim(target);

  var element = doc.querySelector(target);

  return element ? element : null;
};

/**
 * Find all elements matching a CSS selector.
 *
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The selector to search for.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.strategies.css.many = function(win, target) {
  var doc = win.document;

  if (!goog.isFunction(doc['querySelectorAll'])) {
    throw Error('CSS selection is not supported');
  }

  if (!target) {
    throw Error('No selector specified');
  }

  if (target.split(/,/).length > 1) {
    throw Error('Compound selectors not permitted');
  }

  target = goog.string.trim(target);

  return doc.querySelectorAll(target);
};
