/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.PointerTouchFallbackEventType');

goog.require('goog.events.EventType');
goog.require('goog.events.eventTypeHelpers');


/**
 * Constants for pointer event names that fall back to corresponding touch event
 * names on unsupported platforms. These are intended to be drop-in replacements
 * for corresponding values in `goog.events.EventType`.
 * @enum {string}
 */
goog.events.PointerTouchFallbackEventType = {
  POINTERDOWN: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERDOWN, goog.events.EventType.MSPOINTERDOWN,
      goog.events.EventType.TOUCHSTART),
  POINTERUP: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERUP, goog.events.EventType.MSPOINTERUP,
      goog.events.EventType.TOUCHEND),
  POINTERCANCEL: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERCANCEL,
      goog.events.EventType.MSPOINTERCANCEL, goog.events.EventType.TOUCHCANCEL),
  POINTERMOVE: goog.events.eventTypeHelpers.getPointerFallbackEventName(
      goog.events.EventType.POINTERMOVE, goog.events.EventType.MSPOINTERMOVE,
      goog.events.EventType.TOUCHMOVE)
};
