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
 * @fileoverview Date range data structure. Based loosely on
 * com.google.common.util.DateRange.
 *
 */

goog.provide('goog.date.DateRange');
goog.provide('goog.date.DateRange.Iterator');
goog.provide('goog.date.DateRange.StandardDateRangeKeys');

goog.require('goog.date.Date');
goog.require('goog.date.DateLike');
goog.require('goog.date.Interval');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');



/**
 * Constructs a date range.
 * @constructor
 * @param {goog.date.DateLike} startDate The start date of the range.
 * @param {goog.date.DateLike} endDate The end date of the range.
 */
goog.date.DateRange = function(startDate, endDate) {
  /**
   * The start date.
   * @type {goog.date.Date}
   * @private
   */
  this.startDate_ = new goog.date.Date(startDate);

  /**
   * The end date.
   * @type {goog.date.Date}
   * @private
   */
  this.endDate_ = new goog.date.Date(endDate);
};


/**
 * The first possible day, as far as this class is concerned.
 * @type {goog.date.Date}
 */
goog.date.DateRange.MINIMUM_DATE = new goog.date.Date(0000, 0, 1);


/**
 * The last possible day, as far as this class is concerned.
 * @type {goog.date.Date}
 */
goog.date.DateRange.MAXIMUM_DATE = new goog.date.Date(9999, 11, 31);


/**
 * @return {goog.date.Date} The start date.
 */
goog.date.DateRange.prototype.getStartDate = function() {
  return this.startDate_;
};


/**
 * @return {goog.date.Date} The end date.
 */
goog.date.DateRange.prototype.getEndDate = function() {
  return this.endDate_;
};


/**
 * @return {goog.iter.Iterator} An iterator over the date range.
 */
goog.date.DateRange.prototype.iterator = function() {
  return new goog.date.DateRange.Iterator(this);
};


/**
 * Tests two {@link goog.date.DateRange} objects for equality.
 * @param {goog.date.DateRange} a A date range.
 * @param {goog.date.DateRange} b A date range.
 * @return {boolean} Whether |a| is the same range as |b|.
 */
goog.date.DateRange.equals = function(a, b) {
  // Test for same object reference; type conversion is irrelevant.
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  return a.startDate_.equals(b.startDate_) && a.endDate_.equals(b.endDate_);
};


/**
 * Calculates a date that is a number of days after a date. Does not modify its
 * input.
 * @param {goog.date.DateLike} date The input date.
 * @param {number} offset Number of days.
 * @return {goog.date.Date} The date that is |offset| days after |date|.
 * @private
 */
goog.date.DateRange.offsetInDays_ = function(date, offset) {
  var newDate = new goog.date.Date(date);
  newDate.add(new goog.date.Interval(goog.date.Interval.DAYS, offset));
  return newDate;
};


/**
 * Calculates the Monday before a date. If the input is a Monday, returns the
 * input. Does not modify its input.
 * @param {goog.date.DateLike} date The input date.
 * @return {goog.date.Date} If |date| is a Monday, return |date|; otherwise
 *     return the Monday before |date|.
 * @private
 */
goog.date.DateRange.currentOrLastMonday_ = function(date) {
  var newDate = new goog.date.Date(date);
  newDate.add(new goog.date.Interval(goog.date.Interval.DAYS,
      -newDate.getIsoWeekday()));
  return newDate;
};


/**
 * Calculates a date that is a number of months after the first day in the
 * month that contains its input. Does not modify its input.
 * @param {goog.date.DateLike} date The input date.
 * @param {number} offset Number of months.
 * @return {goog.date.Date} The date that is |offset| months after the first
 *     day in the month that contains |date|.
 * @private
 */
goog.date.DateRange.offsetInMonths_ = function(date, offset) {
  var newDate = new goog.date.Date(date);
  newDate.setDate(1);
  newDate.add(new goog.date.Interval(goog.date.Interval.MONTHS, offset));
  return newDate;
};


/**
 * Returns the range from yesterday to yesterday.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that includes only yesterday.
 */
goog.date.DateRange.yesterday = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  var yesterday = goog.date.DateRange.offsetInDays_(today, -1);
  return new goog.date.DateRange(yesterday, yesterday);
};


/**
 * Returns the range from today to today.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that includes only today.
 */
goog.date.DateRange.today = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  return new goog.date.DateRange(today, today);
};


/**
 * Returns the range that includes the seven days that end yesterday.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that includes the seven days that
 *     end yesterday.
 */
goog.date.DateRange.last7Days = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  var yesterday = goog.date.DateRange.offsetInDays_(today, -1);
  return new goog.date.DateRange(goog.date.DateRange.offsetInDays_(today, -7),
      yesterday);
};


/**
 * Returns the range that starts the first of this month and ends the last day
 * of this month.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that starts the first of this month
 *     and ends the last day of this month.
 */
goog.date.DateRange.thisMonth = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  return new goog.date.DateRange(
      goog.date.DateRange.offsetInMonths_(today, 0),
      goog.date.DateRange.offsetInDays_(
          goog.date.DateRange.offsetInMonths_(today, 1),
          -1));
};


/**
 * Returns the range that starts the first of last month and ends the last day
 * of last month.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that starts the first of last month
 *     and ends the last day of last month.
 */
