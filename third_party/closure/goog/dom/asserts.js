/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.dom.asserts');

goog.require('goog.asserts');

goog.require('goog.utils');

/**
 * @fileoverview Custom assertions to ensure that an element has the appropriate
 * type.
 *
 * Using a goog.dom.safe wrapper on an object on the incorrect type (via an
 * incorrect static type cast) can result in security bugs: For instance,
 * g.d.s.setAnchorHref ensures that the URL assigned to the .href attribute
 * satisfies the SafeUrl contract, i.e., is safe to dereference as a hyperlink.
 * However, the value assigned to a HTMLLinkElement's .href property requires
 * the stronger TrustedResourceUrl contract, since it can refer to a stylesheet.
 * Thus, using g.d.s.setAnchorHref on an (incorrectly statically typed) object
 * of type HTMLLinkElement can result in a security vulnerability.
 * Assertions of the correct run-time type help prevent such incorrect use.
 *
 * In some cases, code using the DOM API is tested using mock objects (e.g., a
 * plain object such as {'href': url} instead of an actual Location object).
 * To allow such mocking, the assertions permit objects of types that are not
 * relevant DOM API objects at all (for instance, not Element or Location).
 *
 * Note that instanceof checks don't work straightforwardly in older versions of
 * IE, or across frames (see,
 * http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object,
 * http://stackoverflow.com/questions/26248599/instanceof-htmlelement-in-iframe-is-not-element-or-object).
 *
 * Hence, these assertions may pass vacuously in such scenarios. The resulting
 * risk of security bugs is limited by the following factors:
 *  - A bug can only arise in scenarios involving incorrect static typing (the
 *    wrapper methods are statically typed to demand objects of the appropriate,
 *    precise type).
 *  - Typically, code is tested and exercised in multiple browsers.
 */

/**
 * Asserts that a given object is a Location.
 *
 * To permit this assertion to pass in the context of tests where DOM APIs might
 * be mocked, also accepts any other type except for subtypes of {!Element}.
 * This is to ensure that, for instance, HTMLLinkElement is not being used in
 * place of a Location, since this could result in security bugs due to stronger
 * contracts required for assignments to the href property of the latter.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!Location}
 */
goog.dom.asserts.assertIsLocation = function(o) {
  'use strict';
  if (goog.asserts.ENABLE_ASSERTS) {
    var win = goog.dom.asserts.getWindow_(o);
    if (win) {
      if (!o || (!(o instanceof win.Location) && o instanceof win.Element)) {
        goog.asserts.fail(
            'Argument is not a Location (or a non-Element mock); got: %s',
            goog.dom.asserts.debugStringForType_(o));
      }
    }
  }
  return /** @type {!Location} */ (o);
};


/**
 * Returns a string representation of a value's type.
 *
 * @param {*} value An object, or primitive.
 * @return {string} The best display name for the value.
 * @private
 */
goog.dom.asserts.debugStringForType_ = function(value) {
  'use strict';
  if (goog.utils.isObject(value)) {
    try {
      return /** @type {string|undefined} */ (value.constructor.displayName) ||
          value.constructor.name || Object.prototype.toString.call(value);
    } catch (e) {
      return '<object could not be stringified>';
    }
  } else {
    return value === undefined ? 'undefined' :
                                 value === null ? 'null' : typeof value;
  }
};

/**
 * Gets window of element.
 * @param {?Object} o
 * @return {?Window}
 * @private
 * @suppress {strictMissingProperties} ownerDocument not defined on Object
 */
goog.dom.asserts.getWindow_ = function(o) {
  'use strict';
  try {
    var doc = o && o.ownerDocument;
    // This can throw “Blocked a frame with origin "chrome-extension://..." from
    // accessing a cross-origin frame” in Chrome extension.
    var win =
        doc && /** @type {?Window} */ (doc.defaultView || doc.parentWindow);
    win = win || /** @type {!Window} */ (goog.global);
    // This can throw “Permission denied to access property "Element" on
    // cross-origin object”.
    if (win.Element && win.Location) {
      return win;
    }
  } catch (ex) {
  }
  return null;
};
