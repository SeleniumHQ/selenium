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
 * @fileoverview A menu button control.
 *
*
 * @see ../demos/menubutton.html
 */

goog.provide('goog.ui.MenuButton');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.State');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.math.Box');
goog.require('goog.math.Rect');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.ui.registry');


/**
 * A menu button control.  Extends {@link goog.ui.Button} by composing a button
 * with a dropdown arrow and a popup menu.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption (if any).
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu button; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.MenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(this, content, opt_renderer ||
      goog.ui.MenuButtonRenderer.getInstance(), opt_domHelper);

  // Menu buttons support the OPENED state.
  this.setSupportedState(goog.ui.Component.State.OPENED, true);

  if (opt_menu) {
    this.setMenu(opt_menu);
  }
  this.timer_ = new goog.Timer(500);  // 0.5 sec
};
goog.inherits(goog.ui.MenuButton, goog.ui.Button);


/**
 * The menu.
 * @type {goog.ui.Menu|undefined}
 * @private
 */
goog.ui.MenuButton.prototype.menu_;


/**
 * Whether the popup menu should be aligned to the start or the end of the
 * button; defaults to true (align to start).
 * @type {boolean}
 * @private
 */
goog.ui.MenuButton.prototype.alignToStart_ = true;


/**
 * Whether the popup menu should scroll when it's to big to fit vertically
 * on the screen. Defaults to false, use the adjust logic to reposition the
 * menu on overflow rather then scroll.
 * @type {boolean}
 * @private
 */
goog.ui.MenuButton.prototype.scrollOnOverflow_ = false;


/**
 * Whether the attached popup menu is focusable or not (defaults to false).
 * Popup menus attached to menu buttons usually don't need to be focusable,
 * i.e. the button retains keyboard focus, and forwards key events to the
 * menu for processing.  However, menus like {@link goog.ui.FilteredMenu}
 * need to be focusable.
 * @type {boolean}
 * @private
 */
goog.ui.MenuButton.prototype.isFocusablePopupMenu_ = false;


/**
 * A Timer to correct menu position.
 * @type {goog.Timer}
 * @private
 */
goog.ui.MenuButton.prototype.timer_;


/**
 * The bounding rectangle of the button element.
 * @type {goog.math.Rect}
 * @private
 */
goog.ui.MenuButton.prototype.buttonRect_;


/**
 * The viewport rectangle.
 * @type {goog.math.Box}
 * @private
 */
goog.ui.MenuButton.prototype.viewportBox_;


/**
 * The original size.
 * @type {goog.math.Size|undefined}
 * @private
 */
goog.ui.MenuButton.prototype.originalSize_;


/**
 * Sets up event handlers specific to menu buttons.
 * @override
 */
goog.ui.MenuButton.prototype.enterDocument = function() {
  goog.ui.MenuButton.superClass_.enterDocument.call(this);
  if (this.menu_) {
    this.attachMenuEventListeners_(this.menu_, true);
  }
  goog.dom.a11y.setState(this.getElement(),
      goog.dom.a11y.State.HASPOPUP, 'true');
};


/**
 * Removes event handlers specific to menu buttons, and ensures that the
 * attached menu also exits the document.
 * @override
 */
goog.ui.MenuButton.prototype.exitDocument = function() {
  goog.ui.MenuButton.superClass_.exitDocument.call(this);
  if (this.menu_) {
    this.setOpen(false);
    this.menu_.exitDocument();
    this.attachMenuEventListeners_(this.menu_, false);

    var menuElement = this.menu_.getElement();
    if (menuElement) {
      goog.dom.removeNode(menuElement);
    }
  }
};


/** @inheritDoc */
goog.ui.MenuButton.prototype.disposeInternal = function() {
  goog.ui.MenuButton.superClass_.disposeInternal.call(this);
  if (this.menu_) {
    this.menu_.dispose();
    delete this.menu_;
  }
  this.timer_.dispose();
};


/**
 * Handles mousedown events.  Invokes the superclass implementation to dispatch
 * an ACTIVATE event and activate the button.  Also toggles the visibility of
 * the attached menu.
 * @param {goog.events.Event} e Mouse event to handle.
 * @override
 * @protected
 */
goog.ui.MenuButton.prototype.handleMouseDown = function(e) {
  goog.ui.MenuButton.superClass_.handleMouseDown.call(this, e);
  if (this.isActive()) {
    // The component was allowed to activate; toggle menu visibility.
    this.setOpen(!this.isOpen());
    if (this.menu_) {
      this.menu_.setMouseButtonPressed(this.isOpen());
    }
  }
};


