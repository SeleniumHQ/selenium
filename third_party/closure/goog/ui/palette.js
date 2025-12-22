/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A palette control.  A palette is a grid that the user can
 * highlight or select via the keyboard or the mouse.
 *
 * @see ../demos/palette.html
 */

goog.provide('goog.ui.Palette');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.PaletteRenderer');
goog.require('goog.ui.SelectionModel');
goog.requireType('goog.events.BrowserEvent');
goog.requireType('goog.events.Event');
goog.requireType('goog.events.KeyEvent');
goog.requireType('goog.ui.ControlContent');



/**
 * A palette is a grid of DOM nodes that the user can highlight or select via
 * the keyboard or the mouse.  The selection state of the palette is controlled
 * an ACTION event.  Event listeners may retrieve the selected item using the
 * {@link #getSelectedItem} or {@link #getSelectedIndex} method.
 *
 * Use this class as the base for components like color palettes or emoticon
 * pickers.  Use {@link #setContent} to set/change the items in the palette
 * after construction.  See palette.html demo for example usage.
 *
 * @param {Array<Node>} items Array of DOM nodes to be displayed as items
 *     in the palette grid (limited to one per cell).
 * @param {goog.ui.PaletteRenderer=} opt_renderer Renderer used to render or
 *     decorate the palette; defaults to {@link goog.ui.PaletteRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Palette = function(items, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Palette.base(
      this, 'constructor', items,
      opt_renderer || goog.ui.PaletteRenderer.getInstance(), opt_domHelper);
  this.setAutoStates(
      goog.ui.Component.State.CHECKED | goog.ui.Component.State.SELECTED |
          goog.ui.Component.State.OPENED,
      false);

  /**
   * A fake component for dispatching events on palette cell changes.
   * @type {!goog.ui.Palette.CurrentCell_}
   * @private
   */
  this.currentCellControl_ = new goog.ui.Palette.CurrentCell_();
  this.currentCellControl_.setParentEventTarget(this);

  /**
   * @private {number} The last highlighted index, or -1 if it never had one.
   */
  this.lastHighlightedIndex_ = -1;
};
goog.inherits(goog.ui.Palette, goog.ui.Control);


/**
 * Events fired by the palette object
 * @enum {string}
 */
goog.ui.Palette.EventType = {
  AFTER_HIGHLIGHT: goog.events.getUniqueId('afterhighlight')
};


/**
 * Palette dimensions (columns x rows).  If the number of rows is undefined,
 * it is calculated on first use.
 * @type {?goog.math.Size}
 * @private
 */
goog.ui.Palette.prototype.size_ = null;


/**
 * Index of the currently highlighted item (-1 if none).
 * @type {number}
 * @private
 */
goog.ui.Palette.prototype.highlightedIndex_ = -1;


/**
 * Selection model controlling the palette's selection state.
 * @type {?goog.ui.SelectionModel}
 * @private
 */
goog.ui.Palette.prototype.selectionModel_ = null;


// goog.ui.Component / goog.ui.Control implementation.


/** @override */
goog.ui.Palette.prototype.disposeInternal = function() {
  'use strict';
  goog.ui.Palette.superClass_.disposeInternal.call(this);

  if (this.selectionModel_) {
    this.selectionModel_.dispose();
    this.selectionModel_ = null;
  }

  this.size_ = null;

  this.currentCellControl_.dispose();
};


/**
 * Overrides {@link goog.ui.Control#setContentInternal} by also updating the
 * grid size and the selection model.  Considered protected.
 * @param {goog.ui.ControlContent} content Array of DOM nodes to be displayed
 *     as items in the palette grid (one item per cell).
 * @protected
 * @override
 */
goog.ui.Palette.prototype.setContentInternal = function(content) {
  'use strict';
  var items = /** @type {Array<Node>} */ (content);
  goog.ui.Palette.superClass_.setContentInternal.call(this, items);

  // Adjust the palette size.
  this.adjustSize_();

  // Add the items to the selection model, replacing previous items (if any).
  if (this.selectionModel_) {
    // We already have a selection model; just replace the items.
    this.selectionModel_.clear();
    this.selectionModel_.addItems(items);
  } else {
    // Create a selection model, initialize the items, and hook up handlers.
    this.selectionModel_ = new goog.ui.SelectionModel(items);
    this.selectionModel_.setSelectionHandler(goog.bind(this.selectItem_, this));
    this.getHandler().listen(
        this.selectionModel_, goog.events.EventType.SELECT,
        this.handleSelectionChange);
  }

  // In all cases, clear the highlight.
  this.highlightedIndex_ = -1;
};


