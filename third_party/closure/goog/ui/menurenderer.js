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
 * @fileoverview Renderer for {@link goog.ui.Menu}s.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.ui.MenuRenderer');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Separator');



/**
 * Default renderer for {@link goog.ui.Menu}s, based on {@link
 * goog.ui.ContainerRenderer}.
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
goog.ui.MenuRenderer = function(opt_ariaRole) {
  goog.ui.ContainerRenderer.call(this,
      opt_ariaRole || goog.a11y.aria.Role.MENU);
};
goog.inherits(goog.ui.MenuRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(goog.ui.MenuRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.MenuRenderer.CSS_CLASS = goog.getCssName('goog-menu');


/**
 * Returns whether the element is a UL or acceptable to our superclass.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.MenuRenderer.prototype.canDecorate = function(element) {
  return element.tagName == 'UL' ||
      goog.ui.MenuRenderer.superClass_.canDecorate.call(this, element);
};


/**
 * Inspects the element, and creates an instance of {@link goog.ui.Control} or
 * an appropriate subclass best suited to decorate it.  Overrides the superclass
 * implementation by recognizing HR elements as separators.
 * @param {Element} element Element to decorate.
 * @return {goog.ui.Control?} A new control suitable to decorate the element
 *     (null if none).
 * @override
 */
goog.ui.MenuRenderer.prototype.getDecoratorForChild = function(element) {
  return element.tagName == 'HR' ?
      new goog.ui.Separator() :
      goog.ui.MenuRenderer.superClass_.getDecoratorForChild.call(this,
          element);
};


/**
 * Returns whether the given element is contained in the menu's DOM.
 * @param {goog.ui.Menu} menu The menu to test.
 * @param {Element} element The element to test.
 * @return {boolean} Whether the given element is contained in the menu.
 */
goog.ui.MenuRenderer.prototype.containsElement = function(menu, element) {
  return goog.dom.contains(menu.getElement(), element);
};


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.MenuRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuRenderer.CSS_CLASS;
};


/** @override */
goog.ui.MenuRenderer.prototype.initializeDom = function(container) {
  goog.ui.MenuRenderer.superClass_.initializeDom.call(this, container);

  var element = container.getElement();
  goog.asserts.assert(element, 'The menu DOM element cannot be null.');
  goog.a11y.aria.setState(element, goog.a11y.aria.State.HASPOPUP, 'true');
};
