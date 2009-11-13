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

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of the BrowserChannel class.  A BrowserChannel
 * simulates a bidirectional socket over HTTP. It is the basis of the
 * Gmail Chat IM connections to the server.
 *
 * See http://wiki/Main/BrowserChannel
 * This doesn't yet completely comform to the design document as we've done
 * some renaming and cleanup in the design document that hasn't yet been
 * implemented in the protocol.
 *
 * Typical usage will look like
 *  var handler = [handler object];
 *  var channel = new BrowserChannel(clientVersion);
 *  channel.setHandler(handler);
 *  channel.connect('channel/test', 'channel/bind');
 *
 * See goog.net.BrowserChannel.Handler for the handler interface.
 *
 *
 */


goog.provide('goog.net.BrowserChannel');
goog.provide('goog.net.BrowserChannel.Handler');
goog.provide('goog.net.BrowserChannel.LogSaver');
goog.provide('goog.net.BrowserChannel.StatEvent');

goog.require('goog.Uri');
goog.require('goog.debug.TextFormatter');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.BrowserTestChannel');
goog.require('goog.net.ChannelDebug');
goog.require('goog.net.ChannelRequest');
goog.require('goog.string');
goog.require('goog.structs.CircularBuffer');
goog.require('goog.userAgent');


/**
 * Encapsulates the logic for a single BrowserChannel.
 *
 * @param {string} clientVersion An application-specific version number that
 *        is sent to the server when connected.
 * @constructor
 */
goog.net.BrowserChannel = function(clientVersion) {
  /**
   * The application specific version that is passed to the server.
   * @type {string}
   * @private
   */
  this.clientVersion_ = clientVersion;

  /**
   * The current state of the BrowserChannel. It should be one of the
   * goog.net.BrowserChannel.State constants.
   * @type {goog.net.BrowserChannel.State}
   * @private
   */
  this.state_ = goog.net.BrowserChannel.State.INIT;

  /**
   * An array of queued maps that need to be sent to the server.
   * @type {Array.<Object|goog.structs.Map>}
   * @private
   */
  this.outgoingMaps_ = [];

  /**
   * The channel debug used for browserchannel logging
   * @type {goog.net.ChannelDebug}
   * @private
   */
  this.channelDebug_ = new goog.net.ChannelDebug();
};


/**
 * Extra HTTP headers to add to all the requests sent to the server.
 * @type {Object}
 * @private
 */
goog.net.BrowserChannel.prototype.extraHeaders_ = null;

/**
 * Extra parameters to add to all the requests sent to the server.
 * @type {Object?}
 * @private
 */
goog.net.BrowserChannel.prototype.extraParams_ = null;

/**
 * The current ChannelRequest object for the forwardchannel.
 * @type {goog.net.ChannelRequest?}
 * @private
 */
goog.net.BrowserChannel.prototype.forwardChannelRequest_ = null;

/**
 * The ChannelRequest object for the backchannel.
 * @type {goog.net.ChannelRequest?}
 * @private
 */
goog.net.BrowserChannel.prototype.backChannelRequest_ = null;

/**
 * The relative path (in the context of the the page hosting the browser
 * channel) for making requests to the server.
 * @type {string?}
 * @private
 */
goog.net.BrowserChannel.prototype.path_ = null;

/**
 * The absolute URI for the forwardchannel request.
 * @type {goog.Uri}
 * @private
 */
goog.net.BrowserChannel.prototype.forwardChannelUri_ = null;

/**
 * The absolute URI for the backchannel request.
 * @type {goog.Uri}
 * @private
 */
goog.net.BrowserChannel.prototype.backChannelUri_ = null;

/**
 * A subdomain prefix for using a subdomain in IE for the backchannel
 * requests.
 * @type {string?}
 * @private
 */
goog.net.BrowserChannel.prototype.hostPrefix_ = null;

/**
 * Whether we allow the use of a subdomain in IE for the backchannel requests.
 * @private
 */
goog.net.BrowserChannel.prototype.allowHostPrefix_ = true;

/**
 * The next id to use for the RID (request identifier) parameter. This
 * identifier uniquely identifies the forward channel request.
 * @type {number}
 * @private
 */
goog.net.BrowserChannel.prototype.nextRid_ = 0;

/**
 * Whether to fail forward-channel requests after one try, or after a few tries.
 * @type {boolean}
 * @private
 */
goog.net.BrowserChannel.prototype.failFast_ = false;

/**
 * The handler that receive callbacks for state changes and data.
 * @type {goog.net.BrowserChannel.Handler}
 * @private
 */
goog.net.BrowserChannel.prototype.handler_ = null;

/**
 * Timer identifier for asynchronously making a forward channel request.
 * @type {number?}
 * @private
 */
goog.net.BrowserChannel.prototype.forwardChannelTimerId_ = null;

/**
 * Timer identifier for asynchronously making a back channel request.
 * @type {number?}
 * @private
 */
goog.net.BrowserChannel.prototype.backChannelTimerId_ = null;

/**
 * The BrowserTestChannel object which encapsulates the logic for determining
 * interesting network conditions about the client.
 * @type {goog.net.BrowserTestChannel?}
 * @private
 */
goog.net.BrowserChannel.prototype.connectionTest_ = null;

/**
 * Whether the client's network conditions can support chunked responses.
 * @type {boolean?}
 * @private
 */
goog.net.BrowserChannel.prototype.useChunked_ = null;

/**
 * Whether chunked mode is allowed. In certain debugging situations, it's
 * useful to disable this.
 * @private
 */
goog.net.BrowserChannel.prototype.allowChunkedMode_ = true;

/**
 * The array identifier of the last array received from the server for the
 * backchannel request.
 * @type {number}
 * @private
 */
goog.net.BrowserChannel.prototype.lastArrayId_ = -1;

/**
 * The last status code received.
 * @type {number}
 * @private
 */
goog.net.BrowserChannel.prototype.lastStatusCode_ = -1;


/**
 * Enum type for the browser channel state machine.
 * @enum {number}
 */
