// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Functions for dealing with Date formatting & Parsing,
 * County and language name, TimeZone list.
 */


/**
 * Namespace for locale related functions.
 */
goog.provide('goog.locale');

goog.require('goog.locale.nativeNameConstants');

/**
 * Set currnet locale to the specified one.
 * @param {string} localeName Locale name string. We are following the usage
 *     in CLDR, but can make a few compromise for existing name compatibility.
 */
goog.locale.setLocale = function(localeName) {
  // it is common to see people use '-' as locale part separator, normalize it.
  localeName = localeName.replace(/-/g, '_');
  goog.locale.activeLocale_ = localeName;
};


/**
 * Retrieve the currnet locale
 * @return {string} Current locale name string.
 */
goog.locale.getLocale = function() {
  if (!goog.locale.activeLocale_) {
    goog.locale.activeLocale_ = 'en';
  }
  return goog.locale.activeLocale_;
};


// Couple of constants to represent predefined Date/Time format type.

/**
 * Format for full representations of dates.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.FULL_DATE.
 */
goog.locale.FULL_DATE_FORMAT = 0;


/**
 * Format for long representations of dates.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.LONG_DATE.
 */
goog.locale.LONG_DATE_FORMAT = 1;


/**
 * Format for medium representations of dates.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.MEDIUM_DATE.
 */
goog.locale.MEDIUM_DATE_FORMAT = 2;


/**
 * Format for short representations of dates.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.SHORT_DATE.
 */
goog.locale.SHORT_DATE_FORMAT = 3;


/**
 * Format for full representations of times.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.FULL_TIME.
 */
goog.locale.FULL_TIME_FORMAT = 4;


/**
 * Format for long representations of times.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.LONG_TIME.
 */
goog.locale.LONG_TIME_FORMAT = 5;


/**
 * Format for medium representations of times.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.MEDIUM_TIME.
 */
goog.locale.MEDIUM_TIME_FORMAT = 6;


/**
 * Format for short representations of times.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.SHORT_TIME.
 */
goog.locale.SHORT_TIME_FORMAT = 7;


/**
 * Format for short representations of datetimes.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.FULL_DATETIME.
 */
goog.locale.FULL_DATETIME_FORMAT = 8;


/**
 * Format for short representations of datetimes.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.LONG_DATETIME.
 */
goog.locale.LONG_DATETIME_FORMAT = 9;


/**
 * Format for medium representations of datetimes.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME.
 */
goog.locale.MEDIUM_DATETIME_FORMAT = 10;


/**
 * Format for short representations of datetimes.
 * @type {number}
 * @deprecated Use goog.i18n.DateTimeFormat.Format.SHORT_DATETIME.
 */
goog.locale.SHORT_DATETIME_FORMAT = 11;


/**
 * Enum of resources that can be registered.
 * @enum {string}
 */
goog.locale.Resource = {
  DATE_TIME_CONSTANTS: 'DateTimeConstants',
  NUMBER_FORMAT_CONSTANTS: 'NumberFormatConstants',
  TIME_ZONE_CONSTANTS: 'TimeZoneConstants',
  LOCAL_NAME_CONSTANTS: 'LocaleNameConstants',

  TIME_ZONE_SELECTED_IDS: 'TimeZoneSelectedIds',
  TIME_ZONE_SELECTED_SHORT_NAMES: 'TimeZoneSelectedShortNames',
  TIME_ZONE_SELECTED_LONG_NAMES: 'TimeZoneSelectedLongNames',
  TIME_ZONE_ALL_LONG_NAMES: 'TimeZoneAllLongNames'
};


/**
 * Predefined number format pattern type. The actual pattern is defined
 * separately for each locale.
 */


/**
 * Pattern for decimal numbers.
 * @type {number}
 * @deprecated Use goog.i18n.NumberFormat.Format.DECIMAL.
 */
goog.locale.DECIMAL_PATTERN = 1;


/**
 * Pattern for scientific numbers.
 * @type {number}
 * @deprecated Use goog.i18n.NumberFormat.Format.SCIENTIFIC.
 */
goog.locale.SCIENTIFIC_PATTERN = 2;


/**
 * Pattern for percentages.
 * @type {number}
 * @deprecated Use goog.i18n.NumberFormat.Format.PERCENT.
 */
goog.locale.PERCENT_PATTERN = 3;


/**
 * Pattern for currency.
 * @type {number}
 * @deprecated Use goog.i18n.NumberFormat.Format.CURRENCY.
 */
goog.locale.CURRENCY_PATTERN = 4;


