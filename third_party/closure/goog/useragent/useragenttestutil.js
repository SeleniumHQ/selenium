// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Shared test function to reset the constants in
 * goog.userAgent.*
 */

goog.provide('goog.userAgentTestUtil');
goog.provide('goog.userAgentTestUtil.UserAgents');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.engine');
goog.require('goog.userAgent');
goog.require('goog.userAgent.keyboard');
goog.require('goog.userAgent.platform');
goog.require('goog.userAgent.product');
/** @suppress {extraRequire} */
goog.require('goog.userAgent.product.isVersion');

goog.setTestOnly('goog.userAgentTestUtil');


/**
 * Rerun the initialization code to set all of the goog.userAgent constants.
 * @suppress {accessControls}
 */
goog.userAgentTestUtil.reinitializeUserAgent = function() {
  // Unfortunately we can't isolate the useragent setting in a function
  // we can call, because things rely on it compiling to nothing when
  // one of the ASSUME flags is set, and the compiler isn't smart enough
  // to do that when the setting is done inside a function that's inlined.
  goog.userAgent.OPERA = goog.labs.userAgent.browser.isOpera();
  goog.userAgent.IE = goog.labs.userAgent.browser.isIE();
  goog.userAgent.GECKO = goog.labs.userAgent.engine.isGecko();
  goog.userAgent.WEBKIT = goog.labs.userAgent.engine.isWebKit();
  goog.userAgent.MOBILE = goog.userAgent.isMobile_();
  goog.userAgent.SAFARI = goog.userAgent.WEBKIT;

  // Platform in goog.userAgent.
  goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
  goog.userAgent.initPlatform_();
  goog.userAgent.MAC = goog.userAgent.detectedMac_;
  goog.userAgent.WINDOWS = goog.userAgent.detectedWindows_;
  goog.userAgent.LINUX = goog.userAgent.detectedLinux_;
  goog.userAgent.X11 = goog.userAgent.detectedX11_;
  goog.userAgent.ANDROID = goog.userAgent.detectedAndroid_;
  goog.userAgent.IPAD = goog.userAgent.detectedIPad_;
  goog.userAgent.IPHONE = goog.userAgent.detectedIPhone_;
  goog.userAgent.VERSION = goog.userAgent.determineVersion_();

  // Platform in goog.userAgent.platform.
  goog.userAgent.platform.VERSION = goog.userAgent.platform.determineVersion_();

  // goog.userAgent.product
  goog.userAgent.product.init_();
  goog.userAgent.product.OPERA = goog.userAgent.OPERA;
  goog.userAgent.product.IE = goog.userAgent.IE;
  goog.userAgent.product.FIREFOX = goog.userAgent.product.detectedFirefox_;
  goog.userAgent.product.CAMINO = goog.userAgent.product.detectedCamino_;
  goog.userAgent.product.IPHONE = goog.userAgent.product.detectedIphone_;
  goog.userAgent.product.IPAD = goog.userAgent.product.detectedIpad_;
  goog.userAgent.product.ANDROID = goog.userAgent.product.detectedAndroid_;
  goog.userAgent.product.CHROME = goog.userAgent.product.detectedChrome_;
  goog.userAgent.product.SAFARI = goog.userAgent.product.detectedSafari_;

  goog.userAgent.product.VERSION = goog.userAgent.product.determineVersion_();

  // goog.userAgent.keyboard
  goog.userAgent.keyboard.MAC_KEYBOARD =
      goog.userAgent.keyboard.determineMacKeyboard_();
};


/**
 * Browser definitions.
 * @enum {string}
 */
goog.userAgentTestUtil.UserAgents = {
  GECKO: 'GECKO',
  IE: 'IE',
  OPERA: 'OPERA',
  WEBKIT: 'WEBKIT'
};


/**
 * Return whether a given user agent has been detected.
 * @param {string} agent Value in UserAgents.
 * @return {boolean} Whether the user agent has been detected.
 */
goog.userAgentTestUtil.getUserAgentDetected = function(agent) {
  switch (agent) {
    case goog.userAgentTestUtil.UserAgents.GECKO:
      return goog.userAgent.GECKO;
    case goog.userAgentTestUtil.UserAgents.IE:
      return goog.userAgent.IE;
    case goog.userAgentTestUtil.UserAgents.OPERA:
      return goog.userAgent.OPERA;
    case goog.userAgentTestUtil.UserAgents.WEBKIT:
      return goog.userAgent.WEBKIT;
  }

  throw Error('Unrecognized user agent');
};
