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
 * @fileoverview Class that retrieves autocomplete matches via an ajax call.
 *
 */

goog.provide('goog.ui.ac.RemoteArrayMatcher');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');



/**
 * An array matcher that requests matches via ajax.
 * @param {string} url The Uri which generates the auto complete matches.  The
 *     search term is passed to the server as the 'token' query param.
 * @param {boolean=} opt_noSimilar If true, request that the server does not do
 *     similarity matches for the input token against the dictionary.
 *     The value is sent to the server as the 'use_similar' query param which is
 *     either "1" (opt_noSimilar==false) or "0" (opt_noSimilar==true).
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.ac.RemoteArrayMatcher = function(url, opt_noSimilar) {
  goog.Disposable.call(this);

  /**
   * The base URL for the ajax call.  The token and max_matches are added as
   * query params.
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * Whether similar matches should be found as well.  This is sent as a hint
   * to the server only.
   * @type {boolean}
   * @private
   */
  this.useSimilar_ = !opt_noSimilar;

  /**
   * The XhrIo object used for making remote requests.  When a new request
   * is made, the current one is aborted and the new one sent.
   * @type {goog.net.XhrIo}
   * @private
   */
  this.xhr_ = new goog.net.XhrIo();
};
goog.inherits(goog.ui.ac.RemoteArrayMatcher, goog.Disposable);


/**
 * The HTTP send method (GET, POST) to use when making the ajax call.
 * @type {string}
 * @private
 */
goog.ui.ac.RemoteArrayMatcher.prototype.method_ = 'GET';


/**
 * Data to submit during a POST.
 * @type {string|undefined}
 * @private
 */
goog.ui.ac.RemoteArrayMatcher.prototype.content_ = undefined;


/**
 * Headers to send with every HTTP request.
 * @type {Object|goog.structs.Map}
 * @private
 */
goog.ui.ac.RemoteArrayMatcher.prototype.headers_ = null;


/**
 * Key to the listener on XHR. Used to clear previous listeners.
 * @type {goog.events.Key}
 * @private
 */
goog.ui.ac.RemoteArrayMatcher.prototype.lastListenerKey_ = null;


/**
 * Set the send method ("GET", "POST").
 * @param {string} method The send method; default: GET.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.setMethod = function(method) {
  this.method_ = method;
};


/**
 * Set the post data.
 * @param {string} content Post data.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.setContent = function(content) {
  this.content_ = content;
};


/**
 * Set the HTTP headers.
 * @param {Object|goog.structs.Map} headers Map of headers to add to the
 *     request.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.setHeaders = function(headers) {
  this.headers_ = headers;
};


/**
 * Set the timeout interval.
 * @param {number} interval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.setTimeoutInterval =
    function(interval) {
  this.xhr_.setTimeoutInterval(interval);
};


/**
 * Builds a complete GET-style URL, given the base URI and autocomplete related
 * parameter values.
 * <b>Override this to build any customized lookup URLs.</b>
 * <b>Can be used to change request method and any post content as well.</b>
 * @param {string} uri The base URI of the request target.
 * @param {string} token Current token in autocomplete.
 * @param {number} maxMatches Maximum number of matches required.
 * @param {boolean} useSimilar A hint to the server.
 * @param {string=} opt_fullString Complete text in the input element.
 * @return {?string} The complete url. Return null if no request should be sent.
 * @protected
 */
goog.ui.ac.RemoteArrayMatcher.prototype.buildUrl = function(uri,
    token, maxMatches, useSimilar, opt_fullString) {
  var url = new goog.Uri(uri);
  url.setParameterValue('token', token);
  url.setParameterValue('max_matches', String(maxMatches));
  url.setParameterValue('use_similar', String(Number(useSimilar)));
  return url.toString();
};


/**
 * Returns whether the suggestions should be updated?
 * <b>Override this to prevent updates eg - when token is empty.</b>
 * @param {string} uri The base URI of the request target.
 * @param {string} token Current token in autocomplete.
 * @param {number} maxMatches Maximum number of matches required.
 * @param {boolean} useSimilar A hint to the server.
 * @param {string=} opt_fullString Complete text in the input element.
 * @return {boolean} Whether new matches be requested.
 * @protected
 */
goog.ui.ac.RemoteArrayMatcher.prototype.shouldRequestMatches =
    function(uri, token, maxMatches, useSimilar, opt_fullString) {
  return true;
};


/**
 * Parses and retrieves the array of suggestions from XHR response.
 * <b>Override this if the response is not a simple JSON array.</b>
 * @param {string} responseText The XHR response text.
 * @return {Array.<string>} The array of suggestions.
 * @protected
 */
goog.ui.ac.RemoteArrayMatcher.prototype.parseResponseText = function(
    responseText) {

  var matches = [];
  // If there is no response text, unsafeParse will throw a syntax error.
  if (responseText) {
    /** @preserveTry */
    try {
      matches = goog.json.unsafeParse(responseText);
    } catch (exception) {
    }
  }
  return /** @type {Array.<string>} */ (matches);
};


/**
 * Handles the XHR response.
 * @param {string} token The XHR autocomplete token.
 * @param {Function} matchHandler The AutoComplete match handler.
 * @param {goog.events.Event} event The XHR success event.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.xhrCallback = function(token,
    matchHandler, event) {
  var text = event.target.getResponseText();
  matchHandler(token, this.parseResponseText(text));
};


/**
 * Retrieve a set of matching rows from the server via ajax.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 * @param {string=} opt_fullString The full string from the input box.
 */
goog.ui.ac.RemoteArrayMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler, opt_fullString) {

  if (!this.shouldRequestMatches(this.url_, token, maxMatches, this.useSimilar_,
      opt_fullString)) {
    return;
  }
  // Set the query params on the URL.
  var url = this.buildUrl(this.url_, token, maxMatches, this.useSimilar_,
      opt_fullString);
  if (!url) {
    // Do nothing if there is no URL.
    return;
  }

  // The callback evals the server response and calls the match handler on
  // the array of matches.
  var callback = goog.bind(this.xhrCallback, this, token, matchHandler);

  // Abort the current request and issue the new one; prevent requests from
  // being queued up by the browser with a slow server
  if (this.xhr_.isActive()) {
    this.xhr_.abort();
  }
  // This ensures if previous XHR is aborted or ends with error, the
  // corresponding success-callbacks are cleared.
  if (this.lastListenerKey_) {
    goog.events.unlistenByKey(this.lastListenerKey_);
  }
  // Listen once ensures successful callback gets cleared by itself.
  this.lastListenerKey_ = goog.events.listenOnce(this.xhr_,
      goog.net.EventType.SUCCESS, callback);
  this.xhr_.send(url, this.method_, this.content_, this.headers_);
};


/** @override */
goog.ui.ac.RemoteArrayMatcher.prototype.disposeInternal = function() {
  this.xhr_.dispose();
  goog.ui.ac.RemoteArrayMatcher.superClass_.disposeInternal.call(
      this);
};
