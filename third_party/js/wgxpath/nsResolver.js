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
 * @fileoverview Namespace resolver functions.
 * @author gdennis@google.com (Greg Dennis)
 */

goog.provide('wgxpath.nsResolver');

goog.require('goog.dom.NodeType');


/**
 * Returns a namespace resolve function for the given node.
 *
 * @param {!Node} node The context node.
 * @return {function(?string):?string} A lookupNamespaceURI function.
 */
wgxpath.nsResolver.getResolver = function(node) {
  // Adopted from W3C psuedocode specification:
  // http://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html
  //
  // [03/2014] changed NodeType.ATTRIBUTE handling (always return nullResolver_)
  // following DOM4 spec, Chrome, Firefox dropping attr.ownerElement attribute:
  // http://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ai6_ySyVITg

  switch (node.nodeType) {
    case goog.dom.NodeType.ELEMENT:
      return goog.partial(wgxpath.nsResolver.resolveForElement_, node);

    case goog.dom.NodeType.DOCUMENT:
      return wgxpath.nsResolver.getResolver(node.documentElement);

    case goog.dom.NodeType.DOCUMENT_FRAGMENT:
    case goog.dom.NodeType.DOCUMENT_TYPE:
    case goog.dom.NodeType.ENTITY:
    case goog.dom.NodeType.NOTATION:
      return wgxpath.nsResolver.nullResolver_;

    default:
      if (node.parentNode) {
        return wgxpath.nsResolver.getResolver(node.parentNode);
      }
      return wgxpath.nsResolver.nullResolver_;
  }
};


/**
 * A resolver function that always returns null.
 *
 * @param {?string} prefix Namespace prefix or null for default namespace.
 * @return {?string} Null.
 * @private
 */
wgxpath.nsResolver.nullResolver_ = function(prefix) {
  return null;
};


/**
 * The default namespace URI for XHTML nodes.
 *
 * @const
 * @type {string}
 * @private
 */
wgxpath.nsResolver.HTML_NAMESPACE_URI_ = 'http://www.w3.org/1999/xhtml';


/**
 * Looks up the namespace URI for the given prefix and given element context.
 *
 * @param {!Element} elem Context element for the namespace resolution.
 * @param {?string} prefix Namespace prefix or null for default namespace.
 * @return {?string} The namespace URI for the given prefix, or null if none.
 * @private
 */
wgxpath.nsResolver.resolveForElement_ = function(elem, prefix) {
  if (elem.prefix == prefix) {
    return elem.namespaceURI || wgxpath.nsResolver.HTML_NAMESPACE_URI_;
  }

  var attr = elem.getAttributeNode('xmlns:' + prefix);
  if (attr && attr.specified) {
    return attr.value || null;
  }

  if (elem.parentNode &&
      elem.parentNode.nodeType != goog.dom.NodeType.DOCUMENT) {
    return wgxpath.nsResolver.resolveForElement_(
        /** @type {!Element} */ (elem.parentNode), prefix);
  }

  return null;
};
