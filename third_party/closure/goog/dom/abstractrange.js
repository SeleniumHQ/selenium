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
 * @fileoverview Interface definitions for working with ranges
 * in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.AbstractRange');
goog.provide('goog.dom.RangeIterator');
goog.provide('goog.dom.RangeType');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.SavedCaretRange');
goog.require('goog.dom.TagIterator');
goog.require('goog.userAgent');


/**
 * Types of ranges.
 * @enum {string}
 */
goog.dom.RangeType = {
  TEXT: 'text',
  CONTROL: 'control',
  MULTI: 'mutli'
};



/**
 * Creates a new selection with no properties.  Do not use this constructor -
 * use one of the goog.dom.Range.from* methods instead.
 * @constructor
 */
goog.dom.AbstractRange = function() {
};


/**
 * Gets the browser native selection object from the given window.
 * @param {Window} win The window to get the selection object from.
 * @return {Object} The browser native selection object, or null if it could
 *     not be retrieved.
 */
goog.dom.AbstractRange.getBrowserSelectionForWindow = function(win) {
  if (win.getSelection) {
    // W3C
    return win.getSelection();
  } else {
    // IE
    var doc = win.document;
    var sel = doc.selection;
    if (sel) {
      // IE has a bug where it sometimes returns a selection from the wrong
      // document. Catching these cases now helps us avoid problems later.
      try {
        var range = sel.createRange();
        // Only TextRanges have a parentElement method.
        if (range.parentElement) {
          if (range.parentElement().document != doc) {
            return null;
          }
        } else if (!range.length || range.item(0).document != doc) {
          // For ControlRanges, check that the range has items, and that
          // the first item in the range is in the correct document.
          return null;
        }
      } catch (e) {
        // If the selection is in the wrong document, and the wrong document is
        // in a different domain, IE will throw an exception.
        return null;
      }
      // TODO(user|robbyw) Sometimes IE 6 returns a selection instance
      // when there is no selection.  This object has a 'type' property equals
      // to 'None' and a typeDetail property bound to undefined. Ideally this
      // function should not return this instance.
      return sel;
    }
    return null;
  }
};


/**
 * Tests if the given Object is a controlRange.
 * @param {Object} range The range object to test.
 * @return {boolean} Whether the given Object is a controlRange.
 */
goog.dom.AbstractRange.isNativeControlRange = function(range) {
  // For now, tests for presence of a control range function.
  return !!range && !!range.addElement;
};


/**
 * @return {!goog.dom.AbstractRange} A clone of this range.
 */
goog.dom.AbstractRange.prototype.clone = goog.abstractMethod;


/**
 * @return {goog.dom.RangeType} The type of range represented by this object.
 */
goog.dom.AbstractRange.prototype.getType = goog.abstractMethod;


/**
 * @return {Range|TextRange} The native browser range object.
 */
goog.dom.AbstractRange.prototype.getBrowserRangeObject = goog.abstractMethod;


/**
 * Sets the native browser range object, overwriting any state this range was
 * storing.
 * @param {Range|TextRange} nativeRange The native browser range object.
 * @return {boolean} Whether the given range was accepted.  If not, the caller
 *     will need to call goog.dom.Range.createFromBrowserRange to create a new
 *     range object.
 */
goog.dom.AbstractRange.prototype.setBrowserRangeObject = function(nativeRange) {
  return false;
};


/**
 * @return {number} The number of text ranges in this range.
 */
goog.dom.AbstractRange.prototype.getTextRangeCount = goog.abstractMethod;


/**
 * Get the i-th text range in this range.  The behavior is undefined if
 * i >= getTextRangeCount or i < 0.
 * @param {number} i The range number to retrieve.
 * @return {goog.dom.TextRange} The i-th text range.
 */
goog.dom.AbstractRange.prototype.getTextRange = goog.abstractMethod;


/**
 * Gets an array of all text ranges this range is comprised of.  For non-multi
 * ranges, returns a single element array containing this.
 * @return {!Array<goog.dom.TextRange>} Array of text ranges.
 */
goog.dom.AbstractRange.prototype.getTextRanges = function() {
  var output = [];
  for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
    output.push(this.getTextRange(i));
  }
  return output;
};


/**
 * @return {Node} The deepest node that contains the entire range.
 */
goog.dom.AbstractRange.prototype.getContainer = goog.abstractMethod;


/**
 * Returns the deepest element in the tree that contains the entire range.
 * @return {Element} The deepest element that contains the entire range.
 */
goog.dom.AbstractRange.prototype.getContainerElement = function() {
  var node = this.getContainer();
  return /** @type {Element} */ (
      node.nodeType == goog.dom.NodeType.ELEMENT ? node : node.parentNode);
};


