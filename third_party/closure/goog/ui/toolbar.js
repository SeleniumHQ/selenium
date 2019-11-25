// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A toolbar class that hosts {@link goog.ui.Control}s such as
 * buttons and menus, along with toolbar-specific renderers of those controls.
 *
 * @author attila@google.com (Attila Bodis)
 * @see ../demos/toolbar.html
 */

goog.provide('goog.ui.Toolbar');

goog.require('goog.ui.Container');
goog.require('goog.ui.ToolbarRenderer');



/**
 * A toolbar class, implemented as a {@link goog.ui.Container} that defaults to
 * having a horizontal orientation and {@link goog.ui.ToolbarRenderer} as its
 * renderer.
 * @param {goog.ui.ToolbarRenderer=} opt_renderer Renderer used to render or
 *     decorate the toolbar; defaults to {@link goog.ui.ToolbarRenderer}.
 * @param {?goog.ui.Container.Orientation=} opt_orientation Toolbar orientation;
 *     defaults to {@code HORIZONTAL}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Container}
 */
goog.ui.Toolbar = function(opt_renderer, opt_orientation, opt_domHelper) {
  goog.ui.Container.call(
      this, opt_orientation,
      opt_renderer || goog.ui.ToolbarRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.Toolbar, goog.ui.Container);


/** @override */
goog.ui.Toolbar.prototype.handleFocus = function(e) {
  goog.ui.Toolbar.base(this, 'handleFocus', e);
  // Highlight the first highlightable item on focus via the keyboard for ARIA
  // spec compliance. Do not highlight the item if the mouse button is pressed,
  // since this method is also called from handleMouseDown when a toolbar button
  // is clicked.
  if (!this.isMouseButtonPressed()) {
    this.highlightFirst();
  }
};
