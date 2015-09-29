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
 * @fileoverview A shared interface for WebChannelBase and BaseTestChannel.
 *
 * @visibility {:internal}
 */


goog.provide('goog.labs.net.webChannel.Channel');



/**
 * Shared interface between Channel and TestChannel to support callbacks
 * between WebChannelBase and BaseTestChannel and between Channel and
 * ChannelRequest.
 *
 * @interface
 */
goog.labs.net.webChannel.Channel = function() {};


goog.scope(function() {
var Channel = goog.labs.net.webChannel.Channel;


/**
 * Determines whether to use a secondary domain when the server gives us
 * a host prefix. This allows us to work around browser per-domain
 * connection limits.
 *
 * If you need to use secondary domains on different browsers and IE10,
 * you have two choices:
 *     1) If you only care about browsers that support CORS
 *        (https://developer.mozilla.org/en-US/docs/HTTP_access_control), you
 *        can use {@link #setSupportsCrossDomainXhrs} and set the appropriate
 *        CORS response headers on the server.
 *     2) Or, override this method in a subclass, and make sure that those
 *        browsers use some messaging mechanism that works cross-domain (e.g
 *        iframes and window.postMessage).
 *
 * @return {boolean} Whether to use secondary domains.
 * @see http://code.google.com/p/closure-library/issues/detail?id=339
 */
Channel.prototype.shouldUseSecondaryDomains = goog.abstractMethod;


/**
 * Called when creating an XhrIo object.  Override in a subclass if
 * you need to customize the behavior, for example to enable the creation of
 * XHR's capable of calling a secondary domain. Will also allow calling
 * a secondary domain if withCredentials (CORS) is enabled.
 * @param {?string} hostPrefix The host prefix, if we need an XhrIo object
 *     capable of calling a secondary domain.
 * @return {!goog.net.XhrIo} A new XhrIo object.
 */
Channel.prototype.createXhrIo = goog.abstractMethod;


/**
 * Callback from ChannelRequest that indicates a request has completed.
 * @param {!goog.labs.net.webChannel.ChannelRequest} request
 *     The request object.
 */
Channel.prototype.onRequestComplete = goog.abstractMethod;


/**
 * Returns whether the channel is closed
 * @return {boolean} true if the channel is closed.
 */
Channel.prototype.isClosed = goog.abstractMethod;


/**
 * Callback from ChannelRequest for when new data is received
 * @param {goog.labs.net.webChannel.ChannelRequest} request
 *     The request object.
 * @param {string} responseText The text of the response.
 */
Channel.prototype.onRequestData = goog.abstractMethod;


/**
 * Gets whether this channel is currently active. This is used to determine the
 * length of time to wait before retrying. This call delegates to the handler.
 * @return {boolean} Whether the channel is currently active.
 */
Channel.prototype.isActive = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Gets the Uri used for the connection that sends data to the server.
 * @param {string} path The path on the host.
 * @return {goog.Uri} The forward channel URI.
 */
Channel.prototype.getForwardChannelUri = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Gets the Uri used for the connection that receives data from the server.
 * @param {?string} hostPrefix The host prefix.
 * @param {string} path The path on the host.
 * @return {goog.Uri} The back channel URI.
 */
Channel.prototype.getBackChannelUri = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Allows the handler to override a host prefix provided by the server.  Will
 * be called whenever the channel has received such a prefix and is considering
 * its use.
 * @param {?string} serverHostPrefix The host prefix provided by the server.
 * @return {?string} The host prefix the client should use.
 */
Channel.prototype.correctHostPrefix = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Creates a data Uri applying logic for secondary hostprefix, port
 * overrides, and versioning.
 * @param {?string} hostPrefix The host prefix.
 * @param {string} path The path on the host (may be absolute or relative).
 * @param {number=} opt_overridePort Optional override port.
 * @return {goog.Uri} The data URI.
 */
Channel.prototype.createDataUri = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Callback from TestChannel for when the channel is finished.
 * @param {goog.labs.net.webChannel.BaseTestChannel} testChannel
 *     The TestChannel.
 * @param {boolean} useChunked  Whether we can chunk responses.
 */
Channel.prototype.testConnectionFinished = goog.abstractMethod;


/**
 * Not needed for testchannel.
 *
 * Callback from TestChannel for when the channel has an error.
 * @param {goog.labs.net.webChannel.BaseTestChannel} testChannel
 *     The TestChannel.
 * @param {goog.labs.net.webChannel.ChannelRequest.Error} errorCode
 *     The error code of the failure.
 */
Channel.prototype.testConnectionFailure = goog.abstractMethod;


/**
 * Not needed for testchannel.
 * Gets the result of previous connectivity tests.
 *
 * @return {!goog.labs.net.webChannel.ConnectionState} The connectivity state.
 */
Channel.prototype.getConnectionState = goog.abstractMethod;
});  // goog.scope
