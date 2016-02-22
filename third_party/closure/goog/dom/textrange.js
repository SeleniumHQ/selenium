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
 * @fileoverview Utilities for working with text ranges in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.TextRange');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.AbstractRange');
goog.require('goog.dom.RangeType');
goog.require('goog.dom.SavedRange');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TextRangeIterator');
goog.require('goog.dom.browserrange');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * Create a new text selection with no properties.  Do not use this constructor:
 * use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractRange}
 * @final
 */
goog.dom.TextRange = function() {
  /**
   * The browser specific range wrapper.  This can be null if one of the other
   * representations of the range is specified.
   * @private {goog.dom.browserrange.AbstractRange?}
   */
  this.browserRangeWrapper_ = null;

  /**
   * The start node of the range.  This can be null if one of the other
   * representations of the range is specified.
   * @private {Node}
   */
  this.startNode_ = null;

  /**
   * The start offset of the range.  This can be null if one of the other
   * representations of the range is specified.
   * @private {?number}
   */
  this.startOffset_ = null;

  /**
   * The end node of the range.  This can be null if one of the other
   * representations of the range is specified.
   * @private {Node}
   */
  this.endNode_ = null;

  /**
   * The end offset of the range.  This can be null if one of the other
   * representations of the range is specified.
   * @private {?number}
   */
  this.endOffset_ = null;

  /**
   * Whether the focus node is before the anchor node.
   * @private {boolean}
   */
  this.isReversed_ = false;
};
goog.inherits(goog.dom.TextRange, goog.dom.AbstractRange);


/**
 * Create a new range wrapper from the given browser range object.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Range|TextRange} range The browser range object.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {!goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromBrowserRange = function(range, opt_isReversed) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(
      goog.dom.browserrange.createRange(range), opt_isReversed);
};


/**
 * Create a new range wrapper from the given browser range wrapper.
 * @param {goog.dom.browserrange.AbstractRange} browserRange The browser range
 *     wrapper.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {!goog.dom.TextRange} A range wrapper object.
 * @private
 */
goog.dom.TextRange.createFromBrowserRangeWrapper_ = function(browserRange,
    opt_isReversed) {
  var range = new goog.dom.TextRange();

  // Initialize the range as a browser range wrapper type range.
  range.browserRangeWrapper_ = browserRange;
  range.isReversed_ = !!opt_isReversed;

  return range;
};


/**
 * Create a new range wrapper that selects the given node's text.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Node} node The node to select.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {!goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromNodeContents = function(node, opt_isReversed) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(
      goog.dom.browserrange.createRangeFromNodeContents(node),
      opt_isReversed);
};


/**
 * Create a new range wrapper that selects the area between the given nodes,
 * accounting for the given offsets.  Do not use this method directly - please
 * use goog.dom.Range.createFrom* instead.
 * @param {Node} anchorNode The node to start with.
 * @param {number} anchorOffset The offset within the node to start.
 * @param {Node} focusNode The node to end with.
 * @param {number} focusOffset The offset within the node to end.
 * @return {!goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromNodes = function(anchorNode, anchorOffset,
    focusNode, focusOffset) {
  var range = new goog.dom.TextRange();
  range.isReversed_ = /** @suppress {missingRequire} */ (
      goog.dom.Range.isReversed(anchorNode, anchorOffset,
                                focusNode, focusOffset));

  // Avoid selecting terminal elements directly
  if (goog.dom.isElement(anchorNode) && !goog.dom.canHaveChildren(anchorNode)) {
    var parent = anchorNode.parentNode;
    anchorOffset = goog.array.indexOf(parent.childNodes, anchorNode);
    anchorNode = parent;
  }

  if (goog.dom.isElement(focusNode) && !goog.dom.canHaveChildren(focusNode)) {
    var parent = focusNode.parentNode;
    focusOffset = goog.array.indexOf(parent.childNodes, focusNode);
    focusNode = parent;
  }

  // Initialize the range as a W3C style range.
  if (range.isReversed_) {
    range.startNode_ = focusNode;
    range.startOffset_ = focusOffset;
    range.endNode_ = anchorNode;
    range.endOffset_ = anchorOffset;
  } else {
    range.startNode_ = anchorNode;
    range.startOffset_ = anchorOffset;
    range.endNode_ = focusNode;
    range.endOffset_ = focusOffset;
  }

  return range;
};


