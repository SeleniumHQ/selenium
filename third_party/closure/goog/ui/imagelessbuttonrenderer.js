// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An alternative custom button renderer that uses even more CSS
 * voodoo than the default implementation to render custom buttons with fake
 * rounded corners and dimensionality (via a subtle flat shadow on the bottom
 * half of the button) without the use of images.
 *
 * Based on the Custom Buttons 3.1 visual specification, see
 * http://go/custombuttons
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/imagelessbutton.html
 */

goog.provide('goog.ui.ImagelessButtonRenderer');

goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.registry');



/**
 * Custom renderer for {@link goog.ui.Button}s. Imageless buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 *
 * @deprecated These contain a lot of unnecessary DOM for modern user agents.
 *     Please use a simpler button renderer like css3buttonrenderer.
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
goog.ui.ImagelessButtonRenderer = function() {
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.ImagelessButtonRenderer, goog.ui.CustomButtonRenderer);


/**
 * The singleton instance of this renderer class.
 * @type {goog.ui.ImagelessButtonRenderer?}
 * @private
 */
goog.ui.ImagelessButtonRenderer.instance_ = null;
goog.addSingletonGetter(goog.ui.ImagelessButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ImagelessButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-imageless-button');


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *    <div class="goog-inline-block goog-imageless-button">
 *      <div class="goog-inline-block goog-imageless-button-outer-box">
 *        <div class="goog-imageless-button-inner-box">
 *          <div class="goog-imageless-button-pos-box">
 *            <div class="goog-imageless-button-top-shadow">&nbsp;</div>
 *            <div class="goog-imageless-button-content">Contents...</div>
 *          </div>
 *        </div>
 *      </div>
 *    </div>
 * @override
 */
goog.ui.ImagelessButtonRenderer.prototype.createDom;


/** @override */
goog.ui.ImagelessButtonRenderer.prototype.getContentElement = function(
    element) {
  return /** @type {Element} */ (
      element && element.firstChild && element.firstChild.firstChild &&
      element.firstChild.firstChild.firstChild.lastChild);
};


/**
 * Takes a text caption or existing DOM structure, and returns the content
 * wrapped in a pseudo-rounded-corner box.  Creates the following DOM structure:
 *  <div class="goog-inline-block goog-imageless-button-outer-box">
 *    <div class="goog-inline-block goog-imageless-button-inner-box">
 *      <div class="goog-imageless-button-pos">
 *        <div class="goog-imageless-button-top-shadow">&nbsp;</div>
 *        <div class="goog-imageless-button-content">Contents...</div>
 *      </div>
 *    </div>
 *  </div>
 * Used by both {@link #createDom} and {@link #decorate}.  To be overridden
 * by subclasses.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to wrap
 *     in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Pseudo-rounded-corner box containing the content.
 * @override
 */
goog.ui.ImagelessButtonRenderer.prototype.createButton = function(
    content, dom) {
  var baseClass = this.getCssClass();
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' ';
  return dom.createDom(
      goog.dom.TagName.DIV,
      inlineBlock + goog.getCssName(baseClass, 'outer-box'),
      dom.createDom(
          goog.dom.TagName.DIV,
          inlineBlock + goog.getCssName(baseClass, 'inner-box'),
          dom.createDom(
              goog.dom.TagName.DIV, goog.getCssName(baseClass, 'pos'),
              dom.createDom(
                  goog.dom.TagName.DIV,
                  goog.getCssName(baseClass, 'top-shadow'), '\u00A0'),
              dom.createDom(
                  goog.dom.TagName.DIV, goog.getCssName(baseClass, 'content'),
                  content))));
};


/**
 * Check if the button's element has a box structure.
 * @param {goog.ui.Button} button Button instance whose structure is being
 *     checked.
 * @param {Element} element Element of the button.
 * @return {boolean} Whether the element has a box structure.
 * @protected
 * @override
 */
goog.ui.ImagelessButtonRenderer.prototype.hasBoxStructure = function(
    button, element) {
  var outer = button.getDomHelper().getFirstElementChild(element);
  var outerClassName = goog.getCssName(this.getCssClass(), 'outer-box');
  if (outer && goog.dom.classlist.contains(outer, outerClassName)) {
    var inner = button.getDomHelper().getFirstElementChild(outer);
    var innerClassName = goog.getCssName(this.getCssClass(), 'inner-box');
    if (inner && goog.dom.classlist.contains(inner, innerClassName)) {
      var pos = button.getDomHelper().getFirstElementChild(inner);
      var posClassName = goog.getCssName(this.getCssClass(), 'pos');
      if (pos && goog.dom.classlist.contains(pos, posClassName)) {
        var shadow = button.getDomHelper().getFirstElementChild(pos);
        var shadowClassName = goog.getCssName(this.getCssClass(), 'top-shadow');
        if (shadow && goog.dom.classlist.contains(shadow, shadowClassName)) {
          var content = button.getDomHelper().getNextElementSibling(shadow);
          var contentClassName = goog.getCssName(this.getCssClass(), 'content');
          if (content &&
              goog.dom.classlist.contains(content, contentClassName)) {
            // We have a proper box structure.
            return true;
          }
        }
      }
    }
  }
  return false;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ImagelessButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.ImagelessButtonRenderer.CSS_CLASS;
};


// Register a decorator factory function for goog.ui.ImagelessButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ImagelessButtonRenderer.CSS_CLASS, function() {
      return new goog.ui.Button(
          null, goog.ui.ImagelessButtonRenderer.getInstance());
    });


// Register a decorator factory function for toggle buttons using the
// goog.ui.ImagelessButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-imageless-toggle-button'), function() {
      var button = new goog.ui.Button(
          null, goog.ui.ImagelessButtonRenderer.getInstance());
      button.setSupportedState(goog.ui.Component.State.CHECKED, true);
      return button;
    });
