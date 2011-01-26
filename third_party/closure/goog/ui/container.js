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
 * @fileoverview Base class for containers that host {@link goog.ui.Control}s,
 * such as menus and toolbars.  Provides default keyboard and mouse event
 * handling and child management, based on a generalized version of
 * {@link goog.ui.Menu}.
 *
 * @see ../demos/container.html
 */
// TODO(user):  Fix code/logic duplication between this and goog.ui.Control.
// TODO(user):  Maybe pull common stuff all the way up into Component...?

goog.provide('goog.ui.Container');
goog.provide('goog.ui.Container.EventType');
goog.provide('goog.ui.Container.Orientation');

goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.State');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.Error');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ContainerRenderer');



/**
 * Base class for containers.  Extends {@link goog.ui.Component} by adding
 * the following:
 *  <ul>
 *    <li>a {@link goog.events.KeyHandler}, to simplify keyboard handling,
 *    <li>a pluggable <em>renderer</em> framework, to simplify the creation of
 *        containers without the need to subclass this class,
 *    <li>methods to manage child controls hosted in the container,
 *    <li>default mouse and keyboard event handling methods.
 *  </ul>
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {?goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {?goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.Container = function(opt_orientation, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
  this.orientation_ = opt_orientation || this.renderer_.getDefaultOrientation();
};
goog.inherits(goog.ui.Container, goog.ui.Component);


/**
 * Container-specific events.
 * @enum {string}
 */
goog.ui.Container.EventType = {
  /**
   * Dispatched after a goog.ui.Container becomes visible. Non-cancellable.
   * NOTE(user): This event really shouldn't exist, because the
   * goog.ui.Component.EventType.SHOW event should behave like this one. But the
   * SHOW event for containers has been behaving as other components'
   * BEFORE_SHOW event for a long time, and too much code relies on that old
   * behavior to fix it now.
   */
  AFTER_SHOW: 'aftershow',

  /**
   * Dispatched after a goog.ui.Container becomes invisible. Non-cancellable.
   */
  AFTER_HIDE: 'afterhide'
};


/**
 * Container orientation constants.
 * @enum {string}
 */
goog.ui.Container.Orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};


/**
 * Allows an alternative element to be set to recieve key events, otherwise
 * defers to the renderer's element choice.
 * @type {Element|undefined}
 * @private
 */
goog.ui.Container.prototype.keyEventTarget_ = null;


/**
 * Keyboard event handler.
 * @type {goog.events.KeyHandler?}
 * @private
 */
goog.ui.Container.prototype.keyHandler_ = null;


/**
 * Renderer for the container.  Defaults to {@link goog.ui.ContainerRenderer}.
 * @type {goog.ui.ContainerRenderer?}
 * @private
 */
goog.ui.Container.prototype.renderer_ = null;


/**
 * Container orientation; determines layout and default keyboard navigation.
 * @type {?goog.ui.Container.Orientation}
 * @private
 */
goog.ui.Container.prototype.orientation_ = null;


/**
 * Whether the container is set to be visible.  Defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.visible_ = true;


/**
 * Whether the container is enabled and reacting to keyboard and mouse events.
 * Defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.enabled_ = true;


/**
 * Whether the container supports keyboard focus.  Defaults to true.  Focusable
 * containers have a {@code tabIndex} and can be navigated to via the keyboard.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.focusable_ = true;


/**
 * The 0-based index of the currently highlighted control in the container
 * (-1 if none).
 * @type {number}
 * @private
 */
goog.ui.Container.prototype.highlightedIndex_ = -1;


/**
 * The currently open (expanded) control in the container (null if none).
 * @type {goog.ui.Control?}
 * @private
 */
goog.ui.Container.prototype.openItem_ = null;


/**
 * Whether the mouse button is held down.  Defaults to false.  This flag is set
 * when the user mouses down over the container, and remains set until they
 * release the mouse button.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.mouseButtonPressed_ = false;


/**
 * Whether focus of child components should be allowed.  Only effective if
 * focusable_ is set to false.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.allowFocusableChildren_ = false;


/**
 * Whether highlighting a child component should also open it.
 * @type {boolean}
 * @private
 */
goog.ui.Container.prototype.openFollowsHighlight_ = true;


/**
 * Map of DOM IDs to child controls.  Each key is the DOM ID of a child
 * control's root element; each value is a reference to the child control
 * itself.  Used for looking up the child control corresponding to a DOM
 * node in O(1) time.
 * @type {Object}
 * @private
 */
