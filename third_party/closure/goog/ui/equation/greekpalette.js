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

goog.provide('goog.ui.equation.GreekPalette');

goog.require('goog.math.Size');
goog.require('goog.ui.equation.Palette');



/**
 * Constructs a new Greek symbols palette.
 * @param {goog.ui.equation.PaletteManager} paletteManager The
 *     manager of the palette.
 * @extends {goog.ui.equation.Palette}
 * @constructor
 * @final
 */
goog.ui.equation.GreekPalette = function(paletteManager) {
  goog.ui.equation.Palette.call(this, paletteManager,
      goog.ui.equation.Palette.Type.GREEK,
      0, 30, 18, 18,
      ['\\alpha',
       '\\beta',
       '\\gamma',
       '\\delta',
       '\\epsilon',
       '\\varepsilon',
       '\\zeta',
       '\\eta',
       '\\theta',
       '\\vartheta',
       '\\iota',
       '\\kappa',
       '\\lambda',
       '\\mu',
       '\\nu',
       '\\xi',
       '\\pi',
       '\\varpi',
       '\\rho',
       '\\varrho',
       '\\sigma',
       '\\varsigma',
       '\\tau',
       '\\upsilon',
       '\\phi',
       '\\varphi',
       '\\chi',
       '\\psi',
       '\\omega',
       '\\Gamma',
       '\\Delta',
       '\\Theta',
       '\\Lambda',
       '\\Xi',
       '\\Pi',
       '\\Sigma',
       '\\Upsilon',
       '\\Phi',
       '\\Psi',
       '\\Omega']);
  this.setSize(new goog.math.Size(7, 6));
};
goog.inherits(goog.ui.equation.GreekPalette, goog.ui.equation.Palette);
