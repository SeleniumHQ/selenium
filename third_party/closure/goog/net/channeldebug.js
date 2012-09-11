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
 * @fileoverview Definition of the ChannelDebug class. ChannelDebug provides
 * a utility for tracing and debugging the BrowserChannel requests.
 *
 * TODO(user) - allow client to specify a custom redaction policy
 */


/**
 * Namespace for BrowserChannel
 */
goog.provide('goog.net.ChannelDebug');
goog.require('goog.debug.Logger');
goog.require('goog.json');



/**
 * Logs and keeps a buffer of debugging info for the Channel.
 *
 * @constructor
 */
goog.net.ChannelDebug = function() {
  /**
   * The logger instance.
   * @type {goog.debug.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('goog.net.BrowserChannel');
};


/**
 * Gets the logger used by this ChannelDebug.
 * @return {goog.debug.Logger} The logger used by this ChannelDebug.
 */
goog.net.ChannelDebug.prototype.getLogger = function() {
  return this.logger_;
};


/**
 * Logs that the browser went offline during the lifetime of a request.
 * @param {goog.Uri} url The URL being requested.
 */
goog.net.ChannelDebug.prototype.browserOfflineResponse = function(url) {
  this.info('BROWSER_OFFLINE: ' + url);
};


/**
 * Logs an XmlHttp request..
 * @param {string} verb The request type (GET/POST).
 * @param {goog.Uri} uri The request destination.
 * @param {string|number|undefined} id The request id.
 * @param {number} attempt Which attempt # the request was.
 * @param {?string} postData The data posted in the request.
 */
goog.net.ChannelDebug.prototype.xmlHttpChannelRequest =
    function(verb, uri, id, attempt, postData) {
  this.info(
      'XMLHTTP REQ (' + id + ') [attempt ' + attempt + ']: ' +
      verb + '\n' + uri + '\n' +
      this.maybeRedactPostData_(postData));
};


/**
 * Logs the meta data received from an XmlHttp request.
 * @param {string} verb The request type (GET/POST).
 * @param {goog.Uri} uri The request destination.
 * @param {string|number|undefined} id The request id.
 * @param {number} attempt Which attempt # the request was.
 * @param {goog.net.XmlHttp.ReadyState} readyState The ready state.
 * @param {number} statusCode The HTTP status code.
 */
goog.net.ChannelDebug.prototype.xmlHttpChannelResponseMetaData =
    function(verb, uri, id, attempt, readyState, statusCode)  {
  this.info(
      'XMLHTTP RESP (' + id + ') [ attempt ' + attempt + ']: ' +
      verb + '\n' + uri + '\n' + readyState + ' ' + statusCode);
};


/**
 * Logs the response data received from an XmlHttp request.
 * @param {string|number|undefined} id The request id.
 * @param {?string} responseText The response text.
 * @param {?string=} opt_desc Optional request description.
 */
goog.net.ChannelDebug.prototype.xmlHttpChannelResponseText =
    function(id, responseText, opt_desc) {
  this.info(
      'XMLHTTP TEXT (' + id + '): ' +
      this.redactResponse_(responseText) +
      (opt_desc ? ' ' + opt_desc : ''));
};


/**
 * Logs a Trident ActiveX request.
 * @param {string} verb The request type (GET/POST).
 * @param {goog.Uri} uri The request destination.
 * @param {string|number|undefined} id The request id.
 * @param {number} attempt Which attempt # the request was.
 */
goog.net.ChannelDebug.prototype.tridentChannelRequest =
    function(verb, uri, id, attempt) {
  this.info(
      'TRIDENT REQ (' + id + ') [ attempt ' + attempt + ']: ' +
      verb + '\n' + uri);
};


/**
 * Logs the response text received from a Trident ActiveX request.
 * @param {string|number|undefined} id The request id.
 * @param {string} responseText The response text.
 */
goog.net.ChannelDebug.prototype.tridentChannelResponseText =
    function(id, responseText) {
  this.info(
      'TRIDENT TEXT (' + id + '): ' +
      this.redactResponse_(responseText));
};


/**
 * Logs the done response received from a Trident ActiveX request.
 * @param {string|number|undefined} id The request id.
 * @param {boolean} successful Whether the request was successful.
 */
goog.net.ChannelDebug.prototype.tridentChannelResponseDone =
    function(id, successful) {
  this.info(
      'TRIDENT TEXT (' + id + '): ' + successful ? 'success' : 'failure');
};


/**
 * Logs a request timeout.
 * @param {goog.Uri} uri The uri that timed out.
 */
goog.net.ChannelDebug.prototype.timeoutResponse = function(uri) {
  this.info('TIMEOUT: ' + uri);
};


/**
 * Logs a debug message.
 * @param {string} text The message.
 */
goog.net.ChannelDebug.prototype.debug = function(text) {
  this.info(text);
};


/**
 * Logs an exception
 * @param {Error} e The error or error event.
 * @param {string=} opt_msg The optional message, defaults to 'Exception'.
 */
goog.net.ChannelDebug.prototype.dumpException = function(e, opt_msg) {
  this.severe((opt_msg || 'Exception') + e);
};


/**
 * Logs an info message.
 * @param {string} text The message.
 */
goog.net.ChannelDebug.prototype.info = function(text) {
  this.logger_.info(text);
};


/**
 * Logs a warning message.
 * @param {string} text The message.
 */
goog.net.ChannelDebug.prototype.warning = function(text) {
  this.logger_.warning(text);
};


/**
 * Logs a severe message.
 * @param {string} text The message.
 */
goog.net.ChannelDebug.prototype.severe = function(text) {
  this.logger_.severe(text);
};


/**
 * Removes potentially private data from a response so that we don't
 * accidentally save private and personal data to the server logs.
 * @param {?string} responseText A JSON response to clean.
 * @return {?string} The cleaned response.
 * @private
 */
goog.net.ChannelDebug.prototype.redactResponse_ = function(responseText) {
  // first check if it's not JS - the only non-JS should be the magic cookie
  if (!responseText ||
      responseText == goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE) {
    return responseText;
  }
  /** @preserveTry */
  try {
    var responseArray = goog.json.unsafeParse(responseText);

    for (var i = 0; i < responseArray.length; i++) {
      if (goog.isArray(responseArray[i])) {
        this.maybeRedactArray_(responseArray[i]);
      }
    }

    return goog.json.serialize(responseArray);
  } catch (e) {
    this.debug('Exception parsing expected JS array - probably was not JS');
    return responseText;
  }
};


/**
 * Removes data from a response array that may be sensitive.
 * @param {Array} array The array to clean.
 * @private
 */
goog.net.ChannelDebug.prototype.maybeRedactArray_ = function(array) {
  if (array.length < 2) {
    return;
  }
  var dataPart = array[1];
  if (!goog.isArray(dataPart)) {
    return;
  }
  if (dataPart.length < 1) {
    return;
  }

  var type = dataPart[0];
  if (type != 'noop' && type != 'stop') {
    // redact all fields in the array
    for (var i = 1; i < dataPart.length; i++) {
      dataPart[i] = '';
    }
  }
};


/**
 * Removes potentially private data from a request POST body so that we don't
 * accidentally save private and personal data to the server logs.
 * @param {?string} data The data string to clean.
 * @return {?string} The data string with sensitive data replaced by 'redacted'.
 * @private
 */
goog.net.ChannelDebug.prototype.maybeRedactPostData_ = function(data) {
  if (!data) {
    return null;
  }
  var out = '';
  var params = data.split('&');
  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    var keyValue = param.split('=');
    if (keyValue.length > 1) {
      var key = keyValue[0];
      var value = keyValue[1];

      var keyParts = key.split('_');
      if (keyParts.length >= 2 && keyParts[1] == 'type') {
        out += key + '=' + value + '&';
      } else {
        out += key + '=' + 'redacted' + '&';
      }
    }
  }
  return out;
};
