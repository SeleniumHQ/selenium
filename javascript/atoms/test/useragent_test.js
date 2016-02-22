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

/**
 * @fileoverview Common user agent tests.
 * @author joonlee@google.com (Joon Lee)
 */

goog.require('goog.dom');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var productVersion = parseFloat(goog.userAgent.product.ANDROID ?
    bot.userAgent.ANDROID_VERSION_ : goog.userAgent.product.VERSION);

var engineVersion = parseFloat(goog.userAgent.VERSION);
if (goog.userAgent.IE && !goog.dom.isCss1CompatMode() && engineVersion < 10) {
  engineVersion = 5;
}

function testIsEngineVersion() {
  assertTrue(bot.userAgent.isEngineVersion(engineVersion));
}

function testIsEngineVersionLower() {
  assertTrue(bot.userAgent.isEngineVersion(engineVersion - 1));
}

function testIsEngineVersionLittleHigher() {
  assertFalse(bot.userAgent.isEngineVersion(engineVersion + 0.00111));
}

function testIsEngineVersionHigher() {
  assertFalse(bot.userAgent.isEngineVersion(engineVersion + 1));
}

function testIsEngineVersionLetters() {
  assertTrue(bot.userAgent.isEngineVersion(engineVersion + 'a'));
}

function testIsProductVersion() {
  assertTrue(bot.userAgent.isProductVersion(productVersion));
}

function testIsProductVersionLower() {
  assertTrue(bot.userAgent.isProductVersion(productVersion - 1));
}

function testIsProductVersionHigher() {
  assertFalse(bot.userAgent.isProductVersion(productVersion + 1));
}

function testProductVersionAtLeastEngineVersion_IE() {
  if (goog.userAgent.IE) {
    assertTrue(bot.userAgent.isProductVersion(engineVersion));
  }
}

function testEngineVersionIsMajorProductVersionInStandardsMode_IE() {
  if (goog.userAgent.IE && goog.dom.isCss1CompatMode()) {
    var majorProductVersion = Math.floor(productVersion);
    assertTrue(bot.userAgent.isEngineVersion(majorProductVersion));
  }
}
