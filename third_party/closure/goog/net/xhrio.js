// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Wrapper class for handling XmlHttpRequests.
 *
 * One off requests can be sent through goog.net.XhrIo.send() or an
 * instance can be created to send multiple requests.  Each request uses its
 * own XmlHttpRequest object and handles clearing of the event callback to
 * ensure no leaks.
 *
 * XhrIo is event based, it dispatches events on success, failure, finishing,
 * ready-state change, or progress (download and upload).
 *
 * The ready-state or timeout event fires first, followed by
 * a generic completed event. Then the abort, error, or success event
 * is fired as appropriate. Progress events are fired as they are
 * received. Lastly, the ready event will fire to indicate that the
 * object may be used to make another request.
 *
 * The error event may also be called before completed and
 * ready-state-change if the XmlHttpRequest.open() or .send() methods throw.
 *
 * This class does not support multiple requests, queuing, or prioritization.
 *
 * When progress events are supported by the browser, and progress is
 * enabled via .setProgressEventsEnabled(true), the
 * goog.net.EventType.PROGRESS event will be the re-dispatched browser
 * progress event. Additionally, a DOWNLOAD_PROGRESS or UPLOAD_PROGRESS event
 * will be fired for download and upload progress respectively.
 *
 */


goog.provide('goog.net.XhrIo');
goog.provide('goog.net.XhrIo.ResponseType');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.log');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XmlHttp');
goog.require('goog.string');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');
goog.require('goog.userAgent');

goog.forwardDeclare('goog.Uri');



/**
 * Basic class for handling XMLHttpRequests.
 * @param {goog.net.XmlHttpFactory=} opt_xmlHttpFactory Factory to use when
 *     creating XMLHttpRequest objects.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.XhrIo = function(opt_xmlHttpFactory) {
  goog.net.XhrIo.base(this, 'constructor');

  /**
   * Map of default headers to add to every request, use:
   * XhrIo.headers.set(name, value)
   * @type {!goog.structs.Map}
   */
  this.headers = new goog.structs.Map();

  /**
   * Optional XmlHttpFactory
   * @private {goog.net.XmlHttpFactory}
   */
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null;

  /**
   * Whether XMLHttpRequest is active.  A request is active from the time send()
   * is called until onReadyStateChange() is complete, or error() or abort()
   * is called.
   * @private {boolean}
   */
  this.active_ = false;

  /**
   * The XMLHttpRequest object that is being used for the transfer.
   * @private {?goog.net.XhrLike.OrNative}
   */
  this.xhr_ = null;

  /**
   * The options to use with the current XMLHttpRequest object.
   * @private {Object}
   */
  this.xhrOptions_ = null;

  /**
   * Last URL that was requested.
   * @private {string|goog.Uri}
   */
  this.lastUri_ = '';

  /**
   * Method for the last request.
   * @private {string}
   */
  this.lastMethod_ = '';

  /**
   * Last error code.
   * @private {!goog.net.ErrorCode}
   */
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;

  /**
   * Last error message.
   * @private {Error|string}
   */
  this.lastError_ = '';

  /**
   * Used to ensure that we don't dispatch an multiple ERROR events. This can
   * happen in IE when it does a synchronous load and one error is handled in
   * the ready statte change and one is handled due to send() throwing an
   * exception.
   * @private {boolean}
   */
  this.errorDispatched_ = false;

  /**
   * Used to make sure we don't fire the complete event from inside a send call.
   * @private {boolean}
   */
  this.inSend_ = false;

  /**
   * Used in determining if a call to {@link #onReadyStateChange_} is from
   * within a call to this.xhr_.open.
   * @private {boolean}
   */
  this.inOpen_ = false;

  /**
   * Used in determining if a call to {@link #onReadyStateChange_} is from
   * within a call to this.xhr_.abort.
   * @private {boolean}
   */
  this.inAbort_ = false;

  /**
   * Number of milliseconds after which an incomplete request will be aborted
   * and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no timeout
   * is set.
   * @private {number}
   */
  this.timeoutInterval_ = 0;

  /**
   * Timer to track request timeout.
   * @private {?number}
   */
  this.timeoutId_ = null;

  /**
   * The requested type for the response. The empty string means use the default
   * XHR behavior.
   * @private {goog.net.XhrIo.ResponseType}
   */
  this.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT;

  /**
   * Whether a "credentialed" request is to be sent (one that is aware of
   * cookies and authentication). This is applicable only for cross-domain
   * requests and more recent browsers that support this part of the HTTP Access
   * Control standard.
   *
   * @see http://www.w3.org/TR/XMLHttpRequest/#the-withcredentials-attribute
   *
   * @private {boolean}
   */
  this.withCredentials_ = false;

  /**
   * Whether progress events are enabled for this request. This is
   * disabled by default because setting a progress event handler
   * causes pre-flight OPTIONS requests to be sent for CORS requests,
   * even in cases where a pre-flight request would not otherwise be
   * sent.
   *
   * @see http://xhr.spec.whatwg.org/#security-considerations
   *
   * Note that this can cause problems for Firefox 22 and below, as an
   * older "LSProgressEvent" will be dispatched by the browser. That
   * progress event is no longer supported, and can lead to failures,
   * including throwing exceptions.
   *
   * @see http://bugzilla.mozilla.org/show_bug.cgi?id=845631
   * @see b/23469793
   *
   * @private {boolean}
   */
  this.progressEventsEnabled_ = false;

  /**
   * True if we can use XMLHttpRequest's timeout directly.
   * @private {boolean}
   */
  this.useXhr2Timeout_ = false;
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);


