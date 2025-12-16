// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Static utility methods for UI components.
 */

goog.provide('goog.ui.ComponentUtil');

goog.require('goog.events.MouseAsMouseEventType');
goog.require('goog.events.MouseEvents');
goog.require('goog.events.PointerAsMouseEventType');



/**
 * @param {!goog.ui.Component} component
 * @return {!goog.events.MouseEvents} The browser events that should be listened
 *     to for the given mouse events.
 */
goog.ui.ComponentUtil.getMouseEventType = function(component) {
  return component.pointerEventsEnabled() ?
      goog.events.PointerAsMouseEventType :
      goog.events.MouseAsMouseEventType;
};
