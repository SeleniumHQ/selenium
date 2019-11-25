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
 * @fileoverview Supplies 4 element vectors that are compatible with WebGL.
 * Each element is a float32 since that is typically the desired size of a
 * 4-vector in the GPU.  The API is structured to avoid unnecessary memory
 * allocations.  The last parameter will typically be the output vector and
 * an object can be both an input and output parameter to all methods except
 * where noted.
 *
 */
goog.provide('goog.vec.Vec4');

/** @suppress {extraRequire} */
goog.require('goog.vec');

/** @typedef {goog.vec.Float32} */ goog.vec.Vec4.Float32;
/** @typedef {goog.vec.Float64} */ goog.vec.Vec4.Float64;
/** @typedef {goog.vec.Number} */ goog.vec.Vec4.Number;
/** @typedef {goog.vec.AnyType} */ goog.vec.Vec4.AnyType;

// The following two types are deprecated - use the above types instead.
/** @typedef {Float32Array} */ goog.vec.Vec4.Type;
/** @typedef {goog.vec.ArrayType} */ goog.vec.Vec4.Vec4Like;


/**
 * Creates a 4 element vector of Float32. The array is initialized to zero.
 *
 * @return {!goog.vec.Vec4.Float32} The new 3 element array.
 */
goog.vec.Vec4.createFloat32 = function() {
  return new Float32Array(4);
};


/**
 * Creates a 4 element vector of Float64. The array is initialized to zero.
 *
 * @return {!goog.vec.Vec4.Float64} The new 4 element array.
 */
goog.vec.Vec4.createFloat64 = function() {
  return new Float64Array(4);
};


/**
 * Creates a 4 element vector of Number. The array is initialized to zero.
 *
 * @return {!goog.vec.Vec4.Number} The new 4 element array.
 */
goog.vec.Vec4.createNumber = function() {
  var v = new Array(4);
  goog.vec.Vec4.setFromValues(v, 0, 0, 0, 0);
  return v;
};


/**
 * Creates a 4 element vector of Float32Array. The array is initialized to zero.
 *
 * @deprecated Use createFloat32.
 * @return {!goog.vec.Vec4.Type} The new 4 element array.
 */
goog.vec.Vec4.create = function() {
  return new Float32Array(4);
};


/**
 * Creates a new 4 element vector initialized with the value from the given
 * array.
 *
 * @deprecated Use createFloat32FromArray.
 * @param {goog.vec.Vec4.Vec4Like} vec The source 4 element array.
 * @return {!goog.vec.Vec4.Type} The new 4 element array.
 */
goog.vec.Vec4.createFromArray = function(vec) {
  var newVec = goog.vec.Vec4.create();
  goog.vec.Vec4.setFromArray(newVec, vec);
  return newVec;
};


/**
 * Creates a new 4 element FLoat32 vector initialized with the value from the
 * given array.
 *
 * @param {goog.vec.Vec4.AnyType} vec The source 3 element array.
 * @return {!goog.vec.Vec4.Float32} The new 3 element array.
 */
goog.vec.Vec4.createFloat32FromArray = function(vec) {
  var newVec = goog.vec.Vec4.createFloat32();
  goog.vec.Vec4.setFromArray(newVec, vec);
  return newVec;
};


/**
 * Creates a new 4 element Float32 vector initialized with the supplied values.
 *
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Vec4.Float32} The new vector.
 */
goog.vec.Vec4.createFloat32FromValues = function(v0, v1, v2, v3) {
  var vec = goog.vec.Vec4.createFloat32();
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3);
  return vec;
};


/**
 * Creates a clone of the given 4 element Float32 vector.
 *
 * @param {goog.vec.Vec4.Float32} vec The source 3 element vector.
 * @return {!goog.vec.Vec4.Float32} The new cloned vector.
 */
goog.vec.Vec4.cloneFloat32 = goog.vec.Vec4.createFloat32FromArray;


/**
 * Creates a new 4 element Float64 vector initialized with the value from the
 * given array.
 *
 * @param {goog.vec.Vec4.AnyType} vec The source 4 element array.
 * @return {!goog.vec.Vec4.Float64} The new 4 element array.
 */
goog.vec.Vec4.createFloat64FromArray = function(vec) {
  var newVec = goog.vec.Vec4.createFloat64();
  goog.vec.Vec4.setFromArray(newVec, vec);
  return newVec;
};