/**
 * Response types that may be requested for XMLHttpRequests.
 * @enum {string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute
 */
goog.net.XhrIo.ResponseType = {
  DEFAULT: '',
  TEXT: 'text',
  DOCUMENT: 'document',
  // Not supported as of Chrome 10.0.612.1 dev
  BLOB: 'blob',
  ARRAY_BUFFER: 'arraybuffer'
};


/**
 * A reference to the XhrIo logger
 * @private {?goog.log.Logger}
 * @const
 */
goog.net.XhrIo.prototype.logger_ = goog.log.getLogger('goog.net.XhrIo');


/**
 * The Content-Type HTTP header name
 * @type {string}
 */
goog.net.XhrIo.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The Content-Transfer-Encoding HTTP header name
 * @type {string}
 */
goog.net.XhrIo.CONTENT_TRANSFER_ENCODING = 'Content-Transfer-Encoding';


/**
 * The pattern matching the 'http' and 'https' URI schemes
 * @type {!RegExp}
 */
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?$/i;


/**
 * The methods that typically come along with form data.  We set different
 * headers depending on whether the HTTP action is one of these.
 */
goog.net.XhrIo.METHODS_WITH_FORM_DATA = ['POST', 'PUT'];


/**
 * The Content-Type HTTP header value for a url-encoded form
 * @type {string}
 */
goog.net.XhrIo.FORM_CONTENT_TYPE =
    'application/x-www-form-urlencoded;charset=utf-8';


/**
 * The XMLHttpRequest Level two timeout delay ms property name.
 *
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-timeout-attribute
 *
 * @private {string}
 * @const
 */
goog.net.XhrIo.XHR2_TIMEOUT_ = 'timeout';


/**
 * The XMLHttpRequest Level two ontimeout handler property name.
 *
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-timeout-attribute
 *
 * @private {string}
 * @const
 */
goog.net.XhrIo.XHR2_ON_TIMEOUT_ = 'ontimeout';


/**
 * All non-disposed instances of goog.net.XhrIo created
 * by {@link goog.net.XhrIo.send} are in this Array.
 * @see goog.net.XhrIo.cleanup
 * @private {!Array<!goog.net.XhrIo>}
 */
goog.net.XhrIo.sendInstances_ = [];


/**
 * Static send that creates a short lived instance of XhrIo to send the
 * request.
 * @see goog.net.XhrIo.cleanup
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {?function(this:goog.net.XhrIo, ?)=} opt_callback Callback function
 *     for when request is complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=}
 *     opt_content Body data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 * @param {boolean=} opt_withCredentials Whether to send credentials with the
 *     request. Default to false. See {@link goog.net.XhrIo#setWithCredentials}.
 * @return {!goog.net.XhrIo} The sent XhrIo.
 */
goog.net.XhrIo.send = function(
    url, opt_callback, opt_method, opt_content, opt_headers,
    opt_timeoutInterval, opt_withCredentials) {
  var x = new goog.net.XhrIo();
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    x.listen(goog.net.EventType.COMPLETE, opt_callback);
  }
  x.listenOnce(goog.net.EventType.READY, x.cleanupSend_);
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  if (opt_withCredentials) {
    x.setWithCredentials(opt_withCredentials);
  }
  x.send(url, opt_method, opt_content, opt_headers);
  return x;
};


