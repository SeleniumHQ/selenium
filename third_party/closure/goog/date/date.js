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
 * @fileoverview Functions and objects for date representation and manipulation.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.date');
goog.provide('goog.date.Date');
goog.provide('goog.date.DateTime');
goog.provide('goog.date.Interval');
goog.provide('goog.date.month');
goog.provide('goog.date.weekDay');

goog.require('goog.asserts');
/** @suppress {extraRequire} */
goog.require('goog.date.DateLike');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.string');


/**
 * Constants for weekdays.
 * @enum {number}
 */
goog.date.weekDay = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6
};


/**
 * Constants for months.
 * @enum {number}
 */
goog.date.month = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
};


/**
 * Formats a month/year string.
 * Example: "January 2008"
 *
 * @param {string} monthName The month name to use in the result.
 * @param {number} yearNum The numeric year to use in the result.
 * @return {string} A formatted month/year string.
 */
goog.date.formatMonthAndYear = function(monthName, yearNum) {
  /** @desc Month/year format given the month name and the numeric year. */
  var MSG_MONTH_AND_YEAR = goog.getMsg(
      '{$monthName} {$yearNum}',
      {'monthName': monthName, 'yearNum': String(yearNum)});
  return MSG_MONTH_AND_YEAR;
};


/**
 * Regular expression for splitting date parts from ISO 8601 styled string.
 * Examples: '20060210' or '2005-02-22' or '20050222' or '2005-08'
 * or '2005-W22' or '2005W22' or '2005-W22-4', etc.
 * For explanation and more examples, see:
 * {@link http://en.wikipedia.org/wiki/ISO_8601}
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitDateStringRegex_ = new RegExp(
    '^(\\d{4})(?:(?:-?(\\d{2})(?:-?(\\d{2}))?)|' +
    '(?:-?(\\d{3}))|(?:-?W(\\d{2})(?:-?([1-7]))?))?$');


/**
 * Regular expression for splitting time parts from ISO 8601 styled string.
 * Examples: '18:46:39.994' or '184639.994'
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitTimeStringRegex_ =
    /^(\d{2})(?::?(\d{2})(?::?(\d{2})(\.\d+)?)?)?$/;


/**
 * Regular expression for splitting timezone parts from ISO 8601 styled string.
 * Example: The part after the '+' in '18:46:39+07:00'.  Or '09:30Z' (UTC).
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitTimezoneStringRegex_ = /Z|(?:([-+])(\d{2})(?::?(\d{2}))?)$/;


/**
 * Regular expression for splitting duration parts from ISO 8601 styled string.
 * Example: '-P1Y2M3DT4H5M6.7S'
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitDurationRegex_ = new RegExp(
    '^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' +
    '(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$');


/**
 * Number of milliseconds in a day.
 * @type {number}
 */
goog.date.MS_PER_DAY = 24 * 60 * 60 * 1000;


/**
 * Returns whether the given year is a leap year.
 *
 * @param {number} year Year part of date.
 * @return {boolean} Whether the given year is a leap year.
 */
goog.date.isLeapYear = function(year) {
  // Leap year logic; the 4-100-400 rule
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
};


/**
 * Returns whether the given year is a long ISO year.
 * See {@link http://www.phys.uu.nl/~vgent/calendar/isocalendar_text3.htm}.
 *
 * @param {number} year Full year part of date.
 * @return {boolean} Whether the given year is a long ISO year.
 */
goog.date.isLongIsoYear = function(year) {
  var n = 5 * year + 12 - 4 * (Math.floor(year / 100) - Math.floor(year / 400));
  n += Math.floor((year - 100) / 400) - Math.floor((year - 102) / 400);
  n += Math.floor((year - 200) / 400) - Math.floor((year - 199) / 400);

  return n % 28 < 5;
};


/**
 * Returns the number of days for a given month.
 *
 * @param {number} year Year part of date.
 * @param {number} month Month part of date.
 * @return {number} The number of days for the given month.
 */
goog.date.getNumberOfDaysInMonth = function(year, month) {
  switch (month) {
    case goog.date.month.FEB:
      return goog.date.isLeapYear(year) ? 29 : 28;
    case goog.date.month.JUN:
    case goog.date.month.SEP:
    case goog.date.month.NOV:
    case goog.date.month.APR:
      return 30;
  }
  return 31;
};


/**
 * Returns true if the 2 dates are in the same day.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are on the same day.
 */
goog.date.isSameDay = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getDate() == now.getDate() && goog.date.isSameMonth(date, now);
};


/**
 * Returns true if the 2 dates are in the same month.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are in the same calendar month.
 */
goog.date.isSameMonth = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getMonth() == now.getMonth() && goog.date.isSameYear(date, now);
};


/**
 * Returns true if the 2 dates are in the same year.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are in the same calendar year.
 */
goog.date.isSameYear = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getFullYear() == now.getFullYear();
};


/**
 * Static function for week number calculation. ISO 8601 implementation.
 *
 * @param {number} year Year part of date.
 * @param {number} month Month part of date (0-11).
 * @param {number} date Day part of date (1-31).
 * @param {number=} opt_weekDay Cut off weekday, defaults to Thursday.
 * @param {number=} opt_firstDayOfWeek First day of the week, defaults to
 *     Monday.
 *     Monday=0, Sunday=6.
 * @return {number} The week number (1-53).
 */
goog.date.getWeekNumber = function(
    year, month, date, opt_weekDay, opt_firstDayOfWeek) {
  var d = new Date(year, month, date);

  // Default to Thursday for cut off as per ISO 8601.
  var cutoff = goog.isDef(opt_weekDay) ? opt_weekDay : goog.date.weekDay.THU;

  // Default to Monday for first day of the week as per ISO 8601.
  var firstday = opt_firstDayOfWeek || goog.date.weekDay.MON;

  // The d.getDay() has to be converted first to ISO weekday (Monday=0).
  var isoday = (d.getDay() + 6) % 7;

  // Position of given day in the picker grid w.r.t. first day of week
  var daypos = (isoday - firstday + 7) % 7;

  // Position of cut off day in the picker grid w.r.t. first day of week
  var cutoffpos = (cutoff - firstday + 7) % 7;

  // Unix timestamp of the midnight of the cutoff day in the week of 'd'.
  // There might be +-1 hour shift in the result due to the daylight saving,
  // but it doesn't affect the year.
  var cutoffSameWeek =
      d.valueOf() + (cutoffpos - daypos) * goog.date.MS_PER_DAY;

  // Unix timestamp of January 1 in the year of 'cutoffSameWeek'.
  var jan1 = new Date(new Date(cutoffSameWeek).getFullYear(), 0, 1).valueOf();

  // Number of week. The round() eliminates the effect of daylight saving.
  return Math.floor(
             Math.round((cutoffSameWeek - jan1) / goog.date.MS_PER_DAY) / 7) +
      1;
};


