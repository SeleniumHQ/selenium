// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview An class representing operations on path expressions.
 */

goog.provide('wgxpath.PathExpr');


goog.require('goog.array');
goog.require('goog.dom.NodeType');
goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');
goog.require('wgxpath.NodeSet');



/**
 * Constructor for PathExpr.
 *
 * @param {!wgxpath.Expr} filter A filter expression.
 * @param {!Array.<!wgxpath.Step>} steps The steps in the location path.
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.PathExpr = function(filter, steps) {
  wgxpath.Expr.call(this, filter.getDataType());

  /**
   * @type {!wgxpath.Expr}
   * @private
   */
  this.filter_ = filter;

  /**
   * @type {!Array.<!wgxpath.Step>}
   * @private
   */
  this.steps_ = steps;

  this.setNeedContextPosition(filter.doesNeedContextPosition());
  this.setNeedContextNode(filter.doesNeedContextNode());
  if (this.steps_.length == 1) {
    var firstStep = this.steps_[0];
    if (!firstStep.doesIncludeDescendants() &&
        firstStep.getAxis() == wgxpath.Step.Axis.ATTRIBUTE) {
      var test = firstStep.getTest();
      if (test.getName() != '*') {
        this.setQuickAttr({
          name: test.getName(),
          valueExpr: null
        });
      }
    }
  }
};
goog.inherits(wgxpath.PathExpr, wgxpath.Expr);



/**
 * Constructor for RootHelperExpr.
 *
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.PathExpr.RootHelperExpr = function() {
  wgxpath.Expr.call(this, wgxpath.DataType.NODESET);
};
goog.inherits(wgxpath.PathExpr.RootHelperExpr, wgxpath.Expr);


/**
 * Evaluates the root-node helper expression.
 *
 * @param {!wgxpath.Context} ctx The context to evaluate the expression in.
 * @return {!wgxpath.NodeSet} The evaluation result.
 */
wgxpath.PathExpr.RootHelperExpr.prototype.evaluate = function(ctx) {
  var nodeset = new wgxpath.NodeSet();
  var node = ctx.getNode();
  if (node.nodeType == goog.dom.NodeType.DOCUMENT) {
    nodeset.add(node);
  } else {
    nodeset.add(/** @type {!Node} */ (node.ownerDocument));
  }
  return nodeset;
};


/**
 * @override
 */
wgxpath.PathExpr.RootHelperExpr.prototype.toString = function() {
  return 'Root Helper Expression';
};



/**
 * Constructor for ContextHelperExpr.
 *
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.PathExpr.ContextHelperExpr = function() {
  wgxpath.Expr.call(this, wgxpath.DataType.NODESET);
};
goog.inherits(wgxpath.PathExpr.ContextHelperExpr, wgxpath.Expr);


/**
 * Evaluates the context-node helper expression.
 *
 * @param {!wgxpath.Context} ctx The context to evaluate the expression in.
 * @return {!wgxpath.NodeSet} The evaluation result.
 */
wgxpath.PathExpr.ContextHelperExpr.prototype.evaluate = function(ctx) {
  var nodeset = new wgxpath.NodeSet();
  nodeset.add(ctx.getNode());
  return nodeset;
};


/**
 * @override
 */
wgxpath.PathExpr.ContextHelperExpr.prototype.toString = function() {
  return 'Context Helper Expression';
};


/**
 * Returns whether the token is a valid PathExpr operator.
 *
 * @param {string} token The token to be checked.
 * @return {boolean} Whether the token is a valid operator.
 */
wgxpath.PathExpr.isValidOp = function(token) {
  return token == '/' || token == '//';
};


/**
 * @override
 * @return {!wgxpath.NodeSet} The nodeset result.
 */
wgxpath.PathExpr.prototype.evaluate = function(ctx) {
  var nodeset = this.filter_.evaluate(ctx);
  if (!(nodeset instanceof wgxpath.NodeSet)) {
    throw Error('Filter expression must evaluate to nodeset.');
  }
  var steps = this.steps_;
  for (var i = 0, l0 = steps.length; i < l0 && nodeset.getLength(); i++) {
    var step = steps[i];
    var reverse = step.getAxis().isReverse();
    var iter = nodeset.iterator(reverse);
    nodeset = null;
    var node, next;
    if (!step.doesNeedContextPosition() &&
        step.getAxis() == wgxpath.Step.Axis.FOLLOWING) {
      for (node = iter.next(); next = iter.next(); node = next) {
        if (node.contains && !node.contains(next)) {
          break;
        } else {
          if (!(next.compareDocumentPosition(/** @type {!Node} */ (node)) &
              8)) {
            break;
          }
        }
      }
      nodeset = step.evaluate(new
          wgxpath.Context(/** @type {wgxpath.Node} */ (node)));
    } else if (!step.doesNeedContextPosition() &&
        step.getAxis() == wgxpath.Step.Axis.PRECEDING) {
      node = iter.next();
      nodeset = step.evaluate(new
          wgxpath.Context(/** @type {wgxpath.Node} */ (node)));
    } else {
      node = iter.next();
      nodeset = step.evaluate(new
          wgxpath.Context(/** @type {wgxpath.Node} */ (node)));
      while ((node = iter.next()) != null) {
        var result = step.evaluate(new
            wgxpath.Context(/** @type {wgxpath.Node} */ (node)));
        nodeset = wgxpath.NodeSet.merge(nodeset, result);
      }
    }
  }
  return /** @type {!wgxpath.NodeSet} */ (nodeset);
};


/**
 * @override
 */
wgxpath.PathExpr.prototype.toString = function() {
  var text = 'Path Expression:';
  text += wgxpath.Expr.indent(this.filter_);
  if (this.steps_.length) {
    var steps = goog.array.reduce(this.steps_, function(prev, curr) {
      return prev + wgxpath.Expr.indent(curr);
    }, 'Steps:');
    text += wgxpath.Expr.indent(steps);
  }
  return text;
};
