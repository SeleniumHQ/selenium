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
 * @fileoverview Base class for UI controls such as buttons, menus, menu items,
 * toolbar buttons, etc.  The implementation is based on a generalized version
 * of {@link goog.ui.MenuItem}.
 * TODO(attila):  If the renderer framework works well, pull it into Component.
 *
 * @author attila@google.com (Attila Bodis)
 * @see ../demos/control.html
 * @see http://code.google.com/p/closure-library/wiki/IntroToControls
 */

goog.provide('goog.ui.Control');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.string');
goog.require('goog.ui.Component');
/** @suppress {extraRequire} */
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.registry');
goog.require('goog.userAgent');



/**
 * Base class for UI controls.  Extends {@link goog.ui.Component} by adding
 * the following:
 *  <ul>
 *    <li>a {@link goog.events.KeyHandler}, to simplify keyboard handling,
 *    <li>a pluggable <em>renderer</em> framework, to simplify the creation of
 *        simple controls without the need to subclass this class,
 *    <li>the notion of component <em>content</em>, like a text caption or DOM
 *        structure displayed in the component (e.g. a button label),
 *    <li>getter and setter for component content, as well as a getter and
 *        setter specifically for caption text (for convenience),
 *    <li>support for hiding/showing the component,
      <li>fine-grained control over supported states and state transition
          events, and
 *    <li>default mouse and keyboard event handling.
 *  </ul>
 * This class has sufficient built-in functionality for most simple UI controls.
 * All controls dispatch SHOW, HIDE, ENTER, LEAVE, and ACTION events on show,
 * hide, mouseover, mouseout, and user action, respectively.  Additional states
 * are also supported.  See closure/demos/control.html
 * for example usage.
 * @param {goog.ui.ControlContent=} opt_content Text caption or DOM structure
 *     to display as the content of the control (if any).
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.Control = function(opt_content, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ =
      opt_renderer || goog.ui.registry.getDefaultRenderer(this.constructor);
  this.setContentInternal(goog.isDef(opt_content) ? opt_content : null);

  /** @private {?string} The control's aria-label. */
  this.ariaLabel_ = null;

  /** @private {goog.ui.Control.IeMouseEventSequenceSimulator_} */
  this.ieMouseEventSequenceSimulator_;
};
goog.inherits(goog.ui.Control, goog.ui.Component);
goog.tagUnsealableClass(goog.ui.Control);


// Renderer registry.
// TODO(attila): Refactor existing usages inside Google in a follow-up CL.


/**
 * Maps a CSS class name to a function that returns a new instance of
 * {@link goog.ui.Control} or a subclass thereof, suitable to decorate
 * an element that has the specified CSS class.  UI components that extend
 * {@link goog.ui.Control} and want {@link goog.ui.Container}s to be able
 * to discover and decorate elements using them should register a factory
 * function via this API.
 * @param {string} className CSS class name.
 * @param {Function} decoratorFunction Function that takes no arguments and
 *     returns a new instance of a control to decorate an element with the
 *     given class.
 * @deprecated Use {@link goog.ui.registry.setDecoratorByClassName} instead.
 */
goog.ui.Control.registerDecorator = goog.ui.registry.setDecoratorByClassName;


/**
 * Takes an element and returns a new instance of {@link goog.ui.Control}
 * or a subclass, suitable to decorate it (based on the element's CSS class).
 * @param {Element} element Element to decorate.
 * @return {goog.ui.Control?} New control instance to decorate the element
 *     (null if none).
 * @deprecated Use {@link goog.ui.registry.getDecorator} instead.
 */
goog.ui.Control.getDecorator =
    /** @type {function(Element): goog.ui.Control} */ (
        goog.ui.registry.getDecorator);


/**
 * Renderer associated with the component.
 * @type {goog.ui.ControlRenderer|undefined}
 * @private
 */
goog.ui.Control.prototype.renderer_;


/**
 * Text caption or DOM structure displayed in the component.
 * @type {goog.ui.ControlContent}
 * @private
 */
goog.ui.Control.prototype.content_ = null;


/**
 * Current component state; a bit mask of {@link goog.ui.Component.State}s.
 * @type {number}
 * @private
 */
goog.ui.Control.prototype.state_ = 0x00;


/**
 * A bit mask of {@link goog.ui.Component.State}s this component supports.
 * @type {number}
 * @private
 */
goog.ui.Control.prototype.supportedStates_ = goog.ui.Component.State.DISABLED |
    goog.ui.Component.State.HOVER | goog.ui.Component.State.ACTIVE |
    goog.ui.Component.State.FOCUSED;


/**
 * A bit mask of {@link goog.ui.Component.State}s for which this component
 * provides default event handling.  For example, a component that handles
 * the HOVER state automatically will highlight itself on mouseover, whereas
 * a component that doesn't handle HOVER automatically will only dispatch
 * ENTER and LEAVE events but not call {@link setHighlighted} on itself.
 * By default, components provide default event handling for all states.
 * Controls hosted in containers (e.g. menu items in a menu, or buttons in a
 * toolbar) will typically want to have their container manage their highlight
 * state.  Selectable controls managed by a selection model will also typically
 * want their selection state to be managed by the model.
 * @type {number}
 * @private
 */
goog.ui.Control.prototype.autoStates_ = goog.ui.Component.State.ALL;


/**
 * A bit mask of {@link goog.ui.Component.State}s for which this component
 * dispatches state transition events.  Because events are expensive, the
 * default behavior is to not dispatch any state transition events at all.
 * Use the {@link #setDispatchTransitionEvents} API to request transition
 * events  as needed.  Subclasses may enable transition events by default.
 * Controls hosted in containers or managed by a selection model will typically
 * want to dispatch transition events.
 * @type {number}
 * @private
 */
goog.ui.Control.prototype.statesWithTransitionEvents_ = 0x00;


/**
 * Component visibility.
 * @type {boolean}
 * @private
 */
goog.ui.Control.prototype.visible_ = true;


/**
 * Keyboard event handler.
 * @type {goog.events.KeyHandler}
 * @private
 */
goog.ui.Control.prototype.keyHandler_;


/**
 * Additional class name(s) to apply to the control's root element, if any.
 * @type {Array<string>?}
 * @private
 */
