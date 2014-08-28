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
 * @fileoverview Abstract class for all UI components. This defines the standard
 * design pattern that all UI components should follow.
 *
 * @see ../demos/samplecomponent.html
 * @see http://code.google.com/p/closure-library/wiki/IntroToComponents
 */

goog.provide('goog.ui.Component');
goog.provide('goog.ui.Component.Error');
goog.provide('goog.ui.Component.EventType');
goog.provide('goog.ui.Component.State');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.IdGenerator');



/**
 * Default implementation of UI component.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.Component = function(opt_domHelper) {
  goog.events.EventTarget.call(this);
  /**
   * DomHelper used to interact with the document, allowing components to be
   * created in a different window.
   * @protected {!goog.dom.DomHelper}
   * @suppress {underscore|visibility}
   */
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Whether the component is rendered right-to-left.  Right-to-left is set
   * lazily when {@link #isRightToLeft} is called the first time, unless it has
   * been set by calling {@link #setRightToLeft} explicitly.
   * @private {?boolean}
   */
  this.rightToLeft_ = goog.ui.Component.defaultRightToLeft_;

  /**
   * Unique ID of the component, lazily initialized in {@link
   * goog.ui.Component#getId} if needed.  This property is strictly private and
   * must not be accessed directly outside of this class!
   * @private {?string}
   */
  this.id_ = null;

  /**
   * Whether the component is in the document.
   * @private {boolean}
   */
  this.inDocument_ = false;

  // TODO(attila): Stop referring to this private field in subclasses.
  /**
   * The DOM element for the component.
   * @private {Element}
   */
  this.element_ = null;

  /**
   * Event handler.
   * TODO(user): rename it to handler_ after all component subclasses in
   * inside Google have been cleaned up.
   * Code search: http://go/component_code_search
   * @private {goog.events.EventHandler|undefined}
   */
  this.googUiComponentHandler_ = void 0;

  /**
   * Arbitrary data object associated with the component.  Such as meta-data.
   * @private {*}
   */
  this.model_ = null;

  /**
   * Parent component to which events will be propagated.  This property is
   * strictly private and must not be accessed directly outside of this class!
   * @private {goog.ui.Component?}
   */
  this.parent_ = null;

  /**
   * Array of child components.  Lazily initialized on first use.  Must be kept
   * in sync with {@code childIndex_}.  This property is strictly private and
   * must not be accessed directly outside of this class!
   * @private {Array.<goog.ui.Component>?}
   */
  this.children_ = null;

  /**
   * Map of child component IDs to child components.  Used for constant-time
   * random access to child components by ID.  Lazily initialized on first use.
   * Must be kept in sync with {@code children_}.  This property is strictly
   * private and must not be accessed directly outside of this class!
   *
   * We use a plain Object, not a {@link goog.structs.Map}, for simplicity.
   * This means components can't have children with IDs such as 'constructor' or
   * 'valueOf', but this shouldn't really be an issue in practice, and if it is,
   * we can always fix it later without changing the API.
   *
   * @private {Object}
   */
  this.childIndex_ = null;

  /**
   * Flag used to keep track of whether a component decorated an already
   * existing element or whether it created the DOM itself.
   *
   * If an element is decorated, dispose will leave the node in the document.
   * It is up to the app to remove the node.
   *
   * If an element was rendered, dispose will remove the node automatically.
   *
   * @private {boolean}
   */
  this.wasDecorated_ = false;
};
goog.inherits(goog.ui.Component, goog.events.EventTarget);


/**
 * @define {boolean} Whether to support calling decorate with an element that is
 *     not yet in the document. If true, we check if the element is in the
 *     document, and avoid calling enterDocument if it isn't. If false, we
 *     maintain legacy behavior (always call enterDocument from decorate).
 */
goog.define('goog.ui.Component.ALLOW_DETACHED_DECORATION', false);


/**
 * Generator for unique IDs.
 * @type {goog.ui.IdGenerator}
 * @private
 */
goog.ui.Component.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();


// TODO(gboyer): See if we can remove this and just check goog.i18n.bidi.IS_RTL.
/**
 * @define {number} Defines the default BIDI directionality.
 *     0: Unknown.
 *     1: Left-to-right.
 *     -1: Right-to-left.
 */
goog.define('goog.ui.Component.DEFAULT_BIDI_DIR', 0);


/**
 * The default right to left value.
 * @type {?boolean}
 * @private
 */
goog.ui.Component.defaultRightToLeft_ =
    (goog.ui.Component.DEFAULT_BIDI_DIR == 1) ? false :
    (goog.ui.Component.DEFAULT_BIDI_DIR == -1) ? true : null;


/**
 * Common events fired by components so that event propagation is useful.  Not
 * all components are expected to dispatch or listen for all event types.
 * Events dispatched before a state transition should be cancelable to prevent
 * the corresponding state change.
 * @enum {string}
 */
goog.ui.Component.EventType = {
  /** Dispatched before the component becomes visible. */
  BEFORE_SHOW: 'beforeshow',

  /**
   * Dispatched after the component becomes visible.
   * NOTE(user): For goog.ui.Container, this actually fires before containers
   * are shown.  Use goog.ui.Container.EventType.AFTER_SHOW if you want an event
   * that fires after a goog.ui.Container is shown.
   */
  SHOW: 'show',

  /** Dispatched before the component becomes hidden. */
  HIDE: 'hide',

  /** Dispatched before the component becomes disabled. */
  DISABLE: 'disable',

  /** Dispatched before the component becomes enabled. */
  ENABLE: 'enable',

  /** Dispatched before the component becomes highlighted. */
  HIGHLIGHT: 'highlight',

  /** Dispatched before the component becomes un-highlighted. */
  UNHIGHLIGHT: 'unhighlight',

  /** Dispatched before the component becomes activated. */
  ACTIVATE: 'activate',

  /** Dispatched before the component becomes deactivated. */
  DEACTIVATE: 'deactivate',

  /** Dispatched before the component becomes selected. */
  SELECT: 'select',

  /** Dispatched before the component becomes un-selected. */
  UNSELECT: 'unselect',

  /** Dispatched before a component becomes checked. */
  CHECK: 'check',

  /** Dispatched before a component becomes un-checked. */
  UNCHECK: 'uncheck',

  /** Dispatched before a component becomes focused. */
  FOCUS: 'focus',

  /** Dispatched before a component becomes blurred. */
  BLUR: 'blur',

  /** Dispatched before a component is opened (expanded). */
  OPEN: 'open',

  /** Dispatched before a component is closed (collapsed). */
  CLOSE: 'close',

  /** Dispatched after a component is moused over. */
  ENTER: 'enter',

  /** Dispatched after a component is moused out of. */
  LEAVE: 'leave',

  /** Dispatched after the user activates the component. */
  ACTION: 'action',

  /** Dispatched after the external-facing state of a component is changed. */
  CHANGE: 'change'
};


/**
 * Errors thrown by the component.
 * @enum {string}
 */
goog.ui.Component.Error = {
  /**
   * Error when a method is not supported.
   */
  NOT_SUPPORTED: 'Method not supported',

  /**
   * Error when the given element can not be decorated.
   */
  DECORATE_INVALID: 'Invalid element to decorate',

  /**
   * Error when the component is already rendered and another render attempt is
   * made.
   */
  ALREADY_RENDERED: 'Component already rendered',

  /**
   * Error when an attempt is made to set the parent of a component in a way
   * that would result in an inconsistent object graph.
   */
  PARENT_UNABLE_TO_BE_SET: 'Unable to set parent component',

  /**
   * Error when an attempt is made to add a child component at an out-of-bounds
   * index.  We don't support sparse child arrays.
   */
  CHILD_INDEX_OUT_OF_BOUNDS: 'Child component index out of bounds',

  /**
   * Error when an attempt is made to remove a child component from a component
   * other than its parent.
   */
  NOT_OUR_CHILD: 'Child is not in parent component',

  /**
   * Error when an operation requiring DOM interaction is made when the
   * component is not in the document
   */
  NOT_IN_DOCUMENT: 'Operation not supported while component is not in document',

  /**
   * Error when an invalid component state is encountered.
   */
  STATE_INVALID: 'Invalid component state'
};


/**
 * Common component states.  Components may have distinct appearance depending
 * on what state(s) apply to them.  Not all components are expected to support
 * all states.
 * @enum {number}
 */
goog.ui.Component.State = {
  /**
   * Union of all supported component states.
   */
  ALL: 0xFF,

  /**
   * Component is disabled.
   * @see goog.ui.Component.EventType.DISABLE
   * @see goog.ui.Component.EventType.ENABLE
   */
  DISABLED: 0x01,

  /**
   * Component is highlighted.
   * @see goog.ui.Component.EventType.HIGHLIGHT
   * @see goog.ui.Component.EventType.UNHIGHLIGHT
   */
  HOVER: 0x02,

  /**
   * Component is active (or "pressed").
   * @see goog.ui.Component.EventType.ACTIVATE
   * @see goog.ui.Component.EventType.DEACTIVATE
   */
  ACTIVE: 0x04,

  /**
   * Component is selected.
   * @see goog.ui.Component.EventType.SELECT
   * @see goog.ui.Component.EventType.UNSELECT
   */
  SELECTED: 0x08,

  /**
   * Component is checked.
   * @see goog.ui.Component.EventType.CHECK
   * @see goog.ui.Component.EventType.UNCHECK
   */
  CHECKED: 0x10,

  /**
   * Component has focus.
   * @see goog.ui.Component.EventType.FOCUS
   * @see goog.ui.Component.EventType.BLUR
   */
  FOCUSED: 0x20,

  /**
   * Component is opened (expanded).  Applies to tree nodes, menu buttons,
   * submenus, zippys (zippies?), etc.
   * @see goog.ui.Component.EventType.OPEN
   * @see goog.ui.Component.EventType.CLOSE
   */
  OPENED: 0x40
};


/**
 * Static helper method; returns the type of event components are expected to
 * dispatch when transitioning to or from the given state.
 * @param {goog.ui.Component.State} state State to/from which the component
 *     is transitioning.
 * @param {boolean} isEntering Whether the component is entering or leaving the
 *     state.
 * @return {goog.ui.Component.EventType} Event type to dispatch.
 */
goog.ui.Component.getStateTransitionEvent = function(state, isEntering) {
  switch (state) {
    case goog.ui.Component.State.DISABLED:
      return isEntering ? goog.ui.Component.EventType.DISABLE :
          goog.ui.Component.EventType.ENABLE;
    case goog.ui.Component.State.HOVER:
      return isEntering ? goog.ui.Component.EventType.HIGHLIGHT :
          goog.ui.Component.EventType.UNHIGHLIGHT;
    case goog.ui.Component.State.ACTIVE:
      return isEntering ? goog.ui.Component.EventType.ACTIVATE :
          goog.ui.Component.EventType.DEACTIVATE;
    case goog.ui.Component.State.SELECTED:
      return isEntering ? goog.ui.Component.EventType.SELECT :
          goog.ui.Component.EventType.UNSELECT;
    case goog.ui.Component.State.CHECKED:
      return isEntering ? goog.ui.Component.EventType.CHECK :
          goog.ui.Component.EventType.UNCHECK;
    case goog.ui.Component.State.FOCUSED:
      return isEntering ? goog.ui.Component.EventType.FOCUS :
          goog.ui.Component.EventType.BLUR;
    case goog.ui.Component.State.OPENED:
      return isEntering ? goog.ui.Component.EventType.OPEN :
          goog.ui.Component.EventType.CLOSE;
    default:
      // Fall through.
  }

  // Invalid state.
  throw Error(goog.ui.Component.Error.STATE_INVALID);
};


/**
 * Set the default right-to-left value. This causes all component's created from
 * this point foward to have the given value. This is useful for cases where
 * a given page is always in one directionality, avoiding unnecessary
 * right to left determinations.
 * @param {?boolean} rightToLeft Whether the components should be rendered
 *     right-to-left. Null iff components should determine their directionality.
 */
goog.ui.Component.setDefaultRightToLeft = function(rightToLeft) {
  goog.ui.Component.defaultRightToLeft_ = rightToLeft;
};


/**
 * Gets the unique ID for the instance of this component.  If the instance
 * doesn't already have an ID, generates one on the fly.
 * @return {string} Unique component ID.
 */
goog.ui.Component.prototype.getId = function() {
  return this.id_ || (this.id_ = this.idGenerator_.getNextUniqueId());
};


/**
 * Assigns an ID to this component instance.  It is the caller's responsibility
 * to guarantee that the ID is unique.  If the component is a child of a parent
 * component, then the parent component's child index is updated to reflect the
 * new ID; this may throw an error if the parent already has a child with an ID
 * that conflicts with the new ID.
 * @param {string} id Unique component ID.
 */
goog.ui.Component.prototype.setId = function(id) {
  if (this.parent_ && this.parent_.childIndex_) {
    // Update the parent's child index.
    goog.object.remove(this.parent_.childIndex_, this.id_);
    goog.object.add(this.parent_.childIndex_, id, this);
  }

  // Update the component ID.
  this.id_ = id;
};


/**
 * Gets the component's element.
 * @return {Element} The element for the component.
 */
goog.ui.Component.prototype.getElement = function() {
  return this.element_;
};


/**
 * Gets the component's element. This differs from getElement in that
 * it assumes that the element exists (i.e. the component has been
 * rendered/decorated) and will cause an assertion error otherwise (if
 * assertion is enabled).
 * @return {!Element} The element for the component.
 */
goog.ui.Component.prototype.getElementStrict = function() {
  var el = this.element_;
  goog.asserts.assert(
      el, 'Can not call getElementStrict before rendering/decorating.');
  return el;
};


/**
 * Sets the component's root element to the given element.  Considered
 * protected and final.
 *
 * This should generally only be called during createDom. Setting the element
 * does not actually change which element is rendered, only the element that is
 * associated with this UI component.
 *
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {Element} element Root element for the component.
 */
goog.ui.Component.prototype.setElementInternal = function(element) {
  this.element_ = element;
};


/**
 * Returns an array of all the elements in this component's DOM with the
 * provided className.
 * @param {string} className The name of the class to look for.
 * @return {!goog.array.ArrayLike} The items found with the class name provided.
 */
goog.ui.Component.prototype.getElementsByClass = function(className) {
  return this.element_ ?
      this.dom_.getElementsByClass(className, this.element_) : [];
};


/**
 * Returns the first element in this component's DOM with the provided
 * className.
 * @param {string} className The name of the class to look for.
 * @return {Element} The first item with the class name provided.
 */
goog.ui.Component.prototype.getElementByClass = function(className) {
  return this.element_ ?
      this.dom_.getElementByClass(className, this.element_) : null;
};


/**
 * Similar to {@code getElementByClass} except that it expects the
 * element to be present in the dom thus returning a required value. Otherwise,
 * will assert.
 * @param {string} className The name of the class to look for.
 * @return {!Element} The first item with the class name provided.
 */
goog.ui.Component.prototype.getRequiredElementByClass = function(className) {
  var el = this.getElementByClass(className);
  goog.asserts.assert(el, 'Expected element in component with class: %s',
      className);
  return el;
};


/**
 * Returns the event handler for this component, lazily created the first time
 * this method is called.
 * @return {!goog.events.EventHandler.<T>} Event handler for this component.
 * @protected
 * @this T
 * @template T
 */
goog.ui.Component.prototype.getHandler = function() {
  if (!this.googUiComponentHandler_) {
    this.googUiComponentHandler_ = new goog.events.EventHandler(this);
  }
  return this.googUiComponentHandler_;
};


/**
 * Sets the parent of this component to use for event bubbling.  Throws an error
 * if the component already has a parent or if an attempt is made to add a
 * component to itself as a child.  Callers must use {@code removeChild}
 * or {@code removeChildAt} to remove components from their containers before
 * calling this method.
 * @see goog.ui.Component#removeChild
 * @see goog.ui.Component#removeChildAt
 * @param {goog.ui.Component} parent The parent component.
 */
goog.ui.Component.prototype.setParent = function(parent) {
  if (this == parent) {
    // Attempting to add a child to itself is an error.
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  if (parent && this.parent_ && this.id_ && this.parent_.getChild(this.id_) &&
      this.parent_ != parent) {
    // This component is already the child of some parent, so it should be
    // removed using removeChild/removeChildAt first.
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  this.parent_ = parent;
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent);
};


/**
 * Returns the component's parent, if any.
 * @return {goog.ui.Component?} The parent component.
 */
goog.ui.Component.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Overrides {@link goog.events.EventTarget#setParentEventTarget} to throw an
 * error if the parent component is set, and the argument is not the parent.
 * @override
 */
goog.ui.Component.prototype.setParentEventTarget = function(parent) {
  if (this.parent_ && this.parent_ != parent) {
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED);
  }
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent);
};


/**
 * Returns the dom helper that is being used on this component.
 * @return {!goog.dom.DomHelper} The dom helper used on this component.
 */
goog.ui.Component.prototype.getDomHelper = function() {
  return this.dom_;
};


/**
 * Determines whether the component has been added to the document.
 * @return {boolean} TRUE if rendered. Otherwise, FALSE.
 */
goog.ui.Component.prototype.isInDocument = function() {
  return this.inDocument_;
};


/**
 * Creates the initial DOM representation for the component.  The default
 * implementation is to set this.element_ = div.
 */
goog.ui.Component.prototype.createDom = function() {
  this.element_ = this.dom_.createElement('div');
};


/**
 * Renders the component.  If a parent element is supplied, the component's
 * element will be appended to it.  If there is no optional parent element and
 * the element doesn't have a parentNode then it will be appended to the
 * document body.
 *
 * If this component has a parent component, and the parent component is
 * not in the document already, then this will not call {@code enterDocument}
 * on this component.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Element=} opt_parentElement Optional parent element to render the
 *    component into.
 */
goog.ui.Component.prototype.render = function(opt_parentElement) {
  this.render_(opt_parentElement);
};


/**
 * Renders the component before another element. The other element should be in
 * the document already.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Node} sibling Node to render the component before.
 */
goog.ui.Component.prototype.renderBefore = function(sibling) {
  this.render_(/** @type {Element} */ (sibling.parentNode),
               sibling);
};


/**
 * Renders the component.  If a parent element is supplied, the component's
 * element will be appended to it.  If there is no optional parent element and
 * the element doesn't have a parentNode then it will be appended to the
 * document body.
 *
 * If this component has a parent component, and the parent component is
 * not in the document already, then this will not call {@code enterDocument}
 * on this component.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Element=} opt_parentElement Optional parent element to render the
 *    component into.
 * @param {Node=} opt_beforeNode Node before which the component is to
 *    be rendered.  If left out the node is appended to the parent element.
 * @private
 */
goog.ui.Component.prototype.render_ = function(opt_parentElement,
                                               opt_beforeNode) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  if (!this.element_) {
    this.createDom();
  }

  if (opt_parentElement) {
    opt_parentElement.insertBefore(this.element_, opt_beforeNode || null);
  } else {
    this.dom_.getDocument().body.appendChild(this.element_);
  }

  // If this component has a parent component that isn't in the document yet,
  // we don't call enterDocument() here.  Instead, when the parent component
  // enters the document, the enterDocument() call will propagate to its
  // children, including this one.  If the component doesn't have a parent
  // or if the parent is already in the document, we call enterDocument().
  if (!this.parent_ || this.parent_.isInDocument()) {
    this.enterDocument();
  }
};


