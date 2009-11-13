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
 * @fileoverview Class definitions for imageless rounded corners.
 *
 * @supported IE 6.0+, Safari 2.0+, Firefox 1.5+, Opera 9.2+.
 * @see ../demos/imagelessroundedcorner.html
 */

goog.provide('goog.ui.AbstractImagelessRoundedCorner');
goog.provide('goog.ui.CanvasRoundedCorner');
goog.provide('goog.ui.ImagelessRoundedCorner');
goog.provide('goog.ui.VmlRoundedCorner');

goog.require('goog.dom.DomHelper');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');
goog.require('goog.graphics.VmlGraphics');
goog.require('goog.userAgent');


/**
 * Returns an instance of goog.ui.ImagelessRoundedCorner that can render a
 * rounded corner, with the implementation varying depending on the current
 * platform. The rounded corner contains 3 components: horizontal filler, arc,
 * and vertical filler. Horizontal and/or vertical fillers are added if the
 * radius of the rounded corner is less than the width and/or height of the
 * containing element. This is a factory method for image-less rounded corner
 * classes.
 * @param {Element} element The container element for the rounded corner.
 * @param {number} width The width of the element excluding the border, in
 *     pixels.
 * @param {number} height The height of the element excluding the border, in
 *     pixels.
 * @param {number} borderWidth The thickness of the rounded corner, in pixels.
 * @param {number} radius The radius of the rounded corner, in pixels. The
 *     radius must be less than or equal to the width or height (whichever
 *     is greater).
 * @param {number} location Location of the rounded corner. This should be a
 *     value from goog.ui.ImagelessRoundedCorner.Corner: TOP_LEFT, TOP_RIGHT,
 *     BOTTOM_LEFT, or BOTTOM_RIGHT.
 * @param {string} borderColor The color of the rounded corner.
 * @param {string} opt_backgroundColor The background color of the rounded
 *     corner.
 * @param {goog.dom.DomHelper} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @return {goog.ui.AbstractImagelessRoundedCorner|undefined} Imageless rounded
 *     corner instance.
 */
goog.ui.ImagelessRoundedCorner.create = function(element,
                                                 width,
                                                 height,
                                                 borderWidth,
                                                 radius,
                                                 location,
                                                 borderColor,
                                                 opt_backgroundColor,
                                                 opt_domHelper) {
  // Check for invalid values.
  if (width <= 0 ||
      height <= 0 ||
      borderWidth <= 0 ||
      radius < 0) {
    return;
  }

  // Instantiate the proper rounded corner, based on user-agent.
  var roundedCorner;
  var version = parseFloat(goog.userAgent.VERSION);
  if (goog.userAgent.IE) {
    roundedCorner = new goog.ui.VmlRoundedCorner(element,
                                                 width,
                                                 height,
                                                 borderWidth,
                                                 radius,
                                                 location,
                                                 borderColor,
                                                 opt_backgroundColor,
                                                 opt_domHelper);
  } else {
    roundedCorner = new goog.ui.CanvasRoundedCorner(element,
                                                    width,
                                                    height,
                                                    borderWidth,
                                                    radius,
                                                    location,
                                                    borderColor,
                                                    opt_backgroundColor,
                                                    opt_domHelper);
  }

  return roundedCorner;
};


/**
 * Enum for specifying which corners to render.
 * @enum {number}
 */
goog.ui.ImagelessRoundedCorner.Corner = {
  TOP_LEFT: 1,
  TOP_RIGHT: 2,
  BOTTOM_LEFT: 4,
  BOTTOM_RIGHT: 8
};


/**
 * Specifies the top-left and bottom-left corners.
 * @type {number}
 */
goog.ui.ImagelessRoundedCorner.Corner.LEFT =
    goog.ui.ImagelessRoundedCorner.Corner.TOP_LEFT |
    goog.ui.ImagelessRoundedCorner.Corner.BOTTOM_LEFT;


/**
 * Specifies the top-right and bottom-right corners.
 * @type {number}
 */
goog.ui.ImagelessRoundedCorner.Corner.RIGHT =
    goog.ui.ImagelessRoundedCorner.Corner.TOP_RIGHT |
    goog.ui.ImagelessRoundedCorner.Corner.BOTTOM_RIGHT;


/**
 * Specifies the top-left and top-right corners.
 * @type {number}
 */
