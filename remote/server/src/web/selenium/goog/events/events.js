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
 * @fileoverview Event Manager
 *
 * Provides an abstracted interface to the browsers' event systems. Based on
 * Aaron's listen(), this uses an indirect lookup of listener functions to
 * avoid circular references between DOM (in IE) or XPCOM (in Mozilla) objects
 * which leak memory. This makes it easier to write OO Javascript/DOM code.
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
 * @supported IE6, IE7, FF1.5+, Safari, Opera 9 (key codes are problematic in
 * Safari and Opera, preventDefault is also not properly patched in Safari.)
 */


// This uses 3 lookup tables/trees.
// listenerTree_ is a tree of type -> capture -> src hash code -> [Listener]
// listeners_ is a map of key -> [Listener]
//
// The key is a field of the Listener. The Listener class also has the type,
// capture and the src so one can always trace back in the tree
//
// sources_: src hc -> [Listener]


goog.provide('goog.events');
goog.provide('goog.events.EventType');

goog.require('goog.array');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Listener');
goog.require('goog.object');
goog.require('goog.structs.SimplePool');
goog.require('goog.userAgent');


/**
 * Container for storing event listeners and their proxies
 * @private
 * @type {Object}
 */
goog.events.listeners_ = {};


/**
 * The root of the listener tree
 * @private
 * @type {Object}
 */
goog.events.listenerTree_ = {};


/**
 * Lookup for mapping source hash codes to listeners
 * @private
 * @type {Object}
 */
goog.events.sources_ = {};


/**
 * Initial count for the objectPool_
 * @type {number}
 */
goog.events.OBJECT_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the objectPool_
 * @type {number}
 */
goog.events.OBJECT_POOL_MAX_COUNT = 600;


/**
 * SimplePool to cache the lookup objects. This was implemented to make IE6
 * performance better and removed an object allocation in goog.events.listen
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.objectPool_ = new goog.structs.SimplePool(
    goog.events.OBJECT_POOL_INITIAL_COUNT,
    goog.events.OBJECT_POOL_MAX_COUNT);


// Override to add the count_ fields
goog.events.objectPool_.setCreateObjectFn(function() {
  return {count_: 0};
});


// Override dispose method to prevent for in loop.
goog.events.objectPool_.setDisposeObjectFn(function(obj) {
  obj.count_ = 0;
});


/**
 * Initial count for the arrayPool_
 * @type {number}
 */
goog.events.ARRAY_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the arrayPool_
 * @type {number}
 */
goog.events.ARRAY_POOL_MAX_COUNT = 600;


/**
 * SimplePool to cache the type arrays. This was implemented to make IE6
 * performance better and removed an object allocation in goog.events.listen
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.arrayPool_ = new goog.structs.SimplePool(
    goog.events.ARRAY_POOL_INITIAL_COUNT,
    goog.events.ARRAY_POOL_MAX_COUNT);


// Override create function to return an array.
goog.events.arrayPool_.setCreateObjectFn(function() {
  return [];
});


// Override dispose method to prevent for in loop.
goog.events.arrayPool_.setDisposeObjectFn(function(obj) {
  obj.length = 0;
  delete obj.locked_;
  delete obj.needsCleanup_;
});


/**
 * Initial count for the handleEventProxyPool_
 * @type {number}
 */
goog.events.HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the handleEventProxyPool_
 * @type {number}
 */
goog.events.HANDLE_EVENT_PROXY_POOL_MAX_COUNT = 600;


/**
 * SimplePool to cache the handle event proxy. This was implemented to make IE6
 * performance better and removed an object allocation in goog.events.listen
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.handleEventProxyPool_ = new goog.structs.SimplePool(
    goog.events.HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT,
    goog.events.HANDLE_EVENT_PROXY_POOL_MAX_COUNT);
goog.events.handleEventProxyPool_.setCreateObjectFn(function() {
  // Use a local var f to prevent one allocation.
  var f = function(eventObject) {
    return goog.events.handleBrowserEvent_.call(f.src, f.key, eventObject);
  };
  return f;
});


/**
 * Initial count for the listenerPool_
 * @type {number}
 */
goog.events.LISTENER_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the listenerPool_
 * @type {number}
 */
goog.events.LISTENER_POOL_MAX_COUNT = 600;


