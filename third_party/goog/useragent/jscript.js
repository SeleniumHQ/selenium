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
 * @fileoverview Detection of JScript version.
 */


goog.provide('goog.userAgent.jscript');

goog.require('goog.string');


(function() {
  var hasScriptEngine = 'ScriptEngine' in goog.global;
  var hasJscript = false;
  var version = '0';

  if (hasScriptEngine) {
    hasJscript = goog.global['ScriptEngine']() == 'JScript';
    if (hasJscript) {
      version = goog.global['ScriptEngineMajorVersion']() + '.' +
          goog.global['ScriptEngineMinorVersion']() + '.' +
          goog.global['ScriptEngineBuildVersion']();
    }
  }

  /**
   * Whether we detect that the user agent is using Microsoft JScript.
   * @type {boolean}
   */
  goog.userAgent.jscript.HAS_JSCRIPT = hasJscript;


  /**
   * The installed version of JScript.
   * @type {string}
   */
  goog.userAgent.jscript.VERSION = version;

})();


/**
 * Whether the installed version of JScript is as new or newer than a given
 * version.
 * @param {string} version The version to check.
 * @return {boolean} Whether the installed version of JScript is as new or
 *     newer than the given version.
 */
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION,
                                     version) >= 0;
};
