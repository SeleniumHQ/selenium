// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview provides a reusable GoogleVideo UI component given a public
 * GoogleVideo video URL.
 *
 * goog.ui.media.GoogleVideo is actually a {@link goog.ui.ControlRenderer}, a
 * stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.GoogleVideo.getInstance} -, that knows how to
 * render GoogleVideo videos. It is designed to be used with a
 * {@link goog.ui.Control}, which will actually control the media renderer and
 * provide the {@link goog.ui.Component} base. This design guarantees that all
 * different types of medias will behave alike but will look different.
 *
 * goog.ui.media.GoogleVideo expects {@code goog.ui.media.GoogleVideoModel} on
 * {@code goog.ui.Control.getModel} as data models, and renders a flash object
 * that will show the contents of that video.
 *
 * Example of usage:
 *
 * <pre>
 *   var video = goog.ui.media.GoogleVideoModel.newInstance(
 *       'http://video.google.com/videoplay?docid=6698933542780842398');
 *   goog.ui.media.GoogleVideo.newControl(video).render();
 * </pre>
 *
 * GoogleVideo medias currently support the following states:
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
 * @supported IE6+, FF2+, Chrome, Safari. Requires flash to actually work.
 */


goog.provide('goog.ui.media.GoogleVideo');
goog.provide('goog.ui.media.GoogleVideoModel');

goog.require('goog.string');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaModel.Player');
goog.require('goog.ui.media.MediaRenderer');



/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a GoogleVideo specific
 * media renderer.
 *
 * This class knows how to parse GoogleVideo URLs, and render the DOM structure
 * of GoogleVideo video players. This class is meant to be used as a singleton
 * static stateless class, that takes {@code goog.ui.media.Media} instances and
 * renders it. It expects {@code goog.ui.media.Media.getModel} to return a well
 * formed, previously constructed, GoogleVideo video id, which is the data model
 * this renderer will use to construct the DOM structure.
 * {@see goog.ui.media.GoogleVideo.newControl} for a example of constructing a
 * control with this renderer.
 *
 * This design is patterned after http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 */
goog.ui.media.GoogleVideo = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.GoogleVideo, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.GoogleVideo);


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a GoogleVideo model. It sets it as the data model goog.ui.media.GoogleVideo
 * renderer uses, sets the states supported by the renderer, and returns a
 * Control that binds everything together. This is what you should be using for
 * constructing GoogleVideo videos, except if you need finer control over the
 * configuration.
 *
 * @param {goog.ui.media.GoogleVideoModel} dataModel The GoogleVideo data model.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {goog.ui.media.Media} A Control binded to the GoogleVideo renderer.
 */
goog.ui.media.GoogleVideo.newControl = function(dataModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      dataModel,
      goog.ui.media.GoogleVideo.getInstance(),
      opt_domHelper);
  // GoogleVideo videos don't have any thumbnail for now, so we show the
  // "selected" version of the UI at the start, which is the flash player.
  control.setSelected(true);
  return control;
};


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.GoogleVideo.CSS_CLASS =
    goog.getCssName('goog-ui-media-googlevideo');


/**
 * Creates the initial DOM structure of the GoogleVideo video, which is
 * basically a the flash object pointing to a GoogleVideo video player.
 *
 * @param {goog.ui.Control} c The media control.
 * @return {Element} The DOM structure that represents this control.
 * @override
 */
