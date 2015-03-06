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
 * @fileoverview The API spec for the WebChannel messaging library.
 *
 * Similar to HTML5 WebSocket and Closure BrowserChannel, WebChannel
 * offers an abstraction for point-to-point socket-like communication between
 * a browser client and a remote origin.
 *
 * WebChannels are created via <code>WebChannel</code>. Multiple WebChannels
 * may be multiplexed over the same WebChannelTransport, which represents
 * the underlying physical connectivity over standard wire protocols
 * such as HTTP and SPDY.
 *
 * A WebChannels in turn represents a logical communication channel between
 * the client and server end point. A WebChannel remains open for
 * as long as the client or server end-point allows.
 *
 * Messages may be delivered in-order or out-of-order, reliably or unreliably
 * over the same WebChannel. Message delivery guarantees of a WebChannel is
 * to be specified by the application code; and the choice of the
 * underlying wire protocols is completely transparent to the API users.
 *
 * Client-to-client messaging via WebRTC based transport may also be support
 * via the same WebChannel API in future.
 *
 * Note that we have no immediate plan to move this API out of labs. While
 * the implementation is production ready, the API is subject to change
 * (addition):
 * 1. Completely new W3C APIs for Web messaging may emerge in near future.
 * 2. New programming models for cloud (on the server-side) may require
 *    new APIs to be defined.
 * 3. WebRTC DataChannel alignment
 * Lastly, we also want to white-list all internal use cases. As a general rule,
 * we expect most applications to rely on stateless/RPC services.
 *
 */

goog.provide('goog.net.WebChannel');

goog.require('goog.events');
goog.require('goog.events.Event');



/**
 * A WebChannel represents a logical bi-directional channel over which the
 * client communicates with a remote server that holds the other endpoint
 * of the channel. A WebChannel is always created in the context of a shared
 * {@link WebChannelTransport} instance. It is up to the underlying client-side
 * and server-side implementations to decide how or when multiplexing is
 * to be enabled.
 *
 * @interface
 * @extends {EventTarget}
 */
goog.net.WebChannel = function() {};


/**
 * Configuration spec for newly created WebChannel instances.
 *
 * WebChannels are configured in the context of the containing
 * {@link WebChannelTransport}. The configuration parameters are specified
 * when a new instance of WebChannel is created via {@link WebChannelTransport}.
 *
 * messageHeaders: custom headers to be added to every message sent to the
 * server.
 *
 * messageUrlParams: custom url query parameters to be added to every message
 * sent to the server.
 *
 * clientProtocolHeaderRequired: whether a special header should be added to
 * each message so that the server can dispatch webchannel messages without
 * knowing the URL path prefix. Defaults to false.
 *
 * concurrentRequestLimit: the maximum number of in-flight HTTP requests allowed
 * when SPDY is enabled. Currently we only detect SPDY in Chrome.
 * This parameter defaults to 10. When SPDY is not enabled, this parameter
 * will have no effect.
 *
 * supportsCrossDomainXhr: setting this to true to allow the use of sub-domains
 * (as configured by the server) to send XHRs with the CORS withCredentials
 * bit set to true.
 *
 * testUrl: the test URL for detecting connectivity during the initial
 * handshake. This parameter defaults to "/<channel_url>/test".
 *
 *
 * @typedef {{
 *   messageHeaders: (!Object<string, string>|undefined),
 *   messageUrlParams: (!Object<string, string>|undefined),
 *   clientProtocolHeaderRequired: (boolean|undefined),
 *   concurrentRequestLimit: (number|undefined),
 *   supportsCrossDomainXhr: (boolean|undefined),
 *   testUrl: (string|undefined)
 * }}
 */
goog.net.WebChannel.Options;


/**
 * Types that are allowed as message data.
 *
 * @typedef {(ArrayBuffer|Blob|Object<string, string>|Array)}
 */
goog.net.WebChannel.MessageData;


/**
 * Open the WebChannel against the URI specified in the constructor.
 */
goog.net.WebChannel.prototype.open = goog.abstractMethod;


/**
 * Close the WebChannel.
 */
goog.net.WebChannel.prototype.close = goog.abstractMethod;


/**
 * Sends a message to the server that maintains the other end point of
 * the WebChannel.
 *
 * @param {!goog.net.WebChannel.MessageData} message The message to send.
 */
goog.net.WebChannel.prototype.send = goog.abstractMethod;


