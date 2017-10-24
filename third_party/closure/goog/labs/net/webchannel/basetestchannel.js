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
 * @fileoverview Base TestChannel implementation.
 *
 */


goog.provide('goog.labs.net.webChannel.BaseTestChannel');

goog.require('goog.labs.net.webChannel.Channel');
goog.require('goog.labs.net.webChannel.ChannelRequest');
goog.require('goog.labs.net.webChannel.WebChannelDebug');
goog.require('goog.labs.net.webChannel.requestStats');
goog.require('goog.labs.net.webChannel.requestStats.Stat');
goog.require('goog.net.WebChannel');



/**
 * A TestChannel is used during the first part of channel negotiation
 * with the server to create the channel. It helps us determine whether we're
 * behind a buffering proxy.
 *
 * @constructor
 * @struct
 * @param {!goog.labs.net.webChannel.Channel} channel The channel
 *     that owns this test channel.
 * @param {!goog.labs.net.webChannel.WebChannelDebug} channelDebug A
 *     WebChannelDebug instance to use for logging.
 * @implements {goog.labs.net.webChannel.Channel}
 */
goog.labs.net.webChannel.BaseTestChannel = function(channel, channelDebug) {
  /**
   * The channel that owns this test channel
   * @private {!goog.labs.net.webChannel.Channel}
   */
  this.channel_ = channel;

  /**
   * The channel debug to use for logging
   * @private {!goog.labs.net.webChannel.WebChannelDebug}
   */
  this.channelDebug_ = channelDebug;

  /**
   * Extra HTTP headers to add to all the requests sent to the server.
   * @private {Object}
   */
  this.extraHeaders_ = null;

  /**
   * The test request.
   * @private {goog.labs.net.webChannel.ChannelRequest}
   */
  this.request_ = null;

  /**
   * Whether we have received the first result as an intermediate result. This
   * helps us determine whether we're behind a buffering proxy.
   * @private {boolean}
   */
  this.receivedIntermediateResult_ = false;

  /**
   * The relative path for test requests.
   * @private {?string}
   */
  this.path_ = null;

  /**
   * The last status code received.
   * @private {number}
   */
  this.lastStatusCode_ = -1;

  /**
   * A subdomain prefix for using a subdomain in IE for the backchannel
   * requests.
   * @private {?string}
   */
  this.hostPrefix_ = null;

  /**
   * The effective client protocol as indicated by the initial handshake
   * response via the x-client-wire-protocol header.
   *
   * @private {?string}
   */
  this.clientProtocol_ = null;
};


