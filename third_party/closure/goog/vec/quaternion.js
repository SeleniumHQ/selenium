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
goog.provide('goog.vec.Quaternion.AnyType');

goog.require('goog.vec');
goog.require('goog.vec.Vec3');
goog.require('goog.vec.Vec4');


/** @typedef {goog.vec.Float32} */ goog.vec.Quaternion.Float32;
/** @typedef {goog.vec.Float64} */ goog.vec.Quaternion.Float64;
/** @typedef {goog.vec.Number} */ goog.vec.Quaternion.Number;
/** @typedef {goog.vec.AnyType} */ goog.vec.Quaternion.AnyType;


/**
 * Creates a Float32 quaternion, initialized to zero.
 *
 * @return {!goog.vec.Quaternion.Float32} The new quaternion.
 */
goog.vec.Quaternion.createFloat32 = goog.vec.Vec4.createFloat32;


/**
 * Creates a Float64 quaternion, initialized to zero.
 *
 * @return {!goog.vec.Quaternion.Float64} The new quaternion.
 */
goog.vec.Quaternion.createFloat64 = goog.vec.Vec4.createFloat64;


/**
 * Creates a Number quaternion, initialized to zero.
 *
 * @return {goog.vec.Quaternion.Number} The new quaternion.
 */
goog.vec.Quaternion.createNumber = goog.vec.Vec4.createNumber;


/**
 * Creates a new Float32 quaternion initialized with the values from the
 * supplied array.
 *
 * @param {!goog.vec.AnyType} vec The source 4 element array.
 * @return {!goog.vec.Quaternion.Float32} The new quaternion.
 */
goog.vec.Quaternion.createFloat32FromArray =
    goog.vec.Vec4.createFloat32FromArray;


/**
 * Creates a new Float64 quaternion initialized with the values from the
 * supplied array.
 *
 * @param {!goog.vec.AnyType} vec The source 4 element array.
 * @return {!goog.vec.Quaternion.Float64} The new quaternion.
 */
goog.vec.Quaternion.createFloat64FromArray =
    goog.vec.Vec4.createFloat64FromArray;


/**
 * Creates a new Float32 quaternion initialized with the supplied values.
 *
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Quaternion.Float32} The new quaternion.
 */
goog.vec.Quaternion.createFloat32FromValues =
    goog.vec.Vec4.createFloat32FromValues;


/**
 * Creates a new Float64 quaternion initialized with the supplied values.
 *
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Quaternion.Float64} The new quaternion.
 */
goog.vec.Quaternion.createFloat64FromValues =
    goog.vec.Vec4.createFloat64FromValues;


/**
 * Creates a clone of the given Float32 quaternion.
 *
 * @param {!goog.vec.Quaternion.Float32} q The source quaternion.
 * @return {!goog.vec.Quaternion.Float32} The new quaternion.
 */
goog.vec.Quaternion.cloneFloat32 = goog.vec.Vec4.cloneFloat32;


/**
 * Creates a clone of the given Float64 quaternion.
 *
 * @param {!goog.vec.Quaternion.Float64} q The source quaternion.
 * @return {!goog.vec.Quaternion.Float64} The new quaternion.
 */
goog.vec.Quaternion.cloneFloat64 = goog.vec.Vec4.cloneFloat64;


/**
 * Creates a Float32 quaternion, initialized to the identity.
 *
 * @return {!goog.vec.Quaternion.Float32} The new quaternion.
 */
goog.vec.Quaternion.createIdentityFloat32 = function() {
  var quat = goog.vec.Quaternion.createFloat32();
  goog.vec.Quaternion.makeIdentity(quat);
  return quat;
};


/**
 * Creates a Float64 quaternion, initialized to the identity.
 *
 * @return {!goog.vec.Quaternion.Float64} The new quaternion.
 */
goog.vec.Quaternion.createIdentityFloat64 = function() {
  var quat = goog.vec.Quaternion.createFloat64();
  goog.vec.Quaternion.makeIdentity(quat);
  return quat;
};


