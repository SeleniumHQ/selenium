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
 * @fileoverview A class representing menu items that open a submenu.
 * @see goog.ui.Menu
 *
 * @see ../demos/submenus.html
 * @see ../demos/submenus2.html
 */

goog.provide('goog.ui.SubMenu');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.KeyCodes');
goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SubMenuRenderer');
goog.require('goog.ui.registry');



/**
 * Class representing a submenu that can be added as an item to other menus.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the submenu (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional dom helper used for dom
 *     interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.SubMenuRenderer}.
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
goog.ui.SubMenu = function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper,
                        opt_renderer || goog.ui.SubMenuRenderer.getInstance());
};
goog.inherits(goog.ui.SubMenu, goog.ui.MenuItem);


/**
 * The delay before opening the sub menu in milliseconds.  (This number is
 * arbitrary, it would be good to get some user studies or a designer to play
 * with some numbers).
 * @type {number}
 */
goog.ui.SubMenu.MENU_DELAY_MS = 350;


/**
 * Timer used to dismiss the submenu when the item becomes unhighlighted.
 * @type {?number}
 * @private
 */
goog.ui.SubMenu.prototype.dismissTimer_ = null;


/**
 * Timer used to show the submenu on mouseover.
 * @type {?number}
 * @private
 */
goog.ui.SubMenu.prototype.showTimer_ = null;


/**
 * Flag used to determine if the submenu has control of the keyevents.
 * @type {boolean}
 * @private
 */
goog.ui.SubMenu.prototype.hasKeyboardControl_ = false;


/**
 * The lazily created sub menu.
 * @type {goog.ui.Menu?}
 * @private
 */
goog.ui.SubMenu.prototype.subMenu_ = null;


/**
 * Whether or not the sub-menu was set explicitly.
 * @type {boolean}
 * @private
 */
goog.ui.SubMenu.prototype.externalSubMenu_ = false;


/**
 * Whether or not to align the submenu at the end of the parent menu.
 * If true, the menu expands to the right in LTR languages and to the left
 * in RTL langauges.
 * @type {boolean}
 * @private
 */
goog.ui.SubMenu.prototype.alignToEnd_ = true;


/**
 * Whether the position of this submenu may be adjusted to fit
 * the visible area, as in {@link goog.ui.Popup.positionAtCoordinate}.
 * @type {boolean}
 * @private
 */
goog.ui.SubMenu.prototype.isPositionAdjustable_ = false;


/** @inheritDoc */
goog.ui.SubMenu.prototype.enterDocument = function() {
  goog.ui.SubMenu.superClass_.enterDocument.call(this);

  this.getHandler().listen(this.getParent(), goog.ui.Component.EventType.HIDE,
      this.onParentHidden_);

  if (this.subMenu_) {
    this.setMenuListenersEnabled_(this.subMenu_, true);
  }
};


/** @inheritDoc */
goog.ui.SubMenu.prototype.exitDocument = function() {
  this.getHandler().unlisten(this.getParent(), goog.ui.Component.EventType.HIDE,
      this.onParentHidden_);

  if (this.subMenu_) {
    this.setMenuListenersEnabled_(this.subMenu_, false);
    if (!this.externalSubMenu_) {
      this.subMenu_.exitDocument();
      goog.dom.removeNode(this.subMenu_.getElement());
    }
  }

  goog.ui.SubMenu.superClass_.exitDocument.call(this);
};


/** @inheritDoc */
goog.ui.SubMenu.prototype.disposeInternal = function() {
  if (this.subMenu_ && !this.externalSubMenu_) {
    this.subMenu_.dispose();
  }
  this.subMenu_ = null;
  goog.ui.SubMenu.superClass_.disposeInternal.call(this);
};


/**
 * @inheritDoc
 * Dismisses the submenu on a delay, with the result that the user needs less
 * accuracy when moving to submenus.  Alternate implementations could use
 * geometry instead of a timer.
 * @param {boolean} highlight Whether item should be highlighted.
 * @param {boolean=} opt_btnPressed Whether the mouse button is held down.
 */
goog.ui.SubMenu.prototype.setHighlighted = function(highlight,
                                                    opt_btnPressed) {
  goog.ui.SubMenu.superClass_.setHighlighted.call(this, highlight);

  if (opt_btnPressed) {
    this.getMenu().setMouseButtonPressed(true);
  }

  if (!highlight) {
    if (this.dismissTimer_) {
      goog.Timer.clear(this.dismissTimer_);
    }
    this.dismissTimer_ = goog.Timer.callOnce(
        this.dismissSubMenu, goog.ui.SubMenu.MENU_DELAY_MS, this);
  }
};


/**
 * Show the submenu and ensure that all siblings are hidden.
 */
