// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Provides the class CrossDomainChannel, the main class in
 * goog.net.xpc.
 *
 * @see ../../demos/xpc/index.html
 */

goog.provide('goog.net.xpc.CrossPageChannel');
goog.provide('goog.net.xpc.CrossPageChannel.Role');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.json');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.FrameElementMethodTransport');
goog.require('goog.net.xpc.IframePollingTransport');
goog.require('goog.net.xpc.IframeRelayTransport');
goog.require('goog.net.xpc.NativeMessagingTransport');
goog.require('goog.net.xpc.NixTransport');
goog.require('goog.net.xpc.Transport');
goog.require('goog.userAgent');



/**
 * A communication channel between two documents from different domains.
 * Provides asynchronous messaging.
 *
 * @param {Object} cfg Channel configuration object.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.net.xpc.CrossPageChannel = function(cfg) {
  goog.Disposable.call(this);

  /**
   * The configuration for this channel.
   * @type {Object}
   * @private
   */
  this.cfg_ = cfg;

  /**
   * The name of the channel.
   * @type {string}
   * @protected
   */
  this.name = this.cfg_[goog.net.xpc.CfgFields.CHANNEL_NAME] ||
      goog.net.xpc.getRandomString(10);

  /**
   * Object holding the service callbacks.
   * @type {Object}
   * @private
   */
  this.services_ = {};

  goog.net.xpc.channels_[this.name] = this;

  goog.events.listen(window, 'unload',
      goog.net.xpc.CrossPageChannel.disposeAll_);

  goog.net.xpc.logger.info('CrossPageChannel created: ' + this.name);
};
goog.inherits(goog.net.xpc.CrossPageChannel, goog.Disposable);


/**
 * The transport.
 * @type {goog.net.xpc.Transport?}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.transport_ = null;


/**
 * The channel state.
 * @type {number}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.state_ =
    goog.net.xpc.ChannelStates.NOT_CONNECTED;


/**
 * @return {boolean} Whether the channel is connected.
 */
goog.net.xpc.CrossPageChannel.prototype.isConnected = function() {
  return this.state_ == goog.net.xpc.ChannelStates.CONNECTED;
};


/**
 * Reference to the window-object of the peer page.
 * @type {Object?}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.peerWindowObject_ = null;


/**
 * Reference to the iframe-element.
 * @type {Object?}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.iframeElement_ = null;


/**
 * Sets the window object the foreign document resides in.
 *
 * @param {Object} peerWindowObject The window object of the peer.
 */
goog.net.xpc.CrossPageChannel.prototype.setPeerWindowObject =
    function(peerWindowObject) {
  this.peerWindowObject_ = peerWindowObject;
};


/**
 * Determine which transport type to use for this channel / useragent.
 * @return {goog.net.xpc.TransportTypes|undefined} The best transport type.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.determineTransportType_ = function() {
  var transportType;
  if (goog.isFunction(document.postMessage) ||
      goog.isFunction(window.postMessage) ||
      // IE8 supports window.postMessage, but
      // typeof window.postMessage returns "object"
      (goog.userAgent.IE && window.postMessage)) {
    transportType = goog.net.xpc.TransportTypes.NATIVE_MESSAGING;
  } else if (goog.userAgent.GECKO) {
    transportType = goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD;
  } else if (goog.userAgent.IE &&
             this.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI]) {
    transportType = goog.net.xpc.TransportTypes.IFRAME_RELAY;
  } else if (goog.userAgent.IE) {
    transportType = goog.net.xpc.TransportTypes.NIX;
  } else if (this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI] &&
             this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]) {
    transportType = goog.net.xpc.TransportTypes.IFRAME_POLLING;
  }
  return transportType;
};


/**
 * Creates the transport for this channel. Chooses from the available
 * transport based on the user agent and the configuration.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.createTransport_ = function() {
  // return, if the transport has already been created
  if (this.transport_) {
    return;
  }

  if (!this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) {
    this.cfg_[goog.net.xpc.CfgFields.TRANSPORT] =
        this.determineTransportType_();
  }

  switch (this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) {
    case goog.net.xpc.TransportTypes.NATIVE_MESSAGING:
      this.transport_ = new goog.net.xpc.NativeMessagingTransport(
          this,
          this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME]);
      break;
    case goog.net.xpc.TransportTypes.NIX:
      this.transport_ = new goog.net.xpc.NixTransport(this);
      break;
    case goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD:
      this.transport_ = new goog.net.xpc.FrameElementMethodTransport(this);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_RELAY:
      this.transport_ = new goog.net.xpc.IframeRelayTransport(this);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_POLLING:
      this.transport_ = new goog.net.xpc.IframePollingTransport(this);
      break;
  }

  if (this.transport_) {
    goog.net.xpc.logger.info('Transport created: ' + this.transport_.getName());
  } else {
    throw Error('CrossPageChannel: No suitable transport found!');
  }
};


/**
 * Returns the transport type in use for this channel.
 * @return {number} Transport-type identifier.
 */
