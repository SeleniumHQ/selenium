 /**
  * @license
  * The MIT License
  *
  * Copyright (c) 2007 Cybozu Labs, Inc.
  * Copyright (c) 2012 Google Inc.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to
  * deal in the Software without restriction, including without limitation the
  * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  * sell copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  * IN THE SOFTWARE.
  */

/**
 * @fileoverview Context information about nodes in their nodeset.
 * @author evanrthomas@google.com (Evan Thomas)
 */

goog.provide('wgxpath.NodeSet');

goog.require('goog.dom');
goog.require('wgxpath.Node');



/**
 * A set of nodes sorted by their prefix order in the document.
 *
 * @constructor
 */
wgxpath.NodeSet = function() {
  // In violation of standard Closure practice, we initialize properties to
  // immutable constants in the constructor instead of on the prototype,
  // because we have empirically measured better performance by doing so.

  /**
   * A pointer to the first node in the linked list.
   *
   * @private
   * @type {wgxpath.NodeSet.Entry_}
   */
  this.first_ = null;

  /**
   * A pointer to the last node in the linked list.
   *
   * @private
   * @type {wgxpath.NodeSet.Entry_}
   */
  this.last_ = null;

  /**
   * Length of the linked list.
   *
   * @private
   * @type {number}
   */
  this.length_ = 0;
};



/**
 * A entry for a node in a linked list
 *
 * @param {!wgxpath.Node} node The node to be added.
 * @constructor
 * @private
 */
wgxpath.NodeSet.Entry_ = function(node) {
  // In violation of standard Closure practice, we initialize properties to
  // immutable constants in the constructor instead of on the prototype,
  // because we have empirically measured better performance by doing so.

  /**
   * @type {!wgxpath.Node}
   */
  this.node = node;

  /**
   * @type {wgxpath.NodeSet.Entry_}
   */
  this.prev = null;

  /**
   * @type {wgxpath.NodeSet.Entry_}
   */
  this.next = null;
};


/**
 * Merges two nodesets, removing duplicates. This function may modify both
 * nodesets, and will return a reference to one of the two.
 *
 * <p> Note: We assume that the two nodesets are already sorted in DOM order.
 *
 * @param {!wgxpath.NodeSet} a The first nodeset.
 * @param {!wgxpath.NodeSet} b The second nodeset.
 * @return {!wgxpath.NodeSet} The merged nodeset.
 */
wgxpath.NodeSet.merge = function(a, b) {
  if (!a.first_) {
    return b;
  } else if (!b.first_) {
    return a;
  }
  var aCurr = a.first_;
  var bCurr = b.first_;
  var merged = a, tail = null, next = null, length = 0;
  while (aCurr && bCurr) {
    if (wgxpath.Node.equal(aCurr.node, bCurr.node)) {
      next = aCurr;
      aCurr = aCurr.next;
      bCurr = bCurr.next;
    } else {
      var compareResult = goog.dom.compareNodeOrder(
          /** @type {!Node} */ (aCurr.node),
          /** @type {!Node} */ (bCurr.node));
      if (compareResult > 0) {
        next = bCurr;
        bCurr = bCurr.next;
      } else {
        next = aCurr;
        aCurr = aCurr.next;
      }
    }
    next.prev = tail;
    if (tail) {
      tail.next = next;
    } else {
      merged.first_ = next;
    }
    tail = next;
    length++;
  }
  next = aCurr || bCurr;
  while (next) {
    next.prev = tail;
    tail.next = next;
    tail = next;
    length++;
    next = next.next;
  }
  merged.last_ = tail;
  merged.length_ = length;
  return merged;
};


/**
 * Prepends a node to this nodeset.
 *
 * @param {!wgxpath.Node} node The node to be added.
 */
wgxpath.NodeSet.prototype.unshift = function(node) {
  var entry = new wgxpath.NodeSet.Entry_(node);
  entry.next = this.first_;
  if (!this.last_) {
    this.first_ = this.last_ = entry;
  } else {
    this.first_.prev = entry;
  }
  this.first_ = entry;
  this.length_++;
};


