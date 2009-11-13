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
 * @fileoverview Functions for dealing with date/time formatting.
 */


/**
 * Namespace for i18n date/time formatting functions
 */
goog.provide('goog.i18n.DateTimeFormat');

goog.require('goog.asserts');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.TimeZone');
goog.require('goog.string');


/**
 * Datetime formatting functions following the pattern specification as defined
 * in JDK, ICU and CLDR, with minor modification for typical usage in JS.
 * Pattern specification: (Refer to JDK/ICU/CLDR)
 * <pre>
 * Symbol Meaning Presentation        Example
 * ------   -------                 ------------        -------
 * G        era designator          (Text)              AD
 * y#       year                    (Number)            1996
 * Y*       year (week of year)     (Number)            1997
 * u*       extended year           (Number)            4601
 * M        month in year           (Text & Number)     July & 07
 * d        day in month            (Number)            10
 * h        hour in am/pm (1~12)    (Number)            12
 * H        hour in day (0~23)      (Number)            0
 * m        minute in hour          (Number)            30
 * s        second in minute        (Number)            55
 * S        fractional second       (Number)            978
 * E        day of week             (Text)              Tuesday
 * e*       day of week (local 1~7) (Number)            2
 * D*       day in year             (Number)            189
 * F*       day of week in month    (Number)            2 (2nd Wed in July)
 * w*       week in year            (Number)            27
 * W*       week in month           (Number)            2
 * a        am/pm marker            (Text)              PM
 * k        hour in day (1~24)      (Number)            24
 * K        hour in am/pm (0~11)    (Number)            0
 * z        time zone               (Text)              Pacific Standard Time
 * Z        time zone (RFC 822)     (Number)            -0800
 * v        time zone (generic)     (Text)              Pacific Time
 * g*       Julian day              (Number)            2451334
 * A*       milliseconds in day     (Number)            69540000
 * '        escape for text         (Delimiter)         'Date='
 * ''       single quote            (Literal)           'o''clock'
 *
 * Item marked with '*' are not supported yet.
 * Item marked with '#' works different than java
 *
 * The count of pattern letters determine the format.
 * (Text): 4 or more, use full form, <4, use short or abbreviated form if it
 * exists. (e.g., "EEEE" produces "Monday", "EEE" produces "Mon")
 *
 * (Number): the minimum number of digits. Shorter numbers are zero-padded to
 * this amount (e.g. if "m" produces "6", "mm" produces "06"). Year is handled
 * specially; that is, if the count of 'y' is 2, the Year will be truncated to
 * 2 digits. (e.g., if "yyyy" produces "1997", "yy" produces "97".) Unlike other
 * fields, fractional seconds are padded on the right with zero.
 *
 * (Text & Number): 3 or over, use text, otherwise use number. (e.g., "M"
 * produces "1", "MM" produces "01", "MMM" produces "Jan", and "MMMM" produces
 * "January".)
 *
 * Any characters in the pattern that are not in the ranges of ['a'..'z'] and
 * ['A'..'Z'] will be treated as quoted text. For instance, characters like ':',
 * '.', ' ', '#' and '@' will appear in the resulting time text even they are
 * not embraced within single quotes.
 * </pre>
 *
 */


/**
 * Construct a DateTimeFormat object based on current locale.
 * @constructor
 * @param {string|number} pattern pattern specification or pattern type.
 */
goog.i18n.DateTimeFormat = function(pattern) {
  goog.asserts.assert(goog.isDef(pattern), 'Pattern must be defined');
  this.patternParts_ = [];
  if (typeof pattern == 'number') {
    this.applyStandardPattern_(pattern);
  } else {
    this.applyPattern_(pattern);
  }
};


/**
 * Enum to identify predefined Date/Time format pattern.
 * @enum {number}
 */
goog.i18n.DateTimeFormat.Format = {
  FULL_DATE: 0,
  LONG_DATE: 1,
  MEDIUM_DATE: 2,
  SHORT_DATE: 3,
  FULL_TIME: 4,
  LONG_TIME: 5,
  MEDIUM_TIME: 6,
  SHORT_TIME: 7,
  FULL_DATETIME: 8,
  LONG_DATETIME: 9,
  MEDIUM_DATETIME: 10,
  SHORT_DATETIME: 11
};


