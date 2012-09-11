// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A menu item class that supports checkbox semantics.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.CheckBoxMenuItem');

goog.require('goog.ui.ControlContent');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.registry');



/**
 * Class representing a checkbox menu item.  This is just a convenience class
 * that extends {@link goog.ui.MenuItem} by making it checkable.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
goog.ui.CheckBoxMenuItem = function(content, opt_model, opt_domHelper) {
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper);
  this.setCheckable(true);
};
goog.inherits(goog.ui.CheckBoxMenuItem, goog.ui.MenuItem);


// Register a decorator factory function for goog.ui.CheckBoxMenuItems.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-checkbox-menuitem'), function() {
  // CheckBoxMenuItem defaults to using MenuItemRenderer.
  return new goog.ui.CheckBoxMenuItem(null);
});
