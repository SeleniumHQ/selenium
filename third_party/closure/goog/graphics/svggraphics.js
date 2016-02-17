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
 * @fileoverview SvgGraphics sub class that uses SVG to draw the graphics.
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.graphics.SvgGraphics');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.graphics.AbstractGraphics');
goog.require('goog.graphics.LinearGradient');
goog.require('goog.graphics.Path');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');
goog.require('goog.graphics.SvgEllipseElement');
goog.require('goog.graphics.SvgGroupElement');
goog.require('goog.graphics.SvgImageElement');
goog.require('goog.graphics.SvgPathElement');
goog.require('goog.graphics.SvgRectElement');
goog.require('goog.graphics.SvgTextElement');
goog.require('goog.math');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * A Graphics implementation for drawing using SVG.
 * @param {string|number} width The width in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {string|number} height The height in pixels.  Strings
 *     expressing percentages of parent with (e.g. '80%') are also accepted.
 * @param {?number=} opt_coordWidth The coordinate width - if
 *     omitted or null, defaults to same as width.
 * @param {?number=} opt_coordHeight The coordinate height - if
 *     omitted or null, defaults to same as height.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.graphics.AbstractGraphics}
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 * @final
 */
goog.graphics.SvgGraphics = function(
    width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) {
  goog.graphics.AbstractGraphics.call(
      this, width, height, opt_coordWidth, opt_coordHeight, opt_domHelper);

  /**
   * Map from def key to id of def root element.
   * Defs are global "defines" of svg that are used to share common attributes,
   * for example gradients.
   * @type {Object}
   * @private
   */
  this.defs_ = {};

  /**
   * Whether to manually implement viewBox by using a coordinate transform.
   * As of 1/11/08 this is necessary for Safari 3 but not for the nightly
   * WebKit build. Apply to webkit versions < 526. 525 is the
   * last version used by Safari 3.1.
   * @type {boolean}
   * @private
   */
  this.useManualViewbox_ =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher(526);

  /**
   * Event handler.
   * @type {goog.events.EventHandler<!goog.graphics.SvgGraphics>}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.graphics.SvgGraphics, goog.graphics.AbstractGraphics);


/**
 * The SVG namespace URN
 * @private
 * @type {string}
 */
goog.graphics.SvgGraphics.SVG_NS_ = 'http://www.w3.org/2000/svg';


/**
 * The name prefix for def entries
 * @private
 * @type {string}
 */
goog.graphics.SvgGraphics.DEF_ID_PREFIX_ = '_svgdef_';


/**
 * The next available unique identifier for a def entry.
 * This is a static variable, so that when multiple graphics are used in one
 * document, the same def id can not be re-defined by another SvgGraphics.
 * @type {number}
 * @private
 */
goog.graphics.SvgGraphics.nextDefId_ = 0;


/**
 * Svg element for definitions for other elements, e.g. linear gradients.
 * @type {Element}
 * @private
 */
goog.graphics.SvgGraphics.prototype.defsElement_;


/**
 * Creates an SVG element. Used internally and by different SVG classes.
 * @param {string} tagName The type of element to create.
 * @param {Object=} opt_attributes Map of name-value pairs for attributes.
 * @return {!Element} The created element.
 * @private
 */
goog.graphics.SvgGraphics.prototype.createSvgElement_ = function(
    tagName, opt_attributes) {
  var element = this.dom_.getDocument().createElementNS(
      goog.graphics.SvgGraphics.SVG_NS_, tagName);

  if (opt_attributes) {
    this.setElementAttributes(element, opt_attributes);
  }

  return element;
};


/**
 * Sets properties to an SVG element. Used internally and by different
 * SVG elements.
 * @param {Element} element The svg element.
 * @param {Object} attributes Map of name-value pairs for attributes.
 */
goog.graphics.SvgGraphics.prototype.setElementAttributes = function(
    element, attributes) {
  for (var key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
};


/**
 * Appends an element.
 *
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 * @private
 */
goog.graphics.SvgGraphics.prototype.append_ = function(element, opt_group) {
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element.getElement());
};


/**
 * Sets the fill of the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Fill?} fill The fill object.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setElementFill = function(element, fill) {
  var svgElement = element.getElement();
  if (fill instanceof goog.graphics.SolidFill) {
    svgElement.setAttribute('fill', fill.getColor());
    svgElement.setAttribute('fill-opacity', fill.getOpacity());
  } else if (fill instanceof goog.graphics.LinearGradient) {
    // create a def key which is just a concat of all the relevant fields
    var defKey = 'lg-' + fill.getX1() + '-' + fill.getY1() + '-' +
        fill.getX2() + '-' + fill.getY2() + '-' + fill.getColor1() + '-' +
        fill.getColor2();
    // It seems that the SVG version accepts opacity where the VML does not

    var id = this.getDef(defKey);

    if (!id) {  // No def for this yet, create it
      // Create the gradient def entry (only linear gradient are supported)
      var gradient = this.createSvgElement_('linearGradient', {
        'x1': fill.getX1(),
        'y1': fill.getY1(),
        'x2': fill.getX2(),
        'y2': fill.getY2(),
        'gradientUnits': 'userSpaceOnUse'
      });

      var gstyle = 'stop-color:' + fill.getColor1();
      if (goog.isNumber(fill.getOpacity1())) {
        gstyle += ';stop-opacity:' + fill.getOpacity1();
      }
      var stop1 =
          this.createSvgElement_('stop', {'offset': '0%', 'style': gstyle});
      gradient.appendChild(stop1);

      // LinearGradients don't have opacity in VML so implement that before
      // enabling the following code.
      // if (fill.getOpacity() != null) {
      //   gstyles += 'opacity:' + fill.getOpacity() + ';'
      // }
      gstyle = 'stop-color:' + fill.getColor2();
      if (goog.isNumber(fill.getOpacity2())) {
        gstyle += ';stop-opacity:' + fill.getOpacity2();
      }
      var stop2 =
          this.createSvgElement_('stop', {'offset': '100%', 'style': gstyle});
      gradient.appendChild(stop2);

      // LinearGradients don't have opacity in VML so implement that before
      // enabling the following code.
      // if (fill.getOpacity() != null) {
      //   gstyles += 'opacity:' + fill.getOpacity() + ';'
      // }

      id = this.addDef(defKey, gradient);
    }

    // Link element to linearGradient definition
    svgElement.setAttribute('fill', 'url(#' + id + ')');
  } else {
    svgElement.setAttribute('fill', 'none');
  }
};


/**
 * Sets the stroke of the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Stroke?} stroke The stroke object.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setElementStroke = function(
    element, stroke) {
  var svgElement = element.getElement();
  if (stroke) {
    svgElement.setAttribute('stroke', stroke.getColor());
    svgElement.setAttribute('stroke-opacity', stroke.getOpacity());

    var width = stroke.getWidth();
    if (goog.isString(width) && width.indexOf('px') != -1) {
      svgElement.setAttribute(
          'stroke-width', parseFloat(width) / this.getPixelScaleX());
    } else {
      svgElement.setAttribute('stroke-width', width);
    }
  } else {
    svgElement.setAttribute('stroke', 'none');
  }
};


/**
 * Set the translation and rotation of an element.
 *
 * If a more general affine transform is needed than this provides
 * (e.g. skew and scale) then use setElementAffineTransform.
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {number} x The x coordinate of the translation transform.
 * @param {number} y The y coordinate of the translation transform.
 * @param {number} angle The angle of the rotation transform.
 * @param {number} centerX The horizontal center of the rotation transform.
 * @param {number} centerY The vertical center of the rotation transform.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setElementTransform = function(
    element, x, y, angle, centerX, centerY) {
  element.getElement().setAttribute(
      'transform', 'translate(' + x + ',' + y + ') rotate(' + angle + ' ' +
          centerX + ' ' + centerY + ')');
};


/**
 * Set the transformation of an element.
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {!goog.graphics.AffineTransform} affineTransform The
 *     transformation applied to this element.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setElementAffineTransform = function(
    element, affineTransform) {
  var t = affineTransform;
  var substr = [
    t.getScaleX(), t.getShearY(), t.getShearX(), t.getScaleY(),
    t.getTranslateX(), t.getTranslateY()
  ].join(',');
  element.getElement().setAttribute('transform', 'matrix(' + substr + ')');
};


/**
 * Creates the DOM representation of the graphics area.
 * @override
 */
goog.graphics.SvgGraphics.prototype.createDom = function() {
  // Set up the standard attributes.
  var attributes =
      {'width': this.width, 'height': this.height, 'overflow': 'hidden'};

  var svgElement = this.createSvgElement_('svg', attributes);

  var groupElement = this.createSvgElement_('g');

  this.defsElement_ = this.createSvgElement_('defs');
  this.canvasElement = new goog.graphics.SvgGroupElement(groupElement, this);

  svgElement.appendChild(this.defsElement_);
  svgElement.appendChild(groupElement);

  // Use the svgElement as the root element.
  this.setElementInternal(svgElement);

  // Set up the coordinate system.
  this.setViewBox_();
};


/**
 * Changes the coordinate system position.
 * @param {number} left The coordinate system left bound.
 * @param {number} top The coordinate system top bound.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setCoordOrigin = function(left, top) {
  this.coordLeft = left;
  this.coordTop = top;

  this.setViewBox_();
};


/**
 * Changes the coordinate size.
 * @param {number} coordWidth The coordinate width.
 * @param {number} coordHeight The coordinate height.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setCoordSize = function(
    coordWidth, coordHeight) {
  goog.graphics.SvgGraphics.superClass_.setCoordSize.apply(this, arguments);
  this.setViewBox_();
};


/**
 * @return {string} The view box string.
 * @private
 */
goog.graphics.SvgGraphics.prototype.getViewBox_ = function() {
  return this.coordLeft + ' ' + this.coordTop + ' ' +
      (this.coordWidth ? this.coordWidth + ' ' + this.coordHeight : '');
};


/**
 * Sets up the view box.
 * @private
 */
goog.graphics.SvgGraphics.prototype.setViewBox_ = function() {
  if (this.coordWidth || this.coordLeft || this.coordTop) {
    this.getElement().setAttribute('preserveAspectRatio', 'none');
    if (this.useManualViewbox_) {
      this.updateManualViewBox_();
    } else {
      this.getElement().setAttribute('viewBox', this.getViewBox_());
    }
  }
};


/**
 * Updates the transform of the root element to fake a viewBox.  Should only
 * be called when useManualViewbox_ is set.
 * @private
 */
goog.graphics.SvgGraphics.prototype.updateManualViewBox_ = function() {
  if (!this.isInDocument() ||
      !(this.coordWidth || this.coordLeft || !this.coordTop)) {
    return;
  }

  var size = this.getPixelSize();
  if (size.width == 0) {
    // In Safari, invisible SVG is sometimes shown.  Explicitly hide it.
    this.getElement().style.visibility = 'hidden';
    return;
  }

  this.getElement().style.visibility = '';

  var offsetX = -this.coordLeft;
  var offsetY = -this.coordTop;
  var scaleX = size.width / this.coordWidth;
  var scaleY = size.height / this.coordHeight;

  this.canvasElement.getElement().setAttribute(
      'transform', 'scale(' + scaleX + ' ' + scaleY + ') ' +
          'translate(' + offsetX + ' ' + offsetY + ')');
};


/**
 * Change the size of the canvas.
 * @param {number} pixelWidth The width in pixels.
 * @param {number} pixelHeight The height in pixels.
 * @override
 */
goog.graphics.SvgGraphics.prototype.setSize = function(
    pixelWidth, pixelHeight) {
  goog.style.setSize(this.getElement(), pixelWidth, pixelHeight);
};


/** @override */
goog.graphics.SvgGraphics.prototype.getPixelSize = function() {
  if (!goog.userAgent.GECKO) {
    return this.isInDocument() ?
        goog.style.getSize(this.getElement()) :
        goog.graphics.SvgGraphics.base(this, 'getPixelSize');
  }

  // In Gecko, goog.style.getSize does not work for SVG elements.  We have to
  // compute the size manually if it is percentage based.
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
    height =
        parseFloat(/** @type {string} */ (height)) * parentSize.height / 100;
  }

  return new goog.math.Size(
      /** @type {number} */ (width),
      /** @type {number} */ (height));
};


