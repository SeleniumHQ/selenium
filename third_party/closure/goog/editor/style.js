// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utilties for working with the styles of DOM nodes, and
 * related to rich text editing.
 *
 * Many of these are not general enough to go into goog.style, and use
 * constructs (like "isContainer") that only really make sense inside
 * of an HTML editor.
 *
 * The API has been optimized for iterating over large, irregular DOM
 * structures (with lots of text nodes), and so the API tends to be a bit
 * more permissive than the goog.style API should be. For example,
 * goog.style.getComputedStyle will throw an exception if you give it a
 * text node.
 *
 */

goog.provide('goog.editor.style');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Gets the computed or cascaded style.
 *
 * This is different than goog.style.getStyle_ because it returns null
 * for text nodes (instead of throwing an exception), and never reads
 * inline style. These two functions may need to be reconciled.
 *
 * @param {Node} node Node to get style of.
 * @param {string} stylePropertyName Property to get (must be camelCase,
 *     not css-style).
 * @return {string?} Style value, or null if this is not an element node.
 * @private
 */
goog.editor.style.getComputedOrCascadedStyle_ =
    function(node, stylePropertyName) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    // Only element nodes have style.
    return null;
  }
  return goog.userAgent.IE ?
      goog.style.getCascadedStyle(/** @type {Element} */ (node),
          stylePropertyName) :
      goog.style.getComputedStyle(/** @type {Element} */ (node),
          stylePropertyName);
};


/**
 * Checks whether the given element inherits display: block.
 * @param {Node} node The Node to check.
 * @return {boolean} Whether the element inherits CSS display: block.
 */
goog.editor.style.isDisplayBlock = function(node) {
  return goog.editor.style.getComputedOrCascadedStyle_(
      node, 'display') == 'block';
};


/**
 * Returns true if the element is a container of other non-inline HTML
 * Note that span, strong and em tags, being inline can only contain
 * other inline elements and are thus, not containers. Containers are elements
 * that should not be broken up when wrapping selections with a node of an
 * inline block styling.
 * @param {Node?} element The element to check.
 * @return {boolean} Whether the element is a container.
 */
goog.editor.style.isContainer = function(element) {
  var nodeName = element && element.nodeName.toLowerCase();
  return !!(element &&
      (goog.editor.style.isDisplayBlock(element) ||
          nodeName == 'td' ||
          nodeName == 'table' ||
          nodeName == 'li'));
};


/**
 * Return the first ancestor of this node that is a container, inclusive.
 * @see isContainer
 * @param {Node?} node Node to find the container of.
 * @return {Element} The element which contains node.
 */
goog.editor.style.getContainer = function(node) {
  // We assume that every node must have a container.
  return /** @type {Element} */ (
      goog.dom.getAncestor(node, goog.editor.style.isContainer, true));
};
