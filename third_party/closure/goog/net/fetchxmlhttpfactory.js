// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.FetchXmlHttp');
goog.provide('goog.net.FetchXmlHttpFactory');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.functions');
goog.require('goog.log');
goog.require('goog.net.XhrLike');
goog.require('goog.net.XmlHttpFactory');



/**
 * Factory for creating Xhr objects that uses the native fetch() method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * Note that this factory is intended for use in Service Worker only.
 * @param {!WorkerGlobalScope} worker The Service Worker global scope.
 * @extends {goog.net.XmlHttpFactory}
 * @struct
 * @constructor
 */
goog.net.FetchXmlHttpFactory = function(worker) {
  goog.net.FetchXmlHttpFactory.base(this, 'constructor');

  /** @private @final {!WorkerGlobalScope} */
  this.worker_ = worker;

  /** @private {!RequestCredentials|undefined} */
  this.credentialsMode_ = undefined;

  /** @private {!RequestCache|undefined} */
  this.cacheMode_ = undefined;
};
goog.inherits(
    goog.net.FetchXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.FetchXmlHttpFactory.prototype.createInstance = function() {
  var instance = new goog.net.FetchXmlHttp(this.worker_);
  if (this.credentialsMode_) {
    instance.setCredentialsMode(this.credentialsMode_);
  }
  if (this.cacheMode_) {
    instance.setCacheMode(this.cacheMode_);
  }
  return instance;
};


/** @override */
goog.net.FetchXmlHttpFactory.prototype.internalGetOptions =
    goog.functions.constant({});


/**
 * @param {!RequestCredentials} credentialsMode The credentials mode of the
 *     Service Worker fetch.
 */
goog.net.FetchXmlHttpFactory.prototype.setCredentialsMode =
    function(credentialsMode) {
  this.credentialsMode_ = credentialsMode;
};


/**
 * @param {!RequestCache} cacheMode The cache mode of the Service Worker fetch.
 */
goog.net.FetchXmlHttpFactory.prototype.setCacheMode = function(cacheMode) {
  this.cacheMode_ = cacheMode;
};



/**
 * FetchXmlHttp object constructor.
 * @param {!WorkerGlobalScope} worker
 * @extends {goog.events.EventTarget}
 * @implements {goog.net.XhrLike}
 * @constructor
 * @struct
 */
goog.net.FetchXmlHttp = function(worker) {
  goog.net.FetchXmlHttp.base(this, 'constructor');

  /** @private @final {!WorkerGlobalScope} */
  this.worker_ = worker;

  /** @private {RequestCredentials|undefined} */
  this.credentialsMode_ = undefined;

  /** @private {RequestCache|undefined} */
  this.cacheMode_ = undefined;

  /**
   * Request state.
   * @type {goog.net.FetchXmlHttp.RequestState}
   */
  this.readyState = goog.net.FetchXmlHttp.RequestState.UNSENT;

  /**
   * HTTP status.
   * @type {number}
   */
  this.status = 0;

  /**
   * HTTP status string.
   * @type {string}
   */
  this.statusText = '';

  /**
   * Content of the response.
   * @type {string}
   */
  this.responseText = '';

  /**
   * Document response entity body.
   * NOTE: This is always null and not supported by this class.
   * @final {null}
   */
  this.responseXML = null;

  /**
   * Method to call when the state changes.
   * @type {?function()}
   */
  this.onreadystatechange = null;

  /** @private {!Headers} */
  this.requestHeaders_ = new Headers();

  /** @private {?Headers} */
  this.responseHeaders_ = null;

  /**
   * Request method (GET or POST).
   * @private {string}
   */
  this.method_ = 'GET';

  /**
   * Request URL.
   * @private {string}
   */
  this.url_ = '';

  /**
   * Whether the request is in progress.
   * @private {boolean}
   */
  this.inProgress_ = false;

  /** @private @final {?goog.log.Logger} */
  this.logger_ = goog.log.getLogger('goog.net.FetchXmlHttp');

};
goog.inherits(goog.net.FetchXmlHttp, goog.events.EventTarget);


/**
 * State of the requests.
 * @enum {number}
 */
goog.net.FetchXmlHttp.RequestState = {
  UNSENT: 0,
  OPENED: 1,
  HEADER_RECEIVED: 2,
  LOADING: 3,
  DONE: 4
};


/** @override */
goog.net.FetchXmlHttp.prototype.open = function(
    method, url, opt_async) {
  goog.asserts.assert(!!opt_async, 'Only async requests are supported.');
  if (this.readyState != goog.net.FetchXmlHttp.RequestState.UNSENT) {
    this.abort();
    throw Error('Error reopening a connection');
  }

  this.method_ = method;
  this.url_ = url;

  this.readyState = goog.net.FetchXmlHttp.RequestState.OPENED;
  this.dispatchCallback_();
};


/** @override */
goog.net.FetchXmlHttp.prototype.send = function(opt_data) {
  if (this.readyState != goog.net.FetchXmlHttp.RequestState.OPENED) {
    this.abort();
    throw Error('need to call open() first. ');
  }

  this.inProgress_ = true;
  var requestInit = {
    headers: this.requestHeaders_,
    method: this.method_,
    credentials: this.credentialsMode_,
    cache: this.cacheMode_
  };
  if (opt_data) {
    requestInit['body'] = opt_data;
  }
  this.worker_.fetch(
      new Request(this.url_, /** @type {!RequestInit} */ (requestInit))).then(
      this.handleResponse_.bind(this), this.handleSendFailure_.bind(this));
};


/** @override */
goog.net.FetchXmlHttp.prototype.abort = function() {
  this.responseText = '';
  this.requestHeaders_ = new Headers();
  this.status = 0;
  if (((this.readyState >= goog.net.FetchXmlHttp.RequestState.OPENED) &&
      this.inProgress_) &&
      (this.readyState != goog.net.FetchXmlHttp.RequestState.DONE)) {
    this.readyState = goog.net.FetchXmlHttp.RequestState.DONE;
    this.inProgress_ = false;
    this.dispatchCallback_();
  }

  this.readyState = goog.net.FetchXmlHttp.RequestState.UNSENT;
};


/**
 * Handles the fetch response.
 * @param {!Response} response
 * @private
 */
goog.net.FetchXmlHttp.prototype.handleResponse_ = function(response) {
  if (!this.inProgress_) {
    // The request was aborted, ignore.
    return;
  }

  if (!this.responseHeaders_) {
    this.responseHeaders_ = response.headers;
    this.readyState = goog.net.FetchXmlHttp.RequestState.HEADER_RECEIVED;
    this.dispatchCallback_();
  }
  // A callback may abort the request.
  if (!this.inProgress_) {
    // The request was aborted, ignore.
    return;
  }

  this.readyState = goog.net.FetchXmlHttp.RequestState.LOADING;
  this.dispatchCallback_();
  // A callback may abort the request.
  if (!this.inProgress_) {
    // The request was aborted, ignore.
    return;
  }
  response.text().then(this.handleResponseText_.bind(this, response),
      this.handleSendFailure_.bind(this));
};


/**
 * Handles the response text.
 * @param {!Response} response
 * @param {string} responseText
 * @private
 */
goog.net.FetchXmlHttp.prototype.handleResponseText_ = function(
    response, responseText) {
  if (!this.inProgress_) {
    // The request was aborted, ignore.
    return;
  }
  this.status = response.status;
  this.statusText = response.statusText;
  this.responseText = responseText;
  this.readyState = goog.net.FetchXmlHttp.RequestState.DONE;
  this.dispatchCallback_();
};


/**
 * Handles the send failure.
 * @param {*} error
 * @private
 */
goog.net.FetchXmlHttp.prototype.handleSendFailure_ = function(error) {
  var e = error instanceof Error ? error : Error(error);
  goog.log.warning(this.logger_, 'Failed to fetch url ' + this.url_, e);
  if (!this.inProgress_) {
    // The request was aborted, ignore.
    return;
  }
  this.readyState = goog.net.FetchXmlHttp.RequestState.DONE;
  this.dispatchCallback_();
};


/** @override */
goog.net.FetchXmlHttp.prototype.setRequestHeader = function(header, value) {
  this.requestHeaders_.append(header, value);
};


/** @override */
goog.net.FetchXmlHttp.prototype.getResponseHeader = function(header) {
  return this.responseHeaders_.get(header.toLowerCase()) || '';
};


/** @override */
goog.net.FetchXmlHttp.prototype.getAllResponseHeaders = function() {
  // TODO(user): Implement once the Headers extern support entries().
  return '';
};


/**
 * @param {!RequestCredentials} credentialsMode The credentials mode of the
 *     Service Worker fetch.
 */
goog.net.FetchXmlHttp.prototype.setCredentialsMode = function(credentialsMode) {
  this.credentialsMode_ = credentialsMode;
};


/**
 * @param {!RequestCache} cacheMode The cache mode of the Service Worker fetch.
 */
goog.net.FetchXmlHttp.prototype.setCacheMode = function(cacheMode) {
  this.cacheMode_ = cacheMode;
};


/**
 * Dispatches the callback, if the callback attribute is defined.
 * @private
 */
goog.net.FetchXmlHttp.prototype.dispatchCallback_ = function() {
  if (this.onreadystatechange) {
    this.onreadystatechange.call(this);
  }
};
