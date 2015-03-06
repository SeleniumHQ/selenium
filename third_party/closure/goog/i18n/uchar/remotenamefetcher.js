// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Object which fetches Unicode codepoint names from a remote data
 * source. This data source should accept two parameters:
 * <ol>
 * <li>c - the list of codepoints in hexadecimal format
 * <li>p - the name property
 * </ol>
 * and return a JSON object representation of the result.
 * For example, calling this data source with the following URL:
 * http://datasource?c=50,ff,102bd&p=name
 * Should return a JSON object which looks like this:
 * <pre>
 * {"50":{"name":"LATIN CAPITAL LETTER P"},
 * "ff":{"name":"LATIN SMALL LETTER Y WITH DIAERESIS"},
 * "102bd":{"name":"CARIAN LETTER K2"}}
 * </pre>.
 */

goog.provide('goog.i18n.uChar.RemoteNameFetcher');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.i18n.uChar');
goog.require('goog.i18n.uChar.NameFetcher');
goog.require('goog.log');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Map');



/**
 * Builds the RemoteNameFetcher object. This object retrieves codepoint names
 * from a remote data source.
 *
 * @param {string} dataSourceUri URI to the data source.
 * @constructor
 * @implements {goog.i18n.uChar.NameFetcher}
 * @extends {goog.Disposable}
 * @final
 */
goog.i18n.uChar.RemoteNameFetcher = function(dataSourceUri) {
  goog.i18n.uChar.RemoteNameFetcher.base(this, 'constructor');

  /**
   * XHRIo object for prefetch() asynchronous calls.
   *
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.prefetchXhrIo_ = new goog.net.XhrIo();

  /**
   * XHRIo object for getName() asynchronous calls.
   *
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.getNameXhrIo_ = new goog.net.XhrIo();

  /**
   * URI to the data.
   *
   * @type {string}
   * @private
   */
  this.dataSourceUri_ = dataSourceUri;

  /**
   * A cache of all the collected names from the server.
   *
   * @type {!goog.structs.Map}
   * @private
   */
  this.charNames_ = new goog.structs.Map();
};
goog.inherits(goog.i18n.uChar.RemoteNameFetcher, goog.Disposable);


/**
 * Key to the listener on XHR for prefetch(). Used to clear previous listeners.
 *
 * @type {goog.events.Key}
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.prefetchLastListenerKey_;


/**
 * Key to the listener on XHR for getName(). Used to clear previous listeners.
 *
 * @type {goog.events.Key}
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.getNameLastListenerKey_;


/**
 * A reference to the RemoteNameFetcher logger.
 *
 * @type {goog.log.Logger}
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.logger_ =
    goog.log.getLogger('goog.i18n.uChar.RemoteNameFetcher');




/** @override */
goog.i18n.uChar.RemoteNameFetcher.prototype.disposeInternal = function() {
  goog.i18n.uChar.RemoteNameFetcher.base(this, 'disposeInternal');
  this.prefetchXhrIo_.dispose();
  this.getNameXhrIo_.dispose();
};


/** @override */
goog.i18n.uChar.RemoteNameFetcher.prototype.prefetch = function(characters) {
  // Abort the current request if there is one
  if (this.prefetchXhrIo_.isActive()) {
    goog.i18n.uChar.RemoteNameFetcher.logger_.
        info('Aborted previous prefetch() call for new incoming request');
    this.prefetchXhrIo_.abort();
  }
  if (this.prefetchLastListenerKey_) {
    goog.events.unlistenByKey(this.prefetchLastListenerKey_);
  }

  // Set up new listener
  var preFetchCallback = goog.bind(this.prefetchCallback_, this);
  this.prefetchLastListenerKey_ = goog.events.listenOnce(this.prefetchXhrIo_,
      goog.net.EventType.COMPLETE, preFetchCallback);

  this.fetch_(goog.i18n.uChar.RemoteNameFetcher.RequestType_.BASE_88,
      characters, this.prefetchXhrIo_);
};


