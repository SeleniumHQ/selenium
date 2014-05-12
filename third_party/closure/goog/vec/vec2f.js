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
// Any edits to this file must be applied to vec2d.js by running:            //
//   swap_type.sh vec2f.js > vec2d.js                                        //
//                                                                           //
////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////


/**
 * @fileoverview Provides functions for operating on 2 element float (32bit)
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

goog.provide('goog.vec.vec2f');
goog.provide('goog.vec.vec2f.Type');

/** @suppress {extraRequire} */
goog.require('goog.vec');


/** @typedef {goog.vec.Float32} */ goog.vec.vec2f.Type;


/**
 * Creates a vec2f with all elements initialized to zero.
 *
 * @return {!goog.vec.vec2f.Type} The new vec2f.
 */
goog.vec.vec2f.create = function() {
  return new Float32Array(2);
};


/**
 * Initializes the vector with the given values.
 *
 * @param {goog.vec.vec2f.Type} vec The vector to receive the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @return {!goog.vec.vec2f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.setFromValues = function(vec, v0, v1) {
  vec[0] = v0;
  vec[1] = v1;
  return vec;
};


/**
 * Initializes vec2f vec from vec2f src.
 *
 * @param {goog.vec.vec2f.Type} vec The destination vector.
 * @param {goog.vec.vec2f.Type} src The source vector.
 * @return {!goog.vec.vec2f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.setFromVec2f = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  return vec;
};


/**
 * Initializes vec2f vec from vec2d src (typed as a Float64Array to
 * avoid circular goog.requires).
 *
 * @param {goog.vec.vec2f.Type} vec The destination vector.
 * @param {Float64Array} src The source vector.
 * @return {!goog.vec.vec2f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.setFromVec2d = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  return vec;
};


/**
 * Initializes vec2f vec from Array src.
 *
 * @param {goog.vec.vec2f.Type} vec The destination vector.
 * @param {Array.<number>} src The source vector.
 * @return {!goog.vec.vec2f.Type} Return vec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.setFromArray = function(vec, src) {
  vec[0] = src[0];
  vec[1] = src[1];
  return vec;
};


/**
 * Performs a component-wise addition of vec0 and vec1 together storing the
 * result into resultVec.
 *
 * @param {goog.vec.vec2f.Type} vec0 The first addend.
 * @param {goog.vec.vec2f.Type} vec1 The second addend.
 * @param {goog.vec.vec2f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.add = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] + vec1[0];
  resultVec[1] = vec0[1] + vec1[1];
  return resultVec;
};


/**
 * Performs a component-wise subtraction of vec1 from vec0 storing the
 * result into resultVec.
 *
 * @param {goog.vec.vec2f.Type} vec0 The minuend.
 * @param {goog.vec.vec2f.Type} vec1 The subtrahend.
 * @param {goog.vec.vec2f.Type} resultVec The vector to
 *     receive the result. May be vec0 or vec1.
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.subtract = function(vec0, vec1, resultVec) {
  resultVec[0] = vec0[0] - vec1[0];
  resultVec[1] = vec0[1] - vec1[1];
  return resultVec;
};


/**
 * Negates vec0, storing the result into resultVec.
 *
 * @param {goog.vec.vec2f.Type} vec0 The vector to negate.
 * @param {goog.vec.vec2f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.negate = function(vec0, resultVec) {
  resultVec[0] = -vec0[0];
  resultVec[1] = -vec0[1];
  return resultVec;
};


/**
 * Multiplies each component of vec0 with scalar storing the product into
 * resultVec.
 *
 * @param {goog.vec.vec2f.Type} vec0 The source vector.
 * @param {number} scalar The value to multiply with each component of vec0.
 * @param {goog.vec.vec2f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.scale = function(vec0, scalar, resultVec) {
  resultVec[0] = vec0[0] * scalar;
  resultVec[1] = vec0[1] * scalar;
  return resultVec;
};


/**
 * Returns the magnitudeSquared of the given vector.
 *
 * @param {goog.vec.vec2f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec2f.magnitudeSquared = function(vec0) {
  var x = vec0[0], y = vec0[1];
  return x * x + y * y;
};


/**
 * Returns the magnitude of the given vector.
 *
 * @param {goog.vec.vec2f.Type} vec0 The vector.
 * @return {number} The magnitude of the vector.
 */
