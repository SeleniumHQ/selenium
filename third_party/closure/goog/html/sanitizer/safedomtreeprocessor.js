// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A base class to safely parse and transform an HTML string
 * using an inert DOM, which avoids executing scripts and loading images. Note:
 * this class does *not* guarantee that the output does not contain scripts and
 * images that eventually execute once the output is inserted into an active DOM
 * document. If any subclass claims to produce SafeHtml output, it must be
 * reviewed separately.
 * @supported IE 10+, Chrome 26+, Firefox 22+, Safari 7.1+, Opera 15+
 */

goog.module('goog.html.sanitizer.SafeDomTreeProcessor');
goog.module.declareLegacyNamespace();

var Const = goog.require('goog.string.Const');
var ElementWeakMap = goog.require('goog.html.sanitizer.ElementWeakMap');
var NodeType = goog.require('goog.dom.NodeType');
var TagName = goog.require('goog.dom.TagName');
var googDom = goog.require('goog.dom');
var googLog = goog.require('goog.log');
var noclobber = goog.require('goog.html.sanitizer.noclobber');
var safe = goog.require('goog.dom.safe');
var uncheckedconversions = goog.require('goog.html.uncheckedconversions');
var userAgent = goog.require('goog.userAgent');

/** @const {?googLog.Logger} */
var logger = googLog.getLogger('goog.html.sanitizer.SafeDomTreeProcessor');

/**
 * Whether the HTML sanitizer is supported. For now mainly exclude
 * IE9 or below, for which we know the sanitizer is insecure or broken.
 * @const {boolean}
 */
var SAFE_PARSING_SUPPORTED =
    !userAgent.IE || userAgent.isDocumentModeOrHigher(10);

/**
 * Whether the template tag is supported.
 * @const {boolean}
 */
var HTML_SANITIZER_TEMPLATE_SUPPORTED =
    !userAgent.IE || document.documentMode == null;

/**
 * Parses a string of unsanitized HTML and provides an iterator over the
 * resulting DOM tree nodes. The parsing operation is inert (that is,
 * it does not cause execution of any active content or cause the browser to
 * issue any requests). The returned iterator is guaranteed to iterate over a
 * parent element before iterating over any of its children.
 * @param {string} html
 * @return {!TreeWalker}
 */
function getDomTreeWalker(html) {
  var iteratorParent;
  var safeHtml =
      uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(
          Const.from('Never attached to DOM.'), html);
  var templateElement = document.createElement('template');
  if (HTML_SANITIZER_TEMPLATE_SUPPORTED && 'content' in templateElement) {
    safe.unsafeSetInnerHtmlDoNotUseOrElse(templateElement, safeHtml);
    iteratorParent = templateElement.content;
  } else {
    // In browsers where <template> is not implemented, use an inert
    // HTMLDocument.
    var doc = document.implementation.createHTMLDocument('x');
    iteratorParent = doc.body;
    safe.unsafeSetInnerHtmlDoNotUseOrElse(doc.body, safeHtml);
  }
  return document.createTreeWalker(
      iteratorParent, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null /* filter */, false /* entityReferenceExpansion */);
}

/**
 * Constructs a {@link SafeDomTreeProcessor} object that safely parses an input
 * string into a DOM tree using an inert document, and creates a new tree based
 * on the original tree, optionally transforming it in the process. The
 * transformation is not specified in this abstract class; subclasses are
 * supposed to override its protected methods to define a transformation that
 * allows tags and attributes, drops entire subtrees, modifies tag names or
 * attributes, etc.
 * @constructor @struct @abstract
 */
var SafeDomTreeProcessor = function() {};

/**
 * Parses an HTML string and walks the resulting DOM forest to apply the
 * transformation function and generate a new forest. Returns the string
 * representation of the forest.
 * @param {string} html
 * @return {string}
 * @protected @final
 */
