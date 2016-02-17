// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilties for working with DOM nodes related to rich text
 * editing.  Many of these are not general enough to go into goog.dom.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.node');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.iter.ChildIterator');
goog.require('goog.dom.iter.SiblingIterator');
goog.require('goog.iter');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.userAgent');


/**
 * Names of all block-level tags
 * @type {Object}
 * @private
 */
goog.editor.node.BLOCK_TAG_NAMES_ = goog.object.createSet(
    goog.dom.TagName.ADDRESS, goog.dom.TagName.ARTICLE, goog.dom.TagName.ASIDE,
    goog.dom.TagName.BLOCKQUOTE, goog.dom.TagName.BODY,
    goog.dom.TagName.CAPTION, goog.dom.TagName.CENTER, goog.dom.TagName.COL,
    goog.dom.TagName.COLGROUP, goog.dom.TagName.DETAILS, goog.dom.TagName.DIR,
    goog.dom.TagName.DIV, goog.dom.TagName.DL, goog.dom.TagName.DD,
    goog.dom.TagName.DT, goog.dom.TagName.FIELDSET, goog.dom.TagName.FIGCAPTION,
    goog.dom.TagName.FIGURE, goog.dom.TagName.FOOTER, goog.dom.TagName.FORM,
    goog.dom.TagName.H1, goog.dom.TagName.H2, goog.dom.TagName.H3,
    goog.dom.TagName.H4, goog.dom.TagName.H5, goog.dom.TagName.H6,
    goog.dom.TagName.HEADER, goog.dom.TagName.HGROUP, goog.dom.TagName.HR,
    goog.dom.TagName.ISINDEX, goog.dom.TagName.OL, goog.dom.TagName.LI,
    goog.dom.TagName.MAP, goog.dom.TagName.MENU, goog.dom.TagName.NAV,
    goog.dom.TagName.OPTGROUP, goog.dom.TagName.OPTION, goog.dom.TagName.P,
    goog.dom.TagName.PRE, goog.dom.TagName.SECTION, goog.dom.TagName.SUMMARY,
    goog.dom.TagName.TABLE, goog.dom.TagName.TBODY, goog.dom.TagName.TD,
    goog.dom.TagName.TFOOT, goog.dom.TagName.TH, goog.dom.TagName.THEAD,
    goog.dom.TagName.TR, goog.dom.TagName.UL);


/**
 * Names of tags that have intrinsic content.
 * TODO(robbyw): What about object, br, input, textarea, button, isindex,
 * hr, keygen, select, table, tr, td?
 * @type {Object}
 * @private
 */
goog.editor.node.NON_EMPTY_TAGS_ = goog.object.createSet(
    goog.dom.TagName.IMG, goog.dom.TagName.IFRAME, goog.dom.TagName.EMBED);


/**
 * Check if the node is in a standards mode document.
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is in a standards mode document.
 */
goog.editor.node.isStandardsMode = function(node) {
  return goog.dom.getDomHelper(node).isCss1CompatMode();
};


/**
 * Get the right-most non-ignorable leaf node of the given node.
 * @param {Node} parent The parent ndoe.
 * @return {Node} The right-most non-ignorable leaf node.
 */
goog.editor.node.getRightMostLeaf = function(parent) {
  var temp;
  while (temp = goog.editor.node.getLastChild(parent)) {
    parent = temp;
  }
  return parent;
};


/**
 * Get the left-most non-ignorable leaf node of the given node.
 * @param {Node} parent The parent ndoe.
 * @return {Node} The left-most non-ignorable leaf node.
 */
goog.editor.node.getLeftMostLeaf = function(parent) {
  var temp;
  while (temp = goog.editor.node.getFirstChild(parent)) {
    parent = temp;
  }
  return parent;
};


/**
 * Version of firstChild that skips nodes that are entirely
 * whitespace and comments.
 * @param {Node} parent The reference node.
 * @return {Node} The first child of sibling that is important according to
 *     goog.editor.node.isImportant, or null if no such node exists.
 */