goog.ui.ImagelessRoundedCorner.Corner.TOP =
    goog.ui.ImagelessRoundedCorner.Corner.TOP_LEFT |
    goog.ui.ImagelessRoundedCorner.Corner.TOP_RIGHT;


/**
 * Specifies the bottom-left and bottom-right corners.
 * @type {number}
 */
goog.ui.ImagelessRoundedCorner.Corner.BOTTOM =
    goog.ui.ImagelessRoundedCorner.Corner.BOTTOM_LEFT |
    goog.ui.ImagelessRoundedCorner.Corner.BOTTOM_RIGHT;


/**
 * Specifies all corners.
 * @type {number}
 */
goog.ui.ImagelessRoundedCorner.Corner.ALL =
    goog.ui.ImagelessRoundedCorner.Corner.TOP |
    goog.ui.ImagelessRoundedCorner.Corner.BOTTOM;



/**
 * Base class for various image-less rounded corner classes. Do not create
 * instances of this class. Instead, utilize
 * goog.ui.ImagelessRoundedCorner.create().
 * @param {Element} element The container element for the rounded corner.
 * @param {number} width The width of the element excluding the border, in
 *     pixels.
 * @param {number} height The height of the element excluding the border, in
 *     pixels.
 * @param {number} borderWidth The thickness of the rounded corner, in pixels.
 * @param {number} radius The radius of the rounded corner, in pixels. The
 *     radius must be less than or equal to the width or height (whichever
 *     is greater).
 * @param {number} location Location of the rounded corner. This should be a
 *     value from goog.ui.ImagelessRoundedCorner.Corner: TOP_LEFT, TOP_RIGHT,
 *     BOTTOM_LEFT, or BOTTOM_RIGHT.
 * @param {string} borderColor The color of the rounded corner.
 * @param {string} opt_backgroundColor The background color of the
 *     rounded corner.
 * @param {goog.dom.DomHelper} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 */
goog.ui.AbstractImagelessRoundedCorner = function(element,
                                                  width,
                                                  height,
                                                  borderWidth,
                                                  radius,
                                                  location,
                                                  borderColor,
                                                  opt_backgroundColor,
                                                  opt_domHelper) {
  /**
   * The container element for the rounded corner.
   * @type {Element}
   * @private
   */
  this.element_ = element;

  /**
   * The width of the container element for the rounded corner, in pixels.
   * @type {number}
   * @private
   */
  this.width_ = width;

  /**
   * The height of the container element for the rounded corner, in pixels.
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * The color of the rounded corner.
   * @type {string}
   * @private
   */
  this.borderColor_ = borderColor;

  /**
   * The background color of the rounded corner.
   * @type {string|undefined}
   * @private
   */
  this.backgroundColor_ = opt_backgroundColor;

  /**
   * The thickness of the rounded corner, in pixels.
   * @type {number}
   * @private
   */
  this.borderWidth_ = borderWidth;

  /**
   * The radius of the rounded corner, in pixels.
   * @type {number}
   * @private
   */
  this.radius_ = radius;

  /**
   * Indicates if this is a left rounded corner (ex. top left or bottom left).
   * @type {boolean}
   * @private
   */
  this.isLeft_ = !!(location & goog.ui.ImagelessRoundedCorner.Corner.LEFT);

  /**
   * Indicates if this is a top rounded corner (ex. top left or top right).
   * @type {boolean}
   * @private
   */
  this.isTop_ = !!(location & goog.ui.ImagelessRoundedCorner.Corner.TOP);

  /**
   * The DOM helper object for the document we want to render in.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(this.element_);

  /**
   * The start angle of the rounded corner arc
   * @type {number}
   * @private
   */
  this.startAngle_ = this.getStartAngle();

  /**
   * The end angle of the rounded corner arc
   * @type {number}
   * @private
   */
  this.endAngle_ = this.getEndAngle();

  /**
   * The x and y coordinates indicating where to begin drawing.
   * @type {Array.<number>}
   * @private
   */
  this.start_ = [];

  /**
   * The x and y coordinates indicating where to stop drawing.
   * @type {Array.<number>}
   * @private
   */
  this.end_ = [];


  // Define the circle center of the arc, and the start/end points. The
  // start/end points, and the circle center for the arc are moved inward,
  // depending on the borderWidth of the stroke.
  var borderWidthOffset = this.getBorderWidthOffset();
  if (this.isLeft_) {
    this.start_[0] = this.width_;
    this.xCenter_ = this.radius_ + borderWidthOffset;
    this.end_[0] = borderWidthOffset;
  } else {
    this.start_[0] = 0;
    this.xCenter_ = this.width_ - this.radius_ - borderWidthOffset;
    this.end_[0] = this.width_ - borderWidthOffset;
  }
  if (this.isTop_) {
    this.start_[1] = borderWidthOffset;
    this.yCenter_ = this.radius_ + borderWidthOffset;
    this.end_[1] = this.height_;
  } else {
    this.start_[1] = this.height_ - borderWidthOffset;
    this.yCenter_ = this.height_ - this.radius_ - borderWidthOffset;
    this.end_[1] = 0;
  }
};