goog.ui.Control.prototype.extraClassNames_ = null;


/**
 * Whether the control should listen for and handle mouse events; defaults to
 * true.
 * @type {boolean}
 * @private
 */
goog.ui.Control.prototype.handleMouseEvents_ = true;


/**
 * Whether the control allows text selection within its DOM.  Defaults to false.
 * @type {boolean}
 * @private
 */
goog.ui.Control.prototype.allowTextSelection_ = false;


/**
 * The control's preferred ARIA role.
 * @type {?goog.a11y.aria.Role}
 * @private
 */
goog.ui.Control.prototype.preferredAriaRole_ = null;


// Event handler and renderer management.


/**
 * Returns true if the control is configured to handle its own mouse events,
 * false otherwise.  Controls not hosted in {@link goog.ui.Container}s have
 * to handle their own mouse events, but controls hosted in containers may
 * allow their parent to handle mouse events on their behalf.  Considered
 * protected; should only be used within this package and by subclasses.
 * @return {boolean} Whether the control handles its own mouse events.
 */
goog.ui.Control.prototype.isHandleMouseEvents = function() {
  return this.handleMouseEvents_;
};


/**
 * Enables or disables mouse event handling for the control.  Containers may
 * use this method to disable mouse event handling in their child controls.
 * Considered protected; should only be used within this package and by
 * subclasses.
 * @param {boolean} enable Whether to enable or disable mouse event handling.
 */
goog.ui.Control.prototype.setHandleMouseEvents = function(enable) {
  if (this.isInDocument() && enable != this.handleMouseEvents_) {
    // Already in the document; need to update event handler.
    this.enableMouseEventHandling_(enable);
  }
  this.handleMouseEvents_ = enable;
};


/**
 * Returns the DOM element on which the control is listening for keyboard
 * events (null if none).
 * @return {Element} Element on which the control is listening for key
 *     events.
 */
goog.ui.Control.prototype.getKeyEventTarget = function() {
  // Delegate to renderer.
  return this.renderer_.getKeyEventTarget(this);
};


/**
 * Returns the keyboard event handler for this component, lazily created the
 * first time this method is called.  Considered protected; should only be
 * used within this package and by subclasses.
 * @return {!goog.events.KeyHandler} Keyboard event handler for this component.
 * @protected
 */
goog.ui.Control.prototype.getKeyHandler = function() {
  return this.keyHandler_ || (this.keyHandler_ = new goog.events.KeyHandler());
};


/**
 * Returns the renderer used by this component to render itself or to decorate
 * an existing element.
 * @return {goog.ui.ControlRenderer|undefined} Renderer used by the component
 *     (undefined if none).
 */
goog.ui.Control.prototype.getRenderer = function() {
  return this.renderer_;
};


/**
 * Registers the given renderer with the component.  Changing renderers after
 * the component has entered the document is an error.
 * @param {goog.ui.ControlRenderer} renderer Renderer used by the component.
 * @throws {Error} If the control is already in the document.
 */
goog.ui.Control.prototype.setRenderer = function(renderer) {
  if (this.isInDocument()) {
    // Too late.
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  if (this.getElement()) {
    // The component has already been rendered, but isn't yet in the document.
    // Replace the renderer and delete the current DOM, so it can be re-rendered
    // using the new renderer the next time someone calls render().
    this.setElementInternal(null);
  }

  this.renderer_ = renderer;
};


// Support for additional styling.


/**
 * Returns any additional class name(s) to be applied to the component's
 * root element, or null if no extra class names are needed.
 * @return {Array<string>?} Additional class names to be applied to
 *     the component's root element (null if none).
 */
goog.ui.Control.prototype.getExtraClassNames = function() {
  return this.extraClassNames_;
};


/**
 * Adds the given class name to the list of classes to be applied to the
 * component's root element.
 * @param {string} className Additional class name to be applied to the
 *     component's root element.
 */
goog.ui.Control.prototype.addClassName = function(className) {
  if (className) {
    if (this.extraClassNames_) {
      if (!goog.array.contains(this.extraClassNames_, className)) {
        this.extraClassNames_.push(className);
      }
    } else {
      this.extraClassNames_ = [className];
    }
    this.renderer_.enableExtraClassName(this, className, true);
  }
};


/**
 * Removes the given class name from the list of classes to be applied to
 * the component's root element.
 * @param {string} className Class name to be removed from the component's root
 *     element.
 */
goog.ui.Control.prototype.removeClassName = function(className) {
  if (className && this.extraClassNames_ &&
      goog.array.remove(this.extraClassNames_, className)) {
    if (this.extraClassNames_.length == 0) {
      this.extraClassNames_ = null;
    }
    this.renderer_.enableExtraClassName(this, className, false);
  }
};


/**
 * Adds or removes the given class name to/from the list of classes to be
 * applied to the component's root element.
 * @param {string} className CSS class name to add or remove.
 * @param {boolean} enable Whether to add or remove the class name.
 */
goog.ui.Control.prototype.enableClassName = function(className, enable) {
  if (enable) {
    this.addClassName(className);
  } else {
    this.removeClassName(className);
  }
};


// Standard goog.ui.Component implementation.


/**
 * Creates the control's DOM.  Overrides {@link goog.ui.Component#createDom} by
 * delegating DOM manipulation to the control's renderer.
 * @override
 */
goog.ui.Control.prototype.createDom = function() {
  var element = this.renderer_.createDom(this);
  this.setElementInternal(element);

  // Initialize ARIA role.
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());

  // Initialize text selection.
  if (!this.isAllowTextSelection()) {
    // The renderer is assumed to create selectable elements.  Since making
    // elements unselectable is expensive, only do it if needed (bug 1037090).
    this.renderer_.setAllowTextSelection(element, false);
  }

  // Initialize visibility.
  if (!this.isVisible()) {
    // The renderer is assumed to create visible elements. Since hiding
    // elements can be expensive, only do it if needed (bug 1037105).
    this.renderer_.setVisible(element, false);
  }
};


