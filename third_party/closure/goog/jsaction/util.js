// Copyright 2011 The Closure Library Authors. All Rights Reserved
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
 *
 * @fileoverview Utility functions used by jsaction.
 * An important goal is to keep goog.jsaction as small as possible and
 * standalone.
 * This file provides minimal utility functions, mainly to deal with
 * browser events.
 * NOTE(user): This file should be considered private within goog.jsaction.
 */


goog.provide('goog.jsaction.util');


/**
 * Registers the event handler function with the given DOM element for
 * the given event type.
 * NOTE(user): Jsaction only requires basic event handler registration.
 * Purposefully not pulling in goog.events to minimize binary size.
 *
 * @param {!Element} element The element.
 * @param {string} eventType The event type.
 * @param {Function} handler The handler function.
 */
goog.jsaction.util.addEventListener = function(element, eventType, handler) {
  if (element.addEventListener) {
    element.addEventListener(eventType, handler, false);
  } else if (element.attachEvent) {
    // NOTE(user): IE executes handlers in the global scope.
    // In the event handler function, "this" will therefore reference
    // window, not the element on which the event occurred.
    element.attachEvent('on' + eventType, handler);
  }
};


/**
 * Cancels propagation of an event.
 * @param {!Event} e The event to cancel propagation for.
 */
goog.jsaction.util.stopPropagation = function(e) {
  e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
};


/**
 * Prevents the default action of an event.
 * @param {!Event} e The event to prevent the default action for.
 */
goog.jsaction.util.preventDefault = function(e) {
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
};


/**
 * Whether we are on a Mac. Not pulling in goog.useragent just for this.
 * @type {boolean}
 * @private
 */
goog.jsaction.util.isMac_ = /Macintosh/.test(navigator.userAgent);


/**
 * Determines and returns whether the given event (which is assumed
 * to be a click event) is modified.
 * @param {!Event} e The event.
 * @return {boolean} Whether the given event is modified.
 */
goog.jsaction.util.isModifiedClickEvent = function(e) {
  return (goog.jsaction.util.isMac_ && e.metaKey) ||
      (!goog.jsaction.util.isMac_ && e.ctrlKey);
};
