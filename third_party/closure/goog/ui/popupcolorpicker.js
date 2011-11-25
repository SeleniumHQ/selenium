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
 * @fileoverview Popup Color Picker implementation.  This is intended to be
 * less general than goog.ui.ColorPicker and presents a default set of colors
 * that CCC apps currently use in their color pickers.
 *
 * @see ../demos/popupcolorpicker.html
 */

goog.provide('goog.ui.PopupColorPicker');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.ui.ColorPicker');
goog.require('goog.ui.ColorPicker.EventType');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');



/**
 * Popup color picker widget.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.ColorPicker=} opt_colorPicker Optional color picker to use
 *     for this popup.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.PopupColorPicker = function(opt_domHelper, opt_colorPicker) {
  goog.ui.Component.call(this, opt_domHelper);

  if (opt_colorPicker) {
    this.colorPicker_ = opt_colorPicker;
  }
};
goog.inherits(goog.ui.PopupColorPicker, goog.ui.Component);


/**
 * Whether the color picker is initialized.
 * @type {boolean}
 * @private
 */
goog.ui.PopupColorPicker.prototype.initialized_ = false;


/**
 * Instance of a color picker control.
 * @type {goog.ui.ColorPicker}
 * @private
 */
goog.ui.PopupColorPicker.prototype.colorPicker_ = null;


/**
 * Instance of goog.ui.Popup used to manage the behavior of the color picker.
 * @type {goog.ui.Popup}
 * @private
 */
goog.ui.PopupColorPicker.prototype.popup_ = null;


/**
 * Corner of the popup which is pinned to the attaching element.
 * @type {goog.positioning.Corner}
 * @private
 */
goog.ui.PopupColorPicker.prototype.pinnedCorner_ =
    goog.positioning.Corner.TOP_START;


/**
 * Corner of the attaching element where the popup shows.
 * @type {goog.positioning.Corner}
 * @private
 */
goog.ui.PopupColorPicker.prototype.popupCorner_ =
    goog.positioning.Corner.BOTTOM_START;


/**
 * Reference to the element that triggered the last popup.
 * @type {Element}
 * @private
 */
goog.ui.PopupColorPicker.prototype.lastTarget_ = null;


/**
 * Whether the color picker can move the focus to its key event target when it
 * is shown.  The default is true.  Setting to false can break keyboard
 * navigation, but this is needed for certain scenarios, for example the
 * toolbar menu in trogedit which can't have the selection changed.
 * @type {boolean}
 * @private
 */
goog.ui.PopupColorPicker.prototype.allowAutoFocus_ = true;


/**
 * Whether the color picker can accept focus.
 * @type {boolean}
 * @private
 */
goog.ui.PopupColorPicker.prototype.focusable_ = true;


/**
 * If true, then the colorpicker will toggle off if it is already visible.
 *
 * @type {boolean}
 * @private
 */
goog.ui.PopupColorPicker.prototype.toggleMode_ = true;


/** @override */
goog.ui.PopupColorPicker.prototype.createDom = function() {
  goog.ui.PopupColorPicker.superClass_.createDom.call(this);
  this.popup_ = new goog.ui.Popup(this.getElement());
  this.popup_.setPinnedCorner(this.pinnedCorner_);
  goog.dom.classes.set(this.getElement(),
      goog.getCssName('goog-popupcolorpicker'));
  this.getElement().unselectable = 'on';
};


/** @override */
goog.ui.PopupColorPicker.prototype.disposeInternal = function() {
  goog.ui.PopupColorPicker.superClass_.disposeInternal.call(this);
  this.colorPicker_ = null;
  this.lastTarget_ = null;
  this.initialized_ = false;
  if (this.popup_) {
    this.popup_.dispose();
    this.popup_ = null;
  }
};


/**
 * ColorPickers cannot be used to decorate pre-existing html, since the
 * structure they build is fairly complicated.
 * @param {Element} element Element to decorate.
 * @return {boolean} Returns always false.
 */