/**
 * X-axis coordinate of the circle center that the rounded corner arc is
 * based on.
 * @type {number}
 * @private
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.xCenter_;


/**
 * Y-axis coordinate of the circle center that the rounded corner arc is
 * based on.
 * @type {number}
 * @private
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.yCenter_;


/**
 * Thickness constant used as an offset to help determine where to start
 * rendering.
 * @type {number}
 */
goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR = 1 / 2;


/**
 * Returns the end angle of the arc for the rounded corner.
 * @return {number} The end angle, in degrees or radians.
 * @protected
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getEndAngle =
    goog.abstractMethod;


/**
 * Returns the start angle of the arc for the rounded corner.
 * @return {number} The start angle, in degrees or radians.
 * @protected
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getStartAngle =
    goog.abstractMethod;


/**
 * Returns the thickness offset used for accurately rendering the corner
 * within its container.
 * @return {number} The thickness offset, in pixels.
 * @protected
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getBorderWidthOffset =
    function() {
  return this.borderWidth_ *
      goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
};


/**
 * Returns the underlying DOM element containing the rounded corner.
 * @return {Element} The underlying DOM element.
 * @protected
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getElement =
    goog.abstractMethod;


/**
 * Renders the rounded corner.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.draw = goog.abstractMethod;


/**
 * Returns the height of the element containing the rounded corner.
 * @return {number} The height of the element, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getHeight = function() {
  return this.height_;
};


/**
 * Sets the height of the element containing the rounded corner.
 * @param {number} height The height of the element, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setHeight = function(height) {
  this.height_ = height;
};


/**
 * Returns the width of the element containing the rounded corner.
 * @return {number} The width of the element, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getWidth = function() {
  return this.width_;
};


/**
 * Sets the width of the element containing the rounded corner.
 * @param {number} width The width of the element, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setWidth = function(width) {
  this.width_ = width;
};


/**
 * Returns the thickness of the rounded corner.
 * @return {number} The thickness of the rounded corner, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getLineWidth =
    function() {
  return this.borderWidth_;
};


/**
 * Sets the thickness of the rounded corner.
 * @param {number} thickness The thickness of the rounded corner, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setLineWidth =
    function(thickness) {
  this.borderWidth_ = thickness;
};


/**
 * Returns the radius of the rounded corner.
 * @return {number} The radius of the rounded corner, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getRadius = function() {
  return this.radius_;
};


/**
 * Sets the radius of the rounded corner.
 * @param {number} radius The radius of the rounded corner, in pixels.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setRadius = function(radius) {
  this.radius_ = radius;
};


/**
 * Returns the color of the rounded corner.
 * @return {string} The color of the rounded corner.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getBorderColor = function() {
  return this.borderColor_;
};


/**
 * Sets the color of the rounded corner.
 * @param {string} borderColor The color of the rounded corner.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setBorderColor =
    function(borderColor) {
  this.borderColor_ = borderColor;
};


/**
 * Returns the background color of the rounded corner.
 * @return {string|undefined} The background color of the rounded corner.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.getBackgroundColor =
    function() {
  return this.backgroundColor_;
};


/**
 * Sets the background color of the rounded corner.
 * @param {string} backgroundColor The background color of the rounded corner.
 */
goog.ui.AbstractImagelessRoundedCorner.prototype.setBackgroundColor =
    function(backgroundColor) {
  this.backgroundColor_ = backgroundColor;
};



