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
  assertFalse(bot.userAgent.isEngineVersion(engineVersion + 0.111));
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