/**
 * @return {Node} The element or text node the range starts in.  For text
 *     ranges, the range comprises all text between the start and end position.
 *     For other types of range, start and end give bounds of the range but
 *     do not imply all nodes in those bounds are selected.
 */
goog.dom.AbstractRange.prototype.getStartNode = goog.abstractMethod;


/**
 * @return {number} The offset into the node the range starts in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getStartOffset = goog.abstractMethod;


/**
 * @return {goog.math.Coordinate} The coordinate of the selection start node
 *     and offset.
 */
goog.dom.AbstractRange.prototype.getStartPosition = goog.abstractMethod;


/**
 * @return {Node} The element or text node the range ends in.
 */
goog.dom.AbstractRange.prototype.getEndNode = goog.abstractMethod;


/**
 * @return {number} The offset into the node the range ends in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getEndOffset = goog.abstractMethod;


/**
 * @return {goog.math.Coordinate} The coordinate of the selection end
 *     node and offset.
 */
goog.dom.AbstractRange.prototype.getEndPosition = goog.abstractMethod;


/**
 * @return {Node} The element or text node the range is anchored at.
 */
goog.dom.AbstractRange.prototype.getAnchorNode = function() {
  return this.isReversed() ? this.getEndNode() : this.getStartNode();
};


/**
 * @return {number} The offset into the node the range is anchored at.  For
 *     text nodes, this is an offset into the node value.  For elements, this
 *     is an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getAnchorOffset = function() {
  return this.isReversed() ? this.getEndOffset() : this.getStartOffset();
};


/**
 * @return {Node} The element or text node the range is focused at - i.e. where
 *     the cursor is.
 */
goog.dom.AbstractRange.prototype.getFocusNode = function() {
  return this.isReversed() ? this.getStartNode() : this.getEndNode();
};


/**
 * @return {number} The offset into the node the range is focused at - i.e.
 *     where the cursor is.  For text nodes, this is an offset into the node
 *     value.  For elements, this is an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getFocusOffset = function() {
  return this.isReversed() ? this.getStartOffset() : this.getEndOffset();
};


/**
 * @return {boolean} Whether the selection is reversed.
 */
goog.dom.AbstractRange.prototype.isReversed = function() {
  return false;
};


/**
 * @return {!Document} The document this selection is a part of.
 */
goog.dom.AbstractRange.prototype.getDocument = function() {
  // Using start node in IE was crashing the browser in some cases so use
  // getContainer for that browser. It's also faster for IE, but still slower
  // than start node for other browsers so we continue to use getStartNode when
  // it is not problematic. See bug 1687309.
  return goog.dom.getOwnerDocument(goog.userAgent.IE ?
      this.getContainer() : this.getStartNode());
};


/**
 * @return {!Window} The window this selection is a part of.
 */
goog.dom.AbstractRange.prototype.getWindow = function() {
  return goog.dom.getWindow(this.getDocument());
};


/**
 * Tests if this range contains the given range.
 * @param {goog.dom.AbstractRange} range The range to test.
 * @param {boolean=} opt_allowPartial If true, the range can be partially
 *     contained in the selection, otherwise the range must be entirely
 *     contained.
 * @return {boolean} Whether this range contains the given range.
 */
goog.dom.AbstractRange.prototype.containsRange = goog.abstractMethod;


/**
 * Tests if this range contains the given node.
 * @param {Node} node The node to test for.
 * @param {boolean=} opt_allowPartial If not set or false, the node must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given node.
 */
goog.dom.AbstractRange.prototype.containsNode = function(node,
    opt_allowPartial) {
  return this.containsRange(goog.dom.Range.createFromNodeContents(node),
      opt_allowPartial);
};


/**
 * Tests whether this range is valid (i.e. whether its endpoints are still in
 * the document).  A range becomes invalid when, after this object was created,
 * either one or both of its endpoints are removed from the document.  Use of
 * an invalid range can lead to runtime errors, particularly in IE.
 * @return {boolean} Whether the range is valid.
 */
goog.dom.AbstractRange.prototype.isRangeInDocument = goog.abstractMethod;


/**
 * @return {boolean} Whether the range is collapsed.
 */
goog.dom.AbstractRange.prototype.isCollapsed = goog.abstractMethod;


/**
 * @return {string} The text content of the range.
 */
goog.dom.AbstractRange.prototype.getText = goog.abstractMethod;


/**
 * Returns the HTML fragment this range selects.  This is slow on all browsers.
 * The HTML fragment may not be valid HTML, for instance if the user selects
 * from a to b inclusively in the following html:
 *
 * &gt;div&lt;a&gt;/div&lt;b
 *
 * This method will return
 *
 * a&lt;/div&gt;b
 *
 * If you need valid HTML, use {@link #getValidHtml} instead.
 *
 * @return {string} HTML fragment of the range, does not include context
 *     containing elements.
 */
goog.dom.AbstractRange.prototype.getHtmlFragment = goog.abstractMethod;


