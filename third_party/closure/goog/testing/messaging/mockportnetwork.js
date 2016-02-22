// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A fake PortNetwork implementation that simply produces
 * MockMessageChannels for all ports.
 *
 */

goog.provide('goog.testing.messaging.MockPortNetwork');

goog.require('goog.messaging.PortNetwork'); // interface
goog.require('goog.testing.messaging.MockMessageChannel');



/**
 * The fake PortNetwork.
 *
 * @param {!goog.testing.MockControl} mockControl The mock control for creating
 *     the mock message channels.
 * @constructor
 * @implements {goog.messaging.PortNetwork}
 * @final
 */
goog.testing.messaging.MockPortNetwork = function(mockControl) {
  /**
   * The mock control for creating mock message channels.
   * @type {!goog.testing.MockControl}
   * @private
   */
  this.mockControl_ = mockControl;

  /**
   * The mock ports that have been created.
   * @type {!Object<!goog.testing.messaging.MockMessageChannel>}
   * @private
   */
  this.ports_ = {};
};


/**
 * Get the mock port with the given name.
 * @param {string} name The name of the port to get.
 * @return {!goog.testing.messaging.MockMessageChannel} The mock port.
 * @override
 */
goog.testing.messaging.MockPortNetwork.prototype.dial = function(name) {
  if (!(name in this.ports_)) {
    this.ports_[name] =
        new goog.testing.messaging.MockMessageChannel(this.mockControl_);
  }
  return this.ports_[name];
};
