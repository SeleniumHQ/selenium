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
 * @fileoverview Utilities for working with IE control ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.ControlRange');
goog.provide('goog.dom.ControlRangeIterator');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.AbstractMultiRange');
goog.require('goog.dom.AbstractRange');
goog.require('goog.dom.RangeIterator');
goog.require('goog.dom.RangeType');
goog.require('goog.dom.SavedRange');
goog.require('goog.dom.TagWalkType');
goog.require('goog.dom.TextRange');
goog.require('goog.iter.StopIteration');
goog.require('goog.userAgent');



/**
 * Create a new control selection with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractMultiRange}
 */
goog.dom.ControlRange = function() {
};
goog.inherits(goog.dom.ControlRange, goog.dom.AbstractMultiRange);


/**
 * Create a new range wrapper from the given browser range object.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Object} controlRange The browser range object.
 * @return {goog.dom.ControlRange} A range wrapper object.
 */
goog.dom.ControlRange.createFromBrowserRange = function(controlRange) {
  var range = new goog.dom.ControlRange();
  range.range_ = controlRange;
  return range;
};


/**
 * Create a new range wrapper that selects the given element.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {...Element} var_args The element(s) to select.
 * @return {goog.dom.ControlRange} A range wrapper object.
 */
goog.dom.ControlRange.createFromElements = function(var_args) {
  var range = goog.dom.getOwnerDocument(arguments[0]).body.createControlRange();
  for (var i = 0, len = arguments.length; i < len; i++) {
    range.addElement(arguments[i]);
  }
  return goog.dom.ControlRange.createFromBrowserRange(range);
};


/**
 * The IE control range obejct.
 * @type {Object}
 * @private
 */
goog.dom.ControlRange.prototype.range_ = null;


/**
 * Cached list of elements.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRange.prototype.elements_ = null;


/**
 * Cached sorted list of elements.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRange.prototype.sortedElements_ = null;


// Method implementations


/**
 * Clear cached values.
 * @private
 */
goog.dom.ControlRange.prototype.clearCachedValues_ = function() {
  this.elements_ = null;
  this.sortedElements_ = null;
};


/**
 * @return {goog.dom.ControlRange} A clone of this range.
 */
goog.dom.ControlRange.prototype.clone = function() {
  return goog.dom.ControlRange.createFromElements.apply(this,
                                                        this.getElements());
};


/** @override */
goog.dom.ControlRange.prototype.getType = function() {
  return goog.dom.RangeType.CONTROL;
};


/** @override */
goog.dom.ControlRange.prototype.getBrowserRangeObject = function() {
  return this.range_ || document.body.createControlRange();
};


/** @override */
goog.dom.ControlRange.prototype.setBrowserRangeObject = function(nativeRange) {
  if (!goog.dom.AbstractRange.isNativeControlRange(nativeRange)) {
    return false;
  }
  this.range_ = nativeRange;
  return true;
};


/** @override */
goog.dom.ControlRange.prototype.getTextRangeCount = function() {
  return this.range_ ? this.range_.length : 0;
};


/** @override */
goog.dom.ControlRange.prototype.getTextRange = function(i) {
  return goog.dom.TextRange.createFromNodeContents(this.range_.item(i));
};


/** @override */
goog.dom.ControlRange.prototype.getContainer = function() {
  return goog.dom.findCommonAncestor.apply(null, this.getElements());
};


/** @override */
goog.dom.ControlRange.prototype.getStartNode = function() {
  return this.getSortedElements()[0];
};


/** @override */
goog.dom.ControlRange.prototype.getStartOffset = function() {
  return 0;
};


/** @override */
goog.dom.ControlRange.prototype.getEndNode = function() {
  var sorted = this.getSortedElements();
  var startsLast = /** @type {Node} */ (goog.array.peek(sorted));
  return /** @type {Node} */ (goog.array.find(sorted, function(el) {
    return goog.dom.contains(el, startsLast);
  }));
};


/** @override */
goog.dom.ControlRange.prototype.getEndOffset = function() {
  return this.getEndNode().childNodes.length;
};


// TODO(robbyw): Figure out how to unify getElements with TextRange API.
/**
 * @return {Array.<Element>} Array of elements in the control range.
 */
goog.dom.ControlRange.prototype.getElements = function() {
  if (!this.elements_) {
    this.elements_ = [];
    if (this.range_) {
      for (var i = 0; i < this.range_.length; i++) {
        this.elements_.push(this.range_.item(i));
      }
    }
  }

  return this.elements_;
};


/**
 * @return {Array.<Element>} Array of elements comprising the control range,
 *     sorted by document order.
 */
goog.dom.ControlRange.prototype.getSortedElements = function() {
  if (!this.sortedElements_) {
    this.sortedElements_ = this.getElements().concat();
    this.sortedElements_.sort(function(a, b) {
      return a.sourceIndex - b.sourceIndex;
    });
  }

  return this.sortedElements_;
};


/** @override */
goog.dom.ControlRange.prototype.isRangeInDocument = function() {
  var returnValue = false;

  try {
    returnValue = goog.array.every(this.getElements(), function(element) {
      // On IE, this throws an exception when the range is detached.
      return goog.userAgent.IE ?
          element.parentNode :
          goog.dom.contains(element.ownerDocument.body, element);
    });
  } catch (e) {
    // IE sometimes throws Invalid Argument errors for detached elements.
    // Note: trying to return a value from the above try block can cause IE
    // to crash.  It is necessary to use the local returnValue.
  }

  return returnValue;
};


