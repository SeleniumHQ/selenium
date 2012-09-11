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
 * @fileoverview Menu where items can be filtered based on user keyboard input.
 * If a filter is specified only the items matching it will be displayed.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/filteredmenu.html
 */


goog.provide('goog.ui.FilteredMenu');

goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.string');
goog.require('goog.ui.FilterObservingMenuItem');
goog.require('goog.ui.Menu');



/**
 * Filtered menu class.
 * @param {goog.ui.MenuRenderer=} opt_renderer Renderer used to render filtered
 *     menu; defaults to {@link goog.ui.MenuRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Menu}
 */
goog.ui.FilteredMenu = function(opt_renderer, opt_domHelper) {
  goog.ui.Menu.call(this, opt_domHelper, opt_renderer);
};
goog.inherits(goog.ui.FilteredMenu, goog.ui.Menu);


/**
 * Events fired by component.
 * @enum {string}
 */
goog.ui.FilteredMenu.EventType = {
  /** Dispatched after the component filter criteria has been changed. */
  FILTER_CHANGED: 'filterchange'
};


/**
 * Filter input element.
 * @type {Element|undefined}
 * @private
 */
goog.ui.FilteredMenu.prototype.filterInput_;


/**
 * The input handler that provides the input event.
 * @type {goog.events.InputHandler|undefined}
 * @private
 */
goog.ui.FilteredMenu.prototype.inputHandler_;


/**
 * Maximum number of characters for filter input.
 * @type {number}
 * @private
 */
goog.ui.FilteredMenu.prototype.maxLength_ = 0;


/**
 * Label displayed in the filter input when no text has been entered.
 * @type {string}
 * @private
 */
goog.ui.FilteredMenu.prototype.label_ = '';


/**
 * Label element.
 * @type {Element|undefined}
 * @private
 */
goog.ui.FilteredMenu.prototype.labelEl_;


/**
 * Whether multiple items can be entered comma separated.
 * @type {boolean}
 * @private
 */
goog.ui.FilteredMenu.prototype.allowMultiple_ = false;


/**
 * List of items entered in the search box if multiple entries are allowed.
 * @type {Array.<string>|undefined}
 * @private
 */
goog.ui.FilteredMenu.prototype.enteredItems_;


/**
 * Index of first item that should be affected by the filter. Menu items with
 * a lower index will not be affected by the filter.
 * @type {number}
 * @private
 */
goog.ui.FilteredMenu.prototype.filterFromIndex_ = 0;


/**
 * Filter applied to the menu.
 * @type {string|undefined|null}
 * @private
 */
goog.ui.FilteredMenu.prototype.filterStr_;


/**
 * Map of child nodes that shouldn't be affected by filtering.
 * @type {Object|undefined}
 * @private
 */
goog.ui.FilteredMenu.prototype.persistentChildren_;


/** @override */
goog.ui.FilteredMenu.prototype.createDom = function() {
  goog.ui.FilteredMenu.superClass_.createDom.call(this);

  var dom = this.getDomHelper();
  var el = dom.createDom('div',
      goog.getCssName(this.getRenderer().getCssClass(), 'filter'),
      this.labelEl_ = dom.createDom('div', null, this.label_),
      this.filterInput_ = dom.createDom('input', {'type': 'text'}));
  var element = this.getElement();
  dom.appendChild(element, el);
  this.contentElement_ = dom.createDom('div',
      goog.getCssName(this.getRenderer().getCssClass(), 'content'));
  dom.appendChild(element, this.contentElement_);

  this.initFilterInput_();
};


/**
 * Helper method that initializes the filter input element.
 * @private
 */
goog.ui.FilteredMenu.prototype.initFilterInput_ = function() {
  this.setFocusable(true);
  this.setKeyEventTarget(this.filterInput_);

  // Workaround for mozilla bug #236791.
  if (goog.userAgent.GECKO) {
    this.filterInput_.setAttribute('autocomplete', 'off');
  }

  if (this.maxLength_) {
    this.filterInput_.maxLength = this.maxLength_;
  }
};


/**
 * Sets up listeners and prepares the filter functionality.
 * @private
 */
