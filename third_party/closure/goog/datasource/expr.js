// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * Expression evaluation utilities. Expression format is very similar to XPath.
 *
 * Expression details:
 * - Of format A/B/C, which will evaluate getChildNode('A').getChildNode('B').
 *    getChildNodes('C')|getChildNodeValue('C')|getChildNode('C') depending on
 *    call
 * - If expression ends with '/name()', will get the name() of the node
 *    referenced by the preceding path.
 * - If expression ends with '/count()', will get the count() of the nodes that
 *    match the expression referenced by the preceding path.
 * - If expression ends with '?', the value is OK to evaluate to null. This is
 *    not enforced by the expression evaluation functions, instead it is
 *    provided as a flag for client code which may ignore depending on usage
 * - If expression has [INDEX], will use getChildNodes().getByIndex(INDEX)
 *
 */


goog.provide('goog.ds.Expr');

goog.require('goog.ds.BasicNodeList');
goog.require('goog.ds.EmptyNodeList');
goog.require('goog.string');



/**
 * Create a new expression. An expression uses a string expression language, and
 * from this string and a passed in DataNode can evaluate to a value, DataNode,
 * or a DataNodeList.
 *
 * @param {string=} opt_expr The string expression.
 * @constructor
 * @final
 */
goog.ds.Expr = function(opt_expr) {
  if (opt_expr) {
    this.setSource_(opt_expr);
  }
};


/**
 * Set the source expression text & parse
 *
 * @param {string} expr The string expression source.
 * @param {Array=} opt_parts Array of the parts of an expression.
 * @param {goog.ds.Expr=} opt_childExpr Optional child of this expression,
 *   passed in as a hint for processing.
 * @param {goog.ds.Expr=} opt_prevExpr Optional preceding expression
 *   (i.e. $A/B/C is previous expression to B/C) passed in as a hint for
 *   processing.
 * @private
 */
goog.ds.Expr.prototype.setSource_ = function(
    expr, opt_parts, opt_childExpr, opt_prevExpr) {
  this.src_ = expr;

  if (!opt_childExpr && !opt_prevExpr) {
    // Check whether it can be empty
    if (goog.string.endsWith(expr, goog.ds.Expr.String_.CAN_BE_EMPTY)) {
      this.canBeEmpty_ = true;
      expr = expr.substring(0, expr.length - 1);
    }

    // Check whether this is an node function
    if (goog.string.endsWith(expr, '()')) {
      if (goog.string.endsWith(expr, goog.ds.Expr.String_.NAME_EXPR) ||
          goog.string.endsWith(expr, goog.ds.Expr.String_.COUNT_EXPR) ||
          goog.string.endsWith(expr, goog.ds.Expr.String_.POSITION_EXPR)) {
        var lastPos = expr.lastIndexOf(goog.ds.Expr.String_.SEPARATOR);
        if (lastPos != -1) {
          this.exprFn_ = expr.substring(lastPos + 1);
          expr = expr.substring(0, lastPos);
        } else {
          this.exprFn_ = expr;
          expr = goog.ds.Expr.String_.CURRENT_NODE_EXPR;
        }
        if (this.exprFn_ == goog.ds.Expr.String_.COUNT_EXPR) {
          this.isCount_ = true;
        }
      }
    }
  }

  // Split into component parts
  this.parts_ = opt_parts || expr.split('/');
  this.size_ = this.parts_.length;
  this.last_ = this.parts_[this.size_ - 1];
  this.root_ = this.parts_[0];

  if (this.size_ == 1) {
    this.rootExpr_ = this;
    this.isAbsolute_ = goog.string.startsWith(expr, '$');
  } else {
    this.rootExpr_ = goog.ds.Expr.createInternal_(this.root_, null, this, null);
    this.isAbsolute_ = this.rootExpr_.isAbsolute_;
    this.root_ = this.rootExpr_.root_;
  }

  if (this.size_ == 1 && !this.isAbsolute_) {
    // Check whether expression maps to current node, for convenience
    this.isCurrent_ =
        (expr == goog.ds.Expr.String_.CURRENT_NODE_EXPR ||
         expr == goog.ds.Expr.String_.EMPTY_EXPR);

    // Whether this expression is just an attribute (i.e. '@foo')
    this.isJustAttribute_ =
        goog.string.startsWith(expr, goog.ds.Expr.String_.ATTRIBUTE_START);

    // Check whether this is a common node expression
    this.isAllChildNodes_ = expr == goog.ds.Expr.String_.ALL_CHILD_NODES_EXPR;
    this.isAllAttributes_ = expr == goog.ds.Expr.String_.ALL_ATTRIBUTES_EXPR;
    this.isAllElements_ = expr == goog.ds.Expr.String_.ALL_ELEMENTS_EXPR;
  }
};


