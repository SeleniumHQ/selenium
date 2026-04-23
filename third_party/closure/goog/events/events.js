/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An event manager for both native browser event
 * targets and custom JavaScript event targets
 * (`goog.events.Listenable`). This provides an abstraction
 * over browsers' event systems.
 *
 * It also provides a simulation of W3C event model's capture phase in
 * Internet Explorer (IE 8 and below). Caveat: the simulation does not
 * interact well with listeners registered directly on the elements
 * (bypassing goog.events) or even with listeners registered via
 * goog.events in a separate JS binary. In these cases, we provide
 * no ordering guarantees.
 *
 * The listeners will receive a "patched" event object. Such event object
 * contains normalized values for certain event properties that differs in
 * different browsers.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */

// IMPLEMENTATION NOTES:
// goog.events stores an auxiliary data structure on each EventTarget
// source being listened on. This allows us to take advantage of GC,
// having the data structure GC'd when the EventTarget is GC'd. This
// GC behavior is equivalent to using W3C DOM Events directly.

goog.provide('goog.events');
goog.provide('goog.events.CaptureSimulationMode');
goog.provide('goog.events.Key');
goog.provide('goog.events.ListenableType');

goog.require('goog.asserts');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Listenable');
goog.require('goog.events.ListenerMap');
goog.requireType('goog.debug.ErrorHandler');
goog.requireType('goog.events.EventId');
goog.requireType('goog.events.EventLike');
goog.requireType('goog.events.EventWrapper');
goog.requireType('goog.events.ListenableKey');
goog.requireType('goog.events.Listener');


/**
 * @typedef {number|goog.events.ListenableKey}
 */
goog.events.Key;


/**
 * @typedef {EventTarget|goog.events.Listenable}
 */
goog.events.ListenableType;


/**
 * Property name on a native event target for the listener map
 * associated with the event target.
 * @private @const {string}
 */
goog.events.LISTENER_MAP_PROP_ = 'closure_lm_' + ((Math.random() * 1e6) | 0);


/**
 * String used to prepend to IE event types.
 * @const
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed "on<eventname>" strings for IE event types. Caching
 * this removes an extra object allocation in goog.events.listen which
 * improves IE6 performance.
 * @const
 * @dict
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * @enum {number} Different capture simulation mode for IE8-.
 */
goog.events.CaptureSimulationMode = {
  /**
   * Does not perform capture simulation. Will asserts in IE8- when you
   * add capture listeners.
   */
  OFF_AND_FAIL: 0,

  /**
   * Does not perform capture simulation, silently ignore capture
   * listeners.
   */
  OFF_AND_SILENT: 1,

  /**
   * Performs capture simulation.
   */
  ON: 2
};


/**
 * @define {number} The capture simulation mode for IE8-. By default,
 *     this is ON.
 */
goog.events.CAPTURE_SIMULATION_MODE =
    goog.define('goog.events.CAPTURE_SIMULATION_MODE', 2);


/**
 * Estimated count of total native listeners.
 * @private {number}
 */
goog.events.listenerCountEstimate_ = 0;


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. A listener can only be added once
 * to an object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array<string>|
 *     !goog.events.EventId<EVENTOBJ>|!Array<!goog.events.EventId<EVENTOBJ>>}
 *     type Event type or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {(boolean|!AddEventListenerOptions)=} opt_options
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T,EVENTOBJ
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.listen = function(src, type, listener, opt_options, opt_handler) {
  'use strict';
  if (opt_options && opt_options.once) {
    return goog.events.listenOnce(
        src, type, listener, opt_options, opt_handler);
  }
  if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_options, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    var capture =
        goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;
    return src.listen(
        /** @type {string|!goog.events.EventId} */ (type), listener, capture,
        opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {!EventTarget} */ (src), type, listener,
        /* callOnce */ false, opt_options, opt_handler);
  }
};


