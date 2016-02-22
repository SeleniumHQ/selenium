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
 * @fileoverview The default renderer for a goog.dom.DimensionPicker.  A
 * dimension picker allows the user to visually select a row and column count.
 * It looks like a palette but in order to minimize DOM load it is rendered.
 * using CSS background tiling instead of as a grid of nodes.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.ui.DimensionPickerRenderer');

goog.require('goog.a11y.aria.Announcer');
goog.require('goog.a11y.aria.LivePriority');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.i18n.bidi');
goog.require('goog.style');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.userAgent');



/**
 * Default renderer for {@link goog.ui.DimensionPicker}s.  Renders the
 * palette as two divs, one with the un-highlighted background, and one with the
 * highlighted background.
 *
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.DimensionPickerRenderer = function() {
  goog.ui.ControlRenderer.call(this);

  /** @private {goog.a11y.aria.Announcer} */
  this.announcer_ = new goog.a11y.aria.Announcer();
};
goog.inherits(goog.ui.DimensionPickerRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.DimensionPickerRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.DimensionPickerRenderer.CSS_CLASS =
    goog.getCssName('goog-dimension-picker');


/**
 * Return the underlying div for the given outer element.
 * @param {Element} element The root element.
 * @return {Element} The underlying div.
 * @private
 */
goog.ui.DimensionPickerRenderer.prototype.getUnderlyingDiv_ = function(
    element) {
  return element.firstChild.childNodes[1];
};


/**
 * Return the highlight div for the given outer element.
 * @param {Element} element The root element.
 * @return {Element} The highlight div.
 * @private
 */
goog.ui.DimensionPickerRenderer.prototype.getHighlightDiv_ = function(
    element) {
  return /** @type {Element} */ (element.firstChild.lastChild);
};


/**
 * Return the status message div for the given outer element.
 * @param {Element} element The root element.
 * @return {Element} The status message div.
 * @private
 */
goog.ui.DimensionPickerRenderer.prototype.getStatusDiv_ = function(
    element) {
  return /** @type {Element} */ (element.lastChild);
};


/**
 * Return the invisible mouse catching div for the given outer element.
 * @param {Element} element The root element.
 * @return {Element} The invisible mouse catching div.
 * @private
 */
goog.ui.DimensionPickerRenderer.prototype.getMouseCatcher_ = function(
    element) {
  return /** @type {Element} */ (element.firstChild.firstChild);
};


/**
 * Overrides {@link goog.ui.ControlRenderer#canDecorate} to allow decorating
 * empty DIVs only.
 * @param {Element} element The element to check.
 * @return {boolean} Whether if the element is an empty div.
 * @override
 */
goog.ui.DimensionPickerRenderer.prototype.canDecorate = function(
    element) {
  return element.tagName == goog.dom.TagName.DIV && !element.firstChild;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} to decorate empty DIVs.
 * @param {goog.ui.Control} control goog.ui.DimensionPicker to decorate.
 * @param {Element} element The element to decorate.
 * @return {Element} The decorated element.
 * @override
 */
goog.ui.DimensionPickerRenderer.prototype.decorate = function(control,
    element) {
  var palette = /** @type {goog.ui.DimensionPicker} */ (control);
  goog.ui.DimensionPickerRenderer.superClass_.decorate.call(this,
      palette, element);

  this.addElementContents_(palette, element);
  this.updateSize(palette, element);

  return element;
};


/**
 * Scales various elements in order to update the palette's size.
 * @param {goog.ui.DimensionPicker} palette The palette object.
 * @param {Element} element The element to set the style of.
 */
goog.ui.DimensionPickerRenderer.prototype.updateSize =
    function(palette, element) {
  var size = palette.getSize();

  element.style.width = size.width + 'em';

  var underlyingDiv = this.getUnderlyingDiv_(element);
  underlyingDiv.style.width = size.width + 'em';
  underlyingDiv.style.height = size.height + 'em';

  if (palette.isRightToLeft()) {
    this.adjustParentDirection_(palette, element);
  }
};


/**
 * Adds the appropriate content elements to the given outer DIV.
 * @param {goog.ui.DimensionPicker} palette The palette object.
 * @param {Element} element The element to decorate.
 * @private
 */
goog.ui.DimensionPickerRenderer.prototype.addElementContents_ = function(
    palette, element) {
  // First we create a single div containing three stacked divs.  The bottom div
  // catches mouse events.  We can't use document level mouse move detection as
  // we could lose events to iframes.  This is especially important in Firefox 2
  // in which TrogEdit creates iframes. The middle div uses a css tiled
  // background image to represent deselected tiles.  The top div uses a
  // different css tiled background image to represent selected tiles.
  var mouseCatcherDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV,
      goog.getCssName(this.getCssClass(), 'mousecatcher'));
  var unhighlightedDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV,
      {
        'class': goog.getCssName(this.getCssClass(), 'unhighlighted'),
        'style': 'width:100%;height:100%'
      });
  var highlightedDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV,
      goog.getCssName(this.getCssClass(), 'highlighted'));
  element.appendChild(
      palette.getDomHelper().createDom(goog.dom.TagName.DIV,
          {'style': 'width:100%;height:100%'},
          mouseCatcherDiv, unhighlightedDiv, highlightedDiv));

  // Lastly we add a div to store the text version of the current state.
  element.appendChild(palette.getDomHelper().createDom(goog.dom.TagName.DIV,
      goog.getCssName(this.getCssClass(), 'status')));
};