/**
 * Initializes the quaternion with the given values.
 *
 * @param {!goog.vec.Quaternion.AnyType} q The quaternion to receive
 *     the values.
 * @param {number} v0 The value for element at index 0.
 * @param {number} v1 The value for element at index 1.
 * @param {number} v2 The value for element at index 2.
 * @param {number} v3 The value for element at index 3.
 * @return {!goog.vec.Vec4.AnyType} return q so that operations can be
 *     chained together.
 */
goog.vec.Quaternion.setFromValues = goog.vec.Vec4.setFromValues;


/**
 * Initializes the quaternion with the given array of values.
 *
 * @param {!goog.vec.Quaternion.AnyType} q The quaternion to receive
 *     the values.
 * @param {!goog.vec.AnyType} values The array of values.
 * @return {!goog.vec.Quaternion.AnyType} return q so that operations can be
 *     chained together.
 */
goog.vec.Quaternion.setFromArray = goog.vec.Vec4.setFromArray;


/**
 * Adds the two quaternions.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The first addend.
 * @param {!goog.vec.Quaternion.AnyType} quat1 The second addend.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result. May be quat0 or quat1.
 */
goog.vec.Quaternion.add = goog.vec.Vec4.add;


/**
 * Negates a quaternion, storing the result into resultQuat.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The quaternion to negate.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.negate = goog.vec.Vec4.negate;


/**
 * Multiplies each component of quat0 with scalar storing the product into
 * resultVec.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The source quaternion.
 * @param {number} scalar The value to multiply with each component of quat0.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.scale = goog.vec.Vec4.scale;


/**
 * Returns the square magnitude of the given quaternion.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The quaternion.
 * @return {number} The magnitude of the quaternion.
 */
goog.vec.Quaternion.magnitudeSquared = goog.vec.Vec4.magnitudeSquared;


/**
 * Returns the magnitude of the given quaternion.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The quaternion.
 * @return {number} The magnitude of the quaternion.
 */
goog.vec.Quaternion.magnitude = goog.vec.Vec4.magnitude;


/**
 * Normalizes the given quaternion storing the result into resultVec.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The quaternion to
 *     normalize.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result. May be quat0.
 */
goog.vec.Quaternion.normalize = goog.vec.Vec4.normalize;


/**
 * Computes the dot (scalar) product of two quaternions.
 *
 * @param {!goog.vec.Quaternion.AnyType} q0 The first quaternion.
 * @param {!goog.vec.Quaternion.AnyType} q1 The second quaternion.
 * @return {number} The scalar product.
 */
goog.vec.Quaternion.dot = goog.vec.Vec4.dot;


