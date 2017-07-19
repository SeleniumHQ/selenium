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
 * @fileoverview Tooltip widget implementation.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/tooltip.html
 */

goog.provide('goog.ui.Tooltip');
goog.provide('goog.ui.Tooltip.CursorTooltipPosition');
goog.provide('goog.ui.Tooltip.ElementTooltipPosition');
goog.provide('goog.ui.Tooltip.State');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.OverflowStatus');
goog.require('goog.positioning.ViewportPosition');
goog.require('goog.structs.Set');
goog.require('goog.style');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupBase');



/**
 * Tooltip widget. Can be attached to one or more elements and is shown, with a
 * slight delay, when the the cursor is over the element or the element gains
 * focus.
 *
 * @param {Element|string=} opt_el Element to display tooltip for, either
 *     element reference or string id.
 * @param {?string=} opt_str Text message to display in tooltip.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Popup}
 */
goog.ui.Tooltip = function(opt_el, opt_str, opt_domHelper) {
  /**
   * Dom Helper
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_domHelper ||
      (opt_el ? goog.dom.getDomHelper(goog.dom.getElement(opt_el)) :
                goog.dom.getDomHelper());

  goog.ui.Popup.call(
      this,
      this.dom_.createDom(
          goog.dom.TagName.DIV, {'style': 'position:absolute;display:none;'}));

  /**
   * Cursor position relative to the page.
   * @type {!goog.math.Coordinate}
   * @protected
   */
  this.cursorPosition = new goog.math.Coordinate(1, 1);

  /**
   * Elements this widget is attached to.
   * @type {goog.structs.Set}
   * @private
   */
  this.elements_ = new goog.structs.Set();

  /**
   * Keyboard focus event handler for elements inside the tooltip.
   * @private {goog.events.FocusHandler}
   */
  this.tooltipFocusHandler_ = null;

  // Attach to element, if specified
  if (opt_el) {
    this.attach(opt_el);
  }

  // Set message, if specified.
  if (opt_str != null) {
    this.setText(opt_str);
  }
};
goog.inherits(goog.ui.Tooltip, goog.ui.Popup);
goog.tagUnsealableClass(goog.ui.Tooltip);


/**
 * List of active (open) tooltip widgets. Used to prevent multiple tooltips
 * from appearing at once.
 *
 * @type {!Array<goog.ui.Tooltip>}
 * @private
 */
goog.ui.Tooltip.activeInstances_ = [];


/**
 * Active element reference. Used by the delayed show functionality to keep
 * track of the element the mouse is over or the element with focus.
 * @type {Element}
 * @private
 */
goog.ui.Tooltip.prototype.activeEl_ = null;


/**
 * CSS class name for tooltip.
 *
 * @type {string}
 */
goog.ui.Tooltip.prototype.className = goog.getCssName('goog-tooltip');


/**
 * Delay in milliseconds since the last mouseover or mousemove before the
 * tooltip is displayed for an element.
 *
 * @type {number}
 * @private
 */
goog.ui.Tooltip.prototype.showDelayMs_ = 500;


/**
 * Timer for when to show.
 *
 * @type {number|undefined}
 * @protected
 */
goog.ui.Tooltip.prototype.showTimer;


/**
 * Delay in milliseconds before tooltips are hidden.
 *
 * @type {number}
 * @private
 */
goog.ui.Tooltip.prototype.hideDelayMs_ = 0;


/**
 * Timer for when to hide.
 *
 * @type {number|undefined}
 * @protected
 */
goog.ui.Tooltip.prototype.hideTimer;


/**
 * Element that triggered the tooltip.  Note that if a second element triggers
 * this tooltip, anchor becomes that second element, even if its show is
 * cancelled and the original tooltip survives.
 *
 * @type {Element|undefined}
 * @protected
 */
goog.ui.Tooltip.prototype.anchor;


/**
 * Possible states for the tooltip to be in.
 * @enum {number}
 */
goog.ui.Tooltip.State = {
  INACTIVE: 0,
  WAITING_TO_SHOW: 1,
  SHOWING: 2,
  WAITING_TO_HIDE: 3,
  UPDATING: 4  // waiting to show new hovercard while old one still showing.
};


/**
 * Popup activation types. Used to select a positioning strategy.
 * @enum {number}
 */