/** @override */
goog.dom.ControlRange.prototype.isCollapsed = function() {
  return !this.range_ || !this.range_.length;
};


/** @override */
goog.dom.ControlRange.prototype.getText = function() {
  // TODO(robbyw): What about for table selections?  Should those have text?
  return '';
};


/** @override */
goog.dom.ControlRange.prototype.getHtmlFragment = function() {
  return goog.array.map(this.getSortedElements(), goog.dom.getOuterHtml).
      join('');
};


/** @override */
goog.dom.ControlRange.prototype.getValidHtml = function() {
  return this.getHtmlFragment();
};


/** @override */
goog.dom.ControlRange.prototype.getPastableHtml =
    goog.dom.ControlRange.prototype.getValidHtml;


/** @override */
goog.dom.ControlRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.ControlRangeIterator(this);
};


// RANGE ACTIONS


/** @override */
goog.dom.ControlRange.prototype.select = function() {
  if (this.range_) {
    this.range_.select();
  }
};


/** @override */
goog.dom.ControlRange.prototype.removeContents = function() {
  // TODO(robbyw): Test implementing with execCommand('Delete')
  if (this.range_) {
    var nodes = [];
    for (var i = 0, len = this.range_.length; i < len; i++) {
      nodes.push(this.range_.item(i));
    }
    goog.array.forEach(nodes, goog.dom.removeNode);

    this.collapse(false);
  }
};


/** @override */
goog.dom.ControlRange.prototype.replaceContentsWithNode = function(node) {
  // Control selections have to have the node inserted before removing the
  // selection contents because a collapsed control range doesn't have start or
  // end nodes.
  var result = this.insertNode(node, true);

  if (!this.isCollapsed()) {
    this.removeContents();
  }

  return result;
};


// SAVE/RESTORE


/** @override */
goog.dom.ControlRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedControlRange_(this);
};


// RANGE MODIFICATION


/** @override */
goog.dom.ControlRange.prototype.collapse = function(toAnchor) {
  // TODO(robbyw): Should this return a text range?  If so, API needs to change.
  this.range_ = null;
  this.clearCachedValues_();
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.ControlRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedControlRange_ = function(range) {
  /**
   * The element list.
   * @type {Array.<Element>}
   * @private
   */
  this.elements_ = range.getElements();
};
goog.inherits(goog.dom.DomSavedControlRange_, goog.dom.SavedRange);


/**
 * @return {goog.dom.ControlRange} The restored range.
 */
goog.dom.DomSavedControlRange_.prototype.restoreInternal = function() {
  var doc = this.elements_.length ?
      goog.dom.getOwnerDocument(this.elements_[0]) : document;
  var controlRange = doc.body.createControlRange();
  for (var i = 0, len = this.elements_.length; i < len; i++) {
    controlRange.addElement(this.elements_[i]);
  }
  return goog.dom.ControlRange.createFromBrowserRange(controlRange);
};


/** @override */
goog.dom.DomSavedControlRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedControlRange_.superClass_.disposeInternal.call(this);
  delete this.elements_;
};


// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {goog.dom.ControlRange?} range The range to traverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 */
goog.dom.ControlRangeIterator = function(range) {
  if (range) {
    this.elements_ = range.getSortedElements();
    this.startNode_ = this.elements_.shift();
    this.endNode_ = /** @type {Node} */ (goog.array.peek(this.elements_)) ||
        this.startNode_;
  }

  goog.dom.RangeIterator.call(this, this.startNode_, false);
};
goog.inherits(goog.dom.ControlRangeIterator, goog.dom.RangeIterator);


/**
 * The first node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.startNode_ = null;


/**
 * The last node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.endNode_ = null;


/**
 * The list of elements left to traverse.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.elements_ = null;


/** @override */
goog.dom.ControlRangeIterator.prototype.getStartTextOffset = function() {
  return 0;
};


/** @override */
goog.dom.ControlRangeIterator.prototype.getEndTextOffset = function() {
  return 0;
};


/** @override */
goog.dom.ControlRangeIterator.prototype.getStartNode = function() {
  return this.startNode_;
};


/** @override */
goog.dom.ControlRangeIterator.prototype.getEndNode = function() {
  return this.endNode_;
};


/** @override */
goog.dom.ControlRangeIterator.prototype.isLast = function() {
  return !this.depth && !this.elements_.length;
};


/**
 * Move to the next position in the selection.
 * Throws {@code goog.iter.StopIteration} when it passes the end of the range.
 * @return {Node} The node at the next position.
 */
goog.dom.ControlRangeIterator.prototype.next = function() {
  // Iterate over each element in the range, and all of its children.
  if (this.isLast()) {
    throw goog.iter.StopIteration;
  } else if (!this.depth) {
    var el = this.elements_.shift();
    this.setPosition(el,
                     goog.dom.TagWalkType.START_TAG,
                     goog.dom.TagWalkType.START_TAG);
    return el;
  }

  // Call the super function.
  return goog.dom.ControlRangeIterator.superClass_.next.call(this);
};


/**
 * Replace this iterator's values with values from another.
 * @param {goog.dom.ControlRangeIterator} other The iterator to copy.
 * @protected
 */
goog.dom.ControlRangeIterator.prototype.copyFrom = function(other) {
  this.elements_ = other.elements_;
  this.startNode_ = other.startNode_;
  this.endNode_ = other.endNode_;

  goog.dom.ControlRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {goog.dom.ControlRangeIterator} An identical iterator.
 */
goog.dom.ControlRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.ControlRangeIterator(null);
  copy.copyFrom(this);
  return copy;
};
