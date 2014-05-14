// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the WebSocket class.  A WebSocket provides a
 * bi-directional, full-duplex communications channel, over a single TCP socket.
 *
 * See http://dev.w3.org/html5/websockets/
 * for the full HTML5 WebSocket API.
 *
 * Typical usage will look like this:
 *
 *  var ws = new goog.net.WebSocket();
 *
 *  var handler = new goog.events.EventHandler();
 *  handler.listen(ws, goog.net.WebSocket.EventType.OPENED, onOpen);
 *  handler.listen(ws, goog.net.WebSocket.EventType.MESSAGE, onMessage);
 *
 *  try {
 *    ws.open('ws://127.0.0.1:4200');
 *  } catch (e) {
 *    ...
 *  }
 *
 */

goog.provide('goog.net.WebSocket');
goog.provide('goog.net.WebSocket.ErrorEvent');
goog.provide('goog.net.WebSocket.EventType');
goog.provide('goog.net.WebSocket.MessageEvent');

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.log');



/**
 * Class encapsulating the logic for using a WebSocket.
 *
 * @param {boolean=} opt_autoReconnect True if the web socket should
 *     automatically reconnect or not.  This is true by default.
 * @param {function(number):number=} opt_getNextReconnect A function for
 *     obtaining the time until the next reconnect attempt. Given the reconnect
 *     attempt count (which is a positive integer), the function should return a
 *     positive integer representing the milliseconds to the next reconnect
 *     attempt.  The default function used is an exponential back-off. Note that
 *     this function is never called if auto reconnect is disabled.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.WebSocket = function(opt_autoReconnect, opt_getNextReconnect) {
  goog.net.WebSocket.base(this, 'constructor');

  /**
   * True if the web socket should automatically reconnect or not.
   * @type {boolean}
   * @private
   */
  this.autoReconnect_ = goog.isDef(opt_autoReconnect) ?
      opt_autoReconnect : true;

  /**
   * A function for obtaining the time until the next reconnect attempt.
   * Given the reconnect attempt count (which is a positive integer), the
   * function should return a positive integer representing the milliseconds to
   * the next reconnect attempt.
   * @type {function(number):number}
   * @private
   */
  this.getNextReconnect_ = opt_getNextReconnect ||
      goog.net.WebSocket.EXPONENTIAL_BACKOFF_;

  /**
   * The time, in milliseconds, that must elapse before the next attempt to
   * reconnect.
   * @type {number}
   * @private
   */
  this.nextReconnect_ = this.getNextReconnect_(this.reconnectAttempt_);
};
goog.inherits(goog.net.WebSocket, goog.events.EventTarget);


/**
 * The actual web socket that will be used to send/receive messages.
 * @type {WebSocket}
 * @private
 */
goog.net.WebSocket.prototype.webSocket_ = null;


/**
 * The URL to which the web socket will connect.
 * @type {?string}
 * @private
 */
goog.net.WebSocket.prototype.url_ = null;


/**
 * The subprotocol name used when establishing the web socket connection.
 * @type {string|undefined}
 * @private
 */
goog.net.WebSocket.prototype.protocol_ = undefined;


/**
 * True if a call to the close callback is expected or not.
 * @type {boolean}
 * @private
 */
goog.net.WebSocket.prototype.closeExpected_ = false;


/**
 * Keeps track of the number of reconnect attempts made since the last
 * successful connection.
 * @type {number}
 * @private
 */
goog.net.WebSocket.prototype.reconnectAttempt_ = 0;


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @private
 */
goog.net.WebSocket.prototype.logger_ = goog.log.getLogger(
    'goog.net.WebSocket');


/**
 * The events fired by the web socket.
 * @enum {string} The event types for the web socket.
 */
goog.net.WebSocket.EventType = {

  /**
   * Fired when an attempt to open the WebSocket fails or there is a connection
   * failure after a successful connection has been established.
   */
  CLOSED: goog.events.getUniqueId('closed'),

  /**
   * Fired when the WebSocket encounters an error.
   */
  ERROR: goog.events.getUniqueId('error'),

  /**
   * Fired when a new message arrives from the WebSocket.
   */
  MESSAGE: goog.events.getUniqueId('message'),

  /**
   * Fired when the WebSocket connection has been established.
   */
  OPENED: goog.events.getUniqueId('opened')
};


/**
 * The various states of the web socket.
 * @enum {number} The states of the web socket.
 * @private
 */
goog.net.WebSocket.ReadyState_ = {
  // This is the initial state during construction.
  CONNECTING: 0,
  // This is when the socket is actually open and ready for data.
  OPEN: 1,
  // This is when the socket is in the middle of a close handshake.
  // Note that this is a valid state even if the OPEN state was never achieved.
  CLOSING: 2,
  // This is when the socket is actually closed.
  CLOSED: 3
};


/**
 * The maximum amount of time between reconnect attempts for the exponential
 * back-off in milliseconds.
 * @type {number}
 * @private
 */
