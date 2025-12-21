/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class for representing menu separators.
 * @see goog.ui.Menu
 */

goog.provide('goog.ui.MenuSeparator');

goog.require('goog.ui.MenuSeparatorRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');



/**
 * Class representing a menu separator.  A menu separator extends {@link
 * goog.ui.Separator} by always setting its renderer to {@link
 * goog.ui.MenuSeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @constructor
 * @extends {goog.ui.Separator}
 */
goog.ui.MenuSeparator = function(opt_domHelper) {
  'use strict';
  goog.ui.Separator.call(
      this, goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.MenuSeparator, goog.ui.Separator);


// Register a decorator factory function for goog.ui.MenuSeparators.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
      'use strict';
      // Separator defaults to using MenuSeparatorRenderer.
      return new goog.ui.Separator();
    });
