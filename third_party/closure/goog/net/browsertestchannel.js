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
 * @fileoverview Definition of the BrowserTestChannel class.  A
 * BrowserTestChannel is used during the first part of channel negotiation
 * with the server to create the channel. It helps us determine whether we're
 * behind a buffering proxy. It also runs the logic to see if the channel
 * has been blocked by a network administrator. This class is part of the
 * BrowserChannel implementation and is not for use by normal application code.
 *
 */


/**
 * Namespace for BrowserChannel
 */
goog.provide('goog.net.BrowserTestChannel');

goog.require('goog.json');
goog.require('goog.net.ChannelRequest.Error');
goog.require('goog.net.tmpnetwork');
goog.require('goog.userAgent');



/**
 * Encapsulates the logic for a single BrowserTestChannel.
 *
 * @constructor
 * @param {goog.net.BrowserChannel} channel  The BrowserChannel that owns this
 *     test channel.
 * @param {goog.net.ChannelDebug} channelDebug A ChannelDebug to use for
 *     logging.
 */
goog.net.BrowserTestChannel = function(channel, channelDebug) {
  /**
   * The BrowserChannel that owns this test channel
   * @type {goog.net.BrowserChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The channel debug to use for logging
   * @type {goog.net.ChannelDebug}
   * @private
   */
  this.channelDebug_ = channelDebug;
};


/**
 * Extra HTTP headers to add to all the requests sent to the server.
 * @type {Object}
 * @private
 */
goog.net.BrowserTestChannel.prototype.extraHeaders_ = null;


/**
 * The test request.
 * @type {goog.net.ChannelRequest}
 * @private
 */
goog.net.BrowserTestChannel.prototype.request_ = null;


/**
 * Whether we have received the first result as an intermediate result. This
 * helps us determine whether we're behind a buffering proxy.
 * @type {boolean}
 * @private
 */
goog.net.BrowserTestChannel.prototype.receivedIntermediateResult_ = false;


/**
 * The time when the test request was started. We use timing in IE as
 * a heuristic for whether we're behind a buffering proxy.
 * @type {?number}
 * @private
 */
goog.net.BrowserTestChannel.prototype.startTime_ = null;


/**
 * The time for of the first result part. We use timing in IE as a
 * heuristic for whether we're behind a buffering proxy.
 * @type {?number}
 * @private
 */
goog.net.BrowserTestChannel.prototype.firstTime_ = null;


/**
 * The time for of the last result part. We use timing in IE as a
 * heuristic for whether we're behind a buffering proxy.
 * @type {?number}
 * @private
 */
goog.net.BrowserTestChannel.prototype.lastTime_ = null;


/**
 * The relative path for test requests.
 * @type {?string}
 * @private
 */
goog.net.BrowserTestChannel.prototype.path_ = null;


/**
 * The state of the state machine for this object.
 *
 * @type {?number}
 * @private
 */
goog.net.BrowserTestChannel.prototype.state_ = null;


/**
 * The last status code received.
 * @type {number}
 * @private
 */
goog.net.BrowserTestChannel.prototype.lastStatusCode_ = -1;


/**
 * A subdomain prefix for using a subdomain in IE for the backchannel
 * requests.
 * @type {?string}
 * @private
 */
goog.net.BrowserTestChannel.prototype.hostPrefix_ = null;


/**
 * A subdomain prefix for testing whether the channel was disabled by
 * a network administrator;
 * @type {?string}
 * @private
 */
goog.net.BrowserTestChannel.prototype.blockedPrefix_ = null;


/**
 * Enum type for the browser test channel state machine
 * @enum {number}
 * @private
 */
goog.net.BrowserTestChannel.State_ = {
  /**
   * The state for the BrowserTestChannel state machine where we making the
   * initial call to get the server configured parameters.
   */
  INIT: 0,

  /**
   * The state for the BrowserTestChannel state machine where we're checking to
   * see if the channel has been blocked.
   */
  CHECKING_BLOCKED: 1,

  /**
   * The  state for the BrowserTestChannel state machine where we're checking to
   * se if we're behind a buffering proxy.
   */
  CONNECTION_TESTING: 2
};


