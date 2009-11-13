// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Event Simulation.
 *
 * Utility functions for simulating events at the Closure level. All functions
 * in this package generate events by calling goog.events.fireListeners,
 * rather than interfacing with the browser directly. This is intended for
 * testing purposes, and should not be used in production code.
 *
 * The decision to use Closure events and dispatchers instead of the browser's
 * native events and dispatchers was conscious and deliberate. Native event
 * dispatchers have their own set of quirks and edge cases. Pure JS dispatchers
 * are more robust and transparent.
 *
 * If you think you need a testing mechanism that uses native Event objects,
 * please, please email closure-tech first to explain your use case before you
 * sink time into this.
 *
 */

goog.provide('goog.testing.events');
goog.provide('goog.testing.events.Event');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('goog.userAgent');


/**
 * goog.events.BrowserEvent expects an Event so we provide one for JSCompiler.
 *
 * @param {string} type Event Type.
 * @param {Object} opt_target Reference to the object that is the target of this
 *     event.
 * @constructor
 * @extends {Event}
 */
goog.testing.events.Event = function(type, opt_target) {
  /**
   * Event type.
   * @type {string}
   */
  this.type = type;

  /**
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;
};
goog.object.extend(
    goog.testing.events.Event.prototype, goog.events.Event.prototype);


/**
 * Simulates a mousedown, mouseup, and then click on the given event target,
 * with the left mouse button.
 * @param {EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the sequence: false if preventDefault()
 *     was called on any of the events, true otherwise.
 */
goog.testing.events.fireClickSequence = function(target) {
  // Fire mousedown, mouseup, and click. Then return the bitwise AND of the 3.
  return !!(goog.testing.events.fireMouseDownEvent(target) &
            goog.testing.events.fireMouseUpEvent(target) &
            goog.testing.events.fireClickEvent(target));
};


/**
 * Simulates the sequence of events fired by the browser when the user double-
 * clicks the given target.
 * @param {EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the sequence: false if preventDefault()
 *     was called on any of the events, true otherwise.
 */
goog.testing.events.fireDoubleClickSequence = function(target) {
  // Fire mousedown, mouseup, click, mousedown, mouseup, click, dblclick.
  // Then return the bitwise AND of the 7.
  return !!(goog.testing.events.fireMouseDownEvent(target) &
            goog.testing.events.fireMouseUpEvent(target) &
            goog.testing.events.fireClickEvent(target) &
            // IE fires a selectstart instead of the second mousedown in a
            // dblclick, but we don't care about selectstart.
            (goog.userAgent.IE ||
             goog.testing.events.fireMouseDownEvent(target)) &
            goog.testing.events.fireMouseUpEvent(target) &
            // IE doesn't fire the second click in a dblclick.
            (goog.userAgent.IE ||
            goog.testing.events.fireClickEvent(target)) &
            goog.testing.events.fireDoubleClickEvent(target));
};


/**
 * Simulates a complete keystroke (keydown, keypress, and keyup). Note that
 * if preventDefault is called on the keydown, the keypress will not fire.
 *
 * @param {EventTarget} target The target for the event.
 * @param {number} keyCode The keycode of the key pressed.
 * @param {Object} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} The returnValue of the sequence: false if preventDefault()
 *     was called on any of the events, true otherwise.
 */
goog.testing.events.fireKeySequence = function(
    target, keyCode, opt_eventProperties) {
  var keydown =
      new goog.testing.events.Event(goog.events.EventType.KEYDOWN, target);
  var keyup =
      new goog.testing.events.Event(goog.events.EventType.KEYUP, target);
  var keypress =
      new goog.testing.events.Event(goog.events.EventType.KEYPRESS, target);
  keydown.keyCode = keyup.keyCode = keypress.keyCode = keyCode;

  if (opt_eventProperties) {
    goog.object.extend(keydown, opt_eventProperties);
    goog.object.extend(keyup, opt_eventProperties);
    goog.object.extend(keypress, opt_eventProperties);
  }

  // Fire keydown, keypress, and keyup. Note that if the keydown is
  // prevent-defaulted, then the keypress will not fire on IE.
  var result = goog.testing.events.fireBrowserEvent(keydown);
  if (goog.events.KeyCodes.firesKeyPressEvent(
          keyCode, undefined, keydown.shiftKey, keydown.ctrlKey,
          keydown.altKey) &&
      !(goog.userAgent.IE && !result)) {
    result &= goog.testing.events.fireBrowserEvent(keypress);
  }
  return !!(result & goog.testing.events.fireBrowserEvent(keyup));
};


/**
 * Simulates a mouseover event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {EventTarget} relatedTarget The related target for the event (e.g.,
 *     the node that the mouse is being moved out of).
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireMouseOverEvent = function(target, relatedTarget) {
  var mouseover =
      new goog.testing.events.Event(goog.events.EventType.MOUSEOVER, target);
  mouseover.relatedTarget = relatedTarget;
  return goog.testing.events.fireBrowserEvent(mouseover);
};


/**
 * Simulates a mousemove event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {goog.math.Coordinate} opt_coords Position of mouse.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireMouseMoveEvent = function(target, opt_coords) {
  var mousemove =
      new goog.testing.events.Event(goog.events.EventType.MOUSEMOVE, target);
  mousemove.clientX = opt_coords ? opt_coords.x : 0;
  mousemove.clientY = opt_coords ? opt_coords.y : 0;
  return goog.testing.events.fireBrowserEvent(mousemove);
};


/**
 * Simulates a mouseout event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {EventTarget} relatedTarget The related target for the event (e.g.,
 *     the node that the mouse is being moved into).
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireMouseOutEvent = function(target, relatedTarget) {
  var mouseout =
      new goog.testing.events.Event(goog.events.EventType.MOUSEOUT, target);
  mouseout.relatedTarget = relatedTarget;
  return goog.testing.events.fireBrowserEvent(mouseout);
};


/**
 * Simulates a mousedown event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton} opt_button Mouse button;
 *     defaults to {@code goog.events.BrowserEvent.MouseButton.LEFT}.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireMouseDownEvent = function(target, opt_button) {
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  var mousedown =
      new goog.testing.events.Event(goog.events.EventType.MOUSEDOWN, target);
  mousedown.button = goog.userAgent.IE ?
      goog.events.BrowserEvent.IEButtonMap_[button] : button;
  return goog.testing.events.fireBrowserEvent(mousedown);
};


/**
 * Simulates a mouseup event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton} opt_button Mouse button;
 *     defaults to {@code goog.events.BrowserEvent.MouseButton.LEFT}.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireMouseUpEvent = function(target, opt_button) {
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  var mouseup =
      new goog.testing.events.Event(goog.events.EventType.MOUSEUP, target);
  mouseup.button = goog.userAgent.IE ?
      goog.events.BrowserEvent.IEButtonMap_[button] : button;
  return goog.testing.events.fireBrowserEvent(mouseup);
};


/**
 * Simulates a click event on the given target.  IE only supports click with
 * the left mouse button.
 * @param {EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton} opt_button Mouse button;
 *     defaults to {@code goog.events.BrowserEvent.MouseButton.LEFT}.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireClickEvent = function(target, opt_button) {
  var click =
      new goog.testing.events.Event(goog.events.EventType.CLICK, target);
  click.button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  return goog.testing.events.fireBrowserEvent(click);
};


/**
 * Simulates a double-click event on the given target. Always double-clicks
 * with the left mouse button since no browser supports double-clicking with
 * any other buttons.
 * @param {EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireDoubleClickEvent = function(target) {
  var dblclick =
      new goog.testing.events.Event(goog.events.EventType.DBLCLICK, target);
  dblclick.button = goog.events.BrowserEvent.MouseButton.LEFT;
  return goog.testing.events.fireBrowserEvent(dblclick);
};


/**
 * Simulates a contextmenu event on the given target.
 * @param {EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton} opt_button Mouse button;
 *     defaults to {@code goog.events.BrowserEvent.MouseButton.RIGHT}.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireContextMenuEvent = function(target, opt_button) {
  var button = opt_button || goog.events.BrowserEvent.MouseButton.RIGHT;
  var contextmenu =
      new goog.testing.events.Event(goog.events.EventType.CONTEXTMENU, target);
  contextmenu.button = goog.userAgent.IE ?
      goog.events.BrowserEvent.IEButtonMap_[button] : button;
  return goog.testing.events.fireBrowserEvent(contextmenu);
};


/**
 * Simulates a mousedown, contextmenu, and the mouseup on the given event
 * target, with the right mouse button.
 * @param {EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the sequence: false if preventDefault()
 *     was called on any of the events, true otherwise.
 */
goog.testing.events.fireContextMenuSequence = function(target) {
  if (goog.userAgent.WINDOWS) {
    return !!(goog.testing.events.fireMouseDownEvent(target,
                  goog.events.BrowserEvent.MouseButton.RIGHT) &
              goog.testing.events.fireMouseUpEvent(target,
                  goog.events.BrowserEvent.MouseButton.RIGHT) &
        goog.testing.events.fireContextMenuEvent(target));
  } else {
    var result = goog.testing.events.fireMouseDownEvent(target,
        goog.events.BrowserEvent.MouseButton.RIGHT) &
        goog.testing.events.fireContextMenuEvent(target);
    if (goog.userAgent.GECKO) {
      result = result &
          goog.testing.events.fireMouseUpEvent(target,
              goog.events.BrowserEvent.MouseButton.RIGHT);
    }
    return !!result;
  }
};


/**
 * Simulates an event's capturing and bubbling phases.
 * @param {Event} event A simulated native event. It will be wrapped in a
 *     normalized BrowserEvent and dispatched to Closure listeners on all
 *     ancestors of its target (inclusive).
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
goog.testing.events.fireBrowserEvent = function(event) {
  event.returnValue_ = true;

  // generate a list of ancestors
  var ancestors = [];
  for (var current = event.target; current; current = current.parentNode) {
    ancestors.push(current);
  }

  // dispatch capturing listeners
  for (var j = ancestors.length - 1;
       j >= 0 && !event.propagationStopped_;
       j--) {
    goog.events.fireListeners(ancestors[j], event.type, true,
        new goog.events.BrowserEvent(event, ancestors[j]));
  }

  // dispatch bubbling listeners
  for (var j = 0;
       j < ancestors.length && !event.propagationStopped_;
       j++) {
    goog.events.fireListeners(ancestors[j], event.type, false,
        new goog.events.BrowserEvent(event, ancestors[j]));
  }

  return event.returnValue_;
};
