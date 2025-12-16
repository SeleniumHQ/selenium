// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.date.relativeCommonTests');
goog.setTestOnly('goog.date.relativeCommonTests');

goog.require('goog.date.DateTime');
goog.require('goog.date.relative');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimePatterns_ar');
goog.require('goog.i18n.DateTimePatterns_bn');
goog.require('goog.i18n.DateTimePatterns_es');
goog.require('goog.i18n.DateTimePatterns_fa');
goog.require('goog.i18n.DateTimePatterns_fr');
goog.require('goog.i18n.DateTimePatterns_no');
goog.require('goog.i18n.DateTimeSymbols_ar');
goog.require('goog.i18n.DateTimeSymbols_bn');
goog.require('goog.i18n.DateTimeSymbols_es');
goog.require('goog.i18n.DateTimeSymbols_fa');
goog.require('goog.i18n.DateTimeSymbols_fr');
goog.require('goog.i18n.DateTimeSymbols_no');
goog.require('goog.i18n.NumberFormatSymbols_bn');
goog.require('goog.i18n.NumberFormatSymbols_en');
goog.require('goog.i18n.NumberFormatSymbols_fa');
goog.require('goog.i18n.NumberFormatSymbols_no');
goog.require('goog.i18n.relativeDateTimeSymbols');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');


// Testing stubs that autoreset after each test run.
var stubs = new goog.testing.PropertyReplacer();

// Timestamp to base times for test on.
var baseTime = new Date(2009, 2, 23, 14, 31, 6).getTime();

var RelativeDateTimeSymbols;

var propertyReplacer = new goog.testing.PropertyReplacer();

function setUpPage() {
  // Ensure goog.now returns a constant timestamp.
  propertyReplacer.replace(goog, 'now', function() {
    return baseTime;
  });
  propertyReplacer.replace(goog, 'LOCALE', 'en-US');

  RelativeDateTimeSymbols =
      goog.module.get('goog.i18n.relativeDateTimeSymbols');
}

function setUp() {
  propertyReplacer.replace(goog, 'LOCALE', 'en-US');
  goog.i18n.NumberFormatSymbols = goog.i18n.NumberFormatSymbols_en;
}

function tearDown() {
  stubs.reset();

  // Resets state to default English
  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_en);
}

function testFormatRelativeForPastDates() {
  var fn = goog.date.relative.format;

  assertEquals(
      'Should round seconds to the minute below', '0 minutes ago',
      fn(timestamp('23 March 2009 14:30:10')));

  assertEquals(
      'Should round seconds to the minute below', '1 minute ago',
      fn(timestamp('23 March 2009 14:29:56')));

  assertEquals(
      'Should round seconds to the minute below', '2 minutes ago',
      fn(timestamp('23 March 2009 14:29:00')));

  assertEquals('10 minutes ago', fn(timestamp('23 March 2009 14:20:10')));
  assertEquals('59 minutes ago', fn(timestamp('23 March 2009 13:31:42')));
  assertEquals('2 hours ago', fn(timestamp('23 March 2009 12:20:56')));
  assertEquals('23 hours ago', fn(timestamp('22 March 2009 15:30:56')));
  assertEquals('1 day ago', fn(timestamp('22 March 2009 12:11:04')));
  assertEquals('1 day ago', fn(timestamp('22 March 2009 00:00:00')));
  assertEquals('2 days ago', fn(timestamp('21 March 2009 23:59:59')));
  assertEquals('2 days ago', fn(timestamp('21 March 2009 10:30:56')));
  assertEquals('2 days ago', fn(timestamp('21 March 2009 00:00:00')));
  assertEquals('3 days ago', fn(timestamp('20 March 2009 23:59:59')));
}

