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
 * Configuration spec of a WebChannel (TODO(user): to complete):
 * 1) delivery: ordered, reliable, timeout
 * 2) HTTP: special headers, URI prefix, cross domains
 * 3) debugging: stats, logging
 * 4) pattern: full-duplex, server-client or client-server messaging
 * 5) QoS: priority, throttling,
 * 6) buffer management: batch size, delivery interval
 *
 * WebChannels are configured in the context of the containing
 * {@link WebChannelTransport}. The configuration parameters are specified
 * when a new instance of WebChannel is created via {@link WebChannelTransport}.
 *
 * @typedef {{
 *   ordered: (boolean|undefined),
 *   reliable: (boolean|undefined),
 *   timeoutMs: (number|undefined),
 *   priority: (number|undefined)
 * }}
 */
goog.net.WebChannel.Options;


/**
 * Types that are allowed as message data.
 *
 * @typedef {(ArrayBuffer|Blob|Object.<String>|Array)}
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
  goog.base(this, goog.net.WebChannel.EventType.MESSAGE);
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
  goog.base(this, goog.net.WebChannel.EventType.ERROR);
};
goog.inherits(goog.net.WebChannel.ErrorEvent, goog.events.Event);


/**
 * The error status.
 *
 * @type {!goog.net.WebChannel.ErrorStatus}
 */
goog.net.WebChannel.ErrorEvent.prototype.status;
