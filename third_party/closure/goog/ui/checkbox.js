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
*
 * @see ../demos/checkbox.html
 */

goog.provide('goog.ui.Checkbox');
goog.provide('goog.ui.Checkbox.State');

goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.object');
goog.require('goog.ui.Component.EventType');
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
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.Checkbox = function(opt_checked, opt_domHelper) {
  var checkboxRenderer = goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.ControlRenderer, goog.ui.Checkbox.CSS_CLASS);
  goog.ui.Control.call(this, null, checkboxRenderer, opt_domHelper);
  // The checkbox maintains its own tri-state CHECKED state.
  // The control class maintains DISABLED and FOCUSED (which enable tab
  // navigation, and keyHandling with SPACE).
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);

  /**
   * Checked state of the checkbox.
   * @type {goog.ui.Checkbox.State}
   * @private
   */
  this.checked_ = goog.isDef(opt_checked) ?
      opt_checked : goog.ui.Checkbox.State.UNCHECKED;
};
goog.inherits(goog.ui.Checkbox, goog.ui.Control);


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
 * Checkbox CSS class names.
 * @enum {string}
 */
goog.ui.Checkbox.Css = {
  CHECKED: goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'checked'),
  UNCHECKED: goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'unchecked'),
  UNDETERMINED: goog.getCssName(goog.ui.Checkbox.CSS_CLASS, 'undetermined')
};


/**
 * Map of component states to state-specific structural class names.
 * @type {Object}
 * @private
 */
goog.ui.Checkbox.classByState_ = goog.object.create(
    goog.ui.Checkbox.State.CHECKED, goog.ui.Checkbox.Css.CHECKED,
    goog.ui.Checkbox.State.UNCHECKED, goog.ui.Checkbox.Css.UNCHECKED,
    goog.ui.Checkbox.State.UNDETERMINED, goog.ui.Checkbox.Css.UNDETERMINED);


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
  this.decorateInternal(this.getDomHelper().createElement('span'));
};


/** @inheritDoc */
goog.ui.Checkbox.prototype.decorateInternal = function(element) {
  goog.ui.Checkbox.superClass_.decorateInternal.call(this, element);
  var classes = goog.dom.classes.get(element);
  // Update the checked state of the element based on its css classNames
  // with the following order: undetermined -> checked -> unchecked.
  if (goog.array.contains(classes, goog.ui.Checkbox.Css.UNDETERMINED)) {
    this.checked_ = goog.ui.Checkbox.State.UNDETERMINED;
  } else if (goog.array.contains(classes, goog.ui.Checkbox.Css.CHECKED)) {
    this.checked_ = goog.ui.Checkbox.State.CHECKED;
  } else if (goog.array.contains(classes, goog.ui.Checkbox.Css.UNCHECKED)) {
    this.checked_ = goog.ui.Checkbox.State.UNCHECKED;
  } else {
    this.updateView();
  }
};


/** @inheritDoc */
goog.ui.Checkbox.prototype.enterDocument = function() {
  goog.ui.Checkbox.superClass_.enterDocument.call(this);
  if (this.isHandleMouseEvents()) {
    this.getHandler().listen(this.label_ || this.getElement(),
        goog.events.EventType.CLICK, this.handleClickOrSpace_);
  }
};


/**
 * Updates the CSS class names after the checked state has changed.
 * @protected
 */
goog.ui.Checkbox.prototype.updateView = function() {
  var el = this.getElement();
  if (el) {
    var classToAdd = goog.ui.Checkbox.classByState_[this.checked_];
    var elementClassNames = goog.dom.classes.get(el);
    if (goog.array.contains(elementClassNames, classToAdd)) {
      return;
    }
    var classesToAssign = [classToAdd];
    var checkStateClasses = goog.object.getValues(goog.ui.Checkbox.Css);
    goog.array.forEach(elementClassNames, function(name) {
      if (!goog.array.contains(checkStateClasses, name)) {
        classesToAssign.push(name);
      }
    });
    goog.dom.classes.set(el, classesToAssign.join(' '));
  }
};


/**
 * Fix for tabindex not being updated so that disabled checkbox is not
 * focusable. In particular this fails in Chrome.
 * Note: in general tabIndex=-1 will prevent from keyboard focus but enables
 * mouse focus, however in this case the control class prevents mouse focus.
 * @inheritDoc
 */
goog.ui.Checkbox.prototype.setEnabled = function(enabled) {
  goog.ui.Checkbox.superClass_.setEnabled.call(this, enabled);
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
  if (this.isEnabled() && this.dispatchEvent(eventType)) {
    this.toggle();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};


/**
 * @inheritDoc
 */
goog.ui.Checkbox.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    this.handleClickOrSpace_(e);
  }
  return false;
};


/**
 * Register this control so it can be created from markup.
 */
// TODO(user): support setLabel from markup
goog.ui.registry.setDecoratorByClassName(
    goog.ui.Checkbox.CSS_CLASS,
    function() {
      return new goog.ui.Checkbox();
    });