goog.ui.FilteredMenu.prototype.setUpFilterListeners_ = function() {
  if (!this.inputHandler_ && this.filterInput_) {
    this.inputHandler_ = new goog.events.InputHandler(
        /** @type {Element} */ (this.filterInput_));
    goog.style.setUnselectable(this.filterInput_, false);
    goog.events.listen(this.inputHandler_,
                       goog.events.InputHandler.EventType.INPUT,
                       this.handleFilterEvent, false, this);
    goog.events.listen(this.filterInput_.parentNode,
                       goog.events.EventType.CLICK,
                       this.onFilterLabelClick_, false, this);
    if (this.allowMultiple_) {
      this.enteredItems_ = [];
    }
  }
};


/**
 * Tears down listeners and resets the filter functionality.
 * @private
 */
goog.ui.FilteredMenu.prototype.tearDownFilterListeners_ = function() {
  if (this.inputHandler_) {
    goog.events.unlisten(this.inputHandler_,
                         goog.events.InputHandler.EventType.INPUT,
                         this.handleFilterEvent, false, this);
    goog.events.unlisten(this.filterInput_.parentNode,
                         goog.events.EventType.CLICK,
                         this.onFilterLabelClick_, false, this);

    this.inputHandler_.dispose();
    this.inputHandler_ = undefined;
    this.enteredItems_ = undefined;
  }
};


/** @override */
goog.ui.FilteredMenu.prototype.setVisible = function(show, opt_force, opt_e) {
  var visibilityChanged = goog.ui.FilteredMenu.superClass_.setVisible.call(this,
      show, opt_force, opt_e);
  if (visibilityChanged && show && this.isInDocument()) {
    this.setFilter('');
    this.setUpFilterListeners_();
  } else if (visibilityChanged && !show) {
    this.tearDownFilterListeners_();
  }

  return visibilityChanged;
};


/** @override */
goog.ui.FilteredMenu.prototype.disposeInternal = function() {
  this.tearDownFilterListeners_();
  this.filterInput_ = undefined;
  this.labelEl_ = undefined;
  goog.ui.FilteredMenu.superClass_.disposeInternal.call(this);
};


/**
 * Sets the filter label (the label displayed in the filter input element if no
 * text has been entered).
 * @param {?string} label Label text.
 */
goog.ui.FilteredMenu.prototype.setFilterLabel = function(label) {
  this.label_ = label || '';
  if (this.labelEl_) {
    goog.dom.setTextContent(this.labelEl_, this.label_);
  }
};


/**
 * @return {string} The filter label.
 */
goog.ui.FilteredMenu.prototype.getFilterLabel = function() {
  return this.label_;
};


/**
 * Sets the filter string.
 * @param {?string} str Filter string.
 */
goog.ui.FilteredMenu.prototype.setFilter = function(str) {
  if (this.filterInput_) {
    this.filterInput_.value = str;
    this.filterItems_(str);
  }
};


/**
 * Returns the filter string.
 * @return {string} Current filter or an an empty string.
 */
goog.ui.FilteredMenu.prototype.getFilter = function() {
  return this.filterInput_ && goog.isString(this.filterInput_.value) ?
      this.filterInput_.value : '';
};


/**
 * Sets the index of first item that should be affected by the filter. Menu
 * items with a lower index will not be affected by the filter.
 * @param {number} index Index of first item that should be affected by filter.
 */
goog.ui.FilteredMenu.prototype.setFilterFromIndex = function(index) {
  this.filterFromIndex_ = index;
};


/**
 * Returns the index of first item that is affected by the filter.
 * @return {number} Index of first item that is affected by filter.
 */
goog.ui.FilteredMenu.prototype.getFilterFromIndex = function() {
  return this.filterFromIndex_;
};


/**
 * Gets a list of items entered in the search box.
 * @return {Array.<string>} The entered items.
 */
goog.ui.FilteredMenu.prototype.getEnteredItems = function() {
  return this.enteredItems_ || [];
};


/**
 * Sets whether multiple items can be entered comma separated.
 * @param {boolean} b Whether multiple items can be entered.
 */
goog.ui.FilteredMenu.prototype.setAllowMultiple = function(b) {
  this.allowMultiple_ = b;
};


