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

goog.module('goog.events.eventTargetTester');
goog.setTestOnly();

const GoogEventsEvent = goog.require('goog.events.Event');
const GoogEventsEventTarget = goog.require('goog.events.EventTarget');
const GoogEventsListenable = goog.require('goog.events.Listenable');
const googArray = goog.require('goog.array');
const recordFunction = goog.require('goog.testing.recordFunction');
/** @suppress {extraRequire} */
goog.require('goog.testing.asserts');

let dispatchEvent;
let eventTargets;
let getListener;
let getListeners;
let hasListener;
let keyType;
let listen;
let listenOnce;
let listenableFactory;
let listeners;
let objectTypeListenerSupported;
let removeAll;
let unlisten;
let unlistenByKey;
let unlistenReturnType;

/**
 * The maximum number of initialized event targets (in eventTargets
 * array) and listeners (in listeners array).
 * @type {number}
 * @private
 */
const MAX_INSTANCE_COUNT = 10;

/**
 * The number of times a listener should have been executed. This
 * exists to make assertListenerIsCalled more readable.  This is used
 * like so: assertListenerIsCalled(listener, times(2));
 * @param {number} n The number of times a listener should have been
 *     executed.
 * @return {number} The number n.
 */
function times(n) {
  return n;
}

/**
 * Creates a listener that executes the given function (optional).
 * @param {!Function=} opt_listenerFn The optional function to execute.
 * @return {!Function} The listener function.
 */
function createListener(opt_listenerFn) {
  return recordFunction(opt_listenerFn);
}

/**
 * Asserts that the given listener is called numCount number of times.
 * @param {!Function} listener The listener to check.
 * @param {number} numCount The number of times. See also the times()
 *     function below.
 */
function assertListenerIsCalled(listener, numCount) {
  assertEquals(
      'Listeners is not called the correct number of times.', numCount,
      listener.getCallCount());
  listener[exports.ALREADY_CHECKED_PROP] = true;
  listener[exports.NUM_CALLED_PROP] = numCount;
}


/**
 * Asserts that no other listeners, other than those verified via
 * assertListenerIsCalled, have been called since the last
 * resetListeners().
 */
function assertNoOtherListenerIsCalled() {
  googArray.forEach(listeners, function(l, index) {
    if (!l[exports.ALREADY_CHECKED_PROP]) {
      assertEquals(
          'Listeners ' + index + ' is unexpectedly called.', 0,
          l.getCallCount());
    } else {
      assertEquals(
          'Listeners ' + index + ' is unexpectedly called.',
          l[exports.NUM_CALLED_PROP], l.getCallCount());
    }
  });
}


/**
 * Resets all listeners call count to 0.
 */
function resetListeners() {
  googArray.forEach(listeners, function(l) {
    l.reset();
    l[exports.ALREADY_CHECKED_PROP] = false;
  });
}


/**
 * The type of key returned by key-returning functions (listen).
 * @enum {number}
 */
const KeyType = {
  /**
   * Returns number for key.
   */
  NUMBER: 0,

  /**
   * Returns undefined (no return value).
   */
  UNDEFINED: 1
};

/**
 * The type of unlisten function's return value.
 * @enum {number}
 */
const UnlistenReturnType = {
  /**
   * Returns boolean indicating whether unlisten is successful.
   */
  BOOLEAN: 0,

  /**
   * Returns undefind (no return value).
   */
  UNDEFINED: 1
};

/**
 * Contains test event types.
 * @enum {string}
 */
var EventType = {
  A: goog.events.getUniqueId('a'),
  B: goog.events.getUniqueId('b'),
  C: goog.events.getUniqueId('c')
};

/**
 * Custom event object for testing.
 * @final
 */
class TestEvent extends GoogEventsEvent {
  constructor() {
    super(EventType.A);
  }
}

