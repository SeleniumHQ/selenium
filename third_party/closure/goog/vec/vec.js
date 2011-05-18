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
 * @fileoverview Supplies global data types and constants for the vector math
 *     library.
 */
goog.provide('goog.vec');

/**
 * On platforms that don't have native Float32Array support we use a javascript
 * implementation so that this math library can be used on all platforms.
 */
goog.require('goog.vec.Float32Array');


/**
 * All vector and matrix operations are based upon arrays of numbers using
 * either a standard Javascript Array or the Float32Array typed array.
 *
 * @typedef {Float32Array|Array.<Number>}
 */
goog.vec.ArrayType;


/**
 * For graphics work, 6 decimal places of accuracy are typically all that is
 * required.
 *
 * @type {number}
 * @const
 */
goog.vec.EPSILON = 1e-6;
