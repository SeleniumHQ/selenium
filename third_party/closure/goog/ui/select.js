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
 * @fileoverview A class that supports single selection from a dropdown menu,
 * with semantics similar to the native HTML <code>&lt;select&gt;</code>
 * element.
 *
 * @see ../demos/select.html
 */

goog.provide('goog.ui.Select');

goog.require('goog.events.EventType');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.registry');


/**
 * A selection control.  Extends {@link goog.ui.MenuButton} by composing a
 * menu with a selection model, and automatically updating the button's caption
 * based on the current selection.
 *
 * @param {goog.ui.ControlContent} caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 * @param {goog.ui.Menu} opt_menu Menu containing selection options.
 * @param {goog.ui.ButtonRenderer} opt_renderer Renderer used to render or
 *     decorate the control; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
goog.ui.Select = function(caption, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.MenuButton.call(this, caption, opt_menu, opt_renderer, opt_domHelper);
  this.setDefaultCaption(caption);
};
goog.inherits(goog.ui.Select, goog.ui.MenuButton);


/**
 * The selection model controlling the items in the menu.
 * @type {goog.ui.SelectionModel}
 * @private
 */
goog.ui.Select.prototype.selectionModel_ = null;


/**
 * Default caption to be shown when no option is selected.
 * @type {goog.ui.ControlContent}
 * @private
 */
goog.ui.Select.prototype.defaultCaption_ = null;


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.MenuButton#enterDocument}.
 */
goog.ui.Select.prototype.enterDocument = function() {
  goog.ui.Select.superClass_.enterDocument.call(this);
  this.updateCaption_();
};


/**
 * Decorates the given element with this control.  Overrides the superclass
 * implementation by initializing the default caption on the select button.
 * @param {Element} element Element to decorate.
 */
goog.ui.Select.prototype.decorateInternal = function(element) {
  goog.ui.Select.superClass_.decorateInternal.call(this, element);
  var caption = this.getCaption();
  if (caption) {
    // Initialize the default caption.
    this.setDefaultCaption(caption);
  } else {
    // There is no default caption; select the first option.
    this.setSelectedIndex(0);
  }
};


/** @inheritDoc */
goog.ui.Select.prototype.disposeInternal = function() {
  goog.ui.Select.superClass_.disposeInternal.call(this);

  if (this.selectionModel_) {
    this.selectionModel_.dispose();
    this.selectionModel_ = null;
  }

  this.defaultCaption_ = null;
};


/**
 * Handles {@link goog.ui.Component.EventType.ACTION} events dispatched by
 * the menu item clicked by the user.  Updates the selection model, calls
 * the superclass implementation to hide the menu, stops the propagation of
 * the event, and dispatches an ACTION event on behalf of the select control
 * itself.  Overrides {@link goog.ui.MenuButton#handleMenuAction}.
 * @param {goog.events.Event} e Action event to handle.
 */
goog.ui.Select.prototype.handleMenuAction = function(e) {
  this.setSelectedItem(/** @type {goog.ui.MenuItem} */ (e.target));
  goog.ui.Select.superClass_.handleMenuAction.call(this, e);
  e.stopPropagation();
  this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};


/**
 * Handles {@link goog.events.EventType.SELECT} events raised by the
 * selection model when the selection changes.  Updates the contents of the
 * select button.
 * @param {goog.events.Event} e Selection event to handle.
 */
goog.ui.Select.prototype.handleSelectionChange = function(e) {
  var item = this.getSelectedItem();
  goog.ui.Select.superClass_.setValue.call(this, item && item.getValue());
  this.updateCaption_();
};


/**
 * Replaces the menu currently attached to the control (if any) with the given
 * argument, and updates the selection model.  Does nothing if the new menu is
 * the same as the old one.  Overrides {@link goog.ui.MenuButton#setMenu}.
 * @param {goog.ui.Menu} menu New menu to be attached to the menu button.
 * @return {goog.ui.Menu|undefined} Previous menu (undefined if none).
 */
goog.ui.Select.prototype.setMenu = function(menu) {
  // Call superclass implementation to replace the menu.
  var oldMenu = goog.ui.Select.superClass_.setMenu.call(this, menu);

  // Do nothing unless the new menu is different from the current one.
  if (menu != oldMenu) {
    // Clear the old selection model (if any).
    if (this.selectionModel_) {
      this.selectionModel_.clear();
    }

    // Initialize new selection model (unless the new menu is null).
    if (menu) {
      if (this.selectionModel_) {
        menu.forEachChild(function(child, index) {
          this.selectionModel_.addItem(child);
        }, this);
      } else {
        this.createSelectionModel_(menu);
      }
    }
  }

  return oldMenu;
};


/**
 * Returns the default caption to be shown when no option is selected.
 * @return {goog.ui.ControlContent} Default caption.
 */
goog.ui.Select.prototype.getDefaultCaption = function() {
  return this.defaultCaption_;
};


/**
 * Sets the default caption to the given string or DOM structure.
 * @param {goog.ui.ControlContent} caption Default caption to be shown
 *    when no option is selected.
 */
goog.ui.Select.prototype.setDefaultCaption = function(caption) {
  this.defaultCaption_ = caption;
  this.updateCaption_();
};


/**
 * Adds a new menu item at the end of the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to the
 *     menu.
 */