/**
 * Remove all drawing elements from the graphics.
 * @override
 */
goog.graphics.SvgGraphics.prototype.clear = function() {
  this.canvasElement.clear();
  goog.dom.removeChildren(this.defsElement_);
  this.defs_ = {};
};


/**
 * Draw an ellipse.
 *
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.EllipseElement} The newly created element.
 * @override
 */
goog.graphics.SvgGraphics.prototype.drawEllipse = function(
    cx, cy, rx, ry, stroke, fill, opt_group) {
  var element = this.createSvgElement_(
      'ellipse', {'cx': cx, 'cy': cy, 'rx': rx, 'ry': ry});
  var wrapper =
      new goog.graphics.SvgEllipseElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw a rectangle.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.RectElement} The newly created element.
 * @override
 */
goog.graphics.SvgGraphics.prototype.drawRect = function(
    x, y, width, height, stroke, fill, opt_group) {
  var element = this.createSvgElement_(
      'rect', {'x': x, 'y': y, 'width': width, 'height': height});
  var wrapper = new goog.graphics.SvgRectElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw an image.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @param {string} src The source fo the image.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.ImageElement} The newly created image wrapped in a
 *     rectangle element.
 */
goog.graphics.SvgGraphics.prototype.drawImage = function(
    x, y, width, height, src, opt_group) {
  var element = this.createSvgElement_('image', {
    'x': x,
    'y': y,
    'width': width,
    'height': height,
    'image-rendering': 'optimizeQuality',
    'preserveAspectRatio': 'none'
  });
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
  var wrapper = new goog.graphics.SvgImageElement(element, this);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw a text string vertically centered on a given line.
 *
 * @param {string} text The text to draw.
 * @param {number} x1 X coordinate of start of line.
 * @param {number} y1 Y coordinate of start of line.
 * @param {number} x2 X coordinate of end of line.
 * @param {number} y2 Y coordinate of end of line.
 * @param {string} align Horizontal alignment: left (default), center, right.
 * @param {goog.graphics.Font} font Font describing the font properties.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.TextElement} The newly created element.
 * @override
 */
