/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Default renderer for {@link goog.ui.Button}s.
 */

goog.provide('goog.ui.ButtonRenderer');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.asserts');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');  // circular
goog.requireType('goog.ui.Button');



/**
 * Default renderer for {@link goog.ui.Button}s.  Extends the superclass with
 * the following button-specific API methods:
 * <ul>
 *   <li>`getValue` - returns the button element's value
 *   <li>`setValue` - updates the button element to reflect its new value
 *   <li>`getTooltip` - returns the button element's tooltip text
 *   <li>`setTooltip` - updates the button element's tooltip text
 *   <li>`setCollapsed` - removes one or both of the button element's
 *       borders
 * </ul>
 * For alternate renderers, see {@link goog.ui.NativeButtonRenderer},
 * {@link goog.ui.CustomButtonRenderer}, and {@link goog.ui.FlatButtonRenderer}.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.ButtonRenderer = function() {
  'use strict';
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.ButtonRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.ButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ButtonRenderer.CSS_CLASS = goog.getCssName('goog-button');


/**
 * Returns the ARIA role to be applied to buttons.
 * @return {goog.a11y.aria.Role|undefined} ARIA role.
 * @override
 */
goog.ui.ButtonRenderer.prototype.getAriaRole = function() {
  'use strict';
  return goog.a11y.aria.Role.BUTTON;
};


/**
 * Updates the button's ARIA (accessibility) state if the button is being
 * treated as a checkbox. Also makes sure that attributes which aren't
 * supported by buttons aren't being added.
 * @param {Element} element Element whose ARIA state is to be updated.
 * @param {goog.ui.Component.State} state Component state being enabled or
 *     disabled.
 * @param {boolean} enable Whether the state is being enabled or disabled.
 * @protected
 * @override
 */
goog.ui.ButtonRenderer.prototype.updateAriaState = function(
    element, state, enable) {
  'use strict';
  switch (state) {
    // If button has CHECKED or SELECTED state, assign aria-pressed
    case goog.ui.Component.State.SELECTED:
    case goog.ui.Component.State.CHECKED:
      goog.asserts.assert(element, 'The button DOM element cannot be null.');
      goog.a11y.aria.setState(element, goog.a11y.aria.State.PRESSED, enable);
      break;
    default:
    case goog.ui.Component.State.OPENED:
    case goog.ui.Component.State.DISABLED:
      goog.ui.ButtonRenderer.base(
          this, 'updateAriaState', element, state, enable);
      break;
  }
};


/**
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.ButtonRenderer.prototype.createDom = function(button) {
  'use strict';
  var element = goog.ui.ButtonRenderer.base(this, 'createDom', button);
  this.setTooltip(element, button.getTooltip());

  /** @suppress {strictMissingProperties} Added to tighten compiler checks */
  var value = button.getValue();
  if (value) {
    this.setValue(element, value);
  }

  // If this is a toggle button, set ARIA state
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(
        element, goog.ui.Component.State.CHECKED, button.isChecked());
  }

  return element;
};


/**
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.ButtonRenderer.prototype.decorate = function(button, element) {
  'use strict';
  // The superclass implementation takes care of common attributes; we only
  // need to set the value and the tooltip.
  element =
      goog.ui.ButtonRenderer.superClass_.decorate.call(this, button, element);

  button.setValueInternal(this.getValue(element));
  button.setTooltipInternal(this.getTooltip(element));

  // If this is a toggle button, set ARIA state
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(
        element, goog.ui.Component.State.CHECKED, button.isChecked());
  }

  return element;
};


/**
 * Takes a button's root element, and returns the value associated with it.
 * No-op in the base class.
 * @param {Element} element The button's root element.
 * @return {string|undefined} The button's value (undefined if none).
 */
goog.ui.ButtonRenderer.prototype.getValue = function(element) {};


/**
 * Takes a button's root element and a value, and updates the element to reflect
 * the new value.  No-op in the base class.
 * @param {Element} element The button's root element.
 * @param {string} value New value.
 */
goog.ui.ButtonRenderer.prototype.setValue = function(element, value) {};


/**
 * Takes a button's root element, and returns its tooltip text.
 * @param {Element} element The button's root element.
 * @return {string|undefined} The tooltip text.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.ButtonRenderer.prototype.getTooltip = function(element) {
  'use strict';
  return element.title;
};


/**
 * Takes a button's root element and a tooltip string, and updates the element
 * with the new tooltip.
 * @param {Element} element The button's root element.
 * @param {string} tooltip New tooltip text.
 * @protected
 */
goog.ui.ButtonRenderer.prototype.setTooltip = function(element, tooltip) {
  'use strict';
  if (element) {
    // Don't set a title attribute if there isn't a tooltip. Blank title
    // attributes can be interpreted incorrectly by screen readers.
    if (tooltip) {
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      element.title = tooltip;
    } else {
      element.removeAttribute('title');
    }
  }
};


/**
 * Collapses the border on one or both sides of the button, allowing it to be
 * combined with the adjacent button(s), forming a single UI componenet with
 * multiple targets.
 * @param {goog.ui.Button} button Button to update.
 * @param {number} sides Bitmap of one or more {@link goog.ui.ButtonSide}s for
 *     which borders should be collapsed.
 * @protected
 */
goog.ui.ButtonRenderer.prototype.setCollapsed = function(button, sides) {
  'use strict';
  var isRtl = button.isRightToLeft();
  var collapseLeftClassName =
      goog.getCssName(this.getStructuralCssClass(), 'collapse-left');
  var collapseRightClassName =
      goog.getCssName(this.getStructuralCssClass(), 'collapse-right');

  button.enableClassName(
      isRtl ? collapseRightClassName : collapseLeftClassName,
      !!(sides & goog.ui.ButtonSide.START));
  button.enableClassName(
      isRtl ? collapseLeftClassName : collapseRightClassName,
      !!(sides & goog.ui.ButtonSide.END));
};


/** @override */
goog.ui.ButtonRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.ButtonRenderer.CSS_CLASS;
};
