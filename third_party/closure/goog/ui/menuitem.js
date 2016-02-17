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
 * @fileoverview A class for representing items in menus.
 * @see goog.ui.Menu
 *
 * @author attila@google.com (Attila Bodis)
 * @see ../demos/menuitem.html
 */

goog.provide('goog.ui.MenuItem');

goog.require('goog.a11y.aria.Role');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.math.Coordinate');
goog.require('goog.string');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.MenuItemRenderer');
goog.require('goog.ui.registry');



/**
 * Class representing an item in a menu.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.MenuItem = function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(
      this, content, opt_renderer || goog.ui.MenuItemRenderer.getInstance(),
      opt_domHelper);
  this.setValue(opt_model);
};
goog.inherits(goog.ui.MenuItem, goog.ui.Control);
goog.tagUnsealableClass(goog.ui.MenuItem);


/**
 * The access key for this menu item. This key allows the user to quickly
 * trigger this item's action with they keyboard. For example, setting the
 * mnenomic key to 70 (F), when the user opens the menu and hits "F," the
 * menu item is triggered.
 *
 * @type {goog.events.KeyCodes}
 * @private
 */
goog.ui.MenuItem.prototype.mnemonicKey_;


/**
 * The class set on an element that contains a parenthetical mnemonic key hint.
 * Parenthetical hints are added to items in which the mnemonic key is not found
 * within the menu item's caption itself. For example, if you have a menu item
 * with the caption "Record," but its mnemonic key is "I", the caption displayed
 * in the menu will appear as "Record (I)".
 *
 * @type {string}
 * @private
 */
goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_ =
    goog.getCssName('goog-menuitem-mnemonic-separator');


/**
 * The class set on an element that contains a keyboard accelerator hint.
 * @type {string}
 */
goog.ui.MenuItem.ACCELERATOR_CLASS = goog.getCssName('goog-menuitem-accel');


// goog.ui.Component and goog.ui.Control implementation.


/**
 * Returns the value associated with the menu item.  The default implementation
 * returns the model object associated with the item (if any), or its caption.
 * @return {*} Value associated with the menu item, if any, or its caption.
 */
goog.ui.MenuItem.prototype.getValue = function() {
  var model = this.getModel();
  return model != null ? model : this.getCaption();
};


/**
 * Sets the value associated with the menu item.  The default implementation
 * stores the value as the model of the menu item.
 * @param {*} value Value to be associated with the menu item.
 */
goog.ui.MenuItem.prototype.setValue = function(value) {
  this.setModel(value);
};


/** @override */
goog.ui.MenuItem.prototype.setSupportedState = function(state, support) {
  goog.ui.MenuItem.base(this, 'setSupportedState', state, support);
  switch (state) {
    case goog.ui.Component.State.SELECTED:
      this.setSelectableInternal_(support);
      break;
    case goog.ui.Component.State.CHECKED:
      this.setCheckableInternal_(support);
      break;
  }
};


/**
 * Sets the menu item to be selectable or not.  Set to true for menu items
 * that represent selectable options.
 * @param {boolean} selectable Whether the menu item is selectable.
 */
goog.ui.MenuItem.prototype.setSelectable = function(selectable) {
  this.setSupportedState(goog.ui.Component.State.SELECTED, selectable);
};


/**
 * Sets the menu item to be selectable or not.
 * @param {boolean} selectable  Whether the menu item is selectable.
 * @private
 */
goog.ui.MenuItem.prototype.setSelectableInternal_ = function(selectable) {
  if (this.isChecked() && !selectable) {
    this.setChecked(false);
  }

  var element = this.getElement();
  if (element) {
    this.getRenderer().setSelectable(this, element, selectable);
  }
};


/**
 * Sets the menu item to be checkable or not.  Set to true for menu items
 * that represent checkable options.
 * @param {boolean} checkable Whether the menu item is checkable.
 */
goog.ui.MenuItem.prototype.setCheckable = function(checkable) {
  this.setSupportedState(goog.ui.Component.State.CHECKED, checkable);
};


/**
 * Sets the menu item to be checkable or not.
 * @param {boolean} checkable Whether the menu item is checkable.
 * @private
 */
goog.ui.MenuItem.prototype.setCheckableInternal_ = function(checkable) {
  var element = this.getElement();
  if (element) {
    this.getRenderer().setCheckable(this, element, checkable);
  }
};


/**
 * Returns the text caption of the component while ignoring accelerators.
 * @override
 */
