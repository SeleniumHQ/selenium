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
 * @fileoverview Creates a pool of XhrLite objects to use. This allows multiple
 * XhrLite objects to be grouped together and requests will use next available
 * XhrLite object.
 *
 */

goog.provide('goog.net.XhrLitePool');

goog.require('goog.net.XhrIoPool');


/**
 * A pool of XhrLite objects.
 * @param {goog.structs.Map} opt_headers Map of default headers to add to every
 *     request.
 * @param {number} opt_minCount Min. number of objects (Default: 1).
 * @param {number} opt_maxCount Max. number of objects (Default: 10).
 * @deprecated Use goog.net.XhrIoPool.
 * @constructor
 */
goog.net.XhrLitePool = goog.net.XhrIoPool;
