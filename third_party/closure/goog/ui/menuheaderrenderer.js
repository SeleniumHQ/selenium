/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for {@link goog.ui.MenuHeader}s.
 */

goog.provide('goog.ui.MenuHeaderRenderer');

goog.require('goog.ui.ControlRenderer');



/**
 * Renderer for menu headers.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.MenuHeaderRenderer = function() {
  'use strict';
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.MenuHeaderRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuHeaderRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.MenuHeaderRenderer.CSS_CLASS = goog.getCssName('goog-menuheader');


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.MenuHeaderRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.MenuHeaderRenderer.CSS_CLASS;
};
