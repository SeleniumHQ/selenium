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
 * Represents geolocation coordinates with optional accuracy, altitude, heading, and speed.
 *
 * Example usage:
 *   const coords = new GeolocationCoordinates(37.7749, -122.4194)
 *     .accuracy(10)
 *     .altitude(30)
 *     .heading(90)
 *     .speed(5);
 *
 * Properties:
 *   - latitude: number (-90.0 to 90.0)
 *   - longitude: number (-180.0 to 180.0)
 *   - accuracy: number >= 0.0 (optional)
 *   - altitude: number or null (optional)
 *   - altitudeAccuracy: number >= 0.0 or null (optional)
 *   - heading: number 0.0 to 360.0 or null (optional)
 *   - speed: number >= 0.0 or null (optional)
 */
class GeolocationCoordinates {
  #map = new Map()

  /**
   * Constructs a GeolocationCoordinates instance.
   * @param {number} latitude - Latitude (-90.0 to 90.0).
   * @param {number} longitude - Longitude (-180.0 to 180.0).
   * @throws {Error} If latitude or longitude are out of bounds.
   */
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

  /**
   * Sets the accuracy in meters.
   * @param {number} value - Accuracy (>= 0.0).
   * @returns {GeolocationCoordinates} This instance.
   * @throws {Error} If value is invalid.
   */
  accuracy(value) {
    if (typeof value !== 'number' || value < 0.0) {
      throw new Error(`Accuracy must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('accuracy', value)
    return this
  }

  /**
   * Sets the altitude in meters.
   * @param {number|null} value - Altitude or null.
   * @returns {GeolocationCoordinates} This instance.
   * @throws {Error} If value is invalid.
   */
  altitude(value) {
    if (value !== null && typeof value !== 'number') {
      throw new Error(`Altitude must be a number. Received: '${value}'`)
    }
    this.#map.set('altitude', value)
    return this
  }

  /**
   * Sets the altitude accuracy in meters.
   * @param {number|null} value - Altitude accuracy (>= 0.0) or null.
   * @returns {GeolocationCoordinates} This instance.
   * @throws {Error} If value is invalid.
   */
  altitudeAccuracy(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0)) {
      throw new Error(`AltitudeAccuracy must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('altitudeAccuracy', value)
    return this
  }

  /**
   * Sets the heading in degrees.
   * @param {number|null} value - Heading (0.0 to 360.0) or null.
   * @returns {GeolocationCoordinates} This instance.
   * @throws {Error} If value is invalid.
   */
  heading(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0 || value > 360.0)) {
      throw new Error(`Heading must be a number between 0.0 and 360.0. Received: '${value}'`)
    }
    this.#map.set('heading', value)
    return this
  }

  /**
   * Sets the speed in meters per second.
   * @param {number|null} value - Speed (>= 0.0) or null.
   * @returns {GeolocationCoordinates} This instance.
   * @throws {Error} If value is invalid.
   */
  speed(value) {
    if (value !== null && (typeof value !== 'number' || value < 0.0)) {
      throw new Error(`Speed must be a number >= 0.0. Received: '${value}'`)
    }
    this.#map.set('speed', value)
    return this
  }

  /**
   * Returns the internal map of coordinate properties.
   * @returns {Map<string, number|null>} Map of properties.
   */
  asMap() {
    return this.#map
  }
}

module.exports = GeolocationCoordinates