goog.ui.SubMenu.prototype.showSubMenu = function() {
  // Only show the menu if this item is still selected. This is called on a
  // timeout, so make sure our parent still exists.
  var parent = this.getParent();
  if (parent && parent.getHighlighted() == this) {
    this.setSubMenuVisible_(true);
    this.dismissSiblings_();
    this.keyboardSetFocus_ = false;
  }
};


/**
 * Dismisses the menu and all further submenus.
 */
goog.ui.SubMenu.prototype.dismissSubMenu = function() {
  // Because setHighlighted calls this function on a timeout, we need to make
  // sure that the sub menu hasn't been disposed when we come back.
  var subMenu = this.subMenu_;
  if (subMenu && subMenu.getParent() == this) {
    this.setSubMenuVisible_(false);
    subMenu.forEachChild(function(child) {
      if (typeof child.dismissSubMenu == 'function') {
        child.dismissSubMenu();
      }
    });
  }
};


/**
 * Clears the show and hide timers for the sub menu.
 */
goog.ui.SubMenu.prototype.clearTimers = function() {
  if (this.dismissTimer_) {
    goog.Timer.clear(this.dismissTimer_);
  }
  if (this.showTimer_) {
    goog.Timer.clear(this.showTimer_);
  }
};


/**
 * Sets the menu item to be visible or invisible.
 * @param {boolean} visible Whether to show or hide the component.
 * @param {boolean=} opt_force If true, doesn't check whether the component
 *     already has the requested visibility, and doesn't dispatch any events.
 * @return {boolean} Whether the visibility was changed.
 */
goog.ui.SubMenu.prototype.setVisible = function(visible, opt_force) {
  var visibilityChanged = goog.ui.SubMenu.superClass_.setVisible.call(this,
      visible, opt_force);
  // For menus that allow menu items to be hidden (i.e. ComboBox) ensure that
  // the submenu is hidden.
  if (visibilityChanged && !this.isVisible()) {
    this.dismissSubMenu();
  }
  return visibilityChanged;
};


/**
 * Dismiss all the sub menus of sibling menu items.
 * @private
 */
goog.ui.SubMenu.prototype.dismissSiblings_ = function() {
  this.getParent().forEachChild(function(child) {
    if (child != this && typeof child.dismissSubMenu == 'function') {
      child.dismissSubMenu();
      child.clearTimers();
    }
  }, this);
};


/**
 * Handles a key event that is passed to the menu item from its parent because
 * it is highlighted.  If the right key is pressed the sub menu takes control
 * and delegates further key events to its menu until it is dismissed OR the
 * left key is pressed.
 * TODO(user): RTL lookup
 * @param {goog.events.KeyEvent} e A key event.
 * @return {boolean} Whether the event was handled.
 */
goog.ui.SubMenu.prototype.handleKeyEvent = function(e) {
  var keyCode = e.keyCode;

  if (!this.hasKeyboardControl_) {
    // Menu item doesn't have keyboard control and the right key was pressed.
    // So open take keyboard control and open the sub menu.
    if (this.isEnabled() && keyCode == goog.events.KeyCodes.RIGHT) {
      this.showSubMenu();
      this.getMenu().highlightFirst();
      this.clearTimers();

    // The menu item doesn't currently care about the key events so let the
    // parent menu handle them accordingly .
    } else {
      return false;
    }

  // Menu item has control, so let its menu try to handle the keys (this may
  // in turn be handled by sub-sub menus).
  } else if (this.getMenu().handleKeyEvent(e)) {
    // Nothing to do

  // The menu has control and the key hasn't yet been handled, on left arrow
  // we turn off key control.
  } else if (keyCode == goog.events.KeyCodes.LEFT) {
    this.dismissSubMenu();

  } else {
    // Submenu didn't handle the key so let the parent decide what to do.
    return false;
  }

  e.preventDefault();
  return true;
};


/**
 * Listens to the sub menus items and ensures that this menu item is selected
 * while dismissing the others.  This handles the case when the user mouses
 * over other items on their way to the sub menu.
 * @param {goog.events.Event} e Highlight event to handle.
 * @private
 */
goog.ui.SubMenu.prototype.onChildHighlight_ = function(e) {
  if (this.subMenu_.getParent() == this) {
    this.clearTimers();
    this.getParentEventTarget().setHighlighted(this);
    this.dismissSiblings_();
  }
};


/**
 * Listens to the parent menu's hide event and ensures that all submenus are
 * hidden at the same time.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.ui.SubMenu.prototype.onParentHidden_ = function(e) {
  // Ignore propagated events
  if (e.target == this.getParentEventTarget()) {
    // TODO(user): Using an event for this is expensive.  Consider having a
    // generalized interface that the parent menu calls on its children when
    // it is hidden.
    this.dismissSubMenu();
    this.clearTimers();
  }
};


/**
 * @inheritDoc
 * Sets a timer to show the submenu and then dispatches an ENTER event to the
 * parent menu.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @protected
 */
