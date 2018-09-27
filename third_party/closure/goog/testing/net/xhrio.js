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

goog.setTestOnly('goog.testing.net.XhrIo');
goog.provide('goog.testing.net.XhrIo');

goog.require('goog.array');
goog.require('goog.dom.xml');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XmlHttp');
goog.require('goog.object');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.testing.TestQueue');
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
   * @type {!goog.structs.Map}
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
 * To emulate the behavior of the actual XhrIo, we do not allow access to the
 * XhrIo's properties outside the event callbacks. For backwards compatibility,
 * we allow tests to allow access by setting this value to true.
 * @type {boolean}
 */
goog.testing.net.XhrIo.allowUnsafeAccessToXhrIoOutsideCallbacks = false;


/**
 * Alias this enum here to make mocking of goog.net.XhrIo easier.
 * @enum {string}
 */
goog.testing.net.XhrIo.ResponseType = goog.net.XhrIo.ResponseType;


/**
 * The pattern matching the 'http' and 'https' URI schemes.
 * @private {!RegExp}
 */
goog.testing.net.XhrIo.HTTP_SCHEME_PATTERN_ = /^https?$/i;


/**
 * All non-disposed instances of goog.testing.net.XhrIo created
 * by {@link goog.testing.net.XhrIo.send} are in this Array.
 * @see goog.testing.net.XhrIo.cleanup
 * @type {!Array<!goog.testing.net.XhrIo>}
 * @private
 */
goog.testing.net.XhrIo.sendInstances_ = [];


/**
 * Returns an Array containing all non-disposed instances of
 * goog.testing.net.XhrIo created by {@link goog.testing.net.XhrIo.send}.
 * @return {!Array<!goog.testing.net.XhrIo>} Array of goog.testing.net.XhrIo
 *     instances.
 */
goog.testing.net.XhrIo.getSendInstances = function() {
  return goog.testing.net.XhrIo.sendInstances_;
};


/**
 * Disposes all non-disposed instances of goog.testing.net.XhrIo created by
 * {@link goog.testing.net.XhrIo.send}.
 * @see goog.net.XhrIo.cleanup
 */