SafeDomTreeProcessor.prototype.processToString = function(html) {
  if (!SAFE_PARSING_SUPPORTED) {
    return '';
  }

  var newTree = this.processToTree(html);
  if (noclobber.getElementAttributes(newTree).length > 0) {
    // We want to preserve the outer SPAN tag, because the processor has
    // attached attributes to it. To do so, we make a new SPAN tag the parent of
    // the existing root span tag, so that the rest of the function will remove
    // that one instead.
    var newRoot = googDom.createElement(TagName.SPAN);
    newRoot.appendChild(newTree);
    newTree = newRoot;
  }
  // The XMLSerializer will add a spurious xmlns attribute to the root node.
  var serializedNewTree = new XMLSerializer().serializeToString(newTree);
  // Remove the outer span before returning the string representation of the
  // processed copy.
  return serializedNewTree.slice(
      serializedNewTree.indexOf('>') + 1, serializedNewTree.lastIndexOf('</'));
};

/**
 * Parses an HTML string and walks the resulting DOM forest to apply the
 * transformation function and generate a copy of the forest. Returns the forest
 * wrapped in a common SPAN parent, so that the result is always a tree.
 * @param {string} html
 * @return {!HTMLSpanElement}
 * @protected @final
 */
SafeDomTreeProcessor.prototype.processToTree = function(html) {
  if (!SAFE_PARSING_SUPPORTED) {
    return googDom.createElement(TagName.SPAN);
  }
  var newRoot = googDom.createElement(TagName.SPAN);
  // Allow subclasses to attach properties to the root.
  this.processRoot(newRoot);

  // Allow subclasses to pre-process the HTML string before performing the main
  // tree-based transformation.
  html = this.preProcessHtml(html);
  var originalTreeWalker = getDomTreeWalker(html);

  // Mapping from original nodes to new nodes, used to find the parent to which
  // a newly processed node should be attached.
  var elementMap = ElementWeakMap.newWeakMap();

  var originalNode;
  while (originalNode = originalTreeWalker.nextNode()) {
    // Make a copy of the node, potentially dropping it or changing its content,
    // tag name, etc.
    var newNode = this.createNode_(originalNode);
    if (!newNode) {
      // The transformation function chose not to copy over the node. We delete
      // the children so that the current treeWalker will stop iterating on
      // them.
      googDom.removeChildren(originalNode);
      continue;
    }
    if (noclobber.isNodeElement(newNode)) {
      elementMap.set(originalNode, newNode);
    }

    // Finds the new parent to which newNode should be appended. The tree is
    // copied top-down, so the parent of the current node has already been
    // copied and placed into the new tree. The new parent is either the root
    // of the new tree or a node found using originalToNewElementMap.
    var originalParent = noclobber.getParentNode(originalNode);
    var isParentRoot = false;
    if (originalParent) {
      var originalParentNodeType = noclobber.getNodeType(originalParent);
      var originalParentNodeName =
          noclobber.getNodeName(originalParent).toLowerCase();
      var originalGrandParent = noclobber.getParentNode(originalParent);
      // The following checks if newParent is an immediate child of the inert
      // parent template element.
      if (originalParentNodeType == NodeType.DOCUMENT_FRAGMENT &&
          !originalGrandParent) {
        isParentRoot = true;
      } else if (originalParentNodeName == 'body' && originalGrandParent) {
        // The following checks if newParent is an immediate child of the
        // inert parent HtmlDocument.
        var dirtyGreatGrandParent =
            noclobber.getParentNode(originalGrandParent);
        if (dirtyGreatGrandParent &&
            !noclobber.getParentNode(dirtyGreatGrandParent)) {
          isParentRoot = true;
        }
      }
      var newParent = null;
      if (isParentRoot || !originalParent) {
        newParent = newRoot;
      } else if (noclobber.isNodeElement(originalParent)) {
        newParent = elementMap.get(originalParent);
      }
      if (newParent.content) {
        newParent = newParent.content;
      }
      newParent.appendChild(newNode);
    }
  }
  if (elementMap.clear) {
    // Clear the map. On browsers that don't support WeakMap, entries are not
    // automatically cleaned up.
    elementMap.clear();
  }
  return newRoot;
};

