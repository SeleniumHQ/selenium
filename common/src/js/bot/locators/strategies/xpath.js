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


goog.provide('bot.locators.strategies.xpath');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.xml');



// TODO(user): Add support for browsers without native xpath

/**
 * Find an element by using an xpath expression
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The xpath to search for.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.strategies.xpath.single = function(win, target) {
  var root = goog.dom.getOwnerDocument(win);
  var node = goog.dom.xml.selectSingleNode(root, target);

  if (!node) {
    return null;
  }

  // Ensure that we actually return an element
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    throw Error('Returned node is not an element: ' + target);
  }

  return node;
};

/**
 * Find an element by using an xpath expression
 * @param {!Window} win The DOM window to search in.
 * @param {string} target The xpath to search for.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.strategies.xpath.many = function(win, target) {
  // TODO(user): Fix closure to allow a Window as an argument
  var root = goog.dom.getOwnerDocument(win);
  var nodes = goog.dom.xml.selectNodes(root, target);

  // Only return elements
  goog.array.forEach(nodes, function(node) {
    if (node.nodeType != goog.dom.NodeType.ELEMENT) {
      throw Error('Returned nodes must be elements: ' + target);
    }
  });

  return nodes;
};

