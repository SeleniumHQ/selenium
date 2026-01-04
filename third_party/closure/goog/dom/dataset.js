/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for adding, removing and setting values in
 * an Element's dataset.
 * See {@link http://www.w3.org/TR/html5/Overview.html#dom-dataset}.
 */

goog.provide('goog.dom.dataset');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.string');
goog.require('goog.userAgent.product');


/**
 * Whether using the dataset property is allowed.
 *
 * In IE (up to and including IE 11), setting element.dataset in JS does not
 * propagate values to CSS, breaking expressions such as
 * `content: attr(data-content)` that would otherwise work.
 * See {@link https://github.com/google/closure-library/issues/396}.
 *
 * In Safari >= 9, reading from element.dataset sometimes returns
 * undefined, even though the corresponding data- attribute has a value.
 * See {@link https://bugs.webkit.org/show_bug.cgi?id=161454}.
 * @const
 * @private
 */
goog.dom.dataset.ALLOWED_ =
    !goog.userAgent.product.IE && !goog.labs.userAgent.browser.isSafari();


/**
 * The DOM attribute name prefix that must be present for it to be considered
 * for a dataset.
 * @type {string}
 * @const
 * @private
 */
goog.dom.dataset.PREFIX_ = 'data-';


/**
 * Returns whether a string is a valid dataset property name.
 * @param {string} key Property name for the custom data attribute.
 * @return {boolean} Whether the string is a valid dataset property name.
 * @private
 */
goog.dom.dataset.isValidProperty_ = function(key) {
  'use strict';
  return !/-[a-z]/.test(key);
};


/**
 * Sets a custom data attribute on an element. The key should be
 * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 * @param {Element} element DOM node to set the custom data attribute on.
 * @param {string} key Key for the custom data attribute.
 * @param {string} value Value for the custom data attribute.
 */
goog.dom.dataset.set = function(element, key, value) {
  'use strict';
  var htmlElement = /** @type {HTMLElement} */ (element);
  if (goog.dom.dataset.ALLOWED_ && htmlElement.dataset) {
    htmlElement.dataset[key] = value;
  } else if (!goog.dom.dataset.isValidProperty_(key)) {
    throw new Error(
        goog.DEBUG ? '"' + key + '" is not a valid dataset property name.' :
                     '');
  } else {
    element.setAttribute(
        goog.dom.dataset.PREFIX_ + goog.string.toSelectorCase(key), value);
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
  'use strict';
  // Edge, unlike other browsers, will do camel-case conversion when retrieving
  // "dash-case" properties.
  if (!goog.dom.dataset.isValidProperty_(key)) {
    return null;
  }
  var htmlElement = /** @type {HTMLElement} */ (element);
  if (goog.dom.dataset.ALLOWED_ && htmlElement.dataset) {
    // Android browser (non-chrome) returns the empty string for
    // element.dataset['doesNotExist'].
    if (goog.labs.userAgent.browser.isAndroidBrowser() &&
        !(key in htmlElement.dataset)) {
      return null;
    }
    var value = htmlElement.dataset[key];
    return value === undefined ? null : value;
  } else {
    return htmlElement.getAttribute(
        goog.dom.dataset.PREFIX_ + goog.string.toSelectorCase(key));
  }
};


/**
 * Removes a custom data attribute from an element. The key should be
  * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 * @param {Element} element DOM node to get the custom data attribute from.
 * @param {string} key Key for the custom data attribute.
 */
goog.dom.dataset.remove = function(element, key) {
  'use strict';
  // Edge, unlike other browsers, will do camel-case conversion when removing
  // "dash-case" properties.
  if (!goog.dom.dataset.isValidProperty_(key)) {
    return;
  }
  var htmlElement = /** @type {HTMLElement} */ (element);
  if (goog.dom.dataset.ALLOWED_ && htmlElement.dataset) {
    // In strict mode Safari will trigger an error when trying to delete a
    // property which does not exist.
    if (goog.dom.dataset.has(element, key)) {
      delete htmlElement.dataset[key];
    }
  } else {
    element.removeAttribute(
        goog.dom.dataset.PREFIX_ + goog.string.toSelectorCase(key));
  }
};


/**
 * Checks whether custom data attribute exists on an element. The key should be
 * in camelCase format (e.g "keyName" for the "data-key-name" attribute).
 *
 * @param {Element} element DOM node to get the custom data attribute from.
 * @param {string} key Key for the custom data attribute.
 * @return {boolean} Whether the attribute exists.
 */
goog.dom.dataset.has = function(element, key) {
  'use strict';
  // Edge, unlike other browsers, will do camel-case conversion when retrieving
  // "dash-case" properties.
  if (!goog.dom.dataset.isValidProperty_(key)) {
    return false;
  }
  var htmlElement = /** @type {HTMLElement} */ (element);
  if (goog.dom.dataset.ALLOWED_ && htmlElement.dataset) {
    return key in htmlElement.dataset;
  } else if (htmlElement.hasAttribute) {
    return htmlElement.hasAttribute(
        goog.dom.dataset.PREFIX_ + goog.string.toSelectorCase(key));
  } else {
    return !!(htmlElement.getAttribute(
        goog.dom.dataset.PREFIX_ + goog.string.toSelectorCase(key)));
  }
};


/**
 * Gets all custom data attributes as a string map.  The attribute names will be
 * camel cased (e.g., data-foo-bar -> dataset['fooBar']).  This operation is not
 * safe for attributes having camel-cased names clashing with already existing
 * properties (e.g., data-to-string -> dataset['toString']).
 * @param {!Element} element DOM node to get the data attributes from.
 * @return {!Object} The string map containing data attributes and their
 *     respective values.
 */
goog.dom.dataset.getAll = function(element) {
  'use strict';
  var htmlElement = /** @type {HTMLElement} */ (element);
  if (goog.dom.dataset.ALLOWED_ && htmlElement.dataset) {
    return htmlElement.dataset;
  } else {
    var dataset = {};
    var attributes = element.attributes;
    for (var i = 0; i < attributes.length; ++i) {
      var attribute = attributes[i];
      if (goog.string.startsWith(attribute.name, goog.dom.dataset.PREFIX_)) {
        // We use slice(5), since it's faster than replacing 'data-' with ''.
        var key = goog.string.toCamelCase(attribute.name.slice(5));
        dataset[key] = attribute.value;
      }
    }
    return dataset;
  }
};
