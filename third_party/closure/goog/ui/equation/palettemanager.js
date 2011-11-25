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

goog.provide('goog.ui.equation.PaletteManager');

goog.require('goog.Timer');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.equation.ArrowPalette');
goog.require('goog.ui.equation.ComparisonPalette');
goog.require('goog.ui.equation.GreekPalette');
goog.require('goog.ui.equation.MathPalette');
goog.require('goog.ui.equation.MenuPalette');
goog.require('goog.ui.equation.Palette');
goog.require('goog.ui.equation.SymbolPalette');



/**
 * Constructs the palette manager that manages all the palettes in Equation
 * Editor.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.equation.PaletteManager = function() {
  goog.events.EventTarget.call(this);

  /**
   * The map of palette type and instance pair.
   * @type {Object.<string, goog.ui.equation.Palette>}
   * @private
   */
  this.paletteMap_ = {};

  /**
   * The current active palette.
   * @type {goog.ui.equation.Palette}
   * @private
   */
  this.activePalette_ = null;

  /**
   * The event handler for managing events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * The timer used to add grace period when deactivate palettes.
   * @type {goog.Timer}
   * @private
   */
  this.deactivationTimer_ = new goog.Timer(300);

  this.eventHandler_.listen(this.deactivationTimer_, goog.Timer.TICK,
      this.handleDeactivation_);

};
goog.inherits(goog.ui.equation.PaletteManager,
    goog.events.EventTarget);


/**
 * Clears the deactivation timer.  This is used to prevent palette manager
 * deactivation when mouse pointer is moved outside palettes and moved back
 * quickly inside a grace period.
 */
goog.ui.equation.PaletteManager.prototype.stopDeactivation = function() {
  this.deactivationTimer_.stop();
};


/**
 * Returns the palette instance of given type.
 * @param {goog.ui.equation.Palette.Type} type The type of palette
 *     to get.
 * @return {goog.ui.equation.Palette} The palette instance of given
 *     type. A new instance will be created.  If the instance doesn't exist.
 */
goog.ui.equation.PaletteManager.prototype.getPalette =
    function(type) {
  var paletteMap = this.paletteMap_;
  var palette = paletteMap[type];
  if (!palette) {
    switch (type) {
      case goog.ui.equation.Palette.Type.MENU:
        palette = new goog.ui.equation.MenuPalette(this);
        break;
      case goog.ui.equation.Palette.Type.GREEK:
        palette = new goog.ui.equation.GreekPalette(this);
        break;
      case goog.ui.equation.Palette.Type.SYMBOL:
        palette = new goog.ui.equation.SymbolPalette(this);
        break;
      case goog.ui.equation.Palette.Type.COMPARISON:
        palette = new goog.ui.equation.ComparisonPalette(this);
        break;
      case goog.ui.equation.Palette.Type.MATH:
        palette = new goog.ui.equation.MathPalette(this);
        break;
      case goog.ui.equation.Palette.Type.ARROW:
        palette = new goog.ui.equation.ArrowPalette(this);
        break;
      default:
        throw new Error('Invalid palette type!');
    }
    paletteMap[type] = palette;
  }
  return palette;
};


/**
 * Sets the palette instance of given type to be the active one.
 * @param {goog.ui.equation.Palette.Type} type The type of the
 *     palette to set active.
 * @return {goog.ui.equation.Palette} The palette instance of given
 *     type. A new instance will be created, if the instance doesn't exist.
 */
goog.ui.equation.PaletteManager.prototype.setActive =
    function(type) {
  var palette = this.activePalette_;
  if (palette) {
    palette.setVisible(false);
  }

  palette = this.getPalette(type);
  this.activePalette_ = palette;
  palette.setVisible(true);

  return palette;
};


/**
 * Returns the active palette.
 * @return {goog.ui.equation.Palette} The active palette.
 */
goog.ui.equation.PaletteManager.prototype.getActive = function() {
  return this.activePalette_;
};


/**
 * Starts the deactivation of open palette.
 * This method has a slight delay before doing the real deactivation.  This
 * helps prevent sudden disappearing of palettes when user moves mouse outside
 * them just briefly (and maybe accidentally).  If you really want to deactivate
 * the active palette, use {@link #deactivateNow()} instead.
 */
goog.ui.equation.PaletteManager.prototype.deactivate = function() {
  this.deactivationTimer_.start();
};


/**
 * Deactivate the open palette immediately.
 */
goog.ui.equation.PaletteManager.prototype.deactivateNow = function() {
  this.handleDeactivation_();
};


/**
 * Internal process of deactivation of the manager.
 * @private
 */
goog.ui.equation.PaletteManager.prototype.handleDeactivation_ = function() {
  this.setActive(goog.ui.equation.Palette.Type.MENU);
};


/** @override */
goog.ui.equation.PaletteManager.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.activePalette_ = null;
  this.paletteMap_ = null;
};
