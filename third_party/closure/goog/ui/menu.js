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
 * @fileoverview A base menu class that supports key and mouse events. The menu
 * can be bound to an existing HTML structure or can generate its own DOM.
 *
 * To decorate, the menu should be bound to an element containing children
 * with the classname 'goog-menuitem'.  HRs will be classed as separators.
 *
 * Decorate Example:
 * <div id="menu" class="goog-menu" tabIndex="0">
 *   <div class="goog-menuitem">Google</div>
 *   <div class="goog-menuitem">Yahoo</div>
 *   <div class="goog-menuitem">MSN</div>
 *   <hr>
 *   <div class="goog-menuitem">New...</div>
 * </div>
 * <script>
 *
 * var menu = new goog.ui.Menu();
 * menu.decorate(goog.dom.getElement('menu'));
 *
 * TESTED=FireFox 2.0, IE6, Opera 9, Chrome.
 * TODO: Key handling is flaky in Opera and Chrome
 * TODO: Rename all references of "item" to child since menu is
 * essentially very generic and could, in theory, host a date or color picker.
 *
 * @see ../demos/menu.html
 * @see ../demos/menus.html
 */

goog.provide('goog.ui.Menu');
goog.provide('goog.ui.Menu.EventType');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.Container');
goog.require('goog.ui.Container.Orientation');
// The following dependencies (MenuItem & MenuSeparator) are implicit.
// There are no references in the code, but we need to load these
// classes before goog.ui.Menu.
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.MenuSeparator');


// TODO: Reverse constructor argument order for consistency.
/**
 * A basic menu class.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @param {goog.ui.MenuRenderer} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Container}
 */
goog.ui.Menu = function(opt_domHelper, opt_renderer) {
  goog.ui.Container.call(this, goog.ui.Container.Orientation.VERTICAL,
      opt_renderer || goog.ui.MenuRenderer.getInstance(), opt_domHelper);

  // Unlike Containers, Menus aren't keyboard-accessible by default.  This line
  // preserves backwards compatibility with code that depends on menus not
  // receiving focus - e.g. {@code goog.ui.MenuButton}.
  this.setFocusable(false);
};
goog.inherits(goog.ui.Menu, goog.ui.Container);


// TODO: Remove this and all references to it.
// Please ensure that BEFORE_SHOW behavior is not disrupted as a result.
/**
 * Event types dispatched by the menu.
 * @enum {string}
 * @deprecated Use goog.ui.Component.EventType.
 */
goog.ui.Menu.EventType = {
  /** Dispatched before the menu becomes visible */
  BEFORE_SHOW: goog.ui.Component.EventType.BEFORE_SHOW,

  /** Dispatched when the menu is shown */
  SHOW: goog.ui.Component.EventType.SHOW,

  /** Dispatched before the menu becomes hidden */
  BEFORE_HIDE: goog.ui.Component.EventType.HIDE,

  /** Dispatched when the menu is hidden */
  HIDE: goog.ui.Component.EventType.HIDE
};


// TODO: Remove this and all references to it.
/**
 * CSS class for menus.
 * @type {string}
 * @deprecated Use goog.ui.MenuRenderer.CSS_CLASS.
 */
goog.ui.Menu.CSS_CLASS = goog.ui.MenuRenderer.CSS_CLASS;


/**
 * Whether the menu can move the focus to it's key event target when it is
 * shown.  Default = true
 * @type {boolean}
 * @private
 */
goog.ui.Menu.prototype.allowAutoFocus_ = true;


/**
 * Whether the menu should use windows syle behavior and allow disabled menu
 * items to be highlighted (though not selectable).  Defaults to false
 * @type {boolean}
 * @private
 */
goog.ui.Menu.prototype.allowHighlightDisabled_ = false;


/**
 * Returns the CSS class applied to menu elements, also used as the prefix for
 * derived styles, if any.  Subclasses should override this method as needed.
 * Considered protected.
 * @return {string} The CSS class applied to menu elements.
 * @protected
 * @deprecated Use getRenderer().getCssClass().
 */
goog.ui.Menu.prototype.getCssClass = function() {
  return this.getRenderer().getCssClass();
};


/**
 * Returns whether the provided element is to be considered inside the menu for
 * purposes such as dismissing the menu on an event.  This is so submenus can
 * make use of elements outside their own DOM.
 * @param {Element} element The element to test for.
 * @return {boolean} Whether the provided element is to be considered inside
 *     the menu.
 */
goog.ui.Menu.prototype.containsElement = function(element) {
  if (this.getRenderer().containsElement(this, element)) {
    return true;
  }

  for (var i = 0, count = this.getChildCount(); i < count; i++) {
    var child = this.getChildAt(i);
    if (typeof child.containsElement == 'function' &&
        child.containsElement(element)) {
      return true;
    }
  }

  return false;
};


/**
 * Adds a new menu item at the end of the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to
 *     the menu.
 * @deprecated Use {@link #addChild} instead.
 */
goog.ui.Menu.prototype.addItem = function(item) {
  this.addChild(item, true);
};


/**
 * Adds a new menu item at a specific index in the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to the
 *     menu.
 * @param {number} n Index at which to insert the menu item.
 * @deprecated Use {@link #addChildAt} instead.
 */
goog.ui.Menu.prototype.addItemAt = function(item, n) {
  this.addChildAt(item, n, true);
};


/**
 * Removes an item from the menu and disposes of it.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item The menu item to remove.
 * @deprecated Use {@link #removeChild} instead.
 */
goog.ui.Menu.prototype.removeItem = function(item) {
  var removedChild = this.removeChild(item, true);
  if (removedChild) {
    removedChild.dispose();
  }
};


