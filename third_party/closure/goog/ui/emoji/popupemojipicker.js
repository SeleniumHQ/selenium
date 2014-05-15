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
 * @fileoverview Popup Emoji Picker implementation. This provides a UI widget
 * for choosing an emoji from a grid of possible choices. The widget is a popup,
 * so it is suitable for a toolbar, for instance the TrogEdit toolbar.
 *
 * @see ../demos/popupemojipicker.html for an example of how to instantiate
 * an emoji picker.
 *
 * See goog.ui.emoji.EmojiPicker in emojipicker.js for more details.
 *
 * Based on goog.ui.PopupColorPicker (popupcolorpicker.js).
 *
 * @see ../../demos/popupemojipicker.html
 */

goog.provide('goog.ui.emoji.PopupEmojiPicker');

goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');
goog.require('goog.ui.emoji.EmojiPicker');



/**
 * Constructs a popup emoji picker widget.
 *
 * @param {string} defaultImgUrl Url of the img that should be used to fill up
 *     the cells in the emoji table, to prevent jittering. Should be the same
 *     size as the emoji.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.emoji.PopupEmojiPicker =
    function(defaultImgUrl, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  this.emojiPicker_ = new goog.ui.emoji.EmojiPicker(defaultImgUrl,
                                                    opt_domHelper);
  this.addChild(this.emojiPicker_);

  this.getHandler().listen(this.emojiPicker_,
      goog.ui.Component.EventType.ACTION, this.onEmojiPicked_);
};
goog.inherits(goog.ui.emoji.PopupEmojiPicker, goog.ui.Component);


/**
 * Instance of an emoji picker control.
 * @type {goog.ui.emoji.EmojiPicker}
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.emojiPicker_ = null;


/**
 * Instance of goog.ui.Popup used to manage the behavior of the emoji picker.
 * @type {goog.ui.Popup}
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.popup_ = null;


/**
 * Reference to the element that triggered the last popup.
 * @type {Element}
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.lastTarget_ = null;


/**
 * Whether the emoji picker can accept focus.
 * @type {boolean}
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.focusable_ = true;


/**
 * If true, then the emojipicker will toggle off if it is already visible.
 * Default is true.
 * @type {boolean}
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.toggleMode_ = true;


/**
 * Adds a group of emoji to the picker.
 *
 * @param {string|Element} title Title for the group.
 * @param {Array.<Array>} emojiGroup A new group of emoji to be added. Each
 *    internal array contains [emojiUrl, emojiId].
 */
goog.ui.emoji.PopupEmojiPicker.prototype.addEmojiGroup =
    function(title, emojiGroup) {
  this.emojiPicker_.addEmojiGroup(title, emojiGroup);
};


/**
 * Sets whether the emoji picker should toggle if it is already open.
 * @param {boolean} toggle The toggle mode to use.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setToggleMode = function(toggle) {
  this.toggleMode_ = toggle;
};


/**
 * Gets whether the emojipicker is in toggle mode
 * @return {boolean} toggle.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getToggleMode = function() {
  return this.toggleMode_;
};


/**
 * Sets whether loading of images should be delayed until after dom creation.
 * Thus, this function must be called before {@link #createDom}. If set to true,
 * the client must call {@link #loadImages} when they wish the images to be
 * loaded.
 *
 * @param {boolean} shouldDelay Whether to delay loading the images.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setDelayedLoad =
    function(shouldDelay) {
  if (this.emojiPicker_) {
    this.emojiPicker_.setDelayedLoad(shouldDelay);
  }
};


/**
 * Sets whether the emoji picker can accept focus.
 * @param {boolean} focusable Whether the emoji picker should accept focus.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setFocusable = function(focusable) {
  this.focusable_ = focusable;
  if (this.emojiPicker_) {
    // TODO(user): In next revision sort the behavior of passing state to
    // children correctly
    this.emojiPicker_.setFocusable(focusable);
  }
};


/**
 * Sets the URL prefix for the emoji URLs.
 *
 * @param {string} urlPrefix Prefix that should be prepended to all URLs.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setUrlPrefix = function(urlPrefix) {
  this.emojiPicker_.setUrlPrefix(urlPrefix);
};


/**
 * Sets the location of the tabs in relation to the emoji grids. This should
 * only be called before the picker has been rendered.
 *
 * @param {goog.ui.TabPane.TabLocation} tabLocation The location of the tabs.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setTabLocation =
    function(tabLocation) {
  this.emojiPicker_.setTabLocation(tabLocation);
};


/**
 * Sets the number of rows per grid in the emoji picker. This should only be
 * called before the picker has been rendered.
 *
 * @param {number} numRows Number of rows per grid.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setNumRows = function(numRows) {
  this.emojiPicker_.setNumRows(numRows);
};


/**
 * Sets the number of columns per grid in the emoji picker. This should only be
 * called before the picker has been rendered.
 *
 * @param {number} numCols Number of columns per grid.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setNumColumns = function(numCols) {
  this.emojiPicker_.setNumColumns(numCols);
};


/**
 * Sets the progressive rendering aspect of this emojipicker. Must be called
 * before createDom to have an effect.
 *
 * @param {boolean} progressive Whether the picker should render progressively.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setProgressiveRender =
    function(progressive) {
  if (this.emojiPicker_) {
    this.emojiPicker_.setProgressiveRender(progressive);
  }
};


/**
 * Returns the number of emoji groups in this picker.
 *
 * @return {number} The number of emoji groups in this picker.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getNumEmojiGroups = function() {
  return this.emojiPicker_.getNumEmojiGroups();
};


/**
 * Causes the emoji imgs to be loaded into the picker. Used for delayed loading.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.loadImages = function() {
  if (this.emojiPicker_) {
    this.emojiPicker_.loadImages();
  }
};


/** @override */
goog.ui.emoji.PopupEmojiPicker.prototype.createDom = function() {
  goog.ui.emoji.PopupEmojiPicker.superClass_.createDom.call(this);

  this.emojiPicker_.createDom();

  this.getElement().className = goog.getCssName('goog-ui-popupemojipicker');
  this.getElement().appendChild(this.emojiPicker_.getElement());

  this.popup_ = new goog.ui.Popup(this.getElement());
  this.getElement().unselectable = 'on';
};


