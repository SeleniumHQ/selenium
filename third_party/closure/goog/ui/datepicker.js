// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Date picker implementation.
 *
*
 * @see ../demos/datepicker.html
 */

goog.provide('goog.ui.DatePicker');
goog.provide('goog.ui.DatePicker.Events');
goog.provide('goog.ui.DatePickerEvent');

goog.require('goog.date');
goog.require('goog.date.Date');
goog.require('goog.date.Interval');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * DatePicker widget. Allows a single date to be selected from a calendar like
 * view.
 *
 * @param {goog.date.Date|Date=} opt_date Date to initialize the date picker
 *     with, defaults to the current date.
 * @param {Object=} opt_dateTimeSymbols Date and time symbols to use.
 *     Defaults to goog.i18n.DateTimeSymbols if not set.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.DatePicker = function(opt_date, opt_dateTimeSymbols) {
  goog.ui.Component.call(this);

  /**
   * Date and time symbols to use.
   * @type {Object}
   * @private
   */
  this.symbols_ = opt_dateTimeSymbols || goog.i18n.DateTimeSymbols;

  this.wdayNames_ = this.symbols_.SHORTWEEKDAYS;

  /**
   * Selected date.
   * @type {goog.date.Date}
   * @private
   */
  this.date_ = new goog.date.Date(opt_date);
  this.date_.setFirstWeekCutOffDay(this.symbols_.FIRSTWEEKCUTOFFDAY);
  this.date_.setFirstDayOfWeek(this.symbols_.FIRSTDAYOFWEEK);

  /**
   * Active month.
   * @type {goog.date.Date}
   * @private
   */
  this.activeMonth_ = this.date_.clone();
  this.activeMonth_.setDate(1);

  /**
   * Class names to apply to the weekday columns.
   * @type {Array.<string>}
   * @private
   */
  this.wdayStyles_ = ['', '', '', '', '', '', ''];
  this.wdayStyles_[this.symbols_.WEEKENDRANGE[0]] =
      goog.getCssName('goog-date-picker-wkend-start');
  this.wdayStyles_[this.symbols_.WEEKENDRANGE[1]] =
      goog.getCssName('goog-date-picker-wkend-end');

  /**
   * Object that is being used to cache key handlers.
   * @type {Object}
   * @private
   */
  this.keyHandlers_ = {};
};
goog.inherits(goog.ui.DatePicker, goog.ui.Component);


/**
 * Flag indicating if the number of weeks shown should be fixed.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.showFixedNumWeeks_ = true;


/**
 * Flag indicating if days from other months should be shown.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.showOtherMonths_ = true;


/**
 * Flag indicating if extra week(s) always should be added at the end. If not
 * set the extra week is added at the beginning if the number of days shown
 * from the previous month is less then the number from the next month.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.extraWeekAtEnd_ = true;


/**
 * Flag indicating if week numbers should be shown.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.showWeekNum_ = true;


/**
 * Flag indicating if weekday names should be shown.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.showWeekdays_ = true;


/**
 * Flag indicating if none is a valid selection. Also controls if the none
 * button should be shown or not.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.allowNone_ = true;


/**
 * Flag indicating if the today button should be shown.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.showToday_ = true;


/**
 * Flag indicating if the picker should use a simple navigation menu that only
 * contains controls for navigating to the next and previous month. The default
 * navigation menu contains controls for navigating to the next/previous month,
 * next/previous year, and menus for jumping to specific months and years.
 * @type {boolean}
 * @private
 */
goog.ui.DatePicker.prototype.simpleNavigation_ = false;


/**
 * Custom decorator function. Takes a goog.date.Date object, returns a String
 * representing a CSS class or null if no special styling applies
 * @type {Function}
 * @private
 */
goog.ui.DatePicker.prototype.decoratorFunction_ = null;


/**
 * Next unique instance ID of a datepicker cell.
 * @type {number}
 * @private
 */
goog.ui.DatePicker.nextId_ = 0;


/**
 * Constants for event names
 *
 * @type {Object}
 */
goog.ui.DatePicker.Events = {
  CHANGE: 'change',
  SELECT: 'select'
};


/**
 * @deprecated Use isInDocument.
 */
goog.ui.DatePicker.prototype.isCreated =
    goog.ui.DatePicker.prototype.isInDocument;


/**
 * @return {number} The first day of week, 0 = Monday, 6 = Sunday.
 */
goog.ui.DatePicker.prototype.getFirstWeekday = function() {
  return this.activeMonth_.getFirstDayOfWeek();
};