/**
 * Returns the control's preferred ARIA role. This can be used by a control to
 * override the role that would be assigned by the renderer.  This is useful in
 * cases where a different ARIA role is appropriate for a control because of the
 * context in which it's used.  E.g., a {@link goog.ui.MenuButton} added to a
 * {@link goog.ui.Select} should have an ARIA role of LISTBOX and not MENUITEM.
 * @return {?goog.a11y.aria.Role} This control's preferred ARIA role or null if
 *     no preferred ARIA role is set.
 */
goog.ui.Control.prototype.getPreferredAriaRole = function() {
  return this.preferredAriaRole_;
};


/**
 * Sets the control's preferred ARIA role. This can be used to override the role
 * that would be assigned by the renderer.  This is useful in cases where a
 * different ARIA role is appropriate for a control because of the
 * context in which it's used.  E.g., a {@link goog.ui.MenuButton} added to a
 * {@link goog.ui.Select} should have an ARIA role of LISTBOX and not MENUITEM.
 * @param {goog.a11y.aria.Role} role This control's preferred ARIA role.
 */
goog.ui.Control.prototype.setPreferredAriaRole = function(role) {
  this.preferredAriaRole_ = role;
};


/**
 * Gets the control's aria label.
 * @return {?string} This control's aria label.
 */
goog.ui.Control.prototype.getAriaLabel = function() {
  return this.ariaLabel_;
};


/**
 * Sets the control's aria label. This can be used to assign aria label to the
 * element after it is rendered.
 * @param {string} label The string to set as the aria label for this control.
 *     No escaping is done on this value.
 */
goog.ui.Control.prototype.setAriaLabel = function(label) {
  this.ariaLabel_ = label;
  var element = this.getElement();
  if (element) {
    this.renderer_.setAriaLabel(element, label);
  }
};


/**
 * Returns the DOM element into which child components are to be rendered,
 * or null if the control itself hasn't been rendered yet.  Overrides
 * {@link goog.ui.Component#getContentElement} by delegating to the renderer.
 * @return {Element} Element to contain child elements (null if none).
 * @override
 */
goog.ui.Control.prototype.getContentElement = function() {
  // Delegate to renderer.
  return this.renderer_.getContentElement(this.getElement());
};


/**
 * Returns true if the given element can be decorated by this component.
 * Overrides {@link goog.ui.Component#canDecorate}.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the element can be decorated by this component.
 * @override
 */
goog.ui.Control.prototype.canDecorate = function(element) {
  // Controls support pluggable renderers; delegate to the renderer.
  return this.renderer_.canDecorate(element);
};


/**
 * Decorates the given element with this component. Overrides {@link
 * goog.ui.Component#decorateInternal} by delegating DOM manipulation
 * to the control's renderer.
 * @param {Element} element Element to decorate.
 * @protected
 * @override
 */
goog.ui.Control.prototype.decorateInternal = function(element) {
  element = this.renderer_.decorate(this, element);
  this.setElementInternal(element);

  // Initialize ARIA role.
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());

  // Initialize text selection.
  if (!this.isAllowTextSelection()) {
    // Decorated elements are assumed to be selectable.  Since making elements
    // unselectable is expensive, only do it if needed (bug 1037090).
    this.renderer_.setAllowTextSelection(element, false);
  }

  // Initialize visibility based on the decorated element's styling.
  this.visible_ = element.style.display != 'none';
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
goog.ui.Control.prototype.enterDocument = function() {
  goog.ui.Control.superClass_.enterDocument.call(this);

  // Call the renderer's setAriaStates method to set element's aria attributes.
  this.renderer_.setAriaStates(this, this.getElementStrict());

  // Call the renderer's initializeDom method to configure properties of the
  // control's DOM that can only be done once it's in the document.
  this.renderer_.initializeDom(this);

  // Initialize event handling if at least one state other than DISABLED is
  // supported.
  if (this.supportedStates_ & ~goog.ui.Component.State.DISABLED) {
    // Initialize mouse event handling if the control is configured to handle
    // its own mouse events.  (Controls hosted in containers don't need to
    // handle their own mouse events.)
    if (this.isHandleMouseEvents()) {
      this.enableMouseEventHandling_(true);
    }

    // Initialize keyboard event handling if the control is focusable and has
    // a key event target.  (Controls hosted in containers typically aren't
    // focusable, allowing their container to handle keyboard events for them.)
    if (this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
      var keyTarget = this.getKeyEventTarget();
      if (keyTarget) {
        var keyHandler = this.getKeyHandler();
        keyHandler.attach(keyTarget);
        this.getHandler()
            .listen(
                keyHandler, goog.events.KeyHandler.EventType.KEY,
                this.handleKeyEvent)
            .listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus)
            .listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur);
      }
    }
  }
};


/**
 * Enables or disables mouse event handling on the control.
 * @param {boolean} enable Whether to enable mouse event handling.
 * @private
 */
