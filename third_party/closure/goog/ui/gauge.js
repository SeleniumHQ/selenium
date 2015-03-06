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
 * @fileoverview Gauge UI component, using browser vector graphics.
 * @see ../demos/gauge.html
 */


goog.provide('goog.ui.Gauge');
goog.provide('goog.ui.GaugeColoredRange');


goog.require('goog.a11y.aria');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.fx.easing');
goog.require('goog.graphics');
goog.require('goog.graphics.Font');
goog.require('goog.graphics.Path');
goog.require('goog.graphics.SolidFill');
goog.require('goog.math');
goog.require('goog.ui.Component');
goog.require('goog.ui.GaugeTheme');



/**
 * Information on how to decorate a range in the gauge.
 * This is an internal-only class.
 * @param {number} fromValue The range start (minimal) value.
 * @param {number} toValue The range end (maximal) value.
 * @param {string} backgroundColor Color to fill the range background with.
 * @constructor
 * @final
 */
goog.ui.GaugeColoredRange = function(fromValue, toValue, backgroundColor) {

  /**
   * The range start (minimal) value.
   * @type {number}
   */
  this.fromValue = fromValue;


  /**
   * The range end (maximal) value.
   * @type {number}
   */
  this.toValue = toValue;


  /**
   * Color to fill the range background with.
   * @type {string}
   */
  this.backgroundColor = backgroundColor;
};



/**
 * A UI component that displays a gauge.
 * A gauge displayes a current value within a round axis that represents a
 * given range.
 * The gauge is built from an external border, and internal border inside it,
 * ticks and labels inside the internal border, and a needle that points to
 * the current value.
 * @param {number} width The width in pixels.
 * @param {number} height The height in pixels.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 * @constructor
 * @extends {goog.ui.Component}
 * @final
 */
goog.ui.Gauge = function(width, height, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The width in pixels of this component.
   * @type {number}
   * @private
   */
  this.width_ = width;


  /**
   * The height in pixels of this component.
   * @type {number}
   * @private
   */
  this.height_ = height;


  /**
   * The underlying graphics.
   * @type {goog.graphics.AbstractGraphics}
   * @private
   */
  this.graphics_ = goog.graphics.createGraphics(width, height,
      null, null, opt_domHelper);


  /**
   * Colors to paint the background of certain ranges (optional).
   * @type {Array<goog.ui.GaugeColoredRange>}
   * @private
   */
  this.rangeColors_ = [];
};
goog.inherits(goog.ui.Gauge, goog.ui.Component);


/**
 * Constant for a background color for a gauge area.
 */
goog.ui.Gauge.RED = '#ffc0c0';


/**
 * Constant for a background color for a gauge area.
 */
goog.ui.Gauge.GREEN = '#c0ffc0';


/**
 * Constant for a background color for a gauge area.
 */
goog.ui.Gauge.YELLOW = '#ffffa0';


/**
 * The radius of the entire gauge from the canvas size.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_RADIUS_FROM_SIZE = 0.45;


/**
 * The ratio of internal gauge radius from entire radius.
 * The remaining area is the border around the gauge.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_MAIN_AREA = 0.9;


/**
 * The ratio of the colored background area for value ranges.
 * The colored area width is computed as
 * InternalRadius * (1 - FACTOR_COLOR_RADIUS)
 * @type {number}
 */
goog.ui.Gauge.FACTOR_COLOR_RADIUS = 0.75;


/**
 * The ratio of the major ticks length start position, from the radius.
 * The major ticks length width is computed as
 * InternalRadius * (1 - FACTOR_MAJOR_TICKS)
 * @type {number}
 */
goog.ui.Gauge.FACTOR_MAJOR_TICKS = 0.8;


/**
 * The ratio of the minor ticks length start position, from the radius.
 * The minor ticks length width is computed as
 * InternalRadius * (1 - FACTOR_MINOR_TICKS)
 * @type {number}
 */
goog.ui.Gauge.FACTOR_MINOR_TICKS = 0.9;