goog.ui.Tooltip.Activation = {
  CURSOR: 0,
  FOCUS: 1
};


/**
 * Whether the anchor has seen the cursor move or has received focus since the
 * tooltip was last shown. Used to ignore mouse over events triggered by view
 * changes and UI updates.
 * @type {boolean|undefined}
 * @private
 */
goog.ui.Tooltip.prototype.seenInteraction_;


/**
 * Whether the cursor must have moved before the tooltip will be shown.
 * @type {boolean|undefined}
 * @private
 */
goog.ui.Tooltip.prototype.requireInteraction_;


/**
 * If this tooltip's element contains another tooltip that becomes active, this
 * property identifies that tooltip so that we can check if this tooltip should
 * not be hidden because the nested tooltip is active.
 * @type {goog.ui.Tooltip}
 * @private
 */
goog.ui.Tooltip.prototype.childTooltip_;


/**
 * If this tooltip is inside another tooltip's element, then it may have
 * prevented that tooltip from hiding.  When this tooltip hides, we'll need
 * to check if the parent should be hidden as well.
 * @type {goog.ui.Tooltip}
 * @private
 */
goog.ui.Tooltip.prototype.parentTooltip_;


/**
 * Returns the dom helper that is being used on this component.
 * @return {goog.dom.DomHelper} The dom helper used on this component.
 */
goog.ui.Tooltip.prototype.getDomHelper = function() {
  return this.dom_;
};


/**
 * @return {goog.ui.Tooltip} Active tooltip in a child element, or null if none.
 * @protected
 */
goog.ui.Tooltip.prototype.getChildTooltip = function() {
  return this.childTooltip_;
};


/**
 * Attach to element. Tooltip will be displayed when the cursor is over the
 * element or when the element has been active for a few milliseconds.
 *
 * @param {Element|string} el Element to display tooltip for, either element
 *                            reference or string id.
 */
goog.ui.Tooltip.prototype.attach = function(el) {
  el = goog.dom.getElement(el);

  this.elements_.add(el);
  goog.events.listen(
      el, goog.events.EventType.MOUSEOVER, this.handleMouseOver, false, this);
  goog.events.listen(
      el, goog.events.EventType.MOUSEOUT, this.handleMouseOutAndBlur, false,
      this);
  goog.events.listen(
      el, goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this);
  goog.events.listen(
      el, goog.events.EventType.FOCUS, this.handleFocus, false, this);
  goog.events.listen(
      el, goog.events.EventType.BLUR, this.handleMouseOutAndBlur, false, this);
};


/**
 * Detach from element(s).
 *
 * @param {Element|string=} opt_el Element to detach from, either element
 *                                reference or string id. If no element is
 *                                specified all are detached.
 */
goog.ui.Tooltip.prototype.detach = function(opt_el) {
  if (opt_el) {
    var el = goog.dom.getElement(opt_el);
    this.detachElement_(el);
    this.elements_.remove(el);
  } else {
    var a = this.elements_.getValues();
    for (var el, i = 0; el = a[i]; i++) {
      this.detachElement_(el);
    }
    this.elements_.clear();
  }
};


/**
 * Detach from element.
 *
 * @param {Element} el Element to detach from.
 * @private
 */
goog.ui.Tooltip.prototype.detachElement_ = function(el) {
  goog.events.unlisten(
      el, goog.events.EventType.MOUSEOVER, this.handleMouseOver, false, this);
  goog.events.unlisten(
      el, goog.events.EventType.MOUSEOUT, this.handleMouseOutAndBlur, false,
      this);
  goog.events.unlisten(
      el, goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this);
  goog.events.unlisten(
      el, goog.events.EventType.FOCUS, this.handleFocus, false, this);
  goog.events.unlisten(
      el, goog.events.EventType.BLUR, this.handleMouseOutAndBlur, false, this);
};


/**
 * Sets delay in milliseconds before tooltip is displayed for an element.
 *
 * @param {number} delay The delay in milliseconds.
 */
goog.ui.Tooltip.prototype.setShowDelayMs = function(delay) {
  this.showDelayMs_ = delay;
};


/**
 * @return {number} The delay in milliseconds before tooltip is displayed for an
 *     element.
 */
goog.ui.Tooltip.prototype.getShowDelayMs = function() {
  return this.showDelayMs_;
};


