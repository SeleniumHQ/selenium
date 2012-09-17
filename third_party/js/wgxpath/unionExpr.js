// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class representing operations on union expressions.
 */

goog.provide('wgxpath.UnionExpr');

goog.require('goog.array');
goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');



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
      throw Error('PathExpr must evaluate to NodeSet.');
    }
    nodeset = wgxpath.NodeSet.merge(nodeset, result);
  });
  return nodeset;
};


/**
 * @override
 */
wgxpath.UnionExpr.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  var text = indent + 'UnionExpr:' + '\n';
  indent += wgxpath.Expr.INDENT;
  goog.array.forEach(this.paths_, function(p) {
    text += p.toString(indent) + '\n';
  });
  return text.substring(0, text.length); // Remove trailing newline.
};