/**
 * @param {T} date1 A datelike object.
 * @param {S} date2 Another datelike object.
 * @return {T|S} The earlier of them in time.
 * @template T,S
 */
goog.date.min = function(date1, date2) {
  return date1 < date2 ? date1 : date2;
};


/**
 * @param {T} date1 A datelike object.
 * @param {S} date2 Another datelike object.
 * @return {T|S} The later of them in time.
 * @template T,S
 */
goog.date.max = function(date1, date2) {
  return date1 > date2 ? date1 : date2;
};


/**
 * Creates a DateTime from a datetime string expressed in ISO 8601 format.
 *
 * @param {string} formatted A date or datetime expressed in ISO 8601 format.
 * @return {goog.date.DateTime} Parsed date or null if parse fails.
 */
goog.date.fromIsoString = function(formatted) {
  var ret = new goog.date.DateTime(2000);
  return goog.date.setIso8601DateTime(ret, formatted) ? ret : null;
};


/**
 * Parses a datetime string expressed in ISO 8601 format. Overwrites the date
 * and optionally the time part of the given object with the parsed values.
 *
 * @param {!goog.date.DateTime} dateTime Object whose fields will be set.
 * @param {string} formatted A date or datetime expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 */
goog.date.setIso8601DateTime = function(dateTime, formatted) {
  formatted = goog.string.trim(formatted);
  var delim = formatted.indexOf('T') == -1 ? ' ' : 'T';
  var parts = formatted.split(delim);
  return goog.date.setIso8601DateOnly_(dateTime, parts[0]) &&
      (parts.length < 2 || goog.date.setIso8601TimeOnly_(dateTime, parts[1]));
};


/**
 * Sets date fields based on an ISO 8601 format string.
 *
 * @param {!goog.date.DateTime} d Object whose fields will be set.
 * @param {string} formatted A date expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 * @private
 */
goog.date.setIso8601DateOnly_ = function(d, formatted) {
  // split the formatted ISO date string into its date fields
  var parts = formatted.match(goog.date.splitDateStringRegex_);
  if (!parts) {
    return false;
  }

  var year = Number(parts[1]);
  var month = Number(parts[2]);
  var date = Number(parts[3]);
  var dayOfYear = Number(parts[4]);
  var week = Number(parts[5]);
  // ISO weekdays start with 1, native getDay() values start with 0
  var dayOfWeek = Number(parts[6]) || 1;

  d.setFullYear(year);

  if (dayOfYear) {
    d.setDate(1);
    d.setMonth(0);
    var offset = dayOfYear - 1;  // offset, so 1-indexed, i.e., skip day 1
    d.add(new goog.date.Interval(goog.date.Interval.DAYS, offset));
  } else if (week) {
    goog.date.setDateFromIso8601Week_(d, week, dayOfWeek);
  } else {
    if (month) {
      d.setDate(1);
      d.setMonth(month - 1);
    }
    if (date) {
      d.setDate(date);
    }
  }

  return true;
};


/**
 * Sets date fields based on an ISO 8601 week string.
 * See {@link http://en.wikipedia.org/wiki/ISO_week_date}, "Relation with the
 * Gregorian Calendar".  The first week of a new ISO year is the week with the
 * majority of its days in the new Gregorian year.  I.e., ISO Week 1's Thursday
 * is in that year.  ISO weeks always start on Monday. So ISO Week 1 can
 * contain a few days from the previous Gregorian year.  And ISO weeks always
 * end on Sunday, so the last ISO week (Week 52 or 53) can have a few days from
 * the following Gregorian year.
 * Example: '1997-W01' lasts from 1996-12-30 to 1997-01-05.  January 1, 1997 is
 * a Wednesday. So W01's Monday is Dec.30, 1996, and Sunday is January 5, 1997.
 *
 * @param {goog.date.DateTime} d Object whose fields will be set.
 * @param {number} week ISO week number.
 * @param {number} dayOfWeek ISO day of week.
 * @private
 */
goog.date.setDateFromIso8601Week_ = function(d, week, dayOfWeek) {
  // calculate offset for first week
  d.setMonth(0);
  d.setDate(1);
  var jsDay = d.getDay();
  // switch Sunday (0) to index 7; ISO days are 1-indexed
  var jan1WeekDay = jsDay || 7;

  var THURSDAY = 4;
  if (jan1WeekDay <= THURSDAY) {
    // was extended back to Monday
    var startDelta = 1 - jan1WeekDay;  // e.g., Thu(4) ==> -3
  } else {
    // was extended forward to Monday
    startDelta = 8 - jan1WeekDay;  // e.g., Fri(5) ==> +3
  }

  // find the absolute number of days to offset from the start of year
  // to arrive close to the Gregorian equivalent (pending adjustments above)
  // Note: decrement week multiplier by one because 1st week is
  // represented by dayOfWeek value
  var absoluteDays = Number(dayOfWeek) + (7 * (Number(week) - 1));

  // convert from ISO weekday format to Gregorian calendar date
  // note: subtract 1 because 1-indexed; offset should not include 1st of month
  var delta = startDelta + absoluteDays - 1;
  var interval = new goog.date.Interval(goog.date.Interval.DAYS, delta);
  d.add(interval);
};


/**
 * Sets time fields based on an ISO 8601 format string.
 * Note: only time fields, not date fields.
 *
 * @param {!goog.date.DateTime} d Object whose fields will be set.
 * @param {string} formatted A time expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 * @private
 */