/**
 * Decorates the element for the UI component. If the element is in the
 * document, the enterDocument method will be called.
 *
 * If goog.ui.Component.ALLOW_DETACHED_DECORATION is false, the caller must
 * pass an element that is in the document.
 *
 * @param {Element} element Element to decorate.
 */
goog.ui.Component.prototype.decorate = function(element) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  } else if (element && this.canDecorate(element)) {
    this.wasDecorated_ = true;

    // Set the DOM helper of the component to match the decorated element.
    var doc = goog.dom.getOwnerDocument(element);
    if (!this.dom_ || this.dom_.getDocument() != doc) {
      this.dom_ = goog.dom.getDomHelper(element);
    }

    // Call specific component decorate logic.
    this.decorateInternal(element);

    // If supporting detached decoration, check that element is in doc.
    if (!goog.ui.Component.ALLOW_DETACHED_DECORATION ||
        goog.dom.contains(doc, element)) {
      this.enterDocument();
    }
  } else {
    throw Error(goog.ui.Component.Error.DECORATE_INVALID);
  }
};


/**
 * Determines if a given element can be decorated by this type of component.
 * This method should be overridden by inheriting objects.
 * @param {Element} element Element to decorate.
 * @return {boolean} True if the element can be decorated, false otherwise.
 */
