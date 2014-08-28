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
 * @fileoverview Zippy widget implementation.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/zippy.html
 */

goog.provide('goog.ui.Zippy');
goog.provide('goog.ui.Zippy.Events');
goog.provide('goog.ui.ZippyEvent');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.style');



/**
 * Zippy widget. Expandable/collapsible container, clicking the header toggles
 * the visibility of the content.
 *
 * @extends {goog.events.EventTarget}
 * @param {Element|string|null} header Header element, either element
 *     reference, string id or null if no header exists.
 * @param {Element|string|function():Element=} opt_content Content element
 *     (if any), either element reference or string id.  If skipped, the caller
 *     should handle the TOGGLE event in its own way. If a function is passed,
 *     then if will be called to create the content element the first time the
 *     zippy is expanded.
 * @param {boolean=} opt_expanded Initial expanded/visibility state. Defaults to
 *     false.
 * @param {Element|string=} opt_expandedHeader Element to use as the header when
 *     the zippy is expanded.
 * @param {goog.dom.DomHelper=} opt_domHelper An optional DOM helper.
 * @constructor
 */
goog.ui.Zippy = function(header, opt_content, opt_expanded,
    opt_expandedHeader, opt_domHelper) {
  goog.ui.Zippy.base(this, 'constructor');

  /**
   * DomHelper used to interact with the document, allowing components to be
   * created in a different window.
   * @type {!goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Header element or null if no header exists.
   * @type {Element}
   * @private
   */
  this.elHeader_ = this.dom_.getElement(header) || null;

  /**
   * When present, the header to use when the zippy is expanded.
   * @type {Element}
   * @private
   */
  this.elExpandedHeader_ = this.dom_.getElement(opt_expandedHeader || null);

  /**
   * Function that will create the content element, or false if there is no such
   * function.
   * @type {?function():Element}
   * @private
   */
  this.lazyCreateFunc_ = goog.isFunction(opt_content) ? opt_content : null;

  /**
   * Content element.
   * @type {Element}
   * @private
   */
  this.elContent_ = this.lazyCreateFunc_ || !opt_content ? null :
      this.dom_.getElement(/** @type {Element} */ (opt_content));

  /**
   * Expanded state.
   * @type {boolean}
   * @private
   */
  this.expanded_ = opt_expanded == true;

  /**
   * A keyboard events handler. If there are two headers it is shared for both.
   * @type {goog.events.EventHandler.<!goog.ui.Zippy>}
   * @private
   */
  this.keyboardEventHandler_ = new goog.events.EventHandler(this);

  /**
   * A mouse events handler. If there are two headers it is shared for both.
   * @type {goog.events.EventHandler.<!goog.ui.Zippy>}
   * @private
   */
  this.mouseEventHandler_ = new goog.events.EventHandler(this);

  var self = this;
  function addHeaderEvents(el) {
    if (el) {
      el.tabIndex = 0;
      goog.a11y.aria.setRole(el, self.getAriaRole());
      goog.dom.classlist.add(el, goog.getCssName('goog-zippy-header'));
      self.enableMouseEventsHandling_(el);
      self.enableKeyboardEventsHandling_(el);
    }
  }
  addHeaderEvents(this.elHeader_);
  addHeaderEvents(this.elExpandedHeader_);

  // initialize based on expanded state
  this.setExpanded(this.expanded_);
};
goog.inherits(goog.ui.Zippy, goog.events.EventTarget);
goog.tagUnsealableClass(goog.ui.Zippy);


/**
 * Constants for event names
 *
 * @type {Object}
 */
goog.ui.Zippy.Events = {
  // Zippy will dispatch an ACTION event for user interaction. Mimics
  // {@code goog.ui.Controls#performActionInternal} by first changing
  // the toggle state and then dispatching an ACTION event.
  ACTION: 'action',
  // Zippy state is toggled from collapsed to expanded or vice versa.
  TOGGLE: 'toggle'
};


