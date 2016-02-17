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
 * @fileoverview Scroll behavior that can be added onto a container.
 * @author gboyer@google.com (Garry Boyer)
 */

goog.provide('goog.ui.ContainerScroller');

goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.events.EventHandler');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Container');



/**
 * Plug-on scrolling behavior for a container.
 *
 * Use this to style containers, such as pop-up menus, to be scrolling, and
 * automatically keep the highlighted element visible.
 *
 * To use this, first style your container with the desired overflow
 * properties and height to achieve vertical scrolling.  Also, the scrolling
 * div should have no vertical padding, for two reasons: it is difficult to
 * compensate for, and is generally not what you want due to the strange way
 * CSS handles padding on the scrolling dimension.
 *
 * The container must already be rendered before this may be constructed.
 *
 * @param {!goog.ui.Container} container The container to attach behavior to.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.ui.ContainerScroller = function(container) {
  goog.Disposable.call(this);

  /**
   * The container that we are bestowing scroll behavior on.
   * @type {!goog.ui.Container}
   * @private
   */
  this.container_ = container;

  /**
   * Event handler for this object.
   * @type {!goog.events.EventHandler<!goog.ui.ContainerScroller>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  this.eventHandler_.listen(
      container, goog.ui.Component.EventType.HIGHLIGHT, this.onHighlight_);
  this.eventHandler_.listen(
      container, goog.ui.Component.EventType.ENTER, this.onEnter_);
  this.eventHandler_.listen(
      container, goog.ui.Container.EventType.AFTER_SHOW, this.onAfterShow_);
  this.eventHandler_.listen(
      container, goog.ui.Component.EventType.HIDE, this.onHide_);

  // TODO(gboyer): Allow a ContainerScroller to be attached with a Container
  // before the container is rendered.

  this.doScrolling_(true);
};
goog.inherits(goog.ui.ContainerScroller, goog.Disposable);


/**
 * The last target the user hovered over.
 *
 * @see #onEnter_
 * @type {goog.ui.Component}
 * @private
 */
goog.ui.ContainerScroller.prototype.lastEnterTarget_ = null;


/**
 * The scrollTop of the container before it was hidden.
 * Used to restore the scroll position when the container is shown again.
 * @type {?number}
 * @private
 */
goog.ui.ContainerScroller.prototype.scrollTopBeforeHide_ = null;


/**
 * Whether we are disabling the default handler for hovering.
 *
 * @see #onEnter_
 * @see #temporarilyDisableHover_
 * @type {boolean}
 * @private
 */
goog.ui.ContainerScroller.prototype.disableHover_ = false;


/**
 * Handles hover events on the container's children.
 *
 * Helps enforce two constraints: scrolling should not cause mouse highlights,
 * and mouse highlights should not cause scrolling.
 *
 * @param {goog.events.Event} e The container's ENTER event.
 * @private
 */
goog.ui.ContainerScroller.prototype.onEnter_ = function(e) {
  if (this.disableHover_) {
    // The container was scrolled recently.  Since the mouse may be over the
    // container, stop the default action of the ENTER event from causing
    // highlights.
    e.preventDefault();
  } else {
    // The mouse is moving and causing hover events.  Stop the resulting
    // highlight (if it happens) from causing a scroll.
    this.lastEnterTarget_ = /** @type {goog.ui.Component} */ (e.target);
  }
};


/**
 * Handles highlight events on the container's children.
 * @param {goog.events.Event} e The container's highlight event.
 * @private
 */
goog.ui.ContainerScroller.prototype.onHighlight_ = function(e) {
  this.doScrolling_();
};


/**
 * Handles AFTER_SHOW events on the container. Makes the container
 * scroll to the previously scrolled position (if there was one),
 * then adjust it to make the highlighted element be in view (if there is one).
 * If there was no previous scroll position, then center the highlighted
 * element (if there is one).
 * @param {goog.events.Event} e The container's AFTER_SHOW event.
 * @private
 */
goog.ui.ContainerScroller.prototype.onAfterShow_ = function(e) {
  if (this.scrollTopBeforeHide_ != null) {
    this.container_.getElement().scrollTop = this.scrollTopBeforeHide_;
    // Make sure the highlighted item is still visible, in case the list
    // or its hilighted item has changed.
    this.doScrolling_(false);
  } else {
    this.doScrolling_(true);
  }
};


/**
 * Handles hide events on the container. Clears out the last enter target,
 * since it is no longer applicable, and remembers the scroll position of
 * the menu so that it can be restored when the menu is reopened.
 * @param {goog.events.Event} e The container's hide event.
 * @private
 */
goog.ui.ContainerScroller.prototype.onHide_ = function(e) {
  if (e.target == this.container_) {
    this.lastEnterTarget_ = null;
    this.scrollTopBeforeHide_ = this.container_.getElement().scrollTop;
  }
};


/**
 * Centers the currently highlighted item, if this is scrollable.
 * @param {boolean=} opt_center Whether to center the highlighted element
 *     rather than simply ensure it is in view.  Useful for the first
 *     render.
 * @private
 */
goog.ui.ContainerScroller.prototype.doScrolling_ = function(opt_center) {
  var highlighted = this.container_.getHighlighted();

  // Only scroll if we're visible and there is a highlighted item.
  if (this.container_.isVisible() && highlighted &&
      highlighted != this.lastEnterTarget_) {
    var element = this.container_.getElement();
    goog.style.scrollIntoContainerView(
        highlighted.getElement(), element, opt_center);
    this.temporarilyDisableHover_();
    this.lastEnterTarget_ = null;
  }
};


/**
 * Temporarily disables hover events from changing highlight.
 * @see #onEnter_
 * @private
 */
goog.ui.ContainerScroller.prototype.temporarilyDisableHover_ = function() {
  this.disableHover_ = true;
  goog.Timer.callOnce(function() { this.disableHover_ = false; }, 0, this);
};


/** @override */
goog.ui.ContainerScroller.prototype.disposeInternal = function() {
  goog.ui.ContainerScroller.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.lastEnterTarget_ = null;
};
