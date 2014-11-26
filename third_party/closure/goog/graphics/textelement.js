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
 * @fileoverview A thin wrapper around the DOM element for text elements.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.graphics.TextElement');

goog.require('goog.graphics.StrokeAndFillElement');



/**
 * Interface for a graphics text element.
 * You should not construct objects from this constructor. The graphics
 * will return an implementation of this interface for you.
 *
 * @param {Element} element The DOM element to wrap.
 * @param {goog.graphics.AbstractGraphics} graphics The graphics creating
 *     this element.
 * @param {goog.graphics.Stroke?} stroke The stroke to use for this element.
 * @param {goog.graphics.Fill?} fill The fill to use for this element.
 * @constructor
 * @extends {goog.graphics.StrokeAndFillElement}
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.TextElement = function(element, graphics, stroke, fill) {
  goog.graphics.StrokeAndFillElement.call(this, element, graphics, stroke,
      fill);
};
goog.inherits(goog.graphics.TextElement, goog.graphics.StrokeAndFillElement);


/**
 * Update the displayed text of the element.
 * @param {string} text The text to draw.
 */
goog.graphics.TextElement.prototype.setText = goog.abstractMethod;