/**
 * Get the source data path for the expression
 * @return {string} The path.
 */
goog.ds.Expr.prototype.getSource = function() {
  return this.src_;
};


/**
 * Gets the last part of the expression.
 * @return {?string} Last part of the expression.
 */
goog.ds.Expr.prototype.getLast = function() {
  return this.last_;
};


/**
 * Gets the parent expression of this expression, or null if this is top level
 * @return {goog.ds.Expr} The parent.
 */
goog.ds.Expr.prototype.getParent = function() {
  if (!this.parentExprSet_) {
    if (this.size_ > 1) {
      this.parentExpr_ = goog.ds.Expr.createInternal_(
          null, this.parts_.slice(0, this.parts_.length - 1), this, null);
    }
    this.parentExprSet_ = true;
  }
  return this.parentExpr_;
};


/**
 * Gets the parent expression of this expression, or null if this is top level
 * @return {goog.ds.Expr} The parent.
 */
goog.ds.Expr.prototype.getNext = function() {
  if (!this.nextExprSet_) {
    if (this.size_ > 1) {
      this.nextExpr_ =
          goog.ds.Expr.createInternal_(null, this.parts_.slice(1), null, this);
    }
    this.nextExprSet_ = true;
  }
  return this.nextExpr_;
};


/**
 * Evaluate an expression on a data node, and return a value
 * Recursively walks through child nodes to evaluate
 * TODO(user) Support other expression functions
 *
 * @param {goog.ds.DataNode=} opt_ds Optional datasource to evaluate against.
 *     If not provided, evaluates against DataManager global root.
 * @return {*} Value of the node, or null if doesn't exist.
 */
goog.ds.Expr.prototype.getValue = function(opt_ds) {
  if (opt_ds == null) {
    opt_ds = goog.ds.DataManager.getInstance();
  } else if (this.isAbsolute_) {
    opt_ds = opt_ds.getDataRoot ? opt_ds.getDataRoot() :
                                  goog.ds.DataManager.getInstance();
  }

  if (this.isCount_) {
    var nodes = this.getNodes(opt_ds);
    return nodes.getCount();
  }

  if (this.size_ == 1) {
    return opt_ds.getChildNodeValue(this.root_);
  } else if (this.size_ == 0) {
    return opt_ds.get();
  }

  var nextDs = opt_ds.getChildNode(this.root_);

  if (nextDs == null) {
    return null;
  } else {
    return this.getNext().getValue(nextDs);
  }
};


/**
 * Evaluate an expression on a data node, and return matching nodes
 * Recursively walks through child nodes to evaluate
 *
 * @param {goog.ds.DataNode=} opt_ds Optional datasource to evaluate against.
 *     If not provided, evaluates against data root.
 * @param {boolean=} opt_canCreate If true, will try to create new nodes.
 * @return {goog.ds.DataNodeList} Matching nodes.
 */
goog.ds.Expr.prototype.getNodes = function(opt_ds, opt_canCreate) {
  return /** @type {goog.ds.DataNodeList} */ (
      this.getNodes_(opt_ds, false, opt_canCreate));
};


/**
 * Evaluate an expression on a data node, and return the first matching node
 * Recursively walks through child nodes to evaluate
 *
 * @param {goog.ds.DataNode=} opt_ds Optional datasource to evaluate against.
 *     If not provided, evaluates against DataManager global root.
 * @param {boolean=} opt_canCreate If true, will try to create new nodes.
 * @return {goog.ds.DataNode} Matching nodes, or null if doesn't exist.
 */