goog.ui.Component.prototype.canDecorate = function(element) {
  return true;
};


/**
 * @return {boolean} Whether the component was decorated.
 */
goog.ui.Component.prototype.wasDecorated = function() {
  return this.wasDecorated_;
};


/**
 * Actually decorates the element. Should be overridden by inheriting objects.
 * This method can assume there are checks to ensure the component has not
 * already been rendered have occurred and that enter document will be called
 * afterwards. This method is considered protected.
 * @param {Element} element Element to decorate.
 * @protected
 */
goog.ui.Component.prototype.decorateInternal = function(element) {
  this.element_ = element;
};


/**
 * Called when the component's element is known to be in the document. Anything
 * using document.getElementById etc. should be done at this stage.
 *
 * If the component contains child components, this call is propagated to its
 * children.
 */
goog.ui.Component.prototype.enterDocument = function() {
  this.inDocument_ = true;

  // Propagate enterDocument to child components that have a DOM, if any.
  // If a child was decorated before entering the document (permitted when
  // goog.ui.Component.ALLOW_DETACHED_DECORATION is true), its enterDocument
  // will be called here.
  this.forEachChild(function(child) {
    if (!child.isInDocument() && child.getElement()) {
      child.enterDocument();
    }
  });
};


/**
 * Called by dispose to clean up the elements and listeners created by a
 * component, or by a parent component/application who has removed the
 * component from the document but wants to reuse it later.
 *
 * If the component contains child components, this call is propagated to its
 * children.
 *
 * It should be possible for the component to be rendered again once this method
 * has been called.
 */
