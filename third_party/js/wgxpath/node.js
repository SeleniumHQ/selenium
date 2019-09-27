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
 * @fileoverview Node utilities.
 * @author moz@google.com (Michael Zhou)
 */

goog.provide('wgxpath.Node');

goog.require('goog.array');
goog.require('goog.dom.NodeType');
goog.require('goog.userAgent');
goog.require('wgxpath.IEAttrWrapper');
goog.require('wgxpath.userAgent');


/** @typedef {!(Node|wgxpath.IEAttrWrapper)} */
wgxpath.Node = {};


/**
 * Returns whether two nodes are equal.
 *
 * @param {wgxpath.Node} a The first node.
 * @param {wgxpath.Node} b The second node.
 * @return {boolean} Whether the nodes are equal.
 */
wgxpath.Node.equal = function(a, b) {
  return (a == b) || (a instanceof wgxpath.IEAttrWrapper &&
      b instanceof wgxpath.IEAttrWrapper && a.getNode() ==
      b.getNode());
};


/**
 * Returns the string-value of the required type from a node.
 *
 * @param {!wgxpath.Node} node The node to get value from.
 * @return {string} The value required.
 */
wgxpath.Node.getValueAsString = function(node) {
  var t = null, type = node.nodeType;
  // Old IE title problem.
  var needTitleFix = function(node) {
    return wgxpath.userAgent.IE_DOC_PRE_9 &&
        node.nodeName.toLowerCase() == 'title';
  };
  // goog.dom.getTextContent doesn't seem to work
  if (type == goog.dom.NodeType.ELEMENT) {
    t = node.textContent;
    t = (t == undefined || t == null) ? node.innerText : t;
    t = (t == undefined || t == null) ? '' : t;
  }
  if (typeof t != 'string') {
    if (needTitleFix(node) && type == goog.dom.NodeType.ELEMENT) {
      t = node.text;
    } else if (type == goog.dom.NodeType.DOCUMENT ||
        type == goog.dom.NodeType.ELEMENT) {
      node = (type == goog.dom.NodeType.DOCUMENT) ?
          node.documentElement : node.firstChild;
      var i = 0, stack = [];
      for (t = ''; node;) {
        do {
          if (node.nodeType != goog.dom.NodeType.ELEMENT) {
            t += node.nodeValue;
          }
          if (needTitleFix(node)) {
            t += node.text;
          }
          stack[i++] = node; // push
        } while (node = node.firstChild);
        while (i && !(node = stack[--i].nextSibling)) {}
      }
    } else {
      t = node.nodeValue;
    }
  }
  return '' + t;
};


/**
 * Returns the string-value of the required type from a node, casted to number.
 *
 * @param {!wgxpath.Node} node The node to get value from.
 * @return {number} The value required.
 */
wgxpath.Node.getValueAsNumber = function(node) {
  return +wgxpath.Node.getValueAsString(node);
};


/**
 * Returns the string-value of the required type from a node, casted to boolean.
 *
 * @param {!wgxpath.Node} node The node to get value from.
 * @return {boolean} The value required.
 */
wgxpath.Node.getValueAsBool = function(node) {
  return !!wgxpath.Node.getValueAsString(node);
};


/**
 * Returns if the attribute matches the given value.
 *
 * @param {!wgxpath.Node} node The node to get value from.
 * @param {?string} name The attribute name to match, if any.
 * @param {?string} value The attribute value to match, if any.
 * @return {boolean} Whether the node matches the attribute, if any.
 */
wgxpath.Node.attrMatches = function(node, name, value) {
  // No attribute.
  if (goog.isNull(name)) {
    return true;
  }
  // TODO: If possible, figure out why this throws an exception in some
  // cases on IE < 9.
  try {
    if (!node.getAttribute) {
      return false;
    }
  } catch (e) {
    return false;
  }
  if (wgxpath.userAgent.IE_DOC_PRE_8 && name == 'class') {
    name = 'className';
  }
  return value == null ? !!node.getAttribute(name) :
      (node.getAttribute(name, 2) == value);
};


/**
 * Returns the descendants of a node.
 *
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get descendants from.
 * @param {?string=} opt_attrName The attribute name to match, if any.
 * @param {?string=} opt_attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet=} opt_nodeset The node set to add descendants to.
 * @return {!wgxpath.NodeSet} The nodeset with descendants.
 * @suppress {missingRequire} There's a circular dependency between this file
 *     and nodeset.js.
 */