/**
 * Callback on completion of the prefetch operation.
 *
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.prefetchCallback_ = function() {
  this.processResponse_(this.prefetchXhrIo_);
};


/** @override */
goog.i18n.uChar.RemoteNameFetcher.prototype.getName = function(character,
    callback) {
  var codepoint = goog.i18n.uChar.toCharCode(character).toString(16);

  if (this.charNames_.containsKey(codepoint)) {
    var name = /** @type {string} */ (this.charNames_.get(codepoint));
    callback(name);
    return;
  }

  // Abort the current request if there is one
  if (this.getNameXhrIo_.isActive()) {
    goog.i18n.uChar.RemoteNameFetcher.logger_.
        info('Aborted previous getName() call for new incoming request');
    this.getNameXhrIo_.abort();
  }
  if (this.getNameLastListenerKey_) {
    goog.events.unlistenByKey(this.getNameLastListenerKey_);
  }

  // Set up new listener
  var getNameCallback = goog.bind(this.getNameCallback_, this, codepoint,
      callback);
  this.getNameLastListenerKey_ = goog.events.listenOnce(this.getNameXhrIo_,
      goog.net.EventType.COMPLETE, getNameCallback);

  this.fetch_(goog.i18n.uChar.RemoteNameFetcher.RequestType_.CODEPOINT,
      codepoint, this.getNameXhrIo_);
};


/**
 * Callback on completion of the getName operation.
 *
 * @param {string} codepoint The codepoint in hexadecimal format.
 * @param {function(?string)} callback The callback function called when the
 *     name retrieval is complete, contains a single string parameter with the
 *     codepoint name, this parameter will be null if the character name is not
 *     defined.
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.getNameCallback_ = function(
    codepoint, callback) {
  this.processResponse_(this.getNameXhrIo_);
  var name = /** @type {?string} */ (this.charNames_.get(codepoint, null));
  callback(name);
};


/**
 * Process the response received from the server and store results in the cache.
 *
 * @param {!goog.net.XhrIo} xhrIo The XhrIo object used to make the request.
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.processResponse_ = function(xhrIo) {
  if (!xhrIo.isSuccess()) {
    goog.log.error(goog.i18n.uChar.RemoteNameFetcher.logger_,
        'Problem with data source: ' + xhrIo.getLastError());
    return;
  }
  var result = xhrIo.getResponseJson();
  for (var codepoint in result) {
    if (result[codepoint].hasOwnProperty('name')) {
      this.charNames_.set(codepoint, result[codepoint]['name']);
    }
  }
};


/**
 * Enum for the different request types.
 *
 * @enum {string}
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.RequestType_ = {

  /**
   * Request type that uses a base 88 string containing a set of codepoints to
   * be fetched from the server (see goog.i18n.charpickerdata for more
   * information on b88).
   */
  BASE_88: 'b88',

  /**
   * Request type that uses a a string of comma separated codepoint values.
   */
  CODEPOINT: 'c'
};


/**
 * Fetches a set of codepoint names from the data source.
 *
 * @param {!goog.i18n.uChar.RemoteNameFetcher.RequestType_} requestType The
 *     request type of the operation. This parameter specifies how the server is
 *     called to fetch a particular set of codepoints.
 * @param {string} requestInput The input to the request, this is the value that
 *     is passed onto the server to complete the request.
 * @param {!goog.net.XhrIo} xhrIo The XHRIo object to execute the server call.
 * @private
 */
goog.i18n.uChar.RemoteNameFetcher.prototype.fetch_ = function(requestType,
    requestInput, xhrIo) {
  var url = new goog.Uri(this.dataSourceUri_);
  url.setParameterValue(requestType, requestInput);
  url.setParameterValue('p', 'name');
  goog.log.info(goog.i18n.uChar.RemoteNameFetcher.logger_, 'Request: ' +
      url.toString());
  xhrIo.send(url);
};


/** @override */
goog.i18n.uChar.RemoteNameFetcher.prototype.isNameAvailable = function(
    character) {
  return true;
};
