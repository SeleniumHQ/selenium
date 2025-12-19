/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A disposable implementation of a custom
 * listenable/event target. See also: documentation for
 * `goog.events.Listenable`.
 *
 * @see ../demos/eventtarget.html
 * @see goog.events.Listenable
 */

goog.provide('goog.events.EventTarget');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.Listenable');
goog.require('goog.events.ListenerMap');
goog.require('goog.object');
goog.requireType('goog.events.EventId');
goog.requireType('goog.events.EventLike');
goog.requireType('goog.events.ListenableKey');



/**
 * An implementation of `goog.events.Listenable` with full W3C
 * EventTarget-like support (capture/bubble mechanism, stopping event
 * propagation, preventing default actions).
 *
 * You may subclass this class to turn your class into a Listenable.
 *
 * Unless propagation is stopped, an event dispatched by an
 * EventTarget will bubble to the parent returned by
 * `getParentEventTarget`. To set the parent, call
 * `setParentEventTarget`. Subclasses that don't support
 * changing the parent can override the setter to throw an error.
 *
 * Example usage:
 * <pre>
 *   var source = new goog.events.EventTarget();
 *   function handleEvent(e) {
 *     alert('Type: ' + e.type + '; Target: ' + e.target);
 *   }
 *   source.listen('foo', handleEvent);
 *   // Or: goog.events.listen(source, 'foo', handleEvent);
 *   ...
 *   source.dispatchEvent('foo');  // will call handleEvent
 *   ...
 *   source.unlisten('foo', handleEvent);
 *   // Or: goog.events.unlisten(source, 'foo', handleEvent);
 * </pre>
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.events.Listenable}
 */
goog.events.EventTarget = function() {
  'use strict';
  goog.Disposable.call(this);

  /**
   * Maps of event type to an array of listeners.
   * @private {!goog.events.ListenerMap}
   */
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);

  /**
   * The object to use for event.target. Useful when mixing in an
   * EventTarget to another object.
   * @private {!Object}
   */
  this.actualEventTarget_ = this;

  /**
   * Parent event target, used during event bubbling.
   *
   * TODO(chrishenry): Change this to goog.events.Listenable. This
   * currently breaks people who expect getParentEventTarget to return
   * goog.events.EventTarget.
   *
   * @private {?goog.events.EventTarget}
   */
  this.parentEventTarget_ = null;
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);


/**
 * An artificial cap on the number of ancestors you can have. This is mainly
 * for loop detection.
 * @const {number}
 * @private
 */
goog.events.EventTarget.MAX_ANCESTORS_ = 1000;


/**
 * Returns the parent of this event target to use for bubbling.
 *
 * @return {goog.events.EventTarget} The parent EventTarget or null if
 *     there is no parent.
 * @override
 */
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  'use strict';
  return this.parentEventTarget_;
};


/**
 * Sets the parent of this event target to use for capture/bubble
 * mechanism.
 * @param {goog.events.EventTarget} parent Parent listenable (null if none).
 */
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  'use strict';
  this.parentEventTarget_ = parent;
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * @param {string|!goog.events.EventId} type The type of the event to listen for
 * @param {function(?):?|{handleEvent:function(?):?}|null} handler The function
 *     to handle the event. The handler can also be an object that implements
 *     the handleEvent method which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 * @deprecated Use `#listen` instead, when possible. Otherwise, use
 *     `goog.events.listen` if you are passing Object
 *     (instead of Function) as handler.
 */
goog.events.EventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  'use strict';
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 *
 * @param {string|!goog.events.EventId} type The type of the event to listen for
 * @param {function(?):?|{handleEvent:function(?):?}|null} handler The function
 *     to handle the event. The handler can also be an object that implements
 *     the handleEvent method which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 * @deprecated Use `#unlisten` instead, when possible. Otherwise, use
 *     `goog.events.unlisten` if you are passing Object
 *     (instead of Function) as handler.
 */
goog.events.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  'use strict';
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * @param {?goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 * @override
 */
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  'use strict';
  this.assertInitialized_();

  var ancestorsTree, ancestor = this.getParentEventTarget();
  if (ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for (; ancestor; ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(
          (++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_),
          'infinite loop');
    }
  }

  return goog.events.EventTarget.dispatchEventInternal_(
      this.actualEventTarget_, e, ancestorsTree);
};


/**
 * Removes listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners.
 * @override
 * @protected
 */
goog.events.EventTarget.prototype.disposeInternal = function() {
  'use strict';
  goog.events.EventTarget.superClass_.disposeInternal.call(this);

  this.removeAllListeners();
  this.parentEventTarget_ = null;
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.listen = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  'use strict';
  this.assertInitialized_();
  return this.eventTargetListeners_.add(
      String(type), listener, false /* callOnce */, opt_useCapture,
      opt_listenerScope);
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.listenOnce = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  'use strict';
  return this.eventTargetListeners_.add(
      String(type), listener, true /* callOnce */, opt_useCapture,
      opt_listenerScope);
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.unlisten = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  'use strict';
  return this.eventTargetListeners_.remove(
      String(type), listener, opt_useCapture, opt_listenerScope);
};


