// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Mock of XhrIo for unit testing.
 */

goog.provide('goog.testing.net.XhrIo');

goog.require('goog.array');
goog.require('goog.dom.xml');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XhrIo.ResponseType');
goog.require('goog.net.XmlHttp');
goog.require('goog.object');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');



/**
 * Mock implementation of goog.net.XhrIo. This doesn't provide a mock
 * implementation for all cases, but it's not too hard to add them as needed.
 * @param {goog.testing.TestQueue=} opt_testQueue Test queue for inserting test
 *     events.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.testing.net.XhrIo = function(opt_testQueue) {
  goog.events.EventTarget.call(this);

  /**
   * Map of default headers to add to every request, use:
   * XhrIo.headers.set(name, value)
   * @type {goog.structs.Map}
   */
  this.headers = new goog.structs.Map();

  /**
   * Queue of events write to.
   * @type {goog.testing.TestQueue?}
   * @private
   */
  this.testQueue_ = opt_testQueue || null;
};
goog.inherits(goog.testing.net.XhrIo, goog.events.EventTarget);


/**
 * All non-disposed instances of goog.testing.net.XhrIo created
 * by {@link goog.testing.net.XhrIo.send} are in this Array.
 * @see goog.testing.net.XhrIo.cleanupAllPendingStaticSends
 * @type {Array.<goog.testing.net.XhrIo>}
 * @private
 */
goog.testing.net.XhrIo.sendInstances_ = [];


/**
 * Returns an Array containing all non-disposed instances of
 * goog.testing.net.XhrIo created by {@link goog.testing.net.XhrIo.send}.
 * @return {Array} Array of goog.testing.net.XhrIo instances.
 */
goog.testing.net.XhrIo.getSendInstances = function() {
  return goog.testing.net.XhrIo.sendInstances_;
};


/**
 * Simulates the static XhrIo send method.
 * @param {string} url Uri to make request to.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string=} opt_content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.testing.net.XhrIo.send = function(url, opt_callback, opt_method,
                                       opt_content, opt_headers,
                                       opt_timeoutInterval) {
  var x = new goog.testing.net.XhrIo();
  goog.testing.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(x,
                     goog.net.EventType.READY,
                     goog.partial(goog.testing.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.send(url, opt_method, opt_content, opt_headers);
};


/**
 * Disposes of the specified goog.testing.net.XhrIo created by
 * {@link goog.testing.net.XhrIo.send} and removes it from
 * {@link goog.testing.net.XhrIo.pendingStaticSendInstances_}.
 * @param {goog.testing.net.XhrIo} XhrIo An XhrIo created by
 *     {@link goog.testing.net.XhrIo.send}.
 * @private
 */
goog.testing.net.XhrIo.cleanupSend_ = function(XhrIo) {
  XhrIo.dispose();
  goog.array.remove(goog.testing.net.XhrIo.sendInstances_, XhrIo);
};


/**
 * Stores the simulated response headers for the requests which are sent through
 * this XhrIo.
 * @type {Object}
 * @private
 */
goog.testing.net.XhrIo.prototype.responseHeaders_;


/**
 * Whether MockXhrIo is active.
 * @type {boolean}
 * @private
 */
goog.testing.net.XhrIo.prototype.active_ = false;


/**
 * Last URI that was requested.
 * @type {string}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastUri_ = '';


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastErrorCode_ =
    goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {string}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastError_ = '';


/**
 * The response object.
 * @type {string|Document}
 * @private
 */
goog.testing.net.XhrIo.prototype.response_ = '';


/**
 * Mock ready state.
 * @type {number}
 * @private
 */
goog.testing.net.XhrIo.prototype.readyState_ =
    goog.net.XmlHttp.ReadyState.UNINITIALIZED;


/**
 * Number of milliseconds after which an incomplete request will be aborted and
 * a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no timeout is set.
 * @type {number}
 * @private
 */
goog.testing.net.XhrIo.prototype.timeoutInterval_ = 0;


/**
 * Window timeout ID used to cancel the timeout event handler if the request
 * completes successfully.
 * @type {Object}
 * @private
 */
goog.testing.net.XhrIo.prototype.timeoutId_ = null;


/**
 * The requested type for the response. The empty string means use the default
 * XHR behavior.
 * @type {goog.net.XhrIo.ResponseType}
 * @private
 */
goog.testing.net.XhrIo.prototype.responseType_ =
    goog.net.XhrIo.ResponseType.DEFAULT;


