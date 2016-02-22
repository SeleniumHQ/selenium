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

goog.provide('wgxpath.Context');



/**
 * Provides information for where something is in the DOM.
 *
 * @param {!wgxpath.Node} node A node in the DOM.
 * @param {number=} opt_position The position of this node in its nodeset,
 *     defaults to 1.
 * @param {number=} opt_last Index of the last node in this nodeset,
 *     defaults to 1.
 * @constructor
 */
wgxpath.Context = function(node, opt_position, opt_last) {

  /**
    * @private
    * @type {!wgxpath.Node}
    */
  this.node_ = node;

  /**
   * @private
   * @type {number}
   */
  this.position_ = opt_position || 1;

  /**
   * @private
   * @type {number} opt_last
   */
  this.last_ = opt_last || 1;
};


/**
 * Returns the node for this context object.
 *
 * @return {!wgxpath.Node} The node for this context object.
 */
wgxpath.Context.prototype.getNode = function() {
  return this.node_;
};


/**
 * Returns the position for this context object.
 *
 * @return {number} The position for this context object.
 */
wgxpath.Context.prototype.getPosition = function() {
  return this.position_;
};


/**
 * Returns the last field for this context object.
 *
 * @return {number} The last field for this context object.
 */
wgxpath.Context.prototype.getLast = function() {
  return this.last_;
};