goog.graphics.SvgGraphics.prototype.drawTextOnLine = function(
    text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) {
  var angle = Math.round(goog.math.angle(x1, y1, x2, y2));
  var dx = x2 - x1;
  var dy = y2 - y1;
  var lineLength = Math.round(Math.sqrt(dx * dx + dy * dy));  // Length of line

  // SVG baseline is on the glyph's base line. We estimate it as 85% of the
  // font height. This is just a rough estimate, but do not have a better way.
  var fontSize = font.size;
  var attributes = {'font-family': font.family, 'font-size': fontSize};
  var baseline = Math.round(fontSize * 0.85);
  var textY = Math.round(y1 - (fontSize / 2) + baseline);
  var textX = x1;
  if (align == 'center') {
    textX += Math.round(lineLength / 2);
    attributes['text-anchor'] = 'middle';
  } else if (align == 'right') {
    textX += lineLength;
    attributes['text-anchor'] = 'end';
  }
  attributes['x'] = textX;
  attributes['y'] = textY;
  if (font.bold) {
    attributes['font-weight'] = 'bold';
  }
  if (font.italic) {
    attributes['font-style'] = 'italic';
  }
  if (angle != 0) {
    attributes['transform'] = 'rotate(' + angle + ' ' + x1 + ' ' + y1 + ')';
  }

  var element = this.createSvgElement_('text', attributes);
  element.appendChild(this.dom_.getDocument().createTextNode(text));

  // Bypass a Firefox-Mac bug where text fill is ignored. If text has no stroke,
  // set a stroke, otherwise the text will not be visible.
  if (stroke == null && goog.userAgent.GECKO && goog.userAgent.MAC) {
    var color = 'black';
    // For solid fills, use the fill color
    if (fill instanceof goog.graphics.SolidFill) {
      color = fill.getColor();
    }
    stroke = new goog.graphics.Stroke(1, color);
  }

  var wrapper = new goog.graphics.SvgTextElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw a path.
 *
 * @param {!goog.graphics.Path} path The path object to draw.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the
 *    stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.PathElement} The newly created element.
 * @override
 */
