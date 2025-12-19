/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A button control. This implementation extends {@link
 * goog.ui.Control}.
 *
 * @see ../demos/button.html
 */

goog.provide('goog.ui.Button');
goog.provide('goog.ui.Button.Side');

goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.NativeButtonRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.events.KeyEvent');
goog.requireType('goog.ui.ControlContent');



/**
 * A button control, rendered as a native browser button by default.
 *
 * @param {goog.ui.ControlContent=} opt_content Text caption or existing DOM
 *     structure to display as the button's caption (if any).
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the button; defaults to {@link goog.ui.NativeButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Button = function(opt_content, opt_renderer, opt_domHelper) {
  'use strict';
  goog.ui.Control.call(
      this, opt_content,
      opt_renderer || goog.ui.NativeButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.Button, goog.ui.Control);


/**
 * Constants for button sides, see {@link goog.ui.Button.prototype.setCollapsed}
 * for details. Aliased from goog.ui.ButtonSide to support legacy users without
 * creating a circular dependency in {@link goog.ui.ButtonRenderer}.
 * @enum {number}
 * @deprecated use {@link goog.ui.ButtonSide} instead.
 */
goog.ui.Button.Side = goog.ui.ButtonSide;


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
  'use strict';
  return this.value_;
};


/**
 * Sets the value associated with the button, and updates its DOM.
 * @param {*} value New button value.
 */
goog.ui.Button.prototype.setValue = function(value) {
  'use strict';
  this.value_ = value;
  var renderer = /** @type {!goog.ui.ButtonRenderer} */ (this.getRenderer());
  renderer.setValue(this.getElement(), /** @type {string} */ (value));
};


/**
 * Sets the value associated with the button.  Unlike {@link #setValue},
 * doesn't update the button's DOM.  Considered protected; to be called only
 * by renderer code during element decoration.
 * @param {*} value New button value.
 * @protected
 */
goog.ui.Button.prototype.setValueInternal = function(value) {
  'use strict';
  this.value_ = value;
};


/**
 * Returns the tooltip for the button.
 * @return {string|undefined} Tooltip text (undefined if none).
 */
goog.ui.Button.prototype.getTooltip = function() {
  'use strict';
  return this.tooltip_;
};


/**
 * Sets the tooltip for the button, and updates its DOM.
 * @param {string} tooltip New tooltip text.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Button.prototype.setTooltip = function(tooltip) {
  'use strict';
  this.tooltip_ = tooltip;
  this.getRenderer().setTooltip(this.getElement(), tooltip);
};


/**
 * Sets the tooltip for the button.  Unlike {@link #setTooltip}, doesn't update
 * the button's DOM.  Considered protected; to be called only by renderer code
 * during element decoration.
 * @param {string} tooltip New tooltip text.
 * @protected
 */
goog.ui.Button.prototype.setTooltipInternal = function(tooltip) {
  'use strict';
  this.tooltip_ = tooltip;
};


/**
 * Collapses the border on one or both sides of the button, allowing it to be
 * combined with the adjancent button(s), forming a single UI componenet with
 * multiple targets.
 * @param {number} sides Bitmap of one or more {@link goog.ui.ButtonSide}s for
 *     which borders should be collapsed.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.Button.prototype.setCollapsed = function(sides) {
  'use strict';
  this.getRenderer().setCollapsed(this, sides);
};


// goog.ui.Control & goog.ui.Component API implementation.


/** @override */
goog.ui.Button.prototype.disposeInternal = function() {
  'use strict';
  goog.ui.Button.superClass_.disposeInternal.call(this);
  delete this.value_;
  delete this.tooltip_;
};


/** @override */
goog.ui.Button.prototype.enterDocument = function() {
  'use strict';
  goog.ui.Button.superClass_.enterDocument.call(this);
  if (this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
    var keyTarget = this.getKeyEventTarget();
    if (keyTarget) {
      this.getHandler().listen(
          keyTarget, goog.events.EventType.KEYUP, this.handleKeyEventInternal);
    }
  }
};


/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the button is enabled and the Enter/Space key was
 * pressed, handles the event by dispatching an `ACTION` event,
 * and returns true. Overrides {@link goog.ui.Control#handleKeyEventInternal}.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 * @protected
 * @override
 */
goog.ui.Button.prototype.handleKeyEventInternal = function(e) {
  'use strict';
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
goog.ui.registry.setDecoratorByClassName(
    goog.ui.ButtonRenderer.CSS_CLASS, function() {
      'use strict';
      return new goog.ui.Button(null);
    });