// BCP 47 language code:
//
// LanguageCode := LanguageSubtag
//                ("-" ScriptSubtag)?
//                ("-" RegionSubtag)?
//                ("-" VariantSubtag)?
//                ("@" Keyword "=" Value ("," Keyword "=" Value)* )?
//
// e.g. en-Latn-GB
//
// NOTICE:
// No special format checking is performed. If you pass a none valid
// language code as parameter to the following functions,
// you might get an unexpected result.


/**
 * Returns the language-subtag of the given language code.
 *
 * @param {string} languageCode Language code to extract language subtag from.
 * @return {string} Language subtag (in lowercase).
 */
goog.locale.getLanguageSubTag = function(languageCode) {
  var result = languageCode.match(/^\w{2,3}([-_]|$)/);
  return result ? result[0].replace(/[_-]/g, '') : '';
};


/**
 * Returns the region-sub-tag of the given language code.
 *
 * @param {string} languageCode Language code to extract region subtag from.
 * @return {string} Region sub-tag (in uppercase).
 */
goog.locale.getRegionSubTag = function(languageCode) {
  var result = languageCode.match(/[-_]([a-zA-Z]{2}|\d{3})([-_]|$)/);
  return result ? result[0].replace(/[_-]/g, '') : '';
};


/**
 * Returns the script subtag of the locale with the first alphabet in uppercase
 * and the rest 3 characters in lower case.
 *
 * @param {string} languageCode Language Code to extract script subtag from.
 * @return {string} Script subtag.
 */
goog.locale.getScriptSubTag = function(languageCode) {
  var result = languageCode.split(/[-_]/g);
  return result.length > 1 && result[1].match(/^[a-zA-Z]{4}$/) ?
      result[1] : '';
};


/**
 * Returns the variant-sub-tag of the given language code.
 *
 * @param {string} languageCode Language code to extract variant subtag from.
 * @return {string} Variant sub-tag.
 */
goog.locale.getVariantSubTag = function(languageCode) {
  var result = languageCode.match(/[-_]([a-z]{2,})/);
  return result ? result[1] : '';
};


/**
 * Returns the country name of the provided language code in it's native
 * language.
 *
 * This method depends on goog.locale.nativeNameConstants available from
 * nativenameconstants.js. User of this method has to add dependacy to this.
 *
 * @param {string} countryCode Code to lookup the country name for.
 *
 * @return {string} Country name for the provided language code.
 */
goog.locale.getNativeCountryName = function(countryCode) {
  var key = goog.locale.getLanguageSubTag(countryCode) + '_' +
            goog.locale.getRegionSubTag(countryCode);
  return key in goog.locale.nativeNameConstants.COUNTRY ?
      goog.locale.nativeNameConstants.COUNTRY[key] : countryCode;
};


/**
 * Returns the localized country name for the provided language code in the
 * current or provided locale symbols set.
 *
 * This method depends on goog.locale.LocaleNameConstants__<locale> available
 * from //javascript/googledata/i18n/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @param {string} languageCode Language code to lookup the country name for.
 * @param {Object} opt_localeSymbols If omitted the current locale symbol
 *     set is used.
 *
 * @return {string} Localized country name.
 */
goog.locale.getLocalizedCountryName = function(languageCode,
                                               opt_localeSymbols) {
  if (!opt_localeSymbols) {
    opt_localeSymbols = goog.locale.getResource('LocaleNameConstants',
        goog.locale.getLocale());
  }
  var code = goog.locale.getRegionSubTag(languageCode);
  return code in opt_localeSymbols.COUNTRY ?
      opt_localeSymbols.COUNTRY[code] : languageCode;
};


/**
 * Returns the language name of the provided language code in it's native
 * language.
 *
 * This method depends on goog.locale.nativeNameConstants available from
 * nativenameconstants.js. User of this method has to add dependacy to this.
 *
 * @param {string} languageCode Language code to lookup the language name for.
 *
 * @return {string} Language name for the provided language code.
 */
goog.locale.getNativeLanguageName = function(languageCode) {
  var code = goog.locale.getLanguageSubTag(languageCode);
  return code in goog.locale.nativeNameConstants.LANGUAGE ?
      goog.locale.nativeNameConstants.LANGUAGE[code] : languageCode;
};


/**
 * Returns the localized language name for the provided language code in
 * the current or provided locale symbols set.
 *
 * This method depends on goog.locale.LocaleNameConstants__<locale> available
 * from //javascript/googledata/i18n/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @param {string} languageCode Language code to lookup the language name for.
 * @param {Object} opt_localeSymbols locale symbol set if given.
 *
 * @return {string} Localized language name of the provided language code.
 */
