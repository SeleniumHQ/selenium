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
 * @fileoverview Definition of the Popup class.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/popup.html
 */

goog.provide('goog.ui.Popup');

goog.require('goog.math.Box');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.ui.PopupBase');



/**
 * The Popup class provides functionality for displaying an absolutely
 * positioned element at a particular location in the window. It's designed to
 * be used as the foundation for building controls like a menu or tooltip. The
 * Popup class includes functionality for displaying a Popup near adjacent to
 * an anchor element.
 *
 * This works cross browser and thus does not use IE's createPopup feature
 * which supports extending outside the edge of the brower window.
 *
 * @param {Element=} opt_element A DOM element for the popup.
 * @param {goog.positioning.AbstractPosition=} opt_position A positioning helper
 *     object.
 * @constructor
 * @extends {goog.ui.PopupBase}
 */
goog.ui.Popup = function(opt_element, opt_position) {
  /**
   * Corner of the popup to used in the positioning algorithm.
   *
   * @type {goog.positioning.Corner}
   * @private
   */
  this.popupCorner_ = goog.positioning.Corner.TOP_START;

  /**
   * Positioning helper object.
   *
   * @type {goog.positioning.AbstractPosition|undefined}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.position_ = opt_position || undefined;
  goog.ui.PopupBase.call(this, opt_element);
};
goog.inherits(goog.ui.Popup, goog.ui.PopupBase);
goog.tagUnsealableClass(goog.ui.Popup);


/**
 * Margin for the popup used in positioning algorithms.
 *
 * @type {goog.math.Box|undefined}
 * @private
 */
goog.ui.Popup.prototype.margin_;


/**
 * Returns the corner of the popup to used in the positioning algorithm.
 *
 * @return {goog.positioning.Corner} The popup corner used for positioning.
 */
goog.ui.Popup.prototype.getPinnedCorner = function() {
  return this.popupCorner_;
};


/**
 * Sets the corner of the popup to used in the positioning algorithm.
 *
 * @param {goog.positioning.Corner} corner The popup corner used for
 *     positioning.
 */
goog.ui.Popup.prototype.setPinnedCorner = function(corner) {
  this.popupCorner_ = corner;
  if (this.isVisible()) {
    this.reposition();
  }
};


/**
 * @return {goog.positioning.AbstractPosition} The position helper object
 *     associated with the popup.
 */
goog.ui.Popup.prototype.getPosition = function() {
  return this.position_ || null;
};


/**
 * Sets the position helper object associated with the popup.
 *
 * @param {goog.positioning.AbstractPosition} position A position helper object.
 */
goog.ui.Popup.prototype.setPosition = function(position) {
  this.position_ = position || undefined;
  if (this.isVisible()) {
    this.reposition();
  }
};


/**
 * Returns the margin to place around the popup.
 *
 * @return {goog.math.Box?} The margin.
 */
goog.ui.Popup.prototype.getMargin = function() {
  return this.margin_ || null;
};


/**
 * Sets the margin to place around the popup.
 *
 * @param {goog.math.Box|number|null} arg1 Top value or Box.
 * @param {number=} opt_arg2 Right value.
 * @param {number=} opt_arg3 Bottom value.
 * @param {number=} opt_arg4 Left value.
 */
goog.ui.Popup.prototype.setMargin = function(arg1, opt_arg2, opt_arg3,
                                             opt_arg4) {
  if (arg1 == null || arg1 instanceof goog.math.Box) {
    this.margin_ = arg1;
  } else {
    this.margin_ = new goog.math.Box(arg1,
        /** @type {number} */ (opt_arg2),
        /** @type {number} */ (opt_arg3),
        /** @type {number} */ (opt_arg4));
  }
  if (this.isVisible()) {
    this.reposition();
  }
};


/**
 * Repositions the popup according to the current state.
 * @override
 */
goog.ui.Popup.prototype.reposition = function() {
  if (!this.position_) {
    return;
  }

  var hideForPositioning = !this.isVisible() &&
      this.getType() != goog.ui.PopupBase.Type.MOVE_OFFSCREEN;
  var el = this.getElement();
  if (hideForPositioning) {
    el.style.visibility = 'hidden';
    goog.style.setElementShown(el, true);
  }

  this.position_.reposition(el, this.popupCorner_, this.margin_);

  if (hideForPositioning) {
    // NOTE(eae): The visibility property is reset to 'visible' by the show_
    // method in PopupBase. Resetting it here causes flickering in some
    // situations, even if set to visible after the display property has been
    // set to none by the call below.
    goog.style.setElementShown(el, false);
  }
};
