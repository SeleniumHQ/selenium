// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Closure user device detection (based on user agent).
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or engine see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and engine).
 *
 */

goog.provide('goog.labs.userAgent.device');

goog.require('goog.labs.userAgent.util');


/**
 * Currently we detect the iPhone, iPod and Android mobiles (devices that have
 * both Android and Mobile in the user agent string).
 *
 * @return {boolean} Whether the user is using a mobile device.
 */
goog.labs.userAgent.device.isMobile = function() {
  return !goog.labs.userAgent.device.isTablet() &&
      (goog.labs.userAgent.util.matchUserAgent('iPod') ||
       goog.labs.userAgent.util.matchUserAgent('iPhone') ||
       goog.labs.userAgent.util.matchUserAgent('Android') ||
       goog.labs.userAgent.util.matchUserAgent('IEMobile'));
};


/**
 * Currently we detect Kindle Fire, iPad, and Android tablets (devices that have
 * Android but not Mobile in the user agent string).
 *
 * @return {boolean} Whether the user is using a tablet.
 */
goog.labs.userAgent.device.isTablet = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPad') ||
      (goog.labs.userAgent.util.matchUserAgent('Android') &&
       !goog.labs.userAgent.util.matchUserAgent('Mobile')) ||
      goog.labs.userAgent.util.matchUserAgent('Silk');
};


/**
 * @return {boolean} Whether the user is using a desktop computer (which we
 *     assume to be the case if they are not using either a mobile or tablet
 *     device).
 */
goog.labs.userAgent.device.isDesktop = function() {
  return !goog.labs.userAgent.device.isMobile() &&
      !goog.labs.userAgent.device.isTablet();
};
