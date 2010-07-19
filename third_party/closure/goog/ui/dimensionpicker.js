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
 * @fileoverview A dimension picker control.  A dimension picker allows the
 * user to visually select a row and column count.
 *
 * @author robbyw@google.com (Robby Walker)
*
 * @see ../demos/dimensionpicker.html
 * @see ../demos/dimensionpicker_rtl.html
 */

goog.provide('goog.ui.DimensionPicker');

goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.ui.Control');
goog.require('goog.ui.DimensionPickerRenderer');
goog.require('goog.ui.registry');


/**
 * A dimension picker allows the user to visually select a row and column
 * count using their mouse and keyboard.
 *
 * The currently selected dimension is controlled by an ACTION event.  Event
 * listeners may retrieve the selected item using the
 * {@link #getValue} method.
 *
 * @param {goog.ui.DimensionPickerRenderer=} opt_renderer Renderer used to
 *     render or decorate the palette; defaults to
 *     {@link goog.ui.DimensionPickerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.DimensionPicker = function(opt_renderer, opt_domHelper) {
 goog.ui.Control.call(this, null,
      opt_renderer || goog.ui.DimensionPickerRenderer.getInstance(),
      opt_domHelper);

  this.size_ = new goog.math.Size(this.minColumns, this.minRows);
};
goog.inherits(goog.ui.DimensionPicker, goog.ui.Control);


/**
 * Minimum number of columns to show in the grid.
 * @type {number}
 */
goog.ui.DimensionPicker.prototype.minColumns = 5;


/**
 * Minimum number of rows to show in the grid.
 * @type {number}
 */
goog.ui.DimensionPicker.prototype.minRows = 5;


/**
 * Maximum number of columns to show in the grid.
 * @type {number}
 */
goog.ui.DimensionPicker.prototype.maxColumns = 20;


/**
 * Maximum number of rows to show in the grid.
 * @type {number}
 */
goog.ui.DimensionPicker.prototype.maxRows = 20;


/**
 * Palette dimensions (columns x rows).
 * @type {goog.math.Size}
 * @private
 */
goog.ui.DimensionPicker.prototype.size_;


/**
 * Currently highlighted row count.
 * @type {number}
 * @private
 */
goog.ui.DimensionPicker.prototype.highlightedRows_ = 0;


/**
 * Currently highlighted column count.
 * @type {number}
 * @private
 */
goog.ui.DimensionPicker.prototype.highlightedColumns_ = 0;


/** @inheritDoc */
goog.ui.DimensionPicker.prototype.enterDocument = function() {
  goog.ui.DimensionPicker.superClass_.enterDocument.call(this);

  var handler = this.getHandler();
  handler.
      listen(this.getRenderer().getMouseMoveElement(this),
          goog.events.EventType.MOUSEMOVE, this.handleMouseMove).
      listen(this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
          this.handleWindowResize);

  var parent = this.getParent();
  if (parent) {
    handler.listen(parent, goog.ui.Component.EventType.SHOW, this.handleShow_);
  }
};


/** @inheritDoc */
goog.ui.DimensionPicker.prototype.exitDocument = function() {
  goog.ui.DimensionPicker.superClass_.exitDocument.call(this);

  var handler = this.getHandler();
  handler.
      unlisten(this.getRenderer().getMouseMoveElement(this),
          goog.events.EventType.MOUSEMOVE, this.handleMouseMove).
      unlisten(this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
          this.handleWindowResize);

  var parent = this.getParent();
  if (parent) {
    handler.unlisten(parent, goog.ui.Component.EventType.SHOW,
        this.handleShow_);
  }
};


/**
 * Resets the highlighted size when the picker is shown.
 * @private
 */
goog.ui.DimensionPicker.prototype.handleShow_ = function() {
  if (this.isVisible()) {
    this.setValue(0, 0);
  }
};


