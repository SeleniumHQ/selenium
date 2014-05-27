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

// The original file lives here: http://go/cross_domain_channel.js

/**
 * @fileoverview Implements a cross-domain communication channel. A
 * typical web page is prevented by browser security from sending
 * request, such as a XMLHttpRequest, to other servers than the ones
 * from which it came. The Jsonp class provides a workaround by
 * using dynamically generated script tags. Typical usage:.
 *
 * var jsonp = new goog.net.Jsonp(new goog.Uri('http://my.host.com/servlet'));
 * var payload = { 'foo': 1, 'bar': true };
 * jsonp.send(payload, function(reply) { alert(reply) });
 *
 * This script works in all browsers that are currently supported by
 * the Google Maps API, which is IE 6.0+, Firefox 0.8+, Safari 1.2.4+,
 * Netscape 7.1+, Mozilla 1.4+, Opera 8.02+.
 *
 */

goog.provide('goog.net.Jsonp');

goog.require('goog.Uri');
goog.require('goog.net.jsloader');

// WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING
//
// This class allows us (Google) to send data from non-Google and thus
// UNTRUSTED pages to our servers. Under NO CIRCUMSTANCES return
// anything sensitive, such as session or cookie specific data. Return
// only data that you want parties external to Google to have. Also
// NEVER use this method to send data from web pages to untrusted
// servers, or redirects to unknown servers (www.google.com/cache,
// /q=xx&btnl, /url, www.googlepages.com, etc.)
//
// WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING



/**
 * Creates a new cross domain channel that sends data to the specified
 * host URL. By default, if no reply arrives within 5s, the channel
 * assumes the call failed to complete successfully.
 *
 * @param {goog.Uri|string} uri The Uri of the server side code that receives
 *     data posted through this channel (e.g.,
 *     "http://maps.google.com/maps/geo").
 *
 * @param {string=} opt_callbackParamName The parameter name that is used to
 *     specify the callback. Defaults to "callback".
 *
 * @constructor
 * @final
 */
goog.net.Jsonp = function(uri, opt_callbackParamName) {
  /**
   * The uri_ object will be used to encode the payload that is sent to the
   * server.
   * @type {goog.Uri}
   * @private
   */
  this.uri_ = new goog.Uri(uri);

  /**
   * This is the callback parameter name that is added to the uri.
   * @type {string}
   * @private
   */
  this.callbackParamName_ = opt_callbackParamName ?
      opt_callbackParamName : 'callback';

  /**
   * The length of time, in milliseconds, this channel is prepared
   * to wait for for a request to complete. The default value is 5 seconds.
   * @type {number}
   * @private
   */
  this.timeout_ = 5000;
};


/**
 * The name of the property of goog.global under which the callback is
 * stored.
 */
goog.net.Jsonp.CALLBACKS = '_callbacks_';


/**
 * Used to generate unique callback IDs. The counter must be global because
 * all channels share a common callback object.
 * @private
 */
goog.net.Jsonp.scriptCounter_ = 0;


/**
 * Sets the length of time, in milliseconds, this channel is prepared
 * to wait for for a request to complete. If the call is not competed
 * within the set time span, it is assumed to have failed. To wait
 * indefinitely for a request to complete set the timout to a negative
 * number.
 *
 * @param {number} timeout The length of time before calls are
 * interrupted.
 */
goog.net.Jsonp.prototype.setRequestTimeout = function(timeout) {
  this.timeout_ = timeout;
};


/**
 * Returns the current timeout value, in milliseconds.
 *
 * @return {number} The timeout value.
 */
goog.net.Jsonp.prototype.getRequestTimeout = function() {
  return this.timeout_;
};


/**
 * Sends the given payload to the URL specified at the construction
 * time. The reply is delivered to the given replyCallback. If the
 * errorCallback is specified and the reply does not arrive within the
 * timeout period set on this channel, the errorCallback is invoked
 * with the original payload.
 *
 * If no reply callback is specified, then the response is expected to
 * consist of calls to globally registered functions. No &callback=
 * URL parameter will be sent in the request, and the script element
 * will be cleaned up after the timeout.
 *
 * @param {Object=} opt_payload Name-value pairs.  If given, these will be
 *     added as parameters to the supplied URI as GET parameters to the
 *     given server URI.
 *
 * @param {Function=} opt_replyCallback A function expecting one
 *     argument, called when the reply arrives, with the response data.
 *
 * @param {Function=} opt_errorCallback A function expecting one
 *     argument, called on timeout, with the payload (if given), otherwise
 *     null.
 *
 * @param {string=} opt_callbackParamValue Value to be used as the
 *     parameter value for the callback parameter (callbackParamName).
 *     To be used when the value needs to be fixed by the client for a
 *     particular request, to make use of the cached responses for the request.
 *     NOTE: If multiple requests are made with the same
 *     opt_callbackParamValue, only the last call will work whenever the
 *     response comes back.
 *
 * @return {!Object} A request descriptor that may be used to cancel this
 *     transmission, or null, if the message may not be cancelled.
 */
