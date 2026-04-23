/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for working with selections in input boxes and text
 * areas.
 *
 * @see ../demos/dom_selection.html
 */


goog.provide('goog.dom.selection');

goog.require('goog.dom.InputType');
goog.require('goog.string');


/**
 * Sets the place where the selection should start inside a textarea or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position to set the start of the selection at.
 */
goog.dom.selection.setStart = function(textfield, pos) {
  'use strict';
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    textfield.selectionStart = pos;
  }
};


/**
 * Return the place where the selection starts inside a textarea or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @return {number} The position where the selection starts or 0 if it was
 *     unable to find the position or no selection exists. Note that we can't
 *     reliably tell the difference between an element that has no selection and
 *     one where it starts at 0.
 */
goog.dom.selection.getStart = function(textfield) {
  'use strict';
  return goog.dom.selection.getEndPoints_(textfield, true)[0];
};


/**
 * Returns the start and end points of the selection within a textarea in IE.
 * IE treats newline characters as \r\n characters, and we need to check for
 * these characters at the edge of our selection, to ensure that we return the
 * right cursor position.
 * @param {TextRange} range Complete range object, e.g., "Hello\r\n".
 * @param {TextRange} selRange Selected range object.
 * @param {boolean} getOnlyStart Value indicating if only start
 *     cursor position is to be returned. In IE, obtaining the end position
 *     involves extra work, hence we have this parameter for calls which need
 *     only start position.
 * @return {!Array<number>} An array with the start and end positions where the
 *     selection starts and ends or [0,0] if it was unable to find the
 *     positions or no selection exists. Note that we can't reliably tell the
 *     difference between an element that has no selection and one where
 *     it starts and ends at 0. If getOnlyStart was true, we return
 *     -1 as end offset.
 * @private
 */
goog.dom.selection.getEndPointsTextareaIe_ = function(
    range, selRange, getOnlyStart) {
  'use strict';
  // Create a duplicate of the selected range object to perform our actions
  // against. Example of selectionRange = "" (assuming that the cursor is
  // just after the \r\n combination)
  var selectionRange = selRange.duplicate();

  // Text before the selection start, e.g.,"Hello" (notice how range.text
  // excludes the \r\n sequence)
  var beforeSelectionText = range.text;
  // Text before the selection start, e.g., "Hello" (this will later include
  // the \r\n sequences also)
  var untrimmedBeforeSelectionText = beforeSelectionText;
  // Text within the selection , e.g. "" assuming that the cursor is just after
  // the \r\n combination.
  var selectionText = selectionRange.text;
  // Text within the selection, e.g.,  "" (this will later include the \r\n
  // sequences also)
  var untrimmedSelectionText = selectionText;

  // Boolean indicating whether we are done dealing with the text before the
  // selection's beginning.
  var isRangeEndTrimmed = false;
  // Go over the range until it becomes a 0-lengthed range or until the range
  // text starts changing when we move the end back by one character.
  // If after moving the end back by one character, the text remains the same,
  // then we need to add a "\r\n" at the end to get the actual text.
  while (!isRangeEndTrimmed) {
    if (range.compareEndPoints('StartToEnd', range) == 0) {
      isRangeEndTrimmed = true;
    } else {
      range.moveEnd('character', -1);
      if (range.text == beforeSelectionText) {
        // If the start position of the cursor was after a \r\n string,
        // we would skip over it in one go with the moveEnd call, but
        // range.text will still show "Hello" (because of the IE range.text
        // bug) - this implies that we should add a \r\n to our
        // untrimmedBeforeSelectionText string.
        untrimmedBeforeSelectionText += '\r\n';
      } else {
        isRangeEndTrimmed = true;
      }
    }
  }

  if (getOnlyStart) {
    // We return -1 as end, since the caller is only interested in the start
    // value.
    return [untrimmedBeforeSelectionText.length, -1];
  }
  // Boolean indicating whether we are done dealing with the text inside the
  // selection.
  var isSelectionRangeEndTrimmed = false;
  // Go over the selected range until it becomes a 0-lengthed range or until
  // the range text starts changing when we move the end back by one character.
  // If after moving the end back by one character, the text remains the same,
  // then we need to add a "\r\n" at the end to get the actual text.
  while (!isSelectionRangeEndTrimmed) {
    if (selectionRange.compareEndPoints('StartToEnd', selectionRange) == 0) {
      isSelectionRangeEndTrimmed = true;
    } else {
      selectionRange.moveEnd('character', -1);
      if (selectionRange.text == selectionText) {
        // If the selection was not empty, and the end point of the selection
        // was just after a \r\n, we would have skipped it in one go with the
        // moveEnd call, and this implies that we should add a \r\n to the
        // untrimmedSelectionText string.
        untrimmedSelectionText += '\r\n';
      } else {
        isSelectionRangeEndTrimmed = true;
      }
    }
  }
  return [
    untrimmedBeforeSelectionText.length,
    untrimmedBeforeSelectionText.length + untrimmedSelectionText.length
  ];
};