function testFormatRelativeForFutureDates() {
  var fn = goog.date.relative.format;

  assertEquals(
      'Should round seconds to the minute below', 'in 1 minute',
      fn(timestamp('23 March 2009 14:32:05')));

  assertEquals(
      'Should round seconds to the minute below', 'in 2 minutes',
      fn(timestamp('23 March 2009 14:33:00')));

  assertEquals('in 1 minute', fn(timestamp('23 March 2009 14:32:00')));
  assertEquals('in 10 minutes', fn(timestamp('23 March 2009 14:40:10')));
  assertEquals('in 59 minutes', fn(timestamp('23 March 2009 15:29:15')));
  assertEquals('in 2 hours', fn(timestamp('23 March 2009 17:20:56')));
  assertEquals('in 23 hours', fn(timestamp('24 March 2009 13:30:56')));
  assertEquals('in 1 day', fn(timestamp('24 March 2009 14:31:07')));
  assertEquals('in 1 day', fn(timestamp('24 March 2009 16:11:04')));
  assertEquals('in 1 day', fn(timestamp('24 March 2009 23:59:59')));
  assertEquals('in 2 days', fn(timestamp('25 March 2009 00:00:00')));
  assertEquals('in 2 days', fn(timestamp('25 March 2009 10:30:56')));
  assertEquals('in 2 days', fn(timestamp('25 March 2009 23:59:59')));
  assertEquals('in 3 days', fn(timestamp('26 March 2009 00:00:00')));
}


function testFormatPast() {
  var fn = goog.date.relative.formatPast;

  assertEquals('59 minutes ago', fn(timestamp('23 March 2009 13:31:42')));
  assertEquals('0 minutes ago', fn(timestamp('23 March 2009 14:32:05')));
  assertEquals('0 minutes ago', fn(timestamp('23 March 2009 14:33:00')));
  assertEquals('0 minutes ago', fn(timestamp('25 March 2009 10:30:56')));
}


function testFormatDayNotShort() {
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);

  var fn = goog.date.relative.formatDay;
  assertEquals('Sep 25', fn(timestamp('25 September 2009 10:31:06')));
  assertEquals('Mar 25', fn(timestamp('25 March 2009 00:12:19')));
}

function testFormatDay() {
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);

  var fn = goog.date.relative.formatDay;
  var formatter =
      new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.SHORT_DATE);
  var format = goog.bind(formatter.format, formatter);

  assertEquals('Sep 25', fn(timestamp('25 September 2009 10:31:06')));
  assertEquals('Mar 25', fn(timestamp('25 March 2009 00:12:19')));

  goog.date.relative.setCasingMode(false);
  assertEquals('tomorrow', fn(timestamp('24 March 2009 10:31:06')));
  assertEquals('tomorrow', fn(timestamp('24 March 2009 00:12:19')));
  assertEquals('today', fn(timestamp('23 March 2009 10:31:06')));
  assertEquals('today', fn(timestamp('23 March 2009 00:12:19')));
  assertEquals('yesterday', fn(timestamp('22 March 2009 23:48:12')));
  assertEquals('yesterday', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('Mar 21', fn(timestamp('21 March 2009 15:54:45')));
  assertEquals('Mar 19', fn(timestamp('19 March 2009 01:22:11')));

  // Test that a formatter can also be accepted as input.
  goog.date.relative.setCasingMode(true);

  assertEquals('Tomorrow', fn(timestamp('24 March 2009 10:31:06')));
  assertEquals('Tomorrow', fn(timestamp('24 March 2009 00:12:19')));
  assertEquals('Today', fn(timestamp('23 March 2009 10:31:06'), format));
  assertEquals('Today', fn(timestamp('23 March 2009 00:12:19'), format));
  assertEquals('Yesterday', fn(timestamp('22 March 2009 23:48:12'), format));
  assertEquals('Yesterday', fn(timestamp('22 March 2009 04:11:23'), format));

  goog.date.relative.setCasingMode(false);
  assertEquals('today', fn(timestamp('23 March 2009 10:31:06'), format));
  assertEquals('today', fn(timestamp('23 March 2009 00:12:19'), format));
  assertEquals('yesterday', fn(timestamp('22 March 2009 23:48:12'), format));
  assertEquals('yesterday', fn(timestamp('22 March 2009 04:11:23'), format));

  var expected = format(gdatetime(timestamp('21 March 2009 15:54:45')));
  assertEquals(expected, fn(timestamp('21 March 2009 15:54:45'), format));
  expected = format(gdatetime(timestamp('19 March 2009 01:22:11')));
  assertEquals(expected, fn(timestamp('19 March 2009 01:22:11'), format));

  expected = format(gdatetime(timestamp('1 January 2010 01:22:11')));
  assertEquals(expected, fn(timestamp('1 January 2010 01:22:11'), format));
}

