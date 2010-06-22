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

goog.provide('bot.locators.strategies.name');

goog.require('bot.dom');
goog.require('goog.array');
goog.require('goog.dom');

/**
 * Find an element by the value of the name attribute
 *
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The id to search for.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.strategies.name.single = function(win, target) {
  var doc = goog.dom.getOwnerDocument(win);

  if (doc['getElementsByName']) {
    var results = doc.getElementsByName(target);

    var length = results.length;
    for (var i = 0; i < length; i++) {
      if (results[i].getAttribute('name') === target) {
        return results[i];
      }
    }
  }

  // On some browsers (notably IE) "getElementsByName" only returns elements
  // that are in a form. If we get here, it's possible a matching element is in
  // the DOM, but not in a form. Hunt for it.

  var allElements = doc.getElementsByTagName('*');

  return goog.array.find(allElements, function(element) {
    return bot.dom.getAttribute(element, 'name') == target;
  })
};

/**
 * Find all elements by the value of the name attribute
 *
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The id to search for.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.strategies.name.many = function(win, target) {
  var doc = goog.dom.getOwnerDocument(win);

  var allElements = doc.getElementsByTagName('*');

  return goog.array.filter(allElements, function(element) {
    return bot.dom.getAttribute(element, 'name') == target;
  });
};
