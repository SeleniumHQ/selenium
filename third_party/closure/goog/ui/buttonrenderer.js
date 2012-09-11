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
 * @fileoverview Default renderer for {@link goog.ui.Button}s.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.ButtonRenderer');

goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.Role');
goog.require('goog.dom.a11y.State');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlRenderer');



/**
 * Default renderer for {@link goog.ui.Button}s.  Extends the superclass with
 * the following button-specific API methods:
 * <ul>
 *   <li>{@code getValue} - returns the button element's value
 *   <li>{@code setValue} - updates the button element to reflect its new value
 *   <li>{@code getTooltip} - returns the button element's tooltip text
 *   <li>{@code setTooltip} - updates the button element's tooltip text
 *   <li>{@code setCollapsed} - removes one or both of the button element's
 *       borders
 * </ul>
 * For alternate renderers, see {@link goog.ui.NativeButtonRenderer},
 * {@link goog.ui.CustomButtonRenderer}, and {@link goog.ui.FlatButtonRenderer}.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.ButtonRenderer = function() {
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
 * @return {goog.dom.a11y.Role|undefined} ARIA role.
 * @override
 */
goog.ui.ButtonRenderer.prototype.getAriaRole = function() {
  return goog.dom.a11y.Role.BUTTON;
};


/**
 * Updates the button's ARIA (accessibility) state if the button is being
 * treated as a checkbox.
 * @param {Element} element Element whose ARIA state is to be updated.
 * @param {goog.ui.Component.State} state Component state being enabled or
 *     disabled.
 * @param {boolean} enable Whether the state is being enabled or disabled.
 * @protected
 * @override
 */
goog.ui.ButtonRenderer.prototype.updateAriaState = function(element, state,
    enable) {
  // If button has CHECKED state, assign ARIA atrribute aria-pressed
  if (state == goog.ui.Component.State.CHECKED) {
    goog.dom.a11y.setState(element, goog.dom.a11y.State.PRESSED, enable);
  } else {
    goog.ui.ButtonRenderer.superClass_.updateAriaState.call(this, element,
        state, enable);
  }
};


/** @override */
goog.ui.ButtonRenderer.prototype.createDom = function(button) {
  var element = goog.ui.ButtonRenderer.superClass_.createDom.call(this, button);

  var tooltip = button.getTooltip();
  if (tooltip) {
    this.setTooltip(element, tooltip);
  }

  var value = button.getValue();
  if (value) {
    this.setValue(element, value);
  }

  // If this is a toggle button, set ARIA state
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED,
                         button.isChecked());
  }

  return element;
};


/** @override */
goog.ui.ButtonRenderer.prototype.decorate = function(button, element) {
  // The superclass implementation takes care of common attributes; we only
  // need to set the value and the tooltip.
  element = goog.ui.ButtonRenderer.superClass_.decorate.call(this, button,
      element);

  button.setValueInternal(this.getValue(element));
  button.setTooltipInternal(this.getTooltip(element));

  // If this is a toggle button, set ARIA state
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED,
                         button.isChecked());
  }

  return element;
};


/**
 * Takes a button's root element, and returns the value associated with it.
 * No-op in the base class.
 * @param {Element} element The button's root element.
 * @return {string|undefined} The button's value (undefined if none).
 */
goog.ui.ButtonRenderer.prototype.getValue = goog.nullFunction;


/**
 * Takes a button's root element and a value, and updates the element to reflect
 * the new value.  No-op in the base class.
 * @param {Element} element The button's root element.
 * @param {string} value New value.
 */
goog.ui.ButtonRenderer.prototype.setValue = goog.nullFunction;


/**
 * Takes a button's root element, and returns its tooltip text.
 * @param {Element} element The button's root element.
 * @return {string|undefined} The tooltip text.
 */
goog.ui.ButtonRenderer.prototype.getTooltip = function(element) {
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
  if (element) {
    element.title = tooltip || '';
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
  var isRtl = button.isRightToLeft();
  var collapseLeftClassName =
      goog.getCssName(this.getStructuralCssClass(), 'collapse-left');
  var collapseRightClassName =
      goog.getCssName(this.getStructuralCssClass(), 'collapse-right');

  button.enableClassName(isRtl ? collapseRightClassName : collapseLeftClassName,
      !!(sides & goog.ui.ButtonSide.START));
  button.enableClassName(isRtl ? collapseLeftClassName : collapseRightClassName,
      !!(sides & goog.ui.ButtonSide.END));
};


/** @override */
goog.ui.ButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.ButtonRenderer.CSS_CLASS;
};
