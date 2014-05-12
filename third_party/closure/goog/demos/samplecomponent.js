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
 * @fileoverview A simple, sample component.
 *
 */
goog.provide('goog.demos.SampleComponent');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.Component');



/**
 * A simple box that changes colour when clicked. This class demonstrates the
 * goog.ui.Component API, and is keyboard accessible, as per
 * http://wiki/Main/ClosureKeyboardAccessible
 *
 * @param {string=} opt_label A label to display. Defaults to "Click Me" if none
 *     provided.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 * @final
 */
goog.demos.SampleComponent = function(opt_label, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * The label to display.
   * @type {string}
   * @private
   */
  this.initialLabel_ = opt_label || 'Click Me';

  /**
   * The current color.
   * @type {string}
   * @private
   */
  this.color_ = 'red';

  /**
   * Keyboard handler for this object. This object is created once the
   * component's DOM element is known.
   *
   * @type {goog.events.KeyHandler?}
   * @private
   */
  this.kh_ = null;
};
goog.inherits(goog.demos.SampleComponent, goog.ui.Component);


/**
 * Changes the color of the element.
 * @private
 */
goog.demos.SampleComponent.prototype.changeColor_ = function() {
  if (this.color_ == 'red') {
    this.color_ = 'green';
  } else if (this.color_ == 'green') {
    this.color_ = 'blue';
  } else {
    this.color_ = 'red';
  }
  this.getElement().style.backgroundColor = this.color_;
};


/**
 * Creates an initial DOM representation for the component.
 * @override
 */
goog.demos.SampleComponent.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/**
 * Decorates an existing HTML DIV element as a SampleComponent.
 *
 * @param {Element} element The DIV element to decorate. The element's
 *    text, if any will be used as the component's label.
 * @override
 */
goog.demos.SampleComponent.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  if (!this.getLabelText()) {
    this.setLabelText(this.initialLabel_);
  }

  var elem = this.getElement();
  goog.dom.classlist.add(elem, goog.getCssName('goog-sample-component'));
  elem.style.backgroundColor = this.color_;
  elem.tabIndex = 0;

  this.kh_ = new goog.events.KeyHandler(elem);
  this.getHandler().listen(this.kh_, goog.events.KeyHandler.EventType.KEY,
      this.onKey_);
};


/** @override */
goog.demos.SampleComponent.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  if (this.kh_) {
    this.kh_.dispose();
  }
};


/**
 * Called when component's element is known to be in the document.
 * @override
 */
goog.demos.SampleComponent.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK,
      this.onDivClicked_);
};


/**
 * Called when component's element is known to have been removed from the
 * document.
 * @override
 */
goog.demos.SampleComponent.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
};


/**
 * Gets the current label text.
 *
 * @return {string} The current text set into the label, or empty string if
 *     none set.
 */
goog.demos.SampleComponent.prototype.getLabelText = function() {
  if (!this.getElement()) {
    return '';
  }
  return goog.dom.getTextContent(this.getElement());
};


/**
 * Handles DIV element clicks, causing the DIV's colour to change.
 * @param {goog.events.Event} event The click event.
 * @private
 */
goog.demos.SampleComponent.prototype.onDivClicked_ = function(event) {
  this.changeColor_();
};


/**
 * Fired when user presses a key while the DIV has focus. If the user presses
 * space or enter, the color will be changed.
 * @param {goog.events.Event} event The key event.
 * @private
 */
goog.demos.SampleComponent.prototype.onKey_ = function(event) {
  var keyCodes = goog.events.KeyCodes;
  if (event.keyCode == keyCodes.SPACE || event.keyCode == keyCodes.ENTER) {
    this.changeColor_();
  }
};


/**
 * Sets the current label text. Has no effect if component is not rendered.
 *
 * @param {string} text The text to set as the label.
 */
goog.demos.SampleComponent.prototype.setLabelText = function(text) {
  if (this.getElement()) {
    goog.dom.setTextContent(this.getElement(), text);
  }
};