goog.ui.Container.prototype.childElementIdMap_ = null;


// Event handler and renderer management.


/**
 * Returns the DOM element on which the container is listening for keyboard
 * events (null if none).
 * @return {Element} Element on which the container is listening for key
 *     events.
 */
goog.ui.Container.prototype.getKeyEventTarget = function() {
  // Delegate to renderer, unless we've set an explicit target.
  return this.keyEventTarget_ || this.renderer_.getKeyEventTarget(this);
};


/**
 * Attaches an element on which to listen for key events.
 * @param {Element|undefined} element The element to attach, or null/undefined
 *     to attach to the default element.
 */
goog.ui.Container.prototype.setKeyEventTarget = function(element) {
  if (this.focusable_) {
    var oldTarget = this.getKeyEventTarget();
    var inDocument = this.isInDocument();

    this.keyEventTarget_ = element;
    var newTarget = this.getKeyEventTarget();

    if (inDocument) {
      // Unlisten for events on the old key target.  Requires us to reset
      // key target state temporarily.
      this.keyEventTarget_ = oldTarget;
      this.enableFocusHandling_(false);
      this.keyEventTarget_ = element;

      // Listen for events on the new key target.
      this.getKeyHandler().attach(newTarget);
      this.enableFocusHandling_(true);
    }
  } else {
    throw Error('Can\'t set key event target for container ' +
        'that doesn\'t support keyboard focus!');
  }
};


/**
 * Returns the keyboard event handler for this container, lazily created the
 * first time this method is called.  The keyboard event handler listens for
 * keyboard events on the container's key event target, as determined by its
 * renderer.
 * @return {goog.events.KeyHandler} Keyboard event handler for this container.
 */
goog.ui.Container.prototype.getKeyHandler = function() {
  return this.keyHandler_ ||
      (this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget()));
};


/**
 * Returns the renderer used by this container to render itself or to decorate
 * an existing element.
 * @return {goog.ui.ContainerRenderer} Renderer used by the container.
 */
goog.ui.Container.prototype.getRenderer = function() {
  return this.renderer_;
};


/**
 * Registers the given renderer with the container.  Changing renderers after
 * the container has already been rendered or decorated is an error.
 * @param {goog.ui.ContainerRenderer} renderer Renderer used by the container.
 */
goog.ui.Container.prototype.setRenderer = function(renderer) {
  if (this.getElement()) {
    // Too late.
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  this.renderer_ = renderer;
};


// Standard goog.ui.Component implementation.


/**
 * Creates the container's DOM.  Overrides {@link goog.ui.Component#createDom}.
 */
goog.ui.Container.prototype.createDom = function() {
  // Delegate to renderer.
  this.setElementInternal(this.renderer_.createDom(this));
};


/**
 * Returns the DOM element into which child components are to be rendered,
 * or null if the container itself hasn't been rendered yet.  Overrides
 * {@link goog.ui.Component#getContentElement} by delegating to the renderer.
 * @return {Element} Element to contain child elements (null if none).
 */
goog.ui.Container.prototype.getContentElement = function() {
  // Delegate to renderer.
  return this.renderer_.getContentElement(this.getElement());
};


/**
 * Returns true if the given element can be decorated by this container.
 * Overrides {@link goog.ui.Component#canDecorate}.
 * @param {Element} element Element to decorate.
 * @return {boolean} True iff the element can be decorated.
 */
goog.ui.Container.prototype.canDecorate = function(element) {
  // Delegate to renderer.
  return this.renderer_.canDecorate(element);
};


/**
 * Decorates the given element with this container. Overrides {@link
 * goog.ui.Component#decorateInternal}.  Considered protected.
 * @param {Element} element Element to decorate.
 */
goog.ui.Container.prototype.decorateInternal = function(element) {
  // Delegate to renderer.
  this.setElementInternal(this.renderer_.decorate(this, element));
  // Check whether the decorated element is explicitly styled to be invisible.
  if (element.style.display == 'none') {
    this.visible_ = false;
  }
};


/**
 * Configures the container after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 */
goog.ui.Container.prototype.enterDocument = function() {
  goog.ui.Container.superClass_.enterDocument.call(this);

  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      this.registerChildId_(child);
    }
  }, this);

  // Detect right-to-left direction.
  var elem = this.getElement();

  // Call the renderer's initializeDom method to initialize the container's DOM.
  this.renderer_.initializeDom(this);

  // Initialize visibility (opt_force = true, so we don't dispatch events).
  this.setVisible(this.visible_, true);

  // Handle events dispatched by child controls.
  this.getHandler().
      listen(this, goog.ui.Component.EventType.ENTER,
          this.handleEnterItem).
      listen(this, goog.ui.Component.EventType.HIGHLIGHT,
          this.handleHighlightItem).
      listen(this, goog.ui.Component.EventType.UNHIGHLIGHT,
          this.handleUnHighlightItem).
      listen(this, goog.ui.Component.EventType.OPEN, this.handleOpenItem).
      listen(this, goog.ui.Component.EventType.CLOSE, this.handleCloseItem).

      // Handle mouse events.
      listen(elem, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).
      listen(goog.dom.getOwnerDocument(elem), goog.events.EventType.MOUSEUP,
          this.handleDocumentMouseUp).

      // Handle mouse events on behalf of controls in the container.
      listen(elem, [
        goog.events.EventType.MOUSEDOWN,
        goog.events.EventType.MOUSEUP,
        goog.events.EventType.MOUSEOVER,
        goog.events.EventType.MOUSEOUT
      ], this.handleChildMouseEvents);

  // If the container is focusable, set up keyboard event handling.
  if (this.isFocusable()) {
    this.enableFocusHandling_(true);
  }
};