goog.ui.Control.prototype.enableMouseEventHandling_ = function(enable) {
  var handler = this.getHandler();
  var element = this.getElement();
  if (enable) {
    handler
        .listen(element, goog.events.EventType.MOUSEOVER, this.handleMouseOver)
        .listen(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown)
        .listen(element, goog.events.EventType.MOUSEUP, this.handleMouseUp)
        .listen(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if (this.handleContextMenu != goog.nullFunction) {
      handler.listen(
          element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu);
    }
    if (goog.userAgent.IE) {
      // Versions of IE before 9 send only one click event followed by a
      // dblclick, so we must explicitly listen for these. In later versions,
      // two click events are fired  and so a dblclick listener is unnecessary.
      if (!goog.userAgent.isVersionOrHigher(9)) {
        handler.listen(
            element, goog.events.EventType.DBLCLICK, this.handleDblClick);
      }
      if (!this.ieMouseEventSequenceSimulator_) {
        this.ieMouseEventSequenceSimulator_ =
            new goog.ui.Control.IeMouseEventSequenceSimulator_(this);
        this.registerDisposable(this.ieMouseEventSequenceSimulator_);
      }
    }
  } else {
    handler
        .unlisten(
            element, goog.events.EventType.MOUSEOVER, this.handleMouseOver)
        .unlisten(
            element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown)
        .unlisten(element, goog.events.EventType.MOUSEUP, this.handleMouseUp)
        .unlisten(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if (this.handleContextMenu != goog.nullFunction) {
      handler.unlisten(
          element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu);
    }
    if (goog.userAgent.IE) {
      if (!goog.userAgent.isVersionOrHigher(9)) {
        handler.unlisten(
            element, goog.events.EventType.DBLCLICK, this.handleDblClick);
      }
      goog.dispose(this.ieMouseEventSequenceSimulator_);
      this.ieMouseEventSequenceSimulator_ = null;
    }
  }
};


/**
 * Cleans up the component before its DOM is removed from the document, and
 * removes event handlers.  Overrides {@link goog.ui.Component#exitDocument}
 * by making sure that components that are removed from the document aren't
 * focusable (i.e. have no tab index).
 * @override
 */
goog.ui.Control.prototype.exitDocument = function() {
  goog.ui.Control.superClass_.exitDocument.call(this);
  if (this.keyHandler_) {
    this.keyHandler_.detach();
  }
  if (this.isVisible() && this.isEnabled()) {
    this.renderer_.setFocusable(this, false);
  }
};


/** @override */
goog.ui.Control.prototype.disposeInternal = function() {
  goog.ui.Control.superClass_.disposeInternal.call(this);
  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    delete this.keyHandler_;
  }
  delete this.renderer_;
  this.content_ = null;
  this.extraClassNames_ = null;
  this.ieMouseEventSequenceSimulator_ = null;
};


// Component content management.


/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
goog.ui.Control.prototype.getContent = function() {
  return this.content_;
};


/**
 * Sets the component's content to the given text caption, element, or array of
 * nodes.  (If the argument is an array of nodes, it must be an actual array,
 * not an array-like object.)
 * @param {goog.ui.ControlContent} content Text caption or DOM
 *     structure to set as the component's contents.
 */
goog.ui.Control.prototype.setContent = function(content) {
  // Controls support pluggable renderers; delegate to the renderer.
  this.renderer_.setContent(this.getElement(), content);

  // setContentInternal needs to be after the renderer, since the implementation
  // may depend on the content being in the DOM.
  this.setContentInternal(content);
};


/**
 * Sets the component's content to the given text caption, element, or array
 * of nodes.  Unlike {@link #setContent}, doesn't modify the component's DOM.
 * Called by renderers during element decoration.
 *
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to set as the component's contents.
 */
goog.ui.Control.prototype.setContentInternal = function(content) {
  this.content_ = content;
};


/**
 * @return {string} Text caption of the control or empty string if none.
 */
goog.ui.Control.prototype.getCaption = function() {
  var content = this.getContent();
  if (!content) {
    return '';
  }
  var caption = goog.isString(content) ?
      content :
      goog.isArray(content) ?
      goog.array.map(content, goog.dom.getRawTextContent).join('') :
      goog.dom.getTextContent(/** @type {!Node} */ (content));
  return goog.string.collapseBreakingSpaces(caption);
};


/**
 * Sets the text caption of the component.
 * @param {string} caption Text caption of the component.
 */
goog.ui.Control.prototype.setCaption = function(caption) {
  this.setContent(caption);
};


// Component state management.


/** @override */
goog.ui.Control.prototype.setRightToLeft = function(rightToLeft) {
  // The superclass implementation ensures the control isn't in the document.
  goog.ui.Control.superClass_.setRightToLeft.call(this, rightToLeft);

  var element = this.getElement();
  if (element) {
    this.renderer_.setRightToLeft(element, rightToLeft);
  }
};


/**
 * Returns true if the control allows text selection within its DOM, false
 * otherwise.  Controls that disallow text selection have the appropriate
 * unselectable styling applied to their elements.  Note that controls hosted
 * in containers will report that they allow text selection even if their
 * container disallows text selection.
 * @return {boolean} Whether the control allows text selection.
 */
goog.ui.Control.prototype.isAllowTextSelection = function() {
  return this.allowTextSelection_;
};


/**
 * Allows or disallows text selection within the control's DOM.
 * @param {boolean} allow Whether the control should allow text selection.
 */
goog.ui.Control.prototype.setAllowTextSelection = function(allow) {
  this.allowTextSelection_ = allow;

  var element = this.getElement();
  if (element) {
    this.renderer_.setAllowTextSelection(element, allow);
  }
};


/**
 * Returns true if the component's visibility is set to visible, false if
 * it is set to hidden.  A component that is set to hidden is guaranteed
 * to be hidden from the user, but the reverse isn't necessarily true.
 * A component may be set to visible but can otherwise be obscured by another
 * element, rendered off-screen, or hidden using direct CSS manipulation.
 * @return {boolean} Whether the component is visible.
 */
goog.ui.Control.prototype.isVisible = function() {
  return this.visible_;
};


/**
 * Shows or hides the component.  Does nothing if the component already has
 * the requested visibility.  Otherwise, dispatches a SHOW or HIDE event as
 * appropriate, giving listeners a chance to prevent the visibility change.
 * When showing a component that is both enabled and focusable, ensures that
 * its key target has a tab index.  When hiding a component that is enabled
 * and focusable, blurs its key target and removes its tab index.
 * @param {boolean} visible Whether to show or hide the component.
 * @param {boolean=} opt_force If true, doesn't check whether the component
 *     already has the requested visibility, and doesn't dispatch any events.
 * @return {boolean} Whether the visibility was changed.
 */
goog.ui.Control.prototype.setVisible = function(visible, opt_force) {
  if (opt_force || (this.visible_ != visible &&
                    this.dispatchEvent(
                        visible ? goog.ui.Component.EventType.SHOW :
                                  goog.ui.Component.EventType.HIDE))) {
    var element = this.getElement();
    if (element) {
      this.renderer_.setVisible(element, visible);
    }
    if (this.isEnabled()) {
      this.renderer_.setFocusable(this, visible);
    }
    this.visible_ = visible;
    return true;
  }
  return false;
};


/**
 * Returns true if the component is enabled, false otherwise.
 * @return {boolean} Whether the component is enabled.
 */
goog.ui.Control.prototype.isEnabled = function() {
  return !this.hasState(goog.ui.Component.State.DISABLED);
};


/**
 * Returns true if the control has a parent that is itself disabled, false
 * otherwise.
 * @return {boolean} Whether the component is hosted in a disabled container.
 * @private
 */
goog.ui.Control.prototype.isParentDisabled_ = function() {
  var parent = this.getParent();
  return !!parent && typeof parent.isEnabled == 'function' &&
      !parent.isEnabled();
};


/**
 * Enables or disables the component.  Does nothing if this state transition
 * is disallowed.  If the component is both visible and focusable, updates its
 * focused state and tab index as needed.  If the component is being disabled,
 * ensures that it is also deactivated and un-highlighted first.  Note that the
 * component's enabled/disabled state is "locked" as long as it is hosted in a
 * {@link goog.ui.Container} that is itself disabled; this is to prevent clients
 * from accidentally re-enabling a control that is in a disabled container.
 * @param {boolean} enable Whether to enable or disable the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setEnabled = function(enable) {
  if (!this.isParentDisabled_() &&
      this.isTransitionAllowed(goog.ui.Component.State.DISABLED, !enable)) {
    if (!enable) {
      this.setActive(false);
      this.setHighlighted(false);
    }
    if (this.isVisible()) {
      this.renderer_.setFocusable(this, enable);
    }
    this.setState(goog.ui.Component.State.DISABLED, !enable, true);
  }
};


/**
 * Returns true if the component is currently highlighted, false otherwise.
 * @return {boolean} Whether the component is highlighted.
 */
goog.ui.Control.prototype.isHighlighted = function() {
  return this.hasState(goog.ui.Component.State.HOVER);
};


/**
 * Highlights or unhighlights the component.  Does nothing if this state
 * transition is disallowed.
 * @param {boolean} highlight Whether to highlight or unhighlight the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setHighlighted = function(highlight) {
  if (this.isTransitionAllowed(goog.ui.Component.State.HOVER, highlight)) {
    this.setState(goog.ui.Component.State.HOVER, highlight);
  }
};


/**
 * Returns true if the component is active (pressed), false otherwise.
 * @return {boolean} Whether the component is active.
 */
goog.ui.Control.prototype.isActive = function() {
  return this.hasState(goog.ui.Component.State.ACTIVE);
};


/**
 * Activates or deactivates the component.  Does nothing if this state
 * transition is disallowed.
 * @param {boolean} active Whether to activate or deactivate the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setActive = function(active) {
  if (this.isTransitionAllowed(goog.ui.Component.State.ACTIVE, active)) {
    this.setState(goog.ui.Component.State.ACTIVE, active);
  }
};


/**
 * Returns true if the component is selected, false otherwise.
 * @return {boolean} Whether the component is selected.
 */
goog.ui.Control.prototype.isSelected = function() {
  return this.hasState(goog.ui.Component.State.SELECTED);
};


/**
 * Selects or unselects the component.  Does nothing if this state transition
 * is disallowed.
 * @param {boolean} select Whether to select or unselect the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setSelected = function(select) {
  if (this.isTransitionAllowed(goog.ui.Component.State.SELECTED, select)) {
    this.setState(goog.ui.Component.State.SELECTED, select);
  }
};


/**
 * Returns true if the component is checked, false otherwise.
 * @return {boolean} Whether the component is checked.
 */
goog.ui.Control.prototype.isChecked = function() {
  return this.hasState(goog.ui.Component.State.CHECKED);
};


/**
 * Checks or unchecks the component.  Does nothing if this state transition
 * is disallowed.
 * @param {boolean} check Whether to check or uncheck the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setChecked = function(check) {
  if (this.isTransitionAllowed(goog.ui.Component.State.CHECKED, check)) {
    this.setState(goog.ui.Component.State.CHECKED, check);
  }
};


/**
 * Returns true if the component is styled to indicate that it has keyboard
 * focus, false otherwise.  Note that {@code isFocused()} returning true
 * doesn't guarantee that the component's key event target has keyborad focus,
 * only that it is styled as such.
 * @return {boolean} Whether the component is styled to indicate as having
 *     keyboard focus.
 */
goog.ui.Control.prototype.isFocused = function() {
  return this.hasState(goog.ui.Component.State.FOCUSED);
};


/**
 * Applies or removes styling indicating that the component has keyboard focus.
 * Note that unlike the other "set" methods, this method is called as a result
 * of the component's element having received or lost keyboard focus, not the
 * other way around, so calling {@code setFocused(true)} doesn't guarantee that
 * the component's key event target has keyboard focus, only that it is styled
 * as such.
 * @param {boolean} focused Whether to apply or remove styling to indicate that
 *     the component's element has keyboard focus.
 */
goog.ui.Control.prototype.setFocused = function(focused) {
  if (this.isTransitionAllowed(goog.ui.Component.State.FOCUSED, focused)) {
    this.setState(goog.ui.Component.State.FOCUSED, focused);
  }
};


/**
 * Returns true if the component is open (expanded), false otherwise.
 * @return {boolean} Whether the component is open.
 */
goog.ui.Control.prototype.isOpen = function() {
  return this.hasState(goog.ui.Component.State.OPENED);
};


/**
 * Opens (expands) or closes (collapses) the component.  Does nothing if this
 * state transition is disallowed.
 * @param {boolean} open Whether to open or close the component.
 * @see #isTransitionAllowed
 */
goog.ui.Control.prototype.setOpen = function(open) {
  if (this.isTransitionAllowed(goog.ui.Component.State.OPENED, open)) {
    this.setState(goog.ui.Component.State.OPENED, open);
  }
};


/**
 * Returns the component's state as a bit mask of {@link
 * goog.ui.Component.State}s.
 * @return {number} Bit mask representing component state.
 */
goog.ui.Control.prototype.getState = function() {
  return this.state_;
};


/**
 * Returns true if the component is in the specified state, false otherwise.
 * @param {goog.ui.Component.State} state State to check.
 * @return {boolean} Whether the component is in the given state.
 */
goog.ui.Control.prototype.hasState = function(state) {
  return !!(this.state_ & state);
};


/**
 * Sets or clears the given state on the component, and updates its styling
 * accordingly.  Does nothing if the component is already in the correct state
 * or if it doesn't support the specified state.  Doesn't dispatch any state
 * transition events; use advisedly.
 * @param {goog.ui.Component.State} state State to set or clear.
 * @param {boolean} enable Whether to set or clear the state (if supported).
 * @param {boolean=} opt_calledFrom Prevents looping with setEnabled.
 */
goog.ui.Control.prototype.setState = function(state, enable, opt_calledFrom) {
  if (!opt_calledFrom && state == goog.ui.Component.State.DISABLED) {
    this.setEnabled(!enable);
    return;
  }
  if (this.isSupportedState(state) && enable != this.hasState(state)) {
    // Delegate actual styling to the renderer, since it is DOM-specific.
    this.renderer_.setState(this, state, enable);
    this.state_ = enable ? this.state_ | state : this.state_ & ~state;
  }
};


/**
 * Sets the component's state to the state represented by a bit mask of
 * {@link goog.ui.Component.State}s.  Unlike {@link #setState}, doesn't
 * update the component's styling, and doesn't reject unsupported states.
 * Called by renderers during element decoration.  Considered protected;
 * should only be used within this package and by subclasses.
 *
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {number} state Bit mask representing component state.
 */
goog.ui.Control.prototype.setStateInternal = function(state) {
  this.state_ = state;
};


/**
 * Returns true if the component supports the specified state, false otherwise.
 * @param {goog.ui.Component.State} state State to check.
 * @return {boolean} Whether the component supports the given state.
 */
goog.ui.Control.prototype.isSupportedState = function(state) {
  return !!(this.supportedStates_ & state);
};


/**
 * Enables or disables support for the given state. Disabling support
 * for a state while the component is in that state is an error.
 * @param {goog.ui.Component.State} state State to support or de-support.
 * @param {boolean} support Whether the component should support the state.
 * @throws {Error} If disabling support for a state the control is currently in.
 */
goog.ui.Control.prototype.setSupportedState = function(state, support) {
  if (this.isInDocument() && this.hasState(state) && !support) {
    // Since we hook up event handlers in enterDocument(), this is an error.
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  if (!support && this.hasState(state)) {
    // We are removing support for a state that the component is currently in.
    this.setState(state, false);
  }

  this.supportedStates_ =
      support ? this.supportedStates_ | state : this.supportedStates_ & ~state;
};


/**
 * Returns true if the component provides default event handling for the state,
 * false otherwise.
 * @param {goog.ui.Component.State} state State to check.
 * @return {boolean} Whether the component provides default event handling for
 *     the state.
 */
goog.ui.Control.prototype.isAutoState = function(state) {
  return !!(this.autoStates_ & state) && this.isSupportedState(state);
};


/**
 * Enables or disables automatic event handling for the given state(s).
 * @param {number} states Bit mask of {@link goog.ui.Component.State}s for which
 *     default event handling is to be enabled or disabled.
 * @param {boolean} enable Whether the component should provide default event
 *     handling for the state(s).
 */
goog.ui.Control.prototype.setAutoStates = function(states, enable) {
  this.autoStates_ =
      enable ? this.autoStates_ | states : this.autoStates_ & ~states;
};


/**
 * Returns true if the component is set to dispatch transition events for the
 * given state, false otherwise.
 * @param {goog.ui.Component.State} state State to check.
 * @return {boolean} Whether the component dispatches transition events for
 *     the state.
 */
goog.ui.Control.prototype.isDispatchTransitionEvents = function(state) {
  return !!(this.statesWithTransitionEvents_ & state) &&
      this.isSupportedState(state);
};


/**
 * Enables or disables transition events for the given state(s).  Controls
 * handle state transitions internally by default, and only dispatch state
 * transition events if explicitly requested to do so by calling this method.
 * @param {number} states Bit mask of {@link goog.ui.Component.State}s for
 *     which transition events should be enabled or disabled.
 * @param {boolean} enable Whether transition events should be enabled.
 */
goog.ui.Control.prototype.setDispatchTransitionEvents = function(
    states, enable) {
  this.statesWithTransitionEvents_ = enable ?
      this.statesWithTransitionEvents_ | states :
      this.statesWithTransitionEvents_ & ~states;
};


/**
 * Returns true if the transition into or out of the given state is allowed to
 * proceed, false otherwise.  A state transition is allowed under the following
 * conditions:
 * <ul>
 *   <li>the component supports the state,
 *   <li>the component isn't already in the target state,
 *   <li>either the component is configured not to dispatch events for this
 *       state transition, or a transition event was dispatched and wasn't
 *       canceled by any event listener, and
 *   <li>the component hasn't been disposed of
 * </ul>
 * Considered protected; should only be used within this package and by
 * subclasses.
 * @param {goog.ui.Component.State} state State to/from which the control is
 *     transitioning.
 * @param {boolean} enable Whether the control is entering or leaving the state.
 * @return {boolean} Whether the state transition is allowed to proceed.
 * @protected
 */
goog.ui.Control.prototype.isTransitionAllowed = function(state, enable) {
  return this.isSupportedState(state) && this.hasState(state) != enable &&
      (!(this.statesWithTransitionEvents_ & state) ||
       this.dispatchEvent(
           goog.ui.Component.getStateTransitionEvent(state, enable))) &&
      !this.isDisposed();
};


// Default event handlers, to be overridden in subclasses.


/**
 * Handles mouseover events.  Dispatches an ENTER event; if the event isn't
 * canceled, the component is enabled, and it supports auto-highlighting,
 * highlights the component.  Considered protected; should only be used
 * within this package and by subclasses.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 */
goog.ui.Control.prototype.handleMouseOver = function(e) {
  // Ignore mouse moves between descendants.
  if (!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) &&
      this.dispatchEvent(goog.ui.Component.EventType.ENTER) &&
      this.isEnabled() && this.isAutoState(goog.ui.Component.State.HOVER)) {
    this.setHighlighted(true);
  }
};


/**
 * Handles mouseout events.  Dispatches a LEAVE event; if the event isn't
 * canceled, and the component supports auto-highlighting, deactivates and
 * un-highlights the component.  Considered protected; should only be used
 * within this package and by subclasses.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 */
goog.ui.Control.prototype.handleMouseOut = function(e) {
  if (!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) &&
      this.dispatchEvent(goog.ui.Component.EventType.LEAVE)) {
    if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      // Deactivate on mouseout; otherwise we lose track of the mouse button.
      this.setActive(false);
    }
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(false);
    }
  }
};