/**
 * Function for creating a listener for goog.events.listenerPool_. This could
 * be an anonymous function below but the JSCompiler seems to have a bug where
 * it thinks goog.events.Listener is not referenced if it's only referenced from
 * the anonymous function.
 * @return {goog.events.Listener} A new listener.
 * @private
 */
goog.events.createListenerFunction_ = function() {
  return new goog.events.Listener();
};


/**
 * SimplePool to cache the listener objects. This was implemented to make IE6
 * performance better and removed an object allocation in goog.events.listen
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.listenerPool_ = new goog.structs.SimplePool(
    goog.events.LISTENER_POOL_INITIAL_COUNT,
    goog.events.LISTENER_POOL_MAX_COUNT);
goog.events.listenerPool_.setCreateObjectFn(
    goog.events.createListenerFunction_);


/**
 * Initial count for the eventPool_
 * @type {number}
 */
goog.events.EVENT_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the eventPool_
 * @type {number}
 */
goog.events.EVENT_POOL_MAX_COUNT = 600;


/**
 * Function for creating an event for goog.events.eventPool_.
 * @type {Function}
 * @private
 */
goog.events.createEventFunction_ = function() {
  return new goog.events.BrowserEvent();
};


/**
 * Created the BrowserEvent object pool.
 * @return {goog.structs.SimplePool?} The event pool for IE browsers,
 *     null for other browsers.
 * @private
 */
goog.events.createEventPool_ = function() {
  var eventPool = null;
  if (goog.userAgent.IE) {
    eventPool = new goog.structs.SimplePool(
      goog.events.EVENT_POOL_INITIAL_COUNT,
      goog.events.EVENT_POOL_MAX_COUNT);
    eventPool.setCreateObjectFn(goog.events.createEventFunction_);
  }
  return eventPool;
};


/**
 * SimplePool to cache the event objects. This was implemented to make IE6
 * performance better and removed an object allocation in
 * goog.events.handleBrowserEvent_ when in steady state.
 * This pool is only used for IE events.
 * @type {goog.structs.SimplePool?}
 * @private
 */
goog.events.eventPool_ = goog.events.createEventPool_();


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
 * Adds an event listener for a specific event on a DOM Node or an object that
 * has implemented {@link goog.events.EventTarget}. A listener can only be
 * added once to an object and if it is added again the key for the listener
 * is returned.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean} opt_capt Fire in capture phase?.
 * @param {Object} opt_handler Element in who's scope to call the listener.
 * @return {number?} Unique key for the listener.
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  } else if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var capture = !!opt_capt;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    map[type] = goog.events.objectPool_.getObject();
  }
  map = map[type];

  if (!(capture in map)) {
    map[capture] = goog.events.objectPool_.getObject();
    map.count_++;
  }
  map = map[capture];

  var srcHashCode = goog.getHashCode(src);
  var listenerArray, listenerObj;
  // Do not use srcHashCode in map here since that will cast the number to a
  // string which will allocate one string object.
  if (!map[srcHashCode]) {
    listenerArray = map[srcHashCode] = goog.events.arrayPool_.getObject();
    map.count_++;
  } else {
    listenerArray = map[srcHashCode];
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

        // We already have this listener. Return its key.
        return listenerArray[i].key;
      }
    }
  }

  var proxy = goog.events.handleEventProxyPool_.getObject();
  proxy.src = src;

  listenerObj = goog.events.listenerPool_.getObject();
  listenerObj.init(listener, proxy, src, type, capture, opt_handler);
  var key = listenerObj.key;
  proxy.key = key;

  listenerArray.push(listenerObj);
  goog.events.listeners_[key] = listenerObj;

  if (!goog.events.sources_[srcHashCode]) {
    goog.events.sources_[srcHashCode] = goog.events.arrayPool_.getObject();
  }
  goog.events.sources_[srcHashCode].push(listenerObj);


  // Attach the proxy through the browser's API
  if (src.addEventListener) {
    if (src == goog.global || !src.customEvent_) {
      src.addEventListener(type, proxy, capture);
    }
  } else {
    // The else above used to be else if (src.attachEvent) and then there was
    // another else statement that threw an exception warning the developer
    // they made a mistake. This resulted in an extra object allocation in IE6
    // due to a wrapper object that had to be implemented around the element
    // and so was removed.
    src.attachEvent(goog.events.getOnString_(type), proxy);
  }

  return key;
};


