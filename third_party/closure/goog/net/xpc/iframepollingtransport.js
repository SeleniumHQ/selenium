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
 * @fileoverview Contains the iframe polling transport.
 */


goog.provide('goog.net.xpc.IframePollingTransport');
goog.provide('goog.net.xpc.IframePollingTransport.Receiver');
goog.provide('goog.net.xpc.IframePollingTransport.Sender');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.Transport');
goog.require('goog.userAgent');



/**
 * Iframe polling transport. Uses hidden iframes to transfer data
 * in the fragment identifier of the URL. The peer polls the iframe's location
 * for changes.
 * Unfortunately, in Safari this screws up the history, because Safari doesn't
 * allow to call location.replace() on a window containing a document from a
 * different domain (last version tested: 2.0.4).
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this
 *     transport belongs to.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for finding
 *     the correct window.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 */
goog.net.xpc.IframePollingTransport = function(channel, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The URI used to send messages.
   * @type {string}
   * @private
   */
  this.sendUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI];

  /**
   * The URI which is polled for incoming messages.
   * @type {string}
   * @private
   */
  this.rcvUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI];

  /**
   * The queue to hold messages which can't be sent immediately.
   * @type {Array}
   * @private
   */
  this.sendQueue_ = [];
};
goog.inherits(goog.net.xpc.IframePollingTransport, goog.net.xpc.Transport);


/**
 * The number of times the inner frame will check for evidence of the outer
 * frame before it tries its reconnection sequence.  These occur at 100ms
 * intervals, making this an effective max waiting period of 500ms.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.pollsBeforeReconnect_ = 5;


/**
 * The transport type.
 * @type {number}
 * @protected
 * @override
 */
goog.net.xpc.IframePollingTransport.prototype.transportType =
    goog.net.xpc.TransportTypes.IFRAME_POLLING;


/**
 * Sequence counter.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.sequence_ = 0;


/**
 * Flag indicating whether we are waiting for an acknoledgement.
 * @type {boolean}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.waitForAck_ = false;


/**
 * Flag indicating if channel has been initialized.
 * @type {boolean}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.initialized_ = false;


/**
 * Reconnection iframe created by inner peer.
 * @type {Element}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.reconnectFrame_ = null;


/**
 * The string used to prefix all iframe names and IDs.
 * @type {string}
 */
goog.net.xpc.IframePollingTransport.IFRAME_PREFIX = 'googlexpc';


/**
 * Returns the name/ID of the message frame.
 * @return {string} Name of message frame.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.getMsgFrameName_ = function() {
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + '_' +
      this.channel_.name + '_msg';
};


/**
 * Returns the name/ID of the ack frame.
 * @return {string} Name of ack frame.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.getAckFrameName_ = function() {
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + '_' +
      this.channel_.name + '_ack';
};


/**
 * Determines whether the channel is still available. The channel is
 * unavailable if the transport was disposed or the peer is no longer
 * available.
 * @return {boolean} Whether the channel is available.
 */
goog.net.xpc.IframePollingTransport.prototype.isChannelAvailable = function() {
  return !this.isDisposed() && this.channel_.isPeerAvailable();
};


/**
 * Safely retrieves the frames from the peer window. If an error is thrown
 * (e.g. the window is closing) an empty frame object is returned.
 * @return {!Object.<!Window>}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.getPeerFrames_ = function() {
  try {
    if (this.isChannelAvailable()) {
      return this.channel_.getPeerWindowObject().frames || {};
    }
  } catch (e) {
    // An error may be thrown if the window is closing.
    goog.net.xpc.logger.fine('error retrieving peer frames');
  }
  return {};
};


/**
 * Safely retrieves the peer frame with the specified name.
 * @param {string} frameName The name of the peer frame to retrieve.
 * @return {Window}
 */
goog.net.xpc.IframePollingTransport.prototype.getPeerFrame_ = function(
    frameName) {
  return this.getPeerFrames_()[frameName];
};


/**
 * Connects this transport.
 * @override
 */
