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
 * @fileoverview Input Date Picker implementation.  Pairs a
 * goog.ui.PopupDatePicker with an input element and handles the input from
 * either.
 *
 * @see ../demos/inputdatepicker.html
 */

goog.provide('goog.ui.InputDatePicker');

goog.require('goog.date.DateTime');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.ui.Component');
goog.require('goog.ui.DatePicker');
goog.require('goog.ui.PopupBase');
goog.require('goog.ui.PopupDatePicker');



/**
 * Input date picker widget.
 *
 * @param {goog.i18n.DateTimeFormat} dateTimeFormatter A formatter instance
 *     used to format the date picker's date for display in the input element.
 * @param {goog.i18n.DateTimeParse} dateTimeParser A parser instance used to
 *     parse the input element's string as a date to set the picker.
 * @param {goog.ui.DatePicker=} opt_datePicker Optional DatePicker.  This
 *     enables the use of a custom date-picker instance.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.InputDatePicker = function(
    dateTimeFormatter, dateTimeParser, opt_datePicker, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  this.dateTimeFormatter_ = dateTimeFormatter;
  this.dateTimeParser_ = dateTimeParser;

  this.popupDatePicker_ = new goog.ui.PopupDatePicker(
      opt_datePicker, opt_domHelper);
  this.addChild(this.popupDatePicker_);
  this.popupDatePicker_.setAllowAutoFocus(false);
};
goog.inherits(goog.ui.InputDatePicker, goog.ui.Component);
goog.tagUnsealableClass(goog.ui.InputDatePicker);


/**
 * Used to format the date picker's date for display in the input element.
 * @type {goog.i18n.DateTimeFormat}
 * @private
 */
goog.ui.InputDatePicker.prototype.dateTimeFormatter_ = null;


/**
 * Used to parse the input element's string as a date to set the picker.
 * @type {goog.i18n.DateTimeParse}
 * @private
 */
goog.ui.InputDatePicker.prototype.dateTimeParser_ = null;


/**
 * The instance of goog.ui.PopupDatePicker used to pop up and select the date.
 * @type {goog.ui.PopupDatePicker}
 * @private
 */
goog.ui.InputDatePicker.prototype.popupDatePicker_ = null;


/**
 * The element that the PopupDatePicker should be parented to. Defaults to the
 * body element of the page.
 * @type {Element}
 * @private
 */
goog.ui.InputDatePicker.prototype.popupParentElement_ = null;


/**
 * Returns the PopupDatePicker's internal DatePicker instance.  This can be
 * used to customize the date picker's styling.
 *
 * @return {goog.ui.DatePicker} The internal DatePicker instance.
 */
goog.ui.InputDatePicker.prototype.getDatePicker = function() {
  return this.popupDatePicker_.getDatePicker();
};


/**
 * Returns the PopupDatePicker instance.
 *
 * @return {goog.ui.PopupDatePicker} Popup instance.
 */
goog.ui.InputDatePicker.prototype.getPopupDatePicker = function() {
  return this.popupDatePicker_;
};


/**
 * Returns the selected date, if any.  Compares the dates from the date picker
 * and the input field, causing them to be synced if different.
 * @return {goog.date.Date?} The selected date, if any.
 */
goog.ui.InputDatePicker.prototype.getDate = function() {

  // The user expectation is that the date be whatever the input shows.
  // This method biases towards the input value to conform to that expectation.

  var inputDate = this.getInputValueAsDate_();
  var pickerDate = this.popupDatePicker_.getDate();

  if (inputDate && pickerDate) {
    if (!inputDate.equals(pickerDate)) {
      this.popupDatePicker_.setDate(inputDate);
    }
  } else {
    this.popupDatePicker_.setDate(null);
  }

  return inputDate;
};


/**
 * Sets the selected date.  See goog.ui.PopupDatePicker.setDate().
 * @param {goog.date.Date?} date The date to set.
 */
goog.ui.InputDatePicker.prototype.setDate = function(date) {
  this.popupDatePicker_.setDate(date);
};


/**
 * Sets the value of the input element.  This can be overridden to support
 * alternative types of input setting.
 *
 * @param {string} value The value to set.
 */
goog.ui.InputDatePicker.prototype.setInputValue = function(value) {
  var el = this.getElement();
  if (el.labelInput_) {
    var labelInput = /** @type {goog.ui.LabelInput} */ (el.labelInput_);
    labelInput.setValue(value);
  } else {
    el.value = value;
  }
};


/**
 * Returns the value of the input element.  This can be overridden to support
 * alternative types of input getting.
 *
 * @return {string} The input value.
 */
goog.ui.InputDatePicker.prototype.getInputValue = function() {
  var el = this.getElement();
  if (el.labelInput_) {
    var labelInput = /** @type {goog.ui.LabelInput} */ (el.labelInput_);
    return labelInput.getValue();
  } else {
    return el.value;
  }
};


