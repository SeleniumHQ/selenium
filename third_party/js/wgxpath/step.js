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
 * @fileoverview A step expression.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.Step');

goog.require('goog.array');
goog.require('goog.dom.NodeType');
goog.require('wgxpath.DataType');
goog.require('wgxpath.Expr');
goog.require('wgxpath.KindTest');
goog.require('wgxpath.Node');
goog.require('wgxpath.NodeSet');
goog.require('wgxpath.Predicates');
goog.require('wgxpath.userAgent');



/**
 * Class for a step in a path expression
 * http://www.w3.org/TR/xpath20/#id-steps.
 *
 * @extends {wgxpath.Expr}
 * @constructor
 * @param {!wgxpath.Step.Axis} axis The axis for this Step.
 * @param {!wgxpath.NodeTest} test The test for this Step.
 * @param {!wgxpath.Predicates=} opt_predicates The predicates for this
 *     Step.
 * @param {boolean=} opt_descendants Whether descendants are to be included in
 *     this step ('//' vs '/').
 */
wgxpath.Step = function(axis, test, opt_predicates, opt_descendants) {
  var axisCast = /** @type {!wgxpath.Step.Axis_} */ (axis);
  wgxpath.Expr.call(this, wgxpath.DataType.NODESET);

  /**
   * @type {!wgxpath.Step.Axis_}
   * @private
   */
  this.axis_ = axisCast;


  /**
   * @type {!wgxpath.NodeTest}
   * @private
   */
  this.test_ = test;

  /**
   * @type {!wgxpath.Predicates}
   * @private
   */
  this.predicates_ = opt_predicates || new wgxpath.Predicates([]);


  /**
   * Whether decendants are included in this step
   *
   * @private
   * @type {boolean}
   */
  this.descendants_ = !!opt_descendants;

  var quickAttrInfo = this.predicates_.getQuickAttr();
  if (axis.supportsQuickAttr_ && quickAttrInfo) {
    var attrName = quickAttrInfo.name;
    attrName = wgxpath.userAgent.IE_DOC_PRE_9 ?
        attrName.toLowerCase() : attrName;
    var attrValueExpr = quickAttrInfo.valueExpr;
    this.setQuickAttr({
      name: attrName,
      valueExpr: attrValueExpr
    });
  }
  this.setNeedContextPosition(this.predicates_.doesNeedContextPosition());
};
goog.inherits(wgxpath.Step, wgxpath.Expr);


/**
 * @override
 * @return {!wgxpath.NodeSet} The nodeset result.
 */
wgxpath.Step.prototype.evaluate = function(ctx) {
  var node = ctx.getNode();
  var nodeset = null;
  var quickAttr = this.getQuickAttr();
  var attrName = null;
  var attrValue = null;
  var pstart = 0;
  if (quickAttr) {
    attrName = quickAttr.name;
    attrValue = quickAttr.valueExpr ?
        quickAttr.valueExpr.asString(ctx) : null;
    pstart = 1;
  }
  if (this.descendants_) {
    if (!this.doesNeedContextPosition() &&
        this.axis_ == wgxpath.Step.Axis.CHILD) {
      nodeset = wgxpath.Node.getDescendantNodes(this.test_, node,
          attrName, attrValue);
      nodeset = this.predicates_.evaluatePredicates(nodeset, pstart);
    } else {
      var step = new wgxpath.Step(wgxpath.Step.Axis.DESCENDANT_OR_SELF,
          new wgxpath.KindTest('node'));
      var iter = step.evaluate(ctx).iterator();
      var n = iter.next();
      if (!n) {
        nodeset = new wgxpath.NodeSet();
      } else {
        nodeset = this.evaluate_(/** @type {!wgxpath.Node} */ (n),
            attrName, attrValue, pstart);
        while ((n = iter.next()) != null) {
          nodeset = wgxpath.NodeSet.merge(nodeset,
              this.evaluate_(/** @type {!wgxpath.Node} */ (n), attrName,
              attrValue, pstart));
        }
      }
    }
  } else {
    nodeset = this.evaluate_(ctx.getNode(), attrName, attrValue, pstart);
  }
  return nodeset;
};


/**
 * Evaluates this step on the given context to a nodeset.
 *     (assumes this.descendants_ = false)
 *
 * @private
 * @param {!wgxpath.Node} node The context node.
 * @param {?string} attrName The name of the attribute.
 * @param {?string} attrValue The value of the attribute.
 * @param {number} pstart The first predicate to evaluate.
 * @return {!wgxpath.NodeSet} The nodeset from evaluating this Step.
 */
wgxpath.Step.prototype.evaluate_ = function(
    node, attrName, attrValue, pstart) {
  var nodeset = this.axis_.func_(this.test_, node, attrName, attrValue);
  nodeset = this.predicates_.evaluatePredicates(nodeset, pstart);
  return nodeset;
};


/**
 * Returns whether the step evaluation should include descendants.
 *
 * @return {boolean} Whether descendants are included.
 */
wgxpath.Step.prototype.doesIncludeDescendants = function() {
  return this.descendants_;
};


