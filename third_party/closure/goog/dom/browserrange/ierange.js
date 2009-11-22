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
 * @fileoverview Definition of the IE browser specific range wrapper.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 */


goog.provide('goog.dom.browserrange.IeRange');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.NodeIterator');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.TagName');
goog.require('goog.dom.browserrange.AbstractRange');
goog.require('goog.iter');
goog.require('goog.iter.StopIteration');
goog.require('goog.string');


/**
 * The constructor for IE specific browser ranges.
 * @param {TextRange} range The range object.
 * @param {Document} doc The document the range exists in.
 * @constructor
 * @extends {goog.dom.browserrange.AbstractRange}
 */
goog.dom.browserrange.IeRange = function(range, doc) {
  /**
   * The browser range object this class wraps.
   * @type {TextRange}
   * @private
   */
  this.range_ = range;

  /**
   * The document the range exists in.
   * @type {Document}
   * @private
   */
  this.doc_ = doc;
};
goog.inherits(goog.dom.browserrange.IeRange,
    goog.dom.browserrange.AbstractRange);



/**
 * Logging object.
 * @type {goog.debug.Logger}
 * @private
 */
goog.dom.browserrange.IeRange.logger_ =
    goog.debug.Logger.getLogger('goog.dom.browserrange.IeRange');


/**
 * Returns a browser range spanning the given node's contents.
 * @param {Node} node The node to select.
 * @return {TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNode_ = function(node) {
  var nodeRange = goog.dom.getOwnerDocument(node).body.createTextRange();
  if (node.nodeType == goog.dom.NodeType.ELEMENT) {
    // Elements are easy.
    nodeRange.moveToElementText(node);
  } else {
    // Text nodes are hard.
    // Compute the offset from the nearest element related position.
    var offset = 0;
    var sibling = node;
    while (sibling = sibling.previousSibling) {
      var nodeType = sibling.nodeType;
      if (nodeType == goog.dom.NodeType.TEXT) {
        offset += sibling.length;
      } else if (nodeType == goog.dom.NodeType.ELEMENT) {
        // Move to the space after this element.
        nodeRange.moveToElementText(sibling);
        break;
      }
    }

    if (!sibling) {
      nodeRange.moveToElementText(node.parentNode);
    }

    nodeRange.collapse(!sibling);

    if (offset) {
      nodeRange.move('character', offset);
    }

    nodeRange.moveEnd('character', node.length);
  }

  return nodeRange;
};


/**
 * Returns a browser range spanning the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNodes_ = function(startNode,
    startOffset, endNode, endOffset) {
  // Create a range starting at the correct start position.
  var child, collapse = false;
  if (startNode.nodeType == goog.dom.NodeType.ELEMENT) {
    if (startOffset > startNode.childNodes.length) {
      goog.dom.browserrange.IeRange.logger_.severe(
          'Cannot have startOffset > startNode child count');
    }
    child = startNode.childNodes[startOffset];
    collapse = !child;
    startNode = child || startNode;
    startOffset = 0;
  }
  var leftRange = goog.dom.browserrange.IeRange.
      getBrowserRangeForNode_(startNode);
  if (startOffset) {
    leftRange.move('character', startOffset);
  }
  if (collapse) {
    leftRange.collapse(false);
  }

  // Create a range that ends at the right position.
  collapse = false;
  if (endNode.nodeType == goog.dom.NodeType.ELEMENT) {
    if (startOffset > startNode.childNodes.length) {
      goog.dom.browserrange.IeRange.logger_.severe(
          'Cannot have endOffset > endNode child count');
    }
    child = endNode.childNodes[endOffset];
    endNode = child || endNode;
    endOffset = 0;
    collapse = !child;
  }
  var rightRange = goog.dom.browserrange.IeRange.
      getBrowserRangeForNode_(endNode);
  rightRange.collapse(!collapse);
  if (endOffset) {
    rightRange.moveEnd('character', endOffset);
  }

  // Merge and return.
  leftRange.setEndPoint('EndToEnd', rightRange);
  return leftRange;
};


/**
 * Create a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.IeRange} An IE range wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodeContents = function(node) {
  var range = new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNode_(node),
      goog.dom.getOwnerDocument(node));
  range.parentNode_ = node;
  return range;
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNodes_(startNode,
          startOffset, endNode, endOffset),
      goog.dom.getOwnerDocument(startNode));
};


// Even though goog.dom.TextRange does similar caching to below, keeping these
// caches allows for better performance in the get*Offset methods.


/**
 * Lazy cache of the node containing the entire selection.
 * @type {Node?}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.parentNode_ = null;


/**
 * Lazy cache of the node containing the start of the selection.
 * @type {Node?}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.startNode_ = null;


/**
 * Lazy cache of the node containing the end of the selection.
 * @type {Node?}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.endNode_ = null;



/**
 * @return {goog.dom.browserrange.IeRange} A clone of this range.
 */
