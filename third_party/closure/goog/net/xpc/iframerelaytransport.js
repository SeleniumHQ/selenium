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
 * @fileoverview Contains the iframe relay tranport.
 */


goog.provide('goog.net.xpc.IframeRelayTransport');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.events');
goog.require('goog.html.SafeHtml');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.Transport');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.userAgent');



/**
 * Iframe relay transport. Creates hidden iframes containing a document
 * from the peer's origin. Data is transferred in the fragment identifier.
 * Therefore the document loaded in the iframes can be served from the
 * browser's cache.
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this
 *     transport belongs to.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for finding
 *     the correct window.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 * @final
 */
goog.net.xpc.IframeRelayTransport = function(channel, opt_domHelper) {
  goog.net.xpc.IframeRelayTransport.base(this, 'constructor', opt_domHelper);

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
      this.channel_.getConfig()[goog.net.xpc.CfgFields.PEER_RELAY_URI];

  /**
   * The id of the iframe the peer page lives in.
   * @type {string}
   * @private
   */
  this.peerIframeId_ =
      this.channel_.getConfig()[goog.net.xpc.CfgFields.IFRAME_ID];

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
   * @type {Array<Object>}
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
   * @type {number}
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
      goog.net.xpc.IframeRelayTransport.cleanupTimer_ =
          window.setTimeout(function() {
            goog.net.xpc.IframeRelayTransport.cleanup_();
          }, goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_);
    }
  };


  /**
   * Remove all relay-iframes which are older than the maximal age.
   * @param {number=} opt_maxAge The maximal age in milliseconds.
   * @private
   */
  goog.net.xpc.IframeRelayTransport.cleanup_ = function(opt_maxAge) {
    var now = goog.now();
    var maxAge =
        opt_maxAge || goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_;

    while (goog.net.xpc.IframeRelayTransport.iframeRefs_.length &&
           now - goog.net.xpc.IframeRelayTransport.iframeRefs_[0].timestamp >=
               maxAge) {
      var ifr =
          goog.net.xpc.IframeRelayTransport.iframeRefs_.shift().iframeElement;
      goog.dom.removeNode(ifr);
      goog.log.log(
          goog.net.xpc.logger, goog.log.Level.FINEST, 'iframe removed');
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
 * Maximum sendable size of a payload via a single iframe in IE.
 * @type {number}
 * @private
 */
goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_ = 1800;


/**
 * @typedef {{fragments: !Array<string>, received: number, expected: number}}
 */
goog.net.xpc.IframeRelayTransport.FragmentInfo;


/**
 * Used to track incoming payload fragments. The implementation can process
 * incoming fragments from several channels at a time, even if data is
 * out-of-order or interleaved.
 *
 * @type {!Object<string, !goog.net.xpc.IframeRelayTransport.FragmentInfo>}
 * @private
 */
goog.net.xpc.IframeRelayTransport.fragmentMap_ = {};


/**
 * The transport type.
 * @type {number}
 * @override
 */
goog.net.xpc.IframeRelayTransport.prototype.transportType =
    goog.net.xpc.TransportTypes.IFRAME_RELAY;


/**
 * Connects this transport.
 * @override
 */
goog.net.xpc.IframeRelayTransport.prototype.connect = function() {
  if (!this.getWindow()['xpcRelay']) {
    this.getWindow()['xpcRelay'] =
        goog.net.xpc.IframeRelayTransport.receiveMessage_;
  }

  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP);
};


/**
 * Processes an incoming message.
 *
 * @param {string} channelName The name of the channel.
 * @param {string} frame The raw frame content.
 * @private
 */
goog.net.xpc.IframeRelayTransport.receiveMessage_ = function(
    channelName, frame) {
  var pos = frame.indexOf(':');
  var header = frame.substr(0, pos);
  var payload = frame.substr(pos + 1);

  if (!goog.userAgent.IE || (pos = header.indexOf('|')) == -1) {
    // First, the easy case.
    var service = header;
  } else {
    // There was a fragment id in the header, so this is a message
    // fragment, not a whole message.
    var service = header.substr(0, pos);
    var fragmentIdStr = header.substr(pos + 1);

    // Separate the message id string and the fragment number. Note that
    // there may be a single leading + in the argument to parseInt, but
    // this is harmless.
    pos = fragmentIdStr.indexOf('+');
    var messageIdStr = fragmentIdStr.substr(0, pos);
    var fragmentNum = parseInt(fragmentIdStr.substr(pos + 1), 10);
    var fragmentInfo =
        goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr];
    if (!fragmentInfo) {
      fragmentInfo =
          goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr] =
              {fragments: [], received: 0, expected: 0};
    }

    if (goog.string.contains(fragmentIdStr, '++')) {
      fragmentInfo.expected = fragmentNum + 1;
    }
    fragmentInfo.fragments[fragmentNum] = payload;
    fragmentInfo.received++;

    if (fragmentInfo.received != fragmentInfo.expected) {
      return;
    }

    // We've received all outstanding fragments; combine what we've received
    // into payload and fall out to the call to xpcDeliver.
    payload = fragmentInfo.fragments.join('');
    delete goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr];
  }

  goog.net.xpc.channels[channelName].xpcDeliver(
      service, decodeURIComponent(payload));
};