/**
 * Returns the start and end points of the selection inside a textarea or a
 * text input.
 * @param {Element} textfield A textarea or text input.
 * @return {!Array<number>} An array with the start and end positions where the
 *     selection starts and ends or [0,0] if it was unable to find the
 *     positions or no selection exists. Note that we can't reliably tell the
 *     difference between an element that has no selection and one where
 *     it starts and ends at 0.
 */
goog.dom.selection.getEndPoints = function(textfield) {
  'use strict';
  return goog.dom.selection.getEndPoints_(textfield, false);
};


/**
 * Returns the start and end points of the selection inside a textarea or a
 * text input.
 * @param {Element} textfield A textarea or text input.
 * @param {boolean} getOnlyStart Value indicating if only start
 *     cursor position is to be returned. In IE, obtaining the end position
 *     involves extra work, hence we have this parameter. In FF, there is not
 *     much extra effort involved.
 * @return {!Array<number>} An array with the start and end positions where the
 *     selection starts and ends or [0,0] if it was unable to find the
 *     positions or no selection exists. Note that we can't reliably tell the
 *     difference between an element that has no selection and one where
 *     it starts and ends at 0. If getOnlyStart was true, we return
 *     -1 as end offset.
 * @private
 */
goog.dom.selection.getEndPoints_ = function(textfield, getOnlyStart) {
  'use strict';
  textfield = /** @type {!HTMLInputElement|!HTMLTextAreaElement} */ (textfield);
  var startPos = 0;
  var endPos = 0;
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    startPos = textfield.selectionStart;
    endPos = getOnlyStart ? -1 : textfield.selectionEnd;
  }
  return [startPos, endPos];
};


/**
 * Sets the place where the selection should end inside a text area or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position to end the selection at.
 */
goog.dom.selection.setEnd = function(textfield, pos) {
  'use strict';
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    textfield.selectionEnd = pos;
  }
};


/**
 * Returns the place where the selection ends inside a textarea or a text input
 * @param {Element} textfield A textarea or text input.
 * @return {number} The position where the selection ends or 0 if it was
 *     unable to find the position or no selection exists.
 */
goog.dom.selection.getEnd = function(textfield) {
  'use strict';
  return goog.dom.selection.getEndPoints_(textfield, false)[1];
};


/**
 * Sets the cursor position within a textfield.
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position within the text field.
 */
goog.dom.selection.setCursorPosition = function(textfield, pos) {
  'use strict';
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    // Mozilla directly supports this
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    textfield.selectionStart = pos;
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    textfield.selectionEnd = pos;
  }
};


/**
 * Sets the selected text inside a textarea or a text input
 * @param {Element} textfield A textarea or text input.
 * @param {string} text The text to change the selection to.
 */
goog.dom.selection.setText = function(textfield, text) {
  'use strict';
  textfield = /** @type {!HTMLInputElement|!HTMLTextAreaElement} */ (textfield);
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    var value = textfield.value;
    var oldSelectionStart = textfield.selectionStart;
    var before = value.slice(0, oldSelectionStart);
    var after = value.slice(textfield.selectionEnd);
    textfield.value = before + text + after;
    textfield.selectionStart = oldSelectionStart;
    textfield.selectionEnd = oldSelectionStart + text.length;
  } else {
    throw new Error('Cannot set the selection end');
  }
};


/**
 * Returns the selected text inside a textarea or a text input
 * @param {Element} textfield A textarea or text input.
 * @return {string} The selected text.
 */