goog.net.xpc.IframePollingTransport.prototype.connect = function() {
  if (!this.isChannelAvailable()) {
    // When the channel is unavailable there is no peer to poll so stop trying
    // to connect.
    return;
  }

  goog.net.xpc.logger.fine('transport connect called');
  if (!this.initialized_) {
    goog.net.xpc.logger.fine('initializing...');
    this.constructSenderFrames_();
    this.initialized_ = true;
  }
  this.checkForeignFramesReady_();
};


/**
 * Creates the iframes which are used to send messages (and acknowledgements)
 * to the peer. Sender iframes contain a document from a different origin and
 * therefore their content can't be accessed.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrames_ =
    function() {
  var name = this.getMsgFrameName_();
  this.msgIframeElm_ = this.constructSenderFrame_(name);
  this.msgWinObj_ = this.getWindow().frames[name];

  name = this.getAckFrameName_();
  this.ackIframeElm_ = this.constructSenderFrame_(name);
  this.ackWinObj_ = this.getWindow().frames[name];
};


/**
 * Constructs a sending frame the the given id.
 * @param {string} id The id.
 * @return {Element} The constructed frame.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrame_ =
    function(id) {
  goog.net.xpc.logger.finest('constructing sender frame: ' + id);
  var ifr = goog.dom.createElement('iframe');
  var s = ifr.style;
  s.position = 'absolute';
  s.top = '-10px'; s.left = '10px'; s.width = '1px'; s.height = '1px';
  ifr.id = ifr.name = id;
  ifr.src = this.sendUri_ + '#INITIAL';
  this.getWindow().document.body.appendChild(ifr);
  return ifr;
};


/**
 * The protocol for reconnecting is for the inner frame to change channel
 * names, and then communicate the new channel name to the outer peer.
 * The outer peer looks in a predefined location for the channel name
 * upate. It is important to use a completely new channel name, as this
 * will ensure that all messaging iframes are not in the bfcache.
 * Otherwise, Safari may pollute the history when modifying the location
 * of bfcached iframes.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.maybeInnerPeerReconnect_ =
    function() {
  // Reconnection has been found to not function on some browsers (eg IE7), so
  // it's important that the mechanism only be triggered as a last resort.  As
  // such, we poll a number of times to find the outer iframe before triggering
  // it.
  if (this.reconnectFrame_ || this.pollsBeforeReconnect_-- > 0) {
    return;
  }

  goog.net.xpc.logger.finest('Inner peer reconnect triggered.');
  this.channel_.name = goog.net.xpc.getRandomString(10);
  goog.net.xpc.logger.finest('switching channels: ' + this.channel_.name);
  this.deconstructSenderFrames_();
  this.initialized_ = false;
  // Communicate new channel name to outer peer.
  this.reconnectFrame_ = this.constructSenderFrame_(
      goog.net.xpc.IframePollingTransport.IFRAME_PREFIX +
          '_reconnect_' + this.channel_.name);
};


/**
 * Scans inner peer for a reconnect message, which will be used to update
 * the outer peer's channel name. If a reconnect message is found, the
 * sender frames will be cleaned up to make way for the new sender frames.
 * Only called by the outer peer.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.outerPeerReconnect_ = function() {
  goog.net.xpc.logger.finest('outerPeerReconnect called');
  var frames = this.getPeerFrames_();
  var length = frames.length;
  for (var i = 0; i < length; i++) {
    var frameName;
    try {
      if (frames[i] && frames[i].name) {
        frameName = frames[i].name;
      }
    } catch (e) {
      // Do nothing.
    }
    if (!frameName) {
      continue;
    }
    var message = frameName.split('_');
    if (message.length == 3 &&
        message[0] == goog.net.xpc.IframePollingTransport.IFRAME_PREFIX &&
        message[1] == 'reconnect') {
      // This is a legitimate reconnect message from the peer. Start using
      // the peer provided channel name, and start a connection over from
      // scratch.
      this.channel_.name = message[2];
      this.deconstructSenderFrames_();
      this.initialized_ = false;
      break;
    }
  }
};


/**
 * Cleans up the existing sender frames owned by this peer. Only called by
 * the outer peer.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.deconstructSenderFrames_ =
    function() {
  goog.net.xpc.logger.finest('deconstructSenderFrames called');
  if (this.msgIframeElm_) {
    this.msgIframeElm_.parentNode.removeChild(this.msgIframeElm_);
    this.msgIframeElm_ = null;
    this.msgWinObj_ = null;
  }
  if (this.ackIframeElm_) {
    this.ackIframeElm_.parentNode.removeChild(this.ackIframeElm_);
    this.ackIframeElm_ = null;
    this.ackWinObj_ = null;
  }
};


/**
 * Checks if the frames in the peer's page are ready. These contain a
 * document from the own domain and are the ones messages are received through.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.checkForeignFramesReady_ =
    function() {
  // check if the connected iframe ready
  if (!(this.isRcvFrameReady_(this.getMsgFrameName_()) &&
        this.isRcvFrameReady_(this.getAckFrameName_()))) {
    goog.net.xpc.logger.finest('foreign frames not (yet) present');

    if (this.channel_.getRole() == goog.net.xpc.CrossPageChannelRole.INNER) {
      // The outer peer might need a short time to get its frames ready, as
      // CrossPageChannel prevents them from getting created until the inner
      // peer's frame has thrown its loaded event.  This method is a noop for
      // the first few times it's called, and then allows the reconnection
      // sequence to begin.
      this.maybeInnerPeerReconnect_();
    } else if (this.channel_.getRole() ==
               goog.net.xpc.CrossPageChannelRole.OUTER) {
      // The inner peer is either not loaded yet, or the receiving
      // frames are simply missing. Since we cannot discern the two cases, we
      // should scan for a reconnect message from the inner peer.
      this.outerPeerReconnect_();
    }

    // start a timer to check again
    this.getWindow().setTimeout(goog.bind(this.connect, this), 100);
  } else {
    goog.net.xpc.logger.fine('foreign frames present');

    // Create receivers.
    this.msgReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(
        this,
        this.getPeerFrame_(this.getMsgFrameName_()),
        goog.bind(this.processIncomingMsg, this));
    this.ackReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(
        this,
        this.getPeerFrame_(this.getAckFrameName_()),
        goog.bind(this.processIncomingAck, this));

    this.checkLocalFramesPresent_();
  }
};


/**
 * Checks if the receiving frame is ready.
 * @param {string} frameName Which receiving frame to check.
 * @return {boolean} Whether the receiving frame is ready.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.isRcvFrameReady_ =
    function(frameName) {
  goog.net.xpc.logger.finest('checking for receive frame: ' + frameName);
  /** @preserveTry */
  try {
    var winObj = this.getPeerFrame_(frameName);
    if (!winObj || winObj.location.href.indexOf(this.rcvUri_) != 0) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};