/**
 * The length of the needle front (value facing) from the internal radius.
 * The needle front is the part of the needle that points to the value.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_NEEDLE_FRONT = 0.95;


/**
 * The length of the needle back relative to the internal radius.
 * The needle back is the part of the needle that points away from the value.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_NEEDLE_BACK = 0.3;


/**
 * The width of the needle front at the hinge.
 * This is the width of the curve control point, the actual width is
 * computed by the curve itself.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_NEEDLE_WIDTH = 0.07;


/**
 * The width (radius) of the needle hinge from the gauge radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_NEEDLE_HINGE = 0.15;


/**
 * The title font size (height) for titles relative to the internal radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_TITLE_FONT_SIZE = 0.16;


/**
 * The offset of the title from the center, relative to the internal radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_TITLE_OFFSET = 0.35;


/**
 * The formatted value font size (height) relative to the internal radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_VALUE_FONT_SIZE = 0.18;


/**
 * The title font size (height) for tick labels relative to the internal radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_TICK_LABEL_FONT_SIZE = 0.14;


/**
 * The offset of the formatted value down from the center, relative to the
 * internal radius.
 * @type {number}
 */
goog.ui.Gauge.FACTOR_VALUE_OFFSET = 0.75;


/**
 * The font name for title text.
 * @type {string}
 */
goog.ui.Gauge.TITLE_FONT_NAME = 'arial';


/**
 * The maximal size of a step the needle can move (percent from size of range).
 * If the needle needs to move more, it will be moved in animated steps, to
 * show a smooth transition between values.
 * @type {number}
 */
goog.ui.Gauge.NEEDLE_MOVE_MAX_STEP = 0.02;


/**
 * Time in miliseconds for animating a move of the value pointer.
 * @type {number}
 */
goog.ui.Gauge.NEEDLE_MOVE_TIME = 400;


/**
 * Tolerance factor for how much values can exceed the range (being too
 * low or too high). The value is presented as a position (percentage).
 * @type {number}
 */
goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION = 0.02;


/**
 * The minimal value that can be displayed.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.minValue_ = 0;


/**
 * The maximal value that can be displayed.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.maxValue_ = 100;


/**
 * The number of major tick sections.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.majorTicks_ = 5;


/**
 * The number of minor tick sections in each major tick section.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.minorTicks_ = 2;


/**
 * The current value that needs to be displayed in the gauge.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.value_ = 0;


/**
 * The current value formatted into a String.
 * @private
 * @type {?string}
 */
goog.ui.Gauge.prototype.formattedValue_ = null;


/**
 * The current colors theme.
 * @private
 * @type {goog.ui.GaugeTheme?}
 */
goog.ui.Gauge.prototype.theme_ = null;


/**
 * Title to display above the gauge center.
 * @private
 * @type {?string}
 */
goog.ui.Gauge.prototype.titleTop_ = null;


/**
 * Title to display below the gauge center.
 * @private
 * @type {?string}
 */
goog.ui.Gauge.prototype.titleBottom_ = null;


/**
 * Font to use for drawing titles.
 * If null (default), computed dynamically with a size relative to the
 * gauge radius.
 * @private
 * @type {goog.graphics.Font?}
 */
goog.ui.Gauge.prototype.titleFont_ = null;


/**
 * Font to use for drawing the formatted value.
 * If null (default), computed dynamically with a size relative to the
 * gauge radius.
 * @private
 * @type {goog.graphics.Font?}
 */
goog.ui.Gauge.prototype.valueFont_ = null;


/**
 * Font to use for drawing tick labels.
 * If null (default), computed dynamically with a size relative to the
 * gauge radius.
 * @private
 * @type {goog.graphics.Font?}
 */
goog.ui.Gauge.prototype.tickLabelFont_ = null;


/**
 * The size in angles of the gauge axis area.
 * @private
 * @type {number}
 */
goog.ui.Gauge.prototype.angleSpan_ = 270;


/**
 * The radius for drawing the needle.
 * Computed on full redraw, and used on every animation step of moving
 * the needle.
 * @type {number}
 * @private
 */
goog.ui.Gauge.prototype.needleRadius_ = 0;


