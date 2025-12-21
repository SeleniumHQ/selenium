/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Wrapper for URL and its createObjectUrl and revokeObjectUrl
 * methods that are part of the HTML5 File API.
 */

goog.provide('goog.fs.url');


/**
 * Creates a blob URL for a blob object.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {!File|!Blob|!MediaSource|!MediaStream} obj The object for which
 *   to create the URL.
 * @return {string} The URL for the object.
 */
goog.fs.url.createObjectUrl = function(obj) {
  'use strict';
  return goog.fs.url.getUrlObject_().createObjectURL(obj);
};


/**
 * Revokes a URL created by {@link goog.fs.url.createObjectUrl}.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {string} url The URL to revoke.
 * @return {void}
 */
goog.fs.url.revokeObjectUrl = function(url) {
  'use strict';
  goog.fs.url.getUrlObject_().revokeObjectURL(url);
};


/**
 * @record
 * @private
 */
goog.fs.url.UrlObject_ = function() {};

/**
 * @param {!File|!Blob|!MediaSource|!MediaStream} arg
 * @return {string}
 */
goog.fs.url.UrlObject_.prototype.createObjectURL = function(arg) {};

/**
 * @param {string} s
 * @return {void}
 */
goog.fs.url.UrlObject_.prototype.revokeObjectURL = function(s) {};


/**
 * Get the object that has the createObjectURL and revokeObjectURL functions for
 * this browser.
 *
 * @return {!goog.fs.url.UrlObject_} The object for this browser.
 * @private
 */
goog.fs.url.getUrlObject_ = function() {
  'use strict';
  const urlObject = goog.fs.url.findUrlObject_();
  if (urlObject != null) {
    return urlObject;
  } else {
    throw new Error('This browser doesn\'t seem to support blob URLs');
  }
};


/**
 * Finds the object that has the createObjectURL and revokeObjectURL functions
 * for this browser.
 *
 * @return {?goog.fs.url.UrlObject_} The object for this browser or null if the
 *     browser does not support Object Urls.
 * @private
 */
goog.fs.url.findUrlObject_ = function() {
  'use strict';
  // This is what the spec says to do
  // http://dev.w3.org/2006/webapi/FileAPI/#dfn-createObjectURL
  if (goog.global.URL !== undefined &&
      goog.global.URL.createObjectURL !== undefined) {
    return /** @type {!goog.fs.url.UrlObject_} */ (goog.global.URL);
    // This is what the spec used to say to do
  } else if (goog.global.createObjectURL !== undefined) {
    return /** @type {!goog.fs.url.UrlObject_} */ (goog.global);
  } else {
    return null;
  }
};


/**
 * Checks whether this browser supports Object Urls. If not, calls to
 * createObjectUrl and revokeObjectUrl will result in an error.
 *
 * @return {boolean} True if this browser supports Object Urls.
 */
goog.fs.url.browserSupportsObjectUrls = function() {
  'use strict';
  return goog.fs.url.findUrlObject_() != null;
};