goog.testing.net.XhrIo.cleanup = function() {
  var instances = goog.testing.net.XhrIo.sendInstances_;
  while (instances.length) {
    instances.pop().dispose();
  }
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
 * @param {boolean=} opt_withCredentials Whether to send credentials with the
 *     request. Default to false. See {@link goog.net.XhrIo#setWithCredentials}.
 * @return {!goog.testing.net.XhrIo} The mocked sent XhrIo.
 */
goog.testing.net.XhrIo.send = function(
    url, opt_callback, opt_method, opt_content, opt_headers,
    opt_timeoutInterval, opt_withCredentials) {
  var x = new goog.testing.net.XhrIo();
  goog.testing.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(
      x, goog.net.EventType.READY,
      goog.partial(goog.testing.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.setWithCredentials(Boolean(opt_withCredentials));
  x.send(url, opt_method, opt_content, opt_headers);

  return x;
};


/**
 * Disposes of the specified goog.testing.net.XhrIo created by
 * {@link goog.testing.net.XhrIo.send} and removes it from
 * {@link goog.testing.net.XhrIo.pendingStaticSendInstances_}.
 * @param {!goog.testing.net.XhrIo} XhrIo An XhrIo created by
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
 * Last HTTP method that was requested.
 * @type {string|undefined}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastMethod_;


/**
 * Last POST content that was requested.
 * @type {string|undefined}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastContent_;


/**
 * Additional headers that were requested in the last query.
 * @type {Object|goog.structs.Map|undefined}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastHeaders_;


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {string}
 * @private
 */
goog.testing.net.XhrIo.prototype.lastError_ = '';


/**
 * The response object.
 * @type {string|Document|ArrayBuffer}
 * @private
 */
goog.testing.net.XhrIo.prototype.response_ = '';


/**
 * The status code.
 * @type {number}
 * @private
 */
goog.testing.net.XhrIo.prototype.statusCode_ = 0;


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
 * Whether progress events shall be sent for this request.
 *
 * @type {boolean}
 * @private
 */
goog.testing.net.XhrIo.prototype.progressEventsEnabled_ = false;


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
goog.testing.net.XhrIo.prototype.setWithCredentials = function(
    withCredentials) {
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
 * Sets whether progress events are enabled for this request. Note
 * that progress events require pre-flight OPTIONS request handling
 * for CORS requests, and may cause trouble with older browsers. See
 * goog.net.XhrIo.progressEventsEnabled_ for details.
 * @param {boolean} enabled Whether progress events should be enabled.
 */
goog.testing.net.XhrIo.prototype.setProgressEventsEnabled = function(enabled) {
  this.progressEventsEnabled_ = enabled;
};


/**
 * Gets whether progress events are enabled.
 * @return {boolean} Whether progress events are enabled for this request.
 */
goog.testing.net.XhrIo.prototype.getProgressEventsEnabled = function() {
  return this.progressEventsEnabled_;
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
      this.readyState_ = goog.net.XmlHttp.ReadyState.UNINITIALIZED;
      this.statusCode_ = -1;
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
goog.testing.net.XhrIo.prototype.send = function(
    url, opt_method, opt_content, opt_headers) {
  if (this.xhr_) {
    throw Error('[goog.net.XhrIo] Object is active with another request');
  }

  this.lastUri_ = url;
  this.lastMethod_ = opt_method || 'GET';
  this.lastContent_ = opt_content;
  if (!this.headers.isEmpty()) {
    this.lastHeaders_ = this.headers.toObject();
    // Add headers specific to this request
    if (opt_headers) {
      goog.structs.forEach(opt_headers, goog.bind(function(value, key) {
        this.lastHeaders_[key] = value;
      }, this));
    }
  } else {
    this.lastHeaders_ = opt_headers;
  }

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
 * @return {goog.net.XhrLike.OrNative} The newly created XHR
 *     object.
 * @protected
 */
goog.testing.net.XhrIo.prototype.createXhr = function() {
  return goog.net.XmlHttp();
};


/**
 * Simulates changing to the new ready state.
 * @param {number} readyState Ready state to change to.
 */
goog.testing.net.XhrIo.prototype.simulateReadyStateChange = function(
    readyState) {
  if (readyState < this.readyState_) {
    throw Error('Readystate cannot go backwards');
  }

  // INTERACTIVE can be dispatched repeatedly as more data is reported.
  if (readyState == goog.net.XmlHttp.ReadyState.INTERACTIVE &&
      readyState == this.readyState_) {
    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);
    return;
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
 * Simulate receiving some bytes but the request not fully completing, and
 * the XHR entering the 'INTERACTIVE' state.
 * @param {string} partialResponse A string to append to the response text.
 * @param {Object=} opt_headers Simulated response headers.
 */
goog.testing.net.XhrIo.prototype.simulatePartialResponse = function(
    partialResponse, opt_headers) {
  this.response_ += partialResponse;
  this.responseHeaders_ = opt_headers || {};
  this.statusCode_ = 200;
  this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.INTERACTIVE);
};


/**
 * Simulates receiving a response.
 * @param {number} statusCode Simulated status code.
 * @param {string|Document|ArrayBuffer|null} response Simulated response.
 * @param {Object=} opt_headers Simulated response headers.
 */
goog.testing.net.XhrIo.prototype.simulateResponse = function(
    statusCode, response, opt_headers) {
  // This library allows a response to be simulated without send ever being
  // called. If there are no send instances, then just pretend that xhr_ and
  // active_ have been set to true.
  if (!goog.testing.net.XhrIo.allowUnsafeAccessToXhrIoOutsideCallbacks &&
      !goog.testing.net.XhrIo.sendInstances_.length) {
    this.xhr_ = true;
    this.active_ = true;
  }
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
 * Simulates the Xhr progress event.
 * @param {boolean} lengthComputable Whether progress is measurable.
 * @param {number} loaded Amount of work already performed.
 * @param {number} total Total amount of work to perform.
 * @param {boolean=} opt_isDownload Whether the progress is from a download or
 *     upload.
 */
goog.testing.net.XhrIo.prototype.simulateProgress = function(
    lengthComputable, loaded, total, opt_isDownload) {
  var progressEvent = {
    type: goog.net.EventType.PROGRESS,
    lengthComputable: lengthComputable,
    loaded: loaded,
    total: total
  };
  this.dispatchEvent(progressEvent);
  var specificProgress = goog.object.clone(progressEvent);
  specificProgress.type = opt_isDownload ?
      goog.net.EventType.DOWNLOAD_PROGRESS :
      goog.net.EventType.UPLOAD_PROGRESS;
  this.dispatchEvent(specificProgress);
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
  var status = this.getStatus();
  // A zero status code is considered successful for local files.
  return goog.net.HttpStatus.isSuccess(status) ||
      status === 0 && !this.isLastUriEffectiveSchemeHttp_();
};


/**
 * @return {boolean} whether the effective scheme of the last URI that was
 *     fetched was 'http' or 'https'.
 * @private
 */
goog.testing.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var scheme = goog.uri.utils.getEffectiveScheme(String(this.lastUri_));
  return goog.testing.net.XhrIo.HTTP_SCHEME_PATTERN_.test(scheme);
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
 * Gets the last HTTP method that was requested.
 * @return {string|undefined} Last HTTP method used by send.
 */
goog.testing.net.XhrIo.prototype.getLastMethod = function() {
  return this.lastMethod_;
};


/**
 * Gets the last POST content that was requested.
 * @return {string|undefined} Last POST content or undefined if last request was
 *      a GET.
 */
goog.testing.net.XhrIo.prototype.getLastContent = function() {
  return this.lastContent_;
};


/**
 * Gets the headers of the last request.
 * @return {Object|goog.structs.Map|undefined} Last headers manually set in send
 *      call or undefined if no additional headers were specified.
 */
goog.testing.net.XhrIo.prototype.getLastRequestHeaders = function() {
  return this.lastHeaders_;
};


/**
 * Returns true if there is a valid xhr, or if
 * allowUnsafeAccessToXhrIoOutsideCallbacks is false.
 * @return {boolean}
 * @private
 */
goog.testing.net.XhrIo.prototype.checkXhr_ = function() {
  return (
      goog.testing.net.XhrIo.allowUnsafeAccessToXhrIoOutsideCallbacks ||
      !!this.xhr_);
};


/**
 * Gets the response text from the Xhr object.  Will only return correct result
 * when called from the context of a callback.
 * @return {string} Result from the server.
 */
goog.testing.net.XhrIo.prototype.getResponseText = function() {
  if (!this.checkXhr_()) {
    return '';
  } else if (goog.isString(this.response_)) {
    return this.response_;
  } else if (
      goog.global['ArrayBuffer'] && this.response_ instanceof ArrayBuffer) {
    return '';
  } else {
    return goog.dom.xml.serialize(/** @type {Document} */ (this.response_));
  }
};


/**
 * Gets the response body from the Xhr object. Will only return correct result
 * when called from the context of a callback.
 * @return {Object} Binary result from the server or null.
 */
goog.testing.net.XhrIo.prototype.getResponseBody = function() {
  return null;
};


/**
 * Gets the response and evaluates it as JSON from the Xhr object.  Will only
 * return correct result when called from the context of a callback.
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @return {Object|undefined} JavaScript object.
 * @throws Error if s is invalid JSON.
 */
goog.testing.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.checkXhr_()) {
    return undefined;
  }

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
  if (!this.checkXhr_()) {
    return null;
  }
  // NOTE(user): I haven't found out how to check in Internet Explorer
  // whether the response is XML document, so I do it the other way around.
  return goog.isString(this.response_) ||
          (goog.global['ArrayBuffer'] &&
           this.response_ instanceof ArrayBuffer) ?
      null :
      /** @type {Document} */ (this.response_);
};


/**
 * Get the response as the type specificed by {@link #setResponseType}. At time
 * of writing, this is only supported in very recent versions of WebKit
 * (10.0.612.1 dev and later).
 *
 * @return {*} The response.
 */
goog.testing.net.XhrIo.prototype.getResponse = function() {
  return this.checkXhr_() ? this.response_ : null;
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.testing.net.XhrIo.prototype.getResponseHeader = function(key) {
  if (!this.checkXhr_() || !this.isComplete()) {
    return undefined;
  }
  return this.responseHeaders_[key];
};


/**
 * Gets the text of all the headers in the response.
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @return {string} The string containing all the response headers.
 */
goog.testing.net.XhrIo.prototype.getAllResponseHeaders = function() {
  if (!this.checkXhr_() || !this.isComplete()) {
    return '';
  }
  return this.getAllStreamingResponseHeaders();
};


/**
 * Returns all response headers as a key-value map.
 * Multiple values for the same header key can be combined into one,
 * separated by a comma and a space.
 * Note that the native getResponseHeader method for retrieving a single header
 * does a case insensitive match on the header name. This method does not
 * include any case normalization logic, it will just return a key-value
 * representation of the headers.
 * See: http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method
 * @return {!Object<string, string>} An object with the header keys as keys
 *     and header values as values.
 */
goog.testing.net.XhrIo.prototype.getResponseHeaders = function() {
  if (!this.checkXhr_() || !this.isComplete()) {
    return {};
  }
  var headersObject = {};
  goog.object.forEach(this.responseHeaders_, function(value, key) {
    if (headersObject[key]) {
      headersObject[key] += ', ' + value;
    } else {
      headersObject[key] = value;
    }
  });
  return headersObject;
};


/**
 * Get the value of the response-header with the given name from the Xhr object.
 * As opposed to {@link #getResponseHeader}, this method does not require that
 * the request has completed.
 * @param {string} key The name of the response-header to retrieve.
 * @return {?string} The value of the response-header, or null if it is
 *     unavailable.
 */
goog.testing.net.XhrIo.prototype.getStreamingResponseHeader = function(key) {
  if (!this.checkXhr_()) {
    return null;
  }
  return key in this.responseHeaders_ ? this.responseHeaders_[key] : null;
};


/**
 * Gets the text of all the headers in the response. As opposed to
 * {@link #getAllResponseHeaders}, this method does not require that the request
 * has completed.
 * @return {string} The value of the response headers or empty string.
 */
goog.testing.net.XhrIo.prototype.getAllStreamingResponseHeaders = function() {
  if (!this.checkXhr_()) {
    return '';
  }
  var headers = [];
  goog.object.forEach(this.responseHeaders_, function(value, name) {
    headers.push(name + ': ' + value);
  });
  return headers.join('\r\n');
};
