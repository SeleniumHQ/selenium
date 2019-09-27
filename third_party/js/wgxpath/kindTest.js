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
 * @fileoverview A class implementing the xpath 1.0 subset of the
 *               KindTest construct.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.KindTest');

goog.require('goog.dom.NodeType');
goog.require('wgxpath.NodeTest');



/**
 * Constructs a subset of KindTest based on the xpath grammar:
 * http://www.w3.org/TR/xpath20/#prod-xpath-KindTest
 *
 * @param {string} typeName Type name to be tested.
 * @param {wgxpath.Literal=} opt_literal Optional literal for
 *        processing-instruction nodes.
 * @constructor
 * @implements {wgxpath.NodeTest}
 */
wgxpath.KindTest = function(typeName, opt_literal) {

  /**
   * @type {string}
   * @private
   */
  this.typeName_ = typeName;

  /**
   * @type {wgxpath.Literal}
   * @private
   */
  this.literal_ = goog.isDef(opt_literal) ? opt_literal : null;

  /**
   * @type {?goog.dom.NodeType}
   * @private
   */
  this.type_ = null;
  switch (typeName) {
    case 'comment':
      this.type_ = goog.dom.NodeType.COMMENT;
      break;
    case 'text':
      this.type_ = goog.dom.NodeType.TEXT;
      break;
    case 'processing-instruction':
      this.type_ = goog.dom.NodeType.PROCESSING_INSTRUCTION;
      break;
    case 'node':
      break;
    default:
      throw Error('Unexpected argument');
  }
};


/**
 * Checks if a type name is a valid KindTest parameter.
 *
 * @param {string} typeName The type name to be checked.
 * @return {boolean} Whether the type name is legal.
 */
wgxpath.KindTest.isValidType = function(typeName) {
  return typeName == 'comment' || typeName == 'text' ||
      typeName == 'processing-instruction' || typeName == 'node';
};


/**
 * @override
 */
wgxpath.KindTest.prototype.matches = function(node) {
  return goog.isNull(this.type_) || this.type_ == node.nodeType;
};


/**
 * Returns the type of the node.
 *
 * @return {?number} The type of the node, or null if any type.
 */
wgxpath.KindTest.prototype.getType = function() {
  return this.type_;
};


/**
 * @override
 */
wgxpath.KindTest.prototype.getName = function() {
  return this.typeName_;
};


/**
 * @override
 */
wgxpath.KindTest.prototype.toString = function() {
  var text = 'Kind Test: ' + this.typeName_;
  if (!goog.isNull(this.literal_)) {
    text += wgxpath.Expr.indent(this.literal_);
  }
  return text;
};
