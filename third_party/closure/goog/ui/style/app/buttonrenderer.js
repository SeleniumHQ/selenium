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
 * @fileoverview Renderer for {@link goog.ui.Button}s in App style.
 *
 * Based on ImagelessButtonRender. Uses even more CSS voodoo than the default
 * implementation to render custom buttons with fake rounded corners and
 * dimensionality (via a subtle flat shadow on the bottom half of the button)
 * without the use of images.
 *
 * Based on the Custom Buttons 3.1 visual specification, see
 * http://go/custombuttons
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.ui.style.app.ButtonRenderer');

goog.require('goog.dom.classes');
goog.require('goog.ui.Button');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.registry');



/**
 * Custom renderer for {@link goog.ui.Button}s. Imageless buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 *
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
goog.ui.style.app.ButtonRenderer = function() {
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.style.app.ButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(goog.ui.style.app.ButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.style.app.ButtonRenderer.CSS_CLASS = goog.getCssName('goog-button');


/**
 * Array of arrays of CSS classes that we want composite classes added and
 * removed for in IE6 and lower as a workaround for lack of multi-class CSS
 * selector support.
 * @type {Array.<Array.<string>>}
 */
goog.ui.style.app.ButtonRenderer.IE6_CLASS_COMBINATIONS = [];


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *    <div class="goog-inline-block goog-button-base goog-button">
 *      <div class="goog-inline-block goog-button-base-outer-box">
 *        <div class="goog-button-base-inner-box">
 *          <div class="goog-button-base-pos">
 *            <div class="goog-button-base-top-shadow">&nbsp;</div>
 *            <div class="goog-button-base-content">Contents...</div>
 *          </div>
 *        </div>
 *      </div>
 *    </div>
 * @override
 */
goog.ui.style.app.ButtonRenderer.prototype.createDom;


/** @override */
goog.ui.style.app.ButtonRenderer.prototype.getContentElement = function(
    element) {
  return element && /** @type {Element} */(
      element.firstChild.firstChild.firstChild.lastChild);
};


/**
 * Takes a text caption or existing DOM structure, and returns the content
 * wrapped in a pseudo-rounded-corner box.  Creates the following DOM structure:
 *  <div class="goog-inline-block goog-button-base-outer-box">
 *    <div class="goog-inline-block goog-button-base-inner-box">
 *      <div class="goog-button-base-pos">
 *        <div class="goog-button-base-top-shadow">&nbsp;</div>
 *        <div class="goog-button-base-content">Contents...</div>
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
goog.ui.style.app.ButtonRenderer.prototype.createButton = function(content,
    dom) {
  var baseClass = this.getStructuralCssClass();
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' ';
  return dom.createDom(
      'div', inlineBlock + goog.getCssName(baseClass, 'outer-box'),
      dom.createDom(
          'div', inlineBlock + goog.getCssName(baseClass, 'inner-box'),
          dom.createDom('div', goog.getCssName(baseClass, 'pos'),
              dom.createDom(
                  'div', goog.getCssName(baseClass, 'top-shadow'), '\u00A0'),
              dom.createDom(
                  'div', goog.getCssName(baseClass, 'content'), content))));
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
goog.ui.style.app.ButtonRenderer.prototype.hasBoxStructure = function(
    button, element) {

  var baseClass = this.getStructuralCssClass();
  var outer = button.getDomHelper().getFirstElementChild(element);
  var outerClassName = goog.getCssName(baseClass, 'outer-box');
  if (outer && goog.dom.classes.has(outer, outerClassName)) {

    var inner = button.getDomHelper().getFirstElementChild(outer);
    var innerClassName = goog.getCssName(baseClass, 'inner-box');
    if (inner && goog.dom.classes.has(inner, innerClassName)) {

      var pos = button.getDomHelper().getFirstElementChild(inner);
      var posClassName = goog.getCssName(baseClass, 'pos');
      if (pos && goog.dom.classes.has(pos, posClassName)) {

        var shadow = button.getDomHelper().getFirstElementChild(pos);
        var shadowClassName = goog.getCssName(baseClass, 'top-shadow');
        if (shadow && goog.dom.classes.has(shadow, shadowClassName)) {

          var content = button.getDomHelper().getNextElementSibling(shadow);
          var contentClassName = goog.getCssName(baseClass, 'content');
          if (content && goog.dom.classes.has(content, contentClassName)) {
            // We have a proper box structure.
            return true;
          }
        }
      }
    }
  }
  return false;
};


/** @override */
goog.ui.style.app.ButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.style.app.ButtonRenderer.CSS_CLASS;
};


/** @override */
goog.ui.style.app.ButtonRenderer.prototype.getStructuralCssClass = function() {
  // TODO(user): extract to a constant.
  return goog.getCssName('goog-button-base');
};


/** @override */
goog.ui.style.app.ButtonRenderer.prototype.getIe6ClassCombinations =
    function() {
  return goog.ui.style.app.ButtonRenderer.IE6_CLASS_COMBINATIONS;
};



// Register a decorator factory function for goog.ui.style.app.ButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.style.app.ButtonRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Button(null,
          goog.ui.style.app.ButtonRenderer.getInstance());
    });
