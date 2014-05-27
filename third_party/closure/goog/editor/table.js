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
 * @fileoverview Table editing support.
 * This file provides the class goog.editor.Table and two
 * supporting classes, goog.editor.TableRow and
 * goog.editor.TableCell. Together these provide support for
 * high level table modifications: Adding and deleting rows and columns,
 * and merging and splitting cells.
 *
 * @supported IE6+, WebKit 525+, Firefox 2+.
 */

goog.provide('goog.editor.Table');
goog.provide('goog.editor.TableCell');
goog.provide('goog.editor.TableRow');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.log');
goog.require('goog.string.Unicode');
goog.require('goog.style');



/**
 * Class providing high level table editing functions.
 * @param {Element} node Element that is a table or descendant of a table.
 * @constructor
 * @final
 */
goog.editor.Table = function(node) {
  this.element = goog.dom.getAncestorByTagNameAndClass(node,
      goog.dom.TagName.TABLE);
  if (!this.element) {
    goog.log.error(this.logger_,
        "Can't create Table based on a node " +
        "that isn't a table, or descended from a table.");
  }
  this.dom_ = goog.dom.getDomHelper(this.element);
  this.refresh();
};


/**
 * Logger object for debugging and error messages.
 * @type {goog.log.Logger}
 * @private
 */
goog.editor.Table.prototype.logger_ =
    goog.log.getLogger('goog.editor.Table');


/**
 * Walks the dom structure of this object's table element and populates
 * this.rows with goog.editor.TableRow objects. This is done initially
 * to populate the internal data structures, and also after each time the
 * DOM structure is modified. Currently this means that the all existing
 * information is discarded and re-read from the DOM.
 */
// TODO(user): support partial refresh to save cost of full update
// every time there is a change to the DOM.
goog.editor.Table.prototype.refresh = function() {
  var rows = this.rows = [];
  var tbody = this.element.getElementsByTagName(goog.dom.TagName.TBODY)[0];
  if (!tbody) {
    return;
  }
  var trs = [];
  for (var child = tbody.firstChild; child; child = child.nextSibling) {
    if (child.nodeName == goog.dom.TagName.TR) {
      trs.push(child);
    }
  }

  for (var rowNum = 0, tr; tr = trs[rowNum]; rowNum++) {
    var existingRow = rows[rowNum];
    var tds = goog.editor.Table.getChildCellElements(tr);
    var columnNum = 0;
    // A note on cellNum vs. columnNum: A cell is a td/th element. Cells may
    // use colspan/rowspan to extend over multiple rows/columns. cellNum
    // is the dom element number, columnNum is the logical column number.
    for (var cellNum = 0, td; td = tds[cellNum]; cellNum++) {
      // If there's already a cell extending into this column
      // (due to that cell's colspan/rowspan), increment the column counter.
      while (existingRow && existingRow.columns[columnNum]) {
        columnNum++;
      }
      var cell = new goog.editor.TableCell(td, rowNum, columnNum);
      // Place this cell in every row and column into which it extends.
      for (var i = 0; i < cell.rowSpan; i++) {
        var cellRowNum = rowNum + i;
        // Create TableRow objects in this.rows as needed.
        var cellRow = rows[cellRowNum];
        if (!cellRow) {
          // TODO(user): try to avoid second trs[] lookup.
          rows.push(
              cellRow = new goog.editor.TableRow(trs[cellRowNum], cellRowNum));
        }
        // Extend length of column array to make room for this cell.
        var minimumColumnLength = columnNum + cell.colSpan;
        if (cellRow.columns.length < minimumColumnLength) {
          cellRow.columns.length = minimumColumnLength;
        }
        for (var j = 0; j < cell.colSpan; j++) {
          var cellColumnNum = columnNum + j;
          cellRow.columns[cellColumnNum] = cell;
        }
      }
      columnNum += cell.colSpan;
    }
  }
};


/**
 * Returns all child elements of a TR element that are of type TD or TH.
 * @param {Element} tr TR element in which to find children.
 * @return {!Array.<Element>} array of child cell elements.
 */
goog.editor.Table.getChildCellElements = function(tr) {
  var cells = [];
  for (var i = 0, cell; cell = tr.childNodes[i]; i++) {
    if (cell.nodeName == goog.dom.TagName.TD ||
        cell.nodeName == goog.dom.TagName.TH) {
      cells.push(cell);
    }
  }
  return cells;
};


/**
 * Inserts a new row in the table. The row will be populated with new
 * cells, and existing rowspanned cells that overlap the new row will
 * be extended.
 * @param {number=} opt_rowIndex Index at which to insert the row. If
 *     this is omitted the row will be appended to the end of the table.
 * @return {!Element} The new row.
 */
