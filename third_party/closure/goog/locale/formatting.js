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
 * @fileoverview Functions for dealing with locale-specific formatting.
 */

goog.provide('goog.locale.formatting');

goog.require('goog.locale.DateTimeFormat');
goog.require('goog.locale.DateTimeParse');
goog.require('goog.locale.NumberFormat');


/**
 * Format the given date object into a string representation using pattern
 * specified.
 * @param {string} pattern Pattern String to specify how the date should
 *     be formatted.
 * @param {Date} date Date object being formatted.
 * @param {goog.locale.TimeZone} opt_timeZone optional, if specified, time
 *    related fields will be formatted based on its setting.
 *
 * @return {string} string representation of date/time.
 * @deprecated Use goog.i18n.DateTimeFormat.
 */
goog.locale.formatDateTime = function(pattern, date, opt_timeZone) {
  var formatter = new goog.locale.DateTimeFormat();
  formatter.applyPattern(pattern);
  return formatter.format(date, opt_timeZone);
};


/**
 * Formats a given date object according to a predefined
 * date format pattern specified in symbols object.
 * @param {number} formatType Number used to reference predefined pattern.
 * @param {Date} date The date object being formatted.
 * @param {goog.locale.TimeZone} opt_timeZone optional, if specified, time
 *    related fields will be formatted based on its setting.
 * @return {string} string representation of date/time.
 * @deprecated Use goog.i18n.DateTimeFormat.
 */
goog.locale.standardFormatDateTime = function(formatType, date, opt_timeZone) {
  var formatter = new goog.locale.DateTimeFormat();
  formatter.applyStandardPattern(formatType);
  return formatter.format(date, opt_timeZone);
};


/**
 * Return a  object for specified pattern, that can be used  to
 * format date object.
 * @param {string} pattern specifies how the date should be formatted.
 *
 * @return {goog.locale.DateTimeFormat} A DateTimeFormat instance for given
 *     pattern.
 * @deprecated Use goog.i18n.DateTimeFormat.
 */
goog.locale.getDateTimeFormatter = function(pattern) {
  var formatter = new goog.locale.DateTimeFormat();
  formatter.applyPattern(pattern);
  return formatter;
};


/**
 * Return a DateTimeFormat object that can be used to format date using a
 * predefined pattern as identified by "formatType".
 * @param {number} formatType identifies the predefined pattern string.
 *
 * @return {goog.locale.DateTimeFormat} A DateTimeFormat instance for the
 *     predefined format type.
 * @deprecated Use goog.i18n.DateTimeFormat.
 */
goog.locale.getStandardDateTimeFormatter = function(formatType) {
  var formatter = new goog.locale.DateTimeFormat();
  formatter.applyStandardPattern(formatType);
  return formatter;
};


/**
 * Parse a string using the format as specified in pattern string, and
 * return date in the passed "date" parameter.
 *
 * @param {string} pattern specifies how the date should be formatted.
 * @param {string} text The string that need to be parsed.
 * @param {number} start The character position in "text" where parse begins.
 * @param {Date} date The date object that will hold parsed value.
 *
 * @return {number} The number of characters advanced or 0 if failed.
 * @deprecated Use goog.i18n.DateTimeParse.
 */
goog.locale.parseDateTime = function(pattern, text, start, date) {
  var parser = new goog.locale.DateTimeParse();
  parser.applyPattern(pattern);
  return parser.parse(text, start, date);
};


/**
 * Parse a string using the format as specified in pattern string, and
 * return date in the passed "date" parameter.
 *
 * @param {string} pattern specifies how the date should be formatted.
 * @param {string} text The string that need to be parsed.
 * @param {number} start The character position in "text" where parse begins.
 * @param {Date} date used to hold the parsed value.
 *
 * @return {number} The number of characters advanced or 0 if failed.
 * @deprecated Use goog.i18n.DateTimeParse.
 */
goog.locale.strictParseDateTime = function(pattern, text, start, date) {
  var parser = new goog.locale.DateTimeParse();
  parser.applyPattern(pattern);
  return parser.strictParse(text, start, date);
};


/**
 * Parse a string using a predefined date/time pattern.
 *
 * @param {number} formatType identifies a predefined pattern stored in
 *     locale specific repository.
 * @param {string} text The string that needs to be parsed.
 * @param {number} start parse start position in "text".
 * @param {Date} date used to hold the parsed value.
 *
 * @return {number} The number of characters advanced or 0 if failed.
 * @deprecated Use goog.i18n.DateTimeParse.
 */
