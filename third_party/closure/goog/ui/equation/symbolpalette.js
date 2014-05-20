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

/**
 * @fileoverview A palette of symbols.
 *
 */

goog.provide('goog.ui.equation.SymbolPalette');

goog.require('goog.math.Size');
goog.require('goog.ui.equation.Palette');



/**
 * Constructs a new symbols palette.
 * @param {goog.ui.equation.PaletteManager} paletteManager The
 *     manager of the palette.
 * @extends {goog.ui.equation.Palette}
 * @constructor
 * @final
 */
goog.ui.equation.SymbolPalette = function(paletteManager) {
  goog.ui.equation.Palette.call(this, paletteManager,
      goog.ui.equation.Palette.Type.SYMBOL,
      0, 50, 18, 18,
      ['\\times',
       '\\div',
       '\\cdot',
       '\\pm',
       '\\mp',
       '\\ast',
       '\\star',
       '\\circ',
       '\\bullet',
       '\\oplus',
       '\\ominus',
       '\\oslash',
       '\\otimes',
       '\\odot',
       '\\dagger',
       '\\ddagger',
       '\\vee',
       '\\wedge',
       '\\cap',
       '\\cup',
       '\\aleph',
       '\\Re',
       '\\Im',
       '\\top',
       '\\bot',
       '\\infty',
       '\\partial',
       '\\forall',
       '\\exists',
       '\\neg',
       '\\angle',
       '\\triangle',
       '\\diamond']);

  this.setSize(new goog.math.Size(7, 5));
};
goog.inherits(goog.ui.equation.SymbolPalette, goog.ui.equation.Palette);
