// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview the XHR stream reader implements a low-level stream
 * reader for handling a streamed XHR response body. The reader takes a
 * StreamParser which may support JSON or any other formats as confirmed by
 * the Content-Type of the response. The reader may be used as polyfill for
 * different streams APIs such as Node streams or whatwg streams (Fetch).
 *
 * The first version of this implementation only covers functions necessary
 * to support NodeReadableStream. In a later version, this reader will also
 * be adapted to whatwg streams.
 *
 * For IE, only IE-10 and above are supported.
 *
 * TODO(user): xhr polling, stream timeout, CORS and preflight optimization.
 */

goog.provide('goog.net.streams.XhrStreamReader');

goog.require('goog.events.EventHandler');
goog.require('goog.log');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.streams.Base64PbStreamParser');
goog.require('goog.net.streams.JsonStreamParser');
goog.require('goog.net.streams.PbJsonStreamParser');
goog.require('goog.net.streams.PbStreamParser');
goog.require('goog.string');
goog.require('goog.userAgent');

goog.scope(function() {

var Base64PbStreamParser =
    goog.module.get('goog.net.streams.Base64PbStreamParser');
var PbJsonStreamParser = goog.module.get('goog.net.streams.PbJsonStreamParser');


/**
 * The XhrStreamReader class.
 *
 * The caller must check isStreamingSupported() first.
 *
 * @param {!goog.net.XhrIo} xhr The XhrIo object with its response body to
 * be handled by NodeReadableStream.
 * @constructor
 * @struct
 * @final
 * @package
 */
goog.net.streams.XhrStreamReader = function(xhr) {
  /**
   * @const
   * @private {?goog.log.Logger} the logger.
   */
  this.logger_ = goog.log.getLogger('goog.net.streams.XhrStreamReader');

  /**
   * The xhr object passed by the application.
   *
   * @private {?goog.net.XhrIo} the XHR object for the stream.
   */
  this.xhr_ = xhr;

  /**
   * To be initialized with the correct content-type.
   *
   * @private {?goog.net.streams.StreamParser} the parser for the stream.
   */
  this.parser_ = null;

  /**
   * The position of where the next unprocessed data starts in the XHR
   * response text.
   * @private {number}
   */
  this.pos_ = 0;

  /**
   * The status (error detail) of the current stream.
   * @private {!goog.net.streams.XhrStreamReader.Status}
   */
  this.status_ = goog.net.streams.XhrStreamReader.Status.INIT;

  /**
   * The handler for any status change event.
   *
   * @private {?function()} The call back to handle the XHR status change.
   */
  this.statusHandler_ = null;

  /**
   * The handler for new response data.
   *
   * @private {?function(!Array<!Object>)} The call back to handle new
   * response data, parsed as an array of atomic messages.
   */
  this.dataHandler_ = null;

  /**
   * An object to keep track of event listeners.
   *
   * @private {!goog.events.EventHandler<!goog.net.streams.XhrStreamReader>}
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  // register the XHR event handler
  this.eventHandler_.listen(
      this.xhr_, goog.net.EventType.READY_STATE_CHANGE,
      this.readyStateChangeHandler_);
};


/**
 * Enum type for current stream status.
 * @enum {number}
 */
goog.net.streams.XhrStreamReader.Status = {
  /**
   * Init status, with xhr inactive.
   */
  INIT: 0,

  /**
   * XHR being sent.
   */
  ACTIVE: 1,

  /**
   * The request was successful, after the request successfully completes.
   */
  SUCCESS: 2,

  /**
   * Errors due to a non-200 status code or other error conditions.
   */
  XHR_ERROR: 3,

  /**
   * Errors due to no data being returned.
   */
  NO_DATA: 4,

  /**
   * Errors due to corrupted or invalid data being received.
   */
  BAD_DATA: 5,

  /**
   * Errors due to the handler throwing an exception.
   */
  HANDLER_EXCEPTION: 6,

  /**
   * Errors due to a timeout.
   */
  TIMEOUT: 7,

  /**
   * The request is cancelled by the application.
   */
  CANCELLED: 8
};


/**
 * Returns whether response streaming is supported on this browser.
 *
 * @return {boolean} false if response streaming is not supported.
 */
goog.net.streams.XhrStreamReader.isStreamingSupported = function() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(10)) {
    // No active-x due to security issues.
    return false;
  }

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('420+')) {
    // Safari 3+
    // Older versions of Safari always receive null response in INTERACTIVE.
    return false;
  }

  if (goog.userAgent.OPERA && !goog.userAgent.WEBKIT) {
    // Old Opera fires readyState == INTERACTIVE once.
    // TODO(user): polling the buffer and check the exact Opera version
    return false;
  }

  return true;
};