goog.date.DateRange.lastMonth = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  return new goog.date.DateRange(
      goog.date.DateRange.offsetInMonths_(today, -1),
      goog.date.DateRange.offsetInDays_(
          goog.date.DateRange.offsetInMonths_(today, 0),
          -1));
};


/**
 * Returns the range that starts the Monday on or before today and ends the
 * Sunday on or after today.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that starts the Monday on or before
 *     today and ends the Sunday on or after today.
 */
goog.date.DateRange.thisWeek = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  var start = goog.date.DateRange.offsetInDays_(today, -today.getIsoWeekday());
  var end = goog.date.DateRange.offsetInDays_(start, 6);
  return new goog.date.DateRange(start, end);
};


/**
 * Returns the range that starts seven days before the Monday on or before
 * today and ends the Sunday on or before yesterday.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that starts seven days before the
 *     Monday on or before today and ends the Sunday on or before yesterday.
 */
goog.date.DateRange.lastWeek = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  var start = goog.date.DateRange.offsetInDays_(today,
      - 7 - today.getIsoWeekday());
  var end = goog.date.DateRange.offsetInDays_(start, 6);
  return new goog.date.DateRange(start, end);
};


/**
 * Returns the range that starts seven days before the Monday on or before
 * today and ends the Friday before today.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that starts seven days before the
 *     Monday on or before today and ends the Friday before today.
 */
goog.date.DateRange.lastBusinessWeek = function(opt_today) {
  var today = new goog.date.Date(opt_today);
  var start = goog.date.DateRange.offsetInDays_(today,
      - 7 - today.getIsoWeekday());
  var end = goog.date.DateRange.offsetInDays_(start, 4);
  return new goog.date.DateRange(start, end);
};


/**
 * Returns the range that includes all days between January 1, 1900 and
 * December 31, 9999.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The range that includes all days between
 *     January 1, 1900 and December 31, 9999.
 */
goog.date.DateRange.allTime = function(opt_today) {
  return new goog.date.DateRange(
      goog.date.DateRange.MINIMUM_DATE,
      goog.date.DateRange.MAXIMUM_DATE);
};


/**
 * Standard date range keys. Equivalent to the enum IDs in
 * DateRange.java http://go/datarange.java
 *
 * @enum {string}
 */
goog.date.DateRange.StandardDateRangeKeys = {
  YESTERDAY: 'yesterday',
  TODAY: 'today',
  LAST_7_DAYS: 'last7days',
  THIS_MONTH: 'thismonth',
  LAST_MONTH: 'lastmonth',
  THIS_WEEK: 'thisweek',
  LAST_WEEK: 'lastweek',
  LAST_BUSINESS_WEEK: 'lastbusinessweek',
  ALL_TIME: 'alltime'
};


/**
 * @param {string} dateRangeKey A standard date range key.
 * @param {goog.date.DateLike=} opt_today The date to consider today.
 *     Defaults to today.
 * @return {goog.date.DateRange} The date range that corresponds to that key.
 * @throws {Error} If no standard date range with that key exists.
 */
goog.date.DateRange.standardDateRange = function(dateRangeKey, opt_today) {
  switch (dateRangeKey) {
    case goog.date.DateRange.StandardDateRangeKeys.YESTERDAY:
      return goog.date.DateRange.yesterday(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.TODAY:
      return goog.date.DateRange.today(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.LAST_7_DAYS:
      return goog.date.DateRange.last7Days(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.THIS_MONTH:
      return goog.date.DateRange.thisMonth(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.LAST_MONTH:
      return goog.date.DateRange.lastMonth(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.THIS_WEEK:
      return goog.date.DateRange.thisWeek(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.LAST_WEEK:
      return goog.date.DateRange.lastWeek(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.LAST_BUSINESS_WEEK:
      return goog.date.DateRange.lastBusinessWeek(opt_today);

    case goog.date.DateRange.StandardDateRangeKeys.ALL_TIME:
      return goog.date.DateRange.allTime(opt_today);

    default:
      throw Error('no such date range key: ' + dateRangeKey);
  }
};



/**
 * Creates an iterator over the dates in a {@link goog.date.DateRange}.
 * @constructor
 * @extends {goog.iter.Iterator}
 * @param {goog.date.DateRange} dateRange The date range to iterate.
 */
goog.date.DateRange.Iterator = function(dateRange) {
  /**
   * The next date.
   * @type {goog.date.Date}
   * @private
   */
  this.nextDate_ = dateRange.getStartDate().clone();

  /**
   * The end date, expressed as an integer: YYYYMMDD.
   * @type {number}
   * @private
   */
  this.endDate_ = Number(dateRange.getEndDate().toIsoString());
};
goog.inherits(goog.date.DateRange.Iterator, goog.iter.Iterator);


/** @inheritDoc */
goog.date.DateRange.Iterator.prototype.next = function() {
  if (Number(this.nextDate_.toIsoString()) > this.endDate_) {
    throw goog.iter.StopIteration;
  }

  var rv = this.nextDate_.clone();
  this.nextDate_.add(new goog.date.Interval(goog.date.Interval.DAYS, 1));
  return rv;
};
