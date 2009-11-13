// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Provides the base media model consistent with the Yahoo Media
 * RSS specification {@link http://search.yahoo.com/mrss/}.
 */

goog.provide('goog.ui.media.MediaModel');
goog.provide('goog.ui.media.MediaModel.Category');
goog.provide('goog.ui.media.MediaModel.MimeType');
goog.provide('goog.ui.media.MediaModel.Player');
goog.provide('goog.ui.media.MediaModel.Thumbnail');


/**
 * An base data value class for all media data models.
 *
 * MediaModels are exact matches to the fields defined in the Yahoo RSS media
 * specification {@link http://search.yahoo.com/mrss/}.
 *
 * The current common data shared by medias is to have URLs, mime types,
 * captions, descriptions, thumbnails and players. Some of these may not be
 * available, or applications may not want to render them, so {@code null}
 * values are allowed. {@code goog.ui.media.MediaRenderer} checks whether the
 * values are available before creating DOMs for them.
 *
 * TODO: support asynchronous data models by subclassing
 * {@link goog.events.EventTarget} or {@link goog.ds.DataNode}. Understand why
 * {@link fava.data.Node} is under fava, and not available in closure. Add
 * setters to MediaModel once this is supported.
 *
 * @param {string} opt_url An optional URL of the media.
 * @param {string} opt_caption An optional caption of the media.
 * @param {string} opt_description An optional description of the media.
 * @param {goog.ui.media.MediaModel.MimeType} opt_type The type of the media.
 * @param {goog.ui.media.MediaModel.Medium} opt_medium The medium of the media.
 * @constructor
 */
goog.ui.media.MediaModel = function(opt_url,
                                    opt_caption,
                                    opt_description,
                                    opt_type,
                                    opt_medium) {
  /**
   * The URL of the media.
   * @type {string|undefined}
   * @private
   */
  this.url_ = opt_url;

  /**
   * The caption of the media.
   * @type {string|undefined}
   * @private
   */
  this.caption_ = opt_caption;

  /**
   * A description of the media, typically user generated comments about it.
   * @type {string|undefined}
   * @private
   */
  this.description_ = opt_description;

  /**
   * The mime type of the media.
   * @type {goog.ui.media.MediaModel.MimeType|undefined}
   * @private
   */
  this.type_ = opt_type;

  /**
   * The medium of the media.
   * @type {goog.ui.media.MediaModel.Medium|undefined}
   * @private
   */
  this.medium_ = opt_medium;

  /**
   * A list of thumbnails representations of the media (eg different sizes of
   * the same photo, etc).
   * @type {Array.<goog.ui.media.MediaModel.Thumbnail>}
   * @private
   */
  this.thumbnails_ = [];

  /**
   * The list of categories that are applied to this media.
   * @type {Array.<goog.ui.media.MediaModel.Category>}
   * @private
   */
  this.categories_ = [];
};


/**
 * The supported media mime types, a subset of the media types found here:
 * {@link http://www.iana.org/assignments/media-types/} and here
 * {@link http://en.wikipedia.org/wiki/Internet_media_type}
 * @enum {string}
 */
goog.ui.media.MediaModel.MimeType = {
  HTML: 'text/html',
  PLAIN: 'text/plain',
  FLASH: 'application/x-shockwave-flash',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  PNG: 'image/png'
};


/**
 * Supported mediums, found here:
 * {@link http://video.search.yahoo.com/mrss}
 * @enum {string}
 */
goog.ui.media.MediaModel.Medium = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document',
  EXECUTABLE: 'executable'
};


/**
 * The media player.
 * @type {goog.ui.media.MediaModel.Player}
 * @private
 */
goog.ui.media.MediaModel.prototype.player_;


/**
 * Gets the URL of this media.
 * @return {string|undefined} The URL of the media.
 */
goog.ui.media.MediaModel.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Sets the URL of this media.
 * @param {string} url The URL of the media.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setUrl = function(url) {
  this.url_ = url;
  return this;
};


/**
 * Gets the caption of this media.
 * @return {string|undefined} The caption of the media.
 */
