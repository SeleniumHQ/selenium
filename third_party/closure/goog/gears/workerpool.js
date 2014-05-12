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
 * @fileoverview This file implements a wrapper around the Gears WorkerPool
 * with some extra features.
 *
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.gears.WorkerPool');
goog.provide('goog.gears.WorkerPool.Event');
goog.provide('goog.gears.WorkerPool.EventType');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.gears');
goog.require('goog.gears.Worker');



/**
 * This class implements a wrapper around the Gears Worker Pool.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.gears.WorkerPool = function() {
  goog.events.EventTarget.call(this);

  /**
   * Map from thread id to worker object
   * @type {Object}
   * @private
   */
  this.workers_ = {};

  // If we are in a worker thread we get the global google.gears.workerPool,
  // otherwise we create a new Gears WorkerPool using the factory
  var workerPool = /** @type {GearsWorkerPool} */
      (goog.getObjectByName('google.gears.workerPool'));
  if (workerPool) {
    this.workerPool_ = workerPool;
  } else {
    // use a protected method to let the sub class override
    this.workerPool_ = this.getGearsWorkerPool();
  }

  this.workerPool_.onmessage = goog.bind(this.handleMessage_, this);
};
goog.inherits(goog.gears.WorkerPool, goog.events.EventTarget);


/**
 * Enum for event types fired by the WorkerPool.
 * @enum {string}
 */
goog.gears.WorkerPool.EventType = {
  UNKNOWN_WORKER: 'uknown_worker'
};


/**
 * The Gears WorkerPool object.
 * @type {GearsWorkerPool}
 * @private
 */
goog.gears.WorkerPool.prototype.workerPool_ = null;


/**
 * @return {GearsWorkerPool} A Gears WorkerPool object.
 * @protected
 */
goog.gears.WorkerPool.prototype.getGearsWorkerPool = function() {
  var factory = goog.gears.getFactory();
  return factory.create('beta.workerpool');
};


/**
 * Sets a last-chance error handler for a worker pool.
 * WARNING: This will only succeed from inside a worker thread. In main thread,
 * use window.onerror handler.
 * @param {function(!GearsErrorObject):boolean} fn An error handler function
 *     that gets passed an error object with message and line number attributes.
 *     Returns whether the error was handled. If true stops propagation.
 * @param {Object=} opt_handler This object for the function.
 */
goog.gears.WorkerPool.prototype.setErrorHandler = function(fn, opt_handler) {
  this.workerPool_.onerror = goog.bind(fn, opt_handler);
};


/**
 * Creates a new worker.
 * @param {string} code  The code to execute inside the worker.
 * @return {goog.gears.Worker} The worker that was just created.
 */
goog.gears.WorkerPool.prototype.createWorker = function(code) {
  var workerId = this.workerPool_.createWorker(code);
  var worker = new goog.gears.Worker(this, workerId);
  this.registerWorker(worker);
  return worker;
};


/**
 * Creates a new worker from a URL.
 * @param {string} url  URL from which to get the code to execute inside the
 *     worker.
 * @return {goog.gears.Worker} The worker that was just created.
 */
goog.gears.WorkerPool.prototype.createWorkerFromUrl = function(url) {
  var workerId = this.workerPool_.createWorkerFromUrl(url);
  var worker = new goog.gears.Worker(this, workerId);
  this.registerWorker(worker);
  return worker;
};


/**
 * Allows the worker who calls this to be used cross origin.
 */
goog.gears.WorkerPool.prototype.allowCrossOrigin = function() {
  this.workerPool_.allowCrossOrigin();
};


/**
 * Sends a message to a given worker.
 * @param {*} message The message to send to the worker.
 * @param {goog.gears.Worker} worker The worker to send the message to.
 */
goog.gears.WorkerPool.prototype.sendMessage = function(message, worker) {
  this.workerPool_.sendMessage(message, worker.getId());
};


/**
 * Callback when this worker recieves a message.
 * @param {string} message  The message that was sent.
 * @param {number} senderId  The ID of the worker that sent the message.
 * @param {GearsMessageObject} messageObject An object containing all
 *     information about the message.
 * @private
 */
goog.gears.WorkerPool.prototype.handleMessage_ = function(message,
                                                          senderId,
                                                          messageObject) {
  if (!this.isDisposed()) {
    var workers = this.workers_;
    if (!workers[senderId]) {
      // If the worker is unknown, dispatch an event giving users of the class
      // the change to register the worker.
      this.dispatchEvent(new goog.gears.WorkerPool.Event(
          goog.gears.WorkerPool.EventType.UNKNOWN_WORKER,
          senderId,
          messageObject));
    }

    var worker = workers[senderId];
    if (worker) {
      worker.handleMessage(messageObject);
    }
  }
};


/**
 * Registers a worker object.
 * @param {goog.gears.Worker} worker  The worker to register.
 */
goog.gears.WorkerPool.prototype.registerWorker = function(worker) {
  this.workers_[worker.getId()] = worker;
};


/**
 * Unregisters a worker object.
 * @param {goog.gears.Worker} worker  The worker to unregister.
 */
goog.gears.WorkerPool.prototype.unregisterWorker = function(worker) {
  delete this.workers_[worker.getId()];
};


/** @override */
goog.gears.WorkerPool.prototype.disposeInternal = function() {
  goog.gears.WorkerPool.superClass_.disposeInternal.call(this);
  this.workerPool_ = null;
  delete this.workers_;
};



/**
 * Event used when the workerpool recieves a message
 * @param {string} type  The type of event.
 * @param {number} senderId  The id of the sender of the message.
 * @param {GearsMessageObject} messageObject  The message object.
 *
 * @constructor
 * @extends {goog.events.Event}
 */
goog.gears.WorkerPool.Event = function(
    type, senderId, messageObject) {
  goog.events.Event.call(this, type);

  /**
   * The id of the sender of the message.
   * @type {number}
   */
  this.senderId = senderId;

  /**
   * The message sent from the worker. This is the same as the
   * messageObject.body field and is here for convenience.
   * @type {*}
   */
  this.message = messageObject.body;

  /**
   * The object containing all information about the message.
   * @type {GearsMessageObject}
   */
  this.messageObject = messageObject;
};
goog.inherits(goog.gears.WorkerPool.Event, goog.events.Event);
