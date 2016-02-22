// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview provides a reusable picasa album UI component given a public
 * picasa album URL.
 *
 * TODO(user): implement the javascript viewer, for users without flash. Get it
 * from the Gmail Picasa gadget.
 *
 * goog.ui.media.PicasaAlbum is actually a {@link goog.ui.ControlRenderer}, a
 * stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.PicasaAlbum.getInstance} -, that knows how to
 * render picasa albums. It is designed to be used with a
 * {@link goog.ui.Control}, which will actually control the media renderer and
 * provide the {@link goog.ui.Component} base. This design guarantees that all
 * different types of medias will behave alike but will look different.
 *
 * goog.ui.media.PicasaAlbum expects {@code goog.ui.media.PicasaAlbumModel}s on
 * {@code goog.ui.Control.getModel} as data models, and render a flash object
 * that will show a slideshow with the contents of that album URL.
 *
 * Example of usage:
 *
 * <pre>
 *   var album = goog.ui.media.PicasaAlbumModel.newInstance(
 *       'http://picasaweb.google.com/username/SanFranciscoCalifornia');
 *   goog.ui.media.PicasaAlbum.newControl(album).render();
 * </pre>
 *
 * picasa medias currently support the following states:
 *
 * <ul>
 *   <li> {@link goog.ui.Component.State.DISABLED}: shows 'flash not available'
 *   <li> {@link goog.ui.Component.State.HOVER}: mouse cursor is over the album
 *   <li> {@link goog.ui.Component.State.SELECTED}: flash album is shown
 * </ul>
 *
 * Which can be accessed by
 *
 * <pre>
 *   picasa.setEnabled(true);
 *   picasa.setHighlighted(true);
 *   picasa.setSelected(true);
 * </pre>
 *
 *
 * @supported IE6, FF2+, Safari. Requires flash to actually work.
 *
 * TODO(user): test on other browsers
 */

goog.provide('goog.ui.media.PicasaAlbum');
goog.provide('goog.ui.media.PicasaAlbumModel');

goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string.Const');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaRenderer');



/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a Picasa specific media
 * renderer.
 *
 * This class knows how to parse picasa URLs, and render the DOM structure
 * of picasa album players and previews. This class is meant to be used as a
 * singleton static stateless class, that takes {@code goog.ui.media.Media}
 * instances and renders it. It expects {@code goog.ui.media.Media.getModel} to
 * return a well formed, previously constructed, object with a user and album
 * fields {@see goog.ui.media.PicasaAlbum.parseUrl}, which is the data model
 * this renderer will use to construct the DOM structure.
 * {@see goog.ui.media.PicasaAlbum.newControl} for a example of constructing a
 * control with this renderer.
 *
 * goog.ui.media.PicasaAlbum currently displays a picasa-made flash slideshow
 * with the photos, but could possibly display a handwritten js photo viewer,
 * in case flash is not available.
 *
 * This design is patterned after http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 * @final
 */
goog.ui.media.PicasaAlbum = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.PicasaAlbum, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.PicasaAlbum);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.PicasaAlbum.CSS_CLASS = goog.getCssName('goog-ui-media-picasa');


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a picasa data model. It sets it as the data model goog.ui.media.PicasaAlbum
 * renderer uses, sets the states supported by the renderer, and returns a
 * Control that binds everything together. This is what you should be using for
 * constructing Picasa albums, except if you need finer control over the
 * configuration.
 *
 * @param {goog.ui.media.PicasaAlbumModel} dataModel A picasa album data model.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {!goog.ui.media.Media} A Control instance binded to the Picasa
 *     renderer.
 */
goog.ui.media.PicasaAlbum.newControl = function(dataModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      dataModel,
      goog.ui.media.PicasaAlbum.getInstance(),
      opt_domHelper);
  control.setSelected(true);
  return control;
};


/**
 * Creates the initial DOM structure of the picasa album, which is basically a
 * the flash object pointing to a flash picasa album player.
 *
 * @param {goog.ui.Control} c The media control.
 * @return {!Element} The DOM structure that represents the control.
 * @override
 */
