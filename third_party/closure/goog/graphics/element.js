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
 * @fileoverview A thin wrapper around the DOM element returned from
 * the different draw methods of the graphics implementation, and
 * all interfaces that the various element types support.
 * @author arv@google.com (Erik Arvidsson)
 * @author yoah@google.com (Yoah Bar-David)
 */


goog.provide('goog.graphics.Element');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.graphics.AffineTransform');
goog.require('goog.math');



/**
 * Base class for a thin wrapper around the DOM element returned from
 * the different draw methods of the graphics.
 * You should not construct objects from this constructor. The graphics
 * will return the object for you.
 * @param {Element} element  The DOM element to wrap.
 * @param {goog.graphics.AbstractGraphics} graphics  The graphics creating
 *     this element.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @suppress {visibility} Accessing private field of superclass (see TODO).
 */
goog.graphics.Element = function(element, graphics) {
  goog.events.EventTarget.call(this);
  this.element_ = element;
  this.graphics_ = graphics;
  // Overloading EventTarget field to state that this is not a custom event.
  // TODO(user) Should be handled in EventTarget.js (see bug 846824).
  this.customEvent_ = false;
};
goog.inherits(goog.graphics.Element, goog.events.EventTarget);


/**
 * The graphics object that contains this element.
 * @type {goog.graphics.AbstractGraphics?}
 * @private
 */
goog.graphics.Element.prototype.graphics_ = null;


/**
 * The native browser element this class wraps.
 * @type {Element}
 * @private
 */
goog.graphics.Element.prototype.element_ = null;


/**
 * The transformation applied to this element.
 * @type {goog.graphics.AffineTransform?}
 * @private
 */
goog.graphics.Element.prototype.transform_ = null;


/**
 * Returns the underlying object.
 * @return {Element} The underlying element.
 */
goog.graphics.Element.prototype.getElement = function() {
  return this.element_;
};


/**
 * Returns the graphics.
 * @return {goog.graphics.AbstractGraphics} The graphics that created the
 *     element.
 */
goog.graphics.Element.prototype.getGraphics = function() {
  return this.graphics_;
};


/**
 * Set the transformation of the element.
 * @param {number} x The x coordinate of the translation transform.
 * @param {number} y The y coordinate of the translation transform.
 * @param {number} rotate The angle of the rotation transform.
 * @param {number} centerX The horizontal center of the rotation transform.
 * @param {number} centerY The vertical center of the rotation transform.
 */
goog.graphics.Element.prototype.setTransformation = function(x, y, rotate,
    centerX, centerY) {
  // TODO(robbyw): Add skew and scale.

  this.transform_ = goog.graphics.AffineTransform.getRotateInstance(
      goog.math.toRadians(rotate), centerX, centerY).translate(x, y);
  this.getGraphics().setElementTransform(this, x, y, rotate, centerX, centerY);
};


/**
 * @return {goog.graphics.AffineTransform} The transformation applied to
 *     this element.
 */
goog.graphics.Element.prototype.getTransform = function() {
  return this.transform_ ? this.transform_.clone() :
      new goog.graphics.AffineTransform();
};


/** @override */
goog.graphics.Element.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this.element_, type, handler, opt_capture,
      opt_handlerScope);
};


/** @override */
goog.graphics.Element.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this.element_, type, handler, opt_capture,
      opt_handlerScope);
};


/** @override */
goog.graphics.Element.prototype.disposeInternal = function() {
  goog.graphics.Element.superClass_.disposeInternal.call(this);
  goog.events.removeAll(this.element_);
};