goog.dom.browserrange.IeRange.prototype.clone = function() {
  var range = new goog.dom.browserrange.IeRange(
      this.range_.duplicate(), this.doc_);
  range.parentNode_ = this.parentNode_;
  range.startNode_ = this.startNode_;
  range.endNode_ = this.endNode_;
  return range;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getBrowserRange = function() {
  return this.range_;
};


/**
 * Clears the cached values for containers.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.clearCachedValues_ = function() {
  this.parentNode_ = this.startNode_ = this.endNode_ = null;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getContainer = function() {
  if (!this.parentNode_) {
    var selectText = this.range_.text;

    // If the selection ends with spaces, we need to remove these to get the
    // parent container of only the real contents.  This is to get around IE's
    // inconsistency where it selects the spaces after a word when you double
    // click, but leaves out the spaces during execCommands.
    // NOTE: this relies on the fact that 'foo'.charAt(-1) == ''
    for (var i = 1; selectText.charAt(selectText.length - i) == ' '; i++) {
      this.range_.moveEnd('character', -1);
    }

    // Get the parent node.  This should be the end, but alas, it is not.
    var parent = this.range_.parentElement();

    // Deal with selection bug where IE thinks one of the selection's children
    // is actually the selection's parent. Relies on the assumption that the
    // HTML text of the parent container is longer than the length of the
    // selection's HTML text.

    // Also note IE will sometimes insert \r and \n whitespace, which should be
    // disregarded. Otherwise the loop may run too long and return wrong parent
    var htmlText = goog.string.stripNewlines(this.range_.htmlText);
    while (htmlText.length >
           goog.string.stripNewlines(parent.outerHTML).length) {
      parent = parent.parentNode;
    }

    // Deal with IE's selecting the outer tags when you double click
    // If the innerText is the same, then we just want the inner node
    while (parent.childNodes.length == 1 &&
           parent.innerText == goog.dom.browserrange.IeRange.getNodeText_(
               parent.firstChild)) {
      // It doesn't make sense for an image to be returned as a container,
      // so check if the child is an image and return the parent instead.
      if (parent.firstChild.tagName == 'IMG') {
        break;
      }
      parent = parent.firstChild;
    }

    // If the selection is empty, we may need to do extra work to position it
    // properly.
    if (selectText.length == 0) {
      parent = this.findDeepestContainer_(parent);
    }

    this.parentNode_ = parent;
  }

  return this.parentNode_;
};


/**
 * Helper method to find the deepest parent for this range, starting
 * the search from {@code node}, which must contain the range.
 * @param {Node} node The node to start the search from.
 * @return {Node} The deepest parent for this range.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.findDeepestContainer_ = function(node) {
  var childNodes = node.childNodes;
  for (var i = 0, len = childNodes.length; i < len; i++) {
    var child = childNodes[i];

    if (child.nodeType == goog.dom.NodeType.ELEMENT) {
      if (this.range_.inRange(
          goog.dom.browserrange.IeRange.getBrowserRangeForNode_(child))) {
        return this.findDeepestContainer_(child);
      }
    }
  }

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getStartNode = function() {
  return this.startNode_ ||
      (this.startNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.START));
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getStartOffset = function() {
  return this.getOffset_(goog.dom.RangeEndpoint.START);
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getEndNode = function() {
  return this.endNode_ ||
      (this.endNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.END));
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getEndOffset = function() {
  return this.getOffset_(goog.dom.RangeEndpoint.END);
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.containsRange = function(range,
    opt_allowPartial) {
  return this.containsBrowserRange(range.range_, opt_allowPartial);
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.compareBrowserRangeEndpoints =
    function(range, thisEndpoint, otherEndpoint) {
  return this.range_.compareEndPoints(
      (thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End') +
      'To' +
      (otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End'),
      range);
};


/**
 * Recurses to find the correct node for the given endpoint.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the node for.
 * @param {Node} opt_node Optional node to start the search from.
 * @return {Node} The deepest node containing the endpoint.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getEndpointNode_ = function(endpoint,
    opt_node) {

  /** @type {Node} */
  var node = opt_node || this.getContainer();

  // If we're at a leaf in the DOM, we're done.
  if (!node || !node.firstChild) {
    // Special case to ensure we match W3c behavior at BR edges.
    if (endpoint == goog.dom.RangeEndpoint.END && node.previousSibling &&
        node.previousSibling.tagName == goog.dom.TagName.BR &&
        this.getOffset_(endpoint, node) == 0) {
      node = node.previousSibling;
    }

    // To be consistent with other browsers, don't return BRs.
    return node.tagName == 'BR' ? node.parentNode : node;
  }

  // Find the first/last child that overlaps the selection
  var child = endpoint == goog.dom.RangeEndpoint.START ?
      node.firstChild : node.lastChild;

  while (child) {
    if (this.containsNode(child, true)) {
      // If this child overlaps the selection, recurse down to find the
      // first/last child the next level down that overlaps the selection.
      return this.getEndpointNode_(endpoint, child);
    }

    child = endpoint == goog.dom.RangeEndpoint.START ?
        child.nextSibling : child.previousSibling;
  }

  // None of the children of this node overlapped the selection, that means
  // the selection starts/ends in this node directly.
  return node;
};