/**
 * Disposes all non-disposed instances of goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send}.
 * {@link goog.net.XhrIo.send} cleans up the goog.net.XhrIo instance
 * it creates when the request completes or fails.  However, if
 * the request never completes, then the goog.net.XhrIo is not disposed.
 * This can occur if the window is unloaded before the request completes.
 * We could have {@link goog.net.XhrIo.send} return the goog.net.XhrIo
 * it creates and make the client of {@link goog.net.XhrIo.send} be
 * responsible for disposing it in this case.  However, this makes things
 * significantly more complicated for the client, and the whole point
 * of {@link goog.net.XhrIo.send} is that it's simple and easy to use.
 * Clients of {@link goog.net.XhrIo.send} should call
 * {@link goog.net.XhrIo.cleanup} when doing final
 * cleanup on window unload.
 */
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while (instances.length) {
    instances.pop().dispose();
  }
};


/**
 * Installs exception protection for all entry point introduced by
 * goog.net.XhrIo instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point(s).
 */
goog.net.XhrIo.protectEntryPoints = function(errorHandler) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
      errorHandler.protectEntryPoint(
          goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
};


/**
 * Disposes of the specified goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send} and removes it from
 * {@link goog.net.XhrIo.pendingStaticSendInstances_}.
 * @private
 */
goog.net.XhrIo.prototype.cleanupSend_ = function() {
  this.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, this);
};


/**
 * Returns the number of milliseconds after which an incomplete request will be
 * aborted, or 0 if no timeout is set.
 * @return {number} Timeout interval in milliseconds.
 */
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no
 * timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Sets the desired type for the response. At time of writing, this is only
 * supported in very recent versions of WebKit (10.0.612.1 dev and later).
 *
 * If this is used, the response may only be accessed via {@link #getResponse}.
 *
 * @param {goog.net.XhrIo.ResponseType} type The desired type for the response.
 */
goog.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type;
};


/**
 * Gets the desired type for the response.
 * @return {goog.net.XhrIo.ResponseType} The desired type for the response.
 */
goog.net.XhrIo.prototype.getResponseType = function() {
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
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) {
  this.withCredentials_ = withCredentials;
};


/**
 * Gets whether a "credentialed" request is to be sent.
 * @return {boolean} The desired type for the response.
 */
goog.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_;
};


/**
 * Sets whether progress events are enabled for this request. Note
 * that progress events require pre-flight OPTIONS request handling
 * for CORS requests, and may cause trouble with older browsers. See
 * progressEventsEnabled_ for details.
 * @param {boolean} enabled Whether progress events should be enabled.
 */
goog.net.XhrIo.prototype.setProgressEventsEnabled = function(enabled) {
  this.progressEventsEnabled_ = enabled;
};


/**
 * Gets whether progress events are enabled.
 * @return {boolean} Whether progress events are enabled for this request.
 */
goog.net.XhrIo.prototype.getProgressEventsEnabled = function() {
  return this.progressEventsEnabled_;
};


/**
 * Instance send that actually uses XMLHttpRequest to make a server call.
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {string=} opt_method Send method, default: GET.
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=}
 *     opt_content Body data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @suppress {deprecated} Use deprecated goog.structs.forEach to allow different
 * types of parameters for opt_headers.
 */