goog.net.xpc.CrossPageChannel.prototype.getTransportType = function() {
  return this.transport_.getType();
};


/**
 * Returns the tranport name in use for this channel.
 * @return {string} The transport name.
 */
goog.net.xpc.CrossPageChannel.prototype.getTransportName = function() {
  return this.transport_.getName();
};


/**
 * @return {Object} Configuration-object to be used by the peer to
 *     initialize the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.getPeerConfiguration = function() {
  var peerCfg = {};
  peerCfg[goog.net.xpc.CfgFields.CHANNEL_NAME] = this.name;
  peerCfg[goog.net.xpc.CfgFields.TRANSPORT] =
      this.cfg_[goog.net.xpc.CfgFields.TRANSPORT];

  if (this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]) {
    peerCfg[goog.net.xpc.CfgFields.PEER_RELAY_URI] =
        this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI];
  }
  if (this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]){
    peerCfg[goog.net.xpc.CfgFields.PEER_POLL_URI] =
        this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI];
  }
  if (this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]) {
    peerCfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] =
        this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI];
  }

  return peerCfg;
};


/**
 * Creates the iframe containing the peer page in a specified parent element.
 * This method does not connect the channel, connect() still has to be called
 * separately.
 *
 * @param {!Element} parentElm The container element the iframe is appended to.
 * @param {Function} opt_configureIframeCb If present, this function gets
 *     called with the iframe element as parameter to allow setting properties
 *     on it before it gets added to the DOM. If absent, the iframe's width and
 *     height are set to '100%'.
 * @param {boolean} opt_addCfgParam Whether to add the peer configuration as
 *     URL parameter (default: true).
 * @return {!HTMLIFrameElement} The iframe element.
 */
goog.net.xpc.CrossPageChannel.prototype.createPeerIframe = function(
    parentElm, opt_configureIframeCb, opt_addCfgParam) {

  var iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID];
  if (!iframeId) {
    // Create a randomized ID for the iframe element to avoid
    // bfcache-related issues.
    iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID] =
        'xpcpeer' + goog.net.xpc.getRandomString(4);
  }

  // TODO Opera creates a history-entry when creating an iframe
  // programmatically as follows. Find a way which avoids this.

  var iframeElm = goog.dom.createElement('IFRAME');
  iframeElm.id = iframeElm.name = iframeId;
  if (opt_configureIframeCb) {
    opt_configureIframeCb(iframeElm);
  } else {
    iframeElm.style.width = iframeElm.style.height = '100%';
  }

  var peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI];
  if (goog.isString(peerUri)) {
    peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI] =
        new goog.Uri(peerUri);
  }

  // Add the channel configuration used by the peer as URL parameter.
  if (opt_addCfgParam !== false) {
    peerUri.setParameterValue('xpc',
                              goog.json.serialize(
                                  this.getPeerConfiguration())
                              );
  }

  if (goog.userAgent.GECKO || goog.userAgent.WEBKIT) {
    // Appending the iframe in a timeout to avoid a weird fastback issue, which
    // is present in Safari and Gecko.
    this.deferConnect_ = true;
    window.setTimeout(
        goog.bind(function() {
          this.deferConnect_ = false;
          parentElm.appendChild(iframeElm);
          iframeElm.src = peerUri.toString();
          goog.net.xpc.logger.info('peer iframe created (' + iframeId + ')');
          if (this.connectDeferred_) {
            this.connect(this.connectCb_);
          }
        }, this), 1);
  } else {
    iframeElm.src = peerUri.toString();
    parentElm.appendChild(iframeElm);
    goog.net.xpc.logger.info('peer iframe created (' + iframeId + ')');
  }

  return /** @type {!HTMLIFrameElement} */ (iframeElm);
};


/**
 * Flag whether connecting should be deferred.
 * @type {boolean}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.deferConnect_ = false;


/**
 * Flag to remember if connect() has been called.
 * @type {boolean}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.connectDeferred_ = false;


/**
 * Initiates connecting the channel. When this method is called, all the
 * information needed to connect the channel has to be available.
 *
 * @param {Function} opt_connectCb The function to be called when the
 * channel has been connected and is ready to be used.
 */
goog.net.xpc.CrossPageChannel.prototype.connect = function(opt_connectCb) {
  this.connectCb_ = opt_connectCb || goog.nullFunction;

  if (this.deferConnect_) {
    goog.net.xpc.logger.info('connect() deferred');
    this.connectDeferred_ = true;
    return;
  }

  goog.net.xpc.logger.info('connect()');
  if (this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]) {
    this.iframeElement_ = goog.dom.getElement(
        this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]);
  }
  if (this.iframeElement_) {
    var winObj = this.iframeElement_.contentWindow;
    // accessing the window using contentWindow doesn't work in safari
    if (!winObj) {
      winObj = window.frames[this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]];
    }
    this.setPeerWindowObject(winObj);
  }

  // if the peer window object has not been set at this point, we assume
  // being in an iframe and the channel is meant to be to the containing page
  if (!this.peerWindowObject_) {
    // throw an error if we are in the top window (== not in an iframe)
    if (window == top) {
      throw Error(
          "CrossPageChannel: Can't connect, peer window-object not set.");
    } else {
      this.setPeerWindowObject(window.parent);
    }
  }

  this.createTransport_();

  this.transport_.connect();
};


