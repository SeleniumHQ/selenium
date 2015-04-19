// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.testing.jsunit');
goog.require('webdriver.logging');

function convert(level, msg, name, time) {
  var recordIn = new webdriver.logging.LogRecord(level, msg, name, time);
  return webdriver.logging.Entry.fromClosureLogRecord(recordIn);
}

function checkRecord(record, level, msg, time) {
  assertEquals('wrong level', level.value, record.level.value);
  assertEquals('wrong message', msg, record.message);
  assertEquals('wrong time', time, record.timestamp);
}

function testPreferencesToJSON() {
  var prefs = new webdriver.logging.Preferences();
  assertObjectEquals({}, prefs.toJSON());

  prefs.setLevel('foo', webdriver.logging.Level.DEBUG);
  assertObjectEquals({'foo': 'DEBUG'}, prefs.toJSON());

  prefs.setLevel('bar', webdriver.logging.Level.OFF);
  prefs.setLevel('baz', webdriver.logging.Level.WARNING);
  assertObjectEquals(
      {'foo': 'DEBUG', 'bar': 'OFF', 'baz': 'WARNING'},
      prefs.toJSON());

  // CONFIG should always map to DEBUG.
  prefs.setLevel('quux', webdriver.logging.Level.CONFIG);
  assertObjectEquals(
      {'foo': 'DEBUG', 'bar': 'OFF', 'baz': 'WARNING', 'quux': 'DEBUG'},
      prefs.toJSON());

  prefs.setLevel('quot', webdriver.logging.Level.ALL);
  assertObjectEquals(
      {'foo': 'DEBUG', 'bar': 'OFF', 'baz': 'WARNING', 'quux': 'DEBUG',
       'quot': 'ALL'},
      prefs.toJSON());
}

function testConvertingLogRecords() {
  checkRecord(
      convert(goog.debug.Logger.Level.SHOUT, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.SEVERE, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.SEVERE, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.SEVERE, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.WARNING, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.WARNING, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.INFO, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.INFO, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.CONFIG, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.DEBUG, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.FINE, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.DEBUG, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.FINER, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.DEBUG, '[the.name] foo bar', 1234);
  checkRecord(
      convert(goog.debug.Logger.Level.FINEST, 'foo bar', 'the.name', 1234),
      webdriver.logging.Level.DEBUG, '[the.name] foo bar', 1234);
}