goog.net.Jsonp.prototype.send = function(opt_payload,
                                         opt_replyCallback,
                                         opt_errorCallback,
                                         opt_callbackParamValue) {

  var payload = opt_payload || null;

  var id = opt_callbackParamValue ||
      '_' + (goog.net.Jsonp.scriptCounter_++).toString(36) +
      goog.now().toString(36);

  if (!goog.global[goog.net.Jsonp.CALLBACKS]) {
    goog.global[goog.net.Jsonp.CALLBACKS] = {};
  }

  // Create a new Uri object onto which this payload will be added
  var uri = this.uri_.clone();
  if (payload) {
    goog.net.Jsonp.addPayloadToUri_(payload, uri);
  }

  if (opt_replyCallback) {
    var reply = goog.net.Jsonp.newReplyHandler_(id, opt_replyCallback);
    goog.global[goog.net.Jsonp.CALLBACKS][id] = reply;

    uri.setParameterValues(this.callbackParamName_,
                           goog.net.Jsonp.CALLBACKS + '.' + id);
  }

  var deferred = goog.net.jsloader.load(uri.toString(),
      {timeout: this.timeout_, cleanupWhenDone: true});
  var error = goog.net.Jsonp.newErrorHandler_(id, payload, opt_errorCallback);
  deferred.addErrback(error);

  return {id_: id, deferred_: deferred};
};


/**
 * Cancels a given request. The request must be exactly the object returned by
 * the send method.
 *
 * @param {Object} request The request object returned by the send method.
 */
goog.net.Jsonp.prototype.cancel = function(request) {
  if (request) {
    if (request.deferred_) {
      request.deferred_.cancel();
    }
    if (request.id_) {
      goog.net.Jsonp.cleanup_(request.id_, false);
    }
  }
};


/**
 * Creates a timeout callback that calls the given timeoutCallback with the
 * original payload.
 *
 * @param {string} id The id of the script node.
 * @param {Object} payload The payload that was sent to the server.
 * @param {Function=} opt_errorCallback The function called on timeout.
 * @return {!Function} A zero argument function that handles callback duties.
 * @private
 */
goog.net.Jsonp.newErrorHandler_ = function(id,
                                           payload,
                                           opt_errorCallback) {
  /**
   * When we call across domains with a request, this function is the
   * timeout handler. Once it's done executing the user-specified
   * error-handler, it removes the script node and original function.
   */
  return function() {
    goog.net.Jsonp.cleanup_(id, false);
    if (opt_errorCallback) {
      opt_errorCallback(payload);
    }
  };
};


/**
 * Creates a reply callback that calls the given replyCallback with data
 * returned by the server.
 *
 * @param {string} id The id of the script node.
 * @param {Function} replyCallback The function called on reply.
 * @return {!Function} A reply callback function.
 * @private
 */
goog.net.Jsonp.newReplyHandler_ = function(id, replyCallback) {
  /**
   * This function is the handler for the all-is-well response. It
   * clears the error timeout handler, calls the user's handler, then
   * removes the script node and itself.
   *
   * @param {...Object} var_args The response data sent from the server.
   */
  return function(var_args) {
    goog.net.Jsonp.cleanup_(id, true);
    replyCallback.apply(undefined, arguments);
  };
};


/**
 * Removes the script node and reply handler with the given id.
 *
 * @param {string} id The id of the script node to be removed.
 * @param {boolean} deleteReplyHandler If true, delete the reply handler
 *     instead of setting it to nullFunction (if we know the callback could
 *     never be called again).
 * @private
 */
goog.net.Jsonp.cleanup_ = function(id, deleteReplyHandler) {
  if (goog.global[goog.net.Jsonp.CALLBACKS][id]) {
    if (deleteReplyHandler) {
      delete goog.global[goog.net.Jsonp.CALLBACKS][id];
    } else {
      // Removing the script tag doesn't necessarily prevent the script
      // from firing, so we make the callback a noop.
      goog.global[goog.net.Jsonp.CALLBACKS][id] = goog.nullFunction;
    }
  }
};


/**
 * Returns URL encoded payload. The payload should be a map of name-value
 * pairs, in the form {"foo": 1, "bar": true, ...}.  If the map is empty,
 * the URI will be unchanged.
 *
 * <p>The method uses hasOwnProperty() to assure the properties are on the
 * object, not on its prototype.
 *
 * @param {!Object} payload A map of value name pairs to be encoded.
 *     A value may be specified as an array, in which case a query parameter
 *     will be created for each value, e.g.:
 *     {"foo": [1,2]} will encode to "foo=1&foo=2".
 *
 * @param {!goog.Uri} uri A Uri object onto which the payload key value pairs
 *     will be encoded.
 *
 * @return {!goog.Uri} A reference to the Uri sent as a parameter.
 * @private
 */
goog.net.Jsonp.addPayloadToUri_ = function(payload, uri) {
  for (var name in payload) {
    // NOTE(user): Safari/1.3 doesn't have hasOwnProperty(). In that
    // case, we iterate over all properties as a very lame workaround.
    if (!payload.hasOwnProperty || payload.hasOwnProperty(name)) {
      uri.setParameterValues(name, payload[name]);
    }
  }
  return uri;
};


// WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING
//
// This class allows us (Google) to send data from non-Google and thus
// UNTRUSTED pages to our servers. Under NO CIRCUMSTANCES return
// anything sensitive, such as session or cookie specific data. Return
// only data that you want parties external to Google to have. Also
// NEVER use this method to send data from web pages to untrusted
// servers, or redirects to unknown servers (www.google.com/cache,
// /q=xx&btnl, /url, www.googlepages.com, etc.)
//
// WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING
