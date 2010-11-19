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
 * @fileoverview VmlGraphics sub class that uses VML to draw the graphics.
 */


goog.provide('goog.graphics.VmlGraphics');


goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.graphics.AbstractGraphics');
goog.require('goog.graphics.Font');
goog.require('goog.graphics.LinearGradient');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');
goog.require('goog.graphics.VmlEllipseElement');
goog.require('goog.graphics.VmlGroupElement');
goog.require('goog.graphics.VmlImageElement');
goog.require('goog.graphics.VmlPathElement');
goog.require('goog.graphics.VmlRectElement');
goog.require('goog.graphics.VmlTextElement');
goog.require('goog.math.Size');
goog.require('goog.string');



/**
 * A Graphics implementation for drawing using VML.
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
goog.graphics.VmlGraphics = function(width, height,
                                     opt_coordWidth, opt_coordHeight,
                                     opt_domHelper) {
  goog.graphics.AbstractGraphics.call(this, width, height,
                                      opt_coordWidth, opt_coordHeight,
                                      opt_domHelper);
  this.handler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.graphics.VmlGraphics, goog.graphics.AbstractGraphics);


/**
 * The prefix to use for VML elements
 * @private
 * @type {string}
 */
goog.graphics.VmlGraphics.VML_PREFIX_ = 'g_vml_';


/**
 * The VML namespace URN
 * @private
 * @type {string}
 */
goog.graphics.VmlGraphics.VML_NS_ = 'urn:schemas-microsoft-com:vml';


/**
 * The VML behavior URL.
 * @private
 * @type {string}
 */
goog.graphics.VmlGraphics.VML_IMPORT_ = '#default#VML';


/**
 * Whether the document is using IE8 standards mode, and therefore needs hacks.
 * @private
 * @type {boolean}
 */
goog.graphics.VmlGraphics.IE8_MODE_ = document.documentMode &&
    document.documentMode >= 8;


/**
 * The coordinate multiplier to allow sub-pixel rendering
 * @type {number}
 */
goog.graphics.VmlGraphics.COORD_MULTIPLIER = 100;


/**
 * Converts the given size to a css size.  If it is a percentage, leaves it
 * alone.  Otherwise assumes px.
 *
 * @param {number|string} size The size to use.
 * @return {string} The position adjusted for COORD_MULTIPLIER.
 */
goog.graphics.VmlGraphics.toCssSize = function(size) {
  return goog.isString(size) && goog.string.endsWith(size, '%') ?
         size : parseFloat(size.toString()) + 'px';
};


/**
 * Multiplies positioning coordinates by COORD_MULTIPLIER to allow sub-pixel
 * coordinates.  Also adds a half pixel offset to match SVG.
 *
 * This function is internal for the VML supporting classes, and
 * should not be used externally.
 *
 * @param {number|string} number A position in pixels.
 * @return {number} The position adjusted for COORD_MULTIPLIER.
 */
goog.graphics.VmlGraphics.toPosCoord = function(number) {
  return Math.round((parseFloat(number.toString()) - 0.5) *
      goog.graphics.VmlGraphics.COORD_MULTIPLIER);
};


/**
 * Add a "px" suffix to a number of pixels, and multiplies all coordinates by
 * COORD_MULTIPLIER to allow sub-pixel coordinates.
 *
 * This function is internal for the VML supporting classes, and
 * should not be used externally.
 *
 * @param {number|string} number A position in pixels.
 * @return {string} The position with suffix 'px'.
 */
goog.graphics.VmlGraphics.toPosPx = function(number) {
  return goog.graphics.VmlGraphics.toPosCoord(number) + 'px';
};


/**
 * Multiplies the width or height coordinate by COORD_MULTIPLIER to allow
 * sub-pixel coordinates.
 *
 * This function is internal for the VML supporting classes, and
 * should not be used externally.
 *
 * @param {string|number} number A size in units.
 * @return {number} The size multiplied by the correct factor.
 */
goog.graphics.VmlGraphics.toSizeCoord = function(number) {
  return Math.round(parseFloat(number.toString()) *
      goog.graphics.VmlGraphics.COORD_MULTIPLIER);
};


/**
 * Add a "px" suffix to a number of pixels, and multiplies all coordinates by
 * COORD_MULTIPLIER to allow sub-pixel coordinates.
 *
 * This function is internal for the VML supporting classes, and
 * should not be used externally.
 *
 * @param {number} number A size in pixels.
 * @return {string} The size with suffix 'px'.
 */
goog.graphics.VmlGraphics.toSizePx = function(number) {
  return goog.graphics.VmlGraphics.toSizeCoord(number) + 'px';
};


/**
 * Sets an attribute on the given VML element, in the way best suited to the
 * current version of IE.  Should only be used in the goog.graphics package.
 * @param {Element} element The element to set an attribute
 *     on.
 * @param {string} name The name of the attribute to set.
 * @param {string} value The value to set it to.
 */
goog.graphics.VmlGraphics.setAttribute = function(element, name, value) {
  if (goog.graphics.VmlGraphics.IE8_MODE_) {
    element[name] = value;
  } else {
    element.setAttribute(name, value);
  }
};


/**
 * Event handler.
 * @type {goog.events.EventHandler}
 * @private
 */
goog.graphics.VmlGraphics.prototype.handler_;


/**
 * Creates a VML element. Used internally and by different VML classes.
 * @param {string} tagName The type of element to create.
 * @return {Element} The created element.
 */
goog.graphics.VmlGraphics.prototype.createVmlElement = function(tagName) {
  var element =
      this.dom_.createElement(goog.graphics.VmlGraphics.VML_PREFIX_ + ':' +
                              tagName);
  element.id = goog.string.createUniqueString();
  return element;
};


/**
 * Returns the VML element with the given id that is a child of this graphics
 * object.
 * Should be considered package private, and not used externally.
 * @param {string} id The element id to find.
 * @return {Element} The element with the given id, or null if none is found.
 */
goog.graphics.VmlGraphics.prototype.getVmlElement = function(id) {
  return this.dom_.getElement(id);
};


/**
 * Resets the graphics so they will display properly on IE8.  Noop in older
 * versions.
 * @private
 */
goog.graphics.VmlGraphics.prototype.updateGraphics_ = function() {
  if (goog.graphics.VmlGraphics.IE8_MODE_ && this.isInDocument()) {
    this.getElement().innerHTML = this.getElement().innerHTML;
  }
};


/**
 * Appends an element.
 *
 * @param {goog.graphics.Element} element The element wrapper.
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 * @private
 */
goog.graphics.VmlGraphics.prototype.append_ = function(element, opt_group) {
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element.getElement());
  this.updateGraphics_();
};


/**
 * Sets the fill for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Fill?} fill The fill object.
 */
goog.graphics.VmlGraphics.prototype.setElementFill = function(element, fill) {
  var vmlElement = element.getElement();
  this.removeFill(vmlElement);
  if (fill instanceof goog.graphics.SolidFill) {
    // NOTE(user): VML does not understand 'transparent' so hard code support
    // for it.
    if (fill.getColor() == 'transparent') {
      vmlElement.filled = false;
    } else if (fill.getOpacity() != 1) {
      vmlElement.filled = true;
      // Set opacity (number 0-1 is translated to percent)
      var fillNode = this.createVmlElement('fill');
      fillNode.opacity = Math.round(fill.getOpacity() * 100) + '%';
      fillNode.color = fill.getColor();
      vmlElement.appendChild(fillNode);
    } else {
      vmlElement.filled = true;
      vmlElement.fillcolor = fill.getColor();
    }
  } else if (fill instanceof goog.graphics.LinearGradient) {
    vmlElement.filled = true;
    // Add a 'fill' element
    var gradient = this.createVmlElement('fill');
    gradient.color = fill.getColor1();
    gradient.color2 = fill.getColor2();
    var angle = goog.math.angle(fill.getX1(), fill.getY1(),
        fill.getX2(), fill.getY2());
    // Our angles start from 0 to the right, and grow clockwise.
    // MSIE starts from 0 to top, and grows anti-clockwise.
    angle = Math.round(goog.math.standardAngle(270 - angle));
    gradient.angle = angle;
    gradient.type = 'gradient';
    vmlElement.appendChild(gradient);
  } else {
    vmlElement.filled = false;
  }
  this.updateGraphics_();
};


/**
 * Sets the stroke for the given element.
 * @param {goog.graphics.StrokeAndFillElement} element The element wrapper.
 * @param {goog.graphics.Stroke?} stroke The stroke object.
 */
goog.graphics.VmlGraphics.prototype.setElementStroke = function(element,
    stroke) {
  var vmlElement = element.getElement();
  if (stroke) {
    vmlElement.stroked = true;

    var width = stroke.getWidth();
    if (goog.isString(width) && width.indexOf('px') == -1) {
      width = parseFloat(width);
    } else {
      width = width * this.getPixelScaleX();
    }

    var strokeElement = vmlElement.getElementsByTagName('stroke')[0];
    if (width < 1) {
      strokeElement = strokeElement || this.createVmlElement('stroke');
      strokeElement.opacity = width;
      strokeElement.weight = '1px';
      strokeElement.color = stroke.getColor();
      vmlElement.appendChild(strokeElement);
    } else {
      if (strokeElement) {
        vmlElement.removeChild(strokeElement);
      }
      vmlElement.strokecolor = stroke.getColor();
      vmlElement.strokeweight = width + 'px';
    }
  } else {
    vmlElement.stroked = false;
  }
  this.updateGraphics_();
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
goog.graphics.VmlGraphics.prototype.setElementTransform = function(element, x,
    y, angle, centerX, centerY) {
  var el = element.getElement();

  el.style.left = goog.graphics.VmlGraphics.toPosPx(x);
  el.style.top = goog.graphics.VmlGraphics.toPosPx(y);
  if (angle || el.rotation) {
    el.rotation = angle;
    el.coordsize = goog.graphics.VmlGraphics.toSizeCoord(centerX * 2) + ' ' +
        goog.graphics.VmlGraphics.toSizeCoord(centerY * 2);
  }
};


/**
 * Removes the fill information from a dom element.
 * @param {Element} element DOM element.
 */
goog.graphics.VmlGraphics.prototype.removeFill = function(element) {
  element.fillcolor = '';
  var v = element.childNodes.length;
  for (var i = 0; i < element.childNodes.length; i++) {
    var child = element.childNodes[i];
    if (child.tagName == 'fill') {
      element.removeChild(child);
    }
  }
};


/**
 * Set top, left, width and height for an element.
 * This function is internal for the VML supporting classes, and
 * should not be used externally.
 *
 * @param {Element} element DOM element.
 * @param {number} left Left ccordinate in pixels.
 * @param {number} top Top ccordinate in pixels.
 * @param {number} width Width in pixels.
 * @param {number} height Height in pixels.
 */
goog.graphics.VmlGraphics.setPositionAndSize = function(
    element, left, top, width, height) {
  var style = element.style;
  style.position = 'absolute';
  style.left = goog.graphics.VmlGraphics.toPosPx(left);
  style.top = goog.graphics.VmlGraphics.toPosPx(top);
  style.width = goog.graphics.VmlGraphics.toSizePx(width);
  style.height = goog.graphics.VmlGraphics.toSizePx(height);

  if (element.tagName == 'shape') {
    element.coordsize = goog.graphics.VmlGraphics.toSizeCoord(width) + ' ' +
                        goog.graphics.VmlGraphics.toSizeCoord(height);
  }
};


/**
 * Creates an element spanning the surface.
 *
 * @param {string} type The type of element to create.
 * @return {Element} The created, positioned, and sized element.
 * @private
 */
goog.graphics.VmlGraphics.prototype.createFullSizeElement_ = function(type) {
  var element = this.createVmlElement(type);
  var size = this.getCoordSize();
  goog.graphics.VmlGraphics.setPositionAndSize(element, 0, 0, size.width,
      size.height);
  return element;
};


/**
 * IE magic - if this "no-op" line is not here, the if statement below will
 * fail intermittently.  The eval is used to prevent the JsCompiler from
 * stripping this piece of code, which it quite reasonably thinks is doing
 * nothing. Put it in try-catch block to prevent "Unspecified Error" when
 * this statement is executed in a defer JS in IE.
 * More info here:
 * http://www.mail-archive.com/users@openlayers.org/msg01838.html
 */
try {
  eval('document.namespaces');
} catch (ex) {}


/**
 * Creates the DOM representation of the graphics area.
 */
goog.graphics.VmlGraphics.prototype.createDom = function() {
  var doc = this.dom_.getDocument();

  // Add the namespace.
  if (!doc.namespaces[goog.graphics.VmlGraphics.VML_PREFIX_]) {
    if (goog.graphics.VmlGraphics.IE8_MODE_) {
      doc.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_,
                         goog.graphics.VmlGraphics.VML_NS_,
                         goog.graphics.VmlGraphics.VML_IMPORT_);
    } else {
      doc.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_,
                         goog.graphics.VmlGraphics.VML_NS_);
    }

    // We assume that we only need to add the CSS if the namespace was not
    // present
    var ss = doc.createStyleSheet();
    ss.cssText = goog.graphics.VmlGraphics.VML_PREFIX_ + '\\:*' +
                 '{behavior:url(#default#VML)}';
  }

  // Outer a DIV with overflow hidden for clipping.
  // All inner elements are absolutly positioned on-top of this div.
  var pixelWidth = this.width;
  var pixelHeight = this.height;
  var divElement = this.dom_.createDom('div', {
    'style': 'overflow:hidden;position:relative;width:' +
        goog.graphics.VmlGraphics.toCssSize(pixelWidth) + ';height:' +
        goog.graphics.VmlGraphics.toCssSize(pixelHeight)
  });

  this.setElementInternal(divElement);

  var group = this.createVmlElement('group');
  var style = group.style;

  style.position = 'absolute';
  style.left = style.top = 0;
  style.width = this.width;
  style.height = this.height;
  if (this.coordWidth) {
    group.coordsize =
        goog.graphics.VmlGraphics.toSizeCoord(this.coordWidth) + ' ' +
        goog.graphics.VmlGraphics.toSizeCoord(
            /** @type {number} */ (this.coordHeight));
  } else {
    group.coordsize = goog.graphics.VmlGraphics.toSizeCoord(pixelWidth) + ' ' +
        goog.graphics.VmlGraphics.toSizeCoord(pixelHeight);
  }

  if (goog.isDef(this.coordLeft)) {
    group.coordorigin = goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) +
        ' ' + goog.graphics.VmlGraphics.toSizeCoord(this.coordTop);
  } else {
    group.coordorigin = '0 0';
  }
  divElement.appendChild(group);

  this.canvasElement = new goog.graphics.VmlGroupElement(group, this);

  goog.events.listen(divElement, goog.events.EventType.RESIZE, goog.bind(
      this.handleContainerResize_, this));
};


