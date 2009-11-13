// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Tab bar UI component.
 *
 * @see ../demos/tabbar.html
 */

goog.provide('goog.ui.TabBar');
goog.provide('goog.ui.TabBar.Location');

goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Container');
goog.require('goog.ui.Container.Orientation');
// We need to include following dependency because of the magic with
// goog.ui.registry.setDecoratorByClassName
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBarRenderer');
goog.require('goog.ui.registry');



/**
 * Tab bar UI component.  A tab bar contains tabs, rendered above, below,
 * before, or after tab contents.  Tabs in tab bars dispatch the following
 * events:
 * <ul>
 *   <li>{@link goog.ui.Component.EventType.ACTION} when activated via the
 *       keyboard or the mouse,
 *   <li>{@link goog.ui.Component.EventType.SELECT} when selected, and
 *   <li>{@link goog.ui.Component.EventType.UNSELECT} when deselected.
 * </ul>
 * Clients may listen for all of the above events on the tab bar itself, and
 * refer to the event target to identify the tab that dispatched the event.
 * When an unselected tab is clicked for the first time, it dispatches both a
 * {@code SELECT} event and an {@code ACTION} event; subsequent clicks on an
 * already selected tab only result in {@code ACTION} events.
 *
 * @param {goog.ui.TabBar.Location} opt_location Tab bar location; defaults to
 *     {@link goog.ui.TabBar.Location.TOP}.
 * @param {goog.ui.TabBarRenderer} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.TabBarRenderer}.
 * @param {goog.dom.DomHelper} opt_domHelper DOM helper, used for document
 *     interaction.
 * @constructor
 * @extends {goog.ui.Container}
 */
goog.ui.TabBar = function(opt_location, opt_renderer, opt_domHelper) {
  this.setLocation(opt_location || goog.ui.TabBar.Location.TOP);

  goog.ui.Container.call(this, this.getOrientation(),
      opt_renderer || goog.ui.TabBarRenderer.getInstance(),
      opt_domHelper);

  // Listen for SELECT, UNSELECT, DISABLE, and HIDE events dispatched by tabs.
  var handler = this.getHandler();
  handler.listen(this, goog.ui.Component.EventType.SELECT,
      this.handleTabSelect);
  handler.listen(this, goog.ui.Component.EventType.UNSELECT,
      this.handleTabUnselect);
  handler.listen(this, goog.ui.Component.EventType.DISABLE,
      this.handleTabDisable);
  handler.listen(this, goog.ui.Component.EventType.HIDE,
      this.handleTabHide);
};
goog.inherits(goog.ui.TabBar, goog.ui.Container);


/**
 * Tab bar location relative to tab contents.
 * @enum {string}
 */
goog.ui.TabBar.Location = {
  // Above tab contents.
  TOP: 'top',
  // Below tab contents.
  BOTTOM: 'bottom',
  // To the left of tab contents (to the right if the page is right-to-left).
  START: 'start',
  // To the right of tab contents (to the left if the page is right-to-left).
  END: 'end'
};


/**
 * Tab bar location; defaults to {@link goog.ui.TabBar.Location.TOP}.
 * @type {goog.ui.TabBar.Location}
 * @private
 */
goog.ui.TabBar.prototype.location_;


/**
 * Whether keyboard navigation should change the selected tab, or just move
 * the highlight.  Defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.TabBar.prototype.autoSelectTabs_ = true;


/**
 * The currently selected tab (null if none).
 * @type {goog.ui.Control?}
 * @private
 */
goog.ui.TabBar.prototype.selectedTab_ = null;


/** @inheritDoc */
goog.ui.TabBar.prototype.disposeInternal = function() {
  goog.ui.TabBar.superClass_.disposeInternal.call(this);
  this.selectedTab_ = null;
};


/**
 * Removes the tab from the tab bar.  Overrides the superclass implementation
 * by deselecting the tab being removed.  Since {@link #removeChildAt} uses
 * {@link #removeChild} internally, we only need to override this method.
 * @param {string|goog.ui.Control} tab Tab to remove.
 * @param {boolean} opt_unrender Whether to call {@code exitDocument} on the
 *     removed tab, and detach its DOM from the document (defaults to false).
 * @return {goog.ui.Control} The removed tab, if any.
 * @override
 */