/**
 * Sets the value of the input element from date object.
 *
 * @param {?goog.date.Date} date The value to set.
 * @private
 */
goog.ui.InputDatePicker.prototype.setInputValueAsDate_ = function(date) {
  this.setInputValue(date ? this.dateTimeFormatter_.format(date) : '');
};


/**
 * Gets the input element value and attempts to parse it as a date.
 *
 * @return {goog.date.Date?} The date object is returned if the parse
 *      is successful, null is returned on failure.
 * @private
 */
goog.ui.InputDatePicker.prototype.getInputValueAsDate_ = function() {
  var value = goog.string.trim(this.getInputValue());
  if (value) {
    var date = new goog.date.DateTime();
    // DateTime needed as parse assumes it can call getHours(), getMinutes(),
    // etc, on the date if hours and minutes aren't defined.
    if (this.dateTimeParser_.strictParse(value, date) > 0) {
      // Parser with YYYY format string will interpret 1 as year 1 A.D.
      // However, datepicker.setDate() method will change it into 1901.
      // Same is true for any other pattern when number entered by user is
      // different from number of digits in the pattern. (YY and 1 will be 1AD).
      // See i18n/datetimeparse.js
      // Conversion happens in goog.date.Date/DateTime constructor
      // when it calls new Date(year...). See ui/datepicker.js.
      return date;
    }
  }

  return null;
};


/**
 * Creates an input element for use with the popup date picker.
 * @override
 */
goog.ui.InputDatePicker.prototype.createDom = function() {
  this.setElementInternal(
      this.getDomHelper().createDom('input', {'type': 'text'}));
  this.popupDatePicker_.createDom();
};


/**
 * Sets the element that the PopupDatePicker should be parented to. If not set,
 * defaults to the body element of the page.
 * @param {Element} el The element that the PopupDatePicker should be parented
 *     to.
 */
goog.ui.InputDatePicker.prototype.setPopupParentElement = function(el) {
  this.popupParentElement_ = el;
};


/** @override */
goog.ui.InputDatePicker.prototype.enterDocument = function() {
  goog.ui.InputDatePicker.superClass_.enterDocument.call(this);
  var el = this.getElement();

  (this.popupParentElement_ || this.getDomHelper().getDocument().body).
      appendChild(this.popupDatePicker_.getElement());
  this.popupDatePicker_.enterDocument();
  this.popupDatePicker_.attach(el);

  // Set the date picker to have the input's initial value, if any.
  this.popupDatePicker_.setDate(this.getInputValueAsDate_());

  var handler = this.getHandler();
  handler.listen(this.popupDatePicker_, goog.ui.DatePicker.Events.CHANGE,
                 this.onDateChanged_);
  handler.listen(this.popupDatePicker_, goog.ui.PopupBase.EventType.SHOW,
                 this.onPopup_);
};


/** @override */
goog.ui.InputDatePicker.prototype.exitDocument = function() {
  goog.ui.InputDatePicker.superClass_.exitDocument.call(this);
  var el = this.getElement();

  this.popupDatePicker_.detach(el);
  this.popupDatePicker_.exitDocument();
  goog.dom.removeNode(this.popupDatePicker_.getElement());
};


/** @override */
goog.ui.InputDatePicker.prototype.decorateInternal = function(element) {
  goog.ui.InputDatePicker.superClass_.decorateInternal.call(this, element);

  this.popupDatePicker_.createDom();
};


/** @override */
goog.ui.InputDatePicker.prototype.disposeInternal = function() {
  goog.ui.InputDatePicker.superClass_.disposeInternal.call(this);
  this.popupDatePicker_.dispose();
  this.popupDatePicker_ = null;
  this.popupParentElement_ = null;
};


/**
 * See goog.ui.PopupDatePicker.showPopup().
 * @param {Element} element Reference element for displaying the popup -- popup
 *     will appear at the bottom-left corner of this element.
 */
goog.ui.InputDatePicker.prototype.showForElement = function(element) {
  this.popupDatePicker_.showPopup(element);
};


/**
 * See goog.ui.PopupDatePicker.hidePopup().
 */
goog.ui.InputDatePicker.prototype.hidePopup = function() {
  this.popupDatePicker_.hidePopup();
};


/**
 * Event handler for popup date picker popup events.
 *
 * @param {goog.events.Event} e popup event.
 * @private
 */
goog.ui.InputDatePicker.prototype.onPopup_ = function(e) {
  var inputValueAsDate = this.getInputValueAsDate_();
  this.setDate(inputValueAsDate);
  // don't overwrite the input value with empty date if input is not valid
  if (inputValueAsDate) {
    this.setInputValueAsDate_(this.getDatePicker().getDate());
  }
};


/**
 * Event handler for date change events.  Called when the date changes.
 *
 * @param {goog.ui.DatePickerEvent} e Date change event.
 * @private
 */
goog.ui.InputDatePicker.prototype.onDateChanged_ = function(e) {
  this.setInputValueAsDate_(e.date);
};
