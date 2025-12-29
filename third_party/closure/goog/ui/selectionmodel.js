/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Single-selection model implemenation.
 *
 * TODO(attila): Add keyboard & mouse event hooks?
 * TODO(attila): Add multiple selection?
 */


goog.provide('goog.ui.SelectionModel');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Single-selection model.  Dispatches a {@link goog.events.EventType.SELECT}
 * event when a selection is made.
 * @param {Array<Object>=} opt_items Array of items; defaults to empty.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.ui.SelectionModel = function(opt_items) {
  'use strict';
  goog.events.EventTarget.call(this);

  /**
   * Array of items controlled by the selection model.  If the items support
   * the `setSelected(Boolean)` interface, they will be (de)selected
   * as needed.
   * @type {!Array<Object>}
   * @private
   */
  this.items_ = [];
  this.addItems(opt_items);
};
goog.inherits(goog.ui.SelectionModel, goog.events.EventTarget);


/**
 * The currently selected item (null if none).
 * @type {?Object}
 * @private
 */
goog.ui.SelectionModel.prototype.selectedItem_ = null;


/**
 * Selection handler function.  Called with two arguments (the item to be
 * selected or deselected, and a Boolean indicating whether the item is to
 * be selected or deselected).
 * @type {?Function}
 * @private
 */
goog.ui.SelectionModel.prototype.selectionHandler_ = null;


/**
 * Returns the selection handler function used by the selection model to change
 * the internal selection state of items under its control.
 * @return {Function} Selection handler function (null if none).
 */
goog.ui.SelectionModel.prototype.getSelectionHandler = function() {
  'use strict';
  return this.selectionHandler_;
};


/**
 * Sets the selection handler function to be used by the selection model to
 * change the internal selection state of items under its control.  The
 * function must take two arguments:  an item and a Boolean to indicate whether
 * the item is to be selected or deselected.  Selection handler functions are
 * only needed if the items in the selection model don't natively support the
 * `setSelected(Boolean)` interface.
 * @param {Function} handler Selection handler function.
 */
goog.ui.SelectionModel.prototype.setSelectionHandler = function(handler) {
  'use strict';
  this.selectionHandler_ = handler;
};


/**
 * Returns the number of items controlled by the selection model.
 * @return {number} Number of items.
 */
goog.ui.SelectionModel.prototype.getItemCount = function() {
  'use strict';
  return this.items_.length;
};


/**
 * Returns the 0-based index of the given item within the selection model, or
 * -1 if no such item is found.
 * @param {Object|undefined} item Item to look for.
 * @return {number} Index of the given item (-1 if none).
 */
goog.ui.SelectionModel.prototype.indexOfItem = function(item) {
  'use strict';
  return item ? this.items_.indexOf(item) : -1;
};


/**
 * @return {Object|undefined} The first item, or undefined if there are no items
 *     in the model.
 */
goog.ui.SelectionModel.prototype.getFirst = function() {
  'use strict';
  return this.items_[0];
};


/**
 * @return {Object|undefined} The last item, or undefined if there are no items
 *     in the model.
 */
goog.ui.SelectionModel.prototype.getLast = function() {
  'use strict';
  return this.items_[this.items_.length - 1];
};


/**
 * Returns the item at the given 0-based index.
 * @param {number} index Index of the item to return.
 * @return {Object} Item at the given index (null if none).
 */
goog.ui.SelectionModel.prototype.getItemAt = function(index) {
  'use strict';
  return this.items_[index] || null;
};


/**
 * Bulk-adds items to the selection model.  This is more efficient than calling
 * {@link #addItem} for each new item.
 * @param {Array<Object>|undefined} items New items to add.
 */
goog.ui.SelectionModel.prototype.addItems = function(items) {
  'use strict';
  if (items) {
    // New items shouldn't be selected.
    items.forEach(function(item) {
      'use strict';
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
  'use strict';
  this.addItemAt(item, this.getItemCount());
};


/**
 * Adds an item at the given index.
 * @param {Object} item Item to add.
 * @param {number} index Index at which to add the new item.
 */
goog.ui.SelectionModel.prototype.addItemAt = function(item, index) {
  'use strict';
  if (item) {
    // New items must not be selected.
    this.selectItem_(item, false);
    goog.array.insertAt(this.items_, item, index);
  }
};


/**
 * Removes the given item (if it exists).  Dispatches a `SELECT` event if
 * the removed item was the currently selected item.
 * @param {Object} item Item to remove.
 */
goog.ui.SelectionModel.prototype.removeItem = function(item) {
  'use strict';
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
  'use strict';
  this.removeItem(this.getItemAt(index));
};


/**
 * @return {Object} The currently selected item, or null if none.
 */
goog.ui.SelectionModel.prototype.getSelectedItem = function() {
  'use strict';
  return this.selectedItem_;
};


/**
 * @return {!Array<Object>} All items in the selection model.
 */
goog.ui.SelectionModel.prototype.getItems = function() {
  'use strict';
  return goog.array.clone(this.items_);
};


/**
 * Selects the given item, deselecting any previously selected item, and
 * dispatches a `SELECT` event.
 * @param {Object} item Item to select (null to clear the selection).
 */
goog.ui.SelectionModel.prototype.setSelectedItem = function(item) {
  'use strict';
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
  'use strict';
  return this.indexOfItem(this.selectedItem_);
};


/**
 * Selects the item at the given index, deselecting any previously selected
 * item, and dispatches a `SELECT` event.
 * @param {number} index Index to select (-1 to clear the selection).
 */
goog.ui.SelectionModel.prototype.setSelectedIndex = function(index) {
  'use strict';
  this.setSelectedItem(this.getItemAt(index));
};


/**
 * Clears the selection model by removing all items from the selection.
 */
goog.ui.SelectionModel.prototype.clear = function() {
  'use strict';
  goog.array.clear(this.items_);
  this.selectedItem_ = null;
};


/** @override */
goog.ui.SelectionModel.prototype.disposeInternal = function() {
  'use strict';
  goog.ui.SelectionModel.superClass_.disposeInternal.call(this);
  delete this.items_;
  this.selectedItem_ = null;
};


/**
 * Private helper; selects or deselects the given item based on the value of
 * the `select` argument.  If a selection handler has been registered
 * (via {@link #setSelectionHandler}, calls it to update the internal selection
 * state of the item.  Otherwise, attempts to call `setSelected(Boolean)`
 * on the item itself, provided the object supports that interface.
 * @param {Object} item Item to select or deselect.
 * @param {boolean} select If true, the object will be selected; if false, it
 *     will be deselected.
 * @private
 */
goog.ui.SelectionModel.prototype.selectItem_ = function(item, select) {
  'use strict';
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
