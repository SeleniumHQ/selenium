// Copyright 2009 Google Inc.
//
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

// Copyright (C)2006 Google, Inc.

/**
 * @fileoverview Character counter widget implementation.
 *
 * @see ../demos/charcounter.html
 */

goog.provide('goog.ui.CharCounter');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.InputHandler');


/**
 * CharCounter widget. Counts the number of characters in a input field or a
 * text box and displays the number of additional characters that may be
 * entered before the maximum length is reached.
 *
 * @extends {goog.events.EventTarget}
 * @param {HTMLInputElement|HTMLTextAreaElement} elInput Input or text area
 *        element to count the number of characters in.
 * @param {Element} elCount HTML element to display the remaining number of
 *       characters in.
 * @param {number} maxLength The maximum length.
 * @constructor
 */
goog.ui.CharCounter = function(elInput, elCount, maxLength) {
  goog.events.EventTarget.call(this);

  /**
   * Input or text area element to count the number of characters in.
   * @type {HTMLInputElement|HTMLTextAreaElement}
   * @private
   */
  this.elInput_ = elInput;

  /**
   * HTML element to display the remaining number of characters in.
   * @type {Element}
   * @private
   */
  this.elCount_ = elCount;

  /**
   * The maximum length.
   * @type {number}
   * @private
   */
  this.maxLength_ = maxLength;

  elInput.maxLength = maxLength;

  /**
   * The input handler that provides the input event.
   * @type {goog.events.InputHandler}
   * @private
   */
  this.inputHandler_ = new goog.events.InputHandler(elInput);

  goog.events.listen(this.inputHandler_,
      goog.events.InputHandler.EventType.INPUT, this.onChange_, false, this);

  this.checkLength_();
};
goog.inherits(goog.ui.CharCounter, goog.events.EventTarget);


/**
 * Sets the maximum length.
 *
 * @param {number} maxLength The maximum length.
 */
goog.ui.CharCounter.prototype.setMaxLength = function(maxLength) {
  this.maxLength_ = maxLength;
  this.elInput_.maxLength = maxLength;
  this.checkLength_();
};


/**
 * Returns the maximum length.
 *
 * @return {number} The maximum length.
 */
goog.ui.CharCounter.prototype.getMaxLength = function() {
  return this.maxLength_;
};


/**
 * Change event handler for input field.
 *
 * @param {goog.events.BrowserEvent} event Change event.
 * @private
 */
goog.ui.CharCounter.prototype.onChange_ = function(event) {
  this.checkLength_();
};


/**
 * Checks length of text in input field and updates the counter. Truncates text
 * if the maximum lengths is exceeded.
 *
 * @private
 */
goog.ui.CharCounter.prototype.checkLength_ = function() {
  var len, value = this.elInput_.value;

  // There's no maxlength property for textareas so instead we truncate the
  // text if it gets too long. It's also used to truncate the text in a input
  // field if the maximum length is changed.
  if (value.length > this.maxLength_) {

    var scrollTop = this.elInput_.scrollTop
    var scrollLeft = this.elInput_.scrollLeft;

    this.elInput_.value = value.substring(0, this.maxLength_);
    len = 0;

    this.elInput_.scrollTop = scrollTop;
    this.elInput_.scrollLeft = scrollLeft;
  } else {
    len = this.maxLength_ - value.length;
  }

  goog.dom.setTextContent(this.elCount_, len);
};


/** @inheritDoc */
goog.ui.CharCounter.prototype.disposeInternal = function() {
  goog.ui.CharCounter.superClass_.disposeInternal.call(this);
  delete this.elInput_;
  this.inputHandler_.dispose();
  this.inputHandler_ = null;
};
