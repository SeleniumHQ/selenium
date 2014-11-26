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
 * @fileoverview Provides an implementation of a transport that can call methods
 * directly on a frame. Useful if you want to use XPC for crossdomain messaging
 * (using another transport), or same domain messaging (using this transport).
 */


goog.provide('goog.net.xpc.DirectTransport');

goog.require('goog.Timer');
goog.require('goog.async.Deferred');
goog.require('goog.events.EventHandler');
goog.require('goog.log');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.Transport');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.object');


goog.scope(function() {
var CfgFields = goog.net.xpc.CfgFields;
var CrossPageChannelRole = goog.net.xpc.CrossPageChannelRole;
var Deferred = goog.async.Deferred;
var EventHandler = goog.events.EventHandler;
var Timer = goog.Timer;
var Transport = goog.net.xpc.Transport;



/**
 * A direct window to window method transport.
 *
 * If the windows are in the same security context, this transport calls
 * directly into the other window without using any additional mechanism. This
 * is mainly used in scenarios where you want to optionally use a cross domain
 * transport in cross security context situations, or optionally use a direct
 * transport in same security context situations.
 *
 * Note: Global properties are exported by using this transport. One to
 * communicate with the other window by, currently crosswindowmessaging.channel,
 * and by using goog.getUid on window, currently closure_uid_[0-9]+.
 *
 * @param {!goog.net.xpc.CrossPageChannel} channel The channel this
 *     transport belongs to.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for
 *     finding the correct window/document. If omitted, uses the current
 *     document.
 * @constructor
 * @extends {Transport}
 */
goog.net.xpc.DirectTransport = function(channel, opt_domHelper) {
  goog.net.xpc.DirectTransport.base(this, 'constructor', opt_domHelper);

  /**
   * The channel this transport belongs to.
   * @private {!goog.net.xpc.CrossPageChannel}
   */
  this.channel_ = channel;

  /** @private {!EventHandler<!goog.net.xpc.DirectTransport>} */
  this.eventHandler_ = new EventHandler(this);
  this.registerDisposable(this.eventHandler_);

  /**
   * Timer for connection reattempts.
   * @private {!Timer}
   */
  this.maybeAttemptToConnectTimer_ = new Timer(
      DirectTransport.CONNECTION_ATTEMPT_INTERVAL_MS_,
      this.getWindow());
  this.registerDisposable(this.maybeAttemptToConnectTimer_);

  /**
   * Fires once we've received our SETUP_ACK message.
   * @private {!Deferred}
   */
  this.setupAckReceived_ = new Deferred();

  /**
   * Fires once we've sent our SETUP_ACK message.
   * @private {!Deferred}
   */
  this.setupAckSent_ = new Deferred();

  /**
   * Fires once we're marked connected.
   * @private {!Deferred}
   */
  this.connected_ = new Deferred();

  /**
   * The unique ID of this side of the connection. Used to determine when a peer
   * is reloaded.
   * @private {string}
   */
  this.endpointId_ = goog.net.xpc.getRandomString(10);

  /**
   * The unique ID of the peer. If we get a message from a peer with an ID we
   * don't expect, we reset the connection.
   * @private {?string}
   */
  this.peerEndpointId_ = null;

  /**
   * The map of sending messages.
   * @private {Object}
   */
  this.asyncSendsMap_ = {};

  /**
   * The original channel name.
   * @private {string}
   */
  this.originalChannelName_ = this.channel_.name;

  // We reconfigure the channel name to include the role so that we can
  // communicate in the same window between the different roles on the
  // same channel.
  this.channel_.updateChannelNameAndCatalog(
      DirectTransport.getRoledChannelName_(this.channel_.name,
                                           this.channel_.getRole()));

  /**
   * Flag indicating if this instance of the transport has been initialized.
   * @private {boolean}
   */
  this.initialized_ = false;

  // We don't want to mark ourselves connected until we have sent whatever
  // message will cause our counterpart in the other frame to also declare
  // itself connected, if there is such a message.  Otherwise we risk a user
  // message being sent in advance of that message, and it being discarded.

  // Two sided handshake:
  // SETUP_ACK has to have been received, and sent.
  this.connected_.awaitDeferred(this.setupAckReceived_);
  this.connected_.awaitDeferred(this.setupAckSent_);

  this.connected_.addCallback(this.notifyConnected_, this);
  this.connected_.callback(true);

  this.eventHandler_.
      listen(this.maybeAttemptToConnectTimer_, Timer.TICK,
          this.maybeAttemptToConnect_);

  goog.log.info(
      goog.net.xpc.logger,
      'DirectTransport created. role=' + this.channel_.getRole());
};
goog.inherits(goog.net.xpc.DirectTransport, Transport);
var DirectTransport = goog.net.xpc.DirectTransport;


/**
 * @private {number}
 * @const
 */
DirectTransport.CONNECTION_ATTEMPT_INTERVAL_MS_ = 100;


/**
 * The delay to notify the xpc of a successful connection. This is used
 * to allow both parties to be connected if one party's connection callback
 * invokes an immediate send.
 * @private {number}
 * @const
 */
DirectTransport.CONNECTION_DELAY_INTERVAL_MS_ = 0;


/**
 * @param {!Window} peerWindow The peer window to check if DirectTranport is
 *     supported on.
 * @return {boolean} Whether this transport is supported.
 */
DirectTransport.isSupported = function(peerWindow) {
  /** @preserveTry */
  try {
    return window.document.domain == peerWindow.document.domain;
  } catch (e) {
    return false;
  }
};


/**
 * Tracks the number of DirectTransport channels that have been
 * initialized but not disposed yet in a map keyed by the UID of the window
 * object.  This allows for multiple windows to be initiallized and listening
 * for messages.
 * @private {!Object<number>}
 */
DirectTransport.activeCount_ = {};


/**
 * Path of global message proxy.
 * @private {string}
 * @const
 */
// TODO(user): Make this configurable using the CfgFields.
DirectTransport.GLOBAL_TRANPORT_PATH_ = 'crosswindowmessaging.channel';


/**
 * The delimiter used for transport service messages.
 * @private {string}
 * @const
 */
DirectTransport.MESSAGE_DELIMITER_ = ',';


/**
 * Initializes this transport. Registers a method for 'message'-events in the
 * global scope.
 * @param {!Window} listenWindow The window to listen to events on.
 * @private
 */
DirectTransport.initialize_ = function(listenWindow) {
  var uid = goog.getUid(listenWindow);
  var value = DirectTransport.activeCount_[uid] || 0;
  if (value == 0) {
    // Set up a handler on the window to proxy messages to class.
    var globalProxy = goog.getObjectByName(
        DirectTransport.GLOBAL_TRANPORT_PATH_,
        listenWindow);
    if (globalProxy == null) {
      goog.exportSymbol(
          DirectTransport.GLOBAL_TRANPORT_PATH_,
          DirectTransport.messageReceivedHandler_,
          listenWindow);
    }
  }
  DirectTransport.activeCount_[uid]++;
};


/**
 * @param {string} channelName The channel name.
 * @param {string|number} role The role.
 * @return {string} The formatted channel name including role.
 * @private
 */
DirectTransport.getRoledChannelName_ = function(channelName, role) {
  return channelName + '_' + role;
};


/**
 * @param {!Object} literal The literal unrenamed message.
 * @return {boolean} Whether the message was successfully delivered to a
 *     channel.
 * @private
 */
DirectTransport.messageReceivedHandler_ = function(literal) {
  var msg = DirectTransport.Message_.fromLiteral(literal);

  var channelName = msg.channelName;
  var service = msg.service;
  var payload = msg.payload;

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
    channel.xpcDeliver(service, payload);
    return true;
  }

  var transportMessageType = DirectTransport.parseTransportPayload_(payload)[0];

  // Check if there are any stale channel names that can be updated.
  for (var staleChannelName in goog.net.xpc.channels) {
    var staleChannel = goog.net.xpc.channels[staleChannelName];
    if (staleChannel.getRole() == CrossPageChannelRole.INNER &&
        !staleChannel.isConnected() &&
        service == goog.net.xpc.TRANSPORT_SERVICE_ &&
        transportMessageType == goog.net.xpc.SETUP) {
      // Inner peer received SETUP message but channel names did not match.
      // Start using the channel name sent from outer peer. The channel name
      // of the inner peer can easily become out of date, as iframe's and their
      // JS state get cached in many browsers upon page reload or history
      // navigation (particularly Firefox 1.5+).
      staleChannel.updateChannelNameAndCatalog(channelName);
      staleChannel.xpcDeliver(service, payload);
      return true;
    }
  }

  // Failed to find a channel to deliver this message to, so simply ignore it.
  goog.log.info(goog.net.xpc.logger, 'channel name mismatch; message ignored.');
  return false;
};


/**
 * The transport type.
 * @type {number}
 * @override
 */
DirectTransport.prototype.transportType = goog.net.xpc.TransportTypes.DIRECT;


/**
 * Handles transport service messages.
 * @param {string} payload The message content.
 * @override
 */
DirectTransport.prototype.transportServiceHandler = function(payload) {
  var transportParts = DirectTransport.parseTransportPayload_(payload);
  var transportMessageType = transportParts[0];
  var peerEndpointId = transportParts[1];
  switch (transportMessageType) {
    case goog.net.xpc.SETUP_ACK_:
      if (!this.setupAckReceived_.hasFired()) {
        this.setupAckReceived_.callback(true);
      }
      break;
    case goog.net.xpc.SETUP:
      this.sendSetupAckMessage_();
      if ((this.peerEndpointId_ != null) &&
          (this.peerEndpointId_ != peerEndpointId)) {
        // Send a new SETUP message since the peer has been replaced.
        goog.log.info(goog.net.xpc.logger,
            'Sending SETUP and changing peer ID to: ' + peerEndpointId);
        this.sendSetupMessage_();
      }
      this.peerEndpointId_ = peerEndpointId;
      break;
  }
};


/**
 * Sends a SETUP transport service message.
 * @private
 */
DirectTransport.prototype.sendSetupMessage_ = function() {
  // Although we could send real objects, since some other transports are
  // limited to strings we also keep this requirement.
  var payload = goog.net.xpc.SETUP;
  payload += DirectTransport.MESSAGE_DELIMITER_;
  payload += this.endpointId_;
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, payload);
};


