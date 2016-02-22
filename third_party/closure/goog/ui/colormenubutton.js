// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A color menu button.  Extends {@link goog.ui.MenuButton} by
 * showing the currently selected color in the button caption.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.ColorMenuButton');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.ui.ColorMenuButtonRenderer');
goog.require('goog.ui.ColorPalette');
goog.require('goog.ui.Component');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.registry');



/**
 * A color menu button control.  Extends {@link goog.ui.MenuButton} by adding
 * an API for getting and setting the currently selected color from a menu of
 * color palettes.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked;
 *     should contain at least one {@link goog.ui.ColorPalette} if present.
 * @param {goog.ui.MenuButtonRenderer=} opt_renderer Button renderer;
 *     defaults to {@link goog.ui.ColorMenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
goog.ui.ColorMenuButton = function(content, opt_menu, opt_renderer,
    opt_domHelper) {
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer ||
      goog.ui.ColorMenuButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.ColorMenuButton, goog.ui.MenuButton);


/**
 * Default color palettes.
 * @type {!Object}
 */
goog.ui.ColorMenuButton.PALETTES = {
  /** Default grayscale colors. */
  GRAYSCALE: [
    '#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'
  ],

  /** Default solid colors. */
  SOLID: [
    '#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'
  ],

  /** Default pastel colors. */
  PASTEL: [
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9',
    '#ead1dc',
    '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
    '#d5a6bd',
    '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3',
    '#c27ba0',
    '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7',
    '#a64d79',
    '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75',
    '#741b47',
    '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d',
    '#4c1130'
  ]
};


/**
 * Value for the "no color" menu item object in the color menu (if present).
 * The {@link goog.ui.ColorMenuButton#handleMenuAction} method interprets
 * ACTION events dispatched by an item with this value as meaning "clear the
 * selected color."
 * @type {string}
 */
goog.ui.ColorMenuButton.NO_COLOR = 'none';


/**
 * Factory method that creates and returns a new {@link goog.ui.Menu} instance
 * containing default color palettes.
 * @param {Array<goog.ui.Control>=} opt_extraItems Optional extra menu items to
 *     add before the color palettes.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @return {!goog.ui.Menu} Color menu.
 */
goog.ui.ColorMenuButton.newColorMenu = function(opt_extraItems, opt_domHelper) {
  var menu = new goog.ui.Menu(opt_domHelper);

  if (opt_extraItems) {
    goog.array.forEach(opt_extraItems, function(item) {
      menu.addChild(item, true);
    });
  }

  goog.object.forEach(goog.ui.ColorMenuButton.PALETTES, function(colors) {
    var palette = new goog.ui.ColorPalette(colors, null, opt_domHelper);
    palette.setSize(8);
    menu.addChild(palette, true);
  });

  return menu;
};


/**
 * Returns the currently selected color (null if none).
 * @return {string} The selected color.
 */
goog.ui.ColorMenuButton.prototype.getSelectedColor = function() {
  return /** @type {string} */ (this.getValue());
};


/**
 * Sets the selected color, or clears the selected color if the argument is
 * null or not any of the available color choices.
 * @param {?string} color New color.
 */
goog.ui.ColorMenuButton.prototype.setSelectedColor = function(color) {
  this.setValue(color);
};


/**
 * Sets the value associated with the color menu button.  Overrides
 * {@link goog.ui.Button#setValue} by interpreting the value as a color
 * spec string.
 * @param {*} value New button value; should be a color spec string.
 * @override
 */
goog.ui.ColorMenuButton.prototype.setValue = function(value) {
  var color = /** @type {?string} */ (value);
  for (var i = 0, item; item = this.getItemAt(i); i++) {
    if (typeof item.setSelectedColor == 'function') {
      // This menu item looks like a color palette.
      item.setSelectedColor(color);
    }
  }
  goog.ui.ColorMenuButton.superClass_.setValue.call(this, color);
};


/**
 * Handles {@link goog.ui.Component.EventType.ACTION} events dispatched by
 * the menu item clicked by the user.  Updates the button, calls the superclass
 * implementation to hide the menu, stops the propagation of the event, and
 * dispatches an ACTION event on behalf of the button itself.  Overrides
 * {@link goog.ui.MenuButton#handleMenuAction}.
 * @param {goog.events.Event} e Action event to handle.
 * @override
 */
goog.ui.ColorMenuButton.prototype.handleMenuAction = function(e) {
  if (typeof e.target.getSelectedColor == 'function') {
    // User clicked something that looks like a color palette.
    this.setValue(e.target.getSelectedColor());
  } else if (e.target.getValue() == goog.ui.ColorMenuButton.NO_COLOR) {
    // User clicked the special "no color" menu item.
    this.setValue(null);
  }
  goog.ui.ColorMenuButton.superClass_.handleMenuAction.call(this, e);
  e.stopPropagation();
  this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};


/**
 * Opens or closes the menu.  Overrides {@link goog.ui.MenuButton#setOpen} by
 * generating a default color menu on the fly if needed.
 * @param {boolean} open Whether to open or close the menu.
 * @param {goog.events.Event=} opt_e Mousedown event that caused the menu to
 *     be opened.
 * @override
 */
goog.ui.ColorMenuButton.prototype.setOpen = function(open, opt_e) {
  if (open && this.getItemCount() == 0) {
    this.setMenu(
        goog.ui.ColorMenuButton.newColorMenu(null, this.getDomHelper()));
    this.setValue(/** @type {?string} */ (this.getValue()));
  }
  goog.ui.ColorMenuButton.superClass_.setOpen.call(this, open, opt_e);
};


// Register a decorator factory function for goog.ui.ColorMenuButtons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ColorMenuButtonRenderer.CSS_CLASS,
    function() {
      return new goog.ui.ColorMenuButton(null);
    });