/**
 * The group elemnt of the needle. Contains all elements that change when the
 * gauge value changes.
 * @type {goog.graphics.GroupElement?}
 * @private
 */
goog.ui.Gauge.prototype.needleGroup_ = null;


/**
 * The current position (0-1) of the visible needle.
 * Initially set to null to prevent animation on first opening of the gauge.
 * @type {?number}
 * @private
 */
goog.ui.Gauge.prototype.needleValuePosition_ = null;


/**
 * Text labels to display by major tick marks.
 * @type {Array<string>?}
 * @private
 */
goog.ui.Gauge.prototype.majorTickLabels_ = null;


/**
 * Animation object while needle is being moved (animated).
 * @type {goog.fx.Animation?}
 * @private
 */
goog.ui.Gauge.prototype.animation_ = null;


/**
 * @return {number} The minimum value of the range.
 */
goog.ui.Gauge.prototype.getMinimum = function() {
  return this.minValue_;
};


/**
 * Sets the minimum value of the range
 * @param {number} min The minimum value of the range.
 */
goog.ui.Gauge.prototype.setMinimum = function(min) {
  this.minValue_ = min;
  var element = this.getElement();
  if (element) {
    goog.a11y.aria.setState(element, 'valuemin', min);
  }
};


/**
 * @return {number} The maximum value of the range.
 */
goog.ui.Gauge.prototype.getMaximum = function() {
  return this.maxValue_;
};


/**
 * Sets the maximum number of the range
 * @param {number} max The maximum value of the range.
 */
goog.ui.Gauge.prototype.setMaximum = function(max) {
  this.maxValue_ = max;

  var element = this.getElement();
  if (element) {
    goog.a11y.aria.setState(element, 'valuemax', max);
  }
};


/**
 * Sets the current value range displayed by the gauge.
 * @param {number} value The current value for the gauge. This value
 *     determines the position of the needle of the gauge.
 * @param {string=} opt_formattedValue The string value to show in the gauge.
 *     If not specified, no string value will be displayed.
 */
goog.ui.Gauge.prototype.setValue = function(value, opt_formattedValue) {
  this.value_ = value;
  this.formattedValue_ = opt_formattedValue || null;

  this.stopAnimation_(); // Stop the active animation if exists

  // Compute desired value position (normalize value to range 0-1)
  var valuePosition = this.valueToRangePosition_(value);
  if (this.needleValuePosition_ == null) {
    // No animation on initial display
    this.needleValuePosition_ = valuePosition;
    this.drawValue_();
  } else {
    // Animate move
    this.animation_ = new goog.fx.Animation([this.needleValuePosition_],
        [valuePosition],
        goog.ui.Gauge.NEEDLE_MOVE_TIME,
        goog.fx.easing.inAndOut);

    var events = [goog.fx.Transition.EventType.BEGIN,
                  goog.fx.Animation.EventType.ANIMATE,
                  goog.fx.Transition.EventType.END];
    goog.events.listen(this.animation_, events, this.onAnimate_, false, this);
    goog.events.listen(this.animation_, goog.fx.Transition.EventType.END,
        this.onAnimateEnd_, false, this);

    // Start animation
    this.animation_.play(false);
  }

  var element = this.getElement();
  if (element) {
    goog.a11y.aria.setState(element, 'valuenow', this.value_);
  }
};


/**
 * Sets the number of major tick sections and minor tick sections.
 * @param {number} majorUnits The number of major tick sections.
 * @param {number} minorUnits The number of minor tick sections for each major
 *     tick section.
 */
goog.ui.Gauge.prototype.setTicks = function(majorUnits, minorUnits) {
  this.majorTicks_ = Math.max(1, majorUnits);
  this.minorTicks_ = Math.max(1, minorUnits);
  this.draw_();
};


/**
 * Sets the labels of the major ticks.
 * @param {Array<string>} tickLabels A text label for each major tick value.
 */
goog.ui.Gauge.prototype.setMajorTickLabels = function(tickLabels) {
  this.majorTickLabels_ = tickLabels;
  this.draw_();
};


/**
 * Sets the top title of the gauge.
 * The top title is displayed above the center.
 * @param {string} text The top title text.
 */
