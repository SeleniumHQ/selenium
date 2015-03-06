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
 * @constructor
 * @final
 */
goog.ui.emoji.Emoji = function(url, id) {
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