/**
 * Returns the step's axis.
 *
 * @return {!wgxpath.Step.Axis} The axis.
 */
wgxpath.Step.prototype.getAxis = function() {
  return /** @type {!wgxpath.Step.Axis} */ (this.axis_);
};


/**
 * Returns the test for this step.
 *
 * @return {!wgxpath.NodeTest} The test for this step.
 */
wgxpath.Step.prototype.getTest = function() {
  return this.test_;
};


/**
 * @override
 */
wgxpath.Step.prototype.toString = function() {
  var text = 'Step:';
  text += wgxpath.Expr.indent('Operator: ' + (this.descendants_ ? '//' : '/'));
  if (this.axis_.name_) {
    text += wgxpath.Expr.indent('Axis: ' + this.axis_);
  }
  text += wgxpath.Expr.indent(this.test_);
  if (this.predicates_.getLength()) {
    var predicates = goog.array.reduce(this.predicates_.getPredicates(),
        function(prev, curr) {
          return prev + wgxpath.Expr.indent(curr);
        }, 'Predicates:');
    text += wgxpath.Expr.indent(predicates);
  }
  return text;
};



/**
 * A step axis.
 *
 * @constructor
 * @param {string} name The axis name.
 * @param {function(!wgxpath.NodeTest, wgxpath.Node, ?string, ?string):
 *     !wgxpath.NodeSet} func The function for this axis.
 * @param {boolean} reverse Whether to iterate over the nodeset in reverse.
 * @param {boolean} supportsQuickAttr Whether quickAttr should be enabled for
 *     this axis.
 * @private
 */
wgxpath.Step.Axis_ = function(name, func, reverse, supportsQuickAttr) {

  /**
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * @private
   * @type {function(!wgxpath.NodeTest, wgxpath.Node, ?string, ?string):
   *     !wgxpath.NodeSet}
   */
  this.func_ = func;

  /**
   * @private
   * @type {boolean}
   */
  this.reverse_ = reverse;

  /**
   * @private
   * @type {boolean}
   */
  this.supportsQuickAttr_ = supportsQuickAttr;
};


/**
 * Returns whether the nodes in the step should be iterated over in reverse.
 *
 * @return {boolean} Whether the nodes should be iterated over in reverse.
 */
wgxpath.Step.Axis_.prototype.isReverse = function() {
  return this.reverse_;
};


/**
 * @override
 */
wgxpath.Step.Axis_.prototype.toString = function() {
  return this.name_;
};


/**
 * A map from axis name to Axis.
 *
 * @type {!Object.<string, !wgxpath.Step.Axis>}
 * @private
 */
wgxpath.Step.nameToAxisMap_ = {};


/**
 * Creates an axis and maps the axis's name to that axis.
 *
 * @param {string} name The axis name.
 * @param {function(!wgxpath.NodeTest, wgxpath.Node, ?string, ?string):
 *     !wgxpath.NodeSet} func The function for this axis.
 * @param {boolean} reverse Whether to iterate over nodesets in reverse.
 * @param {boolean=} opt_supportsQuickAttr Whether quickAttr can be enabled
 *     for this axis.
 * @return {!wgxpath.Step.Axis} The axis.
 * @private
 */
wgxpath.Step.createAxis_ =
    function(name, func, reverse, opt_supportsQuickAttr) {
  if (wgxpath.Step.nameToAxisMap_.hasOwnProperty(name)) {
    throw Error('Axis already created: ' + name);
  }
  // The upcast and then downcast for the JSCompiler.
  var axis = /** @type {!Object} */ (new wgxpath.Step.Axis_(
      name, func, reverse, !!opt_supportsQuickAttr));
  axis = /** @type {!wgxpath.Step.Axis} */ (axis);
  wgxpath.Step.nameToAxisMap_[name] = axis;
  return axis;
};


/**
 * Returns the axis for this axisname or null if none.
 *
 * @param {string} name The axis name.
 * @return {wgxpath.Step.Axis} The axis.
 */
wgxpath.Step.getAxis = function(name) {
  return wgxpath.Step.nameToAxisMap_[name] || null;
};


/**
 * Axis enumeration.
 *
 * @enum {{isReverse: function(): boolean}}
 */