goog.ds.Expr.prototype.getNode = function(opt_ds, opt_canCreate) {
  return /** @type {goog.ds.DataNode} */ (
      this.getNodes_(opt_ds, true, opt_canCreate));
};


/**
 * Evaluate an expression on a data node, and return the first matching node
 * Recursively walks through child nodes to evaluate
 *
 * @param {goog.ds.DataNode=} opt_ds Optional datasource to evaluate against.
 *     If not provided, evaluates against DataManager global root.
 * @param {boolean=} opt_selectOne Whether to return single matching DataNode
 *     or matching nodes in DataNodeList.
 * @param {boolean=} opt_canCreate If true, will try to create new nodes.
 * @return {goog.ds.DataNode|goog.ds.DataNodeList} Matching node or nodes,
 *     depending on value of opt_selectOne.
 * @private
 */
goog.ds.Expr.prototype.getNodes_ = function(
    opt_ds, opt_selectOne, opt_canCreate) {
  if (opt_ds == null) {
    opt_ds = goog.ds.DataManager.getInstance();
  } else if (this.isAbsolute_) {
    opt_ds = opt_ds.getDataRoot ? opt_ds.getDataRoot() :
                                  goog.ds.DataManager.getInstance();
  }

  if (this.size_ == 0 && opt_selectOne) {
    return opt_ds;
  } else if (this.size_ == 0 && !opt_selectOne) {
    return new goog.ds.BasicNodeList([opt_ds]);
  } else if (this.size_ == 1) {
    if (opt_selectOne) {
      return opt_ds.getChildNode(this.root_, opt_canCreate);
    } else {
      var possibleListChild = opt_ds.getChildNode(this.root_);
      if (possibleListChild && possibleListChild.isList()) {
        return possibleListChild.getChildNodes();
      } else {
        return opt_ds.getChildNodes(this.root_);
      }
    }
  } else {
    var nextDs = opt_ds.getChildNode(this.root_, opt_canCreate);
    if (nextDs == null && opt_selectOne) {
      return null;
    } else if (nextDs == null && !opt_selectOne) {
      return new goog.ds.EmptyNodeList();
    }
    return this.getNext().getNodes_(nextDs, opt_selectOne, opt_canCreate);
  }
};


/**
 * Whether the expression can be null.
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.canBeEmpty_ = false;


/**
 * The parsed paths in the expression
 *
 * @type {Array<string>}
 * @private
 */
goog.ds.Expr.prototype.parts_ = [];


/**
 * Number of paths in the expression
 *
 * @type {?number}
 * @private
 */
goog.ds.Expr.prototype.size_ = null;


/**
 * The root node path in the expression
 *
 * @type {string}
 * @private
 */
goog.ds.Expr.prototype.root_;


/**
 * The last path in the expression
 *
 * @type {?string}
 * @private
 */
goog.ds.Expr.prototype.last_ = null;


/**
 * Whether the expression evaluates to current node
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.isCurrent_ = false;


/**
 * Whether the expression is just an attribute
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.isJustAttribute_ = false;


/**
 * Does this expression select all DOM-style child nodes (element and text)
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.isAllChildNodes_ = false;


/**
 * Does this expression select all DOM-style attribute nodes (starts with '@')
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.isAllAttributes_ = false;


/**
 * Does this expression select all DOM-style element child nodes
 *
 * @type {boolean}
 * @private
 */
goog.ds.Expr.prototype.isAllElements_ = false;


/**
 * The function used by this expression
 *
 * @type {?string}
 * @private
 */
goog.ds.Expr.prototype.exprFn_ = null;


/**
 * Cached value for the parent expression.
 * @type {goog.ds.Expr?}
 * @private
 */
goog.ds.Expr.prototype.parentExpr_ = null;


/**
 * Cached value for the next expression.
 * @type {goog.ds.Expr?}
 * @private
 */
