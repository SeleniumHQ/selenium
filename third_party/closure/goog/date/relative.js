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
 * For better quality localization of plurals ("hours"/"minutes"/"days") and
 * to use local digits, goog.date.relativeWithPlurals can be loaded in addition
 * to this namespace.
 *
 */

goog.provide('goog.date.relative');
goog.provide('goog.date.relative.TimeDeltaFormatter');
goog.provide('goog.date.relative.Unit');

goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimePatterns');


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
 * @type {goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.fullDateFormatter_;


/**
 * Short time formatter.
 * @type {goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.shortTimeFormatter_;


/**
 * Month-date formatter.
 * @type {goog.i18n.DateTimeFormat}
 * @private
 */
goog.date.relative.monthDateFormatter_;


/**
 * @typedef {function(number, boolean, goog.date.relative.Unit): string}
 */
goog.date.relative.TimeDeltaFormatter;


/**
 * Handles formatting of time deltas.
 * @private {goog.date.relative.TimeDeltaFormatter}
 */
goog.date.relative.formatTimeDelta_;


/**
 * Sets a different formatting function for time deltas ("3 days ago").
 * While its visibility is public, this function is Closure-internal and should
 * not be used in application code.
 * @param {goog.date.relative.TimeDeltaFormatter} formatter The function to use
 *     for formatting time deltas (i.e. relative times).
 */
goog.date.relative.setTimeDeltaFormatter = function(formatter) {
  goog.date.relative.formatTimeDelta_ = formatter;
};


/**
 * Returns a date in month format, e.g. Mar 15.
 * @param {Date} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatMonth_ = function(date) {
  if (!goog.date.relative.monthDateFormatter_) {
    goog.date.relative.monthDateFormatter_ = new goog.i18n.DateTimeFormat(
        goog.i18n.DateTimePatterns.MONTH_DAY_ABBR);
  }
  return goog.date.relative.monthDateFormatter_.format(date);
};


/**
 * Returns a date in short-time format, e.g. 2:50 PM.
 * @param {Date|goog.date.DateTime} date The date object.
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
 * @param {Date|goog.date.DateTime} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatFullDate_ = function(date) {
  if (!goog.date.relative.fullDateFormatter_) {
    goog.date.relative.fullDateFormatter_ = new goog.i18n.DateTimeFormat(
        goog.i18n.DateTimeFormat.Format.FULL_DATE);
  }
  return goog.date.relative.fullDateFormatter_.format(date);
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

  if (delta < 60) { // Minutes.
    return goog.date.relative.formatTimeDelta_(
        delta, future, goog.date.relative.Unit.MINUTES);

  } else {
    delta = Math.floor(delta / 60);
    if (delta < 24) { // Hours.
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
      delta = Math.ceil(
          (midnight.getTime() - dateMs) / goog.date.relative.DAY_MS_);

      if (future) {
        delta *= -1;
      }

      // Uses days for less than 2-weeks.
      if (delta < 14) {
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

  var yesterday = new Date(today.getTime() - goog.date.relative.DAY_MS_);
  var tomorrow = new Date(today.getTime() + goog.date.relative.DAY_MS_);
  var dayAfterTomorrow = new Date(today.getTime() +
      2 * goog.date.relative.DAY_MS_);

  var message;
  if (dateMs >= tomorrow.getTime() && dateMs < dayAfterTomorrow.getTime()) {
    /** @desc Tomorrow. */
    var MSG_TOMORROW = goog.getMsg('Tomorrow');
    message = MSG_TOMORROW;
  } else if (dateMs >= today.getTime() && dateMs < tomorrow.getTime()) {
    /** @desc Today. */
    var MSG_TODAY = goog.getMsg('Today');
    message = MSG_TODAY;
  } else if (dateMs >= yesterday.getTime() && dateMs < today.getTime()) {
    /** @desc Yesterday. */
    var MSG_YESTERDAY = goog.getMsg('Yesterday');
    message = MSG_YESTERDAY;
  } else {
    // If we don't have a special relative term for this date, then return the
    // short date format (or a custom-formatted date).
    var formatFunction = opt_formatter || goog.date.relative.formatMonth_;
    message = formatFunction(new Date(dateMs));
  }
  return message;
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


