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

goog.require('goog.Uri');
goog.require('goog.async.Deferred');
goog.require('goog.async.Delay');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.log');
goog.require('goog.messaging.AbstractChannel');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.ChannelStates');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.DirectTransport');
goog.require('goog.net.xpc.FrameElementMethodTransport');
goog.require('goog.net.xpc.IframePollingTransport');
goog.require('goog.net.xpc.IframeRelayTransport');
goog.require('goog.net.xpc.NativeMessagingTransport');
goog.require('goog.net.xpc.NixTransport');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.net.xpc.UriCfgFields');
goog.require('goog.string');
goog.require('goog.uri.utils');
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
  goog.net.xpc.CrossPageChannel.base(this, 'constructor');

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
   * The name of the channel. Please use
   * <code>updateChannelNameAndCatalog</code> to change this from the transports
   * vs changing the property directly.
   * @type {string}
   */
  this.name = this.cfg_[goog.net.xpc.CfgFields.CHANNEL_NAME] ||
      goog.net.xpc.getRandomString(10);

  /**
   * The dom helper to use for accessing the dom.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Collects deferred function calls which will be made once the connection
   * has been fully set up.
   * @type {!Array<function()>}
   * @private
   */
  this.deferredDeliveries_ = [];

  /**
   * An event handler used to listen for load events on peer iframes.
   * @type {!goog.events.EventHandler<!goog.net.xpc.CrossPageChannel>}
   * @private
   */
  this.peerLoadHandler_ = new goog.events.EventHandler(this);

  // If LOCAL_POLL_URI or PEER_POLL_URI is not available, try using
  // robots.txt from that host.
  cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] =
      cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] ||
      goog.uri.utils.getHost(this.domHelper_.getWindow().location.href) +
          '/robots.txt';
  // PEER_URI is sometimes undefined in tests.
  cfg[goog.net.xpc.CfgFields.PEER_POLL_URI] =
      cfg[goog.net.xpc.CfgFields.PEER_POLL_URI] ||
      goog.uri.utils.getHost(cfg[goog.net.xpc.CfgFields.PEER_URI] || '') +
          '/robots.txt';

  goog.net.xpc.channels[this.name] = this;

  if (!goog.events.getListener(window, goog.events.EventType.UNLOAD,
      goog.net.xpc.CrossPageChannel.disposeAll_)) {
    // Set listener to dispose all registered channels on page unload.
    goog.events.listenOnce(window, goog.events.EventType.UNLOAD,
        goog.net.xpc.CrossPageChannel.disposeAll_);
  }

  goog.log.info(goog.net.xpc.logger, 'CrossPageChannel created: ' + this.name);
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
 * A delay between the transport reporting as connected and the calling of the
 * connection callback.  Sometimes used to paper over timing vulnerabilities.
 * @type {goog.async.Delay}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.connectionDelay_ = null;


/**
 * A deferred which is set to non-null while a peer iframe is being created
 * but has not yet thrown its load event, and which fires when that load event
 * arrives.
 * @type {goog.async.Deferred}
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.peerWindowDeferred_ = null;


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
 * Returns the configuration object for this channel.
 * Package private. Do not call from outside goog.net.xpc.
 *
 * @return {Object} The configuration object for this channel.
 */
goog.net.xpc.CrossPageChannel.prototype.getConfig = function() {
  return this.cfg_;
};


/**
 * Returns a reference to the iframe-element.
 * Package private. Do not call from outside goog.net.xpc.
 *
 * @return {Object} A reference to the iframe-element.
 */
goog.net.xpc.CrossPageChannel.prototype.getIframeElement = function() {
  return this.iframeElement_;
};


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
 * Returns the window object the foreign document resides in.
 *
 * @return {Object} The window object of the peer.
 * @package
 */
goog.net.xpc.CrossPageChannel.prototype.getPeerWindowObject = function() {
  return this.peerWindowObject_;
};


/**
 * Determines whether the peer window is available (e.g. not closed).
 *
 * @return {boolean} Whether the peer window is available.
 * @package
 */
