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
 * @fileoverview Functions for detecting user's time zone.
 * This work is based on Charlie Luo and Hong Yan's time zone detection work
 * for CBG.
 */
goog.provide('goog.locale.timeZoneDetection');

goog.require('goog.locale');
goog.require('goog.locale.TimeZoneFingerprint');


/**
 * Array of time instances for checking the time zone offset.
 * @type {Array.<number>}
 * @private
 */
goog.locale.timeZoneDetection.TZ_POKE_POINTS_ = [
  1109635200, 1128902400, 1130657000, 1143333000, 1143806400, 1145000000,
  1146380000, 1152489600, 1159800000, 1159500000, 1162095000, 1162075000,
  1162105500];


/**
 * Calculates time zone fingerprint by poking time zone offsets for 13
 * preselected time points.
 * See {@link goog.locale.timeZoneDetection.TZ_POKE_POINTS_}
 * @param {Date} date Date for calculating the fingerprint.
 * @return {number} Fingerprint of user's time zone setting.
 */
goog.locale.timeZoneDetection.getFingerprint = function(date) {
  var hash = 0;
  var stdOffset;
  var isComplex = false;
  for (var i = 0;
       i < goog.locale.timeZoneDetection.TZ_POKE_POINTS_.length; i++) {
    date.setTime(goog.locale.timeZoneDetection.TZ_POKE_POINTS_[i] * 1000);
    var offset = date.getTimezoneOffset() / 30 + 48;
    if (i == 0) {
      stdOffset = offset;
    } else if (stdOffset != offset) {
      isComplex = true;
    }
    hash = (hash << 2) ^ offset;
  }
  return isComplex ? hash : /** @type {number} */ (stdOffset);
};


/**
 * Detects browser's time zone setting. If user's country is known, a better
 * time zone choice could be guessed.
 * @param {string=} opt_country Two-letter ISO 3166 country code.
 * @param {Date=} opt_date Date for calculating the fingerprint. Defaults to the
 *     current date.
 * @return {string} Time zone ID of best guess.
 */
goog.locale.timeZoneDetection.detectTimeZone = function(opt_country, opt_date) {
  var date = opt_date || new Date();
  var fingerprint = goog.locale.timeZoneDetection.getFingerprint(date);
  var timeZoneList = goog.locale.TimeZoneFingerprint[fingerprint];
  // Timezones in goog.locale.TimeZoneDetection.TimeZoneMap are in the format
  // US-America/Los_Angeles. Country code needs to be stripped before a
  // timezone is returned.
  if (timeZoneList) {
    if (opt_country) {
      for (var i = 0; i < timeZoneList.length; ++i) {
        if (timeZoneList[i].indexOf(opt_country) == 0) {
          return timeZoneList[i].substring(3);
        }
      }
    }
    return timeZoneList[0].substring(3);
  }
  return '';
};


/**
 * Returns an array of time zones that are consistent with user's platform
 * setting. If user's country is given, only the time zone for that country is
 * returned.
 * @param {string=} opt_country 2 letter ISO 3166 country code. Helps in making
 *     a better guess for user's time zone.
 * @param {Date=} opt_date Date for retrieving timezone list. Defaults to the
 *     current date.
 * @return {Array.<string>} Array of time zone IDs.
 */
goog.locale.timeZoneDetection.getTimeZoneList = function(opt_country,
    opt_date) {
  var date = opt_date || new Date();
  var fingerprint = goog.locale.timeZoneDetection.getFingerprint(date);
  var timeZoneList = goog.locale.TimeZoneFingerprint[fingerprint];
  if (!timeZoneList) {
    return [];
  }
  var chosenList = [];
  for (var i = 0; i < timeZoneList.length; i++) {
    if (!opt_country || timeZoneList[i].indexOf(opt_country) == 0) {
      chosenList.push(timeZoneList[i].substring(3));
    }
  }
  return chosenList;
};
