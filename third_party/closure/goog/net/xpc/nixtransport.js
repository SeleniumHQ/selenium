// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains the NIX (Native IE XDC) method transport for
 * cross-domain communication. It exploits the fact that Internet Explorer
 * allows a window that is the parent of an iframe to set said iframe window's
 * opener property to an object. This object can be a function that in turn
 * can be used to send a message despite same-origin constraints. Note that
 * this function, if a pure JavaScript object, opens up the possibilitiy of
 * gaining a hold of the context of the other window and in turn, attacking
 * it. This implementation therefore wraps the JavaScript objects used inside
 * a VBScript class. Since VBScript objects are passed in JavaScript as a COM
 * wrapper (like DOM objects), they are thus opaque to JavaScript
 * (except for the interface they expose). This therefore provides a safe
 * method of transport.
 *
*
 *
 * Initially based on FrameElementTransport which shares some similarities
 * to this method.
 */

goog.provide('goog.net.xpc.NixTransport');

goog.require('goog.net.xpc');
goog.require('goog.net.xpc.Transport');



/**
 * NIX method transport.
 *
 * NOTE(user): NIX method tested in all IE versions starting from 6.0.
 *
 * @param {goog.net.xpc.CrossPageChannel} channel The channel this transport
 *     belongs to.
 * @constructor
 * @extends {goog.net.xpc.Transport}
 */
goog.net.xpc.NixTransport = function(channel) {
  /**
   * The channel this transport belongs to.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The authorization token, if any, used by this transport.
   * @type {?string}
   * @private
   */
  this.authToken_ = channel[goog.net.xpc.CfgFields.AUTH_TOKEN] || '';

  /**
   * The authorization token, if any, that must be sent by the other party
   * for setup to occur.
   * @type {?string}
   * @private
   */
  this.remoteAuthToken_ =
      channel[goog.net.xpc.CfgFields.REMOTE_AUTH_TOKEN] || '';

  // Conduct the setup work for NIX in general, if need be.
  goog.net.xpc.NixTransport.conductGlobalSetup_();

  // Setup aliases so that VBScript can call these methods
  // on the transport class, even if they are renamed during
  // compression.
  this[goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE] = this.handleMessage_;
  this[goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL] = this.createChannel_;
};
goog.inherits(goog.net.xpc.NixTransport, goog.net.xpc.Transport);


// Consts for NIX. VBScript doesn't allow items to start with _ for some
// reason, so we need to make these names quite unique, as they will go into
// the global namespace.

/**
 * Global name of the Wrapper VBScript class.
 * Note that this class will be stored in the *global*
 * namespace (i.e. window in browsers).
 * @type {string}
 */
goog.net.xpc.NixTransport.NIX_WRAPPER = 'GCXPC____NIXVBS_wrapper';


/**
 * Global name of the GetWrapper VBScript function. This
 * constant is used by JavaScript to call this function.
 * Note that this function will be stored in the *global*
 * namespace (i.e. window in browsers).
 * @type {string}
 */
goog.net.xpc.NixTransport.NIX_GET_WRAPPER = 'GCXPC____NIXVBS_get_wrapper';

/**
 * The name of the handle message method used by the wrapper class
 * when calling the transport.
 * @type {string}
 */
goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE = 'GCXPC____NIXJS_handle_message';

/**
 * The name of the create channel method used by the wrapper class
 * when calling the transport.
 * @type {string}
 */
goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL = 'GCXPC____NIXJS_create_channel';

/**
 * A "unique" identifier that is stored in the wrapper
 * class so that the wrapper can be distinguished from
 * other objects easily.
 * @type {string}
 */
goog.net.xpc.NixTransport.NIX_ID_FIELD = 'GCXPC____NIXVBS_container';

/**
 * Conducts the global setup work for the NIX transport method.
 * This function creates and then injects into the page the
 * VBScript code necessary to create the NIX wrapper class.
 * Note that this method can be called multiple times, as
 * it internally checks whether the work is necessary before
 * proceeding.
 * @private
 */