/**
 * Adds an event listener for a specific event on a native event
 * target. A listener can only be added once to an object and if it
 * is added again the key for the listener is returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {EventTarget} src The node to listen to events on.
 * @param {string|?goog.events.EventId<EVENTOBJ>} type Event type.
 * @param {!Function} listener Callback function.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener or otherwise.
 * @param {(boolean|!AddEventListenerOptions)=} opt_options
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template EVENTOBJ
 * @private
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.listen_ = function(
    src, type, listener, callOnce, opt_options, opt_handler) {
  'use strict';
  if (!type) {
    throw new Error('Invalid event type');
  }

  var capture =
      goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;

  var listenerMap = goog.events.getListenerMap_(src);
  if (!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap =
        new goog.events.ListenerMap(src);
  }

  var listenerObj = /** @type {goog.events.Listener} */ (
      listenerMap.add(type, listener, callOnce, capture, opt_handler));

  // If the listenerObj already has a proxy, it has been set up
  // previously. We simply return.
  if (listenerObj.proxy) {
    return listenerObj;
  }

  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;

  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  proxy.src = src;
  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  proxy.listener = listenerObj;

  // Attach the proxy through the browser's API
  if (src.addEventListener) {
    // Don't pass an object as `capture` if the browser doesn't support that.
    if (!goog.events.BrowserFeature.PASSIVE_EVENTS) {
      opt_options = capture;
    }
    // Don't break tests that expect a boolean.
    if (opt_options === undefined) opt_options = false;
    src.addEventListener(type.toString(), proxy, opt_options);
  } else if (src.attachEvent) {
    // The else if above used to be an unconditional else. It would call
    // attachEvent come gws or high water. This would sometimes throw an
    // exception on IE11, spoiling the day of some callers. The previous
    // incarnation of this code, from 2007, indicates that it replaced an
    // earlier still version that caused excess allocations on IE6.
    src.attachEvent(goog.events.getOnString_(type.toString()), proxy);
  } else if (src.addListener && src.removeListener) {
    // In IE, MediaQueryList uses addListener() insteadd of addEventListener. In
    // Safari, there is no global for the MediaQueryList constructor, so we just
    // check whether the object "looks like" MediaQueryList.
    goog.asserts.assert(
        type === 'change', 'MediaQueryList only has a change event');
    src.addListener(proxy);
  } else {
    throw new Error('addEventListener and attachEvent are unavailable.');
  }

  goog.events.listenerCountEstimate_++;
  return listenerObj;
};


