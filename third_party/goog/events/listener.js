// Copyright 2005 Google Inc.
// All Rights Reserved
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Listener object
 */

/**
 * Namespace for events
 */
goog.provide('goog.events.Listener');

/**
 * Simple class that stores information about a listener
 * @constructor
 */
goog.events.Listener = function() {
};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.Listener.counter_ = 0;


/**
 * Whether the listener is a function or an object that implements handleEvent.
 * @type {boolean?}
 * @private
 */
goog.events.Listener.prototype.isFunctionListener_ = null;


/**
 * Call back function or an object with a handleEvent function.
 * @type {Function|Object|null}
 */
goog.events.Listener.prototype.listener = null;


/**
 * Proxy for callback that passes through {@link goog.events#HandleEvent_}
 * @type {Function?}
 */
goog.events.Listener.prototype.proxy = null;


/**
 * Object or node that callback is listening to
 * @type {Object?}
 */
goog.events.Listener.prototype.src = null;


/**
 * Type of event
 * @type {string?}
 */
goog.events.Listener.prototype.type = null;


/**
 * Whether the listener is being called in the capture or bubble phase
 * @type {boolean?}
 */
goog.events.Listener.prototype.capture = null;


/**
 * Optional object whose context to execute the listener in
 * @type {Object?}
 */
goog.events.Listener.prototype.handler = null;


/**
 * The key of the listener.
 * @type {number}
 */
goog.events.Listener.prototype.key = 0;


/**
 * Whether the listener has been removed.
 * @type {boolean}
 */
goog.events.Listener.prototype.removed = false;


/**
 * Whether to remove the listener after it has been called.
 * @type {boolean}
 */
goog.events.Listener.prototype.callOnce = false;


/**
 * Initializes the listener.
 * @param {Function|Object} listener Callback function, or an object with a
 *     handleEvent function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {Object} src Source object for the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object} handler Object in who's context to execute the callback.
 */
goog.events.Listener.prototype.init = function(listener, proxy, src, type,
                                               capture, handler) {
  // we do the test of the listener here so that we do  not need to
  // continiously do this inside handleEvent
  if (goog.isFunction(listener)) {
    this.isFunctionListener_ = true;
  } else if (listener && listener.handleEvent &&
      goog.isFunction(listener.handleEvent)) {
    this.isFunctionListener_ = false;
  } else {
   throw Error('Invalid listener argument');
  }

  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false;
};


/**
 * Calls the internal listener
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} The result of the internal listener call.
 */
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if (this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject);
  }
  return this.listener.handleEvent.call(this.listener, eventObject);
};