goog.net.XhrIo.prototype.send = function(
    url, opt_method, opt_content, opt_headers) {
  if (this.xhr_) {
    throw Error(
        '[goog.net.XhrIo] Object is active with another request=' +
        this.lastUri_ + '; newUri=' + url);
  }

  var method = opt_method ? opt_method.toUpperCase() : 'GET';

  this.lastUri_ = url;
  this.lastError_ = '';
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;

  // Use the factory to create the XHR object and options
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = this.xmlHttpFactory_ ? this.xmlHttpFactory_.getOptions() :
                                            goog.net.XmlHttp.getOptions();

  // Set up the onreadystatechange callback
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);

  // Set up upload/download progress events, if progress events are supported.
  if (this.getProgressEventsEnabled() && 'onprogress' in this.xhr_) {
    this.xhr_.onprogress =
        goog.bind(function(e) { this.onProgressHandler_(e, true); }, this);
    if (this.xhr_.upload) {
      this.xhr_.upload.onprogress = goog.bind(this.onProgressHandler_, this);
    }
  }

  /**
   * Try to open the XMLHttpRequest (always async), if an error occurs here it
   * is generally permission denied
   */
  try {
    goog.log.fine(this.logger_, this.formatMsg_('Opening Xhr'));
    this.inOpen_ = true;
    this.xhr_.open(method, String(url), true);  // Always async!
    this.inOpen_ = false;
  } catch (err) {
    goog.log.fine(
        this.logger_, this.formatMsg_('Error opening Xhr: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return;
  }

  // We can't use null since this won't allow requests with form data to have a
  // content length specified which will cause some proxies to return a 411
  // error.
  var content = opt_content || '';

  var headers = this.headers.clone();

  // Add headers specific to this request
  if (opt_headers) {
    goog.structs.forEach(
        opt_headers, function(value, key) { headers.set(key, value); });
  }

  // Find whether a content type header is set, ignoring case.
  // HTTP header names are case-insensitive.  See:
  // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
  var contentTypeKey =
      goog.array.find(headers.getKeys(), goog.net.XhrIo.isContentTypeHeader_);

  var contentIsFormData =
      (goog.global['FormData'] && (content instanceof goog.global['FormData']));
  if (goog.array.contains(goog.net.XhrIo.METHODS_WITH_FORM_DATA, method) &&
      !contentTypeKey && !contentIsFormData) {
    // For requests typically with form data, default to the url-encoded form
    // content type unless this is a FormData request.  For FormData,
    // the browser will automatically add a multipart/form-data content type
    // with an appropriate multipart boundary.
    headers.set(
        goog.net.XhrIo.CONTENT_TYPE_HEADER, goog.net.XhrIo.FORM_CONTENT_TYPE);
  }

  // Add the headers to the Xhr object
  headers.forEach(function(value, key) {
    this.xhr_.setRequestHeader(key, value);
  }, this);

  if (this.responseType_) {
    this.xhr_.responseType = this.responseType_;
  }
  // Set xhr_.withCredentials only when the value is different, or else in
  // synchronous XMLHtppRequest.open Firefox will throw an exception.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=736340
  if ('withCredentials' in this.xhr_ &&
      this.xhr_.withCredentials !== this.withCredentials_) {
    this.xhr_.withCredentials = this.withCredentials_;
  }

  /**
   * Try to send the request, or other wise report an error (404 not found).
   */
  try {
    this.cleanUpTimeoutTimer_();  // Paranoid, should never be running.
    if (this.timeoutInterval_ > 0) {
      this.useXhr2Timeout_ = goog.net.XhrIo.shouldUseXhr2Timeout_(this.xhr_);
      goog.log.fine(
          this.logger_, this.formatMsg_(
                            'Will abort after ' + this.timeoutInterval_ +
                            'ms if incomplete, xhr2 ' + this.useXhr2Timeout_));
      if (this.useXhr2Timeout_) {
        this.xhr_[goog.net.XhrIo.XHR2_TIMEOUT_] = this.timeoutInterval_;
        this.xhr_[goog.net.XhrIo.XHR2_ON_TIMEOUT_] =
            goog.bind(this.timeout_, this);
      } else {
        this.timeoutId_ =
            goog.Timer.callOnce(this.timeout_, this.timeoutInterval_, this);
      }
    }
    goog.log.fine(this.logger_, this.formatMsg_('Sending request'));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false;

  } catch (err) {
    goog.log.fine(this.logger_, this.formatMsg_('Send error: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
  }
};


/**
 * Determines if the argument is an XMLHttpRequest that supports the level 2
 * timeout value and event.
 *
 * Currently, FF 21.0 OS X has the fields but won't actually call the timeout
 * handler.  Perhaps the confusion in the bug referenced below hasn't
 * entirely been resolved.
 *
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-timeout-attribute
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=525816
 *
 * @param {!goog.net.XhrLike.OrNative} xhr The request.
 * @return {boolean} True if the request supports level 2 timeout.
 * @private
 */
goog.net.XhrIo.shouldUseXhr2Timeout_ = function(xhr) {
  return goog.userAgent.IE && goog.userAgent.isVersionOrHigher(9) &&
      goog.isNumber(xhr[goog.net.XhrIo.XHR2_TIMEOUT_]) &&
      goog.isDef(xhr[goog.net.XhrIo.XHR2_ON_TIMEOUT_]);
};


/**
 * @param {string} header An HTTP header key.
 * @return {boolean} Whether the key is a content type header (ignoring
 *     case.
 * @private
 */
goog.net.XhrIo.isContentTypeHeader_ = function(header) {
  return goog.string.caseInsensitiveEquals(
      goog.net.XhrIo.CONTENT_TYPE_HEADER, header);
};


/**
 * Creates a new XHR object.
 * @return {!goog.net.XhrLike.OrNative} The newly created XHR object.
 * @protected
 */
goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ? this.xmlHttpFactory_.createInstance() :
                                goog.net.XmlHttp();
};


/**
 * The request didn't complete after {@link goog.net.XhrIo#timeoutInterval_}
 * milliseconds; raises a {@link goog.net.EventType.TIMEOUT} event and aborts
 * the request.
 * @private
 */
goog.net.XhrIo.prototype.timeout_ = function() {
  if (typeof goog == 'undefined') {
    // If goog is undefined then the callback has occurred as the application
    // is unloading and will error.  Thus we let it silently fail.
  } else if (this.xhr_) {
    this.lastError_ =
        'Timed out after ' + this.timeoutInterval_ + 'ms, aborting';
    this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
    goog.log.fine(this.logger_, this.formatMsg_(this.lastError_));
    this.dispatchEvent(goog.net.EventType.TIMEOUT);
    this.abort(goog.net.ErrorCode.TIMEOUT);
  }
};


/**
 * Something errorred, so inactivate, fire error callback and clean up
 * @param {goog.net.ErrorCode} errorCode The error code.
 * @param {Error} err The error object.
 * @private
 */
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if (this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();  // Ensures XHR isn't hung (FF)
    this.inAbort_ = false;
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_();
};


/**
 * Dispatches COMPLETE and ERROR in case of an error. This ensures that we do
 * not dispatch multiple error events.
 * @private
 */
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if (!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
  }
};


/**
 * Abort the current XMLHttpRequest
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.xhr_ && this.active_) {
    goog.log.fine(this.logger_, this.formatMsg_('Aborting'));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_();
  }
};


/**
 * Nullifies all callbacks to reduce risks of leaks.
 * @override
 * @protected
 */
goog.net.XhrIo.prototype.disposeInternal = function() {
  if (this.xhr_) {
    // We explicitly do not call xhr_.abort() unless active_ is still true.
    // This is to avoid unnecessarily aborting a successful request when
    // dispose() is called in a callback triggered by a complete response, but
    // in which browser cleanup has not yet finished.
    // (See http://b/issue?id=1684217.)
    if (this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false;
    }
    this.cleanUpXhr_(true);
  }

  goog.net.XhrIo.base(this, 'disposeInternal');
};


/**
 * Internal handler for the XHR object's readystatechange event.  This method
 * checks the status and the readystate and fires the correct callbacks.
 * If the request has ended, the handlers are cleaned up and the XHR object is
 * nullified.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if (this.isDisposed()) {
    // This method is the target of an untracked goog.Timer.callOnce().
    return;
  }
  if (!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    // Were not being called from within a call to this.xhr_.send
    // this.xhr_.abort, or this.xhr_.open, so this is an entry point
    this.onReadyStateChangeEntryPoint_();
  } else {
    this.onReadyStateChangeHelper_();
  }
};


/**
 * Used to protect the onreadystatechange handler entry point.  Necessary
 * as {#onReadyStateChange_} maybe called from within send or abort, this
 * method is only called when {#onReadyStateChange_} is called as an
 * entry point.
 * {@see #protectEntryPoints}
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_();
};


/**
 * Helper for {@link #onReadyStateChange_}.  This is used so that
 * entry point calls to {@link #onReadyStateChange_} can be routed through
 * {@link #onReadyStateChangeEntryPoint_}.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if (!this.active_) {
    // can get called inside abort call
    return;
  }

  if (typeof goog == 'undefined') {
    // NOTE(user): If goog is undefined then the callback has occurred as the
    // application is unloading and will error.  Thus we let it silently fail.

  } else if (
      this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] &&
      this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
      this.getStatus() == 2) {
    // NOTE(user): In IE if send() errors on a *local* request the readystate
    // is still changed to COMPLETE.  We need to ignore it and allow the
    // try/catch around send() to pick up the error.
    goog.log.fine(
        this.logger_,
        this.formatMsg_('Local request error detected and ignored'));

  } else {
    // In IE when the response has been cached we sometimes get the callback
    // from inside the send call and this usually breaks code that assumes that
    // XhrIo is asynchronous.  If that is the case we delay the callback
    // using a timer.
    if (this.inSend_ &&
        this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
      goog.Timer.callOnce(this.onReadyStateChange_, 0, this);
      return;
    }

    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);

    // readyState indicates the transfer has finished
    if (this.isComplete()) {
      goog.log.fine(this.logger_, this.formatMsg_('Request complete'));

      this.active_ = false;

      try {
        // Call the specific callbacks for success or failure. Only call the
        // success if the status is 200 (HTTP_OK) or 304 (HTTP_CACHED)
        if (this.isSuccess()) {
          this.dispatchEvent(goog.net.EventType.COMPLETE);
          this.dispatchEvent(goog.net.EventType.SUCCESS);
        } else {
          this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
          this.lastError_ =
              this.getStatusText() + ' [' + this.getStatus() + ']';
          this.dispatchErrors_();
        }
      } finally {
        this.cleanUpXhr_();
      }
    }
  }
};


/**
 * Internal handler for the XHR object's onprogress event. Fires both a generic
 * PROGRESS event and either a DOWNLOAD_PROGRESS or UPLOAD_PROGRESS event to
 * allow specific binding for each XHR progress event.
 * @param {!ProgressEvent} e XHR progress event.
 * @param {boolean=} opt_isDownload Whether the current progress event is from a
 *     download. Used to determine whether DOWNLOAD_PROGRESS or UPLOAD_PROGRESS
 *     event should be dispatched.
 * @private
 */
goog.net.XhrIo.prototype.onProgressHandler_ = function(e, opt_isDownload) {
  goog.asserts.assert(
      e.type === goog.net.EventType.PROGRESS,
      'goog.net.EventType.PROGRESS is of the same type as raw XHR progress.');
  this.dispatchEvent(
      goog.net.XhrIo.buildProgressEvent_(e, goog.net.EventType.PROGRESS));
  this.dispatchEvent(
      goog.net.XhrIo.buildProgressEvent_(
          e, opt_isDownload ? goog.net.EventType.DOWNLOAD_PROGRESS :
                              goog.net.EventType.UPLOAD_PROGRESS));
};


/**
 * Creates a representation of the native ProgressEvent. IE doesn't support
 * constructing ProgressEvent via "new", and the alternatives (e.g.,
 * ProgressEvent.initProgressEvent) are non-standard or deprecated.
 * @param {!ProgressEvent} e XHR progress event.
 * @param {!goog.net.EventType} eventType The type of the event.
 * @return {!ProgressEvent} The progress event.
 * @private
 */
goog.net.XhrIo.buildProgressEvent_ = function(e, eventType) {
  return /** @type {!ProgressEvent} */ ({
    type: eventType,
    lengthComputable: e.lengthComputable,
    loaded: e.loaded,
    total: e.total
  });
};


/**
 * Remove the listener to protect against leaks, and nullify the XMLHttpRequest
 * object.
 * @param {boolean=} opt_fromDispose If this is from the dispose (don't want to
 *     fire any events).
 * @private
 */
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if (this.xhr_) {
    // Cancel any pending timeout event handler.
    this.cleanUpTimeoutTimer_();

    // Save reference so we can mark it as closed after the READY event.  The
    // READY event may trigger another request, thus we must nullify this.xhr_
    var xhr = this.xhr_;
    var clearedOnReadyStateChange =
        this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ?
        goog.nullFunction :
        null;
    this.xhr_ = null;
    this.xhrOptions_ = null;

    if (!opt_fromDispose) {
      this.dispatchEvent(goog.net.EventType.READY);
    }

    try {
      // NOTE(user): Not nullifying in FireFox can still leak if the callbacks
      // are defined in the same scope as the instance of XhrIo. But, IE doesn't
      // allow you to set the onreadystatechange to NULL so nullFunction is
      // used.
      xhr.onreadystatechange = clearedOnReadyStateChange;
    } catch (e) {
      // This seems to occur with a Gears HTTP request. Delayed the setting of
      // this onreadystatechange until after READY is sent out and catching the
      // error to see if we can track down the problem.
      goog.log.error(
          this.logger_,
          'Problem encountered resetting onreadystatechange: ' + e.message);
    }
  }
};


