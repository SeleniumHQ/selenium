// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class representing operations on filter expressions.
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
wgxpath.FilterExpr.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  var text = indent + 'Filter: ' + '\n';
  indent += wgxpath.Expr.INDENT;
  text += this.primary_.toString(indent);
  text += this.predicates_.toString(indent);
  return text;
};
