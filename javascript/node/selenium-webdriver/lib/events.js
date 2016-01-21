// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

/**
 * Describes an event listener registered on an {@linkplain EventEmitter}.
 */
class Listener {
  /**
   * @param {!Function} fn The acutal listener function.
   * @param {(Object|undefined)} scope The object in whose scope to invoke the
   *     listener.
   * @param {boolean} oneshot Whether this listener should only be used once.
   */
  constructor(fn, scope, oneshot) {
    Object.defineProperties(this, {
      fn: {value: fn},
      scope: {value: scope},
      oneshot: {value: oneshot}
    });
  }
}


/** @type {!WeakMap<!EventEmitter, !Map<string, !Set<!Listener>>>} */
const EVENTS = new WeakMap;


/**
 * Object that can emit events for others to listen for.
 */
class EventEmitter {
  /**
   * Fires an event and calls all listeners.
   * @param {string} type The type of event to emit.
   * @param {...*} var_args Any arguments to pass to each listener.
   */
  emit(type, var_args) {
    let events = EVENTS.get(this);
    if (!events) {
      return;
    }

    let args = Array.prototype.slice.call(arguments, 1);

    let listeners = events.get(type);
    if (listeners) {
      for (let listener of listeners) {
        listener.fn.apply(listener.scope, args);
        if (listener.oneshot) {
          listeners.delete(listener);
        }
      }
    }
  }

  /**
   * Returns a mutable list of listeners for a specific type of event.
   * @param {string} type The type of event to retrieve the listeners for.
   * @return {!Set<!Listener>} The registered listeners for the given event
   *     type.
   */
  listeners(type) {
    let events = EVENTS.get(this);
    if (!events) {
      events = new Map;
      EVENTS.set(this, events);
    }

    let listeners = events.get(type);
    if (!listeners) {
      listeners = new Set;
      events.set(type, listeners);
    }
    return listeners;
  }

  /**
   * Registers a listener.
   * @param {string} type The type of event to listen for.
   * @param {!Function} fn The function to invoke when the event is fired.
   * @param {Object=} opt_self The object in whose scope to invoke the listener.
   * @param {boolean=} opt_oneshot Whether the listener should b (e removed after
   *    the first event is fired.
   * @return {!EventEmitter} A self reference.
   * @private
   */
  addListener_(type, fn, opt_self, opt_oneshot) {
    let listeners = this.listeners(type);
    for (let listener of listeners) {
      if (listener.fn === fn) {
        return this;
      }
    }
    listeners.add(new Listener(fn, opt_self || undefined, !!opt_oneshot));
    return this;
  }

  /**
   * Registers a listener.
   * @param {string} type The type of event to listen for.
   * @param {!Function} fn The function to invoke when the event is fired.
   * @param {Object=} opt_self The object in whose scope to invoke the listener.
   * @return {!EventEmitter} A self reference.
   */
  addListener(type, fn, opt_self) {
    return this.addListener_(type, fn, opt_self, false);
  }

  /**
   * Registers a one-time listener which will be called only the first time an
   * event is emitted, after which it will be removed.
   * @param {string} type The type of event to listen for.
   * @param {!Function} fn The function to invoke when the event is fired.
   * @param {Object=} opt_self The object in whose scope to invoke the listener.
   * @return {!EventEmitter} A self reference.
   */
  once(type, fn, opt_self) {
    return this.addListener_(type, fn, opt_self, true);
  }

  /**
   * An alias for {@link #addListener() addListener()}.
   * @param {string} type The type of event to listen for.
   * @param {!Function} fn The function to invoke when the event is fired.
   * @param {Object=} opt_self The object in whose scope to invoke the listener.
   * @return {!EventEmitter} A self reference.
   */
  on(type, fn, opt_self) {
    return this.addListener(type, fn, opt_self);
  }

  /**
   * Removes a previously registered event listener.
   * @param {string} type The type of event to unregister.
   * @param {!Function} listenerFn The handler function to remove.
   * @return {!EventEmitter} A self reference.
   */
  removeListener(type, listenerFn) {
    if (typeof type !== 'string' || typeof listenerFn !== 'function') {
      throw TypeError('invalid args: expected (string, function), got ('
          + (typeof type) + ', ' + (typeof listenerFn) + ')');
    }

    let events = EVENTS.get(this);
    if (!events) {
      return this;
    }

    let listeners = events.get(type);
    if (!listeners) {
      return this;
    }

    let match;
    for (let listener of listeners) {
      if (listener.fn === listenerFn) {
        match = listener;
        break;
      }
    }
    if (match) {
      listeners.delete(match);
      if (!listeners.size) {
        events.delete(type);
      }
    }
    return this;
  }

  /**
   * Removes all listeners for a specific type of event. If no event is
   * specified, all listeners across all types will be removed.
   * @param {string=} opt_type The type of event to remove listeners from.
   * @return {!EventEmitter} A self reference.
   */
  removeAllListeners(opt_type) {
    let events = EVENTS.get(this);
    if (events) {
      if (typeof opt_type === 'string') {
        events.delete(opt_type);
      } else {
        EVENTS.delete(this);
      }
    }
    return this;
  }
}


// PUBLIC API


exports.EventEmitter = EventEmitter;
exports.Listener = Listener;
