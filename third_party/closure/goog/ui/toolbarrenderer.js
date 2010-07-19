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
 * @fileoverview Renderer for {@link goog.ui.Toolbar}s.
 *
*
 */

goog.provide('goog.ui.ToolbarRenderer');

goog.require('goog.dom.a11y.Role');
goog.require('goog.ui.Container.Orientation');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');


/**
 * Default renderer for {@link goog.ui.Toolbar}s, based on {@link
 * goog.ui.ContainerRenderer}.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
goog.ui.ToolbarRenderer = function() {
  goog.ui.ContainerRenderer.call(this);
};
goog.inherits(goog.ui.ToolbarRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(goog.ui.ToolbarRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ToolbarRenderer.CSS_CLASS = goog.getCssName('goog-toolbar');


/**
 * Returns the ARIA role to be applied to toolbar/menubar.
 * @return {string} ARIA role.
 * @override
 */
goog.ui.ToolbarRenderer.prototype.getAriaRole = function() {
  return goog.dom.a11y.Role.TOOLBAR;
};


/**
 * Inspects the element, and creates an instance of {@link goog.ui.Control} or
 * an appropriate subclass best suited to decorate it.  Overrides the superclass
 * implementation by recognizing HR elements as separators.
 * @param {Element} element Element to decorate.
 * @return {goog.ui.Control?} A new control suitable to decorate the element
 *     (null if none).
 */
goog.ui.ToolbarRenderer.prototype.getDecoratorForChild = function(element) {
  return element.tagName == 'HR' ?
      new goog.ui.Separator(goog.ui.ToolbarSeparatorRenderer.getInstance()) :
      goog.ui.ToolbarRenderer.superClass_.getDecoratorForChild.call(this,
          element);
};


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.ToolbarRenderer.prototype.getCssClass = function() {
  return goog.ui.ToolbarRenderer.CSS_CLASS;
};


/**
 * Returns the default orientation of containers rendered or decorated by this
 * renderer.  This implementation returns {@code HORIZONTAL}.
 * @return {goog.ui.Container.Orientation} Default orientation for containers
 *     created or decorated by this renderer.
 */
goog.ui.ToolbarRenderer.prototype.getDefaultOrientation = function() {
  return goog.ui.Container.Orientation.HORIZONTAL;
};
