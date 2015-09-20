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
 * @fileoverview Emoji implementation.
 *
 */

goog.provide('goog.ui.emoji.Emoji');



/**
 * Creates an emoji.
 *
 * A simple wrapper for an emoji.
 *
 * @param {string} url URL pointing to the source image for the emoji.
 * @param {string} id The id of the emoji, e.g., 'std.1'.
 * @param {number=} opt_height The height of the emoji, if undefined the
 *     natural height of the emoji is used.
 * @param {number=} opt_width The width of the emoji, if undefined the natural
 *     width of the emoji is used.
 * @param {string=} opt_altText The alt text for the emoji image, eg. the
 *     unicode character representation of the emoji.
 * @constructor
 * @final
 */
goog.ui.emoji.Emoji = function(url, id,  opt_height, opt_width, opt_altText) {
  /**
   * The URL pointing to the source image for the emoji
   *
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * The id of the emoji
   *
   * @type {string}
   * @private
   */
  this.id_ = id;

  /**
   * The height of the emoji
   *
   * @type {?number}
   * @private
   */
  this.height_ = opt_height || null;

  /**
   * The width of the emoji
   *
   * @type {?number}
   * @private
   */
  this.width_ = opt_width || null;

  /**
   * The unicode of the emoji
   *
   * @type {?string}
   * @private
   */
  this.altText_ = opt_altText || null;
};


/**
 * The name of the goomoji attribute, used for emoji image elements.
 * @type {string}
 */
goog.ui.emoji.Emoji.ATTRIBUTE = 'goomoji';


/**
 * @return {string} The URL for this emoji.
 */
goog.ui.emoji.Emoji.prototype.getUrl = function() {
  return this.url_;
};


/**
 * @return {string} The id of this emoji.
 */
goog.ui.emoji.Emoji.prototype.getId = function() {
  return this.id_;
};


/**
 * @return {?number} The height of this emoji.
 */
goog.ui.emoji.Emoji.prototype.getHeight = function() {
  return this.height_;
};


/**
 * @return {?number} The width of this emoji.
 */
goog.ui.emoji.Emoji.prototype.getWidth = function() {
  return this.width_;
};


/**
 * @return {?string} The alt text for the emoji image, eg. the unicode character
 *     representation of the emoji.
 */
goog.ui.emoji.Emoji.prototype.getAltText = function() {
  return this.altText_;
};

