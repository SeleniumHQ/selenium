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
 * @fileoverview Functions for formatting relative dates.  Such as "3 days ago"
 * "3 hours ago", "14 minutes ago", "12 days ago", "Today", "Yesterday".
 *
 * Closure's I18N formatter for relative dates and times is by default to
 * format strings function. It provides plural forms and many locales
 * using standard data from the Common Data Locale Repository (CLDR).
 */

goog.provide('goog.date.relative');
goog.provide('goog.date.relative.TimeDeltaFormatter');
goog.provide('goog.date.relative.Unit');

goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimePatterns');
goog.require('goog.i18n.RelativeDateTimeFormat');

goog.scope(function() {
// For referencing this module.
var RelativeDateTimeFormat =
    goog.module.get('goog.i18n.RelativeDateTimeFormat');

/**
 * Number of milliseconds in a minute.
 * @type {number}
 * @private
 */
goog.date.relative.MINUTE_MS_ = 60000;


/**
 * Number of milliseconds in a day.
 * @type {number}
 * @private
 */
goog.date.relative.DAY_MS_ = 86400000;


/**
 * Limit on number of days in past or future for formatting.
 * Since the timestamp is in milliseconds, the difference in days
 * is limited (10^9 milliseconds = 11.6 days.)
 * @type {number}
 * @private
 */
goog.date.relative.FORTNIGHT_ = 14;


/**
 * Unicode UTF-16 surrogate range minimum
 * @type {number}
 * @private
 */
goog.date.relative.SURROGATE_LOW_ = 0xd800;


/**
 * Unicode UTF-16 surrogate range maximum
 * @type {number}
 * @private
 */
goog.date.relative.SURROGATE_HIGH_ = 0xdfff;


/**
 * Enumeration used to identify time units internally.
 * @enum {number}
 */
goog.date.relative.Unit = {
  MINUTES: 0,
  HOURS: 1,
  DAYS: 2
};


/**
 * Full date formatter.
 * @type {?goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.fullDateFormatter_;


/**
 * Short time formatter.
 * @type {?goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.shortTimeFormatter_;


/**
 * Month-date formatter.
 * @type {?goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.monthDateFormatter_;


/**
 * Casing mode: default true for backward compatibility
 * True causes formatDay to capitalize first character of
 * the returned string.
 * If false, the string is not changed.
 * @type {boolean}
 * @private
 */
goog.date.relative.casingMode_ = true;


/**
 * Handles formatting of time deltas.
 * @private {?goog.date.relative.TimeDeltaFormatter}
 */
goog.date.relative.formatTimeDelta_;


/**
 * Caller-settable function for formatting time. Default is internal
 * formatting using goog.i18n.RelativeDateTimeFormat
 * @typedef {function(number, boolean, !goog.date.relative.Unit): string}
 */
goog.date.relative.TimeDeltaFormatter;


/**
 * Sets a different formatting function for time deltas ("3 days ago").
 * While its visibility is public, this function is Closure-internal and should
 * not be used in application code.
 * @param {!goog.date.relative.TimeDeltaFormatter} formatter The function to use
 *     for formatting time deltas (i.e. relative times).
 */
goog.date.relative.setTimeDeltaFormatter = function(formatter) {
  goog.date.relative.formatTimeDelta_ = formatter;
};


/**
 * Sets casing mode to a boolean.
 * If true, the first letter of day formats ("today", "yesterday", "tommorow")
 * is capitalized using locale-aware toUpper.
 * If false, no casing is done on basic data.
 * @param {boolean} capitalizeMode
 */
goog.date.relative.setCasingMode = function(capitalizeMode) {
  goog.date.relative.casingMode_ = capitalizeMode;
};


/**
 * Converts first letter of a string to upper case.
 * @param {string} text
 * @return {string}
 * @package Visible for testing
 */
goog.date.relative.upcase = function(text) {
  // Note: Casing is harder than just handling the first character, so
  // this is an approximation.

  var codepointLength = 1;
  // Check for surrogate values.
  var codePoint0 = text.charCodeAt(0);
  if (codePoint0 >= goog.date.relative.SURROGATE_LOW_ &&
      codePoint0 <= goog.date.relative.SURROGATE_HIGH_) {
    // It's a surrogate.
    codepointLength = 2;
  }
  text = text.substring(0, codepointLength).toLocaleUpperCase() +
      text.substring(codepointLength);
  return text;
};


/**
 * Returns string with "sentence casing" for the input string, i.e.,
 * Finds Day unit in relative date time compatible values, if available.
 * then formats the result using that data.
 * If codepoints are surrogate code points, returns the string unchanged.
 * If no relative non-numeric data is available, returns null.
 *
 * @param {number} dayOffset Offset of day unit for lookup in rdtf symbols data.
 * @return {string|null}
 * @private
 */
goog.date.relative.relativeCasedString_ = function(dayOffset) {
  var rdtf_formatter =
      new RelativeDateTimeFormat(RelativeDateTimeFormat.NumericOption.AUTO);

  var result =
      rdtf_formatter.format(dayOffset, RelativeDateTimeFormat.Unit.DAY);

  // Check for a digit in expected Auto results, which implies a Numeric
  // result was actually returned.
  // Limitation: This checks only for ASCII, Arabic, ArabicExtended digits.
  if (!result || result.match(/[0-9\u0660-\u0669\u06f0-\u06f9]/g)) {
    return null;
  }

  if (goog.date.relative.casingMode_) {
    return goog.date.relative.upcase(result);
  }
  return result;
};


/**
 * Returns a date in month format, e.g. Mar 15.
 * @param {!Date} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatMonth_ = function(date) {
  if (!goog.date.relative.monthDateFormatter_) {
    goog.date.relative.monthDateFormatter_ =
        new goog.i18n.DateTimeFormat(goog.i18n.DateTimePatterns.MONTH_DAY_ABBR);
  }
  return goog.date.relative.monthDateFormatter_.format(date);
};


/**
 * Returns a date in short-time format, e.g. 2:50 PM.
 * @param {!Date|!goog.date.DateTime} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatShortTime_ = function(date) {
  if (!goog.date.relative.shortTimeFormatter_) {
    goog.date.relative.shortTimeFormatter_ = new goog.i18n.DateTimeFormat(
        goog.i18n.DateTimeFormat.Format.SHORT_TIME);
  }
  return goog.date.relative.shortTimeFormatter_.format(date);
};


/**
 * Returns a date in full date format, e.g. Tuesday, March 24, 2009.
 * @param {!Date|!goog.date.DateTime} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatFullDate_ = function(date) {
  if (!goog.date.relative.fullDateFormatter_) {
    goog.date.relative.fullDateFormatter_ =
        new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.FULL_DATE);
  }
  return goog.date.relative.fullDateFormatter_.format(date);
};


/**
 * Formats quantity and relative unit using i18n.relativedatetimeformat.
 * Converts absolute quantity and unit to relative date time compatible values,
 * then formats the result using that data.
 *
 * @param {number} absQuantity
 * @param {boolean} futureFlag
 * @param {!goog.date.relative.Unit} relUnit
 * @return {string}
 * @private
 */
goog.date.relative.rdtformat_ = function(absQuantity, futureFlag, relUnit) {
  // Convert absolute value to negative for past, non-negative for future.
  var quantity = futureFlag ? absQuantity : -absQuantity;

  var rdtfFormatter = new RelativeDateTimeFormat();

  var rdtfUnit;
  switch (relUnit) {
    case goog.date.relative.Unit.MINUTES:
      rdtfUnit = RelativeDateTimeFormat.Unit.MINUTE;
      break;
    case goog.date.relative.Unit.HOURS:
      rdtfUnit = RelativeDateTimeFormat.Unit.HOUR;
      break;
    default:
    case goog.date.relative.Unit.DAYS:
      rdtfUnit = RelativeDateTimeFormat.Unit.DAY;
      break;
  }
  // Use locale-aware relatve date time formatter, compatible with ICU4C/ICU4J.
  return rdtfFormatter.format(quantity, rdtfUnit);
};


/**
 * Accepts a timestamp in milliseconds and outputs a relative time in the form
 * of "1 hour ago", "1 day ago", "in 1 hour", "in 2 days" etc.  If the date
 * delta is over 2 weeks, then the output string will be empty.
 * @param {number} dateMs Date in milliseconds.
 * @return {string} The formatted date.
 */
goog.date.relative.format = function(dateMs) {
  var now = goog.now();
  var delta = Math.floor((now - dateMs) / goog.date.relative.MINUTE_MS_);

  var future = false;

  if (delta < 0) {
    future = true;
    delta *= -1;
  }

  if (delta < 60) {  // Minutes.
    return goog.date.relative.formatTimeDelta_(
        delta, future, goog.date.relative.Unit.MINUTES);

  } else {
    delta = Math.floor(delta / 60);
    if (delta < 24) {  // Hours.
      return goog.date.relative.formatTimeDelta_(
          delta, future, goog.date.relative.Unit.HOURS);

    } else {
      // We can be more than 24 hours apart but still only 1 day apart, so we
      // compare the closest time from today against the target time to find
      // the number of days in the delta.
      var midnight = new Date(goog.now());
      midnight.setHours(0);
      midnight.setMinutes(0);
      midnight.setSeconds(0);
      midnight.setMilliseconds(0);

      // Convert to days ago.
      delta =
          Math.ceil((midnight.getTime() - dateMs) / goog.date.relative.DAY_MS_);

      if (future) {
        delta *= -1;
      }

      // Uses days for less than 2-weeks.
      if (delta < goog.date.relative.FORTNIGHT_) {
        return goog.date.relative.formatTimeDelta_(
            delta, future, goog.date.relative.Unit.DAYS);

      } else {
        // For messages older than 2 weeks do not show anything.  The client
        // should decide the date format to show.
        return '';
      }
    }
  }
};


/**
 * Accepts a timestamp in milliseconds and outputs a relative time in the form
 * of "1 hour ago", "1 day ago".  All future times will be returned as 0 minutes
 * ago.
 *
 * This is provided for compatibility with users of the previous incarnation of
 * the above {@see #format} method who relied on it protecting against
 * future dates.
 *
 * @param {number} dateMs Date in milliseconds.
 * @return {string} The formatted date.
 */
goog.date.relative.formatPast = function(dateMs) {
  var now = goog.now();
  if (now < dateMs) {
    dateMs = now;
  }
  return goog.date.relative.format(dateMs);
};


/**
 * Accepts a timestamp in milliseconds and outputs a relative day. i.e. "Today",
 * "Yesterday", "Tomorrow", or "Sept 15".
 *
 * @param {number} dateMs Date in milliseconds.
 * @param {function(!Date):string=} opt_formatter Formatter for the date.
 *     Defaults to form 'MMM dd'.
 * @return {string} The formatted date.
 */
goog.date.relative.formatDay = function(dateMs, opt_formatter) {
  var today = new Date(goog.now());

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  var dayOffset = (dateMs - today.getTime()) / goog.date.relative.DAY_MS_;

  dayOffset = Math.floor(dayOffset);

  var relativeResult = goog.date.relative.relativeCasedString_(dayOffset);

  if (relativeResult) {
    // Return the non-numeric answer such as "ayer" or "tomorrow".
    return relativeResult;
  }

  // Use specialized formatting such as day and month when no
  // special form for the offset is available.
  var formatFunction = opt_formatter || goog.date.relative.formatMonth_;
  return formatFunction(new Date(dateMs));
};


/**
 * Formats a date, adding the relative date in parenthesis.  If the date is less
 * than 24 hours then the time will be printed, otherwise the full-date will be
 * used.  Examples:
 *   2:20 PM (1 minute ago)
 *   Monday, February 27, 2009 (4 days ago)
 *   Tuesday, March 20, 2005    // Too long ago for a relative date.
 *
 * @param {!Date|!goog.date.DateTime} date A date object.
 * @param {string=} opt_shortTimeMsg An optional short time message can be
 *     provided if available, so that it's not recalculated in this function.
 * @param {string=} opt_fullDateMsg An optional date message can be
 *     provided if available, so that it's not recalculated in this function.
 * @return {string} The date string in the above form.
 */
goog.date.relative.getDateString = function(
    date, opt_shortTimeMsg, opt_fullDateMsg) {
  return goog.date.relative.getDateString_(
      date, goog.date.relative.format, opt_shortTimeMsg, opt_fullDateMsg);
};


/**
 * Formats a date, adding the relative date in parenthesis.   Functions the same
 * as #getDateString but ensures that the date is always seen to be in the past.
 * If the date is in the future, it will be shown as 0 minutes ago.
 *
 * This is provided for compatibility with users of the previous incarnation of
 * the above {@see #getDateString} method who relied on it protecting against
 * future dates.
 *
 * @param {Date|goog.date.DateTime} date A date object.
 * @param {string=} opt_shortTimeMsg An optional short time message can be
 *     provided if available, so that it's not recalculated in this function.
 * @param {string=} opt_fullDateMsg An optional date message can be
 *     provided if available, so that it's not recalculated in this function.
 * @return {string} The date string in the above form.
 */
goog.date.relative.getPastDateString = function(
    date, opt_shortTimeMsg, opt_fullDateMsg) {
  return goog.date.relative.getDateString_(
      date, goog.date.relative.formatPast, opt_shortTimeMsg, opt_fullDateMsg);
};


/**
 * Formats a date, adding the relative date in parenthesis.  If the date is less
 * than 24 hours then the time will be printed, otherwise the full-date will be
 * used.  Examples:
 *   2:20 PM (1 minute ago)
 *   Monday, February 27, 2009 (4 days ago)
 *   Tuesday, March 20, 2005    // Too long ago for a relative date.
 *
 * @param {Date|goog.date.DateTime} date A date object.
 * @param {function(number) : string} relativeFormatter Function to use when
 *     formatting the relative date.
 * @param {string=} opt_shortTimeMsg An optional short time message can be
 *     provided if available, so that it's not recalculated in this function.
 * @param {string=} opt_fullDateMsg An optional date message can be
 *     provided if available, so that it's not recalculated in this function.
 * @return {string} The date string in the above form.
 * @private
 */
goog.date.relative.getDateString_ = function(
    date, relativeFormatter, opt_shortTimeMsg, opt_fullDateMsg) {
  var dateMs = date.getTime();

  var relativeDate = relativeFormatter(dateMs);

  if (relativeDate) {
    relativeDate = ' (' + relativeDate + ')';
  }

  var delta = Math.floor((goog.now() - dateMs) / goog.date.relative.MINUTE_MS_);
  if (delta < 60 * 24) {
    // TODO(user): this call raises an exception if date is a goog.date.Date.
    return (opt_shortTimeMsg || goog.date.relative.formatShortTime_(date)) +
        relativeDate;
  } else {
    return (opt_fullDateMsg || goog.date.relative.formatFullDate_(date)) +
        relativeDate;
  }
};
});  // End of scope for RelativeDateTimeFormat.

// Set default formatter for date/time.
goog.date.relative.setTimeDeltaFormatter(goog.date.relative.rdtformat_);
