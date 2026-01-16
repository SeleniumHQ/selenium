/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A button rendered via {@link goog.ui.CustomButtonRenderer}.
 */

goog.provide('goog.ui.CustomButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.ButtonRenderer');
goog.requireType('goog.ui.ControlContent');



/**
 * A custom button control.  Identical to {@link goog.ui.Button}, except it
 * defaults its renderer to {@link goog.ui.CustomButtonRenderer}.  One could
 * just as easily pass `goog.ui.CustomButtonRenderer.getInstance()` to
 * the {@link goog.ui.Button} constructor and get the same result.  Provided
 * for convenience.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *    structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *    render or decorate the button; defaults to
 *    {@link goog.ui.CustomButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.CustomButton = function(content, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Button.call(
      this, content, opt_renderer || goog.ui.CustomButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.CustomButton, goog.ui.Button);


// Register a decorator factory function for goog.ui.CustomButtons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.CustomButtonRenderer.CSS_CLASS, function() {
      'use strict';
      // CustomButton defaults to using CustomButtonRenderer.
      return new goog.ui.CustomButton(null);
    });