/**
 * Handles contextmenu events.
 * @param {goog.events.BrowserEvent} e Event to handle.
 */
goog.ui.Control.prototype.handleContextMenu = goog.nullFunction;


/**
 * Checks if a mouse event (mouseover or mouseout) occurred below an element.
 * @param {goog.events.BrowserEvent} e Mouse event (should be mouseover or
 *     mouseout).
 * @param {Element} elem The ancestor element.
 * @return {boolean} Whether the event has a relatedTarget (the element the
 *     mouse is coming from) and it's a descendent of elem.
 * @private
 */
goog.ui.Control.isMouseEventWithinElement_ = function(e, elem) {
  // If relatedTarget is null, it means there was no previous element (e.g.
  // the mouse moved out of the window).  Assume this means that the mouse
  // event was not within the element.
  return !!e.relatedTarget && goog.dom.contains(elem, e.relatedTarget);
};


/**
 * Handles mousedown events.  If the component is enabled, highlights and
 * activates it.  If the component isn't configured for keyboard access,
 * prevents it from receiving keyboard focus.  Considered protected; should
 * only be used within this package and by subclasses.
 * @param {goog.events.Event} e Mouse event to handle.
 */
goog.ui.Control.prototype.handleMouseDown = function(e) {
  if (this.isEnabled()) {
    // Highlight enabled control on mousedown, regardless of the mouse button.
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true);
    }

    // For the left button only, activate the control, and focus its key event
    // target (if supported).
    if (e.isMouseActionButton()) {
      if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
        this.setActive(true);
      }
      if (this.renderer_ && this.renderer_.isFocusable(this)) {
        this.getKeyEventTarget().focus();
      }
    }
  }

  // Cancel the default action unless the control allows text selection.
  if (!this.isAllowTextSelection() && e.isMouseActionButton()) {
    e.preventDefault();
  }
};


