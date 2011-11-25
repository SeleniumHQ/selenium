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
 * @fileoverview Utilities for working with ranges comprised of multiple
 * sub-ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.AbstractMultiRange');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.AbstractRange');



/**
 * Creates a new multi range with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractRange}
 */
goog.dom.AbstractMultiRange = function() {
};
goog.inherits(goog.dom.AbstractMultiRange, goog.dom.AbstractRange);


/** @override */
goog.dom.AbstractMultiRange.prototype.containsRange = function(
    otherRange, opt_allowPartial) {
  // TODO(user): This will incorrectly return false if two (or more) adjacent
  // elements are both in the control range, and are also in the text range
  // being compared to.
  var ranges = this.getTextRanges();
  var otherRanges = otherRange.getTextRanges();

  var fn = opt_allowPartial ? goog.array.some : goog.array.every;
  return fn(otherRanges, function(otherRange) {
    return goog.array.some(ranges, function(range) {
      return range.containsRange(otherRange, opt_allowPartial);
    });
  });
};


/** @override */
goog.dom.AbstractMultiRange.prototype.insertNode = function(node, before) {
  if (before) {
    goog.dom.insertSiblingBefore(node, this.getStartNode());
  } else {
    goog.dom.insertSiblingAfter(node, this.getEndNode());
  }
  return node;
};


/** @override */
goog.dom.AbstractMultiRange.prototype.surroundWithNodes = function(startNode,
    endNode) {
  this.insertNode(startNode, true);
  this.insertNode(endNode, false);
};