/**
 * Adds an event listener for a specific event on a DomNode or an object that
 * has implemented {@link goog.events.EventTarget}. After the event has fired
 * the event listener is removed from the target.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function} listener Callback method.
 * @param {boolean} opt_capt Fire in capture phase?.
 * @param {Object} opt_handler Element in who's scope to call the listener.
 * @return {number?} Unique key for the listener.
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key;
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {Function} listener The listener function to remove.
 * @param {boolean} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object} opt_handler Element in who's scope to call the listener.
 * @return {boolean?} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
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
      return goog.events.unlistenByKey(listenerArray[i].key);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {number} key The key returned by listen() for this event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // Do not use key in listeners here since that will cast the number to a
  // string which will allocate one string object.
  if (!goog.events.listeners_[key]) {
    return false;
  }
  var listener = goog.events.listeners_[key];

  if (listener.removed) {
    return false;
  }

  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;

  if (src.removeEventListener) {
    // EventTarget calls unlisten so we need to ensure that the source is not
    // an event target to prevent re-entry.
    if (src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture);
    }
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }

  var srcHashCode = goog.getHashCode(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcHashCode];

  // Remove from sources_
  if (goog.events.sources_[srcHashCode]) {
    var sourcesArray = goog.events.sources_[srcHashCode];
    goog.array.remove(sourcesArray, listener);
    if (sourcesArray.length == 0) {
      delete goog.events.sources_[srcHashCode];
    }
  }

  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcHashCode, listenerArray);

  delete goog.events.listeners_[key];

  return true;
};


/**
 * Cleans up the listener array as well as the listener tree
 * @param {string} type  The type of the event.
 * @param {boolean} capture Whether to clean up capture phase listeners instead
 *     bubble phase listeners.
 * @param {number} srcHashCode  The hash code of the source.
 * @param {Array.<goog.events.Listener>} listenerArray The array being cleaned.
 * @private
 */
goog.events.cleanUp_ = function(type, capture, srcHashCode, listenerArray) {
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
          goog.events.listenerPool_.releaseObject(listenerArray[oldIndex]);
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
        goog.events.arrayPool_.releaseObject(listenerArray);
        delete goog.events.listenerTree_[type][capture][srcHashCode];
        goog.events.listenerTree_[type][capture].count_--;

        if (goog.events.listenerTree_[type][capture].count_ == 0) {
          goog.events.objectPool_.releaseObject(
              goog.events.listenerTree_[type][capture]);
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--;
        }

        if (goog.events.listenerTree_[type].count_ == 0) {
          goog.events.objectPool_.releaseObject(
              goog.events.listenerTree_[type]);
          delete goog.events.listenerTree_[type];
        }
      }

    }
  }
};


/**
 * Removes all listeners from an object, if no object is specified it will
 * remove all listeners that have been registered.  You can also optionally
 * remove listeners of a particular type or capture phase.
 *
 * @param {Object} opt_obj Object to remove listeners from.
 * @param {string} opt_type Type of event to, default is all types.
 * @param {boolean} opt_capt Whether to remove the listeners from the capture or
 * bubble phase.  If unspecified, will remove both.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;

  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;

  if (!noObj) {
    var srcHashCode = goog.getHashCode(/** @type {Object} */ (opt_obj));
    if (goog.events.sources_[srcHashCode]) {
      var sourcesArray = goog.events.sources_[srcHashCode];
      for (var i = sourcesArray.length - 1; i >= 0; i--) {
        var listener = sourcesArray[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    }
  } else {
    // Loop over the sources_ map instead of over the listeners_ since it is
    // smaller and will results in less allocations.
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        var listener = listeners[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    });
  }

  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase. This is
 * considerably faster than goog.events.getAllListeners.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || [];
};