goog.editor.Table.prototype.insertRow = function(opt_rowIndex) {
  var rowIndex = goog.isDefAndNotNull(opt_rowIndex) ?
      opt_rowIndex : this.rows.length;
  var refRow;
  var insertAfter;
  if (rowIndex == 0) {
    refRow = this.rows[0];
    insertAfter = false;
  } else {
    refRow = this.rows[rowIndex - 1];
    insertAfter = true;
  }
  var newTr = this.dom_.createElement('tr');
  for (var i = 0, cell; cell = refRow.columns[i]; i += 1) {
    // Check whether the existing cell will span this new row.
    // If so, instead of creating a new cell, extend
    // the rowspan of the existing cell.
    if ((insertAfter && cell.endRow > rowIndex) ||
        (!insertAfter && cell.startRow < rowIndex)) {
      cell.setRowSpan(cell.rowSpan + 1);
      if (cell.colSpan > 1) {
        i += cell.colSpan - 1;
      }
    } else {
      newTr.appendChild(this.createEmptyTd());
    }
    if (insertAfter) {
      goog.dom.insertSiblingAfter(newTr, refRow.element);
    } else {
      goog.dom.insertSiblingBefore(newTr, refRow.element);
    }
  }
  this.refresh();
  return newTr;
};


/**
 * Inserts a new column in the table. The column will be created by
 * inserting new TD elements in each row, or extending the colspan
 * of existing TD elements.
 * @param {number=} opt_colIndex Index at which to insert the column. If
 *     this is omitted the column will be appended to the right side of
 *     the table.
 * @return {!Array.<Element>} Array of new cell elements that were created
 *     to populate the new column.
 */
goog.editor.Table.prototype.insertColumn = function(opt_colIndex) {
  // TODO(user): set column widths in a way that makes sense.
  var colIndex = goog.isDefAndNotNull(opt_colIndex) ?
      opt_colIndex :
      (this.rows[0] && this.rows[0].columns.length) || 0;
  var newTds = [];
  for (var rowNum = 0, row; row = this.rows[rowNum]; rowNum++) {
    var existingCell = row.columns[colIndex];
    if (existingCell && existingCell.endCol >= colIndex &&
        existingCell.startCol < colIndex) {
      existingCell.setColSpan(existingCell.colSpan + 1);
      rowNum += existingCell.rowSpan - 1;
    } else {
      var newTd = this.createEmptyTd();
      // TODO(user): figure out a way to intelligently size new columns.
      newTd.style.width = goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH + 'px';
      this.insertCellElement(newTd, rowNum, colIndex);
      newTds.push(newTd);
    }
  }
  this.refresh();
  return newTds;
};


/**
 * Removes a row from the table, removing the TR element and
 * decrementing the rowspan of any cells in other rows that overlap the row.
 * @param {number} rowIndex Index of the row to delete.
 */
goog.editor.Table.prototype.removeRow = function(rowIndex) {
  var row = this.rows[rowIndex];
  if (!row) {
    goog.log.warning(this.logger_,
        "Can't remove row at position " + rowIndex + ': no such row.');
  }
  for (var i = 0, cell; cell = row.columns[i]; i += cell.colSpan) {
    if (cell.rowSpan > 1) {
      cell.setRowSpan(cell.rowSpan - 1);
      if (cell.startRow == rowIndex) {
        // Rowspanned cell started in this row - move it down to the next row.
        this.insertCellElement(cell.element, rowIndex + 1, cell.startCol);
      }
    }
  }
  row.element.parentNode.removeChild(row.element);
  this.refresh();
};


/**
 * Removes a column from the table. This is done by removing cell elements,
 * or shrinking the colspan of elements that span multiple columns.
 * @param {number} colIndex Index of the column to delete.
 */
goog.editor.Table.prototype.removeColumn = function(colIndex) {
  for (var i = 0, row; row = this.rows[i]; i++) {
    var cell = row.columns[colIndex];
    if (!cell) {
      goog.log.error(this.logger_,
          "Can't remove cell at position " + i + ', ' + colIndex +
          ': no such cell.');
    }
    if (cell.colSpan > 1) {
      cell.setColSpan(cell.colSpan - 1);
    } else {
      cell.element.parentNode.removeChild(cell.element);
    }
    // Skip over following rows that contain this same cell.
    i += cell.rowSpan - 1;
  }
  this.refresh();
};


/**
 * Merges multiple cells into a single cell, and sets the rowSpan and colSpan
 * attributes of the cell to take up the same space as the original cells.
 * @param {number} startRowIndex Top coordinate of the cells to merge.
 * @param {number} startColIndex Left coordinate of the cells to merge.
 * @param {number} endRowIndex Bottom coordinate of the cells to merge.
 * @param {number} endColIndex Right coordinate of the cells to merge.
 * @return {boolean} Whether or not the merge was possible. If the cells
 *     in the supplied coordinates can't be merged this will return false.
 */