/**
 * Changes the canvas element size to match the container element size.
 * @private
 */
goog.graphics.VmlGraphics.prototype.handleContainerResize_ = function() {
  var size = goog.style.getSize(this.getElement());
  var style = this.canvasElement.getElement().style;

  if (size.width) {
    style.width = size.width + 'px';
    style.height = size.height + 'px';
  } else {
    var current = this.getElement();
    while (current && current.currentStyle &&
        current.currentStyle.display != 'none') {
      current = current.parentNode;
    }
    if (current && current.currentStyle) {
      this.handler_.listen(current, 'propertychange',
          this.handleContainerResize_);
    }
  }

  this.dispatchEvent(goog.events.EventType.RESIZE);
};


/**
 * Handle property changes on hidden ancestors.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.graphics.VmlGraphics.prototype.handlePropertyChange_ = function(e) {
  var prop = e.getBrowserEvent().propertyName;
  if (prop == 'display' || prop == 'className') {
    this.handler_.unlisten(/** @type {Element} */(e.target),
        'propertychange', this.handlePropertyChange_);
    this.handleContainerResize_();
  }
};


/**
 * Changes the coordinate system position.
 * @param {number} left The coordinate system left bound.
 * @param {number} top The coordinate system top bound.
 */
goog.graphics.VmlGraphics.prototype.setCoordOrigin = function(left, top) {
  this.coordLeft = left;
  this.coordTop = top;

  this.canvasElement.getElement().coordorigin =
      goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) + ' ' +
      goog.graphics.VmlGraphics.toSizeCoord(this.coordTop);
};


