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
 * @type {{ERROR: string, INFO: string, DEBUG: string, WARNING: string}}
 */
const LOG_LEVEL = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

/**
 *
 */
class LogInspector {
  bidi
  ws

  constructor (driver, browsingContextIds) {
    this.debug = []
    this.error = []
    this.info = []
    this.warn = []
    this._driver = driver
    this._browsingContextIds = browsingContextIds
  }

  /**
   * Subscribe to log event
   * @returns {Promise<void>}
   */
  async init () {
    this.bidi = await this._driver.getBidi()
    await this.bidi.subscribe('log.entryAdded', this._browsingContextIds)
  }

  /**
   * Listen to log events and capture logs based on log level
   * @returns {Promise<void>}
   */
  async listen () {
    this.ws = await this.bidi.socket

    this.ws.on('message', event => {
      const data = JSON.parse(Buffer.from(event.toString()))
      switch (data.params?.level) {
        case LOG_LEVEL.INFO:
          this.info.push(data.params)
          break

        case LOG_LEVEL.DEBUG:
          this.debug.push(data.params)
          break

        case LOG_LEVEL.ERROR:
          this.error.push(data.params)
          break

        case LOG_LEVEL.WARNING:
          this.warn.push(data.params)
          break

        default:
        // Unknown websocket message type
      }
    })
  }

  // TODO below are used to check,will be replaced by spec methods as described in doc
  /**
   * returns all info logs collected
   * @returns {[]}
   */
  get infoLogs () {
    return this.info
  }

  /**
   * returns all debug logs collected
   * @returns {[]}
   */
  get debugLogs () {
    return this.debug
  }

  /**
   * return to all error logs collected
   * @returns {[]}
   */
  get errorLogs () {
    return this.error
  }

  /**
   * Return all warn logs collected
   * @returns {[]}
   */
  get warnLogs () {
    return this.warn
  }

  /**
   * Unsubscribe to log event
   * @returns {Promise<void>}
   */
  async close () {
    await this.bidi.unsubscribe('log.entryAdded', this._browsingContextIds)
  }

}

let instance = undefined

/**
 * initiate inspector instance and return
 * @param driver
 * @param browsingContextIds
 * @returns {Promise<LogInspector>}
 */
async function getInstance (driver, browsingContextIds) {

  if (instance === undefined) {
    instance = new LogInspector(driver, browsingContextIds)
    await instance.init()
    await instance.listen()
    Object.freeze(instance)
  }
  return instance
}

/**
 * API
 * @type {function(*, *): Promise<LogInspector>}
 */
module.exports = getInstance