goog.net.WebSocket.EXPONENTIAL_BACKOFF_CEILING_ = 60 * 1000;


/**
 * Computes the next reconnect time given the number of reconnect attempts since
 * the last successful connection.
 *
 * @param {number} attempt The number of reconnect attempts since the last
 *     connection.
 * @return {number} The time, in milliseconds, until the next reconnect attempt.
 * @const
 * @private
 */
goog.net.WebSocket.EXPONENTIAL_BACKOFF_ = function(attempt) {
  var time = Math.pow(2, attempt) * 1000;
  return Math.min(time, goog.net.WebSocket.EXPONENTIAL_BACKOFF_CEILING_);
};


/**
 * Installs exception protection for all entry points introduced by
 * goog.net.WebSocket instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {!goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry points.
 */
goog.net.WebSocket.protectEntryPoints = function(errorHandler) {
  goog.net.WebSocket.prototype.onOpen_ = errorHandler.protectEntryPoint(
      goog.net.WebSocket.prototype.onOpen_);
  goog.net.WebSocket.prototype.onClose_ = errorHandler.protectEntryPoint(
      goog.net.WebSocket.prototype.onClose_);
  goog.net.WebSocket.prototype.onMessage_ = errorHandler.protectEntryPoint(
      goog.net.WebSocket.prototype.onMessage_);
  goog.net.WebSocket.prototype.onError_ = errorHandler.protectEntryPoint(
      goog.net.WebSocket.prototype.onError_);
};


/**
 * Creates and opens the actual WebSocket.  Only call this after attaching the
 * appropriate listeners to this object.  If listeners aren't registered, then
 * the {@code goog.net.WebSocket.EventType.OPENED} event might be missed.
 *
 * @param {string} url The URL to which to connect.
 * @param {string=} opt_protocol The subprotocol to use.  The connection will
 *     only be established if the server reports that it has selected this
 *     subprotocol. The subprotocol name must all be a non-empty ASCII string
 *     with no control characters and no spaces in them (i.e. only characters
 *     in the range U+0021 to U+007E).
 */
goog.net.WebSocket.prototype.open = function(url, opt_protocol) {
  // Sanity check.  This works only in modern browsers.
  goog.asserts.assert(goog.global['WebSocket'],
      'This browser does not support WebSocket');

  // Don't do anything if the web socket is already open.
  goog.asserts.assert(!this.isOpen(), 'The WebSocket is already open');

  // Clear any pending attempts to reconnect.
  this.clearReconnectTimer_();

  // Construct the web socket.
  this.url_ = url;
  this.protocol_ = opt_protocol;

  // This check has to be made otherwise you get protocol mismatch exceptions
  // for passing undefined, null, '', or [].
  if (this.protocol_) {
    goog.log.info(this.logger_, 'Opening the WebSocket on ' + this.url_ +
        ' with protocol ' + this.protocol_);
    this.webSocket_ = new WebSocket(this.url_, this.protocol_);
  } else {
    goog.log.info(this.logger_, 'Opening the WebSocket on ' + this.url_);
    this.webSocket_ = new WebSocket(this.url_);
  }

  // Register the event handlers.  Note that it is not possible for these
  // callbacks to be missed because it is registered after the web socket is
  // instantiated.  Because of the synchronous nature of JavaScript, this code
  // will execute before the browser creates the resource and makes any calls
  // to these callbacks.
  this.webSocket_.onopen = goog.bind(this.onOpen_, this);
  this.webSocket_.onclose = goog.bind(this.onClose_, this);
  this.webSocket_.onmessage = goog.bind(this.onMessage_, this);
  this.webSocket_.onerror = goog.bind(this.onError_, this);
};


/**
 * Closes the web socket connection.
 */
goog.net.WebSocket.prototype.close = function() {

  // Clear any pending attempts to reconnect.
  this.clearReconnectTimer_();

  // Attempt to close only if the web socket was created.
  if (this.webSocket_) {
    goog.log.info(this.logger_, 'Closing the WebSocket.');

    // Close is expected here since it was a direct call.  Close is considered
    // unexpected when opening the connection fails or there is some other form
    // of connection loss after being connected.
    this.closeExpected_ = true;
    this.webSocket_.close();
    this.webSocket_ = null;
  }
};


/**
 * Sends the message over the web socket.
 *
 * @param {string} message The message to send.
 */
goog.net.WebSocket.prototype.send = function(message) {
  // Make sure the socket is ready to go before sending a message.
  goog.asserts.assert(this.isOpen(), 'Cannot send without an open socket');

  // Send the message and let onError_ be called if it fails thereafter.
  this.webSocket_.send(message);
};


/**
 * Checks to see if the web socket is open or not.
 *
 * @return {boolean} True if the web socket is open, false otherwise.
 */
goog.net.WebSocket.prototype.isOpen = function() {
  return !!this.webSocket_ &&
      this.webSocket_.readyState == goog.net.WebSocket.ReadyState_.OPEN;
};


