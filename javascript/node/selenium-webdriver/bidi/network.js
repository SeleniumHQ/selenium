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

const { BeforeRequestSent, ResponseStarted, FetchError } = require('./networkTypes')
const { AddInterceptParameters } = require('./addInterceptParameters')
const { ContinueResponseParameters } = require('./continueResponseParameters')
const { ContinueRequestParameters } = require('./continueRequestParameters')
const { ProvideResponseParameters } = require('./provideResponseParameters')

class Network {
  constructor(driver, browsingContextIds) {
    this._driver = driver
    this._browsingContextIds = browsingContextIds
  }

  async init() {
    this.bidi = await this._driver.getBidi()
  }

  async beforeRequestSent(callback) {
    await this.subscribeAndHandleEvent('network.beforeRequestSent', callback)
  }

  async responseStarted(callback) {
    await this.subscribeAndHandleEvent('network.responseStarted', callback)
  }

  async responseCompleted(callback) {
    await this.subscribeAndHandleEvent('network.responseCompleted', callback)
  }

  async authRequired(callback) {
    await this.subscribeAndHandleEvent('network.authRequired', callback)
  }

  async fetchError(callback) {
    await this.subscribeAndHandleEvent('network.fetchError', callback)
  }

  async subscribeAndHandleEvent(eventType, callback) {
    if (this._browsingContextIds != null) {
      await this.bidi.subscribe(eventType, this._browsingContextIds)
    } else {
      await this.bidi.subscribe(eventType)
    }
    await this._on(callback)
  }

  async _on(callback) {
    this.ws = await this.bidi.socket
    this.ws.on('message', (event) => {
      const { params } = JSON.parse(Buffer.from(event.toString()))
      if (params) {
        let response = null
        if ('initiator' in params) {
          response = new BeforeRequestSent(
            params.context,
            params.navigation,
            params.redirectCount,
            params.request,
            params.timestamp,
            params.initiator,
          )
        } else if ('response' in params) {
          response = new ResponseStarted(
            params.context,
            params.navigation,
            params.redirectCount,
            params.request,
            params.timestamp,
            params.response,
          )
        } else if ('errorText' in params) {
          response = new FetchError(
            params.context,
            params.navigation,
            params.redirectCount,
            params.request,
            params.timestamp,
            params.errorText,
          )
        }
        callback(response)
      }
    })
  }

  async addIntercept(params) {
    if (!(params instanceof AddInterceptParameters)) {
      throw new Error(`Params must be an instance of AddInterceptParameters. Received:'${params}'`)
    }

    const command = {
      method: 'network.addIntercept',
      params: Object.fromEntries(params.asMap()),
    }

    let response = await this.bidi.send(command)

    return response.result.intercept
  }

  async removeIntercept(interceptId) {
    const command = {
      method: 'network.removeIntercept',
      params: { intercept: interceptId },
    }

    await this.bidi.send(command)
  }

  async continueWithAuth(requestId, username, password) {
    const command = {
      method: 'network.continueWithAuth',
      params: {
        request: requestId.toString(),
        action: 'provideCredentials',
        credentials: {
          type: 'password',
          username: username,
          password: password,
        },
      },
    }
    await this.bidi.send(command)
  }

  async failRequest(requestId) {
    const command = {
      method: 'network.failRequest',
      params: {
        request: requestId.toString(),
      },
    }
    await this.bidi.send(command)
  }

  async continueWithAuthNoCredentials(requestId) {
    const command = {
      method: 'network.continueWithAuth',
      params: {
        request: requestId.toString(),
        action: 'default',
      },
    }
    await this.bidi.send(command)
  }

  async cancelAuth(requestId) {
    const command = {
      method: 'network.continueWithAuth',
      params: {
        request: requestId.toString(),
        action: 'cancel',
      },
    }
    await this.bidi.send(command)
  }

  async continueRequest(params) {
    if (!(params instanceof ContinueRequestParameters)) {
      throw new Error(`Params must be an instance of ContinueRequestParameters. Received:'${params}'`)
    }

    const command = {
      method: 'network.continueRequest',
      params: Object.fromEntries(params.asMap()),
    }

    await this.bidi.send(command)
  }

  async continueResponse(params) {
    if (!(params instanceof ContinueResponseParameters)) {
      throw new Error(`Params must be an instance of ContinueResponseParameters. Received:'${params}'`)
    }

    const command = {
      method: 'network.continueResponse',
      params: Object.fromEntries(params.asMap()),
    }

    await this.bidi.send(command)
  }

  async provideResponse(params) {
    if (!(params instanceof ProvideResponseParameters)) {
      throw new Error(`Params must be an instance of ProvideResponseParameters. Received:'${params}'`)
    }

    const command = {
      method: 'network.provideResponse',
      params: Object.fromEntries(params.asMap()),
    }

    await this.bidi.send(command)
  }

  async close() {
    await this.bidi.unsubscribe(
      'network.beforeRequestSent',
      'network.responseStarted',
      'network.responseCompleted',
      'network.authRequired',
    )
  }
}

async function getNetworkInstance(driver, browsingContextIds = null) {
  let instance = new Network(driver, browsingContextIds)
  await instance.init()
  return instance
}

module.exports = getNetworkInstance
