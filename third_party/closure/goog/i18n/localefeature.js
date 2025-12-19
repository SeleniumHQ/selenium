// Copyright 2019 The Closure Library Authors. All Rights Reserved.
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
goog.module('goog.i18n.LocaleFeature');

/**
 * @fileoverview Provides flag for using ECMAScript 402 features vs.
 * native JavaScript Closure implementations for I18N purposes.
 */

/**
 * @define {boolean} USE_ECMASCRIPT_I18N Evaluated at compile to select
 * ECMAScript Intl object (when true) or JavaScript implementation (false) for
 * I18N purposes.  This set of locales is common across all of the modern
 * browsers and Android implementations available in 2019.
 */
exports.USE_ECMASCRIPT_I18N =
    (goog.FEATURESET_YEAR >= 2019 &&
     (goog.LOCALE == 'am' || goog.LOCALE == 'ar' || goog.LOCALE == 'bg' ||
      goog.LOCALE == 'bn' || goog.LOCALE == 'ca' || goog.LOCALE == 'cs' ||
      goog.LOCALE == 'da' || goog.LOCALE == 'de' || goog.LOCALE == 'el' ||
      goog.LOCALE == 'en' || goog.LOCALE == 'es' || goog.LOCALE == 'et' ||
      goog.LOCALE == 'fa' || goog.LOCALE == 'fi' || goog.LOCALE == 'fil' ||
      goog.LOCALE == 'fr' || goog.LOCALE == 'gu' || goog.LOCALE == 'he' ||
      goog.LOCALE == 'hi' || goog.LOCALE == 'hr' || goog.LOCALE == 'hu' ||
      goog.LOCALE == 'id' || goog.LOCALE == 'it' || goog.LOCALE == 'ja' ||
      goog.LOCALE == 'kn' || goog.LOCALE == 'ko' || goog.LOCALE == 'lt' ||
      goog.LOCALE == 'lv' || goog.LOCALE == 'ml' || goog.LOCALE == 'mr' ||
      goog.LOCALE == 'ms' || goog.LOCALE == 'nl' || goog.LOCALE == 'pl' ||
      goog.LOCALE == 'ro' || goog.LOCALE == 'ru' || goog.LOCALE == 'sk' ||
      goog.LOCALE == 'sl' || goog.LOCALE == 'sr' || goog.LOCALE == 'sv' ||
      goog.LOCALE == 'sw' || goog.LOCALE == 'ta' || goog.LOCALE == 'te' ||
      goog.LOCALE == 'th' || goog.LOCALE == 'tr' || goog.LOCALE == 'uk' ||
      goog.LOCALE == 'vi' || goog.LOCALE == 'en_GB' || goog.LOCALE == 'en-GB' ||
      goog.LOCALE == 'es_419' || goog.LOCALE == 'es-419' ||
      goog.LOCALE == 'pt_BR' || goog.LOCALE == 'pt-BR' ||
      goog.LOCALE == 'pt_PT' || goog.LOCALE == 'pt-PT' ||
      goog.LOCALE == 'zh_CN' || goog.LOCALE == 'zh-CN' ||
      goog.LOCALE == 'zh_TW' || goog.LOCALE == 'zh-TW'));

/**
 * @define {boolean} USE_ECMASCRIPT_I18N_RDTF is evaluted to enable
 * ECMAScript support for Intl.RelativeTimeFormat support in
 * browsers based on the locale. Browsers that are considered include:
 * Chrome, Firefox, Edge, and Safari.
 * As of June 2019, RelativeTimeFormat is not yet supported in either
 * Edge or Safari.
 */
exports.USE_ECMASCRIPT_I18N_RDTF = false;
