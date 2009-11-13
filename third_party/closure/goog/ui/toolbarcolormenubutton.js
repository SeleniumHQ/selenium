// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview A toolbar color menu button control.
 *
 */

goog.provide('goog.ui.ToolbarColorMenuButton');

goog.require('goog.ui.ColorMenuButton');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.ToolbarColorMenuButtonRenderer');
goog.require('goog.ui.registry');


/**
 * A color menu button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.Menu} opt_menu Menu to render under the button when clicked;
 *     should contain at least one {@link goog.ui.ColorPalette} if present.
 * @param {goog.ui.ColorMenuButtonRenderer} opt_renderer Optional
 *     renderer used to render or decorate the button; defaults to
 *     {@link goog.ui.ToolbarColorMenuButtonRenderer}.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ColorMenuButton}
 */
goog.ui.ToolbarColorMenuButton = function(
    content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.ColorMenuButton.call(this, content, opt_menu, opt_renderer ||
      goog.ui.ToolbarColorMenuButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.ToolbarColorMenuButton, goog.ui.ColorMenuButton);


// Registers a decorator factory function for toolbar color menu buttons.
goog.ui.registry.setDecoratorByClassName(
    'goog-toolbar-color-menu-button',
    function() {
      return new goog.ui.ToolbarColorMenuButton(null);
    });
