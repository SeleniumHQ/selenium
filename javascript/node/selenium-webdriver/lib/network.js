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

const network = require('../bidi/network')
const { InterceptPhase } = require('../bidi/interceptPhase')
const { AddInterceptParameters } = require('../bidi/addInterceptParameters')

class Network {
  #driver
  #network
  #callBackInterceptIdMap = new Map()

  constructor(driver) {
    this.#driver = driver
  }

  // This should be done in the constructor.
  // But since it needs to call async methods we cannot do that in the constructor.
  // We can have a separate async method that initialises the Script instance.
  // However, that pattern does not allow chaining the methods as we would like the user to use it.
  // Since it involves awaiting to get the instance and then another await to call the method.
  // Using this allows the user to do this "await driver.network.addAuthenticationHandler(callback)"
  async #init() {
    if (this.#network !== undefined) {
      return
    }
    this.#network = await network(this.#driver)
  }

  async addAuthenticationHandler(username, password) {
    await this.#init()

    const interceptId = await this.#network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED))

    const id = await this.#network.authRequired(async (event) => {
      await this.#network.continueWithAuth(event.request.request, username, password)
    })

    this.#callBackInterceptIdMap.set(id, interceptId)
    return id
  }

  async removeAuthenticationHandler(id) {
    await this.#init()

    const interceptId = this.#callBackInterceptIdMap.get(id)

    await this.#network.removeIntercept(interceptId)
    await this.#network.removeCallback(id)

    this.#callBackInterceptIdMap.delete(id)
  }

  async clearAuthenticationHandlers() {
    for (const [key, value] of this.#callBackInterceptIdMap.entries()) {
      await this.#network.removeIntercept(value)
      await this.#network.removeCallback(key)
    }

    this.#callBackInterceptIdMap.clear()
  }
}

module.exports = Network