/**
 * Creates the root SPAN element for the new tree. This function can be
 * overridden to add attributes to the tag. Note that if any attributes are
 * added to the element, then {@link processToString} will not strip it from the
 * generated string to preserve the attributes.
 * @param {!HTMLSpanElement} newRoot
 * @protected @abstract
 */
SafeDomTreeProcessor.prototype.processRoot = function(newRoot) {};

/**
 * Pre-processes the input html before the main tree-based transformation.
 * @param {string} html
 * @return {string}
 * @protected @abstract
 */
SafeDomTreeProcessor.prototype.preProcessHtml = function(html) {};

/**
 * Returns a new node based on the transformation of an original node, or null
 * if the node and all its children should not be copied over to the new tree.
 * @param {!Node} originalNode
 * @return {?Node}
 * @private
 */
SafeDomTreeProcessor.prototype.createNode_ = function(originalNode) {
  var nodeType = noclobber.getNodeType(originalNode);
  switch (nodeType) {
    case NodeType.TEXT:
      return this.createTextNode(/** @type {!Text} */ (originalNode));
    case NodeType.ELEMENT:
      return this.createElement_(noclobber.assertNodeIsElement(originalNode));
    default:
      googLog.warning(logger, 'Dropping unknown node type: ' + nodeType);
      return null;
  }
};

/**
 * Creates a new text node from the original text node, or null if the node
 * should not be copied over to the new tree.
 * @param {!Text} originalNode
 * @return {?Text}
 * @protected @abstract
 */
SafeDomTreeProcessor.prototype.createTextNode = function(originalNode) {};

/**
 * Creates a new element from the original element, potentially applying
 * transformations to the element's tagname and attributes.
 * @param {!Element} originalElement
 * @return {?Element}
 * @private
 */
SafeDomTreeProcessor.prototype.createElement_ = function(originalElement) {
  if (noclobber.getNodeName(originalElement).toUpperCase() == 'TEMPLATE') {
    // Processing TEMPLATE tags is not supported, they are automatically
    // dropped.
    return null;
  }
  var newElement = this.createElementWithoutAttributes(originalElement);
  if (!newElement) {
    return null;
  }
  // Copy over element attributes, applying a transformation on each attribute.
  this.processElementAttributes_(originalElement, newElement);
  return newElement;
};

/**
 * Creates a new element from the original element. This function should only
 * either create a new element (optionally changing the tag name from the
 * original element) or return null to prevent the entire subtree from appearing
 * in the output. Note that TEMPLATE tags and their contents are automatically
 * dropped, and this function is not called to decide whether to keep them or
 * not.
 * @param {!Element} originalElement
 * @return {?Element}
 * @protected @abstract
 */
SafeDomTreeProcessor.prototype.createElementWithoutAttributes = function(
    originalElement) {};

/**
 * Copies over the attributes of an original node to its corresponding new node
 * generated with {@link processNode}.
 * @param {!Element} originalElement
 * @param {!Element} newElement
 * @private
 */
SafeDomTreeProcessor.prototype.processElementAttributes_ = function(
    originalElement, newElement) {
  var attributes = noclobber.getElementAttributes(originalElement);
  if (attributes == null) {
    return;
  }
  for (var i = 0, attribute; attribute = attributes[i]; i++) {
    if (attribute.specified) {
      var newValue = this.processElementAttribute(originalElement, attribute);
      if (newValue !== null) {
        noclobber.setElementAttribute(newElement, attribute.name, newValue);
      }
    }
  }
};

/**
 * Returns the new value for an attribute, or null if the attribute should be
 * dropped.
 * @param {!Element} element
 * @param {!Attr} attribute
 * @return {?string}
 * @protected @abstract
 */
SafeDomTreeProcessor.prototype.processElementAttribute = function(
    element, attribute) {};

/** @const {boolean} */
SafeDomTreeProcessor.SAFE_PARSING_SUPPORTED = SAFE_PARSING_SUPPORTED;
exports = SafeDomTreeProcessor;
