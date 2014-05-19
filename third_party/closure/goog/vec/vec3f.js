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
// Any edits to this file must be applied to vec3d.js by running:            //
//   swap_type.sh vec3f.js > vec3d.js                                        //
//                                                                           //
////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////


/**
 * @fileoverview Provides functions for operating on 3 element float (32bit)
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
goog.provide('goog.vec.vec3f');
goog.provide('goog.vec.vec3f.Type');

/** @suppress {extraRequire} */
goog.require('goog.vec');

/** @typedef {goog.vec.Float32} */ goog.vec.vec3f.Type;


/**
 * Creates a vec3f with all elements initialized to zero.
 *
 * @return {!goog.vec.vec3f.Type} The new vec3f.
 */
goog.vec.vec3f.create = function() {
  return new Float32Array(3);
};


/**
 * Initializes the vector with the given values.
 *
 * @param {goog.vec.vec3f.Type} vec The vector to receive the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @return {!goog.vec.vec3f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.setFromValues = function(vec, v0, v1, v2) {
  vec[0] = v0;
  vec[1] = v1;
  vec[2] = v2;
  return vec;
};


/**
 * Initializes vec3f vec from vec3f src.
 *
 * @param {goog.vec.vec3f.Type} vec The destination vector.
 * @param {goog.vec.vec3f.Type} src The source vector.
 * @return {!goog.vec.vec3f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.setFromVec3f = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  return vec;
};


/**
 * Initializes vec3f vec from vec3d src (typed as a Float64Array to
 * avoid circular goog.requires).
 *
 * @param {goog.vec.vec3f.Type} vec The destination vector.
 * @param {Float64Array} src The source vector.
 * @return {!goog.vec.vec3f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.setFromVec3d = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  return vec;
};


/**
 * Initializes vec3f vec from Array src.
 *
 * @param {goog.vec.vec3f.Type} vec The destination vector.
 * @param {Array.<number>} src The source vector.
 * @return {!goog.vec.vec3f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.setFromArray = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  vec[2] = src[2];
  return vec;
};


/**
 * Performs a component-wise addition of vec0 and vec1 together storing the
 * result into resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The first addend.
 * @param {goog.vec.vec3f.Type} vec1 The second addend.
 * @param {goog.vec.vec3f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.add = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] + vec1[0];
  resultVec[1] = vec0[1] + vec1[1];
  resultVec[2] = vec0[2] + vec1[2];
  return resultVec;
};


/**
 * Performs a component-wise subtraction of vec1 from vec0 storing the
 * result into resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The minuend.
 * @param {goog.vec.vec3f.Type} vec1 The subtrahend.
 * @param {goog.vec.vec3f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.subtract = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] - vec1[0];
  resultVec[1] = vec0[1] - vec1[1];
  resultVec[2] = vec0[2] - vec1[2];
  return resultVec;
};


/**
 * Negates vec0, storing the result into resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The vector to negate.
 * @param {goog.vec.vec3f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.negate = function(vec0, resultVec) {
  resultVec[0] = -vec0[0];
  resultVec[1] = -vec0[1];
  resultVec[2] = -vec0[2];
  return resultVec;
};


/**
 * Takes the absolute value of each component of vec0 storing the result in
 * resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The source vector.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the result.
 *     May be vec0.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.abs = function(vec0, resultVec) {
  resultVec[0] = Math.abs(vec0[0]);
  resultVec[1] = Math.abs(vec0[1]);
  resultVec[2] = Math.abs(vec0[2]);
  return resultVec;
};


/**
 * Multiplies each component of vec0 with scalar storing the product into
 * resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The source vector.
 * @param {number} scalar The value to multiply with each component of vec0.
 * @param {goog.vec.vec3f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.scale = function(vec0, scalar, resultVec) {
  resultVec[0] = vec0[0] * scalar;
  resultVec[1] = vec0[1] * scalar;
  resultVec[2] = vec0[2] * scalar;
  return resultVec;
};


/**
 * Returns the magnitudeSquared of the given vector.
 *
 * @param {goog.vec.vec3f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec3f.magnitudeSquared = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2];
  return x * x + y * y + z * z;
};


/**
 * Returns the magnitude of the given vector.
 *
 * @param {goog.vec.vec3f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec3f.magnitude = function(vec0) {
  var x = vec0[0], y = vec0[1], z = vec0[2];
  return Math.sqrt(x * x + y * y + z * z);
};


/**
 * Normalizes the given vector storing the result into resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The vector to normalize.
 * @param {goog.vec.vec3f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.normalize = function(vec0, resultVec) {
  var x = vec0[0], y = vec0[1], z = vec0[2];
  var ilen = 1 / Math.sqrt(x * x + y * y + z * z);
  resultVec[0] = x * ilen;
  resultVec[1] = y * ilen;
  resultVec[2] = z * ilen;
  return resultVec;
};


/**
 * Returns the scalar product of vectors v0 and v1.
 *
 * @param {goog.vec.vec3f.Type} v0 The first vector.
 * @param {goog.vec.vec3f.Type} v1 The second vector.
 * @return {number} The scalar product.
 */
goog.vec.vec3f.dot = function(v0, v1) {
  return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
};