/**
 * Returns the offset into the start/end container.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the offset for.
 * @param {Node} opt_container The container to get the offset relative to.
 *     Defaults to the value returned by getStartNode/getEndNode.
 * @return {number} The offset.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getOffset_ = function(endpoint,
    opt_container) {
  var container = opt_container || (endpoint == goog.dom.RangeEndpoint.START ?
      this.getStartNode() : this.getEndNode());

  if (container.nodeType == goog.dom.NodeType.ELEMENT) {
    // Find the first/last child that overlaps the selection
    var children = container.childNodes;
    var len = children.length;
    var i = endpoint == goog.dom.RangeEndpoint.START ? 0 : len - 1;

    // We find the index in the child array of the endpoint of the selection.
    while (i >= 0 && i < len) {
      var child = children[i];

      // Stop looping when we reach the edge of the selection.
      if (this.containsNode(child, true)) {
        // Special case to ensure we match W3c behavior at BR edges.
        if (endpoint == goog.dom.RangeEndpoint.END && child.previousSibling &&
            child.previousSibling.tagName == goog.dom.TagName.BR &&
            this.getOffset_(endpoint, child) == 0) {
          i--;
        }

        break;
      }

      // Update the child and the index.
      i += endpoint == goog.dom.RangeEndpoint.START ? 1 : -1;
    }

    // When starting from the end in an empty container, we erroneously return
    // -1: fix this to return 0.
    return i == -1 ? 0 : i;
  } else {
    // Get a temporary range object.
    var range = this.range_.duplicate();

    // Create a range that selects the entire container.
    var nodeRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(
        container);

    // Now, intersect our range with the container range - this should give us
    // the part of our selection that is in the container.
    range.setEndPoint(endpoint == goog.dom.RangeEndpoint.START ? 'EndToEnd' :
                      'StartToStart', nodeRange);

    var rangeLength = range.text.length;
    return endpoint == goog.dom.RangeEndpoint.END ? rangeLength :
           container.length - rangeLength;
  }
};


/**
 * Returns the text of the given node.  Uses IE specific properties.
 * @param {Node} node The node to retrieve the text of.
 * @return {string} The node's text.
 * @private
 */