goog.ui.Component.prototype.exitDocument = function() {
  // Propagate exitDocument to child components that have been rendered, if any.
  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      child.exitDocument();
    }
  });

  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.removeAll();
  }

  this.inDocument_ = false;
};


/**
 * Disposes of the component.  Calls {@code exitDocument}, which is expected to
 * remove event handlers and clean up the component.  Propagates the call to
 * the component's children, if any. Removes the component's DOM from the
 * document unless it was decorated.
 * @override
 * @protected
 */
goog.ui.Component.prototype.disposeInternal = function() {
  if (this.inDocument_) {
    this.exitDocument();
  }

  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_;
  }

  // Disposes of the component's children, if any.
  this.forEachChild(function(child) {
    child.dispose();
  });

  // Detach the component's element from the DOM, unless it was decorated.
  if (!this.wasDecorated_ && this.element_) {
    goog.dom.removeNode(this.element_);
  }

  this.children_ = null;
  this.childIndex_ = null;
  this.element_ = null;
  this.model_ = null;
  this.parent_ = null;

  goog.ui.Component.superClass_.disposeInternal.call(this);
};


/**
 * Helper function for subclasses that gets a unique id for a given fragment,
 * this can be used by components to generate unique string ids for DOM
 * elements.
 * @param {string} idFragment A partial id.
 * @return {string} Unique element id.
 */