/**
 * Make sure the timeout timer isn't running.
 * @private
 */
goog.net.XhrIo.prototype.cleanUpTimeoutTimer_ = function() {
  if (this.xhr_ && this.useXhr2Timeout_) {
    this.xhr_[goog.net.XhrIo.XHR2_ON_TIMEOUT_] = null;
  }
  if (goog.isNumber(this.timeoutId_)) {
    goog.Timer.clear(this.timeoutId_);
    this.timeoutId_ = null;
  }
};


/**
 * @return {boolean} Whether there is an active request.
 */
goog.net.XhrIo.prototype.isActive = function() {
  return !!this.xhr_;
};


/**
 * @return {boolean} Whether the request has completed.
 */
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE;
};


/**
 * @return {boolean} Whether the request completed with a success.
 */
goog.net.XhrIo.prototype.isSuccess = function() {
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
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var scheme = goog.uri.utils.getEffectiveScheme(String(this.lastUri_));
  return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(scheme);
};


/**
 * Get the readystate from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {goog.net.XmlHttp.ReadyState} goog.net.XmlHttp.ReadyState.*.
 */
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ?
      /** @type {goog.net.XmlHttp.ReadyState} */ (this.xhr_.readyState) :
                                                 goog.net.XmlHttp.ReadyState
                                                     .UNINITIALIZED;
};


