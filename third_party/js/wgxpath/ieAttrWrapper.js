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
 * @fileoverview Wrapper classes for attribute nodes in old IE browsers.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.IEAttrWrapper');

goog.require('goog.dom.NodeType');
goog.require('wgxpath.userAgent');



/**
 * A wrapper for an attribute node in old IE.
 *
 * <p> Note: Although sourceIndex is equal to node.sourceIndex, it is
 * denormalized into a separate parameter for performance, so that clients
 * constructing multiple IEAttrWrappers can pass in the same sourceIndex
 * rather than re-querying it each time.
 *
 * @constructor
 * @extends {Attr}
 * @param {!Node} node The attribute node.
 * @param {!Node} parent The parent of the attribute node.
 * @param {string} nodeName The name of the attribute node.
 * @param {(string|number|boolean)} nodeValue The value of the attribute node.
 * @param {number} sourceIndex The source index of the parent node.
 */
wgxpath.IEAttrWrapper = function(node, parent, nodeName, nodeValue,
    sourceIndex) {
  /**
   * @type {!Node}
   * @private
   */
  this.node_ = node;

  /**
   * @type {string}
   */
  this.nodeName = nodeName;

  /**
   * @type {(string|number|boolean)}
   */
  this.nodeValue = nodeValue;

  /**
   * @type {goog.dom.NodeType}
   */
  this.nodeType = goog.dom.NodeType.ATTRIBUTE;

  /**
   * @type {!Node}
   */
  this.ownerElement = parent;

  /**
   * @type {number}
   * @private
   */
  this.parentSourceIndex_ = sourceIndex;

  /**
   * @type {!Node}
   */
  this.parentNode = parent;
};


/**
 * Creates a wrapper for an attribute node in old IE.
 *
 * @param {!Node} parent The parent of the attribute node.
 * @param {!Node} attr The attribute node.
 * @param {number} sourceIndex The source index of the parent node.
 * @return {!wgxpath.IEAttrWrapper} The constcuted wrapper.
 */
wgxpath.IEAttrWrapper.forAttrOf = function(parent, attr, sourceIndex) {
  var nodeValue = (wgxpath.userAgent.IE_DOC_PRE_8 && attr.nodeName == 'href') ?
      parent.getAttribute(attr.nodeName, 2) : attr.nodeValue;
  return new wgxpath.IEAttrWrapper(attr, parent, attr.nodeName, nodeValue,
      sourceIndex);
};


/**
 * Creates a wrapper for a style attribute node in old IE.
 *
 * @param {!Node} parent The parent of the attribute node.
 * @param {number} sourceIndex The source index of the parent node.
 * @return {!wgxpath.IEAttrWrapper} The constcuted wrapper.
 */
wgxpath.IEAttrWrapper.forStyleOf = function(parent, sourceIndex) {
  return new wgxpath.IEAttrWrapper(parent.style, parent, 'style',
      parent.style.cssText, sourceIndex);
};


/**
 * Returns the source index of the parent of the attribute node.
 *
 * @return {number} The source index of the parent.
 */
wgxpath.IEAttrWrapper.prototype.getParentSourceIndex = function() {
  return this.parentSourceIndex_;
};


/**
 * Returns the attribute node contained in the wrapper.
 *
 * @return {!Node} The original attribute node.
 */
wgxpath.IEAttrWrapper.prototype.getNode = function() {
  return this.node_;
};