wgxpath.Node.getDescendantNodes = function(test, node, opt_attrName,
    opt_attrValue, opt_nodeset) {
  var nodeset = opt_nodeset || new wgxpath.NodeSet();
  var func = wgxpath.userAgent.IE_DOC_PRE_9 ?
      wgxpath.Node.getDescendantNodesIEPre9_ :
      wgxpath.Node.getDescendantNodesGeneric_;
  var attrName = goog.isString(opt_attrName) ? opt_attrName : null;
  var attrValue = goog.isString(opt_attrValue) ? opt_attrValue : null;
  return func.call(null, test, node, attrName, attrValue, nodeset);
};


/**
 * Returns the descendants of a node for IE.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get descendants from.
 * @param {?string} attrName The attribute name to match, if any.
 * @param {?string} attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet} nodeset The node set to add descendants to.
 * @return {!wgxpath.NodeSet} The nodeset with descendants.
 */
wgxpath.Node.getDescendantNodesIEPre9_ = function(test, node, attrName,
    attrValue, nodeset) {
  if (wgxpath.Node.doesNeedSpecialHandlingIEPre9_(test, attrName)) {
    var descendants = node.all;
    if (!descendants) {
      return nodeset;
    }
    var name = wgxpath.Node.getNameFromTestIEPre9_(test);
    // all.tags not working.
    if (name != '*') {
      descendants = node.getElementsByTagName(name);
      if (!descendants) {
        return nodeset;
      }
    }
    if (attrName) {
      /**
       * The length property of the "all" collection is overwritten
       * if there exists an element with id="length", therefore we
       * have to iterate without knowing the length.
       */
      var result = [];
      var i = 0;
      while (node = descendants[i++]) {
        if (wgxpath.Node.attrMatches(node, attrName, attrValue)) {
          result.push(node);
        }
      }
      descendants = result;
    }
    var i = 0;
    while (node = descendants[i++]) {
      if (name != '*' || node.tagName != '!') {
        nodeset.add(node);
      }
    }
    return nodeset;
  }
  wgxpath.Node.doRecursiveAttrMatch_(test, node, attrName,
      attrValue, nodeset);
  return nodeset;
};


/**
 * Returns the descendants of a node for browsers other than IE.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get descendants from.
 * @param {?string} attrName The attribute name to match, if any.
 * @param {?string} attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet} nodeset The node set to add descendants to.
 * @return {!wgxpath.NodeSet} The nodeset with descendants.
 */
wgxpath.Node.getDescendantNodesGeneric_ = function(test, node,
    attrName, attrValue, nodeset) {
  if (node.getElementsByName && attrValue && attrName == 'name' &&
      !goog.userAgent.IE) {
    var nodes = node.getElementsByName(attrValue);
    goog.array.forEach(nodes, function(node) {
      if (test.matches(node)) {
        nodeset.add(node);
      }
    });
  } else if (node.getElementsByClassName && attrValue && attrName == 'class') {
    var nodes = node.getElementsByClassName(attrValue);
    goog.array.forEach(nodes, function(node) {
      if (node.className == attrValue && test.matches(node)) {
        nodeset.add(node);
      }
    });
  } else if (test instanceof wgxpath.KindTest) {
    wgxpath.Node.doRecursiveAttrMatch_(test, node, attrName,
        attrValue, nodeset);
  } else if (node.getElementsByTagName) {
    var nodes = node.getElementsByTagName(test.getName());
    goog.array.forEach(nodes, function(node) {
      if (wgxpath.Node.attrMatches(node, attrName, attrValue)) {
        nodeset.add(node);
      }
    });
  }
  return nodeset;
};


/**
 * Returns the child nodes of a node.
 *
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get child nodes from.
 * @param {?string=} opt_attrName The attribute name to match, if any.
 * @param {?string=} opt_attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet=} opt_nodeset The node set to add child nodes to.
 * @return {!wgxpath.NodeSet} The nodeset with child nodes.
 * @suppress {missingRequire} There's a circular dependency between this file
 *     and nodeset.js.
 */
