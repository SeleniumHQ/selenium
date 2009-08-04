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
 * @fileoverview Class to create objects which want to handle multiple events
 * and have their listeners easily cleaned up via a dispose method
 *
 * Example:
 * <pre>
 * function Something() {
 *   goog.events.EventHandler.call(this);
 *
 *   ... set up object ...
 *
 *   // Add event listeners
 *   this.listen(this.starEl, 'click', this.handleStar);
 *   this.listen(this.headerEl, 'click', this.expand);
 *   this.listen(this.collapseEl, 'click', this.collapse);
 *   this.listen(this.infoEl, 'mouseover', this.showHover);
 *   this.listen(this.infoEl, 'mouseout', this.hideHover);
 * }
 * goog.inherits(Something, goog.events.EventHandler);
 *
 * Something.prototype.dispose = function() {
 *   if (!this.getDisposed()) {
 *     goog.events.EventHandler.prototype.dispose.call(this);
 *     goog.dom.removeNode(this.container);
 *   }
 * };
 *
 *
 * // Then elsewhere:
 *
 * var activeSomething = null;
 * function openSomething() {
 *   activeSomething = new Something();
 * }
 *
 * function closeSomething() {
 *   if (activeSomething) {
 *     activeSomething.dispose();  // Remove event listeners
 *     activeSomething = null;
 *   }
 * }
 * </pre>
 */

goog.provide('goog.events.EventHandler');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.structs.SimplePool');


/**
 * Super class for objects that want to easily manage a number of event
 * listeners.  It allows a short cut to listen and also provides a quick way
 * to remove all events listeners belonging to this object. It is optimized to
 * use less objects if only one event is being listened to, but if that's the
 * case, it may not be worth using the EventHandler anyway.
 * @param {Object} opt_handler Object in who's scope to call the listeners.
 * @constructor
 * @extends goog.Disposable
 */
goog.events.EventHandler = function(opt_handler) {
  this.handler_ = opt_handler;
};
goog.inherits(goog.events.EventHandler, goog.Disposable);


/**
 * Initial count for the keyPool_
 * @type {number}
 */
goog.events.EventHandler.KEY_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the keyPool_
 * @type {number}
 */
goog.events.EventHandler.KEY_POOL_MAX_COUNT = 100;


/**
 * SimplePool to cache the key object. This was implemented to make IE6
 * performance better and removed an object allocation in the listen method
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.EventHandler.keyPool_ = new goog.structs.SimplePool(
    goog.events.EventHandler.KEY_POOL_INITIAL_COUNT,
    goog.events.EventHandler.KEY_POOL_MAX_COUNT);


/**
 * Keys for events that are being listened to. This is used once there are more
 * than one event to listen to. If there is only one event to listen to, key_
 * is used.
 * @type {Object?}
 * @private
 */
goog.events.EventHandler.keys_ = null;


/**
 * Keys for event that is being listened to if only one event is being listened
 * to. This is a performance optimization to avoid creating an extra object
 * if not necessary.
 * @type {string?}
 * @private
 */
goog.events.EventHandler.key_ = null;


/**
 * Listen to an event on a DOM node or EventTarget.  If the function is ommitted
 * then the EventHandler's handleEvent method will be used.
 * @param {goog.events.EventTarget|Element} src Event source.
 * @param {string|Array.<string>} type Event type to listen for or array of
 *     event types.
 * @param {Function} opt_fn Optional function to be used as the listener.
 * @param {boolean} opt_capture Optional whether to use capture phase.
 * @param {Object} opt_handler Object in who's scope to call the listener.
 */
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn,
                                                     opt_capture,
                                                     opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.listen(src, type[i], opt_fn, opt_capture, opt_handler);
    }
    return;
  }

  var key = goog.events.listen(src, type, opt_fn || this,
                               opt_capture || false,
                               opt_handler || this.handler_ || this);

  if (this.keys_) {
    // already have multiple keys
    this.keys_[key] = true;
  } else if (this.key_) {
    // going from one key to multiple - must now use object as map
    this.keys_ = goog.events.EventHandler.keyPool_.getObject();
    this.keys_[this.key_] = true;
    this.key_ = null;
    this.keys_[key] = true;
  } else {
    // first key - can use single key
    this.key_ = key;
  }
};


/**
 * Unlisten on an event
 * @param {goog.events.EventTarget|Element} src Event source.
 * @param {string|Array.<string>} type Event type to listen for.
 * @param {Function} opt_fn Optional function to be used as the listener.
 * @param {boolean} opt_capture Optional whether to use capture phase.
 * @param {Object} opt_handler Object in who's scope to call the listener.
 */
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn,
                                                       opt_capture,
                                                       opt_handler) {
  if (!this.key_ && !this.keys_) {
    return;
  }

  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_handler);
    }
    return;
  }

  var listener = goog.events.getListener(src, type, opt_fn || this,
                                         opt_capture || false,
                                         opt_handler || this.handler_ || this);

  if (listener) {
    var key = listener.key;
    goog.events.unlistenByKey(key);

    if (this.keys_) {
      goog.object.remove(this.keys_, key);
    } else if (this.key_ == key) {
      this.key_ = null;
    }
  }
};


/**
 * Unlistens to all events.
 */
goog.events.EventHandler.prototype.removeAll = function() {
  if (this.keys_) {
    for (var key in this.keys_) {
      goog.events.unlistenByKey(key);
      // Clean the keys before returning object to the pool.
      delete this.keys_[key];
    }
    goog.events.EventHandler.keyPool_.releaseObject(this.keys_);
    this.keys_ = null;

  } else if (this.key_) {
    goog.events.unlistenByKey(this.key_);
  }
};


/**
 * Dispose of this EventHandler and remove all listeners that it registered.
 */
goog.events.EventHandler.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.Disposable.prototype.dispose.call(this);
    this.removeAll();
  }
};


/**
 * Default event handler
 * @param {goog.events.Event} e Event object.
 */
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error('EventHandler.handleEvent not implemented');
};
