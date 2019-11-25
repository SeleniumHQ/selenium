// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Event observer.
 *
 * Provides an event observer that holds onto events that it handles.  This
 * can be used in unit testing to verify an event target's events --
 * that the order count, types, etc. are correct.
 *
 * Example usage:
 * <pre>
 * var observer = new goog.testing.events.EventObserver();
 * var widget = new foo.Widget();
 * goog.events.listen(widget, ['select', 'submit'], observer);
 * // Simulate user action of 3 select events and 2 submit events.
 * assertEquals(3, observer.getEvents('select').length);
 * assertEquals(2, observer.getEvents('submit').length);
 * </pre>
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.setTestOnly('goog.testing.events.EventObserver');
goog.provide('goog.testing.events.EventObserver');

goog.require('goog.array');



/**
 * Event observer.  Implements a handleEvent interface so it may be used as
 * a listener in listening functions and methods.
 * @see goog.events.listen
 * @see goog.events.EventHandler
 * @constructor
 * @final
 */
goog.testing.events.EventObserver = function() {

  /**
   * A list of events handled by the observer in order of handling, oldest to
   * newest.
   * @type {!Array<!goog.events.Event>}
   * @private
   */
  this.events_ = [];
};


/**
 * Handles an event and remembers it.  Event listening functions and methods
 * will call this method when this observer is used as a listener.
 * @see goog.events.listen
 * @see goog.events.EventHandler
 * @param {!goog.events.Event} e Event to handle.
 */
goog.testing.events.EventObserver.prototype.handleEvent = function(e) {
  this.events_.push(e);
};


/**
 * @param {string=} opt_type If given, only return events of this type.
 * @return {!Array<!goog.events.Event>} The events handled, oldest to newest.
 */
goog.testing.events.EventObserver.prototype.getEvents = function(opt_type) {
  var events = goog.array.clone(this.events_);

  if (opt_type) {
    events = goog.array.filter(
        events, function(event) { return event.type == opt_type; });
  }

  return events;
};


/** Clears the list of events seen by this observer. */
goog.testing.events.EventObserver.prototype.clear = function() {
  this.events_ = [];
};