/**
 * Whether a "credentialed" request is to be sent (one that is aware of cookies
 * and authentication) . This is applicable only for cross-domain requests and
 * more recent browsers that support this part of the HTTP Access Control
 * standard.
 *
 * @see http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#withcredentials
 *
 * @type {boolean}
 * @private
 */
goog.testing.net.XhrIo.prototype.withCredentials_ = false;


/**
 * Whether there's currently an underlying XHR object.
 * @type {boolean}
 * @private
 */
goog.testing.net.XhrIo.prototype.xhr_ = false;


/**
 * Returns the number of milliseconds after which an incomplete request will be
 * aborted, or 0 if no timeout is set.
 * @return {number} Timeout interval in milliseconds.
 */
goog.testing.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no
 * timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.testing.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Causes timeout events to be fired.
 */
goog.testing.net.XhrIo.prototype.simulateTimeout = function() {
  this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
  this.dispatchEvent(goog.net.EventType.TIMEOUT);
  this.abort(goog.net.ErrorCode.TIMEOUT);
};


/**
 * Sets the desired type for the response. At time of writing, this is only
 * supported in very recent versions of WebKit (10.0.612.1 dev and later).
 *
 * If this is used, the response may only be accessed via {@link #getResponse}.
 *
 * @param {goog.net.XhrIo.ResponseType} type The desired type for the response.
 */
goog.testing.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type;
};


/**
 * Gets the desired type for the response.
 * @return {goog.net.XhrIo.ResponseType} The desired type for the response.
 */
goog.testing.net.XhrIo.prototype.getResponseType = function() {
  return this.responseType_;
};


/**
 * Sets whether a "credentialed" request that is aware of cookie and
 * authentication information should be made. This option is only supported by
 * browsers that support HTTP Access Control. As of this writing, this option
 * is not supported in IE.
 *
 * @param {boolean} withCredentials Whether this should be a "credentialed"
 *     request.
 */
goog.testing.net.XhrIo.prototype.setWithCredentials =
    function(withCredentials) {
  this.withCredentials_ = withCredentials;
};


/**
 * Gets whether a "credentialed" request is to be sent.
 * @return {boolean} The desired type for the response.
 */
goog.testing.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_;
};


/**
 * Abort the current XMLHttpRequest
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.testing.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.active_) {
    try {
      this.active_ = false;
      this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
      this.dispatchEvent(goog.net.EventType.COMPLETE);
      this.dispatchEvent(goog.net.EventType.ABORT);
    } finally {
      this.simulateReady();
    }
  }
};


/**
 * Simulates the XhrIo send.
 * @param {string} url Uri to make request too.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string=} opt_content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 */
goog.testing.net.XhrIo.prototype.send = function(url, opt_method, opt_content,
                                                 opt_headers) {
  if (this.xhr_) {
    throw Error('[goog.net.XhrIo] Object is active with another request');
  }

  this.lastUri_ = url;

  if (this.testQueue_) {
    this.testQueue_.enqueue(['s', url, opt_method, opt_content, opt_headers]);
  }
  this.xhr_ = true;
  this.active_ = true;
  this.readyState_ = goog.net.XmlHttp.ReadyState.UNINITIALIZED;
  this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.LOADING);
};


/**
 * Creates a new XHR object.
 * @return {XMLHttpRequest|GearsHttpRequest} The newly created XHR object.
 * @protected
 */
goog.testing.net.XhrIo.prototype.createXhr = function() {
  return new goog.net.XmlHttp();
};


/**
 * Simulates changing to the new ready state.
 * @param {number} readyState Ready state to change to.
 */
goog.testing.net.XhrIo.prototype.simulateReadyStateChange =
    function(readyState) {
  if (readyState < this.readyState_) {
    throw Error('Readystate cannot go backwards');
  }

  while (this.readyState_ < readyState) {
    this.readyState_++;
    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);

    if (this.readyState_ == goog.net.XmlHttp.ReadyState.COMPLETE) {
      this.active_ = false;
      this.dispatchEvent(goog.net.EventType.COMPLETE);
    }
  }
};


/**
 * Simulates receiving a response.
 * @param {number} statusCode Simulated status code.
 * @param {string|Document|null} response Simulated response.
 * @param {Object=} opt_headers Simulated response headers.
 */