/**
 * Changes the coordinate size.
 * @param {number} coordWidth The coordinate width.
 * @param {number} coordHeight The coordinate height.
 */
goog.graphics.VmlGraphics.prototype.setCoordSize = function(coordWidth,
                                                            coordHeight) {
  goog.graphics.VmlGraphics.superClass_.setCoordSize.apply(this, arguments);

  this.canvasElement.getElement().coordsize =
      goog.graphics.VmlGraphics.toSizeCoord(coordWidth) + ' ' +
      goog.graphics.VmlGraphics.toSizeCoord(coordHeight);
};


/**
 * Change the size of the canvas.
 * @param {number} pixelWidth The width in pixels.
 * @param {number} pixelHeight The height in pixels.
 */
goog.graphics.VmlGraphics.prototype.setSize = function(pixelWidth,
    pixelHeight) {
  // TODO(user): Implement
};


/**
 * @return {goog.math.Size} Returns the number of pixels spanned by the surface.
 */
goog.graphics.VmlGraphics.prototype.getPixelSize = function() {
  var el = this.getElement();
  // The following relies on the fact that the size can never be 0.
  return new goog.math.Size(el.style.pixelWidth || el.offsetWidth || 1,
      el.style.pixelHeight || el.offsetHeight || 1);
};


/**
 * Remove all drawing elements from the graphics.
 */
goog.graphics.VmlGraphics.prototype.clear = function() {
  this.canvasElement.clear();
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
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.EllipseElement} The newly created element.
 */
goog.graphics.VmlGraphics.prototype.drawEllipse = function(cx, cy, rx, ry,
    stroke, fill, opt_group) {
  var element = this.createVmlElement('oval');
  goog.graphics.VmlGraphics.setPositionAndSize(element, cx - rx, cy - ry,
      rx * 2, ry * 2);
  var wrapper = new goog.graphics.VmlEllipseElement(element, this,
      cx, cy, rx, ry, stroke, fill);
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
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.RectElement} The newly created element.
 */
goog.graphics.VmlGraphics.prototype.drawRect = function(x, y, width, height,
    stroke, fill, opt_group) {
  var element = this.createVmlElement('rect');
  goog.graphics.VmlGraphics.setPositionAndSize(element, x, y, width, height);
  var wrapper = new goog.graphics.VmlRectElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw an image.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of image.
 * @param {number} height Height of image.
 * @param {string} src Source of the image.
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.ImageElement} The newly created element.
 */
goog.graphics.VmlGraphics.prototype.drawImage = function(x, y, width, height,
    src, opt_group) {
  var element = this.createVmlElement('image');
  goog.graphics.VmlGraphics.setPositionAndSize(element, x, y, width, height);
  goog.graphics.VmlGraphics.setAttribute(element, 'src', src);
  var wrapper = new goog.graphics.VmlImageElement(element, this);
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
 * @param {?string} align Horizontal alignment: left (default), center, right.
 * @param {goog.graphics.Font} font Font describing the font properties.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.TextElement} The newly created element.
 */
