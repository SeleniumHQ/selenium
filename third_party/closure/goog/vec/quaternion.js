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
 * @fileoverview Implements quaternions and their conversion functions. In this
 * implementation, quaternions are represented as 4 element vectors with the
 * first 3 elements holding the imaginary components and the 4th element holding
 * the real component.
 *
 */
goog.provide('goog.vec.Quaternion');

goog.require('goog.vec');
goog.require('goog.vec.Vec4');



/**
 * @typedef {goog.vec.Vec4.Type}
 */
goog.vec.Quaternion.Type;


/**
 * Creates a quaternion (4 element vector), initialized to zero.
 *
 * @return {goog.vec.Quaternion.Type} The new quaternion.
 */
goog.vec.Quaternion.create = goog.vec.Vec4.create;


/**
 * Creates a new quaternion initialized with the values from the supplied
 * array.
 *
 * @param {goog.vec.ArrayType} vec The source 4 element array.
 * @return {!goog.vec.Quaternion.Type} The new quaternion.
 */
goog.vec.Quaternion.createFromArray =
    goog.vec.Vec4.createFromArray;


/**
 * Creates a new quaternion initialized with the supplied values.
 *
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Quaternion.Type} The new quaternion.
 */
goog.vec.Quaternion.createFromValues =
    goog.vec.Vec4.createFromValues;


/**
 * Creates a clone of the given quaternion.
 *
 * @param {goog.vec.Quaternion.Type} q The source quaternion.
 * @return {goog.vec.Quaternion.Type} The new quaternion.
 */
goog.vec.Quaternion.clone =
    goog.vec.Vec4.clone;


/**
 * Initializes the quaternion with the given values.
 *
 * @param {goog.vec.ArrayType} q The quaternion to receive
 *     the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 2.
 */
goog.vec.Quaternion.setFromValues =
    goog.vec.Vec4.setFromValues;


/**
 * Initializes the quaternion with the given array of values.
 *
 * @param {goog.vec.ArrayType} q The quaternion to receive
 *     the values.
 * @param {goog.vec.ArrayType} values The array of values.
 */
goog.vec.Quaternion.setFromArray =
    goog.vec.Vec4.setFromArray;


/**
 * Adds the two quaternions.
 *
 * @param {goog.vec.ArrayType} quat0 The first addend.
 * @param {goog.vec.ArrayType} quat1 The second addend.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result. May be quat0 or quat1.
 */
goog.vec.Quaternion.add = goog.vec.Vec4.add;


/**
 * Negates a quaternion, storing the result into resultQuat.
 *
 * @param {goog.vec.ArrayType} quat0 The quaternion to negate.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.negate = goog.vec.Vec4.negate;


/**
 * Multiplies each component of quat0 with scalar storing the product into
 * resultVec.
 *
 * @param {goog.vec.ArrayType} quat0 The source quaternion.
 * @param {number} scalar The value to multiply with each component of quat0.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.scale = goog.vec.Vec4.scale;


/**
 * Returns the square magnitude of the given quaternion.
 *
 * @param {goog.vec.ArrayType} quat0 The quaternion.
 * @return {number} The magnitude of the quaternion.
 */
goog.vec.Quaternion.magnitudeSquared =
    goog.vec.Vec4.magnitudeSquared;


/**
 * Returns the magnitude of the given quaternion.
 *
 * @param {goog.vec.ArrayType} quat0 The quaternion.
 * @return {number} The magnitude of the quaternion.
 */
goog.vec.Quaternion.magnitude =
    goog.vec.Vec4.magnitude;


/**
 * Normalizes the given quaternion storing the result into resultVec.
 *
 * @param {goog.vec.ArrayType} quat0 The quaternion to normalize.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.normalize = goog.vec.Vec4.normalize;


/**
 * Computes the dot (scalar) product of two quaternions.
 *
 * @param {goog.vec.ArrayType} q0 The first quaternion.
 * @param {goog.vec.ArrayType} q1 The second quaternion.
 * @return {number} The scalar product.
 */
goog.vec.Quaternion.dot = goog.vec.Vec4.dot;


/**
 * Computes the conjugate of the quaternion in quat storing the result into
 * resultQuat.
 *
 * @param {goog.vec.ArrayType} quat The source quaternion.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result.
 */
goog.vec.Quaternion.conjugate = function(quat, resultQuat) {
  resultQuat[0] = -quat[0];
  resultQuat[1] = -quat[1];
  resultQuat[2] = -quat[2];
  resultQuat[3] = quat[3];
};


/**
 * Concatenates the two quaternions storing the result into resultQuat.
 *
 * @param {goog.vec.ArrayType} quat0 The first quaternion.
 * @param {goog.vec.ArrayType} quat1 The second quaternion.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result.
 */
