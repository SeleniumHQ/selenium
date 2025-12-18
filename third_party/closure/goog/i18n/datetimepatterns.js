// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Extended date/time patterns.
 *
 * File generated from CLDR ver. 35
 *
 * To reduce the file size (which may cause issues in some JS
 * developing environments), this file will only contain locales
 * that are frequently used by web applications. This is defined as
 * proto/closure_locales_data.txt and will change (most likely addition)
 * over time.  Rest of the data can be found in another file named
 * "datetimepatternsext.js", which will be generated at
 * the same time together with this file.
 *
 * @suppress {const}
 */

// clang-format off

/**
 * Only locales that can be enumerated in ICU are supported. For the rest
 * of the locales, it will fallback to 'en'.
 * The code is designed to work with Closure compiler using
 * ADVANCED_OPTIMIZATIONS. We will continue to add popular date/time
 * patterns over time. There is no intention to cover all possible
 * usages. If simple pattern works fine, it won't be covered here either.
 * For example, pattern 'MMM' will work well to get short month name for
 * almost all locales thus won't be included here.
 */


goog.provide('goog.i18n.DateTimePatterns');
goog.provide('goog.i18n.DateTimePatterns_af');
goog.provide('goog.i18n.DateTimePatterns_am');
goog.provide('goog.i18n.DateTimePatterns_ar');
goog.provide('goog.i18n.DateTimePatterns_ar_DZ');
goog.provide('goog.i18n.DateTimePatterns_ar_EG');
goog.provide('goog.i18n.DateTimePatterns_az');
goog.provide('goog.i18n.DateTimePatterns_be');
goog.provide('goog.i18n.DateTimePatterns_bg');
goog.provide('goog.i18n.DateTimePatterns_bn');
goog.provide('goog.i18n.DateTimePatterns_br');
goog.provide('goog.i18n.DateTimePatterns_bs');
goog.provide('goog.i18n.DateTimePatterns_ca');
goog.provide('goog.i18n.DateTimePatterns_chr');
goog.provide('goog.i18n.DateTimePatterns_cs');
goog.provide('goog.i18n.DateTimePatterns_cy');
goog.provide('goog.i18n.DateTimePatterns_da');
goog.provide('goog.i18n.DateTimePatterns_de');
goog.provide('goog.i18n.DateTimePatterns_de_AT');
goog.provide('goog.i18n.DateTimePatterns_de_CH');
goog.provide('goog.i18n.DateTimePatterns_el');
goog.provide('goog.i18n.DateTimePatterns_en');
goog.provide('goog.i18n.DateTimePatterns_en_AU');
goog.provide('goog.i18n.DateTimePatterns_en_CA');
goog.provide('goog.i18n.DateTimePatterns_en_GB');
goog.provide('goog.i18n.DateTimePatterns_en_IE');
goog.provide('goog.i18n.DateTimePatterns_en_IN');
goog.provide('goog.i18n.DateTimePatterns_en_SG');
goog.provide('goog.i18n.DateTimePatterns_en_US');
goog.provide('goog.i18n.DateTimePatterns_en_ZA');
goog.provide('goog.i18n.DateTimePatterns_es');
goog.provide('goog.i18n.DateTimePatterns_es_419');
goog.provide('goog.i18n.DateTimePatterns_es_ES');
goog.provide('goog.i18n.DateTimePatterns_es_MX');
goog.provide('goog.i18n.DateTimePatterns_es_US');
goog.provide('goog.i18n.DateTimePatterns_et');
goog.provide('goog.i18n.DateTimePatterns_eu');
goog.provide('goog.i18n.DateTimePatterns_fa');
goog.provide('goog.i18n.DateTimePatterns_fi');
goog.provide('goog.i18n.DateTimePatterns_fil');
goog.provide('goog.i18n.DateTimePatterns_fr');
goog.provide('goog.i18n.DateTimePatterns_fr_CA');
goog.provide('goog.i18n.DateTimePatterns_ga');
goog.provide('goog.i18n.DateTimePatterns_gl');
goog.provide('goog.i18n.DateTimePatterns_gsw');
goog.provide('goog.i18n.DateTimePatterns_gu');
goog.provide('goog.i18n.DateTimePatterns_haw');
goog.provide('goog.i18n.DateTimePatterns_he');
goog.provide('goog.i18n.DateTimePatterns_hi');
goog.provide('goog.i18n.DateTimePatterns_hr');
goog.provide('goog.i18n.DateTimePatterns_hu');
goog.provide('goog.i18n.DateTimePatterns_hy');
goog.provide('goog.i18n.DateTimePatterns_id');
goog.provide('goog.i18n.DateTimePatterns_in');
goog.provide('goog.i18n.DateTimePatterns_is');
goog.provide('goog.i18n.DateTimePatterns_it');
goog.provide('goog.i18n.DateTimePatterns_iw');
goog.provide('goog.i18n.DateTimePatterns_ja');
goog.provide('goog.i18n.DateTimePatterns_ka');
goog.provide('goog.i18n.DateTimePatterns_kk');
goog.provide('goog.i18n.DateTimePatterns_km');
goog.provide('goog.i18n.DateTimePatterns_kn');
goog.provide('goog.i18n.DateTimePatterns_ko');
goog.provide('goog.i18n.DateTimePatterns_ky');
goog.provide('goog.i18n.DateTimePatterns_ln');
goog.provide('goog.i18n.DateTimePatterns_lo');
goog.provide('goog.i18n.DateTimePatterns_lt');
goog.provide('goog.i18n.DateTimePatterns_lv');
goog.provide('goog.i18n.DateTimePatterns_mk');
goog.provide('goog.i18n.DateTimePatterns_ml');
goog.provide('goog.i18n.DateTimePatterns_mn');
goog.provide('goog.i18n.DateTimePatterns_mo');
goog.provide('goog.i18n.DateTimePatterns_mr');
goog.provide('goog.i18n.DateTimePatterns_ms');
goog.provide('goog.i18n.DateTimePatterns_mt');
goog.provide('goog.i18n.DateTimePatterns_my');
goog.provide('goog.i18n.DateTimePatterns_nb');
goog.provide('goog.i18n.DateTimePatterns_ne');
goog.provide('goog.i18n.DateTimePatterns_nl');
goog.provide('goog.i18n.DateTimePatterns_no');
goog.provide('goog.i18n.DateTimePatterns_no_NO');
goog.provide('goog.i18n.DateTimePatterns_or');
goog.provide('goog.i18n.DateTimePatterns_pa');
goog.provide('goog.i18n.DateTimePatterns_pl');
goog.provide('goog.i18n.DateTimePatterns_pt');
goog.provide('goog.i18n.DateTimePatterns_pt_BR');
goog.provide('goog.i18n.DateTimePatterns_pt_PT');
goog.provide('goog.i18n.DateTimePatterns_ro');
goog.provide('goog.i18n.DateTimePatterns_ru');
goog.provide('goog.i18n.DateTimePatterns_sh');
goog.provide('goog.i18n.DateTimePatterns_si');
goog.provide('goog.i18n.DateTimePatterns_sk');
goog.provide('goog.i18n.DateTimePatterns_sl');
goog.provide('goog.i18n.DateTimePatterns_sq');
goog.provide('goog.i18n.DateTimePatterns_sr');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn');
goog.provide('goog.i18n.DateTimePatterns_sv');
goog.provide('goog.i18n.DateTimePatterns_sw');
goog.provide('goog.i18n.DateTimePatterns_ta');
goog.provide('goog.i18n.DateTimePatterns_te');
goog.provide('goog.i18n.DateTimePatterns_th');
goog.provide('goog.i18n.DateTimePatterns_tl');
goog.provide('goog.i18n.DateTimePatterns_tr');
goog.provide('goog.i18n.DateTimePatterns_uk');
goog.provide('goog.i18n.DateTimePatterns_ur');
goog.provide('goog.i18n.DateTimePatterns_uz');
goog.provide('goog.i18n.DateTimePatterns_vi');
goog.provide('goog.i18n.DateTimePatterns_zh');
goog.provide('goog.i18n.DateTimePatterns_zh_CN');
goog.provide('goog.i18n.DateTimePatterns_zh_HK');
goog.provide('goog.i18n.DateTimePatterns_zh_TW');
goog.provide('goog.i18n.DateTimePatterns_zu');