goog.net.BrowserChannel.State = {
  /** The channel is closed. */
  CLOSED: 0,

  /** The channel has been initialized but hasn't yet initiated a connection. */
  INIT: 1,

  /** The channel is in the process of opening a connection to the server. */
  OPENING: 2,

  /** The channel is open. */
  OPENED: 3
};


/**
 * Maximum number of attempts to connect to the server for forward channel
 * requests.
 * @type {number}
 */
goog.net.BrowserChannel.FORWARD_CHANNEL_MAX_RETRIES = 2;

/**
 * The timeout in milliseconds for a forward channel request.
 * @type {number}
 */
goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT = 20 * 1000;

/**
 * Maximum number of attempts to connect to the server for back channel
 * requests that are performed over XMLHTTP.
 * @type {number}
 */
goog.net.BrowserChannel.BACK_CHANNEL_XMHTTP_MAX_RETRIES = 3;


/**
 * The version of the protocol used.
 * @type {number}
 */
goog.net.BrowserChannel.VERSION = 6;


/**
 * Enum type for identifying a BrowserChannel error.
 * @enum {number}
 */
goog.net.BrowserChannel.Error = {
  /** Value that indicates no error has occurred. */
  OK: 0,

  /** An error due to a request failing. */
  REQUEST_FAILED: 2,

  /** An error due to the user being logged out. */
  LOGGED_OUT: 4,

  /** An error due to server response which contains no data. */
  NO_DATA: 5,

  /** An error due to a server response indicating an unknown session id */
  UNKNOWN_SESSION_ID: 6,

  /** An error due to a server response requesting to stop the channel. */
  STOP: 7,

  /** A general network error. */
  NETWORK: 8,

  /** An error due to the channel being blocked by a network administrator. */
  BLOCKED: 9,

  /** An error due to bad data being returned from the server. */
  BAD_DATA: 10,

  /** An error due to a response that doesn't start with the magic cookie. */
  BAD_RESPONSE: 11
};


/**
 * Singleton event target for firing stat events
 * @type {goog.events.EventTarget}
 * @private
 */
goog.net.BrowserChannel.statEventTarget_ = new goog.events.EventTarget();

/**
 * Events fired by BrowserChannel and associated objects
 * @type {Object}
 */
goog.net.BrowserChannel.Event = {};


/**
 * Stat Event which fires when things of interest happen that mey be useful for
 * applications to know about for stats or debugging purposes. This event fires
 * on the EventTarget returned by getStatEventTarget.
 */
goog.net.BrowserChannel.Event.STAT_EVENT = 'statevent';


/**
 * Event class for goog.net.BrowserChannel.Event.STAT_EVENT
 *
 * @param {goog.events.EventTarget} eventTarget  The stat event target for
       the browser channel.
 * @param {goog.net.BrowserChannel.Stat} stat The stat.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.net.BrowserChannel.StatEvent = function(eventTarget, stat) {
  goog.events.Event.call(this, goog.net.BrowserChannel.Event.STAT_EVENT,
      eventTarget);

  /**
   * The stat
   * @type {goog.net.BrowserChannel.Stat}
   */
  this.stat = stat;

};
goog.inherits(goog.net.BrowserChannel.StatEvent, goog.events.Event);


/**
 * Enum that identifies events for statistics that are interesting to track.
 * TODO - Change name not to use Event or use EventTarget
 * @enum {number}
 */
goog.net.BrowserChannel.Stat = {
  /** Event indicating a new connection attempt. */
  CONNECT_ATTEMPT: 0,

  /** Event indicating a connection error due to a general network problem. */
  ERROR_NETWORK: 1,

  /**
   * Event indicating a connection error that isn't due to a general network
   * problem.
   */
  ERROR_OTHER: 2,

  /** Event indicating the start of test stage one. */
  TEST_STAGE_ONE_START: 3,


  /** Event indicating the channel is blocked by a network administrator. */
  CHANNEL_BLOCKED: 4,

  /** Event indicating the start of test stage two. */
  TEST_STAGE_TWO_START: 5,

  /** Event indicating the first piece of test data was received. */
  TEST_STAGE_TWO_DATA_ONE: 6,

  /**
   * Event indicating that the second piece of test data was received and it was
   * recieved separately from the first.
   */
  TEST_STAGE_TWO_DATA_TWO: 7,

  /** Event indicating both pieces of test data were received simultaneously. */
  TEST_STAGE_TWO_DATA_BOTH: 8,

  /** Event indicating stage one of the test request failed. */
  TEST_STAGE_ONE_FAILED: 9,

  /** Event indicating stage two of the test request failed. */
  TEST_STAGE_TWO_FAILED: 10,

  /**
   * Event indicating that a buffering proxy is likely between the client and
   * the server.
   */
  PROXY: 11,

  /**
   * Event indicating that no buffering proxy is likely between the client and
   * the server.
   */
  NOPROXY: 12,

  /** Event indicating an unknown SID error. */
  REQUEST_UNKNOWN_SESSION_ID: 13,

  /** Event indicating a bad status code was received. */
  REQUEST_BAD_STATUS: 14,

  /** Event indicating incomplete data was received */
  REQUEST_INCOMPLETE_DATA: 15,

  /** Event indicating bad data was received */
  REQUEST_BAD_DATA: 16,

  /** Event indicating no data was received when data was expected. */
  REQUEST_NO_DATA: 17,

  /** Event indicating a request timeout. */
  REQUEST_TIMEOUT: 18
};


/**
 * Magic response cookie that is the response for forward channel requests.
 * @type {string}
 */
goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE = 'y2f%';


/**
 * Returns the browserchannel logger.
 *
 * @return {goog.net.ChannelDebug} The channel debug object.
 */
goog.net.BrowserChannel.prototype.getChannelDebug = function() {
  return this.channelDebug_;
};


/**
 * Set the browserchannel logger.
 * TODO: Add interface for channel loggers or remove this function.
 *
 * @param {goog.net.ChannelDebug} channelDebug The channel debug object.
 */
