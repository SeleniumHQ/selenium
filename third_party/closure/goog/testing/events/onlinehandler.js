// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview NetworkStatusMonitor test double.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.testing.events.OnlineHandler');

goog.require('goog.events.EventTarget');
goog.require('goog.net.NetworkStatusMonitor');



/**
 * NetworkStatusMonitor test double.
 * @param {boolean} initialState The initial online state of the mock.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {goog.net.NetworkStatusMonitor}
 */
goog.testing.events.OnlineHandler = function(initialState) {
  goog.base(this);

  /**
   * Whether the mock is online.
   * @private {boolean}
   */
  this.online_ = initialState;
};
goog.inherits(goog.testing.events.OnlineHandler, goog.events.EventTarget);


/** @override */
goog.testing.events.OnlineHandler.prototype.isOnline = function() {
  return this.online_;
};


/**
 * Sets the online state.
 * @param {boolean} newOnlineState The new online state.
 */
goog.testing.events.OnlineHandler.prototype.setOnline =
    function(newOnlineState) {
  if (newOnlineState != this.online_) {
    this.online_ = newOnlineState;
    this.dispatchEvent(newOnlineState ?
        goog.net.NetworkStatusMonitor.EventType.ONLINE :
        goog.net.NetworkStatusMonitor.EventType.OFFLINE);
  }
};