goog.editor.node.getFirstChild = function(parent) {
  return goog.editor.node.getChildHelper_(parent, false);
};


/**
 * Version of lastChild that skips nodes that are entirely whitespace or
 * comments.  (Normally lastChild is a property of all DOM nodes that gives the
 * last of the nodes contained directly in the reference node.)
 * @param {Node} parent The reference node.
 * @return {Node} The last child of sibling that is important according to
 *     goog.editor.node.isImportant, or null if no such node exists.
 */
goog.editor.node.getLastChild = function(parent) {
  return goog.editor.node.getChildHelper_(parent, true);
};


/**
 * Version of previoussibling that skips nodes that are entirely
 * whitespace or comments.  (Normally previousSibling is a property
 * of all DOM nodes that gives the sibling node, the node that is
 * a child of the same parent, that occurs immediately before the
 * reference node.)
 * @param {Node} sibling The reference node.
 * @return {Node} The closest previous sibling to sibling that is
 *     important according to goog.editor.node.isImportant, or null if no such
 *     node exists.
 */
goog.editor.node.getPreviousSibling = function(sibling) {
  return /** @type {Node} */ (
      goog.editor.node.getFirstValue_(
          goog.iter.filter(
              new goog.dom.iter.SiblingIterator(sibling, false, true),
              goog.editor.node.isImportant)));
};


/**
 * Version of nextSibling that skips nodes that are entirely whitespace or
 * comments.
 * @param {Node} sibling The reference node.
 * @return {Node} The closest next sibling to sibling that is important
 *     according to goog.editor.node.isImportant, or null if no
 *     such node exists.
 */
goog.editor.node.getNextSibling = function(sibling) {
  return /** @type {Node} */ (
      goog.editor.node.getFirstValue_(
          goog.iter.filter(
              new goog.dom.iter.SiblingIterator(sibling),
              goog.editor.node.isImportant)));
};


/**
 * Internal helper for lastChild/firstChild that skips nodes that are entirely
 * whitespace or comments.
 * @param {Node} parent The reference node.
 * @param {boolean} isReversed Whether children should be traversed forward
 *     or backward.
 * @return {Node} The first/last child of sibling that is important according
 *     to goog.editor.node.isImportant, or null if no such node exists.
 * @private
 */
goog.editor.node.getChildHelper_ = function(parent, isReversed) {
  return (!parent || parent.nodeType != goog.dom.NodeType.ELEMENT) ?
      null :
      /** @type {Node} */ (
          goog.editor.node.getFirstValue_(
              goog.iter.filter(
                  new goog.dom.iter.ChildIterator(
                      /** @type {!Element} */ (parent), isReversed),
                  goog.editor.node.isImportant)));
};


/**
 * Utility function that returns the first value from an iterator or null if
 * the iterator is empty.
 * @param {goog.iter.Iterator} iterator The iterator to get a value from.
 * @return {*} The first value from the iterator.
 * @private
 */
goog.editor.node.getFirstValue_ = function(iterator) {
  /** @preserveTry */
  try {
    return iterator.next();
  } catch (e) {
    return null;
  }
};


/**
 * Determine if a node should be returned by the iterator functions.
 * @param {Node} node An object implementing the DOM1 Node interface.
 * @return {boolean} Whether the node is an element, or a text node that
 *     is not all whitespace.
 */
goog.editor.node.isImportant = function(node) {
  // Return true if the node is not either a TextNode or an ElementNode.
  return node.nodeType == goog.dom.NodeType.ELEMENT ||
      node.nodeType == goog.dom.NodeType.TEXT &&
      !goog.editor.node.isAllNonNbspWhiteSpace(node);
};


/**
 * Determine whether a node's text content is entirely whitespace.
 * @param {Node} textNode A node implementing the CharacterData interface (i.e.,
 *     a Text, Comment, or CDATASection node.
 * @return {boolean} Whether the text content of node is whitespace,
 *     otherwise false.
 */
