// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the IE browser specific range wrapper.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.browserrange.IeRange');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.TagName');
goog.require('goog.dom.browserrange.AbstractRange');
goog.require('goog.log');
goog.require('goog.string');



/**
 * The constructor for IE specific browser ranges.
 * @param {TextRange} range The range object.
 * @param {Document} doc The document the range exists in.
 * @constructor
 * @extends {goog.dom.browserrange.AbstractRange}
 * @final
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
 * @type {goog.log.Logger}
 * @private
 */
goog.dom.browserrange.IeRange.logger_ =
    goog.log.getLogger('goog.dom.browserrange.IeRange');


/**
 * Returns a browser range spanning the given node's contents.
 * @param {Node} node The node to select.
 * @return {!TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNode_ = function(node) {
  var nodeRange = goog.dom.getOwnerDocument(node).body.createTextRange();
  if (node.nodeType == goog.dom.NodeType.ELEMENT) {
    // Elements are easy.
    nodeRange.moveToElementText(node);
    // Note(user) : If there are no child nodes of the element, the
    // range.htmlText includes the element's outerHTML. The range created above
    // is not collapsed, and should be collapsed explicitly.
    // Example : node = <div></div>
    // But if the node is sth like <br>, it shouldnt be collapsed.
    if (goog.dom.browserrange.canContainRangeEndpoint(node) &&
        !node.childNodes.length) {
      nodeRange.collapse(false);
    }
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
 * @return {!TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNodes_ = function(startNode,
    startOffset, endNode, endOffset) {
  // Create a range starting at the correct start position.
  var child, collapse = false;
  if (startNode.nodeType == goog.dom.NodeType.ELEMENT) {
    if (startOffset > startNode.childNodes.length) {
      goog.log.error(goog.dom.browserrange.IeRange.logger_,
          'Cannot have startOffset > startNode child count');
    }
    child = startNode.childNodes[startOffset];
    collapse = !child;
    startNode = child || startNode.lastChild || startNode;
    startOffset = 0;
  }
  var leftRange = goog.dom.browserrange.IeRange.
      getBrowserRangeForNode_(startNode);

  // This happens only when startNode is a text node.
  if (startOffset) {
    leftRange.move('character', startOffset);
  }


  // The range movements in IE are still an approximation to the standard W3C
  // behavior, and IE has its trickery when it comes to htmlText and text
  // properties of the range. So we short-circuit computation whenever we can.
  if (startNode == endNode && startOffset == endOffset) {
    leftRange.collapse(true);
    return leftRange;
  }

  // This can happen only when the startNode is an element, and there is no node
  // at the given offset. We start at the last point inside the startNode in
  // that case.
  if (collapse) {
    leftRange.collapse(false);
  }

  // Create a range that ends at the right position.
  collapse = false;
  if (endNode.nodeType == goog.dom.NodeType.ELEMENT) {
    if (endOffset > endNode.childNodes.length) {
      goog.log.error(goog.dom.browserrange.IeRange.logger_,
          'Cannot have endOffset > endNode child count');
    }
    child = endNode.childNodes[endOffset];
    endNode = child || endNode.lastChild || endNode;
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
 * @return {!goog.dom.browserrange.IeRange} An IE range wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodeContents = function(node) {
  var range = new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNode_(node),
      goog.dom.getOwnerDocument(node));

  if (!goog.dom.browserrange.canContainRangeEndpoint(node)) {
    range.startNode_ = range.endNode_ = range.parentNode_ = node.parentNode;
    range.startOffset_ = goog.array.indexOf(range.parentNode_.childNodes, node);
    range.endOffset_ = range.startOffset_ + 1;
  } else {
    // Note(user) : Emulate the behavior of W3CRange - Go to deepest possible
    // range containers on both edges. It seems W3CRange did this to match the
    // IE behavior, and now it is a circle. Changing W3CRange may break clients
    // in all sorts of ways.
    var tempNode, leaf = node;
    while ((tempNode = leaf.firstChild) &&
           goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
      leaf = tempNode;
    }
    range.startNode_ = leaf;
    range.startOffset_ = 0;

    leaf = node;
    while ((tempNode = leaf.lastChild) &&
           goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
      leaf = tempNode;
    }
    range.endNode_ = leaf;
    range.endOffset_ = leaf.nodeType == goog.dom.NodeType.ELEMENT ?
                       leaf.childNodes.length : leaf.length;
    range.parentNode_ = node;
  }
  return range;
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {!goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  var range = new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNodes_(startNode,
          startOffset, endNode, endOffset),
      goog.dom.getOwnerDocument(startNode));
  range.startNode_ = startNode;
  range.startOffset_ = startOffset;
  range.endNode_ = endNode;
  range.endOffset_ = endOffset;
  return range;
};


// Even though goog.dom.TextRange does similar caching to below, keeping these
// caches allows for better performance in the get*Offset methods.


/**
 * Lazy cache of the node containing the entire selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.parentNode_ = null;


/**
 * Lazy cache of the node containing the start of the selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.startNode_ = null;


/**
 * Lazy cache of the node containing the end of the selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.endNode_ = null;


/**
 * Lazy cache of the offset in startNode_ where this range starts.
 * @type {number}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.startOffset_ = -1;


/**
 * Lazy cache of the offset in endNode_ where this range ends.
 * @type {number}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.endOffset_ = -1;


/**
 * @return {!goog.dom.browserrange.IeRange} A clone of this range.
 * @override
 */
