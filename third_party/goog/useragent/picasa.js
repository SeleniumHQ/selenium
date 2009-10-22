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
 * @fileoverview Detection for whether the user has Picasa installed.
 * Only Picasa versions 2 and later can be detected, and only from Firefox or
 * Internet Explorer. Picasa for Linux cannot be detected.
 *
 * In the future, Picasa may provide access to the installed version number,
 * but until then we can only detect that Picasa 2 or later is present.
 *
 * To check for Picasa on Internet Explorer requires using document.write, so
 * this file must be included at page rendering time and cannot be imported
 * later as part of a dynamically loaded module.
 */


goog.provide('goog.userAgent.picasa');

goog.require('goog.userAgent');


/**
 * Variable name used to temporarily save the Picasa state in the global object
 * in Internet Explorer.
 * @type {string}
 * @private
 */
goog.userAgent.picasa.IE_HAS_PICASA_ = 'hasPicasa';


(function() {
  var hasPicasa = false;

  if (goog.userAgent.IE) {
    // In Internet Explorer, Picasa 2 can be detected using conditional comments
    // due to some nice registry magic. The precise version number is not
    // available, only the major version. This may be updated for Picasa 3. This
    // check must pollute the global namespace.
    goog.global[goog.userAgent.picasa.IE_HAS_PICASA_] = hasPicasa;

    document.write(
      '<!--[if gte Picasa 2]>' +
      '<script type="text/javascript">' +
        'this.' + goog.userAgent.picasa.IE_HAS_PICASA_ + '=true;' +
      '</script>' +
      '<![endif]-->');

    hasPicasa = goog.global[goog.userAgent.picasa.IE_HAS_PICASA_];

    // Unset the variable in a crude attempt to leave no trace.
    goog.global[goog.userAgent.picasa.IE_HAS_PICASA_] = undefined;

  } else if (navigator.mimeTypes &&
             navigator.mimeTypes['application/x-picasa-detect']) {
    // Picasa 2.x registers a file handler for the MIME-type
    // 'application/x-picasa-detect' for detection in Firefox. Future versions
    // may make precise version detection possible.
    hasPicasa = true;
  }

  /**
   * Whether we detect the user has Picasa installed.
   * @type {boolean}
   */
  goog.userAgent.picasa.HAS_PICASA = hasPicasa;


  /**
   * The installed version of Picasa. If Picasa is detected, this means it is
   * version 2 or later. The precise version number is not yet available to the
   * browser, this is a placeholder for later versions of Picasa.
   * @type {string}
   */
  goog.userAgent.picasa.VERSION = hasPicasa ? '2' : '';

})();


/**
 * Whether the installed Picasa version is as new or newer than a given version.
 * This is not yet relevant, we can't detect the true Picasa version number yet,
 * but this may be possible in future Picasa releases.
 * @param {string} version The version to check.
 * @return {boolean} Whether the installed Picasa version is as new or newer
 *     than a given version.
 */
goog.userAgent.picasa.isVersion = function(version) {
  return goog.userAgent.compare(goog.userAgent.picasa.VERSION, version) >= 0;
};
