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
 * @fileoverview provides a reusable mp3 UI component given a mp3 URL.
 *
 * goog.ui.media.Mp3 is actually a {@link goog.ui.ControlRenderer}, a stateless
 * class - that could/should be used as a Singleton with the static method
 * {@code goog.ui.media.Mp3.getInstance} -, that knows how to render Mp3s. It is
 * designed to be used with a {@link goog.ui.Control}, which will actually
 * control the media renderer and provide the {@link goog.ui.Component} base.
 * This design guarantees that all different types of medias will behave alike
 * but will look different.
 *
 * goog.ui.media.Mp3 expects mp3 urls on {@code goog.ui.Control.getModel} as
 * data models, and render a flash object that will play that URL.
 *
 * Example of usage:
 *
 * <pre>
 *   goog.ui.media.Mp3.newControl('http://hostname/file.mp3').render();
 * </pre>
 *
 * Mp3 medias currently support the following states:
 *
 * <ul>
 *   <li> {@link goog.ui.Component.State.DISABLED}: shows 'flash not available'
 *   <li> {@link goog.ui.Component.State.HOVER}: mouse cursor is over the mp3
 *   <li> {@link goog.ui.Component.State.SELECTED}: mp3 is playing
 * </ul>
 *
 * Which can be accessed by
 *
 * <pre>
 *   mp3.setEnabled(true);
 *   mp3.setHighlighted(true);
 *   mp3.setSelected(true);
 * </pre>
 *
*
 *
 * @supported IE6, FF2+, Safari. Requires flash to actually work.
 *
 * TODO(user): test on other browsers
 */

goog.provide('goog.ui.media.Mp3');

goog.require('goog.string');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaRenderer');


/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a Mp3 specific media
 * renderer.
 *
 * This class knows how to parse mp3 URLs, and render the DOM structure
 * of mp3 flash players. This class is meant to be used as a singleton static
 * stateless class, that takes {@code goog.ui.media.Media} instances and renders
 * it. It expects {@code goog.ui.media.Media.getModel} to return a well formed,
 * previously checked, mp3 URL {@see goog.ui.media.PicasaAlbum.parseUrl},
 * which is the data model this renderer will use to construct the DOM
 * structure. {@see goog.ui.media.PicasaAlbum.newControl} for an example of
 * constructing a control with this renderer.
 *
 * This design is patterned after http://go/closure_control_subclassing
 *
 * It uses {@link goog.ui.media.FlashObject} to embed the flash object.
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 */
goog.ui.media.Mp3 = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.Mp3, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.Mp3);


/**
 * Flash player arguments. We expect that {@code flashUrl_} will contain a flash
 * movie that takes an audioUrl parameter on its URL, containing the URL of the
 * mp3 to be played.
 *
 * @type {string}
 * @private
 */
goog.ui.media.Mp3.PLAYER_ARGUMENTS_ = 'audioUrl=%s';


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.Mp3.CSS_CLASS = goog.getCssName('goog-ui-media-mp3');


/**
 * Flash player URL. Uses Google Reader's mp3 flash player by default.
 *
 * @type {string}
 * @private
 */
goog.ui.media.Mp3.flashUrl_ =
    'http://www.google.com/reader/ui/3247397568-audio-player.swf';


/**
 * Regular expression to check if a given URL is a valid mp3 URL.
 *
 * Copied from http://go/markdownlite.js.

 *
 * NOTE(user): although it would be easier to use goog.string.endsWith('.mp3'),
 * in the future, we want to provide media inlining, which is basically getting
 * a text and replacing all mp3 references with an mp3 player, so it makes sense
 * to share the same regular expression to match everything.
 *
 * @type {RegExp}
 */
goog.ui.media.Mp3.MATCHER =
    /(https?:\/\/[a-zA-Z0-9-_%&\/.=:#\+~\(\)]+\.(mp3)+(\?[a-zA-Z0-9-_%&\/.=:#\+~\(\)]+)?)/i;


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a mp3 URL. It checks the mp3 URL, sets it as the data model
 * goog.ui.media.Mp3 renderer uses, sets the states supported by the renderer,
 * and returns a Control that binds everything together. This is what you
 * should be using for constructing Mp3 videos, except if you need more fine
 * control over the configuration.
 *
 * @param {goog.ui.media.MediaModel} dataModel A media model that must contain
 *     an mp3 url on {@code dataModel.getUrl}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {goog.ui.media.Media} A goog.ui.Control subclass with the mp3
 *     renderer.
 */
goog.ui.media.Mp3.newControl = function(dataModel, opt_domHelper) {
  var control = new goog.ui.media.Media(
      dataModel,
      goog.ui.media.Mp3.getInstance(),
      opt_domHelper);
  // mp3 ui doesn't have a non selected view: it shows the mp3 player by
  // default.
  control.setSelected(true);
  return control;
};


/**
 * A static method that sets which flash URL this class should use. Use this if
 * you want to host your own flash mp3 player.
 *
 * @param {string} flashUrl The URL of the flash mp3 player.
 */
goog.ui.media.Mp3.setFlashUrl = function(flashUrl) {
  goog.ui.media.Mp3.flashUrl_ = flashUrl;
};


/**
 * A static method that builds a URL that will contain the flash player that
 * will play the {@code mp3Url}.
 *
 * @param {string} mp3Url The URL of the mp3 music.
 * @return {string} An URL of a flash player that will know how to play the
 *     given {@code mp3Url}.
 */
goog.ui.media.Mp3.buildFlashUrl = function(mp3Url) {
  var flashUrl = goog.ui.media.Mp3.flashUrl_ + '?' + goog.string.subs(
      goog.ui.media.Mp3.PLAYER_ARGUMENTS_,
      goog.string.urlEncode(mp3Url));
  return flashUrl;
};


/**
 * Creates the initial DOM structure of a mp3 video, which is basically a
 * the flash object pointing to a flash mp3 player.
 *
 * @param {goog.ui.media.Media} control The media control.
 * @return {Element} A DOM structure that represents the control.
 */
goog.ui.media.Mp3.prototype.createDom = function(control) {
  var div = goog.ui.media.Mp3.superClass_.createDom.call(this, control);

  var dataModel =
      /** @type {goog.ui.media.MediaModel} */ (control.getDataModel());
  var flashUrl = goog.ui.media.Mp3.flashUrl_ + '?' + goog.string.subs(
      goog.ui.media.Mp3.PLAYER_ARGUMENTS_,
      goog.string.urlEncode(dataModel.getUrl()));
  var flash = new goog.ui.media.FlashObject(
      dataModel.getPlayer().getUrl(), control.getDomHelper());
  flash.setFlashVars('playerMode', 'embedded');
  flash.render(div);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.media.Mp3.prototype.getCssClass = function() {
  return goog.ui.media.Mp3.CSS_CLASS;
};