goog.scope(function() {
var WebChannel = goog.net.WebChannel;
var BaseTestChannel = goog.labs.net.webChannel.BaseTestChannel;
var WebChannelDebug = goog.labs.net.webChannel.WebChannelDebug;
var ChannelRequest = goog.labs.net.webChannel.ChannelRequest;
var requestStats = goog.labs.net.webChannel.requestStats;
var Channel = goog.labs.net.webChannel.Channel;


/**
 * Enum type for the test channel state machine
 * @enum {number}
 * @private
 */
BaseTestChannel.State_ = {
  /**
   * The state for the TestChannel state machine where we making the
   * initial call to get the server configured parameters.
   */
  INIT: 0,

  /**
   * The  state for the TestChannel state machine where we're checking to
   * se if we're behind a buffering proxy.
   */
  CONNECTION_TESTING: 1
};


/**
 * The state of the state machine for this object.
 *
 * @private {?BaseTestChannel.State_}
 */
BaseTestChannel.prototype.state_ = null;


/**
 * Sets extra HTTP headers to add to all the requests sent to the server.
 *
 * @param {Object} extraHeaders The HTTP headers.
 */
BaseTestChannel.prototype.setExtraHeaders = function(extraHeaders) {
  this.extraHeaders_ = extraHeaders;
};


/**
 * Starts the test channel. This initiates connections to the server.
 *
 * @param {string} path The relative uri for the test connection.
 */
BaseTestChannel.prototype.connect = function(path) {
  this.path_ = path;
  var sendDataUri = this.channel_.getForwardChannelUri(this.path_);

  requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_ONE_START);

  // If the channel already has the result of the handshake, then skip it.
  var handshakeResult = this.channel_.getConnectionState().handshakeResult;
  if (goog.isDefAndNotNull(handshakeResult)) {
    this.hostPrefix_ = this.channel_.correctHostPrefix(handshakeResult[0]);
    this.state_ = BaseTestChannel.State_.CONNECTION_TESTING;
    this.checkBufferingProxy_();
    return;
  }

  // the first request returns server specific parameters
  sendDataUri.setParameterValues('MODE', 'init');

  // http-session-id to be generated as the response
  if (!this.channel_.getBackgroundChannelTest() &&
      this.channel_.getHttpSessionIdParam()) {
    sendDataUri.setParameterValues(WebChannel.X_HTTP_SESSION_ID,
        this.channel_.getHttpSessionIdParam());
  }

  this.request_ = ChannelRequest.createChannelRequest(this, this.channelDebug_);

  this.request_.setExtraHeaders(this.extraHeaders_);

  this.request_.xmlHttpGet(
      sendDataUri, false /* decodeChunks */, null /* hostPrefix */,
      true /* opt_noClose */);
  this.state_ = BaseTestChannel.State_.INIT;
};


/**
 * Begins the second stage of the test channel where we test to see if we're
 * behind a buffering proxy. The server sends back a multi-chunked response
 * with the first chunk containing the content '1' and then two seconds later
 * sending the second chunk containing the content '2'. Depending on how we
 * receive the content, we can tell if we're behind a buffering proxy.
 * @private
 */
BaseTestChannel.prototype.checkBufferingProxy_ = function() {
  this.channelDebug_.debug('TestConnection: starting stage 2');

  // If the test result is already available, skip its execution.
  var bufferingProxyResult =
      this.channel_.getConnectionState().bufferingProxyResult;
  if (goog.isDefAndNotNull(bufferingProxyResult)) {
    this.channelDebug_.debug(
        'TestConnection: skipping stage 2, precomputed result is ' +
                bufferingProxyResult ?
            'Buffered' :
            'Unbuffered');
    requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_TWO_START);
    if (bufferingProxyResult) {  // Buffered/Proxy connection
      requestStats.notifyStatEvent(requestStats.Stat.PROXY);
      this.channel_.testConnectionFinished(this, false);
    } else {  // Unbuffered/NoProxy connection
      requestStats.notifyStatEvent(requestStats.Stat.NOPROXY);
      this.channel_.testConnectionFinished(this, true);
    }
    return;  // Skip the test
  }
  this.request_ = ChannelRequest.createChannelRequest(this, this.channelDebug_);
  this.request_.setExtraHeaders(this.extraHeaders_);
  var recvDataUri = this.channel_.getBackChannelUri(
      this.hostPrefix_,
      /** @type {string} */ (this.path_));

  requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_TWO_START);
  recvDataUri.setParameterValues('TYPE', 'xmlhttp');

  var param = this.channel_.getHttpSessionIdParam();
  var value = this.channel_.getHttpSessionId();
  if (param && value) {
    recvDataUri.setParameterValue(param, value);
  }

  this.request_.xmlHttpGet(
      recvDataUri, false /** decodeChunks */, this.hostPrefix_,
      false /** opt_noClose */);
};


/**
 * @override
 */
BaseTestChannel.prototype.createXhrIo = function(hostPrefix) {
  return this.channel_.createXhrIo(hostPrefix);
};


/**
 * Aborts the test channel.
 */
BaseTestChannel.prototype.abort = function() {
  if (this.request_) {
    this.request_.cancel();
    this.request_ = null;
  }
  this.lastStatusCode_ = -1;
};


/**
 * Returns whether the test channel is closed. The ChannelRequest object expects
 * this method to be implemented on its handler.
 *
 * @return {boolean} Whether the channel is closed.
 * @override
 */
BaseTestChannel.prototype.isClosed = function() {
  return false;
};


/**
 * Callback from ChannelRequest for when new data is received
 *
 * @param {ChannelRequest} req The request object.
 * @param {string} responseText The text of the response.
 * @override
 */
BaseTestChannel.prototype.onRequestData = function(req, responseText) {
  this.lastStatusCode_ = req.getLastStatusCode();
  if (this.state_ == BaseTestChannel.State_.INIT) {
    this.channelDebug_.debug('TestConnection: Got data for stage 1');

    this.applyControlHeaders_(req);

    if (!responseText) {
      this.channelDebug_.debug('TestConnection: Null responseText');
      // The server should always send text; something is wrong here
      this.channel_.testConnectionFailure(this, ChannelRequest.Error.BAD_DATA);
      return;
    }


    try {
      var channel = /** @type {!goog.labs.net.webChannel.WebChannelBase} */ (
          this.channel_);
      var respArray = channel.getWireCodec().decodeMessage(responseText);
    } catch (e) {
      this.channelDebug_.dumpException(e);
      this.channel_.testConnectionFailure(this, ChannelRequest.Error.BAD_DATA);
      return;
    }
    this.hostPrefix_ = this.channel_.correctHostPrefix(respArray[0]);
  } else if (this.state_ == BaseTestChannel.State_.CONNECTION_TESTING) {
    if (this.receivedIntermediateResult_) {
      requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_TWO_DATA_TWO);
    } else {
      // '11111' is used instead of '1' to prevent a small amount of buffering
      // by Safari.
      if (responseText == '11111') {
        requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_TWO_DATA_ONE);
        this.receivedIntermediateResult_ = true;
        if (this.checkForEarlyNonBuffered_()) {
          // If early chunk detection is on, and we passed the tests,
          // assume HTTP_OK, cancel the test and turn on noproxy mode.
          this.lastStatusCode_ = 200;
          this.request_.cancel();
          this.channelDebug_.debug(
              'Test connection succeeded; using streaming connection');
          requestStats.notifyStatEvent(requestStats.Stat.NOPROXY);
          this.channel_.testConnectionFinished(this, true);
        }
      } else {
        requestStats.notifyStatEvent(
            requestStats.Stat.TEST_STAGE_TWO_DATA_BOTH);
        this.receivedIntermediateResult_ = false;
      }
    }
  }
};