/**
 * Returns the class name associated with specified weekday.
 * @param {number} wday The week day number to get the class name for.
 * @return {string} The class name associated with specified weekday.
 */
goog.ui.DatePicker.prototype.getWeekdayClass = function(wday) {
  return this.wdayStyles_[wday];
};


/**
 * @return {boolean} Whether a fixed number of weeks should be showed. If not
 *     only weeks for the current month will be shown.
 */
goog.ui.DatePicker.prototype.getShowFixedNumWeeks = function() {
  return this.showFixedNumWeeks_;
};


/**
 * @return {boolean} Whether a days from the previous and/or next month should
 *     be shown.
 */
goog.ui.DatePicker.prototype.getShowOtherMonths = function() {
  return this.showOtherMonths_;
};


/**
 * @return {boolean} Whether a the extra week(s) added always should be at the
 *     end. Only applicable if a fixed number of weeks are shown.
 */
goog.ui.DatePicker.prototype.getExtraWeekAtEnd = function() {
  return this.extraWeekAtEnd_;
};


/**
 * @return {boolean} Whether week numbers should be shown.
 */
goog.ui.DatePicker.prototype.getShowWeekNum = function() {
  return this.showWeekNum_;
};


/**
 * @return {boolean} Whether weekday names should be shown.
 */
goog.ui.DatePicker.prototype.getShowWeekdayNames = function() {
  return this.showWeekdays_;
};


/**
 * @return {boolean} Whether none is a valid selection.
 */
goog.ui.DatePicker.prototype.getAllowNone = function() {
  return this.allowNone_;
};


/**
 * @return {boolean} Whether the today button should be shown.
 */
goog.ui.DatePicker.prototype.getShowToday = function() {
  return this.showToday_;
};


/**
 * Sets the first day of week
 *
 * @param {number} wday Week day, 0 = Monday, 6 = Sunday.
 */
goog.ui.DatePicker.prototype.setFirstWeekday = function(wday) {
  this.activeMonth_.setFirstDayOfWeek(wday);
  this.updateCalendarGrid_();
  this.redrawWeekdays_();
};


/**
 * Sets class name associated with specified weekday.
 *
 * @param {number} wday Week day, 0 = Monday, 6 = Sunday.
 * @param {string} className Class name.
 */
goog.ui.DatePicker.prototype.setWeekdayClass = function(wday, className) {
  this.wdayStyles_[wday] = className;
  this.redrawCalendarGrid_();
};


/**
 * Sets whether a fixed number of weeks should be showed. If not only weeks
 * for the current month will be showed.
 *
 * @param {boolean} b Whether a fixed number of weeks should be showed.
 */
goog.ui.DatePicker.prototype.setShowFixedNumWeeks = function(b) {
  this.showFixedNumWeeks_ = b;
  this.updateCalendarGrid_();
};


/**
 * Sets whether a days from the previous and/or next month should be shown.
 *
 * @param {boolean} b Whether a days from the previous and/or next month should
 *     be shown.
 */
goog.ui.DatePicker.prototype.setShowOtherMonths = function(b) {
  this.showOtherMonths_ = b;
  this.redrawCalendarGrid_();
};


/**
 * Sets whether the picker should use a simple navigation menu that only
 * contains controls for navigating to the next and previous month. The default
 * navigation menu contains controls for navigating to the next/previous month,
 * next/previous year, and menus for jumping to specific months and years.
 *
 * @param {boolean} b Whether to use a simple navigation menu.
 */
goog.ui.DatePicker.prototype.setUseSimpleNavigationMenu = function(b) {
  this.simpleNavigation_ = b;
  this.updateNavigationRow_();
  this.updateCalendarGrid_();
};


/**
 * Sets whether a the extra week(s) added always should be at the end. Only
 * applicable if a fixed number of weeks are shown.
 *
 * @param {boolean} b Whether a the extra week(s) added always should be at the
 *     end.
 */
goog.ui.DatePicker.prototype.setExtraWeekAtEnd = function(b) {
  this.extraWeekAtEnd_ = b;
  this.updateCalendarGrid_();
};


/**
 * Sets whether week numbers should be shown.
 *
 * @param {boolean} b Whether week numbers should be shown.
 */
goog.ui.DatePicker.prototype.setShowWeekNum = function(b) {
  this.showWeekNum_ = b;
  // The navigation row may rely on the number of visible columns,
  // so we update it when adding/removing the weeknum column.
  this.updateNavigationRow_();
  this.updateCalendarGrid_();
};


/**
 * Sets whether weekday names should be shown.
 *
 * @param {boolean} b Whether weekday names should be shown.
 */