/**
* Creates a new 4 element Float64 vector initialized with the supplied values.
*
* @param {number} v0 The value for element at index 0.
* @param {number} v1 The value for element at index 1.
* @param {number} v2 The value for element at index 2.
* @param {number} v3 The value for element at index 3.
* @return {!goog.vec.Vec4.Float64} The new vector.
*/
goog.vec.Vec4.createFloat64FromValues = function(v0, v1, v2, v3) {
  var vec = goog.vec.Vec4.createFloat64();
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3);
  return vec;
};


/**
 * Creates a clone of the given 4 element vector.
 *
 * @param {goog.vec.Vec4.Float64} vec The source 4 element vector.
 * @return {!goog.vec.Vec4.Float64} The new cloned vector.
 */
goog.vec.Vec4.cloneFloat64 = goog.vec.Vec4.createFloat64FromArray;


/**
 * Creates a new 4 element vector initialized with the supplied values.
 *
 * @deprecated Use createFloat32FromValues.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Vec4.Type} The new vector.
 */
goog.vec.Vec4.createFromValues = function(v0, v1, v2, v3) {
  var vec = goog.vec.Vec4.create();
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3);
  return vec;
};


/**
 * Creates a clone of the given 4 element vector.
 *
 * @deprecated Use cloneFloat32.
 * @param {goog.vec.Vec4.Vec4Like} vec The source 4 element vector.
 * @return {!goog.vec.Vec4.Type} The new cloned vector.
 */
goog.vec.Vec4.clone = goog.vec.Vec4.createFromArray;


/**
 * Initializes the vector with the given values.
 *
 * @param {goog.vec.Vec4.AnyType} vec The vector to receive the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Vec4.AnyType} Return vec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.setFromValues = function(vec, v0, v1, v2, v3) {
  vec[0] = v0;
  vec[1] = v1;
  vec[2] = v2;
  vec[3] = v3;
  return vec;
};


/**
 * Initializes the vector with the given array of values.
 *
 * @param {goog.vec.Vec4.AnyType} vec The vector to receive the
 *     values.
 * @param {goog.vec.Vec4.AnyType} values The array of values.
 * @return {!goog.vec.Vec4.AnyType} Return vec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.setFromArray = function(vec, values) {
  vec[0] = values[0];
  vec[1] = values[1];
  vec[2] = values[2];
  vec[3] = values[3];
  return vec;
};


/**
 * Performs a component-wise addition of vec0 and vec1 together storing the
 * result into resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The first addend.
 * @param {goog.vec.Vec4.AnyType} vec1 The second addend.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.add = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] + vec1[0];
  resultVec[1] = vec0[1] + vec1[1];
  resultVec[2] = vec0[2] + vec1[2];
  resultVec[3] = vec0[3] + vec1[3];
  return resultVec;
};


/**
 * Performs a component-wise subtraction of vec1 from vec0 storing the
 * result into resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The minuend.
 * @param {goog.vec.Vec4.AnyType} vec1 The subtrahend.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.subtract = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] - vec1[0];
  resultVec[1] = vec0[1] - vec1[1];
  resultVec[2] = vec0[2] - vec1[2];
  resultVec[3] = vec0[3] - vec1[3];
  return resultVec;
};


/**
 * Negates vec0, storing the result into resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The vector to negate.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.negate = function(vec0, resultVec) {
  resultVec[0] = -vec0[0];
  resultVec[1] = -vec0[1];
  resultVec[2] = -vec0[2];
  resultVec[3] = -vec0[3];
  return resultVec;
};


/**
 * Takes the absolute value of each component of vec0 storing the result in
 * resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The source vector.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to receive the result.
 *     May be vec0.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.abs = function(vec0, resultVec) {
  resultVec[0] = Math.abs(vec0[0]);
  resultVec[1] = Math.abs(vec0[1]);
  resultVec[2] = Math.abs(vec0[2]);
  resultVec[3] = Math.abs(vec0[3]);
  return resultVec;
};


/**
 * Multiplies each component of vec0 with scalar storing the product into
 * resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The source vector.
 * @param {number} scalar The value to multiply with each component of vec0.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.scale = function(vec0, scalar, resultVec) {
  resultVec[0] = vec0[0] * scalar;
  resultVec[1] = vec0[1] * scalar;
  resultVec[2] = vec0[2] * scalar;
  resultVec[3] = vec0[3] * scalar;
  return resultVec;
};


/**
 * Returns the magnitudeSquared of the given vector.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.Vec4.magnitudeSquared = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return x * x + y * y + z * z + w * w;
};


/**
 * Returns the magnitude of the given vector.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.Vec4.magnitude = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
};


/**
 * Normalizes the given vector storing the result into resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The vector to normalize.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.normalize = function(vec0, resultVec) {
  var ilen = 1 / goog.vec.Vec4.magnitude(vec0);
  resultVec[0] = vec0[0] * ilen;
  resultVec[1] = vec0[1] * ilen;
  resultVec[2] = vec0[2] * ilen;
  resultVec[3] = vec0[3] * ilen;
  return resultVec;
};


/**
 * Returns the scalar product of vectors v0 and v1.
 *
 * @param {goog.vec.Vec4.AnyType} v0 The first vector.
 * @param {goog.vec.Vec4.AnyType} v1 The second vector.
 * @return {number} The scalar product.
 */
