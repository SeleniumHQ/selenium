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
 * @fileoverview Similiar functionality of {@link goog.ui.ButtonRenderer},
 * but uses a <div> element instead of a <button> or <input> element.
 *
 */

goog.provide('goog.ui.FlatButtonRenderer');

goog.require('goog.a11y.aria.Role');
goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Button');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.registry');



/**
 * Flat renderer for {@link goog.ui.Button}s.  Flat buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
goog.ui.FlatButtonRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.FlatButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.FlatButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.FlatButtonRenderer.CSS_CLASS = goog.getCssName('goog-flat-button');


/**
 * Returns the control's contents wrapped in a div element, with
 * the renderer's own CSS class and additional state-specific classes applied
 * to it, and the button's disabled attribute set or cleared as needed.
 * Overrides {@link goog.ui.ButtonRenderer#createDom}.
 * @param {goog.ui.Control} button Button to render.
 * @return {!Element} Root element for the button.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.createDom = function(button) {
  var classNames = this.getClassNames(button);
  var attributes = {
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' ')
  };
  var element = button.getDomHelper().createDom(
      goog.dom.TagName.DIV, attributes, button.getContent());
  this.setTooltip(element, button.getTooltip());
  return element;
};


/**
 * Returns the ARIA role to be applied to flat buttons.
 * @return {goog.a11y.aria.Role|undefined} ARIA role.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.BUTTON;
};


/**
 * Returns true if this renderer can decorate the element.  Overrides
 * {@link goog.ui.ButtonRenderer#canDecorate} by returning true if the
 * element is a DIV, false otherwise.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.DIV;
};


/**
 * Takes an existing element and decorates it with the flat button control.
 * Initializes the control's ID, content, tooltip, value, and state based
 * on the ID of the element, its child nodes, and its CSS classes, respectively.
 * Returns the element.  Overrides {@link goog.ui.ButtonRenderer#decorate}.
 * @param {goog.ui.Control} button Button instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.decorate = function(button, element) {
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);
  return goog.ui.FlatButtonRenderer.superClass_.decorate.call(this, button,
      element);
};


/**
 * Flat buttons can't use the value attribute since they are div elements.
 * Overrides {@link goog.ui.ButtonRenderer#getValue} to prevent trying to
 * access the element's value.
 * @param {Element} element The button control's root element.
 * @return {string} Value not valid for flat buttons.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.getValue = function(element) {
  // Flat buttons don't store their value in the DOM.
  return '';
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.FlatButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.FlatButtonRenderer.CSS_CLASS;
};


// Register a decorator factory function for Flat Buttons.
goog.ui.registry.setDecoratorByClassName(goog.ui.FlatButtonRenderer.CSS_CLASS,
    function() {
      // Uses goog.ui.Button, but with FlatButtonRenderer.
      return new goog.ui.Button(null, goog.ui.FlatButtonRenderer.getInstance());
    });
