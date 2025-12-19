// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A customized MenuButton for selection of items among lists.
 * Menu contains 'select all' and 'select none' MenuItems for selecting all and
 * no items by default. Other MenuItems can be added by user.
 *
 * The checkbox content fires the action events associated with the 'select all'
 * and 'select none' menu items.
 *
 * @see ../demos/selectionmenubutton.html
 */

goog.provide('goog.ui.SelectionMenuButton');
goog.provide('goog.ui.SelectionMenuButton.SelectionState');

goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.registry');



/**
 * A selection menu button control.  Extends {@link goog.ui.MenuButton}.
 * Menu contains 'select all' and 'select none' MenuItems for selecting all and
 * no items by default. Other MenuItems can be added by user.
 *
 * The checkbox content fires the action events associated with the 'select all'
 * and 'select none' menu items.
 *
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu button; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.ui.MenuItemRenderer=} opt_itemRenderer Optional menu item
 *     renderer.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
goog.ui.SelectionMenuButton = function(
    opt_renderer, opt_itemRenderer, opt_domHelper) {
  goog.ui.MenuButton.call(this, null, null, opt_renderer, opt_domHelper);
  this.initialItemRenderer_ = opt_itemRenderer || null;
};
goog.inherits(goog.ui.SelectionMenuButton, goog.ui.MenuButton);
goog.tagUnsealableClass(goog.ui.SelectionMenuButton);


/**
 * Constants for menu action types.
 * @enum {number}
 */
goog.ui.SelectionMenuButton.SelectionState = {
  ALL: 0,
  SOME: 1,
  NONE: 2
};


/**
 * Select button state
 * @type {goog.ui.SelectionMenuButton.SelectionState}
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.selectionState =
    goog.ui.SelectionMenuButton.SelectionState.NONE;


/**
 * Item renderer used for the first 2 items, 'select all' and 'select none'.
 * @type {goog.ui.MenuItemRenderer}
 * @private
 */
goog.ui.SelectionMenuButton.prototype.initialItemRenderer_;


/**
 * Enables button and embedded checkbox.
 * @param {boolean} enable Whether to enable or disable the button.
 * @override
 */
goog.ui.SelectionMenuButton.prototype.setEnabled = function(enable) {
  goog.ui.SelectionMenuButton.base(this, 'setEnabled', enable);
  this.setCheckboxEnabled(enable);
};


/**
 * Enables the embedded checkbox.
 * @param {boolean} enable Whether to enable or disable the checkbox.
 * @protected
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.ui.SelectionMenuButton.prototype.setCheckboxEnabled = function(enable) {
  this.getCheckboxElement().disabled = !enable;
};


/** @override */
goog.ui.SelectionMenuButton.prototype.handleMouseDown = function(e) {
  if (!this.getDomHelper().contains(
          this.getCheckboxElement(),
          /** @type {Element} */ (e.target))) {
    goog.ui.SelectionMenuButton.superClass_.handleMouseDown.call(this, e);
  }
};


/**
 * Gets the checkbox element. Needed because if decorating html, getContent()
 * may include and comment/text elements in addition to the input element.
 * @return {Element} Checkbox.
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.getCheckboxElement = function() {
  var elements = this.getDomHelper().getElementsByTagNameAndClass(
      goog.dom.TagName.INPUT,
      goog.getCssName('goog-selectionmenubutton-checkbox'),
      this.getContentElement());
  return elements[0];
};


/**
 * Checkbox click handler.
 * @param {goog.events.BrowserEvent} e Checkbox click event.
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.handleCheckboxClick = function(e) {
  if (this.selectionState == goog.ui.SelectionMenuButton.SelectionState.NONE) {
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.ALL);
    if (this.getItemAt(0)) {
      this.getItemAt(0).dispatchEvent(  // 'All' item
          goog.ui.Component.EventType.ACTION);
    }
  } else {
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.NONE);
    if (this.getItemAt(1)) {
      this.getItemAt(1).dispatchEvent(  // 'None' item
          goog.ui.Component.EventType.ACTION);
    }
  }
};


/**
 * Menu action handler to update checkbox checked state.
 * @param {goog.events.Event} e Menu action event.
 * @private
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.ui.SelectionMenuButton.prototype.handleMenuAction_ = function(e) {
  if (e.target.getModel() == goog.ui.SelectionMenuButton.SelectionState.ALL) {
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.ALL);
  } else {
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.NONE);
  }
};


/**
 * Set up events related to the menu items.
 * @private
 */