goog.ui.media.GoogleVideo.prototype.createDom = function(c) {
  var control = /** @type {goog.ui.media.Media} */ (c);
  var div = goog.base(this, 'createDom', control);

  var dataModel =
      /** @type {goog.ui.media.GoogleVideoModel} */ (control.getDataModel());

  var flash = new goog.ui.media.FlashObject(
      dataModel.getPlayer().getUrl() || '',
      control.getDomHelper());
  flash.render(div);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 *
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.media.GoogleVideo.prototype.getCssClass = function() {
  return goog.ui.media.GoogleVideo.CSS_CLASS;
};



/**
 * The {@code goog.ui.media.GoogleVideo} media data model. It stores a required
 * {@code videoId} field, sets the GoogleVideo URL, and allows a few optional
 * parameters.
 *
 * @param {string} videoId The GoogleVideo video id.
 * @param {string=} opt_caption An optional caption of the GoogleVideo video.
 * @param {string=} opt_description An optional description of the GoogleVideo
 *     video.
 * @param {boolean=} opt_autoplay Whether to autoplay video.
 * @constructor
 * @extends {goog.ui.media.MediaModel}
 */
goog.ui.media.GoogleVideoModel = function(videoId, opt_caption, opt_description,
                                          opt_autoplay) {
  goog.ui.media.MediaModel.call(
      this,
      goog.ui.media.GoogleVideoModel.buildUrl(videoId),
      opt_caption,
      opt_description,
      goog.ui.media.MediaModel.MimeType.FLASH);

  /**
   * The GoogleVideo video id.
   * @type {string}
   * @private
   */
  this.videoId_ = videoId;

  this.setPlayer(new goog.ui.media.MediaModel.Player(
      goog.ui.media.GoogleVideoModel.buildFlashUrl(videoId, opt_autoplay)));
};
goog.inherits(goog.ui.media.GoogleVideoModel, goog.ui.media.MediaModel);


/**
 * Regular expression used to extract the GoogleVideo video id (docid) out of
 * GoogleVideo URLs.
 *
 * @type {RegExp}
 * @private
 * @const
 */
goog.ui.media.GoogleVideoModel.MATCHER_ =
    /^http:\/\/(?:www\.)?video\.google\.com\/videoplay.*[\?#]docid=(-?[0-9]+)#?$/i;


/**
 * A auxiliary static method that parses a GoogleVideo URL, extracting the ID of
 * the video, and builds a GoogleVideoModel.
 *
 * @param {string} googleVideoUrl A GoogleVideo video URL.
 * @param {string=} opt_caption An optional caption of the GoogleVideo video.
 * @param {string=} opt_description An optional description of the GoogleVideo
 *     video.
 * @param {boolean=} opt_autoplay Whether to autoplay video.
 * @return {goog.ui.media.GoogleVideoModel} The data model that represents the
 *     GoogleVideo URL.
 * @see goog.ui.media.GoogleVideoModel.getVideoId()
 * @throws Error in case the parsing fails.
 */
goog.ui.media.GoogleVideoModel.newInstance = function(googleVideoUrl,
                                                      opt_caption,
                                                      opt_description,
                                                      opt_autoplay) {
  if (goog.ui.media.GoogleVideoModel.MATCHER_.test(googleVideoUrl)) {
    var data = goog.ui.media.GoogleVideoModel.MATCHER_.exec(googleVideoUrl);
    return new goog.ui.media.GoogleVideoModel(
        data[1], opt_caption, opt_description, opt_autoplay);
  }

  throw Error('failed to parse video id from GoogleVideo url: ' +
      googleVideoUrl);
};


/**
 * The opposite of {@code goog.ui.media.GoogleVideo.newInstance}: it takes a
 * videoId and returns a GoogleVideo URL.
 *
 * @param {string} videoId The GoogleVideo video ID.
 * @return {string} The GoogleVideo URL.
 */
goog.ui.media.GoogleVideoModel.buildUrl = function(videoId) {
  return 'http://video.google.com/videoplay?docid=' +
      goog.string.urlEncode(videoId);
};


/**
 * An auxiliary method that builds URL of the flash movie to be embedded,
 * out of the GoogleVideo video id.
 *
 * @param {string} videoId The GoogleVideo video ID.
 * @param {boolean=} opt_autoplay Whether the flash movie should start playing
 *     as soon as it is shown, or if it should show a 'play' button.
 * @return {string} The flash URL to be embedded on the page.
 */
goog.ui.media.GoogleVideoModel.buildFlashUrl = function(videoId, opt_autoplay) {
  var autoplay = opt_autoplay ? '&autoplay=1' : '';
  return 'http://video.google.com/googleplayer.swf?docid=' +
      goog.string.urlEncode(videoId) +
      '&hl=en&fs=true' + autoplay;
};


/**
 * Gets the GoogleVideo video id.
 * @return {string} The GoogleVideo video id.
 */
goog.ui.media.GoogleVideoModel.prototype.getVideoId = function() {
  return this.videoId_;
};
