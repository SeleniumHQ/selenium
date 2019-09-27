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
 * @fileoverview Code to make goog.date.relative plurals-aware.
 */

goog.provide('goog.date.relativeWithPlurals');

goog.require('goog.date.relative');
goog.require('goog.date.relative.Unit');
goog.require('goog.i18n.MessageFormat');


/**
 * Gets a localized relative date string for a given delta and unit.
 * @param {number} delta Number of minutes/hours/days.
 * @param {boolean} future Whether the delta is in the future.
 * @param {goog.date.relative.Unit} unit The units the delta is in.
 * @return {string} The message.
 * @private
 */
goog.date.relativeWithPlurals.formatTimeDelta_ = function(delta, future, unit) {
  if (!future && unit == goog.date.relative.Unit.MINUTES) {
    /**
     * @desc Relative date indicating how many minutes ago something happened.
     */
    var MSG_MINUTES_AGO_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {# minutes ago}' +
        '=1 {# minute ago}' +
        'other {# minutes ago}}');

    return new goog.i18n.MessageFormat(MSG_MINUTES_AGO_ICU).format({
      'NUM': delta
    });

  } else if (future && unit == goog.date.relative.Unit.MINUTES) {
    /**
     * @desc Relative date indicating in how many minutes something happens.
     */
    var MSG_IN_MINUTES_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {in # minutes}' +
        '=1 {in # minute}' +
        'other {in # minutes}}');

    return new goog.i18n.MessageFormat(MSG_IN_MINUTES_ICU).format({
      'NUM': delta
    });

  } else if (!future && unit == goog.date.relative.Unit.HOURS) {
    /**
     * @desc Relative date indicating how many hours ago something happened.
     */
    var MSG_HOURS_AGO_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {# hours ago}' +
        '=1 {# hour ago}' +
        'other {# hours ago}}');

    return new goog.i18n.MessageFormat(MSG_HOURS_AGO_ICU).format({
      'NUM': delta
    });

  } else if (future && unit == goog.date.relative.Unit.HOURS) {
    /**
     * @desc Relative date indicating in how many hours something happens.
     */
    var MSG_IN_HOURS_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {in # hours}' +
        '=1 {in # hour}' +
        'other {in # hours}}');

    return new goog.i18n.MessageFormat(MSG_IN_HOURS_ICU).format({'NUM': delta});

  } else if (!future && unit == goog.date.relative.Unit.DAYS) {
    /**
     * @desc Relative date indicating how many days ago something happened.
     */
    var MSG_DAYS_AGO_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {# days ago}' +
        '=1 {# day ago}' +
        'other {# days ago}}');

    return new goog.i18n.MessageFormat(MSG_DAYS_AGO_ICU).format({'NUM': delta});

  } else if (future && unit == goog.date.relative.Unit.DAYS) {
    /**
     * @desc Relative date indicating in how many days something happens.
     */
    var MSG_IN_DAYS_ICU = goog.getMsg(
        '{NUM, plural, ' +
        '=0 {in # days}' +
        '=1 {in # day}' +
        'other {in # days}}');

    return new goog.i18n.MessageFormat(MSG_IN_DAYS_ICU).format({'NUM': delta});

  } else {
    return '';
  }
};

goog.date.relative.setTimeDeltaFormatter(
    goog.date.relativeWithPlurals.formatTimeDelta_);
