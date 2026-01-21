/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Static utility methods for UI components.
 */

goog.provide('goog.ui.ComponentUtil');

goog.require('goog.events.MouseAsMouseEventType');
goog.require('goog.events.MouseEvents');
goog.require('goog.events.PointerAsMouseEventType');
goog.requireType('goog.ui.Component');



/**
 * @param {!goog.ui.Component} component
 * @return {!goog.events.MouseEvents} The browser events that should be listened
 *     to for the given mouse events.
 */
goog.ui.ComponentUtil.getMouseEventType = function(component) {
  'use strict';
  return component.pointerEventsEnabled() ?
      goog.events.PointerAsMouseEventType :
      goog.events.MouseAsMouseEventType;
};