function testGetDateString() {
  var fn = goog.date.relative.getDateString;

  assertEquals(
      '2:21 PM (10 minutes ago)', fn(new Date(baseTime - 10 * 60 * 1000)));
  assertEquals(
      '4:31 AM (10 hours ago)', fn(new Date(baseTime - 10 * 60 * 60 * 1000)));
  assertEquals(
      'Friday, March 13, 2009 (10 days ago)',
      fn(new Date(baseTime - 10 * 24 * 60 * 60 * 1000)));
  assertEquals(
      'Tuesday, March 3, 2009',
      fn(new Date(baseTime - 20 * 24 * 60 * 60 * 1000)));

  // Test that goog.date.DateTime can also be accepted as input.
  assertEquals(
      '2:21 PM (10 minutes ago)', fn(gdatetime(baseTime - 10 * 60 * 1000)));
  assertEquals(
      '4:31 AM (10 hours ago)', fn(gdatetime(baseTime - 10 * 60 * 60 * 1000)));
  assertEquals(
      'Friday, March 13, 2009 (10 days ago)',
      fn(gdatetime(baseTime - 10 * 24 * 60 * 60 * 1000)));
  assertEquals(
      'Tuesday, March 3, 2009',
      fn(gdatetime(baseTime - 20 * 24 * 60 * 60 * 1000)));
}

function testGetPastDateString() {
  var fn = goog.date.relative.getPastDateString;
  assertEquals(
      '2:21 PM (10 minutes ago)', fn(new Date(baseTime - 10 * 60 * 1000)));
  assertEquals(
      '2:30 PM (1 minute ago)', fn(new Date(baseTime - 1 * 60 * 1000)));
  assertEquals(
      '2:41 PM (0 minutes ago)', fn(new Date(baseTime + 10 * 60 * 1000)));

  // Test that goog.date.DateTime can also be accepted as input.
  assertEquals(
      '2:21 PM (10 minutes ago)', fn(gdatetime(baseTime - 10 * 60 * 1000)));
  assertEquals('2:31 PM (0 minutes ago)', fn(gdatetime(baseTime)));
  assertEquals(
      '2:30 PM (1 minute ago)', fn(gdatetime(baseTime - 1 * 60 * 1000)));
  assertEquals(
      '2:41 PM (0 minutes ago)', fn(gdatetime(baseTime + 10 * 60 * 1000)));
}

