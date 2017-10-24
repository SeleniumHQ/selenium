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
 * Wicked Good XPath
 *
 * @fileoverview A cross-browser XPath library forked from the
 * JavaScript-XPath project by Cybozu Labs.
 * @author gdennis@google.com (Greg Dennis)
 * @author joonlee@google.com (Joon Lee)
 * @author moz@google.com (Michael Zhou)
 * @author evanrthomas@google.com (Evan Thomas)
 */

goog.provide('wgxpath');

goog.require('wgxpath.Context');
goog.require('wgxpath.IEAttrWrapper');
goog.require('wgxpath.Lexer');
goog.require('wgxpath.NodeSet');
goog.require('wgxpath.Parser');
goog.require('wgxpath.nsResolver');


/**
 * Enum for XPathResult types.
 *
 * @enum {number}
 */
wgxpath.XPathResultType = {
  ANY_TYPE: 0,
  NUMBER_TYPE: 1,
  STRING_TYPE: 2,
  BOOLEAN_TYPE: 3,
  UNORDERED_NODE_ITERATOR_TYPE: 4,
  ORDERED_NODE_ITERATOR_TYPE: 5,
  UNORDERED_NODE_SNAPSHOT_TYPE: 6,
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  ANY_UNORDERED_NODE_TYPE: 8,
  FIRST_ORDERED_NODE_TYPE: 9
};



/**
 * The exported XPathExpression type.
 *
 * @constructor
 * @extends {XPathExpression}
 * @param {string} expr The expression string.
 * @param {?(XPathNSResolver|function(string): ?string)} nsResolver
 *     XPath namespace resolver.
 * @private
 */
wgxpath.XPathExpression_ = function(expr, nsResolver) {
  if (!expr.length) {
    throw Error('Empty XPath expression.');
  }
  var lexer = wgxpath.Lexer.tokenize(expr);
  if (lexer.empty()) {
    throw Error('Invalid XPath expression.');
  }

  // nsResolver may either be an XPathNSResolver, which has a lookupNamespaceURI
  // function, a custom function, or null. Standardize it to a function.
  if (!nsResolver) {
    nsResolver = function(string) {return null;};
  } else if (!goog.isFunction(nsResolver)) {
    nsResolver = goog.bind(nsResolver.lookupNamespaceURI, nsResolver);
  }

  var gexpr = new wgxpath.Parser(lexer, nsResolver).parseExpr();
  if (!lexer.empty()) {
    throw Error('Bad token: ' + lexer.next());
  }
  this['evaluate'] = function(node, type) {
    var value = gexpr.evaluate(new wgxpath.Context(node));
    return new wgxpath.XPathResult_(value, type);
  };
};



/**
 * The exported XPathResult type.
 *
 * @constructor
 * @extends {XPathResult}
 * @param {(!wgxpath.NodeSet|number|string|boolean)} value The result value.
 * @param {number} type The result type.
 * @private
 */
