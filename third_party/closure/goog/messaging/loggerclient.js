// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This class sends logging messages over a message channel to a
 * server on the main page that prints them using standard logging mechanisms.
 *
 */

goog.provide('goog.messaging.LoggerClient');

goog.require('goog.Disposable');
goog.require('goog.debug');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');



/**
 * Creates a logger client that sends messages along a message channel for the
 * remote end to log. The remote end of the channel should use a
 * {goog.messaging.LoggerServer} with the same service name.
 *
 * @param {!goog.messaging.MessageChannel} channel The channel that on which to
 *     send the log messages.
 * @param {string} serviceName The name of the logging service to use.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.messaging.LoggerClient = function(channel, serviceName) {
  if (goog.messaging.LoggerClient.instance_) {
    return goog.messaging.LoggerClient.instance_;
  }

  goog.messaging.LoggerClient.base(this, 'constructor');

  /**
   * The channel on which to send the log messages.
   * @type {!goog.messaging.MessageChannel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The name of the logging service to use.
   * @type {string}
   * @private
   */
  this.serviceName_ = serviceName;

  /**
   * The bound handler function for handling log messages. This is kept in a
   * variable so that it can be deregistered when the logger client is disposed.
   * @type {Function}
   * @private
   */
  this.publishHandler_ = goog.bind(this.sendLog_, this);
  goog.debug.LogManager.getRoot().addHandler(this.publishHandler_);

  goog.messaging.LoggerClient.instance_ = this;
};
goog.inherits(goog.messaging.LoggerClient, goog.Disposable);


/**
 * The singleton instance, if any.
 * @type {goog.messaging.LoggerClient}
 * @private
 */
goog.messaging.LoggerClient.instance_ = null;


/**
 * Sends a log message through the channel.
 * @param {!goog.debug.LogRecord} logRecord The log message.
 * @private
 */
goog.messaging.LoggerClient.prototype.sendLog_ = function(logRecord) {
  var name = logRecord.getLoggerName();
  var level = logRecord.getLevel();
  var msg = logRecord.getMessage();
  var originalException = logRecord.getException();

  var exception;
  if (originalException) {
    var normalizedException =
        goog.debug.normalizeErrorObject(originalException);
    exception = {
      'name': normalizedException.name,
      'message': normalizedException.message,
      'lineNumber': normalizedException.lineNumber,
      'fileName': normalizedException.fileName,
      // Normalized exceptions without a stack have 'stack' set to 'Not
      // available', so we check for the existence of 'stack' on the original
      // exception instead.
      'stack': originalException.stack ||
          goog.debug.getStacktrace(goog.debug.Logger.prototype.log)
    };

    if (goog.isObject(originalException)) {
      // Add messageN to the exception in case it was added using
      // goog.debug.enhanceError.
      for (var i = 0; 'message' + i in originalException; i++) {
        exception['message' + i] = String(originalException['message' + i]);
      }
    }
  }
  this.channel_.send(this.serviceName_, {
    'name': name,
    'level': level.value,
    'message': msg,
    'exception': exception
  });
};


/** @override */
goog.messaging.LoggerClient.prototype.disposeInternal = function() {
  goog.messaging.LoggerClient.base(this, 'disposeInternal');
  goog.debug.LogManager.getRoot().removeHandler(this.publishHandler_);
  delete this.channel_;
  goog.messaging.LoggerClient.instance_ = null;
};