/**
 * Class for rendering a Canvas-based rounded corner (Gecko and Safari3+).
 * Horizontal and/or vertical fillers are added if the radius of the rounded
 * corner is less than the width and/or height of the containing element.
 * The line is drawn as a single, continuous line, starting with the horizontal
 * filler, then the arc, then finishing with the vertical filler.
 * Do not instantiate this class directly. Instead, use
 * goog.ui.ImagelessRoundedCorner.create().
 * @param {Element} element The element to be turned into a rounded corner.
 * @param {number} width The width of the element excluding the border, in
 *     pixels.
 * @param {number} height The height of the element excluding the border, in
 *     pixels.
 * @param {number} borderWidth The thickness of the rounded corner, in pixels.
 * @param {number} radius The radius of the rounded corner, in pixels. The
 *     radius must be less than or equal to the width or height (whichever
 *     is greater).
 * @param {number} location Location of the rounded corner. This should be a
 *     value from goog.ui.ImagelessRoundedCorner.Corner: TOP_LEFT, TOP_RIGHT,
 *     BOTTOM_LEFT, or BOTTOM_RIGHT.
 * @param {string} borderColor The color of the rounded corner.
 * @param {string} opt_backgroundColor The background color of the rounded
 *     corner.
 * @param {goog.dom.DomHelper} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.ui.AbstractImagelessRoundedCorner}
 */
goog.ui.CanvasRoundedCorner = function(element,
                                       width,
                                       height,
                                       borderWidth,
                                       radius,
                                       location,
                                       borderColor,
                                       opt_backgroundColor,
                                       opt_domHelper) {
  goog.ui.AbstractImagelessRoundedCorner.call(this,
                                              element,
                                              width,
                                              height,
                                              borderWidth,
                                              radius,
                                              location,
                                              borderColor,
                                              opt_backgroundColor,
                                              opt_domHelper);

  /**
   * The canvas containing the rounded corner.
   * @type {Element}
   * @private
   */
  this.canvas_ = this.domHelper_.createDom('canvas', {
    'height' : height,
    'width' : width
  });

  // If background color is defined, adjust the current end point, define the
  // opposite corner, and end at the start offset. Account for thickness
  // offsets in these calculations. The enclosed area will be filled by
  // backgroundColor
  if (this.backgroundColor_) {
    var borderWidthOffset = this.getBorderWidthOffset();
    this.oppositeCorner_ = [];

    // Move one pixel more in the direction the line is being drawn. Then draw
    // a line to the opposite corner + the diagonal offset.  Then draw a line
    // to the start, offset by 1px.
    if (this.isLeft_) {
      this.oppositeCorner_[0] = this.width_ + borderWidthOffset;
      this.xStartOffset_ = this.start_[0] + borderWidthOffset;
    } else {
      this.oppositeCorner_[0] = -borderWidthOffset;
      this.xStartOffset_ = -borderWidthOffset;
    }
    if (this.isTop_) {
      this.end_[1] += borderWidthOffset;
      this.oppositeCorner_[1] = this.height_ + borderWidthOffset;
    } else {
      this.end_[1] -= borderWidthOffset;
      this.oppositeCorner_[1] = -borderWidthOffset;
    }
  }

  // Safari requires the canvas to be added to the DOM before defining the
  // graphics context. Otherwise, rendering will fail.
  this.domHelper_.appendChild(this.element_, this.canvas_);
};
goog.inherits(goog.ui.CanvasRoundedCorner,
              goog.ui.AbstractImagelessRoundedCorner);


/**
 * The x and y coordinates of the corner opposite the rounded corner arc,
 * with the stroke thickness offset added. This is defined if
 * backgroundColor_ is defined.
 * @type {Array.<number>?}
 * @private
 */
goog.ui.CanvasRoundedCorner.prototype.oppositeCorner_;


/**
 * The x coordinate of the path's end, when enclosing the path. This is
 * defined if backgroundColor_ is defined.
 * @type {number}
 * @private
 */
goog.ui.CanvasRoundedCorner.prototype.xStartOffset_;


/**
 * Half a radian.
 * @type {number}
 * @private
 */
goog.ui.CanvasRoundedCorner.RADIANS_HALF_ = Math.PI / 2;


/**
 * One radian.
 * @type {number}
 * @private
 */
