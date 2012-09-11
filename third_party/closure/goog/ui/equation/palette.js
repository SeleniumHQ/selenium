// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A palette of icons.
 * The icons are generated from a single sprite image that
 * is used for multiple palettes.
 * All icons of a single palette must be on the same sprite row
 * (same y coordinate) and all have the same width.
 * Each item has an associated action command that should be taken
 * when certain event is dispatched.
 *
 */

goog.provide('goog.ui.equation.Palette');
goog.provide('goog.ui.equation.PaletteEvent');
goog.provide('goog.ui.equation.PaletteRenderer');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Palette');
goog.require('goog.ui.equation.ImageRenderer');



/**
 * Constructs a new palette.
 * @param {goog.ui.equation.PaletteManager} paletteManager The
 *     manager of the palette.
 * @param {goog.ui.equation.Palette.Type} type The type of the
 *     palette.
 * @param {number} spriteX Coordinate of first icon in sprite.
 * @param {number} spriteY Coordinate of top of all icons in sprite.
 * @param {number} itemWidth Pixel width of each palette icon.
 * @param {number} itemHeight Pixel height of each palette icon.
 * @param {Array.<string>=} opt_actions An optional action list for palette
 *     elements. The number of actions determine the number of palette
 *     elements.
 * @param {goog.ui.PaletteRenderer=} opt_renderer Optional customized renderer,
 *     defaults to {@link goog.ui.PaletteRenderer}.
 * @extends {goog.ui.Palette}
 * @constructor
 */
goog.ui.equation.Palette = function(paletteManager, type, spriteX,
    spriteY, itemWidth, itemHeight, opt_actions, opt_renderer) {

  /**
   * The type of the palette.
   * @type {goog.ui.equation.Palette.Type}
   * @private
   */
  this.type_ = type;

  /**
   * The palette actions.
   * @type {Array.<string>}
   * @private
   */
  this.actions_ = opt_actions || [];

  var renderer =
      opt_renderer ||
      goog.ui.equation.PaletteRenderer.getInstance();

  // Create a div element for each icon.
  var elements = [];
  var x = - spriteX;
  var y = - spriteY;
  for (var i = 0; i < opt_actions.length; i++) {
    elements.push(goog.dom.createDom(goog.dom.TagName.DIV,
        {'class': renderer.getItemCssClass(),
          'style': 'width:' + itemWidth +
              'px;height:' + itemHeight +
              'px;' +
              'background-position:' +
              x + 'px ' + y + 'px;'}));
    x -= itemWidth;
  }

  /**
   * The palette manager that manages all the palettes.
   * @type {goog.ui.equation.PaletteManager}
   * @private
   */
  this.paletteManager_ = paletteManager;

  goog.ui.Palette.call(this, elements, renderer);
};
goog.inherits(goog.ui.equation.Palette, goog.ui.Palette);


/**
 * The type of possible palettes. They are made short to minimize JS size.
 * @enum {string}
 */
goog.ui.equation.Palette.Type = {
  MENU: 'mn',
  GREEK: 'g',
  SYMBOL: 's',
  COMPARISON: 'c',
  MATH: 'm',
  ARROW: 'a'
};


/**
 * The CSS class name for the palette.
 * @type {string}
 */
goog.ui.equation.Palette.CSS_CLASS = 'ee-palette';


/**
 * Returns the type of the palette.
 * @return {goog.ui.equation.Palette.Type} The type of the palette.
 */
goog.ui.equation.Palette.prototype.getType = function() {
  return this.type_;
};


/**
 * Returns the palette manager.
 * @return {goog.ui.equation.PaletteManager} The palette manager
 *     that manages all the palette.
 */
goog.ui.equation.Palette.prototype.getPaletteManager = function() {
  return this.paletteManager_;
};


/**
 * Returns actions for this palette.
 * @return {Array.<string>} The palette actions.
 */