/** @override */
goog.ui.emoji.PopupEmojiPicker.prototype.disposeInternal = function() {
  goog.ui.emoji.PopupEmojiPicker.superClass_.disposeInternal.call(this);
  this.emojiPicker_ = null;
  this.lastTarget_ = null;
  if (this.popup_) {
    this.popup_.dispose();
    this.popup_ = null;
  }
};


/**
 * Attaches the popup emoji picker to an element.
 *
 * @param {Element} element The element to attach to.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.attach = function(element) {
  // TODO(user): standardize event type, popups should use MOUSEDOWN, but
  // currently apps are using click.
  this.getHandler().listen(element, goog.events.EventType.CLICK, this.show_);
};


/**
 * Detatches the popup emoji picker from an element.
 *
 * @param {Element} element The element to detach from.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.detach = function(element) {
  this.getHandler().unlisten(element, goog.events.EventType.CLICK, this.show_);
};


/**
 * @return {goog.ui.emoji.EmojiPicker} The emoji picker instance.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getEmojiPicker = function() {
  return this.emojiPicker_;
};


/**
 * Returns whether the Popup dismisses itself when the user clicks outside of
 * it.
 * @return {boolean} Whether the Popup autohides on an external click.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getAutoHide = function() {
  return !!this.popup_ && this.popup_.getAutoHide();
};


/**
 * Sets whether the Popup dismisses itself when the user clicks outside of it -
 * must be called after the Popup has been created (in createDom()),
 * otherwise it does nothing.
 *
 * @param {boolean} autoHide Whether to autohide on an external click.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setAutoHide = function(autoHide) {
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
goog.ui.emoji.PopupEmojiPicker.prototype.getAutoHideRegion = function() {
  return this.popup_ && this.popup_.getAutoHideRegion();
};


/**
 * Sets the region inside which the Popup dismisses itself when the user
 * clicks - must be called after the Popup has been created (in createDom()),
 * otherwise it does nothing.
 *
 * @param {Element} element The DOM element for autohide.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.setAutoHideRegion = function(element) {
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
 * @return {goog.ui.PopupBase?} The popup, or null if it hasn't been created.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getPopup = function() {
  return this.popup_;
};


/**
 * @return {Element} The last element that triggered the popup.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getLastTarget = function() {
  return this.lastTarget_;
};


/**
 * @return {goog.ui.emoji.Emoji} The currently selected emoji.
 */
goog.ui.emoji.PopupEmojiPicker.prototype.getSelectedEmoji = function() {
  return this.emojiPicker_.getSelectedEmoji();
};


/**
 * Handles click events on the element this picker is attached to and shows the
 * emoji picker in a popup.
 *
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.show_ = function(e) {
  if (this.popup_.isOrWasRecentlyVisible() && this.toggleMode_ &&
      this.lastTarget_ == e.currentTarget) {
    this.popup_.setVisible(false);
    return;
  }

  this.lastTarget_ = /** @type {Element} */ (e.currentTarget);
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(
      this.lastTarget_, goog.positioning.Corner.BOTTOM_LEFT));
  this.popup_.setVisible(true);
};


/**
 * Handles selection of an emoji.
 *
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.ui.emoji.PopupEmojiPicker.prototype.onEmojiPicked_ = function(e) {
  this.popup_.setVisible(false);
};
