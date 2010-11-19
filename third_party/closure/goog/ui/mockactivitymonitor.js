// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of goog.ui.MockActivityMonitor.
 */

goog.provide('goog.ui.MockActivityMonitor');

goog.require('goog.events.EventType');
goog.require('goog.ui.ActivityMonitor');



/**
 * A mock implementation of goog.ui.ActivityMonitor for unit testing. Clients
 * of this class should override goog.now to return a synthetic time from
 * the unit test.
 * @constructor
 * @extends {goog.ui.ActivityMonitor}
 */
goog.ui.MockActivityMonitor = function() {
  goog.ui.ActivityMonitor.call(this);
};
goog.inherits(goog.ui.MockActivityMonitor, goog.ui.ActivityMonitor);


/**
 * Simulates an event that updates the user to being non-idle.
 * @param {goog.events.EventType=} opt_type The type of event that made the user
 *     not idle. If not specified, defaults to MOUSEMOVE.
 */
goog.ui.MockActivityMonitor.prototype.simulateEvent = function(opt_type) {
  var type = opt_type || goog.events.EventType.MOUSEMOVE;
  var eventTime = goog.now();

  // update internal state noting whether the user was idle
  this.lastEventTime_ = eventTime;
  this.lastEventType_ = type;

  // dispatch event
  this.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY);
};