wgxpath.Step.Axis = {
  ANCESTOR: wgxpath.Step.createAxis_('ancestor',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        var parent = node;
        while (parent = parent.parentNode) {
          if (test.matches(parent)) {
            nodeset.unshift(parent);
          }
        }
        return nodeset;
      }, true),
  ANCESTOR_OR_SELF: wgxpath.Step.createAxis_('ancestor-or-self',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        var toMatch = node;
        do {
          if (test.matches(toMatch)) {
            nodeset.unshift(toMatch);
          }
        } while (toMatch = toMatch.parentNode);
        return nodeset;
      }, true),
  ATTRIBUTE: wgxpath.Step.createAxis_('attribute',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        var testName = test.getName();
        // IE8 doesn't allow access to the style attribute using getNamedItem.
        // It returns an object with nodeValue = null. Even worse, ".style" on
        // IE8 can mutate the DOM, adding an empty string attribute. Therefore
        // we check it last.
        if (testName == 'style' &&
            wgxpath.userAgent.IE_DOC_PRE_9 && node.style) {
          nodeset.add(wgxpath.IEAttrWrapper.forStyleOf(
              /** @type {!Node} */ (node), node.sourceIndex));
          return nodeset;
        }
        var attrs = node.attributes;
        if (attrs) {
          if ((test instanceof wgxpath.KindTest &&
              goog.isNull(test.getType())) || testName == '*') {
            var sourceIndex = node.sourceIndex;
            for (var i = 0, attr; attr = attrs[i]; i++) {
              if (wgxpath.userAgent.IE_DOC_PRE_9) {
                if (attr.nodeValue) {
                  nodeset.add(wgxpath.IEAttrWrapper.forAttrOf(
                      /** @type {!Node} */ (node), attr, sourceIndex));
                }
              } else {
                nodeset.add(attr);
              }
            }
          } else {
            var attr = attrs.getNamedItem(testName);
            if (attr) {
              if (wgxpath.userAgent.IE_DOC_PRE_9) {
                if (attr.nodeValue) {
                  nodeset.add(wgxpath.IEAttrWrapper.forAttrOf(
                      /** @type {!Node} */ (node), attr, node.sourceIndex));
                }
              } else {
                nodeset.add(attr);
              }
            }
          }
        }
        return nodeset;
      }, false),
  CHILD: wgxpath.Step.createAxis_('child',
      wgxpath.Node.getChildNodes, false, true),
  DESCENDANT: wgxpath.Step.createAxis_('descendant',
      wgxpath.Node.getDescendantNodes, false, true),
  DESCENDANT_OR_SELF: wgxpath.Step.createAxis_('descendant-or-self',
      function(test, node, attrName, attrValue) {
        var nodeset = new wgxpath.NodeSet();
        if (wgxpath.Node.attrMatches(node, attrName, attrValue)) {
          if (test.matches(node)) {
            nodeset.add(node);
          }
        }
        return wgxpath.Node.getDescendantNodes(test, node,
            attrName, attrValue, nodeset);
      }, false, true),
  FOLLOWING: wgxpath.Step.createAxis_('following',
      function(test, node, attrName, attrValue) {
        var nodeset = new wgxpath.NodeSet();
        var parent = node;
        do {
          var child = parent;
          while (child = child.nextSibling) {
            if (wgxpath.Node.attrMatches(child, attrName, attrValue)) {
              if (test.matches(child)) {
                nodeset.add(child);
              }
            }
            nodeset = wgxpath.Node.getDescendantNodes(test, child,
                attrName, attrValue, nodeset);
          }
        } while (parent = parent.parentNode);
        return nodeset;
      }, false, true),
  FOLLOWING_SIBLING: wgxpath.Step.createAxis_('following-sibling',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        var toMatch = node;
        while (toMatch = toMatch.nextSibling) {
          if (test.matches(toMatch)) {
            nodeset.add(toMatch);
          }
        }
        return nodeset;
      }, false),
  NAMESPACE: wgxpath.Step.createAxis_('namespace',
      function(test, node) {
        // not implemented
        return new wgxpath.NodeSet();
      }, false),
  PARENT: wgxpath.Step.createAxis_('parent',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        if (node.nodeType == goog.dom.NodeType.DOCUMENT) {
          return nodeset;
        } else if (node.nodeType == goog.dom.NodeType.ATTRIBUTE) {
          nodeset.add(node.ownerElement);
          return nodeset;
        }
        var parent = /** @type {!Node} */ (node.parentNode);
        if (test.matches(parent)) {
          nodeset.add(parent);
        }
        return nodeset;
      }, false),
  PRECEDING: wgxpath.Step.createAxis_('preceding',
      function(test, node, attrName, attrValue) {
        var nodeset = new wgxpath.NodeSet();
        var parents = [];
        var parent = node;
        do {
          parents.unshift(parent);
        } while (parent = parent.parentNode);
        for (var i = 1, l0 = parents.length; i < l0; i++) {
          var siblings = [];
          node = parents[i];
          while (node = node.previousSibling) {
            siblings.unshift(node);
          }
          for (var j = 0, l1 = siblings.length; j < l1; j++) {
            node = siblings[j];
            if (wgxpath.Node.attrMatches(node, attrName, attrValue)) {
              if (test.matches(node)) nodeset.add(node);
            }
            nodeset = wgxpath.Node.getDescendantNodes(test, node,
                attrName, attrValue, nodeset);
          }
        }
        return nodeset;
      }, true, true),
  PRECEDING_SIBLING: wgxpath.Step.createAxis_('preceding-sibling',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        var toMatch = node;
        while (toMatch = toMatch.previousSibling) {
          if (test.matches(toMatch)) {
            nodeset.unshift(toMatch);
          }
        }
        return nodeset;
      }, true),
  SELF: wgxpath.Step.createAxis_('self',
      function(test, node) {
        var nodeset = new wgxpath.NodeSet();
        if (test.matches(node)) {
          nodeset.add(node);
        }
        return nodeset;
      }, false)
};
