// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base WebChannel implementation.
 */


goog.provide('goog.labs.net.webChannel.WebChannelBase');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.async.run');
goog.require('goog.json');
goog.require('goog.labs.net.webChannel.BaseTestChannel');
goog.require('goog.labs.net.webChannel.Channel');
goog.require('goog.labs.net.webChannel.ChannelRequest');
goog.require('goog.labs.net.webChannel.ConnectionState');
goog.require('goog.labs.net.webChannel.ForwardChannelRequestPool');
goog.require('goog.labs.net.webChannel.WebChannelDebug');
goog.require('goog.labs.net.webChannel.Wire');
goog.require('goog.labs.net.webChannel.WireV8');
goog.require('goog.labs.net.webChannel.netUtils');
goog.require('goog.labs.net.webChannel.requestStats');
goog.require('goog.net.WebChannel');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XmlHttpFactory');
goog.require('goog.net.rpc.HttpCors');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.structs');

goog.scope(function() {
var WebChannel = goog.net.WebChannel;
var BaseTestChannel = goog.labs.net.webChannel.BaseTestChannel;
var ChannelRequest = goog.labs.net.webChannel.ChannelRequest;
var ConnectionState = goog.labs.net.webChannel.ConnectionState;
var ForwardChannelRequestPool =
    goog.labs.net.webChannel.ForwardChannelRequestPool;
var WebChannelDebug = goog.labs.net.webChannel.WebChannelDebug;
var Wire = goog.labs.net.webChannel.Wire;
var WireV8 = goog.labs.net.webChannel.WireV8;
var netUtils = goog.labs.net.webChannel.netUtils;
var requestStats = goog.labs.net.webChannel.requestStats;

var httpCors = goog.module.get('goog.net.rpc.HttpCors');


/**
 * This WebChannel implementation is branched off goog.net.BrowserChannel
 * for now. Ongoing changes to goog.net.BrowserChannel will be back
 * ported to this implementation as needed.
 *
 * @param {!goog.net.WebChannel.Options=} opt_options Configuration for the
 *        WebChannel instance.
 * @param {number=} opt_clientVersion An application-specific version number
 *        that is sent to the server when connected.
 * @param {!ConnectionState=} opt_conn Previously determined connection
 *        conditions.
 * @constructor
 * @struct
 * @implements {goog.labs.net.webChannel.Channel}
 */
goog.labs.net.webChannel.WebChannelBase = function(
    opt_options, opt_clientVersion, opt_conn) {
  /**
   * The client library version (capabilities).
   * @private {number}
   */
  this.clientVersion_ = opt_clientVersion || 0;

  /**
   * The server library version (capabilities).
   * @private {number}
   */
  this.serverVersion_ = 0;


  /**
   * An array of queued maps that need to be sent to the server.
   * @private {!Array<Wire.QueuedMap>}
   */
  this.outgoingMaps_ = [];

  /**
   * The channel debug used for logging
   * @private {!WebChannelDebug}
   */
  this.channelDebug_ = new WebChannelDebug();

  /**
   * Previous connectivity test results.
   * @private {!ConnectionState}
   */
  this.connState_ = opt_conn || new ConnectionState();

  /**
   * Extra HTTP headers to add to all the requests sent to the server.
   * @private {?Object}
   */
  this.extraHeaders_ = null;

  /**
   * Extra HTTP headers to add to the init request(s) sent to the server.
   * @private {?Object}
   */
  this.initHeaders_ = null;

  /**
   * @private {?string} The URL param name to overwrite custom HTTP headers
   * to bypass CORS preflight.
   */
  this.httpHeadersOverwriteParam_ = null;

  /**
   * Extra parameters to add to all the requests sent to the server.
   * @private {?Object}
   */
  this.extraParams_ = null;

  /**
   * Parameter name for the http session id.
   * @private {?string}
   */
  this.httpSessionIdParam_ = null;

  /**
   * The http session id, to be sent with httpSessionIdParam_ with each
   * request after the initial handshake.
   * @private {?string}
   */
  this.httpSessionId_ = null;

  /**
   * The ChannelRequest object for the backchannel.
   * @private {?ChannelRequest}
   */
  this.backChannelRequest_ = null;

  /**
   * The relative path (in the context of the the page hosting the browser
   * channel) for making requests to the server.
   * @private {?string}
   */
  this.path_ = null;

  /**
   * The absolute URI for the forwardchannel request.
   * @private {?goog.Uri}
   */
  this.forwardChannelUri_ = null;

  /**
   * The absolute URI for the backchannel request.
   * @private {?goog.Uri}
   */
  this.backChannelUri_ = null;

  /**
   * A subdomain prefix for using a subdomain in IE for the backchannel
   * requests.
   * @private {?string}
   */
  this.hostPrefix_ = null;

  /**
   * Whether we allow the use of a subdomain in IE for the backchannel requests.
   * @private {boolean}
   */
  this.allowHostPrefix_ = true;

  /**
   * The next id to use for the RID (request identifier) parameter. This
   * identifier uniquely identifies the forward channel request.
   * @private {number}
   */
  this.nextRid_ = 0;

  /**
   * The id to use for the next outgoing map. This identifier uniquely
   * identifies a sent map.
   * @private {number}
   */
  this.nextMapId_ = 0;

  /**
   * Whether to fail forward-channel requests after one try or a few tries.
   * @private {boolean}
   */
  this.failFast_ =
      !!goog.getObjectByName('internalChannelParams.failFast', opt_options);

  /**
   * The handler that receive callbacks for state changes and data.
   * @private {?goog.labs.net.webChannel.WebChannelBase.Handler}
   */
  this.handler_ = null;

  /**
   * Timer identifier for asynchronously making a forward channel request.
   * This is set to true if the func is scheduled with async.run, which
   * is equivalent to setTimeout(0).
   * @private {?number|?boolean}
   */
  this.forwardChannelTimerId_ = null;

  /**
   * Timer identifier for asynchronously making a back channel request.
   * @private {?number}
   */
  this.backChannelTimerId_ = null;

  /**
   * Timer identifier for the timer that waits for us to retry the backchannel
   * in the case where it is dead and no longer receiving data.
   * @private {?number}
   */
  this.deadBackChannelTimerId_ = null;

  /**
   * The TestChannel object which encapsulates the logic for determining
   * interesting network conditions about the client.
   * @private {?BaseTestChannel}
   */
  this.connectionTest_ = null;

  /**
   * Whether the client's network conditions can support chunked responses.
   * @private {?boolean}
   */
  this.useChunked_ = null;

  /**
   * Whether chunked mode is allowed. In certain debugging situations, it's
   * useful to disable this.
   * @private {boolean}
   */
  this.allowChunkedMode_ = true;

  /**
   * The array identifier of the last array received from the server for the
   * backchannel request.
   * @private {number}
   */
  this.lastArrayId_ = -1;

  /**
   * The array id of the last array sent by the server that we know about.
   * @private {number}
   */
  this.lastPostResponseArrayId_ = -1;

  /**
   * The last status code received.
   * @private {number}
   */
  this.lastStatusCode_ = -1;

  /**
   * Number of times we have retried the current forward channel request.
   * @private {number}
   */
  this.forwardChannelRetryCount_ = 0;

  /**
   * Number of times in a row that we have retried the current back channel
   * request and received no data.
   * @private {number}
   */
  this.backChannelRetryCount_ = 0;

  /**
   * The attempt id for the current back channel request. Starts at 1 and
   * increments for each reconnect. The server uses this to log if our
   * connection is flaky or not.
   * @private {number}
   */
  this.backChannelAttemptId_ = 0;

  /**
   * The base part of the time before firing next retry request. Default is 5
   * seconds. Note that a random delay is added (see {@link retryDelaySeedMs_})
   * for all retries, and linear backoff is applied to the sum for subsequent
   * retries.
   * @private {number}
   */
  this.baseRetryDelayMs_ =
      goog.getObjectByName(
          'internalChannelParams.baseRetryDelayMs', opt_options) ||
      5 * 1000;

  /**
   * A random time between 0 and this number of MS is added to the
   * {@link baseRetryDelayMs_}. Default is 10 seconds.
   * @private {number}
   */
  this.retryDelaySeedMs_ =
      goog.getObjectByName(
          'internalChannelParams.retryDelaySeedMs', opt_options) ||
      10 * 1000;

  /**
   * Maximum number of attempts to connect to the server for forward channel
   * requests. Defaults to 2.
   * @private {number}
   */
  this.forwardChannelMaxRetries_ =
      goog.getObjectByName(
          'internalChannelParams.forwardChannelMaxRetries', opt_options) ||
      2;

  /**
   * The timeout in milliseconds for a forward channel request. Defaults to 20
   * seconds. Note that part of this timeout can be randomized.
   * @private {number}
   */
  this.forwardChannelRequestTimeoutMs_ =
      goog.getObjectByName(
          'internalChannelParams.forwardChannelRequestTimeoutMs',
          opt_options) ||
      20 * 1000;

  /**
   * The custom factory used to create XMLHttpRequest objects.
   * @private {!goog.net.XmlHttpFactory | undefined}
   */
  this.xmlHttpFactory_ =
      (opt_options && opt_options.xmlHttpFactory) || undefined;

  /**
   * The timeout in milliseconds for a back channel request. Defaults to using
   * the timeout configured in ChannelRequest (45s). If server-side
   * keepaliveInterval is known to the client, set the backchannel request
   * timeout to 1.5 * keepaliveInterval (ms).
   *
   * @private {number|undefined}
   */
  this.backChannelRequestTimeoutMs_ = undefined;

  /**
   * A throttle time in ms for readystatechange events for the backchannel.
   * Useful for throttling when ready state is INTERACTIVE (partial data).
   *
   * This throttle is useful if the server sends large data chunks down the
   * backchannel.  It prevents examining XHR partial data on every readystate
   * change event.  This is useful because large chunks can trigger hundreds
   * of readystatechange events, each of which takes ~5ms or so to handle,
   * in turn making the UI unresponsive for a significant period.
   *
   * If set to zero no throttle is used.
   * @private {number}
   */
  this.readyStateChangeThrottleMs_ = 0;

  /**
   * Whether cross origin requests are supported for the channel.
   *
   * See {@link goog.net.XhrIo#setWithCredentials}.
   * @private {boolean}
   */
  this.supportsCrossDomainXhrs_ =
      (opt_options && opt_options.supportsCrossDomainXhr) || false;

  /**
   * The current session id.
   * @private {string}
   */
  this.sid_ = '';

  /**
   * The current ChannelRequest pool for the forward channel.
   * @private {!ForwardChannelRequestPool}
   */
  this.forwardChannelRequestPool_ = new ForwardChannelRequestPool(
      opt_options && opt_options.concurrentRequestLimit);

  /**
   * The V8 codec.
   * @private {!WireV8}
   */
  this.wireCodec_ = new WireV8();

  /**
   * Whether to run the channel test as a background process to not block
   * the OPEN event.
   *
   * @private {boolean}
   */
  this.backgroundChannelTest_ =
      opt_options && opt_options.backgroundChannelTest !== undefined ?
      opt_options.backgroundChannelTest :
      true;

  /**
   * Whether to turn on the fast handshake behavior.
   *
   * @private {boolean}
   */
  this.fastHandshake_ = (opt_options && opt_options.fastHandshake) || false;

  if (this.fastHandshake_ && !this.backgroundChannelTest_) {
    this.channelDebug_.warning(
        'Force backgroundChannelTest when fastHandshake is enabled.');
    this.backgroundChannelTest_ = true;
  }

  if (opt_options && opt_options.disableRedact) {
    this.channelDebug_.disableRedact();
  }

  if (opt_options && opt_options.forceLongPolling) {
    this.allowChunkedMode_ = false;
  }

  /**
   * Callback when all the pending client-sent messages have been flushed.
   *
   * @private {function()|undefined}
   */
  this.forwardChannelFlushedCallback_ = undefined;
};

var WebChannelBase = goog.labs.net.webChannel.WebChannelBase;


/**
 * The channel version that we negotiated with the server for this session.
 * Starts out as the version we request, and then is changed to the negotiated
 * version after the initial open.
 * @private {number}
 */
WebChannelBase.prototype.channelVersion_ = Wire.LATEST_CHANNEL_VERSION;


/**
 * Enum type for the channel state machine.
 * @enum {number}
 */
WebChannelBase.State = {
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
 * The current state of the WebChannel.
 * @private {!WebChannelBase.State}
 */
WebChannelBase.prototype.state_ = WebChannelBase.State.INIT;


/**
 * The timeout in milliseconds for a forward channel request.
 * @type {number}
 */
WebChannelBase.FORWARD_CHANNEL_RETRY_TIMEOUT = 20 * 1000;


/**
 * Maximum number of attempts to connect to the server for back channel
 * requests.
 * @type {number}
 */
WebChannelBase.BACK_CHANNEL_MAX_RETRIES = 3;


/**
 * A number in MS of how long we guess the maxmium amount of time a round trip
 * to the server should take. In the future this could be substituted with a
 * real measurement of the RTT.
 * @type {number}
 */
WebChannelBase.RTT_ESTIMATE = 3 * 1000;


/**
 * When retrying for an inactive channel, we will multiply the total delay by
 * this number.
 * @type {number}
 */
WebChannelBase.INACTIVE_CHANNEL_RETRY_FACTOR = 2;


/**
 * Enum type for identifying an error.
 * @enum {number}
 */
WebChannelBase.Error = {
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

  /** An error due to bad data being returned from the server. */
  BAD_DATA: 10,

  /** An error due to a response that is not parsable. */
  BAD_RESPONSE: 11
};


/**
 * Internal enum type for the two channel types.
 * @enum {number}
 * @private
 */
WebChannelBase.ChannelType_ = {
  FORWARD_CHANNEL: 1,

  BACK_CHANNEL: 2
};


/**
 * The maximum number of maps that can be sent in one POST. Should match
 * MAX_MAPS_PER_REQUEST on the server code.
 * @type {number}
 * @private
 */
WebChannelBase.MAX_MAPS_PER_REQUEST_ = 1000;


/**
 * The maximum number of utf-8 chars that can be sent in one GET to enable 0-RTT
 * handshake.
 *
 *  @const @private {number}
 */
WebChannelBase.MAX_CHARS_PER_GET_ = 4 * 1024;


/**
 * A guess at a cutoff at which to no longer assume the backchannel is dead
 * when we are slow to receive data. Number in bytes.
 *
 * Assumption: The worst bandwidth we work on is 50 kilobits/sec
 * 50kbits/sec * (1 byte / 8 bits) * 6 sec dead backchannel timeout
 * @type {number}
 */
WebChannelBase.OUTSTANDING_DATA_BACKCHANNEL_RETRY_CUTOFF = 37500;


/**
 * @return {number} The server version or 0 if undefined
 */
WebChannelBase.prototype.getServerVersion = function() {
  return this.serverVersion_;
};


/**
 * @return {!ForwardChannelRequestPool} The forward channel request pool.
 */
WebChannelBase.prototype.getForwardChannelRequestPool = function() {
  return this.forwardChannelRequestPool_;
};


/**
 * @return {!Object} The codec object, to be used for the test channel.
 */
WebChannelBase.prototype.getWireCodec = function() {
  return this.wireCodec_;
};


/**
 * Returns the logger.
 *
 * @return {!WebChannelDebug} The channel debug object.
 */
WebChannelBase.prototype.getChannelDebug = function() {
  return this.channelDebug_;
};


/**
 * Sets the logger.
 *
 * @param {!WebChannelDebug} channelDebug The channel debug object.
 */
WebChannelBase.prototype.setChannelDebug = function(channelDebug) {
  this.channelDebug_ = channelDebug;
};


/**
 * Starts the channel. This initiates connections to the server.
 *
 * @param {string} testPath  The path for the test connection.
 * @param {string} channelPath  The path for the channel connection.
 * @param {!Object=} opt_extraParams Extra parameter keys and values to add to
 *     the requests.
 * @param {string=} opt_oldSessionId  Session ID from a previous session.
 * @param {number=} opt_oldArrayId  The last array ID from a previous session.
 */
WebChannelBase.prototype.connect = function(
    testPath, channelPath, opt_extraParams, opt_oldSessionId, opt_oldArrayId) {
  this.channelDebug_.debug('connect()');

  requestStats.notifyStatEvent(requestStats.Stat.CONNECT_ATTEMPT);

  this.path_ = channelPath;
  this.extraParams_ = opt_extraParams || {};

  // Attach parameters about the previous session if reconnecting.
  if (opt_oldSessionId && opt_oldArrayId !== undefined) {
    this.extraParams_['OSID'] = opt_oldSessionId;
    this.extraParams_['OAID'] = opt_oldArrayId;
  }

  if (this.backgroundChannelTest_) {
    this.channelDebug_.debug('connect() bypassed channel-test.');
    this.connState_.handshakeResult = [];
    this.connState_.bufferingProxyResult = false;

    // TODO(user): merge states with background channel test
    // requestStats.setTimeout(goog.bind(this.connectTest_, this, testPath), 0);
    //     this.connectChannel_();
  }

  this.connectTest_(testPath);
};


/**
 * Disconnects and closes the channel.
 */
WebChannelBase.prototype.disconnect = function() {
  this.channelDebug_.debug('disconnect()');

  this.cancelRequests_();

  if (this.state_ == WebChannelBase.State.OPENED) {
    var rid = this.nextRid_++;
    var uri = this.forwardChannelUri_.clone();
    uri.setParameterValue('SID', this.sid_);
    uri.setParameterValue('RID', rid);
    uri.setParameterValue('TYPE', 'terminate');

    // Add the reconnect parameters.
    this.addAdditionalParams_(uri);

    var request = ChannelRequest.createChannelRequest(
        this, this.channelDebug_, this.sid_, rid);
    request.sendCloseRequest(uri);
  }

  this.onClose_();
};


/**
 * Returns the session id of the channel. Only available after the
 * channel has been opened.
 * @return {string} Session ID.
 */
WebChannelBase.prototype.getSessionId = function() {
  return this.sid_;
};


/**
 * Starts the test channel to determine network conditions.
 *
 * @param {string} testPath  The relative PATH for the test connection.
 * @private
 */
WebChannelBase.prototype.connectTest_ = function(testPath) {
  this.channelDebug_.debug('connectTest_()');
  if (!this.okToMakeRequest_()) {
    return;  // channel is cancelled
  }
  this.connectionTest_ = new BaseTestChannel(this, this.channelDebug_);

  if (this.httpHeadersOverwriteParam_ === null) {
    this.connectionTest_.setExtraHeaders(this.extraHeaders_);
  }

  var urlPath = testPath;
  if (this.httpHeadersOverwriteParam_ && this.extraHeaders_) {
    urlPath = httpCors.setHttpHeadersWithOverwriteParam(
        testPath, this.httpHeadersOverwriteParam_, this.extraHeaders_);
  }

  this.connectionTest_.connect(/** @type {string} */ (urlPath));
};


/**
 * Starts the regular channel which is run after the test channel is complete.
 * @private
 */
WebChannelBase.prototype.connectChannel_ = function() {
  this.channelDebug_.debug('connectChannel_()');
  this.ensureInState_(WebChannelBase.State.INIT, WebChannelBase.State.CLOSED);
  this.forwardChannelUri_ =
      this.getForwardChannelUri(/** @type {string} */ (this.path_));
  this.ensureForwardChannel_();
};


/**
 * Cancels all outstanding requests.
 * @private
 */
WebChannelBase.prototype.cancelRequests_ = function() {
  if (this.connectionTest_) {
    this.connectionTest_.abort();
    this.connectionTest_ = null;
  }

  if (this.backChannelRequest_) {
    this.backChannelRequest_.cancel();
    this.backChannelRequest_ = null;
  }

  if (this.backChannelTimerId_) {
    goog.global.clearTimeout(this.backChannelTimerId_);
    this.backChannelTimerId_ = null;
  }

  this.clearDeadBackchannelTimer_();

  this.forwardChannelRequestPool_.cancel();

  if (this.forwardChannelTimerId_) {
    this.clearForwardChannelTimer_();
  }
};


/**
 * Clears the forward channel timer.
 * @private
 */
WebChannelBase.prototype.clearForwardChannelTimer_ = function() {
  if (typeof this.forwardChannelTimerId_ === 'number') {
    goog.global.clearTimeout(this.forwardChannelTimerId_);
  }

  this.forwardChannelTimerId_ = null;
};


/**
 * Returns the extra HTTP headers to add to all the requests sent to the server.
 *
 * @return {Object} The HTTP headers, or null.
 */
WebChannelBase.prototype.getExtraHeaders = function() {
  return this.extraHeaders_;
};


/**
 * Sets extra HTTP headers to add to all the requests sent to the server.
 *
 * @param {Object} extraHeaders The HTTP headers, or null.
 */
WebChannelBase.prototype.setExtraHeaders = function(extraHeaders) {
  this.extraHeaders_ = extraHeaders;
};


/**
 * Returns the extra HTTP headers to add to the init requests
 * sent to the server.
 *
 * @return {Object} The HTTP headers, or null.
 */
WebChannelBase.prototype.getInitHeaders = function() {
  return this.initHeaders_;
};


/**
 * Sets extra HTTP headers to add to the init requests sent to the server.
 *
 * @param {Object} initHeaders The HTTP headers, or null.
 */
WebChannelBase.prototype.setInitHeaders = function(initHeaders) {
  this.initHeaders_ = initHeaders;
};


/**
 * Sets the URL param name to overwrite custom HTTP headers.
 *
 * @param {string} httpHeadersOverwriteParam The URL param name.
 */
WebChannelBase.prototype.setHttpHeadersOverwriteParam = function(
    httpHeadersOverwriteParam) {
  this.httpHeadersOverwriteParam_ = httpHeadersOverwriteParam;
};


/**
 * @override
 */
WebChannelBase.prototype.setHttpSessionIdParam = function(httpSessionIdParam) {
  this.httpSessionIdParam_ = httpSessionIdParam;
};


/**
 * @override
 */
WebChannelBase.prototype.getHttpSessionIdParam = function() {
  return this.httpSessionIdParam_;
};


/**
 * @override
 */
WebChannelBase.prototype.setHttpSessionId = function(httpSessionId) {
  this.httpSessionId_ = httpSessionId;
};


/**
 * @override
 */
WebChannelBase.prototype.getHttpSessionId = function() {
  return this.httpSessionId_;
};


/**
 * @override
 */
WebChannelBase.prototype.getBackgroundChannelTest = function() {
  return this.backgroundChannelTest_;
};


/**
 * Sets the throttle for handling onreadystatechange events for the request.
 *
 * @param {number} throttle The throttle in ms.  A value of zero indicates
 *     no throttle.
 */
WebChannelBase.prototype.setReadyStateChangeThrottle = function(throttle) {
  this.readyStateChangeThrottleMs_ = throttle;
};


/**
 * Sets whether cross origin requests are supported for the channel.
 *
 * Setting this allows the creation of requests to secondary domains and
 * sends XHRs with the CORS withCredentials bit set to true.
 *
 * In order for cross-origin requests to work, the server will also need to set
 * CORS response headers as per:
 * https://developer.mozilla.org/en-US/docs/HTTP_access_control
 *
 * See {@link goog.net.XhrIo#setWithCredentials}.
 * @param {boolean} supportCrossDomain Whether cross domain XHRs are supported.
 */
WebChannelBase.prototype.setSupportsCrossDomainXhrs = function(
    supportCrossDomain) {
  this.supportsCrossDomainXhrs_ = supportCrossDomain;
};


/**
 * Returns the handler used for channel callback events.
 *
 * @return {WebChannelBase.Handler} The handler.
 */
WebChannelBase.prototype.getHandler = function() {
  return this.handler_;
};


/**
 * Sets the handler used for channel callback events.
 * @param {WebChannelBase.Handler} handler The handler to set.
 */
WebChannelBase.prototype.setHandler = function(handler) {
  this.handler_ = handler;
};


/**
 * Returns whether the channel allows the use of a subdomain. There may be
 * cases where this isn't allowed.
 * @return {boolean} Whether a host prefix is allowed.
 */
WebChannelBase.prototype.getAllowHostPrefix = function() {
  return this.allowHostPrefix_;
};


/**
 * Sets whether the channel allows the use of a subdomain. There may be cases
 * where this isn't allowed, for example, logging in with troutboard where
 * using a subdomain causes Apache to force the user to authenticate twice.
 * @param {boolean} allowHostPrefix Whether a host prefix is allowed.
 */
WebChannelBase.prototype.setAllowHostPrefix = function(allowHostPrefix) {
  this.allowHostPrefix_ = allowHostPrefix;
};


/**
 * Returns whether the channel is buffered or not. This state is valid for
 * querying only after the test connection has completed. This may be
 * queried in the WebChannelBase.okToMakeRequest() callback.
 * A channel may be buffered if the test connection determines that
 * a chunked response could not be sent down within a suitable time.
 * @return {boolean} Whether the channel is buffered.
 */
WebChannelBase.prototype.isBuffered = function() {
  return !this.useChunked_;
};


/**
 * Returns whether chunked mode is allowed. In certain debugging situations,
 * it's useful for the application to have a way to disable chunked mode for a
 * user.

 * @return {boolean} Whether chunked mode is allowed.
 */
WebChannelBase.prototype.getAllowChunkedMode = function() {
  return this.allowChunkedMode_;
};


/**
 * Sets whether chunked mode is allowed. In certain debugging situations, it's
 * useful for the application to have a way to disable chunked mode for a user.
 * @param {boolean} allowChunkedMode  Whether chunked mode is allowed.
 */
WebChannelBase.prototype.setAllowChunkedMode = function(allowChunkedMode) {
  this.allowChunkedMode_ = allowChunkedMode;
};


/**
 * Sends a request to the server. The format of the request is a Map data
 * structure of key/value pairs. These maps are then encoded in a format
 * suitable for the wire and then reconstituted as a Map data structure that
 * the server can process.
 * @param {!Object|!goog.structs.Map} map The map to send.
 * @param {!Object=} opt_context The context associated with the map.
 */
WebChannelBase.prototype.sendMap = function(map, opt_context) {
  goog.asserts.assert(
      this.state_ != WebChannelBase.State.CLOSED,
      'Invalid operation: sending map when state is closed');

  // We can only send 1000 maps per POST, but typically we should never have
  // that much to send, so warn if we exceed that (we still send all the maps).
  if (this.outgoingMaps_.length == WebChannelBase.MAX_MAPS_PER_REQUEST_) {
    // severe() is temporary so that we get these uploaded and can figure out
    // what's causing them. Afterwards can change to warning().
    this.channelDebug_.severe(function() {
      return 'Already have ' + WebChannelBase.MAX_MAPS_PER_REQUEST_ +
          ' queued maps upon queueing ' + goog.json.serialize(map);
    });
  }

  this.outgoingMaps_.push(
      new Wire.QueuedMap(this.nextMapId_++, map, opt_context));

  // Messages need be buffered during OPENING to avoid server-side race
  if (this.state_ == WebChannelBase.State.OPENED) {
    this.ensureForwardChannel_();
  }
};


/**
 * When set to true, this changes the behavior of the forward channel so it
 * will not retry requests; it will fail after one network failure, and if
 * there was already one network failure, the request will fail immediately.
 * @param {boolean} failFast  Whether or not to fail fast.
 */
WebChannelBase.prototype.setFailFast = function(failFast) {
  this.failFast_ = failFast;
  this.channelDebug_.info('setFailFast: ' + failFast);
  if ((this.forwardChannelRequestPool_.hasPendingRequest() ||
       this.forwardChannelTimerId_) &&
      this.forwardChannelRetryCount_ > this.getForwardChannelMaxRetries()) {
    var self = this;
    this.channelDebug_.info(function() {
      return 'Retry count ' + self.forwardChannelRetryCount_ +
          ' > new maxRetries ' + self.getForwardChannelMaxRetries() +
          '. Fail immediately!';
    });

    if (!this.forwardChannelRequestPool_.forceComplete(
            goog.bind(this.onRequestComplete, this))) {
      // i.e., this.forwardChannelTimerId_
      this.clearForwardChannelTimer_();
      // The error code from the last failed request is gone, so just use a
      // generic one.
      this.signalError_(WebChannelBase.Error.REQUEST_FAILED);
    }
  }
};


/**
 * @return {number} The max number of forward-channel retries, which will be 0
 * in fail-fast mode.
 */
WebChannelBase.prototype.getForwardChannelMaxRetries = function() {
  return this.failFast_ ? 0 : this.forwardChannelMaxRetries_;
};


/**
 * Sets the maximum number of attempts to connect to the server for forward
 * channel requests.
 * @param {number} retries The maximum number of attempts.
 */
WebChannelBase.prototype.setForwardChannelMaxRetries = function(retries) {
  this.forwardChannelMaxRetries_ = retries;
};


/**
 * Sets the timeout for a forward channel request.
 * @param {number} timeoutMs The timeout in milliseconds.
 */
WebChannelBase.prototype.setForwardChannelRequestTimeout = function(timeoutMs) {
  this.forwardChannelRequestTimeoutMs_ = timeoutMs;
};


/**
 * @return {number} The max number of back-channel retries, which is a constant.
 */
WebChannelBase.prototype.getBackChannelMaxRetries = function() {
  // Back-channel retries is a constant.
  return WebChannelBase.BACK_CHANNEL_MAX_RETRIES;
};


/**
 * @override
 */
WebChannelBase.prototype.isClosed = function() {
  return this.state_ == WebChannelBase.State.CLOSED;
};


/**
 * Returns the channel state.
 * @return {WebChannelBase.State} The current state of the channel.
 */
WebChannelBase.prototype.getState = function() {
  return this.state_;
};


/**
 * Return the last status code received for a request.
 * @return {number} The last status code received for a request.
 */
WebChannelBase.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};


/**
 * @return {number} The last array id received.
 */
WebChannelBase.prototype.getLastArrayId = function() {
  return this.lastArrayId_;
};


/**
 * Returns whether there are outstanding requests servicing the channel.
 * @return {boolean} true if there are outstanding requests.
 */
WebChannelBase.prototype.hasOutstandingRequests = function() {
  return this.getOutstandingRequests_() != 0;
};


/**
 * Returns the number of outstanding requests.
 * @return {number} The number of outstanding requests to the server.
 * @private
 */
WebChannelBase.prototype.getOutstandingRequests_ = function() {
  var count = 0;
  if (this.backChannelRequest_) {
    count++;
  }
  count += this.forwardChannelRequestPool_.getRequestCount();
  return count;
};


/**
 * Ensures that a forward channel request is scheduled.
 * @private
 */
WebChannelBase.prototype.ensureForwardChannel_ = function() {
  if (this.forwardChannelRequestPool_.isFull()) {
    // enough connection in process - no need to start a new request
    return;
  }

  if (this.forwardChannelTimerId_) {
    // no need to start a new request - one is already scheduled
    return;
  }

  // Use async.run instead of setTimeout(0) to avoid the 1s message delay
  // from chrome/firefox background tabs
  this.forwardChannelTimerId_ = true;
  goog.async.run(this.onStartForwardChannelTimer_, this);

  this.forwardChannelRetryCount_ = 0;
};


/**
 * Schedules a forward-channel retry for the specified request, unless the max
 * retries has been reached.
 * @param {!ChannelRequest} request The failed request to retry.
 * @return {boolean} true iff a retry was scheduled.
 * @private
 */
WebChannelBase.prototype.maybeRetryForwardChannel_ = function(request) {
  if (this.forwardChannelRequestPool_.getRequestCount() >=
      this.forwardChannelRequestPool_.getMaxSize() -
          (this.forwardChannelTimerId_ ? 1 : 0)) {
    // Should be impossible to be called in this state.
    this.channelDebug_.severe('Unexpected retry request is scheduled.');
    return false;
  }

  if (this.forwardChannelTimerId_) {
    this.channelDebug_.debug(
        'Use the retry request that is already scheduled.');
    this.outgoingMaps_ =
        request.getPendingMessages().concat(this.outgoingMaps_);
    return true;
  }

  // No retry for open_() and fail-fast
  if (this.state_ == WebChannelBase.State.INIT ||
      this.state_ == WebChannelBase.State.OPENING ||
      (this.forwardChannelRetryCount_ >= this.getForwardChannelMaxRetries())) {
    return false;
  }

  this.channelDebug_.debug('Going to retry POST');

  this.forwardChannelTimerId_ = requestStats.setTimeout(
      goog.bind(this.onStartForwardChannelTimer_, this, request),
      this.getRetryTime_(this.forwardChannelRetryCount_));
  this.forwardChannelRetryCount_++;
  return true;
};


/**
 * Timer callback for ensureForwardChannel
 * @param {ChannelRequest=} opt_retryRequest A failed request
 * to retry.
 * @private
 */
WebChannelBase.prototype.onStartForwardChannelTimer_ = function(
    opt_retryRequest) {
  // null is possible if scheduled with async.run
  if (this.forwardChannelTimerId_) {
    this.forwardChannelTimerId_ = null;
    this.startForwardChannel_(opt_retryRequest);
  }
};


/**
 * Begins a new forward channel operation to the server.
 * @param {ChannelRequest=} opt_retryRequest A failed request to retry.
 * @private
 */
WebChannelBase.prototype.startForwardChannel_ = function(opt_retryRequest) {
  this.channelDebug_.debug('startForwardChannel_');
  if (!this.okToMakeRequest_()) {
    return;  // channel is cancelled
  } else if (this.state_ == WebChannelBase.State.INIT) {
    if (opt_retryRequest) {
      this.channelDebug_.severe('Not supposed to retry the open');
      return;
    }
    this.open_();
    this.state_ = WebChannelBase.State.OPENING;
  } else if (this.state_ == WebChannelBase.State.OPENED) {
    if (opt_retryRequest) {
      this.makeForwardChannelRequest_(opt_retryRequest);
      return;
    }

    if (this.outgoingMaps_.length == 0) {
      this.channelDebug_.debug(
          'startForwardChannel_ returned: ' +
          'nothing to send');
      // no need to start a new forward channel request
      return;
    }

    if (this.forwardChannelRequestPool_.isFull()) {
      // Should be impossible to be called in this state.
      this.channelDebug_.severe(
          'startForwardChannel_ returned: ' +
          'connection already in progress');
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
WebChannelBase.prototype.open_ = function() {
  this.channelDebug_.debug('open_()');
  this.nextRid_ = Math.floor(Math.random() * 100000);

  var rid = this.nextRid_++;
  var request =
      ChannelRequest.createChannelRequest(this, this.channelDebug_, '', rid);

  // mix the init headers
  var extraHeaders = this.extraHeaders_;
  if (this.initHeaders_) {
    if (extraHeaders) {
      extraHeaders = goog.object.clone(extraHeaders);
      goog.object.extend(extraHeaders, this.initHeaders_);
    } else {
      extraHeaders = this.initHeaders_;
    }
  }

  if (this.httpHeadersOverwriteParam_ === null) {
    request.setExtraHeaders(extraHeaders);
  }

  var requestText = this.dequeueOutgoingMaps_(
      request,
      this.fastHandshake_ ? this.getMaxNumMessagesForFastHandshake_() :
                            WebChannelBase.MAX_MAPS_PER_REQUEST_);

  var uri = this.forwardChannelUri_.clone();
  uri.setParameterValue('RID', rid);

  if (this.clientVersion_ > 0) {
    uri.setParameterValue('CVER', this.clientVersion_);
  }

  // http-session-id to be generated as the response
  if (this.getBackgroundChannelTest() && this.getHttpSessionIdParam()) {
    uri.setParameterValue(
        WebChannel.X_HTTP_SESSION_ID, this.getHttpSessionIdParam());
  }

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  if (this.httpHeadersOverwriteParam_ && extraHeaders) {
    httpCors.setHttpHeadersWithOverwriteParam(
        uri, this.httpHeadersOverwriteParam_, extraHeaders);
  }

  this.forwardChannelRequestPool_.addRequest(request);

  // Check the option and use GET to enable QUIC 0-RTT
  if (this.fastHandshake_) {
    uri.setParameterValue('$req', requestText);

    // enable handshake upgrade
    uri.setParameterValue('SID', 'null');
    request.setDecodeInitialResponse();

    request.xmlHttpPost(uri, null, true);  // Send as a GET
  } else {
    request.xmlHttpPost(uri, requestText, true);
  }
};


/**
 * @return {number} The number of raw JSON messages to be encoded
 * with the fast-handshake (GET) request, including zero. If messages are not
 * encoded as raw JSON data, return WebChannelBase.MAX_MAPS_PER_REQUEST_
 * @private
 */
WebChannelBase.prototype.getMaxNumMessagesForFastHandshake_ = function() {
  var total = 0;
  for (var i = 0; i < this.outgoingMaps_.length; i++) {
    var map = this.outgoingMaps_[i];
    var size = map.getRawDataSize();
    if (size === undefined) {
      break;
    }
    total += size;

    if (total > WebChannelBase.MAX_CHARS_PER_GET_) {
      return i;
    }

    if (total === WebChannelBase.MAX_CHARS_PER_GET_ ||
        i === this.outgoingMaps_.length - 1) {
      return i + 1;
    }
  }

  return WebChannelBase.MAX_MAPS_PER_REQUEST_;
};



/**
 * Makes a forward channel request using XMLHTTP.
 * @param {!ChannelRequest=} opt_retryRequest A failed request to retry.
 * @private
 */
WebChannelBase.prototype.makeForwardChannelRequest_ = function(
    opt_retryRequest) {
  var rid;
  if (opt_retryRequest) {
    rid = opt_retryRequest.getRequestId();  // Reuse the same RID for a retry
  } else {
    rid = this.nextRid_++;
  }

  var uri = this.forwardChannelUri_.clone();
  uri.setParameterValue('SID', this.sid_);
  uri.setParameterValue('RID', rid);
  uri.setParameterValue('AID', this.lastArrayId_);
  // Add the additional reconnect parameters.
  this.addAdditionalParams_(uri);

  if (this.httpHeadersOverwriteParam_ && this.extraHeaders_) {
    httpCors.setHttpHeadersWithOverwriteParam(
        uri, this.httpHeadersOverwriteParam_, this.extraHeaders_);
  }

  var request = ChannelRequest.createChannelRequest(
      this, this.channelDebug_, this.sid_, rid,
      this.forwardChannelRetryCount_ + 1);

  if (this.httpHeadersOverwriteParam_ === null) {
    request.setExtraHeaders(this.extraHeaders_);
  }

  var requestText;
  if (opt_retryRequest) {
    this.requeuePendingMaps_(opt_retryRequest);
  }
  requestText =
      this.dequeueOutgoingMaps_(request, WebChannelBase.MAX_MAPS_PER_REQUEST_);

  // Randomize from 50%-100% of the forward channel timeout to avoid
  // a big hit if servers happen to die at once.
  request.setTimeout(
      Math.round(this.forwardChannelRequestTimeoutMs_ * 0.50) +
      Math.round(this.forwardChannelRequestTimeoutMs_ * 0.50 * Math.random()));
  this.forwardChannelRequestPool_.addRequest(request);
  request.xmlHttpPost(uri, requestText, true);
};


/**
 * Adds the additional parameters from the handler to the given URI.
 * @param {!goog.Uri} uri The URI to add the parameters to.
 * @private
 */
WebChannelBase.prototype.addAdditionalParams_ = function(uri) {
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
 * @param {!ChannelRequest} request The new request for sending the messages.
 * @param {number} maxNum The maximum number of messages to be encoded
 * @return {string} The encoded request text created from all the currently
 *                  queued outgoing maps.
 * @private
 */
WebChannelBase.prototype.dequeueOutgoingMaps_ = function(request, maxNum) {
  var count = Math.min(this.outgoingMaps_.length, maxNum);

  var badMapHandler = this.handler_ ?
      goog.bind(this.handler_.badMapError, this.handler_, this) :
      null;
  var result = this.wireCodec_.encodeMessageQueue(
      this.outgoingMaps_, count, badMapHandler);

  request.setPendingMessages(this.outgoingMaps_.splice(0, count));

  return result;
};


/**
 * Requeues unacknowledged sent arrays for retransmission in the next forward
 * channel request.
 * @param {!ChannelRequest} retryRequest A failed request to retry.
 * @private
 */
WebChannelBase.prototype.requeuePendingMaps_ = function(retryRequest) {
  this.outgoingMaps_ =
      retryRequest.getPendingMessages().concat(this.outgoingMaps_);
};


/**
 * Ensures there is a backchannel request for receiving data from the server.
 * @private
 */
WebChannelBase.prototype.ensureBackChannel_ = function() {
  if (this.backChannelRequest_) {
    // already have one
    return;
  }

  if (this.backChannelTimerId_) {
    // no need to start a new request - one is already scheduled
    return;
  }

  this.backChannelAttemptId_ = 1;

  // Use async.run instead of setTimeout(0) to avoid the 1s message delay
  // from chrome/firefox background tabs
  // backChannelTimerId_ stays unset, as with setTimeout(0)
  goog.async.run(this.onStartBackChannelTimer_, this);

  this.backChannelRetryCount_ = 0;
};


/**
 * Schedules a back-channel retry, unless the max retries has been reached.
 * @return {boolean} true iff a retry was scheduled.
 * @private
 */
WebChannelBase.prototype.maybeRetryBackChannel_ = function() {
  if (this.backChannelRequest_ || this.backChannelTimerId_) {
    // Should be impossible to be called in this state.
    this.channelDebug_.severe('Request already in progress');
    return false;
  }

  if (this.backChannelRetryCount_ >= this.getBackChannelMaxRetries()) {
    return false;
  }

  this.channelDebug_.debug('Going to retry GET');

  this.backChannelAttemptId_++;
  this.backChannelTimerId_ = requestStats.setTimeout(
      goog.bind(this.onStartBackChannelTimer_, this),
      this.getRetryTime_(this.backChannelRetryCount_));
  this.backChannelRetryCount_++;
  return true;
};


/**
 * Timer callback for ensureBackChannel_.
 * @private
 */
WebChannelBase.prototype.onStartBackChannelTimer_ = function() {
  this.backChannelTimerId_ = null;
  this.startBackChannel_();
};


/**
 * Begins a new back channel operation to the server.
 * @private
 */
WebChannelBase.prototype.startBackChannel_ = function() {
  if (!this.okToMakeRequest_()) {
    // channel is cancelled
    return;
  }

  this.channelDebug_.debug('Creating new HttpRequest');
  this.backChannelRequest_ = ChannelRequest.createChannelRequest(
      this, this.channelDebug_, this.sid_, 'rpc', this.backChannelAttemptId_);

  if (this.httpHeadersOverwriteParam_ === null) {
    this.backChannelRequest_.setExtraHeaders(this.extraHeaders_);
  }

  this.backChannelRequest_.setReadyStateChangeThrottle(
      this.readyStateChangeThrottleMs_);
  var uri = this.backChannelUri_.clone();
  uri.setParameterValue('RID', 'rpc');
  uri.setParameterValue('SID', this.sid_);
  uri.setParameterValue('CI', this.useChunked_ ? '0' : '1');
  uri.setParameterValue('AID', this.lastArrayId_);

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  uri.setParameterValue('TYPE', 'xmlhttp');

  if (this.httpHeadersOverwriteParam_ && this.extraHeaders_) {
    httpCors.setHttpHeadersWithOverwriteParam(
        uri, this.httpHeadersOverwriteParam_, this.extraHeaders_);
  }

  if (this.backChannelRequestTimeoutMs_) {
    this.backChannelRequest_.setTimeout(this.backChannelRequestTimeoutMs_);
  }

  this.backChannelRequest_.xmlHttpGet(
      uri, true /* decodeChunks */, this.hostPrefix_);

  this.channelDebug_.debug('New Request created');
};


/**
 * Gives the handler a chance to return an error code and stop channel
 * execution. A handler might want to do this to check that the user is still
 * logged in, for example.
 * @private
 * @return {boolean} If it's OK to make a request.
 */
WebChannelBase.prototype.okToMakeRequest_ = function() {
  if (this.handler_) {
    var result = this.handler_.okToMakeRequest(this);
    if (result != WebChannelBase.Error.OK) {
      this.channelDebug_.debug(
          'Handler returned error code from okToMakeRequest');
      this.signalError_(result);
      return false;
    }
  }
  return true;
};


/**
 * @override
 */
WebChannelBase.prototype.testConnectionFinished = function(
    testChannel, useChunked) {
  this.channelDebug_.debug('Test Connection Finished');

  // Forward channel will not be used prior to this method is called
  var clientProtocol = testChannel.getClientProtocol();
  if (clientProtocol) {
    this.forwardChannelRequestPool_.applyClientProtocol(clientProtocol);
  }

  this.useChunked_ = this.allowChunkedMode_ && useChunked;
  this.lastStatusCode_ = testChannel.getLastStatusCode();

  this.connectChannel_();
};


/**
 * @override
 */
WebChannelBase.prototype.testConnectionFailure = function(
    testChannel, errorCode) {
  this.channelDebug_.debug('Test Connection Failed');
  this.lastStatusCode_ = testChannel.getLastStatusCode();
  this.signalError_(WebChannelBase.Error.REQUEST_FAILED);
};


/**
 * @override
 */
WebChannelBase.prototype.onRequestData = function(request, responseText) {
  if (this.state_ == WebChannelBase.State.CLOSED ||
      (this.backChannelRequest_ != request &&
       !this.forwardChannelRequestPool_.hasRequest(request))) {
    // either CLOSED or a request we don't know about (perhaps an old request)
    return;
  }
  this.lastStatusCode_ = request.getLastStatusCode();

  // first to check if request has been upgraded to backchannel
  if (!request.isInitialResponseDecoded() &&
      this.forwardChannelRequestPool_.hasRequest(request) &&
      this.state_ == WebChannelBase.State.OPENED) {
    var response;
    try {
      response = this.wireCodec_.decodeMessage(responseText);
    } catch (ex) {
      response = null;
    }
    if (goog.isArray(response) && response.length == 3) {
      this.handlePostResponse_(/** @type {!Array<?>} */ (response), request);
      this.onForwardChannelFlushed_();
    } else {
      this.channelDebug_.debug('Bad POST response data returned');
      this.signalError_(WebChannelBase.Error.BAD_RESPONSE);
    }
  } else {
    if (request.isInitialResponseDecoded() ||
        this.backChannelRequest_ == request) {
      this.clearDeadBackchannelTimer_();
    }
    if (!goog.string.isEmptyOrWhitespace(responseText)) {
      var response = this.wireCodec_.decodeMessage(responseText);
      this.onInput_(/** @type {!Array<?>} */ (response), request);
    }
  }
};


/**
 * Checks if we need call the flush callback.
 *
 * @private
 */
WebChannelBase.prototype.onForwardChannelFlushed_ = function() {
  if (this.forwardChannelRequestPool_.getRequestCount() <= 1) {
    if (this.forwardChannelFlushedCallback_) {
      try {
        this.forwardChannelFlushedCallback_();
      } catch (ex) {
        this.channelDebug_.dumpException(
            ex, 'Exception from forwardChannelFlushedCallback_ ');
      }
      // reset
      this.forwardChannelFlushedCallback_ = undefined;
    }
  }
};


/**
 * Handles a POST response from the server.
 * @param {Array<number>} responseValues The key value pairs in
 *     the POST response.
 * @param {!ChannelRequest} forwardReq The forward channel request that
 * triggers this function call.
 * @private
 */
WebChannelBase.prototype.handlePostResponse_ = function(
    responseValues, forwardReq) {
  // The first response value is set to 0 if server is missing backchannel.
  if (responseValues[0] == 0) {
    this.handleBackchannelMissing_(forwardReq);
    return;
  }
  this.lastPostResponseArrayId_ = responseValues[1];
  var outstandingArrays = this.lastPostResponseArrayId_ - this.lastArrayId_;
  if (0 < outstandingArrays) {
    var numOutstandingBackchannelBytes = responseValues[2];
    this.channelDebug_.debug(
        numOutstandingBackchannelBytes + ' bytes (in ' + outstandingArrays +
        ' arrays) are outstanding on the BackChannel');
    if (!this.shouldRetryBackChannel_(numOutstandingBackchannelBytes)) {
      return;
    }
    if (!this.deadBackChannelTimerId_) {
      // We expect to receive data within 2 RTTs or we retry the backchannel.
      this.deadBackChannelTimerId_ = requestStats.setTimeout(
          goog.bind(this.onBackChannelDead_, this),
          2 * WebChannelBase.RTT_ESTIMATE);
    }
  }
};


/**
 * Handles a POST response from the server telling us that it has detected that
 * we have no hanging GET connection.
 * @param {!ChannelRequest} forwardReq The forward channel request that
 * triggers this function call.
 * @private
 */
WebChannelBase.prototype.handleBackchannelMissing_ = function(forwardReq) {
  // As long as the back channel was started before the POST was sent,
  // we should retry the backchannel. We give a slight buffer of RTT_ESTIMATE
  // so as not to excessively retry the backchannel
  this.channelDebug_.debug('Server claims our backchannel is missing.');
  if (this.backChannelTimerId_) {
    this.channelDebug_.debug('But we are currently starting the request.');
    return;
  } else if (!this.backChannelRequest_) {
    this.channelDebug_.warning('We do not have a BackChannel established');
  } else if (
      this.backChannelRequest_.getRequestStartTime() +
          WebChannelBase.RTT_ESTIMATE <
      forwardReq.getRequestStartTime()) {
    this.clearDeadBackchannelTimer_();
    this.backChannelRequest_.cancel();
    this.backChannelRequest_ = null;
  } else {
    return;
  }
  this.maybeRetryBackChannel_();
  requestStats.notifyStatEvent(requestStats.Stat.BACKCHANNEL_MISSING);
};


/**
 * Determines whether we should start the process of retrying a possibly
 * dead backchannel.
 * @param {number} outstandingBytes The number of bytes for which the server has
 *     not yet received acknowledgement.
 * @return {boolean} Whether to start the backchannel retry timer.
 * @private
 */
WebChannelBase.prototype.shouldRetryBackChannel_ = function(outstandingBytes) {
  // Not too many outstanding bytes, not buffered and not after a retry.
  return outstandingBytes <
      WebChannelBase.OUTSTANDING_DATA_BACKCHANNEL_RETRY_CUTOFF &&
      !this.isBuffered() && this.backChannelRetryCount_ == 0;
};


/**
 * Decides which host prefix should be used, if any.  If there is a handler,
 * allows the handler to validate a host prefix provided by the server, and
 * optionally override it.
 * @param {?string} serverHostPrefix The host prefix provided by the server.
 * @return {?string} The host prefix to actually use, if any. Will return null
 *     if the use of host prefixes was disabled via setAllowHostPrefix().
 * @override
 */
WebChannelBase.prototype.correctHostPrefix = function(serverHostPrefix) {
  if (this.allowHostPrefix_) {
    if (this.handler_) {
      return this.handler_.correctHostPrefix(serverHostPrefix);
    }
    return serverHostPrefix;
  }
  return null;
};


/**
 * Handles the timer that indicates that our backchannel is no longer able to
 * successfully receive data from the server.
 * @private
 */
WebChannelBase.prototype.onBackChannelDead_ = function() {
  if (this.deadBackChannelTimerId_ != null) {
    this.deadBackChannelTimerId_ = null;
    this.backChannelRequest_.cancel();
    this.backChannelRequest_ = null;
    this.maybeRetryBackChannel_();
    requestStats.notifyStatEvent(requestStats.Stat.BACKCHANNEL_DEAD);
  }
};


/**
 * Clears the timer that indicates that our backchannel is no longer able to
 * successfully receive data from the server.
 * @private
 */
WebChannelBase.prototype.clearDeadBackchannelTimer_ = function() {
  if (this.deadBackChannelTimerId_ != null) {
    goog.global.clearTimeout(this.deadBackChannelTimerId_);
    this.deadBackChannelTimerId_ = null;
  }
};


/**
 * Returns whether or not the given error/status combination is fatal or not.
 * On fatal errors we immediately close the session rather than retrying the
 * failed request.
 * @param {?ChannelRequest.Error} error The error code for the
 * failed request.
 * @param {number} statusCode The last HTTP status code.
 * @return {boolean} Whether or not the error is fatal.
 * @private
 */
WebChannelBase.isFatalError_ = function(error, statusCode) {
  return error == ChannelRequest.Error.UNKNOWN_SESSION_ID ||
      (error == ChannelRequest.Error.STATUS && statusCode > 0);
};


/**
 * @override
 */
WebChannelBase.prototype.onRequestComplete = function(request) {
  this.channelDebug_.debug('Request complete');
  var type;
  var pendingMessages = null;
  if (this.backChannelRequest_ == request) {
    this.clearDeadBackchannelTimer_();
    this.backChannelRequest_ = null;
    type = WebChannelBase.ChannelType_.BACK_CHANNEL;
  } else if (this.forwardChannelRequestPool_.hasRequest(request)) {
    pendingMessages = request.getPendingMessages();
    this.forwardChannelRequestPool_.removeRequest(request);
    type = WebChannelBase.ChannelType_.FORWARD_CHANNEL;
  } else {
    // return if it was an old request from a previous session
    return;
  }

  this.lastStatusCode_ = request.getLastStatusCode();

  if (this.state_ == WebChannelBase.State.CLOSED) {
    return;
  }

  if (request.getSuccess()) {
    // Yay!
    if (type == WebChannelBase.ChannelType_.FORWARD_CHANNEL) {
      var size = request.getPostData() ? request.getPostData().length : 0;
      requestStats.notifyTimingEvent(
          size, goog.now() - request.getRequestStartTime(),
          this.forwardChannelRetryCount_);
      this.ensureForwardChannel_();
      this.onSuccess_(request);
    } else {  // i.e., back-channel
      this.ensureBackChannel_();
    }
    return;
  }
  // Else unsuccessful. Fall through.

  var lastError = request.getLastError();
  if (!WebChannelBase.isFatalError_(lastError, this.lastStatusCode_)) {
    // Maybe retry.
    var self = this;
    this.channelDebug_.debug(function() {
      return 'Maybe retrying, last error: ' +
          ChannelRequest.errorStringFromCode(lastError, self.lastStatusCode_);
    });
    if (type == WebChannelBase.ChannelType_.FORWARD_CHANNEL) {
      if (this.maybeRetryForwardChannel_(request)) {
        return;
      }
    }
    if (type == WebChannelBase.ChannelType_.BACK_CHANNEL) {
      if (this.maybeRetryBackChannel_()) {
        return;
      }
    }
    // Else exceeded max retries. Fall through.
    this.channelDebug_.debug('Exceeded max number of retries');
  } else {
    // Else fatal error. Fall through and mark the pending maps as failed.
    this.channelDebug_.debug('Not retrying due to error type');
  }


  // Abort the channel now

  // Record pending messages from the failed request
  if (pendingMessages && pendingMessages.length > 0) {
    this.forwardChannelRequestPool_.addPendingMessages(pendingMessages);
  }

  this.channelDebug_.debug('Error: HTTP request failed');
  switch (lastError) {
    case ChannelRequest.Error.NO_DATA:
      this.signalError_(WebChannelBase.Error.NO_DATA);
      break;
    case ChannelRequest.Error.BAD_DATA:
      this.signalError_(WebChannelBase.Error.BAD_DATA);
      break;
    case ChannelRequest.Error.UNKNOWN_SESSION_ID:
      this.signalError_(WebChannelBase.Error.UNKNOWN_SESSION_ID);
      break;
    default:
      this.signalError_(WebChannelBase.Error.REQUEST_FAILED);
      break;
  }
};


/**
 * @param {number} retryCount Number of retries so far.
 * @return {number} Time in ms before firing next retry request.
 * @private
 */
WebChannelBase.prototype.getRetryTime_ = function(retryCount) {
  var retryTime = this.baseRetryDelayMs_ +
      Math.floor(Math.random() * this.retryDelaySeedMs_);
  if (!this.isActive()) {
    this.channelDebug_.debug('Inactive channel');
    retryTime = retryTime * WebChannelBase.INACTIVE_CHANNEL_RETRY_FACTOR;
  }
  // Backoff for subsequent retries
  retryTime *= retryCount;
  return retryTime;
};


/**
 * @param {number} baseDelayMs The base part of the retry delay, in ms.
 * @param {number} delaySeedMs A random delay between 0 and this is added to
 *     the base part.
 */
WebChannelBase.prototype.setRetryDelay = function(baseDelayMs, delaySeedMs) {
  this.baseRetryDelayMs_ = baseDelayMs;
  this.retryDelaySeedMs_ = delaySeedMs;
};


/**
 * Apply any handshake control headers.
 * @param {!ChannelRequest} request The underlying request object
 * @private
 */
WebChannelBase.prototype.applyControlHeaders_ = function(request) {
  if (!this.backgroundChannelTest_) {
    return;
  }

  var xhr = request.getXhr();
  if (xhr) {
    var clientProtocol =
        xhr.getStreamingResponseHeader(WebChannel.X_CLIENT_WIRE_PROTOCOL);
    if (clientProtocol) {
      this.forwardChannelRequestPool_.applyClientProtocol(clientProtocol);
    }

    if (this.getHttpSessionIdParam()) {
      var httpSessionIdHeader =
          xhr.getStreamingResponseHeader(WebChannel.X_HTTP_SESSION_ID);
      if (httpSessionIdHeader) {
        this.setHttpSessionId(httpSessionIdHeader);
        // update the cached uri
        var httpSessionIdParam = this.getHttpSessionIdParam();

        this.forwardChannelUri_.setParameterValue(
            /** @type {string} */ (httpSessionIdParam),  // never null
            httpSessionIdHeader);
      } else {
        this.channelDebug_.warning(
            'Missing X_HTTP_SESSION_ID in the handshake response');
      }
    }
  }
};


/**
 * Processes the data returned by the server.
 * @param {!Array<!Array<?>>} respArray The response array returned
 *     by the server.
 * @param {!ChannelRequest} request The underlying request object
 * @private
 */
WebChannelBase.prototype.onInput_ = function(respArray, request) {
  var batch =
      this.handler_ && this.handler_.channelHandleMultipleArrays ? [] : null;
  for (var i = 0; i < respArray.length; i++) {
    var nextArray = respArray[i];
    this.lastArrayId_ = nextArray[0];
    nextArray = nextArray[1];
    if (this.state_ == WebChannelBase.State.OPENING) {
      if (nextArray[0] == 'c') {
        this.sid_ = nextArray[1];
        this.hostPrefix_ = this.correctHostPrefix(nextArray[2]);

        var negotiatedVersion = nextArray[3];
        if (negotiatedVersion != null) {
          this.channelVersion_ = negotiatedVersion;
          this.channelDebug_.info('VER=' + this.channelVersion_);
        }

        var negotiatedServerVersion = nextArray[4];
        if (negotiatedServerVersion != null) {
          this.serverVersion_ = negotiatedServerVersion;
          this.channelDebug_.info('SVER=' + this.serverVersion_);
        }

        // CVER=22
        var serverKeepaliveMs = nextArray[5];
        if (serverKeepaliveMs != null &&
            typeof serverKeepaliveMs === 'number' && serverKeepaliveMs > 0) {
          var timeout = 1.5 * serverKeepaliveMs;
          this.backChannelRequestTimeoutMs_ = timeout;
          this.channelDebug_.info('backChannelRequestTimeoutMs_=' + timeout);
        }

        this.applyControlHeaders_(request);

        this.state_ = WebChannelBase.State.OPENED;
        if (this.handler_) {
          this.handler_.channelOpened(this);
        }

        this.startBackchannelAfterHandshake_(request);

        if (this.outgoingMaps_.length > 0) {
          this.ensureForwardChannel_();
        }
      } else if (nextArray[0] == 'stop' || nextArray[0] == 'close') {
        // treat close also as an abort
        this.signalError_(WebChannelBase.Error.STOP);
      }
    } else if (this.state_ == WebChannelBase.State.OPENED) {
      if (nextArray[0] == 'stop' || nextArray[0] == 'close') {
        if (batch && !goog.array.isEmpty(batch)) {
          this.handler_.channelHandleMultipleArrays(this, batch);
          batch.length = 0;
        }
        if (nextArray[0] == 'stop') {
          this.signalError_(WebChannelBase.Error.STOP);
        } else {
          this.disconnect();
        }
      } else if (nextArray[0] == 'noop') {
        // ignore - noop to keep connection happy
      } else {
        if (batch) {
          batch.push(nextArray);
        } else if (this.handler_) {
          this.handler_.channelHandleArray(this, nextArray);
        }
      }
      // We have received useful data on the back-channel, so clear its retry
      // count. We do this because back-channels by design do not complete
      // quickly, so on a flaky connection we could have many fail to complete
      // fully but still deliver a lot of data before they fail. We don't want
      // to count such failures towards the retry limit, because we don't want
      // to give up on a session if we can still receive data.
      this.backChannelRetryCount_ = 0;
    }
  }
  if (batch && !goog.array.isEmpty(batch)) {
    this.handler_.channelHandleMultipleArrays(this, batch);
  }
};


/**
 * Starts the backchannel after the handshake.
 *
 * @param {!ChannelRequest} request The underlying request object
 * @private
 */
WebChannelBase.prototype.startBackchannelAfterHandshake_ = function(request) {
  this.backChannelUri_ = this.getBackChannelUri(
      this.hostPrefix_, /** @type {string} */ (this.path_));

  if (request.isInitialResponseDecoded()) {
    this.channelDebug_.debug('Upgrade the handshake request to a backchannel.');
    this.forwardChannelRequestPool_.removeRequest(request);
    request.resetTimeout(this.backChannelRequestTimeoutMs_);
    this.backChannelRequest_ = request;
  } else {
    // Open connection to receive data
    this.ensureBackChannel_();
  }
};


/**
 * Helper to ensure the channel is in the expected state.
 * @param {...number} var_args The channel must be in one of the indicated
 *     states.
 * @private
 */
WebChannelBase.prototype.ensureInState_ = function(var_args) {
  goog.asserts.assert(
      goog.array.contains(arguments, this.state_),
      'Unexpected channel state: %s', this.state_);
};


/**
 * Signals an error has occurred.
 * @param {WebChannelBase.Error} error The error code for the failure.
 * @private
 */
WebChannelBase.prototype.signalError_ = function(error) {
  this.channelDebug_.info('Error code ' + error);
  if (error == WebChannelBase.Error.REQUEST_FAILED) {
    // Create a separate Internet connection to check
    // if it's a server error or user's network error.
    var imageUri = null;
    if (this.handler_) {
      imageUri = this.handler_.getNetworkTestImageUri(this);
    }
    netUtils.testNetwork(goog.bind(this.testNetworkCallback_, this), imageUri);
  } else {
    requestStats.notifyStatEvent(requestStats.Stat.ERROR_OTHER);
  }
  this.onError_(error);
};


/**
 * Callback for netUtils.testNetwork during error handling.
 * @param {boolean} networkUp Whether the network is up.
 * @private
 */
WebChannelBase.prototype.testNetworkCallback_ = function(networkUp) {
  if (networkUp) {
    this.channelDebug_.info('Successfully pinged google.com');
    requestStats.notifyStatEvent(requestStats.Stat.ERROR_OTHER);
  } else {
    this.channelDebug_.info('Failed to ping google.com');
    requestStats.notifyStatEvent(requestStats.Stat.ERROR_NETWORK);
    // Do not call onError_ again to eliminate duplicated Error events.
  }
};


/**
 * Called when messages have been successfully sent from the queue.
 * @param {!ChannelRequest} request The request object
 * @private
 */
WebChannelBase.prototype.onSuccess_ = function(request) {
  if (this.handler_) {
    this.handler_.channelSuccess(this, request);
  }
};


/**
 * Called when we've determined the final error for a channel. It closes the
 * notifiers the handler of the error and closes the channel.
 * @param {WebChannelBase.Error} error  The error code for the failure.
 * @private
 */
WebChannelBase.prototype.onError_ = function(error) {
  this.channelDebug_.debug('HttpChannel: error - ' + error);
  this.state_ = WebChannelBase.State.CLOSED;
  if (this.handler_) {
    this.handler_.channelError(this, error);
  }
  this.onClose_();
  this.cancelRequests_();
};


/**
 * Called when the channel has been closed. It notifiers the handler of the
 * event, and reports any pending or undelivered maps.
 * @private
 */
WebChannelBase.prototype.onClose_ = function() {
  this.state_ = WebChannelBase.State.CLOSED;
  this.lastStatusCode_ = -1;
  if (this.handler_) {
    var pendingMessages = this.forwardChannelRequestPool_.getPendingMessages();

    if (pendingMessages.length == 0 && this.outgoingMaps_.length == 0) {
      this.handler_.channelClosed(this);
    } else {
      var self = this;
      this.channelDebug_.debug(function() {
        return 'Number of undelivered maps' +
            ', pending: ' + pendingMessages.length +
            ', outgoing: ' + self.outgoingMaps_.length;
      });

      this.forwardChannelRequestPool_.clearPendingMessages();

      var copyOfUndeliveredMaps = goog.array.clone(this.outgoingMaps_);
      this.outgoingMaps_.length = 0;

      this.handler_.channelClosed(this, pendingMessages, copyOfUndeliveredMaps);
    }
  }
};


/**
 * @override
 */
WebChannelBase.prototype.getForwardChannelUri = function(path) {
  var uri = this.createDataUri(null, path);
  this.channelDebug_.debug('GetForwardChannelUri: ' + uri);
  return uri;
};


/**
 * @override
 */
WebChannelBase.prototype.getConnectionState = function() {
  return this.connState_;
};


/**
 * @override
 */
WebChannelBase.prototype.getBackChannelUri = function(hostPrefix, path) {
  var uri = this.createDataUri(
      this.shouldUseSecondaryDomains() ? hostPrefix : null, path);
  this.channelDebug_.debug('GetBackChannelUri: ' + uri);
  return uri;
};


/**
 * @override
 */
WebChannelBase.prototype.createDataUri = function(
    hostPrefix, path, opt_overridePort) {
  var uri = goog.Uri.parse(path);
  var uriAbsolute = (uri.getDomain() != '');
  if (uriAbsolute) {
    if (hostPrefix) {
      uri.setDomain(hostPrefix + '.' + uri.getDomain());
    }

    uri.setPort(opt_overridePort || uri.getPort());
  } else {
    var locationPage = goog.global.location;
    var hostName;
    if (hostPrefix) {
      hostName = hostPrefix + '.' + locationPage.hostname;
    } else {
      hostName = locationPage.hostname;
    }

    var port = opt_overridePort || +locationPage.port;

    uri = goog.Uri.create(locationPage.protocol, null, hostName, port, path);
  }

  if (this.extraParams_) {
    goog.object.forEach(this.extraParams_, function(value, key) {
      uri.setParameterValue(key, value);
    });
  }

  var param = this.getHttpSessionIdParam();
  var value = this.getHttpSessionId();
  if (param && value) {
    uri.setParameterValue(param, value);
  }

  // Add the protocol version to the URI.
  uri.setParameterValue('VER', this.channelVersion_);

  // Add the reconnect parameters.
  this.addAdditionalParams_(uri);

  return uri;
};


/**
 * @override
 */
WebChannelBase.prototype.createXhrIo = function(hostPrefix) {
  if (hostPrefix && !this.supportsCrossDomainXhrs_) {
    throw new Error('Can\'t create secondary domain capable XhrIo object.');
  }
  var xhr = new goog.net.XhrIo(this.xmlHttpFactory_);
  xhr.setWithCredentials(this.supportsCrossDomainXhrs_);
  return xhr;
};


/**
 * @override
 */
WebChannelBase.prototype.isActive = function() {
  return !!this.handler_ && this.handler_.isActive(this);
};


/**
 * @override
 */
WebChannelBase.prototype.shouldUseSecondaryDomains = function() {
  return this.supportsCrossDomainXhrs_;
};


/**
 * Sets (overwrites) the forward channel flush callback.
 *
 * @param {function()} callback The callback to be invoked.
 */
WebChannelBase.prototype.setForwardChannelFlushCallback = function(callback) {
  this.forwardChannelFlushedCallback_ = callback;
};


/**
 * Abstract base class for the channel handler
 * @constructor
 * @struct
 */
WebChannelBase.Handler = function() {};


/**
 * Callback handler for when a batch of response arrays is received from the
 * server. When null, batched dispatching is disabled.
 * @type {?function(!WebChannelBase, !Array<!Array<?>>)}
 */
WebChannelBase.Handler.prototype.channelHandleMultipleArrays = null;


/**
 * Whether it's okay to make a request to the server. A handler can return
 * false if the channel should fail. For example, if the user has logged out,
 * the handler may want all requests to fail immediately.
 * @param {WebChannelBase} channel The channel.
 * @return {WebChannelBase.Error} An error code. The code should
 * return WebChannelBase.Error.OK to indicate it's okay. Any other
 * error code will cause a failure.
 */
WebChannelBase.Handler.prototype.okToMakeRequest = function(channel) {
  return WebChannelBase.Error.OK;
};


/**
 * Indicates the WebChannel has successfully negotiated with the server
 * and can now send and receive data.
 * @param {WebChannelBase} channel The channel.
 */
WebChannelBase.Handler.prototype.channelOpened = function(channel) {};


/**
 * New input is available for the application to process.
 *
 * @param {WebChannelBase} channel The channel.
 * @param {Array<?>} array The data array.
 */
WebChannelBase.Handler.prototype.channelHandleArray = function(
    channel, array) {};


/**
 * Indicates messages that have been successfully sent on the channel.
 *
 * @param {WebChannelBase} channel The channel.
 * @param {!ChannelRequest} request The request object that contains
 *     the pending messages that have been successfully delivered to the server.
 */
WebChannelBase.Handler.prototype.channelSuccess = function(channel, request) {};


/**
 * Indicates an error occurred on the WebChannel.
 *
 * @param {WebChannelBase} channel The channel.
 * @param {WebChannelBase.Error} error The error code.
 */
WebChannelBase.Handler.prototype.channelError = function(channel, error) {};


/**
 * Indicates the WebChannel is closed. Also notifies about which maps,
 * if any, that may not have been delivered to the server.
 * @param {WebChannelBase} channel The channel.
 * @param {Array<Wire.QueuedMap>=} opt_pendingMaps The
 *     array of pending maps, which may or may not have been delivered to the
 *     server.
 * @param {Array<Wire.QueuedMap>=} opt_undeliveredMaps
 *     The array of undelivered maps, which have definitely not been delivered
 *     to the server.
 */
WebChannelBase.Handler.prototype.channelClosed = function(
    channel, opt_pendingMaps, opt_undeliveredMaps) {};


/**
 * Gets any parameters that should be added at the time another connection is
 * made to the server.
 * @param {WebChannelBase} channel The channel.
 * @return {!Object} Extra parameter keys and values to add to the requests.
 */
WebChannelBase.Handler.prototype.getAdditionalParams = function(channel) {
  return {};
};


/**
 * Gets the URI of an image that can be used to test network connectivity.
 * @param {WebChannelBase} channel The channel.
 * @return {goog.Uri?} A custom URI to load for the network test.
 */
WebChannelBase.Handler.prototype.getNetworkTestImageUri = function(channel) {
  return null;
};


/**
 * Gets whether this channel is currently active. This is used to determine the
 * length of time to wait before retrying.
 * @param {WebChannelBase} channel The channel.
 * @return {boolean} Whether the channel is currently active.
 */
WebChannelBase.Handler.prototype.isActive = function(channel) {
  return true;
};


/**
 * Called by the channel if enumeration of the map throws an exception.
 * @param {WebChannelBase} channel The channel.
 * @param {Object} map The map that can't be enumerated.
 */
WebChannelBase.Handler.prototype.badMapError = function(channel, map) {};


/**
 * Allows the handler to override a host prefix provided by the server. Will
 * be called whenever the channel has received such a prefix and is considering
 * its use.
 * @param {?string} serverHostPrefix The host prefix provided by the server.
 * @return {?string} The host prefix the client should use.
 */
WebChannelBase.Handler.prototype.correctHostPrefix = function(
    serverHostPrefix) {
  return serverHostPrefix;
};
});  // goog.scope