/**
 * @return {boolean} Whether multiple items can be entered comma separated.
 */
goog.ui.FilteredMenu.prototype.getAllowMultiple = function() {
  return this.allowMultiple_;
};


/**
 * Sets whether the specified child should be affected (shown/hidden) by the
 * filter criteria.
 * @param {goog.ui.Component} child Child to change.
 * @param {boolean} persistent Whether the child should be persistent.
 */
goog.ui.FilteredMenu.prototype.setPersistentVisibility = function(child,
                                                                  persistent) {
  if (!this.persistentChildren_) {
    this.persistentChildren_ = {};
  }
  this.persistentChildren_[child.getId()] = persistent;
};


/**
 * Returns whether the specified child should be affected (shown/hidden) by the
 * filter criteria.
 * @param {goog.ui.Component} child Menu item to check.
 * @return {boolean} Whether the menu item is persistent.
 */
goog.ui.FilteredMenu.prototype.hasPersistentVisibility = function(child) {
  return !!(this.persistentChildren_ &&
            this.persistentChildren_[child.getId()]);
};


/**
 * Handles filter input events.
 * @param {goog.events.BrowserEvent} e The event object.
 */
goog.ui.FilteredMenu.prototype.handleFilterEvent = function(e) {
  this.filterItems_(this.filterInput_.value);

  // Highlight the first visible item unless there's already a highlighted item.
  var highlighted = this.getHighlighted();
  if (!highlighted || !highlighted.isVisible()) {
    this.highlightFirst();
  }
  this.dispatchEvent(goog.ui.FilteredMenu.EventType.FILTER_CHANGED);
};


/**
 * Shows/hides elements based on the supplied filter.
 * @param {?string} str Filter string.
 * @private
 */
goog.ui.FilteredMenu.prototype.filterItems_ = function(str) {
  // Do nothing unless the filter string has changed.
  if (this.filterStr_ == str) {
    return;
  }

  if (this.labelEl_) {
    this.labelEl_.style.visibility = str == '' ? 'visible' : 'hidden';
  }

  if (this.allowMultiple_ && this.enteredItems_) {
    // Matches all non space characters after the last comma.
    var lastWordRegExp = /^(.+),[ ]*([^,]*)$/;
    var matches = str.match(lastWordRegExp);
    // matches[1] is the string up to, but not including, the last comma and
    // matches[2] the part after the last comma. If there are no non-space
    // characters after the last comma matches[2] is undefined.
    var items = matches && matches[1] ? matches[1].split(',') : [];

    // If the number of comma separated items has changes recreate the
    // entered items array and fire a change event.
    if (str.substr(str.length - 1, 1) == ',' ||
        items.length != this.enteredItems_.length) {
      var lastItem = items[items.length - 1] || '';

      // Auto complete text in input box based on the highlighted item.
      if (this.getHighlighted() && lastItem != '') {
        var caption = this.getHighlighted().getCaption();
        if (caption.toLowerCase().indexOf(lastItem.toLowerCase()) == 0) {
          items[items.length - 1] = caption;
          this.filterInput_.value = items.join(',') + ',';
        }
      }
      this.enteredItems_ = items;
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
      this.setHighlightedIndex(-1);
    }

    if (matches) {
      str = matches.length > 2 ? goog.string.trim(matches[2]) : '';
    }
  }

  var matcher = new RegExp('(^|[- ,_/.:])' +
      goog.string.regExpEscape(str), 'i');
  for (var child, i = this.filterFromIndex_; child = this.getChildAt(i); i++) {
    if (child instanceof goog.ui.FilterObservingMenuItem) {
      child.callObserver(str);
    } else if (!this.hasPersistentVisibility(child)) {
      // Only show items matching the filter and highlight the part of the
      // caption that matches.
      var caption = child.getCaption();
      if (caption) {
        var matchArray = caption.match(matcher);
        if (str == '' || matchArray) {
          child.setVisible(true);
          var pos = caption.indexOf(matchArray[0]);

          // If position is non zero increase by one to skip the separator.
          if (pos) {
            pos++;
          }

          if (str == '') {
            child.setContent(caption);
          } else {
            child.setContent(this.getDomHelper().createDom('span', null,
                caption.substr(0, pos),
                this.getDomHelper().createDom(
                    'b', null, caption.substr(pos, str.length)),
                caption.substr(pos + str.length,
                    caption.length - str.length - pos)));
          }
        } else {
          child.setVisible(false);
        }
      } else {

        // Hide separators and other items without a caption if a filter string
        // has been entered.
        child.setVisible(str == '');
      }
    }
  }
  this.filterStr_ = str;
};


