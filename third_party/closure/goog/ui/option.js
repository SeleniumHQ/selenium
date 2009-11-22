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
 * @fileoverview A menu item class that supports selection state.
 *
 */

goog.provide('goog.ui.Option');

goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.registry');


/**
 * Class representing a menu option.  This is just a convenience class that
 * extends {@link goog.ui.MenuItem} by making it selectable.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
goog.ui.Option = function(content, opt_model, opt_domHelper) {
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper);
  this.setSelectable(true);
};
goog.inherits(goog.ui.Option, goog.ui.MenuItem);


/**
 * Performs the appropriate action when the option is activated by the user.
 * Overrides the superclass implementation by not changing the selection state
 * of the option and not dispatching any SELECTED events, for backwards
 * compatibility with existing uses of this class.
 * @param {goog.events.Event} e Mouse or key event that triggered the action.
 * @return {boolean} True if the action was allowed to proceed, false otherwise.
 */
goog.ui.Option.prototype.performActionInternal = function(e) {
  return this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};


// Register a decorator factory function for goog.ui.Options.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-option'), function() {
  // Option defaults to using MenuItemRenderer.
  return new goog.ui.Option(null);
});
