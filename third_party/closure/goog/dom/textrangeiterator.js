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
 * @fileoverview Iterator between two DOM text range positions.
 */


// TODO(b/130421259): We're trying to migrate all ES5 subclasses of Closure
// Library to ES6. In ES6 this cannot be referenced before super is called. This
// file has at least one this before a super call (in ES5) and cannot be
// automatically upgraded to ES6 as a result. Please fix this if you have a
// chance. Note: This can sometimes be caused by not calling the super
// constructor at all. You can run the conversion tool yourself to see what it
// does on this file: blaze run //javascript/refactoring/es6_classes:convert.

goog.provide('goog.dom.TextRangeIterator');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.RangeIterator');
goog.require('goog.dom.TagName');
goog.require('goog.iter.StopIteration');



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {Node} startNode The starting node position.
 * @param {number} startOffset The offset in to startNode.  If startNode is
 *     an element, indicates an offset in to childNodes.  If startNode is a
 *     text node, indicates an offset in to nodeValue.
 * @param {Node} endNode The ending node position.
 * @param {number} endOffset The offset in to endNode.  If endNode is
 *     an element, indicates an offset in to childNodes.  If endNode is a
 *     text node, indicates an offset in to nodeValue.
 * @param {boolean=} opt_reverse Whether to traverse nodes in reverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 * @final
 */
goog.dom.TextRangeIterator = function(
    startNode, startOffset, endNode, endOffset, opt_reverse) {
  /**
   * The first node in the selection.
   * @private {?Node}
   */
  this.startNode_ = null;

  /**
   * The last node in the selection.
   * @private {?Node}
   */
  this.endNode_ = null;

  /**
   * The offset within the first node in the selection.
   * @private {number}
   */
  this.startOffset_ = 0;

  /**
   * The offset within the last node in the selection.
   * @private {number}
   */
  this.endOffset_ = 0;

  /**
   * Whether the node iterator is moving in reverse.
   * @private {boolean}
   */
  this.isReversed_ = !!opt_reverse;

  var goNext;

  if (startNode) {
    this.startNode_ = startNode;
    this.startOffset_ = startOffset;
    this.endNode_ = endNode;
    this.endOffset_ = endOffset;

    // Skip to the offset nodes - being careful to special case BRs since these
    // have no children but still can appear as the startContainer of a range.
    if (startNode.nodeType == goog.dom.NodeType.ELEMENT &&
        /** @type {!Element} */ (startNode).tagName != goog.dom.TagName.BR) {
      var startChildren = startNode.childNodes;
      var candidate = startChildren[startOffset];
      if (candidate) {
        this.startNode_ = candidate;
        this.startOffset_ = 0;
      } else {
        if (startChildren.length) {
          this.startNode_ =
              /** @type {Node} */ (goog.array.peek(startChildren));
        }
        goNext = true;
      }
    }

    if (endNode.nodeType == goog.dom.NodeType.ELEMENT) {
      this.endNode_ = endNode.childNodes[endOffset];
      if (this.endNode_) {
        this.endOffset_ = 0;
      } else {
        // The offset was past the last element.
        this.endNode_ = endNode;
      }
    }
  }

  goog.dom.TextRangeIterator.base(
      this, 'constructor', this.isReversed_ ? this.endNode_ : this.startNode_,
      this.isReversed_);

  if (goNext) {
    try {
      this.next();
    } catch (e) {
      if (e != goog.iter.StopIteration) {
        throw e;
      }
    }
  }
};
goog.inherits(goog.dom.TextRangeIterator, goog.dom.RangeIterator);


/** @override */
goog.dom.TextRangeIterator.prototype.getStartTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the start node,
  // return the saved offset.  Otherwise, return 0.
  return this.node.nodeType != goog.dom.NodeType.TEXT ?
      -1 :
      this.node == this.startNode_ ? this.startOffset_ : 0;
};


/** @override */
goog.dom.TextRangeIterator.prototype.getEndTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the end node,
  // return the saved offset.  Otherwise, return the length of the node.
  return this.node.nodeType != goog.dom.NodeType.TEXT ?
      -1 :
      this.node == this.endNode_ ? this.endOffset_ : this.node.nodeValue.length;
};


/** @override */
goog.dom.TextRangeIterator.prototype.getStartNode = function() {
  return this.startNode_;
};


/**
 * Change the start node of the iterator.
 * @param {Node} node The new start node.
 */
goog.dom.TextRangeIterator.prototype.setStartNode = function(node) {
  if (!this.isStarted()) {
    this.setPosition(node);
  }

  this.startNode_ = node;
  this.startOffset_ = 0;
};


/** @override */
goog.dom.TextRangeIterator.prototype.getEndNode = function() {
  return this.endNode_;
};


/**
 * Change the end node of the iterator.
 * @param {Node} node The new end node.
 */
goog.dom.TextRangeIterator.prototype.setEndNode = function(node) {
  this.endNode_ = node;
  this.endOffset_ = 0;
};

/** @override */
goog.dom.TextRangeIterator.prototype.isLast = function() {
  return this.isStarted() && this.isLastTag_();
};

/**
 * Returns true if the iterator is on the last step before StopIteration is
 * thrown, otherwise false.
 * @return {boolean}
 * @private
 */
goog.dom.TextRangeIterator.prototype.isLastTag_ = function() {
  if (this.node != this.lastNode_()) {
    return false;
  }
  // For a reverse iterator, this function will return true if the end offset is
  // > 0 and the iterator is not currently on an end tag OR the end offset = 0
  // and the iterator is currently on a start tag.
  if (this.isReversed_) {
    return this.startOffset_ ? !this.isEndTag() : this.isStartTag();
  }
  // For a forward-iterating iterator, this function will return true if the end
  // offset is 0 or the iterator is not currently on a start tag.
  return !this.endOffset_ || !this.isStartTag();
};

/**
 * Move to the next position in the selection.
 * Throws `goog.iter.StopIteration` when it passes the end of the range.
 * @return {Node} The node at the next position.
 * @override
 */
goog.dom.TextRangeIterator.prototype.next = function() {
  if (this.isLast()) {
    throw goog.iter.StopIteration;
  }

  // Call the super function.
  return goog.dom.TextRangeIterator.superClass_.next.call(this);
};

/**
 * Get the last node the iterator will hit.
 * @return {?Node} The last node the iterator will hit.
 * @private
 */
goog.dom.TextRangeIterator.prototype.lastNode_ = function() {
  return this.isReversed_ ? this.startNode_ : this.endNode_;
};

/** @override */
goog.dom.TextRangeIterator.prototype.skipTag = function() {
  goog.dom.TextRangeIterator.superClass_.skipTag.apply(this);

  // If the node we are skipping contains the end node, we just skipped past
  // the end, so we stop the iteration.
  if (goog.dom.contains(this.node, this.lastNode_())) {
    throw goog.iter.StopIteration;
  }
};


/**
 * @override
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.dom.TextRangeIterator.prototype.copyFrom = function(other) {
  this.startNode_ = other.startNode_;
  this.endNode_ = other.endNode_;
  this.startOffset_ = other.startOffset_;
  this.endOffset_ = other.endOffset_;
  this.isReversed_ = other.isReversed_;

  goog.dom.TextRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {!goog.dom.TextRangeIterator} An identical iterator.
 * @override
 */
goog.dom.TextRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.TextRangeIterator(
      this.startNode_, this.startOffset_, this.endNode_, this.endOffset_,
      this.isReversed_);
  copy.copyFrom(this);
  return copy;
};
