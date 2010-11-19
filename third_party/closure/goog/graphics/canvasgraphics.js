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
 * @fileoverview CanvasGraphics sub class that uses the canvas tag for drawing.
 * @author robbyw@google.com (Robby Walker)
 * @author wcrosby@google.com (Wayne Crosby)
 */


goog.provide('goog.graphics.CanvasGraphics');


goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.graphics.AbstractGraphics');
goog.require('goog.graphics.CanvasEllipseElement');
goog.require('goog.graphics.CanvasGroupElement');
goog.require('goog.graphics.CanvasImageElement');
goog.require('goog.graphics.CanvasPathElement');
goog.require('goog.graphics.CanvasRectElement');
goog.require('goog.graphics.CanvasTextElement');
goog.require('goog.graphics.Font');
goog.require('goog.graphics.LinearGradient');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');
goog.require('goog.math.Size');



/**
 * A Graphics implementation for drawing using canvas.
 * @param {string|number} width The (non-zero) width in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {string|number} height The (non-zero) height in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {?number=} opt_coordWidth The coordinate width - if
 *     omitted or null, defaults to same as width.
 * @param {?number=} opt_coordHeight The coordinate height - if
 *     omitted or null, defaults to same as height.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.graphics.AbstractGraphics}
 */
goog.graphics.CanvasGraphics = function(width, height,
                                        opt_coordWidth, opt_coordHeight,
                                        opt_domHelper) {
  goog.graphics.AbstractGraphics.call(this, width, height,
                                      opt_coordWidth, opt_coordHeight,
                                      opt_domHelper);
};
goog.inherits(goog.graphics.CanvasGraphics, goog.graphics.AbstractGraphics);


/**
 * Sets the fill for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element
 *     wrapper.
 * @param {goog.graphics.Fill} fill The fill object.
 */
goog.graphics.CanvasGraphics.prototype.setElementFill = function(element,
    fill) {
  this.redraw();
};


/**
 * Sets the stroke for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element
 *     wrapper.
 * @param {goog.graphics.Stroke} stroke The stroke object.
 */
goog.graphics.CanvasGraphics.prototype.setElementStroke = function(
    element, stroke) {
  this.redraw();
};


/**
 * Set the transformation of an element.
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {number} x The x coordinate of the translation transform.
 * @param {number} y The y coordinate of the translation transform.
 * @param {number} angle The angle of the rotation transform.
 * @param {number} centerX The horizontal center of the rotation transform.
 * @param {number} centerY The vertical center of the rotation transform.
 */
goog.graphics.CanvasGraphics.prototype.setElementTransform = function(element,
    x, y, angle, centerX, centerY) {
  this.redraw();
};


/**
 * Push an element transform on to the transform stack.
 * @param {goog.graphics.Element} element The transformed element.
 */
goog.graphics.CanvasGraphics.prototype.pushElementTransform = function(
    element) {
  var ctx = this.getContext();
  ctx.save();

  var transform = element.getTransform();

  // TODO(robbyw): Test for unsupported transforms i.e. skews.
  var tx = transform.getTranslateX();
  var ty = transform.getTranslateY();
  if (tx || ty) {
    ctx.translate(tx, ty);
  }

  var sinTheta = transform.getShearY();
  if (sinTheta) {
    ctx.rotate(Math.asin(sinTheta));
  }
};


/**
 * Pop an element transform off of the transform stack.
 */
goog.graphics.CanvasGraphics.prototype.popElementTransform = function() {
  this.getContext().restore();
};


/**
 * Creates the DOM representation of the graphics area.
 */
goog.graphics.CanvasGraphics.prototype.createDom = function() {
  var element = this.dom_.createDom('div',
      {'style': 'position:relative;overflow:hidden'});
  this.setElementInternal(element);

  this.canvas_ = this.dom_.createDom('canvas');
  element.appendChild(this.canvas_);

  /**
   * The main canvas element.
   * @type {goog.graphics.CanvasGroupElement}
   */
  this.canvasElement = new goog.graphics.CanvasGroupElement(this);

  this.lastGroup_ = this.canvasElement;
  this.redrawTimeout_ = 0;

  this.updateSize();
};