/**
 * Sets delay in milliseconds before tooltip is hidden once the cursor leavs
 * the element.
 *
 * @param {number} delay The delay in milliseconds.
 */
goog.ui.Tooltip.prototype.setHideDelayMs = function(delay) {
  this.hideDelayMs_ = delay;
};


/**
 * @return {number} The delay in milliseconds before tooltip is hidden once the
 *     cursor leaves the element.
 */
goog.ui.Tooltip.prototype.getHideDelayMs = function() {
  return this.hideDelayMs_;
};


/**
 * Sets tooltip message as plain text.
 *
 * @param {string} str Text message to display in tooltip.
 */
goog.ui.Tooltip.prototype.setText = function(str) {
  goog.dom.setTextContent(this.getElement(), str);
};


/**
 * Sets tooltip message as HTML markup.
 * @param {!goog.html.SafeHtml} html HTML message to display in tooltip.
 */
goog.ui.Tooltip.prototype.setSafeHtml = function(html) {
  var element = this.getElement();
  if (element) {
    goog.dom.safe.setInnerHtml(element, html);
  }
};


/**
 * Sets tooltip element.
 *
 * @param {Element} el HTML element to use as the tooltip.
 * @override
 */
goog.ui.Tooltip.prototype.setElement = function(el) {
  var oldElement = this.getElement();
  if (oldElement) {
    goog.dom.removeNode(oldElement);
  }
  goog.ui.Tooltip.superClass_.setElement.call(this, el);
  if (el) {
    var body = this.dom_.getDocument().body;
    body.insertBefore(el, body.lastChild);
    this.registerContentFocusEvents_();
  } else {
    goog.dispose(this.tooltipFocusHandler_);
    this.tooltipFocusHandler_ = null;
  }
};


/**
 * Handler for keyboard focus events of elements inside the tooltip's content
 * element. This should only be invoked if this.getElement() != null.
 * @private
 */
goog.ui.Tooltip.prototype.registerContentFocusEvents_ = function() {
  goog.dispose(this.tooltipFocusHandler_);
  this.tooltipFocusHandler_ =
      new goog.events.FocusHandler(goog.asserts.assert(this.getElement()));
  this.registerDisposable(this.tooltipFocusHandler_);

  goog.events.listen(
      this.tooltipFocusHandler_, goog.events.FocusHandler.EventType.FOCUSIN,
      this.clearHideTimer, undefined /* opt_capt */, this);
  goog.events.listen(
      this.tooltipFocusHandler_, goog.events.FocusHandler.EventType.FOCUSOUT,
      this.startHideTimer, undefined /* opt_capt */, this);
};


/**
 * @return {string} The tooltip message as plain text.
 */
goog.ui.Tooltip.prototype.getText = function() {
  return goog.dom.getTextContent(this.getElement());
};


/**
 * @return {string} The tooltip message as HTML as plain string.
 */
goog.ui.Tooltip.prototype.getHtml = function() {
  return this.getElement().innerHTML;
};


/**
 * @return {goog.ui.Tooltip.State} Current state of tooltip.
 */
goog.ui.Tooltip.prototype.getState = function() {
  return this.showTimer ?
      (this.isVisible() ? goog.ui.Tooltip.State.UPDATING :
                          goog.ui.Tooltip.State.WAITING_TO_SHOW) :
      this.hideTimer ? goog.ui.Tooltip.State.WAITING_TO_HIDE :
                       this.isVisible() ? goog.ui.Tooltip.State.SHOWING :
                                          goog.ui.Tooltip.State.INACTIVE;
};


/**
 * Sets whether tooltip requires the mouse to have moved or the anchor receive
 * focus before the tooltip will be shown.
 * @param {boolean} requireInteraction Whether tooltip should require some user
 *     interaction before showing tooltip.
 */
goog.ui.Tooltip.prototype.setRequireInteraction = function(requireInteraction) {
  this.requireInteraction_ = requireInteraction;
};


/**
 * Returns true if the coord is in the tooltip.
 * @param {goog.math.Coordinate} coord Coordinate being tested.
 * @return {boolean} Whether the coord is in the tooltip.
 */
