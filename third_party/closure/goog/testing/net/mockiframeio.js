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
 * @fileoverview Mock of IframeIo for unit testing.
 */

goog.provide('goog.testing.net.MockIFrameIo');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');
goog.require('goog.testing.TestQueue');



/**
 * Mock implementation of goog.net.IframeIo. This doesn't provide a mock
 * implementation for all cases, but it's not too hard to add them as needed.
 * @param {goog.testing.TestQueue} testQueue Test queue for inserting test
 *     events.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.testing.net.MockIFrameIo = function(testQueue) {
  goog.events.EventTarget.call(this);

  /**
   * Queue of events write to
   * @type {goog.testing.TestQueue}
   * @private
   */
  this.testQueue_ = testQueue;

};
goog.inherits(goog.testing.net.MockIFrameIo, goog.events.EventTarget);


/**
 * Whether MockIFrameIo is active.
 * @type {boolean}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.active_ = false;


/**
 * Last content.
 * @type {string}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.lastContent_ = '';


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.lastErrorCode_ =
    goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {string}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.lastError_ = '';


/**
 * Last custom error.
 * @type {Object}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.lastCustomError_ = null;


/**
 * Last URI.
 * @type {goog.Uri}
 * @private
 */
goog.testing.net.MockIFrameIo.prototype.lastUri_ = null;


/** @private {Function} */
goog.testing.net.MockIFrameIo.prototype.errorChecker_;


/** @private {boolean} */
goog.testing.net.MockIFrameIo.prototype.success_;


/** @private {boolean} */
goog.testing.net.MockIFrameIo.prototype.complete_;


/**
 * Simulates the iframe send.
 *
 * @param {goog.Uri|string} uri Uri of the request.
 * @param {string=} opt_method Default is GET, POST uses a form to submit the
 *     request.
 * @param {boolean=} opt_noCache Append a timestamp to the request to avoid
 *     caching.
 * @param {Object|goog.structs.Map=} opt_data Map of key-value pairs.
 */
goog.testing.net.MockIFrameIo.prototype.send = function(
    uri, opt_method, opt_noCache, opt_data) {
  if (this.active_) {
    throw Error('[goog.net.IframeIo] Unable to send, already active.');
  }

  this.testQueue_.enqueue(['s', uri, opt_method, opt_noCache, opt_data]);
  this.complete_ = false;
  this.active_ = true;
};


/**
 * Simulates the iframe send from a form.
 * @param {Element} form Form element used to send the request to the server.
 * @param {string=} opt_uri Uri to set for the destination of the request, by
 *     default the uri will come from the form.
 * @param {boolean=} opt_noCache Append a timestamp to the request to avoid
 *     caching.
 */
goog.testing.net.MockIFrameIo.prototype.sendFromForm = function(
    form, opt_uri, opt_noCache) {
  if (this.active_) {
    throw Error('[goog.net.IframeIo] Unable to send, already active.');
  }

  this.testQueue_.enqueue(['s', form, opt_uri, opt_noCache]);
  this.complete_ = false;
  this.active_ = true;
};


/**
 * Simulates aborting the current Iframe request.
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.testing.net.MockIFrameIo.prototype.abort = function(opt_failureCode) {
  if (this.active_) {
    this.testQueue_.enqueue(['a', opt_failureCode]);
    this.complete_ = false;
    this.active_ = false;
    this.success_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.simulateReady();
  }
};


/**
 * Simulates receive of incremental data.
 * @param {Object} data Data.
 */
goog.testing.net.MockIFrameIo.prototype.simulateIncrementalData =
    function(data) {
  this.dispatchEvent(new goog.net.IframeIo.IncrementalDataEvent(data));
};


/**
 * Simulates the iframe is done.
 * @param {goog.net.ErrorCode} errorCode The error code for any error that
 *     should be simulated.
 */
goog.testing.net.MockIFrameIo.prototype.simulateDone = function(errorCode) {
  if (errorCode) {
    this.success_ = false;
    this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
    this.lastError_ = this.getLastError();
    this.dispatchEvent(goog.net.EventType.ERROR);
  } else {
    this.success_ = true;
    this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
    this.dispatchEvent(goog.net.EventType.SUCCESS);
  }
  this.complete_ = true;
  this.dispatchEvent(goog.net.EventType.COMPLETE);
};


/**
 * Simulates the IFrame is ready for the next request.
 */
goog.testing.net.MockIFrameIo.prototype.simulateReady = function() {
  this.dispatchEvent(goog.net.EventType.READY);
};


/**
 * @return {boolean} True if transfer is complete.
 */
goog.testing.net.MockIFrameIo.prototype.isComplete = function() {
  return this.complete_;
};


/**
 * @return {boolean} True if transfer was successful.
 */
goog.testing.net.MockIFrameIo.prototype.isSuccess = function() {
  return this.success_;
};


/**
 * @return {boolean} True if a transfer is in progress.
 */
goog.testing.net.MockIFrameIo.prototype.isActive = function() {
  return this.active_;
};


/**
 * Returns the last response text (i.e. the text content of the iframe).
 * Assumes plain text!
 * @return {string} Result from the server.
 */
goog.testing.net.MockIFrameIo.prototype.getResponseText = function() {
  return this.lastContent_;
};


/**
 * Parses the content as JSON. This is a safe parse and may throw an error
 * if the response is malformed.
 * @return {Object} The parsed content.
 */
goog.testing.net.MockIFrameIo.prototype.getResponseJson = function() {
  return goog.json.parse(this.lastContent_);
};


/**
 * Get the uri of the last request.
 * @return {goog.Uri} Uri of last request.
 */
goog.testing.net.MockIFrameIo.prototype.getLastUri = function() {
  return this.lastUri_;
};


/**
 * Gets the last error code.
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.testing.net.MockIFrameIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Gets the last error message.
 * @return {string} Last error message.
 */
goog.testing.net.MockIFrameIo.prototype.getLastError = function() {
  return goog.net.ErrorCode.getDebugMessage(this.lastErrorCode_);
};


/**
 * Gets the last custom error.
 * @return {Object} Last custom error.
 */
goog.testing.net.MockIFrameIo.prototype.getLastCustomError = function() {
  return this.lastCustomError_;
};


/**
 * Sets the callback function used to check if a loaded IFrame is in an error
 * state.
 * @param {Function} fn Callback that expects a document object as it's single
 *     argument.
 */
goog.testing.net.MockIFrameIo.prototype.setErrorChecker = function(fn) {
  this.errorChecker_ = fn;
};


/**
 * Gets the callback function used to check if a loaded IFrame is in an error
 * state.
 * @return {Function} A callback that expects a document object as it's single
 *     argument.
 */
goog.testing.net.MockIFrameIo.prototype.getErrorChecker = function() {
  return this.errorChecker_;
};
