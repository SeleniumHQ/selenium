// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This class manages the network connectivity state.
 *
 * @visibility {:internal}
 */


goog.provide('goog.labs.net.webChannel.ConnectionState');



/**
 * The connectivity state of the channel.
 *
 * @constructor
 * @struct
 */
goog.labs.net.webChannel.ConnectionState = function() {
  /**
   * Handshake result.
   * @type {Array<string>}
   */
  this.handshakeResult = null;

  /**
   * The result of checking if there is a buffering proxy in the network.
   * True means the connection is buffered, False means unbuffered,
   * null means that the result is not available.
   * @type {?boolean}
   */
  this.bufferingProxyResult = null;
};
