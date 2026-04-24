/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.PointerAsTouchEventType');

goog.require('goog.events.PointerTouchFallbackEventType');


/**
 * An alias for `goog.events.EventType.TOUCH*` event types that is overridden by
 * corresponding `POINTER*` event types.
 * @enum {string}
 */
goog.events.PointerAsTouchEventType = {
  TOUCHCANCEL: goog.events.PointerTouchFallbackEventType.POINTERCANCEL,
  TOUCHEND: goog.events.PointerTouchFallbackEventType.POINTERUP,
  TOUCHMOVE: goog.events.PointerTouchFallbackEventType.POINTERMOVE,
  TOUCHSTART: goog.events.PointerTouchFallbackEventType.POINTERDOWN
};