/**
 * Computes the inverse of the quaternion in quat, storing the result into
 * resultQuat.
 *
 * If the quaternion is already normalized, goog.vec.Quaternion.conjugate
 * is faster than this function and produces the same result.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion to invert.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to receive
 *     the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.invert = function(quat, resultQuat) {
  var a0 = quat[0], a1 = quat[1], a2 = quat[2], a3 = quat[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0;

  resultQuat[0] = -a0 * invDot;
  resultQuat[1] = -a1 * invDot;
  resultQuat[2] = -a2 * invDot;
  resultQuat[3] = a3 * invDot;
  return resultQuat;
};


/**
 * Computes the conjugate of the quaternion in quat, storing the result into
 * resultQuat.
 *
 * If the quaternion is normalized already, this function is faster than
 * goog.Quaternion.inverse and produces the same result.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The source quaternion.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.conjugate = function(quat, resultQuat) {
  resultQuat[0] = -quat[0];
  resultQuat[1] = -quat[1];
  resultQuat[2] = -quat[2];
  resultQuat[3] = quat[3];
  return resultQuat;
};


/**
 * Concatenates the two quaternions storing the result into resultQuat.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat0 The first quaternion.
 * @param {!goog.vec.Quaternion.AnyType} quat1 The second quaternion.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.concat = function(quat0, quat1, resultQuat) {
  var x0 = quat0[0], y0 = quat0[1], z0 = quat0[2], w0 = quat0[3];
  var x1 = quat1[0], y1 = quat1[1], z1 = quat1[2], w1 = quat1[3];
  resultQuat[0] = w0 * x1 + x0 * w1 + y0 * z1 - z0 * y1;
  resultQuat[1] = w0 * y1 - x0 * z1 + y0 * w1 + z0 * x1;
  resultQuat[2] = w0 * z1 + x0 * y1 - y0 * x1 + z0 * w1;
  resultQuat[3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
  return resultQuat;
};


/**
 * Makes the given quaternion the identity quaternion (0, 0, 0, 1).
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion.
 * @return {!goog.vec.Quaternion.AnyType} Return quat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.makeIdentity = function(quat) {
  quat[0] = 0;
  quat[1] = 0;
  quat[2] = 0;
  quat[3] = 1;
  return quat;
};


/**
 * Generates a unit quaternion from the given angle-axis rotation pair.
 * The rotation axis is not required to be a unit vector, but should
 * have non-zero length.  The angle should be specified in radians.
 *
 * @param {number} angle The angle (in radians) to rotate about the axis.
 * @param {!goog.vec.Quaternion.AnyType} axis Unit vector specifying the
 *     axis of rotation.
 * @param {!goog.vec.Quaternion.AnyType} quat Unit quaternion to store the
 *     result.
 * @return {!goog.vec.Quaternion.AnyType} Return quat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.fromAngleAxis = function(angle, axis, quat) {
  // Normalize the axis of rotation.
  goog.vec.Vec3.normalize(axis, axis);

  var halfAngle = 0.5 * angle;
  var sin = Math.sin(halfAngle);
  goog.vec.Quaternion.setFromValues(
      quat, sin * axis[0], sin * axis[1], sin * axis[2], Math.cos(halfAngle));

  // Normalize the resulting quaternion.
  goog.vec.Quaternion.normalize(quat, quat);
  return quat;
};


/**
 * Generates an angle-axis rotation pair from a unit quaternion.
 * The quaternion is assumed to be of unit length.  The calculated
 * values are returned via the passed 'axis' object and the 'angle'
 * number returned by the function itself. The returned rotation axis
 * is a non-zero length unit vector, and the returned angle is in
 * radians in the range of [-PI, +PI].
 *
 * @param {!goog.vec.Quaternion.AnyType} quat Unit quaternion to convert.
 * @param {!goog.vec.Quaternion.AnyType} axis Vector to store the returned
 *     rotation axis.
 * @return {number} angle Angle (in radians) to rotate about 'axis'.
 *     The range of the returned angle is [-PI, +PI].
 */
goog.vec.Quaternion.toAngleAxis = function(quat, axis) {
  var angle = 2 * Math.acos(quat[3]);
  var magnitude = Math.min(Math.max(1 - quat[3] * quat[3], 0), 1);
  if (magnitude < goog.vec.EPSILON) {
    // This is nearly an identity rotation, so just use a fixed +X axis.
    goog.vec.Vec3.setFromValues(axis, 1, 0, 0);
  } else {
    // Compute the proper rotation axis.
    goog.vec.Vec3.setFromValues(axis, quat[0], quat[1], quat[2]);
    // Make sure the rotation axis is of unit length.
    goog.vec.Vec3.normalize(axis, axis);
  }
  // Adjust the range of the returned angle to [-PI, +PI].
  if (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }
  return angle;
};