goog.vec.Vec4.dot = function(v0, v1) {
  return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2] + v0[3] * v1[3];
};


/**
 * Linearly interpolate from v0 to v1 according to f. The value of f should be
 * in the range [0..1] otherwise the results are undefined.
 *
 * @param {goog.vec.Vec4.AnyType} v0 The first vector.
 * @param {goog.vec.Vec4.AnyType} v1 The second vector.
 * @param {number} f The interpolation factor.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to receive the
 *     results (may be v0 or v1).
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.lerp = function(v0, v1, f, resultVec) {
  var x = v0[0], y = v0[1], z = v0[2], w = v0[3];
  resultVec[0] = (v1[0] - x) * f + x;
  resultVec[1] = (v1[1] - y) * f + y;
  resultVec[2] = (v1[2] - z) * f + z;
  resultVec[3] = (v1[3] - w) * f + w;
  return resultVec;
};


/**
 * Compares the components of vec0 with the components of another vector or
 * scalar, storing the larger values in resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The source vector.
 * @param {goog.vec.Vec4.AnyType|number} limit The limit vector or scalar.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to receive the
 *     results (may be vec0 or limit).
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.max = function(vec0, limit, resultVec) {
  if (goog.isNumber(limit)) {
    resultVec[0] = Math.max(vec0[0], limit);
    resultVec[1] = Math.max(vec0[1], limit);
    resultVec[2] = Math.max(vec0[2], limit);
    resultVec[3] = Math.max(vec0[3], limit);
  } else {
    resultVec[0] = Math.max(vec0[0], limit[0]);
    resultVec[1] = Math.max(vec0[1], limit[1]);
    resultVec[2] = Math.max(vec0[2], limit[2]);
    resultVec[3] = Math.max(vec0[3], limit[3]);
  }
  return resultVec;
};


/**
 * Compares the components of vec0 with the components of another vector or
 * scalar, storing the smaller values in resultVec.
 *
 * @param {goog.vec.Vec4.AnyType} vec0 The source vector.
 * @param {goog.vec.Vec4.AnyType|number} limit The limit vector or scalar.
 * @param {goog.vec.Vec4.AnyType} resultVec The vector to receive the
 *     results (may be vec0 or limit).
 * @return {!goog.vec.Vec4.AnyType} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Vec4.min = function(vec0, limit, resultVec) {
  if (goog.isNumber(limit)) {
    resultVec[0] = Math.min(vec0[0], limit);
    resultVec[1] = Math.min(vec0[1], limit);
    resultVec[2] = Math.min(vec0[2], limit);
    resultVec[3] = Math.min(vec0[3], limit);
  } else {
    resultVec[0] = Math.min(vec0[0], limit[0]);
    resultVec[1] = Math.min(vec0[1], limit[1]);
    resultVec[2] = Math.min(vec0[2], limit[2]);
    resultVec[3] = Math.min(vec0[3], limit[3]);
  }
  return resultVec;
};


/**
 * Returns true if the components of v0 are equal to the components of v1.
 *
 * @param {goog.vec.Vec4.AnyType} v0 The first vector.
 * @param {goog.vec.Vec4.AnyType} v1 The second vector.
 * @return {boolean} True if the vectors are equal, false otherwise.
 */
goog.vec.Vec4.equals = function(v0, v1) {
  return v0.length == v1.length && v0[0] == v1[0] && v0[1] == v1[1] &&
      v0[2] == v1[2] && v0[3] == v1[3];
};