/**
 * Checks if the iframes created in the own document are ready.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.checkLocalFramesPresent_ =
    function() {

  // Are the sender frames ready?
  // These contain a document from the peer's domain, therefore we can only
  // check if the frame itself is present.
  var frames = this.getPeerFrames_();
  if (!(frames[this.getAckFrameName_()] &&
        frames[this.getMsgFrameName_()])) {
    // start a timer to check again
    if (!this.checkLocalFramesPresentCb_) {
      this.checkLocalFramesPresentCb_ = goog.bind(
          this.checkLocalFramesPresent_, this);
    }
    this.getWindow().setTimeout(this.checkLocalFramesPresentCb_, 100);
    goog.net.xpc.logger.fine('local frames not (yet) present');
  } else {
    // Create senders.
    this.msgSender_ = new goog.net.xpc.IframePollingTransport.Sender(
        this.sendUri_, this.msgWinObj_);
    this.ackSender_ = new goog.net.xpc.IframePollingTransport.Sender(
        this.sendUri_, this.ackWinObj_);

    goog.net.xpc.logger.fine('local frames ready');

    this.getWindow().setTimeout(goog.bind(function() {
      this.msgSender_.send(goog.net.xpc.SETUP);
      this.sentConnectionSetup_ = true;
      this.waitForAck_ = true;
      goog.net.xpc.logger.fine('SETUP sent');
    }, this), 100);
  }
};


/**
 * Check if connection is ready.
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.checkIfConnected_ = function() {
  if (this.sentConnectionSetupAck_ && this.rcvdConnectionSetupAck_) {
    this.channel_.notifyConnected();

    if (this.deliveryQueue_) {
      goog.net.xpc.logger.fine('delivering queued messages ' +
                               '(' + this.deliveryQueue_.length + ')');

      for (var i = 0, m; i < this.deliveryQueue_.length; i++) {
        m = this.deliveryQueue_[i];
        this.channel_.deliver_(m.service, m.payload);
      }
      delete this.deliveryQueue_;
    }
  } else {
    goog.net.xpc.logger.finest('checking if connected: ' +
                               'ack sent:' + this.sentConnectionSetupAck_ +
                               ', ack rcvd: ' + this.rcvdConnectionSetupAck_);
  }
};


/**
 * Processes an incoming message.
 * @param {string} raw The complete received string.
 */
