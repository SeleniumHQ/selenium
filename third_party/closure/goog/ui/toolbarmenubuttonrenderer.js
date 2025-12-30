/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar menu button renderer.
 */

goog.provide('goog.ui.ToolbarMenuButtonRenderer');

goog.require('goog.ui.MenuButtonRenderer');



/**
 * Toolbar-specific renderer for {@link goog.ui.MenuButton}s, based on {@link
 * goog.ui.MenuButtonRenderer}.
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 */
goog.ui.ToolbarMenuButtonRenderer = function() {
  'use strict';
  goog.ui.MenuButtonRenderer.call(this);
};
goog.inherits(goog.ui.ToolbarMenuButtonRenderer, goog.ui.MenuButtonRenderer);
goog.addSingletonGetter(goog.ui.ToolbarMenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of menu buttons rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-toolbar-menu-button');


/**
 * Returns the CSS class to be applied to the root element of menu buttons
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ToolbarMenuButtonRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS;
};