/**
 * Adds a node to this nodeset.
 *
 * @param {!wgxpath.Node} node The node to be added.
 */
wgxpath.NodeSet.prototype.add = function(node) {
  var entry = new wgxpath.NodeSet.Entry_(node);
  entry.prev = this.last_;
  if (!this.first_) {
    this.first_ = this.last_ = entry;
  } else {
    this.last_.next = entry;
  }
  this.last_ = entry;
  this.length_++;
};


/**
 * Returns the first node of the nodeset.
 *
 * @return {?wgxpath.Node} The first node of the nodeset
                                     if the nodeset is non-empty;
 *     otherwise null.
 */
wgxpath.NodeSet.prototype.getFirst = function() {
  var first = this.first_;
  if (first) {
    return first.node;
  } else {
    return null;
  }
};


/**
 * Return the length of this nodeset.
 *
 * @return {number} The length of the nodeset.
 */
wgxpath.NodeSet.prototype.getLength = function() {
  return this.length_;
};


/**
 * Returns the string representation of this nodeset.
 *
 * @return {string} The string representation of this nodeset.
 */
wgxpath.NodeSet.prototype.string = function() {
  var node = this.getFirst();
  return node ? wgxpath.Node.getValueAsString(node) : '';
};


/**
 * Returns the number representation of this nodeset.
 *
 * @return {number} The number representation of this nodeset.
 */
wgxpath.NodeSet.prototype.number = function() {
  return +this.string();
};


/**
 * Returns an iterator over this nodeset. Once this iterator is made, DO NOT
 *     add to this nodeset until the iterator is done.
 *
 * @param {boolean=} opt_reverse Whether to iterate right to left or vice versa.
 * @return {!wgxpath.NodeSet.Iterator} An iterator over the nodes.
 */
wgxpath.NodeSet.prototype.iterator = function(opt_reverse) {
  return new wgxpath.NodeSet.Iterator(this, !!opt_reverse);
};



/**
 * An iterator over the nodes of this nodeset.
 *
 * @param {!wgxpath.NodeSet} nodeset The nodeset to be iterated over.
 * @param {boolean} reverse Whether to iterate in ascending or descending
 *     order.
 * @constructor
 */
wgxpath.NodeSet.Iterator = function(nodeset, reverse) {
  // In violation of standard Closure practice, we initialize properties to
  // immutable constants in the constructor instead of on the prototype,
  // because we have empirically measured better performance by doing so.

  /**
   * @type {!wgxpath.NodeSet}
   * @private
   */
  this.nodeset_ = nodeset;

  /**
   * @type {boolean}
   * @private
   */
  this.reverse_ = reverse;

  /**
   * @type {wgxpath.NodeSet.Entry_}
   * @private
   */
  this.current_ = reverse ? nodeset.last_ : nodeset.first_;

  /**
   * @type {wgxpath.NodeSet.Entry_}
   * @private
   */
  this.lastReturned_ = null;
};


/**
 * Returns the next value of the iteration or null if passes the end.
 *
 * @return {?wgxpath.Node} The next node from this iterator.
 */
wgxpath.NodeSet.Iterator.prototype.next = function() {
  var current = this.current_;
  if (current == null) {
    return null;
  } else {
    var lastReturned = this.lastReturned_ = current;
    if (this.reverse_) {
      this.current_ = current.prev;
    } else {
      this.current_ = current.next;
    }
    return lastReturned.node;
  }
};


/**
 * Deletes the last node that was returned from this iterator.
 */
wgxpath.NodeSet.Iterator.prototype.remove = function() {
  var nodeset = this.nodeset_;
  var entry = this.lastReturned_;
  if (!entry) {
    throw Error('Next must be called at least once before remove.');
  }
  var prev = entry.prev;
  var next = entry.next;

  // Modify the pointers of prev and next
  if (prev) {
    prev.next = next;
  } else {
    // If there was no prev node entry must've been first_, so update first_.
    nodeset.first_ = next;
  }
  if (next) {
    next.prev = prev;
  } else {
    // If there was no prev node entry must've been last_, so update last_.
    nodeset.last_ = prev;
  }
  nodeset.length_--;
  this.lastReturned_ = null;
};