/**
 * Handles the menu's behavior for a key event. The highlighted menu item will
 * be given the opportunity to handle the key behavior.
 * @param {goog.events.KeyEvent} e A browser event.
 * @return {boolean} Whether the event was handled.
 * @override
 */
goog.ui.FilteredMenu.prototype.handleKeyEvent = function(e) {
  // Home, end and the arrow keys are normally used to change the selected menu
  // item. Return false here to prevent the menu from preventing the default
  // behavior for HOME, END and any key press with a modifier.
  if (e.shiftKey || e.ctrlKey || e.altKey ||
      e.keyCode == goog.events.KeyCodes.HOME ||
      e.keyCode == goog.events.KeyCodes.END) {
    return false;
  }

  if (e.keyCode == goog.events.KeyCodes.ESC) {
    this.dispatchEvent(goog.ui.Component.EventType.BLUR);
    return true;
  }

  return goog.ui.FilteredMenu.superClass_.handleKeyEvent.call(this, e);
};


/**
 * Sets the highlighted index, unless the HIGHLIGHT event is intercepted and
 * cancelled.  -1 = no highlight. Also scrolls the menu item into view.
 * @param {number} index Index of menu item to highlight.
 * @override
 */
goog.ui.FilteredMenu.prototype.setHighlightedIndex = function(index) {
  goog.ui.FilteredMenu.superClass_.setHighlightedIndex.call(this, index);
  var contentEl = this.getContentElement();
  var el = this.getHighlighted() ? this.getHighlighted().getElement() : null;

  if (el && goog.dom.contains(contentEl, el)) {
    var contentTop = goog.userAgent.IE && !goog.userAgent.isVersion(8) ?
        0 : contentEl.offsetTop;

    // IE (tested on IE8) sometime does not scroll enough by about
    // 1px. So we add 1px to the scroll amount. This still looks ok in
    // other browser except for the most degenerate case (menu height <=
    // item height).

    // Scroll down if the highlighted item is below the bottom edge.
    var diff = (el.offsetTop + el.offsetHeight - contentTop) -
        (contentEl.clientHeight + contentEl.scrollTop) + 1;
    contentEl.scrollTop += Math.max(diff, 0);

    // Scroll up if the highlighted item is above the top edge.
    diff = contentEl.scrollTop - (el.offsetTop - contentTop) + 1;
    contentEl.scrollTop -= Math.max(diff, 0);
  }
};


/**
 * Handles clicks on the filter label. Focuses the input element.
 * @param {goog.events.BrowserEvent} e A browser event.
 * @private
 */
goog.ui.FilteredMenu.prototype.onFilterLabelClick_ = function(e) {
  this.filterInput_.focus();
};


/** @override */
goog.ui.FilteredMenu.prototype.getContentElement = function() {
  return this.contentElement_ || this.getElement();
};


/**
 * Returns the filter input element.
 * @return {Element} Input element.
 */
goog.ui.FilteredMenu.prototype.getFilterInputElement = function() {
  return this.filterInput_ || null;
};


/** @override */
goog.ui.FilteredMenu.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  // Decorate the menu content.
  this.decorateContent(element);

  // Locate internally managed elements.
  var el = this.getDomHelper().getElementsByTagNameAndClass('div',
      goog.getCssName(this.getRenderer().getCssClass(), 'filter'), element)[0];
  this.labelEl_ = goog.dom.getFirstElementChild(el);
  this.filterInput_ = goog.dom.getNextElementSibling(this.labelEl_);
  this.contentElement_ = goog.dom.getNextElementSibling(el);

  // Decorate additional menu items (like 'apply').
  this.getRenderer().decorateChildren(this, el.parentNode,
      this.contentElement_);

  this.initFilterInput_();
};