/**
 * Handles transport service messages (internal signalling).
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.IframeRelayTransport.prototype.transportServiceHandler = function(
    payload) {
  if (payload == goog.net.xpc.SETUP) {
    // TODO(user) Safari swallows the SETUP_ACK from the iframe to the
    // container after hitting reload.
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
    this.channel_.notifyConnected();
  } else if (payload == goog.net.xpc.SETUP_ACK_) {
    this.channel_.notifyConnected();
  }
};


/**
 * Sends a message.
 *
 * @param {string} service Name of service this the message has to be delivered.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.IframeRelayTransport.prototype.send = function(service, payload) {
  // If we're on IE and the post-encoding payload is large, split it
  // into multiple payloads and send each one separately. Otherwise,
  // just send the whole thing.
  var encodedPayload = encodeURIComponent(payload);
  var encodedLen = encodedPayload.length;
  var maxSize = goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_;

  if (goog.userAgent.IE && encodedLen > maxSize) {
    // A probabilistically-unique string used to link together all fragments
    // in this message.
    var messageIdStr = goog.string.getRandomString();

    for (var startIndex = 0, fragmentNum = 0; startIndex < encodedLen;
         fragmentNum++) {
      var payloadFragment = encodedPayload.substr(startIndex, maxSize);
      startIndex += maxSize;
      var fragmentIdStr =
          messageIdStr + (startIndex >= encodedLen ? '++' : '+') + fragmentNum;
      this.send_(service, payloadFragment, fragmentIdStr);
    }
  } else {
    this.send_(service, encodedPayload);
  }
};


/**
 * Sends an encoded message or message fragment.
 * @param {string} service Name of service this the message has to be delivered.
 * @param {string} encodedPayload The message content, URI encoded.
 * @param {string=} opt_fragmentIdStr If sending a fragment, a string that
 *     identifies the fragment.
 * @private
 */
goog.net.xpc.IframeRelayTransport.prototype.send_ = function(
    service, encodedPayload, opt_fragmentIdStr) {
  // IE requires that we create the onload attribute inline, otherwise the
  // handler is not triggered
  if (goog.userAgent.IE) {
    var div = this.getWindow().document.createElement(goog.dom.TagName.DIV);
    // TODO(user): It might be possible to set the sandbox attribute
    // to restrict the privileges of the created iframe.
    goog.dom.safe.setInnerHtml(
        div, goog.html.SafeHtml.createIframe(null, null, {
          'onload': goog.string.Const.from('this.xpcOnload()'),
          'sandbox': null
        }));
    var ifr = div.childNodes[0];
    div = null;
    ifr['xpcOnload'] = goog.net.xpc.IframeRelayTransport.iframeLoadHandler_;
  } else {
    var ifr = this.getWindow().document.createElement(goog.dom.TagName.IFRAME);

    if (goog.userAgent.WEBKIT) {
      // safari doesn't fire load-events on iframes.
      // keep a reference and remove after a timeout.
      goog.net.xpc.IframeRelayTransport.iframeRefs_.push(
          {timestamp: goog.now(), iframeElement: ifr});
    } else {
      goog.events.listen(
          ifr, 'load', goog.net.xpc.IframeRelayTransport.iframeLoadHandler_);
    }
  }

  var style = ifr.style;
  style.visibility = 'hidden';
  style.width = ifr.style.height = '0px';
  style.position = 'absolute';

  var url = this.peerRelayUri_;
  url += '#' + this.channel_.name;
  if (this.peerIframeId_) {
    url += ',' + this.peerIframeId_;
  }
  url += '|' + service;
  if (opt_fragmentIdStr) {
    url += '|' + opt_fragmentIdStr;
  }
  url += ':' + encodedPayload;

  ifr.src = url;

  this.getWindow().document.body.appendChild(ifr);

  goog.log.log(goog.net.xpc.logger, goog.log.Level.FINEST, 'msg sent: ' + url);
};


/**
 * The iframe load handler. Gets called as method on the iframe element.
 * @private
 * @this {Element}
 */
goog.net.xpc.IframeRelayTransport.iframeLoadHandler_ = function() {
  goog.log.log(goog.net.xpc.logger, goog.log.Level.FINEST, 'iframe-load');
  goog.dom.removeNode(this);
  this.xpcOnload = null;
};


/** @override */
goog.net.xpc.IframeRelayTransport.prototype.disposeInternal = function() {
  goog.net.xpc.IframeRelayTransport.base(this, 'disposeInternal');
  if (goog.userAgent.WEBKIT) {
    goog.net.xpc.IframeRelayTransport.cleanup_(0);
  }
};
