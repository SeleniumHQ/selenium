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
 * @fileoverview provides a reusable photo UI component that renders photos that
 * contains metadata (such as captions, description, thumbnail/high resolution
 * versions, etc).
 *
 * goog.ui.media.Photo is actually a {@link goog.ui.ControlRenderer},
 * a stateless class - that could/should be used as a Singleton with the static
 * method {@code goog.ui.media.Photo.getInstance} -, that knows how to render
 * Photos. It is designed to be used with a {@link goog.ui.Control}, which will
 * actually control the media renderer and provide the {@link goog.ui.Component}
 * base. This design guarantees that all different types of medias will behave
 * alike but will look different.
 *
 * goog.ui.media.Photo expects {@code goog.ui.media.MediaModel} on
 * {@code goog.ui.Control.getModel} as data models.
 *
 * Example of usage:
 *
 * <pre>
 *   var photo = goog.ui.media.Photo.newControl(
 *       new goog.ui.media.MediaModel('http://hostname/file.jpg'));
 *   photo.render(goog.dom.getElement('parent'));
 * </pre>
 *
 * Photo medias currently support the following states:
 *
 * <ul>
 *   <li> {@link goog.ui.Component.State.HOVER}: mouse cursor is over the photo.
 *   <li> {@link goog.ui.Component.State.SELECTED}: photo is being displayed.
 * </ul>
 *
 * Which can be accessed by
 *
 * <pre>
 *   photo.setHighlighted(true);
 *   photo.setSelected(true);
 * </pre>
 *
*
 */

goog.provide('goog.ui.media.Photo');

goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaRenderer');


/**
 * Subclasses a goog.ui.media.MediaRenderer to provide a Photo specific media
 * renderer. Provides a base class for any other renderer that wants to display
 * photos.
 *
 * This class is meant to be used as a singleton static stateless class, that
 * takes {@code goog.ui.media.Media} instances and renders it.
 *
 * This design is patterned after
 * http://go/closure_control_subclassing
 *
 * @constructor
 * @extends {goog.ui.media.MediaRenderer}
 */
goog.ui.media.Photo = function() {
  goog.ui.media.MediaRenderer.call(this);
};
goog.inherits(goog.ui.media.Photo, goog.ui.media.MediaRenderer);
goog.addSingletonGetter(goog.ui.media.Photo);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
goog.ui.media.Photo.CSS_CLASS = goog.getCssName('goog-ui-media-photo');


/**
 * A static convenient method to construct a goog.ui.media.Media control out of
 * a photo {@code goog.ui.media.MediaModel}. It sets it as the data model
 * goog.ui.media.Photo renderer uses, sets the states supported by the renderer,
 * and returns a Control that binds everything together. This is what you
 * should be using for constructing Photos, except if you need finer control
 * over the configuration.
 *
 * @param {goog.ui.media.MediaModel} dataModel The photo data model.
 * @return {goog.ui.media.Media} A goog.ui.Control subclass with the photo
 *     renderer.
 */
goog.ui.media.Photo.newControl = function(dataModel) {
  var control = new goog.ui.media.Media(
      dataModel,
      goog.ui.media.Photo.getInstance());
  return control;
};


/**
 * Creates the initial DOM structure of a photo.
 *
 * @param {goog.ui.media.Media} control The media control.
 * @return {Element} A DOM structure that represents the control.
 */
goog.ui.media.Photo.prototype.createDom = function(control) {
  var div = goog.ui.media.Photo.superClass_.createDom.call(this, control);

  var img = control.getDomHelper().createDom('img', {
    src: control.getDataModel().getPlayer().getUrl(),
    className: goog.getCssName(this.getCssClass(), 'image')
  });

  div.appendChild(img);

  return div;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.media.Photo.prototype.getCssClass = function() {
  return goog.ui.media.Photo.CSS_CLASS;
};