goog.ui.Component.prototype.makeId = function(idFragment) {
  return this.getId() + '.' + idFragment;
};


/**
 * Makes a collection of ids.  This is a convenience method for makeId.  The
 * object's values are the id fragments and the new values are the generated
 * ids.  The key will remain the same.
 * @param {Object} object The object that will be used to create the ids.
 * @return {!Object} An object of id keys to generated ids.
 */
goog.ui.Component.prototype.makeIds = function(object) {
  var ids = {};
  for (var key in object) {
    ids[key] = this.makeId(object[key]);
  }
  return ids;
};


/**
 * Returns the model associated with the UI component.
 * @return {*} The model.
 */
goog.ui.Component.prototype.getModel = function() {
  return this.model_;
};


/**
 * Sets the model associated with the UI component.
 * @param {*} obj The model.
 */
goog.ui.Component.prototype.setModel = function(obj) {
  this.model_ = obj;
};


/**
 * Helper function for returning the fragment portion of an id generated using
 * makeId().
 * @param {string} id Id generated with makeId().
 * @return {string} Fragment.
 */
goog.ui.Component.prototype.getFragmentFromId = function(id) {
  return id.substring(this.getId().length + 1);
};


/**
 * Helper function for returning an element in the document with a unique id
 * generated using makeId().
 * @param {string} idFragment The partial id.
 * @return {Element} The element with the unique id, or null if it cannot be
 *     found.
 */
