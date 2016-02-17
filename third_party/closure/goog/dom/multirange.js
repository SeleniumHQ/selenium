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
 * @fileoverview Utilities for working with W3C multi-part ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.MultiRange');
goog.provide('goog.dom.MultiRangeIterator');

goog.require('goog.array');
goog.require('goog.dom.AbstractMultiRange');
goog.require('goog.dom.AbstractRange');
goog.require('goog.dom.RangeIterator');
goog.require('goog.dom.RangeType');
goog.require('goog.dom.SavedRange');
goog.require('goog.dom.TextRange');
goog.require('goog.iter.StopIteration');
goog.require('goog.log');



/**
 * Creates a new multi part range with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractMultiRange}
 * @final
 */
goog.dom.MultiRange = function() {
  /**
   * Logging object.
   * @private {goog.log.Logger}
   */
  this.logger_ = goog.log.getLogger('goog.dom.MultiRange');

  /**
   * Array of browser sub-ranges comprising this multi-range.
   * @private {Array<Range>}
   */
  this.browserRanges_ = [];

  /**
   * Lazily initialized array of range objects comprising this multi-range.
   * @private {Array<goog.dom.TextRange>}
   */
  this.ranges_ = [];

  /**
   * Lazily computed sorted version of ranges_, sorted by start point.
   * @private {Array<goog.dom.TextRange>?}
   */
  this.sortedRanges_ = null;

  /**
   * Lazily computed container node.
   * @private {Node}
   */
  this.container_ = null;
};
goog.inherits(goog.dom.MultiRange, goog.dom.AbstractMultiRange);


/**
 * Creates a new range wrapper from the given browser selection object.  Do not
 * use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Selection} selection The browser selection object.
 * @return {!goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromBrowserSelection = function(selection) {
  var range = new goog.dom.MultiRange();
  for (var i = 0, len = selection.rangeCount; i < len; i++) {
    range.browserRanges_.push(selection.getRangeAt(i));
  }
  return range;
};


/**
 * Creates a new range wrapper from the given browser ranges.  Do not
 * use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Array<Range>} browserRanges The browser ranges.
 * @return {!goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromBrowserRanges = function(browserRanges) {
  var range = new goog.dom.MultiRange();
  range.browserRanges_ = goog.array.clone(browserRanges);
  return range;
};


/**
 * Creates a new range wrapper from the given goog.dom.TextRange objects.  Do
 * not use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Array<goog.dom.TextRange>} textRanges The text range objects.
 * @return {!goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromTextRanges = function(textRanges) {
  var range = new goog.dom.MultiRange();
  range.ranges_ = textRanges;
  range.browserRanges_ = goog.array.map(
      textRanges, function(range) { return range.getBrowserRangeObject(); });
  return range;
};


// Method implementations


/**
 * Clears cached values.  Should be called whenever this.browserRanges_ is
 * modified.
 * @private
 */
goog.dom.MultiRange.prototype.clearCachedValues_ = function() {
  this.ranges_ = [];
  this.sortedRanges_ = null;
  this.container_ = null;
};


/**
 * @return {!goog.dom.MultiRange} A clone of this range.
 * @override
 */
goog.dom.MultiRange.prototype.clone = function() {
  return goog.dom.MultiRange.createFromBrowserRanges(this.browserRanges_);
};


/** @override */
goog.dom.MultiRange.prototype.getType = function() {
  return goog.dom.RangeType.MULTI;
};


/** @override */
goog.dom.MultiRange.prototype.getBrowserRangeObject = function() {
  // NOTE(robbyw): This method does not make sense for multi-ranges.
  if (this.browserRanges_.length > 1) {
    goog.log.warning(
        this.logger_,
        'getBrowserRangeObject called on MultiRange with more than 1 range');
  }
  return this.browserRanges_[0];
};


/** @override */
goog.dom.MultiRange.prototype.setBrowserRangeObject = function(nativeRange) {
  // TODO(robbyw): Look in to adding setBrowserSelectionObject.
  return false;
};


/** @override */
goog.dom.MultiRange.prototype.getTextRangeCount = function() {
  return this.browserRanges_.length;
};


