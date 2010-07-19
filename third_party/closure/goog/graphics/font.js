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
 * @fileoverview Represents a font to be used with a Renderer.
*
 * @see ../demos/graphics/basicelements.html
 */


goog.provide('goog.graphics.Font');


/**
 * This class represents a font to be used with a renderer.
 * @param {number} size  The font size.
 * @param {string} family  The font family.
 * @constructor
 */
goog.graphics.Font = function(size, family) {
  /**
   * Font size.
   * @type {number}
   */
  this.size = size;
  // TODO(user): Is this in pixels or drawing units based on the coord size?

  /**
   * The name of the font family to use, can be a comma separated string.
   * @type {string}
   */
  this.family = family;
};


/**
 * Indication if text should be bolded
 * @type {boolean}
 */
goog.graphics.Font.prototype.bold = false;


/**
 * Indication if text should be in italics
 * @type {boolean}
 */
goog.graphics.Font.prototype.italic = false;