// Method implementations


/**
 * @return {!goog.dom.TextRange} A clone of this range.
 * @override
 */
goog.dom.TextRange.prototype.clone = function() {
  var range = new goog.dom.TextRange();
  range.browserRangeWrapper_ =
      this.browserRangeWrapper_ && this.browserRangeWrapper_.clone();
  range.startNode_ = this.startNode_;
  range.startOffset_ = this.startOffset_;
  range.endNode_ = this.endNode_;
  range.endOffset_ = this.endOffset_;
  range.isReversed_ = this.isReversed_;

  return range;
};


/** @override */
goog.dom.TextRange.prototype.getType = function() {
  return goog.dom.RangeType.TEXT;
};


/** @override */
goog.dom.TextRange.prototype.getBrowserRangeObject = function() {
  return this.getBrowserRangeWrapper_().getBrowserRange();
};


/** @override */
goog.dom.TextRange.prototype.setBrowserRangeObject = function(nativeRange) {
  // Test if it's a control range by seeing if a control range only method
  // exists.
  if (goog.dom.AbstractRange.isNativeControlRange(nativeRange)) {
    return false;
  }
  this.browserRangeWrapper_ = goog.dom.browserrange.createRange(
      nativeRange);
  this.clearCachedValues_();
  return true;
};


/**
 * Clear all cached values.
 * @private
 */
goog.dom.TextRange.prototype.clearCachedValues_ = function() {
  this.startNode_ = this.startOffset_ = this.endNode_ = this.endOffset_ = null;
};


/** @override */
goog.dom.TextRange.prototype.getTextRangeCount = function() {
  return 1;
};


/** @override */
goog.dom.TextRange.prototype.getTextRange = function(i) {
  return this;
};


/**
 * @return {!goog.dom.browserrange.AbstractRange} The range wrapper object.
 * @private
 */
goog.dom.TextRange.prototype.getBrowserRangeWrapper_ = function() {
  return this.browserRangeWrapper_ ||
      (this.browserRangeWrapper_ = goog.dom.browserrange.createRangeFromNodes(
          this.getStartNode(), this.getStartOffset(),
          this.getEndNode(), this.getEndOffset()));
};


/** @override */
goog.dom.TextRange.prototype.getContainer = function() {
  return this.getBrowserRangeWrapper_().getContainer();
};


/** @override */
goog.dom.TextRange.prototype.getStartNode = function() {
  return this.startNode_ ||
      (this.startNode_ = this.getBrowserRangeWrapper_().getStartNode());
};


/** @override */
goog.dom.TextRange.prototype.getStartOffset = function() {
  return this.startOffset_ != null ? this.startOffset_ :
      (this.startOffset_ = this.getBrowserRangeWrapper_().getStartOffset());
};


/** @override */
goog.dom.TextRange.prototype.getStartPosition = function() {
  return this.getBrowserRangeWrapper_().getStartPosition();
};


/** @override */
goog.dom.TextRange.prototype.getEndNode = function() {
  return this.endNode_ ||
      (this.endNode_ = this.getBrowserRangeWrapper_().getEndNode());
};


/** @override */
goog.dom.TextRange.prototype.getEndOffset = function() {
  return this.endOffset_ != null ? this.endOffset_ :
      (this.endOffset_ = this.getBrowserRangeWrapper_().getEndOffset());
};


/** @override */
goog.dom.TextRange.prototype.getEndPosition = function() {
  return this.getBrowserRangeWrapper_().getEndPosition();
};


/**
 * Moves a TextRange to the provided nodes and offsets.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @param {boolean} isReversed Whether the range is reversed.
 */
