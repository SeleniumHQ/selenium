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
 * @fileoverview provides a reusable youtube UI component given a youtube data
 * model.
 *
 * goog.ui.media.Youtube is actually a {@link goog.ui.ControlRenderer}, a
 * stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.Youtube.getInstance} -, that knows how to render
 * youtube videos. It is designed to be used with a {@link goog.ui.Control},
 * which will actually control the media renderer and provide the
 * {@link goog.ui.Component} base. This design guarantees that all different
 * types of medias will behave alike but will look different.
 *
 * goog.ui.media.Youtube expects {@code goog.ui.media.YoutubeModel} on
 * {@code goog.ui.Control.getModel} as data models, and render a flash object
 * that will play that URL.
 *
 * Example of usage:
 *
 * <pre>
 *   var video = goog.ui.media.YoutubeModel.newInstance(
 *       'http://www.youtube.com/watch?v=ddl5f44spwQ');
 *   goog.ui.media.Youtube.newControl(video).render();
 * </pre>
 *
 * youtube medias currently support the following states:
 *
 * <ul>
 *   <li> {@link goog.ui.Component.State.DISABLED}: shows 'flash not available'
 *   <li> {@link goog.ui.Component.State.HOVER}: mouse cursor is over the video
 *   <li> {@link !goog.ui.Component.State.SELECTED}: a static thumbnail is shown
 *   <li> {@link goog.ui.Component.State.SELECTED}: video is playing
 * </ul>
 *
 * Which can be accessed by
 * <pre>
 *   youtube.setEnabled(true);
 *   youtube.setHighlighted(true);
 *   youtube.setSelected(true);
 * </pre>
 *
 * This package also provides a few static auxiliary methods, such as:
 *
 * <pre>
 * var videoId = goog.ui.media.Youtube.parseUrl(
 *     'http://www.youtube.com/watch?v=ddl5f44spwQ');
 * </pre>
 *
 *
 * @supported IE6, FF2+, Safari. Requires flash to actually work.
 *
 * TODO(user): test on other browsers
 */


goog.provide('goog.ui.media.Youtube');
goog.provide('goog.ui.media.YoutubeModel');

goog.require('goog.string');
goog.require('goog.ui.Component.Error');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaModel.Player');
goog.require('goog.ui.media.MediaModel.Thumbnail');
goog.require('goog.ui.media.MediaRenderer');



/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a Youtube specific media
 * renderer.
 *
 * This class knows how to parse youtube urls, and render the DOM structure
 * of youtube video players and previews. This class is meant to be used as a
 * singleton static stateless class, that takes {@code goog.ui.media.Media}
 * instances and renders it. It expects {@code goog.ui.media.Media.getModel} to
 * return a well formed, previously constructed, youtube video id, which is the
 * data model this renderer will use to construct the DOM structure.
 * {@see goog.ui.media.Youtube.newControl} for a example of constructing a
 * control with this renderer.
 *
 * goog.ui.media.Youtube currently supports all {@link goog.ui.Component.State}.
 * It will change its DOM structure between SELECTED and !SELECTED, and rely on
 * CSS definitions on the others. On !SELECTED, the renderer will render a
 * youtube static <img>, with a thumbnail of the video. On SELECTED, the
 * renderer will append to the DOM a flash object, that contains the youtube
 * video.
 *
 * This design is patterned after http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 */
goog.ui.media.Youtube = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.Youtube, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.Youtube);


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a youtube model. It sets it as the data model goog.ui.media.Youtube renderer
 * uses, sets the states supported by the renderer, and returns a Control that
 * binds everything together. This is what you should be using for constructing
 * Youtube videos, except if you need finer control over the configuration.
 *
 * @param {goog.ui.media.YoutubeModel} youtubeModel The youtube data model.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {goog.ui.media.Media} A Control binded to the youtube renderer.
 */
