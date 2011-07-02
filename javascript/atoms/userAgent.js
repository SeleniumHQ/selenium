// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Similar to goog.userAgent.isVersion, but with support for
 * getting the version information when running in a firefox extension.
 */
goog.provide('bot.userAgent');

goog.require('goog.userAgent');
goog.require('goog.userAgent.product.isVersion');


/**
 * @param {string|number} version The version number to check.
 * @return {boolean} Whether the browser version is the same or higher than
 *    version.
 */
bot.userAgent.isVersion = function(version) {
  if (goog.userAgent.getUserAgentString()) {
    // Common case
    return goog.userAgent.product.isVersion(version);
  }
  
  // This code path is only hit in a firefox extension
  if (goog.userAgent.GECKO && Components && Components['classes']) {
    var cc = Components['classes'];
    var ci = Components['interfaces'];
    var appInfo = cc["@mozilla.org/xre/app-info;1"].
        getService(ci['nsIXULAppInfo']);
    var versionChecker = cc["@mozilla.org/xpcom/version-comparator;1"].
        getService(ci['nsIVersionComparator']);

    return versionChecker.compare(appInfo.platformVersion, '' + version) >= 0;
  }

  // Fail stupid
  return false;
};


/**
 * @return {boolean} Whether this is FF4 or newer.
 */
bot.userAgent.isFirefox4 = function() {
  return goog.userAgent.GECKO && bot.userAgent.isVersion('4.0b1');
};
