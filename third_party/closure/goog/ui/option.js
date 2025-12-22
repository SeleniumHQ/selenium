/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A menu item class that supports selection state.
 */

goog.provide('goog.ui.Option');

goog.require('goog.ui.Component');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.events.Event');
goog.requireType('goog.ui.ControlContent');



/**
 * Class representing a menu option.  This is just a convenience class that
 * extends {@link goog.ui.MenuItem} by making it selectable.
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
goog.ui.Option = function(content, opt_model, opt_domHelper) {
  'use strict';
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
 * @override
 */
goog.ui.Option.prototype.performActionInternal = function(e) {
  'use strict';
  return this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};


// Register a decorator factory function for goog.ui.Options.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-option'), function() {
      'use strict';
      // Option defaults to using MenuItemRenderer.
      return new goog.ui.Option(null);
    });
