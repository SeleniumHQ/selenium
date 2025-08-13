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

const GeolocationCoordinates = require("./geolocationCoordinates");

const GeolocationPositionError = Object.freeze({
  type: 'positionUnavailable'
})

class Emulation {
  constructor(driver) {
    this._driver = driver
  }

  async init() {
    if (!(await this._driver.getCapabilities()).get('webSocketUrl')) {
      throw Error('WebDriver instance must support BiDi protocol')
    }

    this.bidi = await this._driver.getBidi()
  }

  async setGeolocationOverride(value, contexts= undefined, userContexts = undefined) {
    const map = new Map()

    if (value instanceof GeolocationCoordinates) {
      map.set('coordinates', Object.fromEntries(value.asMap()))
    } else if (value === GeolocationPositionError) {
      map.set('error', value)
    } else {
      throw new Error(
        'First argument must be a GeoCoordinates instance or GeolocationPositionError constant'
      )
    }

    if (contexts !== undefined  && typeof contexts === 'string') {
      contexts = [contexts]
    } else if (contexts !== undefined  && !Array.isArray(contexts)) {
      throw new Error('contexts must be a string or an array of strings')
    }

    map.set('contexts', contexts)

    if (userContexts !== undefined  && typeof userContexts === 'string') {
      userContexts = [userContexts]
    } else if (userContexts !== undefined && !Array.isArray(userContexts)) {
      throw new Error('userContexts must be a string or an array of strings')
    }

    map.set('userContexts', userContexts)

    const command = {
      method: 'emulation.setGeolocationOverride',
      params: Object.fromEntries(map)
    }

    const response = await this.bidi.send(command)

    if (response.type === 'error') {
      throw new Error(`${response.error}: ${response.message}`)
    }
  }
}

async function getEmulationInstance(driver) {
  let instance = new Emulation(driver)
  await instance.init()
  return instance
}

module.exports = { getEmulationInstance, GeolocationPositionError}