goog.ui.TabBar.prototype.removeChild = function(tab, opt_unrender) {
  // This actually only accepts goog.ui.Controls. There's a TODO
  // on the superclass method to fix this.
  this.deselectIfSelected(/** @type {goog.ui.Control} */ (tab));
  return goog.ui.TabBar.superClass_.removeChild.call(this, tab, opt_unrender);
};


/**
 * @return {goog.ui.TabBar.Location} Tab bar location relative to tab contents.
 */
goog.ui.TabBar.prototype.getLocation = function() {
  return this.location_;
};


/**
 * Sets the location of the tab bar relative to tab contents.
 * @param {goog.ui.TabBar.Location} location Tab bar location relative to tab
 *     contents.
 * @throws {Error} If the tab bar has already been rendered.
 */
goog.ui.TabBar.prototype.setLocation = function(location) {
  // setOrientation() will take care of throwing an error if already rendered.
  this.setOrientation(goog.ui.TabBar.getOrientationFromLocation(location));
  this.location_ = location;
};


/**
 * @return {boolean} Whether keyboard navigation should change the selected tab,
 *     or just move the highlight.
 */
goog.ui.TabBar.prototype.isAutoSelectTabs = function() {
  return this.autoSelectTabs_;
};


/**
 * Enables or disables auto-selecting tabs using the keyboard.  If auto-select
 * is enabled, keyboard navigation switches tabs immediately, otherwise it just
 * moves the highlight.
 * @param {boolean} enable Whether keyboard navigation should change the
 *     selected tab, or just move the highlight.
 */
goog.ui.TabBar.prototype.setAutoSelectTabs = function(enable) {
  this.autoSelectTabs_ = enable;
};


/**
 * Highlights the tab at the given index in response to a keyboard event.
 * Overrides the superclass implementation by also selecting the tab if
 * {@link #isAutoSelectTabs} returns true.
 * @param {number} index Index of tab to highlight.
 * @protected
 * @override
 */
goog.ui.TabBar.prototype.setHighlightedIndexFromKeyEvent = function(index) {
  goog.ui.TabBar.superClass_.setHighlightedIndexFromKeyEvent.call(this, index);
  if (this.autoSelectTabs_) {
    // Immediately select the tab.
    this.setSelectedTabIndex(index);
  }
};


/**
 * @return {goog.ui.Control?} The currently selected tab (null if none).
 */
goog.ui.TabBar.prototype.getSelectedTab = function() {
  return this.selectedTab_;
};


/**
 * Selects the given tab.
 * @param {goog.ui.Control?} tab Tab to select (null to select none).
 */
goog.ui.TabBar.prototype.setSelectedTab = function(tab) {
  if (tab) {
    // Select the tab and have it dispatch a SELECT event, to be handled in
    // handleTabSelect() below.
    tab.setSelected(true);
  } else if (this.getSelectedTab()) {
    // De-select the currently selected tab and have it dispatch an UNSELECT
    // event, to be handled in handleTabUnselect() below.
    this.getSelectedTab().setSelected(false);
  }
};


/**
 * @return {number} Index of the currently selected tab (-1 if none).
 */
goog.ui.TabBar.prototype.getSelectedTabIndex = function() {
  return this.indexOfChild(this.getSelectedTab());
};


/**
 * Selects the tab at the given index.
 * @param {number} index Index of the tab to select (-1 to select none).
 */
goog.ui.TabBar.prototype.setSelectedTabIndex = function(index) {
  this.setSelectedTab(/** @type {goog.ui.Tab} */ (this.getChildAt(index)));
};


/**
 * If the specified tab is the currently selected tab, deselects it, and
 * selects the closest selectable tab in the tab bar (first looking before,
 * then after the deselected tab).  Does nothing if the argument is not the
 * currently selected tab.  Called internally when a tab is removed, hidden,
 * or disabled, to ensure that another tab is selected instead.
 * @param {goog.ui.Control?} tab Tab to deselect (if any).
 * @protected
 */