goog.ui.DatePicker.prototype.setShowWeekdayNames = function(b) {
  this.showWeekdays_ = b;
  this.redrawCalendarGrid_();
};


/**
 * Sets whether the picker uses narrow weekday names ('M', 'T', 'W', ...).
 *
 * The default behavior is to use short names ('Mon', 'Tue', 'Wed', ...).
 *
 * @param {boolean} b Whether to use narrow weekday names.
 */
goog.ui.DatePicker.prototype.setUseNarrowWeekdayNames = function(b) {
  this.wdayNames_ = b ? this.symbols_.NARROWWEEKDAYS :
      this.symbols_.SHORTWEEKDAYS;
  this.redrawWeekdays_();
};


/**
 * Sets whether none is a valid selection.
 *
 * @param {boolean} b Whether none is a valid selection.
 */
goog.ui.DatePicker.prototype.setAllowNone = function(b) {
  this.allowNone_ = b;
  if (this.elNone_) {
    this.updateTodayAndNone_();
  }
};


/**
 * Sets whether the today button should be shown.
 *
 * @param {boolean} b Whether the today button should be shown.
 */
goog.ui.DatePicker.prototype.setShowToday = function(b) {
  this.showToday_ = b;
  if (this.elToday_) {
    this.updateTodayAndNone_();
  }
};


/**
 * Updates the display style of the None and Today buttons as well as hides the
 * table foot if both are hidden.
 * @private
 */
goog.ui.DatePicker.prototype.updateTodayAndNone_ = function() {
  goog.style.showElement(this.elToday_, this.showToday_);
  goog.style.showElement(this.elNone_, this.allowNone_);
  goog.style.showElement(this.tableFoot_, this.showToday_ || this.allowNone_);
};


/**
 * Sets the decorator function. The function should have the interface of
 *   {string} f({goog.date.Date});
 * and return a String representing a CSS class to decorate the cell
 * corresponding to the date specified.
 *
 * @param {Function} f The decorator function.
 */
goog.ui.DatePicker.prototype.setDecorator = function(f) {
  this.decoratorFunction_ = f;
};


/**
 * Changes the active month to the previous one.
 */
goog.ui.DatePicker.prototype.previousMonth = function() {
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.MONTHS, -1));
  this.updateCalendarGrid_();
};


/**
 * Changes the active month to the next one.
 */
goog.ui.DatePicker.prototype.nextMonth = function() {
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.MONTHS, 1));
  this.updateCalendarGrid_();
};


/**
 * Changes the active year to the previous one.
 */
goog.ui.DatePicker.prototype.previousYear = function() {
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.YEARS, -1));
  this.updateCalendarGrid_();
};


/**
 * Changes the active year to the next one.
 */
goog.ui.DatePicker.prototype.nextYear = function() {
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.YEARS, 1));
  this.updateCalendarGrid_();
};


/**
 * Selects the current date.
 */
goog.ui.DatePicker.prototype.selectToday = function() {
  this.setDate(new goog.date.Date());
};


/**
 * Clears the selection.
 */
goog.ui.DatePicker.prototype.selectNone = function() {
  if (this.allowNone_) {
    this.setDate(null);
  }
};


/**
 * @return {goog.date.Date} The selected date.
 */
goog.ui.DatePicker.prototype.getDate = function() {
  return this.date_;
};


/**
 * Sets the selected date.
 *
 * @param {goog.date.Date|Date} date Date to select or null to select nothing.
 */
goog.ui.DatePicker.prototype.setDate = function(date) {
  // Check if date has been changed
  var changed = date != this.date_ &&
      !(date && this.date_ &&
        date.getFullYear() == this.date_.getFullYear() &&
        date.getMonth() == this.date_.getMonth() &&
        date.getDate() == this.date_.getDate());

  // Set current date to clone of supplied goog.date.Date or Date.
  this.date_ = date && new goog.date.Date(date);

  // Set current month
  if (date) {
    this.activeMonth_.set(this.date_);
    this.activeMonth_.setDate(1);
  }

  // Update calendar grid even if the date has not changed as even if today is
  // selected another month can be displayed.
  this.updateCalendarGrid_();

  // TODO(user): Standardize selection and change events with other components.
  // Fire select event.
  var selectEvent = new goog.ui.DatePickerEvent(
      goog.ui.DatePicker.Events.SELECT, this, this.date_);
  this.dispatchEvent(selectEvent);

  // Fire change event.
  if (changed) {
    var changeEvent = new goog.ui.DatePickerEvent(
        goog.ui.DatePicker.Events.CHANGE, this, this.date_);
    this.dispatchEvent(changeEvent);
  }
};


