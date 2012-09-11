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
 * @fileoverview This represents a Gears worker (background process).
 *
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.gears.Worker');
goog.provide('goog.gears.Worker.EventType');
goog.provide('goog.gears.WorkerEvent');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * This is an absctraction of workers that can be used with Gears WorkerPool.
 * @constructor
 * @param {goog.gears.WorkerPool} workerPool  WorkerPool object.
 * @param {number=} opt_id  The id of the worker this represents.
 *
 * @extends {goog.events.EventTarget}
 */
goog.gears.Worker = function(workerPool, opt_id) {
  goog.events.EventTarget.call(this);

  /**
   * Reference to the worker pool.
   * @type {goog.gears.WorkerPool}
   * @private
   */
  this.workerPool_ = workerPool;

  if (opt_id != null) {
    this.init(opt_id);
  }
};
goog.inherits(goog.gears.Worker, goog.events.EventTarget);


/**
 * Called when we receive a message from this worker. The message will
 * first be dispatched as a WorkerEvent with type {@code EventType.MESSAGE} and
 * then a {@code EventType.COMMAND}. An EventTarget may call
 * {@code WorkerEvent.preventDefault()} to stop further dispatches.
 * @param {GearsMessageObject} messageObject An object containing all
 *     information about the message.
 */
goog.gears.Worker.prototype.handleMessage = function(messageObject) {
  // First dispatch a message event.
  var messageEvent = new goog.gears.WorkerEvent(
      goog.gears.Worker.EventType.MESSAGE,
      messageObject);

  // Allow the user to call prevent default to not process the COMMAND.
  if (this.dispatchEvent(messageEvent)) {
    if (goog.gears.Worker.isCommandLike(messageObject.body)) {
      this.dispatchEvent(new goog.gears.WorkerEvent(
          goog.gears.Worker.EventType.COMMAND,
          messageObject));
    }
  }
};


/**
 * The ID of the worker we are communicating with.
 * @type {?number}
 * @private
 */
goog.gears.Worker.prototype.id_ = null;


/**
 * Initializes the worker object with a worker id.
 * @param {number} id  The id of the worker this represents.
 */
goog.gears.Worker.prototype.init = function(id) {
  if (this.id_ != null) {
    throw Error('Can only set the worker id once');
  }

  this.id_ = id;
  this.workerPool_.registerWorker(this);
};


/**
 * Sends a command to the worker.
 * @param {number} commandId  The ID of the command to
 *     send.
 * @param {Object} params An object to send as the parameters. This object
 *     must be something that Gears can serialize. This includes JSON as well
 *     as Gears blobs.
 */
goog.gears.Worker.prototype.sendCommand = function(commandId, params) {
  this.sendMessage([commandId, params]);
};


/**
 * Sends a message to the worker.
 * @param {*} message The message to send to the target worker.
 */
goog.gears.Worker.prototype.sendMessage = function(message) {
  this.workerPool_.sendMessage(message, this);
};


/**
 * Gets an ID that uniquely identifies this worker. The ID is unique among all
 * worker from the same WorkerPool.
 *
 * @return {number} The ID of the worker. This might be null if the
 *     worker has not been initialized yet.
 */
goog.gears.Worker.prototype.getId = function() {
  if (this.id_ == null) {
    throw Error('The worker has not yet been initialized');
  }
  return this.id_;
};


/**
 * Whether an object looks like a command. A command is an array with length 2
 * where the first element is a number.
 * @param {*} obj The object to test.
 * @return {boolean} true if the object looks like a command.
 */
goog.gears.Worker.isCommandLike = function(obj) {
  return goog.isArray(obj) && obj.length == 2 &&
      goog.isNumber((/** @type {Array} */ obj)[0]);
};


/** @override */
goog.gears.Worker.prototype.disposeInternal = function() {
  goog.gears.Worker.superClass_.disposeInternal.call(this);
  this.workerPool_.unregisterWorker(this);
  this.workerPool_ = null;
};


/**
 * Enum for event types fired by the worker.
 * @enum {string}
 */
goog.gears.Worker.EventType = {
  MESSAGE: 'message',
  COMMAND: 'command'
};



/**
 * Event used when the worker recieves a message
 * @param {string} type  The type of event.
 * @param {GearsMessageObject} messageObject  The message object.
 *
 * @constructor
 * @extends {goog.events.Event}
 */
goog.gears.WorkerEvent = function(type, messageObject) {
  goog.events.Event.call(this, type);

  /**
   * The message sent from the worker.
   * @type {*}
   */
  this.message = messageObject.body;

  /**
   * The JSON object sent from the worker.
   * @type {*}
   * @deprecated Use message instead.
   */
  this.json = this.message;

  /**
   * The object containing all information about the message.
   * @type {GearsMessageObject}
   */
  this.messageObject = messageObject;
};
goog.inherits(goog.gears.WorkerEvent, goog.events.Event);