goog.net.xpc.NixTransport.conductGlobalSetup_ = function() {
  if (window['nix_setup_complete']) {
    return;
  }

  // Inject the VBScript code needed.
  var vbscript =
    // We create a class to act as a wrapper for
    // a Javascript call, to prevent a break in of
    // the context.
    'Class ' + goog.net.xpc.NixTransport.NIX_WRAPPER + '\n ' +

    // An internal member for keeping track of the
    // transport for which this wrapper exists.
    'Private m_Transport\n' +

    // An internal member for keeping track of the
    // auth token associated with the context that
    // created this wrapper. Used for validation
    // purposes.
    'Private m_Auth\n' +

    // Method for internally setting the value
    // of the m_Transport property. We have the
    // isEmpty check to prevent the transport
    // from being overridden with an illicit
    // object by a malicious party.
    'Public Sub SetTransport(transport)\n' +
    'If isEmpty(m_Transport) Then\n' +
    'Set m_Transport = transport\n' +
    'End If\n' +
    'End Sub\n' +

    // Method for internally setting the value
    // of the m_Auth property. We have the
    // isEmpty check to prevent the transport
    // from being overridden with an illicit
    // object by a malicious party.
    'Public Sub SetAuth(auth)\n' +
    'If isEmpty(m_Auth) Then\n' +
    'm_Auth = auth\n' +
    'End If\n' +
    'End Sub\n' +

    // Returns the auth token to the gadget, so it can
    // confirm a match before initiating the connection
    'Public Function GetAuthToken()\n ' +
    'GetAuthToken = m_Auth\n' +
    'End Function\n' +

    // A wrapper method which causes a
    // message to be sent to the other context.
    'Public Sub SendMessage(service, payload)\n ' +
    'Call m_Transport.' +
    goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE + '(service, payload)\n' +
    'End Sub\n' +

    // Method for setting up the inner->outer
    // channel.
    'Public Sub CreateChannel(channel)\n ' +
    'Call m_Transport.' +
    goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL + '(channel)\n' +
    'End Sub\n' +

    // An empty field with a unique identifier to
    // prevent the code from confusing this wrapper
    // with a run-of-the-mill value found in window.opener.
    'Public Sub ' + goog.net.xpc.NixTransport.NIX_ID_FIELD + '()\n ' +
    'End Sub\n' +
    'End Class\n ' +

    // Function to get a reference to the wrapper.
    'Function ' +
    goog.net.xpc.NixTransport.NIX_GET_WRAPPER + '(transport, auth)\n' +
    'Dim wrap\n' +
    'Set wrap = New ' + goog.net.xpc.NixTransport.NIX_WRAPPER + '\n' +
    'wrap.SetTransport transport\n' +
    'wrap.SetAuth auth\n' +
    'Set ' + goog.net.xpc.NixTransport.NIX_GET_WRAPPER + ' = wrap\n' +
    'End Function';

  try {
    window.execScript(vbscript, 'vbscript');
    window['nix_setup_complete'] = true;
  }
  catch (e) {
    goog.net.xpc.logger.severe(
        'exception caught while attempting global setup: ' + e);
  }
};

/**
 * The transport type.
 * @type {number}
 * @protected
 */
goog.net.xpc.NixTransport.prototype.transportType =
   goog.net.xpc.TransportTypes.NIX;


/**
 * Keeps track of whether the local setup has completed (i.e.
 * the initial work towards setting the channel up has been
 * completed for this end).
 * @type {boolean}
 * @private
 */
goog.net.xpc.NixTransport.prototype.localSetupCompleted_ = false;

/**
 * The NIX channel used to talk to the other page. This
 * object is in fact a reference to a VBScript class
 * (see above) and as such, is in fact a COM wrapper.
 * When using this object, make sure to not access methods
 * without calling them, otherwise a COM error will be thrown.
 * @type {Object}
 * @private
 */
goog.net.xpc.NixTransport.prototype.nixChannel_ = null;


/**
 * Connect this transport.
 */
goog.net.xpc.NixTransport.prototype.connect = function() {
  if (this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) {
    this.attemptOuterSetup_();
  } else {
    this.attemptInnerSetup_();
  }
};


/**
 * Attempts to setup the channel from the perspective
 * of the outer (read: container) page. This method
 * will attempt to create a NIX wrapper for this transport
 * and place it into the "opener" property of the inner
 * page's window object. If it fails, it will continue
 * to loop until it does so.
 *
 * @private
 */
goog.net.xpc.NixTransport.prototype.attemptOuterSetup_ = function() {
  if (this.localSetupCompleted_) {
    return;
  }

  // Get shortcut to iframe-element that contains the inner
  // page.
  var innerFrame = this.channel_.iframeElement_;

  try {
    // Attempt to place the NIX wrapper object into the inner
    // frame's opener property.
    innerFrame.contentWindow.opener =
      window[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this, this.authToken_);
    this.localSetupCompleted_ = true;
  }
  catch (e) {
    goog.net.xpc.logger.severe(
        'exception caught while attempting setup: ' + e);
  }

  // If the retry is necessary, reattempt this setup.
  if (!this.localSetupCompleted_) {
    window.setTimeout(goog.bind(this.attemptOuterSetup_, this), 100);
  }
};