goog.ui.Gauge.prototype.setTitleTop = function(text) {
  this.titleTop_ = text;
  this.draw_();
};


/**
 * Sets the bottom title of the gauge.
 * The top title is displayed below the center.
 * @param {string} text The bottom title text.
 */
goog.ui.Gauge.prototype.setTitleBottom = function(text) {
  this.titleBottom_ = text;
  this.draw_();
};


/**
 * Sets the font for displaying top and bottom titles.
 * @param {goog.graphics.Font} font The font for titles.
 */
goog.ui.Gauge.prototype.setTitleFont = function(font) {
  this.titleFont_ = font;
  this.draw_();
};


/**
 * Sets the font for displaying the formatted value.
 * @param {goog.graphics.Font} font The font for displaying the value.
 */
goog.ui.Gauge.prototype.setValueFont = function(font) {
  this.valueFont_ = font;
  this.drawValue_();
};


/**
 * Sets the color theme for drawing the gauge.
 * @param {goog.ui.GaugeTheme} theme The color theme to use.
 */
goog.ui.Gauge.prototype.setTheme = function(theme) {
  this.theme_ = theme;
  this.draw_();
};


/**
 * Set the background color for a range of values on the gauge.
 * @param {number} fromValue The lower (start) value of the colored range.
 * @param {number} toValue The higher (end) value of the colored range.
 * @param {string} color The color name to paint the range with. For example
 *     'red', '#ffcc00' or constants like goog.ui.Gauge.RED.
 */
goog.ui.Gauge.prototype.addBackgroundColor = function(fromValue, toValue,
    color) {
  this.rangeColors_.push(
      new goog.ui.GaugeColoredRange(fromValue, toValue, color));
  this.draw_();
};


/**
 * Creates the DOM representation of the graphics area.
 * @override
 */
goog.ui.Gauge.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom(
      'div', goog.getCssName('goog-gauge'), this.graphics_.getElement()));
};


/**
 * Clears the entire graphics area.
 * @private
 */
goog.ui.Gauge.prototype.clear_ = function() {
  this.graphics_.clear();
  this.needleGroup_ = null;
};


/**
 * Redraw the entire gauge.
 * @private
 */
