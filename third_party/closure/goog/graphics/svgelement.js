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
 * the different draw methods of the graphics. This is the SVG implementation.
 * @author arv@google.com (Erik Arvidsson)
 * @author yoah@google.com (Yoah Bar-David)
 */

goog.provide('goog.graphics.SvgEllipseElement');
goog.provide('goog.graphics.SvgGroupElement');
goog.provide('goog.graphics.SvgImageElement');
goog.provide('goog.graphics.SvgPathElement');
goog.provide('goog.graphics.SvgRectElement');
goog.provide('goog.graphics.SvgTextElement');


goog.require('goog.dom');
goog.require('goog.graphics.EllipseElement');
goog.require('goog.graphics.GroupElement');
goog.require('goog.graphics.ImageElement');
goog.require('goog.graphics.PathElement');
goog.require('goog.graphics.RectElement');
goog.require('goog.graphics.TextElement');



/**
 * Thin wrapper for SVG group elements.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @constructor
 * @extends {goog.graphics.GroupElement}
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.SvgGroupElement = function(element, graphics) {
  goog.graphics.GroupElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.SvgGroupElement, goog.graphics.GroupElement);


/**
 * Remove all drawing elements from the group.
 * @override
 */
goog.graphics.SvgGroupElement.prototype.clear = function() {
  goog.dom.removeChildren(this.getElement());
};


/**
 * Set the size of the group element.
 * @param {number|string} width The width of the group element.
 * @param {number|string} height The height of the group element.
 * @override
 */
goog.graphics.SvgGroupElement.prototype.setSize = function(width, height) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'width': width, 'height': height});
};



/**
 * Thin wrapper for SVG ellipse elements.
 * This is an implementation of the goog.graphics.EllipseElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.EllipseElement}
 */
goog.graphics.SvgEllipseElement = function(element, graphics, stroke, fill) {
  goog.graphics.EllipseElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.SvgEllipseElement, goog.graphics.EllipseElement);


/**
 * Update the center point of the ellipse.
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @override
 */
goog.graphics.SvgEllipseElement.prototype.setCenter = function(cx, cy) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'cx': cx, 'cy': cy});
};


/**
 * Update the radius of the ellipse.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @override
 */
goog.graphics.SvgEllipseElement.prototype.setRadius = function(rx, ry) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'rx': rx, 'ry': ry});
};



/**
 * Thin wrapper for SVG rectangle elements.
 * This is an implementation of the goog.graphics.RectElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.RectElement}
 */
goog.graphics.SvgRectElement = function(element, graphics, stroke, fill) {
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.SvgRectElement, goog.graphics.RectElement);


/**
 * Update the position of the rectangle.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @override
 */
goog.graphics.SvgRectElement.prototype.setPosition = function(x, y) {
  this.getGraphics().setElementAttributes(this.getElement(), {'x': x, 'y': y});
};


/**
 * Update the size of the rectangle.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @override
 */
goog.graphics.SvgRectElement.prototype.setSize = function(width, height) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'width': width, 'height': height});
};



/**
 * Thin wrapper for SVG path elements.
 * This is an implementation of the goog.graphics.PathElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.PathElement}
 */
goog.graphics.SvgPathElement = function(element, graphics, stroke, fill) {
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.SvgPathElement, goog.graphics.PathElement);


/**
 * Update the underlying path.
 * @param {!goog.graphics.Path} path The path object to draw.
 * @override
 */
goog.graphics.SvgPathElement.prototype.setPath = function(path) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'d': /** @suppress {missingRequire} */
            goog.graphics.SvgGraphics.getSvgPath(path)});
};



/**
 * Thin wrapper for SVG text elements.
 * This is an implementation of the goog.graphics.TextElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.TextElement}
 */
goog.graphics.SvgTextElement = function(element, graphics, stroke, fill) {
  goog.graphics.TextElement.call(this, element, graphics, stroke, fill);
};
goog.inherits(goog.graphics.SvgTextElement, goog.graphics.TextElement);


/**
 * Update the displayed text of the element.
 * @param {string} text The text to draw.
 * @override
 */
goog.graphics.SvgTextElement.prototype.setText = function(text) {
  this.getElement().firstChild.data = text;
};



/**
 * Thin wrapper for SVG image elements.
 * This is an implementation of the goog.graphics.ImageElement interface.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.SvgGraphics} graphics The graphics creating
 *     this element.
 * @constructor
 * @extends {goog.graphics.ImageElement}
 */
goog.graphics.SvgImageElement = function(element, graphics) {
  goog.graphics.ImageElement.call(this, element, graphics);
};
goog.inherits(goog.graphics.SvgImageElement, goog.graphics.ImageElement);


/**
 * Update the position of the image.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @override
 */
goog.graphics.SvgImageElement.prototype.setPosition = function(x, y) {
  this.getGraphics().setElementAttributes(this.getElement(), {'x': x, 'y': y});
};


/**
 * Update the size of the image.
 * @param {number} width Width of image.
 * @param {number} height Height of image.
 * @override
 */
goog.graphics.SvgImageElement.prototype.setSize = function(width, height) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'width': width, 'height': height});
};


/**
 * Update the source of the image.
 * @param {string} src Source of the image.
 * @override
 */
goog.graphics.SvgImageElement.prototype.setSource = function(src) {
  this.getGraphics().setElementAttributes(this.getElement(),
      {'xlink:href': src});
};
