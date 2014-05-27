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
 * @fileoverview A table sorting decorator.
 *
 * @author robbyw@google.com (Robby Walker)
 * @see ../demos/tablesorter.html
 */

goog.provide('goog.ui.TableSorter');
goog.provide('goog.ui.TableSorter.EventType');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.ui.Component');



/**
 * A table sorter allows for sorting of a table by column.  This component can
 * be used to decorate an already existing TABLE element with sorting
 * features.
 *
 * The TABLE should use a THEAD containing TH elements for the table column
 * headers.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.TableSorter = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The current sort header of the table, or null if none.
   * @type {HTMLTableCellElement}
   * @private
   */
  this.header_ = null;

  /**
   * Whether the last sort was in reverse.
   * @type {boolean}
   * @private
   */
  this.reversed_ = false;

  /**
   * The default sorting function.
   * @type {function(*, *) : number}
   * @private
   */
  this.defaultSortFunction_ = goog.ui.TableSorter.numericSort;

  /**
   * Array of custom sorting functions per colun.
   * @type {Array.<function(*, *) : number>}
   * @private
   */
  this.sortFunctions_ = [];
};
goog.inherits(goog.ui.TableSorter, goog.ui.Component);


/**
 * Row number (in <thead>) to use for sorting.
 * @type {number}
 * @private
 */
goog.ui.TableSorter.prototype.sortableHeaderRowIndex_ = 0;


/**
 * Sets the row index (in <thead>) to be used for sorting.
 * By default, the first row (index 0) is used.
 * Must be called before decorate() is called.
 * @param {number} index The row index.
 */
goog.ui.TableSorter.prototype.setSortableHeaderRowIndex = function(index) {
  if (this.isInDocument()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.sortableHeaderRowIndex_ = index;
};


/**
 * Table sorter events.
 * @enum {string}
 */
goog.ui.TableSorter.EventType = {
  BEFORESORT: 'beforesort',
  SORT: 'sort'
};


/** @override */
goog.ui.TableSorter.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.TABLE;
};


/** @override */
goog.ui.TableSorter.prototype.enterDocument = function() {
  goog.ui.TableSorter.superClass_.enterDocument.call(this);

  var table = this.getElement();
  var headerRow = table.tHead.rows[this.sortableHeaderRowIndex_];

  this.getHandler().listen(headerRow, goog.events.EventType.CLICK, this.sort_);
};


/**
 * @return {number} The current sort column of the table, or -1 if none.
 */
goog.ui.TableSorter.prototype.getSortColumn = function() {
  return this.header_ ? this.header_.cellIndex : -1;
};


/**
 * @return {boolean} Whether the last sort was in reverse.
 */
goog.ui.TableSorter.prototype.isSortReversed = function() {
  return this.reversed_;
};


/**
 * @return {function(*, *) : number} The default sort function to be used by
 *     all columns.
 */
goog.ui.TableSorter.prototype.getDefaultSortFunction = function() {
  return this.defaultSortFunction_;
};


/**
 * Sets the default sort function to be used by all columns.  If not set
 * explicitly, this defaults to numeric sorting.
 * @param {function(*, *) : number} sortFunction The new default sort function.
 */
goog.ui.TableSorter.prototype.setDefaultSortFunction = function(sortFunction) {
  this.defaultSortFunction_ = sortFunction;
};


/**
 * Gets the sort function to be used by the given column.  Returns the default
 * sort function if no sort function is explicitly set for this column.
 * @param {number} column The column index.
 * @return {function(*, *) : number} The sort function used by the column.
 */
goog.ui.TableSorter.prototype.getSortFunction = function(column) {
  return this.sortFunctions_[column] || this.defaultSortFunction_;
};


/**
 * Set the sort function for the given column, overriding the default sort
 * function.
 * @param {number} column The column index.
 * @param {function(*, *) : number} sortFunction The new sort function.
 */
goog.ui.TableSorter.prototype.setSortFunction = function(column, sortFunction) {
  this.sortFunctions_[column] = sortFunction;
};