// Test for non-English locales, too.
function testFormatSpanish() {
  var fn = goog.date.relative.formatDay;

  propertyReplacer.replace(goog, 'LOCALE', 'es');

  // Spanish locale 'es'
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_es);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_es);

  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_es);

  // Checks casing issues.
  goog.date.relative.setCasingMode(true);

  assertEquals('Pasado mañana', fn(timestamp('25 March 2009 20:59:59')));
  assertEquals('Anteayer', fn(timestamp('21 March 2009 19:00:02')));

  assertEquals('Ayer', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('Hoy', fn(timestamp('23 March 2009 14:11:23')));
  assertEquals('Mañana', fn(timestamp('24 March 2009 12:10:23')));

  goog.date.relative.setCasingMode(false);
  assertEquals('pasado mañana', fn(timestamp('25 March 2009 20:59:59')));
  assertEquals('anteayer', fn(timestamp('21 March 2009 19:00:02')));

  assertEquals('ayer', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('hoy', fn(timestamp('23 March 2009 14:11:23')));
  assertEquals('mañana', fn(timestamp('24 March 2009 12:10:23')));

  // Outside the range. These should be localized.
  assertEquals('26 mar.', fn(timestamp('26 March 2009 12:10:23')));  //
  assertEquals('28 feb.', fn(timestamp('28 February 2009 12:10:23')));

  fn = goog.date.relative.format;

  assertEquals(
      'Should round seconds to the minute below', 'dentro de 1 minuto',
      fn(timestamp('23 March 2009 14:32:05')));
  assertEquals(
      'Should round seconds to the minute below', 'dentro de 9 minutos',
      fn(timestamp('23 March 2009 14:39:07')));

  assertEquals(
      'Should round days to the day below', 'dentro de 1 día',
      fn(timestamp('24 March 2009 14:32:05')));
  assertEquals(
      'Should round days to the day below', 'dentro de 8 días',
      fn(timestamp('31 March 2009 14:39:07')));

  assertEquals(
      'Should round hours to the hour below', 'hace 1 hora',
      fn(timestamp('23 March 2009 13:31:05')));
  assertEquals(
      'Should round hour to the hour below', 'hace 8 horas',
      fn(timestamp('23 March 2009 06:31:04')));
}

function testFormatFrench() {
  var fn = goog.date.relative.formatDay;

  // Frence locale 'fr'
  propertyReplacer.replace(goog, 'LOCALE', 'fr');

  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_fr);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_fr);

  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_fr);

  // Check for casing results.
  goog.date.relative.setCasingMode(true);
  assertEquals('Après-demain', fn(timestamp('25 March 2009 20:59:59')));
  assertEquals('Avant-hier', fn(timestamp('21 March 2009 19:00:02')));

  assertEquals('Hier', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('Aujourd’hui', fn(timestamp('23 March 2009 14:11:23')));
  assertEquals('Demain', fn(timestamp('24 March 2009 12:10:23')));

  goog.date.relative.setCasingMode(false);
  assertEquals('après-demain', fn(timestamp('25 March 2009 20:59:59')));
  assertEquals('avant-hier', fn(timestamp('21 March 2009 19:00:02')));

  assertEquals('hier', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('aujourd’hui', fn(timestamp('23 March 2009 14:11:23')));
  assertEquals('demain', fn(timestamp('24 March 2009 12:10:23')));

  // Outside the range. These should be localized.
  assertEquals('26 mars', fn(timestamp('26 March 2009 12:10:23')));  //
  assertEquals('28 févr.', fn(timestamp('28 February 2009 12:10:23')));
  fn = goog.date.relative.format;

  assertEquals(
      'Should round seconds to the minute below', 'dans 1 minute',
      fn(timestamp('23 March 2009 14:32:05')));
  assertEquals(
      'Should round seconds to the minute below', 'dans 9 minutes',
      fn(timestamp('23 March 2009 14:39:07')));

  assertEquals(
      'Should round days to the day below', 'dans 1 jour',
      fn(timestamp('24 March 2009 14:32:05')));
  assertEquals(
      'Should round days to the day below', 'dans 8 jours',
      fn(timestamp('31 March 2009 14:39:07')));

  assertEquals(
      'Should round hours to the hour below', 'il y a 1 heure',
      fn(timestamp('23 March 2009 13:31:05')));
  assertEquals(
      'Should round hour to the hour below', 'il y a 8 heures',
      fn(timestamp('23 March 2009 06:31:04')));
}

function testFormatArabic() {
  var fn = goog.date.relative.formatDay;

  propertyReplacer.replace(goog, 'LOCALE', 'ar');

  // Arabic locale 'ar'
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_ar);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_ar);

  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_ar);

  assertEquals('بعد الغد', fn(timestamp('25 March 2009 20:59:59')));
  assertEquals('أول أمس', fn(timestamp('21 March 2009 19:00:02')));

  assertEquals('أمس', fn(timestamp('22 March 2009 04:11:23')));
  assertEquals('اليوم', fn(timestamp('23 March 2009 14:11:23')));
  assertEquals('غدًا', fn(timestamp('24 March 2009 12:10:23')));

  // Outside the range. These should be localized.
  assertEquals('26 مارس', fn(timestamp('26 March 2009 12:10:23')));  //
  assertEquals('28 فبراير', fn(timestamp('28 February 2009 12:10:23')));
}

/* Tests for non-ASCII digits in formatter results */

