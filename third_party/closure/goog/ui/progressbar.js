// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implementation of a progress bar.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @see ../demos/progressbar.html
 */


goog.provide('goog.ui.ProgressBar');
goog.provide('goog.ui.ProgressBar.Orientation');

goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.RangeModel');
goog.require('goog.userAgent');



/**
 * This creates a progress bar object.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.ProgressBar = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The underlying data model for the progress bar.
   * @type {goog.ui.RangeModel}
   * @private
   */
  this.rangeModel_ = new goog.ui.RangeModel;
  goog.events.listen(this.rangeModel_, goog.ui.Component.EventType.CHANGE,
                     this.handleChange_, false, this);
};
goog.inherits(goog.ui.ProgressBar, goog.ui.Component);


/**
 * Enum for representing the orientation of the progress bar.
 *
 * @enum {string}
 */
goog.ui.ProgressBar.Orientation = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};


/**
 * Map from progress bar orientation to CSS class names.
 * @type {Object}
 * @private
 */
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_ = {};
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[
    goog.ui.ProgressBar.Orientation.VERTICAL] =
        goog.getCssName('progress-bar-vertical');
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[
    goog.ui.ProgressBar.Orientation.HORIZONTAL] =
        goog.getCssName('progress-bar-horizontal');


/**
 * Creates the DOM nodes needed for the progress bar
 * @override
 */
goog.ui.ProgressBar.prototype.createDom = function() {
  this.thumbElement_ = this.createThumb_();
  var cs = goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[this.orientation_];
  this.setElementInternal(
      this.getDomHelper().createDom('div', cs, this.thumbElement_));
  this.setValueState_();
  this.setMinimumState_();
  this.setMaximumState_();
};


/** @override */
goog.ui.ProgressBar.prototype.enterDocument = function() {
  goog.ui.ProgressBar.superClass_.enterDocument.call(this);
  this.attachEvents_();
  this.updateUi_();

  // state live = polite will notify the user of updates,
  // but will not interrupt ongoing feedback
  goog.dom.a11y.setRole(this.getElement(), 'progressbar');
  goog.dom.a11y.setState(this.getElement(), 'live', 'polite');
};


/** @override */
goog.ui.ProgressBar.prototype.exitDocument = function() {
  goog.ui.ProgressBar.superClass_.exitDocument.call(this);
  this.detachEvents_();
};


/**
 * This creates the thumb element.
 * @private
 * @return {HTMLDivElement} The created thumb element.
 */
goog.ui.ProgressBar.prototype.createThumb_ = function() {
  return /** @type {HTMLDivElement} */ (this.getDomHelper().createDom('div',
      goog.getCssName('progress-bar-thumb')));
};


/**
 * Adds the initial event listeners to the element.
 * @private
 */
goog.ui.ProgressBar.prototype.attachEvents_ = function() {
  if (goog.userAgent.IE && goog.userAgent.VERSION < 7) {
    goog.events.listen(this.getElement(), goog.events.EventType.RESIZE,
                       this.updateUi_, false, this);
  }
};


/**
 * Removes the event listeners added by attachEvents_.
 * @private
 */
goog.ui.ProgressBar.prototype.detachEvents_ = function() {
  if (goog.userAgent.IE && goog.userAgent.VERSION < 7) {
    goog.events.unlisten(this.getElement(), goog.events.EventType.RESIZE,
                         this.updateUi_, false, this);
  }
};


/**
 * Decorates an existing HTML DIV element as a progress bar input. If the
 * element contains a child with a class name of 'progress-bar-thumb' that will
 * be used as the thumb.
 * @param {Element} element  The HTML element to decorate.
 * @override
 */
goog.ui.ProgressBar.prototype.decorateInternal = function(element) {
  goog.ui.ProgressBar.superClass_.decorateInternal.call(this, element);
  goog.dom.classes.add(this.getElement(), goog.ui.ProgressBar.
      ORIENTATION_TO_CSS_NAME_[this.orientation_]);

  // find thumb
  var thumb = goog.dom.getElementsByTagNameAndClass(
      null, goog.getCssName('progress-bar-thumb'), this.getElement())[0];
  if (!thumb) {
    thumb = this.createThumb_();
    this.getElement().appendChild(thumb);
  }
  this.thumbElement_ = thumb;
};


/**
 * @return {number} The value.
 */
goog.ui.ProgressBar.prototype.getValue = function() {
  return this.rangeModel_.getValue();
};


/**
 * Sets the value
 * @param {number} v The value.
 */
goog.ui.ProgressBar.prototype.setValue = function(v) {
  this.rangeModel_.setValue(v);
  if (this.getElement()) {
    this.setValueState_();
  }
};


/**
 * Sets the state for a11y of the current value.
 * @private
 */
goog.ui.ProgressBar.prototype.setValueState_ = function() {
  goog.dom.a11y.setState(this.getElement(), 'valuenow', this.getValue());
};


/**
 * @return {number} The minimum value.
 */
