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
 * @fileoverview Plugin that enables table editing.
 *
 * @see ../../demos/editor/tableeditor.html
 */

goog.provide('goog.editor.plugins.TableEditor');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.Table');
goog.require('goog.editor.node');
goog.require('goog.editor.range');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * Plugin that adds support for table creation and editing commands.
 * @constructor
 * @extends {goog.editor.Plugin}
 * @final
 */
goog.editor.plugins.TableEditor = function() {
  goog.editor.plugins.TableEditor.base(this, 'constructor');

  /**
   * The array of functions that decide whether a table element could be
   * editable by the user or not.
   * @type {Array<function(Element):boolean>}
   * @private
   */
  this.isTableEditableFunctions_ = [];

  /**
   * The pre-bound function that decides whether a table element could be
   * editable by the user or not overall.
   * @type {function(Node):boolean}
   * @private
   */
  this.isUserEditableTableBound_ = goog.bind(this.isUserEditableTable_, this);
};
goog.inherits(goog.editor.plugins.TableEditor, goog.editor.Plugin);


/** @override */
// TODO(user): remove this once there's a sensible default
// implementation in the base Plugin.
goog.editor.plugins.TableEditor.prototype.getTrogClassId = function() {
  return String(goog.getUid(this.constructor));
};


/**
 * Commands supported by goog.editor.plugins.TableEditor.
 * @enum {string}
 */
goog.editor.plugins.TableEditor.COMMAND = {
  TABLE: '+table',
  INSERT_ROW_AFTER: '+insertRowAfter',
  INSERT_ROW_BEFORE: '+insertRowBefore',
  INSERT_COLUMN_AFTER: '+insertColumnAfter',
  INSERT_COLUMN_BEFORE: '+insertColumnBefore',
  REMOVE_ROWS: '+removeRows',
  REMOVE_COLUMNS: '+removeColumns',
  SPLIT_CELL: '+splitCell',
  MERGE_CELLS: '+mergeCells',
  REMOVE_TABLE: '+removeTable'
};


/**
 * Inverse map of execCommand strings to
 * {@link goog.editor.plugins.TableEditor.COMMAND} constants. Used to
 * determine whether a string corresponds to a command this plugin handles
 * in O(1) time.
 * @type {Object}
 * @private
 */
goog.editor.plugins.TableEditor.SUPPORTED_COMMANDS_ =
    goog.object.transpose(goog.editor.plugins.TableEditor.COMMAND);


/**
 * Whether the string corresponds to a command this plugin handles.
 * @param {string} command Command string to check.
 * @return {boolean} Whether the string corresponds to a command
 *     this plugin handles.
 * @override
 */
goog.editor.plugins.TableEditor.prototype.isSupportedCommand = function(
    command) {
  return command in goog.editor.plugins.TableEditor.SUPPORTED_COMMANDS_;
};


/** @override */
goog.editor.plugins.TableEditor.prototype.enable = function(fieldObject) {
  goog.editor.plugins.TableEditor.base(this, 'enable', fieldObject);

  // enableObjectResizing is supported only for Gecko.
  // You can refer to http://qooxdoo.org/contrib/project/htmlarea/html_editing
  // for a compatibility chart.
  if (goog.userAgent.GECKO) {
    var doc = this.getFieldDomHelper().getDocument();
    doc.execCommand('enableObjectResizing', false, 'true');
  }
};


/**
 * Returns the currently selected table.
 * @return {Element?} The table in which the current selection is
 *     contained, or null if there isn't such a table.
 * @private
 */
goog.editor.plugins.TableEditor.prototype.getCurrentTable_ = function() {
  var selectedElement = this.getFieldObject().getRange().getContainer();
  return this.getAncestorTable_(selectedElement);
};


/**
 * Finds the first user-editable table element in the input node's ancestors.
 * @param {Node?} node The node to start with.
 * @return {Element?} The table element that is closest ancestor of the node.
 * @private
 */
goog.editor.plugins.TableEditor.prototype.getAncestorTable_ = function(node) {
  var ancestor =
      goog.dom.getAncestor(node, this.isUserEditableTableBound_, true);
  if (goog.editor.node.isEditable(ancestor)) {
    return /** @type {Element?} */ (ancestor);
  } else {
    return null;
  }
};


/**
 * Returns the current value of a given command. Currently this plugin
 * only returns a value for goog.editor.plugins.TableEditor.COMMAND.TABLE.
 * @override
 */
goog.editor.plugins.TableEditor.prototype.queryCommandValue = function(
    command) {
  if (command == goog.editor.plugins.TableEditor.COMMAND.TABLE) {
    return !!this.getCurrentTable_();
  }
};


