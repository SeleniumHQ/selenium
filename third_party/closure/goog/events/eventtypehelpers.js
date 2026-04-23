/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helpers for defining EventTypes.
 */


goog.provide('goog.events.eventTypeHelpers');

goog.require('goog.events.BrowserFeature');
goog.require('goog.userAgent');


/**
 * Returns a prefixed event name for the current browser.
 * @param {string} eventName The name of the event.
 * @return {string} The prefixed event name.
 * @package
 */
goog.events.eventTypeHelpers.getVendorPrefixedName = function(eventName) {
  'use strict';
  return goog.userAgent.WEBKIT ? 'webkit' + eventName : eventName.toLowerCase();
};


/**
 * Returns one of the given pointer fallback event names in order of preference:
 *   1. pointerEventName
 *   2. msPointerEventName
 *   3. fallbackEventName
 * @param {string} pointerEventName
 * @param {string} msPointerEventName
 * @param {string} fallbackEventName
 * @return {string} The supported pointer or fallback (mouse or touch) event
 *     name.
 * @package
 */
goog.events.eventTypeHelpers.getPointerFallbackEventName = function(
    pointerEventName, msPointerEventName, fallbackEventName) {
  'use strict';
  if (goog.events.BrowserFeature.POINTER_EVENTS) {
    return pointerEventName;
  }
  if (goog.events.BrowserFeature.MSPOINTER_EVENTS) {
    return msPointerEventName;
  }
  return fallbackEventName;
};