goog.dom.browserrange.IeRange.prototype.clone = function() {
  var range = new goog.dom.browserrange.IeRange(
      this.range_.duplicate(), this.doc_);
  range.parentNode_ = this.parentNode_;
  range.startNode_ = this.startNode_;
  range.endNode_ = this.endNode_;
  return range;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getBrowserRange = function() {
  return this.range_;
};


/**
 * Clears the cached values for containers.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.clearCachedValues_ = function() {
  this.parentNode_ = this.startNode_ = this.endNode_ = null;
  this.startOffset_ = this.endOffset_ = -1;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getContainer = function() {
  if (!this.parentNode_) {
    var selectText = this.range_.text;

    // If the selection ends with spaces, we need to remove these to get the
    // parent container of only the real contents.  This is to get around IE's
    // inconsistency where it selects the spaces after a word when you double
    // click, but leaves out the spaces during execCommands.
    var range = this.range_.duplicate();
    // We can't use goog.string.trimRight, as that will remove other whitespace
    // too.
    var rightTrimmedSelectText = selectText.replace(/ +$/, '');
    var numSpacesAtEnd = selectText.length - rightTrimmedSelectText.length;
    if (numSpacesAtEnd) {
      range.moveEnd('character', -numSpacesAtEnd);
    }

    // Get the parent node.  This should be the end, but alas, it is not.
    var parent = range.parentElement();

    var htmlText = range.htmlText;
    var htmlTextLen = goog.string.stripNewlines(htmlText).length;
    if (this.isCollapsed() && htmlTextLen > 0) {
      return (this.parentNode_ = parent);
    }

    // Deal with selection bug where IE thinks one of the selection's children
    // is actually the selection's parent. Relies on the assumption that the
    // HTML text of the parent container is longer than the length of the
    // selection's HTML text.

    // Also note IE will sometimes insert \r and \n whitespace, which should be
    // disregarded. Otherwise the loop may run too long and return wrong parent
    while (htmlTextLen > goog.string.stripNewlines(parent.outerHTML).length) {
      parent = parent.parentNode;
    }

    // Deal with IE's selecting the outer tags when you double click
    // If the innerText is the same, then we just want the inner node
    while (parent.childNodes.length == 1 &&
           parent.innerText == goog.dom.browserrange.IeRange.getNodeText_(
               parent.firstChild)) {
      // A container should be an element which can have children or a text
      // node. Elements like IMG, BR, etc. can not be containers.
      if (!goog.dom.browserrange.canContainRangeEndpoint(parent.firstChild)) {
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

    if (goog.dom.browserrange.canContainRangeEndpoint(child)) {
      var childRange =
          goog.dom.browserrange.IeRange.getBrowserRangeForNode_(child);
      var start = goog.dom.RangeEndpoint.START;
      var end = goog.dom.RangeEndpoint.END;

      // There are two types of erratic nodes where the range over node has
      // different htmlText than the node's outerHTML.
      // Case 1 - A node with magic &nbsp; child. In this case :
      //    nodeRange.htmlText shows &nbsp; ('<p>&nbsp;</p>), while
      //    node.outerHTML doesn't show the magic node (<p></p>).
      // Case 2 - Empty span. In this case :
      //    node.outerHTML shows '<span></span>'
      //    node.htmlText is just empty string ''.
      var isChildRangeErratic = (childRange.htmlText != child.outerHTML);

      // Moreover the inRange comparison fails only when the
      var isNativeInRangeErratic = this.isCollapsed() && isChildRangeErratic;

      // In case 2 mentioned above, childRange is also collapsed. So we need to
      // compare start of this range with both start and end of child range.
      var inChildRange = isNativeInRangeErratic ?
          (this.compareBrowserRangeEndpoints(childRange, start, start) >= 0 &&
              this.compareBrowserRangeEndpoints(childRange, start, end) <= 0) :
          this.range_.inRange(childRange);
      if (inChildRange) {
        return this.findDeepestContainer_(child);
      }
    }
  }

  return node;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getStartNode = function() {
  if (!this.startNode_) {
    this.startNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.START);
    if (this.isCollapsed()) {
      this.endNode_ = this.startNode_;
    }
  }
  return this.startNode_;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getStartOffset = function() {
  if (this.startOffset_ < 0) {
    this.startOffset_ = this.getOffset_(goog.dom.RangeEndpoint.START);
    if (this.isCollapsed()) {
      this.endOffset_ = this.startOffset_;
    }
  }
  return this.startOffset_;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getEndNode = function() {
  if (this.isCollapsed()) {
    return this.getStartNode();
  }
  if (!this.endNode_) {
    this.endNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.END);
  }
  return this.endNode_;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getEndOffset = function() {
  if (this.isCollapsed()) {
    return this.getStartOffset();
  }
  if (this.endOffset_ < 0) {
    this.endOffset_ = this.getOffset_(goog.dom.RangeEndpoint.END);
    if (this.isCollapsed()) {
      this.startOffset_ = this.endOffset_;
    }
  }
  return this.endOffset_;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.compareBrowserRangeEndpoints = function(
    range, thisEndpoint, otherEndpoint) {
  return this.range_.compareEndPoints(
      (thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End') +
      'To' +
      (otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End'),
      range);
};


/**
 * Recurses to find the correct node for the given endpoint.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the node for.
 * @param {Node=} opt_node Optional node to start the search from.
 * @return {Node} The deepest node containing the endpoint.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getEndpointNode_ = function(endpoint,
    opt_node) {

  /** @type {Node} */
  var node = opt_node || this.getContainer();

  // If we're at a leaf in the DOM, we're done.
  if (!node || !node.firstChild) {
    return node;
  }

  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END;
  var isStartEndpoint = endpoint == start;

  // Find the first/last child that overlaps the selection.
  // NOTE(user) : One of the children can be the magic &nbsp; node. This
  // node will have only nodeType property as valid and accessible. All other
  // dom related properties like ownerDocument, parentNode, nextSibling etc
  // cause error when accessed. Therefore use the for-loop on childNodes to
  // iterate.
  for (var j = 0, length = node.childNodes.length; j < length; j++) {
    var i = isStartEndpoint ? j : length - j - 1;
    var child = node.childNodes[i];
    var childRange;
    try {
      childRange = goog.dom.browserrange.createRangeFromNodeContents(child);
    } catch (e) {
      // If the child is the magic &nbsp; node, then the above will throw
      // error. The magic node exists only when editing using keyboard, so can
      // not add any unit test.
      continue;
    }
    var ieRange = childRange.getBrowserRange();

    // Case 1 : Finding end points when this range is collapsed.
    // Note that in case of collapsed range, getEnd{Node,Offset} call
    // getStart{Node,Offset}.
    if (this.isCollapsed()) {
      // Handle situations where caret is not in a text node. In such cases,
      // the adjacent child won't be a valid range endpoint container.
      if (!goog.dom.browserrange.canContainRangeEndpoint(child)) {
        // The following handles a scenario like <div><BR>[caret]<BR></div>,
        // where point should be (div, 1).
        if (this.compareBrowserRangeEndpoints(ieRange, start, start) == 0) {
          this.startOffset_ = this.endOffset_ = i;
          return node;
        }
      } else if (childRange.containsRange(this)) {
        // For collapsed range, we should invert the containsRange check with
        // childRange.
        return this.getEndpointNode_(endpoint, child);
      }

    // Case 2 - The first child encountered to have overlap this range is
    // contained entirely in this range.
    } else if (this.containsRange(childRange)) {
      // If it is an element which can not be a range endpoint container, the
      // current child offset can be used to deduce the endpoint offset.
      if (!goog.dom.browserrange.canContainRangeEndpoint(child)) {

        // Container can't be any deeper, so current node is the container.
        if (isStartEndpoint) {
          this.startOffset_ = i;
        } else {
          this.endOffset_ = i + 1;
        }
        return node;
      }

      // If child can contain range endpoints, recurse inside this child.
      return this.getEndpointNode_(endpoint, child);

    // Case 3 - Partial non-adjacency overlap.
    } else if (this.compareBrowserRangeEndpoints(ieRange, start, end) < 0 &&
               this.compareBrowserRangeEndpoints(ieRange, end, start) > 0) {
      // If this child overlaps the selection partially, recurse down to find
      // the first/last child the next level down that overlaps the selection
      // completely. We do not consider edge-adjacency (== 0) as overlap.
      return this.getEndpointNode_(endpoint, child);
    }

  }

  // None of the children of this node overlapped the selection, that means
  // the selection starts/ends in this node directly.
  return node;
};


