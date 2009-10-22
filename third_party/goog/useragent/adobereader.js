// Copyright 2008 Google Inc.
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
 * @fileoverview Detects the Adobe Reader PDF browser plugin.
 */


goog.provide('goog.userAgent.adobeReader');

goog.require('goog.userAgent');


(function() {
  var version = null;
  if (goog.userAgent.IE) {
    function detectOnIe(classId) {
      /** @preserveTry */
      try {
        new ActiveXObject(classId);
        return true;
      } catch (ex) {
        return false;
      }
    }
    if (detectOnIe('AcroPDF.PDF.1')) {
      version = '7';
    } else if (detectOnIe('PDF.PdfCtrl.6')) {
      version = '6';
    }
  } else {
    if (navigator.mimeTypes && navigator.mimeTypes.length > 0) {
      var mimeType = navigator.mimeTypes['application/pdf'];
      if (mimeType && mimeType.enabledPlugin) {
        var description = mimeType.enabledPlugin.description;
        if (description && description.indexOf('Adobe') != -1) {
          // Newer plugins do not include the version in the description, so we
          // default to 7.
          version = (description.indexOf('Version') != -1) ?
              description.split('Version')[1] : '7';
        }
      }
    }
  }

  /**
   * Whether we detect the user has the Adobe Reader browser plugin installed.
   * @type {boolean}
   */
  goog.userAgent.adobeReader.HAS_READER = !!version;


  /**
   * The version of the installed Adobe Reader plugin. Versions after 7
   * will all be reported as '7'.
   * @type {string}
   */
  goog.userAgent.adobeReader.VERSION = version;


  /**
   * On certain combinations of platform/browser/plugin, a print dialog
   * can be shown for PDF files without a download dialog or making the
   * PDF visible to the user, by loading the PDF into a hidden iframe.
   *
   * Currently this variable is true if Adobe Reader version 6 or later
   * is detected on Windows.
   *
   * @type {boolean}
   */
  goog.userAgent.adobeReader.SILENT_PRINT = goog.userAgent.WINDOWS &&
      goog.userAgent.compare(version, '6') >= 0;

})();