/**
 * Handles mouseup events.  Invokes the superclass implementation to dispatch
 * an ACTION event and deactivate the button.
 * @param {goog.events.Event} e Mouse event to handle.
 * @override
 * @protected
 */
goog.ui.MenuButton.prototype.handleMouseUp = function(e) {
  goog.ui.MenuButton.superClass_.handleMouseUp.call(this, e);
  if (this.menu_ && !this.isActive()) {
    this.menu_.setMouseButtonPressed(false);
  }
};


/**
 * Performs the appropriate action when the menu button is activated by the
 * user.  Overrides the superclass implementation by not dispatching an {@code
 * ACTION} event, because menu buttons exist only to reveal menus, not to
 * perform actions themselves.  Calls {@link #setActive} to deactivate the
 * button.
 * @param {goog.events.Event} e Mouse or key event that triggered the action.
 * @return {boolean} Whether the action was allowed to proceed.
 * @override
 * @protected
 */
goog.ui.MenuButton.prototype.performActionInternal = function(e) {
  this.setActive(false);
  return true;
};


/**
 * Handles mousedown events over the document.  If the mousedown happens over
 * an element unrelated to the component, hides the menu.
 * TODO(user): Reconcile this with goog.ui.Popup (and handle frames/windows).
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @protected
 */
goog.ui.MenuButton.prototype.handleDocumentMouseDown = function(e) {
  if (this.menu_ &&
      this.menu_.isVisible() &&
      !this.containsElement(/** @type {Element} */ (e.target))) {
    // User clicked somewhere else in the document while the menu was visible;
    // dismiss menu.
    this.setOpen(false);
  }
};


/**
 * Returns true if the given element is to be considered part of the component,
 * even if it isn't a DOM descendant of the component's root element.
 * @param {Element} element Element to test (if any).
 * @return {boolean} Whether the element is considered part of the component.
 * @protected
 */
goog.ui.MenuButton.prototype.containsElement = function(element) {
  return element && goog.dom.contains(this.getElement(), element) ||
      this.menu_ && this.menu_.containsElement(element) || false;
};


/** @inheritDoc */
goog.ui.MenuButton.prototype.handleKeyEventInternal = function(e) {
  // Handle SPACE on keyup and all other keys on keypress.
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    // Prevent page scrolling in Chrome.
    e.preventDefault();
    if (e.type != goog.events.EventType.KEYUP) {
      return false;
    }
  } else if (e.type != goog.events.KeyHandler.EventType.KEY) {
    return false;
  }

  if (this.menu_ && this.menu_.isVisible()) {
    // Menu is open.
    var handledByMenu = this.menu_.handleKeyEvent(e);
    if (e.keyCode == goog.events.KeyCodes.ESC) {
      // Dismiss the menu.
      this.setOpen(false);
      return true;
    }
    return handledByMenu;
  }

  if (e.keyCode == goog.events.KeyCodes.DOWN ||
      e.keyCode == goog.events.KeyCodes.UP ||
      e.keyCode == goog.events.KeyCodes.SPACE) {
    // Menu is closed, and the user hit the down/up/space key; open menu.
    this.setOpen(true);
    return true;
  }

  // Key event wasn't handled by the component.
  return false;
};


/**
 * Handles {@code ACTION} events dispatched by an activated menu item.
 * @param {goog.events.Event} e Action event to handle.
 * @protected
 */
goog.ui.MenuButton.prototype.handleMenuAction = function(e) {
  // Close the menu on click.
  this.setOpen(false);
};


/**
 * Handles {@code BLUR} events dispatched by the popup menu by closing it.
 * Only registered if the menu is focusable.
 * @param {goog.events.Event} e Blur event dispatched by a focusable menu.
 */
goog.ui.MenuButton.prototype.handleMenuBlur = function(e) {
  // Close the menu when it reports that it lost focus, unless the button is
  // pressed (active).
  if (!this.isActive()) {
    this.setOpen(false);
  }
};


/**
 * Handles blur events dispatched by the button's key event target when it
 * loses keyboard focus by closing the popup menu (unless it is focusable).
 * Only registered if the button is focusable.
 * @param {goog.events.Event} e Blur event dispatched by the menu button.
 * @override
 * @protected
 */
