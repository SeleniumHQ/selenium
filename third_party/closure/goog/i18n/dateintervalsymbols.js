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
 * @fileoverview Date interval formatting symbols for all locales.
 *
 * File generated from CLDR ver. 31.0.1
 *
 * To reduce the file size (which may cause issues in some JS
 * developing environments), this file will only contain locales
 * that are frequently used by web applications. This is defined as
 * proto/closure_locales_data.txt and will change (most likely addition)
 * over time.  Rest of the data can be found in another file named
 * "dateintervalsymbolsext.js", which will be generated at
 * the same time together with this file.
 */

// clang-format off

goog.module('goog.i18n.dateIntervalSymbols');

/**
 * Map containing the interval pattern for every calendar field.
 * @typedef {!Object<string, string>}
 */
var DateIntervalPatternMap;

/** @typedef {!DateIntervalPatternMap} */
exports.DateIntervalPatternMap;

/**
 * Collection of date interval symbols.
 * @typedef {{
 *   FULL_DATE: !DateIntervalPatternMap,
 *   LONG_DATE: !DateIntervalPatternMap,
 *   MEDIUM_DATE: !DateIntervalPatternMap,
 *   SHORT_DATE: !DateIntervalPatternMap,
 *   FULL_TIME: !DateIntervalPatternMap,
 *   LONG_TIME: !DateIntervalPatternMap,
 *   MEDIUM_TIME: !DateIntervalPatternMap,
 *   SHORT_TIME: !DateIntervalPatternMap,
 *   FULL_DATETIME: !DateIntervalPatternMap,
 *   LONG_DATETIME: !DateIntervalPatternMap,
 *   MEDIUM_DATETIME: !DateIntervalPatternMap,
 *   SHORT_DATETIME: !DateIntervalPatternMap,
 *   FALLBACK: string
 * }}
 */
var DateIntervalSymbols;

/** @typedef {!DateIntervalSymbols} */
exports.DateIntervalSymbols;

/** @type {!DateIntervalSymbols} */
var defaultSymbols;

/**
 * Returns the default DateIntervalSymbols.
 * @return {!DateIntervalSymbols}
 */
exports.getDateIntervalSymbols = function() {
  return defaultSymbols;
};

/**
 * Sets the default DateIntervalSymbols.
 * @param {!DateIntervalSymbols} symbols
 */
