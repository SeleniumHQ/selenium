// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An interface for classes that connect a collection of HTML5
 * message-passing entities ({@link MessagePort}s, {@link Worker}s, and
 * {@link Window}s) and allow them to seamlessly communicate with one another.
 *
 * Conceptually, a PortNetwork is a collection of JS contexts, such as pages (in
 * or outside of iframes) or web workers. Each context has a unique name, and
 * each one can communicate with any of the others in the same network. This
 * communication takes place through a {@link goog.messaging.PortChannel} that
 * is retrieved via {#link goog.messaging.PortNetwork#dial}.
 *
 * One context (usually the main page) has a
 * {@link goog.messaging.PortOperator}, which is in charge of connecting each
 * context to each other context. All other contexts have
 * {@link goog.messaging.PortCaller}s which connect to the operator.
 *
 */

goog.provide('goog.messaging.PortNetwork');



/**
 * @interface
 */
goog.messaging.PortNetwork = function() {};


/**
 * Returns a message channel that communicates with the named context. If no
 * such port exists, an error will either be thrown immediately or after a round
 * trip with the operator, depending on whether this pool is the operator or a
 * caller.
 *
 * If context A calls dial('B') and context B calls dial('A'), the two
 * ports returned will be connected to one another.
 *
 * @param {string} name The name of the context to get.
 * @return {goog.messaging.MessageChannel} The channel communicating with the
 *     given context. This is either a {@link goog.messaging.PortChannel} or a
 *     decorator around a PortChannel, so it's safe to send {@link MessagePorts}
 *     across it. This will be disposed along with the PortNetwork.
 */
goog.messaging.PortNetwork.prototype.dial = function(name) {};


/**
 * The name of the service exported by the operator for creating a connection
 * between two callers.
 *
 * @type {string}
 * @const
 */
goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE = 'requestConnection';


/**
 * The name of the service exported by the callers for adding a connection to
 * another context.
 *
 * @type {string}
 * @const
 */
goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE = 'grantConnection';
