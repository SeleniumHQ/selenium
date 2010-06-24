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
goog.require('goog.array');
goog.require('goog.style');



/**
 * Determines whether or not the element has an attribute or property of the
 * given name, regardless of the value of the attribute.
 *
 * @param {!Element} element The element to use
 * @param {string} attributeName The name of the attribute
 * @return {boolean} Whether the attribute is present.
 */
bot.dom.hasAttribute = function(element, attributeName) {
  if (goog.isFunction(element['hasAttribute'])) {

    // But it might be an element property....
    if (element.hasAttribute(attributeName)) {
      return true;
    }
  }

  // hasAttributes method is missing. IE 8 and above have an
  // attributes array so use that if present.
  if (goog.isArrayLike(element['attributes'])) {
    // We want to indicate that the attribute is present, regardless
    // of value.
    if (element.attributes[attributeName] ||
        element.attributes[attributeName] == false) {
      return true;
    }
  }

  // No attributes array, or may be a property. Query the object
  return attributeName in element;
};

/**
 * Used to determine whether we should return a boolean value from getAttribute.
 *
 * @const
 * @private
 */
bot.dom.BOOLEAN_PROPERTIES_ = [
  'checked',
  'disabled',
  'readOnly',
  'selected'
];

/**
 * Define which elements may have which boolean property.
 *
 *  @const
 *  @private
 */
bot.dom.PROPERTY_TO_TAGNAME_ = {
  'checked': [ 'INPUT' ],
  'disabled': [ 'INPUT' ],
  'readOnly': [ 'INPUT' ],
  'selected': [ 'INPUT', 'OPTION' ]
};


/**
 * Get the value of the given attribute or property of the
 * element. This method will endeavour to return consistent values
 * between browsers. For example, boolean values for attributes such
 * as "selected" or "checked" will always be returned as "true" or
 * "false".
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {string|boolean} The value of the attribute or "null" if entirely
 *     missing.
 */
bot.dom.getAttribute = function(element, attributeName) {
  var lattr = attributeName.toLowerCase();
  var value = null;

  // Handle common boolean values
  var tags = bot.dom.PROPERTY_TO_TAGNAME_[attributeName];
  if (goog.array.contains(bot.dom.BOOLEAN_PROPERTIES_, attributeName) &&
      goog.array.contains(tags, element.tagName)) {

    if (!bot.dom.hasAttribute(element, attributeName)) {
      return false;
    }

    value = element[attributeName];
    return !!(value && value != 'false');
  }

  // TODO(user): What's the right thing to do here?
  if ('style' == lattr) {
    return '';
  }

  // Commonly looked up attributes that are aliases
  if ('class' == lattr) {
    attributeName = 'className';
  }

  if ('readonly' == lattr) {
    attributeName = 'readOnly';
  }

  if (!bot.dom.hasAttribute(element, attributeName)) {
    return null;
  }

  //  value = goog.isDef(element.getAttribute(attributeName)) ?
//       element.getAttribute(attributeName) : element[attributeName];

  value = goog.isDefAndNotNull(element.getAttribute(attributeName)) ?
      element.getAttribute(attributeName) : element[attributeName];

  return value;
};


/**
 * Determines whether an element is what a user would call "selected". This boils
 * down to checking to see if either the "checked" or "selected" attribute is true
 *
 * @param {!Element} element The element to use
 */
bot.dom.isSelected = function(element) {
  if (bot.dom.hasAttribute(element, 'checked')) {
    return bot.dom.getAttribute(element, 'checked');
  }
  if (bot.dom.hasAttribute(element, 'selected')) {
    return bot.dom.getAttribute(element, 'selected');
  }

  throw Error('Element has neither checked nor selected attributes');
};