goog.ui.Component.prototype.getElementByFragment = function(idFragment) {
  if (!this.inDocument_) {
    throw Error(goog.ui.Component.Error.NOT_IN_DOCUMENT);
  }
  return this.dom_.getElement(this.makeId(idFragment));
};


/**
 * Adds the specified component as the last child of this component.  See
 * {@link goog.ui.Component#addChildAt} for detailed semantics.
 *
 * @see goog.ui.Component#addChildAt
 * @param {goog.ui.Component} child The new child component.
 * @param {boolean=} opt_render If true, the child component will be rendered
 *    into the parent.
 */
goog.ui.Component.prototype.addChild = function(child, opt_render) {
  // TODO(gboyer): addChildAt(child, this.getChildCount(), false) will
  // reposition any already-rendered child to the end.  Instead, perhaps
  // addChild(child, false) should never reposition the child; instead, clients
  // that need the repositioning will use addChildAt explicitly.  Right now,
  // clients can get around this by calling addChild before calling decorate.
  this.addChildAt(child, this.getChildCount(), opt_render);
};


/**
 * Adds the specified component as a child of this component at the given
 * 0-based index.
 *
 * Both {@code addChild} and {@code addChildAt} assume the following contract
 * between parent and child components:
 *  <ul>
 *    <li>the child component's element must be a descendant of the parent
 *        component's element, and
 *    <li>the DOM state of the child component must be consistent with the DOM
 *        state of the parent component (see {@code isInDocument}) in the
 *        steady state -- the exception is to addChildAt(child, i, false) and
 *        then immediately decorate/render the child.
 *  </ul>
 *
 * In particular, {@code parent.addChild(child)} will throw an error if the
 * child component is already in the document, but the parent isn't.
 *
 * Clients of this API may call {@code addChild} and {@code addChildAt} with
 * {@code opt_render} set to true.  If {@code opt_render} is true, calling these
 * methods will automatically render the child component's element into the
 * parent component's element. If the parent does not yet have an element, then
 * {@code createDom} will automatically be invoked on the parent before
 * rendering the child.
 *
 * Invoking {@code parent.addChild(child, true)} will throw an error if the
 * child component is already in the document, regardless of the parent's DOM
 * state.
 *
 * If {@code opt_render} is true and the parent component is not already
 * in the document, {@code enterDocument} will not be called on this component
 * at this point.
 *
 * Finally, this method also throws an error if the new child already has a
 * different parent, or the given index is out of bounds.
 *
 * @see goog.ui.Component#addChild
 * @param {goog.ui.Component} child The new child component.
 * @param {number} index 0-based index at which the new child component is to be
 *    added; must be between 0 and the current child count (inclusive).
 * @param {boolean=} opt_render If true, the child component will be rendered
 *    into the parent.
 * @return {void} Nada.
 */
