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
 * @fileoverview A wrapper for asynchronous message-passing channels that buffer
 * their output until both ends of the channel are connected.
 *
 */

goog.provide('goog.messaging.BufferedChannel');

goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.debug.Error');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.messaging.MessageChannel');
goog.require('goog.messaging.MultiChannel');



/**
 * Creates a new BufferedChannel, which operates like its underlying channel
 * except that it buffers calls to send until it receives a message from its
 * peer claiming that the peer is ready to receive.  The peer is also expected
 * to be a BufferedChannel, though this is not enforced.
 *
 * @param {!goog.messaging.MessageChannel} messageChannel The MessageChannel
 *     we're wrapping.
 * @param {number=} opt_interval Polling interval for sending ready
 *     notifications to peer, in ms.  Default is 50.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.messaging.MessageChannel};
 */
goog.messaging.BufferedChannel = function(messageChannel, opt_interval) {
  goog.Disposable.call(this);

  /**
   * Buffer of messages to be sent when the channel's peer is ready.
   *
   * @type {Array.<Object>}
   * @private
   */
  this.buffer_ = [];

  /**
   * Channel dispatcher wrapping the underlying delegate channel.
   *
   * @type {!goog.messaging.MultiChannel}
   * @private
   */
  this.multiChannel_ = new goog.messaging.MultiChannel(messageChannel);

  /**
   * Virtual channel for carrying the user's messages.
   *
   * @type {!goog.messaging.MessageChannel}
   * @private
   */
  this.userChannel_ = this.multiChannel_.createVirtualChannel(
      goog.messaging.BufferedChannel.USER_CHANNEL_NAME_);

  /**
   * Virtual channel for carrying control messages for BufferedChannel.
   *
   * @type {!goog.messaging.MessageChannel}
   * @private
   */
  this.controlChannel_ = this.multiChannel_.createVirtualChannel(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_);

  /**
   * Timer for the peer ready ping loop.
   *
   * @type {goog.Timer}
   * @private
   */
  this.timer_ = new goog.Timer(
      opt_interval || goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);

  this.timer_.start();
  goog.events.listen(
      this.timer_, goog.Timer.TICK, this.sendReadyPing_, false, this);

  this.controlChannel_.registerService(
      goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_,
      goog.bind(this.setPeerReady_, this));
};
goog.inherits(goog.messaging.BufferedChannel, goog.Disposable);


/**
 * Default polling interval (in ms) for setPeerReady_ notifications.
 *
 * @type {number}
 * @const
 * @private
 */
goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_ = 50;


/**
 * The name of the private service which handles peer ready pings.  The
 * service registered with this name is bound to this.setPeerReady_, an internal
 * part of BufferedChannel's implementation that clients should not send to
 * directly.
 *
 * @type {string}
 * @const
 * @private
 */
goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_ = 'setPeerReady_';


/**
 * The name of the virtual channel along which user messages are sent.
 *
 * @type {string}
 * @const
 * @private
 */
goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ = 'user';


/**
 * The name of the virtual channel along which internal control messages are
 * sent.
 *
 * @type {string}
 * @const
 * @private
 */
goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ = 'control';


/** @override */
goog.messaging.BufferedChannel.prototype.connect = function(opt_connectCb) {
  if (opt_connectCb) {
    opt_connectCb();
  }
};


/** @override */
goog.messaging.BufferedChannel.prototype.isConnected = function() {
  return true;
};


/**
 * @return {boolean} Whether the channel's peer is ready.
 */
goog.messaging.BufferedChannel.prototype.isPeerReady = function() {
  return this.peerReady_;
};


/**
 * Logger.
 *
 * @type {goog.debug.Logger}
 * @const
 * @private
 */
goog.messaging.BufferedChannel.prototype.logger_ = goog.debug.Logger.getLogger(
    'goog.messaging.bufferedchannel');


/**
 * Handles one tick of our peer ready notification loop.  This entails sending a
 * ready ping to the peer and shutting down the loop if we've received a ping
 * ourselves.
 *
 * @private
 */
goog.messaging.BufferedChannel.prototype.sendReadyPing_ = function() {
  try {
    this.controlChannel_.send(
        goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_,
        /* payload */ this.isPeerReady() ? '1' : '');
  } catch (e) {
    this.timer_.stop();  // So we don't keep calling send and re-throwing.
    throw e;
  }
};


/**
  * Whether or not the peer channel is ready to receive messages.
  *
  * @type {boolean}
  * @private
  */
goog.messaging.BufferedChannel.prototype.peerReady_;


/** @override */
goog.messaging.BufferedChannel.prototype.registerService = function(
    serviceName, callback, opt_objectPayload) {
  this.userChannel_.registerService(serviceName, callback, opt_objectPayload);
};


/** @override */
goog.messaging.BufferedChannel.prototype.registerDefaultService = function(
    callback) {
  this.userChannel_.registerDefaultService(callback);
};


/**
 * Send a message over the channel.  If the peer is not ready, the message will
 * be buffered and sent once we've received a ready message from our peer.
 *
 * @param {string} serviceName The name of the service this message should be
 *     delivered to.
 * @param {string|!Object} payload The value of the message. If this is an
 *     Object, it is serialized to JSON before sending.  It's the responsibility
 *     of implementors of this class to perform the serialization.
 * @see goog.net.xpc.BufferedChannel.send
 * @override
 */
goog.messaging.BufferedChannel.prototype.send = function(serviceName, payload) {
  if (this.isPeerReady()) {
    this.userChannel_.send(serviceName, payload);
  } else {
    goog.messaging.BufferedChannel.prototype.logger_.fine(
        'buffering message ' + serviceName);
    this.buffer_.push({serviceName: serviceName, payload: payload});
  }
};


/**
 * Marks the channel's peer as ready, then sends buffered messages and nulls the
 * buffer.  Subsequent calls to setPeerReady_ have no effect.
 *
 * @param {(!Object|string)} peerKnowsWeKnowItsReady Passed by the peer to
 *     indicate whether it knows that we've received its ping and that it's
 *     ready.  Non-empty if true, empty if false.
 * @private
 */
goog.messaging.BufferedChannel.prototype.setPeerReady_ = function(
    peerKnowsWeKnowItsReady) {
  if (peerKnowsWeKnowItsReady) {
    this.timer_.stop();
  } else {
    // Our peer doesn't know we're ready, so restart (or continue) pinging.
    // Restarting may be needed if the peer iframe was reloaded after the
    // connection was first established.
    this.timer_.start();
  }

  if (this.peerReady_) {
    return;
  }
  this.peerReady_ = true;
  // Send one last ping so that the peer knows we know it's ready.
  this.sendReadyPing_();
  for (var i = 0; i < this.buffer_.length; i++) {
    var message = this.buffer_[i];
    goog.messaging.BufferedChannel.prototype.logger_.fine(
        'sending buffered message ' + message.serviceName);
    this.userChannel_.send(message.serviceName, message.payload);
  }
  this.buffer_ = null;
};


/** @override */
goog.messaging.BufferedChannel.prototype.disposeInternal = function() {
  goog.dispose(this.multiChannel_);
  goog.dispose(this.timer_);
  goog.base(this, 'disposeInternal');
};