goog.date.setIso8601TimeOnly_ = function(d, formatted) {
  // first strip timezone info from the end
  var parts = formatted.match(goog.date.splitTimezoneStringRegex_);

  var offset = 0;  // local time if no timezone info
  if (parts) {
    if (parts[0] != 'Z') {
      offset = Number(parts[2]) * 60 + Number(parts[3]);
      offset *= parts[1] == '-' ? 1 : -1;
    }
    offset -= d.getTimezoneOffset();
    formatted = formatted.substr(0, formatted.length - parts[0].length);
  }

  // then work out the time
  parts = formatted.match(goog.date.splitTimeStringRegex_);
  if (!parts) {
    return false;
  }

  d.setHours(Number(parts[1]));
  d.setMinutes(Number(parts[2]) || 0);
  d.setSeconds(Number(parts[3]) || 0);
  d.setMilliseconds(parts[4] ? Number(parts[4]) * 1000 : 0);

  if (offset != 0) {
    // adjust the date and time according to the specified timezone
    d.setTime(d.getTime() + offset * 60000);
  }

  return true;
};



/**
 * Class representing a date/time interval. Used for date calculations.
 * <pre>
 * new goog.date.Interval(0, 1) // One month
 * new goog.date.Interval(0, 0, 3, 1) // Three days and one hour
 * new goog.date.Interval(goog.date.Interval.DAYS, 1) // One day
 * </pre>
 *
 * @param {number|string=} opt_years Years or string representing date part.
 * @param {number=} opt_months Months or number of whatever date part specified
 *     by first parameter.
 * @param {number=} opt_days Days.
 * @param {number=} opt_hours Hours.
 * @param {number=} opt_minutes Minutes.
 * @param {number=} opt_seconds Seconds.
 * @constructor
 * @struct
 * @final
 */
goog.date.Interval = function(
    opt_years, opt_months, opt_days, opt_hours, opt_minutes, opt_seconds) {
  if (goog.isString(opt_years)) {
    var type = opt_years;
    var interval = /** @type {number} */ (opt_months);
    this.years = type == goog.date.Interval.YEARS ? interval : 0;
    this.months = type == goog.date.Interval.MONTHS ? interval : 0;
    this.days = type == goog.date.Interval.DAYS ? interval : 0;
    this.hours = type == goog.date.Interval.HOURS ? interval : 0;
    this.minutes = type == goog.date.Interval.MINUTES ? interval : 0;
    this.seconds = type == goog.date.Interval.SECONDS ? interval : 0;
  } else {
    this.years = /** @type {number} */ (opt_years) || 0;
    this.months = opt_months || 0;
    this.days = opt_days || 0;
    this.hours = opt_hours || 0;
    this.minutes = opt_minutes || 0;
    this.seconds = opt_seconds || 0;
  }
};


/**
 * Parses an XML Schema duration (ISO 8601 extended).
 * @see http://www.w3.org/TR/xmlschema-2/#duration
 *
 * @param  {string} duration An XML schema duration in textual format.
 *     Recurring durations and weeks are not supported.
 * @return {goog.date.Interval} The duration as a goog.date.Interval or null
 *     if the parse fails.
 */
goog.date.Interval.fromIsoString = function(duration) {
  var parts = duration.match(goog.date.splitDurationRegex_);
  if (!parts) {
    return null;
  }

  var timeEmpty = !(parts[6] || parts[7] || parts[8]);
  var dateTimeEmpty = timeEmpty && !(parts[2] || parts[3] || parts[4]);
  if (dateTimeEmpty || timeEmpty && parts[5]) {
    return null;
  }

  var negative = parts[1];
  var years = parseInt(parts[2], 10) || 0;
  var months = parseInt(parts[3], 10) || 0;
  var days = parseInt(parts[4], 10) || 0;
  var hours = parseInt(parts[6], 10) || 0;
  var minutes = parseInt(parts[7], 10) || 0;
  var seconds = parseFloat(parts[8]) || 0;
  return negative ?
      new goog.date.Interval(
          -years, -months, -days, -hours, -minutes, -seconds) :
      new goog.date.Interval(years, months, days, hours, minutes, seconds);
};


/**
 * Serializes goog.date.Interval into XML Schema duration (ISO 8601 extended).
 * @see http://www.w3.org/TR/xmlschema-2/#duration
 *
 * @param {boolean=} opt_verbose Include zero fields in the duration string.
 * @return {?string} An XML schema duration in ISO 8601 extended format,
 *     or null if the interval contains both positive and negative fields.
 */
goog.date.Interval.prototype.toIsoString = function(opt_verbose) {
  var minField = Math.min(
      this.years, this.months, this.days, this.hours, this.minutes,
      this.seconds);
  var maxField = Math.max(
      this.years, this.months, this.days, this.hours, this.minutes,
      this.seconds);
  if (minField < 0 && maxField > 0) {
    return null;
  }

  // Return 0 seconds if all fields are zero.
  if (!opt_verbose && minField == 0 && maxField == 0) {
    return 'PT0S';
  }

  var res = [];

  // Add sign and 'P' prefix.
  if (minField < 0) {
    res.push('-');
  }
  res.push('P');

  // Add date.
  if (this.years || opt_verbose) {
    res.push(Math.abs(this.years) + 'Y');
  }
  if (this.months || opt_verbose) {
    res.push(Math.abs(this.months) + 'M');
  }
  if (this.days || opt_verbose) {
    res.push(Math.abs(this.days) + 'D');
  }

  // Add time.
  if (this.hours || this.minutes || this.seconds || opt_verbose) {
    res.push('T');
    if (this.hours || opt_verbose) {
      res.push(Math.abs(this.hours) + 'H');
    }
    if (this.minutes || opt_verbose) {
      res.push(Math.abs(this.minutes) + 'M');
    }
    if (this.seconds || opt_verbose) {
      res.push(Math.abs(this.seconds) + 'S');
    }
  }

  return res.join('');
};


