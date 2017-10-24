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
 * @fileoverview A class representing the string literals.
 * @author moz@google.com (Michael Zhou)
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
wgxpath.Literal.prototype.toString = function() {
  return 'Literal: ' + this.text_;
};
