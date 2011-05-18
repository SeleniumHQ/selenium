// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview TrogEdit plugin to handle enter keys by inserting the
 * specified block level tag.
 *
 */

goog.provide('goog.editor.plugins.TagOnEnterHandler');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Command');
goog.require('goog.editor.node');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.range');
goog.require('goog.editor.style');
goog.require('goog.events.KeyCodes');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * Plugin to handle enter keys. This subclass normalizes all browsers to use
 * the given block tag on enter.
 * @param {goog.dom.TagName} tag The type of tag to add on enter.
 * @constructor
 * @extends {goog.editor.plugins.EnterHandler}
 */
goog.editor.plugins.TagOnEnterHandler = function(tag) {
  this.tag = tag;

  goog.editor.plugins.EnterHandler.call(this);
};
goog.inherits(goog.editor.plugins.TagOnEnterHandler,
    goog.editor.plugins.EnterHandler);


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.getTrogClassId = function() {
  return 'TagOnEnterHandler';
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.getNonCollapsingBlankHtml =
    function() {
  if (this.tag == goog.dom.TagName.P) {
    return '<p>&nbsp;</p>';
  } else if (this.tag == goog.dom.TagName.DIV) {
    return '<div><br></div>';
  }
  return '<br>';
};


/**
 * This plugin is active on uneditable fields so it can provide a value for
 * queryCommandValue calls asking for goog.editor.Command.BLOCKQUOTE.
 * @return {boolean} True.
 */
goog.editor.plugins.TagOnEnterHandler.prototype.activeOnUneditableFields =
    goog.functions.TRUE;


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.isSupportedCommand = function(
    command) {
  return command == goog.editor.Command.DEFAULT_TAG;
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.queryCommandValue = function(
    command) {
  return command == goog.editor.Command.DEFAULT_TAG ? this.tag : null;
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.handleBackspaceInternal =
    function(e, range) {
  goog.editor.plugins.TagOnEnterHandler.superClass_.handleBackspaceInternal.
      call(this, e, range);

  if (goog.userAgent.GECKO) {
    this.markBrToNotBeRemoved_(range, true);
  }
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.processParagraphTagsInternal =
    function(e, split) {
  if ((goog.userAgent.OPERA || goog.userAgent.IE) &&
      this.tag != goog.dom.TagName.P) {
    this.ensureBlockIeOpera(this.tag);
  }
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.handleDeleteGecko = function(
    e) {
  var range = this.fieldObject.getRange();
  var container = goog.editor.style.getContainer(
      range && range.getContainerElement());
  if (this.fieldObject.getElement().lastChild == container &&
      goog.editor.plugins.EnterHandler.isBrElem(container)) {
    // Don't delete if it's the last node in the field and just has a BR.
    e.preventDefault();
    // TODO(user): I think we probably don't need to stopPropagation here
    e.stopPropagation();
  } else {
    // Go ahead with deletion.
    // Prevent an existing BR immediately following the selection being deleted
    // from being removed in the keyup stage (as opposed to a BR added by FF
    // after deletion, which we do remove).
    this.markBrToNotBeRemoved_(range, false);
    // Manually delete the selection if it's at a BR.
    this.deleteBrGecko(e);
  }
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.handleKeyUpInternal = function(
    e) {
  if (goog.userAgent.GECKO) {
    if (e.keyCode == goog.events.KeyCodes.DELETE) {
      this.removeBrIfNecessary_(false);
    } else if (e.keyCode == goog.events.KeyCodes.BACKSPACE) {
      this.removeBrIfNecessary_(true);
    }
  } else if ((goog.userAgent.IE || goog.userAgent.OPERA) &&
             e.keyCode == goog.events.KeyCodes.ENTER) {
    this.ensureBlockIeOpera(this.tag, true);
  }
  // Safari uses DIVs by default.
};


/**
 * String that matches a single BR tag or NBSP surrounded by non-breaking
 * whitespace
 * @type {string}
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.BrOrNbspSurroundedWithWhiteSpace_ =
    '[\t\n\r ]*(<br[^>]*\/?>|&nbsp;)[\t\n\r ]*';


/**
 * String that matches a single BR tag or NBSP surrounded by non-breaking
 * whitespace
 * @type {RegExp}
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.emptyLiRegExp_ = new RegExp('^' +
    goog.editor.plugins.TagOnEnterHandler.BrOrNbspSurroundedWithWhiteSpace_ +
    '$');


/**
 * Ensures the current node is wrapped in the tag.
 * @param {Node} node The node to ensure gets wrapped.
 * @param {Element} container Element containing the selection.
 * @return {Element} Element containing the selection, after the wrapping.
  * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.ensureNodeIsWrappedW3c_ =
    function(node, container) {
  if (container == this.fieldObject.getElement()) {
    // If the first block-level ancestor of cursor is the field,
    // don't split the tree. Find all the text from the cursor
    // to both block-level elements surrounding it (if they exist)
    // and split the text into two elements.
    // This is the IE contentEditable behavior.

    // The easy way to do this is to wrap all the text in an element
    // and then split the element as if the user had hit enter
    // in the paragraph

    // However, simply wrapping the text into an element creates problems
    // if the text was already wrapped using some other element such as an
    // anchor.  For example, wrapping the text of
    //   <a href="">Text</a>
    // would produce
    //   <a href=""><p>Text</p></a>
    // which is not what we want.  What we really want is
    //   <p><a href="">Text</a></p>
    // So we need to search for an ancestor of position.node to be wrapped.
    // We do this by iterating up the hierarchy of postiion.node until we've
    // reached the node that's just under the container.
    var isChildOfFn = function(child) {
      return container == child.parentNode; };
    var nodeToWrap = goog.dom.getAncestor(node, isChildOfFn, true);
    container = goog.editor.plugins.TagOnEnterHandler.wrapInContainerW3c_(
        this.tag, {node: nodeToWrap, offset: 0}, container);
  }
  return container;
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.handleEnterWebkitInternal =
    function(e) {
  if (this.tag == goog.dom.TagName.DIV) {
    var range = this.fieldObject.getRange();
    var container =
        goog.editor.style.getContainer(range.getContainerElement());

    var position = goog.editor.range.getDeepEndPoint(range, true);
    container = this.ensureNodeIsWrappedW3c_(position.node, container);
    goog.dom.Range.createCaret(position.node, position.offset).select();
  }
};


/** @inheritDoc */
goog.editor.plugins.TagOnEnterHandler.prototype.
    handleEnterAtCursorGeckoInternal = function(e, wasCollapsed, range) {
  // We use this because there are a few cases where FF default
  // implementation doesn't follow IE's:
  //   -Inserts BRs into empty elements instead of NBSP which has nasty
  //    side effects w/ making/deleting selections
  //   -Hitting enter when your cursor is in the field itself. IE will
  //    create two elements. FF just inserts a BR.
  //   -Hitting enter inside an empty list-item doesn't create a block
  //    tag. It just splits the list and puts your cursor in the middle.
  var li = null;
  if (wasCollapsed) {
    // Only break out of lists for collapsed selections.
    li = goog.dom.getAncestorByTagNameAndClass(
        range && range.getContainerElement(), goog.dom.TagName.LI);
  }
  var isEmptyLi = (li &&
      li.innerHTML.match(
          goog.editor.plugins.TagOnEnterHandler.emptyLiRegExp_));
  var elementAfterCursor = isEmptyLi ?
      this.breakOutOfEmptyListItemGecko_(li) :
      this.handleRegularEnterGecko_();

  // Move the cursor in front of "nodeAfterCursor", and make sure it
  // is visible
  this.scrollCursorIntoViewGecko_(elementAfterCursor);

  // Fix for http://b/1991234 :
  if (goog.editor.plugins.EnterHandler.isBrElem(elementAfterCursor)) {
    // The first element in the new line is a line with just a BR and maybe some
    // whitespace.
    var br = elementAfterCursor.getElementsByTagName(goog.dom.TagName.BR)[0];
    if (br.previousSibling &&
        br.previousSibling.nodeType == goog.dom.NodeType.TEXT) {
      // If there is some whitespace before the BR, don't put the selection on
      // the BR, put it in the text node that's there, otherwise when you type
      // it will create adjacent text nodes.
      elementAfterCursor = br.previousSibling;
    }
  }

  goog.editor.range.selectNodeStart(elementAfterCursor);

  e.preventDefault();
  // TODO(user): I think we probably don't need to stopPropagation here
  e.stopPropagation();
};


/**
 * If The cursor is in an empty LI then break out of the list like in IE
 * @param {Node} li LI to break out of.
 * @return {Element} Element to put the cursor after.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.breakOutOfEmptyListItemGecko_ =
    function(li) {
  // Do this as follows:
  // 1. <ul>...<li>&nbsp;</li>...</ul>
  // 2. <ul id='foo1'>...<li id='foo2'>&nbsp;</li>...</ul>
  // 3. <ul id='foo1'>...</ul><p id='foo3'>&nbsp;</p><ul id='foo2'>...</ul>
  // 4. <ul>...</ul><p>&nbsp;</p><ul>...</ul>
  //
  // There are a couple caveats to the above. If the UL is contained in
  // a list, then the new node inserted is an LI, not a P.
  // For an OL, it's all the same, except the tagname of course.
  // Finally, it's possible that with the LI at the beginning or the end
  // of the list that we'll end up with an empty list. So we special case
  // those cases.

  var listNode = li.parentNode;
  var grandparent = listNode.parentNode;
  var inSubList = grandparent.tagName == goog.dom.TagName.OL ||
      grandparent.tagName == goog.dom.TagName.UL;

  // TODO(robbyw): Should we apply the list or list item styles to the new node?
  var newNode = goog.dom.getDomHelper(li).createElement(
      inSubList ? goog.dom.TagName.LI : this.tag);

  if (!li.previousSibling) {
    goog.dom.insertSiblingBefore(newNode, listNode);
  } else {
    if (li.nextSibling) {
      var listClone = listNode.cloneNode(false);
      while (li.nextSibling) {
        listClone.appendChild(li.nextSibling);
      }
      goog.dom.insertSiblingAfter(listClone, listNode);
    }
    goog.dom.insertSiblingAfter(newNode, listNode);
  }
  if (goog.editor.node.isEmpty(listNode)) {
    goog.dom.removeNode(listNode);
  }
  goog.dom.removeNode(li);
  newNode.innerHTML = '&nbsp;';

  return newNode;
};


/**
 * Wrap the text indicated by "position" in an HTML container of type
 * "nodeName".
 * @param {string} nodeName Type of container, e.g. "p" (paragraph).
 * @param {Object} position The W3C cursor position object
 *     (from getCursorPositionW3c).
 * @param {Node} container The field containing position.
 * @return {Element} The container element that holds the contents from
 *     position.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.wrapInContainerW3c_ = function(nodeName,
    position, container) {
  var start = position.node;
  while (start.previousSibling &&
         !goog.editor.style.isContainer(start.previousSibling)) {
    start = start.previousSibling;
  }

  var end = position.node;
  while (end.nextSibling &&
         !goog.editor.style.isContainer(end.nextSibling)) {
    end = end.nextSibling;
  }

  var para = container.ownerDocument.createElement(nodeName);
  while (start != end) {
    var newStart = start.nextSibling;
    goog.dom.appendChild(para, start);
    start = newStart;
  }
  var nextSibling = end.nextSibling;
  goog.dom.appendChild(para, end);
  container.insertBefore(para, nextSibling);

  return para;
};


/**
 * When we delete an element, FF inserts a BR. We want to strip that
 * BR after the fact, but in the case where your cursor is at a character
 * right before a BR and you delete that character, we don't want to
 * strip it. So we detect this case on keydown and mark the BR as not needing
 * removal.
 * @param {goog.dom.AbstractRange} range The closure range object.
 * @param {boolean} isBackspace Whether this is handling the backspace key.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.markBrToNotBeRemoved_ =
    function(range, isBackspace) {
  var focusNode = range.getFocusNode();
  var focusOffset = range.getFocusOffset();
  var newEndOffset = isBackspace ? focusOffset : focusOffset + 1;

  if (goog.editor.node.getLength(focusNode) == newEndOffset) {
    var sibling = focusNode.nextSibling;
    if (sibling && sibling.tagName == goog.dom.TagName.BR) {
      this.brToKeep_ = sibling;
    }
  }
};


/**
 * If we hit delete/backspace to merge elements, FF inserts a BR.
 * We want to strip that BR. In markBrToNotBeRemoved, we detect if
 * there was already a BR there before the delete/backspace so that
 * we don't accidentally remove a user-inserted BR.
 * @param {boolean} isBackSpace Whether this is handling the backspace key.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.removeBrIfNecessary_ = function(
    isBackSpace) {
  var range = this.fieldObject.getRange();
  var focusNode = range.getFocusNode();
  var focusOffset = range.getFocusOffset();

  var sibling;
  if (isBackSpace && focusNode.data == '') {
    // nasty hack. sometimes firefox will backspace a paragraph and put
    // the cursor before the BR. when it does this, the focusNode is
    // an empty textnode.
    sibling = focusNode.nextSibling;
  } else if (isBackSpace && focusOffset == 0) {
    var node = focusNode;
    while (node && !node.previousSibling &&
           node.parentNode != this.fieldObject.getElement()) {
      node = node.parentNode;
    }
    sibling = node.previousSibling;
  } else if (focusNode.length == focusOffset) {
    sibling = focusNode.nextSibling;
  }

  if (!sibling || sibling.tagName != goog.dom.TagName.BR ||
      this.brToKeep_ == sibling) {
    return;
  }

  goog.dom.removeNode(sibling);
  if (focusNode.nodeType == goog.dom.NodeType.TEXT) {
    // Sometimes firefox inserts extra whitespace. Do our best to deal.
    // This is buggy though.
    focusNode.data =
        goog.editor.plugins.TagOnEnterHandler.trimTabsAndLineBreaks_(
            focusNode.data);
    // When we strip whitespace, make sure that our cursor is still at
    // the end of the textnode.
    goog.dom.Range.createCaret(focusNode,
        Math.min(focusOffset, focusNode.length)).select();
  }
};


/**
 * Trim the tabs and line breaks from a string.
 * @param {string} string String to trim.
 * @return {string} Trimmed string.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.trimTabsAndLineBreaks_ = function(
    string) {
  return string.replace(/^[\t\n\r]|[\t\n\r]$/g, '');
};


/**
 * Called in response to a normal enter keystroke. It has the action of
 * splitting elements.
 * @return {Element} The node that the cursor should be before.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.handleRegularEnterGecko_ =
    function() {
  var range = this.fieldObject.getRange();
  var container =
      goog.editor.style.getContainer(range.getContainerElement());
  var newNode;
  if (goog.editor.plugins.EnterHandler.isBrElem(container)) {
    if (container.tagName == goog.dom.TagName.BODY) {
      // If the field contains only a single BR, this code ensures we don't
      // try to clone the body tag.
      container = this.ensureNodeIsWrappedW3c_(
          container.getElementsByTagName(goog.dom.TagName.BR)[0],
          container);
    }

    newNode = container.cloneNode(true);
    goog.dom.insertSiblingAfter(newNode, container);
  } else {
    if (!container.firstChild) {
      container.innerHTML = '&nbsp;';
    }

    var position = goog.editor.range.getDeepEndPoint(range, true);
    container = this.ensureNodeIsWrappedW3c_(position.node, container);

    newNode = goog.editor.plugins.TagOnEnterHandler.splitDomAndAppend_(
        position.node, position.offset, container);

    // If the left half and right half of the splitted node are anchors then
    // that means the user pressed enter while the caret was inside
    // an anchor tag and split it.  The left half is the first anchor
    // found while traversing the right branch of container.  The right half
    // is the first anchor found while traversing the left branch of newNode.
    var leftAnchor =
        goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_(
            container);
    var rightAnchor =
        goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_(
            newNode, true);
    if (leftAnchor && rightAnchor &&
        leftAnchor.tagName == goog.dom.TagName.A &&
        rightAnchor.tagName == goog.dom.TagName.A) {
      // If the original anchor (left anchor) is now empty, that means
      // the user pressed [Enter] at the beginning of the anchor,
      // in which case we we
      // want to replace that anchor with its child nodes
      // Otherwise, we take the second half of the splitted text and break
      // it out of the anchor.
      var anchorToRemove = goog.editor.node.isEmpty(leftAnchor, false) ?
          leftAnchor : rightAnchor;
      goog.dom.flattenElement(/** @type {Element} */ (anchorToRemove));
    }
  }
  return /** @type {Element} */ (newNode);
};


/**
 * Scroll the cursor into view, resulting from splitting the paragraph/adding
 * a br. It behaves differently than scrollIntoView
 * @param {Element} element The element immediately following the cursor. Will
 *     be used to determine how to scroll in order to make the cursor visible.
 *     CANNOT be a BR, as they do not have offsetHeight/offsetTop.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.prototype.scrollCursorIntoViewGecko_ =
    function(element) {
  if (!this.fieldObject.isFixedHeight()) {
    return; // Only need to scroll fixed height fields.
  }

  var field = this.fieldObject.getElement();

  // Get the y position of the element we want to scroll to
  var elementY = goog.style.getPageOffsetTop(element);

  // Determine the height of that element, since we want the bottom of the
  // element to be in view.
  var bottomOfNode = elementY + element.offsetHeight;

  var win = this.getFieldDomHelper().getWindow();
  var scrollY = goog.dom.getPageScroll(win).y;
  var viewportHeight = goog.dom.getViewportSize(win).height;

  // If the botom of the element is outside the viewport, move it into view
  if (bottomOfNode > viewportHeight + scrollY) {
    // In standards mode, use the html element and not the body
    if (field.tagName == goog.dom.TagName.BODY &&
        goog.editor.node.isStandardsMode(field)) {
      field = field.parentNode;
    }
    field.scrollTop = bottomOfNode - viewportHeight;
  }
};


/**
 * Splits the DOM tree around the given node and returns the node
 * containing the second half of the tree. The first half of the tree
 * is modified, but not removed from the DOM.
 * @param {Node} positionNode Node to split at.
 * @param {number} positionOffset Offset into positionNode to split at.  If
 *     positionNode is a text node, this offset is an offset in to the text
 *     content of that node.  Otherwise, positionOffset is an offset in to
 *     the childNodes array.  All elements with child index of  positionOffset
 *     or greater will be moved to the second half.  If positionNode is an
 *     empty element, the dom will be split at that element, with positionNode
 *     ending up in the second half.  positionOffset must be 0 in this case.
 * @param {Node=} opt_root Node at which to stop splitting the dom (the root
 *     is also split).
 * @return {Node} The node containing the second half of the tree.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.splitDom_ = function(
    positionNode, positionOffset, opt_root) {
  if (!opt_root) opt_root = positionNode.ownerDocument.body;

  // Split the node.
  var textSplit = positionNode.nodeType == goog.dom.NodeType.TEXT;
  var secondHalfOfSplitNode;
  if (textSplit) {
    if (goog.userAgent.IE &&
        positionOffset == positionNode.nodeValue.length) {
      // Since splitText fails in IE at the end of a node, we split it manually.
      secondHalfOfSplitNode = goog.dom.getDomHelper(positionNode).
          createTextNode('');
      goog.dom.insertSiblingAfter(secondHalfOfSplitNode, positionNode);
    } else {
      secondHalfOfSplitNode = positionNode.splitText(positionOffset);
    }
  } else {
    // Here we ensure positionNode is the last node in the first half of the
    // resulting tree.
    if (positionOffset) {
      // Use offset as an index in to childNodes.
      positionNode = positionNode.childNodes[positionOffset - 1];
    } else {
      // In this case, positionNode would be the last node in the first half
      // of the tree, but we actually want to move it to the second half.
      // Therefore we set secondHalfOfSplitNode to the same node.
      positionNode = secondHalfOfSplitNode = positionNode.firstChild ||
          positionNode;
    }
  }

  // Create second half of the tree.
  var secondHalf = goog.editor.node.splitDomTreeAt(
      positionNode, secondHalfOfSplitNode, opt_root);

  if (textSplit) {
    // Join secondHalfOfSplitNode and its right text siblings together and
    // then replace leading NonNbspWhiteSpace with a Nbsp.  If
    // secondHalfOfSplitNode has a right sibling that isn't a text node,
    // then we can leave secondHalfOfSplitNode empty.
    secondHalfOfSplitNode =
        goog.editor.plugins.TagOnEnterHandler.joinTextNodes_(
            secondHalfOfSplitNode, true);
    goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_(
        secondHalfOfSplitNode, true, !!secondHalfOfSplitNode.nextSibling);

    // Join positionNode and its left text siblings together and then replace
    // trailing NonNbspWhiteSpace with a Nbsp.
    var firstHalf = goog.editor.plugins.TagOnEnterHandler.joinTextNodes_(
        positionNode, false);
    goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_(
        firstHalf, false, false);
  }

  return secondHalf;
};


/**
 * Splits the DOM tree around the given node and returns the node containing
 * second half of the tree, which is appended after the old node.  The first
 * half of the tree is modified, but not removed from the DOM.
 * @param {Node} positionNode Node to split at.
 * @param {number} positionOffset Offset into positionNode to split at.  If
 *     positionNode is a text node, this offset is an offset in to the text
 *     content of that node.  Otherwise, positionOffset is an offset in to
 *     the childNodes array.  All elements with child index of  positionOffset
 *     or greater will be moved to the second half.  If positionNode is an
 *     empty element, the dom will be split at that element, with positionNode
 *     ending up in the second half.  positionOffset must be 0 in this case.
 * @param {Node} node Node to split.
 * @return {Node} The node containing the second half of the tree.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.splitDomAndAppend_ = function(
    positionNode, positionOffset, node) {
  var newNode = goog.editor.plugins.TagOnEnterHandler.splitDom_(
      positionNode, positionOffset, node);
  goog.dom.insertSiblingAfter(newNode, node);
  return newNode;
};


/**
 * Joins node and its adjacent text nodes together.
 * @param {Node} node The node to start joining.
 * @param {boolean} moveForward Determines whether to join left siblings (false)
 *     or right siblings (true).
 * @return {Node} The joined text node.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.joinTextNodes_ = function(node,
    moveForward) {
  if (node && node.nodeName == '#text') {
    var nextNodeFn = moveForward ? 'nextSibling' : 'previousSibling';
    var prevNodeFn = moveForward ? 'previousSibling' : 'nextSibling';
    var nodeValues = [node.nodeValue];
    while (node[nextNodeFn] &&
           node[nextNodeFn].nodeType == goog.dom.NodeType.TEXT) {
      node = node[nextNodeFn];
      nodeValues.push(node.nodeValue);
      goog.dom.removeNode(node[prevNodeFn]);
    }
    if (!moveForward) {
      nodeValues.reverse();
    }
    node.nodeValue = nodeValues.join('');
  }
  return node;
};


/**
 * Replaces leading or trailing spaces of a text node to a single Nbsp.
 * @param {Node} textNode The text node to search and replace white spaces.
 * @param {boolean} fromStart Set to true to replace leading spaces, false to
 *     replace trailing spaces.
 * @param {boolean} isLeaveEmpty Set to true to leave the node empty if the
 *     text node was empty in the first place, otherwise put a Nbsp into the
 *     text node.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_ = function(
    textNode, fromStart, isLeaveEmpty) {
  var regExp = fromStart ? / ^[\t\r\n]+/ : /[ \t\r\n]+$/;
  textNode.nodeValue = textNode.nodeValue.replace(regExp,
                                                  goog.string.Unicode.NBSP);

  if (!isLeaveEmpty && textNode.nodeValue == '') {
    textNode.nodeValue = goog.string.Unicode.NBSP;
  }
};


/**
 * Finds the first A element in a traversal from the input node.  The input
 * node itself is not included in the search.
 * @param {Node} node The node to start searching from.
 * @param {boolean=} opt_useFirstChild Whether to traverse along the first child
 *     (true) or last child (false).
 * @return {Node} The first anchor node found in the search, or null if none
 *     was found.
 * @private
 */
goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_ = function(node,
    opt_useFirstChild) {
  while ((node = opt_useFirstChild ? node.firstChild : node.lastChild) &&
         node.tagName != goog.dom.TagName.A) {
    // Do nothing - advancement is handled in the condition.
  }
  return node;
};
