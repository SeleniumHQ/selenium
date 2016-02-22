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
 * @fileoverview Renderer for {@link goog.ui.Palette}s.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.PaletteRenderer');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeIterator');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.iter');
goog.require('goog.style');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.userAgent');



/**
 * Default renderer for {@link goog.ui.Palette}s.  Renders the palette as an
 * HTML table wrapped in a DIV, with one palette item per cell:
 *
 *    <div class="goog-palette">
 *      <table class="goog-palette-table">
 *        <tbody class="goog-palette-body">
 *          <tr class="goog-palette-row">
 *            <td class="goog-palette-cell">...Item 0...</td>
 *            <td class="goog-palette-cell">...Item 1...</td>
 *            ...
 *          </tr>
 *          <tr class="goog-palette-row">
 *            ...
 *          </tr>
 *        </tbody>
 *      </table>
 *    </div>
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.PaletteRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.PaletteRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.PaletteRenderer);


/**
 * Globally unique ID sequence for cells rendered by this renderer class.
 * @type {number}
 * @private
 */
goog.ui.PaletteRenderer.cellId_ = 0;


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.PaletteRenderer.CSS_CLASS = goog.getCssName('goog-palette');


/**
 * Returns the palette items arranged in a table wrapped in a DIV, with the
 * renderer's own CSS class and additional state-specific classes applied to
 * it.
 * @param {goog.ui.Control} palette goog.ui.Palette to render.
 * @return {!Element} Root element for the palette.
 * @override
 */
goog.ui.PaletteRenderer.prototype.createDom = function(palette) {
  var classNames = this.getClassNames(palette);
  var element = palette.getDomHelper().createDom(
      goog.dom.TagName.DIV, classNames ? classNames.join(' ') : null,
      this.createGrid(/** @type {Array<Node>} */(palette.getContent()),
          palette.getSize(), palette.getDomHelper()));
  goog.a11y.aria.setRole(element, goog.a11y.aria.Role.GRID);
  return element;
};


/**
 * Returns the given items in a table with {@code size.width} columns and
 * {@code size.height} rows.  If the table is too big, empty cells will be
 * created as needed.  If the table is too small, the items that don't fit
 * will not be rendered.
 * @param {Array<Node>} items Palette items.
 * @param {goog.math.Size} size Palette size (columns x rows); both dimensions
 *     must be specified as numbers.
 * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
 * @return {!Element} Palette table element.
 */
goog.ui.PaletteRenderer.prototype.createGrid = function(items, size, dom) {
  var rows = [];
  for (var row = 0, index = 0; row < size.height; row++) {
    var cells = [];
    for (var column = 0; column < size.width; column++) {
      var item = items && items[index++];
      cells.push(this.createCell(item, dom));
    }
    rows.push(this.createRow(cells, dom));
  }

  return this.createTable(rows, dom);
};


/**
 * Returns a table element (or equivalent) that wraps the given rows.
 * @param {Array<Element>} rows Array of row elements.
 * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
 * @return {!Element} Palette table element.
 */
goog.ui.PaletteRenderer.prototype.createTable = function(rows, dom) {
  var table = dom.createDom(goog.dom.TagName.TABLE,
      goog.getCssName(this.getCssClass(), 'table'),
      dom.createDom(goog.dom.TagName.TBODY,
          goog.getCssName(this.getCssClass(), 'body'), rows));
  table.cellSpacing = 0;
  table.cellPadding = 0;
  return table;
};


/**
 * Returns a table row element (or equivalent) that wraps the given cells.
 * @param {Array<Element>} cells Array of cell elements.
 * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
 * @return {!Element} Row element.
 */
goog.ui.PaletteRenderer.prototype.createRow = function(cells, dom) {
  var row = dom.createDom(goog.dom.TagName.TR,
      goog.getCssName(this.getCssClass(), 'row'), cells);
  goog.a11y.aria.setRole(row, goog.a11y.aria.Role.ROW);
  return row;
};


/**
 * Returns a table cell element (or equivalent) that wraps the given palette
 * item (which must be a DOM node).
 * @param {Node|string} node Palette item.
 * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
 * @return {!Element} Cell element.
 */
goog.ui.PaletteRenderer.prototype.createCell = function(node, dom) {
  var cell = dom.createDom(goog.dom.TagName.TD, {
    'class': goog.getCssName(this.getCssClass(), 'cell'),
    // Cells must have an ID, for accessibility, so we generate one here.
    'id': goog.getCssName(this.getCssClass(), 'cell-') +
        goog.ui.PaletteRenderer.cellId_++
  }, node);
  goog.a11y.aria.setRole(cell, goog.a11y.aria.Role.GRIDCELL);
  // Initialize to an unselected state.
  goog.a11y.aria.setState(cell, goog.a11y.aria.State.SELECTED, false);

  if (!goog.dom.getTextContent(cell) && !goog.a11y.aria.getLabel(cell)) {
    var ariaLabelForCell = this.findAriaLabelForCell_(cell);
    if (ariaLabelForCell) {
      goog.a11y.aria.setLabel(cell, ariaLabelForCell);
    }
  }
  return cell;
};


/**
 * Descends the DOM and tries to find an aria label for a grid cell
 * from the first child with a label or title.
 * @param {!Element} cell The cell.
 * @return {string} The label to use.
 * @private
 */
goog.ui.PaletteRenderer.prototype.findAriaLabelForCell_ = function(cell) {
  var iter = new goog.dom.NodeIterator(cell);
  var label = '';
  var node;
  while (!label && (node = goog.iter.nextOrValue(iter, null))) {
    if (node.nodeType == goog.dom.NodeType.ELEMENT) {
      label = goog.a11y.aria.getLabel(/** @type {!Element} */ (node)) ||
          node.title;
    }
  }
  return label;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#canDecorate} to always return false.
 * @param {Element} element Ignored.
 * @return {boolean} False, since palettes don't support the decorate flow (for
 *     now).
 * @override
 */
