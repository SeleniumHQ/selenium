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
 * @fileoverview An API for saving and restoring ranges as HTML carets.
 *
 * @author nicksantos@google.com (Nick Santos)
 */


goog.provide('goog.dom.SavedCaretRange');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.SavedRange');
goog.require('goog.dom.TagName');
goog.require('goog.string');



/**
 * A struct for holding context about saved selections.
 * This can be used to preserve the selection and restore while the DOM is
 * manipulated, or through an asynchronous call. Use goog.dom.Range factory
 * methods to obtain an {@see goog.dom.AbstractRange} instance, and use
 * {@see goog.dom.AbstractRange#saveUsingCarets} to obtain a SavedCaretRange.
 * For editor ranges under content-editable elements or design-mode iframes,
 * prefer using {@see goog.editor.range.saveUsingNormalizedCarets}.
 * @param {goog.dom.AbstractRange} range The range being saved.
 * @constructor
 * @extends {goog.dom.SavedRange}
 */
goog.dom.SavedCaretRange = function(range) {
  goog.dom.SavedRange.call(this);

  /**
   * The DOM id of the caret at the start of the range.
   * @type {string}
   * @private
   */
  this.startCaretId_ = goog.string.createUniqueString();

  /**
   * The DOM id of the caret at the end of the range.
   * @type {string}
   * @private
   */
  this.endCaretId_ = goog.string.createUniqueString();

  /**
   * A DOM helper for storing the current document context.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = goog.dom.getDomHelper(range.getDocument());

  range.surroundWithNodes(this.createCaret_(true), this.createCaret_(false));
};
goog.inherits(goog.dom.SavedCaretRange, goog.dom.SavedRange);


/**
 * Gets the range that this SavedCaretRage represents, without selecting it
 * or removing the carets from the DOM.
 * @return {goog.dom.AbstractRange?} An abstract range.
 */
goog.dom.SavedCaretRange.prototype.toAbstractRange = function() {
  var range = null;
  var startCaret = this.getCaret(true);
  var endCaret = this.getCaret(false);
  if (startCaret && endCaret) {
    range = goog.dom.Range.createFromNodes(startCaret, 0, endCaret, 0);
  }
  return range;
};


/**
 * Gets carets.
 * @param {boolean} start If true, returns the start caret. Otherwise, get the
 *     end caret.
 * @return {Element} The start or end caret in the given document.
 */
goog.dom.SavedCaretRange.prototype.getCaret = function(start) {
  return this.dom_.getElement(start ? this.startCaretId_ : this.endCaretId_);
};


/**
 * Removes the carets from the current restoration document.
 * @param {goog.dom.AbstractRange=} opt_range A range whose offsets have already
 *     been adjusted for caret removal; it will be adjusted if it is also
 *     affected by post-removal operations, such as text node normalization.
 * @return {goog.dom.AbstractRange|undefined} The adjusted range, if opt_range
 *     was provided.
 */
goog.dom.SavedCaretRange.prototype.removeCarets = function(opt_range) {
  goog.dom.removeNode(this.getCaret(true));
  goog.dom.removeNode(this.getCaret(false));
  return opt_range;
};


/**
 * Sets the document where the range will be restored.
 * @param {!Document} doc An HTML document.
 */
goog.dom.SavedCaretRange.prototype.setRestorationDocument = function(doc) {
  this.dom_.setDocument(doc);
};


/**
 * Reconstruct the selection from the given saved range. Removes carets after
 * restoring the selection. If restore does not dispose this saved range, it may
 * only be restored a second time if innerHTML or some other mechanism is used
 * to restore the carets to the dom.
 * @return {goog.dom.AbstractRange?} Restored selection.
 * @override
 * @protected
 */
goog.dom.SavedCaretRange.prototype.restoreInternal = function() {
  var range = null;
  var startCaret = this.getCaret(true);
  var endCaret = this.getCaret(false);
  if (startCaret && endCaret) {
    var startNode = startCaret.parentNode;
    var startOffset = goog.array.indexOf(startNode.childNodes, startCaret);
    var endNode = endCaret.parentNode;
    var endOffset = goog.array.indexOf(endNode.childNodes, endCaret);
    if (endNode == startNode) {
      // Compensate for the start caret being removed.
      endOffset -= 1;
    }
    range = goog.dom.Range.createFromNodes(startNode, startOffset,
                                           endNode, endOffset);
    range = this.removeCarets(range);
    range.select();
  } else {
    // If only one caret was found, remove it.
    this.removeCarets();
  }
  return range;
};


/**
 * Dispose the saved range and remove the carets from the DOM.
 * @override
 * @protected
 */
goog.dom.SavedCaretRange.prototype.disposeInternal = function() {
  this.removeCarets();
  this.dom_ = null;
};


/**
 * Creates a caret element.
 * @param {boolean} start If true, creates the start caret. Otherwise,
 *     creates the end caret.
 * @return {Element} The new caret element.
 * @private
 */
goog.dom.SavedCaretRange.prototype.createCaret_ = function(start) {
  return this.dom_.createDom(goog.dom.TagName.SPAN,
      {'id': start ? this.startCaretId_ : this.endCaretId_});
};


/**
 * A regex that will match all saved range carets in a string.
 * @type {RegExp}
 */
goog.dom.SavedCaretRange.CARET_REGEX = /<span\s+id="?goog_\d+"?><\/span>/ig;


/**
 * Returns whether two strings of html are equal, ignoring any saved carets.
 * Thus two strings of html whose only difference is the id of their saved
 * carets will be considered equal, since they represent html with the
 * same selection.
 * @param {string} str1 The first string.
 * @param {string} str2 The second string.
 * @return {boolean} Whether two strings of html are equal, ignoring any
 *     saved carets.
 */
goog.dom.SavedCaretRange.htmlEqual = function(str1, str2) {
  return str1 == str2 ||
      str1.replace(goog.dom.SavedCaretRange.CARET_REGEX, '') ==
          str2.replace(goog.dom.SavedCaretRange.CARET_REGEX, '');
};
