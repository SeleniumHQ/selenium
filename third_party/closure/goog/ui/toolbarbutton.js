/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar button control.
 */

goog.provide('goog.ui.ToolbarButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.ToolbarButtonRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.ButtonRenderer');
goog.requireType('goog.ui.ControlContent');



/**
 * A button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *     render or decorate the button; defaults to
 *     {@link goog.ui.ToolbarButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.ToolbarButton = function(content, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Button.call(
      this, content,
      opt_renderer || goog.ui.ToolbarButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.ToolbarButton, goog.ui.Button);


// Registers a decorator factory function for toolbar buttons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ToolbarButtonRenderer.CSS_CLASS, function() {
      'use strict';
      return new goog.ui.ToolbarButton(null);
    });
