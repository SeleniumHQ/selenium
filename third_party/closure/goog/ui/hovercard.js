// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Show hovercards with a delay after the mouse moves over an
 * element of a specified type and with a specific attribute.
 *
 * @see ../demos/hovercard.html
 */

goog.provide('goog.ui.HoverCard');
goog.provide('goog.ui.HoverCard.EventType');
goog.provide('goog.ui.HoverCard.TriggerEvent');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.ui.AdvancedTooltip');



/**
 * Create a hover card object.  Hover cards extend tooltips in that they don't
 * have to be manually attached to each element that can cause them to display.
 * Instead, you can create a function that gets called when the mouse goes over
 * any element on your page, and returns whether or not the hovercard should be
 * shown for that element.
 *
 * Alternatively, you can define a map of tag names to the attribute name each
 * tag should have for that tag to trigger the hover card.  See example below.
 *
 * Hovercards can also be triggered manually by calling
 * {@code triggerForElement}, shown without a delay by calling
 * {@code showForElement}, or triggered over other elements by calling
 * {@code attach}.  For the latter two cases, the application is responsible
 * for calling {@code detach} when finished.
 *
 * HoverCard objects fire a TRIGGER event when the mouse moves over an element
 * that can trigger a hovercard, and BEFORE_SHOW when the hovercard is
 * about to be shown.  Clients can respond to these events and can prevent the
 * hovercard from being triggered or shown.
 *
 * @param {Function|Object} isAnchor Function that returns true if a given
 *     element should trigger the hovercard.  Alternatively, it can be a map of
 *     tag names to the attribute that the tag should have in order to trigger
 *     the hovercard, e.g., {A: 'href'} for all links.  Tag names must be all
 *     upper case; attribute names are case insensitive.
 * @param {boolean=} opt_checkDescendants Use false for a performance gain if
 *     you are sure that none of your triggering elements have child elements.
 *     Default is true.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper to use for
 *     creating and rendering the hovercard element.
 * @param {Document=} opt_triggeringDocument Optional document to use in place
 *     of the one included in the DomHelper for finding triggering elements.
 *     Defaults to the document included in the DomHelper.
 * @constructor
 * @extends {goog.ui.AdvancedTooltip}
 */
goog.ui.HoverCard = function(isAnchor, opt_checkDescendants, opt_domHelper,
    opt_triggeringDocument) {
  goog.ui.AdvancedTooltip.call(this, null, null, opt_domHelper);

  if (goog.isFunction(isAnchor)) {
    // Override default implementation of {@code isAnchor_}.
    this.isAnchor_ = isAnchor;
  } else {

    /**
     * Map of tag names to attribute names that will trigger a hovercard.
     * @type {Object}
     * @private
     */
    this.anchors_ = isAnchor;
  }

  /**
   * Whether anchors may have child elements.  If true, then we need to check
   * the parent chain of any mouse over event to see if any of those elements
   * could be anchors.  Default is true.
   * @type {boolean}
   * @private
   */
  this.checkDescendants_ = opt_checkDescendants != false;

  /**
   * Array of anchor elements that should be detached when we are no longer
   * associated with them.
   * @type {!Array.<Element>}
   * @private
   */
  this.tempAttachedAnchors_ = [];

  /**
   * Document containing the triggering elements, to which we listen for
   * mouseover events.
   * @type {Document}
   * @private
   */
  this.document_ = opt_triggeringDocument || (opt_domHelper ?
      opt_domHelper.getDocument() : goog.dom.getDocument());

  goog.events.listen(this.document_, goog.events.EventType.MOUSEOVER,
                     this.handleTriggerMouseOver_, false, this);
};
goog.inherits(goog.ui.HoverCard, goog.ui.AdvancedTooltip);


/**
 * Enum for event type fired by HoverCard.
 * @enum {string}
 */
goog.ui.HoverCard.EventType = {
  TRIGGER: 'trigger',
  CANCEL_TRIGGER: 'canceltrigger',
  BEFORE_SHOW: goog.ui.PopupBase.EventType.BEFORE_SHOW,
  SHOW: goog.ui.PopupBase.EventType.SHOW,
  BEFORE_HIDE: goog.ui.PopupBase.EventType.BEFORE_HIDE,
  HIDE: goog.ui.PopupBase.EventType.HIDE
};


/** @override */
goog.ui.HoverCard.prototype.disposeInternal = function() {
  goog.ui.HoverCard.superClass_.disposeInternal.call(this);

  goog.events.unlisten(this.document_, goog.events.EventType.MOUSEOVER,
                       this.handleTriggerMouseOver_, false, this);
};


/**
 * Anchor of hovercard currently being shown.  This may be different from
 * {@code anchor} property if a second hovercard is triggered, when
 * {@code anchor} becomes the second hovercard while {@code currentAnchor_}
 * is still the old (but currently displayed) anchor.
 * @type {Element}
 * @private
 */
goog.ui.HoverCard.prototype.currentAnchor_;


