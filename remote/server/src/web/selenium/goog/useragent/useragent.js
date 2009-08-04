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
 * @fileoverview Browser detection
 */

goog.provide('goog.userAgent');

goog.require('goog.string');


(function() {
  var isOpera = false;
  var isIe = false;
  var isWebKit = false;
  var isGecko = false;
  var isCamino = false;
  var isMac = false;
  var isWindows = false;
  var isLinux = false;
  var isMobile = false;
  var platform = '';

  // Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
  // navigator object off the global scope.
  //
  if (goog.global['navigator']) {
    var ua = navigator.userAgent;

    // Browser
    isOpera = typeof opera != 'undefined';
    isIe = !isOpera && ua.indexOf('MSIE') != -1;
    isWebKit = !isOpera && ua.indexOf('WebKit') != -1;
    // WebKit also gives navigator.product string equal to 'Gecko'.
    isMobile = isWebKit && ua.indexOf('Mobile') != -1;
    isGecko = !isOpera && navigator.product == 'Gecko' && !isWebKit;
    isCamino = isGecko && navigator.vendor == 'Camino';

    // Version
    // All browser have different ways to detect the version and they all have
    // different naming schemes
    // version is a string because it may contain 'b', 'a' and so on
    var version, re;
    if (isOpera) {
      version = opera.version();
    } else {
      if (isGecko) {
        re = /rv\:([^\);]+)(\)|;)/;
      } else if (isIe) {
        re = /MSIE\s+([^\);]+)(\)|;)/;
      } else if (isWebKit) {
        // WebKit/125.4
        re = /WebKit\/(\S+)/;
      }
      if (re) {
        re.test(ua);
        version = RegExp.$1;
      }
    }

    // Platform
    platform = navigator.platform;
    isMac = platform.indexOf('Mac') != -1;
    isWindows = platform.indexOf('Win') != -1;
    isLinux = platform.indexOf('Linux') != -1;
  }


  /**
   * Whether the user agent is Opera.
   * @type {boolean}
   */
  goog.userAgent.OPERA = isOpera;


  /**
   * Whether the user agent is Internet Explorer. This includes other browsers
   * using Trident as its rendering engine. For example AOL and Netscape 8
   * @type {boolean}
   */
  goog.userAgent.IE = isIe;


  /**
   * Whether the user agent is Gecko. Gecko is the rendering engine used by
   * Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   */
  goog.userAgent.GECKO = isGecko;


  /**
   * Whether the user agent is Camino.
   * @type {boolean}
   */
  goog.userAgent.CAMINO = isCamino;


  /**
   * Whether the user agent is WebKit. WebKit is the rendering engine that
   * Safari and Android use.
   * @type {boolean}
   */
  goog.userAgent.WEBKIT = isWebKit;


  /**
   * Used while transitioning code to use WEBKIT instead.
   * @type {boolean}
   * @deprecated
   */
  goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


  /**
   * The version of the user agent. This is a string because it might contain
   * 'b' (as in beta) as well as multiple dots.
   * @type {string}
   */
  goog.userAgent.VERSION = version;


  /**
   * The platform (operating system) the user agent is running on.
   * @type {string}
   */
  goog.userAgent.PLATFORM = platform;


  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   */
  goog.userAgent.MAC = isMac;


  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   */
  goog.userAgent.WINDOWS = isWindows;


  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   */
  goog.userAgent.LINUX = isLinux;

  /**
   * Whether the user agent is running on a mobile device.
   * @type {boolean}
   */
  goog.userAgent.MOBILE = isMobile;
})();


/**
 * Compares two version numbers.  This has been deprecated.  Please use
 * {@link goog.string.compareVersions} instead.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {Number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Whether the user agent version is higher or the same as the given version.
 * @param {string} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0;
};
