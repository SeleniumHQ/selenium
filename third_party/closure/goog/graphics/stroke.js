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
 * @fileoverview Represents a stroke object for goog.graphics.
*
 */


goog.provide('goog.graphics.Stroke');


/**
 * Creates an immutable stroke object.
 *
 * @param {number|string} width The width of the stroke.
 * @param {string} color The color of the stroke.
 * @constructor
 */
goog.graphics.Stroke = function(width, color) {
  /**
   * The width of the stroke.
   * @type {number|string}
   * @private
   */
  this.width_ = width;


  /**
   * The color with which to fill.
   * @type {string}
   * @private
   */
  this.color_ = color;
};


/**
 * @return {number|string} The width of this stroke.
 */
goog.graphics.Stroke.prototype.getWidth = function() {
  return this.width_;
};


/**
 * @return {string} The color of this stroke.
 */
goog.graphics.Stroke.prototype.getColor = function() {
  return this.color_;
};
