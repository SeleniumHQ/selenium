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
 * @fileoverview Single-selection model implemenation.
 *
 * TODO(attila): Add keyboard & mouse event hooks?
 * TODO(attila): Add multiple selection?
 *
 * @author attila@google.com (Attila Bodis)
 */


goog.provide('goog.ui.SelectionModel');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Single-selection model.  Dispatches a {@link goog.events.EventType.SELECT}
 * event when a selection is made.
 * @param {Array.<Object>=} opt_items Array of items; defaults to empty.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.ui.SelectionModel = function(opt_items) {
  goog.events.EventTarget.call(this);

  /**
   * Array of items controlled by the selection model.  If the items support
   * the {@code setSelected(Boolean)} interface, they will be (de)selected
   * as needed.
   * @type {!Array.<Object>}
   * @private
   */
  this.items_ = [];
  this.addItems(opt_items);
};
goog.inherits(goog.ui.SelectionModel, goog.events.EventTarget);
goog.tagUnsealableClass(goog.ui.SelectionModel);


/**
 * The currently selected item (null if none).
 * @type {Object}
 * @private
 */
goog.ui.SelectionModel.prototype.selectedItem_ = null;


/**
 * Selection handler function.  Called with two arguments (the item to be
 * selected or deselected, and a Boolean indicating whether the item is to
 * be selected or deselected).
 * @type {Function}
 * @private
 */
goog.ui.SelectionModel.prototype.selectionHandler_ = null;


/**
 * Returns the selection handler function used by the selection model to change
 * the internal selection state of items under its control.
 * @return {Function} Selection handler function (null if none).
 */
goog.ui.SelectionModel.prototype.getSelectionHandler = function() {
  return this.selectionHandler_;
};


/**
 * Sets the selection handler function to be used by the selection model to
 * change the internal selection state of items under its control.  The
 * function must take two arguments:  an item and a Boolean to indicate whether
 * the item is to be selected or deselected.  Selection handler functions are
 * only needed if the items in the selection model don't natively support the
 * {@code setSelected(Boolean)} interface.
 * @param {Function} handler Selection handler function.
 */
goog.ui.SelectionModel.prototype.setSelectionHandler = function(handler) {
  this.selectionHandler_ = handler;
};


/**
 * Returns the number of items controlled by the selection model.
 * @return {number} Number of items.
 */
goog.ui.SelectionModel.prototype.getItemCount = function() {
  return this.items_.length;
};


/**
 * Returns the 0-based index of the given item within the selection model, or
 * -1 if no such item is found.
 * @param {Object|undefined} item Item to look for.
 * @return {number} Index of the given item (-1 if none).
 */
goog.ui.SelectionModel.prototype.indexOfItem = function(item) {
  return item ? goog.array.indexOf(this.items_, item) : -1;
};


/**
 * @return {Object|undefined} The first item, or undefined if there are no items
 *     in the model.
 */
goog.ui.SelectionModel.prototype.getFirst = function() {
  return this.items_[0];
};


/**
 * @return {Object|undefined} The last item, or undefined if there are no items
 *     in the model.
 */
goog.ui.SelectionModel.prototype.getLast = function() {
  return this.items_[this.items_.length - 1];
};


/**
 * Returns the item at the given 0-based index.
 * @param {number} index Index of the item to return.
 * @return {Object} Item at the given index (null if none).
 */
goog.ui.SelectionModel.prototype.getItemAt = function(index) {
  return this.items_[index] || null;
};


/**
 * Bulk-adds items to the selection model.  This is more efficient than calling
 * {@link #addItem} for each new item.
 * @param {Array.<Object>|undefined} items New items to add.
 */
goog.ui.SelectionModel.prototype.addItems = function(items) {
  if (items) {
    // New items shouldn't be selected.
    goog.array.forEach(items, function(item) {
      this.selectItem_(item, false);
    }, this);
    goog.array.extend(this.items_, items);
  }
};


