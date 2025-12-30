/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class for representing a separator, with renderers for both
 * horizontal (menu) and vertical (toolbar) separators.
 */

goog.provide('goog.ui.Separator');

goog.require('goog.a11y.aria');
goog.require('goog.asserts');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.MenuSeparatorRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');



/**
 * Class representing a separator.  Although it extends {@link goog.ui.Control},
 * the Separator class doesn't allocate any event handlers, nor does it change
 * its appearance on mouseover, etc.
 * @param {goog.ui.MenuSeparatorRenderer=} opt_renderer Renderer to render or
 *    decorate the separator; defaults to {@link goog.ui.MenuSeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Separator = function(opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Control.call(
      this, null, opt_renderer || goog.ui.MenuSeparatorRenderer.getInstance(),
      opt_domHelper);

  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);

  // Separators are always considered disabled.
  this.setStateInternal(goog.ui.Component.State.DISABLED);
};
goog.inherits(goog.ui.Separator, goog.ui.Control);


/**
 * Configures the component after its DOM has been rendered.  Overrides
 * {@link goog.ui.Control#enterDocument} by making sure no event handler
 * is allocated.
 * @override
 */
goog.ui.Separator.prototype.enterDocument = function() {
  'use strict';
  goog.ui.Separator.superClass_.enterDocument.call(this);
  var element = this.getElement();
  goog.asserts.assert(
      element, 'The DOM element for the separator cannot be null.');
  goog.a11y.aria.setRole(element, 'separator');
};


// Register a decorator factory function for goog.ui.MenuSeparators.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
      'use strict';
      // Separator defaults to using MenuSeparatorRenderer.
      return new goog.ui.Separator();
    });
