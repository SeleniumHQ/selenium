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
 * @fileoverview A class representing number literals.
 * @author moz@google.com (Michael Zhou)
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
wgxpath.Number.prototype.toString = function() {
  return 'Number: ' + this.value_;
};
