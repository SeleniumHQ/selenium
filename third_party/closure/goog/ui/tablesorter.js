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
 * @fileoverview A table sorting decorator.
 *
 * @see ../demos/tablesorter.html
 */

goog.provide('goog.ui.TableSorter');
goog.provide('goog.ui.TableSorter.EventType');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');


/**
 * A table sorter allows for sorting of a table by column.  This component can
 * be used to decorate an already existing TABLE element with sorting
 * features.
 *
 * The TABLE should use a THEAD containing TH elements for the table column
 * headers.
 *
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.TableSorter = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The current sort column of the table, or -1 if none.
   * @type {number}
   * @private
   */
  this.column_ = -1;

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
 * Table sorter events.
 * @enum {string}
 */
goog.ui.TableSorter.EventType = {
  BEFORESORT: 'beforesort',
  SORT: 'sort'
};


/** @inheritDoc */
goog.ui.TableSorter.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.TABLE;
};


/** @inheritDoc */
goog.ui.TableSorter.prototype.enterDocument = function() {
  goog.ui.TableSorter.superClass_.enterDocument.call(this);

  var table = this.getElement();
  var headerRow = table.getElementsByTagName(goog.dom.TagName.TR)[0];
  goog.events.listen(headerRow, goog.events.EventType.CLICK,
      this.sort_, false, this);
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
  // TODO: If this table cell contains another table, this could break.
  var th = goog.dom.getAncestorByTagNameAndClass(e.target,
      goog.dom.TagName.TH);
  var col = th.cellIndex;

  // If the user clicks on the same column, sort it in reverse of what it is
  // now.  Otherwise, sort forward.
  var reverse = col == this.column_ ? !this.reversed_ : false;

  // Perform the sort.
  if (this.dispatchEvent(goog.ui.TableSorter.EventType.BEFORESORT)) {
    this.sort(col, reverse);
    this.dispatchEvent(goog.ui.TableSorter.EventType.SORT);
  }
};


/**
 * Sort the table contents by the values in the given column.
 * @param {number} column The column to sort by.
 * @param {boolean} opt_reverse Whether to sort in reverse.
 */
goog.ui.TableSorter.prototype.sort = function(column, opt_reverse) {
  // Get some useful DOM nodes.
  var table = this.getElement();
  var tBody = table.tBodies[0];
  var rows = tBody.rows;
  var headers = table.tHead.rows[0].cells;

  // Remove old header classes.
  if (this.column_ >= 0) {
    var oldHeader = headers[this.column_];
    goog.dom.classes.remove(oldHeader, this.reversed_ ?
        'goog-tablesorter-sorted-reverse' : 'goog-tablesorter-sorted');
  }

  // If the user clicks on the same column, sort it in reverse of what it is
  // now.  Otherwise, sort forward.
  this.reversed_ = !!opt_reverse;

  // Get some useful DOM nodes.
  var header = headers[column];

  // Collect all the rows in to an array.
  var values = [];
  for (var i = 0, len = rows.length; i < len; i++) {
    var row = rows[i];
    var value = goog.dom.getTextContent(row.cells[column]);
    values.push([value, row]);
  }

  // Sort the array.
  var sortFunction = this.getSortFunction(column);
  var multiplier = this.reversed_ ? -1 : 1;
  goog.array.stableSort(values,
                        function(a, b) {
                          return sortFunction(a[0], b[0]) * multiplier;
                        });

  // Remove the tbody temporarily since this speeds up the sort on some
  // browsers.
  table.removeChild(tBody);

  // Sort the rows, using the resulting array.
  for (i = 0; i < len; i++) {
    tBody.appendChild(values[i][1]);
  }

  // Reinstate the tbody.
  table.insertBefore(tBody, table.tBodies[0] || null);

  // Mark this as the last sorted column.
  this.column_ = column;

  // Update the header class.
  goog.dom.classes.add(header, this.reversed_ ?
      'goog-tablesorter-sorted-reverse' : 'goog-tablesorter-sorted');
};


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
