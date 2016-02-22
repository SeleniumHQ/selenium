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
 * @fileoverview A class representing operations on filter expressions.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.FilterExpr');

goog.require('wgxpath.Expr');



/**
 * Constructor for FilterExpr.
 *
 * @param {!wgxpath.Expr} primary The primary expression.
 * @param {!wgxpath.Predicates} predicates The predicates.
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.FilterExpr = function(primary, predicates) {
  if (predicates.getLength() && primary.getDataType() !=
      wgxpath.DataType.NODESET) {
    throw Error('Primary expression must evaluate to nodeset ' +
        'if filter has predicate(s).');
  }
  wgxpath.Expr.call(this, primary.getDataType());

  /**
   * @type {!wgxpath.Expr}
   * @private
   */
  this.primary_ = primary;


  /**
   * @type {!wgxpath.Predicates}
   * @private
   */
  this.predicates_ = predicates;

  this.setNeedContextPosition(primary.doesNeedContextPosition());
  this.setNeedContextNode(primary.doesNeedContextNode());
};
goog.inherits(wgxpath.FilterExpr, wgxpath.Expr);


/**
 * @override
 * @return {!wgxpath.NodeSet} The nodeset result.
 */
wgxpath.FilterExpr.prototype.evaluate = function(ctx) {
  var result = this.primary_.evaluate(ctx);
  return this.predicates_.evaluatePredicates(
      /** @type {!wgxpath.NodeSet} */ (result));
};


/**
 * @override
 */
wgxpath.FilterExpr.prototype.toString = function() {
  var text = 'Filter:';
  text += wgxpath.Expr.indent(this.primary_);
  text += wgxpath.Expr.indent(this.predicates_);
  return text;
};