/**
 * Tests whether the given interval is equal to this interval.
 * Note, this is a simple field-by-field comparison, it doesn't
 * account for comparisons like "12 months == 1 year".
 *
 * @param {goog.date.Interval} other The interval to test.
 * @return {boolean} Whether the intervals are equal.
 */
goog.date.Interval.prototype.equals = function(other) {
  return other.years == this.years && other.months == this.months &&
      other.days == this.days && other.hours == this.hours &&
      other.minutes == this.minutes && other.seconds == this.seconds;
};


/**
 * @return {!goog.date.Interval} A clone of the interval object.
 */
goog.date.Interval.prototype.clone = function() {
  return new goog.date.Interval(
      this.years, this.months, this.days, this.hours, this.minutes,
      this.seconds);
};


/**
 * Years constant for the date parts.
 * @type {string}
 */
goog.date.Interval.YEARS = 'y';


/**
 * Months constant for the date parts.
 * @type {string}
 */
goog.date.Interval.MONTHS = 'm';


/**
 * Days constant for the date parts.
 * @type {string}
 */
goog.date.Interval.DAYS = 'd';


/**
 * Hours constant for the date parts.
 * @type {string}
 */
goog.date.Interval.HOURS = 'h';


/**
 * Minutes constant for the date parts.
 * @type {string}
 */
goog.date.Interval.MINUTES = 'n';


/**
 * Seconds constant for the date parts.
 * @type {string}
 */
goog.date.Interval.SECONDS = 's';


/**
 * @return {boolean} Whether all fields of the interval are zero.
 */
goog.date.Interval.prototype.isZero = function() {
  return this.years == 0 && this.months == 0 && this.days == 0 &&
      this.hours == 0 && this.minutes == 0 && this.seconds == 0;
};


/**
 * @return {!goog.date.Interval} Negative of this interval.
 */
goog.date.Interval.prototype.getInverse = function() {
  return this.times(-1);
};


/**
 * Calculates n * (this interval) by memberwise multiplication.
 * @param {number} n An integer.
 * @return {!goog.date.Interval} n * this.
 */
goog.date.Interval.prototype.times = function(n) {
  return new goog.date.Interval(
      this.years * n, this.months * n, this.days * n, this.hours * n,
      this.minutes * n, this.seconds * n);
};


/**
 * Gets the total number of seconds in the time interval. Assumes that months
 * and years are empty.
 * @return {number} Total number of seconds in the interval.
 */
goog.date.Interval.prototype.getTotalSeconds = function() {
  goog.asserts.assert(this.years == 0 && this.months == 0);
  return ((this.days * 24 + this.hours) * 60 + this.minutes) * 60 +
      this.seconds;
};


/**
 * Adds the Interval in the argument to this Interval field by field.
 *
 * @param {goog.date.Interval} interval The Interval to add.
 */
goog.date.Interval.prototype.add = function(interval) {
  this.years += interval.years;
  this.months += interval.months;
  this.days += interval.days;
  this.hours += interval.hours;
  this.minutes += interval.minutes;
  this.seconds += interval.seconds;
};



/**
 * Class representing a date. Defaults to current date if none is specified.
 *
 * Implements most methods of the native js Date object (except the time related
 * ones, {@see goog.date.DateTime}) and can be used interchangeably with it just
 * as if goog.date.Date was a synonym of Date. To make this more transparent,
 * Closure APIs should accept goog.date.DateLike instead of the real Date
 * object.
 *
 * @param {number|goog.date.DateLike=} opt_year Four digit year or a date-like
 *     object. If not set, the created object will contain the date
 *     determined by goog.now().
 * @param {number=} opt_month Month, 0 = Jan, 11 = Dec.
 * @param {number=} opt_date Date of month, 1 - 31.
 * @constructor
 * @struct
 * @see goog.date.DateTime
 */
goog.date.Date = function(opt_year, opt_month, opt_date) {
  /** @protected {!Date} The wrapped date or datetime. */
  this.date;
  // goog.date.DateTime assumes that only this.date is added in this ctor.
  if (goog.isNumber(opt_year)) {
    this.date = this.buildDate_(opt_year, opt_month || 0, opt_date || 1);
    this.maybeFixDst_(opt_date || 1);
  } else if (goog.isObject(opt_year)) {
    this.date = this.buildDate_(
        opt_year.getFullYear(), opt_year.getMonth(), opt_year.getDate());
    this.maybeFixDst_(opt_year.getDate());
  } else {
    this.date = new Date(goog.now());
    var expectedDate = this.date.getDate();
    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    // In some time zones there is no "0" hour on certain days during DST.
    // Adjust here, if necessary. See:
    // https://github.com/google/closure-library/issues/34.
    this.maybeFixDst_(expectedDate);
  }
};


/**
 * new Date(y, m, d) treats years in the interval [0, 100) as two digit years,
 * adding 1900 to them. This method ensures that calling the date constructor
 * as a copy constructor returns a value that is equal to the passed in
 * date value by explicitly setting the full year.
 * @private
 * @param {number} fullYear The full year (including century).
 * @param {number} month The month, from 0-11.
 * @param {number} date The day of the month.
 * @return {!Date} The constructed Date object.
 */
goog.date.Date.prototype.buildDate_ = function(fullYear, month, date) {
  var d = new Date(fullYear, month, date);
  if (fullYear >= 0 && fullYear < 100) {
    // Can't just setFullYear as new Date() can flip over for e.g. month = 13.
    d.setFullYear(d.getFullYear() - 1900);
  }
  return d;
};


/**
 * First day of week. 0 = Mon, 6 = Sun.
 * @type {number}
 * @private
 */
goog.date.Date.prototype.firstDayOfWeek_ =
    goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK;


/**
 * The cut off weekday used for week number calculations. 0 = Mon, 6 = Sun.
 * @type {number}
 * @private
 */
goog.date.Date.prototype.firstWeekCutOffDay_ =
    goog.i18n.DateTimeSymbols.FIRSTWEEKCUTOFFDAY;


/**
 * @return {!goog.date.Date} A clone of the date object.
 */