goog.ui.PaletteRenderer.prototype.canDecorate = function(element) {
  return false;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} to be a no-op, since
 * palettes don't support the decorate flow (for now).
 * @param {goog.ui.Control} palette Ignored.
 * @param {Element} element Ignored.
 * @return {null} Always null.
 * @override
 */
goog.ui.PaletteRenderer.prototype.decorate = function(palette, element) {
  return null;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#setContent} for palettes.  Locates
 * the HTML table representing the palette grid, and replaces the contents of
 * each cell with a new element from the array of nodes passed as the second
 * argument.  If the new content has too many items the table will have more
 * rows added to fit, if there are less items than the table has cells, then the
 * left over cells will be empty.
 * @param {Element} element Root element of the palette control.
 * @param {goog.ui.ControlContent} content Array of items to replace existing
 *     palette items.
 * @override
 */
goog.ui.PaletteRenderer.prototype.setContent = function(element, content) {
  var items = /** @type {Array<Node>} */ (content);
  if (element) {
    var tbody = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.TBODY,
        goog.getCssName(this.getCssClass(), 'body'), element)[0];
    if (tbody) {
      var index = 0;
      goog.array.forEach(tbody.rows, function(row) {
        goog.array.forEach(row.cells, function(cell) {
          goog.dom.removeChildren(cell);
          if (items) {
            var item = items[index++];
            if (item) {
              goog.dom.appendChild(cell, item);
            }
          }
        });
      });

      // Make space for any additional items.
      if (index < items.length) {
        var cells = [];
        var dom = goog.dom.getDomHelper(element);
        var width = tbody.rows[0].cells.length;
        while (index < items.length) {
          var item = items[index++];
          cells.push(this.createCell(item, dom));
          if (cells.length == width) {
            var row = this.createRow(cells, dom);
            goog.dom.appendChild(tbody, row);
            cells.length = 0;
          }
        }
        if (cells.length > 0) {
          while (cells.length < width) {
            cells.push(this.createCell('', dom));
          }
          var row = this.createRow(cells, dom);
          goog.dom.appendChild(tbody, row);
        }
      }
    }
    // Make sure the new contents are still unselectable.
    goog.style.setUnselectable(element, true, goog.userAgent.GECKO);
  }
};


/**
 * Returns the item corresponding to the given node, or null if the node is
 * neither a palette cell nor part of a palette item.
 * @param {goog.ui.Palette} palette Palette in which to look for the item.
 * @param {Node} node Node to look for.
 * @return {Node} The corresponding palette item (null if not found).
 */
goog.ui.PaletteRenderer.prototype.getContainingItem = function(palette, node) {
  var root = palette.getElement();
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT && node != root) {
    if (node.tagName == goog.dom.TagName.TD && goog.dom.classlist.contains(
        /** @type {!Element} */ (node),
        goog.getCssName(this.getCssClass(), 'cell'))) {
      return node.firstChild;
    }
    node = node.parentNode;
  }

  return null;
};


/**
 * Updates the highlight styling of the palette cell containing the given node
 * based on the value of the Boolean argument.
 * @param {goog.ui.Palette} palette Palette containing the item.
 * @param {Node} node Item whose cell is to be highlighted or un-highlighted.
 * @param {boolean} highlight If true, the cell is highlighted; otherwise it is
 *     un-highlighted.
 */
goog.ui.PaletteRenderer.prototype.highlightCell = function(palette,
                                                           node,
                                                           highlight) {
  if (node) {
    var cell = this.getCellForItem(node);
    goog.asserts.assert(cell);
    goog.dom.classlist.enable(cell,
        goog.getCssName(this.getCssClass(), 'cell-hover'), highlight);
    // See http://www.w3.org/TR/2006/WD-aria-state-20061220/#activedescendent
    // for an explanation of the activedescendent.
    if (highlight) {
      goog.a11y.aria.setState(palette.getElementStrict(),
          goog.a11y.aria.State.ACTIVEDESCENDANT, cell.id);
    } else if (cell.id == goog.a11y.aria.getState(palette.getElementStrict(),
        goog.a11y.aria.State.ACTIVEDESCENDANT)) {
      goog.a11y.aria.removeState(palette.getElementStrict(),
          goog.a11y.aria.State.ACTIVEDESCENDANT);
    }
  }
};


/**
 * @param {Node} node Item whose cell is to be returned.
 * @return {Element} The grid cell for the palette item.
 */
goog.ui.PaletteRenderer.prototype.getCellForItem = function(node) {
  return /** @type {Element} */ (node ? node.parentNode : null);
};


/**
 * Updates the selection styling of the palette cell containing the given node
 * based on the value of the Boolean argument.
 * @param {goog.ui.Palette} palette Palette containing the item.
 * @param {Node} node Item whose cell is to be selected or deselected.
 * @param {boolean} select If true, the cell is selected; otherwise it is
 *     deselected.
 */
goog.ui.PaletteRenderer.prototype.selectCell = function(palette, node, select) {
  if (node) {
    var cell = /** @type {!Element} */ (node.parentNode);
    goog.dom.classlist.enable(cell,
        goog.getCssName(this.getCssClass(), 'cell-selected'),
        select);
    goog.a11y.aria.setState(cell, goog.a11y.aria.State.SELECTED, select);
  }
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.PaletteRenderer.prototype.getCssClass = function() {
  return goog.ui.PaletteRenderer.CSS_CLASS;
};