goog.net.BrowserChannel.prototype.setChannelDebug = function(
    channelDebug) {
  this.channelDebug_ = channelDebug;
};


/**
 * Allows the application to set an execution hooks for when BrowserChannel
 * starts processing requests. This is useful to track timing or logging
 * special information. The function takes no parameters and return void.
 * @param {Function} startHook  The function for the start hook.
 */
goog.net.BrowserChannel.setStartThreadExecutionHook = function(startHook) {
  goog.net.BrowserChannel.startExecutionHook_ = startHook;
};


/**
 * Allows the application to set an execution hooks for when BrowserChannel
 * stops processing requests. This is useful to track timing or logging
 * special information. The function takes no parameters and return void.
 * @param {Function} endHook  The function for the end hook.
 */
goog.net.BrowserChannel.setEndThreadExecutionHook = function(endHook) {
  goog.net.BrowserChannel.endExecutionHook_ = endHook;
};


/**
 * Application provided execution hook for the start hook.
 *
 * @type {Function}
 * @private
 */
goog.net.BrowserChannel.startExecutionHook_ = function() { };


/**
 * Application provided execution hook for the end hook.
 *
 * @type {Function}
 * @private
 */
goog.net.BrowserChannel.endExecutionHook_ = function() { };


/**
 * Starts the channel. This initiates connections to the server.
 *
 * @param {string} testPath  The path for the test connection.
 * @param {string} channelPath  The path for the channel connection.
 * @param {Object} extraParams  Extra parameter keys and values to add to the
 *     requests.
 */
goog.net.BrowserChannel.prototype.connect = function(testPath, channelPath,
                                                     extraParams) {
  this.channelDebug_.debug('connect()');

  goog.net.BrowserChannel.notifyStatEvent(
      goog.net.BrowserChannel.Stat.CONNECT_ATTEMPT);

  this.path_ = channelPath;
  this.extraParams_ = extraParams;
  this.connectTest_(testPath);
};


/**
 * Disconnects and closes the channel.
 */
goog.net.BrowserChannel.prototype.disconnect = function() {
  this.channelDebug_.debug('disconnect()');

  this.cancelRequests_();

  if (this.state_ == goog.net.BrowserChannel.State.OPENED) {
    var rid = this.nextRid_++;
    var uri = this.forwardChannelUri_.clone();
    uri.setParameterValue('SID', this.sid_);
    uri.setParameterValue('RID', rid);
    uri.setParameterValue('TYPE', 'terminate');

    // Add the reconnect parameters.
    this.addAdditionalParams_(uri);

    var request = new goog.net.ChannelRequest(
        this, this.channelDebug_, this.sid_, rid);
    request.sendUsingImgTag(uri);
    this.onClose_();
  }
};


/**
 * Returns the session id of the channel. Only available after the
 * channel has been opened.
 * @return {string} Session ID.
 */
goog.net.BrowserChannel.prototype.getSessionId = function() {
  return this.sid_;
};


/**
 * Starts the test channel to determine network conditions.
 *
 * @param {string} testPath  The relative PATH for the test connection.
 * @private
 */
goog.net.BrowserChannel.prototype.connectTest_ = function(testPath) {
  this.channelDebug_.debug('connectTest_()');
  this.connectionTest_ = new goog.net.BrowserTestChannel(
      this, this.channelDebug_);
  this.connectionTest_.setExtraHeaders(this.extraHeaders_);
  this.connectionTest_.connect(testPath);
};


/**
 * Starts the regular channel which is run after the test channel is complete.
 * @private
 */
goog.net.BrowserChannel.prototype.connectChannel_ = function() {
  this.channelDebug_.debug('connectChannel_()');
  this.ensureInState_(goog.net.BrowserChannel.State.INIT);
  this.forwardChannelUri_ =
      this.getForwardChannelUri(/** @type {string} */ (this.path_));
  this.ensureForwardChannel_();
};


/**
 * Cancels all outstanding requests.
 * @private
 */
goog.net.BrowserChannel.prototype.cancelRequests_ = function() {
  if (this.connectionTest_) {
    this.connectionTest_.abort();
    this.connectionTest_ = null;
  }

  if (this.backChannelRequest_) {
    this.backChannelRequest_.cancel();
    this.backChannelRequest_ = null;
  }

  if (this.forwardChannelRequest_) {
    this.forwardChannelRequest_.cancel();
    this.forwardChannelRequest_ = null;
  }
};


/**
 * Returns the extra HTTP headers to add to all the requests sent to the server.
 *
 * @return {Object} The HTTP headers, or null.
 */
goog.net.BrowserChannel.prototype.getExtraHeaders = function() {
  return this.extraHeaders_;
};


/**
 * Sets extra HTTP headers to add to all the requests sent to the server.
 *
 * @param {Object} extraHeaders The HTTP headers, or null.
 */
goog.net.BrowserChannel.prototype.setExtraHeaders = function(extraHeaders) {
  this.extraHeaders_ = extraHeaders;
};


/**
 * Returns the handler used for channel callback events.
 *
 * @return {goog.net.BrowserChannel.Handler} The handler.
 */
goog.net.BrowserChannel.prototype.getHandler = function() {
  return this.handler_;
};


/**
 * Sets the handler used for channel callback events.
 * @param {goog.net.BrowserChannel.Handler} handler The handler to set.
 */
goog.net.BrowserChannel.prototype.setHandler = function(handler) {
  this.handler_ = handler;
};


/**
 * Returns whether the channel allows the use of a subdomain. There may be
 * cases where this isn't allowed.
 * @return {boolean} Whether a host prefix is allowed.
 */
goog.net.BrowserChannel.prototype.getAllowHostPrefix = function() {
  return this.allowHostPrefix_;
};


/**
 * Sets whether the channel allows the use of a subdomain. There may be cases
 * where this isn't allowed, for example, logging in with troutboard where
 * using a subdomain causes Apache to force the user to authenticate twice.
 * @param {boolean} allowHostPrefix Whether a host prefix is allowed.
 */
