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
 * @fileoverview A class representing operations on union expressions.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.UnionExpr');

goog.require('goog.array');
goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');
goog.require('wgxpath.NodeSet');



/**
 * Constructor for UnionExpr.
 *
 * @param {!Array.<!wgxpath.Expr>} paths The paths in the union.
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.UnionExpr = function(paths) {
  wgxpath.Expr.call(this, wgxpath.DataType.NODESET);

  /**
   * @type {!Array.<!wgxpath.Expr>}
   * @private
   */
  this.paths_ = paths;
  this.setNeedContextPosition(goog.array.some(this.paths_, function(p) {
    return p.doesNeedContextPosition();
  }));
  this.setNeedContextNode(goog.array.some(this.paths_, function(p) {
    return p.doesNeedContextNode();
  }));
};
goog.inherits(wgxpath.UnionExpr, wgxpath.Expr);


/**
 * @override
 * @return {!wgxpath.NodeSet} The nodeset result.
 */
wgxpath.UnionExpr.prototype.evaluate = function(ctx) {
  var nodeset = new wgxpath.NodeSet();
  goog.array.forEach(this.paths_, function(p) {
    var result = p.evaluate(ctx);
    if (!(result instanceof wgxpath.NodeSet)) {
      throw Error('Path expression must evaluate to NodeSet.');
    }
    nodeset = wgxpath.NodeSet.merge(nodeset, result);
  });
  return nodeset;
};


/**
 * @override
 */
wgxpath.UnionExpr.prototype.toString = function() {
  return goog.array.reduce(this.paths_, function(prev, curr) {
    return prev + wgxpath.Expr.indent(curr);
  }, 'Union Expression:');
};