/**
 * Extended set of localized date/time patterns for locale af.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_af = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale am.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_am = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE፣ MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE፣ MMM d y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ar.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ar = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM‏/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/‏M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ar_DZ.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ar_DZ = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_EG.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ar_EG = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale az.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_az = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale be.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_be = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y \'г\'. G',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bg.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_bg = {
  YEAR_FULL: 'y \'г\'.',
  YEAR_FULL_WITH_ERA: 'y \'г\'. G',
  YEAR_MONTH_ABBR: 'MM.y \'г\'.',
  YEAR_MONTH_FULL: 'MMMM y \'г\'.',
  YEAR_MONTH_SHORT: 'MM.y \'г\'.',
  MONTH_DAY_ABBR: 'd.MM',
  MONTH_DAY_FULL: 'd MMMM',
  MONTH_DAY_SHORT: 'd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd.MM.y \'г\'.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d.MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d.MM.y \'г\'.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd.MM, HH:mm \'ч\'. zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bn.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_bn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale br.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_br = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bs.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_bs = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'MMM y.',
  YEAR_MONTH_FULL: 'LLLL y.',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y.',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale ca.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ca = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL \'de\' y',
  YEAR_MONTH_FULL: 'LLLL \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale chr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_chr = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale cs.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_cs = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd. M.',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd. M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. M. y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. M.',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. M. y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. M. H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale cy.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_cy = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale da.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_da = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale de.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_de = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale de_AT.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_de_AT = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale de_CH.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_de_CH = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale el.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_el = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_AU.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_AU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CA.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_CA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GB.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_GB = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_IE.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_IE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_IN.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_IN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SG.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_SG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_US.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_US = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_ZA.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_en_ZA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'MM/dd',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'dd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_es = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_419.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_es_419 = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_ES.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_es_ES = goog.i18n.DateTimePatterns_es;


/**
 * Extended set of localized date/time patterns for locale es_MX.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_es_MX = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d \'de\' MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_US.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_es_US = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d \'de\' MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale et.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_et = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale eu.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_eu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y(\'e\')\'ko\' MMMM',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fa.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_fa = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'd LLL',
  MONTH_DAY_FULL: 'dd LLLL',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'd LLLL',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d LLL',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd LLL،‏ HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale fi.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_fi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'M.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'ccc d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM \'klo\' H.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fil.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_fil = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_fr = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_CA.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_fr_CA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'M-d',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH \'h\' mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ga.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ga = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale gl.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_gl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d \'de\' MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'HH:mm zzzz, d \'de\' MMM'
};


/**
 * Extended set of localized date/time patterns for locale gsw.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_gsw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale gu.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_gu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale haw.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_haw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale he.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_he = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'M.y',
  MONTH_DAY_ABBR: 'd בMMM',
  MONTH_DAY_FULL: 'dd בMMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd בMMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd בMMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d בMMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d בMMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd בMMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale hi.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_hi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale hr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_hr = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'LLL y.',
  YEAR_MONTH_FULL: 'LLLL y.',
  YEAR_MONTH_SHORT: 'MM. y.',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'dd. MM.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y.',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale hu.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_hu = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'G y.',
  YEAR_MONTH_ABBR: 'y. MMM',
  YEAR_MONTH_FULL: 'y. MMMM',
  YEAR_MONTH_SHORT: 'y. MM.',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  MONTH_DAY_SHORT: 'M. d.',
  MONTH_DAY_MEDIUM: 'MMMM d.',
  MONTH_DAY_YEAR_MEDIUM: 'y. MMM d.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d., EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y. MMM d., EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d. HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale hy.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_hy = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y թ.',
  YEAR_MONTH_ABBR: 'y թ. LLL',
  YEAR_MONTH_FULL: 'y թ․ LLLL',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y թ.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y թ. MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale id.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_id = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale in.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_in = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale is.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_is = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM. y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, zzzz – HH:mm'
};


/**
 * Extended set of localized date/time patterns for locale it.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_it = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale iw.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_iw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'M.y',
  MONTH_DAY_ABBR: 'd בMMM',
  MONTH_DAY_FULL: 'dd בMMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd בMMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd בMMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d בMMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d בMMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd בMMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ja.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ja = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日(EEE)',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日(EEE)',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ka.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ka = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM. y',
  YEAR_MONTH_FULL: 'MMMM, y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM. y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM. y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kk.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_kk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y \'ж\'.',
  YEAR_MONTH_ABBR: 'y \'ж\'. MMM',
  YEAR_MONTH_FULL: 'y \'ж\'. MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y \'ж\'. d MMM',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y \'ж\'. d MMM, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale km.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_km = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kn.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_kn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d,y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ko.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ko = {
  YEAR_FULL: 'y년',
  YEAR_FULL_WITH_ERA: 'G y년',
  YEAR_MONTH_ABBR: 'y년 MMM',
  YEAR_MONTH_FULL: 'y년 MMMM',
  YEAR_MONTH_SHORT: 'y. M.',
  MONTH_DAY_ABBR: 'MMM d일',
  MONTH_DAY_FULL: 'MMMM dd일',
  MONTH_DAY_SHORT: 'M. d.',
  MONTH_DAY_MEDIUM: 'MMMM d일',
  MONTH_DAY_YEAR_MEDIUM: 'y년 MMM d일',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d일 (EEE)',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y년 MMM d일 (EEE)',
  DAY_ABBR: 'd일',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d일 a h:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ky.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ky = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y-\'ж\'.',
  YEAR_MONTH_ABBR: 'y-\'ж\'. MMM',
  YEAR_MONTH_FULL: 'y-\'ж\'., MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd-MMM',
  MONTH_DAY_FULL: 'dd-MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd-MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y-\'ж\'. d-MMM',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd-MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y-\'ж\'. d-MMM, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd-MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ln.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ln = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lo.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_lo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lt.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_lt = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y \'m\'. G',
  YEAR_MONTH_ABBR: 'y-MM',
  YEAR_MONTH_FULL: 'y \'m\'. LLLL',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MM-dd',
  MONTH_DAY_FULL: 'MMMM dd \'d\'.',
  MONTH_DAY_SHORT: 'MM-d',
  MONTH_DAY_MEDIUM: 'MMMM d \'d\'.',
  MONTH_DAY_YEAR_MEDIUM: 'y-MM-dd',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MM-dd, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y-MM-dd, EEE',
  DAY_ABBR: 'dd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MM-dd HH:mm; zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lv.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_lv = {
  YEAR_FULL: 'y. \'g\'.',
  YEAR_FULL_WITH_ERA: 'G y. \'g\'.',
  YEAR_MONTH_ABBR: 'y. \'g\'. MMM',
  YEAR_MONTH_FULL: 'y. \'g\'. MMMM',
  YEAR_MONTH_SHORT: 'MM.y.',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'dd.MM.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y. \'g\'. d. MMM',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, y. \'g\'. d. MMM',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mk.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_mk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y \'г\'.',
  YEAR_MONTH_FULL: 'MMMM y \'г\'.',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y \'г\'.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y \'г\'.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ml.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ml = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mn.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_mn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y \'оны\' MMM',
  YEAR_MONTH_FULL: 'y \'оны\' MMMM',
  YEAR_MONTH_SHORT: 'y MMMMM',
  MONTH_DAY_ABBR: 'MMM\'ын\' d',
  MONTH_DAY_FULL: 'MMMM\'ын\' dd',
  MONTH_DAY_SHORT: 'MMMMM/dd',
  MONTH_DAY_MEDIUM: 'MMMM\'ын\' d',
  MONTH_DAY_YEAR_MEDIUM: 'y \'оны\' MMM\'ын\' d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM\'ын\' d. EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y \'оны\' MMM\'ын\' d. EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM\'ын\' d HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale mo.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_mo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_mr = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d, MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ms.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ms = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd-M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mt.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_mt = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd \'ta\'’ MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'd \'ta\'’ MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'ta\'’ MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d \'ta\'’ MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'ta\'’ MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale my.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_my = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y၊ MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d၊ EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y၊ MMM d၊ EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM zzzz HH:mm'
};


/**
 * Extended set of localized date/time patterns for locale nb.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_nb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ne.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ne = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nl.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_nl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd-M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale no.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_no = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale no_NO.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_no_NO = goog.i18n.DateTimePatterns_no;


/**
 * Extended set of localized date/time patterns for locale or.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_or = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pa.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_pa = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pl.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_pl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_pt = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d \'de\' MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd \'de\' MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_BR.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_pt_BR = goog.i18n.DateTimePatterns_pt;


/**
 * Extended set of localized date/time patterns for locale pt_PT.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_pt_PT = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ro.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ro = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ru.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ru = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y \'г\'. G',
  YEAR_MONTH_ABBR: 'LLL y \'г\'.',
  YEAR_MONTH_FULL: 'LLLL y \'г\'.',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y \'г\'.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'ccc, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y \'г\'.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sh.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sh = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'MMM y.',
  YEAR_MONTH_FULL: 'MMMM y.',
  YEAR_MONTH_SHORT: 'MM.y.',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale si.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_si = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M-d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sk.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'M/y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd. M.',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd. M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. M. y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. M.',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. M. y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. M., H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sl.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd. M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sq.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a, zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sr = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'MMM y.',
  YEAR_MONTH_FULL: 'MMMM y.',
  YEAR_MONTH_SHORT: 'MM.y.',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sr_Latn.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sr_Latn = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sv.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sv = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sw.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_sw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ta.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ta = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, a h:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale te.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_te = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd, MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM, y, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale th.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_th = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM G y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tl.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_tl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tr.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_tr = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMMM EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale uk.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_uk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ur.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_ur = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM، y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM، y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale uz.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_uz = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM, y',
  YEAR_MONTH_FULL: 'MMMM, y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd-MMM',
  MONTH_DAY_FULL: 'dd-MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd-MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd-MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d-MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d-MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd-MMM, HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale vi.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_vi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'năm\' y',
  YEAR_MONTH_SHORT: '\'tháng\' MM, y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'HH:mm zzzz, d MMM'
};


/**
 * Extended set of localized date/time patterns for locale zh.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_zh = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale zh_CN.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_zh_CN = goog.i18n.DateTimePatterns_zh;


/**
 * Extended set of localized date/time patterns for locale zh_HK.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_zh_HK = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zh_TW.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_zh_TW = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日 EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日 EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zu.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns_zu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * @record
 * @struct
 */
