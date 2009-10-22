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
 * @fileoverview A utility class for representing rectangles.
 */


goog.provide('goog.math.Rect');

goog.require('goog.math.Box');


/**
 * Class for representing rectangular regions.
 * @param {number} opt_x Left.
 * @param {number} opt_y Top.
 * @param {number} opt_w Width.
 * @param {number} opt_h Height.
 * @constructor
 */
goog.math.Rect = function(opt_x, opt_y, opt_w, opt_h) {

  /**
   * Left
   * @type {number|undefined}
   */
  this.left = goog.isDef(opt_x) ? Number(opt_x) : undefined;

  /**
   * Top
   * @type {number|undefined}
   */
  this.top = goog.isDef(opt_y) ? Number(opt_y) : undefined;

  /**
   * Width
   * @type {number|undefined}
   */
  this.width = goog.isDef(opt_w) ? Number(opt_w) : undefined;

  /**
   * Height
   * @type {number|undefined}
   */
  this.height = goog.isDef(opt_h) ? Number(opt_h) : undefined;

};


/**
 * Returns a new copy of the rectangle.
 * @return {goog.math.Rect} A clone of this Rectangle.
 */
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height);
};


/**
 * Returns a new Box object with the same position and dimensions as this
 * rectangle.
 * @return {goog.math.Box} A new Box representation of this Rectangle.
 */
goog.math.Rect.prototype.toBox = function() {
  return new goog.math.Box(this.top,
                           this.left + this.width || undefined,
                           this.top + this.height || undefined,
                           this.left);
};


/**
 * Returns a nice string representing size and dimensions of rectangle.
 * @return {string} In the form (50, 73 - 75w x 25h).
 */
goog.math.Rect.prototype.toString = function() {
  return '(' + this.left + ', ' + this.top + ' - ' + this.width + 'w x ' +
         this.height + 'h)';
};


/**
 * Compares rectangles for equality.
 * @param {goog.math.Rect} a A Rectangle.
 * @param {goog.math.Rect} b A Rectangle.
 * @return {boolean} true iff the rectangles are equal, or if both are null.
 */
goog.math.Rect.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.left == b.left && a.width == b.width &&
         a.top == b.top && a.height == b.height;
};


/**
 * Computes the intersection of this rectangle and the rectangle parameter.  If
 * there is no intersection, returns false and leaves this rectangle as is.
 * @param {goog.math.Rect} rect A Rectangle.
 * @return {boolean} True iff this rectangle intersects with the parameter.
 */
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);

  if (x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);

    if (y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;

      return true;
    }
  }
  return false;
};


/**
 * Returns the intersection of two rectangles. Two rectangles intersect if they
 * touch at all, for example, two zero width and height rectangles would
 * intersect if they had the same top and left.
 * @param {goog.math.Rect} a A Rectangle.
 * @param {goog.math.Rect} b A Rectangle.
 * @return {goog.math.Rect?} A new intersection rect (even if width and height
 *     are 0), or null if there is no intersection.
 */
goog.math.Rect.intersection = function(a, b) {
  // There is no nice way to do intersection via a clone, because any such
  // clone might be unnecessary if this function returns null.  So, we duplicate
  // code from above.

  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);

  if (x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);

    if (y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  return null;
};


/**
 * Returns whether two rectangles intersect. Two rectangles intersect if they
 * touch at all, for example, two zero width and height rectangles would
 * intersect if they had the same top and left.
 * @param {goog.math.Rect} a A Rectangle.
 * @param {goog.math.Rect} b A Rectangle.
 * @return {boolean} Whether a and b intersect.
 */
goog.math.Rect.intersects = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);

  if (x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);

    if (y0 <= y1) {
      return true;
    }
  }
  return false;
};


/**
 * Returns whether a rectangle intersects this rectangle.
 * @param {goog.math.Rect} rect A rectangle.
 * @return {boolean} Whether rect intersects this rectangle.
 */
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect);
};


/**
 * Computes the difference regions between two rectangles. The return value is
 * an array of 0 to 4 rectangles defining the remaining regions of the first
 * rectangle after the second has been subtracted.
 * @param {goog.math.Rect} a A Rectangle.
 * @param {goog.math.Rect} b A Rectangle.
 * @return {Array.<goog.math.Rect>} An array with 0 to 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
goog.math.Rect.difference = function(a, b) {
  if (!goog.math.Rect.intersection(a, b)) {
    return [a.clone()];
  }

  var result = [];

  var top = a.top;
  var height = a.height;

  var ar = a.left + a.width;
  var ab = a.top + a.height;

  var br = b.left + b.width;
  var bb = b.top + b.height;

  if (b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
  }
  if (bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top;
  }
  if (b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height));
  }
  if (br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height));
  }

  return result;
};


/**
 * Computes the difference regions between this rectangle the rectangle
 * parameter. The return value is an array of 0 to 4 rectangles defining the
 * remaining regions of this rectangle after the other has been subtracted.
 * @param {goog.math.Rect} rect A Rectangle.
 * @return {Array.<goog.math.Rect>} an array with 0 to 4 rectangles which
 *     together define the difference area of rectangle a minus rectangle b.
 */
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect);
};


/**
 * Expand this rectangle to also include the area of the given rectangle.
 * @param {goog.math.Rect} rect The other rectangle.
 */
goog.math.Rect.prototype.boundingRect = function(rect) {
  // We compute right and bottom before we change left and top below.
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);

  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);

  this.width = right - this.left;
  this.height = bottom - this.top;
};


/**
 * Returns a new rectangle which completely contains both input rectangles.
 * @param {goog.math.Rect} a A rectangle.
 * @param {goog.math.Rect} b A rectangle.
 * @return {goog.math.Rect?} A new bounding rect, or null if either rect is
 *     null.
 */
goog.math.Rect.boundingRect = function(a, b) {
  if (!a || !b) {
    return null;
  }

  var clone = a.clone();
  clone.boundingRect(b);

  return clone;
};