exports.setDateIntervalSymbols = function(symbols) {
  defaultSymbols = symbols;
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_af = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'd': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y – d/M/y',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_am = {
  FULL_DATE: {
    'Md': 'EEEE MMMM d – EEEE MMMM d፣ y',
    'y': 'EEEE፣ MMMM d፣ y – EEEE፣ MMMM d፣ y',
    '_': 'EEEE ፣d MMMM y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d፣ y',
    'd': 'MMMM d–d፣ y',
    'y': 'MMMM d፣ y – MMMM d፣ y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d፣ y',
    'd': 'MMM d–d፣ y',
    'y': 'MMM d፣ y – MMM d፣ y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y – d/M/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE ፣d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ar = {
  FULL_DATE: {
    'M': 'EEEE، d MMMM – EEEE، d MMMM، y',
    'd': 'EEEE، d – EEEE، d MMMM، y',
    '_': 'EEEE، d MMMM، y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM، y',
    'd': 'd–d MMMM، y',
    '_': 'd MMMM، y'
  },
  MEDIUM_DATE: {
    'Mdy': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'dd‏/MM‏/y'
  },
  SHORT_DATE: {
    '_': 'd‏/M‏/y'
  },
  FULL_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd‏/M‏/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd‏/MM‏/y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd‏/M‏/y h:mm a – h:mm a',
    'hm': 'd‏/M‏/y h:mm–h:mm a',
    '_': 'd‏/M‏/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_DZ = {
  FULL_DATE: {
    'M': 'EEEE، d MMMM – EEEE، d MMMM، y',
    'd': 'EEEE، d – EEEE، d MMMM، y',
    '_': 'EEEE، d MMMM، y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM، y',
    'd': 'd–d MMMM، y',
    '_': 'd MMMM، y'
  },
  MEDIUM_DATE: {
    'Mdy': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'dd‏/MM‏/y'
  },
  SHORT_DATE: {
    '_': 'd‏/M‏/y'
  },
  FULL_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd‏/M‏/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd‏/M‏/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd‏/MM‏/y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd‏/M‏/y h:mm a – h:mm a',
    'hm': 'd‏/M‏/y h:mm–h:mm a',
    '_': 'd‏/M‏/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_az = {
  FULL_DATE: {
    'Md': 'd MMMM y, EEEE – d MMMM, EEEE',
    '_': 'd MMMM y, EEEE'
  },
  LONG_DATE: {
    'M': 'd MMMM y – d MMMM',
    'd': 'y MMMM d–d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM y – d MMM',
    'd': 'y MMM d–d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'd MMMM y, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_be = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y – d.M.y',
    '_': 'd.MM.y'
  },
  SHORT_DATE: {
    'Mdy': 'd.M.yy – d.M.yy',
    '_': 'd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss, zzzz',
    '_': 'HH:mm:ss, zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss, z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH.mm–HH.mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'г\'. \'у\' HH:mm:ss, zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'г\'. \'у\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.MM.yy, HH.mm–HH.mm',
    '_': 'd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_bg = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y \'г\'.',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y \'г\'.',
    'd': 'd – d MMMM y \'г\'.',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'Md': 'd.MM – d.MM.y \'г\'.',
    '_': 'd.MM.y \'г\'.'
  },
  SHORT_DATE: {
    'Md': 'd.MM – d.MM.yy \'г\'.',
    '_': 'd.MM.yy \'г\'.'
  },
  FULL_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'г\'., H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'г\'., H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.MM.y \'г\'., H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.MM.yy \'г\'., H:mm – H:mm',
    '_': 'd.MM.yy \'г\'., H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_bn = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'hm': 'd/M/yy h:mm–h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_br = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'y MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE \'da\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d \'da\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_bs = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y.',
    'd': 'EEEE, d. – EEEE, d. MMMM y.',
    'y': 'EEEE, d. MMMM y. – EEEE, d. MMMM y.',
    '_': 'EEEE, d. MMMM y.'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y.',
    'd': 'd. – d. MMMM y.',
    'y': 'd. MMMM y. – d. MMMM y.',
    '_': 'd. MMMM y.'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM – d. MMM y.',
    'd': 'd. – d. MMM y.',
    'y': 'd. MMM y. – d. MMM y.',
    '_': 'd. MMM. y.'
  },
  SHORT_DATE: {
    'Mdy': 'd.M.yy. – d.M.yy.',
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y. HH:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y. \'u\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y. \'u\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM. y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy. HH:mm – HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ca = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM \'de\' y',
    'd': 'EEEE, d – EEEE, d MMMM \'de\' y',
    'y': 'EEEE, d MMMM \'de\' y – EEEE, d MMMM \'de\' y',
    '_': 'EEEE, d MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd–d MMMM \'de\' y',
    'y': 'd MMMM \'de\' y – d MMMM \'de\' y',
    '_': 'd MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, H:mm',
    'ahm': 'H:mm – H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM \'de\' y \'a\' \'les\' H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM \'de\' y \'a\' \'les\' H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy, H:mm – H:mm',
    '_': 'd/M/yy H:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_chr = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y ᎤᎾᎢ h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y ᎤᎾᎢ h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy, h:mm a – h:mm a',
    'hm': 'M/d/yy, h:mm – h:mm a',
    '_': 'M/d/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_cs = {
  FULL_DATE: {
    'Md': 'EEEE d. M. – EEEE d. M. y',
    'y': 'EEEE d. M. y – EEEE d. M. y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. M. – d. M. y',
    'd': 'd.–d. M. y',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd.MM.y – dd.MM.y',
    '_': 'd. M. y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd. M. y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd. M. y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd. M. y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd. M. y H:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d. MMMM y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. M. y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd. MM. yy H:mm–H:mm',
    '_': 'dd.MM.yy H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_cy = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM, y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'am\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'am\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_da = {
  FULL_DATE: {
    'Md': 'EEEE \'den\' d.–EEEE \'den\' d. MMMM y',
    'y': 'EEEE \'den\' d. MMMM y–EEEE \'den\' d. MMMM y',
    '_': 'EEEE \'den\' d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM.–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM.–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y–dd/MM/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH.mm',
    'ahm': 'HH.mm–HH.mm',
    '_': 'HH.mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE \'den\' d. MMMM y \'kl\'. HH.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y HH.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH.mm–HH.mm',
    '_': 'dd/MM/y HH.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_de = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH:mm–HH:mm \'Uhr\'',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y \'um\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'um\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm \'Uhr\'',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_de_AT = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH:mm–HH:mm \'Uhr\'',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y \'um\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'um\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm \'Uhr\'',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_de_CH = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH:mm–HH:mm \'Uhr\'',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y \'um\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'um\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm \'Uhr\'',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_el = {
  FULL_DATE: {
    'Md': 'EEEE, dd MMMM – EEEE, dd MMMM y',
    'y': 'EEEE, dd MMMM y – EEEE, dd MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd–dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/yy – dd/MM/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y - h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y - h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm–h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy, h:mm a – h:mm a',
    'hm': 'M/d/yy, h:mm – h:mm a',
    '_': 'M/d/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_AU = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/yy – dd/MM/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CA = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd, h:mm a – h:mm a',
    'hm': 'y-MM-dd, h:mm – h:mm a',
    '_': 'y-MM-dd, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GB = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IE = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IN = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy, h:mm a – h:mm a',
    'hm': 'dd/MM/yy, h:mm – h:mm a',
    '_': 'dd/MM/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SG = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_US = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy, h:mm a – h:mm a',
    'hm': 'M/d/yy, h:mm – h:mm a',
    '_': 'M/d/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_ZA = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'y/MM/dd'
  },
  FULL_TIME: {
    'Mdy': 'y/MM/dd, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y/MM/dd, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/MM/dd, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/MM/dd, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y/MM/dd, HH:mm – HH:mm',
    '_': 'y/MM/dd, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y H:mm:ss (z)',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy H:mm–H:mm',
    '_': 'd/M/yy H:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es_419 = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy H:mm–H:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es_ES = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y H:mm:ss (z)',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy H:mm–H:mm',
    '_': 'd/M/yy H:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es_MX = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y – d/M/y',
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy H:mm–H:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es_US = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'hm': 'd/M/yy h:mm – h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_et = {
  FULL_DATE: {
    'Md': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'y': 'EEEE, d. MMMM y – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_eu = {
  FULL_DATE: {
    'M': 'y(\'e\')\'ko\' MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y(\'e\')\'ko\' MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y(\'e\')\'ko\' MMMM d – MMMM d',
    'd': 'y(\'e\')\'ko\' MMMM d–d',
    '_': 'y(\'e\')\'ko\' MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y(\'e\')\'ko\' MMM d – MMM d',
    'd': 'y(\'e\')\'ko\' MMM d–d',
    'y': 'y(\'e\')\'ko\' MMM d – y(\'e\')\'ko\' MMM d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    '_': 'yy/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d HH:mm:ss (zzzz)',
    '_': 'HH:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d HH:mm:ss (z)',
    '_': 'HH:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y(\'e\')\'ko\' MMMM d, EEEE HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'y(\'e\')\'ko\' MMMM d HH:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'yy/M/d HH:mm–HH:mm',
    '_': 'yy/M/d HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_fa = {
  FULL_DATE: {
    'Md': 'EEEE d LLLL تا EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd LLLL تا d MMMM y',
    'd': 'd تا d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd LLL تا d MMM y',
    'd': 'd تا d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d،‏ H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d،‏ H:mm:ss (z)',
    '_': 'H:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d،‏ H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d،‏ H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y، ساعت H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y، ساعت H:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y،‏ H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y/M/d،‏ H:mm تا H:mm',
    '_': 'y/M/d،‏ H:mm'
  },
  FALLBACK: '{0} تا {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_fi = {
  FULL_DATE: {
    '_': 'cccc d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd.M.–d.M.y',
    'd': 'd.–d.M.y',
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    'M': 'd.M.–d.M.y',
    'd': 'd.–d.M.y',
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y \'klo\' H.mm.ss zzzz',
    '_': 'H.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y \'klo\' H.mm.ss z',
    '_': 'H.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y \'klo\' H.mm.ss',
    '_': 'H.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y \'klo\' H.mm',
    '_': 'H.mm'
  },
  FULL_DATETIME: {
    '_': 'cccc d. MMMM y \'klo\' H.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'klo\' H.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.M.y \'klo\' H.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y \'klo\' H.mm–H.mm',
    '_': 'd.M.y H.mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_fil = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d–d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y, h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y \'nang\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y \'nang\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy, h:mm a – h:mm a',
    'hm': 'M/d/yy, h:mm–h:mm a',
    '_': 'M/d/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_fr = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y \'à\' HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y \'à\' HH:mm – HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CA = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'yy-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH \'h\' mm',
    'ahm': 'H \'h\' mm – H \'h\' mm',
    '_': 'HH \'h\' mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'yy-MM-dd H \'h\' mm – H \'h\' mm',
    '_': 'yy-MM-dd HH \'h\' mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ga = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_gl = {
  FULL_DATE: {
    'M': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'd': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMM y – d MMM y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  SHORT_DATE: {
    'Md': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'HH:mm:ss zzzz, d/M/y',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'HH:mm:ss z, d/M/y',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'HH:mm:ss, d/M/y',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'HH:mm, d/M/y',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'HH:mm:ss zzzz \'do\' EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z \'do\' d \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATETIME: {
    '_': 'HH:mm:ss, d \'de\' MMM \'de\' y'
  },
  SHORT_DATETIME: {
    'ahm': 'HH:mm–HH:mm, dd/MM/yy',
    '_': 'HH:mm, dd/MM/yy'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_gsw = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_gu = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a zzzz',
    '_': 'hh:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a z',
    '_': 'hh:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a',
    '_': 'hh:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y hh:mm a',
    'a': 'h:mm a – h:mm a',
    'h': 'h:mm – h:mm a',
    'm': 'h:mm–h:mm a',
    '_': 'hh:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y hh:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y hh:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y hh:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'h': 'd/M/yy h:mm – h:mm a',
    'm': 'd/M/yy h:mm–h:mm a',
    '_': 'd/M/yy hh:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_haw = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'hm': 'd/M/yy h:mm–h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_he = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, d בMMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d בMMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  SHORT_DATE: {
    'd': 'dd.M.y – dd.M.y',
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, H:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d בMMMM y בשעה H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd בMMMM y בשעה H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd בMMM y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y, H:mm–H:mm',
    '_': 'd.M.y, H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_hi = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y – d/M/y',
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y को h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y को h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm–h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_hr = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    'y': 'EEEE, dd. MMMM y. – EEEE, dd. MMMM y.',
    '_': 'EEEE, d. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd. – dd. MMMM y.',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM y.'
  },
  MEDIUM_DATE: {
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd. – dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  SHORT_DATE: {
    '_': 'dd. MM. y.'
  },
  FULL_TIME: {
    'Mdy': 'dd. MM. y. HH:mm:ss (zzzz)',
    '_': 'HH:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'dd. MM. y. HH:mm:ss (z)',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd. MM. y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd. MM. y. HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y. \'u\' HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y. \'u\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd. MM. y. HH:mm – HH:mm',
    '_': 'dd. MM. y. HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_hu = {
  FULL_DATE: {
    'M': 'y. MMMM d., EEEE – MMMM d., EEEE',
    'd': 'y. MMMM d., EEEE – d., EEEE',
    '_': 'y. MMMM d., EEEE'
  },
  LONG_DATE: {
    'M': 'y. MMMM d. – MMMM d.',
    'd': 'y. MMMM d–d.',
    '_': 'y. MMMM d.'
  },
  MEDIUM_DATE: {
    'M': 'y. MMM d. – MMM d.',
    'd': 'y. MMM d–d.',
    '_': 'y. MMM d.'
  },
  SHORT_DATE: {
    'M': 'y. MM. dd. – MM. dd.',
    'd': 'y. MM. dd–dd.',
    '_': 'y. MM. dd.'
  },
  FULL_TIME: {
    'Mdy': 'y. MM. dd. H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y. MM. dd. H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y. MM. dd. H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y. MM. dd. H:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'y. MMMM d., EEEE H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y. MMMM d. H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y. MMM d. H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y. MM. dd. H:mm–H:mm',
    '_': 'y. MM. dd. H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_hy = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y թ.',
    'y': 'EEEE, d MMMM, y – EEEE, d MMMM, y թ.',
    '_': 'y թ. MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'dd MMMM – dd MMMM, y թ.',
    'd': 'dd–dd MMMM, y թ.',
    'y': 'dd MMMM, y թ․ – dd MMMM, y թ.',
    '_': 'dd MMMM, y թ.'
  },
  MEDIUM_DATE: {
    'M': 'dd MMM – dd MMM, y թ.',
    'd': 'dd–dd MMM, y թ.',
    'y': 'dd MMM, y թ․ – dd MMM, y թ.',
    '_': 'dd MMM, y թ.'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, HH:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y թ. MMMM d, EEEE, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM, y թ., HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM, y թ., HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, H:mm–H:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_id = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH.mm',
    'ahm': 'HH.mm–HH.mm',
    '_': 'HH.mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y HH.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH.mm–HH.mm',
    '_': 'dd/MM/yy HH.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_in = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH.mm',
    'ahm': 'HH.mm–HH.mm',
    '_': 'HH.mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y HH.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH.mm–HH.mm',
    '_': 'dd/MM/yy HH.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_is = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y \'kl\'. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y, HH:mm–HH:mm',
    '_': 'd.M.y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_it = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd–dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/yy – dd/MM/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm–HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_iw = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, d בMMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d בMMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  SHORT_DATE: {
    'd': 'dd.M.y – dd.M.y',
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, H:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d בMMMM y בשעה H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd בMMMM y בשעה H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd בMMM y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y, H:mm–H:mm',
    '_': 'd.M.y, H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ja = {
  FULL_DATE: {
    'Mdy': 'y/MM/dd(EEEE)～y/MM/dd(EEEE)',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'y/MM/dd～y/MM/dd',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    '_': 'y/MM/dd'
  },
  SHORT_DATE: {
    '_': 'y/MM/dd'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d H時mm分ss秒 zzzz',
    '_': 'H時mm分ss秒 zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d H時mm分ss秒 z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d H:mm',
    'ahm': 'H時mm分～H時mm分',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'y年M月d日EEEE H時mm分ss秒 zzzz'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y/MM/dd H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y/MM/dd H時mm分～H時mm分',
    '_': 'y/MM/dd H:mm'
  },
  FALLBACK: '{0}～{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ka = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM. – EEEE, d MMMM. y',
    'y': 'EEEE, d MMMM. y – EEEE, d MMMM. y',
    '_': 'EEEE, dd MMMM, y'
  },
  LONG_DATE: {
    'M': 'dd MMMM. – dd MMMM. y',
    'd': 'd–d MMMM, y',
    'y': 'dd MMMM. y – d MMMM. y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'dd MMM. – dd MMM. y',
    'd': 'd–d MMM, y',
    'y': 'dd MMM. y – d MMM. y',
    '_': 'd MMM. y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM, y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM. y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_kk = {
  FULL_DATE: {
    'M': 'y \'ж\'. d MMMM, EEEE – d MMMM, EEEE',
    'dy': 'y \'ж\'. d MMMM, EEEE – y \'ж\'. d MMMM, EEEE',
    '_': 'y \'ж\'. d MMMM, EEEE'
  },
  LONG_DATE: {
    'M': 'y \'ж\'. d MMMM – d MMMM',
    'd': 'y \'ж\'. d–d MMMM',
    'y': 'y \'ж\'. d MMMM – y \'ж\'. d MMMM',
    '_': 'y \'ж\'. d MMMM'
  },
  MEDIUM_DATE: {
    'M': 'y \'ж\'. d MMM – d MMM',
    'd': 'y \'ж\'. d–d MMM',
    'y': 'y \'ж\'. d MMM – y \'ж\'. d MMM',
    '_': 'y \'ж\'. dd MMM'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy – dd.MM.yy',
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y \'ж\'. d MMMM, EEEE, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y \'ж\'. d MMMM, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y \'ж\'. dd MMM, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_km = {
  FULL_DATE: {
    'Md': 'EEEE dd MMMM y – EEEE dd MMMM y',
    'y': 'EEEE dd-MM-y – EEEE dd MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y នៅ​ម៉ោង h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y នៅ​ម៉ោង h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_kn = {
  FULL_DATE: {
    'M': 'EEEE, MMMM d – EEEE, MMMM d, y',
    'd': 'EEEE, MMMM d – EEEE, MMMM d,y',
    'y': 'd MMMM, y EEEE – d MMMM, y EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'MMMM d–d,y',
    'y': 'd, MMMM, y – d, MMMM, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'MMM d–d,y',
    'y': 'd, MMM, y – d, MMM, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/yy – M/d/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a zzzz',
    '_': 'hh:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a z',
    '_': 'hh:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y hh:mm:ss a',
    '_': 'hh:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y hh:mm a',
    'a': 'h:mm a – h:mm a',
    'h': 'h:mm–h:mm a',
    'm': 'h:mm – h:mm a',
    '_': 'hh:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y hh:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y hh:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y hh:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'h': 'd/M/yy h:mm–h:mm a',
    'm': 'd/M/yy h:mm – h:mm a',
    '_': 'd/M/yy hh:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ko = {
  FULL_DATE: {
    'Mdy': 'y. M. d. (EEEE) ~ y. M. d. (EEEE)',
    '_': 'y년 M월 d일 EEEE'
  },
  LONG_DATE: {
    'Mdy': 'y. M. d. ~ y. M. d.',
    '_': 'y년 M월 d일'
  },
  MEDIUM_DATE: {
    '_': 'y. M. d.'
  },
  SHORT_DATE: {
    '_': 'yy. M. d.'
  },
  FULL_TIME: {
    'Mdy': 'y. M. d. a h시 m분 s초 zzzz',
    '_': 'a h시 m분 s초 zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y. M. d. a h시 m분 s초 z',
    '_': 'a h시 m분 s초 z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y. M. d. a h:mm:ss',
    '_': 'a h:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y. M. d. a h:mm',
    'hm': 'a h:mm~h:mm',
    '_': 'a h:mm'
  },
  FULL_DATETIME: {
    '_': 'y년 M월 d일 EEEE a h시 m분 s초 zzzz'
  },
  LONG_DATETIME: {
    '_': 'y년 M월 d일 a h시 m분 s초 z'
  },
  MEDIUM_DATETIME: {
    '_': 'y. M. d. a h:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'yy. M. d. a h:mm ~ a h:mm',
    'hm': 'yy. M. d. a h:mm~h:mm',
    '_': 'yy. M. d. a h:mm'
  },
  FALLBACK: '{0} ~ {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ky = {
  FULL_DATE: {
    'M': 'y-\'ж\'., d-MMMM, EEEE – d-MMMM EEEE',
    'd': 'y-\'ж\'., d-MMMM, EEEE – d-MMMM, EEEE',
    'y': 'y-\'ж\'., d-MMMM, EEEE – y-\'ж\'., d-MMMM, EEEE',
    '_': 'y-\'ж\'., d-MMMM, EEEE'
  },
  LONG_DATE: {
    'M': 'd-MMMM – d-MMMM y-\'ж\'.',
    'd': 'd–d-MMMM y-\'ж\'.',
    'y': 'd-MMMM y-\'ж\'. - d-MMMM y-\'ж\'.',
    '_': 'y-\'ж\'., d-MMMM'
  },
  MEDIUM_DATE: {
    'M': 'd-MMM – d-MMM y-\'ж\'.',
    'd': 'd–d-MMM y-\'ж\'.',
    'y': 'd-MMM y-\'ж\'. - d-MMM y-\'ж\'.',
    '_': 'y-\'ж\'., d-MMM'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy – dd.MM.yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-dd-MM HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-dd-MM HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-dd-MM HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-dd-MM HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y-\'ж\'., d-MMMM, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y-\'ж\'., d-MMMM HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y-\'ж\'., d-MMM HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ln = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'd/M/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_lo = {
  FULL_DATE: {
    '_': 'EEEE ທີ d MMMM G y'
  },
  LONG_DATE: {
    'M': 'd/MM/y – d/MM',
    'd': 'd/MM/y – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd/MM/y – d/MM',
    'd': 'd/MM/y – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'd/M/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, H ໂມງ m ນາທີ ss ວິນາທີ zzzz',
    '_': 'H ໂມງ m ນາທີ ss ວິນາທີ zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, H ໂມງ m ນາທີ ss ວິນາທີ z',
    '_': 'H ໂມງ m ນາທີ ss ວິນາທີ z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, H:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE ທີ d MMMM G y, H ໂມງ m ນາທີ ss ວິນາທີ zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y, H ໂມງ m ນາທີ ss ວິນາທີ z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y, HH:mm–HH:mm',
    '_': 'd/M/y, H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_lt = {
  FULL_DATE: {
    'M': 'y MMMM d, EEEE. – MMMM d, EEEE.',
    'd': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE. – y MMMM d, EEEE.',
    '_': 'y \'m\'. MMMM d \'d\'., EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y \'m\'. MMMM d \'d\'.'
  },
  MEDIUM_DATE: {
    '_': 'y-MM-dd'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y \'m\'. MMMM d \'d\'., EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y \'m\'. MMMM d \'d\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y-MM-dd HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_lv = {
  FULL_DATE: {
    'Md': 'EEEE, y. \'gada\' d. MMMM – EEEE, y. \'gada\' d. MMMM',
    'y': 'EEEE, y. \'gada\' d. MMMM – EEEE, y. \'gada\' d. MMMM',
    '_': 'EEEE, y. \'gada\' d. MMMM'
  },
  LONG_DATE: {
    'M': 'y. \'gada\' d. MMMM – d. MMMM',
    'd': 'y. \'gada\' d.–d. MMMM',
    'y': 'y. \'gada\' d. MMMM – y. \'gada\' d. MMMM',
    '_': 'y. \'gada\' d. MMMM'
  },
  MEDIUM_DATE: {
    'M': 'y. \'gada\' d. MMM – d. MMM',
    'd': 'y. \'gada\' d.–d. MMM',
    'y': 'y. \'gada\' d. MMM – y. \'gada\' d. MMM',
    '_': 'y. \'gada\' d. MMM'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy.–dd.MM.yy.',
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'y.MM.d. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y.MM.d. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y.MM.d. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y.MM.d. HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y. \'gada\' d. MMMM HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y. \'gada\' d. MMMM HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y. \'gada\' d. MMM HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mk = {
  FULL_DATE: {
    'M': 'EEEE, dd MMMM – EEEE, dd MMMM y',
    'd': 'EEEE, dd – EEEE, dd MMMM y',
    'y': 'EEEE, dd MMMM y – EEEE, dd MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd–dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd.M.y – dd.M.y',
    '_': 'dd.M.y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.M.yy – dd.M.yy',
    '_': 'dd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.M.y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.M.yy HH:mm–HH:mm',
    '_': 'dd.M.yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ml = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y, MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y, MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    'y': 'y MMM d – y MMM d',
    '_': 'y, MMM d'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y, MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y, MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y, MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'hm': 'd/M/yy h:mm – h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mn = {
  FULL_DATE: {
    'Mdy': 'EEEE, y/MM/dd – EEEE, y/MM/dd',
    '_': 'EEEE, y \'оны\' MM \'сарын\' d'
  },
  LONG_DATE: {
    'M': 'y/MM/dd – MM/dd',
    'd': 'y/MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'y\'оны\' MMMM\'сарын\' d\'өдөр\''
  },
  MEDIUM_DATE: {
    'M': 'y/MM/dd – MM/dd',
    'd': 'y/MM/d–d',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'M': 'y/MM/dd –MM/dd',
    'd': 'y/MM/dd–dd',
    'y': 'y/MM/dd – y/MM/dd',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y \'оны\' MM \'сарын\' d HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y\'оны\' MMMM\'сарын\' d\'өдөр\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm – HH:mm',
    '_': 'y-MM-dd, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mo = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mr = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'd': 'EEEE, d MMMM y – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y रोजी h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y रोजी h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ms = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/MM/yy h:mm a – h:mm a',
    'hm': 'd/MM/yy h:mm–h:mm a',
    '_': 'd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mt = {
  FULL_DATE: {
    'M': 'EEEE, d \'ta\'’ MMMM – EEEE, d \'ta\'’ MMMM y',
    'd': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d \'ta\'’ MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'd – d MMMM y',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd \'ta\'’ MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'd – d MMM y',
    'y': 'd MMM, y – d MMM, y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'ta\'’ MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'ta\'’ MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_my = {
  FULL_DATE: {
    'Md': 'y MMMM d EEEEနေ့ – MMMM d EEEEနေ့',
    'y': 'y MMMM d EEEEနေ့ – y MMMM d EEEEနေ့',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'My': 'y MMMM d – y MMMM d',
    'd': 'y MMMM d – d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'My': 'y MMM d – y MMM d',
    'd': 'y MMM d – d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd-MM-yy'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y zzzz HH:mm:ss',
    '_': 'zzzz HH:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y z HH:mm:ss',
    '_': 'z HH:mm:ss'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y zzzz HH:mm:ss'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y z HH:mm:ss'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd-MM-yy HH:mm – HH:mm',
    '_': 'dd-MM-yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_nb = {
  FULL_DATE: {
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ne = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    '_': 'y MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd, HH:mm–HH:mm',
    '_': 'y-MM-dd, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_nl = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd-MM-yy – dd-MM-yy',
    '_': 'dd-MM-yy'
  },
  FULL_TIME: {
    'Mdy': 'd-M-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd-M-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd-M-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd-M-y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'om\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'om\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd-MM-yy HH:mm–HH:mm',
    '_': 'dd-MM-yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_no = {
  FULL_DATE: {
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_no_NO = {
  FULL_DATE: {
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_or = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'd-M-yy'
  },
  FULL_TIME: {
    'Mdy': 'd-M-y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd-M-y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd-M-y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd-M-y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd-M-yy h:mm a – h:mm a',
    'hm': 'd-M-yy h:mm–h:mm a',
    '_': 'd-M-yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pa = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm–h:mm a',
    '_': 'd/M/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pl = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'M': 'dd.MM–dd.MM.y',
    'd': 'dd–dd.MM.y',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.MM.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pt = {
  FULL_DATE: {
    'M': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'd': 'EEEE, d – EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y – EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM \'de\' y',
    'd': 'd – d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y HH:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd \'de\' MMM \'de\' y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_BR = {
  FULL_DATE: {
    'M': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'd': 'EEEE, d – EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y – EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM \'de\' y',
    'd': 'd – d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y HH:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd \'de\' MMM \'de\' y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_PT = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y – EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM – d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/yy – dd/MM/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, HH:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y \'às\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y \'às\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm – HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ro = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ru = {
  FULL_DATE: {
    'M': 'ccc, d MMMM – ccc, d MMMM y \'г\'.',
    'd': 'ccc, d – ccc, d MMMM y \'г\'.',
    'y': 'ccc, d MMMM y \'г\'. – ccc, d MMMM y \'г\'.',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y \'г\'.',
    'd': 'd–d MMMM y \'г\'.',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y \'г\'.',
    'd': 'd–d MMM y \'г\'.',
    '_': 'd MMM y \'г\'.'
  },
  SHORT_DATE: {
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, H:mm',
    'ahm': 'H:mm–H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'г\'., H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'г\'., H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'г\'., H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, H:mm–H:mm',
    '_': 'dd.MM.y, H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sh = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y. HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd. MMMM y. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd. MMMM y. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy. HH:mm–HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_si = {
  FULL_DATE: {
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d – d',
    '_': 'y MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'Mdy': 'y-M-d – y-M-d',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d HH.mm',
    'ahm': 'HH.mm–HH.mm',
    '_': 'HH.mm'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE HH.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d HH.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH.mm–HH.mm',
    '_': 'y-MM-dd HH.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sk = {
  FULL_DATE: {
    'M': 'EEEE d. M. – EEEE d. M. y',
    'd': 'EEEE d. – EEEE d. M. y',
    'y': 'EEEE d. M. y – EEEE d. M. y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. M. – d. M. y',
    'd': 'd. – d. M. y',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'd. M. y'
  },
  SHORT_DATE: {
    '_': 'd. M. y'
  },
  FULL_TIME: {
    'Mdy': 'd. M. y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd. M. y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd. M. y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd. M. y, H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y, H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y, H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. M. y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd. M. y, H:mm – H:mm',
    '_': 'd. M. y H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sl = {
  FULL_DATE: {
    'Md': 'EEEE, d. MMMM–EEEE, d. MMMM y',
    'y': 'EEEE, d. MMMM y–EEEE, d. MMMM y',
    '_': 'EEEE, dd. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'M': 'd. M.–d. M. yy',
    'dy': 'd. M. yy–d. M. yy',
    '_': 'd. MM. yy'
  },
  FULL_TIME: {
    'Mdy': 'd. M. y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd. M. y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd. M. y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd. M. y HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd. MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd. MM. yy HH:mm–HH:mm',
    '_': 'd. MM. yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sq = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd.M.yy – d.M.yy',
    '_': 'd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, h:mm:ss a, zzzz',
    '_': 'h:mm:ss a, zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, h:mm:ss a, z',
    '_': 'h:mm:ss a, z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y, h:mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'në\' h:mm:ss a, zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'në\' h:mm:ss a, z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd.M.yy, h:mm a – h:mm a',
    'hm': 'd.M.yy, h:mm – h:mm a',
    '_': 'd.M.yy, h:mm a'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sr = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y. HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd. MMMM y. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd. MMMM y. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy. HH:mm–HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Latn = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y. HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd. MMMM y. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd. MMMM y. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy. HH:mm–HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sv = {
  FULL_DATE: {
    'Md': 'EEEE dd MMMM–EEEE dd MMMM y',
    'y': 'EEEE dd MMMM y–EEEE dd MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM–d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM–d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'M': 'y-MM-dd – MM-dd',
    'd': 'y-MM-dd – dd',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd \'kl\'. HH:mm:ss zzzz',
    '_': '\'kl\'. HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd \'kl\'. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'kl\'. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sw = {
  FULL_DATE: {
    'M': 'EEEE, MMMM d– EEEE, MMMM d y',
    'd': 'EEEE, MMMM d – EEEE, MMMM d y',
    'y': 'EEEE, MMMM d y – EEEE, MMMM d y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'Md': 'MMMM d – d, y',
    'y': 'MMMM d y – MMMM d y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'Md': 'MMM d – d, y',
    'y': 'MMM d y – MMM d y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y – d/M/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ta = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y, a h:mm:ss zzzz',
    '_': 'a h:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y, a h:mm:ss z',
    '_': 'a h:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y, a h:mm:ss',
    '_': 'a h:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y, a h:mm',
    'hm': 'a h:mm–h:mm',
    '_': 'a h:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y ’அன்று’ a h:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y ’அன்று’ a h:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y, a h:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, a h:mm – a h:mm',
    'hm': 'd/M/yy, a h:mm–h:mm',
    '_': 'd/M/yy, a h:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_te = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'y': 'EEEE, d MMMM, y – EEEE, d MMMM, y',
    '_': 'd, MMMM y, EEEE'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd-MM-yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'd, MMMM y, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd-MM-yy h:mm a – h:mm a',
    'hm': 'dd-MM-yy h:mm–h:mm a',
    '_': 'dd-MM-yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_th = {
  FULL_DATE: {
    '_': 'EEEEที่ d MMMM G y'
  },
  LONG_DATE: {
    '_': 'd MMMM G y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y H นาฬิกา mm นาที ss วินาที zzzz',
    '_': 'H นาฬิกา mm นาที ss วินาที zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y H นาฬิกา mm นาที ss วินาที z',
    '_': 'H นาฬิกา mm นาที ss วินาที z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y HH:mm',
    'ahm': 'HH:mm น. – HH:mm น.',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEEที่ d MMMM G y H นาฬิกา mm นาที ss วินาที zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM G y H นาฬิกา mm นาที ss วินาที z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm น. – HH:mm น.',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_tl = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d–d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y, h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y \'nang\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y \'nang\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy, h:mm a – h:mm a',
    'hm': 'M/d/yy, h:mm–h:mm a',
    '_': 'M/d/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_tr = {
  FULL_DATE: {
    '_': 'd MMMM y EEEE'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.y – dd.MM.y',
    '_': 'd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'd MMMM y EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.MM.y HH:mm–HH:mm',
    '_': 'd.MM.y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_uk = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y \'р\'.'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y \'р\'.'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y \'р\'.'
  },
  SHORT_DATE: {
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'р\'. \'о\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'р\'. \'о\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'р\'., HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ur = {
  FULL_DATE: {
    'Md': 'EEEE، d MMMM – EEEE، d MMMM، y',
    '_': 'EEEE، d MMMM، y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM، y',
    'd': 'y MMMM d–d',
    '_': 'd MMMM، y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM، y',
    'd': 'y MMM d–d',
    'y': 'd MMM، y – d MMM، y',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy h:mm a – h:mm a',
    'hm': 'd/M/yy h:mm–h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_uz = {
  FULL_DATE: {
    'Md': 'EEEE, d-MMMM – EEEE, d-MMMM, y',
    '_': 'EEEE, d-MMMM, y'
  },
  LONG_DATE: {
    'M': 'd-MMMM – d-MMMM, y',
    'd': 'd – d-MMMM, y',
    '_': 'd-MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd-MMM – d-MMM, y',
    'd': 'd – d-MMM, y',
    '_': 'd-MMM, y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y, H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, H:mm:ss (z)',
    '_': 'H:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d-MMMM, y, H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd-MMMM, y, H:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'd-MMM, y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm–HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_vi = {
  FULL_DATE: {
    'M': 'EEEE, dd \'tháng\' M – EEEE, dd \'tháng\' M, y',
    'd': 'EEEE, \'ngày\' dd MMMM – EEEE, \'ngày\' dd MMMM \'năm\' y',
    'y': 'EEEE, dd \'tháng\' M, y – EEEE, dd \'tháng\' M, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'HH:mm:ss zzzz, d/M/y',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'HH:mm:ss z, d/M/y',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'HH:mm:ss, d/M/y',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'HH:mm, d/M/y',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'HH:mm:ss zzzz EEEE, d MMMM, y'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z d MMMM, y'
  },
  MEDIUM_DATETIME: {
    '_': 'HH:mm:ss, d MMM, y'
  },
  SHORT_DATETIME: {
    'ahm': 'HH:mm–HH:mm, dd/MM/y',
    '_': 'HH:mm, dd/MM/y'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zh = {
  FULL_DATE: {
    'Mdy': 'y/M/dEEEE至y/M/dEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d zzzz ah:mm:ss',
    '_': 'zzzz ah:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d z ah:mm:ss',
    '_': 'z ah:mm:ss'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d ah:mm',
    'a': 'ah:mm至ah:mm',
    'hm': 'ah:mm至h:mm',
    '_': 'ah:mm'
  },
  FULL_DATETIME: {
    '_': 'y年M月d日EEEE zzzz ah:mm:ss'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 z ah:mm:ss'
  },
  MEDIUM_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'y/M/d ah:mm至ah:mm',
    'hm': 'y/M/d ah:mm至h:mm',
    '_': 'y/M/d ah:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_CN = {
  FULL_DATE: {
    'Mdy': 'y/M/dEEEE至y/M/dEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d zzzz ah:mm:ss',
    '_': 'zzzz ah:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d z ah:mm:ss',
    '_': 'z ah:mm:ss'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d ah:mm',
    'a': 'ah:mm至ah:mm',
    'hm': 'ah:mm至h:mm',
    '_': 'ah:mm'
  },
  FULL_DATETIME: {
    '_': 'y年M月d日EEEE zzzz ah:mm:ss'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 z ah:mm:ss'
  },
  MEDIUM_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'y/M/d ah:mm至ah:mm',
    'hm': 'y/M/d ah:mm至h:mm',
    '_': 'y/M/d ah:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_HK = {
  FULL_DATE: {
    'Mdy': 'd/M/y（EEEE） 至 d/M/y（EEEE）',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'd/M/y 至 d/M/y',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y 至 d/M/y',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y 至 d/M/y',
    '_': 'd/M/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y ah:mm:ss [zzzz]',
    '_': 'ah:mm:ss [zzzz]'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y ah:mm:ss [z]',
    '_': 'ah:mm:ss [z]'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y ah:mm',
    'a': 'ah:mm至ah:mm',
    'hm': 'ah:mm至h:mm',
    '_': 'ah:mm'
  },
  FULL_DATETIME: {
    '_': 'y年M月d日EEEE ah:mm:ss [zzzz]'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss [z]'
  },
  MEDIUM_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'd/M/y ah:mm至ah:mm',
    'hm': 'd/M/y ah:mm至h:mm',
    '_': 'd/M/y ah:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_TW = {
  FULL_DATE: {
    'Mdy': 'y/M/dEEEE至y/M/dEEEE',
    '_': 'y年M月d日 EEEE'
  },
  LONG_DATE: {
    'Mdy': 'y/M/d至y/M/d',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'y/M/d至y/M/d',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'Mdy': 'y/M/d至y/M/d',
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d ah:mm:ss [zzzz]',
    '_': 'ah:mm:ss [zzzz]'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d ah:mm:ss [z]',
    '_': 'ah:mm:ss [z]'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d ah:mm',
    'a': 'ah:mm至ah:mm',
    'hm': 'ah:mm至h:mm',
    '_': 'ah:mm'
  },
  FULL_DATETIME: {
    '_': 'y年M月d日 EEEE ah:mm:ss [zzzz]'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss [z]'
  },
  MEDIUM_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'y/M/d ah:mm至ah:mm',
    'hm': 'y/M/d ah:mm至h:mm',
    '_': 'y/M/d ah:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zu = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'M/d/yy HH:mm – HH:mm',
    '_': 'M/d/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

if (goog.LOCALE == 'af') {
  defaultSymbols = exports.DateIntervalSymbols_af;
} else if (goog.LOCALE == 'am') {
  defaultSymbols = exports.DateIntervalSymbols_am;
} else if (goog.LOCALE == 'ar') {
  defaultSymbols = exports.DateIntervalSymbols_ar;
} else if (goog.LOCALE == 'ar_DZ' || goog.LOCALE == 'ar-DZ') {
  defaultSymbols = exports.DateIntervalSymbols_ar_DZ;
} else if (goog.LOCALE == 'az') {
  defaultSymbols = exports.DateIntervalSymbols_az;
} else if (goog.LOCALE == 'be') {
  defaultSymbols = exports.DateIntervalSymbols_be;
} else if (goog.LOCALE == 'bg') {
  defaultSymbols = exports.DateIntervalSymbols_bg;
} else if (goog.LOCALE == 'bn') {
  defaultSymbols = exports.DateIntervalSymbols_bn;
} else if (goog.LOCALE == 'br') {
  defaultSymbols = exports.DateIntervalSymbols_br;
} else if (goog.LOCALE == 'bs') {
  defaultSymbols = exports.DateIntervalSymbols_bs;
} else if (goog.LOCALE == 'ca') {
  defaultSymbols = exports.DateIntervalSymbols_ca;
} else if (goog.LOCALE == 'chr') {
  defaultSymbols = exports.DateIntervalSymbols_chr;
} else if (goog.LOCALE == 'cs') {
  defaultSymbols = exports.DateIntervalSymbols_cs;
} else if (goog.LOCALE == 'cy') {
  defaultSymbols = exports.DateIntervalSymbols_cy;
} else if (goog.LOCALE == 'da') {
  defaultSymbols = exports.DateIntervalSymbols_da;
} else if (goog.LOCALE == 'de') {
  defaultSymbols = exports.DateIntervalSymbols_de;
} else if (goog.LOCALE == 'de_AT' || goog.LOCALE == 'de-AT') {
  defaultSymbols = exports.DateIntervalSymbols_de_AT;
} else if (goog.LOCALE == 'de_CH' || goog.LOCALE == 'de-CH') {
  defaultSymbols = exports.DateIntervalSymbols_de_CH;
} else if (goog.LOCALE == 'el') {
  defaultSymbols = exports.DateIntervalSymbols_el;
} else if (goog.LOCALE == 'en') {
  defaultSymbols = exports.DateIntervalSymbols_en;
} else if (goog.LOCALE == 'en_AU' || goog.LOCALE == 'en-AU') {
  defaultSymbols = exports.DateIntervalSymbols_en_AU;
} else if (goog.LOCALE == 'en_CA' || goog.LOCALE == 'en-CA') {
  defaultSymbols = exports.DateIntervalSymbols_en_CA;
} else if (goog.LOCALE == 'en_GB' || goog.LOCALE == 'en-GB') {
  defaultSymbols = exports.DateIntervalSymbols_en_GB;
} else if (goog.LOCALE == 'en_IE' || goog.LOCALE == 'en-IE') {
  defaultSymbols = exports.DateIntervalSymbols_en_IE;
} else if (goog.LOCALE == 'en_IN' || goog.LOCALE == 'en-IN') {
  defaultSymbols = exports.DateIntervalSymbols_en_IN;
} else if (goog.LOCALE == 'en_SG' || goog.LOCALE == 'en-SG') {
  defaultSymbols = exports.DateIntervalSymbols_en_SG;
} else if (goog.LOCALE == 'en_US' || goog.LOCALE == 'en-US') {
  defaultSymbols = exports.DateIntervalSymbols_en_US;
} else if (goog.LOCALE == 'en_ZA' || goog.LOCALE == 'en-ZA') {
  defaultSymbols = exports.DateIntervalSymbols_en_ZA;
} else if (goog.LOCALE == 'es') {
  defaultSymbols = exports.DateIntervalSymbols_es;
} else if (goog.LOCALE == 'es_419' || goog.LOCALE == 'es-419') {
  defaultSymbols = exports.DateIntervalSymbols_es_419;
} else if (goog.LOCALE == 'es_ES' || goog.LOCALE == 'es-ES') {
  defaultSymbols = exports.DateIntervalSymbols_es_ES;
} else if (goog.LOCALE == 'es_MX' || goog.LOCALE == 'es-MX') {
  defaultSymbols = exports.DateIntervalSymbols_es_MX;
} else if (goog.LOCALE == 'es_US' || goog.LOCALE == 'es-US') {
  defaultSymbols = exports.DateIntervalSymbols_es_US;
} else if (goog.LOCALE == 'et') {
  defaultSymbols = exports.DateIntervalSymbols_et;
} else if (goog.LOCALE == 'eu') {
  defaultSymbols = exports.DateIntervalSymbols_eu;
} else if (goog.LOCALE == 'fa') {
  defaultSymbols = exports.DateIntervalSymbols_fa;
} else if (goog.LOCALE == 'fi') {
  defaultSymbols = exports.DateIntervalSymbols_fi;
} else if (goog.LOCALE == 'fil') {
  defaultSymbols = exports.DateIntervalSymbols_fil;
} else if (goog.LOCALE == 'fr') {
  defaultSymbols = exports.DateIntervalSymbols_fr;
} else if (goog.LOCALE == 'fr_CA' || goog.LOCALE == 'fr-CA') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CA;
} else if (goog.LOCALE == 'ga') {
  defaultSymbols = exports.DateIntervalSymbols_ga;
} else if (goog.LOCALE == 'gl') {
  defaultSymbols = exports.DateIntervalSymbols_gl;
} else if (goog.LOCALE == 'gsw') {
  defaultSymbols = exports.DateIntervalSymbols_gsw;
} else if (goog.LOCALE == 'gu') {
  defaultSymbols = exports.DateIntervalSymbols_gu;
} else if (goog.LOCALE == 'haw') {
  defaultSymbols = exports.DateIntervalSymbols_haw;
} else if (goog.LOCALE == 'he') {
  defaultSymbols = exports.DateIntervalSymbols_he;
} else if (goog.LOCALE == 'hi') {
  defaultSymbols = exports.DateIntervalSymbols_hi;
} else if (goog.LOCALE == 'hr') {
  defaultSymbols = exports.DateIntervalSymbols_hr;
} else if (goog.LOCALE == 'hu') {
  defaultSymbols = exports.DateIntervalSymbols_hu;
} else if (goog.LOCALE == 'hy') {
  defaultSymbols = exports.DateIntervalSymbols_hy;
} else if (goog.LOCALE == 'id') {
  defaultSymbols = exports.DateIntervalSymbols_id;
} else if (goog.LOCALE == 'in') {
  defaultSymbols = exports.DateIntervalSymbols_in;
} else if (goog.LOCALE == 'is') {
  defaultSymbols = exports.DateIntervalSymbols_is;
} else if (goog.LOCALE == 'it') {
  defaultSymbols = exports.DateIntervalSymbols_it;
} else if (goog.LOCALE == 'iw') {
  defaultSymbols = exports.DateIntervalSymbols_iw;
} else if (goog.LOCALE == 'ja') {
  defaultSymbols = exports.DateIntervalSymbols_ja;
} else if (goog.LOCALE == 'ka') {
  defaultSymbols = exports.DateIntervalSymbols_ka;
} else if (goog.LOCALE == 'kk') {
  defaultSymbols = exports.DateIntervalSymbols_kk;
} else if (goog.LOCALE == 'km') {
  defaultSymbols = exports.DateIntervalSymbols_km;
} else if (goog.LOCALE == 'kn') {
  defaultSymbols = exports.DateIntervalSymbols_kn;
} else if (goog.LOCALE == 'ko') {
  defaultSymbols = exports.DateIntervalSymbols_ko;
} else if (goog.LOCALE == 'ky') {
  defaultSymbols = exports.DateIntervalSymbols_ky;
} else if (goog.LOCALE == 'ln') {
  defaultSymbols = exports.DateIntervalSymbols_ln;
} else if (goog.LOCALE == 'lo') {
  defaultSymbols = exports.DateIntervalSymbols_lo;
} else if (goog.LOCALE == 'lt') {
  defaultSymbols = exports.DateIntervalSymbols_lt;
} else if (goog.LOCALE == 'lv') {
  defaultSymbols = exports.DateIntervalSymbols_lv;
} else if (goog.LOCALE == 'mk') {
  defaultSymbols = exports.DateIntervalSymbols_mk;
} else if (goog.LOCALE == 'ml') {
  defaultSymbols = exports.DateIntervalSymbols_ml;
} else if (goog.LOCALE == 'mn') {
  defaultSymbols = exports.DateIntervalSymbols_mn;
} else if (goog.LOCALE == 'mo') {
  defaultSymbols = exports.DateIntervalSymbols_mo;
} else if (goog.LOCALE == 'mr') {
  defaultSymbols = exports.DateIntervalSymbols_mr;
} else if (goog.LOCALE == 'ms') {
  defaultSymbols = exports.DateIntervalSymbols_ms;
} else if (goog.LOCALE == 'mt') {
  defaultSymbols = exports.DateIntervalSymbols_mt;
} else if (goog.LOCALE == 'my') {
  defaultSymbols = exports.DateIntervalSymbols_my;
} else if (goog.LOCALE == 'nb') {
  defaultSymbols = exports.DateIntervalSymbols_nb;
} else if (goog.LOCALE == 'ne') {
  defaultSymbols = exports.DateIntervalSymbols_ne;
} else if (goog.LOCALE == 'nl') {
  defaultSymbols = exports.DateIntervalSymbols_nl;
} else if (goog.LOCALE == 'no') {
  defaultSymbols = exports.DateIntervalSymbols_no;
} else if (goog.LOCALE == 'no_NO' || goog.LOCALE == 'no-NO') {
  defaultSymbols = exports.DateIntervalSymbols_no_NO;
} else if (goog.LOCALE == 'or') {
  defaultSymbols = exports.DateIntervalSymbols_or;
} else if (goog.LOCALE == 'pa') {
  defaultSymbols = exports.DateIntervalSymbols_pa;
} else if (goog.LOCALE == 'pl') {
  defaultSymbols = exports.DateIntervalSymbols_pl;
} else if (goog.LOCALE == 'pt') {
  defaultSymbols = exports.DateIntervalSymbols_pt;
} else if (goog.LOCALE == 'pt_BR' || goog.LOCALE == 'pt-BR') {
  defaultSymbols = exports.DateIntervalSymbols_pt_BR;
} else if (goog.LOCALE == 'pt_PT' || goog.LOCALE == 'pt-PT') {
  defaultSymbols = exports.DateIntervalSymbols_pt_PT;
} else if (goog.LOCALE == 'ro') {
  defaultSymbols = exports.DateIntervalSymbols_ro;
} else if (goog.LOCALE == 'ru') {
  defaultSymbols = exports.DateIntervalSymbols_ru;
} else if (goog.LOCALE == 'sh') {
  defaultSymbols = exports.DateIntervalSymbols_sh;
} else if (goog.LOCALE == 'si') {
  defaultSymbols = exports.DateIntervalSymbols_si;
} else if (goog.LOCALE == 'sk') {
  defaultSymbols = exports.DateIntervalSymbols_sk;
} else if (goog.LOCALE == 'sl') {
  defaultSymbols = exports.DateIntervalSymbols_sl;
} else if (goog.LOCALE == 'sq') {
  defaultSymbols = exports.DateIntervalSymbols_sq;
} else if (goog.LOCALE == 'sr') {
  defaultSymbols = exports.DateIntervalSymbols_sr;
} else if (goog.LOCALE == 'sr_Latn' || goog.LOCALE == 'sr-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Latn;
} else if (goog.LOCALE == 'sv') {
  defaultSymbols = exports.DateIntervalSymbols_sv;
} else if (goog.LOCALE == 'sw') {
  defaultSymbols = exports.DateIntervalSymbols_sw;
} else if (goog.LOCALE == 'ta') {
  defaultSymbols = exports.DateIntervalSymbols_ta;
} else if (goog.LOCALE == 'te') {
  defaultSymbols = exports.DateIntervalSymbols_te;
} else if (goog.LOCALE == 'th') {
  defaultSymbols = exports.DateIntervalSymbols_th;
} else if (goog.LOCALE == 'tl') {
  defaultSymbols = exports.DateIntervalSymbols_tl;
} else if (goog.LOCALE == 'tr') {
  defaultSymbols = exports.DateIntervalSymbols_tr;
} else if (goog.LOCALE == 'uk') {
  defaultSymbols = exports.DateIntervalSymbols_uk;
} else if (goog.LOCALE == 'ur') {
  defaultSymbols = exports.DateIntervalSymbols_ur;
} else if (goog.LOCALE == 'uz') {
  defaultSymbols = exports.DateIntervalSymbols_uz;
} else if (goog.LOCALE == 'vi') {
  defaultSymbols = exports.DateIntervalSymbols_vi;
} else if (goog.LOCALE == 'zh') {
  defaultSymbols = exports.DateIntervalSymbols_zh;
} else if (goog.LOCALE == 'zh_CN' || goog.LOCALE == 'zh-CN') {
  defaultSymbols = exports.DateIntervalSymbols_zh_CN;
} else if (goog.LOCALE == 'zh_HK' || goog.LOCALE == 'zh-HK') {
  defaultSymbols = exports.DateIntervalSymbols_zh_HK;
} else if (goog.LOCALE == 'zh_TW' || goog.LOCALE == 'zh-TW') {
  defaultSymbols = exports.DateIntervalSymbols_zh_TW;
} else if (goog.LOCALE == 'zu') {
  defaultSymbols = exports.DateIntervalSymbols_zu;
} else {
  defaultSymbols = exports.DateIntervalSymbols_en;
}