goog.locale.getLocalizedLanguageName = function(languageCode,
                                                opt_localeSymbols) {
  if (!opt_localeSymbols) {
    opt_localeSymbols = goog.locale.getResource('LocaleNameConstants',
        goog.locale.getLocale());
  }
  var code = goog.locale.getLanguageSubTag(languageCode);
  return code in opt_localeSymbols.LANGUAGE ?
      opt_localeSymbols.LANGUAGE[code] : languageCode;
};


/**
 * Register a resource object for certain locale.
 * @param {Object} dataObj The resource object being registered.
 * @param {goog.locale.Resource|string} resourceName String that represents
 *     the type of resource.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerResource = function(dataObj, resourceName, localeName) {
  if (!goog.locale.resourceRegistry_[resourceName]) {
    goog.locale.resourceRegistry_[resourceName] = {};
  }
  goog.locale.resourceRegistry_[resourceName][localeName] = dataObj;
  // the first registered locale becomes active one. Usually there will be
  // only one locale per js binary bundle.
  if (!goog.locale.activeLocale_) {
    goog.locale.activeLocale_ = localeName;
  }
};


/**
 * Returns true if the required resource has already been registered.
 * @param {goog.locale.Resource|string} resourceName String that represents
 *     the type of resource.
 * @param {string} localeName Locale ID.
 * @return {boolean} Whether the required resource has already been registered.
 */
goog.locale.isResourceRegistered = function(resourceName, localeName) {
  return resourceName in goog.locale.resourceRegistry_ &&
      localeName in goog.locale.resourceRegistry_[resourceName];
};


/**
 * This object maps (resourceName, localeName) to a resourceObj.
 * @type {Object}
 * @private
 */
goog.locale.resourceRegistry_ = {};


/**
 * Registers the datetime constants object for a given locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 * @deprecated Use goog.i18n.DateTimeFormat, no longer need this.
 */
goog.locale.registerDateTimeConstants = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.DATE_TIME_CONSTANTS, localeName);
};


/**
 * Registers the timezone constants object for a given locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 * @deprecated Use goog.i18n.TimeZone, no longer need this.
 */
goog.locale.registerTimeZoneConstants = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.TIME_ZONE_CONSTANTS, localeName);
};


/**
 * Registers the number formatting constants for a given locale.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 * @deprecated Use goog.i18n.NumberFormat, no longer need this.
 */
goog.locale.registerNumberFormatConstants = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.NUMBER_FORMAT_CONSTANTS, localeName);
};


/**
 * Registers the LocaleNameConstants constants object for a given locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerLocaleNameConstants = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.LOCAL_NAME_CONSTANTS, localeName);
};


/**
 * Registers the TimeZoneSelectedIds constants object for a given locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerTimeZoneSelectedIds = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_IDS, localeName);
};


/**
 * Registers the TimeZoneSelectedShortNames constants object for a given
 *     locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerTimeZoneSelectedShortNames = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_SHORT_NAMES, localeName);
};


/**
 * Registers the TimeZoneSelectedLongNames constants object for a given locale
 *     name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerTimeZoneSelectedLongNames = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_LONG_NAMES, localeName);
};


/**
 * Registers the TimeZoneAllLongNames constants object for a given locale name.
 * @param {Object} dataObj The resource object.
 * @param {string} localeName Locale ID.
 */
goog.locale.registerTimeZoneAllLongNames = function(dataObj, localeName) {
  goog.locale.registerResource(
      dataObj, goog.locale.Resource.TIME_ZONE_ALL_LONG_NAMES, localeName);
};


/**
 * Retrieve specified resource for certain locale.
 * @param {string} resourceName String that represents the type of resource.
 * @param {string} opt_locale Locale ID, if not given, current locale
 *     will be assumed.
 * @return {Object|undefined} The resource object that hold all the resource
 *     data, or undefined if not available.
 */
goog.locale.getResource = function(resourceName, opt_locale) {
  var locale = opt_locale ? opt_locale : goog.locale.getLocale();

  if (!(resourceName in goog.locale.resourceRegistry_)) {
    return undefined;
  }
  return goog.locale.resourceRegistry_[resourceName][locale];
};


/**
 * Retrieve specified resource for certain locale with fallback. For example,
 * request of 'zh_CN' will be resolved in following order: zh_CN, zh, en.
 * If none of the above succeeds, of if the resource as indicated by
 * resourceName does not exist at all, undefined will be returned.
 *
 * @param {string} resourceName String that represents the type of resource.
 * @param {string} opt_locale locale ID, if not given, current locale
 *     will be assumed.
 * @return {Object|undefined} The resource object for desired locale.
 */