goog.ui.media.MediaModel.prototype.getCaption = function() {
  return this.caption_;
};


/**
 * Sets the caption of this media.
 * @param {string} caption The caption of the media.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setCaption = function(caption) {
  this.caption_ = caption;
  return this;
};


/**
 * Gets the media mime type.
 * @return {goog.ui.media.MediaModel.MimeType|undefined} The media mime type.
 */
goog.ui.media.MediaModel.prototype.getType = function() {
  return this.type_;
};


/**
 * Sets the media mime type.
 * @param {goog.ui.media.MediaModel.MimeType} type The media mime type.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setType = function(type) {
  this.type_ = type;
  return this;
};


/**
 * Gets the media medium.
 * @return {goog.ui.media.MediaModel.Medium|undefined} The media medium.
 */
goog.ui.media.MediaModel.prototype.getMedium = function() {
  return this.medium_;
};


/**
 * Sets the media medium.
 * @param {goog.ui.media.MediaModel.Medium} medium The media medium.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setMedium = function(medium) {
  this.medium_ = medium;
  return this;
};


/**
 * Gets the description of this media.
 * @return {string|undefined} The description of the media.
 */
goog.ui.media.MediaModel.prototype.getDescription = function() {
  return this.description_;
};


/**
 * Sets the description of this media.
 * @param {string} description The description of the media.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setDescription = function(description) {
  this.description_ = description;
  return this;
};


/**
 * Gets the thumbnail urls.
 * @return {Array.<goog.ui.media.MediaModel.Thumbnail>} The list of thumbnails.
 */
goog.ui.media.MediaModel.prototype.getThumbnails = function() {
  return this.thumbnails_;
};


/**
 * Sets the thumbnail list.
 * @param {Array.<goog.ui.media.MediaModel.Thumbnail>} thumbnails The list of
 *     thumbnail.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setThumbnails = function(thumbnails) {
  this.thumbnails_ = thumbnails;
  return this;
};


/**
 * Gets the player data.
 * @return {goog.ui.media.MediaModel.Player|undefined} The media player data.
 */
goog.ui.media.MediaModel.prototype.getPlayer = function() {
  return this.player_;
};


/**
 * Sets the player data.
 * @param {goog.ui.media.MediaModel.Player} player The media player data.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setPlayer = function(player) {
  this.player_ = player;
  return this;
};


/**
 * Gets the categories of the media.
 * @return {Array.<goog.ui.media.MediaModel.Category>} The categories of the
 *     media.
 */
goog.ui.media.MediaModel.prototype.getCategories = function() {
  return this.categories_;
};


/**
 * Sets the categories of the media
 * @param {Array.<goog.ui.media.MediaModel.Category>} categories The categories
 *     of the media.
 * @return {goog.ui.media.MediaModel} The object itself, used for chaining.
 */
goog.ui.media.MediaModel.prototype.setCategories = function(categories) {
  this.categories_ = categories;
  return this;
};


/**
 * Constructs a thumbnail containing details of the thumbnail's image URL and
 * optionally it's size.
 * @param {string} url The URL of the thumbnail's image.
 * @param {goog.math.Size} opt_size The size of the thumbnail's image if known.
 * @constructor
 */
