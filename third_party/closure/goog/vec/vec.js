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
goog.provide('goog.vec.AnyType');
goog.provide('goog.vec.ArrayType');
goog.provide('goog.vec.Float32');
goog.provide('goog.vec.Float64');
goog.provide('goog.vec.Number');


/**
 * On platforms that don't have native Float32Array or Float64Array support we
 * use a javascript implementation so that this math library can be used on all
 * platforms.
 * @suppress {extraRequire}
 */
goog.require('goog.vec.Float32Array');
/** @suppress {extraRequire} */
goog.require('goog.vec.Float64Array');

// All vector and matrix operations are based upon arrays of numbers using
// either Float32Array, Float64Array, or a standard JavaScript Array of
// Numbers.


/** @typedef {!Float32Array} */
goog.vec.Float32;


/** @typedef {!Float64Array} */
goog.vec.Float64;


/** @typedef {!Array<number>} */
goog.vec.Number;


/** @typedef {!goog.vec.Float32|!goog.vec.Float64|!goog.vec.Number} */
goog.vec.AnyType;


/**
 * @deprecated Use AnyType.
 * @typedef {!Float32Array|!Array<number>}
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
