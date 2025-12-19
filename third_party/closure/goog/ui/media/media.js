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
 * @fileoverview Provides the base goog.ui.Control and goog.ui.ControlRenderer
 * for media types, as well as a media model consistent with the Yahoo Media RSS
 * specification {@link http://search.yahoo.com/mrss/}.
 *
 * The goog.ui.media.* package is basically a set of goog.ui.ControlRenderers
 * subclasses (such as goog.ui.media.Youtube, goog.ui.media.Picasa, etc) that
 * should all work with the same goog.ui.Control (goog.ui.media.Media) logic.
 *
 * This design guarantees that all different types of medias will behave alike
 * (in a base level) but will look different.
 *
 * In MVC terms, {@link goog.ui.media.Media} is the Controller,
 * {@link goog.ui.media.MediaRenderer} + CSS definitions are the View and
 * `goog.ui.media.MediaModel` is the data Model. Typically,
 * MediaRenderer will be subclassed to provide media specific renderers.
 * MediaRenderer subclasses are also responsible for defining the data model.
 *
 * This design is strongly patterned after:
 * http://go/closure_control_subclassing
 *
 * goog.ui.media.MediaRenderer handles the basic common ways to display media,
 * such as displaying tooltips, frames, minimize/maximize buttons, play buttons,
 * etc. Its subclasses are responsible for rendering media specific DOM
 * structures, like youtube flash players, picasa albums, etc.
 *
 * goog.ui.media.Media handles the Control of Medias, by listening to events
 * and firing the appropriate actions. It knows about the existence of captions,
 * minimize/maximize buttons, and takes all the actions needed to change states,
 * including delegating the UI actions to MediaRenderers.
 *
 * Although MediaRenderer is a base class designed to be subclassed, it can
 * be used by itself:
 *
 * <pre>
 *   var renderer = new goog.ui.media.MediaRenderer();
 *   var control = new goog.ui.media.Media('hello world', renderer);
 *   var control.render(goog.dom.getElement('mediaHolder'));
 * </pre>
 *
 * It requires a few CSS rules to be defined, which you should use to control
 * how the component is displayed. {@link goog.ui.ControlRenderer}s is very CSS
 * intensive, which separates the UI structure (the HTML DOM elements, which is
 * created by the `goog.ui.media.MediaRenderer`) from the UI view (which
 * nodes are visible, which aren't, where they are positioned. These are defined
 * on the CSS rules for each state). A few examples of CSS selectors that needs
 * to be defined are:
 *
 * <ul>
 *   <li>.goog-ui-media
 *   <li>.goog-ui-media-hover
 *   <li>.goog-ui-media-selected
 * </ul>
 *
 * If you want to have different custom renderers CSS namespaces (eg. you may
 * want to show a small thumbnail, or you may want to hide the caption, etc),
 * you can do so by using:
 *
 * <pre>
 *   var renderer = goog.ui.ControlRenderer.getCustomRenderer(
 *       goog.ui.media.MediaRenderer, 'my-custom-namespace');
 *   var media = new goog.ui.media.Media('', renderer);
 *   media.render(goog.dom.getElement('parent'));
 * </pre>
 *
 * Which will allow you to set your own .my-custom-namespace-hover,
 * .my-custom-namespace-selected CSS selectors.
 *
 * NOTE(user): it seems like an overkill to subclass goog.ui.Control instead of
 * using a factory, but we wanted to make sure we had more control over the
 * events for future media implementations. Since we intent to use it in many
 * different places, it makes sense to have a more flexible design that lets us
 * control the inner workings of goog.ui.Control.
 *
 * TODO(user): implement, as needed, the Media specific state changes UI, such
 * as minimize/maximize buttons, expand/close buttons, etc.
 */

goog.provide('goog.ui.media.Media');
goog.provide('goog.ui.media.MediaRenderer');

goog.forwardDeclare('goog.ui.media.MediaModel');
goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');



/**
 * Provides the control mechanism of media types.
 *
 * @param {goog.ui.media.MediaModel} dataModel The data model to be used by the
 *     renderer.
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 * @final
 */
goog.ui.media.Media = function(dataModel, opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, null, opt_renderer, opt_domHelper);

  // Sets up the data model.
  this.setDataModel(dataModel);
  this.setSupportedState(goog.ui.Component.State.OPENED, true);
  this.setSupportedState(goog.ui.Component.State.SELECTED, true);
  // TODO(user): had to do this to for mouseDownHandler not to
  // e.preventDefault(), because it was not allowing the event to reach the
  // flash player. figure out a better way to not e.preventDefault().
  this.setAllowTextSelection(true);

  // Media items don't use RTL styles, so avoid accessing computed styles to
  // figure out if the control is RTL.
  this.setRightToLeft(false);
};
goog.inherits(goog.ui.media.Media, goog.ui.Control);


/**
 * The media data model used on the renderer.
 *
 * @type {goog.ui.media.MediaModel}
 * @private
 */
goog.ui.media.Media.prototype.dataModel_;


/**
 * Sets the media model to be used on the renderer.
 * @param {goog.ui.media.MediaModel} dataModel The media model the renderer
 *     should use.
 */