goog.vec.vec2f.magnitude = function(vec0) {
  var x = vec0[0], y = vec0[1];
  return Math.sqrt(x * x + y * y);
};


/**
 * Normalizes the given vector storing the result into resultVec.
 *
 * @param {goog.vec.vec2f.Type} vec0 The vector to normalize.
 * @param {goog.vec.vec2f.Type} resultVec The vector to
 *     receive the result. May be vec0.
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.normalize = function(vec0, resultVec) {
  var x = vec0[0], y = vec0[1];
  var ilen = 1 / Math.sqrt(x * x + y * y);
  resultVec[0] = x * ilen;
  resultVec[1] = y * ilen;
  return resultVec;
};


/**
 * Returns the scalar product of vectors vec0 and vec1.
 *
 * @param {goog.vec.vec2f.Type} vec0 The first vector.
 * @param {goog.vec.vec2f.Type} vec1 The second vector.
 * @return {number} The scalar product.
 */
goog.vec.vec2f.dot = function(vec0, vec1) {
  return vec0[0] * vec1[0] + vec0[1] * vec1[1];
};


/**
 * Returns the squared distance between two points.
 *
 * @param {goog.vec.vec2f.Type} vec0 First point.
 * @param {goog.vec.vec2f.Type} vec1 Second point.
 * @return {number} The squared distance between the points.
 */
goog.vec.vec2f.distanceSquared = function(vec0, vec1) {
  var x = vec0[0] - vec1[0];
  var y = vec0[1] - vec1[1];
  return x * x + y * y;
};


/**
 * Returns the distance between two points.
 *
 * @param {goog.vec.vec2f.Type} vec0 First point.
 * @param {goog.vec.vec2f.Type} vec1 Second point.
 * @return {number} The distance between the points.
 */
goog.vec.vec2f.distance = function(vec0, vec1) {
  return Math.sqrt(goog.vec.vec2f.distanceSquared(vec0, vec1));
};


/**
 * Returns a unit vector pointing from one point to another.
 * If the input points are equal then the result will be all zeros.
 *
 * @param {goog.vec.vec2f.Type} vec0 Origin point.
 * @param {goog.vec.vec2f.Type} vec1 Target point.
 * @param {goog.vec.vec2f.Type} resultVec The vector to receive the
 *     results (may be vec0 or vec1).
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.direction = function(vec0, vec1, resultVec) {
  var x = vec1[0] - vec0[0];
  var y = vec1[1] - vec0[1];
  var d = Math.sqrt(x * x + y * y);
  if (d) {
    d = 1 / d;
    resultVec[0] = x * d;
    resultVec[1] = y * d;
  } else {
    resultVec[0] = resultVec[1] = 0;
  }
  return resultVec;
};


/**
 * Linearly interpolate from vec0 to vec1 according to f. The value of f should
 * be in the range [0..1] otherwise the results are undefined.
 *
 * @param {goog.vec.vec2f.Type} vec0 The first vector.
 * @param {goog.vec.vec2f.Type} vec1 The second vector.
 * @param {number} f The interpolation factor.
 * @param {goog.vec.vec2f.Type} resultVec The vector to receive the
 *     results (may be vec0 or vec1).
 * @return {!goog.vec.vec2f.Type} Return resultVec so that operations can be
 *     chained together.
 */
goog.vec.vec2f.lerp = function(vec0, vec1, f, resultVec) {
  var x = vec0[0], y = vec0[1];
  resultVec[0] = (vec1[0] - x) * f + x;
  resultVec[1] = (vec1[1] - y) * f + y;
  return resultVec;
};


/**
 * Returns true if the components of vec0 are equal to the components of vec1.
 *
 * @param {goog.vec.vec2f.Type} vec0 The first vector.
 * @param {goog.vec.vec2f.Type} vec1 The second vector.
 * @return {boolean} True if the vectors are equal, false otherwise.
 */
goog.vec.vec2f.equals = function(vec0, vec1) {
  return vec0.length == vec1.length &&
      vec0[0] == vec1[0] && vec0[1] == vec1[1];
};