goog.net.xpc.CrossPageChannel.prototype.isPeerAvailable = function() {
  // NOTE(user): This check is not reliable in IE, where a document in an
  // iframe does not get unloaded when removing the iframe element from the DOM.
  // TODO(user): Find something that works in IE as well.
  // NOTE(user): "!this.peerWindowObject_.closed" evaluates to 'false' in IE9
  // sometimes even though typeof(this.peerWindowObject_.closed) is boolean and
  // this.peerWindowObject_.closed evaluates to 'false'. Casting it to a Boolean
  // results in sane evaluation. When this happens, it's in the inner iframe
  // when querying its parent's 'closed' status. Note that this is a different
  // case than mibuerge@'s note above.
  try {
    return !!this.peerWindowObject_ && !Boolean(this.peerWindowObject_.closed);
  } catch (e) {
    // If the window is closing, an error may be thrown.
    return false;
  }
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
  } else if (goog.userAgent.IE && goog.net.xpc.NixTransport.isNixSupported()) {
    transportType = goog.net.xpc.TransportTypes.NIX;
  } else {
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

  // TODO(user): Use goog.scope.
  var CfgFields = goog.net.xpc.CfgFields;

  if (!this.cfg_[CfgFields.TRANSPORT]) {
    this.cfg_[CfgFields.TRANSPORT] =
        this.determineTransportType_();
  }

  switch (this.cfg_[CfgFields.TRANSPORT]) {
    case goog.net.xpc.TransportTypes.NATIVE_MESSAGING:
      var protocolVersion = this.cfg_[
          CfgFields.NATIVE_TRANSPORT_PROTOCOL_VERSION] || 2;
      this.transport_ = new goog.net.xpc.NativeMessagingTransport(
          this,
          this.cfg_[CfgFields.PEER_HOSTNAME],
          this.domHelper_,
          !!this.cfg_[CfgFields.ONE_SIDED_HANDSHAKE],
          protocolVersion);
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
    case goog.net.xpc.TransportTypes.DIRECT:
      if (this.peerWindowObject_ &&
          goog.net.xpc.DirectTransport.isSupported(/** @type {!Window} */ (
              this.peerWindowObject_))) {
        this.transport_ =
            new goog.net.xpc.DirectTransport(this, this.domHelper_);
      } else {
        goog.log.info(
            goog.net.xpc.logger,
            'DirectTransport not supported for this window, peer window in' +
            ' different security context or not set yet.');
      }
      break;
  }

  if (this.transport_) {
    goog.log.info(goog.net.xpc.logger,
        'Transport created: ' + this.transport_.getName());
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
 * @return {!Object} Configuration-object to be used by the peer to
 *     initialize the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.getPeerConfiguration = function() {
  var peerCfg = {};
  peerCfg[goog.net.xpc.CfgFields.CHANNEL_NAME] = this.name;
  peerCfg[goog.net.xpc.CfgFields.TRANSPORT] =
      this.cfg_[goog.net.xpc.CfgFields.TRANSPORT];
  peerCfg[goog.net.xpc.CfgFields.ONE_SIDED_HANDSHAKE] =
      this.cfg_[goog.net.xpc.CfgFields.ONE_SIDED_HANDSHAKE];

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
  var role = this.cfg_[goog.net.xpc.CfgFields.ROLE];
  if (role) {
    peerCfg[goog.net.xpc.CfgFields.ROLE] =
        role == goog.net.xpc.CrossPageChannelRole.INNER ?
            goog.net.xpc.CrossPageChannelRole.OUTER :
            goog.net.xpc.CrossPageChannelRole.INNER;
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
  goog.log.info(goog.net.xpc.logger, 'createPeerIframe()');

  var iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID];
  if (!iframeId) {
    // Create a randomized ID for the iframe element to avoid
    // bfcache-related issues.
    iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID] =
        'xpcpeer' + goog.net.xpc.getRandomString(4);
  }

  // TODO(user) Opera creates a history-entry when creating an iframe
  // programmatically as follows. Find a way which avoids this.

  var iframeElm = goog.dom.getDomHelper(parentElm).createElement(
      goog.dom.TagName.IFRAME);
  iframeElm.id = iframeElm.name = iframeId;
  if (opt_configureIframeCb) {
    opt_configureIframeCb(iframeElm);
  } else {
    iframeElm.style.width = iframeElm.style.height = '100%';
  }

  this.cleanUpIncompleteConnection_();
  this.peerWindowDeferred_ =
      new goog.async.Deferred(undefined, this);
  var peerUri = this.getPeerUri(opt_addCfgParam);
  this.peerLoadHandler_.listenOnceWithScope(iframeElm, 'load',
      this.peerWindowDeferred_.callback, false, this.peerWindowDeferred_);

  if (goog.userAgent.GECKO || goog.userAgent.WEBKIT) {
    // Appending the iframe in a timeout to avoid a weird fastback issue, which
    // is present in Safari and Gecko.
    window.setTimeout(
        goog.bind(function() {
          parentElm.appendChild(iframeElm);
          iframeElm.src = peerUri.toString();
          goog.log.info(goog.net.xpc.logger,
              'peer iframe created (' + iframeId + ')');
        }, this), 1);
  } else {
    iframeElm.src = peerUri.toString();
    parentElm.appendChild(iframeElm);
    goog.log.info(goog.net.xpc.logger,
        'peer iframe created (' + iframeId + ')');
  }

  return /** @type {!HTMLIFrameElement} */ (iframeElm);
};


/**
 * Clean up after any incomplete attempt to establish and connect to a peer
 * iframe.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.cleanUpIncompleteConnection_ =
    function() {
  if (this.peerWindowDeferred_) {
    this.peerWindowDeferred_.cancel();
    this.peerWindowDeferred_ = null;
  }
  this.deferredDeliveries_.length = 0;
  this.peerLoadHandler_.removeAll();
};


/**
 * Returns the peer URI, with an optional URL parameter for configuring the peer
 * window.
 *
 * @param {boolean=} opt_addCfgParam Whether to add the peer configuration as
 *     URL parameter (default: true).
 * @return {!goog.Uri} The peer URI.
 */
goog.net.xpc.CrossPageChannel.prototype.getPeerUri = function(opt_addCfgParam) {
  var peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI];
  if (goog.isString(peerUri)) {
    peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI] =
        new goog.Uri(peerUri);
  }

  // Add the channel configuration used by the peer as URL parameter.
  if (opt_addCfgParam !== false) {
    peerUri.setParameterValue('xpc',
                              goog.json.serialize(
                                  this.getPeerConfiguration()));
  }

  return peerUri;
};


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

  // If this channel was previously closed, transition back to the NOT_CONNECTED
  // state to ensure that the connection can proceed (xpcDeliver blocks
  // transport messages while the connection state is CLOSED).
  if (this.state_ == goog.net.xpc.ChannelStates.CLOSED) {
    this.state_ = goog.net.xpc.ChannelStates.NOT_CONNECTED;
  }

  // If we know of a peer window whose creation has been requested but is not
  // complete, peerWindowDeferred_ will be non-null, and we should block on it.
  if (this.peerWindowDeferred_) {
    this.peerWindowDeferred_.addCallback(this.continueConnection_);
  } else {
    this.continueConnection_();
  }
};