/**
 * Attempts to setup the channel from the perspective
 * of the inner (read: iframe) page. This method
 * will attempt to *read* the opener object from the
 * page's opener property. If it succeeds, this object
 * is saved into nixChannel_ and the channel is confirmed
 * with the container by calling CreateChannel with an instance
 * of a wrapper for *this* page. Note that if this method
 * fails, it will continue to loop until it succeeds.
 *
 * @private
 */
goog.net.xpc.NixTransport.prototype.attemptInnerSetup_ = function() {
  if (this.localSetupCompleted_) {
    return;
  }

  try {
    var opener = window.opener;

    // Ensure that the object contained inside the opener
    // property is in fact a NIX wrapper.
    if (opener && goog.net.xpc.NixTransport.NIX_ID_FIELD in opener) {
      this.nixChannel_ = opener;

      // Ensure that the NIX channel given to use is valid.
      var remoteAuthToken = this.nixChannel_['GetAuthToken']();

      if (remoteAuthToken != this.remoteAuthToken_) {
        goog.net.xpc.logger.severe('Invalid auth token from other party');
        return;
      }

      // Complete the construction of the channel by sending our own
      // wrapper to the container via the channel they gave us.
      this.nixChannel_['CreateChannel'](
        window[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this,
                                                          this.authToken_));

      this.localSetupCompleted_ = true;

      // Notify channel that the transport is ready.
      this.channel_.notifyConnected_();
    }
  }
  catch (e) {
    goog.net.xpc.logger.severe(
        'exception caught while attempting setup: ' + e);
    return;
  }

  // If the retry is necessary, reattempt this setup.
  if (!this.localSetupCompleted_) {
    window.setTimeout(goog.bind(this.attemptInnerSetup_, this), 100);
  }
};

/**
 * Internal method called by the inner page, via the
 * NIX wrapper, to complete the setup of the channel.
 *
 * @param {Object} channel The NIX wrapper of the
 *  inner page.
 * @private
 */
goog.net.xpc.NixTransport.prototype.createChannel_ = function(channel) {
   // Verify that the channel is in fact a NIX wrapper.
   if (typeof channel != 'unknown' ||
       !(goog.net.xpc.NixTransport.NIX_ID_FIELD in channel)) {
     goog.net.xpc.logger.severe('Invalid NIX channel given to createChannel_');
   }

   this.nixChannel_ = channel;

   // Ensure that the NIX channel given to use is valid.
   var remoteAuthToken = this.nixChannel_['GetAuthToken']();

   if (remoteAuthToken != this.remoteAuthToken_) {
     goog.net.xpc.logger.severe('Invalid auth token from other party');
     return;
   }

   // Indicate to the CrossPageChannel that the channel is setup
   // and ready to use.
   this.channel_.notifyConnected_();
};

/**
 * Internal method called by the other page, via the NIX wrapper,
 * to deliver a message.
 * @param {string} serviceName The name of the service the message is to be
 *   delivered to.
 * @param {string} payload The message to process.
 * @private
 */
goog.net.xpc.NixTransport.prototype.handleMessage_ =
    function(serviceName, payload) {

  function deliveryHandler() {
    this.channel_.deliver_(serviceName, payload);
  }

  window.setTimeout(goog.bind(deliveryHandler, this), 1);
};


/**
 * Sends a message.
 * @param {string} service The name of the service the message is to be
 *   delivered to.
 * @param {string} payload The message content.
 */
goog.net.xpc.NixTransport.prototype.send = function(service, payload) {
  // Verify that the NIX channel we have is valid.
  if (typeof(this.nixChannel_) !== 'unknown') {
    goog.net.xpc.logger.severe('NIX channel not connected');
  }

  // Send the message via the NIX wrapper object.
  this.nixChannel_['SendMessage'](service, payload);
};


/**
 * Disposes of the transport.
 */
goog.net.xpc.NixTransport.prototype.disposeInternal = function() {
  goog.net.xpc.NixTransport.superClass_.disposeInternal.call(this);
  this.nixChannel_ = null;
};