goog.editor.node.isAllNonNbspWhiteSpace = function(textNode) {
  return goog.string.isBreakingWhitespace(textNode.nodeValue);
};


/**
 * Returns true if the node contains only whitespace and is not and does not
 * contain any images, iframes or embed tags.
 * @param {Node} node The node to check.
 * @param {boolean=} opt_prohibitSingleNbsp By default, this function treats a
 *     single nbsp as empty.  Set this to true to treat this case as non-empty.
 * @return {boolean} Whether the node contains only whitespace.
 */
goog.editor.node.isEmpty = function(node, opt_prohibitSingleNbsp) {
  var nodeData = goog.dom.getRawTextContent(node);

  if (node.getElementsByTagName) {
    node = /** @type {!Element} */ (node);
    for (var tag in goog.editor.node.NON_EMPTY_TAGS_) {
      if (node.tagName == tag || node.getElementsByTagName(tag).length > 0) {
        return false;
      }
    }
  }
  return (!opt_prohibitSingleNbsp && nodeData == goog.string.Unicode.NBSP) ||
      goog.string.isBreakingWhitespace(nodeData);
};


/**
 * Returns the length of the text in node if it is a text node, or the number
 * of children of the node, if it is an element. Useful for range-manipulation
 * code where you need to know the offset for the right side of the node.
 * @param {Node} node The node to get the length of.
 * @return {number} The length of the node.
 */
goog.editor.node.getLength = function(node) {
  return node.length || node.childNodes.length;
};


/**
 * Search child nodes using a predicate function and return the first node that
 * satisfies the condition.
 * @param {Node} parent The parent node to search.
 * @param {function(Node):boolean} hasProperty A function that takes a child
 *    node as a parameter and returns true if it meets the criteria.
 * @return {?number} The index of the node found, or null if no node is found.
 */
goog.editor.node.findInChildren = function(parent, hasProperty) {
  for (var i = 0, len = parent.childNodes.length; i < len; i++) {
    if (hasProperty(parent.childNodes[i])) {
      return i;
    }
  }
  return null;
};


/**
 * Search ancestor nodes using a predicate function and returns the topmost
 * ancestor in the chain of consecutive ancestors that satisfies the condition.
 *
 * @param {Node} node The node whose ancestors have to be searched.
 * @param {function(Node): boolean} hasProperty A function that takes a parent
 *     node as a parameter and returns true if it meets the criteria.
 * @return {Node} The topmost ancestor or null if no ancestor satisfies the
 *     predicate function.
 */
goog.editor.node.findHighestMatchingAncestor = function(node, hasProperty) {
  var parent = node.parentNode;
  var ancestor = null;
  while (parent && hasProperty(parent)) {
    ancestor = parent;
    parent = parent.parentNode;
  }
  return ancestor;
};


/**
* Checks if node is a block-level html element. The <tt>display</tt> css
 * property is ignored.
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is a block-level node.
 */
goog.editor.node.isBlockTag = function(node) {
  return !!goog.editor.node.BLOCK_TAG_NAMES_[
      /** @type {!Element} */ (node).tagName];
};


/**
 * Skips siblings of a node that are empty text nodes.
 * @param {Node} node A node. May be null.
 * @return {Node} The node or the first sibling of the node that is not an
 *     empty text node. May be null.
 */
goog.editor.node.skipEmptyTextNodes = function(node) {
  while (node && node.nodeType == goog.dom.NodeType.TEXT && !node.nodeValue) {
    node = node.nextSibling;
  }
  return node;
};


/**
 * Checks if an element is a top-level editable container (meaning that
 * it itself is not editable, but all its child nodes are editable).
 * @param {Node} element The element to test.
 * @return {boolean} Whether the element is a top-level editable container.
 */
goog.editor.node.isEditableContainer = function(element) {
  return element.getAttribute && element.getAttribute('g_editable') == 'true';
};


