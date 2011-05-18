// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Represents a cubic Bezier curve.
 *
 * Uses the deCasteljau algorithm to compute points on the curve.
 * http://en.wikipedia.org/wiki/De_Casteljau's_algorithm
 *
 * Currently it uses an unrolled version of the algorithm for speed.  Eventually
 * it may be useful to use the loop form of the algorithm in order to support
 * curves of arbitrary degree.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author wcrosby@google.com (Wayne Crosby)
 */

goog.provide('goog.math.Bezier');

goog.require('goog.math');
goog.require('goog.math.Coordinate');



/**
 * Object representing a cubic bezier curve.
 * @param {number} x0 X coordinate of the start point.
 * @param {number} y0 Y coordinate of the start point.
 * @param {number} x1 X coordinate of the first control point.
 * @param {number} y1 Y coordinate of the first control point.
 * @param {number} x2 X coordinate of the second control point.
 * @param {number} y2 Y coordinate of the second control point.
 * @param {number} x3 X coordinate of the end point.
 * @param {number} y3 Y coordinate of the end point.
 * @constructor
 */
goog.math.Bezier = function(x0, y0, x1, y1, x2, y2, x3, y3) {
  /**
   * X coordinate of the first point.
   * @type {number}
   */
  this.x0 = x0;

  /**
   * Y coordinate of the first point.
   * @type {number}
   */
  this.y0 = y0;

  /**
   * X coordinate of the first control point.
   * @type {number}
   */
  this.x1 = x1;

  /**
   * Y coordinate of the first control point.
   * @type {number}
   */
  this.y1 = y1;

  /**
   * X coordinate of the second control point.
   * @type {number}
   */
  this.x2 = x2;

  /**
   * Y coordinate of the second control point.
   * @type {number}
   */
  this.y2 = y2;

  /**
   * X coordinate of the end point.
   * @type {number}
   */
  this.x3 = x3;

  /**
   * Y coordinate of the end point.
   * @type {number}
   */
  this.y3 = y3;
};


/**
 * Constant used to approximate ellipses.
 * See: http://canvaspaint.org/blog/2006/12/ellipse/
 * @type {number}
 */
goog.math.Bezier.KAPPA = 4 * (Math.sqrt(2) - 1) / 3;


/**
 * @return {!goog.math.Bezier} A copy of this curve.
 */
goog.math.Bezier.prototype.clone = function() {
  return new goog.math.Bezier(this.x0, this.y0, this.x1, this.y1, this.x2,
      this.y2, this.x3, this.y3);
};


/**
 * Test if the given curve is exactly the same as this one.
 * @param {goog.math.Bezier} other The other curve.
 * @return {boolean} Whether the given curve is the same as this one.
 */
goog.math.Bezier.prototype.equals = function(other) {
  return this.x0 == other.x0 && this.y0 == other.y0 && this.x1 == other.x1 &&
         this.y1 == other.y1 && this.x2 == other.x2 && this.y2 == other.y2 &&
         this.x3 == other.x3 && this.y3 == other.y3;
};


/**
 * Modifies the curve in place to progress in the opposite direction.
 */
goog.math.Bezier.prototype.flip = function() {
  var temp = this.x0;
  this.x0 = this.x3;
  this.x3 = temp;
  temp = this.y0;
  this.y0 = this.y3;
  this.y3 = temp;

  temp = this.x1;
  this.x1 = this.x2;
  this.x2 = temp;
  temp = this.y1;
  this.y1 = this.y2;
  this.y2 = temp;
};


/**
 * Computes the curve at a point between 0 and 1.
 * @param {number} t The point on the curve to find.
 * @return {!goog.math.Coordinate} The computed coordinate.
 */
goog.math.Bezier.prototype.getPoint = function(t) {
  // Special case start and end
  if (t == 0) {
    return new goog.math.Coordinate(this.x0, this.y0);
  } else if (t == 1) {
    return new goog.math.Coordinate(this.x3, this.y3);
  }

  // Step one - from 4 points to 3
  var ix0 = goog.math.lerp(this.x0, this.x1, t);
  var iy0 = goog.math.lerp(this.y0, this.y1, t);

  var ix1 = goog.math.lerp(this.x1, this.x2, t);
  var iy1 = goog.math.lerp(this.y1, this.y2, t);

  var ix2 = goog.math.lerp(this.x2, this.x3, t);
  var iy2 = goog.math.lerp(this.y2, this.y3, t);

  // Step two - from 3 points to 2
  ix0 = goog.math.lerp(ix0, ix1, t);
  iy0 = goog.math.lerp(iy0, iy1, t);

  ix1 = goog.math.lerp(ix1, ix2, t);
  iy1 = goog.math.lerp(iy1, iy2, t);

  // Final step - last point
  return new goog.math.Coordinate(goog.math.lerp(ix0, ix1, t),
      goog.math.lerp(iy0, iy1, t));
};