goog.ui.MenuButton.prototype.handleBlur = function(e) {
  if (!this.isFocusablePopupMenu()) {
    this.setOpen(false);
  }
  goog.ui.MenuButton.superClass_.handleBlur.call(this, e);
};


/**
 * Returns the menu attached to the button.  If no menu is attached, creates a
 * new empty menu.
 * @return {goog.ui.Menu} Popup menu attached to the menu button.
 */
goog.ui.MenuButton.prototype.getMenu = function() {
  if (!this.menu_) {
    this.setMenu(new goog.ui.Menu(this.getDomHelper()));
  }
  return this.menu_ || null;
};


/**
 * Replaces the menu attached to the button with the argument, and returns the
 * previous menu (if any).
 * @param {goog.ui.Menu?} menu New menu to be attached to the menu button (null
 *     to remove the menu).
 * @return {goog.ui.Menu|undefined} Previous menu (undefined if none).
 */
goog.ui.MenuButton.prototype.setMenu = function(menu) {
  var oldMenu = this.menu_;

  // Do nothing unless the new menu is different from the current one.
  if (menu != oldMenu) {
    if (oldMenu) {
      this.setOpen(false);
      if (this.isInDocument()) {
        this.attachMenuEventListeners_(oldMenu, false);
      }
      delete this.menu_;
    }
    if (menu) {
      this.menu_ = menu;
      menu.setParent(this);
      menu.setVisible(false);
      menu.setAllowAutoFocus(this.isFocusablePopupMenu());
      if (this.isInDocument()) {
        this.attachMenuEventListeners_(menu, true);
      }
    }
  }

  return oldMenu;
};


/**
 * Adds a new menu item at the end of the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator|goog.ui.Control} item Menu
 *     item to add to the menu.
 */
goog.ui.MenuButton.prototype.addItem = function(item) {
  this.getMenu().addChild(item, true);
};


/**
 * Adds a new menu item at the specific index in the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to the
 *     menu.
 * @param {number} index Index at which to insert the menu item.
 */
goog.ui.MenuButton.prototype.addItemAt = function(item, index) {
  this.getMenu().addChildAt(item, index, true);
};


/**
 * Removes the item from the menu and disposes of it.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item The menu item to remove.
 */
goog.ui.MenuButton.prototype.removeItem = function(item) {
  var child = this.getMenu().removeChild(item, true);
  if (child) {
    child.dispose();
  }
};


/**
 * Removes the menu item at a given index in the menu and disposes of it.
 * @param {number} index Index of item.
 */
goog.ui.MenuButton.prototype.removeItemAt = function(index) {
  var child = this.getMenu().removeChildAt(index, true);
  if (child) {
    child.dispose();
  }
};


/**
 * Returns the menu item at a given index.
 * @param {number} index Index of menu item.
 * @return {goog.ui.MenuItem?} Menu item (null if not found).
 */
goog.ui.MenuButton.prototype.getItemAt = function(index) {
  return this.menu_ ?
      /** @type {goog.ui.MenuItem} */ (this.menu_.getChildAt(index)) : null;
};


/**
 * Returns the number of items in the menu (including separators).
 * @return {number} The number of items in the menu.
 */
goog.ui.MenuButton.prototype.getItemCount = function() {
  return this.menu_ ? this.menu_.getChildCount() : 0;
};


/**
 * Shows/hides the menu button based on the value of the argument.  Also hides
 * the popup menu if the button is being hidden.
 * @param {boolean} visible Whether to show or hide the button.
 * @param {boolean=} opt_force If true, doesn't check whether the component
 *     already has the requested visibility, and doesn't dispatch any events.
 * @return {boolean} Whether the visibility was changed.
 * @override
 */
goog.ui.MenuButton.prototype.setVisible = function(visible, opt_force) {
  var visibilityChanged = goog.ui.MenuButton.superClass_.setVisible.call(this,
      visible, opt_force);
  if (visibilityChanged && !this.isVisible()) {
    this.setOpen(false);
  }
  return visibilityChanged;
};


/**
 * Enables/disables the menu button based on the value of the argument, and
 * updates its CSS styling.  Also hides the popup menu if the button is being
 * disabled.
 * @param {boolean} enable Whether to enable or disable the button.
 * @override
 */
goog.ui.MenuButton.prototype.setEnabled = function(enable) {
  goog.ui.MenuButton.superClass_.setEnabled.call(this, enable);
  if (!this.isEnabled()) {
    this.setOpen(false);
  }
};


