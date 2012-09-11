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
 * @fileoverview Supplies a Float32Array implementation that implements
 *     most of the Float32Array spec and that can be used when a built-in
 *     implementation is not available.
 *
 *     Note that if no existing Float32Array implementation is found then
 *     this class and all its public properties are exported as Float32Array.
 *
 *     Adding support for the other TypedArray classes here does not make sense
 *     since this vector math library only needs Float32Array.
 *
 */
goog.provide('goog.vec.Float32Array');



/**
 * Constructs a new Float32Array. The new array is initialized to all zeros.
 *
 * @param {goog.vec.Float32Array|Array|ArrayBuffer|number} p0
 *     The length of the array, or an array to initialize the contents of the
 *     new Float32Array.
 * @constructor
 */
goog.vec.Float32Array = function(p0) {
  this.length = p0.length || p0;
  for (var i = 0; i < this.length; i++) {
    this[i] = p0[i] || 0;
  }
};


/**
 * The number of bytes in an element (as defined by the Typed Array
 * specification).
 *
 * @type {number}
 */
goog.vec.Float32Array.BYTES_PER_ELEMENT = 4;


/**
 * The number of bytes in an element (as defined by the Typed Array
 * specification).
 *
 * @type {number}
 */
goog.vec.Float32Array.prototype.BYTES_PER_ELEMENT = 4;


/**
 * Sets elements of the array.
 * @param {Array.<number>|Float32Array} values The array of values.
 * @param {number=} opt_offset The offset in this array to start.
 */
goog.vec.Float32Array.prototype.set = function(values, opt_offset) {
  opt_offset = opt_offset || 0;
  for (var i = 0; i < values.length && opt_offset + i < this.length; i++) {
    this[opt_offset + i] = values[i];
  }
};


/**
 * Creates a string representation of this array.
 * @return {string} The string version of this array.
 * @override
 */
goog.vec.Float32Array.prototype.toString = Array.prototype.join;


/**
 * Note that we cannot implement the subarray() or (deprecated) slice()
 * methods properly since doing so would require being able to overload
 * the [] operator which is not possible in javascript.  So we leave
 * them unimplemented.  Any attempt to call these methods will just result
 * in a javascript error since we leave them undefined.
 */


/**
 * If no existing Float32Array implementation is found then we export
 * goog.vec.Float32Array as Float32Array.
 */
if (typeof Float32Array == 'undefined') {
  goog.exportProperty(goog.vec.Float32Array, 'BYTES_PER_ELEMENT',
                      goog.vec.Float32Array.BYTES_PER_ELEMENT);
  goog.exportProperty(goog.vec.Float32Array.prototype, 'BYTES_PER_ELEMENT',
                      goog.vec.Float32Array.prototype.BYTES_PER_ELEMENT);
  goog.exportProperty(goog.vec.Float32Array.prototype, 'set',
                      goog.vec.Float32Array.prototype.set);
  goog.exportProperty(goog.vec.Float32Array.prototype, 'toString',
                      goog.vec.Float32Array.prototype.toString);
  goog.exportSymbol('Float32Array', goog.vec.Float32Array);
}
