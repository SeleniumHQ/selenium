// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of goog.messaging.RespondingChannel, which wraps a
 * MessageChannel and allows the user to get the response from the services.
 *
 */


goog.provide('goog.messaging.RespondingChannel');

goog.require('goog.Disposable');
goog.require('goog.log');
goog.require('goog.messaging.MultiChannel');



/**
 * Creates a new RespondingChannel wrapping a single MessageChannel.
 * @param {goog.messaging.MessageChannel} messageChannel The messageChannel to
 *     to wrap and allow for responses. This channel must not have any existing
 *     services registered. All service registration must be done through the
 *     {@link RespondingChannel#registerService} api instead. The other end of
 *     channel must also be a RespondingChannel.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.messaging.RespondingChannel = function(messageChannel) {
  goog.messaging.RespondingChannel.base(this, 'constructor');

  /**
   * The message channel wrapped in a MultiChannel so we can send private and
   * public messages on it.
   * @type {goog.messaging.MultiChannel}
   * @private
   */
  this.messageChannel_ = new goog.messaging.MultiChannel(messageChannel);

  /**
   * Map of invocation signatures to function callbacks. These are used to keep
   * track of the asyncronous service invocations so the result of a service
   * call can be passed back to a callback in the calling frame.
   * @type {Object<number, function(Object)>}
   * @private
   */
  this.sigCallbackMap_ = {};

  /**
   * The virtual channel to send private messages on.
   * @type {goog.messaging.MultiChannel.VirtualChannel}
   * @private
   */
  this.privateChannel_ = this.messageChannel_.createVirtualChannel(
      goog.messaging.RespondingChannel.PRIVATE_CHANNEL_);

  /**
   * The virtual channel to send public messages on.
   * @type {goog.messaging.MultiChannel.VirtualChannel}
   * @private
   */
  this.publicChannel_ = this.messageChannel_.createVirtualChannel(
      goog.messaging.RespondingChannel.PUBLIC_CHANNEL_);

  this.privateChannel_.registerService(
      goog.messaging.RespondingChannel.CALLBACK_SERVICE_,
      goog.bind(this.callbackServiceHandler_, this),
      true);
};
goog.inherits(goog.messaging.RespondingChannel, goog.Disposable);


/**
 * The name of the method invocation callback service (used internally).
 * @type {string}
 * @const
 * @private
 */
goog.messaging.RespondingChannel.CALLBACK_SERVICE_ = 'mics';


/**
 * The name of the channel to send private control messages on.
 * @type {string}
 * @const
 * @private
 */
goog.messaging.RespondingChannel.PRIVATE_CHANNEL_ = 'private';


/**
 * The name of the channel to send public messages on.
 * @type {string}
 * @const
 * @private
 */
goog.messaging.RespondingChannel.PUBLIC_CHANNEL_ = 'public';


/**
 * The next signature index to save the callback against.
 * @type {number}
 * @private
 */
goog.messaging.RespondingChannel.prototype.nextSignatureIndex_ = 0;


/**
 * Logger object for goog.messaging.RespondingChannel.
 * @type {goog.log.Logger}
 * @private
 */
goog.messaging.RespondingChannel.prototype.logger_ =
    goog.log.getLogger('goog.messaging.RespondingChannel');


/**
 * Gets a random number to use for method invocation results.
 * @return {number} A unique random signature.
 * @private
 */
goog.messaging.RespondingChannel.prototype.getNextSignature_ = function() {
  return this.nextSignatureIndex_++;
};


/** @override */
goog.messaging.RespondingChannel.prototype.disposeInternal = function() {
  goog.dispose(this.messageChannel_);
  delete this.messageChannel_;
  // Note: this.publicChannel_ and this.privateChannel_ get disposed by
  //     this.messageChannel_
  delete this.publicChannel_;
  delete this.privateChannel_;
};


/**
 * Sends a message over the channel.
 * @param {string} serviceName The name of the service this message should be
 *     delivered to.
 * @param {string|!Object} payload The value of the message. If this is an
 *     Object, it is serialized to a string before sending if necessary.
 * @param {function(?Object)} callback The callback invoked with
 *     the result of the service call.
 */
goog.messaging.RespondingChannel.prototype.send = function(
    serviceName,
    payload,
    callback) {

  var signature = this.getNextSignature_();
  this.sigCallbackMap_[signature] = callback;

  var message = {};
  message['signature'] = signature;
  message['data'] = payload;

  this.publicChannel_.send(serviceName, message);
};


/**
 * Receives the results of the peer's service results.
 * @param {!Object|string} message The results from the remote service
 *     invocation.
 * @private
 */
goog.messaging.RespondingChannel.prototype.callbackServiceHandler_ = function(
    message) {

  var signature = message['signature'];
  var result = message['data'];

  if (signature in this.sigCallbackMap_) {
    var callback = /** @type {function(Object)} */ (this.sigCallbackMap_[
        signature]);
    callback(result);
    delete this.sigCallbackMap_[signature];
  } else {
    goog.log.warning(this.logger_, 'Received signature is invalid');
  }
};


/**
 * Registers a service to be called when a message is received.
 * @param {string} serviceName The name of the service.
 * @param {function(!Object)} callback The callback to process the
 *     incoming messages. Passed the payload.
 */
goog.messaging.RespondingChannel.prototype.registerService = function(
    serviceName, callback) {
  this.publicChannel_.registerService(
      serviceName,
      goog.bind(this.callbackProxy_, this, callback),
      true);
};


/**
 * A intermediary proxy for service callbacks to be invoked and return their
 * their results to the remote caller's callback.
 * @param {function((string|!Object))} callback The callback to process the
 *     incoming messages. Passed the payload.
 * @param {!Object|string} message The message containing the signature and
 *     the data to invoke the service callback with.
 * @private
 */
goog.messaging.RespondingChannel.prototype.callbackProxy_ = function(
    callback, message) {

  var resultMessage = {};
  resultMessage['data'] = callback(message['data']);
  resultMessage['signature'] = message['signature'];
  // The callback invoked above may have disposed the channel so check if it
  // exists.
  if (this.privateChannel_) {
    this.privateChannel_.send(
        goog.messaging.RespondingChannel.CALLBACK_SERVICE_,
        resultMessage);
  }
};