goog.net.BrowserChannel.prototype.setAllowHostPrefix =
    function(allowHostPrefix) {
  this.allowHostPrefix_ = allowHostPrefix;
};

/**
 * Returns whether the channel is buffered or not. This state is valid for
 * querying only after the test connection has completed. This may be
 * queried in the goog.net.BrowserChannel.okToMakeRequest() callback.
 * A channel may be buffered if the test connection determines that
 * a chunked response could not be sent down within a suitable time.
 * @return {boolean} Whether the channel is buffered.
 */
goog.net.BrowserChannel.prototype.isBuffered = function() {
  return !this.useChunked_;
};

/**
 * Returns whether chunked mode is allowed. In certain debugging situations,
 * it's useful for the application to have a way to disable chunked mode for a
 * user.

 * @return {boolean} Whether chunked mode is allowed.
 */
goog.net.BrowserChannel.prototype.getAllowChunkedMode =
    function() {
  return this.allowChunkedMode_;
};


/**
 * Sets whether chunked mode is allowed. In certain debugging situations, it's
 * useful for the application to have a way to disable chunked mode for a user.
 * @param {boolean} allowChunkedMode  Whether chunked mode is allowed.
 */
goog.net.BrowserChannel.prototype.setAllowChunkedMode =
    function(allowChunkedMode) {
  this.allowChunkedMode_ = allowChunkedMode;
};


/**
 * Sends a request to the server. The format of the request is a Map data
 * structure of key/value pairs. These maps are then encoded in a format
 * suitable for the wire and then reconstituted as a Map data structure that
 * the server can process.
 * @param {Object|goog.structs.Map} map  The map to send.
 */
goog.net.BrowserChannel.prototype.sendMap = function(map) {
  if (this.state_ == goog.net.BrowserChannel.State.CLOSED) {
    throw Error('Invalid operation: sending map when state is closed');
  }

  this.outgoingMaps_.push(map);
  if (this.state_ == goog.net.BrowserChannel.State.OPENING ||
      this.state_ == goog.net.BrowserChannel.State.OPENED) {
    this.ensureForwardChannel_();
  }
};


/**
 * When set to true, this changes the behavior of the forward channel so it
 * will not retry requests; it will fail after one network failure, and if
 * there was already one network failure, the request will fail immediately.
 * @param {boolean} failFast  Whether or not to fail fast.
 */
goog.net.BrowserChannel.prototype.setFailFast = function(failFast) {
  this.failFast_ = failFast;
  this.channelDebug_.info('setFailFast: ' + failFast);
  if (this.forwardChannelRequest_) {
    this.channelDebug_.info('setting max forward-channel retries to ' +
        this.getForwardChannelMaxRetries());
    this.forwardChannelRequest_.setMaxRetries(
        this.getForwardChannelMaxRetries());
  }
};


/**
 * @return {number}  The max number of retries, which will be 0 in fail-fast
 * mode.
 */
goog.net.BrowserChannel.prototype.getForwardChannelMaxRetries = function() {
  return this.failFast_ ?
         0 : goog.net.BrowserChannel.FORWARD_CHANNEL_MAX_RETRIES;
};


/**
 * Returns whether the channel is closed
 * @return {boolean} true if the channel is closed.
 */
goog.net.BrowserChannel.prototype.isClosed = function() {
  return this.state_ == goog.net.BrowserChannel.State.CLOSED;
};


/**
 * Returns the browser channel state.
 * @return {goog.net.BrowserChannel.State} The current state of the browser
 * channel.
 */
goog.net.BrowserChannel.prototype.getState = function() {
  return this.state_;
};

/**
 * Return the last status code received for a request.
 * @return {number} The last status code received for a request.
 */
goog.net.BrowserChannel.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};


/**
 * Returns whether there are outstanding requests servicing the channel.
 * @return {boolean} true if there are outstanding requests.
 */
goog.net.BrowserChannel.prototype.hasOutstandingRequests = function() {
  return this.outstandingRequests_() != 0;
};


/**
 * Returns the number of outstanding requests.
 * @return {number} The number of outstanding requests to the server.
 * @private
 */
goog.net.BrowserChannel.prototype.outstandingRequests_ = function() {
  var count = 0;
  if (this.backChannelRequest_) {
    count++;
  }
  if (this.forwardChannelRequest_) {
    count++;
  }
  return count;
};


/**
 * Ensures that a forward channel request is scheduled.
 * @private
 */
goog.net.BrowserChannel.prototype.ensureForwardChannel_ = function() {
  if (this.forwardChannelRequest_) {
    // connection in process - no need to start a new request
    return;
  }

  if (this.forwardChannelTimerId_) {
    // no need to start a new request - one is already scheduled
    return;
  }

  this.forwardChannelTimerId_ = goog.net.BrowserChannel.setTimeout(
      goog.bind(this.onStartForwardChannelTimer_, this), 0);
};


/**
 * Timer callback for ensureForwardChannel
 * @private
 */
goog.net.BrowserChannel.prototype.onStartForwardChannelTimer_ = function() {
  this.forwardChannelTimerId_ = null;
  this.startForwardChannel_();
};


/**
 * Begins a new forward channel operation to the server.
 * @private
 */
goog.net.BrowserChannel.prototype.startForwardChannel_ = function() {
  this.channelDebug_.debug('startForwardChannel_');

  if (this.state_ == goog.net.BrowserChannel.State.INIT) {
    this.open_();
    this.state_ = goog.net.BrowserChannel.State.OPENING;
  } else if (this.state_ == goog.net.BrowserChannel.State.OPENED) {
    // make sure there is a connection open to receive data
    this.ensureBackChannel_();

    if (!this.okToMakeRequest_()) {
      // channel is cancelled
      return;
    }

    if (this.outgoingMaps_.length == 0) {
      this.channelDebug_.debug('startForwardChannel_ returned: ' +
                                  'nothing to send');
      // no need to start a new forward channel request
      return;
    }

    if (this.forwardChannelRequest_) {
      this.channelDebug_.debug('startForwardChannel_ returned: ' +
                                  'connection already in progress');
      // no need to start a new forward channel request
      return;
    }

    this.makeForwardChannelRequest_();
    this.channelDebug_.debug('startForwardChannel_ finished, sent request');
  }
};