/**
 * Overrides {@link goog.ui.Control#getCaption} to return the empty string,
 * since palettes don't have text captions.
 * @return {string} The empty string.
 * @override
 */
goog.ui.Palette.prototype.getCaption = function() {
  'use strict';
  return '';
};


/**
 * Overrides {@link goog.ui.Control#setCaption} to be a no-op, since palettes
 * don't have text captions.
 * @param {string} caption Ignored.
 * @override
 */
goog.ui.Palette.prototype.setCaption = function(caption) {
  // Do nothing.
};


// Palette event handling.


/**
 * Handles mouseover events.  Overrides {@link goog.ui.Control#handleMouseOver}
 * by determining which palette item (if any) was moused over, highlighting it,
 * and un-highlighting any previously-highlighted item.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @override
 */
goog.ui.Palette.prototype.handleMouseOver = function(e) {
  'use strict';
  goog.ui.Palette.superClass_.handleMouseOver.call(this, e);

  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  var item = this.getRenderer().getContainingItem(this, e.target);
  if (item && e.relatedTarget && goog.dom.contains(item, e.relatedTarget)) {
    // Ignore internal mouse moves.
    return;
  }

  if (item != this.getHighlightedItem()) {
    this.setHighlightedItem(item);
  }
};


/**
 * Handles mousedown events.  Overrides {@link goog.ui.Control#handleMouseDown}
 * by ensuring that the item on which the user moused down is highlighted.
 * @param {goog.events.Event} e Mouse event to handle.
 * @override
 */
goog.ui.Palette.prototype.handleMouseDown = function(e) {
  'use strict';
  goog.ui.Palette.superClass_.handleMouseDown.call(this, e);

  if (this.isActive()) {
    // Make sure we move the highlight to the cell on which the user moused
    // down.
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    var item = this.getRenderer().getContainingItem(this, e.target);
    if (item != this.getHighlightedItem()) {
      this.setHighlightedItem(item);
    }
  }
};


/**
 * Selects the currently highlighted palette item (triggered by mouseup or by
 * keyboard action).  Overrides {@link goog.ui.Control#performActionInternal}
 * by selecting the highlighted item and dispatching an ACTION event.
 * @param {goog.events.Event} e Mouse or key event that triggered the action.
 * @return {boolean} True if the action was allowed to proceed, false otherwise.
 * @override
 */
goog.ui.Palette.prototype.performActionInternal = function(e) {
  'use strict';
  var highlightedItem = this.getHighlightedItem();
  if (highlightedItem) {
    if (e && this.shouldSelectHighlightedItem_(e)) {
      this.setSelectedItem(highlightedItem);
    }
    return goog.ui.Palette.base(this, 'performActionInternal', e);
  }
  return false;
};


/**
 * Determines whether to select the highlighted item while handling an internal
 * action. The highlighted item should not be selected if the action is a mouse
 * event occurring outside the palette or in an "empty" cell.
 * @param {!goog.events.Event} e Mouseup or key event being handled.
 * @return {boolean} True if the highlighted item should be selected.
 * @private
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Palette.prototype.shouldSelectHighlightedItem_ = function(e) {
  'use strict';
  if (!this.getSelectedItem()) {
    // It's always ok to select when nothing is selected yet.
    return true;
  } else if (e.type != 'mouseup') {
    // Keyboard can only act on valid cells.
    return true;
  } else {
    // Return whether or not the mouse action was in the palette.
    return !!this.getRenderer().getContainingItem(this, e.target);
  }
};


/**
 * Handles keyboard events dispatched while the palette has focus.  Moves the
 * highlight on arrow keys, and selects the highlighted item on Enter or Space.
 * Returns true if the event was handled, false otherwise.  In particular, if
 * the user attempts to navigate out of the grid, the highlight isn't changed,
 * and this method returns false; it is then up to the parent component to
 * handle the event (e.g. by wrapping the highlight around).  Overrides {@link
 * goog.ui.Control#handleKeyEvent}.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} True iff the key event was handled by the component.
 * @override
 */