/**
 * Callback from ChannelRequest that indicates a request has completed.
 *
 * @param {!ChannelRequest} req The request object.
 * @override
 */
BaseTestChannel.prototype.onRequestComplete = function(req) {
  this.lastStatusCode_ = this.request_.getLastStatusCode();
  if (!this.request_.getSuccess()) {
    this.channelDebug_.debug(
        'TestConnection: request failed, in state ' + this.state_);
    if (this.state_ == BaseTestChannel.State_.INIT) {
      requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_ONE_FAILED);
    } else if (this.state_ == BaseTestChannel.State_.CONNECTION_TESTING) {
      requestStats.notifyStatEvent(requestStats.Stat.TEST_STAGE_TWO_FAILED);
    }
    this.channel_.testConnectionFailure(
        this,
        /** @type {ChannelRequest.Error} */
        (this.request_.getLastError()));
    return;
  }

  if (this.state_ == BaseTestChannel.State_.INIT) {
    this.state_ = BaseTestChannel.State_.CONNECTION_TESTING;

    this.channelDebug_.debug(
        'TestConnection: request complete for initial check');

    this.checkBufferingProxy_();
  } else if (this.state_ == BaseTestChannel.State_.CONNECTION_TESTING) {
    this.channelDebug_.debug('TestConnection: request complete for stage 2');

    var goodConn = this.receivedIntermediateResult_;
    if (goodConn) {
      this.channelDebug_.debug(
          'Test connection succeeded; using streaming connection');
      requestStats.notifyStatEvent(requestStats.Stat.NOPROXY);
      this.channel_.testConnectionFinished(this, true);
    } else {
      this.channelDebug_.debug('Test connection failed; not using streaming');
      requestStats.notifyStatEvent(requestStats.Stat.PROXY);
      this.channel_.testConnectionFinished(this, false);
    }
  }
};


/**
 * Apply any control headers from the initial handshake response.
 *
 * @param {!ChannelRequest} req The request object.
 * @private
 */
BaseTestChannel.prototype.applyControlHeaders_ = function(req) {
  if (this.channel_.getBackgroundChannelTest()) {
    return;
  }

  var xhr = req.getXhr();
  if (xhr) {
    var protocolHeader = xhr.getStreamingResponseHeader(
        WebChannel.X_CLIENT_WIRE_PROTOCOL);
    this.clientProtocol_ = protocolHeader ? protocolHeader : null;

    if (this.channel_.getHttpSessionIdParam()) {
      var httpSessionIdHeader = xhr.getStreamingResponseHeader(
          WebChannel.X_HTTP_SESSION_ID);
      if (httpSessionIdHeader) {
        this.channel_.setHttpSessionId(httpSessionIdHeader);
      } else {
        this.channelDebug_.warning(
            'Missing X_HTTP_SESSION_ID in the handshake response');
      }
    }
  }
};


/**
 * @return {?string} The client protocol as recorded with the init handshake
 *     request.
 */
BaseTestChannel.prototype.getClientProtocol = function() {
  return this.clientProtocol_;
};


/**
 * Returns the last status code received for a request.
 * @return {number} The last status code received for a request.
 */
BaseTestChannel.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};


/**
 * @return {boolean} Whether we should be using secondary domains when the
 *     server instructs us to do so.
 * @override
 */
BaseTestChannel.prototype.shouldUseSecondaryDomains = function() {
  return this.channel_.shouldUseSecondaryDomains();
};


/**
 * @override
 */
BaseTestChannel.prototype.isActive = function() {
  return this.channel_.isActive();
};


/**
 * @return {boolean} True if test stage 2 detected a non-buffered
 *     channel early and early no buffering detection is enabled.
 * @private
 */
BaseTestChannel.prototype.checkForEarlyNonBuffered_ = function() {
  return ChannelRequest.supportsXhrStreaming();
};


/**
 * @override
 */
BaseTestChannel.prototype.getForwardChannelUri = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.getBackChannelUri = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.correctHostPrefix = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.createDataUri = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.testConnectionFinished = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.testConnectionFailure = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.getConnectionState = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.setHttpSessionIdParam = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.getHttpSessionIdParam = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.setHttpSessionId = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.getHttpSessionId = goog.abstractMethod;


/**
 * @override
 */
BaseTestChannel.prototype.getBackgroundChannelTest = goog.abstractMethod;
});  // goog.scope