goog.ui.CanvasRoundedCorner.RADIANS_ONE_ = Math.PI;


/**
 * Three halves of a radian.
 * @type {number}
 * @private
 */
goog.ui.CanvasRoundedCorner.RADIANS_THREE_HALVES_ = 1.5 * Math.PI;


/**
 * Two radians.
 * @type {number}
 * @private
 */
goog.ui.CanvasRoundedCorner.RADIANS_TWO_ = 2 * Math.PI;


/**
 * Returns the end angle of the arc for the rounded corner.
 * @return {number} The end angle, in radians.
 * @protected
 */
goog.ui.CanvasRoundedCorner.prototype.getEndAngle = function() {
  return this.isLeft_ ?
      goog.ui.CanvasRoundedCorner.RADIANS_ONE_ :
      goog.ui.CanvasRoundedCorner.RADIANS_TWO_;
};


/**
 * Returns the start angle of the arc for the rounded corner.
 * @return {number} The start angle, in radians.
 * @protected
 */
goog.ui.CanvasRoundedCorner.prototype.getStartAngle = function() {
  return this.isTop_ ?
      goog.ui.CanvasRoundedCorner.RADIANS_THREE_HALVES_ :
      goog.ui.CanvasRoundedCorner.RADIANS_HALF_;
};


/**
 * Returns the underlying DOM element containing the rounded corner.
 * @return {Element} The underlying DOM element.
 * @protected
 */
goog.ui.CanvasRoundedCorner.prototype.getElement = function() {
  return this.canvas_;
};


/**
 * Renders the rounded corner.
 */
goog.ui.CanvasRoundedCorner.prototype.draw = function() {
  // Determine which direction to draw, and obtain the context.
  var counterClockwise = this.isLeft_ && this.isTop_ ||
                         !this.isLeft_ && !this.isTop_;
  var context = this.canvas_.getContext('2d');

  var version = parseFloat(goog.userAgent.VERSION);
  if (goog.userAgent.WEBKIT &&
      goog.userAgent.isVersion('500') &&
      this.oppositeCorner_ &&
      this.xStartOffset_) {
    // For Safari2, we must render the rounded corner differently when
    // backgroundColor_ is specified. Safari2 cannot render the stroke using
    // one color, while filling the enclosed path with another color.
    this.drawSafari2WithBackground_(context, counterClockwise);
  } else {
    // Specify the stroke style and line width.
    context.strokeStyle = this.borderColor_;
    context.lineWidth = this.borderWidth_;

    // Draw the defined path.
    context.beginPath();
    context.moveTo(this.start_[0], this.start_[1]);
    context.arc(this.xCenter_,
                this.yCenter_,
                this.radius_,
                this.startAngle_,
                this.endAngle_,
                counterClockwise);
    context.lineTo(this.end_[0], this.end_[1]);

    // If backgroundColor_ is defined, render and enclose the rest of the path,
    // and fill the background.
    if (this.oppositeCorner_ && this.xStartOffset_) {
      context.lineTo(this.oppositeCorner_[0],
                     this.oppositeCorner_[1]);
      context.lineTo(this.xStartOffset_,
                     this.start_[1]);
      context.closePath();
      context.fillStyle = this.backgroundColor_;
      context.fill();
    }

    // Render the defined path.
    context.stroke();
  }
};


/**
 * Safari2-specific implementation for rendering a rounded corner with
 * a background color. The background is filled, followed by the rounded
 * corner path.
 * @param {Object} context Graphics context used for drawing.
 * @param {boolean} counterClockwise Specify true to draw in a
 *     counter-clockwise direction, and false to draw clockwise.
 * @private
 */
goog.ui.CanvasRoundedCorner.prototype.drawSafari2WithBackground_ =
    function(context, counterClockwise) {
  // If backgroundColor_ is defined, outline the path,
  // and fill the enclosed area.
  if (this.oppositeCorner_ && this.xStartOffset_) {
    // Draw the defined path.
    context.strokeStyle = this.backgroundColor_;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(this.start_[0], this.start_[1]);
    context.arc(this.xCenter_,
                this.yCenter_,
                this.radius_,
                this.startAngle_,
                this.endAngle_,
                counterClockwise);
    context.lineTo(this.end_[0], this.end_[1]);
    context.lineTo(this.oppositeCorner_[0],
                   this.oppositeCorner_[1]);
    context.lineTo(this.xStartOffset_,
                   this.start_[1]);
    context.closePath();
    context.fillStyle = this.backgroundColor_;
    context.fill();
  }

  // Draw the rounded corner arc and filler(s).
  context.strokeStyle = this.borderColor_;
  context.borderWidth = this.borderWidth_;
  context.beginPath();
  context.moveTo(this.start_[0], this.start_[1]);
  context.arc(this.xCenter_,
              this.yCenter_,
              this.radius_,
              this.startAngle_,
              this.endAngle_,
              counterClockwise);
  context.lineTo(this.end_[0], this.end_[1]);
  context.stroke();
};