goog.net.xpc.IframePollingTransport.prototype.processIncomingMsg =
    function(raw) {
  goog.net.xpc.logger.finest('msg received: ' + raw);

  if (raw == goog.net.xpc.SETUP) {
    if (!this.ackSender_) {
      // Got SETUP msg, but we can't send an ack.
      return;
    }

    this.ackSender_.send(goog.net.xpc.SETUP_ACK_);
    goog.net.xpc.logger.finest('SETUP_ACK sent');

    this.sentConnectionSetupAck_ = true;
    this.checkIfConnected_();

  } else if (this.channel_.isConnected() || this.sentConnectionSetupAck_) {

    var pos = raw.indexOf('|');
    var head = raw.substring(0, pos);
    var frame = raw.substring(pos + 1);

    // check if it is a framed message
    pos = head.indexOf(',');
    if (pos == -1) {
      var seq = head;
      // send acknowledgement
      this.ackSender_.send('ACK:' + seq);
      this.deliverPayload_(frame);
    } else {
      var seq = head.substring(0, pos);
      // send acknowledgement
      this.ackSender_.send('ACK:' + seq);

      var partInfo = head.substring(pos + 1).split('/');
      var part0 = parseInt(partInfo[0], 10);
      var part1 = parseInt(partInfo[1], 10);
      // create an array to accumulate the parts if this is the
      // first frame of a message
      if (part0 == 1) {
        this.parts_ = [];
      }
      this.parts_.push(frame);
      // deliver the message if this was the last frame of a message
      if (part0 == part1) {
        this.deliverPayload_(this.parts_.join(''));
        delete this.parts_;
      }
    }
  } else {
    goog.net.xpc.logger.warning('received msg, but channel is not connected');
  }
};


/**
 * Process an incoming acknowdedgement.
 * @param {string} msgStr The incoming ack string to process.
 */
goog.net.xpc.IframePollingTransport.prototype.processIncomingAck =
    function(msgStr) {
  goog.net.xpc.logger.finest('ack received: ' + msgStr);

  if (msgStr == goog.net.xpc.SETUP_ACK_) {
    this.waitForAck_ = false;
    this.rcvdConnectionSetupAck_ = true;
    // send the next frame
    this.checkIfConnected_();

  } else if (this.channel_.isConnected()) {
    if (!this.waitForAck_) {
      goog.net.xpc.logger.warning('got unexpected ack');
      return;
    }

    var seq = parseInt(msgStr.split(':')[1], 10);
    if (seq == this.sequence_) {
      this.waitForAck_ = false;
      this.sendNextFrame_();
    } else {
      goog.net.xpc.logger.warning('got ack with wrong sequence');
    }
  } else {
    goog.net.xpc.logger.warning('received ack, but channel not connected');
  }
};


