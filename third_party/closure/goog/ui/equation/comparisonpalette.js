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

goog.provide('goog.ui.equation.ComparisonPalette');

goog.require('goog.math.Size');
goog.require('goog.ui.equation.Palette');



/**
 * Constructs a new comparison palette.
 * @param {goog.ui.equation.PaletteManager} paletteManager The
 *     manager of the palette.
 * @extends {goog.ui.equation.Palette}
 * @constructor
 */
goog.ui.equation.ComparisonPalette = function(paletteManager) {
  goog.ui.equation.Palette.call(this, paletteManager,
      goog.ui.equation.Palette.Type.COMPARISON,
      0, 70, 18, 18,
      ['\\leq',
       '\\geq',
       '\\prec',
       '\\succ',
       '\\preceq',
       '\\succeq',
       '\\ll',
       '\\gg',
       '\\equiv',
       '\\sim',
       '\\\simeq',
       '\\\asymp',
       '\\approx',
       '\\ne',
       '\\\subset',
       '\\supset',
       '\\subseteq',
       '\\supseteq',
       '\\in',
       '\\ni',
       '\\notin']);
  this.setSize(new goog.math.Size(7, 3));
};
goog.inherits(goog.ui.equation.ComparisonPalette, goog.ui.equation.Palette);