/**
 * Changes this curve in place to be the portion of itself from [t, 1].
 * @param {number} t The start of the desired portion of the curve.
 */
goog.math.Bezier.prototype.subdivideLeft = function(t) {
  if (t == 1) {
    return;
  }

  // Step one - from 4 points to 3
  var ix0 = goog.math.lerp(this.x0, this.x1, t);
  var iy0 = goog.math.lerp(this.y0, this.y1, t);

  var ix1 = goog.math.lerp(this.x1, this.x2, t);
  var iy1 = goog.math.lerp(this.y1, this.y2, t);

  var ix2 = goog.math.lerp(this.x2, this.x3, t);
  var iy2 = goog.math.lerp(this.y2, this.y3, t);

  // Collect our new x1 and y1
  this.x1 = ix0;
  this.y1 = iy0;

  // Step two - from 3 points to 2
  ix0 = goog.math.lerp(ix0, ix1, t);
  iy0 = goog.math.lerp(iy0, iy1, t);

  ix1 = goog.math.lerp(ix1, ix2, t);
  iy1 = goog.math.lerp(iy1, iy2, t);

  // Collect our new x2 and y2
  this.x2 = ix0;
  this.y2 = iy0;

  // Final step - last point
  this.x3 = goog.math.lerp(ix0, ix1, t);
  this.y3 = goog.math.lerp(iy0, iy1, t);
};


/**
 * Changes this curve in place to be the portion of itself from [0, t].
 * @param {number} t The end of the desired portion of the curve.
 */
goog.math.Bezier.prototype.subdivideRight = function(t) {
  this.flip();
  this.subdivideLeft(1 - t);
  this.flip();
};


/**
 * Changes this curve in place to be the portion of itself from [s, t].
 * @param {number} s The start of the desired portion of the curve.
 * @param {number} t The end of the desired portion of the curve.
 */
goog.math.Bezier.prototype.subdivide = function(s, t) {
  this.subdivideRight(s);
  this.subdivideLeft((t - s) / (1 - s));
};


/**
 * Computes the position t of a point on the curve given its x coordinate.
 * That is, for an input xVal, finds t s.t. getPoint(t).x = xVal.
 * As such, the following should always be true up to some small epsilon:
 * t ~ solvePositionFromXValue(getPoint(t).x) for t in [0, 1].
 * @param {number} xVal The x coordinate of the point to find on the curve.
 * @return {number} The position t.
 */
goog.math.Bezier.prototype.solvePositionFromXValue = function(xVal) {
  // Desired precision on the computation.
  var epsilon = 1e-6;

  // Initial estimate of t using linear interpolation.
  var t = (xVal - this.x0) / (this.x3 - this.x0);
  if (t <= 0) {
    return 0;
  } else if (t >= 1) {
    return 1;
  }

  // Try gradient descent to solve for t. If it works, it is very fast.
  var tMin = 0;
  var tMax = 1;
  for (var i = 0; i < 8; i++) {
    var value = this.getPoint(t).x;
    var derivative = (this.getPoint(t + epsilon).x - value) / epsilon;
    if (Math.abs(value - xVal) < epsilon) {
      return t;
    } else if (Math.abs(derivative) < epsilon) {
      break;
    } else {
      if (value < xVal) {
        tMin = t;
      } else {
        tMax = t;
      }
      t -= (value - xVal) / derivative;
    }
  }

  // If the gradient descent got stuck in a local minimum, e.g. because
  // the derivative was close to 0, use a Dichotomy refinement instead.
  // We limit the number of interations to 8.
  for (var i = 0; Math.abs(value - xVal) > epsilon && i < 8; i++) {
    if (value < xVal) {
      tMin = t;
      t = (t + tMax) / 2;
    } else {
      tMax = t;
      t = (t + tMin) / 2;
    }
    value = this.getPoint(t).x;
  }
  return t;
};


/**
 * Computes the y coordinate of a point on the curve given its x coordinate.
 * @param {number} xVal The x coordinate of the point on the curve.
 * @return {number} The y coordinate of the point on the curve.
 */
goog.math.Bezier.prototype.solveYValueFromXValue = function(xVal) {
  return this.getPoint(this.solvePositionFromXValue(xVal)).y;
};
