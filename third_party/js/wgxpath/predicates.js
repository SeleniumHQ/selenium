// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview An abstract class representing expressions with predicates.
 *     baseExprWithPredictes are immutable objects that evaluate their
 *     predicates against nodesets and return the modified nodesets.
 *
 */


goog.provide('wgxpath.Predicates');

goog.require('goog.array');
goog.require('wgxpath.Context');
goog.require('wgxpath.Expr');



/**
 * An abstract class for expressions with predicates.
 *
 * @constructor
 * @param {!Array.<!wgxpath.Expr>} predicates The array of predicates.
 * @param {boolean=} opt_reverse Whether to iterate over the nodeset in reverse.
 */
wgxpath.Predicates = function(predicates, opt_reverse) {

  /**
   * List of predicates
   *
   * @private
   * @type {!Array.<!wgxpath.Expr>}
   */
  this.predicates_ = predicates;


  /**
   * Which direction to iterate over the predicates
   *
   * @private
   * @type {boolean}
   */
  this.reverse_ = !!opt_reverse;
};


/**
 * Evaluates the predicates against the given nodeset.
 *
 * @param {!wgxpath.NodeSet} nodeset The nodes against which to evaluate
 *     the predicates.
 * @param {number=} opt_start The index of the first predicate to evaluate,
 *     defaults to 0.
 * @return {!wgxpath.NodeSet} nodeset The filtered nodeset.
 */
wgxpath.Predicates.prototype.evaluatePredicates =
    function(nodeset, opt_start) {
  for (var i = opt_start || 0; i < this.predicates_.length; i++) {
    var predicate = this.predicates_[i];
    var iter = nodeset.iterator();
    var l = nodeset.getLength();
    var node;
    for (var j = 0; node = iter.next(); j++) {
      var position = this.reverse_ ? (l - j) : (j + 1);
      var exrs = predicate.evaluate(new
          wgxpath.Context(/** @type {wgxpath.Node} */ (node), position, l));
      var keep;
      if (typeof exrs == 'number') {
        keep = (position == exrs);
      } else if (typeof exrs == 'string' || typeof exrs == 'boolean') {
        keep = !!exrs;
      } else if (exrs instanceof wgxpath.NodeSet) {
        keep = (exrs.getLength() > 0);
      } else {
        throw Error('Predicate.evaluate returned an unexpected type.');
      }
      if (!keep) {
        iter.remove();
      }
    }
  }
  return nodeset;
};


/**
 * Returns the quickAttr info.
 *
 * @return {?{name: string, valueExpr: wgxpath.Expr}}
 */
wgxpath.Predicates.prototype.getQuickAttr = function() {
  return this.predicates_.length > 0 ?
      this.predicates_[0].getQuickAttr() : null;
};


/**
 * Returns whether this set of predicates needs context position.
 *
 * @return {boolean} Whether something needs context position.
 */
wgxpath.Predicates.prototype.doesNeedContextPosition = function() {
  for (var i = 0; i < this.predicates_.length; i++) {
    var predicate = this.predicates_[i];
    if (predicate.doesNeedContextPosition() ||
        predicate.getDataType() == wgxpath.DataType.NUMBER ||
        predicate.getDataType() == wgxpath.DataType.VOID) {
      return true;
    }
  }
  return false;
};


/**
 * Returns the length of this set of predicates.
 *
 * @return {number} The number of expressions.
 */
wgxpath.Predicates.prototype.getLength = function() {
  return this.predicates_.length;
};


/**
 * Returns a string represendation of this set of predicates for debugging.
 *
 * @param {string=} opt_indent An optional indentation.
 * @return {string} The string representation.
 */
wgxpath.Predicates.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  var header = indent + 'Predicates:';
  indent += wgxpath.Expr.INDENT;
  return goog.array.reduce(this.predicates_, function(prev, curr) {
    return prev + '\n' + indent + curr.toString(indent);
  }, header);
};