/**
 * Class for rendering an imageless, VML-based rounded corner. Horizontal
 * and/or vertical fillers are added if the radius of the rounded corner is less
 * than the width and/or height of the containing element. The line is drawn as
 * a single, continuous line, starting with the horizontal filler, then the arc,
 * then finishing with the vertical filler. Do not instantiate this class
 * directly. Instead, use goog.ui.ImagelessRoundedCorner.create().
 * @param {Element} element The element to be turned into a rounded corner.
 * @param {number} width The width of the element excluding the border, in
 *     pixels.
 * @param {number} height The height of the element excluding the border, in
 *     pixels.
 * @param {number} borderWidth The thickness of the rounded corner, in pixels.
 * @param {number} radius The radius of the rounded corner, in pixels. The
 *     radius must be less than or equal to the width or height (whichever
 *     is greater).
 * @param {number} location Location of the rounded corner. This should be a
 *     value from goog.ui.ImagelessRoundedCorner.Corner: TOP_LEFT, TOP_RIGHT,
 *     BOTTOM_LEFT, or BOTTOM_RIGHT.
 * @param {string} borderColor The color of the rounded corner.
 * @param {string} opt_backgroundColor The background color of the rounded
 *     corner.
 * @param {goog.dom.DomHelper} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.ui.AbstractImagelessRoundedCorner}
 */
goog.ui.VmlRoundedCorner = function(element,
                                    width,
                                    height,
                                    borderWidth,
                                    radius,
                                    location,
                                    borderColor,
                                    opt_backgroundColor,
                                    opt_domHelper) {
  goog.ui.AbstractImagelessRoundedCorner.call(this,
                                              element,
                                              width,
                                              height,
                                              borderWidth,
                                              radius,
                                              location,
                                              borderColor,
                                              opt_backgroundColor,
                                              opt_domHelper);

  // An offset is subtracted to accommodate the subpixel rendering calculations
  // specific to VmlGraphics.
  this.start_[0] -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  this.end_[0] -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  this.xCenter_ -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  this.start_[1] -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  this.end_[1] -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  this.yCenter_ -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;

  /**
   * VML wrapper API object.
   * @type {goog.graphics.VmlGraphics}
   * @private
   */
  this.graphics_ = new goog.graphics.VmlGraphics(this.width_,
                                                 this.height_,
                                                 this.width_,
                                                 this.height_,
                                                 this.domHelper_);
  /**
   * Container element that will contain the actual rounded corner.
   * @type {Element}
   * @private
   */
  this.container_ = this.domHelper_.createDom('div', {
    'style' : 'overflow:hidden;position:relative;' +
              'width:' + this.width_ + 'px;' +
              'height:' + this.height_ + 'px;'
  });
};
goog.inherits(goog.ui.VmlRoundedCorner, goog.ui.AbstractImagelessRoundedCorner);


/**
 * Returns the end angle of the arc for the rounded corner.
 * @return {number} The end angle, in degrees.
 * @protected
 */
goog.ui.VmlRoundedCorner.prototype.getEndAngle = function() {
  return this.isLeft_ ? 180 : 360;
};


/**
 * Returns the start angle of the arc for the rounded corner.
 * @return {number} The start angle, in degrees.
 * @protected
 */
goog.ui.VmlRoundedCorner.prototype.getStartAngle = function() {
  return this.isTop_ ? 270 : 90;
};


/**
 * Returns the underlying DOM element containing the rounded corner.
 * @return {Element} The underlying DOM element.
 * @protected
 */
goog.ui.VmlRoundedCorner.prototype.getElement = function() {
  return this.container_;
};


/**
 * Renders the rounded corner.
 */