goog.ui.Palette.prototype.handleKeyEvent = function(e) {
  'use strict';
  var items = this.getContent();
  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  var numItems = items ? items.length : 0;
  var numColumns = this.size_.width;

  // If the component is disabled or the palette is empty, bail.
  if (numItems == 0 || !this.isEnabled()) {
    return false;
  }

  // User hit ENTER or SPACE; trigger action.
  if (e.keyCode == goog.events.KeyCodes.ENTER ||
      e.keyCode == goog.events.KeyCodes.SPACE) {
    return this.performActionInternal(e);
  }

  // User hit HOME or END; move highlight.
  if (e.keyCode == goog.events.KeyCodes.HOME) {
    this.setHighlightedIndexInternal_(0, true /* scrollIntoView */);
    return true;
  } else if (e.keyCode == goog.events.KeyCodes.END) {
    this.setHighlightedIndexInternal_(numItems - 1, true /* scrollIntoView */);
    return true;
  }

  // If nothing is highlighted, start from the selected index.  If nothing is
  // selected either, highlightedIndex is -1.
  var highlightedIndex = this.highlightedIndex_ < 0 ? this.getSelectedIndex() :
                                                      this.highlightedIndex_;

  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      // If the highlighted index is uninitialized, or is at the beginning, move
      // it to the end.
      if (highlightedIndex == -1 || highlightedIndex == 0) {
        highlightedIndex = numItems;
      }
      this.setHighlightedIndexInternal_(
          highlightedIndex - 1, true /* scrollIntoView */);
      e.preventDefault();
      return true;
      break;

    case goog.events.KeyCodes.RIGHT:
      // If the highlighted index at the end, move it to the beginning.
      if (highlightedIndex == numItems - 1) {
        highlightedIndex = -1;
      }
      this.setHighlightedIndexInternal_(
          highlightedIndex + 1, true /* scrollIntoView */);
      e.preventDefault();
      return true;
      break;

    case goog.events.KeyCodes.UP:
      if (highlightedIndex == -1) {
        highlightedIndex = numItems + numColumns - 1;
      }
      if (highlightedIndex >= numColumns) {
        this.setHighlightedIndexInternal_(
            highlightedIndex - numColumns, true /* scrollIntoView */);
        e.preventDefault();
        return true;
      }
      break;

    case goog.events.KeyCodes.DOWN:
      if (highlightedIndex == -1) {
        highlightedIndex = -numColumns;
      }
      if (highlightedIndex < numItems - numColumns) {
        this.setHighlightedIndexInternal_(
            highlightedIndex + numColumns, true /* scrollIntoView */);
        e.preventDefault();
        return true;
      }
      break;
  }

  return false;
};


/**
 * Handles selection change events dispatched by the selection model.
 * @param {goog.events.Event} e Selection event to handle.
 */
goog.ui.Palette.prototype.handleSelectionChange = function(e) {
  // No-op in the base class.
};


// Palette management.


/**
 * Returns the size of the palette grid.
 * @return {goog.math.Size} Palette size (columns x rows).
 */
goog.ui.Palette.prototype.getSize = function() {
  'use strict';
  return this.size_;
};


/**
 * Sets the size of the palette grid to the given size.  Callers can either
 * pass a single {@link goog.math.Size} or a pair of numbers (first the number
 * of columns, then the number of rows) to this method.  In both cases, the
 * number of rows is optional and will be calculated automatically if needed.
 * It is an error to attempt to change the size of the palette after it has
 * been rendered.
 * @param {goog.math.Size|number} size Either a size object or the number of
 *     columns.
 * @param {number=} opt_rows The number of rows (optional).
 */