/**
 * Generates the quaternion from the given 3x3 rotation matrix.
 *
 * Perf: http://jsperf.com/conversion-of-3x3-matrix-to-quaternion
 *       http://jsperf.com/goog-vec-fromrotationmatrix3-a
 *
 * @param {!goog.vec.AnyType} matrix The source matrix.
 * @param {!goog.vec.Quaternion.AnyType} quat The resulting quaternion.
 * @return {!goog.vec.Quaternion.AnyType} Return quat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.fromRotationMatrix3 = function(matrix, quat) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = matrix[0] + matrix[4] + matrix[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0);  // 2w
    quat[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;  // 1 / (4w)
    quat[0] = (matrix[5] - matrix[7]) * fRoot;
    quat[1] = (matrix[6] - matrix[2]) * fRoot;
    quat[2] = (matrix[1] - matrix[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (matrix[4] > matrix[0]) i = 1;
    if (matrix[8] > matrix[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;

    fRoot = Math.sqrt(
        matrix[i * 3 + i] - matrix[j * 3 + j] - matrix[k * 3 + k] + 1.0);
    quat[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    quat[3] = (matrix[j * 3 + k] - matrix[k * 3 + j]) * fRoot;
    quat[j] = (matrix[j * 3 + i] + matrix[i * 3 + j]) * fRoot;
    quat[k] = (matrix[k * 3 + i] + matrix[i * 3 + k]) * fRoot;

    // Flip all signs if w is negative.
    if (quat[3] < 0) {
      quat[0] = -quat[0];
      quat[1] = -quat[1];
      quat[2] = -quat[2];
      quat[3] = -quat[3];
    }
  }
  return quat;
};


/**
 * Generates the quaternion from the given 4x4 rotation matrix.
 *
 * Perf: http://jsperf.com/goog-vec-fromrotationmatrix4
 *
 * Implementation is the same as fromRotationMatrix3 but using indices from
 * the top left 3x3 in a 4x4 matrix.
 *
 * @param {!goog.vec.AnyType} matrix The source matrix.
 * @param {!goog.vec.Quaternion.AnyType} quat The resulting quaternion.
 * @return {!goog.vec.Quaternion.AnyType} Return quat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.fromRotationMatrix4 = function(matrix, quat) {
  var fTrace = matrix[0] + matrix[5] + matrix[10];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0);  // 2w
    quat[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;  // 1 / (4w)
    quat[0] = (matrix[6] - matrix[9]) * fRoot;
    quat[1] = (matrix[8] - matrix[2]) * fRoot;
    quat[2] = (matrix[1] - matrix[4]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (matrix[8] > matrix[0]) i = 1;
    if (matrix[10] > matrix[i * 4 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;

    fRoot = Math.sqrt(
        matrix[i * 4 + i] - matrix[j * 4 + j] - matrix[k * 4 + k] + 1.0);
    quat[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    quat[3] = (matrix[j * 4 + k] - matrix[k * 4 + j]) * fRoot;
    quat[j] = (matrix[j * 4 + i] + matrix[i * 4 + j]) * fRoot;
    quat[k] = (matrix[k * 4 + i] + matrix[i * 4 + k]) * fRoot;

    // Flip all signs if w is negative.
    if (quat[3] < 0) {
      quat[0] = -quat[0];
      quat[1] = -quat[1];
      quat[2] = -quat[2];
      quat[3] = -quat[3];
    }
  }
  return quat;
};


/**
 * Generates the 3x3 rotation matrix from the given quaternion.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The source quaternion.
 * @param {!goog.vec.AnyType} matrix The resulting matrix.
 * @return {!goog.vec.AnyType} Return resulting matrix so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.toRotationMatrix3 = function(quat, matrix) {
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
  matrix[3] = xy - wz;
  matrix[4] = 1 - (xx + zz);
  matrix[5] = yz + wx;
  matrix[6] = xz + wy;
  matrix[7] = yz - wx;
  matrix[8] = 1 - (xx + yy);
  return matrix;
};


/**
 * Generates the 4x4 rotation matrix from the given quaternion.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The source quaternion.
 * @param {!goog.vec.AnyType} matrix The resulting matrix.
 * @return {!goog.vec.AnyType} Return resulting matrix so that
 *     operations can be chained together.
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
  return matrix;
};


/**
 * Rotates a quaternion by the given angle about the X axis.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion.
 * @param {number} angle The angle in radians.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.rotateX = function(quat, angle, resultQuat) {
  angle *= 0.5;
  var ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
  var bx = Math.sin(angle), bw = Math.cos(angle);

  resultQuat[0] = ax * bw + aw * bx;
  resultQuat[1] = ay * bw + az * bx;
  resultQuat[2] = az * bw - ay * bx;
  resultQuat[3] = aw * bw - ax * bx;
  return resultQuat;
};


/**
 * Rotates a quaternion by the given angle about the Y axis.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion.
 * @param {number} angle The angle in radians.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.rotateY = function(quat, angle, resultQuat) {
  angle *= 0.5;
  var ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
  var by = Math.sin(angle), bw = Math.cos(angle);

  resultQuat[0] = ax * bw - az * by;
  resultQuat[1] = ay * bw + aw * by;
  resultQuat[2] = az * bw + ax * by;
  resultQuat[3] = aw * bw - ay * by;
  return resultQuat;
};


/**
 * Rotates a quaternion by the given angle about the Z axis.
 *
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion.
 * @param {number} angle The angle in radians.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.rotateZ = function(quat, angle, resultQuat) {
  angle *= 0.5;
  var ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
  var bz = Math.sin(angle), bw = Math.cos(angle);

  resultQuat[0] = ax * bw + ay * bz;
  resultQuat[1] = ay * bw - ax * bz;
  resultQuat[2] = az * bw + aw * bz;
  resultQuat[3] = aw * bw - az * bz;
  return resultQuat;
};


/**
 * Transforms a vec with a quaternion. Works on both vec3s and vec4s.
 *
 * @param {!goog.vec.AnyType} vec The vec to transform.
 * @param {!goog.vec.Quaternion.AnyType} quat The quaternion.
 * @param {!goog.vec.AnyType} resultVec The vec to receive the result.
 * @return {!goog.vec.AnyType} Return resultVec so that operations can be
 *     chained together. Note that the caller is responsible for type-casting.
 */