goog.date.Date.prototype.clone = function() {
  var date = new goog.date.Date(this.date);
  date.firstDayOfWeek_ = this.firstDayOfWeek_;
  date.firstWeekCutOffDay_ = this.firstWeekCutOffDay_;

  return date;
};


/**
 * @return {number} The four digit year of date.
 */
goog.date.Date.prototype.getFullYear = function() {
  return this.date.getFullYear();
};


/**
 * Alias for getFullYear.
 *
 * @return {number} The four digit year of date.
 * @see #getFullYear
 */
goog.date.Date.prototype.getYear = function() {
  return this.getFullYear();
};


/**
 * @return {goog.date.month} The month of date, 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.getMonth = function() {
  return /** @type {goog.date.month} */ (this.date.getMonth());
};


/**
 * @return {number} The date of month.
 */
goog.date.Date.prototype.getDate = function() {
  return this.date.getDate();
};


/**
 * Returns the number of milliseconds since 1 January 1970 00:00:00.
 *
 * @return {number} The number of milliseconds since 1 January 1970 00:00:00.
 */
goog.date.Date.prototype.getTime = function() {
  return this.date.getTime();
};


/**
 * @return {number} The day of week, US style. 0 = Sun, 6 = Sat.
 */
goog.date.Date.prototype.getDay = function() {
  return this.date.getDay();
};


/**
 * @return {goog.date.weekDay} The day of week, ISO style. 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getIsoWeekday = function() {
  return /** @type {goog.date.weekDay} */ ((this.getDay() + 6) % 7);
};


/**
 * @return {number} The day of week according to firstDayOfWeek setting.
 */
goog.date.Date.prototype.getWeekday = function() {
  return (this.getIsoWeekday() - this.firstDayOfWeek_ + 7) % 7;
};


/**
 * @return {number} The four digit year of date according to universal time.
 */
goog.date.Date.prototype.getUTCFullYear = function() {
  return this.date.getUTCFullYear();
};


/**
 * @return {goog.date.month} The month of date according to universal time,
 *     0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.getUTCMonth = function() {
  return /** @type {goog.date.month} */ (this.date.getUTCMonth());
};


/**
 * @return {number} The date of month according to universal time.
 */
goog.date.Date.prototype.getUTCDate = function() {
  return this.date.getUTCDate();
};


/**
 * @return {number} The day of week according to universal time, US style.
 *     0 = Sun, 1 = Mon, 6 = Sat.
 */
goog.date.Date.prototype.getUTCDay = function() {
  return this.date.getDay();
};


/**
 * @return {number} The hours value according to universal time.
 */
goog.date.Date.prototype.getUTCHours = function() {
  return this.date.getUTCHours();
};


/**
 * @return {number} The minutes value according to universal time.
 */
goog.date.Date.prototype.getUTCMinutes = function() {
  return this.date.getUTCMinutes();
};


/**
 * @return {goog.date.weekDay} The day of week according to universal time, ISO
 *     style. 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getUTCIsoWeekday = function() {
  return /** @type {goog.date.weekDay} */ ((this.date.getUTCDay() + 6) % 7);
};


/**
 * @return {number} The day of week according to universal time and
 *     firstDayOfWeek setting.
 */
goog.date.Date.prototype.getUTCWeekday = function() {
  return (this.getUTCIsoWeekday() - this.firstDayOfWeek_ + 7) % 7;
};


/**
 * @return {number} The first day of the week. 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getFirstDayOfWeek = function() {
  return this.firstDayOfWeek_;
};


/**
 * @return {number} The cut off weekday used for week number calculations.
 *     0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getFirstWeekCutOffDay = function() {
  return this.firstWeekCutOffDay_;
};


/**
 * @return {number} The number of days for the selected month.
 */
goog.date.Date.prototype.getNumberOfDaysInMonth = function() {
  return goog.date.getNumberOfDaysInMonth(this.getFullYear(), this.getMonth());
};


/**
 * @return {number} The week number.
 */
goog.date.Date.prototype.getWeekNumber = function() {
  return goog.date.getWeekNumber(
      this.getFullYear(), this.getMonth(), this.getDate(),
      this.firstWeekCutOffDay_, this.firstDayOfWeek_);
};


/**
 * @return {number} The day of year.
 */
goog.date.Date.prototype.getDayOfYear = function() {
  var dayOfYear = this.getDate();
  var year = this.getFullYear();
  for (var m = this.getMonth() - 1; m >= 0; m--) {
    dayOfYear += goog.date.getNumberOfDaysInMonth(year, m);
  }

  return dayOfYear;
};


/**
 * Returns timezone offset. The timezone offset is the delta in minutes between
 * UTC and your local time. E.g., UTC+10 returns -600. Daylight savings time
 * prevents this value from being constant.
 *
 * @return {number} The timezone offset.
 */
goog.date.Date.prototype.getTimezoneOffset = function() {
  return this.date.getTimezoneOffset();
};


/**
 * Returns timezone offset as a string. Returns offset in [+-]HH:mm format or Z
 * for UTC.
 *
 * @return {string} The timezone offset as a string.
 */
goog.date.Date.prototype.getTimezoneOffsetString = function() {
  var tz;
  var offset = this.getTimezoneOffset();

  if (offset == 0) {
    tz = 'Z';
  } else {
    var n = Math.abs(offset) / 60;
    var h = Math.floor(n);
    var m = (n - h) * 60;
    tz = (offset > 0 ? '-' : '+') + goog.string.padNumber(h, 2) + ':' +
        goog.string.padNumber(m, 2);
  }

  return tz;
};


/**
 * Sets the date.
 *
 * @param {goog.date.Date} date Date object to set date from.
 */
