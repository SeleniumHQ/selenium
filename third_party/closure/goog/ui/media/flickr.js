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
 * @fileoverview provides a reusable FlickrSet photo UI component given a public
 * FlickrSetModel.
 *
 * goog.ui.media.FlickrSet is actually a {@link goog.ui.ControlRenderer}, a
 * stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.FlickrSet.getInstance} -, that knows how to
 * render Flickr sets. It is designed to be used with a {@link goog.ui.Control},
 * which will actually control the media renderer and provide the
 * {@link goog.ui.Component} base. This design guarantees that all different
 * types of medias will behave alike but will look different.
 *
 * goog.ui.media.FlickrSet expects a {@code goog.ui.media.FlickrSetModel} on
 * {@code goog.ui.Control.getModel} as data models, and renders a flash object
 * that will show the contents of that set.
 *
 * Example of usage:
 *
 * <pre>
 *   var flickrSet = goog.ui.media.FlickrSetModel.newInstance(flickrSetUrl);
 *   goog.ui.media.FlickrSet.newControl(flickrSet).render();
 * </pre>
 *
 * FlickrSet medias currently support the following states:
 *
 * <ul>
 *   <li> {@link goog.ui.Component.State.DISABLED}: shows 'flash not available'
 *   <li> {@link goog.ui.Component.State.HOVER}: mouse cursor is over the video
 *   <li> {@link goog.ui.Component.State.SELECTED}: flash video is shown
 * </ul>
 *
 * Which can be accessed by
 * <pre>
 *   video.setEnabled(true);
 *   video.setHighlighted(true);
 *   video.setSelected(true);
 * </pre>
 *
 *
 * @supported IE6, FF2+, Safari. Requires flash to actually work.
 *
 * TODO(user): Support non flash users. Maybe show a link to the Flick set,
 * or fetch the data and rendering it using javascript (instead of a broken
 * 'You need to install flash' message).
 */

goog.provide('goog.ui.media.FlickrSet');
goog.provide('goog.ui.media.FlickrSetModel');

goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string.Const');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaRenderer');



/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a FlickrSet specific
 * media renderer.
 *
 * This class knows how to parse FlickrSet URLs, and render the DOM structure
 * of flickr set players. This class is meant to be used as a singleton static
 * stateless class, that takes {@code goog.ui.media.Media} instances and renders
 * it. It expects {@code goog.ui.media.Media.getModel} to return a well formed,
 * previously constructed, set id {@see goog.ui.media.FlickrSet.parseUrl},
 * which is the data model this renderer will use to construct the DOM
 * structure. {@see goog.ui.media.FlickrSet.newControl} for a example of
 * constructing a control with this renderer.
 *
 * This design is patterned after
 * http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 * @final
 */
goog.ui.media.FlickrSet = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.FlickrSet, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.FlickrSet);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.FlickrSet.CSS_CLASS = goog.getCssName('goog-ui-media-flickrset');


/**
 * Flash player URL. Uses Flickr's flash player by default.
 *
 * @type {!goog.html.TrustedResourceUrl}
 * @private
 */
goog.ui.media.FlickrSet.flashUrl_ = goog.html.TrustedResourceUrl.fromConstant(
    goog.string.Const.from(
        'http://www.flickr.com/apps/slideshow/show.swf?v=63961'));


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a FlickrSet URL. It extracts the set id information on the URL, sets it
 * as the data model goog.ui.media.FlickrSet renderer uses, sets the states
 * supported by the renderer, and returns a Control that binds everything
 * together. This is what you should be using for constructing FlickrSet videos,
 * except if you need more fine control over the configuration.
 *
 * @param {goog.ui.media.FlickrSetModel} dataModel The Flickr Set data model.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {!goog.ui.media.Media} A Control binded to the FlickrSet renderer.
 * @throws exception in case {@code flickrSetUrl} is an invalid flickr set URL.
 * TODO(user): use {@link goog.ui.media.MediaModel} once it is checked in.
 */
goog.ui.media.FlickrSet.newControl = function(dataModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      dataModel, goog.ui.media.FlickrSet.getInstance(), opt_domHelper);
  control.setSelected(true);
  return control;
};


/**
 * A static method that sets which flash URL this class should use. Use this if
 * you want to host your own flash flickr player.
 *
 * @param {!goog.html.TrustedResourceUrl} flashUrl The URL of the flash flickr
 *     player.
 */
goog.ui.media.FlickrSet.setFlashUrl = function(flashUrl) {
  goog.ui.media.FlickrSet.flashUrl_ = flashUrl;
};