/** @override */
goog.editor.plugins.TableEditor.prototype.execCommandInternal = function(
    command, opt_arg) {
  var result = null;
  // TD/TH in which to place the cursor, if the command destroys the current
  // cursor position.
  var cursorCell = null;
  var range = this.getFieldObject().getRange();
  if (command == goog.editor.plugins.TableEditor.COMMAND.TABLE) {
    // Don't create a table if the cursor isn't in an editable region.
    if (!goog.editor.range.isEditable(range)) {
      return null;
    }
    // Create the table.
    var tableProps = opt_arg || {width: 4, height: 2};
    var doc = this.getFieldDomHelper().getDocument();
    var table = goog.editor.Table.createDomTable(
        doc, tableProps.width, tableProps.height);
    range.replaceContentsWithNode(table);
    // In IE, replaceContentsWithNode uses pasteHTML, so we lose our reference
    // to the inserted table.
    // TODO(user): use the reference to the table element returned from
    // replaceContentsWithNode.
    if (!goog.userAgent.IE) {
      cursorCell = table.getElementsByTagName(goog.dom.TagName.TD)[0];
    }
  } else {
    var cellSelection = new goog.editor.plugins.TableEditor.CellSelection_(
        range, goog.bind(this.getAncestorTable_, this));
    var table = cellSelection.getTable();
    if (!table) {
      return null;
    }
    switch (command) {
      case goog.editor.plugins.TableEditor.COMMAND.INSERT_ROW_BEFORE:
        table.insertRow(cellSelection.getFirstRowIndex());
        break;
      case goog.editor.plugins.TableEditor.COMMAND.INSERT_ROW_AFTER:
        table.insertRow(cellSelection.getLastRowIndex() + 1);
        break;
      case goog.editor.plugins.TableEditor.COMMAND.INSERT_COLUMN_BEFORE:
        table.insertColumn(cellSelection.getFirstColumnIndex());
        break;
      case goog.editor.plugins.TableEditor.COMMAND.INSERT_COLUMN_AFTER:
        table.insertColumn(cellSelection.getLastColumnIndex() + 1);
        break;
      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_ROWS:
        var startRow = cellSelection.getFirstRowIndex();
        var endRow = cellSelection.getLastRowIndex();
        if (startRow == 0 && endRow == (table.rows.length - 1)) {
          // Instead of deleting all rows, delete the entire table.
          return this.execCommandInternal(
              goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE);
        }
        var startColumn = cellSelection.getFirstColumnIndex();
        var rowCount = (endRow - startRow) + 1;
        for (var i = 0; i < rowCount; i++) {
          table.removeRow(startRow);
        }
        if (table.rows.length > 0) {
          // Place cursor in the previous/first row.
          var closestRow = Math.min(startRow, table.rows.length - 1);
          cursorCell = table.rows[closestRow].columns[startColumn].element;
        }
        break;
      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_COLUMNS:
        var startCol = cellSelection.getFirstColumnIndex();
        var endCol = cellSelection.getLastColumnIndex();
        if (startCol == 0 && endCol == (table.rows[0].columns.length - 1)) {
          // Instead of deleting all columns, delete the entire table.
          return this.execCommandInternal(
              goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE);
        }
        var startRow = cellSelection.getFirstRowIndex();
        var removeCount = (endCol - startCol) + 1;
        for (var i = 0; i < removeCount; i++) {
          table.removeColumn(startCol);
        }
        var currentRow = table.rows[startRow];
        if (currentRow) {
          // Place cursor in the previous/first column.
          var closestCol = Math.min(startCol, currentRow.columns.length - 1);
          cursorCell = currentRow.columns[closestCol].element;
        }
        break;
      case goog.editor.plugins.TableEditor.COMMAND.MERGE_CELLS:
        if (cellSelection.isRectangle()) {
          table.mergeCells(
              cellSelection.getFirstRowIndex(),
              cellSelection.getFirstColumnIndex(),
              cellSelection.getLastRowIndex(),
              cellSelection.getLastColumnIndex());
        }
        break;
      case goog.editor.plugins.TableEditor.COMMAND.SPLIT_CELL:
        if (cellSelection.containsSingleCell()) {
          table.splitCell(
              cellSelection.getFirstRowIndex(),
              cellSelection.getFirstColumnIndex());
        }
        break;
      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE:
        table.element.parentNode.removeChild(table.element);
        break;
      default:
    }
  }
  if (cursorCell) {
    range = goog.dom.Range.createFromNodeContents(cursorCell);
    range.collapse(false);
    range.select();
  }
  return result;
};


/**
 * Checks whether the element is a table editable by the user.
 * @param {Node} element The element in question.
 * @return {boolean} Whether the element is a table editable by the user.
 * @private
 */
goog.editor.plugins.TableEditor.prototype.isUserEditableTable_ = function(
    element) {
  // Default implementation.
  if (element.tagName != goog.dom.TagName.TABLE) {
    return false;
  }

  // Check for extra user-editable filters.
  return goog.array.every(this.isTableEditableFunctions_, function(func) {
    return func(/** @type {Element} */ (element));
  });
};


/**
 * Adds a function to filter out non-user-editable tables.
 * @param {function(Element):boolean} func A function to decide whether the
 *   table element could be editable by the user or not.
 */
