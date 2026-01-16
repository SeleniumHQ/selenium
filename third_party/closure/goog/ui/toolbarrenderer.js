/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for {@link goog.ui.Toolbar}s.
 */

goog.provide('goog.ui.ToolbarRenderer');

goog.require('goog.a11y.aria.Role');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Container');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');
goog.requireType('goog.ui.Control');



/**
 * Default renderer for {@link goog.ui.Toolbar}s, based on {@link
 * goog.ui.ContainerRenderer}.
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
goog.ui.ToolbarRenderer = function() {
  'use strict';
  goog.ui.ContainerRenderer.call(this, goog.a11y.aria.Role.TOOLBAR);
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
 * Inspects the element, and creates an instance of {@link goog.ui.Control} or
 * an appropriate subclass best suited to decorate it.  Overrides the superclass
 * implementation by recognizing HR elements as separators.
 * @param {Element} element Element to decorate.
 * @return {goog.ui.Control?} A new control suitable to decorate the element
 *     (null if none).
 * @override
 */
goog.ui.ToolbarRenderer.prototype.getDecoratorForChild = function(element) {
  'use strict';
  return element.tagName == goog.dom.TagName.HR ?
      new goog.ui.Separator(goog.ui.ToolbarSeparatorRenderer.getInstance()) :
      goog.ui.ToolbarRenderer.superClass_.getDecoratorForChild.call(
          this, element);
};


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ToolbarRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.ToolbarRenderer.CSS_CLASS;
};


/**
 * Returns the default orientation of containers rendered or decorated by this
 * renderer.  This implementation returns `HORIZONTAL`.
 * @return {goog.ui.Container.Orientation} Default orientation for containers
 *     created or decorated by this renderer.
 * @override
 */
goog.ui.ToolbarRenderer.prototype.getDefaultOrientation = function() {
  'use strict';
  return goog.ui.Container.Orientation.HORIZONTAL;
};
