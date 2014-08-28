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
 */


goog.provide('goog.net.xpc.NativeMessagingTransport');

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.log');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.Transport');
goog.require('goog.net.xpc.TransportTypes');



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
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for
 *     finding the correct window/document.
 * @param {boolean=} opt_oneSidedHandshake If this is true, only the outer
 *     transport sends a SETUP message and expects a SETUP_ACK.  The inner
 *     transport goes connected when it receives the SETUP.
 * @param {number=} opt_protocolVersion Which version of its setup protocol the
 *     transport should use.  The default is '2'.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 * @final
 */
goog.net.xpc.NativeMessagingTransport = function(channel, peerHostname,
    opt_domHelper, opt_oneSidedHandshake, opt_protocolVersion) {
  goog.net.xpc.NativeMessagingTransport.base(
      this, 'constructor', opt_domHelper);

  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * Which version of the transport's protocol should be used.
   * @type {number}
   * @private
   */
  this.protocolVersion_ = opt_protocolVersion || 2;
  goog.asserts.assert(this.protocolVersion_ >= 1);
  goog.asserts.assert(this.protocolVersion_ <= 2);

  /**
   * The hostname of the peer. This parameterizes all calls to postMessage, and
   * should contain the precise protocol, domain, and port of the peer window.
   * @type {string}
   * @private
   */
  this.peerHostname_ = peerHostname || '*';

  /**
   * The event handler.
   * @type {!goog.events.EventHandler.<!goog.net.xpc.NativeMessagingTransport>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * Timer for connection reattempts.
   * @type {!goog.Timer}
   * @private
   */
  this.maybeAttemptToConnectTimer_ = new goog.Timer(100, this.getWindow());

  /**
   * Whether one-sided handshakes are enabled.
   * @type {boolean}
   * @private
   */
  this.oneSidedHandshake_ = !!opt_oneSidedHandshake;

  /**
   * Fires once we've received our SETUP_ACK message.
   * @type {!goog.async.Deferred}
   * @private
   */
  this.setupAckReceived_ = new goog.async.Deferred();

  /**
   * Fires once we've sent our SETUP_ACK message.
   * @type {!goog.async.Deferred}
   * @private
   */
  this.setupAckSent_ = new goog.async.Deferred();

  /**
   * Fires once we're marked connected.
   * @type {!goog.async.Deferred}
   * @private
   */
  this.connected_ = new goog.async.Deferred();

  /**
   * The unique ID of this side of the connection. Used to determine when a peer
   * is reloaded.
   * @type {string}
   * @private
   */
  this.endpointId_ = goog.net.xpc.getRandomString(10);

  /**
   * The unique ID of the peer. If we get a message from a peer with an ID we
   * don't expect, we reset the connection.
   * @type {?string}
   * @private
   */
  this.peerEndpointId_ = null;

  // We don't want to mark ourselves connected until we have sent whatever
  // message will cause our counterpart in the other frame to also declare
  // itself connected, if there is such a message.  Otherwise we risk a user
  // message being sent in advance of that message, and it being discarded.
  if (this.oneSidedHandshake_) {
    if (this.channel_.getRole() == goog.net.xpc.CrossPageChannelRole.INNER) {
      // One sided handshake, inner frame:
      // SETUP_ACK must be received.
      this.connected_.awaitDeferred(this.setupAckReceived_);
    } else {
      // One sided handshake, outer frame:
      // SETUP_ACK must be sent.
      this.connected_.awaitDeferred(this.setupAckSent_);
    }
  } else {
    // Two sided handshake:
    // SETUP_ACK has to have been received, and sent.
    this.connected_.awaitDeferred(this.setupAckReceived_);
    if (this.protocolVersion_ == 2) {
      this.connected_.awaitDeferred(this.setupAckSent_);
    }
  }
  this.connected_.addCallback(this.notifyConnected_, this);
  this.connected_.callback(true);

  this.eventHandler_.
      listen(this.maybeAttemptToConnectTimer_, goog.Timer.TICK,
          this.maybeAttemptToConnect_);

  goog.log.info(goog.net.xpc.logger, 'NativeMessagingTransport created.  ' +
      'protocolVersion=' + this.protocolVersion_ + ', oneSidedHandshake=' +
      this.oneSidedHandshake_ + ', role=' + this.channel_.getRole());
};
goog.inherits(goog.net.xpc.NativeMessagingTransport, goog.net.xpc.Transport);


/**
 * Length of the delay in milliseconds between the channel being connected and
 * the connection callback being called, in cases where coverage of timing flaws
 * is required.
 * @type {number}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.CONNECTION_DELAY_MS_ = 200;


/**
 * Current determination of peer's protocol version, or null for unknown.
 * @type {?number}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.peerProtocolVersion_ = null;


/**
 * Flag indicating if this instance of the transport has been initialized.
 * @type {boolean}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.initialized_ = false;


/**
 * The transport type.
 * @type {number}
 * @override
 */