/**
 * Sends a frame (message part).
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.sendNextFrame_ = function() {
  // do nothing if we are waiting for an acknowledgement or the
  // queue is emtpy
  if (this.waitForAck_ || !this.sendQueue_.length) {
    return;
  }

  var s = this.sendQueue_.shift();
  ++this.sequence_;
  this.msgSender_.send(this.sequence_ + s);
  goog.net.xpc.logger.finest('msg sent: ' + this.sequence_ + s);


  this.waitForAck_ = true;
};


/**
 * Delivers a message.
 * @param {string} s The complete message string ("<service_name>:<payload>").
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.deliverPayload_ = function(s) {
  // determine the service name and the payload
  var pos = s.indexOf(':');
  var service = s.substr(0, pos);
  var payload = s.substring(pos + 1);

  // deliver the message
  if (!this.channel_.isConnected()) {
    // as valid messages can come in before a SETUP_ACK has
    // been received (because subchannels for msgs and acks are independent),
    // delay delivery of early messages until after 'connect'-event
    (this.deliveryQueue_ || (this.deliveryQueue_ = [])).
        push({service: service, payload: payload});
    goog.net.xpc.logger.finest('queued delivery');
  } else {
    this.channel_.deliver_(service, payload);
  }
};


// ---- send message ----


/**
 * Maximal frame length.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.prototype.MAX_FRAME_LENGTH_ = 3800;


/**
 * Sends a message. Splits it in multiple frames if too long (exceeds IE's
 * URL-length maximum.
 * Wireformat: <seq>[,<frame_no>/<#frames>]|<frame_content>
 *
 * @param {string} service Name of service this the message has to be delivered.
 * @param {string} payload The message content.
 * @override
 */
goog.net.xpc.IframePollingTransport.prototype.send =
    function(service, payload) {
  var frame = service + ':' + payload;
  // put in queue
  if (!goog.userAgent.IE || payload.length <= this.MAX_FRAME_LENGTH_) {
    this.sendQueue_.push('|' + frame);
  }
  else {
    var l = payload.length;
    var num = Math.ceil(l / this.MAX_FRAME_LENGTH_); // number of frames
    var pos = 0;
    var i = 1;
    while (pos < l) {
      this.sendQueue_.push(',' + i + '/' + num + '|' +
                           frame.substr(pos, this.MAX_FRAME_LENGTH_));
      i++;
      pos += this.MAX_FRAME_LENGTH_;
    }
  }
  this.sendNextFrame_();
};


/** @override */
goog.net.xpc.IframePollingTransport.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  var receivers = goog.net.xpc.IframePollingTransport.receivers_;
  goog.array.remove(receivers, this.msgReceiver_);
  goog.array.remove(receivers, this.ackReceiver_);
  this.msgReceiver_ = this.ackReceiver_ = null;

  goog.dom.removeNode(this.msgIframeElm_);
  goog.dom.removeNode(this.ackIframeElm_);
  this.msgIframeElm_ = this.ackIframeElm_ = null;
  this.msgWinObj_ = this.ackWinObj_ = null;
};


/**
 * Array holding all Receiver-instances.
 * @type {Array.<goog.net.xpc.IframePollingTransport.Receiver>}
 * @private
 */
goog.net.xpc.IframePollingTransport.receivers_ = [];


/**
 * Short polling interval.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_ = 10;


/**
 * Long polling interval.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_ = 100;


/**
 * Period how long to use TIME_POLL_SHORT_ before raising polling-interval
 * to TIME_POLL_LONG_ after an activity.
 * @type {number}
 * @private
 */
goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ =
    1000;


/**
 * Polls all receivers.
 * @private
 */
goog.net.xpc.IframePollingTransport.receive_ = function() {
  var rcvd = false;
  /** @preserveTry */
  try {
    for (var i = 0, l = goog.net.xpc.IframePollingTransport.receivers_.length;
         i < l; i++) {
      rcvd = rcvd ||
          goog.net.xpc.IframePollingTransport.receivers_[i].receive();
    }
  } catch (e) {
    goog.net.xpc.logger.info('receive_() failed: ' + e);
    // Notify the channel that the transport had an error.
    goog.net.xpc.IframePollingTransport.receivers_[i].
        transport_.channel_.notifyTransportError_();
    // notifyTransportError_() closes the channel and dispoases the transport.
    // If there are no other channels present, this.receivers_ will now be empty
    // and there is not need to keep polling.
    if (!goog.net.xpc.IframePollingTransport.receivers_.length) {
      return;
    }
  }

  var now = goog.now();
  if (rcvd) {
    goog.net.xpc.IframePollingTransport.lastActivity_ = now;
  }

  // Schedule next check.
  var t = now - goog.net.xpc.IframePollingTransport.lastActivity_ <
      goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ ?
      goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_ :
      goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_;
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(
      goog.net.xpc.IframePollingTransport.receiveCb_, t);
};


