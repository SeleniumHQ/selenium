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
 * @fileoverview DOM manipulation and querying routines.
 *
 *
 */

goog.provide('bot.dom');

goog.require('bot');
goog.require('goog.array');
goog.require('goog.dom.NodeIterator');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');



/**
 * @param {Node} node The node to test.
 * @param {goog.dom.TagName=} opt_tagName Tag name to test the node for; if not
 *     provided, return value is true for any element regardless of tag name.
 * @return {boolean} Whether the node is an element with the given tag name.
 * @private
 */
bot.dom.isElement_ = function(node, opt_tagName) {
  return !!node && node.nodeType == goog.dom.NodeType.ELEMENT &&
      (!opt_tagName || node.tagName.toUpperCase() == opt_tagName);
};


/**
 * Common aliases for properties. This maps names that users use to the correct
 * property name.
 *
 * @const
 * @private
 */
bot.dom.PROPERTY_ALIASES_ = {
  'class': 'className',
  'readonly': 'readOnly'
};


/**
 * Looks up the given property (not to be confused with an attribute) on the
 * given element. The following properties are aliased so that they return the
 * values expected by users:
 *
 * <ul>
 * <li>class - as "className"
 * <li>readonly - as "readOnly"
 * </ul>
 *
 * @param {!Element} element The element to use.
 * @param {string} propertyName The name of the property.
 * @return {*} The value of the property.
 */
bot.dom.getProperty = function(element, propertyName) {
  var key = bot.dom.PROPERTY_ALIASES_[propertyName] || propertyName;
  return element[key];
};


/**
 * Used to determine whether we should return a boolean value from getAttribute.
 * These are all the attributes listed here with a singleton-valued type:
 * http://www.w3.org/TR/REC-html40/index/attributes.html
 * These must all be lower-case.
 *
 * @const
 * @private
 */
bot.dom.BOOLEAN_ATTRIBUTES_ = [
  'checked',
  'compact',
  'declare',
  'defer',
  'disabled',
  'ismap',
  'multiple',
  'nohref',
  'noresize',
  'noshade',
  'nowrap',
  'readonly',
  'selected'
];


/**
 * Get the user-specified value of the given attribute of the element, or null
 * if no such value. This method endeavours to return consistent values between
 * browsers. For boolean attributes such as "selected" or "checked", it returns
 * the string "true" if it is present and null if it is not. For the style
 * attribute, it standardizes the value to a lower-case string with a trailing
 * semi-colon.
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {?string} The value of the attribute or "null" if entirely missing.
 */
bot.dom.getAttribute = function(element, attributeName) {
  // Protect ourselves from the case where documentElementsByTagName also
  // returns comments in IE.
  if (goog.dom.NodeType.COMMENT == element.nodeType) {
    return null;
  }

  attributeName = attributeName.toLowerCase();

  // In IE, the style attribute is an object, so we standardize to the
  // style.cssText property to get a string. The case of this string varies
  // across browsers, so we standardize to lower-case. Finally, Firefox always
  // includes a trailing semi-colon and we standardize to that.
  if (attributeName == 'style') {
    var css = goog.string.trim(element.style.cssText).toLowerCase();
    var text = css.charAt(css.length - 1) == ';' ? css : css + ';';
    if (';' == text) {
      // Return null or empty string if there was no actual style
      if (element.getAttributeNode('style') == null) {
        return null;
      }
      return '';
    }
    return text;
  }

  var attr = element.getAttributeNode(attributeName);
  if (!attr) {
    return null;
  }

  // Attempt to always return either true or null for boolean attributes.
  // In IE, attributes will sometimes be present even when not user-specified.
  // We would like to rely on the 'specified' property of attribute nodes, but
  // that is sometimes false for user-specified boolean attributes. However,
  // IE does consistently yield 'true' or 'false' strings for boolean attribute
  // values, and so we know 'false' attribute values were not user-specified.
  if (goog.array.contains(bot.dom.BOOLEAN_ATTRIBUTES_, attributeName)) {
    return (goog.userAgent.IE && attr.value == 'false') ? null : 'true';
  }

  // For non-boolean attributes, we compensate for IE's extra attributes by
  // returning null if the 'specified' property of the attributes node is false.
  return attr.specified ? attr.value : null;
};


/**
 * List of elements that support the "disabled" attribute, as defined by the
 * HTML 4.01 specification.
 * @type {!Array.<goog.dom.TagName>}
 * @const
 * @private
 * @see http://www.w3.org/TR/html401/interact/forms.html#h-17.12.1
 */
bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_ = [
  goog.dom.TagName.BUTTON,
  goog.dom.TagName.INPUT,
  goog.dom.TagName.OPTGROUP,
  goog.dom.TagName.OPTION,
  goog.dom.TagName.SELECT,
  goog.dom.TagName.TEXTAREA
];


/**
 * Determines if an element is enabled. An element is considered enabled if it
 * does not support the "disabled" attribute, or if it is not disabled.
 * @param {!Element} el The element to test.
 * @return {boolean} Whether the element is enabled.
 */
bot.dom.isEnabled = function(el) {
  var tagName = el.tagName.toUpperCase();
  if (!goog.array.contains(bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_, tagName)) {
    return true;
  }

  if (bot.dom.getAttribute(el, 'disabled')) {
    return false;
  }

  // The element is not explicitly disabled, but if it is an OPTION or OPTGROUP,
  // we must test if it inherits its state from a parent.
  if (el.parentNode &&
      el.parentNode.nodeType == goog.dom.NodeType.ELEMENT &&
      goog.dom.TagName.OPTGROUP == tagName ||
      goog.dom.TagName.OPTION == tagName) {
    return bot.dom.isEnabled((/**@type{!Element}*/el.parentNode));
  }
  return true;
};