/**
 * Time in MS for waiting for the request to see if the channel is blocked.
 * If the response takes longer than this many ms, we assume the request has
 * failed.
 * @type {number}
 * @private
 */
goog.net.BrowserTestChannel.BLOCKED_TIMEOUT_ = 5000;


/**
 * Number of attempts to try to see if the check to see if we're blocked
 * succeeds. Sometimes the request can fail because of flaky network conditions
 * and checking multiple times reduces false positives.
 * @type {number}
 * @private
 */
goog.net.BrowserTestChannel.BLOCKED_RETRIES_ = 3;


/**
 * Time in ms between retries of the blocked request
 * @type {number}
 * @private
 */
goog.net.BrowserTestChannel.BLOCKED_PAUSE_BETWEEN_RETRIES_ = 2000;


/**
 * Time between chunks in the test connection that indicates that we
 * are not behind a buffering proxy. This value should be less than or
 * equals to the time between chunks sent from the server.
 * @type {number}
 * @private
 */
goog.net.BrowserTestChannel.MIN_TIME_EXPECTED_BETWEEN_DATA_ = 500;


/**
 * Sets extra HTTP headers to add to all the requests sent to the server.
 *
 * @param {Object} extraHeaders The HTTP headers.
 */
goog.net.BrowserTestChannel.prototype.setExtraHeaders = function(extraHeaders) {
  this.extraHeaders_ = extraHeaders;
};


/**
 * Starts the test channel. This initiates connections to the server.
 *
 * @param {string} path The relative uri for the test connection.
 */
goog.net.BrowserTestChannel.prototype.connect = function(path) {
  this.path_ = path;
  var sendDataUri = this.channel_.getForwardChannelUri(this.path_);

  goog.net.BrowserChannel.notifyStatEvent(
      goog.net.BrowserChannel.Stat.TEST_STAGE_ONE_START);

  // the first request returns server specific parameters
  sendDataUri.setParameterValues('MODE', 'init');
  this.request_ = goog.net.BrowserChannel.createChannelRequest(
      this, this.channelDebug_);
  this.request_.setExtraHeaders(this.extraHeaders_);
  this.request_.xmlHttpGet(sendDataUri, false /* decodeChunks */,
      null /* hostPrefix */, true /* opt_noClose */);
  this.state_ = goog.net.BrowserTestChannel.State_.INIT;
  this.startTime_ = goog.now();
};


/**
 * Checks to see whether the channel is blocked. This is for implementing the
 * feature that allows network administrators to block Gmail Chat. The
 * strategy to determine if we're blocked is to try to load an image off a
 * special subdomain that network administrators will block access to if they
 * are trying to block chat. For Gmail Chat, the subdomain is
 * chatenabled.mail.google.com.
 * @private
 */
goog.net.BrowserTestChannel.prototype.checkBlocked_ = function() {
  var uri = this.channel_.createDataUri(this.blockedPrefix_,
      '/mail/images/cleardot.gif');
  uri.makeUnique();
  goog.net.tmpnetwork.testLoadImageWithRetries(uri.toString(),
      goog.net.BrowserTestChannel.BLOCKED_TIMEOUT_,
      goog.bind(this.checkBlockedCallback_, this),
      goog.net.BrowserTestChannel.BLOCKED_RETRIES_,
      goog.net.BrowserTestChannel.BLOCKED_PAUSE_BETWEEN_RETRIES_);
};


/**
 * Callback for testLoadImageWithRetries to check if browser channel is
 * blocked.
 * @param {boolean} succeeded Whether the request succeeded.
 * @private
 */
goog.net.BrowserTestChannel.prototype.checkBlockedCallback_ = function(
    succeeded) {
  if (succeeded) {
    this.state_ = goog.net.BrowserTestChannel.State_.CONNECTION_TESTING;
    this.connectStage2_();
  } else {
    goog.net.BrowserChannel.notifyStatEvent(
        goog.net.BrowserChannel.Stat.CHANNEL_BLOCKED);
    this.channel_.testConnectionBlocked(this);
  }
};