/**
 * Called when the web socket has connected.
 *
 * @private
 */
goog.net.WebSocket.prototype.onOpen_ = function() {
  goog.log.info(this.logger_, 'WebSocket opened on ' + this.url_);
  this.dispatchEvent(goog.net.WebSocket.EventType.OPENED);

  // Set the next reconnect interval.
  this.reconnectAttempt_ = 0;
  this.nextReconnect_ = this.getNextReconnect_(this.reconnectAttempt_);
};


/**
 * Called when the web socket has closed.
 *
 * @param {!Event} event The close event.
 * @private
 */
goog.net.WebSocket.prototype.onClose_ = function(event) {
  goog.log.info(this.logger_, 'The WebSocket on ' + this.url_ + ' closed.');

  // Firing this event allows handlers to query the URL.
  this.dispatchEvent(goog.net.WebSocket.EventType.CLOSED);

  // Always clear out the web socket on a close event.
  this.webSocket_ = null;

  // See if this is an expected call to onClose_.
  if (this.closeExpected_) {
    goog.log.info(this.logger_, 'The WebSocket closed normally.');
    // Only clear out the URL if this is a normal close.
    this.url_ = null;
    this.protocol_ = undefined;
  } else {
    // Unexpected, so try to reconnect.
    goog.log.error(this.logger_, 'The WebSocket disconnected unexpectedly: ' +
        event.data);

    // Only try to reconnect if it is enabled.
    if (this.autoReconnect_) {
      // Log the reconnect attempt.
      var seconds = Math.floor(this.nextReconnect_ / 1000);
      goog.log.info(this.logger_,
          'Seconds until next reconnect attempt: ' + seconds);

      // Actually schedule the timer.
      this.reconnectTimer_ = goog.Timer.callOnce(
          goog.bind(this.open, this, this.url_, this.protocol_),
          this.nextReconnect_, this);

      // Set the next reconnect interval.
      this.reconnectAttempt_++;
      this.nextReconnect_ = this.getNextReconnect_(this.reconnectAttempt_);
    }
  }
  this.closeExpected_ = false;
};


/**
 * Called when a new message arrives from the server.
 *
 * @param {MessageEvent} event The web socket message event.
 * @private
 */
goog.net.WebSocket.prototype.onMessage_ = function(event) {
  var message = /** @type {string} */ (event.data);
  this.dispatchEvent(new goog.net.WebSocket.MessageEvent(message));
};


/**
 * Called when there is any error in communication.
 *
 * @param {Event} event The error event containing the error data.
 * @private
 */
goog.net.WebSocket.prototype.onError_ = function(event) {
  var data = /** @type {string} */ (event.data);
  goog.log.error(this.logger_, 'An error occurred: ' + data);
  this.dispatchEvent(new goog.net.WebSocket.ErrorEvent(data));
};


/**
 * Clears the reconnect timer.
 *
 * @private
 */
goog.net.WebSocket.prototype.clearReconnectTimer_ = function() {
  if (goog.isDefAndNotNull(this.reconnectTimer_)) {
    goog.Timer.clear(this.reconnectTimer_);
  }
  this.reconnectTimer_ = null;
};


/** @override */
goog.net.WebSocket.prototype.disposeInternal = function() {
  goog.net.WebSocket.base(this, 'disposeInternal');
  this.close();
};



/**
 * Object representing a new incoming message event.
 *
 * @param {string} message The raw message coming from the web socket.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.net.WebSocket.MessageEvent = function(message) {
  goog.net.WebSocket.MessageEvent.base(
      this, 'constructor', goog.net.WebSocket.EventType.MESSAGE);

  /**
   * The new message from the web socket.
   * @type {string}
   */
  this.message = message;
};
goog.inherits(goog.net.WebSocket.MessageEvent, goog.events.Event);



/**
 * Object representing an error event. This is fired whenever an error occurs
 * on the web socket.
 *
 * @param {string} data The error data.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.net.WebSocket.ErrorEvent = function(data) {
  goog.net.WebSocket.ErrorEvent.base(
      this, 'constructor', goog.net.WebSocket.EventType.ERROR);

  /**
   * The error data coming from the web socket.
   * @type {string}
   */
  this.data = data;
};
goog.inherits(goog.net.WebSocket.ErrorEvent, goog.events.Event);


// Register the WebSocket as an entry point, so that it can be monitored for
// exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.net.WebSocket.prototype.onOpen_ =
          transformer(goog.net.WebSocket.prototype.onOpen_);
      goog.net.WebSocket.prototype.onClose_ =
          transformer(goog.net.WebSocket.prototype.onClose_);
      goog.net.WebSocket.prototype.onMessage_ =
          transformer(goog.net.WebSocket.prototype.onMessage_);
      goog.net.WebSocket.prototype.onError_ =
          transformer(goog.net.WebSocket.prototype.onError_);
    });