/**
 * Sets up listening for events applicable to focusable containers.
 * @param {boolean} enable Whether to enable or disable focus handling.
 * @private
 */
goog.ui.Container.prototype.enableFocusHandling_ = function(enable) {
  var handler = this.getHandler();
  var keyTarget = this.getKeyEventTarget();
  if (enable) {
    handler.
        listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).
        listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur).
        listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent);
  } else {
    handler.
        unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).
        unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur).
        unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent);
  }
};


/**
 * Cleans up the container before its DOM is removed from the document, and
 * removes event handlers.  Overrides {@link goog.ui.Component#exitDocument}.
 */
goog.ui.Container.prototype.exitDocument = function() {
  // {@link #setHighlightedIndex} has to be called before
  // {@link goog.ui.Component#exitDocument}, otherwise it has no effect.
  this.setHighlightedIndex(-1);

  if (this.openItem_) {
    this.openItem_.setOpen(false);
  }

  this.mouseButtonPressed_ = false;

  goog.ui.Container.superClass_.exitDocument.call(this);
};


/** @inheritDoc */
goog.ui.Container.prototype.disposeInternal = function() {
  goog.ui.Container.superClass_.disposeInternal.call(this);

  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    this.keyHandler_ = null;
  }

  this.childElementIdMap_ = null;
  this.openItem_ = null;
  this.renderer_ = null;
};


// Default event handlers.


/**
 * Handles ENTER events raised by child controls when they are navigated to.
 * @param {goog.events.Event} e ENTER event to handle.
 * @return {boolean} Whether to prevent handleMouseOver from handling
 *    the event.
 */
goog.ui.Container.prototype.handleEnterItem = function(e) {
  // Allow the Control to highlight itself.
  return true;
};


/**
 * Handles HIGHLIGHT events dispatched by items in the container when
 * they are highlighted.
 * @param {goog.events.Event} e Highlight event to handle.
 */
goog.ui.Container.prototype.handleHighlightItem = function(e) {
  var index = this.indexOfChild(/** @type {goog.ui.Control} */ (e.target));
  if (index > -1 && index != this.highlightedIndex_) {
    var item = this.getHighlighted();
    if (item) {
      // Un-highlight previously highlighted item.
      item.setHighlighted(false);
    }

    this.highlightedIndex_ = index;
    item = this.getHighlighted();

    if (this.isMouseButtonPressed()) {
      // Activate item when mouse button is pressed, to allow MacOS-style
      // dragging to choose menu items.  Although this should only truly
      // happen if the highlight is due to mouse movements, there is little
      // harm in doing it for keyboard or programmatic highlights.
      item.setActive(true);
    }

    // Update open item if open item needs follow highlight.
    if (this.openFollowsHighlight_ &&
        this.openItem_ && item != this.openItem_) {
      if (item.isSupportedState(goog.ui.Component.State.OPENED)) {
        item.setOpen(true);
      } else {
        this.openItem_.setOpen(false);
      }
    }
  }
  goog.dom.a11y.setState(this.getElement(),
      goog.dom.a11y.State.ACTIVEDESCENDANT, e.target.getElement().id);
};


