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
 * @fileoverview Represents a solid color fill goog.graphics.
*
 */


goog.provide('goog.graphics.SolidFill');


goog.require('goog.graphics.Fill');


/**
 * Creates an immutable solid color fill object.
 *
 * @param {string} color The color of the background.
 * @param {number=} opt_opacity The opacity of the background fill. The value
 *    must be greater than zero (transparent) and less than or equal to 1
 *    (opaque).
 * @constructor
 * @extends {goog.graphics.Fill}
 */
goog.graphics.SolidFill = function(color, opt_opacity) {
  /**
   * The color with which to fill.
   * @type {string}
   * @private
   */
  this.color_ = color;


  /**
   * The opacity of the fill.
   * @type {number}
   * @private
   */
  this.opacity_ = opt_opacity || 1.0;
};
goog.inherits(goog.graphics.SolidFill, goog.graphics.Fill);


/**
 * @return {string} The color of this fill.
 */
goog.graphics.SolidFill.prototype.getColor = function() {
  return this.color_;
};


/**
 * @return {number} The opacity of this fill.
 */
goog.graphics.SolidFill.prototype.getOpacity = function() {
  return this.opacity_;
};
