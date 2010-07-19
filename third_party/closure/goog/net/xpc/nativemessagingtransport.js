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
 * @fileoverview Contains the class which uses native messaging
 * facilities for cross domain communication.
 *
*
 */


goog.provide('goog.net.xpc.NativeMessagingTransport');

goog.require('goog.events');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.Transport');


/**
 * The native messaging transport
 *
 * Uses document.postMessage() to send messages to other documents.
 * Receiving is done by listening on 'message'-events on the document.
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this
 *     transport belongs to.
 * @param {string} peerHostname The hostname (protocol, domain, and port) of the
 *     peer.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 */
goog.net.xpc.NativeMessagingTransport = function(channel, peerHostname) {
  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The hostname of the peer. This parameterizes all calls to postMessage, and
   * should contain the precise protocol, domain, and port of the peer window.
   * @type {string}
   * @private
   */
  this.peerHostname_ = peerHostname || '*';
};
goog.inherits(goog.net.xpc.NativeMessagingTransport, goog.net.xpc.Transport);

/**
 * Flag indicating if this instance of the transport has been initialized.
 * @type {boolean}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.initialized_ = false;

/**
 * The transport type.
 * @type {number}
 */
goog.net.xpc.NativeMessagingTransport.prototype.transportType =
  goog.net.xpc.TransportTypes.NATIVE_MESSAGING;

/**
 * Tracks the number of NativeMessagingTransport channels that have been
 * initialized but not disposed yet.
 * @type {number}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.activeCount_ = 0;

/**
 * Initializes this transport. Registers a listener for 'message'-events
 * on the document.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.initialize_ = function() {
  if (goog.net.xpc.NativeMessagingTransport.activeCount_ == 0) {
    // Listen for message-events. These are fired on window in FF3 and on
    // document in Opera.
    goog.events.listen(
        window.postMessage ? window : document,
        'message',
        goog.net.xpc.NativeMessagingTransport.messageReceived_,
        false,
        goog.net.xpc.NativeMessagingTransport);
  }
  goog.net.xpc.NativeMessagingTransport.activeCount_++;
};

/**
 * Processes an incoming message-event.
 * @param {goog.events.BrowserEvent} msgEvt The message event.
 * @return {boolean} True if message was successfully delivered to a channel.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.messageReceived_ = function(msgEvt) {
  var data = msgEvt.getBrowserEvent().data;

  var headDelim = data.indexOf('|');
  var serviceDelim = data.indexOf(':');

  // make sure we got something reasonable
  if (headDelim == -1 || serviceDelim == -1) {
    return false;
  }

  var channelName = data.substring(0, headDelim);
  var service = data.substring(headDelim + 1, serviceDelim);
  var payload = data.substring(serviceDelim + 1);

  goog.net.xpc.logger.fine('messageReceived: channel=' + channelName +
                           ', service=' + service + ', payload=' + payload);

  // Attempt to deliver message to the channel. Keep in mind that it may not
  // exist for several reasons, including but not limited to:
  //  - a malformed message
  //  - the channel simply has not been created
  //  - channel was created in a different namespace
  //  - message was sent to the wrong window
  //  - channel has become stale (e.g. caching iframes and back clicks)
  var channel = goog.net.xpc.channels_[channelName];
  if (channel) {
    channel.deliver_(service, payload);
    return true;
  }

  // Check if there are any stale channel names that can be updated.
  for (var staleChannelName in goog.net.xpc.channels_) {
    var staleChannel = goog.net.xpc.channels_[staleChannelName];
    if (staleChannel.getRole() == goog.net.xpc.CrossPageChannel.Role.INNER &&
        !staleChannel.isConnected() &&
        service == goog.net.xpc.TRANSPORT_SERVICE_ &&
        payload == goog.net.xpc.SETUP) {
      // Inner peer received SETUP message but channel names did not match.
      // Start using the channel name sent from outer peer. The channel name
      // of the inner peer can easily become out of date, as iframe's and their
      // JS state get cached in many browsers upon page reload or history
      // navigation (particularly Firefox 1.5+). We can trust the outer peer,
      // since we only accept postMessage messages from the same hostname that
      // originally setup the channel.
      goog.net.xpc.logger.fine('changing channel name to ' + channelName);
      staleChannel.name = channelName;
      // Remove old stale pointer to channel.
      delete goog.net.xpc.channels_[staleChannelName];
      // Create fresh pointer to channel.
      goog.net.xpc.channels_[channelName] = staleChannel;
      staleChannel.deliver_(service, payload);
      return true;
    }
  }

  // Failed to find a channel to deliver this message to, so simply ignore it.
  goog.net.xpc.logger.info('channel name mismatch; message ignored"');
  return false;
};


/**
 * Handles transport service messages.
 * @param {string} payload The message content.
 */
goog.net.xpc.NativeMessagingTransport.prototype.transportServiceHandler =
    function(payload) {
  switch (payload) {
    case goog.net.xpc.SETUP:
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
      break;
    case goog.net.xpc.SETUP_ACK_:
      this.channel_.notifyConnected_();
      break;
  }
};


/**
 * Connects this transport.
 */
goog.net.xpc.NativeMessagingTransport.prototype.connect = function() {
  goog.net.xpc.NativeMessagingTransport.initialize_();
  this.initialized_ = true;
  this.connectWithRetries_();
};


/**
 * Connects to other peer. In the case of the outer peer, the setup messages are
 * likely sent before the inner peer is ready to receive them. Therefore, this
 * function will continue trying to send the SETUP message until the inner peer
 * responds. In the case of the inner peer, it will occasionally have its
 * channel name fall out of sync with the outer peer, particularly during
 * soft-reloads and history navigations.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.connectWithRetries_ =
    function() {
  if (this.channel_.isConnected()) {
    return;
  }
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP);
  window.setTimeout(goog.bind(this.connectWithRetries_, this), 100);
};


/**
 * Sends a message.
 * @param {string} service The name off the service the message is to be
 * delivered to.
 * @param {string} payload The message content.
 */
goog.net.xpc.NativeMessagingTransport.prototype.send = function(service,
                                                                payload) {
  var win = this.channel_.peerWindowObject_;
  if (!win) {
    goog.net.xpc.logger.fine('send(): window not ready');
    return;
  }

  // postMessage is a method of the window object, except in some versions of
  // Opera, where it is a method of the document object.
  var obj = win.postMessage ? win : win.document;
  this.send = function(service, payload) {
    goog.net.xpc.logger.fine('send(): payload=' + payload +
                             ' to hostname=' + this.peerHostname_);
    obj.postMessage(this.channel_.name + '|' + service + ':' + payload,
                    this.peerHostname_);
  };
  this.send(service, payload);
};


/**
 * Disposes of the transport.
 */
goog.net.xpc.NativeMessagingTransport.prototype.disposeInternal = function() {
  goog.net.xpc.NativeMessagingTransport.superClass_.disposeInternal.call(this);
  if (this.initialized_) {
    goog.net.xpc.NativeMessagingTransport.activeCount_--;
    if (goog.net.xpc.NativeMessagingTransport.activeCount_ == 0) {
      goog.events.unlisten(
          window.postMessage ? window : document,
          'message',
          goog.net.xpc.NativeMessagingTransport.messageReceived_,
          false,
          goog.net.xpc.NativeMessagingTransport);
    }
  }
};