goog.ui.Gauge.prototype.draw_ = function() {
  if (!this.isInDocument()) {
    return;
  }

  this.clear_();

  var x, y;
  var size = Math.min(this.width_, this.height_);
  var r = Math.round(goog.ui.Gauge.FACTOR_RADIUS_FROM_SIZE * size);
  var cx = this.width_ / 2;
  var cy = this.height_ / 2;

  var theme = this.theme_;
  if (!theme) {
    // Lazy allocation of default theme, common to all instances
    theme = goog.ui.Gauge.prototype.theme_ = new goog.ui.GaugeTheme();
  }

  // Draw main circle frame around gauge
  var graphics = this.graphics_;
  var stroke = this.theme_.getExternalBorderStroke();
  var fill = theme.getExternalBorderFill(cx, cy, r);
  graphics.drawCircle(cx, cy, r, stroke, fill);

  r -= stroke.getWidth();
  r = Math.round(r * goog.ui.Gauge.FACTOR_MAIN_AREA);
  stroke = theme.getInternalBorderStroke();
  fill = theme.getInternalBorderFill(cx, cy, r);
  graphics.drawCircle(cx, cy, r, stroke, fill);
  r -= stroke.getWidth() * 2;

  // Draw Background with external and internal borders
  var rBackgroundInternal = r * goog.ui.Gauge.FACTOR_COLOR_RADIUS;
  for (var i = 0; i < this.rangeColors_.length; i++) {
    var rangeColor = this.rangeColors_[i];
    var fromValue = rangeColor.fromValue;
    var toValue = rangeColor.toValue;
    var path = new goog.graphics.Path();
    var fromAngle = this.valueToAngle_(fromValue);
    var toAngle = this.valueToAngle_(toValue);
    // Move to outer point at "from" angle
    path.moveTo(
        cx + goog.math.angleDx(fromAngle, r),
        cy + goog.math.angleDy(fromAngle, r));
    // Arc to outer point at "to" angle
    path.arcTo(r, r, fromAngle, toAngle - fromAngle);
    // Line to inner point at "to" angle
    path.lineTo(
        cx + goog.math.angleDx(toAngle, rBackgroundInternal),
        cy + goog.math.angleDy(toAngle, rBackgroundInternal));
    // Arc to inner point at "from" angle
    path.arcTo(
        rBackgroundInternal, rBackgroundInternal, toAngle, fromAngle - toAngle);
    path.close();
    fill = new goog.graphics.SolidFill(rangeColor.backgroundColor);
    graphics.drawPath(path, null, fill);
  }

  // Draw titles
  if (this.titleTop_ || this.titleBottom_) {
    var font = this.titleFont_;
    if (!font) {
      // Lazy creation of font
      var fontSize =
          Math.round(r * goog.ui.Gauge.FACTOR_TITLE_FONT_SIZE);
      font = new goog.graphics.Font(
          fontSize, goog.ui.Gauge.TITLE_FONT_NAME);
      this.titleFont_ = font;
    }
    fill = new goog.graphics.SolidFill(theme.getTitleColor());
    if (this.titleTop_) {
      y = cy - Math.round(r * goog.ui.Gauge.FACTOR_TITLE_OFFSET);
      graphics.drawTextOnLine(this.titleTop_, 0, y, this.width_, y,
          'center', font, null, fill);
    }
    if (this.titleBottom_) {
      y = cy + Math.round(r * goog.ui.Gauge.FACTOR_TITLE_OFFSET);
      graphics.drawTextOnLine(this.titleBottom_, 0, y, this.width_, y,
          'center', font, null, fill);
    }
  }

  // Draw tick marks
  var majorTicks = this.majorTicks_;
  var minorTicks = this.minorTicks_;
  var rMajorTickInternal = r * goog.ui.Gauge.FACTOR_MAJOR_TICKS;
  var rMinorTickInternal = r * goog.ui.Gauge.FACTOR_MINOR_TICKS;
  var ticks = majorTicks * minorTicks;
  var valueRange = this.maxValue_ - this.minValue_;
  var tickValueSpan = valueRange / ticks;
  var majorTicksPath = new goog.graphics.Path();
  var minorTicksPath = new goog.graphics.Path();

  var tickLabelFill = new goog.graphics.SolidFill(theme.getTickLabelColor());
  var tickLabelFont = this.tickLabelFont_;
  if (!tickLabelFont) {
    tickLabelFont = new goog.graphics.Font(
        Math.round(r * goog.ui.Gauge.FACTOR_TICK_LABEL_FONT_SIZE),
        goog.ui.Gauge.TITLE_FONT_NAME);
  }
  var tickLabelFontSize = tickLabelFont.size;

  for (var i = 0; i <= ticks; i++) {
    var angle = this.valueToAngle_(i * tickValueSpan + this.minValue_);
    var isMajorTick = i % minorTicks == 0;
    var rInternal = isMajorTick ? rMajorTickInternal : rMinorTickInternal;
    var path = isMajorTick ? majorTicksPath : minorTicksPath;
    x = cx + goog.math.angleDx(angle, rInternal);
    y = cy + goog.math.angleDy(angle, rInternal);
    path.moveTo(x, y);
    x = cx + goog.math.angleDx(angle, r);
    y = cy + goog.math.angleDy(angle, r);
    path.lineTo(x, y);

    // Draw the tick's label for major ticks
    if (isMajorTick && this.majorTickLabels_) {
      var tickIndex = Math.floor(i / minorTicks);
      var label = this.majorTickLabels_[tickIndex];
      if (label) {
        x = cx + goog.math.angleDx(angle, rInternal - tickLabelFontSize / 2);
        y = cy + goog.math.angleDy(angle, rInternal - tickLabelFontSize / 2);
        var x1, x2;
        var align = 'center';
        if (angle > 280 || angle < 90) {
          align = 'right';
          x1 = 0;
          x2 = x;
        } else if (angle >= 90 && angle < 260) {
          align = 'left';
          x1 = x;
          x2 = this.width_;
        } else {
          // Values around top (angle 260-280) are centered around point
          var dw = Math.min(x, this.width_ - x); // Nearest side border
          x1 = x - dw;
          x2 = x + dw;
          y += Math.round(tickLabelFontSize / 4); // Movea bit down
        }
        graphics.drawTextOnLine(label, x1, y, x2, y,
            align, tickLabelFont, null, tickLabelFill);
      }
    }
  }
  stroke = theme.getMinorTickStroke();
  graphics.drawPath(minorTicksPath, stroke, null);
  stroke = theme.getMajorTickStroke();
  graphics.drawPath(majorTicksPath, stroke, null);

  // Draw the needle and the value label. Stop animation when doing
  // full redraw and jump to the final value position.
  this.stopAnimation_();
  this.needleRadius_ = r;
  this.drawValue_();
};


