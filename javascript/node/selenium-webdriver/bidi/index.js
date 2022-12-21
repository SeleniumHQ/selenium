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

const { EventEmitter } = require('node:events')
const WebSocket = require('ws')

const RESPONSE_TIMEOUT = 1000 * 30

class Index extends EventEmitter {
  id = 0
  isConnected = false
  events = []
  browsingContexts = []

  /**
   * Create a new websocket connection
   * @param _webSocketUrl
   */
  constructor (_webSocketUrl) {
    super()
    this.isConnected = false
    this._ws = new WebSocket(_webSocketUrl)
    this._ws.on('open', () => {
      this.isConnected = true;
    });
  }

  /**
   * Resolve connection
   * @returns {Promise<unknown>}
   */
  async waitForConnection() {
    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve();
      } else {
        this._ws.once('open', () => {
          resolve();
        });
      }
    });
  }

  /**
   * @returns {WebSocket}
   */
  get socket () {
    return this._ws
  }

  /**
   * @returns {boolean|*}
   */
  get isConnected () {
    return this.isConnected
  }

  /**
   * Sends a bidi request
   * @param params
   * @returns {Promise<unknown>}
   */
  async send (params) {
    if (!this.isConnected) {
      await this.waitForConnection()
    }

    const id = ++this.id

    this._ws.send(JSON.stringify({ id, ...params }))

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request with id ${id} timed out`))
        handler.off('message', listener)
      }, RESPONSE_TIMEOUT)

      const listener = (data) => {
        try {
          const payload = JSON.parse(data.toString())
          if (payload.id === id) {
            clearTimeout(timeoutId)
            handler.off('message', listener)
            resolve(payload)
          }
        } catch (err) {
          log.error(`Failed parse message: ${err.message}`)
        }
      }

      const handler = this._ws.on('message', listener)
    })
  }

  /**
   * Subscribe to events
   * @param events
   * @param browsingContexts
   * @returns {Promise<void>}
   */
  async subscribe (events, browsingContexts) {

    if (typeof events === 'string') {
      this.events.push(events)
    } else if (Array.isArray(events)) {
      this.events = this.events.concat(events)
    }

    if (typeof browsingContexts === 'string') {
      this.browsingContexts.push(browsingContexts)
    } else if (Array.isArray(browsingContexts)) {
      this.browsingContexts = this.browsingContexts.concat(browsingContexts)
    }

    let params = {
      method: 'session.subscribe', params: {
        events: this.events,
      }
    }

    if (browsingContexts) {
      params.params.contexts = this.browsingContexts
    }

    await this.send(params)
  }

  /**
   * Unsubscribe to events
   * @param events
   * @param browsingContexts
   * @returns {Promise<void>}
   */
  async unsubscribe (events, browsingContexts) {

    if (typeof events === 'string') {
      this.events = this.events.filter(event => event !== events)
    } else if (Array.isArray(events)) {
      this.events = this.events.filter(event => !events.includes(event))
    }

    if (typeof browsingContexts === 'string') {
      this.browsingContexts.pop()
    } else if (Array.isArray(browsingContexts)) {
      this.browsingContexts =
        this.browsingContexts.filter(id => !browsingContexts.includes(id))
    }

    let params = {
      method: 'session.unsubscribe', params: {
        events: this.events,
      }
    }

    if (browsingContexts) {
      params.params.contexts = this.browsingContexts
    }

    await this.send(params)
  }

  /**
   * Get Bidi Status
   * @returns {Promise<*>}
   */
  get status () {
    return this.send({
      method: 'session.status', params: {}
    })
  }

  /**
   * Close ws connection.
   * @returns {Promise<unknown>}
   */
  close () {
    const closeWebSocket = (callback) => {
      // don't close if it's already closed
      if (this._ws.readyState === 3) {
        callback()
      } else {
        // don't notify on user-initiated shutdown ('disconnect' event)
        this._ws.removeAllListeners('close')
        this._ws.once('close', () => {
          this._ws.removeAllListeners()
          callback()
        })
        this._ws.close()
      }
    }
    return new Promise((fulfill, reject) => {
      closeWebSocket(fulfill)
    })
  }
}

/**
 * API
 * @type {function(*): Promise<Index>}
 */
module.exports = Index
