// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A pool of forward channel requests to enable real-time
 * messaging from the client to server.
 *
 * @visibility {:internal}
 */


goog.provide('goog.labs.net.webChannel.ForwardChannelRequestPool');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs.Set');

goog.scope(function() {
// type checking only (no require)
var ChannelRequest = goog.labs.net.webChannel.ChannelRequest;



/**
 * This class represents the state of all forward channel requests.
 *
 * @param {number=} opt_maxPoolSize The maximum pool size.
 *
 * @constructor
 * @final
 */
goog.labs.net.webChannel.ForwardChannelRequestPool = function(opt_maxPoolSize) {
  /**
   * THe max pool size as configured.
   *
   * @private {number}
   */
  this.maxPoolSizeConfigured_ = opt_maxPoolSize ||
      goog.labs.net.webChannel.ForwardChannelRequestPool.MAX_POOL_SIZE_;

  /**
   * The current size limit of the request pool. This limit is meant to be
   * read-only after the channel is fully opened.
   *
   * If SPDY is enabled, set it to the max pool size, which is also
   * configurable.
   *
   * @private {number}
   */
  this.maxSize_ = ForwardChannelRequestPool.isSpdyEnabled_() ?
      this.maxPoolSizeConfigured_ :
      1;

  /**
   * The container for all the pending request objects.
   *
   * @private {goog.structs.Set<ChannelRequest>}
   */
  this.requestPool_ = null;

  if (this.maxSize_ > 1) {
    this.requestPool_ = new goog.structs.Set();
  }

  /**
   * The single request object when the pool size is limited to one.
   *
   * @private {ChannelRequest}
   */
  this.request_ = null;
};

var ForwardChannelRequestPool =
    goog.labs.net.webChannel.ForwardChannelRequestPool;


/**
 * The default size limit of the request pool.
 *
 * @private {number}
 */
ForwardChannelRequestPool.MAX_POOL_SIZE_ = 10;


/**
 * @return {boolean} True if SPDY is enabled for the current page using
 *     chrome specific APIs.
 * @private
 */
ForwardChannelRequestPool.isSpdyEnabled_ = function() {
  return !!(
      goog.global.chrome && goog.global.chrome.loadTimes &&
      goog.global.chrome.loadTimes() &&
      goog.global.chrome.loadTimes().wasFetchedViaSpdy);
};


/**
 * Once we know the client protocol (from the handshake), check if we need
 * enable the request pool accordingly. This is more robust than using
 * browser-internal APIs (specific to Chrome).
 *
 * @param {string} clientProtocol The client protocol
 */
ForwardChannelRequestPool.prototype.applyClientProtocol = function(
    clientProtocol) {
  if (this.requestPool_) {
    return;
  }

  if (goog.string.contains(clientProtocol, 'spdy') ||
      goog.string.contains(clientProtocol, 'quic')) {
    this.maxSize_ = this.maxPoolSizeConfigured_;
    this.requestPool_ = new goog.structs.Set();
    if (this.request_) {
      this.addRequest(this.request_);
      this.request_ = null;
    }
  }
};


/**
 * @return {boolean} True if the pool is full.
 */
ForwardChannelRequestPool.prototype.isFull = function() {
  if (this.request_) {
    return true;
  }

  if (this.requestPool_) {
    return this.requestPool_.getCount() >= this.maxSize_;
  }

  return false;
};


/**
 * @return {number} The current size limit.
 */
ForwardChannelRequestPool.prototype.getMaxSize = function() {
  return this.maxSize_;
};


/**
 * @return {number} The number of pending requests in the pool.
 */
ForwardChannelRequestPool.prototype.getRequestCount = function() {
  if (this.request_) {
    return 1;
  }

  if (this.requestPool_) {
    return this.requestPool_.getCount();
  }

  return 0;
};


/**
 * @param {ChannelRequest} req The channel request.
 * @return {boolean} True if the request is a included inside the pool.
 */
ForwardChannelRequestPool.prototype.hasRequest = function(req) {
  if (this.request_) {
    return this.request_ == req;
  }

  if (this.requestPool_) {
    return this.requestPool_.contains(req);
  }

  return false;
};


/**
 * Adds a new request to the pool.
 *
 * @param {!ChannelRequest} req The new channel request.
 */
ForwardChannelRequestPool.prototype.addRequest = function(req) {
  if (this.requestPool_) {
    this.requestPool_.add(req);
  } else {
    this.request_ = req;
  }
};


/**
 * Removes the given request from the pool.
 *
 * @param {ChannelRequest} req The channel request.
 * @return {boolean} Whether the request has been removed from the pool.
 */
ForwardChannelRequestPool.prototype.removeRequest = function(req) {
  if (this.request_ && this.request_ == req) {
    this.request_ = null;
    return true;
  }

  if (this.requestPool_ && this.requestPool_.contains(req)) {
    this.requestPool_.remove(req);
    return true;
  }

  return false;
};


/**
 * Clears the pool and cancel all the pending requests.
 */
ForwardChannelRequestPool.prototype.cancel = function() {
  if (this.request_) {
    this.request_.cancel();
    this.request_ = null;
    return;
  }

  if (this.requestPool_ && !this.requestPool_.isEmpty()) {
    goog.array.forEach(
        this.requestPool_.getValues(), function(val) { val.cancel(); });
    this.requestPool_.clear();
  }
};


/**
 * @return {boolean} Whether there are any pending requests.
 */
ForwardChannelRequestPool.prototype.hasPendingRequest = function() {
  return (this.request_ != null) ||
      (this.requestPool_ != null && !this.requestPool_.isEmpty());
};


/**
 * Cancels all pending requests and force the completion of channel requests.
 *
 * Need go through the standard onRequestComplete logic to expose the max-retry
 * failure in the standard way.
 *
 * @param {!function(!ChannelRequest)} onComplete The completion callback.
 * @return {boolean} true if any request has been forced to complete.
 */
ForwardChannelRequestPool.prototype.forceComplete = function(onComplete) {
  if (this.request_ != null) {
    this.request_.cancel();
    onComplete(this.request_);
    return true;
  }

  if (this.requestPool_ && !this.requestPool_.isEmpty()) {
    goog.array.forEach(this.requestPool_.getValues(), function(val) {
      val.cancel();
      onComplete(val);
    });
    return true;
  }

  return false;
};
});  // goog.scope
