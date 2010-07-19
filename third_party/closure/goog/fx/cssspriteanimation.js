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
 * @fileoverview An animation class that animates CSS sprites by changing the
 * CSS background-position.
 *
*
 * @see ../demos/cssspriteanimation.html
 */

goog.provide('goog.fx.CssSpriteAnimation');

goog.require('goog.fx.Animation');



/**
 * This animation class is used to animate a CSS sprite (moving a background
 * image).  This moves through a series of images in a single image sprite and
 * loops the animation when donw.  You should set up the
 * {@code background-image} and size in a CSS rule for the relevant element.
 *
 * @param {Element} element The HTML element to animate the background for.
 * @param {goog.math.Size} size The size of one image in the image sprite.
 * @param {goog.math.Box} box The box describing the layout of the sprites to
 *     use in the large image.  The sprites can be position horizontally or
 *     vertically and using a box here allows the implementation to know which
 *     way to go.
 * @param {number} time The duration in milliseconds for one iteration of the
 *     animation.  For example, if the sprite contains 4 images and the duration
 *     is set to 400ms then each sprite will be displayed for 100ms.
 * @param {function(number) : number=} opt_acc Acceleration function,
 *    returns 0-1 for inputs 0-1.  This can be used to make certain frames be
 *    shown for a longer period of time.
 *
 * @constructor
 * @extends {goog.fx.Animation}
 */
goog.fx.CssSpriteAnimation = function(element, size, box, time, opt_acc) {
  var start = [box.left, box.top];
  // We never draw for the end so we do not need to subtract for the size
  var end = [box.right, box.bottom];
  goog.fx.Animation.call(this, start, end, time, opt_acc);

  /**
   * HTML element that will be used in the animation.
   * @type {Element}
   * @private
   */
  this.element_ = element;

  /**
   * The size of an individual sprite in the image sprite.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = size;
};
goog.inherits(goog.fx.CssSpriteAnimation, goog.fx.Animation);


/** @inheritDoc */
goog.fx.CssSpriteAnimation.prototype.onAnimate = function() {
  // Round to nearest sprite.
  var x = -Math.floor(this.coords[0] / this.size_.width) * this.size_.width;
  var y = -Math.floor(this.coords[1] / this.size_.height) * this.size_.height;
  this.element_.style.backgroundPosition = x + 'px ' + y + 'px';

  goog.fx.CssSpriteAnimation.superClass_.onAnimate.call(this);
};


/** @inheritDoc */
goog.fx.CssSpriteAnimation.prototype.onFinish = function() {
  this.play(true);
  goog.fx.CssSpriteAnimation.superClass_.onFinish.call(this);
};


/**
 * Clears the background position style set directly on the element
 * by the animation. Allows to apply CSS styling for background position on the
 * same element when the sprite animation is not runniing.
 */
goog.fx.CssSpriteAnimation.prototype.clearSpritePosition = function() {
  var style = this.element_.style;
  style.backgroundPosition = '';

  if (typeof style.backgroundPositionX != 'undefined') {
    // IE needs to clear x and y to actually clear the position
    style.backgroundPositionX = '';
    style.backgroundPositionY = '';
  }
};


/** @inheritDoc */
goog.fx.CssSpriteAnimation.prototype.disposeInternal = function() {
  goog.fx.CssSpriteAnimation.superClass_.disposeInternal.call(this);
  this.element_ = null;
};