goog.dom.browserrange.IeRange.getNodeText_ = function(node) {
  return node.nodeType == goog.dom.NodeType.TEXT ?
             node.nodeValue : node.innerText;
};


/**
 * Tests whether this range is valid (i.e. whether its endpoints are still in
 * the document).  A range becomes invalid when, after this object was created,
 * either one or both of its endpoints are removed from the document.  Use of
 * an invalid range can lead to runtime errors, particularly in IE.
 * @return {boolean} Whether the range is valid.
 */
goog.dom.browserrange.IeRange.prototype.isRangeInDocument = function() {
  var range = this.doc_.body.createTextRange();
  range.moveToElementText(this.doc_.body);

  return this.containsBrowserRange(range, true);
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.isCollapsed = function() {
  return this.range_.text == '';
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getText = function() {
  return this.range_.text;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getValidHtml = function() {
  return this.range_.htmlText;
};


// SELECTION MODIFICATION


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.select = function(opt_reverse) {
  // IE doesn't support programmatic reversed selections.
  this.range_.select();
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.removeContents = function() {
  if (this.range_.htmlText) {
    // Store some before-removal state.
    var startNode = this.getStartNode();
    var endNode = this.getEndNode();
    var oldText = this.range_.text;

    // IE sometimes deletes nodes unrelated to the selection.  This trick fixes
    // that problem most of the time.  Even though it looks like a no-op, it is
    // somehow changing IE's internal state such that empty unrelated nodes are
    // no longer deleted.
    var clone = this.range_.duplicate();
    clone.moveStart('character', 1);
    clone.moveStart('character', -1);

    // However, sometimes when the range is empty, moving the start back and
    // forth ends up changing the range.  This indicates a case we need to
    // handle manually.
    if (clone.text != oldText) {
      // Delete all nodes entirely contained in the range.
      var iter = new goog.dom.NodeIterator(startNode, false, true);
      var toDelete = [];
      goog.iter.forEach(iter, function(node) {
        // Any text node we encounter here is by definition contained entirely
        // in the range.
        if (node.nodeType != goog.dom.NodeType.TEXT &&
            this.containsNode(node)) {
          toDelete.push(node);
          iter.skipTag();
        }
        if (node == endNode) {
          throw goog.iter.StopIteration;
        }
      });
      this.collapse(true);
      goog.array.forEach(toDelete, goog.dom.removeNode);

      this.clearCachedValues_();
      return;
    }

    // Outside of the unfortunate cases where we have to handle deletion
    // manually, we can use the browser's native deletion code.
    this.range_ = clone;
    this.range_.text = '';
    this.clearCachedValues_();

    // Unfortunately, when deleting a portion of a single text node, IE creates
    // an extra text node unlike other browsers which just change the text in
    // the node.  We normalize for that behavior here, making IE behave like all
    // the other browsers.
    var newStartNode = this.getStartNode();
    var newStartOffset = this.getStartOffset();
    /** @preserveTry */
    try {
      var sibling = startNode.nextSibling;
      if (startNode == endNode && startNode.parentNode &&
          startNode.nodeType == goog.dom.NodeType.TEXT &&
          sibling && sibling.nodeType == goog.dom.NodeType.TEXT) {
        startNode.nodeValue += sibling.nodeValue;
        goog.dom.removeNode(sibling);

        // Make sure to reselect the appropriate position.
        this.range_ = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(
            newStartNode);
        this.range_.move('character', newStartOffset);
        this.clearCachedValues_();
      }
    } catch (e) {
      // IE throws errors on orphaned nodes.
    }
  }
};

/**
 * @param {TextRange} range The range to get a dom helper for.
 * @return {goog.dom.DomHelper} A dom helper for the document the range
 *     resides in.
 * @private
 */
goog.dom.browserrange.IeRange.getDomHelper_ = function(range) {
  return goog.dom.getDomHelper(range.parentElement());
};


/**
 * Pastes the given element into the given range, returning the resulting
 * element.
 * @param {TextRange} range The range to paste into.
 * @param {Element} element The node to insert a copy of.
 * @param {goog.dom.DomHelper} opt_domHelper DOM helper object for the document
 *     the range resides in.
 * @return {Element} The resulting copy of element.
 * @private
 */
goog.dom.browserrange.IeRange.pasteElement_ = function(range, element,
    opt_domHelper) {
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(
      range);

  // Make sure the node has a unique id.
  var id;
  var originalId = id = element.id;
  if (!id) {
    id = element.id = goog.string.createUniqueString();
  }

  // Insert (a clone of) the node.
  range.pasteHTML(element.outerHTML);

  // Pasting the outerHTML of the modified element into the document creates
  // a clone of the element argument.  We want to return a reference to the
  // clone, not the original.  However we need to remove the temporary ID
  // first.
  element = opt_domHelper.$(id);

  // If element is null here, we failed.
  if (element) {
    if (!originalId) {
      element.removeAttribute('id');
    }
  }

  return element;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.surroundContents = function(element) {
  // Make sure the element is detached from the document.
  goog.dom.removeNode(element);

  // IE more or less guarantees that range.htmlText is well-formed & valid.
  element.innerHTML = this.range_.htmlText;
  element = goog.dom.browserrange.IeRange.pasteElement_(this.range_, element);

  // If element is null here, we failed.
  if (element) {
    this.range_.moveToElementText(element);
  }

  this.clearCachedValues_();

  return element;
};


/**
 * Internal handler for inserting a node.
 * @param {TextRange} clone A clone of this range's browser range object.
 * @param {Node} node The node to insert.
 * @param {boolean} before Whether to insert the node before or after the range.
 * @param {goog.dom.DomHelper} opt_domHelper The dom helper to use.
 * @return {Node} The resulting copy of node.
 * @private
 */
goog.dom.browserrange.IeRange.insertNode_ = function(clone, node,
    before, opt_domHelper) {
  // Get a DOM helper.
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(
      clone);

 // If it's not an element, wrap it in one.
  var isNonElement;
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    isNonElement = true;
    node = opt_domHelper.createDom(goog.dom.TagName.DIV, null, node);
  }

  clone.collapse(before);
  node = goog.dom.browserrange.IeRange.pasteElement_(clone,
      /** @type {Element} */ (node), opt_domHelper);

  // If we didn't want an element, unwrap the element and return the node.
  if (isNonElement) {
    // pasteElement_() may have returned a copy of the wrapper div, and the
    // node it wraps could also be a new copy. So we must extract that new
    // node from the new wrapper.
    var newNonElement = node.firstChild;
    opt_domHelper.flattenElement(node);
    node = newNonElement;
  }

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.insertNode = function(node, before) {
  var output = goog.dom.browserrange.IeRange.insertNode_(
      this.range_.duplicate(), node, before);
  this.clearCachedValues_();
  return output;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.surroundWithNodes = function(
    startNode, endNode) {
  var clone1 = this.range_.duplicate();
  var clone2 = this.range_.duplicate();
  goog.dom.browserrange.IeRange.insertNode_(clone1, startNode, true);
  goog.dom.browserrange.IeRange.insertNode_(clone2, endNode, false);

  this.clearCachedValues_();
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.collapse = function(toStart) {
  this.range_.collapse(toStart);

  if (toStart) {
    this.endNode_ = this.startNode_;
  } else {
    this.startNode_ = this.endNode_;
  }
};
