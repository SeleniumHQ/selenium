// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class representing the string literals.
 */

goog.provide('wgxpath.Literal');

goog.require('wgxpath.Expr');



/**
 * Constructs a string literal expression.
 *
 * @param {string} text The text value of the literal.
 * @constructor
 * @extends {wgxpath.Expr}
 */
wgxpath.Literal = function(text) {
  wgxpath.Expr.call(this, wgxpath.DataType.STRING);

  /**
   * @type {string}
   * @private
   */
  this.text_ = text.substring(1, text.length - 1);
};
goog.inherits(wgxpath.Literal, wgxpath.Expr);


/**
 * @override
 * @return {string} The string result.
 */
wgxpath.Literal.prototype.evaluate = function(context) {
  return this.text_;
};


/**
 * @override
 */
wgxpath.Literal.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  return indent + 'literal: ' + this.text_;
};