goog.ui.Palette.prototype.setSize = function(size, opt_rows) {
  'use strict';
  if (this.getElement()) {
    throw new Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  this.size_ = (typeof size === 'number') ?
      new goog.math.Size(size, /** @type {number} */ (opt_rows)) :
      size;

  // Adjust size, if needed.
  this.adjustSize_();
};


/**
 * Returns the 0-based index of the currently highlighted palette item, or -1
 * if no item is highlighted.
 * @return {number} Index of the highlighted item (-1 if none).
 */
goog.ui.Palette.prototype.getHighlightedIndex = function() {
  'use strict';
  return this.highlightedIndex_;
};


/**
 * Returns the currently highlighted palette item, or null if no item is
 * highlighted.
 * @return {Node} The highlighted item (undefined if none).
 */
goog.ui.Palette.prototype.getHighlightedItem = function() {
  'use strict';
  var items = this.getContent();
  return items && items[this.highlightedIndex_];
};


/**
 * @return {Element} The highlighted cell.
 * @private
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Palette.prototype.getHighlightedCellElement_ = function() {
  'use strict';
  return this.getRenderer().getCellForItem(this.getHighlightedItem());
};


/**
 * Highlights the item at the given 0-based index, or removes the highlight
 * if the argument is -1 or out of range.  Any previously-highlighted item
 * will be un-highlighted.
 * @param {number} index 0-based index of the item to highlight.
 */
goog.ui.Palette.prototype.setHighlightedIndex = function(index) {
  'use strict';
  this.setHighlightedIndexInternal_(index, false /* scrollIntoView */);
};


/**
 * @param {number} index 0-based index of the item to highlight.
 * @param {boolean} scrollIntoView Whether to bring the highlighted item into
 *     view by potentially scrolling the palette's container. This has no effect
 *     if the palette is not in a scrollbale container.
 * @private
 */
goog.ui.Palette.prototype.setHighlightedIndexInternal_ = function(
    index, scrollIntoView) {
  'use strict';
  if (index != this.highlightedIndex_) {
    this.highlightIndex_(this.highlightedIndex_, false);
    this.lastHighlightedIndex_ = this.highlightedIndex_;
    this.highlightedIndex_ = index;
    this.highlightIndex_(index, true);
    if (scrollIntoView && this.getParent()) {
      var highlightedElement = goog.asserts.assert(
          this.getHighlightedCellElement_(),
          'Highlighted item must exist to scroll to make it visible in ' +
              'container. Please check that index is non-negative and valid.');
      goog.style.scrollIntoContainerView(
          highlightedElement, this.getParent().getElementStrict());
    }
    this.dispatchEvent(goog.ui.Palette.EventType.AFTER_HIGHLIGHT);
  }
};


/**
 * Highlights the given item, or removes the highlight if the argument is null
 * or invalid.  Any previously-highlighted item will be un-highlighted.
 * @param {Node|undefined} item Item to highlight.
 */
goog.ui.Palette.prototype.setHighlightedItem = function(item) {
  'use strict';
  var items = /** @type {Array<Node>} */ (this.getContent());
  this.setHighlightedIndex((items && item) ? items.indexOf(item) : -1);
};


/**
 * Returns the 0-based index of the currently selected palette item, or -1
 * if no item is selected.
 * @return {number} Index of the selected item (-1 if none).
 */
goog.ui.Palette.prototype.getSelectedIndex = function() {
  'use strict';
  return this.selectionModel_ ? this.selectionModel_.getSelectedIndex() : -1;
};


/**
 * Returns the currently selected palette item, or null if no item is selected.
 * @return {Node} The selected item (null if none).
 */
goog.ui.Palette.prototype.getSelectedItem = function() {
  'use strict';
  return this.selectionModel_ ?
      /** @type {Node} */ (this.selectionModel_.getSelectedItem()) :
      null;
};


/**
 * Selects the item at the given 0-based index, or clears the selection
 * if the argument is -1 or out of range.  Any previously-selected item
 * will be deselected.
 * @param {number} index 0-based index of the item to select.
 */
goog.ui.Palette.prototype.setSelectedIndex = function(index) {
  'use strict';
  if (this.selectionModel_) {
    this.selectionModel_.setSelectedIndex(index);
  }
};


/**
 * Selects the given item, or clears the selection if the argument is null or
 * invalid.  Any previously-selected item will be deselected.
 * @param {Node} item Item to select.
 */
goog.ui.Palette.prototype.setSelectedItem = function(item) {
  'use strict';
  if (this.selectionModel_) {
    this.selectionModel_.setSelectedItem(item);
  }
};


/**
 * Private helper; highlights or un-highlights the item at the given index
 * based on the value of the Boolean argument.  This implementation simply
 * applies highlight styling to the cell containing the item to be highighted.
 * Does nothing if the palette hasn't been rendered yet.
 * @param {number} index 0-based index of item to highlight or un-highlight.
 * @param {boolean} highlight If true, the item is highlighted; otherwise it
 *     is un-highlighted.
 * @private
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Palette.prototype.highlightIndex_ = function(index, highlight) {
  'use strict';
  if (this.getElement()) {
    var items = this.getContent();
    if (items && index >= 0 && index < items.length) {
      var cellEl = this.getHighlightedCellElement_();
      if (this.currentCellControl_.getElement() != cellEl) {
        this.currentCellControl_.setElementInternal(cellEl);
      }
      if (this.currentCellControl_.tryHighlight(highlight)) {
        this.getRenderer().highlightCell(this, items[index], highlight);
      }
    }
  }
};


/** @override */
goog.ui.Palette.prototype.setHighlighted = function(highlight) {
  'use strict';
  if (highlight && this.highlightedIndex_ == -1) {
    // If there was a last highlighted index, use that. Otherwise, highlight the
    // first cell.
    this.setHighlightedIndex(
        this.lastHighlightedIndex_ > -1 ? this.lastHighlightedIndex_ : 0);
  } else if (!highlight) {
    this.setHighlightedIndex(-1);
  }
  // The highlight event should be fired once the component has updated its own
  // state.
  goog.ui.Palette.base(this, 'setHighlighted', highlight);
};


/**
 * Private helper; selects or deselects the given item based on the value of
 * the Boolean argument.  This implementation simply applies selection styling
 * to the cell containing the item to be selected.  Does nothing if the palette
 * hasn't been rendered yet.
 * @param {Node} item Item to select or deselect.
 * @param {boolean} select If true, the item is selected; otherwise it is
 *     deselected.
 * @private
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Palette.prototype.selectItem_ = function(item, select) {
  'use strict';
  if (this.getElement()) {
    this.getRenderer().selectCell(this, item, select);
  }
};


/**
 * Calculates and updates the size of the palette based on any preset values
 * and the number of palette items.  If there is no preset size, sets the
 * palette size to the smallest square big enough to contain all items.  If
 * there is a preset number of columns, increases the number of rows to hold
 * all items if needed.  (If there are too many rows, does nothing.)
 * @private
 */
goog.ui.Palette.prototype.adjustSize_ = function() {
  'use strict';
  var items = this.getContent();
  if (items) {
    if (this.size_ && this.size_.width) {
      // There is already a size set; honor the number of columns (if >0), but
      // increase the number of rows if needed.
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      var minRows = Math.ceil(items.length / this.size_.width);
      if (typeof this.size_.height !== 'number' ||
          this.size_.height < minRows) {
        this.size_.height = minRows;
      }
    } else {
      // No size has been set; size the grid to the smallest square big enough
      // to hold all items (hey, why not?).
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      var length = Math.ceil(Math.sqrt(items.length));
      this.size_ = new goog.math.Size(length, length);
    }
  } else {
    // No items; set size to 0x0.
    this.size_ = new goog.math.Size(0, 0);
  }
};



/**
 * A component to represent the currently highlighted cell.
 * @constructor
 * @extends {goog.ui.Control}
 * @private
 */
goog.ui.Palette.CurrentCell_ = function() {
  'use strict';
  goog.ui.Palette.CurrentCell_.base(this, 'constructor', null);
  this.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true);
};
goog.inherits(goog.ui.Palette.CurrentCell_, goog.ui.Control);


/**
 * @param {boolean} highlight Whether to highlight or unhighlight the component.
 * @return {boolean} Whether it was successful.
 */
goog.ui.Palette.CurrentCell_.prototype.tryHighlight = function(highlight) {
  'use strict';
  this.setHighlighted(highlight);
  return this.isHighlighted() == highlight;
};