exports = {
  assertListenerIsCalled,
  assertNoOtherListenerIsCalled,
  createListener,
  times,
  resetListeners,

  /** @return {!Array<?>} */
  getListeners() {
    return listeners;
  },

  /** @return {!Array<?>} */
  getTargets() {
    return eventTargets;
  },

  /**
   * Setup step for the test functions. This needs to be called from the
   * test setUp.
   * @param {function():!GoogEventsListenable} listenableFactoryFn Function
   *     that will return a new Listenable instance each time it is called.
   * @param {Function} listenFn Function that, given the same signature
   *     as goog.events.listen, will add listener to the given event
   *     target.
   * @param {Function} unlistenFn Function that, given the same
   *     signature as goog.events.unlisten, will remove listener from
   *     the given event target.
   * @param {Function} unlistenByKeyFn Function that, given 2
   *     parameters: src and key, will remove the corresponding
   *     listener.
   * @param {Function} listenOnceFn Function that, given the same
   *     signature as goog.events.listenOnce, will add a one-time
   *     listener to the given event target.
   * @param {Function} dispatchEventFn Function that, given the same
   *     signature as goog.events.dispatchEvent, will dispatch the event
   *     on the given event target.
   * @param {Function} removeAllFn Function that, given the same
   *     signature as goog.events.removeAll, will remove all listeners
   *     according to the contract of goog.events.removeAll.
   * @param {Function} getListenersFn Function that, given the same
   *     signature as goog.events.getListeners, will retrieve listeners.
   * @param {Function} getListenerFn Function that, given the same
   *     signature as goog.events.getListener, will retrieve the
   *     listener object.
   * @param {Function} hasListenerFn Function that, given the same
   *     signature as goog.events.hasListener, will determine whether
   *     listeners exist.
   * @param {KeyType} listenKeyType The
   *     key type returned by listen call.
   * @param {UnlistenReturnType}
   *     unlistenFnReturnType
   *     Whether we should check return value from
   *     unlisten call. If unlisten does not return a value, this should
   *     be set to false.
   * @param {boolean} objectListenerSupported Whether listener of type
   *     Object is supported.
   */
  setUp(
      listenableFactoryFn, listenFn, unlistenFn, unlistenByKeyFn, listenOnceFn,
      dispatchEventFn, removeAllFn, getListenersFn, getListenerFn,
      hasListenerFn, listenKeyType, unlistenFnReturnType,
      objectListenerSupported) {
    listenableFactory = listenableFactoryFn;
    listen = listenFn;
    unlisten = unlistenFn;
    unlistenByKey = unlistenByKeyFn;
    listenOnce = listenOnceFn;
    dispatchEvent = dispatchEventFn;
    removeAll = removeAllFn;
    getListeners = getListenersFn;
    getListener = getListenerFn;
    hasListener = hasListenerFn;
    keyType = listenKeyType;
    unlistenReturnType = unlistenFnReturnType;
    objectTypeListenerSupported = objectListenerSupported;

    listeners = [];
    for (var i = 0; i < MAX_INSTANCE_COUNT; i++) {
      listeners[i] = createListener();
    }

    eventTargets = [];
    for (i = 0; i < MAX_INSTANCE_COUNT; i++) {
      eventTargets[i] = listenableFactory();
    }
  },


  /**
   * Teardown step for the test functions. This needs to be called from
   * test teardown.
   */
  tearDown() {
    for (var i = 0; i < MAX_INSTANCE_COUNT; i++) {
      goog.dispose(eventTargets[i]);
    }
  },

  /** @const */
  KeyType,

  /** @const */
  EventType,


  /** @const */
  UnlistenReturnType,

  /** @const */
  TestEvent,

  /**
   * Expando property used on "listener" function to determine if a
   * listener has already been checked. This is what allows us to
   * implement assertNoOtherListenerIsCalled.
   * @type {string}
   */
  ALREADY_CHECKED_PROP: '__alreadyChecked',


  /**
   * Expando property used on "listener" function to record the number
   * of times it has been called the last time assertListenerIsCalled is
   * done. This allows us to verify that it has not been called more
   * times in assertNoOtherListenerIsCalled.
   */
  NUM_CALLED_PROP: '__numCalled',

  commonTests: {
    testNoListener() {
      dispatchEvent(eventTargets[0], EventType.A);
      assertNoOtherListenerIsCalled();
    },

    testOneListener() {
      listen(eventTargets[0], EventType.A, listeners[0]);
      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertNoOtherListenerIsCalled();

      resetListeners();

      dispatchEvent(eventTargets[0], EventType.B);
      dispatchEvent(eventTargets[0], EventType.C);
      assertNoOtherListenerIsCalled();
    },

    testTwoListenersOfSameType() {
      var key1 = listen(eventTargets[0], EventType.A, listeners[0]);
      var key2 = listen(eventTargets[0], EventType.A, listeners[1]);

      if (keyType == KeyType.NUMBER) {
        assertNotEquals(key1, key2);
      } else {
        assertUndefined(key1);
        assertUndefined(key2);
      }

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertNoOtherListenerIsCalled();
    },

    testInstallingSameListeners() {
      var key1 = listen(eventTargets[0], EventType.A, listeners[0]);
      var key2 = listen(eventTargets[0], EventType.A, listeners[0]);
      var key3 = listen(eventTargets[0], EventType.B, listeners[0]);

      if (keyType == KeyType.NUMBER) {
        assertEquals(key1, key2);
        assertNotEquals(key1, key3);
      } else {
        assertUndefined(key1);
        assertUndefined(key2);
        assertUndefined(key3);
      }

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));

      dispatchEvent(eventTargets[0], EventType.B);
      assertListenerIsCalled(listeners[0], times(2));

      assertNoOtherListenerIsCalled();
    },

    testScope() {
      listeners[0] = createListener(function(e) {
        assertEquals('Wrong scope with undefined scope', eventTargets[0], this);
      });
      listeners[1] = createListener(function(e) {
        assertEquals('Wrong scope with null scope', eventTargets[0], this);
      });
      var scope = {};
      listeners[2] = createListener(function(e) {
        assertEquals('Wrong scope with specific scope object', scope, this);
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1], false, null);
      listen(eventTargets[0], EventType.A, listeners[2], false, scope);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
    },

    testDispatchEventDoesNotThrowWithDisposedEventTarget() {
      goog.dispose(eventTargets[0]);
      assertTrue(dispatchEvent(eventTargets[0], EventType.A));
    },

    testDispatchEventWithObjectLiteral() {
      listen(eventTargets[0], EventType.A, listeners[0]);

      assertTrue(dispatchEvent(eventTargets[0], {type: EventType.A}));
      assertListenerIsCalled(listeners[0], times(1));
      assertNoOtherListenerIsCalled();
    },

    testDispatchEventWithCustomEventObject() {
      listen(eventTargets[0], EventType.A, listeners[0]);

      var e = new TestEvent();
      assertTrue(dispatchEvent(eventTargets[0], e));
      assertListenerIsCalled(listeners[0], times(1));
      assertNoOtherListenerIsCalled();

      var actualEvent = listeners[0].getLastCall().getArgument(0);

      assertEquals(e, actualEvent);
      assertEquals(eventTargets[0], actualEvent.target);
    },

    testDisposingEventTargetRemovesListeners() {
      if (!(listenableFactory() instanceof GoogEventsEventTarget)) {
        return;
      }
      listen(eventTargets[0], EventType.A, listeners[0]);
      goog.dispose(eventTargets[0]);
      dispatchEvent(eventTargets[0], EventType.A);

      assertNoOtherListenerIsCalled();
    },


    /**
     * Unlisten/unlistenByKey should still work after disposal. There are
     * many circumstances when this is actually necessary. For example, a
     * user may have listened to an event target and stored the key
     * (e.g. in a goog.events.EventHandler) and only unlisten after the
     * target has been disposed.
     */
    testUnlistenWorksAfterDisposal() {
      var key = listen(eventTargets[0], EventType.A, listeners[0]);
      goog.dispose(eventTargets[0]);
      unlisten(eventTargets[0], EventType.A, listeners[1]);
      if (unlistenByKey) {
        unlistenByKey(eventTargets[0], key);
      }
    },

    testRemovingListener() {
      var ret1 = unlisten(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[0]);
      var ret2 = unlisten(eventTargets[0], EventType.A, listeners[1]);
      var ret3 = unlisten(eventTargets[0], EventType.B, listeners[0]);
      var ret4 = unlisten(eventTargets[1], EventType.A, listeners[0]);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));

      var ret5 = unlisten(eventTargets[0], EventType.A, listeners[0]);
      var ret6 = unlisten(eventTargets[0], EventType.A, listeners[0]);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));

      assertNoOtherListenerIsCalled();

      if (unlistenReturnType == UnlistenReturnType.BOOLEAN) {
        assertFalse(ret1);
        assertFalse(ret2);
        assertFalse(ret3);
        assertFalse(ret4);
        assertTrue(ret5);
        assertFalse(ret6);
      } else {
        assertUndefined(ret1);
        assertUndefined(ret2);
        assertUndefined(ret3);
        assertUndefined(ret4);
        assertUndefined(ret5);
        assertUndefined(ret6);
      }
    },

    testCapture() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      eventTargets[9].setParentEventTarget(eventTargets[0]);

      var ordering = 0;
      listeners[0] = createListener(function(e) {
        assertEquals(eventTargets[2], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('First capture listener is not called first', 0, ordering);
        ordering++;
      });
      listeners[1] = createListener(function(e) {
        assertEquals(eventTargets[1], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('2nd capture listener is not called 2nd', 1, ordering);
        ordering++;
      });
      listeners[2] = createListener(function(e) {
        assertEquals(eventTargets[0], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('3rd capture listener is not called 3rd', 2, ordering);
        ordering++;
      });

      listen(eventTargets[2], EventType.A, listeners[0], true);
      listen(eventTargets[1], EventType.A, listeners[1], true);
      listen(eventTargets[0], EventType.A, listeners[2], true);

      // These should not be called.
      listen(eventTargets[3], EventType.A, listeners[3], true);

      listen(eventTargets[0], EventType.B, listeners[4], true);
      listen(eventTargets[0], EventType.C, listeners[5], true);
      listen(eventTargets[1], EventType.B, listeners[6], true);
      listen(eventTargets[1], EventType.C, listeners[7], true);
      listen(eventTargets[2], EventType.B, listeners[8], true);
      listen(eventTargets[2], EventType.C, listeners[9], true);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
      assertNoOtherListenerIsCalled();
    },

    testBubble() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      eventTargets[9].setParentEventTarget(eventTargets[0]);

      var ordering = 0;
      listeners[0] = createListener(function(e) {
        assertEquals(eventTargets[0], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('First bubble listener is not called first', 0, ordering);
        ordering++;
      });
      listeners[1] = createListener(function(e) {
        assertEquals(eventTargets[1], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('2nd bubble listener is not called 2nd', 1, ordering);
        ordering++;
      });
      listeners[2] = createListener(function(e) {
        assertEquals(eventTargets[2], e.currentTarget);
        assertEquals(eventTargets[0], e.target);
        assertEquals('3rd bubble listener is not called 3rd', 2, ordering);
        ordering++;
      });

      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[1], EventType.A, listeners[1]);
      listen(eventTargets[2], EventType.A, listeners[2]);

      // These should not be called.
      listen(eventTargets[3], EventType.A, listeners[3]);

      listen(eventTargets[0], EventType.B, listeners[4]);
      listen(eventTargets[0], EventType.C, listeners[5]);
      listen(eventTargets[1], EventType.B, listeners[6]);
      listen(eventTargets[1], EventType.C, listeners[7]);
      listen(eventTargets[2], EventType.B, listeners[8]);
      listen(eventTargets[2], EventType.C, listeners[9]);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
      assertNoOtherListenerIsCalled();
    },

    testCaptureAndBubble() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      listen(eventTargets[0], EventType.A, listeners[0], true);
      listen(eventTargets[1], EventType.A, listeners[1], true);
      listen(eventTargets[2], EventType.A, listeners[2], true);

      listen(eventTargets[0], EventType.A, listeners[3]);
      listen(eventTargets[1], EventType.A, listeners[4]);
      listen(eventTargets[2], EventType.A, listeners[5]);

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
      assertListenerIsCalled(listeners[3], times(1));
      assertListenerIsCalled(listeners[4], times(1));
      assertListenerIsCalled(listeners[5], times(1));
      assertNoOtherListenerIsCalled();
    },

    testPreventDefaultByReturningFalse() {
      listeners[0] = createListener(function(e) {
        return false;
      });
      listeners[1] = createListener(function(e) {
        return true;
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);

      var result = dispatchEvent(eventTargets[0], EventType.A);
      assertFalse(result);
    },

    testPreventDefault() {
      listeners[0] = createListener(function(e) {
        e.preventDefault();
      });
      listeners[1] = createListener(function(e) {
        return true;
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);

      var result = dispatchEvent(eventTargets[0], EventType.A);
      assertFalse(result);
    },

    testPreventDefaultAtCapture() {
      listeners[0] = createListener(function(e) {
        e.preventDefault();
      });
      listeners[1] = createListener(function(e) {
        return true;
      });
      listen(eventTargets[0], EventType.A, listeners[0], true);
      listen(eventTargets[0], EventType.A, listeners[1], true);

      var result = dispatchEvent(eventTargets[0], EventType.A);
      assertFalse(result);
    },

    testStopPropagation() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      listeners[0] = createListener(function(e) {
        e.stopPropagation();
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[1], EventType.A, listeners[2]);
      listen(eventTargets[2], EventType.A, listeners[3]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertNoOtherListenerIsCalled();
    },

    testStopPropagation2() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      listeners[1] = createListener(function(e) {
        e.stopPropagation();
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[1], EventType.A, listeners[2]);
      listen(eventTargets[2], EventType.A, listeners[3]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertNoOtherListenerIsCalled();
    },

    testStopPropagation3() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      listeners[2] = createListener(function(e) {
        e.stopPropagation();
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[1], EventType.A, listeners[2]);
      listen(eventTargets[2], EventType.A, listeners[3]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
      assertNoOtherListenerIsCalled();
    },

    testStopPropagationAtCapture() {
      eventTargets[0].setParentEventTarget(eventTargets[1]);
      eventTargets[1].setParentEventTarget(eventTargets[2]);

      listeners[0] = createListener(function(e) {
        e.stopPropagation();
      });
      listen(eventTargets[2], EventType.A, listeners[0], true);
      listen(eventTargets[1], EventType.A, listeners[1], true);
      listen(eventTargets[0], EventType.A, listeners[2], true);
      listen(eventTargets[0], EventType.A, listeners[3]);
      listen(eventTargets[1], EventType.A, listeners[4]);
      listen(eventTargets[2], EventType.A, listeners[5]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertNoOtherListenerIsCalled();
    },

    testHandleEvent() {
      if (!objectTypeListenerSupported) {
        return;
      }

      var obj = {};
      obj.handleEvent = recordFunction();

      listen(eventTargets[0], EventType.A, obj);
      dispatchEvent(eventTargets[0], EventType.A);

      assertEquals(1, obj.handleEvent.getCallCount());
    },

    testListenOnce() {
      if (!listenOnce) {
        return;
      }

      listenOnce(eventTargets[0], EventType.A, listeners[0], true);
      listenOnce(eventTargets[0], EventType.A, listeners[1]);
      listenOnce(eventTargets[0], EventType.B, listeners[2]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(0));
      assertNoOtherListenerIsCalled();
      resetListeners();

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(0));
      assertListenerIsCalled(listeners[1], times(0));
      assertListenerIsCalled(listeners[2], times(0));

      dispatchEvent(eventTargets[0], EventType.B);
      assertListenerIsCalled(listeners[2], times(1));
      assertNoOtherListenerIsCalled();
    },

    testUnlistenInListen() {
      listeners[1] = createListener(function(e) {
        unlisten(eventTargets[0], EventType.A, listeners[1]);
        unlisten(eventTargets[0], EventType.A, listeners[2]);
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[0], EventType.A, listeners[2]);
      listen(eventTargets[0], EventType.A, listeners[3]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(0));
      assertListenerIsCalled(listeners[3], times(1));
      assertNoOtherListenerIsCalled();
      resetListeners();

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(0));
      assertListenerIsCalled(listeners[2], times(0));
      assertListenerIsCalled(listeners[3], times(1));
      assertNoOtherListenerIsCalled();
    },

    testUnlistenByKeyInListen() {
      if (!unlistenByKey) {
        return;
      }

      var key1, key2;
      listeners[1] = createListener(function(e) {
        unlistenByKey(eventTargets[0], key1);
        unlistenByKey(eventTargets[0], key2);
      });
      listen(eventTargets[0], EventType.A, listeners[0]);
      key1 = listen(eventTargets[0], EventType.A, listeners[1]);
      key2 = listen(eventTargets[0], EventType.A, listeners[2]);
      listen(eventTargets[0], EventType.A, listeners[3]);

      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(0));
      assertListenerIsCalled(listeners[3], times(1));
      assertNoOtherListenerIsCalled();
      resetListeners();

      dispatchEvent(eventTargets[0], EventType.A);
      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(0));
      assertListenerIsCalled(listeners[2], times(0));
      assertListenerIsCalled(listeners[3], times(1));
      assertNoOtherListenerIsCalled();
    },

    testSetParentEventTarget() {
      assertNull(eventTargets[0].getParentEventTarget());

      eventTargets[0].setParentEventTarget(eventTargets[1]);
      assertEquals(eventTargets[1], eventTargets[0].getParentEventTarget());
      assertNull(eventTargets[1].getParentEventTarget());

      eventTargets[0].setParentEventTarget(null);
      assertNull(eventTargets[0].getParentEventTarget());
    },

    testListenOnceAfterListenDoesNotChangeExistingListener() {
      if (!listenOnce) {
        return;
      }

      listen(eventTargets[0], EventType.A, listeners[0]);
      listenOnce(eventTargets[0], EventType.A, listeners[0]);

      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(3));
      assertNoOtherListenerIsCalled();
    },

    testListenOnceAfterListenOnceDoesNotChangeExistingListener() {
      if (!listenOnce) {
        return;
      }

      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      listenOnce(eventTargets[0], EventType.A, listeners[0]);

      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(1));
      assertNoOtherListenerIsCalled();
    },

    testListenAfterListenOnceRemoveOnceness() {
      if (!listenOnce) {
        return;
      }

      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[0]);

      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.A);

      assertListenerIsCalled(listeners[0], times(3));
      assertNoOtherListenerIsCalled();
    },

    testUnlistenAfterListenOnce() {
      if (!listenOnce) {
        return;
      }

      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      unlisten(eventTargets[0], EventType.A, listeners[0]);
      dispatchEvent(eventTargets[0], EventType.A);

      listen(eventTargets[0], EventType.A, listeners[0]);
      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      unlisten(eventTargets[0], EventType.A, listeners[0]);
      dispatchEvent(eventTargets[0], EventType.A);

      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      listen(eventTargets[0], EventType.A, listeners[0]);
      unlisten(eventTargets[0], EventType.A, listeners[0]);
      dispatchEvent(eventTargets[0], EventType.A);

      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      listenOnce(eventTargets[0], EventType.A, listeners[0]);
      unlisten(eventTargets[0], EventType.A, listeners[0]);
      dispatchEvent(eventTargets[0], EventType.A);

      assertNoOtherListenerIsCalled();
    },

    testRemoveAllWithType() {
      if (!removeAll) {
        return;
      }

      listen(eventTargets[0], EventType.A, listeners[0], true);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[0], EventType.C, listeners[2], true);
      listen(eventTargets[0], EventType.C, listeners[3]);
      listen(eventTargets[0], EventType.B, listeners[4], true);
      listen(eventTargets[0], EventType.B, listeners[5], true);
      listen(eventTargets[0], EventType.B, listeners[6]);
      listen(eventTargets[0], EventType.B, listeners[7]);

      assertEquals(4, removeAll(eventTargets[0], EventType.B));

      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.B);
      dispatchEvent(eventTargets[0], EventType.C);

      assertListenerIsCalled(listeners[0], times(1));
      assertListenerIsCalled(listeners[1], times(1));
      assertListenerIsCalled(listeners[2], times(1));
      assertListenerIsCalled(listeners[3], times(1));
      assertNoOtherListenerIsCalled();
    },

    testRemoveAll() {
      if (!removeAll) {
        return;
      }

      listen(eventTargets[0], EventType.A, listeners[0], true);
      listen(eventTargets[0], EventType.A, listeners[1]);
      listen(eventTargets[0], EventType.C, listeners[2], true);
      listen(eventTargets[0], EventType.C, listeners[3]);
      listen(eventTargets[0], EventType.B, listeners[4], true);
      listen(eventTargets[0], EventType.B, listeners[5], true);
      listen(eventTargets[0], EventType.B, listeners[6]);
      listen(eventTargets[0], EventType.B, listeners[7]);

      assertEquals(8, removeAll(eventTargets[0]));

      dispatchEvent(eventTargets[0], EventType.A);
      dispatchEvent(eventTargets[0], EventType.B);
      dispatchEvent(eventTargets[0], EventType.C);

      assertNoOtherListenerIsCalled();
    },

    testRemoveAllCallsMarkAsRemoved() {
      if (!removeAll) {
        return;
      }

      var key0 = listen(eventTargets[0], EventType.A, listeners[0]);
      var key1 = listen(eventTargets[1], EventType.A, listeners[1]);

      assertNotNullNorUndefined(key0.listener);
      assertFalse(key0.removed);
      assertNotNullNorUndefined(key1.listener);
      assertFalse(key1.removed);

      assertEquals(1, removeAll(eventTargets[0]));
      assertNull(key0.listener);
      assertTrue(key0.removed);
      assertNotNullNorUndefined(key1.listener);
      assertFalse(key1.removed);

      assertEquals(1, removeAll(eventTargets[1]));
      assertNull(key1.listener);
      assertTrue(key1.removed);
    },

    testGetListeners() {
      if (!getListeners) {
        return;
      }

      listen(eventTargets[0], EventType.A, listeners[0], true);
      listen(eventTargets[0], EventType.A, listeners[1], true);
      listen(eventTargets[0], EventType.A, listeners[2]);
      listen(eventTargets[0], EventType.A, listeners[3]);

      var l = getListeners(eventTargets[0], EventType.A, true);
      assertEquals(2, l.length);
      assertEquals(listeners[0], l[0].listener);
      assertEquals(listeners[1], l[1].listener);

      l = getListeners(eventTargets[0], EventType.A, false);
      assertEquals(2, l.length);
      assertEquals(listeners[2], l[0].listener);
      assertEquals(listeners[3], l[1].listener);

      l = getListeners(eventTargets[0], EventType.B, true);
      assertEquals(0, l.length);
    },

    testGetListener() {
      if (!getListener) {
        return;
      }

      listen(eventTargets[0], EventType.A, listeners[0], true);

      assertNotNull(
          getListener(eventTargets[0], EventType.A, listeners[0], true));
      assertNull(
          getListener(eventTargets[0], EventType.A, listeners[0], true, {}));
      assertNull(getListener(eventTargets[1], EventType.A, listeners[0], true));
      assertNull(getListener(eventTargets[0], EventType.B, listeners[0], true));
      assertNull(getListener(eventTargets[0], EventType.A, listeners[1], true));
    },

    testHasListener() {
      if (!hasListener) {
        return;
      }

      assertFalse(hasListener(eventTargets[0]));

      listen(eventTargets[0], EventType.A, listeners[0], true);

      assertTrue(hasListener(eventTargets[0]));
      assertTrue(hasListener(eventTargets[0], EventType.A));
      assertTrue(hasListener(eventTargets[0], EventType.A, true));
      assertTrue(hasListener(eventTargets[0], undefined, true));
      assertFalse(hasListener(eventTargets[0], EventType.A, false));
      assertFalse(hasListener(eventTargets[0], undefined, false));
      assertFalse(hasListener(eventTargets[0], EventType.B));
      assertFalse(hasListener(eventTargets[0], EventType.B, true));
      assertFalse(hasListener(eventTargets[1]));
    },

    testFiringEventBeforeDisposeInternalWorks() {
      /**
       * @extends {GoogEventsEventTarget}
       * @constructor
       * @final
       */
      var MockTarget = function() {
        MockTarget.base(this, 'constructor');
      };
      goog.inherits(MockTarget, GoogEventsEventTarget);

      MockTarget.prototype.disposeInternal = function() {
        dispatchEvent(this, EventType.A);
        MockTarget.base(this, 'disposeInternal');
      };

      var t = new MockTarget();
      try {
        listen(t, EventType.A, listeners[0]);
        t.dispose();
        assertListenerIsCalled(listeners[0], times(1));
      } catch (e) {
        goog.dispose(t);
      }
    },

    testLoopDetection() {
      var target = listenableFactory();
      target.setParentEventTarget(target);

      try {
        target.dispatchEvent('string');
        fail('expected error');
      } catch (e) {
        assertContains('infinite', e.message);
      }
    }
  }
};