goog.graphics.SvgGraphics.prototype.drawPath = function(
    path, stroke, fill, opt_group) {

  var element = this.createSvgElement_(
      'path', {'d': goog.graphics.SvgGraphics.getSvgPath(path)});
  var wrapper = new goog.graphics.SvgPathElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Returns a string representation of a logical path suitable for use in
 * an SVG element.
 *
 * @param {goog.graphics.Path} path The logical path.
 * @return {string} The SVG path representation.
 * @suppress {deprecated} goog.graphics is deprecated.
 */
goog.graphics.SvgGraphics.getSvgPath = function(path) {
  var list = [];
  path.forEachSegment(function(segment, args) {
    switch (segment) {
      case goog.graphics.Path.Segment.MOVETO:
        list.push('M');
        Array.prototype.push.apply(list, args);
        break;
      case goog.graphics.Path.Segment.LINETO:
        list.push('L');
        Array.prototype.push.apply(list, args);
        break;
      case goog.graphics.Path.Segment.CURVETO:
        list.push('C');
        Array.prototype.push.apply(list, args);
        break;
      case goog.graphics.Path.Segment.ARCTO:
        var extent = args[3];
        list.push(
            'A', args[0], args[1], 0, Math.abs(extent) > 180 ? 1 : 0,
            extent > 0 ? 1 : 0, args[4], args[5]);
        break;
      case goog.graphics.Path.Segment.CLOSE:
        list.push('Z');
        break;
    }
  });
  return list.join(' ');
};


/**
 * Create an empty group of drawing elements.
 *
 * @param {goog.graphics.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {!goog.graphics.GroupElement} The newly created group.
 * @override
 */
goog.graphics.SvgGraphics.prototype.createGroup = function(opt_group) {
  var element = this.createSvgElement_('g');
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element);
  return new goog.graphics.SvgGroupElement(element, this);
};


