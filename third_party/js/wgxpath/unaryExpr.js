// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class representing operations on unary expressions.
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
wgxpath.UnaryExpr.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  var text = indent + 'UnaryExpr: -' + '\n';
  indent += wgxpath.Expr.INDENT;
  text += this.expr_.toString(indent);
  return text;
};
