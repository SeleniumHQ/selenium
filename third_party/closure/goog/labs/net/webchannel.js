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
 * (addition only):
 * 1. Adopt new Web APIs (mainly whatwg streams) and goog.net.streams.
 * 2. New programming models for cloud (on the server-side) may require
 *    new APIs to be defined.
 * 3. WebRTC DataChannel alignment
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
 * server. This object is mutable, and custom headers may be changed, removed,
 * or added during the runtime after a channel has been opened.
 *
 * initMessageHeaders: similar to messageHeaders, but any custom headers will
 * be sent only once when the channel is opened. Typical usage is to send
 * an auth header to the server, which only checks the auth header at the time
 * when the channel is opened.
 *
 * messageUrlParams: custom url query parameters to be added to every message
 * sent to the server. This object is mutable, and custom parameters may be
 * changed, removed or added during the runtime after a channel has been opened.
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
 * sendRawJson: whether to bypass v8 encoding of client-sent messages. Will be
 * deprecated after v9 wire protocol is introduced. Only safe to set if the
 * server is known to support this feature.
 *
 * httpSessionIdParam: the URL parameter name that contains the session id (
 * for sticky routing of HTTP requests). When this param is specified, a server
 * that supports this option will respond with an opaque session id as part of
 * the initial handshake (via the X-HTTP-Session-Id header); and all the
 * subsequent requests will contain the httpSessionIdParam. This option will
 * take precedence over any duplicated parameter specified with
 * messageUrlParams, whose value will be ignored.
 *
 * httpHeadersOverwriteParam: the URL parameter name to allow custom HTTP
 * headers to be overwritten as a URL param to bypass CORS preflight.
 * goog.net.rpc.HttpCors is used to encode the HTTP headers.
 *
 * backgroundChannelTest: whether to run the channel test (detecting networking
 * conditions) as a background process so the OPEN event will be fired sooner
 * to reduce the initial handshake delay. This option defaults to false now.
 * Eventually we may turn this flag on by default.
 *
 * @typedef {{
 *   messageHeaders: (!Object<string, string>|undefined),
 *   initMessageHeaders: (!Object<string, string>|undefined),
 *   messageUrlParams: (!Object<string, string>|undefined),
 *   clientProtocolHeaderRequired: (boolean|undefined),
 *   concurrentRequestLimit: (number|undefined),
 *   supportsCrossDomainXhr: (boolean|undefined),
 *   testUrl: (string|undefined),
 *   sendRawJson: (boolean|undefined),
 *   httpSessionIdParam: (string|undefined),
 *   httpHeadersOverwriteParam: (string|undefined),
 *   backgroundChannelTest: (boolean|undefined)
 * }}
 */
goog.net.WebChannel.Options;


/**
 * Types that are allowed as message data.
 *
 * Note that JS objects (sent by the client) can only have string encoded
 * values due to the limitation of the current wire protocol.
 *
 * Unicode strings (sent by the server) may or may not need be escaped, as
 * decided by the server.
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
 *
 * Summary of error debugging and reporting in WebChannel:
 *
 * Network Error
 * 1. By default the webchannel library will set the error status to
 *    NETWORK_ERROR when a channel has to be aborted or closed. NETWORK_ERROR
 *    may be recovered by the application by retrying and opening a new channel.
 * 2. There may be lost messages (not acked by the server) when a channel is
 *    aborted. Currently we don't have a public API to retrieve messages that
 *    are waiting to be acked on the client side. File a bug if you think it
 *    is useful to expose such an API.
 * 3. Details of why a channel fails are available via closure debug logs,
 *    and stats events (see webchannel/requeststats.js). Those are internal
 *    stats and are subject to change. File a bug if you think it's useful to
 *    version and expose such stats as part of the WebChannel API.
 *
 * Server Error
 * 1. SERVER_ERROR is intended to indicate a non-recoverable condition, e.g.
 *    when auth fails.
 * 2. We don't currently generate any such errors, because most of the time
 *    it's the responsibility of upper-layer frameworks or the application
 *    itself to indicate to the client why a webchannel has been failed
 *    by the server.
 * 3. When a channel is failed by the server explicitly, we still signal
 *    NETWORK_ERROR to the client. Explicit server failure may happen when the
 *    server does a fail-over, or becomes overloaded, or conducts a forced
 *    shutdown etc.
 * 4. We use some heuristic to decide if the network (aka cloud) is down
 *    v.s. the actual server is down.
 *
 *  RuntimeProperties.getLastStatusCode is a useful state that we expose to
 *  the client to indicate the HTTP response status code of the last HTTP
 *  request initiated by the WebChannel client library, for debugging
 *  purposes only.
 *
 * @enum {number}
 */
