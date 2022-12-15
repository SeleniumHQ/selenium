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

const { ConsoleLogEntry, JavascriptLogEntry } = require('./log_entries')

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
    this.listener = {}
  }

  /**
   * Subscribe to log event
   * @returns {Promise<void>}
   */
  async init () {
    this.bidi = await this._driver.getBidi()
    await this.bidi.subscribe('log.entryAdded', this._browsingContextIds)
    
  }

  logListener(kind) {
    if (!(kind in this.listener)) {
      this.listener[kind] = []
    }
  }

  async onConsoleLog(callback) {
    this.ws = await this.bidi.socket
    const console = "console"
    let enabled = (console in this.listener) || this.logListener(console)
    this.listener[console].push(callback)

    if (enabled) return

    this.ws.on('message', event => {
      const data = JSON.parse(Buffer.from(event.toString()))

      if(data.params?.type == console) {
        var consoleEntry = new ConsoleLogEntry(
          data.params.level,
          data.params.text,
          data.params.timestamp,
          data.params.type,
          data.params.method,
          data.params.realm,
          data.params.args,
          data.params.stackTrace
        )

        this.listener[console].forEach(listener => {
          listener(consoleEntry)
        })
      }
    })
  }

  async onJavascriptException(callback) {
    this.ws = await this.bidi.socket
    const jsException = "jsException"
    let enabled = (jsException in this.listener) || this.logListener(jsException)
    this.listener[jsException].push(callback)

    if (enabled) return

    this.ws.on('message', event => {
      const data = JSON.parse(Buffer.from(event.toString()))
      if((data.params?.type == "javascript") && (data.params?.level == "error")) {
        
        var jsErrorEntry = new JavascriptLogEntry(
          data.params.level,
          data.params.text,
          data.params.timestamp,
          data.params.type,
          data.params.stackTrace
        )

        this.listener[jsException].forEach(listener => {
          listener(jsErrorEntry)
        })
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
  instance = new LogInspector(driver, browsingContextIds)
  await instance.init()
  return instance
}

/**
 * API
 * @type {function(*, *): Promise<LogInspector>}
 */
module.exports = getInstance
