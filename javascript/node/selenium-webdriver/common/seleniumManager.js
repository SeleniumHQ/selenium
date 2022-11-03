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
 *  Wrapper for getting information from the Selenium Manager binaries
 */

const { platform } = require('process')
const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync

/**
 * currently supported browsers for selenium-manager
 * @type {string[]}
 */
const Browser = ['chrome', 'firefox', 'edge']

/**
 * Determines the path of the correct Selenium Manager binary
 * @returns {string}
 */
function getBinary() {
  const directory = {
    darwin: 'macos',
    win32: 'windows',
    cygwin: 'windows',
    linux: 'linux',
  }[platform]

  const file =
    directory === 'windows' ? 'selenium-manager.exe' : 'selenium-manager'

  const filePath = path.join(__dirname, '..', '/bin', directory, file)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Unable to obtain Selenium Manager`)
  }

  return filePath
}

/**
 * Determines the path of the correct driver
 * @param {Browser|string} browser name to fetch the driver
 * @returns {string} path of the driver location
 */

function driverLocation(browser) {
  if (!Browser.includes(browser.toLocaleString())) {
    throw new Error(
      `Unable to locate driver associated with browser name: ${browser}`
    )
  }

  let args = [getBinary(), '--browser', browser]
  let result

  try {
    result = execSync(args.join(' ')).toString()
  } catch (e) {
    throw new Error(
      `Error executing command with ${args} : Error ${e.stderr.toString()}`
    )
  }

  if (!result.startsWith('INFO\t')) {
    throw new Error(`Unsuccessful command executed ${args}}`)
  }

  return result.replace('INFO\t', '').trim()
}

// PUBLIC API
module.exports = { driverLocation }
