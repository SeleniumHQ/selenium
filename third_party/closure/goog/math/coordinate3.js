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
 * @fileoverview A utility class for representing three-dimensional points.
 *
 * Based heavily on coordinate.js by:
 */

goog.provide('goog.math.Coordinate3');



/**
 * Class for representing coordinates and positions in 3 dimensions.
 *
 * @param {number=} opt_x X coordinate, defaults to 0.
 * @param {number=} opt_y Y coordinate, defaults to 0.
 * @param {number=} opt_z Z coordinate, defaults to 0.
 * @constructor
 */
goog.math.Coordinate3 = function(opt_x, opt_y, opt_z) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;

  /**
   * Z-value
   * @type {number}
   */
  this.z = goog.isDef(opt_z) ? opt_z : 0;
};


/**
 * Returns a new copy of the coordinate.
 *
 * @return {!goog.math.Coordinate3} A clone of this coordinate.
 */
goog.math.Coordinate3.prototype.clone = function() {
  return new goog.math.Coordinate3(this.x, this.y, this.z);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   *
   * @return {string} In the form (50, 73, 31).
   */
  goog.math.Coordinate3.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
  };
}


/**
 * Compares coordinates for equality.
 *
 * @param {goog.math.Coordinate3} a A Coordinate3.
 * @param {goog.math.Coordinate3} b A Coordinate3.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate3.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y && a.z == b.z;
};


/**
 * Returns the distance between two coordinates.
 *
 * @param {goog.math.Coordinate3} a A Coordinate3.
 * @param {goog.math.Coordinate3} b A Coordinate3.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate3.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {goog.math.Coordinate3} a A Coordinate3.
 * @param {goog.math.Coordinate3} b A Coordinate3.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate3.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate3.
 *
 * @param {goog.math.Coordinate3} a A Coordinate3.
 * @param {goog.math.Coordinate3} b A Coordinate3.
 * @return {!goog.math.Coordinate3} A Coordinate3 representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate3.difference = function(a, b) {
  return new goog.math.Coordinate3(a.x - b.x, a.y - b.y, a.z - b.z);
};


/**
 * Returns the contents of this coordinate as a 3 value Array.
 *
 * @return {!Array.<number>} A new array.
 */
goog.math.Coordinate3.prototype.toArray = function() {
  return [this.x, this.y, this.z];
};


/**
 * Converts a three element array into a Coordinate3 object.  If the value
 * passed in is not an array, not array-like, or not of the right length, an
 * error is thrown.
 *
 * @param {Array.<number>} a Array of numbers to become a coordinate.
 * @return {!goog.math.Coordinate3} A new coordinate from the array values.
 * @throws {Error} When the oject passed in is not valid.
 */
goog.math.Coordinate3.fromArray = function(a) {
  if (a.length <= 3) {
    return new goog.math.Coordinate3(a[0], a[1], a[2]);
  }

  throw Error('Conversion from an array requires an array of length 3');
};