/**
 * Closes the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.close = function() {
  if (!this.isConnected()) return;
  this.state_ = goog.net.xpc.ChannelStates.CLOSED;
  this.transport_.dispose();
  this.transport_ = null;
  goog.net.xpc.logger.info('Channel "' + this.name + '" closed');
};


/**
 * Called by the transport when the channel is connected.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.notifyConnected_ = function() {
  if (this.isConnected()) {
    return;
  }
  this.state_ = goog.net.xpc.ChannelStates.CONNECTED;
  goog.net.xpc.logger.info('Channel "' + this.name + '" connected');
  this.connectCb_();
};


/**
 * Called by the transport in case of an unrecoverable failure.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.notifyTransportError_ = function() {
  goog.net.xpc.logger.info('Transport Error');
  this.close();
};


/**
 * Registers a service.
 *
 * @param {string} serviceName The name of the service.
 * @param {Function} callback The callback responsible to process incoming
 *     messages.
 * @param {boolean} opt_jsonEncoded If true, incoming messages for this
 *     service are expected to contain a JSON-encoded object and will be
 *     deserialized automatically.
 */
goog.net.xpc.CrossPageChannel.prototype.registerService = function(
    serviceName, callback, opt_jsonEncoded) {
  this.services_[serviceName] = {
    name: serviceName,
    callback: callback,
    jsonEncoded: !!opt_jsonEncoded
  };
};


/**
 * Sends a msg over the channel.
 *
 * @param {string} serviceName The name of the service this message
 *     should be delivered to.
 * @param {string|Object} payload The payload. If this is an object, it is
 *     serialized to JSON before sending.
 */
goog.net.xpc.CrossPageChannel.prototype.send = function(serviceName, payload) {
  if (!this.isConnected()) {
    goog.net.xpc.logger.severe('Can\'t send. Channel not connected.');
    return;
  }
  // Check if the peer is still around.
  // NOTE: This check is not reliable in IE, where a document in an
  // iframe does not get unloaded when removing the iframe element from the DOM.
  // TODO: Find something that works in IE as well.
  if (this.peerWindowObject_.closed) {
    goog.net.xpc.logger.severe('Peer has disappeared.');
    this.close();
    return;
  }
  if (goog.isObject(payload)) {
    payload = goog.json.serialize(payload);
  }
  this.transport_.send(serviceName, payload);
};


/**
 * Delivers messages to the appropriate service-handler.
 *
 * @param {string} serviceName The name of the port.
 * @param {string} payload The payload.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.deliver_ = function(serviceName,
                                                            payload) {

  // transport service?
  if (!serviceName ||
      serviceName == goog.net.xpc.TRANSPORT_SERVICE_) {
    this.transport_.transportServiceHandler(payload);
  } else {
    // only deliver messages if connected
    if (this.isConnected()) {
      var service = this.services_[serviceName];
      if (service) {
        if (service.jsonEncoded) {
          /** @preserveTry */
          try {
            payload = goog.json.parse(payload);
          } catch (e) {
            goog.net.xpc.logger.info('Error parsing JSON-encoded payload.');
            return;
          }
        }
        service.callback(payload);
      } else {
        goog.net.xpc.logger.info('CrossPageChannel::deliver_(): ' +
                                 'No such service: "' + serviceName + '" ' +
                                 '(payload: ' + payload + ')');
      }
    } else {
      goog.net.xpc.logger.info('CrossPageChannel::deliver_(): Not connected.');
    }
  }
};


/**
 * The role of the peer.
 * @enum {number}
 */
goog.net.xpc.CrossPageChannel.Role = {
  OUTER: 0,
  INNER: 1
};


/**
 * Returns the role of this channel (either inner or outer).
 * @return {number} The role of this channel.
 */
goog.net.xpc.CrossPageChannel.prototype.getRole = function() {
  return window.parent == this.peerWindowObject_ ?
      goog.net.xpc.CrossPageChannel.Role.INNER :
      goog.net.xpc.CrossPageChannel.Role.OUTER;
};


/**
 * Disposes of the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.disposeInternal = function() {
  goog.net.xpc.CrossPageChannel.superClass_.disposeInternal.call(this);

  this.close();

  this.peerWindowObject_ = null;
  this.iframeElement_ = null;
  delete this.services_;

  goog.net.xpc.channels_[this.name] = null;
};


/**
 * Disposes all channels.
 * @private
 */
goog.net.xpc.CrossPageChannel.disposeAll_ = function() {
  for (var name in goog.net.xpc.channels_) {
    var ch = goog.net.xpc.channels_[name];
    if (ch) {
      ch.dispose();
    }
  }
};