/**
 * Get the status from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {number} Http status.
 */
goog.net.XhrIo.prototype.getStatus = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is receiving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.status :
        -1;
  } catch (e) {
    return -1;
  }
};


/**
 * Get the status text from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {string} Status text.
 */
goog.net.XhrIo.prototype.getStatusText = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is receiving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.statusText :
        '';
  } catch (e) {
    goog.log.fine(this.logger_, 'Can not get status: ' + e.message);
    return '';
  }
};


/**
 * Get the last Uri that was requested
 * @return {string} Last Uri.
 */
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_);
};


/**
 * Get the response text from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {string} Result from the server, or '' if no result available.
 */
goog.net.XhrIo.prototype.getResponseText = function() {
  try {
    return this.xhr_ ? this.xhr_.responseText : '';
  } catch (e) {
    // http://www.w3.org/TR/XMLHttpRequest/#the-responsetext-attribute
    // states that responseText should return '' (and responseXML null)
    // when the state is not LOADING or DONE. Instead, IE can
    // throw unexpected exceptions, for example when a request is aborted
    // or no data is available yet.
    goog.log.fine(this.logger_, 'Can not get responseText: ' + e.message);
    return '';
  }
};


/**
 * Get the response body from the Xhr object. This property is only available
 * in IE since version 7 according to MSDN:
 * http://msdn.microsoft.com/en-us/library/ie/ms534368(v=vs.85).aspx
 * Will only return correct result when called from the context of a callback.
 *
 * One option is to construct a VBArray from the returned object and convert
 * it to a JavaScript array using the toArray method:
 * {@code (new window['VBArray'](xhrIo.getResponseBody())).toArray()}
 * This will result in an array of numbers in the range of [0..255]
 *
 * Another option is to use the VBScript CStr method to convert it into a
 * string as outlined in http://stackoverflow.com/questions/1919972
 *
 * @return {Object} Binary result from the server or null if not available.
 */