goog.ui.SubMenu.prototype.handleMouseOver = function(e) {
  if (this.isEnabled()) {
    this.clearTimers();
    this.showTimer_ = goog.Timer.callOnce(
        this.showSubMenu, goog.ui.SubMenu.MENU_DELAY_MS, this);
  }
  goog.ui.SubMenu.superClass_.handleMouseOver.call(this, e);
};


/**
 * Overrides the default mouseup event handler, so that the ACTION isn't
 * dispatched for the submenu itself, instead the submenu is shown instantly.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {boolean} True if the action was allowed to proceed, false otherwise.
 */
goog.ui.SubMenu.prototype.performActionInternal = function(e) {
  this.clearTimers();
  var shouldHandleClick = this.isSupportedState(
      goog.ui.Component.State.SELECTED);
  if (shouldHandleClick) {
    return goog.ui.SubMenu.superClass_.performActionInternal.call(this, e);
  } else {
    this.showSubMenu();
    return true;
  }
};


/**
 * Sets the visiblility of the sub menu.
 * @param {boolean} visible Whether to show menu.
 * @private
 */
goog.ui.SubMenu.prototype.setSubMenuVisible_ = function(visible) {
  // Dispatch OPEN event before calling getMenu(), so we can create the menu
  // lazily on first access.
  this.dispatchEvent(goog.ui.Component.getStateTransitionEvent(
      goog.ui.Component.State.OPENED, visible));
  var subMenu = this.getMenu();
  if (visible != subMenu.isVisible()) {
    if (visible) {
      // Lazy-render menu when first shown, if needed.
      if (!subMenu.isInDocument()) {
        subMenu.render();
      }
      this.positionSubMenu_();
      subMenu.setHighlightedIndex(-1);
    }
    this.hasKeyboardControl_ = visible;
    goog.dom.classes.enable(this.getElement(),
        goog.getCssName('goog-submenu-open'), visible);
    subMenu.setVisible(visible);
  }
};


/**
 * Attaches or detaches menu event listeners to/from the given menu.  Called
 * each time a menu is attached to or detached from the submenu.
 * @param {goog.ui.Menu} menu Menu on which to listen for events.
 * @param {boolean} attach Whether to attach or detach event listeners.
 * @private
 */
goog.ui.SubMenu.prototype.setMenuListenersEnabled_ = function(menu, attach) {
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;
  method.call(handler, menu, goog.ui.Component.EventType.HIGHLIGHT,
      this.onChildHighlight_);
};


/**
 * Sets whether the submenu is aligned at the end of the parent menu.
 * @param {boolean} alignToEnd True to align to end, false to align to start.
 */
goog.ui.SubMenu.prototype.setAlignToEnd = function(alignToEnd) {
  if (alignToEnd != this.alignToEnd_) {
    this.alignToEnd_ = alignToEnd;
    if (this.isInDocument()) {
      // Completely re-render the widget.
      var oldElement = this.getElement();
      this.exitDocument();

      if (oldElement.nextSibling) {
        this.renderBefore(/** @type {!Element} */ (oldElement.nextSibling));
      } else {
        this.render(/** @type {Element} */ (oldElement.parentNode));
      }
    }
  }
};


/**
 * Determines whether the submenu is aligned at the end of the parent menu.
 * @return {boolean} True if aligned to the end (the default), false if
 *     aligned to the start.
 */
goog.ui.SubMenu.prototype.isAlignedToEnd = function() {
  return this.alignToEnd_;
};


/**
 * Positions the submenu.
 * @private
 */
goog.ui.SubMenu.prototype.positionSubMenu_ = function() {
  var position = new goog.positioning.AnchoredViewportPosition(
      this.getElement(), this.isAlignedToEnd() ?
      goog.positioning.Corner.TOP_END : goog.positioning.Corner.TOP_START,
      this.isPositionAdjustable_);

  // TODO(user): Clean up popup code and have this be a one line call
  var subMenu = this.getMenu();
  var el = subMenu.getElement();
  if (!subMenu.isVisible()) {
    el.style.visibility = 'hidden';
    goog.style.showElement(el, true);
  }

  position.reposition(
      el, this.isAlignedToEnd() ?
      goog.positioning.Corner.TOP_START : goog.positioning.Corner.TOP_END);

  if (!subMenu.isVisible()) {
    goog.style.showElement(el, false);
    el.style.visibility = 'visible';
  }
};


// Methods delegated to sub-menu but accessible here for convinience


