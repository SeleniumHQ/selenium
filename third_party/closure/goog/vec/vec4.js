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

goog.require('goog.vec');


/**
 * @typedef {Float32Array}
 */
goog.vec.Vec4.Type;


/**
 * Creates a 4 element vector of Float32Array. The array is initialized to zero.
 *
 * @return {goog.vec.Vec4.Type} The new 4 element array.
 */
goog.vec.Vec4.create = function() {
  return new Float32Array(4);
};


/**
 * Creates a new 4 element vector initialized with the value from the given
 * array.
 *
 * @param {goog.vec.ArrayType} vec The source 4 element array.
 * @return {goog.vec.Vec4.Type} The new 4 element array.
 */
goog.vec.Vec4.createFromArray = function(vec) {
  var newVec = goog.vec.Vec4.create();
  goog.vec.Vec4.setFromArray(newVec, vec);
  return newVec;
};


/**
 * Creates a new 4 element vector initialized with the supplied values.
 *
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 2.
 * @return {goog.vec.Vec4.Type} The new vector.
 */
goog.vec.Vec4.createFromValues = function(v0, v1, v2, v3) {
  var vec = goog.vec.Vec4.create();
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3);
  return vec;
};


/**
 * Creates a clone of the given 4 element vector.
 *
 * @param {goog.vec.Vec4.Type} vec The source 4 element vector.
 * @return {goog.vec.Vec4.Type} The new cloned vector.
 */
goog.vec.Vec4.clone = goog.vec.Vec4.createFromArray;


/**
 * Initializes the vector with the given values.
 *
 * @param {goog.vec.ArrayType} vec The vector to receive the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 */
goog.vec.Vec4.setFromValues = function(vec, v0, v1, v2, v3) {
  vec[0] = v0;
  vec[1] = v1;
  vec[2] = v2;
  vec[3] = v3;
};


/**
 * Initializes the vector with the given array of values.
 *
 * @param {goog.vec.ArrayType} vec The vector to receive the
 *     values.
 * @param {goog.vec.ArrayType} values The array of values.
 */
goog.vec.Vec4.setFromArray = function(vec, values) {
  vec[0] = values[0];
  vec[1] = values[1];
  vec[2] = values[2];
  vec[3] = values[3];
};


/**
 * Performs a component-wise addition of vec0 and vec1 together storing the
 * result into resultVec.
 *
 * @param {goog.vec.ArrayType} vec0 The first addend.
 * @param {goog.vec.ArrayType} vec1 The second addend.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * @param {goog.vec.ArrayType} vec0 The minuend.
 * @param {goog.vec.ArrayType} vec1 The subtrahend.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * @param {goog.vec.ArrayType} vec0 The vector to negate.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * Multiplies each component of vec0 with scalar storing the product into
 * resultVec.
 *
 * @param {goog.vec.ArrayType} vec0 The source vector.
 * @param {number} scalar The value to multiply with each component of vec0.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * @param {goog.vec.ArrayType} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.Vec4.magnitudeSquared = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return x * x + y * y + z * z + w * w;
};


/**
 * Returns the magnitude of the given vector.
 *
 * @param {goog.vec.ArrayType} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.Vec4.magnitude = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
};


/**
 * Normalizes the given vector storing the result into resultVec.
 *
 * @param {goog.vec.ArrayType} vec0 The vector to normalize.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * @param {goog.vec.ArrayType} v0 The first vector.
 * @param {goog.vec.ArrayType} v1 The second vector.
 * @return {number} The scalar product.
 */
goog.vec.Vec4.dot = function(v0, v1) {
  return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2] + v0[3] * v1[3];
};


/**
 * Linearly interpolate from v0 to v1 according to f. The value of f should be
 * in the range [0..1] otherwise the results are undefined.
 *
 * @param {goog.vec.ArrayType} v0 The first vector.
 * @param {goog.vec.ArrayType} v1 The second vector.
 * @param {number} f The interpolation factor.
 * @param {goog.vec.ArrayType} resultVec The vector to receive the
 *     results (may be v0 or v1).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
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
 * Returns true if the components of v0 are equal to the components of v1.
 *
 * @param {goog.vec.ArrayType} v0 The first vector.
 * @param {goog.vec.ArrayType} v1 The second vector.
 * @return {boolean} True if the vectors are equal, false otherwise.
 */
goog.vec.Vec4.equals = function(v0, v1) {
  return v0.length == v1.length &&
      v0[0] == v1[0] && v0[1] == v1[1] && v0[2] == v1[2] && v0[3] == v1[3];
};
