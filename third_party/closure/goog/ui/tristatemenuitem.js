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
 * @fileoverview A menu item class that supports three state checkbox semantics.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.ui.TriStateMenuItem');
goog.provide('goog.ui.TriStateMenuItem.State');

goog.require('goog.dom.classes');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.TriStateMenuItemRenderer');
goog.require('goog.ui.registry');



/**
 * Class representing a three state checkbox menu item.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {Object=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.MenuItem}
 *
 * TODO(attila): Figure out how to better integrate this into the
 * goog.ui.Control state management framework.
 */
goog.ui.TriStateMenuItem = function(content, opt_model, opt_domHelper,
    opt_renderer) {
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper,
      opt_renderer || new goog.ui.TriStateMenuItemRenderer());
  this.setCheckable(true);
};
goog.inherits(goog.ui.TriStateMenuItem, goog.ui.MenuItem);


/**
 * Checked states for component.
 * @enum {number}
 */
goog.ui.TriStateMenuItem.State = {
  /**
   * Component is not checked.
   */
  NOT_CHECKED: 0,

  /**
   * Component is partially checked.
   */
  PARTIALLY_CHECKED: 1,

  /**
   * Component is fully checked.
   */
  FULLY_CHECKED: 2
};


/**
 * Menu item's checked state.
 * @type {goog.ui.TriStateMenuItem.State}
 * @private
 */
goog.ui.TriStateMenuItem.prototype.checkState_ =
    goog.ui.TriStateMenuItem.State.NOT_CHECKED;


/**
 * Whether the partial state can be toggled.
 * @type {boolean}
 * @private
 */
goog.ui.TriStateMenuItem.prototype.allowPartial_ = false;


/**
 * @return {goog.ui.TriStateMenuItem.State} The menu item's check state.
 */
goog.ui.TriStateMenuItem.prototype.getCheckedState = function() {
  return this.checkState_;
};


/**
 * Sets the checked state.
 * @param {goog.ui.TriStateMenuItem.State} state The checked state.
 */
goog.ui.TriStateMenuItem.prototype.setCheckedState = function(state) {
  this.setCheckedState_(state);
  this.allowPartial_ =
      state == goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED;
};


/**
 * Sets the checked state and updates the CSS styling. Dispatches a
 * {@code CHECK} or {@code UNCHECK} event prior to changing the component's
 * state, which may be caught and canceled to prevent the component from
 * changing state.
 * @param {goog.ui.TriStateMenuItem.State} state The checked state.
 * @private
 */
goog.ui.TriStateMenuItem.prototype.setCheckedState_ = function(state) {
  if (this.dispatchEvent(state != goog.ui.TriStateMenuItem.State.NOT_CHECKED ?
        goog.ui.Component.EventType.CHECK :
        goog.ui.Component.EventType.UNCHECK)) {
    this.setState(goog.ui.Component.State.CHECKED,
        state != goog.ui.TriStateMenuItem.State.NOT_CHECKED);
    this.checkState_ = state;
    this.updatedCheckedStateClassNames_();
  }
};


/** @override */
goog.ui.TriStateMenuItem.prototype.performActionInternal = function(e) {
  switch (this.getCheckedState()) {
    case goog.ui.TriStateMenuItem.State.NOT_CHECKED:
      this.setCheckedState_(this.allowPartial_ ?
          goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED :
          goog.ui.TriStateMenuItem.State.FULLY_CHECKED);
      break;
    case goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED:
      this.setCheckedState_(goog.ui.TriStateMenuItem.State.FULLY_CHECKED);
      break;
    case goog.ui.TriStateMenuItem.State.FULLY_CHECKED:
      this.setCheckedState_(goog.ui.TriStateMenuItem.State.NOT_CHECKED);
      break;
  }

  var checkboxClass = goog.getCssName(
      this.getRenderer().getCssClass(), 'checkbox');
  var clickOnCheckbox = e.target && goog.dom.classes.has(
      /** @type {Element} */ (e.target), checkboxClass);

  return this.dispatchEvent(clickOnCheckbox || this.allowPartial_ ?
      goog.ui.Component.EventType.CHANGE :
      goog.ui.Component.EventType.ACTION);
};


/**
 * Updates the extra class names applied to the menu item element.
 * @private
 */
goog.ui.TriStateMenuItem.prototype.updatedCheckedStateClassNames_ = function() {
  var renderer = this.getRenderer();
  renderer.enableExtraClassName(
      this, goog.getCssName(renderer.getCssClass(), 'partially-checked'),
      this.getCheckedState() ==
      goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED);
  renderer.enableExtraClassName(
      this, goog.getCssName(renderer.getCssClass(), 'fully-checked'),
      this.getCheckedState() == goog.ui.TriStateMenuItem.State.FULLY_CHECKED);
};


// Register a decorator factory function for goog.ui.TriStateMenuItemRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.TriStateMenuItemRenderer.CSS_CLASS,
    function() {
      // TriStateMenuItem defaults to using TriStateMenuItemRenderer.
      return new goog.ui.TriStateMenuItem(null);
    });
