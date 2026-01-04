/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar class that hosts {@link goog.ui.Control}s such as
 * buttons and menus, along with toolbar-specific renderers of those controls.
 *
 * @see ../demos/toolbar.html
 */

goog.provide('goog.ui.Toolbar');

goog.require('goog.ui.Container');
goog.require('goog.ui.ToolbarRenderer');
goog.requireType('goog.dom.DomHelper');



/**
 * A toolbar class, implemented as a {@link goog.ui.Container} that defaults to
 * having a horizontal orientation and {@link goog.ui.ToolbarRenderer} as its
 * renderer.
 * @param {goog.ui.ToolbarRenderer=} opt_renderer Renderer used to render or
 *     decorate the toolbar; defaults to {@link goog.ui.ToolbarRenderer}.
 * @param {?goog.ui.Container.Orientation=} opt_orientation Toolbar orientation;
 *     defaults to `HORIZONTAL`.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Container}
 */
goog.ui.Toolbar = function(opt_renderer, opt_orientation, opt_domHelper) {
  'use strict';
  goog.ui.Container.call(
      this, opt_orientation,
      opt_renderer || goog.ui.ToolbarRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.Toolbar, goog.ui.Container);


/** @override */
goog.ui.Toolbar.prototype.handleFocus = function(e) {
  'use strict';
  goog.ui.Toolbar.base(this, 'handleFocus', e);
  // Highlight the first highlightable item on focus via the keyboard for ARIA
  // spec compliance. Do not highlight the item if the mouse button is pressed,
  // since this method is also called from handleMouseDown when a toolbar button
  // is clicked.
  if (!this.isMouseButtonPressed()) {
    this.highlightFirst();
  }
};