/**
 * @param {!goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 * @override
 */
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  'use strict';
  return this.eventTargetListeners_.removeByKey(key);
};


/**
 * @param {string|!goog.events.EventId=} opt_type Type of event to remove,
 *     default is to remove all types.
 * @return {number} Number of listeners removed.
 * @override
 */
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type) {
  'use strict';
  // TODO(chrishenry): Previously, removeAllListeners can be called on
  // uninitialized EventTarget, so we preserve that behavior. We
  // should remove this when usages that rely on that fact are purged.
  if (!this.eventTargetListeners_) {
    return 0;
  }
  return this.eventTargetListeners_.removeAll(opt_type);
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>} type The type of the
 *     listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @param {EVENTOBJ} eventObject The event object to fire.
 * @return {boolean} Whether all listeners succeeded without
 *     attempting to prevent default behavior. If any listener returns
 *     false or called goog.events.Event#preventDefault, this returns
 *     false.
 * @template EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.fireListeners = function(
    type, capture, eventObject) {
  'use strict';
  // TODO(chrishenry): Original code avoids array creation when there
  // is no listener, so we do the same. If this optimization turns
  // out to be not required, we can replace this with
  // getListeners(type, capture) instead, which is simpler.
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if (!listenerArray) {
    return true;
  }
  listenerArray = listenerArray.concat();

  var rv = true;
  for (var i = 0; i < listenerArray.length; ++i) {
    var listener = listenerArray[i];
    // We might not have a listener if the listener was removed.
    if (listener && !listener.removed && listener.capture == capture) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;

      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv;
    }
  }

  return rv && !eventObject.defaultPrevented;
};


/**
 * @param {string|!goog.events.EventId} type The type of the listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @return {!Array<!goog.events.ListenableKey>} An array of registered
 *     listeners.
 * @template EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  'use strict';
  return this.eventTargetListeners_.getListeners(String(type), capture);
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>} type The name of the event
 *     without the 'on' prefix.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener The
 *     listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {?goog.events.ListenableKey} the found listener or null if not found.
 * @template SCOPE,EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  'use strict';
  return this.eventTargetListeners_.getListener(
      String(type), listener, capture, opt_listenerScope);
};


/**
 * @param {string|!goog.events.EventId<EVENTOBJ>=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble
 *     listeners.
 * @return {boolean} Whether there is any active listeners matching
 *     the requested type and/or capture phase.
 * @template EVENTOBJ
 * @override
 */
goog.events.EventTarget.prototype.hasListener = function(
    opt_type, opt_capture) {
  'use strict';
  var id = (opt_type !== undefined) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture);
};


/**
 * Sets the target to be used for `event.target` when firing
 * event. Mainly used for testing. For example, see
 * `goog.testing.events.mixinListenable`.
 * @param {!Object} target The target.
 */
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  'use strict';
  this.actualEventTarget_ = target;
};


/**
 * Asserts that the event target instance is initialized properly.
 * @private
 */
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  'use strict';
  goog.asserts.assert(
      this.eventTargetListeners_,
      'Event target is not initialized. Did you call the superclass ' +
          '(goog.events.EventTarget) constructor?');
};


/**
 * Dispatches the given event on the ancestorsTree.
 *
 * @param {!Object} target The target to dispatch on.
 * @param {goog.events.Event|Object|string} e The event object.
 * @param {Array<goog.events.Listenable>=} opt_ancestorsTree The ancestors
 *     tree of the target, in reverse order from the closest ancestor
 *     to the root event target. May be null if the target has no ancestor.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 * @private
 */
goog.events.EventTarget.dispatchEventInternal_ = function(
    target, e, opt_ancestorsTree) {
  'use strict';
  /** @suppress {missingProperties} */
  var type = e.type || /** @type {string} */ (e);

  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (typeof e === 'string') {
    e = new goog.events.Event(e, target);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(type, target);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || target;
  }

  var rv = true, currentTarget;

  // Executes all capture listeners on the ancestors, if any.
  if (opt_ancestorsTree) {
    for (var i = opt_ancestorsTree.length - 1;
         !e.hasPropagationStopped() && i >= 0; i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv;
    }
  }

  // Executes capture and bubble listeners on the target.
  if (!e.hasPropagationStopped()) {
    currentTarget = /** @type {?} */ (e.currentTarget = target);
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if (!e.hasPropagationStopped()) {
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  // Executes all bubble listeners on the ancestors, if any.
  if (opt_ancestorsTree) {
    for (i = 0; !e.hasPropagationStopped() && i < opt_ancestorsTree.length;
         i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  return rv;
};
