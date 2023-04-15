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

const {
  BrowsingContextInfo,
  NavigationInfo,
} = require('./browsingContextTypes')

class BrowsingContextInspector {
  constructor(driver, browsingContextIds) {
    this._driver = driver
    this._browsingContextIds = browsingContextIds
  }

  async init() {
    this.bidi = await this._driver.getBidi()
  }

  async onBrowsingContextCreated(callback) {
    if (this._browsingContextIds != null) {
      await this.bidi.subscribe(
        'browsingContext.contextCreated',
        this._browsingContextIds
      )
    } else {
      await this.bidi.subscribe('browsingContext.contextCreated')
    }
    await this.on(callback)
  }

  async onDomContentLoaded(callback) {
    if (this._browsingContextIds != null) {
      await this.bidi.subscribe(
        'browsingContext.domContentLoaded',
        this._browsingContextIds
      )
    } else {
      await this.bidi.subscribe('browsingContext.domContentLoaded')
    }
    await this.on(callback)
  }

  async onBrowsingContextLoaded(callback) {
    if (this._browsingContextIds != null) {
      await this.bidi.subscribe(
        'browsingContext.load',
        this._browsingContextIds
      )
    } else {
      await this.bidi.subscribe('browsingContext.load')
    }
    await this.on(callback)
  }

  async on(callback) {
    this.ws = await this.bidi.socket
    this.ws.on('message', (event) => {
      const { params } = JSON.parse(Buffer.from(event.toString()))
      if (params) {
        let response = null
        if ('navigation' in params) {
          response = new NavigationInfo(
            params.context,
            params.navigation,
            params.timestamp,
            params.url
          )
        } else if ('accepted' in params) {
          /* Needs to be updated when browsers implement other events */
        } else {
          response = new BrowsingContextInfo(
            params.context,
            params.url,
            params.children,
            params.parent
          )
        }
        callback(response)
      }
    })
  }
}

async function getBrowsingContextInstance(driver, browsingContextIds = null) {
  let instance = new BrowsingContextInspector(driver, browsingContextIds)
  await instance.init()
  return instance
}

module.exports = getBrowsingContextInstance