/**
 * Handle animation events while the hand is moving.
 * @param {goog.fx.AnimationEvent} e The event.
 * @private
 */
goog.ui.Gauge.prototype.onAnimate_ = function(e) {
  this.needleValuePosition_ = e.x;
  this.drawValue_();
};


/**
 * Handle animation events when hand move is complete.
 * @private
 */
goog.ui.Gauge.prototype.onAnimateEnd_ = function() {
  this.stopAnimation_();
};


/**
 * Stop the current animation, if it is active.
 * @private
 */
goog.ui.Gauge.prototype.stopAnimation_ = function() {
  if (this.animation_) {
    goog.events.removeAll(this.animation_);
    this.animation_.stop(false);
    this.animation_ = null;
  }
};


/**
 * Convert a value to the position in the range. The returned position
 * is a value between 0 and 1, where 0 indicates the lowest range value,
 * 1 is the highest range, and any value in between is proportional
 * to mapping the range to (0-1).
 * If the value is not within the range, the returned value may be a bit
 * lower than 0, or a bit higher than 1. This is done so that values out
 * of range will be displayed just a bit outside of the gauge axis.
 * @param {number} value The value to convert.
 * @private
 * @return {number} The range position.
 */
goog.ui.Gauge.prototype.valueToRangePosition_ = function(value) {
  var valueRange = this.maxValue_ - this.minValue_;
  var valuePct = (value - this.minValue_) / valueRange; // 0 to 1

  // If value is out of range, trim it not to be too much out of range
  valuePct = Math.max(valuePct,
      -goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION);
  valuePct = Math.min(valuePct,
      1 + goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION);

  return valuePct;
};


/**
 * Convert a value to an angle based on the value range and angle span
 * @param {number} value The value.
 * @return {number} The angle where this value is located on the round
 *     axis, based on the range and angle span.
 * @private
 */
goog.ui.Gauge.prototype.valueToAngle_ = function(value) {
  var valuePct = this.valueToRangePosition_(value);
  return this.valuePositionToAngle_(valuePct);
};


/**
 * Convert a value-position (percent in the range) to an angle based on
 * the angle span. A value-position is a value that has been proportinally
 * adjusted to a value betwwen 0-1, proportionaly to the range.
 * @param {number} valuePct The value.
 * @return {number} The angle where this value is located on the round
 *     axis, based on the range and angle span.
 * @private
 */
goog.ui.Gauge.prototype.valuePositionToAngle_ = function(valuePct) {
  var startAngle = goog.math.standardAngle((360 - this.angleSpan_) / 2 + 90);
  return this.angleSpan_ * valuePct + startAngle;
};


/**
 * Draw the elements that depend on the current value (the needle and
 * the formatted value). This function is called whenever a value is changed
 * or when the entire gauge is redrawn.
 * @private
 */
