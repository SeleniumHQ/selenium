// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview SpriteInfo implementation. This is a simple wrapper class to
 * hold CSS metadata needed for sprited emoji.
 *
 * @see ../demos/popupemojipicker.html or emojipicker_test.html for examples
 * of how to use this class.
 *
 */
goog.provide('goog.ui.emoji.SpriteInfo');



/**
 * Creates a SpriteInfo object with the specified properties. If the image is
 * sprited via CSS, then only the first parameter needs a value. If the image
 * is sprited via metadata, then the first parameter should be left null.
 *
 * @param {?string} cssClass CSS class to properly display the sprited image.
 * @param {string=} opt_url Url of the sprite image.
 * @param {number=} opt_width Width of the image being sprited.
 * @param {number=} opt_height Height of the image being sprited.
 * @param {number=} opt_xOffset Positive x offset of the image being sprited
 *     within the sprite.
 * @param {number=} opt_yOffset Positive y offset of the image being sprited
 *     within the sprite.
 * @param {boolean=} opt_animated Whether the sprite is animated.
 * @constructor
 * @final
 */
goog.ui.emoji.SpriteInfo = function(cssClass, opt_url, opt_width, opt_height,
                                    opt_xOffset, opt_yOffset, opt_animated) {
  if (cssClass != null) {
    this.cssClass_ = cssClass;
  } else {
    if (opt_url == undefined || opt_width === undefined ||
        opt_height === undefined || opt_xOffset == undefined ||
        opt_yOffset === undefined) {
      throw Error('Sprite info is not fully specified');
    }

    this.url_ = opt_url;
    this.width_ = opt_width;
    this.height_ = opt_height;
    this.xOffset_ = opt_xOffset;
    this.yOffset_ = opt_yOffset;
  }

  this.animated_ = !!opt_animated;
};


/**
 * Name of the CSS class to properly display the sprited image.
 * @type {string}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.cssClass_;


/**
 * Url of the sprite image.
 * @type {string|undefined}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.url_;


/**
 * Width of the image being sprited.
 * @type {number|undefined}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.width_;


/**
 * Height of the image being sprited.
 * @type {number|undefined}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.height_;


/**
 * Positive x offset of the image being sprited within the sprite.
 * @type {number|undefined}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.xOffset_;


/**
 * Positive y offset of the image being sprited within the sprite.
 * @type {number|undefined}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.yOffset_;


/**
 * Whether the emoji specified by the sprite is animated.
 * @type {boolean}
 * @private
 */
goog.ui.emoji.SpriteInfo.prototype.animated_;


/**
 * Returns the css class of the sprited image.
 * @return {?string} Name of the CSS class to properly display the sprited
 *     image.
 */
goog.ui.emoji.SpriteInfo.prototype.getCssClass = function() {
  return this.cssClass_ || null;
};


/**
 * Returns the url of the sprite image.
 * @return {?string} Url of the sprite image.
 */
goog.ui.emoji.SpriteInfo.prototype.getUrl = function() {
  return this.url_ || null;
};


/**
 * Returns whether the emoji specified by this sprite is animated.
 * @return {boolean} Whether the emoji is animated.
 */
goog.ui.emoji.SpriteInfo.prototype.isAnimated = function() {
  return this.animated_;
};


/**
 * Returns the width of the image being sprited, appropriate for a CSS value.
 * @return {string} The width of the image being sprited.
 */
goog.ui.emoji.SpriteInfo.prototype.getWidthCssValue = function() {
  return goog.ui.emoji.SpriteInfo.getCssPixelValue_(this.width_);
};


/**
 * Returns the height of the image being sprited, appropriate for a CSS value.
 * @return {string} The height of the image being sprited.
 */
goog.ui.emoji.SpriteInfo.prototype.getHeightCssValue = function() {
  return goog.ui.emoji.SpriteInfo.getCssPixelValue_(this.height_);
};


/**
 * Returns the x offset of the image being sprited within the sprite,
 * appropriate for a CSS value.
 * @return {string} The x offset of the image being sprited within the sprite.
 */
goog.ui.emoji.SpriteInfo.prototype.getXOffsetCssValue = function() {
  return goog.ui.emoji.SpriteInfo.getOffsetCssValue_(this.xOffset_);
};


/**
 * Returns the positive y offset of the image being sprited within the sprite,
 * appropriate for a CSS value.
 * @return {string} The y offset of the image being sprited within the sprite.
 */
goog.ui.emoji.SpriteInfo.prototype.getYOffsetCssValue = function() {
  return goog.ui.emoji.SpriteInfo.getOffsetCssValue_(this.yOffset_);
};


/**
 * Returns a string appropriate for use as a CSS value. If the value is zero,
 * then there is no unit appended.
 *
 * @param {number|undefined} value A number to be turned into a
 *     CSS size/location value.
 * @return {string} A string appropriate for use as a CSS value.
 * @private
 */
goog.ui.emoji.SpriteInfo.getCssPixelValue_ = function(value) {
  return !value ? '0' : value + 'px';
};


/**
 * Returns a string appropriate for use as a CSS value for a position offset,
 * such as the position argument for sprites.
 *
 * @param {number|undefined} posOffset A positive offset for a position.
 * @return {string} A string appropriate for use as a CSS value.
 * @private
 */
goog.ui.emoji.SpriteInfo.getOffsetCssValue_ = function(posOffset) {
  var offset = goog.ui.emoji.SpriteInfo.getCssPixelValue_(posOffset);
  return offset == '0' ? offset : '-' + offset;
};
