// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Tristate checkbox widget.
 *
 * @see ../demos/checkbox.html
 */

goog.provide('goog.ui.Checkbox');
goog.provide('goog.ui.Checkbox.State');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');



/**
 * 3-state checkbox widget. Fires CHECK or UNCHECK events before toggled and
 * CHANGE event after toggled by user.
 * TODO: Add keyboard support.
 *
 * @param {goog.ui.Checkbox.State} opt_checked Checked state to set.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.Checkbox = function(opt_checked) {
  goog.ui.Component.call(this);
  if (goog.isDef(opt_checked)) {
    this.checked_ = opt_checked;
  }
};
goog.inherits(goog.ui.Checkbox, goog.ui.Component);


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
 * CSS class for checkbox.
 * @type {string}
 */
goog.ui.Checkbox.CSS_CLASS = goog.getCssName('goog-checkbox');


/**
 * Checked state of the checkbox.
 * @type {goog.ui.Checkbox.State}
 * @private
 */
goog.ui.Checkbox.prototype.checked_ = goog.ui.Checkbox.State.UNCHECKED;


/**
 * Whether the checkbox is enabled.
 * @type {boolean}
 * @private
 */
goog.ui.Checkbox.prototype.enabled_ = true;


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
 * @param {goog.ui.Checkbox.State} checked The checked state to set.
 */
goog.ui.Checkbox.prototype.setChecked = function(checked) {
  if (checked != this.checked_) {
    this.checked_ = checked;
    this.updateView();
  }
};


/**
 * @return {boolean} Whether the checkbox is enabled.
 */
goog.ui.Checkbox.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * Sets whether the checkbox is enabled.
 * @param {boolean} enabled New value of the enabled flag.
 */
goog.ui.Checkbox.prototype.setEnabled = function(enabled) {
  if (enabled != this.enabled_) {
    this.enabled_ = enabled;
    this.updateView();
  }
};


/**
 * Binds an HTML element to the checkbox which if clicked toggles the checkbox.
 * Behaves the same way as the 'label' HTML tag. The label element has to be the
 * direct or non-direct ancestor of the checkbox element because it will get the
 * focus when keyboard support is implemented.
 *
 * @param {Element} label The label control to set. If null, only the checkbox
 *     reacts to clicks.
 */
goog.ui.Checkbox.prototype.setLabel = function(label) {
  if (this.isInDocument()) {
    this.exitDocument();
    this.label_ = label;
    this.enterDocument();
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
  this.checked_ = this.checked_ ? goog.ui.Checkbox.State.UNCHECKED :
      goog.ui.Checkbox.State.CHECKED;
  this.updateView();
};


/** @inheritDoc */
goog.ui.Checkbox.prototype.createDom = function() {
  this.decorateInternal(goog.dom.$dom('span'));
};


/** @inheritDoc */
goog.ui.Checkbox.prototype.decorateInternal = function(element) {
  goog.ui.Checkbox.superClass_.decorateInternal.call(this, element);
  goog.dom.classes.add(element, goog.ui.Checkbox.CSS_CLASS);
  this.updateView();
};


/** @inheritDoc */
goog.ui.Checkbox.prototype.enterDocument = function() {
  goog.ui.Checkbox.superClass_.enterDocument.call(this);
  this.getHandler().listen(this.label_ || this.getElement(),
      goog.events.EventType.CLICK, this.handleClick_);
};


/**
 * Updates the CSS class names after the checked state has changed.
 * @protected
 */
goog.ui.Checkbox.prototype.updateView = function() {
  var el = this.getElement();
  if (el) {
    goog.dom.classes.enable(el,
        goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'unchecked'),
        this.isUnchecked());
    goog.dom.classes.enable(el,
        goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'checked'),
        this.isChecked());
    goog.dom.classes.enable(el,
        goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'undetermined'),
        this.isUndetermined());
    goog.dom.classes.enable(el,
        goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'disabled'),
        !this.enabled_);
  }
};


/**
 * Handles the click event.
 * @private
 */
goog.ui.Checkbox.prototype.handleClick_ = function() {
  var eventType = this.checked_ ? goog.ui.Component.EventType.UNCHECK :
      goog.ui.Component.EventType.CHECK;
  if (this.enabled_ && this.dispatchEvent(eventType)) {
    this.toggle();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};
