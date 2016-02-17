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
 * @fileoverview Progressive Emoji Palette renderer implementation.
 *
 */

goog.provide('goog.ui.emoji.ProgressiveEmojiPaletteRenderer');

goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.ui.emoji.EmojiPaletteRenderer');



/**
 * Progressively renders an emoji palette. The progressive renderer tries to
 * use img tags instead of background-image for sprited emoji, since most
 * browsers render img tags progressively (i.e., as the data comes in), while
 * only very new browsers render background-image progressively.
 *
 * @param {string} defaultImgUrl Url of the img that should be used to fill up
 *     the cells in the emoji table, to prevent jittering. Will be stretched
 *     to the emoji cell size. A good image is a transparent dot.
 * @constructor
 * @extends {goog.ui.emoji.EmojiPaletteRenderer}
 * @final
 */
goog.ui.emoji.ProgressiveEmojiPaletteRenderer = function(defaultImgUrl) {
  goog.ui.emoji.EmojiPaletteRenderer.call(this, defaultImgUrl);
};
goog.inherits(
    goog.ui.emoji.ProgressiveEmojiPaletteRenderer,
    goog.ui.emoji.EmojiPaletteRenderer);


/** @override */
goog.ui.emoji.ProgressiveEmojiPaletteRenderer.prototype
    .buildElementFromSpriteMetadata = function(dom, spriteInfo, displayUrl) {
  var width = spriteInfo.getWidthCssValue();
  var height = spriteInfo.getHeightCssValue();
  var x = spriteInfo.getXOffsetCssValue();
  var y = spriteInfo.getYOffsetCssValue();
  // Need this extra div for proper vertical centering.
  var inner = dom.createDom(goog.dom.TagName.IMG, {'src': displayUrl});
  var el = /** @type {!HTMLDivElement} */ (
      dom.createDom(
          goog.dom.TagName.DIV, goog.getCssName('goog-palette-cell-extra'),
          inner));
  goog.style.setStyle(el, {
    'width': width,
    'height': height,
    'overflow': 'hidden',
    'position': 'relative'
  });
  goog.style.setStyle(inner, {'left': x, 'top': y, 'position': 'absolute'});

  return el;
};


/** @override */
goog.ui.emoji.ProgressiveEmojiPaletteRenderer.prototype
    .updateAnimatedPaletteItem = function(item, animatedImg) {
  // Just to be safe, we check for the existence of the img element within this
  // palette item before attempting to modify it.
  var img;
  var el = item.firstChild;
  while (el) {
    if ('IMG' == /** @type {!Element} */ (el).tagName) {
      img = /** @type {!Element} */ (el);
      break;
    }
    el = el.firstChild;
  }
  if (!el) {
    return;
  }

  img.width = animatedImg.width;
  img.height = animatedImg.height;
  goog.style.setStyle(img, {'left': 0, 'top': 0});
  img.src = animatedImg.src;
};
