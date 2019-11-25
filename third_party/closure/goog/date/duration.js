// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions for formatting duration values.  Such as "3 days"
 * "3 hours", "14 minutes", "2 hours 45 minutes".
 *
 */

goog.provide('goog.date.duration');

goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.MessageFormat');


/**
 * Number of milliseconds in a minute.
 * @type {number}
 * @private
 */
goog.date.duration.MINUTE_MS_ = 60000;


/**
 * Number of milliseconds in an hour.
 * @type {number}
 * @private
 */
goog.date.duration.HOUR_MS_ = 3600000;


/**
 * Number of milliseconds in a day.
 * @type {number}
 * @private
 */
goog.date.duration.DAY_MS_ = 86400000;


/**
 * Accepts a duration in milliseconds and outputs an absolute duration time in
 * form of "1 day", "2 hours", "20 minutes", "2 days 1 hour 15 minutes" etc.
 * @param {number} durationMs Duration in milliseconds.
 * @return {string} The formatted duration.
 */
goog.date.duration.format = function(durationMs) {
  var ms = Math.abs(durationMs);

  // Handle durations shorter than 1 minute.
  if (ms < goog.date.duration.MINUTE_MS_) {
    /**
     * @desc Duration time of zero minutes.
     */
    var MSG_ZERO_MINUTES = goog.getMsg('0 minutes');
    return MSG_ZERO_MINUTES;
  }

  var days = Math.floor(ms / goog.date.duration.DAY_MS_);
  ms %= goog.date.duration.DAY_MS_;

  var hours = Math.floor(ms / goog.date.duration.HOUR_MS_);
  ms %= goog.date.duration.HOUR_MS_;

  var minutes = Math.floor(ms / goog.date.duration.MINUTE_MS_);

  // Localized number representations.
  var daysText = goog.i18n.DateTimeFormat.localizeNumbers(days);
  var hoursText = goog.i18n.DateTimeFormat.localizeNumbers(hours);
  var minutesText = goog.i18n.DateTimeFormat.localizeNumbers(minutes);

  // We need a space after the days if there are hours or minutes to come.
  var daysSeparator = days * (hours + minutes) ? ' ' : '';
  // We need a space after the hours if there are minutes to come.
  var hoursSeparator = hours * minutes ? ' ' : '';

  /**
   * @desc The days part of the duration message: 1 day, 5 days.
   */
  var MSG_DURATION_DAYS = goog.getMsg(
      '{COUNT, plural, ' +
      '=0 {}' +
      '=1 {{TEXT} day}' +
      'other {{TEXT} days}}');
  /**
   * @desc The hours part of the duration message: 1 hour, 5 hours.
   */
  var MSG_DURATION_HOURS = goog.getMsg(
      '{COUNT, plural, ' +
      '=0 {}' +
      '=1 {{TEXT} hour}' +
      'other {{TEXT} hours}}');
  /**
   * @desc The minutes part of the duration message: 1 minute, 5 minutes.
   */
  var MSG_DURATION_MINUTES = goog.getMsg(
      '{COUNT, plural, ' +
      '=0 {}' +
      '=1 {{TEXT} minute}' +
      'other {{TEXT} minutes}}');

  var daysPart = goog.date.duration.getDurationMessagePart_(
      MSG_DURATION_DAYS, days, daysText);
  var hoursPart = goog.date.duration.getDurationMessagePart_(
      MSG_DURATION_HOURS, hours, hoursText);
  var minutesPart = goog.date.duration.getDurationMessagePart_(
      MSG_DURATION_MINUTES, minutes, minutesText);

  /**
   * @desc Duration time text concatenated from the individual time unit message
   * parts. The separator will be a space (e.g. '1 day 2 hours 24 minutes') or
   * nothing in case one/two of the duration parts is empty (
   * e.g. '1 hour 30 minutes', '3 days 15 minutes', '2 hours').
   */
  var MSG_CONCATENATED_DURATION_TEXT = goog.getMsg(
      '{$daysPart}{$daysSeparator}{$hoursPart}{$hoursSeparator}{$minutesPart}',
      {
        'daysPart': daysPart,
        'daysSeparator': daysSeparator,
        'hoursPart': hoursPart,
        'hoursSeparator': hoursSeparator,
        'minutesPart': minutesPart
      });

  return MSG_CONCATENATED_DURATION_TEXT;
};


/**
 * Gets a duration message part for a time unit.
 * @param {string} pattern The pattern to apply.
 * @param {number} count The number of units.
 * @param {string} text The string to use for amount of units in the message.
 * @return {string} The formatted message part.
 * @private
 */
goog.date.duration.getDurationMessagePart_ = function(pattern, count, text) {
  var formatter = new goog.i18n.MessageFormat(pattern);
  return formatter.format({'COUNT': count, 'TEXT': text});
};
