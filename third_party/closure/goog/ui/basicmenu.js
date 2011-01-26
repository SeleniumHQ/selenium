// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A basic menu that accepts a set of items.  The ITEM_EVENT
 * instead of returning the DOM node returns a reference to the menu item.
 *
 * NOTE: This class has been deprecated.  Please use goog.ui.Menu,
 * goog.ui.PopupMenu, and if you need submenus goog.ui.SubMenu.
 *
 *
 */

goog.provide('goog.ui.BasicMenu');
goog.provide('goog.ui.BasicMenu.Item');
goog.provide('goog.ui.BasicMenu.Separator');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.events.EventType');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.ui.AttachableMenu');
goog.require('goog.ui.ItemEvent');



/**
 * Class that extends AttachableMenu and creates a simple menu, purely from
 * code.The ITEM_EVENT instead of returning the DOM node returns a reference the
 * menu item.
 *
 * @param {string=} opt_class Optional class for menu element, Default: 'menu'.
 * @param {Element=} opt_parent Optional parent element, otherwise it will be
 *     added to the end of the document body.
 * @constructor
 * @extends {goog.ui.AttachableMenu}
 */
goog.ui.BasicMenu = function(opt_class, opt_parent) {
  var cls = opt_class || 'menu';
  var parent = opt_parent || goog.dom.getDocument().body;

  /**
   * Menu element
   * @type {Element}
   * @private
   */
  this.element_ = goog.dom.createDom('div', {'tabIndex': 0, 'class': cls});

  goog.dom.a11y.setRole(this.element_, 'menu');
  goog.dom.a11y.setState(this.element_, 'haspopup', true);

  parent.appendChild(this.element_);
  goog.ui.AttachableMenu.call(this, this.element_);

  /**
   * Parent menu
   * @type {goog.ui.BasicMenu}
   * @private
   */
  this.parentMenu_ = null;

  /**
   * Array of menu items
   * @type {Array}
   * @private
   */
  this.items_ = [];

  /**
   * The active item.
   * @type {goog.ui.BasicMenu.Item}
   * @private
   */
  this.activeItem_;
};
goog.inherits(goog.ui.BasicMenu, goog.ui.AttachableMenu);


/**
 * Key for the event used to trigger the menu
 * @type {?number}
 * @private
 */
goog.ui.BasicMenu.prototype.evtKey_ = null;


/**
 * Key for the window resize event listener
 * @type {?number}
 * @private
 */
goog.ui.BasicMenu.prototype.resizeEvtKey_ = null;


/**
 * Z-index used for top level menu.
 * @type {number}
 * @private
 */
goog.ui.BasicMenu.prototype.zIndex_ = 10;


/**
 * A time in ms used to delay opening/closing submenus when the selection
 * changes.
 *
 * @type {number}
 * @private
 */
goog.ui.BasicMenu.SUBMENU_ACTIVATION_DELAY_MS_ = 300;


/**
 * @return {number} The z-index.
 */
goog.ui.BasicMenu.prototype.getZIndex = function() {
  return this.zIndex_;
};


/**
 * Sets the z-index. The change will take effect the next time
 * setVisible(true) is called.
 *
 * @param {number} zIndex The new z-index.
 */
goog.ui.BasicMenu.prototype.setZIndex = function(zIndex) {
  this.zIndex_ = zIndex;
};


/**
 * Add a menu item.
 *
 * @param {goog.ui.BasicMenu.Item} item Menu Item.
 */
goog.ui.BasicMenu.prototype.add = function(item) {
  var el = this.getElement();
  if (!el) {
    throw Error('setElement() called before create()');
  }
  if (item.getMenu()) {
    throw Error('Menu item already added to a menu');
  }

  item.setMenu_(this);
  this.items_.push(item);
  el.appendChild(item.create());
};


/**
 * Add a menu item at a specific index.
 * @param {goog.ui.BasicMenu.Item} item Menu Item.
 * @param {number} index The index to insert at.
 */