/**
 * Handles mouseup events.  If the component is enabled, highlights it.  If
 * the component has previously been activated, performs its associated action
 * by calling {@link performActionInternal}, then deactivates it.  Considered
 * protected; should only be used within this package and by subclasses.
 * @param {goog.events.Event} e Mouse event to handle.
 */
goog.ui.Control.prototype.handleMouseUp = function(e) {
  if (this.isEnabled()) {
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true);
    }
    if (this.isActive() && this.performActionInternal(e) &&
        this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      this.setActive(false);
    }
  }
};


/**
 * Handles dblclick events.  Should only be registered if the user agent is
 * IE.  If the component is enabled, performs its associated action by calling
 * {@link performActionInternal}.  This is used to allow more performant
 * buttons in IE.  In IE, no mousedown event is fired when that mousedown will
 * trigger a dblclick event.  Because of this, a user clicking quickly will
 * only cause ACTION events to fire on every other click.  This is a workaround
 * to generate ACTION events for every click.  Unfortunately, this workaround
 * won't ever trigger the ACTIVE state.  This is roughly the same behaviour as
 * if this were a 'button' element with a listener on mouseup.  Considered
 * protected; should only be used within this package and by subclasses.
 * @param {goog.events.Event} e Mouse event to handle.
 */
goog.ui.Control.prototype.handleDblClick = function(e) {
  if (this.isEnabled()) {
    this.performActionInternal(e);
  }
};


