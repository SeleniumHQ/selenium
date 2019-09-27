// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Date interval formatting patterns for all locales.
 *
 * File generated from CLDR ver. 31.0.1
 *
 * To reduce the file size (which may cause issues in some JS
 * developing environments), this file will only contain locales
 * that are frequently used by web applications. This is defined as
 * proto/closure_locales_data.txt and will change (most likely addition)
 * over time.  Rest of the data can be found in another file named
 * "dateintervalpatternsext.js", which will be generated at
 * the same time together with this file.
 */

// clang-format off

goog.module('goog.i18n.dateIntervalPatterns');

var dateIntervalSymbols = goog.require('goog.i18n.dateIntervalSymbols');

/**
 * Collection of date interval patterns.
 * @typedef {{
 *   YEAR_FULL: !dateIntervalSymbols.DateIntervalPatternMap,
 *   YEAR_FULL_WITH_ERA: !dateIntervalSymbols.DateIntervalPatternMap,
 *   YEAR_MONTH_ABBR: !dateIntervalSymbols.DateIntervalPatternMap,
 *   YEAR_MONTH_FULL: !dateIntervalSymbols.DateIntervalPatternMap,
 *   MONTH_DAY_ABBR: !dateIntervalSymbols.DateIntervalPatternMap,
 *   MONTH_DAY_FULL: !dateIntervalSymbols.DateIntervalPatternMap,
 *   MONTH_DAY_SHORT: !dateIntervalSymbols.DateIntervalPatternMap,
 *   MONTH_DAY_MEDIUM: !dateIntervalSymbols.DateIntervalPatternMap,
 *   MONTH_DAY_YEAR_MEDIUM: !dateIntervalSymbols.DateIntervalPatternMap,
 *   WEEKDAY_MONTH_DAY_MEDIUM: !dateIntervalSymbols.DateIntervalPatternMap,
 *   WEEKDAY_MONTH_DAY_YEAR_MEDIUM: !dateIntervalSymbols.DateIntervalPatternMap,
 *   DAY_ABBR: !dateIntervalSymbols.DateIntervalPatternMap
 * }}
 */
var DateIntervalPatterns;

/** @typedef {!DateIntervalPatterns} */
exports.DateIntervalPatterns;

/** @type {!DateIntervalPatterns} */
var defaultPatterns;

/**
 * Returns the default DateIntervalPatterns.
 * @return {!DateIntervalPatterns}
 */
exports.getDateIntervalPatterns = function() {
  return defaultPatterns;
};

/**
 * Sets the default DateIntervalPatterns.
 * @param {!DateIntervalPatterns} patterns
 */