/**
 * Maximum number of levels to search up the dom when checking descendants.
 * @type {number}
 * @private
 */
goog.ui.HoverCard.prototype.maxSearchSteps_;


/**
 * This function can be overridden by passing a function as the first parameter
 * to the constructor.
 * @param {Node} node Node to test.
 * @return {boolean} Whether or not hovercard should be shown.
 * @private
 */
goog.ui.HoverCard.prototype.isAnchor_ = function(node) {
  return node.tagName in this.anchors_ &&
      !!node.getAttribute(this.anchors_[node.tagName]);
};


/**
 * If the user mouses over an element with the correct tag and attribute, then
 * trigger the hovercard for that element.  If anchors could have children, then
 * we also need to check the parent chain of the given element.
 * @param {goog.events.Event} e Mouse over event.
 * @private
 */
goog.ui.HoverCard.prototype.handleTriggerMouseOver_ = function(e) {
  var target = /** @type {Element} */ (e.target);
  // Target might be null when hovering over disabled input textboxes in IE.
  if (!target) {
    return;
  }
  if (this.isAnchor_(target)) {
    this.setPosition(null);
    this.triggerForElement(target);
  } else if (this.checkDescendants_) {
    var trigger = goog.dom.getAncestor(target,
                                       goog.bind(this.isAnchor_, this),
                                       false,
                                       this.maxSearchSteps_);
    if (trigger) {
      this.setPosition(null);
      this.triggerForElement(/** @type {Element} */ (trigger));
    }
  }
};


/**
 * Triggers the hovercard to show after a delay.
 * @param {Element} anchorElement Element that is triggering the hovercard.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display
 *     hovercard.
 * @param {Object=} opt_data Data to pass to the onTrigger event.
 */
goog.ui.HoverCard.prototype.triggerForElement = function(anchorElement,
                                                         opt_pos, opt_data) {
  if (anchorElement == this.currentAnchor_) {
    // Element is already showing, just make sure it doesn't hide.
    this.clearHideTimer();
    return;
  }
  if (anchorElement == this.anchor) {
    // Hovercard is pending, no need to retrigger.
    return;
  }

  // If a previous hovercard was being triggered, cancel it.
  this.maybeCancelTrigger_();

  // Create a new event for this trigger
  var triggerEvent = new goog.ui.HoverCard.TriggerEvent(
      goog.ui.HoverCard.EventType.TRIGGER, this, anchorElement, opt_data);

  if (!this.getElements().contains(anchorElement)) {
    this.attach(anchorElement);
    this.tempAttachedAnchors_.push(anchorElement);
  }
  this.anchor = anchorElement;
  if (!this.onTrigger(triggerEvent)) {
    this.onCancelTrigger();
    return;
  }
  var pos = opt_pos || this.position_;
  this.startShowTimer(anchorElement,
      /** @type {goog.positioning.AbstractPosition} */ (pos));
};


/**
 * Sets the current anchor element at the time that the hovercard is shown.
 * @param {Element} anchor New current anchor element, or null if there is
 *     no current anchor.
 * @private
 */
goog.ui.HoverCard.prototype.setCurrentAnchor_ = function(anchor) {
  if (anchor != this.currentAnchor_) {
    this.detachTempAnchor_(this.currentAnchor_);
  }
  this.currentAnchor_ = anchor;
};


/**
 * If given anchor is in the list of temporarily attached anchors, then
 * detach and remove from the list.
 * @param {Element|undefined} anchor Anchor element that we may want to detach
 *     from.
 * @private
 */
goog.ui.HoverCard.prototype.detachTempAnchor_ = function(anchor) {
  var pos = goog.array.indexOf(this.tempAttachedAnchors_, anchor);
  if (pos != -1) {
    this.detach(anchor);
    this.tempAttachedAnchors_.splice(pos, 1);
  }
};


/**
 * Called when an element triggers the hovercard.  This will return false
 * if an event handler sets preventDefault to true, which will prevent
 * the hovercard from being shown.
 * @param {!goog.ui.HoverCard.TriggerEvent} triggerEvent Event object to use
 *     for trigger event.
 * @return {boolean} Whether hovercard should be shown or cancelled.
 * @protected
 */
goog.ui.HoverCard.prototype.onTrigger = function(triggerEvent) {
  return this.dispatchEvent(triggerEvent);
};


/**
 * Abort pending hovercard showing, if any.
 */
goog.ui.HoverCard.prototype.cancelTrigger = function() {
  this.clearShowTimer();
  this.onCancelTrigger();
};


/**
 * If hovercard is in the process of being triggered, then cancel it.
 * @private
 */
goog.ui.HoverCard.prototype.maybeCancelTrigger_ = function() {
  if (this.getState() == goog.ui.Tooltip.State.WAITING_TO_SHOW ||
      this.getState() == goog.ui.Tooltip.State.UPDATING) {
    this.cancelTrigger();
  }
};


