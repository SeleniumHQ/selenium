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
 * This file covers those locales that are not covered in
 * "dateintervalpatterns.js".
 */

// clang-format off

goog.module('goog.i18n.dateIntervalPatternsExt');

var dateIntervalPatterns = goog.require('goog.i18n.dateIntervalPatterns');

/** @type {!dateIntervalPatterns.DateIntervalPatterns} */
var defaultPatterns;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_af_NA = dateIntervalPatterns.DateIntervalPatterns_af;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_af_ZA = dateIntervalPatterns.DateIntervalPatterns_af;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_agq = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_agq_CM = exports.DateIntervalPatterns_agq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ak = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'y MMM d'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ak_GH = exports.DateIntervalPatterns_ak;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_am_ET = dateIntervalPatterns.DateIntervalPatterns_am;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_001 = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_AE = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_BH = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_DJ = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_EH = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_ER = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_IL = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_IQ = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_JO = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_KM = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_KW = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_LB = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_LY = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_MA = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_MR = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_OM = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_PS = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_QA = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_SA = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_SD = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_SO = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_SS = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_SY = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_TD = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_TN = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_XB = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ar_YE = dateIntervalPatterns.DateIntervalPatterns_ar;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_as = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'G y – y',
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
    'G': 'GGGGG M/y – GGGGG M/y',
    '_': 'MM-y'
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
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d MMM, y – G d MMM, y',
    'M': 'd MMM y – d MMM',
    'd': 'd–d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM y – d MMM y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G E, d MMM, y – G E, d MMM, y',
    'Md': 'E, d MMM y – E, d MMM',
    'y': 'E, d MMM y – d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd-MM – dd-MM',
    'd': 'd–d',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_as_IN = exports.DateIntervalPatterns_as;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_asa = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_asa_TZ = exports.DateIntervalPatterns_asa;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ast = {
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
    'M': 'LLLL – LLLL \'de\' y',
    '_': 'LLLL \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'MM – MM/y',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd/MM – d/MM',
    'd': 'd – d MMM',
    'y': 'd MMM \'de\' y – d MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd/MM – d/MM',
    'd': 'd – d MMMM',
    'y': 'd MMMM \'de\' y – d MMMM \'de\' y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'M': 'dd/MM – dd/MM',
    'd': 'dd – dd/MM',
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd/MM – d/MM',
    'd': 'd – d MMMM',
    'y': 'd MMMM \'de\' y – d MMMM \'de\' y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM \'de\' y',
    'd': 'd – d MMM \'de\' y',
    'y': 'd MMM \'de\' y – d MMM \'de\' y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM \'de\' y – E, d MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E, d MMM – E, d MMM \'de\' y',
    'y': 'E, d MMM \'de\' y – E, d MMM \'de\' y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ast_ES = exports.DateIntervalPatterns_ast;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_az_Cyrl = {
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
    'y': 'y MMM – y MMM',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_az_Cyrl_AZ = {
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
    'y': 'y MMM – y MMM',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_az_Latn = dateIntervalPatterns.DateIntervalPatterns_az;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_az_Latn_AZ = dateIntervalPatterns.DateIntervalPatterns_az;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bas = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bas_CM = exports.DateIntervalPatterns_bas;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_be_BY = dateIntervalPatterns.DateIntervalPatterns_be;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bem = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bem_ZM = exports.DateIntervalPatterns_bem;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bez = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bez_TZ = exports.DateIntervalPatterns_bez;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bg_BG = dateIntervalPatterns.DateIntervalPatterns_bg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bm = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bm_ML = exports.DateIntervalPatterns_bm;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bn_BD = dateIntervalPatterns.DateIntervalPatterns_bn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bn_IN = dateIntervalPatterns.DateIntervalPatterns_bn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bo = {
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
    '_': 'y LLL'
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
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'MMMཚེས་d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMMའི་ཚེས་dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMMའི་ཚེས་d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'y ལོའི་MMMཚེས་d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'MMMཚེས་d, EEE'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bo_CN = exports.DateIntervalPatterns_bo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bo_IN = exports.DateIntervalPatterns_bo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_br_FR = dateIntervalPatterns.DateIntervalPatterns_br;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_brx = {
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
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd-MMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_brx_IN = exports.DateIntervalPatterns_brx;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bs_Cyrl = {
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
    'y': 'MMM y. – MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y.',
    'y': 'MMMM y. – MMMM y.',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'MM.–MM. y.',
    'y': 'MM.y. – MM.y.',
    '_': 'MM.y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd.–dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'dd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd.–dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'dd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, dd. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, dd. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bs_Cyrl_BA = {
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
    'y': 'MMM y. – MMM y.',
    '_': 'MMM y.'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y.',
    'y': 'MMMM y. – MMMM y.',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'MM.–MM. y.',
    'y': 'MM.y. – MM.y.',
    '_': 'MM.y.'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd. MMM – dd. MMM',
    'd': 'dd.–dd. MMM',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'dd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M – d.M',
    'y': 'd.M.y. – d.M.y.',
    '_': 'dd.MM.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd. MMMM – dd. MMMM',
    'd': 'dd.–dd. MMMM',
    'y': 'dd. MMMM y. – dd. MMMM y.',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd. MMM – dd. MMM y.',
    'd': 'dd.–dd. MMM y.',
    'y': 'dd. MMM y. – dd. MMM y.',
    '_': 'dd. MMM y.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd. MMM – E, dd. MMM',
    'd': 'E, dd. – E, dd. MMM',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, dd. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E, dd. MMM – E, dd. MMM y.',
    'd': 'E, dd. – E, dd. MMM y.',
    'y': 'E, dd. MMM y. – E, dd. MMM y.',
    '_': 'EEE, dd. MMM y.'
  },
  DAY_ABBR: {
    'M': 'd.M – d.M',
    'd': 'd–d',
    'y': 'd.M.y. – d.M.y.',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bs_Latn = dateIntervalPatterns.DateIntervalPatterns_bs;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_bs_Latn_BA = dateIntervalPatterns.DateIntervalPatterns_bs;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ca_AD = dateIntervalPatterns.DateIntervalPatterns_ca;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ca_ES = dateIntervalPatterns.DateIntervalPatterns_ca;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ca_FR = dateIntervalPatterns.DateIntervalPatterns_ca;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ca_IT = dateIntervalPatterns.DateIntervalPatterns_ca;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ccp = {
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
    'G': 'G y MMM d – G y MMM d',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ccp_BD = exports.DateIntervalPatterns_ccp;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ccp_IN = exports.DateIntervalPatterns_ccp;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ce = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ce_RU = exports.DateIntervalPatterns_ce;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ceb = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ceb_PH = exports.DateIntervalPatterns_ceb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_cgg = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_cgg_UG = exports.DateIntervalPatterns_cgg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_chr_US = dateIntervalPatterns.DateIntervalPatterns_chr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ckb = {
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
    '_': 'MMMی y'
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
    '_': 'dی MMM'
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
    'y': 'y MMM d – y MMM d',
    '_': 'dی MMMی y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE، dی MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE، dی MMMی y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ckb_IQ = exports.DateIntervalPatterns_ckb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ckb_IR = exports.DateIntervalPatterns_ckb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_cs_CZ = dateIntervalPatterns.DateIntervalPatterns_cs;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_cy_GB = dateIntervalPatterns.DateIntervalPatterns_cy;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_da_DK = dateIntervalPatterns.DateIntervalPatterns_da;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_da_GL = dateIntervalPatterns.DateIntervalPatterns_da;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dav = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dav_KE = exports.DateIntervalPatterns_dav;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_de_BE = dateIntervalPatterns.DateIntervalPatterns_de;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_de_DE = dateIntervalPatterns.DateIntervalPatterns_de;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_de_IT = dateIntervalPatterns.DateIntervalPatterns_de;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_de_LI = dateIntervalPatterns.DateIntervalPatterns_de;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_de_LU = dateIntervalPatterns.DateIntervalPatterns_de;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dje = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dje_NE = exports.DateIntervalPatterns_dje;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dsb = {
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
    'M': 'LLL – LLL y',
    'y': 'LLL y – LLL y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLLL – LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M.y – M.y',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd. – d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd.M.y – d.M.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y',
    'd': 'd. – d. MMM y',
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
    'M': 'd.M. – d.M.',
    'd': 'd. – d.',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dsb_DE = exports.DateIntervalPatterns_dsb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dua = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dua_CM = exports.DateIntervalPatterns_dua;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dyo = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dyo_SN = exports.DateIntervalPatterns_dyo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dz = {
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
    'M': 'སྤྱི་ཟླ་MMM/MMM, y',
    'y': 'y-MM – y-MM',
    '_': 'y སྤྱི་ཟླ་MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y-སྤྱི་ཟླ་MM – MM',
    'y': 'y-MM – y-MM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'y-MM – MM',
    '_': 'y-MM'
  },
  MONTH_DAY_ABBR: {
    'M': 'སྤྱི་ཟླ་MM ཚེས་d–ཟླ་MM ཚེས་d',
    'd': 'སྤྱི་ཟླ་MM ཚེས་d–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'སྤྱི་LLL ཚེ་d'
  },
  MONTH_DAY_FULL: {
    'M': 'སྤྱི་ཟླ་MM ཚེས་d–ཟླ་MM ཚེས་d',
    'd': 'སྤྱི་ཟླ་MM ཚེས་d–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'M': 'སྤྱི་ཟླ་MM ཚེས་dd–ཟླ་MM ཚེས་dd',
    'd': 'སྤྱི་ཟླ་M ཚེས་dd/dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'སྤྱི་ཟླ་MM ཚེས་d–ཟླ་MM ཚེས་d',
    'd': 'སྤྱི་ཟླ་MM ཚེས་d–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y-MM-dd – MM-d',
    'd': 'y-MM-d – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, སྤྱི་ཟླ་MM ཚེས་d – E, ཟླ་MM ཚེས་d',
    'y': 'E, y-MM-dd – E, y-MM-dd',
    '_': 'EEE, སྤྱི་LLL ཚེ་d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Mdy': 'E, y-MM-dd – E, y-MM-dd',
    '_': 'གཟའ་EEE, ལོy ཟླ་MMM ཚེ་d'
  },
  DAY_ABBR: {
    'M': 'སྤྱི་ཟླ་MM ཚེས་dd–ཟླ་MM ཚེས་dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_dz_BT = exports.DateIntervalPatterns_dz;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ebu = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ebu_KE = exports.DateIntervalPatterns_ebu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ee = {
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
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d \'lia\' – MMM d \'lia\'',
    'd': 'MMM d \'lia\' – d \'lia\'',
    'y': 'MMM d \'lia\' , y – MMM d \'lia\', y',
    '_': 'MMM d \'lia\''
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d \'lia\' – MMMM d \'lia\'',
    'd': 'MMMM d \'lia\' – d \'lia\'',
    'y': 'MMMM d \'lia\' , y – MMMM d \'lia\', y',
    '_': 'MMMM dd \'lia\''
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d \'lia\' – MMMM d \'lia\'',
    'd': 'MMMM d \'lia\' – d \'lia\'',
    'y': 'MMMM d \'lia\' , y – MMMM d \'lia\', y',
    '_': 'MMMM d \'lia\''
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'MMM d \'lia\' – MMM d \'lia\', y',
    'd': 'MMM d \'lia\' – d \'lia\' , y',
    'y': 'MMM d \'lia\' , y – MMM d \'lia\', y',
    '_': 'MMM d \'lia\', y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, MMM d \'lia\' – E, MMM d \'lia\'',
    'y': 'E, MMM d \'lia\', y – E, MMM d \'lia\', y',
    '_': 'EEE, MMM d \'lia\''
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E, MMM d \'lia\' – E, MMM d \'lia\', y',
    'y': 'E, MMM d \'lia\', y – E, MMM d \'lia\', y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'd': 'd–d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ee_GH = exports.DateIntervalPatterns_ee;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ee_TG = exports.DateIntervalPatterns_ee;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_el_CY = dateIntervalPatterns.DateIntervalPatterns_el;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_el_GR = dateIntervalPatterns.DateIntervalPatterns_el;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_001 = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_150 = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AS = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_AT = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BB = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BI = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BS = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_BZ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CH = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CX = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_CY = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_DE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_DG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_DK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_DM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_ER = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_FI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_FJ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_FK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_FM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GD = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GH = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GU = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_GY = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_HK = {
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
    'Md': 'd/M – d/M',
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
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_IL = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_IM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_IO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_JE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_JM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_KE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_KI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_KN = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_KY = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_LC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_LR = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_LS = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MH = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MP = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MS = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MT = {
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
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM y'
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
    '_': 'EEE, dd MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MU = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_MY = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NA = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NF = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NL = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NR = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NU = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_NZ = {
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
    'Md': 'd/MM – d/MM',
    'y': 'd/MM/y – d/MM/y',
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
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/MM – d/MM',
    'y': 'd/MM/y – d/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PH = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PN = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PR = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_PW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_RW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SB = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SD = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SE = {
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
    'My': 'MM/y – MM/y',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SH = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SL = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SS = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SX = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_SZ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TT = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TV = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_TZ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_UG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_UM = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_US_POSIX = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_VC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_VG = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_VI = dateIntervalPatterns.DateIntervalPatterns_en;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_VU = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_WS = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_XA = {
  YEAR_FULL: {
    'G': '[y G – y G]',
    'y': '[y – y]',
    '_': '[y]'
  },
  YEAR_FULL_WITH_ERA: {
    'G': '[y G – y G]',
    'y': '[y – y G]',
    '_': '[y G]'
  },
  YEAR_MONTH_ABBR: {
    'G': '[MMM y G – MMM y G]',
    'M': '[MMM – MMM y]',
    'y': '[MMM y – MMM y]',
    '_': '[MMM y]'
  },
  YEAR_MONTH_FULL: {
    'G': '[MMMM y G – MMMM y G]',
    'M': '[MMMM – MMMM y]',
    'y': '[MMMM y – MMMM y]',
    '_': '[MMMM y]'
  },
  YEAR_MONTH_SHORT: {
    'G': '[M/y GGGGG – M/y GGGGG]',
    'My': '[M/y – M/y]',
    '_': '[MM/y]'
  },
  MONTH_DAY_ABBR: {
    'M': '[MMM d – MMM d]',
    'd': '[MMM d – d]',
    'y': '[MMM d, y – MMM d, y]',
    '_': '[MMM d]'
  },
  MONTH_DAY_FULL: {
    'M': '[MMMM d – MMMM d]',
    'd': '[MMMM d – d]',
    'y': '[MMMM d, y – MMMM d, y]',
    '_': '[MMMM dd]'
  },
  MONTH_DAY_SHORT: {
    'Md': '[M/d – M/d]',
    'y': '[M/d/y – M/d/y]',
    '_': '[M/d]'
  },
  MONTH_DAY_MEDIUM: {
    'M': '[MMMM d – MMMM d]',
    'd': '[MMMM d – d]',
    'y': '[MMMM d, y – MMMM d, y]',
    '_': '[MMMM d]'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': '[MMM d, y G – MMM d, y G]',
    'M': '[MMM d – MMM d, y]',
    'd': '[MMM d – d, y]',
    'y': '[MMM d, y – MMM d, y]',
    '_': '[MMM d, y]'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': '[E, MMM d – E, MMM d]',
    'y': '[E, MMM d, y – E, MMM d, y]',
    '_': '[EEE, MMM d]'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': '[E, MMM d, y G – E, MMM d, y G]',
    'Md': '[E, MMM d – E, MMM d, y]',
    'y': '[E, MMM d, y – E, MMM d, y]',
    '_': '[EEE, MMM d, y]'
  },
  DAY_ABBR: {
    'M': '[M/d – M/d]',
    'd': '[d – d]',
    'y': '[M/d/y – M/d/y]',
    '_': '[d]'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_ZM = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_en_ZW = {
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
    'y': 'd MMM y – d MMM y',
    '_': 'dd MMM, y'
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
    '_': 'EEE, dd MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_eo = {
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
    'y': 'y MMM d – y MMM d',
    '_': 'y-MMM-d'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_eo_001 = exports.DateIntervalPatterns_eo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_AR = {
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
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM \'al\' MMMM \'de\' y',
    'y': 'MMMM \'de\' y \'al\' MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'MM/y – MM/y',
    '_': 'M/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM',
    'd': 'dd – dd \'de\' MM',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM',
    'd': 'E d \'al\' E d \'de\' MMM',
    'y': 'E, d \'de\' MMM \'de\' y \'al\' E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'M': 'E, d \'de\' MMM \'al\' E, d \'de\' MMM \'de\' y',
    'd': 'E, d \'al\' E, d \'de\' MMM \'de\' y',
    'y': 'E, d \'de\' MMM \'de\' y \'al\' E, d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_BO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_BR = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_BZ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_CL = {
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
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    'y': 'MMMM \'de\' y–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'MM-y – MM-y',
    '_': 'M/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd-MM – dd-MM',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM',
    'd': 'E d \'al\' E d \'de\' MMM',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM \'de\' y',
    'd': 'E d \'al\' E d \'de\' MMM \'de\' y',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'dd-MM – dd-MM',
    'd': 'd–d',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_CO = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y \'a\' y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'y G – y G',
    'y': 'y–y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'MMM y G – MMM y G',
    'M': 'MMM \'a\' MMM \'de\' y',
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM \'a\' MMMM \'de\' y',
    'y': 'MMMM \'de\' y \'a\' MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'M': 'MM/y \'a\' MM/y',
    'y': 'MM/y \'al\' MM/y',
    '_': 'M/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM',
    'd': 'd \'a\' d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'M': 'd/MM \'al\' d/MM',
    'd': 'd/MM \'a\' d/MM',
    'y': 'd/MM/y \'al\' d/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd \'a\' d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM',
    'd': 'E d \'al\' E d \'de\' MMM',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM \'de\' y',
    'd': 'E d \'al\' E d \'de\' MMM \'de\' y',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/MM \'al\' d/MM',
    'd': 'd \'a\' d',
    'y': 'd/MM/y \'al\' d/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_CR = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_CU = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_DO = {
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
    '_': 'd MMM \'de\' y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_EA = dateIntervalPatterns.DateIntervalPatterns_es;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_EC = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_GQ = dateIntervalPatterns.DateIntervalPatterns_es;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_GT = {
  YEAR_FULL: {
    'G': 'y G – y G',
    'y': 'y \'al\' y',
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
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'MM/y – MM/y',
    '_': 'M/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/MM – d/MM',
    'y': 'd/MM/y – d/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd \'de\' MMMM \'de\' y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM',
    'd': 'E d \'al\' E d \'de\' MMM',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM \'de\' y',
    'd': 'E d \'al\' E d \'de\' MMM \'de\' y',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/MM – d/MM',
    'y': 'd/MM/y – d/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_HN = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_IC = dateIntervalPatterns.DateIntervalPatterns_es;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_NI = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_PA = {
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
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM–MMMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'MM/y GGGGG – MM/y GGGGG',
    'My': 'MM/y – MM/y',
    '_': 'M/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM',
    'd': 'd – d \'de\' MMM',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'de\' MMMM–d \'de\' MMMM',
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'MM/dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
    'd': 'd – d \'de\' MMM \'de\' y',
    'y': 'd \'de\' MMM \'de\' y \'al\' d \'de\' MMM \'de\' y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM',
    'd': 'E d \'al\' E d \'de\' MMM',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E d MMM \'de\' y G – E d MMM \'de\' y G',
    'M': 'E d \'de\' MMM \'al\' E d \'de\' MMM \'de\' y',
    'd': 'E d \'al\' E d \'de\' MMM \'de\' y',
    'y': 'E d \'de\' MMM \'de\' y \'al\' E d \'de\' MMM \'de\' y',
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_PE = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_PH = dateIntervalPatterns.DateIntervalPatterns_es;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_PR = {
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
    'Md': 'd/M–d/M',
    'y': 'd/M/y–d/M/y',
    '_': 'MM/dd'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_PY = {
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
    'M': 'MMM \'a\' MMM y',
    'y': 'MMM \'de\' y \'a\' MMM \'de\' y',
    '_': 'MMMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'MMMM \'a\' MMMM \'de\' y',
    'y': 'MMMM \'de\' y \'a\' MMMM \'de\' y',
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
    'Md': 'd/M \'al\' d/M',
    'y': 'd/M/y \'al\' d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'de\' MMMM',
    'y': 'd \'de\' MMMM \'de\' y–d \'de\' MMMM \'de\' y',
    '_': 'd \'de\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM \'de\' y G – d MMM \'de\' y G',
    'M': 'd \'de\' MMM \'al\' d \'de\' MMM \'de\' y',
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
    'M': 'd/M \'al\' d/M',
    'y': 'd/M/y \'al\' d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_SV = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_UY = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_es_VE = {
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_et_EE = dateIntervalPatterns.DateIntervalPatterns_et;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_eu_ES = dateIntervalPatterns.DateIntervalPatterns_eu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ewo = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ewo_CM = exports.DateIntervalPatterns_ewo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fa_AF = {
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
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd LLL تا d LLL',
    'd': 'd تا d LLL',
    'y': 'd MMM y تا d MMM y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'd LLLL تا d LLLL',
    'd': 'd تا d LLLL',
    'y': 'd MMMM y تا d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'y/M/d تا y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd LLLL تا d LLLL',
    'd': 'd تا d LLLL',
    'y': 'd MMMM y تا d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd LLL تا d MMM y',
    'd': 'd تا d MMM y',
    'y': 'd MMM y تا d MMM y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d LLL تا E d LLL',
    'y': 'E d MMM y تا E d MMM y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E d LLL تا E d MMM y',
    'y': 'E d MMM y تا E d MMM y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'M/d تا M/d',
    'y': 'y/M/d تا y/M/d',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fa_IR = dateIntervalPatterns.DateIntervalPatterns_fa;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_BF = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_CM = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_GH = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_GM = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_GN = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_GW = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_LR = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_MR = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_NE = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_NG = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_SL = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ff_Latn_SN = exports.DateIntervalPatterns_ff;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fi_FI = dateIntervalPatterns.DateIntervalPatterns_fi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fil_PH = dateIntervalPatterns.DateIntervalPatterns_fil;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fo = {
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
    'y': 'MMM y–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM.y–MM.y',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd. MMM–d. MMM',
    'd': 'd.–d. MMM',
    'y': 'dd. MMM y–dd. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'dd. MMMM y–dd. MMMM y',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM–dd.MM',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'dd. MMMM y–dd. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd. MMM–dd. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'dd. MMM y–dd. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E d. MMM–E d. MMM',
    'y': 'E dd. MMM y–E dd. MMM y',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E dd. MMM–E dd. MMM y',
    'y': 'E dd. MMM y–E dd. MMM y',
    '_': 'EEE d. MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM–dd.MM',
    'd': 'd.–d.',
    'y': 'dd.MM.y–dd.MM.y',
    '_': 'd.'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fo_DK = exports.DateIntervalPatterns_fo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fo_FO = exports.DateIntervalPatterns_fo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_BE = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_BF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_BI = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_BJ = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_BL = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CD = {
  YEAR_FULL: {
    'G': 'y G \'à\' y G',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CG = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CH = {
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
    'Md': 'dd.MM – dd.MM',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM.'
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
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CI = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_CM = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_DJ = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_DZ = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_FR = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_GA = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_GF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_GN = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_GP = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_GQ = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_HT = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_KM = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_LU = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MA = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MC = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MG = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_ML = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MQ = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MR = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_MU = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_NC = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_NE = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_PF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_PM = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_RE = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_RW = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_SC = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_SN = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_SY = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_TD = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_TG = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_TN = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_VU = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_WF = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fr_YT = dateIntervalPatterns.DateIntervalPatterns_fr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fur = {
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
    'M': 'MM – MM/y',
    'y': 'MM/y – MM/y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MM – MM/y',
    'y': 'MM/y – MM/y',
    '_': 'LLLL \'dal\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd \'di\' MMM – d \'di\' MMM',
    'd': 'd–d \'di\' MMM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd \'di\' MMMM – d \'di\' MMMM',
    'd': 'd–d \'di\' MMMM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd \'di\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d \'di\' MMMM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd \'di\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'dd/MM/y – d/MM',
    'd': 'd – d/MM/y',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E d \'di\' MMM – E d \'di\' MMM',
    'd': 'E d – E d \'di\' MMM',
    'y': 'E dd/MM/y – E dd/MM/y',
    '_': 'EEE d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Mdy': 'E dd/MM/y – E dd/MM/y',
    '_': 'EEE d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fur_IT = exports.DateIntervalPatterns_fur;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fy = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
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
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_fy_NL = exports.DateIntervalPatterns_fy;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ga_IE = dateIntervalPatterns.DateIntervalPatterns_ga;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gd = {
  YEAR_FULL: {
    'G': 'y G – y G',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'y': 'y – y G',
    '_': 'y G'
  },
  YEAR_MONTH_ABBR: {
    'G': 'LLL y G – LLL y G',
    'M': 'LLL – LLL y',
    'y': 'LLL y – LLL y',
    '_': 'LLL Y'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y G – LLLL y G',
    'M': 'LLLL – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'L/y GGGGG – L/y GGGGG',
    'My': 'L/y – L/y',
    '_': 'LL/y'
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
    '_': 'dd\'mh\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y – d/M/y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd\'mh\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'd MMM y G – d MMM y G',
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
    'G': 'E, d MMM y G – E, d MMM y G',
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d – E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gd_GB = exports.DateIntervalPatterns_gd;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gl_ES = dateIntervalPatterns.DateIntervalPatterns_gl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gsw_CH = dateIntervalPatterns.DateIntervalPatterns_gsw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gsw_FR = dateIntervalPatterns.DateIntervalPatterns_gsw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gsw_LI = dateIntervalPatterns.DateIntervalPatterns_gsw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gu_IN = dateIntervalPatterns.DateIntervalPatterns_gu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_guz = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_guz_KE = exports.DateIntervalPatterns_guz;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gv = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_gv_IM = exports.DateIntervalPatterns_gv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ha = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM, y'
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
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ha_GH = exports.DateIntervalPatterns_ha;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ha_NE = exports.DateIntervalPatterns_ha;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ha_NG = exports.DateIntervalPatterns_ha;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_haw_US = dateIntervalPatterns.DateIntervalPatterns_haw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_he_IL = dateIntervalPatterns.DateIntervalPatterns_he;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hi_IN = dateIntervalPatterns.DateIntervalPatterns_hi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hr_BA = dateIntervalPatterns.DateIntervalPatterns_hr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hr_HR = dateIntervalPatterns.DateIntervalPatterns_hr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hsb = {
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
    'M': 'LLL – LLL y',
    'y': 'LLL y – LLL y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLLL – LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M.y – M.y',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd. – d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'y': 'd.M.y – d.M.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y',
    'd': 'd. – d. MMM y',
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
    'M': 'd.M. – d.M.',
    'd': 'd. – d.',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hsb_DE = exports.DateIntervalPatterns_hsb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hu_HU = dateIntervalPatterns.DateIntervalPatterns_hu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_hy_AM = dateIntervalPatterns.DateIntervalPatterns_hy;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ia = {
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
    '_': 'MM-y'
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
    '_': 'dd \'de\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'de\' MMMM'
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
    'M': 'MM-dd – MM-dd',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ia_001 = exports.DateIntervalPatterns_ia;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_id_ID = dateIntervalPatterns.DateIntervalPatterns_id;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ig = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'y': 'y-MM – y-MM',
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM/dd – MM/dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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
    'M': 'MM/dd – MM/dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ig_NG = exports.DateIntervalPatterns_ig;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ii = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ii_CN = exports.DateIntervalPatterns_ii;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_is_IS = dateIntervalPatterns.DateIntervalPatterns_is;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_it_CH = dateIntervalPatterns.DateIntervalPatterns_it;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_it_IT = dateIntervalPatterns.DateIntervalPatterns_it;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_it_SM = dateIntervalPatterns.DateIntervalPatterns_it;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_it_VA = dateIntervalPatterns.DateIntervalPatterns_it;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ja_JP = dateIntervalPatterns.DateIntervalPatterns_ja;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jgo = {
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
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd.M'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jgo_CM = exports.DateIntervalPatterns_jgo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jmc = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jmc_TZ = exports.DateIntervalPatterns_jmc;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jv = {
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
    '_': 'MM-y'
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
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
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
    'M': 'dd/MM – dd/MM',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_jv_ID = exports.DateIntervalPatterns_jv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ka_GE = dateIntervalPatterns.DateIntervalPatterns_ka;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kab = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kab_DZ = exports.DateIntervalPatterns_kab;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kam = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kam_KE = exports.DateIntervalPatterns_kam;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kde = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kde_TZ = exports.DateIntervalPatterns_kde;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kea = {
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
    'M': 'MMMM – MMMM \'di\' y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM \'di\' y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd – d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'dd/MM – dd/MM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd \'di\' MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd/MM – dd/MM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd \'di\' MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, dd/MM – E, dd/MM',
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
    'M': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kea_CV = exports.DateIntervalPatterns_kea;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_khq = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_khq_ML = exports.DateIntervalPatterns_khq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ki = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ki_KE = exports.DateIntervalPatterns_ki;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kk_KZ = dateIntervalPatterns.DateIntervalPatterns_kk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kkj = {
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
    '_': 'MM y'
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
    '_': 'dd/MM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kkj_CM = exports.DateIntervalPatterns_kkj;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kl = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kl_GL = exports.DateIntervalPatterns_kl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kln = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kln_KE = exports.DateIntervalPatterns_kln;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_km_KH = dateIntervalPatterns.DateIntervalPatterns_km;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kn_IN = dateIntervalPatterns.DateIntervalPatterns_kn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ko_KP = dateIntervalPatterns.DateIntervalPatterns_ko;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ko_KR = dateIntervalPatterns.DateIntervalPatterns_ko;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kok = {
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
    'y': 'MMM y– MMM y',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM-y – MM-y',
    '_': 'y-MM'
  },
  MONTH_DAY_ABBR: {
    'd': 'MMM d–d',
    'y': 'd MMM y – d MMM y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd-MM –dd-MM',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM y',
    'd': 'd–d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'y MMM d'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'E, d MMM – E, d MMM y',
    'd': 'E, d MMM –E, d MMM y',
    'y': 'E, d MMM y – E, d MMM y',
    '_': 'y MMM d, EEE'
  },
  DAY_ABBR: {
    'M': 'dd-MM –dd-MM',
    'd': 'd–d',
    'y': 'dd-MM-y – dd-MM-y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kok_IN = exports.DateIntervalPatterns_kok;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ks = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'Gy'
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
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd-MMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ks_IN = exports.DateIntervalPatterns_ks;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksb = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksb_TZ = exports.DateIntervalPatterns_ksb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksf = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksf_CM = exports.DateIntervalPatterns_ksf;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksh = {
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
    'y': 'MMM. y – MMM. y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'Y-MM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'd': 'dd. – dd. MM.',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'd.–d. MMMM y',
    'y': 'y MMM d – y MMM d',
    '_': 'd. MMM. y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'E y-MM-dd – E y-MM-dd',
    '_': 'EEE d. MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Mdy': 'E y-MM-dd – E y-MM-dd',
    '_': 'EEE d. MMM. y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ksh_DE = exports.DateIntervalPatterns_ksh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ku = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ku_TR = exports.DateIntervalPatterns_ku;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kw = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_kw_GB = exports.DateIntervalPatterns_kw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ky_KG = dateIntervalPatterns.DateIntervalPatterns_ky;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lag = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lag_TZ = exports.DateIntervalPatterns_lag;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lb = {
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
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'MM.y – MM.y',
    '_': 'MM.y'
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
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd.MM. – dd.MM.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM – d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y',
    'd': 'd.–d. MMM y',
    'y': 'd. MMM y – d. MMM y',
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
    'M': 'dd.MM. – dd.MM.',
    'd': 'd.–d.',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lb_LU = exports.DateIntervalPatterns_lb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lg = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lg_UG = exports.DateIntervalPatterns_lg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lkt = {
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
    'y': 'y MMM d – y MMM d',
    '_': 'MMM d, y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lkt_US = exports.DateIntervalPatterns_lkt;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ln_AO = dateIntervalPatterns.DateIntervalPatterns_ln;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ln_CD = dateIntervalPatterns.DateIntervalPatterns_ln;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ln_CF = dateIntervalPatterns.DateIntervalPatterns_ln;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ln_CG = dateIntervalPatterns.DateIntervalPatterns_ln;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lo_LA = dateIntervalPatterns.DateIntervalPatterns_lo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lrc = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lrc_IQ = exports.DateIntervalPatterns_lrc;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lrc_IR = exports.DateIntervalPatterns_lrc;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lt_LT = dateIntervalPatterns.DateIntervalPatterns_lt;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lu = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lu_CD = exports.DateIntervalPatterns_lu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_luo = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_luo_KE = exports.DateIntervalPatterns_luo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_luy = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_luy_KE = exports.DateIntervalPatterns_luy;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_lv_LV = dateIntervalPatterns.DateIntervalPatterns_lv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mas = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mas_KE = exports.DateIntervalPatterns_mas;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mas_TZ = exports.DateIntervalPatterns_mas;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mer = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mer_KE = exports.DateIntervalPatterns_mer;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mfe = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mfe_MU = exports.DateIntervalPatterns_mfe;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mg = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mg_MG = exports.DateIntervalPatterns_mg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mgh = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mgh_MZ = exports.DateIntervalPatterns_mgh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mgo = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mgo_CM = exports.DateIntervalPatterns_mgo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mi = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'y MMM–MMM',
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
    'My': 'y-MM – y-MM',
    '_': 'y-MM'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
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
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
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
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mi_NZ = exports.DateIntervalPatterns_mi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mk_MK = dateIntervalPatterns.DateIntervalPatterns_mk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ml_IN = dateIntervalPatterns.DateIntervalPatterns_ml;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mn_MN = dateIntervalPatterns.DateIntervalPatterns_mn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mr_IN = dateIntervalPatterns.DateIntervalPatterns_mr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ms_BN = dateIntervalPatterns.DateIntervalPatterns_ms;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ms_MY = dateIntervalPatterns.DateIntervalPatterns_ms;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ms_SG = dateIntervalPatterns.DateIntervalPatterns_ms;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mt_MT = dateIntervalPatterns.DateIntervalPatterns_mt;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mua = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mua_CM = exports.DateIntervalPatterns_mua;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_my_MM = dateIntervalPatterns.DateIntervalPatterns_my;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mzn = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_mzn_IR = exports.DateIntervalPatterns_mzn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_naq = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_naq_NA = exports.DateIntervalPatterns_naq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nb_NO = dateIntervalPatterns.DateIntervalPatterns_nb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nb_SJ = dateIntervalPatterns.DateIntervalPatterns_nb;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nd = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nd_ZW = exports.DateIntervalPatterns_nd;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nds = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nds_DE = exports.DateIntervalPatterns_nds;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nds_NL = exports.DateIntervalPatterns_nds;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ne_IN = dateIntervalPatterns.DateIntervalPatterns_ne;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ne_NP = dateIntervalPatterns.DateIntervalPatterns_ne;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_AW = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_BE = {
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
    'My': 'MM/y – MM/y',
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
    'Md': 'd/MM – d/MM',
    'y': 'd/MM/y – d/MM/y',
    '_': 'd/M'
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
    'M': 'd/MM – d/MM',
    'd': 'd–d',
    'y': 'd/MM/y – d/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_BQ = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_CW = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_NL = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_SR = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nl_SX = dateIntervalPatterns.DateIntervalPatterns_nl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nmg = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nmg_CM = exports.DateIntervalPatterns_nmg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nn = {
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
    'y': 'MMM y–MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y–MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
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
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd. MMMM–d. MMMM',
    'd': 'd.–d. MMMM',
    'y': 'd. MMMM y–d. MMMM y',
    '_': 'd. MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
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
    'G': 'G y MMM d, E – G y MMM d, E',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nn_NO = exports.DateIntervalPatterns_nn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nnh = {
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
    'y': 'y MMM d – y MMM d',
    '_': '\'lyɛ\'̌ʼ d \'na\' MMMM, y'
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
    '_': 'EEE , \'lyɛ\'̌ʼ d \'na\' MMM, y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nnh_CM = exports.DateIntervalPatterns_nnh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nus = {
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
    '_': 'EEE، d MMM y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nus_SS = exports.DateIntervalPatterns_nus;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nyn = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_nyn_UG = exports.DateIntervalPatterns_nyn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_om = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'dd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_om_ET = exports.DateIntervalPatterns_om;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_om_KE = exports.DateIntervalPatterns_om;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_or_IN = dateIntervalPatterns.DateIntervalPatterns_or;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_os = {
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
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM.y'
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
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'dd.MM'
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
    '_': 'd MMM, y \'аз\''
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'ccc, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'y MMM d, E – MMM d, E',
    'y': 'y MMM d, E – y MMM d, E',
    '_': 'EEE, d MMM y'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_os_GE = exports.DateIntervalPatterns_os;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_os_RU = exports.DateIntervalPatterns_os;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pa_Arab = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pa_Arab_PK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pa_Guru = dateIntervalPatterns.DateIntervalPatterns_pa;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pa_Guru_IN = dateIntervalPatterns.DateIntervalPatterns_pa;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pl_PL = dateIntervalPatterns.DateIntervalPatterns_pl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ps = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ps_AF = exports.DateIntervalPatterns_ps;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ps_PK = exports.DateIntervalPatterns_ps;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_AO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_CH = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_CV = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_GQ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_GW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_LU = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_MO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_MZ = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_ST = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_pt_TL = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_qu = {
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
    'Md': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'MM-dd'
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
    'y': 'd MMM, y – d MMM, y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d MMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_qu_BO = exports.DateIntervalPatterns_qu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_qu_EC = exports.DateIntervalPatterns_qu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_qu_PE = exports.DateIntervalPatterns_qu;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rm = {
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
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd. MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd. MMMM'
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
    '_': 'EEE d. MMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rm_CH = exports.DateIntervalPatterns_rm;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rn = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rn_BI = exports.DateIntervalPatterns_rn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ro_MD = dateIntervalPatterns.DateIntervalPatterns_ro;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ro_RO = dateIntervalPatterns.DateIntervalPatterns_ro;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rof = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rof_TZ = exports.DateIntervalPatterns_rof;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_BY = dateIntervalPatterns.DateIntervalPatterns_ru;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_KG = dateIntervalPatterns.DateIntervalPatterns_ru;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_KZ = dateIntervalPatterns.DateIntervalPatterns_ru;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_MD = dateIntervalPatterns.DateIntervalPatterns_ru;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_RU = dateIntervalPatterns.DateIntervalPatterns_ru;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ru_UA = {
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
    'y': 'LLL y – LLL y',
    '_': 'LLL y \'г\'.'
  },
  YEAR_MONTH_FULL: {
    'G': 'LLLL y \'г\'. G – LLLL y \'г\'. G',
    'M': 'LLLL – LLLL y \'г\'.',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y \'г\'.'
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
    'G': 'd MMM y \'г\'. G – d MMM y \'г\'. G',
    'M': 'd MMM – d MMM y \'г\'.',
    'd': 'd–d MMM y \'г\'.',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y \'г\'.'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'ccc, d MMM y – ccc, d MMM y',
    '_': 'ccc, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'ccc, d MMM y \'г\'. G – ccc, d MMM y \'г\'. G',
    'M': 'ccc, d MMM – ccc, d MMM y \'г\'.',
    'd': 'ccc, d – ccc, d MMM y \'г\'.',
    'y': 'ccc, d MMM y – ccc, d MMM y',
    '_': 'EEE, d MMM y \'г\'.'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rw = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rw_RW = exports.DateIntervalPatterns_rw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rwk = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_rwk_TZ = exports.DateIntervalPatterns_rwk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sah = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'y \'с\'. G'
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
    'My': 'MM.y – MM.y',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sah_RU = exports.DateIntervalPatterns_sah;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_saq = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_saq_KE = exports.DateIntervalPatterns_saq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sbp = {
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
    '_': 'MMM d y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sbp_TZ = exports.DateIntervalPatterns_sbp;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sd = {
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
    'M': 'y MMM–MMM',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'MMMM y G – MMMM y G',
    'M': 'y MMMM–MMMM',
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
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'MM-dd'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'MMM d, y G – MMM d, y G',
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
    'G': 'E, MMM d, y G – E, MMM d, y G',
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sd_PK = exports.DateIntervalPatterns_sd;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_se = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_se_FI = {
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
    'M': 'M.y–M.y',
    'y': 'M.y – M.y',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM–d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM–d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd.M.–d.M.',
    'y': 'd.M.y – d.M.y',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM–d MMMM',
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
    'Md': 'E d.MMM–E d.MMM',
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
    'M': 'd.M.–d.M.',
    'd': 'd–d',
    'y': 'd.M.y – d.M.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_se_NO = exports.DateIntervalPatterns_se;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_se_SE = exports.DateIntervalPatterns_se;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_seh = {
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
    '_': 'MMM \'de\' y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y MMMM–MMMM',
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM \'de\' y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd \'de\' MMM \'de\' y'
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
    '_': 'EEE, d \'de\' MMM \'de\' y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_seh_MZ = exports.DateIntervalPatterns_seh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ses = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ses_ML = exports.DateIntervalPatterns_ses;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sg = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sg_CF = exports.DateIntervalPatterns_sg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_shi = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_shi_Latn = exports.DateIntervalPatterns_shi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_shi_Latn_MA = exports.DateIntervalPatterns_shi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_shi_Tfng = exports.DateIntervalPatterns_shi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_shi_Tfng_MA = exports.DateIntervalPatterns_shi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_si_LK = dateIntervalPatterns.DateIntervalPatterns_si;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sk_SK = dateIntervalPatterns.DateIntervalPatterns_sk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sl_SI = dateIntervalPatterns.DateIntervalPatterns_sl;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_smn = {
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
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLL y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LLLL y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'LLL–LLLL y',
    'y': 'LLLL y – LLLL y',
    '_': 'LL.y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d. – MMM d.',
    'd': 'MMM d.–d.',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMM d.'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d. – MMMM d.',
    'd': 'MMMM d.–d.',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMMM dd.'
  },
  MONTH_DAY_SHORT: {
    'd': 'd.–d.M.',
    'y': 'd.M.y–d.M.y',
    '_': 'd.M.'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d. – MMMM d.',
    'd': 'MMMM d.–d.',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMMM d.'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'MMMM d. – MMMM d. y',
    'd': 'MMMM d.–d. y',
    'y': 'MMMM d. y – MMMM d. y',
    '_': 'MMM d. y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'MMMM E d. – MMMM E d.',
    'd': 'MMMM E d. – E d.',
    'y': 'MMMM E d. y – MMMM E d. y',
    '_': 'EEE, MMM d.'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'M': 'MMMM E d. – MMMM E d. y',
    'd': 'MMMM E d. – E d. y',
    'y': 'MMMM E d. y – MMMM E d. y',
    '_': 'ccc, MMM d. y'
  },
  DAY_ABBR: {
    'M': 'd.M.–d.M.',
    'd': 'd.–d.',
    'y': 'd.M.y–d.M.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_smn_FI = exports.DateIntervalPatterns_smn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sn = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sn_ZW = exports.DateIntervalPatterns_sn;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_so = {
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
    'M': 'MMMM – MMMM y',
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
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'dd MMMM – dd MMMM',
    'd': 'dd–dd MMMM',
    'y': 'dd MMMM y – dd MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'MMM d, y G – MMM d, y G',
    'M': 'dd MMM – dd MMM y',
    'd': 'dd–dd MMM y',
    'y': 'dd MMM y – dd MMM y',
    '_': 'MMM d, y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'M': 'E, dd MMM – E, dd MMM',
    'd': 'E, MMM d – E, MMM d',
    'y': 'E, MMM dd, y – E, MMM dd, y',
    '_': 'EEE, MMM d'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'E, MMM d, y G – E, MMM d, y G',
    'Md': 'E, MMM dd – E, MMM dd, y',
    'y': 'E, MMM dd, y – E, MMM dd, y',
    '_': 'EEE, MMM d, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_so_DJ = exports.DateIntervalPatterns_so;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_so_ET = exports.DateIntervalPatterns_so;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_so_KE = exports.DateIntervalPatterns_so;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_so_SO = exports.DateIntervalPatterns_so;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sq_AL = dateIntervalPatterns.DateIntervalPatterns_sq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sq_MK = dateIntervalPatterns.DateIntervalPatterns_sq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sq_XK = dateIntervalPatterns.DateIntervalPatterns_sq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Cyrl = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Cyrl_BA = {
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
    'My': 'y-MM – y-MM',
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
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
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
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Cyrl_ME = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Cyrl_RS = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Cyrl_XK = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Latn_BA = {
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
    'My': 'y-MM – y-MM',
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
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
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
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Latn_ME = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Latn_RS = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sr_Latn_XK = dateIntervalPatterns.DateIntervalPatterns_sr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sv_AX = dateIntervalPatterns.DateIntervalPatterns_sv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sv_FI = dateIntervalPatterns.DateIntervalPatterns_sv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sv_SE = dateIntervalPatterns.DateIntervalPatterns_sv;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sw_CD = dateIntervalPatterns.DateIntervalPatterns_sw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sw_KE = dateIntervalPatterns.DateIntervalPatterns_sw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sw_TZ = dateIntervalPatterns.DateIntervalPatterns_sw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_sw_UG = dateIntervalPatterns.DateIntervalPatterns_sw;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ta_IN = dateIntervalPatterns.DateIntervalPatterns_ta;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ta_LK = dateIntervalPatterns.DateIntervalPatterns_ta;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ta_MY = dateIntervalPatterns.DateIntervalPatterns_ta;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ta_SG = dateIntervalPatterns.DateIntervalPatterns_ta;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_te_IN = dateIntervalPatterns.DateIntervalPatterns_te;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_teo = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_teo_KE = exports.DateIntervalPatterns_teo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_teo_UG = exports.DateIntervalPatterns_teo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tg = {
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
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y MMM d – MMM d',
    'd': 'y MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM, y'
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
    '_': 'EEE, d MMM, y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tg_TJ = exports.DateIntervalPatterns_tg;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_th_TH = dateIntervalPatterns.DateIntervalPatterns_th;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ti = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'dd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ti_ER = exports.DateIntervalPatterns_ti;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ti_ET = exports.DateIntervalPatterns_ti;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tk = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y'
  },
  YEAR_MONTH_ABBR: {
    'G': 'G MMM y – G MMM y',
    'M': 'MMM–MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G MMMM y – G MMMM y',
    'M': 'MMMM–MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG M/y – GGGGG M/y',
    'My': 'MM.y – MM.y',
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
    'Md': 'dd.MM – dd.MM',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'd MMMM – d MMMM',
    'd': 'd – d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d MMM y – G d MMM y',
    'M': 'd MMM – d MMM y',
    'd': 'd – d MMM y',
    'y': 'd MMM y – d MMM y',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'd MMM E – d MMM E',
    'y': 'd MMM y E – d MMM y E',
    '_': 'd MMM EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G d MMM y, E – G d MMM y, E',
    'Mdy': 'd MMM y E – d MMM y E',
    '_': 'd MMM y EEE'
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tk_TM = exports.DateIntervalPatterns_tk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_to = {
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
    'My': 'M/y – M/y',
    '_': 'MM-y'
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
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd – d MMMM',
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
    'M': 'd/M – d/M',
    'y': 'd/M/y – d/M/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_to_TO = exports.DateIntervalPatterns_to;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tr_CY = dateIntervalPatterns.DateIntervalPatterns_tr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tr_TR = dateIntervalPatterns.DateIntervalPatterns_tr;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tt = {
  YEAR_FULL: {
    'G': 'G y – G y',
    'y': 'y–y',
    '_': 'y'
  },
  YEAR_FULL_WITH_ERA: {
    'G': 'G y – G y',
    'y': 'G y–y',
    '_': 'G y \'ел\''
  },
  YEAR_MONTH_ABBR: {
    'G': 'G y MMM – G y MMM',
    'M': 'MMM – MMM, y \'ел\'',
    'y': 'MMM, y \'ел\' - MMM, y \'ел\'',
    '_': 'MMM, y \'ел\''
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM, y \'ел\'',
    '_': 'MMMM, y \'ел\''
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM.y'
  },
  MONTH_DAY_ABBR: {
    'd': 'd–d MMM',
    'y': 'd MMM, y \'ел\' – d MMM, y \'ел\'',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM, y \'ел\' – d MMMM, y \'ел\'',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'dd.MM'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'd–d MMMM',
    'y': 'd MMMM, y \'ел\' – d MMMM, y \'ел\'',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd MMM – d MMM, y \'ел\'',
    'd': 'd–d MMM, y \'ел\'',
    '_': 'd MMM, y \'ел\''
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d MMM – E, d MMM',
    'y': 'E, d MMM, y \'ел\' – E, d MMM, y \'ел\'',
    '_': 'EEE, d MMM'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E, d MMM – E, d MMM, y \'ел\'',
    'y': 'E, d MMM, y \'ел\' – E, d MMM, y \'ел\'',
    '_': 'EEE, d MMM, y \'ел\''
  },
  DAY_ABBR: {
    'M': 'dd.MM – dd.MM',
    'd': 'd–d',
    'y': 'dd.MM.y – dd.MM.y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tt_RU = exports.DateIntervalPatterns_tt;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_twq = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_twq_NE = exports.DateIntervalPatterns_twq;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tzm = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_tzm_MA = exports.DateIntervalPatterns_tzm;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ug = {
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
    'y': 'MMM y – MMM y',
    '_': 'y MMM'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'M/y – M/y',
    '_': 'MM-y'
  },
  MONTH_DAY_ABBR: {
    'M': 'MMM d – MMM d',
    'd': 'MMM d – d',
    'y': 'MMM d، y – MMM d، y',
    '_': 'd-MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d، y – MMMM d، y',
    '_': 'dd-MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd-M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d – d',
    'y': 'MMMM d، y – MMMM d، y',
    '_': 'd-MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'MMM d – MMM d، y',
    'd': 'MMM d – d، y',
    'y': 'MMM d، y – MMM d، y',
    '_': 'y d-MMM'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E، MMM d – E، MMM d',
    'y': 'E، MMM d، y – E، MMM d، y',
    '_': 'd-MMM، EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'E، MMM d – E، MMM d، y',
    'y': 'E، MMM d، y – E، MMM d، y',
    '_': 'y d-MMM، EEE'
  },
  DAY_ABBR: {
    'M': 'M/d – M/d',
    'y': 'M/d/y – M/d/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ug_CN = exports.DateIntervalPatterns_ug;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uk_UA = dateIntervalPatterns.DateIntervalPatterns_uk;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ur_IN = dateIntervalPatterns.DateIntervalPatterns_ur;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_ur_PK = dateIntervalPatterns.DateIntervalPatterns_ur;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Arab = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Arab_AF = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Cyrl = {
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
    'M': 'MMM – MMM, y',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM, y',
    '_': 'MMMM, y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
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
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
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
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d-MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Cyrl_UZ = {
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
    'M': 'MMM – MMM, y',
    '_': 'MMM, y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM, y',
    '_': 'MMMM, y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
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
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'dd/MM'
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
    'Md': 'E, d MMM – E, d MMM, y',
    'y': 'E, d MMM, y – E, d MMM, y',
    '_': 'EEE, d-MMM, y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Latn = dateIntervalPatterns.DateIntervalPatterns_uz;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_uz_Latn_UZ = dateIntervalPatterns.DateIntervalPatterns_uz;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vai = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vai_Latn = {
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
    '_': 'MMM d y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vai_Latn_LR = {
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
    '_': 'MMM d y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vai_Vaii = exports.DateIntervalPatterns_vai;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vai_Vaii_LR = exports.DateIntervalPatterns_vai;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vi_VN = dateIntervalPatterns.DateIntervalPatterns_vi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vun = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_vun_TZ = exports.DateIntervalPatterns_vun;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_wae = {
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
    'M': 'MMM – MMM y',
    'y': 'MMM y – MMM y',
    '_': 'MMM y'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'MMMM – MMMM y',
    'y': 'MMMM y – MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'y-MM'
  },
  MONTH_DAY_ABBR: {
    'Md': 'd. – d. MMM',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM'
  },
  MONTH_DAY_FULL: {
    'Md': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'd. MMM – d. MMM',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd. MMM'
  },
  MONTH_DAY_MEDIUM: {
    'Md': 'd. – d. MMMM',
    'y': 'd. MMMM y – d. MMMM y',
    '_': 'MMMM d'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'd. MMM – d. MMM y',
    'd': 'd. – d. MMM y',
    'y': 'd. MMM y – d. MMM y',
    '_': 'd. MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'E, d. MMM – E, d. MMM',
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
    'M': 'd. MMM – d. MMM',
    'd': 'd – d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_wae_CH = exports.DateIntervalPatterns_wae;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_wo = {
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
    'M': 'MMM d – MMM d',
    'd': 'MMM d–d',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM'
  },
  MONTH_DAY_FULL: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'dd-MM'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_wo_SN = exports.DateIntervalPatterns_wo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_xh = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_xh_ZA = exports.DateIntervalPatterns_xh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_xog = {
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
    'y': 'y MMMM – y MMMM',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y-MM – y-MM',
    '_': 'MM/y'
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
    '_': 'd MMM y'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_xog_UG = exports.DateIntervalPatterns_xog;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yav = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yav_CM = exports.DateIntervalPatterns_yav;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yi = {
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
    'y': 'MMMM y–MMMM y',
    '_': 'y MMMM'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'MM/y'
  },
  MONTH_DAY_ABBR: {
    'M': 'd MMM – d MMM',
    'd': 'd–d MMM',
    'y': 'd MMM y – d MMM y',
    '_': 'MMM d'
  },
  MONTH_DAY_FULL: {
    'M': 'd MMMM – d MMMM',
    'd': 'd–d MMMM',
    'y': 'd MMMM y – d MMMM y',
    '_': 'MMMM dd'
  },
  MONTH_DAY_SHORT: {
    'Md': 'dd/MM – dd/MM',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'MM-dd'
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
    'y': 'd MMM y – d MMM y',
    '_': 'dטן MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'EEEE d MMM – EEEE d MMM',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'MMM d, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'EEEE d MMM – EEEE d MMM y',
    'y': 'EEEE d MMM y – EEEE d MMM y',
    '_': 'EEE, dטן MMM y'
  },
  DAY_ABBR: {
    'M': 'dd/MM – dd/MM',
    'd': 'd–d',
    'y': 'dd/MM/y – dd/MM/y',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yi_001 = exports.DateIntervalPatterns_yi;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yo = {
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
    'M': 'MMMM–MMMM y',
    'y': 'MMMM – y MMMM y',
    '_': 'MMMM y'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'M': 'MM-y – MM-y',
    'y': 'y-MM – y-MM',
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
    '_': 'dd MMMM'
  },
  MONTH_DAY_SHORT: {
    'Md': 'MM-dd – MM-dd',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd/M'
  },
  MONTH_DAY_MEDIUM: {
    'M': 'MMMM d – MMMM d',
    'd': 'MMMM d–d',
    'y': 'y MMMM d – y MMMM d',
    '_': 'd MMMM'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'MMM d – MMM d y',
    'd': 'MMM d–d y',
    'y': 'y MMM d – y MMM d',
    '_': 'd MMM y'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'MMM d, E – MMM d, E',
    'y': 'y MMM d y, E – MMM d, E y',
    '_': 'd MMM, EEE'
  },
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d, E – G y MMM d, E',
    'Md': 'MMM d, E – MMM d, E y',
    'y': 'y MMM d y, E – MMM d, E y',
    '_': 'EEE, d MMM , y'
  },
  DAY_ABBR: {
    'M': 'MM-dd – MM-dd',
    'd': 'd–d',
    'y': 'y-MM-dd – y-MM-dd',
    '_': 'd'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yo_BJ = exports.DateIntervalPatterns_yo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yo_NG = exports.DateIntervalPatterns_yo;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yue = {
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
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y年M月至M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    'My': 'y/M至y/M',
    '_': 'y/MM'
  },
  MONTH_DAY_ABBR: {
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
    'y': 'y/M/d至y/M/d',
    '_': 'M/d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
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
    'M': 'y年M月d日E至M月d日E',
    'd': 'y年M月d日E至d日E',
    'y': 'y年M月d日E至y年M月d日E',
    '_': 'y年M月d日 EEE'
  },
  DAY_ABBR: {
    'M': 'M/d至M/d',
    'y': 'y/M/d至y/M/d',
    '_': 'd日'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yue_Hans = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yue_Hans_CN = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yue_Hant = exports.DateIntervalPatterns_yue;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_yue_Hant_HK = exports.DateIntervalPatterns_yue;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zgh = {
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
    '_': 'y MMM d'
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zgh_MA = exports.DateIntervalPatterns_zgh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hans = dateIntervalPatterns.DateIntervalPatterns_zh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hans_CN = dateIntervalPatterns.DateIntervalPatterns_zh;

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hans_HK = {
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
    'My': 'y年M月至y年M月',
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
    '_': 'M月d日'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M/d – M/d',
    'y': 'd/M/y至d/M/y',
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
    'M': 'M/d – M/d',
    'd': 'd–d日',
    'y': 'd/M/y至d/M/y',
    '_': 'd日'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hans_MO = {
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
    'My': 'y年M月至y年M月',
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
    '_': 'M月d日'
  },
  MONTH_DAY_SHORT: {
    'Md': 'M-d至M-d',
    'y': 'd/M/y至d/M/y',
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
    'Md': 'M月d日E至M月d日E',
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
    'M': 'M-d至M-d',
    'd': 'd日至d日',
    'y': 'd/M/y至d/M/y',
    '_': 'd日'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hans_SG = {
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
    '_': 'y年M月'
  },
  YEAR_MONTH_FULL: {
    'G': 'G y MMMM – G y MMMM',
    'M': 'y年M月至M月',
    '_': 'y年M月'
  },
  YEAR_MONTH_SHORT: {
    'G': 'GGGGG y-MM – GGGGG y-MM',
    '_': 'y年M月'
  },
  MONTH_DAY_ABBR: {
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_FULL: {
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_SHORT: {
    'y': 'd/M/y至d/M/y',
    '_': 'M-d'
  },
  MONTH_DAY_MEDIUM: {
    'd': 'M月d日至d日',
    'y': 'y年M月d日至y年M月d日',
    '_': 'M月d日'
  },
  MONTH_DAY_YEAR_MEDIUM: {
    'G': 'G y MMM d – G y MMM d',
    'M': 'y年M月d日至M月d日',
    'd': 'y年M月d日至d日',
    '_': 'y年M月d日'
  },
  WEEKDAY_MONTH_DAY_MEDIUM: {
    'Md': 'M月d日E至M月d日E',
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
    'M': 'M-d至M-d',
    'y': 'd/M/y至d/M/y',
    '_': 'd日'
  }
};

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hant = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hant_HK = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hant_MO = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zh_Hant_TW = {
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

/** @const {!dateIntervalPatterns.DateIntervalPatterns} */
exports.DateIntervalPatterns_zu_ZA = dateIntervalPatterns.DateIntervalPatterns_zu;

switch (goog.LOCALE) {
  case 'af_NA':
  case 'af-NA':
    defaultPatterns = exports.DateIntervalPatterns_af_NA;
    break;
  case 'af_ZA':
  case 'af-ZA':
    defaultPatterns = exports.DateIntervalPatterns_af_ZA;
    break;
  case 'agq':
    defaultPatterns = exports.DateIntervalPatterns_agq;
    break;
  case 'agq_CM':
  case 'agq-CM':
    defaultPatterns = exports.DateIntervalPatterns_agq_CM;
    break;
  case 'ak':
    defaultPatterns = exports.DateIntervalPatterns_ak;
    break;
  case 'ak_GH':
  case 'ak-GH':
    defaultPatterns = exports.DateIntervalPatterns_ak_GH;
    break;
  case 'am_ET':
  case 'am-ET':
    defaultPatterns = exports.DateIntervalPatterns_am_ET;
    break;
  case 'ar_001':
  case 'ar-001':
    defaultPatterns = exports.DateIntervalPatterns_ar_001;
    break;
  case 'ar_AE':
  case 'ar-AE':
    defaultPatterns = exports.DateIntervalPatterns_ar_AE;
    break;
  case 'ar_BH':
  case 'ar-BH':
    defaultPatterns = exports.DateIntervalPatterns_ar_BH;
    break;
  case 'ar_DJ':
  case 'ar-DJ':
    defaultPatterns = exports.DateIntervalPatterns_ar_DJ;
    break;
  case 'ar_EH':
  case 'ar-EH':
    defaultPatterns = exports.DateIntervalPatterns_ar_EH;
    break;
  case 'ar_ER':
  case 'ar-ER':
    defaultPatterns = exports.DateIntervalPatterns_ar_ER;
    break;
  case 'ar_IL':
  case 'ar-IL':
    defaultPatterns = exports.DateIntervalPatterns_ar_IL;
    break;
  case 'ar_IQ':
  case 'ar-IQ':
    defaultPatterns = exports.DateIntervalPatterns_ar_IQ;
    break;
  case 'ar_JO':
  case 'ar-JO':
    defaultPatterns = exports.DateIntervalPatterns_ar_JO;
    break;
  case 'ar_KM':
  case 'ar-KM':
    defaultPatterns = exports.DateIntervalPatterns_ar_KM;
    break;
  case 'ar_KW':
  case 'ar-KW':
    defaultPatterns = exports.DateIntervalPatterns_ar_KW;
    break;
  case 'ar_LB':
  case 'ar-LB':
    defaultPatterns = exports.DateIntervalPatterns_ar_LB;
    break;
  case 'ar_LY':
  case 'ar-LY':
    defaultPatterns = exports.DateIntervalPatterns_ar_LY;
    break;
  case 'ar_MA':
  case 'ar-MA':
    defaultPatterns = exports.DateIntervalPatterns_ar_MA;
    break;
  case 'ar_MR':
  case 'ar-MR':
    defaultPatterns = exports.DateIntervalPatterns_ar_MR;
    break;
  case 'ar_OM':
  case 'ar-OM':
    defaultPatterns = exports.DateIntervalPatterns_ar_OM;
    break;
  case 'ar_PS':
  case 'ar-PS':
    defaultPatterns = exports.DateIntervalPatterns_ar_PS;
    break;
  case 'ar_QA':
  case 'ar-QA':
    defaultPatterns = exports.DateIntervalPatterns_ar_QA;
    break;
  case 'ar_SA':
  case 'ar-SA':
    defaultPatterns = exports.DateIntervalPatterns_ar_SA;
    break;
  case 'ar_SD':
  case 'ar-SD':
    defaultPatterns = exports.DateIntervalPatterns_ar_SD;
    break;
  case 'ar_SO':
  case 'ar-SO':
    defaultPatterns = exports.DateIntervalPatterns_ar_SO;
    break;
  case 'ar_SS':
  case 'ar-SS':
    defaultPatterns = exports.DateIntervalPatterns_ar_SS;
    break;
  case 'ar_SY':
  case 'ar-SY':
    defaultPatterns = exports.DateIntervalPatterns_ar_SY;
    break;
  case 'ar_TD':
  case 'ar-TD':
    defaultPatterns = exports.DateIntervalPatterns_ar_TD;
    break;
  case 'ar_TN':
  case 'ar-TN':
    defaultPatterns = exports.DateIntervalPatterns_ar_TN;
    break;
  case 'ar_XB':
  case 'ar-XB':
    defaultPatterns = exports.DateIntervalPatterns_ar_XB;
    break;
  case 'ar_YE':
  case 'ar-YE':
    defaultPatterns = exports.DateIntervalPatterns_ar_YE;
    break;
  case 'as':
    defaultPatterns = exports.DateIntervalPatterns_as;
    break;
  case 'as_IN':
  case 'as-IN':
    defaultPatterns = exports.DateIntervalPatterns_as_IN;
    break;
  case 'asa':
    defaultPatterns = exports.DateIntervalPatterns_asa;
    break;
  case 'asa_TZ':
  case 'asa-TZ':
    defaultPatterns = exports.DateIntervalPatterns_asa_TZ;
    break;
  case 'ast':
    defaultPatterns = exports.DateIntervalPatterns_ast;
    break;
  case 'ast_ES':
  case 'ast-ES':
    defaultPatterns = exports.DateIntervalPatterns_ast_ES;
    break;
  case 'az_Cyrl':
  case 'az-Cyrl':
    defaultPatterns = exports.DateIntervalPatterns_az_Cyrl;
    break;
  case 'az_Cyrl_AZ':
  case 'az-Cyrl-AZ':
    defaultPatterns = exports.DateIntervalPatterns_az_Cyrl_AZ;
    break;
  case 'az_Latn':
  case 'az-Latn':
    defaultPatterns = exports.DateIntervalPatterns_az_Latn;
    break;
  case 'az_Latn_AZ':
  case 'az-Latn-AZ':
    defaultPatterns = exports.DateIntervalPatterns_az_Latn_AZ;
    break;
  case 'bas':
    defaultPatterns = exports.DateIntervalPatterns_bas;
    break;
  case 'bas_CM':
  case 'bas-CM':
    defaultPatterns = exports.DateIntervalPatterns_bas_CM;
    break;
  case 'be_BY':
  case 'be-BY':
    defaultPatterns = exports.DateIntervalPatterns_be_BY;
    break;
  case 'bem':
    defaultPatterns = exports.DateIntervalPatterns_bem;
    break;
  case 'bem_ZM':
  case 'bem-ZM':
    defaultPatterns = exports.DateIntervalPatterns_bem_ZM;
    break;
  case 'bez':
    defaultPatterns = exports.DateIntervalPatterns_bez;
    break;
  case 'bez_TZ':
  case 'bez-TZ':
    defaultPatterns = exports.DateIntervalPatterns_bez_TZ;
    break;
  case 'bg_BG':
  case 'bg-BG':
    defaultPatterns = exports.DateIntervalPatterns_bg_BG;
    break;
  case 'bm':
    defaultPatterns = exports.DateIntervalPatterns_bm;
    break;
  case 'bm_ML':
  case 'bm-ML':
    defaultPatterns = exports.DateIntervalPatterns_bm_ML;
    break;
  case 'bn_BD':
  case 'bn-BD':
    defaultPatterns = exports.DateIntervalPatterns_bn_BD;
    break;
  case 'bn_IN':
  case 'bn-IN':
    defaultPatterns = exports.DateIntervalPatterns_bn_IN;
    break;
  case 'bo':
    defaultPatterns = exports.DateIntervalPatterns_bo;
    break;
  case 'bo_CN':
  case 'bo-CN':
    defaultPatterns = exports.DateIntervalPatterns_bo_CN;
    break;
  case 'bo_IN':
  case 'bo-IN':
    defaultPatterns = exports.DateIntervalPatterns_bo_IN;
    break;
  case 'br_FR':
  case 'br-FR':
    defaultPatterns = exports.DateIntervalPatterns_br_FR;
    break;
  case 'brx':
    defaultPatterns = exports.DateIntervalPatterns_brx;
    break;
  case 'brx_IN':
  case 'brx-IN':
    defaultPatterns = exports.DateIntervalPatterns_brx_IN;
    break;
  case 'bs_Cyrl':
  case 'bs-Cyrl':
    defaultPatterns = exports.DateIntervalPatterns_bs_Cyrl;
    break;
  case 'bs_Cyrl_BA':
  case 'bs-Cyrl-BA':
    defaultPatterns = exports.DateIntervalPatterns_bs_Cyrl_BA;
    break;
  case 'bs_Latn':
  case 'bs-Latn':
    defaultPatterns = exports.DateIntervalPatterns_bs_Latn;
    break;
  case 'bs_Latn_BA':
  case 'bs-Latn-BA':
    defaultPatterns = exports.DateIntervalPatterns_bs_Latn_BA;
    break;
  case 'ca_AD':
  case 'ca-AD':
    defaultPatterns = exports.DateIntervalPatterns_ca_AD;
    break;
  case 'ca_ES':
  case 'ca-ES':
    defaultPatterns = exports.DateIntervalPatterns_ca_ES;
    break;
  case 'ca_FR':
  case 'ca-FR':
    defaultPatterns = exports.DateIntervalPatterns_ca_FR;
    break;
  case 'ca_IT':
  case 'ca-IT':
    defaultPatterns = exports.DateIntervalPatterns_ca_IT;
    break;
  case 'ccp':
    defaultPatterns = exports.DateIntervalPatterns_ccp;
    break;
  case 'ccp_BD':
  case 'ccp-BD':
    defaultPatterns = exports.DateIntervalPatterns_ccp_BD;
    break;
  case 'ccp_IN':
  case 'ccp-IN':
    defaultPatterns = exports.DateIntervalPatterns_ccp_IN;
    break;
  case 'ce':
    defaultPatterns = exports.DateIntervalPatterns_ce;
    break;
  case 'ce_RU':
  case 'ce-RU':
    defaultPatterns = exports.DateIntervalPatterns_ce_RU;
    break;
  case 'ceb':
    defaultPatterns = exports.DateIntervalPatterns_ceb;
    break;
  case 'ceb_PH':
  case 'ceb-PH':
    defaultPatterns = exports.DateIntervalPatterns_ceb_PH;
    break;
  case 'cgg':
    defaultPatterns = exports.DateIntervalPatterns_cgg;
    break;
  case 'cgg_UG':
  case 'cgg-UG':
    defaultPatterns = exports.DateIntervalPatterns_cgg_UG;
    break;
  case 'chr_US':
  case 'chr-US':
    defaultPatterns = exports.DateIntervalPatterns_chr_US;
    break;
  case 'ckb':
    defaultPatterns = exports.DateIntervalPatterns_ckb;
    break;
  case 'ckb_IQ':
  case 'ckb-IQ':
    defaultPatterns = exports.DateIntervalPatterns_ckb_IQ;
    break;
  case 'ckb_IR':
  case 'ckb-IR':
    defaultPatterns = exports.DateIntervalPatterns_ckb_IR;
    break;
  case 'cs_CZ':
  case 'cs-CZ':
    defaultPatterns = exports.DateIntervalPatterns_cs_CZ;
    break;
  case 'cy_GB':
  case 'cy-GB':
    defaultPatterns = exports.DateIntervalPatterns_cy_GB;
    break;
  case 'da_DK':
  case 'da-DK':
    defaultPatterns = exports.DateIntervalPatterns_da_DK;
    break;
  case 'da_GL':
  case 'da-GL':
    defaultPatterns = exports.DateIntervalPatterns_da_GL;
    break;
  case 'dav':
    defaultPatterns = exports.DateIntervalPatterns_dav;
    break;
  case 'dav_KE':
  case 'dav-KE':
    defaultPatterns = exports.DateIntervalPatterns_dav_KE;
    break;
  case 'de_BE':
  case 'de-BE':
    defaultPatterns = exports.DateIntervalPatterns_de_BE;
    break;
  case 'de_DE':
  case 'de-DE':
    defaultPatterns = exports.DateIntervalPatterns_de_DE;
    break;
  case 'de_IT':
  case 'de-IT':
    defaultPatterns = exports.DateIntervalPatterns_de_IT;
    break;
  case 'de_LI':
  case 'de-LI':
    defaultPatterns = exports.DateIntervalPatterns_de_LI;
    break;
  case 'de_LU':
  case 'de-LU':
    defaultPatterns = exports.DateIntervalPatterns_de_LU;
    break;
  case 'dje':
    defaultPatterns = exports.DateIntervalPatterns_dje;
    break;
  case 'dje_NE':
  case 'dje-NE':
    defaultPatterns = exports.DateIntervalPatterns_dje_NE;
    break;
  case 'dsb':
    defaultPatterns = exports.DateIntervalPatterns_dsb;
    break;
  case 'dsb_DE':
  case 'dsb-DE':
    defaultPatterns = exports.DateIntervalPatterns_dsb_DE;
    break;
  case 'dua':
    defaultPatterns = exports.DateIntervalPatterns_dua;
    break;
  case 'dua_CM':
  case 'dua-CM':
    defaultPatterns = exports.DateIntervalPatterns_dua_CM;
    break;
  case 'dyo':
    defaultPatterns = exports.DateIntervalPatterns_dyo;
    break;
  case 'dyo_SN':
  case 'dyo-SN':
    defaultPatterns = exports.DateIntervalPatterns_dyo_SN;
    break;
  case 'dz':
    defaultPatterns = exports.DateIntervalPatterns_dz;
    break;
  case 'dz_BT':
  case 'dz-BT':
    defaultPatterns = exports.DateIntervalPatterns_dz_BT;
    break;
  case 'ebu':
    defaultPatterns = exports.DateIntervalPatterns_ebu;
    break;
  case 'ebu_KE':
  case 'ebu-KE':
    defaultPatterns = exports.DateIntervalPatterns_ebu_KE;
    break;
  case 'ee':
    defaultPatterns = exports.DateIntervalPatterns_ee;
    break;
  case 'ee_GH':
  case 'ee-GH':
    defaultPatterns = exports.DateIntervalPatterns_ee_GH;
    break;
  case 'ee_TG':
  case 'ee-TG':
    defaultPatterns = exports.DateIntervalPatterns_ee_TG;
    break;
  case 'el_CY':
  case 'el-CY':
    defaultPatterns = exports.DateIntervalPatterns_el_CY;
    break;
  case 'el_GR':
  case 'el-GR':
    defaultPatterns = exports.DateIntervalPatterns_el_GR;
    break;
  case 'en_001':
  case 'en-001':
    defaultPatterns = exports.DateIntervalPatterns_en_001;
    break;
  case 'en_150':
  case 'en-150':
    defaultPatterns = exports.DateIntervalPatterns_en_150;
    break;
  case 'en_AE':
  case 'en-AE':
    defaultPatterns = exports.DateIntervalPatterns_en_AE;
    break;
  case 'en_AG':
  case 'en-AG':
    defaultPatterns = exports.DateIntervalPatterns_en_AG;
    break;
  case 'en_AI':
  case 'en-AI':
    defaultPatterns = exports.DateIntervalPatterns_en_AI;
    break;
  case 'en_AS':
  case 'en-AS':
    defaultPatterns = exports.DateIntervalPatterns_en_AS;
    break;
  case 'en_AT':
  case 'en-AT':
    defaultPatterns = exports.DateIntervalPatterns_en_AT;
    break;
  case 'en_BB':
  case 'en-BB':
    defaultPatterns = exports.DateIntervalPatterns_en_BB;
    break;
  case 'en_BE':
  case 'en-BE':
    defaultPatterns = exports.DateIntervalPatterns_en_BE;
    break;
  case 'en_BI':
  case 'en-BI':
    defaultPatterns = exports.DateIntervalPatterns_en_BI;
    break;
  case 'en_BM':
  case 'en-BM':
    defaultPatterns = exports.DateIntervalPatterns_en_BM;
    break;
  case 'en_BS':
  case 'en-BS':
    defaultPatterns = exports.DateIntervalPatterns_en_BS;
    break;
  case 'en_BW':
  case 'en-BW':
    defaultPatterns = exports.DateIntervalPatterns_en_BW;
    break;
  case 'en_BZ':
  case 'en-BZ':
    defaultPatterns = exports.DateIntervalPatterns_en_BZ;
    break;
  case 'en_CC':
  case 'en-CC':
    defaultPatterns = exports.DateIntervalPatterns_en_CC;
    break;
  case 'en_CH':
  case 'en-CH':
    defaultPatterns = exports.DateIntervalPatterns_en_CH;
    break;
  case 'en_CK':
  case 'en-CK':
    defaultPatterns = exports.DateIntervalPatterns_en_CK;
    break;
  case 'en_CM':
  case 'en-CM':
    defaultPatterns = exports.DateIntervalPatterns_en_CM;
    break;
  case 'en_CX':
  case 'en-CX':
    defaultPatterns = exports.DateIntervalPatterns_en_CX;
    break;
  case 'en_CY':
  case 'en-CY':
    defaultPatterns = exports.DateIntervalPatterns_en_CY;
    break;
  case 'en_DE':
  case 'en-DE':
    defaultPatterns = exports.DateIntervalPatterns_en_DE;
    break;
  case 'en_DG':
  case 'en-DG':
    defaultPatterns = exports.DateIntervalPatterns_en_DG;
    break;
  case 'en_DK':
  case 'en-DK':
    defaultPatterns = exports.DateIntervalPatterns_en_DK;
    break;
  case 'en_DM':
  case 'en-DM':
    defaultPatterns = exports.DateIntervalPatterns_en_DM;
    break;
  case 'en_ER':
  case 'en-ER':
    defaultPatterns = exports.DateIntervalPatterns_en_ER;
    break;
  case 'en_FI':
  case 'en-FI':
    defaultPatterns = exports.DateIntervalPatterns_en_FI;
    break;
  case 'en_FJ':
  case 'en-FJ':
    defaultPatterns = exports.DateIntervalPatterns_en_FJ;
    break;
  case 'en_FK':
  case 'en-FK':
    defaultPatterns = exports.DateIntervalPatterns_en_FK;
    break;
  case 'en_FM':
  case 'en-FM':
    defaultPatterns = exports.DateIntervalPatterns_en_FM;
    break;
  case 'en_GD':
  case 'en-GD':
    defaultPatterns = exports.DateIntervalPatterns_en_GD;
    break;
  case 'en_GG':
  case 'en-GG':
    defaultPatterns = exports.DateIntervalPatterns_en_GG;
    break;
  case 'en_GH':
  case 'en-GH':
    defaultPatterns = exports.DateIntervalPatterns_en_GH;
    break;
  case 'en_GI':
  case 'en-GI':
    defaultPatterns = exports.DateIntervalPatterns_en_GI;
    break;
  case 'en_GM':
  case 'en-GM':
    defaultPatterns = exports.DateIntervalPatterns_en_GM;
    break;
  case 'en_GU':
  case 'en-GU':
    defaultPatterns = exports.DateIntervalPatterns_en_GU;
    break;
  case 'en_GY':
  case 'en-GY':
    defaultPatterns = exports.DateIntervalPatterns_en_GY;
    break;
  case 'en_HK':
  case 'en-HK':
    defaultPatterns = exports.DateIntervalPatterns_en_HK;
    break;
  case 'en_IL':
  case 'en-IL':
    defaultPatterns = exports.DateIntervalPatterns_en_IL;
    break;
  case 'en_IM':
  case 'en-IM':
    defaultPatterns = exports.DateIntervalPatterns_en_IM;
    break;
  case 'en_IO':
  case 'en-IO':
    defaultPatterns = exports.DateIntervalPatterns_en_IO;
    break;
  case 'en_JE':
  case 'en-JE':
    defaultPatterns = exports.DateIntervalPatterns_en_JE;
    break;
  case 'en_JM':
  case 'en-JM':
    defaultPatterns = exports.DateIntervalPatterns_en_JM;
    break;
  case 'en_KE':
  case 'en-KE':
    defaultPatterns = exports.DateIntervalPatterns_en_KE;
    break;
  case 'en_KI':
  case 'en-KI':
    defaultPatterns = exports.DateIntervalPatterns_en_KI;
    break;
  case 'en_KN':
  case 'en-KN':
    defaultPatterns = exports.DateIntervalPatterns_en_KN;
    break;
  case 'en_KY':
  case 'en-KY':
    defaultPatterns = exports.DateIntervalPatterns_en_KY;
    break;
  case 'en_LC':
  case 'en-LC':
    defaultPatterns = exports.DateIntervalPatterns_en_LC;
    break;
  case 'en_LR':
  case 'en-LR':
    defaultPatterns = exports.DateIntervalPatterns_en_LR;
    break;
  case 'en_LS':
  case 'en-LS':
    defaultPatterns = exports.DateIntervalPatterns_en_LS;
    break;
  case 'en_MG':
  case 'en-MG':
    defaultPatterns = exports.DateIntervalPatterns_en_MG;
    break;
  case 'en_MH':
  case 'en-MH':
    defaultPatterns = exports.DateIntervalPatterns_en_MH;
    break;
  case 'en_MO':
  case 'en-MO':
    defaultPatterns = exports.DateIntervalPatterns_en_MO;
    break;
  case 'en_MP':
  case 'en-MP':
    defaultPatterns = exports.DateIntervalPatterns_en_MP;
    break;
  case 'en_MS':
  case 'en-MS':
    defaultPatterns = exports.DateIntervalPatterns_en_MS;
    break;
  case 'en_MT':
  case 'en-MT':
    defaultPatterns = exports.DateIntervalPatterns_en_MT;
    break;
  case 'en_MU':
  case 'en-MU':
    defaultPatterns = exports.DateIntervalPatterns_en_MU;
    break;
  case 'en_MW':
  case 'en-MW':
    defaultPatterns = exports.DateIntervalPatterns_en_MW;
    break;
  case 'en_MY':
  case 'en-MY':
    defaultPatterns = exports.DateIntervalPatterns_en_MY;
    break;
  case 'en_NA':
  case 'en-NA':
    defaultPatterns = exports.DateIntervalPatterns_en_NA;
    break;
  case 'en_NF':
  case 'en-NF':
    defaultPatterns = exports.DateIntervalPatterns_en_NF;
    break;
  case 'en_NG':
  case 'en-NG':
    defaultPatterns = exports.DateIntervalPatterns_en_NG;
    break;
  case 'en_NL':
  case 'en-NL':
    defaultPatterns = exports.DateIntervalPatterns_en_NL;
    break;
  case 'en_NR':
  case 'en-NR':
    defaultPatterns = exports.DateIntervalPatterns_en_NR;
    break;
  case 'en_NU':
  case 'en-NU':
    defaultPatterns = exports.DateIntervalPatterns_en_NU;
    break;
  case 'en_NZ':
  case 'en-NZ':
    defaultPatterns = exports.DateIntervalPatterns_en_NZ;
    break;
  case 'en_PG':
  case 'en-PG':
    defaultPatterns = exports.DateIntervalPatterns_en_PG;
    break;
  case 'en_PH':
  case 'en-PH':
    defaultPatterns = exports.DateIntervalPatterns_en_PH;
    break;
  case 'en_PK':
  case 'en-PK':
    defaultPatterns = exports.DateIntervalPatterns_en_PK;
    break;
  case 'en_PN':
  case 'en-PN':
    defaultPatterns = exports.DateIntervalPatterns_en_PN;
    break;
  case 'en_PR':
  case 'en-PR':
    defaultPatterns = exports.DateIntervalPatterns_en_PR;
    break;
  case 'en_PW':
  case 'en-PW':
    defaultPatterns = exports.DateIntervalPatterns_en_PW;
    break;
  case 'en_RW':
  case 'en-RW':
    defaultPatterns = exports.DateIntervalPatterns_en_RW;
    break;
  case 'en_SB':
  case 'en-SB':
    defaultPatterns = exports.DateIntervalPatterns_en_SB;
    break;
  case 'en_SC':
  case 'en-SC':
    defaultPatterns = exports.DateIntervalPatterns_en_SC;
    break;
  case 'en_SD':
  case 'en-SD':
    defaultPatterns = exports.DateIntervalPatterns_en_SD;
    break;
  case 'en_SE':
  case 'en-SE':
    defaultPatterns = exports.DateIntervalPatterns_en_SE;
    break;
  case 'en_SH':
  case 'en-SH':
    defaultPatterns = exports.DateIntervalPatterns_en_SH;
    break;
  case 'en_SI':
  case 'en-SI':
    defaultPatterns = exports.DateIntervalPatterns_en_SI;
    break;
  case 'en_SL':
  case 'en-SL':
    defaultPatterns = exports.DateIntervalPatterns_en_SL;
    break;
  case 'en_SS':
  case 'en-SS':
    defaultPatterns = exports.DateIntervalPatterns_en_SS;
    break;
  case 'en_SX':
  case 'en-SX':
    defaultPatterns = exports.DateIntervalPatterns_en_SX;
    break;
  case 'en_SZ':
  case 'en-SZ':
    defaultPatterns = exports.DateIntervalPatterns_en_SZ;
    break;
  case 'en_TC':
  case 'en-TC':
    defaultPatterns = exports.DateIntervalPatterns_en_TC;
    break;
  case 'en_TK':
  case 'en-TK':
    defaultPatterns = exports.DateIntervalPatterns_en_TK;
    break;
  case 'en_TO':
  case 'en-TO':
    defaultPatterns = exports.DateIntervalPatterns_en_TO;
    break;
  case 'en_TT':
  case 'en-TT':
    defaultPatterns = exports.DateIntervalPatterns_en_TT;
    break;
  case 'en_TV':
  case 'en-TV':
    defaultPatterns = exports.DateIntervalPatterns_en_TV;
    break;
  case 'en_TZ':
  case 'en-TZ':
    defaultPatterns = exports.DateIntervalPatterns_en_TZ;
    break;
  case 'en_UG':
  case 'en-UG':
    defaultPatterns = exports.DateIntervalPatterns_en_UG;
    break;
  case 'en_UM':
  case 'en-UM':
    defaultPatterns = exports.DateIntervalPatterns_en_UM;
    break;
  case 'en_US_POSIX':
  case 'en-US-POSIX':
    defaultPatterns = exports.DateIntervalPatterns_en_US_POSIX;
    break;
  case 'en_VC':
  case 'en-VC':
    defaultPatterns = exports.DateIntervalPatterns_en_VC;
    break;
  case 'en_VG':
  case 'en-VG':
    defaultPatterns = exports.DateIntervalPatterns_en_VG;
    break;
  case 'en_VI':
  case 'en-VI':
    defaultPatterns = exports.DateIntervalPatterns_en_VI;
    break;
  case 'en_VU':
  case 'en-VU':
    defaultPatterns = exports.DateIntervalPatterns_en_VU;
    break;
  case 'en_WS':
  case 'en-WS':
    defaultPatterns = exports.DateIntervalPatterns_en_WS;
    break;
  case 'en_XA':
  case 'en-XA':
    defaultPatterns = exports.DateIntervalPatterns_en_XA;
    break;
  case 'en_ZM':
  case 'en-ZM':
    defaultPatterns = exports.DateIntervalPatterns_en_ZM;
    break;
  case 'en_ZW':
  case 'en-ZW':
    defaultPatterns = exports.DateIntervalPatterns_en_ZW;
    break;
  case 'eo':
    defaultPatterns = exports.DateIntervalPatterns_eo;
    break;
  case 'eo_001':
  case 'eo-001':
    defaultPatterns = exports.DateIntervalPatterns_eo_001;
    break;
  case 'es_AR':
  case 'es-AR':
    defaultPatterns = exports.DateIntervalPatterns_es_AR;
    break;
  case 'es_BO':
  case 'es-BO':
    defaultPatterns = exports.DateIntervalPatterns_es_BO;
    break;
  case 'es_BR':
  case 'es-BR':
    defaultPatterns = exports.DateIntervalPatterns_es_BR;
    break;
  case 'es_BZ':
  case 'es-BZ':
    defaultPatterns = exports.DateIntervalPatterns_es_BZ;
    break;
  case 'es_CL':
  case 'es-CL':
    defaultPatterns = exports.DateIntervalPatterns_es_CL;
    break;
  case 'es_CO':
  case 'es-CO':
    defaultPatterns = exports.DateIntervalPatterns_es_CO;
    break;
  case 'es_CR':
  case 'es-CR':
    defaultPatterns = exports.DateIntervalPatterns_es_CR;
    break;
  case 'es_CU':
  case 'es-CU':
    defaultPatterns = exports.DateIntervalPatterns_es_CU;
    break;
  case 'es_DO':
  case 'es-DO':
    defaultPatterns = exports.DateIntervalPatterns_es_DO;
    break;
  case 'es_EA':
  case 'es-EA':
    defaultPatterns = exports.DateIntervalPatterns_es_EA;
    break;
  case 'es_EC':
  case 'es-EC':
    defaultPatterns = exports.DateIntervalPatterns_es_EC;
    break;
  case 'es_GQ':
  case 'es-GQ':
    defaultPatterns = exports.DateIntervalPatterns_es_GQ;
    break;
  case 'es_GT':
  case 'es-GT':
    defaultPatterns = exports.DateIntervalPatterns_es_GT;
    break;
  case 'es_HN':
  case 'es-HN':
    defaultPatterns = exports.DateIntervalPatterns_es_HN;
    break;
  case 'es_IC':
  case 'es-IC':
    defaultPatterns = exports.DateIntervalPatterns_es_IC;
    break;
  case 'es_NI':
  case 'es-NI':
    defaultPatterns = exports.DateIntervalPatterns_es_NI;
    break;
  case 'es_PA':
  case 'es-PA':
    defaultPatterns = exports.DateIntervalPatterns_es_PA;
    break;
  case 'es_PE':
  case 'es-PE':
    defaultPatterns = exports.DateIntervalPatterns_es_PE;
    break;
  case 'es_PH':
  case 'es-PH':
    defaultPatterns = exports.DateIntervalPatterns_es_PH;
    break;
  case 'es_PR':
  case 'es-PR':
    defaultPatterns = exports.DateIntervalPatterns_es_PR;
    break;
  case 'es_PY':
  case 'es-PY':
    defaultPatterns = exports.DateIntervalPatterns_es_PY;
    break;
  case 'es_SV':
  case 'es-SV':
    defaultPatterns = exports.DateIntervalPatterns_es_SV;
    break;
  case 'es_UY':
  case 'es-UY':
    defaultPatterns = exports.DateIntervalPatterns_es_UY;
    break;
  case 'es_VE':
  case 'es-VE':
    defaultPatterns = exports.DateIntervalPatterns_es_VE;
    break;
  case 'et_EE':
  case 'et-EE':
    defaultPatterns = exports.DateIntervalPatterns_et_EE;
    break;
  case 'eu_ES':
  case 'eu-ES':
    defaultPatterns = exports.DateIntervalPatterns_eu_ES;
    break;
  case 'ewo':
    defaultPatterns = exports.DateIntervalPatterns_ewo;
    break;
  case 'ewo_CM':
  case 'ewo-CM':
    defaultPatterns = exports.DateIntervalPatterns_ewo_CM;
    break;
  case 'fa_AF':
  case 'fa-AF':
    defaultPatterns = exports.DateIntervalPatterns_fa_AF;
    break;
  case 'fa_IR':
  case 'fa-IR':
    defaultPatterns = exports.DateIntervalPatterns_fa_IR;
    break;
  case 'ff':
    defaultPatterns = exports.DateIntervalPatterns_ff;
    break;
  case 'ff_Latn':
  case 'ff-Latn':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn;
    break;
  case 'ff_Latn_BF':
  case 'ff-Latn-BF':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_BF;
    break;
  case 'ff_Latn_CM':
  case 'ff-Latn-CM':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_CM;
    break;
  case 'ff_Latn_GH':
  case 'ff-Latn-GH':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_GH;
    break;
  case 'ff_Latn_GM':
  case 'ff-Latn-GM':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_GM;
    break;
  case 'ff_Latn_GN':
  case 'ff-Latn-GN':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_GN;
    break;
  case 'ff_Latn_GW':
  case 'ff-Latn-GW':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_GW;
    break;
  case 'ff_Latn_LR':
  case 'ff-Latn-LR':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_LR;
    break;
  case 'ff_Latn_MR':
  case 'ff-Latn-MR':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_MR;
    break;
  case 'ff_Latn_NE':
  case 'ff-Latn-NE':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_NE;
    break;
  case 'ff_Latn_NG':
  case 'ff-Latn-NG':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_NG;
    break;
  case 'ff_Latn_SL':
  case 'ff-Latn-SL':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_SL;
    break;
  case 'ff_Latn_SN':
  case 'ff-Latn-SN':
    defaultPatterns = exports.DateIntervalPatterns_ff_Latn_SN;
    break;
  case 'fi_FI':
  case 'fi-FI':
    defaultPatterns = exports.DateIntervalPatterns_fi_FI;
    break;
  case 'fil_PH':
  case 'fil-PH':
    defaultPatterns = exports.DateIntervalPatterns_fil_PH;
    break;
  case 'fo':
    defaultPatterns = exports.DateIntervalPatterns_fo;
    break;
  case 'fo_DK':
  case 'fo-DK':
    defaultPatterns = exports.DateIntervalPatterns_fo_DK;
    break;
  case 'fo_FO':
  case 'fo-FO':
    defaultPatterns = exports.DateIntervalPatterns_fo_FO;
    break;
  case 'fr_BE':
  case 'fr-BE':
    defaultPatterns = exports.DateIntervalPatterns_fr_BE;
    break;
  case 'fr_BF':
  case 'fr-BF':
    defaultPatterns = exports.DateIntervalPatterns_fr_BF;
    break;
  case 'fr_BI':
  case 'fr-BI':
    defaultPatterns = exports.DateIntervalPatterns_fr_BI;
    break;
  case 'fr_BJ':
  case 'fr-BJ':
    defaultPatterns = exports.DateIntervalPatterns_fr_BJ;
    break;
  case 'fr_BL':
  case 'fr-BL':
    defaultPatterns = exports.DateIntervalPatterns_fr_BL;
    break;
  case 'fr_CD':
  case 'fr-CD':
    defaultPatterns = exports.DateIntervalPatterns_fr_CD;
    break;
  case 'fr_CF':
  case 'fr-CF':
    defaultPatterns = exports.DateIntervalPatterns_fr_CF;
    break;
  case 'fr_CG':
  case 'fr-CG':
    defaultPatterns = exports.DateIntervalPatterns_fr_CG;
    break;
  case 'fr_CH':
  case 'fr-CH':
    defaultPatterns = exports.DateIntervalPatterns_fr_CH;
    break;
  case 'fr_CI':
  case 'fr-CI':
    defaultPatterns = exports.DateIntervalPatterns_fr_CI;
    break;
  case 'fr_CM':
  case 'fr-CM':
    defaultPatterns = exports.DateIntervalPatterns_fr_CM;
    break;
  case 'fr_DJ':
  case 'fr-DJ':
    defaultPatterns = exports.DateIntervalPatterns_fr_DJ;
    break;
  case 'fr_DZ':
  case 'fr-DZ':
    defaultPatterns = exports.DateIntervalPatterns_fr_DZ;
    break;
  case 'fr_FR':
  case 'fr-FR':
    defaultPatterns = exports.DateIntervalPatterns_fr_FR;
    break;
  case 'fr_GA':
  case 'fr-GA':
    defaultPatterns = exports.DateIntervalPatterns_fr_GA;
    break;
  case 'fr_GF':
  case 'fr-GF':
    defaultPatterns = exports.DateIntervalPatterns_fr_GF;
    break;
  case 'fr_GN':
  case 'fr-GN':
    defaultPatterns = exports.DateIntervalPatterns_fr_GN;
    break;
  case 'fr_GP':
  case 'fr-GP':
    defaultPatterns = exports.DateIntervalPatterns_fr_GP;
    break;
  case 'fr_GQ':
  case 'fr-GQ':
    defaultPatterns = exports.DateIntervalPatterns_fr_GQ;
    break;
  case 'fr_HT':
  case 'fr-HT':
    defaultPatterns = exports.DateIntervalPatterns_fr_HT;
    break;
  case 'fr_KM':
  case 'fr-KM':
    defaultPatterns = exports.DateIntervalPatterns_fr_KM;
    break;
  case 'fr_LU':
  case 'fr-LU':
    defaultPatterns = exports.DateIntervalPatterns_fr_LU;
    break;
  case 'fr_MA':
  case 'fr-MA':
    defaultPatterns = exports.DateIntervalPatterns_fr_MA;
    break;
  case 'fr_MC':
  case 'fr-MC':
    defaultPatterns = exports.DateIntervalPatterns_fr_MC;
    break;
  case 'fr_MF':
  case 'fr-MF':
    defaultPatterns = exports.DateIntervalPatterns_fr_MF;
    break;
  case 'fr_MG':
  case 'fr-MG':
    defaultPatterns = exports.DateIntervalPatterns_fr_MG;
    break;
  case 'fr_ML':
  case 'fr-ML':
    defaultPatterns = exports.DateIntervalPatterns_fr_ML;
    break;
  case 'fr_MQ':
  case 'fr-MQ':
    defaultPatterns = exports.DateIntervalPatterns_fr_MQ;
    break;
  case 'fr_MR':
  case 'fr-MR':
    defaultPatterns = exports.DateIntervalPatterns_fr_MR;
    break;
  case 'fr_MU':
  case 'fr-MU':
    defaultPatterns = exports.DateIntervalPatterns_fr_MU;
    break;
  case 'fr_NC':
  case 'fr-NC':
    defaultPatterns = exports.DateIntervalPatterns_fr_NC;
    break;
  case 'fr_NE':
  case 'fr-NE':
    defaultPatterns = exports.DateIntervalPatterns_fr_NE;
    break;
  case 'fr_PF':
  case 'fr-PF':
    defaultPatterns = exports.DateIntervalPatterns_fr_PF;
    break;
  case 'fr_PM':
  case 'fr-PM':
    defaultPatterns = exports.DateIntervalPatterns_fr_PM;
    break;
  case 'fr_RE':
  case 'fr-RE':
    defaultPatterns = exports.DateIntervalPatterns_fr_RE;
    break;
  case 'fr_RW':
  case 'fr-RW':
    defaultPatterns = exports.DateIntervalPatterns_fr_RW;
    break;
  case 'fr_SC':
  case 'fr-SC':
    defaultPatterns = exports.DateIntervalPatterns_fr_SC;
    break;
  case 'fr_SN':
  case 'fr-SN':
    defaultPatterns = exports.DateIntervalPatterns_fr_SN;
    break;
  case 'fr_SY':
  case 'fr-SY':
    defaultPatterns = exports.DateIntervalPatterns_fr_SY;
    break;
  case 'fr_TD':
  case 'fr-TD':
    defaultPatterns = exports.DateIntervalPatterns_fr_TD;
    break;
  case 'fr_TG':
  case 'fr-TG':
    defaultPatterns = exports.DateIntervalPatterns_fr_TG;
    break;
  case 'fr_TN':
  case 'fr-TN':
    defaultPatterns = exports.DateIntervalPatterns_fr_TN;
    break;
  case 'fr_VU':
  case 'fr-VU':
    defaultPatterns = exports.DateIntervalPatterns_fr_VU;
    break;
  case 'fr_WF':
  case 'fr-WF':
    defaultPatterns = exports.DateIntervalPatterns_fr_WF;
    break;
  case 'fr_YT':
  case 'fr-YT':
    defaultPatterns = exports.DateIntervalPatterns_fr_YT;
    break;
  case 'fur':
    defaultPatterns = exports.DateIntervalPatterns_fur;
    break;
  case 'fur_IT':
  case 'fur-IT':
    defaultPatterns = exports.DateIntervalPatterns_fur_IT;
    break;
  case 'fy':
    defaultPatterns = exports.DateIntervalPatterns_fy;
    break;
  case 'fy_NL':
  case 'fy-NL':
    defaultPatterns = exports.DateIntervalPatterns_fy_NL;
    break;
  case 'ga_IE':
  case 'ga-IE':
    defaultPatterns = exports.DateIntervalPatterns_ga_IE;
    break;
  case 'gd':
    defaultPatterns = exports.DateIntervalPatterns_gd;
    break;
  case 'gd_GB':
  case 'gd-GB':
    defaultPatterns = exports.DateIntervalPatterns_gd_GB;
    break;
  case 'gl_ES':
  case 'gl-ES':
    defaultPatterns = exports.DateIntervalPatterns_gl_ES;
    break;
  case 'gsw_CH':
  case 'gsw-CH':
    defaultPatterns = exports.DateIntervalPatterns_gsw_CH;
    break;
  case 'gsw_FR':
  case 'gsw-FR':
    defaultPatterns = exports.DateIntervalPatterns_gsw_FR;
    break;
  case 'gsw_LI':
  case 'gsw-LI':
    defaultPatterns = exports.DateIntervalPatterns_gsw_LI;
    break;
  case 'gu_IN':
  case 'gu-IN':
    defaultPatterns = exports.DateIntervalPatterns_gu_IN;
    break;
  case 'guz':
    defaultPatterns = exports.DateIntervalPatterns_guz;
    break;
  case 'guz_KE':
  case 'guz-KE':
    defaultPatterns = exports.DateIntervalPatterns_guz_KE;
    break;
  case 'gv':
    defaultPatterns = exports.DateIntervalPatterns_gv;
    break;
  case 'gv_IM':
  case 'gv-IM':
    defaultPatterns = exports.DateIntervalPatterns_gv_IM;
    break;
  case 'ha':
    defaultPatterns = exports.DateIntervalPatterns_ha;
    break;
  case 'ha_GH':
  case 'ha-GH':
    defaultPatterns = exports.DateIntervalPatterns_ha_GH;
    break;
  case 'ha_NE':
  case 'ha-NE':
    defaultPatterns = exports.DateIntervalPatterns_ha_NE;
    break;
  case 'ha_NG':
  case 'ha-NG':
    defaultPatterns = exports.DateIntervalPatterns_ha_NG;
    break;
  case 'haw_US':
  case 'haw-US':
    defaultPatterns = exports.DateIntervalPatterns_haw_US;
    break;
  case 'he_IL':
  case 'he-IL':
    defaultPatterns = exports.DateIntervalPatterns_he_IL;
    break;
  case 'hi_IN':
  case 'hi-IN':
    defaultPatterns = exports.DateIntervalPatterns_hi_IN;
    break;
  case 'hr_BA':
  case 'hr-BA':
    defaultPatterns = exports.DateIntervalPatterns_hr_BA;
    break;
  case 'hr_HR':
  case 'hr-HR':
    defaultPatterns = exports.DateIntervalPatterns_hr_HR;
    break;
  case 'hsb':
    defaultPatterns = exports.DateIntervalPatterns_hsb;
    break;
  case 'hsb_DE':
  case 'hsb-DE':
    defaultPatterns = exports.DateIntervalPatterns_hsb_DE;
    break;
  case 'hu_HU':
  case 'hu-HU':
    defaultPatterns = exports.DateIntervalPatterns_hu_HU;
    break;
  case 'hy_AM':
  case 'hy-AM':
    defaultPatterns = exports.DateIntervalPatterns_hy_AM;
    break;
  case 'ia':
    defaultPatterns = exports.DateIntervalPatterns_ia;
    break;
  case 'ia_001':
  case 'ia-001':
    defaultPatterns = exports.DateIntervalPatterns_ia_001;
    break;
  case 'id_ID':
  case 'id-ID':
    defaultPatterns = exports.DateIntervalPatterns_id_ID;
    break;
  case 'ig':
    defaultPatterns = exports.DateIntervalPatterns_ig;
    break;
  case 'ig_NG':
  case 'ig-NG':
    defaultPatterns = exports.DateIntervalPatterns_ig_NG;
    break;
  case 'ii':
    defaultPatterns = exports.DateIntervalPatterns_ii;
    break;
  case 'ii_CN':
  case 'ii-CN':
    defaultPatterns = exports.DateIntervalPatterns_ii_CN;
    break;
  case 'is_IS':
  case 'is-IS':
    defaultPatterns = exports.DateIntervalPatterns_is_IS;
    break;
  case 'it_CH':
  case 'it-CH':
    defaultPatterns = exports.DateIntervalPatterns_it_CH;
    break;
  case 'it_IT':
  case 'it-IT':
    defaultPatterns = exports.DateIntervalPatterns_it_IT;
    break;
  case 'it_SM':
  case 'it-SM':
    defaultPatterns = exports.DateIntervalPatterns_it_SM;
    break;
  case 'it_VA':
  case 'it-VA':
    defaultPatterns = exports.DateIntervalPatterns_it_VA;
    break;
  case 'ja_JP':
  case 'ja-JP':
    defaultPatterns = exports.DateIntervalPatterns_ja_JP;
    break;
  case 'jgo':
    defaultPatterns = exports.DateIntervalPatterns_jgo;
    break;
  case 'jgo_CM':
  case 'jgo-CM':
    defaultPatterns = exports.DateIntervalPatterns_jgo_CM;
    break;
  case 'jmc':
    defaultPatterns = exports.DateIntervalPatterns_jmc;
    break;
  case 'jmc_TZ':
  case 'jmc-TZ':
    defaultPatterns = exports.DateIntervalPatterns_jmc_TZ;
    break;
  case 'jv':
    defaultPatterns = exports.DateIntervalPatterns_jv;
    break;
  case 'jv_ID':
  case 'jv-ID':
    defaultPatterns = exports.DateIntervalPatterns_jv_ID;
    break;
  case 'ka_GE':
  case 'ka-GE':
    defaultPatterns = exports.DateIntervalPatterns_ka_GE;
    break;
  case 'kab':
    defaultPatterns = exports.DateIntervalPatterns_kab;
    break;
  case 'kab_DZ':
  case 'kab-DZ':
    defaultPatterns = exports.DateIntervalPatterns_kab_DZ;
    break;
  case 'kam':
    defaultPatterns = exports.DateIntervalPatterns_kam;
    break;
  case 'kam_KE':
  case 'kam-KE':
    defaultPatterns = exports.DateIntervalPatterns_kam_KE;
    break;
  case 'kde':
    defaultPatterns = exports.DateIntervalPatterns_kde;
    break;
  case 'kde_TZ':
  case 'kde-TZ':
    defaultPatterns = exports.DateIntervalPatterns_kde_TZ;
    break;
  case 'kea':
    defaultPatterns = exports.DateIntervalPatterns_kea;
    break;
  case 'kea_CV':
  case 'kea-CV':
    defaultPatterns = exports.DateIntervalPatterns_kea_CV;
    break;
  case 'khq':
    defaultPatterns = exports.DateIntervalPatterns_khq;
    break;
  case 'khq_ML':
  case 'khq-ML':
    defaultPatterns = exports.DateIntervalPatterns_khq_ML;
    break;
  case 'ki':
    defaultPatterns = exports.DateIntervalPatterns_ki;
    break;
  case 'ki_KE':
  case 'ki-KE':
    defaultPatterns = exports.DateIntervalPatterns_ki_KE;
    break;
  case 'kk_KZ':
  case 'kk-KZ':
    defaultPatterns = exports.DateIntervalPatterns_kk_KZ;
    break;
  case 'kkj':
    defaultPatterns = exports.DateIntervalPatterns_kkj;
    break;
  case 'kkj_CM':
  case 'kkj-CM':
    defaultPatterns = exports.DateIntervalPatterns_kkj_CM;
    break;
  case 'kl':
    defaultPatterns = exports.DateIntervalPatterns_kl;
    break;
  case 'kl_GL':
  case 'kl-GL':
    defaultPatterns = exports.DateIntervalPatterns_kl_GL;
    break;
  case 'kln':
    defaultPatterns = exports.DateIntervalPatterns_kln;
    break;
  case 'kln_KE':
  case 'kln-KE':
    defaultPatterns = exports.DateIntervalPatterns_kln_KE;
    break;
  case 'km_KH':
  case 'km-KH':
    defaultPatterns = exports.DateIntervalPatterns_km_KH;
    break;
  case 'kn_IN':
  case 'kn-IN':
    defaultPatterns = exports.DateIntervalPatterns_kn_IN;
    break;
  case 'ko_KP':
  case 'ko-KP':
    defaultPatterns = exports.DateIntervalPatterns_ko_KP;
    break;
  case 'ko_KR':
  case 'ko-KR':
    defaultPatterns = exports.DateIntervalPatterns_ko_KR;
    break;
  case 'kok':
    defaultPatterns = exports.DateIntervalPatterns_kok;
    break;
  case 'kok_IN':
  case 'kok-IN':
    defaultPatterns = exports.DateIntervalPatterns_kok_IN;
    break;
  case 'ks':
    defaultPatterns = exports.DateIntervalPatterns_ks;
    break;
  case 'ks_IN':
  case 'ks-IN':
    defaultPatterns = exports.DateIntervalPatterns_ks_IN;
    break;
  case 'ksb':
    defaultPatterns = exports.DateIntervalPatterns_ksb;
    break;
  case 'ksb_TZ':
  case 'ksb-TZ':
    defaultPatterns = exports.DateIntervalPatterns_ksb_TZ;
    break;
  case 'ksf':
    defaultPatterns = exports.DateIntervalPatterns_ksf;
    break;
  case 'ksf_CM':
  case 'ksf-CM':
    defaultPatterns = exports.DateIntervalPatterns_ksf_CM;
    break;
  case 'ksh':
    defaultPatterns = exports.DateIntervalPatterns_ksh;
    break;
  case 'ksh_DE':
  case 'ksh-DE':
    defaultPatterns = exports.DateIntervalPatterns_ksh_DE;
    break;
  case 'ku':
    defaultPatterns = exports.DateIntervalPatterns_ku;
    break;
  case 'ku_TR':
  case 'ku-TR':
    defaultPatterns = exports.DateIntervalPatterns_ku_TR;
    break;
  case 'kw':
    defaultPatterns = exports.DateIntervalPatterns_kw;
    break;
  case 'kw_GB':
  case 'kw-GB':
    defaultPatterns = exports.DateIntervalPatterns_kw_GB;
    break;
  case 'ky_KG':
  case 'ky-KG':
    defaultPatterns = exports.DateIntervalPatterns_ky_KG;
    break;
  case 'lag':
    defaultPatterns = exports.DateIntervalPatterns_lag;
    break;
  case 'lag_TZ':
  case 'lag-TZ':
    defaultPatterns = exports.DateIntervalPatterns_lag_TZ;
    break;
  case 'lb':
    defaultPatterns = exports.DateIntervalPatterns_lb;
    break;
  case 'lb_LU':
  case 'lb-LU':
    defaultPatterns = exports.DateIntervalPatterns_lb_LU;
    break;
  case 'lg':
    defaultPatterns = exports.DateIntervalPatterns_lg;
    break;
  case 'lg_UG':
  case 'lg-UG':
    defaultPatterns = exports.DateIntervalPatterns_lg_UG;
    break;
  case 'lkt':
    defaultPatterns = exports.DateIntervalPatterns_lkt;
    break;
  case 'lkt_US':
  case 'lkt-US':
    defaultPatterns = exports.DateIntervalPatterns_lkt_US;
    break;
  case 'ln_AO':
  case 'ln-AO':
    defaultPatterns = exports.DateIntervalPatterns_ln_AO;
    break;
  case 'ln_CD':
  case 'ln-CD':
    defaultPatterns = exports.DateIntervalPatterns_ln_CD;
    break;
  case 'ln_CF':
  case 'ln-CF':
    defaultPatterns = exports.DateIntervalPatterns_ln_CF;
    break;
  case 'ln_CG':
  case 'ln-CG':
    defaultPatterns = exports.DateIntervalPatterns_ln_CG;
    break;
  case 'lo_LA':
  case 'lo-LA':
    defaultPatterns = exports.DateIntervalPatterns_lo_LA;
    break;
  case 'lrc':
    defaultPatterns = exports.DateIntervalPatterns_lrc;
    break;
  case 'lrc_IQ':
  case 'lrc-IQ':
    defaultPatterns = exports.DateIntervalPatterns_lrc_IQ;
    break;
  case 'lrc_IR':
  case 'lrc-IR':
    defaultPatterns = exports.DateIntervalPatterns_lrc_IR;
    break;
  case 'lt_LT':
  case 'lt-LT':
    defaultPatterns = exports.DateIntervalPatterns_lt_LT;
    break;
  case 'lu':
    defaultPatterns = exports.DateIntervalPatterns_lu;
    break;
  case 'lu_CD':
  case 'lu-CD':
    defaultPatterns = exports.DateIntervalPatterns_lu_CD;
    break;
  case 'luo':
    defaultPatterns = exports.DateIntervalPatterns_luo;
    break;
  case 'luo_KE':
  case 'luo-KE':
    defaultPatterns = exports.DateIntervalPatterns_luo_KE;
    break;
  case 'luy':
    defaultPatterns = exports.DateIntervalPatterns_luy;
    break;
  case 'luy_KE':
  case 'luy-KE':
    defaultPatterns = exports.DateIntervalPatterns_luy_KE;
    break;
  case 'lv_LV':
  case 'lv-LV':
    defaultPatterns = exports.DateIntervalPatterns_lv_LV;
    break;
  case 'mas':
    defaultPatterns = exports.DateIntervalPatterns_mas;
    break;
  case 'mas_KE':
  case 'mas-KE':
    defaultPatterns = exports.DateIntervalPatterns_mas_KE;
    break;
  case 'mas_TZ':
  case 'mas-TZ':
    defaultPatterns = exports.DateIntervalPatterns_mas_TZ;
    break;
  case 'mer':
    defaultPatterns = exports.DateIntervalPatterns_mer;
    break;
  case 'mer_KE':
  case 'mer-KE':
    defaultPatterns = exports.DateIntervalPatterns_mer_KE;
    break;
  case 'mfe':
    defaultPatterns = exports.DateIntervalPatterns_mfe;
    break;
  case 'mfe_MU':
  case 'mfe-MU':
    defaultPatterns = exports.DateIntervalPatterns_mfe_MU;
    break;
  case 'mg':
    defaultPatterns = exports.DateIntervalPatterns_mg;
    break;
  case 'mg_MG':
  case 'mg-MG':
    defaultPatterns = exports.DateIntervalPatterns_mg_MG;
    break;
  case 'mgh':
    defaultPatterns = exports.DateIntervalPatterns_mgh;
    break;
  case 'mgh_MZ':
  case 'mgh-MZ':
    defaultPatterns = exports.DateIntervalPatterns_mgh_MZ;
    break;
  case 'mgo':
    defaultPatterns = exports.DateIntervalPatterns_mgo;
    break;
  case 'mgo_CM':
  case 'mgo-CM':
    defaultPatterns = exports.DateIntervalPatterns_mgo_CM;
    break;
  case 'mi':
    defaultPatterns = exports.DateIntervalPatterns_mi;
    break;
  case 'mi_NZ':
  case 'mi-NZ':
    defaultPatterns = exports.DateIntervalPatterns_mi_NZ;
    break;
  case 'mk_MK':
  case 'mk-MK':
    defaultPatterns = exports.DateIntervalPatterns_mk_MK;
    break;
  case 'ml_IN':
  case 'ml-IN':
    defaultPatterns = exports.DateIntervalPatterns_ml_IN;
    break;
  case 'mn_MN':
  case 'mn-MN':
    defaultPatterns = exports.DateIntervalPatterns_mn_MN;
    break;
  case 'mr_IN':
  case 'mr-IN':
    defaultPatterns = exports.DateIntervalPatterns_mr_IN;
    break;
  case 'ms_BN':
  case 'ms-BN':
    defaultPatterns = exports.DateIntervalPatterns_ms_BN;
    break;
  case 'ms_MY':
  case 'ms-MY':
    defaultPatterns = exports.DateIntervalPatterns_ms_MY;
    break;
  case 'ms_SG':
  case 'ms-SG':
    defaultPatterns = exports.DateIntervalPatterns_ms_SG;
    break;
  case 'mt_MT':
  case 'mt-MT':
    defaultPatterns = exports.DateIntervalPatterns_mt_MT;
    break;
  case 'mua':
    defaultPatterns = exports.DateIntervalPatterns_mua;
    break;
  case 'mua_CM':
  case 'mua-CM':
    defaultPatterns = exports.DateIntervalPatterns_mua_CM;
    break;
  case 'my_MM':
  case 'my-MM':
    defaultPatterns = exports.DateIntervalPatterns_my_MM;
    break;
  case 'mzn':
    defaultPatterns = exports.DateIntervalPatterns_mzn;
    break;
  case 'mzn_IR':
  case 'mzn-IR':
    defaultPatterns = exports.DateIntervalPatterns_mzn_IR;
    break;
  case 'naq':
    defaultPatterns = exports.DateIntervalPatterns_naq;
    break;
  case 'naq_NA':
  case 'naq-NA':
    defaultPatterns = exports.DateIntervalPatterns_naq_NA;
    break;
  case 'nb_NO':
  case 'nb-NO':
    defaultPatterns = exports.DateIntervalPatterns_nb_NO;
    break;
  case 'nb_SJ':
  case 'nb-SJ':
    defaultPatterns = exports.DateIntervalPatterns_nb_SJ;
    break;
  case 'nd':
    defaultPatterns = exports.DateIntervalPatterns_nd;
    break;
  case 'nd_ZW':
  case 'nd-ZW':
    defaultPatterns = exports.DateIntervalPatterns_nd_ZW;
    break;
  case 'nds':
    defaultPatterns = exports.DateIntervalPatterns_nds;
    break;
  case 'nds_DE':
  case 'nds-DE':
    defaultPatterns = exports.DateIntervalPatterns_nds_DE;
    break;
  case 'nds_NL':
  case 'nds-NL':
    defaultPatterns = exports.DateIntervalPatterns_nds_NL;
    break;
  case 'ne_IN':
  case 'ne-IN':
    defaultPatterns = exports.DateIntervalPatterns_ne_IN;
    break;
  case 'ne_NP':
  case 'ne-NP':
    defaultPatterns = exports.DateIntervalPatterns_ne_NP;
    break;
  case 'nl_AW':
  case 'nl-AW':
    defaultPatterns = exports.DateIntervalPatterns_nl_AW;
    break;
  case 'nl_BE':
  case 'nl-BE':
    defaultPatterns = exports.DateIntervalPatterns_nl_BE;
    break;
  case 'nl_BQ':
  case 'nl-BQ':
    defaultPatterns = exports.DateIntervalPatterns_nl_BQ;
    break;
  case 'nl_CW':
  case 'nl-CW':
    defaultPatterns = exports.DateIntervalPatterns_nl_CW;
    break;
  case 'nl_NL':
  case 'nl-NL':
    defaultPatterns = exports.DateIntervalPatterns_nl_NL;
    break;
  case 'nl_SR':
  case 'nl-SR':
    defaultPatterns = exports.DateIntervalPatterns_nl_SR;
    break;
  case 'nl_SX':
  case 'nl-SX':
    defaultPatterns = exports.DateIntervalPatterns_nl_SX;
    break;
  case 'nmg':
    defaultPatterns = exports.DateIntervalPatterns_nmg;
    break;
  case 'nmg_CM':
  case 'nmg-CM':
    defaultPatterns = exports.DateIntervalPatterns_nmg_CM;
    break;
  case 'nn':
    defaultPatterns = exports.DateIntervalPatterns_nn;
    break;
  case 'nn_NO':
  case 'nn-NO':
    defaultPatterns = exports.DateIntervalPatterns_nn_NO;
    break;
  case 'nnh':
    defaultPatterns = exports.DateIntervalPatterns_nnh;
    break;
  case 'nnh_CM':
  case 'nnh-CM':
    defaultPatterns = exports.DateIntervalPatterns_nnh_CM;
    break;
  case 'nus':
    defaultPatterns = exports.DateIntervalPatterns_nus;
    break;
  case 'nus_SS':
  case 'nus-SS':
    defaultPatterns = exports.DateIntervalPatterns_nus_SS;
    break;
  case 'nyn':
    defaultPatterns = exports.DateIntervalPatterns_nyn;
    break;
  case 'nyn_UG':
  case 'nyn-UG':
    defaultPatterns = exports.DateIntervalPatterns_nyn_UG;
    break;
  case 'om':
    defaultPatterns = exports.DateIntervalPatterns_om;
    break;
  case 'om_ET':
  case 'om-ET':
    defaultPatterns = exports.DateIntervalPatterns_om_ET;
    break;
  case 'om_KE':
  case 'om-KE':
    defaultPatterns = exports.DateIntervalPatterns_om_KE;
    break;
  case 'or_IN':
  case 'or-IN':
    defaultPatterns = exports.DateIntervalPatterns_or_IN;
    break;
  case 'os':
    defaultPatterns = exports.DateIntervalPatterns_os;
    break;
  case 'os_GE':
  case 'os-GE':
    defaultPatterns = exports.DateIntervalPatterns_os_GE;
    break;
  case 'os_RU':
  case 'os-RU':
    defaultPatterns = exports.DateIntervalPatterns_os_RU;
    break;
  case 'pa_Arab':
  case 'pa-Arab':
    defaultPatterns = exports.DateIntervalPatterns_pa_Arab;
    break;
  case 'pa_Arab_PK':
  case 'pa-Arab-PK':
    defaultPatterns = exports.DateIntervalPatterns_pa_Arab_PK;
    break;
  case 'pa_Guru':
  case 'pa-Guru':
    defaultPatterns = exports.DateIntervalPatterns_pa_Guru;
    break;
  case 'pa_Guru_IN':
  case 'pa-Guru-IN':
    defaultPatterns = exports.DateIntervalPatterns_pa_Guru_IN;
    break;
  case 'pl_PL':
  case 'pl-PL':
    defaultPatterns = exports.DateIntervalPatterns_pl_PL;
    break;
  case 'ps':
    defaultPatterns = exports.DateIntervalPatterns_ps;
    break;
  case 'ps_AF':
  case 'ps-AF':
    defaultPatterns = exports.DateIntervalPatterns_ps_AF;
    break;
  case 'ps_PK':
  case 'ps-PK':
    defaultPatterns = exports.DateIntervalPatterns_ps_PK;
    break;
  case 'pt_AO':
  case 'pt-AO':
    defaultPatterns = exports.DateIntervalPatterns_pt_AO;
    break;
  case 'pt_CH':
  case 'pt-CH':
    defaultPatterns = exports.DateIntervalPatterns_pt_CH;
    break;
  case 'pt_CV':
  case 'pt-CV':
    defaultPatterns = exports.DateIntervalPatterns_pt_CV;
    break;
  case 'pt_GQ':
  case 'pt-GQ':
    defaultPatterns = exports.DateIntervalPatterns_pt_GQ;
    break;
  case 'pt_GW':
  case 'pt-GW':
    defaultPatterns = exports.DateIntervalPatterns_pt_GW;
    break;
  case 'pt_LU':
  case 'pt-LU':
    defaultPatterns = exports.DateIntervalPatterns_pt_LU;
    break;
  case 'pt_MO':
  case 'pt-MO':
    defaultPatterns = exports.DateIntervalPatterns_pt_MO;
    break;
  case 'pt_MZ':
  case 'pt-MZ':
    defaultPatterns = exports.DateIntervalPatterns_pt_MZ;
    break;
  case 'pt_ST':
  case 'pt-ST':
    defaultPatterns = exports.DateIntervalPatterns_pt_ST;
    break;
  case 'pt_TL':
  case 'pt-TL':
    defaultPatterns = exports.DateIntervalPatterns_pt_TL;
    break;
  case 'qu':
    defaultPatterns = exports.DateIntervalPatterns_qu;
    break;
  case 'qu_BO':
  case 'qu-BO':
    defaultPatterns = exports.DateIntervalPatterns_qu_BO;
    break;
  case 'qu_EC':
  case 'qu-EC':
    defaultPatterns = exports.DateIntervalPatterns_qu_EC;
    break;
  case 'qu_PE':
  case 'qu-PE':
    defaultPatterns = exports.DateIntervalPatterns_qu_PE;
    break;
  case 'rm':
    defaultPatterns = exports.DateIntervalPatterns_rm;
    break;
  case 'rm_CH':
  case 'rm-CH':
    defaultPatterns = exports.DateIntervalPatterns_rm_CH;
    break;
  case 'rn':
    defaultPatterns = exports.DateIntervalPatterns_rn;
    break;
  case 'rn_BI':
  case 'rn-BI':
    defaultPatterns = exports.DateIntervalPatterns_rn_BI;
    break;
  case 'ro_MD':
  case 'ro-MD':
    defaultPatterns = exports.DateIntervalPatterns_ro_MD;
    break;
  case 'ro_RO':
  case 'ro-RO':
    defaultPatterns = exports.DateIntervalPatterns_ro_RO;
    break;
  case 'rof':
    defaultPatterns = exports.DateIntervalPatterns_rof;
    break;
  case 'rof_TZ':
  case 'rof-TZ':
    defaultPatterns = exports.DateIntervalPatterns_rof_TZ;
    break;
  case 'ru_BY':
  case 'ru-BY':
    defaultPatterns = exports.DateIntervalPatterns_ru_BY;
    break;
  case 'ru_KG':
  case 'ru-KG':
    defaultPatterns = exports.DateIntervalPatterns_ru_KG;
    break;
  case 'ru_KZ':
  case 'ru-KZ':
    defaultPatterns = exports.DateIntervalPatterns_ru_KZ;
    break;
  case 'ru_MD':
  case 'ru-MD':
    defaultPatterns = exports.DateIntervalPatterns_ru_MD;
    break;
  case 'ru_RU':
  case 'ru-RU':
    defaultPatterns = exports.DateIntervalPatterns_ru_RU;
    break;
  case 'ru_UA':
  case 'ru-UA':
    defaultPatterns = exports.DateIntervalPatterns_ru_UA;
    break;
  case 'rw':
    defaultPatterns = exports.DateIntervalPatterns_rw;
    break;
  case 'rw_RW':
  case 'rw-RW':
    defaultPatterns = exports.DateIntervalPatterns_rw_RW;
    break;
  case 'rwk':
    defaultPatterns = exports.DateIntervalPatterns_rwk;
    break;
  case 'rwk_TZ':
  case 'rwk-TZ':
    defaultPatterns = exports.DateIntervalPatterns_rwk_TZ;
    break;
  case 'sah':
    defaultPatterns = exports.DateIntervalPatterns_sah;
    break;
  case 'sah_RU':
  case 'sah-RU':
    defaultPatterns = exports.DateIntervalPatterns_sah_RU;
    break;
  case 'saq':
    defaultPatterns = exports.DateIntervalPatterns_saq;
    break;
  case 'saq_KE':
  case 'saq-KE':
    defaultPatterns = exports.DateIntervalPatterns_saq_KE;
    break;
  case 'sbp':
    defaultPatterns = exports.DateIntervalPatterns_sbp;
    break;
  case 'sbp_TZ':
  case 'sbp-TZ':
    defaultPatterns = exports.DateIntervalPatterns_sbp_TZ;
    break;
  case 'sd':
    defaultPatterns = exports.DateIntervalPatterns_sd;
    break;
  case 'sd_PK':
  case 'sd-PK':
    defaultPatterns = exports.DateIntervalPatterns_sd_PK;
    break;
  case 'se':
    defaultPatterns = exports.DateIntervalPatterns_se;
    break;
  case 'se_FI':
  case 'se-FI':
    defaultPatterns = exports.DateIntervalPatterns_se_FI;
    break;
  case 'se_NO':
  case 'se-NO':
    defaultPatterns = exports.DateIntervalPatterns_se_NO;
    break;
  case 'se_SE':
  case 'se-SE':
    defaultPatterns = exports.DateIntervalPatterns_se_SE;
    break;
  case 'seh':
    defaultPatterns = exports.DateIntervalPatterns_seh;
    break;
  case 'seh_MZ':
  case 'seh-MZ':
    defaultPatterns = exports.DateIntervalPatterns_seh_MZ;
    break;
  case 'ses':
    defaultPatterns = exports.DateIntervalPatterns_ses;
    break;
  case 'ses_ML':
  case 'ses-ML':
    defaultPatterns = exports.DateIntervalPatterns_ses_ML;
    break;
  case 'sg':
    defaultPatterns = exports.DateIntervalPatterns_sg;
    break;
  case 'sg_CF':
  case 'sg-CF':
    defaultPatterns = exports.DateIntervalPatterns_sg_CF;
    break;
  case 'shi':
    defaultPatterns = exports.DateIntervalPatterns_shi;
    break;
  case 'shi_Latn':
  case 'shi-Latn':
    defaultPatterns = exports.DateIntervalPatterns_shi_Latn;
    break;
  case 'shi_Latn_MA':
  case 'shi-Latn-MA':
    defaultPatterns = exports.DateIntervalPatterns_shi_Latn_MA;
    break;
  case 'shi_Tfng':
  case 'shi-Tfng':
    defaultPatterns = exports.DateIntervalPatterns_shi_Tfng;
    break;
  case 'shi_Tfng_MA':
  case 'shi-Tfng-MA':
    defaultPatterns = exports.DateIntervalPatterns_shi_Tfng_MA;
    break;
  case 'si_LK':
  case 'si-LK':
    defaultPatterns = exports.DateIntervalPatterns_si_LK;
    break;
  case 'sk_SK':
  case 'sk-SK':
    defaultPatterns = exports.DateIntervalPatterns_sk_SK;
    break;
  case 'sl_SI':
  case 'sl-SI':
    defaultPatterns = exports.DateIntervalPatterns_sl_SI;
    break;
  case 'smn':
    defaultPatterns = exports.DateIntervalPatterns_smn;
    break;
  case 'smn_FI':
  case 'smn-FI':
    defaultPatterns = exports.DateIntervalPatterns_smn_FI;
    break;
  case 'sn':
    defaultPatterns = exports.DateIntervalPatterns_sn;
    break;
  case 'sn_ZW':
  case 'sn-ZW':
    defaultPatterns = exports.DateIntervalPatterns_sn_ZW;
    break;
  case 'so':
    defaultPatterns = exports.DateIntervalPatterns_so;
    break;
  case 'so_DJ':
  case 'so-DJ':
    defaultPatterns = exports.DateIntervalPatterns_so_DJ;
    break;
  case 'so_ET':
  case 'so-ET':
    defaultPatterns = exports.DateIntervalPatterns_so_ET;
    break;
  case 'so_KE':
  case 'so-KE':
    defaultPatterns = exports.DateIntervalPatterns_so_KE;
    break;
  case 'so_SO':
  case 'so-SO':
    defaultPatterns = exports.DateIntervalPatterns_so_SO;
    break;
  case 'sq_AL':
  case 'sq-AL':
    defaultPatterns = exports.DateIntervalPatterns_sq_AL;
    break;
  case 'sq_MK':
  case 'sq-MK':
    defaultPatterns = exports.DateIntervalPatterns_sq_MK;
    break;
  case 'sq_XK':
  case 'sq-XK':
    defaultPatterns = exports.DateIntervalPatterns_sq_XK;
    break;
  case 'sr_Cyrl':
  case 'sr-Cyrl':
    defaultPatterns = exports.DateIntervalPatterns_sr_Cyrl;
    break;
  case 'sr_Cyrl_BA':
  case 'sr-Cyrl-BA':
    defaultPatterns = exports.DateIntervalPatterns_sr_Cyrl_BA;
    break;
  case 'sr_Cyrl_ME':
  case 'sr-Cyrl-ME':
    defaultPatterns = exports.DateIntervalPatterns_sr_Cyrl_ME;
    break;
  case 'sr_Cyrl_RS':
  case 'sr-Cyrl-RS':
    defaultPatterns = exports.DateIntervalPatterns_sr_Cyrl_RS;
    break;
  case 'sr_Cyrl_XK':
  case 'sr-Cyrl-XK':
    defaultPatterns = exports.DateIntervalPatterns_sr_Cyrl_XK;
    break;
  case 'sr_Latn_BA':
  case 'sr-Latn-BA':
    defaultPatterns = exports.DateIntervalPatterns_sr_Latn_BA;
    break;
  case 'sr_Latn_ME':
  case 'sr-Latn-ME':
    defaultPatterns = exports.DateIntervalPatterns_sr_Latn_ME;
    break;
  case 'sr_Latn_RS':
  case 'sr-Latn-RS':
    defaultPatterns = exports.DateIntervalPatterns_sr_Latn_RS;
    break;
  case 'sr_Latn_XK':
  case 'sr-Latn-XK':
    defaultPatterns = exports.DateIntervalPatterns_sr_Latn_XK;
    break;
  case 'sv_AX':
  case 'sv-AX':
    defaultPatterns = exports.DateIntervalPatterns_sv_AX;
    break;
  case 'sv_FI':
  case 'sv-FI':
    defaultPatterns = exports.DateIntervalPatterns_sv_FI;
    break;
  case 'sv_SE':
  case 'sv-SE':
    defaultPatterns = exports.DateIntervalPatterns_sv_SE;
    break;
  case 'sw_CD':
  case 'sw-CD':
    defaultPatterns = exports.DateIntervalPatterns_sw_CD;
    break;
  case 'sw_KE':
  case 'sw-KE':
    defaultPatterns = exports.DateIntervalPatterns_sw_KE;
    break;
  case 'sw_TZ':
  case 'sw-TZ':
    defaultPatterns = exports.DateIntervalPatterns_sw_TZ;
    break;
  case 'sw_UG':
  case 'sw-UG':
    defaultPatterns = exports.DateIntervalPatterns_sw_UG;
    break;
  case 'ta_IN':
  case 'ta-IN':
    defaultPatterns = exports.DateIntervalPatterns_ta_IN;
    break;
  case 'ta_LK':
  case 'ta-LK':
    defaultPatterns = exports.DateIntervalPatterns_ta_LK;
    break;
  case 'ta_MY':
  case 'ta-MY':
    defaultPatterns = exports.DateIntervalPatterns_ta_MY;
    break;
  case 'ta_SG':
  case 'ta-SG':
    defaultPatterns = exports.DateIntervalPatterns_ta_SG;
    break;
  case 'te_IN':
  case 'te-IN':
    defaultPatterns = exports.DateIntervalPatterns_te_IN;
    break;
  case 'teo':
    defaultPatterns = exports.DateIntervalPatterns_teo;
    break;
  case 'teo_KE':
  case 'teo-KE':
    defaultPatterns = exports.DateIntervalPatterns_teo_KE;
    break;
  case 'teo_UG':
  case 'teo-UG':
    defaultPatterns = exports.DateIntervalPatterns_teo_UG;
    break;
  case 'tg':
    defaultPatterns = exports.DateIntervalPatterns_tg;
    break;
  case 'tg_TJ':
  case 'tg-TJ':
    defaultPatterns = exports.DateIntervalPatterns_tg_TJ;
    break;
  case 'th_TH':
  case 'th-TH':
    defaultPatterns = exports.DateIntervalPatterns_th_TH;
    break;
  case 'ti':
    defaultPatterns = exports.DateIntervalPatterns_ti;
    break;
  case 'ti_ER':
  case 'ti-ER':
    defaultPatterns = exports.DateIntervalPatterns_ti_ER;
    break;
  case 'ti_ET':
  case 'ti-ET':
    defaultPatterns = exports.DateIntervalPatterns_ti_ET;
    break;
  case 'tk':
    defaultPatterns = exports.DateIntervalPatterns_tk;
    break;
  case 'tk_TM':
  case 'tk-TM':
    defaultPatterns = exports.DateIntervalPatterns_tk_TM;
    break;
  case 'to':
    defaultPatterns = exports.DateIntervalPatterns_to;
    break;
  case 'to_TO':
  case 'to-TO':
    defaultPatterns = exports.DateIntervalPatterns_to_TO;
    break;
  case 'tr_CY':
  case 'tr-CY':
    defaultPatterns = exports.DateIntervalPatterns_tr_CY;
    break;
  case 'tr_TR':
  case 'tr-TR':
    defaultPatterns = exports.DateIntervalPatterns_tr_TR;
    break;
  case 'tt':
    defaultPatterns = exports.DateIntervalPatterns_tt;
    break;
  case 'tt_RU':
  case 'tt-RU':
    defaultPatterns = exports.DateIntervalPatterns_tt_RU;
    break;
  case 'twq':
    defaultPatterns = exports.DateIntervalPatterns_twq;
    break;
  case 'twq_NE':
  case 'twq-NE':
    defaultPatterns = exports.DateIntervalPatterns_twq_NE;
    break;
  case 'tzm':
    defaultPatterns = exports.DateIntervalPatterns_tzm;
    break;
  case 'tzm_MA':
  case 'tzm-MA':
    defaultPatterns = exports.DateIntervalPatterns_tzm_MA;
    break;
  case 'ug':
    defaultPatterns = exports.DateIntervalPatterns_ug;
    break;
  case 'ug_CN':
  case 'ug-CN':
    defaultPatterns = exports.DateIntervalPatterns_ug_CN;
    break;
  case 'uk_UA':
  case 'uk-UA':
    defaultPatterns = exports.DateIntervalPatterns_uk_UA;
    break;
  case 'ur_IN':
  case 'ur-IN':
    defaultPatterns = exports.DateIntervalPatterns_ur_IN;
    break;
  case 'ur_PK':
  case 'ur-PK':
    defaultPatterns = exports.DateIntervalPatterns_ur_PK;
    break;
  case 'uz_Arab':
  case 'uz-Arab':
    defaultPatterns = exports.DateIntervalPatterns_uz_Arab;
    break;
  case 'uz_Arab_AF':
  case 'uz-Arab-AF':
    defaultPatterns = exports.DateIntervalPatterns_uz_Arab_AF;
    break;
  case 'uz_Cyrl':
  case 'uz-Cyrl':
    defaultPatterns = exports.DateIntervalPatterns_uz_Cyrl;
    break;
  case 'uz_Cyrl_UZ':
  case 'uz-Cyrl-UZ':
    defaultPatterns = exports.DateIntervalPatterns_uz_Cyrl_UZ;
    break;
  case 'uz_Latn':
  case 'uz-Latn':
    defaultPatterns = exports.DateIntervalPatterns_uz_Latn;
    break;
  case 'uz_Latn_UZ':
  case 'uz-Latn-UZ':
    defaultPatterns = exports.DateIntervalPatterns_uz_Latn_UZ;
    break;
  case 'vai':
    defaultPatterns = exports.DateIntervalPatterns_vai;
    break;
  case 'vai_Latn':
  case 'vai-Latn':
    defaultPatterns = exports.DateIntervalPatterns_vai_Latn;
    break;
  case 'vai_Latn_LR':
  case 'vai-Latn-LR':
    defaultPatterns = exports.DateIntervalPatterns_vai_Latn_LR;
    break;
  case 'vai_Vaii':
  case 'vai-Vaii':
    defaultPatterns = exports.DateIntervalPatterns_vai_Vaii;
    break;
  case 'vai_Vaii_LR':
  case 'vai-Vaii-LR':
    defaultPatterns = exports.DateIntervalPatterns_vai_Vaii_LR;
    break;
  case 'vi_VN':
  case 'vi-VN':
    defaultPatterns = exports.DateIntervalPatterns_vi_VN;
    break;
  case 'vun':
    defaultPatterns = exports.DateIntervalPatterns_vun;
    break;
  case 'vun_TZ':
  case 'vun-TZ':
    defaultPatterns = exports.DateIntervalPatterns_vun_TZ;
    break;
  case 'wae':
    defaultPatterns = exports.DateIntervalPatterns_wae;
    break;
  case 'wae_CH':
  case 'wae-CH':
    defaultPatterns = exports.DateIntervalPatterns_wae_CH;
    break;
  case 'wo':
    defaultPatterns = exports.DateIntervalPatterns_wo;
    break;
  case 'wo_SN':
  case 'wo-SN':
    defaultPatterns = exports.DateIntervalPatterns_wo_SN;
    break;
  case 'xh':
    defaultPatterns = exports.DateIntervalPatterns_xh;
    break;
  case 'xh_ZA':
  case 'xh-ZA':
    defaultPatterns = exports.DateIntervalPatterns_xh_ZA;
    break;
  case 'xog':
    defaultPatterns = exports.DateIntervalPatterns_xog;
    break;
  case 'xog_UG':
  case 'xog-UG':
    defaultPatterns = exports.DateIntervalPatterns_xog_UG;
    break;
  case 'yav':
    defaultPatterns = exports.DateIntervalPatterns_yav;
    break;
  case 'yav_CM':
  case 'yav-CM':
    defaultPatterns = exports.DateIntervalPatterns_yav_CM;
    break;
  case 'yi':
    defaultPatterns = exports.DateIntervalPatterns_yi;
    break;
  case 'yi_001':
  case 'yi-001':
    defaultPatterns = exports.DateIntervalPatterns_yi_001;
    break;
  case 'yo':
    defaultPatterns = exports.DateIntervalPatterns_yo;
    break;
  case 'yo_BJ':
  case 'yo-BJ':
    defaultPatterns = exports.DateIntervalPatterns_yo_BJ;
    break;
  case 'yo_NG':
  case 'yo-NG':
    defaultPatterns = exports.DateIntervalPatterns_yo_NG;
    break;
  case 'yue':
    defaultPatterns = exports.DateIntervalPatterns_yue;
    break;
  case 'yue_Hans':
  case 'yue-Hans':
    defaultPatterns = exports.DateIntervalPatterns_yue_Hans;
    break;
  case 'yue_Hans_CN':
  case 'yue-Hans-CN':
    defaultPatterns = exports.DateIntervalPatterns_yue_Hans_CN;
    break;
  case 'yue_Hant':
  case 'yue-Hant':
    defaultPatterns = exports.DateIntervalPatterns_yue_Hant;
    break;
  case 'yue_Hant_HK':
  case 'yue-Hant-HK':
    defaultPatterns = exports.DateIntervalPatterns_yue_Hant_HK;
    break;
  case 'zgh':
    defaultPatterns = exports.DateIntervalPatterns_zgh;
    break;
  case 'zgh_MA':
  case 'zgh-MA':
    defaultPatterns = exports.DateIntervalPatterns_zgh_MA;
    break;
  case 'zh_Hans':
  case 'zh-Hans':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hans;
    break;
  case 'zh_Hans_CN':
  case 'zh-Hans-CN':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hans_CN;
    break;
  case 'zh_Hans_HK':
  case 'zh-Hans-HK':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hans_HK;
    break;
  case 'zh_Hans_MO':
  case 'zh-Hans-MO':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hans_MO;
    break;
  case 'zh_Hans_SG':
  case 'zh-Hans-SG':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hans_SG;
    break;
  case 'zh_Hant':
  case 'zh-Hant':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hant;
    break;
  case 'zh_Hant_HK':
  case 'zh-Hant-HK':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hant_HK;
    break;
  case 'zh_Hant_MO':
  case 'zh-Hant-MO':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hant_MO;
    break;
  case 'zh_Hant_TW':
  case 'zh-Hant-TW':
    defaultPatterns = exports.DateIntervalPatterns_zh_Hant_TW;
    break;
  case 'zu_ZA':
  case 'zu-ZA':
    defaultPatterns = exports.DateIntervalPatterns_zu_ZA;
    break;
}

if (defaultPatterns != null) {
  dateIntervalPatterns.setDateIntervalPatterns(defaultPatterns);
}
