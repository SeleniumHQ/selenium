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
 * @fileoverview Graphics surface type.
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.graphics.ext.Graphics');

goog.require('goog.events.EventType');
goog.require('goog.graphics.ext.Group');



/**
 * Wrapper for a graphics surface.
 * @param {string|number} width The width in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {string|number} height The height in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {?number=} opt_coordWidth The coordinate width - if
 *     omitted or null, defaults to same as width.
 * @param {?number=} opt_coordHeight The coordinate height. - if
 *     omitted or null, defaults to same as height.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @param {boolean=} opt_isSimple Flag used to indicate the graphics object will
 *     be drawn to in a single pass, and the fastest implementation for this
 *     scenario should be favored.  NOTE: Setting to true may result in
 *     degradation of text support.
 * @constructor
 * @extends {goog.graphics.ext.Group}
 */
goog.graphics.ext.Graphics = function(width, height, opt_coordWidth,
    opt_coordHeight, opt_domHelper, opt_isSimple) {
  var surface = opt_isSimple ?
      goog.graphics.createSimpleGraphics(width, height,
          opt_coordWidth, opt_coordHeight, opt_domHelper) :
      goog.graphics.createGraphics(width, height,
          opt_coordWidth, opt_coordHeight, opt_domHelper);
  this.implementation_ = surface;

  goog.graphics.ext.Group.call(this, null, surface.getCanvasElement());

  goog.events.listen(surface, goog.events.EventType.RESIZE,
      this.updateChildren, false, this);
};
goog.inherits(goog.graphics.ext.Graphics, goog.graphics.ext.Group);


/**
 * The root level graphics implementation.
 * @type {goog.graphics.AbstractGraphics}
 * @private
 */
goog.graphics.ext.Graphics.prototype.implementation_;


/**
 * @return {goog.graphics.AbstractGraphics} The graphics implementation layer.
 */
goog.graphics.ext.Graphics.prototype.getImplementation = function() {
  return this.implementation_;
};


/**
 * Changes the coordinate size.
 * @param {number} coordWidth The coordinate width.
 * @param {number} coordHeight The coordinate height.
 */
goog.graphics.ext.Graphics.prototype.setCoordSize = function(coordWidth,
                                                             coordHeight) {
  this.implementation_.setCoordSize(coordWidth, coordHeight);
  goog.graphics.ext.Graphics.superClass_.setSize.call(this, coordWidth,
      coordHeight);
};


/**
 * @return {goog.math.Size} The coordinate size.
 */
goog.graphics.ext.Graphics.prototype.getCoordSize = function() {
  return this.implementation_.getCoordSize();
};


/**
 * Changes the coordinate system position.
 * @param {number} left The coordinate system left bound.
 * @param {number} top The coordinate system top bound.
 */
goog.graphics.ext.Graphics.prototype.setCoordOrigin = function(left, top) {
  this.implementation_.setCoordOrigin(left, top);
};


/**
 * @return {goog.math.Coordinate} The coordinate system position.
 */
goog.graphics.ext.Graphics.prototype.getCoordOrigin = function() {
  return this.implementation_.getCoordOrigin();
};


/**
 * Change the size of the canvas.
 * @param {number} pixelWidth The width in pixels.
 * @param {number} pixelHeight The height in pixels.
 */
goog.graphics.ext.Graphics.prototype.setPixelSize = function(pixelWidth,
                                                        pixelHeight) {
  this.implementation_.setSize(pixelWidth, pixelHeight);

  var coordSize = this.getCoordSize();
  goog.graphics.ext.Graphics.superClass_.setSize.call(this, coordSize.width,
      coordSize.height);
};


/**
 * @return {goog.math.Size?} Returns the number of pixels spanned by the
 *     surface, or null if the size could not be computed due to the size being
 *     specified in percentage points and the component not being in the
 *     document.
 */
goog.graphics.ext.Graphics.prototype.getPixelSize = function() {
  return this.implementation_.getPixelSize();
};


/**
 * @return {number} The coordinate width of the canvas.
 * @override
 */
goog.graphics.ext.Graphics.prototype.getWidth = function() {
  return this.implementation_.getCoordSize().width;
};


/**
 * @return {number} The coordinate width of the canvas.
 * @override
 */
goog.graphics.ext.Graphics.prototype.getHeight = function() {
  return this.implementation_.getCoordSize().height;
};


/**
 * @return {number} Returns the number of pixels per unit in the x direction.
 * @override
 */
goog.graphics.ext.Graphics.prototype.getPixelScaleX = function() {
  return this.implementation_.getPixelScaleX();
};


/**
 * @return {number} Returns the number of pixels per unit in the y direction.
 * @override
 */
goog.graphics.ext.Graphics.prototype.getPixelScaleY = function() {
  return this.implementation_.getPixelScaleY();
};


/**
 * @return {Element} The root element of the graphics surface.
 */
goog.graphics.ext.Graphics.prototype.getElement = function() {
  return this.implementation_.getElement();
};


/**
 * Renders the underlying graphics.
 *
 * @param {Element} parentElement Parent element to render the component into.
 */
goog.graphics.ext.Graphics.prototype.render = function(parentElement) {
  this.implementation_.render(parentElement);
};


/**
 * Never transform a surface.
 * @override
 */
goog.graphics.ext.Graphics.prototype.transform = goog.nullFunction;


/**
 * Called from the parent class, this method resets any pre-computed positions
 * and sizes.
 * @protected
 * @override
 */
goog.graphics.ext.Graphics.prototype.redraw = function() {
  this.transformChildren();
};
