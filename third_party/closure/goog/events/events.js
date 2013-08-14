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
 * @fileoverview Event Manager.
 *
 * Provides an abstracted interface to the browsers' event
 * systems. This uses an indirect lookup of listener functions to avoid circular
 * references between DOM (in IE) or XPCOM (in Mozilla) objects which leak
 * memory. This makes it easier to write OO Javascript/DOM code.
 *
 * It simulates capture & bubble in Internet Explorer.
 *
 * The listeners will also automagically have their event objects patched, so
 * your handlers don't need to worry about the browser.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * goog.events.removeAll();
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @supported IE6+, FF1.5+, WebKit, Opera.
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */


// This uses 3 lookup tables/trees.
// listenerTree_ is a tree of type -> capture -> src uid -> [Listener]
// listeners_ is a map of key -> [Listener]
//
// The key is a field of the Listener. The Listener class also has the type,
// capture and the src so one can always trace back in the tree
//
// sources_: src uid -> [Listener]


goog.provide('goog.events');
goog.provide('goog.events.Key');
goog.provide('goog.events.ListenableType');

goog.require('goog.array');
goog.require('goog.asserts');
/** @suppress {extraRequire} */
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Listenable');
goog.require('goog.events.Listener');
goog.require('goog.object');


/**
 * @typedef {number|goog.events.ListenableKey}
 */
goog.events.Key;


/**
 * @typedef {EventTarget|goog.events.Listenable}
 */
goog.events.ListenableType;


/**
 * Container for storing event listeners and their proxies
 * @private {!Object.<goog.events.ListenableKey>}
 */
goog.events.listeners_ = {};


/**
 * The root of the listener tree
 * @private
 * @type {Object}
 */
goog.events.listenerTree_ = {};


/**
 * Lookup for mapping source UIDs to listeners.
 * @private
 * @type {Object}
 */
goog.events.sources_ = {};


/**
 * String used to prepend to IE event types.  Not a constant so that it is not
 * inlined.
 * @type {string}
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed on strings for IE event types. Caching this removes an extra
 * object allocation in goog.events.listen which improves IE6 performance.
 * @type {Object}
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * Separator used to split up the various parts of an event key, to help avoid
 * the possibilities of collisions.
 * @type {string}
 * @private
 */
goog.events.keySeparator_ = '_';


/**
 * Adds an event listener for a specific event on a DOM Node or an
 * object that has implemented {@link goog.events.Listenable}. A
 * listener can only be added once to an object and if it is added
 * again the key for the listener is returned. Note that if the
 * existing listener is a one-off listener (registered via
 * listenOnce), it will no longer be a one-off listener after a call
 * to listen().
 *
 * @param {goog.events.ListenableType} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var listenableKey;
  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listen(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  } else {
    listenableKey = goog.events.listen_(
        /** @type {EventTarget} */ (src),
        type, listener, /* callOnce */ false, opt_capt, opt_handler);
  }

  return listenableKey;
};


/**
 * Adds an event listener for a specific event on a DOM Node or an object that
 * has implemented {@link goog.events.Listenable}. A listener can only be
 * added once to an object and if it is added again the key for the listener
 * is returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {EventTarget} src The node to listen to events on.
 * @param {?string} type Event type or array of event types.
 * @param {!Function} listener Callback function.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener or otherwise.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @private
 */