/*
 * TODO(user):
 *
 * I think that this whole relative formatting should move to DateTimeFormat.
 * But we would have to wait for the next version of CLDR, which is cleaning
 * the data for relative dates (even ICU has incomplete support for this).
 */
/**
 * Gets a localized relative date string for a given delta and unit.
 * @param {number} delta Number of minutes/hours/days.
 * @param {boolean} future Whether the delta is in the future.
 * @param {goog.date.relative.Unit} unit The units the delta is in.
 * @return {string} The message.
 * @private
 */
goog.date.relative.getMessage_ = function(delta, future, unit) {
  var deltaFormatted = goog.i18n.DateTimeFormat.localizeNumbers(delta);
  if (!future && unit == goog.date.relative.Unit.MINUTES) {
    /**
     * @desc Relative date indicating how many minutes ago something happened
     * (singular).
     */
    var MSG_MINUTES_AGO_SINGULAR =
        goog.getMsg('{$num} minute ago', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating how many minutes ago something happened
     * (plural).
     */
    var MSG_MINUTES_AGO_PLURAL =
        goog.getMsg('{$num} minutes ago', {'num' : deltaFormatted});

    return delta == 1 ? MSG_MINUTES_AGO_SINGULAR : MSG_MINUTES_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit.MINUTES) {
    /**
     * @desc Relative date indicating in how many minutes something happens
     * (singular).
     */
    var MSG_IN_MINUTES_SINGULAR =
        goog.getMsg('in {$num} minute', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating in how many minutes something happens
     * (plural).
     */
    var MSG_IN_MINUTES_PLURAL =
        goog.getMsg('in {$num} minutes', {'num' : deltaFormatted});

    return delta == 1 ? MSG_IN_MINUTES_SINGULAR : MSG_IN_MINUTES_PLURAL;

  } else if (!future && unit == goog.date.relative.Unit.HOURS) {
    /**
     * @desc Relative date indicating how many hours ago something happened
     * (singular).
     */
    var MSG_HOURS_AGO_SINGULAR =
        goog.getMsg('{$num} hour ago', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating how many hours ago something happened
     * (plural).
     */
    var MSG_HOURS_AGO_PLURAL =
        goog.getMsg('{$num} hours ago', {'num' : deltaFormatted});

    return delta == 1 ? MSG_HOURS_AGO_SINGULAR : MSG_HOURS_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit.HOURS) {
    /**
     * @desc Relative date indicating in how many hours something happens
     * (singular).
     */
    var MSG_IN_HOURS_SINGULAR =
        goog.getMsg('in {$num} hour', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating in how many hours something happens
     * (plural).
     */
    var MSG_IN_HOURS_PLURAL =
        goog.getMsg('in {$num} hours', {'num' : deltaFormatted});

    return delta == 1 ? MSG_IN_HOURS_SINGULAR : MSG_IN_HOURS_PLURAL;

  } else if (!future && unit == goog.date.relative.Unit.DAYS) {
    /**
     * @desc Relative date indicating how many days ago something happened
     * (singular).
     */
    var MSG_DAYS_AGO_SINGULAR =
        goog.getMsg('{$num} day ago', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating how many days ago something happened
     * (plural).
     */
    var MSG_DAYS_AGO_PLURAL =
        goog.getMsg('{$num} days ago', {'num' : deltaFormatted});

    return delta == 1 ? MSG_DAYS_AGO_SINGULAR : MSG_DAYS_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit.DAYS) {
    /**
     * @desc Relative date indicating in how many days something happens
     * (singular).
     */
    var MSG_IN_DAYS_SINGULAR =
        goog.getMsg('in {$num} day', {'num' : deltaFormatted});

    /**
     * @desc Relative date indicating in how many days something happens
     * (plural).
     */
    var MSG_IN_DAYS_PLURAL =
        goog.getMsg('in {$num} days', {'num' : deltaFormatted});

    return delta == 1 ? MSG_IN_DAYS_SINGULAR : MSG_IN_DAYS_PLURAL;

  } else {
    return '';
  }
};

goog.date.relative.setTimeDeltaFormatter(goog.date.relative.getMessage_);