/**
 * Whether to listen for and handle mouse events; defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Zippy.prototype.handleMouseEvents_ = true;


/**
 * Whether to listen for and handle key events; defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Zippy.prototype.handleKeyEvents_ = true;


/** @override */
goog.ui.Zippy.prototype.disposeInternal = function() {
  goog.ui.Zippy.base(this, 'disposeInternal');
  goog.dispose(this.keyboardEventHandler_);
  goog.dispose(this.mouseEventHandler_);
};


/**
 * @return {goog.a11y.aria.Role} The ARIA role to be applied to Zippy element.
 */
goog.ui.Zippy.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.TAB;
};


/**
 * @return {Element} The content element.
 */
goog.ui.Zippy.prototype.getContentElement = function() {
  return this.elContent_;
};


/**
 * @return {Element} The visible header element.
 */
goog.ui.Zippy.prototype.getVisibleHeaderElement = function() {
  var expandedHeader = this.elExpandedHeader_;
  return expandedHeader && goog.style.isElementShown(expandedHeader) ?
      expandedHeader : this.elHeader_;
};


/**
 * Expands content pane.
 */
goog.ui.Zippy.prototype.expand = function() {
  this.setExpanded(true);
};


/**
 * Collapses content pane.
 */
goog.ui.Zippy.prototype.collapse = function() {
  this.setExpanded(false);
};


/**
 * Toggles expanded state.
 */
goog.ui.Zippy.prototype.toggle = function() {
  this.setExpanded(!this.expanded_);
};


/**
 * Sets expanded state.
 *
 * @param {boolean} expanded Expanded/visibility state.
 */
goog.ui.Zippy.prototype.setExpanded = function(expanded) {
  if (this.elContent_) {
    // Hide the element, if one is provided.
    goog.style.setElementShown(this.elContent_, expanded);
  } else if (expanded && this.lazyCreateFunc_) {
    // Assume that when the element is not hidden upon creation.
    this.elContent_ = this.lazyCreateFunc_();
  }
  if (this.elContent_) {
    goog.dom.classlist.add(this.elContent_,
        goog.getCssName('goog-zippy-content'));
  }

  if (this.elExpandedHeader_) {
    // Hide the show header and show the hide one.
    goog.style.setElementShown(this.elHeader_, !expanded);
    goog.style.setElementShown(this.elExpandedHeader_, expanded);
  } else {
    // Update header image, if any.
    this.updateHeaderClassName(expanded);
  }

  this.setExpandedInternal(expanded);

  // Fire toggle event
  this.dispatchEvent(new goog.ui.ZippyEvent(goog.ui.Zippy.Events.TOGGLE,
                                            this, this.expanded_));
};


/**
 * Sets expanded internal state.
 *
 * @param {boolean} expanded Expanded/visibility state.
 * @protected
 */
goog.ui.Zippy.prototype.setExpandedInternal = function(expanded) {
  this.expanded_ = expanded;
};


/**
 * @return {boolean} Whether the zippy is expanded.
 */
goog.ui.Zippy.prototype.isExpanded = function() {
  return this.expanded_;
};


/**
 * Updates the header element's className and ARIA (accessibility) EXPANDED
 * state.
 *
 * @param {boolean} expanded Expanded/visibility state.
 * @protected
 */
goog.ui.Zippy.prototype.updateHeaderClassName = function(expanded) {
  if (this.elHeader_) {
    goog.dom.classlist.enable(this.elHeader_,
        goog.getCssName('goog-zippy-expanded'), expanded);
    goog.dom.classlist.enable(this.elHeader_,
        goog.getCssName('goog-zippy-collapsed'), !expanded);
    goog.a11y.aria.setState(this.elHeader_,
        goog.a11y.aria.State.EXPANDED,
        expanded);
  }
};


/**
 * @return {boolean} Whether the Zippy handles its own key events.
 */
