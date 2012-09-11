// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides an object representation of an AffineTransform and
 * methods for working with it.
 */


goog.provide('goog.graphics.AffineTransform');

goog.require('goog.math');



/**
 * Creates a 2D affine transform. An affine transform performs a linear
 * mapping from 2D coordinates to other 2D coordinates that preserves the
 * "straightness" and "parallelness" of lines.
 *
 * Such a coordinate transformation can be represented by a 3 row by 3 column
 * matrix with an implied last row of [ 0 0 1 ]. This matrix transforms source
 * coordinates (x,y) into destination coordinates (x',y') by considering them
 * to be a column vector and multiplying the coordinate vector by the matrix
 * according to the following process:
 * <pre>
 *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
 *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
 *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
 * </pre>
 *
 * This class is optimized for speed and minimizes calculations based on its
 * knowledge of the underlying matrix (as opposed to say simply performing
 * matrix multiplication).
 *
 * @param {number=} opt_m00 The m00 coordinate of the transform.
 * @param {number=} opt_m10 The m10 coordinate of the transform.
 * @param {number=} opt_m01 The m01 coordinate of the transform.
 * @param {number=} opt_m11 The m11 coordinate of the transform.
 * @param {number=} opt_m02 The m02 coordinate of the transform.
 * @param {number=} opt_m12 The m12 coordinate of the transform.
 * @constructor
 */
goog.graphics.AffineTransform = function(opt_m00, opt_m10, opt_m01,
    opt_m11, opt_m02, opt_m12) {
  if (arguments.length == 6) {
    this.setTransform(/** @type {number} */ (opt_m00),
                      /** @type {number} */ (opt_m10),
                      /** @type {number} */ (opt_m01),
                      /** @type {number} */ (opt_m11),
                      /** @type {number} */ (opt_m02),
                      /** @type {number} */ (opt_m12));
  } else if (arguments.length != 0) {
    throw Error('Insufficient matrix parameters');
  } else {
    this.m00_ = this.m11_ = 1;
    this.m10_ = this.m01_ = this.m02_ = this.m12_ = 0;
  }
};


/**
 * @return {boolean} Whether this transform is the identity transform.
 */
goog.graphics.AffineTransform.prototype.isIdentity = function() {
  return this.m00_ == 1 && this.m10_ == 0 && this.m01_ == 0 &&
      this.m11_ == 1 && this.m02_ == 0 && this.m12_ == 0;
};


/**
 * @return {!goog.graphics.AffineTransform} A copy of this transform.
 */
goog.graphics.AffineTransform.prototype.clone = function() {
  return new goog.graphics.AffineTransform(this.m00_, this.m10_, this.m01_,
      this.m11_, this.m02_, this.m12_);
};