goog.vec.Quaternion.transformVec = function(vec, quat, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];
  // Calculate quat * vec.
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;
  // Calculate result * inverse quat.
  resultVec[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  resultVec[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  resultVec[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return resultVec;
};


/**
 * Computes the spherical linear interpolated value from the given quaternions
 * q0 and q1 according to the coefficient t. The resulting quaternion is stored
 * in resultQuat.
 *
 * @param {!goog.vec.Quaternion.AnyType} q0 The first quaternion.
 * @param {!goog.vec.Quaternion.AnyType} q1 The second quaternion.
 * @param {number} t The interpolating coefficient.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the result.
 * @return {!goog.vec.Quaternion.AnyType} Return resultQuat so that
 *     operations can be chained together.
 */
goog.vec.Quaternion.slerp = function(q0, q1, t, resultQuat) {
  // Compute the dot product between q0 and q1 (cos of the angle between q0 and
  // q1). If it's outside the interval [-1,1], then the arccos is not defined.
  // The usual reason for this is that q0 and q1 are colinear. In this case
  // the angle between the two is zero, so just return q1.
  var cosVal = goog.vec.Quaternion.dot(q0, q1);
  if (cosVal > 1 || cosVal < -1) {
    goog.vec.Vec4.setFromArray(resultQuat, q1);
    return resultQuat;
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
    goog.vec.Vec4.setFromArray(resultQuat, q1);
    return resultQuat;
  }

  // Compute the coefficients and interpolate.
  var invSinVal = 1 / Math.sin(angle);
  var c0 = Math.sin((1 - t) * angle) * invSinVal;
  var c1 = factor * Math.sin(t * angle) * invSinVal;

  resultQuat[0] = q0[0] * c0 + q1[0] * c1;
  resultQuat[1] = q0[1] * c0 + q1[1] * c1;
  resultQuat[2] = q0[2] * c0 + q1[2] * c1;
  resultQuat[3] = q0[3] * c0 + q1[3] * c1;
  return resultQuat;
};


/**
 * Compute the simple linear interpolation of the two quaternions q0 and q1
 * according to the coefficient t. The resulting quaternion is stored in
 * resultVec.
 *
 * @param {!goog.vec.Quaternion.AnyType} q0 The first quaternion.
 * @param {!goog.vec.Quaternion.AnyType} q1 The second quaternion.
 * @param {number} t The interpolation factor.
 * @param {!goog.vec.Quaternion.AnyType} resultQuat The quaternion to
 *     receive the results (may be q0 or q1).
 */
goog.vec.Quaternion.nlerp = goog.vec.Vec4.lerp;