goog.locale.getResourceWithFallback = function(resourceName, opt_locale) {
  var locale = opt_locale ? opt_locale : goog.locale.getLocale();

  if (!(resourceName in goog.locale.resourceRegistry_)) {
    return undefined;
  }

  if (locale in goog.locale.resourceRegistry_[resourceName]) {
    return goog.locale.resourceRegistry_[resourceName][locale];
  }

  // if locale has multiple parts (2 atmost in reality), fallback to base part.
  var locale_parts = locale.split('_');
  if (locale_parts.length > 1 &&
      locale_parts[0] in goog.locale.resourceRegistry_[resourceName]) {
    return goog.locale.resourceRegistry_[resourceName][locale_parts[0]];
  }

  // otherwise, fallback to 'en'
  return goog.locale.resourceRegistry_[resourceName]['en'];
};


/**
 * The default English number format symbols.  See:
 * googledata/i18n/js_locale_data/NumberFormatConstants__*.js for other
 * symbol tables.
 *
 * @enum {string}
 * @deprecated Use goog.i18n.NumberFormatSymbols.
 */
goog.locale.DefaultNumberFormatConstants = {
  DECIMAL_SEP: '.',
  GROUP_SEP: ',',
  PERCENT: '%',
  ZERO_DIGIT: '0',
  PLUS_SIGN: '+',
  MINUS_SIGN: '-',
  EXP_SYMBOL: 'E',
  PERMILL: '\u2030',
  INFINITY: '\u221E',
  NAN: 'NaN',
  MONETARY_SEP: '.',
  MONETARY_GROUP_SEP: ',',
  DECIMAL_PATTERN: '#,##0.###',
  SCIENTIFIC_PATTERN: '0.###E0',
  PERCENT_PATTERN: '#,##0%',
  CURRENCY_PATTERN: '\u00A4#,##0.00',
  DEF_CURRENCY_CODE: 'USD'
};


/**
 * The default English date time symbols.  See:
 * googledata/i18n/js_locale_data/DateTimeConstants__*.js for other
 * symbol tables.
 * @deprecated Use goog.i18n.DateTimeSymbols.
 */
goog.locale.DefaultDateTimeConstants = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
           'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
             'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, yyyy', 'MMMM d, yyyy', 'MMM d, yyyy', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a v', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * The default ISO 8601 date time symbols. If not defined in ISO 8601,
 * then fallback is 'en'. See:
 * googledata/i18n/js_locale_data/DateTimeConstants__*.js for other
 * symbol tables.
 * @deprecated Use goog.i18n.DateTimeSymbols.
 */
goog.locale.DateTimeConstants__en_iso8601 = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
           'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
             'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'yyyy-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss v', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Narrowest names of months.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONENARROWMONTHS =
    goog.locale.DefaultDateTimeConstants.NARROWMONTHS;


/**
 * Full names of months.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONEMONTHS =
    goog.locale.DefaultDateTimeConstants.MONTHS;


/**
 * Short names of months.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONESHORTMONTHS =
    goog.locale.DefaultDateTimeConstants.SHORTMONTHS;


/**
 * Full names of week days.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONEWEEKDAYS =
    goog.locale.DefaultDateTimeConstants.WEEKDAYS;


/**
 * Short names of week days.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONESHORTWEEKDAYS =
    goog.locale.DefaultDateTimeConstants.SHORTWEEKDAYS;


/**
 * Narrowest names of week days.
 * @type {Array.<string>}
 */
goog.locale.DefaultDateTimeConstants.STANDALONENARROWWEEKDAYS =
    goog.locale.DefaultDateTimeConstants.NARROWWEEKDAYS;


// Export global functions that are used by the date time constants files.
// See http://go/js_locale_data
var registerDateTimeConstants = goog.locale.registerDateTimeConstants;
var registerNumberFormatConstants = goog.locale.registerNumberFormatConstants;
var registerLocalNameConstants = goog.locale.registerLocaleNameConstants;

var registerTimeZoneSelectedIds = goog.locale.registerTimeZoneSelectedIds;
var registerTimeZoneSelectedShortNames =
    goog.locale.registerTimeZoneSelectedShortNames;
var registerTimeZoneSelectedLongNames =
    goog.locale.registerTimeZoneSelectedLongNames;
var registerTimeZoneAllLongNames = goog.locale.registerTimeZoneAllLongNames;

