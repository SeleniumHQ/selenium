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
 * @fileoverview provides a reusable Vimeo video UI component given a public
 * Vimeo video URL.
 *
 * goog.ui.media.Vimeo is actually a {@link goog.ui.ControlRenderer}, a
 * stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.Vimeo.getInstance} -, that knows how to render
 * video videos. It is designed to be used with a {@link goog.ui.Control},
 * which will actually control the media renderer and provide the
 * {@link goog.ui.Component} base. This design guarantees that all different
 * types of medias will behave alike but will look different.
 *
 * goog.ui.media.Vimeo expects vimeo video IDs on
 * {@code goog.ui.Control.getModel} as data models, and renders a flash object
 * that will show the contents of that video.
 *
 * Example of usage:
 *
 * <pre>
 *   var video = goog.ui.media.VimeoModel.newInstance('http://vimeo.com/30012');
 *   goog.ui.media.Vimeo.newControl(video).render();
 * </pre>
 *
 * Vimeo medias currently support the following states:
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
 * TODO(user): test on other browsers
 */

goog.provide('goog.ui.media.Vimeo');
goog.provide('goog.ui.media.VimeoModel');

goog.require('goog.string');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaModel.Player');
goog.require('goog.ui.media.MediaRenderer');



/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a Vimeo specific media
 * renderer.
 *
 * This class knows how to parse Vimeo URLs, and render the DOM structure
 * of vimeo video players. This class is meant to be used as a singleton static
 * stateless class, that takes {@code goog.ui.media.Media} instances and renders
 * it. It expects {@code goog.ui.media.Media.getModel} to return a well formed,
 * previously constructed, vimeoId {@see goog.ui.media.Vimeo.parseUrl}, which is
 * the data model this renderer will use to construct the DOM structure.
 * {@see goog.ui.media.Vimeo.newControl} for a example of constructing a control
 * with this renderer.
 *
 * This design is patterned after http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 */
goog.ui.media.Vimeo = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.Vimeo, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.Vimeo);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.Vimeo.CSS_CLASS = goog.getCssName('goog-ui-media-vimeo');


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a Vimeo URL. It extracts the videoId information on the URL, sets it
 * as the data model goog.ui.media.Vimeo renderer uses, sets the states
 * supported by the renderer, and returns a Control that binds everything
 * together. This is what you should be using for constructing Vimeo videos,
 * except if you need more fine control over the configuration.
 *
 * @param {goog.ui.media.VimeoModel} dataModel A vimeo video URL.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {goog.ui.media.Media} A Control binded to the Vimeo renderer.
 */
goog.ui.media.Vimeo.newControl = function(dataModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      dataModel, goog.ui.media.Vimeo.getInstance(), opt_domHelper);
  // vimeo videos don't have any thumbnail for now, so we show the
  // "selected" version of the UI at the start, which is the
  // flash player.
  control.setSelected(true);
  return control;
};


/**
 * Creates the initial DOM structure of the vimeo video, which is basically a
 * the flash object pointing to a vimeo video player.
 *
 * @param {goog.ui.Control} c The media control.
 * @return {Element} The DOM structure that represents this control.
 * @override
 */
goog.ui.media.Vimeo.prototype.createDom = function(c) {
  var control = /** @type {goog.ui.media.Media} */ (c);
  var div = goog.ui.media.Vimeo.superClass_.createDom.call(this, control);

  var dataModel =
      /** @type {goog.ui.media.VimeoModel} */ (control.getDataModel());

  var flash = new goog.ui.media.FlashObject(
      dataModel.getPlayer().getUrl() || '',
      control.getDomHelper());
  flash.render(div);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.media.Vimeo.prototype.getCssClass = function() {
  return goog.ui.media.Vimeo.CSS_CLASS;
};



/**
 * The {@code goog.ui.media.Vimeo} media data model. It stores a required
 * {@code videoId} field, sets the vimeo URL, and allows a few optional
 * parameters.
 *
 * @param {string} videoId The vimeo video id.
 * @param {string=} opt_caption An optional caption of the vimeo video.
 * @param {string=} opt_description An optional description of the vimeo video.
 * @param {boolean=} opt_autoplay Whether to autoplay video.
 * @constructor
 * @extends {goog.ui.media.MediaModel}
 */
goog.ui.media.VimeoModel = function(videoId, opt_caption, opt_description,
                                    opt_autoplay) {
  goog.ui.media.MediaModel.call(
      this,
      goog.ui.media.VimeoModel.buildUrl(videoId),
      opt_caption,
      opt_description,
      goog.ui.media.MediaModel.MimeType.FLASH);

  /**
   * The Vimeo video id.
   * @type {string}
   * @private
   */
  this.videoId_ = videoId;

  this.setPlayer(new goog.ui.media.MediaModel.Player(
      goog.ui.media.VimeoModel.buildFlashUrl(videoId, opt_autoplay)));
};
goog.inherits(goog.ui.media.VimeoModel, goog.ui.media.MediaModel);


/**
 * Regular expression used to extract the vimeo video id out of vimeo URLs.
 *
 * Copied from http://go/markdownlite.js
 *
 * TODO(user): add support to https.
 *
 * @type {RegExp}
 * @private
 * @const
 */
goog.ui.media.VimeoModel.MATCHER_ =
    /https?:\/\/(?:www\.)?vimeo\.com\/(?:hd#)?([0-9]+)/i;


/**
 * Takes a {@code vimeoUrl} and extracts the video id.
 *
 * @param {string} vimeoUrl A vimeo video URL.
 * @param {string=} opt_caption An optional caption of the vimeo video.
 * @param {string=} opt_description An optional description of the vimeo video.
 * @param {boolean=} opt_autoplay Whether to autoplay video.
 * @return {goog.ui.media.VimeoModel} The vimeo data model that represents this
 *     URL.
 * @throws exception in case the parsing fails
 */
goog.ui.media.VimeoModel.newInstance = function(vimeoUrl,
                                                opt_caption,
                                                opt_description,
                                                opt_autoplay) {
  if (goog.ui.media.VimeoModel.MATCHER_.test(vimeoUrl)) {
    var data = goog.ui.media.VimeoModel.MATCHER_.exec(vimeoUrl);
    return new goog.ui.media.VimeoModel(
        data[1], opt_caption, opt_description, opt_autoplay);
  }
  throw Error('failed to parse vimeo url: ' + vimeoUrl);
};


/**
 * The opposite of {@code goog.ui.media.Vimeo.parseUrl}: it takes a videoId
 * and returns a vimeo URL.
 *
 * @param {string} videoId The vimeo video ID.
 * @return {string} The vimeo URL.
 */
goog.ui.media.VimeoModel.buildUrl = function(videoId) {
  return 'http://vimeo.com/' + goog.string.urlEncode(videoId);
};


/**
 * Builds a flash url from the vimeo {@code videoId}.
 *
 * @param {string} videoId The vimeo video ID.
 * @param {boolean=} opt_autoplay Whether the flash movie should start playing
 *     as soon as it is shown, or if it should show a 'play' button.
 * @return {string} The vimeo flash URL.
 */
goog.ui.media.VimeoModel.buildFlashUrl = function(videoId, opt_autoplay) {
  var autoplay = opt_autoplay ? '&autoplay=1' : '';
  return 'http://vimeo.com/moogaloop.swf?clip_id=' +
      goog.string.urlEncode(videoId) +
      '&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0color=&' +
      'fullscreen=1' + autoplay;
};


/**
 * Gets the Vimeo video id.
 * @return {string} The Vimeo video id.
 */
goog.ui.media.VimeoModel.prototype.getVideoId = function() {
  return this.videoId_;
};