/**
 * Handles UNHIGHLIGHT events dispatched by items in the container when
 * they are unhighlighted.
 * @param {goog.events.Event} e Unhighlight event to handle.
 */
goog.ui.Container.prototype.handleUnHighlightItem = function(e) {
  if (e.target == this.getHighlighted()) {
    this.highlightedIndex_ = -1;
  }
  goog.dom.a11y.setState(this.getElement(),
      goog.dom.a11y.State.ACTIVEDESCENDANT, '');
};


/**
 * Handles OPEN events dispatched by items in the container when they are
 * opened.
 * @param {goog.events.Event} e Open event to handle.
 */
goog.ui.Container.prototype.handleOpenItem = function(e) {
  var item = /** @type {goog.ui.Control} */ (e.target);
  if (item && item != this.openItem_ && item.getParent() == this) {
    if (this.openItem_) {
      this.openItem_.setOpen(false);
    }
    this.openItem_ = item;
  }
};


/**
 * Handles CLOSE events dispatched by items in the container when they are
 * closed.
 * @param {goog.events.Event} e Close event to handle.
 */
goog.ui.Container.prototype.handleCloseItem = function(e) {
  if (e.target == this.openItem_) {
    this.openItem_ = null;
  }
};


/**
 * Handles mousedown events over the container.  The default implementation
 * sets the "mouse button pressed" flag and, if the container is focusable,
 * grabs keyboard focus.
 * @param {goog.events.BrowserEvent} e Mousedown event to handle.
 */
goog.ui.Container.prototype.handleMouseDown = function(e) {
  if (this.enabled_) {
    this.setMouseButtonPressed(true);
  }

  var keyTarget = this.getKeyEventTarget();
  if (keyTarget && goog.dom.isFocusableTabIndex(keyTarget)) {
    // The container is configured to receive keyboard focus.
    keyTarget.focus();
  } else {
    // The control isn't configured to receive keyboard focus; prevent it
    // from stealing focus or destroying the selection.
    e.preventDefault();
  }
};


/**
 * Handles mouseup events over the document.  The default implementation
 * clears the "mouse button pressed" flag.
 * @param {goog.events.BrowserEvent} e Mouseup event to handle.
 */
goog.ui.Container.prototype.handleDocumentMouseUp = function(e) {
  this.setMouseButtonPressed(false);
};


/**
 * Handles mouse events originating from nodes belonging to the controls hosted
 * in the container.  Locates the child control based on the DOM node that
 * dispatched the event, and forwards the event to the control for handling.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 */
goog.ui.Container.prototype.handleChildMouseEvents = function(e) {
  var control = this.getOwnerControl(/** @type {Node} */ (e.target));
  if (control) {
    // Child control identified; forward the event.
    switch (e.type) {
      case goog.events.EventType.MOUSEDOWN:
        control.handleMouseDown(e);
        break;
      case goog.events.EventType.MOUSEUP:
        control.handleMouseUp(e);
        break;
      case goog.events.EventType.MOUSEOVER:
        control.handleMouseOver(e);
        break;
      case goog.events.EventType.MOUSEOUT:
        control.handleMouseOut(e);
        break;
    }
  }
};


/**
 * Returns the child control that owns the given DOM node, or null if no such
 * control is found.
 * @param {Node} node DOM node whose owner is to be returned.
 * @return {goog.ui.Control?} Control hosted in the container to which the node
 *     belongs (if found).
 * @protected
 */
goog.ui.Container.prototype.getOwnerControl = function(node) {
  // Ensure that this container actually has child controls before
  // looking up the owner.
  if (this.childElementIdMap_) {
    var elem = this.getElement();
    // See http://b/2964418 . IE9 appears to evaluate '!=' incorrectly, so
    // using '!==' instead.
    // TODO(user): Possibly revert this change if/when IE9 fixes the issue.
    while (node && node !== elem) {
      var id = node.id;
      if (id in this.childElementIdMap_) {
        return this.childElementIdMap_[id];
      }
      node = node.parentNode;
    }
  }
  return null;
};


/**
 * Handles focus events raised when the container's key event target receives
 * keyboard focus.
 * @param {goog.events.BrowserEvent} e Focus event to handle.
 */
goog.ui.Container.prototype.handleFocus = function(e) {
  // No-op in the base class.
};