goog.ui.media.MediaModel.Thumbnail = function(url, opt_size) {
  /**
   * The thumbnail's image URL.
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * The size of the thumbnail's image if known.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = opt_size || null;
};


/**
 * Gets the thumbnail URL.
 * @return {string} The thumbnail's image URL.
 */
goog.ui.media.MediaModel.Thumbnail.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Sets the thumbnail URL.
 * @param {string} url The thumbnail's image URL.
 * @return {goog.ui.media.MediaModel.Thumbnail} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Thumbnail.prototype.setUrl = function(url) {
  this.url_ = url;
  return this;
};


/**
 * Gets the thumbnail size.
 * @return {goog.math.Size} The size of the thumbnail's image if known.
 */
goog.ui.media.MediaModel.Thumbnail.prototype.getSize = function() {
  return this.size_;
};


/**
 * Sets the thumbnail size.
 * @param {goog.math.Size} size The size of the thumbnail's image.
 * @return {goog.ui.media.MediaModel.Thumbnail} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Thumbnail.prototype.setSize = function(size) {
  this.size_ = size;
  return this;
};


/**
 * Constructs a player containing details of the player's URL and
 * optionally it's size.
 * @param {string} url The URL of the player.
 * @param {Object} opt_vars Optional map of arguments to the player.
 * @param {goog.math.Size} opt_size The size of the player if known.
 * @constructor
 */
goog.ui.media.MediaModel.Player = function(url, opt_vars, opt_size) {
  /**
   * The player's URL.
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * Player arguments, typically flash arguments.
   * @type {Object}
   * @private
   */
  this.vars_ = opt_vars || null;

  /**
   * The size of the player if known.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = opt_size || null;
};


/**
 * Gets the player url.
 * @return {string} The thumbnail's image URL.
 */
goog.ui.media.MediaModel.Player.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Sets the player url.
 * @param {string} url The thumbnail's image URL.
 * @return {goog.ui.media.MediaModel.Player} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Player.prototype.setUrl = function(url) {
  this.url_ = url;
  return this;
};


/**
 * Gets the player arguments.
 * @return {Object} The media player arguments.
 */
goog.ui.media.MediaModel.Player.prototype.getVars = function() {
  return this.vars_;
};


/**
 * Sets the player arguments.
 * @param {Object} vars The media player arguments.
 * @return {goog.ui.media.MediaModel.Player} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Player.prototype.setVars = function(vars) {
  this.vars_ = vars;
  return this;
};


/**
 * Gets the size of the player.
 * @return {goog.math.Size} The size of the player if known.
 */
goog.ui.media.MediaModel.Player.prototype.getSize = function() {
  return this.size_;
};


/**
 * Sets the size of the player.
 * @param {goog.math.Size} size The size of the player.
 * @return {goog.ui.media.MediaModel.Player} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Player.prototype.setSize = function(size) {
  this.size_ = size;
  return this;
};


/**
 * A taxonomy to be set that gives an indication of the type of media content,
 * and its particular contents.
 * @param {string} scheme The URI that identifies the categorization scheme.
 * @param {string} value The value of the category.
 * @param {string} opt_label The human readable label that can be displayed in
 *     end user applications.
 * @constructor
 */
goog.ui.media.MediaModel.Category = function(scheme, value, opt_label) {
  /**
   * The URI that identifies the categorization scheme.
   * @type {string}
   * @private
   */
  this.scheme_ = scheme;

  /**
   * The value of the category.
   * @type {string}
   * @private
   */
  this.value_ = value;

  /**
   * The human readable label that can be displayed in end user applications.
   * @type {string}
   * @private
   */
  this.label_ = opt_label || '';
};


/**
 * Gets the category scheme.
 * @return {string} The category scheme URI.
 */
goog.ui.media.MediaModel.Category.prototype.getScheme = function() {
  return this.scheme_;
};


/**
 * Sets the category scheme.
 * @param {string} scheme The category's scheme.
 * @return {goog.ui.media.MediaModel.Category} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Category.prototype.setScheme = function(scheme) {
  this.scheme_ = scheme;
  return this;
};


/**
 * Gets the categor's value.
 * @return {string} The category's value.
 */
goog.ui.media.MediaModel.Category.prototype.getValue = function() {
  return this.value_;
};


/**
 * Sets the category value.
 * @param {string} value The category value to be set.
 * @return {goog.ui.media.MediaModel.Category} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Category.prototype.setValue = function(value) {
  this.value_ = value;
  return this;
};


/**
 * Gets the label of the category.
 * @return {string} The label of the category.
 */
goog.ui.media.MediaModel.Category.prototype.getLabel = function() {
  return this.label_;
};


/**
 * Sets the label of the category.
 * @param {string} label The label of the category.
 * @return {goog.ui.media.MediaModel.Category} The object itself, used for
 *     chaining.
 */
goog.ui.media.MediaModel.Category.prototype.setLabel = function(label) {
  this.label_ = label;
  return this;
};