wgxpath.Node.getChildNodes = function(test, node,
    opt_attrName, opt_attrValue, opt_nodeset) {
  var nodeset = opt_nodeset || new wgxpath.NodeSet();
  var func = wgxpath.userAgent.IE_DOC_PRE_9 ?
      wgxpath.Node.getChildNodesIEPre9_ : wgxpath.Node.getChildNodesGeneric_;
  var attrName = goog.isString(opt_attrName) ? opt_attrName : null;
  var attrValue = goog.isString(opt_attrValue) ? opt_attrValue : null;
  return func.call(null, test, node, attrName, attrValue, nodeset);
};


/**
 * Returns the child nodes of a node for IE browsers.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get child nodes from.
 * @param {?string} attrName The attribute name to match, if any.
 * @param {?string} attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet} nodeset The node set to add child nodes to.
 * @return {!wgxpath.NodeSet} The nodeset with child nodes.
 */
wgxpath.Node.getChildNodesIEPre9_ = function(test, node,
    attrName, attrValue, nodeset) {
  var children;
  if (wgxpath.Node.doesNeedSpecialHandlingIEPre9_(test, attrName) &&
      (children = node.childNodes)) { // node.children seems buggy.
    var name = wgxpath.Node.getNameFromTestIEPre9_(test);
    if (name != '*') {
      //children = children.tags(name); // children.tags seems buggy.
      children = goog.array.filter(children, function(child) {
        return child.tagName && child.tagName.toLowerCase() == name;
      });
      if (!children) {
        return nodeset;
      }
    }
    if (attrName) {
      // TODO: See if an optimization is possible.
      children = goog.array.filter(children, function(n) {
        return wgxpath.Node.attrMatches(n, attrName, attrValue);
      });
    }
    goog.array.forEach(children, function(node) {
      if (name != '*' || node.tagName != '!' &&
          !(name == '*' && node.nodeType != goog.dom.NodeType.ELEMENT)) {
        nodeset.add(node);
      }
    });
    return nodeset;
  }
  return wgxpath.Node.getChildNodesGeneric_(test, node, attrName,
      attrValue, nodeset);
};


/**
 * Returns the child nodes of a node genericly.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The node to get child nodes from.
 * @param {?string} attrName The attribute name to match, if any.
 * @param {?string} attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet} nodeset The node set to add child nodes to.
 * @return {!wgxpath.NodeSet} The nodeset with child nodes.
 */
wgxpath.Node.getChildNodesGeneric_ = function(test, node, attrName,
    attrValue, nodeset) {
  for (var current = node.firstChild; current; current = current.nextSibling) {
    if (wgxpath.Node.attrMatches(current, attrName, attrValue)) {
      if (test.matches(current)) {
        nodeset.add(current);
      }
    }
  }
  return nodeset;
};


/**
 * Returns whether a getting descendants/children call
 * needs special handling on IE browsers.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {!wgxpath.Node} node The root node to start the recursive call on.
 * @param {?string} attrName The attribute name to match, if any.
 * @param {?string} attrValue The attribute value to match, if any.
 * @param {!wgxpath.NodeSet} nodeset The NodeSet to add nodes to.
 */
wgxpath.Node.doRecursiveAttrMatch_ = function(test, node,
    attrName, attrValue, nodeset) {
  for (var n = node.firstChild; n; n = n.nextSibling) {
    if (wgxpath.Node.attrMatches(n, attrName, attrValue) &&
        test.matches(n)) {
      nodeset.add(n);
    }
    wgxpath.Node.doRecursiveAttrMatch_(test, n, attrName,
        attrValue, nodeset);
  }
};


/**
 * Returns whether a getting descendants/children call
 * needs special handling on IE browsers.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest for matching nodes.
 * @param {?string} attrName The attribute name to match, if any.
 * @return {boolean} Whether the call needs special handling.
 */
wgxpath.Node.doesNeedSpecialHandlingIEPre9_ = function(test, attrName) {
  return test instanceof wgxpath.NameTest ||
      test.getType() == goog.dom.NodeType.COMMENT ||
      (!!attrName && goog.isNull(test.getType()));
};


/**
 * Returns a fixed name of a NodeTest for IE browsers.
 *
 * @private
 * @param {!wgxpath.NodeTest} test A NodeTest.
 * @return {string} The name of the NodeTest.
 */
wgxpath.Node.getNameFromTestIEPre9_ = function(test) {
  if (test instanceof wgxpath.KindTest) {
    if (test.getType() == goog.dom.NodeType.COMMENT) {
      return '!';
    } else if (goog.isNull(test.getType())) {
      return '*';
    }
  }
  return test.getName();
};
