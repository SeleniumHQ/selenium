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

'use strict'
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { Browser } = require('selenium-webdriver/index')
const { Environment } = require('selenium-webdriver/testing')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const { runfiles } = require('@bazel/runfiles')

function GetBrowserForTests() {
  let browser = process.env.SELENIUM_BROWSER

  // If we have no browser set, fail the build
  if (!browser) {
    throw new Error('SELENIUM_BROWSER env var not set')
  }

  if (browser.indexOf(',') !== -1) {
    throw new Error('SELENIUM_BROWSER env var must only be a single browser')
  }

  /** @type !TargetBrowser */
  const targetBrowser = { name: browser, capabilities: undefined }
  const builder = new Environment(targetBrowser).builder()
  builder.disableEnvironmentOverrides()
  let binary = process.env.BROWSER_BINARY
  let driverBinary = process.env.DRIVER_BINARY

  let resolvedBinary = binary ? runfiles.resolve(driverBinary) : undefined
  let resolvedDriver = driverBinary ? runfiles.resolve(binary) : undefined

  // Create a temporary directory we can use as a home dir
  // process.env["USER"] = "nobody"
  process.env['HOME'] = fs.mkdtempSync(path.join(os.tmpdir(), 'jasmine-test'))

  switch (browser) {
    case 'chrome':
      builder.forBrowser(Browser.CHROME)
      if (resolvedDriver) {
        let sb = new chrome.ServiceBuilder(resolvedDriver)
        sb.enableVerboseLogging()
        sb.setStdio('inherit')
        builder.setChromeService(sb)
      }
      if (resolvedBinary) {
        let options = new chrome.Options()
        options.setChromeBinaryPath(resolvedBinary)
        options.setAcceptInsecureCerts(true)
        options.addArguments('disable-infobars', 'disable-breakpad', 'disable-dev-shm-usage', 'no-sandbox')
        builder.setChromeOptions(options)
      }
      break

    // case 'edge':
    //   builder = builder.forBrowser(webdriver.Browser.EDGE)
    //   break
    //
    case 'firefox':
      builder.forBrowser(Browser.FIREFOX)
      if (resolvedDriver) {
        let sb = new firefox.ServiceBuilder(resolvedDriver)
        sb.enableVerboseLogging(true)
        sb.setStdio('inherit')
        builder.setFirefoxService(sb)
      }
      if (resolvedBinary) {
        let options = new firefox.Options()
        options.setBinary(resolvedBinary)
        options.enableDebugger()
        builder.setFirefoxOptions(options)
      }
      break

    case 'safari':
      builder.forBrowser(Browser.SAFARI)
      break

    default:
      throw new Error('SELENIUM_BROWSER does not list a supported browser')
  }

  return builder.build()
}

module.exports = {
  GetBrowserForTests,
}