goog.ui.BasicMenu.prototype.insertAt = function(item, index) {
  var el = this.getElement();
  if (!el) {
    throw Error('setElement() called before create()');
  }
  if (item.getMenu()) {
    throw Error('Menu item already added to a menu');
  }

  item.setMenu_(this);
  goog.array.insertAt(this.items_, item, index);
  el.insertBefore(item.create(), el.childNodes[index]);
};


/**
 * Remove a menu item.
 * @param {goog.ui.BasicMenu.Item} item Menu Item.
 */
goog.ui.BasicMenu.prototype.remove = function(item) {
  item.remove();
  item.setMenu_(null);
  goog.array.remove(this.items_, item);
};


/**
 * Remove a menu item from a particular index.
 * @param {number} index Index of menu item to remove.
 */
goog.ui.BasicMenu.prototype.removeAt = function(index) {
  this.remove(this.items_[index]);
};


/**
 * Sets focus to the menu's base element.
 */
goog.ui.BasicMenu.prototype.focus = function() {
  this.element_.focus();
};


/**
 * Sets menu's parent menu in case it's a submenu.
 * @param {goog.ui.BasicMenu} parent Parent menu.
 * @private
 */
goog.ui.BasicMenu.prototype.setParentMenu_ = function(parent) {
  this.parentMenu_ = parent;
  this.setParentEventTarget(parent);
};


/**
 * @return {goog.ui.BasicMenu} The menu's parent menu in case it's a submenu.
 */
goog.ui.BasicMenu.prototype.getParentMenu = function() {
  return this.parentMenu_;
};


/**
 * Anchor the menu position to an element, and attach a click event.
 * @param {Element} el Element to anchor menu to.
 * @param {goog.positioning.Corner=} opt_pos Corner: Default Bottom-left.
 * @param {goog.events.EventType=} opt_eventType Event that triggers menu.
 *     Default click.
 */
goog.ui.BasicMenu.prototype.setAnchorElement = function(el, opt_pos,
                                                        opt_eventType) {
  if (this.evtKey_) {
    goog.events.unlistenByKey(this.evtKey_);
  }

  // Reset properties related to showing/hiding the menu as their state is only
  // applicable when bound to the anchor element original triggering the menu.
  if (this.anchorElement_ != el) {
    this.clickToClose_ = false;
    this.lastHideTime_ = -1;
  }

  var eventType = opt_eventType || goog.events.EventType.CLICK;
  this.evtKey_ = goog.events.listen(el, eventType, this.openMenu_, false, this);
  this.resizeEvtKey_ = goog.events.listen(window,
      goog.events.EventType.RESIZE, this.onResize_, false, this);
  this.setPosition(new goog.positioning.AnchoredPosition(el,
      goog.isDef(opt_pos) ? opt_pos : goog.positioning.Corner.BOTTOM_START));
  this.anchorElement_ = el;
};


/** @inheritDoc */
goog.ui.BasicMenu.prototype.disposeInternal = function() {
  for (var i = 0; i < this.items_.length; i++) {
    this.items_[i].dispose();
  }
  goog.events.unlistenByKey(this.evtKey_);
  goog.events.unlistenByKey(this.resizeEvtKey_);
  goog.dom.removeNode(this.element_);
  delete this.element_;
  this.anchorElement_ = null;
  goog.ui.BasicMenu.superClass_.disposeInternal.call(this);
};


/**
 * Sets whether the popup should be visible.
 * @param {boolean} visible Show menu?.
*  @param {boolean=} opt_bubble Bubble to parent menu?.
 */
goog.ui.BasicMenu.prototype.setVisible = function(visible, opt_bubble) {
  // Ignore setVisible(true) if already visible
  if (this.isOrWasRecentlyVisible() && visible) {
    return;
  }

  if (visible == false) {

    // Close submenus recursively. goog.ui.BasicMenu.Item.closeSubmenu calls
    // goog.ui.BasicMenu.setVisible(false) for the submenu.
    if (this.activeItem_) {
      this.activeItem_.closeSubmenu();
      goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, null);
    }

    // Set focus to parent for submenus.
    if (this.parentMenu_ && !opt_bubble) {
      this.parentMenu_.focus();
    }
  }
  else {
    if (this.parentMenu_) {
      this.zIndex_ = this.parentMenu_.getZIndex() + 1;
    }
    this.element_.style.zIndex = this.zIndex_;
  }

  if (opt_bubble && this.parentMenu_) {
    this.parentMenu_.setVisible(visible, opt_bubble);
  }

  // Clear activation timer
  if (this.activationTimer_) {
    window.clearTimeout(this.activationTimer_);
    this.activationTimer_ = null;
  }

  this.activeItem_ = null;
  goog.ui.PopupBase.prototype.setVisible.call(this, visible);
};


