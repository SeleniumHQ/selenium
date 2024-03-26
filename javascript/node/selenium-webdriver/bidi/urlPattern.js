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

class UrlPattern {
  #map = new Map()

  protocol(protocol) {
    this.#map.set('protocol', protocol)
    return this
  }

  hostname(hostname) {
    this.#map.set('hostname', hostname)
    return this
  }

  port(port) {
    if (typeof port === 'number') {
      this.#map.set('port', port.toString())
    } else {
      throw new Error(`Port must be a number. Received:'${port}'`)
    }
    return this
  }

  pathname(pathname) {
    this.#map.set('pathname', pathname)
    return this
  }

  search(search) {
    this.#map.set('search', search)
    return this
  }

  asMap() {
    this.#map.set('type', 'pattern')
    return this.#map
  }
}

module.exports = { UrlPattern }