/**
 * Helper function for returning a proxy function.
 * @return {!Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  'use strict';
  const proxyCallbackFunction = goog.events.handleBrowserEvent_;
  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  const f = function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject);
  };
  return f;
};


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. After the event has fired the event
 * listener is removed from the target.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array<string>|
 *     !goog.events.EventId<EVENTOBJ>|!Array<!goog.events.EventId<EVENTOBJ>>}
 *     type Event type or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method.
 * @param {(boolean|!AddEventListenerOptions)=} opt_options
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T,EVENTOBJ
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.listenOnce = function(
    src, type, listener, opt_options, opt_handler) {
  'use strict';
  if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_options, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    var capture =
        goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;
    return src.listenOnce(
        /** @type {string|!goog.events.EventId} */ (type), listener, capture,
        opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {!EventTarget} */ (src), type, listener,
        /* callOnce */ true, opt_options, opt_handler);
  }
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.Listenable}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.Listenable} src The target to
 *     listen to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(this:T, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T
 */
goog.events.listenWithWrapper = function(
    src, wrapper, listener, opt_capt, opt_handler) {
  'use strict';
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {string|Array<string>|
 *     !goog.events.EventId<EVENTOBJ>|!Array<!goog.events.EventId<EVENTOBJ>>}
 *     type Event type or array of event types to unlisten to.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {(boolean|!EventListenerOptions)=} opt_options
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 * @template EVENTOBJ
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.unlisten = function(src, type, listener, opt_options, opt_handler) {
  'use strict';
  if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_options, opt_handler);
    }
    return null;
  }
  var capture =
      goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten(
        /** @type {string|!goog.events.EventId} */ (type), listener, capture,
        opt_handler);
  }

  if (!src) {
    // TODO(chrishenry): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return false;
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {!EventTarget} */ (src));
  if (listenerMap) {
    var listenerObj = listenerMap.getListener(
        /** @type {string|!goog.events.EventId} */ (type), listener, capture,
        opt_handler);
    if (listenerObj) {
      return goog.events.unlistenByKey(listenerObj);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.Key} key The key returned by listen() for this
 *     event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.unlistenByKey = function(key) {
  'use strict';
  // TODO(chrishenry): Remove this check when tests that rely on this
  // are fixed.
  if (typeof key === 'number') {
    return false;
  }

  var listener = key;
  if (!listener || listener.removed) {
    return false;
  }

  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return /** @type {!goog.events.Listenable} */ (src).unlistenByKey(listener);
  }

  var type = listener.type;
  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  var proxy = listener.proxy;
  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture);
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  } else if (src.addListener && src.removeListener) {
    src.removeListener(proxy);
  }
  goog.events.listenerCountEstimate_--;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {!EventTarget} */ (src));
  // TODO(chrishenry): Try to remove this conditional and execute the
  // first branch always. This should be safe.
  if (listenerMap) {
    listenerMap.removeByKey(listener);
    if (listenerMap.getTypeCount() == 0) {
      // Null the src, just because this is simple to do (and useful
      // for IE <= 7).
      listenerMap.src = null;
      // We don't use delete here because IE does not allow delete
      // on a window object.
      src[goog.events.LISTENER_MAP_PROP_] = null;
    }
  } else {
    /** @type {!goog.events.Listener} */ (listener).markAsRemoved();
  }

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(
    src, wrapper, listener, opt_capt, opt_handler) {
  'use strict';
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Removes all listeners from an object. You can also optionally
 * remove listeners of a particular type.
 *
 * @param {Object|undefined} obj Object to remove listeners from. Must be an
 *     EventTarget or a goog.events.Listenable.
 * @param {string|!goog.events.EventId=} opt_type Type of event to remove.
 *     Default is all types.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(obj, opt_type) {
  'use strict';
  // TODO(chrishenry): Change the type of obj to
  // (!EventTarget|!goog.events.Listenable).

  if (!obj) {
    return 0;
  }

  if (goog.events.Listenable.isImplementedBy(obj)) {
    return /** @type {?} */ (obj).removeAllListeners(opt_type);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {!EventTarget} */ (obj));
  if (!listenerMap) {
    return 0;
  }

  var count = 0;
  var typeStr = opt_type && opt_type.toString();
  for (var type in listenerMap.listeners) {
    if (!typeStr || type == typeStr) {
      // Clone so that we don't need to worry about unlistenByKey
      // changing the content of the ListenerMap.
      var listeners = listenerMap.listeners[type].concat();
      for (var i = 0; i < listeners.length; ++i) {
        if (goog.events.unlistenByKey(listeners[i])) {
          ++count;
        }
      }
    }
  }
  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {!Array<!goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  'use strict';
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return /** @type {!goog.events.Listenable} */ (obj).getListeners(
        type, capture);
  } else {
    if (!obj) {
      // TODO(chrishenry): We should tighten the API to accept
      // !EventTarget|goog.events.Listenable, and add an assertion here.
      return [];
    }

    var listenerMap = goog.events.getListenerMap_(
        /** @type {!EventTarget} */ (obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : [];
  }
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.Listenable} src The target from
 *     which to get listeners.
 * @param {?string|!goog.events.EventId<EVENTOBJ>} type The type of the event.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 * @template EVENTOBJ
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  'use strict';
  // TODO(chrishenry): Change type from ?string to string, or add assertion.
  type = /** @type {string} */ (type);
  listener = goog.events.wrapListener(listener);
  var capture = !!opt_capt;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler);
  }

  if (!src) {
    // TODO(chrishenry): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return null;
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {!EventTarget} */ (src));
  if (listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler);
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.Listenable} obj Target to get
 *     listeners for.
 * @param {string|!goog.events.EventId=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  'use strict';
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {!EventTarget} */ (obj));
  return !!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  'use strict';
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Returns a string with on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  'use strict';
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  'use strict';
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return /** @type {!goog.events.Listenable} */ (obj).fireListeners(
        type, capture, eventObject);
  }

  return goog.events.fireListeners_(obj, type, capture, eventObject);
};


