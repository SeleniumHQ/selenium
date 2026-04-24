/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for toolbar buttons.
 */

goog.provide('goog.ui.ToolbarButtonRenderer');

goog.require('goog.ui.CustomButtonRenderer');



/**
 * Toolbar-specific renderer for {@link goog.ui.Button}s, based on {@link
 * goog.ui.CustomButtonRenderer}.
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
goog.ui.ToolbarButtonRenderer = function() {
  'use strict';
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.ToolbarButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(goog.ui.ToolbarButtonRenderer);


/**
 * Default CSS class to be applied to the root element of buttons rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ToolbarButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-toolbar-button');


/**
 * Returns the CSS class to be applied to the root element of buttons rendered
 * using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ToolbarButtonRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.ToolbarButtonRenderer.CSS_CLASS;
};