goog.ui.SelectionMenuButton.prototype.addMenuEvent_ = function() {
  if (this.getItemAt(0) && this.getItemAt(1)) {
    this.getHandler().listen(
        this.getMenu(), goog.ui.Component.EventType.ACTION,
        this.handleMenuAction_);
    this.getItemAt(0).setModel(goog.ui.SelectionMenuButton.SelectionState.ALL);
    this.getItemAt(1).setModel(goog.ui.SelectionMenuButton.SelectionState.NONE);
  }
};


/**
 * Set up events related to the checkbox.
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.addCheckboxEvent = function() {
  this.getHandler().listen(
      this.getCheckboxElement(), goog.events.EventType.CLICK,
      this.handleCheckboxClick);
};


/**
 * Adds the checkbox to the button, and adds 2 items to the menu corresponding
 * to 'select all' and 'select none'.
 * @override
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.createDom = function() {
  goog.ui.SelectionMenuButton.superClass_.createDom.call(this);

  this.createCheckbox();

  /** @desc Text for 'All' button, used to select all items in a list. */
  var MSG_SELECTIONMENUITEM_ALL = goog.getMsg('All');
  /** @desc Text for 'None' button, used to unselect all items in a list. */
  var MSG_SELECTIONMENUITEM_NONE = goog.getMsg('None');

  var itemAll = new goog.ui.MenuItem(
      MSG_SELECTIONMENUITEM_ALL, null, this.getDomHelper(),
      this.initialItemRenderer_);
  var itemNone = new goog.ui.MenuItem(
      MSG_SELECTIONMENUITEM_NONE, null, this.getDomHelper(),
      this.initialItemRenderer_);
  this.addItem(itemAll);
  this.addItem(itemNone);

  this.addCheckboxEvent();
  this.addMenuEvent_();
};


/**
 * Creates and adds the checkbox to the button.
 * @protected
 */
goog.ui.SelectionMenuButton.prototype.createCheckbox = function() {
  var checkbox = this.getDomHelper().createElement(goog.dom.TagName.INPUT);
  checkbox.type = goog.dom.InputType.CHECKBOX;
  checkbox.className = goog.getCssName('goog-selectionmenubutton-checkbox');
  this.setContent(checkbox);
};


/** @override */
goog.ui.SelectionMenuButton.prototype.decorateInternal = function(element) {
  goog.ui.SelectionMenuButton.superClass_.decorateInternal.call(this, element);
  this.addCheckboxEvent();
  this.addMenuEvent_();
};


/** @override */
goog.ui.SelectionMenuButton.prototype.setMenu = function(menu) {
  goog.ui.SelectionMenuButton.superClass_.setMenu.call(this, menu);
  this.addMenuEvent_();
};


/**
 * Set selection state and update checkbox.
 * @param {goog.ui.SelectionMenuButton.SelectionState} state Selection state.
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.ui.SelectionMenuButton.prototype.setSelectionState = function(state) {
  if (this.selectionState != state) {
    var checkbox = this.getCheckboxElement();
    if (state == goog.ui.SelectionMenuButton.SelectionState.ALL) {
      checkbox.checked = true;
      goog.style.setOpacity(checkbox, 1);
    } else if (state == goog.ui.SelectionMenuButton.SelectionState.SOME) {
      checkbox.checked = true;
      // TODO(user): Get UX help to style this
      goog.style.setOpacity(checkbox, 0.5);
    } else {  // NONE
      checkbox.checked = false;
      goog.style.setOpacity(checkbox, 1);
    }
    this.selectionState = state;
  }
};


/**
* Get selection state.
* @return {goog.ui.SelectionMenuButton.SelectionState} Selection state.
*/
goog.ui.SelectionMenuButton.prototype.getSelectionState = function() {
  return this.selectionState;
};


// Register a decorator factory function for goog.ui.SelectionMenuButton.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-selectionmenubutton-button'),
    function() { return new goog.ui.SelectionMenuButton(); });
