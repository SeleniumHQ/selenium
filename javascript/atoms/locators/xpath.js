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
goog.require('goog.dom.xml');


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
    } else if (doc.implementation.hasFeature('XPath', '3.0')) {
      var resolver = doc.createNSResolver(doc.documentElement);
      var resultType;
      if (typeof XPathResult != 'undefined') {
        resultType = XPathResult.FIRST_ORDERED_NODE_TYPE;
      } else {
        // XPathResult is not defined in the Firefox extension context.
        // It's possible to access it using
        // Components.interfaces.nsIDOMXPathResult. Another option would be to
        // define it to be 9, according to the standard:
        // http://www.w3.org/TR/DOM-Level-3-XPath/ecma-script-binding.html
        if (!bot.isFirefoxExtension()) {
          // The document supports XPath, however XPathResult is not defined
          // and this is not happening inside a Firefox extension. This is
          // an unfamiliar case, indicate.
          throw Error("Document claims it supports XPath yet XPathResult " +
            "is not defined. Please report this to Selenium developers");
        }
        resultType = Components.interfaces.nsIDOMXPathResult.
            FIRST_ORDERED_NODE_TYPE;
      }
      var result = doc.evaluate(path, node, resolver,
          resultType, null);
      return result.singleNodeValue;
    }
    return null;
  };

  var node = selectSingleNode(root, target);

  if (!node) {
    return null;
  }

  // Ensure that we actually return an element
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    throw Error('Returned node is not an element: ' + target);
  }

  return (/**@type{Element}*/node);  // Type verified above.
};


/**
 * Find an element by using an xpath expression
 * @param {string} target The xpath to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.xpath.many = function(target, root) {
  var nodes = goog.dom.xml.selectNodes(root, target);

  // Only return elements
  goog.array.forEach(nodes, function(node) {
    if (node.nodeType != goog.dom.NodeType.ELEMENT) {
      throw Error('Returned nodes must be elements: ' + target);
    }
  });

  // Type-cast to account for an inconsistency in closure type annotations.
  return (/**@type{!goog.array.ArrayLike}*/nodes);
};
