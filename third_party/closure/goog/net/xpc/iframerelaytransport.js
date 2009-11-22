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
 * @fileoverview Contains the iframe relay tranport.
 */


goog.provide('goog.net.xpc.IframeRelayTransport');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.Transport');
goog.require('goog.userAgent');


/**
 * Iframe relay transport. Creates hidden iframes containing a document
 * from the peer's origin. Data is transferred in the fragment identifier.
 * Therefore the document loaded in the iframes can be served from the
 * browser's cache.
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this
 *     transport belongs to.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 */
goog.net.xpc.IframeRelayTransport = function(channel) {
  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The URI used to relay data to the peer.
   * @type {string}
   * @private
   */
  this.peerRelayUri_ =
      this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI];

  /**
   * The id of the iframe the peer page lives in.
   * @type {string}
   * @private
   */
  this.peerIframeId_ = this.channel_.cfg_[goog.net.xpc.CfgFields.IFRAME_ID];

  if (goog.userAgent.WEBKIT) {
    goog.net.xpc.IframeRelayTransport.startCleanupTimer_();
  }
};
goog.inherits(goog.net.xpc.IframeRelayTransport, goog.net.xpc.Transport);


if (goog.userAgent.WEBKIT) {
  /**
   * Array to keep references to the relay-iframes. Used only if
   * there is no way to detect when the iframes are loaded. In that
   * case the relay-iframes are removed after a timeout.
   * @type {Array.<Object>}
   * @private
   */
  goog.net.xpc.IframeRelayTransport.iframeRefs_ = [];


  /**
   * Interval at which iframes are destroyed.
   * @type {number}
   * @private
   */
  goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_ = 1000;


  /**
   * Time after which a relay-iframe is destroyed.
   * @private
   */
  goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_ = 3000;


  /**
   * The cleanup timer id.
   * @type {number}
   * @private
   */
  goog.net.xpc.IframeRelayTransport.cleanupTimer_ = 0;


  /**
   * Starts the cleanup timer.
   * @private
   */
  goog.net.xpc.IframeRelayTransport.startCleanupTimer_ = function() {
    if (!goog.net.xpc.IframeRelayTransport.cleanupTimer_) {
      goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(
          function() { goog.net.xpc.IframeRelayTransport.cleanup_(); },
          goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_);
    }
  };


  /**
   * Remove all relay-iframes which are older than the maximal age.
   * @param {number} opt_maxAge The maximal age in milliseconds.
   * @private
   */
  goog.net.xpc.IframeRelayTransport.cleanup_ = function(opt_maxAge) {
    var now = goog.now();
    var maxAge =
        opt_maxAge || goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_;

    while (goog.net.xpc.IframeRelayTransport.iframeRefs_.length &&
           now - goog.net.xpc.IframeRelayTransport.iframeRefs_[0].timestamp >=
           maxAge) {
      var ifr = goog.net.xpc.IframeRelayTransport.iframeRefs_.
          shift().iframeElement;
      goog.dom.removeNode(ifr);
      goog.net.xpc.logger.finest('iframe removed');
    }

    goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(
        goog.net.xpc.IframeRelayTransport.cleanupCb_,
        goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_);
  };


  /**
   * Function which wraps cleanup_().
   * @private
   */
  goog.net.xpc.IframeRelayTransport.cleanupCb_ = function() {
    goog.net.xpc.IframeRelayTransport.cleanup_();
  };
}


/**
 * The transport type.
 * @type {number}
 */
goog.net.xpc.IframeRelayTransport.prototype.transportType =
  goog.net.xpc.TransportTypes.IFRAME_RELAY;


/**
 * Connects this transport.
 */
goog.net.xpc.IframeRelayTransport.prototype.connect = function() {
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP);
};


/**
 * Handles transport service messages (internal signalling).
 * @param {string} payload The message content.
 */
goog.net.xpc.IframeRelayTransport.prototype.transportServiceHandler =
    function(payload) {
  if (payload == goog.net.xpc.SETUP) {
    // TODO Safari swallows the SETUP_ACK from the iframe to the
    // container after hitting reload.
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
    this.channel_.notifyConnected_();
  }
  else if (payload == goog.net.xpc.SETUP_ACK_) {
    this.channel_.notifyConnected_();
  }
};


/**
 * Sends a message.
 *
 * @param {string} service Name of service this the message has to be delivered.
 * @param {string} payload The message content.
 */
goog.net.xpc.IframeRelayTransport.prototype.send = function(service, payload) {
  // IE requires that we create the onload attribute inline, otherwise the
  // handler is not triggered
  if (goog.userAgent.IE) {
    var div = document.createElement('div');
    div.innerHTML = '<iframe onload="this.xpcOnload()"></iframe>';
    var ifr = div.childNodes[0];
    div = null;
    ifr.xpcOnload = goog.net.xpc.IframeRelayTransport.iframeLoadHandler_;
  } else {
    var ifr = document.createElement('iframe');

    if (goog.userAgent.WEBKIT) {
      // safari doesn't fire load-events on iframes.
      // keep a reference and remove after a timeout.
      goog.net.xpc.IframeRelayTransport.iframeRefs_.push({
        timestamp: goog.now(),
        iframeElement: ifr
      });
    } else {
      goog.events.listen(ifr, 'load',
                         goog.net.xpc.IframeRelayTransport.iframeLoadHandler_);
    }
  }

  var style = ifr.style;
  style.visibility = 'hidden';
  style.width = ifr.style.height = '0px';
  style.position = 'absolute';

  // TODO Split payload in multiple parts (frames) in case we are
  // in IE and the constructed URL exceeds IE's 4K-limit.

  var url = this.peerRelayUri_;
  url += '#' + this.channel_.name;
  if (this.peerIframeId_) {
    url += ',' + this.peerIframeId_;
  }
  url += '|' + service + ':' + encodeURIComponent(payload);

  ifr.src = url;

  document.body.appendChild(ifr);

  goog.net.xpc.logger.finest('msg sent: ' + url);
};


/**
 * The iframe load handler. Gets called as method on the iframe element.
 * @private
 * @this Element
 */
goog.net.xpc.IframeRelayTransport.iframeLoadHandler_ = function() {
  goog.net.xpc.logger.finest('iframe-load');
  goog.dom.removeNode(this);
  this.xpcOnload = null;
};


/**
 * Processes an incoming message.
 *
 * @param {string} channelName The name of the channel.
 * @param {string} frame The raw frame content.
 */
window['xpcRelay'] =
    function(channelName, frame) {
  var pos = frame.indexOf(':');
  var service = frame.substring(0, pos);
  var payload = frame.substring(pos + 1);

  goog.net.xpc.channels_[channelName].deliver_(service,
                                               decodeURIComponent(payload));
};


/**
 * Disposes of the transport.
 */
goog.net.xpc.IframeRelayTransport.prototype.disposeInternal = function() {
  goog.net.xpc.IframeRelayTransport.superClass_.disposeInternal.call(this);
  if (goog.userAgent.WEBKIT) {
    goog.net.xpc.IframeRelayTransport.cleanup_(0);
  }
};
