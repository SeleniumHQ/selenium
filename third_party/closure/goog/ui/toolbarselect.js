/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar select control.
 */

goog.provide('goog.ui.ToolbarSelect');

goog.require('goog.ui.Select');
goog.require('goog.ui.ToolbarMenuButtonRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.ControlContent');
goog.requireType('goog.ui.Menu');
goog.requireType('goog.ui.MenuButtonRenderer');



/**
 * A select control for a toolbar.
 *
 * @param {goog.ui.ControlContent} caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 * @param {goog.ui.Menu=} opt_menu Menu containing selection options.
 * @param {goog.ui.MenuButtonRenderer=} opt_renderer Renderer used to
 *     render or decorate the control; defaults to
 *     {@link goog.ui.ToolbarMenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Select}
 */
goog.ui.ToolbarSelect = function(
    caption, opt_menu, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Select.call(
      this, caption, opt_menu,
      opt_renderer || goog.ui.ToolbarMenuButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.ToolbarSelect, goog.ui.Select);


// Registers a decorator factory function for select controls used in toolbars.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-toolbar-select'), function() {
      'use strict';
      return new goog.ui.ToolbarSelect(null);
    });
