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

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Renderer for toolbar buttons.
 *
 */

goog.provide('goog.ui.ToolbarButtonRenderer');

goog.require('goog.ui.CustomButtonRenderer');


/**
 * Toolbar-specific renderer for {@link goog.ui.Button}s, based on {@link
 * goog.ui.CustomButtonRenderer}.
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
goog.ui.ToolbarButtonRenderer = function() {
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.ToolbarButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(goog.ui.ToolbarButtonRenderer);


/**
 * Default CSS class to be applied to the root element of buttons rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ToolbarButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-toolbar-button');


/**
 * Returns the CSS class to be applied to the root element of buttons rendered
 * using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.ToolbarButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.ToolbarButtonRenderer.CSS_CLASS;
};