/**
 * Sets this transform to the matrix specified by the 6 values.
 *
 * @param {number} m00 The m00 coordinate of the transform.
 * @param {number} m10 The m10 coordinate of the transform.
 * @param {number} m01 The m01 coordinate of the transform.
 * @param {number} m11 The m11 coordinate of the transform.
 * @param {number} m02 The m02 coordinate of the transform.
 * @param {number} m12 The m12 coordinate of the transform.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.setTransform = function(m00, m10, m01,
    m11, m02, m12) {
  if (!goog.isNumber(m00) || !goog.isNumber(m10) || !goog.isNumber(m01) ||
      !goog.isNumber(m11) || !goog.isNumber(m02) || !goog.isNumber(m12)) {
    throw Error('Invalid transform parameters');
  }
  this.m00_ = m00;
  this.m10_ = m10;
  this.m01_ = m01;
  this.m11_ = m11;
  this.m02_ = m02;
  this.m12_ = m12;
  return this;
};


/**
 * Sets this transform to be identical to the given transform.
 *
 * @param {!goog.graphics.AffineTransform} tx The transform to copy.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.copyFrom = function(tx) {
  this.m00_ = tx.m00_;
  this.m10_ = tx.m10_;
  this.m01_ = tx.m01_;
  this.m11_ = tx.m11_;
  this.m02_ = tx.m02_;
  this.m12_ = tx.m12_;
  return this;
};


/**
 * Concatenates this transform with a scaling transformation.
 *
 * @param {number} sx The x-axis scaling factor.
 * @param {number} sy The y-axis scaling factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.scale = function(sx, sy) {
  this.m00_ *= sx;
  this.m10_ *= sx;
  this.m01_ *= sy;
  this.m11_ *= sy;
  return this;
};


/**
 * Pre-concatenates this transform with a scaling transformation,
 * i.e. calculates the following matrix product:
 *
 * <pre>
 * [sx  0 0] [m00 m01 m02]
 * [ 0 sy 0] [m10 m11 m12]
 * [ 0  0 1] [  0   0   1]
 * </pre>
 *
 * @param {number} sx The x-axis scaling factor.
 * @param {number} sy The y-axis scaling factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.preScale = function(sx, sy) {
  this.m00_ *= sx;
  this.m01_ *= sx;
  this.m02_ *= sx;
  this.m10_ *= sy;
  this.m11_ *= sy;
  this.m12_ *= sy;
  return this;
};


/**
 * Concatenates this transform with a translate transformation.
 *
 * @param {number} dx The distance to translate in the x direction.
 * @param {number} dy The distance to translate in the y direction.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.translate = function(dx, dy) {
  this.m02_ += dx * this.m00_ + dy * this.m01_;
  this.m12_ += dx * this.m10_ + dy * this.m11_;
  return this;
};


/**
 * Pre-concatenates this transform with a translate transformation,
 * i.e. calculates the following matrix product:
 *
 * <pre>
 * [1 0 dx] [m00 m01 m02]
 * [0 1 dy] [m10 m11 m12]
 * [0 0  1] [  0   0   1]
 * </pre>
 *
 * @param {number} dx The distance to translate in the x direction.
 * @param {number} dy The distance to translate in the y direction.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.preTranslate = function(dx, dy) {
  this.m02_ += dx;
  this.m12_ += dy;
  return this;
};


/**
 * Concatenates this transform with a rotation transformation around an anchor
 * point.
 *
 * @param {number} theta The angle of rotation measured in radians.
 * @param {number} x The x coordinate of the anchor point.
 * @param {number} y The y coordinate of the anchor point.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.rotate = function(theta, x, y) {
  return this.concatenate(
      goog.graphics.AffineTransform.getRotateInstance(theta, x, y));
};


/**
 * Pre-concatenates this transform with a rotation transformation around an
 * anchor point.
 *
 * @param {number} theta The angle of rotation measured in radians.
 * @param {number} x The x coordinate of the anchor point.
 * @param {number} y The y coordinate of the anchor point.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.preRotate = function(theta, x, y) {
  return this.preConcatenate(
      goog.graphics.AffineTransform.getRotateInstance(theta, x, y));
};


/**
 * Concatenates this transform with a shear transformation.
 *
 * @param {number} shx The x shear factor.
 * @param {number} shy The y shear factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.shear = function(shx, shy) {
  var m00 = this.m00_;
  var m10 = this.m10_;
  this.m00_ += shy * this.m01_;
  this.m10_ += shy * this.m11_;
  this.m01_ += shx * m00;
  this.m11_ += shx * m10;
  return this;
};


/**
 * Pre-concatenates this transform with a shear transformation.
 * i.e. calculates the following matrix product:
 *
 * <pre>
 * [  1 shx 0] [m00 m01 m02]
 * [shy   1 0] [m10 m11 m12]
 * [  0   0 1] [  0   0   1]
 * </pre>
 *
 * @param {number} shx The x shear factor.
 * @param {number} shy The y shear factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.preShear = function(shx, shy) {
  var m00 = this.m00_;
  var m01 = this.m01_;
  var m02 = this.m02_;
  this.m00_ += shx * this.m10_;
  this.m01_ += shx * this.m11_;
  this.m02_ += shx * this.m12_;
  this.m10_ += shy * m00;
  this.m11_ += shy * m01;
  this.m12_ += shy * m02;
  return this;
};


/**
 * @return {string} A string representation of this transform. The format of
 *     of the string is compatible with SVG matrix notation, i.e.
 *     "matrix(a,b,c,d,e,f)".
 * @override
 */
goog.graphics.AffineTransform.prototype.toString = function() {
  return 'matrix(' +
      [this.m00_, this.m10_, this.m01_, this.m11_, this.m02_, this.m12_].join(
          ',') +
      ')';
};


/**
 * @return {number} The scaling factor in the x-direction (m00).
 */
goog.graphics.AffineTransform.prototype.getScaleX = function() {
  return this.m00_;
};