goog.i18n.DateTimePatternsType = function() {};

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.YEAR_FULL;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.YEAR_FULL_WITH_ERA;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.YEAR_MONTH_ABBR;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.YEAR_MONTH_FULL;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.YEAR_MONTH_SHORT;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_ABBR;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_FULL;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_SHORT;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_MEDIUM;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_YEAR_MEDIUM;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.WEEKDAY_MONTH_DAY_MEDIUM;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.WEEKDAY_MONTH_DAY_YEAR_MEDIUM;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.DAY_ABBR;

/** @type {string} */
goog.i18n.DateTimePatternsType.prototype.MONTH_DAY_TIME_ZONE_SHORT;


/**
 * Select date/time pattern by locale.
 * @type {!goog.i18n.DateTimePatternsType}
 */
goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en;

switch (goog.LOCALE) {
  case 'af':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af;
    break;
  case 'am':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_am;
    break;
  case 'ar':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar;
    break;
  case 'ar_DZ':
  case 'ar-DZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_DZ;
    break;
  case 'ar_EG':
  case 'ar-EG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_EG;
    break;
  case 'az':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az;
    break;
  case 'be':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_be;
    break;
  case 'bg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bg;
    break;
  case 'bn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bn;
    break;
  case 'br':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_br;
    break;
  case 'bs':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bs;
    break;
  case 'ca':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca;
    break;
  case 'chr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_chr;
    break;
  case 'cs':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cs;
    break;
  case 'cy':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cy;
    break;
  case 'da':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_da;
    break;
  case 'de':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de;
    break;
  case 'de_AT':
  case 'de-AT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_AT;
    break;
  case 'de_CH':
  case 'de-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_CH;
    break;
  case 'el':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_el;
    break;
  case 'en':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en;
    break;
  case 'en_AU':
  case 'en-AU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AU;
    break;
  case 'en_CA':
  case 'en-CA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CA;
    break;
  case 'en_GB':
  case 'en-GB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GB;
    break;
  case 'en_IE':
  case 'en-IE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_IE;
    break;
  case 'en_IN':
  case 'en-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_IN;
    break;
  case 'en_SG':
  case 'en-SG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SG;
    break;
  case 'en_US':
  case 'en-US':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_US;
    break;
  case 'en_ZA':
  case 'en-ZA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_ZA;
    break;
  case 'es':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es;
    break;
  case 'es_419':
  case 'es-419':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_419;
    break;
  case 'es_ES':
  case 'es-ES':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_ES;
    break;
  case 'es_MX':
  case 'es-MX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_MX;
    break;
  case 'es_US':
  case 'es-US':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_US;
    break;
  case 'et':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_et;
    break;
  case 'eu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eu;
    break;
  case 'fa':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fa;
    break;
  case 'fi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fi;
    break;
  case 'fil':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fil;
    break;
  case 'fr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr;
    break;
  case 'fr_CA':
  case 'fr-CA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CA;
    break;
  case 'ga':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ga;
    break;
  case 'gl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gl;
    break;
  case 'gsw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gsw;
    break;
  case 'gu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gu;
    break;
  case 'haw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_haw;
    break;
  case 'he':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_he;
    break;
  case 'hi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hi;
    break;
  case 'hr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hr;
    break;
  case 'hu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hu;
    break;
  case 'hy':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hy;
    break;
  case 'id':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_id;
    break;
  case 'in':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_in;
    break;
  case 'is':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_is;
    break;
  case 'it':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it;
    break;
  case 'iw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_iw;
    break;
  case 'ja':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ja;
    break;
  case 'ka':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ka;
    break;
  case 'kk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kk;
    break;
  case 'km':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_km;
    break;
  case 'kn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kn;
    break;
  case 'ko':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ko;
    break;
  case 'ky':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ky;
    break;
  case 'ln':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ln;
    break;
  case 'lo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lo;
    break;
  case 'lt':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lt;
    break;
  case 'lv':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lv;
    break;
  case 'mk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mk;
    break;
  case 'ml':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ml;
    break;
  case 'mn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mn;
    break;
  case 'mo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mo;
    break;
  case 'mr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mr;
    break;
  case 'ms':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms;
    break;
  case 'mt':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mt;
    break;
  case 'my':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_my;
    break;
  case 'nb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nb;
    break;
  case 'ne':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne;
    break;
  case 'nl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl;
    break;
  case 'no':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_no;
    break;
  case 'no_NO':
  case 'no-NO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_no_NO;
    break;
  case 'or':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_or;
    break;
  case 'pa':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa;
    break;
  case 'pl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pl;
    break;
  case 'pt':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt;
    break;
  case 'pt_BR':
  case 'pt-BR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_BR;
    break;
  case 'pt_PT':
  case 'pt-PT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_PT;
    break;
  case 'ro':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ro;
    break;
  case 'ru':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru;
    break;
  case 'sh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sh;
    break;
  case 'si':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_si;
    break;
  case 'sk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sk;
    break;
  case 'sl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sl;
    break;
  case 'sq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sq;
    break;
  case 'sr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr;
    break;
  case 'sr_Latn':
  case 'sr-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn;
    break;
  case 'sv':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv;
    break;
  case 'sw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw;
    break;
  case 'ta':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta;
    break;
  case 'te':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_te;
    break;
  case 'th':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_th;
    break;
  case 'tl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tl;
    break;
  case 'tr':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tr;
    break;
  case 'uk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uk;
    break;
  case 'ur':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ur;
    break;
  case 'uz':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz;
    break;
  case 'vi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vi;
    break;
  case 'zh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh;
    break;
  case 'zh_CN':
  case 'zh-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_CN;
    break;
  case 'zh_HK':
  case 'zh-HK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_HK;
    break;
  case 'zh_TW':
  case 'zh-TW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_TW;
    break;
  case 'zu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zu;
    break;
}
