/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.PointerAsMouseEventType');

goog.require('goog.events.PointerFallbackEventType');
goog.require('goog.events.MouseEvents');


/**
 * An alias for `goog.events.EventType.MOUSE*` event types that is overridden by
 * corresponding `POINTER*` event types.
 * @const {!goog.events.MouseEvents}
 */
goog.events.PointerAsMouseEventType = {
  MOUSEDOWN: goog.events.PointerFallbackEventType.POINTERDOWN,
  MOUSEUP: goog.events.PointerFallbackEventType.POINTERUP,
  MOUSECANCEL: goog.events.PointerFallbackEventType.POINTERCANCEL,
  MOUSEMOVE: goog.events.PointerFallbackEventType.POINTERMOVE,
  MOUSEOVER: goog.events.PointerFallbackEventType.POINTEROVER,
  MOUSEOUT: goog.events.PointerFallbackEventType.POINTEROUT,
  MOUSEENTER: goog.events.PointerFallbackEventType.POINTERENTER,
  MOUSELEAVE: goog.events.PointerFallbackEventType.POINTERLEAVE
};
