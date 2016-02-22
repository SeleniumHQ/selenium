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
 * @fileoverview A class representing operations on binary expressions.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.BinaryExpr');

goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');
goog.require('wgxpath.Node');



/**
 * Constructor for BinaryExpr.
 *
 * @param {!wgxpath.BinaryExpr.Op} op A binary operator.
 * @param {!wgxpath.Expr} left The left hand side of the expression.
 * @param {!wgxpath.Expr} right The right hand side of the expression.
 * @extends {wgxpath.Expr}
 * @constructor
 */
wgxpath.BinaryExpr = function(op, left, right) {
  var opCast = /** @type {!wgxpath.BinaryExpr.Op_} */ (op);
  wgxpath.Expr.call(this, opCast.dataType_);

  /**
   * @private
   * @type {!wgxpath.BinaryExpr.Op_}
   */
  this.op_ = opCast;

  /**
   * @private
   * @type {!wgxpath.Expr}
   */
  this.left_ = left;

  /**
   * @private
   * @type {!wgxpath.Expr}
   */
  this.right_ = right;

  this.setNeedContextPosition(left.doesNeedContextPosition() ||
      right.doesNeedContextPosition());
  this.setNeedContextNode(left.doesNeedContextNode() ||
      right.doesNeedContextNode());

  // Optimize [@id="foo"] and [@name="bar"]
  if (this.op_ == wgxpath.BinaryExpr.Op.EQUAL) {
    if (!right.doesNeedContextNode() && !right.doesNeedContextPosition() &&
        right.getDataType() != wgxpath.DataType.NODESET &&
        right.getDataType() != wgxpath.DataType.VOID && left.getQuickAttr()) {
      this.setQuickAttr({
        name: left.getQuickAttr().name,
        valueExpr: right});
    } else if (!left.doesNeedContextNode() && !left.doesNeedContextPosition() &&
        left.getDataType() != wgxpath.DataType.NODESET &&
        left.getDataType() != wgxpath.DataType.VOID && right.getQuickAttr()) {
      this.setQuickAttr({
        name: right.getQuickAttr().name,
        valueExpr: left});
    }
  }
};
goog.inherits(wgxpath.BinaryExpr, wgxpath.Expr);


/**
 * Performs comparison between the left hand side and the right hand side.
 *
 * @private
 * @param {function((string|number|boolean), (string|number|boolean))}
 *        comp A comparison function that takes two parameters.
 * @param {!wgxpath.Expr} lhs The left hand side of the expression.
 * @param {!wgxpath.Expr} rhs The right hand side of the expression.
 * @param {!wgxpath.Context} ctx The context to perform the comparison in.
 * @param {boolean=} opt_equChk Whether the comparison checks for equality.
 * @return {boolean} True if comp returns true, false otherwise.
 */
wgxpath.BinaryExpr.compare_ = function(comp, lhs, rhs, ctx, opt_equChk) {
  var left = lhs.evaluate(ctx);
  var right = rhs.evaluate(ctx);
  var lIter, rIter, lNode, rNode;
  if (left instanceof wgxpath.NodeSet && right instanceof wgxpath.NodeSet) {
    lIter = left.iterator();
    for (lNode = lIter.next(); lNode; lNode = lIter.next()) {
      rIter = right.iterator();
      for (rNode = rIter.next(); rNode; rNode = rIter.next()) {
        if (comp(wgxpath.Node.getValueAsString(lNode),
            wgxpath.Node.getValueAsString(rNode))) {
          return true;
        }
      }
    }
    return false;
  }
  if ((left instanceof wgxpath.NodeSet) ||
      (right instanceof wgxpath.NodeSet)) {
    var nodeset, primitive;
    if ((left instanceof wgxpath.NodeSet)) {
      nodeset = left, primitive = right;
    } else {
      nodeset = right, primitive = left;
    }
    var iter = nodeset.iterator();
    var type = typeof primitive;
    for (var node = iter.next(); node; node = iter.next()) {
      var stringValue;
      switch (type) {
        case 'number':
          stringValue = wgxpath.Node.getValueAsNumber(node);
          break;
        case 'boolean':
          stringValue = wgxpath.Node.getValueAsBool(node);
          break;
        case 'string':
          stringValue = wgxpath.Node.getValueAsString(node);
          break;
        default:
          throw Error('Illegal primitive type for comparison.');
      }
      if (nodeset == left &&
          comp(stringValue,
              /** @type {(string|number|boolean)} */ (primitive))) {
        return true;
      } else if (nodeset == right &&
          comp(/** @type {(string|number|boolean)} */ (primitive),
              stringValue)) {
        return true;
      }
    }
    return false;
  }
  if (opt_equChk) {
    if (typeof left == 'boolean' || typeof right == 'boolean') {
      return comp(!!left, !!right);
    }
    if (typeof left == 'number' || typeof right == 'number') {
      return comp(+left, +right);
    }
    return comp(left, right);
  }
  return comp(+left, +right);
};


/**
 * @override
 * @return {(boolean|number)} The boolean or number result.
 */
wgxpath.BinaryExpr.prototype.evaluate = function(ctx) {
  return this.op_.evaluate_(this.left_, this.right_, ctx);
};


/**
 * @override
 */
wgxpath.BinaryExpr.prototype.toString = function() {
  var text = 'Binary Expression: ' + this.op_;
  text += wgxpath.Expr.indent(this.left_);
  text += wgxpath.Expr.indent(this.right_);
  return text;
};