/**
 * Performs the appropriate action when the control is activated by the user.
 * The default implementation first updates the checked and selected state of
 * controls that support them, then dispatches an ACTION event.  Considered
 * protected; should only be used within this package and by subclasses.
 * @param {goog.events.Event} e Event that triggered the action.
 * @return {boolean} Whether the action is allowed to proceed.
 * @protected
 */
goog.ui.Control.prototype.performActionInternal = function(e) {
  if (this.isAutoState(goog.ui.Component.State.CHECKED)) {
    this.setChecked(!this.isChecked());
  }
  if (this.isAutoState(goog.ui.Component.State.SELECTED)) {
    this.setSelected(true);
  }
  if (this.isAutoState(goog.ui.Component.State.OPENED)) {
    this.setOpen(!this.isOpen());
  }

  var actionEvent =
      new goog.events.Event(goog.ui.Component.EventType.ACTION, this);
  if (e) {
    actionEvent.altKey = e.altKey;
    actionEvent.ctrlKey = e.ctrlKey;
    actionEvent.metaKey = e.metaKey;
    actionEvent.shiftKey = e.shiftKey;
    actionEvent.platformModifierKey = e.platformModifierKey;
  }
  return this.dispatchEvent(actionEvent);
};


/**
 * Handles focus events on the component's key event target element.  If the
 * component is focusable, updates its state and styling to indicate that it
 * now has keyboard focus.  Considered protected; should only be used within
 * this package and by subclasses.  <b>Warning:</b> IE dispatches focus and
 * blur events asynchronously!
 * @param {goog.events.Event} e Focus event to handle.
 */
goog.ui.Control.prototype.handleFocus = function(e) {
  if (this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(true);
  }
};


/**
 * Handles blur events on the component's key event target element.  Always
 * deactivates the component.  In addition, if the component is focusable,
 * updates its state and styling to indicate that it no longer has keyboard
 * focus.  Considered protected; should only be used within this package and
 * by subclasses.  <b>Warning:</b> IE dispatches focus and blur events
 * asynchronously!
 * @param {goog.events.Event} e Blur event to handle.
 */
goog.ui.Control.prototype.handleBlur = function(e) {
  if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
    this.setActive(false);
  }
  if (this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(false);
  }
};


/**
 * Attempts to handle a keyboard event, if the component is enabled and visible,
 * by calling {@link handleKeyEventInternal}.  Considered protected; should only
 * be used within this package and by subclasses.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 */
goog.ui.Control.prototype.handleKeyEvent = function(e) {
  if (this.isVisible() && this.isEnabled() && this.handleKeyEventInternal(e)) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
};


/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  Considered protected; should only be used within this
 * package and by subclasses.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 * @protected
 */
goog.ui.Control.prototype.handleKeyEventInternal = function(e) {
  return e.keyCode == goog.events.KeyCodes.ENTER &&
      this.performActionInternal(e);
};