/**
 * Common events fired by WebChannels.
 * @enum {string}
 */
goog.net.WebChannel.EventType = {
  /** Dispatched when the channel is opened. */
  OPEN: goog.events.getUniqueId('open'),

  /** Dispatched when the channel is closed. */
  CLOSE: goog.events.getUniqueId('close'),

  /** Dispatched when the channel is aborted due to errors. */
  ERROR: goog.events.getUniqueId('error'),

  /** Dispatched when the channel has received a new message. */
  MESSAGE: goog.events.getUniqueId('message')
};



/**
 * The event interface for the MESSAGE event.
 *
 * @constructor
 * @extends {goog.events.Event}
 */
goog.net.WebChannel.MessageEvent = function() {
  goog.net.WebChannel.MessageEvent.base(
      this, 'constructor', goog.net.WebChannel.EventType.MESSAGE);
};
goog.inherits(goog.net.WebChannel.MessageEvent, goog.events.Event);


/**
 * The content of the message received from the server.
 *
 * @type {!goog.net.WebChannel.MessageData}
 */
goog.net.WebChannel.MessageEvent.prototype.data;


/**
 * WebChannel level error conditions.
 * @enum {number}
 */
goog.net.WebChannel.ErrorStatus = {
  /** No error has occurred. */
  OK: 0,

  /** Communication to the server has failed. */
  NETWORK_ERROR: 1,

  /** The server fails to accept the WebChannel. */
  SERVER_ERROR: 2
};



/**
 * The event interface for the ERROR event.
 *
 * @constructor
 * @extends {goog.events.Event}
 */
goog.net.WebChannel.ErrorEvent = function() {
  goog.net.WebChannel.ErrorEvent.base(
      this, 'constructor', goog.net.WebChannel.EventType.ERROR);
};
goog.inherits(goog.net.WebChannel.ErrorEvent, goog.events.Event);


/**
 * The error status.
 *
 * @type {!goog.net.WebChannel.ErrorStatus}
 */
goog.net.WebChannel.ErrorEvent.prototype.status;


/**
 * @return {!goog.net.WebChannel.RuntimeProperties} The runtime properties
 * of the WebChannel instance.
 */
goog.net.WebChannel.prototype.getRuntimeProperties = goog.abstractMethod;



/**
 * The readonly runtime properties of the WebChannel instance.
 *
 * This class is defined for debugging and monitoring purposes, and for
 * optimization functions that the application may choose to manage by itself.
 *
 * @interface
 */
goog.net.WebChannel.RuntimeProperties = function() {};


/**
 * @return {number} The effective limit for the number of concurrent HTTP
 * requests that are allowed to be made for sending messages from the client
 * to the server. When SPDY is not enabled, this limit will be one.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getConcurrentRequestLimit =
    goog.abstractMethod;


/**
 * For applications that need support multiple channels (e.g. from
 * different tabs) to the same origin, use this method to decide if SPDY is
 * enabled and therefore it is safe to open multiple channels.
 *
 * If SPDY is disabled, the application may choose to limit the number of active
 * channels to one or use other means such as sub-domains to work around
 * the browser connection limit.
 *
 * @return {boolean} Whether SPDY is enabled for the origin against which
 * the channel is created.
 */
goog.net.WebChannel.RuntimeProperties.prototype.isSpdyEnabled =
    goog.abstractMethod;


/**
 * This method may be used by the application to stop ack of received messages
 * as a means of enabling or disabling flow-control on the server-side.
 *
 * @param {boolean} enabled If true, enable flow-control behavior on the
 * server side. Setting it to false will cancel ay previous enabling action.
 */
goog.net.WebChannel.RuntimeProperties.prototype.setServerFlowControl =
    goog.abstractMethod;


/**
 * This method may be used by the application to throttle the rate of outgoing
 * messages, as a means of sender initiated flow-control.
 *
 * @return {number} The total number of messages that have not received
 * ack from the server and therefore remain in the buffer.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getNonAckedMessageCount =
    goog.abstractMethod;


/**
 * A special header to indicate to the server what messaging protocol
 * each HTTP message is speaking.
 *
 * @type {string}
 */
goog.net.WebChannel.X_CLIENT_PROTOCOL = 'X-Client-Protocol';


/**
 * The value for x-client-protocol when the messaging protocol is WebChannel.
 *
 * @type {string}
 */
goog.net.WebChannel.X_CLIENT_PROTOCOL_WEB_CHANNEL = 'webchannel';