/**
 * Adds a new menu item at the end of the menu.
 * @param {goog.ui.MenuHeader|goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu
 *     item to add to the menu.
 */
goog.ui.SubMenu.prototype.addItem = function(item) {
  this.getMenu().addChild(item, true);
};


/**
 * Adds a new menu item at a specific index in the menu.
 * @param {goog.ui.MenuHeader|goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu
 *     item to add to the menu.
 * @param {number} n Index at which to insert the menu item.
 */
goog.ui.SubMenu.prototype.addItemAt = function(item, n) {
  this.getMenu().addChildAt(item, n, true);
};


/**
 * Removes an item from the menu and disposes it.
 * @param {goog.ui.MenuItem} item The menu item to remove.
 */
goog.ui.SubMenu.prototype.removeItem = function(item) {
  var child = this.getMenu().removeChild(item, true);
  if (child) {
    child.dispose();
  }
};


/**
 * Removes a menu item at a given index in the menu and disposes it.
 * @param {number} n Index of item.
 */
goog.ui.SubMenu.prototype.removeItemAt = function(n) {
  var child = this.getMenu().removeChildAt(n, true);
  if (child) {
    child.dispose();
  }
};


/**
 * Returns a reference to the menu item at a given index.
 * @param {number} n Index of menu item.
 * @return {goog.ui.Component} Reference to the menu item.
 */
goog.ui.SubMenu.prototype.getItemAt = function(n) {
  return this.getMenu().getChildAt(n);
};


/**
 * Returns the number of items in the sub menu (including separators).
 * @return {number} The number of items in the menu.
 */
goog.ui.SubMenu.prototype.getItemCount = function() {
  return this.getMenu().getChildCount();
};


/**
 * Returns the menu items contained in the sub menu.
 * @return {Array.<goog.ui.MenuItem>} An array of menu items.
 * @deprecated Use getItemAt/getItemCount instead.
 */
goog.ui.SubMenu.prototype.getItems = function() {
  return this.getMenu().getItems();
};


/**
 * Gets a reference to the submenu's actual menu.
 * @return {goog.ui.Menu} Reference to the object representing the sub menu.
 */
goog.ui.SubMenu.prototype.getMenu = function() {
  if (!this.subMenu_) {
    this.setMenu(
        new goog.ui.Menu(this.getDomHelper()), /* opt_internal */ true);
  } else if (this.externalSubMenu_ && this.subMenu_.getParent() != this) {
    // Since it is possible for the same popup menu to be attached to multiple
    // submenus, we need to ensure that it has the correct parent event target.
    this.subMenu_.setParent(this);
  }
  // Always create the menu DOM, for backward compatibility.
  if (!this.subMenu_.getElement()) {
    this.subMenu_.createDom();
  }
  return this.subMenu_;
};


/**
 * Sets the submenu to a specific menu.
 * @param {goog.ui.Menu} menu The menu to show when this item is selected.
 * @param {boolean=} opt_internal Whether this menu is an "internal" menu, and
 *     should be disposed of when this object is disposed of.
 */
goog.ui.SubMenu.prototype.setMenu = function(menu, opt_internal) {
  var oldMenu = this.subMenu_;
  if (menu != oldMenu) {
    if (oldMenu) {
      this.dismissSubMenu();
      if (this.isInDocument()) {
        this.setMenuListenersEnabled_(oldMenu, false);
      }
    }

    this.subMenu_ = menu;
    this.externalSubMenu_ = !opt_internal;

    if (menu) {
      menu.setParent(this);
      // There's no need to dispatch a HIDE event during submenu construction.
      menu.setVisible(false, /* opt_force */ true);
      menu.setAllowAutoFocus(false);
      menu.setFocusable(false);
      if (this.isInDocument()) {
        this.setMenuListenersEnabled_(menu, true);
      }
    }
  }
};


/**
 * Returns true if the provided element is to be considered inside the menu for
 * purposes such as dismissing the menu on an event.  This is so submenus can
 * make use of elements outside their own DOM.
 * @param {Element} element The element to test for.
 * @return {boolean} Whether or not the provided element is contained.
 */
goog.ui.SubMenu.prototype.containsElement = function(element) {
  return this.getMenu().containsElement(element);
};


/**
 * @param {boolean} isAdjustable Whether this submenu is adjustable.
 */
goog.ui.SubMenu.prototype.setPositionAdjustable = function(isAdjustable) {
  this.isPositionAdjustable_ = !!isAdjustable;
};


/**
 * @return {boolean} Whether this submenu is adjustable.
 */
goog.ui.SubMenu.prototype.isPositionAdjustable = function() {
  return this.isPositionAdjustable_;
};


// Register a decorator factory function for goog.ui.SubMenus.
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-submenu'),
    function() {
      return new goog.ui.SubMenu(null);
    });