/**
 * Clears the drawing context object in response to actions that make the old
 * context invalid - namely resize of the canvas element.
 * @private
 */
goog.graphics.CanvasGraphics.prototype.clearContext_ = function() {
  this.context_ = null;
};


/**
 * Returns the drawing context.
 * @return {Object} The canvas element rendering context.
 */
goog.graphics.CanvasGraphics.prototype.getContext = function() {
  if (!this.getElement()) {
    this.createDom();
  }
  if (!this.context_) {
    this.context_ = this.canvas_.getContext('2d');
    this.context_.save();
  }
  return this.context_;
};


/**
 * Changes the coordinate system position.
 * @param {number} left The coordinate system left bound.
 * @param {number} top The coordinate system top bound.
 */
goog.graphics.CanvasGraphics.prototype.setCoordOrigin = function(left, top) {
  this.coordLeft = left;
  this.coordTop = top;
  this.redraw();
};


/**
 * Changes the coordinate size.
 * @param {number} coordWidth The coordinate width.
 * @param {number} coordHeight The coordinate height.
 */
goog.graphics.CanvasGraphics.prototype.setCoordSize = function(coordWidth,
                                                               coordHeight) {
  goog.graphics.CanvasGraphics.superClass_.setCoordSize.apply(this, arguments);
  this.redraw();
};


/**
 * Change the size of the canvas.
 * @param {number} pixelWidth The width in pixels.
 * @param {number} pixelHeight The height in pixels.
 */
goog.graphics.CanvasGraphics.prototype.setSize = function(pixelWidth,
    pixelHeight) {
  this.width = pixelWidth;
  this.height = pixelHeight;

  this.updateSize();
  this.redraw();
};


/** @inheritDoc */
goog.graphics.CanvasGraphics.prototype.getPixelSize = function() {
  // goog.style.getSize does not work for Canvas elements.  We
  // have to compute the size manually if it is percentage based.
  var width = this.width;
  var height = this.height;
  var computeWidth = goog.isString(width) && width.indexOf('%') != -1;
  var computeHeight = goog.isString(height) && height.indexOf('%') != -1;

  if (!this.isInDocument() && (computeWidth || computeHeight)) {
    return null;
  }

  var parent;
  var parentSize;

  if (computeWidth) {
    parent = /** @type {Element} */ (this.getElement().parentNode);
    parentSize = goog.style.getSize(parent);
    width = parseFloat(/** @type {string} */ (width)) * parentSize.width / 100;
  }

  if (computeHeight) {
    parent = parent || /** @type {Element} */ (this.getElement().parentNode);
    parentSize = parentSize || goog.style.getSize(parent);
    height = parseFloat(/** @type {string} */ (height)) * parentSize.height /
        100;
  }

  return new goog.math.Size(/** @type {number} */ (width),
      /** @type {number} */ (height));
};


/**
 * Update the size of the canvas.
 */
goog.graphics.CanvasGraphics.prototype.updateSize = function() {
  goog.style.setSize(this.getElement(), this.width, this.height);

  var pixels = this.getPixelSize();
  if (pixels) {
    goog.style.setSize(this.canvas_,
        /** @type {number} */ (pixels.width),
        /** @type {number} */ (pixels.height));
    this.canvas_.width = pixels.width;
    this.canvas_.height = pixels.height;
    this.clearContext_();
  }
};


/**
 * Reset the canvas.
 */
goog.graphics.CanvasGraphics.prototype.reset = function() {
  var ctx = this.getContext();
  ctx.restore();
  var size = this.getPixelSize();
  if (size.width && size.height) {
    ctx.clearRect(0, 0, size.width, size.height);
  }
  ctx.save();
};


/**
 * Remove all drawing elements from the graphics.
 */
goog.graphics.CanvasGraphics.prototype.clear = function() {
  this.reset();
  this.canvasElement.clear();
  var el = this.getElement();

  // Remove all children (text nodes) except the canvas (which is at index 0)
  while (el.childNodes.length > 1) {
    el.removeChild(el.lastChild);
  }
};


/**
 * Redraw the entire canvas.
 */
