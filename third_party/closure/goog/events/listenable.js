// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An interface for a listenable JavaScript object.
 */

goog.provide('goog.events.Listenable');
goog.provide('goog.events.ListenableKey');



/**
 * A listenable interface. Also see goog.events.EventTarget.
 * @interface
 */
goog.events.Listenable = function() {};


/**
 * An expando property to indicate that an object implements
 * goog.events.Listenable.
 *
 * See addImplementation/isImplementedBy.
 *
 * @type {string}
 * @const
 */
goog.events.Listenable.IMPLEMENTED_BY_PROP =
    'closure_listenable_' + ((Math.random() * 1e6) | 0);


/**
 * Marks a given class (constructor) as an implementation of
 * Listenable, do that we can query that fact at runtime. The class
 * must have already implemented the interface.
 * @param {!Function} cls The class constructor. The corresponding
 *     class must have already implemented the interface.
 */
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true;
};


/**
 * @param {Object} obj The object to check.
 * @return {boolean} Whether a given instance implements
 *     Listenable. The class/superclass of the instance must call
 *     addImplementation.
 */
goog.events.Listenable.isImplementedBy = function(obj) {
  return !!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP]);
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {string} type Event type or array of event types.
 * @param {!Function} listener Callback method, or an object
 *     with a handleEvent function.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 */
goog.events.Listenable.prototype.listen;


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {string} type Event type or array of event types.
 * @param {!Function} listener Callback method, or an object
 *     with a handleEvent function.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 */
goog.events.Listenable.prototype.listenOnce;


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * Implementation needs to call goog.events.cleanUp.
 *
 * @param {string} type Event type or array of event types.
 * @param {!Function} listener Callback method, or an object
 *     with a handleEvent function. TODO(user): Consider whether
 *     we can remove Object.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {Object=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 */
goog.events.Listenable.prototype.unlisten;


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * Implementation needs to call goog.events.cleanUp.
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
goog.events.Listenable.prototype.unlistenByKey;


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
goog.events.Listenable.prototype.dispatchEvent;


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * Implementation needs to call goog.events.cleanUp for each removed
 * listener.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
goog.events.Listenable.prototype.removeAllListeners;


/**
 * Fires all registered listeners in this listenable for the given
 * type and capture mode, passing them the given eventObject. This
 * does not perform actual capture/bubble. Only implementors of the
 * interface should be using this.
 *
 * @param {string} type The type of the listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @param {goog.events.Event} eventObject The event object to fire.
 * @return {boolean} Whether all listeners succeeded without
 *     attempting to prevent default behavior. If any listener returns
 *     false or called goog.events.Event#preventDefault, this returns
 *     false.
 */
goog.events.Listenable.prototype.fireListeners;


/**
 * Gets all listeners in this listenable for the given type and
 * capture mode.
 *
 * @param {string} type The type of the listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @return {!Array.<goog.events.ListenableKey>} An array of registered
 *     listeners.
 */
goog.events.Listenable.prototype.getListeners;


/**
 * Gets the goog.events.ListenableKey for the event or null if no such
 * listener is in use.
 *
 * @param {string} type The name of the event without the 'on' prefix.
 * @param {!Function} listener The listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 */
goog.events.Listenable.prototype.getListener;


/**
 * Whether there is any active listeners matching the specified
 * signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble
 *     listeners.
 * @return {boolean} Whether there is any active listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.Listenable.prototype.hasListener;



/**
 * An interface that describes a single registered listener.
 * @interface
 */
goog.events.ListenableKey = function() {};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.ListenableKey.counter_ = 0;


/**
 * Reserves a key to be used for ListenableKey#key field.
 * @return {number} A number to be used to fill ListenableKey#key
 *     field.
 */
goog.events.ListenableKey.reserveKey = function() {
  return ++goog.events.ListenableKey.counter_;
};


/**
 * The source event target.
 * @type {!(Object|goog.events.Listenable|goog.events.EventTarget)}
 */
goog.events.ListenableKey.prototype.src;


/**
 * The event type the listener is listening to.
 * @type {string}
 */
goog.events.ListenableKey.prototype.type;


/**
 * The listener function.
 * TODO(user): Narrow the type if possible.
 * @type {Function|Object}
 */
goog.events.ListenableKey.prototype.listener;


/**
 * Whether the listener works on capture phase.
 * @type {boolean}
 */
goog.events.ListenableKey.prototype.capture;


/**
 * The 'this' object for the listener function's scope.
 * @type {Object}
 */
goog.events.ListenableKey.prototype.handler;


/**
 * A globally unique number to identify the key.
 * @type {number}
 */
goog.events.ListenableKey.prototype.key;
