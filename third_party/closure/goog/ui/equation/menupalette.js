// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.equation.MenuPalette');
goog.provide('goog.ui.equation.MenuPaletteRenderer');

goog.require('goog.math.Size');
goog.require('goog.ui.PaletteRenderer');
goog.require('goog.ui.equation.Palette');
goog.require('goog.ui.equation.PaletteRenderer');



/**
 * Constructs a new menu palette.
 * @param {goog.ui.equation.PaletteManager} paletteManager The
 *     manager of the palette.
 * @extends {goog.ui.equation.Palette}
 * @constructor
 * @final
 */
goog.ui.equation.MenuPalette = function(paletteManager) {
  goog.ui.equation.Palette.call(this, paletteManager,
      goog.ui.equation.Palette.Type.MENU,
      0, 0, 46, 18,
      [goog.ui.equation.Palette.Type.GREEK,
       goog.ui.equation.Palette.Type.SYMBOL,
       goog.ui.equation.Palette.Type.COMPARISON,
       goog.ui.equation.Palette.Type.MATH,
       goog.ui.equation.Palette.Type.ARROW],
      goog.ui.equation.MenuPaletteRenderer.getInstance());
  this.setSize(new goog.math.Size(5, 1));
};
goog.inherits(goog.ui.equation.MenuPalette, goog.ui.equation.Palette);


/**
 * The CSS class name for the palette.
 * @type {string}
 */
goog.ui.equation.MenuPalette.CSS_CLASS = 'ee-menu-palette';


/**
 * Overrides the setVisible method to make menu palette always visible.
 * @param {boolean} visible Whether to show or hide the component.
 * @param {boolean=} opt_force If true, doesn't check whether the component
 *     already has the requested visibility, and doesn't dispatch any events.
 * @return {boolean} Whether the visibility was changed.
 * @override
 */
goog.ui.equation.MenuPalette.prototype.setVisible = function(
    visible, opt_force) {
  return goog.ui.equation.MenuPalette.base(this, 'setVisible', true, opt_force);
};



/**
 * The renderer for menu palette.
 * @extends {goog.ui.equation.PaletteRenderer}
 * @constructor
 * @final
 */
goog.ui.equation.MenuPaletteRenderer = function() {
  goog.ui.PaletteRenderer.call(this);
};
goog.inherits(goog.ui.equation.MenuPaletteRenderer,
    goog.ui.equation.PaletteRenderer);
goog.addSingletonGetter(goog.ui.equation.MenuPaletteRenderer);


/** @override */
goog.ui.equation.MenuPaletteRenderer.prototype.getCssClass =
    function() {
  return goog.ui.equation.MenuPalette.CSS_CLASS;
};
