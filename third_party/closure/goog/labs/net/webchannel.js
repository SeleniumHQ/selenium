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
 */

goog.provide('goog.net.WebChannel');

goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.Listenable');
goog.require('goog.net.XmlHttpFactory');



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
 * @extends {goog.events.Listenable}
 */
goog.net.WebChannel = function() {};



/**
 * This interface defines a pluggable API to allow WebChannel runtime to support
 * customized algorithms in order to recover from transient failures such as
 * those failures caused by network or proxies (intermediaries).
 *
 * The algorithm may also choose to fail-fast, e.g. switch the client to some
 * offline mode.
 *
 * Extra measurements and logging could also be implemented in the custom
 * module, which has the full knowledge of all the state transitions
 * (due to failures).
 *
 * A default algorithm will be provided by the webchannel library itself. Custom
 * algorithms are expected to be tailored to specific client platforms or
 * networking environments, e.g. mobile, cellular network.
 *
 * @interface
 */
goog.net.WebChannel.FailureRecovery = function() {};


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
 * messageContentType: sent as initMessageHeaders via X-WebChannel-Content-Type,
 * to inform the server the MIME type of WebChannel messages.
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
 * sendRawJson: whether to bypass v8 encoding of client-sent messages.
 * This defaults to false now due to legacy servers. New applications should
 * always configure this option to true.
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
 * to reduce the initial handshake delay. This option defaults to true.
 * The actual background channel test is not fully implemented.
 *
 * forceLongPolling: whether to force long-polling from client to server.
 * This defaults to false. Long-polling may be necessary when a (MITM) proxy
 * is buffering data sent by the server.
 *
 * fastHandshake: enable true 0-RTT message delivery, including
 * leveraging QUIC 0-RTT (which requires GET to be used). This option
 * defaults to false. Note it is allowed to send messages before Open event is
 * received, after a channel has been opened. In order to enable 0-RTT,
 * messages will be encoded as part of URL and therefore there needs be a size
 * limit for those initial messages that are sent immediately as part of the
 * GET handshake request. With sendRawJson=true, this limit is currently set
 * to 4K chars and data beyond this limit will be buffered till the handshake
 * (1-RTT) finishes. With sendRawJson=false, it's up to the application
 * to limit the amount of data that is sent as part of the handshake.
 *
 * disableRedact: whether to disable logging redact. By default, redact is
 * enabled to remove any message payload or user-provided info
 * from closure logs.
 *
 * clientProfile: inform the server about the client profile to enable
 * customized configs that are optimized for certain clients or environments.
 * Currently this information is sent via X-WebChannel-Client-Profile header.
 *
 * internalChannelParams: the internal channel parameter name to allow
 * experimental channel configurations. Supported options include fastfail,
 * baseRetryDelayMs, retryDelaySeedMs, forwardChannelMaxRetries and
 * forwardChannelRequestTimeoutMs. Note that these options are subject to
 * change.
 *
 * xmlHttpFactory: allows the caller to override the factory used to create
 * XMLHttpRequest objects. This is introduced to disable CORS on firefox OS.
 *
 * requestRefreshThresholds: client-side thresholds that decide when to refresh
 * an underlying HTTP request, to limit memory consumption due to XHR buffering
 * or compression context. The client-side thresholds should be signficantly
 * smaller than the server-side thresholds. This allows the client to eliminate
 * any latency introduced by request refreshing, i.e. an RTT window during which
 * messages may be buffered on the server-side. Supported params include
 * totalBytesReceived, totalDurationMs.
 *
 * @typedef {{
 *   messageHeaders: (!Object<string, string>|undefined),
 *   initMessageHeaders: (!Object<string, string>|undefined),
 *   messageContentType: (string|undefined),
 *   messageUrlParams: (!Object<string, string>|undefined),
 *   clientProtocolHeaderRequired: (boolean|undefined),
 *   concurrentRequestLimit: (number|undefined),
 *   supportsCrossDomainXhr: (boolean|undefined),
 *   testUrl: (string|undefined),
 *   sendRawJson: (boolean|undefined),
 *   httpSessionIdParam: (string|undefined),
 *   httpHeadersOverwriteParam: (string|undefined),
 *   backgroundChannelTest: (boolean|undefined),
 *   forceLongPolling: (boolean|undefined),
 *   fastHandshake: (boolean|undefined),
 *   disableRedact: (boolean|undefined),
 *   clientProfile: (string|undefined),
 *   internalChannelParams: (!Object<string, boolean|number>|undefined),
 *   xmlHttpFactory: (!goog.net.XmlHttpFactory|undefined),
 *   requestRefreshThresholds: (!Object<string, number>|undefined),
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
 * @typedef {(!ArrayBuffer|!Blob|!Object<string, !Object|string>|!Array|string)}
 */
goog.net.WebChannel.MessageData;


/**
 * Open the WebChannel against the URI specified in the constructor.
 */
goog.net.WebChannel.prototype.open = goog.abstractMethod;


/**
 * Close the WebChannel.
 *
 * This is a full close (shutdown) with no guarantee of FIFO delivery in respect
 * to any in-flight messages sent to the server.
 *
 * If you need such a guarantee, see the Half the halfClose() method.
 */
goog.net.WebChannel.prototype.close = goog.abstractMethod;


/**
 * Half-close the WebChannel.
 *
 * Half-close semantics:
 * 1. delivered as a regular message in FIFO programming order
 * 2. the server is expected to return a half-close too (with or without
 *    application involved), which will trigger a full close (shutdown)
 *    on the client side
 * 3. for now, the half-close event defined for server-initiated
 *    half-close is not exposed to the client application
 * 4. a client-side half-close may be triggered internally when the client
 *    receives a half-close from the server; and the client is expected to
 *    do a full close after the half-close is acked and delivered
 *    on the server-side.
 * 5. Full close is always a forced one. See the close() method.
 *
 * New messages sent after halfClose() will be dropped.
 *
 * NOTE: This is not yet implemented, and will throw an exception if called.
 */
goog.net.WebChannel.prototype.halfClose = goog.abstractMethod;


/**
 * Sends a message to the server that maintains the other end point of
 * the WebChannel.
 *
 * O-RTT behavior:
 * 1. messages sent before open() is called will always be delivered as
 *    part of the handshake, i.e. with 0-RTT
 * 2. messages sent after open() is called but before the OPEN event
 *    is received will be delivered as part of the handshake if
 *    send() is called from the same execution context as open().
 * 3. otherwise, those messages will be buffered till the handshake
 *    is completed (which will fire the OPEN event).
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

  /**
   * Dispatched when the channel is aborted due to errors.
   *
   * For backward compatibility reasons, a CLOSE event will also be
   * dispatched, following the ERROR event, which indicates that the channel
   * has been completely shutdown .
   */
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
 * The metadata key when the MESSAGE event represents a metadata message.
 *
 * @type {string|undefined}
 */
goog.net.WebChannel.MessageEvent.prototype.metadataKey;


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
 *  See WebChannel.Options.backChannelFailureRecovery and
 *  WebChannel.FailureRecovery to install a custom failure-recovery algorithm.
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
 * @return {number} The number of requests (for sending messages to the server)
 * that are pending. If this number is approaching the value of
 * getConcurrentRequestLimit(), client-to-server message delivery may experience
 * a higher latency.
 */
goog.net.WebChannel.RuntimeProperties.prototype.getPendingRequestCount =
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
 * Experimental API.
 *
 * This method generates an in-band commit request to the server, which will
 * ack the commit request as soon as all messages sent prior to this commit
 * request have been committed by the application.
 *
 * Committing a message has a stronger semantics than delivering a message
 * to the application. Detail spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * Timeout or cancellation is not supported and the application is expected to
 * abort the channel if the commit-ack fails to arrive in time.
 *
 * ===
 *
 * This is currently implemented only in the client layer and the commit
 * callback will be invoked after all the pending client-sent messages have been
 * delivered by the server-side webchannel end-point. This semantics is
 * different and weaker than what's required for end-to-end ack which requires
 * the server application to ack the in-order delivery of messages that are sent
 * before the commit request is issued.
 *
 * Commit should only be called after the channel open event is received.
 * Duplicated commits are allowed and only the last callback is guaranteed.
 * Commit called after the channel has been closed will be ignored.
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
 * This is not yet implemented.
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
 * This is not yet implemented.
 *
 * @param {number} count The low water-mark count. It is an error to pass
 * a non-positive value.
 * @param {function()} callback The call back to notify the application
 * when NonAckedMessageCount is below the specified low water-mark count.
 * Any previously registered callback is cleared. This new callback will
 * be cleared once it has been fired, or when the channel is closed or aborted.
 */
goog.net.WebChannel.RuntimeProperties.prototype.notifyNonAckedMessageCount =
    goog.abstractMethod;


/**
 * Experimental API.
 *
 * This method registers a callback to handle the commit request sent
 * by the server. Commit protocol spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * This is not yet implemented.
 *
 * @param {function(!Object)} callback The callback will take an opaque
 * commitId which needs be passed back to the server when an ack-commit
 * response is generated by the client application, via ackCommit().
 */
goog.net.WebChannel.RuntimeProperties.prototype.onCommit = goog.abstractMethod;


/**
 * Experimental API.
 *
 * This method is used by the application to generate an ack-commit response
 * for the given commitId. Commit protocol spec:
 * https://github.com/bidiweb/webchannel/blob/master/commit.md
 *
 * This is not yet implemented.
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
 * Enum to indicate the current recovery state.
 *
 * @enum {string}
 */
goog.net.WebChannel.FailureRecovery.State = {
  /** Initial state. */
  INIT: 'init',

  /** Once a failure has been detected. */
  FAILED: 'failed',

  /**
   * Once a recovery operation has been issued, e.g. a new request to resume
   * communication.
   */
  RECOVERING: 'recovering',

  /** The channel has been closed.  */
  CLOSED: 'closed'
};


/**
 * Enum to indicate different failure conditions as detected by the webchannel
 * runtime.
 *
 * This enum is to be used only between the runtime and FailureRecovery module,
 * and new states are expected to be introduced in future.
 *
 * @enum {string}
 */
goog.net.WebChannel.FailureRecovery.FailureCondition = {
  /**
   * The HTTP response returned a non-successful http status code.
   */
  HTTP_ERROR: 'http_error',

  /**
   * The request was aborted.
   */
  ABORT: 'abort',

  /**
   * The request timed out.
   */
  TIMEOUT: 'timeout',

  /**
   * Exception was thrown while processing the request/response.
   */
  EXCEPTION: 'exception'
};


/**
 * @return {!goog.net.WebChannel.FailureRecovery.State} the current state,
 * mainly for debugging use.
 */
goog.net.WebChannel.FailureRecovery.prototype.getState = goog.abstractMethod;


/**
 * This method is for WebChannel runtime to set the current failure condition
 * and to provide a callback for the algorithm to signal to the runtime
 * when it is time to issue a recovery operation, e.g. a new request to the
 * server.
 *
 * Supported transitions include:
 *   INIT->FAILED
 *   FAILED->FAILED (re-entry ok)
 *   RECOVERY->FAILED.
 *
 * Ignored if state == CLOSED.
 *
 * Advanced implementations are expected to track all the state transitions
 * and their timestamps for monitoring purposes.
 *
 * @param {!goog.net.WebChannel.FailureRecovery.FailureCondition} failure The
 * new failure condition generated by the WebChannel runtime.
 * @param {!Function} operation The callback function to the WebChannel
 * runtime to issue a recovery operation, e.g. a new request. E.g. the default
 * recovery algorithm will issue timeout-based recovery operations.
 * Post-condition for the callback: state transition to RECOVERING.
 *
 * @return {!goog.net.WebChannel.FailureRecovery.State} The updated state
 * as decided by the failure recovery module. Upon a recoverable failure event,
 * the state is transitioned to RECOVERING; or the state is transitioned to
 * FAILED which indicates a fail-fast decision for the runtime to execute.
 */
goog.net.WebChannel.FailureRecovery.prototype.setFailure = goog.abstractMethod;


/**
 * The Webchannel runtime needs call this method when webchannel is closed or
 * aborted.
 *
 * Once the instance is closed, any access to the instance will be a no-op.
 */
goog.net.WebChannel.FailureRecovery.prototype.close = goog.abstractMethod;


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


/**
 * A response header for the server to send back any initial response data as a
 * header to avoid any possible buffering by an intermediary, which may
 * be undesired during the handshake.
 *
 * @type {string}
 */
goog.net.WebChannel.X_HTTP_INITIAL_RESPONSE = 'X-HTTP-Initial-Response';


/**
 * A request header for specifying the content-type of WebChannel messages,
 * e.g. application-defined JSON encoding styles. Currently this header
 * is sent by the client via initMessageHeaders when the channel is opened.
 *
 * @type {string}
 */
goog.net.WebChannel.X_WEBCHANNEL_CONTENT_TYPE = 'X-WebChannel-Content-Type';


/**
 * A request header for specifying the client profile in order to apply
 * customized config params on the server side, e.g. timeouts.
 *
 * @type {string}
 */
goog.net.WebChannel.X_WEBCHANNEL_CLIENT_PROFILE = 'X-WebChannel-Client-Profile';
