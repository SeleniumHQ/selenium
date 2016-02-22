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
 * @fileoverview The event object dispatched when the history changes.
 *
 */


goog.provide('goog.history.Event');

goog.require('goog.events.Event');
goog.require('goog.history.EventType');



/**
 * Event object dispatched after the history state has changed.
 * @param {string} token The string identifying the new history state.
 * @param {boolean} isNavigation True if the event was triggered by a browser
 *     action, such as forward or back, clicking on a link, editing the URL, or
 *     calling {@code window.history.(go|back|forward)}.
 *     False if the token has been changed by a {@code setToken} or
 *     {@code replaceToken} call.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 */
goog.history.Event = function(token, isNavigation) {
  goog.events.Event.call(this, goog.history.EventType.NAVIGATE);

  /**
   * The current history state.
   * @type {string}
   */
  this.token = token;

  /**
   * Whether the event was triggered by browser navigation.
   * @type {boolean}
   */
  this.isNavigation = isNavigation;
};
goog.inherits(goog.history.Event, goog.events.Event);