goog.ui.media.Youtube.newControl = function(youtubeModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      youtubeModel,
      goog.ui.media.Youtube.getInstance(),
      opt_domHelper);
  control.setStateInternal(goog.ui.Component.State.ACTIVE);
  return control;
};


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.media.Youtube.CSS_CLASS = goog.getCssName('goog-ui-media-youtube');


/**
 * Changes the state of a {@code control}. Currently only changes the DOM
 * structure when the youtube movie is SELECTED (by default fired by a MOUSEUP
 * on the thumbnail), which means we have to embed the youtube flash video and
 * play it.
 *
 * @param {goog.ui.media.Media} control The media control.
 * @param {goog.ui.Component.State} state The state to be set or cleared.
 * @param {boolean} enable Whether the state is enabled or disabled.
 */
goog.ui.media.Youtube.prototype.setState = function(control, state, enable) {
  goog.ui.media.Youtube.superClass_.setState.call(this, control, state, enable);

  // control.createDom has to be called before any state is set.
  // Use control.setStateInternal if you need to set states
  if (!control.getElement()) {
    throw Error(goog.ui.Component.Error.STATE_INVALID);
  }

  var domHelper = control.getDomHelper();
  var dataModel =
      /** @type {goog.ui.media.YoutubeModel} */ (control.getDataModel());

  if (!!(state & goog.ui.Component.State.SELECTED) && enable) {
    var flashEls = domHelper.getElementsByTagNameAndClass(
        'div',
        goog.ui.media.FlashObject.CSS_CLASS,
        control.getElement());
    if (flashEls.length > 0) {
      return;
    }
    var youtubeFlash = new goog.ui.media.FlashObject(
        dataModel.getPlayer().getUrl() || '',
        domHelper);
    control.addChild(youtubeFlash, true);
  }
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 *
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.media.Youtube.prototype.getCssClass = function() {
  return goog.ui.media.Youtube.CSS_CLASS;
};



/**
 * The {@code goog.ui.media.Youtube} media data model. It stores a required
 * {@code videoId} field, sets the youtube URL, and allows a few optional
 * parameters.
 *
 * @param {string} videoId The youtube video id.
 * @param {string=} opt_caption An optional caption of the youtube video.
 * @param {string=} opt_description An optional description of the youtube
 *     video.
 * @constructor
 * @extends {goog.ui.media.MediaModel}
 */
goog.ui.media.YoutubeModel = function(videoId, opt_caption, opt_description) {
  goog.ui.media.MediaModel.call(
      this,
      goog.ui.media.YoutubeModel.buildUrl(videoId),
      opt_caption,
      opt_description,
      goog.ui.media.MediaModel.MimeType.FLASH);

  /**
   * The Youtube video id.
   * @type {string}
   * @private
   */
  this.videoId_ = videoId;

  this.setThumbnails([new goog.ui.media.MediaModel.Thumbnail(
      goog.ui.media.YoutubeModel.getThumbnailUrl(videoId))]);

  this.setPlayer(new goog.ui.media.MediaModel.Player(
      this.getFlashUrl(videoId, true)));
};
goog.inherits(goog.ui.media.YoutubeModel, goog.ui.media.MediaModel);


/**
 * A youtube regular expression matcher. It matches the VIDEOID of URLs like
 * http://www.youtube.com/watch?v=VIDEOID. Based on:
 * googledata/contentonebox/opencob/specs/common/YTPublicExtractorCard.xml
 * @type {RegExp}
 * @private
 * @const
 */
goog.ui.media.YoutubeModel.MATCHER_ = new RegExp(
    // Lead in.
    'http://(?:[a-zA_Z]{2,3}.)?' +
    // Watch URL prefix.  This should handle new URLs of the form:
    // http://www.youtube.com/watch#!v=jqxENMKaeCU&feature=related
    // where the parameters appear after "#!" instead of "?".
    '(?:youtube\.com/watch)' +
    // Get the video id:
    // The video ID is a parameter v=[videoid] either right after the "?"
    // or after some other parameters.
    '(?:\\?(?:[\\w\-\=]+&(?:amp;)?)*v=([\\w\-]+)' +
    '(?:&(?:amp;)?[\\w\-\=]+)*)?' +
    // Get any extra arguments in the URL's hash part.
    '(?:#[!]?(?:' +
    // Video ID from the v=[videoid] parameter, optionally surrounded by other
    // & separated parameters.
    '(?:(?:[\\w\-\=]+&(?:amp;)?)*(?:v=([\\w\-]+))' +
    '(?:&(?:amp;)?[\\w\-\=]+)*)' +
    '|' +
    // Continue supporting "?" for the video ID
    // and "#" for other hash parameters.
    '(?:[\\w\-\=&]+)' +
    '))?' +
    // Should terminate with a word break or a /.
    '(?:/|\\b)', 'i');


/**
 * A auxiliary static method that parses a youtube URL, extracting the ID of the
 * video, and builds a YoutubeModel.
 *
 * @param {string} youtubeUrl A youtube URL.
 * @param {string=} opt_caption An optional caption of the youtube video.
 * @param {string=} opt_description An optional description of the youtube
 *     video.
 * @return {goog.ui.media.YoutubeModel} The data model that represents the
 *     youtube URL.
 * @see goog.ui.media.YoutubeModel.getVideoId()
 * @throws Error in case the parsing fails.
 */
goog.ui.media.YoutubeModel.newInstance = function(youtubeUrl,
                                                  opt_caption,
                                                  opt_description) {
  var extract = goog.ui.media.YoutubeModel.MATCHER_.exec(youtubeUrl);
  if (extract) {
    var videoId = extract[1] || extract[2];
    return new goog.ui.media.YoutubeModel(
        videoId, opt_caption, opt_description);
  }

  throw Error('failed to parse video id from youtube url: ' + youtubeUrl);
};


/**
 * The opposite of {@code goog.ui.media.Youtube.newInstance}: it takes a videoId
 * and returns a youtube URL.
 *
 * @param {string} videoId The youtube video ID.
 * @return {string} The youtube URL.
 */
goog.ui.media.YoutubeModel.buildUrl = function(videoId) {
  return 'http://www.youtube.com/watch?v=' + goog.string.urlEncode(videoId);
};


/**
 * A static auxiliary method that builds a static image URL with a preview of
 * the youtube video.
 *
 * NOTE(user): patterned after Gmail's gadgets/youtube,
 *
 * TODO(user): how do I specify the width/height of the resulting image on the
 * url ? is there an official API for http://ytimg.com ?
 *
 * @param {string} youtubeId The youtube video ID.
 * @return {string} An URL that contains an image with a preview of the youtube
 *     movie.
 */
goog.ui.media.YoutubeModel.getThumbnailUrl = function(youtubeId) {
  return 'http://i.ytimg.com/vi/' + youtubeId + '/default.jpg';
};


/**
 * An auxiliary method that builds URL of the flash movie to be embedded,
 * out of the youtube video id.
 *
 * @param {string} videoId The youtube video ID.
 * @param {boolean=} opt_autoplay Whether the flash movie should start playing
 *     as soon as it is shown, or if it should show a 'play' button.
 * @return {string} The flash URL to be embedded on the page.
 */
goog.ui.media.YoutubeModel.prototype.getFlashUrl = function(videoId,
                                                            opt_autoplay) {
  var autoplay = opt_autoplay ? '&autoplay=1' : '';
  // YouTube video ids are extracted from youtube URLs, which are user
  // generated input. the video id is later used to embed a flash object,
  // which is generated through HTML construction. We goog.string.urlEncode
  // the video id to make sure the URL is safe to be embedded.
  return 'http://www.youtube.com/v/' + goog.string.urlEncode(videoId) +
      '&hl=en&fs=1' + autoplay;
};


/**
 * Gets the Youtube video id.
 * @return {string} The Youtube video id.
 */
goog.ui.media.YoutubeModel.prototype.getVideoId = function() {
  return this.videoId_;
};
