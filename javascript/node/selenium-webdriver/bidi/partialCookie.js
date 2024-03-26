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

const { BytesValue } = require('./networkTypes')

class PartialCookie {
  #map = new Map()

  constructor(name, value, domain) {
    this.#map.set('name', name)
    if (!(value instanceof BytesValue)) {
      throw new Error(`Value must be an instance of BytesValue. Received:'${value}'`)
    }
    this.#map.set('value', Object.fromEntries(value.asMap()))
    this.#map.set('domain', domain)
  }

  path(path) {
    this.#map.set('path', path)
    return this
  }

  size(size) {
    this.#map.set('size', size)
    return this
  }

  httpOnly(httpOnly) {
    this.#map.set('httpOnly', httpOnly)
    return this
  }

  secure(secure) {
    this.#map.set('secure', secure)
    return this
  }

  sameSite(sameSite) {
    this.#map.set('sameSite', sameSite)
    return this
  }

  expiry(expiry) {
    this.#map.set('expiry', expiry)
    return this
  }

  asMap() {
    return this.#map
  }
}

module.exports = { PartialCookie }