/**
 * Creates a div and adds the appropriate contents to it.
 * @param {goog.ui.Control} control Picker to render.
 * @return {!Element} Root element for the palette.
 * @override
 */
goog.ui.DimensionPickerRenderer.prototype.createDom = function(control) {
  var palette = /** @type {goog.ui.DimensionPicker} */ (control);
  var classNames = this.getClassNames(palette);
  // Hide the element from screen readers so they don't announce "1 of 1" for
  // the perceived number of items in the palette.
  var element = palette.getDomHelper().createDom(goog.dom.TagName.DIV, {
    'class': classNames ? classNames.join(' ') : '',
    'aria-hidden': 'true'
  });
  this.addElementContents_(palette, element);
  this.updateSize(palette, element);
  return element;
};


/**
 * Initializes the control's DOM when the control enters the document.  Called
 * from {@link goog.ui.Control#enterDocument}.
 * @param {goog.ui.Control} control Palette whose DOM is to be
 *     initialized as it enters the document.
 * @override
 */
goog.ui.DimensionPickerRenderer.prototype.initializeDom = function(
    control) {
  var palette = /** @type {goog.ui.DimensionPicker} */ (control);
  goog.ui.DimensionPickerRenderer.superClass_.initializeDom.call(this, palette);

  // Make the displayed highlighted size match the dimension picker's value.
  var highlightedSize = palette.getValue();
  this.setHighlightedSize(palette,
      highlightedSize.width, highlightedSize.height);

  this.positionMouseCatcher(palette);
};


/**
 * Get the element to listen for mouse move events on.
 * @param {goog.ui.DimensionPicker} palette The palette to listen on.
 * @return {Element} The element to listen for mouse move events on.
 */
goog.ui.DimensionPickerRenderer.prototype.getMouseMoveElement = function(
    palette) {
  return /** @type {Element} */ (palette.getElement().firstChild);
};


/**
 * Returns the x offset in to the grid for the given mouse x position.
 * @param {goog.ui.DimensionPicker} palette The table size palette.
 * @param {number} x The mouse event x position.
 * @return {number} The x offset in to the grid.
 */
goog.ui.DimensionPickerRenderer.prototype.getGridOffsetX = function(
    palette, x) {
  // TODO(robbyw): Don't rely on magic 18 - measure each palette's em size.
  return Math.min(palette.maxColumns, Math.ceil(x / 18));
};


/**
 * Returns the y offset in to the grid for the given mouse y position.
 * @param {goog.ui.DimensionPicker} palette The table size palette.
 * @param {number} y The mouse event y position.
 * @return {number} The y offset in to the grid.
 */
goog.ui.DimensionPickerRenderer.prototype.getGridOffsetY = function(
    palette, y) {
  return Math.min(palette.maxRows, Math.ceil(y / 18));
};


/**
 * Sets the highlighted size. Does nothing if the palette hasn't been rendered.
 * @param {goog.ui.DimensionPicker} palette The table size palette.
 * @param {number} columns The number of columns to highlight.
 * @param {number} rows The number of rows to highlight.
 */