/**
 * @return {number} The scaling factor in the y-direction (m11).
 */
goog.graphics.AffineTransform.prototype.getScaleY = function() {
  return this.m11_;
};


/**
 * @return {number} The translation in the x-direction (m02).
 */
goog.graphics.AffineTransform.prototype.getTranslateX = function() {
  return this.m02_;
};


/**
 * @return {number} The translation in the y-direction (m12).
 */
goog.graphics.AffineTransform.prototype.getTranslateY = function() {
  return this.m12_;
};


/**
 * @return {number} The shear factor in the x-direction (m01).
 */
goog.graphics.AffineTransform.prototype.getShearX = function() {
  return this.m01_;
};


/**
 * @return {number} The shear factor in the y-direction (m10).
 */
goog.graphics.AffineTransform.prototype.getShearY = function() {
  return this.m10_;
};


/**
 * Concatenates an affine transform to this transform.
 *
 * @param {!goog.graphics.AffineTransform} tx The transform to concatenate.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.concatenate = function(tx) {
  var m0 = this.m00_;
  var m1 = this.m01_;
  this.m00_ = tx.m00_ * m0 + tx.m10_ * m1;
  this.m01_ = tx.m01_ * m0 + tx.m11_ * m1;
  this.m02_ += tx.m02_ * m0 + tx.m12_ * m1;

  m0 = this.m10_;
  m1 = this.m11_;
  this.m10_ = tx.m00_ * m0 + tx.m10_ * m1;
  this.m11_ = tx.m01_ * m0 + tx.m11_ * m1;
  this.m12_ += tx.m02_ * m0 + tx.m12_ * m1;
  return this;
};


/**
 * Pre-concatenates an affine transform to this transform.
 *
 * @param {!goog.graphics.AffineTransform} tx The transform to preconcatenate.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.preConcatenate = function(tx) {
  var m0 = this.m00_;
  var m1 = this.m10_;
  this.m00_ = tx.m00_ * m0 + tx.m01_ * m1;
  this.m10_ = tx.m10_ * m0 + tx.m11_ * m1;

  m0 = this.m01_;
  m1 = this.m11_;
  this.m01_ = tx.m00_ * m0 + tx.m01_ * m1;
  this.m11_ = tx.m10_ * m0 + tx.m11_ * m1;

  m0 = this.m02_;
  m1 = this.m12_;
  this.m02_ = tx.m00_ * m0 + tx.m01_ * m1 + tx.m02_;
  this.m12_ = tx.m10_ * m0 + tx.m11_ * m1 + tx.m12_;
  return this;
};


/**
 * Transforms an array of coordinates by this transform and stores the result
 * into a destination array.
 *
 * @param {!Array.<number>} src The array containing the source points
 *     as x, y value pairs.
 * @param {number} srcOff The offset to the first point to be transformed.
 * @param {!Array.<number>} dst The array into which to store the transformed
 *     point pairs.
 * @param {number} dstOff The offset of the location of the first transformed
 *     point in the destination array.
 * @param {number} numPts The number of points to tranform.
 */
goog.graphics.AffineTransform.prototype.transform = function(src, srcOff, dst,
    dstOff, numPts) {
  var i = srcOff;
  var j = dstOff;
  var srcEnd = srcOff + 2 * numPts;
  while (i < srcEnd) {
    var x = src[i++];
    var y = src[i++];
    dst[j++] = x * this.m00_ + y * this.m01_ + this.m02_;
    dst[j++] = x * this.m10_ + y * this.m11_ + this.m12_;
  }
};


/**
 * @return {number} The determinant of this transform.
 */
goog.graphics.AffineTransform.prototype.getDeterminant = function() {
  return this.m00_ * this.m11_ - this.m01_ * this.m10_;
};


/**
 * Returns whether the transform is invertible. A transform is not invertible
 * if the determinant is 0 or any value is non-finite or NaN.
 *
 * @return {boolean} Whether the transform is invertible.
 */
goog.graphics.AffineTransform.prototype.isInvertible = function() {
  var det = this.getDeterminant();
  return goog.math.isFiniteNumber(det) &&
      goog.math.isFiniteNumber(this.m02_) &&
      goog.math.isFiniteNumber(this.m12_) &&
      det != 0;
};


/**
 * @return {!goog.graphics.AffineTransform} An AffineTransform object
 *     representing the inverse transformation.
 */
