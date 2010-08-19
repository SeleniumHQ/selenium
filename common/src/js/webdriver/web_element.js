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
 * @fileoverview Atoms-based implementation of the webelement interface
 */

goog.provide('webdriver.element');


goog.require('bot.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math');
goog.require('goog.style');



/**
 * List of input types that support the "selected" or "checked" property.
 * @type {!Array.<string>}
 * @const
 * @private
 */
webdriver.element.SELECTABLE_TYPES_ = [
  'checkbox',
  'radio'
];


/**
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element could be checked or selected.
 * @private
 */
webdriver.element.isSelectable_ = function(element) {
  var tagName = element.tagName.toUpperCase();

  if (tagName == goog.dom.TagName.OPTION) {
    return true;
  }

  if (tagName == goog.dom.TagName.INPUT) {
    var type = element.type;

    if (goog.array.contains(webdriver.element.SELECTABLE_TYPES_, type)) {
      return true;
    }
  }

  return false;
};


/**
 * @param {!Element} element The element to use.
 * @return {boolean} Whether the element is checked or selected.
 */
webdriver.element.isSelected = function(element) {
  if (!webdriver.element.isSelectable_(element)) {
    return false;
  }

  var propertyName = 'selected';
  var tagName = element.tagName.toUpperCase();
  var type = element.type && element.type.toLowerCase();

  if ('checkbox' == type || 'radio' == type) {
    propertyName = 'checked';
  }

  return !!element[propertyName];
};


/**
 * Get the value of the given property or attribute. If the "attribute" is for
 * a boolean property, we return null in the case where the value is false. If
 * the attribute name is "style" an attempt to convert that style into a string
 * is done.
 *
 * @param {!Element} element The element to use.
 * @param {!string} attribute The name of the attribute to look up.
 * @return {string} The string value of the attribute or property, or null.
 */
webdriver.element.getAttribute = function(element, attribute) {
  var value = null;
  var name = attribute.toLowerCase();

  if ('style' == attribute.toLowerCase()) {
    value = element.style;

    if (value && !goog.isString(value)) {
      value = value.cssText;
    }

    return value;
  }

  if ('selected' == name || 'checked' == name && webdriver.element.isSelectable_(element)) {
    return webdriver.element.isSelected(element) ? "true" : null;
  }

  // Our tests suggest that returning the attribute is desirable for links,
  // but we normally attempt to get the property value before the attribute.
  var isLink =  element.tagName && goog.dom.TagName.A == element.tagName.toUpperCase()

  if (name == 'href' && isLink) {
    value = bot.dom.getAttribute(element, attribute);
  } else {
    value = bot.dom.getProperty(element, attribute);
  }

  if (!goog.isDef(value)) {
    value = bot.dom.getAttribute(element, attribute);
  }

  // The empty string is a valid return value.
  return value || value === '' ? value.toString() : null;
};


/**
 * Get the location of the element, if it's displayed.
 *
 * @param {!Element} element The element to get the location for.
 * @return {goog.math.Rect} The bounding rectangle of the element.
 */
webdriver.element.getLocation = function(element) {
  if (!bot.dom.isShown(element)) {
    return null;
  }
  return goog.style.getBounds(element);
};


/**
 * @param {Element} element The element to use.
 * @return {boolean} Whether the element is in the HEAD tag.
 */
webdriver.element.isInHead_ = function(element) {
  while (element) {
    if (element.tagName && element.tagName.toLowerCase() == 'head') {
      return true;
    }
    try {
      element = element.parentNode;
    } catch (e) {
      // Fine. the DOM has dispeared from underneath us
      return false;
    }
  }

  return false;
};


/**
 * @param {Element} element The element to get the text from.
 * @return {string} The visible text or an empty string.
 */
webdriver.element.getText = function(element) {
  if (webdriver.element.isInHead_(element)) {
    return '';
  }

  return bot.dom.getVisibleText(element);
};