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
 * @fileoverview Tristate checkbox widget.
 *
 * @see ../demos/checkbox.html
 */

goog.provide('goog.ui.Checkbox');
goog.provide('goog.ui.Checkbox.State');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.string');
goog.require('goog.ui.CheckboxRenderer');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.registry');



/**
 * 3-state checkbox widget. Fires CHECK or UNCHECK events before toggled and
 * CHANGE event after toggled by user.
 * The checkbox can also be enabled/disabled and get focused and highlighted.
 *
 * @param {goog.ui.Checkbox.State=} opt_checked Checked state to set.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @param {goog.ui.CheckboxRenderer=} opt_renderer Renderer used to render or
 *     decorate the checkbox; defaults to {@link goog.ui.CheckboxRenderer}.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Checkbox = function(opt_checked, opt_domHelper, opt_renderer) {
  var renderer = opt_renderer || goog.ui.CheckboxRenderer.getInstance();
  goog.ui.Control.call(this, null, renderer, opt_domHelper);
  // The checkbox maintains its own tri-state CHECKED state.
  // The control class maintains DISABLED, ACTIVE, and FOCUSED (which enable tab
  // navigation, and keyHandling with SPACE).

  /**
   * Checked state of the checkbox.
   * @type {goog.ui.Checkbox.State}
   * @private
   */
  this.checked_ = goog.isDef(opt_checked) ?
      opt_checked : goog.ui.Checkbox.State.UNCHECKED;
};
goog.inherits(goog.ui.Checkbox, goog.ui.Control);
goog.tagUnsealableClass(goog.ui.Checkbox);


/**
 * Possible checkbox states.
 * @enum {?boolean}
 */
goog.ui.Checkbox.State = {
  CHECKED: true,
  UNCHECKED: false,
  UNDETERMINED: null
};


/**
 * Label element bound to the checkbox.
 * @type {Element}
 * @private
 */
goog.ui.Checkbox.prototype.label_ = null;


/**
 * @return {goog.ui.Checkbox.State} Checked state of the checkbox.
 */
goog.ui.Checkbox.prototype.getChecked = function() {
  return this.checked_;
};


/**
 * @return {boolean} Whether the checkbox is checked.
 * @override
 */
goog.ui.Checkbox.prototype.isChecked = function() {
  return this.checked_ == goog.ui.Checkbox.State.CHECKED;
};


/**
 * @return {boolean} Whether the checkbox is not checked.
 */
goog.ui.Checkbox.prototype.isUnchecked = function() {
  return this.checked_ == goog.ui.Checkbox.State.UNCHECKED;
};


/**
 * @return {boolean} Whether the checkbox is in partially checked state.
 */
goog.ui.Checkbox.prototype.isUndetermined = function() {
  return this.checked_ == goog.ui.Checkbox.State.UNDETERMINED;
};


/**
 * Sets the checked state of the checkbox.
 * @param {?boolean} checked The checked state to set.
 * @override
 */
goog.ui.Checkbox.prototype.setChecked = function(checked) {
  if (checked != this.checked_) {
    this.checked_ = /** @type {goog.ui.Checkbox.State} */ (checked);
    this.getRenderer().setCheckboxState(this.getElement(), this.checked_);
  }
};


/**
 * Sets the checked state for the checkbox.  Unlike {@link #setChecked},
 * doesn't update the checkbox's DOM.  Considered protected; to be called
 * only by renderer code during element decoration.
 * @param {goog.ui.Checkbox.State} checked New checkbox state.
 */
goog.ui.Checkbox.prototype.setCheckedInternal = function(checked) {
  this.checked_ = checked;
};


/**
 * Binds an HTML element to the checkbox which if clicked toggles the checkbox.
 * Behaves the same way as the 'label' HTML tag. The label element has to be the
 * direct or non-direct ancestor of the checkbox element because it will get the
 * focus when keyboard support is implemented.
 * Note: Control#enterDocument also sets aria-label on the element but
 * Checkbox#enterDocument sets aria-labeledby on the same element which
 * overrides the aria-label in all modern screen readers.
 *
 * @param {?Element} label The label control to set. If null, only the checkbox
 *     reacts to clicks.
 */
