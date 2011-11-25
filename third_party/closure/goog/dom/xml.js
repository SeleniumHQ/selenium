// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * XML utilities.
 *
 */

goog.provide('goog.dom.xml');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');


/**
 * Max XML size for MSXML2.  Used to prevent potential DoS attacks.
 * @type {number}
 */
goog.dom.xml.MAX_XML_SIZE_KB = 2 * 1024;  // In kB


/**
 * Max XML size for MSXML2.  Used to prevent potential DoS attacks.
 * @type {number}
 */
goog.dom.xml.MAX_ELEMENT_DEPTH = 256; // Same default as MSXML6.


/**
 * Creates an XML document appropriate for the current JS runtime
 * @param {string=} opt_rootTagName The root tag name.
 * @param {string=} opt_namespaceUri Namespace URI of the document element.
 * @return {Document} The new document.
 */
goog.dom.xml.createDocument = function(opt_rootTagName, opt_namespaceUri) {
  if (opt_namespaceUri && !opt_rootTagName) {
    throw Error("Can't create document with namespace and no root tag");
  }
  if (document.implementation && document.implementation.createDocument) {
    return document.implementation.createDocument(opt_namespaceUri || '',
                                                  opt_rootTagName || '',
                                                  null);
  } else if (typeof ActiveXObject != 'undefined') {
    var doc = goog.dom.xml.createMsXmlDocument_();
    if (doc) {
      if (opt_rootTagName) {
        doc.appendChild(doc.createNode(goog.dom.NodeType.ELEMENT,
                                       opt_rootTagName,
                                       opt_namespaceUri || ''));
      }
      return doc;
    }
  }
  throw Error('Your browser does not support creating new documents');
};


/**
 * Creates an XML document from a string
 * @param {string} xml The text.
 * @return {Document} XML document from the text.
 */
goog.dom.xml.loadXml = function(xml) {
  if (typeof DOMParser != 'undefined') {
    return new DOMParser().parseFromString(xml, 'application/xml');
  } else if (typeof ActiveXObject != 'undefined') {
    var doc = goog.dom.xml.createMsXmlDocument_();
    doc.loadXML(xml);
    return doc;
  }
  throw Error('Your browser does not support loading xml documents');
};


/**
 * Serializes an XML document or subtree to string.
 * @param {Document|Element} xml The document or the root node of the subtree.
 * @return {string} The serialized XML.
 */
goog.dom.xml.serialize = function(xml) {
  // Compatible with Firefox, Opera and WebKit.
  if (typeof XMLSerializer != 'undefined') {
    return new XMLSerializer().serializeToString(xml);
  }
  // Compatible with Internet Explorer.
  var text = xml.xml;
  if (text) {
    return text;
  }
  throw Error('Your browser does not support serializing XML documents');
};


/**
 * Selects a single node using an Xpath expression and a root node
 * @param {Node} node The root node.
 * @param {string} path Xpath selector.
 * @return {Node} The selected node, or null if no matching node.
 */
goog.dom.xml.selectSingleNode = function(node, path) {
  if (typeof node.selectSingleNode != 'undefined') {
    var doc = goog.dom.getOwnerDocument(node);
    if (typeof doc.setProperty != 'undefined') {
      doc.setProperty('SelectionLanguage', 'XPath');
    }
    return node.selectSingleNode(path);
  } else if (document.implementation.hasFeature('XPath', '3.0')) {
    var doc = goog.dom.getOwnerDocument(node);
    var resolver = doc.createNSResolver(doc.documentElement);
    var result = doc.evaluate(path, node, resolver,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  }
  return null;
};


/**
 * Selects multiple nodes using an Xpath expression and a root node
 * @param {Node} node The root node.
 * @param {string} path Xpath selector.
 * @return {(NodeList,Array.<Node>)} The selected nodes, or empty array if no
 *     matching nodes.
 */
goog.dom.xml.selectNodes = function(node, path) {
  if (typeof node.selectNodes != 'undefined') {
    var doc = goog.dom.getOwnerDocument(node);
    if (typeof doc.setProperty != 'undefined') {
      doc.setProperty('SelectionLanguage', 'XPath');
    }
    return node.selectNodes(path);
  } else if (document.implementation.hasFeature('XPath', '3.0')) {
    var doc = goog.dom.getOwnerDocument(node);
    var resolver = doc.createNSResolver(doc.documentElement);
    var nodes = doc.evaluate(path, node, resolver,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var results = [];
    var count = nodes.snapshotLength;
    for (var i = 0; i < count; i++) {
      results.push(nodes.snapshotItem(i));
    }
    return results;
  } else {
    return [];
  }
};


/**
 * Sets multiple attributes on an element. Differs from goog.dom.setProperties
 * in that it exclusively uses the element's setAttributes method. Use this
 * when you need to ensure that the exact property is available as an attribute
 * and can be read later by the native getAttribute method.
 * @param {!Element} element XML or DOM element to set attributes on.
 * @param {!Object.<string, string>} attributes Map of property:value pairs.
 */
goog.dom.xml.setAttributes = function(element, attributes) {
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      element.setAttribute(key, attributes[key]);
    }
  }
};


/**
 * Creates an instance of the MSXML2.DOMDocument.
 * @return {Document} The new document.
 * @private
 */
goog.dom.xml.createMsXmlDocument_ = function() {
  var doc = new ActiveXObject('MSXML2.DOMDocument');
  if (doc) {
    // Prevent potential vulnerabilities exposed by MSXML2, see
    // http://b/1707300 and http://wiki/Main/ISETeamXMLAttacks for details.
    doc.resolveExternals = false;
    doc.validateOnParse = false;
    // Add a try catch block because accessing these properties will throw an
    // error on unsupported MSXML versions. This affects Windows machines
    // running IE6 or IE7 that are on XP SP2 or earlier without MSXML updates.
    // See http://msdn.microsoft.com/en-us/library/ms766391(VS.85).aspx for
    // specific details on which MSXML versions support these properties.
    try {
      doc.setProperty('ProhibitDTD', true);
      doc.setProperty('MaxXMLSize', goog.dom.xml.MAX_XML_SIZE_KB);
      doc.setProperty('MaxElementDepth', goog.dom.xml.MAX_ELEMENT_DEPTH);
    } catch (e) {
      // No-op.
    }
  }
  return doc;
};