/**
 * Updates the navigation row (navigating months and maybe years) in the navRow_
 * element of a created picker.
 * @private
 */
goog.ui.DatePicker.prototype.updateNavigationRow_ = function() {
  if (!this.elNavRow_) {
    return;
  }
  var row = this.elNavRow_;

  // Clear the navigation row.
  while (row.firstChild) {
    row.removeChild(row.firstChild);
  }
  // Populate the navigation row according to the configured navigation mode.
  var dom = goog.dom.getDomHelper(row);
  var cell, monthCell, yearCell;

  if (this.simpleNavigation_) {
    cell = dom.createElement('td');
    cell.colSpan = this.showWeekNum_ ? 1 : 2;
    this.createButton_(cell, '\u00AB', this.previousMonth);  // <<
    row.appendChild(cell);

    cell = dom.createElement('td');
    cell.colSpan = this.showWeekNum_ ? 6 : 5;
    cell.className = goog.getCssName('goog-date-picker-monthyear');
    row.appendChild(cell);
    this.elMonthYear_ = cell;

    cell = dom.createElement('td');
    this.createButton_(cell, '\u00BB', this.nextMonth);  // >>
    row.appendChild(cell);

  } else {
    var fullDateFormat = this.symbols_.DATEFORMATS[
        goog.i18n.DateTimeFormat.Format.FULL_DATE].toLowerCase();

    monthCell = dom.createElement('td');
    monthCell.colSpan = 5;
    this.createButton_(monthCell, '\u00AB', this.previousMonth);  // <<
    this.elMonth_ = this.createButton_(
        monthCell, '', this.showMonthMenu_,
        goog.getCssName('goog-date-picker-month'));
    this.createButton_(monthCell, '\u00BB', this.nextMonth);  // >>

    yearCell = dom.createElement('td');
    yearCell.colSpan = 3;
    this.createButton_(yearCell, '\u00AB', this.previousYear);  // <<
    this.elYear_ = this.createButton_(yearCell, '', this.showYearMenu_,
                                      goog.getCssName('goog-date-picker-year'));
    this.createButton_(yearCell, '\u00BB', this.nextYear);  // >>

    // If the date format has year ('y') appearing first before month ('m'),
    // show the year on the left hand side of the datepicker popup.  Otherwise,
    // show the month on the left side.  This check assumes the data to be
    // valid, and that all date formats contain month and year.
    if (fullDateFormat.indexOf('y') < fullDateFormat.indexOf('m')) {
      row.appendChild(yearCell);
      row.appendChild(monthCell);
    } else {
      row.appendChild(monthCell);
      row.appendChild(yearCell);
    }
  }
};


/** @inheritDoc */
goog.ui.DatePicker.prototype.decorateInternal = function(el) {
  goog.ui.DatePicker.superClass_.decorateInternal.call(this, el);

  el.className = goog.getCssName('goog-date-picker');

  var dom = goog.dom.getDomHelper(el);

  var table = dom.createElement('table');
  var thead = dom.createElement('thead');
  var tbody = dom.createElement('tbody');
  var tfoot = dom.createElement('tfoot');

  goog.dom.a11y.setRole(tbody, 'grid');
  tbody.tabIndex = '0';

  // As per comment in colorpicker: table.tBodies and table.tFoot should not be
  // used because of a bug in Safari, hence using an instance variable
  this.tableBody_ = tbody;
  this.tableFoot_ = tfoot;

  var row = dom.createDom('tr', goog.getCssName('goog-date-picker-head'));
  this.elNavRow_ = row;
  this.updateNavigationRow_();

  thead.appendChild(row);

  var cell;
  this.elTable_ = [];
  for (var i = 0; i < 7; i++) {
    row = dom.createElement('tr');
    this.elTable_[i] = [];
    for (var j = 0; j < 8; j++) {
      cell = dom.createElement(j == 0 || i == 0 ? 'th' : 'td');
      if ((j == 0 || i == 0) && j != i) {
        cell.className = (j == 0) ? goog.getCssName('goog-date-picker-week') :
            goog.getCssName('goog-date-picker-wday');
        goog.dom.a11y.setRole(cell, j == 0 ? 'rowheader' : 'columnheader');
      }
      row.appendChild(cell);
      this.elTable_[i][j] = cell;
    }
    tbody.appendChild(row);
  }

  row = dom.createDom('tr', goog.getCssName('goog-date-picker-foot'));
  cell = dom.createDom('td',
      {colSpan: 2, className: goog.getCssName('goog-date-picker-today-cont')});

  /** @desc Label for button that selects the current date. */
  var MSG_DATEPICKER_TODAY_BUTTON_LABEL = goog.getMsg('Today');
  this.elToday_ = this.createButton_(cell, MSG_DATEPICKER_TODAY_BUTTON_LABEL,
                                     this.selectToday);
  row.appendChild(cell);

  cell = dom.createDom('td', {colSpan: 4});
  row.appendChild(cell);

  cell = dom.createElement('td');
  cell.colSpan = 2;
  cell.className = goog.getCssName('goog-date-picker-none-cont');

  /**
   * @desc Label for button that clears the selection.
   */
  var MSG_DATEPICKER_NONE = goog.getMsg('None');
  this.elNone_ = this.createButton_(cell, MSG_DATEPICKER_NONE, this.selectNone);
  row.appendChild(cell);

  tfoot.appendChild(row);
  this.updateTodayAndNone_();

  table.cellSpacing = '0';
  table.cellPadding = '0';
  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);
  el.appendChild(table);

  this.redrawWeekdays_();
  this.updateCalendarGrid_();

  el.tabIndex = 0;
};