/**
 * Establishes a new channel session with the the server.
 * @private
 */
goog.net.BrowserChannel.prototype.open_ = function() {
  this.channelDebug_.debug('open_()');
  this.nextRid_ = Math.floor(Math.random() * 100000);

  var rid = this.nextRid_++;
  var request = new goog.net.ChannelRequest(this, this.channelDebug_, '', rid);
  request.setExtraHeaders(this.extraHeaders_);
  var requestText = this.dequeueOutgoingMaps_();
  var uri = this.forwardChannelUri_.clone();
  uri.setParameterValue('RID', rid);
  if (this.clientVersion_) {
   uri.setParameterValue('CVER', this.clientVersion_);
  }

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  request.xmlHttpPost(uri, requestText, true);
  this.forwardChannelRequest_ = request;
};


/**
 * Makes a forward channel request using XMLHTTP.
 * @private
 */
goog.net.BrowserChannel.prototype.makeForwardChannelRequest_ = function() {
  var rid = this.nextRid_++;
  var uri = this.forwardChannelUri_.clone();
  uri.setParameterValue('SID', this.sid_);
  uri.setParameterValue('RID', rid);
  // Add the additional reconnect parameters.
  this.addAdditionalParams_(uri);

  var requestText = this.dequeueOutgoingMaps_();
  var request = new goog.net.ChannelRequest(
      this, this.channelDebug_, this.sid_, rid);
  request.setExtraHeaders(this.extraHeaders_);
  request.setMaxRetries(this.getForwardChannelMaxRetries());

  // randomize from 50%-100% of the forward channel retry timeout to avoid
  // a big hit if servers happen to die at once.
  request.setRetryTimeout(
      Math.round(goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT * 0.50) +
      Math.round(goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT * 0.50 *
                 Math.random()));
  this.forwardChannelRequest_ = request;
  request.xmlHttpPost(uri, requestText, true);
};


/**
 * Adds the additional parameters from the handler to the given URI.
 * @param {goog.Uri} uri The URI to add the parameters to.
 * @private
 */
goog.net.BrowserChannel.prototype.addAdditionalParams_ = function(uri) {
  // Add the additional reconnect parameters as needed.
  if (this.handler_) {
    var params = this.handler_.getAdditionalParams(this);
    if (params) {
      goog.structs.forEach(params, function(value, key, coll) {
        uri.setParameterValue(key, value);
      });
    }
  }
};


/**
 * Returns the request text from the outgoing maps and resets it.
 * @return {string} The encoded request text created from all the currently
 *                  queued outgoing maps.
 * @private
 */
goog.net.BrowserChannel.prototype.dequeueOutgoingMaps_ = function() {
  var sb = ['count=' + this.outgoingMaps_.length];
  for (var i = 0; i < this.outgoingMaps_.length; i++) {
    var map = this.outgoingMaps_[i];
    goog.structs.forEach(map, function(value, key, coll) {
      sb.push('req' + i + '_' + key + '=' + encodeURIComponent(value));
    });
  }
  this.outgoingMaps_.length = 0;
  return sb.join('&');
};


/**
 * Ensures there is a backchannel request for receiving data from the server.
 * @private
 */
goog.net.BrowserChannel.prototype.ensureBackChannel_ = function() {
  if (this.backChannelRequest_) {
    // already have one
    return;
  }

  if (this.backChannelTimerId_) {
    // no need to start a new request - one is already scheduled
    return;
  }

  this.backChannelTimerId_ = goog.net.BrowserChannel.setTimeout(
      goog.bind(this.onStartBackChannelTimer_, this), 0);
};


/**
 * Timer callback for ensureBackChannel_.
 * @private
 */
goog.net.BrowserChannel.prototype.onStartBackChannelTimer_ = function() {
  this.backChannelTimerId_ = null;
  this.startBackChannel_();
};


/**
 * Begins a new back channel operation to the server.
 * @private
 */
goog.net.BrowserChannel.prototype.startBackChannel_ = function() {
  if (!this.okToMakeRequest_()) {
    // channel is cancelled
    return;
  }

  this.channelDebug_.debug('Creating new HttpRequest');
  this.backChannelRequest_ =
      new goog.net.ChannelRequest(this, this.channelDebug_, this.sid_, 'rpc');
  this.backChannelRequest_.setExtraHeaders(this.extraHeaders_);
  var uri = this.backChannelUri_.clone();
  uri.setParameterValue('RID', 'rpc');
  uri.setParameterValue('SID', this.sid_);
  uri.setParameterValue('CI', this.useChunked_ ? '0' : '1');
  uri.setParameterValue('AID', this.lastArrayId_);

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  if (goog.userAgent.IE) {
    uri.setParameterValue('TYPE', 'html');
    this.backChannelRequest_.tridentGet(uri, Boolean(this.hostPrefix_));
  } else {
    uri.setParameterValue('TYPE', 'xmlhttp');
    this.backChannelRequest_.setMaxRetries(
        goog.net.BrowserChannel.BACK_CHANNEL_XMHTTP_MAX_RETRIES);
    this.backChannelRequest_.xmlHttpGet(uri, true);
  }
  this.channelDebug_.debug('New Request created');
};


/**
 * Gives the handler a chance to return an error code and stop channel
 * execution. A handler might want to do this to check that the user is still
 * logged in, for example.
 * @private
 * @return {boolean} If it's OK to make a request.
 */
goog.net.BrowserChannel.prototype.okToMakeRequest_ = function() {
  if (this.handler_) {
    var result = this.handler_.okToMakeRequest(this);
    if (result != goog.net.BrowserChannel.Error.OK) {
      this.channelDebug_.debug('Handler returned error code from ' +
                                  'okToMakeRequest');
      this.signalError_(result);
      return false;
    }
  }
  return true;
};


