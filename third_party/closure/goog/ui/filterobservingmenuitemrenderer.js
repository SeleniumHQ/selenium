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
 * @fileoverview Menu item observing the filter text in a
 * {@link goog.ui.FilteredMenu}. The observer method is called when the filter
 * text changes and allows the menu item to update its content and state based
 * on the filter.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.ui.FilterObservingMenuItemRenderer');

goog.require('goog.ui.MenuItemRenderer');



/**
 * Default renderer for {@link goog.ui.FilterObservingMenuItem}s. Each item has
 * the following structure:
 *
 *    <div class="goog-filterobsmenuitem"><div>...(content)...</div></div>
 *
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 * @final
 */
goog.ui.FilterObservingMenuItemRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};
goog.inherits(
    goog.ui.FilterObservingMenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(goog.ui.FilterObservingMenuItemRenderer);


/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
goog.ui.FilterObservingMenuItemRenderer.CSS_CLASS =
    goog.getCssName('goog-filterobsmenuitem');


/**
 * Returns the CSS class to be applied to menu items rendered using this
 * renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.FilterObservingMenuItemRenderer.prototype.getCssClass = function() {
  return goog.ui.FilterObservingMenuItemRenderer.CSS_CLASS;
};
