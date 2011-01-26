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
 * @fileoverview Provides the class CrossPageChannel, the main class in
 * goog.net.xpc.
 *
 * @see ../../demos/xpc/index.html
 */

goog.provide('goog.net.xpc.CrossPageChannel');
goog.provide('goog.net.xpc.CrossPageChannel.Role');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.messaging.AbstractChannel');
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
 * @param {goog.dom.DomHelper=} opt_domHelper The optional dom helper to
 *     use for looking up elements in the dom.
 * @constructor
 * @extends {goog.messaging.AbstractChannel}
 */
goog.net.xpc.CrossPageChannel = function(cfg, opt_domHelper) {
  goog.base(this);

  for (var i = 0, uriField; uriField = goog.net.xpc.UriCfgFields[i]; i++) {
    if (uriField in cfg && !/^https?:\/\//.test(cfg[uriField])) {
      throw Error('URI ' + cfg[uriField] + ' is invalid for field ' + uriField);
    }
  }

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
   * The dom helper to use for accessing the dom.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();

  goog.net.xpc.channels_[this.name] = this;

  goog.events.listen(window, 'unload',
      goog.net.xpc.CrossPageChannel.disposeAll_);

  goog.net.xpc.logger.info('CrossPageChannel created: ' + this.name);
};
goog.inherits(goog.net.xpc.CrossPageChannel, goog.messaging.AbstractChannel);


/**
 * Regexp for escaping service names.
 * @type {RegExp}
 * @private
 */
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_ =
    new RegExp('^%*' + goog.net.xpc.TRANSPORT_SERVICE_ + '$');



/**
 * Regexp for unescaping service names.
 * @type {RegExp}
 * @private
 */
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_ =
    new RegExp('^%+' + goog.net.xpc.TRANSPORT_SERVICE_ + '$');

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
 * @override
 * @return {boolean} Whether the channel is connected.
 */
goog.net.xpc.CrossPageChannel.prototype.isConnected = function() {
  return this.state_ == goog.net.xpc.ChannelStates.CONNECTED;
};


/**
 * Reference to the window-object of the peer page.
 * @type {Object}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.peerWindowObject_ = null;


/**
 * Reference to the iframe-element.
 * @type {Object}
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
          this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME],
          this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.NIX:
      this.transport_ = new goog.net.xpc.NixTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD:
      this.transport_ =
          new goog.net.xpc.FrameElementMethodTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_RELAY:
      this.transport_ =
          new goog.net.xpc.IframeRelayTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_POLLING:
      this.transport_ =
          new goog.net.xpc.IframePollingTransport(this, this.domHelper_);
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
  if (this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]) {
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
 * @param {Function=} opt_configureIframeCb If present, this function gets
 *     called with the iframe element as parameter to allow setting properties
 *     on it before it gets added to the DOM. If absent, the iframe's width and
 *     height are set to '100%'.
 * @param {boolean=} opt_addCfgParam Whether to add the peer configuration as
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

  // TODO(user) Opera creates a history-entry when creating an iframe
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
 * @override
 * @param {Function=} opt_connectCb The function to be called when the
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
    this.iframeElement_ = this.domHelper_.getElement(
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


/** @inheritDoc */
goog.net.xpc.CrossPageChannel.prototype.send = function(serviceName, payload) {
  if (!this.isConnected()) {
    goog.net.xpc.logger.severe('Can\'t send. Channel not connected.');
    return;
  }
  // Check if the peer is still around.
  // NOTE(user): This check is not reliable in IE, where a document in an
  // iframe does not get unloaded when removing the iframe element from the DOM.
  // TODO(user): Find something that works in IE as well.
  if (this.peerWindowObject_.closed) {
    goog.net.xpc.logger.severe('Peer has disappeared.');
    this.close();
    return;
  }
  if (goog.isObject(payload)) {
    payload = goog.json.serialize(payload);
  }

  // Partially URL-encode the service name because some characters (: and |) are
  // used as delimiters for some transports, and we want to allow those
  // characters in service names.
  this.transport_.send(this.escapeServiceName_(serviceName), payload);
};


/**
 * Delivers messages to the appropriate service-handler.
 *
 * @param {string} serviceName The name of the port.
 * @param {string} payload The payload.
 * @param {string=} opt_origin An optional origin for the message, where the
 *     underlying transport makes that available.  If this is specified, and
 *     the PEER_HOSTNAME parameter was provided, they must match or the message
 *     will be rejected.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.deliver_ = function(
    serviceName, payload, opt_origin) {
  // Check whether the origin of the message is as expected.
  if (!this.isMessageOriginAcceptable_(opt_origin)) {
    goog.net.xpc.logger.warning('Message received from unapproved origin "' +
        opt_origin + '" - rejected.');
    return;
  }

  if (this.isDisposed()) {
    goog.net.xpc.logger.warning('CrossPageChannel::deliver_(): Disposed.');
  } else if (!serviceName ||
      serviceName == goog.net.xpc.TRANSPORT_SERVICE_) {
    this.transport_.transportServiceHandler(payload);
  } else {
    // only deliver messages if connected
    if (this.isConnected()) {
      this.deliver(this.unescapeServiceName_(serviceName), payload);
    } else {
      goog.net.xpc.logger.info('CrossPageChannel::deliver_(): Not connected.');
    }
  }
};


/**
 * Escape the user-provided service name for sending across the channel. This
 * URL-encodes certain special characters so they don't conflict with delimiters
 * used by some of the transports, and adds a special prefix if the name
 * conflicts with the reserved transport service name.
 *
 * This is the opposite of {@link #unescapeServiceName_}.
 *
 * @param {string} name The name of the service to escape.
 * @return {string} The escaped service name.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.escapeServiceName_ = function(name) {
  if (goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_.test(name)) {
    name = '%' + name;
  }
  return name.replace(/[%:|]/g, encodeURIComponent);
};


/**
 * Unescape the escaped service name that was sent across the channel. This is
 * the opposite of {@link #escapeServiceName_}.
 *
 * @param {string} name The name of the service to unescape.
 * @return {string} The unescaped service name.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.unescapeServiceName_ = function(name) {
  name = name.replace(/%[0-9a-f]{2}/gi, decodeURIComponent);
  if (goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_.test(name)) {
    return name.substring(1);
  } else {
    return name;
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
 * Returns whether an incoming message with the given origin is acceptable.
 * If an incoming request comes with a specified (non-empty) origin, and the
 * PEER_HOSTNAME config parameter has also been provided, the two must match,
 * or the message is unacceptable.
 * @param {string=} opt_origin The origin associated with the incoming message.
 * @return {boolean} Whether the message is acceptable.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.isMessageOriginAcceptable_ = function(
    opt_origin) {
  var peerHostname = this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME];
  return goog.string.isEmptySafe(opt_origin) ||
      goog.string.isEmptySafe(peerHostname) ||
      opt_origin == this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME];
};


/**
 * Disposes of the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  this.close();

  this.peerWindowObject_ = null;
  this.iframeElement_ = null;
  delete goog.net.xpc.channels_[this.name];
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
