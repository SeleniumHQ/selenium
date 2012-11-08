// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Functions to locate elements by XPath.
 *
 * <p>The locator implementations below differ from the Closure functions
 * goog.dom.xml.{selectSingleNode,selectNodes} in three important ways:
 * <ol>
 * <li>they do not refer to "document" which is undefined in the context of a
 * Firefox extension;
 * <li> they use a default NsResolver for browsers that do not provide
 * document.createNSResolver (e.g. Android); and
 * <li> they prefer document.evaluate to node.{selectSingleNode,selectNodes}
 * because the latter silently return nothing when the xpath resolves to a
 * non-Node type, limiting the error-checking the implementation can provide.
 * </ol>
 *
 * TODO(user): Add support for browsers without native xpath
 */

goog.provide('bot.locators.xpath');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('wgxpath');


/**
 * XPathResult enum values. These are defined separately since
 * the context running this script may not support the XPathResult
 * type.
 * @enum {number}
 * @see http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult
 * @private
 */
// TODO(berrada): Move this enum back to bot.locators.xpath namespace.
// The problem is that we alias bot.locators.xpath in locators.js, while
// we set the flag --collapse_properties (http://goo.gl/5W6cP).
// The compiler should have thrown the error anyways, it's a bug that it fails
// only when introducing this enum.
// Solution: remove --collapase_properties from the js_binary rule or
// use goog.exportSymbol to export the public methods and get rid of the alias.
bot.locators.XPathResult_ = {
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  FIRST_ORDERED_NODE_TYPE: 9
};


/**
 * Default XPath namespace resolver.
 * @private
 */
bot.locators.xpath.DEFAULT_RESOLVER_ = (function() {
  var namespaces = {svg: 'http://www.w3.org/2000/svg'};
  return function(prefix) {
    return namespaces[prefix] || null;
  };
})();


/**
 * Evaluates an XPath expression using a W3 XPathEvaluator.
 * @param {!(Document|Element)} node The document or element to perform the
 *     search under.
 * @param {string} path The xpath to search for.
 * @param {!bot.locators.XPathResult_} resultType The desired result type.
 * @return {XPathResult} The XPathResult or null if the root's ownerDocument
 *     does not support XPathEvaluators.
 * @private
 * @see http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathEvaluator-evaluate
 */
bot.locators.xpath.evaluate_ = function(node, path, resultType) {
  var doc = goog.dom.getOwnerDocument(node);

  // Let the wgxpath library be compiled away unless we are on IE or Android.
  // TODO(gdennis): Restrict this to just IE when we drop support for Froyo.
  if (goog.userAgent.IE || goog.userAgent.product.ANDROID) {
    wgxpath.install(goog.dom.getWindow(doc));
  }

  try {
    var resolver = doc.createNSResolver ?
        doc.createNSResolver(doc.documentElement) :
        bot.locators.xpath.DEFAULT_RESOLVER_;
    if (goog.userAgent.IE && !goog.userAgent.isVersion(7)) {
      // IE6, and only IE6, has an issue where calling a custom function
      // directly attached to the document object does not correctly propagate
      // thrown errors. So in that case *only* we will use apply().
      return doc.evaluate.call(doc, path, node, resolver, resultType, null);
    } else {
      return doc.evaluate(path, node, resolver, resultType, null);
    }
  } catch (ex) {
    // The Firefox XPath evaluator can throw an exception if the document is
    // queried while it's in the midst of reloading, so we ignore it. In all
    // other cases, we assume an invalid xpath has caused the exception.
    if (!(goog.userAgent.GECKO && ex.name == 'NS_ERROR_ILLEGAL_VALUE')) {
      throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
          'Unable to locate an element with the xpath expression ' + path +
          ' because of the following error:\n' + ex);
    }
  }
};


/**
 * @param {Node|undefined} node Node to check whether it is an Element.
 * @param {string} path XPath expression to include in the error message.
 * @private
 */
bot.locators.xpath.checkElement_ = function(node, path) {
  if (!node || node.nodeType != goog.dom.NodeType.ELEMENT) {
    throw new bot.Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'The result of the xpath expression "' + path +
        '" is: ' + node + '. It should be an element.');
  }
};


/**
 * Find an element by using an xpath expression
 * @param {string} target The xpath to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.xpath.single = function(target, root) {

  function selectSingleNode() {
    var result = bot.locators.xpath.evaluate_(root, target,
        bot.locators.XPathResult_.FIRST_ORDERED_NODE_TYPE);
    if (result) {
      var node = result.singleNodeValue;
      // On Opera, a singleNodeValue of undefined indicates a type error, while
      // other browsers may use it to indicate something has not been found.
      return goog.userAgent.OPERA ? node : (node || null);
    } else if (root.selectSingleNode) {
      var doc = goog.dom.getOwnerDocument(root);
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return root.selectSingleNode(target);
    }
    return null;
  }

  var node = selectSingleNode();
  if (!goog.isNull(node)) {
    bot.locators.xpath.checkElement_(node, target);
  }
  return (/** @type {Element} */node);
};


/**
 * Find elements by using an xpath expression
 * @param {string} target The xpath to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.xpath.many = function(target, root) {

  function selectNodes() {
    var result = bot.locators.xpath.evaluate_(root, target,
        bot.locators.XPathResult_.ORDERED_NODE_SNAPSHOT_TYPE);
    if (result) {
      var count = result.snapshotLength;
      // On Opera, if the XPath evaluates to a non-Node value, snapshotLength
      // will be undefined and the result empty, so fail immediately.
      if (goog.userAgent.OPERA && !goog.isDef(count)) {
        bot.locators.xpath.checkElement_(null, target);
      }
      var results = [];
      for (var i = 0; i < count; ++i) {
        results.push(result.snapshotItem(i));
      }
      return results;
    } else if (root.selectNodes) {
      var doc = goog.dom.getOwnerDocument(root);
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return root.selectNodes(target);
    }
    return [];
  }

  var nodes = selectNodes();
  goog.array.forEach(nodes, function(n) {
    bot.locators.xpath.checkElement_(n, target);
  });
  return (/** @type {!goog.array.ArrayLike} */nodes);
};