/**
 * Fires an object's listeners of a particular type and phase.
 * @param {Object} obj Object whose listeners to call.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  'use strict';
  /** @type {boolean} */
  var retval = true;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  if (listenerMap) {
    // TODO(chrishenry): Original code avoids array creation when there
    // is no listener, so we do the same. If this optimization turns
    // out to be not required, we can replace this with
    // listenerMap.getListeners(type, capture) instead, which is simpler.
    var listenerArray = listenerMap.listeners[type.toString()];
    if (listenerArray) {
      listenerArray = listenerArray.concat();
      for (var i = 0; i < listenerArray.length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && listener.capture == capture && !listener.removed) {
          var result = goog.events.fireListener(listener, eventObject);
          retval = retval && (result !== false);
        }
      }
    }
  }
  return retval;
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {*} Result of listener.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.fireListener = function(listener, eventObject) {
  'use strict';
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;

  if (listener.callOnce) {
    goog.events.unlistenByKey(listener);
  }
  return listenerFn.call(listenerHandler, eventObject);
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 * @deprecated This returns estimated count, now that Closure no longer
 * stores a central listener registry. We still return an estimation
 * to keep existing listener-related tests passing. In the near future,
 * this function will be removed.
 */
goog.events.getTotalListenerCount = function() {
  'use strict';
  return goog.events.listenerCountEstimate_;
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.Listenable} src The event target.
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  'use strict';
  goog.asserts.assert(
      goog.events.Listenable.isImplementedBy(src),
      'Can not use goog.events.dispatchEvent with ' +
          'non-goog.events.Listenable instance.');
  return src.dispatchEvent(e);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  'use strict';
  goog.events.handleBrowserEvent_ =
      errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {goog.events.Listener} listener The listener object.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {*} Result of the event handler.
 * @this {EventTarget} The object or Element that fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  'use strict';
  if (listener.removed) {
    return true;
  }

  // Otherwise, simply fire the listener.
  return goog.events.fireListener(
      listener, new goog.events.BrowserEvent(opt_evt, this));
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  'use strict';
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.

    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  'use strict';
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @private {number}
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 * @idGenerator {unique}
 */
goog.events.getUniqueId = function(identifier) {
  'use strict';
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


/**
 * @param {EventTarget} src The source object.
 * @return {goog.events.ListenerMap} A listener map for the given
 *     source object, or null if none exists.
 * @private
 */
goog.events.getListenerMap_ = function(src) {
  'use strict';
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  // IE serializes the property as well (e.g. when serializing outer
  // HTML). So we must check that the value is of the correct type.
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null;
};


/**
 * Expando property for listener function wrapper for Object with
 * handleEvent.
 * @private @const {string}
 */
goog.events.LISTENER_WRAPPER_PROP_ =
    '__closure_events_fn_' + ((Math.random() * 1e9) >>> 0);


/**
 * @param {Object|Function} listener The listener function or an
 *     object that contains handleEvent method.
 * @return {!Function} Either the original function or a function that
 *     calls obj.handleEvent. If the same listener is passed to this
 *     function more than once, the same function is guaranteed to be
 *     returned.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.events.wrapListener = function(listener) {
  'use strict';
  goog.asserts.assert(listener, 'Listener can not be null.');

  if (typeof listener === 'function') {
    return listener;
  }

  goog.asserts.assert(
      listener.handleEvent, 'An object listener must have handleEvent method.');
  if (!listener[goog.events.LISTENER_WRAPPER_PROP_]) {
    listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
      'use strict';
      return /** @type {?} */ (listener).handleEvent(e);
    };
  }
  return listener[goog.events.LISTENER_WRAPPER_PROP_];
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      'use strict';
      goog.events.handleBrowserEvent_ =
          transformer(goog.events.handleBrowserEvent_);
    });
