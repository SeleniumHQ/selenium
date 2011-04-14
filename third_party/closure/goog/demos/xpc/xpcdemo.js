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
 * @fileoverview Contains application code for the XPC demo.
 * This script is used in both the container page and the iframe.
 *
 */

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.net.xpc.CrossPageChannel');


/**
 * Global function to kick off initialization in the containing document.
 */
goog.global.initOuter = function() {
  goog.events.listen(window, 'load', function() { xpcdemo.initOuter(); });
};


/**
 * Global function to kick off initialization in the iframe.
 */
goog.global.initInner = function() {
  goog.events.listen(window, 'load', function() { xpcdemo.initInner(); });
};


/**
 * Namespace for the demo. We don't use goog.provide here because it's not a
 * real module (cannot be required).
 */
xpcdemo = {};


/**
 * Initializes XPC in the containing page.
 */
xpcdemo.initOuter = function() {
  // Build the configuration object.
  var cfg = {};

  var ownUri = new goog.Uri(window.location.href);
  var relayUri = ownUri.resolve(new goog.Uri('relay.html'));
  var pollUri = ownUri.resolve(new goog.Uri('blank.html'));

  // Determine the peer domain. Uses the value of the URI-parameter
  // 'peerdomain'. If that parameter is not present, it falls back to
  // the own domain so that the demo will work out of the box (but
  // communication will of course not cross domain-boundaries).  For
  // real cross-domain communication, the easiest way is to point two
  // different host-names to the same webserver and then hit the
  // following URI:
  // http://host1.com/path/to/closure/demos/xpc/index.html?peerdomain=host2.com
  var peerDomain = ownUri.getParameterValue('peerdomain') || ownUri.getDomain();

  cfg[goog.net.xpc.CfgFields.LOCAL_RELAY_URI] = relayUri.toString();
  cfg[goog.net.xpc.CfgFields.PEER_RELAY_URI] =
      relayUri.setDomain(peerDomain).toString();

  cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] = pollUri.toString();
  cfg[goog.net.xpc.CfgFields.PEER_POLL_URI] =
      pollUri.setDomain(peerDomain).toString();


  // Force transport to be used if tp-parameter is set.
  var tp = ownUri.getParameterValue('tp');
  if (tp) {
    cfg[goog.net.xpc.CfgFields.TRANSPORT] = parseInt(tp, 10);
  }


  // Construct the URI of the peer page.

  var peerUri = ownUri.resolve(
      new goog.Uri('inner.html')).setDomain(peerDomain);
  // Passthrough of verbose and compiled flags.
  if (goog.isDef(ownUri.getParameterValue('verbose'))) {
    peerUri.setParameterValue('verbose', '');
  }
  if (goog.isDef(ownUri.getParameterValue('compiled'))) {
    peerUri.setParameterValue('compiled', '');
  }

  cfg[goog.net.xpc.CfgFields.PEER_URI] = peerUri;

  // Instantiate the channel.
  xpcdemo.channel = new goog.net.xpc.CrossPageChannel(cfg);

  // Create the peer iframe.
  xpcdemo.peerIframe = xpcdemo.channel.createPeerIframe(
      goog.dom.getElement('iframeContainer'));

  xpcdemo.initCommon_();

  goog.dom.getElement('inactive').style.display = 'none';
  goog.dom.getElement('active').style.display = '';
};


/**
 * Initialization in the iframe.
 */
xpcdemo.initInner = function() {
  // Get the channel configuration passed by the containing document.
  var cfg = goog.json.parse(
      (new goog.Uri(window.location.href)).getParameterValue('xpc'));

  xpcdemo.channel = new goog.net.xpc.CrossPageChannel(cfg);

  xpcdemo.initCommon_();
};


/**
 * Initializes the demo.
 * Registers service-handlers and connects the channel.
 * @private
 */
xpcdemo.initCommon_ = function() {
  var xpcLogger = goog.debug.Logger.getLogger('goog.net.xpc');
  xpcLogger.addHandler(function(logRecord) {
    xpcdemo.log('[XPC] ' + logRecord.getMessage());
  });
  xpcLogger.setLevel(window.location.href.match(/verbose/) ?
      goog.debug.Logger.Level.ALL : goog.debug.Logger.Level.INFO);

  // Register services.
  xpcdemo.channel.registerService('log', xpcdemo.log);
  xpcdemo.channel.registerService('ping', xpcdemo.pingHandler_);
  xpcdemo.channel.registerService('events', xpcdemo.eventsMsgHandler_);

  // Connect the channel.
  xpcdemo.channel.connect(function() {
    xpcdemo.channel.send('log', 'Hi from ' + window.location.host);
    goog.events.listen(goog.dom.getElement('clickfwd'),
                       'click', xpcdemo.mouseEventHandler_);
  });
};