goog.ui.TabBar.prototype.deselectIfSelected = function(tab) {
  if (tab && tab == this.getSelectedTab()) {
    var index = this.indexOfChild(tab);
    // First look for the closest selectable tab before this one.
    for (var i = index - 1;
         tab = /** @type {goog.ui.Tab} */ (this.getChildAt(i));
         i--) {
      if (this.isSelectableTab(tab)) {
        this.setSelectedTab(tab);
        return;
      }
    }
    // Next, look for the closest selectable tab after this one.
    for (var j = index + 1;
         tab = /** @type {goog.ui.Tab} */ (this.getChildAt(j));
         j++) {
      if (this.isSelectableTab(tab)) {
        this.setSelectedTab(tab);
        return;
      }
    }
    // If all else fails, just set the selection to null.
    this.setSelectedTab(null);
  }
};


/**
 * Returns true if the tab is selectable, false otherwise.  Only visible and
 * enabled tabs are selectable.
 * @param {goog.ui.Control} tab Tab to check.
 * @return {boolean} Whether the tab is selectable.
 * @protected
 */
goog.ui.TabBar.prototype.isSelectableTab = function(tab) {
  return tab.isVisible() && tab.isEnabled();
};


/**
 * Handles {@code SELECT} events dispatched by tabs as they become selected.
 * @param {goog.events.Event} e Select event to handle.
 * @protected
 */
goog.ui.TabBar.prototype.handleTabSelect = function(e) {
  if (this.selectedTab_ && this.selectedTab_ != e.target) {
    // Deselect currently selected tab.
    this.selectedTab_.setSelected(false);
  }
  this.selectedTab_ = /** @type {goog.ui.Tab} */ (e.target);
};


/**
 * Handles {@code UNSELECT} events dispatched by tabs as they become deselected.
 * @param {goog.events.Event} e Unselect event to handle.
 * @protected
 */
goog.ui.TabBar.prototype.handleTabUnselect = function(e) {
  if (e.target == this.selectedTab_) {
    this.selectedTab_ = null;
  }
};


/**
 * Handles {@code DISABLE} events displayed by tabs.
 * @param {goog.events.Event} e Disable event to handle.
 * @protected
 */
goog.ui.TabBar.prototype.handleTabDisable = function(e) {
  this.deselectIfSelected(/** @type {goog.ui.Tab} */ (e.target));
};


/**
 * Handles {@code HIDE} events displayed by tabs.
 * @param {goog.events.Event} e Hide event to handle.
 * @protected
 */
goog.ui.TabBar.prototype.handleTabHide = function(e) {
  this.deselectIfSelected(/** @type {goog.ui.Tab} */ (e.target));
};


/**
 * Handles focus events dispatched by the tab bar's key event target.  If no tab
 * is currently highlighted, highlights the selected tab or the first tab if no
 * tab is selected either.
 * @param {goog.events.Event} e Focus event to handle.
 * @protected
 * @override
 */
goog.ui.TabBar.prototype.handleFocus = function(e) {
  if (!this.getHighlighted()) {
    this.setHighlighted(this.getSelectedTab() ||
        /** @type {goog.ui.Tab} */ (this.getChildAt(0)));
  }
};


/**
 * Returns the {@link goog.ui.Container.Orientation} that is implied by the
 * given {@link goog.ui.TabBar.Location}.
 * @param {goog.ui.TabBar.Location} location Tab bar location.
 * @return {goog.ui.Container.Orientation} Corresponding orientation.
 */
goog.ui.TabBar.getOrientationFromLocation = function(location) {
  return location == goog.ui.TabBar.Location.START ||
         location == goog.ui.TabBar.Location.END ?
             goog.ui.Container.Orientation.VERTICAL :
             goog.ui.Container.Orientation.HORIZONTAL;
};


// Register a decorator factory function for goog.ui.TabBars.
goog.ui.registry.setDecoratorByClassName(goog.ui.TabBarRenderer.CSS_CLASS,
    function() {
      return new goog.ui.TabBar();
    });
