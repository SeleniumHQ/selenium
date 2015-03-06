// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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

goog.provide('bot.locators.tagName');

goog.require('goog.array');


/**
 * Find an element by its tag name.
 * @param {string} target The tag name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.tagName.single = function(target, root) {
  return root.getElementsByTagName(target)[0] || null;
};


/**
 * Find all elements with a given tag name.
 * @param {string} target The tag name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.tagName.many = function(target, root) {
  return root.getElementsByTagName(target);
};