goog.net.XhrIo.prototype.getResponseBody = function() {

  try {
    if (this.xhr_ && 'responseBody' in this.xhr_) {
      return this.xhr_['responseBody'];
    }
  } catch (e) {
    // IE can throw unexpected exceptions, for example when a request is aborted
    // or no data is yet available.
    goog.log.fine(this.logger_, 'Can not get responseBody: ' + e.message);
  }
  return null;
};


/**
 * Get the response XML from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {Document} The DOM Document representing the XML file, or null
 * if no result available.
 */
goog.net.XhrIo.prototype.getResponseXml = function() {

  try {
    return this.xhr_ ? this.xhr_.responseXML : null;
  } catch (e) {
    goog.log.fine(this.logger_, 'Can not get responseXML: ' + e.message);
    return null;
  }
};


/**
 * Get the response and evaluates it as JSON from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @throws Error if the response text is invalid JSON.
 * @return {Object|undefined} JavaScript object.
 */
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.xhr_) {
    return undefined;
  }

  var responseText = this.xhr_.responseText;
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }

  return goog.json.parse(responseText);
};


/**
 * Get the response as the type specificed by {@link #setResponseType}. At time
 * of writing, this is only directly supported in very recent versions of WebKit
 * (10.0.612.1 dev and later). If the field is not supported directly, we will
 * try to emulate it.
 *
 * Emulating the response means following the rules laid out at
 * http://www.w3.org/TR/XMLHttpRequest/#the-response-attribute
 *
 * On browsers with no support for this (Chrome < 10, Firefox < 4, etc), only
 * response types of DEFAULT or TEXT may be used, and the response returned will
 * be the text response.
 *
 * On browsers with Mozilla's draft support for array buffers (Firefox 4, 5),
 * only response types of DEFAULT, TEXT, and ARRAY_BUFFER may be used, and the
 * response returned will be either the text response or the Mozilla
 * implementation of the array buffer response.
 *
 * On browsers will full support, any valid response type supported by the
 * browser may be used, and the response provided by the browser will be
 * returned.
 *
 * @return {*} The response.
 */
