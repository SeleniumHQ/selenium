// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class implementing the NameTest construct.
 */

goog.provide('wgxpath.NameTest');

goog.require('goog.dom.NodeType');



/**
 * Constructs a NameTest based on the xpath grammar:
 * http://www.w3.org/TR/xpath/#NT-NameTest
 *
 * @param {string} name Name to be tested.
 * @constructor
 * @implements {wgxpath.NodeTest}
 */
wgxpath.NameTest = function(name) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name.toLowerCase();
};


/**
 * The default namespace for XHTML nodes.
 *
 * @const
 * @type {string}
 * @private
 */
wgxpath.NameTest.HTML_NAMESPACE_ = 'http://www.w3.org/1999/xhtml';


/**
 * @override
 */
wgxpath.NameTest.prototype.matches = function(node) {
  var type = node.nodeType;
  if (type == goog.dom.NodeType.ELEMENT ||
      type == goog.dom.NodeType.ATTRIBUTE) {
    if (this.name_ == '*' || this.name_ == node.nodeName.toLowerCase()) {
      return true;
    } else {
      var namespace = node.namespaceURI || wgxpath.NameTest.HTML_NAMESPACE_;
      return this.name_ == namespace + ':*';
    }
  }
};


/**
 * @override
 */
wgxpath.NameTest.prototype.getName = function() {
  return this.name_;
};


/**
 * @override
 * @param {string=} opt_indent Optional indentation.
 * @return {string} The string representation.
 */
wgxpath.NameTest.prototype.toString = function(opt_indent) {
  var indent = opt_indent || '';
  return indent + 'nametest: ' + this.name_;
};
