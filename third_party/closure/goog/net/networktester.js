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
 * @fileoverview Definition of goog.net.NetworkTester.
 */

goog.provide('goog.net.NetworkTester');
goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.log');



/**
 * Creates an instance of goog.net.NetworkTester which can be used to test
 * for internet connectivity by seeing if an image can be loaded from
 * google.com. It can also be tested with other URLs.
 * @param {Function} callback Callback that is called when the test completes.
 *     The callback takes a single boolean parameter. True indicates the URL
 *     was reachable, false indicates it wasn't.
 * @param {Object=} opt_handler Handler object for the callback.
 * @param {goog.Uri=} opt_uri URI to use for testing.
 * @constructor @struct
 * @final
 */
goog.net.NetworkTester = function(callback, opt_handler, opt_uri) {
  /**
   * Callback that is called when the test completes.
   * The callback takes a single boolean parameter. True indicates the URL was
   * reachable, false indicates it wasn't.
   * @type {Function}
   * @private
   */
  this.callback_ = callback;

  /**
   * Handler object for the callback.
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;

  if (!opt_uri) {
    // set the default URI to be based on the cleardot image at google.com
    // We need to add a 'rand' to make sure the response is not fulfilled
    // by browser cache. Use protocol-relative URLs to avoid insecure content
    // warnings in IE.
    opt_uri = new goog.Uri('//www.google.com/images/cleardot.gif');
    opt_uri.makeUnique();
  }

  /**
   * Uri to use for test. Defaults to using an image off of google.com
   * @type {goog.Uri}
   * @private
   */
  this.uri_ = opt_uri;
};


/**
 * Default timeout
 * @type {number}
 */
goog.net.NetworkTester.DEFAULT_TIMEOUT_MS = 10000;


/**
 * Logger object
 * @type {goog.log.Logger}
 * @private
 */
goog.net.NetworkTester.prototype.logger_ =
    goog.log.getLogger('goog.net.NetworkTester');


/**
 * Timeout for test
 * @type {number}
 * @private
 */
goog.net.NetworkTester.prototype.timeoutMs_ =
    goog.net.NetworkTester.DEFAULT_TIMEOUT_MS;


/**
 * Whether we've already started running.
 * @type {boolean}
 * @private
 */
goog.net.NetworkTester.prototype.running_ = false;


/**
 * Number of retries to attempt
 * @type {number}
 * @private
 */
goog.net.NetworkTester.prototype.retries_ = 0;


/**
 * Attempt number we're on
 * @type {number}
 * @private
 */
goog.net.NetworkTester.prototype.attempt_ = 0;


/**
 * Pause between retries in milliseconds.
 * @type {number}
 * @private
 */
goog.net.NetworkTester.prototype.pauseBetweenRetriesMs_ = 0;


/**
 * Timer for timeouts.
 * @type {?number}
 * @private
 */
goog.net.NetworkTester.prototype.timeoutTimer_ = null;


/**
 * Timer for pauses between retries.
 * @type {?number}
 * @private
 */
goog.net.NetworkTester.prototype.pauseTimer_ = null;


/** @private {?Image} */
goog.net.NetworkTester.prototype.image_;


/**
 * Returns the timeout in milliseconds.
 * @return {number} Timeout in milliseconds.
 */
goog.net.NetworkTester.prototype.getTimeout = function() {
  return this.timeoutMs_;
};


/**
 * Sets the timeout in milliseconds.
 * @param {number} timeoutMs Timeout in milliseconds.
 */
goog.net.NetworkTester.prototype.setTimeout = function(timeoutMs) {
  this.timeoutMs_ = timeoutMs;
};


/**
 * Returns the numer of retries to attempt.
 * @return {number} Number of retries to attempt.
 */
goog.net.NetworkTester.prototype.getNumRetries = function() {
  return this.retries_;
};


/**
 * Sets the timeout in milliseconds.
 * @param {number} retries Number of retries to attempt.
 */
goog.net.NetworkTester.prototype.setNumRetries = function(retries) {
  this.retries_ = retries;
};


/**
 * Returns the pause between retries in milliseconds.
 * @return {number} Pause between retries in milliseconds.
 */
goog.net.NetworkTester.prototype.getPauseBetweenRetries = function() {
  return this.pauseBetweenRetriesMs_;
};


/**
 * Sets the pause between retries in milliseconds.
 * @param {number} pauseMs Pause between retries in milliseconds.
 */
goog.net.NetworkTester.prototype.setPauseBetweenRetries = function(pauseMs) {
  this.pauseBetweenRetriesMs_ = pauseMs;
};


/**
 * Returns the uri to use for the test.
 * @return {goog.Uri} The uri for the test.
 */
goog.net.NetworkTester.prototype.getUri = function() {
  return this.uri_;
};


/**
 * Returns the current attempt count.
 * @return {number} The attempt count.
 */