goog.ui.equation.Palette.prototype.getActions = function() {
  return this.actions_;
};


/**
 * Returns the action for a given index.
 * @param {number} index The index of the action to be retrieved.
 * @return {string?} The action for given index, or {@code null} if action is
 *     not found.
 */
goog.ui.equation.Palette.prototype.getAction = function(index) {
  return (index >= 0 && index < this.actions_.length) ?
      this.actions_[index] : null;
};


/**
 * Handles mouseup events. Overrides {@link goog.ui.Palette#handleMouseUp}
 * by dispatching a {@link goog.ui.equation.PaletteEvent}.
 * @param {goog.events.Event} e Mouse event to handle.
 * @override
 */
goog.ui.equation.Palette.prototype.handleMouseUp = function(e) {
  goog.base(this, 'handleMouseUp', e);

  this.paletteManager_.dispatchEvent(
      new goog.ui.equation.PaletteEvent(
          goog.ui.equation.PaletteEvent.Type.ACTION, this));
};


/**
 * Handles mouse out events. Overrides {@link goog.ui.Palette#handleMouseOut}
 * by deactivate the palette.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @override
 */
goog.ui.equation.Palette.prototype.handleMouseOut = function(e) {
  goog.base(this, 'handleMouseOut', e);

  // Ignore mouse moves between descendants.
  if (e.relatedTarget &&
      !goog.dom.contains(this.getElement(), e.relatedTarget)) {
    this.paletteManager_.deactivate();
  }
};


/**
 * Handles mouse over events. Overrides {@link goog.ui.Palette#handleMouseOver}
 * by stop deactivating the palette. When mouse leaves the palettes, the
 * palettes will be deactivated after a centain period of time. Reentering the
 * palettes inside this time will stop the timer and cancel the deactivation.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @override
 */
goog.ui.equation.Palette.prototype.handleMouseOver = function(e) {
  goog.base(this, 'handleMouseOver', e);

  // Ignore mouse moves between descendants.
  if (e.relatedTarget &&
      !goog.dom.contains(this.getElement(), e.relatedTarget)) {

    // Stop the timer to deactivate the palettes.
    this.paletteManager_.stopDeactivation();
  }
};



/**
 * The event that palettes dispatches.
 * @param {string} type Type of the event.
 * @param {goog.ui.equation.Palette} palette The palette that the
 *     event is fired on.
 * @param {Element=} opt_target The optional target of the event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.equation.PaletteEvent = function(type, palette, opt_target) {
  goog.events.Event.call(this, type, opt_target);

  /**
   * The palette the event is fired from.
   * @type {goog.ui.equation.Palette}
   * @private
   */
  this.palette_ = palette;
};


/**
 * The type of events that can be fired on palettes.
 * @enum {string}
 */
goog.ui.equation.PaletteEvent.Type = {

  // Take the action that is associated with the palette item.
  ACTION: 'a'
};


/**
 * Returns the palette that this event is fired from.
 * @return {goog.ui.equation.Palette} The palette this event is
 *     fired from.
 */
goog.ui.equation.PaletteEvent.prototype.getPalette = function() {
  return this.palette_;
};



/**
 * The renderer for palette.
 * @extends {goog.ui.PaletteRenderer}
 * @constructor
 */
goog.ui.equation.PaletteRenderer = function() {
  goog.ui.PaletteRenderer.call(this);
};
goog.inherits(goog.ui.equation.PaletteRenderer, goog.ui.PaletteRenderer);
goog.addSingletonGetter(goog.ui.equation.PaletteRenderer);


/** @override */
goog.ui.equation.PaletteRenderer.prototype.getCssClass =
    function() {
  return goog.ui.equation.Palette.CSS_CLASS;
};


/**
 * Returns the CSS class name for the palette item.
 * @return {string} The CSS class name of the palette item.
 */
goog.ui.equation.PaletteRenderer.prototype.getItemCssClass = function() {
  return this.getCssClass() + '-item';
};
