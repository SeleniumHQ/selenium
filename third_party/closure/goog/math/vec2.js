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
 * @fileoverview Defines a 2-element vector class that can be used for
 * coordinate math, useful for animation systems and point manipulation.
*
 */


goog.provide('goog.math.Vec2');

goog.require('goog.math');
goog.require('goog.math.Coordinate');


/**
 * Class for a two-dimensional vector object and assorted functions useful for
 * manipulating points.
 *
 * Inherits from goog.math.Coordinate so that a Vec2 may be passed in to any
 * function that requires a Coordinate.
 *
 * @param {number=} opt_x The x coordinate for the vector.
 * @param {number=} opt_y The y coordinate for the vector.
 * @constructor
 * @extends {goog.math.Coordinate}
 */
goog.math.Vec2 = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = Number(opt_x) || 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = Number(opt_y) || 0;
};
goog.inherits(goog.math.Vec2, goog.math.Coordinate);


/**
 * @return {!goog.math.Vec2} A random unit-length vector.
 */
goog.math.Vec2.randomUnit = function() {
  var angle = Math.random() * Math.PI * 2;
  return new goog.math.Vec2(Math.cos(angle), Math.sin(angle));
};


/**
 * @return {!goog.math.Vec2} A random vector inside the unit-disc.
 */
goog.math.Vec2.random = function() {
  var mag = Math.sqrt(Math.random());
  var angle = Math.random() * Math.PI * 2;

  return new goog.math.Vec2(Math.cos(angle) * mag, Math.sin(angle) * mag);
};


/**
 * Returns a new Vec2 object from a given coordinate.
 * @param {!goog.math.Coordinate} a The coordinate.
 * @return {!goog.math.Vec2} A new vector object.
 */
goog.math.Vec2.fromCoordinate = function(a) {
  return new goog.math.Vec2(a.x, a.y);
};


/**
 * @return {!goog.math.Vec2} A new vector with the same coordinates as this one.
 */
goog.math.Vec2.prototype.clone = function() {
  return new goog.math.Vec2(this.x, this.y);
};


/**
 * Returns the magnitude of the vector measured from the origin.
 * @return {number} The length of the vector.
 */
goog.math.Vec2.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};


/**
 * Returns the squared magnitude of the vector measured from the origin.
 * NOTE(user): Leaving out the square root is not a significant
 * optimization in JavaScript.
 * @return {number} The length of the vector, squared.
 */
goog.math.Vec2.prototype.squaredMagnitude = function() {
  return this.x * this.x + this.y * this.y;
};


/**
 * Scales the current vector by a constant.
 * @param {number} s The scale factor.
 * @return {!goog.math.Vec2} The scaled vector.
 */
goog.math.Vec2.prototype.scale = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};


/**
 * Reverses the sign of the vector. Equivalent to scaling the vector by -1.
 * @return {!goog.math.Vec2} The inverted vector.
 */
goog.math.Vec2.prototype.invert = function() {
  this.x = -this.x;
  this.y = -this.y;
  return this;
};


/**
 * Normalizes the current vector to have a magnitude of 1.
 * @return {!goog.math.Vec2} The normalized vector.
 */
goog.math.Vec2.prototype.normalize = function() {
  return this.scale(1 / this.magnitude());
};


/**
 * Adds another vector to this vector in-place. Uses goog.math.Vec2.sum(a, b) to
 * return a new vector.
 * @param {!goog.math.Vec2} b The vector to add.
 * @return {!goog.math.Vec2}  This vector with {@code b} added.
 */
goog.math.Vec2.prototype.add = function(b) {
  this.x += b.x;
  this.y += b.y;
  return this;
};


/**
 * Subtracts another vector from this vector in-place. Uses
 * goog.math.Vec2.difference(a, b) to return a new vector.
 * @param {!goog.math.Vec2} b The vector to subtract.
 * @return {!goog.math.Vec2} This vector with {@code b} subtracted.
 */
goog.math.Vec2.prototype.subtract = function(b) {
  this.x -= b.x;
  this.y -= b.y;
  return this;
};


/**
 * Compares this vector with another for equality.
 * @param {!goog.math.Vec2} b The other vector.
 * @return {boolean} True if this vector has the same x and y as the given
 *     vector.
 */
goog.math.Vec2.prototype.equals = function(b) {
  return this == b || !!b && this.x == b.x && this.y == b.y;
};


/**
 * Returns the distance between two vectors.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {number} The distance.
 */
goog.math.Vec2.distance = goog.math.Coordinate.distance;


/**
 * Returns the squared distance between two vectors.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {number} The squared distance.
 */
goog.math.Vec2.squaredDistance = goog.math.Coordinate.squaredDistance;


/**
 * Compares vectors for equality.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {boolean} True if the vectors have the same x and the same y.
 */
goog.math.Vec2.equals = goog.math.Coordinate.equals;


/**
 * Returns the sum of two vectors as a new Vec2.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {!goog.math.Vec2} The sum vector.
 */
goog.math.Vec2.sum = function(a, b) {
  return new goog.math.Vec2(a.x + b.x, a.y + b.y);
};


/**
 * Returns the difference between two vectors as a new Vec2.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {!goog.math.Vec2} The difference vector.
 */
goog.math.Vec2.difference = function(a, b) {
  return new goog.math.Vec2(a.x - b.x, a.y - b.y);
};


/**
 * Returns the dot-product of two vectors.
 * @param {!goog.math.Vec2} a The first vector.
 * @param {!goog.math.Vec2} b The second vector.
 * @return {number} The dot-product of the two vectors.
 */
goog.math.Vec2.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};


/**
 * Returns a new Vec2 that is the linear interpolant between vectors a and b at
 * scale-value x.
 * @param {!goog.math.Vec2} a Vector a.
 * @param {!goog.math.Vec2} b Vector b.
 * @param {number} x The proportion between a and b.
 * @return {!goog.math.Vec2} The interpolated vector.
 */
goog.math.Vec2.lerp = function(a, b, x) {
  return new goog.math.Vec2(goog.math.lerp(a.x, b.x, x),
                            goog.math.lerp(a.y, b.y, x));
};
