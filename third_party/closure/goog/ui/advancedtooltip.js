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
 * @fileoverview Advanced tooltip widget implementation.
 *
 * @see ../demos/advancedtooltip.html
 */

goog.provide('goog.ui.AdvancedTooltip');

goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.ui.Tooltip');
goog.require('goog.userAgent');



/**
 * Advanced tooltip widget with cursor tracking abilities. Works like a regular
 * tooltip but can track the cursor position and direction to determine if the
 * tooltip should be dismissed or remain open.
 *
 * @param {Element|string=} opt_el Element to display tooltip for, either
 *     element reference or string id.
 * @param {?string=} opt_str Text message to display in tooltip.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Tooltip}
 */
goog.ui.AdvancedTooltip = function(opt_el, opt_str, opt_domHelper) {
  goog.ui.Tooltip.call(this, opt_el, opt_str, opt_domHelper);
};
goog.inherits(goog.ui.AdvancedTooltip, goog.ui.Tooltip);


/**
 * Whether to track the cursor and thereby close the tooltip if it moves away
 * from the tooltip and keep it open if it moves towards it.
 *
 * @type {boolean}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.cursorTracking_ = false;


/**
 * Delay in milliseconds before tooltips are hidden if cursor tracking is
 * enabled and the cursor is moving away from the tooltip.
 *
 * @type {number}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.cursorTrackingHideDelayMs_ = 100;


/**
 * Box object representing a margin around the tooltip where the cursor is
 * allowed without dismissing the tooltip.
 *
 * @type {goog.math.Box}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.hotSpotPadding_;


/**
 * Bounding box.
 *
 * @type {goog.math.Box}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.boundingBox_;


/**
 * Bounding box including padding. If the cursor moves outside of it the tooltip
 * is closed.
 * Only used if a cursor padding has been specified.
 *
 * @type {goog.math.Box}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.paddingBox_;


/**
 * Anchor bounding box.
 *
 * @type {goog.math.Box}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.anchorBox_;


/**
 * Whether the cursor tracking is active.
 *
 * @type {boolean}
 * @private
 */
goog.ui.AdvancedTooltip.prototype.tracking_ = false;


/**
 * Sets margin around the tooltip where the cursor is allowed without dismissing
 * the tooltip.
 *
 * @param {goog.math.Box=} opt_box The margin around the tooltip.
 */
goog.ui.AdvancedTooltip.prototype.setHotSpotPadding = function(opt_box) {
  this.hotSpotPadding_ = opt_box || null;
};


/**
 * @return {goog.math.Box} box The margin around the tooltip where the cursor is
 *     allowed without dismissing the tooltip.
 */
goog.ui.AdvancedTooltip.prototype.getHotSpotPadding = function() {
  return this.hotSpotPadding_;
};


/**
 * Sets whether to track the cursor and thereby close the tooltip if it moves
 * away from the tooltip and keep it open if it moves towards it.
 *
 * @param {boolean} b Whether to track the cursor.
 */
goog.ui.AdvancedTooltip.prototype.setCursorTracking = function(b) {
  this.cursorTracking_ = b;
};


/**
 * @return {boolean} Whether to track the cursor and thereby close the tooltip
 *     if it moves away from the tooltip and keep it open if it moves towards
 *     it.
 */
goog.ui.AdvancedTooltip.prototype.getCursorTracking = function() {
  return this.cursorTracking_;
};


/**
 * Sets delay in milliseconds before tooltips are hidden if cursor tracking is
 * enabled and the cursor is moving away from the tooltip.
 *
 * @param {number} delay The delay in milliseconds.
 */
goog.ui.AdvancedTooltip.prototype.setCursorTrackingHideDelayMs =
    function(delay) {
  this.cursorTrackingHideDelayMs_ = delay;
};


/**
 * @return {number} The delay in milliseconds before tooltips are hidden if
 *     cursor tracking is enabled and the cursor is moving away from the
 *     tooltip.
 */
goog.ui.AdvancedTooltip.prototype.getCursorTrackingHideDelayMs = function() {
  return this.cursorTrackingHideDelayMs_;
};


/**
 * Called after the popup is shown.
 * @protected
 * @suppress {underscore}
 * @override
 */
goog.ui.AdvancedTooltip.prototype.onShow_ = function() {
  goog.ui.AdvancedTooltip.superClass_.onShow_.call(this);

  this.boundingBox_ = goog.style.getBounds(this.getElement()).toBox();
  if (this.anchor) {
    this.anchorBox_ = goog.style.getBounds(this.anchor).toBox();
  }

  this.tracking_ = this.cursorTracking_;
  goog.events.listen(this.getDomHelper().getDocument(),
                     goog.events.EventType.MOUSEMOVE,
                     this.handleMouseMove, false, this);
};


/**
 * Called after the popup is hidden.
 * @protected
 * @suppress {underscore}
 * @override
 */
goog.ui.AdvancedTooltip.prototype.onHide_ = function() {
  goog.events.unlisten(this.getDomHelper().getDocument(),
                       goog.events.EventType.MOUSEMOVE,
                       this.handleMouseMove, false, this);

  this.paddingBox_ = null;
  this.boundingBox_ = null;
  this.anchorBox_ = null;
  this.tracking_ = false;

  goog.ui.AdvancedTooltip.superClass_.onHide_.call(this);
};