goog.ui.DimensionPickerRenderer.prototype.setHighlightedSize = function(
    palette, columns, rows) {
  var element = palette.getElement();
  // Can't update anything if DimensionPicker hasn't been rendered.
  if (!element) {
    return;
  }

  // Style the highlight div.
  var style = this.getHighlightDiv_(element).style;
  style.width = columns + 'em';
  style.height = rows + 'em';

  // Explicitly set style.right so the element grows to the left when increase
  // in width.
  if (palette.isRightToLeft()) {
    style.right = '0';
  }

  /**
   * @desc The dimension of the columns and rows currently selected in the
   * dimension picker, as text that can be spoken by a screen reader.
   */
  var MSG_DIMENSION_PICKER_HIGHLIGHTED_DIMENSIONS = goog.getMsg(
      '{$numCols} by {$numRows}',
      {'numCols': columns, 'numRows': rows});
  this.announcer_.say(MSG_DIMENSION_PICKER_HIGHLIGHTED_DIMENSIONS,
      goog.a11y.aria.LivePriority.ASSERTIVE);

  // Update the size text.
  goog.dom.setTextContent(this.getStatusDiv_(element),
      goog.i18n.bidi.enforceLtrInText(columns + ' x ' + rows));
};


/**
 * Position the mouse catcher such that it receives mouse events past the
 * selectedsize up to the maximum size.  Takes care to not introduce scrollbars.
 * Should be called on enter document and when the window changes size.
 * @param {goog.ui.DimensionPicker} palette The table size palette.
 */
goog.ui.DimensionPickerRenderer.prototype.positionMouseCatcher = function(
    palette) {
  var mouseCatcher = this.getMouseCatcher_(palette.getElement());
  var doc = goog.dom.getOwnerDocument(mouseCatcher);
  var body = doc.body;

  var position = goog.style.getRelativePosition(mouseCatcher, body);

  // Hide the mouse catcher so it doesn't affect the body's scroll size.
  mouseCatcher.style.display = 'none';

  // Compute the maximum size the catcher can be without introducing scrolling.
  var xAvailableEm = (palette.isRightToLeft() && position.x > 0) ?
      Math.floor(position.x / 18) :
      Math.floor((body.scrollWidth - position.x) / 18);

  // Computing available height is more complicated - we need to check the
  // window's inner height.
  var height;
  if (goog.userAgent.IE) {
    // Offset 20px to make up for scrollbar size.
    height = goog.style.getClientViewportElement(body).scrollHeight - 20;
  } else {
    var win = goog.dom.getWindow(doc);
    // Offset 20px to make up for scrollbar size.
    height = Math.max(win.innerHeight, body.scrollHeight) - 20;
  }
  var yAvailableEm = Math.floor((height - position.y) / 18);

  // Resize and display the mouse catcher.
  mouseCatcher.style.width = Math.min(palette.maxColumns, xAvailableEm) + 'em';
  mouseCatcher.style.height = Math.min(palette.maxRows, yAvailableEm) + 'em';
  mouseCatcher.style.display = '';

  // Explicitly set style.right so the mouse catcher is positioned on the left
  // side instead of right.
  if (palette.isRightToLeft()) {
    mouseCatcher.style.right = '0';
  }
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.DimensionPickerRenderer.prototype.getCssClass = function() {
  return goog.ui.DimensionPickerRenderer.CSS_CLASS;
};


/**
 * This function adjusts the positioning from 'left' and 'top' to 'right' and
 * 'top' as appropriate for RTL control.  This is so when the dimensionpicker
 * grow in width, the containing element grow to the left instead of right.
 * This won't be necessary if goog.ui.SubMenu rendering code would position RTL
 * control with 'right' and 'top'.
 * @private
 *
 * @param {goog.ui.DimensionPicker} palette The palette object.
 * @param {Element} element The palette's element.
 */
goog.ui.DimensionPickerRenderer.prototype.adjustParentDirection_ =
    function(palette, element) {
  var parent = palette.getParent();
  if (parent) {
    var parentElement = parent.getElement();

    // Anchors the containing element to the right so it grows to the left
    // when it increase in width.
    var right = goog.style.getStyle(parentElement, 'right');
    if (right == '') {
      var parentPos = goog.style.getPosition(parentElement);
      var parentSize = goog.style.getSize(parentElement);
      if (parentSize.width != 0 && parentPos.x != 0) {
        var visibleRect = goog.style.getBounds(
            goog.style.getClientViewportElement());
        var visibleWidth = visibleRect.width;
        right = visibleWidth - parentPos.x - parentSize.width;
        goog.style.setStyle(parentElement, 'right', right + 'px');
      }
    }

    // When a table is inserted, the containing elemet's position is
    // recalculated the next time it shows, set left back to '' to prevent
    // extra white space on the left.
    var left = goog.style.getStyle(parentElement, 'left');
    if (left != '') {
      goog.style.setStyle(parentElement, 'left', '');
    }
  } else {
    goog.style.setStyle(element, 'right', '0px');
  }
};
