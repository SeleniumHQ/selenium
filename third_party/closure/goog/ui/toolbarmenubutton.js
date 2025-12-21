/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar menu button control.
 */

goog.provide('goog.ui.ToolbarMenuButton');

goog.require('goog.ui.MenuButton');
goog.require('goog.ui.ToolbarMenuButtonRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.ButtonRenderer');
goog.requireType('goog.ui.ControlContent');
goog.requireType('goog.ui.Menu');



/**
 * A menu button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *     render or decorate the button; defaults to
 *     {@link goog.ui.ToolbarMenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
goog.ui.ToolbarMenuButton = function(
    content, opt_menu, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.MenuButton.call(
      this, content, opt_menu,
      opt_renderer || goog.ui.ToolbarMenuButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.ToolbarMenuButton, goog.ui.MenuButton);


// Registers a decorator factory function for toolbar menu buttons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS, function() {
      'use strict';
      return new goog.ui.ToolbarMenuButton(null);
    });
