// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This file contain classes that add support for cross-domain XHR
 * requests (see http://www.w3.org/TR/cors/). Most modern browsers are able to
 * use a regular XMLHttpRequest for that, but IE 8 use XDomainRequest object
 * instead. This file provides an adapter from this object to a goog.net.XhrLike
 * and a factory to allow using this with a goog.net.XhrIo instance.
 *
 * IE 7 and older versions are not supported (given that they do not support
 * CORS requests).
 */
goog.provide('goog.net.CorsXmlHttpFactory');
goog.provide('goog.net.IeCorsXhrAdapter');

goog.require('goog.net.HttpStatus');
goog.require('goog.net.XhrLike');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.XmlHttpFactory');



/**
 * A factory of XML http request objects that supports cross domain requests.
 * This class should be instantiated and passed as the parameter of a
 * goog.net.XhrIo constructor to allow cross-domain requests in every browser.
 *
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 * @final
 */
goog.net.CorsXmlHttpFactory = function() {
  goog.net.XmlHttpFactory.call(this);
};
goog.inherits(goog.net.CorsXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.CorsXmlHttpFactory.prototype.createInstance = function() {
  var xhr = new XMLHttpRequest();
  if (('withCredentials' in xhr)) {
    return xhr;
  } else if (typeof XDomainRequest != 'undefined') {
    return new goog.net.IeCorsXhrAdapter();
  } else {
    throw Error('Unsupported browser');
  }
};


/** @override */
goog.net.CorsXmlHttpFactory.prototype.internalGetOptions = function() {
  return {};
};



/**
 * An adapter around Internet Explorer's XDomainRequest object that makes it
 * look like a standard XMLHttpRequest. This can be used instead of
 * XMLHttpRequest to support CORS.
 *
 * @implements {goog.net.XhrLike}
 * @constructor
 * @struct
 * @final
 */
goog.net.IeCorsXhrAdapter = function() {
  /**
   * The underlying XDomainRequest used to make the HTTP request.
   * @type {!XDomainRequest}
   * @private
   */
  this.xdr_ = new XDomainRequest();

  /**
   * The simulated ready state.
   * @type {number}
   */
  this.readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;

  /**
   * The simulated ready state change callback function.
   * @type {Function}
   */
  this.onreadystatechange = null;

  /**
   * The simulated response text parameter.
   * @type {?string}
   */
  this.responseText = null;

  /**
   * The simulated status code
   * @type {number}
   */
  this.status = -1;

  /** @override */
  this.responseXML = null;

  /** @override */
  this.statusText = null;

  this.xdr_.onload = goog.bind(this.handleLoad_, this);
  this.xdr_.onerror = goog.bind(this.handleError_, this);
  this.xdr_.onprogress = goog.bind(this.handleProgress_, this);
  this.xdr_.ontimeout = goog.bind(this.handleTimeout_, this);
};


/**
 * Opens a connection to the provided URL.
 * @param {string} method The HTTP method to use. Valid methods include GET and
 *     POST.
 * @param {string} url The URL to contact. The authority of this URL must match
 *     the authority of the current page's URL (e.g. http or https).
 * @param {?boolean=} opt_async Whether the request is asynchronous, defaulting
 *     to true. XDomainRequest does not support syncronous requests, so setting
 *     it to false will actually raise an exception.
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.open = function(method, url, opt_async) {
  if (goog.isDefAndNotNull(opt_async) && (!opt_async)) {
    throw new Error('Only async requests are supported.');
  }
  this.xdr_.open(method, url);
};


/**
 * Sends the request to the remote server. Before calling this function, always
 * call {@link open}.
 * @param {(ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string)=}
 *     opt_content The content to send as POSTDATA, if any. Only string data is
 *     supported by this implementation.
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.send = function(opt_content) {
  if (opt_content) {
    if (typeof opt_content == 'string') {
      this.xdr_.send(opt_content);
    } else {
      throw new Error('Only string data is supported');
    }
  } else {
    this.xdr_.send();
  }
};


/**
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.abort = function() {
  this.xdr_.abort();
};


/**
 * Sets a request header to send to the remote server. Because this
 * implementation does not support request headers, this function does nothing.
 * @param {string} key The name of the HTTP header to set. Ignored.
 * @param {string} value The value to set for the HTTP header. Ignored.
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.setRequestHeader = function(key, value) {
  // Unsupported; ignore the header.
};


/**
 * Returns the value of the response header identified by key. This
 * implementation only supports the 'content-type' header.
 * @param {string} key The request header to fetch. If this parameter is set to
 *     'content-type' (case-insensitive), this function returns the value of
 *     the 'content-type' request header. If this parameter is set to any other
 *     value, this function always returns an empty string.
 * @return {string} The value of the response header, or an empty string if key
 *     is not 'content-type' (case-insensitive).
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.getResponseHeader = function(key) {
  if (key.toLowerCase() == 'content-type') {
    return this.xdr_.contentType;
  }
  return '';
};


/**
 * Handles a request that has fully loaded successfully.
 * @private
 */
goog.net.IeCorsXhrAdapter.prototype.handleLoad_ = function() {
  // IE only calls onload if the status is 200, so the status code must be OK.
  this.status = goog.net.HttpStatus.OK;
  this.responseText = this.xdr_.responseText;
  this.setReadyState_(goog.net.XmlHttp.ReadyState.COMPLETE);
};


/**
 * Handles a request that has failed to load.
 * @private
 */
goog.net.IeCorsXhrAdapter.prototype.handleError_ = function() {
  // IE doesn't tell us what the status code actually is (other than the fact
  // that it is not 200), so simulate an INTERNAL_SERVER_ERROR.
  this.status = goog.net.HttpStatus.INTERNAL_SERVER_ERROR;
  this.responseText = null;
  this.setReadyState_(goog.net.XmlHttp.ReadyState.COMPLETE);
};


/**
 * Handles a request that timed out.
 * @private
 */
goog.net.IeCorsXhrAdapter.prototype.handleTimeout_ = function() {
  this.handleError_();
};


/**
 * Handles a request that is in the process of loading.
 * @private
 */
goog.net.IeCorsXhrAdapter.prototype.handleProgress_ = function() {
  // IE only calls onprogress if the status is 200, so the status code must be
  // OK.
  this.status = goog.net.HttpStatus.OK;
  this.setReadyState_(goog.net.XmlHttp.ReadyState.LOADING);
};


/**
 * Sets this XHR's ready state and fires the onreadystatechange listener (if one
 * is set).
 * @param {number} readyState The new ready state.
 * @private
 */
goog.net.IeCorsXhrAdapter.prototype.setReadyState_ = function(readyState) {
  this.readyState = readyState;
  if (this.onreadystatechange) {
    this.onreadystatechange();
  }
};


/**
 * Returns the response headers from the server. This implemntation only returns
 * the 'content-type' header.
 * @return {string} The headers returned from the server.
 * @override
 */
goog.net.IeCorsXhrAdapter.prototype.getAllResponseHeaders = function() {
  return 'content-type: ' + this.xdr_.contentType;
};
