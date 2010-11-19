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
 */

goog.provide('goog.date.relative');

goog.require('goog.i18n.DateTimeFormat');


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
 * @private
 */
goog.date.relative.Unit_ = {
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
 * Returns a date in month format, e.g. Mar 15.
 * @param {Date} date The date object.
 * @return {string} The formatted string.
 * @private
 */
goog.date.relative.formatMonth_ = function(date) {
  if (!goog.date.relative.monthDateFormatter_) {
    goog.date.relative.monthDateFormatter_ =
        new goog.i18n.DateTimeFormat('MMM dd');
  }
  return goog.date.relative.monthDateFormatter_.format(date);
};


/**
 * Returns a date in short-time format, e.g. 2:50 PM.
 * @param {Date} date The date object.
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
 * @param {Date} date The date object.
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
    return goog.date.relative.getMessage_(
        delta, future, goog.date.relative.Unit_.MINUTES);

  } else {
    delta = Math.floor(delta / 60);
    if (delta < 24) { // Hours.
      return goog.date.relative.getMessage_(
          delta, future, goog.date.relative.Unit_.HOURS);

    } else {
      // Timezone offset is in minutes.  We pass goog.now so that we can easily
      // unit test this, the JSCompiler will optimize it away for us.
      var offset = new Date(goog.now()).getTimezoneOffset() *
          goog.date.relative.MINUTE_MS_;

      // Convert to days ago.
      delta = Math.floor((now + offset) / goog.date.relative.DAY_MS_) -
              Math.floor((dateMs + offset) / goog.date.relative.DAY_MS_);

      if (future) {
        delta *= -1;
      }

      // Uses days for less than 2-weeks.
      if (delta < 14) {
        return goog.date.relative.getMessage_(
            delta, future, goog.date.relative.Unit_.DAYS);

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
 * "Yesterday" or "Sept 15".
 *
 * @param {number} dateMs Date in milliseconds.
 * @return {string} The formatted date.
 */
goog.date.relative.formatDay = function(dateMs) {
  var message;
  var today = new Date(goog.now());

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  var yesterday = new Date(today.getTime() - goog.date.relative.DAY_MS_);
  if (today.getTime() < dateMs) {
    /** @desc Today. */
    var MSG_TODAY = goog.getMsg('Today');
    message = MSG_TODAY;
  } else if (yesterday.getTime() < dateMs) {
    /** @desc Yesterday. */
    var MSG_YESTERDAY = goog.getMsg('Yesterday');
    message = MSG_YESTERDAY;
  } else {
    message = goog.date.relative.formatMonth_(new Date(dateMs));
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
 * @param {Date} date A date object.
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
 * @param {Date} date A timestamp or date object.
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
 * @param {Date} date A timestamp or date object.
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
    return (opt_shortTimeMsg || goog.date.relative.formatShortTime_(date)) +
        relativeDate;
  } else {
    return (opt_fullDateMsg || goog.date.relative.formatFullDate_(date)) +
        relativeDate;
  }
};


/**
 * Gets a localized relative date string for a given delta and unit.
 * @param {number} delta Number of minutes/hours/days.
 * @param {boolean} future Whether the delta is in the future.
 * @param {goog.date.relative.Unit_} unit The units the delta is in.
 * @return {string} The message.
 * @private
 */
goog.date.relative.getMessage_ = function(delta, future, unit) {
  if (!future && unit == goog.date.relative.Unit_.MINUTES) {
    /**
     * @desc Relative date indicating how many minutes ago something happened
     * (singular).
     */
    var MSG_MINUTES_AGO_SINGULAR =
        goog.getMsg('{$num} minute ago', {'num' : delta});

    /**
     * @desc Relative date indicating how many minutes ago something happened
     * (plural).
     */
    var MSG_MINUTES_AGO_PLURAL =
        goog.getMsg('{$num} minutes ago', {'num' : delta});

    return delta == 1 ? MSG_MINUTES_AGO_SINGULAR : MSG_MINUTES_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit_.MINUTES) {
    /**
     * @desc Relative date indicating in how many minutes something happens
     * (singular).
     */
    var MSG_IN_MINUTES_SINGULAR =
        goog.getMsg('in {$num} minute', {'num' : delta});

    /**
     * @desc Relative date indicating in how many minutes something happens
     * (plural).
     */
    var MSG_IN_MINUTES_PLURAL =
        goog.getMsg('in {$num} minutes', {'num' : delta});

    return delta == 1 ? MSG_IN_MINUTES_SINGULAR : MSG_IN_MINUTES_PLURAL;

  } else if (!future && unit == goog.date.relative.Unit_.HOURS) {
    /**
     * @desc Relative date indicating how many hours ago something happened
     * (singular).
     */
    var MSG_HOURS_AGO_SINGULAR =
        goog.getMsg('{$num} hour ago', {'num' : delta});

    /**
     * @desc Relative date indicating how many hours ago something happened
     * (plural).
     */
    var MSG_HOURS_AGO_PLURAL = goog.getMsg('{$num} hours ago', {'num' : delta});

    return delta == 1 ? MSG_HOURS_AGO_SINGULAR : MSG_HOURS_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit_.HOURS) {
    /**
     * @desc Relative date indicating in how many hours something happens
     * (singular).
     */
    var MSG_IN_HOURS_SINGULAR = goog.getMsg('in {$num} hour', {'num' : delta});

    /**
     * @desc Relative date indicating in how many hours something happens
     * (plural).
     */
    var MSG_IN_HOURS_PLURAL = goog.getMsg('in {$num} hours', {'num' : delta});

    return delta == 1 ? MSG_IN_HOURS_SINGULAR : MSG_IN_HOURS_PLURAL;

  } else if (!future && unit == goog.date.relative.Unit_.DAYS) {
    /**
     * @desc Relative date indicating how many days ago something happened
     * (singular).
     */
    var MSG_DAYS_AGO_SINGULAR = goog.getMsg('{$num} day ago', {'num' : delta});

    /**
     * @desc Relative date indicating how many days ago something happened
     * (plural).
     */
    var MSG_DAYS_AGO_PLURAL = goog.getMsg('{$num} days ago', {'num' : delta});

    return delta == 1 ? MSG_DAYS_AGO_SINGULAR : MSG_DAYS_AGO_PLURAL;

  } else if (future && unit == goog.date.relative.Unit_.DAYS) {
    /**
     * @desc Relative date indicating in how many days something happens
     * (singular).
     */
    var MSG_IN_DAYS_SINGULAR = goog.getMsg('in {$num} day', {'num' : delta});

    /**
     * @desc Relative date indicating in how many days something happens
     * (plural).
     */
    var MSG_IN_DAYS_PLURAL = goog.getMsg('in {$num} days', {'num' : delta});

    return delta == 1 ? MSG_IN_DAYS_SINGULAR : MSG_IN_DAYS_PLURAL;

  } else {
    return '';
  }
};
