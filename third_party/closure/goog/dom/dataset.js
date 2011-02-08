// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for adding, removing and setting values in
 * an Element's dataset.
 * See {@link http://www.w3.org/TR/html5/Overview.html#dom-dataset}.
 *
 */

goog.provide('goog.dom.dataset');

goog.require('goog.string');


/**
 * Sets a custom data attribute on an element. The key should be
 * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 * @param {Element} element DOM node to set the custom data attribute on.
 * @param {string} key Key for the custom data attribute.
 * @param {string} value Value for the custom data attribute.
 */
goog.dom.dataset.set = function(element, key, value) {
  if (element.dataset) {
    element.dataset[key] = value;
  } else {
    element.setAttribute('data-' + goog.string.toSelectorCase(key), value);
  }
};


/**
 * Gets a custom data attribute from an element. The key should be
  * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 * @param {Element} element DOM node to get the custom data attribute from.
 * @param {string} key Key for the custom data attribute.
 * @return {?string} The attribute value, if it exists.
 */
goog.dom.dataset.get = function(element, key) {
  if (element.dataset) {
    return element.dataset[key];
  } else {
    return element.getAttribute('data-' + goog.string.toSelectorCase(key));
  }
};


/**
 * Removes a custom data attribute from an element. The key should be
  * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 * @param {Element} element DOM node to get the custom data attribute from.
 * @param {string} key Key for the custom data attribute.
 */
goog.dom.dataset.remove = function(element, key) {
  if (element.dataset) {
    delete element.dataset[key];
  } else {
    element.removeAttribute('data-' + goog.string.toSelectorCase(key));
  }
};


/**
 * Checks whether custom data attribute exists on an element. The key should be
  * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 *
 * @param {Element} element DOM node to get the custom data attribute from.
 * @param {string} key Key for the custom data attribute.
 * @return {boolean} Whether the attibute exists.
 */
goog.dom.dataset.has = function(element, key) {
  if (element.dataset) {
    return key in element.dataset;
  } else if (element.hasAttribute) {
    return element.hasAttribute('data-' + goog.string.toSelectorCase(key));
  } else {
    return !!(element.getAttribute('data-' + goog.string.toSelectorCase(key)));
  }
};
