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

const { parseArgs } = require('node:util')

const BROWSERS = ['chrome', 'edge', 'firefox']
// The bindings read any other name as ALL, which logs request bodies, typed
// text included, so an unknown level is refused rather than passed on.
const LOG_LEVELS = ['severe', 'warning', 'info', 'fine', 'all']

const USAGE = `Usage: selenium-mcp [options]

Starts a Model Context Protocol server over stdio that drives a browser with Selenium.

Options:
  --browser <name>            chrome (default), edge or firefox
  --headless                  run the browser headless (the default)
  --headed                    show the browser window
  --grid <url>                run the browser on a Selenium Grid at this URL
  --allowed-origins <list>    semicolon-separated origins the browser may navigate to
  --blocked-origins <list>    semicolon-separated origins the browser may not navigate to
  --allow-unrestricted-file-access
                              allow browser_navigate to open file:// URLs, and
                              browser_file_upload to upload files outside the working directory
  --allow-evaluate            offer browser_evaluate, which runs JavaScript the agent writes in the page
  --isolated                  accepted for compatibility; every session already uses a fresh profile
  --log-level <level>         log to stderr at this level: severe, warning (default), info, fine,
                              all (all includes raw WebDriver traffic, so typed text such as passwords)
  -h, --help                  show this help
  -v, --version               show the version`

/** Flags other MCP servers have that v0 does not support yet, with why. */
const NOT_YET = {
  port: 'HTTP transport is planned for a later version; v0 serves stdio only',
  caps: 'optional tool groups are planned for a later version',
}

/**
 * Parses the command line.
 *
 * @param {!Array<string>} argv arguments after the script name
 * @return {{help: boolean, version: boolean, browser: string, headless: boolean,
 *     grid: (string|undefined), allowedOrigins: !Array<string>,
 *     blockedOrigins: !Array<string>, allowFileAccess: boolean, allowEvaluate: boolean,
 *     logLevel: string}}
 * @throws {Error} on an unknown or invalid option
 */
function parseCommandLine(argv) {
  for (const arg of argv) {
    const flag = arg.replace(/^--/, '').split('=')[0]
    if (arg.startsWith('--') && NOT_YET[flag]) throw new Error(`--${flag} is not supported yet: ${NOT_YET[flag]}.`)
  }
  const { values } = parseArgs({
    args: argv,
    options: {
      browser: { type: 'string', default: 'chrome' },
      headless: { type: 'boolean' },
      headed: { type: 'boolean' },
      grid: { type: 'string' },
      'allowed-origins': { type: 'string' },
      'blocked-origins': { type: 'string' },
      isolated: { type: 'boolean' },
      'allow-unrestricted-file-access': { type: 'boolean' },
      'allow-evaluate': { type: 'boolean' },
      'log-level': { type: 'string', default: 'warning' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
    strict: true,
    allowPositionals: false,
  })

  const browser = values.browser.toLowerCase()
  if (!BROWSERS.includes(browser)) {
    throw new Error(`--browser must be one of ${BROWSERS.join(', ')}; got ${values.browser}`)
  }
  const logLevel = values['log-level'].toLowerCase()
  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`--log-level must be one of ${LOG_LEVELS.join(', ')}; got ${values['log-level']}`)
  }
  if (values.headless && values.headed) throw new Error('--headless and --headed cannot both be given')
  if (values.grid) {
    try {
      new URL(values.grid)
    } catch {
      throw new Error(`--grid must be a URL; got ${values.grid}`)
    }
  }

  return {
    help: !!values.help,
    version: !!values.version,
    browser,
    headless: !values.headed,
    grid: values.grid,
    allowedOrigins: splitList(values['allowed-origins']),
    blockedOrigins: splitList(values['blocked-origins']),
    allowFileAccess: !!values['allow-unrestricted-file-access'],
    allowEvaluate: !!values['allow-evaluate'],
    logLevel,
  }
}

function splitList(value) {
  return (value || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

module.exports = { BROWSERS, LOG_LEVELS, USAGE, parseCommandLine }
