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

/**
 * @fileoverview CSS routines.
 *
*
 */

goog.provide('bot.style');

goog.require('bot');
goog.require('bot.dom');
goog.require('goog.dom.NodeIterator');
goog.require('goog.style');


/**
 * Retrieves an explicitly-set, inline style value of an element. This returns
 * '' if there isn't a style attribute on the element or if this style property
 * has not been explicitly set in script, or null if no such attribute exists.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName Name of the style property in selector-case.
 * @return {?string} The value of the style property, or null.
 */
bot.style.getInlineStyle = function(elem, styleName) {
  var value = goog.style.getStyle(elem, styleName);
  return goog.isDef(value) ? value : null;
};


/**
 * Retrieves the implicitly-set, effective style of an element, or null if it is
 * unknown. It returns the computed style where available; otherwise it looks
 * up the DOM tree for the first style value not equal to 'inherit,' using the
 * IE currentStyle of each node if available, and otherwise the inline style.
 * Since the computed, current, and inline styles can be different, the return
 * value of this function is not always consistent across browsers. See:
 * http://code.google.com/p/doctype/wiki/ArticleComputedStyleVsCascadedStyle
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName Name of the style property in selector-case.
 * @return {?string} The value of the style property, or null.
 */
bot.style.getEffectiveStyle = function(elem, styleName) {
  styleName = goog.style.toCamelCase(styleName);
  return goog.style.getComputedStyle(elem, styleName) ||
      bot.style.getCascadedStyle_(elem, styleName);
};


/**
 * Looks up the DOM tree for the first style value not equal to 'inherit,' using
 * the currentStyle of each node if available, and otherwise the inline style.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName CSS style property in camelCase.
 * @return {?string} The value of the style property, or null.
 * @private
 */
bot.style.getCascadedStyle_ = function(elem, styleName) {
  var value = (elem.currentStyle || elem.style)[styleName];
  if (value != 'inherit') {
    return goog.isDef(value) ? value : null;
  }
  var parent = bot.dom.parentElement(elem);
  return parent ? bot.style.getCascadedStyle_(parent, styleName) : null;
};

/**
 * Determines whether an element is what a user would call "displayed". This
 * means that the element not only has height and width greater than 0px, but
 * also that its visibility is not "hidden" and that it's display property is
 * not "none".
 *
 * @param {!Element} elem The element to consider.
 * @return {boolean} Whether or not the element would be visible.
 */
bot.style.isShown = function(elem) {
  if (elem && elem.nodeType != goog.dom.NodeType.ELEMENT) {
    throw new Error('Argument to isShown must be of type Element');
  }

  // Any hidden input is not shown.
  if (elem.tagName && elem.tagName.toUpperCase() == goog.dom.TagName.INPUT &&
      elem.type.toLowerCase() == 'hidden') {
    return false;
  }

  // Any element with hidden visibility is not shown.
  if (bot.style.getEffectiveStyle(elem, 'visibility') == 'hidden') {
    return false;
  }

  // Any element with a display style equal to 'none' or that has an ancestor
  // with display style equal to 'none' is not shown.
  function displayed(e) {
    if (bot.style.getEffectiveStyle(e, 'display') == 'none') {
      return false;
    }
    var parent = bot.dom.parentElement(e);
    return !parent || displayed(parent);
  }
  if (!displayed(elem)) {
    return false;
  }

  // Any element without positive size dimensions is not shown.
  var size = goog.style.getSize(elem);
  if (!(size.height > 0 && size.width > 0)) {
    return false;
  }

  return true;
};


/**
 * Returns the text the user would see in the browser. Tags are stripped and
 * spaces are trimmed.
 *
 * @param {!Node} node The node to use.
 * @return {string} The visible text or an empty string.
 */
bot.style.getVisibleText = function(node) {
  var returnValue = '';
  var elements = bot.style.flattenDescendants_(node);

  goog.array.forEach(elements, function(node, i) {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      var nodeText =
          goog.string.trim(bot.style.getVisibleTextFromTextNode_(node));
      if (nodeText.length) {
        if (bot.style.isClosestAncestorBlockLevel_(elements, i)) {
          returnValue += '\n';
        } else if (i != 0) { // First element does not need preceding space.
          returnValue += ' ';
        }
      }
      returnValue += nodeText;
    }
  });
  // Remove any double spacing that could have been added by
  // concatenating spaces in different tags.
  returnValue = goog.string.trim(returnValue.replace(/ +/g, ' '));
  return returnValue;
};


/**
 * Returns a sorted array containing all the descendant nodes of the given one.
 *
 * @param {!Node} node The node to use.
 * @return {!Array.<!Node>} The node's descendants.
 * @private
 */
bot.style.flattenDescendants_ = function(node) {
  var i = new goog.dom.NodeIterator(node);
  try {
    i.next(); // Skip root element;
    return (/** @type {!Array.<!Node>} */goog.iter.toArray(i));
  } catch (e) {
    // NodeIterator throws StopIteration once there are no more elements.
  }

  return [];
};


/**
 * @param {!Node} textNode A node named '#text'.
 * @return {string} The visible text of the given text node or an empty
 *      string.
 * @private
 */
bot.style.getVisibleTextFromTextNode_ = function(textNode) {
  if (textNode.nodeType != goog.dom.NodeType.TEXT) {
    throw new Error('Cannot extract text from a node whose type is not #text');
  }

  if (goog.string.collapseWhitespace(textNode.nodeValue) == ' ') {
    return ' ';
  }

  var parentElement = bot.dom.parentElement(textNode);
  if (parentElement && bot.style.isShown(parentElement)) {
    var textToAdd = textNode.nodeValue;
    textToAdd =
        textToAdd.replace(new RegExp(String.fromCharCode(160), 'gm'), ' ');
    textToAdd = goog.string.collapseWhitespace(textToAdd);
    return textToAdd;
  }
  return '';
};


/**
 * @param {goog.array.ArrayLike} elements An array of nodes, as returned by
 *      bot.style.flattenDescendants_.
 * @param {number} nodeIndex The index of the node whose ancestor we want to
 *      check.
 * @return {boolean} Whether the closest ancestor is block level.
 * @private
 */
bot.style.isClosestAncestorBlockLevel_ = function(elements, nodeIndex) {
  for (var i = nodeIndex - 1; i >= 0; i--) {
    var node = elements[i];
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      continue;
    }
    return bot.style.isBlockLevel_(node);
  }
  return false;
};


/**
 * @param {!Node} node Node to examine.
 * @return {boolean} Whether or not the node is a block level element.
 * @private
 */
bot.style.isBlockLevel_ = function(node) {
  if (node.tagName && node.tagName.toUpperCase() == goog.dom.TagName.BR) {
    return true;
  }
  if (goog.dom.NodeType.ELEMENT != node.nodeType) {
    return false;
  }
  var element = /** @type {!Element} */ (node);
  var display = bot.style.getEffectiveStyle(element, 'display');
  return display == 'block' || display == 'inline-block';
};
