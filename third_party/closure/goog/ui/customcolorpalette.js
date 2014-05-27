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
 * @fileoverview A color palette with a button for adding additional colors
 * manually.
 *
 */

goog.provide('goog.ui.CustomColorPalette');

goog.require('goog.color');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.ColorPalette');
goog.require('goog.ui.Component');



/**
 * A custom color palette is a grid of color swatches and a button that allows
 * the user to add additional colors to the palette
 *
 * @param {Array.<string>} initColors Array of initial colors to populate the
 *     palette with.
 * @param {goog.ui.PaletteRenderer=} opt_renderer Renderer used to render or
 *     decorate the palette; defaults to {@link goog.ui.PaletteRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ColorPalette}
 * @final
 */
goog.ui.CustomColorPalette = function(initColors, opt_renderer, opt_domHelper) {
  goog.ui.ColorPalette.call(this, initColors, opt_renderer, opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.OPENED, true);
};
goog.inherits(goog.ui.CustomColorPalette, goog.ui.ColorPalette);


/**
 * Returns an array of DOM nodes for each color, and an additional cell with a
 * '+'.
 * @return {!Array.<Node>} Array of div elements.
 * @override
 */
goog.ui.CustomColorPalette.prototype.createColorNodes = function() {
  /** @desc Hover caption for the button that allows the user to add a color. */
  var MSG_CLOSURE_CUSTOM_COLOR_BUTTON = goog.getMsg('Add a color');

  var nl = goog.ui.CustomColorPalette.base(this, 'createColorNodes');
  nl.push(goog.dom.createDom('div', {
    'class': goog.getCssName('goog-palette-customcolor'),
    'title': MSG_CLOSURE_CUSTOM_COLOR_BUTTON
  }, '+'));
  return nl;
};


/**
 * @override
 * @param {goog.events.Event} e Mouse or key event that triggered the action.
 * @return {boolean} True if the action was allowed to proceed, false otherwise.
 */
goog.ui.CustomColorPalette.prototype.performActionInternal = function(e) {
  var item = /** @type {Element} */ (this.getHighlightedItem());
  if (item) {
    if (goog.dom.classlist.contains(
        item, goog.getCssName('goog-palette-customcolor'))) {
      // User activated the special "add custom color" swatch.
      this.promptForCustomColor();
    } else {
      // User activated a normal color swatch.
      this.setSelectedItem(item);
      return this.dispatchEvent(goog.ui.Component.EventType.ACTION);
    }
  }
  return false;
};


/**
 * Prompts the user to enter a custom color.  Currently uses a window.prompt
 * but could be updated to use a dialog box with a WheelColorPalette.
 */
goog.ui.CustomColorPalette.prototype.promptForCustomColor = function() {
  /** @desc Default custom color dialog. */
  var MSG_CLOSURE_CUSTOM_COLOR_PROMPT = goog.getMsg(
      'Input custom color, i.e. pink, #F00, #D015FF or rgb(100, 50, 25)');

  // A CustomColorPalette is considered "open" while the color selection prompt
  // is open.  Enabling state transition events for the OPENED state and
  // listening for OPEN events allows clients to save the selection before
  // it is destroyed (see e.g. bug 1064701).
  var response = null;
  this.setOpen(true);
  if (this.isOpen()) {
    // The OPEN event wasn't canceled; prompt for custom color.
    response = window.prompt(MSG_CLOSURE_CUSTOM_COLOR_PROMPT, '#FFFFFF');
    this.setOpen(false);
  }

  if (!response) {
    // The user hit cancel
    return;
  }

  var color;
  /** @preserveTry */
  try {
    color = goog.color.parse(response).hex;
  } catch (er) {
    /** @desc Alert message sent when the input string is not a valid color. */
    var MSG_CLOSURE_CUSTOM_COLOR_INVALID_INPUT = goog.getMsg(
        'ERROR: "{$color}" is not a valid color.', {'color': response});
    alert(MSG_CLOSURE_CUSTOM_COLOR_INVALID_INPUT);
    return;
  }

  // TODO(user): This is relatively inefficient.  Consider adding
  // functionality to palette to add individual items after render time.
  var colors = this.getColors();
  colors.push(color);
  this.setColors(colors);

  // Set the selected color to the new color and notify listeners of the action.
  this.setSelectedColor(color);
  this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};
