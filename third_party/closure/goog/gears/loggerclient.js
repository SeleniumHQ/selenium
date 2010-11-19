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
 * @fileoverview This class lives on a worker thread and it intercepts the
 * goog.debug.Logger objects and sends a LOGGER command to the main thread
 * instead.
 *
 */

goog.provide('goog.gears.LoggerClient');

goog.require('goog.Disposable');
goog.require('goog.debug');
goog.require('goog.debug.Logger');



/**
 * Singleton class that overrides the goog.debug.Logger to send log commands
 * to the main thread.
 * @param {goog.gears.Worker} mainThread  The main thread that has the
 *     logger server running.
 * @param {number} logCommandId  The command id used for logging.
 * @param {string=} opt_workerName  This, if present, is added to the error
 *     object when serializing it.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.gears.LoggerClient = function(mainThread, logCommandId, opt_workerName) {
  if (goog.gears.LoggerClient.instance_) {
    return goog.gears.LoggerClient.instance_;
  }

  goog.Disposable.call(this);

  /**
   * The main thread object.
   * @type {goog.gears.Worker}
   * @private
   */
  this.mainThread_ = mainThread;

  /**
   * The command id to use to send log commands to the main thread.
   * @type {number}
   * @private
   */
  this.logCommandId_ = logCommandId;

  /**
   * The name of the worker thread.
   * @type {string}
   * @private
   */
  this.workerName_ = opt_workerName || '';

  var loggerClient = this;
  // Override the log method
  goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
    var name = this.getName();
    loggerClient.sendLog_(
        name, logRecord.getLevel(), logRecord.getMessage(),
        logRecord.getException());
  };

  goog.gears.LoggerClient.instance_ = this;
};
goog.inherits(goog.gears.LoggerClient, goog.Disposable);


/**
 * The singleton instance if any.
 * @type {goog.gears.LoggerClient?}
 * @private
 */
goog.gears.LoggerClient.instance_ = null;


/**
 * Sends a log message to the main thread.
 * @param {string} name The name of the logger.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Object=} opt_exception An exception associated with the message.
 * @private
 */
goog.gears.LoggerClient.prototype.sendLog_ = function(name,
                                                      level,
                                                      msg,
                                                      opt_exception) {
  var exception;
  if (opt_exception) {
    var prefix = this.workerName_ ? this.workerName_ + ': ' : '';
    exception = {
      message: prefix + opt_exception.message,
      stack: opt_exception.stack ||
          goog.debug.getStacktrace(goog.debug.Logger.prototype.log)
    };

    // Add messageN to the exception in case it was added using
    // goog.debug.enhanceError.
    for (var i = 0; 'message' + i in opt_exception; i++) {
      exception['message' + i] = String(opt_exception['message' + i]);
    }
  }
  this.mainThread_.sendCommand(
      this.logCommandId_,
      [name, level.value, msg, exception]);
};


/**
 * Disposes of the logger client.
 */
goog.gears.LoggerClient.prototype.disposeInternal = function() {
  goog.gears.LoggerClient.superClass_.disposeInternal.call(this);
  this.mainThread_ = null;
  goog.gears.LoggerClient.instance_ = null;
};