goog.net.xpc.NativeMessagingTransport.prototype.transportType =
    goog.net.xpc.TransportTypes.NATIVE_MESSAGING;


/**
 * The delimiter used for transport service messages.
 * @type {string}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.MESSAGE_DELIMITER_ = ',';


/**
 * Tracks the number of NativeMessagingTransport channels that have been
 * initialized but not disposed yet in a map keyed by the UID of the window
 * object.  This allows for multiple windows to be initiallized and listening
 * for messages.
 * @type {Object.<number>}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.activeCount_ = {};


/**
 * Id of a timer user during postMessage sends.
 * @type {number}
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.sendTimerId_ = 0;


/**
 * Checks whether the peer transport protocol version could be as indicated.
 * @param {number} version The version to check for.
 * @return {boolean} Whether the peer transport protocol version is as
 *     indicated, or null.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.couldPeerVersionBe_ =
    function(version) {
  return this.peerProtocolVersion_ == null ||
      this.peerProtocolVersion_ == version;
};


/**
 * Initializes this transport. Registers a listener for 'message'-events
 * on the document.
 * @param {Window} listenWindow The window to listen to events on.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.initialize_ = function(listenWindow) {
  var uid = goog.getUid(listenWindow);
  var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid];
  if (!goog.isNumber(value)) {
    value = 0;
  }
  if (value == 0) {
    // Listen for message-events. These are fired on window in FF3 and on
    // document in Opera.
    goog.events.listen(
        listenWindow.postMessage ? listenWindow : listenWindow.document,
        'message',
        goog.net.xpc.NativeMessagingTransport.messageReceived_,
        false,
        goog.net.xpc.NativeMessagingTransport);
  }
  goog.net.xpc.NativeMessagingTransport.activeCount_[uid] = value + 1;
};


/**
 * Processes an incoming message-event.
 * @param {goog.events.BrowserEvent} msgEvt The message event.
 * @return {boolean} True if message was successfully delivered to a channel.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.messageReceived_ = function(msgEvt) {
  var data = msgEvt.getBrowserEvent().data;

  if (!goog.isString(data)) {
    return false;
  }

  var headDelim = data.indexOf('|');
  var serviceDelim = data.indexOf(':');

  // make sure we got something reasonable
  if (headDelim == -1 || serviceDelim == -1) {
    return false;
  }

  var channelName = data.substring(0, headDelim);
  var service = data.substring(headDelim + 1, serviceDelim);
  var payload = data.substring(serviceDelim + 1);

  goog.log.fine(goog.net.xpc.logger,
      'messageReceived: channel=' + channelName +
      ', service=' + service + ', payload=' + payload);

  // Attempt to deliver message to the channel. Keep in mind that it may not
  // exist for several reasons, including but not limited to:
  //  - a malformed message
  //  - the channel simply has not been created
  //  - channel was created in a different namespace
  //  - message was sent to the wrong window
  //  - channel has become stale (e.g. caching iframes and back clicks)
  var channel = goog.net.xpc.channels[channelName];
  if (channel) {
    channel.xpcDeliver(service, payload,
        /** @type {!MessageEvent} */ (msgEvt.getBrowserEvent()).origin);
    return true;
  }

  var transportMessageType =
      goog.net.xpc.NativeMessagingTransport.parseTransportPayload_(payload)[0];

  // Check if there are any stale channel names that can be updated.
  for (var staleChannelName in goog.net.xpc.channels) {
    var staleChannel = goog.net.xpc.channels[staleChannelName];
    if (staleChannel.getRole() == goog.net.xpc.CrossPageChannelRole.INNER &&
        !staleChannel.isConnected() &&
        service == goog.net.xpc.TRANSPORT_SERVICE_ &&
        (transportMessageType == goog.net.xpc.SETUP ||
        transportMessageType == goog.net.xpc.SETUP_NTPV2)) {
      // Inner peer received SETUP message but channel names did not match.
      // Start using the channel name sent from outer peer. The channel name
      // of the inner peer can easily become out of date, as iframe's and their
      // JS state get cached in many browsers upon page reload or history
      // navigation (particularly Firefox 1.5+). We can trust the outer peer,
      // since we only accept postMessage messages from the same hostname that
      // originally setup the channel.
      staleChannel.updateChannelNameAndCatalog(channelName);
      staleChannel.xpcDeliver(service, payload);
      return true;
    }
  }

  // Failed to find a channel to deliver this message to, so simply ignore it.
  goog.log.info(goog.net.xpc.logger, 'channel name mismatch; message ignored"');
  return false;
};


