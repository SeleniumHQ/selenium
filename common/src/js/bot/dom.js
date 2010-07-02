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
 * @param {!Element} element The element to use.
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
}


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
 * @return {string|boolean} The value of the property or "null" if entirely
 *     missing.
 */
bot.dom.getProperty = function(element, propertyName) {
  var key = bot.dom.PROPERTY_ALIASES_[propertyName] || propertyName;

  return element[key];
};


/**
 * Used to determine whether we should return a boolean value from getAttribute.
 *
 * @const
 * @private
 */
bot.dom.BOOLEAN_ATTRIBUTES_ = [
  'checked',
  'disabled',
  'readOnly',
  'selected'
];


/**
 * Determines whether or not the element has an attribute of the given name,
 * regardless of the value of the attribute.
 *
 * @param {!Element} element The element to use
 * @param {string} attributeName The name of the attribute
 * @return {boolean} Whether the attribute is present.
 */
bot.dom.hasAttribute = function(element, attributeName) {
  return !goog.isNull(bot.dom.getAttribute(element, attributeName));
};


/**
 * Get the value of the given attribute of the element. This method will
 * endeavour to return consistent values between browsers. For example, boolean
 * values for attributes such as "selected" or "checked" will always be returned
 * as the boolean values "true" or "false".
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {(string|boolean)?} The value of the attribute or "null" if entirely
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

  // Commonly looked up attributes that are aliases
  if ('readonly' == lattr) {
    attributeName = 'readOnly';
  }

  // IE lacks a hasAttribute method, so we use the attributes array.
  var value = null;
  if (goog.isFunction(element['hasAttribute'])) {
    value = element.getAttribute(attributeName);
  } else {
    value = element.attributes[attributeName];
    if (goog.isDef(value)) {
      value = value.value;
    }
  }

  if (!goog.isDefAndNotNull(value)) {
    return null;
  }

  // Handle common boolean values
  if (goog.array.contains(bot.dom.BOOLEAN_ATTRIBUTES_, attributeName)) {
    value = !!value && value != 'false';
  }

  return value;
};
