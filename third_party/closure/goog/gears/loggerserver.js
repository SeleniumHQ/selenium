// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview This class lives on the main thread and takes care of incoming
 * logger commands from a worker thread.
 *
 */

goog.provide('goog.gears.LoggerServer');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('goog.gears.Worker.EventType');


/**
 * Creates an object that listens to incoming LOG commands and forwards them
 * to a goog.debug.Logger
 * @param {goog.gears.Worker} worker The worker thread that
 *     we are managing the loggers on.
 * @param {number} logCommandId The command id used for logging.
 * @param {string} opt_workerName The name of the worker. If present then this
 *     is added to the log records and to exceptions as {@code workerName}.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.gears.LoggerServer = function(worker, logCommandId, opt_workerName) {
  goog.Disposable.call(this);

  /**
   * The command id to use to receive log commands from the workers.
   * @type {number}
   * @private
   */
  this.logCommandId_ = logCommandId;

  /**
   * The worker thread object.
   * @type {goog.gears.Worker}
   * @private
   */
  this.worker_ = worker;

  /**
   * The name of the worker.
   * @type {string}
   * @private
   */
  this.workerName_ = opt_workerName || '';

  /**
   * Message prefix containing worker ID.
   * @type {string}
   * @private
   */
  this.msgPrefix_ = '[' + worker.getId() + '] ';

  // Listen for command's from the worker to handle the log command.
  worker.addEventListener(goog.gears.Worker.EventType.COMMAND,
                          this.onCommand_, false, this);
};
goog.inherits(goog.gears.LoggerServer, goog.Disposable);


/**
 * Whether to show the ID of the worker as a prefix to the shown message.
 * @type {boolean}
 * @private
 */
goog.gears.LoggerServer.prototype.useMessagePrefix_ = true;


/**
 * @return {boolean} * Whether to show the ID of the worker as a prefix to the
 *     shown message.
 */
goog.gears.LoggerServer.prototype.getUseMessagePrefix = function() {
  return this.useMessagePrefix_;
};


/**
 * Whether to prefix the message text with the worker ID.
 * @param {boolean} b True to prefix the messages.
 */
goog.gears.LoggerServer.prototype.setUseMessagePrefix = function(b) {
  this.useMessagePrefix_ = b;
};


/**
 * Event handler for the command event of the thread.
 * @param {goog.gears.WorkerEvent} e The command event sent by the the
 *     worker thread.
 * @private
 */
goog.gears.LoggerServer.prototype.onCommand_ = function(e) {
  var message = /** @type {Array} */ (e.message);
  var commandId = message[0];
  if (commandId == this.logCommandId_) {
    var params = message[1];
    var i = 0;
    var name = params[i++];

    // The old version sent the level name as well.  We no longer need it so
    // we just step over it.
    if (params.length == 5) {
      i++;
    }
    var levelValue = params[i++];
    var level = goog.debug.Logger.Level.getPredefinedLevelByValue(levelValue);
    if (level) {
      var msg = (this.useMessagePrefix_ ? this.msgPrefix_ : '') + params[i++];
      var exception = params[i++];
      var logger = goog.debug.Logger.getLogger(name);
      var logRecord = logger.getLogRecord(level, msg, exception);
      if (this.workerName_) {
        logRecord.workerName = this.workerName_;

        // Note that we happen to know that getLogRecord just references the
        // exception object so we can continue to modify it as needed.
        if (exception) {
          exception.workerName = this.workerName_;
        }
      }
      logger.logRecord(logRecord);
    }
    // ignore others for now
  }
};


/**
 * Disposes of the logger server.
 */
goog.gears.LoggerServer.prototype.disposeInternal = function() {
  goog.gears.LoggerServer.superClass_.disposeInternal.call(this);

  // Remove the event listener.
  this.worker_.removeEventListener(
      goog.gears.Worker.EventType.COMMAND, this.onCommand_, false, this);

  this.worker_ = null;
};