goog.events.listen_ = function(
    src, type, listener, callOnce, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  }

  var capture = !!opt_capt;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    map[type] = {count_: 0, remaining_: 0};
  }
  map = map[type];

  if (!(capture in map)) {
    map[capture] = {count_: 0, remaining_: 0};
    map.count_++;
  }
  map = map[capture];

  var srcUid = goog.getUid(src);
  var listenerArray, listenerObj;

  // The remaining_ property is used to be able to short circuit the iteration
  // of the event listeners.
  //
  // Increment the remaining event listeners to call even if this event might
  // already have been fired. At this point we do not know if the event has
  // been fired and it is too expensive to find out. By incrementing it we are
  // guaranteed that we will not skip any event listeners.
  map.remaining_++;

  // Do not use srcUid in map here since that will cast the number to a
  // string which will allocate one string object.
  if (!map[srcUid]) {
    listenerArray = map[srcUid] = [];
    map.count_++;
  } else {
    listenerArray = map[srcUid];
    // Ensure that the listeners do not already contain the current listener
    for (var i = 0; i < listenerArray.length; i++) {
      listenerObj = listenerArray[i];
      if (listenerObj.listener == listener &&
          listenerObj.handler == opt_handler) {

        // If this listener has been removed we should not return its key. It
        // is OK that we create new listenerObj below since the removed one
        // will be cleaned up later.
        if (listenerObj.removed) {
          break;
        }

        if (!callOnce) {
          // Ensure that, if there is an existing callOnce listener, it is no
          // longer a callOnce listener.
          listenerArray[i].callOnce = false;
        }

        // We already have this listener. Return its key.
        return listenerArray[i];
      }
    }
  }

  var proxy = goog.events.getProxy();
  listenerObj = new goog.events.Listener(
      listener, proxy, src, type, capture, opt_handler);
  listenerObj.callOnce = callOnce;

  proxy.src = src;
  proxy.listener = listenerObj;

  listenerArray.push(listenerObj);

  if (!goog.events.sources_[srcUid]) {
    goog.events.sources_[srcUid] = [];
  }
  goog.events.sources_[srcUid].push(listenerObj);

  // Attach the proxy through the browser's API
  if (src.addEventListener) {
    src.addEventListener(type, proxy, capture);
  } else {
    // The else above used to be else if (src.attachEvent) and then there was
    // another else statement that threw an exception warning the developer
    // they made a mistake. This resulted in an extra object allocation in IE6
    // due to a wrapper object that had to be implemented around the element
    // and so was removed.
    src.attachEvent(goog.events.getOnString_(type), proxy);
  }

  var key = listenerObj.key;
  goog.events.listeners_[key] = listenerObj;
  return listenerObj;
};


/**
 * Helper function for returning a proxy function.
 * @return {Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  // Use a local var f to prevent one allocation.
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ?
      function(eventObject) {
        return proxyCallbackFunction.call(f.src, f.listener, eventObject);
      } :
      function(eventObject) {
        var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
        // NOTE(user): In IE, we hack in a capture phase. However, if
        // there is inline event handler which tries to prevent default (for
        // example <a href="..." onclick="return false">...</a>) in a
        // descendant element, the prevent default will be overridden
        // by this listener if this listener were to return true. Hence, we
        // return undefined.
        if (!v) return v;
      };
  return f;
};


/**
 * Adds an event listener for a specific event on a DomNode or an object that
 * has implemented {@link goog.events.Listenable}. After the event has fired
 * the event listener is removed from the target.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {goog.events.ListenableType} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var listenableKey;
  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listenOnce(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  } else {
    listenableKey = goog.events.listen_(
        /** @type {EventTarget} */ (src),
        type, listener, /* callOnce */ true, opt_capt, opt_handler);
  }

  return listenableKey;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.Listenable}. A listener can
 * only be added once to an object.
 *
 * @param {goog.events.ListenableType} src The target to listen to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {goog.events.ListenableType} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  }

  var capture = !!opt_capt;

  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (!listenerArray) {
    return false;
  }

  for (var i = 0; i < listenerArray.length; i++) {
    if (listenerArray[i].listener == listener &&
        listenerArray[i].capture == capture &&
        listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i]);
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
 */
goog.events.unlistenByKey = function(key) {
  // TODO(user): Remove this check when tests that rely on this
  // are fixed.
  if (goog.isNumber(key)) {
    return false;
  }

  var listener = /** @type {goog.events.ListenableKey} */ (key);
  if (!listener) {
    return false;
  }
  if (listener.removed) {
    return false;
  }

  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener);
  }

  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;

  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, capture);
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }

  var srcUid = goog.getUid(src);

  // In a perfect implementation we would decrement the remaining_ field here
  // but then we would need to know if the listener has already been fired or
  // not. We therefore skip doing this and in this uncommon case the entire
  // ancestor chain will need to be traversed as before.

  // Remove from sources_
  if (goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if (sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid];
    }
  }

  listener.markAsRemoved();

  // There are some esoteric situations where the hash code of an object
  // can change, and we won't be able to find the listenerArray anymore.
  // For example, if you're listening on a window, and the user navigates to
  // a different window, the UID will disappear.
  //
  // It should be impossible to ever find the original listenerArray, so it
  // doesn't really matter if we can't clean it up in this case.
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];
  if (listenerArray) {
    listenerArray.needsCleanup_ = true;
    goog.events.cleanUp_(type, capture, srcUid, listenerArray);
  }

  delete goog.events.listeners_[listener.key];

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {goog.events.ListenableType} src The target to stop listening to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Cleans up goog.events internal data structure. This should be
 * called by all implementations of goog.events.Listenable when
 * removing listeners.
 *
 * TODO(user): Once we remove numeric key support from
 * goog.events.listen and friend, we will be able to remove this
 * requirement.
 *
 * @param {goog.events.ListenableKey} listenableKey The key to clean up.
 */
