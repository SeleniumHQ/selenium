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
 * @fileoverview Thin wrappers around the DOM element returned from
 * the different draw methods of the graphics. This is the VML implementation.
 * @author arv@google.com (Erik Arvidsson)
 * @author yoah@google.com (Yoah Bar-David)
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
 * Returns the VML element corresponding to this object.  This method is added
 * to several classes below.  Note that the return value of this method may
 * change frequently in IE8, so it should not be cached externally.
 * @return {Element} The VML element corresponding to this object.
 * @this {goog.graphics.VmlGroupElement|goog.graphics.VmlEllipseElement|
 *     goog.graphics.VmlRectElement|goog.graphics.VmlPathElement|
 *     goog.graphics.VmlTextElement|goog.graphics.VmlImageElement}
 * @private
 */
goog.graphics.vmlGetElement_ = function() {
  this.element_ = this.getGraphics().getVmlElement(this.id_) || this.element_;
  return this.element_;
};



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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlGroupElement = function(element, graphics) {
  this.id_ = element.id;
  goog.graphics.GroupElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.VmlGroupElement, goog.graphics.GroupElement);


/** @override */
goog.graphics.VmlGroupElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Remove all drawing elements from the group.
 * @override
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
 * @param {number|string} width The width of the group element.
 * @param {number|string} height The height of the group element.
 * @override
 */
goog.graphics.VmlGroupElement.prototype.setSize = function(width, height) {
  var element = this.getElement();

  var style = element.style;
  style.width = /** @suppress {missingRequire} */ (
      goog.graphics.VmlGraphics.toSizePx(width));
  style.height = /** @suppress {missingRequire} */ (
      goog.graphics.VmlGraphics.toSizePx(height));

  element.coordsize = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toSizeCoord(width) +
      ' ' +
      /** @suppress {missingRequire} */
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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlEllipseElement = function(element, graphics,
    cx, cy, rx, ry, stroke, fill) {
  this.id_ = element.id;

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


/** @override */
goog.graphics.VmlEllipseElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Update the center point of the ellipse.
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @override
 */
goog.graphics.VmlEllipseElement.prototype.setCenter = function(cx, cy) {
  this.cx = cx;
  this.cy = cy;
  /** @suppress {missingRequire} */
  goog.graphics.VmlGraphics.setPositionAndSize(this.getElement(),
      cx - this.rx, cy - this.ry, this.rx * 2, this.ry * 2);
};


/**
 * Update the radius of the ellipse.
 * @param {number} rx Center X coordinate.
 * @param {number} ry Center Y coordinate.
 * @override
 */
goog.graphics.VmlEllipseElement.prototype.setRadius = function(rx, ry) {
  this.rx = rx;
  this.ry = ry;
  /** @suppress {missingRequire} */
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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlRectElement = function(element, graphics, stroke, fill) {
  this.id_ = element.id;
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlRectElement, goog.graphics.RectElement);


/** @override */
goog.graphics.VmlRectElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Update the position of the rectangle.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @override
 */
goog.graphics.VmlRectElement.prototype.setPosition = function(x, y) {
  var style = this.getElement().style;

  style.left = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(x);
  style.top = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(y);
};


/**
 * Update the size of the rectangle.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @override
 */
goog.graphics.VmlRectElement.prototype.setSize = function(width, height) {
  var style = this.getElement().style;
  style.width = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toSizePx(width);
  style.height = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toSizePx(height);
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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlPathElement = function(element, graphics, stroke, fill) {
  this.id_ = element.id;
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlPathElement, goog.graphics.PathElement);


/** @override */
goog.graphics.VmlPathElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Update the underlying path.
 * @param {!goog.graphics.Path} path The path object to draw.
 * @override
 */
goog.graphics.VmlPathElement.prototype.setPath = function(path) {
  /** @suppress {missingRequire} */
  goog.graphics.VmlGraphics.setAttribute(
      this.getElement(), 'path',
      /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.getVmlPath(path));
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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlTextElement = function(element, graphics, stroke, fill) {
  this.id_ = element.id;
  goog.graphics.TextElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.VmlTextElement, goog.graphics.TextElement);


/** @override */
goog.graphics.VmlTextElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Update the displayed text of the element.
 * @param {string} text The text to draw.
 * @override
 */
goog.graphics.VmlTextElement.prototype.setText = function(text) {
  /** @suppress {missingRequire} */
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
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.VmlImageElement = function(element, graphics) {
  this.id_ = element.id;
  goog.graphics.ImageElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.VmlImageElement, goog.graphics.ImageElement);


/** @override */
goog.graphics.VmlImageElement.prototype.getElement =
    goog.graphics.vmlGetElement_;


/**
 * Update the position of the image.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @override
 */
goog.graphics.VmlImageElement.prototype.setPosition = function(x, y) {
  var style = this.getElement().style;

  style.left = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(x);
  style.top = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(y);
};


/**
 * Update the size of the image.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @override
 */
goog.graphics.VmlImageElement.prototype.setSize = function(width, height) {
  var style = this.getElement().style;
  style.width = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(width);
  style.height = /** @suppress {missingRequire} */
      goog.graphics.VmlGraphics.toPosPx(height);
};


/**
 * Update the source of the image.
 * @param {string} src Source of the image.
 * @override
 */
goog.graphics.VmlImageElement.prototype.setSource = function(src) {
  /** @suppress {missingRequire} */
  goog.graphics.VmlGraphics.setAttribute(this.getElement(), 'src', src);
};