goog.testing.net.XhrIo.prototype.simulateResponse = function(statusCode,
    response, opt_headers) {
  this.statusCode_ = statusCode;
  this.response_ = response || '';
  this.responseHeaders_ = opt_headers || {};

  try {
    if (this.isSuccess()) {
      this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.COMPLETE);
      this.dispatchEvent(goog.net.EventType.SUCCESS);
    } else {
      this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
      this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']';
      this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.COMPLETE);
      this.dispatchEvent(goog.net.EventType.ERROR);
    }
  } finally {
    this.simulateReady();
  }
};


/**
 * Simulates the Xhr is ready for the next request.
 */
goog.testing.net.XhrIo.prototype.simulateReady = function() {
  this.active_ = false;
  this.xhr_ = false;
  this.dispatchEvent(goog.net.EventType.READY);
};


/**
 * @return {boolean} Whether there is an active request.
 */
goog.testing.net.XhrIo.prototype.isActive = function() {
  return !!this.xhr_;
};


/**
 * Has the request completed.
 * @return {boolean} Whether the request has completed.
 */
goog.testing.net.XhrIo.prototype.isComplete = function() {
  return this.readyState_ == goog.net.XmlHttp.ReadyState.COMPLETE;
};


/**
 * Has the request compeleted with a success.
 * @return {boolean} Whether the request compeleted successfully.
 */
goog.testing.net.XhrIo.prototype.isSuccess = function() {
  switch (this.getStatus()) {
    case goog.net.HttpStatus.OK:
    case goog.net.HttpStatus.NO_CONTENT:
    case goog.net.HttpStatus.NOT_MODIFIED:
      return true;

    default:
      return false;
  }
};


/**
 * Returns the readystate.
 * @return {number} goog.net.XmlHttp.ReadyState.*.
 */
goog.testing.net.XhrIo.prototype.getReadyState = function() {
  return this.readyState_;
};


/**
 * Get the status from the Xhr object.  Will only return correct result when
 * called from the context of a callback.
 * @return {number} Http status.
 */
goog.testing.net.XhrIo.prototype.getStatus = function() {
  return this.statusCode_;
};


/**
 * Get the status text from the Xhr object.  Will only return correct result
 * when called from the context of a callback.
 * @return {string} Status text.
 */
goog.testing.net.XhrIo.prototype.getStatusText = function() {
  return '';
};


/**
 * Gets the last error message.
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.testing.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Gets the last error message.
 * @return {string} Last error message.
 */
goog.testing.net.XhrIo.prototype.getLastError = function() {
  return this.lastError_;
};


/**
 * Gets the last URI that was requested.
 * @return {string} Last URI.
 */
goog.testing.net.XhrIo.prototype.getLastUri = function() {
  return this.lastUri_;
};


/**
 * Gets the response text from the Xhr object.  Will only return correct result
 * when called from the context of a callback.
 * @return {string} Result from the server.
 */
goog.testing.net.XhrIo.prototype.getResponseText = function() {
  return goog.isString(this.response_) ? this.response_ :
         goog.dom.xml.serialize(this.response_);
};


/**
 * Gets the response and evaluates it as JSON from the Xhr object.  Will only
 * return correct result when called from the context of a callback.
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @return {Object} JavaScript object.
 */
goog.testing.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  var responseText = this.getResponseText();
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }

  return goog.json.parse(responseText);
};


/**
 * Gets the response XML from the Xhr object.  Will only return correct result
 * when called from the context of a callback.
 * @return {Document} Result from the server if it was XML.
 */
goog.testing.net.XhrIo.prototype.getResponseXml = function() {
  // NOTE(user): I haven't found out how to check in Internet Explorer
  // whether the response is XML document, so I do it the other way around.
  return goog.isString(this.response_) ? null : this.response_;
};


/**
 * Get the response as the type specificed by {@link #setResponseType}. At time
 * of writing, this is only supported in very recent versions of WebKit
 * (10.0.612.1 dev and later).
 *
 * @return {*} The response.
 */
goog.testing.net.XhrIo.prototype.getResponse = function() {
  return this.response_;
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.testing.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.isComplete() ? this.responseHeaders_[key] : undefined;
};


/**
 * Gets the text of all the headers in the response.
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @return {string} The string containing all the response headers.
 */
goog.testing.net.XhrIo.prototype.getAllResponseHeaders = function() {
  if (!this.isComplete()) {
    return '';
  }

  var headers = [];
  goog.object.forEach(this.responseHeaders_, function(value, name) {
    headers.push(name + ': ' + value);
  });

  return headers.join('\n');
};
