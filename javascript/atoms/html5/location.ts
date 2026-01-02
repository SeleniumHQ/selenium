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
 */

import { getWindow } from '../bot';
import { BotError, ErrorCode } from '../error';
import { API, isSupported } from './html5';

/**
 * Default parameters used to configure the geolocation.getCurrentPosition
 * method. These parameters mean retrieval of any cached position with high
 * accuracy within a timeout interval of 5s.
 * @see http://dev.w3.org/geo/api/spec-source.html#position-options
 */
export const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: Infinity,
  timeout: 5000,
};

/**
 * Provides a mechanism to retrieve the geolocation of the device. It invokes
 * the navigator.geolocation.getCurrentPosition method of the HTML5 API which
 * later callbacks with either position value or any error. The position/
 * error is updated with the callback functions.
 */
export function getCurrentPosition(
  successCallback: (position: GeolocationPosition) => void,
  opt_errorCallback?: (error: GeolocationPositionError) => void,
  opt_options?: PositionOptions | null
): void {
  const win = getWindow();
  const posOptions = opt_options || DEFAULT_OPTIONS;

  if (isSupported(API.GEOLOCATION, win)) {
    const geolocation = win.navigator.geolocation;
    geolocation.getCurrentPosition(successCallback, opt_errorCallback, posOptions);
  } else {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, 'Geolocation undefined');
  }
}