goog.ui.MenuItem.prototype.getCaption = function() {
  var content = this.getContent();
  if (goog.isArray(content)) {
    var acceleratorClass = goog.ui.MenuItem.ACCELERATOR_CLASS;
    var mnemonicWrapClass = goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_;
    var caption =
        goog.array
            .map(
                content,
                function(node) {
                  if (goog.dom.isElement(node) &&
                      (goog.dom.classlist.contains(
                           /** @type {!Element} */ (node), acceleratorClass) ||
                       goog.dom.classlist.contains(
                           /** @type {!Element} */ (node),
                           mnemonicWrapClass))) {
                    return '';
                  } else {
                    return goog.dom.getRawTextContent(node);
                  }
                })
            .join('');
    return goog.string.collapseBreakingSpaces(caption);
  }
  return goog.ui.MenuItem.superClass_.getCaption.call(this);
};


/**
 * @return {?string} The keyboard accelerator text, or null if the menu item
 *     doesn't have one.
 */
goog.ui.MenuItem.prototype.getAccelerator = function() {
  var dom = this.getDomHelper();
  var content = this.getContent();
  if (goog.isArray(content)) {
    var acceleratorEl = goog.array.find(content, function(e) {
      return goog.dom.classlist.contains(
          /** @type {!Element} */ (e), goog.ui.MenuItem.ACCELERATOR_CLASS);
    });
    if (acceleratorEl) {
      return dom.getTextContent(acceleratorEl);
    }
  }
  return null;
};


/** @override */
goog.ui.MenuItem.prototype.handleMouseUp = function(e) {
  var parentMenu = /** @type {goog.ui.Menu} */ (this.getParent());

  if (parentMenu) {
    var oldCoords = parentMenu.openingCoords;
    // Clear out the saved opening coords immediately so they're not used twice.
    parentMenu.openingCoords = null;

    if (oldCoords && goog.isNumber(e.clientX)) {
      var newCoords = new goog.math.Coordinate(e.clientX, e.clientY);
      if (goog.math.Coordinate.equals(oldCoords, newCoords)) {
        // This menu was opened by a mousedown and we're handling the consequent
        // mouseup. The coords haven't changed, meaning this was a simple click,
        // not a click and drag. Don't do the usual behavior because the menu
        // just popped up under the mouse and the user didn't mean to activate
        // this item.
        return;
      }
    }
  }

  goog.ui.MenuItem.base(this, 'handleMouseUp', e);
};


/** @override */
goog.ui.MenuItem.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == this.getMnemonic() && this.performActionInternal(e)) {
    return true;
  } else {
    return goog.ui.MenuItem.base(this, 'handleKeyEventInternal', e);
  }
};


/**
 * Sets the mnemonic key code. The mnemonic is the key associated with this
 * action.
 * @param {goog.events.KeyCodes} key The key code.
 */
goog.ui.MenuItem.prototype.setMnemonic = function(key) {
  this.mnemonicKey_ = key;
};


/**
 * Gets the mnemonic key code. The mnemonic is the key associated with this
 * action.
 * @return {goog.events.KeyCodes} The key code of the mnemonic key.
 */
goog.ui.MenuItem.prototype.getMnemonic = function() {
  return this.mnemonicKey_;
};


// Register a decorator factory function for goog.ui.MenuItems.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuItemRenderer.CSS_CLASS, function() {
      // MenuItem defaults to using MenuItemRenderer.
      return new goog.ui.MenuItem(null);
    });


/**
 * @override
 */
goog.ui.MenuItem.prototype.getPreferredAriaRole = function() {
  if (this.isSupportedState(goog.ui.Component.State.CHECKED)) {
    return goog.a11y.aria.Role.MENU_ITEM_CHECKBOX;
  }
  if (this.isSupportedState(goog.ui.Component.State.SELECTED)) {
    return goog.a11y.aria.Role.MENU_ITEM_RADIO;
  }
  return goog.ui.MenuItem.base(this, 'getPreferredAriaRole');
};


/**
 * @override
 * @return {goog.ui.Menu}
 */
goog.ui.MenuItem.prototype.getParent = function() {
  return /** @type {goog.ui.Menu} */ (
      goog.ui.Control.prototype.getParent.call(this));
};


/**
 * @override
 * @return {goog.ui.Menu}
 */
goog.ui.MenuItem.prototype.getParentEventTarget = function() {
  return /** @type {goog.ui.Menu} */ (
      goog.ui.Control.prototype.getParentEventTarget.call(this));
};
