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
 * @fileoverview A slider implementation that allows to select a value within a
 * range by dragging a thumb. The selected value is exposed through getValue().
 *
 * To decorate, the slider should be bound to an element with the class name
 * 'goog-slider' containing a child with the class name 'goog-slider-thumb',
 * whose position is set to relative.
 * Note that you won't be able to see these elements unless they are styled.
 *
 * Slider orientation is horizontal by default.
 * Use setOrientation(goog.ui.Slider.Orientation.VERTICAL) for a vertical
 * slider.
 *
 * Decorate Example:
 * <div id="slider" class="goog-slider">
 *   <div class="goog-slider-thumb"></div>
 * </div>
 *
 * JavaScript code:
 * <code>
 *   var slider = new goog.ui.Slider;
 *   slider.decorate(document.getElementById('slider'));
 * </code>
 *
 * @author arv@google.com (Erik Arvidsson)
 * @see ../demos/slider.html
 */

// Implementation note: We implement slider by inheriting from baseslider,
// which allows to select sub-ranges within a range using two thumbs. All we do
// is we co-locate the two thumbs into one.

goog.provide('goog.ui.Slider');
goog.provide('goog.ui.Slider.Orientation');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.SliderBase');



/**
 * This creates a slider object.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {(function(number):?string)=} opt_labelFn An optional function mapping
 *     slider values to a description of the value.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
goog.ui.Slider = function(opt_domHelper, opt_labelFn) {
  goog.ui.SliderBase.call(this, opt_domHelper, opt_labelFn);
  this.rangeModel.setExtent(0);
};
goog.inherits(goog.ui.Slider, goog.ui.SliderBase);
goog.tagUnsealableClass(goog.ui.Slider);


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
 * @override
 */
goog.ui.Slider.prototype.getCssClass = function(orient) {
  return orient == goog.ui.SliderBase.Orientation.VERTICAL ?
      goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'vertical') :
      goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'horizontal');
};


/** @override */
goog.ui.Slider.prototype.createThumbs = function() {
  // find thumb
  var element = this.getElement();
  var thumb = goog.dom.getElementsByTagNameAndClass(
      null, goog.ui.Slider.THUMB_CSS_CLASS, element)[0];
  if (!thumb) {
    thumb = this.createThumb_();
    element.appendChild(thumb);
  }
  this.valueThumb = this.extentThumb = thumb;
};


/**
 * Creates the thumb element.
 * @return {!HTMLDivElement} The created thumb element.
 * @private
 */
goog.ui.Slider.prototype.createThumb_ = function() {
  var thumb = this.getDomHelper().createDom(goog.dom.TagName.DIV,
                                            goog.ui.Slider.THUMB_CSS_CLASS);
  goog.a11y.aria.setRole(thumb, goog.a11y.aria.Role.BUTTON);
  return /** @type {!HTMLDivElement} */ (thumb);
};