/**
 * @return {boolean} Whether the menu is aligned to the start of the button
 *     (left if the render direction is left-to-right, right if the render
 *     direction is right-to-left).
 */
goog.ui.MenuButton.prototype.isAlignMenuToStart = function() {
  return this.alignToStart_;
};


/**
 * Sets whether the menu is aligned to the start or the end of the button.
 * @param {boolean} alignToStart Whether the menu is to be aligned to the start
 *     of the button (left if the render direction is left-to-right, right if
 *     the render direction is right-to-left).
 */
goog.ui.MenuButton.prototype.setAlignMenuToStart = function(alignToStart) {
  this.alignToStart_ = alignToStart;
};


/**
 * Sets whether the menu should scroll when it's too big to fix vertically on
 * the screen.  The css of the menu element should have overflow set to auto.
 * Note: Adding or removing items while the menu is open will not work correctly
 * if scrollOnOverflow is on.
 * @param {boolean} scrollOnOverflow Whether the menu should scroll when too big
 *     to fit on the screen.  If false, adjust logic will be used to try and
 *     reposition the menu to fit.
 */
goog.ui.MenuButton.prototype.setScrollOnOverflow = function(scrollOnOverflow) {
  this.scrollOnOverflow_ = scrollOnOverflow;
};


/**
 * @return {boolean} Wether the menu will scroll when it's to big to fit
 *     vertically on the screen.
 */
goog.ui.MenuButton.prototype.isScrollOnOverflow = function() {
  return this.scrollOnOverflow_;
};


/**
 * @return {boolean} Whether the attached menu is focusable.
 */
goog.ui.MenuButton.prototype.isFocusablePopupMenu = function() {
  return this.isFocusablePopupMenu_;
};


/**
 * Sets whether the attached popup menu is focusable.  If the popup menu is
 * focusable, it may steal keyboard focus from the menu button, so the button
 * will not hide the menu on blur.
 * @param {boolean} focusable Whether the attached menu is focusable.
 */
goog.ui.MenuButton.prototype.setFocusablePopupMenu = function(focusable) {
  // TODO(user):  The menu itself should advertise whether it is focusable.
  this.isFocusablePopupMenu_ = focusable;
};


/**
 * Reveals the menu and hooks up menu-specific event handling.
 * @deprecated Use {@link #setOpen} instead.
 */
goog.ui.MenuButton.prototype.showMenu = function() {
  this.setOpen(true);
};


/**
 * Hides the menu and cleans up menu-specific event handling.
 * @deprecated Use {@link #setOpen} instead.
 */
goog.ui.MenuButton.prototype.hideMenu = function() {
  this.setOpen(false);
};


/**
 * Opens or closes the attached popup menu.
 * @param {boolean} open Whether to open or close the menu.
 * @override
 */
goog.ui.MenuButton.prototype.setOpen = function(open) {
  goog.ui.MenuButton.superClass_.setOpen.call(this, open);
  if (this.menu_ && this.hasState(goog.ui.Component.State.OPENED) == open) {
    if (open) {
      if (!this.menu_.isInDocument()) {
        // Lazily render the menu if needed.
        this.menu_.render();
      }
      this.viewportBox_ =
          goog.style.getVisibleRectForElement(this.getElement());
      this.buttonRect_ = goog.style.getBounds(this.getElement());
      this.positionMenu();
      this.menu_.setHighlightedIndex(-1);
    } else {
      this.setActive(false);
      this.menu_.setMouseButtonPressed(false);

      // Clear any sizes that might have been stored.
      if (goog.isDefAndNotNull(this.originalSize_)) {
        this.originalSize_ = undefined;
        var elem = this.menu_.getElement();
        if (elem) {
          goog.style.setSize(elem, '', '');
        }
      }
    }
    this.menu_.setVisible(open);
    this.attachPopupListeners_(open);
  }
};


/**
 * Positions the menu under the button.  May be called directly in cases when
 * the menu size is known to change.
 */
