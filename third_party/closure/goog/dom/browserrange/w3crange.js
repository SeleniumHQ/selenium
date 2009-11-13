// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of the W3C spec following range wrapper.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 */


goog.provide('goog.dom.browserrange.W3cRange');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.browserrange.AbstractRange');
goog.require('goog.string');


/**
 * The constructor for W3C specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.AbstractRange}
 */
goog.dom.browserrange.W3cRange = function(range) {
  this.range_ = range;
};
goog.inherits(goog.dom.browserrange.W3cRange,
              goog.dom.browserrange.AbstractRange);


/**
 * Returns a browser range spanning the given node's contents.
 * @param {Node} node The node to select.
 * @return {Range} A browser range spanning the node's contents.
 * @protected
 */
goog.dom.browserrange.W3cRange.getBrowserRangeForNode = function(node) {
  var nodeRange = goog.dom.getOwnerDocument(node).createRange();

  if (node.nodeType == goog.dom.NodeType.TEXT) {
    nodeRange.setStart(node, 0);
    nodeRange.setEnd(node, node.length);
  } else {
    var tempNode, leaf = node;
    while (tempNode = leaf.firstChild) {
      leaf = tempNode;
    }
    nodeRange.setStart(leaf, 0);

    leaf = node;
    while (tempNode = leaf.lastChild) {
      leaf = tempNode;
    }
    nodeRange.setEnd(leaf, leaf.nodeType == goog.dom.NodeType.ELEMENT ?
        leaf.childNodes.length : leaf.length);
  }

  return nodeRange;
};


/**
 * Returns a browser range spanning the given nodes.
 * @param {Node} startNode The node to start with - should not be a BR.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with - should not be a BR.
 * @param {number} endOffset The offset within the end node.
 * @return {Range} A browser range spanning the node's contents.
 * @protected
 */
goog.dom.browserrange.W3cRange.getBrowserRangeForNodes = function(startNode,
    startOffset, endNode, endOffset) {
  // Create and return the range.
  var nodeRange = goog.dom.getOwnerDocument(startNode).createRange();
  nodeRange.setStart(startNode, startOffset);
  nodeRange.setEnd(endNode, endOffset);
  return nodeRange;
};


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.W3cRange} A Gecko range wrapper object.
 */
goog.dom.browserrange.W3cRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.W3cRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.W3cRange} A wrapper object.
 */
goog.dom.browserrange.W3cRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.W3cRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};


/**
 * @return {goog.dom.browserrange.W3cRange} A clone of this range.
 */
