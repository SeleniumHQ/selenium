// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Class to create objects which want to handle multiple events
 * and have their listeners easily cleaned up via a dispose method.
 *
 * Example:
 * <pre>
 * function Something() {
 *   Something.base(this);
 *
 *   ... set up object ...
 *
 *   // Add event listeners
 *   this.listen(this.starEl, goog.events.EventType.CLICK, this.handleStar);
 *   this.listen(this.headerEl, goog.events.EventType.CLICK, this.expand);
 *   this.listen(this.collapseEl, goog.events.EventType.CLICK, this.collapse);
 *   this.listen(this.infoEl, goog.events.EventType.MOUSEOVER, this.showHover);
 *   this.listen(this.infoEl, goog.events.EventType.MOUSEOUT, this.hideHover);
 * }
 * goog.inherits(Something, goog.events.EventHandler);
 *
 * Something.prototype.disposeInternal = function() {
 *   Something.base(this, 'disposeInternal');
 *   goog.dom.removeNode(this.container);
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
 *
 */

goog.provide('goog.events.EventHandler');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.object');

goog.forwardDeclare('goog.events.EventWrapper');



/**
 * Super class for objects that want to easily manage a number of event
 * listeners.  It allows a short cut to listen and also provides a quick way
 * to remove all events listeners belonging to this object.
 * @param {SCOPE=} opt_scope Object in whose scope to call the listeners.
 * @constructor
 * @extends {goog.Disposable}
 * @template SCOPE
 */
goog.events.EventHandler = function(opt_scope) {
  goog.Disposable.call(this);
  // TODO(user): Rename this to this.scope_ and fix the classes in google3
  // that access this private variable. :(
  this.handler_ = opt_scope;

  /**
   * Keys for events that are being listened to.
   * @type {!Object.<!goog.events.Key>}
   * @private
   */
  this.keys_ = {};
};
goog.inherits(goog.events.EventHandler, goog.Disposable);


/**
 * Utility array used to unify the cases of listening for an array of types
 * and listening for a single event, without using recursion or allocating
 * an array each time.
 * @type {!Array.<string>}
 * @const
 * @private
 */
goog.events.EventHandler.typeArray_ = [];


/**
 * Listen to an event on a Listenable.  If the function is omitted then the
 * EventHandler's handleEvent method will be used.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(this:SCOPE, EVENTOBJ):?|{handleEvent:function(?):?}|null=}
 *     opt_fn Optional callback function to be used as the listener or an object
 *     with handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template EVENTOBJ
 */
goog.events.EventHandler.prototype.listen = function(
    src, type, opt_fn, opt_capture) {
  return this.listen_(src, type, opt_fn, opt_capture);
};


/**
 * Listen to an event on a Listenable.  If the function is omitted then the
 * EventHandler's handleEvent method will be used.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(this:T, ?):?}|
 *     null|undefined} fn Optional callback function to be used as the
 *     listener or an object with handleEvent function.
 * @param {boolean|undefined} capture Optional whether to use capture phase.
 * @param {T} scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template T,EVENTOBJ
 */
goog.events.EventHandler.prototype.listenWithScope = function(
    src, type, fn, capture, scope) {
  // TODO(user): Deprecate this function.
  return this.listen_(src, type, fn, capture, scope);
};


/**
 * Listen to an event on a Listenable.  If the function is omitted then the
 * EventHandler's handleEvent method will be used.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null=} opt_fn
 *     Optional callback function to be used as the listener or an object with
 *     handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template EVENTOBJ
 * @private
 */
goog.events.EventHandler.prototype.listen_ = function(src, type, opt_fn,
                                                      opt_capture,
                                                      opt_scope) {
  if (!goog.isArray(type)) {
    if (type) {
      goog.events.EventHandler.typeArray_[0] = type.toString();
    }
    type = goog.events.EventHandler.typeArray_;
  }
  for (var i = 0; i < type.length; i++) {
    var listenerObj = goog.events.listen(
        src, type[i], opt_fn || this.handleEvent,
        opt_capture || false,
        opt_scope || this.handler_ || this);

    if (!listenerObj) {
      // When goog.events.listen run on OFF_AND_FAIL or OFF_AND_SILENT
      // (goog.events.CaptureSimulationMode) in IE8-, it will return null
      // value.
      return this;
    }

    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }

  return this;
};


/**
 * Listen to an event on a Listenable.  If the function is omitted, then the
 * EventHandler's handleEvent method will be used. After the event has fired the
 * event listener is removed from the target. If an array of event types is
 * provided, each event type will be listened to once.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(this:SCOPE, EVENTOBJ):?|{handleEvent:function(?):?}|null=} opt_fn
 *    Optional callback function to be used as the listener or an object with
 *    handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template EVENTOBJ
 */
goog.events.EventHandler.prototype.listenOnce = function(
    src, type, opt_fn, opt_capture) {
  // TODO(user): Remove the opt_scope from this function and then
  // templatize it.
  return this.listenOnce_(src, type, opt_fn, opt_capture);
};


/**
 * Listen to an event on a Listenable.  If the function is omitted, then the
 * EventHandler's handleEvent method will be used. After the event has fired the
 * event listener is removed from the target. If an array of event types is
 * provided, each event type will be listened to once.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(this:T, ?):?}|
 *     null|undefined} fn Optional callback function to be used as the
 *     listener or an object with handleEvent function.
 * @param {boolean|undefined} capture Optional whether to use capture phase.
 * @param {T} scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template T,EVENTOBJ
 */
goog.events.EventHandler.prototype.listenOnceWithScope = function(
    src, type, fn, capture, scope) {
  // TODO(user): Deprecate this function.
  return this.listenOnce_(src, type, fn, capture, scope);
};


/**
 * Listen to an event on a Listenable.  If the function is omitted, then the
 * EventHandler's handleEvent method will be used. After the event has fired
 * the event listener is removed from the target. If an array of event types is
 * provided, each event type will be listened to once.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type to listen for or array of event types.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null=} opt_fn
 *    Optional callback function to be used as the listener or an object with
 *    handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template EVENTOBJ
 * @private
 */
goog.events.EventHandler.prototype.listenOnce_ = function(
    src, type, opt_fn, opt_capture, opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.listenOnce_(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listenerObj = goog.events.listenOnce(
        src, type, opt_fn || this.handleEvent, opt_capture,
        opt_scope || this.handler_ || this);
    if (!listenerObj) {
      // When goog.events.listen run on OFF_AND_FAIL or OFF_AND_SILENT
      // (goog.events.CaptureSimulationMode) in IE8-, it will return null
      // value.
      return this;
    }

    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }

  return this;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(this:SCOPE, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 */
goog.events.EventHandler.prototype.listenWithWrapper = function(
    src, wrapper, listener, opt_capt) {
  // TODO(user): Remove the opt_scope from this function and then
  // templatize it.
  return this.listenWithWrapper_(src, wrapper, listener, opt_capt);
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(this:T, ?):?|{handleEvent:function(this:T, ?):?}|null}
 *     listener Optional callback function to be used as the
 *     listener or an object with handleEvent function.
 * @param {boolean|undefined} capture Optional whether to use capture phase.
 * @param {T} scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @template T
 */
goog.events.EventHandler.prototype.listenWithWrapperAndScope = function(
    src, wrapper, listener, capture, scope) {
  // TODO(user): Deprecate this function.
  return this.listenWithWrapper_(src, wrapper, listener, capture, scope);
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener Callback
 *     method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @return {!goog.events.EventHandler.<SCOPE>} This object, allowing for
 *     chaining of calls.
 * @private
 */
goog.events.EventHandler.prototype.listenWithWrapper_ = function(
    src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.listen(src, listener, opt_capt, opt_scope || this.handler_ || this,
                 this);
  return this;
};


/**
 * @return {number} Number of listeners registered by this handler.
 */
goog.events.EventHandler.prototype.getListenerCount = function() {
  var count = 0;
  for (var key in this.keys_) {
    if (Object.prototype.hasOwnProperty.call(this.keys_, key)) {
      count++;
    }
  }
  return count;
};


/**
 * Unlistens on an event.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type or array of event types to unlisten to.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null=} opt_fn
 *     Optional callback function to be used as the listener or an object with
 *     handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_scope Object in whose scope to call the listener.
 * @return {!goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 * @template EVENTOBJ
 */
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn,
                                                       opt_capture,
                                                       opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listener = goog.events.getListener(src, type,
        opt_fn || this.handleEvent,
        opt_capture, opt_scope || this.handler_ || this);

    if (listener) {
      goog.events.unlistenByKey(listener);
      delete this.keys_[listener.key];
    }
  }

  return this;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @return {!goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper,
    listener, opt_capt, opt_scope) {
  wrapper.unlisten(src, listener, opt_capt,
                   opt_scope || this.handler_ || this, this);
  return this;
};


/**
 * Unlistens to all events.
 */
goog.events.EventHandler.prototype.removeAll = function() {
  goog.object.forEach(this.keys_, goog.events.unlistenByKey);
  this.keys_ = {};
};


/**
 * Disposes of this EventHandler and removes all listeners that it registered.
 * @override
 * @protected
 */
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll();
};


/**
 * Default event handler
 * @param {goog.events.Event} e Event object.
 */
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error('EventHandler.handleEvent not implemented');
};
