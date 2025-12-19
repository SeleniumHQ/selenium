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
 * File generated from CLDR ver. 35.1
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
let DateIntervalPatternMap;

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
let DateIntervalSymbols;

/** @typedef {!DateIntervalSymbols} */
exports.DateIntervalSymbols;

/** @type {!DateIntervalSymbols} */
let defaultSymbols;

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
    'G': 'EEEE d MMMM y G – EEEE d MMMM y G',
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE dd MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'G': 'y-M-d GGGGG – y-M-d GGGGG',
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
    '_': 'EEEE dd MMMM y HH:mm:ss zzzz'
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
    'G': 'G EEEE፣ MMMM d፣ y – G EEEE፣ MMMM d፣ y',
    'Md': 'EEEE MMMM d – EEEE MMMM d፣ y',
    'y': 'EEEE፣ MMMM d፣ y – EEEE፣ MMMM d፣ y',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'G': 'G MMMM d፣ y – G MMMM d፣ y',
    'M': 'MMMM d – MMMM d፣ y',
    'd': 'MMMM d–d፣ y',
    'y': 'MMMM d፣ y – MMMM d፣ y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G MMM d፣ y – G MMM d፣ y',
    'M': 'MMM d – MMM d፣ y',
    'd': 'MMM d–d፣ y',
    'y': 'MMM d፣ y – MMM d፣ y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG d/M/y – GGGGG d/M/y',
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
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE، d MMMM – EEEE، d MMMM، y',
    'd': 'EEEE، d – EEEE، d MMMM، y',
    'y': 'EEEE، d MMMM، y – EEEE، d MMMM، y',
    '_': 'EEEE، d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM، y',
    'd': 'd–d MMMM، y',
    'y': 'd MMMM، y – d MMMM، y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd‏/M‏/y – d‏/M‏/y',
    '_': 'dd‏/MM‏/y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    '_': 'EEEE، d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
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
exports.DateIntervalSymbols_ar_DZ = exports.DateIntervalSymbols_ar;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_EG = exports.DateIntervalSymbols_ar;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_az = {
  FULL_DATE: {
    'G': 'G d MMMM y, EEEE – d MMMM y, EEEE',
    'Md': 'd MMMM y, EEEE – d MMMM, EEEE',
    '_': 'd MMMM y, EEEE'
  },
  LONG_DATE: {
    'G': 'G d MMMM y – G d MMMM y',
    'M': 'd MMMM y – d MMMM',
    'd': 'y MMMM d–d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G d MMM y – G d MMM y',
    'M': 'd MMM y – d MMM',
    'd': 'y MMM d–d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd.MM.yy – GGGGG dd.MM.yy',
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
    'G': 'EEEE, d MMMM, y G – EEEE, d MMMM, y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'G': 'd MMMM, y G – d MMMM, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
    'Mdy': 'd.M.y – d.M.y',
    '_': 'd.MM.y'
  },
  SHORT_DATE: {
    'G': 'd.M.yy GGGGG – d.M.yy GGGGG',
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
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y \'г\'.',
    'd': 'd – d MMMM y \'г\'.',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'G': 'dd.MM.y GGGGG – dd.MM.y GGGGG',
    'Md': 'd.MM – d.MM.y \'г\'.',
    '_': 'd.MM.y \'г\'.'
  },
  SHORT_DATE: {
    'G': 'dd.MM.yy GGGGG – dd.MM.yy GGGGG',
    'Md': 'd.MM – d.MM.yy \'г\'.',
    '_': 'd.MM.yy \'г\'.'
  },
  FULL_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss \'ч\'. zzzz',
    '_': 'H:mm:ss \'ч\'. zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss \'ч\'. z',
    '_': 'H:mm:ss \'ч\'. z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm:ss \'ч\'.',
    '_': 'H:mm:ss \'ч\'.'
  },
  SHORT_TIME: {
    'Mdy': 'd.MM.y \'г\'., H:mm \'ч\'.',
    '_': 'H:mm \'ч\'.'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'г\'., H:mm:ss \'ч\'. zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'г\'., H:mm:ss \'ч\'. z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.MM.y \'г\'., H:mm:ss \'ч\'.'
  },
  SHORT_DATETIME: {
    'ahm': 'd.MM.yy \'г\'., H:mm \'ч\'. – H:mm \'ч\'.',
    '_': 'd.MM.yy \'г\'., H:mm \'ч\'.'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_bn = {
  FULL_DATE: {
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'da\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'da\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_bs = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y.',
    'd': 'EEEE, d. – EEEE, d. MMMM y.',
    'y': 'EEEE, d. MMMM y. – EEEE, d. MMMM y.',
    '_': 'EEEE, d. MMMM y.'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd. MMMM – d. MMMM y.',
    'd': 'd. – d. MMMM y.',
    'y': 'd. MMMM y. – d. MMMM y.',
    '_': 'd. MMMM y.'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y.',
    'd': 'd. – d. MMM y.',
    'y': 'd. MMM y. – d. MMM y.',
    '_': 'd. MMM y.'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'd. M. y.'
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
    '_': 'd. MMM y. HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y. HH:mm – HH:mm',
    '_': 'd. M. y. HH:mm'
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
    'G': 'd MMMM, y G – d MMMM, y G',
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd–d MMMM \'de\' y',
    'y': 'd MMMM \'de\' y – d MMMM \'de\' y',
    '_': 'd MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM, y G – d MMM, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy GGGGG – d/M/yy GGGGG',
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
    'ahm': 'H:mm–H:mm',
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
    'ahm': 'd/M/yy, H:mm–H:mm',
    '_': 'd/M/yy H:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_chr = {
  FULL_DATE: {
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'EEEE d. M. y G – EEEE d. M. y G',
    'Md': 'EEEE d. M. – EEEE d. M. y',
    'y': 'EEEE d. M. y – EEEE d. M. y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. M. y G – d. M. y G',
    'M': 'd. M. – d. M. y',
    'd': 'd.–d. M. y',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd. M. y GGGGG – d. M. y GGGGG',
    'Mdy': 'dd.MM.y – dd.MM.y',
    '_': 'd. M. y'
  },
  SHORT_DATE: {
    'G': 'd. M. yy GGGGG – d. M. yy GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM, y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM, y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'ahm': 'dd/MM/yy HH:mm – HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_da = {
  FULL_DATE: {
    'G': 'G EEEE d. MMMM y–G EEEE d. MMMM y',
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    'y': 'EEEE d. MMMM y–EEEE d. MMMM y',
    '_': 'EEEE \'den\' d. MMMM y'
  },
  LONG_DATE: {
    'G': 'G d. MMMM y–G d. MMMM y',
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G d. MMM y–G d. MMM y',
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd.MM.y–GGGGG dd.MM.y',
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y HH.mm',
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
    'ahm': 'dd.MM.y HH.mm–HH.mm',
    '_': 'dd.MM.y HH.mm'
  },
  FALLBACK: '{0}-{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_de = {
  FULL_DATE: {
    'G': 'EEEE, d. MMMM y G – EEEE EEEE, d. MMMM y G',
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. MMMM y G – d. MMMM y G',
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'dd.MM.y GGGGG – dd.MM.y GGGGG',
    'M': 'dd.MM. – dd.MM.y',
    'd': 'dd.–dd.MM.y',
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    'G': 'dd.MM.yy GGGGG – dd.MM.yy GGGGG',
    'M': 'dd.MM. – dd.MM.yy',
    'd': 'dd.–dd.MM.yy',
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
exports.DateIntervalSymbols_de_AT = exports.DateIntervalSymbols_de;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_de_CH = exports.DateIntervalSymbols_de;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_el = {
  FULL_DATE: {
    'G': 'EEEE d MMMM y G – EEEE d MMMM y G',
    'Md': 'EEEE, dd MMMM – EEEE, dd MMMM y',
    'y': 'EEEE, dd MMMM y – EEEE, dd MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd–dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd-MM-yy GGGGG – dd-MM-yy GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'M/d/y GGGGG – M/d/y GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'M/d/y GGGGG – M/d/y GGGGG',
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
    'ahm': 'HH:mm–HH:mm',
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
    'ahm': 'dd/MM/y, HH:mm–HH:mm',
    '_': 'dd/MM/y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IE = {
  FULL_DATE: {
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'M/d/y GGGGG – M/d/y GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    '_': 'EEEE, d MMMM, y \'at\' h:mm:ss a zzzz'
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
exports.DateIntervalSymbols_en_US = exports.DateIntervalSymbols_en;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_en_ZA = {
  FULL_DATE: {
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'G': 'M/d/y GGGGG – M/d/y GGGGG',
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
    'G': 'MMMM d y G – MMMM d y G',
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d y G – MMM d y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'yy-MM-dd GGGGG – yy-MM-dd GGGGG',
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
    'G': 'd MMMM \'de\' y G – d MMMM \'de\' y G',
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd/MM/yy GGGGG – dd/MM/yy GGGGG',
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
exports.DateIntervalSymbols_es_ES = exports.DateIntervalSymbols_es;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_es_MX = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'G': 'd \'de\' MMMM \'de\' y G – d \'de\' MMMM \'de\' y G',
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'd \'de\' MMM \'de\' y G – d \'de\' MMM \'de\' y G',
    'M': 'd \'de\' MMM – d \'de\' MMM y',
    'd': 'd–d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd/MM/yy GGGGG – dd/MM/yy GGGGG',
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y H:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy H:mm'
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
    'G': 'd MMMM \'de\' y G – d MMMM \'de\' y G',
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM – d \'de\' MMM y',
    'd': 'd–d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd/MM/y GGGGG – dd/MM/y GGGGG',
    '_': 'd/M/y'
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
    'hm': 'h:mm–h:mm a',
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
    'a': 'd/M/y h:mm a – h:mm a',
    'hm': 'd/M/y h:mm–h:mm a',
    '_': 'd/M/y h:mm a'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_et = {
  FULL_DATE: {
    'G': 'EEEE, d. MMMM y G – EEEE, d. MMMM y G',
    'Md': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. MMMM y G – d. MMMM y G',
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd. MMM y G – d. MMM y G',
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
    'Mdy': 'dd.MM.yy–dd.MM.yy',
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
    '_': 'd. MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_eu = {
  FULL_DATE: {
    'G': 'G y, MMMM d, EEEE – G y, MMMM d, EEEE',
    'M': 'y(\'e\')\'ko\' MMMM d, EEEE – MMMM d, EEEE',
    'dy': 'y(\'e\')\'ko\' MMMM d, EEEE – y(\'e\')\'ko\' MMMM d, EEEE',
    '_': 'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\'), EEEE'
  },
  LONG_DATE: {
    'G': 'G y, MMMM d – G y, MMMM d',
    'M': 'y(\'e\')\'ko\' MMMM d – MMMM d',
    'd': 'y(\'e\')\'ko\' MMMM d–d',
    'y': 'y(\'e\')\'ko\' MMMM d – y(\'e\')\'ko\' MMMM d',
    '_': 'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\')'
  },
  MEDIUM_DATE: {
    'G': 'G y, MMM d – G y, MMM d',
    'M': 'y(\'e\')\'ko\' MMM d – MMM d',
    'd': 'y(\'e\')\'ko\' MMM d–d',
    'y': 'y(\'e\')\'ko\' MMM d – y(\'e\')\'ko\' MMM d',
    '_': 'y(\'e\')\'ko\' MMM d(\'a\')'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    '_': 'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\'), EEEE HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'y(\'e\')\'ko\' MMMM\'ren\' d(\'a\') HH:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'y(\'e\')\'ko\' MMM d(\'a\') HH:mm:ss'
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE d LLLL تا EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd LLLL تا d MMMM y',
    'd': 'd تا d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd LLL تا d MMM y',
    'd': 'd تا d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'd.–d. MMMM, y G',
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
    'M': 'd.M.–d.M.y',
    'd': 'd.–d.M.y',
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d–d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'EEEE d MMMM y G \'à\' EEEE d MMMM y G',
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G \'à\' d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G \'à\' d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/y G \'à\' d/M/y G',
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
    'G': 'EEEE d MMMM y G – EEEE d MMMM y G',
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'yy-MM-dd GGGGG – yy-MM-dd GGGGG',
    '_': 'yy-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd HH \'h\' mm \'min\' ss \'s\' zzzz',
    '_': 'HH \'h\' mm \'min\' ss \'s\' zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd HH \'h\' mm \'min\' ss \'s\' z',
    '_': 'HH \'h\' mm \'min\' ss \'s\' z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd HH \'h\' mm \'min\' ss \'s\'',
    '_': 'HH \'h\' mm \'min\' ss \'s\''
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd HH \'h\' mm',
    'ahm': 'H \'h\' mm – H \'h\' mm',
    '_': 'HH \'h\' mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' HH \'h\' mm \'min\' ss \'s\' zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH \'h\' mm \'min\' ss \'s\' z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH \'h\' mm \'min\' ss \'s\''
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'EEEE, d \'de\' MMMM \'de\' y G – EEEE, d \'de\' MMMM \'de\' y G',
    'M': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'd': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'G': 'd \'de\' MMMM \'de\' y G – d \'de\' MMMM \'de\' y G',
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'd \'de\' MMM \'de\' y G – d \'de\' MMM \'de\' y G',
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd MMM y – d MMM y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  SHORT_DATE: {
    'G': 'dd/MM/yy GGGGG – dd/MM/yy GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y d MMMM, EEEE – G y d MMMM, EEEE',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'G y d MMMM – G y d MMMM',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'G y d MMM – G y d MMM',
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-dd-MM – GGGGG yy-dd-MM',
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
    '_': 'EEEE, d MMMM, y એ hh:mm:ss a zzzz વાગ્યે'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y એ hh:mm:ss a z વાગ્યે'
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'EEEE, d בMMMM y G – EEEE, d בMMMM y G',
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, d בMMMM y'
  },
  LONG_DATE: {
    'G': 'd בMMMM y G – d בMMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d בMMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd בMMM y G – d בMMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  SHORT_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
exports.DateIntervalSymbols_hr = {
  FULL_DATE: {
    'G': 'EEEE, dd. MMMM y. G – EEEE, dd. MMMM y. G',
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    'y': 'EEEE, dd. MMMM y. – EEEE, dd. MMMM y.',
    '_': 'EEEE, d. MMMM y.'
  },
  LONG_DATE: {
    'G': 'dd. MMMM y. G – dd. MMMM y. G',
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd. – dd. MMMM y.',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'd. MMMM y.'
  },
  MEDIUM_DATE: {
    'G': 'dd. MMM y. G – dd. MMM y. G',
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd. – dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'd. MMM y.'
  },
  SHORT_DATE: {
    'G': 'dd. MM. y. GGGGG – dd. MM. y. GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'y. MMMM d., EEEE – MMMM d., EEEE',
    'd': 'y. MMMM d., EEEE – d., EEEE',
    '_': 'y. MMMM d., EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y. MMMM d. – MMMM d.',
    'd': 'y. MMMM d–d.',
    '_': 'y. MMMM d.'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y. MMM d. – MMM d.',
    'd': 'y. MMM d–d.',
    '_': 'y. MMM d.'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'G EEEE, d MMMM – G EEEE, d MMMM, y թ.',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y թ.',
    'y': 'EEEE, d MMMM, y – EEEE, d MMMM, y թ.',
    '_': 'y թ. MMMM d, EEEE'
  },
  LONG_DATE: {
    'G': 'G dd MMMM, y թ․ – G dd MMMM, y թ.',
    'M': 'dd MMMM – dd MMMM, y թ.',
    'd': 'dd–dd MMMM, y թ.',
    'y': 'dd MMMM, y թ․ – dd MMMM, y թ.',
    '_': 'dd MMMM, y թ.'
  },
  MEDIUM_DATE: {
    'G': 'G dd MMM, y թ․ – G dd MMM, y թ.',
    'M': 'dd MMM – dd MMM, y թ.',
    'd': 'dd–dd MMM, y թ.',
    'y': 'dd MMM, y թ․ – dd MMM, y թ.',
    '_': 'dd MMM, y թ.'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd.MM.yy – GGGGG dd.MM.yy',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy GGGGG – d/M/yy GGGGG',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy GGGGG – d/M/yy GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'EEEE d MMMM y G – EEEE d MMMM y G',
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd–dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy GGGGG – d/M/yy GGGGG',
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
    '_': 'd MMM y, HH:mm:ss'
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
    'G': 'EEEE, d בMMMM y G – EEEE, d בMMMM y G',
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, d בMMMM y'
  },
  LONG_DATE: {
    'G': 'd בMMMM y G – d בMMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d בMMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd בMMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd בMMM y G – d בMMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d בMMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd בMMM y'
  },
  SHORT_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
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
    'G': 'Gy/MM/dd(EEEE)～Gy/MM/dd(EEEE)',
    'Mdy': 'y/MM/dd(EEEE)～y/MM/dd(EEEE)',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'G': 'Gy/MM/dd～Gy/MM/dd',
    'Mdy': 'y/MM/dd～y/MM/dd',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'G': 'Gy/MM/dd～Gy/MM/dd',
    '_': 'y/MM/dd'
  },
  SHORT_DATE: {
    'G': 'Gy/MM/dd～Gy/MM/dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d MMMM. – EEEE, d MMMM. y',
    'y': 'EEEE, d MMMM. y – EEEE, d MMMM. y',
    '_': 'EEEE, dd MMMM, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'dd MMMM. – dd MMMM. y',
    'd': 'd–d MMMM, y',
    'y': 'dd MMMM. y – d MMMM. y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd MMM. – dd MMM. y',
    'd': 'd–d MMM, y',
    'y': 'dd MMM. y – d MMM. y',
    '_': 'd MMM. y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y \'ж\'. d MMMM, EEEE – G y \'ж\'. d MMMM, EEEE',
    'M': 'y \'ж\'. d MMMM, EEEE – d MMMM, EEEE',
    'dy': 'y \'ж\'. d MMMM, EEEE – y \'ж\'. d MMMM, EEEE',
    '_': 'y \'ж\'. d MMMM, EEEE'
  },
  LONG_DATE: {
    'G': 'G y \'ж\'. d MMMM – G y \'ж\'. d MMMM',
    'M': 'y \'ж\'. d MMMM – d MMMM',
    'd': 'y \'ж\'. d–d MMMM',
    'y': 'y \'ж\'. d MMMM – y \'ж\'. d MMMM',
    '_': 'y \'ж\'. d MMMM'
  },
  MEDIUM_DATE: {
    'G': 'G y \'ж\'. d MMM – G y \'ж\'. d MMM',
    'M': 'y \'ж\'. d MMM – d MMM',
    'd': 'y \'ж\'. d–d MMM',
    'y': 'y \'ж\'. d MMM – y \'ж\'. d MMM',
    '_': 'y \'ж\'. dd MMM'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE dd MMMM y – EEEE dd MMMM y',
    'y': 'EEEE dd-MM-y – EEEE dd MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, MMMM d – EEEE, MMMM d, y',
    'd': 'EEEE, MMMM d – EEEE, MMMM d,y',
    'y': 'd MMMM, y EEEE – d MMMM, y EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM, y',
    'd': 'MMMM d–d,y',
    'y': 'd, MMMM, y – d, MMMM, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM, y',
    'd': 'MMM d–d,y',
    'y': 'd, MMM, y – d, MMM, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'GGGGG y년 M월 d일 EEEE요일 ~ GGGGG y년 M월 d일 EEEE요일',
    'Mdy': 'y. M. d. (EEEE) ~ y. M. d. (EEEE)',
    '_': 'y년 M월 d일 EEEE'
  },
  LONG_DATE: {
    'G': 'GGGGG y년 M월 d일 ~ GGGGG y년 M월 d일',
    'Mdy': 'y. M. d. ~ y. M. d.',
    '_': 'y년 M월 d일'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y년 M월 d일 ~ GGGGG y년 M월 d일',
    '_': 'y. M. d.'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy년 M월 d일 ~ GGGGG yy년 M월 d일',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'y-\'ж\'., d-MMMM, EEEE – d-MMMM EEEE',
    'd': 'y-\'ж\'., d-MMMM, EEEE – d-MMMM, EEEE',
    'y': 'y-\'ж\'., d-MMMM, EEEE – y-\'ж\'., d-MMMM, EEEE',
    '_': 'y-\'ж\'., d-MMMM, EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd-MMMM – d-MMMM y-\'ж\'.',
    'd': 'd–d-MMMM y-\'ж\'.',
    'y': 'd-MMMM y-\'ж\'. - d-MMMM y-\'ж\'.',
    '_': 'y-\'ж\'., d-MMMM'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd-MMM – d-MMM y-\'ж\'.',
    'd': 'd–d-MMM y-\'ж\'.',
    'y': 'd-MMM y-\'ж\'. - d-MMM y-\'ж\'.',
    '_': 'y-\'ж\'., d-MMM'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'G EEEE, dd/MM/y – G EEEE, dd/MM/y',
    'Mdy': 'G EEEE, dd/MM/y – EEEE, dd/MM/y',
    '_': 'EEEE ທີ d MMMM G y'
  },
  LONG_DATE: {
    'G': 'G dd/MM/y– G dd/MM/y',
    'M': 'd/MM/y – d/MM',
    'd': 'd/MM/y – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G dd/MM/y– G dd/MM/y',
    'M': 'd/MM/y – d/MM',
    'd': 'd/MM/y – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd/MM/y – GGGGG dd/MM/y',
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
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y \'m\'. MMMM d \'d\'.'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    '_': 'y-MM-dd'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, y. \'gada\' d. MMMM – EEEE, y. \'gada\' d. MMMM',
    'y': 'EEEE, y. \'gada\' d. MMMM – EEEE, y. \'gada\' d. MMMM',
    '_': 'EEEE, y. \'gada\' d. MMMM'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y. \'gada\' d. MMMM – d. MMMM',
    'd': 'y. \'gada\' d.–d. MMMM',
    'y': 'y. \'gada\' d. MMMM – y. \'gada\' d. MMMM',
    '_': 'y. \'gada\' d. MMMM'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y. \'gada\' d. MMM – d. MMM',
    'd': 'y. \'gada\' d.–d. MMM',
    'y': 'y. \'gada\' d. MMM – y. \'gada\' d. MMM',
    '_': 'y. \'gada\' d. MMM'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, dd MMMM – EEEE, dd MMMM y',
    'd': 'EEEE, dd – EEEE, dd MMMM y',
    'y': 'EEEE, dd MMMM y – EEEE, dd MMMM y',
    '_': 'EEEE, dd MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'dd MMMM – dd MMMM y',
    'd': 'dd – dd MMMM y',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'dd.M.y – dd.M.y',
    '_': 'dd.M.y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'ahm': 'HH:mm – HH:mm',
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
    'ahm': 'dd.M.yy HH:mm – HH:mm',
    '_': 'dd.M.yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_ml = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y, MMMM d, EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d – d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y, MMMM d'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    'y': 'y MMM d – y MMM d',
    '_': 'y, MMM d'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'GGGGG y-MM-dd, EEEE – GGGGG y-MM-dd, EEEE',
    'Md': 'y \'оны\' MMMMM/dd EEEE – MMMMM/dd EEEE',
    'y': 'y \'оны\' MMMMM/dd EEEE – y \'оны\' MMMMM/dd EEEE',
    '_': 'y.MM.dd, EEEE'
  },
  LONG_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Md': 'y \'оны\' MMMMM/dd – MMMMM/dd',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'y.MM.dd'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y \'оны\' MMMMM/dd – MMMMM/dd',
    'd': 'y \'оны\' MMMMM/dd – dd',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'y \'оны\' MMM\'ын\' d'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Md': 'y \'оны\' MMMMM/dd – MMMMM/dd',
    'y': 'y \'оны\' MMMMM/dd – y \'оны\' MMMMM/dd',
    '_': 'y.MM.dd'
  },
  FULL_TIME: {
    'Mdy': 'y.MM.dd HH:mm:ss (zzzz)',
    '_': 'HH:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'y.MM.dd HH:mm:ss (z)',
    '_': 'HH:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'y.MM.dd HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y.MM.dd HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'y.MM.dd, EEEE HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'y.MM.dd HH:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'y \'оны\' MMM\'ын\' d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y.MM.dd HH:mm – HH:mm',
    '_': 'y.MM.dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mo = {
  FULL_DATE: {
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd.MM.y GGGGG – dd.MM.y GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'd': 'EEEE, d MMMM y – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy GGGGG – d/M/yy GGGGG',
    'Mdy': 'd/M/yy – d/M/yy',
    '_': 'd/MM/yy'
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
    'a': 'd/MM/yy, h:mm a – h:mm a',
    'hm': 'd/MM/yy, h:mm–h:mm a',
    '_': 'd/MM/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_mt = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d \'ta\'’ MMMM – EEEE, d \'ta\'’ MMMM y',
    'd': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d \'ta\'’ MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'd – d MMMM y',
    'y': 'd MMMM, y – d MMMM, y',
    '_': 'd \'ta\'’ MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'd – d MMM y',
    'y': 'd MMM, y – d MMM, y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y HH:mm',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y၊ MMMM d၊ EEEE – MMMM d၊ EEEE',
    '_': 'y၊ MMMM d၊ EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d   ',
    'M': 'y၊ MMMM d – MMMM d',
    'd': 'y၊ MMMM d – d',
    'y': 'y၊ MMMM d – y၊ MMMM d',
    '_': 'y၊ d MMMM'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d   ',
    'M': 'y၊ MMM d – MMM d',
    'd': 'y၊ MMM d – d',
    '_': 'y၊ MMM d'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'Mdy': 'dd-MM-y B HH:mm:ss',
    '_': 'B HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y B H:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'B H:mm'
  },
  FULL_DATETIME: {
    '_': 'y၊ MMMM d၊ EEEE zzzz HH:mm:ss'
  },
  LONG_DATETIME: {
    '_': 'y၊ d MMMM z HH:mm:ss'
  },
  MEDIUM_DATETIME: {
    '_': 'y၊ MMM d B HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd-MM-yy HH:mm – HH:mm',
    '_': 'dd-MM-yy B H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_nb = {
  FULL_DATE: {
    'G': 'EEEE d. MMMM y G–EEEE d. MMMM y G',
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. MMMM y G–d. MMMM y G',
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd. MMM y G–d. MMM y G',
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'dd.MM.y GGGGG–dd.MM.y GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    '_': 'y MMMM d'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'yy/M/d'
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
    'ahm': 'yy/M/d, HH:mm–HH:mm',
    '_': 'yy/M/d, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_nl = {
  FULL_DATE: {
    'G': 'EEEE d MMMM y G – EEEE d MMMM y G',
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd-M-y GGGGG – d-M-y GGGGG',
    'Mdy': 'dd-MM-y – dd-MM-y',
    '_': 'dd-MM-y'
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
    'ahm': 'dd-MM-y HH:mm–HH:mm',
    '_': 'dd-MM-y HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_no = {
  FULL_DATE: {
    'G': 'EEEE d. MMMM y G–EEEE d. MMMM y G',
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. MMMM y G–d. MMMM y G',
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd. MMM y G–d. MMM y G',
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'dd.MM.y GGGGG–dd.MM.y GGGGG',
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
exports.DateIntervalSymbols_no_NO = exports.DateIntervalSymbols_no;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_or = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'h:mm:ss a zzzz ଠାରେ EEEE, MMMM d, y'
  },
  LONG_DATETIME: {
    '_': 'h:mm:ss a z ଠାରେ MMMM d, y'
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
exports.DateIntervalSymbols_pa = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM–d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd.M.y GGGGG – d.M.y GGGGG',
    'M': 'dd.MM–dd.MM.y',
    'd': 'dd–dd.MM.y',
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
  FALLBACK: '{0}–{1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pt = {
  FULL_DATE: {
    'G': 'G EEEE, d \'de\' MMMM y – G EEEE, d \'de\' MMMM y',
    'M': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'd': 'EEEE, d – EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y – EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'G': 'G d \'de\' MMMM y – G d \'de\' MMMM y',
    'M': 'd \'de\' MMMM – d \'de\' MMMM \'de\' y',
    'd': 'd – d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'G d \'de\' MMM y – G d \'de\' MMM y',
    'M': 'd \'de\' MMM – d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd/MM/y – GGGGG dd/MM/y',
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
exports.DateIntervalSymbols_pt_BR = exports.DateIntervalSymbols_pt;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_PT = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM – EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y – EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'G': 'G d \'de\' MMMM y – G d \'de\' MMMM y',
    'M': 'd \'de\' MMMM – d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y – d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG dd/MM/y – GGGGG dd/MM/y',
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd/MM/yy – GGGGG dd/MM/yy',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'dd.MM.y GGGGG – dd.MM.y GGGGG',
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
    'G': 'ccc, d MMMM y \'г\'. G – ccc, d MMMM y \'г\'. G',
    'M': 'ccc, d MMMM – ccc, d MMMM y \'г\'.',
    'd': 'ccc, d – ccc, d MMMM y \'г\'.',
    'y': 'ccc, d MMMM y \'г\'. – ccc, d MMMM y \'г\'.',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'G': 'd MMMM y \'г\'. G – d MMMM y \'г\'. G',
    'M': 'd MMMM – d MMMM y \'г\'.',
    'd': 'd–d MMMM y \'г\'.',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y \'г\'. G – d MMM y \'г\'. G',
    'M': 'd MMM – d MMM y \'г\'.',
    'd': 'd–d MMM y \'г\'.',
    '_': 'd MMM y \'г\'.'
  },
  SHORT_DATE: {
    'G': 'dd.MM.y G – dd.MM.y G',
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
    '_': 'EEEE, d MMMM y \'г\'., HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'г\'., HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'г\'., HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.y, HH:mm–HH:mm',
    '_': 'dd.MM.y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sh = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d – d',
    '_': 'y MMMM d'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d – d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'G': 'M/d/y GGGGG – M/d/y GGGGG',
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
    'G': 'EEEE d. M. y G – EEEE d. M. y G',
    'M': 'EEEE d. M. – EEEE d. M. y',
    'd': 'EEEE d. – EEEE d. M. y',
    'y': 'EEEE d. M. y – EEEE d. M. y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'G': 'd. M. y G – d. M. y G',
    'M': 'd. M. – d. M. y',
    'd': 'd. – d. M. y',
    'y': 'd. M. y – d. M. y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd. M. y GGGGG – d. M. y GGGGG',
    '_': 'd. M. y'
  },
  SHORT_DATE: {
    'G': 'd. M. y GGGGG – d. M. y GGGGG',
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
    '_': 'EEEE d. MMMM y, H:mm:ss zzzz'
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d. MMMM–EEEE, d. MMMM y',
    'y': 'EEEE, d. MMMM y–EEEE, d. MMMM y',
    '_': 'EEEE, dd. MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'dd. MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd.M.yy GGGGG – d.M.yy GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
exports.DateIntervalSymbols_sr_Latn = exports.DateIntervalSymbols_sr;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_sv = {
  FULL_DATE: {
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE dd MMMM–EEEE dd MMMM y',
    'y': 'EEEE dd MMMM y–EEEE dd MMMM y',
    '_': 'EEEE d MMMM y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM–d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM–d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'M': 'EEEE, MMMM d– EEEE, MMMM d y',
    'd': 'EEEE, MMMM d – EEEE, MMMM d y',
    'y': 'EEEE, MMMM d y – EEEE, MMMM d y',
    '_': 'EEEE, d MMMM y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'Md': 'MMMM d – d, y',
    'y': 'MMMM d y – MMMM d y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'Md': 'MMM d – d, y',
    'y': 'MMM d y – MMM d y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'd/M/y GGGGG – d/M/y GGGGG',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'G d MMMM, y, EEEE – G d MMMM, y, EEEE',
    'Md': 'd MMMM, EEEE – d MMMM, y, EEEE',
    'y': 'd MMMM, y, EEEE – d MMMM, y, EEEE',
    '_': 'd, MMMM y, EEEE'
  },
  LONG_DATE: {
    'G': 'G d MMMM y – G d MMMM y',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM, y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'G d MMM y – G d MMM y',
    'M': 'd MMM – d MMM, y',
    'd': 'd–d MMM, y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG d/M/yy – GGGGG d/M/yy',
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
    '_': 'd, MMMM y, EEEE h:mm:ss a zzzzకి'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y h:mm:ss a zకి'
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'G y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'G y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEEที่ d MMMM G y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'G y MMMM d – MMMM d',
    'd': 'G y MMMM d–d',
    'y': 'G y MMMM d – y MMMM d',
    '_': 'd MMMM G y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d–d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d–d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    'G': 'G d MMMM y EEEE – G d MMMM y EEEE',
    '_': 'd MMMM y EEEE'
  },
  LONG_DATE: {
    'G': 'G d MMMM y – G d MMMM y',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM y'
  },
  MEDIUM_DATE: {
    'G': 'G d MMM y – G d MMM y',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'G': 'GGGGG dd.MM.y – GGGGG dd.MM.y',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y \'р\'.'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y \'р\'.'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y \'р\'.'
  },
  SHORT_DATE: {
    'G': 'dd.MM.yy G – dd.MM.yy G',
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
    'G': 'EEEE, MMMM d, y G – EEEE, MMMM d, y G',
    'Md': 'EEEE، d MMMM – EEEE، d MMMM، y',
    '_': 'EEEE، d MMMM، y'
  },
  LONG_DATE: {
    'G': 'MMMM d, y G – MMMM d, y G',
    'M': 'd MMMM – d MMMM، y',
    'd': 'd–d MMMM y',
    '_': 'd MMMM، y'
  },
  MEDIUM_DATE: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'd MMM – d MMM، y',
    'd': 'd–d MMM y',
    '_': 'd MMM، y'
  },
  SHORT_DATE: {
    'G': 'M/d/yy GGGGG – M/d/yy GGGGG',
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
    '_': 'd MMM، y h:mm:ss a'
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
    'G': 'EEEE, d-MMMM, G y – EEEE, d-MMMM, G y',
    'Md': 'EEEE, d-MMMM – EEEE, d-MMMM, y',
    '_': 'EEEE, d-MMMM, y'
  },
  LONG_DATE: {
    'G': 'd-MMMM, G y – d-MMMM, G y',
    'M': 'd-MMMM – d-MMMM, y',
    'd': 'd – d-MMMM, y',
    '_': 'd-MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'd-MMM, G y – d-MMM, G y',
    'M': 'd-MMM – d-MMM, y',
    'd': 'd – d-MMM, y',
    '_': 'd-MMM, y'
  },
  SHORT_DATE: {
    'G': 'd/M/yy (GGGGG) – d/M/yy (GGGGG)',
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
    'G': 'EEEE, d MMMM y G – EEEE, d MMMM y G',
    'M': 'EEEE, dd \'tháng\' M – EEEE, dd \'tháng\' M, y',
    'd': 'EEEE, \'ngày\' dd MMMM – EEEE, \'ngày\' dd MMMM \'năm\' y',
    'y': 'EEEE, dd \'tháng\' M, y – EEEE, dd \'tháng\' M, y',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'G': 'd MMMM y G – d MMMM y G',
    'M': 'd MMMM – d MMMM, y',
    'd': 'd – d MMMM, y',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'G': 'd MMM y G – d MMM y G',
    'M': 'd MMM – d MMM, y',
    'd': 'd – d MMM, y',
    'y': '\'Ngày\' dd \'tháng\' M \'năm\' y - \'Ngày\' dd \'tháng\' M \'năm\' y',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'G': 'dd-MM-y GGGGG – dd-MM-y GGGGG',
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
    'G': 'GGGGG y-MM-dd, EEEE – GGGGG y-MM-dd, EEEE',
    'Mdy': 'y/M/dEEEE至y/M/dEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'y/M/d – y/M/d',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
exports.DateIntervalSymbols_zh_CN = exports.DateIntervalSymbols_zh;

/** @const {!DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_HK = {
  FULL_DATE: {
    'G': 'GGGGG y-MM-dd, EEEE – GGGGG y-MM-dd, EEEE',
    'Mdy': 'd/M/y（EEEE） 至 d/M/y（EEEE）',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd/M/y 至 d/M/y',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'd/M/y 至 d/M/y',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'GGGGG y-MM-dd, EEEE – GGGGG y-MM-dd, EEEE',
    'Mdy': 'y/M/dEEEE至y/M/dEEEE',
    '_': 'y年M月d日 EEEE'
  },
  LONG_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'y/M/d至y/M/d',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
    'Mdy': 'y/M/d至y/M/d',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'G': 'GGGGG y-MM-dd – GGGGG y-MM-dd',
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
    'G': 'G y MMMM d, EEEE – G y MMMM d, EEEE',
    'Md': 'EEEE, MMMM d – EEEE, MMMM d, y',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'G': 'G y MMMM d – G y MMMM d',
    'M': 'MMMM d – MMMM d, y',
    'd': 'MMMM d – d, y',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'MMM d – MMM d, y',
    'd': 'MMM d – d, y',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'G': 'GGGGG yy-MM-dd – GGGGG yy-MM-dd',
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

switch (goog.LOCALE) {
  case 'af':
    defaultSymbols = exports.DateIntervalSymbols_af;
    break;
  case 'am':
    defaultSymbols = exports.DateIntervalSymbols_am;
    break;
  case 'ar':
    defaultSymbols = exports.DateIntervalSymbols_ar;
    break;
  case 'ar_DZ':
  case 'ar-DZ':
    defaultSymbols = exports.DateIntervalSymbols_ar_DZ;
    break;
  case 'ar_EG':
  case 'ar-EG':
    defaultSymbols = exports.DateIntervalSymbols_ar_EG;
    break;
  case 'az':
    defaultSymbols = exports.DateIntervalSymbols_az;
    break;
  case 'be':
    defaultSymbols = exports.DateIntervalSymbols_be;
    break;
  case 'bg':
    defaultSymbols = exports.DateIntervalSymbols_bg;
    break;
  case 'bn':
    defaultSymbols = exports.DateIntervalSymbols_bn;
    break;
  case 'br':
    defaultSymbols = exports.DateIntervalSymbols_br;
    break;
  case 'bs':
    defaultSymbols = exports.DateIntervalSymbols_bs;
    break;
  case 'ca':
    defaultSymbols = exports.DateIntervalSymbols_ca;
    break;
  case 'chr':
    defaultSymbols = exports.DateIntervalSymbols_chr;
    break;
  case 'cs':
    defaultSymbols = exports.DateIntervalSymbols_cs;
    break;
  case 'cy':
    defaultSymbols = exports.DateIntervalSymbols_cy;
    break;
  case 'da':
    defaultSymbols = exports.DateIntervalSymbols_da;
    break;
  case 'de':
    defaultSymbols = exports.DateIntervalSymbols_de;
    break;
  case 'de_AT':
  case 'de-AT':
    defaultSymbols = exports.DateIntervalSymbols_de_AT;
    break;
  case 'de_CH':
  case 'de-CH':
    defaultSymbols = exports.DateIntervalSymbols_de_CH;
    break;
  case 'el':
    defaultSymbols = exports.DateIntervalSymbols_el;
    break;
  case 'en':
    defaultSymbols = exports.DateIntervalSymbols_en;
    break;
  case 'en_AU':
  case 'en-AU':
    defaultSymbols = exports.DateIntervalSymbols_en_AU;
    break;
  case 'en_CA':
  case 'en-CA':
    defaultSymbols = exports.DateIntervalSymbols_en_CA;
    break;
  case 'en_GB':
  case 'en-GB':
    defaultSymbols = exports.DateIntervalSymbols_en_GB;
    break;
  case 'en_IE':
  case 'en-IE':
    defaultSymbols = exports.DateIntervalSymbols_en_IE;
    break;
  case 'en_IN':
  case 'en-IN':
    defaultSymbols = exports.DateIntervalSymbols_en_IN;
    break;
  case 'en_SG':
  case 'en-SG':
    defaultSymbols = exports.DateIntervalSymbols_en_SG;
    break;
  case 'en_US':
  case 'en-US':
    defaultSymbols = exports.DateIntervalSymbols_en_US;
    break;
  case 'en_ZA':
  case 'en-ZA':
    defaultSymbols = exports.DateIntervalSymbols_en_ZA;
    break;
  case 'es':
    defaultSymbols = exports.DateIntervalSymbols_es;
    break;
  case 'es_419':
  case 'es-419':
    defaultSymbols = exports.DateIntervalSymbols_es_419;
    break;
  case 'es_ES':
  case 'es-ES':
    defaultSymbols = exports.DateIntervalSymbols_es_ES;
    break;
  case 'es_MX':
  case 'es-MX':
    defaultSymbols = exports.DateIntervalSymbols_es_MX;
    break;
  case 'es_US':
  case 'es-US':
    defaultSymbols = exports.DateIntervalSymbols_es_US;
    break;
  case 'et':
    defaultSymbols = exports.DateIntervalSymbols_et;
    break;
  case 'eu':
    defaultSymbols = exports.DateIntervalSymbols_eu;
    break;
  case 'fa':
    defaultSymbols = exports.DateIntervalSymbols_fa;
    break;
  case 'fi':
    defaultSymbols = exports.DateIntervalSymbols_fi;
    break;
  case 'fil':
    defaultSymbols = exports.DateIntervalSymbols_fil;
    break;
  case 'fr':
    defaultSymbols = exports.DateIntervalSymbols_fr;
    break;
  case 'fr_CA':
  case 'fr-CA':
    defaultSymbols = exports.DateIntervalSymbols_fr_CA;
    break;
  case 'ga':
    defaultSymbols = exports.DateIntervalSymbols_ga;
    break;
  case 'gl':
    defaultSymbols = exports.DateIntervalSymbols_gl;
    break;
  case 'gsw':
    defaultSymbols = exports.DateIntervalSymbols_gsw;
    break;
  case 'gu':
    defaultSymbols = exports.DateIntervalSymbols_gu;
    break;
  case 'haw':
    defaultSymbols = exports.DateIntervalSymbols_haw;
    break;
  case 'he':
    defaultSymbols = exports.DateIntervalSymbols_he;
    break;
  case 'hi':
    defaultSymbols = exports.DateIntervalSymbols_hi;
    break;
  case 'hr':
    defaultSymbols = exports.DateIntervalSymbols_hr;
    break;
  case 'hu':
    defaultSymbols = exports.DateIntervalSymbols_hu;
    break;
  case 'hy':
    defaultSymbols = exports.DateIntervalSymbols_hy;
    break;
  case 'id':
    defaultSymbols = exports.DateIntervalSymbols_id;
    break;
  case 'in':
    defaultSymbols = exports.DateIntervalSymbols_in;
    break;
  case 'is':
    defaultSymbols = exports.DateIntervalSymbols_is;
    break;
  case 'it':
    defaultSymbols = exports.DateIntervalSymbols_it;
    break;
  case 'iw':
    defaultSymbols = exports.DateIntervalSymbols_iw;
    break;
  case 'ja':
    defaultSymbols = exports.DateIntervalSymbols_ja;
    break;
  case 'ka':
    defaultSymbols = exports.DateIntervalSymbols_ka;
    break;
  case 'kk':
    defaultSymbols = exports.DateIntervalSymbols_kk;
    break;
  case 'km':
    defaultSymbols = exports.DateIntervalSymbols_km;
    break;
  case 'kn':
    defaultSymbols = exports.DateIntervalSymbols_kn;
    break;
  case 'ko':
    defaultSymbols = exports.DateIntervalSymbols_ko;
    break;
  case 'ky':
    defaultSymbols = exports.DateIntervalSymbols_ky;
    break;
  case 'ln':
    defaultSymbols = exports.DateIntervalSymbols_ln;
    break;
  case 'lo':
    defaultSymbols = exports.DateIntervalSymbols_lo;
    break;
  case 'lt':
    defaultSymbols = exports.DateIntervalSymbols_lt;
    break;
  case 'lv':
    defaultSymbols = exports.DateIntervalSymbols_lv;
    break;
  case 'mk':
    defaultSymbols = exports.DateIntervalSymbols_mk;
    break;
  case 'ml':
    defaultSymbols = exports.DateIntervalSymbols_ml;
    break;
  case 'mn':
    defaultSymbols = exports.DateIntervalSymbols_mn;
    break;
  case 'mo':
    defaultSymbols = exports.DateIntervalSymbols_mo;
    break;
  case 'mr':
    defaultSymbols = exports.DateIntervalSymbols_mr;
    break;
  case 'ms':
    defaultSymbols = exports.DateIntervalSymbols_ms;
    break;
  case 'mt':
    defaultSymbols = exports.DateIntervalSymbols_mt;
    break;
  case 'my':
    defaultSymbols = exports.DateIntervalSymbols_my;
    break;
  case 'nb':
    defaultSymbols = exports.DateIntervalSymbols_nb;
    break;
  case 'ne':
    defaultSymbols = exports.DateIntervalSymbols_ne;
    break;
  case 'nl':
    defaultSymbols = exports.DateIntervalSymbols_nl;
    break;
  case 'no':
    defaultSymbols = exports.DateIntervalSymbols_no;
    break;
  case 'no_NO':
  case 'no-NO':
    defaultSymbols = exports.DateIntervalSymbols_no_NO;
    break;
  case 'or':
    defaultSymbols = exports.DateIntervalSymbols_or;
    break;
  case 'pa':
    defaultSymbols = exports.DateIntervalSymbols_pa;
    break;
  case 'pl':
    defaultSymbols = exports.DateIntervalSymbols_pl;
    break;
  case 'pt':
    defaultSymbols = exports.DateIntervalSymbols_pt;
    break;
  case 'pt_BR':
  case 'pt-BR':
    defaultSymbols = exports.DateIntervalSymbols_pt_BR;
    break;
  case 'pt_PT':
  case 'pt-PT':
    defaultSymbols = exports.DateIntervalSymbols_pt_PT;
    break;
  case 'ro':
    defaultSymbols = exports.DateIntervalSymbols_ro;
    break;
  case 'ru':
    defaultSymbols = exports.DateIntervalSymbols_ru;
    break;
  case 'sh':
    defaultSymbols = exports.DateIntervalSymbols_sh;
    break;
  case 'si':
    defaultSymbols = exports.DateIntervalSymbols_si;
    break;
  case 'sk':
    defaultSymbols = exports.DateIntervalSymbols_sk;
    break;
  case 'sl':
    defaultSymbols = exports.DateIntervalSymbols_sl;
    break;
  case 'sq':
    defaultSymbols = exports.DateIntervalSymbols_sq;
    break;
  case 'sr':
    defaultSymbols = exports.DateIntervalSymbols_sr;
    break;
  case 'sr_Latn':
  case 'sr-Latn':
    defaultSymbols = exports.DateIntervalSymbols_sr_Latn;
    break;
  case 'sv':
    defaultSymbols = exports.DateIntervalSymbols_sv;
    break;
  case 'sw':
    defaultSymbols = exports.DateIntervalSymbols_sw;
    break;
  case 'ta':
    defaultSymbols = exports.DateIntervalSymbols_ta;
    break;
  case 'te':
    defaultSymbols = exports.DateIntervalSymbols_te;
    break;
  case 'th':
    defaultSymbols = exports.DateIntervalSymbols_th;
    break;
  case 'tl':
    defaultSymbols = exports.DateIntervalSymbols_tl;
    break;
  case 'tr':
    defaultSymbols = exports.DateIntervalSymbols_tr;
    break;
  case 'uk':
    defaultSymbols = exports.DateIntervalSymbols_uk;
    break;
  case 'ur':
    defaultSymbols = exports.DateIntervalSymbols_ur;
    break;
  case 'uz':
    defaultSymbols = exports.DateIntervalSymbols_uz;
    break;
  case 'vi':
    defaultSymbols = exports.DateIntervalSymbols_vi;
    break;
  case 'zh':
    defaultSymbols = exports.DateIntervalSymbols_zh;
    break;
  case 'zh_CN':
  case 'zh-CN':
    defaultSymbols = exports.DateIntervalSymbols_zh_CN;
    break;
  case 'zh_HK':
  case 'zh-HK':
    defaultSymbols = exports.DateIntervalSymbols_zh_HK;
    break;
  case 'zh_TW':
  case 'zh-TW':
    defaultSymbols = exports.DateIntervalSymbols_zh_TW;
    break;
  case 'zu':
    defaultSymbols = exports.DateIntervalSymbols_zu;
    break;
  default:
    defaultSymbols = exports.DateIntervalSymbols_en;
}