/**
 * Measure and return the width (in pixels) of a given text string.
 * Text measurement is needed to make sure a text can fit in the allocated area.
 * The way text length is measured is by writing it into a div that is after
 * the visible area, measure the div width, and immediatly erase the written
 * value.
 *
 * @param {string} text The text string to measure.
 * @param {goog.graphics.Font} font The font object describing the font style.
 * @override
 */
goog.graphics.SvgGraphics.prototype.getTextWidth = function(text, font) {
  // TODO(user) Implement
};


/**
 * Adds a defintion of an element to the global definitions.
 * @param {string} defKey This is a key that should be unique in a way that
 *     if two definitions are equal the should have the same key.
 * @param {Element} defElement DOM element to add as a definition. It must
 *     have an id attribute set.
 * @return {string} The assigned id of the defElement.
 */
goog.graphics.SvgGraphics.prototype.addDef = function(defKey, defElement) {
  if (defKey in this.defs_) {
    return this.defs_[defKey];
  }
  var id = goog.graphics.SvgGraphics.DEF_ID_PREFIX_ +
      goog.graphics.SvgGraphics.nextDefId_++;
  defElement.setAttribute('id', id);
  this.defs_[defKey] = id;

  // Add the def defElement of the defs list.
  var defs = this.defsElement_;
  defs.appendChild(defElement);
  return id;
};


