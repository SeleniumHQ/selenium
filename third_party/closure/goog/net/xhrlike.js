/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.net.XhrLike');



/**
 * Interface for the common parts of XMLHttpRequest.
 *
 * Mostly copied from externs/w3c_xml.js.
 *
 * @interface
 * @see http://www.w3.org/TR/XMLHttpRequest/
 */
goog.net.XhrLike = function() {};


/**
 * Typedef that refers to either native or custom-implemented XHR objects.
 * @typedef {!goog.net.XhrLike|!XMLHttpRequest}
 */
goog.net.XhrLike.OrNative;


/**
 * @type {function()|null|undefined}
 * @see http://www.w3.org/TR/XMLHttpRequest/#handler-xhr-onreadystatechange
 */
goog.net.XhrLike.prototype.onreadystatechange;


/**
 * @type {?ArrayBuffer|?Blob|?Document|?Object|?string}
 * @see https://xhr.spec.whatwg.org/#response-object
 */
goog.net.XhrLike.prototype.response;


/**
 * @type {string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetext-attribute
 */
goog.net.XhrLike.prototype.responseText;


/**
 * @type {string}
 * @see https://xhr.spec.whatwg.org/#the-responsetype-attribute
 */
goog.net.XhrLike.prototype.responseType;


/**
 * @type {Document}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-responsexml-attribute
 */
goog.net.XhrLike.prototype.responseXML;


/**
 * @type {number}
 * @see http://www.w3.org/TR/XMLHttpRequest/#readystate
 */
goog.net.XhrLike.prototype.readyState;


/**
 * @type {number}
 * @see http://www.w3.org/TR/XMLHttpRequest/#status
 */
goog.net.XhrLike.prototype.status;


/**
 * @type {string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#statustext
 */
goog.net.XhrLike.prototype.statusText;


/**
 * @param {string} method
 * @param {string} url
 * @param {?boolean=} opt_async
 * @param {?string=} opt_user
 * @param {?string=} opt_password
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-open()-method
 */
goog.net.XhrLike.prototype.open = function(
    method, url, opt_async, opt_user, opt_password) {};


/**
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_data
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-send()-method
 */
goog.net.XhrLike.prototype.send = function(opt_data) {};


/**
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-abort()-method
 */
goog.net.XhrLike.prototype.abort = function() {};


/**
 * @param {string} header
 * @param {string} value
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
 */
goog.net.XhrLike.prototype.setRequestHeader = function(header, value) {};


/**
 * @param {string} header
 * @return {?string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method
 */
goog.net.XhrLike.prototype.getResponseHeader = function(header) {};


/**
 * @return {string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders()-method
 */
goog.net.XhrLike.prototype.getAllResponseHeaders = function() {};

/**
 * @type {?function(!TrustTokenAttributeType): void | undefined}
 * @see https://docs.google.com/document/d/1qUjtKgA7nMv9YGMhi0xWKEojkSITKzGLdIcZgoz6ZkI.
 */
goog.net.XhrLike.prototype.setTrustToken = function(trustTokenAttribute) {};
