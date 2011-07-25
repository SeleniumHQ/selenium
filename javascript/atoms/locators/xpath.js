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

// TODO(user): Add support for browsers without native xpath

goog.provide('bot.locators.xpath');

goog.require('bot');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');


/**
 * XPathResult enum values. These are defined separately since
 * the context running this script may not support the XPathResult
 * type.
 * @enum {number}
 * @see http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult
 */
bot.locators.xpath.XPathResult = {
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  FIRST_ORDERED_NODE_TYPE: 9
};


/**
 * Evaluates an XPath expression using a W3 XPathEvaluator.
 * @param {!(Document|Element)} node The document or element to perform the
 *     search under.
 * @param {string} path The xpath to search for.
 * @param {!bot.locators.xpath.XPathResult} resultType The desired result type.
 * @return {XPathResult} The XPathResult or null if the root's ownerDocument
 *     does not support XPathEvaluators.
 * @private
 * @see http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathEvaluator-evaluate
 */
bot.locators.xpath.evaluate_ = function(node, path, resultType) {
  var doc = goog.dom.getOwnerDocument(node);
  if (!doc.implementation.hasFeature('XPath', '3.0')) {
    return null;
  }
  var resolver = doc.createNSResolver(doc.documentElement);
  return doc.evaluate(path, node, resolver, resultType, null);
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
  // Note: This code was copied from Closure (goog.dom.xml.selectSingleNode)
  // since the current implementation refers 'document' which is not defined
  // in the context of the Firefox extension (XPathResult isn't defined as well).
  function selectSingleNode(node, path) {
    var doc = goog.dom.getOwnerDocument(node);
    if (node.selectSingleNode) {
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return node.selectSingleNode(path);
    }
    try {
      var result = bot.locators.xpath.evaluate_(node, path,
          bot.locators.xpath.XPathResult.FIRST_ORDERED_NODE_TYPE);
      return result ? result.singleNodeValue : null;
    }
    catch (ex) {
      // The error is caused most likely by an invalid xpath expression
      // TODO: catch the exception more precise
      throw Error(bot.ErrorCode.INVALID_SELECTOR_ERROR, 
        'Unable to locate an element with the xpath expression ' + target);
    }
  }

  var node = selectSingleNode(root, target);

  if (!node) {
    return null;
  }

  // Ensure that we actually return an element
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    throw Error('Returned node is not an element: ' + target);
  }

  return (/**@type {Element}*/node);  // Type verified above.
};


/**
 * Find an element by using an xpath expression
 * @param {string} target The xpath to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.xpath.many = function(target, root) {
  // Note: This code was copied from Closure (goog.dom.xml.selectNodes)
  // since the current implement referes to 'document' which is not
  // defined in the context of the Firefox extension (XPathResult isn't
  // defined either).
  function selectNodes(node, path) {
    var doc = goog.dom.getOwnerDocument(node);

    if (node.selectNodes) {
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return node.selectNodes(path);
    }
    var results = [];
    var nodes;
    try{
      nodes = bot.locators.xpath.evaluate_(node, path,
              bot.locators.xpath.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    }
    catch(ex) {
      // The error is caused most likely by an invalid xpath expression
      // TODO: catch the exception more precise
      throw Error(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'Unable to locate elements with the xpath expression ' + path);
    }
    if (nodes) {
      var count = nodes.snapshotLength;
      for (var i = 0; i < count; ++i) {
        var item = nodes.snapshotItem(i);
        if (item.nodeType != goog.dom.NodeType.ELEMENT) {
          // A xpath expression which selects something which is not an element is invalid
          throw Error(bot.ErrorCode.INVALID_SELECTOR_ERROR, 
            'Returned nodes must be elements: ' + target);
        }
        results.push(item);
      }
    }
    return results;
  }

  var nodes = selectNodes(root, target);

  // Only return elements
  goog.array.forEach(nodes, function(node) {
    if (node.nodeType != goog.dom.NodeType.ELEMENT) {
      throw Error('Returned nodes must be elements: ' + target);
    }
  });

  // Type-cast to account for an inconsistency in closure type annotations.
  return (/**@type {!goog.array.ArrayLike}*/nodes);
};
