/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.PointerFallbackEventType');

goog.require('goog.events.EventType');
goog.require('goog.events.eventTypeHelpers');


/**
 * Constants for pointer event names that fall back to corresponding mouse event
 * names on unsupported platforms. These are intended to be drop-in replacements
 * for corresponding values in `goog.events.EventType`.
 * @enum {string}
 */
goog.events.PointerFallbackEventType = {
  POINTERDOWN: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERDOWN, goog.events.EventType.MSPOINTERDOWN,
      goog.events.EventType.MOUSEDOWN),
  POINTERUP: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERUP, goog.events.EventType.MSPOINTERUP,
      goog.events.EventType.MOUSEUP),
  POINTERCANCEL: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERCANCEL,
      goog.events.EventType.MSPOINTERCANCEL,
      // When falling back to mouse events, there is no MOUSECANCEL equivalent
      // of POINTERCANCEL. In this case POINTERUP already falls back to MOUSEUP
      // which represents both UP and CANCEL. POINTERCANCEL does not fall back
      // to MOUSEUP to prevent listening twice on the same event.
      goog.events.EventType.MOUSECANCEL),
  POINTERMOVE: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERMOVE, goog.events.EventType.MSPOINTERMOVE,
      goog.events.EventType.MOUSEMOVE),
  POINTEROVER: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTEROVER, goog.events.EventType.MSPOINTEROVER,
      goog.events.EventType.MOUSEOVER),
  POINTEROUT: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTEROUT, goog.events.EventType.MSPOINTEROUT,
      goog.events.EventType.MOUSEOUT),
  POINTERENTER: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERENTER, goog.events.EventType.MSPOINTERENTER,
      goog.events.EventType.MOUSEENTER),
  POINTERLEAVE: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERLEAVE, goog.events.EventType.MSPOINTERLEAVE,
      goog.events.EventType.MOUSELEAVE)
};