wgxpath.XPathResult_ = function(value, type) {
  if (type == wgxpath.XPathResultType.ANY_TYPE) {
    if (value instanceof wgxpath.NodeSet) {
      type = wgxpath.XPathResultType.UNORDERED_NODE_ITERATOR_TYPE;
    } else if (typeof value == 'string') {
      type = wgxpath.XPathResultType.STRING_TYPE;
    } else if (typeof value == 'number') {
      type = wgxpath.XPathResultType.NUMBER_TYPE;
    } else if (typeof value == 'boolean') {
      type = wgxpath.XPathResultType.BOOLEAN_TYPE;
    } else {
      throw Error('Unexpected evaluation result.');
    }
  }
  if (type != wgxpath.XPathResultType.STRING_TYPE &&
      type != wgxpath.XPathResultType.NUMBER_TYPE &&
      type != wgxpath.XPathResultType.BOOLEAN_TYPE &&
      !(value instanceof wgxpath.NodeSet)) {
    throw Error('value could not be converted to the specified type');
  }
  this['resultType'] = type;
  var nodes;
  switch (type) {
    case wgxpath.XPathResultType.STRING_TYPE:
      this['stringValue'] = (value instanceof wgxpath.NodeSet) ?
          value.string() : '' + value;
      break;
    case wgxpath.XPathResultType.NUMBER_TYPE:
      this['numberValue'] = (value instanceof wgxpath.NodeSet) ?
          value.number() : +value;
      break;
    case wgxpath.XPathResultType.BOOLEAN_TYPE:
      this['booleanValue'] = (value instanceof wgxpath.NodeSet) ?
          value.getLength() > 0 : !!value;
      break;
    case wgxpath.XPathResultType.UNORDERED_NODE_ITERATOR_TYPE:
    case wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE:
    case wgxpath.XPathResultType.UNORDERED_NODE_SNAPSHOT_TYPE:
    case wgxpath.XPathResultType.ORDERED_NODE_SNAPSHOT_TYPE:
      var iter = value.iterator();
      nodes = [];
      for (var node = iter.next(); node; node = iter.next()) {
        nodes.push(node instanceof wgxpath.IEAttrWrapper ?
            node.getNode() : node);
      }
      this['snapshotLength'] = value.getLength();
      this['invalidIteratorState'] = false;
      break;
    case wgxpath.XPathResultType.ANY_UNORDERED_NODE_TYPE:
    case wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE:
      var firstNode = value.getFirst();
      this['singleNodeValue'] =
          firstNode instanceof wgxpath.IEAttrWrapper ?
          firstNode.getNode() : firstNode;
      break;
    default:
      throw Error('Unknown XPathResult type.');
  }
  var index = 0;
  this['iterateNext'] = function() {
    if (type != wgxpath.XPathResultType.UNORDERED_NODE_ITERATOR_TYPE &&
        type != wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE) {
      throw Error('iterateNext called with wrong result type');
    }
    return (index >= nodes.length) ? null : nodes[index++];
  };
  this['snapshotItem'] = function(i) {
    if (type != wgxpath.XPathResultType.UNORDERED_NODE_SNAPSHOT_TYPE &&
        type != wgxpath.XPathResultType.ORDERED_NODE_SNAPSHOT_TYPE) {
      throw Error('snapshotItem called with wrong result type');
    }
    return (i >= nodes.length || i < 0) ? null : nodes[i];
  };
};
wgxpath.XPathResult_['ANY_TYPE'] = wgxpath.XPathResultType.ANY_TYPE;
wgxpath.XPathResult_['NUMBER_TYPE'] = wgxpath.XPathResultType.NUMBER_TYPE;
wgxpath.XPathResult_['STRING_TYPE'] = wgxpath.XPathResultType.STRING_TYPE;
wgxpath.XPathResult_['BOOLEAN_TYPE'] = wgxpath.XPathResultType.BOOLEAN_TYPE;
wgxpath.XPathResult_['UNORDERED_NODE_ITERATOR_TYPE'] =
    wgxpath.XPathResultType.UNORDERED_NODE_ITERATOR_TYPE;
wgxpath.XPathResult_['ORDERED_NODE_ITERATOR_TYPE'] =
    wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE;
wgxpath.XPathResult_['UNORDERED_NODE_SNAPSHOT_TYPE'] =
    wgxpath.XPathResultType.UNORDERED_NODE_SNAPSHOT_TYPE;
wgxpath.XPathResult_['ORDERED_NODE_SNAPSHOT_TYPE'] =
    wgxpath.XPathResultType.ORDERED_NODE_SNAPSHOT_TYPE;
wgxpath.XPathResult_['ANY_UNORDERED_NODE_TYPE'] =
    wgxpath.XPathResultType.ANY_UNORDERED_NODE_TYPE;
wgxpath.XPathResult_['FIRST_ORDERED_NODE_TYPE'] =
    wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE;



/**
 * The exported XPathNSResolver type.
 *
 * @constructor
 * @extends {XPathNSResolver}
 * @param {!Node} node Context node for the namespace resolution.
 * @private
 */
wgxpath.XPathNSResolver_ = function(node) {
  this['lookupNamespaceURI'] = wgxpath.nsResolver.getResolver(node);
};


/**
 * Installs the library. Unless opt_force is true, this is a noop if native
 * XPath is available.
 *
 * @param {Window=} opt_win The window to install the library on.
 * @param {boolean=} opt_force Forces installation of this library,
 *     overwriting existing XPath functionality.
 */
wgxpath.install = function(opt_win, opt_force) {
  var win = opt_win || goog.global;
  var doc = (win.Document && win.Document.prototype) || win.document;

  // Unless opt_force is true, installation is a noop if native XPath is
  // available.
  if (doc['evaluate'] && !opt_force) {
    return;
  }

  win['XPathResult'] = wgxpath.XPathResult_;
  doc['evaluate'] = function(expr, context, nsResolver, type, result) {
    return new wgxpath.XPathExpression_(expr, nsResolver).
        evaluate(context, type);
  };
  doc['createExpression'] = function(expr, nsResolver) {
    return new wgxpath.XPathExpression_(expr, nsResolver);
  };
  doc['createNSResolver'] = function(node) {
    return new wgxpath.XPathNSResolver_(node);
  };
};

goog.exportSymbol('wgxpath.install', wgxpath.install);