/**
 * Removes a menu item at a given index in the menu and disposes of it.
 * @param {number} n Index of item.
 * @deprecated Use {@link #removeChildAt} instead.
 */
goog.ui.Menu.prototype.removeItemAt = function(n) {
  var removedChild = this.removeChildAt(n, true);
  if (removedChild) {
    removedChild.dispose();
  }
};


/**
 * Returns a reference to the menu item at a given index.
 * @param {number} n Index of menu item.
 * @return {goog.ui.MenuItem|goog.ui.MenuSeparator|null} Reference to the menu
 *     item.
 * @deprecated Use {@link #getChildAt} instead.
 */
goog.ui.Menu.prototype.getItemAt = function(n) {
  return /** @type {goog.ui.MenuItem?} */(this.getChildAt(n));
};


/**
 * Returns the number of items in the menu (including separators).
 * @return {number} The number of items in the menu.
 * @deprecated Use {@link #getChildCount} instead.
 */
goog.ui.Menu.prototype.getItemCount = function() {
  return this.getChildCount();
};


/**
 * Returns the menu items contained in the menu.
 * @return {Array.<goog.ui.MenuItem>} An array of menu items.
 * @deprecated Use getChildAt, forEachChild, and getChildCount.
 */
goog.ui.Menu.prototype.getItems = function() {
  // TODO: Remove reference to getItems and instead use getChildAt,
  // forEachChild, and getChildCount
  return this.children_ || [];
};


/**
 * Sets the position of the menu relative to the view port.
 * @param {number|goog.math.Coordinate} x Left position or coordinate obj.
 * @param {number} opt_y Top position.
 */
goog.ui.Menu.prototype.setPosition = function(x, opt_y) {
  // NOTE: It is necessary to temporarily set the display from none, so
  // that the position gets set correctly.
  var visible = this.isVisible();
  if (!visible) {
    goog.style.showElement(this.getElement(), true);
  }
  goog.style.setPageOffset(this.getElement(), x, opt_y);
  if (!visible) {
    goog.style.showElement(this.getElement(), false);
  }
};


/**
 * Gets the page offset of the menu, or null if the menu isn't visible
 * @return {goog.math.Coordinate?} Object holding the x-y coordinates of the
 *     menu or null if the menu is not visible.
 */
goog.ui.Menu.prototype.getPosition = function() {
  return this.isVisible() ? goog.style.getPageOffset(this.getElement()) : null;
};


/**
 * Sets whether the menu can automatically move focus to its key event target
 * when it is set to visible.
 * @param {boolean} allow Whether the menu can automatically move focus to its
 *     key event target when it is set to visible.
 */
goog.ui.Menu.prototype.setAllowAutoFocus = function(allow) {
  this.allowAutoFocus_ = allow;
  if (allow) {
    this.setFocusable(true);
  }
};


/**
 * @return {boolean} Whether the menu can automatically move focus to its key
 *     event target when it is set to visible.
 */
goog.ui.Menu.prototype.getAllowAutoFocus = function() {
  return this.allowAutoFocus_;
};


/**
 * Sets whether the menu will highlight disabled menu items or skip to the next
 * active item.
 * @param {boolean} allow Whether the menu will highlight disabled menu items or
 *     skip to the next active item.
 */
goog.ui.Menu.prototype.setAllowHighlightDisabled = function(allow) {
  this.allowHighlightDisabled_ = allow;
};


/**
 * @return {boolean} Whether the menu will highlight disabled menu items or skip
 *     to the next active item.
 */
goog.ui.Menu.prototype.getAllowHighlightDisabled = function() {
  return this.allowHighlightDisabled_;
};


/** @inheritDoc */
goog.ui.Menu.prototype.setVisible = function(show, opt_force) {
  var visibilityChanged = goog.ui.Menu.superClass_.setVisible.call(this, show,
      opt_force);
  if (visibilityChanged && show && this.isInDocument() &&
      this.allowAutoFocus_) {
    this.getKeyEventTarget().focus();
  }
  return visibilityChanged;
};


/** @inheritDoc */
goog.ui.Menu.prototype.handleEnterItem = function(e) {
  if (this.allowAutoFocus_) {
    this.getKeyEventTarget().focus();
  }

  return goog.ui.Menu.superClass_.handleEnterItem.call(this, e);
};


/**
 * Highlights the next item that begins with the specified string.  If no
 * (other) item begins with the given string, the selection is unchanged.
 * @param {string} charStr The prefix to match.
 * @return {boolean} Whether a matching prefix was found.
 */
goog.ui.Menu.prototype.highlightNextPrefix = function(charStr) {
  var re = new RegExp('^' + goog.string.regExpEscape(charStr), 'i');
  return this.highlightHelper(function(index, max) {
    // Index is >= -1 because it is set to -1 when nothing is selected.
    var start = index < 0 ? 0 : index;
    var wrapped = false;

    // We always start looking from one after the current, because we
    // keep the current selection only as a last resort. This makes the
    // loop a little awkward in the case where there is no current
    // selection, as we need to stop somewhere but can't just stop
    // when index == start, which is why we need the 'wrapped' flag.
    do {
      ++index;
      if (index == max) {
        index = 0;
        wrapped = true;
      }
      var name = this.getChildAt(index).getCaption();
      if (name && name.match(re)) {
        return index;
      }
    } while (!wrapped || index != start);
    return null;
  }, this.getHighlightedIndex());
};


/** @inheritDoc */
goog.ui.Menu.prototype.canHighlightItem = function(item) {
  return (this.allowHighlightDisabled_ || item.isEnabled()) &&
      item.isVisible() && item.isSupportedState(goog.ui.Component.State.HOVER);
};
