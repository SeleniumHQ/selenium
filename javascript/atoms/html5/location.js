// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Atom to retrieve the physical location of the device.
 *
 */

goog.provide('bot.geolocation');

goog.require('bot');
goog.require('bot.html5');


/**
 * Default parameters used to configure the geolocation.getCurrentPosition
 * method. These parameters mean retrieval of any cached position with high
 * accuracy within a timeout interval of 5s.
 * @const
 * @type {GeolocationPositionOptions}
 * @see http://dev.w3.org/geo/api/spec-source.html#position-options
 */
bot.geolocation.DEFAULT_OPTIONS = /** @type {GeolocationPositionOptions} */ ({
  enableHighAccuracy: true,
  maximumAge: Infinity,
  timeout: 5000
});


/**
 * Provides a mechanism to retrieve the geolocation of the device.  It invokes
 * the navigator.geolocation.getCurrentPosition method of the HTML5 API which
 * later callbacks with either position value or any error. The position/
 * error is updated with the callback functions.
 *
 * @param {function(?GeolocationPosition)} successCallback The callback method
 *     which is invoked on success.
 * @param {function(GeolocationPositionError)=} opt_errorCallback The callback
 *     method which is invoked on error.
 * @param {GeolocationPositionOptions=} opt_options The optional parameters to
 *     navigator.geolocation.getCurrentPosition; defaults to
 *     bot.geolocation.DEFAULT_OPTIONS.
 */
bot.geolocation.getCurrentPosition = function(successCallback,
    opt_errorCallback, opt_options) {
  var win = bot.getWindow();
  var posOptions = opt_options || bot.geolocation.DEFAULT_OPTIONS;

  if (bot.html5.isSupported(bot.html5.API.GEOLOCATION, win)) {
    var geolocation = win.navigator.geolocation;
    geolocation.getCurrentPosition(successCallback,
        opt_errorCallback, posOptions);
  } else {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, 'Geolocation undefined');
  }
};
