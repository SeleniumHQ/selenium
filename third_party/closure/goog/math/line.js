// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.


/**
 * @fileoverview Represents a line in 2D space.
 *
 */

goog.provide('goog.math.Line');

goog.require('goog.math');
goog.require('goog.math.Coordinate');


/**
 * Object representing a line.
 * @param {number} x0 X coordinate of the start point.
 * @param {number} y0 Y coordinate of the start point.
 * @param {number} x1 X coordinate of the end point.
 * @param {number} y1 Y coordinate of the end point.
 * @constructor
 */
goog.math.Line = function(x0, y0, x1, y1) {
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
};


/**
 * @return {goog.math.Line} A copy of this line.
 */
goog.math.Line.prototype.clone = function() {
  return new goog.math.Line(this.x0, this.y0, this.x1, this.y1);
};


/**
 * Tests whether the given line is exactly the same as this one.
 * @param {goog.math.Line} other The other line.
 * @return {boolean} Whether the given line is the same as this one.
 */
goog.math.Line.prototype.equals = function(other) {
  return this.x0 == other.x0 && this.y0 == other.y0 &&
         this.x1 == other.x1 && this.y1 == other.y1;
};


/**
 * @return {number} The squared length of the line segment used to define the
 *     line.
 */
goog.math.Line.prototype.getSegmentLengthSquared = function() {
  var xdist = this.x1 - this.x0;
  var ydist = this.y1 - this.y0;
  return xdist * xdist + ydist * ydist;
};


/**
 * @return {number} The length of the line segment used to define the line.
 */
goog.math.Line.prototype.getSegmentLength = function() {
  return Math.sqrt(this.getSegmentLengthSquared());
};


/**
 * Computes the point on the line closest to a given point.
 * @param {number|goog.math.Coordinate} x The x coordinate of the point, or
 *     a coordinate object.
 * @param {number} opt_y The y coordinate of the point - required if x is a
 *     number, ignored if x is a goog.math.Coordinate.
 * @return {goog.math.Coordinate} The point on the line closest to the given
 *     point.
 */
goog.math.Line.prototype.getClosestPoint = function(x, opt_y) {
  var y;
  if (x instanceof goog.math.Coordinate) {
    y = x.y;
    x = x.x;
  } else {
    y = opt_y;
  }

  var x0 = this.x0;
  var y0 = this.y0;

  var xChange = this.x1 - x0;
  var yChange = this.y1 - y0;

  var u = ((x - x0) * xChange + (y - y0) * yChange) /
              this.getSegmentLengthSquared();

  return new goog.math.Coordinate(x0 + u * xChange, y0 + u * yChange);
};
