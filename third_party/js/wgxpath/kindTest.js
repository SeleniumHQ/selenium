// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class implementing the xpath 1.0 subset of the
 *               KindTest construct.
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
 * @param {string=} opt_indent Optional indentation.
 * @return {string} The string representation.
 */
wgxpath.KindTest.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  var text = indent + 'kindtest: ' + this.typeName_;
  if (!goog.isNull(this.literal_)) {
    text += '\n' + this.literal_.toString(indent + wgxpath.Expr.INDENT);
  }
  return text;
};