// Register the default renderer for goog.ui.Controls.
goog.ui.registry.setDefaultRenderer(goog.ui.Control, goog.ui.ControlRenderer);


// Register a decorator factory function for goog.ui.Controls.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ControlRenderer.CSS_CLASS,
    function() { return new goog.ui.Control(null); });



/**
 * A singleton that helps goog.ui.Control instances play well with screen
 * readers.  It necessitated by shortcomings in IE, and need not be
 * instantiated in any other browser.
 *
 * In most cases, a click on a goog.ui.Control results in a sequence of events:
 * MOUSEDOWN, MOUSEUP and CLICK.  UI controls rely on this sequence since most
 * behavior is trigged by MOUSEDOWN and MOUSEUP.  But when IE is used with some
 * traditional screen readers (JAWS, NVDA and perhaps others), IE only sends
 * the CLICK event, resulting in the control being unresponsive.  This class
 * monitors the sequence of these events, and if it detects a CLICK event not
 * not preceded by a MOUSEUP event, directly calls the control's event handlers
 * for MOUSEDOWN, then MOUSEUP.  While the resulting sequence is different from
 * the norm (the CLICK comes first instead of last), testing thus far shows
 * the resulting behavior to be correct.
 *
 * See http://goo.gl/qvQR4C for more details.
 *
 * @param {!goog.ui.Control} control
 * @constructor
 * @extends {goog.Disposable}
 * @private
 */
goog.ui.Control.IeMouseEventSequenceSimulator_ = function(control) {
  goog.ui.Control.IeMouseEventSequenceSimulator_.base(this, 'constructor');

  /** @private {goog.ui.Control}*/
  this.control_ = control;

  /** @private {boolean} */
  this.clickExpected_ = false;

  /** @private @const {!goog.events.EventHandler<
   *                       !goog.ui.Control.IeMouseEventSequenceSimulator_>}
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  var element = this.control_.getElementStrict();
  this.handler_
      .listen(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown_)
      .listen(element, goog.events.EventType.MOUSEUP, this.handleMouseUp_)
      .listen(element, goog.events.EventType.CLICK, this.handleClick_);
};
goog.inherits(goog.ui.Control.IeMouseEventSequenceSimulator_, goog.Disposable);


/**
 * Whether this browser supports synthetic MouseEvents.
 *
 * See https://msdn.microsoft.com/library/dn905219(v=vs.85).aspx for details.
 *
 * @private {boolean}
 * @const
 */
goog.ui.Control.IeMouseEventSequenceSimulator_.SYNTHETIC_EVENTS_ =
    !goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9);


/** @private */
goog.ui.Control.IeMouseEventSequenceSimulator_.prototype.handleMouseDown_ =
    function() {
  this.clickExpected_ = false;
};


/** @private */
goog.ui.Control.IeMouseEventSequenceSimulator_.prototype.handleMouseUp_ =
    function() {
  this.clickExpected_ = true;
};


/**
 * @param {!MouseEvent} e
 * @param {goog.events.EventType} typeArg
 * @return {!MouseEvent}
 * @private
 */
goog.ui.Control.IeMouseEventSequenceSimulator_.makeLeftMouseEvent_ = function(
    e, typeArg) {
  'use strict';

  if (!goog.ui.Control.IeMouseEventSequenceSimulator_.SYNTHETIC_EVENTS_) {
    // IE < 9 does not support synthetic mouse events. Therefore, reuse the
    // existing MouseEvent by overwriting the read only button and type
    // properties. As IE < 9 does not support ES5 strict mode this will not
    // generate an exception even when the script specifies "use strict".
    e.button = goog.events.BrowserEvent.MouseButton.LEFT;
    e.type = typeArg;
    return e;
  }

  var event = /** @type {!MouseEvent} */ (document.createEvent('MouseEvents'));
  event.initMouseEvent(
      typeArg, e.bubbles, e.cancelable,
      e.view || null,  // IE9 errors if view is undefined
      e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey,
      e.shiftKey, e.metaKey, goog.events.BrowserEvent.MouseButton.LEFT,
      e.relatedTarget || null);  // IE9 errors if relatedTarget is undefined
  return event;
};


/**
 * @param {!goog.events.Event} e
 * @private
 */
goog.ui.Control.IeMouseEventSequenceSimulator_.prototype.handleClick_ =
    function(e) {
  if (this.clickExpected_) {
    // This is the end of a normal click sequence: mouse-down, mouse-up, click.
    // Assume appropriate actions have already been performed.
    this.clickExpected_ = false;
    return;
  }

  // For click events not part of a normal sequence, similate the mouse-down and
  // mouse-up events by creating synthetic events for each and directly invoke
  // the corresponding event listeners in order.

  var browserEvent = /** @type {goog.events.BrowserEvent} */ (e);

  var event = /** @type {!MouseEvent} */ (browserEvent.getBrowserEvent());
  var origEventButton = event.button;
  var origEventType = event.type;

  var down = goog.ui.Control.IeMouseEventSequenceSimulator_.makeLeftMouseEvent_(
      event, goog.events.EventType.MOUSEDOWN);
  this.control_.handleMouseDown(
      new goog.events.BrowserEvent(down, browserEvent.currentTarget));

  var up = goog.ui.Control.IeMouseEventSequenceSimulator_.makeLeftMouseEvent_(
      event, goog.events.EventType.MOUSEUP);
  this.control_.handleMouseUp(
      new goog.events.BrowserEvent(up, browserEvent.currentTarget));

  if (goog.ui.Control.IeMouseEventSequenceSimulator_.SYNTHETIC_EVENTS_) {
    // This browser supports synthetic events. Avoid resetting the read only
    // properties (type, button) as they were not overwritten and writing them
    // results in an exception when running in ES5 strict mode.
    return;
  }

  // Restore original values for click handlers that have not yet been invoked.
  event.button = origEventButton;
  event.type = origEventType;
};


/** @override */
goog.ui.Control.IeMouseEventSequenceSimulator_.prototype.disposeInternal =
    function() {
  this.control_ = null;
  goog.ui.Control.IeMouseEventSequenceSimulator_.base(this, 'disposeInternal');
};