/**
 * Continues the connection process once we're as sure as we can be that the
 * peer iframe has been created.
 * @private
 */
goog.net.xpc.CrossPageChannel.prototype.continueConnection_ = function() {
  goog.log.info(goog.net.xpc.logger, 'continueConnection_()');
  this.peerWindowDeferred_ = null;
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
    if (window == window.top) {
      throw Error(
          "CrossPageChannel: Can't connect, peer window-object not set.");
    } else {
      this.setPeerWindowObject(window.parent);
    }
  }

  this.createTransport_();

  this.transport_.connect();

  // Now we run any deferred deliveries collected while connection was deferred.
  while (this.deferredDeliveries_.length > 0) {
    this.deferredDeliveries_.shift()();
  }
};


/**
 * Closes the channel.
 */
goog.net.xpc.CrossPageChannel.prototype.close = function() {
  this.cleanUpIncompleteConnection_();
  this.state_ = goog.net.xpc.ChannelStates.CLOSED;
  goog.dispose(this.transport_);
  this.transport_ = null;
  this.connectCb_ = null;
  goog.dispose(this.connectionDelay_);
  this.connectionDelay_ = null;
  goog.log.info(goog.net.xpc.logger, 'Channel "' + this.name + '" closed');
};


/**
 * Package-private.
 * Called by the transport when the channel is connected.
 * @param {number=} opt_delay Delay this number of milliseconds before calling
 *     the connection callback. Usage is discouraged, but can be used to paper
 *     over timing vulnerabilities when there is no alternative.
 */
goog.net.xpc.CrossPageChannel.prototype.notifyConnected = function(opt_delay) {
  if (this.isConnected() ||
      (this.connectionDelay_ && this.connectionDelay_.isActive())) {
    return;
  }
  this.state_ = goog.net.xpc.ChannelStates.CONNECTED;
  goog.log.info(goog.net.xpc.logger, 'Channel "' + this.name + '" connected');
  goog.dispose(this.connectionDelay_);
  if (goog.isDef(opt_delay)) {
    this.connectionDelay_ =
        new goog.async.Delay(this.connectCb_, opt_delay);
    this.connectionDelay_.start();
  } else {
    this.connectionDelay_ = null;
    this.connectCb_();
  }
};


/**
 * Called by the transport in case of an unrecoverable failure.
 * Package private. Do not call from outside goog.net.xpc.
 */
goog.net.xpc.CrossPageChannel.prototype.notifyTransportError = function() {
  goog.log.info(goog.net.xpc.logger, 'Transport Error');
  this.close();
};