/**
 * Select menu item by index.
 * @param {number} index Index of item to select, zero based.
 */
goog.ui.BasicMenu.prototype.setSelectedIndex = function(index) {
  this.setSelectedItem(index == -1 ? null : this.element_.childNodes[index]);
};


/**
 * Select menu item by element reference and active it (open/close submenus)
 * with a slight delay.
 * @param {Element} el Element for item to select.
 * @param {boolean=} opt_keyEvent Was item selected using keyboard? In that case
 *     open submenus are closed immediately and new submenus are not opened
 *     automatically.
 * @private
 */
goog.ui.BasicMenu.prototype.itemSelectionHandler_ = function(el, opt_keyEvent) {
  // Highlight menu item
  if (el || !this.activeItem_ || !this.activeItem_.hasOpenSubmenu()) {
    goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, el);
  }

  var item = el ? this.getItemForElement_(el) : null;

  if (item && item != this.activeItem_) {

    if (opt_keyEvent && this.activeItem_) {
      this.activeItem_.closeSubmenu();
      this.activeItem_ = null;
    }

    // Clear previous timer, if any
    if (this.activationTimer_) {
      window.clearTimeout(this.activationTimer_);
      this.activationTimer_ = null;
    }

    // Call selectItem_ with delay
    if (!opt_keyEvent) {
      this.activationTimer_ = window.setTimeout(
          goog.bind(this.selectItem_, this, item),
          goog.ui.BasicMenu.SUBMENU_ACTIVATION_DELAY_MS_);
    }

    // Select anchor element in parent menu (to prevent submenu from closing).
    if (this.parentMenu_) {
      this.parentMenu_.setSelectedItem(this.anchorElement_);
      this.element_.focus();
    }
  }
};


/**
 * Select menu item by element reference and activate it immediately.
 * @param {Element|goog.ui.BasicMenu.Item} arg Element Item to select or element
 *     for it.
 */
goog.ui.BasicMenu.prototype.setSelectedItem = function(arg) {
  var el, item;
  if (!arg) {
    el = null;
    item = null;
  } else if (arg instanceof goog.ui.BasicMenu.Item) {
    item = arg;
    el = item.element_;
  } else {
    el = arg;
    item = this.getItemForElement_(el);
  }

  if (el || !this.activeItem_ || !this.activeItem_.hasOpenSubmenu()) {
    goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, el);
  }

  if (item == this.activeItem_) {
    return;
  }

  if (this.activeItem_ && el) {
    this.activeItem_.closeSubmenu();
  }

  if (el) {
  // TODO(user): var item declared earlier
    item = this.getItemForElement_(el);
    if (item.hasSubmenu()) {
      item.openSubmenu();
      item.getSubmenu().focus();
    }
    this.activeItem_ = item;
  }
};


/**
 * @return {goog.ui.BasicMenu.Item} The selected item.
 */
goog.ui.BasicMenu.prototype.getSelectedItem = function() {
  return this.selectedElement_ ? this.items_[goog.array.indexOf(
      this.element_.childNodes, this.selectedElement_)] : null;
};


/**
 * Select menu item, triggered by a delayed call from itemSelectionHandler_.
 * Opens submenu associated with selected/active item and/or closes any other
 * open submenus.
 * @param {goog.ui.BasicMenu.Item} item Menu item to select.
 * @private
 */
goog.ui.BasicMenu.prototype.selectItem_ = function(item) {
  // Clear timer
  if (this.activationTimer_) {
    window.clearTimeout(this.activationTimer_);
    this.activationTimer_ = null;
  }

  var selectedItem = this.getItemForElement_(this.selectedElement_);
  if (selectedItem != item) {
    return;
  }

  if (this.activeItem_ && item) {
    this.activeItem_.closeSubmenu();
  }

  if (item.hasSubmenu()) {
    item.openSubmenu();
    item.getSubmenu().focus();
  }
  else {
    this.element_.focus();
  }

  this.activeItem_ = item;
};


