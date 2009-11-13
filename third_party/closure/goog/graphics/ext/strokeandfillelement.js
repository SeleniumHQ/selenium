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
 * @fileoverview A thick wrapper around elements with stroke and fill.
 */


goog.provide('goog.graphics.ext.StrokeAndFillElement');

goog.require('goog.graphics.ext.Element');


/**
 * Interface for a graphics element that has a stroke and fill.
 * This is the base interface for ellipse, rectangle and other
 * shape interfaces.
 * You should not construct objects from this constructor. Use a subclass.
 * @param {goog.graphics.ext.Group} group Parent for this element.
 * @param {goog.graphics.StrokeAndFillElement} wrapper The thin wrapper to wrap.
 * @constructor
 * @extends {goog.graphics.ext.Element}
 */
goog.graphics.ext.StrokeAndFillElement = function(group, wrapper) {
  goog.graphics.ext.Element.call(this, group, wrapper);
};
goog.inherits(goog.graphics.ext.StrokeAndFillElement,
    goog.graphics.ext.Element);


/**
 * Sets the fill for this element.
 * @param {goog.graphics.Fill?} fill The fill object.
 */
goog.graphics.ext.StrokeAndFillElement.prototype.setFill = function(fill) {
  this.getWrapper().setFill(fill);
};


/**
 * Sets the stroke for this element.
 * @param {goog.graphics.Stroke?} stroke The stroke object.
 */
goog.graphics.ext.StrokeAndFillElement.prototype.setStroke = function(stroke) {
  this.getWrapper().setStroke(stroke);
};


/**
 * Redraw the rectangle.  Called when the coordinate system is changed.
 * @protected
 */
goog.graphics.ext.StrokeAndFillElement.prototype.redraw = function() {
  this.getWrapper().reapplyStroke();
};