/**
 * Kills the peer iframe and the disposes the channel.
 */
xpcdemo.teardown = function() {
  goog.events.unlisten(goog.dom.getElement('clickfwd'),
                       goog.events.EventType.CLICK, xpcdemo.mouseEventHandler_);

  xpcdemo.channel.dispose();
  delete xpcdemo.channel;

  goog.dom.removeNode(xpcdemo.peerIframe);
  xpcdemo.peerIframe = null;

  goog.dom.getElement('inactive').style.display = '';
  goog.dom.getElement('active').style.display = 'none';
};


/**
 * Logging function. Inserts log-message into element with it id 'console'.
 * @param {string} msgString The log-message.
 */
xpcdemo.log = function(msgString) {
  xpcdemo.consoleElm || (xpcdemo.consoleElm = goog.dom.getElement('console'));
  var msgElm = goog.dom.createDom('div');
  msgElm.innerHTML = msgString;
  xpcdemo.consoleElm.insertBefore(msgElm, xpcdemo.consoleElm.firstChild);
};


/**
 * Sends a ping request to the peer.
 */
xpcdemo.ping = function() {
  // send current time
  xpcdemo.channel.send('ping', goog.now() + '');
};

/**
 * The handler function for incoming pings (messages sent to the service
 * called 'ping');
 * @param {string} payload The message payload.
 * @private
 */
xpcdemo.pingHandler_ = function(payload) {
  // is the incoming message a response to a ping we sent?
  if (payload.charAt(0) == '#') {
    // calculate roundtrip time and log
    var dt = goog.now() - parseInt(payload.substring(1), 10);
    xpcdemo.log('roundtrip: ' + dt + 'ms');
  } else {
    // incoming message is a ping initiated from peer
    // -> prepend with '#' and send back
    xpcdemo.channel.send('ping', '#' + payload);
    xpcdemo.log('ping reply sent');
  }
};


/**
 * Counter for mousemove events.
 * @type {number}
 * @private
 */
xpcdemo.mmCount_ = 0;


/**
 * Holds timestamp when the last mousemove rate has been logged.
 * @type {number}
 * @private
 */
xpcdemo.mmLastRateOutput_ = 0;


/**
 * Start mousemove event forwarding. Registers a listener on the document which
 * sends them over the channel.
 */
xpcdemo.startMousemoveForwarding = function() {
  goog.events.listen(document, goog.events.EventType.MOUSEMOVE,
                     xpcdemo.mouseEventHandler_);
  xpcdemo.mmLastRateOutput_ = goog.now();
};


/**
 * Stop mousemove event forwarding.
 */
xpcdemo.stopMousemoveForwarding = function() {
  goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE,
                       xpcdemo.mouseEventHandler_);
};


/**
 * Function to be used as handler for mouse-events.
 * @param {goog.events.BrowserEvent} e The mouse event.
 * @private
 */
xpcdemo.mouseEventHandler_ = function(e) {
  xpcdemo.channel.send('events',
                   [e.type, e.clientX, e.clientY, goog.now()].join(','));
};


/**
 * Handler for the 'events' service.
 * @param {string} payload The string returned from the xpcdemo.
 * @private
 */
xpcdemo.eventsMsgHandler_ = function(payload) {
  var now = goog.now();
  var args = payload.split(',');
  var type = args[0];
  var pageX = args[1];
  var pageY = args[2];
  var time = parseInt(args[3], 10);

  var msg = type + ': (' + pageX + ',' + pageY + '), latency: ' + (now - time);
  xpcdemo.log(msg);

  if (type == goog.events.EventType.MOUSEMOVE) {
    xpcdemo.mmCount_++;
    var dt = now - xpcdemo.mmLastRateOutput_;
    if (dt > 1000) {
      msg = 'RATE (mousemove/s): ' + (1000 * xpcdemo.mmCount_ / dt);
      xpcdemo.log(msg);
      xpcdemo.mmLastRateOutput_ = now;
      xpcdemo.mmCount_ = 0;
    }
  }
};


/**
 * Send multiple messages.
 * @param {number} n The number of messages to send.
 */
xpcdemo.sendN = function(n) {
  xpcdemo.count_ || (xpcdemo.count_ = 1);

  for (var i = 0; i < n; i++) {
    xpcdemo.channel.send('log', '' + xpcdemo.count_++);
  }
};