goog.ui.PopupColorPicker.prototype.canDecorate = function(element) {
  return false;
};


/**
 * @return {goog.ui.ColorPicker} The color picker instance.
 */
goog.ui.PopupColorPicker.prototype.getColorPicker = function() {
  return this.colorPicker_;
};


/**
 * Returns whether the Popup dismisses itself when the user clicks outside of
 * it.
 * @return {boolean} Whether the Popup autohides on an external click.
 */
goog.ui.PopupColorPicker.prototype.getAutoHide = function() {
  return !!this.popup_ && this.popup_.getAutoHide();
};


/**
 * Sets whether the Popup dismisses itself when the user clicks outside of it -
 * must be called after the Popup has been created (in createDom()),
 * otherwise it does nothing.
 *
 * @param {boolean} autoHide Whether to autohide on an external click.
 */
goog.ui.PopupColorPicker.prototype.setAutoHide = function(autoHide) {
  if (this.popup_) {
    this.popup_.setAutoHide(autoHide);
  }
};


/**
 * Returns the region inside which the Popup dismisses itself when the user
 * clicks, or null if it was not set. Null indicates the entire document is
 * the autohide region.
 * @return {Element} The DOM element for autohide, or null if it hasn't been
 *     set.
 */
goog.ui.PopupColorPicker.prototype.getAutoHideRegion = function() {
  return this.popup_ && this.popup_.getAutoHideRegion();
};


/**
 * Sets the region inside which the Popup dismisses itself when the user
 * clicks - must be called after the Popup has been created (in createDom()),
 * otherwise it does nothing.
 *
 * @param {Element} element The DOM element for autohide.
 */
goog.ui.PopupColorPicker.prototype.setAutoHideRegion = function(element) {
  if (this.popup_) {
    this.popup_.setAutoHideRegion(element);
  }
};


/**
 * Returns the {@link goog.ui.PopupBase} from this picker. Returns null if the
 * popup has not yet been created.
 *
 * NOTE: This should *ONLY* be called from tests. If called before createDom(),
 * this should return null.
 *
 * @return {goog.ui.PopupBase?} The popup or null if it hasn't been created.
 */
goog.ui.PopupColorPicker.prototype.getPopup = function() {
  return this.popup_;
};


/**
 * @return {Element} The last element that triggered the popup.
 */
goog.ui.PopupColorPicker.prototype.getLastTarget = function() {
  return this.lastTarget_;
};


/**
 * Attaches the popup color picker to an element.
 * @param {Element} element The element to attach to.
 */
goog.ui.PopupColorPicker.prototype.attach = function(element) {
  this.getHandler().listen(element, goog.events.EventType.MOUSEDOWN,
      this.show_);
};


/**
 * Detatches the popup color picker from an element.
 * @param {Element} element The element to detach from.
 */
goog.ui.PopupColorPicker.prototype.detach = function(element) {
  this.getHandler().unlisten(element, goog.events.EventType.MOUSEDOWN,
      this.show_);
};


/**
 * Gets the color that is currently selected in this color picker.
 * @return {?string} The hex string of the color selected, or null if no
 *     color is selected.
 */
goog.ui.PopupColorPicker.prototype.getSelectedColor = function() {
  return this.colorPicker_.getSelectedColor();
};


/**
 * Sets whether the color picker can accept focus.
 * @param {boolean} focusable True iff the color picker can accept focus.
 */
goog.ui.PopupColorPicker.prototype.setFocusable = function(focusable) {
  this.focusable_ = focusable;
  if (this.colorPicker_) {
    // TODO(user): In next revision sort the behavior of passing state to
    // children correctly
    this.colorPicker_.setFocusable(focusable);
  }
};


/**
 * Sets whether the color picker can automatically move focus to its key event
 * target when it is set to visible.
 * @param {boolean} allow Whether to allow auto focus.
 */
goog.ui.PopupColorPicker.prototype.setAllowAutoFocus = function(allow) {
  this.allowAutoFocus_ = allow;
};