/**
 * Handles blur events raised when the container's key event target loses
 * keyboard focus.  The default implementation clears the highlight index.
 * @param {goog.events.BrowserEvent} e Blur event to handle.
 */
goog.ui.Container.prototype.handleBlur = function(e) {
  this.setHighlightedIndex(-1);
  this.setMouseButtonPressed(false);
  // If the container loses focus, and one of its children is open, close it.
  if (this.openItem_) {
    this.openItem_.setOpen(false);
  }
};


/**
 * Attempts to handle a keyboard event, if the control is enabled, by calling
 * {@link handleKeyEventInternal}.  Considered protected; should only be used
 * within this package and by subclasses.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 */
goog.ui.Container.prototype.handleKeyEvent = function(e) {
  if (this.isEnabled() && this.isVisible() &&
      (this.getChildCount() != 0 || this.keyEventTarget_) &&
      this.handleKeyEventInternal(e)) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
};


/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the container is enabled, and a child is highlighted,
 * calls the child control's {@code handleKeyEvent} method to give the control
 * a chance to handle the event first.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 */
goog.ui.Container.prototype.handleKeyEventInternal = function(e) {
  // Give the highlighted control the chance to handle the key event.
  var highlighted = this.getHighlighted();
  if (highlighted && typeof highlighted.handleKeyEvent == 'function' &&
      highlighted.handleKeyEvent(e)) {
    return true;
  }

  // Give the open control the chance to handle the key event.
  if (this.openItem_ && this.openItem_ != highlighted &&
      typeof this.openItem_.handleKeyEvent == 'function' &&
      this.openItem_.handleKeyEvent(e)) {
    return true;
  }

  // Do not handle the key event if any modifier key is pressed.
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }

  // Either nothing is highlighted, or the highlighted control didn't handle
  // the key event, so attempt to handle it here.
  switch (e.keyCode) {
    case goog.events.KeyCodes.ESC:
      if (this.isFocusable()) {
        this.getKeyEventTarget().blur();
      } else {
        return false;
      }
      break;

    case goog.events.KeyCodes.HOME:
      this.highlightFirst();
      break;

    case goog.events.KeyCodes.END:
      this.highlightLast();
      break;

    case goog.events.KeyCodes.UP:
      if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightPrevious();
      } else {
        return false;
      }
      break;

    case goog.events.KeyCodes.LEFT:
      if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if (this.isRightToLeft()) {
          this.highlightNext();
        } else {
          this.highlightPrevious();
        }
      } else {
        return false;
      }
      break;

    case goog.events.KeyCodes.DOWN:
      if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightNext();
      } else {
        return false;
      }
      break;

    case goog.events.KeyCodes.RIGHT:
      if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if (this.isRightToLeft()) {
          this.highlightPrevious();
        } else {
          this.highlightNext();
        }
      } else {
        return false;
      }
      break;

    default:
      return false;
  }

  return true;
};


// Child component management.


/**
 * Creates a DOM ID for the child control and registers it to an internal
 * hash table to be able to find it fast by id.
 * @param {goog.ui.Control} child The child control. Its root element has
 *     to be created yet.
 * @private
 */
goog.ui.Container.prototype.registerChildId_ = function(child) {
  // Map the DOM ID of the control's root element to the control itself.
  var childElem = child.getElement();

  // If the control's root element doesn't have a DOM ID assign one.
  var id = childElem.id || (childElem.id = child.getId());

  // Lazily create the child element ID map on first use.
  if (!this.childElementIdMap_) {
    this.childElementIdMap_ = {};
  }
  this.childElementIdMap_[id] = child;
};


/**
 * Adds the specified control as the last child of this container.  See
 * {@link goog.ui.Container#addChildAt} for detailed semantics.
 * @param {goog.ui.Control} child The new child control.
 * @param {boolean=} opt_render Whether the new child should be rendered
 *     immediately after being added (defaults to false).
 */
goog.ui.Container.prototype.addChild = function(child, opt_render) {
  goog.ui.Container.superClass_.addChild.call(this, child, opt_render);
};


/**
 * Overrides {@link goog.ui.Container#getChild} to make it clear that it
 * only returns {@link goog.ui.Control}s.
 * @param {string} id Child component ID.
 * @return {goog.ui.Control} The child with the given ID; null if none.
 * @override
 */
goog.ui.Container.prototype.getChild;


/**
 * Overrides {@link goog.ui.Container#getChildAt} to make it clear that it
 * only returns {@link goog.ui.Control}s.
 * @param {number} index 0-based index.
 * @return {goog.ui.Control} The child with the given ID; null if none.
 * @override
 */