goog.ui.media.PicasaAlbum.prototype.createDom = function(c) {
  var control = /** @type {goog.ui.media.Media} */ (c);
  var div = goog.ui.media.PicasaAlbum.superClass_.createDom.call(this, control);

  var picasaAlbum =
      /** @type {goog.ui.media.PicasaAlbumModel} */ (control.getDataModel());
  var authParam =
      picasaAlbum.getAuthKey() ? ('&authkey=' + picasaAlbum.getAuthKey()) : '';
  var flash = new goog.ui.media.FlashObject(
      picasaAlbum.getPlayer().getTrustedResourceUrl(),
      control.getDomHelper());
  flash.addFlashVars(picasaAlbum.getPlayer().getVars());
  flash.render(div);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.media.PicasaAlbum.prototype.getCssClass = function() {
  return goog.ui.media.PicasaAlbum.CSS_CLASS;
};



/**
 * The {@code goog.ui.media.PicasaAlbum} media data model. It stores a required
 * {@code userId} and {@code albumId} fields, sets the picasa album URL, and
 * allows a few optional parameters.
 *
 * @param {string} userId The picasa userId associated with this album.
 * @param {string} albumId The picasa albumId associated with this album.
 * @param {string=} opt_authKey An optional authentication key, used on private
 *     albums.
 * @param {string=} opt_caption An optional caption of the picasa album.
 * @param {string=} opt_description An optional description of the picasa album.
 * @param {boolean=} opt_autoplay Whether to autoplay the slideshow.
 * @constructor
 * @extends {goog.ui.media.MediaModel}
 * @final
 */
goog.ui.media.PicasaAlbumModel = function(userId,
                                          albumId,
                                          opt_authKey,
                                          opt_caption,
                                          opt_description,
                                          opt_autoplay) {
  goog.ui.media.MediaModel.call(
      this,
      goog.ui.media.PicasaAlbumModel.buildUrl(userId, albumId),
      opt_caption,
      opt_description,
      goog.ui.media.MediaModel.MimeType.FLASH);

  /**
   * The Picasa user id.
   * @type {string}
   * @private
   */
  this.userId_ = userId;

  /**
   * The Picasa album id.
   * @type {string}
   * @private
   */
  this.albumId_ = albumId;

  /**
   * The Picasa authentication key, used on private albums.
   * @type {?string}
   * @private
   */
  this.authKey_ = opt_authKey || null;

  var authParam = opt_authKey ? ('&authkey=' + opt_authKey) : '';

  var flashVars = {
    'host': 'picasaweb.google.com',
    'RGB': '0x000000',
    'feed': 'http://picasaweb.google.com/data/feed/api/user/' +
        userId + '/album/' + albumId + '?kind=photo&alt=rss' + authParam
  };
  flashVars[opt_autoplay ? 'autoplay' : 'noautoplay'] = '1';

  var flashUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from(
          'http://picasaweb.google.com/s/c/bin/slideshow.swf'));
  var player = new goog.ui.media.MediaModel.Player(flashUrl, flashVars);

  this.setPlayer(player);
};
goog.inherits(goog.ui.media.PicasaAlbumModel, goog.ui.media.MediaModel);


/**
 * Regular expression used to extract the picasa username and albumid out of
 * picasa URLs.
 *
 * Copied from http://go/markdownlite.js,
 * and {@link PicasaWebExtractor.xml}.
 *
 * @type {RegExp}
 * @private
 * @const
 */
goog.ui.media.PicasaAlbumModel.MATCHER_ =
    /https?:\/\/(?:www\.)?picasaweb\.(?:google\.)?com\/([\d\w\.]+)\/([\d\w_\-\.]+)(?:\?[\w\d\-_=&amp;;\.]*&?authKey=([\w\d\-_=;\.]+))?(?:#([\d]+)?)?/im;


/**
 * Gets a {@code picasaUrl} and extracts the user and album id.
 *
 * @param {string} picasaUrl A picasa album URL.
 * @param {string=} opt_caption An optional caption of the picasa album.
 * @param {string=} opt_description An optional description of the picasa album.
 * @param {boolean=} opt_autoplay Whether to autoplay the slideshow.
 * @return {!goog.ui.media.PicasaAlbumModel} The picasa album data model that
 *     represents the picasa URL.
 * @throws exception in case the parsing fails
 */
goog.ui.media.PicasaAlbumModel.newInstance = function(picasaUrl,
                                                      opt_caption,
                                                      opt_description,
                                                      opt_autoplay) {
  if (goog.ui.media.PicasaAlbumModel.MATCHER_.test(picasaUrl)) {
    var data = goog.ui.media.PicasaAlbumModel.MATCHER_.exec(picasaUrl);
    return new goog.ui.media.PicasaAlbumModel(
        data[1], data[2], data[3], opt_caption, opt_description, opt_autoplay);
  }
  throw Error('failed to parse user and album from picasa url: ' + picasaUrl);
};


/**
 * The opposite of {@code newInstance}: takes an {@code userId} and an
 * {@code albumId} and builds a URL.
 *
 * @param {string} userId The user that owns the album.
 * @param {string} albumId The album id.
 * @return {string} The URL of the album.
 */
goog.ui.media.PicasaAlbumModel.buildUrl = function(userId, albumId) {
  return 'http://picasaweb.google.com/' + userId + '/' + albumId;
};


/**
 * Gets the Picasa user id.
 * @return {string} The Picasa user id.
 */
goog.ui.media.PicasaAlbumModel.prototype.getUserId = function() {
  return this.userId_;
};


/**
 * Gets the Picasa album id.
 * @return {string} The Picasa album id.
 */
goog.ui.media.PicasaAlbumModel.prototype.getAlbumId = function() {
  return this.albumId_;
};


/**
 * Gets the Picasa album authentication key.
 * @return {?string} The Picasa album authentication key.
 */
goog.ui.media.PicasaAlbumModel.prototype.getAuthKey = function() {
  return this.authKey_;
};