goog.net.XhrIo.prototype.getResponse = function() {

  try {
    if (!this.xhr_) {
      return null;
    }
    if ('response' in this.xhr_) {
      return this.xhr_.response;
    }
    switch (this.responseType_) {
      case goog.net.XhrIo.ResponseType.DEFAULT:
      case goog.net.XhrIo.ResponseType.TEXT:
        return this.xhr_.responseText;
      // DOCUMENT and BLOB don't need to be handled here because they are
      // introduced in the same spec that adds the .response field, and would
      // have been caught above.
      // ARRAY_BUFFER needs an implementation for Firefox 4, where it was
      // implemented using a draft spec rather than the final spec.
      case goog.net.XhrIo.ResponseType.ARRAY_BUFFER:
        if ('mozResponseArrayBuffer' in this.xhr_) {
          return this.xhr_.mozResponseArrayBuffer;
        }
    }
    // Fell through to a response type that is not supported on this browser.
    goog.log.error(
        this.logger_, 'Response type ' + this.responseType_ + ' is not ' +
            'supported on this browser');
    return null;
  } catch (e) {
    goog.log.fine(this.logger_, 'Can not get response: ' + e.message);
    return null;
  }
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  if (!this.xhr_ || !this.isComplete()) {
    return undefined;
  }

  var value = this.xhr_.getResponseHeader(key);
  return goog.isNull(value) ? undefined : value;
};


/**
 * Gets the text of all the headers in the response.
 * Will only return correct result when called from the context of a callback
 * and the request has completed.
 * @return {string} The value of the response headers or empty string.
 */
goog.net.XhrIo.prototype.getAllResponseHeaders = function() {
  return this.xhr_ && this.isComplete() ? this.xhr_.getAllResponseHeaders() :
                                          '';
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
goog.net.XhrIo.prototype.getResponseHeaders = function() {
  var headersObject = {};
  var headersArray = this.getAllResponseHeaders().split('\r\n');
  for (var i = 0; i < headersArray.length; i++) {
    if (goog.string.isEmptyOrWhitespace(headersArray[i])) {
      continue;
    }
    var keyValue = goog.string.splitLimit(headersArray[i], ': ', 2);
    if (headersObject[keyValue[0]]) {
      headersObject[keyValue[0]] += ', ' + keyValue[1];
    } else {
      headersObject[keyValue[0]] = keyValue[1];
    }
  }
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
goog.net.XhrIo.prototype.getStreamingResponseHeader = function(key) {
  return this.xhr_ ? this.xhr_.getResponseHeader(key) : null;
};


/**
 * Gets the text of all the headers in the response. As opposed to
 * {@link #getAllResponseHeaders}, this method does not require that the request
 * has completed.
 * @return {string} The value of the response headers or empty string.
 */
goog.net.XhrIo.prototype.getAllStreamingResponseHeaders = function() {
  return this.xhr_ ? this.xhr_.getAllResponseHeaders() : '';
};


/**
 * Get the last error message
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Get the last error message
 * @return {string} Last error message.
 */
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ :
                                          String(this.lastError_);
};


/**
 * Adds the last method, status and URI to the message.  This is used to add
 * this information to the logging calls.
 * @param {string} msg The message text that we want to add the extra text to.
 * @return {string} The message with the extra text appended.
 * @private
 */
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + ' [' + this.lastMethod_ + ' ' + this.lastUri_ + ' ' +
      this.getStatus() + ']';
};


// Register the xhr handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
          transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
    });