/** @inheritDoc */
goog.ui.DatePicker.prototype.createDom = function() {
  goog.ui.DatePicker.superClass_.createDom.call(this);
  this.decorateInternal(this.getElement());
};


/** @inheritDoc */
goog.ui.DatePicker.prototype.enterDocument = function() {
  goog.ui.DatePicker.superClass_.enterDocument.call(this);

  var eh = this.getHandler();
  eh.listen(this.tableBody_, goog.events.EventType.CLICK,
      this.handleGridClick_);
  eh.listen(this.getKeyHandlerForElement_(this.getElement()),
      goog.events.KeyHandler.EventType.KEY, this.handleGridKeyPress_);
};


/** @inheritDoc */
goog.ui.DatePicker.prototype.exitDocument = function() {
  goog.ui.DatePicker.superClass_.exitDocument.call(this);
  this.destroyMenu_();
  for (var uid in this.keyHandlers_) {
    this.keyHandlers_[uid].dispose();
  }
  this.keyHandlers_ = {};
};


/**
 * @deprecated Use decorate instead.
 */
goog.ui.DatePicker.prototype.create =
    goog.ui.DatePicker.prototype.decorate;


/** @inheritDoc */
goog.ui.DatePicker.prototype.disposeInternal = function() {
  goog.ui.DatePicker.superClass_.disposeInternal.call(this);

  this.elTable_ = null;
  this.tableBody_ = null;
  this.tableFoot_ = null;
  this.elNavRow_ = null;
  this.elMonth_ = null;
  this.elMonthYear_ = null;
  this.elYear_ = null;
  this.elToday_ = null;
  this.elNone_ = null;
};


/**
 * Click handler for date grid.
 *
 * @param {goog.events.BrowserEvent} event Click event.
 * @private
 */
goog.ui.DatePicker.prototype.handleGridClick_ = function(event) {
  if (event.target.tagName == 'TD') {
    // colIndex/rowIndex is broken in Safari, find position by looping
    var el, x = -2, y = -2; // first col/row is for weekday/weeknum
    for (el = event.target; el; el = el.previousSibling, x++) {}
    for (el = event.target.parentNode; el; el = el.previousSibling, y++) {}
    var obj = this.grid_[y][x];
    this.setDate(obj.clone());
  }
};


/**
 * Keypress handler for date grid.
 *
 * @param {goog.events.BrowserEvent} event Keypress event.
 * @private
 */
goog.ui.DatePicker.prototype.handleGridKeyPress_ = function(event) {
  var months, days;
  switch (event.keyCode) {
    case 33: // Page up
      event.preventDefault();
      months = -1;
      break;
    case 34: // Page down
      event.preventDefault();
      months = 1;
      break;
    case 37: // Left
      event.preventDefault();
      days = -1;
      break;
    case 39: // Right
      event.preventDefault();
      days = 1;
      break;
    case 38: // Down
      event.preventDefault();
      days = -7;
      break;
    case 40: // Up
      event.preventDefault();
      days = 7;
      break;
    case 36: // Home
      event.preventDefault();
      this.selectToday();
    case 46: // Delete
      event.preventDefault();
      this.selectNone();
    default:
      return;
  }
  var date;
  if (this.date_) {
    date = this.date_.clone();
    date.add(new goog.date.Interval(0, months, days));
  } else {
    date = this.activeMonth_.clone();
    date.setDate(1);
  }
  this.setDate(date);
};


/**
 * Click handler for month button. Opens month selection menu.
 *
 * @param {goog.events.BrowserEvent} event Click event.
 * @private
 */
