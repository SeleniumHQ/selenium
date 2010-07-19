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
*
 * @see ../demos/zippy.html
 */

goog.provide('goog.ui.Zippy');
goog.provide('goog.ui.ZippyEvent');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
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
 * @constructor
 */
goog.ui.Zippy = function(header, opt_content, opt_expanded,
    opt_expandedHeader) {
  goog.events.EventTarget.call(this);

  /**
   * Header element or null if no header exists.
   * @type {Element}
   * @private
   */
  this.elHeader_ = goog.dom.getElement(header) || null;

  /**
   * When present, the header to use when the zippy is expanded.
   * @type {Element}
   * @private
   */
  this.elExpandedHeader_ = goog.dom.getElement(opt_expandedHeader || null);

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
      goog.dom.getElement(/** @type {Element} */ (opt_content));

  /**
   * Expanded state.
   * @type {boolean}
   * @private
   */
  this.expanded_ = opt_expanded == true;

  var self = this;
  function addHeaderEvents(el) {
    if (el) {
      // Listen for click and keydown events on header
      el.tabIndex = 0;
      goog.events.listen(el, goog.events.EventType.CLICK,
          self.onHeaderClick_, false, self);
      goog.events.listen(el, goog.events.EventType.KEYDOWN,
          self.onHeaderKeyDown_, false, self);
    }
  }
  addHeaderEvents(this.elHeader_);
  addHeaderEvents(this.elExpandedHeader_);

  // initialize based on expanded state
  this.setExpanded(this.expanded_);
};
goog.inherits(goog.ui.Zippy, goog.events.EventTarget);


/**
 * Constants for event names
 *
 * @type {Object}
 */
goog.ui.Zippy.Events = {
  TOGGLE: 'toggle'
};

/**
 * Destroys widget and removes all event listeners.
 */
goog.ui.Zippy.prototype.disposeInternal = function() {
  if (this.elHeader_) {
    goog.events.removeAll(this.elHeader_);
  }
  if (this.elExpandedHeader_) {
    goog.events.removeAll(this.elExpandedHeader_);
  }
  goog.ui.Zippy.superClass_.disposeInternal.call(this);
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
    goog.style.showElement(this.elContent_, expanded);
  } else if (expanded && this.lazyCreateFunc_) {
    // Assume that when the element is not hidden upon creation.
    this.elContent_ = this.lazyCreateFunc_();
  }

  if (this.elExpandedHeader_) {
    // Hide the show header and show the hide one.
    goog.style.showElement(this.elHeader_, !expanded);
    goog.style.showElement(this.elExpandedHeader_, expanded);
  } else {
    // Update header image, if any.
    this.updateHeaderClassName_(expanded);
  }

  this.expanded_ = expanded;

  // Fire toggle event
  this.dispatchEvent(new goog.ui.ZippyEvent(goog.ui.Zippy.Events.TOGGLE,
                                            this, this.expanded_));
};


/**
 * @return {boolean} Whether the zippy is expanded.
 */
goog.ui.Zippy.prototype.isExpanded = function() {
  return this.expanded_;
};


/**
 * Updates the header element's className
 *
 * @param {boolean} expanded Expanded/visibility state.
 * @private
 */
goog.ui.Zippy.prototype.updateHeaderClassName_ = function(expanded) {
  if (this.elHeader_) {
    goog.dom.classes.enable(this.elHeader_,
        goog.getCssName('goog-zippy-expanded'), expanded)
    goog.dom.classes.enable(this.elHeader_,
        goog.getCssName('goog-zippy-collapsed'), !expanded)
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

    // Prevent enter key from submiting form.
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
};



/**
 * Object representing a zippy toggle event.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Zippy} target Zippy widget initiating event.
 * @param {boolean} expanded Expanded state.
 * @extends {goog.events.Event}
 * @constructor
 */
goog.ui.ZippyEvent = function(type, target, expanded) {
  goog.events.Event.call(this, type, target);

  /**
   * The expanded state.
   * @type {boolean}
   */
  this.expanded = expanded;
};
goog.inherits(goog.ui.ZippyEvent, goog.events.Event);