/**
 * Callback that wraps receive_ to be used in timers.
 * @type {Function}
 * @private
 */
goog.net.xpc.IframePollingTransport.receiveCb_ = goog.bind(
    goog.net.xpc.IframePollingTransport.receive_,
    goog.net.xpc.IframePollingTransport);


/**
 * Starts the polling loop.
 * @private
 */
goog.net.xpc.IframePollingTransport.startRcvTimer_ = function() {
  goog.net.xpc.logger.fine('starting receive-timer');
  goog.net.xpc.IframePollingTransport.lastActivity_ = goog.now();
  if (goog.net.xpc.IframePollingTransport.rcvTimer_) {
    window.clearTimeout(goog.net.xpc.IframePollingTransport.rcvTimer_);
  }
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(
      goog.net.xpc.IframePollingTransport.receiveCb_,
      goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_);
};



/**
 * goog.net.xpc.IframePollingTransport.Sender
 *
 * Utility class to send message-parts to a document from a different origin.
 *
 * @constructor
 * @param {string} url The url the other document will use for polling.
 * @param {Object} windowObj The frame used for sending information to.
 */
goog.net.xpc.IframePollingTransport.Sender = function(url, windowObj) {
  /**
   * The URI used to sending messages.
   * @type {string}
   * @private
   */
  this.sendUri_ = url;

  /**
   * The window object of the iframe used to send messages.
   * The script instantiating the Sender won't have access to
   * the content of sendFrame_.
   * @type {Object}
   * @private
   */
  this.sendFrame_ = windowObj;

  /**
   * Cycle counter (used to make sure that sending two identical messages sent
   * in direct succession can be recognized as such by the receiver).
   * @type {number}
   * @private
   */
  this.cycle_ = 0;
};


/**
 * Sends a message-part (frame) to the peer.
 * The message-part is encoded and put in the fragment identifier
 * of the URL used for sending (and belongs to the origin/domain of the peer).
 * @param {string} payload The message to send.
 */
goog.net.xpc.IframePollingTransport.Sender.prototype.send = function(payload) {
  this.cycle_ = ++this.cycle_ % 2;

  var url = this.sendUri_ + '#' + this.cycle_ + encodeURIComponent(payload);

  // TODO(user) Find out if try/catch is still needed
  /** @preserveTry */
  try {
    // safari doesn't allow to call location.replace()
    if (goog.userAgent.WEBKIT) {
      this.sendFrame_.location.href = url;
    } else {
      this.sendFrame_.location.replace(url);
    }
  } catch (e) {
    goog.net.xpc.logger.severe('sending failed', e);
  }

  // Restart receiver timer on short polling interval, to support use-cases
  // where we need to capture responses quickly.
  goog.net.xpc.IframePollingTransport.startRcvTimer_();
};



/**
 * goog.net.xpc.IframePollingTransport.Receiver
 *
 * @constructor
 * @param {goog.net.xpc.Transport} transport The transport to receive from.
 * @param {Object} windowObj The window-object to poll for location-changes.
 * @param {Function} callback The callback-function to be called when
 *     location has changed.
 */
goog.net.xpc.IframePollingTransport.Receiver = function(transport,
                                                        windowObj,
                                                        callback) {

  this.transport_ = transport;
  this.rcvFrame_ = windowObj;

  this.cb_ = callback;
  this.currentLoc_ = this.rcvFrame_.location.href.split('#')[0] + '#INITIAL';

  goog.net.xpc.IframePollingTransport.receivers_.push(this);
  goog.net.xpc.IframePollingTransport.startRcvTimer_();
};


/**
 * Polls the location of the receiver-frame for changes.
 * @return {boolean} Whether a change has been detected.
 */
goog.net.xpc.IframePollingTransport.Receiver.prototype.receive = function() {
  var loc = this.rcvFrame_.location.href;

  if (loc != this.currentLoc_) {
    this.currentLoc_ = loc;
    var payload = loc.split('#')[1];
    if (payload) {
      payload = payload.substr(1); // discard first character (cycle)
      this.cb_(decodeURIComponent(payload));
    }
    return true;
  } else {
    return false;
  }
};