goog.ui.Select.prototype.addItem = function(item) {
  goog.ui.Select.superClass_.addItem.call(this, item);

  if (this.selectionModel_) {
    this.selectionModel_.addItem(item);
  } else {
    this.createSelectionModel_(this.getMenu());
  }
};


/**
 * Adds a new menu item at a specific index in the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to the
 *     menu.
 * @param {number} index Index at which to insert the menu item.
 */
goog.ui.Select.prototype.addItemAt = function(item, index) {
  goog.ui.Select.superClass_.addItemAt.call(this, item, index);

  if (this.selectionModel_) {
    this.selectionModel_.addItemAt(item, index);
  } else {
    this.createSelectionModel_(this.getMenu());
  }
};


/**
 * Removes an item from the menu and disposes it.
 * @param {goog.ui.MenuItem} item The menu item to remove.
 */
goog.ui.Select.prototype.removeItem = function(item) {
  goog.ui.Select.superClass_.removeItem.call(this, item);
  if (this.selectionModel_) {
    this.selectionModel_.removeItem(item);
  }
};


/**
 * Removes a menu item at a given index in the menu and disposes it.
 * @param {number} index Index of item.
 */
goog.ui.Select.prototype.removeItemAt = function(index) {
  goog.ui.Select.superClass_.removeItemAt.call(this, index);
  if (this.selectionModel_) {
    this.selectionModel_.removeItemAt(index);
  }
};


/**
 * Selects the specified option (assumed to be in the select menu), and
 * deselects the previously selected option, if any.  A null argument clears
 * the selection.
 * @param {goog.ui.MenuItem} item Option to be selected (null to clear
 *     the selection).
 */
goog.ui.Select.prototype.setSelectedItem = function(item) {
  if (this.selectionModel_) {
    this.selectionModel_.setSelectedItem(item);
  }
};


/**
 * Selects the option at the specified index, or clears the selection if the
 * index is out of bounds.
 * @param {number} index Index of the option to be selected.
 */
goog.ui.Select.prototype.setSelectedIndex = function(index) {
  if (this.selectionModel_) {
    this.setSelectedItem(
      /** @type {goog.ui.MenuItem} */ (this.selectionModel_.getItemAt(index)));
  }
};


/**
 * Selects the first option found with an associated value equal to the
 * argument, or clears the selection if no such option is found.  A null
 * argument also clears the selection.  Overrides {@link
 * goog.ui.Button#setValue}.
 * @param {Object} value Value of the option to be selected (null to clear
 *     the selection).
 */
goog.ui.Select.prototype.setValue = function(value) {
  if (goog.isDefAndNotNull(value) && this.selectionModel_) {
    for (var i = 0, item; item = this.selectionModel_.getItemAt(i); i++) {
      if (item && typeof item.getValue == 'function' &&
          item.getValue() == value) {
        this.setSelectedItem(/** @type {goog.ui.MenuItem} */ (item));
        return;
      }
    }
  }

  this.setSelectedItem(null);
};


/**
 * Returns the currently selected option.
 * @return {goog.ui.MenuItem} The currently selected option (null if none).
 */
goog.ui.Select.prototype.getSelectedItem = function() {
  return this.selectionModel_ ?
      /** @type {goog.ui.MenuItem} */ (this.selectionModel_.getSelectedItem()) :
      null;
};


/**
 * Returns the index of the currently selected option.
 * @return {number} 0-based index of the currently selected option (-1 if none).
 */
goog.ui.Select.prototype.getSelectedIndex = function() {
  return this.selectionModel_ ? this.selectionModel_.getSelectedIndex() : -1;
};


/**
 * @return {goog.ui.SelectionModel} The selection model.
 * @protected
 */
goog.ui.Select.prototype.getSelectionModel = function() {
  return this.selectionModel_;
};


/**
 * Creates a new selection model and sets up an event listener to handle
 * {@link goog.events.EventType.SELECT} events dispatched by it.
 * @param {goog.ui.Component} opt_component If provided, will add the
 *     component's children as items to the selection model.
 * @private
 */
goog.ui.Select.prototype.createSelectionModel_ = function(opt_component) {
  this.selectionModel_ = new goog.ui.SelectionModel();
  if (opt_component) {
    opt_component.forEachChild(function(child, index) {
      this.selectionModel_.addItem(child);
    }, this);
  }
  this.getHandler().listen(this.selectionModel_, goog.events.EventType.SELECT,
      this.handleSelectionChange);
};


/**
 * Updates the caption to be shown in the select button.  If no option is
 * selected and a default caption is set, sets the caption to the default
 * caption; otherwise to the empty string.
 * @private
 */
goog.ui.Select.prototype.updateCaption_ = function() {
  var item = this.getSelectedItem();
  this.setContent(item ? item.getCaption() : this.defaultCaption_);
};


/**
 * Opens or closes the menu.  Overrides {@link goog.ui.MenuButton#setOpen} by
 * highlighting the currently selected option on open.
 * @param {boolean} open Whether to open or close the menu.
 */
goog.ui.Select.prototype.setOpen = function(open) {
  goog.ui.Select.superClass_.setOpen.call(this, open);

  if (this.isOpen()) {
    this.getMenu().setHighlightedIndex(this.getSelectedIndex());
  }
};


// Register a decorator factory function for goog.ui.Selects.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-select'), function() {
  // Select defaults to using MenuButtonRenderer, since it shares its L&F.
  return new goog.ui.Select(null);
});
