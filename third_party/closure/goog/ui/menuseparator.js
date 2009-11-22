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

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class for representing menu separators.
 * @see goog.ui.Menu
 *
 */

goog.provide('goog.ui.MenuSeparator');

goog.require('goog.ui.MenuSeparatorRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.registry');


/**
 * Class representing a menu separator.  A menu separator extends {@link
 * goog.ui.Separator} by always setting its renderer to {@link
 * goog.ui.MenuSeparatorRenderer}.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @constructor
 * @extends {goog.ui.Separator}
 */
goog.ui.MenuSeparator = function(opt_domHelper) {
  goog.ui.Separator.call(this, goog.ui.MenuSeparatorRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.MenuSeparator, goog.ui.Separator);


// Register a decorator factory function for goog.ui.MenuSeparators.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuSeparatorRenderer.CSS_CLASS,
    function() {
      // Separator defaults to using MenuSeparatorRenderer.
      return new goog.ui.Separator();
    });