/**
 * Handles transport service messages.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.NativeMessagingTransport.prototype.transportServiceHandler =
    function(payload) {
  var transportParts =
      goog.net.xpc.NativeMessagingTransport.parseTransportPayload_(payload);
  var transportMessageType = transportParts[0];
  var peerEndpointId = transportParts[1];
  switch (transportMessageType) {
    case goog.net.xpc.SETUP_ACK_:
      this.setPeerProtocolVersion_(1);
      if (!this.setupAckReceived_.hasFired()) {
        this.setupAckReceived_.callback(true);
      }
      break;
    case goog.net.xpc.SETUP_ACK_NTPV2:
      if (this.protocolVersion_ == 2) {
        this.setPeerProtocolVersion_(2);
        if (!this.setupAckReceived_.hasFired()) {
          this.setupAckReceived_.callback(true);
        }
      }
      break;
    case goog.net.xpc.SETUP:
      this.setPeerProtocolVersion_(1);
      this.sendSetupAckMessage_(1);
      break;
    case goog.net.xpc.SETUP_NTPV2:
      if (this.protocolVersion_ == 2) {
        var prevPeerProtocolVersion = this.peerProtocolVersion_;
        this.setPeerProtocolVersion_(2);
        this.sendSetupAckMessage_(2);
        if ((prevPeerProtocolVersion == 1 || this.peerEndpointId_ != null) &&
            this.peerEndpointId_ != peerEndpointId) {
          // Send a new SETUP message since the peer has been replaced.
          goog.log.info(goog.net.xpc.logger,
              'Sending SETUP and changing peer ID to: ' + peerEndpointId);
          this.sendSetupMessage_();
        }
        this.peerEndpointId_ = peerEndpointId;
      }
      break;
  }
};


/**
 * Sends a SETUP transport service message of the correct protocol number for
 * our current situation.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.sendSetupMessage_ =
    function() {
  // 'real' (legacy) v1 transports don't know about there being v2 ones out
  // there, and we shouldn't either.
  goog.asserts.assert(!(this.protocolVersion_ == 1 &&
      this.peerProtocolVersion_ == 2));

  if (this.protocolVersion_ == 2 && this.couldPeerVersionBe_(2)) {
    var payload = goog.net.xpc.SETUP_NTPV2;
    payload += goog.net.xpc.NativeMessagingTransport.MESSAGE_DELIMITER_;
    payload += this.endpointId_;
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, payload);
  }

  // For backward compatibility reasons, the V1 SETUP message can be sent by
  // both V1 and V2 transports.  Once a V2 transport has 'heard' another V2
  // transport it starts ignoring V1 messages, so the V2 message must be sent
  // first.
  if (this.couldPeerVersionBe_(1)) {
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP);
  }
};


/**
 * Sends a SETUP_ACK transport service message of the correct protocol number
 * for our current situation.
 * @param {number} protocolVersion The protocol version of the SETUP message
 *     which gave rise to this ack message.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.sendSetupAckMessage_ =
    function(protocolVersion) {
  goog.asserts.assert(this.protocolVersion_ != 1 || protocolVersion != 2,
      'Shouldn\'t try to send a v2 setup ack in v1 mode.');
  if (this.protocolVersion_ == 2 && this.couldPeerVersionBe_(2) &&
      protocolVersion == 2) {
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_NTPV2);
  } else if (this.couldPeerVersionBe_(1) && protocolVersion == 1) {
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
  } else {
    return;
  }

  if (!this.setupAckSent_.hasFired()) {
    this.setupAckSent_.callback(true);
  }
};


/**
 * Attempts to set the peer protocol number.  Downgrades from 2 to 1 are not
 * permitted.
 * @param {number} version The new protocol number.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.setPeerProtocolVersion_ =
    function(version) {
  if (version > this.peerProtocolVersion_) {
    this.peerProtocolVersion_ = version;
  }
  if (this.peerProtocolVersion_ == 1) {
    if (!this.setupAckSent_.hasFired() && !this.oneSidedHandshake_) {
      this.setupAckSent_.callback(true);
    }
    this.peerEndpointId_ = null;
  }
};


/**
 * Connects this transport.
 * @override
 */
