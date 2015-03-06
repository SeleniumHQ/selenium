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
 * @final
 */
goog.ui.MockActivityMonitor = function() {
  goog.ui.MockActivityMonitor.base(this, 'constructor');

  /**
   * Tracks whether an event has been fired. Used by simulateEvent.
   * @type {boolean}
   * @private
   */
  this.eventFired_ = false;
};
goog.inherits(goog.ui.MockActivityMonitor, goog.ui.ActivityMonitor);


/**
 * Simulates an event that updates the user to being non-idle.
 * @param {goog.events.EventType=} opt_type The type of event that made the user
 *     not idle. If not specified, defaults to MOUSEMOVE.
 */
goog.ui.MockActivityMonitor.prototype.simulateEvent = function(opt_type) {
  var eventTime = goog.now();
  var eventType = opt_type || goog.events.EventType.MOUSEMOVE;

  this.eventFired_ = false;
  this.updateIdleTime(eventTime, eventType);

  if (!this.eventFired_) {
    this.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY);
  }
};


/**
 * @override
 */
goog.ui.MockActivityMonitor.prototype.dispatchEvent = function(e) {
  var rv = goog.ui.MockActivityMonitor.base(this, 'dispatchEvent', e);
  this.eventFired_ = true;
  return rv;
};