/**
 * Returns true if the mouse is in the tooltip.
 * @return {boolean} True if the mouse is in the tooltip.
 */
goog.ui.AdvancedTooltip.prototype.isMouseInTooltip = function() {
  return this.isCoordinateInTooltip(this.cursorPosition);
};


/**
 * Checks whether the supplied coordinate is inside the tooltip, including
 * padding if any.
 * @param {goog.math.Coordinate} coord Coordinate being tested.
 * @return {boolean} Whether the coord is in the tooltip.
 */
goog.ui.AdvancedTooltip.prototype.isCoordinateInTooltip = function(coord) {
  // Check if coord is inside the bounding box of the tooltip
  if (this.paddingBox_) {
    return this.paddingBox_.contains(coord);
  }

  return goog.ui.AdvancedTooltip.superClass_.isCoordinateInTooltip.call(this,
                                                                        coord);
};


/**
 * Checks if supplied coordinate is in the tooltip, its triggering anchor, or
 * a tooltip that has been triggered by a child of this tooltip.
 * Called from handleMouseMove to determine if hide timer should be started,
 * and from maybeHide to determine if tooltip should be hidden.
 * @param {goog.math.Coordinate} coord Coordinate being tested.
 * @return {boolean} Whether coordinate is in the anchor, the tooltip, or any
 *     tooltip whose anchor is a child of this tooltip.
 * @private
 */
goog.ui.AdvancedTooltip.prototype.isCoordinateActive_ = function(coord) {
  if ((this.anchorBox_ && this.anchorBox_.contains(coord)) ||
      this.isCoordinateInTooltip(coord)) {
    return true;
  }

  // Check if mouse might be in active child element.
  var childTooltip = this.getChildTooltip();
  return !!childTooltip && childTooltip.isCoordinateInTooltip(coord);
};


/**
 * Called by timer from mouse out handler. Hides tooltip if cursor is still
 * outside element and tooltip.
 * @param {Element} el Anchor when hide timer was started.
 */
goog.ui.AdvancedTooltip.prototype.maybeHide = function(el) {
  this.hideTimer = undefined;
  if (el == this.anchor) {
    // Check if cursor is inside the bounding box of the tooltip or the element
    // that triggered it, or if tooltip is active (possibly due to receiving
    // the focus), or if there is a nested tooltip being shown.
    if (!this.isCoordinateActive_(this.cursorPosition) &&
        !this.getActiveElement() &&
        !this.hasActiveChild()) {
      // Under certain circumstances gecko fires ghost mouse events with the
      // coordinates 0, 0 regardless of the cursors position.
      if (goog.userAgent.GECKO && this.cursorPosition.x == 0 &&
          this.cursorPosition.y == 0) {
        return;
      }
      this.setVisible(false);
    }
  }
};


/**
 * Handler for mouse move events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.AdvancedTooltip.prototype.handleMouseMove = function(event) {
  var startTimer = this.isVisible();
  if (this.boundingBox_) {
    var scroll = this.getDomHelper().getDocumentScroll();
    var c = new goog.math.Coordinate(event.clientX + scroll.x,
        event.clientY + scroll.y);
    if (this.isCoordinateActive_(c)) {
      startTimer = false;
    } else if (this.tracking_) {
      var prevDist = goog.math.Box.distance(this.boundingBox_,
          this.cursorPosition);
      var currDist = goog.math.Box.distance(this.boundingBox_, c);
      startTimer = currDist >= prevDist;
    }
  }

  if (startTimer) {
    this.startHideTimer_();

    // Even though the mouse coordinate is not on the tooltip (or nested child),
    // they may have an active element because of a focus event.  Don't let
    // that prevent us from taking down the tooltip(s) on this mouse move.
    this.setActiveElement(null);
    var childTooltip = this.getChildTooltip();
    if (childTooltip) {
      childTooltip.setActiveElement(null);
    }
  } else if (this.getState() == goog.ui.Tooltip.State.WAITING_TO_HIDE) {
    this.clearHideTimer();
  }

  goog.ui.AdvancedTooltip.superClass_.handleMouseMove.call(this, event);
};


/**
 * Handler for mouse over events for the tooltip element.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @protected
 */
goog.ui.AdvancedTooltip.prototype.handleTooltipMouseOver = function(event) {
  if (this.getActiveElement() != this.getElement()) {
    this.tracking_ = false;
    this.setActiveElement(this.getElement());

    if (!this.paddingBox_ && this.hotSpotPadding_) {
      this.paddingBox_ = this.boundingBox_.clone().expand(this.hotSpotPadding_);
    }
  }
};


/**
 * Override hide delay with cursor tracking hide delay while tracking.
 * @return {number} Hide delay to use.
 */
goog.ui.AdvancedTooltip.prototype.getHideDelayMs = function() {
  return this.tracking_ ? this.cursorTrackingHideDelayMs_ :
      goog.base(this, 'getHideDelayMs');
};


/**
 * Forces the recalculation of the hotspot on the next mouse over event.
 */
goog.ui.AdvancedTooltip.prototype.resetHotSpot = function() {
  this.paddingBox_ = null;
};
