/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar separator control.
 */

goog.provide('goog.ui.ToolbarSeparator');

goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');



/**
 * A separator control for a toolbar.
 *
 * @param {goog.ui.ToolbarSeparatorRenderer=} opt_renderer Renderer to render or
 *    decorate the separator; defaults to
 *     {@link goog.ui.ToolbarSeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Separator}
 * @final
 */
goog.ui.ToolbarSeparator = function(opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Separator.call(
      this, opt_renderer || goog.ui.ToolbarSeparatorRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.ToolbarSeparator, goog.ui.Separator);


// Registers a decorator factory function for toolbar separators.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ToolbarSeparatorRenderer.CSS_CLASS, function() {
      'use strict';
      return new goog.ui.ToolbarSeparator();
    });
