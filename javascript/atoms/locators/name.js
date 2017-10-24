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

goog.provide('bot.locators.name');

goog.require('bot.dom');
goog.require('goog.array');
goog.require('goog.dom');


/**
 * Find an element by the value of the name attribute
 *
 * @param {string} target The name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.name.single = function(target, root) {
  var dom = goog.dom.getDomHelper(root);
  var allElements = dom.getElementsByTagNameAndClass('*', null, root);
  var element = goog.array.find(allElements, function(element) {
    return bot.dom.getAttribute(element, 'name') == target;
  });
  return /**@type{Element}*/ (element);
};


/**
 * Find all elements by the value of the name attribute
 *
 * @param {string} target The name to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!IArrayLike} All matching elements, or an empty list.
 */
bot.locators.name.many = function(target, root) {
  var dom = goog.dom.getDomHelper(root);
  var allElements = dom.getElementsByTagNameAndClass('*', null, root);
  return goog.array.filter(allElements, function(element) {
    return bot.dom.getAttribute(element, 'name') == target;
  });
};