/**
 * Sort the table contents by the values in the given column.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.ui.TableSorter.prototype.sort_ = function(e) {
  // Determine what column was clicked.
  // TODO(robbyw): If this table cell contains another table, this could break.
  var target = /** @type {Node} */ (e.target);
  var th = goog.dom.getAncestorByTagNameAndClass(target,
      goog.dom.TagName.TH);

  // If the user clicks on the same column, sort it in reverse of what it is
  // now.  Otherwise, sort forward.
  var reverse = th == this.header_ ? !this.reversed_ : false;

  // Perform the sort.
  if (this.dispatchEvent(goog.ui.TableSorter.EventType.BEFORESORT)) {
    if (this.sort(th.cellIndex, reverse)) {
      this.dispatchEvent(goog.ui.TableSorter.EventType.SORT);
    }
  }
};


/**
 * Sort the table contents by the values in the given column.
 * @param {number} column The column to sort by.
 * @param {boolean=} opt_reverse Whether to sort in reverse.
 * @return {boolean} Whether the sort was executed.
 */
goog.ui.TableSorter.prototype.sort = function(column, opt_reverse) {
  var sortFunction = this.getSortFunction(column);
  if (sortFunction === goog.ui.TableSorter.noSort) {
    return false;
  }

  // Remove old header classes.
  if (this.header_) {
    goog.dom.classlist.remove(this.header_, this.reversed_ ?
        goog.getCssName('goog-tablesorter-sorted-reverse') :
        goog.getCssName('goog-tablesorter-sorted'));
  }

  // If the user clicks on the same column, sort it in reverse of what it is
  // now.  Otherwise, sort forward.
  this.reversed_ = !!opt_reverse;
  var multiplier = this.reversed_ ? -1 : 1;
  var cmpFn = function(a, b) {
    return multiplier * sortFunction(a[0], b[0]) || a[1] - b[1];
  };

  // Sort all tBodies
  var table = this.getElement();
  goog.array.forEach(table.tBodies, function(tBody) {
    // Collect all of the rows into an array.
    var values = goog.array.map(tBody.rows, function(row, rowIndex) {
      return [goog.dom.getTextContent(row.cells[column]), rowIndex, row];
    });

    goog.array.sort(values, cmpFn);

    // Remove the tBody temporarily since this speeds up the sort on some
    // browsers.
    var nextSibling = tBody.nextSibling;
    table.removeChild(tBody);

    // Sort the rows, using the resulting array.
    goog.array.forEach(values, function(row) {
      tBody.appendChild(row[2]);
    });

    // Reinstate the tBody.
    table.insertBefore(tBody, nextSibling);
  });

  // Mark this as the last sorted column.
  this.header_ = table.tHead.rows[this.sortableHeaderRowIndex_].cells[column];

  // Update the header class.
  goog.dom.classlist.add(this.header_, this.reversed_ ?
      goog.getCssName('goog-tablesorter-sorted-reverse') :
      goog.getCssName('goog-tablesorter-sorted'));

  return true;
};


/**
 * Disables sorting on the specified column
 * @param {*} a First sort value.
 * @param {*} b Second sort value.
 * @return {number} Negative if a < b, 0 if a = b, and positive if a > b.
 */
goog.ui.TableSorter.noSort = goog.functions.error('no sort');


/**
 * A numeric sort function.
 * @param {*} a First sort value.
 * @param {*} b Second sort value.
 * @return {number} Negative if a < b, 0 if a = b, and positive if a > b.
 */
goog.ui.TableSorter.numericSort = function(a, b) {
  return parseFloat(a) - parseFloat(b);
};


/**
 * Alphabetic sort function.
 * @param {*} a First sort value.
 * @param {*} b Second sort value.
 * @return {number} Negative if a < b, 0 if a = b, and positive if a > b.
 */
goog.ui.TableSorter.alphaSort = goog.array.defaultCompare;


/**
 * Returns a function that is the given sort function in reverse.
 * @param {function(*, *) : number} sortFunction The original sort function.
 * @return {function(*, *) : number} A new sort function that reverses the
 *     given sort function.
 */
goog.ui.TableSorter.createReverseSort = function(sortFunction) {
  return function(a, b) {
    return -1 * sortFunction(a, b);
  };
};