goog.ui.Component.prototype.addChildAt = function(child, index, opt_render) {
  goog.asserts.assert(!!child, 'Provided element must not be null.');

  if (child.inDocument_ && (opt_render || !this.inDocument_)) {
    // Adding a child that's already in the document is an error, except if the
    // parent is also in the document and opt_render is false (e.g. decorate()).
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  if (index < 0 || index > this.getChildCount()) {
    // Allowing sparse child arrays would lead to strange behavior, so we don't.
    throw Error(goog.ui.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS);
  }

  // Create the index and the child array on first use.
  if (!this.childIndex_ || !this.children_) {
    this.childIndex_ = {};
    this.children_ = [];
  }

  // Moving child within component, remove old reference.
  if (child.getParent() == this) {
    goog.object.set(this.childIndex_, child.getId(), child);
    goog.array.remove(this.children_, child);

  // Add the child to this component.  goog.object.add() throws an error if
  // a child with the same ID already exists.
  } else {
    goog.object.add(this.childIndex_, child.getId(), child);
  }

  // Set the parent of the child to this component.  This throws an error if
  // the child is already contained by another component.
  child.setParent(this);
  goog.array.insertAt(this.children_, child, index);

  if (child.inDocument_ && this.inDocument_ && child.getParent() == this) {
    // Changing the position of an existing child, move the DOM node.
    var contentElement = this.getContentElement();
    contentElement.insertBefore(child.getElement(),
        (contentElement.childNodes[index] || null));

  } else if (opt_render) {
    // If this (parent) component doesn't have a DOM yet, call createDom now
    // to make sure we render the child component's element into the correct
    // parent element (otherwise render_ with a null first argument would
    // render the child into the document body, which is almost certainly not
    // what we want).
    if (!this.element_) {
      this.createDom();
    }
    // Render the child into the parent at the appropriate location.  Note that
    // getChildAt(index + 1) returns undefined if inserting at the end.
    // TODO(attila): We should have a renderer with a renderChildAt API.
    var sibling = this.getChildAt(index + 1);
    // render_() calls enterDocument() if the parent is already in the document.
    child.render_(this.getContentElement(), sibling ? sibling.element_ : null);
  } else if (this.inDocument_ && !child.inDocument_ && child.element_ &&
      child.element_.parentNode &&
      // Under some circumstances, IE8 implicitly creates a Document Fragment
      // for detached nodes, so ensure the parent is an Element as it should be.
      child.element_.parentNode.nodeType == goog.dom.NodeType.ELEMENT) {
    // We don't touch the DOM, but if the parent is in the document, and the
    // child element is in the document but not marked as such, then we call
    // enterDocument on the child.
    // TODO(gboyer): It would be nice to move this condition entirely, but
    // there's a large risk of breaking existing applications that manually
    // append the child to the DOM and then call addChild.
    child.enterDocument();
  }
};


/**
 * Returns the DOM element into which child components are to be rendered,
 * or null if the component itself hasn't been rendered yet.  This default
 * implementation returns the component's root element.  Subclasses with
 * complex DOM structures must override this method.
 * @return {Element} Element to contain child elements (null if none).
 */
goog.ui.Component.prototype.getContentElement = function() {
  return this.element_;
};


/**
 * Returns true if the component is rendered right-to-left, false otherwise.
 * The first time this function is invoked, the right-to-left rendering property
 * is set if it has not been already.
 * @return {boolean} Whether the control is rendered right-to-left.
 */
goog.ui.Component.prototype.isRightToLeft = function() {
  if (this.rightToLeft_ == null) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.inDocument_ ?
        this.element_ : this.dom_.getDocument().body);
  }
  return /** @type {boolean} */(this.rightToLeft_);
};


/**
 * Set is right-to-left. This function should be used if the component needs
 * to know the rendering direction during dom creation (i.e. before
 * {@link #enterDocument} is called and is right-to-left is set).
 * @param {boolean} rightToLeft Whether the component is rendered
 *     right-to-left.
 */
goog.ui.Component.prototype.setRightToLeft = function(rightToLeft) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.rightToLeft_ = rightToLeft;
};


/**
 * Returns true if the component has children.
 * @return {boolean} True if the component has children.
 */
goog.ui.Component.prototype.hasChildren = function() {
  return !!this.children_ && this.children_.length != 0;
};


/**
 * Returns the number of children of this component.
 * @return {number} The number of children.
 */
goog.ui.Component.prototype.getChildCount = function() {
  return this.children_ ? this.children_.length : 0;
};


/**
 * Returns an array containing the IDs of the children of this component, or an
 * empty array if the component has no children.
 * @return {!Array.<string>} Child component IDs.
 */
goog.ui.Component.prototype.getChildIds = function() {
  var ids = [];

  // We don't use goog.object.getKeys(this.childIndex_) because we want to
  // return the IDs in the correct order as determined by this.children_.
  this.forEachChild(function(child) {
    // addChild()/addChildAt() guarantee that the child array isn't sparse.
    ids.push(child.getId());
  });

  return ids;
};


