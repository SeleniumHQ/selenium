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
 * @fileoverview Represents a gradient to be used with a Graphics implementor.
*
 */


goog.provide('goog.graphics.LinearGradient');


goog.require('goog.graphics.Fill');


/**
 * Creates an immutable linear gradient fill object.
 *
 * @param {number} x1 Start X position of the gradient.
 * @param {number} y1 Start Y position of the gradient.
 * @param {number} x2 End X position of the gradient.
 * @param {number} y2 End Y position of the gradient.
 * @param {string} color1 Start color of the gradient.
 * @param {string} color2 End color of the gradient.
 * @constructor
 * @extends {goog.graphics.Fill}
 */
goog.graphics.LinearGradient = function(x1, y1, x2, y2, color1, color2) {
  /**
   * Start X position of the gradient.
   * @type {number}
   * @private
   */
  this.x1_ = x1;

  /**
   * Start Y position of the gradient.
   * @type {number}
   * @private
   */
  this.y1_ = y1;

  /**
   * End X position of the gradient.
   * @type {number}
   * @private
   */
  this.x2_ = x2;

  /**
   * End Y position of the gradient.
   * @type {number}
   * @private
   */
  this.y2_ = y2;

  /**
   * Start color of the gradient.
   * @type {string}
   * @private
   */
  this.color1_ = color1;

  /**
   * End color of the gradient.
   * @type {string}
   * @private
   */
  this.color2_ = color2;
};
goog.inherits(goog.graphics.LinearGradient, goog.graphics.Fill);


/**
 * @return {number} The start X position of the gradient.
 */
goog.graphics.LinearGradient.prototype.getX1 = function() {
  return this.x1_;
};


/**
 * @return {number} The start Y position of the gradient.
 */
goog.graphics.LinearGradient.prototype.getY1 = function() {
  return this.y1_;
};


/**
 * @return {number} The end X position of the gradient.
 */
goog.graphics.LinearGradient.prototype.getX2 = function() {
  return this.x2_;
};


/**
 * @return {number} The end Y position of the gradient.
 */
goog.graphics.LinearGradient.prototype.getY2 = function() {
  return this.y2_;
};


/**
 * @return {string} The start color of the gradient.
 */
goog.graphics.LinearGradient.prototype.getColor1 = function() {
  return this.color1_;
};


/**
 * @return {string} The end color of the gradient.
 */
goog.graphics.LinearGradient.prototype.getColor2 = function() {
  return this.color2_;
};
