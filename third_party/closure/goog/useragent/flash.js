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
 * @fileoverview Flash detection.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent.flash');

goog.require('goog.string');

(function() {
  /**
   * Derived from Apple's suggested sniffer.
   * @param {string} desc e.g. Shockwave Flash 7.0 r61.
   * @return {string} 7.0.61.
   */
  function getFlashVersion(desc) {
    var matches = desc.match(/[\d]+/g);
    matches.length = 3;  // To standardize IE vs FF
    return matches.join('.');
  }

  var hasFlash = false;
  var flashVersion = '';

  if (navigator.plugins && navigator.plugins.length) {
    var plugin = navigator.plugins['Shockwave Flash'];
    if (plugin) {
      hasFlash = true;
      if (plugin.description) {
        flashVersion = getFlashVersion(plugin.description);
      }
    }

    if (navigator.plugins['Shockwave Flash 2.0']) {
      hasFlash = true;
      flashVersion = '2.0.0.11';
    }

  } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
    var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
    hasFlash = mimeType && mimeType.enabledPlugin;
    if (hasFlash) {
      flashVersion = getFlashVersion(mimeType.enabledPlugin.description);
    }

  } else {
    /** @preserveTry */
    try {
      // Try 7 first, since we know we can use GetVariable with it
      var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
      hasFlash = true;
      flashVersion = getFlashVersion(ax.GetVariable('$version'));
    } catch (e) {
      // Try 6 next, some versions are known to crash with GetVariable calls
      /** @preserveTry */
      try {
        var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
        hasFlash = true;
        flashVersion = '6.0.21';  // First public version of Flash 6
      } catch (e2) {
        /** @preserveTry */
        try {
          // Try the default activeX
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          hasFlash = true;
          flashVersion = getFlashVersion(ax.GetVariable('$version'));
        } catch (e3) {
          // No flash
        }
      }
    }
  }

  /**
   * Whether we can detect that the browser has flash
   * @type {boolean}
   */
  goog.userAgent.flash.HAS_FLASH = hasFlash;


  /**
   * Full version information of flash installed, in form 7.0.61
   * @type {string}
   */
  goog.userAgent.flash.VERSION = flashVersion;

})();


/**
 * Whether the installed flash version is as new or newer than a given version.
 * @param {string} version The version to check.
 * @return {boolean} Whether the installed flash version is as new or newer
 *     than a given version.
 */
goog.userAgent.flash.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.flash.VERSION,
                                     version) >= 0;
};
