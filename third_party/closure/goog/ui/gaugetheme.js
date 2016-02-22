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
 * @fileoverview The color theme used by a gauge (goog.ui.Guage).
 */


goog.provide('goog.ui.GaugeTheme');


goog.require('goog.graphics.LinearGradient');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');



/**
 * A class for the default color theme for a Gauge.
 * Users can extend this class to provide a custom color theme, and apply the
 * custom color theme by calling  {@link goog.ui.Gauge#setTheme}.
 * @constructor
 * @final
 */
goog.ui.GaugeTheme = function() {
};


/**
 * Returns the stroke for the external border of the gauge.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getExternalBorderStroke = function() {
  return new goog.graphics.Stroke(1, '#333333');
};


/**
 * Returns the fill for the external border of the gauge.
 * @param {number} cx X coordinate of the center of the gauge.
 * @param {number} cy Y coordinate of the center of the gauge.
 * @param {number} r Radius of the gauge.
 * @return {!goog.graphics.Fill} The fill to use.
 */
goog.ui.GaugeTheme.prototype.getExternalBorderFill = function(cx, cy, r) {
  return new goog.graphics.LinearGradient(cx + r, cy - r, cx - r, cy + r,
      '#f7f7f7', '#cccccc');
};


/**
 * Returns the stroke for the internal border of the gauge.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getInternalBorderStroke = function() {
  return new goog.graphics.Stroke(2, '#e0e0e0');
};


/**
 * Returns the fill for the internal border of the gauge.
 * @param {number} cx X coordinate of the center of the gauge.
 * @param {number} cy Y coordinate of the center of the gauge.
 * @param {number} r Radius of the gauge.
 * @return {!goog.graphics.Fill} The fill to use.
 */
goog.ui.GaugeTheme.prototype.getInternalBorderFill = function(cx, cy, r) {
  return new goog.graphics.SolidFill('#f7f7f7');
};


/**
 * Returns the stroke for the major ticks of the gauge.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getMajorTickStroke = function() {
  return new goog.graphics.Stroke(2, '#333333');
};


/**
 * Returns the stroke for the minor ticks of the gauge.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getMinorTickStroke = function() {
  return new goog.graphics.Stroke(1, '#666666');
};


/**
 * Returns the stroke for the hinge at the center of the gauge.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getHingeStroke = function() {
  return new goog.graphics.Stroke(1, '#666666');
};


/**
 * Returns the fill for the hinge at the center of the gauge.
 * @param {number} cx  X coordinate of the center of the gauge.
 * @param {number} cy  Y coordinate of the center of the gauge.
 * @param {number} r  Radius of the hinge.
 * @return {!goog.graphics.Fill} The fill to use.
 */
goog.ui.GaugeTheme.prototype.getHingeFill = function(cx, cy, r) {
  return new goog.graphics.LinearGradient(cx + r, cy - r, cx - r, cy + r,
      '#4684ee', '#3776d6');
};


/**
 * Returns the stroke for the gauge needle.
 * @return {!goog.graphics.Stroke} The stroke to use.
 */
goog.ui.GaugeTheme.prototype.getNeedleStroke = function() {
  return new goog.graphics.Stroke(1, '#c63310');
};


/**
 * Returns the fill for the hinge at the center of the gauge.
 * @param {number} cx X coordinate of the center of the gauge.
 * @param {number} cy Y coordinate of the center of the gauge.
 * @param {number} r Radius of the gauge.
 * @return {!goog.graphics.Fill} The fill to use.
 */
goog.ui.GaugeTheme.prototype.getNeedleFill = function(cx, cy, r) {
  // Make needle a bit transparent so that text underneeth is still visible.
  return new goog.graphics.SolidFill('#dc3912', 0.7);
};


/**
 * Returns the color for the gauge title.
 * @return {string} The color to use.
 */
goog.ui.GaugeTheme.prototype.getTitleColor = function() {
  return '#333333';
};


/**
 * Returns the color for the gauge value.
 * @return {string} The color to use.
 */
goog.ui.GaugeTheme.prototype.getValueColor = function() {
  return 'black';
};


/**
 * Returns the color for the labels (formatted values) of tick marks.
 * @return {string} The color to use.
 */
goog.ui.GaugeTheme.prototype.getTickLabelColor = function() {
  return '#333333';
};
