// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class representing number literals.
 */

goog.provide('wgxpath.Number');

goog.require('wgxpath.Expr');



/**
 * Constructs a number expression.
 *
 * @param {number} value The number value.
 * @constructor
 * @extends {wgxpath.Expr}
 */
wgxpath.Number = function(value) {
  wgxpath.Expr.call(this, wgxpath.DataType.NUMBER);

  /**
   * @type {number}
   * @private
   */
  this.value_ = value;
};
goog.inherits(wgxpath.Number, wgxpath.Expr);


/**
 * @override
 * @return {number} The number result.
 */
wgxpath.Number.prototype.evaluate = function(ctx) {
  return this.value_;
};


/**
 * @override
 */
wgxpath.Number.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  return indent + 'number: ' + this.value_;
};
