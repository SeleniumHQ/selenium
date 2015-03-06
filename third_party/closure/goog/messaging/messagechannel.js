// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An interface for asynchronous message-passing channels.
 *
 * This interface is useful for writing code in a message-passing style that's
 * independent of the underlying communication medium. It's also useful for
 * adding decorators that wrap message channels and add extra functionality on
 * top. For example, {@link goog.messaging.BufferedChannel} enqueues messages
 * until communication is established, while {@link goog.messaging.MultiChannel}
 * splits a single underlying channel into multiple virtual ones.
 *
 * Decorators should be passed their underlying channel(s) in the constructor,
 * and should assume that those channels are already connected. Decorators are
 * responsible for disposing of the channels they wrap when the decorators
 * themselves are disposed. Decorators should also follow the APIs of the
 * individual methods listed below.
 *
 */


goog.provide('goog.messaging.MessageChannel');



/**
 * @interface
 */
goog.messaging.MessageChannel = function() {};


/**
 * Initiates the channel connection. When this method is called, all the
 * information needed to connect the channel has to be available.
 *
 * Implementers should only require this method to be called if the channel
 * needs to be configured in some way between when it's created and when it
 * becomes active. Otherwise, the channel should be immediately active and this
 * method should do nothing but immediately call opt_connectCb.
 *
 * @param {Function=} opt_connectCb Called when the channel has been connected
 *     and is ready to use.
 */
goog.messaging.MessageChannel.prototype.connect = function(opt_connectCb) {};


/**
 * Gets whether the channel is connected.
 *
 * If {@link #connect} is not required for this class, this should always return
 * true. Otherwise, this should return true by the time the callback passed to
 * {@link #connect} has been called and always after that.
 *
 * @return {boolean} Whether the channel is connected.
 */
goog.messaging.MessageChannel.prototype.isConnected = function() {};


/**
 * Registers a service to be called when a message is received.
 *
 * Implementers shouldn't impose any restrictions on the service names that may
 * be registered. If some services are needed as control codes,
 * {@link goog.messaging.MultiMessageChannel} can be used to safely split the
 * channel into "public" and "control" virtual channels.
 *
 * @param {string} serviceName The name of the service.
 * @param {function((string|!Object))} callback The callback to process the
 *     incoming messages. Passed the payload. If opt_objectPayload is set, the
 *     payload is decoded and passed as an object.
 * @param {boolean=} opt_objectPayload If true, incoming messages for this
 *     service are expected to contain an object, and will be deserialized from
 *     a string automatically if necessary. It's the responsibility of
 *     implementors of this class to perform the deserialization.
 */
goog.messaging.MessageChannel.prototype.registerService =
    function(serviceName, callback, opt_objectPayload) {};


/**
 * Registers a service to be called when a message is received that doesn't
 * match any other services.
 *
 * @param {function(string, (string|!Object))} callback The callback to process
 *     the incoming messages. Passed the service name and the payload. Since
 *     some channels can pass objects natively, the payload may be either an
 *     object or a string.
 */
goog.messaging.MessageChannel.prototype.registerDefaultService =
    function(callback) {};


/**
 * Sends a message over the channel.
 *
 * @param {string} serviceName The name of the service this message should be
 *     delivered to.
 * @param {string|!Object} payload The value of the message. If this is an
 *     Object, it is serialized to a string before sending if necessary. It's
 *     the responsibility of implementors of this class to perform the
 *     serialization.
 */
goog.messaging.MessageChannel.prototype.send =
    function(serviceName, payload) {};