goog.date.Date.prototype.set = function(date) {
  this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


/**
 * Sets the year part of the date.
 *
 * @param {number} year Four digit year.
 */
goog.date.Date.prototype.setFullYear = function(year) {
  this.date.setFullYear(year);
};


/**
 * Alias for setFullYear.
 *
 * @param {number} year Four digit year.
 * @see #setFullYear
 */
goog.date.Date.prototype.setYear = function(year) {
  this.setFullYear(year);
};


/**
 * Sets the month part of the date.
 *
 * TODO(nnaze): Update type to goog.date.month.
 *
 * @param {number} month The month, where 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.setMonth = function(month) {
  this.date.setMonth(month);
};


/**
 * Sets the day part of the date.
 *
 * @param {number} date The day part.
 */
goog.date.Date.prototype.setDate = function(date) {
  this.date.setDate(date);
};


/**
 * Sets the value of the date object as expressed in the number of milliseconds
 * since 1 January 1970 00:00:00.
 *
 * @param {number} ms Number of milliseconds since 1 Jan 1970.
 */
goog.date.Date.prototype.setTime = function(ms) {
  this.date.setTime(ms);
};


/**
 * Sets the year part of the date according to universal time.
 *
 * @param {number} year Four digit year.
 */
goog.date.Date.prototype.setUTCFullYear = function(year) {
  this.date.setUTCFullYear(year);
};


/**
 * Sets the month part of the date according to universal time.
 *
 * @param {number} month The month, where 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.setUTCMonth = function(month) {
  this.date.setUTCMonth(month);
};


/**
 * Sets the day part of the date according to universal time.
 *
 * @param {number} date The UTC date.
 */
goog.date.Date.prototype.setUTCDate = function(date) {
  this.date.setUTCDate(date);
};


/**
 * Sets the first day of week.
 *
 * @param {number} day 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.setFirstDayOfWeek = function(day) {
  this.firstDayOfWeek_ = day;
};


/**
 * Sets cut off weekday used for week number calculations. 0 = Mon, 6 = Sun.
 *
 * @param {number} day The cut off weekday.
 */
goog.date.Date.prototype.setFirstWeekCutOffDay = function(day) {
  this.firstWeekCutOffDay_ = day;
};


/**
 * Performs date calculation by adding the supplied interval to the date.
 *
 * @param {goog.date.Interval} interval Date interval to add.
 */
goog.date.Date.prototype.add = function(interval) {
  if (interval.years || interval.months) {
    // As months have different number of days adding a month to Jan 31 by just
    // setting the month would result in a date in early March rather than Feb
    // 28 or 29. Doing it this way overcomes that problem.

    // adjust year and month, accounting for both directions
    var month = this.getMonth() + interval.months + interval.years * 12;
    var year = this.getYear() + Math.floor(month / 12);
    month %= 12;
    if (month < 0) {
      month += 12;
    }

    var daysInTargetMonth = goog.date.getNumberOfDaysInMonth(year, month);
    var date = Math.min(daysInTargetMonth, this.getDate());

    // avoid inadvertently causing rollovers to adjacent months
    this.setDate(1);

    this.setFullYear(year);
    this.setMonth(month);
    this.setDate(date);
  }

  if (interval.days) {
    // Convert the days to milliseconds and add it to the UNIX timestamp.
    // Taking noon helps to avoid 1 day error due to the daylight saving.
    var noon = new Date(this.getYear(), this.getMonth(), this.getDate(), 12);
    var result = new Date(noon.getTime() + interval.days * 86400000);

    // Set date to 1 to prevent rollover caused by setting the year or month.
    this.setDate(1);
    this.setFullYear(result.getFullYear());
    this.setMonth(result.getMonth());
    this.setDate(result.getDate());

    this.maybeFixDst_(result.getDate());
  }
};


/**
 * Returns ISO 8601 string representation of date.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date.
 */
goog.date.Date.prototype.toIsoString = function(opt_verbose, opt_tz) {
  var str = [
    this.getFullYear(), goog.string.padNumber(this.getMonth() + 1, 2),
    goog.string.padNumber(this.getDate(), 2)
  ];

  return str.join((opt_verbose) ? '-' : '') +
      (opt_tz ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns ISO 8601 string representation of date according to universal time.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included in
 *     the string.
 * @return {string} ISO 8601 string representation of date according to
 *     universal time.
 */
goog.date.Date.prototype.toUTCIsoString = function(opt_verbose, opt_tz) {
  var str = [
    this.getUTCFullYear(), goog.string.padNumber(this.getUTCMonth() + 1, 2),
    goog.string.padNumber(this.getUTCDate(), 2)
  ];

  return str.join((opt_verbose) ? '-' : '') + (opt_tz ? 'Z' : '');
};


/**
 * Tests whether given date is equal to this Date.
 * Note: This ignores units more precise than days (hours and below)
 * and also ignores timezone considerations.
 *
 * @param {goog.date.Date} other The date to compare.
 * @return {boolean} Whether the given date is equal to this one.
 */
goog.date.Date.prototype.equals = function(other) {
  return !!(
      other && this.getYear() == other.getYear() &&
      this.getMonth() == other.getMonth() && this.getDate() == other.getDate());
};


/**
 * Overloaded toString method for object.
 * @return {string} ISO 8601 string representation of date.
 * @override
 */
goog.date.Date.prototype.toString = function() {
  return this.toIsoString();
};


/**
 * Fixes date to account for daylight savings time in browsers that fail to do
 * so automatically.
 * @param {number} expected Expected date.
 * @private
 */
goog.date.Date.prototype.maybeFixDst_ = function(expected) {
  if (this.getDate() != expected) {
    var dir = this.getDate() < expected ? 1 : -1;
    this.date.setUTCHours(this.date.getUTCHours() + dir);
  }
};


/**
 * @return {number} Value of wrapped date.
 * @override
 */
goog.date.Date.prototype.valueOf = function() {
  return this.date.valueOf();
};


/**
 * Compares two dates.  May be used as a sorting function.
 * @see goog.array.sort
 * @param {!goog.date.DateLike} date1 Date to compare.
 * @param {!goog.date.DateLike} date2 Date to compare.
 * @return {number} Comparison result. 0 if dates are the same, less than 0 if
 *     date1 is earlier than date2, greater than 0 if date1 is later than date2.
 */
goog.date.Date.compare = function(date1, date2) {
  return date1.getTime() - date2.getTime();
};



/**
 * Class representing a date and time. Defaults to current date and time if none
 * is specified.
 *
 * Implements most methods of the native js Date object and can be used
 * interchangeably with it just as if goog.date.DateTime was a subclass of Date.
 *
 * @param {number|Object=} opt_year Four digit year or a date-like object. If
 *     not set, the created object will contain the date determined by
 *     goog.now().
 * @param {number=} opt_month Month, 0 = Jan, 11 = Dec.
 * @param {number=} opt_date Date of month, 1 - 31.
 * @param {number=} opt_hours Hours, 0 - 23.
 * @param {number=} opt_minutes Minutes, 0 - 59.
 * @param {number=} opt_seconds Seconds, 0 - 61.
 * @param {number=} opt_milliseconds Milliseconds, 0 - 999.
 * @constructor
 * @struct
 * @extends {goog.date.Date}
 */
goog.date.DateTime = function(
    opt_year, opt_month, opt_date, opt_hours, opt_minutes, opt_seconds,
    opt_milliseconds) {
  if (goog.isNumber(opt_year)) {
    this.date = new Date(
        opt_year, opt_month || 0, opt_date || 1, opt_hours || 0,
        opt_minutes || 0, opt_seconds || 0, opt_milliseconds || 0);
  } else {
    this.date = new Date(
        opt_year && opt_year.getTime ? opt_year.getTime() : goog.now());
  }
};
goog.inherits(goog.date.DateTime, goog.date.Date);


/**
 * @param {number} timestamp Number of milliseconds since Epoch.
 * @return {!goog.date.DateTime}
 */
goog.date.DateTime.fromTimestamp = function(timestamp) {
  var date = new goog.date.DateTime();
  date.setTime(timestamp);
  return date;
};


/**
 * Creates a DateTime from a datetime string expressed in RFC 822 format.
 *
 * @param {string} formatted A date or datetime expressed in RFC 822 format.
 * @return {goog.date.DateTime} Parsed date or null if parse fails.
 */
goog.date.DateTime.fromRfc822String = function(formatted) {
  var date = new Date(formatted);
  return !isNaN(date.getTime()) ? new goog.date.DateTime(date) : null;
};


/**
 * Returns the hours part of the datetime.
 *
 * @return {number} An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.getHours = function() {
  return this.date.getHours();
};


/**
 * Returns the minutes part of the datetime.
 *
 * @return {number} An integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.getMinutes = function() {
  return this.date.getMinutes();
};


/**
 * Returns the seconds part of the datetime.
 *
 * @return {number} An integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.getSeconds = function() {
  return this.date.getSeconds();
};


/**
 * Returns the milliseconds part of the datetime.
 *
 * @return {number} An integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.getMilliseconds = function() {
  return this.date.getMilliseconds();
};


/**
 * Returns the day of week according to universal time, US style.
 *
 * @return {goog.date.weekDay} Day of week, 0 = Sun, 1 = Mon, 6 = Sat.
 * @override
 */
goog.date.DateTime.prototype.getUTCDay = function() {
  return /** @type {goog.date.weekDay} */ (this.date.getUTCDay());
};


/**
 * Returns the hours part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 23, representing the hour.
 * @override
 */
goog.date.DateTime.prototype.getUTCHours = function() {
  return this.date.getUTCHours();
};


/**
 * Returns the minutes part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 59, representing the minutes.
 * @override
 */
goog.date.DateTime.prototype.getUTCMinutes = function() {
  return this.date.getUTCMinutes();
};


/**
 * Returns the seconds part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.getUTCSeconds = function() {
  return this.date.getUTCSeconds();
};


/**
 * Returns the milliseconds part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.getUTCMilliseconds = function() {
  return this.date.getUTCMilliseconds();
};


/**
 * Sets the hours part of the datetime.
 *
 * @param {number} hours An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.setHours = function(hours) {
  this.date.setHours(hours);
};


/**
 * Sets the minutes part of the datetime.
 *
 * @param {number} minutes Integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.setMinutes = function(minutes) {
  this.date.setMinutes(minutes);
};


/**
 * Sets the seconds part of the datetime.
 *
 * @param {number} seconds Integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.setSeconds = function(seconds) {
  this.date.setSeconds(seconds);
};


/**
 * Sets the milliseconds part of the datetime.
 *
 * @param {number} ms Integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.setMilliseconds = function(ms) {
  this.date.setMilliseconds(ms);
};


/**
 * Sets the hours part of the datetime according to universal time.
 *
 * @param {number} hours An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.setUTCHours = function(hours) {
  this.date.setUTCHours(hours);
};


/**
 * Sets the minutes part of the datetime according to universal time.
 *
 * @param {number} minutes Integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.setUTCMinutes = function(minutes) {
  this.date.setUTCMinutes(minutes);
};


/**
 * Sets the seconds part of the datetime according to universal time.
 *
 * @param {number} seconds Integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.setUTCSeconds = function(seconds) {
  this.date.setUTCSeconds(seconds);
};


/**
 * Sets the seconds part of the datetime according to universal time.
 *
 * @param {number} ms Integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.setUTCMilliseconds = function(ms) {
  this.date.setUTCMilliseconds(ms);
};


/**
 * @return {boolean} Whether the datetime is aligned to midnight.
 */
goog.date.DateTime.prototype.isMidnight = function() {
  return this.getHours() == 0 && this.getMinutes() == 0 &&
      this.getSeconds() == 0 && this.getMilliseconds() == 0;
};


/**
 * Performs date calculation by adding the supplied interval to the date.
 *
 * @param {goog.date.Interval} interval Date interval to add.
 * @override
 */
goog.date.DateTime.prototype.add = function(interval) {
  goog.date.Date.prototype.add.call(this, interval);

  if (interval.hours) {
    this.setUTCHours(this.date.getUTCHours() + interval.hours);
  }
  if (interval.minutes) {
    this.setUTCMinutes(this.date.getUTCMinutes() + interval.minutes);
  }
  if (interval.seconds) {
    this.setUTCSeconds(this.date.getUTCSeconds() + interval.seconds);
  }
};


/**
 * Returns ISO 8601 string representation of date/time.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date/time.
 * @override
 */
goog.date.DateTime.prototype.toIsoString = function(opt_verbose, opt_tz) {
  var dateString = goog.date.Date.prototype.toIsoString.call(this, opt_verbose);

  if (opt_verbose) {
    return dateString + ' ' + goog.string.padNumber(this.getHours(), 2) + ':' +
        goog.string.padNumber(this.getMinutes(), 2) + ':' +
        goog.string.padNumber(this.getSeconds(), 2) +
        (opt_tz ? this.getTimezoneOffsetString() : '');
  }

  return dateString + 'T' + goog.string.padNumber(this.getHours(), 2) +
      goog.string.padNumber(this.getMinutes(), 2) +
      goog.string.padNumber(this.getSeconds(), 2) +
      (opt_tz ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns XML Schema 2 string representation of date/time.
 * The return value is also ISO 8601 compliant.
 *
 * @param {boolean=} opt_timezone Should the timezone offset be included in the
 *     string?.
 * @return {string} XML Schema 2 string representation of date/time.
 */
goog.date.DateTime.prototype.toXmlDateTime = function(opt_timezone) {
  return goog.date.Date.prototype.toIsoString.call(this, true) + 'T' +
      goog.string.padNumber(this.getHours(), 2) + ':' +
      goog.string.padNumber(this.getMinutes(), 2) + ':' +
      goog.string.padNumber(this.getSeconds(), 2) +
      (opt_timezone ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns ISO 8601 string representation of date/time according to universal
 * time.
 *
 * @param {boolean=} opt_verbose Whether the opt_verbose format should be
 *     returned instead of the default compact one.
 * @param {boolean=} opt_tz Whether the the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date/time according to
 *     universal time.
 * @override
 */
goog.date.DateTime.prototype.toUTCIsoString = function(opt_verbose, opt_tz) {
  var dateStr = goog.date.Date.prototype.toUTCIsoString.call(this, opt_verbose);

  if (opt_verbose) {
    return dateStr + ' ' + goog.string.padNumber(this.getUTCHours(), 2) + ':' +
        goog.string.padNumber(this.getUTCMinutes(), 2) + ':' +
        goog.string.padNumber(this.getUTCSeconds(), 2) + (opt_tz ? 'Z' : '');
  }

  return dateStr + 'T' + goog.string.padNumber(this.getUTCHours(), 2) +
      goog.string.padNumber(this.getUTCMinutes(), 2) +
      goog.string.padNumber(this.getUTCSeconds(), 2) + (opt_tz ? 'Z' : '');
};


/**
 * Returns RFC 3339 string representation of datetime in UTC.
 *
 * @return {string} A UTC datetime expressed in RFC 3339 format.
 */
goog.date.DateTime.prototype.toUTCRfc3339String = function() {
  var date = this.toUTCIsoString(true).replace(' ', 'T');
  var millis = this.getUTCMilliseconds();
  return (millis ? date + '.' + millis : date) + 'Z';
};


/**
 * Tests whether given datetime is exactly equal to this DateTime.
 *
 * @param {goog.date.Date} other The datetime to compare.
 * @return {boolean} Whether the given datetime is exactly equal to this one.
 * @override
 */
goog.date.DateTime.prototype.equals = function(other) {
  return this.getTime() == other.getTime();
};


/**
 * Overloaded toString method for object.
 * @return {string} ISO 8601 string representation of date/time.
 * @override
 */
goog.date.DateTime.prototype.toString = function() {
  return this.toIsoString();
};


/**
 * Generates time label for the datetime, e.g., '5:30 AM'.
 * By default this does not pad hours (e.g., to '05:30') and it does add
 * an am/pm suffix.
 * TODO(user): i18n -- hardcoding time format like this is bad.  E.g., in CJK
 *               locales, need Chinese characters for hour and minute units.
 * @param {boolean=} opt_padHours Whether to pad hours, e.g., '05:30' vs '5:30'.
 * @param {boolean=} opt_showAmPm Whether to show the 'am' and 'pm' suffix.
 * @param {boolean=} opt_omitZeroMinutes E.g., '5:00pm' becomes '5pm',
 *                                      but '5:01pm' remains '5:01pm'.
 * @return {string} The time label.
 */
goog.date.DateTime.prototype.toUsTimeString = function(
    opt_padHours, opt_showAmPm, opt_omitZeroMinutes) {
  var hours = this.getHours();

  // show am/pm marker by default
  if (!goog.isDef(opt_showAmPm)) {
    opt_showAmPm = true;
  }

  // 12pm
  var isPM = hours == 12;

  // change from 1-24 to 1-12 basis
  if (hours > 12) {
    hours -= 12;
    isPM = true;
  }

  // midnight is expressed as "12am", but if am/pm marker omitted, keep as '0'
  if (hours == 0 && opt_showAmPm) {
    hours = 12;
  }

  var label = opt_padHours ? goog.string.padNumber(hours, 2) : String(hours);
  var minutes = this.getMinutes();
  if (!opt_omitZeroMinutes || minutes > 0) {
    label += ':' + goog.string.padNumber(minutes, 2);
  }

  // by default, show am/pm suffix
  if (opt_showAmPm) {
    label += isPM ? ' PM' : ' AM';
  }
  return label;
};


/**
 * Generates time label for the datetime in standard ISO 24-hour time format.
 * E.g., '06:00:00' or '23:30:15'.
 * @param {boolean=} opt_showSeconds Whether to shows seconds. Defaults to TRUE.
 * @return {string} The time label.
 */
goog.date.DateTime.prototype.toIsoTimeString = function(opt_showSeconds) {
  var hours = this.getHours();
  var label = goog.string.padNumber(hours, 2) + ':' +
      goog.string.padNumber(this.getMinutes(), 2);
  if (!goog.isDef(opt_showSeconds) || opt_showSeconds) {
    label += ':' + goog.string.padNumber(this.getSeconds(), 2);
  }
  return label;
};


/**
 * @return {!goog.date.DateTime} A clone of the datetime object.
 * @override
 */
goog.date.DateTime.prototype.clone = function() {
  var date = new goog.date.DateTime(this.date);
  date.setFirstDayOfWeek(this.getFirstDayOfWeek());
  date.setFirstWeekCutOffDay(this.getFirstWeekCutOffDay());
  return date;
};