goog.ui.media.Media.prototype.setDataModel = function(dataModel) {
  this.dataModel_ = dataModel;
};


/**
 * Gets the media model renderer is using.
 * @return {goog.ui.media.MediaModel} The media model being used.
 */
goog.ui.media.Media.prototype.getDataModel = function() {
  return this.dataModel_;
};



/**
 * Base class of all media renderers. Provides the common renderer functionality
 * of medias.
 *
 * The current common functionality shared by Medias is to have an outer frame
 * that gets highlighted on mouse hover.
 *
 * TODO(user): implement more common UI behavior, as needed.
 *
 * NOTE(user): I am not enjoying how the subclasses are changing their state
 * through setState() ... maybe provide abstract methods like
 * goog.ui.media.MediaRenderer.prototype.preview = goog.abstractMethod;
 * goog.ui.media.MediaRenderer.prototype.play = goog.abstractMethod;
 * goog.ui.media.MediaRenderer.prototype.minimize = goog.abstractMethod;
 * goog.ui.media.MediaRenderer.prototype.maximize = goog.abstractMethod;
 * and call them on this parent class setState ?
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.media.MediaRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.media.MediaRenderer, goog.ui.ControlRenderer);


/**
 * Builds the common DOM structure of medias. Builds an outer div, and appends
 * a child div with the `goog.ui.Control.getContent` content. Marks the
 * caption with a `this.getClassClass()` + '-caption' css flag, so that
 * specific renderers can hide/show the caption as desired.
 *
 * @param {goog.ui.Control} control The control instance.
 * @return {!Element} The DOM structure that represents control.
 * @override
 */
goog.ui.media.MediaRenderer.prototype.createDom = function(control) {
  goog.asserts.assertInstanceof(control, goog.ui.media.Media);
  var domHelper = control.getDomHelper();
  var div = domHelper.createElement(goog.dom.TagName.DIV);
  div.className = this.getClassNames(control).join(' ');

  var dataModel = control.getDataModel();

  // Only creates DOMs if the data is available.
  var dataCaption = dataModel.getCaption();
  if (dataCaption) {
    var caption = domHelper.createElement(goog.dom.TagName.DIV);
    caption.className = goog.getCssName(this.getCssClass(), 'caption');

    caption.appendChild(domHelper.createDom(
        goog.dom.TagName.P, goog.getCssName(this.getCssClass(), 'caption-text'),
        dataCaption));
    domHelper.appendChild(div, caption);
  }

  var dataDescription = dataModel.getDescription();
  if (dataDescription) {
    var description = domHelper.createElement(goog.dom.TagName.DIV);
    description.className = goog.getCssName(this.getCssClass(), 'description');
    description.appendChild(domHelper.createDom(
        goog.dom.TagName.P,
        goog.getCssName(this.getCssClass(), 'description-text'),
        dataDescription));
    domHelper.appendChild(div, description);
  }

  // Creates thumbnails of the media.
  var thumbnails = dataModel.getThumbnails() || [];
  for (var index = 0; index < thumbnails.length; index++) {
    var thumbnail = thumbnails[index];
    var thumbnailElement = domHelper.createElement(goog.dom.TagName.IMG);
    thumbnailElement.src = thumbnail.getUrl();
    thumbnailElement.className = this.getThumbnailCssName(index);

    // Check that the size is defined and that the size's height and width
    // are defined. Undefined height and width is deprecated but still
    // seems to exist in some cases.
    var size = thumbnail.getSize();

    if (size && size.height != null && size.width != null) {
      goog.style.setSize(thumbnailElement, size);
    }
    domHelper.appendChild(div, thumbnailElement);
  }

  if (dataModel.getPlayer()) {
    // if medias have players, allow UI for a play button.
    var playButton = domHelper.createElement(goog.dom.TagName.DIV);
    playButton.className = goog.getCssName(this.getCssClass(), 'playbutton');
    domHelper.appendChild(div, playButton);
  }

  control.setElementInternal(div);

  this.setState(
      control,
      /** @type {goog.ui.Component.State} */ (control.getState()), true);

  return div;
};


/**
 * Returns a renamable CSS class name for a numbered thumbnail. The default
 * implementation generates the class names goog-ui-media-thumbnail0,
 * goog-ui-media-thumbnail1, and the generic goog-ui-media-thumbnailn.
 * Subclasses can override this method when their media requires additional
 * specific class names (Applications are supposed to know how many thumbnails
 * media will have).
 *
 * @param {number} index The thumbnail index.
 * @return {string} CSS class name.
 * @protected
 */
goog.ui.media.MediaRenderer.prototype.getThumbnailCssName = function(index) {
  switch (index) {
    case 0:
      return goog.getCssName(this.getCssClass(), 'thumbnail0');
    case 1:
      return goog.getCssName(this.getCssClass(), 'thumbnail1');
    case 2:
      return goog.getCssName(this.getCssClass(), 'thumbnail2');
    case 3:
      return goog.getCssName(this.getCssClass(), 'thumbnail3');
    case 4:
      return goog.getCssName(this.getCssClass(), 'thumbnail4');
    default:
      return goog.getCssName(this.getCssClass(), 'thumbnailn');
  }
};