goog.net.WebChannel.ErrorStatus = {
  /** No error has occurred. */
  OK: 0,

  /** Communication to the server has failed. */
  NETWORK_ERROR: 1,

  /** The server fails to accept or process the WebChannel. */
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
 * The runtime properties of the WebChannel instance.
 *
 * This class is defined for debugging and monitoring purposes, as well as for
 * runtime functions that the application may choose to manage by itself.
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
 * For applications to query the current HTTP session id, sent by the server
 * during the initial handshake.
 *
 * @return {?string} the HTTP session id or null if no HTTP session is in use.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getHttpSessionId =
    goog.abstractMethod;


/**
 * This method generates an in-band commit request to the server, which will
 * ack the commit request as soon as all messages sent prior to this commit
 * request have been committed by the application.
 *
 * Committing a message has a stronger semantics than delivering a message
 * to the application. Detail spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * Timeout or cancellation is not supported and the application may have to
 * abort the channel if the commit-ack fails to arrive in time.
 *
 * @param {function()} callback The callback will be invoked once an
 * ack has been received for the current commit or any newly issued commit.
 */
goog.net.WebChannel.RuntimeProperties.prototype.commit = goog.abstractMethod;


/**
 * This method may be used by the application to recover from a peer failure
 * or to enable sender-initiated flow-control.
 *
 * Detail spec: https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * @return {number} The total number of messages that have not received
 * commit-ack from the server; or if no commit has been issued, the number
 * of messages that have not been delivered to the server application.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getNonAckedMessageCount =
    goog.abstractMethod;


/**
 * A low water-mark message count to notify the application when the
 * flow-control condition is cleared, that is, when the application is
 * able to send more messages.
 *
 * We expect the application to configure a high water-mark message count,
 * which is checked via getNonAckedMessageCount(). When the high water-mark
 * is exceeded, the application should install a callback via this method
 * to be notified when to start to send new messages.
 *
 * @param {number} count The low water-mark count. It is an error to pass
 * a non-positive value.
 * @param {!function()} callback The call back to notify the application
 * when NonAckedMessageCount is below the specified low water-mark count.
 * Any previously registered callback is cleared. This new callback will
 * be cleared once it has been fired, or when the channel is closed or aborted.
 */
goog.net.WebChannel.RuntimeProperties.prototype.notifyNonAckedMessageCount =
    goog.abstractMethod;


/**
 * This method registers a callback to handle the commit request sent
 * by the server. Commit protocol spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * @param {function(!Object)} callback The callback will take an opaque
 * commitId which needs be passed back to the server when an ack-commit
 * response is generated by the client application, via ackCommit().
 */
goog.net.WebChannel.RuntimeProperties.prototype.onCommit = goog.abstractMethod;


/**
 * This method is used by the application to generate an ack-commit response
 * for the given commitId. Commit protocol spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * @param {!Object} commitId The commitId which denotes the commit request
 * from the server that needs be ack'ed.
 */
goog.net.WebChannel.RuntimeProperties.prototype.ackCommit = goog.abstractMethod;


/**
 * @return {number} The last HTTP status code received by the channel.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getLastStatusCode =
    goog.abstractMethod;


/**
 * A request header to indicate to the server the messaging protocol
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


/**
 * A response header for the server to signal the wire-protocol that
 * the browser establishes with the server (or proxy), e.g. "spdy" (aka http/2)
 * "quic". This information avoids the need to use private APIs to decide if
 * HTTP requests are multiplexed etc.
 *
 * @type {string}
 */
goog.net.WebChannel.X_CLIENT_WIRE_PROTOCOL = 'X-Client-Wire-Protocol';


/**
 * A response header for the server to send back the HTTP session id as part of
 * the initial handshake. The value of the HTTP session id is opaque to the
 * WebChannel protocol.
 *
 * @type {string}
 */
goog.net.WebChannel.X_HTTP_SESSION_ID = 'X-HTTP-Session-Id';