/**
 * This method gets called when we detect that a trigger event will not lead
 * to the hovercard being shown.
 * @protected
 */
goog.ui.HoverCard.prototype.onCancelTrigger = function() {
  var event = new goog.ui.HoverCard.TriggerEvent(
      goog.ui.HoverCard.EventType.CANCEL_TRIGGER, this, this.anchor || null);
  this.dispatchEvent(event);
  this.detachTempAnchor_(this.anchor);
  delete this.anchor;
};


/**
 * Gets the DOM element that triggered the current hovercard.  Note that in
 * the TRIGGER or CANCEL_TRIGGER events, the current hovercard's anchor may not
 * be the one that caused the event, so use the event's anchor property instead.
 * @return {Element} Object that caused the currently displayed hovercard (or
 *     pending hovercard if none is displayed) to be triggered.
 */
goog.ui.HoverCard.prototype.getAnchorElement = function() {
  // this.currentAnchor_ is only set if the hovercard is showing.  If it isn't
  // showing yet, then use this.anchor as the pending anchor.
  return /** @type {Element} */ (this.currentAnchor_ || this.anchor);
};


/**
 * Make sure we detach from temp anchor when we are done displaying hovercard.
 * @protected
 * @suppress {underscore}
 * @override
 */
goog.ui.HoverCard.prototype.onHide_ = function() {
  goog.ui.HoverCard.superClass_.onHide_.call(this);
  this.setCurrentAnchor_(null);
};


/**
 * This mouse over event is only received if the anchor is already attached.
 * If it was attached manually, then it may need to be triggered.
 * @param {goog.events.BrowserEvent} event Mouse over event.
 * @override
 */
goog.ui.HoverCard.prototype.handleMouseOver = function(event) {
  // If this is a child of a triggering element, find the triggering element.
  var trigger = this.getAnchorFromElement(
      /** @type {Element} */ (event.target));

  // If we moused over an element different from the one currently being
  // triggered (if any), then trigger this new element.
  if (trigger && trigger != this.anchor) {
    this.triggerForElement(trigger);
    return;
  }

  goog.ui.HoverCard.superClass_.handleMouseOver.call(this, event);
};


/**
 * If the mouse moves out of the trigger while we're being triggered, then
 * cancel it.
 * @param {goog.events.BrowserEvent} event Mouse out or blur event.
 * @override
 */
goog.ui.HoverCard.prototype.handleMouseOutAndBlur = function(event) {
  // Get ready to see if a trigger should be cancelled.
  var anchor = this.anchor;
  var state = this.getState();
  goog.ui.HoverCard.superClass_.handleMouseOutAndBlur.call(this, event);
  if (state != this.getState() &&
      (state == goog.ui.Tooltip.State.WAITING_TO_SHOW ||
       state == goog.ui.Tooltip.State.UPDATING)) {
    // Tooltip's handleMouseOutAndBlur method sets anchor to null.  Reset
    // so that the cancel trigger event will have the right data, and so that
    // it will be properly detached.
    this.anchor = anchor;
    this.onCancelTrigger();  // This will remove and detach the anchor.
  }
};


/**
 * Called by timer from mouse over handler. If this is called and the hovercard
 * is not shown for whatever reason, then send a cancel trigger event.
 * @param {Element} el Element to show tooltip for.
 * @param {goog.positioning.AbstractPosition=} opt_pos Position to display popup
 *     at.
 * @override
 */
goog.ui.HoverCard.prototype.maybeShow = function(el, opt_pos) {
  goog.ui.HoverCard.superClass_.maybeShow.call(this, el, opt_pos);

  if (!this.isVisible()) {
    this.cancelTrigger();
  } else {
    this.setCurrentAnchor_(el);
  }
};


/**
 * Sets the max number of levels to search up the dom if checking descendants.
 * @param {number} maxSearchSteps Maximum number of levels to search up the
 *     dom if checking descendants.
 */
goog.ui.HoverCard.prototype.setMaxSearchSteps = function(maxSearchSteps) {
  if (!maxSearchSteps) {
    this.checkDescendants_ = false;
  } else if (this.checkDescendants_) {
    this.maxSearchSteps_ = maxSearchSteps;
  }
};



/**
 * Create a trigger event for specified anchor and optional data.
 * @param {goog.ui.HoverCard.EventType} type Event type.
 * @param {goog.ui.HoverCard} target Hovercard that is triggering the event.
 * @param {Element} anchor Element that triggered event.
 * @param {Object=} opt_data Optional data to be available in the TRIGGER event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.HoverCard.TriggerEvent = function(type, target, anchor, opt_data) {
  goog.events.Event.call(this, type, target);

  /**
   * Element that triggered the hovercard event.
   * @type {Element}
   */
  this.anchor = anchor;

  /**
   * Optional data to be passed to the listener.
   * @type {Object|undefined}
   */
  this.data = opt_data;
};
goog.inherits(goog.ui.HoverCard.TriggerEvent, goog.events.Event);
