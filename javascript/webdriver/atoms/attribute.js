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

goog.module('webdriver.atoms.element.attribute');
goog.module.declareLegacyNamespace();

var TagName = goog.require('goog.dom.TagName');
var array = goog.require('goog.array');
var domCore = goog.require('bot.dom.core');


/**
 * Common aliases for properties. This maps names that users use to the correct
 * property name.
 *
 * @const {!Object<string, string>}
 */
var PROPERTY_ALIASES = {
  'class': 'className',
  'readonly': 'readOnly'
};


/**
 * Used to determine whether we should return a boolean value from getAttribute.
 * These are all extracted from the WHATWG spec:
 *
 *   http://www.whatwg.org/specs/web-apps/current-work/
 *
 * These must all be lower-case.
 *
 * @const {!Array<string>}
 */
var BOOLEAN_PROPERTIES = [
  'allowfullscreen',
  'allowpaymentrequest',
  'allowusermedia',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'complete',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultselected',
  'defer',
  'disabled',
  'ended',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'iscontenteditable',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'paused',
  'playsinline',
  'pubdate',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'seeking',
  'selected',
  'truespeed',
  'typemustmatch',
  'willvalidate'
];


/**
 * Get the value of the given property or attribute. If the "attribute" is for
 * a boolean property, we return null in the case where the value is false. If
 * the attribute name is "style" an attempt to convert that style into a string
 * is done.
 *
 * @param {!Element} element The element to use.
 * @param {string} attribute The name of the attribute to look up.
 * @return {?string} The string value of the attribute or property, or null.
 * @suppress {reportUnknownTypes}
 */
exports.get = function(element, attribute) {
  var value = null;
  var name = attribute.toLowerCase();

  if ('style' == name) {
    value = element.style;

    if (value && !goog.isString(value)) {
      value = value.cssText;
    }

    return /** @type {?string} */ (value);
  }

  if (('selected' == name || 'checked' == name) &&
      domCore.isSelectable(element)) {
    return domCore.isSelected(element) ? 'true' : null;
  }

  // Our tests suggest that returning the attribute is desirable for
  // the href attribute of <a> tags and the src attribute of <img> tags,
  // but we normally attempt to get the property value before the attribute.
  var isLink = domCore.isElement(element, TagName.A);
  var isImg = domCore.isElement(element, TagName.IMG);

  // Although the attribute matters, the property is consistent. Return that in
  // preference to the attribute for links and images.
  if ((isImg && name == 'src') || (isLink && name == 'href')) {
    value = domCore.getAttribute(element, name);
    if (value) {
      // We want the full URL if present
      value = domCore.getProperty(element, name);
    }
    return /** @type {?string} */ (value);
  }

  if ('spellcheck' == name) {
    value = domCore.getAttribute(element, name);
    if (!goog.isNull(value)) {
      if (value.toLowerCase() == 'false') {
        return 'false';
      } else if (value.toLowerCase() == 'true') {
        return 'true';
      }
    }
    // coerce the property value to a string
    return domCore.getProperty(element, name) + '';
  }

  var propName = PROPERTY_ALIASES[attribute] || attribute;
  if (array.contains(BOOLEAN_PROPERTIES, name)) {
    value = !goog.isNull(domCore.getAttribute(element, attribute)) ||
        domCore.getProperty(element, propName);
    return value ? 'true' : null;
  }

  var property;
  try {
    property = domCore.getProperty(element, propName);
  } catch (e) {
    // Leaves property undefined or null
  }

  // 1- Call getAttribute if getProperty fails,
  // i.e. property is null or undefined.
  // This happens for event handlers in Firefox.
  // For example, calling getProperty for 'onclick' would
  // fail while getAttribute for 'onclick' will succeed and
  // return the JS code of the handler.
  //
  // 2- When property is an object we fall back to the
  // actual attribute instead.
  // See issue http://code.google.com/p/selenium/issues/detail?id=966
  if (!goog.isDefAndNotNull(property) || goog.isObject(property)) {
    value = domCore.getAttribute(element, attribute);
  } else {
    value = property;
  }

  // The empty string is a valid return value.
  return goog.isDefAndNotNull(value) ? value.toString() : null;
};