goog.vec.Quaternion.concat = function(quat0, quat1, resultQuat) {
  var x0 = quat0[0], y0 = quat0[1], z0 = quat0[2], w0 = quat0[3];
  var x1 = quat1[0], y1 = quat1[1], z1 = quat1[2], w1 = quat1[3];
  resultQuat[0] = w0 * x1 + x0 * w1 + y0 * z1 - z0 * y1;
  resultQuat[1] = w0 * y1 - x0 * z1 + y0 * w1 + z0 * x1;
  resultQuat[2] = w0 * z1 + x0 * y1 - y0 * x1 + z0 * w1;
  resultQuat[3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
};


/**
 * Generates the quaternion from the given rotation matrix.
 *
 * @param {goog.vec.ArrayType} matrix The source matrix.
 * @param {goog.vec.ArrayType} quat The resulting quaternion.
 */
goog.vec.Quaternion.fromRotationMatrix4 = function(matrix, quat) {
  var sx = matrix[0], sy = matrix[5], sz = matrix[10];
  quat[3] = Math.sqrt(Math.max(0, 1 + sx + sy + sz)) / 2;
  quat[0] = Math.sqrt(Math.max(0, 1 + sx - sy - sz)) / 2;
  quat[1] = Math.sqrt(Math.max(0, 1 - sx + sy - sz)) / 2;
  quat[2] = Math.sqrt(Math.max(0, 1 - sx - sy + sz)) / 2;

  quat[0] = (matrix[6] - matrix[9] < 0) != (quat[0] < 0) ? -quat[0] : quat[0];
  quat[1] = (matrix[8] - matrix[2] < 0) != (quat[1] < 0) ? -quat[1] : quat[1];
  quat[2] = (matrix[1] - matrix[4] < 0) != (quat[2] < 0) ? -quat[2] : quat[2];
};


/**
 * Generates the rotation matrix from the given quaternion.
 *
 * @param {goog.vec.ArrayType} quat The source quaternion.
 * @param {goog.vec.ArrayType} matrix The resulting matrix.
 */
goog.vec.Quaternion.toRotationMatrix4 = function(quat, matrix) {
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
  var x2 = 2 * x, y2 = 2 * y, z2 = 2 * z;
  var wx = x2 * w;
  var wy = y2 * w;
  var wz = z2 * w;
  var xx = x2 * x;
  var xy = y2 * x;
  var xz = z2 * x;
  var yy = y2 * y;
  var yz = z2 * y;
  var zz = z2 * z;

  matrix[0] = 1 - (yy + zz);
  matrix[1] = xy + wz;
  matrix[2] = xz - wy;
  matrix[3] = 0;
  matrix[4] = xy - wz;
  matrix[5] = 1 - (xx + zz);
  matrix[6] = yz + wx;
  matrix[7] = 0;
  matrix[8] = xz + wy;
  matrix[9] = yz - wx;
  matrix[10] = 1 - (xx + yy);
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


/**
 * Computes the spherical linear interpolated value from the given quaternions
 * q0 and q1 according to the coefficient t. The resulting quaternion is stored
 * in resultQuat.
 *
 * @param {goog.vec.ArrayType} q0 The first quaternion.
 * @param {goog.vec.ArrayType} q1 The second quaternion.
 * @param {number} t The interpolating coefficient.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the result.
 */
goog.vec.Quaternion.slerp = function(q0, q1, t, resultQuat) {
  // Compute the dot product between q0 and q1 (cos of the angle between q0 and
  // q1). If it's outside the interval [-1,1], then the arccos is not defined.
  // The usual reason for this is that q0 and q1 are colinear. In this case
  // the angle between the two is zero, so just return q1.
  var cosVal = goog.vec.Quaternion.dot(q0, q1);
  if (cosVal > 1 || cosVal < -1) {
    goog.vec.Quaternion.setFromArray(resultQuat, q1);
    return;
  }

  // Quaternions are a double cover on the space of rotations. That is, q and -q
  // represent the same rotation. Thus we have two possibilities when
  // interpolating between q0 and q1: going the short way or the long way. We
  // prefer the short way since that is the likely expectation from users.
  var factor = 1;
  if (cosVal < 0) {
    factor = -1;
    cosVal = -cosVal;
  }

  // Compute the angle between q0 and q1. If it's very small, then just return
  // q1 to avoid a very large denominator below.
  var angle = Math.acos(cosVal);
  if (angle <= goog.vec.EPSILON) {
    goog.vec.Quaternion.setFromArray(resultQuat, q1);
    return;
  }

  // Compute the coefficients and interpolate.
  var invSinVal = 1 / Math.sin(angle);
  var c0 = Math.sin((1 - t) * angle) * invSinVal;
  var c1 = factor * Math.sin(t * angle) * invSinVal;

  resultQuat[0] = q0[0] * c0 + q1[0] * c1;
  resultQuat[1] = q0[1] * c0 + q1[1] * c1;
  resultQuat[2] = q0[2] * c0 + q1[2] * c1;
  resultQuat[3] = q0[3] * c0 + q1[3] * c1;
};


/**
 * Compute the simple linear interpolation of the two quaternions q0 and q1
 * according to the coefficient t. The resulting quaternion is stored in
 * resultVec.
 *
 * @param {goog.vec.ArrayType} q0 The first quaternion.
 * @param {goog.vec.ArrayType} q1 The second quaternion.
 * @param {number} t The interpolation factor.
 * @param {goog.vec.ArrayType} resultQuat The quaternion to
 *     receive the results (may be q0 or q1).
 */
goog.vec.Quaternion.nlerp = goog.vec.Vec4.lerp;