/**
 * Begins the second stage of the test channel where we test to see if we're
 * behind a buffering proxy. The server sends back a multi-chunked response
 * with the first chunk containing the content '1' and then two seconds later
 * sending the second chunk containing the content '2'. Depending on how we
 * receive the content, we can tell if we're behind a buffering proxy.
 * @private
 */
goog.net.BrowserTestChannel.prototype.connectStage2_ = function() {
  this.channelDebug_.debug('TestConnection: starting stage 2');
  this.request_ = goog.net.BrowserChannel.createChannelRequest(
      this, this.channelDebug_);
  this.request_.setExtraHeaders(this.extraHeaders_);
  var recvDataUri = this.channel_.getBackChannelUri(this.hostPrefix_,
      /** @type {string} */ (this.path_));

  goog.net.BrowserChannel.notifyStatEvent(
      goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_START);
  if (goog.userAgent.IE) {
    recvDataUri.setParameterValues('TYPE', 'html');
    this.request_.tridentGet(recvDataUri, Boolean(this.hostPrefix_));
  } else {
    recvDataUri.setParameterValues('TYPE', 'xmlhttp');
    this.request_.xmlHttpGet(recvDataUri, false /** decodeChunks */,
        this.hostPrefix_, false /** opt_noClose */);
  }
};


/**
 * Factory method for XhrIo objects.
 * @param {?string} hostPrefix The host prefix, if we need an XhrIo object
 *     capable of calling a secondary domain.
 * @return {!goog.net.XhrIo} New XhrIo object.
 */
goog.net.BrowserTestChannel.prototype.createXhrIo = function(hostPrefix) {
  return this.channel_.createXhrIo(hostPrefix);
};


/**
 * Aborts the test channel.
 */
