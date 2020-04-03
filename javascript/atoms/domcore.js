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

/**
 * @fileoverview Defines the core DOM querying library for the atoms, with a
 * minimal set of dependencies. Notably, this file should never have a
 * dependency on CSS or XPath polyfill libraries (sizzle and wgxpath,
 * respectively).
 */

goog.provide('bot.dom.core');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');


/**
 * Get the user-specified value of the given attribute of the element, or null
 * if the attribute is not present.
 *
 * <p>For boolean attributes such as "selected" or "checked", this method
 * returns the value of element.getAttribute(attributeName) cast to a String
 * when attribute is present. For modern browsers, this will be the string the
 * attribute is given in the HTML, but for IE8 it will be the name of the
 * attribute, and for IE7, it will be the string "true". To test whether a
 * boolean attribute is present, test whether the return value is non-null, the
 * same as one would for non-boolean attributes. Specifically, do *not* test
 * whether the boolean evaluation of the return value is true, because the value
 * of a boolean attribute that is present will often be the empty string.
 *
 * <p>For the style attribute, it standardizes the value by lower-casing the
 * property names and always including a trailing semi-colon.
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {?string} The value of the attribute or "null" if entirely missing.
 */
bot.dom.core.getAttribute = function(element, attributeName) {
  attributeName = attributeName.toLowerCase();

  // The style attribute should be a css text string that includes only what
  // the HTML element specifies itself (excluding what is inherited from parent
  // elements or style sheets). We standardize the format of this string via the
  // standardizeStyleAttribute method.
  if (attributeName == 'style') {
    return bot.dom.core.standardizeStyleAttribute_(element.style.cssText);
  }

  // In IE doc mode < 8, the "value" attribute of an <input> is only accessible
  // as a property.
  if (bot.userAgent.IE_DOC_PRE8 && attributeName == 'value' &&
      bot.dom.core.isElement(element, goog.dom.TagName.INPUT)) {
    return element['value'];
  }

  // In IE < 9, element.getAttributeNode will return null for some boolean
  // attributes that are present, such as the selected attribute on <option>
  // elements. This if-statement is sufficient if these cases are restricted
  // to boolean attributes whose reflected property names are all lowercase
  // (as attributeName is by this point), like "selected". We have not
  // found a boolean attribute for which this does not work.
  if (bot.userAgent.IE_DOC_PRE9 && element[attributeName] === true) {
    return String(element.getAttribute(attributeName));
  }

  // When the attribute is not present, either attr will be null or
  // attr.specified will be false.
  var attr = element.getAttributeNode(attributeName);
  return (attr && attr.specified) ? attr.value : null;
};


/**
 * Regex to split on semicolons, but not when enclosed in parens or quotes.
 * Helper for {@link bot.dom.core.standardizeStyleAttribute_}.
 * If the style attribute ends with a semicolon this will include an empty
 * string at the end of the array
 * @private {!RegExp}
 * @const
 */
bot.dom.core.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_ =
    new RegExp('[;]+' +
               '(?=(?:(?:[^"]*"){2})*[^"]*$)' +
               '(?=(?:(?:[^\']*\'){2})*[^\']*$)' +
               '(?=(?:[^()]*\\([^()]*\\))*[^()]*$)');


/**
 * Standardize a style attribute value, which includes:
 *  (1) converting all property names lowercase
 *  (2) ensuring it ends in a trailing semi-colon
 * @param {string} value The style attribute value.
 * @return {string} The identical value, with the formatting rules described
 *     above applied.
 * @private
 */
bot.dom.core.standardizeStyleAttribute_ = function(value) {
  var styleArray = value.split(
      bot.dom.core.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_);
  var css = [];
  goog.array.forEach(styleArray, function(pair) {
    var i = pair.indexOf(':');
    if (i > 0) {
      var keyValue = [pair.slice(0, i), pair.slice(i + 1)];
      if (keyValue.length == 2) {
        css.push(keyValue[0].toLowerCase(), ':', keyValue[1], ';');
      }
    }
  });
  css = css.join('');
  css = css.charAt(css.length - 1) == ';' ? css : css + ';';
  return css;
};


/**
 * Looks up the given property (not to be confused with an attribute) on the
 * given element.
 *
 * @param {!Element} element The element to use.
 * @param {string} propertyName The name of the property.
 * @return {*} The value of the property.
 */
bot.dom.core.getProperty = function(element, propertyName) {
  // When an <option>'s value attribute is not set, its value property should be
  // its text content, but IE < 8 does not adhere to that behavior, so fix it.
  // http://www.w3.org/TR/1999/REC-html401-19991224/interact/forms.html#adef-value-OPTION
  if (bot.userAgent.IE_DOC_PRE8 && propertyName == 'value' &&
      bot.dom.core.isElement(element, goog.dom.TagName.OPTION) &&
      goog.isNull(bot.dom.core.getAttribute(element, 'value'))) {
    return goog.dom.getRawTextContent(element);
  }
  return element[propertyName];
};



/**
 * Returns whether the given node is an element and, optionally, whether it has
 * the given tag name. If the tag name is not provided, returns true if the node
 * is an element, regardless of the tag name.h
 *
 * @template T
 * @param {Node} node The node to test.
 * @param {(goog.dom.TagName<!T>|string)=} opt_tagName Tag name to test the node for.
 * @return {boolean} Whether the node is an element with the given tag name.
 */
bot.dom.core.isElement = function(node, opt_tagName) {
  // because we call this with deprecated tags such as SHADOW
  if (opt_tagName && (typeof opt_tagName !== 'string')) {
    opt_tagName = opt_tagName.toString();
  }
  return !!node && node.nodeType == goog.dom.NodeType.ELEMENT &&
      (!opt_tagName || node.tagName.toUpperCase() == opt_tagName);
};


/**
 * Returns whether the element can be checked or selected.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element could be checked or selected.
 */
bot.dom.core.isSelectable = function(element) {
  if (bot.dom.core.isElement(element, goog.dom.TagName.OPTION)) {
    return true;
  }

  if (bot.dom.core.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    return type == 'checkbox' || type == 'radio';
  }

  return false;
};


/**
 * Returns whether the element is checked or selected.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is checked or selected.
 */
bot.dom.core.isSelected = function(element) {
  if (!bot.dom.core.isSelectable(element)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
        'Element is not selectable');
  }

  var propertyName = 'selected';
  var type = element.type && element.type.toLowerCase();
  if ('checkbox' == type || 'radio' == type) {
    propertyName = 'checked';
  }

  return !!bot.dom.core.getProperty(element, propertyName);
};
