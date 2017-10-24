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
 * @fileoverview A class implementing the NameTest construct.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.NameTest');

goog.require('goog.dom.NodeType');
goog.require('wgxpath.NodeTest');



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

  var defaultNamespace;
  if (this.name_ == wgxpath.NameTest.WILDCARD) {
    // Wildcard names default to wildcard namespace.
    defaultNamespace = wgxpath.NameTest.WILDCARD;
  } else {
    // Defined names default to html namespace.
    defaultNamespace = wgxpath.NameTest.HTML_NAMESPACE_URI_;
  }
  /**
   * @type {string}
   * @private
   */
  this.namespaceUri_ = opt_namespaceUri ? opt_namespaceUri.toLowerCase() :
      defaultNamespace;

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
  * Wildcard namespace which matches any namespace
  *
  * @const
  * @type {string}
  * @public
  */
 wgxpath.NameTest.WILDCARD = '*';


/**
 * @override
 */
wgxpath.NameTest.prototype.matches = function(node) {
  var type = node.nodeType;
  if (type != goog.dom.NodeType.ELEMENT &&
      type != goog.dom.NodeType.ATTRIBUTE) {
    return false;
  }
  // TODO(moz): Investigate if node.localName is necessary.
  var localName = goog.isDef(node.localName) ? node.localName : node.nodeName;
  if (this.name_ != wgxpath.NameTest.WILDCARD &&
      this.name_ != localName.toLowerCase()) {
    return false;
  } else {
    if (this.namespaceUri_ == wgxpath.NameTest.WILDCARD) {
      return true;
    } else {
      var namespaceUri = node.namespaceURI ? node.namespaceURI.toLowerCase() :
          wgxpath.NameTest.HTML_NAMESPACE_URI_;
      return this.namespaceUri_ == namespaceUri;
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