/**
 * Callback from BrowserTestChannel for when the channel is finished.
 * @param {goog.net.BrowserTestChannel} testChannel The BrowserTestChannel.
 * @param {boolean} useChunked  Whether we can chunk responses.
 */
goog.net.BrowserChannel.prototype.testConnectionFinished =
    function(testChannel, useChunked) {
  this.channelDebug_.debug('Test Connection Finished');

  this.useChunked_ = this.allowChunkedMode_ && useChunked;
  this.lastStatusCode_ = testChannel.getLastStatusCode();
  this.connectChannel_();
};


/**
 * Callback from BrowserTestChannel for when the channel has an error.
 * @param {goog.net.BrowserTestChannel} testChannel The BrowserTestChannel.
 * @param {goog.net.ChannelRequest.Error} errorCode  The error code of the
       failure.
 */
goog.net.BrowserChannel.prototype.testConnectionFailure =
    function(testChannel, errorCode) {
  this.channelDebug_.debug('Test Connection Failed');
  this.lastStatusCode_ = testChannel.getLastStatusCode();
  this.signalError_(goog.net.BrowserChannel.Error.REQUEST_FAILED);
};


/**
 * Callback from BrowserTestChannel for when the channel is blocked.
 * @param {goog.net.BrowserTestChannel} testChannel The BrowserTestChannel.
 */
goog.net.BrowserChannel.prototype.testConnectionBlocked =
    function(testChannel) {
  this.channelDebug_.debug('Test Connection Blocked');
  this.lastStatusCode_ = this.connectionTest_.getLastStatusCode();
  this.signalError_(goog.net.BrowserChannel.Error.BLOCKED);
};


/**
 * Callback from ChannelRequest for when new data is received
 * @param {goog.net.ChannelRequest} request  The request object.
 * @param {string} responseText The text of the response.
 */
goog.net.BrowserChannel.prototype.onRequestData =
    function(request, responseText) {
  if (this.state_ == goog.net.BrowserChannel.State.CLOSED ||
      (this.backChannelRequest_ != request &&
       this.forwardChannelRequest_ != request)) {
    // either CLOSED or a request we don't know about (perhaps an old request)
    return;
  }
  this.lastStatusCode_ = request.getLastStatusCode();

  if (this.forwardChannelRequest_ == request &&
      this.state_ == goog.net.BrowserChannel.State.OPENED) {
    // expect magic cookie in response
    if (responseText != goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE) {
      this.channelDebug_.debug('Bad data returned - missing/invald ' +
                                  'magic cookie');
      this.signalError_(goog.net.BrowserChannel.Error.BAD_RESPONSE);
    }
  } else {
    if (!goog.string.isEmpty(responseText)) {
      this.onInput_(/** @type {Array} */ (goog.json.unsafeParse(responseText)));
    }
  }
};


/**
 * Callback from ChannelRequest that indicates a request has completed.
 * @param {goog.net.ChannelRequest} request  The request object.
 */
goog.net.BrowserChannel.prototype.onRequestComplete =
    function(request) {
  this.channelDebug_.debug('Request complete');
  var foundRequest = false;
  if (this.backChannelRequest_ == request) {
    this.backChannelRequest_ = null;
    foundRequest = true;
  } else if (this.forwardChannelRequest_ == request) {
    this.forwardChannelRequest_ = null;
    foundRequest = true;
  }

  // return if it was an old request from a previous session
  if (!foundRequest) {
    return;
  }
  this.lastStatusCode_ = request.getLastStatusCode();

  if (this.state_ == goog.net.BrowserChannel.State.CLOSED) {
    return;
  }

  if (!request.getSuccess()) {
    this.channelDebug_.debug('Error: HTTP request failed');
    switch (request.getLastError()) {
      case goog.net.ChannelRequest.Error.NO_DATA:
        this.signalError_(goog.net.BrowserChannel.Error.NO_DATA);
        break;
      case goog.net.ChannelRequest.Error.BAD_DATA:
        this.signalError_(goog.net.BrowserChannel.Error.BAD_DATA);
        break;
      case goog.net.ChannelRequest.Error.UNKNOWN_SESSION_ID:
        this.signalError_(goog.net.BrowserChannel.Error.UNKNOWN_SESSION_ID);
        break;
      default:
        this.signalError_(goog.net.BrowserChannel.Error.REQUEST_FAILED);
        break;
    }
    return;
  }

  this.ensureForwardChannel_();
  this.ensureBackChannel_();
};


/**
 * Processes the data returned by the server.
 * @param {Array} respArray The response array returned by the server.
 * @private
 */
goog.net.BrowserChannel.prototype.onInput_ = function(respArray) {
  // respArray is an array of arrays
  var batch = this.handler_ && this.handler_.channelHandleMultipleArrays ?
      [] : null;
  for (var i = 0; i < respArray.length; i++) {
    var nextArray = respArray[i];
    this.lastArrayId_ = nextArray[0];
    nextArray = nextArray[1];
    if (this.state_ == goog.net.BrowserChannel.State.OPENING) {
      if (nextArray[0] == 'c') {
        this.sid_ = nextArray[1];
        if (this.allowHostPrefix_) {
          this.hostPrefix_ = nextArray[2];
        } else {
          this.hostPrefix_ = null;
        }
        this.state_ = goog.net.BrowserChannel.State.OPENED;
        if (this.handler_) {
          this.handler_.channelOpened(this);
        }
        this.backChannelUri_ = this.getBackChannelUri(
            this.hostPrefix_, /** @type {string} */ (this.path_));
      } else if (nextArray[0] == 'stop') {
        this.signalError_(goog.net.BrowserChannel.Error.STOP);
      }
    } else if (this.state_ == goog.net.BrowserChannel.State.OPENED) {
      if (nextArray[0] == 'stop') {
        if (batch && batch.length) {
          this.handler_.channelHandleMultipleArrays(this, batch);
          batch.length = 0;
        }
        this.signalError_(goog.net.BrowserChannel.Error.STOP);
      } else if (nextArray[0] == 'noop') {
        // ignore - noop to keep connection happy
      } else {
        if (batch) {
          batch.push(nextArray);
        } else if (this.handler_) {
          this.handler_.channelHandleArray(this, nextArray);
        }
      }
    }
  }
  if (batch && batch.length) {
    this.handler_.channelHandleMultipleArrays(this, batch);
  }
};