goog.dom.TextRange.prototype.moveToNodes = function(startNode, startOffset,
                                                    endNode, endOffset,
                                                    isReversed) {
  this.startNode_ = startNode;
  this.startOffset_ = startOffset;
  this.endNode_ = endNode;
  this.endOffset_ = endOffset;
  this.isReversed_ = isReversed;
  this.browserRangeWrapper_ = null;
};


/** @override */
goog.dom.TextRange.prototype.isReversed = function() {
  return this.isReversed_;
};


/** @override */
goog.dom.TextRange.prototype.containsRange = function(otherRange,
                                                      opt_allowPartial) {
  var otherRangeType = otherRange.getType();
  if (otherRangeType == goog.dom.RangeType.TEXT) {
    return this.getBrowserRangeWrapper_().containsRange(
        otherRange.getBrowserRangeWrapper_(), opt_allowPartial);
  } else if (otherRangeType == goog.dom.RangeType.CONTROL) {
    var elements = otherRange.getElements();
    var fn = opt_allowPartial ? goog.array.some : goog.array.every;
    return fn(elements, /** @this {!goog.dom.TextRange} */ function(el) {
      return this.containsNode(el, opt_allowPartial);
    }, this);
  }
  return false;
};


/**
 * Tests if the given node is in a document.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the given node is in the given document.
 */
goog.dom.TextRange.isAttachedNode = function(node) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    var returnValue = false;
    /** @preserveTry */
    try {
      returnValue = node.parentNode;
    } catch (e) {
      // IE sometimes throws Invalid Argument errors when a node is detached.
      // Note: trying to return a value from the above try block can cause IE
      // to crash.  It is necessary to use the local returnValue
    }
    return !!returnValue;
  } else {
    return goog.dom.contains(node.ownerDocument.body, node);
  }
};


/** @override */
goog.dom.TextRange.prototype.isRangeInDocument = function() {
  // Ensure any cached nodes are in the document.  IE also allows ranges to
  // become detached, so we check if the range is still in the document as
  // well for IE.
  return (!this.startNode_ ||
          goog.dom.TextRange.isAttachedNode(this.startNode_)) &&
         (!this.endNode_ ||
          goog.dom.TextRange.isAttachedNode(this.endNode_)) &&
         (!(goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) ||
          this.getBrowserRangeWrapper_().isRangeInDocument());
};


/** @override */
goog.dom.TextRange.prototype.isCollapsed = function() {
  return this.getBrowserRangeWrapper_().isCollapsed();
};


/** @override */
goog.dom.TextRange.prototype.getText = function() {
  return this.getBrowserRangeWrapper_().getText();
};


/** @override */
goog.dom.TextRange.prototype.getHtmlFragment = function() {
  // TODO(robbyw): Generalize the code in browserrange so it is static and
  // just takes an iterator.  This would mean we don't always have to create a
  // browser range.
  return this.getBrowserRangeWrapper_().getHtmlFragment();
};


/** @override */
goog.dom.TextRange.prototype.getValidHtml = function() {
  return this.getBrowserRangeWrapper_().getValidHtml();
};


/** @override */
goog.dom.TextRange.prototype.getPastableHtml = function() {
  // TODO(robbyw): Get any attributes the table or tr has.

  var html = this.getValidHtml();

  if (html.match(/^\s*<td\b/i)) {
    // Match html starting with a TD.
    html = '<table><tbody><tr>' + html + '</tr></tbody></table>';
  } else if (html.match(/^\s*<tr\b/i)) {
    // Match html starting with a TR.
    html = '<table><tbody>' + html + '</tbody></table>';
  } else if (html.match(/^\s*<tbody\b/i)) {
    // Match html starting with a TBODY.
    html = '<table>' + html + '</table>';
  } else if (html.match(/^\s*<li\b/i)) {
    // Match html starting with an LI.
    var container = /** @type {!Element} */ (this.getContainer());
    var tagType = goog.dom.TagName.UL;
    while (container) {
      if (container.tagName == goog.dom.TagName.OL) {
        tagType = goog.dom.TagName.OL;
        break;
      } else if (container.tagName == goog.dom.TagName.UL) {
        break;
      }
      container = container.parentNode;
    }
    html = goog.string.buildString('<', tagType, '>', html, '</', tagType, '>');
  }

  return html;
};


