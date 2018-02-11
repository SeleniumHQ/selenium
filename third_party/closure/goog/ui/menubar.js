// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A base menu bar factory. Can be bound to an existing
 * HTML structure or can generate its own DOM.
 *
 * To decorate, the menu bar should be bound to an element containing children
 * with the classname 'goog-menu-button'.  See menubar.html for example.
 *
 * @see ../demos/menubar.html
 */

goog.provide('goog.ui.menuBar');

goog.require('goog.ui.Container');
goog.require('goog.ui.MenuBarRenderer');


/**
 * The menuBar factory creates a new menu bar.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu bar; defaults to {@link goog.ui.MenuBarRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 * @return {!goog.ui.Container} The created menu bar.
 */
goog.ui.menuBar.create = function(opt_renderer, opt_domHelper) {
  return new goog.ui.Container(
      null, opt_renderer ? opt_renderer : goog.ui.MenuBarRenderer.getInstance(),
      opt_domHelper);
};