goog.dom.browserrange.W3cRange.prototype.clone = function() {
  return new this.constructor(this.range_.cloneRange());
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getBrowserRange = function() {
  return this.range_;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getContainer = function() {
  return this.range_.commonAncestorContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getStartNode = function() {
  return this.range_.startContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getStartOffset = function() {
  return this.range_.startOffset;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getEndNode = function() {
  return this.range_.endContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getEndOffset = function() {
  return this.range_.endOffset;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.compareBrowserRangeEndpoints =
    function(range, thisEndpoint, otherEndpoint) {
  return this.range_.compareBoundaryPoints(
      otherEndpoint == goog.dom.RangeEndpoint.START ?
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_START :
              goog.global['Range'].START_TO_END) :
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].END_TO_START :
              goog.global['Range'].END_TO_END),
      /** @type {Range} */ (range));
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.isCollapsed = function() {
  return this.range_.collapsed;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getText = function() {
  return this.range_.toString();
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getValidHtml = function() {
  var div = goog.dom.getDomHelper(this.range_.startContainer).createDom('div');
  div.appendChild(this.range_.cloneContents());
  var result = div.innerHTML;

  if (goog.string.startsWith(result, '<') ||
      !this.isCollapsed() && this.getStartNode() == this.getEndNode()) {
    // We attempt to mimic IE, which returns no containing element when a
    // single text node is selected, does return the containing element when
    // the selection is empty, and does return the element when multiple nodes
    // are selected.
    return result;
  }

  var container = this.getContainer();
  container = container.nodeType == goog.dom.NodeType.ELEMENT ? container :
      container.parentNode;

  var html = goog.dom.getOuterHtml(
      /** @type {Element} */ (container.cloneNode(false)));
  return html.replace('>', '>' + result);
};


// SELECTION MODIFICATION


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.select = function(reverse) {
  var win = goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode()));
  this.selectInternal(win.getSelection(), reverse);
};


/**
 * Select this range.
 * @param {Selection} selection Browser selection object.
 * @param {*} reverse Whether to select this range in reverse.
 * @protected
 */
goog.dom.browserrange.W3cRange.prototype.selectInternal = function(selection,
                                                                   reverse) {
  // Browser-specific tricks are needed to create reversed selections
  // programatically. For this generic W3C codepath, ignore the reverse
  // parameter.
  selection.removeAllRanges();
  selection.addRange(this.range_);
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.removeContents = function() {
  var range = this.range_;
  range.extractContents();

  if (range.startContainer.hasChildNodes()) {
    // Remove any now empty nodes surrounding the extracted contents.
    var rangeStartContainer =
        range.startContainer.childNodes[range.startOffset];
    if (rangeStartContainer) {
      var rangePrevious = rangeStartContainer.previousSibling;

      if (goog.dom.getRawTextContent(rangeStartContainer) == '') {
        goog.dom.removeNode(rangeStartContainer);
      }

      if (rangePrevious && goog.dom.getRawTextContent(rangePrevious) == '') {
        goog.dom.removeNode(rangePrevious);
      }
    }
  }
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.surroundContents = function(element) {
  this.range_.surroundContents(element);
  return element;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.insertNode = function(node, before) {
  var range = this.range_.cloneRange();
  range.collapse(before);
  range.insertNode(node);
  range.detach();

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.surroundWithNodes = function(
    startNode, endNode) {
  var win = goog.dom.getWindow(
      goog.dom.getOwnerDocument(this.getStartNode()));
  var selectionRange = goog.dom.Range.createFromWindow(win);
  if (selectionRange) {
    var sNode = selectionRange.getStartNode();
    var eNode = selectionRange.getEndNode();
    var sOffset = selectionRange.getStartOffset();
    var eOffset = selectionRange.getEndOffset();
  }

  var clone1 = this.range_.cloneRange();
  var clone2 = this.range_.cloneRange();

  clone1.collapse(false);
  clone2.collapse(true);

  clone1.insertNode(endNode);
  clone2.insertNode(startNode);

  clone1.detach();
  clone2.detach();

  if (selectionRange) {
    // There are 4 ways that surroundWithNodes can wreck the saved
    // selection object. All of them happen when an inserted node splits
    // a text node, and one of the end points of the selection was in the
    // latter half of that text node.
    //
    // Clients of this library should use saveUsingCarets to avoid this
    // problem. Unfortunately, saveUsingCarets uses this method, so that's
    // not really an option for us. :( We just recompute the offsets.
    var isInsertedNode = function(n) {
      return n == startNode || n == endNode;
    };
    if (sNode.nodeType == goog.dom.NodeType.TEXT) {
      while (sOffset > sNode.length) {
        sOffset -= sNode.length;
        do {
          sNode = sNode.nextSibling;
        } while (isInsertedNode(sNode));
      }
    }

    if (eNode.nodeType == goog.dom.NodeType.TEXT) {
      while (eOffset > eNode.length) {
        eOffset -= eNode.length;
        do {
          eNode = eNode.nextSibling;
        } while (isInsertedNode(eNode));
      }
    }

    goog.dom.Range.createFromNodes(
        sNode, /** @type {number} */ (sOffset),
        eNode, /** @type {number} */ (eOffset)).select();
  }
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.collapse = function(toStart) {
  this.range_.collapse(toStart);
};
