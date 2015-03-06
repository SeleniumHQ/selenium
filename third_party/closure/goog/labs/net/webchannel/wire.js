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
 * @fileoverview Interface and shared data structures for implementing
 * different wire protocol versions.
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 */


goog.provide('goog.labs.net.webChannel.Wire');



/**
 * The interface class.
 *
 * @interface
 */
goog.labs.net.webChannel.Wire = function() {};


goog.scope(function() {
var Wire = goog.labs.net.webChannel.Wire;


/**
 * The latest protocol version that this class supports. We request this version
 * from the server when opening the connection. Should match
 * LATEST_CHANNEL_VERSION on the server code.
 * @type {number}
 */
Wire.LATEST_CHANNEL_VERSION = 8;



/**
 * Simple container class for a (mapId, map) pair.
 * @param {number} mapId The id for this map.
 * @param {!Object|!goog.structs.Map} map The map itself.
 * @param {!Object=} opt_context The context associated with the map.
 * @constructor
 * @struct
 */
Wire.QueuedMap = function(mapId, map, opt_context) {
  /**
   * The id for this map.
   * @type {number}
   */
  this.mapId = mapId;

  /**
   * The map itself.
   * @type {!Object|!goog.structs.Map}
   */
  this.map = map;

  /**
   * The context for the map.
   * @type {Object}
   */
  this.context = opt_context || null;
};
});  // goog.scope