/**
 * Returns a TextRangeIterator over the contents of the range.  Regardless of
 * the direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {!goog.dom.TextRangeIterator} An iterator over tags in the range.
 * @override
 */
goog.dom.TextRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.TextRangeIterator(this.getStartNode(),
      this.getStartOffset(), this.getEndNode(), this.getEndOffset());
};


// RANGE ACTIONS


/** @override */
goog.dom.TextRange.prototype.select = function() {
  this.getBrowserRangeWrapper_().select(this.isReversed_);
};


/** @override */
goog.dom.TextRange.prototype.removeContents = function() {
  this.getBrowserRangeWrapper_().removeContents();
  this.clearCachedValues_();
};


/**
 * Surrounds the text range with the specified element (on Mozilla) or with a
 * clone of the specified element (on IE).  Returns a reference to the
 * surrounding element if the operation was successful; returns null if the
 * operation failed.
 * @param {Element} element The element with which the selection is to be
 *    surrounded.
 * @return {Element} The surrounding element (same as the argument on Mozilla,
 *    but not on IE), or null if unsuccessful.
 */
goog.dom.TextRange.prototype.surroundContents = function(element) {
  var output = this.getBrowserRangeWrapper_().surroundContents(element);
  this.clearCachedValues_();
  return output;
};


/** @override */
goog.dom.TextRange.prototype.insertNode = function(node, before) {
  var output = this.getBrowserRangeWrapper_().insertNode(node, before);
  this.clearCachedValues_();
  return output;
};


/** @override */
goog.dom.TextRange.prototype.surroundWithNodes = function(startNode, endNode) {
  this.getBrowserRangeWrapper_().surroundWithNodes(startNode, endNode);
  this.clearCachedValues_();
};


// SAVE/RESTORE


/** @override */
goog.dom.TextRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedTextRange_(this);
};


// RANGE MODIFICATION


/** @override */
goog.dom.TextRange.prototype.collapse = function(toAnchor) {
  var toStart = this.isReversed() ? !toAnchor : toAnchor;

  if (this.browserRangeWrapper_) {
    this.browserRangeWrapper_.collapse(toStart);
  }

  if (toStart) {
    this.endNode_ = this.startNode_;
    this.endOffset_ = this.startOffset_;
  } else {
    this.startNode_ = this.endNode_;
    this.startOffset_ = this.endOffset_;
  }

  // Collapsed ranges can't be reversed
  this.isReversed_ = false;
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.AbstractRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedTextRange_ = function(range) {
  goog.dom.DomSavedTextRange_.base(this, 'constructor');

  /**
   * The anchor node.
   * @type {Node}
   * @private
   */
  this.anchorNode_ = range.getAnchorNode();

  /**
   * The anchor node offset.
   * @type {number}
   * @private
   */
  this.anchorOffset_ = range.getAnchorOffset();

  /**
   * The focus node.
   * @type {Node}
   * @private
   */
  this.focusNode_ = range.getFocusNode();

  /**
   * The focus node offset.
   * @type {number}
   * @private
   */
  this.focusOffset_ = range.getFocusOffset();
};
goog.inherits(goog.dom.DomSavedTextRange_, goog.dom.SavedRange);


/**
 * @return {!goog.dom.AbstractRange} The restored range.
 * @override
 */
goog.dom.DomSavedTextRange_.prototype.restoreInternal = function() {
  return /** @suppress {missingRequire} */ (
      goog.dom.Range.createFromNodes(this.anchorNode_, this.anchorOffset_,
                                     this.focusNode_, this.focusOffset_));
};


/** @override */
goog.dom.DomSavedTextRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedTextRange_.superClass_.disposeInternal.call(this);

  this.anchorNode_ = null;
  this.focusNode_ = null;
};
