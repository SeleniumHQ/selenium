/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.MouseAsMouseEventType');

goog.require('goog.events.EventType');
goog.require('goog.events.MouseEvents');


/**
 * An alias for `goog.events.EventType.MOUSE*` event types that continue to use
 * mouse events.
 * @const {!goog.events.MouseEvents}
 */
goog.events.MouseAsMouseEventType = {
  MOUSEDOWN: goog.events.EventType.MOUSEDOWN,
  MOUSEUP: goog.events.EventType.MOUSEUP,
  MOUSECANCEL: goog.events.EventType.MOUSECANCEL,
  MOUSEMOVE: goog.events.EventType.MOUSEMOVE,
  MOUSEOVER: goog.events.EventType.MOUSEOVER,
  MOUSEOUT: goog.events.EventType.MOUSEOUT,
  MOUSEENTER: goog.events.EventType.MOUSEENTER,
  MOUSELEAVE: goog.events.EventType.MOUSELEAVE
};
