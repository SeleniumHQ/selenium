// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A RangeSet is a structure that manages a list of ranges.
 * Numeric ranges may be added and removed from the RangeSet, and the set may
 * be queried for the presence or absence of individual values or ranges of
 * values.
 *
 * This may be used, for example, to track the availability of sparse elements
 * in an array without iterating over the entire array.
 *
 */

goog.provide('goog.math.RangeSet');

goog.require('goog.array');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.math.Range');



/**
 * Constructs a new RangeSet, which can store numeric ranges.
 *
 * Ranges are treated as half-closed: that is, they are exclusive of their end
 * value [start, end).
 *
 * New ranges added to the set which overlap the values in one or more existing
 * ranges will be merged.
 *
 * @constructor
 */
goog.math.RangeSet = function() {
  /**
   * A sorted list of ranges that represent the values in the set.
   * @type {!Array.<!goog.math.Range>}
   * @private
   */
  this.ranges_ = [];
};


if (goog.DEBUG) {
  /**
   * @return {string} A debug string in the form [[1, 5], [8, 9], [15, 30]].
   */
  goog.math.RangeSet.prototype.toString = function() {
    return '[' + this.ranges_.join(', ') + ']';
  };
}


/**
 * Compares two sets for equality.
 *
 * @param {goog.math.RangeSet} a A range set.
 * @param {goog.math.RangeSet} b A range set.
 * @return {boolean} Whether both sets contain the same values.
 */
goog.math.RangeSet.equals = function(a, b) {
  // Fast check for object equality. Also succeeds if a and b are both null.
  return a == b || !!(a && b && goog.array.equals(a.ranges_, b.ranges_,
      goog.math.Range.equals));
};


/**
 * @return {!goog.math.RangeSet} A new RangeSet containing the same values as
 *      this one.
 */
goog.math.RangeSet.prototype.clone = function() {
  var set = new goog.math.RangeSet();

  for (var i = this.ranges_.length; i--;) {
    set.ranges_[i] = this.ranges_[i].clone();
  }

  return set;
};


/**
 * Adds a range to the set. If the new range overlaps existing values, those
 * ranges will be merged.
 *
 * @param {goog.math.Range} a The range to add.
 */
goog.math.RangeSet.prototype.add = function(a) {
  if (a.end <= a.start) {
    // Empty ranges are ignored.
    return;
  }

  a = a.clone();

  // Find the insertion point.
  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (a.start <= b.end) {
      a.start = Math.min(a.start, b.start);
      break;
    }
  }

  var insertionPoint = i;

  for (; b = this.ranges_[i]; i++) {
    if (a.end < b.start) {
      break;
    }
    a.end = Math.max(a.end, b.end);
  }

  this.ranges_.splice(insertionPoint, i - insertionPoint, a);
};


/**
 * Removes a range of values from the set.
 *
 * @param {goog.math.Range} a The range to remove.
 */
goog.math.RangeSet.prototype.remove = function(a) {
  if (a.end <= a.start) {
    // Empty ranges are ignored.
    return;
  }

  // Find the insertion point.
  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (a.start < b.end) {
      break;
    }
  }

  if (!b || a.end < b.start) {
    // The range being removed doesn't overlap any existing range. Exit early.
    return;
  }

  var insertionPoint = i;

  if (a.start > b.start) {
    // There is an overlap with the nearest range. Modify it accordingly.
    insertionPoint++;

    if (a.end < b.end) {
      goog.array.insertAt(this.ranges_,
                          new goog.math.Range(a.end, b.end),
                          insertionPoint);
    }
    b.end = a.start;
  }

  for (i = insertionPoint, b; b = this.ranges_[i]; i++) {
    b.start = Math.max(a.end, b.start);
    if (a.end < b.end) {
      break;
    }
  }

  this.ranges_.splice(insertionPoint, i - insertionPoint);
};


/**
 * Determines whether a given range is in the set. Only succeeds if the entire
 * range is available.
 *
 * @param {goog.math.Range} a The query range.
 * @return {boolean} Whether the entire requested range is set.
 */
