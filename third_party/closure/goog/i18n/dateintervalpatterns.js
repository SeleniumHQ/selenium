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
 * File generated from CLDR ver. 35.1
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
 *   YEAR_MONTH_SHORT: !dateIntervalSymbols.DateIntervalPatternMap,
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'y-M GGGGG – y-M GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E d MMM y G – E d MMM y G',
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
exports.DateIntervalPatterns_am = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM፣ y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG M/y – GGGGG M/y',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'G MMM d፣ y – G MMM d፣ y',
    'M': 'MMM d – MMM d፣ y',
    'd': 'MMM d–d፣ y',
    'y': 'MMM d፣ y – MMM d፣ y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'MMM d, E – MMM d, E',
    'd': 'E d – E d፣ MMM',
    'y': 'E፣ MMM d፣ y – E፣ MMM d፣ y',
    '_': 'EEE፣ MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G E፣ MMM d፣ y – G E፣ MMM d፣ y',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM، y',
    'y': 'MMM، y – MMM، y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM، y',
    'y': 'MMMM، y – MMMM، y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M‏/y – M‏/y',
    '_': 'MM‏/y'
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
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM، y',
    'd': 'd–d MMM، y',
    'y': 'd MMM، y – d MMM، y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E، d MMM – E، d MMM',
    'd': 'E، d – E، d MMM',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E، d MMM – E، d MMM، y',
    'd': 'E، d – E، d MMM، y',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_DZ = exports.DateIntervalPatterns_ar;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_EG = exports.DateIntervalPatterns_ar;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_az = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM.y – GGGGG MM.y',
    '_': 'MM.y'
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
    'G': 'G d MMM y – G d MMM y',
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
    'G': 'G d MMM y, E – d MMM y, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M.y GGGGG – M.y GGGGG',
    'My': 'M.y – M.y',
    '_': 'MM.y'
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
    'G': 'd MMM, y G – d MMM, y G',
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
    'G': 'E, d MMM, y G – E, d MMM, y G',
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
    'G': 'y G – y G',
    'y': 'y – y \'г\'.',
    '_': 'y \'г\'.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    '_': 'MM.y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y \'г\'.',
    '_': 'MMMM y \'г\'.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG – MM.y GGGGG',
    '_': 'MM.y \'г\'.'
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
    'G': 'd MMM y G – d MMM y G',
    'Md': 'd.MM – d.MM.y \'г\'.',
    '_': 'd.MM.y \'г\'.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d.MM – E, d.MM',
    'y': 'E, d.MM.y \'г\'. – E, d.MM.y \'г\'.',
    '_': 'EEE, d.MM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'LLL – LLL y.',
    'y': 'LLL y. – LLL y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLLL – LLLL y.',
    'y': 'LLLL y. – LLLL y.',
    '_': 'LLLL y.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'M/y'
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
    'Md': 'd. M – d. M.',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E, d. MMM – E, d. MMM y.',
    'd': 'E, d. – E, d. MMM y.',
    'y': 'E, d. MMM y. – E, d. MMM y.',
    '_': 'EEE, d. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd. M – d. M.',
    'd': 'd–d.',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ca = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'LLL y G – LLL y G',
    'M': 'LLL–LLL y',
    'y': 'LLL y – LLL y',
    '_': 'LLL \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'LLLL–LLLL \'de\' y',
    'y': 'LLLL \'de\' y – LLLL \'de\' y',
    '_': 'LLLL \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd MMM, y G – d MMM, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, d MMM, y G – E, d MMM, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd. M. y G – d. M. y G',
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
    'G': 'E d. M. y G – E d. M. y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd – d MMM',
    'y': 'd MMM, y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y–G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y–G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y–G MMM y',
    'M': 'MMM–MMM y',
    'y': 'MMM y–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y–G MMMM y',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM.y–GGGGG MM.y',
    'My': 'MM.y–MM.y',
    '_': 'MM.y'
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
    'Md': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d. MMM y–G d. MMM y',
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d. MMM–E d. MMM',
    'd': 'E d.–E d. MMM',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G E d. MMM y–G E d. MMM y',
    'M': 'E d. MMM–E d. MMM y',
    'd': 'E d.–E d. MMM y',
    'y': 'E d. MMM y–E d. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'd': 'd.–d.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_de = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG – MM.y GGGGG',
    '_': 'MM.y'
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
    'M': 'dd.MM. – dd.MM.',
    'd': 'dd.–dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd. MMM y G – d. MMM y G',
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
    'G': 'E, d. MMM y G – E E, d. MMM y G',
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
exports.DateIntervalPatterns_de_AT = exports.DateIntervalPatterns_de;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_de_CH = exports.DateIntervalPatterns_de;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_el = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'LLLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM-y GGGGG – MM-y GGGGG',
    'My': 'MM/y – MM/y',
    '_': 'MM/y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E d MMM y G – E d MMM y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'y-MM'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d MMM – E d MMM',
    'd': 'E d – E d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, MMM d, y G – E, MMM d, y G',
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
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
exports.DateIntervalPatterns_en_IE = {
  YEAR_FULL: {
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d – E, d MMM',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, MMM d, y G – E, MMM d, y G',
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM, y'
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
exports.DateIntervalPatterns_en_US = exports.DateIntervalPatterns_en;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_en_ZA = {
  YEAR_FULL: {
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'y-MM GGGGG – y-MM GGGGG',
    '_': 'M/y'
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
    'G': 'MMM d y G – MMM d y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    '_': 'M/y'
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
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
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
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
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
exports.DateIntervalPatterns_es_ES = exports.DateIntervalPatterns_es;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_es_MX = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM \'de\' y G – MMM \'de\' y G',
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM \'de\' y G – MMMM \'de\' y G',
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd \'de\' MMM \'de\' y G – d \'de\' MMM \'de\' y G',
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
    'G': 'E d \'de\' MMM \'de\' y G – E d \'de\' MMM \'de\' y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'M/y–M/y',
    '_': 'MM/y'
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
    'y': 'd/M/y–d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM – d \'de\' MMM y',
    'd': 'd–d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d \'de\' MMM – E d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'Md': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMMM \'de\' y'
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM.y–MM.y',
    '_': 'MM.y'
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
    'Md': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd. MMM y G – d. MMM y G',
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d. MMM – E, d. MMM',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, d. MMM y G – E, d. MMM y G',
    'Md': 'E, d. MMM – E, d. MMM y',
    'y': 'E, d. MMM y – E, d. MMM y',
    '_': 'EEE, d. MMMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_eu = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y, MMM – G y, MMM',
    'M': 'y(\'e\')\'ko\' MMM–MMM',
    'y': 'y(\'e\')\'ko\' MMM – y(\'e\')\'ko\' MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y, MMMM – G y, MMMM',
    'M': 'y(\'e\')\'ko\' MMMM–MMMM',
    '_': 'y(\'e\')\'ko\' MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y/M – y/M',
    '_': 'y/MM'
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
    'G': 'G y, MMM d – G y, MMM d',
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
    'G': 'G y, MMM d, E – G y, MMM d, E',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'LLL تا MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLLL تا MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y/M تا y/M',
    '_': 'y/MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'M.y'
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
    'G': 'd.–d. MMM, y G',
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
    'G': 'E d. MMM y – E d. MMM y G',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'y G \'à\' y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G \'à\' y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G \'à\' MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G \'à\' MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y G \'à\' M/y G',
    '_': 'MM/y'
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
    'G': 'd MMM y G \'à\' d MMM y G',
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
    'G': 'E d MMM y G \'à\' E d MMM y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'y-MM GGGGG – y-MM GGGGG',
    '_': 'y-MM'
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
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E d MMM y G – E d MMM y G',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM \'de\' y G – MMM \'de\' y G',
    'M': 'MMM–MMM \'de\' y',
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM \'de\' y G – MMMM \'de\' y G',
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d \'de\' MMM',
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
    'G': 'd \'de\' MMM \'de\' y G – d \'de\' MMM \'de\' y G',
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMM y – d MMM y',
    '_': 'd/MM/y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, d MMM – E, d MMM',
    'd': 'E, d \'de\' MMM – E, d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, d \'de\' MMM \'de\' y G – E, d \'de\' MMM \'de\' y G',
    'M': 'E, d \'de\' MMM – E, d \'de\' MMM \'de\' y',
    'd': 'E, d MMM – E, d MMM y',
    'y': 'E, d \'de\' MMM \'de\' y – E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d/MM/y'
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MM – MM.y',
    'y': 'MM.y – MM.y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM.y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'G y d MMM – G y d MMM',
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
    'G': 'G y d MMM, E – G y d MMM, E',
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_haw = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M.y GGGGG – M.y GGGGG',
    'M': 'M.y–M.y',
    'y': 'M.y‏–M.y',
    '_': 'M.y'
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
    'G': 'd בMMM y G – d בMMM y G',
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
    'G': 'E, d בMMM y G – E, d בMMM y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y. G – y. G',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y. – y. G',
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y. G – MMM y. G',
    'M': 'LLL – LLL y.',
    '_': 'LLL y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y. G – MMMM y. G',
    'M': 'LLLL – LLLL y.',
    '_': 'LLLL y.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM. y. GGGGG – MM. y. GGGGG',
    '_': 'MM. y.'
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
    'G': 'dd. MMM y. G – dd. MMM y. G',
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
    'G': 'E, dd. MMM y. G – E, dd. MMM y. G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y.'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y. MMM–MMM',
    '_': 'y. MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y. MMMM–MMMM',
    '_': 'y. MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'y. MM–MM.',
    '_': 'y. MM.'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y թթ․',
    '_': 'G y թ.'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y թ. MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'y թ. LLL'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y թ․ LLLL – LLLL',
    '_': 'y թ․ LLLL'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM.y – GGGGG MM.y',
    '_': 'MM.y'
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
    'G': 'G dd MMM, y թ․ – G dd MMM, y թ.',
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
    'G': 'G E, d MMM – G E, d MMM, y թ.',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M.y – M.y',
    '_': 'MM. y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'MM/y – MM/y',
    '_': 'MM/y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E d MMM y G – E d MMM y G',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M.y GGGGG – M.y GGGGG',
    'M': 'M.y–M.y',
    'y': 'M.y‏–M.y',
    '_': 'M.y'
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
    'G': 'd בMMM y G – d בMMM y G',
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
    'G': 'E, d בMMM y G – E, d בMMM y G',
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
    'G': 'Gy年～Gy年',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'Gy年～y年',
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'G': 'Gy年M月～Gy年M月',
    'M': 'y年M月～M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'Gy年M月～Gy年M月',
    'M': 'y年M月～M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'Gy/MM～Gy/MM',
    '_': 'y/MM'
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
    'G': 'Gy年M月d日～Gy年M月d日',
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
    'G': 'Gy年M月d日(E)～Gy年M月d日(E)',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM. y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM, y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM, y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM.y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y \'ж\'.'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y \'ж\'. MMM–MMM',
    'y': 'y \'ж\'. MMM – y \'ж\'. MMM',
    '_': 'y \'ж\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y \'ж\'. MMMM – MMMM',
    'y': 'y \'ж\'. MMMM – y \'ж\'. MMMM',
    '_': 'y \'ж\'. MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM.y – MM.y',
    '_': 'MM.y'
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
    'G': 'G y \'ж\'. d MMM – G y \'ж\'. d MMM',
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
    'G': 'G y \'ж\'. d MMM, E – G y \'ж\'. d MMM, E',
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
    'G': 'G y – G y',
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM​ y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y년 ~ G y년',
    '_': 'y년'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y년~y년',
    '_': 'G y년'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y년 MMM ~ G y년 MMM',
    'M': 'y년 M월~M월',
    'y': 'y년 M월 ~ y년 M월',
    '_': 'y년 MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y년 MMMM ~ G y년 MMMM',
    'M': 'y년 MMMM ~ MMMM',
    '_': 'y년 MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y년 M월 ~ GGGGG y년 M월',
    'My': 'y. M ~ y. M',
    '_': 'y. M.'
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
    'G': 'G y년 MMM d일 ~ G y년 MMM d일',
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
    'G': 'G y년 MMM d일 E요일 ~ G y년 MMM d일 E요일',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y-\'ж\'.'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y-\'ж\'.',
    'y': 'MMM y-\'ж\'. - MMM y-\'ж\'.',
    '_': 'y-\'ж\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM, y-\'ж\'.',
    'y': 'MMMM, y-\'ж\'. – MMMM, y-\'ж\'.',
    '_': 'y-\'ж\'., MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'y-MM – y-MM',
    'y': 'MM.y – MM.y',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MM/y – G MM/y',
    'My': 'MM/y – MM/y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MM/y – G MM/y',
    'M': 'MM/y – MM',
    'y': 'MM/y – MM/y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM/y – GGGGG MM/y',
    'y': 'y/MM – y/MM',
    '_': 'MM/y'
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
    'G': 'G dd/MM/y– G dd/MM/y',
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
    'G': 'G E, dd/MM/y – G E, dd/MM/y',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y \'m\'. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'y-MM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y LLLL–LLLL',
    'y': 'y LLLL – y LLLL',
    '_': 'y \'m\'. LLLL'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y.–y.',
    '_': 'y. \'g\'.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y. \'g\'.'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y. \'gada\' MMM–MMM',
    'y': 'y. \'gada\' MMM – y. \'gada\' MMM',
    '_': 'y. \'g\'. MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y. \'gada\' MMMM – MMMM',
    'y': 'y. \'gada\' MMMM – y. \'gada\' MMMM',
    '_': 'y. \'g\'. MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM.y.–MM.y.',
    '_': 'MM.y.'
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
    'Md': 'dd.MM.–dd.MM.',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E, y. \'gada\' d. MMM – E, y. \'gada\' d. MMM',
    'y': 'E, y. \'gada\' d. MMM – E, y. \'gada\' d. MMM',
    '_': 'EEE, y. \'g\'. d. MMM'
  },
  DAY_ABBR: {
    'M': 'dd.MM.–dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y.–dd.MM.y.',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mk = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y – y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y \'г\'.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M.y – M.y',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd MMM – dd MMM',
    'd': 'dd – dd MMM',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd – dd MMMM',
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
    'd': 'dd – dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd MMM – dd MMM y',
    'd': 'dd – dd MMM y',
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
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E, dd MMM – E, dd MMM y',
    'd': 'E, dd – E, dd MMM y',
    'y': 'E, dd MMM y – E, dd MMM y',
    '_': 'EEE, d MMM y \'г\'.'
  },
  DAY_ABBR: {
    'M': 'dd.M – dd.M',
    'd': 'd – d',
    'y': 'dd.M.y – dd.M.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_ml = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y \'оны\' MMMMM – MMMMM \'сар\'',
    'y': 'y \'оны\' MMMMM \'сар\' – y \'оны\' MMMMM \'сар\'',
    '_': 'y \'оны\' MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y \'оны\' MMMMM – MMMMM \'сар\'',
    'y': 'y \'оны\' MMMMM \'сар\' – y \'оны\' MMMMM \'сар\'',
    '_': 'y \'оны\' MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'y \'оны\' MMMMM–MMMMM \'сар\'',
    'y': 'y \'оны\' MMMMM \'сар\' – y \'оны\' MMMMM \'сар\'',
    '_': 'y MMMMM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMMMM/d – MMMMM/d',
    'd': 'MMMMM/d – d',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'MMM\'ын\' d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMMM/d – MMMMM/d',
    'd': 'MMMMM/d – d',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'MMMM\'ын\' dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MMMMM/d – MMMMM/d',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'MMMMM/dd'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMMM/d – MMMMM/d',
    'd': 'MMMMM/d – d',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'MMMM\'ын\' d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y \'оны\' MMMMM/dd – MMMMM/dd',
    'd': 'y \'оны\' MMMMM/dd – dd',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'y \'оны\' MMM\'ын\' d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMMMM/d E – MMMMM/d E',
    'y': 'y \'оны\' MMMMM/dd E – y \'оны\' MMMMM/dd E',
    '_': 'MMM\'ын\' d. EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'y \'оны\' MMMMM/dd E – MMMMM/dd E',
    'y': 'y \'оны\' MMMMM/dd E – y \'оны\' MMMMM/dd E',
    '_': 'y \'оны\' MMM\'ын\' d. EEE'
  },
  DAY_ABBR: {
    'M': 'MMMMM/d – MMMMM/d',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_mo = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG – MM.y GGGGG',
    '_': 'MM.y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM/y – MM/y',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y – y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM – MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM – MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM   ',
    'My': 'M/y – M/y',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d – d',
    'y': 'y၊ MMM d – y၊ MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'y၊ MMMM d – y၊ MMMM d',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d – d',
    'y': 'y၊ MMMM d – y၊ MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d   ',
    'M': 'y၊ MMM d – MMM d',
    'd': 'y၊ MMM d – d',
    '_': 'y၊ MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d၊ E – MMM d၊ E',
    'y': 'y၊ MMM d၊ EEEE – y၊ MMM d၊ EEEE',
    '_': 'MMM d၊ EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'y၊ MMM d၊ EEEE – MMM d၊ EEEE',
    'y': 'y၊ MMM d၊ EEEE – y၊ MMM d၊ EEEE',
    '_': 'y၊ MMM d၊ EEE'
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
    'G': 'y G–y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G–MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G–MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG–MM.y GGGGG',
    '_': 'MM.y'
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
    'G': 'd. MMM y G–d. MMM y G',
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
    'G': 'E d. MMM y G–E d. MMM y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M-y GGGGG – M-y GGGGG',
    'My': 'MM-y – MM-y',
    '_': 'MM-y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E d MMM y G – E d MMM y G',
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
    'G': 'y G–y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G–MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G–MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG–MM.y GGGGG',
    '_': 'MM.y'
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
    'G': 'd. MMM y G–d. MMM y G',
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
    'G': 'E d. MMM y G–E d. MMM y G',
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
exports.DateIntervalPatterns_no_NO = exports.DateIntervalPatterns_no;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_or = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    'y': 'y MMM – y MMM',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM-y'
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
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE, MMM d, y'
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'LLLL–LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M.y GGGGG – M.y GGGGG',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM y–d MMM y',
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
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM–d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM–E, d MMM',
    'y': 'E, d MMM y–E, d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, d MMM y G – E, d MMM y G',
    'My': 'E, d MMM y–E, d MMM y',
    'd': 'E, d–E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pt = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y – y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM – MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM – MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM/y – GGGGG MM/y',
    'My': 'MM/y – MM/y',
    '_': 'MM/y'
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
    'G': 'G d \'de\' MMM y – G d \'de\' MMM y',
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
    'G': 'G E, d \'de\' MMM y – G E, d \'de\' MMM y',
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
exports.DateIntervalPatterns_pt_BR = exports.DateIntervalPatterns_pt;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_PT = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y – y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM \'de\' y',
    'y': 'MMM \'de\' y – MMM \'de\' y',
    '_': 'MM/y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM – MMMM \'de\' y',
    'y': 'MMMM \'de\' y – MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM/y – GGGGG MM/y',
    'My': 'MM/y – MM/y',
    '_': 'MM/y'
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
    'G': 'G d \'de\' MMM y – G d \'de\' MMM y',
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
    'G': 'G E, d \'de\' MMM y – G E, d \'de\' MMM y',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y GGGGG – MM.y GGGGG',
    '_': 'MM.y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'y \'г\'. G – y \'г\'. G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y–y \'гг\'. G',
    '_': 'y \'г\'. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'LLL y \'г\'. G – LLL y \'г\'. G',
    'M': 'LLL – LLL y \'г\'.',
    '_': 'LLL y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y \'г\'. G – LLLL y \'г\'. G',
    'M': 'LLLL – LLLL y \'г\'.',
    '_': 'LLLL y \'г\'.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y G – MM.y G',
    '_': 'MM.y'
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
    'G': 'd MMM y \'г\'. G – d MMM y \'г\'. G',
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
    'G': 'ccc, d MMM y \'г\'. G – ccc, d MMM y \'г\'. G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y.',
    '_': 'MMMM y.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'M – M, y',
    'y': 'M.y. – M.y.',
    '_': 'MM.y.'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM – MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'M – M/y',
    '_': 'M/y'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'LLLL – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'd. M. y G – d. M. y G',
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
    'G': 'E d. M. y G – E d. M. y G',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'M.–M. y',
    'y': 'M. y–M. y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y – y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M.y GGGGG – M.y GGGGG',
    'My': 'M.y – M.y',
    '_': 'MM.y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y.'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y. G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y.',
    '_': 'MMMM y.'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'M – M, y',
    'y': 'M.y. – M.y.',
    '_': 'MM.y.'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
exports.DateIntervalPatterns_sr_Latn = exports.DateIntervalPatterns_sr;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_sv = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'y-MM – MM',
    '_': 'y-MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'G y – G y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG M/y – GGGGG M/y',
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    'G': 'G d MMM y – G d MMM y',
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    'y': 'd MMM, y – d MMM, y',
    '_': 'd, MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd MMM, E – d MMM, E',
    'y': 'd MMM, y, E – d MMM, y, E',
    '_': 'd MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d MMM, y, E – G d MMM, y, E',
    'Md': 'd MMM, E – d MMM, y, E',
    'y': 'd MMM, y, E – d MMM, y, E',
    '_': 'd MMM, y, EEE'
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM G y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG MM.y – GGGGG MM.y',
    '_': 'MM.y'
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
    'Md': 'd.M – d.M',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d MMM y – G d MMM y',
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
    'G': 'G d MMM y E – G d MMM y E',
    'Mdy': 'd MMM y E – d MMM y E',
    '_': 'd MMM y EEE'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_uk = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'LLL–LLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLLL – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM.y G – MM.y G',
    '_': 'MM.y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'M/y – M/y',
    '_': 'MM/y'
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
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM، y',
    'd': 'd–d MMM y',
    '_': 'd MMM، y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E، d MMM – E، d MMM',
    'y': 'E، d MMM، y – E، d MMM، y',
    '_': 'EEE، d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, MMM d, y G – E, MMM d, y G',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM, G y – MMM, G y',
    'M': 'MMM – MMM, y',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM, G y – MMMM, G y',
    'M': 'MMMM – MMMM, y',
    '_': 'MMMM, y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y (GGGGG) – M/y (GGGGG)',
    'My': 'MM/y – MM/y',
    '_': 'MM.y'
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
    'G': 'd-MMM, G y – d-MMM, G y',
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
    'G': 'E, d-MMM, G y – E, d-MMM, G y',
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
    'G': 'y G – y G',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MM y G – MM y G',
    'M': '\'Tháng\' M - \'Tháng\' M \'năm\' y',
    'y': '\'Tháng\' M \'năm\' y - \'Tháng\' M \'năm\' y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MM y G – MM y G',
    'M': 'MMMM–MMMM \'năm\' y',
    'y': 'MMMM, y – MMMM, y',
    '_': 'MMMM \'năm\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'M/y GGGGG – M/y GGGGG',
    'My': 'MM/y – MM/y',
    '_': '\'tháng\' MM, y'
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
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
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
    'G': 'G y – G y',
    'y': 'y–y年',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
exports.DateIntervalPatterns_zh_CN = exports.DateIntervalPatterns_zh;

/** @const {!DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_HK = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y至y',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y 至 M/y',
    '_': 'MM/y'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y至y',
    '_': 'y年'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'Gy年'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y年M月至M月',
    'y': 'y年M月至y年M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y/M至y/M',
    '_': 'y/MM'
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'y-MM'
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
    'Md': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'MMMM d, y – MMMM d, y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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

switch (goog.LOCALE) {
  case 'af':
    defaultPatterns = exports.DateIntervalPatterns_af;
    break;
  case 'am':
    defaultPatterns = exports.DateIntervalPatterns_am;
    break;
  case 'ar':
    defaultPatterns = exports.DateIntervalPatterns_ar;
    break;
  case 'ar_DZ':
  case 'ar-DZ':
    defaultPatterns = exports.DateIntervalPatterns_ar_DZ;
    break;
  case 'ar_EG':
  case 'ar-EG':
    defaultPatterns = exports.DateIntervalPatterns_ar_EG;
    break;
  case 'az':
    defaultPatterns = exports.DateIntervalPatterns_az;
    break;
  case 'be':
    defaultPatterns = exports.DateIntervalPatterns_be;
    break;
  case 'bg':
    defaultPatterns = exports.DateIntervalPatterns_bg;
    break;
  case 'bn':
    defaultPatterns = exports.DateIntervalPatterns_bn;
    break;
  case 'br':
    defaultPatterns = exports.DateIntervalPatterns_br;
    break;
  case 'bs':
    defaultPatterns = exports.DateIntervalPatterns_bs;
    break;
  case 'ca':
    defaultPatterns = exports.DateIntervalPatterns_ca;
    break;
  case 'chr':
    defaultPatterns = exports.DateIntervalPatterns_chr;
    break;
  case 'cs':
    defaultPatterns = exports.DateIntervalPatterns_cs;
    break;
  case 'cy':
    defaultPatterns = exports.DateIntervalPatterns_cy;
    break;
  case 'da':
    defaultPatterns = exports.DateIntervalPatterns_da;
    break;
  case 'de':
    defaultPatterns = exports.DateIntervalPatterns_de;
    break;
  case 'de_AT':
  case 'de-AT':
    defaultPatterns = exports.DateIntervalPatterns_de_AT;
    break;
  case 'de_CH':
  case 'de-CH':
    defaultPatterns = exports.DateIntervalPatterns_de_CH;
    break;
  case 'el':
    defaultPatterns = exports.DateIntervalPatterns_el;
    break;
  case 'en':
    defaultPatterns = exports.DateIntervalPatterns_en;
    break;
  case 'en_AU':
  case 'en-AU':
    defaultPatterns = exports.DateIntervalPatterns_en_AU;
    break;
  case 'en_CA':
  case 'en-CA':
    defaultPatterns = exports.DateIntervalPatterns_en_CA;
    break;
  case 'en_GB':
  case 'en-GB':
    defaultPatterns = exports.DateIntervalPatterns_en_GB;
    break;
  case 'en_IE':
  case 'en-IE':
    defaultPatterns = exports.DateIntervalPatterns_en_IE;
    break;
  case 'en_IN':
  case 'en-IN':
    defaultPatterns = exports.DateIntervalPatterns_en_IN;
    break;
  case 'en_SG':
  case 'en-SG':
    defaultPatterns = exports.DateIntervalPatterns_en_SG;
    break;
  case 'en_US':
  case 'en-US':
    defaultPatterns = exports.DateIntervalPatterns_en_US;
    break;
  case 'en_ZA':
  case 'en-ZA':
    defaultPatterns = exports.DateIntervalPatterns_en_ZA;
    break;
  case 'es':
    defaultPatterns = exports.DateIntervalPatterns_es;
    break;
  case 'es_419':
  case 'es-419':
    defaultPatterns = exports.DateIntervalPatterns_es_419;
    break;
  case 'es_ES':
  case 'es-ES':
    defaultPatterns = exports.DateIntervalPatterns_es_ES;
    break;
  case 'es_MX':
  case 'es-MX':
    defaultPatterns = exports.DateIntervalPatterns_es_MX;
    break;
  case 'es_US':
  case 'es-US':
    defaultPatterns = exports.DateIntervalPatterns_es_US;
    break;
  case 'et':
    defaultPatterns = exports.DateIntervalPatterns_et;
    break;
  case 'eu':
    defaultPatterns = exports.DateIntervalPatterns_eu;
    break;
  case 'fa':
    defaultPatterns = exports.DateIntervalPatterns_fa;
    break;
  case 'fi':
    defaultPatterns = exports.DateIntervalPatterns_fi;
    break;
  case 'fil':
    defaultPatterns = exports.DateIntervalPatterns_fil;
    break;
  case 'fr':
    defaultPatterns = exports.DateIntervalPatterns_fr;
    break;
  case 'fr_CA':
  case 'fr-CA':
    defaultPatterns = exports.DateIntervalPatterns_fr_CA;
    break;
  case 'ga':
    defaultPatterns = exports.DateIntervalPatterns_ga;
    break;
  case 'gl':
    defaultPatterns = exports.DateIntervalPatterns_gl;
    break;
  case 'gsw':
    defaultPatterns = exports.DateIntervalPatterns_gsw;
    break;
  case 'gu':
    defaultPatterns = exports.DateIntervalPatterns_gu;
    break;
  case 'haw':
    defaultPatterns = exports.DateIntervalPatterns_haw;
    break;
  case 'he':
    defaultPatterns = exports.DateIntervalPatterns_he;
    break;
  case 'hi':
    defaultPatterns = exports.DateIntervalPatterns_hi;
    break;
  case 'hr':
    defaultPatterns = exports.DateIntervalPatterns_hr;
    break;
  case 'hu':
    defaultPatterns = exports.DateIntervalPatterns_hu;
    break;
  case 'hy':
    defaultPatterns = exports.DateIntervalPatterns_hy;
    break;
  case 'id':
    defaultPatterns = exports.DateIntervalPatterns_id;
    break;
  case 'in':
    defaultPatterns = exports.DateIntervalPatterns_in;
    break;
  case 'is':
    defaultPatterns = exports.DateIntervalPatterns_is;
    break;
  case 'it':
    defaultPatterns = exports.DateIntervalPatterns_it;
    break;
  case 'iw':
    defaultPatterns = exports.DateIntervalPatterns_iw;
    break;
  case 'ja':
    defaultPatterns = exports.DateIntervalPatterns_ja;
    break;
  case 'ka':
    defaultPatterns = exports.DateIntervalPatterns_ka;
    break;
  case 'kk':
    defaultPatterns = exports.DateIntervalPatterns_kk;
    break;
  case 'km':
    defaultPatterns = exports.DateIntervalPatterns_km;
    break;
  case 'kn':
    defaultPatterns = exports.DateIntervalPatterns_kn;
    break;
  case 'ko':
    defaultPatterns = exports.DateIntervalPatterns_ko;
    break;
  case 'ky':
    defaultPatterns = exports.DateIntervalPatterns_ky;
    break;
  case 'ln':
    defaultPatterns = exports.DateIntervalPatterns_ln;
    break;
  case 'lo':
    defaultPatterns = exports.DateIntervalPatterns_lo;
    break;
  case 'lt':
    defaultPatterns = exports.DateIntervalPatterns_lt;
    break;
  case 'lv':
    defaultPatterns = exports.DateIntervalPatterns_lv;
    break;
  case 'mk':
    defaultPatterns = exports.DateIntervalPatterns_mk;
    break;
  case 'ml':
    defaultPatterns = exports.DateIntervalPatterns_ml;
    break;
  case 'mn':
    defaultPatterns = exports.DateIntervalPatterns_mn;
    break;
  case 'mo':
    defaultPatterns = exports.DateIntervalPatterns_mo;
    break;
  case 'mr':
    defaultPatterns = exports.DateIntervalPatterns_mr;
    break;
  case 'ms':
    defaultPatterns = exports.DateIntervalPatterns_ms;
    break;
  case 'mt':
    defaultPatterns = exports.DateIntervalPatterns_mt;
    break;
  case 'my':
    defaultPatterns = exports.DateIntervalPatterns_my;
    break;
  case 'nb':
    defaultPatterns = exports.DateIntervalPatterns_nb;
    break;
  case 'ne':
    defaultPatterns = exports.DateIntervalPatterns_ne;
    break;
  case 'nl':
    defaultPatterns = exports.DateIntervalPatterns_nl;
    break;
  case 'no':
    defaultPatterns = exports.DateIntervalPatterns_no;
    break;
  case 'no_NO':
  case 'no-NO':
    defaultPatterns = exports.DateIntervalPatterns_no_NO;
    break;
  case 'or':
    defaultPatterns = exports.DateIntervalPatterns_or;
    break;
  case 'pa':
    defaultPatterns = exports.DateIntervalPatterns_pa;
    break;
  case 'pl':
    defaultPatterns = exports.DateIntervalPatterns_pl;
    break;
  case 'pt':
    defaultPatterns = exports.DateIntervalPatterns_pt;
    break;
  case 'pt_BR':
  case 'pt-BR':
    defaultPatterns = exports.DateIntervalPatterns_pt_BR;
    break;
  case 'pt_PT':
  case 'pt-PT':
    defaultPatterns = exports.DateIntervalPatterns_pt_PT;
    break;
  case 'ro':
    defaultPatterns = exports.DateIntervalPatterns_ro;
    break;
  case 'ru':
    defaultPatterns = exports.DateIntervalPatterns_ru;
    break;
  case 'sh':
    defaultPatterns = exports.DateIntervalPatterns_sh;
    break;
  case 'si':
    defaultPatterns = exports.DateIntervalPatterns_si;
    break;
  case 'sk':
    defaultPatterns = exports.DateIntervalPatterns_sk;
    break;
  case 'sl':
    defaultPatterns = exports.DateIntervalPatterns_sl;
    break;
  case 'sq':
    defaultPatterns = exports.DateIntervalPatterns_sq;
    break;
  case 'sr':
    defaultPatterns = exports.DateIntervalPatterns_sr;
    break;
  case 'sr_Latn':
  case 'sr-Latn':
    defaultPatterns = exports.DateIntervalPatterns_sr_Latn;
    break;
  case 'sv':
    defaultPatterns = exports.DateIntervalPatterns_sv;
    break;
  case 'sw':
    defaultPatterns = exports.DateIntervalPatterns_sw;
    break;
  case 'ta':
    defaultPatterns = exports.DateIntervalPatterns_ta;
    break;
  case 'te':
    defaultPatterns = exports.DateIntervalPatterns_te;
    break;
  case 'th':
    defaultPatterns = exports.DateIntervalPatterns_th;
    break;
  case 'tl':
    defaultPatterns = exports.DateIntervalPatterns_tl;
    break;
  case 'tr':
    defaultPatterns = exports.DateIntervalPatterns_tr;
    break;
  case 'uk':
    defaultPatterns = exports.DateIntervalPatterns_uk;
    break;
  case 'ur':
    defaultPatterns = exports.DateIntervalPatterns_ur;
    break;
  case 'uz':
    defaultPatterns = exports.DateIntervalPatterns_uz;
    break;
  case 'vi':
    defaultPatterns = exports.DateIntervalPatterns_vi;
    break;
  case 'zh':
    defaultPatterns = exports.DateIntervalPatterns_zh;
    break;
  case 'zh_CN':
  case 'zh-CN':
    defaultPatterns = exports.DateIntervalPatterns_zh_CN;
    break;
  case 'zh_HK':
  case 'zh-HK':
    defaultPatterns = exports.DateIntervalPatterns_zh_HK;
    break;
  case 'zh_TW':
  case 'zh-TW':
    defaultPatterns = exports.DateIntervalPatterns_zh_TW;
    break;
  case 'zu':
    defaultPatterns = exports.DateIntervalPatterns_zu;
    break;
  default:
    defaultPatterns = exports.DateIntervalPatterns_en;
}