goog.ui.Container.prototype.getChildAt;


/**
 * Adds the control as a child of this container at the given 0-based index.
 * Overrides {@link goog.ui.Component#addChildAt} by also updating the
 * container's highlight index.  Since {@link goog.ui.Component#addChild} uses
 * {@link #addChildAt} internally, we only need to override this method.
 * @param {goog.ui.Control} control New child.
 * @param {number} index Index at which the new child is to be added.
 * @param {boolean=} opt_render Whether the new child should be rendered
 *     immediately after being added (defaults to false).
 */
goog.ui.Container.prototype.addChildAt = function(control, index, opt_render) {
  // Make sure the child control dispatches HIGHLIGHT, UNHIGHLIGHT, OPEN, and
  // CLOSE events, and that it doesn't steal keyboard focus.
  control.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true);
  control.setDispatchTransitionEvents(goog.ui.Component.State.OPENED, true);
  if (this.isFocusable() || !this.isFocusableChildrenAllowed()) {
    control.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  }

  // Disable mouse event handling by child controls.
  control.setHandleMouseEvents(false);

  // Let the superclass implementation do the work.
  goog.ui.Container.superClass_.addChildAt.call(this, control, index,
      opt_render);

  if (opt_render && this.isInDocument()) {
    this.registerChildId_(control);
  }

  // Update the highlight index, if needed.
  if (index <= this.highlightedIndex_) {
    this.highlightedIndex_++;
  }
};


/**
 * Removes a child control.  Overrides {@link goog.ui.Component#removeChild} by
 * updating the highlight index.  Since {@link goog.ui.Component#removeChildAt}
 * uses {@link #removeChild} internally, we only need to override this method.
 * @param {string|goog.ui.Control} control The ID of the child to remove, or
 *     the control itself.
 * @param {boolean=} opt_unrender Whether to call {@code exitDocument} on the
 *     removed control, and detach its DOM from the document (defaults to
 *     false).
 * @return {goog.ui.Control} The removed control, if any.
 */
goog.ui.Container.prototype.removeChild = function(control, opt_unrender) {
  control = goog.isString(control) ? this.getChild(control) : control;

  if (control) {
    var index = this.indexOfChild(control);
    if (index != -1) {
      if (index == this.highlightedIndex_) {
        control.setHighlighted(false);
      } else if (index < this.highlightedIndex_) {
        this.highlightedIndex_--;
      }
    }

    // Remove the mapping from the child element ID map.
    var childElem = control.getElement();
    if (childElem && childElem.id) {
      goog.object.remove(this.childElementIdMap_, childElem.id);
    }
  }

  control = /** @type {goog.ui.Control} */ (
      goog.ui.Container.superClass_.removeChild.call(this, control,
          opt_unrender));

  // Re-enable mouse event handling (in case the control is reused elsewhere).
  control.setHandleMouseEvents(true);

  return control;
};


// Container state management.


/**
 * Returns the container's orientation.
 * @return {?goog.ui.Container.Orientation} Container orientation.
 */
goog.ui.Container.prototype.getOrientation = function() {
  return this.orientation_;
};


/**
 * Sets the container's orientation.
 * @param {goog.ui.Container.Orientation} orientation Container orientation.
 */