/**
 * Activates a menu item, opens submenu or triggers the select event and closes
 * the menu if no submenu is available for item.
 * @param {Element} el Element for item to activate.
 * @private
 */
goog.ui.BasicMenu.prototype.activateItem_ = function(el) {
  var item = this.getItemForElement_(el);

  if (item.hasSubmenu()) {
    item.openSubmenu();
    var submenu = item.getSubmenu();
    submenu.focus();
    this.activeItem_ = item;
  }
  else {
    this.setVisible(false, true);
    this.dispatchEvent(new goog.ui.ItemEvent(
        goog.ui.MenuBase.Events.ITEM_ACTION, this, item));
  }
};


/**
 * Anchor triggered, open menu unless it was just closed by the mousedown part
 * of the click.
 *
 * @private
 */
goog.ui.BasicMenu.prototype.openMenu_ = function() {
  if (!this.clickToClose_) {
    this.setVisible(true);
  }
  this.clickToClose_ = false;
};


/**
 * Returns whether the specified element is contained inside the menu, including
 * open submenus.
 * @param {Element} el Element to check.
 * @return {boolean} Whether the specified element is contained inside the menu,
 *     including open submenus.
 * @private
 */
goog.ui.BasicMenu.prototype.containsElement_ = function(el) {
  if (goog.dom.contains(this.element_, el)) {
    return true;
  }

  if (this.activeItem_ && this.activeItem_.hasSubmenu()) {
    return this.activeItem_.getSubmenu().containsElement_(el);
  }

  return false;
};


/**
 * Mouse down handler for the document on capture phase. Hides the menu.
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
goog.ui.BasicMenu.prototype.onDocumentMouseDown_ = function(e) {
  // Mousedown on anchor element, set clickToClose_ to true to prevent the
  // mouseup event from opening the menu.
  if (this.anchorElement_ == e.target ||
      goog.dom.contains(this.anchorElement_, /** @type {Node} */ (e.target))) {
    this.clickToClose_ = true;
  }

  // Mousedown outside menu, close it.
  var rootMenu = this;
  while (rootMenu.parentMenu_) {
    rootMenu = rootMenu.parentMenu_;
  }
  if (!rootMenu.containsElement_(/** @type {Element} */ (e.target))) {
    this.hide_();
  }
};


/**
 * Mouse over handler for the menu.
 * @param {goog.events.Event} e The event object.
 * @protected
 */
goog.ui.BasicMenu.prototype.onMouseOver = function(e) {
  var eltItem = this.getAncestorMenuItem_(/** @type {Element} */ (e.target));
  if (eltItem == null) {
    return;
  }

  this.itemSelectionHandler_(eltItem);
};


/**
 * Mouse out handler for the menu.
 * @param {goog.events.Event} e The event object.
 * @protected
 */
goog.ui.BasicMenu.prototype.onMouseOut = function(e) {
  var eltItem = this.getAncestorMenuItem_(/** @type {Element} */ (e.target));
  if (eltItem == null) {
    return;
  }

  this.itemSelectionHandler_(null);
};


/**
 * Overloaded document focus handler. Prevents the default action which is to
 * close the menu on focus change, which is not desirable for hierarchical
 * menus.
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.ui.BasicMenu.prototype.onDocumentFocus_ = function(e) {

};


/**
 * Mouse up handler for the menu.
 * @param {goog.events.Event} e The event object.
 * @protected
 */
goog.ui.BasicMenu.prototype.onMouseUp = function(e) {
  var eltItem = this.getAncestorMenuItem_(/** @type {Element} */ (e.target));
  if (eltItem != null) {
    this.activateItem_(eltItem);
  }
};


/**
 * Window resize handler.
 * @private
 */
goog.ui.BasicMenu.prototype.onResize_ = function() {
  if (!this.isDisposed() && this.isVisible()) {
    this.reposition();
  }
};


