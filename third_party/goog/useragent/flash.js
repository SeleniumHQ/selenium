// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Flash detection
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
      } catch (e) {
        /** @preserveTry */
        try {
          // Try the default activeX
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          hasFlash = true;
          flashVersion = getFlashVersion(ax.GetVariable('$version'));
        } catch (e) {
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
