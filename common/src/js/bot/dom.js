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

/**
 * @fileoverview DOM manipulation and querying routines.
 *
*
 */

goog.provide('bot.dom');

goog.require('bot');
goog.require('bot.style');
goog.require('goog.array');
goog.require('goog.dom.NodeIterator');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.string');
goog.require('goog.style');



/**
 * @param {!Element} element The element to use.
 * @param {string} propertyName The name of the property.
 * @return {boolean} Whether the property is present.
 */
bot.dom.hasProperty = function(element, propertyName) {
  return !goog.isNull(bot.dom.getProperty(element, propertyName));
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
 * @return {string|boolean} The value of the property or "null" if entirely
 *     missing.
 */
bot.dom.getProperty = function(element, propertyName) {
  var key = bot.dom.PROPERTY_ALIASES_[propertyName] || propertyName;

  return element[key];
};


/**
 * Used to determine whether we should return a boolean value from getAttribute.
 * Must be lower-case.
 *
 * @const
 * @private
 */
bot.dom.BOOLEAN_ATTRIBUTES_ = [
  'checked',
  'disabled',
  'readonly',
  'selected'
];


/**
 * Determines whether or not the element has an attribute of the given name,
 * regardless of the value of the attribute.
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute.
 * @return {boolean} Whether the attribute is present.
 */
bot.dom.hasAttribute = function(element, attributeName) {
  return !goog.isNull(bot.dom.getAttribute(element, attributeName));
};


/**
 * Get the user-specified value of the given attribute of the element, or null
 * if no such value. This method endeavours to return consistent values between
 * browsers. For boolean attributes such as "selected" or "checked", it returns
 * either the boolean true if the attribute is present or null if it is not.
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {?(string|boolean)} The value of the attribute or "null" if entirely
 *     missing.
 */
bot.dom.getAttribute = function(element, attributeName) {
  // Protect ourselves from the case where documentElementsByTagName also
  // returns comments in IE.
  if (goog.dom.NodeType.COMMENT == element.nodeType) {
    return null;
  }

  var lattr = attributeName.toLowerCase();

  // TODO(user): What's the right thing to do here?
  if ('style' == lattr) {
    return '';
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
  if (goog.array.contains(bot.dom.BOOLEAN_ATTRIBUTES_, lattr)) {
    return (goog.userAgent.IE && attr.value == 'false') ? null : true;
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
 * Determines whether an element is what a user would call "displayed". This
 * means that the element not only has height and width greater than 0px, but
 * also that its visibility is not "hidden" and that it's display property is
 * not "none".
 *
 * @param {!Element} element The element to consider.
 * @return {boolean} Whether or not the element would be visible.
 */
bot.dom.isShown = function(element) {

  if (element && element.nodeType != goog.dom.NodeType.ELEMENT) {
    throw new Error('Argument to isShown must be of type Element');
  }

  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);

  var visible = function(elem) {
    if (elem.tagName && elem.tagName.toUpperCase() == goog.dom.TagName.INPUT &&
        elem.type.toLowerCase() == 'hidden') {
      return false;
    }
    // TODO(user): Move it into getEffectiveStyle.
    var visibility = bot.style.getEffectiveStyle(elem, 'visibility');
    if (visibility == 'inherit') {
      var parent = bot.dom.parentElement(elem);
      return !parent || visible(parent);
    } else {
      return visibility != 'hidden';
    }
  };

  var displayed = function(elem) {
    if (bot.style.getEffectiveStyle(elem, 'display') == 'none') {
      return false;
    }
    var parent = bot.dom.parentElement(elem);
    return !parent || displayed(parent);
  };

  if (!(visible(element) && displayed(element))) {
    return false;
  }

  var size = goog.style.getSize(element);
  return size.height > 0 && size.width > 0;
};


/**
 * Returns the parent element of the given node, or null. This is required
 * because the parent node may not be another element.
 *
 * @param {!Node} node The node who's parent is desired.
 * @return {Element} The parent element, if available, null otherwise.
 */
bot.dom.parentElement = function(node) {
  if (!node.parentNode) {
    return null;
  }

  var elem = node.parentNode;

  while (elem.nodeType != goog.dom.NodeType.ELEMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    elem = elem.parentNode;
  }
  return (/** @type {Element} */ elem &&
      elem.nodeType == goog.dom.NodeType.ELEMENT ? elem : null);
};


/**
 * @param {!Node} node Node to examine.
 * @return {boolean} Whether or not the node is a block level element.
 * @private
 */
bot.dom.isBlockLevel_ = function(node) {
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
 * @param {goog.array.ArrayLike} elements An array of nodes, as returned by
 *      bot.dom.flattenDescendants.
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

  var parentElement = bot.dom.parentElement(textNode);
  if (parentElement && bot.dom.isShown(parentElement)) {
    var textToAdd = textNode.nodeValue;
    textToAdd =
        textToAdd.replace(new RegExp(String.fromCharCode(160), 'gm'), ' ');
    textToAdd = goog.string.collapseWhitespace(textToAdd);
    return textToAdd;
  }
  return '';
};