/**
 * Creates the initial DOM structure of the flickr set, which is basically a
 * the flash object pointing to a flickr set player.
 *
 * @param {goog.ui.Control} c The media control.
 * @return {!Element} The DOM structure that represents this control.
 * @override
 */
goog.ui.media.FlickrSet.prototype.createDom = function(c) {
  var control = /** @type {goog.ui.media.Media} */ (c);
  var div = goog.ui.media.FlickrSet.superClass_.createDom.call(this, control);

  var model =
      /** @type {goog.ui.media.FlickrSetModel} */ (control.getDataModel());

  // TODO(user): find out what is the policy about hosting this SWF. figure out
  // if it works over https.
  var flash = new goog.ui.media.FlashObject(
      model.getPlayer().getTrustedResourceUrl(), control.getDomHelper());
  flash.addFlashVars(model.getPlayer().getVars());
  flash.render(div);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.media.FlickrSet.prototype.getCssClass = function() {
  return goog.ui.media.FlickrSet.CSS_CLASS;
};



/**
 * The {@code goog.ui.media.FlickrAlbum} media data model. It stores a required
 * {@code userId} and {@code setId} fields, sets the flickr Set URL, and
 * allows a few optional parameters.
 *
 * @param {string} userId The flickr userId associated with this set.
 * @param {string} setId The flickr setId associated with this set.
 * @param {string=} opt_caption An optional caption of the flickr set.
 * @param {string=} opt_description An optional description of the flickr set.
 * @constructor
 * @extends {goog.ui.media.MediaModel}
 * @final
 */
goog.ui.media.FlickrSetModel = function(
    userId, setId, opt_caption, opt_description) {
  goog.ui.media.MediaModel.call(
      this, goog.ui.media.FlickrSetModel.buildUrl(userId, setId), opt_caption,
      opt_description, goog.ui.media.MediaModel.MimeType.FLASH);

  /**
   * The Flickr user id.
   * @type {string}
   * @private
   */
  this.userId_ = userId;

  /**
   * The Flickr set id.
   * @type {string}
   * @private
   */
  this.setId_ = setId;

  var flashVars = {
    'offsite': 'true',
    'lang': 'en',
    'page_show_url': '/photos/' + userId + '/sets/' + setId + '/show/',
    'page_show_back_url': '/photos/' + userId + '/sets/' + setId,
    'set_id': setId
  };

  var player = new goog.ui.media.MediaModel.Player(
      goog.ui.media.FlickrSet.flashUrl_, flashVars);

  this.setPlayer(player);
};
goog.inherits(goog.ui.media.FlickrSetModel, goog.ui.media.MediaModel);


/**
 * Regular expression used to extract the username and set id out of the flickr
 * URLs.
 *
 * Copied from http://go/markdownlite.js and {@link FlickrExtractor.xml}.
 *
 * @type {RegExp}
 * @private
 * @const
 */
goog.ui.media.FlickrSetModel.MATCHER_ =
    /(?:http:\/\/)?(?:www\.)?flickr\.com\/(?:photos\/([\d\w@\-]+)\/sets\/(\d+))\/?/i;


/**
 * Takes a {@code flickrSetUrl} and extracts the flickr username and set id.
 *
 * @param {string} flickrSetUrl A Flickr set URL.
 * @param {string=} opt_caption An optional caption of the flickr set.
 * @param {string=} opt_description An optional description of the flickr set.
 * @return {!goog.ui.media.FlickrSetModel} The data model that represents the
 *     Flickr set.
 * @throws exception in case the parsing fails
 */
goog.ui.media.FlickrSetModel.newInstance = function(
    flickrSetUrl, opt_caption, opt_description) {
  if (goog.ui.media.FlickrSetModel.MATCHER_.test(flickrSetUrl)) {
    var data = goog.ui.media.FlickrSetModel.MATCHER_.exec(flickrSetUrl);
    return new goog.ui.media.FlickrSetModel(
        data[1], data[2], opt_caption, opt_description);
  }
  throw Error('failed to parse flickr url: ' + flickrSetUrl);
};


/**
 * Takes a flickr username and set id and returns an URL.
 *
 * @param {string} userId The owner of the set.
 * @param {string} setId The set id.
 * @return {string} The URL of the set.
 */
goog.ui.media.FlickrSetModel.buildUrl = function(userId, setId) {
  return 'http://flickr.com/photos/' + userId + '/sets/' + setId;
};


/**
 * Gets the Flickr user id.
 * @return {string} The Flickr user id.
 */
goog.ui.media.FlickrSetModel.prototype.getUserId = function() {
  return this.userId_;
};


/**
 * Gets the Flickr set id.
 * @return {string} The Flickr set id.
 */
goog.ui.media.FlickrSetModel.prototype.getSetId = function() {
  return this.setId_;
};