goog.events.cleanUp = function(listenableKey) {
  delete goog.events.listeners_[listenableKey.key];
};


/**
 * Cleans up the listener array as well as the listener tree
 * @param {string} type  The type of the event.
 * @param {boolean} capture Whether to clean up capture phase listeners instead
 *     bubble phase listeners.
 * @param {number} srcUid  The unique ID of the source.
 * @param {Array.<goog.events.Listener>} listenerArray The array being cleaned.
 * @private
 */
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  // The listener array gets locked during the dispatch phase so that removals
  // of listeners during this phase does not screw up the indeces. This method
  // is called after we have removed a listener as well as after the dispatch
  // phase in case any listeners were removed.
  if (!listenerArray.locked_) { // catches both 0 and not set
    if (listenerArray.needsCleanup_) {
      // Loop over the listener array and remove listeners that have removed set
      // to true. This could have been done with filter or something similar but
      // we want to change the array in place and we want to minimize
      // allocations. Adding a listener during this phase adds to the end of the
      // array so that works fine as long as the length is rechecked every in
      // iteration.
      for (var oldIndex = 0, newIndex = 0;
           oldIndex < listenerArray.length;
           oldIndex++) {
        if (listenerArray[oldIndex].removed) {
          continue;
        }
        if (oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex];
        }
        newIndex++;
      }
      listenerArray.length = newIndex;

      listenerArray.needsCleanup_ = false;

      // In case the length is now zero we release the object.
      if (newIndex == 0) {
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;

        if (goog.events.listenerTree_[type][capture].count_ == 0) {
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--;
        }

        if (goog.events.listenerTree_[type].count_ == 0) {
          delete goog.events.listenerTree_[type];
        }
      }

    }
  }
};


/**
 * Removes all listeners from an object. You can also optionally
 * remove listeners of a particular type.
 *
 * @param {Object=} opt_obj Object to remove listeners from. Not
 *     specifying opt_obj is now DEPRECATED (it used to remove all
 *     registered listeners).
 * @param {string=} opt_type Type of event to, default is all types.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type) {
  var count = 0;

  var noObj = opt_obj == null;
  var noType = opt_type == null;

  if (!noObj) {
    if (opt_obj && goog.events.Listenable.isImplementedBy(opt_obj)) {
      return opt_obj.removeAllListeners(opt_type);
    }

    var srcUid = goog.getUid(/** @type {Object} */ (opt_obj));
    if (goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for (var i = sourcesArray.length - 1; i >= 0; i--) {
        var listener = sourcesArray[i];
        if (noType || opt_type == listener.type) {
          goog.events.unlistenByKey(listener);
          count++;
        }
      }
    }
  } else {
    goog.object.forEach(goog.events.listeners_, function(listener) {
      goog.events.unlistenByKey(listener);
      count++;
    });
  }

  return count;
};


/**
 * Removes all native listeners registered via goog.events. Native
 * listeners are listeners on native browser objects (such as DOM
 * elements). In particular, goog.events.Listenable and
 * goog.events.EventTarget listeners will NOT be removed.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAllNativeListeners = function() {
  var count = 0;
  goog.object.forEach(goog.events.listeners_, function(listener) {
    var src = listener.src;
    // Only remove the listener if it is not on custom event target.
    if (!goog.events.Listenable.isImplementedBy(src)) {
      goog.events.unlistenByKey(listener);
      count++;
    }
  });
  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture);
  } else {
    return goog.events.getListeners_(obj, type, capture) || [];
  }
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {?string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>?} Array of listener objects.
 *     Returns null if object has no listeners of that type.
 * @private
 */
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if (map[objUid]) {
        return map[objUid];
      }
    }
  }

  return null;
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {goog.events.ListenableType} src The target from which to get
 *     listeners.
 * @param {?string} type The name of the event without the 'on' prefix.
 * @param {Function|Object} listener The listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;

  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(
        /** @type {string} */ (type), listener, capture, opt_handler);
  }

  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; i++) {
      // If goog.events.unlistenByKey is called during an event dispatch
      // then the listener array won't get cleaned up and there might be
      // 'removed' listeners in the list. Ignore those.
      if (!listenerArray[i].removed &&
          listenerArray[i].listener == listener &&
          listenerArray[i].capture == capture &&
          listenerArray[i].handler == opt_handler) {
        // We already have this listener. Return its key.
        return listenerArray[i];
      }
    }
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {goog.events.ListenableType} obj Target to get listeners for.
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }

  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];

  if (listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);

    if (hasType && hasCapture) {
      // Lookup in the listener tree whether the specified listener exists.
      var map = goog.events.listenerTree_[opt_type];
      return !!map && !!map[opt_capture] && objUid in map[opt_capture];

    } else if (!(hasType || hasCapture)) {
      // Simple check for whether the event target has any listeners at all.
      return true;

    } else {
      // Iterate through the listeners for the event target to find a match.
      return goog.array.some(listeners, function(listener) {
        return (hasType && listener.type == opt_type) ||
               (hasCapture && listener.capture == opt_capture);
      });
    }
  }

  return false;
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
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
 * Returns a string wth on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type strng.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject);
  }

  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type,
                                        capture, eventObject);
    }
  }
  return true;
};


