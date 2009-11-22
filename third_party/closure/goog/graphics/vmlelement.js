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

// Copyright 2007 Google Inc. All Rights Reserved.


/**
 * @fileoverview Thin wrappers around the DOM element returned from
 * the different draw methods of the graphics. This is the VML implementation.
 */

goog.provide('goog.graphics.VmlEllipseElement');
goog.provide('goog.graphics.VmlGroupElement');
goog.provide('goog.graphics.VmlImageElement');
goog.provide('goog.graphics.VmlPathElement');
goog.provide('goog.graphics.VmlRectElement');
goog.provide('goog.graphics.VmlTextElement');


goog.require('goog.dom');
goog.require('goog.graphics.EllipseElement');
goog.require('goog.graphics.GroupElement');
goog.require('goog.graphics.ImageElement');
goog.require('goog.graphics.PathElement');
goog.require('goog.graphics.RectElement');
goog.require('goog.graphics.TextElement');


/**
 * Thin wrapper for VML group elements.
 * This is an implementation of the goog.graphics.GroupElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics The graphics creating
 *     this element.
 * @constructor
 * @extends {goog.graphics.GroupElement}
 */
goog.graphics.VmlGroupElement = function(element, graphics) {
  goog.graphics.GroupElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.VmlGroupElement, goog.graphics.GroupElement);


/**
 * Remove all drawing elements from the group.
 */
goog.graphics.VmlGroupElement.prototype.clear = function() {
  goog.dom.removeChildren(this.getElement());
};


/**
 * @return {boolean} True if this group is the root canvas element.
 * @private
 */
goog.graphics.VmlGroupElement.prototype.isRootElement_ = function() {
  return this.getGraphics().getCanvasElement() == this;
};


/**
 * Set the size of the group element.
 * @param {number} width The width of the group element.
 * @param {number} height The height of the group element.
 */
goog.graphics.VmlGroupElement.prototype.setSize = function(width, height) {
  var element = this.getElement();

  var style = element.style;
  style.width = goog.graphics.VmlGraphics.toSizePx(width);
  style.height = goog.graphics.VmlGraphics.toSizePx(height);

  element.coordsize = goog.graphics.VmlGraphics.toSizeCoord(width) + ' ' +
      goog.graphics.VmlGraphics.toSizeCoord(height);

  // Don't overwrite the root element's origin.
  if (!this.isRootElement_()) {
    element.coordorigin = '0 0';
  }
};


/**
 * Thin wrapper for VML ellipse elements.
 * This is an implementation of the goog.graphics.EllipseElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics  The graphics creating
 *     this element.
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.EllipseElement}
 */
goog.graphics.VmlEllipseElement = function(element, graphics,
    cx, cy, rx, ry, stroke, fill) {
  goog.graphics.EllipseElement.call(this, element, graphics, stroke, fill);

  // Store center and radius for future calls to setRadius or setCenter.

  /**
   * X coordinate of the ellipse center.
   * @type {number}
   */
  this.cx = cx;


  /**
   * Y coordinate of the ellipse center.
   * @type {number}
   */
  this.cy = cy;


  /**
   * Radius length for the x-axis.
   * @type {number}
   */
  this.rx = rx;


  /**
   * Radius length for the y-axis.
   * @type {number}
   */
  this.ry = ry;
};
goog.inherits(goog.graphics.VmlEllipseElement, goog.graphics.EllipseElement);


/**
 * Update the center point of the ellipse.
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 */
goog.graphics.VmlEllipseElement.prototype.setCenter = function(cx, cy) {
  this.cx = cx;
  this.cy = cy;
  goog.graphics.VmlGraphics.setPositionAndSize(this.getElement(),
      cx - this.rx, cy - this.ry, this.rx * 2, this.ry * 2);
};


/**
 * Update the radius of the ellipse.
 * @param {number} rx Center X coordinate.
 * @param {number} ry Center Y coordinate.
 */
goog.graphics.VmlEllipseElement.prototype.setRadius = function(rx, ry) {
  this.rx = rx;
  this.ry = ry;
  goog.graphics.VmlGraphics.setPositionAndSize(this.getElement(),
      this.cx - rx, this.cy - ry, rx * 2, ry * 2);
};


/**
 * Thin wrapper for VML rectangle elements.
 * This is an implementation of the goog.graphics.RectElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.RectElement}
 */
goog.graphics.VmlRectElement = function(element, graphics, stroke, fill) {
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlRectElement, goog.graphics.RectElement);


/**
 * Update the position of the rectangle.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 */
goog.graphics.VmlRectElement.prototype.setPosition = function(x, y) {
  var style = this.getElement().style;
  style.left = goog.graphics.VmlGraphics.toPosPx(x);
  style.top = goog.graphics.VmlGraphics.toPosPx(y);
};


/**
 * Update the size of the rectangle.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 */
goog.graphics.VmlRectElement.prototype.setSize = function(width, height) {
  var style = this.getElement().style;
  style.width = goog.graphics.VmlGraphics.toSizePx(width);
  style.height = goog.graphics.VmlGraphics.toSizePx(height);
};


/**
 * Thin wrapper for VML path elements.
 * This is an implementation of the goog.graphics.PathElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.PathElement}
 */
goog.graphics.VmlPathElement = function(element, graphics, stroke, fill) {
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlPathElement, goog.graphics.PathElement);


/**
 * Update the underlying path.
 * @param {goog.graphics.Path} path The path object to draw.
 */
goog.graphics.VmlPathElement.prototype.setPath = function(path) {
  goog.graphics.VmlGraphics.setAttribute(
      this.getElement(), 'path', goog.graphics.VmlGraphics.getVmlPath(path));
};


/**
 * Thin wrapper for VML text elements.
 * This is an implementation of the goog.graphics.TextElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.TextElement}
 */
goog.graphics.VmlTextElement = function(element, graphics, stroke, fill) {
  goog.graphics.TextElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlTextElement, goog.graphics.TextElement);


/**
 * Update the displayed text of the element.
 * @param {string} text The text to draw.
 */
goog.graphics.VmlTextElement.prototype.setText = function(text) {
  goog.graphics.VmlGraphics.setAttribute(this.getElement().childNodes[1],
      'string', text);
};

/**
 * Thin wrapper for VML image elements.
 * This is an implementation of the goog.graphics.ImageElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.VmlGraphics} graphics The graphics creating
 *     this element.
 * @constructor
 * @extends {goog.graphics.ImageElement}
 */
goog.graphics.VmlImageElement = function(element, graphics) {
  goog.graphics.ImageElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.VmlImageElement, goog.graphics.ImageElement);


/**
 * Update the position of the image.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 */
goog.graphics.VmlImageElement.prototype.setPosition = function(x, y) {
  var style = this.getElement().style;
  style.left = goog.graphics.VmlGraphics.toPosPx(x);
  style.top = goog.graphics.VmlGraphics.toPosPx(y);
};


/**
 * Update the size of the image.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 */
goog.graphics.VmlImageElement.prototype.setSize = function(width, height) {
  var style = this.getElement().style;
  style.width = goog.graphics.VmlGraphics.toPosPx(width);
  style.height = goog.graphics.VmlGraphics.toPosPx(height);
};


/**
 * Update the source of the image.
 * @param {string} src Source of the image.
 */
goog.graphics.VmlImageElement.prototype.setSource = function(src) {
  goog.graphics.VmlGraphics.setAttribute(this.getElement(), 'src', src);
};
