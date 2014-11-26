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
 * @fileoverview Component for an input field with bidi direction automatic
 * detection. The input element directionality is automatically set according
 * to the contents (value) of the element.
 *
 * @see ../demos/bidiinput.html
 */


goog.provide('goog.ui.BidiInput');


goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.InputHandler');
goog.require('goog.i18n.bidi');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.ui.Component');



/**
 * Default implementation of BidiInput.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper  Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.BidiInput = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(goog.ui.BidiInput, goog.ui.Component);
goog.tagUnsealableClass(goog.ui.BidiInput);


/**
 * The input handler that provides the input event.
 * @type {goog.events.InputHandler?}
 * @private
 */
goog.ui.BidiInput.prototype.inputHandler_ = null;


/**
 * Decorates the given HTML element as a BidiInput. The HTML element can be an
 * input element with type='text', a textarea element, or any contenteditable.
 * Overrides {@link goog.ui.Component#decorateInternal}.  Considered protected.
 * @param {Element} element  Element to decorate.
 * @protected
 * @override
 */
goog.ui.BidiInput.prototype.decorateInternal = function(element) {
  goog.ui.BidiInput.superClass_.decorateInternal.call(this, element);
  this.init_();
};


/**
 * Creates the element for the text input.
 * @protected
 * @override
 */
goog.ui.BidiInput.prototype.createDom = function() {
  this.setElementInternal(
      this.getDomHelper().createDom('input', {'type': 'text'}));
  this.init_();
};


/**
 * Initializes the events and initial text direction.
 * Called from either decorate or createDom, after the input field has
 * been created.
 * @private
 */
goog.ui.BidiInput.prototype.init_ = function() {
  // Set initial direction by current text
  this.setDirection_();

  // Listen to value change events
  this.inputHandler_ = new goog.events.InputHandler(this.getElement());
  goog.events.listen(this.inputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.setDirection_, false, this);
};


/**
 * Set the direction of the input element based on the current value. If the
 * value does not have any strongly directional characters, remove the dir
 * attribute so that the direction is inherited instead.
 * This method is called when the user changes the input element value, or
 * when a program changes the value using
 * {@link goog.ui.BidiInput#setValue}
 * @private
 */
goog.ui.BidiInput.prototype.setDirection_ = function() {
  var element = this.getElement();
  var text = this.getValue();
  switch (goog.i18n.bidi.estimateDirection(text)) {
    case (goog.i18n.bidi.Dir.LTR):
      element.dir = 'ltr';
      break;
    case (goog.i18n.bidi.Dir.RTL):
      element.dir = 'rtl';
      break;
    default:
      // Default for no direction, inherit from document.
      element.removeAttribute('dir');
  }
};


/**
 * Returns the direction of the input element.
 * @return {?string} Return 'rtl' for right-to-left text,
 *     'ltr' for left-to-right text, or null if the value itself is not
 *     enough to determine directionality (e.g. an empty value), and the
 *     direction is inherited from a parent element (typically the body
 *     element).
 */
goog.ui.BidiInput.prototype.getDirection = function() {
  var dir = this.getElement().dir;
  if (dir == '') {
    dir = null;
  }
  return dir;
};


/**
 * Sets the value of the underlying input field, and sets the direction
 * according to the given value.
 * @param {string} value  The Value to set in the underlying input field.
 */
goog.ui.BidiInput.prototype.setValue = function(value) {
  var element = this.getElement();
  if (goog.isDefAndNotNull(element.value)) {
    element.value = value;
  } else {
    goog.dom.setTextContent(element, value);
  }
  this.setDirection_();
};


/**
 * Returns the value of the underlying input field.
 * @return {string} Value of the underlying input field.
 */
goog.ui.BidiInput.prototype.getValue = function() {
  var element = this.getElement();
  return goog.isDefAndNotNull(element.value) ? element.value :
      goog.dom.getRawTextContent(element);
};


/** @override */
goog.ui.BidiInput.prototype.disposeInternal = function() {
  if (this.inputHandler_) {
    goog.events.removeAll(this.inputHandler_);
    this.inputHandler_.dispose();
    this.inputHandler_ = null;
    goog.ui.BidiInput.superClass_.disposeInternal.call(this);
  }
};