function testFormatRelativeForPastDatesPersianDigits() {
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_fa);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_fa);
  stubs.set(goog.i18n, 'NumberFormatSymbols', goog.i18n.NumberFormatSymbols_fa);

  var fn = goog.date.relative.format;

  // The text here is English, as it comes from localized resources, not
  // from CLDR. It works properly in production, but it's not loaded here.
  // Will need to wait for CLDR 24, when the data we need will be available,
  // so that we can add it to DateTimeSymbols and out of localization.

  // For Persian \u06F0 is the base, so \u6F0 = digit 0, \u6F5 = digit 5 ...
  // "Western" digits in square brackets for convenience

  propertyReplacer.replace(goog, 'LOCALE', 'en-u-nu-arabext');
  assertEquals(
      'Should round seconds to the minute below',
      localizeNumber(0) + ' minutes ago',  // ۰ minutes ago
      fn(timestamp('23 March 2009 14:30:10')));

  assertEquals(
      'Should round seconds to the minute below',
      localizeNumber(1) + ' minute ago',  // ۱ minute ago
      fn(timestamp('23 March 2009 14:29:56')));

  assertEquals(
      'Should round seconds to the minute below',
      localizeNumber(2) + ' minutes ago',  // ۲ minutes ago
      fn(timestamp('23 March 2009 14:29:00')));

  assertEquals(
      localizeNumber(10) + ' minutes ago',  // ۱۰ minutes ago
      fn(timestamp('23 March 2009 14:20:10')));
  assertEquals(
      localizeNumber(59) + ' minutes ago',  // ۵۹ minutes ago
      fn(timestamp('23 March 2009 13:31:42')));
  assertEquals(
      localizeNumber(2) + ' hours ago',  // ۲ hours ago
      fn(timestamp('23 March 2009 12:20:56')));
  assertEquals(
      localizeNumber(23) + ' hours ago',  // ۲۳ hours ago
      fn(timestamp('22 March 2009 15:30:56')));
  assertEquals(
      localizeNumber(1) + ' day ago',  // ۱ day ago
      fn(timestamp('22 March 2009 12:11:04')));
  assertEquals(
      localizeNumber(1) + ' day ago',  // ۱ day ago
      fn(timestamp('22 March 2009 00:00:00')));
  assertEquals(
      localizeNumber(2) + ' days ago',  // ۲ days ago
      fn(timestamp('21 March 2009 23:59:59')));
  assertEquals(
      localizeNumber(2) + ' days ago',  // ۲ days ago
      fn(timestamp('21 March 2009 10:30:56')));
  assertEquals(
      localizeNumber(2) + ' days ago',  // ۲ days ago
      fn(timestamp('21 March 2009 00:00:00')));
  assertEquals(
      localizeNumber(3) + ' days ago',  // ۳ days ago
      fn(timestamp('20 March 2009 23:59:59')));

  propertyReplacer.replace(goog, 'LOCALE', 'fa');
  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_fa);

  const result1 = fn(timestamp('21 March 2009 10:30:56'));
  assertEquals('۲ روز پیش', result1);
}

function testFormatRelativeForFutureDatesBengaliDigits() {
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_bn);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_bn);
  stubs.set(goog.i18n, 'NumberFormatSymbols', goog.i18n.NumberFormatSymbols_bn);

  // Get Bengali digits
  propertyReplacer.replace(goog, 'LOCALE', 'en-u-nu-beng');

  var fn = goog.date.relative.format;

  // For Bengali \u09E6 is the base, so \u09E6 = digit 0, \u09EB = digit 5
  // "Western" digits in square brackets for convenience
  assertEquals(
      'Should round seconds to the minute below',
      'in ' + localizeNumber(1) + ' minute',  // in ১ minute
      fn(timestamp('23 March 2009 14:32:05')));

  assertEquals(
      'Should round seconds to the minute below',
      'in ' + localizeNumber(2) + ' minutes',  // in ২ minutes
      fn(timestamp('23 March 2009 14:33:00')));

  assertEquals(
      'in ' + localizeNumber(10) + ' minutes',  // in ১০ minutes
      fn(timestamp('23 March 2009 14:40:10')));
  assertEquals(
      'in ' + localizeNumber(59) + ' minutes',  // in ৫৯ minutes
      fn(timestamp('23 March 2009 15:29:15')));
  assertEquals(
      'in ' + localizeNumber(2) + ' hours',  // in ২ hours
      fn(timestamp('23 March 2009 17:20:56')));
  assertEquals(
      'in ' + localizeNumber(23) + ' hours',  // in ২৩ hours
      fn(timestamp('24 March 2009 13:30:56')));
  assertEquals(
      'in ' + localizeNumber(1) + ' day',  // in ১ day
      fn(timestamp('24 March 2009 14:31:07')));
  assertEquals(
      'in ' + localizeNumber(1) + ' day',  // in ১ day
      fn(timestamp('24 March 2009 16:11:04')));
  assertEquals(
      'in ' + localizeNumber(1) + ' day',  // in ১ day
      fn(timestamp('24 March 2009 23:59:59')));
  assertEquals(
      'in ' + localizeNumber(2) + ' days',  // in ২ days
      fn(timestamp('25 March 2009 00:00:00')));
  assertEquals(
      'in ' + localizeNumber(2) + ' days',  // in ২ days
      fn(timestamp('25 March 2009 10:30:56')));
  assertEquals(
      'in ' + localizeNumber(2) + ' days',  // in ২ days
      fn(timestamp('25 March 2009 23:59:59')));
  assertEquals(
      'in ' + localizeNumber(3) + ' days',  // in ৩ days
      fn(timestamp('26 March 2009 00:00:00')));

  // Try Bengali text and numerals, too.
  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_bn);

  propertyReplacer.replace(goog, 'LOCALE', 'bn');

  // For Bengali \u09E6 is the base, so \u09E6 = digit 0, \u09EB = digit 5
  // "Western" digits in square brackets for convenience

  const result1 = fn(timestamp('23 March 2009 14:32:05'));
  assertEquals('Should round seconds to the minute below', '১ মিনিটে', result1);

  const result2 = fn(timestamp('26 March 2009 00:00:00'));
  assertEquals(
      'Should be Bengali text with Bengali digit.', '৩ দিনের মধ্যে', result2);
}