goog.editor.Table.prototype.mergeCells = function(
    startRowIndex, startColIndex, endRowIndex, endColIndex) {
  // TODO(user): take a single goog.math.Rect parameter instead?
  var cells = [];
  var cell;
  if (startRowIndex == endRowIndex && startColIndex == endColIndex) {
    goog.log.warning(this.logger_, "Can't merge single cell");
    return false;
  }
  // Gather cells and do sanity check.
  for (var i = startRowIndex; i <= endRowIndex; i++) {
    for (var j = startColIndex; j <= endColIndex; j++) {
      cell = this.rows[i].columns[j];
      if (cell.startRow < startRowIndex ||
          cell.endRow > endRowIndex ||
          cell.startCol < startColIndex ||
          cell.endCol > endColIndex) {
        goog.log.warning(this.logger_,
            "Can't merge cells: the cell in row " + i + ', column ' + j +
            'extends outside the supplied rectangle.');
        return false;
      }
      // TODO(user): this is somewhat inefficient, as we will add
      // a reference for a cell for each position, even if it's a single
      // cell with row/colspan.
      cells.push(cell);
    }
  }
  var targetCell = cells[0];
  var targetTd = targetCell.element;
  var doc = this.dom_.getDocument();

  // Merge cell contents and discard other cells.
  for (var i = 1; cell = cells[i]; i++) {
    var td = cell.element;
    if (!td.parentNode || td == targetTd) {
      // We've already handled this cell at one of its previous positions.
      continue;
    }
    // Add a space if needed, to keep merged content from getting squished
    // together.
    if (targetTd.lastChild &&
        targetTd.lastChild.nodeType == goog.dom.NodeType.TEXT) {
      targetTd.appendChild(doc.createTextNode(' '));
    }
    var childNode;
    while ((childNode = td.firstChild)) {
      targetTd.appendChild(childNode);
    }
    td.parentNode.removeChild(td);
  }
  targetCell.setColSpan((endColIndex - startColIndex) + 1);
  targetCell.setRowSpan((endRowIndex - startRowIndex) + 1);
  if (endColIndex > startColIndex) {
    // Clear width on target cell.
    // TODO(user): instead of clearing width, calculate width
    // based on width of input cells
    targetTd.removeAttribute('width');
    targetTd.style.width = null;
  }
  this.refresh();

  return true;
};


/**
 * Splits a cell with colspans or rowspans into multiple descrete cells.
 * @param {number} rowIndex y coordinate of the cell to split.
 * @param {number} colIndex x coordinate of the cell to split.
 * @return {!Array.<Element>} Array of new cell elements created by splitting
 *     the cell.
 */
// TODO(user): support splitting only horizontally or vertically,
// support splitting cells that aren't already row/colspanned.
goog.editor.Table.prototype.splitCell = function(rowIndex, colIndex) {
  var row = this.rows[rowIndex];
  var cell = row.columns[colIndex];
  var newTds = [];
  for (var i = 0; i < cell.rowSpan; i++) {
    for (var j = 0; j < cell.colSpan; j++) {
      if (i > 0 || j > 0) {
        var newTd = this.createEmptyTd();
        this.insertCellElement(newTd, rowIndex + i, colIndex + j);
        newTds.push(newTd);
      }
    }
  }
  cell.setColSpan(1);
  cell.setRowSpan(1);
  this.refresh();
  return newTds;
};


/**
 * Inserts a cell element at the given position. The colIndex is the logical
 * column index, not the position in the dom. This takes into consideration
 * that cells in a given logical  row may actually be children of a previous
 * DOM row that have used rowSpan to extend into the row.
 * @param {Element} td The new cell element to insert.
 * @param {number} rowIndex Row in which to insert the element.
 * @param {number} colIndex Column in which to insert the element.
 */
goog.editor.Table.prototype.insertCellElement = function(
    td, rowIndex, colIndex) {
  var row = this.rows[rowIndex];
  var nextSiblingElement = null;
  for (var i = colIndex, cell; cell = row.columns[i]; i += cell.colSpan) {
    if (cell.startRow == rowIndex) {
      nextSiblingElement = cell.element;
      break;
    }
  }
  row.element.insertBefore(td, nextSiblingElement);
};


/**
 * Creates an empty TD element and fill it with some empty content so it will
 * show up with borders even in IE pre-7 or if empty-cells is set to 'hide'
 * @return {!Element} a new TD element.
 */
goog.editor.Table.prototype.createEmptyTd = function() {
  // TODO(user): more cross-browser testing to determine best
  // and least annoying filler content.
  return this.dom_.createDom(goog.dom.TagName.TD, {}, goog.string.Unicode.NBSP);
};



