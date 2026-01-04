/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Vendor prefix getters.
 */

goog.provide('goog.dom.vendor');

goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Returns the JS vendor prefix used in CSS properties. Different vendors
 * use different methods of changing the case of the property names.
 *
 * @return {?string} The JS vendor prefix or null if there is none.
 */
goog.dom.vendor.getVendorJsPrefix = function() {
  'use strict';
  if (goog.userAgent.WEBKIT) {
    return 'Webkit';
  } else if (goog.userAgent.GECKO) {
    return 'Moz';
  } else if (goog.userAgent.IE) {
    return 'ms';
  }

  return null;
};


/**
 * Returns the vendor prefix used in CSS properties.
 *
 * @return {?string} The vendor prefix or null if there is none.
 */
goog.dom.vendor.getVendorPrefix = function() {
  'use strict';
  if (goog.userAgent.WEBKIT) {
    return '-webkit';
  } else if (goog.userAgent.GECKO) {
    return '-moz';
  } else if (goog.userAgent.IE) {
    return '-ms';
  }

  return null;
};


/**
 * @param {string} propertyName A property name.
 * @param {!Object=} opt_object If provided, we verify if the property exists in
 *     the object.
 * @return {?string} A vendor prefixed property name, or null if it does not
 *     exist.
 */
goog.dom.vendor.getPrefixedPropertyName = function(propertyName, opt_object) {
  'use strict';
  // We first check for a non-prefixed property, if available.
  if (opt_object && propertyName in opt_object) {
    return propertyName;
  }
  var prefix = goog.dom.vendor.getVendorJsPrefix();
  if (prefix) {
    prefix = prefix.toLowerCase();
    var prefixedPropertyName = prefix + goog.string.toTitleCase(propertyName);
    return (opt_object === undefined || prefixedPropertyName in opt_object) ?
        prefixedPropertyName :
        null;
  }
  return null;
};


/**
 * @param {string} eventType An event type.
 * @return {string} A lower-cased vendor prefixed event type.
 */
goog.dom.vendor.getPrefixedEventType = function(eventType) {
  'use strict';
  var prefix = goog.dom.vendor.getVendorJsPrefix() || '';
  return (prefix + eventType).toLowerCase();
};