goog.graphics.AffineTransform.prototype.createInverse = function() {
  var det = this.getDeterminant();
  return new goog.graphics.AffineTransform(
      this.m11_ / det,
      -this.m10_ / det,
      -this.m01_ / det,
      this.m00_ / det,
      (this.m01_ * this.m12_ - this.m11_ * this.m02_) / det,
      (this.m10_ * this.m02_ - this.m00_ * this.m12_) / det);
};


/**
 * Creates a transform representing a scaling transformation.
 *
 * @param {number} sx The x-axis scaling factor.
 * @param {number} sy The y-axis scaling factor.
 * @return {!goog.graphics.AffineTransform} A transform representing a scaling
 *     transformation.
 */
goog.graphics.AffineTransform.getScaleInstance = function(sx, sy) {
  return new goog.graphics.AffineTransform().setToScale(sx, sy);
};


/**
 * Creates a transform representing a translation transformation.
 *
 * @param {number} dx The distance to translate in the x direction.
 * @param {number} dy The distance to translate in the y direction.
 * @return {!goog.graphics.AffineTransform} A transform representing a
 *     translation transformation.
 */
goog.graphics.AffineTransform.getTranslateInstance = function(dx, dy) {
  return new goog.graphics.AffineTransform().setToTranslation(dx, dy);
};


/**
 * Creates a transform representing a shearing transformation.
 *
 * @param {number} shx The x-axis shear factor.
 * @param {number} shy The y-axis shear factor.
 * @return {!goog.graphics.AffineTransform} A transform representing a shearing
 *     transformation.
 */
goog.graphics.AffineTransform.getShearInstance = function(shx, shy) {
  return new goog.graphics.AffineTransform().setToShear(shx, shy);
};


/**
 * Creates a transform representing a rotation transformation.
 *
 * @param {number} theta The angle of rotation measured in radians.
 * @param {number} x The x coordinate of the anchor point.
 * @param {number} y The y coordinate of the anchor point.
 * @return {!goog.graphics.AffineTransform} A transform representing a rotation
 *     transformation.
 */
goog.graphics.AffineTransform.getRotateInstance = function(theta, x, y) {
  return new goog.graphics.AffineTransform().setToRotation(theta, x, y);
};


/**
 * Sets this transform to a scaling transformation.
 *
 * @param {number} sx The x-axis scaling factor.
 * @param {number} sy The y-axis scaling factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.setToScale = function(sx, sy) {
  return this.setTransform(sx, 0, 0, sy, 0, 0);
};


/**
 * Sets this transform to a translation transformation.
 *
 * @param {number} dx The distance to translate in the x direction.
 * @param {number} dy The distance to translate in the y direction.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.setToTranslation = function(dx, dy) {
  return this.setTransform(1, 0, 0, 1, dx, dy);
};


/**
 * Sets this transform to a shearing transformation.
 *
 * @param {number} shx The x-axis shear factor.
 * @param {number} shy The y-axis shear factor.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.setToShear = function(shx, shy) {
  return this.setTransform(1, shy, shx, 1, 0, 0);
};


/**
 * Sets this transform to a rotation transformation.
 *
 * @param {number} theta The angle of rotation measured in radians.
 * @param {number} x The x coordinate of the anchor point.
 * @param {number} y The y coordinate of the anchor point.
 * @return {!goog.graphics.AffineTransform} This affine transform.
 */
goog.graphics.AffineTransform.prototype.setToRotation = function(theta, x, y) {
  var cos = Math.cos(theta);
  var sin = Math.sin(theta);
  return this.setTransform(cos, sin, -sin, cos,
      x - x * cos + y * sin, y - x * sin - y * cos);
};


/**
 * Compares two affine transforms for equality.
 *
 * @param {goog.graphics.AffineTransform} tx The other affine transform.
 * @return {boolean} whether the two transforms are equal.
 */
goog.graphics.AffineTransform.prototype.equals = function(tx) {
  if (this == tx) {
    return true;
  }
  if (!tx) {
    return false;
  }
  return this.m00_ == tx.m00_ &&
      this.m01_ == tx.m01_ &&
      this.m02_ == tx.m02_ &&
      this.m10_ == tx.m10_ &&
      this.m11_ == tx.m11_ &&
      this.m12_ == tx.m12_;
};
