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
 * <p>If no namespace is provided, the default HTML namespace is used.
 *
 * @param {string} name Name to be tested.
 * @param {string=} opt_namespaceUri Namespace URI; defaults to HTML namespace.
 * @constructor
 * @implements {wgxpath.NodeTest}
 */
wgxpath.NameTest = function(name, opt_namespaceUri) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name.toLowerCase();

  /**
   * @type {string}
   * @private
   */
  this.namespaceUri_ = opt_namespaceUri ? opt_namespaceUri.toLowerCase() :
      wgxpath.NameTest.HTML_NAMESPACE_URI_;
};


/**
 * The default namespace URI for XHTML nodes.
 *
 * @const
 * @type {string}
 * @private
 */
wgxpath.NameTest.HTML_NAMESPACE_URI_ = 'http://www.w3.org/1999/xhtml';


/**
 * @override
 */
wgxpath.NameTest.prototype.matches = function(node) {
  var type = node.nodeType;
  if (type != goog.dom.NodeType.ELEMENT &&
      type != goog.dom.NodeType.ATTRIBUTE) {
    return false;
  }
  if (this.name_ != '*' && this.name_ != node.nodeName.toLowerCase()) {
    return false;
  } else {
    var namespaceUri = node.namespaceURI ? node.namespaceURI.toLowerCase() :
        wgxpath.NameTest.HTML_NAMESPACE_URI_;
    return this.namespaceUri_ == namespaceUri;
  }
};


/**
 * @override
 */
wgxpath.NameTest.prototype.getName = function() {
  return this.name_;
};


/**
 * Returns the namespace URI to be matched.
 *
 * @return {string} Namespace URI.
 */
wgxpath.NameTest.prototype.getNamespaceUri = function() {
  return this.namespaceUri_;
};


/**
 * @override
 */
wgxpath.NameTest.prototype.toString = function() {
  var prefix = this.namespaceUri_ == wgxpath.NameTest.HTML_NAMESPACE_URI_ ?
      '' : this.namespaceUri_ + ':';
  return 'Name Test: ' + prefix + this.name_;
};
