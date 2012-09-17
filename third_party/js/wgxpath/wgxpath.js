/*  JavaScript-XPath 0.1.11
 *  (c) 2007 Cybozu Labs, Inc.
 *
 *  JavaScript-XPath is freely distributable under the terms of an MIT-style
 *  license. For details, see the JavaScript-XPath web site:
 *  http://coderepos.org/share/wiki/JavaScript-XPath
 *
/*--------------------------------------------------------------------------*/

// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * Wicked Good XPath
 *
 * @fileoverview A cross-browser XPath library forked from the
 * JavaScript-XPath project by Cybozu Labs.
 *
 */

goog.provide('wgxpath');

goog.require('wgxpath.Context');
goog.require('wgxpath.IEAttrWrapper');
goog.require('wgxpath.Lexer');
goog.require('wgxpath.NodeSet');
goog.require('wgxpath.Parser');


/**
 * Enum for XPathResult types.
 *
 * @private
 * @enum {number}
 */
wgxpath.XPathResultType_ = {
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
 * @private
 */
wgxpath.XPathExpression_ = function(expr) {
  if (!expr.length) {
    throw Error('Empty XPath expression.');
  }

  var lexer = wgxpath.Lexer.tokenize(expr);

  if (lexer.empty()) {
    throw Error('Invalid XPath expression.');
  }
  var gexpr = new wgxpath.Parser(lexer).parseExpr();
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
  if (type == wgxpath.XPathResultType_.ANY_TYPE) {
    if (value instanceof wgxpath.NodeSet) {
      type = wgxpath.XPathResultType_.UNORDERED_NODE_ITERATOR_TYPE;
    } else if (typeof value == 'string') {
      type = wgxpath.XPathResultType_.STRING_TYPE;
    } else if (typeof value == 'number') {
      type = wgxpath.XPathResultType_.NUMBER_TYPE;
    } else if (typeof value == 'boolean') {
      type = wgxpath.XPathResultType_.BOOLEAN_TYPE;
    } else {
      throw Error('Unexpected evaluation result.');
    }
  }
  if (type != wgxpath.XPathResultType_.STRING_TYPE &&
      type != wgxpath.XPathResultType_.NUMBER_TYPE &&
      type != wgxpath.XPathResultType_.BOOLEAN_TYPE &&
      !(value instanceof wgxpath.NodeSet)) {
    throw Error('document.evaluate called with wrong result type.');
  }
  this['resultType'] = type;
  var nodes;
  switch (type) {
    case wgxpath.XPathResultType_.STRING_TYPE:
      this['stringValue'] = (value instanceof wgxpath.NodeSet) ?
          value.string() : '' + value;
      break;
    case wgxpath.XPathResultType_.NUMBER_TYPE:
      this['numberValue'] = (value instanceof wgxpath.NodeSet) ?
          value.number() : +value;
      break;
    case wgxpath.XPathResultType_.BOOLEAN_TYPE:
      this['booleanValue'] = (value instanceof wgxpath.NodeSet) ?
          value.getLength() > 0 : !!value;
      break;
    case wgxpath.XPathResultType_.UNORDERED_NODE_ITERATOR_TYPE:
    case wgxpath.XPathResultType_.ORDERED_NODE_ITERATOR_TYPE:
    case wgxpath.XPathResultType_.UNORDERED_NODE_SNAPSHOT_TYPE:
    case wgxpath.XPathResultType_.ORDERED_NODE_SNAPSHOT_TYPE:
      var iter = value.iterator();
      nodes = [];
      for (var node = iter.next(); node; node = iter.next()) {
        nodes.push(node instanceof wgxpath.IEAttrWrapper ?
            node.getNode() : node);
      }
      this['snapshotLength'] = value.getLength();
      this['invalidIteratorState'] = false;
      break;
    case wgxpath.XPathResultType_.ANY_UNORDERED_NODE_TYPE:
    case wgxpath.XPathResultType_.FIRST_ORDERED_NODE_TYPE:
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
    if (type != wgxpath.XPathResultType_.UNORDERED_NODE_ITERATOR_TYPE &&
        type != wgxpath.XPathResultType_.ORDERED_NODE_ITERATOR_TYPE) {
      throw Error('iterateNext called with wrong result type.');
    }
    return (index >= nodes.length) ? null : nodes[index++];
  };
  this['snapshotItem'] = function(i) {
    if (type != wgxpath.XPathResultType_.UNORDERED_NODE_SNAPSHOT_TYPE &&
        type != wgxpath.XPathResultType_.ORDERED_NODE_SNAPSHOT_TYPE) {
      throw Error('snapshotItem called with wrong result type.');
    }
    return (i >= nodes.length || i < 0) ? null : nodes[i];
  };
};
wgxpath.XPathResult_['ANY_TYPE'] = wgxpath.XPathResultType_.ANY_TYPE;
wgxpath.XPathResult_['NUMBER_TYPE'] = wgxpath.XPathResultType_.NUMBER_TYPE;
wgxpath.XPathResult_['STRING_TYPE'] = wgxpath.XPathResultType_.STRING_TYPE;
wgxpath.XPathResult_['BOOLEAN_TYPE'] = wgxpath.XPathResultType_.BOOLEAN_TYPE;
wgxpath.XPathResult_['UNORDERED_NODE_ITERATOR_TYPE'] =
    wgxpath.XPathResultType_.UNORDERED_NODE_ITERATOR_TYPE;
wgxpath.XPathResult_['ORDERED_NODE_ITERATOR_TYPE'] =
    wgxpath.XPathResultType_.ORDERED_NODE_ITERATOR_TYPE;
wgxpath.XPathResult_['UNORDERED_NODE_SNAPSHOT_TYPE'] =
    wgxpath.XPathResultType_.UNORDERED_NODE_SNAPSHOT_TYPE;
wgxpath.XPathResult_['ORDERED_NODE_SNAPSHOT_TYPE'] =
    wgxpath.XPathResultType_.ORDERED_NODE_SNAPSHOT_TYPE;
wgxpath.XPathResult_['ANY_UNORDERED_NODE_TYPE'] =
    wgxpath.XPathResultType_.ANY_UNORDERED_NODE_TYPE;
wgxpath.XPathResult_['FIRST_ORDERED_NODE_TYPE'] =
    wgxpath.XPathResultType_.FIRST_ORDERED_NODE_TYPE;


/**
 * Installs the library. This is a noop if native XPath is available.
 *
 * @param {Window=} opt_win The window to install the library on.
 */
wgxpath.install = function(opt_win) {
  var win = opt_win || goog.global;
  var doc = win.document;

  // Installation is a noop if native XPath is available.
  if (!doc['evaluate']) {
    win['XPathResult'] = wgxpath.XPathResult_;
    doc['evaluate'] = function(expr, context, nsresolver, type, result) {
      return new wgxpath.XPathExpression_(expr).evaluate(context, type);
    };
    doc['createExpression'] = function(expr) {
      return new wgxpath.XPathExpression_(expr);
    };
  }
};