goog.ui.DatePicker.prototype.showMonthMenu_ = function(event) {
  event.stopPropagation();

  var list = [];
  for (var i = 0; i < 12; i++) {
    list.push(this.symbols_.MONTHS[i]);
  }
  this.createMenu_(this.elMonth_, list, this.handleMonthMenuClick_,
      this.symbols_.MONTHS[this.activeMonth_.getMonth()]);
};


/**
 * Click handler for year button. Opens year selection menu.
 *
 * @param {goog.events.BrowserEvent} event Click event.
 * @private
 */
goog.ui.DatePicker.prototype.showYearMenu_ = function(event) {
  event.stopPropagation();

  var list = [];
  var year = this.activeMonth_.getFullYear() - 5;
  for (var i = 0; i < 11; i++) {
    list.push(String(year + i));
  }
  this.createMenu_(this.elYear_, list, this.handleYearMenuClick_,
                   String(this.activeMonth_.getFullYear()));
};


/**
 * Call back function for month menu.
 *
 * @param {Element} target Selected item.
 * @private
 */
goog.ui.DatePicker.prototype.handleMonthMenuClick_ = function(target) {
  var el = target;
  for (var i = -1; el; el = goog.dom.getPreviousElementSibling(el), i++) {}

  this.activeMonth_.setMonth(i);
  this.updateCalendarGrid_();

  if (this.elMonth_.focus) {
    this.elMonth_.focus();
  }
};


/**
 * Call back function for year menu.
 *
 * @param {Element} target Selected item.
 * @private
 */
goog.ui.DatePicker.prototype.handleYearMenuClick_ = function(target) {
  if (target.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    this.activeMonth_.setFullYear(Number(target.firstChild.nodeValue));
    this.updateCalendarGrid_();
  }

  this.elYear_.focus();
};


/**
 * Support function for menu creation.
 *
 * @param {Element} srcEl Button to create menu for.
 * @param {Array.<string>} items List of items to populate menu with.
 * @param {Function} method Call back method.
 * @param {string} selected Item to mark as selected in menu.
 * @private
 */
goog.ui.DatePicker.prototype.createMenu_ = function(srcEl, items, method,
                                                    selected) {
  this.destroyMenu_();
  var dom = goog.dom.getDomHelper(srcEl);

  var el = dom.createDom('div', goog.getCssName('goog-date-picker-menu'));

  this.menuSelected_ = null;

  var ul = dom.createElement('ul');
  for (var i = 0; i < items.length; i++) {
    var li = dom.createDom('li', null, items[i]);
    if (items[i] == selected) {
      this.menuSelected_ = li;
    }
    ul.appendChild(li);
  }
  el.appendChild(ul);
  el.style.left = srcEl.offsetLeft + srcEl.parentNode.offsetLeft + 'px';
  el.style.top = srcEl.offsetTop + 'px';
  el.style.width = srcEl.clientWidth + 'px';
  this.elMonth_.parentNode.appendChild(el);

  this.menu_ = el;
  if (!this.menuSelected_) {
    this.menuSelected_ = ul.firstChild;
  }
  this.menuSelected_.className =
      goog.getCssName('goog-date-picker-menu-selected');
  this.menuCallback_ = method;

  var eh = this.getHandler();
  eh.listen(this.menu_, goog.events.EventType.CLICK, this.handleMenuClick_);
  eh.listen(this.getKeyHandlerForElement_(this.menu_),
      goog.events.KeyHandler.EventType.KEY, this.handleMenuKeyPress_);
  eh.listen(dom.getDocument(), goog.events.EventType.CLICK, this.destroyMenu_);
  el.tabIndex = 0;
  el.focus();
};


/**
 * Click handler for menu.
 *
 * @param {goog.events.BrowserEvent} event Click event.
 * @private
 */
goog.ui.DatePicker.prototype.handleMenuClick_ = function(event) {
  event.stopPropagation();

  this.destroyMenu_();
  if (this.menuCallback_) {
    this.menuCallback_(event.target);
  }
};


/**
 * Keypress handler for menu.
 *
 * @param {goog.events.BrowserEvent} event Keypress event.
 * @private
 */