goog.ui.MenuButton.prototype.positionMenu = function() {
  if (!this.menu_.isInDocument()) {
    return;
  }

  var anchorCorner = this.isAlignMenuToStart() ?
      goog.positioning.Corner.BOTTOM_START : goog.positioning.Corner.BOTTOM_END;
  var position = new goog.positioning.MenuAnchoredPosition(this.getElement(),
      anchorCorner, /* opt_adjust */ !this.scrollOnOverflow_,
      /* opt_resize */ this.scrollOnOverflow_);

  var elem = this.menu_.getElement();
  if (!this.menu_.isVisible()) {
    elem.style.visibility = 'hidden';
    goog.style.showElement(elem, true);
  }

  if (!this.originalSize_ && this.scrollOnOverflow_) {
    this.originalSize_ = goog.style.getSize(elem);
  }
  var popupCorner = this.isAlignMenuToStart() ?
      goog.positioning.Corner.TOP_START : goog.positioning.Corner.TOP_END;
  position.reposition(elem, popupCorner, null, this.originalSize_);

  if (!this.menu_.isVisible()) {
    goog.style.showElement(elem, false);
    elem.style.visibility = 'visible';
  }
};


/**
 * Periodically repositions the menu while it is visible.
 *
 * @param {goog.events.Event} e An event object.
 * @private
 */
goog.ui.MenuButton.prototype.onTick_ = function(e) {
  // Call positionMenu() only if the button position or size was
  // changed, or if the window's viewport was changed.
  var currentButtonRect = goog.style.getBounds(this.getElement());
  var currentViewport = goog.style.getVisibleRectForElement(this.getElement());
  if (!goog.math.Rect.equals(this.buttonRect_, currentButtonRect) ||
      !goog.math.Box.equals(this.viewportBox_, currentViewport)) {
    this.buttonRect_ = currentButtonRect;
    this.viewportBox_ = currentViewport;
    this.positionMenu();
  }
};


/**
 * Attaches or detaches menu event listeners to/from the given menu.
 * Called each time a menu is attached to or detached from the button.
 * @param {goog.ui.Menu} menu Menu on which to listen for events.
 * @param {boolean} attach Whether to attach or detach event listeners.
 * @private
 */
goog.ui.MenuButton.prototype.attachMenuEventListeners_ = function(menu,
    attach) {
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;

  // Handle events dispatched by menu items.
  method.call(handler, menu, goog.ui.Component.EventType.ACTION,
      this.handleMenuAction);
  method.call(handler, menu, goog.ui.Component.EventType.HIGHLIGHT,
      this.handleHighlightItem);
  method.call(handler, menu, goog.ui.Component.EventType.UNHIGHLIGHT,
      this.handleUnHighlightItem);
};


/**
 * Handles {@code HIGHLIGHT} events dispatched by the attached menu.
 * @param {goog.events.Event} e Highlight event to handle.
 */
goog.ui.MenuButton.prototype.handleHighlightItem = function(e) {
  goog.dom.a11y.setState(this.getElement(),
      goog.dom.a11y.State.ACTIVEDESCENDANT, e.target.getElement().id);
};


/**
 * Handles UNHIGHLIGHT events dispatched by the associated menu.
 * @param {goog.events.Event} e Unhighlight event to handle.
 */
goog.ui.MenuButton.prototype.handleUnHighlightItem = function(e) {
  if (!this.menu_.getHighlighted()) {
    goog.dom.a11y.setState(this.getElement(),
        goog.dom.a11y.State.ACTIVEDESCENDANT, '');
  }
};


/**
 * Attaches or detaches event listeners depending on whether the popup menu
 * is being shown or hidden.  Starts listening for document mousedown events
 * and for menu blur events when the menu is shown, and stops listening for
 * these events when it is hidden.  Called from {@link #setOpen}.
 * @param {boolean} attach Whether to attach or detach event listeners.
 * @private
 */
goog.ui.MenuButton.prototype.attachPopupListeners_ = function(attach) {
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;

  // Listen for document mousedown events in the capture phase, because
  // the target may stop propagation of the event in the bubble phase.
  method.call(handler, this.getDomHelper().getDocument(),
      goog.events.EventType.MOUSEDOWN, this.handleDocumentMouseDown, true);

  // Only listen for blur events dispatched by the menu if it is focusable.
  if (this.isFocusablePopupMenu()) {
    method.call(handler, /** @type {goog.events.EventTarget} */ (this.menu_),
        goog.ui.Component.EventType.BLUR, this.handleMenuBlur);
  }

  method.call(handler, this.timer_, goog.Timer.TICK, this.onTick_);
  if (attach) {
    this.timer_.start();
  } else {
    this.timer_.stop();
  }
};


// Register a decorator factory function for goog.ui.MenuButtons.
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuButtonRenderer.CSS_CLASS,
    function() {
      // MenuButton defaults to using MenuButtonRenderer.
      return new goog.ui.MenuButton(null);
    });
