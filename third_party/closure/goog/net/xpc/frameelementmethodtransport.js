// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains the frame element method transport for cross-domain
 * communication. It exploits the fact that FF lets a page in an
 * iframe call a method on the iframe-element it is contained in, even if the
 * containing page is from a different domain.
 *
 */


goog.provide('goog.net.xpc.FrameElementMethodTransport');

goog.require('goog.log');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.Transport');
goog.require('goog.net.xpc.TransportTypes');



/**
 * Frame-element method transport.
 *
 * Firefox allows a document within an iframe to call methods on the
 * iframe-element added by the containing document.
 * NOTE(user): Tested in all FF versions starting from 1.0
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this transport
 *     belongs to.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for finding
 *     the correct window.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 * @final
 */
goog.net.xpc.FrameElementMethodTransport = function(channel, opt_domHelper) {
  goog.net.xpc.FrameElementMethodTransport.base(
      this, 'constructor', opt_domHelper);

  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  // To transfer messages, this transport basically uses normal function calls,
  // which are synchronous. To avoid endless recursion, the delivery has to
  // be artificially made asynchronous.

  /**
   * Array for queued messages.
   * @type {Array<{serviceName: string, payload: string}>}
   * @private
   */
  this.queue_ = [];

  /**
   * Callback function which wraps deliverQueued_.
   * @type {Function}
   * @private
   */
  this.deliverQueuedCb_ = goog.bind(this.deliverQueued_, this);
};
goog.inherits(goog.net.xpc.FrameElementMethodTransport, goog.net.xpc.Transport);


/**
 * The transport type.
 * @type {number}
 * @protected
 * @override
 */
goog.net.xpc.FrameElementMethodTransport.prototype.transportType =
    goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD;


/** @private */
goog.net.xpc.FrameElementMethodTransport.prototype.attemptSetupCb_;


/** @private */
goog.net.xpc.FrameElementMethodTransport.prototype.outgoing_;


/** @private */
goog.net.xpc.FrameElementMethodTransport.prototype.iframeElm_;


/**
 * Flag used to enforce asynchronous messaging semantics.
 * @type {boolean}
 * @private
 */
goog.net.xpc.FrameElementMethodTransport.prototype.recursive_ = false;


/**
 * Holds the function to send messages to the peer
 * (once it becomes available).
 * @type {Function}
 * @private
 */
goog.net.xpc.FrameElementMethodTransport.outgoing_ = null;


/**
 * Connect this transport.
 * @override
 */
goog.net.xpc.FrameElementMethodTransport.prototype.connect = function() {
  if (this.channel_.getRole() == goog.net.xpc.CrossPageChannelRole.OUTER) {
    // get shortcut to iframe-element
    this.iframeElm_ = this.channel_.getIframeElement();

    // add the gateway function to the iframe-element
    // (to be called by the peer)
    this.iframeElm_['XPC_toOuter'] = goog.bind(this.incoming_, this);

    // at this point we just have to wait for a notification from the peer...

  } else {
    this.attemptSetup_();
  }
};


/**
 * Only used from within an iframe. Attempts to attach the method
 * to be used for sending messages by the containing document. Has to
 * wait until the containing document has finished. Therefore calls
 * itself in a timeout if not successful.
 * @private
 */
goog.net.xpc.FrameElementMethodTransport.prototype.attemptSetup_ = function() {
  var retry = true;
  /** @preserveTry */
  try {
    if (!this.iframeElm_) {
      // throws security exception when called too early
      this.iframeElm_ = this.getWindow().frameElement;
    }
    // check if iframe-element and the gateway-function to the
    // outer-frame are present
    // TODO(user) Make sure the following code doesn't throw any exceptions
    if (this.iframeElm_ && this.iframeElm_['XPC_toOuter']) {
      // get a reference to the gateway function
      this.outgoing_ = this.iframeElm_['XPC_toOuter'];
      // attach the gateway function the other document will use
      this.iframeElm_['XPC_toOuter']['XPC_toInner'] =
          goog.bind(this.incoming_, this);
      // stop retrying
      retry = false;
      // notify outer frame
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
      // notify channel that the transport is ready
      this.channel_.notifyConnected();
    }
  } catch (e) {
    goog.log.error(
        goog.net.xpc.logger, 'exception caught while attempting setup: ' + e);
  }
  // retry necessary?
  if (retry) {
    if (!this.attemptSetupCb_) {
      this.attemptSetupCb_ = goog.bind(this.attemptSetup_, this);
    }
    this.getWindow().setTimeout(this.attemptSetupCb_, 100);
  }
};


/**
 * Handles transport service messages.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.FrameElementMethodTransport.prototype.transportServiceHandler =
    function(payload) {
  if (this.channel_.getRole() == goog.net.xpc.CrossPageChannelRole.OUTER &&
      !this.channel_.isConnected() && payload == goog.net.xpc.SETUP_ACK_) {
    // get a reference to the gateway function
    this.outgoing_ = this.iframeElm_['XPC_toOuter']['XPC_toInner'];
    // notify the channel we're ready
    this.channel_.notifyConnected();
  } else {
    throw Error('Got unexpected transport message.');
  }
};


/**
 * Process incoming message.
 * @param {string} serviceName The name of the service the message is to be
 * delivered to.
 * @param {string} payload The message to process.
 * @private
 */
goog.net.xpc.FrameElementMethodTransport.prototype.incoming_ = function(
    serviceName, payload) {
  if (!this.recursive_ && this.queue_.length == 0) {
    this.channel_.xpcDeliver(serviceName, payload);
  } else {
    this.queue_.push({serviceName: serviceName, payload: payload});
    if (this.queue_.length == 1) {
      this.getWindow().setTimeout(this.deliverQueuedCb_, 1);
    }
  }
};


/**
 * Delivers queued messages.
 * @private
 */
goog.net.xpc.FrameElementMethodTransport.prototype.deliverQueued_ = function() {
  while (this.queue_.length) {
    var msg = this.queue_.shift();
    this.channel_.xpcDeliver(msg.serviceName, msg.payload);
  }
};


/**
 * Send a message
 * @param {string} service The name off the service the message is to be
 * delivered to.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.FrameElementMethodTransport.prototype.send = function(
    service, payload) {
  this.recursive_ = true;
  this.outgoing_(service, payload);
  this.recursive_ = false;
};


/** @override */
goog.net.xpc.FrameElementMethodTransport.prototype.disposeInternal =
    function() {
  goog.net.xpc.FrameElementMethodTransport.superClass_.disposeInternal.call(
      this);
  this.outgoing_ = null;
  this.iframeElm_ = null;
};