/**
 * Adds an item at the end of the list.
 * @param {Object} item Item to add.
 */
goog.ui.SelectionModel.prototype.addItem = function(item) {
  this.addItemAt(item, this.getItemCount());
};


/**
 * Adds an item at the given index.
 * @param {Object} item Item to add.
 * @param {number} index Index at which to add the new item.
 */
goog.ui.SelectionModel.prototype.addItemAt = function(item, index) {
  if (item) {
    // New items must not be selected.
    this.selectItem_(item, false);
    goog.array.insertAt(this.items_, item, index);
  }
};


/**
 * Removes the given item (if it exists).  Dispatches a {@code SELECT} event if
 * the removed item was the currently selected item.
 * @param {Object} item Item to remove.
 */
goog.ui.SelectionModel.prototype.removeItem = function(item) {
  if (item && goog.array.remove(this.items_, item)) {
    if (item == this.selectedItem_) {
      this.selectedItem_ = null;
      this.dispatchEvent(goog.events.EventType.SELECT);
    }
  }
};


/**
 * Removes the item at the given index.
 * @param {number} index Index of the item to remove.
 */
goog.ui.SelectionModel.prototype.removeItemAt = function(index) {
  this.removeItem(this.getItemAt(index));
};


/**
 * @return {Object} The currently selected item, or null if none.
 */
goog.ui.SelectionModel.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};


/**
 * @return {!Array.<Object>} All items in the selection model.
 */
goog.ui.SelectionModel.prototype.getItems = function() {
  return goog.array.clone(this.items_);
};


/**
 * Selects the given item, deselecting any previously selected item, and
 * dispatches a {@code SELECT} event.
 * @param {Object} item Item to select (null to clear the selection).
 */
goog.ui.SelectionModel.prototype.setSelectedItem = function(item) {
  if (item != this.selectedItem_) {
    this.selectItem_(this.selectedItem_, false);
    this.selectedItem_ = item;
    this.selectItem_(item, true);
  }

  // Always dispatch a SELECT event; let listeners decide what to do if the
  // selected item hasn't changed.
  this.dispatchEvent(goog.events.EventType.SELECT);
};


/**
 * @return {number} The 0-based index of the currently selected item, or -1
 *     if none.
 */
goog.ui.SelectionModel.prototype.getSelectedIndex = function() {
  return this.indexOfItem(this.selectedItem_);
};


/**
 * Selects the item at the given index, deselecting any previously selected
 * item, and dispatches a {@code SELECT} event.
 * @param {number} index Index to select (-1 to clear the selection).
 */
goog.ui.SelectionModel.prototype.setSelectedIndex = function(index) {
  this.setSelectedItem(this.getItemAt(index));
};


/**
 * Clears the selection model by removing all items from the selection.
 */
goog.ui.SelectionModel.prototype.clear = function() {
  goog.array.clear(this.items_);
  this.selectedItem_ = null;
};


/** @override */
goog.ui.SelectionModel.prototype.disposeInternal = function() {
  goog.ui.SelectionModel.superClass_.disposeInternal.call(this);
  delete this.items_;
  this.selectedItem_ = null;
};


/**
 * Private helper; selects or deselects the given item based on the value of
 * the {@code select} argument.  If a selection handler has been registered
 * (via {@link #setSelectionHandler}, calls it to update the internal selection
 * state of the item.  Otherwise, attempts to call {@code setSelected(Boolean)}
 * on the item itself, provided the object supports that interface.
 * @param {Object} item Item to select or deselect.
 * @param {boolean} select If true, the object will be selected; if false, it
 *     will be deselected.
 * @private
 */
goog.ui.SelectionModel.prototype.selectItem_ = function(item, select) {
  if (item) {
    if (typeof this.selectionHandler_ == 'function') {
      // Use the registered selection handler function.
      this.selectionHandler_(item, select);
    } else if (typeof item.setSelected == 'function') {
      // Call setSelected() on the item, if it supports it.
      item.setSelected(select);
    }
  }
};
