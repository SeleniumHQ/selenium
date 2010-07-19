// Copyright 2010 Google Inc. All Rights Reserved
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
 * @fileoverview Behavior for combining a color button and a menu.
 *
*
 * @see ../demos/split.html
 */

goog.provide('goog.ui.ColorSplitBehavior');

goog.require('goog.ui.ColorButton');
goog.require('goog.ui.ColorMenuButton');
goog.require('goog.ui.SplitBehavior');


/**
 * Constructs a ColorSplitBehavior for combining a color button and a menu.
 * To use this, provide a goog.ui.ColorButton which will be attached with
 * a goog.ui.ColorMenuButton (with no caption).
 * Whenever a color is selected from the ColorMenuButton, it will be placed in
 * the ColorButton and the user can apply it over and over (by clicking the
 * ColorButton).
 * Primary use case - setting the color of text/background in a text editor.
 *
 * @param {!goog.ui.Button} colorButton A button to interact with a color menu
 *     button (preferably a goog.ui.ColorButton).
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @extends {goog.ui.SplitBehavior}
 * @constructor
 */
goog.ui.ColorSplitBehavior = function(colorButton, opt_domHelper) {
  goog.base(this, colorButton,
      new goog.ui.ColorMenuButton(goog.ui.ColorSplitBehavior.ZERO_WIDTH_SPACE_),
      goog.ui.SplitBehavior.DefaultHandlers.VALUE,
      undefined,
      opt_domHelper);
};
goog.inherits(goog.ui.ColorSplitBehavior, goog.ui.SplitBehavior);


/**
 * A zero width space character.
 * @type {string}
 * @private
 */
goog.ui.ColorSplitBehavior.ZERO_WIDTH_SPACE_ = '\uFEFF';