goog.graphics.VmlGraphics.prototype.drawTextOnLine = function(
    text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) {
  var shape = this.createFullSizeElement_('shape');

  var pathElement = this.createVmlElement('path');
  var path = 'M' + goog.graphics.VmlGraphics.toPosCoord(x1) + ',' +
             goog.graphics.VmlGraphics.toPosCoord(y1) + 'L' +
             goog.graphics.VmlGraphics.toPosCoord(x2) + ',' +
             goog.graphics.VmlGraphics.toPosCoord(y2) + 'E';
  goog.graphics.VmlGraphics.setAttribute(pathElement, 'v', path);
  goog.graphics.VmlGraphics.setAttribute(pathElement, 'textpathok', 'true');

  var textPathElement = this.createVmlElement('textpath');
  textPathElement.setAttribute('on', 'true');
  var style = textPathElement.style;
  style.fontSize = font.size * this.getPixelScaleX();
  style.fontFamily = font.family;
  if (align != null) {
    style['v-text-align'] = align;
  }
  if (font.bold) {
    style.fontWeight = 'bold';
  }
  if (font.italic) {
    style.fontStyle = 'italic';
  }
  goog.graphics.VmlGraphics.setAttribute(textPathElement, 'string', text);

  shape.appendChild(pathElement);
  shape.appendChild(textPathElement);
  var wrapper = new goog.graphics.VmlTextElement(shape, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Draw a path.
 *
 * @param {goog.graphics.Path} path The path object to draw.
 * @param {goog.graphics.Stroke?} stroke Stroke object describing the stroke.
 * @param {goog.graphics.Fill?} fill Fill object describing the fill.
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.PathElement} The newly created element.
 */
goog.graphics.VmlGraphics.prototype.drawPath = function(path, stroke, fill,
    opt_group) {
  var element = this.createFullSizeElement_('shape');
  goog.graphics.VmlGraphics.setAttribute(element, 'path',
      goog.graphics.VmlGraphics.getVmlPath(path));

  var wrapper = new goog.graphics.VmlPathElement(element, this, stroke, fill);
  this.append_(wrapper, opt_group);
  return wrapper;
};


/**
 * Returns a string representation of a logical path suitable for use in
 * a VML element.
 *
 * @param {goog.graphics.Path} path The logical path.
 * @return {string} The VML path representation.
 */
goog.graphics.VmlGraphics.getVmlPath = function(path) {
  var list = [];
  path.forEachSegment(function(segment, args) {
    switch (segment) {
      case goog.graphics.Path.Segment.MOVETO:
        list.push('m');
        Array.prototype.push.apply(list, goog.array.map(args,
            goog.graphics.VmlGraphics.toSizeCoord));
        break;
      case goog.graphics.Path.Segment.LINETO:
        list.push('l');
        Array.prototype.push.apply(list, goog.array.map(args,
            goog.graphics.VmlGraphics.toSizeCoord));
        break;
      case goog.graphics.Path.Segment.CURVETO:
        list.push('c');
        Array.prototype.push.apply(list, goog.array.map(args,
            goog.graphics.VmlGraphics.toSizeCoord));
        break;
      case goog.graphics.Path.Segment.CLOSE:
        list.push('x');
        break;
      case goog.graphics.Path.Segment.ARCTO:
        var toAngle = args[2] + args[3];
        var cx = goog.graphics.VmlGraphics.toSizeCoord(
            args[4] - goog.math.angleDx(toAngle, args[0]));
        var cy = goog.graphics.VmlGraphics.toSizeCoord(
            args[5] - goog.math.angleDy(toAngle, args[1]));
        var rx = goog.graphics.VmlGraphics.toSizeCoord(args[0]);
        var ry = goog.graphics.VmlGraphics.toSizeCoord(args[1]);
        // VML angles are in fd units (see http://www.w3.org/TR/NOTE-VML) and
        // are positive counter-clockwise.
        var fromAngle = Math.round(args[2] * -65536);
        var extent = Math.round(args[3] * -65536);
        list.push('ae', cx, cy, rx, ry, fromAngle, extent);
        break;
    }
  });
  return list.join(' ');
};


/**
 * Create an empty group of drawing elements.
 *
 * @param {goog.graphics.VmlGroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {goog.graphics.GroupElement} The newly created group.
 */
goog.graphics.VmlGraphics.prototype.createGroup = function(opt_group) {
  var element = this.createFullSizeElement_('group');
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element);
  return new goog.graphics.VmlGroupElement(element, this);
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
goog.graphics.VmlGraphics.prototype.getTextWidth = function(text, font) {
  // TODO(user): Implement
  return 0;
};


/** @inheritDoc */
goog.graphics.VmlGraphics.prototype.enterDocument = function() {
  goog.graphics.VmlGraphics.superClass_.enterDocument.call(this);
  this.handleContainerResize_();
  this.updateGraphics_();
};


/**
 * Disposes of the component by removing event handlers, detacing DOM nodes from
 * the document body, and removing references to them.
 */
goog.graphics.VmlGraphics.prototype.disposeInternal = function() {
  this.canvasElement = null;
  goog.graphics.VmlGraphics.superClass_.disposeInternal.call(this);
};
