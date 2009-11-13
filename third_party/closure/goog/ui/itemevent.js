// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of the goog.ui.ItemEvent class.
 *
 */

goog.provide('goog.ui.ItemEvent');


goog.require('goog.events.Event');


/**
 * Generic ui event class for events that take a single item like a menu click
 * event.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @param {string} type Event Type.
 * @param {Object} target Reference to the object that is the target
 *                        of this event.
 * @param {Object} item The item that was clicked.
 */
goog.ui.ItemEvent = function(type, target, item) {
  goog.events.Event.call(this, type, target);

  /**
   * Item for the event. The type of this object is specific to the type
   * of event. For a menu, it would be the menu item that was clicked. For a
   * listbox selection, it would be the listitem that was selected.
   *
   * @type {Object}
   */
  this.item = item;
};
goog.inherits(goog.ui.ItemEvent, goog.events.Event);