goog.ui.DatePicker.prototype.handleMenuKeyPress_ = function(event) {
  // Prevent the grid keypress handler from catching the keypress event.
  event.stopPropagation();

  var el;
  var menuSelected = this.menuSelected_;
  switch (event.keyCode) {
    case 35: // End
      event.preventDefault();
      el = menuSelected.parentNode.lastChild;
      break;
    case 36: // Home
      event.preventDefault();
      el = menuSelected.parentNode.firstChild;
      break;
    case 38: // Up
      event.preventDefault();
      el = menuSelected.previousSibling;
      break;
    case 40: // Down
      event.preventDefault();
      el = menuSelected.nextSibling;
      break;
    case 13: // Enter
    case 9: // Tab
    case 0: // Space
      event.preventDefault();
      this.destroyMenu_();
      this.menuCallback_(menuSelected);
      break;
  }
  if (el && el != menuSelected) {
    menuSelected.className = '';
    el.className = goog.getCssName('goog-date-picker-menu-selected');
    this.menuSelected_ = el;
  }
};


/**
 * Support function for menu destruction.
 * @private
 */
goog.ui.DatePicker.prototype.destroyMenu_ = function() {
  if (this.menu_) {
    var dom = goog.dom.getDomHelper(this.menu_);
    var eh = this.getHandler();
    eh.unlisten(this.menu_, goog.events.EventType.CLICK, this.handleMenuClick_);
    eh.unlisten(this.getKeyHandlerForElement_(this.menu_),
        goog.events.KeyHandler.EventType.KEY, this.handleMenuKeyPress_);
    eh.unlisten(dom.getDocument(), goog.events.EventType.CLICK,
        this.destroyMenu_);
    dom.removeNode(this.menu_);
    delete this.menu_;
  }
};


/**
 * Support function for button creation.
 *
 * @param {Element} parentNode Container the button should be added to.
 * @param {string} label Button label.
 * @param {Function} method Event handler.
 * @param {string=} opt_className Class name for button, which will be used
 *    in addition to "goog-date-picker-btn".
 * @private
 * @return {Element} The created button element.
 */
goog.ui.DatePicker.prototype.createButton_ = function(parentNode, label,
                                                      method, opt_className) {
  var classes = [goog.getCssName('goog-date-picker-btn')];
  if (opt_className) {
    classes.push(opt_className);
  }
  var dom = goog.dom.getDomHelper(parentNode);
  var el = dom.createElement('button');
  el.className = classes.join(' ');
  el.appendChild(dom.createTextNode(label));
  parentNode.appendChild(el);
  this.getHandler().listen(el, goog.events.EventType.CLICK, method);

  return el;
};


/**
 * Determines the dates/weekdays for the current month and builds an in memory
 * representation of the calendar.
 *
 * @private
 */
goog.ui.DatePicker.prototype.updateCalendarGrid_ = function() {
  if (!this.getElement()) {
    return;
  }

  var date = this.activeMonth_.clone();
  date.setDate(1);

  // Show year name of select month
  if (this.elMonthYear_) {
    goog.dom.setTextContent(this.elMonthYear_,
        goog.date.formatMonthAndYear(
            this.symbols_.MONTHS[date.getMonth()],
            date.getFullYear()));
  }
  if (this.elMonth_) {
    goog.dom.setTextContent(this.elMonth_,
        this.symbols_.MONTHS[date.getMonth()]);
  }
  if (this.elYear_) {
    goog.dom.setTextContent(this.elYear_, String(date.getFullYear()));
  }

  var wday = date.getWeekday();
  var days = date.getNumberOfDaysInMonth();

  // Determine how many days to show for previous month
  date.add(new goog.date.Interval(goog.date.Interval.MONTHS, -1));
  date.setDate(date.getNumberOfDaysInMonth() - (wday - 1));

  if (this.showFixedNumWeeks_ && !this.extraWeekAtEnd_ && days + wday < 33) {
    date.add(new goog.date.Interval(goog.date.Interval.DAYS, -7));
  }

  // Create weekday/day grid
  var dayInterval = new goog.date.Interval(goog.date.Interval.DAYS, 1);
  this.grid_ = [];
  for (var y = 0; y < 6; y++) { // Weeks
    this.grid_[y] = [];
    for (var x = 0; x < 7; x++) { // Weekdays
      this.grid_[y][x] = date.clone();
      date.add(dayInterval);
    }
  }

  this.redrawCalendarGrid_();
};


/**
 * Draws calendar view from in memory representation and applies class names
 * depending on the selection, weekday and whatever the day belongs to the
 * active month or not.
 * @private
 */
