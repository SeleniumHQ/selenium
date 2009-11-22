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

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview A slider implementation that allows to select a value within a
 * range by dragging a thumb. The selected value is exposed through getValue().
 *
 * To decorate, the slider should be bound to an element with the class name
 * 'goog-slider-[vertical / horizontal]' containing a child with the classname
 * 'goog-slider-thumb'.
 *
 * Decorate Example:
 * <div id="slider" class="goog-slider-horizontal">
 *   <div class="goog-twothumbslider-thumb">
 * </div>
 * <script>
 *
 * var slider = new goog.ui.Slider;
 * slider.decorate(document.getElementById('slider'));
 *
 * @see ../demos/slider.html
 */

// Implementation note: We implement slider by inheriting from baseslider,
// which allows to select sub-ranges within a range using two thumbs. All we do
// is we co-locate the two thumbs into one.

goog.provide('goog.ui.Slider');
goog.provide('goog.ui.Slider.Orientation');

goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.Role');
goog.require('goog.ui.SliderBase');
goog.require('goog.ui.SliderBase.Orientation');


/**
 * This creates a slider object.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
goog.ui.Slider = function(opt_domHelper) {
  goog.ui.SliderBase.call(this, opt_domHelper);
  this.rangeModel.setExtent(0);
};
goog.inherits(goog.ui.Slider, goog.ui.SliderBase);


/**
 * Expose Enum of superclass (representing the orientation of the slider) within
 * Slider namespace.
 *
 * @enum {string}
 */
goog.ui.Slider.Orientation = goog.ui.SliderBase.Orientation;


/**
 * The prefix we use for the CSS class names for the slider and its elements.
 * @type {string}
 */
goog.ui.Slider.CSS_CLASS_PREFIX = goog.getCssName('goog-slider');


/**
 * CSS class name for the single thumb element.
 * @type {string}
 */
goog.ui.Slider.THUMB_CSS_CLASS =
    goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'thumb');


/**
 * Returns CSS class applied to the slider element.
 * @param {goog.ui.SliderBase.Orientation} orient Orientation of the slider.
 * @return {string} The CSS class applied to the slider element.
 * @protected
 */
goog.ui.Slider.prototype.getCssClass = function(orient) {
  return orient == goog.ui.SliderBase.Orientation.VERTICAL ?
      goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'vertical') :
      goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'horizontal');
};


/** @inheritDoc */
goog.ui.Slider.prototype.createThumbs = function() {
  // find thumb
  var element = this.getElement();
  var thumb = goog.dom.$$(null, goog.ui.Slider.THUMB_CSS_CLASS, element)[0];
  if (!thumb) {
    thumb = this.createThumb_();
    element.appendChild(thumb);
  }
  this.valueThumb = this.extentThumb = thumb;
};


/**
 * Creates the thumb element.
 * @return {HTMLDivElement} The created thumb element.
 * @private
 */
goog.ui.Slider.prototype.createThumb_ = function() {
  var thumb =
      this.getDomHelper().createDom('div', goog.ui.Slider.THUMB_CSS_CLASS);
  goog.dom.a11y.setRole(thumb, goog.dom.a11y.Role.BUTTON);
  return /** @type {HTMLDivElement} */ (thumb);
};