// TODO(user): Do we need to support containers with dynamic orientation?
goog.ui.Container.prototype.setOrientation = function(orientation) {
  if (this.getElement()) {
    // Too late.
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  this.orientation_ = orientation;
};


/**
 * Returns true if the container's visibility is set to visible, false if
 * it is set to hidden.  A container that is set to hidden is guaranteed
 * to be hidden from the user, but the reverse isn't necessarily true.
 * A container may be set to visible but can otherwise be obscured by another
 * element, rendered off-screen, or hidden using direct CSS manipulation.
 * @return {boolean} Whether the container is set to be visible.
 */
goog.ui.Container.prototype.isVisible = function() {
  return this.visible_;
};


/**
 * Shows or hides the container.  Does nothing if the container already has
 * the requested visibility.  Otherwise, dispatches a SHOW or HIDE event as
 * appropriate, giving listeners a chance to prevent the visibility change.
 * @param {boolean} visible Whether to show or hide the container.
 * @param {boolean=} opt_force If true, doesn't check whether the container
 *     already has the requested visibility, and doesn't dispatch any events.
 * @return {boolean} Whether the visibility was changed.
 */
goog.ui.Container.prototype.setVisible = function(visible, opt_force) {
  if (opt_force || (this.visible_ != visible && this.dispatchEvent(visible ?
      goog.ui.Component.EventType.SHOW : goog.ui.Component.EventType.HIDE))) {
    this.visible_ = visible;

    var elem = this.getElement();
    if (elem) {
      goog.style.showElement(elem, visible);
      if (this.isFocusable()) {
        // Enable keyboard access only for enabled & visible containers.
        this.renderer_.enableTabIndex(this.getKeyEventTarget(),
            this.enabled_ && this.visible_);
      }
      if (!opt_force) {
        this.dispatchEvent(this.visible_ ?
            goog.ui.Container.EventType.AFTER_SHOW :
            goog.ui.Container.EventType.AFTER_HIDE);
      }
    }

    return true;
  }

  return false;
};


/**
 * Returns true if the container is enabled, false otherwise.
 * @return {boolean} Whether the container is enabled.
 */
goog.ui.Container.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * Enables/disables the container based on the {@code enable} argument.
 * Dispatches an {@code ENABLED} or {@code DISABLED} event prior to changing
 * the container's state, which may be caught and canceled to prevent the
 * container from changing state.  Also enables/disables child controls.
 * @param {boolean} enable Whether to enable or disable the container.
 */
goog.ui.Container.prototype.setEnabled = function(enable) {
  if (this.enabled_ != enable && this.dispatchEvent(enable ?
      goog.ui.Component.EventType.ENABLE :
      goog.ui.Component.EventType.DISABLE)) {
    if (enable) {
      // Flag the container as enabled first, then update children.  This is
      // because controls can't be enabled if their parent is disabled.
      this.enabled_ = true;
      this.forEachChild(function(child) {
        // Enable child control unless it is flagged.
        if (child.wasDisabled) {
          delete child.wasDisabled;
        } else {
          child.setEnabled(true);
        }
      });
    } else {
      // Disable children first, then flag the container as disabled.  This is
      // because controls can't be disabled if their parent is already disabled.
      this.forEachChild(function(child) {
        // Disable child control, or flag it if it's already disabled.
        if (child.isEnabled()) {
          child.setEnabled(false);
        } else {
          child.wasDisabled = true;
        }
      });
      this.enabled_ = false;
      this.setMouseButtonPressed(false);
    }

    if (this.isFocusable()) {
      // Enable keyboard access only for enabled & visible components.
      this.renderer_.enableTabIndex(this.getKeyEventTarget(),
          enable && this.visible_);
    }
  }
};


/**
 * Returns true if the container is focusable, false otherwise.  The default
 * is true.  Focusable containers always have a tab index and allocate a key
 * handler to handle keyboard events while focused.
 * @return {boolean} Whether the component is focusable.
 */
goog.ui.Container.prototype.isFocusable = function() {
  return this.focusable_;
};


/**
 * Sets whether the container is focusable.  The default is true.  Focusable
 * containers always have a tab index and allocate a key handler to handle
 * keyboard events while focused.
 * @param {boolean} focusable Whether the component is to be focusable.
 */
goog.ui.Container.prototype.setFocusable = function(focusable) {
  if (focusable != this.focusable_ && this.isInDocument()) {
    this.enableFocusHandling_(focusable);
  }
  this.focusable_ = focusable;
  if (this.enabled_ && this.visible_) {
    this.renderer_.enableTabIndex(this.getKeyEventTarget(), focusable);
  }
};


/**
 * Returns true if the container allows children to be focusable, false
 * otherwise.  Only effective if the container is not focusable.
 * @return {boolean} Whether children should be focusable.
 */
goog.ui.Container.prototype.isFocusableChildrenAllowed = function() {
  return this.allowFocusableChildren_;
};


/**
 * Sets whether the container allows children to be focusable, false
 * otherwise.  Only effective if the container is not focusable.
 * @param {boolean} focusable Whether the children should be focusable.
 */
goog.ui.Container.prototype.setFocusableChildrenAllowed = function(focusable) {
  this.allowFocusableChildren_ = focusable;
};


/**
 * @return {boolean} Whether highlighting a child component should also open it.
 */
goog.ui.Container.prototype.isOpenFollowsHighlight = function() {
  return this.openFollowsHighlight_;
};


/**
 * Sets whether highlighting a child component should also open it.
 * @param {boolean} follow Whether highlighting a child component also opens it.
 */
goog.ui.Container.prototype.setOpenFollowsHighlight = function(follow) {
  this.openFollowsHighlight_ = follow;
};


// Highlight management.


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
goog.ui.Container.prototype.getHighlightedIndex = function() {
  return this.highlightedIndex_;
};


/**
 * Highlights the item at the given 0-based index (if any).  If another item
 * was previously highlighted, it is un-highlighted.
 * @param {number} index Index of item to highlight (-1 removes the current
 *     highlight).
 */
goog.ui.Container.prototype.setHighlightedIndex = function(index) {
  var child = this.getChildAt(index);
  if (child) {
    child.setHighlighted(true);
  } else if (this.highlightedIndex_ > -1) {
    this.getHighlighted().setHighlighted(false);
  }
};


/**
 * Highlights the given item if it exists and is a child of the container;
 * otherwise un-highlights the currently highlighted item.
 * @param {goog.ui.Control} item Item to highlight.
 */
goog.ui.Container.prototype.setHighlighted = function(item) {
  this.setHighlightedIndex(this.indexOfChild(item));
};


/**
 * Returns the currently highlighted item (if any).
 * @return {goog.ui.Control?} Highlighted item (null if none).
 */
goog.ui.Container.prototype.getHighlighted = function() {
  return this.getChildAt(this.highlightedIndex_);
};


/**
 * Highlights the first highlightable item in the container
 */
goog.ui.Container.prototype.highlightFirst = function() {
  this.highlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.getChildCount() - 1);
};