/** @override */
goog.dom.MultiRange.prototype.getTextRange = function(i) {
  if (!this.ranges_[i]) {
    this.ranges_[i] =
        goog.dom.TextRange.createFromBrowserRange(this.browserRanges_[i]);
  }
  return this.ranges_[i];
};


/** @override */
goog.dom.MultiRange.prototype.getContainer = function() {
  if (!this.container_) {
    var nodes = [];
    for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
      nodes.push(this.getTextRange(i).getContainer());
    }
    this.container_ = goog.dom.findCommonAncestor.apply(null, nodes);
  }
  return this.container_;
};


/**
 * @return {!Array<goog.dom.TextRange>} An array of sub-ranges, sorted by start
 *     point.
 */
goog.dom.MultiRange.prototype.getSortedRanges = function() {
  if (!this.sortedRanges_) {
    this.sortedRanges_ = this.getTextRanges();
    this.sortedRanges_.sort(function(a, b) {
      var aStartNode = a.getStartNode();
      var aStartOffset = a.getStartOffset();
      var bStartNode = b.getStartNode();
      var bStartOffset = b.getStartOffset();

      if (aStartNode == bStartNode && aStartOffset == bStartOffset) {
        return 0;
      }

      return goog.dom.Range.isReversed(
                 aStartNode, aStartOffset, bStartNode, bStartOffset) ?
          1 :
          -1;
    });
  }
  return this.sortedRanges_;
};


/** @override */
goog.dom.MultiRange.prototype.getStartNode = function() {
  return this.getSortedRanges()[0].getStartNode();
};


/** @override */
goog.dom.MultiRange.prototype.getStartOffset = function() {
  return this.getSortedRanges()[0].getStartOffset();
};


/** @override */
goog.dom.MultiRange.prototype.getEndNode = function() {
  // NOTE(robbyw): This may return the wrong node if any subranges overlap.
  return goog.array.peek(this.getSortedRanges()).getEndNode();
};


/** @override */
goog.dom.MultiRange.prototype.getEndOffset = function() {
  // NOTE(robbyw): This may return the wrong value if any subranges overlap.
  return goog.array.peek(this.getSortedRanges()).getEndOffset();
};


/** @override */
goog.dom.MultiRange.prototype.isRangeInDocument = function() {
  return goog.array.every(this.getTextRanges(), function(range) {
    return range.isRangeInDocument();
  });
};


/** @override */
goog.dom.MultiRange.prototype.isCollapsed = function() {
  return this.browserRanges_.length == 0 ||
      this.browserRanges_.length == 1 && this.getTextRange(0).isCollapsed();
};


/** @override */
goog.dom.MultiRange.prototype.getText = function() {
  return goog.array
      .map(this.getTextRanges(), function(range) { return range.getText(); })
      .join('');
};


/** @override */
goog.dom.MultiRange.prototype.getHtmlFragment = function() {
  return this.getValidHtml();
};


/** @override */
goog.dom.MultiRange.prototype.getValidHtml = function() {
  // NOTE(robbyw): This does not behave well if the sub-ranges overlap.
  return goog.array
      .map(
          this.getTextRanges(),
          function(range) { return range.getValidHtml(); })
      .join('');
};


/** @override */
goog.dom.MultiRange.prototype.getPastableHtml = function() {
  // TODO(robbyw): This should probably do something smart like group TR and TD
  // selections in to the same table.
  return this.getValidHtml();
};


/** @override */
goog.dom.MultiRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.MultiRangeIterator(this);
};


// RANGE ACTIONS


/** @override */
goog.dom.MultiRange.prototype.select = function() {
  var selection =
      goog.dom.AbstractRange.getBrowserSelectionForWindow(this.getWindow());
  selection.removeAllRanges();
  for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
    selection.addRange(this.getTextRange(i).getBrowserRangeObject());
  }
};


/** @override */
goog.dom.MultiRange.prototype.removeContents = function() {
  goog.array.forEach(
      this.getTextRanges(), function(range) { range.removeContents(); });
};


// SAVE/RESTORE


/** @override */
goog.dom.MultiRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedMultiRange_(this);
};


// RANGE MODIFICATION


