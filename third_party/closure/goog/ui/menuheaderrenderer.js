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
 * @fileoverview Renderer for {@link goog.ui.MenuHeader}s.
 *
 */

goog.provide('goog.ui.MenuHeaderRenderer');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.ui.ControlRenderer');



/**
 * Renderer for menu headers.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.MenuHeaderRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.MenuHeaderRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuHeaderRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.MenuHeaderRenderer.CSS_CLASS = goog.getCssName('goog-menuheader');


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.MenuHeaderRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuHeaderRenderer.CSS_CLASS;
};
