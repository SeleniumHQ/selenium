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
 * @fileoverview Twothumbslider is a slider that allows to select a subrange
 * within a range by dragging two thumbs. The selected sub-range is exposed
 * through getValue() and getExtent().
 *
 * To decorate, the twothumbslider should be bound to an element with the class
 * name 'goog-twothumbslider-[vertical / horizontal]' containing children with
 * the classname 'goog-twothumbslider-value-thumb' and
 * 'goog-twothumbslider-extent-thumb', respectively.
 *
 * Decorate Example:
 * <div id="twothumbslider" class="goog-twothumbslider-horizontal">
 *   <div class="goog-twothumbslider-value-thumb">
 *   <div class="goog-twothumbslider-extent-thumb">
 * </div>
 * <script>
 *
 * var slider = new goog.ui.TwoThumbSlider;
 * slider.decorate(document.getElementById('twothumbslider'));
 *
 * TODO(user): add a11y once we know what this element is
 *
 * @see ../demos/twothumbslider.html
 */

goog.provide('goog.ui.TwoThumbSlider');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.SliderBase');



/**
 * This creates a TwoThumbSlider object.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
goog.ui.TwoThumbSlider = function(opt_domHelper) {
  goog.ui.SliderBase.call(this, opt_domHelper);
  this.rangeModel.setValue(this.getMinimum());
  this.rangeModel.setExtent(this.getMaximum() - this.getMinimum());
};
goog.inherits(goog.ui.TwoThumbSlider, goog.ui.SliderBase);
goog.tagUnsealableClass(goog.ui.TwoThumbSlider);


/**
 * The prefix we use for the CSS class names for the slider and its elements.
 * @type {string}
 */
goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX =
    goog.getCssName('goog-twothumbslider');


/**
 * CSS class name for the value thumb element.
 * @type {string}
 */
goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS =
    goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'value-thumb');


/**
 * CSS class name for the extent thumb element.
 * @type {string}
 */
goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS =
    goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'extent-thumb');


/**
 * CSS class name for the range highlight element.
 * @type {string}
 */
goog.ui.TwoThumbSlider.RANGE_HIGHLIGHT_CSS_CLASS =
    goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'rangehighlight');


/**
 * @param {goog.ui.SliderBase.Orientation} orient orientation of the slider.
 * @return {string} The CSS class applied to the twothumbslider element.
 * @protected
 * @override
 */
goog.ui.TwoThumbSlider.prototype.getCssClass = function(orient) {
  return orient == goog.ui.SliderBase.Orientation.VERTICAL ?
      goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'vertical') :
      goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'horizontal');
};


/**
 * This creates a thumb element with the specified CSS class name.
 * @param {string} cs  CSS class name of the thumb to be created.
 * @return {!HTMLDivElement} The created thumb element.
 * @private
 */
goog.ui.TwoThumbSlider.prototype.createThumb_ = function(cs) {
  var thumb = this.getDomHelper().createDom(goog.dom.TagName.DIV, cs);
  goog.a11y.aria.setRole(thumb, goog.a11y.aria.Role.BUTTON);
  return /** @type {!HTMLDivElement} */ (thumb);
};


/**
 * Creates the thumb members for a twothumbslider. If the
 * element contains a child with a class name 'goog-twothumbslider-value-thumb'
 * (or 'goog-twothumbslider-extent-thumb', respectively), then that will be used
 * as the valueThumb (or as the extentThumb, respectively). If the element
 * contains a child with a class name 'goog-twothumbslider-rangehighlight',
 * then that will be used as the range highlight.
 * @override
 */
goog.ui.TwoThumbSlider.prototype.createThumbs = function() {
  // find range highlight and thumbs
  var valueThumb = goog.dom.getElementsByTagNameAndClass(
      null, goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS, this.getElement())[0];
  var extentThumb = goog.dom.getElementsByTagNameAndClass(
      null, goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS,
      this.getElement())[0];
  var rangeHighlight = goog.dom.getElementsByTagNameAndClass(
      null, goog.ui.TwoThumbSlider.RANGE_HIGHLIGHT_CSS_CLASS,
      this.getElement())[0];
  if (!valueThumb) {
    valueThumb =
        this.createThumb_(goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS);
    this.getElement().appendChild(valueThumb);
  }
  if (!extentThumb) {
    extentThumb =
        this.createThumb_(goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS);
    this.getElement().appendChild(extentThumb);
  }
  if (!rangeHighlight) {
    rangeHighlight = this.getDomHelper().createDom(
        goog.dom.TagName.DIV, goog.ui.TwoThumbSlider.RANGE_HIGHLIGHT_CSS_CLASS);
    // Insert highlight before value thumb so that it renders under the thumbs.
    this.getDomHelper().insertSiblingBefore(rangeHighlight, valueThumb);
  }
  this.valueThumb = /** @type {!HTMLDivElement} */ (valueThumb);
  this.extentThumb = /** @type {!HTMLDivElement} */ (extentThumb);
  this.rangeHighlight = /** @type {!HTMLDivElement} */ (rangeHighlight);
};