/**
 * Computes the vector (cross) product of v0 and v1 storing the result into
 * resultVec.
 *
 * @param {goog.vec.vec3f.Type} v0 The first vector.
 * @param {goog.vec.vec3f.Type} v1 The second vector.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the
 *     results. May be either v0 or v1.
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.cross = function(v0, v1, resultVec) {
  var x0 = v0[0], y0 = v0[1], z0 = v0[2];
  var x1 = v1[0], y1 = v1[1], z1 = v1[2];
  resultVec[0] = y0 * z1 - z0 * y1;
  resultVec[1] = z0 * x1 - x0 * z1;
  resultVec[2] = x0 * y1 - y0 * x1;
  return resultVec;
};


/**
 * Returns the squared distance between two points.
 *
 * @param {goog.vec.vec3f.Type} vec0 First point.
 * @param {goog.vec.vec3f.Type} vec1 Second point.
 * @return {number} The squared distance between the points.
 */
goog.vec.vec3f.distanceSquared = function(vec0, vec1) {
  var x = vec0[0] - vec1[0];
  var y = vec0[1] - vec1[1];
  var z = vec0[2] - vec1[2];
  return x * x + y * y + z * z;
};


/**
 * Returns the distance between two points.
 *
 * @param {goog.vec.vec3f.Type} vec0 First point.
 * @param {goog.vec.vec3f.Type} vec1 Second point.
 * @return {number} The distance between the points.
 */
goog.vec.vec3f.distance = function(vec0, vec1) {
  return Math.sqrt(goog.vec.vec3f.distanceSquared(vec0, vec1));
};


/**
 * Returns a unit vector pointing from one point to another.
 * If the input points are equal then the result will be all zeros.
 *
 * @param {goog.vec.vec3f.Type} vec0 Origin point.
 * @param {goog.vec.vec3f.Type} vec1 Target point.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the
 *     results (may be vec0 or vec1).
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.direction = function(vec0, vec1, resultVec) {
  var x = vec1[0] - vec0[0];
  var y = vec1[1] - vec0[1];
  var z = vec1[2] - vec0[2];
  var d = Math.sqrt(x * x + y * y + z * z);
  if (d) {
    d = 1 / d;
    resultVec[0] = x * d;
    resultVec[1] = y * d;
    resultVec[2] = z * d;
  } else {
    resultVec[0] = resultVec[1] = resultVec[2] = 0;
  }
  return resultVec;
};


/**
 * Linearly interpolate from vec0 to v1 according to f. The value of f should be
 * in the range [0..1] otherwise the results are undefined.
 *
 * @param {goog.vec.vec3f.Type} v0 The first vector.
 * @param {goog.vec.vec3f.Type} v1 The second vector.
 * @param {number} f The interpolation factor.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the
 *     results (may be v0 or v1).
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.lerp = function(v0, v1, f, resultVec) {
  var x = v0[0], y = v0[1], z = v0[2];
  resultVec[0] = (v1[0] - x) * f + x;
  resultVec[1] = (v1[1] - y) * f + y;
  resultVec[2] = (v1[2] - z) * f + z;
  return resultVec;
};


/**
 * Compares the components of vec0 with the components of another vector or
 * scalar, storing the larger values in resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The source vector.
 * @param {goog.vec.vec3f.Type|number} limit The limit vector or scalar.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the
 *     results (may be vec0 or limit).
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.max = function(vec0, limit, resultVec) {
  if (goog.isNumber(limit)) {
    resultVec[0] = Math.max(vec0[0], limit);
    resultVec[1] = Math.max(vec0[1], limit);
    resultVec[2] = Math.max(vec0[2], limit);
  } else {
    resultVec[0] = Math.max(vec0[0], limit[0]);
    resultVec[1] = Math.max(vec0[1], limit[1]);
    resultVec[2] = Math.max(vec0[2], limit[2]);
  }
  return resultVec;
};


/**
 * Compares the components of vec0 with the components of another vector or
 * scalar, storing the smaller values in resultVec.
 *
 * @param {goog.vec.vec3f.Type} vec0 The source vector.
 * @param {goog.vec.vec3f.Type|number} limit The limit vector or scalar.
 * @param {goog.vec.vec3f.Type} resultVec The vector to receive the
 *     results (may be vec0 or limit).
 * @return {!goog.vec.vec3f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec3f.min = function(vec0, limit, resultVec) {
  if (goog.isNumber(limit)) {
    resultVec[0] = Math.min(vec0[0], limit);
    resultVec[1] = Math.min(vec0[1], limit);
    resultVec[2] = Math.min(vec0[2], limit);
  } else {
    resultVec[0] = Math.min(vec0[0], limit[0]);
    resultVec[1] = Math.min(vec0[1], limit[1]);
    resultVec[2] = Math.min(vec0[2], limit[2]);
  }
  return resultVec;
};


/**
 * Returns true if the components of v0 are equal to the components of v1.
 *
 * @param {goog.vec.vec3f.Type} v0 The first vector.
 * @param {goog.vec.vec3f.Type} v1 The second vector.
 * @return {boolean} True if the vectors are equal, false otherwise.
 */
goog.vec.vec3f.equals = function(v0, v1) {
  return v0.length == v1.length &&
      v0[0] == v1[0] && v0[1] == v1[1] && v0[2] == v1[2];
};
