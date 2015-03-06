// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An alternative imageless button renderer that uses CSS3 rather
 * than voodoo to render custom buttons with rounded corners and dimensionality
 * (via a subtle flat shadow on the bottom half of the button) without the use
 * of images.
 *
 * Based on the Custom Buttons 3.1 visual specification, see
 * http://go/custombuttons
 *
 * Tested and verified to work in Gecko 1.9.2+ and WebKit 528+.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/css3menubutton.html
 */

goog.provide('goog.ui.Css3MenuButtonRenderer');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.ui.registry');



/**
 * Custom renderer for {@link goog.ui.MenuButton}s. Css3 buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 *
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 * @final
 */
goog.ui.Css3MenuButtonRenderer = function() {
  goog.ui.MenuButtonRenderer.call(this);
};
goog.inherits(goog.ui.Css3MenuButtonRenderer, goog.ui.MenuButtonRenderer);


/**
 * The singleton instance of this renderer class.
 * @type {goog.ui.Css3MenuButtonRenderer?}
 * @private
 */
goog.ui.Css3MenuButtonRenderer.instance_ = null;
goog.addSingletonGetter(goog.ui.Css3MenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.Css3MenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-css3-button');


/** @override */
goog.ui.Css3MenuButtonRenderer.prototype.getContentElement = function(element) {
  if (element) {
    var captionElem = goog.dom.getElementsByTagNameAndClass(
        '*', goog.getCssName(this.getCssClass(), 'caption'), element)[0];
    return captionElem;
  }
  return null;
};


/**
 * Returns true if this renderer can decorate the element.  Overrides
 * {@link goog.ui.MenuButtonRenderer#canDecorate} by returning true if the
 * element is a DIV, false otherwise.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.Css3MenuButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.DIV;
};


/**
 * Takes a text caption or existing DOM structure, and returns the content
 * wrapped in a pseudo-rounded-corner box.  Creates the following DOM structure:
 *  <div class="goog-inline-block goog-css3-button goog-css3-menu-button">
 *    <div class="goog-css3-button-caption">Contents...</div>
 *    <div class="goog-css3-button-dropdown"></div>
 *  </div>
 *
 * Used by both {@link #createDom} and {@link #decorate}.  To be overridden
 * by subclasses.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to wrap
 *     in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Pseudo-rounded-corner box containing the content.
 * @override
 */
goog.ui.Css3MenuButtonRenderer.prototype.createButton = function(content, dom) {
  var baseClass = this.getCssClass();
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' ';
  return dom.createDom('div', inlineBlock,
      dom.createDom('div', [goog.getCssName(baseClass, 'caption'),
                            goog.getCssName('goog-inline-block')],
                    content),
      dom.createDom('div', [goog.getCssName(baseClass, 'dropdown'),
                            goog.getCssName('goog-inline-block')]));
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.Css3MenuButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.Css3MenuButtonRenderer.CSS_CLASS;
};


// Register a decorator factory function for goog.ui.Css3MenuButtonRenderer.
// Since we're using goog-css3-button as the base class in order to get the
// same styling as goog.ui.Css3ButtonRenderer, we need to be explicit about
// giving goog-css3-menu-button here.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-css3-menu-button'),
    function() {
      return new goog.ui.MenuButton(null, null,
          goog.ui.Css3MenuButtonRenderer.getInstance());
    });