/**
 * Helper to ensure the BrowserChannel is in the expected state.
 * @param {number} state The expected state.
 * @private
 */
goog.net.BrowserChannel.prototype.ensureInState_ = function(state) {
  if (this.state_ != state) {
    throw Error('Invalid operation: expected channel state ' + state +
      ' got channel state ' + this.state_);
  }
};


/**
 * Signals an error has occurred.
 * @param {goog.net.BrowserChannel.Error} error  The error code for the failure.
 * @private
 */
goog.net.BrowserChannel.prototype.signalError_ = function(error) {
  this.channelDebug_.info('Error code ' + error);
  if (error == goog.net.BrowserChannel.Error.REQUEST_FAILED ||
      error == goog.net.BrowserChannel.Error.BLOCKED) {
    // Ping google to check if it's a gmail error or user's network error
    var imageUri = null;
    if (this.handler_) {
      imageUri = this.handler_.getNetworkTestImageUri(this);
    }
    goog.net.testGoogleCom(
        goog.bind(this.testGoogleComCallback_, this, error), imageUri);
  } else {
    this.onError_(error);
  }
};


/**
 * Callback for testGoogleCom during error handling.
 * @param {goog.net.BrowserChannel.Error} error The error code for the failure.
 * @param {boolean} networkUp Whether the network is up.
 * @private
 */
goog.net.BrowserChannel.prototype.testGoogleComCallback_ =
    function(error, networkUp) {
  if (networkUp) {
    this.channelDebug_.info('Successfully pinged google.com');
    this.onError_(error);
  } else {
    this.channelDebug_.info('Failed to ping google.com');
    this.onError_(goog.net.BrowserChannel.Error.NETWORK);
  }
};


/**
 * Called when we've determined the final error for a channel. It closes the
 * notifiers the handler of the error and closes the channel.
 * @param {goog.net.BrowserChannel.Error} error  The error code for the failure.
 * @private
 */
goog.net.BrowserChannel.prototype.onError_ = function(error) {
  this.channelDebug_.debug('HttpChannel: error - ' + error);
  if (error == goog.net.BrowserChannel.Error.NETWORK) {
    goog.net.BrowserChannel.notifyStatEvent(
        goog.net.BrowserChannel.Stat.ERROR_NETWORK);
  } else {
    goog.net.BrowserChannel.notifyStatEvent(
        goog.net.BrowserChannel.Stat.ERROR_OTHER);
  }
  this.state_ = goog.net.BrowserChannel.State.CLOSED;
  if (this.handler_) {
    this.handler_.channelError(this, error);
  }
  this.onClose_();
  this.cancelRequests_();
};


/**
 * Called when the channel has been closed. It notifiers the handler of the
 * event.
 * @private
 */
goog.net.BrowserChannel.prototype.onClose_ = function() {
  this.state_ = goog.net.BrowserChannel.State.CLOSED;
  this.lastStatusCode_ = -1;
  if (this.handler_) {
    this.handler_.channelClosed(this);
  }
};


/**
 * Gets the Uri used for the connection that sends data to the server.
 * @param {string} path The path on the host.
 * @return {goog.Uri} The forward channel URI.
 */
goog.net.BrowserChannel.prototype.getForwardChannelUri =
    function(path) {
  var uri = this.createDataUri(null, path);
  this.channelDebug_.debug('GetForwardChannelUri: ' + uri);
  return uri;
};


/**
 * Gets the Uri used for the connection that receives data from the server.
 * @param {string?} hostPrefix The host prefix.
 * @param {string} path The path on the host.
 * @return {goog.Uri} The back channel URI.
 */
goog.net.BrowserChannel.prototype.getBackChannelUri =
    function(hostPrefix, path) {
  var uri = this.createDataUri(goog.userAgent.IE ? hostPrefix : null, path);
  this.channelDebug_.debug('GetBackChannelUri: ' + uri);
  return uri;
};


/**
 * Creates a data Uri applying logic for secondary hostprefix, port
 * overrides, and versioning.
 * @param {string?} hostPrefix The host prefix.
 * @param {string} path The path on the host.
 * @param {number} opt_overridePort Optional override port.
 * @return {goog.Uri} The data URI.
 */
goog.net.BrowserChannel.prototype.createDataUri =
    function(hostPrefix, path, opt_overridePort) {
  var locationPage = window.location;
  var hostName;
  if (hostPrefix) {
    hostName = hostPrefix + '.' + locationPage.hostname;
  } else {
    hostName = locationPage.hostname;
  }

  var port = opt_overridePort || locationPage.port;

  var uri = goog.Uri.create(locationPage.protocol, null, hostName, port, path);
  if (this.extraParams_) {
    goog.structs.forEach(this.extraParams_, function(value, key, coll) {
      uri.setParameterValue(key, value);
    });
  }

  // Add the protocol version to the URI.
  uri.setParameterValue('VER', goog.net.BrowserChannel.VERSION);

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  return uri;
};


/**
 * Gets whether this channel is currently active. This is used to determine the
 * length of time to wait before retrying. This call delegates to the handler.
 * @return {boolean} Whether the channel is currently active.
 */
goog.net.BrowserChannel.prototype.isActive = function() {
  return this.handler_.isActive(this);
};


/**
 * Wrapper around SafeTimeout which calls the start and end execution hooks
 * with a try...finally block.
 * @param {Function} fn The callback function.
 * @param {number} ms The time in MS for the timer.
 * @return {number} The ID of the timer.
 */
goog.net.BrowserChannel.setTimeout = function(fn, ms) {
  if (!goog.isFunction(fn)) {
    throw Error('Fn must not be null and must be a function');
  }
  return goog.global.setTimeout(function() {
    goog.net.BrowserChannel.onStartExecution();
    try {
      fn();
    } finally {
      goog.net.BrowserChannel.onEndExecution();
    }
  }, ms);
};