/**
 * Collapses this range to a single point, either the first or last point
 * depending on the parameter.  This will result in the number of ranges in this
 * multi range becoming 1.
 * @param {boolean} toAnchor Whether to collapse to the anchor.
 * @override
 */
goog.dom.MultiRange.prototype.collapse = function(toAnchor) {
  if (!this.isCollapsed()) {
    var range = toAnchor ? this.getTextRange(0) :
                           this.getTextRange(this.getTextRangeCount() - 1);

    this.clearCachedValues_();
    range.collapse(toAnchor);
    this.ranges_ = [range];
    this.sortedRanges_ = [range];
    this.browserRanges_ = [range.getBrowserRangeObject()];
  }
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.MultiRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedMultiRange_ = function(range) {
  /**
   * Array of saved ranges.
   * @type {Array<goog.dom.SavedRange>}
   * @private
   */
  this.savedRanges_ = goog.array.map(
      range.getTextRanges(), function(range) { return range.saveUsingDom(); });
};
goog.inherits(goog.dom.DomSavedMultiRange_, goog.dom.SavedRange);


/**
 * @return {!goog.dom.MultiRange} The restored range.
 * @override
 */
goog.dom.DomSavedMultiRange_.prototype.restoreInternal = function() {
  var ranges = goog.array.map(
      this.savedRanges_, function(savedRange) { return savedRange.restore(); });
  return goog.dom.MultiRange.createFromTextRanges(ranges);
};


/** @override */
goog.dom.DomSavedMultiRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedMultiRange_.superClass_.disposeInternal.call(this);

  goog.array.forEach(
      this.savedRanges_, function(savedRange) { savedRange.dispose(); });
  delete this.savedRanges_;
};


// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {goog.dom.MultiRange} range The range to traverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 * @final
 */
goog.dom.MultiRangeIterator = function(range) {
  /**
   * The list of range iterators left to traverse.
   * @private {Array<goog.dom.RangeIterator>}
   */
  this.iterators_ = null;

  /**
   * The index of the current sub-iterator being traversed.
   * @private {number}
   */
  this.currentIdx_ = 0;

  if (range) {
    this.iterators_ = goog.array.map(range.getSortedRanges(), function(r) {
      return goog.iter.toIterator(r);
    });
  }

  goog.dom.MultiRangeIterator.base(
      this, 'constructor', range ? this.getStartNode() : null, false);
};
goog.inherits(goog.dom.MultiRangeIterator, goog.dom.RangeIterator);


/** @override */
goog.dom.MultiRangeIterator.prototype.getStartTextOffset = function() {
  return this.iterators_[this.currentIdx_].getStartTextOffset();
};


/** @override */
goog.dom.MultiRangeIterator.prototype.getEndTextOffset = function() {
  return this.iterators_[this.currentIdx_].getEndTextOffset();
};


/** @override */
goog.dom.MultiRangeIterator.prototype.getStartNode = function() {
  return this.iterators_[0].getStartNode();
};


/** @override */
goog.dom.MultiRangeIterator.prototype.getEndNode = function() {
  return goog.array.peek(this.iterators_).getEndNode();
};


/** @override */
goog.dom.MultiRangeIterator.prototype.isLast = function() {
  return this.iterators_[this.currentIdx_].isLast();
};


/** @override */
goog.dom.MultiRangeIterator.prototype.next = function() {
  /** @preserveTry */
  try {
    var it = this.iterators_[this.currentIdx_];
    var next = it.next();
    this.setPosition(it.node, it.tagType, it.depth);
    return next;
  } catch (ex) {
    if (ex !== goog.iter.StopIteration ||
        this.iterators_.length - 1 == this.currentIdx_) {
      throw ex;
    } else {
      // In case we got a StopIteration, increment counter and try again.
      this.currentIdx_++;
      return this.next();
    }
  }
};


/** @override */
goog.dom.MultiRangeIterator.prototype.copyFrom = function(other) {
  this.iterators_ = goog.array.clone(other.iterators_);
  goog.dom.MultiRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {!goog.dom.MultiRangeIterator} An identical iterator.
 * @override
 */
goog.dom.MultiRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.MultiRangeIterator(null);
  copy.copyFrom(this);
  return copy;
};