goog.ui.Tooltip.prototype.isCoordinateInTooltip = function(coord) {
  // Check if coord is inside the the tooltip
  if (!this.isVisible()) {
    return false;
  }

  var offset = goog.style.getPageOffset(this.getElement());
  var size = goog.style.getSize(this.getElement());
  return offset.x <= coord.x && coord.x <= offset.x + size.width &&
      offset.y <= coord.y && coord.y <= offset.y + size.height;
};


/**
 * Called before the popup is shown.
 *
 * @return {boolean} Whether tooltip should be shown.
 * @protected
 * @override
 */
goog.ui.Tooltip.prototype.onBeforeShow = function() {
  if (!goog.ui.PopupBase.prototype.onBeforeShow.call(this)) {
    return false;
  }

  // Hide all open tooltips except if this tooltip is triggered by an element
  // inside another tooltip.
  if (this.anchor) {
    for (var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i++) {
      if (!goog.dom.contains(tt.getElement(), this.anchor)) {
        tt.setVisible(false);
      }
    }
  }
  goog.array.insert(goog.ui.Tooltip.activeInstances_, this);

  var element = this.getElement();
  element.className = this.className;
  this.clearHideTimer();

  // Register event handlers for tooltip. Used to prevent the tooltip from
  // closing if the cursor is over the tooltip rather then the element that
  // triggered it.
  goog.events.listen(
      element, goog.events.EventType.MOUSEOVER, this.handleTooltipMouseOver,
      false, this);
  goog.events.listen(
      element, goog.events.EventType.MOUSEOUT, this.handleTooltipMouseOut,
      false, this);

  this.clearShowTimer();
  return true;
};


/** @override */
goog.ui.Tooltip.prototype.onHide = function() {
  goog.array.remove(goog.ui.Tooltip.activeInstances_, this);

  // Hide all open tooltips triggered by an element inside this tooltip.
  var element = this.getElement();
  for (var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i++) {
    if (tt.anchor && goog.dom.contains(element, tt.anchor)) {
      tt.setVisible(false);
    }
  }

  // If this tooltip is inside another tooltip, start hide timer for that
  // tooltip in case this tooltip was the only reason it was still showing.
  if (this.parentTooltip_) {
    this.parentTooltip_.startHideTimer();
  }

  goog.events.unlisten(
      element, goog.events.EventType.MOUSEOVER, this.handleTooltipMouseOver,
      false, this);
  goog.events.unlisten(
      element, goog.events.EventType.MOUSEOUT, this.handleTooltipMouseOut,
      false, this);

  this.anchor = undefined;
  // If we are still waiting to show a different hovercard, don't abort it
  // because you think you haven't seen a mouse move:
  if (this.getState() == goog.ui.Tooltip.State.INACTIVE) {
    this.seenInteraction_ = false;
  }

  goog.ui.PopupBase.prototype.onHide.call(this);
};


/**
 * Called by timer from mouse over handler. Shows tooltip if cursor is still
 * over the same element.
 *
 * @param {Element} el Element to show tooltip for.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display popup
 *     at.
 */
goog.ui.Tooltip.prototype.maybeShow = function(el, opt_pos) {
  // Assert that the mouse is still over the same element, and that we have not
  // detached from the anchor in the meantime.
  if (this.anchor == el && this.elements_.contains(this.anchor)) {
    if (this.seenInteraction_ || !this.requireInteraction_) {
      // If it is currently showing, then hide it, and abort if it doesn't hide.
      this.setVisible(false);
      if (!this.isVisible()) {
        this.positionAndShow_(el, opt_pos);
      }
    } else {
      this.anchor = undefined;
    }
  }
  this.showTimer = undefined;
};


/**
 * @return {goog.structs.Set} Elements this widget is attached to.
 * @protected
 */
goog.ui.Tooltip.prototype.getElements = function() {
  return this.elements_;
};


/**
 * @return {Element} Active element reference.
 */
goog.ui.Tooltip.prototype.getActiveElement = function() {
  return this.activeEl_;
};


/**
 * @param {Element} activeEl Active element reference.
 * @protected
 */
goog.ui.Tooltip.prototype.setActiveElement = function(activeEl) {
  this.activeEl_ = activeEl;
};


/**
 * Shows tooltip for a specific element.
 *
 * @param {Element} el Element to show tooltip for.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display popup
 *     at.
 */