/**
 * Checks if a node is inside an editable container.
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is in an editable container.
 */
goog.editor.node.isEditable = function(node) {
  return !!goog.dom.getAncestor(node, goog.editor.node.isEditableContainer);
};


/**
 * Finds the top-most DOM node inside an editable field that is an ancestor
 * (or self) of a given DOM node and meets the specified criteria.
 * @param {Node} node The DOM node where the search starts.
 * @param {function(Node) : boolean} criteria A function that takes a DOM node
 *     as a parameter and returns a boolean to indicate whether the node meets
 *     the criteria or not.
 * @return {Node} The DOM node if found, or null.
 */
goog.editor.node.findTopMostEditableAncestor = function(node, criteria) {
  var targetNode = null;
  while (node && !goog.editor.node.isEditableContainer(node)) {
    if (criteria(node)) {
      targetNode = node;
    }
    node = node.parentNode;
  }
  return targetNode;
};


/**
 * Splits off a subtree.
 * @param {!Node} currentNode The starting splitting point.
 * @param {Node=} opt_secondHalf The initial leftmost leaf the new subtree.
 *     If null, siblings after currentNode will be placed in the subtree, but
 *     no additional node will be.
 * @param {Node=} opt_root The top of the tree where splitting stops at.
 * @return {!Node} The new subtree.
 */
goog.editor.node.splitDomTreeAt = function(
    currentNode, opt_secondHalf, opt_root) {
  var parent;
  while (currentNode != opt_root && (parent = currentNode.parentNode)) {
    opt_secondHalf = goog.editor.node.getSecondHalfOfNode_(
        parent, currentNode, opt_secondHalf);
    currentNode = parent;
  }
  return /** @type {!Node} */ (opt_secondHalf);
};


/**
 * Creates a clone of node, moving all children after startNode to it.
 * When firstChild is not null or undefined, it is also appended to the clone
 * as the first child.
 * @param {!Node} node The node to clone.
 * @param {!Node} startNode All siblings after this node will be moved to the
 *     clone.
 * @param {Node|undefined} firstChild The first child of the new cloned element.
 * @return {!Node} The cloned node that now contains the children after
 *     startNode.
 * @private
 */
goog.editor.node.getSecondHalfOfNode_ = function(node, startNode, firstChild) {
  var secondHalf = /** @type {!Node} */ (node.cloneNode(false));
  while (startNode.nextSibling) {
    goog.dom.appendChild(secondHalf, startNode.nextSibling);
  }
  if (firstChild) {
    secondHalf.insertBefore(firstChild, secondHalf.firstChild);
  }
  return secondHalf;
};


/**
 * Appends all of oldNode's children to newNode. This removes all children from
 * oldNode and appends them to newNode. oldNode is left with no children.
 * @param {!Node} newNode Node to transfer children to.
 * @param {Node} oldNode Node to transfer children from.
 * @deprecated Use goog.dom.append directly instead.
 */
goog.editor.node.transferChildren = function(newNode, oldNode) {
  goog.dom.append(newNode, oldNode.childNodes);
};


/**
 * Replaces the innerHTML of a node.
 *
 * IE has serious problems if you try to set innerHTML of an editable node with
 * any selection. Early versions of IE tear up the old internal tree storage, to
 * help avoid ref-counting loops. But this sometimes leaves the selection object
 * in a bad state and leads to segfaults.
 *
 * Removing the nodes first prevents IE from tearing them up. This is not
 * strictly necessary in nodes that do not have the selection. You should always
 * use this function when setting innerHTML inside of a field.
 *
 * @param {Node} node A node.
 * @param {string} html The innerHTML to set on the node.
 */
goog.editor.node.replaceInnerHtml = function(node, html) {
  // Only do this IE. On gecko, we use element change events, and don't
  // want to trigger spurious events.
  if (goog.userAgent.IE) {
    goog.dom.removeChildren(node);
  }
  node.innerHTML = html;
};
