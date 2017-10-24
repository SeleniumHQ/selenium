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
 * This file covers those locales that are not covered in
 * "dateintervalsymbols.js".
 */

// clang-format off

goog.module('goog.i18n.dateIntervalSymbolsExt');

var dateIntervalSymbols = goog.require('goog.i18n.dateIntervalSymbols');

/** @type {!dateIntervalSymbols.DateIntervalSymbols} */
var defaultSymbols;

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_af_NA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_af_ZA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_agq = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_agq_CM = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ak = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'yy/MM/dd'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'yy/MM/dd h:mm a – h:mm a',
    'hm': 'yy/MM/dd h:mm–h:mm a',
    '_': 'yy/MM/dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ak_GH = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'yy/MM/dd'
  },
  FULL_TIME: {
    'Mdy': 'y/M/d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y/M/d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y/M/d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y/M/d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'yy/MM/dd h:mm a – h:mm a',
    'hm': 'yy/MM/dd h:mm–h:mm a',
    '_': 'yy/MM/dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_am_ET = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_001 = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_AE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_BH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_DJ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_EG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_EH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_ER = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_IL = {
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
    'Mdy': 'd‏/M‏/y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd‏/M‏/y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd‏/M‏/y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd‏/M‏/y H:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd‏/MM‏/y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd‏/M‏/y HH:mm–HH:mm',
    '_': 'd‏/M‏/y H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_IQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_JO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_KM = {
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
    'Mdy': 'd‏/M‏/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd‏/MM‏/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd‏/M‏/y HH:mm–HH:mm',
    '_': 'd‏/M‏/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_KW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_LB = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_LY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_MA = {
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
    'Mdy': 'd‏/M‏/y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd‏/M‏/y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE، d MMMM، y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd‏/MM‏/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd‏/M‏/y HH:mm–HH:mm',
    '_': 'd‏/M‏/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_MR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_OM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_PS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_QA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_SA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_SD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_SO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_SS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_SY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_TD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_TN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_XB = {
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
    '_': 'EEEE، d MMMM، y \'؜‮at‬؜\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM، y \'؜‮at‬؜\' h:mm:ss a z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ar_YE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_as = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_as_IN = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_asa = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_asa_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ast = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM \'de\' y',
    '_': 'EEEE, d MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd – d MMMM \'de\' y',
    '_': 'd MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd – d MMM \'de\' y',
    'y': 'd MMM \'de\' y – d MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM \'de\' y \'a\' \'les\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM \'de\' y \'a\' \'les\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy, HH:mm – HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ast_ES = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM \'de\' y',
    '_': 'EEEE, d MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM \'de\' y',
    'd': 'd – d MMMM \'de\' y',
    '_': 'd MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd – d MMM \'de\' y',
    'y': 'd MMM \'de\' y – d MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM \'de\' y \'a\' \'les\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM \'de\' y \'a\' \'les\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy, HH:mm – HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_az_Cyrl = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_az_Cyrl_AZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_az_Latn = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_az_Latn_AZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bas = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bas_CM = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_be_BY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bem = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bem_ZM = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bez = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bez_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bg_BG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bm = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bm_ML = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bn_BD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bn_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bo = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y MMMMའི་ཚེས་d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y ལོའི་MMMཚེས་d'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMMའི་ཚེས་d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y ལོའི་MMMཚེས་d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bo_CN = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y MMMMའི་ཚེས་d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y ལོའི་MMMཚེས་d'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMMའི་ཚེས་d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y ལོའི་MMMཚེས་d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bo_IN = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y MMMMའི་ཚེས་d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y ལོའི་MMMཚེས་d'
  },
  SHORT_DATE: {
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMMའི་ཚེས་d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'སྤྱི་ལོ་y MMMMའི་ཚེས་d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y ལོའི་MMMཚེས་d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_br_FR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_brx = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy h:mm a – h:mm a',
    'hm': 'M/d/yy h:mm–h:mm a',
    '_': 'M/d/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_brx_IN = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy h:mm a – h:mm a',
    'hm': 'M/d/yy h:mm–h:mm a',
    '_': 'M/d/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bs_Cyrl = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    'y': 'EEEE, dd. MMMM y. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    'Mdy': 'd.M.yy. – d.M.yy.',
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y. HH:mm',
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
    'ahm': 'dd.MM.yy. HH:mm–HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bs_Cyrl_BA = {
  FULL_DATE: {
    'M': 'EEEE, dd. MMMM – EEEE, dd. MMMM y.',
    'd': 'EEEE, dd. – EEEE, dd. MMMM y.',
    'y': 'EEEE, dd. MMMM y. – EEEE, dd. MMMM y.',
    '_': 'EEEE, dd. MMMM y.'
  },
  LONG_DATE: {
    'M': 'dd. MMMM – dd. MMMM y.',
    'd': 'dd.–dd. MMMM y.',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'dd. MMMM y.'
  },
  MEDIUM_DATE: {
    'Mdy': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.y.'
  },
  SHORT_DATE: {
    'Mdy': 'd.M.yy. – d.M.yy.',
    '_': 'd.M.yy.'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y. HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y. HH:mm',
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
    'ahm': 'dd.MM.yy. HH:mm–HH:mm',
    '_': 'd.M.yy. HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bs_Latn = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_bs_Latn_BA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ca_AD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ca_ES = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ca_FR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ca_IT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ce = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ce_RU = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_cgg = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_cgg_UG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_chr_US = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ckb = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dی MMMMی y'
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
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dی MMMMی y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ckb_IQ = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dی MMMMی y'
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
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dی MMMMی y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ckb_IR = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    '_': 'y MMMM d, EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dی MMMMی y'
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dی MMMMی y HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_cs_CZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_cy_GB = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_da_DK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_da_GL = {
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
    'Mdy': 'd/M/y h.mm.ss a zzzz',
    '_': 'h.mm.ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y h.mm.ss a z',
    '_': 'h.mm.ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/M/y h.mm.ss a',
    '_': 'h.mm.ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/M/y h.mm a',
    'a': 'h.mm a–h.mm a',
    'hm': 'h.mm–h.mm a',
    '_': 'h.mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE \'den\' d. MMMM y \'kl\'. h.mm.ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. h.mm.ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM y h.mm.ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y h.mm a–h.mm a',
    'hm': 'dd/MM/y h.mm–h.mm a',
    '_': 'dd/MM/y h.mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dav = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dav_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_de_BE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_de_DE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_de_IT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_de_LI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_de_LU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dje = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dje_NE = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dsb = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    '_': 'd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y H:mm',
    'ahm': '\'zeg\'. H:mm – H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.M.y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy \'zeg\'. H:mm – H:mm',
    '_': 'd.M.yy H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dsb_DE = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    '_': 'd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y H:mm',
    'ahm': '\'zeg\'. H:mm – H:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.M.y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy \'zeg\'. H:mm – H:mm',
    '_': 'd.M.yy H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dua = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dua_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dyo = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dyo_SN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dz = {
  FULL_DATE: {
    'Mdy': 'EEEE, y-MM-dd – EEEE, y-MM-dd',
    '_': 'EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd'
  },
  LONG_DATE: {
    'M': 'y-MM-dd – MM-d',
    'd': 'y-MM-d – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'སྤྱི་ལོ་y MMMM ཚེས་ dd'
  },
  MEDIUM_DATE: {
    'M': 'y-MM-dd – MM-d',
    'd': 'y-MM-d – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd'
  },
  SHORT_DATE: {
    'M': 'y-MM-dd – MM-dd',
    'd': 'y-MM-dd – dd',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་h:mm:ss a',
    '_': 'ཆུ་ཚོད་h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'སྤྱི་ལོ་y MMMM ཚེས་ dd ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd ཆུ་ཚོད་h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd ཆུ་ཚོད་ h སྐར་མ་ mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_dz_BT = {
  FULL_DATE: {
    'Mdy': 'EEEE, y-MM-dd – EEEE, y-MM-dd',
    '_': 'EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd'
  },
  LONG_DATE: {
    'M': 'y-MM-dd – MM-d',
    'd': 'y-MM-d – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'སྤྱི་ལོ་y MMMM ཚེས་ dd'
  },
  MEDIUM_DATE: {
    'M': 'y-MM-dd – MM-d',
    'd': 'y-MM-d – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd'
  },
  SHORT_DATE: {
    'M': 'y-MM-dd – MM-dd',
    'd': 'y-MM-dd – dd',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་h:mm:ss a',
    '_': 'ཆུ་ཚོད་h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d ཆུ་ཚོད་ h སྐར་མ་ mm a',
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'ཆུ་ཚོད་ h སྐར་མ་ mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'སྤྱི་ལོ་y MMMM ཚེས་ dd ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd ཆུ་ཚོད་h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd ཆུ་ཚོད་ h སྐར་མ་ mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ebu = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ebu_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ee = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d \'lia\' – EEEE, MMMM d \'lia\', y',
    'y': 'EEEE, MMMM d \'lia\', y – EEEE, MMMM d \'lia\', y',
    '_': 'EEEE, MMMM d \'lia\' y'
  },
  LONG_DATE: {
    'M': 'MMMM d \'lia\' – MMMM d \'lia\', y',
    'd': 'MMMM d \'lia\' – d \'lia\' , y',
    'y': 'MMMM d \'lia\' , y – MMMM d \'lia\', y',
    '_': 'MMMM d \'lia\' y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d \'lia\' – MMM d \'lia\', y',
    'd': 'MMM d \'lia\' – d \'lia\' , y',
    'y': 'MMM d \'lia\' , y – MMM d \'lia\', y',
    '_': 'MMM d \'lia\', y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/yy – M/d/yy',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss zzzz M/d/y',
    '_': 'a \'ga\' h:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss z M/d/y',
    '_': 'a \'ga\' h:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss M/d/y',
    '_': 'a \'ga\' h:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'a \'ga\' h:mm M/d/y',
    'a': 'a \'ga\' h:mm – a \'ga\' h:mm',
    'h': 'a \'ga\' h:mm - \'ga\' h:mm',
    'm': 'a \'ga\' h:mm – \'ga\' h:mm',
    '_': 'a \'ga\' h:mm'
  },
  FULL_DATETIME: {
    '_': 'a \'ga\' h:mm:ss zzzz EEEE, MMMM d \'lia\' y'
  },
  LONG_DATETIME: {
    '_': 'a \'ga\' h:mm:ss z MMMM d \'lia\' y'
  },
  MEDIUM_DATETIME: {
    '_': 'a \'ga\' h:mm:ss MMM d \'lia\', y'
  },
  SHORT_DATETIME: {
    'a': 'a \'ga\' h:mm – a \'ga\' h:mm M/d/yy',
    'h': 'a \'ga\' h:mm - \'ga\' h:mm M/d/yy',
    'm': 'a \'ga\' h:mm – \'ga\' h:mm M/d/yy',
    '_': 'a \'ga\' h:mm M/d/yy'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ee_GH = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d \'lia\' – EEEE, MMMM d \'lia\', y',
    'y': 'EEEE, MMMM d \'lia\', y – EEEE, MMMM d \'lia\', y',
    '_': 'EEEE, MMMM d \'lia\' y'
  },
  LONG_DATE: {
    'M': 'MMMM d \'lia\' – MMMM d \'lia\', y',
    'd': 'MMMM d \'lia\' – d \'lia\' , y',
    'y': 'MMMM d \'lia\' , y – MMMM d \'lia\', y',
    '_': 'MMMM d \'lia\' y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d \'lia\' – MMM d \'lia\', y',
    'd': 'MMM d \'lia\' – d \'lia\' , y',
    'y': 'MMM d \'lia\' , y – MMM d \'lia\', y',
    '_': 'MMM d \'lia\', y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/yy – M/d/yy',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss zzzz M/d/y',
    '_': 'a \'ga\' h:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss z M/d/y',
    '_': 'a \'ga\' h:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'a \'ga\' h:mm:ss M/d/y',
    '_': 'a \'ga\' h:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'a \'ga\' h:mm M/d/y',
    'a': 'a \'ga\' h:mm – a \'ga\' h:mm',
    'h': 'a \'ga\' h:mm - \'ga\' h:mm',
    'm': 'a \'ga\' h:mm – \'ga\' h:mm',
    '_': 'a \'ga\' h:mm'
  },
  FULL_DATETIME: {
    '_': 'a \'ga\' h:mm:ss zzzz EEEE, MMMM d \'lia\' y'
  },
  LONG_DATETIME: {
    '_': 'a \'ga\' h:mm:ss z MMMM d \'lia\' y'
  },
  MEDIUM_DATETIME: {
    '_': 'a \'ga\' h:mm:ss MMM d \'lia\', y'
  },
  SHORT_DATETIME: {
    'a': 'a \'ga\' h:mm – a \'ga\' h:mm M/d/yy',
    'h': 'a \'ga\' h:mm - \'ga\' h:mm M/d/yy',
    'm': 'a \'ga\' h:mm – \'ga\' h:mm M/d/yy',
    '_': 'a \'ga\' h:mm M/d/yy'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ee_TG = {
  FULL_DATE: {
    'Md': 'EEEE, MMMM d \'lia\' – EEEE, MMMM d \'lia\', y',
    'y': 'EEEE, MMMM d \'lia\', y – EEEE, MMMM d \'lia\', y',
    '_': 'EEEE, MMMM d \'lia\' y'
  },
  LONG_DATE: {
    'M': 'MMMM d \'lia\' – MMMM d \'lia\', y',
    'd': 'MMMM d \'lia\' – d \'lia\' , y',
    'y': 'MMMM d \'lia\' , y – MMMM d \'lia\', y',
    '_': 'MMMM d \'lia\' y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d \'lia\' – MMM d \'lia\', y',
    'd': 'MMM d \'lia\' – d \'lia\' , y',
    'y': 'MMM d \'lia\' , y – MMM d \'lia\', y',
    '_': 'MMM d \'lia\', y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/yy – M/d/yy',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'HH:mm:ss zzzz M/d/y',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'HH:mm:ss z M/d/y',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'HH:mm:ss M/d/y',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'HH:mm M/d/y',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'HH:mm:ss zzzz EEEE, MMMM d \'lia\' y'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z MMMM d \'lia\' y'
  },
  MEDIUM_DATETIME: {
    '_': 'HH:mm:ss MMM d \'lia\', y'
  },
  SHORT_DATETIME: {
    'ahm': 'HH:mm–HH:mm M/d/yy',
    '_': 'HH:mm M/d/yy'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_el_CY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_el_GR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_001 = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_150 = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_AG = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_AI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_AS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_AT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BB = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BE = {
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
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
  },
  SHORT_DATE: {
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
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm – HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BS = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BW = {
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
    'ahm': 'dd/MM/yy, HH:mm – HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_BZ = {
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
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
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
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm – HH:mm',
    '_': 'dd/MM/yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CX = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_CY = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_DE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_DG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_DK = {
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
    'Mdy': 'dd/MM/y, HH.mm.ss zzzz',
    '_': 'HH.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, HH.mm.ss z',
    '_': 'HH.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, HH.mm.ss',
    '_': 'HH.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, HH.mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH.mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' HH.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' HH.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, HH.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_DM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_ER = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_FI = {
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
    'Mdy': 'dd/MM/y, H.mm.ss zzzz',
    '_': 'H.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, H.mm.ss z',
    '_': 'H.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, H.mm.ss',
    '_': 'H.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, H.mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'H.mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' H.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' H.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, H.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, H.mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_FJ = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_FK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_FM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GD = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GH = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_GY = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_HK = {
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
    '_': 'd/M/y'
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
    '_': 'EEEE, d MMMM y \'at\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/y, h:mm a – h:mm a',
    'hm': 'd/M/y, h:mm – h:mm a',
    '_': 'd/M/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IL = {
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
    'Mdy': 'dd/MM/y, H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y, H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y, H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y, H:mm',
    'ahm': 'HH:mm – HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'at\' H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'at\' H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_IO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_JE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_JM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_KE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_KI = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_KN = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_KY = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_LC = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_LR = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_LS = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MO = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MP = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MT = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    '_': 'EEEE, d MMMM y'
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
    '_': 'dd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y, HH:mm – HH:mm',
    '_': 'dd/MM/y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MW = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_MY = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NA = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NG = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_NZ = {
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
    '_': 'd/MM/y'
  },
  SHORT_DATE: {
    '_': 'd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/MM/y, h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd/MM/y, h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd/MM/y, h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'd/MM/y, h:mm a',
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
    '_': 'd/MM/y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/MM/yy, h:mm a – h:mm a',
    'hm': 'd/MM/yy, h:mm – h:mm a',
    '_': 'd/MM/yy, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PG = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PH = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PK = {
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
    'y': 'd MMM y – d MMM y',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    '_': 'dd/MM/y'
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
    '_': 'dd-MMM-y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_PW = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_RW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SB = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SD = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SE = {
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
    'Mdy': 'dd/MM/y – dd/MM/y',
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
    'ahm': 'y-MM-dd, HH:mm – HH:mm',
    '_': 'y-MM-dd, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SL = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SS = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SX = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_SZ = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TC = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TO = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TT = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TV = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_TZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_UG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_UM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_US_POSIX = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_VC = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_VG = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_VI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_VU = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_WS = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_XA = {
  FULL_DATE: {
    'Md': '[EEEE, MMMM d – EEEE, MMMM d, y]',
    'y': '[EEEE, MMMM d, y – EEEE, MMMM d, y]',
    '_': '[EEEE, MMMM d, y]'
  },
  LONG_DATE: {
    'M': '[MMMM d – MMMM d, y]',
    'd': '[MMMM d – d, y]',
    'y': '[MMMM d, y – MMMM d, y]',
    '_': '[MMMM d, y]'
  },
  MEDIUM_DATE: {
    'M': '[MMM d – MMM d, y]',
    'd': '[MMM d – d, y]',
    'y': '[MMM d, y – MMM d, y]',
    '_': '[MMM d, y]'
  },
  SHORT_DATE: {
    'Mdy': '[M/d/yy – M/d/yy]',
    '_': '[M/d/yy]'
  },
  FULL_TIME: {
    'Mdy': '[[M/d/y], [h:mm:ss a zzzz]]',
    '_': '[h:mm:ss a zzzz]'
  },
  LONG_TIME: {
    'Mdy': '[[M/d/y], [h:mm:ss a z]]',
    '_': '[h:mm:ss a z]'
  },
  MEDIUM_TIME: {
    'Mdy': '[[M/d/y], [h:mm:ss a]]',
    '_': '[h:mm:ss a]'
  },
  SHORT_TIME: {
    'Mdy': '[[M/d/y], [h:mm a]]',
    'a': '[h:mm a – h:mm a]',
    'hm': '[h:mm – h:mm a]',
    '_': '[h:mm a]'
  },
  FULL_DATETIME: {
    '_': '[[EEEE, MMMM d, y] \'åţ\' [h:mm:ss a zzzz] \'one\']'
  },
  LONG_DATETIME: {
    '_': '[[MMMM d, y] \'åţ\' [h:mm:ss a z] \'one\']'
  },
  MEDIUM_DATETIME: {
    '_': '[[MMM d, y], [h:mm:ss a]]'
  },
  SHORT_DATETIME: {
    'a': '[[M/d/yy], [h:mm a – h:mm a]]',
    'hm': '[[M/d/yy], [h:mm – h:mm a]]',
    '_': '[[M/d/yy], [h:mm a]]'
  },
  FALLBACK: '[{0} – {1} one]'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_ZM = {
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
    'a': 'dd/MM/y, h:mm a – h:mm a',
    'hm': 'dd/MM/y, h:mm – h:mm a',
    '_': 'dd/MM/y, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_en_ZW = {
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
    '_': 'dd MMM,y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'd/M/y'
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
    '_': 'EEEE, dd MMMM y \'at\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y \'at\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM,y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y, HH:mm – HH:mm',
    '_': 'd/M/y, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_eo = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d-\'a\' \'de\' MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y-MMMM-dd'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y-MMM-dd'
  },
  SHORT_DATE: {
    '_': 'yy-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-M-d H-\'a\' \'horo\' \'kaj\' m:ss zzzz',
    '_': 'H-\'a\' \'horo\' \'kaj\' m:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d H-\'a\' \'horo\' \'kaj\' m:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d-\'a\' \'de\' MMMM y H-\'a\' \'horo\' \'kaj\' m:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y-MMMM-dd HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y-MMM-dd HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'yy-MM-dd HH:mm–HH:mm',
    '_': 'yy-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_AR = {
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
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/yy – dd/MM/yy',
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
    'ahm': 'HH:mm–HH:mm',
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
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} a el {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_BO = {
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
    '_': 'd MMM \'de\' y'
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
    '_': 'd MMM \'de\' y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy H:mm–H:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_BR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_BZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_CL = {
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
    'Mdy': 'dd-MM-y – dd-MM-y',
    '_': 'dd-MM-y'
  },
  SHORT_DATE: {
    'Mdy': 'dd-MM-yy – dd-MM-yy',
    '_': 'dd-MM-yy'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
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
    '_': 'dd-MM-y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd-MM-yy H:mm–H:mm',
    '_': 'dd-MM-yy HH:mm'
  },
  FALLBACK: '{0} a el {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_CO = {
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
    'My': 'd/MM/y \'al\' d/MM/y',
    'd': 'd/MM/y \'a\' d/MM/y',
    '_': 'd/MM/y'
  },
  SHORT_DATE: {
    'My': 'd/MM/yy \'al\' d/MM/yy',
    'd': 'd/MM/yy \'a\' d/MM/yy',
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
    'a': 'h:mm a \'a\' h:mm a',
    'hm': 'h:mm \'a\' h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y, h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y, h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd/MM/y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/MM/yy, h:mm a \'a\' h:mm a',
    'hm': 'd/MM/yy, h:mm \'a\' h:mm a',
    '_': 'd/MM/yy, h:mm a'
  },
  FALLBACK: '{0} ‘al’ {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_CR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_CU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_DO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_EA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_EC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_GQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_GT = {
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
    'Mdy': 'd/MM/y – d/MM/y',
    '_': 'd/MM/y'
  },
  SHORT_DATE: {
    'Mdy': 'd/MM/yy – d/MM/yy',
    '_': 'd/MM/yy'
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
    '_': 'd/MM/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/MM/yy H:mm–H:mm',
    '_': 'd/MM/yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_HN = {
  FULL_DATE: {
    'Md': 'EEEE, d \'de\' MMMM–EEEE, d \'de\' MMMM \'de\' y',
    'y': 'EEEE, d \'de\' MMMM \'de\' y–EEEE, d \'de\' MMMM \'de\' y',
    '_': 'EEEE dd \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM \'de\' y',
    'd': 'd–d \'de\' MMMM \'de\' y',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM \'de\' y'
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
    '_': 'EEEE dd \'de\' MMMM \'de\' y, HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd \'de\' MMMM \'de\' y, HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_IC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_NI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_PA = {
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
    'Mdy': 'd/M/y–d/M/y',
    '_': 'MM/dd/y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy–d/M/yy',
    '_': 'MM/dd/yy'
  },
  FULL_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'MM/dd/y h:mm a',
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
    '_': 'MM/dd/y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'MM/dd/yy h:mm a – h:mm a',
    'hm': 'MM/dd/yy h:mm – h:mm a',
    '_': 'MM/dd/yy h:mm a'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_PE = {
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
    'Mdy': 'd/M/yy–d/M/yy',
    '_': 'd/MM/yy'
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
    'ahm': 'd/MM/yy H:mm–H:mm',
    '_': 'd/MM/yy HH:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_PH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_PR = {
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
    'Mdy': 'd/M/y–d/M/y',
    '_': 'MM/dd/y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy–d/M/yy',
    '_': 'MM/dd/yy'
  },
  FULL_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'MM/dd/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'MM/dd/y h:mm a',
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
    '_': 'MM/dd/y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'MM/dd/yy h:mm a – h:mm a',
    'hm': 'MM/dd/yy h:mm – h:mm a',
    '_': 'MM/dd/yy h:mm a'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_PY = {
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
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y – d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy \'al\' d/M/yy',
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_SV = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_UY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_es_VE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_et_EE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_eu_ES = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ewo = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ewo_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fa_AF = {
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
    'Mdy': 'M/d/y،‏ H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y،‏ H:mm:ss (z)',
    '_': 'H:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y،‏ H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y،‏ H:mm',
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
    'ahm': 'M/d/y،‏ H:mm تا H:mm',
    '_': 'y/M/d،‏ H:mm'
  },
  FALLBACK: '{0} تا {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fa_IR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ff = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ff_CM = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ff_GN = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ff_MR = {
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
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/y h:mm a – h:mm a',
    'hm': 'd/M/y h:mm–h:mm a',
    '_': 'd/M/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ff_SN = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fi_FI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fil_PH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fo = {
  FULL_DATE: {
    'Md': 'EEEE dd. MMMM–EEEE dd. MMMM y',
    'y': 'EEEE dd. MMMM y–EEEE dd. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'dd. MMMM–dd. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'dd. MMMM y–dd. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy–dd.MM.yy',
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
    '_': 'EEEE, d. MMMM y \'kl\'. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fo_DK = {
  FULL_DATE: {
    'Md': 'EEEE dd. MMMM–EEEE dd. MMMM y',
    'y': 'EEEE dd. MMMM y–EEEE dd. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'dd. MMMM–dd. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'dd. MMMM y–dd. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy–dd.MM.yy',
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
    '_': 'EEEE, d. MMMM y \'kl\'. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fo_FO = {
  FULL_DATE: {
    'Md': 'EEEE dd. MMMM–EEEE dd. MMMM y',
    'y': 'EEEE dd. MMMM y–EEEE dd. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'dd. MMMM–dd. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'dd. MMMM y–dd. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.yy–dd.MM.yy',
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
    '_': 'EEEE, d. MMMM y \'kl\'. HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y \'kl\'. HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd.MM.y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_BE = {
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
    'Mdy': 'dd/MM/yy – dd/MM/yy',
    '_': 'd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y \'à\' H \'h\' mm \'min\' ss \'s\' zzzz',
    '_': 'H \'h\' mm \'min\' ss \'s\' zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' H \'h\' mm \'min\' ss \'s\' z',
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
    '_': 'EEEE d MMMM y \'à\' H \'h\' mm \'min\' ss \'s\' zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/MM/yy \'à\' HH:mm – HH:mm',
    '_': 'd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_BF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_BI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_BJ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_BL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CH = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
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
    '_': 'dd.MM.yy'
  },
  FULL_TIME: {
    'Mdy': 'dd.MM.y \'à\' HH.mm:ss \'h\' zzzz',
    '_': 'HH.mm:ss \'h\' zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y \'à\' HH.mm:ss \'h\' z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y \'à\' HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y \'à\' HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'à\' HH.mm:ss \'h\' zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy \'à\' HH:mm – HH:mm',
    '_': 'dd.MM.yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_DJ = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_DZ = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_FR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_GA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_GF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_GN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_GP = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_GQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_HT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_KM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_LU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_ML = {
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
    '_': 'EEEE d MMMM y \'à\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MR = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_MU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_NC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_NE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_PF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_PM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_RE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_RW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_SC = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_SN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_SY = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_TD = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_TG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_TN = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_VU = {
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
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM/y \'à\' h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y \'à\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'à\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y \'à\' h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y \'à\' h:mm a – h:mm a',
    'hm': 'dd/MM/y \'à\' h:mm – h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_WF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fr_YT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fur = {
  FULL_DATE: {
    'Mdy': 'EEEE dd/MM/y – EEEE dd/MM/y',
    '_': 'EEEE d \'di\' MMMM \'dal\' y'
  },
  LONG_DATE: {
    'M': 'dd/MM/y – d/MM',
    'd': 'd – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd \'di\' MMMM \'dal\' y'
  },
  MEDIUM_DATE: {
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
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
    '_': 'EEEE d \'di\' MMMM \'dal\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'di\' MMMM \'dal\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fur_IT = {
  FULL_DATE: {
    'Mdy': 'EEEE dd/MM/y – EEEE dd/MM/y',
    '_': 'EEEE d \'di\' MMMM \'dal\' y'
  },
  LONG_DATE: {
    'M': 'dd/MM/y – d/MM',
    'd': 'd – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd \'di\' MMMM \'dal\' y'
  },
  MEDIUM_DATE: {
    '_': 'dd/MM/y'
  },
  SHORT_DATE: {
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
    '_': 'EEEE d \'di\' MMMM \'dal\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'di\' MMMM \'dal\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fy = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_fy_NL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ga_IE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gd = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d\'mh\' MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd\'mh\' MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y – d/M/y',
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
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d\'mh\' MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd\'mh\' MMMM y HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gd_GB = {
  FULL_DATE: {
    'M': 'EEEE, d MMMM – EEEE, d MMMM y',
    'd': 'EEEE, d – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d\'mh\' MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd\'mh\' MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/y – d/M/y',
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
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d\'mh\' MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd\'mh\' MMMM y HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gl_ES = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gsw_CH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gsw_FR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gsw_LI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gu_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_guz = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_guz_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gv = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_gv_IM = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ha = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Md': 'dd/MM/yy – dd/MM/yy',
    'y': 'yy-MM-dd – yy-MM-dd',
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ha_GH = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Md': 'dd/MM/yy – dd/MM/yy',
    'y': 'yy-MM-dd – yy-MM-dd',
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ha_NE = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Md': 'dd/MM/yy – dd/MM/yy',
    'y': 'yy-MM-dd – yy-MM-dd',
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ha_NG = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Md': 'dd/MM/yy – dd/MM/yy',
    'y': 'yy-MM-dd – yy-MM-dd',
    '_': 'd/M/yy'
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
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy HH:mm–HH:mm',
    '_': 'd/M/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_haw_US = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_he_IL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hi_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hr_BA = {
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
    'Mdy': 'dd. MM. yy. – dd. MM. yy.',
    '_': 'd. M. yy.'
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
    'ahm': 'd. M. yy. HH:mm – HH:mm',
    '_': 'd. M. yy. HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hr_HR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hsb = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    '_': 'd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y H:mm \'hodź\'.',
    'ahm': 'H:mm – H:mm \'hodź\'.',
    '_': 'H:mm \'hodź\'.'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.M.y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy H:mm – H:mm \'hodź\'.',
    '_': 'd.M.yy H:mm \'hodź\'.'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hsb_DE = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    '_': 'd.M.y'
  },
  SHORT_DATE: {
    '_': 'd.M.yy'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y H:mm:ss zzzz',
    '_': 'H:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y H:mm:ss z',
    '_': 'H:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y H:mm \'hodź\'.',
    'ahm': 'H:mm – H:mm \'hodź\'.',
    '_': 'H:mm \'hodź\'.'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d. MMMM y H:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y H:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd.M.y H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy H:mm – H:mm \'hodź\'.',
    '_': 'd.M.yy H:mm \'hodź\'.'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hu_HU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_hy_AM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_id_ID = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ig = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ig_NG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ii = {
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
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ii_CN = {
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
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_is_IS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_it_CH = {
  FULL_DATE: {
    'M': 'EEEE d MMMM – EEEE d MMMM y',
    'd': 'EEEE d – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
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
    '_': 'dd.MM.yy'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_it_IT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_it_SM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_it_VA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ja_JP = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_jgo = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'Mdy': 'M.d.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M.d.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M.d.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'M.d.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_jgo_CM = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'Mdy': 'M.d.y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M.d.y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M.d.y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'M.d.y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_jmc = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_jmc_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ka_GE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kab = {
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
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/y h:mm a – h:mm a',
    'hm': 'd/M/y h:mm–h:mm a',
    '_': 'd/M/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kab_DZ = {
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
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE d MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/y h:mm a – h:mm a',
    'hm': 'd/M/y h:mm–h:mm a',
    '_': 'd/M/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kam = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kam_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kde = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kde_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kea = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d \'di\' MMMM \'di\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'di\' MMMM \'di\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'd/M/y'
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
    '_': 'EEEE, d \'di\' MMMM \'di\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'di\' MMMM \'di\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kea_CV = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM y',
    'y': 'EEEE, d MMMM y – EEEE, d MMMM y',
    '_': 'EEEE, d \'di\' MMMM \'di\' y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd – d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'di\' MMMM \'di\' y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd/MM/y – dd/MM/y',
    '_': 'd/M/y'
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
    '_': 'EEEE, d \'di\' MMMM \'di\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'di\' MMMM \'di\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm – HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_khq = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_khq_ML = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ki = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ki_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kk_KZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kkj = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE dd MMMM y'
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
    '_': 'dd/MM y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE dd MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM y HH:mm–HH:mm',
    '_': 'dd/MM y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kkj_CM = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE dd MMMM y'
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
    '_': 'dd/MM y'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd/MM y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd/MM y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE dd MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM y HH:mm–HH:mm',
    '_': 'dd/MM y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kl = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kl_GL = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kln = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kln_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_km_KH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kn_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ko_KP = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ko_KR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kok = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kok_IN = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ks = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy h:mm a – h:mm a',
    'hm': 'M/d/yy h:mm–h:mm a',
    '_': 'M/d/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ks_IN = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'M/d/yy'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d, y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d, y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'M/d/yy h:mm a – h:mm a',
    'hm': 'M/d/yy h:mm–h:mm a',
    '_': 'M/d/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksb = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksb_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksf = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksf_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksh = {
  FULL_DATE: {
    'Mdy': 'EEEE y-MM-dd – EEEE y-MM-dd',
    '_': 'EEEE, \'dä\' d. MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'd.–d. MMMM y',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'd.–d. MMMM y',
    'y': 'y MMM d – y MMM d',
    '_': 'd. MMM. y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'd. M. y'
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
    '_': 'EEEE, \'dä\' d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM. y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'd. M. y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ksh_DE = {
  FULL_DATE: {
    'Mdy': 'EEEE y-MM-dd – EEEE y-MM-dd',
    '_': 'EEEE, \'dä\' d. MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'd.–d. MMMM y',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'd.–d. MMMM y',
    'y': 'y MMM d – y MMM d',
    '_': 'd. MMM. y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'd. M. y'
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
    '_': 'EEEE, \'dä\' d. MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd. MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd. MMM. y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'd. M. y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kw = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_kw_GB = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ky_KG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lag = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lag_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lb = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
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
    'Mdy': 'dd.MM.yy – dd.MM.yy',
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
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lb_LU = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
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
    'Mdy': 'dd.MM.yy – dd.MM.yy',
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
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lg = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lg_UG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lkt = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lkt_US = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ln_AO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ln_CD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ln_CF = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ln_CG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lo_LA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lrc = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lrc_IQ = {
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
    'Mdy': 'y-M-d h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-M-d h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-M-d h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-M-d h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd h:mm a – h:mm a',
    'hm': 'y-MM-dd h:mm–h:mm a',
    '_': 'y-MM-dd h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lrc_IR = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lt_LT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lu = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lu_CD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_luo = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_luo_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_luy = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_luy_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_lv_LV = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mas = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mas_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mas_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mer = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mer_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mfe = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mfe_MU = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mg = {
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
    '_': 'y MMM d'
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
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mg_MG = {
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
    '_': 'y MMM d'
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
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mgh = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mgh_MZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mgo = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mgo_CM = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, y MMMM dd'
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
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, y MMMM dd HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mk_MK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ml_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mn_MN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mr_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ms_BN = {
  FULL_DATE: {
    'M': 'd MMMM – d MMMM, y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM y'
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
    '_': 'dd MMMM y h:mm:ss a zzzz'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ms_MY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ms_SG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mt_MT = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mua = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mua_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_my_MM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mzn = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_mzn_IR = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_naq = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_naq_NA = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nb_NO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nb_SJ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nd = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nd_ZW = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nds = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nds_DE = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nds_NL = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ne_IN = {
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y MMMM d, EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd, h:mm a – h:mm a',
    'hm': 'y-MM-dd, h:mm–h:mm a',
    '_': 'y-MM-dd, h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ne_NP = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_AW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_BE = {
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
    'Mdy': 'd/MM/yy – d/MM/yy',
    '_': 'd/MM/yy'
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
    '_': 'EEEE d MMMM y \'om\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'om\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/MM/yy HH:mm–HH:mm',
    '_': 'd/MM/yy HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_BQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_CW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_NL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_SR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nl_SX = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nmg = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nmg_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nn = {
  FULL_DATE: {
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    'y': 'EEEE d. MMMM y–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, \'kl\'. HH:mm:ss zzzz',
    '_': '\'kl\'. HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, \'kl\'. HH:mm:ss z',
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
    '_': 'EEEE d. MMMM y \'kl\'. HH:mm:ss zzzz'
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
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nn_NO = {
  FULL_DATE: {
    'M': 'EEEE d. MMMM–EEEE d. MMMM y',
    'd': 'EEEE d.–EEEE d. MMMM y',
    'y': 'EEEE d. MMMM y–EEEE d. MMMM y',
    '_': 'EEEE d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM–d. MMMM y',
    'd': 'd.–d. MMMM y',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM–d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y–d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y, \'kl\'. HH:mm:ss zzzz',
    '_': '\'kl\'. HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y, \'kl\'. HH:mm:ss z',
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
    '_': 'EEEE d. MMMM y \'kl\'. HH:mm:ss zzzz'
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
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nnh = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': '\'lyɛ\'̌ʼ d \'na\' MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y,HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': '\'lyɛ\'̌ʼ d \'na\' MMMM, y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nnh_CM = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': '\'lyɛ\'̌ʼ d \'na\' MMMM, y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y,HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': '\'lyɛ\'̌ʼ d \'na\' MMMM, y, HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nus = {
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
    '_': 'd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y zzzz h:mm:ss a',
    '_': 'zzzz h:mm:ss a'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y z h:mm:ss a',
    '_': 'z h:mm:ss a'
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
    '_': 'EEEE d MMMM y zzzz h:mm:ss a'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y z h:mm:ss a'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/MM/y h:mm a – h:mm a',
    'hm': 'd/MM/y h:mm–h:mm a',
    '_': 'd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nus_SS = {
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
    '_': 'd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y zzzz h:mm:ss a',
    '_': 'zzzz h:mm:ss a'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y z h:mm:ss a',
    '_': 'z h:mm:ss a'
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
    '_': 'EEEE d MMMM y zzzz h:mm:ss a'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y z h:mm:ss a'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/MM/y h:mm a – h:mm a',
    'hm': 'd/MM/y h:mm–h:mm a',
    '_': 'd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nyn = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_nyn_UG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_om = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_om_ET = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, MMMM d, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_om_KE = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM d, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
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
    '_': 'EEEE, MMMM d, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_or_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_os = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y \'аз\''
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y \'аз\''
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd MMM y \'аз\''
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE, d MMMM, y \'аз\', HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y \'аз\', HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y \'аз\', HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_os_GE = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y \'аз\''
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y \'аз\''
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd MMM y \'аз\''
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE, d MMMM, y \'аз\', HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y \'аз\', HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y \'аз\', HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_os_RU = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y \'аз\''
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM, y \'аз\''
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd MMM y \'аз\''
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE, d MMMM, y \'аз\', HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y \'аз\', HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd MMM y \'аз\', HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy, HH:mm–HH:mm',
    '_': 'dd.MM.yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pa_Arab = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, dd MMMM y'
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pa_Arab_PK = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, dd MMMM y'
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
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dd MMMM y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pa_Guru = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pa_Guru_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pl_PL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ps = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE د y د MMMM d'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'د y د MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss (z)',
    '_': 'H:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd H:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE د y د MMMM d H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'د y د MMMM d H:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y/M/d H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ps_AF = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE د y د MMMM d'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'د y د MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    '_': 'y MMM d'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'y/M/d'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss (zzzz)',
    '_': 'H:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss (z)',
    '_': 'H:mm:ss (z)'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd H:mm:ss',
    '_': 'H:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd H:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'H:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE د y د MMMM d H:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'د y د MMMM d H:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'y MMM d H:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y/M/d H:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_AO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_CH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_CV = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_GQ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_GW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_LU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_MO = {
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
    'a': 'h:mm a – h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d \'de\' MMMM \'de\' y \'às\' h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y \'às\' h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd/MM/y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy, h:mm a – h:mm a',
    'hm': 'dd/MM/yy, h:mm – h:mm a',
    '_': 'dd/MM/yy, h:mm a'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_MZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_ST = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_pt_TL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_qu = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
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
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z d MMMM y'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_qu_BO = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
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
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z d MMMM y'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_qu_EC = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
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
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z d MMMM y'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_qu_PE = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d MMMM, y'
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
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd-MM-y HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'dd-MM-y HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'HH:mm:ss z d MMMM y'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rm = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, \'ils\' d \'da\' MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd \'da\' MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd-MM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd-MM-yy'
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
    '_': 'EEEE, \'ils\' d \'da\' MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'da\' MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MM-y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd-MM-yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rm_CH = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, \'ils\' d \'da\' MMMM y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd \'da\' MMMM y'
  },
  MEDIUM_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd-MM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd-MM-yy'
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
    '_': 'EEEE, \'ils\' d \'da\' MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'da\' MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MM-y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd.MM.yy HH:mm–HH:mm',
    '_': 'dd-MM-yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rn = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rn_BI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ro_MD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ro_RO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rof = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rof_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_BY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_KG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_KZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_MD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_RU = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ru_UA = {
  FULL_DATE: {
    'M': 'ccc, d MMMM – ccc, d MMMM y \'г\'.',
    'd': 'ccc, d – ccc, d MMMM y \'г\'.',
    'y': 'ccc, d MMMM y – ccc, d MMMM y',
    '_': 'EEEE, d MMMM y \'г\'.'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y \'г\'.',
    'd': 'd–d MMMM y \'г\'.',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM y \'г\'.'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y \'г\'.',
    'd': 'd–d MMM y \'г\'.',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y \'г\'.'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rw = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rw_RW = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rwk = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_rwk_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sah = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y \'сыл\' MMMM d \'күнэ\', EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y, MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y, MMM d'
  },
  SHORT_DATE: {
    'My': 'yy-MM-dd – yy-MM-dd',
    'd': 'dd.MM.yy – dd.MM.yy',
    '_': 'yy/M/d'
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
    '_': 'y \'сыл\' MMMM d \'күнэ\', EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y, MMMM d HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y, MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'yy/M/d HH:mm–HH:mm',
    '_': 'yy/M/d HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sah_RU = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'y \'сыл\' MMMM d \'күнэ\', EEEE'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'y, MMMM d'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y, MMM d'
  },
  SHORT_DATE: {
    'My': 'yy-MM-dd – yy-MM-dd',
    'd': 'dd.MM.yy – dd.MM.yy',
    '_': 'yy/M/d'
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
    '_': 'y \'сыл\' MMMM d \'күнэ\', EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y, MMMM d HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'y, MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'yy/M/d HH:mm–HH:mm',
    '_': 'yy/M/d HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_saq = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_saq_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sbp = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sbp_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_se = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_se_FI = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_se_NO = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_se_SE = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_seh = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd \'de\' MMM \'de\' y'
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
    '_': 'EEEE, d \'de\' MMMM \'de\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd \'de\' MMM \'de\' y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_seh_MZ = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, d \'de\' MMMM \'de\' y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd \'de\' MMM \'de\' y'
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
    '_': 'EEEE, d \'de\' MMMM \'de\' y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd \'de\' MMMM \'de\' y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd \'de\' MMM \'de\' y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ses = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ses_ML = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sg = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sg_CF = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_shi = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_shi_Latn = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_shi_Latn_MA = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_shi_Tfng = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_shi_Tfng_MA = {
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
    '_': 'd MMM, y'
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
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/y HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_si_LK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sk_SK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sl_SI = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_smn = {
  FULL_DATE: {
    '_': 'cccc, MMMM d. y'
  },
  LONG_DATE: {
    'M': 'MMMM d. – MMMM d. y',
    'd': 'MMMM d.–d. y',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMMM d. y'
  },
  MEDIUM_DATE: {
    'M': 'MMMM d. – MMMM d. y',
    'd': 'MMMM d.–d. y',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMM d. y'
  },
  SHORT_DATE: {
    'M': 'd.M.–d.M.y',
    'd': 'd. – d.M.y',
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss zzzz',
    '_': 'H.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss z',
    '_': 'H.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss',
    '_': 'H.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm',
    '_': 'H.mm'
  },
  FULL_DATETIME: {
    '_': 'cccc, MMMM d. y \'tme\' H.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d. y \'tme\' H.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d. y \'tme\' H.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y \'tme\' H.mm–H.mm',
    '_': 'd.M.y H.mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_smn_FI = {
  FULL_DATE: {
    '_': 'cccc, MMMM d. y'
  },
  LONG_DATE: {
    'M': 'MMMM d. – MMMM d. y',
    'd': 'MMMM d.–d. y',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMMM d. y'
  },
  MEDIUM_DATE: {
    'M': 'MMMM d. – MMMM d. y',
    'd': 'MMMM d.–d. y',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMM d. y'
  },
  SHORT_DATE: {
    'M': 'd.M.–d.M.y',
    'd': 'd. – d.M.y',
    '_': 'd.M.y'
  },
  FULL_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss zzzz',
    '_': 'H.mm.ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss z',
    '_': 'H.mm.ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm.ss',
    '_': 'H.mm.ss'
  },
  SHORT_TIME: {
    'Mdy': 'd.M.y \'tme\' H.mm',
    '_': 'H.mm'
  },
  FULL_DATETIME: {
    '_': 'cccc, MMMM d. y \'tme\' H.mm.ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'MMMM d. y \'tme\' H.mm.ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'MMM d. y \'tme\' H.mm.ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.y \'tme\' H.mm–H.mm',
    '_': 'd.M.y H.mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sn = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sn_ZW = {
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
    '_': 'y MMMM d, EEEE HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'y MMMM d HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_so = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM dd, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
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
    '_': 'EEEE, MMMM dd, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_so_DJ = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM dd, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
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
    '_': 'EEEE, MMMM dd, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_so_ET = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM dd, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
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
    '_': 'EEEE, MMMM dd, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_so_KE = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM dd, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
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
    '_': 'EEEE, MMMM dd, y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_so_SO = {
  FULL_DATE: {
    'Md': 'y MMMM d, EEEE – MMMM d, EEEE',
    'y': 'y MMMM d, EEEE – y MMMM d, EEEE',
    '_': 'EEEE, MMMM dd, y'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
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
    '_': 'EEEE, MMMM dd, y h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sq_AL = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sq_MK = {
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
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'në\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'në\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy, HH:mm – HH:mm',
    '_': 'd.M.yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sq_XK = {
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
    'ahm': 'HH:mm – HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, d MMMM y \'në\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'në\' HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd.M.yy, HH:mm – HH:mm',
    '_': 'd.M.yy, HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Cyrl = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Cyrl_BA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Cyrl_ME = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Cyrl_RS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Cyrl_XK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Latn_BA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Latn_ME = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Latn_RS = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sr_Latn_XK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sv_AX = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sv_FI = {
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
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'dd-MM-y'
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
    'ahm': 'dd-MM-y HH:mm–HH:mm',
    '_': 'dd-MM-y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sv_SE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sw_CD = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sw_KE = {
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
    '_': 'EEEE, d MMMM y \'saa\' HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y \'saa\' HH:mm:ss z'
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sw_TZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_sw_UG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ta_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ta_LK = {
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
    '_': 'EEEE, d MMMM, y ’அன்று’ HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y ’அன்று’ HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'd/M/yy, HH:mm – HH:mm',
    '_': 'd/M/yy, HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ta_MY = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ta_SG = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_te_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_teo = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_teo_KE = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_teo_UG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_th_TH = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ti = {
  FULL_DATE: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ti_ER = {
  FULL_DATE: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ti_ET = {
  FULL_DATE: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G'
  },
  LONG_DATE: {
    'M': 'y MMMM d – MMMM d',
    'd': 'y MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'dd-MMM-y'
  },
  SHORT_DATE: {
    'Mdy': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-MM-dd h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-MM-dd h:mm a',
    'hm': 'h:mm–h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'EEEE፣ dd MMMM መዓልቲ y G h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'dd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'dd-MMM-y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'dd/MM/yy h:mm a – h:mm a',
    'hm': 'dd/MM/yy h:mm–h:mm a',
    '_': 'dd/MM/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_to = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
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
    '_': 'EEEE d MMMM y, h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y, h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_to_TO = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
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
    '_': 'EEEE d MMMM y, h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y, h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y, h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy, h:mm a – h:mm a',
    'hm': 'd/M/yy, h:mm – h:mm a',
    '_': 'd/M/yy h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_tr_CY = {
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
    'Mdy': 'dd.MM.y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'dd.MM.y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'dd.MM.y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'dd.MM.y h:mm a',
    'a': 'a h:mm – a h:mm',
    'hm': 'a h:mm–h:mm',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'd MMMM y EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'd.MM.y a h:mm – a h:mm',
    'hm': 'd.MM.y a h:mm–h:mm',
    '_': 'd.MM.y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_tr_TR = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_twq = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_twq_NE = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_tzm = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_tzm_MA = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ug = {
  FULL_DATE: {
    'Md': 'EEEE، MMMM d – EEEE، MMMM d، y',
    'y': 'EEEE، MMMM d، y – EEEE، MMMM d، y',
    '_': 'y d-MMMM، EEEE'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d، y',
    'd': 'MMMM d – d، y',
    'y': 'MMMM d، y – MMMM d، y',
    '_': 'd-MMMM، y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d، y',
    'd': 'MMM d – d، y',
    'y': 'MMM d، y – MMM d، y',
    '_': 'd-MMM، y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/y – M/d/y',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-d-M، h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y d-MMMM، EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd-MMMM، y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd-MMM، y، h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd، h:mm a – h:mm a',
    'hm': 'y-MM-dd، h:mm – h:mm a',
    '_': 'y-MM-dd، h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ug_CN = {
  FULL_DATE: {
    'Md': 'EEEE، MMMM d – EEEE، MMMM d، y',
    'y': 'EEEE، MMMM d، y – EEEE، MMMM d، y',
    '_': 'y d-MMMM، EEEE'
  },
  LONG_DATE: {
    'M': 'MMMM d – MMMM d، y',
    'd': 'MMMM d – d، y',
    'y': 'MMMM d، y – MMMM d، y',
    '_': 'd-MMMM، y'
  },
  MEDIUM_DATE: {
    'M': 'MMM d – MMM d، y',
    'd': 'MMM d – d، y',
    'y': 'MMM d، y – MMM d، y',
    '_': 'd-MMM، y'
  },
  SHORT_DATE: {
    'Mdy': 'M/d/y – M/d/y',
    '_': 'y-MM-dd'
  },
  FULL_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'y-d-M، h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'y-d-M، h:mm a',
    'hm': 'h:mm – h:mm a',
    '_': 'h:mm a'
  },
  FULL_DATETIME: {
    '_': 'y d-MMMM، EEEE h:mm:ss a zzzz'
  },
  LONG_DATETIME: {
    '_': 'd-MMMM، y h:mm:ss a z'
  },
  MEDIUM_DATETIME: {
    '_': 'd-MMM، y، h:mm:ss a'
  },
  SHORT_DATETIME: {
    'a': 'y-MM-dd، h:mm a – h:mm a',
    'hm': 'y-MM-dd، h:mm – h:mm a',
    '_': 'y-MM-dd، h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uk_UA = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ur_IN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_ur_PK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Arab = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Arab_AF = {
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
    '_': 'y MMM d HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Cyrl = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'y': 'EEEE, d MMMM, y – EEEE, d MMMM, y',
    '_': 'EEEE, dd MMMM, y'
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
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss (zzzz)',
    '_': 'HH:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss (z)',
    '_': 'HH:mm:ss (z)'
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
    '_': 'EEEE, dd MMMM, y HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Cyrl_UZ = {
  FULL_DATE: {
    'Md': 'EEEE, d MMMM – EEEE, d MMMM, y',
    'y': 'EEEE, d MMMM, y – EEEE, d MMMM, y',
    '_': 'EEEE, dd MMMM, y'
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
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss (zzzz)',
    '_': 'HH:mm:ss (zzzz)'
  },
  LONG_TIME: {
    'Mdy': 'dd/MM/y HH:mm:ss (z)',
    '_': 'HH:mm:ss (z)'
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
    '_': 'EEEE, dd MMMM, y HH:mm:ss (zzzz)'
  },
  LONG_DATETIME: {
    '_': 'd MMMM, y HH:mm:ss (z)'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Latn = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_uz_Latn_UZ = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vai = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vai_Latn = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vai_Latn_LR = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
  },
  FULL_TIME: {
    'Mdy': 'M/d/y h:mm:ss a zzzz',
    '_': 'h:mm:ss a zzzz'
  },
  LONG_TIME: {
    'Mdy': 'M/d/y h:mm:ss a z',
    '_': 'h:mm:ss a z'
  },
  MEDIUM_TIME: {
    'Mdy': 'M/d/y h:mm:ss a',
    '_': 'h:mm:ss a'
  },
  SHORT_TIME: {
    'Mdy': 'M/d/y h:mm a',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vai_Vaii = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vai_Vaii_LR = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'a': 'dd/MM/y h:mm a – h:mm a',
    'hm': 'dd/MM/y h:mm–h:mm a',
    '_': 'dd/MM/y h:mm a'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vi_VN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vun = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_vun_TZ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_wae = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    'y': 'EEEE, d. MMMM y – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd. – d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'ahm': 'HH:mm – HH:mm',
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
    'ahm': 'y-MM-dd HH:mm – HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_wae_CH = {
  FULL_DATE: {
    'M': 'EEEE, d. MMMM – EEEE, d. MMMM y',
    'd': 'EEEE, d. – EEEE, d. MMMM y',
    'y': 'EEEE, d. MMMM y – EEEE, d. MMMM y',
    '_': 'EEEE, d. MMMM y'
  },
  LONG_DATE: {
    'M': 'd. MMMM – d. MMMM y',
    'd': 'd. – d. MMMM y',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'd. MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd. MMM – d. MMM y',
    'd': 'd. – d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    'ahm': 'HH:mm – HH:mm',
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
    'ahm': 'y-MM-dd HH:mm – HH:mm',
    '_': 'y-MM-dd HH:mm'
  },
  FALLBACK: '{0} - {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_xog = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_xog_UG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yav = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yav_CM = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yi = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, dטן MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dטן MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dטן MMM y'
  },
  SHORT_DATE: {
    'd': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd-M-y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dטן MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dטן MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dטן MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yi_001 = {
  FULL_DATE: {
    'Md': 'EEEE d MMMM – EEEE d MMMM y',
    'y': 'EEEE d MMMM y – EEEE d MMMM y',
    '_': 'EEEE, dטן MMMM y'
  },
  LONG_DATE: {
    'M': 'd MMMM – d MMMM y',
    'd': 'd–d MMMM y',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dטן MMMM y'
  },
  MEDIUM_DATE: {
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'dטן MMM y'
  },
  SHORT_DATE: {
    'd': 'yy-MM-dd – yy-MM-dd',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss zzzz',
    '_': 'HH:mm:ss zzzz'
  },
  LONG_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss z',
    '_': 'HH:mm:ss z'
  },
  MEDIUM_TIME: {
    'Mdy': 'd-M-y, HH:mm:ss',
    '_': 'HH:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'd-M-y, HH:mm',
    'ahm': 'HH:mm–HH:mm',
    '_': 'HH:mm'
  },
  FULL_DATETIME: {
    '_': 'EEEE, dטן MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'dטן MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'dטן MMM y, HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/yy, HH:mm–HH:mm',
    '_': 'dd/MM/yy HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yo = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yo_BJ = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yo_NG = {
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
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'dd/MM/y'
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
    '_': 'EEEE, d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'dd/MM/y HH:mm–HH:mm',
    '_': 'dd/MM/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yue = {
  FULL_DATE: {
    'Mdy': 'd/M/y (EEEE) 至 d/M/y (EEEE)',
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
  FALLBACK: '{0}至{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_yue_HK = {
  FULL_DATE: {
    'Mdy': 'd/M/y (EEEE) 至 d/M/y (EEEE)',
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
  FALLBACK: '{0}至{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zgh = {
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
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'd/M/y'
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
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zgh_MA = {
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
    '_': 'd MMM, y'
  },
  SHORT_DATE: {
    'Mdy': 'y-MM-dd – y-MM-dd',
    '_': 'd/M/y'
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
    '_': 'EEEE d MMMM y HH:mm:ss zzzz'
  },
  LONG_DATETIME: {
    '_': 'd MMMM y HH:mm:ss z'
  },
  MEDIUM_DATETIME: {
    '_': 'd MMM, y HH:mm:ss'
  },
  SHORT_DATETIME: {
    'ahm': 'y-MM-dd HH:mm–HH:mm',
    '_': 'd/M/y HH:mm'
  },
  FALLBACK: '{0} – {1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hans = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hans_CN = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hans_HK = {
  FULL_DATE: {
    'Mdy': 'd/M/yEEEE至d/M/yEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy至d/M/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'd/M/y zzzz ah:mm:ss',
    '_': 'zzzz ah:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'd/M/y z ah:mm:ss',
    '_': 'z ah:mm:ss'
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
    '_': 'y年M月d日EEEE zzzz ah:mm:ss'
  },
  LONG_DATETIME: {
    '_': 'y年M月d日 z ah:mm:ss'
  },
  MEDIUM_DATETIME: {
    '_': 'y年M月d日 ah:mm:ss'
  },
  SHORT_DATETIME: {
    'a': 'd/M/yy ah:mm至ah:mm',
    'hm': 'd/M/yy ah:mm至h:mm',
    '_': 'd/M/yy ah:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hans_MO = {
  FULL_DATE: {
    'Mdy': 'd/M/yEEEE至d/M/yEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy至d/M/yy',
    '_': 'd/M/yy'
  },
  FULL_TIME: {
    'Mdy': 'y年M月d日 zzzz ah:mm:ss',
    '_': 'zzzz ah:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'y年M月d日 z ah:mm:ss',
    '_': 'z ah:mm:ss'
  },
  MEDIUM_TIME: {
    'Mdy': 'y年M月d日 ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y年M月d日 ah:mm',
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
    'a': 'yy年M月d日 ah:mm至ah:mm',
    'hm': 'yy年M月d日 ah:mm至h:mm',
    '_': 'd/M/yy ah:mm'
  },
  FALLBACK: '{0}–{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hans_SG = {
  FULL_DATE: {
    'Mdy': 'd/M/yEEEE至d/M/yEEEE',
    '_': 'y年M月d日EEEE'
  },
  LONG_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  MEDIUM_DATE: {
    'Mdy': 'd/M/y至d/M/y',
    '_': 'y年M月d日'
  },
  SHORT_DATE: {
    'Mdy': 'd/M/yy至d/M/yy',
    '_': 'dd/MM/yy'
  },
  FULL_TIME: {
    'Mdy': 'y年M月d日 zzzz ah:mm:ss',
    '_': 'zzzz ah:mm:ss'
  },
  LONG_TIME: {
    'Mdy': 'y年M月d日 z ah:mm:ss',
    '_': 'z ah:mm:ss'
  },
  MEDIUM_TIME: {
    'Mdy': 'y年M月d日 ah:mm:ss',
    '_': 'ah:mm:ss'
  },
  SHORT_TIME: {
    'Mdy': 'y年M月d日 ah:mm',
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
    'a': 'yy年MM月dd日 ah:mm至ah:mm',
    'hm': 'yy年MM月dd日 ah:mm至h:mm',
    '_': 'dd/MM/yy ah:mm'
  },
  FALLBACK: '{0}至{1}'
};

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hant = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hant_HK = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hant_MO = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zh_Hant_TW = {
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

/** @const {!dateIntervalSymbols.DateIntervalSymbols} */
exports.DateIntervalSymbols_zu_ZA = {
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

if (goog.LOCALE == 'af_NA' || goog.LOCALE == 'af-NA') {
  defaultSymbols = exports.DateIntervalSymbols_af_NA;
} else if (goog.LOCALE == 'af_ZA' || goog.LOCALE == 'af-ZA') {
  defaultSymbols = exports.DateIntervalSymbols_af_ZA;
} else if (goog.LOCALE == 'agq') {
  defaultSymbols = exports.DateIntervalSymbols_agq;
} else if (goog.LOCALE == 'agq_CM' || goog.LOCALE == 'agq-CM') {
  defaultSymbols = exports.DateIntervalSymbols_agq_CM;
} else if (goog.LOCALE == 'ak') {
  defaultSymbols = exports.DateIntervalSymbols_ak;
} else if (goog.LOCALE == 'ak_GH' || goog.LOCALE == 'ak-GH') {
  defaultSymbols = exports.DateIntervalSymbols_ak_GH;
} else if (goog.LOCALE == 'am_ET' || goog.LOCALE == 'am-ET') {
  defaultSymbols = exports.DateIntervalSymbols_am_ET;
} else if (goog.LOCALE == 'ar_001' || goog.LOCALE == 'ar-001') {
  defaultSymbols = exports.DateIntervalSymbols_ar_001;
} else if (goog.LOCALE == 'ar_AE' || goog.LOCALE == 'ar-AE') {
  defaultSymbols = exports.DateIntervalSymbols_ar_AE;
} else if (goog.LOCALE == 'ar_BH' || goog.LOCALE == 'ar-BH') {
  defaultSymbols = exports.DateIntervalSymbols_ar_BH;
} else if (goog.LOCALE == 'ar_DJ' || goog.LOCALE == 'ar-DJ') {
  defaultSymbols = exports.DateIntervalSymbols_ar_DJ;
} else if (goog.LOCALE == 'ar_EG' || goog.LOCALE == 'ar-EG') {
  defaultSymbols = exports.DateIntervalSymbols_ar_EG;
} else if (goog.LOCALE == 'ar_EH' || goog.LOCALE == 'ar-EH') {
  defaultSymbols = exports.DateIntervalSymbols_ar_EH;
} else if (goog.LOCALE == 'ar_ER' || goog.LOCALE == 'ar-ER') {
  defaultSymbols = exports.DateIntervalSymbols_ar_ER;
} else if (goog.LOCALE == 'ar_IL' || goog.LOCALE == 'ar-IL') {
  defaultSymbols = exports.DateIntervalSymbols_ar_IL;
} else if (goog.LOCALE == 'ar_IQ' || goog.LOCALE == 'ar-IQ') {
  defaultSymbols = exports.DateIntervalSymbols_ar_IQ;
} else if (goog.LOCALE == 'ar_JO' || goog.LOCALE == 'ar-JO') {
  defaultSymbols = exports.DateIntervalSymbols_ar_JO;
} else if (goog.LOCALE == 'ar_KM' || goog.LOCALE == 'ar-KM') {
  defaultSymbols = exports.DateIntervalSymbols_ar_KM;
} else if (goog.LOCALE == 'ar_KW' || goog.LOCALE == 'ar-KW') {
  defaultSymbols = exports.DateIntervalSymbols_ar_KW;
} else if (goog.LOCALE == 'ar_LB' || goog.LOCALE == 'ar-LB') {
  defaultSymbols = exports.DateIntervalSymbols_ar_LB;
} else if (goog.LOCALE == 'ar_LY' || goog.LOCALE == 'ar-LY') {
  defaultSymbols = exports.DateIntervalSymbols_ar_LY;
} else if (goog.LOCALE == 'ar_MA' || goog.LOCALE == 'ar-MA') {
  defaultSymbols = exports.DateIntervalSymbols_ar_MA;
} else if (goog.LOCALE == 'ar_MR' || goog.LOCALE == 'ar-MR') {
  defaultSymbols = exports.DateIntervalSymbols_ar_MR;
} else if (goog.LOCALE == 'ar_OM' || goog.LOCALE == 'ar-OM') {
  defaultSymbols = exports.DateIntervalSymbols_ar_OM;
} else if (goog.LOCALE == 'ar_PS' || goog.LOCALE == 'ar-PS') {
  defaultSymbols = exports.DateIntervalSymbols_ar_PS;
} else if (goog.LOCALE == 'ar_QA' || goog.LOCALE == 'ar-QA') {
  defaultSymbols = exports.DateIntervalSymbols_ar_QA;
} else if (goog.LOCALE == 'ar_SA' || goog.LOCALE == 'ar-SA') {
  defaultSymbols = exports.DateIntervalSymbols_ar_SA;
} else if (goog.LOCALE == 'ar_SD' || goog.LOCALE == 'ar-SD') {
  defaultSymbols = exports.DateIntervalSymbols_ar_SD;
} else if (goog.LOCALE == 'ar_SO' || goog.LOCALE == 'ar-SO') {
  defaultSymbols = exports.DateIntervalSymbols_ar_SO;
} else if (goog.LOCALE == 'ar_SS' || goog.LOCALE == 'ar-SS') {
  defaultSymbols = exports.DateIntervalSymbols_ar_SS;
} else if (goog.LOCALE == 'ar_SY' || goog.LOCALE == 'ar-SY') {
  defaultSymbols = exports.DateIntervalSymbols_ar_SY;
} else if (goog.LOCALE == 'ar_TD' || goog.LOCALE == 'ar-TD') {
  defaultSymbols = exports.DateIntervalSymbols_ar_TD;
} else if (goog.LOCALE == 'ar_TN' || goog.LOCALE == 'ar-TN') {
  defaultSymbols = exports.DateIntervalSymbols_ar_TN;
} else if (goog.LOCALE == 'ar_XB' || goog.LOCALE == 'ar-XB') {
  defaultSymbols = exports.DateIntervalSymbols_ar_XB;
} else if (goog.LOCALE == 'ar_YE' || goog.LOCALE == 'ar-YE') {
  defaultSymbols = exports.DateIntervalSymbols_ar_YE;
} else if (goog.LOCALE == 'as') {
  defaultSymbols = exports.DateIntervalSymbols_as;
} else if (goog.LOCALE == 'as_IN' || goog.LOCALE == 'as-IN') {
  defaultSymbols = exports.DateIntervalSymbols_as_IN;
} else if (goog.LOCALE == 'asa') {
  defaultSymbols = exports.DateIntervalSymbols_asa;
} else if (goog.LOCALE == 'asa_TZ' || goog.LOCALE == 'asa-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_asa_TZ;
} else if (goog.LOCALE == 'ast') {
  defaultSymbols = exports.DateIntervalSymbols_ast;
} else if (goog.LOCALE == 'ast_ES' || goog.LOCALE == 'ast-ES') {
  defaultSymbols = exports.DateIntervalSymbols_ast_ES;
} else if (goog.LOCALE == 'az_Cyrl' || goog.LOCALE == 'az-Cyrl') {
  defaultSymbols = exports.DateIntervalSymbols_az_Cyrl;
} else if (goog.LOCALE == 'az_Cyrl_AZ' || goog.LOCALE == 'az-Cyrl-AZ') {
  defaultSymbols = exports.DateIntervalSymbols_az_Cyrl_AZ;
} else if (goog.LOCALE == 'az_Latn' || goog.LOCALE == 'az-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_az_Latn;
} else if (goog.LOCALE == 'az_Latn_AZ' || goog.LOCALE == 'az-Latn-AZ') {
  defaultSymbols = exports.DateIntervalSymbols_az_Latn_AZ;
} else if (goog.LOCALE == 'bas') {
  defaultSymbols = exports.DateIntervalSymbols_bas;
} else if (goog.LOCALE == 'bas_CM' || goog.LOCALE == 'bas-CM') {
  defaultSymbols = exports.DateIntervalSymbols_bas_CM;
} else if (goog.LOCALE == 'be_BY' || goog.LOCALE == 'be-BY') {
  defaultSymbols = exports.DateIntervalSymbols_be_BY;
} else if (goog.LOCALE == 'bem') {
  defaultSymbols = exports.DateIntervalSymbols_bem;
} else if (goog.LOCALE == 'bem_ZM' || goog.LOCALE == 'bem-ZM') {
  defaultSymbols = exports.DateIntervalSymbols_bem_ZM;
} else if (goog.LOCALE == 'bez') {
  defaultSymbols = exports.DateIntervalSymbols_bez;
} else if (goog.LOCALE == 'bez_TZ' || goog.LOCALE == 'bez-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_bez_TZ;
} else if (goog.LOCALE == 'bg_BG' || goog.LOCALE == 'bg-BG') {
  defaultSymbols = exports.DateIntervalSymbols_bg_BG;
} else if (goog.LOCALE == 'bm') {
  defaultSymbols = exports.DateIntervalSymbols_bm;
} else if (goog.LOCALE == 'bm_ML' || goog.LOCALE == 'bm-ML') {
  defaultSymbols = exports.DateIntervalSymbols_bm_ML;
} else if (goog.LOCALE == 'bn_BD' || goog.LOCALE == 'bn-BD') {
  defaultSymbols = exports.DateIntervalSymbols_bn_BD;
} else if (goog.LOCALE == 'bn_IN' || goog.LOCALE == 'bn-IN') {
  defaultSymbols = exports.DateIntervalSymbols_bn_IN;
} else if (goog.LOCALE == 'bo') {
  defaultSymbols = exports.DateIntervalSymbols_bo;
} else if (goog.LOCALE == 'bo_CN' || goog.LOCALE == 'bo-CN') {
  defaultSymbols = exports.DateIntervalSymbols_bo_CN;
} else if (goog.LOCALE == 'bo_IN' || goog.LOCALE == 'bo-IN') {
  defaultSymbols = exports.DateIntervalSymbols_bo_IN;
} else if (goog.LOCALE == 'br_FR' || goog.LOCALE == 'br-FR') {
  defaultSymbols = exports.DateIntervalSymbols_br_FR;
} else if (goog.LOCALE == 'brx') {
  defaultSymbols = exports.DateIntervalSymbols_brx;
} else if (goog.LOCALE == 'brx_IN' || goog.LOCALE == 'brx-IN') {
  defaultSymbols = exports.DateIntervalSymbols_brx_IN;
} else if (goog.LOCALE == 'bs_Cyrl' || goog.LOCALE == 'bs-Cyrl') {
  defaultSymbols = exports.DateIntervalSymbols_bs_Cyrl;
} else if (goog.LOCALE == 'bs_Cyrl_BA' || goog.LOCALE == 'bs-Cyrl-BA') {
  defaultSymbols = exports.DateIntervalSymbols_bs_Cyrl_BA;
} else if (goog.LOCALE == 'bs_Latn' || goog.LOCALE == 'bs-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_bs_Latn;
} else if (goog.LOCALE == 'bs_Latn_BA' || goog.LOCALE == 'bs-Latn-BA') {
  defaultSymbols = exports.DateIntervalSymbols_bs_Latn_BA;
} else if (goog.LOCALE == 'ca_AD' || goog.LOCALE == 'ca-AD') {
  defaultSymbols = exports.DateIntervalSymbols_ca_AD;
} else if (goog.LOCALE == 'ca_ES' || goog.LOCALE == 'ca-ES') {
  defaultSymbols = exports.DateIntervalSymbols_ca_ES;
} else if (goog.LOCALE == 'ca_FR' || goog.LOCALE == 'ca-FR') {
  defaultSymbols = exports.DateIntervalSymbols_ca_FR;
} else if (goog.LOCALE == 'ca_IT' || goog.LOCALE == 'ca-IT') {
  defaultSymbols = exports.DateIntervalSymbols_ca_IT;
} else if (goog.LOCALE == 'ce') {
  defaultSymbols = exports.DateIntervalSymbols_ce;
} else if (goog.LOCALE == 'ce_RU' || goog.LOCALE == 'ce-RU') {
  defaultSymbols = exports.DateIntervalSymbols_ce_RU;
} else if (goog.LOCALE == 'cgg') {
  defaultSymbols = exports.DateIntervalSymbols_cgg;
} else if (goog.LOCALE == 'cgg_UG' || goog.LOCALE == 'cgg-UG') {
  defaultSymbols = exports.DateIntervalSymbols_cgg_UG;
} else if (goog.LOCALE == 'chr_US' || goog.LOCALE == 'chr-US') {
  defaultSymbols = exports.DateIntervalSymbols_chr_US;
} else if (goog.LOCALE == 'ckb') {
  defaultSymbols = exports.DateIntervalSymbols_ckb;
} else if (goog.LOCALE == 'ckb_IQ' || goog.LOCALE == 'ckb-IQ') {
  defaultSymbols = exports.DateIntervalSymbols_ckb_IQ;
} else if (goog.LOCALE == 'ckb_IR' || goog.LOCALE == 'ckb-IR') {
  defaultSymbols = exports.DateIntervalSymbols_ckb_IR;
} else if (goog.LOCALE == 'cs_CZ' || goog.LOCALE == 'cs-CZ') {
  defaultSymbols = exports.DateIntervalSymbols_cs_CZ;
} else if (goog.LOCALE == 'cy_GB' || goog.LOCALE == 'cy-GB') {
  defaultSymbols = exports.DateIntervalSymbols_cy_GB;
} else if (goog.LOCALE == 'da_DK' || goog.LOCALE == 'da-DK') {
  defaultSymbols = exports.DateIntervalSymbols_da_DK;
} else if (goog.LOCALE == 'da_GL' || goog.LOCALE == 'da-GL') {
  defaultSymbols = exports.DateIntervalSymbols_da_GL;
} else if (goog.LOCALE == 'dav') {
  defaultSymbols = exports.DateIntervalSymbols_dav;
} else if (goog.LOCALE == 'dav_KE' || goog.LOCALE == 'dav-KE') {
  defaultSymbols = exports.DateIntervalSymbols_dav_KE;
} else if (goog.LOCALE == 'de_BE' || goog.LOCALE == 'de-BE') {
  defaultSymbols = exports.DateIntervalSymbols_de_BE;
} else if (goog.LOCALE == 'de_DE' || goog.LOCALE == 'de-DE') {
  defaultSymbols = exports.DateIntervalSymbols_de_DE;
} else if (goog.LOCALE == 'de_IT' || goog.LOCALE == 'de-IT') {
  defaultSymbols = exports.DateIntervalSymbols_de_IT;
} else if (goog.LOCALE == 'de_LI' || goog.LOCALE == 'de-LI') {
  defaultSymbols = exports.DateIntervalSymbols_de_LI;
} else if (goog.LOCALE == 'de_LU' || goog.LOCALE == 'de-LU') {
  defaultSymbols = exports.DateIntervalSymbols_de_LU;
} else if (goog.LOCALE == 'dje') {
  defaultSymbols = exports.DateIntervalSymbols_dje;
} else if (goog.LOCALE == 'dje_NE' || goog.LOCALE == 'dje-NE') {
  defaultSymbols = exports.DateIntervalSymbols_dje_NE;
} else if (goog.LOCALE == 'dsb') {
  defaultSymbols = exports.DateIntervalSymbols_dsb;
} else if (goog.LOCALE == 'dsb_DE' || goog.LOCALE == 'dsb-DE') {
  defaultSymbols = exports.DateIntervalSymbols_dsb_DE;
} else if (goog.LOCALE == 'dua') {
  defaultSymbols = exports.DateIntervalSymbols_dua;
} else if (goog.LOCALE == 'dua_CM' || goog.LOCALE == 'dua-CM') {
  defaultSymbols = exports.DateIntervalSymbols_dua_CM;
} else if (goog.LOCALE == 'dyo') {
  defaultSymbols = exports.DateIntervalSymbols_dyo;
} else if (goog.LOCALE == 'dyo_SN' || goog.LOCALE == 'dyo-SN') {
  defaultSymbols = exports.DateIntervalSymbols_dyo_SN;
} else if (goog.LOCALE == 'dz') {
  defaultSymbols = exports.DateIntervalSymbols_dz;
} else if (goog.LOCALE == 'dz_BT' || goog.LOCALE == 'dz-BT') {
  defaultSymbols = exports.DateIntervalSymbols_dz_BT;
} else if (goog.LOCALE == 'ebu') {
  defaultSymbols = exports.DateIntervalSymbols_ebu;
} else if (goog.LOCALE == 'ebu_KE' || goog.LOCALE == 'ebu-KE') {
  defaultSymbols = exports.DateIntervalSymbols_ebu_KE;
} else if (goog.LOCALE == 'ee') {
  defaultSymbols = exports.DateIntervalSymbols_ee;
} else if (goog.LOCALE == 'ee_GH' || goog.LOCALE == 'ee-GH') {
  defaultSymbols = exports.DateIntervalSymbols_ee_GH;
} else if (goog.LOCALE == 'ee_TG' || goog.LOCALE == 'ee-TG') {
  defaultSymbols = exports.DateIntervalSymbols_ee_TG;
} else if (goog.LOCALE == 'el_CY' || goog.LOCALE == 'el-CY') {
  defaultSymbols = exports.DateIntervalSymbols_el_CY;
} else if (goog.LOCALE == 'el_GR' || goog.LOCALE == 'el-GR') {
  defaultSymbols = exports.DateIntervalSymbols_el_GR;
} else if (goog.LOCALE == 'en_001' || goog.LOCALE == 'en-001') {
  defaultSymbols = exports.DateIntervalSymbols_en_001;
} else if (goog.LOCALE == 'en_150' || goog.LOCALE == 'en-150') {
  defaultSymbols = exports.DateIntervalSymbols_en_150;
} else if (goog.LOCALE == 'en_AG' || goog.LOCALE == 'en-AG') {
  defaultSymbols = exports.DateIntervalSymbols_en_AG;
} else if (goog.LOCALE == 'en_AI' || goog.LOCALE == 'en-AI') {
  defaultSymbols = exports.DateIntervalSymbols_en_AI;
} else if (goog.LOCALE == 'en_AS' || goog.LOCALE == 'en-AS') {
  defaultSymbols = exports.DateIntervalSymbols_en_AS;
} else if (goog.LOCALE == 'en_AT' || goog.LOCALE == 'en-AT') {
  defaultSymbols = exports.DateIntervalSymbols_en_AT;
} else if (goog.LOCALE == 'en_BB' || goog.LOCALE == 'en-BB') {
  defaultSymbols = exports.DateIntervalSymbols_en_BB;
} else if (goog.LOCALE == 'en_BE' || goog.LOCALE == 'en-BE') {
  defaultSymbols = exports.DateIntervalSymbols_en_BE;
} else if (goog.LOCALE == 'en_BI' || goog.LOCALE == 'en-BI') {
  defaultSymbols = exports.DateIntervalSymbols_en_BI;
} else if (goog.LOCALE == 'en_BM' || goog.LOCALE == 'en-BM') {
  defaultSymbols = exports.DateIntervalSymbols_en_BM;
} else if (goog.LOCALE == 'en_BS' || goog.LOCALE == 'en-BS') {
  defaultSymbols = exports.DateIntervalSymbols_en_BS;
} else if (goog.LOCALE == 'en_BW' || goog.LOCALE == 'en-BW') {
  defaultSymbols = exports.DateIntervalSymbols_en_BW;
} else if (goog.LOCALE == 'en_BZ' || goog.LOCALE == 'en-BZ') {
  defaultSymbols = exports.DateIntervalSymbols_en_BZ;
} else if (goog.LOCALE == 'en_CC' || goog.LOCALE == 'en-CC') {
  defaultSymbols = exports.DateIntervalSymbols_en_CC;
} else if (goog.LOCALE == 'en_CH' || goog.LOCALE == 'en-CH') {
  defaultSymbols = exports.DateIntervalSymbols_en_CH;
} else if (goog.LOCALE == 'en_CK' || goog.LOCALE == 'en-CK') {
  defaultSymbols = exports.DateIntervalSymbols_en_CK;
} else if (goog.LOCALE == 'en_CM' || goog.LOCALE == 'en-CM') {
  defaultSymbols = exports.DateIntervalSymbols_en_CM;
} else if (goog.LOCALE == 'en_CX' || goog.LOCALE == 'en-CX') {
  defaultSymbols = exports.DateIntervalSymbols_en_CX;
} else if (goog.LOCALE == 'en_CY' || goog.LOCALE == 'en-CY') {
  defaultSymbols = exports.DateIntervalSymbols_en_CY;
} else if (goog.LOCALE == 'en_DE' || goog.LOCALE == 'en-DE') {
  defaultSymbols = exports.DateIntervalSymbols_en_DE;
} else if (goog.LOCALE == 'en_DG' || goog.LOCALE == 'en-DG') {
  defaultSymbols = exports.DateIntervalSymbols_en_DG;
} else if (goog.LOCALE == 'en_DK' || goog.LOCALE == 'en-DK') {
  defaultSymbols = exports.DateIntervalSymbols_en_DK;
} else if (goog.LOCALE == 'en_DM' || goog.LOCALE == 'en-DM') {
  defaultSymbols = exports.DateIntervalSymbols_en_DM;
} else if (goog.LOCALE == 'en_ER' || goog.LOCALE == 'en-ER') {
  defaultSymbols = exports.DateIntervalSymbols_en_ER;
} else if (goog.LOCALE == 'en_FI' || goog.LOCALE == 'en-FI') {
  defaultSymbols = exports.DateIntervalSymbols_en_FI;
} else if (goog.LOCALE == 'en_FJ' || goog.LOCALE == 'en-FJ') {
  defaultSymbols = exports.DateIntervalSymbols_en_FJ;
} else if (goog.LOCALE == 'en_FK' || goog.LOCALE == 'en-FK') {
  defaultSymbols = exports.DateIntervalSymbols_en_FK;
} else if (goog.LOCALE == 'en_FM' || goog.LOCALE == 'en-FM') {
  defaultSymbols = exports.DateIntervalSymbols_en_FM;
} else if (goog.LOCALE == 'en_GD' || goog.LOCALE == 'en-GD') {
  defaultSymbols = exports.DateIntervalSymbols_en_GD;
} else if (goog.LOCALE == 'en_GG' || goog.LOCALE == 'en-GG') {
  defaultSymbols = exports.DateIntervalSymbols_en_GG;
} else if (goog.LOCALE == 'en_GH' || goog.LOCALE == 'en-GH') {
  defaultSymbols = exports.DateIntervalSymbols_en_GH;
} else if (goog.LOCALE == 'en_GI' || goog.LOCALE == 'en-GI') {
  defaultSymbols = exports.DateIntervalSymbols_en_GI;
} else if (goog.LOCALE == 'en_GM' || goog.LOCALE == 'en-GM') {
  defaultSymbols = exports.DateIntervalSymbols_en_GM;
} else if (goog.LOCALE == 'en_GU' || goog.LOCALE == 'en-GU') {
  defaultSymbols = exports.DateIntervalSymbols_en_GU;
} else if (goog.LOCALE == 'en_GY' || goog.LOCALE == 'en-GY') {
  defaultSymbols = exports.DateIntervalSymbols_en_GY;
} else if (goog.LOCALE == 'en_HK' || goog.LOCALE == 'en-HK') {
  defaultSymbols = exports.DateIntervalSymbols_en_HK;
} else if (goog.LOCALE == 'en_IL' || goog.LOCALE == 'en-IL') {
  defaultSymbols = exports.DateIntervalSymbols_en_IL;
} else if (goog.LOCALE == 'en_IM' || goog.LOCALE == 'en-IM') {
  defaultSymbols = exports.DateIntervalSymbols_en_IM;
} else if (goog.LOCALE == 'en_IO' || goog.LOCALE == 'en-IO') {
  defaultSymbols = exports.DateIntervalSymbols_en_IO;
} else if (goog.LOCALE == 'en_JE' || goog.LOCALE == 'en-JE') {
  defaultSymbols = exports.DateIntervalSymbols_en_JE;
} else if (goog.LOCALE == 'en_JM' || goog.LOCALE == 'en-JM') {
  defaultSymbols = exports.DateIntervalSymbols_en_JM;
} else if (goog.LOCALE == 'en_KE' || goog.LOCALE == 'en-KE') {
  defaultSymbols = exports.DateIntervalSymbols_en_KE;
} else if (goog.LOCALE == 'en_KI' || goog.LOCALE == 'en-KI') {
  defaultSymbols = exports.DateIntervalSymbols_en_KI;
} else if (goog.LOCALE == 'en_KN' || goog.LOCALE == 'en-KN') {
  defaultSymbols = exports.DateIntervalSymbols_en_KN;
} else if (goog.LOCALE == 'en_KY' || goog.LOCALE == 'en-KY') {
  defaultSymbols = exports.DateIntervalSymbols_en_KY;
} else if (goog.LOCALE == 'en_LC' || goog.LOCALE == 'en-LC') {
  defaultSymbols = exports.DateIntervalSymbols_en_LC;
} else if (goog.LOCALE == 'en_LR' || goog.LOCALE == 'en-LR') {
  defaultSymbols = exports.DateIntervalSymbols_en_LR;
} else if (goog.LOCALE == 'en_LS' || goog.LOCALE == 'en-LS') {
  defaultSymbols = exports.DateIntervalSymbols_en_LS;
} else if (goog.LOCALE == 'en_MG' || goog.LOCALE == 'en-MG') {
  defaultSymbols = exports.DateIntervalSymbols_en_MG;
} else if (goog.LOCALE == 'en_MH' || goog.LOCALE == 'en-MH') {
  defaultSymbols = exports.DateIntervalSymbols_en_MH;
} else if (goog.LOCALE == 'en_MO' || goog.LOCALE == 'en-MO') {
  defaultSymbols = exports.DateIntervalSymbols_en_MO;
} else if (goog.LOCALE == 'en_MP' || goog.LOCALE == 'en-MP') {
  defaultSymbols = exports.DateIntervalSymbols_en_MP;
} else if (goog.LOCALE == 'en_MS' || goog.LOCALE == 'en-MS') {
  defaultSymbols = exports.DateIntervalSymbols_en_MS;
} else if (goog.LOCALE == 'en_MT' || goog.LOCALE == 'en-MT') {
  defaultSymbols = exports.DateIntervalSymbols_en_MT;
} else if (goog.LOCALE == 'en_MU' || goog.LOCALE == 'en-MU') {
  defaultSymbols = exports.DateIntervalSymbols_en_MU;
} else if (goog.LOCALE == 'en_MW' || goog.LOCALE == 'en-MW') {
  defaultSymbols = exports.DateIntervalSymbols_en_MW;
} else if (goog.LOCALE == 'en_MY' || goog.LOCALE == 'en-MY') {
  defaultSymbols = exports.DateIntervalSymbols_en_MY;
} else if (goog.LOCALE == 'en_NA' || goog.LOCALE == 'en-NA') {
  defaultSymbols = exports.DateIntervalSymbols_en_NA;
} else if (goog.LOCALE == 'en_NF' || goog.LOCALE == 'en-NF') {
  defaultSymbols = exports.DateIntervalSymbols_en_NF;
} else if (goog.LOCALE == 'en_NG' || goog.LOCALE == 'en-NG') {
  defaultSymbols = exports.DateIntervalSymbols_en_NG;
} else if (goog.LOCALE == 'en_NL' || goog.LOCALE == 'en-NL') {
  defaultSymbols = exports.DateIntervalSymbols_en_NL;
} else if (goog.LOCALE == 'en_NR' || goog.LOCALE == 'en-NR') {
  defaultSymbols = exports.DateIntervalSymbols_en_NR;
} else if (goog.LOCALE == 'en_NU' || goog.LOCALE == 'en-NU') {
  defaultSymbols = exports.DateIntervalSymbols_en_NU;
} else if (goog.LOCALE == 'en_NZ' || goog.LOCALE == 'en-NZ') {
  defaultSymbols = exports.DateIntervalSymbols_en_NZ;
} else if (goog.LOCALE == 'en_PG' || goog.LOCALE == 'en-PG') {
  defaultSymbols = exports.DateIntervalSymbols_en_PG;
} else if (goog.LOCALE == 'en_PH' || goog.LOCALE == 'en-PH') {
  defaultSymbols = exports.DateIntervalSymbols_en_PH;
} else if (goog.LOCALE == 'en_PK' || goog.LOCALE == 'en-PK') {
  defaultSymbols = exports.DateIntervalSymbols_en_PK;
} else if (goog.LOCALE == 'en_PN' || goog.LOCALE == 'en-PN') {
  defaultSymbols = exports.DateIntervalSymbols_en_PN;
} else if (goog.LOCALE == 'en_PR' || goog.LOCALE == 'en-PR') {
  defaultSymbols = exports.DateIntervalSymbols_en_PR;
} else if (goog.LOCALE == 'en_PW' || goog.LOCALE == 'en-PW') {
  defaultSymbols = exports.DateIntervalSymbols_en_PW;
} else if (goog.LOCALE == 'en_RW' || goog.LOCALE == 'en-RW') {
  defaultSymbols = exports.DateIntervalSymbols_en_RW;
} else if (goog.LOCALE == 'en_SB' || goog.LOCALE == 'en-SB') {
  defaultSymbols = exports.DateIntervalSymbols_en_SB;
} else if (goog.LOCALE == 'en_SC' || goog.LOCALE == 'en-SC') {
  defaultSymbols = exports.DateIntervalSymbols_en_SC;
} else if (goog.LOCALE == 'en_SD' || goog.LOCALE == 'en-SD') {
  defaultSymbols = exports.DateIntervalSymbols_en_SD;
} else if (goog.LOCALE == 'en_SE' || goog.LOCALE == 'en-SE') {
  defaultSymbols = exports.DateIntervalSymbols_en_SE;
} else if (goog.LOCALE == 'en_SH' || goog.LOCALE == 'en-SH') {
  defaultSymbols = exports.DateIntervalSymbols_en_SH;
} else if (goog.LOCALE == 'en_SI' || goog.LOCALE == 'en-SI') {
  defaultSymbols = exports.DateIntervalSymbols_en_SI;
} else if (goog.LOCALE == 'en_SL' || goog.LOCALE == 'en-SL') {
  defaultSymbols = exports.DateIntervalSymbols_en_SL;
} else if (goog.LOCALE == 'en_SS' || goog.LOCALE == 'en-SS') {
  defaultSymbols = exports.DateIntervalSymbols_en_SS;
} else if (goog.LOCALE == 'en_SX' || goog.LOCALE == 'en-SX') {
  defaultSymbols = exports.DateIntervalSymbols_en_SX;
} else if (goog.LOCALE == 'en_SZ' || goog.LOCALE == 'en-SZ') {
  defaultSymbols = exports.DateIntervalSymbols_en_SZ;
} else if (goog.LOCALE == 'en_TC' || goog.LOCALE == 'en-TC') {
  defaultSymbols = exports.DateIntervalSymbols_en_TC;
} else if (goog.LOCALE == 'en_TK' || goog.LOCALE == 'en-TK') {
  defaultSymbols = exports.DateIntervalSymbols_en_TK;
} else if (goog.LOCALE == 'en_TO' || goog.LOCALE == 'en-TO') {
  defaultSymbols = exports.DateIntervalSymbols_en_TO;
} else if (goog.LOCALE == 'en_TT' || goog.LOCALE == 'en-TT') {
  defaultSymbols = exports.DateIntervalSymbols_en_TT;
} else if (goog.LOCALE == 'en_TV' || goog.LOCALE == 'en-TV') {
  defaultSymbols = exports.DateIntervalSymbols_en_TV;
} else if (goog.LOCALE == 'en_TZ' || goog.LOCALE == 'en-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_en_TZ;
} else if (goog.LOCALE == 'en_UG' || goog.LOCALE == 'en-UG') {
  defaultSymbols = exports.DateIntervalSymbols_en_UG;
} else if (goog.LOCALE == 'en_UM' || goog.LOCALE == 'en-UM') {
  defaultSymbols = exports.DateIntervalSymbols_en_UM;
} else if (goog.LOCALE == 'en_US_POSIX' || goog.LOCALE == 'en-US-POSIX') {
  defaultSymbols = exports.DateIntervalSymbols_en_US_POSIX;
} else if (goog.LOCALE == 'en_VC' || goog.LOCALE == 'en-VC') {
  defaultSymbols = exports.DateIntervalSymbols_en_VC;
} else if (goog.LOCALE == 'en_VG' || goog.LOCALE == 'en-VG') {
  defaultSymbols = exports.DateIntervalSymbols_en_VG;
} else if (goog.LOCALE == 'en_VI' || goog.LOCALE == 'en-VI') {
  defaultSymbols = exports.DateIntervalSymbols_en_VI;
} else if (goog.LOCALE == 'en_VU' || goog.LOCALE == 'en-VU') {
  defaultSymbols = exports.DateIntervalSymbols_en_VU;
} else if (goog.LOCALE == 'en_WS' || goog.LOCALE == 'en-WS') {
  defaultSymbols = exports.DateIntervalSymbols_en_WS;
} else if (goog.LOCALE == 'en_XA' || goog.LOCALE == 'en-XA') {
  defaultSymbols = exports.DateIntervalSymbols_en_XA;
} else if (goog.LOCALE == 'en_ZM' || goog.LOCALE == 'en-ZM') {
  defaultSymbols = exports.DateIntervalSymbols_en_ZM;
} else if (goog.LOCALE == 'en_ZW' || goog.LOCALE == 'en-ZW') {
  defaultSymbols = exports.DateIntervalSymbols_en_ZW;
} else if (goog.LOCALE == 'eo') {
  defaultSymbols = exports.DateIntervalSymbols_eo;
} else if (goog.LOCALE == 'es_AR' || goog.LOCALE == 'es-AR') {
  defaultSymbols = exports.DateIntervalSymbols_es_AR;
} else if (goog.LOCALE == 'es_BO' || goog.LOCALE == 'es-BO') {
  defaultSymbols = exports.DateIntervalSymbols_es_BO;
} else if (goog.LOCALE == 'es_BR' || goog.LOCALE == 'es-BR') {
  defaultSymbols = exports.DateIntervalSymbols_es_BR;
} else if (goog.LOCALE == 'es_BZ' || goog.LOCALE == 'es-BZ') {
  defaultSymbols = exports.DateIntervalSymbols_es_BZ;
} else if (goog.LOCALE == 'es_CL' || goog.LOCALE == 'es-CL') {
  defaultSymbols = exports.DateIntervalSymbols_es_CL;
} else if (goog.LOCALE == 'es_CO' || goog.LOCALE == 'es-CO') {
  defaultSymbols = exports.DateIntervalSymbols_es_CO;
} else if (goog.LOCALE == 'es_CR' || goog.LOCALE == 'es-CR') {
  defaultSymbols = exports.DateIntervalSymbols_es_CR;
} else if (goog.LOCALE == 'es_CU' || goog.LOCALE == 'es-CU') {
  defaultSymbols = exports.DateIntervalSymbols_es_CU;
} else if (goog.LOCALE == 'es_DO' || goog.LOCALE == 'es-DO') {
  defaultSymbols = exports.DateIntervalSymbols_es_DO;
} else if (goog.LOCALE == 'es_EA' || goog.LOCALE == 'es-EA') {
  defaultSymbols = exports.DateIntervalSymbols_es_EA;
} else if (goog.LOCALE == 'es_EC' || goog.LOCALE == 'es-EC') {
  defaultSymbols = exports.DateIntervalSymbols_es_EC;
} else if (goog.LOCALE == 'es_GQ' || goog.LOCALE == 'es-GQ') {
  defaultSymbols = exports.DateIntervalSymbols_es_GQ;
} else if (goog.LOCALE == 'es_GT' || goog.LOCALE == 'es-GT') {
  defaultSymbols = exports.DateIntervalSymbols_es_GT;
} else if (goog.LOCALE == 'es_HN' || goog.LOCALE == 'es-HN') {
  defaultSymbols = exports.DateIntervalSymbols_es_HN;
} else if (goog.LOCALE == 'es_IC' || goog.LOCALE == 'es-IC') {
  defaultSymbols = exports.DateIntervalSymbols_es_IC;
} else if (goog.LOCALE == 'es_NI' || goog.LOCALE == 'es-NI') {
  defaultSymbols = exports.DateIntervalSymbols_es_NI;
} else if (goog.LOCALE == 'es_PA' || goog.LOCALE == 'es-PA') {
  defaultSymbols = exports.DateIntervalSymbols_es_PA;
} else if (goog.LOCALE == 'es_PE' || goog.LOCALE == 'es-PE') {
  defaultSymbols = exports.DateIntervalSymbols_es_PE;
} else if (goog.LOCALE == 'es_PH' || goog.LOCALE == 'es-PH') {
  defaultSymbols = exports.DateIntervalSymbols_es_PH;
} else if (goog.LOCALE == 'es_PR' || goog.LOCALE == 'es-PR') {
  defaultSymbols = exports.DateIntervalSymbols_es_PR;
} else if (goog.LOCALE == 'es_PY' || goog.LOCALE == 'es-PY') {
  defaultSymbols = exports.DateIntervalSymbols_es_PY;
} else if (goog.LOCALE == 'es_SV' || goog.LOCALE == 'es-SV') {
  defaultSymbols = exports.DateIntervalSymbols_es_SV;
} else if (goog.LOCALE == 'es_UY' || goog.LOCALE == 'es-UY') {
  defaultSymbols = exports.DateIntervalSymbols_es_UY;
} else if (goog.LOCALE == 'es_VE' || goog.LOCALE == 'es-VE') {
  defaultSymbols = exports.DateIntervalSymbols_es_VE;
} else if (goog.LOCALE == 'et_EE' || goog.LOCALE == 'et-EE') {
  defaultSymbols = exports.DateIntervalSymbols_et_EE;
} else if (goog.LOCALE == 'eu_ES' || goog.LOCALE == 'eu-ES') {
  defaultSymbols = exports.DateIntervalSymbols_eu_ES;
} else if (goog.LOCALE == 'ewo') {
  defaultSymbols = exports.DateIntervalSymbols_ewo;
} else if (goog.LOCALE == 'ewo_CM' || goog.LOCALE == 'ewo-CM') {
  defaultSymbols = exports.DateIntervalSymbols_ewo_CM;
} else if (goog.LOCALE == 'fa_AF' || goog.LOCALE == 'fa-AF') {
  defaultSymbols = exports.DateIntervalSymbols_fa_AF;
} else if (goog.LOCALE == 'fa_IR' || goog.LOCALE == 'fa-IR') {
  defaultSymbols = exports.DateIntervalSymbols_fa_IR;
} else if (goog.LOCALE == 'ff') {
  defaultSymbols = exports.DateIntervalSymbols_ff;
} else if (goog.LOCALE == 'ff_CM' || goog.LOCALE == 'ff-CM') {
  defaultSymbols = exports.DateIntervalSymbols_ff_CM;
} else if (goog.LOCALE == 'ff_GN' || goog.LOCALE == 'ff-GN') {
  defaultSymbols = exports.DateIntervalSymbols_ff_GN;
} else if (goog.LOCALE == 'ff_MR' || goog.LOCALE == 'ff-MR') {
  defaultSymbols = exports.DateIntervalSymbols_ff_MR;
} else if (goog.LOCALE == 'ff_SN' || goog.LOCALE == 'ff-SN') {
  defaultSymbols = exports.DateIntervalSymbols_ff_SN;
} else if (goog.LOCALE == 'fi_FI' || goog.LOCALE == 'fi-FI') {
  defaultSymbols = exports.DateIntervalSymbols_fi_FI;
} else if (goog.LOCALE == 'fil_PH' || goog.LOCALE == 'fil-PH') {
  defaultSymbols = exports.DateIntervalSymbols_fil_PH;
} else if (goog.LOCALE == 'fo') {
  defaultSymbols = exports.DateIntervalSymbols_fo;
} else if (goog.LOCALE == 'fo_DK' || goog.LOCALE == 'fo-DK') {
  defaultSymbols = exports.DateIntervalSymbols_fo_DK;
} else if (goog.LOCALE == 'fo_FO' || goog.LOCALE == 'fo-FO') {
  defaultSymbols = exports.DateIntervalSymbols_fo_FO;
} else if (goog.LOCALE == 'fr_BE' || goog.LOCALE == 'fr-BE') {
  defaultSymbols = exports.DateIntervalSymbols_fr_BE;
} else if (goog.LOCALE == 'fr_BF' || goog.LOCALE == 'fr-BF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_BF;
} else if (goog.LOCALE == 'fr_BI' || goog.LOCALE == 'fr-BI') {
  defaultSymbols = exports.DateIntervalSymbols_fr_BI;
} else if (goog.LOCALE == 'fr_BJ' || goog.LOCALE == 'fr-BJ') {
  defaultSymbols = exports.DateIntervalSymbols_fr_BJ;
} else if (goog.LOCALE == 'fr_BL' || goog.LOCALE == 'fr-BL') {
  defaultSymbols = exports.DateIntervalSymbols_fr_BL;
} else if (goog.LOCALE == 'fr_CD' || goog.LOCALE == 'fr-CD') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CD;
} else if (goog.LOCALE == 'fr_CF' || goog.LOCALE == 'fr-CF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CF;
} else if (goog.LOCALE == 'fr_CG' || goog.LOCALE == 'fr-CG') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CG;
} else if (goog.LOCALE == 'fr_CH' || goog.LOCALE == 'fr-CH') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CH;
} else if (goog.LOCALE == 'fr_CI' || goog.LOCALE == 'fr-CI') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CI;
} else if (goog.LOCALE == 'fr_CM' || goog.LOCALE == 'fr-CM') {
  defaultSymbols = exports.DateIntervalSymbols_fr_CM;
} else if (goog.LOCALE == 'fr_DJ' || goog.LOCALE == 'fr-DJ') {
  defaultSymbols = exports.DateIntervalSymbols_fr_DJ;
} else if (goog.LOCALE == 'fr_DZ' || goog.LOCALE == 'fr-DZ') {
  defaultSymbols = exports.DateIntervalSymbols_fr_DZ;
} else if (goog.LOCALE == 'fr_FR' || goog.LOCALE == 'fr-FR') {
  defaultSymbols = exports.DateIntervalSymbols_fr_FR;
} else if (goog.LOCALE == 'fr_GA' || goog.LOCALE == 'fr-GA') {
  defaultSymbols = exports.DateIntervalSymbols_fr_GA;
} else if (goog.LOCALE == 'fr_GF' || goog.LOCALE == 'fr-GF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_GF;
} else if (goog.LOCALE == 'fr_GN' || goog.LOCALE == 'fr-GN') {
  defaultSymbols = exports.DateIntervalSymbols_fr_GN;
} else if (goog.LOCALE == 'fr_GP' || goog.LOCALE == 'fr-GP') {
  defaultSymbols = exports.DateIntervalSymbols_fr_GP;
} else if (goog.LOCALE == 'fr_GQ' || goog.LOCALE == 'fr-GQ') {
  defaultSymbols = exports.DateIntervalSymbols_fr_GQ;
} else if (goog.LOCALE == 'fr_HT' || goog.LOCALE == 'fr-HT') {
  defaultSymbols = exports.DateIntervalSymbols_fr_HT;
} else if (goog.LOCALE == 'fr_KM' || goog.LOCALE == 'fr-KM') {
  defaultSymbols = exports.DateIntervalSymbols_fr_KM;
} else if (goog.LOCALE == 'fr_LU' || goog.LOCALE == 'fr-LU') {
  defaultSymbols = exports.DateIntervalSymbols_fr_LU;
} else if (goog.LOCALE == 'fr_MA' || goog.LOCALE == 'fr-MA') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MA;
} else if (goog.LOCALE == 'fr_MC' || goog.LOCALE == 'fr-MC') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MC;
} else if (goog.LOCALE == 'fr_MF' || goog.LOCALE == 'fr-MF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MF;
} else if (goog.LOCALE == 'fr_MG' || goog.LOCALE == 'fr-MG') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MG;
} else if (goog.LOCALE == 'fr_ML' || goog.LOCALE == 'fr-ML') {
  defaultSymbols = exports.DateIntervalSymbols_fr_ML;
} else if (goog.LOCALE == 'fr_MQ' || goog.LOCALE == 'fr-MQ') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MQ;
} else if (goog.LOCALE == 'fr_MR' || goog.LOCALE == 'fr-MR') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MR;
} else if (goog.LOCALE == 'fr_MU' || goog.LOCALE == 'fr-MU') {
  defaultSymbols = exports.DateIntervalSymbols_fr_MU;
} else if (goog.LOCALE == 'fr_NC' || goog.LOCALE == 'fr-NC') {
  defaultSymbols = exports.DateIntervalSymbols_fr_NC;
} else if (goog.LOCALE == 'fr_NE' || goog.LOCALE == 'fr-NE') {
  defaultSymbols = exports.DateIntervalSymbols_fr_NE;
} else if (goog.LOCALE == 'fr_PF' || goog.LOCALE == 'fr-PF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_PF;
} else if (goog.LOCALE == 'fr_PM' || goog.LOCALE == 'fr-PM') {
  defaultSymbols = exports.DateIntervalSymbols_fr_PM;
} else if (goog.LOCALE == 'fr_RE' || goog.LOCALE == 'fr-RE') {
  defaultSymbols = exports.DateIntervalSymbols_fr_RE;
} else if (goog.LOCALE == 'fr_RW' || goog.LOCALE == 'fr-RW') {
  defaultSymbols = exports.DateIntervalSymbols_fr_RW;
} else if (goog.LOCALE == 'fr_SC' || goog.LOCALE == 'fr-SC') {
  defaultSymbols = exports.DateIntervalSymbols_fr_SC;
} else if (goog.LOCALE == 'fr_SN' || goog.LOCALE == 'fr-SN') {
  defaultSymbols = exports.DateIntervalSymbols_fr_SN;
} else if (goog.LOCALE == 'fr_SY' || goog.LOCALE == 'fr-SY') {
  defaultSymbols = exports.DateIntervalSymbols_fr_SY;
} else if (goog.LOCALE == 'fr_TD' || goog.LOCALE == 'fr-TD') {
  defaultSymbols = exports.DateIntervalSymbols_fr_TD;
} else if (goog.LOCALE == 'fr_TG' || goog.LOCALE == 'fr-TG') {
  defaultSymbols = exports.DateIntervalSymbols_fr_TG;
} else if (goog.LOCALE == 'fr_TN' || goog.LOCALE == 'fr-TN') {
  defaultSymbols = exports.DateIntervalSymbols_fr_TN;
} else if (goog.LOCALE == 'fr_VU' || goog.LOCALE == 'fr-VU') {
  defaultSymbols = exports.DateIntervalSymbols_fr_VU;
} else if (goog.LOCALE == 'fr_WF' || goog.LOCALE == 'fr-WF') {
  defaultSymbols = exports.DateIntervalSymbols_fr_WF;
} else if (goog.LOCALE == 'fr_YT' || goog.LOCALE == 'fr-YT') {
  defaultSymbols = exports.DateIntervalSymbols_fr_YT;
} else if (goog.LOCALE == 'fur') {
  defaultSymbols = exports.DateIntervalSymbols_fur;
} else if (goog.LOCALE == 'fur_IT' || goog.LOCALE == 'fur-IT') {
  defaultSymbols = exports.DateIntervalSymbols_fur_IT;
} else if (goog.LOCALE == 'fy') {
  defaultSymbols = exports.DateIntervalSymbols_fy;
} else if (goog.LOCALE == 'fy_NL' || goog.LOCALE == 'fy-NL') {
  defaultSymbols = exports.DateIntervalSymbols_fy_NL;
} else if (goog.LOCALE == 'ga_IE' || goog.LOCALE == 'ga-IE') {
  defaultSymbols = exports.DateIntervalSymbols_ga_IE;
} else if (goog.LOCALE == 'gd') {
  defaultSymbols = exports.DateIntervalSymbols_gd;
} else if (goog.LOCALE == 'gd_GB' || goog.LOCALE == 'gd-GB') {
  defaultSymbols = exports.DateIntervalSymbols_gd_GB;
} else if (goog.LOCALE == 'gl_ES' || goog.LOCALE == 'gl-ES') {
  defaultSymbols = exports.DateIntervalSymbols_gl_ES;
} else if (goog.LOCALE == 'gsw_CH' || goog.LOCALE == 'gsw-CH') {
  defaultSymbols = exports.DateIntervalSymbols_gsw_CH;
} else if (goog.LOCALE == 'gsw_FR' || goog.LOCALE == 'gsw-FR') {
  defaultSymbols = exports.DateIntervalSymbols_gsw_FR;
} else if (goog.LOCALE == 'gsw_LI' || goog.LOCALE == 'gsw-LI') {
  defaultSymbols = exports.DateIntervalSymbols_gsw_LI;
} else if (goog.LOCALE == 'gu_IN' || goog.LOCALE == 'gu-IN') {
  defaultSymbols = exports.DateIntervalSymbols_gu_IN;
} else if (goog.LOCALE == 'guz') {
  defaultSymbols = exports.DateIntervalSymbols_guz;
} else if (goog.LOCALE == 'guz_KE' || goog.LOCALE == 'guz-KE') {
  defaultSymbols = exports.DateIntervalSymbols_guz_KE;
} else if (goog.LOCALE == 'gv') {
  defaultSymbols = exports.DateIntervalSymbols_gv;
} else if (goog.LOCALE == 'gv_IM' || goog.LOCALE == 'gv-IM') {
  defaultSymbols = exports.DateIntervalSymbols_gv_IM;
} else if (goog.LOCALE == 'ha') {
  defaultSymbols = exports.DateIntervalSymbols_ha;
} else if (goog.LOCALE == 'ha_GH' || goog.LOCALE == 'ha-GH') {
  defaultSymbols = exports.DateIntervalSymbols_ha_GH;
} else if (goog.LOCALE == 'ha_NE' || goog.LOCALE == 'ha-NE') {
  defaultSymbols = exports.DateIntervalSymbols_ha_NE;
} else if (goog.LOCALE == 'ha_NG' || goog.LOCALE == 'ha-NG') {
  defaultSymbols = exports.DateIntervalSymbols_ha_NG;
} else if (goog.LOCALE == 'haw_US' || goog.LOCALE == 'haw-US') {
  defaultSymbols = exports.DateIntervalSymbols_haw_US;
} else if (goog.LOCALE == 'he_IL' || goog.LOCALE == 'he-IL') {
  defaultSymbols = exports.DateIntervalSymbols_he_IL;
} else if (goog.LOCALE == 'hi_IN' || goog.LOCALE == 'hi-IN') {
  defaultSymbols = exports.DateIntervalSymbols_hi_IN;
} else if (goog.LOCALE == 'hr_BA' || goog.LOCALE == 'hr-BA') {
  defaultSymbols = exports.DateIntervalSymbols_hr_BA;
} else if (goog.LOCALE == 'hr_HR' || goog.LOCALE == 'hr-HR') {
  defaultSymbols = exports.DateIntervalSymbols_hr_HR;
} else if (goog.LOCALE == 'hsb') {
  defaultSymbols = exports.DateIntervalSymbols_hsb;
} else if (goog.LOCALE == 'hsb_DE' || goog.LOCALE == 'hsb-DE') {
  defaultSymbols = exports.DateIntervalSymbols_hsb_DE;
} else if (goog.LOCALE == 'hu_HU' || goog.LOCALE == 'hu-HU') {
  defaultSymbols = exports.DateIntervalSymbols_hu_HU;
} else if (goog.LOCALE == 'hy_AM' || goog.LOCALE == 'hy-AM') {
  defaultSymbols = exports.DateIntervalSymbols_hy_AM;
} else if (goog.LOCALE == 'id_ID' || goog.LOCALE == 'id-ID') {
  defaultSymbols = exports.DateIntervalSymbols_id_ID;
} else if (goog.LOCALE == 'ig') {
  defaultSymbols = exports.DateIntervalSymbols_ig;
} else if (goog.LOCALE == 'ig_NG' || goog.LOCALE == 'ig-NG') {
  defaultSymbols = exports.DateIntervalSymbols_ig_NG;
} else if (goog.LOCALE == 'ii') {
  defaultSymbols = exports.DateIntervalSymbols_ii;
} else if (goog.LOCALE == 'ii_CN' || goog.LOCALE == 'ii-CN') {
  defaultSymbols = exports.DateIntervalSymbols_ii_CN;
} else if (goog.LOCALE == 'is_IS' || goog.LOCALE == 'is-IS') {
  defaultSymbols = exports.DateIntervalSymbols_is_IS;
} else if (goog.LOCALE == 'it_CH' || goog.LOCALE == 'it-CH') {
  defaultSymbols = exports.DateIntervalSymbols_it_CH;
} else if (goog.LOCALE == 'it_IT' || goog.LOCALE == 'it-IT') {
  defaultSymbols = exports.DateIntervalSymbols_it_IT;
} else if (goog.LOCALE == 'it_SM' || goog.LOCALE == 'it-SM') {
  defaultSymbols = exports.DateIntervalSymbols_it_SM;
} else if (goog.LOCALE == 'it_VA' || goog.LOCALE == 'it-VA') {
  defaultSymbols = exports.DateIntervalSymbols_it_VA;
} else if (goog.LOCALE == 'ja_JP' || goog.LOCALE == 'ja-JP') {
  defaultSymbols = exports.DateIntervalSymbols_ja_JP;
} else if (goog.LOCALE == 'jgo') {
  defaultSymbols = exports.DateIntervalSymbols_jgo;
} else if (goog.LOCALE == 'jgo_CM' || goog.LOCALE == 'jgo-CM') {
  defaultSymbols = exports.DateIntervalSymbols_jgo_CM;
} else if (goog.LOCALE == 'jmc') {
  defaultSymbols = exports.DateIntervalSymbols_jmc;
} else if (goog.LOCALE == 'jmc_TZ' || goog.LOCALE == 'jmc-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_jmc_TZ;
} else if (goog.LOCALE == 'ka_GE' || goog.LOCALE == 'ka-GE') {
  defaultSymbols = exports.DateIntervalSymbols_ka_GE;
} else if (goog.LOCALE == 'kab') {
  defaultSymbols = exports.DateIntervalSymbols_kab;
} else if (goog.LOCALE == 'kab_DZ' || goog.LOCALE == 'kab-DZ') {
  defaultSymbols = exports.DateIntervalSymbols_kab_DZ;
} else if (goog.LOCALE == 'kam') {
  defaultSymbols = exports.DateIntervalSymbols_kam;
} else if (goog.LOCALE == 'kam_KE' || goog.LOCALE == 'kam-KE') {
  defaultSymbols = exports.DateIntervalSymbols_kam_KE;
} else if (goog.LOCALE == 'kde') {
  defaultSymbols = exports.DateIntervalSymbols_kde;
} else if (goog.LOCALE == 'kde_TZ' || goog.LOCALE == 'kde-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_kde_TZ;
} else if (goog.LOCALE == 'kea') {
  defaultSymbols = exports.DateIntervalSymbols_kea;
} else if (goog.LOCALE == 'kea_CV' || goog.LOCALE == 'kea-CV') {
  defaultSymbols = exports.DateIntervalSymbols_kea_CV;
} else if (goog.LOCALE == 'khq') {
  defaultSymbols = exports.DateIntervalSymbols_khq;
} else if (goog.LOCALE == 'khq_ML' || goog.LOCALE == 'khq-ML') {
  defaultSymbols = exports.DateIntervalSymbols_khq_ML;
} else if (goog.LOCALE == 'ki') {
  defaultSymbols = exports.DateIntervalSymbols_ki;
} else if (goog.LOCALE == 'ki_KE' || goog.LOCALE == 'ki-KE') {
  defaultSymbols = exports.DateIntervalSymbols_ki_KE;
} else if (goog.LOCALE == 'kk_KZ' || goog.LOCALE == 'kk-KZ') {
  defaultSymbols = exports.DateIntervalSymbols_kk_KZ;
} else if (goog.LOCALE == 'kkj') {
  defaultSymbols = exports.DateIntervalSymbols_kkj;
} else if (goog.LOCALE == 'kkj_CM' || goog.LOCALE == 'kkj-CM') {
  defaultSymbols = exports.DateIntervalSymbols_kkj_CM;
} else if (goog.LOCALE == 'kl') {
  defaultSymbols = exports.DateIntervalSymbols_kl;
} else if (goog.LOCALE == 'kl_GL' || goog.LOCALE == 'kl-GL') {
  defaultSymbols = exports.DateIntervalSymbols_kl_GL;
} else if (goog.LOCALE == 'kln') {
  defaultSymbols = exports.DateIntervalSymbols_kln;
} else if (goog.LOCALE == 'kln_KE' || goog.LOCALE == 'kln-KE') {
  defaultSymbols = exports.DateIntervalSymbols_kln_KE;
} else if (goog.LOCALE == 'km_KH' || goog.LOCALE == 'km-KH') {
  defaultSymbols = exports.DateIntervalSymbols_km_KH;
} else if (goog.LOCALE == 'kn_IN' || goog.LOCALE == 'kn-IN') {
  defaultSymbols = exports.DateIntervalSymbols_kn_IN;
} else if (goog.LOCALE == 'ko_KP' || goog.LOCALE == 'ko-KP') {
  defaultSymbols = exports.DateIntervalSymbols_ko_KP;
} else if (goog.LOCALE == 'ko_KR' || goog.LOCALE == 'ko-KR') {
  defaultSymbols = exports.DateIntervalSymbols_ko_KR;
} else if (goog.LOCALE == 'kok') {
  defaultSymbols = exports.DateIntervalSymbols_kok;
} else if (goog.LOCALE == 'kok_IN' || goog.LOCALE == 'kok-IN') {
  defaultSymbols = exports.DateIntervalSymbols_kok_IN;
} else if (goog.LOCALE == 'ks') {
  defaultSymbols = exports.DateIntervalSymbols_ks;
} else if (goog.LOCALE == 'ks_IN' || goog.LOCALE == 'ks-IN') {
  defaultSymbols = exports.DateIntervalSymbols_ks_IN;
} else if (goog.LOCALE == 'ksb') {
  defaultSymbols = exports.DateIntervalSymbols_ksb;
} else if (goog.LOCALE == 'ksb_TZ' || goog.LOCALE == 'ksb-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_ksb_TZ;
} else if (goog.LOCALE == 'ksf') {
  defaultSymbols = exports.DateIntervalSymbols_ksf;
} else if (goog.LOCALE == 'ksf_CM' || goog.LOCALE == 'ksf-CM') {
  defaultSymbols = exports.DateIntervalSymbols_ksf_CM;
} else if (goog.LOCALE == 'ksh') {
  defaultSymbols = exports.DateIntervalSymbols_ksh;
} else if (goog.LOCALE == 'ksh_DE' || goog.LOCALE == 'ksh-DE') {
  defaultSymbols = exports.DateIntervalSymbols_ksh_DE;
} else if (goog.LOCALE == 'kw') {
  defaultSymbols = exports.DateIntervalSymbols_kw;
} else if (goog.LOCALE == 'kw_GB' || goog.LOCALE == 'kw-GB') {
  defaultSymbols = exports.DateIntervalSymbols_kw_GB;
} else if (goog.LOCALE == 'ky_KG' || goog.LOCALE == 'ky-KG') {
  defaultSymbols = exports.DateIntervalSymbols_ky_KG;
} else if (goog.LOCALE == 'lag') {
  defaultSymbols = exports.DateIntervalSymbols_lag;
} else if (goog.LOCALE == 'lag_TZ' || goog.LOCALE == 'lag-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_lag_TZ;
} else if (goog.LOCALE == 'lb') {
  defaultSymbols = exports.DateIntervalSymbols_lb;
} else if (goog.LOCALE == 'lb_LU' || goog.LOCALE == 'lb-LU') {
  defaultSymbols = exports.DateIntervalSymbols_lb_LU;
} else if (goog.LOCALE == 'lg') {
  defaultSymbols = exports.DateIntervalSymbols_lg;
} else if (goog.LOCALE == 'lg_UG' || goog.LOCALE == 'lg-UG') {
  defaultSymbols = exports.DateIntervalSymbols_lg_UG;
} else if (goog.LOCALE == 'lkt') {
  defaultSymbols = exports.DateIntervalSymbols_lkt;
} else if (goog.LOCALE == 'lkt_US' || goog.LOCALE == 'lkt-US') {
  defaultSymbols = exports.DateIntervalSymbols_lkt_US;
} else if (goog.LOCALE == 'ln_AO' || goog.LOCALE == 'ln-AO') {
  defaultSymbols = exports.DateIntervalSymbols_ln_AO;
} else if (goog.LOCALE == 'ln_CD' || goog.LOCALE == 'ln-CD') {
  defaultSymbols = exports.DateIntervalSymbols_ln_CD;
} else if (goog.LOCALE == 'ln_CF' || goog.LOCALE == 'ln-CF') {
  defaultSymbols = exports.DateIntervalSymbols_ln_CF;
} else if (goog.LOCALE == 'ln_CG' || goog.LOCALE == 'ln-CG') {
  defaultSymbols = exports.DateIntervalSymbols_ln_CG;
} else if (goog.LOCALE == 'lo_LA' || goog.LOCALE == 'lo-LA') {
  defaultSymbols = exports.DateIntervalSymbols_lo_LA;
} else if (goog.LOCALE == 'lrc') {
  defaultSymbols = exports.DateIntervalSymbols_lrc;
} else if (goog.LOCALE == 'lrc_IQ' || goog.LOCALE == 'lrc-IQ') {
  defaultSymbols = exports.DateIntervalSymbols_lrc_IQ;
} else if (goog.LOCALE == 'lrc_IR' || goog.LOCALE == 'lrc-IR') {
  defaultSymbols = exports.DateIntervalSymbols_lrc_IR;
} else if (goog.LOCALE == 'lt_LT' || goog.LOCALE == 'lt-LT') {
  defaultSymbols = exports.DateIntervalSymbols_lt_LT;
} else if (goog.LOCALE == 'lu') {
  defaultSymbols = exports.DateIntervalSymbols_lu;
} else if (goog.LOCALE == 'lu_CD' || goog.LOCALE == 'lu-CD') {
  defaultSymbols = exports.DateIntervalSymbols_lu_CD;
} else if (goog.LOCALE == 'luo') {
  defaultSymbols = exports.DateIntervalSymbols_luo;
} else if (goog.LOCALE == 'luo_KE' || goog.LOCALE == 'luo-KE') {
  defaultSymbols = exports.DateIntervalSymbols_luo_KE;
} else if (goog.LOCALE == 'luy') {
  defaultSymbols = exports.DateIntervalSymbols_luy;
} else if (goog.LOCALE == 'luy_KE' || goog.LOCALE == 'luy-KE') {
  defaultSymbols = exports.DateIntervalSymbols_luy_KE;
} else if (goog.LOCALE == 'lv_LV' || goog.LOCALE == 'lv-LV') {
  defaultSymbols = exports.DateIntervalSymbols_lv_LV;
} else if (goog.LOCALE == 'mas') {
  defaultSymbols = exports.DateIntervalSymbols_mas;
} else if (goog.LOCALE == 'mas_KE' || goog.LOCALE == 'mas-KE') {
  defaultSymbols = exports.DateIntervalSymbols_mas_KE;
} else if (goog.LOCALE == 'mas_TZ' || goog.LOCALE == 'mas-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_mas_TZ;
} else if (goog.LOCALE == 'mer') {
  defaultSymbols = exports.DateIntervalSymbols_mer;
} else if (goog.LOCALE == 'mer_KE' || goog.LOCALE == 'mer-KE') {
  defaultSymbols = exports.DateIntervalSymbols_mer_KE;
} else if (goog.LOCALE == 'mfe') {
  defaultSymbols = exports.DateIntervalSymbols_mfe;
} else if (goog.LOCALE == 'mfe_MU' || goog.LOCALE == 'mfe-MU') {
  defaultSymbols = exports.DateIntervalSymbols_mfe_MU;
} else if (goog.LOCALE == 'mg') {
  defaultSymbols = exports.DateIntervalSymbols_mg;
} else if (goog.LOCALE == 'mg_MG' || goog.LOCALE == 'mg-MG') {
  defaultSymbols = exports.DateIntervalSymbols_mg_MG;
} else if (goog.LOCALE == 'mgh') {
  defaultSymbols = exports.DateIntervalSymbols_mgh;
} else if (goog.LOCALE == 'mgh_MZ' || goog.LOCALE == 'mgh-MZ') {
  defaultSymbols = exports.DateIntervalSymbols_mgh_MZ;
} else if (goog.LOCALE == 'mgo') {
  defaultSymbols = exports.DateIntervalSymbols_mgo;
} else if (goog.LOCALE == 'mgo_CM' || goog.LOCALE == 'mgo-CM') {
  defaultSymbols = exports.DateIntervalSymbols_mgo_CM;
} else if (goog.LOCALE == 'mk_MK' || goog.LOCALE == 'mk-MK') {
  defaultSymbols = exports.DateIntervalSymbols_mk_MK;
} else if (goog.LOCALE == 'ml_IN' || goog.LOCALE == 'ml-IN') {
  defaultSymbols = exports.DateIntervalSymbols_ml_IN;
} else if (goog.LOCALE == 'mn_MN' || goog.LOCALE == 'mn-MN') {
  defaultSymbols = exports.DateIntervalSymbols_mn_MN;
} else if (goog.LOCALE == 'mr_IN' || goog.LOCALE == 'mr-IN') {
  defaultSymbols = exports.DateIntervalSymbols_mr_IN;
} else if (goog.LOCALE == 'ms_BN' || goog.LOCALE == 'ms-BN') {
  defaultSymbols = exports.DateIntervalSymbols_ms_BN;
} else if (goog.LOCALE == 'ms_MY' || goog.LOCALE == 'ms-MY') {
  defaultSymbols = exports.DateIntervalSymbols_ms_MY;
} else if (goog.LOCALE == 'ms_SG' || goog.LOCALE == 'ms-SG') {
  defaultSymbols = exports.DateIntervalSymbols_ms_SG;
} else if (goog.LOCALE == 'mt_MT' || goog.LOCALE == 'mt-MT') {
  defaultSymbols = exports.DateIntervalSymbols_mt_MT;
} else if (goog.LOCALE == 'mua') {
  defaultSymbols = exports.DateIntervalSymbols_mua;
} else if (goog.LOCALE == 'mua_CM' || goog.LOCALE == 'mua-CM') {
  defaultSymbols = exports.DateIntervalSymbols_mua_CM;
} else if (goog.LOCALE == 'my_MM' || goog.LOCALE == 'my-MM') {
  defaultSymbols = exports.DateIntervalSymbols_my_MM;
} else if (goog.LOCALE == 'mzn') {
  defaultSymbols = exports.DateIntervalSymbols_mzn;
} else if (goog.LOCALE == 'mzn_IR' || goog.LOCALE == 'mzn-IR') {
  defaultSymbols = exports.DateIntervalSymbols_mzn_IR;
} else if (goog.LOCALE == 'naq') {
  defaultSymbols = exports.DateIntervalSymbols_naq;
} else if (goog.LOCALE == 'naq_NA' || goog.LOCALE == 'naq-NA') {
  defaultSymbols = exports.DateIntervalSymbols_naq_NA;
} else if (goog.LOCALE == 'nb_NO' || goog.LOCALE == 'nb-NO') {
  defaultSymbols = exports.DateIntervalSymbols_nb_NO;
} else if (goog.LOCALE == 'nb_SJ' || goog.LOCALE == 'nb-SJ') {
  defaultSymbols = exports.DateIntervalSymbols_nb_SJ;
} else if (goog.LOCALE == 'nd') {
  defaultSymbols = exports.DateIntervalSymbols_nd;
} else if (goog.LOCALE == 'nd_ZW' || goog.LOCALE == 'nd-ZW') {
  defaultSymbols = exports.DateIntervalSymbols_nd_ZW;
} else if (goog.LOCALE == 'nds') {
  defaultSymbols = exports.DateIntervalSymbols_nds;
} else if (goog.LOCALE == 'nds_DE' || goog.LOCALE == 'nds-DE') {
  defaultSymbols = exports.DateIntervalSymbols_nds_DE;
} else if (goog.LOCALE == 'nds_NL' || goog.LOCALE == 'nds-NL') {
  defaultSymbols = exports.DateIntervalSymbols_nds_NL;
} else if (goog.LOCALE == 'ne_IN' || goog.LOCALE == 'ne-IN') {
  defaultSymbols = exports.DateIntervalSymbols_ne_IN;
} else if (goog.LOCALE == 'ne_NP' || goog.LOCALE == 'ne-NP') {
  defaultSymbols = exports.DateIntervalSymbols_ne_NP;
} else if (goog.LOCALE == 'nl_AW' || goog.LOCALE == 'nl-AW') {
  defaultSymbols = exports.DateIntervalSymbols_nl_AW;
} else if (goog.LOCALE == 'nl_BE' || goog.LOCALE == 'nl-BE') {
  defaultSymbols = exports.DateIntervalSymbols_nl_BE;
} else if (goog.LOCALE == 'nl_BQ' || goog.LOCALE == 'nl-BQ') {
  defaultSymbols = exports.DateIntervalSymbols_nl_BQ;
} else if (goog.LOCALE == 'nl_CW' || goog.LOCALE == 'nl-CW') {
  defaultSymbols = exports.DateIntervalSymbols_nl_CW;
} else if (goog.LOCALE == 'nl_NL' || goog.LOCALE == 'nl-NL') {
  defaultSymbols = exports.DateIntervalSymbols_nl_NL;
} else if (goog.LOCALE == 'nl_SR' || goog.LOCALE == 'nl-SR') {
  defaultSymbols = exports.DateIntervalSymbols_nl_SR;
} else if (goog.LOCALE == 'nl_SX' || goog.LOCALE == 'nl-SX') {
  defaultSymbols = exports.DateIntervalSymbols_nl_SX;
} else if (goog.LOCALE == 'nmg') {
  defaultSymbols = exports.DateIntervalSymbols_nmg;
} else if (goog.LOCALE == 'nmg_CM' || goog.LOCALE == 'nmg-CM') {
  defaultSymbols = exports.DateIntervalSymbols_nmg_CM;
} else if (goog.LOCALE == 'nn') {
  defaultSymbols = exports.DateIntervalSymbols_nn;
} else if (goog.LOCALE == 'nn_NO' || goog.LOCALE == 'nn-NO') {
  defaultSymbols = exports.DateIntervalSymbols_nn_NO;
} else if (goog.LOCALE == 'nnh') {
  defaultSymbols = exports.DateIntervalSymbols_nnh;
} else if (goog.LOCALE == 'nnh_CM' || goog.LOCALE == 'nnh-CM') {
  defaultSymbols = exports.DateIntervalSymbols_nnh_CM;
} else if (goog.LOCALE == 'nus') {
  defaultSymbols = exports.DateIntervalSymbols_nus;
} else if (goog.LOCALE == 'nus_SS' || goog.LOCALE == 'nus-SS') {
  defaultSymbols = exports.DateIntervalSymbols_nus_SS;
} else if (goog.LOCALE == 'nyn') {
  defaultSymbols = exports.DateIntervalSymbols_nyn;
} else if (goog.LOCALE == 'nyn_UG' || goog.LOCALE == 'nyn-UG') {
  defaultSymbols = exports.DateIntervalSymbols_nyn_UG;
} else if (goog.LOCALE == 'om') {
  defaultSymbols = exports.DateIntervalSymbols_om;
} else if (goog.LOCALE == 'om_ET' || goog.LOCALE == 'om-ET') {
  defaultSymbols = exports.DateIntervalSymbols_om_ET;
} else if (goog.LOCALE == 'om_KE' || goog.LOCALE == 'om-KE') {
  defaultSymbols = exports.DateIntervalSymbols_om_KE;
} else if (goog.LOCALE == 'or_IN' || goog.LOCALE == 'or-IN') {
  defaultSymbols = exports.DateIntervalSymbols_or_IN;
} else if (goog.LOCALE == 'os') {
  defaultSymbols = exports.DateIntervalSymbols_os;
} else if (goog.LOCALE == 'os_GE' || goog.LOCALE == 'os-GE') {
  defaultSymbols = exports.DateIntervalSymbols_os_GE;
} else if (goog.LOCALE == 'os_RU' || goog.LOCALE == 'os-RU') {
  defaultSymbols = exports.DateIntervalSymbols_os_RU;
} else if (goog.LOCALE == 'pa_Arab' || goog.LOCALE == 'pa-Arab') {
  defaultSymbols = exports.DateIntervalSymbols_pa_Arab;
} else if (goog.LOCALE == 'pa_Arab_PK' || goog.LOCALE == 'pa-Arab-PK') {
  defaultSymbols = exports.DateIntervalSymbols_pa_Arab_PK;
} else if (goog.LOCALE == 'pa_Guru' || goog.LOCALE == 'pa-Guru') {
  defaultSymbols = exports.DateIntervalSymbols_pa_Guru;
} else if (goog.LOCALE == 'pa_Guru_IN' || goog.LOCALE == 'pa-Guru-IN') {
  defaultSymbols = exports.DateIntervalSymbols_pa_Guru_IN;
} else if (goog.LOCALE == 'pl_PL' || goog.LOCALE == 'pl-PL') {
  defaultSymbols = exports.DateIntervalSymbols_pl_PL;
} else if (goog.LOCALE == 'ps') {
  defaultSymbols = exports.DateIntervalSymbols_ps;
} else if (goog.LOCALE == 'ps_AF' || goog.LOCALE == 'ps-AF') {
  defaultSymbols = exports.DateIntervalSymbols_ps_AF;
} else if (goog.LOCALE == 'pt_AO' || goog.LOCALE == 'pt-AO') {
  defaultSymbols = exports.DateIntervalSymbols_pt_AO;
} else if (goog.LOCALE == 'pt_CH' || goog.LOCALE == 'pt-CH') {
  defaultSymbols = exports.DateIntervalSymbols_pt_CH;
} else if (goog.LOCALE == 'pt_CV' || goog.LOCALE == 'pt-CV') {
  defaultSymbols = exports.DateIntervalSymbols_pt_CV;
} else if (goog.LOCALE == 'pt_GQ' || goog.LOCALE == 'pt-GQ') {
  defaultSymbols = exports.DateIntervalSymbols_pt_GQ;
} else if (goog.LOCALE == 'pt_GW' || goog.LOCALE == 'pt-GW') {
  defaultSymbols = exports.DateIntervalSymbols_pt_GW;
} else if (goog.LOCALE == 'pt_LU' || goog.LOCALE == 'pt-LU') {
  defaultSymbols = exports.DateIntervalSymbols_pt_LU;
} else if (goog.LOCALE == 'pt_MO' || goog.LOCALE == 'pt-MO') {
  defaultSymbols = exports.DateIntervalSymbols_pt_MO;
} else if (goog.LOCALE == 'pt_MZ' || goog.LOCALE == 'pt-MZ') {
  defaultSymbols = exports.DateIntervalSymbols_pt_MZ;
} else if (goog.LOCALE == 'pt_ST' || goog.LOCALE == 'pt-ST') {
  defaultSymbols = exports.DateIntervalSymbols_pt_ST;
} else if (goog.LOCALE == 'pt_TL' || goog.LOCALE == 'pt-TL') {
  defaultSymbols = exports.DateIntervalSymbols_pt_TL;
} else if (goog.LOCALE == 'qu') {
  defaultSymbols = exports.DateIntervalSymbols_qu;
} else if (goog.LOCALE == 'qu_BO' || goog.LOCALE == 'qu-BO') {
  defaultSymbols = exports.DateIntervalSymbols_qu_BO;
} else if (goog.LOCALE == 'qu_EC' || goog.LOCALE == 'qu-EC') {
  defaultSymbols = exports.DateIntervalSymbols_qu_EC;
} else if (goog.LOCALE == 'qu_PE' || goog.LOCALE == 'qu-PE') {
  defaultSymbols = exports.DateIntervalSymbols_qu_PE;
} else if (goog.LOCALE == 'rm') {
  defaultSymbols = exports.DateIntervalSymbols_rm;
} else if (goog.LOCALE == 'rm_CH' || goog.LOCALE == 'rm-CH') {
  defaultSymbols = exports.DateIntervalSymbols_rm_CH;
} else if (goog.LOCALE == 'rn') {
  defaultSymbols = exports.DateIntervalSymbols_rn;
} else if (goog.LOCALE == 'rn_BI' || goog.LOCALE == 'rn-BI') {
  defaultSymbols = exports.DateIntervalSymbols_rn_BI;
} else if (goog.LOCALE == 'ro_MD' || goog.LOCALE == 'ro-MD') {
  defaultSymbols = exports.DateIntervalSymbols_ro_MD;
} else if (goog.LOCALE == 'ro_RO' || goog.LOCALE == 'ro-RO') {
  defaultSymbols = exports.DateIntervalSymbols_ro_RO;
} else if (goog.LOCALE == 'rof') {
  defaultSymbols = exports.DateIntervalSymbols_rof;
} else if (goog.LOCALE == 'rof_TZ' || goog.LOCALE == 'rof-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_rof_TZ;
} else if (goog.LOCALE == 'ru_BY' || goog.LOCALE == 'ru-BY') {
  defaultSymbols = exports.DateIntervalSymbols_ru_BY;
} else if (goog.LOCALE == 'ru_KG' || goog.LOCALE == 'ru-KG') {
  defaultSymbols = exports.DateIntervalSymbols_ru_KG;
} else if (goog.LOCALE == 'ru_KZ' || goog.LOCALE == 'ru-KZ') {
  defaultSymbols = exports.DateIntervalSymbols_ru_KZ;
} else if (goog.LOCALE == 'ru_MD' || goog.LOCALE == 'ru-MD') {
  defaultSymbols = exports.DateIntervalSymbols_ru_MD;
} else if (goog.LOCALE == 'ru_RU' || goog.LOCALE == 'ru-RU') {
  defaultSymbols = exports.DateIntervalSymbols_ru_RU;
} else if (goog.LOCALE == 'ru_UA' || goog.LOCALE == 'ru-UA') {
  defaultSymbols = exports.DateIntervalSymbols_ru_UA;
} else if (goog.LOCALE == 'rw') {
  defaultSymbols = exports.DateIntervalSymbols_rw;
} else if (goog.LOCALE == 'rw_RW' || goog.LOCALE == 'rw-RW') {
  defaultSymbols = exports.DateIntervalSymbols_rw_RW;
} else if (goog.LOCALE == 'rwk') {
  defaultSymbols = exports.DateIntervalSymbols_rwk;
} else if (goog.LOCALE == 'rwk_TZ' || goog.LOCALE == 'rwk-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_rwk_TZ;
} else if (goog.LOCALE == 'sah') {
  defaultSymbols = exports.DateIntervalSymbols_sah;
} else if (goog.LOCALE == 'sah_RU' || goog.LOCALE == 'sah-RU') {
  defaultSymbols = exports.DateIntervalSymbols_sah_RU;
} else if (goog.LOCALE == 'saq') {
  defaultSymbols = exports.DateIntervalSymbols_saq;
} else if (goog.LOCALE == 'saq_KE' || goog.LOCALE == 'saq-KE') {
  defaultSymbols = exports.DateIntervalSymbols_saq_KE;
} else if (goog.LOCALE == 'sbp') {
  defaultSymbols = exports.DateIntervalSymbols_sbp;
} else if (goog.LOCALE == 'sbp_TZ' || goog.LOCALE == 'sbp-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_sbp_TZ;
} else if (goog.LOCALE == 'se') {
  defaultSymbols = exports.DateIntervalSymbols_se;
} else if (goog.LOCALE == 'se_FI' || goog.LOCALE == 'se-FI') {
  defaultSymbols = exports.DateIntervalSymbols_se_FI;
} else if (goog.LOCALE == 'se_NO' || goog.LOCALE == 'se-NO') {
  defaultSymbols = exports.DateIntervalSymbols_se_NO;
} else if (goog.LOCALE == 'se_SE' || goog.LOCALE == 'se-SE') {
  defaultSymbols = exports.DateIntervalSymbols_se_SE;
} else if (goog.LOCALE == 'seh') {
  defaultSymbols = exports.DateIntervalSymbols_seh;
} else if (goog.LOCALE == 'seh_MZ' || goog.LOCALE == 'seh-MZ') {
  defaultSymbols = exports.DateIntervalSymbols_seh_MZ;
} else if (goog.LOCALE == 'ses') {
  defaultSymbols = exports.DateIntervalSymbols_ses;
} else if (goog.LOCALE == 'ses_ML' || goog.LOCALE == 'ses-ML') {
  defaultSymbols = exports.DateIntervalSymbols_ses_ML;
} else if (goog.LOCALE == 'sg') {
  defaultSymbols = exports.DateIntervalSymbols_sg;
} else if (goog.LOCALE == 'sg_CF' || goog.LOCALE == 'sg-CF') {
  defaultSymbols = exports.DateIntervalSymbols_sg_CF;
} else if (goog.LOCALE == 'shi') {
  defaultSymbols = exports.DateIntervalSymbols_shi;
} else if (goog.LOCALE == 'shi_Latn' || goog.LOCALE == 'shi-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_shi_Latn;
} else if (goog.LOCALE == 'shi_Latn_MA' || goog.LOCALE == 'shi-Latn-MA') {
  defaultSymbols = exports.DateIntervalSymbols_shi_Latn_MA;
} else if (goog.LOCALE == 'shi_Tfng' || goog.LOCALE == 'shi-Tfng') {
  defaultSymbols = exports.DateIntervalSymbols_shi_Tfng;
} else if (goog.LOCALE == 'shi_Tfng_MA' || goog.LOCALE == 'shi-Tfng-MA') {
  defaultSymbols = exports.DateIntervalSymbols_shi_Tfng_MA;
} else if (goog.LOCALE == 'si_LK' || goog.LOCALE == 'si-LK') {
  defaultSymbols = exports.DateIntervalSymbols_si_LK;
} else if (goog.LOCALE == 'sk_SK' || goog.LOCALE == 'sk-SK') {
  defaultSymbols = exports.DateIntervalSymbols_sk_SK;
} else if (goog.LOCALE == 'sl_SI' || goog.LOCALE == 'sl-SI') {
  defaultSymbols = exports.DateIntervalSymbols_sl_SI;
} else if (goog.LOCALE == 'smn') {
  defaultSymbols = exports.DateIntervalSymbols_smn;
} else if (goog.LOCALE == 'smn_FI' || goog.LOCALE == 'smn-FI') {
  defaultSymbols = exports.DateIntervalSymbols_smn_FI;
} else if (goog.LOCALE == 'sn') {
  defaultSymbols = exports.DateIntervalSymbols_sn;
} else if (goog.LOCALE == 'sn_ZW' || goog.LOCALE == 'sn-ZW') {
  defaultSymbols = exports.DateIntervalSymbols_sn_ZW;
} else if (goog.LOCALE == 'so') {
  defaultSymbols = exports.DateIntervalSymbols_so;
} else if (goog.LOCALE == 'so_DJ' || goog.LOCALE == 'so-DJ') {
  defaultSymbols = exports.DateIntervalSymbols_so_DJ;
} else if (goog.LOCALE == 'so_ET' || goog.LOCALE == 'so-ET') {
  defaultSymbols = exports.DateIntervalSymbols_so_ET;
} else if (goog.LOCALE == 'so_KE' || goog.LOCALE == 'so-KE') {
  defaultSymbols = exports.DateIntervalSymbols_so_KE;
} else if (goog.LOCALE == 'so_SO' || goog.LOCALE == 'so-SO') {
  defaultSymbols = exports.DateIntervalSymbols_so_SO;
} else if (goog.LOCALE == 'sq_AL' || goog.LOCALE == 'sq-AL') {
  defaultSymbols = exports.DateIntervalSymbols_sq_AL;
} else if (goog.LOCALE == 'sq_MK' || goog.LOCALE == 'sq-MK') {
  defaultSymbols = exports.DateIntervalSymbols_sq_MK;
} else if (goog.LOCALE == 'sq_XK' || goog.LOCALE == 'sq-XK') {
  defaultSymbols = exports.DateIntervalSymbols_sq_XK;
} else if (goog.LOCALE == 'sr_Cyrl' || goog.LOCALE == 'sr-Cyrl') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Cyrl;
} else if (goog.LOCALE == 'sr_Cyrl_BA' || goog.LOCALE == 'sr-Cyrl-BA') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Cyrl_BA;
} else if (goog.LOCALE == 'sr_Cyrl_ME' || goog.LOCALE == 'sr-Cyrl-ME') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Cyrl_ME;
} else if (goog.LOCALE == 'sr_Cyrl_RS' || goog.LOCALE == 'sr-Cyrl-RS') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Cyrl_RS;
} else if (goog.LOCALE == 'sr_Cyrl_XK' || goog.LOCALE == 'sr-Cyrl-XK') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Cyrl_XK;
} else if (goog.LOCALE == 'sr_Latn_BA' || goog.LOCALE == 'sr-Latn-BA') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Latn_BA;
} else if (goog.LOCALE == 'sr_Latn_ME' || goog.LOCALE == 'sr-Latn-ME') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Latn_ME;
} else if (goog.LOCALE == 'sr_Latn_RS' || goog.LOCALE == 'sr-Latn-RS') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Latn_RS;
} else if (goog.LOCALE == 'sr_Latn_XK' || goog.LOCALE == 'sr-Latn-XK') {
  defaultSymbols = exports.DateIntervalSymbols_sr_Latn_XK;
} else if (goog.LOCALE == 'sv_AX' || goog.LOCALE == 'sv-AX') {
  defaultSymbols = exports.DateIntervalSymbols_sv_AX;
} else if (goog.LOCALE == 'sv_FI' || goog.LOCALE == 'sv-FI') {
  defaultSymbols = exports.DateIntervalSymbols_sv_FI;
} else if (goog.LOCALE == 'sv_SE' || goog.LOCALE == 'sv-SE') {
  defaultSymbols = exports.DateIntervalSymbols_sv_SE;
} else if (goog.LOCALE == 'sw_CD' || goog.LOCALE == 'sw-CD') {
  defaultSymbols = exports.DateIntervalSymbols_sw_CD;
} else if (goog.LOCALE == 'sw_KE' || goog.LOCALE == 'sw-KE') {
  defaultSymbols = exports.DateIntervalSymbols_sw_KE;
} else if (goog.LOCALE == 'sw_TZ' || goog.LOCALE == 'sw-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_sw_TZ;
} else if (goog.LOCALE == 'sw_UG' || goog.LOCALE == 'sw-UG') {
  defaultSymbols = exports.DateIntervalSymbols_sw_UG;
} else if (goog.LOCALE == 'ta_IN' || goog.LOCALE == 'ta-IN') {
  defaultSymbols = exports.DateIntervalSymbols_ta_IN;
} else if (goog.LOCALE == 'ta_LK' || goog.LOCALE == 'ta-LK') {
  defaultSymbols = exports.DateIntervalSymbols_ta_LK;
} else if (goog.LOCALE == 'ta_MY' || goog.LOCALE == 'ta-MY') {
  defaultSymbols = exports.DateIntervalSymbols_ta_MY;
} else if (goog.LOCALE == 'ta_SG' || goog.LOCALE == 'ta-SG') {
  defaultSymbols = exports.DateIntervalSymbols_ta_SG;
} else if (goog.LOCALE == 'te_IN' || goog.LOCALE == 'te-IN') {
  defaultSymbols = exports.DateIntervalSymbols_te_IN;
} else if (goog.LOCALE == 'teo') {
  defaultSymbols = exports.DateIntervalSymbols_teo;
} else if (goog.LOCALE == 'teo_KE' || goog.LOCALE == 'teo-KE') {
  defaultSymbols = exports.DateIntervalSymbols_teo_KE;
} else if (goog.LOCALE == 'teo_UG' || goog.LOCALE == 'teo-UG') {
  defaultSymbols = exports.DateIntervalSymbols_teo_UG;
} else if (goog.LOCALE == 'th_TH' || goog.LOCALE == 'th-TH') {
  defaultSymbols = exports.DateIntervalSymbols_th_TH;
} else if (goog.LOCALE == 'ti') {
  defaultSymbols = exports.DateIntervalSymbols_ti;
} else if (goog.LOCALE == 'ti_ER' || goog.LOCALE == 'ti-ER') {
  defaultSymbols = exports.DateIntervalSymbols_ti_ER;
} else if (goog.LOCALE == 'ti_ET' || goog.LOCALE == 'ti-ET') {
  defaultSymbols = exports.DateIntervalSymbols_ti_ET;
} else if (goog.LOCALE == 'to') {
  defaultSymbols = exports.DateIntervalSymbols_to;
} else if (goog.LOCALE == 'to_TO' || goog.LOCALE == 'to-TO') {
  defaultSymbols = exports.DateIntervalSymbols_to_TO;
} else if (goog.LOCALE == 'tr_CY' || goog.LOCALE == 'tr-CY') {
  defaultSymbols = exports.DateIntervalSymbols_tr_CY;
} else if (goog.LOCALE == 'tr_TR' || goog.LOCALE == 'tr-TR') {
  defaultSymbols = exports.DateIntervalSymbols_tr_TR;
} else if (goog.LOCALE == 'twq') {
  defaultSymbols = exports.DateIntervalSymbols_twq;
} else if (goog.LOCALE == 'twq_NE' || goog.LOCALE == 'twq-NE') {
  defaultSymbols = exports.DateIntervalSymbols_twq_NE;
} else if (goog.LOCALE == 'tzm') {
  defaultSymbols = exports.DateIntervalSymbols_tzm;
} else if (goog.LOCALE == 'tzm_MA' || goog.LOCALE == 'tzm-MA') {
  defaultSymbols = exports.DateIntervalSymbols_tzm_MA;
} else if (goog.LOCALE == 'ug') {
  defaultSymbols = exports.DateIntervalSymbols_ug;
} else if (goog.LOCALE == 'ug_CN' || goog.LOCALE == 'ug-CN') {
  defaultSymbols = exports.DateIntervalSymbols_ug_CN;
} else if (goog.LOCALE == 'uk_UA' || goog.LOCALE == 'uk-UA') {
  defaultSymbols = exports.DateIntervalSymbols_uk_UA;
} else if (goog.LOCALE == 'ur_IN' || goog.LOCALE == 'ur-IN') {
  defaultSymbols = exports.DateIntervalSymbols_ur_IN;
} else if (goog.LOCALE == 'ur_PK' || goog.LOCALE == 'ur-PK') {
  defaultSymbols = exports.DateIntervalSymbols_ur_PK;
} else if (goog.LOCALE == 'uz_Arab' || goog.LOCALE == 'uz-Arab') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Arab;
} else if (goog.LOCALE == 'uz_Arab_AF' || goog.LOCALE == 'uz-Arab-AF') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Arab_AF;
} else if (goog.LOCALE == 'uz_Cyrl' || goog.LOCALE == 'uz-Cyrl') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Cyrl;
} else if (goog.LOCALE == 'uz_Cyrl_UZ' || goog.LOCALE == 'uz-Cyrl-UZ') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Cyrl_UZ;
} else if (goog.LOCALE == 'uz_Latn' || goog.LOCALE == 'uz-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Latn;
} else if (goog.LOCALE == 'uz_Latn_UZ' || goog.LOCALE == 'uz-Latn-UZ') {
  defaultSymbols = exports.DateIntervalSymbols_uz_Latn_UZ;
} else if (goog.LOCALE == 'vai') {
  defaultSymbols = exports.DateIntervalSymbols_vai;
} else if (goog.LOCALE == 'vai_Latn' || goog.LOCALE == 'vai-Latn') {
  defaultSymbols = exports.DateIntervalSymbols_vai_Latn;
} else if (goog.LOCALE == 'vai_Latn_LR' || goog.LOCALE == 'vai-Latn-LR') {
  defaultSymbols = exports.DateIntervalSymbols_vai_Latn_LR;
} else if (goog.LOCALE == 'vai_Vaii' || goog.LOCALE == 'vai-Vaii') {
  defaultSymbols = exports.DateIntervalSymbols_vai_Vaii;
} else if (goog.LOCALE == 'vai_Vaii_LR' || goog.LOCALE == 'vai-Vaii-LR') {
  defaultSymbols = exports.DateIntervalSymbols_vai_Vaii_LR;
} else if (goog.LOCALE == 'vi_VN' || goog.LOCALE == 'vi-VN') {
  defaultSymbols = exports.DateIntervalSymbols_vi_VN;
} else if (goog.LOCALE == 'vun') {
  defaultSymbols = exports.DateIntervalSymbols_vun;
} else if (goog.LOCALE == 'vun_TZ' || goog.LOCALE == 'vun-TZ') {
  defaultSymbols = exports.DateIntervalSymbols_vun_TZ;
} else if (goog.LOCALE == 'wae') {
  defaultSymbols = exports.DateIntervalSymbols_wae;
} else if (goog.LOCALE == 'wae_CH' || goog.LOCALE == 'wae-CH') {
  defaultSymbols = exports.DateIntervalSymbols_wae_CH;
} else if (goog.LOCALE == 'xog') {
  defaultSymbols = exports.DateIntervalSymbols_xog;
} else if (goog.LOCALE == 'xog_UG' || goog.LOCALE == 'xog-UG') {
  defaultSymbols = exports.DateIntervalSymbols_xog_UG;
} else if (goog.LOCALE == 'yav') {
  defaultSymbols = exports.DateIntervalSymbols_yav;
} else if (goog.LOCALE == 'yav_CM' || goog.LOCALE == 'yav-CM') {
  defaultSymbols = exports.DateIntervalSymbols_yav_CM;
} else if (goog.LOCALE == 'yi') {
  defaultSymbols = exports.DateIntervalSymbols_yi;
} else if (goog.LOCALE == 'yi_001' || goog.LOCALE == 'yi-001') {
  defaultSymbols = exports.DateIntervalSymbols_yi_001;
} else if (goog.LOCALE == 'yo') {
  defaultSymbols = exports.DateIntervalSymbols_yo;
} else if (goog.LOCALE == 'yo_BJ' || goog.LOCALE == 'yo-BJ') {
  defaultSymbols = exports.DateIntervalSymbols_yo_BJ;
} else if (goog.LOCALE == 'yo_NG' || goog.LOCALE == 'yo-NG') {
  defaultSymbols = exports.DateIntervalSymbols_yo_NG;
} else if (goog.LOCALE == 'yue') {
  defaultSymbols = exports.DateIntervalSymbols_yue;
} else if (goog.LOCALE == 'yue_HK' || goog.LOCALE == 'yue-HK') {
  defaultSymbols = exports.DateIntervalSymbols_yue_HK;
} else if (goog.LOCALE == 'zgh') {
  defaultSymbols = exports.DateIntervalSymbols_zgh;
} else if (goog.LOCALE == 'zgh_MA' || goog.LOCALE == 'zgh-MA') {
  defaultSymbols = exports.DateIntervalSymbols_zgh_MA;
} else if (goog.LOCALE == 'zh_Hans' || goog.LOCALE == 'zh-Hans') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hans;
} else if (goog.LOCALE == 'zh_Hans_CN' || goog.LOCALE == 'zh-Hans-CN') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hans_CN;
} else if (goog.LOCALE == 'zh_Hans_HK' || goog.LOCALE == 'zh-Hans-HK') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hans_HK;
} else if (goog.LOCALE == 'zh_Hans_MO' || goog.LOCALE == 'zh-Hans-MO') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hans_MO;
} else if (goog.LOCALE == 'zh_Hans_SG' || goog.LOCALE == 'zh-Hans-SG') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hans_SG;
} else if (goog.LOCALE == 'zh_Hant' || goog.LOCALE == 'zh-Hant') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hant;
} else if (goog.LOCALE == 'zh_Hant_HK' || goog.LOCALE == 'zh-Hant-HK') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hant_HK;
} else if (goog.LOCALE == 'zh_Hant_MO' || goog.LOCALE == 'zh-Hant-MO') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hant_MO;
} else if (goog.LOCALE == 'zh_Hant_TW' || goog.LOCALE == 'zh-Hant-TW') {
  defaultSymbols = exports.DateIntervalSymbols_zh_Hant_TW;
} else if (goog.LOCALE == 'zu_ZA' || goog.LOCALE == 'zu-ZA') {
  defaultSymbols = exports.DateIntervalSymbols_zu_ZA;
}

if (defaultSymbols != null) {
  dateIntervalSymbols.setDateIntervalSymbols(defaultSymbols);
}