/**
 * Helper function to call the start hook
 */
goog.net.BrowserChannel.onStartExecution = function() {
  goog.net.BrowserChannel.startExecutionHook_();
};


/**
 * Helper function to call the end hook
 */
goog.net.BrowserChannel.onEndExecution = function() {
  goog.net.BrowserChannel.endExecutionHook_();
};


/**
 * Returns the singleton event target for stat events.
 * @return {goog.events.EventTarget} The event target for stat events.
 */
goog.net.BrowserChannel.getStatEventTarget = function() {
  return goog.net.BrowserChannel.statEventTarget_;
};


/**
 * Helper function to call the stat event callback.
 * @param {goog.net.BrowserChannel.Stat} stat The stat.
 */
goog.net.BrowserChannel.notifyStatEvent = function(stat) {
  var target = goog.net.BrowserChannel.statEventTarget_;
  target.dispatchEvent(
      new goog.net.BrowserChannel.StatEvent(target, stat));
};


/**
 * A LogSaver that can be used to accumulate all the debug logs for
 * BrowserChannels so they can be sent to the server when a problem is
 * detected.
 */
goog.net.BrowserChannel.LogSaver = {};

/**
 * Buffer for accumulating the debug log
 * @type {goog.structs.CircularBuffer}
 * @private
 */
goog.net.BrowserChannel.LogSaver.buffer_ =
    new goog.structs.CircularBuffer(1000);

/**
 * Whether we're currently accumulating the debug log.
 * @type {boolean}
 * @private
 */
goog.net.BrowserChannel.LogSaver.enabled_ = false;


/**
 * Formatter for saving logs.
 * @type {goog.debug.Formatter}
 * @private
 */
goog.net.BrowserChannel.LogSaver.formatter_ = new goog.debug.TextFormatter();

/**
 * Returns whether the LogSaver is enabled.
 * @return {boolean} Whether saving is enabled or disabled.
 */
goog.net.BrowserChannel.LogSaver.isEnabled = function() {
  return goog.net.BrowserChannel.LogSaver.enabled_
};


/**
 * Enables of disables the LogSaver.
 * @param {boolean} enable Whether to enable or disable saving.
 */
goog.net.BrowserChannel.LogSaver.setEnabled = function(enable) {
  if (enable == goog.net.BrowserChannel.LogSaver.enabled_) {
    return;
  }

  var fn = goog.net.BrowserChannel.LogSaver.addLogRecord;
  var logger = goog.debug.Logger.getLogger('goog.net');
  if (enable) {
    logger.addHandler(fn);
  } else {
    logger.removeHandler(fn);
  }
};


/**
 * Adds a log record.
 * @param {goog.debug.LogRecord} logRecord the LogRecord.
 */
goog.net.BrowserChannel.LogSaver.addLogRecord = function(logRecord) {
  goog.net.BrowserChannel.LogSaver.buffer_.add(
      goog.net.BrowserChannel.LogSaver.formatter_.formatRecord(logRecord));
};

/**
 * Returns the log as a single string.
 * @return {string} The log as a single string.
 */
goog.net.BrowserChannel.LogSaver.getBuffer = function() {
  return goog.net.BrowserChannel.LogSaver.buffer_.getValues().join('');
};


/**
 * Clears the buffer
 */
goog.net.BrowserChannel.LogSaver.clearBuffer = function() {
  goog.net.BrowserChannel.LogSaver.buffer_.clear();
};



/**
 * Interface for the browser channel handler
 * @constructor
 */
goog.net.BrowserChannel.Handler = function() {
};


/**
 * Callback handler for when a batch of response arrays is received from the
 * server.
 * @type {Function?}
 */
goog.net.BrowserChannel.Handler.prototype.channelHandleMultipleArrays = null;


/**
 * Whether it's okay to make a request to the server. A handler can return
 * false if the channel should fail. For example, if the user has logged out,
 * the handler may want all requests to fail immediately.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @return {goog.net.BrowserChannel.Error} An error code. The code should
 * return goog.net.BrowserChannel.Error.OK to indicate it's okay. Any other
 * error code will cause a failure.
 */
goog.net.BrowserChannel.Handler.prototype.okToMakeRequest =
    function(browserChannel) {
  return goog.net.BrowserChannel.Error.OK;
};


/**
 * Indicates the BrowserChannel has successfully negotiated with the server
 * and can now send and receive data.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 */
goog.net.BrowserChannel.Handler.prototype.channelOpened =
    function(browserChannel) {
};


/**
 * New input is available for the application to process.
 *
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @param {Array} array The data array.
 */
goog.net.BrowserChannel.Handler.prototype.channelHandleArray =
    function(browserChannel, array) {

};


/**
 * Indicates an error occurred on the BrowserChannel.
 *
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @param {goog.net.BrowserChannel.Error} error The error code.
 */
goog.net.BrowserChannel.Handler.prototype.channelError =
    function(browserChannel, error) {
};


/**
 * Indicates the BrowserChannel is closed.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 */
goog.net.BrowserChannel.Handler.prototype.channelClosed =
    function(browserChannel) {
};


/**
 * Gets any parameters that should be added at the time another connection is
 * made to the server.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @return {Object} Extra parameter keys and values to add to the
 *                  requests.
 */
goog.net.BrowserChannel.Handler.prototype.getAdditionalParams =
    function(browserChannel) {
  return {};
};


/**
 * Gets the URI of an image that can be used to test network connectivity.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @return {goog.Uri?} A custom URI to load for the network test.
 */
goog.net.BrowserChannel.Handler.prototype.getNetworkTestImageUri =
    function(browserChannel) {
  return null;
};


/**
 * Gets whether this channel is currently active. This is used to determine the
 * length of time to wait before retrying.
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @return {boolean} Whether the channel is currently active.
 */
goog.net.BrowserChannel.Handler.prototype.isActive = function(browserChannel) {
  return true;
};