/** @inheritDoc */
goog.ui.DimensionPicker.prototype.disposeInternal = function() {
  goog.ui.DimensionPicker.superClass_.disposeInternal.call(this);
  delete this.size_;
};


// Palette event handling.


/**
 * Handles mousemove events.  Determines which palette size was moused over and
 * highlights it.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @protected
 */
goog.ui.DimensionPicker.prototype.handleMouseMove = function(e) {
  var highlightedSizeX = this.getRenderer().getGridOffsetX(this,
      this.isRightToLeft() ? e.target.offsetWidth - e.offsetX : e.offsetX);
  var highlightedSizeY = this.getRenderer().getGridOffsetY(this, e.offsetY);

  if (this.highlightedColumns_ != highlightedSizeX ||
      this.highlightedRows_ != highlightedSizeY) {
    this.setValue(highlightedSizeX, highlightedSizeY);
  }
};


/**
 * Handles window resize events.  Ensures no scrollbars are introduced by the
 * renderer's mouse catcher.
 * @param {goog.events.Event} e Resize event to handle.
 * @protected
 */
goog.ui.DimensionPicker.prototype.handleWindowResize = function(e) {
  this.getRenderer().positionMouseCatcher(this);
};


/**
 * Handle key events if supported, so the user can use the keyboard to
 * manipulate the highlighted rows and columns.
 * @param {goog.events.KeyEvent} e The key event object.
 * @return {boolean} Whether the key event was handled.
 */
goog.ui.DimensionPicker.prototype.handleKeyEvent = function(e) {
  var rows = this.highlightedRows_;
  var columns = this.highlightedColumns_;
  switch (e.keyCode) {
    case goog.events.KeyCodes.DOWN:
      rows = Math.min(this.maxRows, rows + 1);
      break;
    case goog.events.KeyCodes.UP:
      rows = Math.max(1, rows - 1);
      break;
    case goog.events.KeyCodes.LEFT:
      if (columns == 1) {
        // Delegate to parent.
        return false;
      } else {
        columns = Math.max(1, columns - 1);
      }
      break;
    case goog.events.KeyCodes.RIGHT:
      columns = Math.min(this.maxColumns, columns + 1);
      break;
    default:
      return goog.ui.DimensionPicker.superClass_.handleKeyEvent.call(this, e);
  }
  this.setValue(columns, rows);
  return true;
};


// Palette management.


/**
 * @return {goog.math.Size} Current table size shown (columns x rows).
 */
goog.ui.DimensionPicker.prototype.getSize = function() {
  return this.size_;
};


/**
 * @return {goog.math.Size} size The currently highlighted dimensions.
 */
goog.ui.DimensionPicker.prototype.getValue = function() {
  return new goog.math.Size(this.highlightedColumns_, this.highlightedRows_);
};


/**
 * Sets the currently highlighted dimensions.
 * @param {number} columns The number of columns to highlight, or a
 *     goog.math.Size object containing both.
 * @param {number=} opt_rows The number of rows to highlight.  Can be
 *     omitted when columns is a good.math.Size object.
 */
goog.ui.DimensionPicker.prototype.setValue = function(columns,
    opt_rows) {
  if (!goog.isDef(opt_rows)) {
    opt_rows = columns.height;
    columns = columns.width;
  }

  if (this.highlightedColumns_ != columns ||
      this.highlightedRows_ != opt_rows) {
    var renderer = this.getRenderer();
    this.size_.width = Math.max(columns, this.minColumns);
    this.size_.height = Math.max(opt_rows, this.minRows);
    renderer.updateSize(this, this.getElement());

    this.highlightedColumns_ = columns;
    this.highlightedRows_ = opt_rows;
    renderer.setHighlightedSize(this, columns, opt_rows);
  }
};


/**
 * Register this control so it can be created from markup
 */
goog.ui.registry.setDecoratorByClassName(
    goog.ui.DimensionPickerRenderer.CSS_CLASS,
    function() {
      return new goog.ui.DimensionPicker();
    });
