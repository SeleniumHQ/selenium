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


////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////
//                                                                           //
// Any edits to this file must be applied to vec4d.js by running:            //
//   swap_type.sh vec4f.js > vec4d.js                                        //
//                                                                           //
////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////


/**
 * @fileoverview Provides functions for operating on 4 element float (32bit)
 * vectors.
 *
 * The last parameter will typically be the output object and an object
 * can be both an input and output parameter to all methods except where
 * noted.
 *
 * See the README for notes about the design and structure of the API
 * (especially related to performance).
 *
 */
goog.provide('goog.vec.vec4f');
goog.provide('goog.vec.vec4f.Type');

/** @suppress {extraRequire} */
goog.require('goog.vec');

/** @typedef {goog.vec.Float32} */ goog.vec.vec4f.Type;


/**
 * Creates a vec4f with all elements initialized to zero.
 *
 * @return {!goog.vec.vec4f.Type} The new vec4f.
 */
goog.vec.vec4f.create = function() {
  return new Float32Array(4);
};


/**
 * Initializes the vector with the given values.
 *
 * @param {goog.vec.vec4f.Type} vec The vector to receive the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.vec4f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.setFromValues = function(vec, v0, v1, v2, v3) {
  vec[0] = v0;
  vec[1] = v1;
  vec[2] = v2;
  vec[3] = v3;
  return vec;
};


/**
 * Initializes vec4f vec from vec4f src.
 *
 * @param {goog.vec.vec4f.Type} vec The destination vector.
 * @param {goog.vec.vec4f.Type} src The source vector.
 * @return {!goog.vec.vec4f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.setFromVec4f = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  vec[3] = src[3];
  return vec;
};


/**
 * Initializes vec4f vec from vec4d src (typed as a Float64Array to
 * avoid circular goog.requires).
 *
 * @param {goog.vec.vec4f.Type} vec The destination vector.
 * @param {Float64Array} src The source vector.
 * @return {!goog.vec.vec4f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.setFromVec4d = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  vec[3] = src[3];
  return vec;
};


/**
 * Initializes vec4f vec from Array src.
 *
 * @param {goog.vec.vec4f.Type} vec The destination vector.
 * @param {Array.<number>} src The source vector.
 * @return {!goog.vec.vec4f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.setFromArray = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  vec[3] = src[3];
  return vec;
};


/**
 * Performs a component-wise addition of vec0 and vec1 together storing the
 * result into resultVec.
 *
 * @param {goog.vec.vec4f.Type} vec0 The first addend.
 * @param {goog.vec.vec4f.Type} vec1 The second addend.
 * @param {goog.vec.vec4f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.add = function(vec0, vec1, resultVec) {
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
 * @param {goog.vec.vec4f.Type} vec0 The minuend.
 * @param {goog.vec.vec4f.Type} vec1 The subtrahend.
 * @param {goog.vec.vec4f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.subtract = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] - vec1[0];
  resultVec[1] = vec0[1] - vec1[1];
  resultVec[2] = vec0[2] - vec1[2];
  resultVec[3] = vec0[3] - vec1[3];
  return resultVec;
};


/**
 * Negates vec0, storing the result into resultVec.
 *
 * @param {goog.vec.vec4f.Type} vec0 The vector to negate.
 * @param {goog.vec.vec4f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.negate = function(vec0, resultVec) {
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
 * @param {goog.vec.vec4f.Type} vec0 The source vector.
 * @param {number} scalar The value to multiply with each component of vec0.
 * @param {goog.vec.vec4f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.scale = function(vec0, scalar, resultVec) {
  resultVec[0] = vec0[0] * scalar;
  resultVec[1] = vec0[1] * scalar;
  resultVec[2] = vec0[2] * scalar;
  resultVec[3] = vec0[3] * scalar;
  return resultVec;
};


/**
 * Returns the magnitudeSquared of the given vector.
 *
 * @param {goog.vec.vec4f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec4f.magnitudeSquared = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return x * x + y * y + z * z + w * w;
};


/**
 * Returns the magnitude of the given vector.
 *
 * @param {goog.vec.vec4f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec4f.magnitude = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
};


/**
 * Normalizes the given vector storing the result into resultVec.
 *
 * @param {goog.vec.vec4f.Type} vec0 The vector to normalize.
 * @param {goog.vec.vec4f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.normalize = function(vec0, resultVec) {
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3];
  var ilen = 1 / Math.sqrt(x * x + y * y + z * z + w * w);
  resultVec[0] = x * ilen;
  resultVec[1] = y * ilen;
  resultVec[2] = z * ilen;
  resultVec[3] = w * ilen;
  return resultVec;
};


/**
 * Returns the scalar product of vectors v0 and v1.
 *
 * @param {goog.vec.vec4f.Type} v0 The first vector.
 * @param {goog.vec.vec4f.Type} v1 The second vector.
 * @return {number} The scalar product.
 */
goog.vec.vec4f.dot = function(v0, v1) {
  return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2] + v0[3] * v1[3];
};


/**
 * Linearly interpolate from v0 to v1 according to f. The value of f should be
 * in the range [0..1] otherwise the results are undefined.
 *
 * @param {goog.vec.vec4f.Type} v0 The first vector.
 * @param {goog.vec.vec4f.Type} v1 The second vector.
 * @param {number} f The interpolation factor.
 * @param {goog.vec.vec4f.Type} resultVec The vector to receive the
 *     results (may be v0 or v1).
 * @return {!goog.vec.vec4f.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec4f.lerp = function(v0, v1, f, resultVec) {
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
 * @param {goog.vec.vec4f.Type} v0 The first vector.
 * @param {goog.vec.vec4f.Type} v1 The second vector.
 * @return {boolean} True if the vectors are equal, false otherwise.
 */
goog.vec.vec4f.equals = function(v0, v1) {
  return v0.length == v1.length &&
      v0[0] == v1[0] && v0[1] == v1[1] && v0[2] == v1[2] && v0[3] == v1[3];
};
