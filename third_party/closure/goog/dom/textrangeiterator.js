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
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.TextRangeIterator');

goog.require('goog.array');
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
 */
goog.dom.TextRangeIterator = function(startNode, startOffset, endNode,
    endOffset, opt_reverse) {
  var goNext;

  if (startNode) {
    this.startNode_ = startNode;
    this.startOffset_ = startOffset;
    this.endNode_ = endNode;
    this.endOffset_ = endOffset;

    // Skip to the offset nodes - being careful to special case BRs since these
    // have no children but still can appear as the startContainer of a range.
    if (startNode.nodeType == goog.dom.NodeType.ELEMENT &&
        startNode.tagName != goog.dom.TagName.BR) {
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

  goog.dom.RangeIterator.call(this, opt_reverse ? this.endNode_ :
      this.startNode_, opt_reverse);

  if (goNext) {
    try {
      this.next()
    } catch (e) {
      if (e != goog.iter.StopIteration) {
        throw e;
      }
    }
  }
};
goog.inherits(goog.dom.TextRangeIterator, goog.dom.RangeIterator);


/**
 * The first node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.TextRangeIterator.prototype.startNode_ = null;


/**
 * The last node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.TextRangeIterator.prototype.endNode_ = null;


/**
 * The offset within the first node in the selection.
 * @type {number}
 * @private
 */
goog.dom.TextRangeIterator.prototype.startOffset_ = 0;


/**
 * The offset within the last node in the selection.
 * @type {number}
 * @private
 */
goog.dom.TextRangeIterator.prototype.endOffset_ = 0;


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getStartTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the start node,
  // return the saved offset.  Otherwise, return 0.
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 :
         this.node == this.startNode_ ? this.startOffset_ : 0;
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getEndTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the end node,
  // return the saved offset.  Otherwise, return the length of the node.
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 :
      this.node == this.endNode_ ? this.endOffset_ : this.node.nodeValue.length;
};


/** @inheritDoc */
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


/** @inheritDoc */
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


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.isLast = function() {
  return this.isStarted() && this.node == this.endNode_ &&
      (!this.endOffset_ || !this.isStartTag());
};


/**
 * Move to the next position in the selection.
 * Throws {@code goog.iter.StopIteration} when it passes the end of the range.
 * @return {Node} The node at the next position.
 */
goog.dom.TextRangeIterator.prototype.next = function() {
  if (this.isLast()) {
    throw goog.iter.StopIteration;
  }

  // Call the super function.
  return goog.dom.TextRangeIterator.superClass_.next.call(this);
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.skipTag = function() {
  goog.dom.TextRangeIterator.superClass_.skipTag.apply(this);

  // If the node we are skipping contains the end node, we just skipped past
  // the end, so we stop the iteration.
  if (goog.dom.contains(this.node, this.endNode_)) {
    throw goog.iter.StopIteration;
  }
};


/**
 * Replace this iterator's values with values from another.
 * @param {goog.dom.TextRangeIterator} other The iterator to copy.
 * @protected
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
 * @return {goog.dom.TextRangeIterator} An identical iterator.
 */
goog.dom.TextRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.TextRangeIterator(this.startNode_,
      this.startOffset_, this.endNode_, this.endOffset_, this.isReversed_);
  copy.copyFrom(this);
  return copy;
};
