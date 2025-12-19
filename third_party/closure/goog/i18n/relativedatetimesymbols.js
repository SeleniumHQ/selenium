// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Relative date time formatting symbols.
 *
 * File generated from CLDR ver. 35.1
 *
 * To reduce the file size (which may cause issues in some JS
 * developing environments), this file will only contain locales
 * that are frequently used by web applications. This is defined as
 * proto/closure_locales_data.txt and will change (most likely addition)
 * over time.  Rest of the data can be found in another file named
 * "relativedatetimesymbolsext.js", which will be generated at
 * the same time together with this file.
 */

// clang-format off

goog.module('goog.i18n.relativeDateTimeSymbols');

/**
 * Collection of relative date time unit symbols for a locale.
 * @typedef {{
 *   YEAR:    RelativeDateTimeFormatStyles!,
 *   QUARTER: RelativeDateTimeFormatStyles!,
 *   MONTH:   RelativeDateTimeFormatStyles!,
 *   WEEK:    RelativeDateTimeFormatStyles!,
 *   DAY:     RelativeDateTimeFormatStyles!,
 *   HOUR:    RelativeDateTimeFormatStyles!,
 *   MINUTE:  RelativeDateTimeFormatStyles!,
 *   SECOND:  RelativeDateTimeFormatStyles!,
 * }}
 */
let RelativeDateTimeSymbols; /* The data for the locale */

/** @typedef {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols;

/**
 * Collection of date interval symbols for each relative unit.
 * @typedef {{
 *   LONG:   StyleElement!,
 *   SHORT:  (!StyleElement|undefined),
 *   NARROW: (!StyleElement|undefined),
 * }}
 */
let RelativeDateTimeFormatStyles;

/** @typedef {!RelativeDateTimeFormatStyles} */
exports.RelativeDateTimeFormatStyles;

/**
 * Collection of relative symbols for a given style.
 * Field names are single character to save space.
 * R: relative fields for named relative times, e.g., "yesteday", "vorgestern", "mañana"
 * F: plural format for future numeric differences, e.g., "in 3 days", "hace 3 horas"
 * P: plural format for past numeric differences, e.g., "3 seconds ago", "vor 17 Min."
 * @typedef {{
 *   R: RelativeDateTimeDirectionMap!,
 *   F: string,
 *   P: string,
 * }}
 */
let StyleElement;

/** @typedef {?StyleElement} */
exports.StyleElement;

/**
 * Map of direction options for RELATIVE data with integer keys.
 * @typedef {!Object<number, string>}
 */
let RelativeDateTimeDirectionMap;

/** @typedef {!RelativeDateTimeDirectionMap} */
exports.RelativeDateTimeDirectionMap;

/** @type {!RelativeDateTimeSymbols} */
let defaultSymbols;

/**
 * Returns the default RelativeDateTimeSymbols.
 * @return {!RelativeDateTimeSymbols}
 */
exports.getRelativeDateTimeSymbols = function() {
  return defaultSymbols;
};

/**
 * Sets the default RelativeDateTimeSymbols.
 * @param {!RelativeDateTimeSymbols} symbols
 */
exports.setRelativeDateTimeSymbols = function(symbols) {
  defaultSymbols = symbols;
};


/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_af =  {
  DAY: {
    LONG:{
      R:{'-1':'gister','-2':'eergister','0':'vandag','1':'môre','2':'oormôre'},
      P:'one{# dag gelede}other{# dae gelede}',
      F:'one{oor # dag}other{oor # dae}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'hierdie uur'},
      P:'one{# uur gelede}other{# uur gelede}',
      F:'one{oor # uur}other{oor # uur}',
    },
    SHORT:{
      R:{'0':'hierdie uur'},
      P:'one{# u. gelede}other{# u. gelede}',
      F:'one{oor # u.}other{oor # u.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'hierdie minuut'},
      P:'one{# minuut gelede}other{# minute gelede}',
      F:'one{oor # minuut}other{oor # minute}',
    },
    SHORT:{
      R:{'0':'hierdie minuut'},
      P:'one{# min. gelede}other{# min. gelede}',
      F:'one{oor # min.}other{oor # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'verlede maand','0':'vandeesmaand','1':'volgende maand'},
      P:'one{# maand gelede}other{# maande gelede}',
      F:'one{oor # maand}other{oor # maande}',
    },
    SHORT:{
      R:{'-1':'verlede maand','0':'vandeesmaand','1':'volgende maand'},
      P:'one{# md. gelede}other{# md. gelede}',
      F:'one{oor # md.}other{oor # md.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'verlede kwartaal','0':'hierdie kwartaal','1':'volgende kwartaal'},
      P:'one{# kwartaal gelede}other{# kwartale gelede}',
      F:'one{oor # kwartaal}other{oor # kwartale}',
    },
    SHORT:{
      R:{'-1':'verlede kwartaal','0':'hierdie kwartaal','1':'volgende kwartaal'},
      P:'one{# kw. gelede}other{# kw. gelede}',
      F:'one{oor # kw.}other{oor # kw.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nou'},
      P:'one{# sekonde gelede}other{# sekondes gelede}',
      F:'one{oor # sekonde}other{oor # sekondes}',
    },
    SHORT:{
      R:{'0':'nou'},
      P:'one{# s. gelede}other{# s. gelede}',
      F:'one{oor # s.}other{oor # s.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'verlede week','0':'hierdie week','1':'volgende week'},
      P:'one{# week gelede}other{# weke gelede}',
      F:'one{oor # week}other{oor # weke}',
    },
    SHORT:{
      R:{'-1':'verlede week','0':'hierdie week','1':'volgende week'},
      P:'one{# w. gelede}other{# w. gelede}',
      F:'one{oor # w.}other{oor # w.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'verlede jaar','0':'hierdie jaar','1':'volgende jaar'},
      P:'one{# jaar gelede}other{# jaar gelede}',
      F:'one{oor # jaar}other{oor # jaar}',
    },
    SHORT:{
      R:{'-1':'verlede jaar','0':'hierdie jaar','1':'volgende jaar'},
      P:'one{# j. gelede}other{# j. gelede}',
      F:'one{oor # j.}other{oor # j.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_am =  {
  DAY: {
    LONG:{
      R:{'-1':'ትናንት','-2':'ከትናንት ወዲያ','0':'ዛሬ','1':'ነገ','2':'ከነገ ወዲያ'},
      P:'one{ከ# ቀን በፊት}other{ከ# ቀናት በፊት}',
      F:'one{በ# ቀን ውስጥ}other{በ# ቀናት ውስጥ}',
    },
    SHORT:{
      R:{'-1':'ትላንትና','-2':'ከትናንት ወዲያ','0':'ዛሬ','1':'ነገ','2':'ከነገ ወዲያ'},
      P:'one{ከ # ቀን በፊት}other{ከ# ቀኖች በፊት}',
      F:'one{በ# ቀን ውስጥ}other{በ# ቀኖች ውስጥ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ይህ ሰዓት'},
      P:'one{ከ# ሰዓት በፊት}other{ከ# ሰዓቶች በፊት}',
      F:'one{በ# ሰዓት ውስጥ}other{በ# ሰዓቶች ውስጥ}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ይህ ደቂቃ'},
      P:'one{ከ# ደቂቃ በፊት}other{ከ# ደቂቃዎች በፊት}',
      F:'one{በ# ደቂቃ ውስጥ}other{በ# ደቂቃዎች ውስጥ}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ያለፈው ወር','0':'በዚህ ወር','1':'የሚቀጥለው ወር'},
      P:'one{ከ# ወር በፊት}other{ከ# ወራት በፊት}',
      F:'one{በ# ወር ውስጥ}other{በ# ወራት ውስጥ}',
    },
    SHORT:{
      R:{'-1':'ያለፈው ወር','0':'በዚህ ወር','1':'የሚቀጥለው ወር'},
      P:'one{ከ# ወራት በፊት}other{ከ# ወራት በፊት}',
      F:'one{በ# ወራት ውስጥ}other{በ# ወራት ውስጥ}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'የመጨረሻው ሩብ','0':'ይህ ሩብ','1':'የሚቀጥለው ሩብ'},
      P:'one{# ሩብ በፊት}other{# ሩብ በፊት}',
      F:'one{+# ሩብ}other{+# ሩብ}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'አሁን'},
      P:'one{ከ# ሰከንድ በፊት}other{ከ# ሰከንዶች በፊት}',
      F:'one{በ# ሰከንድ ውስጥ}other{በ# ሰከንዶች ውስጥ}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ያለፈው ሳምንት','0':'በዚህ ሳምንት','1':'የሚቀጥለው ሳምንት'},
      P:'one{ከ# ሳምንት በፊት}other{ከ# ሳምንታት በፊት}',
      F:'one{በ# ሳምንት ውስጥ}other{በ# ሳምንታት ውስጥ}',
    },
    SHORT:{
      R:{'-1':'ባለፈው ሳምንት','0':'በዚህ ሣምንት','1':'የሚቀጥለው ሳምንት'},
      P:'one{ከ# ሳምንታት በፊት}other{ከ# ሳምንታት በፊት}',
      F:'one{በ# ሳምንታት ውስጥ}other{በ# ሳምንታት ውስጥ}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ያለፈው ዓመት','0':'በዚህ ዓመት','1':'የሚቀጥለው ዓመት'},
      P:'one{ከ# ዓመት በፊት}other{ከ# ዓመታት በፊት}',
      F:'one{በ# ዓመታት ውስጥ}other{በ# ዓመታት ውስጥ}',
    },
    SHORT:{
      R:{'-1':'ያለፈው ዓመት','0':'በዚህ ዓመት','1':'የሚቀጥለው ዓመት'},
      P:'one{ከ# ዓመታት በፊት}other{ከ# ዓመታት በፊት}',
      F:'one{በ# ዓመታት ውስጥ}other{በ# ዓመታት ውስጥ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ar =  {
  DAY: {
    LONG:{
      R:{'-1':'أمس','-2':'أول أمس','0':'اليوم','1':'غدًا','2':'بعد الغد'},
      P:'few{قبل # أيام}many{قبل # يومًا}one{قبل يوم واحد}other{قبل # يوم}two{قبل يومين}zero{قبل # يوم}',
      F:'few{خلال # أيام}many{خلال # يومًا}one{خلال يوم واحد}other{خلال # يوم}two{خلال يومين}zero{خلال # يوم}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'الساعة الحالية'},
      P:'few{قبل # ساعات}many{قبل # ساعة}one{قبل ساعة واحدة}other{قبل # ساعة}two{قبل ساعتين}zero{قبل # ساعة}',
      F:'few{خلال # ساعات}many{خلال # ساعة}one{خلال ساعة واحدة}other{خلال # ساعة}two{خلال ساعتين}zero{خلال # ساعة}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'هذه الدقيقة'},
      P:'few{قبل # دقائق}many{قبل # دقيقة}one{قبل دقيقة واحدة}other{قبل # دقيقة}two{قبل دقيقتين}zero{قبل # دقيقة}',
      F:'few{خلال # دقائق}many{خلال # دقيقة}one{خلال دقيقة واحدة}other{خلال # دقيقة}two{خلال دقيقتين}zero{خلال # دقيقة}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'الشهر الماضي','0':'هذا الشهر','1':'الشهر القادم'},
      P:'few{قبل # أشهر}many{قبل # شهرًا}one{قبل شهر واحد}other{قبل # شهر}two{قبل شهرين}zero{قبل # شهر}',
      F:'few{خلال # أشهر}many{خلال # شهرًا}one{خلال شهر واحد}other{خلال # شهر}two{خلال شهرين}zero{خلال # شهر}',
    },
    SHORT:{
      R:{'-1':'الشهر الماضي','0':'هذا الشهر','1':'الشهر القادم'},
      P:'few{خلال # أشهر}many{قبل # شهرًا}one{قبل شهر واحد}other{قبل # شهر}two{قبل شهرين}zero{قبل # شهر}',
      F:'few{خلال # أشهر}many{خلال # شهرًا}one{خلال شهر واحد}other{خلال # شهر}two{خلال شهرين}zero{خلال # شهر}',
    },
    NARROW:{
      R:{'-1':'الشهر الماضي','0':'هذا الشهر','1':'الشهر القادم'},
      P:'few{قبل # أشهر}many{قبل # شهرًا}one{قبل شهر واحد}other{قبل # شهر}two{قبل شهرين}zero{قبل # شهر}',
      F:'few{خلال # أشهر}many{خلال # شهرًا}one{خلال شهر واحد}other{خلال # شهر}two{خلال شهرين}zero{خلال # شهر}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'الربع الأخير','0':'هذا الربع','1':'الربع القادم'},
      P:'few{قبل # أرباع سنة}many{قبل # ربع سنة}one{قبل ربع سنة واحد}other{قبل # ربع سنة}two{قبل ربعي سنة}zero{قبل # ربع سنة}',
      F:'few{خلال # أرباع سنة}many{خلال # ربع سنة}one{خلال ربع سنة واحد}other{خلال # ربع سنة}two{خلال ربعي سنة}zero{خلال # ربع سنة}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'الآن'},
      P:'few{قبل # ثوانِ}many{قبل # ثانية}one{قبل ثانية واحدة}other{قبل # ثانية}two{قبل ثانيتين}zero{قبل # ثانية}',
      F:'few{خلال # ثوانٍ}many{خلال # ثانية}one{خلال ثانية واحدة}other{خلال # ثانية}two{خلال ثانيتين}zero{خلال # ثانية}',
    },
    SHORT:{
      R:{'0':'الآن'},
      P:'few{قبل # ثوانٍ}many{قبل # ثانية}one{قبل ثانية واحدة}other{قبل # ثانية}two{قبل ثانيتين}zero{قبل # ثانية}',
      F:'few{خلال # ثوانٍ}many{خلال # ثانية}one{خلال ثانية واحدة}other{خلال # ثانية}two{خلال ثانيتين}zero{خلال # ثانية}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'الأسبوع الماضي','0':'هذا الأسبوع','1':'الأسبوع القادم'},
      P:'few{قبل # أسابيع}many{قبل # أسبوعًا}one{قبل أسبوع واحد}other{قبل # أسبوع}two{قبل أسبوعين}zero{قبل # أسبوع}',
      F:'few{خلال # أسابيع}many{خلال # أسبوعًا}one{خلال أسبوع واحد}other{خلال # أسبوع}two{خلال أسبوعين}zero{خلال # أسبوع}',
    },
    SHORT:{
      R:{'-1':'الأسبوع الماضي','0':'هذا الأسبوع','1':'الأسبوع القادم'},
      P:'few{قبل # أسابيع}many{قبل # أسبوعًا}one{قبل أسبوع واحد}other{قبل # أسبوع}two{قبل أسبوعين}zero{قبل # أسبوع}',
      F:'few{خلال # أسابيع}many{خلال # أسبوعًا}one{خلال أسبوع واحد}other{خلال # أسبوع}two{خلال # أسبوعين}zero{خلال # أسبوع}',
    },
    NARROW:{
      R:{'-1':'الأسبوع الماضي','0':'هذا الأسبوع','1':'الأسبوع القادم'},
      P:'few{قبل # أسابيع}many{قبل # أسبوعًا}one{قبل أسبوع واحد}other{قبل # أسبوع}two{قبل أسبوعين}zero{قبل # أسبوع}',
      F:'few{خلال # أسابيع}many{خلال # أسبوعًا}one{خلال أسبوع واحد}other{خلال # أسبوع}two{خلال أسبوعين}zero{خلال # أسبوع}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'السنة الماضية','0':'السنة الحالية','1':'السنة القادمة'},
      P:'few{قبل # سنوات}many{قبل # سنة}one{قبل سنة واحدة}other{قبل # سنة}two{قبل سنتين}zero{قبل # سنة}',
      F:'few{خلال # سنوات}many{خلال # سنة}one{خلال سنة واحدة}other{خلال # سنة}two{خلال سنتين}zero{خلال # سنة}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ar_DZ = exports.RelativeDateTimeSymbols_ar;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ar_EG = exports.RelativeDateTimeSymbols_ar;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_az =  {
  DAY: {
    LONG:{
      R:{'-1':'dünən','0':'bu gün','1':'sabah'},
      P:'one{# gün öncə}other{# gün öncə}',
      F:'one{# gün ərzində}other{# gün ərzində}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'bu saat'},
      P:'one{# saat öncə}other{# saat öncə}',
      F:'one{# saat ərzində}other{# saat ərzində}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'bu dəqiqə'},
      P:'one{# dəqiqə öncə}other{# dəqiqə öncə}',
      F:'one{# dəqiqə ərzində}other{# dəqiqə ərzində}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'keçən ay','0':'bu ay','1':'gələn ay'},
      P:'one{# ay öncə}other{# ay öncə}',
      F:'one{# ay ərzində}other{# ay ərzində}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'keçən rüb','0':'bu rüb','1':'gələn rüb'},
      P:'one{# rüb öncə}other{# rüb öncə}',
      F:'one{# rüb ərzində}other{# rüb ərzində}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'indi'},
      P:'one{# saniyə öncə}other{# saniyə öncə}',
      F:'one{# saniyə ərzində}other{# saniyə ərzində}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'keçən həftə','0':'bu həftə','1':'gələn həftə'},
      P:'one{# həftə öncə}other{# həftə öncə}',
      F:'one{# həftə ərzində}other{# həftə ərzində}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'keçən il','0':'bu il','1':'gələn il'},
      P:'one{# il öncə}other{# il öncə}',
      F:'one{# il ərzində}other{# il ərzində}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_be =  {
  DAY: {
    LONG:{
      R:{'-1':'учора','-2':'пазаўчора','0':'сёння','1':'заўтра','2':'паслязаўтра'},
      P:'few{# дні таму}many{# дзён таму}one{# дзень таму}other{# дня таму}',
      F:'few{праз # дні}many{праз # дзён}one{праз # дзень}other{праз # дня}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'у гэту гадзіну'},
      P:'few{# гадзіны таму}many{# гадзін таму}one{# гадзіну таму}other{# гадзіны таму}',
      F:'few{праз # гадзіны}many{праз # гадзін}one{праз # гадзіну}other{праз # гадзіны}',
    },
    SHORT:{
      R:{'0':'у гэту гадзіну'},
      P:'few{# гадз таму}many{# гадз таму}one{# гадз таму}other{# гадз таму}',
      F:'few{праз # гадз}many{праз # гадз}one{праз # гадз}other{праз # гадз}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'у гэту хвіліну'},
      P:'few{# хвіліны таму}many{# хвілін таму}one{# хвіліну таму}other{# хвіліны таму}',
      F:'few{праз # хвіліны}many{праз # хвілін}one{праз # хвіліну}other{праз # хвіліны}',
    },
    SHORT:{
      R:{'0':'у гэту хвіліну'},
      P:'few{# хв таму}many{# хв таму}one{# хв таму}other{# хв таму}',
      F:'few{праз # хв}many{праз # хв}one{праз # хв}other{праз # хв}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'у мінулым месяцы','0':'у гэтым месяцы','1':'у наступным месяцы'},
      P:'few{# месяцы таму}many{# месяцаў таму}one{# месяц таму}other{# месяца таму}',
      F:'few{праз # месяцы}many{праз # месяцаў}one{праз # месяц}other{праз # месяца}',
    },
    SHORT:{
      R:{'-1':'у мінулым месяцы','0':'у гэтым месяцы','1':'у наступным месяцы'},
      P:'few{# мес. таму}many{# мес. таму}one{# мес. таму}other{# мес. таму}',
      F:'few{праз # мес.}many{праз # мес.}one{праз # мес.}other{праз # мес.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'у мінулым квартале','0':'у гэтым квартале','1':'у наступным квартале'},
      P:'few{# кварталы таму}many{# кварталаў таму}one{# квартал таму}other{# квартала таму}',
      F:'few{праз # кварталы}many{праз # кварталаў}one{праз # квартал}other{праз # квартала}',
    },
    SHORT:{
      R:{'-1':'у мінулым квартале','0':'у гэтым квартале','1':'у наступным квартале'},
      P:'few{# кв. таму}many{# кв. таму}one{# кв. таму}other{# кв. таму}',
      F:'few{праз # кв.}many{праз # кв.}one{праз # кв.}other{праз # кв.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'цяпер'},
      P:'few{# секунды таму}many{# секунд таму}one{# секунду таму}other{# секунды таму}',
      F:'few{праз # секунды}many{праз # секунд}one{праз # секунду}other{праз # секунды}',
    },
    SHORT:{
      R:{'0':'цяпер'},
      P:'few{# с таму}many{# с таму}one{# с таму}other{# с таму}',
      F:'few{праз # с}many{праз # с}one{праз # с}other{праз # с}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'на мінулым тыдні','0':'на гэтым тыдні','1':'на наступным тыдні'},
      P:'few{# тыдні таму}many{# тыдняў таму}one{# тыдзень таму}other{# тыдня таму}',
      F:'few{праз # тыдні}many{праз # тыдняў}one{праз # тыдзень}other{праз # тыдня}',
    },
    SHORT:{
      R:{'-1':'на мінулым тыдні','0':'на гэтым тыдні','1':'на наступным тыдні'},
      P:'few{# тыд таму}many{# тыд таму}one{# тыд таму}other{# тыд таму}',
      F:'few{праз # тыд}many{праз # тыд}one{праз # тыд}other{праз # тыд}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'у мінулым годзе','0':'у гэтым годзе','1':'у наступным годзе'},
      P:'few{# гады таму}many{# гадоў таму}one{# год таму}other{# года таму}',
      F:'few{праз # гады}many{праз # гадоў}one{праз # год}other{праз # года}',
    },
    SHORT:{
      R:{'-1':'у мінулым годзе','0':'у гэтым годзе','1':'у наступным годзе'},
      P:'few{# г. таму}many{# г. таму}one{# г. таму}other{# г. таму}',
      F:'few{праз # г.}many{праз # г.}one{праз # г.}other{праз # г.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_bg =  {
  DAY: {
    LONG:{
      R:{'-1':'вчера','-2':'онзи ден','0':'днес','1':'утре','2':'вдругиден'},
      P:'one{преди # ден}other{преди # дни}',
      F:'one{след # ден}other{след # дни}',
    },
    NARROW:{
      R:{'-1':'вчера','-2':'онзи ден','0':'днес','1':'утре','2':'вдругиден'},
      P:'one{пр. # д}other{пр. # д}',
      F:'one{сл. # д}other{сл. # д}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'в този час'},
      P:'one{преди # час}other{преди # часа}',
      F:'one{след # час}other{след # часа}',
    },
    SHORT:{
      R:{'0':'в този час'},
      P:'one{преди # ч}other{преди # ч}',
      F:'one{след # ч}other{след # ч}',
    },
    NARROW:{
      R:{'0':'в този час'},
      P:'one{пр. # ч}other{пр. # ч}',
      F:'one{сл. # ч}other{сл. # ч}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'в тази минута'},
      P:'one{преди # минута}other{преди # минути}',
      F:'one{след # минута}other{след # минути}',
    },
    SHORT:{
      R:{'0':'в тази минута'},
      P:'one{преди # мин}other{преди # мин}',
      F:'one{след # мин}other{след # мин}',
    },
    NARROW:{
      R:{'0':'в тази минута'},
      P:'one{пр. # мин}other{пр. # мин}',
      F:'one{сл. # мин}other{сл. # мин}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'предходен месец','0':'този месец','1':'следващ месец'},
      P:'one{преди # месец}other{преди # месеца}',
      F:'one{след # месец}other{след # месеца}',
    },
    SHORT:{
      R:{'-1':'мин. мес.','0':'този мес.','1':'следв. мес.'},
      P:'one{преди # м.}other{преди # м.}',
      F:'one{след # м.}other{след # м.}',
    },
    NARROW:{
      R:{'-1':'мин. м.','0':'т. м.','1':'сл. м.'},
      P:'one{пр. # м.}other{пр. # м.}',
      F:'one{сл. # м.}other{сл. # м.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'предходно тримесечие','0':'това тримесечие','1':'следващо тримесечие'},
      P:'one{преди # тримесечие}other{преди # тримесечия}',
      F:'one{след # тримесечие}other{след # тримесечия}',
    },
    SHORT:{
      R:{'-1':'мин. трим.','0':'това трим.','1':'следв. трим.'},
      P:'one{преди # трим.}other{преди # трим.}',
      F:'one{след # трим.}other{след # трим.}',
    },
    NARROW:{
      R:{'-1':'мин. трим.','0':'това трим.','1':'следв. трим.'},
      P:'one{пр. # трим.}other{пр. # трим.}',
      F:'one{сл. # трим.}other{сл. # трим.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'сега'},
      P:'one{преди # секунда}other{преди # секунди}',
      F:'one{след # секунда}other{след # секунди}',
    },
    SHORT:{
      R:{'0':'сега'},
      P:'one{преди # сек}other{преди # сек}',
      F:'one{след # сек}other{след # сек}',
    },
    NARROW:{
      R:{'0':'сега'},
      P:'one{пр. # сек}other{пр. # сек}',
      F:'one{сл. # сек}other{сл. # сек}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'предходната седмица','0':'тази седмица','1':'следващата седмица'},
      P:'one{преди # седмица}other{преди # седмици}',
      F:'one{след # седмица}other{след # седмици}',
    },
    SHORT:{
      R:{'-1':'миналата седмица','0':'тази седм.','1':'следв. седм.'},
      P:'one{преди # седм.}other{преди # седм.}',
      F:'one{след # седм.}other{след # седм.}',
    },
    NARROW:{
      R:{'-1':'мин. седм.','0':'тази седм.','1':'сл. седм.'},
      P:'one{пр. # седм.}other{пр. # седм.}',
      F:'one{сл. # седм.}other{сл. # седм.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'миналата година','0':'тази година','1':'следващата година'},
      P:'one{преди # година}other{преди # години}',
      F:'one{след # година}other{след # години}',
    },
    SHORT:{
      R:{'-1':'мин. г.','0':'т. г.','1':'следв. г.'},
      P:'one{преди # г.}other{преди # г.}',
      F:'one{след # г.}other{след # г.}',
    },
    NARROW:{
      R:{'-1':'мин. г.','0':'т. г.','1':'сл. г.'},
      P:'one{пр. # г.}other{пр. # г.}',
      F:'one{сл. # г.}other{сл. # г.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_bn =  {
  DAY: {
    LONG:{
      R:{'-1':'গতকাল','-2':'গত পরশু','0':'আজ','1':'আগামীকাল','2':'আগামী পরশু'},
      P:'one{# দিন আগে}other{# দিন আগে}',
      F:'one{# দিনের মধ্যে}other{# দিনের মধ্যে}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'এই ঘণ্টায়'},
      P:'one{# ঘন্টা আগে}other{# ঘন্টা আগে}',
      F:'one{# ঘন্টায়}other{# ঘন্টায়}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'এই মিনিট'},
      P:'one{# মিনিট আগে}other{# মিনিট আগে}',
      F:'one{# মিনিটে}other{# মিনিটে}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'গত মাস','0':'এই মাস','1':'পরের মাস'},
      P:'one{# মাস আগে}other{# মাস আগে}',
      F:'one{# মাসে}other{# মাসে}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'গত ত্রৈমাসিক','0':'এই ত্রৈমাসিক','1':'পরের ত্রৈমাসিক'},
      P:'one{# ত্রৈমাসিক আগে}other{# ত্রৈমাসিক আগে}',
      F:'one{# ত্রৈমাসিকে}other{# ত্রৈমাসিকে}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'এখন'},
      P:'one{# সেকেন্ড পূর্বে}other{# সেকেন্ড পূর্বে}',
      F:'one{# সেকেন্ডে}other{# সেকেন্ডে}',
    },
    NARROW:{
      R:{'0':'এখন'},
      P:'one{# সেকেন্ড আগে}other{# সেকেন্ড আগে}',
      F:'one{# সেকেন্ডে}other{# সেকেন্ডে}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'গত সপ্তাহ','0':'এই সপ্তাহ','1':'পরের সপ্তাহ'},
      P:'one{# সপ্তাহ আগে}other{# সপ্তাহ আগে}',
      F:'one{# সপ্তাহে}other{# সপ্তাহে}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'গত বছর','0':'এই বছর','1':'পরের বছর'},
      P:'one{# বছর পূর্বে}other{# বছর পূর্বে}',
      F:'one{# বছরে}other{# বছরে}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_br =  {
  DAY: {
    LONG:{
      R:{'-1':'decʼh','-2':'dercʼhent-decʼh','0':'hiziv','1':'warcʼhoazh'},
      P:'few{# deiz zo}many{# a zeizioù zo}one{# deiz zo}other{# deiz zo}two{# zeiz zo}',
      F:'few{a-benn # deiz}many{a-benn # a zeizioù}one{a-benn # deiz}other{a-benn # deiz}two{a-benn # zeiz}',
    },
    SHORT:{
      R:{'-1':'decʼh','-2':'dercʼhent-decʼh','0':'hiziv','1':'warcʼhoazh'},
      P:'few{# d zo}many{# d zo}one{# d zo}other{# d zo}two{# d zo}',
      F:'few{a-benn # d}many{a-benn # d}one{a-benn # d}other{a-benn # d}two{a-benn # d}',
    },
    NARROW:{
      R:{'-1':'decʼh','-2':'dercʼhent-decʼh','0':'hiziv','1':'warcʼhoazh'},
      P:'few{-# d}many{-# d}one{-# d}other{-# d}two{-# d}',
      F:'few{+# d}many{+# d}one{+# d}other{+# d}two{+# d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'dʼan eur-mañ'},
      P:'few{# eur zo}many{# a eurioù zo}one{# eur zo}other{# eur zo}two{# eur zo}',
      F:'few{a-benn # eur}many{a-benn # a eurioù}one{a-benn # eur}other{a-benn # eur}two{a-benn # eur}',
    },
    SHORT:{
      R:{'0':'dʼan eur-mañ'},
      P:'few{# e zo}many{# e zo}one{# e zo}other{# e zo}two{# e zo}',
      F:'few{a-benn # e}many{a-benn # e}one{a-benn # e}other{a-benn # e}two{a-benn # e}',
    },
    NARROW:{
      R:{'0':'dʼan eur-mañ'},
      P:'few{-# h}many{-# h}one{-# h}other{-# h}two{-# h}',
      F:'few{+# h}many{+# h}one{+# h}other{+# h}two{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'few{# munut zo}many{# a vunutoù zo}one{# munut zo}other{# munut zo}two{# vunut zo}',
      F:'few{a-benn # munut}many{a-benn # a vunutoù}one{a-benn # munut}other{a-benn # munut}two{a-benn # vunut}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'few{# min zo}many{# min zo}one{# min zo}other{# min zo}two{# min zo}',
      F:'few{a-benn # min}many{a-benn # min}one{a-benn # min}other{a-benn # min}two{a-benn # min}',
    },
    NARROW:{
      R:{'0':'this minute'},
      P:'few{-# min}many{-# min}one{-# min}other{-# min}two{-# min}',
      F:'few{+# min}many{+# min}one{+# min}other{+# min}two{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ar miz diaraok','0':'ar miz-mañ','1':'ar miz a zeu'},
      P:'few{# miz zo}many{# a vizioù zo}one{# miz zo}other{# miz zo}two{# viz zo}',
      F:'few{a-benn # miz}many{a-benn # a vizioù}one{a-benn # miz}other{a-benn # miz}two{a-benn # viz}',
    },
    NARROW:{
      R:{'-1':'ar miz diaraok','0':'ar miz-mañ','1':'ar miz a zeu'},
      P:'few{-# miz}many{-# miz}one{-# miz}other{-# miz}two{-# miz}',
      F:'few{+# miz}many{+# miz}one{+# miz}other{+# miz}two{+# miz}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'an trimiziad diaraok','0':'an trimiziad-mañ','1':'an trimiziad a zeu'},
      P:'few{# zrimiziad zo}many{# a zrimiziadoù zo}one{# trimiziad zo}other{# trimiziad zo}two{# drimiziad zo}',
      F:'few{a-benn # zrimiziad}many{a-benn # a drimiziadoù}one{a-benn # trimiziad}other{a-benn # trimiziad}two{a-benn # drimiziad}',
    },
    SHORT:{
      R:{'-1':'an trim. diaraok','0':'an trim.-mañ','1':'an trim. a zeu'},
      P:'few{# trim. zo}many{# trim. zo}one{# trim. zo}other{# trim. zo}two{# trim. zo}',
      F:'few{a-benn # trim.}many{a-benn # trim.}one{a-benn # trim.}other{a-benn # trim.}two{a-benn # trim.}',
    },
    NARROW:{
      R:{'-1':'an trim. diaraok','0':'an trim.-mañ','1':'an trim. a zeu'},
      P:'few{-# trim.}many{-# trim.}one{-# trim.}other{-# trim.}two{-# trim.}',
      F:'few{+# trim.}many{+# trim.}one{+# trim.}other{+# trim.}two{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'bremañ'},
      P:'few{# eilenn zo}many{# eilenn zo}one{# eilenn zo}other{# eilenn zo}two{# eilenn zo}',
      F:'few{a-benn # eilenn}many{a-benn # a eilennoù}one{a-benn # eilenn}other{a-benn # eilenn}two{a-benn # eilenn}',
    },
    SHORT:{
      R:{'0':'brem.'},
      P:'few{# s zo}many{# s zo}one{# s zo}other{# s zo}two{# s zo}',
      F:'few{a-benn # s}many{a-benn # s}one{a-benn # s}other{a-benn # s}two{a-benn # s}',
    },
    NARROW:{
      R:{'0':'brem.'},
      P:'few{-# s}many{-# s}one{-# s}other{-# s}two{-# s}',
      F:'few{+# s}many{+# s}one{+# s}other{+# s}two{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ar sizhun diaraok','0':'ar sizhun-mañ','1':'ar sizhun a zeu'},
      P:'few{# sizhun zo}many{# a sizhunioù zo}one{# sizhun zo}other{# sizhun zo}two{# sizhun zo}',
      F:'few{a-benn # sizhun}many{a-benn # a sizhunioù}one{a-benn # sizhun}other{a-benn # sizhun}two{a-benn # sizhun}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'warlene','0':'hevlene','1':'ar bloaz a zeu'},
      P:'few{# bloaz zo}many{# a vloazioù zo}one{# bloaz zo}other{# vloaz zo}two{# vloaz zo}',
      F:'few{a-benn # bloaz}many{a-benn # a vloazioù}one{a-benn # bloaz}other{a-benn # vloaz}two{a-benn # vloaz}',
    },
    SHORT:{
      R:{'-1':'warlene','0':'hevlene','1':'ar bl. a zeu'},
      P:'few{# bl. zo}many{# bl. zo}one{# bl. zo}other{# bl. zo}two{# bl. zo}',
      F:'few{a-benn # bl.}many{a-benn # bl.}one{a-benn # bl.}other{a-benn # bl.}two{a-benn # bl.}',
    },
    NARROW:{
      R:{'-1':'warlene','0':'hevlene','1':'ar bl. a zeu'},
      P:'few{-# bl.}many{-# bl.}one{-# bl.}other{-# bl.}two{-# bl.}',
      F:'few{+# bl.}many{+# bl.}one{+# bl.}other{+# bl.}two{+# bl.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_bs =  {
  DAY: {
    LONG:{
      R:{'-1':'jučer','-2':'prekjučer','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{prije # dana}one{prije # dan}other{prije # dana}',
      F:'few{za # dana}one{za # dan}other{za # dana}',
    },
    SHORT:{
      R:{'-1':'jučer','-2':'prekjučer','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{prije # d.}one{prije # d.}other{prije # d.}',
      F:'few{za # d.}one{za # d.}other{za # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ovaj sat'},
      P:'few{prije # sata}one{prije # sat}other{prije # sati}',
      F:'few{za # sata}one{za # sat}other{za # sati}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ova minuta'},
      P:'few{prije # minute}one{prije # minutu}other{prije # minuta}',
      F:'few{za # minute}one{za # minutu}other{za # minuta}',
    },
    SHORT:{
      R:{'0':'ova minuta'},
      P:'few{prije # min.}one{prije # min.}other{prije # min.}',
      F:'few{za # min.}one{za # min.}other{za # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'prošli mjesec','0':'ovaj mjesec','1':'sljedeći mjesec'},
      P:'few{prije # mjeseca}one{prije # mjesec}other{prije # mjeseci}',
      F:'few{za # mjeseca}one{za # mjesec}other{za # mjeseci}',
    },
    SHORT:{
      R:{'-1':'prošli mjesec','0':'ovaj mjesec','1':'sljedeći mjesec'},
      P:'few{prije # mj.}one{prije # mj.}other{prije # mj.}',
      F:'few{za # mj.}one{za # mj.}other{za # mj.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'posljednji kvartal','0':'ovaj kvartal','1':'sljedeći kvartal'},
      P:'few{prije # kvartala}one{prije # kvartal}other{prije # kvartala}',
      F:'few{za # kvartala}one{za # kvartal}other{za # kvartala}',
    },
    SHORT:{
      R:{'-1':'posljednji kvartal','0':'ovaj kvartal','1':'sljedeći kvartal'},
      P:'few{prije # kv.}one{prije # kv.}other{prije # kv.}',
      F:'few{za # kv.}one{za # kv.}other{za # kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sada'},
      P:'few{prije # sekunde}one{prije # sekundu}other{prije # sekundi}',
      F:'few{za # sekunde}one{za # sekundu}other{za # sekundi}',
    },
    SHORT:{
      R:{'0':'sada'},
      P:'few{prije # sek.}one{prije # sek.}other{prije # sek.}',
      F:'few{za # sek.}one{za # sek.}other{za # sek.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'prošle sedmice','0':'ove sedmice','1':'sljedeće sedmice'},
      P:'few{prije # sedmice}one{prije # sedmicu}other{prije # sedmica}',
      F:'few{za # sedmice}one{za # sedmicu}other{za # sedmica}',
    },
    SHORT:{
      R:{'-1':'prošle sedmice','0':'ove sedmice','1':'sljedeće sedmice'},
      P:'few{prije # sed.}one{prije # sed.}other{prije # sed.}',
      F:'few{za # sed.}one{za # sed.}other{za # sed.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sljedeće godine'},
      P:'few{prije # godine}one{prije # godinu}other{prije # godina}',
      F:'few{za # godine}one{za # godinu}other{za # godina}',
    },
    SHORT:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sljedeće godine'},
      P:'few{prije # god.}one{prije # god.}other{prije # god.}',
      F:'few{za # god.}one{za # god.}other{za # god.}',
    },
    NARROW:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sljedeće godine'},
      P:'few{prije # g.}one{prije # g.}other{prije # g.}',
      F:'few{za # g.}one{za # g.}other{za # g.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ca =  {
  DAY: {
    LONG:{
      R:{'-1':'ahir','-2':'abans-d’ahir','0':'avui','1':'demà','2':'demà passat'},
      P:'one{fa # dia}other{fa # dies}',
      F:'one{d’aquí a # dia}other{d’aquí a # dies}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'aquesta hora'},
      P:'one{fa # hora}other{fa # hores}',
      F:'one{d’aquí a # hora}other{d’aquí a # hores}',
    },
    SHORT:{
      R:{'0':'aquesta hora'},
      P:'one{fa # h}other{fa # h}',
      F:'one{d’aquí a # h}other{d’aquí a # h}',
    },
    NARROW:{
      R:{'0':'aquesta hora'},
      P:'one{fa # h}other{fa # h}',
      F:'one{d‘aquí a # h}other{d‘aquí a # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'aquest minut'},
      P:'one{fa # minut}other{fa # minuts}',
      F:'one{d’aquí a # minut}other{d’aquí a # minuts}',
    },
    SHORT:{
      R:{'0':'aquest minut'},
      P:'one{fa # min}other{fa # min}',
      F:'one{d’aquí a # min}other{d’aquí a # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'el mes passat','0':'aquest mes','1':'el mes que ve'},
      P:'one{fa # mes}other{fa # mesos}',
      F:'one{d’aquí a # mes}other{d’aquí a # mesos}',
    },
    NARROW:{
      R:{'-1':'mes passat','0':'aquest mes','1':'mes vinent'},
      P:'one{fa # mes}other{fa # mesos}',
      F:'one{d’aquí a # mes}other{d’aquí a # mesos}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'el trimestre passat','0':'aquest trimestre','1':'el trimestre que ve'},
      P:'one{fa # trimestre}other{fa # trimestres}',
      F:'one{d’aquí a # trimestre}other{d’aquí a # trimestres}',
    },
    SHORT:{
      R:{'-1':'el trim. passat','0':'aquest trim.','1':'el trim. que ve'},
      P:'one{fa # trim.}other{fa # trim.}',
      F:'one{d’aquí a # trim.}other{d’aquí a # trim.}',
    },
    NARROW:{
      R:{'-1':'trim. passat','0':'aquest trim.','1':'trim. vinent'},
      P:'one{fa # trim.}other{fa # trim.}',
      F:'one{d’aquí a # trim.}other{d’aquí a # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ara'},
      P:'one{fa # segon}other{fa # segons}',
      F:'one{d’aquí a # segon}other{d’aquí a # segons}',
    },
    SHORT:{
      R:{'0':'ara'},
      P:'one{fa # s}other{fa # s}',
      F:'one{d’aquí a # s}other{d’aquí a # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la setmana passada','0':'aquesta setmana','1':'la setmana que ve'},
      P:'one{fa # setmana}other{fa # setmanes}',
      F:'one{d’aquí a # setmana}other{d’aquí a # setmanes}',
    },
    SHORT:{
      R:{'-1':'la setm. passada','0':'aquesta setm.','1':'la setm. que ve'},
      P:'one{fa # setm.}other{fa # setm.}',
      F:'one{d’aquí a # setm.}other{d’aquí a # setm.}',
    },
    NARROW:{
      R:{'-1':'setm. passada','0':'aquesta setm.','1':'setm. vinent'},
      P:'one{fa # setm.}other{fa # setm.}',
      F:'one{d’aquí a # setm.}other{d’aquí a # setm.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'l’any passat','0':'enguany','1':'l’any que ve'},
      P:'one{fa # any}other{fa # anys}',
      F:'one{d’aquí a # any}other{d’aquí a # anys}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_chr =  {
  DAY: {
    LONG:{
      R:{'-1':'ᏒᎯ','0':'ᎪᎯ ᎢᎦ','1':'ᏌᎾᎴᎢ'},
      P:'one{# ᎢᎦ ᏥᎨᏒ}other{# ᎯᎸᏍᎩ ᏧᏒᎯᏛ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎢᎦ}other{ᎾᎿ # ᎯᎸᏍᎩ ᏧᏒᎯᏛ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ᎯᎠ ᏑᏟᎶᏓ'},
      P:'one{# ᏑᏟᎶᏓ ᏥᎨᏒ}other{# ᎢᏳᏟᎶᏓ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᏑᏟᎶᏓ}other{ᎾᎿ # ᎢᏳᏟᎶᏓ}',
    },
    SHORT:{
      R:{'0':'ᎯᎠ ᏑᏟᎶᏓ'},
      P:'one{# ᏑᏟ. ᏥᎨᏒ}other{# ᏑᏟ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᏑᏟ.}other{ᎾᎿ # ᏑᏟ.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ᎯᎠ ᎢᏯᏔᏬᏍᏔᏅ'},
      P:'one{# ᎢᏯᏔᏬᏍᏔᏅ ᏥᎨᏒ}other{# ᎢᏯᏔᏬᏍᏔᏅ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎢᏯᏔᏬᏍᏔᏅ}other{ᎾᎿ # ᎢᏯᏔᏬᏍᏔᏅ}',
    },
    SHORT:{
      R:{'0':'ᎯᎠ ᎢᏯᏔᏬᏍᏔᏅ'},
      P:'one{# ᎢᏯᏔ. ᏥᎨᏒ}other{# ᎢᏯᏔ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎢᏯᏔ.}other{ᎾᎿ # ᎢᏯᏔ.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ᎧᎸᎢ ᏥᎨᏒ','0':'ᎯᎠ ᎧᎸᎢ','1':'ᏔᎵᏁ ᎧᎸᎢ'},
      P:'one{# ᎧᎸᎢ ᏥᎨᏒ}other{# ᏗᎧᎸᎢ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎧᎸᎢ}other{ᎾᎿ # ᏗᎧᎸᎢ}',
    },
    SHORT:{
      R:{'-1':'ᎧᎸᎢ ᏥᎨᏒ','0':'ᎯᎠ ᎧᎸᎢ','1':'ᏔᎵᏁ ᎧᎸᎢ'},
      P:'one{# ᎧᎸ. ᏥᎨᏒ}other{# ᎧᎸ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎧᎸ.}other{ᎾᎿ # ᎧᎸ.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ᎩᏄᏙᏗ ᏥᎨᏒ','0':'ᎯᎠ ᎩᏄᏙᏗ','1':'ᏔᎵᏁ ᎩᏄᏙᏗ'},
      P:'one{ᎾᎿ # ᎩᏄᏙᏗ ᏥᎨᏒ}other{# ᎩᏄᏙᏗ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎩᏄᏙᏗ}other{ᎾᎿ # ᎩᏄᏙᏗ}',
    },
    SHORT:{
      R:{'-1':'ᎩᏄᏙᏗ ᏥᎨᏒ','0':'ᎯᎠ ᎩᏄᏙᏗ','1':'ᏔᎵᏁ ᎩᏄᏙᏗ'},
      P:'one{# ᎩᏄᏘ. ᏥᎨᏒ}other{# ᎩᏄᏘ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎩᏄᏘ.}other{ᎾᎿ # ᎩᏄᏘ.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ᏃᏊ'},
      P:'one{# ᎠᏎᏢ ᏥᎨᏒ}other{# ᏓᏓᎾᏩᏍᎬ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎠᏎᏢ}other{ᎾᎿ # ᏓᏓᎾᏩᏍᎬ ᏥᎨᏒ}',
    },
    SHORT:{
      R:{'0':'ᏃᏊ'},
      P:'one{# ᎠᏎ. ᏥᎨᏒ}other{# ᎠᏎ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎠᏎ.}other{ᎾᎿ # ᎠᏎ.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ᏥᏛᎵᏱᎵᏒᎢ','0':'ᎯᎠ ᎠᎵᎵᏌ','1':'ᏐᏆᎴᏅᎲ'},
      P:'one{# ᏒᎾᏙᏓᏆᏍᏗ ᏥᎨᏒ}other{# ᎢᏳᎾᏙᏓᏆᏍᏗ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᏒᎾᏙᏓᏆᏍᏗ}other{ᎾᎿ # ᎢᏳᎾᏙᏓᏆᏍᏗ}',
    },
    SHORT:{
      R:{'-1':'ᏥᏛᎵᏱᎵᏒᎢ','0':'ᎯᎠ ᎠᎵᎵᏌ','1':'ᏐᏆᎴᏅᎲ'},
      P:'one{# ᏒᎾ. ᏥᎨᏒ}other{# ᏒᎾ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᏒᎾ.}other{ᎾᎿ # ᏒᎾ.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ᎡᏘ ᏥᎨᏒ','0':'ᎯᎠ ᏧᏕᏘᏴᏒᏘ','1':'ᎡᏘᏴᎢ'},
      P:'one{# ᎤᏕᏘᏴᏌᏗᏒᎢ ᏥᎨᏒ}other{# ᎢᏧᏕᏘᏴᏌᏗᏒᎢ ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎤᏕᏘᏴᏌᏗᏒᎢ}other{ᎾᎿ # ᎢᏧᏕᏘᏴᏌᏗᏒᎢ}',
    },
    SHORT:{
      R:{'-1':'ᎡᏘ ᏥᎨᏒ','0':'ᎯᎠ ᏧᏕᏘᏴᏒᏘ','1':'ᎡᏘᏴᎢ'},
      P:'one{# ᎤᏕ. ᏥᎨᏒ}other{# ᎤᏕ. ᏥᎨᏒ}',
      F:'one{ᎾᎿ # ᎤᏕ.}other{ᎾᎿ # ᎤᏕ.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_cs =  {
  DAY: {
    LONG:{
      R:{'-1':'včera','-2':'předevčírem','0':'dnes','1':'zítra','2':'pozítří'},
      P:'few{před # dny}many{před # dne}one{před # dnem}other{před # dny}',
      F:'few{za # dny}many{za # dne}one{za # den}other{za # dní}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'tuto hodinu'},
      P:'few{před # hodinami}many{před # hodiny}one{před # hodinou}other{před # hodinami}',
      F:'few{za # hodiny}many{za # hodiny}one{za # hodinu}other{za # hodin}',
    },
    SHORT:{
      R:{'0':'tuto hodinu'},
      P:'few{před # h}many{před # h}one{před # h}other{před # h}',
      F:'few{za # h}many{za # h}one{za # h}other{za # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'tuto minutu'},
      P:'few{před # minutami}many{před # minuty}one{před # minutou}other{před # minutami}',
      F:'few{za # minuty}many{za # minuty}one{za # minutu}other{za # minut}',
    },
    SHORT:{
      R:{'0':'tuto minutu'},
      P:'few{před # min}many{před # min}one{před # min}other{před # min}',
      F:'few{za # min}many{za # min}one{za # min}other{za # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'minulý měsíc','0':'tento měsíc','1':'příští měsíc'},
      P:'few{před # měsíci}many{před # měsíce}one{před # měsícem}other{před # měsíci}',
      F:'few{za # měsíce}many{za # měsíce}one{za # měsíc}other{za # měsíců}',
    },
    SHORT:{
      R:{'-1':'minulý měs.','0':'tento měs.','1':'příští měs.'},
      P:'few{před # měs.}many{před # měs.}one{před # měs.}other{před # měs.}',
      F:'few{za # měs.}many{za # měs.}one{za # měs.}other{za # měs.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'minulé čtvrtletí','0':'toto čtvrtletí','1':'příští čtvrtletí'},
      P:'few{před # čtvrtletími}many{před # čtvrtletí}one{před # čtvrtletím}other{před # čtvrtletími}',
      F:'few{za # čtvrtletí}many{za # čtvrtletí}one{za # čtvrtletí}other{za # čtvrtletí}',
    },
    SHORT:{
      R:{'-1':'minulé čtvrtletí','0':'toto čtvrtletí','1':'příští čtvrtletí'},
      P:'few{-# Q}many{-# Q}one{-# Q}other{-# Q}',
      F:'few{+# Q}many{+# Q}one{+# Q}other{+# Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nyní'},
      P:'few{před # sekundami}many{před # sekundy}one{před # sekundou}other{před # sekundami}',
      F:'few{za # sekundy}many{za # sekundy}one{za # sekundu}other{za # sekund}',
    },
    SHORT:{
      R:{'0':'nyní'},
      P:'few{před # s}many{před # s}one{před # s}other{před # s}',
      F:'few{za # s}many{za # s}one{za # s}other{za # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'minulý týden','0':'tento týden','1':'příští týden'},
      P:'few{před # týdny}many{před # týdne}one{před # týdnem}other{před # týdny}',
      F:'few{za # týdny}many{za # týdne}one{za # týden}other{za # týdnů}',
    },
    SHORT:{
      R:{'-1':'minulý týd.','0':'tento týd.','1':'příští týd.'},
      P:'few{před # týd.}many{před # týd.}one{před # týd.}other{před # týd.}',
      F:'few{za # týd.}many{za # týd.}one{za # týd.}other{za # týd.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'minulý rok','0':'tento rok','1':'příští rok'},
      P:'few{před # lety}many{před # roku}one{před # rokem}other{před # lety}',
      F:'few{za # roky}many{za # roku}one{za # rok}other{za # let}',
    },
    SHORT:{
      R:{'-1':'minulý rok','0':'tento rok','1':'příští rok'},
      P:'few{před # r.}many{před # r.}one{před # r.}other{před # l.}',
      F:'few{za # r.}many{za # r.}one{za # r.}other{za # l.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_cy =  {
  DAY: {
    LONG:{
      R:{'-1':'ddoe','-2':'echdoe','0':'heddiw','1':'yfory','2':'drennydd'},
      P:'few{# diwrnod yn ôl}many{# diwrnod yn ôl}one{# diwrnod yn ôl}other{# diwrnod yn ôl}two{# ddiwrnod yn ôl}zero{# diwrnod yn ôl}',
      F:'few{ymhen # diwrnod}many{ymhen # diwrnod}one{ymhen diwrnod}other{ymhen # diwrnod}two{ymhen deuddydd}zero{ymhen # diwrnod}',
    },
    NARROW:{
      R:{'-1':'ddoe','-2':'echdoe','0':'heddiw','1':'yfory','2':'drennydd'},
      P:'few{# diwrnod yn ôl}many{# diwrnod yn ôl}one{# diwrnod yn ôl}other{# diwrnod yn ôl}two{# ddiwrnod yn ôl}zero{# diwrnod yn ôl}',
      F:'few{ymhen # diwrnod}many{ymhen # diwrnod}one{ymhen # diwrnod}other{ymhen # diwrnod}two{ymhen # diwrnod}zero{ymhen # diwrnod}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'yr awr hon'},
      P:'few{# awr yn ôl}many{# awr yn ôl}one{# awr yn ôl}other{# awr yn ôl}two{# awr yn ôl}zero{# awr yn ôl}',
      F:'few{ymhen # awr}many{ymhen # awr}one{ymhen awr}other{ymhen # awr}two{ymhen # awr}zero{ymhen # awr}',
    },
    SHORT:{
      R:{'0':'yr awr hon'},
      P:'few{# awr yn ôl}many{# awr yn ôl}one{awr yn ôl}other{# awr yn ôl}two{# awr yn ôl}zero{# awr yn ôl}',
      F:'few{ymhen # awr}many{ymhen # awr}one{ymhen awr}other{ymhen # awr}two{ymhen # awr}zero{ymhen # awr}',
    },
    NARROW:{
      R:{'0':'yr awr hon'},
      P:'few{# awr yn ôl}many{# awr yn ôl}one{# awr yn ôl}other{# awr yn ôl}two{# awr yn ôl}zero{# awr yn ôl}',
      F:'few{ymhen # awr}many{ymhen # awr}one{ymhen # awr}other{ymhen # awr}two{ymhen # awr}zero{ymhen # awr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'y funud hon'},
      P:'few{# munud yn ôl}many{# munud yn ôl}one{# munud yn ôl}other{# munud yn ôl}two{# munud yn ôl}zero{# munud yn ôl}',
      F:'few{ymhen # munud}many{ymhen # munud}one{ymhen # munud}other{ymhen # munud}two{ymhen # munud}zero{ymhen # munud}',
    },
    SHORT:{
      R:{'0':'y funud hon'},
      P:'few{# munud yn ôl}many{# munud yn ôl}one{# munud yn ôl}other{# munud yn ôl}two{# fun. yn ôl}zero{# munud yn ôl}',
      F:'few{ymhen # munud}many{ymhen # munud}one{ymhen # mun.}other{ymhen # munud}two{ymhen # fun.}zero{ymhen # munud}',
    },
    NARROW:{
      R:{'0':'y funud hon'},
      P:'few{# mun. yn ôl}many{# mun. yn ôl}one{# mun. yn ôl}other{# mun. yn ôl}two{# mun. yn ôl}zero{# mun. yn ôl}',
      F:'few{ymhen # mun.}many{ymhen # mun.}one{ymhen # mun.}other{ymhen # mun.}two{ymhen # mun.}zero{ymhen # mun.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'mis diwethaf','0':'y mis hwn','1':'mis nesaf'},
      P:'few{# mis yn ôl}many{# mis yn ôl}one{# mis yn ôl}other{# mis yn ôl}two{# fis yn ôl}zero{# mis yn ôl}',
      F:'few{ymhen # mis}many{ymhen # mis}one{ymhen mis}other{ymhen # mis}two{ymhen deufis}zero{ymhen # mis}',
    },
    SHORT:{
      R:{'-1':'mis diwethaf','0':'y mis hwn','1':'mis nesaf'},
      P:'few{# mis yn ôl}many{# mis yn ôl}one{# mis yn ôl}other{# mis yn ôl}two{deufis yn ôl}zero{# mis yn ôl}',
      F:'few{ymhen # mis}many{ymhen # mis}one{ymhen mis}other{ymhen # mis}two{ymhen deufis}zero{ymhen # mis}',
    },
    NARROW:{
      R:{'-1':'mis diwethaf','0':'y mis hwn','1':'mis nesaf'},
      P:'few{# mis yn ôl}many{# mis yn ôl}one{# mis yn ôl}other{# mis yn ôl}two{# fis yn ôl}zero{# mis yn ôl}',
      F:'few{ymhen # mis}many{ymhen # mis}one{ymhen mis}other{ymhen # mis}two{ymhen deufis}zero{ymhen # mis}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'chwarter olaf','0':'chwarter hwn','1':'chwarter nesaf'},
      P:'few{# chwarter yn ôl}many{# chwarter yn ôl}one{# chwarter yn ôl}other{# o chwarteri yn ôl}two{# chwarter yn ôl}zero{# o chwarteri yn ôl}',
      F:'few{ymhen # chwarter}many{ymhen # chwarter}one{ymhen # chwarter}other{ymhen # chwarter}two{ymhen # chwarter}zero{ymhen # chwarter}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nawr'},
      P:'few{# eiliad yn ôl}many{# eiliad yn ôl}one{# eiliad yn ôl}other{# eiliad yn ôl}two{# eiliad yn ôl}zero{# eiliad yn ôl}',
      F:'few{ymhen # eiliad}many{ymhen # eiliad}one{ymhen # eiliad}other{ymhen # eiliad}two{ymhen # eiliad}zero{ymhen # eiliad}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'wythnos ddiwethaf','0':'yr wythnos hon','1':'wythnos nesaf'},
      P:'few{# wythnos yn ôl}many{# wythnos yn ôl}one{# wythnos yn ôl}other{# wythnos yn ôl}two{# wythnos yn ôl}zero{# wythnos yn ôl}',
      F:'few{ymhen # wythnos}many{ymhen # wythnos}one{ymhen wythnos}other{ymhen # wythnos}two{ymhen pythefnos}zero{ymhen # wythnos}',
    },
    SHORT:{
      R:{'-1':'wythnos ddiwethaf','0':'yr wythnos hon','1':'wythnos nesaf'},
      P:'few{# wythnos yn ôl}many{# wythnos yn ôl}one{# wythnos yn ôl}other{# wythnos yn ôl}two{pythefnos yn ôl}zero{# wythnos yn ôl}',
      F:'few{ymhen # wythnos}many{ymhen # wythnos}one{ymhen wythnos}other{ymhen # wythnos}two{ymhen pythefnos}zero{ymhen # wythnos}',
    },
    NARROW:{
      R:{'-1':'wythnos ddiwethaf','0':'yr wythnos hon','1':'wythnos nesaf'},
      P:'few{# wythnos yn ôl}many{# wythnos yn ôl}one{# wythnos yn ôl}other{# wythnos yn ôl}two{pythefnos yn ôl}zero{# wythnos yn ôl}',
      F:'few{ymhen # wythnos}many{ymhen # wythnos}one{ymhen # wythnos}other{ymhen # wythnos}two{ymhen # wythnos}zero{ymhen # wythnos}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'llynedd','0':'eleni','1':'blwyddyn nesaf'},
      P:'few{# blynedd yn ôl}many{# blynedd yn ôl}one{blwyddyn yn ôl}other{# o flynyddoedd yn ôl}two{# flynedd yn ôl}zero{# o flynyddoedd yn ôl}',
      F:'few{ymhen # blynedd}many{ymhen # blynedd}one{ymhen blwyddyn}other{ymhen # mlynedd}two{ymhen # flynedd}zero{ymhen # mlynedd}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_da =  {
  DAY: {
    LONG:{
      R:{'-1':'i går','-2':'i forgårs','0':'i dag','1':'i morgen','2':'i overmorgen'},
      P:'one{for # dag siden}other{for # dage siden}',
      F:'one{om # dag}other{om # dage}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'i den kommende time'},
      P:'one{for # time siden}other{for # timer siden}',
      F:'one{om # time}other{om # timer}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'i det kommende minut'},
      P:'one{for # minut siden}other{for # minutter siden}',
      F:'one{om # minut}other{om # minutter}',
    },
    SHORT:{
      R:{'0':'i det kommende minut'},
      P:'one{for # min. siden}other{for # min. siden}',
      F:'one{om # min.}other{om # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'sidste måned','0':'denne måned','1':'næste måned'},
      P:'one{for # måned siden}other{for # måneder siden}',
      F:'one{om # måned}other{om # måneder}',
    },
    SHORT:{
      R:{'-1':'sidste md.','0':'denne md.','1':'næste md.'},
      P:'one{for # md. siden}other{for # mdr. siden}',
      F:'one{om # md.}other{om # mdr.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'sidste kvartal','0':'dette kvartal','1':'næste kvartal'},
      P:'one{for # kvartal siden}other{for # kvartaler siden}',
      F:'one{om # kvartal}other{om # kvartaler}',
    },
    SHORT:{
      R:{'-1':'sidste kvt.','0':'dette kvt.','1':'næste kvt.'},
      P:'one{for # kvt. siden}other{for # kvt. siden}',
      F:'one{om # kvt.}other{om # kvt.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nu'},
      P:'one{for # sekund siden}other{for # sekunder siden}',
      F:'one{om # sekund}other{om # sekunder}',
    },
    SHORT:{
      R:{'0':'nu'},
      P:'one{for # sek. siden}other{for # sek. siden}',
      F:'one{om # sek.}other{om # sek.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'sidste uge','0':'denne uge','1':'næste uge'},
      P:'one{for # uge siden}other{for # uger siden}',
      F:'one{om # uge}other{om # uger}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'sidste år','0':'i år','1':'næste år'},
      P:'one{for # år siden}other{for # år siden}',
      F:'one{om # år}other{om # år}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_de =  {
  DAY: {
    LONG:{
      R:{'-1':'gestern','-2':'vorgestern','0':'heute','1':'morgen','2':'übermorgen'},
      P:'one{vor # Tag}other{vor # Tagen}',
      F:'one{in # Tag}other{in # Tagen}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'in dieser Stunde'},
      P:'one{vor # Stunde}other{vor # Stunden}',
      F:'one{in # Stunde}other{in # Stunden}',
    },
    SHORT:{
      R:{'0':'in dieser Stunde'},
      P:'one{vor # Std.}other{vor # Std.}',
      F:'one{in # Std.}other{in # Std.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # Minute}other{vor # Minuten}',
      F:'one{in # Minute}other{in # Minuten}',
    },
    SHORT:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # Min.}other{vor # Min.}',
      F:'one{in # Min.}other{in # Min.}',
    },
    NARROW:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # m}other{vor # m}',
      F:'one{in # m}other{in # m}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
    SHORT:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
    NARROW:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal','1':'nächstes Quartal'},
      P:'one{vor # Quartal}other{vor # Quartalen}',
      F:'one{in # Quartal}other{in # Quartalen}',
    },
    SHORT:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal','1':'nächstes Quartal'},
      P:'one{vor # Quart.}other{vor # Quart.}',
      F:'one{in # Quart.}other{in # Quart.}',
    },
    NARROW:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal','1':'nächstes Quartal'},
      P:'one{vor # Q}other{vor # Q}',
      F:'one{in # Q}other{in # Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'jetzt'},
      P:'one{vor # Sekunde}other{vor # Sekunden}',
      F:'one{in # Sekunde}other{in # Sekunden}',
    },
    SHORT:{
      R:{'0':'jetzt'},
      P:'one{vor # Sek.}other{vor # Sek.}',
      F:'one{in # Sek.}other{in # Sek.}',
    },
    NARROW:{
      R:{'0':'jetzt'},
      P:'one{vor # s}other{vor # s}',
      F:'one{in # s}other{in # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'letzte Woche','0':'diese Woche','1':'nächste Woche'},
      P:'one{vor # Woche}other{vor # Wochen}',
      F:'one{in # Woche}other{in # Wochen}',
    },
    NARROW:{
      R:{'-1':'letzte Woche','0':'diese Woche','1':'nächste Woche'},
      P:'one{vor # Wo.}other{vor # Wo.}',
      F:'one{in # Wo.}other{in # Wo.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'letztes Jahr','0':'dieses Jahr','1':'nächstes Jahr'},
      P:'one{vor # Jahr}other{vor # Jahren}',
      F:'one{in # Jahr}other{in # Jahren}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_de_AT = exports.RelativeDateTimeSymbols_de;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_de_CH =  {
  DAY: {
    LONG:{
      R:{'-1':'gestern','-2':'vorgestern','0':'heute','1':'morgen','2':'übermorgen'},
      P:'one{vor # Tag}other{vor # Tagen}',
      F:'one{in # Tag}other{in # Tagen}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'in dieser Stunde'},
      P:'one{vor # Stunde}other{vor # Stunden}',
      F:'one{in # Stunde}other{in # Stunden}',
    },
    SHORT:{
      R:{'0':'in dieser Stunde'},
      P:'one{vor # Std.}other{vor # Std.}',
      F:'one{in # Std.}other{in # Std.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # Minute}other{vor # Minuten}',
      F:'one{in # Minute}other{in # Minuten}',
    },
    SHORT:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # Min.}other{vor # Min.}',
      F:'one{in # Min.}other{in # Min.}',
    },
    NARROW:{
      R:{'0':'in dieser Minute'},
      P:'one{vor # m}other{vor # m}',
      F:'one{in # m}other{in # m}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
    SHORT:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
    NARROW:{
      R:{'-1':'letzten Monat','0':'diesen Monat','1':'nächsten Monat'},
      P:'one{vor # Monat}other{vor # Monaten}',
      F:'one{in # Monat}other{in # Monaten}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal'},
      P:'one{vor # Quartal}other{vor # Quartalen}',
      F:'one{in # Quartal}other{in # Quartalen}',
    },
    SHORT:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal'},
      P:'one{vor # Quart.}other{vor # Quart.}',
      F:'one{in # Quart.}other{in # Quart.}',
    },
    NARROW:{
      R:{'-1':'letztes Quartal','0':'dieses Quartal'},
      P:'one{vor # Q}other{vor # Q}',
      F:'one{in # Q}other{in # Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'jetzt'},
      P:'one{vor # Sekunde}other{vor # Sekunden}',
      F:'one{in # Sekunde}other{in # Sekunden}',
    },
    SHORT:{
      R:{'0':'jetzt'},
      P:'one{vor # Sek.}other{vor # Sek.}',
      F:'one{in # Sek.}other{in # Sek.}',
    },
    NARROW:{
      R:{'0':'jetzt'},
      P:'one{vor # s}other{vor # s}',
      F:'one{in # s}other{in # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'letzte Woche','0':'diese Woche','1':'nächste Woche'},
      P:'one{vor # Woche}other{vor # Wochen}',
      F:'one{in # Woche}other{in # Wochen}',
    },
    NARROW:{
      R:{'-1':'letzte Woche','0':'diese Woche','1':'nächste Woche'},
      P:'one{vor # Wo.}other{vor # Wo.}',
      F:'one{in # Wo.}other{in # Wo.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'letztes Jahr','0':'dieses Jahr','1':'nächstes Jahr'},
      P:'one{vor # Jahr}other{vor # Jahren}',
      F:'one{in # Jahr}other{in # Jahren}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_el =  {
  DAY: {
    LONG:{
      R:{'-1':'χθες','-2':'προχθές','0':'σήμερα','1':'αύριο','2':'μεθαύριο'},
      P:'one{πριν από # ημέρα}other{πριν από # ημέρες}',
      F:'one{σε # ημέρα}other{σε # ημέρες}',
    },
    SHORT:{
      R:{'-1':'χθες','0':'σήμερα','1':'αύριο'},
      P:'one{πριν από # ημ.}other{πριν από # ημ.}',
      F:'one{σε # ημ.}other{σε # ημ.}',
    },
    NARROW:{
      R:{'-1':'χθες','0':'σήμερα','1':'αύριο'},
      P:'one{# ημ. πριν}other{# ημ. πριν}',
      F:'one{σε # ημ.}other{σε # ημ.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'τρέχουσα ώρα'},
      P:'one{πριν από # ώρα}other{πριν από # ώρες}',
      F:'one{σε # ώρα}other{σε # ώρες}',
    },
    SHORT:{
      R:{'0':'τρέχουσα ώρα'},
      P:'one{πριν από # ώ.}other{πριν από # ώ.}',
      F:'one{σε # ώ.}other{σε # ώ.}',
    },
    NARROW:{
      R:{'0':'τρέχουσα ώρα'},
      P:'one{# ώ. πριν}other{# ώ. πριν}',
      F:'one{σε # ώ.}other{σε # ώ.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'τρέχον λεπτό'},
      P:'one{πριν από # λεπτό}other{πριν από # λεπτά}',
      F:'one{σε # λεπτό}other{σε # λεπτά}',
    },
    SHORT:{
      R:{'0':'τρέχον λεπτό'},
      P:'one{πριν από # λεπ.}other{πριν από # λεπ.}',
      F:'one{σε # λεπ.}other{σε # λεπ.}',
    },
    NARROW:{
      R:{'0':'τρέχον λεπτό'},
      P:'one{# λ. πριν}other{# λ. πριν}',
      F:'one{σε # λ.}other{σε # λ.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'προηγούμενος μήνας','0':'τρέχων μήνας','1':'επόμενος μήνας'},
      P:'one{πριν από # μήνα}other{πριν από # μήνες}',
      F:'one{σε # μήνα}other{σε # μήνες}',
    },
    NARROW:{
      R:{'-1':'προηγούμενος μήνας','0':'τρέχων μήνας','1':'επόμενος μήνας'},
      P:'one{# μ. πριν}other{# μ. πριν}',
      F:'one{σε # μ.}other{σε # μ.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'προηγούμενο τρίμηνο','0':'τρέχον τρίμηνο','1':'επόμενο τρίμηνο'},
      P:'one{πριν από # τρίμηνο}other{πριν από # τρίμηνα}',
      F:'one{σε # τρίμηνο}other{σε # τρίμηνα}',
    },
    SHORT:{
      R:{'-1':'προηγ. τρίμ.','0':'τρέχον τρίμ.','1':'επόμ. τρίμ.'},
      P:'one{πριν από # τρίμ.}other{πριν από # τρίμ.}',
      F:'one{σε # τρίμ.}other{σε # τρίμ.}',
    },
    NARROW:{
      R:{'-1':'προηγ. τρίμ.','0':'τρέχον τρίμ.','1':'επόμ. τρίμ.'},
      P:'one{# τρίμ. πριν}other{# τρίμ. πριν}',
      F:'one{σε # τρίμ.}other{σε # τρίμ.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'τώρα'},
      P:'one{πριν από # δευτερόλεπτο}other{πριν από # δευτερόλεπτα}',
      F:'one{σε # δευτερόλεπτο}other{σε # δευτερόλεπτα}',
    },
    SHORT:{
      R:{'0':'τώρα'},
      P:'one{πριν από # δευτ.}other{πριν από # δευτ.}',
      F:'one{σε # δευτ.}other{σε # δευτ.}',
    },
    NARROW:{
      R:{'0':'τώρα'},
      P:'one{# δ. πριν}other{# δ. πριν}',
      F:'one{σε # δ.}other{σε # δ.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'προηγούμενη εβδομάδα','0':'τρέχουσα εβδομάδα','1':'επόμενη εβδομάδα'},
      P:'one{πριν από # εβδομάδα}other{πριν από # εβδομάδες}',
      F:'one{σε # εβδομάδα}other{σε # εβδομάδες}',
    },
    SHORT:{
      R:{'-1':'προηγούμενη εβδομάδα','0':'τρέχουσα εβδομάδα','1':'επόμενη εβδομάδα'},
      P:'one{πριν από # εβδ.}other{πριν από # εβδ.}',
      F:'one{σε # εβδ.}other{σε # εβδ.}',
    },
    NARROW:{
      R:{'-1':'προηγούμενη εβδομάδα','0':'τρέχουσα εβδομάδα','1':'επόμενη εβδομάδα'},
      P:'one{# εβδ. πριν}other{# εβδ. πριν}',
      F:'one{σε # εβδ.}other{σε # εβδ.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'πέρσι','0':'φέτος','1':'επόμενο έτος'},
      P:'one{πριν από # έτος}other{πριν από # έτη}',
      F:'one{σε # έτος}other{σε # έτη}',
    },
    NARROW:{
      R:{'-1':'πέρσι','0':'φέτος','1':'επόμενο έτος'},
      P:'one{# έτος πριν}other{# έτη πριν}',
      F:'one{σε # έτος}other{σε # έτη}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr. ago}other{# hr. ago}',
      F:'one{in # hr.}other{in # hr.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min. ago}other{# min. ago}',
      F:'one{in # min.}other{in # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo. ago}other{# mo. ago}',
      F:'one{in # mo.}other{in # mo.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr. ago}other{# qtrs. ago}',
      F:'one{in # qtr.}other{in # qtrs.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec. ago}other{# sec. ago}',
      F:'one{in # sec.}other{in # sec.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk. ago}other{# wk. ago}',
      F:'one{in # wk.}other{in # wk.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr. ago}other{# yr. ago}',
      F:'one{in # yr.}other{in # yr.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_AU =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
    NARROW:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'other{# hrs ago}',
      F:'other{in # hrs}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min. ago}other{# mins ago}',
      F:'one{in # min.}other{in # mins}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo. ago}other{# mo. ago}',
      F:'one{in # mo.}other{in # mo.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr ago}other{# qtrs ago}',
      F:'other{in # qtrs}',
    },
    NARROW:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{in # qtr ago}other{# qtrs ago}',
      F:'other{in # qtrs}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec. ago}other{# secs ago}',
      F:'one{in # sec.}other{in # secs}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'other{# wks ago}',
      F:'other{in # wks}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'other{# yrs ago}',
      F:'other{in # yrs}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_CA =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr. ago}other{# hrs. ago}',
      F:'one{in # hr.}other{in # hrs.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min. ago}other{# mins. ago}',
      F:'one{in # min.}other{in # mins.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo. ago}other{# mos. ago}',
      F:'one{in # mo.}other{in # mos.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr. ago}other{# qtrs. ago}',
      F:'one{in # qtr.}other{in # qtrs.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec. ago}other{# secs. ago}',
      F:'one{in # sec.}other{in # secs.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk. ago}other{# wks. ago}',
      F:'one{in # wk.}other{in # wks.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr. ago}other{# yrs. ago}',
      F:'one{in # yr.}other{in # yrs.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_GB =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
    SHORT:{
      R:{'-1':'yesterday'},
      P:'other{# days ago}',
      F:'other{in # days}',
    },
    NARROW:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'other{# days ago}',
      F:'other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr ago}other{# hr ago}',
      F:'one{in # hr}other{in # hr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min ago}other{# min ago}',
      F:'one{in # min}other{in # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo ago}other{# mo ago}',
      F:'one{in # mo}other{in # mo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr ago}other{# qtr ago}',
      F:'one{in # qtr}other{in # qtr}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec ago}other{# sec ago}',
      F:'one{in # sec}other{in # sec}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk ago}other{# wk ago}',
      F:'one{in # wk}other{in # wk}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr ago}other{# yr ago}',
      F:'one{in # yr}other{in # yr}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_IE =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr ago}other{# hr ago}',
      F:'one{in # hr}other{in # hr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min ago}other{# min ago}',
      F:'one{in # min}other{in # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo ago}other{# mo ago}',
      F:'one{in # mo}other{in # mo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr ago}other{# qtr ago}',
      F:'one{in # qtr}other{in # qtr}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec ago}other{# sec ago}',
      F:'one{in # sec}other{in # sec}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk ago}other{# wk ago}',
      F:'one{in # wk}other{in # wk}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr ago}other{# yr ago}',
      F:'one{in # yr}other{in # yr}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_IN =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr ago}other{# hr ago}',
      F:'one{in # hr}other{in # hr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min ago}other{# min ago}',
      F:'one{in # min}other{in # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo ago}other{# mo ago}',
      F:'one{in # mo}other{in # mo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr ago}other{# qtr ago}',
      F:'one{in # qtr}other{in # qtr}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec ago}other{# sec ago}',
      F:'one{in # sec}other{in # sec}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk ago}other{# wk ago}',
      F:'one{in # wk}other{in # wk}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr ago}other{# yr ago}',
      F:'one{in # yr}other{in # yr}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_SG =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr ago}other{# hr ago}',
      F:'one{in # hr}other{in # hr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min ago}other{# min ago}',
      F:'one{in # min}other{in # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mth','0':'this mth','1':'next mth'},
      P:'one{# mth ago}other{# mth ago}',
      F:'one{in # mth}other{in # mth}',
    },
    NARROW:{
      R:{'-1':'last mth','0':'this mth','1':'next mth'},
      P:'one{# mo ago}other{# mo ago}',
      F:'one{in # mo}other{in # mo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr','0':'this qtr','1':'next qtr'},
      P:'one{# qtr ago}other{# qtrs ago}',
      F:'one{in # qtr}other{in # qtrs}',
    },
    NARROW:{
      R:{'-1':'last qtr','0':'this qtr','1':'next qtr'},
      P:'one{# qtr ago}other{# qtr ago}',
      F:'one{in # qtr}other{in # qtr}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec ago}other{# sec ago}',
      F:'one{in # sec}other{in # sec}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk','0':'this wk','1':'next wk'},
      P:'one{# wk ago}other{# wk ago}',
      F:'one{in # wk}other{in # wk}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr','0':'this yr','1':'next yr'},
      P:'one{# yr ago}other{# yr ago}',
      F:'one{in # yr}other{in # yr}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_US = exports.RelativeDateTimeSymbols_en;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_en_ZA =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'one{# day ago}other{# days ago}',
      F:'one{in # day}other{in # days}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'one{# hour ago}other{# hours ago}',
      F:'one{in # hour}other{in # hours}',
    },
    SHORT:{
      R:{'0':'this hour'},
      P:'one{# hr ago}other{# hr ago}',
      F:'one{in # hr}other{in # hr}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'one{# minute ago}other{# minutes ago}',
      F:'one{in # minute}other{in # minutes}',
    },
    SHORT:{
      R:{'0':'this minute'},
      P:'one{# min ago}other{# min ago}',
      F:'one{in # min}other{in # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'one{# month ago}other{# months ago}',
      F:'one{in # month}other{in # months}',
    },
    SHORT:{
      R:{'-1':'last mo.','0':'this mo.','1':'next mo.'},
      P:'one{# mo ago}other{# mo ago}',
      F:'one{in # mo}other{in # mo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'one{# quarter ago}other{# quarters ago}',
      F:'one{in # quarter}other{in # quarters}',
    },
    SHORT:{
      R:{'-1':'last qtr.','0':'this qtr.','1':'next qtr.'},
      P:'one{# qtr ago}other{# qtr ago}',
      F:'one{in # qtr}other{in # qtr}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'one{# second ago}other{# seconds ago}',
      F:'one{in # second}other{in # seconds}',
    },
    SHORT:{
      R:{'0':'now'},
      P:'one{# sec ago}other{# sec ago}',
      F:'one{in # sec}other{in # sec}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'one{# week ago}other{# weeks ago}',
      F:'one{in # week}other{in # weeks}',
    },
    SHORT:{
      R:{'-1':'last wk.','0':'this wk.','1':'next wk.'},
      P:'one{# wk ago}other{# wk ago}',
      F:'one{in # wk}other{in # wk}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'one{# year ago}other{# years ago}',
      F:'one{in # year}other{in # years}',
    },
    SHORT:{
      R:{'-1':'last yr.','0':'this yr.','1':'next yr.'},
      P:'one{# yr ago}other{# yr ago}',
      F:'one{in # yr}other{in # yr}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_es =  {
  DAY: {
    LONG:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{hace # hora}other{hace # horas}',
      F:'one{dentro de # hora}other{dentro de # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{hace # h}other{hace # h}',
      F:'one{dentro de # h}other{dentro de # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{hace # minuto}other{hace # minutos}',
      F:'one{dentro de # minuto}other{dentro de # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{hace # min}other{hace # min}',
      F:'one{dentro de # min}other{dentro de # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # mes}other{hace # meses}',
      F:'one{dentro de # mes}other{dentro de # meses}',
    },
    SHORT:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # m}other{hace # m}',
      F:'one{dentro de # m}other{dentro de # m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trimestre}other{hace # trimestres}',
      F:'one{dentro de # trimestre}other{dentro de # trimestres}',
    },
    SHORT:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trim.}other{hace # trim.}',
      F:'one{dentro de # trim.}other{dentro de # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ahora'},
      P:'one{hace # segundo}other{hace # segundos}',
      F:'one{dentro de # segundo}other{dentro de # segundos}',
    },
    SHORT:{
      R:{'0':'ahora'},
      P:'one{hace # s}other{hace # s}',
      F:'one{dentro de # s}other{dentro de # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la semana pasada','0':'esta semana','1':'la próxima semana'},
      P:'one{hace # semana}other{hace # semanas}',
      F:'one{dentro de # semana}other{dentro de # semanas}',
    },
    SHORT:{
      R:{'-1':'la semana pasada','0':'esta semana','1':'la próxima semana'},
      P:'one{hace # sem.}other{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{hace # año}other{hace # años}',
      F:'one{dentro de # año}other{dentro de # años}',
    },
    SHORT:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{hace # a}other{hace # a}',
      F:'one{dentro de # a}other{dentro de # a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_es_419 =  {
  DAY: {
    LONG:{
      R:{'-1':'ayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
    SHORT:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{hace # hora}other{hace # horas}',
      F:'one{dentro de # hora}other{dentro de # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{hace # h}other{hace # h}',
      F:'one{dentro de # h}other{dentro de # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{hace # minuto}other{hace # minutos}',
      F:'one{dentro de # minuto}other{dentro de # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{hace # min}other{hace # min}',
      F:'one{dentro de # min}other{dentro de # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # mes}other{hace # meses}',
      F:'one{dentro de # mes}other{dentro de # meses}',
    },
    SHORT:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # m}other{hace # m}',
      F:'one{dentro de # m}other{dentro de # m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trimestre}other{hace # trimestres}',
      F:'one{dentro de # trimestre}other{dentro de # trimestres}',
    },
    SHORT:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trim.}other{hace # trim.}',
      F:'one{dentro de # trim.}other{dentro de # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ahora'},
      P:'one{hace # segundo}other{hace # segundos}',
      F:'one{dentro de # segundo}other{dentro de # segundos}',
    },
    SHORT:{
      R:{'0':'ahora'},
      P:'one{hace # s}other{hace # s}',
      F:'one{dentro de # s}other{dentro de # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la semana pasada','0':'esta semana'},
      P:'one{hace # semana}other{hace # semanas}',
      F:'one{dentro de # semana}other{dentro de # semanas}',
    },
    SHORT:{
      R:{'-1':'la semana pasada','0':'esta semana'},
      P:'one{hace # sem.}other{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
    NARROW:{
      R:{'-1':'la semana pasada','0':'esta semana'},
      P:'one{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'el año pasado','0':'este año'},
      P:'one{hace # año}other{hace # años}',
      F:'one{dentro de # año}other{dentro de # años}',
    },
    SHORT:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{hace # a}other{hace # a}',
      F:'one{dentro de # a}other{dentro de # a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_es_ES = exports.RelativeDateTimeSymbols_es;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_es_MX =  {
  DAY: {
    LONG:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
    SHORT:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{en # día}other{en # días}',
    },
    NARROW:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{+# día}other{+# días}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{hace # hora}other{hace # horas}',
      F:'one{dentro de # hora}other{dentro de # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{hace # h}other{hace # h}',
      F:'one{en # h}other{en # n}',
    },
    NARROW:{
      R:{'0':'esta hora'},
      P:'one{hace # h}other{hace # h}',
      F:'one{dentro de # h}other{dentro de # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{hace # minuto}other{hace # minutos}',
      F:'one{dentro de # minuto}other{dentro de # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{hace # min}other{hace # min}',
      F:'one{en # min}other{en # min}',
    },
    NARROW:{
      R:{'0':'este minuto'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el mes próximo'},
      P:'one{hace # mes}other{hace # meses}',
      F:'one{en # mes}other{en # meses}',
    },
    SHORT:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # m}other{hace # m}',
      F:'one{en # m}other{en # m}',
    },
    NARROW:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{-# m}other{-# m}',
      F:'one{+# m}other{+# m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trimestre}other{hace # trimestres}',
      F:'one{dentro de # trimetre}other{dentro de # trimetres}',
    },
    SHORT:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trim.}other{hace # trim.}',
      F:'one{en # trim.}other{en # trim}',
    },
    NARROW:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{-# T}other{-# T}',
      F:'one{+# T}other{+# T}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ahora'},
      P:'one{hace # segundo}other{hace # segundos}',
      F:'one{dentro de # segundo}other{dentro de # segundos}',
    },
    SHORT:{
      R:{'0':'ahora'},
      P:'one{hace # s}other{hace # s}',
      F:'one{en # s}other{en # s}',
    },
    NARROW:{
      R:{'0':'ahora'},
      P:'one{hace # s}other{hace # s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la semana pasada','0':'esta semana','1':'la semana próxima'},
      P:'one{hace # semana}other{hace # semanas}',
      F:'one{dentro de # semana}other{dentro de # semanas}',
    },
    SHORT:{
      R:{'-1':'la semana pasada','0':'esta semana','1':'la semana próxima'},
      P:'one{hace # sem.}other{hace # sem.}',
      F:'one{en # sem.}other{en # sem.}',
    },
    NARROW:{
      R:{'-1':'la semana pasada','0':'esta semana','1':'la semana próxima'},
      P:'one{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'el año pasado','0':'este año','1':'el año próximo'},
      P:'one{hace # año}other{hace # años}',
      F:'one{dentro de # año}other{dentro de # años}',
    },
    SHORT:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{hace # a}other{hace # a}',
      F:'one{en # a}other{en # a}',
    },
    NARROW:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{-# a}other{-# a}',
      F:'one{en # a}other{en # a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_es_US =  {
  DAY: {
    LONG:{
      R:{'-1':'ayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
    SHORT:{
      R:{'-1':'ayer','-2':'anteayer','0':'hoy','1':'mañana','2':'pasado mañana'},
      P:'one{hace # día}other{hace # días}',
      F:'one{dentro de # día}other{dentro de # días}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{hace # hora}other{hace # horas}',
      F:'one{dentro de # hora}other{dentro de # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{hace # h}other{hace # h}',
      F:'one{dentro de # h}other{dentro de # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{hace # minuto}other{hace # minutos}',
      F:'one{dentro de # minuto}other{dentro de # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{hace # min}other{hace # min}',
      F:'one{dentro de # min}other{dentro de # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'1':'el mes próximo'},
      P:'one{hace # mes}other{hace # meses}',
      F:'one{dentro de # mes}other{dentro de # meses}',
    },
    SHORT:{
      R:{'-1':'el mes pasado','0':'este mes','1':'el próximo mes'},
      P:'one{hace # m}other{hace # m}',
      F:'one{dentro de # m}other{dentro de # m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trimestre}other{hace # trimestres}',
      F:'one{dentro de # trimestre}other{dentro de # trimestres}',
    },
    SHORT:{
      R:{'-1':'el trimestre pasado','0':'este trimestre','1':'el próximo trimestre'},
      P:'one{hace # trim.}other{hace # trim.}',
      F:'one{dentro de # trim.}other{dentro de # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ahora'},
      P:'one{hace # segundo}other{hace # segundos}',
      F:'one{dentro de # segundo}other{dentro de # segundos}',
    },
    SHORT:{
      R:{'0':'ahora'},
      P:'one{hace # s}other{hace # s}',
      F:'one{dentro de # s}other{dentro de # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'1':'la semana próxima'},
      P:'one{hace # semana}other{hace # semanas}',
      F:'one{dentro de # semana}other{dentro de # semanas}',
    },
    SHORT:{
      R:{'1':'la semana próxima'},
      P:'one{hace # sem.}other{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
    NARROW:{
      R:{'1':'la semana próxima'},
      P:'one{hace # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'1':'el año próximo'},
      P:'one{hace # año}other{hace # años}',
      F:'one{dentro de # año}other{dentro de # años}',
    },
    SHORT:{
      R:{'-1':'el año pasado','0':'este año','1':'el próximo año'},
      P:'one{hace # a}other{hace # a}',
      F:'one{dentro de # a}other{dentro de # a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_et =  {
  DAY: {
    LONG:{
      R:{'-1':'eile','-2':'üleeile','0':'täna','1':'homme','2':'ülehomme'},
      P:'one{# päeva eest}other{# päeva eest}',
      F:'one{# päeva pärast}other{# päeva pärast}',
    },
    SHORT:{
      R:{'-1':'eile','-2':'üleeile','0':'täna','1':'homme','2':'ülehomme'},
      P:'one{# p eest}other{# p eest}',
      F:'one{# p pärast}other{# p pärast}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'praegusel tunnil'},
      P:'one{# tunni eest}other{# tunni eest}',
      F:'one{# tunni pärast}other{# tunni pärast}',
    },
    SHORT:{
      R:{'0':'praegusel tunnil'},
      P:'one{# t eest}other{# t eest}',
      F:'one{# t pärast}other{# t pärast}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'praegusel minutil'},
      P:'one{# minuti eest}other{# minuti eest}',
      F:'one{# minuti pärast}other{# minuti pärast}',
    },
    SHORT:{
      R:{'0':'praegusel minutil'},
      P:'one{# min eest}other{# min eest}',
      F:'one{# min pärast}other{# min pärast}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'eelmine kuu','0':'käesolev kuu','1':'järgmine kuu'},
      P:'one{# kuu eest}other{# kuu eest}',
      F:'one{# kuu pärast}other{# kuu pärast}',
    },
    NARROW:{
      R:{'-1':'eelmine kuu','0':'käesolev kuu','1':'järgmine kuu'},
      P:'one{# k eest}other{# k eest}',
      F:'one{# k pärast}other{# k pärast}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'eelmine kvartal','0':'käesolev kvartal','1':'järgmine kvartal'},
      P:'one{# kvartali eest}other{# kvartali eest}',
      F:'one{# kvartali pärast}other{# kvartali pärast}',
    },
    SHORT:{
      R:{'-1':'eelmine kv','0':'käesolev kv','1':'järgmine kv'},
      P:'one{# kv eest}other{# kv eest}',
      F:'one{# kv pärast}other{# kv pärast}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nüüd'},
      P:'one{# sekundi eest}other{# sekundi eest}',
      F:'one{# sekundi pärast}other{# sekundi pärast}',
    },
    SHORT:{
      R:{'0':'nüüd'},
      P:'one{# sek eest}other{# sek eest}',
      F:'one{# sek pärast}other{# sek pärast}',
    },
    NARROW:{
      R:{'0':'nüüd'},
      P:'one{# s eest}other{# s eest}',
      F:'one{# s pärast}other{# s pärast}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'eelmine nädal','0':'käesolev nädal','1':'järgmine nädal'},
      P:'one{# nädala eest}other{# nädala eest}',
      F:'one{# nädala pärast}other{# nädala pärast}',
    },
    SHORT:{
      R:{'-1':'eelmine nädal','0':'käesolev nädal','1':'järgmine nädal'},
      P:'one{# näd eest}other{# näd eest}',
      F:'one{# näd pärast}other{# näd pärast}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'eelmine aasta','0':'käesolev aasta','1':'järgmine aasta'},
      P:'one{# aasta eest}other{# aasta eest}',
      F:'one{# aasta pärast}other{# aasta pärast}',
    },
    SHORT:{
      R:{'-1':'eelmine aasta','0':'käesolev aasta','1':'järgmine aasta'},
      P:'one{# a eest}other{# a eest}',
      F:'one{# a pärast}other{# a pärast}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_eu =  {
  DAY: {
    LONG:{
      R:{'-1':'atzo','-2':'herenegun','0':'gaur','1':'bihar','2':'etzi'},
      P:'one{Duela # egun}other{Duela # egun}',
      F:'one{# egun barru}other{# egun barru}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ordu honetan'},
      P:'one{Duela # ordu}other{Duela # ordu}',
      F:'one{# ordu barru}other{# ordu barru}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'minutu honetan'},
      P:'one{Duela # minutu}other{Duela # minutu}',
      F:'one{# minutu barru}other{# minutu barru}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'aurreko hilabetean','0':'hilabete honetan','1':'hurrengo hilabetean'},
      P:'one{Duela # hilabete}other{Duela # hilabete}',
      F:'one{# hilabete barru}other{# hilabete barru}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'aurreko hiruhilekoa','0':'hiruhileko hau','1':'hurrengo hiruhilekoa'},
      P:'one{Duela # hiruhileko}other{Duela # hiruhileko}',
      F:'one{# hiruhileko barru}other{# hiruhileko barru}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'orain'},
      P:'one{Duela # segundo}other{Duela # segundo}',
      F:'one{# segundo barru}other{# segundo barru}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'aurreko astean','0':'aste honetan','1':'hurrengo astean'},
      P:'one{Duela # aste}other{Duela # aste}',
      F:'one{# aste barru}other{# aste barru}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'iaz','0':'aurten','1':'hurrengo urtean'},
      P:'one{Duela # urte}other{Duela # urte}',
      F:'one{# urte barru}other{# urte barru}',
    },
    SHORT:{
      R:{'-1':'aurreko urtea','0':'aurten','1':'hurrengo urtea'},
      P:'one{Duela # urte}other{Duela # urte}',
      F:'one{# urte barru}other{# urte barru}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_fa =  {
  DAY: {
    LONG:{
      R:{'-1':'دیروز','-2':'پریروز','0':'امروز','1':'فردا','2':'پس‌فردا'},
      P:'one{# روز پیش}other{# روز پیش}',
      F:'one{# روز بعد}other{# روز بعد}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'همین ساعت'},
      P:'one{# ساعت پیش}other{# ساعت پیش}',
      F:'one{# ساعت بعد}other{# ساعت بعد}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'همین دقیقه'},
      P:'one{# دقیقه پیش}other{# دقیقه پیش}',
      F:'one{# دقیقه بعد}other{# دقیقه بعد}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ماه گذشته','0':'این ماه','1':'ماه آینده'},
      P:'one{# ماه پیش}other{# ماه پیش}',
      F:'one{# ماه بعد}other{# ماه بعد}',
    },
    SHORT:{
      R:{'-1':'ماه پیش','0':'این ماه','1':'ماه آینده'},
      P:'one{# ماه پیش}other{# ماه پیش}',
      F:'one{# ماه بعد}other{# ماه بعد}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'سه‌ماههٔ گذشته','0':'سه‌ماههٔ کنونی','1':'سه‌ماههٔ آینده'},
      P:'one{# سه‌ماههٔ پیش}other{# سه‌ماههٔ پیش}',
      F:'one{# سه‌ماههٔ بعد}other{# سه‌ماههٔ بعد}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'اکنون'},
      P:'one{# ثانیه پیش}other{# ثانیه پیش}',
      F:'one{# ثانیه بعد}other{# ثانیه بعد}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'هفتهٔ گذشته','0':'این هفته','1':'هفتهٔ آینده'},
      P:'one{# هفته پیش}other{# هفته پیش}',
      F:'one{# هفته بعد}other{# هفته بعد}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'سال گذشته','0':'امسال','1':'سال آینده'},
      P:'one{# سال پیش}other{# سال پیش}',
      F:'one{# سال بعد}other{# سال بعد}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_fi =  {
  DAY: {
    LONG:{
      R:{'-1':'eilen','-2':'toissa päivänä','0':'tänään','1':'huomenna','2':'ylihuomenna'},
      P:'one{# päivä sitten}other{# päivää sitten}',
      F:'one{# päivän päästä}other{# päivän päästä}',
    },
    SHORT:{
      R:{'-1':'eilen','-2':'toissap.','0':'tänään','1':'huom.','2':'ylihuom.'},
      P:'one{# pv sitten}other{# pv sitten}',
      F:'one{# pv päästä}other{# pv päästä}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'tämän tunnin aikana'},
      P:'one{# tunti sitten}other{# tuntia sitten}',
      F:'one{# tunnin päästä}other{# tunnin päästä}',
    },
    SHORT:{
      R:{'0':'tunnin sisällä'},
      P:'one{# t sitten}other{# t sitten}',
      F:'one{# t päästä}other{# t päästä}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'tämän minuutin aikana'},
      P:'one{# minuutti sitten}other{# minuuttia sitten}',
      F:'one{# minuutin päästä}other{# minuutin päästä}',
    },
    SHORT:{
      R:{'0':'minuutin sisällä'},
      P:'one{# min sitten}other{# min sitten}',
      F:'one{# min päästä}other{# min päästä}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'viime kuussa','0':'tässä kuussa','1':'ensi kuussa'},
      P:'one{# kuukausi sitten}other{# kuukautta sitten}',
      F:'one{# kuukauden päästä}other{# kuukauden päästä}',
    },
    SHORT:{
      R:{'-1':'viime kk','0':'tässä kk','1':'ensi kk'},
      P:'one{# kk sitten}other{# kk sitten}',
      F:'one{# kk päästä}other{# kk päästä}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'viime neljännesvuonna','0':'tänä neljännesvuonna','1':'ensi neljännesvuonna'},
      P:'one{# neljännesvuosi sitten}other{# neljännesvuotta sitten}',
      F:'one{# neljännesvuoden päästä}other{# neljännesvuoden päästä}',
    },
    SHORT:{
      R:{'-1':'viime neljänneksenä','0':'tänä neljänneksenä','1':'ensi neljänneksenä'},
      P:'one{# neljännes sitten}other{# neljännestä sitten}',
      F:'one{# neljänneksen päästä}other{# neljänneksen päästä}',
    },
    NARROW:{
      R:{'-1':'viime nelj.','0':'tänä nelj.','1':'ensi nelj.'},
      P:'one{# nelj. sitten}other{# nelj. sitten}',
      F:'one{# nelj. päästä}other{# nelj. päästä}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nyt'},
      P:'one{# sekunti sitten}other{# sekuntia sitten}',
      F:'one{# sekunnin päästä}other{# sekunnin päästä}',
    },
    SHORT:{
      R:{'0':'nyt'},
      P:'one{# s sitten}other{# s sitten}',
      F:'one{# s päästä}other{# s päästä}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'viime viikolla','0':'tällä viikolla','1':'ensi viikolla'},
      P:'one{# viikko sitten}other{# viikkoa sitten}',
      F:'one{# viikon päästä}other{# viikon päästä}',
    },
    SHORT:{
      R:{'-1':'viime vk','0':'tällä vk','1':'ensi vk'},
      P:'one{# vk sitten}other{# vk sitten}',
      F:'one{# vk päästä}other{# vk päästä}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'viime vuonna','0':'tänä vuonna','1':'ensi vuonna'},
      P:'one{# vuosi sitten}other{# vuotta sitten}',
      F:'one{# vuoden päästä}other{# vuoden päästä}',
    },
    SHORT:{
      R:{'-1':'viime v','0':'tänä v','1':'ensi v'},
      P:'one{# v sitten}other{# v sitten}',
      F:'one{# v päästä}other{# v päästä}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_fil =  {
  DAY: {
    LONG:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # araw}other{sa # (na) araw}',
    },
    SHORT:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# (na) araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # (na) araw}other{sa # (na) araw}',
    },
    NARROW:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # araw}other{sa # (na) araw}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ngayong oras'},
      P:'one{# oras ang nakalipas}other{# (na) oras ang nakalipas}',
      F:'one{sa # oras}other{sa # (na) oras}',
    },
    NARROW:{
      R:{'0':'ngayong oras'},
      P:'one{# oras nakalipas}other{# (na) oras nakalipas}',
      F:'one{sa # oras}other{sa # (na) oras}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'sa minutong ito'},
      P:'one{# minuto ang nakalipas}other{# (na) minuto ang nakalipas}',
      F:'one{sa # minuto}other{sa # (na) minuto}',
    },
    SHORT:{
      R:{'0':'sa minutong ito'},
      P:'one{# min. ang nakalipas}other{# (na) min. ang nakalipas}',
      F:'one{sa # min.}other{sa # (na) min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'nakaraang buwan','0':'ngayong buwan','1':'susunod na buwan'},
      P:'one{# buwan ang nakalipas}other{# (na) buwan ang nakalipas}',
      F:'one{sa # buwan}other{sa # (na) buwan}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # quarter}other{sa # (na) quarter}',
    },
    SHORT:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # (na) quarter}other{sa # (na) quarter}',
    },
    NARROW:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # quarter}other{sa # (na) quarter}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ngayon'},
      P:'one{# segundo ang nakalipas}other{# (na) segundo ang nakalipas}',
      F:'one{sa # segundo}other{sa # (na) segundo}',
    },
    SHORT:{
      R:{'0':'ngayon'},
      P:'one{# seg. ang nakalipas}other{# (na) seg. nakalipas}',
      F:'one{sa # seg.}other{sa # (na) seg.}',
    },
    NARROW:{
      R:{'0':'ngayon'},
      P:'one{# seg. nakalipas}other{# (na) seg. nakalipas}',
      F:'one{sa # seg.}other{sa # (na) seg.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'nakalipas na linggo','0':'sa linggong ito','1':'susunod na linggo'},
      P:'one{# linggo ang nakalipas}other{# (na) linggo ang nakalipas}',
      F:'one{sa # linggo}other{sa # (na) linggo}',
    },
    SHORT:{
      R:{'-1':'nakaraang linggo','0':'ngayong linggo','1':'susunod na linggo'},
      P:'one{# linggo ang nakalipas}other{# (na) linggo ang nakalipas}',
      F:'one{sa # linggo}other{sa # (na) linggo}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'nakaraang taon','0':'ngayong taon','1':'susunod na taon'},
      P:'one{# taon ang nakalipas}other{# (na) taon ang nakalipas}',
      F:'one{sa # taon}other{sa # (na) taon}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_fr =  {
  DAY: {
    LONG:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{il y a # jour}other{il y a # jours}',
      F:'one{dans # jour}other{dans # jours}',
    },
    SHORT:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{il y a # j}other{il y a # j}',
      F:'one{dans # j}other{dans # j}',
    },
    NARROW:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{-# j}other{-# j}',
      F:'one{+# j}other{+# j}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'cette heure-ci'},
      P:'one{il y a # heure}other{il y a # heures}',
      F:'one{dans # heure}other{dans # heures}',
    },
    SHORT:{
      R:{'0':'cette heure-ci'},
      P:'one{il y a # h}other{il y a # h}',
      F:'one{dans # h}other{dans # h}',
    },
    NARROW:{
      R:{'0':'cette heure-ci'},
      P:'one{-# h}other{-# h}',
      F:'one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'cette minute-ci'},
      P:'one{il y a # minute}other{il y a # minutes}',
      F:'one{dans # minute}other{dans # minutes}',
    },
    SHORT:{
      R:{'0':'cette minute-ci'},
      P:'one{il y a # min}other{il y a # min}',
      F:'one{dans # min}other{dans # min}',
    },
    NARROW:{
      R:{'0':'cette minute-ci'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{il y a # mois}other{il y a # mois}',
      F:'one{dans # mois}other{dans # mois}',
    },
    SHORT:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{il y a # m.}other{il y a # m.}',
      F:'one{dans # m.}other{dans # m.}',
    },
    NARROW:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{-# m.}other{-# m.}',
      F:'one{+# m.}other{+# m.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'le trimestre dernier','0':'ce trimestre','1':'le trimestre prochain'},
      P:'one{il y a # trimestre}other{il y a # trimestres}',
      F:'one{dans # trimestre}other{dans # trimestres}',
    },
    SHORT:{
      R:{'-1':'le trimestre dernier','0':'ce trimestre','1':'le trimestre prochain'},
      P:'one{il y a # trim.}other{il y a # trim.}',
      F:'one{dans # trim.}other{dans # trim.}',
    },
    NARROW:{
      R:{'-1':'le trimestre dernier','0':'ce trimestre','1':'le trimestre prochain'},
      P:'one{-# trim.}other{-# trim.}',
      F:'one{+# trim.}other{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'maintenant'},
      P:'one{il y a # seconde}other{il y a # secondes}',
      F:'one{dans # seconde}other{dans # secondes}',
    },
    SHORT:{
      R:{'0':'maintenant'},
      P:'one{il y a # s}other{il y a # s}',
      F:'one{dans # s}other{dans # s}',
    },
    NARROW:{
      R:{'0':'maintenant'},
      P:'one{-# s}other{-# s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{il y a # semaine}other{il y a # semaines}',
      F:'one{dans # semaine}other{dans # semaines}',
    },
    SHORT:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{il y a # sem.}other{il y a # sem.}',
      F:'one{dans # sem.}other{dans # sem.}',
    },
    NARROW:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{-# sem.}other{-# sem.}',
      F:'one{+# sem.}other{+# sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{il y a # an}other{il y a # ans}',
      F:'one{dans # an}other{dans # ans}',
    },
    SHORT:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{il y a # a}other{il y a # a}',
      F:'one{dans # a}other{dans # a}',
    },
    NARROW:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{-# a}other{-# a}',
      F:'one{+# a}other{+# a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_fr_CA =  {
  DAY: {
    LONG:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{il y a # jour}other{il y a # jours}',
      F:'one{dans # jour}other{dans # jours}',
    },
    SHORT:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{il y a # j}other{il y a # j}',
      F:'other{dans # j}',
    },
    NARROW:{
      R:{'-1':'hier','-2':'avant-hier','0':'aujourd’hui','1':'demain','2':'après-demain'},
      P:'one{-# j}other{-# j}',
      F:'one{+# j}other{+# j}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'cette heure-ci'},
      P:'one{il y a # heure}other{il y a # heures}',
      F:'one{dans # heure}other{dans # heures}',
    },
    SHORT:{
      R:{'0':'cette heure-ci'},
      P:'one{il y a # h}other{il y a # h}',
      F:'one{dans # h}other{dans # h}',
    },
    NARROW:{
      R:{'0':'cette heure-ci'},
      P:'one{-# h}other{-# h}',
      F:'one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'cette minute-ci'},
      P:'one{il y a # minute}other{il y a # minutes}',
      F:'one{dans # minute}other{dans # minutes}',
    },
    SHORT:{
      R:{'0':'cette minute-ci'},
      P:'one{il y a # min}other{il y a # min}',
      F:'one{dans # min}other{dans # min}',
    },
    NARROW:{
      R:{'0':'cette minute-ci'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{il y a # mois}other{il y a # mois}',
      F:'one{dans # mois}other{dans # mois}',
    },
    SHORT:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{il y a # m.}other{il y a # m.}',
      F:'one{dans # m.}other{dans # m.}',
    },
    NARROW:{
      R:{'-1':'le mois dernier','0':'ce mois-ci','1':'le mois prochain'},
      P:'one{-# m.}other{-# m.}',
      F:'one{+# m.}other{+# m.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'le trimestre dernier','0':'ce trimestre-ci','1':'le trimestre prochain'},
      P:'one{il y a # trimestre}other{il y a # trimestres}',
      F:'one{dans # trimestre}other{dans # trimestres}',
    },
    SHORT:{
      R:{'-1':'trim. dernier','1':'trim. prochain'},
      P:'one{il y a # trim.}other{il y a # trim.}',
      F:'one{dans # trim.}other{dans # trim.}',
    },
    NARROW:{
      R:{'-1':'trim. dernier','1':'trim.prochain'},
      P:'one{-# trim.}other{-# trim.}',
      F:'one{+# trim.}other{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'maintenant'},
      P:'one{il y a # seconde}other{il y a # secondes}',
      F:'one{dans # seconde}other{dans # secondes}',
    },
    SHORT:{
      R:{'0':'maintenant'},
      P:'one{il y a # s}other{il y a # s}',
      F:'one{dans # s}other{dans # s}',
    },
    NARROW:{
      R:{'0':'maintenant'},
      P:'one{-# s}other{-# s}',
      F:'one{+ # s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{il y a # semaine}other{il y a # semaines}',
      F:'one{dans # semaine}other{dans # semaines}',
    },
    SHORT:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{il y a # sem.}other{il y a # sem.}',
      F:'one{dans # sem.}other{dans # sem.}',
    },
    NARROW:{
      R:{'-1':'la semaine dernière','0':'cette semaine','1':'la semaine prochaine'},
      P:'one{-# sem.}other{-# sem.}',
      F:'one{+# sem.}other{+# sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{Il y a # an}other{Il y a # ans}',
      F:'one{Dans # an}other{Dans # ans}',
    },
    SHORT:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{il y a # a}other{il y a # a}',
      F:'one{dans # a}other{dans # a}',
    },
    NARROW:{
      R:{'-1':'l’année dernière','0':'cette année','1':'l’année prochaine'},
      P:'one{-# a}other{-# a}',
      F:'one{+# a}other{+# a}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ga =  {
  DAY: {
    LONG:{
      R:{'-1':'inné','-2':'arú inné','0':'inniu','1':'amárach','2':'arú amárach'},
      P:'few{# lá ó shin}many{# lá ó shin}one{# lá ó shin}other{# lá ó shin}two{# lá ó shin}',
      F:'few{i gceann # lá}many{i gceann # lá}one{i gceann # lá}other{i gceann # lá}two{i gceann # lá}',
    },
    NARROW:{
      R:{'-1':'inné','-2':'arú inné','0':'inniu','1':'amárach','2':'arú amárach'},
      P:'few{-# lá}many{-# lá}one{-# lá}other{-# lá}two{-# lá}',
      F:'few{+# lá}many{+# lá}one{+# lá}other{+# lá}two{+# lá}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'an uair seo'},
      P:'few{# huaire an chloig ó shin}many{# n-uaire an chloig ó shin}one{# uair an chloig ó shin}other{# uair an chloig ó shin}two{# uair an chloig ó shin}',
      F:'few{i gceann # huaire an chloig}many{i gceann # n-uaire an chloig}one{i gceann # uair an chloig}other{i gceann # uair an chloig}two{i gceann # uair an chloig}',
    },
    SHORT:{
      R:{'0':'an uair seo'},
      P:'few{# huaire ó shin}many{# n-uaire ó shin}one{# uair ó shin}other{# uair ó shin}two{# uair ó shin}',
      F:'few{i gceann # huaire}many{i gceann # n-uaire}one{i gceann # uair}other{i gceann # uair}two{i gceann # uair}',
    },
    NARROW:{
      R:{'0':'an uair seo'},
      P:'few{-# u}many{-# u}one{-# u}other{-# u}two{-# u}',
      F:'few{+# u}many{+# u}one{+# u}other{+# u}two{+# u}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'an nóiméad seo'},
      P:'few{# nóiméad ó shin}many{# nóiméad ó shin}one{# nóiméad ó shin}other{# nóiméad ó shin}two{# nóiméad ó shin}',
      F:'few{i gceann # nóiméad}many{i gceann # nóiméad}one{i gceann # nóiméad}other{i gceann # nóiméad}two{i gceann # nóiméad}',
    },
    SHORT:{
      R:{'0':'an nóiméad seo'},
      P:'few{# nóim. ó shin}many{# nóim. ó shin}one{# nóim. ó shin}other{# nóim. ó shin}two{# nóim. ó shin}',
      F:'few{i gceann # nóim.}many{i gceann # nóim.}one{i gceann # nóim.}other{i gceann # nóim.}two{i gceann # nóim.}',
    },
    NARROW:{
      R:{'0':'an nóiméad seo'},
      P:'few{-# n}many{-# n}one{-# n}other{-# n}two{-# n}',
      F:'few{+# n}many{+# n}one{+# n}other{+# n}two{+# n}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'an mhí seo caite','0':'an mhí seo','1':'an mhí seo chugainn'},
      P:'few{# mhí ó shin}many{# mí ó shin}one{# mhí ó shin}other{# mí ó shin}two{# mhí ó shin}',
      F:'few{i gceann # mhí}many{i gceann # mí}one{i gceann # mhí}other{i gceann # mí}two{i gceann # mhí}',
    },
    NARROW:{
      R:{'-1':'an mhí seo caite','0':'an mhí seo','1':'an mhí seo chugainn'},
      P:'few{-# mhí}many{-# mí}one{-# mhí}other{-# mí}two{-# mhí}',
      F:'few{+# mhí}many{+# mí}one{+# mhí}other{+# mí}two{+# mhí}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'an ráithe seo caite','0':'an ráithe seo','1':'an ráithe seo chugainn'},
      P:'few{# ráithe ó shin}many{# ráithe ó shin}one{# ráithe ó shin}other{# ráithe ó shin}two{# ráithe ó shin}',
      F:'few{i gceann # ráithe}many{i gceann # ráithe}one{i gceann # ráithe}other{i gceann # ráithe}two{i gceann # ráithe}',
    },
    NARROW:{
      R:{'-1':'an ráithe seo caite','0':'an ráithe seo','1':'an ráithe seo chugainn'},
      P:'few{-# R}many{-# R}one{-# R}other{-# R}two{-# R}',
      F:'few{+# R}many{+# R}one{+# R}other{+# R}two{+# R}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'anois'},
      P:'few{# shoicind ó shin}many{# soicind ó shin}one{# soicind ó shin}other{# soicind ó shin}two{# shoicind ó shin}',
      F:'few{i gceann # shoicind}many{i gceann # soicind}one{i gceann # soicind}other{i gceann # soicind}two{i gceann # shoicind}',
    },
    SHORT:{
      R:{'0':'anois'},
      P:'few{# shoic. ó shin}many{# soic. ó shin}one{# soic. ó shin}other{# soic. ó shin}two{# shoic. ó shin}',
      F:'few{i gceann # shoic.}many{i gceann # soic.}one{i gceann # soic.}other{i gceann # soic.}two{i gceann # shoic.}',
    },
    NARROW:{
      R:{'0':'anois'},
      P:'few{-# s}many{-# s}one{-# s}other{-# s}two{-# s}',
      F:'few{+# s}many{+# s}one{+# s}other{+# s}two{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'an tseachtain seo caite','0':'an tseachtain seo','1':'an tseachtain seo chugainn'},
      P:'few{# seachtaine ó shin}many{# seachtaine ó shin}one{# seachtain ó shin}other{# seachtain ó shin}two{# sheachtain ó shin}',
      F:'few{i gceann # seachtaine}many{i gceann # seachtaine}one{i gceann # seachtain}other{i gceann # seachtain}two{i gceann # sheachtain}',
    },
    SHORT:{
      R:{'-1':'an tscht. seo caite','0':'an tscht. seo','1':'an tscht. seo chugainn'},
      P:'few{# scht. ó shin}many{# scht. ó shin}one{# scht. ó shin}other{# scht. ó shin}two{# scht. ó shin}',
      F:'few{i gceann # scht.}many{i gceann # scht.}one{i gceann # scht.}other{i gceann # scht.}two{i gceann # shcht.}',
    },
    NARROW:{
      R:{'-1':'an tscht. seo caite','0':'an tscht. seo','1':'an tscht. seo chugainn'},
      P:'few{-# scht.}many{-# scht.}one{-# scht.}other{-# scht.}two{-# scht.}',
      F:'few{+# scht.}many{+# scht.}one{+# scht.}other{+# scht.}two{+# scht.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'anuraidh','0':'an bhliain seo','1':'an bhliain seo chugainn'},
      P:'few{# bliana ó shin}many{# mbliana ó shin}one{# bhliain ó shin}other{# bliain ó shin}two{# bhliain ó shin}',
      F:'few{i gceann # bliana}many{i gceann # mbliana}one{i gceann # bhliain}other{i gceann # bliain}two{i gceann # bhliain}',
    },
    SHORT:{
      R:{'-1':'anuraidh','0':'an bhl. seo','1':'an bhl. seo chugainn'},
      P:'few{# bl. ó shin}many{# mbl. ó shin}one{# bhl. ó shin}other{# bl. ó shin}two{# bhl. ó shin}',
      F:'few{i gceann # bl.}many{i gceann # mbl.}one{i gceann # bl.}other{i gceann # bl.}two{i gceann # bhl.}',
    },
    NARROW:{
      R:{'-1':'anuraidh','0':'an bhl. seo','1':'an bhl. seo chugainn'},
      P:'few{-# bl.}many{-# mbl.}one{-# bhl.}other{-# bl.}two{-# bhl.}',
      F:'few{+# bl.}many{+# mbl.}one{+# bhl.}other{+# bl.}two{+# bhl.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_gl =  {
  DAY: {
    LONG:{
      R:{'-1':'onte','-2':'antonte','0':'hoxe','1':'mañá','2':'pasadomañá'},
      P:'one{hai # día}other{hai # días}',
      F:'one{en # día}other{en # días}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{hai # hora}other{hai # horas}',
      F:'one{en # hora}other{en # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{hai # h}other{hai # h}',
      F:'one{en # h}other{en # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{hai # minuto}other{hai # minutos}',
      F:'one{en # minuto}other{en # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{hai # min}other{hai # min}',
      F:'one{en # min}other{en # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'o mes pasado','0':'este mes','1':'o próximo mes'},
      P:'one{hai # mes}other{hai # meses}',
      F:'one{en # mes}other{en # meses}',
    },
    SHORT:{
      R:{'-1':'m. pasado','0':'este m.','1':'m. seguinte'},
      P:'one{hai # mes}other{hai # meses}',
      F:'one{en # mes}other{en # meses}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'o trimestre pasado','0':'este trimestre','1':'o próximo trimestre'},
      P:'one{hai # trimestre}other{hai # trimestres}',
      F:'one{en # trimestre}other{en # trimestres}',
    },
    SHORT:{
      R:{'-1':'trim. pasado','0':'este trim.','1':'trim. seguinte'},
      P:'one{hai # trim.}other{hai # trim.}',
      F:'one{en # trim.}other{en # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'agora'},
      P:'one{hai # segundo}other{hai # segundos}',
      F:'one{en # segundo}other{en # segundos}',
    },
    SHORT:{
      R:{'0':'agora'},
      P:'one{hai # s}other{hai # s}',
      F:'one{en # s}other{en # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'a semana pasada','0':'esta semana','1':'a próxima semana'},
      P:'one{hai # semana}other{hai # semanas}',
      F:'one{en # semana}other{en # semanas}',
    },
    SHORT:{
      R:{'-1':'sem. pasada','0':'esta sem.','1':'sem. seguinte'},
      P:'one{hai # sem.}other{hai # sem.}',
      F:'one{en # sem.}other{en # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'o ano pasado','0':'este ano','1':'o próximo ano'},
      P:'one{hai # ano}other{hai # anos}',
      F:'one{en # ano}other{en # anos}',
    },
    SHORT:{
      R:{'-1':'ano pasado','0':'este ano','1':'seguinte ano'},
      P:'one{hai # ano}other{hai # anos}',
      F:'one{en # ano}other{en # anos}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_gsw =  {
  DAY: {
    LONG:{
      R:{'-1':'geschter','-2':'vorgeschter','0':'hüt','1':'moorn','2':'übermoorn'},
      P:'other{-# d}',
      F:'other{+# d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'other{-# h}',
      F:'other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'other{-# min}',
      F:'other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'other{-# m}',
      F:'other{+# m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'other{-# Q}',
      F:'other{+# Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'other{-# s}',
      F:'other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'other{-# w}',
      F:'other{+# w}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'other{-# y}',
      F:'other{+# y}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_gu =  {
  DAY: {
    LONG:{
      R:{'-1':'ગઈકાલે','-2':'ગયા પરમદિવસે','0':'આજે','1':'આવતીકાલે','2':'પરમદિવસે'},
      P:'one{# દિવસ પહેલાં}other{# દિવસ પહેલાં}',
      F:'one{# દિવસમાં}other{# દિવસમાં}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'આ કલાક'},
      P:'one{# કલાક પહેલાં}other{# કલાક પહેલાં}',
      F:'one{# કલાકમાં}other{# કલાકમાં}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'આ મિનિટ'},
      P:'one{# મિનિટ પહેલાં}other{# મિનિટ પહેલાં}',
      F:'one{# મિનિટમાં}other{# મિનિટમાં}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ગયા મહિને','0':'આ મહિને','1':'આવતા મહિને'},
      P:'one{# મહિના પહેલાં}other{# મહિના પહેલાં}',
      F:'one{# મહિનામાં}other{# મહિનામાં}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'છેલ્લું ત્રિમાસિક','0':'આ ત્રિમાસિક','1':'પછીનું ત્રિમાસિક'},
      P:'one{# ત્રિમાસિક પહેલાં}other{# ત્રિમાસિક પહેલાં}',
      F:'one{# ત્રિમાસિકમાં}other{# ત્રિમાસિકમાં}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'હમણાં'},
      P:'one{# સેકંડ પહેલાં}other{# સેકંડ પહેલાં}',
      F:'one{# સેકંડમાં}other{# સેકંડમાં}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ગયા અઠવાડિયે','0':'આ અઠવાડિયે','1':'આવતા અઠવાડિયે'},
      P:'one{# અઠવાડિયા પહેલાં}other{# અઠવાડિયા પહેલાં}',
      F:'one{# અઠવાડિયામાં}other{# અઠવાડિયામાં}',
    },
    SHORT:{
      R:{'-1':'ગયા અઠવાડિયે','0':'આ અઠવાડિયે','1':'આવતા અઠવાડિયે'},
      P:'one{# અઠ. પહેલાં}other{# અઠ. પહેલાં}',
      F:'one{# અઠ. માં}other{# અઠ. માં}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ગયા વર્ષે','0':'આ વર્ષે','1':'આવતા વર્ષે'},
      P:'one{# વર્ષ પહેલાં}other{# વર્ષ પહેલાં}',
      F:'one{# વર્ષમાં}other{# વર્ષમાં}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_haw =  {
  DAY: {
    LONG:{
      R:{'-1':'yesterday','0':'today','1':'tomorrow'},
      P:'other{-# d}',
      F:'other{+# d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'other{-# h}',
      F:'other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'other{-# min}',
      F:'other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'other{-# m}',
      F:'other{+# m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'other{-# Q}',
      F:'other{+# Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'other{-# s}',
      F:'other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'other{-# w}',
      F:'other{+# w}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'other{-# y}',
      F:'other{+# y}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_he =  {
  DAY: {
    LONG:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר','2':'מחרתיים'},
      P:'many{לפני # ימים}one{לפני יום #}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{בעוד יום #}other{בעוד # ימים}two{בעוד יומיים}',
    },
    SHORT:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר','2':'מחרתיים'},
      P:'many{לפני # ימים}one{אתמול}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{מחר}other{בעוד # ימים}two{בעוד יומיים}',
    },
    NARROW:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר'},
      P:'many{לפני # ימים}one{אתמול}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{מחר}other{בעוד # ימים}two{בעוד יומיים}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'בשעה זו'},
      P:'many{לפני # שעות}one{לפני שעה}other{לפני # שעות}two{לפני שעתיים}',
      F:'many{בעוד # שעות}one{בעוד שעה}other{בעוד # שעות}two{בעוד שעתיים}',
    },
    SHORT:{
      R:{'0':'בשעה זו'},
      P:'many{לפני # שע׳}one{לפני שעה}other{לפני # שע׳}two{לפני שעתיים}',
      F:'many{בעוד # שע׳}one{בעוד שעה}other{בעוד # שע׳}two{בעוד שעתיים}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דקות}one{לפני דקה}other{לפני # דקות}two{לפני שתי דקות}',
      F:'many{בעוד # דקות}one{בעוד דקה}other{בעוד # דקות}two{בעוד שתי דקות}',
    },
    SHORT:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דק׳}one{לפני דקה}other{לפני # דק׳}two{לפני # דק׳}',
      F:'many{בעוד # דק׳}one{בעוד דקה}other{בעוד # דק׳}two{בעוד שתי דק׳}',
    },
    NARROW:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דק׳}one{לפני דקה}other{לפני # דק׳}two{לפני שתי דק׳}',
      F:'many{בעוד # דק׳}one{בעוד דקה}other{בעוד # דק׳}two{בעוד שתי דק׳}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'החודש שעבר','0':'החודש','1':'החודש הבא'},
      P:'many{לפני # חודשים}one{לפני חודש}other{לפני # חודשים}two{לפני חודשיים}',
      F:'many{בעוד # חודשים}one{בעוד חודש}other{בעוד # חודשים}two{בעוד חודשיים}',
    },
    NARROW:{
      R:{'-1':'החודש שעבר','0':'החודש','1':'החודש הבא'},
      P:'many{לפני # חו׳}one{לפני חו׳}other{לפני # חו׳}two{לפני חודשיים}',
      F:'many{בעוד # חו׳}one{בעוד חו׳}other{בעוד # חו׳}two{בעוד חודשיים}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'הרבעון הקודם','0':'רבעון זה','1':'הרבעון הבא'},
      P:'many{לפני # רבעונים}one{ברבעון הקודם}other{לפני # רבעונים}two{לפני שני רבעונים}',
      F:'many{בעוד # רבעונים}one{ברבעון הבא}other{בעוד # רבעונים}two{בעוד שני רבעונים}',
    },
    SHORT:{
      R:{'-1':'הרבעון הקודם','0':'רבעון זה','1':'הרבעון הבא'},
      P:'many{לפני # רבע׳}one{ברבע׳ הקודם}other{לפני # רבע׳}two{לפני שני רבע׳}',
      F:'many{בעוד # רבע׳}one{ברבע׳ הבא}other{בעוד # רבע׳}two{בעוד שני רבע׳}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'עכשיו'},
      P:'many{לפני # שניות}one{לפני שנייה}other{לפני # שניות}two{לפני שתי שניות}',
      F:'many{בעוד # שניות}one{בעוד שנייה}other{בעוד # שניות}two{בעוד שתי שניות}',
    },
    SHORT:{
      R:{'0':'עכשיו'},
      P:'many{לפני # שנ׳}one{לפני שנ׳}other{לפני # שנ׳}two{לפני שתי שנ׳}',
      F:'many{בעוד # שנ׳}one{בעוד שנ׳}other{בעוד # שנ׳}two{בעוד שתי שנ׳}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שבועות}one{לפני שבוע}other{לפני # שבועות}two{לפני שבועיים}',
      F:'many{בעוד # שבועות}one{בעוד שבוע}other{בעוד # שבועות}two{בעוד שבועיים}',
    },
    SHORT:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שב׳}one{לפני שב׳}other{לפני # שב׳}two{לפני שבועיים}',
      F:'many{בעוד # שב׳}one{בעוד שב׳}other{בעוד # שב׳}two{בעוד שבועיים}',
    },
    NARROW:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שב׳}one{לפני שבוע}other{לפני # שב׳}two{לפני שבועיים}',
      F:'many{בעוד # שב׳}one{בעוד שב׳}other{בעוד # שב׳}two{בעוד שבועיים}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'השנה שעברה','0':'השנה','1':'השנה הבאה'},
      P:'many{לפני # שנה}one{לפני שנה}other{לפני # שנים}two{לפני שנתיים}',
      F:'many{בעוד # שנה}one{בעוד שנה}other{בעוד # שנים}two{בעוד שנתיים}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_hi =  {
  DAY: {
    LONG:{
      R:{'-1':'कल','-2':'परसों','0':'आज','1':'कल','2':'परसों'},
      P:'one{# दिन पहले}other{# दिन पहले}',
      F:'one{# दिन में}other{# दिन में}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'यह घंटा'},
      P:'one{# घंटे पहले}other{# घंटे पहले}',
      F:'one{# घंटे में}other{# घंटे में}',
    },
    SHORT:{
      R:{'0':'यह घंटा'},
      P:'one{# घं॰ पहले}other{# घं॰ पहले}',
      F:'one{# घं॰ में}other{# घं॰ में}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'यह मिनट'},
      P:'one{# मिनट पहले}other{# मिनट पहले}',
      F:'one{# मिनट में}other{# मिनट में}',
    },
    SHORT:{
      R:{'0':'यह मिनट'},
      P:'one{# मि॰ पहले}other{# मि॰ पहले}',
      F:'one{# मि॰ में}other{# मि॰ में}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'पिछला माह','0':'इस माह','1':'अगला माह'},
      P:'one{# माह पहले}other{# माह पहले}',
      F:'one{# माह में}other{# माह में}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'अंतिम तिमाही','0':'इस तिमाही','1':'अगली तिमाही'},
      P:'one{# तिमाही पहले}other{# तिमाही पहले}',
      F:'one{# तिमाही में}other{# तिमाहियों में}',
    },
    SHORT:{
      R:{'-1':'अंतिम तिमाही','0':'इस तिमाही','1':'अगली तिमाही'},
      P:'one{# तिमाही पहले}other{# तिमाहियों पहले}',
      F:'one{# तिमाही में}other{# तिमाहियों में}',
    },
    NARROW:{
      R:{'-1':'अंतिम तिमाही','0':'इस तिमाही','1':'अगली तिमाही'},
      P:'one{# ति॰ पहले}other{# ति॰ पहले}',
      F:'one{# ति॰ में}other{# ति॰ में}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'अब'},
      P:'one{# सेकंड पहले}other{# सेकंड पहले}',
      F:'one{# सेकंड में}other{# सेकंड में}',
    },
    SHORT:{
      R:{'0':'अब'},
      P:'one{# से॰ पहले}other{# से॰ पहले}',
      F:'one{# से॰ में}other{# से॰ में}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'पिछला सप्ताह','0':'इस सप्ताह','1':'अगला सप्ताह'},
      P:'one{# सप्ताह पहले}other{# सप्ताह पहले}',
      F:'one{# सप्ताह में}other{# सप्ताह में}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'पिछला वर्ष','0':'इस वर्ष','1':'अगला वर्ष'},
      P:'one{# वर्ष पहले}other{# वर्ष पहले}',
      F:'one{# वर्ष में}other{# वर्ष में}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_hr =  {
  DAY: {
    LONG:{
      R:{'-1':'jučer','-2':'prekjučer','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{prije # dana}one{prije # dan}other{prije # dana}',
      F:'few{za # dana}one{za # dan}other{za # dana}',
    },
    NARROW:{
      R:{'-1':'jučer','-2':'prekjučer','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{prije # d}one{prije # d}other{prije # d}',
      F:'few{za # d}one{za # d}other{za # d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ovaj sat'},
      P:'few{prije # sata}one{prije # sat}other{prije # sati}',
      F:'few{za # sata}one{za # sat}other{za # sati}',
    },
    SHORT:{
      R:{'0':'ovaj sat'},
      P:'few{prije # h}one{prije # h}other{prije # h}',
      F:'few{za # h}one{za # h}other{za # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ova minuta'},
      P:'few{prije # minute}one{prije # minutu}other{prije # minuta}',
      F:'few{za # minute}one{za # minutu}other{za # minuta}',
    },
    SHORT:{
      R:{'0':'ova minuta'},
      P:'few{prije # min}one{prije # min}other{prije # min}',
      F:'few{za # min}one{za # min}other{za # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'prošli mjesec','0':'ovaj mjesec','1':'sljedeći mjesec'},
      P:'few{prije # mjeseca}one{prije # mjesec}other{prije # mjeseci}',
      F:'few{za # mjeseca}one{za # mjesec}other{za # mjeseci}',
    },
    SHORT:{
      R:{'-1':'prošli mj.','0':'ovaj mj.','1':'sljedeći mj.'},
      P:'few{prije # mj.}one{prije # mj.}other{prije # mj.}',
      F:'few{za # mj.}one{za # mj.}other{za # mj.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'prošli kvartal','0':'ovaj kvartal','1':'sljedeći kvartal'},
      P:'few{prije # kvartala}one{prije # kvartal}other{prije # kvartala}',
      F:'few{za # kvartala}one{za # kvartal}other{za # kvartala}',
    },
    SHORT:{
      R:{'-1':'prošli kv.','0':'ovaj kv.','1':'sljedeći kv.'},
      P:'few{prije # kv.}one{prije # kv.}other{prije # kv.}',
      F:'few{za # kv.}one{za # kv.}other{za # kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sad'},
      P:'few{prije # sekunde}one{prije # sekundu}other{prije # sekundi}',
      F:'few{za # sekunde}one{za # sekundu}other{za # sekundi}',
    },
    SHORT:{
      R:{'0':'sad'},
      P:'few{prije # s}one{prije # s}other{prije # s}',
      F:'few{za # s}one{za # s}other{za # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'prošli tjedan','0':'ovaj tjedan','1':'sljedeći tjedan'},
      P:'few{prije # tjedna}one{prije # tjedan}other{prije # tjedana}',
      F:'few{za # tjedna}one{za # tjedan}other{za # tjedana}',
    },
    SHORT:{
      R:{'-1':'prošli tj.','0':'ovaj tj.','1':'sljedeći tj.'},
      P:'few{prije # tj.}one{prije # tj.}other{prije # tj.}',
      F:'few{za # tj.}one{za # tj.}other{za # tj.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sljedeće godine'},
      P:'few{prije # godine}one{prije # godinu}other{prije # godina}',
      F:'few{za # godine}one{za # godinu}other{za # godina}',
    },
    SHORT:{
      R:{'-1':'prošle god.','0':'ove god.','1':'sljedeće god.'},
      P:'few{prije # g.}one{prije # g.}other{prije # g.}',
      F:'few{za # g.}one{za # g.}other{za # g.}',
    },
    NARROW:{
      R:{'-1':'prošle g.','0':'ove g.','1':'sljedeće g.'},
      P:'few{prije # g.}one{prije # g.}other{prije # g.}',
      F:'few{za # g.}one{za # g.}other{za # g.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_hu =  {
  DAY: {
    LONG:{
      R:{'-1':'tegnap','-2':'tegnapelőtt','0':'ma','1':'holnap','2':'holnapután'},
      P:'one{# nappal ezelőtt}other{# nappal ezelőtt}',
      F:'one{# nap múlva}other{# nap múlva}',
    },
    SHORT:{
      R:{'-1':'tegnap','-2':'tegnapelőtt','0':'ma','1':'holnap','2':'holnapután'},
      P:'one{# napja}other{# napja}',
      F:'one{# nap múlva}other{# nap múlva}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ebben az órában'},
      P:'one{# órával ezelőtt}other{# órával ezelőtt}',
      F:'one{# óra múlva}other{# óra múlva}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ebben a percben'},
      P:'one{# perccel ezelőtt}other{# perccel ezelőtt}',
      F:'one{# perc múlva}other{# perc múlva}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'előző hónap','0':'ez a hónap','1':'következő hónap'},
      P:'one{# hónappal ezelőtt}other{# hónappal ezelőtt}',
      F:'one{# hónap múlva}other{# hónap múlva}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'előző negyedév','0':'ez a negyedév','1':'következő negyedév'},
      P:'one{# negyedévvel ezelőtt}other{# negyedévvel ezelőtt}',
      F:'one{# negyedév múlva}other{# negyedév múlva}',
    },
    NARROW:{
      R:{'-1':'előző negyedév','0':'ez a negyedév','1':'következő negyedév'},
      P:'one{# negyedévvel ezelőtt}other{# negyedévvel ezelőtt}',
      F:'one{# n.év múlva}other{# n.év múlva}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'most'},
      P:'one{# másodperccel ezelőtt}other{# másodperccel ezelőtt}',
      F:'one{# másodperc múlva}other{# másodperc múlva}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'előző hét','0':'ez a hét','1':'következő hét'},
      P:'one{# héttel ezelőtt}other{# héttel ezelőtt}',
      F:'one{# hét múlva}other{# hét múlva}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'előző év','0':'ez az év','1':'következő év'},
      P:'one{# évvel ezelőtt}other{# évvel ezelőtt}',
      F:'one{# év múlva}other{# év múlva}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_hy =  {
  DAY: {
    LONG:{
      R:{'-1':'երեկ','-2':'երեկ չէ առաջի օրը','0':'այսօր','1':'վաղը','2':'վաղը չէ մյուս օրը'},
      P:'one{# օր առաջ}other{# օր առաջ}',
      F:'one{# օրից}other{# օրից}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'այս ժամին'},
      P:'one{# ժամ առաջ}other{# ժամ առաջ}',
      F:'one{# ժամից}other{# ժամից}',
    },
    SHORT:{
      R:{'0':'այս ժամին'},
      P:'one{# ժ առաջ}other{# ժ առաջ}',
      F:'one{# ժ-ից}other{# ժ-ից}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'այս րոպեին'},
      P:'one{# րոպե առաջ}other{# րոպե առաջ}',
      F:'one{# րոպեից}other{# րոպեից}',
    },
    SHORT:{
      R:{'0':'այս րոպեին'},
      P:'one{# ր առաջ}other{# ր առաջ}',
      F:'one{# ր-ից}other{# ր-ից}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'նախորդ ամիս','0':'այս ամիս','1':'հաջորդ ամիս'},
      P:'one{# ամիս առաջ}other{# ամիս առաջ}',
      F:'one{# ամսից}other{# ամսից}',
    },
    SHORT:{
      R:{'-1':'անցյալ ամիս','0':'այս ամիս','1':'հաջորդ ամիս'},
      P:'one{# ամիս առաջ}other{# ամիս առաջ}',
      F:'one{# ամսից}other{# ամսից}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'նախորդ եռամսյակ','0':'այս եռամսյակ','1':'հաջորդ եռամսյակ'},
      P:'one{# եռամսյակ առաջ}other{# եռամսյակ առաջ}',
      F:'one{# եռամսյակից}other{# եռամսյակից}',
    },
    SHORT:{
      R:{'-1':'նախորդ եռամսյակ','0':'այս եռամսյակ','1':'հաջորդ եռամսյակ'},
      P:'one{# եռմս առաջ}other{# եռմս առաջ}',
      F:'one{# եռմս-ից}other{# եռմս-ից}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'հիմա'},
      P:'one{# վայրկյան առաջ}other{# վայրկյան առաջ}',
      F:'one{# վայրկյանից}other{# վայրկյանից}',
    },
    SHORT:{
      R:{'0':'հիմա'},
      P:'one{# վրկ առաջ}other{# վրկ առաջ}',
      F:'one{# վրկ-ից}other{# վրկ-ից}',
    },
    NARROW:{
      R:{'0':'հիմա'},
      P:'one{# վ առաջ}other{# վ առաջ}',
      F:'one{# վ-ից}other{# վ-ից}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'նախորդ շաբաթ','0':'այս շաբաթ','1':'հաջորդ շաբաթ'},
      P:'one{# շաբաթ առաջ}other{# շաբաթ առաջ}',
      F:'one{# շաբաթից}other{# շաբաթից}',
    },
    SHORT:{
      R:{'-1':'նախորդ շաբաթ','0':'այս շաբաթ','1':'հաջորդ շաբաթ'},
      P:'one{# շաբ առաջ}other{# շաբ առաջ}',
      F:'one{# շաբ-ից}other{# շաբ-ից}',
    },
    NARROW:{
      R:{'-1':'նախորդ շաբաթ','0':'այս շաբաթ','1':'հաջորդ շաբաթ'},
      P:'one{# շաբ առաջ}other{# շաբ առաջ}',
      F:'one{# շաբ անց}other{# շաբ անց}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'նախորդ տարի','0':'այս տարի','1':'հաջորդ տարի'},
      P:'one{# տարի առաջ}other{# տարի առաջ}',
      F:'one{# տարուց}other{# տարուց}',
    },
    SHORT:{
      R:{'-1':'նախորդ տարի','0':'այս տարի','1':'հաջորդ տարի'},
      P:'one{# տ առաջ}other{# տ առաջ}',
      F:'one{# տարուց}other{# տարուց}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_id =  {
  DAY: {
    LONG:{
      R:{'-1':'kemarin','-2':'kemarin dulu','0':'hari ini','1':'besok','2':'lusa'},
      P:'other{# hari yang lalu}',
      F:'other{dalam # hari}',
    },
    SHORT:{
      R:{'2':'lusa'},
      P:'other{# h lalu}',
      F:'other{dalam # h}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'jam ini'},
      P:'other{# jam yang lalu}',
      F:'other{dalam # jam}',
    },
    SHORT:{
      R:{'0':'jam ini'},
      P:'other{# jam lalu}',
      F:'other{dalam # jam}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'menit ini'},
      P:'other{# menit yang lalu}',
      F:'other{dalam # menit}',
    },
    SHORT:{
      R:{'0':'menit ini'},
      P:'other{# mnt lalu}',
      F:'other{dlm # mnt}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'bulan lalu','0':'bulan ini','1':'bulan berikutnya'},
      P:'other{# bulan yang lalu}',
      F:'other{dalam # bulan}',
    },
    SHORT:{
      R:{'-1':'bulan lalu','0':'bulan ini','1':'bulan berikutnya'},
      P:'other{# bln lalu}',
      F:'other{dlm # bln}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'Kuartal lalu','0':'kuartal ini','1':'kuartal berikutnya'},
      P:'other{# kuartal yang lalu}',
      F:'other{dalam # kuartal}',
    },
    SHORT:{
      R:{'-1':'Kuartal lalu','0':'kuartal ini','1':'kuartal berikutnya'},
      P:'other{# krtl. lalu}',
      F:'other{dlm # krtl.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sekarang'},
      P:'other{# detik yang lalu}',
      F:'other{dalam # detik}',
    },
    SHORT:{
      R:{'0':'sekarang'},
      P:'other{# dtk lalu}',
      F:'other{dlm # dtk}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'minggu lalu','0':'minggu ini','1':'minggu depan'},
      P:'other{# minggu yang lalu}',
      F:'other{dalam # minggu}',
    },
    SHORT:{
      R:{'-1':'minggu lalu','0':'minggu ini','1':'minggu depan'},
      P:'other{# mgg lalu}',
      F:'other{dlm # mgg}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'tahun lalu','0':'tahun ini','1':'tahun depan'},
      P:'other{# tahun yang lalu}',
      F:'other{dalam # tahun}',
    },
    SHORT:{
      R:{'-1':'tahun lalu','0':'tahun ini','1':'tahun depan'},
      P:'other{# thn lalu}',
      F:'other{dlm # thn}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_in =  {
  DAY: {
    LONG:{
      R:{'-1':'kemarin','-2':'kemarin dulu','0':'hari ini','1':'besok','2':'lusa'},
      P:'other{# hari yang lalu}',
      F:'other{dalam # hari}',
    },
    SHORT:{
      R:{'2':'lusa'},
      P:'other{# h lalu}',
      F:'other{dalam # h}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'jam ini'},
      P:'other{# jam yang lalu}',
      F:'other{dalam # jam}',
    },
    SHORT:{
      R:{'0':'jam ini'},
      P:'other{# jam lalu}',
      F:'other{dalam # jam}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'menit ini'},
      P:'other{# menit yang lalu}',
      F:'other{dalam # menit}',
    },
    SHORT:{
      R:{'0':'menit ini'},
      P:'other{# mnt lalu}',
      F:'other{dlm # mnt}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'bulan lalu','0':'bulan ini','1':'bulan berikutnya'},
      P:'other{# bulan yang lalu}',
      F:'other{dalam # bulan}',
    },
    SHORT:{
      R:{'-1':'bulan lalu','0':'bulan ini','1':'bulan berikutnya'},
      P:'other{# bln lalu}',
      F:'other{dlm # bln}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'Kuartal lalu','0':'kuartal ini','1':'kuartal berikutnya'},
      P:'other{# kuartal yang lalu}',
      F:'other{dalam # kuartal}',
    },
    SHORT:{
      R:{'-1':'Kuartal lalu','0':'kuartal ini','1':'kuartal berikutnya'},
      P:'other{# krtl. lalu}',
      F:'other{dlm # krtl.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sekarang'},
      P:'other{# detik yang lalu}',
      F:'other{dalam # detik}',
    },
    SHORT:{
      R:{'0':'sekarang'},
      P:'other{# dtk lalu}',
      F:'other{dlm # dtk}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'minggu lalu','0':'minggu ini','1':'minggu depan'},
      P:'other{# minggu yang lalu}',
      F:'other{dalam # minggu}',
    },
    SHORT:{
      R:{'-1':'minggu lalu','0':'minggu ini','1':'minggu depan'},
      P:'other{# mgg lalu}',
      F:'other{dlm # mgg}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'tahun lalu','0':'tahun ini','1':'tahun depan'},
      P:'other{# tahun yang lalu}',
      F:'other{dalam # tahun}',
    },
    SHORT:{
      R:{'-1':'tahun lalu','0':'tahun ini','1':'tahun depan'},
      P:'other{# thn lalu}',
      F:'other{dlm # thn}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_is =  {
  DAY: {
    LONG:{
      R:{'-1':'í gær','-2':'í fyrradag','0':'í dag','1':'á morgun','2':'eftir tvo daga'},
      P:'one{fyrir # degi}other{fyrir # dögum}',
      F:'one{eftir # dag}other{eftir # daga}',
    },
    NARROW:{
      R:{'-1':'í gær','-2':'í fyrradag','0':'í dag','1':'á morgun','2':'eftir tvo daga'},
      P:'one{-# degi}other{-# dögum}',
      F:'one{+# dag}other{+# daga}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'þessa stundina'},
      P:'one{fyrir # klukkustund}other{fyrir # klukkustundum}',
      F:'one{eftir # klukkustund}other{eftir # klukkustundir}',
    },
    SHORT:{
      R:{'0':'þessa stundina'},
      P:'one{fyrir # klst.}other{fyrir # klst.}',
      F:'one{eftir # klst.}other{eftir # klst.}',
    },
    NARROW:{
      R:{'0':'þessa stundina'},
      P:'one{-# klst.}other{-# klst.}',
      F:'one{+# klst.}other{+# klst.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'á þessari mínútu'},
      P:'one{fyrir # mínútu}other{fyrir # mínútum}',
      F:'one{eftir # mínútu}other{eftir # mínútur}',
    },
    SHORT:{
      R:{'0':'á þessari mínútu'},
      P:'one{fyrir # mín.}other{fyrir # mín.}',
      F:'one{eftir # mín.}other{eftir # mín.}',
    },
    NARROW:{
      R:{'0':'á þessari mínútu'},
      P:'one{-# mín.}other{-# mín.}',
      F:'one{+# mín.}other{+# mín.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'í síðasta mánuði','0':'í þessum mánuði','1':'í næsta mánuði'},
      P:'one{fyrir # mánuði}other{fyrir # mánuðum}',
      F:'one{eftir # mánuð}other{eftir # mánuði}',
    },
    SHORT:{
      R:{'-1':'í síðasta mán.','0':'í þessum mán.','1':'í næsta mán.'},
      P:'one{fyrir # mán.}other{fyrir # mán.}',
      F:'one{eftir # mán.}other{eftir # mán.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'síðasti ársfjórðungur','0':'þessi ársfjórðungur','1':'næsti ársfjórðungur'},
      P:'one{fyrir # ársfjórðungi}other{fyrir # ársfjórðungum}',
      F:'one{eftir # ársfjórðung}other{eftir # ársfjórðunga}',
    },
    SHORT:{
      R:{'-1':'síðasti ársfj.','0':'þessi ársfj.','1':'næsti ársfj.'},
      P:'one{fyrir # ársfj.}other{fyrir # ársfj.}',
      F:'one{eftir # ársfj.}other{eftir # ársfj.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'núna'},
      P:'one{fyrir # sekúndu}other{fyrir # sekúndum}',
      F:'one{eftir # sekúndu}other{eftir # sekúndur}',
    },
    SHORT:{
      R:{'0':'núna'},
      P:'one{fyrir # sek.}other{fyrir # sek.}',
      F:'one{eftir # sek.}other{eftir # sek.}',
    },
    NARROW:{
      R:{'0':'núna'},
      P:'one{-# sek.}other{-# sek.}',
      F:'one{+# sek.}other{+# sek.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'í síðustu viku','0':'í þessari viku','1':'í næstu viku'},
      P:'one{fyrir # viku}other{fyrir # vikum}',
      F:'one{eftir # viku}other{eftir # vikur}',
    },
    NARROW:{
      R:{'-1':'í síðustu viku','0':'í þessari viku','1':'í næstu viku'},
      P:'one{-# viku}other{-# vikur}',
      F:'one{+# viku}other{+# vikur}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'á síðasta ári','0':'á þessu ári','1':'á næsta ári'},
      P:'one{fyrir # ári}other{fyrir # árum}',
      F:'one{eftir # ár}other{eftir # ár}',
    },
    NARROW:{
      R:{'-1':'á síðasta ári','0':'á þessu ári','1':'á næsta ári'},
      P:'one{fyrir # árum}other{fyrir # árum}',
      F:'one{eftir # ár}other{eftir # ár}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_it =  {
  DAY: {
    LONG:{
      R:{'-1':'ieri','-2':'l’altro ieri','0':'oggi','1':'domani','2':'dopodomani'},
      P:'one{# giorno fa}other{# giorni fa}',
      F:'one{tra # giorno}other{tra # giorni}',
    },
    SHORT:{
      R:{'-1':'ieri','-2':'l’altro ieri','0':'oggi','1':'domani','2':'dopodomani'},
      P:'one{# g fa}other{# gg fa}',
      F:'one{tra # g}other{tra # gg}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'quest’ora'},
      P:'one{# ora fa}other{# ore fa}',
      F:'one{tra # ora}other{tra # ore}',
    },
    SHORT:{
      R:{'0':'quest’ora'},
      P:'one{# h fa}other{# h fa}',
      F:'one{tra # h}other{tra # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'questo minuto'},
      P:'one{# minuto fa}other{# minuti fa}',
      F:'one{tra # minuto}other{tra # minuti}',
    },
    SHORT:{
      R:{'0':'questo minuto'},
      P:'one{# min fa}other{# min fa}',
      F:'one{tra # min}other{tra # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'mese scorso','0':'questo mese','1':'mese prossimo'},
      P:'one{# mese fa}other{# mesi fa}',
      F:'one{tra # mese}other{tra # mesi}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'trimestre scorso','0':'questo trimestre','1':'trimestre prossimo'},
      P:'one{# trimestre fa}other{# trimestri fa}',
      F:'one{tra # trimestre}other{tra # trimestri}',
    },
    SHORT:{
      R:{'-1':'trim. scorso','0':'questo trim.','1':'trim. prossimo'},
      P:'one{# trim. fa}other{# trim. fa}',
      F:'one{tra # trim.}other{tra # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ora'},
      P:'one{# secondo fa}other{# secondi fa}',
      F:'one{tra # secondo}other{tra # secondi}',
    },
    SHORT:{
      R:{'0':'ora'},
      P:'one{# s fa}other{# sec. fa}',
      F:'one{tra # s}other{tra # sec.}',
    },
    NARROW:{
      R:{'0':'ora'},
      P:'one{# s fa}other{# s fa}',
      F:'one{tra # s}other{tra # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'settimana scorsa','0':'questa settimana','1':'settimana prossima'},
      P:'one{# settimana fa}other{# settimane fa}',
      F:'one{tra # settimana}other{tra # settimane}',
    },
    SHORT:{
      R:{'-1':'settimana scorsa','0':'questa settimana','1':'settimana prossima'},
      P:'one{# sett. fa}other{# sett. fa}',
      F:'one{tra # sett.}other{tra # sett.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'anno scorso','0':'quest’anno','1':'anno prossimo'},
      P:'one{# anno fa}other{# anni fa}',
      F:'one{tra # anno}other{tra # anni}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_iw =  {
  DAY: {
    LONG:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר','2':'מחרתיים'},
      P:'many{לפני # ימים}one{לפני יום #}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{בעוד יום #}other{בעוד # ימים}two{בעוד יומיים}',
    },
    SHORT:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר','2':'מחרתיים'},
      P:'many{לפני # ימים}one{אתמול}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{מחר}other{בעוד # ימים}two{בעוד יומיים}',
    },
    NARROW:{
      R:{'-1':'אתמול','-2':'שלשום','0':'היום','1':'מחר'},
      P:'many{לפני # ימים}one{אתמול}other{לפני # ימים}two{לפני יומיים}',
      F:'many{בעוד # ימים}one{מחר}other{בעוד # ימים}two{בעוד יומיים}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'בשעה זו'},
      P:'many{לפני # שעות}one{לפני שעה}other{לפני # שעות}two{לפני שעתיים}',
      F:'many{בעוד # שעות}one{בעוד שעה}other{בעוד # שעות}two{בעוד שעתיים}',
    },
    SHORT:{
      R:{'0':'בשעה זו'},
      P:'many{לפני # שע׳}one{לפני שעה}other{לפני # שע׳}two{לפני שעתיים}',
      F:'many{בעוד # שע׳}one{בעוד שעה}other{בעוד # שע׳}two{בעוד שעתיים}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דקות}one{לפני דקה}other{לפני # דקות}two{לפני שתי דקות}',
      F:'many{בעוד # דקות}one{בעוד דקה}other{בעוד # דקות}two{בעוד שתי דקות}',
    },
    SHORT:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דק׳}one{לפני דקה}other{לפני # דק׳}two{לפני # דק׳}',
      F:'many{בעוד # דק׳}one{בעוד דקה}other{בעוד # דק׳}two{בעוד שתי דק׳}',
    },
    NARROW:{
      R:{'0':'בדקה זו'},
      P:'many{לפני # דק׳}one{לפני דקה}other{לפני # דק׳}two{לפני שתי דק׳}',
      F:'many{בעוד # דק׳}one{בעוד דקה}other{בעוד # דק׳}two{בעוד שתי דק׳}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'החודש שעבר','0':'החודש','1':'החודש הבא'},
      P:'many{לפני # חודשים}one{לפני חודש}other{לפני # חודשים}two{לפני חודשיים}',
      F:'many{בעוד # חודשים}one{בעוד חודש}other{בעוד # חודשים}two{בעוד חודשיים}',
    },
    NARROW:{
      R:{'-1':'החודש שעבר','0':'החודש','1':'החודש הבא'},
      P:'many{לפני # חו׳}one{לפני חו׳}other{לפני # חו׳}two{לפני חודשיים}',
      F:'many{בעוד # חו׳}one{בעוד חו׳}other{בעוד # חו׳}two{בעוד חודשיים}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'הרבעון הקודם','0':'רבעון זה','1':'הרבעון הבא'},
      P:'many{לפני # רבעונים}one{ברבעון הקודם}other{לפני # רבעונים}two{לפני שני רבעונים}',
      F:'many{בעוד # רבעונים}one{ברבעון הבא}other{בעוד # רבעונים}two{בעוד שני רבעונים}',
    },
    SHORT:{
      R:{'-1':'הרבעון הקודם','0':'רבעון זה','1':'הרבעון הבא'},
      P:'many{לפני # רבע׳}one{ברבע׳ הקודם}other{לפני # רבע׳}two{לפני שני רבע׳}',
      F:'many{בעוד # רבע׳}one{ברבע׳ הבא}other{בעוד # רבע׳}two{בעוד שני רבע׳}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'עכשיו'},
      P:'many{לפני # שניות}one{לפני שנייה}other{לפני # שניות}two{לפני שתי שניות}',
      F:'many{בעוד # שניות}one{בעוד שנייה}other{בעוד # שניות}two{בעוד שתי שניות}',
    },
    SHORT:{
      R:{'0':'עכשיו'},
      P:'many{לפני # שנ׳}one{לפני שנ׳}other{לפני # שנ׳}two{לפני שתי שנ׳}',
      F:'many{בעוד # שנ׳}one{בעוד שנ׳}other{בעוד # שנ׳}two{בעוד שתי שנ׳}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שבועות}one{לפני שבוע}other{לפני # שבועות}two{לפני שבועיים}',
      F:'many{בעוד # שבועות}one{בעוד שבוע}other{בעוד # שבועות}two{בעוד שבועיים}',
    },
    SHORT:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שב׳}one{לפני שב׳}other{לפני # שב׳}two{לפני שבועיים}',
      F:'many{בעוד # שב׳}one{בעוד שב׳}other{בעוד # שב׳}two{בעוד שבועיים}',
    },
    NARROW:{
      R:{'-1':'השבוע שעבר','0':'השבוע','1':'השבוע הבא'},
      P:'many{לפני # שב׳}one{לפני שבוע}other{לפני # שב׳}two{לפני שבועיים}',
      F:'many{בעוד # שב׳}one{בעוד שב׳}other{בעוד # שב׳}two{בעוד שבועיים}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'השנה שעברה','0':'השנה','1':'השנה הבאה'},
      P:'many{לפני # שנה}one{לפני שנה}other{לפני # שנים}two{לפני שנתיים}',
      F:'many{בעוד # שנה}one{בעוד שנה}other{בעוד # שנים}two{בעוד שנתיים}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ja =  {
  DAY: {
    LONG:{
      R:{'-1':'昨日','-2':'一昨日','0':'今日','1':'明日','2':'明後日'},
      P:'other{# 日前}',
      F:'other{# 日後}',
    },
    NARROW:{
      R:{'-1':'昨日','-2':'一昨日','0':'今日','1':'明日','2':'明後日'},
      P:'other{#日前}',
      F:'other{#日後}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'1 時間以内'},
      P:'other{# 時間前}',
      F:'other{# 時間後}',
    },
    NARROW:{
      R:{'0':'1 時間以内'},
      P:'other{#時間前}',
      F:'other{#時間後}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'1 分以内'},
      P:'other{# 分前}',
      F:'other{# 分後}',
    },
    NARROW:{
      R:{'0':'1 分以内'},
      P:'other{#分前}',
      F:'other{#分後}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'先月','0':'今月','1':'翌月'},
      P:'other{# か月前}',
      F:'other{# か月後}',
    },
    NARROW:{
      R:{'-1':'先月','0':'今月','1':'翌月'},
      P:'other{#か月前}',
      F:'other{#か月後}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'前四半期','0':'今四半期','1':'翌四半期'},
      P:'other{# 四半期前}',
      F:'other{# 四半期後}',
    },
    NARROW:{
      R:{'-1':'前四半期','0':'今四半期','1':'翌四半期'},
      P:'other{#四半期前}',
      F:'other{#四半期後}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'今'},
      P:'other{# 秒前}',
      F:'other{# 秒後}',
    },
    NARROW:{
      R:{'0':'今'},
      P:'other{#秒前}',
      F:'other{#秒後}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'先週','0':'今週','1':'翌週'},
      P:'other{# 週間前}',
      F:'other{# 週間後}',
    },
    NARROW:{
      R:{'-1':'先週','0':'今週','1':'翌週'},
      P:'other{#週間前}',
      F:'other{#週間後}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'昨年','0':'今年','1':'翌年'},
      P:'other{# 年前}',
      F:'other{# 年後}',
    },
    NARROW:{
      R:{'-1':'昨年','0':'今年','1':'翌年'},
      P:'other{#年前}',
      F:'other{#年後}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ka =  {
  DAY: {
    LONG:{
      R:{'-1':'გუშინ','-2':'გუშინწინ','0':'დღეს','1':'ხვალ','2':'ზეგ'},
      P:'one{# დღის წინ}other{# დღის წინ}',
      F:'one{# დღეში}other{# დღეში}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ამ საათში'},
      P:'one{# საათის წინ}other{# საათის წინ}',
      F:'one{# საათში}other{# საათში}',
    },
    SHORT:{
      R:{'0':'ამ საათში'},
      P:'one{# სთ წინ}other{# სთ წინ}',
      F:'one{# საათში}other{# საათში}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ამ წუთში'},
      P:'one{# წუთის წინ}other{# წუთის წინ}',
      F:'one{# წუთში}other{# წუთში}',
    },
    SHORT:{
      R:{'0':'ამ წუთში'},
      P:'one{# წთ წინ}other{# წთ წინ}',
      F:'one{# წუთში}other{# წუთში}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'გასულ თვეს','0':'ამ თვეში','1':'მომავალ თვეს'},
      P:'one{# თვის წინ}other{# თვის წინ}',
      F:'one{# თვეში}other{# თვეში}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'გასულ კვარტალში','0':'ამ კვარტალში','1':'შემდეგ კვარტალში'},
      P:'one{# კვარტალის წინ}other{# კვარტალის წინ}',
      F:'one{# კვარტალში}other{# კვარტალში}',
    },
    SHORT:{
      R:{'-1':'გასულ კვარტალში','0':'ამ კვარტალში','1':'შემდეგ კვარტალში'},
      P:'one{# კვარტ. წინ}other{# კვარტ. წინ}',
      F:'one{# კვარტალში}other{# კვარტალში}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ახლა'},
      P:'one{# წამის წინ}other{# წამის წინ}',
      F:'one{# წამში}other{# წამში}',
    },
    SHORT:{
      R:{'0':'ახლა'},
      P:'one{# წმ წინ}other{# წმ წინ}',
      F:'one{# წამში}other{# წამში}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'გასულ კვირაში','0':'ამ კვირაში','1':'მომავალ კვირაში'},
      P:'one{# კვირის წინ}other{# კვირის წინ}',
      F:'one{# კვირაში}other{# კვირაში}',
    },
    SHORT:{
      R:{'-1':'გასულ კვირაში','0':'ამ კვირაში','1':'მომავალ კვირაში'},
      P:'one{# კვ. წინ}other{# კვ. წინ}',
      F:'one{# კვირაში}other{# კვირაში}',
    },
    NARROW:{
      R:{'-1':'გასულ კვირაში','0':'ამ კვირაში','1':'მომავალ კვირაში'},
      P:'one{# კვირის წინ}other{# კვირის წინ}',
      F:'one{# კვირაში}other{# კვირაში}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'გასულ წელს','0':'ამ წელს','1':'მომავალ წელს'},
      P:'one{# წლის წინ}other{# წლის წინ}',
      F:'one{# წელიწადში}other{# წელიწადში}',
    },
    SHORT:{
      R:{'-1':'გასულ წელს','0':'ამ წელს','1':'მომავალ წელს'},
      P:'one{# წლის წინ}other{# წლის წინ}',
      F:'one{# წელში}other{# წელში}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_kk =  {
  DAY: {
    LONG:{
      R:{'-1':'кеше','-2':'алдыңгүні','0':'бүгін','1':'ертең','2':'бүрсігүні'},
      P:'one{# күн бұрын}other{# күн бұрын}',
      F:'one{# күннен кейін}other{# күннен кейін}',
    },
    SHORT:{
      R:{'-1':'кеше','-2':'алдыңғы күні','0':'бүгін','1':'ертең','2':'бүрсігүні'},
      P:'one{# күн бұрын}other{# күн бұрын}',
      F:'one{# күннен кейін}other{# күннен кейін}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'осы сағат'},
      P:'one{# сағат бұрын}other{# сағат бұрын}',
      F:'one{# сағаттан кейін}other{# сағаттан кейін}',
    },
    SHORT:{
      R:{'0':'осы сағат'},
      P:'one{# сағ. бұрын}other{# сағ. бұрын}',
      F:'one{# сағ. кейін}other{# сағ. кейін}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'осы минут'},
      P:'one{# минут бұрын}other{# минут бұрын}',
      F:'one{# минуттан кейін}other{# минуттан кейін}',
    },
    SHORT:{
      R:{'0':'осы минут'},
      P:'one{# мин. бұрын}other{# мин. бұрын}',
      F:'one{# мин. кейін}other{# мин. кейін}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'өткен ай','0':'осы ай','1':'келесі ай'},
      P:'one{# ай бұрын}other{# ай бұрын}',
      F:'one{# айдан кейін}other{# айдан кейін}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'өткен тоқсан','0':'осы тоқсан','1':'келесі тоқсан'},
      P:'one{# тоқсан бұрын}other{# тоқсан бұрын}',
      F:'one{# тоқсаннан кейін}other{# тоқсаннан кейін}',
    },
    SHORT:{
      R:{'-1':'өткен тоқсан','0':'осы тоқсан','1':'келесі тоқсан'},
      P:'one{# тқс. бұрын}other{# тқс. бұрын}',
      F:'one{# тқс. кейін}other{# тқс. кейін}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'қазір'},
      P:'one{# секунд бұрын}other{# секунд бұрын}',
      F:'one{# секундтан кейін}other{# секундтан кейін}',
    },
    SHORT:{
      R:{'0':'қазір'},
      P:'one{# сек. бұрын}other{# сек. бұрын}',
      F:'one{# сек. кейін}other{# сек. кейін}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'өткен апта','0':'осы апта','1':'келесі апта'},
      P:'one{# апта бұрын}other{# апта бұрын}',
      F:'one{# аптадан кейін}other{# аптадан кейін}',
    },
    SHORT:{
      R:{'-1':'өткен апта','0':'осы апта','1':'келесі апта'},
      P:'one{# ап. бұрын}other{# ап. бұрын}',
      F:'one{# ап. кейін}other{# ап. кейін}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'былтырғы жыл','0':'биылғы жыл','1':'келесі жыл'},
      P:'one{# жыл бұрын}other{# жыл бұрын}',
      F:'one{# жылдан кейін}other{# жылдан кейін}',
    },
    SHORT:{
      R:{'-1':'былтырғы жыл','0':'биылғы жыл','1':'келесі жыл'},
      P:'one{# ж. бұрын}other{# ж. бұрын}',
      F:'one{# ж. кейін}other{# ж. кейін}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_km =  {
  DAY: {
    LONG:{
      R:{'-1':'ម្សិលមិញ','-2':'ម្សិល​ម៉្ងៃ','0':'ថ្ងៃ​នេះ','1':'ថ្ងៃ​ស្អែក','2':'​ខាន​ស្អែក'},
      P:'other{# ថ្ងៃ​មុន}',
      F:'other{# ថ្ងៃទៀត}',
    },
    SHORT:{
      R:{'-1':'ម្សិលមិញ','-2':'ម្សិល​ម៉្ងៃ','0':'ថ្ងៃ​នេះ','1':'ថ្ងៃស្អែក','2':'​ខាន​ស្អែក'},
      P:'other{# ថ្ងៃ​​មុន}',
      F:'other{# ថ្ងៃទៀត}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ម៉ោងនេះ'},
      P:'other{# ម៉ោង​មុន}',
      F:'other{ក្នុង​រយៈ​ពេល # ម៉ោង}',
    },
    SHORT:{
      R:{'0':'ម៉ោងនេះ'},
      P:'other{# ម៉ោង​មុន}',
      F:'other{# ម៉ោងទៀត}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'នាទីនេះ'},
      P:'other{# នាទី​មុន}',
      F:'other{# នាទីទៀត}',
    },
    SHORT:{
      R:{'0':'នាទីនេះ'},
      P:'other{# នាទី​​មុន}',
      F:'other{# នាទីទៀត}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ខែ​មុន','0':'ខែ​នេះ','1':'ខែ​ក្រោយ'},
      P:'other{# ខែមុន}',
      F:'other{# ខែទៀត}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ត្រីមាស​មុន','0':'ត្រីមាស​នេះ','1':'ត្រីមាស​ក្រោយ'},
      P:'other{# ត្រីមាស​មុន}',
      F:'other{# ត្រីមាសទៀត}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ឥឡូវ'},
      P:'other{# វិនាទី​មុន}',
      F:'other{# វិនាទីទៀត}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'សប្ដាហ៍​មុន','0':'សប្ដាហ៍​នេះ','1':'សប្ដាហ៍​ក្រោយ'},
      P:'other{# សប្ដាហ៍​មុន}',
      F:'other{# សប្ដាហ៍ទៀត}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ឆ្នាំ​មុន','0':'ឆ្នាំ​នេះ','1':'ឆ្នាំ​ក្រោយ'},
      P:'other{# ឆ្នាំ​មុន}',
      F:'other{# ឆ្នាំទៀត}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_kn =  {
  DAY: {
    LONG:{
      R:{'-1':'ನಿನ್ನೆ','-2':'ಮೊನ್ನೆ','0':'ಇಂದು','1':'ನಾಳೆ','2':'ನಾಡಿದ್ದು'},
      P:'one{# ದಿನದ ಹಿಂದೆ}other{# ದಿನಗಳ ಹಿಂದೆ}',
      F:'one{# ದಿನದಲ್ಲಿ}other{# ದಿನಗಳಲ್ಲಿ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ಈ ಗಂಟೆ'},
      P:'one{# ಗಂಟೆ ಹಿಂದೆ}other{# ಗಂಟೆಗಳ ಹಿಂದೆ}',
      F:'one{# ಗಂಟೆಯಲ್ಲಿ}other{# ಗಂಟೆಗಳಲ್ಲಿ}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ಈ ನಿಮಿಷ'},
      P:'one{# ನಿಮಿಷದ ಹಿಂದೆ}other{# ನಿಮಿಷಗಳ ಹಿಂದೆ}',
      F:'one{# ನಿಮಿಷದಲ್ಲಿ}other{# ನಿಮಿಷಗಳಲ್ಲಿ}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ಕಳೆದ ತಿಂಗಳು','0':'ಈ ತಿಂಗಳು','1':'ಮುಂದಿನ ತಿಂಗಳು'},
      P:'one{# ತಿಂಗಳ ಹಿಂದೆ}other{# ತಿಂಗಳುಗಳ ಹಿಂದೆ}',
      F:'one{# ತಿಂಗಳಲ್ಲಿ}other{# ತಿಂಗಳುಗಳಲ್ಲಿ}',
    },
    SHORT:{
      R:{'-1':'ಕಳೆದ ತಿಂಗಳು','0':'ಈ ತಿಂಗಳು','1':'ಮುಂದಿನ ತಿಂಗಳು'},
      P:'one{# ತಿಂಗಳು ಹಿಂದೆ}other{# ತಿಂಗಳುಗಳ ಹಿಂದೆ}',
      F:'one{# ತಿಂಗಳಲ್ಲಿ}other{# ತಿಂಗಳುಗಳಲ್ಲಿ}',
    },
    NARROW:{
      R:{'-1':'ಕಳೆದ ತಿಂಗಳು','0':'ಈ ತಿಂಗಳು','1':'ಮುಂದಿನ ತಿಂಗಳು'},
      P:'one{# ತಿಂಗಳ ಹಿಂದೆ}other{# ತಿಂಗಳುಗಳ ಹಿಂದೆ}',
      F:'one{# ತಿಂಗಳಲ್ಲಿ}other{# ತಿಂಗಳುಗಳಲ್ಲಿ}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ಹಿಂದಿನ ತ್ರೈಮಾಸಿಕ','0':'ಈ ತ್ರೈಮಾಸಿಕ','1':'ಮುಂದಿನ ತ್ರೈಮಾಸಿಕ'},
      P:'one{# ತ್ರೈಮಾಸಿಕದ ಹಿಂದೆ}other{# ತ್ರೈಮಾಸಿಕಗಳ ಹಿಂದೆ}',
      F:'one{# ತ್ರೈಮಾಸಿಕದಲ್ಲಿ}other{# ತ್ರೈಮಾಸಿಕಗಳಲ್ಲಿ}',
    },
    SHORT:{
      R:{'-1':'ಕಳೆದ ತ್ರೈಮಾಸಿಕ','0':'ಈ ತ್ರೈಮಾಸಿಕ','1':'ಮುಂದಿನ ತ್ರೈಮಾಸಿಕ'},
      P:'one{# ತ್ರೈ.ಮಾ. ಹಿಂದೆ}other{# ತ್ರೈಮಾಸಿಕಗಳ ಹಿಂದೆ}',
      F:'one{# ತ್ರೈ.ಮಾ.ದಲ್ಲಿ}other{# ತ್ರೈಮಾಸಿಕಗಳಲ್ಲಿ}',
    },
    NARROW:{
      R:{'-1':'ಕಳೆದ ತ್ರೈಮಾಸಿಕ','0':'ಈ ತ್ರೈಮಾಸಿಕ','1':'ಮುಂದಿನ ತ್ರೈಮಾಸಿಕ'},
      P:'one{# ತ್ರೈ.ಮಾ. ಹಿಂದೆ}other{# ತ್ರೈಮಾಸಿಕಗಳ ಹಿಂದೆ}',
      F:'one{# ತ್ರೈಮಾಸಿಕಗಳಲ್ಲಿ}other{# ತ್ರೈಮಾಸಿಕಗಳಲ್ಲಿ}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ಈಗ'},
      P:'one{# ಸೆಕೆಂಡ್ ಹಿಂದೆ}other{# ಸೆಕೆಂಡುಗಳ ಹಿಂದೆ}',
      F:'one{# ಸೆಕೆಂಡ್‌ನಲ್ಲಿ}other{# ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ಕಳೆದ ವಾರ','0':'ಈ ವಾರ','1':'ಮುಂದಿನ ವಾರ'},
      P:'one{# ವಾರದ ಹಿಂದೆ}other{# ವಾರಗಳ ಹಿಂದೆ}',
      F:'one{# ವಾರದಲ್ಲಿ}other{# ವಾರಗಳಲ್ಲಿ}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ಹಿಂದಿನ ವರ್ಷ','0':'ಈ ವರ್ಷ','1':'ಮುಂದಿನ ವರ್ಷ'},
      P:'one{# ವರ್ಷದ ಹಿಂದೆ}other{# ವರ್ಷಗಳ ಹಿಂದೆ}',
      F:'one{# ವರ್ಷದಲ್ಲಿ}other{# ವರ್ಷಗಳಲ್ಲಿ}',
    },
    SHORT:{
      R:{'-1':'ಕಳೆದ ವರ್ಷ','0':'ಈ ವರ್ಷ','1':'ಮುಂದಿನ ವರ್ಷ'},
      P:'one{# ವರ್ಷದ ಹಿಂದೆ}other{# ವರ್ಷಗಳ ಹಿಂದೆ}',
      F:'one{# ವರ್ಷದಲ್ಲಿ}other{# ವರ್ಷಗಳಲ್ಲಿ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ko =  {
  DAY: {
    LONG:{
      R:{'-1':'어제','-2':'그저께','0':'오늘','1':'내일','2':'모레'},
      P:'other{#일 전}',
      F:'other{#일 후}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'현재 시간'},
      P:'other{#시간 전}',
      F:'other{#시간 후}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'현재 분'},
      P:'other{#분 전}',
      F:'other{#분 후}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'지난달','0':'이번 달','1':'다음 달'},
      P:'other{#개월 전}',
      F:'other{#개월 후}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'지난 분기','0':'이번 분기','1':'다음 분기'},
      P:'other{#분기 전}',
      F:'other{#분기 후}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'지금'},
      P:'other{#초 전}',
      F:'other{#초 후}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'지난주','0':'이번 주','1':'다음 주'},
      P:'other{#주 전}',
      F:'other{#주 후}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'작년','0':'올해','1':'내년'},
      P:'other{#년 전}',
      F:'other{#년 후}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ky =  {
  DAY: {
    LONG:{
      R:{'-1':'кечээ','-2':'мурдагы күнү','0':'бүгүн','1':'эртең','2':'бүрсүгүнү'},
      P:'one{# күн мурун}other{# күн мурун}',
      F:'one{# күндөн кийин}other{# күндөн кийин}',
    },
    SHORT:{
      R:{'-1':'кечээ','-2':'мурдагы күнү','0':'бүгүн','1':'эртең','2':'бүрсүгүнү'},
      P:'one{# күн мурун}other{# күн мурун}',
      F:'one{# күн. кийин}other{# күн. кийин}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ушул саатта'},
      P:'one{# саат мурун}other{# саат мурун}',
      F:'one{# сааттан кийин}other{# сааттан кийин}',
    },
    SHORT:{
      R:{'0':'ушул саатта'},
      P:'one{# саат. мурун}other{# саат. мурун}',
      F:'one{# саат. кийин}other{# саат. кийин}',
    },
    NARROW:{
      R:{'0':'ушул саатта'},
      P:'one{# с. мурн}other{# с. мурн}',
      F:'one{# с. кийн}other{# с. кийн}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ушул мүнөттө'},
      P:'one{# мүнөт мурун}other{# мүнөт мурун}',
      F:'one{# мүнөттөн кийин}other{# мүнөттөн кийин}',
    },
    SHORT:{
      R:{'0':'ушул мүнөттө'},
      P:'one{# мүн. мурун}other{# мүн. мурун}',
      F:'one{# мүн. кийин}other{# мүн. кийин}',
    },
    NARROW:{
      R:{'0':'ушул мүнөттө'},
      P:'one{# мүн. мурн}other{# мүн. мурн}',
      F:'one{# мүн. кийн}other{# мүн. кийн}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'өткөн айда','0':'бул айда','1':'эмдиги айда'},
      P:'one{# ай мурун}other{# ай мурун}',
      F:'one{# айдан кийин}other{# айдан кийин}',
    },
    SHORT:{
      R:{'-1':'өткөн айда','0':'бул айда','1':'эмдиги айда'},
      P:'one{# ай мурун}other{# ай мурун}',
      F:'one{# айд. кийин}other{# айд. кийин}',
    },
    NARROW:{
      R:{'-1':'өткөн айда','0':'бул айда','1':'эмдиги айда'},
      P:'one{# ай мурн}other{# ай мурн}',
      F:'one{# айд. кийн}other{# айд. кийн}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'акыркы чейрек','0':'бул чейрек','1':'кийинки чейрек'},
      P:'one{# чейрек мурун}other{# чейрек мурун}',
      F:'one{# чейректен кийин}other{# чейректен кийин}',
    },
    SHORT:{
      R:{'-1':'акыркы чейр.','0':'бул чейр.','1':'кийинки чейр.'},
      P:'one{# чейр. мурун}other{# чейр. мурун}',
      F:'one{# чейректен кийин}other{# чейректен кийин}',
    },
    NARROW:{
      R:{'-1':'акыркы чейр.','0':'бул чейр.','1':'кийинки чейр.'},
      P:'one{# чейр. мурун}other{# чейр. мурун}',
      F:'one{# чейр. кийин}other{# чейр. кийин}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'азыр'},
      P:'one{# секунд мурун}other{# секунд мурун}',
      F:'one{# секунддан кийин}other{# секунддан кийин}',
    },
    SHORT:{
      R:{'0':'азыр'},
      P:'one{# сек. мурун}other{# сек. мурун}',
      F:'one{# сек. кийин}other{# сек. кийин}',
    },
    NARROW:{
      R:{'0':'азыр'},
      P:'one{# сек. мурн}other{# сек. мурн}',
      F:'one{# сек. кийн}other{# сек. кийн}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'өткөн аптада','0':'ушул аптада','1':'келерки аптада'},
      P:'one{# апта мурун}other{# апта мурун}',
      F:'one{# аптадан кийин}other{# аптадан кийин}',
    },
    SHORT:{
      R:{'-1':'өткөн апт.','0':'ушул апт.','1':'келерки апт.'},
      P:'one{# апт. мурун}other{# апт. мурун}',
      F:'one{# апт. кийин}other{# апт. кийин}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'былтыр','0':'быйыл','1':'эмдиги жылы'},
      P:'one{# жыл мурун}other{# жыл мурун}',
      F:'one{# жылдан кийин}other{# жылдан кийин}',
    },
    SHORT:{
      R:{'-1':'былтыр','0':'быйыл','1':'эмдиги жылы'},
      P:'one{# жыл мурун}other{# жыл мурун}',
      F:'one{# жыл. кийин}other{# жыл. кийин}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ln =  {
  DAY: {
    LONG:{
      R:{'-1':'Lóbi elékí','0':'Lɛlɔ́','1':'Lóbi ekoyâ'},
      P:'other{-# d}',
      F:'other{+# d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'this hour'},
      P:'other{-# h}',
      F:'other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'this minute'},
      P:'other{-# min}',
      F:'other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'last month','0':'this month','1':'next month'},
      P:'other{-# m}',
      F:'other{+# m}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'last quarter','0':'this quarter','1':'next quarter'},
      P:'other{-# Q}',
      F:'other{+# Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'now'},
      P:'other{-# s}',
      F:'other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'last week','0':'this week','1':'next week'},
      P:'other{-# w}',
      F:'other{+# w}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'last year','0':'this year','1':'next year'},
      P:'other{-# y}',
      F:'other{+# y}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_lo =  {
  DAY: {
    LONG:{
      R:{'-1':'ມື້ວານ','-2':'ມື້ກ່ອນ','0':'ມື້ນີ້','1':'ມື້ອື່ນ','2':'ມື້ຮື'},
      P:'other{# ມື້ກ່ອນ}',
      F:'other{ໃນອີກ # ມື້}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ຊົ່ວໂມງນີ້'},
      P:'other{# ຊົ່ວໂມງກ່ອນ}',
      F:'other{ໃນອີກ # ຊົ່ວໂມງ}',
    },
    SHORT:{
      R:{'0':'ຊົ່ວໂມງນີ້'},
      P:'other{# ຊມ. ກ່ອນ}',
      F:'other{ໃນອີກ # ຊມ.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ນາທີນີ້'},
      P:'other{# ນາທີກ່ອນ}',
      F:'other{# ໃນອີກ 0 ນາທີ}',
    },
    SHORT:{
      R:{'0':'ນາທີນີ້'},
      P:'other{# ນທ. ກ່ອນ}',
      F:'other{ໃນ # ນທ.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ເດືອນແລ້ວ','0':'ເດືອນນີ້','1':'ເດືອນໜ້າ'},
      P:'other{# ເດືອນກ່ອນ}',
      F:'other{ໃນອີກ # ເດືອນ}',
    },
    SHORT:{
      R:{'-1':'ເດືອນແລ້ວ','0':'ເດືອນນີ້','1':'ເດືອນໜ້າ'},
      P:'other{# ດ. ກ່ອນ}',
      F:'other{ໃນອີກ # ດ.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ໄຕຣມາດກ່ອນໜ້າ','0':'ໄຕຣມາດນີ້','1':'ໄຕຣມາດໜ້າ'},
      P:'other{# ໄຕຣມາດກ່ອນ}',
      F:'other{ໃນອີກ # ໄຕຣມາດ}',
    },
    SHORT:{
      R:{'-1':'ໄຕຣມາດກ່ອນໜ້າ','0':'ໄຕຣມາດນີ້','1':'ໄຕຣມາດໜ້າ'},
      P:'other{# ຕມ. ກ່ອນ}',
      F:'other{ໃນ # ຕມ.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ຕອນນີ້'},
      P:'other{# ວິນາທີກ່ອນ}',
      F:'other{ໃນອີກ # ວິນາທີ}',
    },
    SHORT:{
      R:{'0':'ຕອນນີ້'},
      P:'other{# ວິ. ກ່ອນ}',
      F:'other{ໃນ # ວິ.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ອາທິດແລ້ວ','0':'ອາທິດນີ້','1':'ອາທິດໜ້າ'},
      P:'other{# ອາທິດກ່ອນ}',
      F:'other{ໃນອີກ # ອາທິດ}',
    },
    SHORT:{
      R:{'-1':'ອາທິດແລ້ວ','0':'ອາທິດນີ້','1':'ອາທິດໜ້າ'},
      P:'other{# ອທ. ກ່ອນ}',
      F:'other{ໃນອີກ # ອທ.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ປີກາຍ','0':'ປີນີ້','1':'ປີໜ້າ'},
      P:'other{# ປີກ່ອນ}',
      F:'other{ໃນອີກ # ປີ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_lt =  {
  DAY: {
    LONG:{
      R:{'-1':'vakar','-2':'užvakar','0':'šiandien','1':'rytoj','2':'poryt'},
      P:'few{prieš # dienas}many{prieš # dienos}one{prieš # dieną}other{prieš # dienų}',
      F:'few{po # dienų}many{po # dienos}one{po # dienos}other{po # dienų}',
    },
    SHORT:{
      R:{'-1':'vakar','-2':'užvakar','0':'šiandien','1':'rytoj','2':'poryt'},
      P:'few{prieš # d.}many{prieš # d.}one{prieš # d.}other{prieš # d.}',
      F:'few{po # d.}many{po # d.}one{po # d.}other{po # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'šią valandą'},
      P:'few{prieš # valandas}many{prieš # valandos}one{prieš # valandą}other{prieš # valandų}',
      F:'few{po # valandų}many{po # valandos}one{po # valandos}other{po # valandų}',
    },
    SHORT:{
      R:{'0':'šią valandą'},
      P:'few{prieš # val.}many{prieš # val.}one{prieš # val.}other{prieš # val.}',
      F:'few{po # val.}many{po # val.}one{po # val.}other{po # val.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'šią minutę'},
      P:'few{prieš # minutes}many{prieš # minutės}one{prieš # minutę}other{prieš # minučių}',
      F:'few{po # minučių}many{po # minutės}one{po # minutės}other{po # minučių}',
    },
    SHORT:{
      R:{'0':'šią minutę'},
      P:'few{prieš # min.}many{prieš # min.}one{prieš # min.}other{prieš # min.}',
      F:'few{po # min.}many{po # min.}one{po # min.}other{po # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'praėjusį mėnesį','0':'šį mėnesį','1':'kitą mėnesį'},
      P:'few{prieš # mėnesius}many{prieš # mėnesio}one{prieš # mėnesį}other{prieš # mėnesių}',
      F:'few{po # mėnesių}many{po # mėnesio}one{po # mėnesio}other{po # mėnesių}',
    },
    SHORT:{
      R:{'-1':'praėjusį mėnesį','0':'šį mėnesį','1':'kitą mėnesį'},
      P:'few{prieš # mėn.}many{prieš # mėn.}one{prieš # mėn.}other{prieš # mėn.}',
      F:'few{po # mėn.}many{po # mėn.}one{po # mėn.}other{po # mėn.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'praėjęs ketvirtis','0':'šis ketvirtis','1':'kitas ketvirtis'},
      P:'few{prieš # ketvirčius}many{prieš # ketvirčio}one{prieš # ketvirtį}other{prieš # ketvirčių}',
      F:'few{po # ketvirčių}many{po # ketvirčio}one{po # ketvirčio}other{po # ketvirčių}',
    },
    SHORT:{
      R:{'-1':'praėjęs ketvirtis','0':'šis ketvirtis','1':'kitas ketvirtis'},
      P:'few{prieš # ketv.}many{prieš # ketv.}one{prieš # ketv.}other{prieš # ketv.}',
      F:'few{po # ketv.}many{po # ketv.}one{po # ketv.}other{po # ketv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'dabar'},
      P:'few{prieš # sekundes}many{prieš # sekundės}one{prieš # sekundę}other{prieš # sekundžių}',
      F:'few{po # sekundžių}many{po # sekundės}one{po # sekundės}other{po # sekundžių}',
    },
    SHORT:{
      R:{'0':'dabar'},
      P:'few{prieš # sek.}many{prieš # sek.}one{prieš # sek.}other{prieš # sek.}',
      F:'few{po # sek.}many{po # sek.}one{po # sek.}other{po # sek.}',
    },
    NARROW:{
      R:{'0':'dabar'},
      P:'few{prieš # s}many{prieš # s}one{prieš # s}other{prieš # s}',
      F:'few{po # s}many{po # s}one{po # s}other{po # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'praėjusią savaitę','0':'šią savaitę','1':'kitą savaitę'},
      P:'few{prieš # savaites}many{prieš # savaitės}one{prieš # savaitę}other{prieš # savaičių}',
      F:'few{po # savaičių}many{po # savaitės}one{po # savaitės}other{po # savaičių}',
    },
    SHORT:{
      R:{'-1':'praėjusią savaitę','0':'šią savaitę','1':'kitą savaitę'},
      P:'few{prieš # sav.}many{prieš # sav.}one{prieš # sav.}other{prieš # sav.}',
      F:'few{po # sav.}many{po # sav.}one{po # sav.}other{po # sav.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'praėjusiais metais','0':'šiais metais','1':'kitais metais'},
      P:'few{prieš # metus}many{prieš # metų}one{prieš # metus}other{prieš # metų}',
      F:'few{po # metų}many{po # metų}one{po # metų}other{po # metų}',
    },
    SHORT:{
      R:{'-1':'praėjusiais metais','0':'šiais metais','1':'kitais metais'},
      P:'few{prieš # m.}many{prieš # m.}one{prieš # m.}other{prieš # m.}',
      F:'few{po # m.}many{po # m.}one{po # m.}other{po # m.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_lv =  {
  DAY: {
    LONG:{
      R:{'-1':'vakar','-2':'aizvakar','0':'šodien','1':'rīt','2':'parīt'},
      P:'one{pirms # dienas}other{pirms # dienām}zero{pirms # dienām}',
      F:'one{pēc # dienas}other{pēc # dienām}zero{pēc # dienām}',
    },
    SHORT:{
      R:{'-1':'vakar','-2':'aizvakar','0':'šodien','1':'rīt','2':'parīt'},
      P:'one{pirms # d.}other{pirms # d.}zero{pirms # d.}',
      F:'one{pēc # d.}other{pēc # d.}zero{pēc # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'šajā stundā'},
      P:'one{pirms # stundas}other{pirms # stundām}zero{pirms # stundām}',
      F:'one{pēc # stundas}other{pēc # stundām}zero{pēc # stundām}',
    },
    SHORT:{
      R:{'0':'šajā stundā'},
      P:'one{pirms # st.}other{pirms # st.}zero{pirms # st.}',
      F:'one{pēc # st.}other{pēc # st.}zero{pēc # st.}',
    },
    NARROW:{
      R:{'0':'šajā stundā'},
      P:'one{pirms # h}other{pirms # h}zero{pirms # h}',
      F:'one{pēc # h}other{pēc # h}zero{pēc # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'šajā minūtē'},
      P:'one{pirms # minūtes}other{pirms # minūtēm}zero{pirms # minūtēm}',
      F:'one{pēc # minūtes}other{pēc # minūtēm}zero{pēc # minūtēm}',
    },
    SHORT:{
      R:{'0':'šajā minūtē'},
      P:'one{pirms # min.}other{pirms # min.}zero{pirms # min.}',
      F:'one{pēc # min.}other{pēc # min.}zero{pēc # min.}',
    },
    NARROW:{
      R:{'0':'šajā minūtē'},
      P:'one{pirms # min}other{pirms # min}zero{pirms # min}',
      F:'one{pēc # min}other{pēc # min}zero{pēc # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'pagājušajā mēnesī','0':'šajā mēnesī','1':'nākamajā mēnesī'},
      P:'one{pirms # mēneša}other{pirms # mēnešiem}zero{pirms # mēnešiem}',
      F:'one{pēc # mēneša}other{pēc # mēnešiem}zero{pēc # mēnešiem}',
    },
    SHORT:{
      R:{'-1':'pagājušajā mēnesī','0':'šajā mēnesī','1':'nākamajā mēnesī'},
      P:'one{pirms # mēn.}other{pirms # mēn.}zero{pirms # mēn.}',
      F:'one{pēc # mēn.}other{pēc # mēn.}zero{pēc # mēn.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'pēdējais ceturksnis','0':'šis ceturksnis','1':'nākamais ceturksnis'},
      P:'one{pirms # ceturkšņa}other{pirms # ceturkšņiem}zero{pirms # ceturkšņiem}',
      F:'one{pēc # ceturkšņa}other{pēc # ceturkšņiem}zero{pēc # ceturkšņiem}',
    },
    SHORT:{
      R:{'-1':'pēdējais ceturksnis','0':'šis ceturksnis','1':'nākamais ceturksnis'},
      P:'one{pirms # cet.}other{pirms # cet.}zero{pirms # cet.}',
      F:'one{pēc # cet.}other{pēc # cet.}zero{pēc # cet.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'tagad'},
      P:'one{pirms # sekundes}other{pirms # sekundēm}zero{pirms # sekundēm}',
      F:'one{pēc # sekundes}other{pēc # sekundēm}zero{pēc # sekundēm}',
    },
    SHORT:{
      R:{'0':'tagad'},
      P:'one{pirms # sek.}other{pirms # sek.}zero{pirms # sek.}',
      F:'one{pēc # sek.}other{pēc # sek.}zero{pēc # sek.}',
    },
    NARROW:{
      R:{'0':'tagad'},
      P:'one{pirms # s}other{pirms # s}zero{pirms # s}',
      F:'one{pēc # s}other{pēc # s}zero{pēc # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'pagājušajā nedēļā','0':'šajā nedēļā','1':'nākamajā nedēļā'},
      P:'one{pirms # nedēļas}other{pirms # nedēļām}zero{pirms # nedēļām}',
      F:'one{pēc # nedēļas}other{pēc # nedēļām}zero{pēc # nedēļām}',
    },
    SHORT:{
      R:{'-1':'pagājušajā nedēļā','0':'šajā nedēļā','1':'nākamajā nedēļā'},
      P:'one{pirms # ned.}other{pirms # ned.}zero{pirms # ned.}',
      F:'one{pēc # ned.}other{pēc # ned.}zero{pēc # ned.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'pagājušajā gadā','0':'šajā gadā','1':'nākamajā gadā'},
      P:'one{pirms # gada}other{pirms # gadiem}zero{pirms # gadiem}',
      F:'one{pēc # gada}other{pēc # gadiem}zero{pēc # gadiem}',
    },
    SHORT:{
      R:{'-1':'pagājušajā gadā','0':'šajā gadā','1':'nākamajā gadā'},
      P:'one{pirms # g.}other{pirms # g.}zero{pirms # g.}',
      F:'one{pēc # g.}other{pēc # g.}zero{pēc # g.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_mk =  {
  DAY: {
    LONG:{
      R:{'-1':'вчера','-2':'завчера','0':'денес','1':'утре','2':'задутре'},
      P:'one{пред # ден}other{пред # дена}',
      F:'one{за # ден}other{за # дена}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'часов'},
      P:'one{пред # час}other{пред # часа}',
      F:'one{за # час}other{за # часа}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'оваа минута'},
      P:'one{пред # минута}other{пред # минути}',
      F:'one{за # минута}other{за # минути}',
    },
    SHORT:{
      R:{'0':'оваа минута'},
      P:'one{пред # мин.}other{пред # мин.}',
      F:'one{за # мин.}other{за # мин.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'минатиот месец','0':'овој месец','1':'следниот месец'},
      P:'one{пред # месец}other{пред # месеци}',
      F:'one{за # месец}other{за # месеци}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'последното тромесечје','0':'ова тромесечје','1':'следното тромесечје'},
      P:'one{пред # тромесечје}other{пред # тромесечја}',
      F:'one{за # тромесечје}other{за # тромесечја}',
    },
    SHORT:{
      R:{'-1':'последното тромесечје','0':'ова тромесечје','1':'следното тромесечје'},
      P:'one{пред # тромес.}other{пред # тромес.}',
      F:'one{за # тромес.}other{за # тромес.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'сега'},
      P:'one{пред # секунда}other{пред # секунди}',
      F:'one{за # секунда}other{за # секунди}',
    },
    SHORT:{
      R:{'0':'сега'},
      P:'one{пред # сек.}other{пред # сек.}',
      F:'one{за # сек.}other{за # сек.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'минатата седмица','0':'оваа седмица','1':'следната седмица'},
      P:'one{пред # седмица}other{пред # седмици}',
      F:'one{за # седмица}other{за # седмици}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'минатата година','0':'оваа година','1':'следната година'},
      P:'one{пред # година}other{пред # години}',
      F:'one{за # година}other{за # години}',
    },
    SHORT:{
      R:{'-1':'минатата година','0':'оваа година','1':'следната година'},
      P:'one{пред # год.}other{пред # год.}',
      F:'one{за # год.}other{за # год.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ml =  {
  DAY: {
    LONG:{
      R:{'-1':'ഇന്നലെ','-2':'മിനിഞ്ഞാന്ന്','0':'ഇന്ന്','1':'നാളെ','2':'മറ്റന്നാൾ'},
      P:'one{# ദിവസം മുമ്പ്}other{# ദിവസം മുമ്പ്}',
      F:'one{# ദിവസത്തിൽ}other{# ദിവസത്തിൽ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ഈ മണിക്കൂറിൽ'},
      P:'one{# മണിക്കൂർ മുമ്പ്}other{# മണിക്കൂർ മുമ്പ്}',
      F:'one{# മണിക്കൂറിൽ}other{# മണിക്കൂറിൽ}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ഈ മിനിറ്റിൽ'},
      P:'one{# മിനിറ്റ് മുമ്പ്}other{# മിനിറ്റ് മുമ്പ്}',
      F:'one{# മിനിറ്റിൽ}other{# മിനിറ്റിൽ}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'കഴിഞ്ഞ മാസം','0':'ഈ മാസം','1':'അടുത്ത മാസം'},
      P:'one{# മാസം മുമ്പ്}other{# മാസം മുമ്പ്}',
      F:'one{# മാസത്തിൽ}other{# മാസത്തിൽ}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'കഴിഞ്ഞ പാദം','0':'ഈ പാദം','1':'അടുത്ത പാദം'},
      P:'one{# പാദം മുമ്പ്}other{# പാദം മുമ്പ്}',
      F:'one{# പാദത്തിൽ}other{# പാദത്തിൽ}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ഇപ്പോൾ'},
      P:'one{# സെക്കൻഡ് മുമ്പ്}other{# സെക്കൻഡ് മുമ്പ്}',
      F:'one{# സെക്കൻഡിൽ}other{# സെക്കൻഡിൽ}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'കഴിഞ്ഞ ആഴ്‌ച','0':'ഈ ആഴ്ച','1':'അടുത്ത ആഴ്ച'},
      P:'one{# ആഴ്ച മുമ്പ്}other{# ആഴ്ച മുമ്പ്}',
      F:'one{# ആഴ്ചയിൽ}other{# ആഴ്ചയിൽ}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'കഴിഞ്ഞ വർഷം','0':'ഈ വർ‌ഷം','1':'അടുത്തവർഷം'},
      P:'one{# വർഷം മുമ്പ്}other{# വർഷം മുമ്പ്}',
      F:'one{# വർഷത്തിൽ}other{# വർഷത്തിൽ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_mn =  {
  DAY: {
    LONG:{
      R:{'-1':'өчигдөр','-2':'уржигдар','0':'өнөөдөр','1':'маргааш','2':'нөгөөдөр'},
      P:'one{# өдрийн өмнө}other{# өдрийн өмнө}',
      F:'one{# өдрийн дараа}other{# өдрийн дараа}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'энэ цаг'},
      P:'one{# цагийн өмнө}other{# цагийн өмнө}',
      F:'one{# цагийн дараа}other{# цагийн дараа}',
    },
    SHORT:{
      R:{'0':'энэ цаг'},
      P:'one{# ц өмнө}other{# ц өмнө}',
      F:'one{# ц дараа}other{# ц дараа}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'энэ минут'},
      P:'one{# минутын өмнө}other{# минутын өмнө}',
      F:'one{# минутын дараа}other{# минутын дараа}',
    },
    SHORT:{
      R:{'0':'энэ минут'},
      P:'one{# мин өмнө}other{# мин өмнө}',
      F:'one{# мин дараа}other{# мин дараа}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'өнгөрсөн сар','0':'энэ сар','1':'ирэх сар'},
      P:'one{# сарын өмнө}other{# сарын өмнө}',
      F:'one{# сарын дараа}other{# сарын дараа}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'өнгөрсөн улирал','0':'энэ улирал','1':'дараагийн улирал'},
      P:'one{# улирлын өмнө}other{# улирлын өмнө}',
      F:'one{# улирлын дараа}other{# улирлын дараа}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'одоо'},
      P:'one{# секундын өмнө}other{# секундын өмнө}',
      F:'one{# секундын дараа}other{# секундын дараа}',
    },
    SHORT:{
      R:{'0':'одоо'},
      P:'one{# сек өмнө}other{# сек өмнө}',
      F:'one{# сек дараа}other{# сек дараа}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'өнгөрсөн долоо хоног','0':'энэ долоо хоног','1':'ирэх долоо хоног'},
      P:'one{# долоо хоногийн өмнө}other{# долоо хоногийн өмнө}',
      F:'one{# долоо хоногийн дараа}other{# долоо хоногийн дараа}',
    },
    SHORT:{
      R:{'-1':'өнгөрсөн долоо хоног','0':'энэ долоо хоног','1':'ирэх долоо хоног'},
      P:'one{# 7 хоногийн өмнө}other{# 7 хоногийн өмнө}',
      F:'one{# 7 хоногийн дараа}other{# 7 хоногийн дараа}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'өнгөрсөн жил','0':'энэ жил','1':'ирэх жил'},
      P:'one{# жилийн өмнө}other{# жилийн өмнө}',
      F:'one{# жилийн дараа}other{# жилийн дараа}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_mo =  {
  DAY: {
    LONG:{
      R:{'-1':'ieri','-2':'alaltăieri','0':'azi','1':'mâine','2':'poimâine'},
      P:'few{acum # zile}one{acum # zi}other{acum # de zile}',
      F:'few{peste # zile}one{peste # zi}other{peste # de zile}',
    },
    NARROW:{
      R:{'-1':'ieri','-2':'alaltăieri','0':'azi','1':'mâine','2':'poimâine'},
      P:'few{-# zile}one{-# zi}other{-# zile}',
      F:'few{+# zile}one{+# zi}other{+# zile}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ora aceasta'},
      P:'few{acum # ore}one{acum # oră}other{acum # de ore}',
      F:'few{peste # ore}one{peste # oră}other{peste # de ore}',
    },
    SHORT:{
      R:{'0':'ora aceasta'},
      P:'few{acum # h}one{acum # h}other{acum # h}',
      F:'few{peste # h}one{peste # h}other{peste # h}',
    },
    NARROW:{
      R:{'0':'ora aceasta'},
      P:'few{-# h}one{-# h}other{-# h}',
      F:'few{+# h}one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'minutul acesta'},
      P:'few{acum # minute}one{acum # minut}other{acum # de minute}',
      F:'few{peste # minute}one{peste # minut}other{peste # de minute}',
    },
    SHORT:{
      R:{'0':'minutul acesta'},
      P:'few{acum # min.}one{acum # min.}other{acum # min.}',
      F:'few{peste # min.}one{peste # min.}other{peste # min.}',
    },
    NARROW:{
      R:{'0':'minutul acesta'},
      P:'few{-# m}one{-# m}other{-# m}',
      F:'few{+# m}one{+# m}other{+# m}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{acum # luni}one{acum # lună}other{acum # de luni}',
      F:'few{peste # luni}one{peste # lună}other{peste # de luni}',
    },
    SHORT:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{acum # luni}one{acum # lună}other{acum # luni}',
      F:'few{peste # luni}one{peste # lună}other{peste # luni}',
    },
    NARROW:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{-# luni}one{-# lună}other{-# luni}',
      F:'few{+# luni}one{+# lună}other{+# luni}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'trimestrul trecut','0':'trimestrul acesta','1':'trimestrul viitor'},
      P:'few{acum # trimestre}one{acum # trimestru}other{acum # de trimestre}',
      F:'few{peste # trimestre}one{peste # trimestru}other{peste # de trimestre}',
    },
    SHORT:{
      R:{'-1':'trim. trecut','0':'trim. acesta','1':'trim. viitor'},
      P:'few{acum # trim.}one{acum # trim.}other{acum # trim.}',
      F:'few{peste # trim.}one{peste # trim.}other{peste # trim.}',
    },
    NARROW:{
      R:{'-1':'trim. trecut','0':'trim. acesta','1':'trim. viitor'},
      P:'few{-# trim.}one{-# trim.}other{-# trim.}',
      F:'few{+# trim.}one{+# trim.}other{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'acum'},
      P:'few{acum # secunde}one{acum # secundă}other{acum # de secunde}',
      F:'few{peste # secunde}one{peste # secundă}other{peste # de secunde}',
    },
    SHORT:{
      R:{'0':'acum'},
      P:'few{acum # sec.}one{acum # sec.}other{acum # sec.}',
      F:'few{peste # sec.}one{peste # sec.}other{peste # sec.}',
    },
    NARROW:{
      R:{'0':'acum'},
      P:'few{-# s}one{-# s}other{-# s}',
      F:'few{+# s}one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'săptămâna trecută','0':'săptămâna aceasta','1':'săptămâna viitoare'},
      P:'few{acum # săptămâni}one{acum # săptămână}other{acum # de săptămâni}',
      F:'few{peste # săptămâni}one{peste # săptămână}other{peste # de săptămâni}',
    },
    SHORT:{
      R:{'-1':'săpt. trecută','0':'săpt. aceasta','1':'săpt. viitoare'},
      P:'few{acum # săpt.}one{acum # săpt.}other{acum # săpt.}',
      F:'few{peste # săpt.}one{peste # săpt.}other{peste # săpt.}',
    },
    NARROW:{
      R:{'-1':'săpt. trecută','0':'săptămâna aceasta','1':'săpt. viitoare'},
      P:'few{-# săpt.}one{-# săpt.}other{-# săpt.}',
      F:'few{+# săpt.}one{+# săpt.}other{+# săpt.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'anul trecut','0':'anul acesta','1':'anul viitor'},
      P:'few{acum # ani}one{acum # an}other{acum # de ani}',
      F:'few{peste # ani}one{peste # an}other{peste # de ani}',
    },
    NARROW:{
      R:{'-1':'anul trecut','0':'anul acesta','1':'anul viitor'},
      P:'few{-# ani}one{-# an}other{-# ani}',
      F:'few{+# ani}one{+# an}other{+# ani}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_mr =  {
  DAY: {
    LONG:{
      R:{'-1':'काल','0':'आज','1':'उद्या'},
      P:'one{# दिवसापूर्वी}other{# दिवसांपूर्वी}',
      F:'one{येत्या # दिवसामध्ये}other{येत्या # दिवसांमध्ये}',
    },
    SHORT:{
      R:{'-1':'काल','0':'आज','1':'उद्या'},
      P:'one{# दिवसापूर्वी}other{# दिवसांपूर्वी}',
      F:'one{# दिवसामध्ये}other{येत्या # दिवसांमध्ये}',
    },
    NARROW:{
      R:{'-1':'काल','0':'आज','1':'उद्या'},
      P:'one{# दिवसापूर्वी}other{# दिवसांपूर्वी}',
      F:'one{# दिवसामध्ये}other{# दिवसांमध्ये}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'तासात'},
      P:'one{# तासापूर्वी}other{# तासांपूर्वी}',
      F:'one{# तासामध्ये}other{# तासांमध्ये}',
    },
    NARROW:{
      R:{'0':'तासात'},
      P:'one{# तासापूर्वी}other{# तासांपूर्वी}',
      F:'one{येत्या # तासामध्ये}other{येत्या # तासांमध्ये}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'या मिनिटात'},
      P:'one{# मिनिटापूर्वी}other{# मिनिटांपूर्वी}',
      F:'one{# मिनिटामध्ये}other{# मिनिटांमध्ये}',
    },
    SHORT:{
      R:{'0':'या मिनिटात'},
      P:'one{# मिनि. पूर्वी}other{# मिनि. पूर्वी}',
      F:'one{# मिनि. मध्ये}other{# मिनि. मध्ये}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'मागील महिना','0':'हा महिना','1':'पुढील महिना'},
      P:'one{# महिन्यापूर्वी}other{# महिन्यांपूर्वी}',
      F:'one{येत्या # महिन्यामध्ये}other{येत्या # महिन्यांमध्ये}',
    },
    SHORT:{
      R:{'-1':'मागील महिना','0':'हा महिना','1':'पुढील महिना'},
      P:'one{# महिन्यापूर्वी}other{# महिन्यांपूर्वी}',
      F:'one{# महिन्यामध्ये}other{# महिन्यामध्ये}',
    },
    NARROW:{
      R:{'-1':'मागील महिना','0':'हा महिना','1':'पुढील महिना'},
      P:'one{# महिन्यापूर्वी}other{# महिन्यांपूर्वी}',
      F:'one{# महिन्यामध्ये}other{# महिन्यांमध्ये}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'मागील तिमाही','0':'ही तिमाही','1':'पुढील तिमाही'},
      P:'one{# तिमाहीपूर्वी}other{# तिमाहींपूर्वी}',
      F:'one{# तिमाहीमध्ये}other{# तिमाहींमध्ये}',
    },
    SHORT:{
      R:{'-1':'मागील तिमाही','0':'ही तिमाही','1':'पुढील तिमाही'},
      P:'one{# तिमाहीपूर्वी}other{# तिमाहींपूर्वी}',
      F:'one{येत्या # तिमाहीमध्ये}other{येत्या # तिमाहींमध्ये}',
    },
    NARROW:{
      R:{'-1':'मागील तिमाही','0':'ही तिमाही','1':'पुढील तिमाही'},
      P:'one{# तिमाहीपूर्वी}other{# तिमाहींपूर्वी}',
      F:'one{# तिमाहीमध्ये}other{# तिमाहींमध्ये}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'आत्ता'},
      P:'one{# सेकंदापूर्वी}other{# सेकंदांपूर्वी}',
      F:'one{# सेकंदामध्ये}other{# सेकंदांमध्ये}',
    },
    SHORT:{
      R:{'0':'आत्ता'},
      P:'one{# से. पूर्वी}other{# से. पूर्वी}',
      F:'one{# से. मध्ये}other{# से. मध्ये}',
    },
    NARROW:{
      R:{'0':'आत्ता'},
      P:'one{# से. पूर्वी}other{# से. पूर्वी}',
      F:'one{# से. मध्ये}other{येत्या # से. मध्ये}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'मागील आठवडा','0':'हा आठवडा','1':'पुढील आठवडा'},
      P:'one{# आठवड्यापूर्वी}other{# आठवड्यांपूर्वी}',
      F:'one{# आठवड्यामध्ये}other{# आठवड्यांमध्ये}',
    },
    SHORT:{
      R:{'-1':'मागील आठवडा','0':'हा आठवडा','1':'पुढील आठवडा'},
      P:'one{# आठवड्यापूर्वी}other{# आठवड्यांपूर्वी}',
      F:'one{येत्या # आठवड्यामध्ये}other{येत्या # आठवड्यांमध्ये}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'मागील वर्ष','0':'हे वर्ष','1':'पुढील वर्ष'},
      P:'one{# वर्षापूर्वी}other{# वर्षांपूर्वी}',
      F:'one{येत्या # वर्षामध्ये}other{येत्या # वर्षांमध्ये}',
    },
    SHORT:{
      R:{'-1':'मागील वर्ष','0':'हे वर्ष','1':'पुढील वर्ष'},
      P:'one{# वर्षापूर्वी}other{# वर्षांपूर्वी}',
      F:'one{# वर्षामध्ये}other{# वर्षांमध्ये}',
    },
    NARROW:{
      R:{'-1':'मागील वर्ष','0':'हे वर्ष','1':'पुढील वर्ष'},
      P:'one{# वर्षापूर्वी}other{# वर्षांपूर्वी}',
      F:'one{येत्या # वर्षामध्ये}other{येत्या # वर्षांमध्ये}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ms =  {
  DAY: {
    LONG:{
      R:{'-1':'semalam','-2':'kelmarin','0':'hari ini','1':'esok','2':'lusa'},
      P:'other{# hari lalu}',
      F:'other{dalam # hari}',
    },
    SHORT:{
      R:{'-1':'semlm','-2':'kelmarin','0':'hari ini','1':'esok','2':'lusa'},
      P:'other{# hari lalu}',
      F:'other{dlm # hari}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'jam ini'},
      P:'other{# jam lalu}',
      F:'other{dalam # jam}',
    },
    SHORT:{
      R:{'0':'jam ini'},
      P:'other{# jam lalu}',
      F:'other{dlm # jam}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'pada minit ini'},
      P:'other{# minit lalu}',
      F:'other{dalam # minit}',
    },
    SHORT:{
      R:{'0':'pada minit ini'},
      P:'other{# min lalu}',
      F:'other{dlm # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'bulan lalu','0':'bulan ini','1':'bulan depan'},
      P:'other{# bulan lalu}',
      F:'other{dalam # bulan}',
    },
    SHORT:{
      R:{'-1':'bln lalu','0':'bln ini','1':'bln depan'},
      P:'other{# bln lalu}',
      F:'other{dlm # bln}',
    },
    NARROW:{
      R:{'-1':'bln lalu','0':'bln ini','1':'bln depan'},
      P:'other{# bulan lalu}',
      F:'other{dlm # bln}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'suku tahun lalu','0':'suku tahun ini','1':'suku tahun seterusnya'},
      P:'other{# suku tahun lalu}',
      F:'other{dalam # suku tahun}',
    },
    SHORT:{
      R:{'-1':'suku lepas','0':'suku ini','1':'suku seterusnya'},
      P:'other{# suku thn lalu}',
      F:'other{dlm # suku thn}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sekarang'},
      P:'other{# saat lalu}',
      F:'other{dalam # saat}',
    },
    SHORT:{
      R:{'0':'sekarang'},
      P:'other{# saat lalu}',
      F:'other{dlm # saat}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'minggu lalu','0':'minggu ini','1':'minggu depan'},
      P:'other{# minggu lalu}',
      F:'other{dalam # minggu}',
    },
    SHORT:{
      R:{'-1':'mng lepas','0':'mng ini','1':'mng depan'},
      P:'other{# mgu lalu}',
      F:'other{dlm # mgu}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'tahun lalu','0':'tahun ini','1':'tahun depan'},
      P:'other{# tahun lalu}',
      F:'other{dalam # tahun}',
    },
    SHORT:{
      R:{'-1':'thn lepas','0':'thn ini','1':'thn depan'},
      P:'other{# thn lalu}',
      F:'other{dalam # thn}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_mt =  {
  DAY: {
    LONG:{
      R:{'-1':'lbieraħ','0':'illum','1':'għada'},
      P:'few{# ġranet ilu}many{#-il ġurnata ilu}one{ġurnata ilu}other{#-il ġurnata ilu}',
      F:'few{fi żmien # ġurnata oħra}many{fi żmien # ġurnata oħra}one{fi żmien ġurnata}other{fi żmien # ġurnata oħra}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'din is-siegħa'},
      P:'few{# sigħat ilu}many{# sigħat ilu}one{siegħa ilu}other{# sigħat ilu}',
      F:'few{fi żmien # sigħat}many{fi żmien# sigħat}one{fi żmien siegħa oħra}other{fi żmien # sigħat}',
    },
    SHORT:{
      R:{'0':'din is-siegħa'},
      P:'few{# sigħat ilu}many{# sigħat ilu}one{siegħa ilu}other{# sigħat ilu}',
      F:'few{fi żmien # sigħat}many{+# h}one{fi żmien siegħa oħra}other{fi żmien # sigħat}',
    },
    NARROW:{
      R:{'0':'din is-siegħa'},
      P:'few{# sigħat ilu}many{# sigħat ilu}one{siegħa ilu}other{# sigħat ilu}',
      F:'few{fi żmien # sigħat}many{fi żmien # sigħat}one{fi żmien siegħa oħra}other{fi żmien # sigħat}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'din il-minuta'},
      P:'few{# minuti ilu}many{# minuti ilu}one{minuta ilu}other{# minuti ilu}',
      F:'few{sa # minuti oħra}many{sa # minuti oħra}one{sa minuta oħra}other{sa # minuti oħra}',
    },
    SHORT:{
      R:{'0':'din il-minuta'},
      P:'few{# min. ilu}many{# minuti ilu}one{min. ilu}other{# min. ilu}',
      F:'few{sa # min. oħra}many{sa # min. oħra}one{sa min. oħra}other{sa # min. oħra}',
    },
    NARROW:{
      R:{'0':'din il-minuta'},
      P:'few{# min. ilu}many{# min. ilu}one{min. ilu}other{# min. ilu}',
      F:'few{sa # min. oħra}many{+# min}one{sa min. oħra}other{sa # min. oħra}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'Ix-xahar li għadda','0':'Dan ix-xahar','1':'Ix-xahar id-dieħel'},
      P:'few{# xhur ilu}many{# xhur ilu}one{xahar ilu}other{# xhur ilu}',
      F:'few{fi # xhur oħra}many{fi # xhur oħra}one{sa xahar ieħor}other{fi # xhur oħra}',
    },
    SHORT:{
      R:{'-1':'Ix-xahar li għadda','0':'Dan ix-xahar','1':'Ix-xahar id-dieħel'},
      P:'few{# xhur ilu}many{# xhur ilu}one{# xahar ilu}other{# xhur ilu}',
      F:'few{sa # xhur oħra}many{sa # xhur oħra}one{sa xahar ieħor}other{sa # xhur oħra}',
    },
    NARROW:{
      R:{'-1':'Ix-xahar li għadda','0':'Dan ix-xahar','1':'Ix-xahar id-dieħel'},
      P:'few{# xhur ilu}many{# xhur ilu}one{xahar ilu}other{# xhur ilu}',
      F:'few{sa # xhur oħra}many{sa # xhur oħra}one{sa xahar ieħor}other{sa # xhur oħra}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'il-kwart ta’ sena li għadda','0':'il-kwart ta’ sena li qegħdin fih','1':'il-kwart li jmiss tas-sena'},
      P:'few{# kwarti ta’ sena li għaddew}many{# kwarti ta’ sena li għaddew}one{il-kwart ta’ sena li għadda}other{# kwarti ta’ sena li għaddew}',
      F:'few{f’# kwarti ta’ sena oħrajn}many{f’# kwarti ta’ sena oħrajn}one{f’# kwarti ta’ sena oħrajn}other{f’# kwarti ta’ sena oħrajn}',
    },
    SHORT:{
      R:{'-1':'il-kwart ta’ sena li għadda','0':'il-kwart ta’ sena li qegħdin fih','1':'il-kwart li jmiss tas-sena'},
      P:'few{# kwarti ta’ sena ilu}many{# kwarti ta’ sena ilu}one{fil-kwart tas-sena li għadda}other{# kwarti ta’ sena ilu}',
      F:'few{f’# kwarti ta’ sena oħrajn}many{f’# kwarti ta’ sena oħrajn}one{fil-kwart tas-sena li ġej}other{f’# kwarti ta’ sena oħrajn}',
    },
    NARROW:{
      R:{'-1':'il-kwart ta’ sena li għadda','0':'il-kwart ta’ sena li qegħdin fih','1':'il-kwart li jmiss tas-sena'},
      P:'few{# kwarti ta’ sena ilu}many{# kwarti ta’ sena ilu}one{fil-kwart tas-sena li għadda}other{# kwarti ta’ sena ilu}',
      F:'few{f’# kwarti ta’ sena oħrajn}many{f’# kwarti ta’ sena oħrajn}one{fi kwart ta’ sena ieħor}other{f’# kwarti ta’ sena oħrajn}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'issa'},
      P:'few{# sekondi ilu}many{# sekondi ilu}one{sekonda ilu}other{# sekondi ilu}',
      F:'few{sa # sekondi oħra}many{sa # sekondi oħra}one{sa # sekondi oħra}other{sa # sekondi oħra}',
    },
    SHORT:{
      R:{'0':'issa'},
      P:'few{# sek. ilu}many{# sek. ilu}one{sek. ilu}other{# sek. ilu}',
      F:'few{sa # sek. oħra}many{sa # sek. oħra}one{sa # sekondi oħra}other{sa # sekondi oħra}',
    },
    NARROW:{
      R:{'0':'issa'},
      P:'few{# sek. ilu}many{# sek. ilu}one{sek. ilu}other{# sek. ilu}',
      F:'few{sa # sek. oħra}many{sa # sek. oħra}one{sa sek. oħra}other{sa # sek. oħra}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'il-ġimgħa li għaddiet','0':'din il-ġimgħa','1':'il-ġimgħa d-dieħla'},
      P:'few{# ġimgħat ilu}many{# ġimgħat ilu}one{ġimgħa ilu}other{# ġimgħat ilu}',
      F:'few{sa # ġimgħat oħra}many{sa # ġimgħat oħra}one{sa ġimgħa oħra}other{sa # ġimgħat oħra}',
    },
    SHORT:{
      R:{'-1':'il-ġimgħa li għaddiet','0':'din il-ġimgħa','1':'il-ġimgħa d-dieħla'},
      P:'few{# ġimgħat ilu}many{# ġimgħat ilu}one{ġimgħa ilu}other{# ġimgħat ilu}',
      F:'few{sa # ġimgħat oħra}many{sa # ġimgħat oħra}one{sa ġimgħa oħra}other{+# w}',
    },
    NARROW:{
      R:{'-1':'il-ġimgħa li għaddiet','0':'din il-ġimgħa','1':'il-ġimgħa d-dieħla'},
      P:'few{# ġimgħat ilu}many{# ġimgħat ilu}one{ġimgħa ilu}other{# ġimgħat ilu}',
      F:'few{sa # ġimgħat oħra}many{sa # ġimgħat oħra}one{sa ġimgħa oħra}other{sa # ġimgħat oħra}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'is-sena l-oħra','0':'din is-sena','1':'is-sena d-dieħla'},
      P:'few{# snin ilu}many{# snin ilu}one{sena ilu}other{# snin ilu}',
      F:'few{fi żmien # snin oħra}many{fi żmien # snin oħra}one{fi żmien sena}other{fi żmien # snin oħra}',
    },
    SHORT:{
      R:{'-1':'is-sena l-oħra','0':'din is-sena','1':'is-sena d-dieħla'},
      P:'few{# snin ilu}many{# snin ilu}one{sa sena ilu}other{# snin ilu}',
      F:'few{fi żmien # snin oħra}many{fi żmien # snin oħra}one{fi żmien sena}other{fi żmien # snin oħra}',
    },
    NARROW:{
      R:{'-1':'is-sena l-oħra','0':'din is-sena','1':'is-sena d-dieħla'},
      P:'few{# snin ilu}many{# snin ilu}one{sena ilu}other{# snin ilu}',
      F:'few{fi żmien # snin oħra}many{fi żmien # snin oħra}one{fi żmien sena}other{fi żmien # snin oħra}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_my =  {
  DAY: {
    LONG:{
      R:{'-1':'မနေ့က','-2':'တစ်နေ့က','0':'ယနေ့','1':'မနက်ဖြန်','2':'သန်ဘက်ခါ'},
      P:'other{ပြီးခဲ့သည့် # ရက်}',
      F:'other{# ရက်အတွင်း}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ဤအချိန်'},
      P:'other{ပြီးခဲ့သည့် # နာရီ}',
      F:'other{# နာရီအတွင်း}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ဤမိနစ်'},
      P:'other{ပြီးခဲ့သည့် # မိနစ်}',
      F:'other{# မိနစ်အတွင်း}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ပြီးခဲ့သည့်လ','0':'ယခုလ','1':'လာမည့်လ'},
      P:'other{ပြီးခဲ့သည့် # လ}',
      F:'other{# လအတွင်း}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ပြီးခဲ့သည့် သုံးလပတ်','0':'ယခု သုံးလပတ်','1':'လာမည့် သုံးလပတ်'},
      P:'other{ပြီးခဲ့သည့် သုံးလပတ်ကာလ # ခုအတွင်း}',
      F:'other{သုံးလပတ်ကာလ # အတွင်း}',
    },
    SHORT:{
      R:{'-1':'ပြီးခဲ့သောသုံးလပတ်','0':'ယခုသုံးလပတ်','1':'နောက်လာမည့်သုံးလပတ်'},
      P:'other{ပြီးခဲ့သည့် သုံးလပတ်ကာလ # ခုအတွင်း}',
      F:'other{သုံးလပတ်ကာလ # ခုအတွင်း}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ယခု'},
      P:'other{ပြီးခဲ့သည့် # စက္ကန့်}',
      F:'other{# စက္ကန့်အတွင်း}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ပြီးခဲ့သည့် သီတင်းပတ်','0':'ယခု သီတင်းပတ်','1':'လာမည့် သီတင်းပတ်'},
      P:'other{ပြီးခဲ့သည့် # ပတ်}',
      F:'other{# ပတ်အတွင်း}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ယမန်နှစ်','0':'ယခုနှစ်','1':'လာမည့်နှစ်'},
      P:'other{ပြီးခဲ့သည့် # နှစ်}',
      F:'other{# နှစ်အတွင်း}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_nb =  {
  DAY: {
    LONG:{
      R:{'-1':'i går','-2':'i forgårs','0':'i dag','1':'i morgen','2':'i overmorgen'},
      P:'one{for # døgn siden}other{for # døgn siden}',
      F:'one{om # døgn}other{om # døgn}',
    },
    SHORT:{
      R:{'-1':'i går','-2':'i forgårs','0':'i dag','1':'i morgen','2':'i overmorgen'},
      P:'one{for # d. siden}other{for # d. siden}',
      F:'one{om # d.}other{om # d.}',
    },
    NARROW:{
      R:{'-1':'i går','-2':'-2 d.','0':'i dag','1':'i morgen','2':'+2 d.'},
      P:'one{-# d.}other{-# d.}',
      F:'one{+# d.}other{+# d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'denne timen'},
      P:'one{for # time siden}other{for # timer siden}',
      F:'one{om # time}other{om # timer}',
    },
    SHORT:{
      R:{'0':'denne timen'},
      P:'one{for # t siden}other{for # t siden}',
      F:'one{om # t}other{om # t}',
    },
    NARROW:{
      R:{'0':'denne timen'},
      P:'one{-# t}other{-# t}',
      F:'one{+# t}other{+# t}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'dette minuttet'},
      P:'one{for # minutt siden}other{for # minutter siden}',
      F:'one{om # minutt}other{om # minutter}',
    },
    SHORT:{
      R:{'0':'dette minuttet'},
      P:'one{for # min siden}other{for # min siden}',
      F:'one{om # min}other{om # min}',
    },
    NARROW:{
      R:{'0':'dette minuttet'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'forrige måned','0':'denne måneden','1':'neste måned'},
      P:'one{for # måned siden}other{for # måneder siden}',
      F:'one{om # måned}other{om # måneder}',
    },
    SHORT:{
      R:{'-1':'forrige md.','0':'denne md.','1':'neste md.'},
      P:'one{for # md. siden}other{for # md. siden}',
      F:'one{om # md.}other{om # md.}',
    },
    NARROW:{
      R:{'-1':'forrige md.','0':'denne md.','1':'neste md.'},
      P:'one{-# md.}other{-# md.}',
      F:'one{+# md.}other{+# md.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'forrige kvartal','0':'dette kvartalet','1':'neste kvartal'},
      P:'one{for # kvartal siden}other{for # kvartaler siden}',
      F:'one{om # kvartal}other{om # kvartaler}',
    },
    SHORT:{
      R:{'-1':'forrige kv.','0':'dette kv.','1':'neste kv.'},
      P:'one{for # kv. siden}other{for # kv. siden}',
      F:'one{om # kv.}other{om # kv.}',
    },
    NARROW:{
      R:{'-1':'forrige kv.','0':'dette kv.','1':'neste kv.'},
      P:'one{–# kv.}other{–# kv.}',
      F:'one{+# kv.}other{+# kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nå'},
      P:'one{for # sekund siden}other{for # sekunder siden}',
      F:'one{om # sekund}other{om # sekunder}',
    },
    SHORT:{
      R:{'0':'nå'},
      P:'one{for # sek siden}other{for # sek siden}',
      F:'one{om # sek}other{om # sek}',
    },
    NARROW:{
      R:{'0':'nå'},
      P:'one{-# s}other{-# s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{for # uke siden}other{for # uker siden}',
      F:'one{om # uke}other{om # uker}',
    },
    SHORT:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{for # u. siden}other{for # u. siden}',
      F:'one{om # u.}other{om # u.}',
    },
    NARROW:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{-# u.}other{-# u.}',
      F:'one{+# u.}other{+# u.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'i fjor','0':'i år','1':'neste år'},
      P:'one{for # år siden}other{for # år siden}',
      F:'one{om # år}other{om # år}',
    },
    NARROW:{
      R:{'-1':'i fjor','0':'i år','1':'neste år'},
      P:'one{–# år}other{–# år}',
      F:'one{+# år}other{+# år}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ne =  {
  DAY: {
    LONG:{
      R:{'-1':'हिजो','-2':'अस्ति','0':'आज','1':'भोलि','2':'पर्सि'},
      P:'one{# दिन पहिले}other{# दिन पहिले}',
      F:'one{# दिनमा}other{# दिनमा}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'यस घडीमा'},
      P:'one{# घण्टा पहिले}other{# घण्टा पहिले}',
      F:'one{# घण्टामा}other{# घण्टामा}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'यही मिनेटमा'},
      P:'one{# मिनेट पहिले}other{# मिनेट पहिले}',
      F:'one{# मिनेटमा}other{# मिनेटमा}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'गत महिना','0':'यो महिना','1':'अर्को महिना'},
      P:'one{# महिना पहिले}other{# महिना पहिले}',
      F:'one{# महिनामा}other{# महिनामा}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'अघिल्लो सत्र','0':'यो सत्र','1':'अर्को सत्र'},
      P:'one{#सत्र अघि}other{#सत्र अघि}',
      F:'one{+# सत्रमा}other{#सत्रमा}',
    },
    SHORT:{
      R:{'-1':'अघिल्लो सत्र','0':'यो सत्र','1':'अर्को सत्र'},
      P:'one{#सत्र अघि}other{#सत्र अघि}',
      F:'one{#सत्रमा}other{#सत्रमा}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'अहिले'},
      P:'one{# सेकेन्ड पहिले}other{# सेकेन्ड पहिले}',
      F:'one{# सेकेन्डमा}other{# सेकेन्डमा}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'गत हप्ता','0':'यो हप्ता','1':'आउने हप्ता'},
      P:'one{# हप्ता पहिले}other{# हप्ता पहिले}',
      F:'one{# हप्तामा}other{# हप्तामा}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'गत वर्ष','0':'यो वर्ष','1':'आगामी वर्ष'},
      P:'one{# वर्ष अघि}other{# वर्ष अघि}',
      F:'one{# वर्षमा}other{# वर्षमा}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_nl =  {
  DAY: {
    LONG:{
      R:{'-1':'gisteren','-2':'eergisteren','0':'vandaag','1':'morgen','2':'overmorgen'},
      P:'one{# dag geleden}other{# dagen geleden}',
      F:'one{over # dag}other{over # dagen}',
    },
    SHORT:{
      R:{'-1':'gisteren','-2':'eergisteren','0':'vandaag','1':'morgen','2':'overmorgen'},
      P:'one{# dag geleden}other{# dgn geleden}',
      F:'one{over # dag}other{over # dgn}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'binnen een uur'},
      P:'one{# uur geleden}other{# uur geleden}',
      F:'one{over # uur}other{over # uur}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'binnen een minuut'},
      P:'one{# minuut geleden}other{# minuten geleden}',
      F:'one{over # minuut}other{over # minuten}',
    },
    SHORT:{
      R:{'0':'binnen een minuut'},
      P:'one{# min. geleden}other{# min. geleden}',
      F:'one{over # min.}other{over # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'vorige maand','0':'deze maand','1':'volgende maand'},
      P:'one{# maand geleden}other{# maanden geleden}',
      F:'one{over # maand}other{over # maanden}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'vorig kwartaal','0':'dit kwartaal','1':'volgend kwartaal'},
      P:'one{# kwartaal geleden}other{# kwartalen geleden}',
      F:'one{over # kwartaal}other{over # kwartalen}',
    },
    NARROW:{
      R:{'-1':'vorig kwartaal','0':'dit kwartaal','1':'volgend kwartaal'},
      P:'one{# kwartaal geleden}other{# kwartalen geleden}',
      F:'one{over # kw.}other{over # kwartalen}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nu'},
      P:'one{# seconde geleden}other{# seconden geleden}',
      F:'one{over # seconde}other{over # seconden}',
    },
    SHORT:{
      R:{'0':'nu'},
      P:'one{# sec. geleden}other{# sec. geleden}',
      F:'one{over # sec.}other{over # sec.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'vorige week','0':'deze week','1':'volgende week'},
      P:'one{# week geleden}other{# weken geleden}',
      F:'one{over # week}other{over # weken}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'vorig jaar','0':'dit jaar','1':'volgend jaar'},
      P:'one{# jaar geleden}other{# jaar geleden}',
      F:'one{over # jaar}other{over # jaar}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_no =  {
  DAY: {
    LONG:{
      R:{'-1':'i går','-2':'i forgårs','0':'i dag','1':'i morgen','2':'i overmorgen'},
      P:'one{for # døgn siden}other{for # døgn siden}',
      F:'one{om # døgn}other{om # døgn}',
    },
    SHORT:{
      R:{'-1':'i går','-2':'i forgårs','0':'i dag','1':'i morgen','2':'i overmorgen'},
      P:'one{for # d. siden}other{for # d. siden}',
      F:'one{om # d.}other{om # d.}',
    },
    NARROW:{
      R:{'-1':'i går','-2':'-2 d.','0':'i dag','1':'i morgen','2':'+2 d.'},
      P:'one{-# d.}other{-# d.}',
      F:'one{+# d.}other{+# d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'denne timen'},
      P:'one{for # time siden}other{for # timer siden}',
      F:'one{om # time}other{om # timer}',
    },
    SHORT:{
      R:{'0':'denne timen'},
      P:'one{for # t siden}other{for # t siden}',
      F:'one{om # t}other{om # t}',
    },
    NARROW:{
      R:{'0':'denne timen'},
      P:'one{-# t}other{-# t}',
      F:'one{+# t}other{+# t}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'dette minuttet'},
      P:'one{for # minutt siden}other{for # minutter siden}',
      F:'one{om # minutt}other{om # minutter}',
    },
    SHORT:{
      R:{'0':'dette minuttet'},
      P:'one{for # min siden}other{for # min siden}',
      F:'one{om # min}other{om # min}',
    },
    NARROW:{
      R:{'0':'dette minuttet'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'forrige måned','0':'denne måneden','1':'neste måned'},
      P:'one{for # måned siden}other{for # måneder siden}',
      F:'one{om # måned}other{om # måneder}',
    },
    SHORT:{
      R:{'-1':'forrige md.','0':'denne md.','1':'neste md.'},
      P:'one{for # md. siden}other{for # md. siden}',
      F:'one{om # md.}other{om # md.}',
    },
    NARROW:{
      R:{'-1':'forrige md.','0':'denne md.','1':'neste md.'},
      P:'one{-# md.}other{-# md.}',
      F:'one{+# md.}other{+# md.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'forrige kvartal','0':'dette kvartalet','1':'neste kvartal'},
      P:'one{for # kvartal siden}other{for # kvartaler siden}',
      F:'one{om # kvartal}other{om # kvartaler}',
    },
    SHORT:{
      R:{'-1':'forrige kv.','0':'dette kv.','1':'neste kv.'},
      P:'one{for # kv. siden}other{for # kv. siden}',
      F:'one{om # kv.}other{om # kv.}',
    },
    NARROW:{
      R:{'-1':'forrige kv.','0':'dette kv.','1':'neste kv.'},
      P:'one{–# kv.}other{–# kv.}',
      F:'one{+# kv.}other{+# kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nå'},
      P:'one{for # sekund siden}other{for # sekunder siden}',
      F:'one{om # sekund}other{om # sekunder}',
    },
    SHORT:{
      R:{'0':'nå'},
      P:'one{for # sek siden}other{for # sek siden}',
      F:'one{om # sek}other{om # sek}',
    },
    NARROW:{
      R:{'0':'nå'},
      P:'one{-# s}other{-# s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{for # uke siden}other{for # uker siden}',
      F:'one{om # uke}other{om # uker}',
    },
    SHORT:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{for # u. siden}other{for # u. siden}',
      F:'one{om # u.}other{om # u.}',
    },
    NARROW:{
      R:{'-1':'forrige uke','0':'denne uken','1':'neste uke'},
      P:'one{-# u.}other{-# u.}',
      F:'one{+# u.}other{+# u.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'i fjor','0':'i år','1':'neste år'},
      P:'one{for # år siden}other{for # år siden}',
      F:'one{om # år}other{om # år}',
    },
    NARROW:{
      R:{'-1':'i fjor','0':'i år','1':'neste år'},
      P:'one{–# år}other{–# år}',
      F:'one{+# år}other{+# år}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_no_NO = exports.RelativeDateTimeSymbols_no;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_or =  {
  DAY: {
    LONG:{
      R:{'-1':'ଗତକାଲି','0':'ଆଜି','1':'ଆସନ୍ତାକାଲି'},
      P:'one{# ଦିନ ପୂର୍ବେ}other{# ଦିନ ପୂର୍ବେ}',
      F:'one{# ଦିନରେ}other{# ଦିନରେ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ଏହି ଘଣ୍ଟା'},
      P:'one{# ଘଣ୍ଟା ପୂର୍ବେ}other{# ଘଣ୍ଟା ପୂର୍ବେ}',
      F:'one{# ଘଣ୍ଟାରେ}other{# ଘଣ୍ଟାରେ}',
    },
    SHORT:{
      R:{'0':'ଏହି ଘଣ୍ଟା'},
      P:'one{# ଘ. ପୂର୍ବେ}other{# ଘ. ପୂର୍ବେ}',
      F:'one{# ଘ. ରେ}other{# ଘ. ରେ}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ଏହି ମିନିଟ୍'},
      P:'one{# ମିନିଟ୍ ପୂର୍ବେ}other{# ମିନିଟ୍ ପୂର୍ବେ}',
      F:'one{# ମିନିଟ୍‌‌ରେ}other{# ମିନିଟ୍‌‌ରେ}',
    },
    SHORT:{
      R:{'0':'ଏହି ମିନିଟ୍'},
      P:'one{# ମି. ପୂର୍ବେ}other{# ମି. ପୂର୍ବେ}',
      F:'one{# ମି. ରେ}other{# ମି. ରେ}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ଗତ ମାସ','0':'ଏହି ମାସ','1':'ଆଗାମୀ ମାସ'},
      P:'one{# ମାସ ପୂର୍ବେ}other{# ମାସ ପୂର୍ବେ}',
      F:'one{# ମାସରେ}other{# ମାସରେ}',
    },
    SHORT:{
      R:{'-1':'ଗତ ମାସ','0':'ଏହି ମାସ','1':'ଆଗାମୀ ମାସ'},
      P:'one{# ମା. ପୂର୍ବେ}other{# ମା. ପୂର୍ବେ}',
      F:'one{# ମା. ରେ}other{# ମା. ରେ}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ଗତ ତ୍ରୟମାସ','0':'ଗତ ତ୍ରୟମାସ','1':'ଆଗାମୀ ତ୍ରୟମାସ'},
      P:'one{# ତ୍ରୟମାସ ପୂର୍ବେ}other{# ତ୍ରୟମାସ ପୂର୍ବେ}',
      F:'one{# ତ୍ରୟମାସରେ}other{# ତ୍ରୟମାସରେ}',
    },
    SHORT:{
      R:{'-1':'ଗତ ତ୍ରୟମାସ','0':'ଗତ ତ୍ରୟମାସ','1':'ଆଗାମୀ ତ୍ରୟମାସ'},
      P:'one{# ତ୍ରୟ. ପୂର୍ବେ}other{# ତ୍ରୟ. ପୂର୍ବେ}',
      F:'one{# ତ୍ରୟ. ରେ}other{# ତ୍ରୟ. ରେ}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ବର୍ତ୍ତମାନ'},
      P:'one{# ସେକେଣ୍ଡ ପୂର୍ବେ}other{# ସେକେଣ୍ଡ ପୂର୍ବେ}',
      F:'one{# ସେକେଣ୍ଡରେ}other{# ସେକେଣ୍ଡରେ}',
    },
    SHORT:{
      R:{'0':'ବର୍ତ୍ତମାନ'},
      P:'one{# ସେ. ପୂର୍ବେ}other{# ସେ. ପୂର୍ବେ}',
      F:'one{# ସେ. ରେ}other{# ସେ. ରେ}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ଗତ ସପ୍ତାହ','0':'ଏହି ସପ୍ତାହ','1':'ଆଗାମୀ ସପ୍ତାହ'},
      P:'one{# ସପ୍ତାହରେ}other{# ସପ୍ତାହ ପୂର୍ବେ}',
      F:'one{# ସପ୍ତାହରେ}other{# ସପ୍ତାହରେ}',
    },
    SHORT:{
      R:{'-1':'ଗତ ସପ୍ତାହ','0':'ଏହି ସପ୍ତାହ','1':'ଆଗାମୀ ସପ୍ତାହ'},
      P:'one{# ସପ୍ତା. ପୂର୍ବେ}other{# ସପ୍ତା. ପୂର୍ବେ}',
      F:'one{# ସପ୍ତା. ରେ}other{# ସପ୍ତା. ରେ}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ଗତ ବର୍ଷ','0':'ଏହି ବର୍ଷ','1':'ଆଗାମୀ ବର୍ଷ'},
      P:'one{# ବର୍ଷ ପୂର୍ବେ}other{# ବର୍ଷ ପୂର୍ବେ}',
      F:'one{# ବର୍ଷରେ}other{# ବର୍ଷରେ}',
    },
    SHORT:{
      R:{'-1':'ଗତ ବର୍ଷ','0':'ଏହି ବର୍ଷ','1':'ଆଗାମୀ ବର୍ଷ'},
      P:'one{# ବ. ପୂର୍ବେ}other{# ବ. ପୂର୍ବେ}',
      F:'one{# ବ. ରେ}other{# ବ. ରେ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_pa =  {
  DAY: {
    LONG:{
      R:{'-1':'ਬੀਤਿਆ ਕੱਲ੍ਹ','0':'ਅੱਜ','1':'ਭਲਕੇ'},
      P:'one{# ਦਿਨ ਪਹਿਲਾਂ}other{# ਦਿਨ ਪਹਿਲਾਂ}',
      F:'one{# ਦਿਨ ਵਿੱਚ}other{# ਦਿਨਾਂ ਵਿੱਚ}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ਇਸ ਘੰਟੇ'},
      P:'one{# ਘੰਟਾ ਪਹਿਲਾਂ}other{# ਘੰਟੇ ਪਹਿਲਾਂ}',
      F:'one{# ਘੰਟੇ ਵਿੱਚ}other{# ਘੰਟਿਆਂ ਵਿੱਚ}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ਇਸ ਮਿੰਟ'},
      P:'one{# ਮਿੰਟ ਪਹਿਲਾਂ}other{# ਮਿੰਟ ਪਹਿਲਾਂ}',
      F:'one{# ਮਿੰਟ ਵਿੱਚ}other{# ਮਿੰਟਾਂ ਵਿੱਚ}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'ਪਿਛਲਾ ਮਹੀਨਾ','0':'ਇਹ ਮਹੀਨਾ','1':'ਅਗਲਾ ਮਹੀਨਾ'},
      P:'one{# ਮਹੀਨਾ ਪਹਿਲਾਂ}other{# ਮਹੀਨੇ ਪਹਿਲਾਂ}',
      F:'one{# ਮਹੀਨੇ ਵਿੱਚ}other{# ਮਹੀਨਿਆਂ ਵਿੱਚ}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ਪਿਛਲੀ ਤਿਮਾਹੀ','0':'ਇਸ ਤਿਮਾਹੀ','1':'ਅਗਲੀ ਤਿਮਾਹੀ'},
      P:'one{# ਤਿਮਾਹੀ ਪਹਿਲਾਂ}other{# ਤਿਮਾਹੀਆਂ ਪਹਿਲਾਂ}',
      F:'one{# ਤਿਮਾਹੀ ਵਿੱਚ}other{# ਤਿਮਾਹੀਆਂ ਵਿੱਚ}',
    },
    SHORT:{
      R:{'-1':'ਪਿਛਲੀ ਤਿਮਾਹੀ','0':'ਇਹ ਤਿਮਾਹੀ','1':'ਅਗਲੀ ਤਿਮਾਹੀ'},
      P:'one{# ਤਿਮਾਹੀ ਪਹਿਲਾਂ}other{# ਤਿਮਾਹੀਆਂ ਪਹਿਲਾਂ}',
      F:'one{# ਤਿਮਾਹੀ ਵਿੱਚ}other{# ਤਿਮਾਹੀਆਂ ਵਿੱਚ}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ਹੁਣ'},
      P:'one{# ਸਕਿੰਟ ਪਹਿਲਾਂ}other{# ਸਕਿੰਟ ਪਹਿਲਾਂ}',
      F:'one{# ਸਕਿੰਟ ਵਿੱਚ}other{# ਸਕਿੰਟਾਂ ਵਿੱਚ}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'ਪਿਛਲਾ ਹਫ਼ਤਾ','0':'ਇਹ ਹਫ਼ਤਾ','1':'ਅਗਲਾ ਹਫ਼ਤਾ'},
      P:'one{# ਹਫ਼ਤਾ ਪਹਿਲਾਂ}other{# ਹਫ਼ਤੇ ਪਹਿਲਾਂ}',
      F:'one{# ਹਫ਼ਤੇ ਵਿੱਚ}other{# ਹਫ਼ਤਿਆਂ ਵਿੱਚ}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ਪਿਛਲਾ ਸਾਲ','0':'ਇਹ ਸਾਲ','1':'ਅਗਲਾ ਸਾਲ'},
      P:'one{# ਸਾਲ ਪਹਿਲਾਂ}other{# ਸਾਲ ਪਹਿਲਾਂ}',
      F:'one{# ਸਾਲ ਵਿੱਚ}other{# ਸਾਲਾਂ ਵਿੱਚ}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_pl =  {
  DAY: {
    LONG:{
      R:{'-1':'wczoraj','-2':'przedwczoraj','0':'dzisiaj','1':'jutro','2':'pojutrze'},
      P:'few{# dni temu}many{# dni temu}one{# dzień temu}other{# dnia temu}',
      F:'few{za # dni}many{za # dni}one{za # dzień}other{za # dnia}',
    },
    SHORT:{
      R:{'-2':'przedwczoraj','2':'pojutrze'},
      P:'few{# dni temu}many{# dni temu}one{# dzień temu}other{# dnia temu}',
      F:'few{za # dni}many{za # dni}one{za # dzień}other{za # dnia}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ta godzina'},
      P:'few{# godziny temu}many{# godzin temu}one{# godzinę temu}other{# godziny temu}',
      F:'few{za # godziny}many{za # godzin}one{za # godzinę}other{za # godziny}',
    },
    SHORT:{
      R:{'0':'ta godzina'},
      P:'few{# godz. temu}many{# godz. temu}one{# godz. temu}other{# godz. temu}',
      F:'few{za # godz.}many{za # godz.}one{za # godz.}other{za # godz.}',
    },
    NARROW:{
      R:{'0':'ta godzina'},
      P:'few{# g. temu}many{# g. temu}one{# g. temu}other{# g. temu}',
      F:'few{za # g.}many{za # g.}one{za # g.}other{za # g.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ta minuta'},
      P:'few{# minuty temu}many{# minut temu}one{# minutę temu}other{# minuty temu}',
      F:'few{za # minuty}many{za # minut}one{za # minutę}other{za # minuty}',
    },
    SHORT:{
      R:{'0':'ta minuta'},
      P:'few{# min temu}many{# min temu}one{# min temu}other{# min temu}',
      F:'few{za # min}many{za # min}one{za # min}other{za # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'w zeszłym miesiącu','0':'w tym miesiącu','1':'w przyszłym miesiącu'},
      P:'few{# miesiące temu}many{# miesięcy temu}one{# miesiąc temu}other{# miesiąca temu}',
      F:'few{za # miesiące}many{za # miesięcy}one{za # miesiąc}other{za # miesiąca}',
    },
    SHORT:{
      R:{'-1':'w zeszłym miesiącu','0':'w tym miesiącu','1':'w przyszłym miesiącu'},
      P:'few{# mies. temu}many{# mies. temu}one{# mies. temu}other{# mies. temu}',
      F:'few{za # mies.}many{za # mies.}one{za # mies.}other{za # mies.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'w zeszłym kwartale','0':'w tym kwartale','1':'w przyszłym kwartale'},
      P:'few{# kwartały temu}many{# kwartałów temu}one{# kwartał temu}other{# kwartału temu}',
      F:'few{za # kwartały}many{za # kwartałów}one{za # kwartał}other{za # kwartału}',
    },
    SHORT:{
      R:{'-1':'w zeszłym kwartale','0':'w tym kwartale','1':'w przyszłym kwartale'},
      P:'few{# kw. temu}many{# kw. temu}one{# kw. temu}other{# kw. temu}',
      F:'few{za # kw.}many{za # kw.}one{za # kw.}other{za # kw.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'teraz'},
      P:'few{# sekundy temu}many{# sekund temu}one{# sekundę temu}other{# sekundy temu}',
      F:'few{za # sekundy}many{za # sekund}one{za # sekundę}other{za # sekundy}',
    },
    SHORT:{
      R:{'0':'teraz'},
      P:'few{# sek. temu}many{# sek. temu}one{# sek. temu}other{# sek. temu}',
      F:'few{za # sek.}many{za # sek.}one{za # sek.}other{za # sek.}',
    },
    NARROW:{
      R:{'0':'teraz'},
      P:'few{# s temu}many{# s temu}one{# s temu}other{# s temu}',
      F:'few{za # s}many{za # s}one{za # s}other{za # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'w zeszłym tygodniu','0':'w tym tygodniu','1':'w przyszłym tygodniu'},
      P:'few{# tygodnie temu}many{# tygodni temu}one{# tydzień temu}other{# tygodnia temu}',
      F:'few{za # tygodnie}many{za # tygodni}one{za # tydzień}other{za # tygodnia}',
    },
    SHORT:{
      R:{'-1':'w zeszłym tygodniu','0':'w tym tygodniu','1':'w przyszłym tygodniu'},
      P:'few{# tyg. temu}many{# tyg. temu}one{# tydz. temu}other{# tyg. temu}',
      F:'few{za # tyg.}many{za # tyg.}one{za # tydz.}other{za # tyg.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'w zeszłym roku','0':'w tym roku','1':'w przyszłym roku'},
      P:'few{# lata temu}many{# lat temu}one{# rok temu}other{# roku temu}',
      F:'few{za # lata}many{za # lat}one{za # rok}other{za # roku}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_pt =  {
  DAY: {
    LONG:{
      R:{'-1':'ontem','-2':'anteontem','0':'hoje','1':'amanhã','2':'depois de amanhã'},
      P:'one{há # dia}other{há # dias}',
      F:'one{em # dia}other{em # dias}',
    },
    SHORT:{
      R:{'-2':'anteontem','2':'depois de amanhã'},
      P:'one{há # dia}other{há # dias}',
      F:'one{em # dia}other{em # dias}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{há # hora}other{há # horas}',
      F:'one{em # hora}other{em # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{há # h}other{há # h}',
      F:'one{em # h}other{em # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{há # minuto}other{há # minutos}',
      F:'one{em # minuto}other{em # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{há # min.}other{há # min.}',
      F:'one{em # min.}other{em # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'mês passado','0':'este mês','1':'próximo mês'},
      P:'one{há # mês}other{há # meses}',
      F:'one{em # mês}other{em # meses}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'último trimestre','0':'este trimestre','1':'próximo trimestre'},
      P:'one{há # trimestre}other{há # trimestres}',
      F:'one{em # trimestre}other{em # trimestres}',
    },
    SHORT:{
      R:{'-1':'último trimestre','0':'este trimestre','1':'próximo trimestre'},
      P:'one{há # trim.}other{# trim. atrás}',
      F:'one{em # trim.}other{em # trim.}',
    },
    NARROW:{
      R:{'-1':'último trimestre','0':'este trimestre','1':'próximo trimestre'},
      P:'one{há # trim.}other{há # trim.}',
      F:'one{em # trim.}other{em # trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'agora'},
      P:'one{há # segundo}other{há # segundos}',
      F:'one{em # segundo}other{em # segundos}',
    },
    SHORT:{
      R:{'0':'agora'},
      P:'one{há # seg.}other{há # seg.}',
      F:'one{em # seg.}other{em # seg.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'semana passada','0':'esta semana','1':'próxima semana'},
      P:'one{há # semana}other{há # semanas}',
      F:'one{em # semana}other{em # semanas}',
    },
    SHORT:{
      R:{'-1':'semana passada','0':'esta semana','1':'próxima semana'},
      P:'one{há # sem.}other{há # sem.}',
      F:'one{em # sem.}other{em # sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ano passado','0':'este ano','1':'próximo ano'},
      P:'one{há # ano}other{há # anos}',
      F:'one{em # ano}other{em # anos}',
    },
    NARROW:{
      R:{'-1':'ano passado','0':'este ano','1':'próximo ano'},
      P:'one{há # ano}other{# anos atrás}',
      F:'one{em # ano}other{em # anos}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_pt_BR = exports.RelativeDateTimeSymbols_pt;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_pt_PT =  {
  DAY: {
    LONG:{
      R:{'-1':'ontem','-2':'anteontem','0':'hoje','1':'amanhã','2':'depois de amanhã'},
      P:'one{há # dia}other{há # dias}',
      F:'one{dentro de # dia}other{dentro de # dias}',
    },
    SHORT:{
      R:{'-2':'anteontem','0':'hoje','2':'depois de amanhã'},
      P:'one{há # dia}other{há # dias}',
      F:'one{dentro de # dia}other{dentro de # dias}',
    },
    NARROW:{
      R:{'-2':'anteontem','0':'hoje','2':'depois de amanhã'},
      P:'one{há # dias}other{há # dias}',
      F:'one{+# dia}other{+# dias}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'esta hora'},
      P:'one{há # hora}other{há # horas}',
      F:'one{dentro de # hora}other{dentro de # horas}',
    },
    SHORT:{
      R:{'0':'esta hora'},
      P:'one{há # h}other{há # h}',
      F:'one{dentro de # h}other{dentro de # h}',
    },
    NARROW:{
      R:{'0':'esta hora'},
      P:'one{-# h}other{-# h}',
      F:'one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'este minuto'},
      P:'one{há # minuto}other{há # minutos}',
      F:'one{dentro de # minuto}other{dentro de # minutos}',
    },
    SHORT:{
      R:{'0':'este minuto'},
      P:'one{há # min}other{há # min}',
      F:'one{dentro de # min}other{dentro de # min}',
    },
    NARROW:{
      R:{'0':'este minuto'},
      P:'one{-# min}other{-# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'mês passado','0':'este mês','1':'próximo mês'},
      P:'one{há # mês}other{há # meses}',
      F:'one{dentro de # mês}other{dentro de # meses}',
    },
    NARROW:{
      R:{'-1':'mês passado','0':'este mês','1':'próximo mês'},
      P:'one{-# mês}other{-# meses}',
      F:'one{+# mês}other{+# meses}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'trimestre passado','0':'este trimestre','1':'próximo trimestre'},
      P:'one{há # trimestre}other{há # trimestres}',
      F:'one{dentro de # trimestre}other{dentro de # trimestres}',
    },
    SHORT:{
      R:{'-1':'trim. passado','0':'este trim.','1':'próximo trim.'},
      P:'one{há # trim.}other{há # trim.}',
      F:'one{dentro de # trim.}other{dentro de # trim.}',
    },
    NARROW:{
      R:{'-1':'trim. passado','0':'este trim.','1':'próximo trim.'},
      P:'one{-# trim.}other{-# trim.}',
      F:'one{+# trim.}other{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'agora'},
      P:'one{há # segundo}other{há # segundos}',
      F:'one{dentro de # segundo}other{dentro de # segundos}',
    },
    SHORT:{
      R:{'0':'agora'},
      P:'one{há # s}other{há # s}',
      F:'one{dentro de # s}other{dentro de # s}',
    },
    NARROW:{
      R:{'0':'agora'},
      P:'one{-# s}other{-# s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'semana passada','0':'esta semana','1':'próxima semana'},
      P:'one{há # semana}other{há # semanas}',
      F:'one{dentro de # semana}other{dentro de # semanas}',
    },
    SHORT:{
      R:{'-1':'semana passada','0':'esta semana','1':'próxima semana'},
      P:'one{há # sem.}other{há # sem.}',
      F:'one{dentro de # sem.}other{dentro de # sem.}',
    },
    NARROW:{
      R:{'-1':'semana passada','0':'esta semana','1':'próxima semana'},
      P:'one{-# sem.}other{-# sem.}',
      F:'one{+# sem.}other{+# sem.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ano passado','0':'este ano','1':'próximo ano'},
      P:'one{há # ano}other{há # anos}',
      F:'one{dentro de # ano}other{dentro de # anos}',
    },
    NARROW:{
      R:{'-1':'ano passado','0':'este ano','1':'próximo ano'},
      P:'one{-# ano}other{-# anos}',
      F:'one{+# ano}other{+# anos}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ro =  {
  DAY: {
    LONG:{
      R:{'-1':'ieri','-2':'alaltăieri','0':'azi','1':'mâine','2':'poimâine'},
      P:'few{acum # zile}one{acum # zi}other{acum # de zile}',
      F:'few{peste # zile}one{peste # zi}other{peste # de zile}',
    },
    NARROW:{
      R:{'-1':'ieri','-2':'alaltăieri','0':'azi','1':'mâine','2':'poimâine'},
      P:'few{-# zile}one{-# zi}other{-# zile}',
      F:'few{+# zile}one{+# zi}other{+# zile}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ora aceasta'},
      P:'few{acum # ore}one{acum # oră}other{acum # de ore}',
      F:'few{peste # ore}one{peste # oră}other{peste # de ore}',
    },
    SHORT:{
      R:{'0':'ora aceasta'},
      P:'few{acum # h}one{acum # h}other{acum # h}',
      F:'few{peste # h}one{peste # h}other{peste # h}',
    },
    NARROW:{
      R:{'0':'ora aceasta'},
      P:'few{-# h}one{-# h}other{-# h}',
      F:'few{+# h}one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'minutul acesta'},
      P:'few{acum # minute}one{acum # minut}other{acum # de minute}',
      F:'few{peste # minute}one{peste # minut}other{peste # de minute}',
    },
    SHORT:{
      R:{'0':'minutul acesta'},
      P:'few{acum # min.}one{acum # min.}other{acum # min.}',
      F:'few{peste # min.}one{peste # min.}other{peste # min.}',
    },
    NARROW:{
      R:{'0':'minutul acesta'},
      P:'few{-# m}one{-# m}other{-# m}',
      F:'few{+# m}one{+# m}other{+# m}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{acum # luni}one{acum # lună}other{acum # de luni}',
      F:'few{peste # luni}one{peste # lună}other{peste # de luni}',
    },
    SHORT:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{acum # luni}one{acum # lună}other{acum # luni}',
      F:'few{peste # luni}one{peste # lună}other{peste # luni}',
    },
    NARROW:{
      R:{'-1':'luna trecută','0':'luna aceasta','1':'luna viitoare'},
      P:'few{-# luni}one{-# lună}other{-# luni}',
      F:'few{+# luni}one{+# lună}other{+# luni}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'trimestrul trecut','0':'trimestrul acesta','1':'trimestrul viitor'},
      P:'few{acum # trimestre}one{acum # trimestru}other{acum # de trimestre}',
      F:'few{peste # trimestre}one{peste # trimestru}other{peste # de trimestre}',
    },
    SHORT:{
      R:{'-1':'trim. trecut','0':'trim. acesta','1':'trim. viitor'},
      P:'few{acum # trim.}one{acum # trim.}other{acum # trim.}',
      F:'few{peste # trim.}one{peste # trim.}other{peste # trim.}',
    },
    NARROW:{
      R:{'-1':'trim. trecut','0':'trim. acesta','1':'trim. viitor'},
      P:'few{-# trim.}one{-# trim.}other{-# trim.}',
      F:'few{+# trim.}one{+# trim.}other{+# trim.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'acum'},
      P:'few{acum # secunde}one{acum # secundă}other{acum # de secunde}',
      F:'few{peste # secunde}one{peste # secundă}other{peste # de secunde}',
    },
    SHORT:{
      R:{'0':'acum'},
      P:'few{acum # sec.}one{acum # sec.}other{acum # sec.}',
      F:'few{peste # sec.}one{peste # sec.}other{peste # sec.}',
    },
    NARROW:{
      R:{'0':'acum'},
      P:'few{-# s}one{-# s}other{-# s}',
      F:'few{+# s}one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'săptămâna trecută','0':'săptămâna aceasta','1':'săptămâna viitoare'},
      P:'few{acum # săptămâni}one{acum # săptămână}other{acum # de săptămâni}',
      F:'few{peste # săptămâni}one{peste # săptămână}other{peste # de săptămâni}',
    },
    SHORT:{
      R:{'-1':'săpt. trecută','0':'săpt. aceasta','1':'săpt. viitoare'},
      P:'few{acum # săpt.}one{acum # săpt.}other{acum # săpt.}',
      F:'few{peste # săpt.}one{peste # săpt.}other{peste # săpt.}',
    },
    NARROW:{
      R:{'-1':'săpt. trecută','0':'săptămâna aceasta','1':'săpt. viitoare'},
      P:'few{-# săpt.}one{-# săpt.}other{-# săpt.}',
      F:'few{+# săpt.}one{+# săpt.}other{+# săpt.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'anul trecut','0':'anul acesta','1':'anul viitor'},
      P:'few{acum # ani}one{acum # an}other{acum # de ani}',
      F:'few{peste # ani}one{peste # an}other{peste # de ani}',
    },
    NARROW:{
      R:{'-1':'anul trecut','0':'anul acesta','1':'anul viitor'},
      P:'few{-# ani}one{-# an}other{-# ani}',
      F:'few{+# ani}one{+# an}other{+# ani}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ru =  {
  DAY: {
    LONG:{
      R:{'-1':'вчера','-2':'позавчера','0':'сегодня','1':'завтра','2':'послезавтра'},
      P:'few{# дня назад}many{# дней назад}one{# день назад}other{# дня назад}',
      F:'few{через # дня}many{через # дней}one{через # день}other{через # дня}',
    },
    SHORT:{
      R:{'-2':'позавчера','2':'послезавтра'},
      P:'few{# дн. назад}many{# дн. назад}one{# дн. назад}other{# дн. назад}',
      F:'few{через # дн.}many{через # дн.}one{через # дн.}other{через # дн.}',
    },
    NARROW:{
      R:{'-2':'позавчера','2':'послезавтра'},
      P:'few{-# дн.}many{-# дн.}one{-# дн.}other{-# дн.}',
      F:'few{+# дн.}many{+# дн.}one{+# дн.}other{+# дн.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'в этот час'},
      P:'few{# часа назад}many{# часов назад}one{# час назад}other{# часа назад}',
      F:'few{через # часа}many{через # часов}one{через # час}other{через # часа}',
    },
    SHORT:{
      R:{'0':'в этот час'},
      P:'few{# ч. назад}many{# ч. назад}one{# ч. назад}other{# ч. назад}',
      F:'few{через # ч.}many{через # ч.}one{через # ч.}other{через # ч.}',
    },
    NARROW:{
      R:{'0':'в этот час'},
      P:'few{-# ч.}many{-# ч.}one{-# ч.}other{-# ч.}',
      F:'few{+# ч.}many{+# ч.}one{+# ч.}other{+# ч.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'в эту минуту'},
      P:'few{# минуты назад}many{# минут назад}one{# минуту назад}other{# минуты назад}',
      F:'few{через # минуты}many{через # минут}one{через # минуту}other{через # минуты}',
    },
    SHORT:{
      R:{'0':'в эту минуту'},
      P:'few{# мин. назад}many{# мин. назад}one{# мин. назад}other{# мин. назад}',
      F:'few{через # мин.}many{через # мин.}one{через # мин.}other{через # мин.}',
    },
    NARROW:{
      R:{'0':'в эту минуту'},
      P:'few{-# мин.}many{-# мин.}one{-# мин.}other{-# мин.}',
      F:'few{+# мин.}many{+# мин.}one{+# мин.}other{+# мин.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'в прошлом месяце','0':'в этом месяце','1':'в следующем месяце'},
      P:'few{# месяца назад}many{# месяцев назад}one{# месяц назад}other{# месяца назад}',
      F:'few{через # месяца}many{через # месяцев}one{через # месяц}other{через # месяца}',
    },
    SHORT:{
      R:{'-1':'в прошлом мес.','0':'в этом мес.','1':'в следующем мес.'},
      P:'few{# мес. назад}many{# мес. назад}one{# мес. назад}other{# мес. назад}',
      F:'few{через # мес.}many{через # мес.}one{через # мес.}other{через # мес.}',
    },
    NARROW:{
      R:{'-1':'в пр. мес.','0':'в эт. мес.','1':'в след. мес.'},
      P:'few{-# мес.}many{-# мес.}one{-# мес.}other{-# мес.}',
      F:'few{+# мес.}many{+# мес.}one{+# мес.}other{+# мес.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'в прошлом квартале','0':'в текущем квартале','1':'в следующем квартале'},
      P:'few{# квартала назад}many{# кварталов назад}one{# квартал назад}other{# квартала назад}',
      F:'few{через # квартала}many{через # кварталов}one{через # квартал}other{через # квартала}',
    },
    SHORT:{
      R:{'-1':'последний кв.','0':'текущий кв.','1':'следующий кв.'},
      P:'few{# кв. назад}many{# кв. назад}one{# кв. назад}other{# кв. назад}',
      F:'few{через # кв.}many{через # кв.}one{через # кв.}other{через # кв.}',
    },
    NARROW:{
      R:{'-1':'посл. кв.','0':'тек. кв.','1':'след. кв.'},
      P:'few{-# кв.}many{-# кв.}one{-# кв.}other{-# кв.}',
      F:'few{+# кв.}many{+# кв.}one{+# кв.}other{+# кв.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'сейчас'},
      P:'few{# секунды назад}many{# секунд назад}one{# секунду назад}other{# секунды назад}',
      F:'few{через # секунды}many{через # секунд}one{через # секунду}other{через # секунды}',
    },
    SHORT:{
      R:{'0':'сейчас'},
      P:'few{# сек. назад}many{# сек. назад}one{# сек. назад}other{# сек. назад}',
      F:'few{через # сек.}many{через # сек.}one{через # сек.}other{через # сек.}',
    },
    NARROW:{
      R:{'0':'сейчас'},
      P:'few{-# с}many{-# с}one{-# с}other{-# с}',
      F:'few{+# с}many{+# с}one{+# с}other{+# с}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'на прошлой неделе','0':'на этой неделе','1':'на следующей неделе'},
      P:'few{# недели назад}many{# недель назад}one{# неделю назад}other{# недели назад}',
      F:'few{через # недели}many{через # недель}one{через # неделю}other{через # недели}',
    },
    SHORT:{
      R:{'-1':'на прошлой нед.','0':'на этой нед.','1':'на следующей нед.'},
      P:'few{# нед. назад}many{# нед. назад}one{# нед. назад}other{# нед. назад}',
      F:'few{через # нед.}many{через # нед.}one{через # нед.}other{через # нед.}',
    },
    NARROW:{
      R:{'-1':'на пр. нед.','0':'на эт. нед.','1':'на след. неделе'},
      P:'few{-# нед.}many{-# нед.}one{-# нед.}other{-# нед.}',
      F:'few{+# нед.}many{+# нед.}one{+# нед.}other{+# нед.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'в прошлом году','0':'в этом году','1':'в следующем году'},
      P:'few{# года назад}many{# лет назад}one{# год назад}other{# года назад}',
      F:'few{через # года}many{через # лет}one{через # год}other{через # года}',
    },
    SHORT:{
      R:{'-1':'в прошлом г.','0':'в этом г.','1':'в след. г.'},
      P:'few{# г. назад}many{# л. назад}one{# г. назад}other{# г. назад}',
      F:'few{через # г.}many{через # л.}one{через # г.}other{через # г.}',
    },
    NARROW:{
      R:{'-1':'в пр. г.','0':'в эт. г.','1':'в сл. г.'},
      P:'few{-# г.}many{-# л.}one{-# г.}other{-# г.}',
      F:'few{+# г.}many{+# л.}one{+# г.}other{+# г.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sh =  {
  DAY: {
    LONG:{
      R:{'-1':'juče','-2':'prekjuče','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{pre # dana}one{pre # dana}other{pre # dana}',
      F:'few{za # dana}one{za # dan}other{za # dana}',
    },
    SHORT:{
      R:{'-1':'juče','-2':'prekjuče','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{pre # d.}one{pre # d.}other{pre # d.}',
      F:'few{za # d.}one{za # d.}other{za # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ovog sata'},
      P:'few{pre # sata}one{pre # sata}other{pre # sati}',
      F:'few{za # sata}one{za # sat}other{za # sati}',
    },
    SHORT:{
      R:{'0':'ovog sata'},
      P:'few{pre # č.}one{pre # č.}other{pre # č.}',
      F:'few{za # č.}one{za # č.}other{za # č.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ovog minuta'},
      P:'few{pre # minuta}one{pre # minuta}other{pre # minuta}',
      F:'few{za # minuta}one{za # minut}other{za # minuta}',
    },
    SHORT:{
      R:{'0':'ovog minuta'},
      P:'few{pre # min.}one{pre # min.}other{pre # min.}',
      F:'few{za # min.}one{za # min.}other{za # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'prošlog meseca','0':'ovog meseca','1':'sledećeg meseca'},
      P:'few{pre # meseca}one{pre # meseca}other{pre # meseci}',
      F:'few{za # meseca}one{za # mesec}other{za # meseci}',
    },
    SHORT:{
      R:{'-1':'prošlog mes.','0':'ovog mes.','1':'sledećeg mes.'},
      P:'few{pre # mes.}one{pre # mes.}other{pre # mes.}',
      F:'few{za # mes.}one{za # mes.}other{za # mes.}',
    },
    NARROW:{
      R:{'-1':'prošlog m.','0':'ovog m.','1':'sledećeg m.'},
      P:'few{pre # m.}one{pre # m.}other{pre # m.}',
      F:'few{za # m.}one{za # m.}other{za # m.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'prošlog kvartala','0':'ovog kvartala','1':'sledećeg kvartala'},
      P:'few{pre # kvartala}one{pre # kvartala}other{pre # kvartala}',
      F:'few{za # kvartala}one{za # kvartal}other{za # kvartala}',
    },
    SHORT:{
      R:{'-1':'prošlog kvartala','0':'ovog kvartala','1':'sledećeg kvartala'},
      P:'few{pre # kv.}one{pre # kv.}other{pre # kv.}',
      F:'few{za # kv.}one{za # kv.}other{za # kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sada'},
      P:'few{pre # sekunde}one{pre # sekunde}other{pre # sekundi}',
      F:'few{za # sekunde}one{za # sekundu}other{za # sekundi}',
    },
    SHORT:{
      R:{'0':'sada'},
      P:'few{pre # sek.}one{pre # sek.}other{pre # sek.}',
      F:'few{za # sek.}one{za # sek.}other{za # sek.}',
    },
    NARROW:{
      R:{'0':'sada'},
      P:'few{pre # s.}one{pre # s.}other{pre # s.}',
      F:'few{za # s.}one{za # s.}other{za # s.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'prošle nedelje','0':'ove nedelje','1':'sledeće nedelje'},
      P:'few{pre # nedelje}one{pre # nedelje}other{pre # nedelja}',
      F:'few{za # nedelje}one{za # nedelju}other{za # nedelja}',
    },
    SHORT:{
      R:{'-1':'prošle ned.','0':'ove ned.','1':'sledeće ned.'},
      P:'few{pre # ned.}one{pre # ned.}other{pre # ned.}',
      F:'few{za # ned.}one{za # ned.}other{za # ned.}',
    },
    NARROW:{
      R:{'-1':'prošle n.','0':'ove n.','1':'sledeće n.'},
      P:'few{pre # n.}one{pre # n.}other{pre # n.}',
      F:'few{za # n.}one{za # n.}other{za # n.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sledeće godine'},
      P:'few{pre # godine}one{pre # godine}other{pre # godina}',
      F:'few{za # godine}one{za # godinu}other{za # godina}',
    },
    SHORT:{
      R:{'-1':'prošle god.','0':'ove god.','1':'sledeće god.'},
      P:'few{pre # god.}one{pre # god.}other{pre # god.}',
      F:'few{za # god.}one{za # god.}other{za # god.}',
    },
    NARROW:{
      R:{'-1':'prošle g.','0':'ove g.','1':'sledeće g.'},
      P:'few{pre # g.}one{pre # g.}other{pre # g.}',
      F:'few{za # g.}one{za # g.}other{za # g.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_si =  {
  DAY: {
    LONG:{
      R:{'-1':'ඊයේ','-2':'පෙරේදා','0':'අද','1':'හෙට','2':'අනිද්දා'},
      P:'one{දින #කට පෙර}other{දින #කට පෙර}',
      F:'one{දින #න්}other{දින #න්}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'මෙම පැය'},
      P:'one{පැය #කට පෙර}other{පැය #කට පෙර}',
      F:'one{පැය #කින්}other{පැය #කින්}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'මෙම මිනිත්තුව'},
      P:'one{මිනිත්තු #කට පෙර}other{මිනිත්තු #කට පෙර}',
      F:'one{මිනිත්තු #කින්}other{මිනිත්තු #කින්}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'පසුගිය මාසය','0':'මෙම මාසය','1':'ඊළඟ මාසය'},
      P:'one{මාස #කට පෙර}other{මාස #කට පෙර}',
      F:'one{මාස #කින්}other{මාස #කින්}',
    },
    SHORT:{
      R:{'-1':'පසුගිය මාස.','0':'මෙම මාස.','1':'ඊළඟ මාස.'},
      P:'one{මාස #කට පෙර}other{මාස #කට පෙර}',
      F:'one{මාස #කින්}other{මාස #කින්}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'පසුගිය කාර්තුව','0':'මෙම කාර්තුව','1':'ඊළඟ කාර්තුව'},
      P:'one{කාර්තු #කට පෙර}other{කාර්තු #කට පෙර}',
      F:'one{කාර්තු #කින්}other{කාර්තු #කින්}',
    },
    SHORT:{
      R:{'-1':'පසුගිය කාර්.','0':'මෙම කාර්.','1':'ඊළඟ කාර්.'},
      P:'one{කාර්. #කට පෙර}other{කාර්. #කට පෙර}',
      F:'one{කාර්. #කින්}other{කාර්. #කින්}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'දැන්'},
      P:'one{තත්පර #කට පෙර}other{තත්පර #කට පෙර}',
      F:'one{තත්පර #කින්}other{තත්පර #කින්}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'පසුගිය සතිය','0':'මෙම සතිය','1':'ඊළඟ සතිය'},
      P:'one{සති #කට පෙර}other{සති #කට පෙර}',
      F:'one{සති #කින්}other{සති #කින්}',
    },
    SHORT:{
      R:{'-1':'පසුගිය සති.','0':'මෙම සති.','1':'ඊළඟ සති.'},
      P:'one{සති #කට පෙර}other{සති #කට පෙර}',
      F:'one{සති #කින්}other{සති #කින්}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'පසුගිය වසර','0':'මෙම වසර','1':'ඊළඟ වසර'},
      P:'one{වසර #කට පෙර}other{වසර #කට පෙර}',
      F:'one{වසර #කින්}other{වසර #කින්}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sk =  {
  DAY: {
    LONG:{
      R:{'-1':'včera','-2':'predvčerom','0':'dnes','1':'zajtra','2':'pozajtra'},
      P:'few{pred # dňami}many{pred # dňa}one{pred # dňom}other{pred # dňami}',
      F:'few{o # dni}many{o # dňa}one{o # deň}other{o # dní}',
    },
    SHORT:{
      R:{'-1':'včera','-2':'predvčerom','0':'dnes','1':'zajtra','2':'pozajtra'},
      P:'few{pred # d.}many{pred # d.}one{pred # d.}other{pred # d.}',
      F:'few{o # d.}many{o # d.}one{o # d.}other{o # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'v tejto hodine'},
      P:'few{pred # hodinami}many{pred # hodinou}one{pred # hodinou}other{pred # hodinami}',
      F:'few{o # hodiny}many{o # hodiny}one{o # hodinu}other{o # hodín}',
    },
    SHORT:{
      R:{'0':'v tejto hodine'},
      P:'few{pred # h}many{pred # h}one{pred # h}other{pred # h}',
      F:'few{o # h}many{o # h}one{o # h}other{o # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'v tejto minúte'},
      P:'few{pred # minútami}many{pred # minúty}one{pred # minútou}other{pred # minútami}',
      F:'few{o # minúty}many{o # minúty}one{o # minútu}other{o # minút}',
    },
    SHORT:{
      R:{'0':'v tejto minúte'},
      P:'few{pred # min}many{pred # min}one{pred # min}other{pred # min}',
      F:'few{o # min}many{o # min}one{o # min}other{o # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'minulý mesiac','0':'tento mesiac','1':'budúci mesiac'},
      P:'few{pred # mesiacmi}many{pred # mesiaca}one{pred # mesiacom}other{pred # mesiacmi}',
      F:'few{o # mesiace}many{o # mesiaca}one{o # mesiac}other{o # mesiacov}',
    },
    SHORT:{
      R:{'-1':'minulý mes.','0':'tento mes.','1':'budúci mes.'},
      P:'few{pred # mes.}many{pred # mes.}one{pred # mes.}other{pred # mes.}',
      F:'few{o # mes.}many{o # mes.}one{o # mes.}other{o # mes.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'minulý štvrťrok','0':'tento štvrťrok','1':'budúci štvrťrok'},
      P:'few{pred # štvrťrokmi}many{pred # štvrťroka}one{pred # štvrťrokom}other{pred # štvrťrokmi}',
      F:'few{o # štvrťroky}many{o # štvrťroka}one{o # štvrťrok}other{o # štvrťrokov}',
    },
    SHORT:{
      R:{'-1':'minulý štvrťr.','0':'tento štvrťr.','1':'budúci štvrťr.'},
      P:'few{pred # štvrťr.}many{pred # štvrťr.}one{pred # štvrťr.}other{pred # štvrťr.}',
      F:'few{o # štvrťr.}many{o # štvrťr.}one{o # štvrťr.}other{o # štvrťr.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'teraz'},
      P:'few{pred # sekundami}many{pred # sekundy}one{pred # sekundou}other{pred # sekundami}',
      F:'few{o # sekundy}many{o # sekundy}one{o # sekundu}other{o # sekúnd}',
    },
    SHORT:{
      R:{'0':'teraz'},
      P:'few{pred # s}many{pred # s}one{pred # s}other{pred # s}',
      F:'few{o # s}many{o # s}one{o # s}other{o # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'minulý týždeň','0':'tento týždeň','1':'budúci týždeň'},
      P:'few{pred # týždňami}many{pred # týždňa}one{pred # týždňom}other{pred # týždňami}',
      F:'few{o # týždne}many{o # týždňa}one{o # týždeň}other{o # týždňov}',
    },
    SHORT:{
      R:{'-1':'minulý týž.','0':'tento týž.','1':'budúci týž.'},
      P:'few{pred # týž.}many{pred # týž.}one{pred # týž.}other{pred # týž.}',
      F:'few{o # týž.}many{o # týž.}one{o # týž.}other{o # týž.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'minulý rok','0':'tento rok','1':'budúci rok'},
      P:'few{pred # rokmi}many{pred # roka}one{pred # rokom}other{pred # rokmi}',
      F:'few{o # roky}many{o # roka}one{o # rok}other{o # rokov}',
    },
    SHORT:{
      R:{'-1':'minulý rok','0':'tento rok','1':'budúci rok'},
      P:'few{pred # r.}many{pred # r.}one{pred # r.}other{pred # r.}',
      F:'few{o # r.}many{o # r.}one{o # r.}other{o # r.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sl =  {
  DAY: {
    LONG:{
      R:{'-1':'včeraj','-2':'predvčerajšnjim','0':'danes','1':'jutri','2':'pojutrišnjem'},
      P:'few{pred # dnevi}one{pred # dnevom}other{pred # dnevi}two{pred # dnevoma}',
      F:'few{čez # dni}one{čez # dan}other{čez # dni}two{čez # dneva}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'v tej uri'},
      P:'few{pred # urami}one{pred # uro}other{pred # urami}two{pred # urama}',
      F:'few{čez # ure}one{čez # uro}other{čez # ur}two{čez # uri}',
    },
    NARROW:{
      R:{'0':'v tej uri'},
      P:'few{pred # h}one{pred # h}other{pred # h}two{pred # h}',
      F:'few{čez # h}one{čez # h}other{čez # h}two{čez # h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'to minuto'},
      P:'few{pred # minutami}one{pred # minuto}other{pred # minutami}two{pred # minutama}',
      F:'few{čez # minute}one{čez # minuto}other{čez # minut}two{čez # minuti}',
    },
    SHORT:{
      R:{'0':'to minuto'},
      P:'few{pred # min.}one{pred # min.}other{pred # min.}two{pred # min.}',
      F:'few{čez # min.}one{čez # min.}other{čez # min.}two{čez # min.}',
    },
    NARROW:{
      R:{'0':'to minuto'},
      P:'few{pred # min}one{pred # min}other{pred # min}two{pred # min}',
      F:'few{čez # min}one{čez # min}other{čez # min}two{čez # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'prejšnji mesec','0':'ta mesec','1':'naslednji mesec'},
      P:'few{pred # meseci}one{pred # mesecem}other{pred # meseci}two{pred # mesecema}',
      F:'few{čez # mesece}one{čez # mesec}other{čez # mesecev}two{čez # meseca}',
    },
    SHORT:{
      R:{'-1':'prejšnji mesec','0':'ta mesec','1':'naslednji mesec'},
      P:'few{pred # mes.}one{pred # mes.}other{pred # mes.}two{pred # mes.}',
      F:'few{čez # mes.}one{čez # mes.}other{čez # mes.}two{čez # mes.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'zadnje četrtletje','0':'to četrtletje','1':'naslednje četrtletje'},
      P:'few{pred # četrtletji}one{pred # četrtletjem}other{pred # četrtletji}two{pred # četrtletjema}',
      F:'few{čez # četrtletja}one{čez # četrtletje}other{čez # četrtletij}two{čez # četrtletji}',
    },
    SHORT:{
      R:{'-1':'zadnje četrtletje','0':'to četrtletje','1':'naslednje četrtletje'},
      P:'few{pred # četrtl.}one{pred # četrtl.}other{pred # četrtl.}two{pred # četrtl.}',
      F:'few{čez # četrtl.}one{čez # četrtl.}other{čez # četrtl.}two{čez # četrtl.}',
    },
    NARROW:{
      R:{'-1':'zadnje četrtletje','0':'to četrtletje','1':'naslednje četrtletje'},
      P:'few{pred # četr.}one{pred # četr.}other{pred # četr.}two{pred # četr.}',
      F:'few{čez # četr.}one{čez # četr.}other{čez # četr.}two{čez # četr.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'zdaj'},
      P:'few{pred # sekundami}one{pred # sekundo}other{pred # sekundami}two{pred # sekundama}',
      F:'few{čez # sekunde}one{čez # sekundo}other{čez # sekund}two{čez # sekundi}',
    },
    SHORT:{
      R:{'0':'zdaj'},
      P:'few{pred # s}one{pred # s}other{pred # s}two{pred # s}',
      F:'few{čez # s}one{čez # s}other{čez # s}two{čez # s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'prejšnji teden','0':'ta teden','1':'naslednji teden'},
      P:'few{pred # tedni}one{pred # tednom}other{pred # tedni}two{pred # tednoma}',
      F:'few{čez # tedne}one{čez # teden}other{čez # tednov}two{čez # tedna}',
    },
    SHORT:{
      R:{'-1':'prejšnji teden','0':'ta teden','1':'naslednji teden'},
      P:'few{pred # ted.}one{pred # ted.}other{pred # ted.}two{pred # ted.}',
      F:'few{čez # ted.}one{čez # ted.}other{čez # ted.}two{čez # ted.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'lani','0':'letos','1':'naslednje leto'},
      P:'few{pred # leti}one{pred # letom}other{pred # leti}two{pred # letoma}',
      F:'few{čez # leta}one{čez # leto}other{čez # let}two{čez # leti}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sq =  {
  DAY: {
    LONG:{
      R:{'-1':'dje','0':'sot','1':'nesër'},
      P:'one{# ditë më parë}other{# ditë më parë}',
      F:'one{pas # dite}other{pas # ditësh}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'këtë orë'},
      P:'one{# orë më parë}other{# orë më parë}',
      F:'one{pas # ore}other{pas # orësh}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'këtë minutë'},
      P:'one{# minutë më parë}other{# minuta më parë}',
      F:'one{pas # minute}other{pas # minutash}',
    },
    SHORT:{
      R:{'0':'këtë minutë'},
      P:'one{# min më parë}other{# min më parë}',
      F:'one{pas # min}other{pas # min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'muajin e kaluar','0':'këtë muaj','1':'muajin e ardhshëm'},
      P:'one{# muaj më parë}other{# muaj më parë}',
      F:'one{pas # muaji}other{pas # muajsh}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'tremujorin e kaluar','0':'këtë tremujor','1':'tremujorin e ardhshëm'},
      P:'one{# tremujor më parë}other{# tremujorë më parë}',
      F:'one{pas # tremujori}other{pas # tremujorësh}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'tani'},
      P:'one{# sekondë më parë}other{# sekonda më parë}',
      F:'one{pas # sekonde}other{pas # sekondash}',
    },
    SHORT:{
      R:{'0':'tani'},
      P:'one{# sek më parë}other{# sek më parë}',
      F:'one{pas # sek}other{pas # sek}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'javën e kaluar','0':'këtë javë','1':'javën e ardhshme'},
      P:'one{# javë më parë}other{# javë më parë}',
      F:'one{pas # jave}other{pas # javësh}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'vjet','0':'sivjet','1':'mot'},
      P:'one{# vit më parë}other{# vjet më parë}',
      F:'one{pas # viti}other{pas # vjetësh}',
    },
    SHORT:{
      R:{'-1':'vitin e kaluar','0':'këtë vit','1':'vitin e ardhshëm'},
      P:'one{# vit më parë}other{# vjet më parë}',
      F:'one{pas # viti}other{pas # vjetësh}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sr =  {
  DAY: {
    LONG:{
      R:{'-1':'јуче','-2':'прекјуче','0':'данас','1':'сутра','2':'прекосутра'},
      P:'few{пре # дана}one{пре # дана}other{пре # дана}',
      F:'few{за # дана}one{за # дан}other{за # дана}',
    },
    SHORT:{
      R:{'-1':'јуче','-2':'прекјуче','0':'данас','1':'сутра','2':'прекосутра'},
      P:'few{пре # д.}one{пре # д.}other{пре # д.}',
      F:'few{за # д.}one{за # д.}other{за # д.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'овог сата'},
      P:'few{пре # сата}one{пре # сата}other{пре # сати}',
      F:'few{за # сата}one{за # сат}other{за # сати}',
    },
    SHORT:{
      R:{'0':'овог сата'},
      P:'few{пре # ч.}one{пре # ч.}other{пре # ч.}',
      F:'few{за # ч.}one{за # ч.}other{за # ч.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'овог минута'},
      P:'few{пре # минута}one{пре # минута}other{пре # минута}',
      F:'few{за # минута}one{за # минут}other{за # минута}',
    },
    SHORT:{
      R:{'0':'овог минута'},
      P:'few{пре # мин.}one{пре # мин.}other{пре # мин.}',
      F:'few{за # мин.}one{за # мин.}other{за # мин.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'прошлог месеца','0':'овог месеца','1':'следећег месеца'},
      P:'few{пре # месеца}one{пре # месеца}other{пре # месеци}',
      F:'few{за # месеца}one{за # месец}other{за # месеци}',
    },
    SHORT:{
      R:{'-1':'прошлог мес.','0':'овог мес.','1':'следећег мес.'},
      P:'few{пре # мес.}one{пре # мес.}other{пре # мес.}',
      F:'few{за # мес.}one{за # мес.}other{за # мес.}',
    },
    NARROW:{
      R:{'-1':'прошлог м.','0':'овог м.','1':'следећег м.'},
      P:'few{пре # м.}one{пре # м.}other{пре # м.}',
      F:'few{за # м.}one{за # м.}other{за # м.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'прошлог квартала','0':'овог квартала','1':'следећег квартала'},
      P:'few{пре # квартала}one{пре # квартала}other{пре # квартала}',
      F:'few{за # квартала}one{за # квартал}other{за # квартала}',
    },
    SHORT:{
      R:{'-1':'прошлог квартала','0':'овог квартала','1':'следећег квартала'},
      P:'few{пре # кв.}one{пре # кв.}other{пре # кв.}',
      F:'few{за # кв.}one{за # кв.}other{за # кв.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'сада'},
      P:'few{пре # секунде}one{пре # секунде}other{пре # секунди}',
      F:'few{за # секунде}one{за # секунду}other{за # секунди}',
    },
    SHORT:{
      R:{'0':'сада'},
      P:'few{пре # сек.}one{пре # сек.}other{пре # сек.}',
      F:'few{за # сек.}one{за # сек.}other{за # сек.}',
    },
    NARROW:{
      R:{'0':'сада'},
      P:'few{пре # с.}one{пре # с.}other{пре # с.}',
      F:'few{за # с.}one{за # с.}other{за # с.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'прошле недеље','0':'ове недеље','1':'следеће недеље'},
      P:'few{пре # недеље}one{пре # недеље}other{пре # недеља}',
      F:'few{за # недеље}one{за # недељу}other{за # недеља}',
    },
    SHORT:{
      R:{'-1':'прошле нед.','0':'ове нед.','1':'следеће нед.'},
      P:'few{пре # нед.}one{пре # нед.}other{пре # нед.}',
      F:'few{за # нед.}one{за # нед.}other{за # нед.}',
    },
    NARROW:{
      R:{'-1':'прошле н.','0':'ове н.','1':'следеће н.'},
      P:'few{пре # н.}one{пре # н.}other{пре # н.}',
      F:'few{за # н.}one{за # н.}other{за # н.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'прошле године','0':'ове године','1':'следеће године'},
      P:'few{пре # године}one{пре # године}other{пре # година}',
      F:'few{за # године}one{за # годину}other{за # година}',
    },
    SHORT:{
      R:{'-1':'прошле год.','0':'ове год.','1':'следеће год.'},
      P:'few{пре # год.}one{пре # год.}other{пре # год.}',
      F:'few{за # год.}one{за # год.}other{за # год.}',
    },
    NARROW:{
      R:{'-1':'прошле г.','0':'ове г.','1':'следеће г.'},
      P:'few{пре # г.}one{пре # г.}other{пре # г.}',
      F:'few{за # г.}one{за # г.}other{за # г.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sr_Latn =  {
  DAY: {
    LONG:{
      R:{'-1':'juče','-2':'prekjuče','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{pre # dana}one{pre # dana}other{pre # dana}',
      F:'few{za # dana}one{za # dan}other{za # dana}',
    },
    SHORT:{
      R:{'-1':'juče','-2':'prekjuče','0':'danas','1':'sutra','2':'prekosutra'},
      P:'few{pre # d.}one{pre # d.}other{pre # d.}',
      F:'few{za # d.}one{za # d.}other{za # d.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ovog sata'},
      P:'few{pre # sata}one{pre # sata}other{pre # sati}',
      F:'few{za # sata}one{za # sat}other{za # sati}',
    },
    SHORT:{
      R:{'0':'ovog sata'},
      P:'few{pre # č.}one{pre # č.}other{pre # č.}',
      F:'few{za # č.}one{za # č.}other{za # č.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ovog minuta'},
      P:'few{pre # minuta}one{pre # minuta}other{pre # minuta}',
      F:'few{za # minuta}one{za # minut}other{za # minuta}',
    },
    SHORT:{
      R:{'0':'ovog minuta'},
      P:'few{pre # min.}one{pre # min.}other{pre # min.}',
      F:'few{za # min.}one{za # min.}other{za # min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'prošlog meseca','0':'ovog meseca','1':'sledećeg meseca'},
      P:'few{pre # meseca}one{pre # meseca}other{pre # meseci}',
      F:'few{za # meseca}one{za # mesec}other{za # meseci}',
    },
    SHORT:{
      R:{'-1':'prošlog mes.','0':'ovog mes.','1':'sledećeg mes.'},
      P:'few{pre # mes.}one{pre # mes.}other{pre # mes.}',
      F:'few{za # mes.}one{za # mes.}other{za # mes.}',
    },
    NARROW:{
      R:{'-1':'prošlog m.','0':'ovog m.','1':'sledećeg m.'},
      P:'few{pre # m.}one{pre # m.}other{pre # m.}',
      F:'few{za # m.}one{za # m.}other{za # m.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'prošlog kvartala','0':'ovog kvartala','1':'sledećeg kvartala'},
      P:'few{pre # kvartala}one{pre # kvartala}other{pre # kvartala}',
      F:'few{za # kvartala}one{za # kvartal}other{za # kvartala}',
    },
    SHORT:{
      R:{'-1':'prošlog kvartala','0':'ovog kvartala','1':'sledećeg kvartala'},
      P:'few{pre # kv.}one{pre # kv.}other{pre # kv.}',
      F:'few{za # kv.}one{za # kv.}other{za # kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sada'},
      P:'few{pre # sekunde}one{pre # sekunde}other{pre # sekundi}',
      F:'few{za # sekunde}one{za # sekundu}other{za # sekundi}',
    },
    SHORT:{
      R:{'0':'sada'},
      P:'few{pre # sek.}one{pre # sek.}other{pre # sek.}',
      F:'few{za # sek.}one{za # sek.}other{za # sek.}',
    },
    NARROW:{
      R:{'0':'sada'},
      P:'few{pre # s.}one{pre # s.}other{pre # s.}',
      F:'few{za # s.}one{za # s.}other{za # s.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'prošle nedelje','0':'ove nedelje','1':'sledeće nedelje'},
      P:'few{pre # nedelje}one{pre # nedelje}other{pre # nedelja}',
      F:'few{za # nedelje}one{za # nedelju}other{za # nedelja}',
    },
    SHORT:{
      R:{'-1':'prošle ned.','0':'ove ned.','1':'sledeće ned.'},
      P:'few{pre # ned.}one{pre # ned.}other{pre # ned.}',
      F:'few{za # ned.}one{za # ned.}other{za # ned.}',
    },
    NARROW:{
      R:{'-1':'prošle n.','0':'ove n.','1':'sledeće n.'},
      P:'few{pre # n.}one{pre # n.}other{pre # n.}',
      F:'few{za # n.}one{za # n.}other{za # n.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'prošle godine','0':'ove godine','1':'sledeće godine'},
      P:'few{pre # godine}one{pre # godine}other{pre # godina}',
      F:'few{za # godine}one{za # godinu}other{za # godina}',
    },
    SHORT:{
      R:{'-1':'prošle god.','0':'ove god.','1':'sledeće god.'},
      P:'few{pre # god.}one{pre # god.}other{pre # god.}',
      F:'few{za # god.}one{za # god.}other{za # god.}',
    },
    NARROW:{
      R:{'-1':'prošle g.','0':'ove g.','1':'sledeće g.'},
      P:'few{pre # g.}one{pre # g.}other{pre # g.}',
      F:'few{za # g.}one{za # g.}other{za # g.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sv =  {
  DAY: {
    LONG:{
      R:{'-1':'i går','-2':'i förrgår','0':'i dag','1':'i morgon','2':'i övermorgon'},
      P:'one{för # dag sedan}other{för # dagar sedan}',
      F:'one{om # dag}other{om # dagar}',
    },
    SHORT:{
      R:{'-1':'i går','-2':'i förrgår','0':'i dag','1':'i morgon','2':'i övermorgon'},
      P:'one{för # d sedan}other{för # d sedan}',
      F:'one{om # d}other{om # d}',
    },
    NARROW:{
      R:{'-1':'igår','-2':'i förrgår','0':'idag','1':'imorgon','2':'i övermorgon'},
      P:'one{−# d}other{−# d}',
      F:'one{+# d}other{+# d}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'denna timme'},
      P:'one{för # timme sedan}other{för # timmar sedan}',
      F:'one{om # timme}other{om # timmar}',
    },
    SHORT:{
      R:{'0':'denna timme'},
      P:'one{för # tim sedan}other{för # tim sedan}',
      F:'one{om # tim}other{om # tim}',
    },
    NARROW:{
      R:{'0':'denna timme'},
      P:'one{−# h}other{−# h}',
      F:'one{+# h}other{+# h}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'denna minut'},
      P:'one{för # minut sedan}other{för # minuter sedan}',
      F:'one{om # minut}other{om # minuter}',
    },
    SHORT:{
      R:{'0':'denna minut'},
      P:'one{för # min sen}other{för # min sen}',
      F:'one{om # min}other{om # min}',
    },
    NARROW:{
      R:{'0':'denna minut'},
      P:'one{−# min}other{−# min}',
      F:'one{+# min}other{+# min}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'förra månaden','0':'denna månad','1':'nästa månad'},
      P:'one{för # månad sedan}other{för # månader sedan}',
      F:'one{om # månad}other{om # månader}',
    },
    SHORT:{
      R:{'-1':'förra mån.','0':'denna mån.','1':'nästa mån.'},
      P:'one{för # mån. sen}other{för # mån. sen}',
      F:'one{om # mån.}other{om # mån.}',
    },
    NARROW:{
      R:{'-1':'förra mån.','0':'denna mån.','1':'nästa mån.'},
      P:'one{−# mån}other{−# mån}',
      F:'one{+# mån.}other{+# mån.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'förra kvartalet','0':'detta kvartal','1':'nästa kvartal'},
      P:'one{för # kvartal sedan}other{för # kvartal sedan}',
      F:'one{om # kvartal}other{om # kvartal}',
    },
    SHORT:{
      R:{'-1':'förra kv.','0':'detta kv.','1':'nästa kv.'},
      P:'one{för # kv. sen}other{för # kv. sen}',
      F:'one{om # kv.}other{om # kv.}',
    },
    NARROW:{
      R:{'-1':'förra kv.','0':'detta kv.','1':'nästa kv.'},
      P:'one{−# kv}other{−# kv}',
      F:'one{+# kv.}other{+# kv.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'nu'},
      P:'one{för # sekund sedan}other{för # sekunder sedan}',
      F:'one{om # sekund}other{om # sekunder}',
    },
    SHORT:{
      R:{'0':'nu'},
      P:'one{för # s sen}other{för # s sen}',
      F:'one{om # sek}other{om # sek}',
    },
    NARROW:{
      R:{'0':'nu'},
      P:'one{−# s}other{−# s}',
      F:'one{+# s}other{+# s}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'förra veckan','0':'denna vecka','1':'nästa vecka'},
      P:'one{för # vecka sedan}other{för # veckor sedan}',
      F:'one{om # vecka}other{om # veckor}',
    },
    SHORT:{
      R:{'-1':'förra v.','0':'denna v.','1':'nästa v.'},
      P:'one{för # v. sedan}other{för # v. sedan}',
      F:'one{om # v.}other{om # v.}',
    },
    NARROW:{
      R:{'-1':'förra v.','0':'denna v.','1':'nästa v.'},
      P:'one{−# v}other{−# v}',
      F:'one{+# v.}other{+# v.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'i fjol','0':'i år','1':'nästa år'},
      P:'one{för # år sedan}other{för # år sedan}',
      F:'one{om # år}other{om # år}',
    },
    SHORT:{
      R:{'-1':'i fjol','0':'i år','1':'nästa år'},
      P:'one{för # år sen}other{för # år sen}',
      F:'one{om # år}other{om # år}',
    },
    NARROW:{
      R:{'-1':'i fjol','0':'i år','1':'nästa år'},
      P:'one{−# år}other{−# år}',
      F:'one{+# år}other{+# år}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_sw =  {
  DAY: {
    LONG:{
      R:{'-1':'jana','-2':'juzi','0':'leo','1':'kesho','2':'kesho kutwa'},
      P:'one{siku # iliyopita}other{siku # zilizopita}',
      F:'one{baada ya siku #}other{baada ya siku #}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'saa hii'},
      P:'one{saa # iliyopita}other{saa # zilizopita}',
      F:'one{baada ya saa #}other{baada ya saa #}',
    },
    NARROW:{
      R:{'0':'saa hii'},
      P:'one{Saa # iliyopita}other{Saa # zilizopita}',
      F:'one{baada ya saa #}other{baada ya saa #}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'dakika hii'},
      P:'one{dakika # iliyopita}other{dakika # zilizopita}',
      F:'one{baada ya dakika #}other{baada ya dakika #}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'mwezi uliopita','0':'mwezi huu','1':'mwezi ujao'},
      P:'one{mwezi # uliopita}other{miezi # iliyopita}',
      F:'one{baada ya mwezi #}other{baada ya miezi #}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'robo ya mwaka iliyopita','0':'robo hii ya mwaka','1':'robo ya mwaka inayofuata'},
      P:'one{robo # iliyopita}other{robo # zilizopita}',
      F:'one{baada ya robo #}other{baada ya robo #}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'sasa hivi'},
      P:'one{Sekunde # iliyopita}other{Sekunde # zilizopita}',
      F:'one{baada ya sekunde #}other{baada ya sekunde #}',
    },
    SHORT:{
      R:{'0':'sasa hivi'},
      P:'one{sekunde # iliyopita}other{sekunde # zilizopita}',
      F:'one{baada ya sekunde #}other{baada ya sekunde #}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'wiki iliyopita','0':'wiki hii','1':'wiki ijayo'},
      P:'one{wiki # iliyopita}other{wiki # zilizopita}',
      F:'one{baada ya wiki #}other{baada ya wiki #}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'mwaka uliopita','0':'mwaka huu','1':'mwaka ujao'},
      P:'one{mwaka # uliopita}other{miaka # iliyopita}',
      F:'one{baada ya mwaka #}other{baada ya miaka #}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ta =  {
  DAY: {
    LONG:{
      R:{'-1':'நேற்று','-2':'நேற்று முன் தினம்','0':'இன்று','1':'நாளை','2':'நாளை மறுநாள்'},
      P:'one{# நாளுக்கு முன்}other{# நாட்களுக்கு முன்}',
      F:'one{# நாளில்}other{# நாட்களில்}',
    },
    NARROW:{
      R:{'-1':'நேற்று','-2':'நேற்று முன் தினம்','0':'இன்று','1':'நாளை','2':'நாளை மறுநாள்'},
      P:'one{# நா. முன்}other{# நா. முன்}',
      F:'one{# நா.}other{# நா.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'இந்த ஒரு மணிநேரத்தில்'},
      P:'one{# மணிநேரம் முன்}other{# மணிநேரம் முன்}',
      F:'one{# மணிநேரத்தில்}other{# மணிநேரத்தில்}',
    },
    SHORT:{
      R:{'0':'இந்த ஒரு மணிநேரத்தில்'},
      P:'one{# மணி. முன்}other{# மணி. முன்}',
      F:'one{# மணி.}other{# மணி.}',
    },
    NARROW:{
      R:{'0':'இந்த ஒரு மணிநேரத்தில்'},
      P:'one{# ம. முன்}other{# ம. முன்}',
      F:'one{# ம.}other{# ம.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'இந்த ஒரு நிமிடத்தில்'},
      P:'one{# நிமிடத்திற்கு முன்}other{# நிமிடங்களுக்கு முன்}',
      F:'one{# நிமிடத்தில்}other{# நிமிடங்களில்}',
    },
    SHORT:{
      R:{'0':'இந்த ஒரு நிமிடத்தில்'},
      P:'one{# நிமி. முன்}other{# நிமி. முன்}',
      F:'one{# நிமி.}other{# நிமி.}',
    },
    NARROW:{
      R:{'0':'இந்த ஒரு நிமிடத்தில்'},
      P:'one{# நி. முன்}other{# நி. முன்}',
      F:'one{# நி.}other{# நி.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'கடந்த மாதம்','0':'இந்த மாதம்','1':'அடுத்த மாதம்'},
      P:'one{# மாதத்துக்கு முன்}other{# மாதங்களுக்கு முன்}',
      F:'one{# மாதத்தில்}other{# மாதங்களில்}',
    },
    SHORT:{
      R:{'-1':'கடந்த மாதம்','0':'இந்த மாதம்','1':'அடுத்த மாதம்'},
      P:'one{# மாத. முன்}other{# மாத. முன்}',
      F:'one{# மாத.}other{# மாத.}',
    },
    NARROW:{
      R:{'-1':'கடந்த மாதம்','0':'இந்த மாதம்','1':'அடுத்த மாதம்'},
      P:'one{# மா. முன்}other{# மா. முன்}',
      F:'one{# மா.}other{# மா.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'கடந்த காலாண்டு','0':'இந்த காலாண்டு','1':'அடுத்த காலாண்டு'},
      P:'one{# காலாண்டுக்கு முன்}other{# காலாண்டுகளுக்கு முன்}',
      F:'one{+# காலாண்டில்}other{# காலாண்டுகளில்}',
    },
    SHORT:{
      R:{'-1':'இறுதி காலாண்டு','0':'இந்த காலாண்டு','1':'அடுத்த காலாண்டு'},
      P:'one{# காலா. முன்}other{# காலா. முன்}',
      F:'one{# காலா.}other{# காலா.}',
    },
    NARROW:{
      R:{'-1':'இறுதி காலாண்டு','0':'இந்த காலாண்டு','1':'அடுத்த காலாண்டு'},
      P:'one{# கா. முன்}other{# கா. முன்}',
      F:'one{# கா.}other{# கா.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'இப்போது'},
      P:'one{# விநாடிக்கு முன்}other{# விநாடிகளுக்கு முன்}',
      F:'one{# விநாடியில்}other{# விநாடிகளில்}',
    },
    SHORT:{
      R:{'0':'இப்போது'},
      P:'one{# விநா. முன்}other{# விநா. முன்}',
      F:'one{# விநா.}other{# விநா.}',
    },
    NARROW:{
      R:{'0':'இப்போது'},
      P:'one{# வி. முன்}other{# வி. முன்}',
      F:'one{# வி.}other{# வி.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'கடந்த வாரம்','0':'இந்த வாரம்','1':'அடுத்த வாரம்'},
      P:'one{# வாரத்திற்கு முன்}other{# வாரங்களுக்கு முன்}',
      F:'one{# வாரத்தில்}other{# வாரங்களில்}',
    },
    SHORT:{
      R:{'-1':'கடந்த வாரம்','0':'இந்த வாரம்','1':'அடுத்த வாரம்'},
      P:'one{# வார. முன்}other{# வார. முன்}',
      F:'one{# வார.}other{# வார.}',
    },
    NARROW:{
      R:{'-1':'கடந்த வாரம்','0':'இந்த வாரம்','1':'அடுத்த வாரம்'},
      P:'one{# வா. முன்}other{# வா. முன்}',
      F:'one{# வா.}other{# வா.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'கடந்த ஆண்டு','0':'இந்த ஆண்டு','1':'அடுத்த ஆண்டு'},
      P:'one{# ஆண்டிற்கு முன்}other{# ஆண்டுகளுக்கு முன்}',
      F:'one{# ஆண்டில்}other{# ஆண்டுகளில்}',
    },
    NARROW:{
      R:{'-1':'கடந்த ஆண்டு','0':'இந்த ஆண்டு','1':'அடுத்த ஆண்டு'},
      P:'one{# ஆ. முன்}other{# ஆ. முன்}',
      F:'one{# ஆ.}other{# ஆ.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_te =  {
  DAY: {
    LONG:{
      R:{'-1':'నిన్న','-2':'మొన్న','0':'ఈ రోజు','1':'రేపు','2':'ఎల్లుండి'},
      P:'one{# రోజు క్రితం}other{# రోజుల క్రితం}',
      F:'one{# రోజులో}other{# రోజుల్లో}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ఈ గంట'},
      P:'one{# గంట క్రితం}other{# గంటల క్రితం}',
      F:'one{# గంటలో}other{# గంటల్లో}',
    },
    SHORT:{
      R:{'0':'ఈ గంట'},
      P:'one{# గం. క్రితం}other{# గం. క్రితం}',
      F:'one{# గం.లో}other{# గం.లో}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'ఈ నిమిషం'},
      P:'one{# నిమిషం క్రితం}other{# నిమిషాల క్రితం}',
      F:'one{# నిమిషంలో}other{# నిమిషాల్లో}',
    },
    SHORT:{
      R:{'0':'ఈ నిమిషం'},
      P:'one{# నిమి. క్రితం}other{# నిమి. క్రితం}',
      F:'one{# నిమి.లో}other{# నిమి.లో}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'గత నెల','0':'ఈ నెల','1':'తదుపరి నెల'},
      P:'one{# నెల క్రితం}other{# నెలల క్రితం}',
      F:'one{# నెలలో}other{# నెలల్లో}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'గత త్రైమాసికం','0':'ఈ త్రైమాసికం','1':'తదుపరి త్రైమాసికం'},
      P:'one{# త్రైమాసికం క్రితం}other{# త్రైమాసికాల క్రితం}',
      F:'one{# త్రైమాసికంలో}other{# త్రైమాసికాల్లో}',
    },
    SHORT:{
      R:{'-1':'గత త్రైమాసికం','0':'ఈ త్రైమాసికం','1':'తదుపరి త్రైమాసికం'},
      P:'one{# త్రైమా. క్రితం}other{# త్రైమా. క్రితం}',
      F:'one{# త్రైమా.లో}other{# త్రైమా.ల్లో}',
    },
    NARROW:{
      R:{'-1':'గత త్రైమాసికం','0':'ఈ త్రైమాసికం','1':'తదుపరి త్రైమాసికం'},
      P:'one{# త్రైమా. క్రితం}other{# త్రైమా. క్రితం}',
      F:'one{# త్రైమాసికంలో}other{# త్రైమాసికాల్లో}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ప్రస్తుతం'},
      P:'one{# సెకను క్రితం}other{# సెకన్ల క్రితం}',
      F:'one{# సెకనులో}other{# సెకన్లలో}',
    },
    SHORT:{
      R:{'0':'ప్రస్తుతం'},
      P:'one{# సెక. క్రితం}other{# సెక. క్రితం}',
      F:'one{# సెకనులో}other{# సెకన్లలో}',
    },
    NARROW:{
      R:{'0':'ప్రస్తుతం'},
      P:'one{# సెక. క్రితం}other{# సెక. క్రితం}',
      F:'one{# సెక.లో}other{# సెక. లో}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'గత వారం','0':'ఈ వారం','1':'తదుపరి వారం'},
      P:'one{# వారం క్రితం}other{# వారాల క్రితం}',
      F:'one{# వారంలో}other{# వారాల్లో}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'గత సంవత్సరం','0':'ఈ సంవత్సరం','1':'తదుపరి సంవత్సరం'},
      P:'one{# సంవత్సరం క్రితం}other{# సంవత్సరాల క్రితం}',
      F:'one{# సంవత్సరంలో}other{# సంవత్సరాల్లో}',
    },
    SHORT:{
      R:{'-1':'గత సంవత్సరం','0':'ఈ సంవత్సరం','1':'తదుపరి సంవత్సరం'},
      P:'one{# సం. క్రితం}other{# సం. క్రితం}',
      F:'one{# సం.లో}other{# సం.ల్లో}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_th =  {
  DAY: {
    LONG:{
      R:{'-1':'เมื่อวาน','-2':'เมื่อวานซืน','0':'วันนี้','1':'พรุ่งนี้','2':'มะรืนนี้'},
      P:'other{# วันที่ผ่านมา}',
      F:'other{ในอีก # วัน}',
    },
    SHORT:{
      R:{'-1':'เมื่อวาน','-2':'เมื่อวานซืน','0':'วันนี้','1':'พรุ่งนี้','2':'มะรืนนี้'},
      P:'other{# วันที่แล้ว}',
      F:'other{ใน # วัน}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ชั่วโมงนี้'},
      P:'other{# ชั่วโมงที่ผ่านมา}',
      F:'other{ในอีก # ชั่วโมง}',
    },
    SHORT:{
      R:{'0':'ชั่วโมงนี้'},
      P:'other{# ชม. ที่แล้ว}',
      F:'other{ใน # ชม.}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'นาทีนี้'},
      P:'other{# นาทีที่ผ่านมา}',
      F:'other{ในอีก # นาที}',
    },
    SHORT:{
      R:{'0':'นาทีนี้'},
      P:'other{# นาทีที่แล้ว}',
      F:'other{ใน # นาที}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'เดือนที่แล้ว','0':'เดือนนี้','1':'เดือนหน้า'},
      P:'other{# เดือนที่ผ่านมา}',
      F:'other{ในอีก # เดือน}',
    },
    SHORT:{
      R:{'-1':'เดือนที่แล้ว','0':'เดือนนี้','1':'เดือนหน้า'},
      P:'other{# เดือนที่แล้ว}',
      F:'other{ใน # เดือน}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ไตรมาสที่แล้ว','0':'ไตรมาสนี้','1':'ไตรมาสหน้า'},
      P:'other{# ไตรมาสที่แล้ว}',
      F:'other{ในอีก # ไตรมาส}',
    },
    SHORT:{
      R:{'-1':'ไตรมาสที่แล้ว','0':'ไตรมาสนี้','1':'ไตรมาสหน้า'},
      P:'other{# ไตรมาสที่แล้ว}',
      F:'other{ใน # ไตรมาส}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ขณะนี้'},
      P:'other{# วินาทีที่ผ่านมา}',
      F:'other{ในอีก # วินาที}',
    },
    SHORT:{
      R:{'0':'ขณะนี้'},
      P:'other{# วินาทีที่แล้ว}',
      F:'other{ใน # วินาที}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'สัปดาห์ที่แล้ว','0':'สัปดาห์นี้','1':'สัปดาห์หน้า'},
      P:'other{# สัปดาห์ที่ผ่านมา}',
      F:'other{ในอีก # สัปดาห์}',
    },
    SHORT:{
      R:{'-1':'สัปดาห์ที่แล้ว','0':'สัปดาห์นี้','1':'สัปดาห์หน้า'},
      P:'other{# สัปดาห์ที่แล้ว}',
      F:'other{ใน # สัปดาห์}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'ปีที่แล้ว','0':'ปีนี้','1':'ปีหน้า'},
      P:'other{# ปีที่แล้ว}',
      F:'other{ในอีก # ปี}',
    },
    SHORT:{
      R:{'-1':'ปีที่แล้ว','0':'ปีนี้','1':'ปีหน้า'},
      P:'other{# ปีที่แล้ว}',
      F:'other{ใน # ปี}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_tl =  {
  DAY: {
    LONG:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # araw}other{sa # (na) araw}',
    },
    SHORT:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# (na) araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # (na) araw}other{sa # (na) araw}',
    },
    NARROW:{
      R:{'-1':'kahapon','-2':'Araw bago ang kahapon','0':'ngayong araw','1':'bukas','2':'Samakalawa'},
      P:'one{# araw ang nakalipas}other{# (na) araw ang nakalipas}',
      F:'one{sa # araw}other{sa # (na) araw}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'ngayong oras'},
      P:'one{# oras ang nakalipas}other{# (na) oras ang nakalipas}',
      F:'one{sa # oras}other{sa # (na) oras}',
    },
    NARROW:{
      R:{'0':'ngayong oras'},
      P:'one{# oras nakalipas}other{# (na) oras nakalipas}',
      F:'one{sa # oras}other{sa # (na) oras}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'sa minutong ito'},
      P:'one{# minuto ang nakalipas}other{# (na) minuto ang nakalipas}',
      F:'one{sa # minuto}other{sa # (na) minuto}',
    },
    SHORT:{
      R:{'0':'sa minutong ito'},
      P:'one{# min. ang nakalipas}other{# (na) min. ang nakalipas}',
      F:'one{sa # min.}other{sa # (na) min.}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'nakaraang buwan','0':'ngayong buwan','1':'susunod na buwan'},
      P:'one{# buwan ang nakalipas}other{# (na) buwan ang nakalipas}',
      F:'one{sa # buwan}other{sa # (na) buwan}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # quarter}other{sa # (na) quarter}',
    },
    SHORT:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # (na) quarter}other{sa # (na) quarter}',
    },
    NARROW:{
      R:{'-1':'nakaraang quarter','0':'ngayong quarter','1':'susunod na quarter'},
      P:'one{# quarter ang nakalipas}other{# (na) quarter ang nakalipas}',
      F:'one{sa # quarter}other{sa # (na) quarter}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'ngayon'},
      P:'one{# segundo ang nakalipas}other{# (na) segundo ang nakalipas}',
      F:'one{sa # segundo}other{sa # (na) segundo}',
    },
    SHORT:{
      R:{'0':'ngayon'},
      P:'one{# seg. ang nakalipas}other{# (na) seg. nakalipas}',
      F:'one{sa # seg.}other{sa # (na) seg.}',
    },
    NARROW:{
      R:{'0':'ngayon'},
      P:'one{# seg. nakalipas}other{# (na) seg. nakalipas}',
      F:'one{sa # seg.}other{sa # (na) seg.}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'nakalipas na linggo','0':'sa linggong ito','1':'susunod na linggo'},
      P:'one{# linggo ang nakalipas}other{# (na) linggo ang nakalipas}',
      F:'one{sa # linggo}other{sa # (na) linggo}',
    },
    SHORT:{
      R:{'-1':'nakaraang linggo','0':'ngayong linggo','1':'susunod na linggo'},
      P:'one{# linggo ang nakalipas}other{# (na) linggo ang nakalipas}',
      F:'one{sa # linggo}other{sa # (na) linggo}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'nakaraang taon','0':'ngayong taon','1':'susunod na taon'},
      P:'one{# taon ang nakalipas}other{# (na) taon ang nakalipas}',
      F:'one{sa # taon}other{sa # (na) taon}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_tr =  {
  DAY: {
    LONG:{
      R:{'-1':'dün','-2':'evvelsi gün','0':'bugün','1':'yarın','2':'öbür gün'},
      P:'one{# gün önce}other{# gün önce}',
      F:'one{# gün sonra}other{# gün sonra}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'bu saat'},
      P:'one{# saat önce}other{# saat önce}',
      F:'one{# saat sonra}other{# saat sonra}',
    },
    SHORT:{
      R:{'0':'bu saat'},
      P:'one{# sa. önce}other{# sa. önce}',
      F:'one{# sa. sonra}other{# sa. sonra}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'bu dakika'},
      P:'one{# dakika önce}other{# dakika önce}',
      F:'one{# dakika sonra}other{# dakika sonra}',
    },
    SHORT:{
      R:{'0':'bu dakika'},
      P:'one{# dk. önce}other{# dk. önce}',
      F:'one{# dk. sonra}other{# dk. sonra}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'geçen ay','0':'bu ay','1':'gelecek ay'},
      P:'one{# ay önce}other{# ay önce}',
      F:'one{# ay sonra}other{# ay sonra}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'geçen çeyrek','0':'bu çeyrek','1':'gelecek çeyrek'},
      P:'one{# çeyrek önce}other{# çeyrek önce}',
      F:'one{# çeyrek sonra}other{# çeyrek sonra}',
    },
    SHORT:{
      R:{'-1':'geçen çeyrek','0':'bu çeyrek','1':'gelecek çeyrek'},
      P:'one{# çyr. önce}other{# çyr. önce}',
      F:'one{# çyr. sonra}other{# çyr. sonra}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'şimdi'},
      P:'one{# saniye önce}other{# saniye önce}',
      F:'one{# saniye sonra}other{# saniye sonra}',
    },
    SHORT:{
      R:{'0':'şimdi'},
      P:'one{# sn. önce}other{# sn. önce}',
      F:'one{# sn. sonra}other{# sn. sonra}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'geçen hafta','0':'bu hafta','1':'gelecek hafta'},
      P:'one{# hafta önce}other{# hafta önce}',
      F:'one{# hafta sonra}other{# hafta sonra}',
    },
    SHORT:{
      R:{'-1':'geçen hafta','0':'bu hafta','1':'gelecek hafta'},
      P:'one{# hf. önce}other{# hf. önce}',
      F:'one{# hf. sonra}other{# hf. sonra}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'geçen yıl','0':'bu yıl','1':'gelecek yıl'},
      P:'one{# yıl önce}other{# yıl önce}',
      F:'one{# yıl sonra}other{# yıl sonra}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_uk =  {
  DAY: {
    LONG:{
      R:{'-1':'учора','-2':'позавчора','0':'сьогодні','1':'завтра','2':'післязавтра'},
      P:'few{# дні тому}many{# днів тому}one{# день тому}other{# дня тому}',
      F:'few{через # дні}many{через # днів}one{через # день}other{через # дня}',
    },
    SHORT:{
      R:{'-1':'учора','-2':'позавчора','0':'сьогодні','1':'завтра','2':'післязавтра'},
      P:'few{# дн. тому}many{# дн. тому}one{# дн. тому}other{# дн. тому}',
      F:'few{через # дн.}many{через # дн.}one{через # дн.}other{через # дн.}',
    },
    NARROW:{
      R:{'-1':'учора','-2':'позавчора','0':'сьогодні','1':'завтра','2':'післязавтра'},
      P:'few{-# дн.}many{-# дн.}one{# д. тому}other{-# дн.}',
      F:'few{за # д.}many{за # д.}one{за # д.}other{за # д.}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'цієї години'},
      P:'few{# години тому}many{# годин тому}one{# годину тому}other{# години тому}',
      F:'few{через # години}many{через # годин}one{через # годину}other{через # години}',
    },
    SHORT:{
      R:{'0':'цієї години'},
      P:'few{# год тому}many{# год тому}one{# год тому}other{# год тому}',
      F:'few{через # год}many{через # год}one{через # год}other{через # год}',
    },
    NARROW:{
      R:{'0':'цієї години'},
      P:'few{# год тому}many{# год тому}one{# год тому}other{# год тому}',
      F:'few{за # год}many{за # год}one{за # год}other{за # год}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'цієї хвилини'},
      P:'few{# хвилини тому}many{# хвилин тому}one{# хвилину тому}other{# хвилини тому}',
      F:'few{через # хвилини}many{через # хвилин}one{через # хвилину}other{через # хвилини}',
    },
    SHORT:{
      R:{'0':'цієї хвилини'},
      P:'few{# хв тому}many{# хв тому}one{# хв тому}other{# хв тому}',
      F:'few{через # хв}many{через # хв}one{через # хв}other{через # хв}',
    },
    NARROW:{
      R:{'0':'цієї хвилини'},
      P:'few{# хв тому}many{# хв тому}one{# хв тому}other{# хв тому}',
      F:'few{за # хв}many{за # хв}one{за # хв}other{за # хв}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'минулого місяця','0':'цього місяця','1':'наступного місяця'},
      P:'few{# місяці тому}many{# місяців тому}one{# місяць тому}other{# місяця тому}',
      F:'few{через # місяці}many{через # місяців}one{через # місяць}other{через # місяця}',
    },
    SHORT:{
      R:{'-1':'минулого місяця','0':'цього місяця','1':'наступного місяця'},
      P:'few{# міс. тому}many{# міс. тому}one{# міс. тому}other{# міс. тому}',
      F:'few{через # міс.}many{через # міс.}one{через # міс.}other{через # міс.}',
    },
    NARROW:{
      R:{'-1':'минулого місяця','0':'цього місяця','1':'наступного місяця'},
      P:'few{# міс. тому}many{# міс. тому}one{# міс. тому}other{# міс. тому}',
      F:'few{за # міс.}many{за # міс.}one{за # міс.}other{за # міс.}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'минулого кварталу','0':'цього кварталу','1':'наступного кварталу'},
      P:'few{# квартали тому}many{# кварталів тому}one{# квартал тому}other{# кварталу тому}',
      F:'few{через # квартали}many{через # кварталів}one{через # квартал}other{через # кварталу}',
    },
    SHORT:{
      R:{'-1':'минулого кв.','0':'цього кв.','1':'наступного кв.'},
      P:'few{# кв. тому}many{# кв. тому}one{# кв. тому}other{# кв. тому}',
      F:'few{через # кв.}many{через # кв.}one{через # кв.}other{через # кв.}',
    },
    NARROW:{
      R:{'-1':'минулого кв.','0':'цього кв.','1':'наступного кв.'},
      P:'few{# кв. тому}many{# кв. тому}one{# кв. тому}other{# кв. тому}',
      F:'few{за # кв.}many{за # кв.}one{за # кв.}other{за # кв.}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'зараз'},
      P:'few{# секунди тому}many{# секунд тому}one{# секунду тому}other{# секунди тому}',
      F:'few{через # секунди}many{через # секунд}one{через # секунду}other{через # секунди}',
    },
    SHORT:{
      R:{'0':'зараз'},
      P:'few{# с тому}many{# с тому}one{# с тому}other{# с тому}',
      F:'few{через # с}many{через # с}one{через # с}other{через # с}',
    },
    NARROW:{
      R:{'0':'зараз'},
      P:'few{# с тому}many{# с тому}one{# с тому}other{# с тому}',
      F:'few{за # с}many{за # с}one{за # с}other{за # с}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'минулого тижня','0':'цього тижня','1':'наступного тижня'},
      P:'few{# тижні тому}many{# тижнів тому}one{# тиждень тому}other{# тижня тому}',
      F:'few{через # тижні}many{через # тижнів}one{через # тиждень}other{через # тижня}',
    },
    SHORT:{
      R:{'-1':'минулого тижня','0':'цього тижня','1':'наступного тижня'},
      P:'few{# тиж. тому}many{# тиж. тому}one{# тиж. тому}other{# тиж. тому}',
      F:'few{через # тиж.}many{через # тиж.}one{через # тиж.}other{через # тиж.}',
    },
    NARROW:{
      R:{'-1':'минулого тижня','0':'цього тижня','1':'наступного тижня'},
      P:'few{# тиж. тому}many{# тиж. тому}one{# тиж. тому}other{# тиж. тому}',
      F:'few{за # тиж.}many{за # тиж.}one{за # тиж.}other{за # тиж.}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'торік','0':'цього року','1':'наступного року'},
      P:'few{# роки тому}many{# років тому}one{# рік тому}other{# року тому}',
      F:'few{через # роки}many{через # років}one{через # рік}other{через # року}',
    },
    SHORT:{
      R:{'-1':'торік','0':'цього року','1':'наступного року'},
      P:'few{# р. тому}many{# р. тому}one{# р. тому}other{# р. тому}',
      F:'few{через # р.}many{через # р.}one{через # р.}other{через # р.}',
    },
    NARROW:{
      R:{'-1':'торік','0':'цього року','1':'наступного року'},
      P:'few{# р. тому}many{# р. тому}one{# р. тому}other{# р. тому}',
      F:'few{за # р.}many{за # р.}one{за # р.}other{за # р.}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_ur =  {
  DAY: {
    LONG:{
      R:{'-1':'گزشتہ کل','-2':'گزشتہ پرسوں','0':'آج','1':'آئندہ کل','2':'آنے والا پرسوں'},
      P:'one{# دن پہلے}other{# دنوں پہلے}',
      F:'one{# دن میں}other{# دنوں میں}',
    },
    NARROW:{
      R:{'-1':'گزشتہ کل','-2':'گزشتہ پرسوں','0':'آج','1':'آئندہ کل','2':'آنے والا پرسوں'},
      P:'one{# دن پہلے}other{# دن پہلے}',
      F:'one{# دن میں}other{# دنوں میں}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'اس گھنٹے'},
      P:'one{# گھنٹہ پہلے}other{# گھنٹے پہلے}',
      F:'one{# گھنٹے میں}other{# گھنٹے میں}',
    },
    SHORT:{
      R:{'0':'اس گھنٹے'},
      P:'one{# گھنٹے پہلے}other{# گھنٹے پہلے}',
      F:'one{# گھنٹے میں}other{# گھنٹے میں}',
    },
    NARROW:{
      R:{'0':'اس گھنٹے'},
      P:'one{# گھنٹہ پہلے}other{# گھنٹے پہلے}',
      F:'one{# گھنٹے میں}other{# گھنٹوں میں}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'اس منٹ'},
      P:'one{# منٹ پہلے}other{# منٹ پہلے}',
      F:'one{# منٹ میں}other{# منٹ میں}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'پچھلا مہینہ','0':'اس مہینہ','1':'اگلا مہینہ'},
      P:'one{# مہینہ پہلے}other{# مہینے پہلے}',
      F:'one{# مہینہ میں}other{# مہینے میں}',
    },
    SHORT:{
      R:{'-1':'پچھلے مہینہ','0':'اس مہینہ','1':'اگلے مہینہ'},
      P:'one{# ماہ قبل}other{# ماہ قبل}',
      F:'one{# ماہ میں}other{# ماہ میں}',
    },
    NARROW:{
      R:{'-1':'پچھلے مہینہ','0':'اس مہینہ','1':'اگلے مہینہ'},
      P:'one{# ماہ پہلے}other{# ماہ پہلے}',
      F:'one{# ماہ میں}other{# ماہ میں}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'گزشتہ سہ ماہی','0':'اس سہ ماہی','1':'اگلے سہ ماہی'},
      P:'one{# سہ ماہی پہلے}other{# سہ ماہی پہلے}',
      F:'one{# سہ ماہی میں}other{# سہ ماہی میں}',
    },
    SHORT:{
      R:{'-1':'گزشتہ سہ ماہی','0':'اس سہ ماہی','1':'اگلے سہ ماہی'},
      P:'one{# سہ ماہی قبل}other{# سہ ماہی قبل}',
      F:'one{# سہ ماہی میں}other{# سہ ماہی میں}',
    },
    NARROW:{
      R:{'-1':'گزشتہ سہ ماہی','0':'اس سہ ماہی','1':'اگلے سہ ماہی'},
      P:'one{# سہ ماہی پہلے}other{# سہ ماہی پہلے}',
      F:'one{# سہ ماہی میں}other{# سہ ماہی میں}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'اب'},
      P:'one{# سیکنڈ پہلے}other{# سیکنڈ پہلے}',
      F:'one{# سیکنڈ میں}other{# سیکنڈ میں}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'پچھلے ہفتہ','0':'اس ہفتہ','1':'اگلے ہفتہ'},
      P:'one{# ہفتہ پہلے}other{# ہفتے پہلے}',
      F:'one{# ہفتہ میں}other{# ہفتے میں}',
    },
    SHORT:{
      R:{'-1':'پچھلے ہفتہ','0':'اس ہفتہ','1':'اگلے ہفتہ'},
      P:'one{# ہفتے پہلے}other{# ہفتے پہلے}',
      F:'one{# ہفتے میں}other{# ہفتے میں}',
    },
    NARROW:{
      R:{'-1':'پچھلے ہفتہ','0':'اس ہفتہ','1':'اگلے ہفتہ'},
      P:'one{# ہفتہ پہلے}other{# ہفتے پہلے}',
      F:'one{# ہفتہ میں}other{# ہفتے میں}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'گزشتہ سال','0':'اس سال','1':'اگلے سال'},
      P:'one{# سال پہلے}other{# سال پہلے}',
      F:'one{# سال میں}other{# سال میں}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_uz =  {
  DAY: {
    LONG:{
      R:{'-1':'kecha','0':'bugun','1':'ertaga'},
      P:'one{# kun oldin}other{# kun oldin}',
      F:'one{# kundan keyin}other{# kundan keyin}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'shu soatda'},
      P:'one{# soat oldin}other{# soat oldin}',
      F:'one{# soatdan keyin}other{# soatdan keyin}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'shu daqiqada'},
      P:'one{# daqiqa oldin}other{# daqiqa oldin}',
      F:'one{# daqiqadan keyin}other{# daqiqadan keyin}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'o‘tgan oy','0':'shu oy','1':'keyingi oy'},
      P:'one{# oy oldin}other{# oy oldin}',
      F:'one{# oydan keyin}other{# oydan keyin}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'o‘tgan chorak','0':'shu chorak','1':'keyingi chorak'},
      P:'one{# chorak oldin}other{# chorak oldin}',
      F:'one{# chorakdan keyin}other{# chorakdan keyin}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'hozir'},
      P:'one{# soniya oldin}other{# soniya oldin}',
      F:'one{# soniyadan keyin}other{# soniyadan keyin}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'o‘tgan hafta','0':'shu hafta','1':'keyingi hafta'},
      P:'one{# hafta oldin}other{# hafta oldin}',
      F:'one{# haftadan keyin}other{# haftadan keyin}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'o‘tgan yil','0':'shu yil','1':'keyingi yil'},
      P:'one{# yil oldin}other{# yil oldin}',
      F:'one{# yildan keyin}other{# yildan keyin}',
    },
    SHORT:{
      R:{'-1':'oʻtgan yil','0':'bu yil','1':'keyingi yil'},
      P:'one{# yil oldin}other{# yil oldin}',
      F:'one{# yildan keyin}other{# yildan keyin}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_vi =  {
  DAY: {
    LONG:{
      R:{'-1':'Hôm qua','-2':'Hôm kia','0':'Hôm nay','1':'Ngày mai','2':'Ngày kia'},
      P:'other{# ngày trước}',
      F:'other{sau # ngày nữa}',
    },
    SHORT:{
      R:{'-2':'Hôm kia','2':'Ngày kia'},
      P:'other{# ngày trước}',
      F:'other{sau # ngày nữa}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'giờ này'},
      P:'other{# giờ trước}',
      F:'other{sau # giờ nữa}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'phút này'},
      P:'other{# phút trước}',
      F:'other{sau # phút nữa}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'tháng trước','0':'tháng này','1':'tháng sau'},
      P:'other{# tháng trước}',
      F:'other{sau # tháng nữa}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'quý trước','0':'quý này','1':'quý sau'},
      P:'other{# quý trước}',
      F:'other{sau # quý nữa}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'bây giờ'},
      P:'other{# giây trước}',
      F:'other{sau # giây nữa}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'tuần trước','0':'tuần này','1':'tuần sau'},
      P:'other{# tuần trước}',
      F:'other{sau # tuần nữa}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'năm ngoái','0':'năm nay','1':'năm sau'},
      P:'other{# năm trước}',
      F:'other{sau # năm nữa}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_zh =  {
  DAY: {
    LONG:{
      R:{'-1':'昨天','-2':'前天','0':'今天','1':'明天','2':'后天'},
      P:'other{#天前}',
      F:'other{#天后}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'这一时间 / 此时'},
      P:'other{#小时前}',
      F:'other{#小时后}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'此刻'},
      P:'other{#分钟前}',
      F:'other{#分钟后}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'上个月','0':'本月','1':'下个月'},
      P:'other{#个月前}',
      F:'other{#个月后}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'上季度','0':'本季度','1':'下季度'},
      P:'other{#个季度前}',
      F:'other{#个季度后}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'现在'},
      P:'other{#秒钟前}',
      F:'other{#秒钟后}',
    },
    SHORT:{
      R:{'0':'现在'},
      P:'other{#秒前}',
      F:'other{#秒后}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'上周','0':'本周','1':'下周'},
      P:'other{#周前}',
      F:'other{#周后}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'去年','0':'今年','1':'明年'},
      P:'other{#年前}',
      F:'other{#年后}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_zh_CN = exports.RelativeDateTimeSymbols_zh;

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_zh_HK =  {
  DAY: {
    LONG:{
      R:{'-1':'昨日','-2':'前日','0':'今日','1':'明日','2':'後日'},
      P:'other{# 日前}',
      F:'other{# 日後}',
    },
    NARROW:{
      R:{'-1':'昨日','-2':'前日','0':'今日','1':'明日','2':'後日'},
      P:'other{#日前}',
      F:'other{#日後}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'這個小時'},
      P:'other{# 小時前}',
      F:'other{# 小時後}',
    },
    NARROW:{
      R:{'0':'這個小時'},
      P:'other{#小時前}',
      F:'other{#小時後}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'這分鐘'},
      P:'other{# 分鐘前}',
      F:'other{# 分鐘後}',
    },
    NARROW:{
      R:{'0':'這分鐘'},
      P:'other{#分前}',
      F:'other{#分後}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'上個月','0':'本月','1':'下個月'},
      P:'other{# 個月前}',
      F:'other{# 個月後}',
    },
    NARROW:{
      R:{'-1':'上個月','0':'本月','1':'下個月'},
      P:'other{#個月前}',
      F:'other{#個月後}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'上一季','0':'今季','1':'下一季'},
      P:'other{# 季前}',
      F:'other{# 季後}',
    },
    SHORT:{
      R:{'-1':'上季','0':'今季','1':'下季'},
      P:'other{# 季前}',
      F:'other{# 季後}',
    },
    NARROW:{
      R:{'-1':'上季','0':'今季','1':'下季'},
      P:'other{-#Q}',
      F:'other{+#Q}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'現在'},
      P:'other{# 秒前}',
      F:'other{# 秒後}',
    },
    NARROW:{
      R:{'0':'現在'},
      P:'other{#秒前}',
      F:'other{#秒後}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'上星期','0':'本星期','1':'下星期'},
      P:'other{# 星期前}',
      F:'other{# 星期後}',
    },
    NARROW:{
      R:{'-1':'上星期','0':'本星期','1':'下星期'},
      P:'other{#星期前}',
      F:'other{#星期後}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'上年','0':'今年','1':'下年'},
      P:'other{# 年前}',
      F:'other{# 年後}',
    },
    NARROW:{
      R:{'-1':'上年','0':'今年','1':'下年'},
      P:'other{#年前}',
      F:'other{#年後}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_zh_TW =  {
  DAY: {
    LONG:{
      R:{'-1':'昨天','-2':'前天','0':'今天','1':'明天','2':'後天'},
      P:'other{# 天前}',
      F:'other{# 天後}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'這一小時'},
      P:'other{# 小時前}',
      F:'other{# 小時後}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'這一分鐘'},
      P:'other{# 分鐘前}',
      F:'other{# 分鐘後}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'上個月','0':'本月','1':'下個月'},
      P:'other{# 個月前}',
      F:'other{# 個月後}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'上一季','0':'這一季','1':'下一季'},
      P:'other{# 季前}',
      F:'other{# 季後}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'現在'},
      P:'other{# 秒前}',
      F:'other{# 秒後}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'上週','0':'本週','1':'下週'},
      P:'other{# 週前}',
      F:'other{# 週後}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'去年','0':'今年','1':'明年'},
      P:'other{# 年前}',
      F:'other{# 年後}',
    },
  },
};

/** @const {!RelativeDateTimeSymbols} */
exports.RelativeDateTimeSymbols_zu =  {
  DAY: {
    LONG:{
      R:{'-1':'izolo','-2':'usuku olwandulela olwayizolo','0':'namhlanje','1':'kusasa','2':'usuku olulandela olwakusasa'},
      P:'one{osukwini olungu-# olwedlule}other{ezinsukwini ezingu-# ezedlule.}',
      F:'one{osukwini olungu-# oluzayo}other{ezinsukwini ezingu-# ezizayo}',
    },
    SHORT:{
      R:{'-1':'izolo','0':'namhlanje','1':'kusasa'},
      P:'one{# usuku olwedlule}other{# izinsuku ezedlule}',
      F:'one{osukwini olungu-# oluzayo}other{ezinsukwini ezingu-# ezizayo}',
    },
  },
  HOUR: {
    LONG:{
      R:{'0':'leli hora'},
      P:'one{# ihora eledlule}other{emahoreni angu-# edlule}',
      F:'one{ehoreni elingu-# elizayo}other{emahoreni angu-# ezayo}',
    },
    NARROW:{
      R:{'0':'leli hora'},
      P:'one{# ihora eledlule}other{# amahora edlule}',
      F:'one{ehoreni elingu-# elizayo}other{emahoreni angu-# ezayo}',
    },
  },
  MINUTE: {
    LONG:{
      R:{'0':'leli minithi'},
      P:'one{# iminithi eledlule}other{# amaminithi edlule}',
      F:'one{kuminithi elingu-# elizayo}other{kumaminithi angu-# ezayo}',
    },
  },
  MONTH: {
    LONG:{
      R:{'-1':'inyanga edlule','0':'le nyanga','1':'inyanga ezayo'},
      P:'one{# inyanga edlule}other{# izinyanga ezedlule}',
      F:'one{enyangeni engu-#}other{ezinyangeni ezingu-# ezizayo}',
    },
    SHORT:{
      R:{'-1':'inyanga edlule','0':'le nyanga','1':'inyanga ezayo'},
      P:'one{# izinyanga ezedlule}other{# izinyanga ezedlule}',
      F:'one{ezinyangeni ezingu-# ezizayo}other{ezinyangeni ezingu-# ezizayo}',
    },
    NARROW:{
      R:{'-1':'inyanga edlule','0':'le nyanga','1':'inyanga ezayo'},
      P:'one{# izinyanga ezedlule}other{# izinyanga ezedlule}',
      F:'one{enyangeni engu-# ezayo}other{enyangeni engu-# ezayo}',
    },
  },
  QUARTER: {
    LONG:{
      R:{'-1':'ikota edlule','0':'le kota','1':'ikota ezayo'},
      P:'one{# ikota edlule}other{# amakota adlule}',
      F:'one{kwikota engu-# ezayo}other{kumakota angu-# ezayo}',
    },
    SHORT:{
      R:{'-1':'ikota edlule','0':'le kota','1':'ikota ezayo'},
      P:'one{# amakota adlule}other{# amakota edlule}',
      F:'one{kwikota engu-# ezayo}other{kumakota angu-# ezayo}',
    },
    NARROW:{
      R:{'-1':'ikota edlule','0':'le kota','1':'ikota ezayo'},
      P:'one{# amakota adlule}other{# amakota edlule}',
      F:'one{kumakota angu-#}other{kumakota angu-#}',
    },
  },
  SECOND: {
    LONG:{
      R:{'0':'manje'},
      P:'one{# isekhondi eledlule}other{# amasekhondi edlule}',
      F:'one{kusekhondi elingu-# elizayo}other{kumasekhondi angu-# ezayo}',
    },
  },
  WEEK: {
    LONG:{
      R:{'-1':'iviki eledlule','0':'leli viki','1':'iviki elizayo'},
      P:'one{evikini elingu-# eledlule}other{amaviki angu-# edlule}',
      F:'one{evikini elingu-#}other{emavikini angu-#}',
    },
    SHORT:{
      R:{'-1':'iviki eledlule','0':'leli viki','1':'iviki elizayo'},
      P:'one{amaviki angu-# edlule}other{amaviki angu-# edlule}',
      F:'one{evikini elingu-# elizayo}other{emavikini angu-# ezayo}',
    },
    NARROW:{
      R:{'-1':'iviki eledlule','0':'leli viki','1':'iviki elizayo'},
      P:'one{amaviki angu-# edlule}other{amaviki angu-# edlule}',
      F:'one{emavikini angu-# ezayo}other{emavikini angu-# ezayo}',
    },
  },
  YEAR: {
    LONG:{
      R:{'-1':'onyakeni odlule','0':'kulo nyaka','1':'unyaka ozayo'},
      P:'one{# unyaka odlule}other{# iminyaka edlule}',
      F:'one{onyakeni ongu-# ozayo}other{eminyakeni engu-# ezayo}',
    },
    SHORT:{
      R:{'-1':'onyakeni odlule','0':'kulo nyaka','1':'unyaka ozayo'},
      P:'one{# unyaka odlule}other{# unyaka odlule}',
      F:'one{onyakeni ongu-# ozayo}other{eminyakeni engu-# ezayo}',
    },
  },
};

switch (goog.LOCALE) {
  case 'af':
    defaultSymbols = exports.RelativeDateTimeSymbols_af;
    break;
  case 'am':
    defaultSymbols = exports.RelativeDateTimeSymbols_am;
    break;
  case 'ar':
    defaultSymbols = exports.RelativeDateTimeSymbols_ar;
    break;
  case 'ar_DZ':
  case 'ar-DZ':
    defaultSymbols = exports.RelativeDateTimeSymbols_ar_DZ;
    break;
  case 'ar_EG':
  case 'ar-EG':
    defaultSymbols = exports.RelativeDateTimeSymbols_ar_EG;
    break;
  case 'az':
    defaultSymbols = exports.RelativeDateTimeSymbols_az;
    break;
  case 'be':
    defaultSymbols = exports.RelativeDateTimeSymbols_be;
    break;
  case 'bg':
    defaultSymbols = exports.RelativeDateTimeSymbols_bg;
    break;
  case 'bn':
    defaultSymbols = exports.RelativeDateTimeSymbols_bn;
    break;
  case 'br':
    defaultSymbols = exports.RelativeDateTimeSymbols_br;
    break;
  case 'bs':
    defaultSymbols = exports.RelativeDateTimeSymbols_bs;
    break;
  case 'ca':
    defaultSymbols = exports.RelativeDateTimeSymbols_ca;
    break;
  case 'chr':
    defaultSymbols = exports.RelativeDateTimeSymbols_chr;
    break;
  case 'cs':
    defaultSymbols = exports.RelativeDateTimeSymbols_cs;
    break;
  case 'cy':
    defaultSymbols = exports.RelativeDateTimeSymbols_cy;
    break;
  case 'da':
    defaultSymbols = exports.RelativeDateTimeSymbols_da;
    break;
  case 'de':
    defaultSymbols = exports.RelativeDateTimeSymbols_de;
    break;
  case 'de_AT':
  case 'de-AT':
    defaultSymbols = exports.RelativeDateTimeSymbols_de_AT;
    break;
  case 'de_CH':
  case 'de-CH':
    defaultSymbols = exports.RelativeDateTimeSymbols_de_CH;
    break;
  case 'el':
    defaultSymbols = exports.RelativeDateTimeSymbols_el;
    break;
  case 'en':
    defaultSymbols = exports.RelativeDateTimeSymbols_en;
    break;
  case 'en_AU':
  case 'en-AU':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_AU;
    break;
  case 'en_CA':
  case 'en-CA':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_CA;
    break;
  case 'en_GB':
  case 'en-GB':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_GB;
    break;
  case 'en_IE':
  case 'en-IE':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_IE;
    break;
  case 'en_IN':
  case 'en-IN':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_IN;
    break;
  case 'en_SG':
  case 'en-SG':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_SG;
    break;
  case 'en_US':
  case 'en-US':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_US;
    break;
  case 'en_ZA':
  case 'en-ZA':
    defaultSymbols = exports.RelativeDateTimeSymbols_en_ZA;
    break;
  case 'es':
    defaultSymbols = exports.RelativeDateTimeSymbols_es;
    break;
  case 'es_419':
  case 'es-419':
    defaultSymbols = exports.RelativeDateTimeSymbols_es_419;
    break;
  case 'es_ES':
  case 'es-ES':
    defaultSymbols = exports.RelativeDateTimeSymbols_es_ES;
    break;
  case 'es_MX':
  case 'es-MX':
    defaultSymbols = exports.RelativeDateTimeSymbols_es_MX;
    break;
  case 'es_US':
  case 'es-US':
    defaultSymbols = exports.RelativeDateTimeSymbols_es_US;
    break;
  case 'et':
    defaultSymbols = exports.RelativeDateTimeSymbols_et;
    break;
  case 'eu':
    defaultSymbols = exports.RelativeDateTimeSymbols_eu;
    break;
  case 'fa':
    defaultSymbols = exports.RelativeDateTimeSymbols_fa;
    break;
  case 'fi':
    defaultSymbols = exports.RelativeDateTimeSymbols_fi;
    break;
  case 'fil':
    defaultSymbols = exports.RelativeDateTimeSymbols_fil;
    break;
  case 'fr':
    defaultSymbols = exports.RelativeDateTimeSymbols_fr;
    break;
  case 'fr_CA':
  case 'fr-CA':
    defaultSymbols = exports.RelativeDateTimeSymbols_fr_CA;
    break;
  case 'ga':
    defaultSymbols = exports.RelativeDateTimeSymbols_ga;
    break;
  case 'gl':
    defaultSymbols = exports.RelativeDateTimeSymbols_gl;
    break;
  case 'gsw':
    defaultSymbols = exports.RelativeDateTimeSymbols_gsw;
    break;
  case 'gu':
    defaultSymbols = exports.RelativeDateTimeSymbols_gu;
    break;
  case 'haw':
    defaultSymbols = exports.RelativeDateTimeSymbols_haw;
    break;
  case 'he':
    defaultSymbols = exports.RelativeDateTimeSymbols_he;
    break;
  case 'hi':
    defaultSymbols = exports.RelativeDateTimeSymbols_hi;
    break;
  case 'hr':
    defaultSymbols = exports.RelativeDateTimeSymbols_hr;
    break;
  case 'hu':
    defaultSymbols = exports.RelativeDateTimeSymbols_hu;
    break;
  case 'hy':
    defaultSymbols = exports.RelativeDateTimeSymbols_hy;
    break;
  case 'id':
    defaultSymbols = exports.RelativeDateTimeSymbols_id;
    break;
  case 'in':
    defaultSymbols = exports.RelativeDateTimeSymbols_in;
    break;
  case 'is':
    defaultSymbols = exports.RelativeDateTimeSymbols_is;
    break;
  case 'it':
    defaultSymbols = exports.RelativeDateTimeSymbols_it;
    break;
  case 'iw':
    defaultSymbols = exports.RelativeDateTimeSymbols_iw;
    break;
  case 'ja':
    defaultSymbols = exports.RelativeDateTimeSymbols_ja;
    break;
  case 'ka':
    defaultSymbols = exports.RelativeDateTimeSymbols_ka;
    break;
  case 'kk':
    defaultSymbols = exports.RelativeDateTimeSymbols_kk;
    break;
  case 'km':
    defaultSymbols = exports.RelativeDateTimeSymbols_km;
    break;
  case 'kn':
    defaultSymbols = exports.RelativeDateTimeSymbols_kn;
    break;
  case 'ko':
    defaultSymbols = exports.RelativeDateTimeSymbols_ko;
    break;
  case 'ky':
    defaultSymbols = exports.RelativeDateTimeSymbols_ky;
    break;
  case 'ln':
    defaultSymbols = exports.RelativeDateTimeSymbols_ln;
    break;
  case 'lo':
    defaultSymbols = exports.RelativeDateTimeSymbols_lo;
    break;
  case 'lt':
    defaultSymbols = exports.RelativeDateTimeSymbols_lt;
    break;
  case 'lv':
    defaultSymbols = exports.RelativeDateTimeSymbols_lv;
    break;
  case 'mk':
    defaultSymbols = exports.RelativeDateTimeSymbols_mk;
    break;
  case 'ml':
    defaultSymbols = exports.RelativeDateTimeSymbols_ml;
    break;
  case 'mn':
    defaultSymbols = exports.RelativeDateTimeSymbols_mn;
    break;
  case 'mo':
    defaultSymbols = exports.RelativeDateTimeSymbols_mo;
    break;
  case 'mr':
    defaultSymbols = exports.RelativeDateTimeSymbols_mr;
    break;
  case 'ms':
    defaultSymbols = exports.RelativeDateTimeSymbols_ms;
    break;
  case 'mt':
    defaultSymbols = exports.RelativeDateTimeSymbols_mt;
    break;
  case 'my':
    defaultSymbols = exports.RelativeDateTimeSymbols_my;
    break;
  case 'nb':
    defaultSymbols = exports.RelativeDateTimeSymbols_nb;
    break;
  case 'ne':
    defaultSymbols = exports.RelativeDateTimeSymbols_ne;
    break;
  case 'nl':
    defaultSymbols = exports.RelativeDateTimeSymbols_nl;
    break;
  case 'no':
    defaultSymbols = exports.RelativeDateTimeSymbols_no;
    break;
  case 'no_NO':
  case 'no-NO':
    defaultSymbols = exports.RelativeDateTimeSymbols_no_NO;
    break;
  case 'or':
    defaultSymbols = exports.RelativeDateTimeSymbols_or;
    break;
  case 'pa':
    defaultSymbols = exports.RelativeDateTimeSymbols_pa;
    break;
  case 'pl':
    defaultSymbols = exports.RelativeDateTimeSymbols_pl;
    break;
  case 'pt':
    defaultSymbols = exports.RelativeDateTimeSymbols_pt;
    break;
  case 'pt_BR':
  case 'pt-BR':
    defaultSymbols = exports.RelativeDateTimeSymbols_pt_BR;
    break;
  case 'pt_PT':
  case 'pt-PT':
    defaultSymbols = exports.RelativeDateTimeSymbols_pt_PT;
    break;
  case 'ro':
    defaultSymbols = exports.RelativeDateTimeSymbols_ro;
    break;
  case 'ru':
    defaultSymbols = exports.RelativeDateTimeSymbols_ru;
    break;
  case 'sh':
    defaultSymbols = exports.RelativeDateTimeSymbols_sh;
    break;
  case 'si':
    defaultSymbols = exports.RelativeDateTimeSymbols_si;
    break;
  case 'sk':
    defaultSymbols = exports.RelativeDateTimeSymbols_sk;
    break;
  case 'sl':
    defaultSymbols = exports.RelativeDateTimeSymbols_sl;
    break;
  case 'sq':
    defaultSymbols = exports.RelativeDateTimeSymbols_sq;
    break;
  case 'sr':
    defaultSymbols = exports.RelativeDateTimeSymbols_sr;
    break;
  case 'sr_Latn':
  case 'sr-Latn':
    defaultSymbols = exports.RelativeDateTimeSymbols_sr_Latn;
    break;
  case 'sv':
    defaultSymbols = exports.RelativeDateTimeSymbols_sv;
    break;
  case 'sw':
    defaultSymbols = exports.RelativeDateTimeSymbols_sw;
    break;
  case 'ta':
    defaultSymbols = exports.RelativeDateTimeSymbols_ta;
    break;
  case 'te':
    defaultSymbols = exports.RelativeDateTimeSymbols_te;
    break;
  case 'th':
    defaultSymbols = exports.RelativeDateTimeSymbols_th;
    break;
  case 'tl':
    defaultSymbols = exports.RelativeDateTimeSymbols_tl;
    break;
  case 'tr':
    defaultSymbols = exports.RelativeDateTimeSymbols_tr;
    break;
  case 'uk':
    defaultSymbols = exports.RelativeDateTimeSymbols_uk;
    break;
  case 'ur':
    defaultSymbols = exports.RelativeDateTimeSymbols_ur;
    break;
  case 'uz':
    defaultSymbols = exports.RelativeDateTimeSymbols_uz;
    break;
  case 'vi':
    defaultSymbols = exports.RelativeDateTimeSymbols_vi;
    break;
  case 'zh':
    defaultSymbols = exports.RelativeDateTimeSymbols_zh;
    break;
  case 'zh_CN':
  case 'zh-CN':
    defaultSymbols = exports.RelativeDateTimeSymbols_zh_CN;
    break;
  case 'zh_HK':
  case 'zh-HK':
    defaultSymbols = exports.RelativeDateTimeSymbols_zh_HK;
    break;
  case 'zh_TW':
  case 'zh-TW':
    defaultSymbols = exports.RelativeDateTimeSymbols_zh_TW;
    break;
  case 'zu':
    defaultSymbols = exports.RelativeDateTimeSymbols_zu;
    break;
  default:
    defaultSymbols = exports.RelativeDateTimeSymbols_en;
}