/**
 * Returns the id of a definition element.
 * @param {string} defKey This is a key that should be unique in a way that
 *     if two definitions are equal the should have the same key.
 * @return {?string} The id of the found definition element or null if
 *     not found.
 */
goog.graphics.SvgGraphics.prototype.getDef = function(defKey) {
  return defKey in this.defs_ ? this.defs_[defKey] : null;
};


/**
 * Removes a definition of an elemnt from the global definitions.
 * @param {string} defKey This is a key that should be unique in a way that
 *     if two definitions are equal they should have the same key.
 */
goog.graphics.SvgGraphics.prototype.removeDef = function(defKey) {
  var id = this.getDef(defKey);
  if (id) {
    var element = this.dom_.getElement(id);
    this.defsElement_.removeChild(element);
    delete this.defs_[defKey];
  }
};


/** @override */
goog.graphics.SvgGraphics.prototype.enterDocument = function() {
  var oldPixelSize = this.getPixelSize();
  goog.graphics.SvgGraphics.superClass_.enterDocument.call(this);

  // Dispatch a resize if this is the first time the size value is accurate.
  if (!oldPixelSize) {
    this.dispatchEvent(goog.events.EventType.RESIZE);
  }


  // For percentage based heights, listen for changes to size.
  if (this.useManualViewbox_) {
    var width = this.width;
    var height = this.height;

    if (typeof width == 'string' && width.indexOf('%') != -1 &&
        typeof height == 'string' && height.indexOf('%') != -1) {
      // SVG elements don't behave well with respect to size events, so we
      // resort to polling.
      this.handler_.listen(
          goog.graphics.SvgGraphics.getResizeCheckTimer_(), goog.Timer.TICK,
          this.updateManualViewBox_);
    }

    this.updateManualViewBox_();
  }
};


/** @override */
goog.graphics.SvgGraphics.prototype.exitDocument = function() {
  goog.graphics.SvgGraphics.superClass_.exitDocument.call(this);

  // Stop polling.
  if (this.useManualViewbox_) {
    this.handler_.unlisten(
        goog.graphics.SvgGraphics.getResizeCheckTimer_(), goog.Timer.TICK,
        this.updateManualViewBox_);
  }
};


/**
 * Disposes of the component by removing event handlers, detacing DOM nodes from
 * the document body, and removing references to them.
 * @override
 * @protected
 */
goog.graphics.SvgGraphics.prototype.disposeInternal = function() {
  delete this.defs_;
  delete this.defsElement_;
  delete this.canvasElement;
  this.handler_.dispose();
  delete this.handler_;
  goog.graphics.SvgGraphics.superClass_.disposeInternal.call(this);
};


/**
 * The centralized resize checking timer.
 * @type {goog.Timer|undefined}
 * @private
 */
goog.graphics.SvgGraphics.resizeCheckTimer_;


/**
 * @return {goog.Timer} The centralized timer object used for interval timing.
 * @private
 */
goog.graphics.SvgGraphics.getResizeCheckTimer_ = function() {
  if (!goog.graphics.SvgGraphics.resizeCheckTimer_) {
    goog.graphics.SvgGraphics.resizeCheckTimer_ = new goog.Timer(400);
    goog.graphics.SvgGraphics.resizeCheckTimer_.start();
  }

  return /** @type {goog.Timer} */ (
      goog.graphics.SvgGraphics.resizeCheckTimer_);
};


/** @override */
goog.graphics.SvgGraphics.prototype.isDomClonable = function() {
  return true;
};
