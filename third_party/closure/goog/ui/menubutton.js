/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A menu button control.
 *
 * @see ../demos/menubutton.html
 */

goog.provide('goog.ui.MenuButton');

goog.require('goog.Timer');
goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.positioning');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.positioning.Overflow');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.IdGenerator');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.SubMenu');
goog.require('goog.ui.registry');
goog.requireType('goog.events.BrowserEvent');
goog.requireType('goog.events.Event');
goog.requireType('goog.events.EventTarget');
goog.requireType('goog.math.Size');
goog.requireType('goog.positioning.AnchoredPosition');
goog.requireType('goog.ui.ButtonRenderer');
goog.requireType('goog.ui.Control');
goog.requireType('goog.ui.ControlContent');
goog.requireType('goog.ui.MenuSeparator');



/**
 * A menu button control.  Extends {@link goog.ui.Button} by composing a button
 * with a dropdown arrow and a popup menu.
 *
 * @param {goog.ui.ControlContent=} opt_content Text caption or existing DOM
 *     structure to display as the button's caption (if any).
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu button; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.MenuButton = function(
    opt_content, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  'use strict';
  goog.ui.Button.call(
      this, opt_content,
      opt_renderer || goog.ui.MenuButtonRenderer.getInstance(), opt_domHelper);

  // Menu buttons support the OPENED state.
  this.setSupportedState(goog.ui.Component.State.OPENED, true);

  /**
   * The menu position on this button.
   * @type {!goog.positioning.AnchoredPosition}
   * @private
   */
  this.menuPosition_ = new goog.positioning.MenuAnchoredPosition(
      null, goog.positioning.Corner.BOTTOM_START);

  if (opt_menu) {
    this.setMenu(opt_menu);
  }
  this.menuMargin_ = null;
  this.timer_ = new goog.Timer(500);  // 0.5 sec

  /**
   * Whether the enter or space key should close the menu, if it is already
   * open. This should be true for accessibility reasons, but is provided as an
   * option for backward compatibility.
   * @private {boolean}
   */
  this.closeOnEnterOrSpace_ = true;

  /** @private {!goog.ui.MenuRenderer} */
  this.menuRenderer_ = opt_menuRenderer || goog.ui.MenuRenderer.getInstance();
};
goog.inherits(goog.ui.MenuButton, goog.ui.Button);


/**
 * The menu.
 * @type {goog.ui.Menu|undefined}
 * @private
 */
goog.ui.MenuButton.prototype.menu_;


/**
 * The position element.  If set, use positionElement_ to position the
 * popup menu instead of the default which is to use the menu button element.
 * @type {Element|undefined}
 * @private
 */
goog.ui.MenuButton.prototype.positionElement_;


/**
 * The margin to apply to the menu's position when it is shown.  If null, no
 * margin will be applied.
 * @type {goog.math.Box}
 * @private
 */
goog.ui.MenuButton.prototype.menuMargin_;


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
 * Do we render the drop down menu as a sibling to the label, or at the end
 * of the current dom?
 * @type {boolean}
 * @private
 */
goog.ui.MenuButton.prototype.renderMenuAsSibling_ = false;


/**
 * Whether to select the first item in the menu when it is opened using
 * enter or space. By default, the first item is selected only when
 * opened by a key up or down event. When this is on, the first item will
 * be selected due to any of the four events.
 * @private
 */
goog.ui.MenuButton.prototype.selectFirstOnEnterOrSpace_ = false;


/**
 * Sets up event handlers specific to menu buttons.
 * @override
 */
goog.ui.MenuButton.prototype.enterDocument = function() {
  'use strict';
  goog.ui.MenuButton.superClass_.enterDocument.call(this);
  this.attachKeyDownEventListener_(true);
  if (this.menu_) {
    this.attachMenuEventListeners_(this.menu_, true);
  }
  goog.a11y.aria.setState(
      this.getElementStrict(), goog.a11y.aria.State.HASPOPUP, !!this.menu_);
};


/**
 * Removes event handlers specific to menu buttons, and ensures that the
 * attached menu also exits the document.
 * @override
 */