/**
 * A binary operator.
 *
 * @param {string} opString The operator string.
 * @param {number} precedence The precedence when evaluated.
 * @param {!wgxpath.DataType} dataType The dataType to return when evaluated.
 * @param {function(!wgxpath.Expr, !wgxpath.Expr, !wgxpath.Context)}
 *         evaluate An evaluation function.
 * @constructor
 * @private
 */
wgxpath.BinaryExpr.Op_ = function(opString, precedence, dataType, evaluate) {

  /**
   * @private
   * @type {string}
   */
  this.opString_ = opString;

  /**
   * @private
   * @type {number}
   */
  this.precedence_ = precedence;

  /**
   * @private
   * @type {!wgxpath.DataType}
   */
  this.dataType_ = dataType;

  /**
   * @private
   * @type {function(!wgxpath.Expr, !wgxpath.Expr, !wgxpath.Context)}
   */
  this.evaluate_ = evaluate;
};


/**
 * Returns the precedence for the operator.
 *
 * @return {number} The precedence.
 */
wgxpath.BinaryExpr.Op_.prototype.getPrecedence = function() {
  return this.precedence_;
};


/**
 * @override
 */
wgxpath.BinaryExpr.Op_.prototype.toString = function() {
  return this.opString_;
};


/**
 * A mapping from operator strings to operator objects.
 *
 * @private
 * @type {!Object.<string, !wgxpath.BinaryExpr.Op>}
 */
wgxpath.BinaryExpr.stringToOpMap_ = {};


/**
 * Creates a binary operator.
 *
 * @param {string} opString The operator string.
 * @param {number} precedence The precedence when evaluated.
 * @param {!wgxpath.DataType} dataType The dataType to return when evaluated.
 * @param {function(!wgxpath.Expr, !wgxpath.Expr, !wgxpath.Context)}
 *         evaluate An evaluation function.
 * @return {!wgxpath.BinaryExpr.Op} A binary expression operator.
 * @private
 */
wgxpath.BinaryExpr.createOp_ = function(opString, precedence, dataType,
    evaluate) {
  if (wgxpath.BinaryExpr.stringToOpMap_.hasOwnProperty(opString)) {
    throw new Error('Binary operator already created: ' + opString);
  }
  // The upcast and then downcast for the JSCompiler.
  var op = /** @type {!Object} */ (new wgxpath.BinaryExpr.Op_(
      opString, precedence, dataType, evaluate));
  op = /** @type {!wgxpath.BinaryExpr.Op} */ (op);
  wgxpath.BinaryExpr.stringToOpMap_[op.toString()] = op;
  return op;
};


/**
 * Returns the operator with this opString or null if none.
 *
 * @param {string} opString The opString.
 * @return {!wgxpath.BinaryExpr.Op} The operator.
 */
wgxpath.BinaryExpr.getOp = function(opString) {
  return wgxpath.BinaryExpr.stringToOpMap_[opString] || null;
};


/**
 * Binary operator enumeration.
 *
 * @enum {{getPrecedence: function(): number}}
 */
wgxpath.BinaryExpr.Op = {
  DIV: wgxpath.BinaryExpr.createOp_('div', 6, wgxpath.DataType.NUMBER,
      function(left, right, ctx) {
        return left.asNumber(ctx) / right.asNumber(ctx);
      }),
  MOD: wgxpath.BinaryExpr.createOp_('mod', 6, wgxpath.DataType.NUMBER,
      function(left, right, ctx) {
        return left.asNumber(ctx) % right.asNumber(ctx);
      }),
  MULT: wgxpath.BinaryExpr.createOp_('*', 6, wgxpath.DataType.NUMBER,
      function(left, right, ctx) {
        return left.asNumber(ctx) * right.asNumber(ctx);
      }),
  PLUS: wgxpath.BinaryExpr.createOp_('+', 5, wgxpath.DataType.NUMBER,
      function(left, right, ctx) {
        return left.asNumber(ctx) + right.asNumber(ctx);
      }),
  MINUS: wgxpath.BinaryExpr.createOp_('-', 5, wgxpath.DataType.NUMBER,
      function(left, right, ctx) {
        return left.asNumber(ctx) - right.asNumber(ctx);
      }),
  LESSTHAN: wgxpath.BinaryExpr.createOp_('<', 4, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a < b;},
            left, right, ctx);
      }),
  GREATERTHAN: wgxpath.BinaryExpr.createOp_('>', 4, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a > b;},
            left, right, ctx);
      }),
  LESSTHAN_EQUAL: wgxpath.BinaryExpr.createOp_(
      '<=', 4, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a <= b;},
            left, right, ctx);
      }),
  GREATERTHAN_EQUAL: wgxpath.BinaryExpr.createOp_('>=', 4,
      wgxpath.DataType.BOOLEAN, function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a >= b;},
            left, right, ctx);
      }),
  EQUAL: wgxpath.BinaryExpr.createOp_('=', 3, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a == b;},
            left, right, ctx, true);
      }),
  NOT_EQUAL: wgxpath.BinaryExpr.createOp_('!=', 3, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return wgxpath.BinaryExpr.compare_(function(a, b) {return a != b},
            left, right, ctx, true);
      }),
  AND: wgxpath.BinaryExpr.createOp_('and', 2, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return left.asBool(ctx) && right.asBool(ctx);
      }),
  OR: wgxpath.BinaryExpr.createOp_('or', 1, wgxpath.DataType.BOOLEAN,
      function(left, right, ctx) {
        return left.asBool(ctx) || right.asBool(ctx);
      })
};