/**
 * Returns a parser that supports the given content-type (mime) and
 * content-transfer-encoding.
 *
 * @return {?goog.net.streams.StreamParser} a parser or null if the content
 *    type or transfer encoding is unsupported.
 * @private
 */
goog.net.streams.XhrStreamReader.prototype.getParserByResponseHeader_ =
    function() {
  var contentType =
      this.xhr_.getStreamingResponseHeader(goog.net.XhrIo.CONTENT_TYPE_HEADER);
  if (!contentType) {
    goog.log.warning(this.logger_, 'Content-Type unavailable: ' + contentType);
    return null;
  }
  contentType = contentType.toLowerCase();

  if (goog.string.startsWith(contentType, 'application/json')) {
    if (goog.string.startsWith(contentType, 'application/json+protobuf')) {
      return new PbJsonStreamParser();
    }
    return new goog.net.streams.JsonStreamParser();
  }

  if (goog.string.startsWith(contentType, 'application/x-protobuf')) {
    var encoding = this.xhr_.getStreamingResponseHeader(
        goog.net.XhrIo.CONTENT_TRANSFER_ENCODING);
    if (!encoding) {
      return new goog.net.streams.PbStreamParser();
    }
    if (encoding.toLowerCase() == 'base64') {
      return new Base64PbStreamParser();
    }
    goog.log.warning(
        this.logger_, 'Unsupported Content-Transfer-Encoding: ' + encoding +
            '\nFor Content-Type: ' + contentType);
    return null;
  }

  goog.log.warning(this.logger_, 'Unsupported Content-Type: ' + contentType);
  return null;
};


/**
 * Returns the XHR request object.
 *
 * @return {goog.net.XhrIo} The XHR object associated with this reader, or
 *    null if the reader has been cleared.
 */
goog.net.streams.XhrStreamReader.prototype.getXhr = function() {
  return this.xhr_;
};


/**
 * Gets the current stream status.
 *
 * @return {!goog.net.streams.XhrStreamReader.Status} The stream status.
 */
goog.net.streams.XhrStreamReader.prototype.getStatus = function() {
  return this.status_;
};


/**
 * Sets the status handler.
 *
 * @param {function()} handler The handler for any status change.
 */
goog.net.streams.XhrStreamReader.prototype.setStatusHandler = function(
    handler) {
  this.statusHandler_ = handler;
};


/**
 * Sets the data handler.
 *
 * @param {function(!Array<!Object>)} handler The handler for new data.
 */
goog.net.streams.XhrStreamReader.prototype.setDataHandler = function(handler) {
  this.dataHandler_ = handler;
};


/**
 * Handles XHR readystatechange events.
 *
 * TODO(user): throttling may be needed.
 *
 * @param {!goog.events.Event} event The event.
 * @private
 */