/**
 * Key down handler for the menu.
 * @param {goog.events.KeyEvent} e The event object.
 * @protected
 */
goog.ui.BasicMenu.prototype.onKeyDown = function(e) {
  var handled = false;

  switch (e.keyCode) {
    case 37: // Left
      if (this.parentMenu_) {
        this.setVisible(false); // setVisible(false) calls focus on the parent
      }
      handled = true;
      break;
    case 39: // Right
      var item = this.getItemForElement_(this.selectedElement_);
     if (this.selectedElement_ && item.hasSubmenu()) {
       this.activateItem_(this.selectedElement_);
       item.getSubmenu().setSelectedIndex(0);
      }
      handled = true;
      break;
    case 40: // Down
      this.itemSelectionHandler_(this.getNextPrevItem(false), true);
      handled = true;
      break;
    case 38: // Up
      this.itemSelectionHandler_(this.getNextPrevItem(true), true);
      handled = true;
      break;
    case 13: // Enter
      if (this.selectedElement_) {
        this.activateItem_(this.selectedElement_);
      }
      handled = true;
      break;
    case 27: // Esc
      this.setVisible(false);
      handled = true;
      break;
  }

  // Prevent the browser's default keydown behaviour when the menu is open,
  // e.g. keyboard scrolling
  if (handled) {
    e.preventDefault();
  }
};


/**
 * Called after the menu is shown.
 * @protected
 * @suppress {underscore}
 * @override
 */
goog.ui.BasicMenu.prototype.onShow_ = function() {
  goog.ui.BasicMenu.superClass_.onShow_.call(this);
  this.setSelectedItem(null);

  var rtl = goog.style.isRightToLeft(this.element_);
  goog.dom.classes.enable(this.element_, goog.getCssName('goog-rtl'), rtl);

  if (!this.parentMenu_) {
    this.element_.focus();
  }
};


/**
 * Returns the menu item a given element is associated with.
 * @param {Element} el Element.
 * @return {goog.ui.BasicMenu.Item} The menu item a given element is associated
 *     with.
 * @private
 */
goog.ui.BasicMenu.prototype.getItemForElement_ = function(el) {
  var index = -1;
  for (var node = el; node; node = goog.dom.getPreviousElementSibling(node)) {
    index++;
  }
  return index == -1 ? null : this.items_[index];
};



/**
 * A menu item
 *
 * @param {?string} caption Html caption that gets shown in the menu.
 * @param {Object=} opt_value The value that gets returned in the ItemEvent.
 * @param {goog.ui.BasicMenu=} opt_submenu Optional menu that this item is the
 *    anchor for.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.BasicMenu.Item = function(caption, opt_value, opt_submenu) {
  goog.Disposable.call(this);

  /**
   * HTML Caption that gets displayed in the menu
   * @type {string}
   * @private
   */
  this.caption_ = String(caption);

  /**
   * Value associated with the menu option.
   * @type {*}
   * @private
   */
  this.value_ = opt_value || caption;

  /**
   * Reference to the sub menu that this item is the anchor for.
   * @type {goog.ui.BasicMenu}
   * @private
   */
  this.submenu_ = opt_submenu || null;

  /**
   * Reference to the menu that this item is attached to.
   * @type {goog.ui.BasicMenu}
   * @private
   */
  this.menu_ = null;

  /**
   * Menu item element
   * @type {Element}
   * @private
   */
  this.element_ = null;
};
goog.inherits(goog.ui.BasicMenu.Item, goog.Disposable);


/**
 * @return {string} The caption.
 */
goog.ui.BasicMenu.Item.prototype.getCaption = function() {
  return this.caption_;
};


/**
 * @return {*} The value associated with menu item.
 */
goog.ui.BasicMenu.Item.prototype.getValue = function() {
  return this.value_;
};


/**
 * Updates caption.
 * @param {string} caption Desired caption.
 */
goog.ui.BasicMenu.Item.prototype.setCaption = function(caption) {
  this.caption_ = caption;
  if (this.element_) {
    this.element_.firstChild.nodeValue = caption;
  }
};


/**
 * Sets value associated with menu item.
 * @param {Object} value Desired value.
 */
