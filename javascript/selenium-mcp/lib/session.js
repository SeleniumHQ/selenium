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

const { Builder, error } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const edge = require('selenium-webdriver/edge')
const firefox = require('selenium-webdriver/firefox')
const logging = require('selenium-webdriver/lib/logging')

const { RefTable } = require('./snapshot')

const log_ = logging.getLogger('selenium.mcp.session')

const MAX_CONSOLE_MESSAGES = 1000
const WINDOW_SIZE = { width: 1280, height: 720 }

/**
 * Builds browser options for the configured browser.
 *
 * @param {{browser: string, headless: boolean}} config
 * @return {!Object} a Capabilities subclass for the browser
 */
function buildOptions(config) {
  let options
  switch (config.browser) {
    case 'chrome':
      options = new chrome.Options()
      if (config.headless) options.addArguments('--headless=new')
      options.addArguments(`--window-size=${WINDOW_SIZE.width},${WINDOW_SIZE.height}`)
      break
    case 'edge':
      options = new edge.Options()
      if (config.headless) options.addArguments('--headless=new')
      options.addArguments(`--window-size=${WINDOW_SIZE.width},${WINDOW_SIZE.height}`)
      break
    case 'firefox':
      options = new firefox.Options()
      if (config.headless) options.addArguments('-headless')
      options.windowSize(WINDOW_SIZE)
      break
    default:
      throw new Error(`Unsupported browser: ${config.browser}`)
  }
  // BiDi carries console messages; the classic protocol has no way to read them.
  options.set('webSocketUrl', true)
  // Leave dialogs open so the agent can see them and decide what to do.
  options.setAlertBehavior('ignore')
  return options
}

/**
 * One browser per server process, started on first use.
 */
class Session {
  /**
   * @param {{browser: string, headless: boolean, grid: (string|undefined)}} config
   * @param {{buildDriver: (function(!Object): !Promise<!Object>|undefined)}=} hooks
   */
  constructor(config, hooks = {}) {
    this.config = config
    this.refs = new RefTable()
    this.consoleMessages = []
    this.driver_ = null
    this.starting_ = null
    this.buildDriver_ = hooks.buildDriver || ((options) => this.defaultBuildDriver_(options))
  }

  async defaultBuildDriver_(options) {
    const builder = new Builder().withCapabilities(options)
    if (this.config.grid) builder.usingServer(this.config.grid)
    return builder.build()
  }

  /** @return {boolean} whether a browser is running */
  get isOpen() {
    return this.driver_ !== null
  }

  /**
   * @return {!Promise<!Object>} the WebDriver, starting the browser if needed
   */
  async driver() {
    if (this.driver_) return this.driver_
    if (!this.starting_) {
      this.starting_ = this.start_().finally(() => {
        this.starting_ = null
      })
    }
    return this.starting_
  }

  async start_() {
    log_.info(`starting ${this.config.browser}${this.config.headless ? ' (headless)' : ''}`)
    const driver = await this.buildDriver_(buildOptions(this.config))
    this.driver_ = driver
    this.refs.clear()
    this.consoleMessages = []
    try {
      await this.listenToConsole_(driver)
    } catch (e) {
      log_.warning(`console messages unavailable: ${e.message}`)
    }
    return driver
  }

  async listenToConsole_(driver) {
    const getLogInspector = require('selenium-webdriver/bidi/logInspector')
    const inspector = await getLogInspector(driver)
    await inspector.onLog((entry) => {
      this.consoleMessages.push({
        level: normalizeLevel(entry.method || entry.level),
        text: entry.text,
        type: entry.type,
      })
      if (this.consoleMessages.length > MAX_CONSOLE_MESSAGES) this.consoleMessages.shift()
    })
  }

  /**
   * Forgets the current browser without trying to talk to it, for when it
   * has already gone away.
   */
  reset() {
    this.driver_ = null
    this.refs.clear()
  }

  /** Quits the browser if one is running. */
  async close() {
    if (this.starting_) {
      // Let a start in flight finish, or the browser it opens would outlive the close.
      try {
        await this.starting_
      } catch {
        // It failed to start; there is nothing to quit.
      }
    }
    const driver = this.driver_
    this.reset()
    if (driver) {
      try {
        await driver.quit()
      } catch (e) {
        log_.finer(`error quitting the browser: ${e.message}`)
      }
    }
  }

  /**
   * @param {*} e an error from a WebDriver command
   * @return {boolean} whether it means the browser has gone away
   */
  isSessionGone(e) {
    return e instanceof error.NoSuchSessionError || (e && /ECONNREFUSED|session deleted/i.test(e.message || ''))
  }
}

/**
 * @param {string} level a BiDi log level or console method
 * @return {string} one of debug, info, warning, error
 */
function normalizeLevel(level) {
  switch (String(level).toLowerCase()) {
    case 'error':
    case 'assert':
      return 'error'
    case 'warn':
    case 'warning':
      return 'warning'
    case 'debug':
    case 'trace':
      return 'debug'
    default:
      return 'info'
  }
}

module.exports = { Session, buildOptions, normalizeLevel }