goog.ui.Tooltip.prototype.showForElement = function(el, opt_pos) {
  this.attach(el);
  this.activeEl_ = el;

  this.positionAndShow_(el, opt_pos);
};


/**
 * Sets tooltip position and shows it.
 *
 * @param {Element} el Element to show tooltip for.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display popup
 *     at.
 * @private
 */
goog.ui.Tooltip.prototype.positionAndShow_ = function(el, opt_pos) {
  this.anchor = el;
  this.setPosition(
      opt_pos ||
      this.getPositioningStrategy(goog.ui.Tooltip.Activation.CURSOR));
  this.setVisible(true);
};


/**
 * Called by timer from mouse out handler. Hides tooltip if cursor is still
 * outside element and tooltip, or if a child of tooltip has the focus.
 * @param {?Element|undefined} el Tooltip's anchor when hide timer was started.
 */
goog.ui.Tooltip.prototype.maybeHide = function(el) {
  this.hideTimer = undefined;
  if (el == this.anchor) {
    var dom = this.getDomHelper();
    var focusedEl = dom.getActiveElement();
    // If the tooltip content is focused, then don't hide the tooltip.
    var tooltipContentFocused = focusedEl && this.getElement() &&
        dom.contains(this.getElement(), focusedEl);
    if ((this.activeEl_ == null ||
         (this.activeEl_ != this.getElement() &&
          !this.elements_.contains(this.activeEl_))) &&
        !tooltipContentFocused && !this.hasActiveChild()) {
      this.setVisible(false);
    }
  }
};


/**
 * @return {boolean} Whether tooltip element contains an active child tooltip,
 *     and should thus not be hidden.  When the child tooltip is hidden, it
 *     will check if the parent should be hidden, too.
 * @protected
 */
goog.ui.Tooltip.prototype.hasActiveChild = function() {
  return !!(this.childTooltip_ && this.childTooltip_.activeEl_);
};


/**
 * Saves the current mouse cursor position to {@code this.cursorPosition}.
 * @param {goog.events.BrowserEvent} event MOUSEOVER or MOUSEMOVE event.
 * @private
 */
goog.ui.Tooltip.prototype.saveCursorPosition_ = function(event) {
  var scroll = this.dom_.getDocumentScroll();
  this.cursorPosition.x = event.clientX + scroll.x;
  this.cursorPosition.y = event.clientY + scroll.y;
};


/**
 * Handler for mouse over events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.Tooltip.prototype.handleMouseOver = function(event) {
  var el = this.getAnchorFromElement(/** @type {Element} */ (event.target));
  this.activeEl_ = el;
  this.clearHideTimer();
  if (el != this.anchor) {
    this.anchor = el;
    this.startShowTimer(el);
    this.checkForParentTooltip_();
    this.saveCursorPosition_(event);
  }
};


/**
 * Find anchor containing the given element, if any.
 *
 * @param {Element} el Element that triggered event.
 * @return {Element} Element in elements_ array that contains given element,
 *     or null if not found.
 * @protected
 */
goog.ui.Tooltip.prototype.getAnchorFromElement = function(el) {
  // FireFox has a bug where mouse events relating to <input> elements are
  // sometimes duplicated (often in FF2, rarely in FF3): once for the
  // <input> element and once for a magic hidden <div> element.  Javascript
  // code does not have sufficient permissions to read properties on that
  // magic element and thus will throw an error in this call to
  // getAnchorFromElement_().  In that case we swallow the error.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=330961
  try {
    while (el && !this.elements_.contains(el)) {
      el = /** @type {Element} */ (el.parentNode);
    }
    return el;
  } catch (e) {
    return null;
  }
};


/**
 * Handler for mouse move events.
 *
 * @param {goog.events.BrowserEvent} event MOUSEMOVE event.
 * @protected
 */
goog.ui.Tooltip.prototype.handleMouseMove = function(event) {
  this.saveCursorPosition_(event);
  this.seenInteraction_ = true;
};


/**
 * Handler for focus events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.Tooltip.prototype.handleFocus = function(event) {
  var el = this.getAnchorFromElement(/** @type {Element} */ (event.target));
  this.activeEl_ = el;
  this.seenInteraction_ = true;

  if (this.anchor != el) {
    this.anchor = el;
    var pos = this.getPositioningStrategy(goog.ui.Tooltip.Activation.FOCUS);
    this.clearHideTimer();
    this.startShowTimer(el, pos);

    this.checkForParentTooltip_();
  }
};