goog.net.BrowserTestChannel.prototype.abort = function() {
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
 */
goog.net.BrowserTestChannel.prototype.isClosed = function() {
  return false;
};


/**
 * Callback from ChannelRequest for when new data is received
 *
 * @param {goog.net.ChannelRequest} req  The request object.
 * @param {string} responseText The text of the response.
 */
goog.net.BrowserTestChannel.prototype.onRequestData =
    function(req, responseText) {
  this.lastStatusCode_ = req.getLastStatusCode();
  if (this.state_ == goog.net.BrowserTestChannel.State_.INIT) {
    this.channelDebug_.debug('TestConnection: Got data for stage 1');
    if (!responseText) {
      this.channelDebug_.debug('TestConnection: Null responseText');
      // The server should always send text; something is wrong here
      this.channel_.testConnectionFailure(this,
          goog.net.ChannelRequest.Error.BAD_DATA);
      return;
    }
    /** @preserveTry */
    try {
      var respArray = goog.json.unsafeParse(responseText);
    } catch (e) {
      this.channelDebug_.dumpException(e);
      this.channel_.testConnectionFailure(this,
          goog.net.ChannelRequest.Error.BAD_DATA);
      return;
    }
    this.hostPrefix_ = this.channel_.correctHostPrefix(respArray[0]);
    this.blockedPrefix_ = respArray[1];
  } else if (this.state_ ==
             goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) {
    if (this.receivedIntermediateResult_) {
      goog.net.BrowserChannel.notifyStatEvent(
          goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_TWO);
      this.lastTime_ = goog.now();
    } else {
      // '11111' is used instead of '1' to prevent a small amount of buffering
      // by Safari.
      if (responseText == '11111') {
        goog.net.BrowserChannel.notifyStatEvent(
            goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_ONE);
        this.receivedIntermediateResult_ = true;
        this.firstTime_ = goog.now();
        if (this.checkForEarlyNonBuffered_()) {
          // If early chunk detection is on, and we passed the tests,
          // assume HTTP_OK, cancel the test and turn on noproxy mode.
          this.lastStatusCode_ = 200;
          this.request_.cancel();
          this.channelDebug_.debug(
              'Test connection succeeded; using streaming connection');
          goog.net.BrowserChannel.notifyStatEvent(
              goog.net.BrowserChannel.Stat.NOPROXY);
          this.channel_.testConnectionFinished(this, true);
        }
      } else {
        goog.net.BrowserChannel.notifyStatEvent(
            goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_BOTH);
        this.firstTime_ = this.lastTime_ = goog.now();
        this.receivedIntermediateResult_ = false;
      }
    }
  }
};


/**
 * Callback from ChannelRequest that indicates a request has completed.
 *
 * @param {goog.net.ChannelRequest} req  The request object.
 */
goog.net.BrowserTestChannel.prototype.onRequestComplete =
    function(req) {
  this.lastStatusCode_ = this.request_.getLastStatusCode();
  if (!this.request_.getSuccess()) {
    this.channelDebug_.debug(
        'TestConnection: request failed, in state ' + this.state_);
    if (this.state_ == goog.net.BrowserTestChannel.State_.INIT) {
      goog.net.BrowserChannel.notifyStatEvent(
          goog.net.BrowserChannel.Stat.TEST_STAGE_ONE_FAILED);
    } else if (this.state_ ==
               goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) {
      goog.net.BrowserChannel.notifyStatEvent(
          goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_FAILED);
    }
    this.channel_.testConnectionFailure(this,
        /** @type {goog.net.ChannelRequest.Error} */
        (this.request_.getLastError()));
    return;
  }

  if (this.state_ == goog.net.BrowserTestChannel.State_.INIT) {
    this.channelDebug_.debug(
        'TestConnection: request complete for initial check');
    if (this.blockedPrefix_) {
      this.state_ = goog.net.BrowserTestChannel.State_.CHECKING_BLOCKED;
      this.checkBlocked_();
    } else {
      this.state_ = goog.net.BrowserTestChannel.State_.CONNECTION_TESTING;
      this.connectStage2_();
    }
  } else if (this.state_ ==
             goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) {
    this.channelDebug_.debug('TestConnection: request complete for stage 2');
    var goodConn = false;

    if (goog.userAgent.IE) {
      // we always get Trident responses in separate calls to
      // onRequestData, so we have to check the time they came
      var ms = this.lastTime_ - this.firstTime_;
      if (ms < 200) {
        // TODO: need to empirically verify that this number is OK
        // for slow computers
        goodConn = false;
      } else {
        goodConn = true;
      }
    } else {
      goodConn = this.receivedIntermediateResult_;
    }

    if (goodConn) {
      this.channelDebug_.debug(
          'Test connection succeeded; using streaming connection');
      goog.net.BrowserChannel.notifyStatEvent(
          goog.net.BrowserChannel.Stat.NOPROXY);
      this.channel_.testConnectionFinished(this, true);
    } else {
      this.channelDebug_.debug(
          'Test connection failed; not using streaming');
      goog.net.BrowserChannel.notifyStatEvent(
          goog.net.BrowserChannel.Stat.PROXY);
      this.channel_.testConnectionFinished(this, false);
    }
  }
};


/**
 * Returns the last status code received for a request.
 * @return {number} The last status code received for a request.
 */
goog.net.BrowserTestChannel.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};


/**
 * @return {boolean} Whether we should be using secondary domains when the
 *     server instructs us to do so.
 */
goog.net.BrowserTestChannel.prototype.shouldUseSecondaryDomains = function() {
  return this.channel_.shouldUseSecondaryDomains();
};


/**
 * Gets whether this channel is currently active. This is used to determine the
 * length of time to wait before retrying.
 *
 * @param {goog.net.BrowserChannel} browserChannel The browser channel.
 * @return {boolean} Whether the channel is currently active.
 */
goog.net.BrowserTestChannel.prototype.isActive =
    function(browserChannel) {
  return this.channel_.isActive();
};


/**
 * @return {boolean} True if test stage 2 detected a non-buffered
 *     channel early and early no buffering detection is enabled.
 * @private
 */
goog.net.BrowserTestChannel.prototype.checkForEarlyNonBuffered_ =
    function() {
  var ms = this.firstTime_ - this.startTime_;

  // we always get Trident responses in separate calls to
  // onRequestData, so we have to check the time that the first came in
  // and verify that the data arrived before the second portion could
  // have been sent. For all other browser's we skip the timing test.
  return !goog.userAgent.IE ||
      ms < goog.net.BrowserTestChannel.MIN_TIME_EXPECTED_BETWEEN_DATA_;
};