goog.dom.selection.getText = function(textfield) {
  'use strict';
  textfield = /** @type {!HTMLInputElement|!HTMLTextAreaElement} */ (textfield);
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    var s = textfield.value;
    return s.substring(textfield.selectionStart, textfield.selectionEnd);
  }

  throw new Error('Cannot get the selection text');
};


/**
 * Returns the selected text within a textarea in IE.
 * IE treats newline characters as \r\n characters, and we need to check for
 * these characters at the edge of our selection, to ensure that we return the
 * right string.
 * @param {TextRange} selRange Selected range object.
 * @return {string} Selected text in the textarea.
 * @private
 */
goog.dom.selection.getSelectionRangeText_ = function(selRange) {
  'use strict';
  // Create a duplicate of the selected range object to perform our actions
  // against. Suppose the text in the textarea is "Hello\r\nWorld" and the
  // selection encompasses the "o\r\n" bit, initial selectionRange will be "o"
  // (assuming that the cursor is just after the \r\n combination)
  var selectionRange = selRange.duplicate();

  // Text within the selection , e.g. "o" assuming that the cursor is just after
  // the \r\n combination.
  var selectionText = selectionRange.text;
  // Text within the selection, e.g.,  "o" (this will later include the \r\n
  // sequences also)
  var untrimmedSelectionText = selectionText;

  // Boolean indicating whether we are done dealing with the text inside the
  // selection.
  var isSelectionRangeEndTrimmed = false;
  // Go over the selected range until it becomes a 0-lengthed range or until
  // the range text starts changing when we move the end back by one character.
  // If after moving the end back by one character, the text remains the same,
  // then we need to add a "\r\n" at the end to get the actual text.
  while (!isSelectionRangeEndTrimmed) {
    if (selectionRange.compareEndPoints('StartToEnd', selectionRange) == 0) {
      isSelectionRangeEndTrimmed = true;
    } else {
      selectionRange.moveEnd('character', -1);
      if (selectionRange.text == selectionText) {
        // If the selection was not empty, and the end point of the selection
        // was just after a \r\n, we would have skipped it in one go with the
        // moveEnd call, and this implies that we should add a \r\n to the
        // untrimmedSelectionText string.
        untrimmedSelectionText += '\r\n';
      } else {
        isSelectionRangeEndTrimmed = true;
      }
    }
  }
  return untrimmedSelectionText;
};


/**
 * Helper function for returning the range for an object as well as the
 * selection range
 * @private
 * @param {Element} el The element to get the range for.
 * @return {!Array<TextRange>} Range of object and selection range in two
 *     element array.
 */
goog.dom.selection.getRangeIe_ = function(el) {
  'use strict';
  var doc = el.ownerDocument || el.document;

  var selectionRange = doc.selection.createRange();
  // el.createTextRange() doesn't work on textareas
  var range;

  if (/** @type {?} */ (el).type == goog.dom.InputType.TEXTAREA) {
    range = doc.body.createTextRange();
    range.moveToElementText(el);
  } else {
    range = el.createTextRange();
  }

  return [range, selectionRange];
};


/**
 * Helper function for canonicalizing a position inside a textfield in IE.
 * Deals with the issue that \r\n counts as 2 characters, but
 * move('character', n) passes over both characters in one move.
 * @private
 * @param {Element} textfield The text element.
 * @param {number} pos The position desired in that element.
 * @return {number} The canonicalized position that will work properly with
 *     move('character', pos).
 */
goog.dom.selection.canonicalizePositionIe_ = function(textfield, pos) {
  'use strict';
  textfield = /** @type {!HTMLTextAreaElement} */ (textfield);
  if (textfield.type == goog.dom.InputType.TEXTAREA) {
    // We do this only for textarea because it is the only one which can
    // have a \r\n (input cannot have this).
    var value = textfield.value.substring(0, pos);
    pos = goog.string.canonicalizeNewlines(value).length;
  }
  return pos;
};


/**
 * Helper function to determine whether it's okay to use
 * selectionStart/selectionEnd.
 *
 * @param {Element} el The element to check for.
 * @return {boolean} Whether it's okay to use the selectionStart and
 *     selectionEnd properties on `el`.
 * @private
 */
goog.dom.selection.useSelectionProperties_ = function(el) {
  'use strict';
  try {
    return typeof el.selectionStart == 'number';
  } catch (e) {
    // Firefox throws an exception if you try to access selectionStart
    // on an element with display: none.
    return false;
  }
};
