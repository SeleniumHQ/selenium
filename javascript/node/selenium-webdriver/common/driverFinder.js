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
 *  This implementation is still in beta, and may change.
 *
 *  Utility to find if a given file is present and executable.
 */

const { driverLocation } = require('./seleniumManager')

/**
 * Determines the path of the correct Selenium Manager binary
 * @returns {{browserPath: string, driverPath: string}} path of the driver
 * and browser location
 */
function getPath(capabilities) {
  try {
    return driverLocation(capabilities)
  } catch (e) {
    throw Error(
      `Unable to obtain browser driver.
        For more information on how to install drivers see
        https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/driver_location/. ${e}`,
    )
  }
}

// PUBLIC API
module.exports = { getPath }
