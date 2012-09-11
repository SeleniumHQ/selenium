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
 * @fileoverview A toolbar separator control.
 *
 * @author attila@google.com (Attila Bodis)
 * @author ssaviano@google.com (Steven Saviano)
 */

goog.provide('goog.ui.ToolbarSeparator');

goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');
goog.require('goog.ui.registry');



/**
 * A separator control for a toolbar.
 *
 * @param {goog.ui.ToolbarSeparatorRenderer=} opt_renderer Renderer to render or
 *    decorate the separator; defaults to
 *     {@link goog.ui.ToolbarSeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Separator}
 */
goog.ui.ToolbarSeparator = function(opt_renderer, opt_domHelper) {
  goog.ui.Separator.call(this, opt_renderer ||
      goog.ui.ToolbarSeparatorRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.ToolbarSeparator, goog.ui.Separator);


// Registers a decorator factory function for toolbar separators.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ToolbarSeparatorRenderer.CSS_CLASS,
    function() {
      return new goog.ui.ToolbarSeparator();
    });