goog.ui.BasicMenu.Item.prototype.setValue = function(value) {
  this.value_ = value;
};


/** @inheritDoc */
goog.ui.BasicMenu.Item.prototype.disposeInternal = function() {
  goog.ui.BasicMenu.Item.superClass_.disposeInternal.call(this);
  this.remove();
  if (this.submenu_) {
    this.submenu_.dispose();
  }
};


/**
 * Set the parent menu for this menu item.
 * @param {goog.ui.BasicMenu} menu Parent menu.
 * @private
 */
goog.ui.BasicMenu.Item.prototype.setMenu_ = function(menu) {
  this.menu_ = menu;
  if (this.submenu_) {
    this.submenu_.setParentMenu_(menu);
  }
};


/**
 * @return {goog.ui.BasicMenu} The parent menu for this menu item.
 * @protected
 */
goog.ui.BasicMenu.Item.prototype.getMenu = function() {
  return this.menu_;
};


/**
 * Returns the DOM element(s) for the menu item.  Should be treated as package
 * scope.
 * @return {Element} The DOM element(s) for the menu item.
 */
goog.ui.BasicMenu.Item.prototype.create = function() {
  if (!this.menu_) {
    throw Error('MenuItem is not attached to a menu');
  }
  var leftArrow, rightArrow;
  if (this.submenu_) {
    rightArrow = goog.dom.createDom('span',
        goog.getCssName('goog-menu-arrow-right'), '\u25b6');
    leftArrow = goog.dom.createDom('span',
        goog.getCssName('goog-menu-arrow-left'), '\u25c0');
  }

  this.element_ = goog.dom.createDom('div', this.menu_.getItemClassName(),
      this.caption_, leftArrow, rightArrow);

  return this.element_;
};


/**
 * Removes DOM element(s) for item.
 */
goog.ui.BasicMenu.Item.prototype.remove = function() {
  goog.dom.removeNode(this.element_);
  this.element_ = null;
};


/**
 * @return {boolean} Whether the menu item has has submenu.
 */
goog.ui.BasicMenu.Item.prototype.hasSubmenu = function() {
  return this.submenu_ != null;
};


/**
 * @return {boolean} Whether the menu item has has submenu that's open.
 */
goog.ui.BasicMenu.Item.prototype.hasOpenSubmenu = function() {
  return this.hasSubmenu() ? this.submenu_.isOrWasRecentlyVisible() : false;
};


/**
 * @return {goog.ui.BasicMenu} The submenu associated with the item.
 */
goog.ui.BasicMenu.Item.prototype.getSubmenu = function() {
  return this.submenu_;
};


/**
 * Opens the item's submenu.
 */
goog.ui.BasicMenu.Item.prototype.openSubmenu = function() {
  if (this.submenu_) {
    var submenu = this.submenu_;

    // If the submenu is pinned at a TOP position, infer
    // that we want to anchor at the opposite corresponding
    // absolute/relative horizontal position.
    var pinComplement = goog.positioning.flipCornerHorizontal(
        submenu.getPinnedCorner());
    submenu.setAnchorElement(this.element_, pinComplement);
    submenu.setVisible(true);
  }
};


/**
 * Closes the item's submenu.
 */
goog.ui.BasicMenu.Item.prototype.closeSubmenu = function() {
  if (this.submenu_) {
    this.submenu_.setVisible(false);
  }
};



/**
 * A menu separator
 *
 * @constructor
 * @extends {goog.ui.BasicMenu.Item}
 */
goog.ui.BasicMenu.Separator = function() {
  goog.ui.BasicMenu.Item.call(this, null);
};
goog.inherits(goog.ui.BasicMenu.Separator, goog.ui.BasicMenu.Item);


/**
 * Returns the DOM element(s) for the separator.  Should be treated as having
 * package scope.
 * @return {Element} The DOM element(s) for the separator.
 */
goog.ui.BasicMenu.Separator.prototype.create = function() {
  if (!this.menu_) {
    throw Error('MenuSeparator is not attached to a menu');
  }
  this.element_ = goog.dom.createElement('hr');
  goog.dom.a11y.setRole(this.element_, 'separator');
  return this.element_;
};