/**
 * Compares one endpoint of this range with the endpoint of a node.
 * For internal methods, we should prefer this method to containsNode.
 * containsNode has a lot of false negatives when we're dealing with
 * {@code <br>} tags.
 *
 * @param {Node} node The node to compare against.
 * @param {goog.dom.RangeEndpoint} thisEndpoint The endpoint of this range
 *     to compare with.
 * @param {goog.dom.RangeEndpoint} otherEndpoint The endpoint of the node
 *     to compare with.
 * @return {number} 0 if the endpoints are equal, negative if this range
 *     endpoint comes before the other node endpoint, and positive otherwise.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.compareNodeEndpoints_ =
    function(node, thisEndpoint, otherEndpoint) {
  return this.range_.compareEndPoints(
      (thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End') +
      'To' +
      (otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End'),
      goog.dom.browserrange.createRangeFromNodeContents(node).
          getBrowserRange());
};


/**
 * Returns the offset into the start/end container.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the offset for.
 * @param {Node=} opt_container The container to get the offset relative to.
 *     Defaults to the value returned by getStartNode/getEndNode.
 * @return {number} The offset.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getOffset_ = function(endpoint,
    opt_container) {
  var isStartEndpoint = endpoint == goog.dom.RangeEndpoint.START;
  var container = opt_container ||
      (isStartEndpoint ? this.getStartNode() : this.getEndNode());

  if (container.nodeType == goog.dom.NodeType.ELEMENT) {
    // Find the first/last child that overlaps the selection
    var children = container.childNodes;
    var len = children.length;
    var edge = isStartEndpoint ? 0 : len - 1;
    var sign = isStartEndpoint ? 1 : - 1;

    // We find the index in the child array of the endpoint of the selection.
    for (var i = edge; i >= 0 && i < len; i += sign) {
      var child = children[i];
      // Ignore the child nodes, which could be end point containers.
      if (goog.dom.browserrange.canContainRangeEndpoint(child)) {
        continue;
      }
      // Stop looping when we reach the edge of the selection.
      var endPointCompare =
          this.compareNodeEndpoints_(child, endpoint, endpoint);
      if (endPointCompare == 0) {
        return isStartEndpoint ? i : i + 1;
      }
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
    range.setEndPoint(isStartEndpoint ? 'EndToEnd' : 'StartToStart', nodeRange);

    var rangeLength = range.text.length;
    return isStartEndpoint ? container.length - rangeLength : rangeLength;
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

  return this.containsRange(
      new goog.dom.browserrange.IeRange(range, this.doc_), true);
};


/** @override */
goog.dom.browserrange.IeRange.prototype.isCollapsed = function() {
  // Note(user) : The earlier implementation used (range.text == ''), but this
  // fails when (range.htmlText == '<br>')
  // Alternative: this.range_.htmlText == '';
  return this.range_.compareEndPoints('StartToEnd', this.range_) == 0;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getText = function() {
  return this.range_.text;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.getValidHtml = function() {
  return this.range_.htmlText;
};


// SELECTION MODIFICATION


/** @override */
goog.dom.browserrange.IeRange.prototype.select = function(opt_reverse) {
  // IE doesn't support programmatic reversed selections.
  this.range_.select();
};


/** @override */
goog.dom.browserrange.IeRange.prototype.removeContents = function() {
  // NOTE: Sometimes htmlText is non-empty, but the range is actually empty.
  // TODO(gboyer): The htmlText check is probably unnecessary, but I left it in
  // for paranoia.
  if (!this.isCollapsed() && this.range_.htmlText) {
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

    // However, sometimes moving the start back and forth ends up changing the
    // range.
    // TODO(gboyer): This condition used to happen for empty ranges, but (1)
    // never worked, and (2) the isCollapsed call should protect against empty
    // ranges better than before.  However, this is left for paranoia.
    if (clone.text == oldText) {
      this.range_ = clone;
    }

    // Use the browser's native deletion code.
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
 * @return {!goog.dom.DomHelper} A dom helper for the document the range
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
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper object for the document
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
  element = opt_domHelper.getElement(id);

  // If element is null here, we failed.
  if (element) {
    if (!originalId) {
      element.removeAttribute('id');
    }
  }

  return element;
};


/** @override */
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
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use.
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


/** @override */
goog.dom.browserrange.IeRange.prototype.insertNode = function(node, before) {
  var output = goog.dom.browserrange.IeRange.insertNode_(
      this.range_.duplicate(), node, before);
  this.clearCachedValues_();
  return output;
};


/** @override */
goog.dom.browserrange.IeRange.prototype.surroundWithNodes = function(
    startNode, endNode) {
  var clone1 = this.range_.duplicate();
  var clone2 = this.range_.duplicate();
  goog.dom.browserrange.IeRange.insertNode_(clone1, startNode, true);
  goog.dom.browserrange.IeRange.insertNode_(clone2, endNode, false);

  this.clearCachedValues_();
};


/** @override */
goog.dom.browserrange.IeRange.prototype.collapse = function(toStart) {
  this.range_.collapse(toStart);

  if (toStart) {
    this.endNode_ = this.startNode_;
    this.endOffset_ = this.startOffset_;
  } else {
    this.startNode_ = this.endNode_;
    this.startOffset_ = this.endOffset_;
  }
};