goog.net.NetworkTester.prototype.getAttemptCount = function() {
  return this.attempt_;
};


/**
 * Sets the uri to use for the test.
 * @param {goog.Uri} uri The uri for the test.
 */
goog.net.NetworkTester.prototype.setUri = function(uri) {
  this.uri_ = uri;
};


/**
 * Returns whether the tester is currently running.
 * @return {boolean} True if it's running, false if it's not running.
 */
goog.net.NetworkTester.prototype.isRunning = function() {
  return this.running_;
};


/**
 * Starts the process of testing the network.
 */
goog.net.NetworkTester.prototype.start = function() {
  if (this.running_) {
    throw Error('NetworkTester.start called when already running');
  }
  this.running_ = true;

  goog.log.info(this.logger_, 'Starting');
  this.attempt_ = 0;
  this.startNextAttempt_();
};


/**
 * Stops the testing of the network. This is a noop if not running.
 */
goog.net.NetworkTester.prototype.stop = function() {
  this.cleanupCallbacks_();
  this.running_ = false;
};


/**
 * Starts the next attempt to load an image.
 * @private
 */
goog.net.NetworkTester.prototype.startNextAttempt_ = function() {
  this.attempt_++;

  if (goog.net.NetworkTester.getNavigatorOffline_()) {
    goog.log.info(this.logger_, 'Browser is set to work offline.');
    // Call in a timeout to make async like the rest.
    goog.Timer.callOnce(goog.bind(this.onResult, this, false), 0);
  } else {
    goog.log.info(this.logger_, 'Loading image (attempt ' + this.attempt_ +
                      ') at ' + this.uri_);
    this.image_ = new Image();
    this.image_.onload = goog.bind(this.onImageLoad_, this);
    this.image_.onerror = goog.bind(this.onImageError_, this);
    this.image_.onabort = goog.bind(this.onImageAbort_, this);

    this.timeoutTimer_ = goog.Timer.callOnce(this.onImageTimeout_,
        this.timeoutMs_, this);
    this.image_.src = String(this.uri_);
  }
};


/**
 * @return {boolean} Whether navigator.onLine returns false.
 * @private
 */
goog.net.NetworkTester.getNavigatorOffline_ = function() {
  return 'onLine' in navigator && !navigator.onLine;
};


/**
 * Callback for the image successfully loading.
 * @private
 */
goog.net.NetworkTester.prototype.onImageLoad_ = function() {
  goog.log.info(this.logger_, 'Image loaded');
  this.onResult(true);
};


/**
 * Callback for the image failing to load.
 * @private
 */
goog.net.NetworkTester.prototype.onImageError_ = function() {
  goog.log.info(this.logger_, 'Image load error');
  this.onResult(false);
};


/**
 * Callback for the image load being aborted.
 * @private
 */
goog.net.NetworkTester.prototype.onImageAbort_ = function() {
  goog.log.info(this.logger_, 'Image load aborted');
  this.onResult(false);
};


/**
 * Callback for the image load timing out.
 * @private
 */
goog.net.NetworkTester.prototype.onImageTimeout_ = function() {
  goog.log.info(this.logger_, 'Image load timed out');
  this.onResult(false);
};


/**
 * Handles a successful or failed result.
 * @param {boolean} succeeded Whether the image load succeeded.
 */
goog.net.NetworkTester.prototype.onResult = function(succeeded) {
  this.cleanupCallbacks_();

  if (succeeded) {
    this.running_ = false;
    this.callback_.call(this.handler_, true);
  } else {
    if (this.attempt_ <= this.retries_) {
      if (this.pauseBetweenRetriesMs_) {
        this.pauseTimer_ = goog.Timer.callOnce(this.onPauseFinished_,
            this.pauseBetweenRetriesMs_, this);
      } else {
        this.startNextAttempt_();
      }
    } else {
      this.running_ = false;
      this.callback_.call(this.handler_, false);
    }
  }
};


/**
 * Callback for the pause between retry timer.
 * @private
 */
goog.net.NetworkTester.prototype.onPauseFinished_ = function() {
  this.pauseTimer_ = null;
  this.startNextAttempt_();
};


/**
 * Cleans up the handlers and timer associated with the image.
 * @private
 */
goog.net.NetworkTester.prototype.cleanupCallbacks_ = function() {
  // clear handlers to avoid memory leaks
  // NOTE(user): Nullified individually to avoid compiler warnings
  // (BUG 658126)
  if (this.image_) {
    this.image_.onload = null;
    this.image_.onerror = null;
    this.image_.onabort = null;
    this.image_ = null;
  }
  if (this.timeoutTimer_) {
    goog.Timer.clear(this.timeoutTimer_);
    this.timeoutTimer_ = null;
  }
  if (this.pauseTimer_) {
    goog.Timer.clear(this.pauseTimer_);
    this.pauseTimer_ = null;
  }
};