goog.ui.Checkbox.prototype.setLabel = function(label) {
  if (this.isInDocument()) {
    var wasFocused = this.isFocused();
    this.exitDocument();
    this.label_ = label;
    this.enterDocument();
    if (wasFocused) {
      this.getElementStrict().focus();
    }
  } else {
    this.label_ = label;
  }
};


/**
 * Toggles the checkbox. State transitions:
 * <ul>
 *   <li>unchecked -> checked
 *   <li>undetermined -> checked
 *   <li>checked -> unchecked
 * </ul>
 */
goog.ui.Checkbox.prototype.toggle = function() {
  this.setChecked(this.checked_ ? goog.ui.Checkbox.State.UNCHECKED :
      goog.ui.Checkbox.State.CHECKED);
};


/** @override */
goog.ui.Checkbox.prototype.enterDocument = function() {
  goog.ui.Checkbox.base(this, 'enterDocument');
  if (this.isHandleMouseEvents()) {
    var handler = this.getHandler();
    // Listen to the label, if it was set.
    if (this.label_) {
      // Any mouse events that happen to the associated label should have the
      // same effect on the checkbox as if they were happening to the checkbox
      // itself.
      handler.
          listen(this.label_, goog.events.EventType.CLICK,
              this.handleClickOrSpace_).
          listen(this.label_, goog.events.EventType.MOUSEOVER,
              this.handleMouseOver).
          listen(this.label_, goog.events.EventType.MOUSEOUT,
              this.handleMouseOut).
          listen(this.label_, goog.events.EventType.MOUSEDOWN,
              this.handleMouseDown).
          listen(this.label_, goog.events.EventType.MOUSEUP,
              this.handleMouseUp);
    }
    // Checkbox needs to explicitly listen for click event.
    handler.listen(this.getElement(),
        goog.events.EventType.CLICK, this.handleClickOrSpace_);
  }

  // Set aria label.
  var checkboxElement = this.getElementStrict();
  if (this.label_ && checkboxElement != this.label_ &&
      goog.string.isEmptyOrWhitespace(
          goog.a11y.aria.getLabel(checkboxElement))) {
    if (!this.label_.id) {
      this.label_.id = this.makeId('lbl');
    }
    goog.a11y.aria.setState(checkboxElement,
        goog.a11y.aria.State.LABELLEDBY,
        this.label_.id);
  }
};


/**
 * Fix for tabindex not being updated so that disabled checkbox is not
 * focusable. In particular this fails in Chrome.
 * Note: in general tabIndex=-1 will prevent from keyboard focus but enables
 * mouse focus, however in this case the control class prevents mouse focus.
 * @override
 */
goog.ui.Checkbox.prototype.setEnabled = function(enabled) {
  goog.ui.Checkbox.base(this, 'setEnabled', enabled);
  var el = this.getElement();
  if (el) {
    el.tabIndex = this.isEnabled() ? 0 : -1;
  }
};


/**
 * Handles the click event.
 * @param {!goog.events.BrowserEvent} e The event.
 * @private
 */
goog.ui.Checkbox.prototype.handleClickOrSpace_ = function(e) {
  e.stopPropagation();
  var eventType = this.checked_ ? goog.ui.Component.EventType.UNCHECK :
      goog.ui.Component.EventType.CHECK;
  if (this.isEnabled() && !e.target.href && this.dispatchEvent(eventType)) {
    e.preventDefault();  // Prevent scrolling in Chrome if SPACE is pressed.
    this.toggle();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};


/** @override */
goog.ui.Checkbox.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    this.performActionInternal(e);
    this.handleClickOrSpace_(e);
  }
  return false;
};


/**
 * Register this control so it can be created from markup.
 */
goog.ui.registry.setDecoratorByClassName(
    goog.ui.CheckboxRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Checkbox();
    });
