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

class GeolocationCoordinates {
  #map = new Map()

  constructor(latitude, longitude) {
    if (typeof latitude !== 'number' || latitude < -90.0 || latitude > 90.0) {
      throw new Error(`Latitude must be a number between -90.0 and 90.0. Received: '${latitude}'`)
    }
    this.#map.set('latitude', latitude)

    if (typeof longitude !== 'number' || longitude < -180.0 || longitude > 180.0) {
      throw new Error(`Longitude must be a number between -180.0 and 180.0. Received: '${longitude}'`)
    }
    this.#map.set('longitude', longitude)
  }

  accuracy(value) {
    if (typeof value !== 'number' || value < 0.0) {
      throw new Error(`Accuracy must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('accuracy', value)
    return this
  }

  altitude(value) {
    if (value !== null && typeof value !== 'number') {
      throw new Error(`Altitude must be a number. Received: '${value}'`)
    }
    this.#map.set('altitude', value)
    return this
  }

  altitudeAccuracy(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0)) {
      throw new Error(`AltitudeAccuracy must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('altitudeAccuracy', value)
    return this
  }

  heading(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0 || value > 360.0)) {
      throw new Error(`Heading must be a number between 0.0 and 360.0. Received: '${value}'`)
    }
    this.#map.set('heading', value)
    return this
  }

  speed(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0)) {
      throw new Error(`Speed must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('speed', value)
    return this
  }

  asMap() {
    return this.#map
  }
}

module.exports = GeolocationCoordinates