/**
 * Return a Position instance for repositioning the tooltip. Override in
 * subclasses to customize the way repositioning is done.
 *
 * @param {goog.ui.Tooltip.Activation} activationType Information about what
 *    kind of event caused the popup to be shown.
 * @return {!goog.positioning.AbstractPosition} The position object used
 *    to position the tooltip.
 * @protected
 */
goog.ui.Tooltip.prototype.getPositioningStrategy = function(activationType) {
  if (activationType == goog.ui.Tooltip.Activation.CURSOR) {
    var coord = this.cursorPosition.clone();
    return new goog.ui.Tooltip.CursorTooltipPosition(coord);
  }
  return new goog.ui.Tooltip.ElementTooltipPosition(this.activeEl_);
};


/**
 * Looks for an active tooltip whose element contains this tooltip's anchor.
 * This allows us to prevent hides until they are really necessary.
 *
 * @private
 */
goog.ui.Tooltip.prototype.checkForParentTooltip_ = function() {
  if (this.anchor) {
    for (var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i++) {
      if (goog.dom.contains(tt.getElement(), this.anchor)) {
        tt.childTooltip_ = this;
        this.parentTooltip_ = tt;
      }
    }
  }
};


/**
 * Handler for mouse out and blur events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.Tooltip.prototype.handleMouseOutAndBlur = function(event) {
  var el = this.getAnchorFromElement(/** @type {Element} */ (event.target));
  var elTo = this.getAnchorFromElement(
      /** @type {Element} */ (event.relatedTarget));
  if (el == elTo) {
    // We haven't really left the anchor, just moved from one child to
    // another.
    return;
  }

  if (el == this.activeEl_) {
    this.activeEl_ = null;
  }

  this.clearShowTimer();
  this.seenInteraction_ = false;
  if (this.isVisible() &&
      (!event.relatedTarget ||
       !goog.dom.contains(this.getElement(), event.relatedTarget))) {
    this.startHideTimer();
  } else {
    this.anchor = undefined;
  }
};


/**
 * Handler for mouse over events for the tooltip element.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.Tooltip.prototype.handleTooltipMouseOver = function(event) {
  var element = this.getElement();
  if (this.activeEl_ != element) {
    this.clearHideTimer();
    this.activeEl_ = element;
  }
};


/**
 * Handler for mouse out events for the tooltip element.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.Tooltip.prototype.handleTooltipMouseOut = function(event) {
  var element = this.getElement();
  if (this.activeEl_ == element &&
      (!event.relatedTarget ||
       !goog.dom.contains(element, event.relatedTarget))) {
    this.activeEl_ = null;
    this.startHideTimer();
  }
};


/**
 * Helper method, starts timer that calls maybeShow. Parameters are passed to
 * the maybeShow method.
 *
 * @param {Element} el Element to show tooltip for.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display popup
 *     at.
 * @protected
 */
goog.ui.Tooltip.prototype.startShowTimer = function(el, opt_pos) {
  if (!this.showTimer) {
    this.showTimer = goog.Timer.callOnce(
        goog.bind(this.maybeShow, this, el, opt_pos), this.showDelayMs_);
  }
};


/**
 * Helper method called to clear the show timer.
 *
 * @protected
 */
goog.ui.Tooltip.prototype.clearShowTimer = function() {
  if (this.showTimer) {
    goog.Timer.clear(this.showTimer);
    this.showTimer = undefined;
  }
};


/**
 * Helper method called to start the close timer.
 * @protected
 */
goog.ui.Tooltip.prototype.startHideTimer = function() {
  if (this.getState() == goog.ui.Tooltip.State.SHOWING) {
    this.hideTimer = goog.Timer.callOnce(
        goog.bind(this.maybeHide, this, this.anchor), this.getHideDelayMs());
  }
};


/**
 * Helper method called to clear the close timer.
 * @protected
 */
goog.ui.Tooltip.prototype.clearHideTimer = function() {
  if (this.hideTimer) {
    goog.Timer.clear(this.hideTimer);
    this.hideTimer = undefined;
  }
};