/**
 * Highlights the last highlightable item in the container.
 */
goog.ui.Container.prototype.highlightLast = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, 0);
};


/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 */
goog.ui.Container.prototype.highlightNext = function() {
  this.highlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.highlightedIndex_);
};


/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 */
goog.ui.Container.prototype.highlightPrevious = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, this.highlightedIndex_);
};


/**
 * Helper function that manages the details of moving the highlight among
 * child controls in response to keyboard events.
 * @param {function(number, number) : number} fn Function that accepts the
 *     current and maximum indices, and returns the next index to check.
 * @param {number} startIndex Start index.
 * @return {boolean} Whether the highlight has changed.
 * @protected
 */
goog.ui.Container.prototype.highlightHelper = function(fn, startIndex) {
  // If the start index is -1 (meaning there's nothing currently highlighted),
  // try starting from the currently open item, if any.
  var curIndex = startIndex < 0 ?
      this.indexOfChild(this.openItem_) : startIndex;
  var numItems = this.getChildCount();

  curIndex = fn.call(this, curIndex, numItems);
  var visited = 0;
  while (visited <= numItems) {
    var control = this.getChildAt(curIndex);
    if (control && this.canHighlightItem(control)) {
      this.setHighlightedIndexFromKeyEvent(curIndex);
      return true;
    }
    visited++;
    curIndex = fn.call(this, curIndex, numItems);
  }
  return false;
};


/**
 * Returns whether the given item can be highlighted.
 * @param {goog.ui.Control} item The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @protected
 */
goog.ui.Container.prototype.canHighlightItem = function(item) {
  return item.isVisible() && item.isEnabled() &&
      item.isSupportedState(goog.ui.Component.State.HOVER);
};


/**
 * Helper method that sets the highlighted index to the given index in response
 * to a keyboard event.  The base class implementation simply calls the
 * {@link #setHighlightedIndex} method, but subclasses can override this
 * behavior as needed.
 * @param {number} index Index of item to highlight.
 * @protected
 */
goog.ui.Container.prototype.setHighlightedIndexFromKeyEvent = function(index) {
  this.setHighlightedIndex(index);
};


/**
 * Returns the currently open (expanded) control in the container (null if
 * none).
 * @return {goog.ui.Control?} The currently open control.
 */
goog.ui.Container.prototype.getOpenItem = function() {
  return this.openItem_;
};


/**
 * Returns true if the mouse button is pressed, false otherwise.
 * @return {boolean} Whether the mouse button is pressed.
 */
goog.ui.Container.prototype.isMouseButtonPressed = function() {
  return this.mouseButtonPressed_;
};


/**
 * Sets or clears the "mouse button pressed" flag.
 * @param {boolean} pressed Whether the mouse button is presed.
 */
goog.ui.Container.prototype.setMouseButtonPressed = function(pressed) {
  this.mouseButtonPressed_ = pressed;
};