goog.math.RangeSet.prototype.contains = function(a) {
  if (a.end <= a.start) {
    return false;
  }

  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (a.start < b.end) {
      if (a.end >= b.start) {
        return goog.math.Range.contains(b, a);
      }
      break;
    }
  }
  return false;
};


/**
 * Determines whether a given value is set in the RangeSet.
 *
 * @param {number} value The value to test.
 * @return {boolean} Whether the given value is in the set.
 */
goog.math.RangeSet.prototype.containsValue = function(value) {
  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (value < b.end) {
      if (value >= b.start) {
        return true;
      }
      break;
    }
  }
  return false;
};


/**
 * Returns the union of this RangeSet with another.
 *
 * @param {goog.math.RangeSet} set Another RangeSet.
 * @return {!goog.math.RangeSet} A new RangeSet containing all values from
 *     either set.
 */
goog.math.RangeSet.prototype.union = function(set) {
  // TODO(user): A linear-time merge would be preferable if it is ever a
  // bottleneck.
  set = set.clone();

  for (var i = 0, a; a = this.ranges_[i]; i++) {
    set.add(a);
  }

  return set;
};


/**
 * Intersects this RangeSet with another.
 *
 * @param {goog.math.RangeSet} set The RangeSet to intersect with.
 * @return {!goog.math.RangeSet} A new RangeSet containing all values set in
 *     both this and the input set.
 */
goog.math.RangeSet.prototype.intersection = function(set) {
  if (this.isEmpty() || set.isEmpty()) {
    return new goog.math.RangeSet();
  }

  set = set.inverse(this.getBounds());
  var r = this.clone();

  for (var i = 0, a; a = set.ranges_[i]; i++) {
    r.remove(a);
  }

  return r;
};


/**
 * Creates a subset of this set over the input range.
 *
 * @param {goog.math.Range} range The range to copy into the slice.
 * @return {!goog.math.RangeSet} A new RangeSet with a copy of the values in the
 *     input range.
 */
goog.math.RangeSet.prototype.slice = function(range) {
  var set = new goog.math.RangeSet();
  if (range.start >= range.end) {
    return set;
  }

  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (b.end <= range.start) {
      continue;
    }
    if (b.start > range.end) {
      break;
    }

    set.add(new goog.math.Range(Math.max(range.start, b.start),
                                Math.min(range.end, b.end)));
  }

  return set;
};


/**
 * Creates an inverted slice of this set over the input range.
 *
 * @param {goog.math.Range} range The range to copy into the slice.
 * @return {!goog.math.RangeSet} A new RangeSet containing inverted values from
 *     the original over the input range.
 */
goog.math.RangeSet.prototype.inverse = function(range) {
  var set = new goog.math.RangeSet();

  set.add(range);
  for (var i = 0, b; b = this.ranges_[i]; i++) {
    if (range.start >= b.end) {
      continue;
    }
    if (range.end < b.start) {
      break;
    }

    set.remove(b);
  }

  return set;
};


/**
 * @return {goog.math.Range} The total range this set covers, ignoring any
 *     gaps between ranges.
 */
goog.math.RangeSet.prototype.getBounds = function() {
  if (this.ranges_.length) {
    return new goog.math.Range(this.ranges_[0].start,
                               goog.array.peek(this.ranges_).end);
  }

  return null;
};


/**
 * @return {boolean} Whether any ranges are currently in the set.
 */
goog.math.RangeSet.prototype.isEmpty = function() {
  return this.ranges_.length == 0;
};


/**
 * Removes all values in the set.
 */
goog.math.RangeSet.prototype.clear = function() {
  this.ranges_.length = 0;
};


/**
 * Returns an iterator that iterates over the ranges in the RangeSet.
 *
 * @param {boolean=} opt_keys Ignored for RangeSets.
 * @return {!goog.iter.Iterator} An iterator over the values in the set.
 */
goog.math.RangeSet.prototype.__iterator__ = function(opt_keys) {
  var i = 0;
  var list = this.ranges_;

  var iterator = new goog.iter.Iterator();
  iterator.next = function() {
    if (i >= list.length) {
      throw goog.iter.StopIteration;
    }
    return list[i++].clone();
  };

  return iterator;
};