/**
 * Returns valid HTML for this range.  This is fast on IE, and semi-fast on
 * other browsers.
 * @return {string} Valid HTML of the range, including context containing
 *     elements.
 */
goog.dom.AbstractRange.prototype.getValidHtml = goog.abstractMethod;


/**
 * Returns pastable HTML for this range.  This guarantees that any child items
 * that must have specific ancestors will have them, for instance all TDs will
 * be contained in a TR in a TBODY in a TABLE and all LIs will be contained in
 * a UL or OL as appropriate.  This is semi-fast on all browsers.
 * @return {string} Pastable HTML of the range, including context containing
 *     elements.
 */
goog.dom.AbstractRange.prototype.getPastableHtml = goog.abstractMethod;


/**
 * Returns a RangeIterator over the contents of the range.  Regardless of the
 * direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {!goog.dom.RangeIterator} An iterator over tags in the range.
 */
goog.dom.AbstractRange.prototype.__iterator__ = goog.abstractMethod;


// RANGE ACTIONS


/**
 * Sets this range as the selection in its window.
 */
goog.dom.AbstractRange.prototype.select = goog.abstractMethod;


/**
 * Removes the contents of the range from the document.
 */
goog.dom.AbstractRange.prototype.removeContents = goog.abstractMethod;


/**
 * Inserts a node before (or after) the range.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Node} node The node to insert.
 * @param {boolean} before True to insert before, false to insert after.
 * @return {Node} The node added to the document.  This may be different
 *     than the node parameter because on IE we have to clone it.
 */
goog.dom.AbstractRange.prototype.insertNode = goog.abstractMethod;


/**
 * Replaces the range contents with (possibly a copy of) the given node.  The
 * range may be disrupted beyond recovery because of the way this splits nodes.
 * @param {Node} node The node to insert.
 * @return {Node} The node added to the document.  This may be different
 *     than the node parameter because on IE we have to clone it.
 */
goog.dom.AbstractRange.prototype.replaceContentsWithNode = function(node) {
  if (!this.isCollapsed()) {
    this.removeContents();
  }

  return this.insertNode(node, true);
};


/**
 * Surrounds this range with the two given nodes.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Element} startNode The node to insert at the start.
 * @param {Element} endNode The node to insert at the end.
 */
goog.dom.AbstractRange.prototype.surroundWithNodes = goog.abstractMethod;


// SAVE/RESTORE


/**
 * Saves the range so that if the start and end nodes are left alone, it can
 * be restored.
 * @return {!goog.dom.SavedRange} A range representation that can be restored
 *     as long as the endpoint nodes of the selection are not modified.
 */
goog.dom.AbstractRange.prototype.saveUsingDom = goog.abstractMethod;


/**
 * Saves the range using HTML carets. As long as the carets remained in the
 * HTML, the range can be restored...even when the HTML is copied across
 * documents.
 * @return {goog.dom.SavedCaretRange?} A range representation that can be
 *     restored as long as carets are not removed. Returns null if carets
 *     could not be created.
 */
goog.dom.AbstractRange.prototype.saveUsingCarets = function() {
  return (this.getStartNode() && this.getEndNode()) ?
      new goog.dom.SavedCaretRange(this) : null;
};


// RANGE MODIFICATION


/**
 * Collapses the range to one of its boundary points.
 * @param {boolean} toAnchor Whether to collapse to the anchor of the range.
 */
goog.dom.AbstractRange.prototype.collapse = goog.abstractMethod;

// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 * @param {Node} node The node to start traversal at.  When null, creates an
 *     empty iterator.
 * @param {boolean=} opt_reverse Whether to traverse nodes in reverse.
 * @constructor
 * @extends {goog.dom.TagIterator}
 */
goog.dom.RangeIterator = function(node, opt_reverse) {
  goog.dom.TagIterator.call(this, node, opt_reverse, true);
};
goog.inherits(goog.dom.RangeIterator, goog.dom.TagIterator);


/**
 * @return {number} The offset into the current node, or -1 if the current node
 *     is not a text node.
 */
goog.dom.RangeIterator.prototype.getStartTextOffset = goog.abstractMethod;


/**
 * @return {number} The end offset into the current node, or -1 if the current
 *     node is not a text node.
 */
goog.dom.RangeIterator.prototype.getEndTextOffset = goog.abstractMethod;


/**
 * @return {Node} node The iterator's start node.
 */
goog.dom.RangeIterator.prototype.getStartNode = goog.abstractMethod;


/**
 * @return {Node} The iterator's end node.
 */
goog.dom.RangeIterator.prototype.getEndNode = goog.abstractMethod;


/**
 * @return {boolean} Whether a call to next will fail.
 */
goog.dom.RangeIterator.prototype.isLast = goog.abstractMethod;
