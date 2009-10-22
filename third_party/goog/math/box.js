// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview A utility class for representing a numeric box.
 */


goog.provide('goog.math.Box');


/**
 * Class for representing a box. A box is specified as a top, right, bottom,
 * and left. A box is useful for representing margins and padding.
 *
 * @param {number} opt_top Top.
 * @param {number} opt_right Right.
 * @param {number} opt_bottom Bottom.
 * @param {number} opt_left Left.
 * @constructor
 */
goog.math.Box = function(opt_top, opt_right, opt_bottom, opt_left) {
  /**
   * Top
   * @type {number|undefined}
   */
  this.top = goog.isDef(opt_top) ? Number(opt_top) : undefined;

  /**
   * Right
   * @type {number|undefined}
   */
  this.right = goog.isDef(opt_right) ? Number(opt_right) : undefined;

  /**
   * Bottom
   * @type {number|undefined}
   */
  this.bottom = goog.isDef(opt_bottom) ? Number(opt_bottom) : undefined;

  /**
   * Left
   * @type {number|undefined}
   */
  this.left = goog.isDef(opt_left) ? Number(opt_left) : undefined;
};


/**
 * Create a Box by bounding a collection of goog.math.Coordinate objects
 * @param {goog.math.Coordinate} var_args Coordinates to be included inside the
 *     box.
 * @return {goog.math.Box} A Box containing all the specified Coordinates.
 */
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x,
                              arguments[0].y, arguments[0].x);
  for (var i = 1; i < arguments.length; i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x);
  }
  return box;
};


/**
 * Creates a copy of the box with the same dimensions.
 * @return {goog.math.Box} A clone of this Box.
 */
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left);
};


/**
 * Returns a nice string representing the box.
 * @return {string} In the form (50t, 73r, 24b, 13l).
 */
goog.math.Box.prototype.toString = function() {
  return '(' + this.top + 't, ' + this.right + 'r, ' + this.bottom + 'b, ' +
         this.left + 'l)';
};


/**
 * Returns whether the box contains a coordinate.
 *
 * @param {goog.math.Coordinate} coord The Coordinate.
 * @return {boolean} Whether this Box contains the given coordinate.
 */
goog.math.Box.prototype.contains = function(coord) {
  return goog.math.Box.contains(this, coord);
};


/**
 * Expand box with the given margins.
 *
 * @param {number|goog.math.Box} top Top margin or box with all margins.
 * @param {number} opt_right Right margin.
 * @param {number} opt_bottom Bottom margin.
 * @param {number} opt_left Left margin.
 * @return {goog.math.Box} Returns reference to itself.
 */
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom,
    opt_left) {
  if (goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left;
  } else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left;
  }

  return this;
};


/**
 * Compares boxes for equality.
 * @param {goog.math.Box} a A Box.
 * @param {goog.math.Box} b A Box.
 * @return {boolean} True iff the boxes are equal, or if both are null.
 */
goog.math.Box.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.top == b.top && a.right == b.right &&
         a.bottom == b.bottom && a.left == b.left;
};


/**
 * Returns whether a box contains a coordinate.
 *
 * @param {goog.math.Box} box A Box.
 * @param {goog.math.Coordinate} coord A Coordinate.
 * @return {boolean} Whether the box contains the coordinate.
 */
goog.math.Box.contains = function(box, coord) {
  if (!box || !coord) {
    return false;
  }

  return coord.x >= box.left && coord.x <= box.right &&
         coord.y >= box.top && coord.y <= box.bottom;
};


/**
 * Returns the distance between a coordinate and the nearest corner/side of a
 * box. Zero is returned if the coordinate is inside the box.
 *
 * @param {goog.math.Box} box A Box.
 * @param {goog.math.Coordinate} coord A Coordinate.
 * @return {number} The distance between {@code coord} and the nearest 
 *     corner/side of {@code box}, or zero if {@code coord} is inside 
 *     {@code box}.
 */
goog.math.Box.distance = function(box, coord) {
  if (coord.x >= box.left && coord.x <= box.right) {
    if (coord.y >= box.top && coord.y <= box.bottom) {
      return 0;
    }
    return coord.y < box.top ? box.top - coord.y : coord.y - box.bottom;
  }

  if (coord.y >= box.top && coord.y <= box.bottom) {
    return coord.x < box.left ? box.left - coord.x : coord.x - box.right;
  }

  return goog.math.Coordinate.distance(coord,
      new goog.math.Coordinate(coord.x < box.left ? box.left : box.right,
                               coord.y < box.top ? box.top : box.bottom));
};
