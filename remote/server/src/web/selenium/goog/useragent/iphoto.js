// Copyright 2007 Google Inc.
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
 * @fileoverview Newer versions of iPhoto include a Safari plugin which allows
 * the browser to detect if iPhoto is installed. Adapted from detection code
 * built into the Mac.com Gallery RSS feeds.
 */


goog.provide('goog.userAgent.iphoto');

goog.require('goog.userAgent');


(function() {
  var hasIphoto = false;
  var version = '';

  /**
   * The plugin description string contains the version number as in the form
   * 'iPhoto 700'. This returns just the version number as a dotted string,
   * e.g., '7.0.0', compatible with goog.userAgent.compare.
   * @param {string} desc The version string.
   * @return {string} The dotted version.
   */
  function getIphotoVersion(desc) {
    var matches = desc.match(/\d/g);
    return matches.join('.');
  }

  if (goog.userAgent.WEBKIT &&
      navigator.mimeTypes &&
      navigator.mimeTypes.length > 0) {
    var iphoto = navigator.mimeTypes['application/photo'];

    if (iphoto) {
      var hasIphoto = true;
      var description = iphoto['description'];

      if (description) {
        version = getIphotoVersion(description);
      }
    }
  }

  /**
   * Whether we can detect that the user has iPhoto installed.
   * @type {boolean}
   */
  goog.userAgent.iphoto.HAS_IPHOTO = hasIphoto;


  /**
   * The version of iPhoto installed if found.
   * @type {string}
   */
  goog.userAgent.iphoto.VERSION = version;

})();


/**
 * Whether the installed version of iPhoto is as new or newer than a given
 * version.
 * @param {string} version The version to check.
 * @return {boolean} Whether the installed version of iPhoto is as new or newer
 *     than a given version.
 */
goog.userAgent.iphoto.isVersion = function(version) {
  return goog.userAgent.compare(goog.userAgent.iphoto.VERSION, version) >= 0;
};