function testFormatRelativeForFutureDatesNorwegian() {
  stubs.set(goog.date.relative, 'monthDateFormatter_', null);
  stubs.set(goog.i18n, 'DateTimeSymbols', goog.i18n.DateTimeSymbols_no);
  stubs.set(goog.i18n, 'DateTimePatterns', goog.i18n.DateTimePatterns_no);
  stubs.set(goog.i18n, 'NumberFormatSymbols', goog.i18n.NumberFormatSymbols_no);

  RelativeDateTimeSymbols.setRelativeDateTimeSymbols(
      RelativeDateTimeSymbols.RelativeDateTimeSymbols_no);

  // For a locale not in the ECMASCRIPT locale set.
  propertyReplacer.replace(goog, 'LOCALE', 'no');

  var fn = goog.date.relative.format;
  assertEquals('om 1 minutt', fn(timestamp('23 March 2009 14:32:05')));
}

/**
 * Quick conversion to national digits, to increase readability of the
 * tests above.
 * @param {string|number} value
 * @return {string}
 */
function localizeNumber(value) {
  if (typeof value == 'number') {
    value = value.toString();
  }
  return goog.i18n.DateTimeFormat.localizeNumbers(value);
}

/**
 * Create google DateTime object from timestamp
 * @param {number} timestamp
 * @return {!goog.date.DateTime}
 */

function gdatetime(timestamp) {
  return new goog.date.DateTime(new Date(timestamp));
}

/**
 * Create timestamp for specified time.
 * @param {string} str
 * @return {number}
 */
function timestamp(str) {
  return new Date(str).getTime();
}

function testUpcasing() {
  // Tests package function that sentence-cases a string.
  var fn = goog.date.relative.upcase;

  assertEquals('today', 'Today', fn('today'));

  assertEquals('Today', 'Today', fn('Today'));

  assertEquals('TODAY', 'TODAY', fn('TODAY'));

  assertEquals('tODAY', 'TODAY', fn('tODAY'));

  // Non-ascii
  assertEquals('', 'Ābc', fn('ābc'));

  assertEquals('', 'Ābc', fn('Ābc'));

  // Greek
  assertEquals('Greek 1', '\u0391\u03b2\u03b3', fn('\u0391\u03b2\u03b3'));

  assertEquals('Greek 2', '\u0391\u03b2\u03b3', fn('\u03b1\u03b2\u03b3'));

  // Cyrillic
  assertEquals('Cyrillic', 'Ађё', fn('ађё'));

  // Adlam, SMP, cased
  assertEquals('Adlam', '‮𞤀𞤦𞤷', fn('‮𞤀𞤦𞤷'));

  // Chakma, SMP, uncased
  assertEquals('Chakma', '𑄃𑄬𑄌𑄴𑄥𑄳𑄠', fn('𑄃𑄬𑄌𑄴𑄥𑄳𑄠'));
}