/**
 * Gets the listeners for a given object, type and capture phase. This is
 * considerably faster than goog.events.getAllListeners.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>?} Array of listener objects.
 *     Returns null if object has no lsiteners of that type.
 * @private
 */
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objHashCode = goog.getHashCode(obj);
      if (map[objHashCode]) {
        return map[objHashCode];
      }
    }
  }

  return null;
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to stop
 *     listening to events on.
 * @param {string} type The name of the event without the 'on' prefix.
 * @param {Function} listener The listener function to remove.
 * @param {boolean} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object} opt_handler Element in who's scope to call the listener.
 * @return {goog.events.Listener?} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; i++) {
      if (listenerArray[i].listener == listener &&
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
 * Returns whether an object has a listener matching the type and capture phase.
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {boolean} Whether an object has a listener matching the type and
 *    capture phase.
 */
goog.events.hasListener = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objHashCode = goog.getHashCode(obj);
      if (map[objHashCode]) {
        return true;
      }
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
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',

  // Misc
  LOAD: 'load',
  UNLOAD: 'unload',
  HELP: 'help',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  READYSTATECHANGE: 'readystatechange',
  CONTEXTMENU: 'contextmenu'
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
 * @param {Object} obj Object who's listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var retval = 1;

  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objHashCode = goog.getHashCode(obj);
      if (map[objHashCode]) {
        var listenerArray = map[objHashCode];

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
          listenerArray.locked_--;
          goog.events.cleanUp_(type, capture, objHashCode, listenerArray);
        }
      }
    }
  }

  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.event.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener.key);
  }
  return rv;
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 */
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_)
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
 * @param {goog.events.EventTarget} src  The event target.
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
goog.events.dispatchEvent = function(src, e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, src);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(e.type, src);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || src;
  }

  var rv = 1, ancestors;

  var type = e.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }

  map = map[type];
  var hasCapture = true in map;
  var hasBubble = false in map;

  if (hasCapture) {
    // Build ancestors now
    ancestors = [];
    for (var parent = src; parent; parent = parent.getParentEventTarget()) {
      ancestors.push(parent);
    }

    // Call capture listeners
    for (var i = ancestors.length - 1;
         !e.propagationStopped_ && i >= 0; i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners(ancestors[i], e.type, true, e) &&
            e.returnValue_ != false;
    }
  }

  if (hasBubble) {

    if (hasCapture) { // We have the ancestors.
      // Call bubble listeners
      for (var i = 0; !e.propagationStopped_ && i < ancestors.length; i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners(ancestors[i], e.type, false, e) &&
              e.returnValue_ != false;
      }
    } else {
      // In case we don't have capture we don't have to build up the
      // ancestors array.

      for (var current = src; !e.propagationStopped_ && current;
           current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners(current, e.type, false, e) &&
              e.returnValue_ != false;
      }
    }
  }

  return Boolean(rv);
};

/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * "this" is the object or Element that fired the event
 *
 * @param {string} key Unique key for the listener.
 * @param {Object} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @private
 */
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  // If the listener isn't there it was probably removed when processing
  // another listener on the same event (e.g. the later listener is
  // not managed by GoogJSL so that they are both fired under IE)
  if (!goog.events.listeners_[key]) {
    return true;
  }

  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }
  map = map[type];
  var retval;
  if (goog.userAgent.IE) {
    var ieEvent = opt_evt || goog.getObjectByName('window.event');

    // Check if we have any capturing event listeners for this type.
    var hasCapture = true in map;

    if (hasCapture) {
      if (goog.events.isMarkedIeEvent_(ieEvent)) {
        return true;
      }

      goog.events.markIeEvent_(ieEvent);
    }

    var srcHashCode = goog.getHashCode(listener.src);

    var evt = goog.events.eventPool_.getObject();
    evt.init(ieEvent, this);

    retval = true;
    try {
      if (hasCapture) {
        // Use a pool so we don't allocate a new array
        var ancestors = goog.events.arrayPool_.getObject();

        for (var parent = evt.currentTarget;
             parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        // Call capture listeners
        for (var i = ancestors.length - 1;
             !evt.propagationStopped_ && i >= 0;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners(ancestors[i], type, true, evt);
        }

        // Call bubble listeners
        for (var i = 0; !evt.propagationStopped_ && i < ancestors.length; i++) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners(ancestors[i], type, false, evt);
        }

      } else {
        // Bubbling, let IE handle the propagation.
        retval = goog.events.fireListener(listener, evt);
      }

    } finally {
      if (ancestors) {
        ancestors.length = 0;
        goog.events.arrayPool_.releaseObject(ancestors);
      }
      evt.dispose();
      goog.events.eventPool_.releaseObject(evt);
    }
    return retval;
  } // IE

  // Caught a non-IE DOM event. 1 additional argument which is the event object
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be);
  } finally {
    be.dispose();
  }
  return retval;
};


/**
 * This is used to mark the IE event object so we do not do the GoogJSL pass
 * twice for a bubbling event.
 * @param {Object} e  The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // GoogJSL events sets the keyCode or the returnValue

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

  if (useReturnValue || e.returnValue == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the GoogJSL
 * system so we do not do the GoogJSL pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};
