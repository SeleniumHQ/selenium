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
 * @fileoverview A thin wrapper around the DOM element for elements with a
 * stroke and fill.
 * @author arv@google.com (Erik Arvidsson)
 * @author yoah@google.com (Yoah Bar-David)
 */


goog.provide('goog.graphics.StrokeAndFillElement');

goog.require('goog.graphics.Element');



/**
 * Interface for a graphics element with a stroke and fill.
 * This is the base interface for ellipse, rectangle and other
 * shape interfaces.
 * You should not construct objects from this constructor. The graphics
 * will return an implementation of this interface for you.
 *
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.AbstractGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.Element}
 */
goog.graphics.StrokeAndFillElement = function(element, graphics, stroke, fill) {
  goog.graphics.Element.call(this, element, graphics);
  this.setStroke(stroke);
  this.setFill(fill);
};
goog.inherits(goog.graphics.StrokeAndFillElement, goog.graphics.Element);


/**
 * The latest fill applied to this element.
 * @type {goog.graphics.Fill?}
 * @protected
 */
goog.graphics.StrokeAndFillElement.prototype.fill = null;


/**
 * The latest stroke applied to this element.
 * @type {goog.graphics.Stroke?}
 * @private
 */
goog.graphics.StrokeAndFillElement.prototype.stroke_ = null;


/**
 * Sets the fill for this element.
 * @param {goog.graphics.Fill?} fill The fill object.
 */
goog.graphics.StrokeAndFillElement.prototype.setFill = function(fill) {
  this.fill = fill;
  this.getGraphics().setElementFill(this, fill);
};


/**
 * @return {goog.graphics.Fill?} fill The fill object.
 */
goog.graphics.StrokeAndFillElement.prototype.getFill = function() {
  return this.fill;
};


/**
 * Sets the stroke for this element.
 * @param {goog.graphics.Stroke?} stroke The stroke object.
 */
goog.graphics.StrokeAndFillElement.prototype.setStroke = function(stroke) {
  this.stroke_ = stroke;
  this.getGraphics().setElementStroke(this, stroke);
};


/**
 * @return {goog.graphics.Stroke?} stroke The stroke object.
 */
goog.graphics.StrokeAndFillElement.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * Re-strokes the element to react to coordinate size changes.
 */
goog.graphics.StrokeAndFillElement.prototype.reapplyStroke = function() {
  if (this.stroke_) {
    this.setStroke(this.stroke_);
  }
};
