// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A button control. This implementation extends {@link
 * goog.ui.Control}.
 *
*
 * @see ../demos/button.html
 */

goog.provide('goog.ui.Button');
goog.provide('goog.ui.Button.Side');

goog.require('goog.events.KeyCodes');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.NativeButtonRenderer');



/**
 * A button control, rendered as a native browser button by default.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the button; defaults to {@link goog.ui.NativeButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Button = function(content, opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, content, opt_renderer ||
      goog.ui.NativeButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.Button, goog.ui.Control);


/**
 * Constants for button sides, see {@link goog.ui.Button.prototype.setCollapsed}
 * for details.
 * @enum {number}
 */
goog.ui.Button.Side = {
  /** Neither side. */
  NONE: 0,
  /** Left for LTR, right for RTL. */
  START: 1,
  /** Right for LTR, left for RTL. */
  END: 2,
  /** Both sides. */
  BOTH: 3
};


/**
 * Value associated with the button.
 * @type {*}
 * @private
 */
goog.ui.Button.prototype.value_;


/**
 * Tooltip text for the button, displayed on hover.
 * @type {string|undefined}
 * @private
 */
goog.ui.Button.prototype.tooltip_;


// goog.ui.Button API implementation.


/**
 * Returns the value associated with the button.
 * @return {*} Button value (undefined if none).
 */
goog.ui.Button.prototype.getValue = function() {
  return this.value_;
};


/**
 * Sets the value associated with the button, and updates its DOM.
 * @param {*} value New button value.
 */
goog.ui.Button.prototype.setValue = function(value) {
  this.value_ = value;
  this.getRenderer().setValue(this.getElement(), value);
};


/**
 * Sets the value associated with the button.  Unlike {@link #setValue},
 * doesn't update the button's DOM.  Considered protected; to be called only
 * by renderer code during element decoration.
 * @param {*} value New button value.
 * @protected
 */
goog.ui.Button.prototype.setValueInternal = function(value) {
  this.value_ = value;
};


/**
 * Returns the tooltip for the button.
 * @return {string|undefined} Tooltip text (undefined if none).
 */
goog.ui.Button.prototype.getTooltip = function() {
  return this.tooltip_;
};


/**
 * Sets the tooltip for the button, and updates its DOM.
 * @param {string} tooltip New tooltip text.
 */
goog.ui.Button.prototype.setTooltip = function(tooltip) {
  this.tooltip_ = tooltip;
  this.getRenderer().setTooltip(this. getElement(), tooltip);
};


/**
 * Sets the tooltip for the button.  Unlike {@link #setTooltip}, doesn't update
 * the button's DOM.  Considered protected; to be called only by renderer code
 * during element decoration.
 * @param {string} tooltip New tooltip text.
 * @protected
 */
goog.ui.Button.prototype.setTooltipInternal = function(tooltip) {
  this.tooltip_ = tooltip;
};


/**
 * Collapses the border on one or both sides of the button, allowing it to be
 * combined with the adjancent button(s), forming a single UI componenet with
 * multiple targets.
 * @param {number} sides Bitmap of one or more {@link goog.ui.Button.Side}s for
 *     which borders should be collapsed.
 */
goog.ui.Button.prototype.setCollapsed = function(sides) {
  this.getRenderer().setCollapsed(this, sides);
};


// goog.ui.Control & goog.ui.Component API implementation.


/** @inheritDoc */
goog.ui.Button.prototype.disposeInternal = function() {
  goog.ui.Button.superClass_.disposeInternal.call(this);
  delete this.value_;
  delete this.tooltip_;
};


/** @inheritDoc */
goog.ui.Button.prototype.enterDocument = function() {
  goog.ui.Button.superClass_.enterDocument.call(this);
  if (this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
    var keyTarget = this.getKeyEventTarget();
    if (keyTarget) {
      this.getHandler().listen(keyTarget, goog.events.EventType.KEYUP,
          this.handleKeyEventInternal);
    }
  }
};


/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the button is enabled and the Enter/Space key was
 * pressed, handles the event by dispatching an {@code ACTION} event,
 * and returns true. Overrides {@link goog.ui.Control#handleKeyEventInternal}.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 * @protected
 * @override
 */
goog.ui.Button.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER &&
      e.type == goog.events.KeyHandler.EventType.KEY ||
      e.keyCode == goog.events.KeyCodes.SPACE &&
      e.type == goog.events.EventType.KEYUP) {
    return this.performActionInternal(e);
  }
  // Return true for space keypress (even though the event is handled on keyup)
  // as preventDefault needs to be called up keypress to take effect in IE and
  // WebKit.
  return e.keyCode == goog.events.KeyCodes.SPACE;
};


// Register a decorator factory function for goog.ui.Buttons.
goog.ui.registry.setDecoratorByClassName(goog.ui.ButtonRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Button(null);
    });