goog.ui.Zippy.prototype.isHandleKeyEvents = function() {
  return this.handleKeyEvents_;
};


/**
 * @return {boolean} Whether the Zippy handles its own mouse events.
 */
goog.ui.Zippy.prototype.isHandleMouseEvents = function() {
  return this.handleMouseEvents_;
};


/**
 * Sets whether the Zippy handles it's own keyboard events.
 * @param {boolean} enable Whether the Zippy handles keyboard events.
 */
goog.ui.Zippy.prototype.setHandleKeyboardEvents = function(enable) {
  if (this.handleKeyEvents_ != enable) {
    this.handleKeyEvents_ = enable;
    if (enable) {
      this.enableKeyboardEventsHandling_(this.elHeader_);
      this.enableKeyboardEventsHandling_(this.elExpandedHeader_);
    } else {
      this.keyboardEventHandler_.removeAll();
    }
  }
};


/**
 * Sets whether the Zippy handles it's own mouse events.
 * @param {boolean} enable Whether the Zippy handles mouse events.
 */
goog.ui.Zippy.prototype.setHandleMouseEvents = function(enable) {
  if (this.handleMouseEvents_ != enable) {
    this.handleMouseEvents_ = enable;
    if (enable) {
      this.enableMouseEventsHandling_(this.elHeader_);
      this.enableMouseEventsHandling_(this.elExpandedHeader_);
    } else {
      this.mouseEventHandler_.removeAll();
    }
  }
};


/**
 * Enables keyboard events handling for the passed header element.
 * @param {Element} header The header element.
 * @private
 */
goog.ui.Zippy.prototype.enableKeyboardEventsHandling_ = function(header) {
  if (header) {
    this.keyboardEventHandler_.listen(header, goog.events.EventType.KEYDOWN,
        this.onHeaderKeyDown_);
  }
};


/**
 * Enables mouse events handling for the passed header element.
 * @param {Element} header The header element.
 * @private
 */
goog.ui.Zippy.prototype.enableMouseEventsHandling_ = function(header) {
  if (header) {
    this.mouseEventHandler_.listen(header, goog.events.EventType.CLICK,
        this.onHeaderClick_);
  }
};


/**
 * KeyDown event handler for header element. Enter and space toggles expanded
 * state.
 *
 * @param {goog.events.BrowserEvent} event KeyDown event.
 * @private
 */
goog.ui.Zippy.prototype.onHeaderKeyDown_ = function(event) {
  if (event.keyCode == goog.events.KeyCodes.ENTER ||
      event.keyCode == goog.events.KeyCodes.SPACE) {

    this.toggle();
    this.dispatchActionEvent_();

    // Prevent enter key from submitting form.
    event.preventDefault();

    event.stopPropagation();
  }
};


/**
 * Click event handler for header element.
 *
 * @param {goog.events.BrowserEvent} event Click event.
 * @private
 */
goog.ui.Zippy.prototype.onHeaderClick_ = function(event) {
  this.toggle();
  this.dispatchActionEvent_();
};


/**
 * Dispatch an ACTION event whenever there is user interaction with the header.
 * Please note that after the zippy state change is completed a TOGGLE event
 * will be dispatched. However, the TOGGLE event is dispatch on every toggle,
 * including programmatic call to {@code #toggle}.
 * @private
 */
goog.ui.Zippy.prototype.dispatchActionEvent_ = function() {
  this.dispatchEvent(new goog.events.Event(goog.ui.Zippy.Events.ACTION, this));
};



/**
 * Object representing a zippy toggle event.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Zippy} target Zippy widget initiating event.
 * @param {boolean} expanded Expanded state.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.ui.ZippyEvent = function(type, target, expanded) {
  goog.ui.ZippyEvent.base(this, 'constructor', type, target);

  /**
   * The expanded state.
   * @type {boolean}
   */
  this.expanded = expanded;
};
goog.inherits(goog.ui.ZippyEvent, goog.events.Event);
