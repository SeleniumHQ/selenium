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
 * @fileoverview Functions for manipulating message channels.
 *
 */

goog.provide('goog.messaging');


/**
 * Creates a bidirectional pipe between two message channels.
 *
 * @param {goog.messaging.MessageChannel} channel1 The first channel.
 * @param {goog.messaging.MessageChannel} channel2 The second channel.
 */
goog.messaging.pipe = function(channel1, channel2) {
  channel1.registerDefaultService(goog.bind(channel2.send, channel2));
  channel2.registerDefaultService(goog.bind(channel1.send, channel1));
};