goog.net.xpc.NativeMessagingTransport.prototype.connect = function() {
  goog.net.xpc.NativeMessagingTransport.initialize_(this.getWindow());
  this.initialized_ = true;
  this.maybeAttemptToConnect_();
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
goog.net.xpc.NativeMessagingTransport.prototype.maybeAttemptToConnect_ =
    function() {
  // In a one-sided handshake, the outer frame does not send a SETUP message,
  // but the inner frame does.
  var outerFrame = this.channel_.getRole() ==
      goog.net.xpc.CrossPageChannelRole.OUTER;
  if ((this.oneSidedHandshake_ && outerFrame) ||
      this.channel_.isConnected() ||
      this.isDisposed()) {
    this.maybeAttemptToConnectTimer_.stop();
    return;
  }
  this.maybeAttemptToConnectTimer_.start();
  this.sendSetupMessage_();
};


/**
 * Sends a message.
 * @param {string} service The name off the service the message is to be
 * delivered to.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.NativeMessagingTransport.prototype.send = function(service,
                                                                payload) {
  var win = this.channel_.getPeerWindowObject();
  if (!win) {
    goog.log.fine(goog.net.xpc.logger, 'send(): window not ready');
    return;
  }

  this.send = function(service, payload) {
    // In IE8 (and perhaps elsewhere), it seems like postMessage is sometimes
    // implemented as a synchronous call.  That is, calling it synchronously
    // calls whatever listeners it has, and control is not returned to the
    // calling thread until those listeners are run.  This produces different
    // ordering to all other browsers, and breaks this protocol.  This timer
    // callback is introduced to produce standard behavior across all browsers.
    var transport = this;
    var channelName = this.channel_.name;
    var sendFunctor = function() {
      transport.sendTimerId_ = 0;

      try {
        // postMessage is a method of the window object, except in some
        // versions of Opera, where it is a method of the document object.  It
        // also seems that the appearance of postMessage on the peer window
        // object can sometimes be delayed.
        var obj = win.postMessage ? win : win.document;
        if (!obj.postMessage) {
          goog.log.warning(goog.net.xpc.logger,
              'Peer window had no postMessage function.');
          return;
        }

        obj.postMessage(channelName + '|' + service + ':' + payload,
            transport.peerHostname_);
        goog.log.fine(goog.net.xpc.logger, 'send(): service=' + service +
            ' payload=' + payload + ' to hostname=' + transport.peerHostname_);
      } catch (error) {
        // There is some evidence (not totally convincing) that postMessage can
        // be missing or throw errors during a narrow timing window during
        // startup.  This protects against that.
        goog.log.warning(goog.net.xpc.logger,
            'Error performing postMessage, ignoring.', error);
      }
    };
    this.sendTimerId_ = goog.Timer.callOnce(sendFunctor, 0);
  };
  this.send(service, payload);
};


/**
 * Notify the channel that this transport is connected.  If either transport is
 * protocol v1, a short delay is required to paper over timing vulnerabilities
 * in that protocol version.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.prototype.notifyConnected_ =
    function() {
  var delay = (this.protocolVersion_ == 1 || this.peerProtocolVersion_ == 1) ?
      goog.net.xpc.NativeMessagingTransport.CONNECTION_DELAY_MS_ : undefined;
  this.channel_.notifyConnected(delay);
};


/** @override */
goog.net.xpc.NativeMessagingTransport.prototype.disposeInternal = function() {
  if (this.initialized_) {
    var listenWindow = this.getWindow();
    var uid = goog.getUid(listenWindow);
    var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid];
    goog.net.xpc.NativeMessagingTransport.activeCount_[uid] = value - 1;
    if (value == 1) {
      goog.events.unlisten(
          listenWindow.postMessage ? listenWindow : listenWindow.document,
          'message',
          goog.net.xpc.NativeMessagingTransport.messageReceived_,
          false,
          goog.net.xpc.NativeMessagingTransport);
    }
  }

  if (this.sendTimerId_) {
    goog.Timer.clear(this.sendTimerId_);
    this.sendTimerId_ = 0;
  }

  goog.dispose(this.eventHandler_);
  delete this.eventHandler_;

  goog.dispose(this.maybeAttemptToConnectTimer_);
  delete this.maybeAttemptToConnectTimer_;

  this.setupAckReceived_.cancel();
  delete this.setupAckReceived_;
  this.setupAckSent_.cancel();
  delete this.setupAckSent_;
  this.connected_.cancel();
  delete this.connected_;

  // Cleaning up this.send as it is an instance method, created in
  // goog.net.xpc.NativeMessagingTransport.prototype.send and has a closure over
  // this.channel_.peerWindowObject_.
  delete this.send;

  goog.net.xpc.NativeMessagingTransport.base(this, 'disposeInternal');
};


/**
 * Parse a transport service payload message.  For v1, it is simply expected to
 * be 'SETUP' or 'SETUP_ACK'.  For v2, an example setup message is
 * 'SETUP_NTPV2,abc123', where the second part is the endpoint id.  The v2 setup
 * ack message is simply 'SETUP_ACK_NTPV2'.
 * @param {string} payload The payload.
 * @return {!Array.<?string>} An array with the message type as the first member
 *     and the endpoint id as the second, if one was sent, or null otherwise.
 * @private
 */
goog.net.xpc.NativeMessagingTransport.parseTransportPayload_ =
    function(payload) {
  var transportParts = /** @type {!Array.<?string>} */ (payload.split(
      goog.net.xpc.NativeMessagingTransport.MESSAGE_DELIMITER_));
  transportParts[1] = transportParts[1] || null;
  return transportParts;
};
