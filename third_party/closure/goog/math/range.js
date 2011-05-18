// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A utility class for representing a numeric range.
 */


goog.provide('goog.math.Range');



/**
 * A number range.
 * @param {number} a One end of the range.
 * @param {number} b The other end of the range.
 * @constructor
 */
goog.math.Range = function(a, b) {
  /**
   * The lowest value in the range.
   * @type {number}
   */
  this.start = a < b ? a : b;

  /**
   * The highest value in the range.
   * @type {number}
   */
  this.end = a < b ? b : a;
};


/**
 * @return {!goog.math.Range} A clone of this Range.
 */
goog.math.Range.prototype.clone = function() {
  return new goog.math.Range(this.start, this.end);
};


if (goog.DEBUG) {
  /**
   * Returns a string representing the range.
   * @return {string} In the form [-3.5, 8.13].
   */
  goog.math.Range.prototype.toString = function() {
    return '[' + this.start + ', ' + this.end + ']';
  };
}


/**
 * Compares ranges for equality.
 * @param {goog.math.Range} a A Range.
 * @param {goog.math.Range} b A Range.
 * @return {boolean} True iff both the starts and the ends of the ranges are
 *     equal, or if both ranges are null.
 */
goog.math.Range.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.start == b.start && a.end == b.end;
};


/**
 * Given two ranges on the same dimension, this method returns the intersection
 * of those ranges.
 * @param {goog.math.Range} a A Range.
 * @param {goog.math.Range} b A Range.
 * @return {goog.math.Range} A new Range representing the intersection of two
 *     ranges, or null if there is no intersection. Ranges are assumed to
 *     include their end points, and the intersection can be a point.
 */
goog.math.Range.intersection = function(a, b) {
  var c0 = Math.max(a.start, b.start);
  var c1 = Math.min(a.end, b.end);
  return (c0 <= c1) ? new goog.math.Range(c0, c1) : null;
};


/**
 * Given two ranges on the same dimension, determines whether they intersect.
 * @param {goog.math.Range} a A Range.
 * @param {goog.math.Range} b A Range.
 * @return {boolean} Whether they intersect.
 */
goog.math.Range.hasIntersection = function(a, b) {
  return Math.max(a.start, b.start) <= Math.min(a.end, b.end);
};


/**
 * Given two ranges on the same dimension, this returns a range that covers
 * both ranges.
 * @param {goog.math.Range} a A Range.
 * @param {goog.math.Range} b A Range.
 * @return {!goog.math.Range} A new Range representing the bounding
 *     range.
 */
goog.math.Range.boundingRange = function(a, b) {
  return new goog.math.Range(Math.min(a.start, b.start),
                             Math.max(a.end, b.end));
};


/**
 * Given two ranges, returns true if the first range completely overlaps the
 * second.
 * @param {goog.math.Range} a The first Range.
 * @param {goog.math.Range} b The second Range.
 * @return {boolean} True if b is contained inside a, false otherwise.
 */
goog.math.Range.contains = function(a, b) {
  return a.start <= b.start && a.end >= b.end;
};


/**
 * Given a range and a point, returns true if the range contains the point.
 * @param {goog.math.Range} range The range.
 * @param {number} p The point.
 * @return {boolean} True if p is contained inside range, false otherwise.
 */
goog.math.Range.containsPoint = function(range, p) {
  return range.start <= p && range.end >= p;
};