/** @override */
goog.net.xpc.CrossPageChannel.prototype.send = function(serviceName, payload) {
  if (!this.isConnected()) {
    goog.log.error(goog.net.xpc.logger, 'Can\'t send. Channel not connected.');
    return;
  }
  // Check if the peer is still around.
  if (!this.isPeerAvailable()) {
    goog.log.error(goog.net.xpc.logger, 'Peer has disappeared.');
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
 * Delivers messages to the appropriate service-handler. Named xpcDeliver to
 * avoid name conflict with {@code deliver} function in superclass
 * goog.messaging.AbstractChannel.
 *
 * @param {string} serviceName The name of the port.
 * @param {string} payload The payload.
 * @param {string=} opt_origin An optional origin for the message, where the
 *     underlying transport makes that available.  If this is specified, and
 *     the PEER_HOSTNAME parameter was provided, they must match or the message
 *     will be rejected.
 * @package
 */
goog.net.xpc.CrossPageChannel.prototype.xpcDeliver = function(
    serviceName, payload, opt_origin) {

  // This check covers the very rare (but producable) case where the inner frame
  // becomes ready and sends its setup message while the outer frame is
  // deferring its connect method waiting for the inner frame to be ready. The
  // resulting deferral ensures the message will not be processed until the
  // channel is fully configured.
  if (this.peerWindowDeferred_) {
    this.deferredDeliveries_.push(
        goog.bind(this.xpcDeliver, this, serviceName, payload, opt_origin));
    return;
  }

  // Check whether the origin of the message is as expected.
  if (!this.isMessageOriginAcceptable_(opt_origin)) {
    goog.log.warning(goog.net.xpc.logger,
        'Message received from unapproved origin "' +
        opt_origin + '" - rejected.');
    return;
  }

  // If there is another channel still open, the native transport's global
  // postMessage listener will still be active.  This will mean that messages
  // being sent to the now-closed channel will still be received and delivered,
  // such as transport service traffic from its previous correspondent in the
  // other frame.  Ensure these messages don't cause exceptions.
  // Example: http://b/12419303
  if (this.isDisposed() || this.state_ == goog.net.xpc.ChannelStates.CLOSED) {
    goog.log.warning(goog.net.xpc.logger,
        'CrossPageChannel::xpcDeliver(): Channel closed.');
  } else if (!serviceName ||
      serviceName == goog.net.xpc.TRANSPORT_SERVICE_) {
    this.transport_.transportServiceHandler(payload);
  } else {
    // only deliver messages if connected
    if (this.isConnected()) {
      this.deliver(this.unescapeServiceName_(serviceName), payload);
    } else {
      goog.log.info(goog.net.xpc.logger,
          'CrossPageChannel::xpcDeliver(): Not connected.');
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
 * Returns the role of this channel (either inner or outer).
 * @return {number} The role of this channel.
 */
goog.net.xpc.CrossPageChannel.prototype.getRole = function() {
  var role = this.cfg_[goog.net.xpc.CfgFields.ROLE];
  if (goog.isNumber(role)) {
    return role;
  } else {
    return window.parent == this.peerWindowObject_ ?
        goog.net.xpc.CrossPageChannelRole.INNER :
        goog.net.xpc.CrossPageChannelRole.OUTER;
  }
};


/**
 * Sets the channel name. Note, this doesn't establish a unique channel to
 * communicate on.
 * @param {string} name The new channel name.
 */
goog.net.xpc.CrossPageChannel.prototype.updateChannelNameAndCatalog = function(
    name) {
  goog.log.fine(goog.net.xpc.logger, 'changing channel name to ' + name);
  delete goog.net.xpc.channels[this.name];
  this.name = name;
  goog.net.xpc.channels[name] = this;
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
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(opt_origin)) ||
      goog.string.isEmptyOrWhitespace(goog.string.makeSafe(peerHostname)) ||
      opt_origin == this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME];
};


/** @override */
goog.net.xpc.CrossPageChannel.prototype.disposeInternal = function() {
  this.close();

  this.peerWindowObject_ = null;
  this.iframeElement_ = null;
  delete goog.net.xpc.channels[this.name];
  goog.dispose(this.peerLoadHandler_);
  delete this.peerLoadHandler_;
  goog.net.xpc.CrossPageChannel.base(this, 'disposeInternal');
};


/**
 * Disposes all channels.
 * @private
 */
goog.net.xpc.CrossPageChannel.disposeAll_ = function() {
  for (var name in goog.net.xpc.channels) {
    goog.dispose(goog.net.xpc.channels[name]);
  }
};