goog.ds.Expr.prototype.nextExpr_ = null;


/**
 * Create an expression from a string, can use cached values
 *
 * @param {string} expr The expression string.
 * @return {goog.ds.Expr} The expression object.
 */
goog.ds.Expr.create = function(expr) {
  var result = goog.ds.Expr.cache_[expr];

  if (result == null) {
    result = new goog.ds.Expr(expr);
    goog.ds.Expr.cache_[expr] = result;
  }
  return result;
};


/**
 * Create an expression from a string, can use cached values
 * Uses hints from related expressions to help in creation
 *
 * @param {?string=} opt_expr The string expression source.
 * @param {Array=} opt_parts Array of the parts of an expression.
 * @param {goog.ds.Expr=} opt_childExpr Optional child of this expression,
 *   passed in as a hint for processing.
 * @param {goog.ds.Expr=} opt_prevExpr Optional preceding expression
 *   (i.e. $A/B/C is previous expression to B/C) passed in as a hint for
 *   processing.
 * @return {goog.ds.Expr} The expression object.
 * @private
 */
goog.ds.Expr.createInternal_ = function(
    opt_expr, opt_parts, opt_childExpr, opt_prevExpr) {
  var expr = opt_expr || opt_parts.join('/');
  var result = goog.ds.Expr.cache_[expr];

  if (result == null) {
    result = new goog.ds.Expr();
    result.setSource_(expr, opt_parts, opt_childExpr, opt_prevExpr);
    goog.ds.Expr.cache_[expr] = result;
  }
  return result;
};


/**
 * Cache of pre-parsed expressions
 * @private
 */
goog.ds.Expr.cache_ = {};


/**
 * Commonly used strings in expressions.
 * @enum {string}
 * @private
 */
goog.ds.Expr.String_ = {
  SEPARATOR: '/',
  CURRENT_NODE_EXPR: '.',
  EMPTY_EXPR: '',
  ATTRIBUTE_START: '@',
  ALL_CHILD_NODES_EXPR: '*|text()',
  ALL_ATTRIBUTES_EXPR: '@*',
  ALL_ELEMENTS_EXPR: '*',
  NAME_EXPR: 'name()',
  COUNT_EXPR: 'count()',
  POSITION_EXPR: 'position()',
  INDEX_START: '[',
  INDEX_END: ']',
  CAN_BE_EMPTY: '?'
};


/**
 * Standard expressions
 */


/**
 * The current node
 */
goog.ds.Expr.CURRENT =
    goog.ds.Expr.create(goog.ds.Expr.String_.CURRENT_NODE_EXPR);


/**
 * For DOM interop - all DOM child nodes (text + element).
 * Text nodes have dataName #text
 */
goog.ds.Expr.ALL_CHILD_NODES =
    goog.ds.Expr.create(goog.ds.Expr.String_.ALL_CHILD_NODES_EXPR);


/**
 * For DOM interop - all DOM element child nodes
 */
goog.ds.Expr.ALL_ELEMENTS =
    goog.ds.Expr.create(goog.ds.Expr.String_.ALL_ELEMENTS_EXPR);


/**
 * For DOM interop - all DOM attribute nodes
 * Attribute nodes have dataName starting with "@"
 */
goog.ds.Expr.ALL_ATTRIBUTES =
    goog.ds.Expr.create(goog.ds.Expr.String_.ALL_ATTRIBUTES_EXPR);


/**
 * Get the dataName of a node
 */
goog.ds.Expr.NAME = goog.ds.Expr.create(goog.ds.Expr.String_.NAME_EXPR);


/**
 * Get the count of nodes matching an expression
 */
goog.ds.Expr.COUNT = goog.ds.Expr.create(goog.ds.Expr.String_.COUNT_EXPR);


/**
 * Get the position of the "current" node in the current node list
 * This will only apply for datasources that support the concept of a current
 * node (none exist yet). This is similar to XPath position() and concept of
 * current node
 */
goog.ds.Expr.POSITION = goog.ds.Expr.create(goog.ds.Expr.String_.POSITION_EXPR);