goog.locale.standardParseDateTime = function(formatType, text, start, date) {
  var parser = new goog.locale.DateTimeParse();
  parser.applyStandardPattern(formatType);
  return parser.parse(text, start, date);
};


/**
 * Get a DateTimeParse object that could parse date string using a predefined
 * pattern type.
 * @param {number} formatType identifies a predefined pattern stored in
 *     locale specific repository.
 * @return {goog.locale.DateTimeParse} A goog.locale.DateTimeParse instance
 *     for the predefined format type.
 * @deprecated Use goog.i18n.DateTimeParse.
 */
goog.locale.getStandardDateTimeParser = function(formatType) {
  var parser = new goog.locale.DateTimeParse();
  parser.applyStandardPattern(formatType);
  return parser;
};


/**
 * Get a DateTimeParse object that could parse date string using given pattern.
 * @param {string} pattern specifies how the date should be formatted.
 * @return {goog.locale.DateTimeParse} A goog.locale.DateTimeParse instance
 *     for the given pattern.
 * @deprecated Use goog.i18n.DateTimeParse.
 */
goog.locale.getDateTimeParser = function(pattern) {
  var parser = new goog.locale.DateTimeParse();
  parser.applyPattern(pattern);
  return parser;
};


/**
 * Format the number using given pattern.
 * @param {string} pattern specifies how number should be formatted.
 * @param {number} value The number being formatted.
 * @return {string} The formatted string.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.formatNumber = function(pattern, value) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyPattern(pattern);
  return formatter.format(value);
};


/**
 * Parse the given text using specified pattern to get a number.
 * @param {string} pattern tells how the text is constructed.
 * @param {string} text input text being parsed.
 * @param {Array} opt_pos optional one element array that holds position
 *     information. It tells from where parse should begin. Upon return, it
 *     holds parse stop position.
 * @return {number} Parsed number, NaN if in error.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.parseNumber = function(pattern, text, opt_pos) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyPattern(pattern);
  return formatter.parse(text, opt_pos);
};


/**
 * Format the number using predefined pattern.
 * @param {number} patternType indentifies a predefined pattern to use.
 * @param {number} value the number being formatted.
 * @return {string} The formatted string.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.standardFormatNumber = function(patternType, value) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyStandardPattern(patternType);
  return formatter.format(value);
};


/**
 * Parse the given text using a predefined pattern to get a number.
 * @param {number} patternType identifies a predefined pattern to use.
 * @param {string} text the input text being parsed.
 * @param {number} opt_pos optional position information, it holds parse start
 *     position in the beginning. If parsing is successful, this position will
 *     be updated to the character next to where parsing ends.
 * @return {number} Parsed number, 0 if in error.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.standardParseNumber = function(patternType, text, opt_pos) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyStandardPattern(patternType);
  return formatter.parse(text, opt_pos ? [opt_pos] : null);
};


/**
 * To obtain a NumberFormat object that can be used for number format/parse.
 * @param {string} pattern number format pattern string.
 * @param {string} opt_currencyCode optional international currency code, it
 *     determines the currency code/symbol should be used in format/parse. If
 *     not given, the currency code for current locale will be used.
 * @return {goog.locale.NumberFormat}  A goog.locale.NumberFormat instance
 *     for the given pattern and currency.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.getNumberFormatter = function(pattern, opt_currencyCode) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyPattern(pattern, opt_currencyCode);
  return formatter;
};


/**
 * To obtain a NumberFormat object that can be used for number format/parse from
 * a predefined pattern type.
 * @param {number} patternType identifies a predefined number format pattern.
 * @param {string} opt_currencyCode optional international currency code. It
 *     determines the currency code/symbol used in format/parse. If not given,
 *     the currency code for current locale will be used.
 * @return {goog.locale.NumberFormat} A goog.locale.NumberFormat instance for
 *     the predefined pattern type and currency code.
 * @deprecated Use goog.i18n.NumberFormat.
 */
goog.locale.getStandardNumberFormatter = function(patternType,
                                                  opt_currencyCode) {
  var formatter = new goog.locale.NumberFormat();
  formatter.applyStandardPattern(patternType, opt_currencyCode);
  return formatter;
};
