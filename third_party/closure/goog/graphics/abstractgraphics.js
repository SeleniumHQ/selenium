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
 * @fileoverview Graphics utility functions and factory methods.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.graphics.AbstractGraphics');

goog.require('goog.graphics.Path');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Base class for the different graphics. You should never construct objects
 * of this class. Instead us goog.graphics.createGraphics
 * @param {number|string} width The width in pixels or percent.
 * @param {number|string} height The height in pixels or percent.
 * @param {?number=} opt_coordWidth Optional coordinate system width - if
 *     omitted or null, defaults to same as width.
 * @param {?number=} opt_coordHeight Optional coordinate system height - if
 *     omitted or null, defaults to same as height.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.graphics.AbstractGraphics = function(width, height,
                                          opt_coordWidth, opt_coordHeight,
                                          opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Width of graphics in pixels or percentage points.
   * @type {number|string}
   * @protected
   */
  this.width = width;

  /**
   * Height of graphics in pixels or precentage points.
   * @type {number|string}
   * @protected
   */
  this.height = height;

  /**
   * Width of coordinate system in units.
   * @type {?number}
   * @protected
   */
  this.coordWidth = opt_coordWidth || null;

  /**
   * Height of coordinate system in units.
   * @type {?number}
   * @protected
   */
  this.coordHeight = opt_coordHeight || null;
};
goog.inherits(goog.graphics.AbstractGraphics, goog.ui.Component);


/**
 * The root level group element.
 * @type {goog.graphics.GroupElement?}
 * @protected
 */
goog.graphics.AbstractGraphics.prototype.canvasElement = null;


/**
 * Left coordinate of the view box
 * @type {number}
 * @protected
 */
goog.graphics.AbstractGraphics.prototype.coordLeft = 0;


/**
 * Top coordinate of the view box
 * @type {number}
 * @protected
 */
goog.graphics.AbstractGraphics.prototype.coordTop = 0;


/**
 * @return {goog.graphics.GroupElement} The root level canvas element.
 */
goog.graphics.AbstractGraphics.prototype.getCanvasElement = function() {
  return this.canvasElement;
};


/**
 * Changes the coordinate size.
 * @param {number} coordWidth  The coordinate width.
 * @param {number} coordHeight  The coordinate height.
 */
goog.graphics.AbstractGraphics.prototype.setCoordSize = function(coordWidth,
                                                                 coordHeight) {
  this.coordWidth = coordWidth;
  this.coordHeight = coordHeight;
};


/**
 * @return {goog.math.Size} The coordinate size.
 */
goog.graphics.AbstractGraphics.prototype.getCoordSize = function() {
  if (this.coordWidth) {
    return new goog.math.Size(this.coordWidth,
        /** @type {number} */ (this.coordHeight));
  } else {
    return this.getPixelSize();
  }
};


/**
 * Changes the coordinate system position.
 * @param {number} left  The coordinate system left bound.
 * @param {number} top  The coordinate system top bound.
 */
goog.graphics.AbstractGraphics.prototype.setCoordOrigin = goog.abstractMethod;


/**
 * @return {goog.math.Coordinate} The coordinate system position.
 */
goog.graphics.AbstractGraphics.prototype.getCoordOrigin = function() {
  return new goog.math.Coordinate(this.coordLeft, this.coordTop);
};


/**
 * Change the size of the canvas.
 * @param {number} pixelWidth  The width in pixels.
 * @param {number} pixelHeight  The height in pixels.
 */
goog.graphics.AbstractGraphics.prototype.setSize = goog.abstractMethod;


/**
 * @return {goog.math.Size} The size of canvas.
 * @deprecated Use getPixelSize.
 */
goog.graphics.AbstractGraphics.prototype.getSize = function() {
  return this.getPixelSize();
};


/**
 * @return {goog.math.Size?} Returns the number of pixels spanned by the
 *     surface, or null if the size could not be computed due to the size being
 *     specified in percentage points and the component not being in the
 *     document.
 */
goog.graphics.AbstractGraphics.prototype.getPixelSize = function() {
  if (this.isInDocument()) {
    return goog.style.getSize(this.getElement());
  }
  if (goog.isNumber(this.width) && goog.isNumber(this.height)) {
    return new goog.math.Size(this.width, this.height);
  }
  return null;
};


/**
 * @return {number} Returns the number of pixels per unit in the x direction.
 */
goog.graphics.AbstractGraphics.prototype.getPixelScaleX = function() {
  var pixelSize = this.getPixelSize();
  return pixelSize ? pixelSize.width / this.getCoordSize().width : 0;
};


/**
 * @return {number} Returns the number of pixels per unit in the y direction.
 */
goog.graphics.AbstractGraphics.prototype.getPixelScaleY = function() {
  var pixelSize = this.getPixelSize();
  return pixelSize ? pixelSize.height / this.getCoordSize().height : 0;
};