exports.setDateIntervalPatterns = function(patterns) {
  defaultPatterns = patterns;
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_af = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM, y',
    'd': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_am = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM፣ y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'MMM d፣ y – MMM d፣ y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d፣ y – MMMM d፣ y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'M': 'd/M – d/M',
    'd': 'd–d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'MMMM d፣ y – MMMM d፣ y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d፣ y',
    'd': 'MMM d–d፣ y',
    'y': 'MMM d፣ y – MMM d፣ y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E፣ MMM d – E፣ MMM d',
    'd': 'E d – E d፣ MMM',
    'y': 'E፣ MMM d፣ y – E፣ MMM d፣ y',
    '_': 'EEE፣ MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E MMM d – E MMM d፣ y',
    'y': 'E፣ MMM d፣ y – E፣ MMM d፣ y',
    '_': 'EEE፣ MMM d y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ar = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM، y',
    'y': 'MMM، y – MMM، y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM، y',
    'y': 'MMMM، y – MMMM، y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM، y – d MMM، y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'd/‏M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM، y',
    'd': 'd–d MMM، y',
    '_': 'd MMM، y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E، d MMM – E، d MMM',
    'd': 'E، d – E، d MMM',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E، d MMM – E، d MMM، y',
    'd': 'E، d – E، d MMM، y',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM، y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_DZ = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM، y',
    'y': 'MMM، y – MMM، y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM، y',
    'y': 'MMMM، y – MMMM، y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM، y – d MMM، y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'd/‏M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM، y',
    'd': 'd–d MMM، y',
    '_': 'd MMM، y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E، d MMM – E، d MMM',
    'd': 'E، d – E، d MMM',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E، d MMM – E، d MMM، y',
    'd': 'E، d – E، d MMM، y',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM، y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_az = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM y – d MMM',
    'd': 'y MMM d–d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd MMM, E – d MMM, E',
    'y': 'd MMM y, E – d MMM y, E',
    '_': 'd MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'd MMM y, E – d MMM, E',
    'y': 'd MMM y, E – d MMM y, E',
    '_': 'd MMM y, EEE'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_be = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd.M.y – d.M.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_bg = {
  YEAR_FULL: {
    'y': 'y – y \'г\'.',
    '_': 'y \'г\'.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    '_': 'MM.y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y \'г\'.',
    '_': 'MMMM y \'г\'.'
  },
  MONTH_DAY_ABBR: {
    'y': 'd.MM.y \'г\'. – d.MM.y \'г\'.',
    '_': 'd.MM'
  },
  MONTH_DAY_FULL: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y \'г\'. – d MMMM y \'г\'.',
    '_': 'd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd.MM.y \'г\'. – d.MM.y \'г\'.',
    '_': 'd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y \'г\'. – d MMMM y \'г\'.',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'd.MM – d.MM.y \'г\'.',
    '_': 'd.MM.y \'г\'.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d.MM – E, d.MM',
    'y': 'E, d.MM.y \'г\'. – E, d.MM.y \'г\'.',
    '_': 'EEE, d.MM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d.MM – E, d.MM.y \'г\'.',
    'y': 'E, d.MM.y \'г\'. – E, d.MM.y \'г\'.',
    '_': 'EEE, d.MM.y \'г\'.'
  },
  DAY_ABBR: {
    'M': 'd.MM – d.MM',
    'y': 'd.MM.y \'г\'. – d.MM.y \'г\'.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_bn = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_br = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d MMM – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d MMM – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_bs = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL – LLL y.',
    'y': 'LLL y. – LLL y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL – LLLL y.',
    'y': 'LLLL y. – LLLL y.',
    '_': 'LLLL y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMM – d. MMM',
    'd': 'd.–d. MMM',
    'y': 'd. MMM y. – d. MMM y.',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y. – d. MMMM y.',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M–d.M.',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y. – d. MMMM y.',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y.',
    'd': 'd. – d. MMM y.',
    'y': 'd. MMM y. – d. MMM y.',
    '_': 'd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y. – E, d. MMM y.',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y.',
    'd': 'E, d. – E, d. MMM y.',
    'y': 'E, d. MMM y. – E, d. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M–d.M.',
    'd': 'd–d.',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ca = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL–LLL y',
    'y': 'LLL y – LLL y',
    '_': 'LLL \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL–LLLL \'de\' y',
    'y': 'LLLL \'de\' y – LLLL \'de\' y',
    '_': 'LLLL \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd LLL y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_chr = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_cs = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd. M.'
  },
  MONTH_DAY_FULL: {
    'M': 'd. M. – d. M.',
    'd': 'd.–d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd. M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. M. – d. M.',
    'd': 'd.–d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. M. – d. M. y',
    'd': 'd.–d. M. y',
    '_': 'd. M. y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d. M. – E d. M.',
    'y': 'E d. M. y – E d. M. y',
    '_': 'EEE d. M.'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d. M. – E d. M. y',
    'y': 'E d. M. y – E d. M. y',
    '_': 'EEE d. M. y'
  },
  DAY_ABBR: {
    'M': 'd. M. – d. M.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_cy = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM, y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM, y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_da = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMM–d. MMM',
    'd': 'd.–d. MMM',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM–dd/MM',
    'y': 'dd/MM/y–dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM.–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E \'den\' d.–E \'den\' d. MMM',
    'y': 'E \'den\' d. MMM y–E \'den\' d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E \'den\' d.–E \'den\' d. MMM y',
    'y': 'E \'den\' d. MMM y–E \'den\' d. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM–dd/MM',
    'd': 'd.–d.',
    'y': 'dd/MM/y–dd/MM/y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_de = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y',
    'd': 'E, d. – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM. – dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_de_AT = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y',
    'd': 'E, d. – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM. – dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_de_CH = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y',
    'd': 'E, d. – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM. – dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_el = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd MMM – dd MMM',
    'd': 'dd–dd MMM',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd MMM – E, dd MMM',
    'd': 'E, dd – E, dd MMM',
    'y': 'E, dd MMM y – E, dd MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, dd MMM – E, dd MMM y',
    'y': 'E, dd MMM y – E, dd MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d – d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AU = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CA = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d – d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GB = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_IE = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d MMM – E d MMM y',
    'd': 'E d – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_IN = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE d MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SG = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_US = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d – d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_ZA = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'MM/dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, dd MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, dd MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y–d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es_419 = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y–d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d \'de\' MMM – E, d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es_ES = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y–d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es_MX = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd–d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM y',
    'd': 'd–d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d \'de\' MMM – E d \'de\' MMM',
    'y': 'E d \'de\' MMM \'de\' y – E d \'de\' MMM \'de\' y',
    '_': 'EEE d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d \'de\' MMM – E d \'de\' MMM \'de\' y',
    'y': 'E d \'de\' MMM \'de\' y – E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es_US = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y–d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d \'de\' MMM – E, d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_et = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMM – d. MMM',
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d. MMM – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d. MMM – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_eu = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y(\'e\')\'ko\' MMM–MMM',
    'y': 'y(\'e\')\'ko\' MMM – y(\'e\')\'ko\' MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y(\'e\')\'ko\' MMMM–MMMM',
    '_': 'y(\'e\')\'ko\' MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'y(\'e\')\'ko\' MMM d – y(\'e\')\'ko\' MMM d',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y(\'e\')\'ko\' MMMM d – y(\'e\')\'ko\' MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y/M/d – y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y(\'e\')\'ko\' MMMM d – y(\'e\')\'ko\' MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y(\'e\')\'ko\' MMM d – MMM d',
    'd': 'y(\'e\')\'ko\' MMM d–d',
    'y': 'y(\'e\')\'ko\' MMM d – y(\'e\')\'ko\' MMM d',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y(\'e\')\'ko\' MMM d, E – y(\'e\')\'ko\' MMM d, E',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y(\'e\')\'ko\' MMM d, E – MMM d, E',
    'dy': 'y(\'e\')\'ko\' MMM d, E – y(\'e\')\'ko\' MMM d, E',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'y/M/d – y/M/d',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_fa = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL تا MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL تا MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd تا d LLL',
    'y': 'd MMM y تا d MMM y',
    '_': 'd LLL'
  },
  MONTH_DAY_FULL: {
    'M': 'd LLLL تا d LLLL',
    'd': 'd تا d LLLL',
    'y': 'd MMMM y تا d MMMM y',
    '_': 'dd LLLL'
  },
  MONTH_DAY_SHORT: {
    'y': 'y/M/d تا y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd تا d LLLL',
    'y': 'd MMMM y تا d MMMM y',
    '_': 'd LLLL'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd LLL تا d MMM y',
    'd': 'd تا d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d LLL تا E d LLL',
    'y': 'E d MMM y تا E d MMM y',
    '_': 'EEE d LLL'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d LLL تا E d MMM y',
    'y': 'E d MMM y تا E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'M/d تا M/d',
    'y': 'y/M/d تا y/M/d',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_fi = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'd': 'd.–d.M.',
    'y': 'd.M.y–d.M.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. MMMM – E d. MMMM',
    'd': 'E d. – E d. MMMM',
    'y': 'E d. MMMM y – E d. MMMM y',
    '_': 'ccc d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d. MMMM – E d. MMMM y',
    'd': 'E d. – E d. MMMM y',
    'y': 'E d. MMMM y – E d. MMMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'd.M.–d.M.',
    'd': 'd.–d.',
    'y': 'd.M.y–d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_fil = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_fr = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d MMM – E d MMM y',
    'd': 'E d – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CA = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d MMM – E d MMM y',
    'd': 'E d – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ga = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d MMM – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d MMM – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_gl = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'LLL \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'LLLL \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd \'de\' MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMM y – d MMM y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d \'de\' MMMM – E, d \'de\' MMMM',
    'y': 'E, d \'de\' MMMM \'de\' y – E, d \'de\' MMMM \'de\' y',
    '_': 'ccc, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d \'de\' MMMM – E, d \'de\' MMMM \'de\' y',
    'd': 'E, d MMM – E, d MMM y',
    'y': 'E, d \'de\' MMMM \'de\' y – E, d \'de\' MMMM \'de\' y',
    '_': 'ccc, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_gsw = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MM – MM.y',
    'y': 'MM.y – MM.y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y',
    'd': 'E, d. – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM. – dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_gu = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_haw = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_he = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd בMMM–d בMMM',
    'd': 'd–d בMMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd בMMMM–d בMMMM',
    'd': 'd–d בMMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd בMMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M–d.M',
    'y': 'd.M.y – d.M.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd בMMMM–d בMMMM',
    'd': 'd–d בMMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'EEEE, d בMMM – EEEE, d בMMM',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'EEE, d בMMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'EEEE d MMM – EEEE d MMM y',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'EEE, d בMMM y'
  },
  DAY_ABBR: {
    'M': 'd.M–d.M',
    'd': 'd–d',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_hi = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd MMM–d',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd MMMM–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd MMMM–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_hr = {
  YEAR_FULL: {
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL – LLL y.',
    '_': 'LLL y.'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL – LLLL y.',
    '_': 'LLLL y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd. – dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'd': 'dd. – dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd. MM. y. – dd. MM. y.',
    '_': 'dd. MM.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd. – dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd. – dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'dd. MM. – dd. MM.',
    'd': 'dd. – dd.',
    'y': 'dd. MM. y. – dd. MM. y.',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_hu = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y.'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y. MMM–MMM',
    '_': 'y. MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y. MMMM–MMMM',
    '_': 'y. MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d.',
    'y': 'y. MMM d. – y. MMM d.',
    '_': 'MMM d.'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d. – MMMM d.',
    'd': 'MMMM d–d.',
    'y': 'y. MMMM d. – y. MMMM d.',
    '_': 'MMMM dd.'
  },
  MONTH_DAY_SHORT: {
    'd': 'M. d–d.',
    'y': 'y. MM. dd. – y. MM. dd.',
    '_': 'M. d.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d.',
    'y': 'y. MMMM d. – y. MMMM d.',
    '_': 'MMMM d.'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y. MMM d. – MMM d.',
    'd': 'y. MMM d–d.',
    '_': 'y. MMM d.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'MMM d., E – MMM d., E',
    'd': 'MMM d., E – d., E',
    'y': 'y. MMM d., E – y. MMM d., E',
    '_': 'MMM d., EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y. MMM d., E – MMM d., E',
    'd': 'y. MMM d., E – d., E',
    'y': 'y. MMM d., E – y. MMM d., E',
    '_': 'y. MMM d., EEE'
  },
  DAY_ABBR: {
    'M': 'M. d. – M. d.',
    'd': 'd–d.',
    'y': 'y. MM. dd. – y. MM. dd.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_hy = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y թ.'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y թ. MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'y թ. LLL'
  },
  YEAR_MONTH_FULL: {
    'M': 'yթ. MMM – MMM',
    'y': 'MMM yթ․ – MMM yթ.',
    '_': 'yթ․ MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM dd – MMM dd',
    'd': 'MMM dd–dd',
    'y': 'dd MMM, y թ․ – dd MMM, y թ.',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'd': 'MMMM dd–dd',
    'y': 'dd MMMM, y թ․ – dd MMMM, y թ.',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM dd – MMMM dd',
    'd': 'MMMM dd–dd',
    'y': 'dd MMMM, y թ․ – dd MMMM, y թ.',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd MMM – dd MMM, y թ.',
    'd': 'dd–dd MMM, y թ.',
    'y': 'dd MMM, y թ․ – dd MMM, y թ.',
    '_': 'd MMM, y թ.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM dd – E, MMM dd',
    'y': 'E, d MMM, y – E, d MMM, y թ.',
    '_': 'd MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM, y թ.',
    'y': 'E, d MMM, y – E, d MMM, y թ.',
    '_': 'y թ. MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_id = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_in = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_is = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M.–d.M.',
    'y': 'd.M.y – d.M.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM',
    'd': 'E, d. – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d. MMM – E, d. MMM y',
    'd': 'E, d. – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'd.M.–d.M.',
    'd': 'd.–d.',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_it = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd MMM – dd MMM',
    'd': 'dd–dd MMM',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E dd MMM – E dd MMM',
    'd': 'E dd – E dd MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d MMM – E d MMM y',
    'd': 'E d – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_iw = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd בMMM–d בMMM',
    'd': 'd–d בMMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd בMMMM–d בMMMM',
    'd': 'd–d בMMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd בMMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M–d.M',
    'y': 'd.M.y – d.M.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd בMMMM–d בMMMM',
    'd': 'd–d בMMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'EEEE, d בMMM – EEEE, d בMMM',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'EEE, d בMMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'EEEE d MMM – EEEE d MMM y',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'EEE, d בMMM y'
  },
  DAY_ABBR: {
    'M': 'd.M–d.M',
    'd': 'd–d',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ja = {
  YEAR_FULL: {
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y年M月～M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'M': 'y年M月～M月',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'd': 'M月d日～d日',
    'y': 'y年M月d日～y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'M': 'M月d日～M月d日',
    'd': 'M月d日～d日',
    'y': 'y年M月d日～y年M月d日',
    '_': 'M月dd日'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM/dd～MM/dd',
    'y': 'y/MM/dd～y/MM/dd',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'M月d日～d日',
    'y': 'y年M月d日～y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日～M月d日',
    'd': 'y年M月d日～d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M月d日(E)～M月d日(E)',
    'd': 'M月d日(E)～d日(E)',
    'y': 'y年M月d日(E)～y年M月d日(E)',
    '_': 'M月d日(EEE)'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日(E)～M月d日(E)',
    'd': 'y年M月d日(E)～d日(E)',
    'y': 'y年M月d日(E)～y年M月d日(E)',
    '_': 'y年M月d日(EEE)'
  },
  DAY_ABBR: {
    'M': 'MM/dd～MM/dd',
    'y': 'y/MM/dd～y/MM/dd',
    '_': 'd日'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ka = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM. y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM, y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM, y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'dd MMM. y – d MMM. y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'dd MMMM. y – d MMMM. y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'dd MMMM. y – d MMMM. y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd MMM. – dd MMM. y',
    'd': 'd–d MMM, y',
    'y': 'dd MMM. y – d MMM. y',
    '_': 'd MMM. y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM. y – E, d MMM. y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM. – E, d MMM. y',
    'y': 'E, d MMM. y – E, d MMM. y',
    '_': 'EEE, d MMM. y'
  },
  DAY_ABBR: {
    'M': 'dd.MM. – dd.MM.',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_kk = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y \'ж\'.'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y \'ж\'. MMM–MMM',
    'y': 'y \'ж\'. MMM – y \'ж\'. MMM',
    '_': 'y \'ж\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y \'ж\'. MMMM – MMMM',
    'y': 'y \'ж\'. MMMM – y \'ж\'. MMMM',
    '_': 'y \'ж\'. MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'y \'ж\'. d MMM – y \'ж\'. d MMM',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'y \'ж\'. d MMMM – y \'ж\'. d MMMM',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM – dd.MM',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'y \'ж\'. d MMMM – y \'ж\'. d MMMM',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y \'ж\'. d MMM – d MMM',
    'd': 'y \'ж\'. d–d MMM',
    'y': 'y \'ж\'. d MMM – y \'ж\'. d MMM',
    '_': 'y \'ж\'. d MMM'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd MMM, E – d MMM, E',
    'y': 'y \'ж\'. d MMM, E – y \'ж\'. d MMM, E',
    '_': 'd MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y \'ж\'. d MMM, E – d MMM, E',
    'dy': 'y \'ж\'. d MMM, E – y \'ж\'. d MMM, E',
    '_': 'y \'ж\'. d MMM, EEE'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_km = {
  YEAR_FULL: {
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y នៃ G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM​ y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d MMM – E d MMM',
    'y': 'E dd-MM-y – E dd MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E dd MMM y – E dd MMM y',
    'y': 'E dd-MM-y – E dd MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd – d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_kn = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'MMM d – d',
    'y': 'd, MMM, y – d, MMM, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'MMMM d – d',
    'y': 'd, MMMM, y – d, MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'd, MMMM, y – d, MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'MMM d–d,y',
    'y': 'd, MMM, y – d, MMM, y',
    '_': 'MMM d,y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'd MMM, y E – d MMM, y E',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, MMM d – E, MMMM d, y',
    'd': 'E, MMM d – E, MMM d,y',
    'y': 'd MMM, y E – d MMM, y E',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ko = {
  YEAR_FULL: {
    '_': 'y년'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y년'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y년 M월~M월',
    'y': 'y년 M월 ~ y년 M월',
    '_': 'y년 MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y년 MMMM ~ MMMM',
    '_': 'y년 MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'M월 d일 ~ M월 d일',
    'd': 'MMM d일~d일',
    'y': 'y년 M월 d일 ~ y년 M월 d일',
    '_': 'MMM d일'
  },
  MONTH_DAY_FULL: {
    'M': 'M월 d일 ~ M월 d일',
    'd': 'MMMM d일~d일',
    'y': 'y년 M월 d일 ~ y년 M월 d일',
    '_': 'MMMM dd일'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M. d ~ M. d',
    'y': 'y. M. d. ~ y. M. d.',
    '_': 'M. d.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'M월 d일 ~ M월 d일',
    'd': 'MMMM d일~d일',
    'y': 'y년 M월 d일 ~ y년 M월 d일',
    '_': 'MMMM d일'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y년 M월 d일 ~ M월 d일',
    'd': 'y년 M월 d일~d일',
    'y': 'y년 M월 d일 ~ y년 M월 d일',
    '_': 'y년 MMM d일'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M월 d일 (E) ~ M월 d일 (E)',
    'd': 'M월 d일 (E) ~ d일 (E)',
    'y': 'y년 M월 d일 (E) ~ y년 M월 d일 (E)',
    '_': 'MMM d일 (EEE)'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y년 M월 d일 (E) ~ M월 d일 (E)',
    'd': 'y년 M월 d일 (E) ~ d일 (E)',
    'y': 'y년 M월 d일 (E) ~ y년 M월 d일 (E)',
    '_': 'y년 MMM d일 (EEE)'
  },
  DAY_ABBR: {
    'M': 'M. d ~ M. d',
    'd': 'd일~d일',
    'y': 'y. M. d. ~ y. M. d.',
    '_': 'd일'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ky = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y-\'ж\'.'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y-\'ж\'.',
    'y': 'MMM y-\'ж\'. - MMM y-\'ж\'.',
    '_': 'y-\'ж\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM, y-\'ж\'.',
    'y': 'MMMM, y-\'ж\'. – MMMM, y-\'ж\'.',
    '_': 'y-\'ж\'., MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'd-MMM – d-MMM',
    'd': 'd–d-MMM',
    'y': 'd-MMM y-\'ж\'. - d-MMM y-\'ж\'.',
    '_': 'd-MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd-MMMM – d-MMMM',
    'd': 'd–d-MMMM',
    'y': 'd-MMMM y-\'ж\'. - d-MMMM y-\'ж\'.',
    '_': 'dd-MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM – dd.MM',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd-MMMM – d-MMMM',
    'd': 'd–d-MMMM',
    'y': 'd-MMMM y-\'ж\'. - d-MMMM y-\'ж\'.',
    '_': 'd-MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd-MMM – d-MMM y-\'ж\'.',
    'd': 'd–d-MMM y-\'ж\'.',
    'y': 'd-MMM y-\'ж\'. - d-MMM y-\'ж\'.',
    '_': 'y-\'ж\'. d-MMM'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd-MMM, E – d-MMM, E',
    'y': 'y-\'ж\'., d-MMM, E – y-\'ж\'., d-MMM, E',
    '_': 'd-MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y-\'ж\'., d-MMM, E – d-MMM E',
    'd': 'y-\'ж\'., d-MMM, E – d-MMM, E',
    'y': 'y-\'ж\'., d-MMM, E – y-\'ж\'., d-MMM, E',
    '_': 'y-\'ж\'. d-MMM, EEE'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ln = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_lo = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'My': 'MM/y – MM/y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MM/y – MM',
    'y': 'MM/y – MM/y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'Md': 'd/MM – d/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'Md': 'd/MM – d/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'Md': 'd/MM – d/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd/MM/y – d/MM',
    'd': 'd/MM/y – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d/MM – E, d/MM',
    'y': 'E, dd/MM/y – E, dd/MM/y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Mdy': 'E, dd/MM/y – E, dd/MM/y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_lt = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y \'m\'. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'y-MM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y LLLL–LLLL',
    'y': 'y LLLL – y LLLL',
    '_': 'y \'m\'. LLLL'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MM-dd'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd \'d\'.'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d \'d\'.'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y-MM-dd'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MM-dd, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'y-MM-dd, EEE'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'dd–dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'dd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_lv = {
  YEAR_FULL: {
    'y': 'y.–y.',
    '_': 'y. \'g\'.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y. \'g\'.'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y. \'gada\' MMM–MMM',
    'y': 'y. \'gada\' MMM – y. \'gada\' MMM',
    '_': 'y. \'g\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y. \'gada\' MMMM – MMMM',
    'y': 'y. \'gada\' MMMM – y. \'gada\' MMMM',
    '_': 'y. \'g\'. MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMM – d. MMM',
    'd': 'd.–d. MMM',
    'y': 'y. \'gada\' d. MMM – y. \'gada\' d. MMM',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'y. \'gada\' d. MMMM – y. \'gada\' d. MMMM',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'M': 'dd.MM–dd.MM',
    'd': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y.–dd.MM.y.',
    '_': 'dd.MM.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'y. \'gada\' d. MMMM – y. \'gada\' d. MMMM',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y. \'gada\' d. MMM – d. MMM',
    'd': 'y. \'gada\' d.–d. MMM',
    'y': 'y. \'gada\' d. MMM – y. \'gada\' d. MMM',
    '_': 'y. \'g\'. d. MMM'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d. MMM – E, d. MMM',
    'y': 'E, y. \'gada\' d. MMM – E, y. \'gada\' d. MMM',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, y. \'gada\' d. MMM – E, y. \'gada\' d. MMM',
    'y': 'E, y. \'gada\' d. MMM – E, y. \'gada\' d. MMM',
    '_': 'EEE, y. \'g\'. d. MMM'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'd': 'd.–d.',
    'y': 'dd.MM.y.–dd.MM.y.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mk = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y \'г\'.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd MMM – dd MMM',
    'd': 'dd–dd MMM',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.M – dd.M',
    'y': 'dd.M.y – dd.M.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y \'г\'.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd MMM – E, dd MMM',
    'd': 'E, dd – E, dd MMM',
    'y': 'E, dd MMM y – E, dd MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd MMM – E, dd MMM y',
    'd': 'E, dd – E, dd MMM y',
    'y': 'E, dd MMM y – E, dd MMM y',
    '_': 'EEE, d MMM y \'г\'.'
  },
  DAY_ABBR: {
    'M': 'dd.M – dd.M',
    'd': 'd–d',
    'y': 'dd.M.y – dd.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ml = {
  YEAR_FULL: {
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d – d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    'y': 'y MMM d – y MMM d',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd – d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mn = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y/MM–MM',
    'y': 'y/MM – y/MM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y \'оны\' MM–MM-\'р\' \'сар\'',
    'y': 'y/MM –y/MM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MM/d – MM/d',
    'd': 'MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MM/d – MM/d',
    'd': 'MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM/dd–MM/dd',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MM/d – MM/d',
    'd': 'MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y/MM/dd – MM/dd',
    'd': 'y/MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MM/dd – E, MM/dd',
    'y': 'E, y/MM/dd – E, y/MM/dd',
    '_': 'EEE MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Mdy': 'E, y/MM/dd – E, y/MM/dd',
    '_': 'EEE, y MMM d'
  },
  DAY_ABBR: {
    'M': 'MM/dd–MM/dd',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mo = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mr = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM, y',
    'd': 'E, d MMM y – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d, MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ms = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd-M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mt = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'ta\'’ MMM – d \'ta\'’ MMM',
    'd': 'd – d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'ta\'’ MMMM – d \'ta\'’ MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd \'ta\'’ MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd \'ta\'’ MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'd – d MMM y',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd \'ta\'’ MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d \'ta\'’ MMM – E, d \'ta\'’ MMM',
    'd': 'E, d – E d MMM',
    'y': 'E, d \'ta\'’ MMM y – E, d \'ta\'’ MMM y',
    '_': 'EEE, d \'ta\'’ MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d \'ta\'’ MMM – E, d \'ta\'’ MMM y',
    'd': 'E, d MMM – E, d MMM, y',
    'y': 'E, d \'ta\'’ MMM y – E, d \'ta\'’ MMM y',
    '_': 'EEE, d \'ta\'’ MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_my = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM – MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d – d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'My': 'y MMM d – y MMM d',
    'd': 'y MMM d – d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d Eနေ့ – MMM d Eနေ့',
    'y': 'y MMM d EEEEနေ့ – y MMM d EEEEနေ့',
    '_': 'MMM d ရက် EEEနေ့'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d EEEEနေ့ – MMM d EEEEနေ့',
    'y': 'y MMM d EEEEနေ့ – y MMM d EEEEနေ့',
    '_': 'd MMM y EEEနေ့'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_nb = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. MMM–E d. MMM',
    'd': 'E d.–E d. MMM',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d. MMM–E d. MMM y',
    'd': 'E d.–E d. MMM y',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ne = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_nl = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd-MM – dd-MM',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd-M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d MMM – E d MMM y',
    'd': 'E d – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd-MM – dd-MM',
    'd': 'd–d',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_no = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. MMM–E d. MMM',
    'd': 'E d.–E d. MMM',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d. MMM–E d. MMM y',
    'd': 'E d.–E d. MMM y',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_no_NO = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. MMM–E d. MMM',
    'd': 'E d.–E d. MMM',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d. MMM–E d. MMM y',
    'd': 'E d.–E d. MMM y',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM.–dd.MM.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_or = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd-M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pa = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pl = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pt = {
  YEAR_FULL: {
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd – d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd – d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM',
    'd': 'E, d – E, d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'd': 'E, d – E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd – d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_BR = {
  YEAR_FULL: {
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd – d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd – d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM',
    'd': 'E, d – E, d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'd': 'E, d – E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd – d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_PT = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MM/y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM – d \'de\' MMM',
    'd': 'd–d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd/MM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd–d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd/MM/y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'ccc, dd/MM – ccc, dd/MM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d/MM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'd': 'E, dd/MM – E, dd/MM/y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d/MM/y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ro = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ru = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL – LLL y \'г\'.',
    '_': 'LLL y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL – LLLL y \'г\'.',
    '_': 'LLLL y \'г\'.'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y \'г\'. – d MMM y \'г\'.',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y \'г\'. – d MMMM y \'г\'.',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y \'г\'. – d MMMM y \'г\'.',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y \'г\'.',
    'd': 'd–d MMM y \'г\'.',
    '_': 'd MMM y \'г\'.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'ccc, d MMM y \'г\'. – ccc, d MMM y \'г\'.',
    '_': 'ccc, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'ccc, d MMM – ccc, d MMM y \'г\'.',
    'd': 'ccc, d – ccc, d MMM y \'г\'.',
    'y': 'ccc, d MMM y \'г\'. – ccc, d MMM y \'г\'.',
    '_': 'EEE, d MMM y \'г\'.'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sh = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y.',
    'y': 'MMMM y – MMMM y.',
    '_': 'MMMM y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd.–dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd.–dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_si = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'M': 'y MMMM – MMMM',
    '_': 'y MMMM'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y-M-d – y-M-d',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'MMM-dd, E – MMM-dd, E',
    'd': 'MMM-d, E – MMM-d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MMM d EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Mdy': 'y MMM d, E – y MMM d, E',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'M-d – M-d',
    'd': 'd–d',
    'y': 'y-M-d – y-M-d',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sk = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'M – M/y',
    '_': 'M/y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL – LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd. – d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd. M.'
  },
  MONTH_DAY_FULL: {
    'M': 'd. M. – d. M.',
    'd': 'd. – d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'd': 'd. M. – d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd. M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. M. – d. M.',
    'd': 'd. – d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. M. – d. M. y',
    'd': 'd. – d. M. y',
    '_': 'd. M. y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. M. – E d. M.',
    'd': 'E d. – E d. M.',
    'y': 'E d. M. y – E d. M. y',
    '_': 'EEE d. M.'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E d. M. – E d. M. y',
    'd': 'E d. – E d. M. y',
    'y': 'E d. M. y – E d. M. y',
    '_': 'EEE d. M. y'
  },
  DAY_ABBR: {
    'M': 'd. M. – d. M.',
    'y': 'd. M. y – d. M. y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sl = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd.–d. MMM',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'd': 'd.–d. M.',
    'y': 'd. M. y–d. M. y',
    '_': 'd. M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d. MMM–E, d. MMM',
    'd': 'E, d.–E, d. MMM',
    'y': 'E, d. MMM y–E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d. MMM–E, d. MMM y',
    'y': 'E, d. MMM y–E, d. MMM y',
    '_': 'EEE, d. MMM y'
  },
  DAY_ABBR: {
    'M': 'd. M.–d. M.',
    'y': 'd. M. y–d. M. y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sq = {
  YEAR_FULL: {
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y – d.M.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd – d',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sr = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y.',
    'y': 'MMMM y – MMMM y.',
    '_': 'MMMM y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd.–dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd.–dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Latn = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y.',
    'y': 'MMMM y – MMMM y.',
    '_': 'MMMM y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd.–dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd.–dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sv = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y–d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y–d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'M': 'd/M–d/M',
    'd': 'd–d/M',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y–d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM–d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E dd MMM y–E dd MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E dd MMM–E dd MMM y',
    'y': 'E dd MMM y–E dd MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sw = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'MMM d y – MMM d y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d y – MMMM d y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d y – MMMM d y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'MMM d – d, y',
    'y': 'MMM d y – MMM d y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'E, MMM d y – E, MMM d y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, MMM d– E, MMM d y',
    'd': 'E, MMM d – E, MMM d y',
    'y': 'E, MMM d y – E, MMM d y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ta = {
  YEAR_FULL: {
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd – d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_te = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd, MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d, MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_th = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM G y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'MMMM d–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E d MMM – E d MMM y',
    'y': 'E d MMM y – E d MMM y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_tl = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_tr = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd MMM E – d MMM E',
    'y': 'd MMM y E – d MMM y E',
    '_': 'd MMMM EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Mdy': 'd MMM y E – d MMM y E',
    '_': 'd MMM y EEE'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_uk = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'M': 'LLLL – LLLL y',
    '_': 'LLLL y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ur = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM، y – d MMM، y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM، y',
    'd': 'y MMM d–d',
    '_': 'd MMM، y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E، d MMM – E، d MMM',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E، d MMM – E، d MMM، y',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM، y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'd': 'd–d',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_uz = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM, y',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM, y',
    '_': 'MMMM, y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d-MMM',
    'y': 'd-MMM, y – d-MMM, y',
    '_': 'd-MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd-MMMM – d-MMMM',
    'd': 'd – d-MMMM',
    'y': 'd-MMMM, y – d-MMMM, y',
    '_': 'dd-MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d-MMMM',
    'y': 'd-MMMM, y – d-MMMM, y',
    '_': 'd-MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd-MMM – d-MMM, y',
    'd': 'd – d-MMM, y',
    '_': 'd-MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d-MMM – E, d-MMM',
    'y': 'E, d-MMM, y – E, d-MMM, y',
    '_': 'EEE, d-MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, d-MMM – E, d-MMM, y',
    'y': 'E, d-MMM, y – E, d-MMM, y',
    '_': 'EEE, d-MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_vi = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'M': '\'Tháng\' M - \'Tháng\' M \'năm\' y',
    'y': '\'Tháng\' M \'năm\' y - \'Tháng\' M \'năm\' y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM–MMMM \'năm\' y',
    'y': 'MMMM, y – MMMM, y',
    '_': 'MMMM \'năm\' y'
  },
  MONTH_DAY_ABBR: {
    'M': '\'Ngày\' dd \'tháng\' M - \'Ngày\' dd \'tháng\' M',
    'd': '\'Ngày\' dd - \'Ngày\' dd \'tháng\' M',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': '\'Ngày\' dd \'tháng\' M - \'Ngày\' dd \'tháng\' M',
    'd': '\'Ngày\' dd - \'Ngày\' dd \'tháng\' M',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': '\'Ngày\' dd \'tháng\' M - \'Ngày\' dd \'tháng\' M',
    'd': '\'Ngày\' dd - \'Ngày\' dd \'tháng\' M',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMM, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, dd \'tháng\' M, y – E, dd \'tháng\' M, y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'E, dd \'tháng\' M – E, dd \'tháng\' M, y',
    'd': 'EEEE, \'ngày\' dd MMM – EEEE, \'ngày\' dd MMM \'năm\' y',
    'y': 'E, dd \'tháng\' M, y – E, dd \'tháng\' M, y',
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': '\'Ngày\' dd–dd',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zh = {
  YEAR_FULL: {
    'y': 'y–y年',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月dd日'
  },
  MONTH_DAY_SHORT: {
    'y': 'y/M/d – y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M月d日E至M月d日E',
    'd': 'M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'M月d日EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日E至M月d日E',
    'd': 'y年M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'y年M月d日EEE'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d日',
    'y': 'y/M/d – y/M/d',
    '_': 'd日'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_CN = {
  YEAR_FULL: {
    'y': 'y–y年',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月dd日'
  },
  MONTH_DAY_SHORT: {
    'y': 'y/M/d – y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M月d日E至M月d日E',
    'd': 'M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'M月d日EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日E至M月d日E',
    'd': 'y年M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'y年M月d日EEE'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d日',
    'y': 'y/M/d – y/M/d',
    '_': 'd日'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_HK = {
  YEAR_FULL: {
    'y': 'y至y',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月dd日'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M 至 d/M',
    'y': 'd/M/y 至 d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M月d日E至M月d日E',
    'd': 'M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'M月d日EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y年M月d日E至M月d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'y年M月d日EEE'
  },
  DAY_ABBR: {
    'M': 'd/M 至 d/M',
    'd': 'd日至d日',
    'y': 'd/M/y 至 d/M/y',
    '_': 'd日'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_TW = {
  YEAR_FULL: {
    'y': 'y至y',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月dd日'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d至M/d',
    'y': 'y/M/d至y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'M月d日至M月d日',
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'M月d日E至M月d日E',
    'd': 'M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'M月d日 EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'y年M月d日E至M月d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'y年M月d日 EEE'
  },
  DAY_ABBR: {
    'M': 'M/d至M/d',
    'd': 'd日至d日',
    'y': 'y/M/d至y/M/d',
    '_': 'd日'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zu = {
  YEAR_FULL: {
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d – d',
    'y': 'MMM d, y – MMM d, y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'Md': 'E, MMM d – E, MMM d, y',
    'y': 'E, MMM d, y – E, MMM d, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

if (goog.LOCALE == 'af') {
  defaultPatterns = exports.DateIntervalPatterns_af;
} else if (goog.LOCALE == 'am') {
  defaultPatterns = exports.DateIntervalPatterns_am;
} else if (goog.LOCALE == 'ar') {
  defaultPatterns = exports.DateIntervalPatterns_ar;
} else if (goog.LOCALE == 'ar_DZ' || goog.LOCALE == 'ar-DZ') {
  defaultPatterns = exports.DateIntervalPatterns_ar_DZ;
} else if (goog.LOCALE == 'az') {
  defaultPatterns = exports.DateIntervalPatterns_az;
} else if (goog.LOCALE == 'be') {
  defaultPatterns = exports.DateIntervalPatterns_be;
} else if (goog.LOCALE == 'bg') {
  defaultPatterns = exports.DateIntervalPatterns_bg;
} else if (goog.LOCALE == 'bn') {
  defaultPatterns = exports.DateIntervalPatterns_bn;
} else if (goog.LOCALE == 'br') {
  defaultPatterns = exports.DateIntervalPatterns_br;
} else if (goog.LOCALE == 'bs') {
  defaultPatterns = exports.DateIntervalPatterns_bs;
} else if (goog.LOCALE == 'ca') {
  defaultPatterns = exports.DateIntervalPatterns_ca;
} else if (goog.LOCALE == 'chr') {
  defaultPatterns = exports.DateIntervalPatterns_chr;
} else if (goog.LOCALE == 'cs') {
  defaultPatterns = exports.DateIntervalPatterns_cs;
} else if (goog.LOCALE == 'cy') {
  defaultPatterns = exports.DateIntervalPatterns_cy;
} else if (goog.LOCALE == 'da') {
  defaultPatterns = exports.DateIntervalPatterns_da;
} else if (goog.LOCALE == 'de') {
  defaultPatterns = exports.DateIntervalPatterns_de;
} else if (goog.LOCALE == 'de_AT' || goog.LOCALE == 'de-AT') {
  defaultPatterns = exports.DateIntervalPatterns_de_AT;
} else if (goog.LOCALE == 'de_CH' || goog.LOCALE == 'de-CH') {
  defaultPatterns = exports.DateIntervalPatterns_de_CH;
} else if (goog.LOCALE == 'el') {
  defaultPatterns = exports.DateIntervalPatterns_el;
} else if (goog.LOCALE == 'en') {
  defaultPatterns = exports.DateIntervalPatterns_en;
} else if (goog.LOCALE == 'en_AU' || goog.LOCALE == 'en-AU') {
  defaultPatterns = exports.DateIntervalPatterns_en_AU;
} else if (goog.LOCALE == 'en_CA' || goog.LOCALE == 'en-CA') {
  defaultPatterns = exports.DateIntervalPatterns_en_CA;
} else if (goog.LOCALE == 'en_GB' || goog.LOCALE == 'en-GB') {
  defaultPatterns = exports.DateIntervalPatterns_en_GB;
} else if (goog.LOCALE == 'en_IE' || goog.LOCALE == 'en-IE') {
  defaultPatterns = exports.DateIntervalPatterns_en_IE;
} else if (goog.LOCALE == 'en_IN' || goog.LOCALE == 'en-IN') {
  defaultPatterns = exports.DateIntervalPatterns_en_IN;
} else if (goog.LOCALE == 'en_SG' || goog.LOCALE == 'en-SG') {
  defaultPatterns = exports.DateIntervalPatterns_en_SG;
} else if (goog.LOCALE == 'en_US' || goog.LOCALE == 'en-US') {
  defaultPatterns = exports.DateIntervalPatterns_en_US;
} else if (goog.LOCALE == 'en_ZA' || goog.LOCALE == 'en-ZA') {
  defaultPatterns = exports.DateIntervalPatterns_en_ZA;
} else if (goog.LOCALE == 'es') {
  defaultPatterns = exports.DateIntervalPatterns_es;
} else if (goog.LOCALE == 'es_419' || goog.LOCALE == 'es-419') {
  defaultPatterns = exports.DateIntervalPatterns_es_419;
} else if (goog.LOCALE == 'es_ES' || goog.LOCALE == 'es-ES') {
  defaultPatterns = exports.DateIntervalPatterns_es_ES;
} else if (goog.LOCALE == 'es_MX' || goog.LOCALE == 'es-MX') {
  defaultPatterns = exports.DateIntervalPatterns_es_MX;
} else if (goog.LOCALE == 'es_US' || goog.LOCALE == 'es-US') {
  defaultPatterns = exports.DateIntervalPatterns_es_US;
} else if (goog.LOCALE == 'et') {
  defaultPatterns = exports.DateIntervalPatterns_et;
} else if (goog.LOCALE == 'eu') {
  defaultPatterns = exports.DateIntervalPatterns_eu;
} else if (goog.LOCALE == 'fa') {
  defaultPatterns = exports.DateIntervalPatterns_fa;
} else if (goog.LOCALE == 'fi') {
  defaultPatterns = exports.DateIntervalPatterns_fi;
} else if (goog.LOCALE == 'fil') {
  defaultPatterns = exports.DateIntervalPatterns_fil;
} else if (goog.LOCALE == 'fr') {
  defaultPatterns = exports.DateIntervalPatterns_fr;
} else if (goog.LOCALE == 'fr_CA' || goog.LOCALE == 'fr-CA') {
  defaultPatterns = exports.DateIntervalPatterns_fr_CA;
} else if (goog.LOCALE == 'ga') {
  defaultPatterns = exports.DateIntervalPatterns_ga;
} else if (goog.LOCALE == 'gl') {
  defaultPatterns = exports.DateIntervalPatterns_gl;
} else if (goog.LOCALE == 'gsw') {
  defaultPatterns = exports.DateIntervalPatterns_gsw;
} else if (goog.LOCALE == 'gu') {
  defaultPatterns = exports.DateIntervalPatterns_gu;
} else if (goog.LOCALE == 'haw') {
  defaultPatterns = exports.DateIntervalPatterns_haw;
} else if (goog.LOCALE == 'he') {
  defaultPatterns = exports.DateIntervalPatterns_he;
} else if (goog.LOCALE == 'hi') {
  defaultPatterns = exports.DateIntervalPatterns_hi;
} else if (goog.LOCALE == 'hr') {
  defaultPatterns = exports.DateIntervalPatterns_hr;
} else if (goog.LOCALE == 'hu') {
  defaultPatterns = exports.DateIntervalPatterns_hu;
} else if (goog.LOCALE == 'hy') {
  defaultPatterns = exports.DateIntervalPatterns_hy;
} else if (goog.LOCALE == 'id') {
  defaultPatterns = exports.DateIntervalPatterns_id;
} else if (goog.LOCALE == 'in') {
  defaultPatterns = exports.DateIntervalPatterns_in;
} else if (goog.LOCALE == 'is') {
  defaultPatterns = exports.DateIntervalPatterns_is;
} else if (goog.LOCALE == 'it') {
  defaultPatterns = exports.DateIntervalPatterns_it;
} else if (goog.LOCALE == 'iw') {
  defaultPatterns = exports.DateIntervalPatterns_iw;
} else if (goog.LOCALE == 'ja') {
  defaultPatterns = exports.DateIntervalPatterns_ja;
} else if (goog.LOCALE == 'ka') {
  defaultPatterns = exports.DateIntervalPatterns_ka;
} else if (goog.LOCALE == 'kk') {
  defaultPatterns = exports.DateIntervalPatterns_kk;
} else if (goog.LOCALE == 'km') {
  defaultPatterns = exports.DateIntervalPatterns_km;
} else if (goog.LOCALE == 'kn') {
  defaultPatterns = exports.DateIntervalPatterns_kn;
} else if (goog.LOCALE == 'ko') {
  defaultPatterns = exports.DateIntervalPatterns_ko;
} else if (goog.LOCALE == 'ky') {
  defaultPatterns = exports.DateIntervalPatterns_ky;
} else if (goog.LOCALE == 'ln') {
  defaultPatterns = exports.DateIntervalPatterns_ln;
} else if (goog.LOCALE == 'lo') {
  defaultPatterns = exports.DateIntervalPatterns_lo;
} else if (goog.LOCALE == 'lt') {
  defaultPatterns = exports.DateIntervalPatterns_lt;
} else if (goog.LOCALE == 'lv') {
  defaultPatterns = exports.DateIntervalPatterns_lv;
} else if (goog.LOCALE == 'mk') {
  defaultPatterns = exports.DateIntervalPatterns_mk;
} else if (goog.LOCALE == 'ml') {
  defaultPatterns = exports.DateIntervalPatterns_ml;
} else if (goog.LOCALE == 'mn') {
  defaultPatterns = exports.DateIntervalPatterns_mn;
} else if (goog.LOCALE == 'mo') {
  defaultPatterns = exports.DateIntervalPatterns_mo;
} else if (goog.LOCALE == 'mr') {
  defaultPatterns = exports.DateIntervalPatterns_mr;
} else if (goog.LOCALE == 'ms') {
  defaultPatterns = exports.DateIntervalPatterns_ms;
} else if (goog.LOCALE == 'mt') {
  defaultPatterns = exports.DateIntervalPatterns_mt;
} else if (goog.LOCALE == 'my') {
  defaultPatterns = exports.DateIntervalPatterns_my;
} else if (goog.LOCALE == 'nb') {
  defaultPatterns = exports.DateIntervalPatterns_nb;
} else if (goog.LOCALE == 'ne') {
  defaultPatterns = exports.DateIntervalPatterns_ne;
} else if (goog.LOCALE == 'nl') {
  defaultPatterns = exports.DateIntervalPatterns_nl;
} else if (goog.LOCALE == 'no') {
  defaultPatterns = exports.DateIntervalPatterns_no;
} else if (goog.LOCALE == 'no_NO' || goog.LOCALE == 'no-NO') {
  defaultPatterns = exports.DateIntervalPatterns_no_NO;
} else if (goog.LOCALE == 'or') {
  defaultPatterns = exports.DateIntervalPatterns_or;
} else if (goog.LOCALE == 'pa') {
  defaultPatterns = exports.DateIntervalPatterns_pa;
} else if (goog.LOCALE == 'pl') {
  defaultPatterns = exports.DateIntervalPatterns_pl;
} else if (goog.LOCALE == 'pt') {
  defaultPatterns = exports.DateIntervalPatterns_pt;
} else if (goog.LOCALE == 'pt_BR' || goog.LOCALE == 'pt-BR') {
  defaultPatterns = exports.DateIntervalPatterns_pt_BR;
} else if (goog.LOCALE == 'pt_PT' || goog.LOCALE == 'pt-PT') {
  defaultPatterns = exports.DateIntervalPatterns_pt_PT;
} else if (goog.LOCALE == 'ro') {
  defaultPatterns = exports.DateIntervalPatterns_ro;
} else if (goog.LOCALE == 'ru') {
  defaultPatterns = exports.DateIntervalPatterns_ru;
} else if (goog.LOCALE == 'sh') {
  defaultPatterns = exports.DateIntervalPatterns_sh;
} else if (goog.LOCALE == 'si') {
  defaultPatterns = exports.DateIntervalPatterns_si;
} else if (goog.LOCALE == 'sk') {
  defaultPatterns = exports.DateIntervalPatterns_sk;
} else if (goog.LOCALE == 'sl') {
  defaultPatterns = exports.DateIntervalPatterns_sl;
} else if (goog.LOCALE == 'sq') {
  defaultPatterns = exports.DateIntervalPatterns_sq;
} else if (goog.LOCALE == 'sr') {
  defaultPatterns = exports.DateIntervalPatterns_sr;
} else if (goog.LOCALE == 'sr_Latn' || goog.LOCALE == 'sr-Latn') {
  defaultPatterns = exports.DateIntervalPatterns_sr_Latn;
} else if (goog.LOCALE == 'sv') {
  defaultPatterns = exports.DateIntervalPatterns_sv;
} else if (goog.LOCALE == 'sw') {
  defaultPatterns = exports.DateIntervalPatterns_sw;
} else if (goog.LOCALE == 'ta') {
  defaultPatterns = exports.DateIntervalPatterns_ta;
} else if (goog.LOCALE == 'te') {
  defaultPatterns = exports.DateIntervalPatterns_te;
} else if (goog.LOCALE == 'th') {
  defaultPatterns = exports.DateIntervalPatterns_th;
} else if (goog.LOCALE == 'tl') {
  defaultPatterns = exports.DateIntervalPatterns_tl;
} else if (goog.LOCALE == 'tr') {
  defaultPatterns = exports.DateIntervalPatterns_tr;
} else if (goog.LOCALE == 'uk') {
  defaultPatterns = exports.DateIntervalPatterns_uk;
} else if (goog.LOCALE == 'ur') {
  defaultPatterns = exports.DateIntervalPatterns_ur;
} else if (goog.LOCALE == 'uz') {
  defaultPatterns = exports.DateIntervalPatterns_uz;
} else if (goog.LOCALE == 'vi') {
  defaultPatterns = exports.DateIntervalPatterns_vi;
} else if (goog.LOCALE == 'zh') {
  defaultPatterns = exports.DateIntervalPatterns_zh;
} else if (goog.LOCALE == 'zh_CN' || goog.LOCALE == 'zh-CN') {
  defaultPatterns = exports.DateIntervalPatterns_zh_CN;
} else if (goog.LOCALE == 'zh_HK' || goog.LOCALE == 'zh-HK') {
  defaultPatterns = exports.DateIntervalPatterns_zh_HK;
} else if (goog.LOCALE == 'zh_TW' || goog.LOCALE == 'zh-TW') {
  defaultPatterns = exports.DateIntervalPatterns_zh_TW;
} else if (goog.LOCALE == 'zu') {
  defaultPatterns = exports.DateIntervalPatterns_zu;
} else {
  defaultPatterns = exports.DateIntervalPatterns_en;
}
