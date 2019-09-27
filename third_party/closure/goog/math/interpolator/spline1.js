// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A one dimensional cubic spline interpolator with not-a-knot
 * boundary conditions.
 *
 * See http://en.wikipedia.org/wiki/Spline_interpolation.
 *
 */

goog.provide('goog.math.interpolator.Spline1');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math');
goog.require('goog.math.interpolator.Interpolator1');
goog.require('goog.math.tdma');



/**
 * A one dimensional cubic spline interpolator with natural boundary conditions.
 * @implements {goog.math.interpolator.Interpolator1}
 * @constructor
 */
goog.math.interpolator.Spline1 = function() {
  /**
   * The abscissa of the data points.
   * @type {!Array<number>}
   * @private
   */
  this.x_ = [];

  /**
   * The spline interval coefficients.
   * Note that, in general, the length of coeffs and x is not the same.
   * @type {!Array<!Array<number>>}
   * @private
   */
  this.coeffs_ = [[0, 0, 0, Number.NaN]];
};


/** @override */
goog.math.interpolator.Spline1.prototype.setData = function(x, y) {
  goog.asserts.assert(
      x.length == y.length,
      'input arrays to setData should have the same length');
  if (x.length > 0) {
    this.coeffs_ = this.computeSplineCoeffs_(x, y);
    this.x_ = x.slice();
  } else {
    this.coeffs_ = [[0, 0, 0, Number.NaN]];
    this.x_ = [];
  }
};


/** @override */
goog.math.interpolator.Spline1.prototype.interpolate = function(x) {
  var pos = goog.array.binarySearch(this.x_, x);
  if (pos < 0) {
    pos = -pos - 2;
  }
  pos = goog.math.clamp(pos, 0, this.coeffs_.length - 1);

  var d = x - this.x_[pos];
  var d2 = d * d;
  var d3 = d2 * d;
  var coeffs = this.coeffs_[pos];
  return coeffs[0] * d3 + coeffs[1] * d2 + coeffs[2] * d + coeffs[3];
};


/**
 * Solve for the spline coefficients such that the spline precisely interpolates
 * the data points.
 * @param {Array<number>} x The abscissa of the spline data points.
 * @param {Array<number>} y The ordinate of the spline data points.
 * @return {!Array<!Array<number>>} The spline interval coefficients.
 * @private
 */
goog.math.interpolator.Spline1.prototype.computeSplineCoeffs_ = function(x, y) {
  var nIntervals = x.length - 1;
  var dx = new Array(nIntervals);
  var delta = new Array(nIntervals);
  for (var i = 0; i < nIntervals; ++i) {
    dx[i] = x[i + 1] - x[i];
    delta[i] = (y[i + 1] - y[i]) / dx[i];
  }

  // Compute the spline coefficients from the 1st order derivatives.
  var coeffs = [];
  if (nIntervals == 0) {
    // Nearest neighbor interpolation.
    coeffs[0] = [0, 0, 0, y[0]];
  } else if (nIntervals == 1) {
    // Straight line interpolation.
    coeffs[0] = [0, 0, delta[0], y[0]];
  } else if (nIntervals == 2) {
    // Parabola interpolation.
    var c3 = 0;
    var c2 = (delta[1] - delta[0]) / (dx[0] + dx[1]);
    var c1 = delta[0] - c2 * dx[0];
    var c0 = y[0];
    coeffs[0] = [c3, c2, c1, c0];
  } else {
    // General Spline interpolation. Compute the 1st order derivatives from
    // the Spline equations.
    var deriv = this.computeDerivatives(dx, delta);
    for (var i = 0; i < nIntervals; ++i) {
      var c3 = (deriv[i] - 2 * delta[i] + deriv[i + 1]) / (dx[i] * dx[i]);
      var c2 = (3 * delta[i] - 2 * deriv[i] - deriv[i + 1]) / dx[i];
      var c1 = deriv[i];
      var c0 = y[i];
      coeffs[i] = [c3, c2, c1, c0];
    }
  }
  return coeffs;
};


/**
 * Computes the derivative at each point of the spline such that
 * the curve is C2. It uses not-a-knot boundary conditions.
 * @param {Array<number>} dx The spacing between consecutive data points.
 * @param {Array<number>} slope The slopes between consecutive data points.
 * @return {!Array<number>} The Spline derivative at each data point.
 * @protected
 */
goog.math.interpolator.Spline1.prototype.computeDerivatives = function(
    dx, slope) {
  var nIntervals = dx.length;

  // Compute the main diagonal of the system of equations.
  var mainDiag = new Array(nIntervals + 1);
  mainDiag[0] = dx[1];
  for (var i = 1; i < nIntervals; ++i) {
    mainDiag[i] = 2 * (dx[i] + dx[i - 1]);
  }
  mainDiag[nIntervals] = dx[nIntervals - 2];

  // Compute the sub diagonal of the system of equations.
  var subDiag = new Array(nIntervals);
  for (var i = 0; i < nIntervals; ++i) {
    subDiag[i] = dx[i + 1];
  }
  subDiag[nIntervals - 1] = dx[nIntervals - 2] + dx[nIntervals - 1];

  // Compute the super diagonal of the system of equations.
  var supDiag = new Array(nIntervals);
  supDiag[0] = dx[0] + dx[1];
  for (var i = 1; i < nIntervals; ++i) {
    supDiag[i] = dx[i - 1];
  }

  // Compute the right vector of the system of equations.
  var vecRight = new Array(nIntervals + 1);
  vecRight[0] =
      ((dx[0] + 2 * supDiag[0]) * dx[1] * slope[0] + dx[0] * dx[0] * slope[1]) /
      supDiag[0];
  for (var i = 1; i < nIntervals; ++i) {
    vecRight[i] = 3 * (dx[i] * slope[i - 1] + dx[i - 1] * slope[i]);
  }
  vecRight[nIntervals] =
      (dx[nIntervals - 1] * dx[nIntervals - 1] * slope[nIntervals - 2] +
       (2 * subDiag[nIntervals - 1] + dx[nIntervals - 1]) * dx[nIntervals - 2] *
           slope[nIntervals - 1]) /
      subDiag[nIntervals - 1];

  // Solve the system of equations.
  var deriv = goog.math.tdma.solve(subDiag, mainDiag, supDiag, vecRight);

  return deriv;
};


/**
 * Note that the inverse of a cubic spline is not a cubic spline in general.
 * As a result the inverse implementation is only approximate. In
 * particular, it only guarantees the exact inverse at the original input data
 * points passed to setData.
 * @override
 */
goog.math.interpolator.Spline1.prototype.getInverse = function() {
  var interpolator = new goog.math.interpolator.Spline1();
  var y = [];
  for (var i = 0; i < this.x_.length; i++) {
    y[i] = this.interpolate(this.x_[i]);
  }
  interpolator.setData(y, this.x_);
  return interpolator;
};