goog.ui.MenuButton.prototype.exitDocument = function() {
  'use strict';
  goog.ui.MenuButton.superClass_.exitDocument.call(this);
  this.attachKeyDownEventListener_(false);
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


/** @override */
goog.ui.MenuButton.prototype.disposeInternal = function() {
  'use strict';
  goog.ui.MenuButton.superClass_.disposeInternal.call(this);
  if (this.menu_) {
    this.menu_.dispose();
    delete this.menu_;
  }
  delete this.positionElement_;
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
  'use strict';
  goog.ui.MenuButton.superClass_.handleMouseDown.call(this, e);
  if (this.isActive()) {
    // The component was allowed to activate; toggle menu visibility.
    this.setOpen(!this.isOpen(), e);
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
  'use strict';
  goog.ui.MenuButton.superClass_.handleMouseUp.call(this, e);
  if (this.menu_ && !this.isActive()) {
    this.menu_.setMouseButtonPressed(false);
  }
};


/**
 * Performs the appropriate action when the menu button is activated by the
 * user.  Overrides the superclass implementation by not dispatching an
 * `ACTION` event, because menu buttons exist only to reveal menus, not to
 * perform actions themselves.  Calls {@link #setActive} to deactivate the
 * button.
 * @param {goog.events.Event} e Mouse or key event that triggered the action.
 * @return {boolean} Whether the action was allowed to proceed.
 * @override
 * @protected
 */
goog.ui.MenuButton.prototype.performActionInternal = function(e) {
  'use strict';
  this.setActive(false);
  return true;
};


/**
 * Handles mousedown events over the document.  If the mousedown happens over
 * an element unrelated to the component, hides the menu.
 * TODO(attila): Reconcile this with goog.ui.Popup (and handle frames/windows).
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @protected
 */
goog.ui.MenuButton.prototype.handleDocumentMouseDown = function(e) {
  'use strict';
  if (this.menu_ && this.menu_.isVisible() &&
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
  'use strict';
  return element && goog.dom.contains(this.getElement(), element) ||
      this.menu_ && this.menu_.containsElement(element) || false;
};


/** @override */
goog.ui.MenuButton.prototype.handleKeyEventInternal = function(e) {
  'use strict';
  // Handle SPACE on keyup and all other keys on keypress.
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    // Prevent page scrolling in Chrome.
    e.preventDefault();
    if (e.type != goog.events.EventType.KEYUP) {
      // Ignore events because KeyCodes.SPACE is handled further down.
      return true;
    }
  } else if (e.type != goog.events.KeyHandler.EventType.KEY) {
    return false;
  }

  if (this.menu_ && this.menu_.isVisible()) {
    // Menu is open.
    const isEnterOrSpace = e.keyCode == goog.events.KeyCodes.ENTER ||
        e.keyCode == goog.events.KeyCodes.SPACE;
    const handledByMenu = this.menu_.handleKeyEvent(e);
    // If the submenu has handled the key event, then defer to it to close the
    // menu if necessary and do not close it here. This is needed because the
    // enter key should keep the submenu open, but should close other types of
    // menu items.
    // Check for this.menu_ again here because some widgets set this.dispose
    // after handleKeyEvent. Example: go/widget-dispose-ex
    const handledBySubMenu = handledByMenu && this.menu_ &&
        this.menu_.getOpenItem() instanceof goog.ui.SubMenu;
    if (!handledBySubMenu &&
        (e.keyCode == goog.events.KeyCodes.ESC ||
         (isEnterOrSpace && this.closeOnEnterOrSpace_))) {
      // Dismiss the menu.
      this.setOpen(false);
      return true;
    }
    return handledByMenu;
  }

  if (e.keyCode == goog.events.KeyCodes.DOWN ||
      e.keyCode == goog.events.KeyCodes.UP ||
      e.keyCode == goog.events.KeyCodes.SPACE ||
      e.keyCode == goog.events.KeyCodes.ENTER) {
    // Menu is closed, and the user hit the down/up/space/enter key; open menu.
    this.setOpen(true, e);
    return true;
  }

  // Key event wasn't handled by the component.
  return false;
};


/**
 * Handles `ACTION` events dispatched by an activated menu item.
 * @param {goog.events.Event} e Action event to handle.
 * @protected
 */
goog.ui.MenuButton.prototype.handleMenuAction = function(e) {
  'use strict';
  // Close the menu on click.
  this.setOpen(false);
};


/**
 * Handles `BLUR` events dispatched by the popup menu by closing it.
 * Only registered if the menu is focusable.
 * @param {goog.events.Event} e Blur event dispatched by a focusable menu.
 */
goog.ui.MenuButton.prototype.handleMenuBlur = function(e) {
  'use strict';
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
  'use strict';
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
  'use strict';
  if (!this.menu_) {
    this.setMenu(new goog.ui.Menu(this.getDomHelper(), this.menuRenderer_));
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
  'use strict';
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
    if (this.isInDocument()) {
      goog.a11y.aria.setState(
          this.getElementStrict(), goog.a11y.aria.State.HASPOPUP, !!menu);
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
 * Specify which positioning algorithm to use.
 *
 * This method is preferred over the fine-grained positioning methods like
 * setPositionElement, setAlignMenuToStart, and setScrollOnOverflow. Calling
 * this method will override settings by those methods.
 *
 * @param {goog.positioning.AnchoredPosition} position The position of the
 *     Menu the button. If the position has a null anchor, we will use the
 *     menubutton element as the anchor.
 */
goog.ui.MenuButton.prototype.setMenuPosition = function(position) {
  'use strict';
  if (position) {
    this.menuPosition_ = position;
    this.positionElement_ = position.element;
  }
};


/**
 * Sets an element for anchoring the menu.
 * @param {Element} positionElement New element to use for
 *     positioning the dropdown menu.  Null to use the default behavior
 *     of positioning to this menu button.
 */
goog.ui.MenuButton.prototype.setPositionElement = function(positionElement) {
  'use strict';
  this.positionElement_ = positionElement;
  this.positionMenu();
};


/**
 * Sets a margin that will be applied to the menu's position when it is shown.
 * If null, no margin will be applied.
 * @param {goog.math.Box} margin Margin to apply.
 */
goog.ui.MenuButton.prototype.setMenuMargin = function(margin) {
  'use strict';
  this.menuMargin_ = margin;
};

/**
 * Sets whether the enter or space key should close the menu, if it is already
 * open. By default, only the ESC key will close an open menu.
 * @param {boolean} close Whether pressing Enter or Space when the button has
 *     focus will close the menu if it is already open.
 */
goog.ui.MenuButton.prototype.setCloseOnEnterOrSpace = function(close) {
  this.closeOnEnterOrSpace_ = close;
};

/**
 * Sets whether to select the first item in the menu when it is opened using
 * enter or space. By default, the first item is selected only when
 * opened by a key up or down event. When this is on, the first item will
 * be selected due to any of the four events.
 * @param {boolean} select
 */
goog.ui.MenuButton.prototype.setSelectFirstOnEnterOrSpace = function(select) {
  'use strict';
  this.selectFirstOnEnterOrSpace_ = select;
};


/**
 * Adds a new menu item at the end of the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator|goog.ui.Control} item Menu
 *     item to add to the menu.
 */
goog.ui.MenuButton.prototype.addItem = function(item) {
  'use strict';
  this.getMenu().addChild(item, true);
};


/**
 * Adds a new menu item at the specific index in the menu.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item Menu item to add to the
 *     menu.
 * @param {number} index Index at which to insert the menu item.
 */
goog.ui.MenuButton.prototype.addItemAt = function(item, index) {
  'use strict';
  this.getMenu().addChildAt(item, index, true);
};


/**
 * Removes the item from the menu and disposes of it.
 * @param {goog.ui.MenuItem|goog.ui.MenuSeparator} item The menu item to remove.
 */
goog.ui.MenuButton.prototype.removeItem = function(item) {
  'use strict';
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
  'use strict';
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
  'use strict';
  return this.menu_ ?
      /** @type {goog.ui.MenuItem} */ (this.menu_.getChildAt(index)) :
      null;
};


/**
 * Returns the number of items in the menu (including separators).
 * @return {number} The number of items in the menu.
 */
goog.ui.MenuButton.prototype.getItemCount = function() {
  'use strict';
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
  'use strict';
  var visibilityChanged =
      goog.ui.MenuButton.superClass_.setVisible.call(this, visible, opt_force);
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
  'use strict';
  goog.ui.MenuButton.superClass_.setEnabled.call(this, enable);
  if (!this.isEnabled()) {
    this.setOpen(false);
  }
};


// TODO(nicksantos): AlignMenuToStart and ScrollOnOverflow and PositionElement
// should all be deprecated, in favor of people setting their own
// AnchoredPosition with the parameters they need. Right now, we try
// to be backwards-compatible as possible, but this is incomplete because
// the APIs are non-orthogonal.


/**
 * @return {boolean} Whether the menu is aligned to the start of the button
 *     (left if the render direction is left-to-right, right if the render
 *     direction is right-to-left).
 */
goog.ui.MenuButton.prototype.isAlignMenuToStart = function() {
  'use strict';
  var corner = this.menuPosition_.corner;
  return corner == goog.positioning.Corner.BOTTOM_START ||
      corner == goog.positioning.Corner.TOP_START;
};


/**
 * Sets whether the menu is aligned to the start or the end of the button.
 * @param {boolean} alignToStart Whether the menu is to be aligned to the start
 *     of the button (left if the render direction is left-to-right, right if
 *     the render direction is right-to-left).
 */
goog.ui.MenuButton.prototype.setAlignMenuToStart = function(alignToStart) {
  'use strict';
  this.menuPosition_.corner = alignToStart ?
      goog.positioning.Corner.BOTTOM_START :
      goog.positioning.Corner.BOTTOM_END;
};


/**
 * Sets whether the menu should scroll when it's too big to fix vertically on
 * the screen.  The css of the menu element should have overflow set to auto.
 * Note: Adding or removing items while the menu is open will not work correctly
 * if scrollOnOverflow is on.
 * @param {boolean} scrollOnOverflow Whether the menu should scroll when too big
 *     to fit on the screen.  If false, adjust logic will be used to try and
 *     reposition the menu to fit.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.MenuButton.prototype.setScrollOnOverflow = function(scrollOnOverflow) {
  'use strict';
  if (this.menuPosition_.setLastResortOverflow) {
    var overflowX = goog.positioning.Overflow.ADJUST_X;
    var overflowY = scrollOnOverflow ? goog.positioning.Overflow.RESIZE_HEIGHT :
                                       goog.positioning.Overflow.ADJUST_Y;
    this.menuPosition_.setLastResortOverflow(overflowX | overflowY);
  }
};


/**
 * @return {boolean} Whether the menu will scroll when it's to big to fit
 *     vertically on the screen.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.MenuButton.prototype.isScrollOnOverflow = function() {
  'use strict';
  return this.menuPosition_.getLastResortOverflow &&
      !!(this.menuPosition_.getLastResortOverflow() &
         goog.positioning.Overflow.RESIZE_HEIGHT);
};


/**
 * @return {boolean} Whether the attached menu is focusable.
 */
goog.ui.MenuButton.prototype.isFocusablePopupMenu = function() {
  'use strict';
  return this.isFocusablePopupMenu_;
};


/**
 * Sets whether the attached popup menu is focusable.  If the popup menu is
 * focusable, it may steal keyboard focus from the menu button, so the button
 * will not hide the menu on blur.
 * @param {boolean} focusable Whether the attached menu is focusable.
 */
goog.ui.MenuButton.prototype.setFocusablePopupMenu = function(focusable) {
  'use strict';
  // TODO(attila):  The menu itself should advertise whether it is focusable.
  this.isFocusablePopupMenu_ = focusable;
};


/**
 * Sets whether to render the menu as a sibling element of the button.
 * Normally, the menu is a child of document.body.  This option is useful if
 * you need the menu to inherit styles from a common parent element, or if you
 * otherwise need it to share a parent element for desired event handling.  One
 * example of the latter is if the parent is in a goog.ui.Popup, to ensure that
 * clicks on the menu are considered being within the popup.
 * @param {boolean} renderMenuAsSibling Whether we render the menu at the end
 *     of the dom or as a sibling to the button/label that renders the drop
 *     down.
 */
goog.ui.MenuButton.prototype.setRenderMenuAsSibling = function(
    renderMenuAsSibling) {
  'use strict';
  this.renderMenuAsSibling_ = renderMenuAsSibling;
};


/**
 * Reveals the menu and hooks up menu-specific event handling.
 * @deprecated Use {@link #setOpen} instead.
 */
goog.ui.MenuButton.prototype.showMenu = function() {
  'use strict';
  this.setOpen(true);
};


/**
 * Hides the menu and cleans up menu-specific event handling.
 * @deprecated Use {@link #setOpen} instead.
 */
goog.ui.MenuButton.prototype.hideMenu = function() {
  'use strict';
  this.setOpen(false);
};


/**
 * Opens or closes the attached popup menu.
 * @param {boolean} open Whether to open or close the menu.
 * @param {goog.events.Event=} opt_e Event that caused the menu to be opened.
 * @override
 */
goog.ui.MenuButton.prototype.setOpen = function(open, opt_e) {
  'use strict';
  goog.ui.MenuButton.superClass_.setOpen.call(this, open);
  if (this.menu_ && this.hasState(goog.ui.Component.State.OPENED) == open) {
    if (open) {
      if (!this.menu_.isInDocument()) {
        if (this.renderMenuAsSibling_) {
          // When we render the menu in the same parent as this button, we
          // prefer to add it immediately after the button. This way, the screen
          // readers will go to the menu on the very next element after the
          // button is read.
          var nextElementSibling =
              goog.dom.getNextElementSibling(this.getElement());
          if (nextElementSibling) {
            this.menu_.renderBefore(nextElementSibling);
          } else {
            this.menu_.render(
                /** @type {Element} */ (this.getElement().parentNode));
          }
        } else {
          this.menu_.render();
        }
      }
      this.viewportBox_ =
          goog.style.getVisibleRectForElement(this.getElement());
      this.buttonRect_ = goog.style.getBounds(this.getElement());
      this.positionMenu();

      // As per aria spec, highlight the first element in the menu when
      // keyboarding up or down. Thus, the first menu item will be announced
      // for screen reader users. If selectFirstOnEnterOrSpace is set, do this
      // for enter or space as well.
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      var isEnterOrSpace = !!opt_e &&
          (opt_e.keyCode == goog.events.KeyCodes.ENTER ||
           opt_e.keyCode == goog.events.KeyCodes.SPACE);
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      var isUpOrDown = !!opt_e &&
          (opt_e.keyCode == goog.events.KeyCodes.DOWN ||
           opt_e.keyCode == goog.events.KeyCodes.UP);
      var focus =
          isUpOrDown || (isEnterOrSpace && this.selectFirstOnEnterOrSpace_);
      if (focus) {
        this.menu_.highlightFirst();
      } else {
        this.menu_.setHighlightedIndex(-1);
      }
    } else {
      this.setActive(false);
      this.menu_.setMouseButtonPressed(false);

      var element = this.getElement();
      // Clear any remaining a11y state.
      if (element) {
        goog.a11y.aria.setState(
            element, goog.a11y.aria.State.ACTIVEDESCENDANT, '');
        goog.a11y.aria.setState(element, goog.a11y.aria.State.OWNS, '');
      }

      // Clear any sizes that might have been stored.
      if (this.originalSize_ != null) {
        this.originalSize_ = undefined;
        var elem = this.menu_.getElement();
        if (elem) {
          goog.style.setSize(elem, '', '');
        }
      }
    }
    this.menu_.setVisible(open, false, opt_e);
    // In Pivot Tables the menu button somehow gets disposed of during the
    // setVisible call, causing attachPopupListeners_ to fail.
    // TODO(user): Debug what happens.
    if (!this.isDisposed()) {
      this.attachPopupListeners_(open);
    }
  }
  if (this.menu_ && this.menu_.getElement()) {
    // Remove the aria-hidden state on the menu element so that it won't be
    // hidden to screen readers if it's inside a dialog (see b/17610491).
    goog.a11y.aria.removeState(
        this.menu_.getElementStrict(), goog.a11y.aria.State.HIDDEN);
  }
};


/**
 * Resets the MenuButton's size.  This is useful for cases where items are added
 * or removed from the menu and scrollOnOverflow is on.  In those cases the
 * menu will not behave correctly and resize itself unless this is called
 * (usually followed by positionMenu()).
 */
goog.ui.MenuButton.prototype.invalidateMenuSize = function() {
  'use strict';
  this.originalSize_ = undefined;
};


/**
 * Positions the menu under the button.  May be called directly in cases when
 * the menu size is known to change.
 */
goog.ui.MenuButton.prototype.positionMenu = function() {
  'use strict';
  if (!this.menu_.isInDocument()) {
    return;
  }

  var positionElement = this.positionElement_ || this.getElement();
  var position = this.menuPosition_;
  this.menuPosition_.element = positionElement;

  var elem = this.menu_.getElement();
  if (!this.menu_.isVisible()) {
    elem.style.visibility = 'hidden';
    goog.style.setElementShown(elem, true);
  }

  if (!this.originalSize_ && this.isScrollOnOverflow()) {
    this.originalSize_ = goog.style.getSize(elem);
  }
  var popupCorner = goog.positioning.flipCornerVertical(position.corner);
  position.reposition(elem, popupCorner, this.menuMargin_, this.originalSize_);

  if (!this.menu_.isVisible()) {
    goog.style.setElementShown(elem, false);
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
  'use strict';
  // Call positionMenu() only if the button position or size was
  // changed, or if the window's viewport was changed.
  var currentButtonRect = goog.style.getBounds(this.getElement());
  var currentViewport = goog.style.getVisibleRectForElement(this.getElement());
  if (goog.math.Rect.equals(this.buttonRect_, currentButtonRect) &&
      goog.math.Box.equals(this.viewportBox_, currentViewport)) {
    return;
  }

  // Reduction in the viewport width (e.g. due to increasing the zoom) can
  // cause the menu to get squashed against the right edge, distorting its
  // shape. When we move the menu back where it belongs, we risk using the
  // distorted size, causing mispositioning. To be safe, start by moving the
  // menu to the top left to let it reassume its true shape.
  if (this.menu_.isInDocument() && currentViewport && this.viewportBox_ &&
      (currentViewport.getWidth() < this.viewportBox_.getWidth())) {
    var elem = this.menu_.getElement();
    if (!this.menu_.isVisible()) {
      elem.style.visibility = 'hidden';
      goog.style.setElementShown(elem, true);
    }

    goog.style.setPosition(elem, new goog.math.Coordinate(0, 0));
  }

  this.buttonRect_ = currentButtonRect;
  this.viewportBox_ = currentViewport;
  this.positionMenu();
};


/**
 * Attaches or detaches menu event listeners to/from the given menu.
 * Called each time a menu is attached to or detached from the button.
 * @param {goog.ui.Menu} menu Menu on which to listen for events.
 * @param {boolean} attach Whether to attach or detach event listeners.
 * @private
 */
goog.ui.MenuButton.prototype.attachMenuEventListeners_ = function(
    menu, attach) {
  'use strict';
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;

  // Handle events dispatched by menu items.
  method.call(
      handler, menu, goog.ui.Component.EventType.ACTION, this.handleMenuAction);
  method.call(
      handler, menu, goog.ui.Component.EventType.CLOSE, this.handleCloseItem);
  method.call(
      handler, menu, goog.ui.Component.EventType.HIGHLIGHT,
      this.handleHighlightItem);
  method.call(
      handler, menu, goog.ui.Component.EventType.UNHIGHLIGHT,
      this.handleUnHighlightItem);
};


/**
 * Attaches or detaches a keydown event listener to/from the given element.
 * Called each time the button enters or exits the document.
 * @param {boolean} attach Whether to attach or detach the event listener.
 * @private
 */
goog.ui.MenuButton.prototype.attachKeyDownEventListener_ = function(attach) {
  'use strict';
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;

  // Handle keydown events dispatched by the button.
  method.call(
      handler, this.getElement(), goog.events.EventType.KEYDOWN,
      this.handleKeyDownEvent_);
};


/**
 * Handles `HIGHLIGHT` events dispatched by the attached menu.
 * @param {goog.events.Event} e Highlight event to handle.
 */
goog.ui.MenuButton.prototype.handleHighlightItem = function(e) {
  'use strict';
  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  var targetEl = e.target.getElement();
  if (targetEl) {
    this.setAriaActiveDescendant_(targetEl);
  }
};


/**
 * Handles `KEYDOWN` events dispatched by the button element. When the
 * button is focusable and the menu is present and visible, prevents the event
 * from propagating since the desired behavior is only to close the menu.
 * @param {goog.events.Event} e KeyDown event to handle.
 * @private
 */
goog.ui.MenuButton.prototype.handleKeyDownEvent_ = function(e) {
  'use strict';
  if (this.isSupportedState(goog.ui.Component.State.FOCUSED) &&
      this.getKeyEventTarget() && this.menu_ && this.menu_.isVisible()) {
    e.stopPropagation();
  }
};


/**
 * Handles UNHIGHLIGHT events dispatched by the associated menu.
 * @param {goog.events.Event} e Unhighlight event to handle.
 */
goog.ui.MenuButton.prototype.handleUnHighlightItem = function(e) {
  'use strict';
  if (!this.menu_.getHighlighted()) {
    var element = this.getElement();
    goog.asserts.assert(element, 'The menu button DOM element cannot be null.');
    goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, '');
    goog.a11y.aria.setState(element, goog.a11y.aria.State.OWNS, '');
  }
};


/**
 * Handles `CLOSE` events dispatched by the associated menu.
 * @param {goog.events.Event} e Close event to handle.
 */
goog.ui.MenuButton.prototype.handleCloseItem = function(e) {
  'use strict';
  // When a submenu is closed by pressing left arrow, no highlight event is
  // dispatched because the newly focused item was already highlighted, so this
  // scenario is handled by listening for the submenu close event instead.
  if (this.isOpen() && e.target instanceof goog.ui.MenuItem) {
    var menuItem = /** @type {!goog.ui.MenuItem} */ (e.target);
    var menuItemEl = menuItem.getElement();
    if (menuItem.isVisible() && menuItem.isHighlighted() &&
        menuItemEl != null) {
      this.setAriaActiveDescendant_(menuItemEl);
    }
  }
};


/**
 * Updates the aria-activedescendant attribute to the given target element.
 * @param {!Element} targetEl The target element.
 * @private
 */
goog.ui.MenuButton.prototype.setAriaActiveDescendant_ = function(targetEl) {
  'use strict';
  var element = this.getElement();
  goog.asserts.assert(element, 'The menu button DOM element cannot be null.');

  // If target element has an activedescendant, then set this control's
  // activedescendant to that, otherwise set it to the target element. This is
  // a workaround for some screen readers which do not handle
  // aria-activedescendant redirection properly.
  var targetActiveDescendant = goog.a11y.aria.getActiveDescendant(targetEl);
  var activeDescendant = targetActiveDescendant || targetEl;

  if (!activeDescendant.id) {
    // Create an id if there isn't one already.
    var idGenerator = goog.ui.IdGenerator.getInstance();
    activeDescendant.id = idGenerator.getNextUniqueId();
  }

  goog.a11y.aria.setActiveDescendant(element, activeDescendant);
  goog.a11y.aria.setState(
      element, goog.a11y.aria.State.OWNS, activeDescendant.id);
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
  'use strict';
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;

  // Listen for document mousedown events in the capture phase, because
  // the target may stop propagation of the event in the bubble phase.
  method.call(
      handler, this.getDomHelper().getDocument(),
      goog.events.EventType.MOUSEDOWN, this.handleDocumentMouseDown, true);

  // Only listen for blur events dispatched by the menu if it is focusable.
  if (this.isFocusablePopupMenu()) {
    method.call(
        handler, /** @type {!goog.events.EventTarget} */ (this.menu_),
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
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuButtonRenderer.CSS_CLASS, function() {
      'use strict';
      // MenuButton defaults to using MenuButtonRenderer.
      return new goog.ui.MenuButton(null);
    });
