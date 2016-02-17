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
 * @fileoverview adaptor of XhrStreamReader to the NodeReadableStream interface.
 */

goog.provide('goog.net.streams.XhrNodeReadableStream');

goog.require('goog.array');
goog.require('goog.log');
goog.require('goog.net.streams.NodeReadableStream');
goog.require('goog.net.streams.XhrStreamReader');



/**
 * The XhrNodeReadableStream class.
 *
 * @param {!goog.net.streams.XhrStreamReader} xhrReader The XhrStreamReader
 *    object that handles the events of the underlying Xhr.
 * @constructor
 * @implements {goog.net.streams.NodeReadableStream}
 * @struct
 * @final
 * @package
 */
goog.net.streams.XhrNodeReadableStream = function(xhrReader) {
  /**
   * @const
   * @private {?goog.log.Logger} the logger.
   */
  this.logger_ = goog.log.getLogger('goog.net.streams.XhrNodeReadableStream');


  /**
   * The xhr reader.
   *
   * @private {!goog.net.streams.XhrStreamReader} the xhr reader.
   */
  this.xhrReader_ = xhrReader;

  this.xhrReader_.setDataHandler(goog.bind(this.onData_, this));
  this.xhrReader_.setStatusHandler(goog.bind(this.onStatusChange_, this));

  /**
   * The callback map, keyed by eventTypes.
   *
   * @private {!Object<Array<function(!Object=)>>}
   */
  this.callbackMap_ = {};

  /**
   * The callback-once map, keyed by eventTypes.
   *
   * @private {!Object<Array<function(!Object=)>>}
   */
  this.callbackOnceMap_ = {};
};


/**
 * @override
 */
goog.net.streams.XhrNodeReadableStream.prototype.on = function(
    eventType, callback) {
  var callbacks = this.callbackMap_[eventType];
  if (!callbacks) {
    callbacks = [];
    this.callbackMap_[eventType] = callbacks;
  }

  callbacks.push(callback);
  return this;
};


/**
 * @override
 */
goog.net.streams.XhrNodeReadableStream.prototype.addListener = function(
    eventType, callback) {
  this.on(eventType, callback);
  return this;
};


/**
 * @override
 */
goog.net.streams.XhrNodeReadableStream.prototype.removeListener = function(
    eventType, callback) {
  var callbacks = this.callbackMap_[eventType];
  if (callbacks) {
    goog.array.remove(callbacks, callback);  // keep the empty array
  }

  var onceCallbacks = this.callbackOnceMap_[eventType];
  if (onceCallbacks) {
    goog.array.remove(onceCallbacks, callback);
  }

  return this;
};


/**
 * @override
 */
goog.net.streams.XhrNodeReadableStream.prototype.once = function(
    eventType, callback) {
  var callbacks = this.callbackOnceMap_[eventType];
  if (!callbacks) {
    callbacks = [];
    this.callbackOnceMap_[eventType] = callbacks;
  }

  callbacks.push(callback);
  return this;
};


/**
 * Handles any new data from XHR.
 *
 * @param {!Array<!Object>} messages New messages, to be delivered in order
 *    and atomically.
 * @private
 */
goog.net.streams.XhrNodeReadableStream.prototype.onData_ = function(messages) {
  var callbacks =
      this.callbackMap_[goog.net.streams.NodeReadableStream.EventType.DATA];
  if (callbacks) {
    this.doMessages_(messages, callbacks);
  }

  var onceCallbacks =
      this.callbackOnceMap_[goog.net.streams.NodeReadableStream.EventType.DATA];
  if (onceCallbacks) {
    this.doMessages_(messages, onceCallbacks);
  }
  this.callbackOnceMap_[goog.net.streams.NodeReadableStream.EventType.DATA] =
      [];
};


/**
 * Deliver messages to registered callbacks.
 *
 * Exceptions are caught and logged (debug), and ignored otherwise.
 *
 * @param {!Array<!Object>} messages The messages to be delivered
 * @param {!Array<function(!Object=)>} callbacks The callbacks.
 * @private
 */
goog.net.streams.XhrNodeReadableStream.prototype.doMessages_ = function(
    messages, callbacks) {
  var self = this;
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];

    goog.array.forEach(callbacks, function(callback) {
      try {
        callback(message);
      } catch (ex) {
        self.handleError_('message-callback exception (ignored) ' + ex);
      }
    });
  }
};


/**
 * Handles any state changes from XHR.
 *
 * @private
 */
goog.net.streams.XhrNodeReadableStream.prototype.onStatusChange_ = function() {
  var currentStatus = this.xhrReader_.getStatus();
  var Status = goog.net.streams.XhrStreamReader.Status;
  var EventType = goog.net.streams.NodeReadableStream.EventType;

  switch (currentStatus) {
    case Status.ACTIVE:
      this.doStatus_(EventType.READABLE);
      break;

    case Status.BAD_DATA:
    case Status.HANDLER_EXCEPTION:
    case Status.NO_DATA:
    case Status.TIMEOUT:
    case Status.XHR_ERROR:
      this.doStatus_(EventType.ERROR);
      break;

    case Status.CANCELLED:
      this.doStatus_(EventType.CLOSE);
      break;

    case Status.SUCCESS:
      this.doStatus_(EventType.END);
      break;
  }
};


/**
 * Run status change callbacks.
 *
 * @param {string} eventType The event type
 * @private
 */
goog.net.streams.XhrNodeReadableStream.prototype.doStatus_ = function(
    eventType) {
  var callbacks = this.callbackMap_[eventType];
  var self = this;
  if (callbacks) {
    goog.array.forEach(callbacks, function(callback) {
      try {
        callback();
      } catch (ex) {
        self.handleError_('status-callback exception (ignored) ' + ex);
      }
    });
  }

  var onceCallbacks = this.callbackOnceMap_[eventType];
  if (onceCallbacks) {
    goog.array.forEach(onceCallbacks, function(callback) { callback(); });
  }

  this.callbackOnceMap_[eventType] = [];
};


/**
 * Log an error
 *
 * @param {string} message The error message
 * @private
 */
goog.net.streams.XhrNodeReadableStream.prototype.handleError_ = function(
    message) {
  goog.log.error(this.logger_, message);
}