goog.ui.Gauge.prototype.drawValue_ = function() {
  if (!this.isInDocument()) {
    return;
  }

  var r = this.needleRadius_;
  var graphics = this.graphics_;
  var theme = this.theme_;
  var cx = this.width_ / 2;
  var cy = this.height_ / 2;
  var angle = this.valuePositionToAngle_(
      /** @type {number} */(this.needleValuePosition_));

  // Compute the needle path
  var frontRadius =
      Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_FRONT);
  var backRadius =
      Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_BACK);
  var frontDx = goog.math.angleDx(angle, frontRadius);
  var frontDy = goog.math.angleDy(angle, frontRadius);
  var backDx = goog.math.angleDx(angle, backRadius);
  var backDy = goog.math.angleDy(angle, backRadius);
  var angleRight = goog.math.standardAngle(angle + 90);
  var distanceControlPointBase = r * goog.ui.Gauge.FACTOR_NEEDLE_WIDTH;
  var controlPointMidDx = goog.math.angleDx(angleRight,
      distanceControlPointBase);
  var controlPointMidDy = goog.math.angleDy(angleRight,
      distanceControlPointBase);

  var path = new goog.graphics.Path();
  path.moveTo(cx + frontDx, cy + frontDy);
  path.curveTo(cx + controlPointMidDx, cy + controlPointMidDy,
      cx - backDx + (controlPointMidDx / 2),
      cy - backDy + (controlPointMidDy / 2),
      cx - backDx, cy - backDy);
  path.curveTo(cx - backDx - (controlPointMidDx / 2),
      cy - backDy - (controlPointMidDy / 2),
      cx - controlPointMidDx, cy - controlPointMidDy,
      cx + frontDx, cy + frontDy);

  // Draw the needle hinge
  var rh = Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_HINGE);

  // Clean previous needle
  var needleGroup = this.needleGroup_;
  if (needleGroup) {
    needleGroup.clear();
  } else {
    needleGroup = this.needleGroup_ = graphics.createGroup();
  }

  // Draw current formatted value if provided.
  if (this.formattedValue_) {
    var font = this.valueFont_;
    if (!font) {
      var fontSize =
          Math.round(r * goog.ui.Gauge.FACTOR_VALUE_FONT_SIZE);
      font = new goog.graphics.Font(fontSize,
          goog.ui.Gauge.TITLE_FONT_NAME);
      font.bold = true;
      this.valueFont_ = font;
    }
    var fill = new goog.graphics.SolidFill(theme.getValueColor());
    var y = cy + Math.round(r * goog.ui.Gauge.FACTOR_VALUE_OFFSET);
    graphics.drawTextOnLine(this.formattedValue_, 0, y, this.width_, y,
        'center', font, null, fill, needleGroup);
  }

  // Draw the needle
  var stroke = theme.getNeedleStroke();
  var fill = theme.getNeedleFill(cx, cy, rh);
  graphics.drawPath(path, stroke, fill, needleGroup);
  stroke = theme.getHingeStroke();
  fill = theme.getHingeFill(cx, cy, rh);
  graphics.drawCircle(cx, cy, rh, stroke, fill, needleGroup);
};


/**
 * Redraws the entire gauge.
 * Should be called after theme colors have been changed.
 */
goog.ui.Gauge.prototype.redraw = function() {
  this.draw_();
};


/** @override */
goog.ui.Gauge.prototype.enterDocument = function() {
  goog.ui.Gauge.superClass_.enterDocument.call(this);

  // set roles and states
  var el = this.getElement();
  goog.asserts.assert(el, 'The DOM element for the gauge cannot be null.');
  goog.a11y.aria.setRole(el, 'progressbar');
  goog.a11y.aria.setState(el, 'live', 'polite');
  goog.a11y.aria.setState(el, 'valuemin', this.minValue_);
  goog.a11y.aria.setState(el, 'valuemax', this.maxValue_);
  goog.a11y.aria.setState(el, 'valuenow', this.value_);
  this.draw_();
};


/** @override */
goog.ui.Gauge.prototype.exitDocument = function() {
  goog.ui.Gauge.superClass_.exitDocument.call(this);
  this.stopAnimation_();
};


/** @override */
goog.ui.Gauge.prototype.disposeInternal = function() {
  this.stopAnimation_();
  this.graphics_.dispose();
  delete this.graphics_;
  delete this.needleGroup_;
  delete this.theme_;
  delete this.rangeColors_;
  goog.ui.Gauge.superClass_.disposeInternal.call(this);
};