/**
 * regular expression pattern for parsing pattern string
 * @type {Array.<RegExp>}
 * @private
 */
goog.i18n.DateTimeFormat.TOKENS_ = [
  //quote string
  /^\'(?:[^\']|\'\')*\'/,
  // pattern chars
  /^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,
  // and all the other chars
  /^[^\'GyMkSEahKHcLQdmsvzZ]+/  // and all the other chars
];


/**
 * These are token types, corresponding to above token definitions.
 * @enum {number}
 * @private
 */
goog.i18n.DateTimeFormat.PartTypes_ = {
  QUOTED_STRING : 0,
  FIELD : 1,
  LITERAL : 2
};


/**
 * Apply specified pattern to this formatter object.
 * @param {string} pattern String specifying how the date should be formatted.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.applyPattern_ = function(pattern) {
  // lex the pattern, once for all uses
  while (pattern) {
    for (var i = 0; i < goog.i18n.DateTimeFormat.TOKENS_.length; ++i) {
      var m = pattern.match(goog.i18n.DateTimeFormat.TOKENS_[i]);
      if (m) {
        var part = m[0];
        pattern = pattern.substring(part.length);
        if (i == goog.i18n.DateTimeFormat.PartTypes_.QUOTED_STRING) {
          if (part == "''") {
            part = "'";  // '' -> '
          } else {
            part = part.substring(1, part.length - 1); // strip quotes
            part = part.replace(/\'\'/, "'");
          }
        }
        this.patternParts_.push({ text: part, type: i });
        break;
      }
    }
  }
};


/**
 * Format the given date object according to preset pattern and current lcoale.
 * @param {Date} date The Date object that is being formatted.
 * @param {goog.i18n.TimeZone} opt_timeZone optional, if specified, time
 *    related fields will be formatted based on its setting. When this field
 *    is not specified, "undefined" will be pass around and those function
 *    that really need time zone service will create a default one.
 * @return {string} Formatted string for the given date.
 */
goog.i18n.DateTimeFormat.prototype.format = function(date, opt_timeZone) {
  // We don't want to write code to calculate each date field because we
  // want to maximize performance and minimize code size.
  // JavaScript only provide API to render local time.
  // Suppose target date is: 16:00 GMT-0400
  // OS local time is:       12:00 GMT-0800
  // We want to create a Local Date Object : 16:00 GMT-0800, and fix the
  // time zone display ourselves.
  // Thing get a little bit tricky when daylight time transition happens. For
  // example, suppose OS timeZone is America/Los_Angeles, it is impossible to
  // represent "2006/4/2 02:30" even for those timeZone that has no transition
  // at this time. Because 2:00 to 3:00 on that day does not exising in
  // America/Los_Angeles time zone. To avoid calculating date field through
  // our own code, we uses 3 Date object instead, one for "Year, month, day",
  // one for time within that day, and one for timeZone object since it need
  // the real time to figure out actual time zone offset.
  var diff = opt_timeZone ?
    (date.getTimezoneOffset() - opt_timeZone.getOffset(date)) * 60000 : 0;
  var dateForDate = diff ? new Date(date.getTime() + diff) : date;
  var dateForTime = dateForDate;
  // in daylight time switch on/off hour, diff adjustment could alter time
  // because of timeZone offset change, move 1 day forward or backward.
  if (opt_timeZone &&
      dateForDate.getTimezoneOffset() != date.getTimezoneOffset()) {
    diff += diff > 0 ? -24 * 60 * 60000 : 24 * 60 * 60000;
    dateForTime = new Date(date.getTime() + diff);
  }

  var out = [];
  for (var i = 0; i < this.patternParts_.length; ++i) {
    var text = this.patternParts_[i].text;
    if (goog.i18n.DateTimeFormat.PartTypes_.FIELD ==
        this.patternParts_[i].type) {
      out.push(this.formatField_(text, date, dateForDate, dateForTime,
                                 opt_timeZone));
    } else {
      out.push(text);
    }
  }
  return out.join('');
};


/**
 * Apply a predefined pattern as identified by formatType, which is stored in
 * locale specific repository.
 * @param {number} formatType A number that identified the predefined pattern.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.applyStandardPattern_ =
    function(formatType) {
  var pattern;
  if (formatType < 4) {
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType];
  } else if (formatType < 8) {
    pattern = goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 4];
  } else if (formatType < 12){
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType - 8] +
              ' ' + goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 8];
  } else {
    this.applyStandardPattern_(goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME);
    return;
  }
  this.applyPattern_(pattern);
};


/**
 * Formats Era field according to pattern specified.
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatEra_ = function(count, date) {
  var value = date.getFullYear() > 0 ? 1 : 0;
  return count >= 4 ? goog.i18n.DateTimeSymbols.ERANAMES[value] :
                      goog.i18n.DateTimeSymbols.ERAS[value];
};


/**
 * Formats Year field according to pattern specified
 *   Javascript Date object seems incapable handling 1BC and
 *   year before. It can show you year 0 which does not exists.
 *   following we just keep consistent with javascript's
 *   toString method. But keep in mind those things should be
 *   unsupported.
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatYear_ = function(count, date) {
  var value = date.getFullYear();
  if (value < 0) {
    value = -value;
  }
  return count == 2 ?
      goog.string.padNumber(value % 100, 2) :
      String(value);
};


/**
 * Formats Month field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatMonth_ = function(count, date) {
  var value = date.getMonth();
  switch (count) {
    case 5: return goog.i18n.DateTimeSymbols.NARROWMONTHS[value];
    case 4: return goog.i18n.DateTimeSymbols.MONTHS[value];
    case 3: return goog.i18n.DateTimeSymbols.SHORTMONTHS[value];
    default:
      return goog.string.padNumber(value + 1, count);
  }
};


/**
 * Formats (1..24) Hours field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats. This controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.format24Hours_ =
    function(count, date) {
  return goog.string.padNumber(date.getHours() || 24, count);
};


/**
 * Formats Fractional seconds field according to pattern
 * specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 *
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatFractionalSeconds_ =
    function(count, date) {
  // Fractional seconds left-justify, append 0 for precision beyond 3
  var value = date.getTime() % 1000 / 1000;
  return value.toFixed(Math.min(3, count)).substr(2) +
         (count > 3 ? goog.string.padNumber(0, count - 3) : '');
};


/**
 * Formats Day of week field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatDayOfWeek_ =
    function(count, date) {
  var value = date.getDay();
  return count >= 4 ? goog.i18n.DateTimeSymbols.WEEKDAYS[value] :
                      goog.i18n.DateTimeSymbols.SHORTWEEKDAYS[value];
};


/**
 * Formats Am/Pm field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatAmPm_ = function(count, date) {
  var hours = date.getHours();
  return goog.i18n.DateTimeSymbols.AMPMS[hours >= 12 && hours < 24 ? 1 : 0];
};


/**
 * Formats (1..12) Hours field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.format1To12Hours_ =
    function(count, date) {
  return goog.string.padNumber(date.getHours() % 12 || 12, count);
};


/**
 * Formats (0..11) Hours field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.format0To11Hours_ =
    function(count, date) {
  return goog.string.padNumber(date.getHours() % 12, count);
};


/**
 * Formats (0..23) Hours field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.format0To23Hours_ =
    function(count, date) {
  return goog.string.padNumber(date.getHours(), count);
};


/**
 * Formats Standalone weekday field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatStandaloneDay_ =
    function(count, date) {
  var value = date.getDay();
  switch (count) {
    case 5:
      return goog.i18n.DateTimeSymbols.STANDALONENARROWWEEKDAYS[value];
    case 4:
      return goog.i18n.DateTimeSymbols.STANDALONEWEEKDAYS[value];
    case 3:
      return goog.i18n.DateTimeSymbols.STANDALONESHORTWEEKDAYS[value];
    default:
      return goog.string.padNumber(value, 1);
  }
};


/**
 * Formats Standalone Month field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatStandaloneMonth_ =
    function(count, date) {
  var value = date.getMonth();
  switch (count) {
    case 5:
      return goog.i18n.DateTimeSymbols.STANDALONENARROWMONTHS[value];
    case 4:
      return goog.i18n.DateTimeSymbols.STANDALONEMONTHS[value];
    case 3:
      return goog.i18n.DateTimeSymbols.STANDALONESHORTMONTHS[value];
    default:
      return goog.string.padNumber(value + 1, count);
  }
};


/**
 * Formats Quarter field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatQuarter_ =
   function(count, date) {
  var value = Math.floor(date.getMonth() / 3);
  return count < 4 ? goog.i18n.DateTimeSymbols.SHORTQUARTERS[value] :
                     goog.i18n.DateTimeSymbols.QUARTERS[value];
};


/**
 * Formats Date field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatDate_ = function(count, date) {
  return goog.string.padNumber(date.getDate(), count);
};


/**
 * Formats Minutes field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatMinutes_ =
    function(count, date) {
  return goog.string.padNumber(date.getMinutes(), count);
};


/**
 * Formats Seconds field according to pattern specified
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatSeconds_ =
    function(count, date) {
  return goog.string.padNumber(date.getSeconds(), count);
};


/**
 * Formats TimeZone field following RFC
 *
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date It holds the date object to be formatted.
 * @param {goog.i18n.TimeZone} opt_timeZone This holds current time zone info.
 * @return {string} Formatted string that represent this field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatTimeZoneRFC_ =
    function(count, date, opt_timeZone) {
  opt_timeZone = opt_timeZone ||
             goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset());
  return count < 4 ? opt_timeZone.getRFCTimeZoneString(date) :
                     opt_timeZone.getGMTString(date);
};


/**
 * Generate GMT timeZone string for given date
 * @param {number} count Number of time pattern char repeats, it controls
 *     how a field should be formatted.
 * @param {Date} date Whose value being evaluated.
 * @param {goog.i18n.TimeZone} opt_timeZone This holds current time zone info.
 * @return {string} GMT timeZone string.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatTimeZone_ =
    function(count, date, opt_timeZone) {
  opt_timeZone = opt_timeZone ||
             goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset());
  return count < 4 ? opt_timeZone.getShortName(date) :
             opt_timeZone.getLongName(date);
};


/**
 * Generate GMT timeZone string for given date
 * @param {Date} date Whose value being evaluated.
 * @param {goog.i18n.TimeZone} opt_timeZone This holds current time zone info.
 * @return {string} GMT timeZone string.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatTimeZoneId_ =
    function(date, opt_timeZone) {
  opt_timeZone = opt_timeZone ||
             goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset());
  return opt_timeZone.getTimeZoneId();
};


/**
 * Formatting one date field.
 * @param {string} patternStr The pattern string for the field being formatted.
 * @param {Date} date represents the real date to be formatted.
 * @param {Date} dateForDate used to resolve date fields for formatting.
 * @param {Date} dateForTime used to resolve time fields for formatting.
 * @param {goog.i18n.TimeZone} opt_timeZone This holds current time zone info.
 * @return {string} string representation for the given field.
 * @private
 */
goog.i18n.DateTimeFormat.prototype.formatField_ =
    function(patternStr, date, dateForDate, dateForTime, opt_timeZone) {
  var count = patternStr.length;
  switch (patternStr.charAt(0)) {
  case 'G': return this.formatEra_(count, dateForDate);
  case 'y': return this.formatYear_(count, dateForDate);
  case 'M': return this.formatMonth_(count, dateForDate);
  case 'k': return this.format24Hours_(count, dateForTime);
  case 'S': return this.formatFractionalSeconds_(count, dateForTime);
  case 'E': return this.formatDayOfWeek_(count, dateForDate);
  case 'a': return this.formatAmPm_(count, dateForTime);
  case 'h': return this.format1To12Hours_(count, dateForTime);
  case 'K': return this.format0To11Hours_(count, dateForTime);
  case 'H': return this.format0To23Hours_(count, dateForTime);
  case 'c': return this.formatStandaloneDay_(count, dateForDate);
  case 'L': return this.formatStandaloneMonth_(count, dateForDate);
  case 'Q': return this.formatQuarter_(count, dateForDate);
  case 'd': return this.formatDate_(count, dateForDate);
  case 'm': return this.formatMinutes_(count, dateForTime);
  case 's': return this.formatSeconds_(count, dateForTime);
  case 'v': return this.formatTimeZoneId_(date, opt_timeZone);
  case 'z': return this.formatTimeZone_(count, date, opt_timeZone);
  case 'Z': return this.formatTimeZoneRFC_(count, date, opt_timeZone);
  default: return '';
  }
};