goog.editor.plugins.TableEditor.prototype.addIsTableEditableFunction = function(
    func) {
  goog.array.insert(this.isTableEditableFunctions_, func);
};



/**
 * Class representing the selected cell objects within a single  table.
 * @param {goog.dom.AbstractRange} range Selected range from which to calculate
 *     selected cells.
 * @param {function(Element):Element?} getParentTableFunction A function that
 *     finds the user-editable table from a given element.
 * @constructor
 * @private
 */
goog.editor.plugins.TableEditor.CellSelection_ = function(
    range, getParentTableFunction) {
  this.cells_ = [];

  // Mozilla lets users select groups of cells, with each cell showing
  // up as a separate range in the selection. goog.dom.Range doesn't
  // currently support this.
  // TODO(user): support this case in range.js
  var selectionContainer = range.getContainerElement();
  var elementInSelection = function(node) {
    // TODO(user): revert to the more liberal containsNode(node, true),
    // which will match partially-selected cells. We're using
    // containsNode(node, false) at the moment because otherwise it's
    // broken in WebKit due to a closure range bug.
    return selectionContainer == node ||
        selectionContainer.parentNode == node ||
        range.containsNode(node, false);
  };

  var parentTableElement =
      selectionContainer && getParentTableFunction(selectionContainer);
  if (!parentTableElement) {
    return;
  }

  var parentTable = new goog.editor.Table(parentTableElement);
  // It's probably not possible to select a table with no cells, but
  // do a sanity check anyway.
  if (!parentTable.rows.length || !parentTable.rows[0].columns.length) {
    return;
  }
  // Loop through cells to calculate dimensions for this CellSelection.
  for (var i = 0, row; row = parentTable.rows[i]; i++) {
    for (var j = 0, cell; cell = row.columns[j]; j++) {
      if (elementInSelection(cell.element)) {
        // Update dimensions based on cell.
        if (!this.cells_.length) {
          this.firstRowIndex_ = cell.startRow;
          this.lastRowIndex_ = cell.endRow;
          this.firstColIndex_ = cell.startCol;
          this.lastColIndex_ = cell.endCol;
        } else {
          this.firstRowIndex_ = Math.min(this.firstRowIndex_, cell.startRow);
          this.lastRowIndex_ = Math.max(this.lastRowIndex_, cell.endRow);
          this.firstColIndex_ = Math.min(this.firstColIndex_, cell.startCol);
          this.lastColIndex_ = Math.max(this.lastColIndex_, cell.endCol);
        }
        this.cells_.push(cell);
      }
    }
  }
  this.parentTable_ = parentTable;
};


/**
 * Returns the EditableTable object of which this selection's cells are a
 * subset.
 * @return {!goog.editor.Table} the table.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getTable = function() {
  return this.parentTable_;
};


/**
 * Returns the row index of the uppermost cell in this selection.
 * @return {number} The row index.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getFirstRowIndex =
    function() {
  return this.firstRowIndex_;
};


/**
 * Returns the row index of the lowermost cell in this selection.
 * @return {number} The row index.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getLastRowIndex =
    function() {
  return this.lastRowIndex_;
};


/**
 * Returns the column index of the farthest left cell in this selection.
 * @return {number} The column index.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getFirstColumnIndex =
    function() {
  return this.firstColIndex_;
};


/**
 * Returns the column index of the farthest right cell in this selection.
 * @return {number} The column index.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getLastColumnIndex =
    function() {
  return this.lastColIndex_;
};


/**
 * Returns the cells in this selection.
 * @return {!Array<Element>} Cells in this selection.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.getCells = function() {
  return this.cells_;
};


/**
 * Returns a boolean value indicating whether or not the cells in this
 * selection form a rectangle.
 * @return {boolean} Whether the selection forms a rectangle.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.isRectangle =
    function() {
  // TODO(user): check for missing cells. Right now this returns
  // whether all cells in the selection are in the rectangle, but doesn't
  // verify that every expected cell is present.
  if (!this.cells_.length) {
    return false;
  }
  var firstCell = this.cells_[0];
  var lastCell = this.cells_[this.cells_.length - 1];
  return !(
      this.firstRowIndex_ < firstCell.startRow ||
      this.lastRowIndex_ > lastCell.endRow ||
      this.firstColIndex_ < firstCell.startCol ||
      this.lastColIndex_ > lastCell.endCol);
};


/**
 * Returns a boolean value indicating whether or not there is exactly
 * one cell in this selection. Note that this may not be the same as checking
 * whether getCells().length == 1; if there is a single cell with
 * rowSpan/colSpan set it will appear multiple times.
 * @return {boolean} Whether there is exatly one cell in this selection.
 */
goog.editor.plugins.TableEditor.CellSelection_.prototype.containsSingleCell =
    function() {
  var cellCount = this.cells_.length;
  return cellCount > 0 && (this.cells_[0] == this.cells_[cellCount - 1]);
};