/**
 * Fires an object's listeners of a particular type and phase.
 *
 * @param {Object} map Object with listeners in it.
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;

  var objUid = goog.getUid(obj);
  if (map[objUid]) {
    var remaining = --map.remaining_;
    var listenerArray = map[objUid];

    // If locked_ is not set (and if already 0) initialize it to 1.
    if (!listenerArray.locked_) {
      listenerArray.locked_ = 1;
    } else {
      listenerArray.locked_++;
    }

    try {
      // Events added in the dispatch phase should not be dispatched in
      // the current dispatch phase. They will be included in the next
      // dispatch phase though.
      var length = listenerArray.length;
      for (var i = 0; i < length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    } finally {
      // Allow the count of targets remaining to increase (if perhaps we have
      // added listeners) but do not allow it to decrease if we have reentered
      // this method through a listener dispatching the same event type,
      // resetting and exhausted the remaining count.
      map.remaining_ = Math.max(remaining, map.remaining_);
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray);
    }
  }

  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
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
 */
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_);
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
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {goog.events.Listener} listener The listener object.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {goog.events.EventTarget|Object} The object or Element that
 *     fired the event. TODO(user): Figure out why the type is
 *     so weird?
 * @private
 */
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if (listener.removed) {
    return true;
  }

  var type = listener.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }
  map = map[type];
  var retval, targetsMap;
  // Synthesize event propagation if the browser does not support W3C
  // event model.
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));

    // Check if we have any capturing event listeners for this type.
    var hasCapture = true in map;
    var hasBubble = false in map;

    if (hasCapture) {
      if (goog.events.isMarkedIeEvent_(ieEvent)) {
        return true;
      }

      goog.events.markIeEvent_(ieEvent);
    }

    var evt = new goog.events.BrowserEvent();
    // TODO(user): update @this for this function
    evt.init(ieEvent, /** @type {EventTarget} */ (this));

    retval = true;
    try {
      if (hasCapture) {
        var ancestors = [];

        for (var parent = evt.currentTarget;
             parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;

        // Call capture listeners
        for (var i = ancestors.length - 1;
             !evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                               true, evt);
        }

        if (hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;

          // Call bubble listeners
          for (var i = 0;
               !evt.propagationStopped_ && i < ancestors.length &&
               targetsMap.remaining_;
               i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                                 false, evt);
          }
        }

      } else {
        // Bubbling, let IE handle the propagation.
        retval = goog.events.fireListener(listener, evt);
      }

    } finally {
      if (ancestors) {
        ancestors.length = 0;
      }
    }
    return retval;
  } // IE

  // Caught a non-IE DOM event. 1 additional argument which is the event object
  var be = new goog.events.BrowserEvent(
      opt_evt, /** @type {EventTarget} */ (this));
  retval = goog.events.fireListener(listener, be);
  return retval;
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
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
    /** @preserveTry */
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
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @type {number}
 * @private
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 * @idGenerator
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


/**
 * Expando property for listener function wrapper for Object with
 * handleEvent.
 * @type {string}
 * @private
 */
goog.events.LISTENER_WRAPPER_PROP_ = '__closure_events_fn_' +
    ((Math.random() * 1e9) >>> 0);


/**
 * @param {Object|Function} listener The listener function or an
 *     object that contains handleEvent method.
 * @return {!Function} Either the original function or a function that
 *     calls obj.handleEvent. If the same listener is passed to this
 *     function more than once, the same function is guaranteed to be
 *     returned.
 * @private
 */
goog.events.wrapListener_ = function(listener) {
  goog.asserts.assert(listener, 'Listener can not be null.');

  if (goog.isFunction(listener)) {
    return listener;
  }

  goog.asserts.assert(
      listener.handleEvent, 'An object listener must have handleEvent method.');
  return listener[goog.events.LISTENER_WRAPPER_PROP_] ||
      (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
        return listener.handleEvent(e);
      });
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.events.handleBrowserEvent_ = transformer(
          goog.events.handleBrowserEvent_);
    });
