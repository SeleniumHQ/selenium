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
 * @fileoverview Mock of XhrLite for unit testing.
 *
 */

goog.provide('goog.net.MockXhrLite');

goog.require('goog.testing.net.XhrIo');



/**
 * Mock implementation of goog.net.XhrLite. This doesn't provide a mock
 * implementation for all cases, but it's not too hard to add them as needed.
 * @param {goog.testing.TestQueue=} opt_testQueue Test queue for inserting test
 *     events.
 * @deprecated Use goog.testing.net.XhrIo.
 * @constructor
 */
goog.net.MockXhrLite = goog.testing.net.XhrIo;