goog.graphics.CanvasGraphics.prototype.redraw = function() {
  if (this.preventRedraw_) {
    this.needsRedraw_ = true;
    return;
  }

  if (this.isInDocument()) {
    this.reset();

    if (this.coordWidth) {
      var pixels = this.getPixelSize();
      this.getContext().scale(pixels.width / this.coordWidth,
          pixels.height / this.coordHeight);
    }
    if (this.coordLeft || this.coordTop) {
      this.getContext().translate(-this.coordLeft, -this.coordTop);
    }
    this.pushElementTransform(this.canvasElement);
    this.canvasElement.draw(this.context_);
    this.popElementTransform();
  }
};


/**
 * Draw an element, including any stroke or fill.
 * @param {goog.graphics.Element} element The element to draw.
 */
goog.graphics.CanvasGraphics.prototype.drawElement = function(element) {
  if (element instanceof goog.graphics.CanvasTextElement) {
    // Don't draw text since that is not implemented using canvas.
    return;
  }

  var ctx = this.getContext();
  this.pushElementTransform(element);

  if (!element.getFill || !element.getStroke) {
    // Draw without stroke or fill (e.g. the element is an image or group).
    element.draw(ctx);
    this.popElementTransform();
    return;
  }

  var fill = element.getFill();
  if (fill) {
    if (fill instanceof goog.graphics.SolidFill) {
      if (fill.getOpacity() != 0) {
        ctx.globalAlpha = fill.getOpacity();
        ctx.fillStyle = fill.getColor();
        element.draw(ctx);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else { // (fill instanceof goog.graphics.LinearGradient)
      var linearGradient = ctx.createLinearGradient(fill.getX1(), fill.getY1(),
          fill.getX2(), fill.getY2());
      linearGradient.addColorStop(0.0, fill.getColor1());
      linearGradient.addColorStop(1.0, fill.getColor2());

      ctx.fillStyle = linearGradient;
      element.draw(ctx);
      ctx.fill();
    }
  }

  var stroke = element.getStroke();
  if (stroke) {
    element.draw(ctx);
    ctx.strokeStyle = stroke.getColor();

    var width = stroke.getWidth();
    if (goog.isString(width) && width.indexOf('px') != -1) {
      width = parseFloat(width) / this.getPixelScaleX();
    }
    ctx.lineWidth = width;

    ctx.stroke();
  }

  this.popElementTransform();
};


/**
 * Append an element.
 *
 * @param {goog.graphics.Element} element The element to draw.
 * @param {goog.graphics.CanvasGroupElement|undefined} group The group to draw
 *     it in. If null or undefined, defaults to the root group.
 * @private
 */
goog.graphics.CanvasGraphics.prototype.append_ = function(element, group) {
  group = group || this.canvasElement;
  group.appendChild(element);

  if (this.isDrawable(group)) {
    this.drawElement(element);
  }
};


/**
 * Draw an ellipse.
 *
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @param {goog.graphics.Stroke} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill} fill Fill object describing the fill.
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.EllipseElement} The newly created element.
 */
goog.graphics.CanvasGraphics.prototype.drawEllipse = function(cx, cy, rx, ry,
    stroke, fill, opt_group) {
  var element = new goog.graphics.CanvasEllipseElement(null, this,
      cx, cy, rx, ry, stroke, fill);
  this.append_(element, opt_group);
  return element;
};


/**
 * Draw a rectangle.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @param {goog.graphics.Stroke} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill} fill Fill object describing the fill.
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.RectElement} The newly created element.
 */
goog.graphics.CanvasGraphics.prototype.drawRect = function(x, y, width, height,
    stroke, fill, opt_group) {
  var element = new goog.graphics.CanvasRectElement(null, this,
      x, y, width, height, stroke, fill);
  this.append_(element, opt_group);
  return element;
};


/**
 * Draw an image.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of image.
 * @param {number} height Height of image.
 * @param {string} src Source of the image.
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.ImageElement} The newly created element.
 */
goog.graphics.CanvasGraphics.prototype.drawImage = function(x, y, width, height,
    src, opt_group) {
  var element = new goog.graphics.CanvasImageElement(null, this, x, y, width,
      height, src);
  this.append_(element, opt_group);
  return element;
};


/**
 * Draw a text string vertically centered on a given line.
 *
 * @param {string} text The text to draw.
 * @param {number} x1 X coordinate of start of line.
 * @param {number} y1 Y coordinate of start of line.
 * @param {number} x2 X coordinate of end of line.
 * @param {number} y2 Y coordinate of end of line.
 * @param {?string} align Horizontal alignment: left (default), center, right.
 * @param {!goog.graphics.Font} font Font describing the font properties.
 * @param {goog.graphics.Stroke} stroke Stroke object describing the stroke.
 * @param {goog.graphics.Fill} fill Fill object describing the fill.
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.TextElement} The newly created element.
 */
goog.graphics.CanvasGraphics.prototype.drawTextOnLine = function(
    text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) {
  var element = new goog.graphics.CanvasTextElement(this,
      text, x1, y1, x2, y2, align, font, stroke, fill);
  this.append_(element, opt_group);
  return element;
};


/**
 * Draw a path.
 * @param {!goog.graphics.Path} path The path object to draw.
 * @param {goog.graphics.Stroke} stroke Stroke object describing the stroke.
 * @param {goog.graphics.Fill} fill Fill object describing the fill.
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.PathElement} The newly created element.
 */
goog.graphics.CanvasGraphics.prototype.drawPath = function(path, stroke, fill,
    opt_group) {
  var element = new goog.graphics.CanvasPathElement(null, this, path, stroke,
      fill);
  this.append_(element, opt_group);
  return element;
};


/**
 * @param {goog.graphics.CanvasGroupElement} group The group to possibly
 *     draw to.
 * @return {boolean} Whether drawing can occur now.
 */
goog.graphics.CanvasGraphics.prototype.isDrawable = function(group) {
  return this.isInDocument() && !this.redrawTimeout_ &&
      !this.isRedrawRequired(group);
};


/**
 * Returns true if drawing to the given group means a redraw is required.
 * @param {goog.graphics.CanvasGroupElement} group The group to draw to.
 * @return {boolean} Whether drawing to this group should force a redraw.
 */
goog.graphics.CanvasGraphics.prototype.isRedrawRequired = function(group) {
  // TODO(robbyw): Moving up to any parent of lastGroup should not force redraw.
  return group != this.canvasElement && group != this.lastGroup_;
};


/**
 * Create an empty group of drawing elements.
 *
 * @param {goog.graphics.CanvasGroupElement=} opt_group The group wrapper
 *     element to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.CanvasGroupElement} The newly created group.
 */
goog.graphics.CanvasGraphics.prototype.createGroup = function(opt_group) {
  var group = new goog.graphics.CanvasGroupElement(this);

  opt_group = opt_group || this.canvasElement;

  // TODO(robbyw): Moving up to any parent group should not force redraw.
  if (opt_group == this.canvasElement || opt_group == this.lastGroup_) {
    this.lastGroup_ = group;
  }

  this.append_(group, opt_group);

  return group;
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
 */
goog.graphics.CanvasGraphics.prototype.getTextWidth = goog.abstractMethod;


/**
 * Disposes of the component by removing event handlers, detacing DOM nodes from
 * the document body, and removing references to them.
 */
goog.graphics.CanvasGraphics.prototype.disposeInternal = function() {
  this.context_ = null;
  goog.graphics.CanvasGraphics.superClass_.disposeInternal.call(this);
};


/** @inheritDoc */
goog.graphics.CanvasGraphics.prototype.enterDocument = function() {
  var oldPixelSize = this.getPixelSize();
  goog.graphics.CanvasGraphics.superClass_.enterDocument.call(this);
  if (!oldPixelSize) {
    this.updateSize();
    this.dispatchEvent(goog.events.EventType.RESIZE);
  }
  this.redraw();
};


/**
 * Start preventing redraws - useful for chaining large numbers of changes
 * together.  Not guaranteed to do anything - i.e. only use this for
 * optimization of a single code path.
 */
goog.graphics.CanvasGraphics.prototype.suspend = function() {
  this.preventRedraw_ = true;
};


/**
 * Stop preventing redraws.  If any redraws had been prevented, a redraw will
 * be done now.
 */
goog.graphics.CanvasGraphics.prototype.resume = function() {
  this.preventRedraw_ = false;

  if (this.needsRedraw_) {
    this.redraw();
    this.needsRedraw_ = false;
  }
};
