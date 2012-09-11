// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 *
 * @author brenneman@google.com (Shawn Brenneman)
 * @see ../demos/useragent.html
 */


goog.provide('goog.userAgent.picasa');

goog.require('goog.string');
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

    // NOTE(user): Some browsers do not like seeing
    // slash-script anywhere in the text even if it's inside a string
    // and escaped with a backslash, make a string in a way that
    // avoids problems.

    document.write(goog.string.subs(
        '<!--[if gte Picasa 2]>' +
        '<%s>' +
        'this.%s=true;' +
        '</%s>' +
        '<![endif]-->',
        'script', goog.userAgent.picasa.IE_HAS_PICASA_, 'script'));

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
  return goog.string.compareVersions(
      goog.userAgent.picasa.VERSION, version) >= 0;
};