goog.ui.DatePicker.prototype.redrawCalendarGrid_ = function() {
  if (!this.getElement()) {
    return;
  }

  var month = this.activeMonth_.getMonth();
  var today = new goog.date.Date();
  var todayYear = today.getFullYear();
  var todayMonth = today.getMonth();
  var todayDate = today.getDate();

  // Draw calendar week by week, a worst case month has six weeks.
  for (var y = 0; y < 6; y++) {

    // Draw week number, if enabled
    if (this.showWeekNum_) {
      goog.dom.setTextContent(this.elTable_[y + 1][0],
                              this.grid_[y][0].getWeekNumber());
      goog.dom.classes.set(this.elTable_[y + 1][0],
                           goog.getCssName('goog-date-picker-week'));
    } else {
      goog.dom.setTextContent(this.elTable_[y + 1][0], '');
      goog.dom.classes.set(this.elTable_[y + 1][0], '');
    }

    for (var x = 0; x < 7; x++) {
      var o = this.grid_[y][x];
      var el = this.elTable_[y + 1][x + 1];

      // Assign a unique element id (required for setting the active descendant
      // ARIA role) unless already set.
      if (!el.id) {
        el.id = 'goog-dp-' + goog.ui.DatePicker.nextId_++;
      }
      goog.dom.a11y.setRole(el, 'gridcell');
      var classes = [goog.getCssName('goog-date-picker-date')];
      if (this.showOtherMonths_ || o.getMonth() == month) {
        // Date belongs to previous or next month
        if (o.getMonth() != month) {
          classes.push(goog.getCssName('goog-date-picker-other-month'));
        }

        // Apply styles set by setWeekdayClass
        var wday = (x + this.activeMonth_.getFirstDayOfWeek() + 7) % 7;
        if (this.wdayStyles_[wday]) {
          classes.push(this.wdayStyles_[wday]);
        }

        // Current date
        if (o.getDate() == todayDate && o.getMonth() == todayMonth &&
            o.getFullYear() == todayYear) {
          classes.push(goog.getCssName('goog-date-picker-today'));
        }

        // Selected date
        if (this.date_ && o.getDate() == this.date_.getDate() &&
            o.getMonth() == this.date_.getMonth() &&
            o.getFullYear() == this.date_.getFullYear()) {
          classes.push(goog.getCssName('goog-date-picker-selected'));
          goog.dom.a11y.setState(this.tableBody_, 'activedescendant', el.id);
        }

        // Custom decorator
        if (this.decoratorFunction_) {
          var customClass = this.decoratorFunction_(o);
          if (customClass) {
            classes.push(customClass);
          }
        }

        // Set cell text to the date and apply classes.
        goog.dom.setTextContent(el, o.getDate());
        // Date belongs to previous or next month and showOtherMonths is false,
        // clear text and classes.
      } else {
        goog.dom.setTextContent(el, '');
      }
      goog.dom.classes.set(el, classes.join(' '));
    }

    // Hide the either the last one or last two weeks if they contain no days
    // from the active month and the showFixedNumWeeks is false. The first four
    // weeks are always shown as no month has less than 28 days).
    if (y >= 4) {
      goog.style.showElement(this.elTable_[y + 1][0].parentNode,
                            this.grid_[y][0].getMonth() == month ||
                                this.showFixedNumWeeks_);
    }
  }
};


/**
 * Draw weekday names, if enabled. Start with whatever day has been set as the
 * first day of week.
 * @private
 */
goog.ui.DatePicker.prototype.redrawWeekdays_ = function() {
  if (!this.getElement()) {
    return;
  }
  if (this.showWeekdays_) {
    for (var x = 0; x < 7; x++) {
      var el = this.elTable_[0][x + 1];
      var wday = (x + this.activeMonth_.getFirstDayOfWeek() + 7) % 7;
      goog.dom.setTextContent(el, this.wdayNames_[(wday + 1) % 7]);
    }
  }
  goog.style.showElement(this.elTable_[0][0].parentNode, this.showWeekdays_);
};


/**
 * Returns the key handler for an element and caches it so that it can be
 * retrieved at a later point.
 * @param {Element} el The element to get the key handler for.
 * @return {goog.events.KeyHandler} The key handler for the element.
 * @private
 */
goog.ui.DatePicker.prototype.getKeyHandlerForElement_ = function(el) {
  var uid = goog.getUid(el);
  if (!(uid in this.keyHandlers_)) {
    this.keyHandlers_[uid] = new goog.events.KeyHandler(el);
  }
  return this.keyHandlers_[uid];
};



/**
 * Object representing a date picker event.
 *
 * @param {string} type Event type.
 * @param {goog.ui.DatePicker} target Date picker initiating event.
 * @param {goog.date.Date} date Selected date.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.DatePickerEvent = function(type, target, date) {
  goog.events.Event.call(this, type, target);

  /**
   * The selected date
   * @type {goog.date.Date}
   */
  this.date = date;
};
goog.inherits(goog.ui.DatePickerEvent, goog.events.Event);
