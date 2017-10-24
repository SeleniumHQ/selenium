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
 * @fileoverview A class representing operations on unary expressions.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.UnaryExpr');

goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');



/**
 * Constructor for UnaryExpr.
 *
 * @param {!wgxpath.Expr} expr The unary expression.
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.UnaryExpr = function(expr) {
  wgxpath.Expr.call(this, wgxpath.DataType.NUMBER);

  /**
   * @private
   * @type {!wgxpath.Expr}
   */
  this.expr_ = expr;

  this.setNeedContextPosition(expr.doesNeedContextPosition());
  this.setNeedContextNode(expr.doesNeedContextNode());
};
goog.inherits(wgxpath.UnaryExpr, wgxpath.Expr);


/**
 * @override
 * @return {number} The number result.
 */
wgxpath.UnaryExpr.prototype.evaluate = function(ctx) {
  return -this.expr_.asNumber(ctx);
};


/**
 * @override
 */
wgxpath.UnaryExpr.prototype.toString = function() {
  return 'Unary Expression: -' + wgxpath.Expr.indent(this.expr_);
};