/**
 * Sends a SETUP_ACK transport service message.
 * @private
 */
DirectTransport.prototype.sendSetupAckMessage_ = function() {
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
  if (!this.setupAckSent_.hasFired()) {
    this.setupAckSent_.callback(true);
  }
};


/** @override */
DirectTransport.prototype.connect = function() {
  var win = this.getWindow();
  if (win) {
    DirectTransport.initialize_(win);
    this.initialized_ = true;
    this.maybeAttemptToConnect_();
  } else {
    goog.log.fine(goog.net.xpc.logger, 'connect(): no window to initialize.');
  }
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
DirectTransport.prototype.maybeAttemptToConnect_ = function() {
  var outerRole = this.channel_.getRole() == CrossPageChannelRole.OUTER;
  if (this.channel_.isConnected()) {
    this.maybeAttemptToConnectTimer_.stop();
    return;
  }
  this.maybeAttemptToConnectTimer_.start();
  this.sendSetupMessage_();
};


/**
 * Prepares to send a message.
 * @param {string} service The name of the service the message is to be
 *     delivered to.
 * @param {string} payload The message content.
 * @override
 */
DirectTransport.prototype.send = function(service, payload) {
  if (!this.channel_.getPeerWindowObject()) {
    goog.log.fine(goog.net.xpc.logger, 'send(): window not ready');
    return;
  }
  var channelName = DirectTransport.getRoledChannelName_(
      this.originalChannelName_,
      this.getPeerRole_());

  var message = new DirectTransport.Message_(
      channelName,
      service,
      payload);

  if (this.channel_.getConfig()[CfgFields.DIRECT_TRANSPORT_SYNC_MODE]) {
    this.executeScheduledSend_(message);
  } else {
    // Note: goog.async.nextTick doesn't support cancelling or disposal so
    // leaving as 0ms timer, though this may have performance implications.
    this.asyncSendsMap_[goog.getUid(message)] =
        Timer.callOnce(goog.bind(this.executeScheduledSend_, this, message), 0);
  }
};


/**
 * Sends the message.
 * @param {!DirectTransport.Message_} message The message to send.
 * @private
 */
DirectTransport.prototype.executeScheduledSend_ = function(message) {
  var messageId = goog.getUid(message);
  if (this.asyncSendsMap_[messageId]) {
    delete this.asyncSendsMap_[messageId];
  }

  /** @preserveTry */
  try {
    var peerProxy = goog.getObjectByName(
        DirectTransport.GLOBAL_TRANPORT_PATH_,
        this.channel_.getPeerWindowObject());
  } catch (error) {
    goog.log.warning(
        goog.net.xpc.logger,
        'Can\'t access other window, ignoring.',
        error);
    return;
  }

  if (goog.isNull(peerProxy)) {
    goog.log.warning(
        goog.net.xpc.logger,
        'Peer window had no global function.');
    return;
  }

  /** @preserveTry */
  try {
    peerProxy(message.toLiteral());
    goog.log.info(
        goog.net.xpc.logger,
        'send(): channelName=' + message.channelName +
        ' service=' + message.service +
        ' payload=' + message.payload);
  } catch (error) {
    goog.log.warning(
        goog.net.xpc.logger,
        'Error performing call, ignoring.',
        error);
  }
};


/**
 * @return {goog.net.xpc.CrossPageChannelRole} The role of peer channel (either
 *     inner or outer).
 * @private
 */
DirectTransport.prototype.getPeerRole_ = function() {
  var role = this.channel_.getRole();
  return role == goog.net.xpc.CrossPageChannelRole.OUTER ?
      goog.net.xpc.CrossPageChannelRole.INNER :
      goog.net.xpc.CrossPageChannelRole.OUTER;
};


/**
 * Notifies the channel that this transport is connected.
 * @private
 */
DirectTransport.prototype.notifyConnected_ = function() {
  // Add a delay as the connection callback will break if this transport is
  // synchronous and the callback invokes send() immediately.
  this.channel_.notifyConnected(
      this.channel_.getConfig()[CfgFields.DIRECT_TRANSPORT_SYNC_MODE] ?
      DirectTransport.CONNECTION_DELAY_INTERVAL_MS_ : 0);
};


/** @override */
DirectTransport.prototype.disposeInternal = function() {
  if (this.initialized_) {
    var listenWindow = this.getWindow();
    var uid = goog.getUid(listenWindow);
    var value = --DirectTransport.activeCount_[uid];
    if (value == 1) {
      goog.exportSymbol(
          DirectTransport.GLOBAL_TRANPORT_PATH_,
          null,
          listenWindow);
    }
  }

  if (this.asyncSendsMap_) {
    goog.object.forEach(this.asyncSendsMap_, function(timerId) {
      Timer.clear(timerId);
    });
    this.asyncSendsMap_ = null;
  }

  // Deferred's aren't disposables.
  if (this.setupAckReceived_) {
    this.setupAckReceived_.cancel();
    delete this.setupAckReceived_;
  }
  if (this.setupAckSent_) {
    this.setupAckSent_.cancel();
    delete this.setupAckSent_;
  }
  if (this.connected_) {
    this.connected_.cancel();
    delete this.connected_;
  }

  DirectTransport.base(this, 'disposeInternal');
};


/**
 * Parses a transport service payload message.
 * @param {string} payload The payload.
 * @return {!Array<?string>} An array with the message type as the first member
 *     and the endpoint id as the second, if one was sent, or null otherwise.
 * @private
 */
DirectTransport.parseTransportPayload_ = function(payload) {
  var transportParts = /** @type {!Array<?string>} */ (payload.split(
      DirectTransport.MESSAGE_DELIMITER_));
  transportParts[1] = transportParts[1] || null; // Usually endpointId.
  return transportParts;
};



/**
 * Message container that gets passed back and forth between windows.
 * @param {string} channelName The channel name to tranport messages on.
 * @param {string} service The service to send the payload to.
 * @param {string} payload The payload to send.
 * @constructor
 * @struct
 * @private
 */
DirectTransport.Message_ = function(channelName, service, payload) {
  /**
   * The name of the channel.
   * @type {string}
   */
  this.channelName = channelName;

  /**
   * The service on the channel.
   * @type {string}
   */
  this.service = service;

  /**
   * The payload.
   * @type {string}
   */
  this.payload = payload;
};


/**
 * Converts a message to a literal object.
 * @return {!Object} The message as a literal object.
 */
DirectTransport.Message_.prototype.toLiteral = function() {
  return {
    'channelName': this.channelName,
    'service': this.service,
    'payload': this.payload
  };
};


/**
 * Creates a Message_ from a literal object.
 * @param {!Object} literal The literal to convert to Message.
 * @return {!DirectTransport.Message_} The Message.
 */
DirectTransport.Message_.fromLiteral = function(literal) {
  return new DirectTransport.Message_(
      literal['channelName'],
      literal['service'],
      literal['payload']);
};

});  // goog.scope
