// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Utilities for working with selections in input boxes and text
 * areas.
 */


goog.provide('goog.dom.selection');


goog.require('goog.userAgent');


/**
 * Sets the place where the selection should start inside a text area or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position to end the selection at.
 */
goog.dom.selection.setStart = function(textfield, pos) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    textfield.selectionStart = pos;
  } else if (goog.userAgent.IE) {
    // destructuring assignment would have been sweet
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (range.inRange(selectionRange)) {
      // For IE \r\n is 2 characters but move('character', n) passes both
      var value = textfield.value;
      var i = 0;
      var startPos = pos;
      while (i != -1 && i < startPos) {
        i = value.indexOf('\r\n', i);
        if (i != -1 && i < startPos) {
          pos--;
          i++;
        }
      }

      range.collapse(true);
      range.move('character', pos);
      range.select();
    }
  }
};


/**
 * Return the place where the selection starts inside a text area or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @return {number} The position where the selection starts or 0 if it was
 *     unable to find the position or no selection exists. Note that we can't
 *     reliably tell the difference between an element that has no selection and
 *     one where it starts at 0.
 */
goog.dom.selection.getStart = function(textfield) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    return textfield.selectionStart;
  }

  if (goog.userAgent.IE) {
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (range.inRange(selectionRange)) {
      range.setEndPoint('EndToStart', selectionRange);
      return range.text.length;
    }
  }

  return 0;
};


/**
 * Sets the place where the selection should end inside a text area or a text
 * input
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position to end the selection at.
 */
goog.dom.selection.setEnd = function(textfield, pos) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    textfield.selectionEnd = pos;
  } else if (goog.userAgent.IE) {
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (range.inRange(selectionRange)) {
      selectionRange.collapse();
      selectionRange.moveEnd('character',
          pos - goog.dom.selection.getStart(textfield));
      selectionRange.select();
    }
  }
};


/**
 * Returns the place where the selection ends inside a text area or a text input
 * @param {Element} textfield A textarea or text input.
 * @return {number} The position where the selection ends or 0 if it was
 *     unable to find the position or no selection exists.
 */
goog.dom.selection.getEnd = function(textfield) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    return textfield.selectionEnd;
  }

  if (goog.userAgent.IE) {
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (range.inRange(selectionRange)) {
      range.setEndPoint('EndToEnd', selectionRange);
      return range.text.length;
    }
  }

  return 0;
};


/**
 * Sets the cursor position within a textfield.
 * @param {Element} textfield A textarea or text input.
 * @param {number} pos The position within the text field.
 */
goog.dom.selection.setCursorPosition = function(textfield, pos) {
  // getOwnerDocument(): Remove dependency on goog.dom's main namespace b
  var doc = textfield.ownerDocument || textfield.document;

  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    // Mozilla directly supports this
    textfield.selectionStart = pos;
    textfield.selectionEnd = pos;

  } else if (doc.selection && textfield.createTextRange) {
    // IE has textranges. A textfield's textrange encompasses the
    // entire textfield's text by default
    var sel = textfield.createTextRange();

    sel.collapse(true);
    sel.move('character', pos);
    sel.select();
  }
};


/**
 * Sets the selected text inside a text area or a text input
 * @param {Element} textfield A textarea or text input.
 * @param {string} text The text to change the selection to.
 */
goog.dom.selection.setText = function(textfield, text) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    var value = textfield.value;
    var oldSelectionStart = textfield.selectionStart;
    var before = value.substr(0, oldSelectionStart);
    var after = value.substr(textfield.selectionEnd);
    textfield.value = before + text + after;
    textfield.selectionStart = oldSelectionStart;
    textfield.selectionEnd = oldSelectionStart + text.length;
  } else if (goog.userAgent.IE) {
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (!range.inRange(selectionRange)) {
      return;
    }
    // When we set the selection text the selection range is collapsed to the
    // end. We therefore duplicate the current selection so we know where it
    // started. Once we've set the selection text we move the start of the
    // selection range to the old start
    var range2 = selectionRange.duplicate();
    selectionRange.text = text;
    selectionRange.setEndPoint('StartToStart', range2);
    selectionRange.select();
  } else {
    throw Error('Cannot set the selection end');
  }
};


/**
 * Returns the selected text inside a text area or a text input
 * @param {Element} textfield A textarea or text input.
 * @return {string} The selected text.
 */
goog.dom.selection.getText = function(textfield) {
  if (goog.dom.selection.useSelectionProperties_(textfield)) {
    var s = textfield.value;
    return s.substring(textfield.selectionStart, textfield.selectionEnd);
  }

  if (goog.userAgent.IE) {
    var tmp = goog.dom.selection.getRangeIe_(textfield);
    var range = tmp[0];
    var selectionRange = tmp[1];

    if (!range.inRange(selectionRange)) {
      return '';
    }
    return selectionRange.text;
  }

  throw Error('Cannot get the selection text');
};


/**
 * Helper function for returning the range for an object as well as the
 * selection range
 * @private
 * @param {Element} el The element to get the reange for.
 * @return {Array.<Range>} Range of object and selection range in two element
 *     array.
 */
goog.dom.selection.getRangeIe_ = function(el) {
  // getOwnerDocument(): Remove dependency on goog.dom's main namespace b
  var doc = el.ownerDocument || el.document;

  var selectionRange = doc.selection.createRange();
  // el.createTextRange() doesn't work on text areas
  var range;

  if (el.type == 'textarea') {
    range = selectionRange.duplicate();
    range.moveToElementText(el);
  } else {
    range = el.createTextRange();
  }

  return [range, selectionRange];
};


/**
 * Helper function to determine whether it's okay to use
 * selectionStart/selectionEnd.
 *
 * @param {Element} el The element to check for.
 * @return {boolean} Wether it's okay to use the selectionStart and
 *     selectionEnd properties on {@code el}.
 * @private
 */
goog.dom.selection.useSelectionProperties_ = function(el) {
  try {
    return typeof el.selectionStart == 'number';
  } catch (e) {
    // Firefox throws an exception if you try to access selectionStart
    // on an element with display: none.
    return false;
  }
};