goog.net.streams.XhrStreamReader.prototype.readyStateChangeHandler_ = function(
    event) {
  var xhr = /** @type {goog.net.XhrIo} */ (event.target);


  try {
    if (xhr == this.xhr_) {
      this.onReadyStateChanged_();
    } else {
      goog.log.warning(this.logger_, 'Called back with an unexpected xhr.');
    }
  } catch (ex) {
    goog.log.error(
        this.logger_, 'readyStateChangeHandler_ thrown exception' +
            ' ' + ex);
    // no rethrow
    this.updateStatus_(
        goog.net.streams.XhrStreamReader.Status.HANDLER_EXCEPTION);
    this.clear_();
  }
};


/**
 * Called from readyStateChangeHandler_.
 *
 * @private
 */
goog.net.streams.XhrStreamReader.prototype.onReadyStateChanged_ = function() {
  var readyState = this.xhr_.getReadyState();
  var errorCode = this.xhr_.getLastErrorCode();
  var statusCode = this.xhr_.getStatus();
  var responseText = this.xhr_.getResponseText();

  // we get partial results in browsers that support ready state interactive.
  // We also make sure that getResponseText is not null in interactive mode
  // before we continue.
  if (readyState < goog.net.XmlHttp.ReadyState.INTERACTIVE ||
      readyState == goog.net.XmlHttp.ReadyState.INTERACTIVE && !responseText) {
    return;
  }

  // TODO(user): white-list other 2xx responses with application payload
  var successful =
      (statusCode == goog.net.HttpStatus.OK ||
       statusCode == goog.net.HttpStatus.PARTIAL_CONTENT);

  if (readyState == goog.net.XmlHttp.ReadyState.COMPLETE) {
    if (errorCode == goog.net.ErrorCode.TIMEOUT) {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.TIMEOUT);
    } else if (errorCode == goog.net.ErrorCode.ABORT) {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.CANCELLED);
    } else if (!successful) {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.XHR_ERROR);
    }
  }

  if (successful && !responseText) {
    goog.log.warning(
        this.logger_, 'No response text for xhr ' + this.xhr_.getLastUri() +
            ' status ' + statusCode);
  }

  if (!this.parser_) {
    this.parser_ = this.getParserByResponseHeader_();
    if (this.parser_ == null) {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.BAD_DATA);
    }
  }

  if (this.status_ > goog.net.streams.XhrStreamReader.Status.SUCCESS) {
    this.clear_();
    return;
  }

  // Parses and delivers any new data, with error status.
  if (responseText.length > this.pos_) {
    var newData = responseText.substr(this.pos_);
    this.pos_ = responseText.length;
    try {
      var messages = this.parser_.parse(newData);
      if (messages != null) {
        if (this.dataHandler_) {
          this.dataHandler_(messages);
        }
      }
    } catch (ex) {
      goog.log.error(
          this.logger_, 'Invalid response ' + ex + '\n' + responseText);
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.BAD_DATA);
      this.clear_();
      return;
    }
  }

  if (readyState == goog.net.XmlHttp.ReadyState.COMPLETE) {
    if (responseText.length == 0) {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.NO_DATA);
    } else {
      this.updateStatus_(goog.net.streams.XhrStreamReader.Status.SUCCESS);
    }
    this.clear_();
    return;
  }

  this.updateStatus_(goog.net.streams.XhrStreamReader.Status.ACTIVE);
};


/**
 * Update the status and may call the handler.
 *
 * @param {!goog.net.streams.XhrStreamReader.Status} status The new status
 * @private
 */
goog.net.streams.XhrStreamReader.prototype.updateStatus_ = function(status) {
  var current = this.status_;
  if (current != status) {
    this.status_ = status;
    if (this.statusHandler_) {
      this.statusHandler_();
    }
  }
};


/**
 * Clears after the XHR terminal state is reached.
 *
 * @private
 */
goog.net.streams.XhrStreamReader.prototype.clear_ = function() {
  this.eventHandler_.removeAll();

  if (this.xhr_) {
    // clear out before aborting to avoid being reentered inside abort
    var xhr = this.xhr_;
    this.xhr_ = null;
    xhr.abort();
    xhr.dispose();
  }
};

});  // goog.scope