goog.ui.ProgressBar.prototype.getMinimum = function() {
  return this.rangeModel_.getMinimum();
};


/**
 * Sets the minimum number
 * @param {number} v The minimum value.
 */
goog.ui.ProgressBar.prototype.setMinimum = function(v) {
  this.rangeModel_.setMinimum(v);
  if (this.getElement()) {
    this.setMinimumState_();
  }
};


/**
 * Sets the state for a11y of the minimum value.
 * @private
 */
goog.ui.ProgressBar.prototype.setMinimumState_ = function() {
  goog.dom.a11y.setState(this.getElement(), 'valuemin', this.getMinimum());
};


/**
 * @return {number} The maximum value.
 */
goog.ui.ProgressBar.prototype.getMaximum = function() {
  return this.rangeModel_.getMaximum();
};


/**
 * Sets the maximum number
 * @param {number} v The maximum value.
 */
goog.ui.ProgressBar.prototype.setMaximum = function(v) {
  this.rangeModel_.setMaximum(v);
  if (this.getElement()) {
    this.setMaximumState_();
  }
};


/**
 * Sets the state for a11y of the maximum valiue.
 * @private
 */
goog.ui.ProgressBar.prototype.setMaximumState_ = function() {
  goog.dom.a11y.setState(this.getElement(), 'valuemax', this.getMaximum());
};


/**
 *
 * @type {goog.ui.ProgressBar.Orientation}
 * @private
 */
goog.ui.ProgressBar.prototype.orientation_ =
    goog.ui.ProgressBar.Orientation.HORIZONTAL;


/**
 * Call back when the internal range model changes
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.ui.ProgressBar.prototype.handleChange_ = function(e) {
  this.updateUi_();
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * This is called when we need to update the size of the thumb. This happens
 * when first created as well as when the value and the orientation changes.
 * @private
 */
goog.ui.ProgressBar.prototype.updateUi_ = function() {
  if (this.thumbElement_) {
    var min = this.getMinimum();
    var max = this.getMaximum();
    var val = this.getValue();
    var ratio = (val - min) / (max - min);
    var size = Math.round(ratio * 100);
    if (this.orientation_ == goog.ui.ProgressBar.Orientation.VERTICAL) {
      // Note(arv): IE up to version 6 has some serious computation bugs when
      // using percentages or bottom. We therefore first set the height to
      // 100% and measure that and base the top and height on that size instead.
      if (goog.userAgent.IE && goog.userAgent.VERSION < 7) {
        this.thumbElement_.style.top = 0;
        this.thumbElement_.style.height = '100%';
        var h = this.thumbElement_.offsetHeight;
        var bottom = Math.round(ratio * h);
        this.thumbElement_.style.top = h - bottom + 'px';
        this.thumbElement_.style.height = bottom + 'px';
      } else {
        this.thumbElement_.style.top = (100 - size) + '%';
        this.thumbElement_.style.height = size + '%';
      }
    } else {
      this.thumbElement_.style.width = size + '%';
    }
  }
};


/**
 * This is called when we need to setup the UI sizes and positions. This
 * happens when we create the element and when we change the orientation.
 * @private
 */
goog.ui.ProgressBar.prototype.initializeUi_ = function() {
  var tStyle = this.thumbElement_.style;
  if (this.orientation_ == goog.ui.ProgressBar.Orientation.VERTICAL) {
    tStyle.left = 0;
    tStyle.width = '100%';
  } else {
    tStyle.top = tStyle.left = 0;
    tStyle.height = '100%';
  }
};


/**
 * Changes the orientation
 * @param {goog.ui.ProgressBar.Orientation} orient The orientation.
 */
goog.ui.ProgressBar.prototype.setOrientation = function(orient) {
  if (this.orientation_ != orient) {
    var oldCss =
        goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[this.orientation_];
    var newCss = goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[orient];
    this.orientation_ = orient;

    // Update the DOM
    if (this.getElement()) {
      goog.dom.classes.swap(this.getElement(), oldCss, newCss);
      this.initializeUi_();
      this.updateUi_();
    }
  }
};


/**
 * @return {goog.ui.ProgressBar.Orientation} The orientation of the
 *     progress bar.
 */
goog.ui.ProgressBar.prototype.getOrientation = function() {
  return this.orientation_;
};


/** @override */
goog.ui.ProgressBar.prototype.disposeInternal = function() {
  this.detachEvents_();
  goog.ui.ProgressBar.superClass_.disposeInternal.call(this);
  this.thumbElement_ = null;
  this.rangeModel_.dispose();
};


/**
 * @return {?number} The step value used to determine how to round the value.
 */
goog.ui.ProgressBar.prototype.getStep = function() {
  return this.rangeModel_.getStep();
};


/**
 * Sets the step value. The step value is used to determine how to round the
 * value.
 * @param {?number} step  The step size.
 */
goog.ui.ProgressBar.prototype.setStep = function(step) {
  this.rangeModel_.setStep(step);
};