/**
 * Returns the parent element of the given node, or null. This is required
 * because the parent node may not be another element.
 *
 * @param {!Node} node The node who's parent is desired.
 * @return {Element} The parent element, if available, null otherwise.
 * @private
 */
bot.dom.getParentElement_ = function(node) {
  var elem = node.parentNode;

  while (elem &&
         elem.nodeType != goog.dom.NodeType.ELEMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    elem = elem.parentNode;
  }
  return (/** @type {Element} */ bot.dom.isElement_(elem) ? elem : null);
};


/**
 * Retrieves an explicitly-set, inline style value of an element. This returns
 * '' if there isn't a style attribute on the element or if this style property
 * has not been explicitly set in script, or null if no such attribute exists.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName Name of the style property in selector-case.
 * @return {?string} The value of the style property, or null.
 */
bot.dom.getInlineStyle = function(elem, styleName) {
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
bot.dom.getEffectiveStyle = function(elem, styleName) {
  styleName = goog.style.toCamelCase(styleName);
  return goog.style.getComputedStyle(elem, styleName) ||
      bot.dom.getCascadedStyle_(elem, styleName);
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
bot.dom.getCascadedStyle_ = function(elem, styleName) {
  var value = (elem.currentStyle || elem.style)[styleName];
  if (value != 'inherit') {
    return goog.isDef(value) ? value : null;
  }
  var parent = bot.dom.getParentElement_(elem);
  return parent ? bot.dom.getCascadedStyle_(parent, styleName) : null;
};


/**
 * @param {!Element} element The element to use.
 * @return {!goog.math.Size} The dimensions of the element.
 * @private
 */
bot.dom.getElementSize_ = function(element) {
  if (goog.isFunction(element['getBBox'])) {
    return element['getBBox']();
  }
  return goog.style.getSize(element);
};


/**
 * Determines whether an element is what a user would call "shown". This means
 * that the element not only has height and width greater than 0px, but also
 * that its visibility is not "hidden" and its display property is not "none".
 * Options and Optgroup elements are treated as special cases: they are
 * considered shown iff they have a enclosing select element that is shown.
 *
 * @param {!Element} elem The element to consider.
 * @return {boolean} Whether or not the element would be visible.
 */
bot.dom.isShown = function(elem) {
  if (!bot.dom.isElement_(elem)) {
    throw new Error('Argument to isShown must be of type Element');
  }

  // Shown of options and optgroups taken from the enclosing select.
  if (bot.dom.isElement_(elem, goog.dom.TagName.OPTION) ||
      bot.dom.isElement_(elem, goog.dom.TagName.OPTGROUP)) {
    var select = /**@type {Element}*/ (goog.dom.getAncestor(elem, function(e) {
      return bot.dom.isElement_(e, goog.dom.TagName.SELECT);
    }));
    return !!select && bot.dom.isShown(select);
  }

  // Any hidden input is not shown.
  if (bot.dom.isElement_(elem, goog.dom.TagName.INPUT) &&
      elem.type.toLowerCase() == 'hidden') {
    return false;
  }

  // Any element with hidden visibility is not shown.
  if (bot.dom.getEffectiveStyle(elem, 'visibility') == 'hidden') {
    return false;
  }

  // Any element with a display style equal to 'none' or that has an ancestor
  // with display style equal to 'none' is not shown.
  function displayed(e) {
    if (bot.dom.getEffectiveStyle(e, 'display') == 'none') {
      return false;
    }
    var parent = bot.dom.getParentElement_(e);
    return !parent || displayed(parent);
  }
  if (!displayed(elem)) {
    return false;
  }

  // Any element without positive size dimensions is not shown.
  var size = bot.dom.getElementSize_(elem);
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
bot.dom.getVisibleText = function(node) {
  var returnValue = '';
  var elements = bot.dom.flattenDescendants_(node);

  goog.array.forEach(elements, function(node, i) {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      var nodeText =
          goog.string.trim(bot.dom.getVisibleTextFromTextNode_(node));
      if (nodeText.length) {
        if (bot.dom.isClosestAncestorBlockLevel_(elements, i)) {
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
bot.dom.flattenDescendants_ = function(node) {
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
bot.dom.getVisibleTextFromTextNode_ = function(textNode) {
  if (textNode.nodeType != goog.dom.NodeType.TEXT) {
    throw new Error('Cannot extract text from a node whose type is not #text');
  }

  if (goog.string.collapseWhitespace(textNode.nodeValue) == ' ') {
    return ' ';
  }

  var parentElement = bot.dom.getParentElement_(textNode);
  if (parentElement && bot.dom.isShown(parentElement)) {
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
 *      bot.dom.flattenDescendants_.
 * @param {number} nodeIndex The index of the node whose ancestor we want to
 *      check.
 * @return {boolean} Whether the closest ancestor is block level.
 * @private
 */
bot.dom.isClosestAncestorBlockLevel_ = function(elements, nodeIndex) {
  for (var i = nodeIndex - 1; i >= 0; i--) {
    var node = elements[i];
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      continue;
    }
    return bot.dom.isBlockLevel_(node);
  }
  return false;
};


/**
 * @param {!Node} node Node to examine.
 * @return {boolean} Whether or not the node is a block level element.
 * @private
 */
bot.dom.isBlockLevel_ = function(node) {
  if (bot.dom.isElement_(node, goog.dom.TagName.BR)) {
    return true;
  }
  if (!bot.dom.isElement_(node)) {
    return false;
  }
  var element = /** @type {!Element} */ (node);
  var display = bot.dom.getEffectiveStyle(element, 'display');
  return display == 'block' || display == 'inline-block';
};