/** @override */
goog.ui.Tooltip.prototype.disposeInternal = function() {
  this.setVisible(false);
  this.clearShowTimer();
  this.detach();
  if (this.getElement()) {
    goog.dom.removeNode(this.getElement());
  }
  this.activeEl_ = null;
  delete this.dom_;
  goog.ui.Tooltip.superClass_.disposeInternal.call(this);
};



/**
 * Popup position implementation that positions the popup (the tooltip in this
 * case) based on the cursor position. It's positioned below the cursor to the
 * right if there's enough room to fit all of it inside the Viewport. Otherwise
 * it's displayed as far right as possible either above or below the element.
 *
 * Used to position tooltips triggered by the cursor.
 *
 * @param {number|!goog.math.Coordinate} arg1 Left position or coordinate.
 * @param {number=} opt_arg2 Top position.
 * @constructor
 * @extends {goog.positioning.ViewportPosition}
 * @final
 */
goog.ui.Tooltip.CursorTooltipPosition = function(arg1, opt_arg2) {
  goog.positioning.ViewportPosition.call(this, arg1, opt_arg2);
};
goog.inherits(
    goog.ui.Tooltip.CursorTooltipPosition, goog.positioning.ViewportPosition);


/**
 * Repositions the popup based on cursor position.
 *
 * @param {Element} element The DOM element of the popup.
 * @param {goog.positioning.Corner} popupCorner The corner of the popup element
 *     that that should be positioned adjacent to the anchorElement.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 * @override
 */
goog.ui.Tooltip.CursorTooltipPosition.prototype.reposition = function(
    element, popupCorner, opt_margin) {
  var viewportElt = goog.style.getClientViewportElement(element);
  var viewport = goog.style.getVisibleRectForElement(viewportElt);
  var margin = opt_margin ?
      new goog.math.Box(
          opt_margin.top + 10, opt_margin.right, opt_margin.bottom,
          opt_margin.left + 10) :
      new goog.math.Box(10, 0, 0, 10);

  if (goog.positioning.positionAtCoordinate(
          this.coordinate, element, goog.positioning.Corner.TOP_START, margin,
          viewport, goog.positioning.Overflow.ADJUST_X |
              goog.positioning.Overflow.FAIL_Y) &
      goog.positioning.OverflowStatus.FAILED) {
    goog.positioning.positionAtCoordinate(
        this.coordinate, element, goog.positioning.Corner.TOP_START, margin,
        viewport, goog.positioning.Overflow.ADJUST_X |
            goog.positioning.Overflow.ADJUST_Y);
  }
};



/**
 * Popup position implementation that positions the popup (the tooltip in this
 * case) based on the element position. It's positioned below the element to the
 * right if there's enough room to fit all of it inside the Viewport. Otherwise
 * it's displayed as far right as possible either above or below the element.
 *
 * Used to position tooltips triggered by focus changes.
 *
 * @param {Element} element The element to anchor the popup at.
 * @constructor
 * @extends {goog.positioning.AnchoredPosition}
 */
goog.ui.Tooltip.ElementTooltipPosition = function(element) {
  goog.positioning.AnchoredPosition.call(
      this, element, goog.positioning.Corner.BOTTOM_RIGHT);
};
goog.inherits(
    goog.ui.Tooltip.ElementTooltipPosition, goog.positioning.AnchoredPosition);


/**
 * Repositions the popup based on element position.
 *
 * @param {Element} element The DOM element of the popup.
 * @param {goog.positioning.Corner} popupCorner The corner of the popup element
 *     that should be positioned adjacent to the anchorElement.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 * @override
 */
goog.ui.Tooltip.ElementTooltipPosition.prototype.reposition = function(
    element, popupCorner, opt_margin) {
  var offset = new goog.math.Coordinate(10, 0);

  if (goog.positioning.positionAtAnchor(
          this.element, this.corner, element, popupCorner, offset, opt_margin,
          goog.positioning.Overflow.ADJUST_X |
              goog.positioning.Overflow.FAIL_Y) &
      goog.positioning.OverflowStatus.FAILED) {
    goog.positioning.positionAtAnchor(
        this.element, goog.positioning.Corner.TOP_RIGHT, element,
        goog.positioning.Corner.BOTTOM_LEFT, offset, opt_margin,
        goog.positioning.Overflow.ADJUST_X |
            goog.positioning.Overflow.ADJUST_Y);
  }
};
