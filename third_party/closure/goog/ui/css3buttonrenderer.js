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
 * @author slightlyoff@google.com (Alex Russell)
 * @see ../demos/css3button.html
 */

goog.provide('goog.ui.Css3ButtonRenderer');

goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Button');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.Component');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.registry');



/**
 * Custom renderer for {@link goog.ui.Button}s. Css3 buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 *
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 * @final
 */
goog.ui.Css3ButtonRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.Css3ButtonRenderer, goog.ui.ButtonRenderer);


/**
 * The singleton instance of this renderer class.
 * @type {goog.ui.Css3ButtonRenderer?}
 * @private
 */
goog.ui.Css3ButtonRenderer.instance_ = null;
goog.addSingletonGetter(goog.ui.Css3ButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.Css3ButtonRenderer.CSS_CLASS = goog.getCssName('goog-css3-button');


/** @override */
goog.ui.Css3ButtonRenderer.prototype.getContentElement = function(element) {
  return /** @type {Element} */ (element);
};


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *    <div class="goog-inline-block goog-css3-button">
 *      Contents...
 *    </div>
 * Overrides {@link goog.ui.ButtonRenderer#createDom}.
 * @param {goog.ui.Control} control goog.ui.Button to render.
 * @return {!Element} Root element for the button.
 * @override
 */
goog.ui.Css3ButtonRenderer.prototype.createDom = function(control) {
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var attr = {
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' '),
    'title': button.getTooltip() || ''
  };
  return button.getDomHelper().createDom('div', attr, button.getContent());
};


/**
 * Returns true if this renderer can decorate the element.  Overrides
 * {@link goog.ui.ButtonRenderer#canDecorate} by returning true if the
 * element is a DIV, false otherwise.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.Css3ButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.DIV;
};


/** @override */
goog.ui.Css3ButtonRenderer.prototype.decorate = function(button, element) {
  goog.asserts.assert(element);
  goog.dom.classlist.addAll(element,
      [goog.ui.INLINE_BLOCK_CLASSNAME, this.getCssClass()]);
  return goog.ui.Css3ButtonRenderer.superClass_.decorate.call(this, button,
      element);
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.Css3ButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.Css3ButtonRenderer.CSS_CLASS;
};


// Register a decorator factory function for goog.ui.Css3ButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.Css3ButtonRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Button(null,
          goog.ui.Css3ButtonRenderer.getInstance());
    });


// Register a decorator factory function for toggle buttons using the
// goog.ui.Css3ButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-css3-toggle-button'),
    function() {
      var button = new goog.ui.Button(null,
          goog.ui.Css3ButtonRenderer.getInstance());
      button.setSupportedState(goog.ui.Component.State.CHECKED, true);
      return button;
    });