/**
 * Remove all drawing elements from the graphics.
 */
goog.graphics.AbstractGraphics.prototype.clear = goog.abstractMethod;


/**
 * Remove a single drawing element from the surface.  The default implementation
 * assumes a DOM based drawing surface.
 * @param {goog.graphics.Element} element The element to remove.
 */
goog.graphics.AbstractGraphics.prototype.removeElement = function(element) {
  goog.dom.removeNode(element.getElement());
};


/**
 * Sets the fill for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Fill?} fill The fill object.
 */
goog.graphics.AbstractGraphics.prototype.setElementFill = goog.abstractMethod;


/**
 * Sets the stroke for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Stroke?} stroke The stroke object.
 */
goog.graphics.AbstractGraphics.prototype.setElementStroke = goog.abstractMethod;


/**
 * Set the transformation of an element.
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {number} x The x coordinate of the translation transform.
 * @param {number} y The y coordinate of the translation transform.
 * @param {number} angle The angle of the rotation transform.
 * @param {number} centerX The horizontal center of the rotation transform.
 * @param {number} centerY The vertical center of the rotation transform.
 */
goog.graphics.AbstractGraphics.prototype.setElementTransform =
    goog.abstractMethod;


/**
 * Draw a circle
 *
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} r Radius length.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.EllipseElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawCircle = function(
    cx, cy, r, stroke, fill, opt_group) {
  return this.drawEllipse(cx, cy, r, r, stroke, fill, opt_group);
};


/**
 * Draw an ellipse
 *
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.EllipseElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawEllipse = goog.abstractMethod;


/**
 * Draw a rectangle
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.RectElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawRect = goog.abstractMethod;


/**
 * Draw a text string within a rectangle (drawing is horizontal)
 *
 * @param {string} text The text to draw.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @param {string} align Horizontal alignment: left (default), center, right.
 * @param {string} vAlign Vertical alignment: top (default), center, bottom.
 * @param {goog.graphics.Font} font Font describing the font properties.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill  Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.TextElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawText = function(
    text, x, y, width, height, align, vAlign, font, stroke, fill, opt_group) {
  var baseline = font.size / 2; // Baseline is middle of line
  var textY;
  if (vAlign == 'bottom') {
    textY = y + height - baseline;
  } else if (vAlign == 'center') {
    textY = y + height / 2;
  } else {
    textY = y + baseline;
  }

  return this.drawTextOnLine(text, x, textY, x + width, textY, align,
      font, stroke, fill, opt_group);
};


/**
 * Draw a text string vertically centered on a given line.
 *
 * @param {string} text  The text to draw.
 * @param {number} x1 X coordinate of start of line.
 * @param {number} y1 Y coordinate of start of line.
 * @param {number} x2 X coordinate of end of line.
 * @param {number} y2 Y coordinate of end of line.
 * @param {string} align Horizontal alingnment: left (default), center, right.
 * @param {goog.graphics.Font} font Font describing the font properties.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.TextElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawTextOnLine = goog.abstractMethod;


/**
 * Draw a path.
 *
 * @param {!goog.graphics.Path} path The path object to draw.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.PathElement} The newly created element.
 */
goog.graphics.AbstractGraphics.prototype.drawPath = goog.abstractMethod;


/**
 * Create an empty group of drawing elements.
 *
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element to
 *     append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.GroupElement} The newly created group.
 */
goog.graphics.AbstractGraphics.prototype.createGroup = goog.abstractMethod;


/**
 * Create an empty path.
 *
 * @return {goog.graphics.Path} The path.
 * @deprecated Use {@code new goog.graphics.Path()}.
 */
goog.graphics.AbstractGraphics.prototype.createPath = function() {
  return new goog.graphics.Path();
};


/**
 * Measure and return the width (in pixels) of a given text string.
 * Text measurement is needed to make sure a text can fit in the allocated
 * area. The way text length is measured is by writing it into a div that is
 * after the visible area, measure the div width, and immediatly erase the
 * written value.
 *
 * @param {string} text The text string to measure.
 * @param {goog.graphics.Font} font The font object describing the font style.
 *
 * @return {number} The width in pixels of the text strings.
 */
goog.graphics.AbstractGraphics.prototype.getTextWidth = goog.abstractMethod;


/**
 * @return {boolean} Whether the underlying element can be cloned resulting in
 *     an accurate reproduction of the graphics contents.
 */
goog.graphics.AbstractGraphics.prototype.isDomClonable = function() {
  return false;
};


/**
 * Start preventing redraws - useful for chaining large numbers of changes
 * together.  Not guaranteed to do anything - i.e. only use this for
 * optimization of a single code path.
 */
goog.graphics.AbstractGraphics.prototype.suspend = function() {
};


/**
 * Stop preventing redraws.  If any redraws had been prevented, a redraw will
 * be done now.
 */
goog.graphics.AbstractGraphics.prototype.resume = function() {
};