/**
 * Class representing a logical table row: a tr element and any cells
 * that appear in that row.
 * @param {Element} trElement This rows's underlying TR element.
 * @param {number} rowIndex This row's index in its parent table.
 * @constructor
 * @final
 */
goog.editor.TableRow = function(trElement, rowIndex) {
  this.index = rowIndex;
  this.element = trElement;
  this.columns = [];
};



/**
 * Class representing a table cell, which may span across multiple
 * rows and columns
 * @param {Element} td This cell's underlying TD or TH element.
 * @param {number} startRow Index of the row where this cell begins.
 * @param {number} startCol Index of the column where this cell begins.
 * @constructor
 * @final
 */
goog.editor.TableCell = function(td, startRow, startCol) {
  this.element = td;
  this.colSpan = parseInt(td.colSpan, 10) || 1;
  this.rowSpan = parseInt(td.rowSpan, 10) || 1;
  this.startRow = startRow;
  this.startCol = startCol;
  this.updateCoordinates_();
};


/**
 * Calculates this cell's endRow/endCol coordinates based on rowSpan/colSpan
 * @private
 */
goog.editor.TableCell.prototype.updateCoordinates_ = function() {
  this.endCol = this.startCol + this.colSpan - 1;
  this.endRow = this.startRow + this.rowSpan - 1;
};


/**
 * Set this cell's colSpan, updating both its colSpan property and the
 * underlying element's colSpan attribute.
 * @param {number} colSpan The new colSpan.
 */
goog.editor.TableCell.prototype.setColSpan = function(colSpan) {
  if (colSpan != this.colSpan) {
    if (colSpan > 1) {
      this.element.colSpan = colSpan;
    } else {
      this.element.colSpan = 1,
      this.element.removeAttribute('colSpan');
    }
    this.colSpan = colSpan;
    this.updateCoordinates_();
  }
};


/**
 * Set this cell's rowSpan, updating both its rowSpan property and the
 * underlying element's rowSpan attribute.
 * @param {number} rowSpan The new rowSpan.
 */
goog.editor.TableCell.prototype.setRowSpan = function(rowSpan) {
  if (rowSpan != this.rowSpan) {
    if (rowSpan > 1) {
      this.element.rowSpan = rowSpan.toString();
    } else {
      this.element.rowSpan = '1';
      this.element.removeAttribute('rowSpan');
    }
    this.rowSpan = rowSpan;
    this.updateCoordinates_();
  }
};


/**
 * Optimum size of empty cells (in pixels), if possible.
 * @type {number}
 */
goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH = 60;


/**
 * Maximum width for new tables.
 * @type {number}
 */
goog.editor.Table.OPTIMUM_MAX_NEW_TABLE_WIDTH = 600;


/**
 * Default color for table borders.
 * @type {string}
 */
goog.editor.Table.DEFAULT_BORDER_COLOR = '#888';


/**
 * Creates a new table element, populated with cells and formatted.
 * @param {Document} doc Document in which to create the table element.
 * @param {number} columns Number of columns in the table.
 * @param {number} rows Number of rows in the table.
 * @param {Object=} opt_tableStyle Object containing borderWidth and borderColor
 *    properties, used to set the inital style of the table.
 * @return {!Element} a table element.
 */
goog.editor.Table.createDomTable = function(
    doc, columns, rows, opt_tableStyle) {
  // TODO(user): define formatting properties as constants,
  // make separate formatTable() function
  var style = {
    borderWidth: '1',
    borderColor: goog.editor.Table.DEFAULT_BORDER_COLOR
  };
  for (var prop in opt_tableStyle) {
    style[prop] = opt_tableStyle[prop];
  }
  var dom = new goog.dom.DomHelper(doc);
  var tableElement = dom.createTable(rows, columns, true);

  var minimumCellWidth = 10;
  // Calculate a good cell width.
  var cellWidth = Math.max(
      minimumCellWidth,
      Math.min(goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH,
               goog.editor.Table.OPTIMUM_MAX_NEW_TABLE_WIDTH / columns));

  var tds = tableElement.getElementsByTagName(goog.dom.TagName.TD);
  for (var i = 0, td; td = tds[i]; i++) {
    td.style.width = cellWidth + 'px';
  }

  // Set border somewhat redundantly to make sure they show
  // up correctly in all browsers.
  goog.style.setStyle(
      tableElement, {
        'borderCollapse': 'collapse',
        'borderColor': style.borderColor,
        'borderWidth': style.borderWidth + 'px'
      });
  tableElement.border = style.borderWidth;
  tableElement.setAttribute('bordercolor', style.borderColor);
  tableElement.setAttribute('cellspacing', '0');

  return tableElement;
};
