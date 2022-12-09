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

const BIDI = require('./bidi')

const LOG_LEVEL = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

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

  async init () {
    this.bidi = await this._driver.getBidi()
    // TODO this.bidi should have bidi instance need to remove connect once api is done
    await this.bidi.connect()
    await this.bidi.subscribe('log.entryAdded', this._browsingContextIds)
  }

  async listen () {
    this.ws = await this.bidi.socket

    this.ws.on('message', event => {
      const data = JSON.parse(Buffer.from(event.toString()))
      console.log(data)
      switch (data.params.level) {
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
  get infoLogs () {
    return this.info
  }

  get debugLogs () {
    return this.debug
  }

  get errorLogs () {
    return this.error
  }

  get warnLogs () {
    return this.warn
  }

}

let instance = undefined

async function getInstance (driver, browsingContextIds) {

  if (instance === undefined) {
    instance = new LogInspector(driver, browsingContextIds)
    await instance.init()
    await instance.listen()
    Object.freeze(instance)
  }
  return instance
}

module.exports = getInstance
