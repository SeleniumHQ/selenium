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
 * @fileoverview An interface for the NodeTest construct.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.NodeTest');



/**
 * The NodeTest interface to represent the NodeTest production
 * in the xpath grammar:
 * http://www.w3.org/TR/xpath-30/#prod-xpath30-NodeTest
 *
 * @interface
 */
wgxpath.NodeTest = function() {};


/**
 * Tests if a node matches the stored characteristics.
 *
 * @param {wgxpath.Node} node The node to be tested.
 * @return {boolean} Whether the node passes the test.
 */
wgxpath.NodeTest.prototype.matches = goog.abstractMethod;


/**
 * Returns the name of the test.
 *
 * @return {string} The name, either nodename or type name.
 */
wgxpath.NodeTest.prototype.getName = goog.abstractMethod;


/**
 * @override
 */
wgxpath.NodeTest.prototype.toString = goog.abstractMethod;