/**
 * @return {boolean} Whether the color picker can automatically move focus to
 *     its key event target when it is set to visible.
 */
goog.ui.PopupColorPicker.prototype.getAllowAutoFocus = function() {
  return this.allowAutoFocus_;
};


/**
 * Sets whether the color picker should toggle off if it is already open.
 * @param {boolean} toggle The new toggle mode.
 */
goog.ui.PopupColorPicker.prototype.setToggleMode = function(toggle) {
  this.toggleMode_ = toggle;
};


/**
 * Gets whether the colorpicker is in toggle mode
 * @return {boolean} toggle.
 */
goog.ui.PopupColorPicker.prototype.getToggleMode = function() {
  return this.toggleMode_;
};


/**
 * Sets whether the picker remembers the last selected color between popups.
 *
 * @param {boolean} remember Whether to remember the selection.
 */
goog.ui.PopupColorPicker.prototype.setRememberSelection = function(remember) {
  this.rememberSelection_ = remember;
};


/**
 * @return {boolean} Whether the picker remembers the last selected color
 *     between popups.
 */
goog.ui.PopupColorPicker.prototype.getRememberSelection = function() {
  return this.rememberSelection_;
};


/**
 * Add an array of colors to the colors displayed by the color picker.
 * Does not add duplicated colors.
 * @param {Array.<string>} colors The array of colors to be added.
 */
goog.ui.PopupColorPicker.prototype.addColors = function(colors) {

};


/**
 * Clear the colors displayed by the color picker.
 */
goog.ui.PopupColorPicker.prototype.clearColors = function() {

};


/**
 * Set the pinned corner of the popup.
 * @param {goog.positioning.Corner} corner The corner of the popup which is
 *     pinned to the attaching element.
 */
goog.ui.PopupColorPicker.prototype.setPinnedCorner = function(corner) {
  this.pinnedCorner_ = corner;
  if (this.popup_) {
    this.popup_.setPinnedCorner(this.pinnedCorner_);
  }
};


/**
 * Sets which corner of the attaching element this popup shows up.
 * @param {goog.positioning.Corner} corner The corner of the attaching element
 *     where to show the popup.
 */
goog.ui.PopupColorPicker.prototype.setPopupCorner = function(corner) {
  this.popupCorner_ = corner;
};


/**
 * Handles click events on the targets and shows the color picker.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.PopupColorPicker.prototype.show_ = function(e) {
  if (!this.initialized_) {
    this.colorPicker_ = this.colorPicker_ ||
        goog.ui.ColorPicker.createSimpleColorGrid(this.getDomHelper());
    this.colorPicker_.setFocusable(this.focusable_);
    this.addChild(this.colorPicker_, true);
    this.getHandler().listen(this.colorPicker_,
        goog.ui.ColorPicker.EventType.CHANGE, this.onColorPicked_);
    this.initialized_ = true;
  }

  if (this.popup_.isOrWasRecentlyVisible() && this.toggleMode_ &&
      this.lastTarget_ == e.currentTarget) {
    this.popup_.setVisible(false);
    return;
  }

  this.lastTarget_ = /** @type {Element} */ (e.currentTarget);
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(
      this.lastTarget_, this.popupCorner_));
  if (!this.rememberSelection_) {
    this.colorPicker_.setSelectedIndex(-1);
  }
  this.popup_.setVisible(true);
  if (this.allowAutoFocus_) {
    this.colorPicker_.focus();
  }
};


/**
 * Handles the color change event.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.ui.PopupColorPicker.prototype.onColorPicked_ = function(e) {
  // When we show the color picker we reset the color, which triggers an event.
  // Here we block that event so that it doesn't dismiss the popup
  // TODO(user): Update the colorpicker to allow selection to be cleared
  if (this.colorPicker_.getSelectedIndex() == -1) {
    e.stopPropagation();
    return;
  }
  this.popup_.setVisible(false);
  if (this.allowAutoFocus_) {
    this.lastTarget_.focus();
  }
};