goog.ui.VmlRoundedCorner.prototype.draw = function() {
  // Determine which direction to draw, and enable VML.
  var clockwise = this.isLeft_ && !this.isTop_ ||
                  !this.isLeft_ && this.isTop_;
  this.graphics_.createDom();

  // If needed, fill the background color.
  if (this.backgroundColor_) {
    this.drawBackground_(clockwise);
  }

  // Draw the defined path.
  var path = this.graphics_.createPath();
  path.moveTo(this.start_[0], this.start_[1]);
  path.arc(this.xCenter_,
           this.yCenter_,
           this.radius_,
           this.radius_,
           this.startAngle_,
           clockwise ? 90 : -90,
           true);
  path.lineTo(this.end_[0], this.end_[1]);
  var stroke = new goog.graphics.Stroke(this.borderWidth_,
                                        this.borderColor_);
  this.graphics_.drawPath(path, stroke, null);

  // Extract the shape node, append it to the container, and set the
  // container styles. Then append the container to the DOM.
  var shapeNode = this.extractShapeNode_();
  this.domHelper_.appendChild(this.container_, shapeNode);
  this.domHelper_.appendChild(this.element_, this.container_);
};


/**
 * Renders a 1-coordinate wide path, following the same path as the rounded
 * corner, then going along the adjacent horizontal edge, then along the
 * adjacent vertical edge, and back to the start of the rounded corner path.
 * @param {boolean} clockwise Use true to render the arc in a clockwise
 *     direction, and false in the counter-clockwise direction.
 * @private
 */
goog.ui.VmlRoundedCorner.prototype.drawBackground_ =
    function(clockwise) {
  // Calculate key points in the path: the end of the arc, the corner opposite
  // the arc, and the end of the path.
  var arcEnd = [];
  arcEnd[0] = this.isLeft_ ?
      goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR :
      this.width_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  arcEnd[1] = this.isTop_ ?
      this.height_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR:
      goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  var oppositeCorner = [];
  oppositeCorner[0] = this.isLeft_ ?
      this.width_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR :
      goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  oppositeCorner[1] = arcEnd[1];
  var endX = this.isLeft_ ?
      this.start_[0] -
          goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR :
      goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR;
  var path = this.graphics_.createPath();

  // Draw out the path according to the points just defined.
  path.moveTo(this.start_[0], this.start_[1]);
  path.arc(this.xCenter_,
           this.yCenter_,
           this.radius_,
           this.radius_,
           this.startAngle_,
           clockwise ? 90 : -90,
           true);
  path.lineTo(arcEnd[0], arcEnd[1]);
  path.lineTo(oppositeCorner[0],
              oppositeCorner[1]);
  path.lineTo(endX,
              this.start_[1]);

  // Render the path and fill, then append the generated path to the DOM.
  var stroke = new goog.graphics.Stroke(1,
      /** @type {string} */ (this.backgroundColor_));
  var fill = new goog.graphics.SolidFill(
      /** @type {string} */ (this.backgroundColor_), 1);
  this.graphics_.drawPath(path, stroke, fill);
  var shapeNode = this.extractShapeNode_();
  this.domHelper_.appendChild(this.container_, shapeNode);
};


/**
 * Helper method that extracts the 'shape' node from the private
 * goog.graphics.VmlGraphics instance, sets the size to this.width_ and
 * this.height_, and sets the position to (0, 0).
 * @return {Element} The VML shape element.
 * @private
 */
goog.ui.VmlRoundedCorner.prototype.extractShapeNode_ = function() {
  var shapeNode = /** @type {Element} */ (
      goog.dom.findNode(this.graphics_.getElement(),
          goog.ui.VmlRoundedCorner.isShapeNode_));
  goog.style.setSize(shapeNode,
                     this.width_,
                     this.height_);
  goog.style.setPosition(shapeNode, 0, 0);
  return shapeNode;
};


/**
 * Indicates if the specified node is a 'shape' node.
 * @param {Object} node The DOM node to inspect.
 * @return {boolean} true if the node is an element node with the name 'shape',
 *     and false otherwise.
 * @private
 */
goog.ui.VmlRoundedCorner.isShapeNode_ = function(node) {
  return node.nodeType == goog.dom.NodeType.ELEMENT &&
      node.nodeName == 'shape';
};
