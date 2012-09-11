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
 * @fileoverview Mock of OnlineHandler for unit testing.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.testing.events.OnlineHandler');

goog.require('goog.events.EventTarget');
goog.require('goog.events.OnlineHandler.EventType');



/**
 * Mock implementation of goog.events.OnlineHandler.
 * @param {boolean} initialState The initial online state of the mock.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.testing.events.OnlineHandler = function(initialState) {
  goog.base(this);

  /**
   * Whether the mock is online.
   * @type {boolean}
   * @private
   */
  this.online_ = initialState;
};
goog.inherits(goog.testing.events.OnlineHandler, goog.events.EventTarget);


/**
 * Mock implementation of goog.events.OnlineHandler.isOnline.
 * @return {boolean} Whether the mock is online.
 */
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
        goog.events.OnlineHandler.EventType.ONLINE :
        goog.events.OnlineHandler.EventType.OFFLINE);
  }
};
