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
 * @fileoverview Transport support for WebChannel.
 *
 * The <code>WebChannelTransport</code> implementation serves as the factory
 * for <code>WebChannel</code>, which offers an abstraction for
 * point-to-point socket-like communication similar to what BrowserChannel
 * or HTML5 WebSocket offers.
 *
 */

goog.provide('goog.net.WebChannelTransport');



/**
 * A WebChannelTransport instance represents a shared context of logical
 * connectivity between a browser client and a remote origin.
 *
 * Over a single WebChannelTransport instance, multiple WebChannels may be
 * created against different URLs, which may all share the same
 * underlying connectivity (i.e. TCP connection) whenever possible.
 *
 * When multi-domains are supported, such as CORS, multiple origins may be
 * supported over a single WebChannelTransport instance at the same time.
 *
 * Sharing between different window contexts such as tabs is not addressed
 * by WebChannelTransport. Applications may choose HTML5 shared workers
 * or other techniques to access the same transport instance
 * across different window contexts.
 *
 * @interface
 */
goog.net.WebChannelTransport = function() {};


/**
 * The client version. This integer value will be passed to the server
 * when a channel is opened to inform the server the client "capabilities".
 *
 * Wire protocol version is a different concept and is internal to the
 * transport implementation.
 *
 * @const
 * @type {number}
 */
goog.net.WebChannelTransport.CLIENT_VERSION = 20;


/**
 * Create a new WebChannel instance.
 *
 * The new WebChannel is to be opened against the server-side resource
 * as specified by the given URL. See {@link goog.net.WebChannel} for detailed
 * semantics.
 *
 * @param {string} url The URL path for the new WebChannel instance.
 * @param {!goog.net.WebChannel.Options=} opt_options Configuration for the
 *     new WebChannel instance. The configuration object is reusable after
 *     the new channel instance is created.
 * @return {!goog.net.WebChannel} the newly created WebChannel instance.
 */
goog.net.WebChannelTransport.prototype.createWebChannel = goog.abstractMethod;
