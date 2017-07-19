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
 * @fileoverview Supplies a Float64Array implementation that implements
 * most of the Float64Array spec and that can be used when a built-in
 * implementation is not available.
 *
 * Note that if no existing Float64Array implementation is found then this
 * class and all its public properties are exported as Float64Array.
 *
 * Adding support for the other TypedArray classes here does not make sense
 * since this vector math library only needs Float32Array and Float64Array.
 *
 */
goog.provide('goog.vec.Float64Array');



/**
 * Constructs a new Float64Array. The new array is initialized to all zeros.
 *
 * @param {goog.vec.Float64Array|Array|ArrayBuffer|number} p0
 *     The length of the array, or an array to initialize the contents of the
 *     new Float64Array.
 * @constructor
 * @implements {IArrayLike<number>}
 * @final
 */
goog.vec.Float64Array = function(p0) {
  /** @type {number} */
  this.length = /** @type {number} */ (p0.length || p0);
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
goog.vec.Float64Array.BYTES_PER_ELEMENT = 8;


/**
 * The number of bytes in an element (as defined by the Typed Array
 * specification).
 *
 * @type {number}
 */
goog.vec.Float64Array.prototype.BYTES_PER_ELEMENT = 8;


/**
 * Sets elements of the array.
 * @param {Array<number>|Float64Array} values The array of values.
 * @param {number=} opt_offset The offset in this array to start.
 */
goog.vec.Float64Array.prototype.set = function(values, opt_offset) {
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
goog.vec.Float64Array.prototype.toString = Array.prototype.join;


/**
 * Note that we cannot implement the subarray() or (deprecated) slice()
 * methods properly since doing so would require being able to overload
 * the [] operator which is not possible in javascript.  So we leave
 * them unimplemented.  Any attempt to call these methods will just result
 * in a javascript error since we leave them undefined.
 */


/**
 * If no existing Float64Array implementation is found then we export
 * goog.vec.Float64Array as Float64Array.
 */
if (typeof Float64Array == 'undefined') {
  try {
    goog.exportProperty(
        goog.vec.Float64Array, 'BYTES_PER_ELEMENT',
        goog.vec.Float64Array.BYTES_PER_ELEMENT);
  } catch (float64ArrayError) {
    // Do nothing.  This code is in place to fix b/7225850, in which an error
    // is incorrectly thrown for Google TV on an old Chrome.
    // TODO(user): remove after that version is retired.
  }

  goog.exportProperty(
      goog.vec.Float64Array.prototype, 'BYTES_PER_ELEMENT',
      goog.vec.Float64Array.prototype.BYTES_PER_ELEMENT);
  goog.exportProperty(
      goog.vec.Float64Array.prototype, 'set',
      goog.vec.Float64Array.prototype.set);
  goog.exportProperty(
      goog.vec.Float64Array.prototype, 'toString',
      goog.vec.Float64Array.prototype.toString);
  goog.exportSymbol('Float64Array', goog.vec.Float64Array);
}