/**
 * Returns the child with the given ID, or null if no such child exists.
 * @param {string} id Child component ID.
 * @return {goog.ui.Component?} The child with the given ID; null if none.
 */
goog.ui.Component.prototype.getChild = function(id) {
  // Use childIndex_ for O(1) access by ID.
  return (this.childIndex_ && id) ? /** @type {goog.ui.Component} */ (
      goog.object.get(this.childIndex_, id)) || null : null;
};


/**
 * Returns the child at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @return {goog.ui.Component?} The child at the given index; null if none.
 */
goog.ui.Component.prototype.getChildAt = function(index) {
  // Use children_ for access by index.
  return this.children_ ? this.children_[index] || null : null;
};


/**
 * Calls the given function on each of this component's children in order.  If
 * {@code opt_obj} is provided, it will be used as the 'this' object in the
 * function when called.  The function should take two arguments:  the child
 * component and its 0-based index.  The return value is ignored.
 * @param {function(this:T,?,number):?} f The function to call for every
 * child component; should take 2 arguments (the child and its index).
 * @param {T=} opt_obj Used as the 'this' object in f when called.
 * @template T
 */
goog.ui.Component.prototype.forEachChild = function(f, opt_obj) {
  if (this.children_) {
    goog.array.forEach(this.children_, f, opt_obj);
  }
};


/**
 * Returns the 0-based index of the given child component, or -1 if no such
 * child is found.
 * @param {goog.ui.Component?} child The child component.
 * @return {number} 0-based index of the child component; -1 if not found.
 */
goog.ui.Component.prototype.indexOfChild = function(child) {
  return (this.children_ && child) ? goog.array.indexOf(this.children_, child) :
      -1;
};


/**
 * Removes the given child from this component, and returns it.  Throws an error
 * if the argument is invalid or if the specified child isn't found in the
 * parent component.  The argument can either be a string (interpreted as the
 * ID of the child component to remove) or the child component itself.
 *
 * If {@code opt_unrender} is true, calls {@link goog.ui.component#exitDocument}
 * on the removed child, and subsequently detaches the child's DOM from the
 * document.  Otherwise it is the caller's responsibility to clean up the child
 * component's DOM.
 *
 * @see goog.ui.Component#removeChildAt
 * @param {string|goog.ui.Component|null} child The ID of the child to remove,
 *    or the child component itself.
 * @param {boolean=} opt_unrender If true, calls {@code exitDocument} on the
 *    removed child component, and detaches its DOM from the document.
 * @return {goog.ui.Component} The removed component, if any.
 */
goog.ui.Component.prototype.removeChild = function(child, opt_unrender) {
  if (child) {
    // Normalize child to be the object and id to be the ID string.  This also
    // ensures that the child is really ours.
    var id = goog.isString(child) ? child : child.getId();
    child = this.getChild(id);

    if (id && child) {
      goog.object.remove(this.childIndex_, id);
      goog.array.remove(this.children_, child);

      if (opt_unrender) {
        // Remove the child component's DOM from the document.  We have to call
        // exitDocument first (see documentation).
        child.exitDocument();
        if (child.element_) {
          goog.dom.removeNode(child.element_);
        }
      }

      // Child's parent must be set to null after exitDocument is called
      // so that the child can unlisten to its parent if required.
      child.setParent(null);
    }
  }

  if (!child) {
    throw Error(goog.ui.Component.Error.NOT_OUR_CHILD);
  }

  return /** @type {goog.ui.Component} */(child);
};


/**
 * Removes the child at the given index from this component, and returns it.
 * Throws an error if the argument is out of bounds, or if the specified child
 * isn't found in the parent.  See {@link goog.ui.Component#removeChild} for
 * detailed semantics.
 *
 * @see goog.ui.Component#removeChild
 * @param {number} index 0-based index of the child to remove.
 * @param {boolean=} opt_unrender If true, calls {@code exitDocument} on the
 *    removed child component, and detaches its DOM from the document.
 * @return {goog.ui.Component} The removed component, if any.
 */
goog.ui.Component.prototype.removeChildAt = function(index, opt_unrender) {
  // removeChild(null) will throw error.
  return this.removeChild(this.getChildAt(index), opt_unrender);
};


/**
 * Removes every child component attached to this one and returns them.
 *
 * @see goog.ui.Component#removeChild
 * @param {boolean=} opt_unrender If true, calls {@link #exitDocument} on the
 *    removed child components, and detaches their DOM from the document.
 * @return {!Array.<goog.ui.Component>} The removed components if any.
 */
goog.ui.Component.prototype.removeChildren = function(opt_unrender) {
  var removedChildren = [];
  while (this.hasChildren()) {
    removedChildren.push(this.removeChildAt(0, opt_unrender));
  }
  return removedChildren;
};
